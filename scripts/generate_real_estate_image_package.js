const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const WIDTH = 1600;
const HEIGHT = 900;
const OUT_ROOT = path.join(process.cwd(), "public", "images", "posts");

const palette = {
  bg: "#f7fbff",
  panel: "#ffffff",
  navy: "#102a43",
  blue: "#2563eb",
  cyan: "#0ea5e9",
  green: "#10b981",
  teal: "#14b8a6",
  mint: "#d1fae5",
  slate: "#64748b",
  line: "#dbeafe",
  softBlue: "#eff6ff",
  softGreen: "#ecfdf5",
  warn: "#f59e0b",
  warnSoft: "#fff7ed",
};

const topics = [
  {
    slug: "how-to-read-apartment-transaction-prices",
    cover: {
      file: "cover.png",
      kicker: "REAL ESTATE DATA",
      title: "MEDIAN · AVERAGE",
      line: "UNIT PRICE / VOLUME",
      type: "metrics",
    },
    coverEn: {
      file: "cover-en.png",
      kicker: "REAL ESTATE DATA",
      title: "MEDIAN · AVERAGE",
      line: "UNIT PRICE / VOLUME",
      type: "metrics",
    },
    images: [
      {
        file: "img1.png",
        title: "실거래 지표",
        line: "평균가 · 중앙값 · 평단가 · 거래량",
        type: "metrics",
      },
      {
        file: "img1-en.png",
        title: "Price Metrics",
        line: "Median · Average · Unit Price · Volume",
        type: "metrics",
      },
      {
        file: "img2.png",
        title: "평균 vs 중앙값",
        line: "고가 1건이 평균을 흔들 수 있음",
        type: "medianAverage",
      },
      {
        file: "img2-en.png",
        title: "Median vs Average",
        line: "One outlier can move the average",
        type: "medianAverage",
      },
      {
        file: "img3.png",
        title: "읽는 순서",
        line: "지역 → 기간 → 평형 → 가격 → 거래량",
        type: "readingOrder",
      },
      {
        file: "img3-en.png",
        title: "Reading Order",
        line: "Region → Period → Size → Price → Volume",
        type: "readingOrder",
      },
    ],
  },
  {
    slug: "apartment-transaction-volume-decline-meaning",
    cover: {
      file: "cover.png",
      kicker: "TRANSACTION VOLUME",
      title: "LIQUIDITY",
      line: "SAMPLE SIZE / PRICE SIGNAL",
      type: "volume",
    },
    coverEn: {
      file: "cover-en.png",
      kicker: "TRANSACTION VOLUME",
      title: "LIQUIDITY",
      line: "SAMPLE SIZE / PRICE SIGNAL",
      type: "volume",
    },
    images: [
      {
        file: "img1.png",
        title: "거래량 감소",
        line: "가격 예측보다 유동성 신호",
        type: "volume",
      },
      {
        file: "img1-en.png",
        title: "Falling Volume",
        line: "Liquidity signal before price forecast",
        type: "volume",
      },
      {
        file: "img2.png",
        title: "표본수 주의",
        line: "거래 1~2건은 평균을 왜곡할 수 있음",
        type: "sampleRisk",
      },
      {
        file: "img2-en.png",
        title: "Sample Risk",
        line: "Few deals can distort price metrics",
        type: "sampleRisk",
      },
      {
        file: "img3.png",
        title: "비교 기준",
        line: "전월 · 전년동월 · 최근 3~6개월",
        type: "periodCompare",
      },
      {
        file: "img3-en.png",
        title: "Compare Periods",
        line: "MoM · YoY · 3–6 Month View",
        type: "periodCompare",
      },
    ],
  },
  {
    slug: "large-apartment-complex-households-price-stability",
    cover: {
      file: "cover.png",
      kicker: "HOUSEHOLDS",
      title: "LARGE COMPLEX",
      line: "VOLUME / UNIT PRICE",
      type: "complex",
    },
    coverEn: {
      file: "cover-en.png",
      kicker: "HOUSEHOLDS",
      title: "LARGE COMPLEX",
      line: "VOLUME / UNIT PRICE",
      type: "complex",
    },
    images: [
      {
        file: "img1.png",
        title: "세대수와 표본",
        line: "대단지는 비교할 거래가 많을 수 있음",
        type: "complex",
      },
      {
        file: "img1-en.png",
        title: "Households & Samples",
        line: "Large complexes may provide more comparable deals",
        type: "complex",
      },
      {
        file: "img2.png",
        title: "대단지 착시",
        line: "평형 · 동 · 층 차이를 분리해서 보기",
        type: "complexMix",
      },
      {
        file: "img2-en.png",
        title: "Complex Mix",
        line: "Size, building, and floor can change prices",
        type: "complexMix",
      },
      {
        file: "img3.png",
        title: "비교 체크",
        line: "세대수 + 거래량 + 평단가 + 가격분포",
        type: "checklist",
      },
      {
        file: "img3-en.png",
        title: "Comparison Check",
        line: "Households + Volume + Unit Price + Distribution",
        type: "checklist",
      },
    ],
  },
];

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function header(spec) {
  if (!spec.kicker) {
    return `
      <text x="120" y="184" font-size="68" font-weight="900" fill="${palette.navy}">${esc(spec.title)}</text>
      <text x="120" y="252" font-size="34" font-weight="700" fill="${palette.slate}">${esc(spec.line)}</text>
    `;
  }

  return `
    <text x="120" y="132" font-size="30" font-weight="800" fill="${palette.blue}" letter-spacing="2">${esc(spec.kicker || "FINMAP DATA")}</text>
    <text x="120" y="212" font-size="66" font-weight="900" fill="${palette.navy}">${esc(spec.title)}</text>
    <text x="120" y="276" font-size="34" font-weight="700" fill="${palette.slate}">${esc(spec.line)}</text>
  `;
}

