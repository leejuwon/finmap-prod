const fs = require("fs");
const path = require("path");

const W = 1200;
const H = 675;
const FONT = "Arial, 'Noto Sans KR', sans-serif";

const markdownFiles = [
  "content/posts/personalFinance/ko/how-much-monthly-invest-for-100m.md",
  "content/posts/personalFinance/en/how-much-to-invest-monthly-for-target-portfolio.md",
  "content/posts/personalFinance/ko/dca-vs-lump-sum-when-results-differ.md",
  "content/posts/personalFinance/en/dca-vs-lump-sum-when-results-differ.md",
  "content/posts/personalFinance/ko/is-dca-better-in-bear-market.md",
  "content/posts/personalFinance/en/is-dca-better-in-a-bear-market.md",
];

const themes = {
  target: {
    bg: "#eef7ff",
    bg2: "#f8fbff",
    card: "#ffffff",
    title: "#102033",
    muted: "#5d6b7c",
    line: "#c9dcf4",
    accent: "#2563eb",
    accent2: "#10b981",
    accent3: "#f59e0b",
    soft: "#dbeafe",
    soft2: "#dcfce7",
  },
  compare: {
    bg: "#f4f7fb",
    bg2: "#fbfcff",
    card: "#ffffff",
    title: "#172033",
    muted: "#64748b",
    line: "#d7dee9",
    accent: "#0f766e",
    accent2: "#2563eb",
    accent3: "#f59e0b",
    soft: "#ccfbf1",
    soft2: "#dbeafe",
  },
  bear: {
    bg: "#f7f5ef",
    bg2: "#fffdf7",
    card: "#ffffff",
    title: "#1f2937",
    muted: "#6b7280",
    line: "#e5dccb",
    accent: "#dc2626",
    accent2: "#2563eb",
    accent3: "#16a34a",
    soft: "#fee2e2",
    soft2: "#dcfce7",
  },
};

