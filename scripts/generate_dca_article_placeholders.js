const fs = require('fs');
const path = require('path');

const W = 1200;
const H = 675;
const FONT = "Arial, 'Noto Sans KR', sans-serif";

const entries = [
  {
    outputPath: 'public/images/posts/how-much-monthly-invest-for-100m/cover.svg',
    lang: 'ko',
    kind: 'targetCover',
    title: '1억원 목표',
    subtitle: '월 납입금 계산',
    note: 'KO target amount cover'
  },
  {
    outputPath: 'public/images/posts/how-much-monthly-invest-for-100m/img1.svg',
    lang: 'ko',
    kind: 'timeCards',
    title: '기간별 월 납입금',
    subtitle: '5년 · 10년 · 15년 · 20년',
    note: 'KO monthly contribution by period'
  },
  {
    outputPath: 'public/images/posts/how-much-monthly-invest-for-100m/img2.svg',
    lang: 'ko',
    kind: 'gauge',
    title: '목표 달성률',
    subtitle: '현재 납입금 점검',
    note: 'KO target progress gauge'
  },
  {
    outputPath: 'public/images/posts/how-much-monthly-invest-for-100m/img3.svg',
    lang: 'ko',
    kind: 'levers',
    title: '목표 조정 방법',
    subtitle: '기간 · 수익률 · 납입금',
    note: 'KO target adjustment levers'
  },
  {
    outputPath: 'public/images/posts/how-much-to-invest-monthly-for-target-portfolio/cover.svg',
    lang: 'en',
    kind: 'targetCover',
    title: 'Target Portfolio',
    subtitle: 'Monthly plan',
    note: 'EN target portfolio cover'
  },
  {
    outputPath: 'public/images/posts/how-much-to-invest-monthly-for-target-portfolio/img1.svg',
    lang: 'en',
    kind: 'timeCards',
    title: 'Monthly Need',
    subtitle: 'Compare time horizons',
    note: 'EN monthly need by horizon'
  },
  {
    outputPath: 'public/images/posts/how-much-to-invest-monthly-for-target-portfolio/img2.svg',
    lang: 'en',
    kind: 'gauge',
    title: 'Goal Progress',
    subtitle: 'Track the gap',
    note: 'EN goal progress gauge'
  },
  {
    outputPath: 'public/images/posts/how-much-to-invest-monthly-for-target-portfolio/img3.svg',
    lang: 'en',
    kind: 'levers',
    title: 'Three Levers',
    subtitle: 'Time · return · contribution',
    note: 'EN target planning levers'
  },
  {
    outputPath: 'public/images/posts/dca-vs-lump-sum-when-results-differ/cover.svg',
    lang: 'ko',
    kind: 'scale',
    title: 'DCA vs 일괄투자',
    subtitle: '같은 원금, 다른 시점',
    note: 'KO DCA versus lump sum cover'
  },
  {
    outputPath: 'public/images/posts/dca-vs-lump-sum-when-results-differ/img1.svg',
    lang: 'ko',
    kind: 'marketPaths',
    title: '시장별 차이',
    subtitle: '상승 · 하락 · 횡보',
    note: 'KO market path comparison'
  },
  {
    outputPath: 'public/images/posts/dca-vs-lump-sum-when-results-differ/img2.svg',
    lang: 'ko',
    kind: 'compareTable',
    title: '핵심 비교',
    subtitle: '시점 · 단가 · 부담',
    note: 'KO key differences table'
  },
  {
    outputPath: 'public/images/posts/dca-vs-lump-sum-when-results-differ/img3.svg',
    lang: 'ko',
    kind: 'outcome',
    title: '결과 비교',
    subtitle: 'DCA 라인과 일괄투자 라인',
    note: 'KO outcome comparison'
  },
  {
    outputPath: 'public/images/posts/dca-vs-lump-sum-when-results-differ/cover-en.svg',
    lang: 'en',
    kind: 'scale',
    title: 'DCA vs Lump Sum',
    subtitle: 'Same principal, different timing',
    note: 'EN DCA versus lump sum cover'
  },
  {
    outputPath: 'public/images/posts/dca-vs-lump-sum-when-results-differ/img1-en.svg',
    lang: 'en',
    kind: 'marketPaths',
    title: 'Market Paths',
    subtitle: 'Rising · falling · sideways',
    note: 'EN market path comparison'
  },
  {
    outputPath: 'public/images/posts/dca-vs-lump-sum-when-results-differ/img2-en.svg',
    lang: 'en',
    kind: 'compareTable',
    title: 'Key Differences',
    subtitle: 'Timing · cost · behavior',
    note: 'EN key differences table'
  },
  {
    outputPath: 'public/images/posts/dca-vs-lump-sum-when-results-differ/img3-en.svg',
    lang: 'en',
    kind: 'outcome',
    title: 'Outcome Gap',
    subtitle: 'DCA line and lump sum line',
    note: 'EN outcome comparison'
  },
  {
    outputPath: 'public/images/posts/is-dca-better-in-bear-market/cover.svg',
    lang: 'ko',
    kind: 'bearCover',
    title: '하락장 DCA',
    subtitle: '가격 충격 시나리오',
    note: 'KO bear market DCA cover'
  },
  {
    outputPath: 'public/images/posts/is-dca-better-in-bear-market/img1.svg',
    lang: 'ko',
    kind: 'scenarios',
    title: '4가지 시나리오',
    subtitle: '기본 · 초반 · 중간 · 마지막',
    note: 'KO four drawdown scenarios'
  },
  {
    outputPath: 'public/images/posts/is-dca-better-in-bear-market/img2.svg',
    lang: 'ko',
    kind: 'avgCost',
    title: '평균단가 효과',
    subtitle: '낮은 가격 구간의 수량',
    note: 'KO average cost concept'
  },
  {
    outputPath: 'public/images/posts/is-dca-better-in-bear-market/img3.svg',
    lang: 'ko',
    kind: 'mddFinal',
    title: 'MDD와 최종자산',
    subtitle: '낙폭과 결과를 함께 보기',
    note: 'KO MDD and final value'
  },
  {
    outputPath: 'public/images/posts/is-dca-better-in-a-bear-market/cover.svg',
    lang: 'en',
    kind: 'bearCover',
    title: 'Bear Market DCA',
    subtitle: 'Simple drawdown scenario',
    note: 'EN bear market DCA cover'
  },
  {
    outputPath: 'public/images/posts/is-dca-better-in-a-bear-market/img1.svg',
    lang: 'en',
    kind: 'scenarios',
    title: '4 Scenarios',
    subtitle: 'Base · early · mid · final',
    note: 'EN four drawdown scenarios'
  },
  {
    outputPath: 'public/images/posts/is-dca-better-in-a-bear-market/img2.svg',
    lang: 'en',
    kind: 'avgCost',
    title: 'Average Cost',
    subtitle: 'More units at lower prices',
    note: 'EN average cost concept'
  },
  {
    outputPath: 'public/images/posts/is-dca-better-in-a-bear-market/img3.svg',
    lang: 'en',
    kind: 'mddFinal',
    title: 'MDD & Final Value',
    subtitle: 'Drawdown and result',
    note: 'EN MDD and final value'
  }
];

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function text(x, y, content, size, weight = 700, fill = '#123047', anchor = 'start') {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(content)}</text>`;
}

function pill(x, y, label, fill = '#e8f3ff', stroke = '#bcd8f6') {
  return `<rect x="${x}" y="${y}" width="210" height="48" rx="24" fill="${fill}" stroke="${stroke}" />