function card(x, y, w, h, radius = 26) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${palette.panel}" stroke="${palette.line}" stroke-width="3"/>`;
}

function miniMetric(x, y, label, value, color = palette.blue) {
  return `
    <g>
      <rect x="${x}" y="${y}" width="250" height="122" rx="24" fill="${palette.panel}" stroke="${palette.line}" stroke-width="3"/>
      <text x="${x + 28}" y="${y + 48}" font-size="24" font-weight="800" fill="${palette.slate}">${esc(label)}</text>
      <text x="${x + 28}" y="${y + 92}" font-size="34" font-weight="900" fill="${color}">${esc(value)}</text>
    </g>
  `;
}

function renderDashboardFrame() {
  return `
    <g transform="translate(800 150)">
      ${card(0, 0, 620, 520, 34)}
      <rect x="34" y="38" width="552" height="64" rx="20" fill="${palette.softBlue}"/>
      <circle cx="78" cy="70" r="12" fill="${palette.green}"/>
      <circle cx="118" cy="70" r="12" fill="${palette.cyan}"/>
      <circle cx="158" cy="70" r="12" fill="${palette.blue}"/>
      <rect x="54" y="138" width="232" height="36" rx="18" fill="${palette.mint}"/>
      <rect x="314" y="138" width="232" height="36" rx="18" fill="${palette.softBlue}"/>
      <rect x="52" y="214" width="92" height="210" rx="18" fill="${palette.blue}" opacity="0.85"/>
      <rect x="176" y="260" width="92" height="164" rx="18" fill="${palette.cyan}" opacity="0.88"/>
      <rect x="300" y="184" width="92" height="240" rx="18" fill="${palette.green}" opacity="0.9"/>
      <rect x="424" y="308" width="92" height="116" rx="18" fill="${palette.teal}" opacity="0.9"/>
      <path d="M 58 470 C 178 382, 250 398, 334 320 S 486 246, 544 286" fill="none" stroke="${palette.navy}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="58" cy="470" r="10" fill="${palette.navy}"/>
      <circle cx="334" cy="320" r="10" fill="${palette.navy}"/>
      <circle cx="544" cy="286" r="10" fill="${palette.navy}"/>
    </g>
  `;
}

