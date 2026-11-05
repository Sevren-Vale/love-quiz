// Original illustrations in a shared 100 × 80 coordinate space.
const path = (d, fill='none', stroke='#875169') => '<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
const rect = (x,y,w,h,f,r=5) => '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+f+'" stroke="#875169" stroke-width="1.5"/>';
const circle = (x,y,r,f) => '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"/>';
const label = (s,y=48) => '<text x="50" y="'+y+'" text-anchor="middle" font-size="10" fill="#713f53">'+s+'</text>';
const pink='#e999b1', pale='#f9d9e2', gold='#efba77', paper='#fff3dc', ink='#78465d';
const heart = (f=pink) => path('M50 68C35 58 13 45 13 28C13 9 38 5 50 24C62 5 87 9 87 28C87 45 65 58 50 68Z',f);
const eyes = circle(37,38,2.7,ink)+circle(63,38,2.7,ink);
const closed = path('M31 39q6 6 12 0m14 0q6 6 12 0');
const smile = path('M44 49q6 8 12 0');
const cat = path('M17 37L19 10L39 24Q50 20 61 24L81 10L83 37Q96 71 50 72Q4 71 17 37Z',paper);
const box = (f=pink) => rect(22,34,56,38,f)+rect(17,25,66,13,f)+path('M50 72V25Q27 23 31 12Q39 4 50 25Q61 4 69 12Q73 23 50 25');
const envelope = rect(12,20,76,49,paper)+path('M13 21L50 49L87 21M13 68L38 43M87 68L62 43');
const frame = rect(18,6,64,69,'#fffdf7')+rect(24,12,52,45,pale,2);
const hands = path('M7 48Q26 69 52 53L67 42Q72 37 65 35L52 41L57 31Q58 26 52 28L38 41Q22 49 7 35Z',paper);
export const art = {
  heart:heart(), lightHeart:heart(pale), smileHeart:heart()+closed+smile, winkHeart:heart()+circle(37,38,2.7,ink)+path('M57 40q6-6 12 0')+smile,
  star:path('M50 6Q54 34 83 40Q54 46 50 74Q46 46 17 40Q46 34 50 6Z',gold),
  flower:[0,60,120,180,240,300].map(a=>'<g transform="rotate('+a+' 50 40)">'+circle(50,23,13,pink)+'</g>').join('')+circle(50,40,10,gold),
  petal:path('M47 67Q16 45 47 13Q80 44 47 67Z',pale),
  moon:path('M67 9A32 32 0 1 0 84 58A31 31 0 0 1 67 9Z',gold),
  question:label('?',55).replace('font-size="10"','font-size="46"'),
  dots:circle(28,43,5,ink)+circle(50,43,5,ink)+circle(72,43,5,ink),
  face:circle(50,40,30,pale)+eyes+smile,
  pout:circle(50,40,30,pale)+eyes+path('M44 54q6-8 12 0'),
  arm:hands, armR:'<g transform="translate(100 0) scale(-1 1)">'+hands+'</g>',
  cat:cat+eyes+path('M44 48q6 7 12 0m-26 3l-13-3m53 3l13-3'),
  catHappy:cat+closed+smile,
  catSad:cat+eyes+path('M44 54q6-8 12 0m-27-19l12-5m18 0l12 5'),
  paw:circle(50,53,15,pink)+[29,43,57,71].map((x,i)=>circle(x,i===0||i===3?34:25,7,pink)).join(''),
  hand:path('M24 53L32 36L42 39L54 13Q58 8 62 14L56 36L65 24Q70 20 73 26L66 41L77 35Q83 35 80 42L65 67Q55 77 38 68Z',paper),
  sun:circle(50,40,27,gold), sunset:circle(50,40,27,pink),
  wave:path('M0 37Q12 24 25 37T50 37T75 37T100 37V70H0Z','#c6e3eb','#83adb9')+path('M0 49Q12 36 25 49T50 49T75 49T100 49','none','#f5fcff'),
  plate:circle(50,40,33,'#e6ccd7')+circle(50,40,26,'#fff8ed'),
  berry:path('M25 31Q50 15 75 31Q72 55 50 70Q28 55 25 31Z',pink)+path('M50 32L38 19L50 23L62 17Z','#9eb69a'),
  pastry:path('M12 52Q22 16 50 21Q78 16 88 52L70 63L57 54L43 54L30 63Z',gold)+path('M30 29L43 54M70 29L57 54'),
  drink:path('M28 28H72L66 70H34Z',pale)+path('M47 42L57 12H72'),
  lamp:path('M43 16H57L73 47H27Z',gold)+path('M50 47V67M34 69H66'),
  beam:'<path d="M34 18H66L99 79H1Z" fill="#ffdf97" opacity=".65"/>',
  trail:'<path d="M5 68Q52 69 92 12" fill="none" stroke="#c36d8c" stroke-width="2" stroke-dasharray="5 5"/>',
  plane:path('M8 32L93 12L62 69L44 49L34 60L35 44Z',paper)+path('M35 44L93 12L44 49'),
  ticket:path('M10 20H90V33Q75 40 90 47V62H10V47Q25 40 10 33Z',paper)+label('抱抱券 × ∞',45),
  invite:rect(7,18,86,48,paper)+label('今日行程：陪你',45),
  cert:rect(8,13,84,55,paper)+label('专属认证',36),
  stamp:circle(50,40,35,'#b4526b')+label('今日听话认证',44).replace('#713f53','#fff'),
  envelope, flap:path('M13 21L50 2L87 21Z',paper),
  sorry:rect(4,14,92,56,paper)+label('对不起，',36)+label('我会认真听你说。',51),
  bag:path('M20 27H80L87 72H13Z',paper)+path('M35 29Q33 5 50 7Q67 5 65 29'),
  snack:rect(8,21,84,40,pale)+label('专属投喂券',45),
  screen:rect(3,11,94,54,'#f5edf2'),
  curtain:path('M0 7H48Q38 42 44 71H0Z','#b86b87'),
  curtainR:path('M100 7H52Q62 42 56 71H100Z','#b86b87'),
  seats:rect(11,35,34,23,'#bd7893')+rect(55,35,34,23,'#bd7893'),
  dog:path('M26 26Q9 20 10 48Q12 64 29 51Q50 76 71 51Q88 64 90 48Q91 20 74 26Q50 11 26 26Z',paper)+eyes+circle(50,46,5,ink)+smile,
  tail:path('M40 64Q77 60 82 34','none','#bd8765').replace('stroke-width="2"','stroke-width="8"'),
  wrap:path('M2 20L39 34V52L2 65Z',pale), wrapR:path('M98 20L61 34V52L98 65Z',pale),
  candy:circle(50,43,23,pink)+path('M39 28q24-2 22 16q-5 13-17 7q-6-7 3-11'),
  trophy:path('M31 14H69V37Q69 51 50 56Q31 51 31 37Z',gold)+path('M31 22H17Q17 44 33 43M69 22H83Q83 44 67 43M50 55V70M34 72H66'),
  stand:path('M50 17V68M27 70H73'), scale:path('M10 25H90M20 25L9 52H31ZM80 25L69 52H91Z'),
  crack:path('M53 17L45 35L56 41L47 62','none','#fff8f6'),
  chat:path('M17 20H83V55H56L42 67V55H17Z',paper)+label('···',43),
  halo:circle(50,40,35,'#efadc2'),
  pulse:path('M0 45H28L37 35L45 57L55 16L64 53L72 45H100','none','#bd567b'),
  flat:path('M0 45H100','none','#bd567b'),
  person:circle(50,22,13,pink)+path('M25 70Q26 40 50 40Q74 40 75 70Z',pale),
  clock:circle(50,40,33,'#f2dce5')+circle(50,40,28,'#fff8ee')+circle(50,40,3,ink),
  handClock:path('M50 23V40L64 44'),
  gift:box(), giftCream:box(paper),
  ribbon:path('M50 74Q75 50 45 39Q22 31 48 10','none','#ba6180'),
  camera:rect(12,17,76,51,pink)+circle(50,42,16,ink)+circle(50,42,10,'#f7d8e1')+rect(67,24,12,8,paper),
  photo:frame+'<g transform="translate(19 13) scale(.62)">'+heart()+'</g>',
  suitcase:rect(15,28,70,44,'#d6a381')+path('M35 29V17H65V29M30 32V68M70 32V68'),
  lid:rect(15,17,70,25,'#f1ccae'),
  city:[0,21,40,61,82].map((x,i)=>rect(x,22+i%3*10,18,53-i%3*10,'#a989a4',2)).join(''),
  windows:[5,26,45,66,87].map((x,i)=>'<rect x="'+x+'" y="'+(29+i%3*10)+'" width="7" height="8" fill="#ffd995"/>').join(''),
  lightLine:path('M1 58Q25 67 50 33Q75 67 99 58','none','#f4aa78'),
  train:'<rect x="3" y="9" width="94" height="62" rx="15" fill="none" stroke="#875169" stroke-width="9"/>',
  hills:path('M0 64Q15 25 38 56Q65 16 100 60V76H0Z','#b3c3a4'),
  cloud:circle(39,41,13,'#fff7ef')+circle(51,35,17,'#fff7ef')+circle(64,44,12,'#fff7ef'),
  calendar:rect(19,12,62,61,paper)+rect(19,12,62,17,pink)+path('M35 7V20M65 7V20'),
  date1:label('01',54),date2:label('12',54),date3:label('28',54),
  note:label('喜欢你',49).replace('font-size="10"','font-size="17"'),
};
