const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const WIDTH = 1600;
const HEIGHT = 900;
const OUT_ROOT = path.join(process.cwd(), "public", "images", "posts");

const COLORS = {
  bg: "#f7fbff",
  panel: "#ffffff",
  navy: "#102a43",
  slate: "#52647a",
  muted: "#7b8ba1",
  blue: "#2563eb",
  cyan: "#38bdf8",
  green: "#10b981",
  mint: "#dcfce7",
  line: "#d8e4f2",
  paleBlue: "#dbeafe",
  paleGreen: "#d1fae5",
  amber: "#f59e0b",
};

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function text({ x, y, value, size = 36, weight = 700, fill = COLORS.navy, anchor = "start", opacity = 1 }) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="'Malgun Gothic','Noto Sans KR','Inter','Arial',sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" opacity="${opacity}">${esc(value)}</text>`;
}

function rect({ x, y, w, h, r = 28, fill = COLORS.panel, stroke = COLORS.line, opacity = 1 }) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" opacity="${opacity}"/>`;
}

function circle({ cx, cy, r, fill, opacity = 1, stroke = "none" }) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" opacity="${opacity}"/>`;
}

function arrow({ x1, y1, x2, y2, color = COLORS.blue }) {
  return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="10" stroke-linecap="round"/>
    <path d="M ${x2} ${y2} l -24 -16 l 5 29 z" fill="${color}" transform="rotate(${Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI} ${x2} ${y2})"/>
  `;
}

function icon(type, x, y, color = COLORS.blue) {
  if (type === "home") {
    return `
      <path d="M ${x} ${y + 52} L ${x + 62} ${y} L ${x + 124} ${y + 52}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="${x + 22}" y="${y + 50}" width="80" height="72" rx="12" fill="${COLORS.paleBlue}" stroke="${color}" stroke-width="8"/>
      <rect x="${x + 52}" y="${y + 78}" width="22" height="44" rx="6" fill="${color}" opacity="0.85"/>
    `;
  }
  if (type === "cash") {
    return `
      <rect x="${x}" y="${y + 22}" width="130" height="82" rx="18" fill="${COLORS.paleGreen}" stroke="${color}" stroke-width="8"/>
      ${circle({ cx: x + 65, cy: y + 63, r: 22, fill: color, opacity: 0.9 })}
      <path d="M ${x + 20} ${y + 42} c 18 18 18 42 0 42 M ${x + 110} ${y + 42} c -18 18 -18 42 0 42" fill="none" stroke="${color}" stroke-width="7" opacity="0.65"/>
    `;
  }
  if (type === "chart") {
    return `
      <rect x="${x}" y="${y + 72}" width="24" height="54" rx="8" fill="${COLORS.green}"/>
      <rect x="${x + 40}" y="${y + 44}" width="24" height="82" rx="8" fill="${COLORS.cyan}"/>
      <rect x="${x + 80}" y="${y + 12}" width="24" height="114" rx="8" fill="${color}"/>
      <path d="M ${x - 8} ${y + 128} H ${x + 128}" stroke="${COLORS.navy}" stroke-width="8" stroke-linecap="round" opacity="0.7"/>
    `;
  }
  return `
    ${circle({ cx: x + 42, cy: y + 42, r: 38, fill: COLORS.paleBlue, stroke: color })}
    ${circle({ cx: x + 88, cy: y + 76, r: 38, fill: COLORS.paleGreen, stroke: COLORS.green })}
    <path d="M ${x + 22} ${y + 62} C ${x + 68} ${y + 28}, ${x + 86} ${y + 112}, ${x + 128} ${y + 46}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>
  `;
}

function background() {
  const dots = [];
  for (let x = 80; x < WIDTH; x += 120) {
    for (let y = 80; y < HEIGHT; y += 120) {
      dots.push(circle({ cx: x, cy: y, r: 2.5, fill: "#cfe2f3", opacity: 0.55 }));
    }
  }
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.bg}"/>
    ${dots.join("")}
    <path d="M 0 760 C 260 680, 430 830, 690 735 S 1140 650, 1600 745 L 1600 900 L 0 900 Z" fill="#eef7ff" opacity="0.95"/>
  `;
}