${text(x + 105, y + 31, label, 20, 700, '#1d4f73', 'middle')}`;
}

function coin(x, y, r, fill = '#f8c95b') {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#d9a332" stroke-width="5" />
<circle cx="${x}" cy="${y}" r="${Math.round(r * 0.62)}" fill="none" stroke="#ffe5a0" stroke-width="4" />`;
}

function chartCard(x, y, w, h, title, pathD, color) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="#ffffff" stroke="#dce8f2" />
${text(x + 28, y + 44, title, 24, 700, '#123047')}
<line x1="${x + 32}" y1="${y + h - 38}" x2="${x + w - 28}" y2="${y + h - 38}" stroke="#d9e6ef" stroke-width="4" />
<path d="${pathD}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />`;
}

function targetCoverVisual() {
  return `
<g transform="translate(112,150)">
  <circle cx="205" cy="205" r="150" fill="#f3fbff" stroke="#bddbf4" stroke-width="14" />
  <circle cx="205" cy="205" r="105" fill="#ffffff" stroke="#77b6ea" stroke-width="12" />
  <circle cx="205" cy="205" r="62" fill="#e8f8f1" stroke="#44b987" stroke-width="10" />
  <circle cx="205" cy="205" r="25" fill="#f8c95b" />
  <path d="M205 205 L340 88" stroke="#123047" stroke-width="10" stroke-linecap="round" />
  <path d="M340 88 l-5 42 l42 -8 z" fill="#123047" />
</g>
<g transform="translate(665,190)">
  <rect x="0" y="230" width="70" height="110" rx="14" fill="#84c5f4" />
  <rect x="96" y="170" width="70" height="170" rx="14" fill="#67c7a5" />
  <rect x="192" y="105" width="70" height="235" rx="14" fill="#f8c95b" />
  <rect x="288" y="45" width="70" height="295" rx="14" fill="#f39c7b" />
  <path d="M20 210 C110 185 150 120 230 88 C280 66 320 56 380 34" fill="none" stroke="#123047" stroke-width="8" stroke-linecap="round" />
  ${coin(420, 290, 36)}
  ${coin(470, 250, 29, '#ffd879')}
  ${coin(500, 305, 32)}
</g>`;
}