const entries = [
  {
    imagePath: "/images/posts/how-much-monthly-invest-for-100m/cover.svg",
    theme: "target",
    layout: "targetCover",
    lang: "ko",
    title: "1억원 목표",
    subtitle: "월 납입금 계획",
    badge: "DCA 목표",
    note: "KO target portfolio cover",
  },
  {
    imagePath: "/images/posts/how-much-monthly-invest-for-100m/img1.svg",
    theme: "target",
    layout: "timeCards",
    lang: "ko",
    title: "기간별 월 납입금",
    subtitle: "5Y / 10Y / 15Y / 20Y",
    badge: "기간 비교",
    note: "KO contribution by horizon",
  },
  {
    imagePath: "/images/posts/how-much-monthly-invest-for-100m/img2.svg",
    theme: "target",
    layout: "progressGauge",
    lang: "ko",
    title: "목표 달성률",
    subtitle: "현재 조건과 부족액",
    badge: "목표 진행",
    note: "KO target progress gauge",
  },
  {
    imagePath: "/images/posts/how-much-monthly-invest-for-100m/img3.svg",
    theme: "target",
    layout: "levers",
    lang: "ko",
    title: "목표 조정 방법",
    subtitle: "기간 · 수익률 · 월 납입금",
    badge: "세 가지 변수",
    note: "KO target levers",
  },
  {
    imagePath: "/images/posts/how-much-to-invest-monthly-for-target-portfolio/cover.svg",
    theme: "target",
    layout: "targetCover",
    lang: "en",
    title: "Target Portfolio",
    subtitle: "Monthly plan",
    badge: "DCA goal",
    note: "EN target portfolio cover",
  },
  {
    imagePath: "/images/posts/how-much-to-invest-monthly-for-target-portfolio/img1.svg",
    theme: "target",
    layout: "timeCards",
    lang: "en",
    title: "Monthly Need",
    subtitle: "5Y / 10Y / 15Y / 20Y",
    badge: "Time horizon",
    note: "EN contribution by horizon",
  },
  {
    imagePath: "/images/posts/how-much-to-invest-monthly-for-target-portfolio/img2.svg",
    theme: "target",
    layout: "progressGauge",
    lang: "en",
    title: "Goal Progress",
    subtitle: "Projected gap",
    badge: "Target check",
    note: "EN goal progress gauge",
  },
  {
    imagePath: "/images/posts/how-much-to-invest-monthly-for-target-portfolio/img3.svg",
    theme: "target",
    layout: "levers",
    lang: "en",
    title: "Three Levers",
    subtitle: "Time · return · contribution",
    badge: "Plan levers",
    note: "EN target levers",
  },
  {
    imagePath: "/images/posts/dca-vs-lump-sum-when-results-differ/cover.svg",
    theme: "compare",
    layout: "scaleCover",
    lang: "ko",
    title: "DCA vs 일괄투자",
    subtitle: "같은 원금, 다른 시점",
    badge: "비교 계산",
    note: "KO DCA versus lump sum cover",
  },
  {
    imagePath: "/images/posts/dca-vs-lump-sum-when-results-differ/img1.svg",
    theme: "compare",
    layout: "marketPaths",
    lang: "ko",
    title: "시장별 차이",
    subtitle: "상승 · 하락 · 횡보",
    badge: "경로 비교",
    note: "KO market paths",
  },
  {
    imagePath: "/images/posts/dca-vs-lump-sum-when-results-differ/img2.svg",
    theme: "compare",
    layout: "comparisonTable",
    lang: "ko",
    title: "핵심 비교",
    subtitle: "시점 · 평균단가 · 부담",
    badge: "비교표",
    note: "KO key differences",
  },
  {
    imagePath: "/images/posts/dca-vs-lump-sum-when-results-differ/img3.svg",
    theme: "compare",
    layout: "outcomeGap",
    lang: "ko",
    title: "결과 비교",
    subtitle: "DCA와 일괄투자 차이",
    badge: "결과 해석",
    note: "KO outcome gap",
  },
  {
    imagePath: "/images/posts/dca-vs-lump-sum-when-results-differ/cover-en.svg",
    theme: "compare",
    layout: "scaleCover",
    lang: "en",
    title: "DCA vs Lump Sum",
    subtitle: "Same principal, different timing",
    badge: "Comparison",
    note: "EN DCA versus lump sum cover",
  },
  {
    imagePath: "/images/posts/dca-vs-lump-sum-when-results-differ/img1-en.svg",
    theme: "compare",
    layout: "marketPaths",
    lang: "en",
    title: "Market Paths",
    subtitle: "Rising · falling · sideways",
    badge: "Path effect",
    note: "EN market paths",
  },
  {
    imagePath: "/images/posts/dca-vs-lump-sum-when-results-differ/img2-en.svg",
    theme: "compare",
    layout: "comparisonTable",
    lang: "en",
    title: "Key Differences",
    subtitle: "Timing · cost · behavior",
    badge: "Side by side",
    note: "EN key differences",
  },
  {
    imagePath: "/images/posts/dca-vs-lump-sum-when-results-differ/img3-en.svg",
    theme: "compare",
    layout: "outcomeGap",
    lang: "en",
    title: "Outcome Gap",
    subtitle: "Compare the ending value",
    badge: "Result view",
    note: "EN outcome gap",
  },
  {
    imagePath: "/images/posts/is-dca-better-in-bear-market/cover.svg",
    theme: "bear",
    layout: "bearCover",
    lang: "ko",
    title: "하락장 DCA",
    subtitle: "가격 충격과 적립 효과",
    badge: "하락장 시나리오",
    note: "KO bear market cover",
  },
  {
    imagePath: "/images/posts/is-dca-better-in-bear-market/img1.svg",
    theme: "bear",
    layout: "scenarioCards",
    lang: "ko",
    title: "4가지 시나리오",
    subtitle: "기본 · 초반 · 중간 · 마지막",
    badge: "경로 비교",
    note: "KO four scenarios",
  },
  {
    imagePath: "/images/posts/is-dca-better-in-bear-market/img2.svg",
    theme: "bear",
    layout: "averageCost",
    lang: "ko",
    title: "평균단가 효과",
    subtitle: "낮은 가격에서 더 많은 수량",
    badge: "수량 구조",
    note: "KO average cost effect",
  },
  {
    imagePath: "/images/posts/is-dca-better-in-bear-market/img3.svg",
    theme: "bear",
    layout: "mddFinal",
    lang: "ko",
    title: "MDD와 최종자산",
    subtitle: "낙폭과 목표 시점",
    badge: "결과 해석",
    note: "KO MDD and final value",
  },
  {
    imagePath: "/images/posts/is-dca-better-in-a-bear-market/cover.svg",
    theme: "bear",
    layout: "bearCover",
    lang: "en",
    title: "Bear Market DCA",
    subtitle: "Price shock and monthly buying",
    badge: "Scenario view",
    note: "EN bear market cover",
  },
  {
    imagePath: "/images/posts/is-dca-better-in-a-bear-market/img1.svg",
    theme: "bear",
    layout: "scenarioCards",
    lang: "en",
    title: "4 Scenarios",
    subtitle: "Base · early · mid · final",
    badge: "Path comparison",
    note: "EN four scenarios",
  },
  {
    imagePath: "/images/posts/is-dca-better-in-a-bear-market/img2.svg",
    theme: "bear",
    layout: "averageCost",
    lang: "en",
    title: "Average Cost",
    subtitle: "More units at lower prices",
    badge: "Unit effect",
    note: "EN average cost effect",
  },
  {
    imagePath: "/images/posts/is-dca-better-in-a-bear-market/img3.svg",
    theme: "bear",
    layout: "mddFinal",
    lang: "en",
    title: "MDD & Final Value",
    subtitle: "Drawdown and ending value",
    badge: "Read results",
    note: "EN MDD and final value",
  },
];

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function round(value) {
  return Number(value).toFixed(1).replace(/\.0$/, "");
}

function uid(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-");
}