function renderMetrics() {
  return `
    ${renderDashboardFrame()}
    <g transform="translate(120 370)">
      ${miniMetric(0, 0, "Median", "8.2", palette.blue)}
      ${miniMetric(280, 0, "Average", "8.6", palette.cyan)}
      ${miniMetric(0, 150, "Unit Price", "3.1", palette.green)}
      ${miniMetric(280, 150, "Volume", "42", palette.teal)}
      <g transform="translate(0 330)">
        <rect x="0" y="0" width="530" height="72" rx="24" fill="${palette.softGreen}" stroke="${palette.line}" stroke-width="3"/>
        <text x="34" y="46" font-size="28" font-weight="900" fill="${palette.navy}">Confidence meter</text>
        <rect x="300" y="24" width="170" height="24" rx="12" fill="#dbeafe"/>
        <rect x="300" y="24" width="126" height="24" rx="12" fill="${palette.green}"/>
      </g>
    </g>
  `;
}

function renderMedianAverage() {
  return `
    <g transform="translate(150 360)">
      ${card(0, 0, 580, 340, 30)}
      <text x="42" y="64" font-size="30" font-weight="900" fill="${palette.navy}">Normal deals</text>
      <rect x="64" y="112" width="330" height="42" rx="21" fill="${palette.blue}" opacity="0.88"/>
      <rect x="64" y="178" width="348" height="42" rx="21" fill="${palette.cyan}" opacity="0.88"/>
      <rect x="64" y="244" width="360" height="42" rx="21" fill="${palette.green}" opacity="0.88"/>
      <text x="448" y="144" font-size="26" font-weight="800" fill="${palette.slate}">8.0</text>
      <text x="448" y="210" font-size="26" font-weight="800" fill="${palette.slate}">8.1</text>
      <text x="448" y="276" font-size="26" font-weight="800" fill="${palette.slate}">8.2</text>
    </g>
    <g transform="translate(870 300)">
      ${card(0, 0, 520, 450, 30)}
      <text x="42" y="70" font-size="30" font-weight="900" fill="${palette.navy}">Outlier effect</text>
      <rect x="72" y="126" width="256" height="48" rx="24" fill="${palette.blue}" opacity="0.75"/>
      <rect x="72" y="208" width="384" height="48" rx="24" fill="${palette.warn}" opacity="0.9"/>
      <text x="72" y="320" font-size="34" font-weight="900" fill="${palette.blue}">Median</text>
      <text x="304" y="320" font-size="34" font-weight="900" fill="${palette.warn}">Average</text>
      <path d="M 234 352 L 280 390 L 326 352" fill="none" stroke="${palette.navy}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  `;
}

function renderReadingOrder() {
  const labels = ["Region", "Period", "Size", "Price", "Volume"];
  return `
    <g transform="translate(160 382)">
      ${labels
        .map((label, i) => {
          const x = i * 260;
          const color = [palette.blue, palette.cyan, palette.green, palette.teal, palette.navy][i];
          return `
            <g transform="translate(${x} 0)">
              <circle cx="72" cy="72" r="72" fill="${color}" opacity="0.95"/>
              <text x="72" y="84" text-anchor="middle" font-size="44" font-weight="900" fill="#fff">${i + 1}</text>
              <text x="72" y="184" text-anchor="middle" font-size="28" font-weight="900" fill="${palette.navy}">${label}</text>
              ${i < labels.length - 1 ? `<path d="M 156 72 L 224 72" stroke="${palette.line}" stroke-width="10" stroke-linecap="round"/>` : ""}
            </g>
          `;
        })
        .join("")}
    </g>
    ${renderDashboardFrame()}
  `;
}