function timeCardsVisual(lang) {
  const labels = lang === 'ko' ? ['5년', '10년', '15년', '20년'] : ['5Y', '10Y', '15Y', '20Y'];
  const heights = [210, 165, 120, 82];
  return labels.map((label, i) => {
    const x = 145 + i * 230;
    const y = 245;
    const h = heights[i];
    return `<rect x="${x}" y="${y}" width="180" height="260" rx="24" fill="#ffffff" stroke="#dce8f2" />
${text(x + 90, y + 56, label, 34, 800, '#123047', 'middle')}
<rect x="${x + 62}" y="${y + 205 - h / 2}" width="56" height="${h}" rx="16" fill="${['#f39c7b', '#f8c95b', '#67c7a5', '#84c5f4'][i]}" />
<line x1="${x + 40}" y1="${y + 220}" x2="${x + 140}" y2="${y + 220}" stroke="#d9e6ef" stroke-width="4" />
${text(x + 90, y + 245, lang === 'ko' ? '월 납입' : 'monthly', 18, 700, '#507089', 'middle')}`;
  }).join('\n');
}

function gaugeVisual(lang) {
  const left = lang === 'ko' ? '현재 계획' : 'Current plan';
  const right = lang === 'ko' ? '필요 납입금' : 'Needed amount';
  return `
<g transform="translate(245,150)">
  <circle cx="250" cy="250" r="170" fill="#ffffff" stroke="#dce8f2" stroke-width="3" />
  <circle cx="250" cy="250" r="130" fill="none" stroke="#e8eef4" stroke-width="34" />
  <path d="M137 314 A130 130 0 1 1 363 314" fill="none" stroke="#67c7a5" stroke-width="34" stroke-linecap="round" />
  <circle cx="250" cy="250" r="72" fill="#f3fbff" />
  ${text(250, 245, '78%', 54, 800, '#123047', 'middle')}
  ${text(250, 283, lang === 'ko' ? '달성률' : 'progress', 22, 700, '#507089', 'middle')}
</g>
<g transform="translate(680,230)">
  ${pill(0, 0, left, '#edf8f3', '#bde4d3')}
  <rect x="12" y="88" width="360" height="34" rx="17" fill="#e7eef5" />
  <rect x="12" y="88" width="238" height="34" rx="17" fill="#67c7a5" />
  ${pill(0, 170, right, '#fff6dc', '#f2d78a')}
  <rect x="12" y="258" width="360" height="34" rx="17" fill="#e7eef5" />
  <rect x="12" y="258" width="310" height="34" rx="17" fill="#f8c95b" />
</g>`;
}

