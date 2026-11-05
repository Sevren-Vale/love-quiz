import { questions } from './questions.js';
import { calculate } from './results.js';

export const key = 'lovequiz-state-v1';
const count = questions.length;
const reportPages = ['analyzing','result','letter','finish','review'];
export const initial = () => ({version:1, page:'welcome', index:0, answers:Array(count).fill(null), completed:false, letterOpened:false});

export function restore(raw) {
  try {
    const s = JSON.parse(raw);
    if (s?.version !== 1 || !Array.isArray(s.answers) || s.answers.length !== count ||
        !s.answers.every(a => a === null || (Number.isInteger(a) && a >= 0 && a < 3)) ||
        !Number.isInteger(s.index) || s.index < 0 || s.index >= count ||
        !['welcome','quiz',...reportPages].includes(s.page) ||
        typeof s.completed !== 'boolean' || typeof s.letterOpened !== 'boolean' ||
        (s.completed && !calculate(s.answers)) || (reportPages.includes(s.page) && !s.completed) ||
        (s.letterOpened && !s.completed) || (s.page === 'finish' && !s.letterOpened)) return initial();
    const firstBlank = s.answers.indexOf(null);
    return {version:1, page:s.page === 'analyzing' ? 'result' : s.page,
      index:firstBlank < 0 ? s.index : Math.min(s.index, firstBlank),
      answers:s.answers, completed:s.completed, letterOpened:s.letterOpened};
  } catch { return initial(); }
}

export function transition(s, action, value) {
  switch(action) {
    case 'start': return s.page === 'welcome' ? {...s,page:'quiz'} : s;
    case 'home': return s.page === 'quiz' ? {...s,page:'welcome'} : s;
    case 'choose': {
      if (s.page !== 'quiz' || !questions[s.index].options[value] || !Number.isInteger(value) || s.answers[s.index] === value) return s;
      const answers = [...s.answers];
      answers[s.index] = value;
      return {...s,answers,completed:false,letterOpened:false};
    }
    case 'prev': return s.page === 'quiz' && s.index > 0 ? {...s,index:s.index-1} : s;
    case 'next':
      if (s.page !== 'quiz' || s.answers[s.index] === null) return s;
      if (s.index < count-1) return {...s,index:s.index+1};
      return calculate(s.answers) ? {...s,page:'analyzing',completed:true} : s;
    case 'result': return s.completed && (reportPages.includes(s.page) || s.page === 'quiz') ? {...s,page:'result'} : s;
    case 'review': return s.page === 'result' ? {...s,page:'review'} : s;
    case 'edit': return s.page === 'review' && Number.isInteger(value) && value >= 0 && value < count ? {...s,page:'quiz',index:value} : s;
    case 'letter': return s.page === 'result' ? {...s,page:'letter'} : s;
    case 'open': return s.page === 'letter' ? {...s,letterOpened:true} : s;
    case 'finish': return s.page === 'letter' && s.letterOpened ? {...s,page:'finish'} : s;
    case 'reset': return initial();
    default: return s;
  }
}

export function persistence(storage, onFailure = () => {}) {
  return {
    load() { try { return restore(storage().getItem(key)); } catch { onFailure(); return initial(); } },
    save(state) { try { storage().setItem(key, JSON.stringify(state)); } catch { onFailure(); } },
  };
}
