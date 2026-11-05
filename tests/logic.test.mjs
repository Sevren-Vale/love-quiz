import test from 'node:test';
import assert from 'node:assert/strict';
import { questions } from '../js/questions.js';
import { calculate, personalities, letter } from '../js/results.js';
import { initial, transition, restore, persistence, key } from '../js/state.js';
import { effects } from '../js/effects.js';
import { art } from '../js/art.js';

test('15 ordered questions, 45 different implemented scenes, exact scoring map', () => {
  const symbols = {sweet:'S',playful:'T',romantic:'R',gentle:'W'};
  const expected = 'STR WST RTS SRT SRT SWT RSW SRW TWW TSR SWR RTW RTW RWW STW'.split(' ');
  const ids = [];
  questions.forEach((q,i) => {
    assert.equal(q.id,i+1);
    assert.ok(q.title.length > 8);
    assert.equal(q.options.length,3);
    assert.equal(q.options.map(o=>symbols[o.personality]).join(''),expected[i]);
    for (const o of q.options) {
      ids.push(o.effectId);
      assert.ok(o.text.length > 2 && !/TODO|占位/.test(o.text));
      const [caption, objects] = effects[o.effectId];
      assert.ok(caption && objects.length >= 1);
      for (const [name,size,frames] of objects) {
        assert.ok(art[name] && size>0);
        assert.equal(frames[0][0],0);
        assert.equal(frames.at(-1)[0],1);
        assert.ok(frames.every((frame,i)=>frame.every(Number.isFinite)&&(!i||frame[0]>=frames[i-1][0])));
      }
    }
  });
  assert.equal(ids.length,45);
  assert.deepEqual(Object.keys(effects).sort(),[...new Set(ids)].sort());
  assert.equal(new Set(Object.values(effects).map(([,objects])=>JSON.stringify(objects))).size,45);
  assert.equal(questions.flatMap(q=>q.options.filter(o=>o.memory)).length,9);
});

for (const type of Object.keys(personalities)) test('reachable and deterministic: '+type, () => {
  const answers = questions.map(q=>Math.max(0,q.options.findIndex(o=>o.personality===type)));
  const result = calculate(answers);
  assert.equal(result.type,type);
  assert.deepEqual(calculate(answers),result);
  assert.equal(Object.values(result.scores).reduce((a,b)=>a+b),15);
  assert.equal(result.memories.length,3);
});

test('tie resolution prioritizes Q15 and can walk back past Q14', () => {
  const last = [2,0,0,0,2,2,1,2,1,0,2,0,2,0,2];
  assert.deepEqual(calculate(last).scores,{sweet:2,playful:3,romantic:5,gentle:5});
  assert.equal(calculate(last).type,'gentle');
  const earlier = [0,1,1,0,1,2,1,2,1,1,2,0,0,0,1];
  const result = calculate(earlier);
  assert.equal(result.scores.sweet,result.scores.romantic);
  assert.equal(result.type,'romantic');
  const deep = [2,1,0,0,0,0,2,1,1,1,2,0,2,1,1];
  assert.deepEqual(calculate(deep).scores,{sweet:5,playful:1,romantic:5,gentle:4}); assert.equal(calculate(deep).type,'romantic');
});

test('incomplete and invalid choices cannot create a report', () => {
  assert.equal(calculate([]),null);
  for (const value of [null,'0',3,-1,1.5,undefined]) {
    const answers = Array(15).fill(0);
    answers[9] = value;
    assert.equal(calculate(answers),null);
  }
  assert.equal(letter.length,7);
});

test('one edit changes the winning personality in a tie', () => {
  const answers = [2,0,0,0,2,2,1,2,1,0,2,0,2,0,2];
  assert.equal(calculate(answers).type,'gentle');
  answers[14] = 0;
  assert.equal(calculate(answers).type,'romantic');
});

test('navigation, editing, refreshing and reset preserve only valid state', () => {
  let s = initial();
  const dispatch = (a,v) => { s = transition(s,a,v); };
  assert.equal(s.page,'welcome');
  dispatch('start'); dispatch('next');
  assert.equal(s.index,0);
  for (let i=0;i<15;i++) { dispatch('choose',0); dispatch('next'); }
  assert.equal(s.page,'analyzing');
  assert.equal(restore(JSON.stringify(s)).page,'result');
  dispatch('result'); dispatch('letter'); dispatch('open'); dispatch('finish');
  assert.deepEqual(restore(JSON.stringify(s)),s);
  dispatch('result'); dispatch('review'); dispatch('edit',7); dispatch('prev');
  assert.equal(s.index,6);
  dispatch('choose',2);
  assert.equal(s.answers[6],2);
  assert.equal(s.answers[7],0);
  assert.equal(s.completed,false);
  assert.equal(s.letterOpened,false);
  dispatch('result');
  assert.equal(s.page,'quiz');
  assert.deepEqual(restore(JSON.stringify(s)),s);
  dispatch('reset');
  assert.deepEqual(s,initial());
  for (const invalid of ['{',null,'{}',JSON.stringify({...s,version:2}),JSON.stringify({...s,page:'result'}),JSON.stringify({...s,answers:[0]}),JSON.stringify({...s,answers:[3,...s.answers.slice(1)]})]) assert.deepEqual(restore(invalid),initial());
});

test('localStorage success and denied access', () => {
  const map = new Map();
  const storage = persistence(()=>({getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)}));
  const s = transition(initial(),'start');
  storage.save(s);
  assert.ok(map.has(key));
  assert.deepEqual(storage.load(),s);
  let failures = 0;
  const denied = persistence(()=>{throw new Error('denied');},()=>failures++);
  assert.deepEqual(denied.load(),initial());
  denied.save(s);
  assert.equal(failures,2);
});