function leversVisual(lang) {
  const labels = lang === 'ko'
    ? [['기간', '늘리기'], ['수익률', '가정'], ['월 납입금', '조정']]
    : [['Time', 'horizon'], ['Return', 'assumption'], ['Contribution', 'amount']];
  const icons = ['M80 40 L80 165 M40 85 L80 40 L120 85', 'M32 140 C78 70 118 105 166 42', 'M45 70 L165 70 M45 115 L165 115 M45 160 L165 160'];
  return labels.map((pair, i) => {
    const x = 158 + i * 300;
    return `<rect x="${x}" y="205" width="250" height="270" rx="28" fill="#ffffff" stroke="#dce8f2" />
<circle cx="${x + 125}" cy="310" r="68" fill="${['#e8f3ff', '#e8f8f1', '#fff6dc'][i]}" />
<path d="${icons[i]}" transform="translate(${x + 20},235)" fill="none" stroke="${['#4f9ee3', '#44b987', '#d9a332'][i]}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
${text(x + 125, 415, pair[0], 30, 800, '#123047', 'middle')}
${text(x + 125, 450, pair[1], 24, 700, '#507089', 'middle')}`;
  }).join('\n');
}

function scaleVisual() {
  return `
<g transform="translate(230,175)">
  <line x1="370" y1="30" x2="370" y2="350" stroke="#123047" stroke-width="12" stroke-linecap="round" />
  <line x1="160" y1="95" x2="580" y2="95" stroke="#123047" stroke-width="12" stroke-linecap="round" />
  <circle cx="370" cy="95" r="24" fill="#f8c95b" stroke="#123047" stroke-width="8" />
  <path d="M160 95 L85 250 L235 250 Z" fill="#e8f3ff" stroke="#77b6ea" stroke-width="7" />
  <path d="M580 95 L505 250 L655 250 Z" fill="#fff6dc" stroke="#d9a332" stroke-width="7" />
  ${coin(118, 218, 22)}${coin(160, 195, 20, '#ffd879')}${coin(202, 222, 22)}
  <rect x="530" y="198" width="102" height="48" rx="10" fill="#67c7a5" />
  <rect x="546" y="182" width="102" height="48" rx="10" fill="#84c5f4" />
  <rect x="562" y="166" width="102" height="48" rx="10" fill="#f39c7b" />
  <rect x="265" y="350" width="210" height="34" rx="17" fill="#123047" />
</g>`;
}

function marketPathsVisual(lang) {
  const labels = lang === 'ko' ? ['상승장', '하락장', '횡보장'] : ['Rising', 'Falling', 'Sideways'];
  const paths = [
    'M30 150 C95 130 125 94 178 70 C218 52 242 40 290 32',
    'M30 45 C90 65 120 98 170 112 C218 128 250 152 290 170',
    'M30 110 C86 70 120 145 176 104 C220 72 240 138 290 100'
  ];
  const colors = ['#44b987', '#f39c7b', '#4f9ee3'];
  return labels.map((label, i) => chartCard(95 + i * 365, 230, 310, 235, label, paths[i], colors[i])).join('\n');
}

function compareTableVisual(lang) {
  const rows = lang === 'ko'
    ? [['투자 시점', '분산', '초기'], ['평균단가', '경로 영향', '초기 가격'], ['심리 부담', '낮음', '높음']]
    : [['Timing', 'spread', 'upfront'], ['Avg cost', 'path', 'start'], ['Behavior', 'lower', 'higher']];
  return `<rect x="170" y="200" width="860" height="330" rx="28" fill="#ffffff" stroke="#dce8f2" />
<rect x="170" y="200" width="860" height="74" rx="28" fill="#e8f3ff" />
${text(302, 247, lang === 'ko' ? '항목' : 'Item', 26, 800, '#123047', 'middle')}
${text(600, 247, 'DCA', 26, 800, '#123047', 'middle')}
${text(890, 247, lang === 'ko' ? '일괄' : 'Lump', 26, 800, '#123047', 'middle')}
${rows.map((r, i) => {
  const y = 312 + i * 74;
  return `<line x1="205" y1="${y - 38}" x2="995" y2="${y - 38}" stroke="#e2edf5" stroke-width="3" />
${text(302, y, r[0], 24, 700, '#507089', 'middle')}
${text(600, y, r[1], 24, 800, '#44b987', 'middle')}
${text(890, y, r[2], 24, 800, '#f39c7b', 'middle')}`;
}).join('\n')}`;
}