function outputPathFromImagePath(imagePath) {
  return path.join("public", imagePath.replace(/^\//, ""));
}

function rect(x, y, width, height, fill, options = {}) {
  const {
    rx = 20,
    stroke = "none",
    strokeWidth = 1,
    opacity = 1,
    filter = "",
    extra = "",
  } = options;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"${filter ? ` filter="${filter}"` : ""}${extra ? ` ${extra}` : ""}/>`;
}

function text(x, y, content, options = {}) {
  const {
    size = 28,
    weight = 600,
    fill = "#111827",
    anchor = "start",
    opacity = 1,
    letterSpacing = 0,
    extra = "",
  } = options;
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" opacity="${opacity}" letter-spacing="${letterSpacing}"${extra ? ` ${extra}` : ""}>${esc(content)}</text>`;
}

function labelText(x, y, content, theme, options = {}) {
  return text(x, y, content, {
    size: options.size || 20,
    weight: options.weight || 600,
    fill: options.fill || theme.muted,
    anchor: options.anchor || "start",
  });
}

function drawBackground(theme, id) {
  const lines = [];
  lines.push(`<rect width="${W}" height="${H}" fill="url(#bg-${id})"/>`);
  for (let i = 0; i < 9; i += 1) {
    const x = 70 + i * 132;
    lines.push(`<line x1="${x}" y1="46" x2="${x - 74}" y2="640" stroke="${theme.line}" stroke-width="1" opacity="0.34"/>`);
  }
  lines.push(`<circle cx="1040" cy="116" r="98" fill="${theme.soft}" opacity="0.42"/>`);
  lines.push(`<circle cx="1060" cy="560" r="138" fill="${theme.soft2}" opacity="0.32"/>`);
  lines.push(`<path d="M72 586 C270 520 330 620 536 548 C720 484 846 540 1120 478" fill="none" stroke="${theme.line}" stroke-width="3" opacity="0.38"/>`);
  return lines.join("\n");
}

function drawHeader(entry, theme) {
  return [
    drawBadge(78, 58, entry.badge, theme),
    text(78, 130, entry.title, { size: entry.lang === "ko" ? 54 : 50, weight: 800, fill: theme.title }),
    text(82, 174, entry.subtitle, { size: 24, weight: 600, fill: theme.muted }),
  ].join("\n");
}

function drawBadge(x, y, content, theme) {
  const width = Math.max(128, content.length * 13 + 36);
  return [
    rect(x, y, width, 38, theme.card, { rx: 19, stroke: theme.line, filter: "url(#softShadow)" }),
    `<circle cx="${x + 23}" cy="${y + 19}" r="7" fill="${theme.accent}"/>`,
    text(x + 40, y + 25, content, { size: 16, weight: 700, fill: theme.muted }),
  ].join("\n");
}

function drawCard(x, y, width, height, theme, options = {}) {
  return rect(x, y, width, height, options.fill || theme.card, {
    rx: options.rx || 28,
    stroke: options.stroke || "#e5edf7",
    strokeWidth: options.strokeWidth || 1,
    filter: options.filter === false ? "" : "url(#cardShadow)",
    opacity: options.opacity == null ? 1 : options.opacity,
  });
}

function drawCoin(cx, cy, r, theme, options = {}) {
  return [
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${options.fill || theme.accent3}" opacity="${options.opacity || 1}"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${Math.max(1, r - 6)}" fill="none" stroke="#fff7d6" stroke-width="3" opacity="0.75"/>`,
  ].join("\n");
}

function drawCoins(x, y, theme) {
  const rows = [
    [x + 18, y + 70, 29],
    [x + 58, y + 50, 29],
    [x + 98, y + 72, 29],
    [x + 140, y + 42, 31],
    [x + 178, y + 76, 28],
  ];
  return rows.map(([cx, cy, r]) => drawCoin(cx, cy, r, theme)).join("\n");
}

function drawTargetIcon(cx, cy, r, theme) {
  return [
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${theme.soft}" stroke="${theme.accent}" stroke-width="7"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${r * 0.63}" fill="#ffffff" stroke="${theme.accent2}" stroke-width="6"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${r * 0.32}" fill="${theme.soft2}" stroke="${theme.accent}" stroke-width="6"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${r * 0.11}" fill="${theme.accent}"/>`,
    `<path d="M${cx + r * 0.18} ${cy - r * 0.18} L${cx + r * 0.82} ${cy - r * 0.82}" stroke="${theme.title}" stroke-width="7" stroke-linecap="round"/>`,
    `<path d="M${cx + r * 0.74} ${cy - r * 0.96} L${cx + r * 0.9} ${cy - r * 0.82} L${cx + r * 0.74} ${cy - r * 0.72} Z" fill="${theme.title}"/>`,
  ].join("\n");
}

function drawScaleIcon(x, y, theme) {
  return [
    `<line x1="${x + 210}" y1="${y + 54}" x2="${x + 210}" y2="${y + 248}" stroke="${theme.title}" stroke-width="12" stroke-linecap="round"/>`,
    `<line x1="${x + 78}" y1="${y + 92}" x2="${x + 342}" y2="${y + 92}" stroke="${theme.title}" stroke-width="10" stroke-linecap="round"/>`,
    `<circle cx="${x + 210}" cy="${y + 88}" r="20" fill="${theme.accent}"/>`,
    `<path d="M${x + 94} ${y + 116} L${x + 44} ${y + 214} H${x + 144} Z" fill="${theme.soft}" stroke="${theme.accent}" stroke-width="5"/>`,
    `<path d="M${x + 326} ${y + 116} L${x + 276} ${y + 214} H${x + 376} Z" fill="${theme.soft2}" stroke="${theme.accent2}" stroke-width="5"/>`,
    `<rect x="${x + 156}" y="${y + 250}" width="108" height="24" rx="12" fill="${theme.title}"/>`,
  ].join("\n");
}

function drawShield(x, y, theme) {
  return [
    `<path d="M${x + 86} ${y} L${x + 164} ${y + 32} V${y + 108} C${x + 164} ${y + 168} ${x + 124} ${y + 204} ${x + 86} ${y + 224} C${x + 48} ${y + 204} ${x + 8} ${y + 168} ${x + 8} ${y + 108} V${y + 32} Z" fill="${theme.soft2}" stroke="${theme.accent2}" stroke-width="6"/>`,
    `<path d="M${x + 48} ${y + 112} L${x + 78} ${y + 142} L${x + 128} ${y + 78}" fill="none" stroke="${theme.accent2}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`,
  ].join("\n");
}

function drawBearIcon(x, y, theme) {
  return [
    `<circle cx="${x + 52}" cy="${y + 44}" r="28" fill="#8b5e3c"/>`,
    `<circle cx="${x + 148}" cy="${y + 44}" r="28" fill="#8b5e3c"/>`,
    `<ellipse cx="${x + 100}" cy="${y + 98}" rx="96" ry="78" fill="#9a6a43"/>`,
    `<ellipse cx="${x + 100}" cy="${y + 126}" rx="54" ry="34" fill="#f2d7bd"/>`,
    `<circle cx="${x + 68}" cy="${y + 88}" r="8" fill="#1f2937"/>`,
    `<circle cx="${x + 132}" cy="${y + 88}" r="8" fill="#1f2937"/>`,
    `<ellipse cx="${x + 100}" cy="${y + 112}" rx="12" ry="9" fill="#1f2937"/>`,
    `<path d="M${x + 82} ${y + 134} C${x + 96} ${y + 146} ${x + 116} ${y + 146} ${x + 130} ${y + 134}" fill="none" stroke="#1f2937" stroke-width="5" stroke-linecap="round"/>`,
  ].join("\n");
}

function drawGauge(cx, cy, r, progress, theme) {
  const pct = clamp(progress, 0, 1);
  const start = Math.PI;
  const end = Math.PI + Math.PI * pct;
  const x1 = cx - r;
  const y1 = cy;
  const x2 = cx + Math.cos(end) * r;
  const y2 = cy + Math.sin(end) * r;
  const large = pct > 0.5 ? 1 : 0;
  return [
    `<path d="M${x1} ${y1} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="#e5e7eb" stroke-width="28" stroke-linecap="round"/>`,
    `<path d="M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${round(x2)} ${round(y2)}" fill="none" stroke="${theme.accent}" stroke-width="28" stroke-linecap="round"/>`,
    `<circle cx="${cx}" cy="${cy}" r="16" fill="${theme.title}"/>`,
    text(cx, cy - 18, `${Math.round(pct * 100)}%`, { size: 48, weight: 800, fill: theme.title, anchor: "middle" }),
    text(cx, cy + 32, "progress", { size: 18, weight: 700, fill: theme.muted, anchor: "middle" }),
  ].join("\n");
}

function drawMiniBarChart(x, y, width, height, values, theme, labels = []) {
  const max = Math.max(...values, 1);
  const gap = 16;
  const barW = (width - gap * (values.length - 1)) / values.length;
  const parts = [
    `<line x1="${x}" y1="${y + height}" x2="${x + width}" y2="${y + height}" stroke="${theme.line}" stroke-width="3"/>`,
  ];
  values.forEach((value, index) => {
    const h = clamp((value / max) * (height - 24), 8, height - 12);
    const bx = x + index * (barW + gap);
    const by = y + height - h;
    parts.push(`<rect x="${round(bx)}" y="${round(by)}" width="${round(barW)}" height="${round(h)}" rx="10" fill="${index % 2 ? theme.accent2 : theme.accent}" opacity="${index === 0 ? 0.72 : 0.94}"/>`);
    if (labels[index]) parts.push(text(bx + barW / 2, y + height + 32, labels[index], { size: 17, weight: 700, fill: theme.muted, anchor: "middle" }));
  });
  return `<g>${parts.join("\n")}</g>`;
}

function drawMiniLineChart(ctx, idBase, x, y, width, height, seriesList, theme, options = {}) {
  const id = `clip-${uid(idBase)}-${ctx.chartCount++}`;
  const padding = 10;
  const plot = {
    x: x + padding,
    y: y + padding,
    width: width - padding * 2,
    height: height - padding * 2,
  };
  const flat = seriesList.flatMap((series) => series.values).filter(Number.isFinite);
  let min = Math.min(...flat);
  let max = Math.max(...flat);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const range = max - min;
  ctx.defs.push(`<clipPath id="${id}"><rect x="${plot.x}" y="${plot.y}" width="${plot.width}" height="${plot.height}" rx="12"/></clipPath>`);
  const grid = [0.25, 0.5, 0.75].map((ratio) => {
    const gy = plot.y + plot.height * ratio;
    return `<line x1="${plot.x}" y1="${round(gy)}" x2="${plot.x + plot.width}" y2="${round(gy)}" stroke="${theme.line}" stroke-width="1.2" opacity="0.65"/>`;
  }).join("\n");
  const axis = [
    `<line x1="${plot.x}" y1="${plot.y + plot.height}" x2="${plot.x + plot.width}" y2="${plot.y + plot.height}" stroke="${theme.line}" stroke-width="2"/>`,
    `<line x1="${plot.x}" y1="${plot.y}" x2="${plot.x}" y2="${plot.y + plot.height}" stroke="${theme.line}" stroke-width="2"/>`,
  ].join("\n");
  const lines = seriesList.map((series, seriesIndex) => {
    const values = series.values;
    const points = values.map((value, index) => {
      const xRatio = values.length <= 1 ? 0.5 : index / (values.length - 1);
      const yRatio = (value - min) / range;
      const px = clamp(plot.x + xRatio * plot.width, plot.x, plot.x + plot.width);
      const py = clamp(plot.y + plot.height - yRatio * plot.height, plot.y, plot.y + plot.height);
      return `${round(px)},${round(py)}`;
    }).join(" ");
    const color = series.color || [theme.accent, theme.accent2, theme.accent3][seriesIndex % 3];
    return [
      `<polyline data-chart-line="1" data-plot="${plot.x},${plot.y},${plot.width},${plot.height}" points="${points}" fill="none" stroke="${color}" stroke-width="${series.strokeWidth || 5}" stroke-linecap="round" stroke-linejoin="round" opacity="${series.opacity || 1}"/>`,
      ...(options.points === false ? [] : points.split(" ").map((pair) => {
        const [px, py] = pair.split(",");
        return `<circle cx="${px}" cy="${py}" r="4.5" fill="${color}" stroke="#ffffff" stroke-width="2"/>`;
      })),
    ].join("\n");
  }).join("\n");
  return [
    `<g data-chart="line">`,
    rect(x, y, width, height, "#ffffff", { rx: 22, stroke: theme.line, filter: "" }),
    grid,
    axis,
    `<g clip-path="url(#${id})">${lines}</g>`,
    `</g>`,
  ].join("\n");
}

function drawTitlePanel(entry, theme) {
  return [
    drawHeader(entry, theme),
    rect(80, 205, 360, 6, theme.accent, { rx: 3, opacity: 0.9 }),
  ].join("\n");
}

function renderTargetCover(ctx, entry, theme) {
  return [
    drawTitlePanel(entry, theme),
    drawCard(588, 82, 440, 394, theme),
    drawTargetIcon(808, 260, 122, theme),
    drawCoins(662, 344, theme),
    drawMiniBarChart(658, 382, 284, 92, [36, 58, 84, 116], theme, ["5Y", "10Y", "15Y", "20Y"]),
    drawCard(92, 278, 390, 270, theme),
    labelText(132, 330, entry.lang === "ko" ? "목표 금액" : "Target", theme),
    text(132, 388, entry.lang === "ko" ? "100M KRW" : "$ Goal", { size: 48, weight: 800, fill: theme.title }),
    labelText(132, 440, entry.lang === "ko" ? "월 납입금 역산" : "Required monthly", theme, { fill: theme.accent }),
    drawMiniLineChart(ctx, "target-cover", 132, 458, 300, 70, [{ values: [20, 34, 50, 72, 96], color: theme.accent2 }], theme, { points: false }),
  ].join("\n");
}

function renderTimeCards(ctx, entry, theme) {
  const cards = [
    ["5Y", "High", 82],
    ["10Y", "Mid", 62],
    ["15Y", "Low", 42],
    ["20Y", "Lower", 30],
  ];
  return [
    drawTitlePanel(entry, theme),
    ...cards.map(([year, label, bar], index) => {
      const x = 88 + index * 270;
      return [
        drawCard(x, 282, 232, 250, theme, { filter: "url(#cardShadow)" }),
        text(x + 34, 340, year, { size: 42, weight: 800, fill: theme.title }),
        labelText(x + 36, 378, label, theme),
        rect(x + 36, 428, 156, 18, "#edf2f7", { rx: 9 }),
        rect(x + 36, 428, bar * 1.56, 18, index === 0 ? theme.accent3 : theme.accent, { rx: 9 }),
        drawCoin(x + 70, 486, 22, theme),
        drawCoin(x + 112, 486, 22, theme, { fill: index < 2 ? theme.accent3 : theme.accent2 }),
        text(x + 160, 494, entry.lang === "ko" ? "월" : "mo", { size: 22, weight: 800, fill: theme.muted }),
      ].join("\n");
    }),
  ].join("\n");
}

function renderProgressGauge(ctx, entry, theme) {
  return [
    drawTitlePanel(entry, theme),
    drawCard(86, 244, 510, 314, theme),
    drawGauge(342, 446, 152, 0.78, theme),
    drawCard(650, 250, 210, 132, theme, { filter: "url(#cardShadow)" }),
    drawCard(892, 250, 210, 132, theme, { filter: "url(#cardShadow)" }),
    labelText(684, 303, entry.lang === "ko" ? "예상 자산" : "Projected", theme),
    text(684, 350, "78%", { size: 46, weight: 800, fill: theme.accent }),
    labelText(926, 303, entry.lang === "ko" ? "부족액" : "Gap", theme),
    text(926, 350, "22%", { size: 46, weight: 800, fill: theme.accent3 }),
    drawMiniLineChart(ctx, "progress", 660, 416, 420, 118, [{ values: [30, 42, 52, 63, 78], color: theme.accent2 }], theme),
  ].join("\n");
}

function renderLevers(ctx, entry, theme) {
  const items = entry.lang === "ko"
    ? [["기간", "Time"], ["수익률", "Return"], ["월 납입금", "Monthly"]]
    : [["Time", "Years"], ["Return", "Rate"], ["Contribution", "Monthly"]];
  const icons = [
    (x, y) => `<circle cx="${x + 62}" cy="${y + 62}" r="48" fill="${theme.soft}" stroke="${theme.accent}" stroke-width="5"/><line x1="${x + 62}" y1="${y + 62}" x2="${x + 62}" y2="${y + 32}" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round"/><line x1="${x + 62}" y1="${y + 62}" x2="${x + 90}" y2="${y + 80}" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round"/>`,
    (x, y) => `<path d="M${x + 16} ${y + 92} L${x + 50} ${y + 60} L${x + 78} ${y + 74} L${x + 112} ${y + 30}" fill="none" stroke="${theme.accent2}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${x + 112}" cy="${y + 30}" r="13" fill="${theme.accent2}"/>`,
    (x, y) => drawCoins(x + 4, y + 18, theme),
  ];
  return [
    drawTitlePanel(entry, theme),
    ...items.map(([main, sub], index) => {
      const x = 118 + index * 338;
      return [
        drawCard(x, 270, 284, 266, theme),
        icons[index](x + 78, 308),
        text(x + 34, 468, main, { size: 34, weight: 800, fill: theme.title }),
        labelText(x + 36, 505, sub, theme),
      ].join("\n");
    }),
  ].join("\n");
}

function renderScaleCover(ctx, entry, theme) {
  return [
    drawTitlePanel(entry, theme),
    drawCard(628, 94, 424, 364, theme),
    drawScaleIcon(630, 140, theme),
    drawCard(106, 292, 410, 218, theme),
    labelText(142, 344, entry.lang === "ko" ? "월별 투자" : "Monthly entries", theme),
    drawCoins(142, 370, theme),
    drawMiniBarChart(310, 365, 150, 92, [24, 34, 42, 52], theme),
    labelText(740, 524, entry.lang === "ko" ? "한 번에 투자" : "One upfront amount", theme, { anchor: "middle" }),
  ].join("\n");
}

function renderMarketPaths(ctx, entry, theme) {
  const labels = entry.lang === "ko" ? ["상승장", "하락장", "횡보장"] : ["Rising", "Falling", "Sideways"];
  const data = [
    [22, 34, 48, 66, 86],
    [82, 66, 42, 52, 62],
    [50, 54, 47, 52, 50],
  ];
  return [
    drawTitlePanel(entry, theme),
    ...labels.map((label, index) => {
      const x = 96 + index * 338;
      return [
        drawCard(x, 262, 286, 274, theme),
        text(x + 34, 318, label, { size: 31, weight: 800, fill: theme.title }),
        drawMiniLineChart(ctx, `market-${index}`, x + 32, 352, 222, 132, [{ values: data[index], color: [theme.accent2, theme.accent, theme.accent3][index] }], theme),
      ].join("\n");
    }),
  ].join("\n");
}

function renderComparisonTable(ctx, entry, theme) {
  const rows = entry.lang === "ko"
    ? [["시점", "나눠서", "처음에"], ["평균단가", "경로 영향", "초기 영향"], ["심리부담", "분산", "집중"]]
    : [["Timing", "Spread", "Upfront"], ["Avg cost", "Path", "Start"], ["Behavior", "Split", "Focus"]];
  return [
    drawTitlePanel(entry, theme),
    drawCard(124, 246, 952, 330, theme),
    rect(164, 292, 872, 60, theme.soft, { rx: 18, opacity: 0.9 }),
    text(218, 331, "DCA", { size: 28, weight: 800, fill: theme.accent }),
    text(710, 331, entry.lang === "ko" ? "일괄투자" : "Lump Sum", { size: 28, weight: 800, fill: theme.accent2 }),
    ...rows.map(([label, left, right], index) => {
      const y = 386 + index * 66;
      return [
        `<line x1="170" y1="${y - 24}" x2="1030" y2="${y - 24}" stroke="${theme.line}" stroke-width="1.5"/>`,
        text(196, y, label, { size: 23, weight: 800, fill: theme.title }),
        text(498, y, left, { size: 23, weight: 700, fill: theme.muted, anchor: "middle" }),
        text(816, y, right, { size: 23, weight: 700, fill: theme.muted, anchor: "middle" }),
      ].join("\n");
    }),
  ].join("\n");
}

function renderOutcomeGap(ctx, entry, theme) {
  return [
    drawTitlePanel(entry, theme),
    drawCard(104, 250, 452, 298, theme),
    text(150, 316, "DCA", { size: 34, weight: 800, fill: theme.accent }),
    drawMiniBarChart(154, 358, 322, 130, [74, 96], theme, [entry.lang === "ko" ? "적립" : "DCA", entry.lang === "ko" ? "일괄" : "Lump"]),
    drawCard(626, 250, 452, 298, theme),
    text(672, 316, entry.lang === "ko" ? "차이 확인" : "Gap view", { size: 34, weight: 800, fill: theme.title }),
    drawMiniLineChart(ctx, "outcome-gap", 674, 352, 336, 126, [
      { values: [28, 42, 56, 70, 86], color: theme.accent },
      { values: [40, 52, 66, 82, 104], color: theme.accent2 },
    ], theme, { points: false }),
    labelText(676, 512, entry.lang === "ko" ? "세후 자산 기준" : "After-tax value", theme),
  ].join("\n");
}

function renderBearCover(ctx, entry, theme) {
  return [
    drawTitlePanel(entry, theme),
    drawCard(612, 88, 456, 382, theme),
    drawMiniLineChart(ctx, "bear-cover", 660, 132, 336, 128, [{ values: [90, 82, 62, 48, 58, 72], color: theme.accent }], theme, { points: false }),
    drawBearIcon(690, 294, theme),
    drawShield(882, 272, theme),
    drawCard(104, 304, 390, 210, theme),
    labelText(142, 358, entry.lang === "ko" ? "가격 충격" : "Price shock", theme),
    text(142, 418, "-20%", { size: 58, weight: 800, fill: theme.accent }),
    labelText(142, 464, entry.lang === "ko" ? "시점별 결과 비교" : "Compare timing", theme, { fill: theme.accent2 }),
  ].join("\n");
}

function renderScenarioCards(ctx, entry, theme) {
  const labels = entry.lang === "ko"
    ? ["기본", "초반하락", "중간하락", "마지막하락"]
    : ["Base", "Early", "Mid", "Final"];
  const data = [
    [40, 48, 58, 70, 84],
    [46, 30, 42, 62, 82],
    [46, 56, 36, 54, 70],
    [44, 56, 68, 80, 54],
  ];
  return [
    drawTitlePanel(entry, theme),
    ...labels.map((label, index) => {
      const x = 84 + index * 278;
      return [
        drawCard(x, 272, 238, 260, theme),
        text(x + 28, 326, label, { size: 27, weight: 800, fill: theme.title }),
        drawMiniLineChart(ctx, `scenario-${index}`, x + 26, 360, 186, 124, [{ values: data[index], color: index === 0 ? theme.accent2 : theme.accent }], theme, { points: false }),
      ].join("\n");
    }),
  ].join("\n");
}

function renderAverageCost(ctx, entry, theme) {
  return [
    drawTitlePanel(entry, theme),
    drawCard(104, 272, 424, 246, theme),
    text(148, 334, entry.lang === "ko" ? "가격 낮음" : "Lower price", { size: 31, weight: 800, fill: theme.accent }),
    drawMiniLineChart(ctx, "avg-cost", 148, 370, 300, 90, [{ values: [86, 64, 42, 48, 58], color: theme.accent }], theme, { points: false }),
    drawCard(612, 272, 424, 246, theme),
    text(656, 334, entry.lang === "ko" ? "수량 증가" : "More units", { size: 31, weight: 800, fill: theme.accent2 }),
    drawCoins(656, 372, theme),
    `<path d="M520 394 C552 374 574 374 604 394" fill="none" stroke="${theme.title}" stroke-width="8" stroke-linecap="round"/>`,
    `<path d="M592 374 L618 394 L592 414 Z" fill="${theme.title}"/>`,
    labelText(654, 492, entry.lang === "ko" ? "같은 납입금, 더 많은 좌수" : "Same cash, more units", theme),
  ].join("\n");
}

function renderMddFinal(ctx, entry, theme) {
  return [
    drawTitlePanel(entry, theme),
    drawCard(104, 252, 430, 288, theme),
    text(150, 316, "MDD", { size: 42, weight: 800, fill: theme.accent }),
    drawMiniLineChart(ctx, "mdd", 150, 352, 308, 126, [{ values: [88, 78, 50, 58, 70, 64], color: theme.accent }], theme),
    labelText(154, 510, entry.lang === "ko" ? "고점 대비 낙폭" : "Peak-to-low drop", theme),
    drawCard(626, 252, 430, 288, theme),
    text(672, 316, entry.lang === "ko" ? "최종자산" : "Final Value", { size: 40, weight: 800, fill: theme.accent2 }),
    drawMiniBarChart(684, 354, 284, 132, [78, 62, 54], theme, [entry.lang === "ko" ? "기본" : "Base", entry.lang === "ko" ? "중간" : "Mid", entry.lang === "ko" ? "마지막" : "Final"]),
  ].join("\n");
}

const renderers = {
  targetCover: renderTargetCover,
  timeCards: renderTimeCards,
  progressGauge: renderProgressGauge,
  levers: renderLevers,
  scaleCover: renderScaleCover,
  marketPaths: renderMarketPaths,
  comparisonTable: renderComparisonTable,
  outcomeGap: renderOutcomeGap,
  bearCover: renderBearCover,
  scenarioCards: renderScenarioCards,
  averageCost: renderAverageCost,
  mddFinal: renderMddFinal,
};

function commonDefs(theme, id) {
  return [
    `<linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${theme.bg}"/><stop offset="1" stop-color="${theme.bg2}"/></linearGradient>`,
    `<filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.12"/></filter>`,
    `<filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.10"/></filter>`,
  ].join("\n");
}

function renderEntry(entry) {
  const theme = themes[entry.theme];
  const id = uid(entry.imagePath);
  const ctx = { defs: [], chartCount: 0 };
  const renderer = renderers[entry.layout];
  if (!renderer) throw new Error(`Unknown layout: ${entry.layout}`);
  const body = [
    drawBackground(theme, id),
    renderer(ctx, entry, theme),
  ].join("\n");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title-${id} desc-${id}">`,
    `<!-- Finmap DCA article SVG: ${esc(entry.note)} -->`,
    `<title id="title-${id}">${esc(entry.title)}</title>`,
    `<desc id="desc-${id}">${esc(entry.subtitle)}</desc>`,
    `<defs>`,
    commonDefs(theme, id),
    ctx.defs.join("\n"),
    `</defs>`,
    body,
    `</svg>`,
  ].join("\n");
}

function collectMarkdownImagePaths() {
  const found = new Set();
  for (const file of markdownFiles) {
    const content = fs.readFileSync(file, "utf8");
    const matches = content.match(/\/images\/posts\/[^"')\s]+\.(?:svg|png)/g) || [];
    matches.forEach((imagePath) => found.add(imagePath));
  }
  return [...found].sort();
}

function assertPathCoverage() {
  const markdownPaths = collectMarkdownImagePaths();
  const entryPaths = entries.map((entry) => entry.imagePath).sort();
  const missing = markdownPaths.filter((imagePath) => !entryPaths.includes(imagePath));
  const extra = entryPaths.filter((imagePath) => !markdownPaths.includes(imagePath));
  if (markdownPaths.length !== 24) {
    throw new Error(`Expected 24 unique markdown image paths, found ${markdownPaths.length}`);
  }
  if (missing.length || extra.length) {
    throw new Error([
      "Entry/image path mismatch.",
      missing.length ? `Missing entries:\n${missing.join("\n")}` : "",
      extra.length ? `Extra entries:\n${extra.join("\n")}` : "",
    ].filter(Boolean).join("\n"));
  }
}

function validateSvg(svg, entry) {
  const errors = [];
  if (!svg.includes(`width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"`)) {
    errors.push("missing 1200x675 viewBox shell");
  }
  if (/NaN|undefined|Infinity/.test(svg)) {
    errors.push("contains invalid numeric token");
  }
  if (svg.includes('data-chart="line"') && !svg.includes("<clipPath")) {
    errors.push("line chart without clipPath");
  }
  const polylineRegex = /<polyline[^>]*data-chart-line="1"[^>]*>/g;
  const polylines = svg.match(polylineRegex) || [];
  for (const line of polylines) {
    const plotMatch = line.match(/data-plot="([^"]+)"/);
    const pointsMatch = line.match(/points="([^"]+)"/);
    if (!plotMatch || !pointsMatch) {
      errors.push("chart polyline missing plot metadata or points");
      continue;
    }
    const [x, y, width, height] = plotMatch[1].split(",").map(Number);
    const points = pointsMatch[1].trim().split(/\s+/).map((pair) => pair.split(",").map(Number));
    for (const [px, py] of points) {
      if (px < x - 0.1 || px > x + width + 0.1 || py < y - 0.1 || py > y + height + 0.1) {
        errors.push(`chart point outside plot area: ${px},${py}`);
      }
    }
    if (!line.includes('stroke-linecap="round"') || !line.includes('stroke-linejoin="round"')) {
      errors.push("chart line missing round caps/joins");
    }
  }
  if (errors.length) {
    throw new Error(`${entry.imagePath}\n- ${errors.join("\n- ")}`);
  }
}

function writeAll() {
  assertPathCoverage();
  const written = [];
  for (const entry of entries) {
    const svg = renderEntry(entry);
    validateSvg(svg, entry);
    const outputPath = outputPathFromImagePath(entry.imagePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, svg, "utf8");
    written.push(outputPath);
  }
  return written;
}

function validateWrittenFiles(written) {
  if (written.length !== 24) throw new Error(`Expected 24 SVG files, wrote ${written.length}`);
  for (const file of written) {
    if (!fs.existsSync(file)) throw new Error(`Missing generated file: ${file}`);
    const svg = fs.readFileSync(file, "utf8");
    if (!svg.startsWith("<svg ")) throw new Error(`SVG does not start with <svg: ${file}`);
    if (!svg.includes('viewBox="0 0 1200 675"')) throw new Error(`Bad viewBox: ${file}`);
  }
}

const written = writeAll();
validateWrittenFiles(written);

console.log(`Generated ${written.length} DCA article SVG files.`);
for (const file of written) {
  console.log(`- ${file}`);
}
