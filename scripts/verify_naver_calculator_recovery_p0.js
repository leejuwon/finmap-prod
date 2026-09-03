const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.finmaphub.com";

const TARGETS = [
  {
    label: "Compound",
    route: "/tools/compound-interest",
    titleIncludes: ["복리 계산기"],
    descIncludes: ["복리 계산기", "월복리", "미래가치"],
    h1Includes: ["복리 계산기"],
    bodyIncludes: ["복리 계산 방법", "월복리", "연복리", "적립식 투자"],
  },
  {
    label: "CAGR",
    route: "/tools/cagr-calculator",
    titleIncludes: ["CAGR 계산기"],
    descIncludes: ["CAGR", "연평균 수익률"],
    h1Includes: ["CAGR 계산기"],
    bodyIncludes: ["CAGR 공식", "CAGR 계산법", "연평균 수익률", "연평균 성장률"],
  },
  {
    label: "DCA",
    route: "/tools/dca-calculator",
    titleStartsWith: "DCA 계산기",
    titleIncludes: ["DCA 계산기", "적립식 투자"],
    descIncludes: ["매월 투자금", "ETF", "주식", "적립식 투자"],
    h1Includes: ["DCA 계산기"],
    bodyIncludes: ["DCA란", "DCA 시뮬레이터", "적립식 투자 계산기", "정액 분할 투자", "매월 투자"],
  },
];

const CONTROLS = [
  {
    label: "DSR/LTV control",
    route: "/tools/dsr-ltv-calculator",
    titleIncludes: ["LTV", "DSR", "계산기"],
    h1Includes: ["LTV", "DSR", "계산기"],
  },
  {
    label: "Mortgage control",
    route: "/tools/mortgage-loan-calculator",
    titleIncludes: ["주담대", "원리금", "계산기"],
    h1Includes: ["주담대", "원리금", "계산기"],
  },
];

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function resolveBuiltHtml(route) {
  const candidates = [
    `.next/server/pages/ko${route}.html`,
    `.next/server/pages${route}.html`,
    `.next/server/app/ko${route}.html`,
    `.next/server/app${route}.html`,
  ];

  for (const candidate of candidates) {
    const abs = path.join(ROOT, candidate);
    if (fs.existsSync(abs)) {
      return { candidate, abs };
    }
  }

  return null;
}

function loadPage(route) {
  const resolved = resolveBuiltHtml(route);
  if (!resolved) {
    throw new Error(`Built HTML not found for ${route}. Run npm run build first.`);
  }
  return {
    file: resolved.candidate,
    html: fs.readFileSync(resolved.abs, "utf8"),
  };
}

function parseJsonLdBlocks($) {
  const blocks = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      blocks.push({ parseError: true, raw: raw.slice(0, 120) });
    }
  });
  return blocks;
}

function jsonLdTypes(blocks) {
  const types = [];
  for (const block of blocks) {
    if (block?.["@type"]) types.push(block["@type"]);
    if (Array.isArray(block?.["@graph"])) {
      for (const item of block["@graph"]) {
        if (item?.["@type"]) types.push(item["@type"]);
      }
    }
  }
  return types;
}

function findFaqPages(blocks) {
  const found = [];
  for (const block of blocks) {
    if (block?.["@type"] === "FAQPage") found.push(block);
    if (Array.isArray(block?.["@graph"])) {
      found.push(...block["@graph"].filter((item) => item?.["@type"] === "FAQPage"));
    }
  }
  return found;
}

function includesAll(text, keywords = []) {
  const haystack = normalizeText(text);
  return keywords.map((keyword) => ({
    keyword,
    ok: haystack.includes(keyword),
  }));
}