function outcomeVisual() {
  return `<rect x="145" y="185" width="910" height="360" rx="28" fill="#ffffff" stroke="#dce8f2" />
<line x1="230" y1="470" x2="980" y2="470" stroke="#d9e6ef" stroke-width="5" />
<line x1="230" y1="250" x2="230" y2="470" stroke="#d9e6ef" stroke-width="5" />
<path d="M240 440 C350 410 450 390 555 350 C700 295 830 260 965 210" fill="none" stroke="#f39c7b" stroke-width="10" stroke-linecap="round" />
<path d="M240 455 C345 430 470 420 575 382 C710 333 840 318 965 270" fill="none" stroke="#44b987" stroke-width="10" stroke-linecap="round" stroke-dasharray="18 16" />
<circle cx="965" cy="210" r="13" fill="#f39c7b" />
<circle cx="965" cy="270" r="13" fill="#44b987" />
${pill(710, 142, 'DCA', '#edf8f3', '#bde4d3')}
${pill(710, 205, 'Lump Sum', '#fff0e9', '#f4c7b7')}`;
}

function bearCoverVisual() {
  return `
<rect x="115" y="185" width="610" height="335" rx="32" fill="#ffffff" stroke="#dce8f2" />
<line x1="175" y1="455" x2="665" y2="455" stroke="#d9e6ef" stroke-width="5" />
<path d="M180 255 C250 250 300 310 365 330 C450 360 500 420 655 415" fill="none" stroke="#f39c7b" stroke-width="11" stroke-linecap="round" />
<path d="M545 325 l52 72 l76 -105" fill="none" stroke="#44b987" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
<g transform="translate(795,210)">
  <path d="M135 0 L260 48 L238 178 C220 260 175 302 135 322 C95 302 50 260 32 178 L10 48 Z" fill="#e8f8f1" stroke="#44b987" stroke-width="10" />
  <circle cx="135" cy="140" r="58" fill="#b98964" />
  <circle cx="93" cy="92" r="28" fill="#b98964" />
  <circle cx="177" cy="92" r="28" fill="#b98964" />
  <circle cx="115" cy="132" r="7" fill="#123047" />
  <circle cx="155" cy="132" r="7" fill="#123047" />
  <path d="M122 162 Q135 174 148 162" fill="none" stroke="#123047" stroke-width="6" stroke-linecap="round" />
  ${coin(54, 250, 24)}
  ${coin(212, 250, 24, '#ffd879')}
</g>`;
}

function scenariosVisual(lang) {
  const labels = lang === 'ko' ? ['기본', '초반 하락', '중간 하락', '마지막 해'] : ['Base', 'Early drop', 'Mid drop', 'Final-year'];
  const colors = ['#84c5f4', '#67c7a5', '#f8c95b', '#f39c7b'];
  return labels.map((label, i) => {
    const x = 110 + i * 260;
    const y = 220;
    const dropX = 55 + i * 28;
    return `<rect x="${x}" y="${y}" width="225" height="270" rx="26" fill="#ffffff" stroke="#dce8f2" />
${text(x + 112, y + 52, label, 24, 800, '#123047', 'middle')}
<path d="M${x + 36} ${y + 190} C${x + 78} ${y + 125} ${x + dropX} ${y + 210} ${x + 142} ${y + 130} C${x + 166} ${y + 98} ${x + 185} ${y + 85} ${x + 195} ${y + 78}" fill="none" stroke="${colors[i]}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
<circle cx="${x + dropX}" cy="${y + 204}" r="13" fill="#ffffff" stroke="#f39c7b" stroke-width="6" />
${text(x + 112, y + 238, '-20%', 26, 800, colors[i], 'middle')}`;
  }).join('\n');
}

function avgCostVisual() {
  return `<rect x="135" y="170" width="930" height="390" rx="32" fill="#ffffff" stroke="#dce8f2" />
<path d="M205 270 C300 250 362 385 445 390 C548 398 630 255 760 232 C845 218 912 250 995 205" fill="none" stroke="#4f9ee3" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
<line x1="205" y1="398" x2="995" y2="398" stroke="#d9e6ef" stroke-width="5" stroke-dasharray="12 12" />
<g>
  ${coin(330, 435, 22)}
  ${coin(360, 435, 22)}
  ${coin(390, 435, 22)}
  ${coin(420, 435, 22)}
  ${coin(600, 328, 20, '#ffd879')}
  ${coin(633, 328, 20, '#ffd879')}
  ${coin(790, 272, 18)}
</g>
<path d="M300 500 C420 450 550 445 690 405 C815 368 905 335 990 290" fill="none" stroke="#44b987" stroke-width="8" stroke-linecap="round" stroke-dasharray="20 18" />`;
}