function renderVolume() {
  return `
    <g transform="translate(150 342)">
      ${card(0, 0, 560, 360, 30)}
      <text x="44" y="64" font-size="30" font-weight="900" fill="${palette.navy}">Volume trend</text>
      ${[390, 310, 244, 164, 118].map((h, i) => {
        const x = 70 + i * 86;
        const y = 292 - h * 0.54;
        return `<rect x="${x}" y="${y}" width="54" height="${h * 0.54}" rx="18" fill="${i < 2 ? palette.blue : i < 4 ? palette.cyan : palette.green}" opacity="0.9"/>`;
      }).join("")}
      <path d="M 78 124 L 426 252" stroke="${palette.warn}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="78" cy="124" r="10" fill="${palette.warn}"/>
      <circle cx="426" cy="252" r="10" fill="${palette.warn}"/>
    </g>
    <g transform="translate(860 330)">
      ${card(0, 0, 520, 390, 30)}
      <text x="42" y="70" font-size="30" font-weight="900" fill="${palette.navy}">Liquidity gauge</text>
      <path d="M 110 260 A 150 150 0 0 1 410 260" fill="none" stroke="#dbeafe" stroke-width="34" stroke-linecap="round"/>
      <path d="M 110 260 A 150 150 0 0 1 260 110" fill="none" stroke="${palette.green}" stroke-width="34" stroke-linecap="round"/>
      <path d="M 260 110 A 150 150 0 0 1 352 166" fill="none" stroke="${palette.warn}" stroke-width="34" stroke-linecap="round"/>
      <line x1="260" y1="260" x2="338" y2="178" stroke="${palette.navy}" stroke-width="10" stroke-linecap="round"/>
      <circle cx="260" cy="260" r="16" fill="${palette.navy}"/>
      <text x="260" y="338" text-anchor="middle" font-size="30" font-weight="900" fill="${palette.slate}">Confidence check</text>
    </g>
  `;
}

function renderSampleRisk() {
  return `
    <g transform="translate(150 330)">
      ${card(0, 0, 520, 390, 30)}
      <text x="42" y="70" font-size="30" font-weight="900" fill="${palette.navy}">Few deals</text>
      <rect x="72" y="122" width="110" height="170" rx="24" fill="${palette.warn}" opacity="0.9"/>
      <rect x="214" y="210" width="110" height="82" rx="24" fill="${palette.blue}" opacity="0.9"/>
      <rect x="356" y="188" width="110" height="104" rx="24" fill="${palette.green}" opacity="0.9"/>
      <text x="126" y="342" text-anchor="middle" font-size="30" font-weight="900" fill="${palette.warn}">1</text>
      <text x="268" y="342" text-anchor="middle" font-size="30" font-weight="900" fill="${palette.blue}">2</text>
      <text x="410" y="342" text-anchor="middle" font-size="30" font-weight="900" fill="${palette.green}">3</text>
    </g>
    <g transform="translate(820 322)">
      ${card(0, 0, 560, 410, 30)}
      <rect x="48" y="54" width="464" height="92" rx="26" fill="${palette.warnSoft}" stroke="#fed7aa" stroke-width="3"/>
      <text x="86" y="112" font-size="36" font-weight="900" fill="${palette.warn}">Sample warning</text>
      <rect x="70" y="196" width="420" height="34" rx="17" fill="#dbeafe"/>
      <rect x="70" y="196" width="96" height="34" rx="17" fill="${palette.warn}"/>
      <rect x="70" y="268" width="420" height="34" rx="17" fill="#dbeafe"/>
      <rect x="70" y="268" width="276" height="34" rx="17" fill="${palette.green}"/>
      <text x="70" y="362" font-size="28" font-weight="900" fill="${palette.slate}">Expand period · compare peers</text>
    </g>
  `;
}

