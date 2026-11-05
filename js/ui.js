import { config } from './config.js';
import { questions } from './questions.js';
import { calculate, letter } from './results.js';
import { illustration } from './effects.js';

const html = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn = (action, label, classes='', attrs='') => '<button type="button" class="btn '+classes+'" data-action="'+action+'" '+attrs+'>'+html(label)+'</button>';
const title = text => '<h1 tabindex="-1">'+html(text)+'</h1>';
const tag = text => '<p class="eyebrow">'+html(text)+'</p>';
const top = (action,label,text) => '<div class="page-top">'+btn(action,label,'text-btn')+tag(text)+'</div>';
const number = n => String(n).padStart(2,'0');
const section = (name,body) => '<section class="view '+name+'" aria-labelledby="screen-title">'+body+'</section>';
const reset = () => btn('restart','重新测试','text-btn');
const advice = chosen => chosen ? '跟着心里的第一反应就好 ♡' : '先偷偷选一个答案吧 ♡';

export function updateChoices(app, state) {
  const chosen = state.answers[state.index];
  app.querySelectorAll('[data-action=choose]').forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.value) === chosen)));
  app.querySelector('[data-action=next]').disabled = chosen === null;
  app.querySelector('.advice').textContent = advice(chosen !== null);
  const report = app.querySelector('[data-action=result]');
  if (report) report.hidden = !state.completed;
}

function quiz(s) {
  const q = questions[s.index];
  const progress = number(q.id)+' / '+questions.length;
  return section('quiz',top('home','‹ 首页','CHAPTER '+progress)+
    '<div class="progress-row"><progress aria-label="答题进度" value="'+q.id+'" max="'+questions.length+'">'+progress+'</progress><span aria-hidden="true">'+progress+'</span></div>'+
    '<div class="card question-card">'+tag('QUESTION '+number(q.id)+'  ·  '+q.theme)+title(q.title)+
    '<div class="stage-wrap"><div class="stage" aria-hidden="true"></div><p class="caption" role="status"></p><span class="stage-default" aria-hidden="true">✧　♡　✧</span></div>'+
    '<div class="options" role="group" aria-labelledby="screen-title">'+q.options.map((option,i)=>
      '<button type="button" class="option" data-action="choose" data-value="'+i+'" aria-pressed="'+(s.answers[s.index]===i)+'"><span class="option-id">'+option.id+'</span><span>'+html(option.text)+'</span><span class="option-mark" aria-hidden="true"></span></button>').join('')+'</div>'+
    '<div class="quiz-actions">'+btn('prev','‹ 上一题','secondary',s.index===0?'disabled':'')+btn('next',q.id===questions.length?config.generate:'下一题 →','primary',s.answers[s.index]===null?'disabled':'')+'</div>'+
    '<p class="advice">'+advice(s.answers[s.index]!==null)+'</p>'+btn('result','返回报告','text-btn',s.completed?'':'hidden')+'</div>');
}

function report(s) {
  const r = calculate(s.answers);
  const motifs = {sweet:['lightHeart','smileHeart'],playful:['star','winkHeart'],romantic:['moon','heart'],gentle:['flower','lightHeart']};
  return section('result', '<div class="screen-intro">'+tag('THE LOVE REPORT')+title('你的专属恋爱报告')+'<p>原来你的心动秘密，是这样的。</p></div>'+
    '<div class="card report-card"><div class="motif">'+motifs[r.type].map(name=>illustration(name)).join('')+'</div>'+
    '<h2>你是：'+html(r.name)+' ♡</h2><p class="description">'+html(r.description)+'</p><p class="keywords">你的心动关键词：'+html(r.words.join('、'))+'。</p>'+
    '<div class="memories"><h3>关于你，我偷偷记下了这些。</h3><ul>'+r.memories.map(text=>'<li>'+html(text)+'</li>').join('')+'</ul></div></div>'+
    '<div class="report-actions">'+btn('letter',config.openLetter+' ✉','primary')+'<div class="two">'+btn('review','回顾我的答案','secondary')+btn('share','分享我的结果','secondary')+'</div>'+reset()+'</div>');
}