function metricCards(cards = []) {
  return cards.slice(0, 3).map((card, index) => {
    const x = 112 + index * 455;
    return `
      ${rect({ x, y: 682, w: 395, h: 118, r: 26, fill: COLORS.panel })}
      ${text({ x: x + 30, y: 732, value: card.label, size: 28, weight: 700, fill: COLORS.slate })}
      ${text({ x: x + 30, y: 776, value: card.value, size: 34, weight: 800, fill: card.color || COLORS.blue })}
    `;
  }).join("");
}

function barChart(data = [], { x = 145, y = 270, w = 850, h = 340, color = COLORS.blue, accent = COLORS.green } = {}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const gap = 36;
  const barW = (w - gap * (data.length - 1)) / data.length;
  return `
    ${rect({ x, y, w, h, r: 24, fill: "#f9fcff" })}
    <line x1="${x + 52}" y1="${y + h - 66}" x2="${x + w - 40}" y2="${y + h - 66}" stroke="${COLORS.line}" stroke-width="4"/>
    ${data.map((d, index) => {
      const bh = Math.max(26, (d.value / max) * (h - 140));
      const bx = x + 60 + index * (barW + gap);
      const by = y + h - 66 - bh;
      const fill = index === data.length - 1 ? accent : color;
      return `
        <rect x="${bx}" y="${by}" width="${barW - 34}" height="${bh}" rx="16" fill="${fill}" opacity="${index === data.length - 1 ? 0.98 : 0.84}"/>
        ${text({ x: bx + (barW - 34) / 2, y: by - 18, value: d.valueText, size: 24, weight: 800, fill: COLORS.navy, anchor: "middle" })}
        ${text({ x: bx + (barW - 34) / 2, y: y + h - 24, value: d.label, size: 25, weight: 700, fill: COLORS.slate, anchor: "middle" })}
      `;
    }).join("")}
  `;
}

function lineChart(data = [], { x = 145, y = 284, w = 850, h = 310, color = COLORS.green } = {}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = Math.max(max - min, 1);
  const pts = data.map((d, index) => {
    const px = x + 62 + index * ((w - 124) / Math.max(data.length - 1, 1));
    const py = y + h - 58 - ((d.value - min) / range) * (h - 126);
    return { ...d, x: px, y: py };
  });
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return `
    ${rect({ x, y, w, h, r: 24, fill: "#f9fcff" })}
    <line x1="${x + 50}" y1="${y + h - 58}" x2="${x + w - 48}" y2="${y + h - 58}" stroke="${COLORS.line}" stroke-width="4"/>
    <path d="${pathD}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map((p) => `
      ${circle({ cx: p.x, cy: p.y, r: 15, fill: COLORS.panel, stroke: color })}
      ${text({ x: p.x, y: p.y - 28, value: p.valueText, size: 24, weight: 800, fill: COLORS.navy, anchor: "middle" })}
      ${text({ x: p.x, y: y + h - 18, value: p.label, size: 25, weight: 700, fill: COLORS.slate, anchor: "middle" })}
    `).join("")}
  `;
}

function flowChart(items = [], { x = 130, y = 305, w = 1180, h = 210 } = {}) {
  const itemW = 245;
  const gap = 66;
  return `
    ${items.map((item, index) => {
      const ix = x + index * (itemW + gap);
      const arrowSvg = index < items.length - 1 ? arrow({ x1: ix + itemW + 16, y1: y + 96, x2: ix + itemW + gap - 18, y2: y + 96, color: COLORS.cyan }) : "";
      return `
        ${rect({ x: ix, y, w: itemW, h, r: 26, fill: COLORS.panel })}
        ${icon(item.icon || "chart", ix + 56, y + 24, item.color || COLORS.blue)}
        ${text({ x: ix + itemW / 2, y: y + 162, value: item.label, size: 28, weight: 800, fill: COLORS.navy, anchor: "middle" })}
        ${text({ x: ix + itemW / 2, y: y + 196, value: item.sub, size: 21, weight: 700, fill: COLORS.slate, anchor: "middle" })}
        ${arrowSvg}
      `;
    }).join("")}
    <rect x="${x - 12}" y="${y - 12}" width="${w}" height="${h + 28}" rx="34" fill="none" stroke="${COLORS.line}" stroke-width="3" opacity="0.8"/>
  `;
}