function mddFinalVisual(lang) {
  const left = lang === 'ko' ? '낙폭' : 'Drawdown';
  const right = lang === 'ko' ? '최종 자산' : 'Final Value';
  return `<rect x="150" y="210" width="400" height="300" rx="30" fill="#ffffff" stroke="#dce8f2" />
${text(350, 270, left, 32, 800, '#123047', 'middle')}
<path d="M225 335 C280 275 320 420 378 375 C420 344 455 315 500 300" fill="none" stroke="#f39c7b" stroke-width="10" stroke-linecap="round" />
<path d="M340 315 l0 78" stroke="#f39c7b" stroke-width="8" stroke-linecap="round" />
<path d="M315 370 l25 28 l25 -28" fill="none" stroke="#f39c7b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
${text(350, 455, 'MDD', 34, 800, '#f39c7b', 'middle')}
<rect x="650" y="210" width="400" height="300" rx="30" fill="#ffffff" stroke="#dce8f2" />
${text(850, 270, right, 32, 800, '#123047', 'middle')}
<rect x="725" y="390" width="64" height="62" rx="14" fill="#84c5f4" />
<rect x="818" y="335" width="64" height="117" rx="14" fill="#67c7a5" />
<rect x="912" y="285" width="64" height="167" rx="14" fill="#f8c95b" />
<path d="M724 350 C780 338 825 310 875 292 C915 278 943 260 980 230" fill="none" stroke="#123047" stroke-width="7" stroke-linecap="round" />`;
}

function visual(kind, lang) {
  switch (kind) {
    case 'targetCover':
      return targetCoverVisual();
    case 'timeCards':
      return timeCardsVisual(lang);
    case 'gauge':
      return gaugeVisual(lang);
    case 'levers':
      return leversVisual(lang);
    case 'scale':
      return scaleVisual();
    case 'marketPaths':
      return marketPathsVisual(lang);
    case 'compareTable':
      return compareTableVisual(lang);
    case 'outcome':
      return outcomeVisual();
    case 'bearCover':
      return bearCoverVisual();
    case 'scenarios':
      return scenariosVisual(lang);
    case 'avgCost':
      return avgCostVisual();
    case 'mddFinal':
      return mddFinalVisual(lang);
    default:
      return targetCoverVisual();
  }
}

function svg(entry) {
  return `<!-- ${esc(entry.note)} -->
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(entry.title)}</title>
  <desc id="desc">${esc(entry.subtitle)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7fbff" />
      <stop offset="52%" stop-color="#edf8f3" />
      <stop offset="100%" stop-color="#fff7e8" />
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#123047" flood-opacity="0.12" />
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <g opacity="0.28">
    <circle cx="104" cy="95" r="58" fill="#84c5f4" />
    <circle cx="1082" cy="116" r="76" fill="#f8c95b" />
    <circle cx="1042" cy="585" r="52" fill="#67c7a5" />
  </g>
  <g filter="url(#softShadow)">
    <rect x="58" y="54" width="1084" height="566" rx="42" fill="#ffffff" opacity="0.72" />
  </g>
  ${text(96, 122, entry.title, entry.lang === 'ko' ? 46 : 44, 800, '#123047')}
  ${text(98, 165, entry.subtitle, 25, 700, '#507089')}
  ${visual(entry.kind, entry.lang)}
  <rect x="96" y="568" width="1008" height="2" fill="#dce8f2" />
  ${text(96, 606, entry.lang === 'ko' ? '시뮬레이션용 placeholder' : 'Simulation placeholder', 18, 700, '#7892a4')}
</svg>
`;
}

function main() {
  for (const entry of entries) {
    const fullPath = path.resolve(entry.outputPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, svg(entry), 'utf8');
    console.log(`wrote ${entry.outputPath}`);
  }
  console.log(`generated ${entries.length} SVG placeholder files`);
}

main();