function review(s) {
  return section('review',top('result','‹ 返回报告','ANSWER NOTES')+title('回顾我的答案')+
    '<ol class="answers">'+questions.map((q,i)=>s.answers[i]===null?'':'<li class="card"><div>'+tag('NO. '+number(q.id))+'<h2>'+html(q.title)+'</h2><p>♡ '+html(q.options[s.answers[i]].text)+'</p></div>'+
    btn('edit','修改答案','text-btn','data-value="'+i+'" aria-label="修改第'+q.id+'题答案"')+'</li>').join('')+'</ol>'+btn('result','返回报告','secondary'));
}

function letterPage(s) {
  const finished = s.page === 'finish';
  if (s.letterOpened) {
    return section('letter opened',top('result','‹ 返回报告','A LETTER FOR YOU')+'<article class="paper card">'+tag('PRIVATE CORRESPONDENCE')+title(config.letterTitle)+
      letter.map(text=>'<p class="letter-line">'+html(text)+'</p>').join('')+
      '<p class="signature">'+html(config.signature)+'</p></article><div class="letter-end"><p>我们的故事，还没有写完。</p>'+
      '<div class="keepsake">'+illustration('heart','heartbeat')+(finished?'<span aria-hidden="true">♡ ✧ ♡</span>':'')+'</div>'+
      (finished?'<p class="saved" role="status">已经偷偷收藏好啦 ♡</p>':btn('finish',config.finish,'secondary'))+
      '<div class="two">'+btn('result','返回报告','text-btn')+reset()+'</div></div>');
  }
  return section('letter sealed',top('result','‹ 返回报告','SEALED WITH LOVE')+'<div class="screen-intro">'+title('测试已经结束了。')+
    '<p>但我还有一些话，想亲自告诉你。</p></div>'+
    '<button type="button" class="envelope" data-action="open" aria-label="轻轻点一下，打开这封信"><span class="envelope-paper" aria-hidden="true">FOR YOU ♡</span><span class="envelope-pocket" aria-hidden="true"></span><span class="envelope-flap" aria-hidden="true"></span><span class="wax" aria-hidden="true">♥</span></button>'+
    '<p>轻轻点一下，打开这封信。</p>');
}

export function render(app,s) {
  const pages = {
    welcome: () => section('welcome','<div class="card welcome-card"><div class="cover-stamp heartbeat">'+illustration('heart')+'<span aria-hidden="true">✧</span></div>'+
      tag('A LITTLE LOVE QUIZ  /  01')+title(config.title)+'<p class="subtitle">“'+html(config.subtitle)+'”</p>'+
      '<div class="divider" aria-hidden="true">✧</div><p class="welcome-copy">没有标准答案，也不用偷偷查攻略。<br>只需要按照心里的第一反应选择就好。</p>'+
      '<p class="duration">共15道题 · 大约3～5分钟</p>'+btn('start',s.answers.some(x=>x!==null)?'继续心动测试 ♡':config.start,'primary')+'</div>'),
    quiz: () => quiz(s),
    analyzing: () => section('analyzing','<div class="card analyzing-card"><div class="orbit" aria-hidden="true"><i></i><i></i></div>'+
      illustration('heart','heartbeat')+tag('COLLECTING LITTLE MOMENTS')+title('15道题已经完成啦。')+
      '<p id="analysis-status" role="status">正在收集你的心动瞬间……</p><small>一段送给你的心动过场 ♡</small></div>'),
    result: () => report(s), review: () => review(s), letter: () => letterPage(s), finish: () => letterPage(s),
  };
  app.innerHTML = pages[s.page]();
  app.querySelector('h1').id = 'screen-title';
}

export function restartDialog(dialog, onReset) {
  dialog.innerHTML = '<form method="dialog"><h2 id="dialog-title">真的要重新开始吗？</h2><p>刚刚的答案会重新填写哦。</p><div class="two"><button class="btn secondary" value="cancel" autofocus>再想想</button><button class="btn primary" value="reset">重新开始</button></div></form>';
  dialog.returnValue = '';
  dialog.addEventListener('close', () => { if (dialog.returnValue === 'reset') onReset(); }, {once:true});
  dialog.showModal();
}

export function shareDialog(dialog, text) {
  dialog.innerHTML = '<form method="dialog"><h2 id="dialog-title">复制我的恋爱结果</h2><label for="share-copy">长按或选中文本复制</label><textarea id="share-copy" readonly rows="5"></textarea><button class="btn secondary">关闭</button></form>';
  const field = dialog.querySelector('textarea');
  field.value = text;
  dialog.showModal();
  field.focus();
  field.select();
}