function sidePanel(spec) {
  const x = 1080;
  return `
    ${rect({ x, y: 260, w: 380, h: 350, r: 32, fill: COLORS.panel })}
    ${icon(spec.icon || "chart", x + 126, 304, spec.iconColor || COLORS.blue)}
    ${text({ x: x + 42, y: 480, value: spec.panelTitle || spec.title, size: 36, weight: 900, fill: COLORS.navy })}
    ${text({ x: x + 42, y: 528, value: spec.panelMetric || spec.keyword, size: 29, weight: 800, fill: COLORS.green })}
    ${text({ x: x + 42, y: 572, value: spec.panelNote || "Simulation", size: 24, weight: 700, fill: COLORS.slate })}
  `;
}

function renderSvg(spec) {
  const titleY = spec.isCover ? 256 : 146;
  const titleSize = spec.isCover ? 82 : 58;
  const chart =
    spec.chartType === "line"
      ? lineChart(spec.data, spec.chartOptions)
      : spec.chartType === "flow"
        ? flowChart(spec.flowItems, spec.chartOptions)
        : barChart(spec.data, spec.chartOptions);

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${background()}
    ${circle({ cx: 1370, cy: 140, r: 120, fill: COLORS.paleBlue, opacity: 0.65 })}
    ${circle({ cx: 1470, cy: 245, r: 58, fill: COLORS.paleGreen, opacity: 0.8 })}
    ${text({ x: 112, y: titleY, value: spec.title, size: titleSize, weight: 900, fill: COLORS.navy })}
    ${text({ x: 116, y: titleY + (spec.isCover ? 68 : 48), value: spec.keyword, size: spec.isCover ? 38 : 28, weight: 800, fill: COLORS.blue })}
    ${rect({ x: 112, y: spec.isCover ? 396 : 226, w: 1338, h: spec.isCover ? 245 : 410, r: 38, fill: "rgba(255,255,255,0.76)", stroke: COLORS.line })}
    ${spec.isCover ? `
      ${lineChart(spec.data, { x: 178, y: 430, w: 820, h: 180, color: spec.accent || COLORS.green })}
      ${sidePanel({ ...spec, panelTitle: spec.panelTitle, panelMetric: spec.panelMetric, panelNote: spec.panelNote })}
    ` : `
      ${chart}
      ${sidePanel(spec)}
    `}
    ${metricCards(spec.cards)}
  </svg>`;
}

const imageSets = [
  {
    slug: "compound-return-3-5-7-10-table",
    cover: {
      title: "Compound Growth",
      keyword: "3% · 5% · 7% · 10%",
      panelTitle: "30Y Gap",
      panelMetric: "KRW 24.6M → 198.4M",
      panelNote: "Return assumptions",
      data: [
        { label: "3%", value: 24.6, valueText: "24.6M" },
        { label: "5%", value: 44.7, valueText: "44.7M" },
        { label: "7%", value: 81.2, valueText: "81.2M" },
        { label: "10%", value: 198.4, valueText: "198.4M" },
      ],
      cards: [
        { label: "Lump Sum", value: "KRW 10M" },
        { label: "Monthly", value: "KRW 300K" },
        { label: "Horizon", value: "10Y · 20Y · 30Y", color: COLORS.green },
      ],
    },
    ko: [
      {
        file: "img1.png",
        title: "복리 격차",
        keyword: "1,000만원 · 10/20/30년",
        panelTitle: "30년",
        panelMetric: "10% 1.98억",
        panelNote: "세금·수수료 0%",
        chartType: "bar",
        data: [
          { label: "3%", value: 2457, valueText: "2,457만" },
          { label: "5%", value: 4468, valueText: "4,468만" },
          { label: "7%", value: 8116, valueText: "8,116만" },
          { label: "10%", value: 19837, valueText: "1.98억" },
        ],
        cards: [
          { label: "초기금액", value: "1,000만원" },
          { label: "방식", value: "월복리" },
          { label: "핵심", value: "시간×수익률", color: COLORS.green },
        ],
      },
      {
        file: "img2.png",
        title: "월 적립 비교",
        keyword: "30만원 · 3/5/7/10%",
        panelTitle: "30년 적립",
        panelMetric: "최대 6.78억",
        panelNote: "원금 1.08억",
        chartType: "bar",
        data: [
          { label: "3%", value: 17482, valueText: "1.75억" },
          { label: "5%", value: 24968, valueText: "2.50억" },
          { label: "7%", value: 36599, valueText: "3.66억" },
          { label: "10%", value: 67815, valueText: "6.78억" },
        ],
        cards: [
          { label: "월 납입", value: "30만원" },
          { label: "원금", value: "1.08억" },
          { label: "비교", value: "3%→10%", color: COLORS.green },
        ],
      },
      {
        file: "img3.png",
        title: "기간의 힘",
        keyword: "2%p 차이 · 장기 효과",
        panelTitle: "핵심",
        panelMetric: "격차 확대",
        panelNote: "장기 계획 점검",
        chartType: "line",
        data: [
          { label: "10년", value: 5.2, valueText: "0.5억" },
          { label: "20년", value: 15.6, valueText: "1.6억" },
          { label: "30년", value: 36.6, valueText: "3.7억" },
        ],
        cards: [
          { label: "수익률", value: "여러 시나리오" },
          { label: "비용", value: "세금·수수료" },
          { label: "주의", value: "예측 아님", color: COLORS.green },
        ],
      },
    ],
    en: [
      {
        file: "img1-en.png",
        title: "Lump Sum",
        keyword: "KRW 10M · 10/20/30Y",
        panelTitle: "30Y",
        panelMetric: "10% = 198.4M",
        panelNote: "No taxes or fees",
        chartType: "bar",
        data: [
          { label: "3%", value: 24.6, valueText: "24.6M" },
          { label: "5%", value: 44.7, valueText: "44.7M" },
          { label: "7%", value: 81.2, valueText: "81.2M" },
          { label: "10%", value: 198.4, valueText: "198.4M" },
        ],
        cards: [
          { label: "Start", value: "KRW 10M" },
          { label: "Mode", value: "Monthly comp." },
          { label: "Key", value: "Time × Return", color: COLORS.green },
        ],
      },
      {
        file: "img2-en.png",
        title: "Monthly Plan",
        keyword: "KRW 300K · 3/5/7/10%",
        panelTitle: "30Y DCA",
        panelMetric: "Up to 678.2M",
        panelNote: "Contrib. 108M",
        chartType: "bar",
        data: [
          { label: "3%", value: 174.8, valueText: "174.8M" },
          { label: "5%", value: 249.7, valueText: "249.7M" },
          { label: "7%", value: 366.0, valueText: "366.0M" },
          { label: "10%", value: 678.2, valueText: "678.2M" },
        ],
        cards: [
          { label: "Monthly", value: "KRW 300K" },
          { label: "Principal", value: "KRW 108M" },
          { label: "Compare", value: "3%→10%", color: COLORS.green },
        ],
      },
      {
        file: "img3-en.png",
        title: "Time Effect",
        keyword: "2pp gap · long horizon",
        panelTitle: "Meaning",
        panelMetric: "Wider gap",
        panelNote: "Stress assumptions",
        chartType: "line",
        data: [
          { label: "10Y", value: 51.9, valueText: "51.9M" },
          { label: "20Y", value: 156.3, valueText: "156.3M" },
          { label: "30Y", value: 366.0, valueText: "366.0M" },
        ],
        cards: [
          { label: "Returns", value: "Scenarios" },
          { label: "Costs", value: "Taxes · fees" },
          { label: "Caution", value: "Not forecast", color: COLORS.green },
        ],
      },
    ],
  },
  {
    slug: "monthly-investment-for-100m-table",
    cover: {
      title: "KRW 100M Goal",
      keyword: "Monthly Investment · 5Y 10Y 15Y 20Y",
      panelTitle: "Target",
      panelMetric: "KRW 100M",
      panelNote: "Reverse calculation",
      data: [
        { label: "5Y", value: 146, valueText: "1.46M" },
        { label: "10Y", value: 64, valueText: "640K" },
        { label: "15Y", value: 37, valueText: "370K" },
        { label: "20Y", value: 24, valueText: "240K" },
      ],
      cards: [
        { label: "Goal", value: "KRW 100M" },
        { label: "Start", value: "KRW 0" },
        { label: "Rates", value: "3% · 5% · 7% · 10%", color: COLORS.green },
      ],
    },
    ko: [
      {
        file: "img1.png",
        title: "월 투자금",
        keyword: "1억원 목표 · 기간별",
        panelTitle: "연 5%",
        panelMetric: "5년 146만",
        panelNote: "20년 24만",
        chartType: "bar",
        data: [
          { label: "5년", value: 146, valueText: "146만" },
          { label: "10년", value: 64, valueText: "64만" },
          { label: "15년", value: 37, valueText: "37만" },
          { label: "20년", value: 24, valueText: "24만" },
        ],
        cards: [
          { label: "목표", value: "1억원" },
          { label: "초기자산", value: "0원" },
          { label: "방식", value: "월 적립", color: COLORS.green },
        ],
      },
      {
        file: "img2.png",
        title: "기간 효과",
        keyword: "5년 vs 20년",
        panelTitle: "차이",
        panelMetric: "월 122만↓",
        panelNote: "연 5% 기준",
        chartType: "line",
        data: [
          { label: "5년", value: 146, valueText: "146만" },
          { label: "10년", value: 64, valueText: "64만" },
          { label: "15년", value: 37, valueText: "37만" },
          { label: "20년", value: 24, valueText: "24만" },
        ],
        cards: [
          { label: "장점", value: "부담 감소" },
          { label: "조건", value: "꾸준한 납입" },
          { label: "주의", value: "긴 변동성", color: COLORS.green },
        ],
      },
      {
        file: "img3.png",
        title: "가정 민감도",
        keyword: "수익률 · 초기자산",
        panelTitle: "10년",
        panelMetric: "48만~71만",
        panelNote: "3%~10% 범위",
        chartType: "flow",
        flowItems: [
          { label: "기간", sub: "5~20년", icon: "chart", color: COLORS.blue },
          { label: "수익률", sub: "3~10%", icon: "cash", color: COLORS.green },
          { label: "초기자산", sub: "부담 완화", icon: "cash", color: COLORS.cyan },
          { label: "월 납입", sub: "역산", icon: "chart", color: COLORS.blue },
        ],
        cards: [
          { label: "목표", value: "1억원" },
          { label: "민감도", value: "가정별 비교" },
          { label: "주의", value: "보장 아님", color: COLORS.green },
        ],
      },
    ],
    en: [
      {
        file: "img1-en.png",
        title: "Monthly Amount",
        keyword: "KRW 100M target · timeline",
        panelTitle: "At 5%",
        panelMetric: "5Y 1.46M",
        panelNote: "20Y 240K",
        chartType: "bar",
        data: [
          { label: "5Y", value: 146, valueText: "1.46M" },
          { label: "10Y", value: 64, valueText: "640K" },
          { label: "15Y", value: 37, valueText: "370K" },
          { label: "20Y", value: 24, valueText: "240K" },
        ],
        cards: [
          { label: "Goal", value: "KRW 100M" },
          { label: "Start", value: "KRW 0" },
          { label: "Method", value: "Monthly", color: COLORS.green },
        ],
      },
      {
        file: "img2-en.png",
        title: "Timeline Effect",
        keyword: "5Y vs 20Y",
        panelTitle: "Gap",
        panelMetric: "1.22M lower",
        panelNote: "At 5% return",
        chartType: "line",
        data: [
          { label: "5Y", value: 146, valueText: "1.46M" },
          { label: "10Y", value: 64, valueText: "640K" },
          { label: "15Y", value: 37, valueText: "370K" },
          { label: "20Y", value: 24, valueText: "240K" },
        ],
        cards: [
          { label: "Benefit", value: "Lower burden" },
          { label: "Need", value: "Consistency" },
          { label: "Risk", value: "Long horizon", color: COLORS.green },
        ],
      },
      {
        file: "img3-en.png",
        title: "Assumption Risk",
        keyword: "Return · starting assets",
        panelTitle: "10Y",
        panelMetric: "480K~710K",
        panelNote: "3%~10% range",
        chartType: "flow",
        flowItems: [
          { label: "Timeline", sub: "5~20Y", icon: "chart", color: COLORS.blue },
          { label: "Return", sub: "3~10%", icon: "cash", color: COLORS.green },
          { label: "Start", sub: "Initial assets", icon: "cash", color: COLORS.cyan },
          { label: "Monthly", sub: "Required", icon: "chart", color: COLORS.blue },
        ],
        cards: [
          { label: "Goal", value: "KRW 100M" },
          { label: "Check", value: "Scenarios" },
          { label: "Caution", value: "Not forecast", color: COLORS.green },
        ],
      },
    ],
  },
  {
    slug: "dsr-40-income-loan-limit-table",
    cover: {
      title: "DSR 40%",
      keyword: "Income · Loan Capacity",
      panelTitle: "Mortgage",
      panelMetric: "4% · 30Y",
      panelNote: "No existing debt",
      data: [
        { label: "30M", value: 2.09, valueText: "2.09억" },
        { label: "60M", value: 4.19, valueText: "4.19억" },
        { label: "100M", value: 6.98, valueText: "6.98억" },
        { label: "120M", value: 8.38, valueText: "8.38억" },
      ],
      cards: [
        { label: "DSR", value: "40%" },
        { label: "Rate", value: "4.0%" },
        { label: "Term", value: "30Y", color: COLORS.green },
      ],
    },
    ko: [
      {
        file: "img1.png",
        title: "연봉별 한도",
        keyword: "DSR 40% · 금리 4%",
        panelTitle: "연봉 6천",
        panelMetric: "4.19억",
        panelNote: "월 200만원",
        chartType: "bar",
        data: [
          { label: "3천", value: 2.09, valueText: "2.09억" },
          { label: "4천", value: 2.79, valueText: "2.79억" },
          { label: "6천", value: 4.19, valueText: "4.19억" },
          { label: "8천", value: 5.59, valueText: "5.59억" },
          { label: "1.2억", value: 8.38, valueText: "8.38억" },
        ],
        cards: [
          { label: "DSR", value: "40%" },
          { label: "금리", value: "4.0%" },
          { label: "기간", value: "30년", color: COLORS.green },
        ],
      },
      {
        file: "img2.png",
        title: "상환 여력",
        keyword: "월 상환액 · 30년",
        panelTitle: "연봉 6천",
        panelMetric: "월 200만",
        panelNote: "연 2,400만",
        chartType: "flow",
        flowItems: [
          { label: "연봉", sub: "6,000만", icon: "cash", color: COLORS.blue },
          { label: "DSR", sub: "40%", icon: "chart", color: COLORS.green },
          { label: "월 상환", sub: "200만", icon: "cash", color: COLORS.cyan },
          { label: "대출", sub: "4.19억", icon: "home", color: COLORS.blue },
        ],
        cards: [
          { label: "기준", value: "원리금균등" },
          { label: "부채", value: "0원" },
          { label: "주의", value: "심사 별도", color: COLORS.green },
        ],
      },
      {
        file: "img3.png",
        title: "심사 주의",
        keyword: "기존부채 · LTV",
        panelTitle: "실제 한도",
        panelMetric: "달라질 수 있음",
        panelNote: "은행 심사 필요",
        chartType: "flow",
        flowItems: [
          { label: "소득", sub: "DSR", icon: "cash", color: COLORS.blue },
          { label: "기존부채", sub: "상환액", icon: "chart", color: COLORS.amber },
          { label: "LTV", sub: "담보비율", icon: "home", color: COLORS.green },
          { label: "현금", sub: "취득비용", icon: "cash", color: COLORS.cyan },
        ],
        cards: [
          { label: "한도", value: "사전 점검" },
          { label: "집값", value: "별도 계산" },
          { label: "안전", value: "버퍼 확인", color: COLORS.green },
        ],
      },
    ],
    en: [
      {
        file: "img1-en.png",
        title: "Income Capacity",
        keyword: "DSR 40% · 4% rate",
        panelTitle: "Income 60M",
        panelMetric: "KRW 419M",
        panelNote: "Monthly 2M",
        chartType: "bar",
        data: [
          { label: "30M", value: 209, valueText: "209M" },
          { label: "40M", value: 279, valueText: "279M" },
          { label: "60M", value: 419, valueText: "419M" },
          { label: "80M", value: 559, valueText: "559M" },
          { label: "120M", value: 838, valueText: "838M" },
        ],
        cards: [
          { label: "DSR", value: "40%" },
          { label: "Rate", value: "4.0%" },
          { label: "Term", value: "30Y", color: COLORS.green },
        ],
      },
      {
        file: "img2-en.png",
        title: "Payment Room",
        keyword: "Monthly payment · 30Y",
        panelTitle: "Income 60M",
        panelMetric: "KRW 2M/mo",
        panelNote: "KRW 24M/yr",
        chartType: "flow",
        flowItems: [
          { label: "Income", sub: "KRW 60M", icon: "cash", color: COLORS.blue },
          { label: "DSR", sub: "40%", icon: "chart", color: COLORS.green },
          { label: "Payment", sub: "2M/mo", icon: "cash", color: COLORS.cyan },
          { label: "Loan", sub: "419M", icon: "home", color: COLORS.blue },
        ],
        cards: [
          { label: "Method", value: "Equal payment" },
          { label: "Debt", value: "KRW 0" },
          { label: "Caution", value: "Not approval", color: COLORS.green },
        ],
      },
      {
        file: "img3-en.png",
        title: "Underwriting Check",
        keyword: "Existing debt · LTV",
        panelTitle: "Actual limit",
        panelMetric: "May differ",
        panelNote: "Lender review",
        chartType: "flow",
        flowItems: [
          { label: "Income", sub: "DSR", icon: "cash", color: COLORS.blue },
          { label: "Debt", sub: "Payments", icon: "chart", color: COLORS.amber },
          { label: "LTV", sub: "Collateral", icon: "home", color: COLORS.green },
          { label: "Cash", sub: "Costs", icon: "cash", color: COLORS.cyan },
        ],
        cards: [
          { label: "Limit", value: "Pre-check" },
          { label: "Home price", value: "Separate" },
          { label: "Buffer", value: "Needed", color: COLORS.green },
        ],
      },
    ],
  },
  {
    slug: "interest-rate-1p-loan-limit-impact",
    cover: {
      title: "Rate Shock",
      keyword: "+1pp · Loan Capacity",
      panelTitle: "DSR 40%",
      panelMetric: "3% → 6%",
      panelNote: "KRW 60M income",
      data: [
        { label: "3%", value: 474, valueText: "474M" },
        { label: "4%", value: 419, valueText: "419M" },
        { label: "5%", value: 373, valueText: "373M" },
        { label: "6%", value: 334, valueText: "334M" },
      ],
      cards: [
        { label: "Income", value: "KRW 60M" },
        { label: "DSR", value: "40%" },
        { label: "Term", value: "30Y", color: COLORS.green },
      ],
    },
    ko: [
      {
        file: "img1.png",
        title: "금리별 한도",
        keyword: "3%~6% · DSR 40%",
        panelTitle: "3%→4%",
        panelMetric: "5,546만↓",
        panelNote: "약 11.7%",
        chartType: "bar",
        data: [
          { label: "3%", value: 4.74, valueText: "4.74억" },
          { label: "4%", value: 4.19, valueText: "4.19억" },
          { label: "5%", value: 3.73, valueText: "3.73억" },
          { label: "6%", value: 3.34, valueText: "3.34억" },
        ],
        cards: [
          { label: "연봉", value: "6,000만원" },
          { label: "월 상환", value: "200만원" },
          { label: "기준", value: "30년", color: COLORS.green },
        ],
      },
      {
        file: "img2.png",
        title: "3억원 상환액",
        keyword: "월 부담 · 금리 차이",
        panelTitle: "3% vs 6%",
        panelMetric: "월 53만↑",
        panelNote: "같은 원금",
        chartType: "bar",
        data: [
          { label: "3%", value: 127, valueText: "127만" },
          { label: "4%", value: 143, valueText: "143만" },
          { label: "5%", value: 161, valueText: "161만" },
          { label: "6%", value: 180, valueText: "180만" },
        ],
        cards: [
          { label: "원금", value: "3억원" },
          { label: "방식", value: "원리금균등" },
          { label: "영향", value: "현금흐름", color: COLORS.green },
        ],
      },
      {
        file: "img3.png",
        title: "스트레스 테스트",
        keyword: "+1%p · 현금흐름",
        panelTitle: "핵심",
        panelMetric: "버퍼 확인",
        panelNote: "금리 상승 대비",
        chartType: "flow",
        flowItems: [
          { label: "현재금리", sub: "기준", icon: "chart", color: COLORS.blue },
          { label: "+1%p", sub: "한도 감소", icon: "chart", color: COLORS.amber },
          { label: "월상환", sub: "생활비", icon: "cash", color: COLORS.green },
          { label: "버퍼", sub: "비상금", icon: "cash", color: COLORS.cyan },
        ],
        cards: [
          { label: "금리", value: "민감도" },
          { label: "대출", value: "원금 감소" },
          { label: "주의", value: "심사 별도", color: COLORS.green },
        ],
      },
    ],
    en: [
      {
        file: "img1-en.png",
        title: "Rate Capacity",
        keyword: "3%~6% · DSR 40%",
        panelTitle: "3%→4%",
        panelMetric: "55.5M lower",
        panelNote: "About 11.7%",
        chartType: "bar",
        data: [
          { label: "3%", value: 474, valueText: "474M" },
          { label: "4%", value: 419, valueText: "419M" },
          { label: "5%", value: 373, valueText: "373M" },
          { label: "6%", value: 334, valueText: "334M" },
        ],
        cards: [
          { label: "Income", value: "KRW 60M" },
          { label: "Payment", value: "KRW 2M/mo" },
          { label: "Term", value: "30Y", color: COLORS.green },
        ],
      },
      {
        file: "img2-en.png",
        title: "Same Loan",
        keyword: "KRW 300M · monthly payment",
        panelTitle: "3% vs 6%",
        panelMetric: "530K higher",
        panelNote: "Same principal",
        chartType: "bar",
        data: [
          { label: "3%", value: 127, valueText: "1.27M" },
          { label: "4%", value: 143, valueText: "1.43M" },
          { label: "5%", value: 161, valueText: "1.61M" },
          { label: "6%", value: 180, valueText: "1.80M" },
        ],
        cards: [
          { label: "Principal", value: "KRW 300M" },
          { label: "Method", value: "Equal payment" },
          { label: "Impact", value: "Cash flow", color: COLORS.green },
        ],
      },
      {
        file: "img3-en.png",
        title: "Stress Test",
        keyword: "+1pp · cash flow",
        panelTitle: "Focus",
        panelMetric: "Buffer check",
        panelNote: "Rate shock",
        chartType: "flow",
        flowItems: [
          { label: "Base rate", sub: "Current", icon: "chart", color: COLORS.blue },
          { label: "+1pp", sub: "Lower cap", icon: "chart", color: COLORS.amber },
          { label: "Payment", sub: "Budget", icon: "cash", color: COLORS.green },
          { label: "Buffer", sub: "Reserve", icon: "cash", color: COLORS.cyan },
        ],
        cards: [
          { label: "Rate", value: "Sensitivity" },
          { label: "Loan", value: "Lower principal" },
          { label: "Caution", value: "Not approval", color: COLORS.green },
        ],
      },
    ],
  },
];

async function writePng(slug, fileName, spec) {
  const outDir = path.join(OUT_ROOT, slug);
  fs.mkdirSync(outDir, { recursive: true });
  const svg = renderSvg(spec);
  const outPath = path.join(outDir, fileName);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath);
  return outPath;
}

async function main() {
  const written = [];
  for (const set of imageSets) {
    const koCover = { ...set.cover, isCover: true };
    const enCover = { ...set.cover, isCover: true };
    written.push(await writePng(set.slug, "cover.png", koCover));
    written.push(await writePng(set.slug, "cover-en.png", enCover));

    for (const item of set.ko) written.push(await writePng(set.slug, item.file, item));
    for (const item of set.en) written.push(await writePng(set.slug, item.file, item));
  }

  for (const file of written) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
    console.log(rel);
  }
  console.log(`generated=${written.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
