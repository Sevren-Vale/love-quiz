import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {setTimeout as wait} from 'node:timers/promises';
import {makeServer} from '../scripts/serve.mjs';

const executable = process.env.LOVEQUIZ_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

test('Chrome mobile: all 45 timelines, full flow, persistence, share fallback and viewport checks', {timeout:65000}, async t => {
  const profile = await mkdtemp(resolve('.chrome-test-'));
  const server = makeServer().listen(0,'127.0.0.1');
  await once(server,'listening');
  const url = 'http://127.0.0.1:'+server.address().port+'/love-quiz/';
  const chrome = spawn(executable,['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--disable-gpu','--no-first-run','--no-default-browser-check','about:blank'],{windowsHide:true});
  t.after(async () => {
    server.close();
    chrome.kill();
    await Promise.race([once(chrome,'exit'),wait(1800)]).catch(()=>{});
    await rm(profile,{force:true,recursive:true,maxRetries:8,retryDelay:200});
  });
  const wsUrl = await new Promise((resolve,reject) => {
    chrome.once('error',reject);
    chrome.once('exit',code=>reject(new Error('Chrome exited: '+code)));
    let output='';
    chrome.stderr.on('data', chunk => {
      output+=chunk;
      const m=output.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) resolve(m[1]);
    });
  });
  const targets = await (await fetch('http://'+new URL(wsUrl).host+'/json/list')).json();
  const ws = new WebSocket(targets.find(target=>target.type==='page').webSocketDebuggerUrl);
  await once(ws,'open');
  t.after(()=>ws.close());
  let sequence=0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message',event=>{
    const data=JSON.parse(event.data);
    if (data.method==='Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.text);
    if (data.method==='Network.responseReceived' && data.params.response.status>=400) errors.push(data.params.response.url);
    const callback=pending.get(data.id);
    if(callback){ pending.delete(data.id); callback(data); }
  });
  const send = (method,params={})=>new Promise((resolve,reject)=>{
    const id=++sequence;
    pending.set(id,reply=>reply.error?reject(new Error(reply.error.message)):resolve(reply.result));
    ws.send(JSON.stringify({id,method,params}));
  });
  const run = async expression=>{
    const answer=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(answer.exceptionDetails) throw new Error(answer.exceptionDetails.exception?.description || answer.exceptionDetails.text);
    return answer.result.value;
  };
  const until = async expression => {
    for(let i=0;i<100;i++){
      if(await run(expression)) return;
      await wait(45);
    }
    assert.fail('Condition timed out: '+expression);
  };
  const click = (action,value) => run('document.querySelector('+JSON.stringify('[data-action="'+action+'"]'+(value===undefined?'':'[data-value="'+value+'"]'))+').click()');
  const visible = cls => until('!!document.querySelector(".view.'+cls+'")');
  const width = async (value,height=844,mobile=true) => {
    await send('Emulation.setDeviceMetricsOverride',{width:value,height,deviceScaleFactor:1,mobile,screenWidth:value,screenHeight:height});
    assert.equal(await run('document.documentElement.scrollWidth <= innerWidth'),true,'overflow at '+value);
    assert.equal(await run('document.querySelector(".view").getBoundingClientRect().right <= innerWidth'),true);
  };
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Page.navigate',{url});
  await visible('welcome');
  await width(390);
  await run('document.querySelector("[data-action=start]").focus()');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await visible('quiz');
  assert.equal(await run('document.querySelector("[data-action=next]").disabled'),true);
  for(let i=1;i<=15;i++){
    if(i===8){
      await send('Page.reload');
      await until('document.querySelector("progress")?.value === 8');
      await click('prev');
      assert.equal(await run('document.querySelector("progress").value'),7);
      await click('next');
    }
    for(let j=0;j<3;j++){
      await click('choose',j);
      const id='Q'+String(i).padStart(2,'0')+'_'+'ABC'[j];
      assert.deepEqual(await run('[document.querySelector(".stage").dataset.effect, !!document.querySelector(".stage svg g"), document.querySelector(".stage").getAnimations({subtree:true}).length > 1, document.querySelectorAll(".option[aria-pressed=true]").length]'),[id,true,true,1]);
    }
    if(i===1) {
      await click('choose',2);
      await until('!document.querySelector(".stage").hasChildNodes() && !document.querySelector(".caption").textContent');
      for(const w of [320,360,375,390,414,430,768,1024]) await width(w,844,w<768);
      await width(390);
    }
    await click('next');
    assert.equal(await run('!!document.querySelector(".stage[data-effect]")'),false);
  }
  await visible('analyzing');
  await until('document.querySelector("#analysis-status")?.textContent.includes("整理")');
  await visible('result');
  assert.equal(await run('document.querySelectorAll(".memories li").length'),3);
  await run('Object.defineProperty(navigator,"share",{value:undefined}); Object.defineProperty(navigator,"clipboard",{value:undefined})');
  await click('share');
  await until('document.querySelector("dialog").open');
  assert.match(await run('document.querySelector("textarea").value'),/温柔守护者/);
  await run('document.querySelector("dialog").close()');
  await click('letter'); await click('open'); await visible('opened');
  assert.equal(await run('document.querySelectorAll(".letter-line").length'),7);
  await width(320,570);
  await run('window.scrollTo(0, document.body.scrollHeight)');
  assert.ok(await run('scrollY') > 0);
  await click('finish');
  await until('!!document.querySelector(".saved")');
  await send('Page.reload');
  await until('!!document.querySelector(".saved")');
  await click('result'); await click('review');
  assert.equal(await run('document.querySelectorAll(".answers li").length'),15);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await click('edit',14);
  await click('choose',0);
  assert.deepEqual(await run('[document.querySelector(".stage").dataset.effect,document.querySelector(".stage").getAnimations({subtree:true}).length]'),['Q15_A',0]);
  assert.equal(await run('document.querySelector("[data-action=result]").hidden'),true);
  await click('next'); await visible('result');
  await click('restart');
  await run('document.querySelector("[value=cancel]").click()');
  await visible('result');
  await click('restart');
  await run('document.querySelector("[value=reset]").click()');
  await visible('welcome');
  assert.equal(await run('JSON.parse(localStorage.getItem("lovequiz-state-v1")).answers.every(x=>x===null)'),true);
  assert.deepEqual(errors,[]);
});
