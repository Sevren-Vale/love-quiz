import { questions } from './questions.js';

export const personalities = {
  sweet: {name:'黏人小甜心', description:'你喜欢直接表达喜欢，也喜欢拥抱和陪伴。对你来说，最好的浪漫也许就是想见的人就在身边。', words:['拥抱','陪伴','偏爱'], mark:'♡'},
  playful: {name:'傲娇捣蛋鬼', description:'你喜欢用玩笑藏起一点点害羞。表面调皮，实际上却很在意那些让你心动的小细节。', words:['调皮','惊喜','偷偷喜欢'], mark:'✦'},
  romantic: {name:'浪漫幻想家', description:'你喜欢惊喜、仪式感和电影般的瞬间。你期待把生活里平凡的日子，过成闪闪发光的回忆。', words:['远方','惊喜','仪式感'], mark:'☾'},
  gentle: {name:'温柔守护者', description:'你珍惜陪伴，重视理解，也认真对待日常生活中的幸福。你向往的爱，是可以长久安心地依靠。', words:['理解','安心','长久'], mark:'❀'},
};

export function calculate(answers) {
  if (!Array.isArray(answers) || answers.length !== questions.length) return null;
  const picks = questions.map((question, i) => Number.isInteger(answers[i]) ? question.options[answers[i]] : null);
  if (picks.some(pick => !pick)) return null;
  const scores = Object.fromEntries(Object.keys(personalities).map(key => [key, 0]));
  for (const pick of picks) scores[pick.personality]++;
  const max = Math.max(...Object.values(scores));
  const type = picks.slice().reverse().find(pick => scores[pick.personality] === max).personality;
  return {type, scores, ...personalities[type], memories:picks.flatMap(pick => pick.memory ? [pick.memory] : [])};
}

export const letter = [
  '其实，这15道题没有什么标准答案。',
  '我只是想知道，你喜欢怎样的约会，期待怎样的惊喜，想要怎样被拥抱，又会因为什么样的小事偷偷开心。',
  '因为喜欢你，所以连这些细小的事情，我都想认真了解。',
  '如果未来有很多很多个平凡的日子，我希望我们能一起把它们变得有趣。',
  '最后，还有一道不用回答的题：',
  '如果未来很长很长，你愿不愿意继续和我一起走下去？',
  '反正，我的答案一直是你。',
];
