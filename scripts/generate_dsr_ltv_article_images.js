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
  line: "#d8e4f2",
  blue: "#2563eb",
  cyan: "#38bdf8",
  green: "#10b981",
  mint: "#d1fae5",
  paleBlue: "#dbeafe",
  paleGreen: "#dcfce7",
  amber: "#f59e0b",
  rose: "#fb7185",
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

function rect({ x, y, w, h, r = 24, fill = COLORS.panel, stroke = COLORS.line, sw = 3, opacity = 1 }) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function line({ x1, y1, x2, y2, stroke = COLORS.line, sw = 5, opacity = 1 }) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" opacity="${opacity}"/>`;
}

function circle({ cx, cy, r, fill = COLORS.blue, stroke = "none", sw = 0, opacity = 1 }) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function background() {
  const grid = [];
  for (let x = 100; x < WIDTH; x += 110) {
    grid.push(line({ x1: x, y1: 80, x2: x, y2: 820, stroke: "#e8f1fb", sw: 2, opacity: 0.75 }));
  }
  for (let y = 120; y < HEIGHT; y += 110) {
    grid.push(line({ x1: 80, y1: y, x2: 1520, y2: y, stroke: "#e8f1fb", sw: 2, opacity: 0.75 }));
  }
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.bg}"/>
    ${grid.join("")}
    <path d="M 0 760 C 260 705, 500 810, 760 742 C 1010 675, 1230 705, 1600 650 L 1600 900 L 0 900 Z" fill="#eef7ff" opacity="0.95"/>
  `;
}

function arrow({ x1, y1, x2, y2, color = COLORS.blue }) {
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="9" stroke-linecap="round"/>
    <path d="M ${x2} ${y2} l -24 -15 l 6 30 z" fill="${color}" transform="rotate(${angle} ${x2} ${y2})"/>
  `;
}