function renderPeriodCompare() {
  return `
    <g transform="translate(140 360)">
      ${["MoM", "YoY", "3–6M"].map((label, i) => {
        const x = i * 430;
        const color = [palette.blue, palette.green, palette.teal][i];
        return `
          <g transform="translate(${x} 0)">
            ${card(0, 0, 360, 310, 30)}
            <text x="48" y="76" font-size="42" font-weight="900" fill="${color}">${label}</text>
            <rect x="52" y="126" width="250" height="32" rx="16" fill="#dbeafe"/>
            <rect x="52" y="126" width="${120 + i * 58}" height="32" rx="16" fill="${color}"/>
            <rect x="52" y="198" width="250" height="32" rx="16" fill="#dbeafe"/>
            <rect x="52" y="198" width="${210 - i * 36}" height="32" rx="16" fill="${palette.cyan}"/>
          </g>
        `;
      }).join("")}
    </g>
  `;
}

function renderComplex() {
  return `
    <g transform="translate(130 330)">
      ${card(0, 0, 570, 390, 30)}
      <text x="44" y="70" font-size="30" font-weight="900" fill="${palette.navy}">Household filter</text>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${72 + i * 76}" y="${220 - i * 22}" width="52" height="${118 + i * 22}" rx="14" fill="${i % 2 ? palette.cyan : palette.blue}" opacity="0.9"/>`).join("")}
      <rect x="72" y="126" width="380" height="38" rx="19" fill="${palette.softGreen}" stroke="${palette.line}" stroke-width="2"/>
      <circle cx="414" cy="145" r="26" fill="${palette.green}"/>
      <text x="72" y="346" font-size="28" font-weight="900" fill="${palette.slate}">More comparable samples</text>
    </g>
    <g transform="translate(850 300)">
      ${card(0, 0, 500, 450, 30)}
      <text x="42" y="72" font-size="30" font-weight="900" fill="${palette.navy}">Complex view</text>
      <rect x="78" y="130" width="82" height="220" rx="12" fill="${palette.blue}"/>
      <rect x="190" y="98" width="82" height="252" rx="12" fill="${palette.cyan}"/>
      <rect x="302" y="150" width="82" height="200" rx="12" fill="${palette.green}"/>
      ${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${96 + c * 112}" y="${154 + r * 42}" width="26" height="20" rx="5" fill="#fff" opacity="0.92"/>`).join("")).join("")}
      <path d="M 70 380 L 410 380" stroke="${palette.line}" stroke-width="12" stroke-linecap="round"/>
    </g>
  `;
}

function renderComplexMix() {
  return `
    <g transform="translate(130 320)">
      ${card(0, 0, 620, 420, 30)}
      <text x="44" y="70" font-size="30" font-weight="900" fill="${palette.navy}">Inside one complex</text>
      <circle cx="142" cy="178" r="54" fill="${palette.blue}" opacity="0.9"/>
      <circle cx="310" cy="178" r="54" fill="${palette.green}" opacity="0.9"/>
      <circle cx="478" cy="178" r="54" fill="${palette.cyan}" opacity="0.9"/>
      <text x="142" y="188" text-anchor="middle" font-size="30" font-weight="900" fill="#fff">Size</text>
      <text x="310" y="188" text-anchor="middle" font-size="30" font-weight="900" fill="#fff">Bldg</text>
      <text x="478" y="188" text-anchor="middle" font-size="30" font-weight="900" fill="#fff">Floor</text>
      <path d="M 100 304 C 230 230, 330 372, 520 288" fill="none" stroke="${palette.navy}" stroke-width="8" stroke-linecap="round"/>
    </g>
    <g transform="translate(840 350)">
      ${card(0, 0, 520, 340, 30)}
      <text x="42" y="72" font-size="30" font-weight="900" fill="${palette.navy}">Separate signals</text>
      <rect x="62" y="130" width="400" height="36" rx="18" fill="#dbeafe"/>
      <rect x="62" y="130" width="240" height="36" rx="18" fill="${palette.blue}"/>
      <rect x="62" y="204" width="400" height="36" rx="18" fill="#dbeafe"/>
      <rect x="62" y="204" width="320" height="36" rx="18" fill="${palette.green}"/>
      <rect x="62" y="278" width="400" height="36" rx="18" fill="#dbeafe"/>
      <rect x="62" y="278" width="170" height="36" rx="18" fill="${palette.cyan}"/>
    </g>
  `;
}

function renderChecklist() {
  const items = ["Households", "Volume", "Unit price", "Distribution"];
  return `
    <g transform="translate(170 330)">
      ${card(0, 0, 560, 430, 30)}
      <text x="44" y="70" font-size="30" font-weight="900" fill="${palette.navy}">Checklist</text>
      ${items.map((item, i) => `
        <g transform="translate(58 ${122 + i * 72})">
          <circle cx="20" cy="20" r="20" fill="${[palette.blue, palette.green, palette.cyan, palette.teal][i]}"/>
          <path d="M 11 20 L 18 28 L 31 12" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="62" y="30" font-size="30" font-weight="900" fill="${palette.navy}">${item}</text>
        </g>
      `).join("")}
    </g>
    <g transform="translate(850 330)">
      ${card(0, 0, 500, 430, 30)}
      <text x="42" y="70" font-size="30" font-weight="900" fill="${palette.navy}">Compare</text>
      <rect x="72" y="128" width="140" height="210" rx="22" fill="${palette.blue}" opacity="0.9"/>
      <rect x="288" y="212" width="140" height="126" rx="22" fill="${palette.green}" opacity="0.9"/>
      <text x="142" y="386" text-anchor="middle" font-size="28" font-weight="900" fill="${palette.slate}">Large</text>
      <text x="358" y="386" text-anchor="middle" font-size="28" font-weight="900" fill="${palette.slate}">Small</text>
    </g>
  `;
}

function renderBody(type) {
  switch (type) {
    case "medianAverage":
      return renderMedianAverage();
    case "readingOrder":
      return renderReadingOrder();
    case "volume":
      return renderVolume();
    case "sampleRisk":
      return renderSampleRisk();
    case "periodCompare":
      return renderPeriodCompare();
    case "complex":
      return renderComplex();
    case "complexMix":
      return renderComplexMix();
    case "checklist":
      return renderChecklist();
    case "metrics":
    default:
      return renderMetrics();
  }
}

function renderSvg(spec) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" style="font-family: 'Malgun Gothic', 'Noto Sans KR', 'Segoe UI', Arial, sans-serif;">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${palette.bg}"/>
    <path d="M 0 742 C 250 690, 420 830, 690 750 S 1150 655, 1600 735 L 1600 900 L 0 900 Z" fill="#eef7ff"/>
    <path d="M 1140 0 L 1600 0 L 1600 360 C 1450 282, 1320 210, 1140 250 Z" fill="#ecfdf5"/>
    ${header(spec)}
    ${renderBody(spec.type)}
    <rect x="120" y="785" width="1360" height="2" fill="${palette.line}"/>
  </svg>`;
}

async function writePng(slug, spec) {
  const dir = path.join(OUT_ROOT, slug);
  fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, spec.file);
  const svg = renderSvg(spec);
  await sharp(Buffer.from(svg)).resize(WIDTH, HEIGHT).png({ compressionLevel: 9 }).toFile(outPath);
  return outPath;
}

async function main() {
  const outputs = [];
  for (const topic of topics) {
    outputs.push(await writePng(topic.slug, topic.cover));
    outputs.push(await writePng(topic.slug, topic.coverEn));
    for (const image of topic.images) {
      outputs.push(await writePng(topic.slug, image));
    }
  }

  console.log(`Generated ${outputs.length} PNG files`);
  for (const file of outputs) {
    const meta = await sharp(file).metadata();
    console.log(`${path.relative(process.cwd(), file)} ${meta.width}x${meta.height}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
