import { config } from './config.js';
import { questions } from './questions.js';
import { calculate } from './results.js';
import { persistence, transition } from './state.js';
import { makePlayer, reducedMotion } from './effects.js';
import { render, updateChoices, restartDialog, shareDialog } from './ui.js';

const app = document.querySelector('#app');
const dialog = document.querySelector('#dialog');
const notice = document.querySelector('#notice');
const player = makePlayer();
const timers = new Set();
let noticeTimer;
let unavailable = false;
function say(message) {
  clearTimeout(noticeTimer);
  notice.textContent = message;
  noticeTimer = setTimeout(() => { notice.textContent = ''; }, 4500);
}
const disk = persistence(() => localStorage, () => {
  if (unavailable) return;
  unavailable = true;
  say('这次可以照常玩，刷新后可能需要重新填写 ♡');
});
let state = disk.load();
document.title = config.title;
document.body.classList.toggle('static-bg', !config.animateBackground);

function later(callback, ms) {
  const timer = setTimeout(() => { timers.delete(timer); callback(); }, ms);
  timers.add(timer);
}

function paint(focus = true) {
  player.stopEffect();
  for (const timer of timers) clearTimeout(timer);
  timers.clear();
  render(app,state);
  if (focus) {
    window.scrollTo(0,0);
    app.querySelector('h1').focus({preventScroll:true});
  }
  if (state.page === 'analyzing') {
    const status = app.querySelector('#analysis-status');
    if (!reducedMotion()) {
      later(() => { status.textContent = '正在整理你的恋爱小秘密……'; }, config.analysisMs / 3);
      later(() => { status.textContent = '发现一份特别可爱的结果！'; }, config.analysisMs * 2 / 3);
    }
    later(() => dispatch('result'), reducedMotion() ? 180 : config.analysisMs);
  }
}

function dispatch(action,value) {
  const next = transition(state,action,value);
  if (next === state) return;
  state = next;
  disk.save(state);
  if (action === 'choose') updateChoices(app,state);
  else paint();
}

async function share() {
  const result = calculate(state.answers);
  if (!result) return;
  const text = '我刚刚完成了《'+config.title+'》，我的恋爱人格是：'+result.name+' ♡';
  const url = new URL('./',location.href).href;
  const copy = text+'\n'+url;
  if (navigator.share) {
    try { await navigator.share({title:config.title,text,url}); return; }
    catch(error) { if (error.name === 'AbortError') return; }
  }
  try {
    await navigator.clipboard.writeText(copy);
    say('分享文案已复制 ♡');
  } catch {
    if (!dialog.open && state.page === 'result') shareDialog(dialog,copy);
  }
}

app.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const {action,value} = button.dataset;
  if (action === 'choose') {
    dispatch(action,Number(value));
    const option = questions[state.index].options[Number(value)];
    player.playEffect(option.effectId,button,app.querySelector('.stage'),app.querySelector('.caption'));
  } else if (action === 'restart') {
    restartDialog(dialog,() => dispatch('reset'));
  } else if (action === 'share') {
    void share();
  } else if (action === 'open' && !reducedMotion()) {
    if (button.classList.contains('opening')) return;
    button.classList.add('opening');
    button.setAttribute('aria-disabled','true');
    later(() => dispatch('open'),config.letterMs);
  } else if (action === 'start' && !reducedMotion()) {
    if (button.classList.contains('starting')) return;
    button.classList.add('starting');
    button.closest('.welcome-card').classList.add('leaving');
    later(() => dispatch('start'),200);
  } else {
    dispatch(action,value === undefined ? undefined : Number(value));
  }
});
paint(false);