function icon(type, x, y, color = COLORS.blue) {
  if (type === "cash") {
    return `
      ${rect({ x, y: y + 16, w: 138, h: 84, r: 18, fill: COLORS.paleGreen, stroke: color, sw: 7 })}
      ${circle({ cx: x + 69, cy: y + 58, r: 22, fill: color, opacity: 0.95 })}
      <path d="M ${x + 22} ${y + 38} c 18 18 18 40 0 40 M ${x + 116} ${y + 38} c -18 18 -18 40 0 40" fill="none" stroke="${color}" stroke-width="6" opacity="0.65"/>
    `;
  }
  if (type === "home") {
    return `
      <path d="M ${x} ${y + 58} L ${x + 70} ${y} L ${x + 140} ${y + 58}" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      ${rect({ x: x + 24, y: y + 58, w: 92, h: 80, r: 14, fill: COLORS.paleBlue, stroke: color, sw: 7 })}
      ${rect({ x: x + 58, y: y + 92, w: 28, h: 46, r: 7, fill: color, stroke: color, sw: 0 })}
    `;
  }
  if (type === "check") {
    return `
      ${circle({ cx: x + 70, cy: y + 70, r: 62, fill: COLORS.mint, stroke: color, sw: 7 })}
      <path d="M ${x + 36} ${y + 70} L ${x + 62} ${y + 96} L ${x + 108} ${y + 44}" fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  }
  if (type === "dashboard") {
    return `
      ${rect({ x, y: y + 14, w: 142, h: 112, r: 20, fill: COLORS.paleBlue, stroke: color, sw: 7 })}
      ${rect({ x: x + 18, y: y + 34, w: 48, h: 28, r: 8, fill: COLORS.panel, stroke: "none", sw: 0 })}
      ${rect({ x: x + 78, y: y + 34, w: 46, h: 28, r: 8, fill: COLORS.panel, stroke: "none", sw: 0 })}
      ${rect({ x: x + 18, y: y + 78, w: 106, h: 30, r: 9, fill: COLORS.green, stroke: "none", sw: 0, opacity: 0.9 })}
    `;
  }
  return `
    ${rect({ x, y: y + 26, w: 28, h: 96, r: 10, fill: COLORS.green, stroke: "none", sw: 0 })}
    ${rect({ x: x + 48, y: y + 2, w: 28, h: 120, r: 10, fill: COLORS.cyan, stroke: "none", sw: 0 })}
    ${rect({ x: x + 96, y: y + 46, w: 28, h: 76, r: 10, fill: color, stroke: "none", sw: 0 })}
    ${line({ x1: x - 8, y1: y + 126, x2: x + 140, y2: y + 126, stroke: COLORS.navy, sw: 7, opacity: 0.65 })}
  `;
}

function header(spec) {
  return `
    ${text({ x: 112, y: spec.cover ? 210 : 125, value: spec.title, size: spec.cover ? 74 : 58, weight: 900 })}
    ${text({ x: 116, y: spec.cover ? 272 : 174, value: spec.keyword, size: spec.cover ? 34 : 28, weight: 800, fill: COLORS.blue })}
    ${rect({ x: 112, y: spec.cover ? 320 : 210, w: 1376, h: spec.cover ? 428 : 515, r: 34, fill: "rgba(255,255,255,0.78)", stroke: COLORS.line })}
  `;
}

function metricCards(cards) {
  return cards.map((card, index) => {
    const x = 112 + index * 465;
    return `
      ${rect({ x, y: 768, w: 405, h: 92, r: 24, fill: COLORS.panel })}
      ${text({ x: x + 28, y: 808, value: card.label, size: 25, weight: 800, fill: COLORS.slate })}
      ${text({ x: x + 28, y: 845, value: card.value, size: 30, weight: 900, fill: card.color || COLORS.blue })}
    `;
  }).join("");
}

function bars({ data, x = 185, y = 304, w = 870, h = 350, color = COLORS.blue }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const gap = 44;
  const barW = (w - gap * (data.length - 1)) / data.length;
  return `
    ${rect({ x, y, w, h, r: 26, fill: "#fbfdff" })}
    ${line({ x1: x + 52, y1: y + h - 68, x2: x + w - 46, y2: y + h - 68, sw: 4 })}
    ${data.map((d, index) => {
      const bh = Math.max(36, (d.value / max) * (h - 140));
      const bx = x + 66 + index * (barW + gap);
      const by = y + h - 68 - bh;
      const fill = d.color || (index === data.length - 1 ? COLORS.green : color);
      return `
        ${rect({ x: bx, y: by, w: barW - 42, h: bh, r: 18, fill, stroke: "none", sw: 0, opacity: 0.92 })}
        ${text({ x: bx + (barW - 42) / 2, y: by - 18, value: d.valueText, size: 24, weight: 900, anchor: "middle" })}
        ${text({ x: bx + (barW - 42) / 2, y: y + h - 24, value: d.label, size: 24, weight: 800, fill: COLORS.slate, anchor: "middle" })}
      `;
    }).join("")}
  `;
}

function bands({ data, x = 180, y = 298, w = 900, h = 360 }) {
  const max = Math.max(...data.map((d) => d.high), 1);
  return `
    ${rect({ x, y, w, h, r: 26, fill: "#fbfdff" })}
    ${data.map((d, index) => {
      const rowY = y + 62 + index * 92;
      const baseX = x + 210;
      const scaleW = w - 305;
      const lowX = baseX + (d.low / max) * scaleW;
      const highX = baseX + (d.high / max) * scaleW;
      return `
        ${text({ x: x + 48, y: rowY + 12, value: d.label, size: 27, weight: 900, fill: COLORS.navy })}
        ${line({ x1: baseX, y1: rowY, x2: baseX + scaleW, y2: rowY, stroke: COLORS.line, sw: 14, opacity: 0.9 })}
        ${line({ x1: lowX, y1: rowY, x2: highX, y2: rowY, stroke: d.color || COLORS.green, sw: 18, opacity: 0.92 })}
        ${circle({ cx: lowX, cy: rowY, r: 12, fill: COLORS.panel, stroke: d.color || COLORS.green, sw: 5 })}
        ${circle({ cx: highX, cy: rowY, r: 12, fill: COLORS.panel, stroke: d.color || COLORS.green, sw: 5 })}
        ${text({ x: baseX + scaleW, y: rowY + 46, value: d.caption, size: 22, weight: 800, fill: COLORS.slate, anchor: "end" })}
      `;
    }).join("")}
  `;
}

function statusCards({ items, x = 182, y = 300, w = 910, h = 360 }) {
  const cardW = 270;
  return `
    ${rect({ x, y, w, h, r: 26, fill: "#fbfdff" })}
    ${items.map((item, index) => {
      const ix = x + 48 + index * 292;
      return `
        ${rect({ x: ix, y: y + 52, w: cardW, h: 248, r: 24, fill: COLORS.panel, stroke: item.color })}
        ${icon(item.icon || "home", ix + 64, y + 74, item.color)}
        ${text({ x: ix + cardW / 2, y: y + 220, value: item.label, size: 32, weight: 900, fill: item.color, anchor: "middle" })}
        ${text({ x: ix + cardW / 2, y: y + 264, value: item.sub, size: 22, weight: 800, fill: COLORS.slate, anchor: "middle" })}
      `;
    }).join("")}
  `;
}

function checks({ items, x = 178, y = 292, w = 900, h = 372 }) {
  return `
    ${rect({ x, y, w, h, r: 26, fill: "#fbfdff" })}
    ${items.map((item, index) => {
      const rowY = y + 70 + index * 94;
      return `
        ${circle({ cx: x + 74, cy: rowY - 16, r: 31, fill: item.color, opacity: 0.92 })}
        ${text({ x: x + 74, y: rowY - 5, value: String(index + 1), size: 25, weight: 900, fill: COLORS.panel, anchor: "middle" })}
        ${text({ x: x + 128, y: rowY - 14, value: item.label, size: 34, weight: 900, fill: COLORS.navy })}
        ${text({ x: x + 128, y: rowY + 28, value: item.sub, size: 24, weight: 800, fill: COLORS.slate })}
        ${line({ x1: x + 126, y1: rowY + 54, x2: x + w - 62, y2: rowY + 54, sw: 3, opacity: index === items.length - 1 ? 0 : 0.65 })}
      `;
    }).join("")}
  `;
}

function flow({ items, x = 165, y = 325, w = 930, h = 280 }) {
  const cardW = 190;
  const gap = 36;
  return `
    ${rect({ x, y, w, h, r: 26, fill: "#fbfdff" })}
    ${items.map((item, index) => {
      const ix = x + 46 + index * (cardW + gap);
      return `
        ${rect({ x: ix, y: y + 42, w: cardW, h: 188, r: 24, fill: COLORS.panel })}
        ${icon(item.icon, ix + 28, y + 58, item.color)}
        ${text({ x: ix + cardW / 2, y: y + 205, value: item.label, size: 24, weight: 900, fill: COLORS.navy, anchor: "middle" })}
        ${index < items.length - 1 ? arrow({ x1: ix + cardW + 10, y1: y + 136, x2: ix + cardW + gap - 14, y2: y + 136, color: COLORS.cyan }) : ""}
      `;
    }).join("")}
  `;
}

function sidePanel(spec) {
  return `
    ${rect({ x: 1135, y: 300, w: 290, h: 320, r: 30, fill: COLORS.panel })}
    ${icon(spec.icon || "chart", 1210, 332, spec.accent || COLORS.blue)}
    ${text({ x: 1280, y: 508, value: spec.panelTitle, size: 34, weight: 900, fill: COLORS.navy, anchor: "middle" })}
    ${text({ x: 1280, y: 554, value: spec.panelMetric, size: 26, weight: 900, fill: spec.accent || COLORS.green, anchor: "middle" })}
    ${text({ x: 1280, y: 592, value: spec.panelNote, size: 22, weight: 800, fill: COLORS.slate, anchor: "middle" })}
  `;
}

function mainGraphic(spec) {
  if (spec.kind === "bands") return bands(spec);
  if (spec.kind === "status") return statusCards(spec);
  if (spec.kind === "checks") return checks(spec);
  if (spec.kind === "flow") return flow(spec);
  return bars(spec);
}

function renderSvg(spec) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      ${background()}
      ${header(spec)}
      ${mainGraphic(spec)}
      ${sidePanel(spec)}
      ${metricCards(spec.cards || [])}
    </svg>
  `;
}

const imageSets = [
  {
    slug: "cash-100m-200m-300m-apartment-budget",
    items: [
      {
        file: "cover.png",
        cover: true,
        title: "Cash Budget",
        keyword: "DSR / LTV / Safe Range",
        panelTitle: "Budget",
        panelMetric: "Input based",
        panelNote: "KRW simulation",
        icon: "cash",
        kind: "bars",
        data: [
          { label: "Cash", value: 100, valueText: "100M" },
          { label: "DSR", value: 80, valueText: "Input" },
          { label: "LTV", value: 70, valueText: "Ratio" },
          { label: "Range", value: 90, valueText: "80-90%" },
        ],
        cards: [
          { label: "Concept", value: "Cash + Loan" },
          { label: "Output", value: "Safe Range" },
          { label: "Next", value: "Dashboard", color: COLORS.green },
        ],
      },
      {
        file: "cover-en.png",
        cover: true,
        title: "Cash Budget",
        keyword: "DSR / LTV / Safe Range",
        panelTitle: "Budget",
        panelMetric: "Input based",
        panelNote: "KRW simulation",
        icon: "cash",
        kind: "bars",
        data: [
          { label: "Cash", value: 100, valueText: "100M" },
          { label: "DSR", value: 80, valueText: "Input" },
          { label: "LTV", value: 70, valueText: "Ratio" },
          { label: "Range", value: 90, valueText: "80-90%" },
        ],
        cards: [
          { label: "Concept", value: "Cash + Loan" },
          { label: "Output", value: "Safe Range" },
          { label: "Next", value: "Dashboard", color: COLORS.green },
        ],
      },
      {
        file: "img1.png",
        title: "현금별 예산",
        keyword: "Cash / LTV / Cost",
        panelTitle: "비교",
        panelMetric: "상한 변화",
        panelNote: "입력값 기준",
        icon: "cash",
        kind: "bars",
        data: [
          { label: "1억", value: 286, valueText: "2.86억" },
          { label: "2억", value: 571, valueText: "5.71억" },
          { label: "3억", value: 598, valueText: "5.98억", color: COLORS.green },
        ],
        cards: [
          { label: "Input", value: "보유현금" },
          { label: "Limit", value: "현금/LTV" },
          { label: "Check", value: "DSR 병목", color: COLORS.green },
        ],
      },
      {
        file: "img1-en.png",
        title: "Cash Budget",
        keyword: "Cash / LTV / Costs",
        panelTitle: "Compare",
        panelMetric: "Price limit",
        panelNote: "Input based",
        icon: "cash",
        kind: "bars",
        data: [
          { label: "100M", value: 286, valueText: "286M" },
          { label: "200M", value: 571, valueText: "571M" },
          { label: "300M", value: 598, valueText: "598M", color: COLORS.green },
        ],
        cards: [
          { label: "Input", value: "Cash" },
          { label: "Limit", value: "Cash/LTV" },
          { label: "Check", value: "DSR", color: COLORS.green },
        ],
      },
      {
        file: "img2.png",
        title: "안전 탐색 밴드",
        keyword: "Safe Range 80-90%",
        panelTitle: "범위",
        panelMetric: "80-90%",
        panelNote: "대시보드 확인",
        icon: "dashboard",
        kind: "bands",
        data: [
          { label: "1억", low: 229, high: 257, caption: "2.29억-2.57억", color: COLORS.blue },
          { label: "2억", low: 457, high: 514, caption: "4.57억-5.14억", color: COLORS.green },
          { label: "3억", low: 479, high: 539, caption: "4.79억-5.39억", color: COLORS.amber },
        ],
        cards: [
          { label: "Range", value: "80-90%" },
          { label: "Use", value: "실거래 비교" },
          { label: "Next", value: "Dashboard", color: COLORS.green },
        ],
      },
      {
        file: "img2-en.png",
        title: "Safe Range",
        keyword: "80-90% search band",
        panelTitle: "Range",
        panelMetric: "80-90%",
        panelNote: "Dashboard check",
        icon: "dashboard",
        kind: "bands",
        data: [
          { label: "100M", low: 229, high: 257, caption: "229M-257M", color: COLORS.blue },
          { label: "200M", low: 457, high: 514, caption: "457M-514M", color: COLORS.green },
          { label: "300M", low: 479, high: 539, caption: "479M-539M", color: COLORS.amber },
        ],
        cards: [
          { label: "Range", value: "80-90%" },
          { label: "Use", value: "Transactions" },
          { label: "Next", value: "Dashboard", color: COLORS.green },
        ],
      },
      {
        file: "img3.png",
        title: "후보 가격 판정",
        keyword: "가능 / 주의 / 불가",
        panelTitle: "판정",
        panelMetric: "3조건",
        panelNote: "심사 보장 아님",
        icon: "check",
        kind: "status",
        items: [
          { label: "불가", sub: "현금 부족", color: COLORS.rose, icon: "home" },
          { label: "주의", sub: "경계값", color: COLORS.amber, icon: "home" },
          { label: "가능", sub: "입력값 통과", color: COLORS.green, icon: "check" },
        ],
        cards: [
          { label: "Target", value: "후보 집값" },
          { label: "Checks", value: "DSR/LTV/현금" },
          { label: "Note", value: "사전 점검", color: COLORS.green },
        ],
      },
      {
        file: "img3-en.png",
        title: "Target Check",
        keyword: "Pass / Caution / Fail",
        panelTitle: "Status",
        panelMetric: "3 checks",
        panelNote: "Not approval",
        icon: "check",
        kind: "status",
        items: [
          { label: "Fail", sub: "Cash gap", color: COLORS.rose, icon: "home" },
          { label: "Caution", sub: "Near limit", color: COLORS.amber, icon: "home" },
          { label: "Pass", sub: "Inputs pass", color: COLORS.green, icon: "check" },
        ],
        cards: [
          { label: "Target", value: "Home price" },
          { label: "Checks", value: "DSR/LTV/Cash" },
          { label: "Note", value: "Pre-check", color: COLORS.green },
        ],
      },
    ],
  },
  {
    slug: "dsr-pass-ltv-cash-bottleneck",
    items: [
      {
        file: "cover.png",
        cover: true,
        title: "DSR vs LTV vs Cash",
        keyword: "Bottleneck / Safe Range / Dashboard",
        panelTitle: "Bottleneck",
        panelMetric: "3 constraints",
        panelNote: "Input based",
        icon: "check",
        kind: "checks",
        items: [
          { label: "DSR", sub: "Monthly payment room", color: COLORS.blue },
          { label: "LTV", sub: "Loan-to-price ratio", color: COLORS.green },
          { label: "Cash", sub: "Down payment + costs", color: COLORS.amber },
        ],
        cards: [
          { label: "Question", value: "What fails first?" },
          { label: "Output", value: "Bottleneck" },
          { label: "Next", value: "Dashboard", color: COLORS.green },
        ],
      },
      {
        file: "cover-en.png",
        cover: true,
        title: "DSR vs LTV vs Cash",
        keyword: "Bottleneck / Safe Range / Dashboard",
        panelTitle: "Bottleneck",
        panelMetric: "3 constraints",
        panelNote: "Input based",
        icon: "check",
        kind: "checks",
        items: [
          { label: "DSR", sub: "Monthly payment room", color: COLORS.blue },
          { label: "LTV", sub: "Loan-to-price ratio", color: COLORS.green },
          { label: "Cash", sub: "Down payment + costs", color: COLORS.amber },
        ],
        cards: [
          { label: "Question", value: "What fails first?" },
          { label: "Output", value: "Bottleneck" },
          { label: "Next", value: "Dashboard", color: COLORS.green },
        ],
      },
      {
        file: "img1.png",
        title: "3조건 체크",
        keyword: "DSR / LTV / 현금",
        panelTitle: "조건",
        panelMetric: "각각 확인",
        panelNote: "입력값 기준",
        icon: "check",
        kind: "checks",
        items: [
          { label: "DSR", sub: "월상환 여력", color: COLORS.blue },
          { label: "LTV", sub: "집값 대비 대출", color: COLORS.green },
          { label: "현금", sub: "자기자본 + 비용", color: COLORS.amber },
        ],
        cards: [
          { label: "Check 1", value: "월상환" },
          { label: "Check 2", value: "대출비율" },
          { label: "Check 3", value: "현금", color: COLORS.green },
        ],
      },
      {
        file: "img1-en.png",
        title: "Three Checks",
        keyword: "DSR / LTV / Cash",
        panelTitle: "Checks",
        panelMetric: "Separate",
        panelNote: "Input based",
        icon: "check",
        kind: "checks",
        items: [
          { label: "DSR", sub: "Payment room", color: COLORS.blue },
          { label: "LTV", sub: "Loan ratio", color: COLORS.green },
          { label: "Cash", sub: "Down payment + costs", color: COLORS.amber },
        ],
        cards: [
          { label: "Check 1", value: "Payment" },
          { label: "Check 2", value: "Loan ratio" },
          { label: "Check 3", value: "Cash", color: COLORS.green },
        ],
      },
      {
        file: "img2.png",
        title: "샘플 A-D",
        keyword: "Bottleneck patterns",
        panelTitle: "패턴",
        panelMetric: "A-D",
        panelNote: "검증 샘플",
        icon: "chart",
        kind: "bars",
        data: [
          { label: "A", value: 571, valueText: "현금/LTV", color: COLORS.green },
          { label: "B", value: 310, valueText: "DSR", color: COLORS.blue },
          { label: "C", value: 222, valueText: "현금/LTV", color: COLORS.amber },
          { label: "D", value: 857, valueText: "가능", color: COLORS.green },
        ],
        cards: [
          { label: "A", value: "주의" },
          { label: "B/C", value: "불가" },
          { label: "D", value: "가능", color: COLORS.green },
        ],
      },
      {
        file: "img2-en.png",
        title: "Samples A-D",
        keyword: "Bottleneck patterns",
        panelTitle: "Patterns",
        panelMetric: "A-D",
        panelNote: "Verified inputs",
        icon: "chart",
        kind: "bars",
        data: [
          { label: "A", value: 571, valueText: "Cash/LTV", color: COLORS.green },
          { label: "B", value: 310, valueText: "DSR", color: COLORS.blue },
          { label: "C", value: 222, valueText: "Cash/LTV", color: COLORS.amber },
          { label: "D", value: 857, valueText: "Pass", color: COLORS.green },
        ],
        cards: [
          { label: "A", value: "Caution" },
          { label: "B/C", value: "Fail" },
          { label: "D", value: "Pass", color: COLORS.green },
        ],
      },
      {
        file: "img3.png",
        title: "계산 후 확인",
        keyword: "Calculator to Dashboard",
        panelTitle: "흐름",
        panelMetric: "계산→실거래",
        panelNote: "사전 점검",
        icon: "dashboard",
        kind: "flow",
        items: [
          { label: "입력", icon: "cash", color: COLORS.blue },
          { label: "판정", icon: "check", color: COLORS.green },
          { label: "범위", icon: "chart", color: COLORS.amber },
          { label: "실거래", icon: "dashboard", color: COLORS.cyan },
        ],
        cards: [
          { label: "Step 1", value: "계산기" },
          { label: "Step 2", value: "Safe Range" },
          { label: "Step 3", value: "Dashboard", color: COLORS.green },
        ],
      },
      {
        file: "img3-en.png",
        title: "From Calculator",
        keyword: "Calculator to Dashboard",
        panelTitle: "Flow",
        panelMetric: "Calc→Market",
        panelNote: "Pre-check",
        icon: "dashboard",
        kind: "flow",
        items: [
          { label: "Inputs", icon: "cash", color: COLORS.blue },
          { label: "Status", icon: "check", color: COLORS.green },
          { label: "Range", icon: "chart", color: COLORS.amber },
          { label: "Deals", icon: "dashboard", color: COLORS.cyan },
        ],
        cards: [
          { label: "Step 1", value: "Calculator" },
          { label: "Step 2", value: "Safe Range" },
          { label: "Step 3", value: "Dashboard", color: COLORS.green },
        ],
      },
    ],
  },
];

async function writePng(slug, item) {
  const outDir = path.join(OUT_ROOT, slug);
  fs.mkdirSync(outDir, { recursive: true });
  const svg = renderSvg(item);
  const outPath = path.join(outDir, item.file);
  await sharp(Buffer.from(svg)).resize(WIDTH, HEIGHT).png({ compressionLevel: 9 }).toFile(outPath);
  return outPath;
}

async function main() {
  const written = [];
  for (const set of imageSets) {
    for (const item of set.items) {
      written.push(await writePng(set.slug, item));
    }
  }

  for (const file of written) {
    console.log(path.relative(process.cwd(), file).replace(/\\/g, "/"));
  }
  console.log(`generated=${written.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