function makeChecks(page, config, requireFaq = true) {
  const $ = cheerio.load(page.html);
  const title = normalizeText($("title").first().text());
  const description = normalizeText($('meta[name="description"]').attr("content"));
  const ogTitle = normalizeText($('meta[property="og:title"]').attr("content"));
  const ogDescription = normalizeText($('meta[property="og:description"]').attr("content"));
  const canonical = normalizeText($('link[rel="canonical"]').attr("href"));
  const metaRobots = normalizeText($('meta[name="robots"]').attr("content"));
  const h1Texts = $("h1").map((_, el) => normalizeText($(el).text())).get().filter(Boolean);
  const bodyText = normalizeText($("body").text());
  const jsonLdBlocks = parseJsonLdBlocks($);
  const jsonTypes = jsonLdTypes(jsonLdBlocks);
  const faqPages = findFaqPages(jsonLdBlocks);
  const faqQuestions = faqPages.flatMap((faq) =>
    (faq.mainEntity || []).map((item) => normalizeText(item.name))
  );
  const visibleFaqQuestions = $("details summary").map((_, el) => normalizeText($(el).text())).get().filter(Boolean);

  const titleResults = includesAll(title, config.titleIncludes);
  const descResults = includesAll(description, config.descIncludes);
  const h1Results = includesAll(h1Texts.join(" "), config.h1Includes);
  const bodyResults = includesAll(bodyText, config.bodyIncludes);
  const faqSync =
    !requireFaq ||
    (faqQuestions.length > 0 && faqQuestions.every((question) => visibleFaqQuestions.includes(question)));

  const checks = [
    ["built HTML exists", Boolean(page.html)],
    ["self canonical", canonical === `${SITE}${config.route}`],
    ["meta robots noindex 없음", !/noindex/i.test(metaRobots)],
    ["H1 1개", h1Texts.length === 1],
    ["title keyword", titleResults.every((item) => item.ok)],
    ["description keyword", descResults.every((item) => item.ok)],
    ["H1 keyword", h1Results.every((item) => item.ok)],
    ["body intent coverage", bodyResults.every((item) => item.ok)],
    ["OG title/description 존재", Boolean(ogTitle && ogDescription)],
    ["FAQPage JSON-LD visible sync", faqSync],
  ];

  if (config.titleStartsWith) {
    checks.push(["title starts with target head", title.startsWith(config.titleStartsWith)]);
  }

  return {
    config,
    page,
    title,
    description,
    ogTitle,
    ogDescription,
    canonical,
    h1Texts,
    jsonTypes,
    faqQuestions,
    visibleFaqQuestions,
    titleResults,
    descResults,
    h1Results,
    bodyResults,
    checks,
    pass: checks.every(([, ok]) => ok),
  };
}

function printResult(result) {
  console.log(`\n[naver-recovery-p0] ${result.config.label} ${result.config.route}`);
  console.log(`file=${result.page.file}`);
  console.log(`title=${result.title}`);
  console.log(`description=${result.description}`);
  console.log(`canonical=${result.canonical}`);
  console.log(`h1=${result.h1Texts.join(" | ") || "-"}`);
  console.log(`jsonLdTypes=${result.jsonTypes.join(", ") || "-"}`);
  console.log(`faqJsonLd=${result.faqQuestions.length} visibleFaq=${result.visibleFaqQuestions.length}`);
  for (const [label, ok] of result.checks) {
    console.log(`${ok ? "PASS" : "FAIL"}\t${label}`);
  }
  for (const group of ["titleResults", "descResults", "h1Results", "bodyResults"]) {
    const missing = result[group].filter((item) => !item.ok).map((item) => item.keyword);
    if (missing.length > 0) console.log(`missing ${group}: ${missing.join(", ")}`);
  }
}

function run() {
  const results = [];

  for (const target of TARGETS) {
    results.push(makeChecks(loadPage(target.route), target, true));
  }

  for (const control of CONTROLS) {
    results.push(makeChecks(loadPage(control.route), { ...control, descIncludes: [], bodyIncludes: [] }, true));
  }

  results.forEach(printResult);

  if (results.some((result) => !result.pass)) {
    process.exitCode = 1;
  }
}

run();
