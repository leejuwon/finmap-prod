const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const cheerio = require("cheerio");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.finmaphub.com";
const ROUTE = "/tools/compound-interest";
const KO_HTML = ".next/server/pages/ko/tools/compound-interest.html";
const EN_HTML = ".next/server/pages/en/tools/compound-interest.html";

const PROTECTED_PATHS = [
  "pages/tools/dsr-ltv-calculator.js",
  "pages/tools/home-buying-budget-calculator.js",
  "pages/tools/mortgage-loan-calculator.js",
  "pages/tools/dca-calculator.js",
  "pages/tools/cagr-calculator.js",
  "pages/tools/fire-calculator.js",
  "pages/tools/goal-simulator.js",
  "_components/DsrLtvCalculator.js",
  "_components/MortgageLoanCalculator.js",
  "_components/DcaCalculator.js",
  "_components/CagrCalculator.js",
  "lib/compound.js",
  "lib/compoundCore.js",
  "lib/compoundFrequencyCompare.js",
  "next.config.js",
  "pages/_app.js",
  "pages/_document.js",
];

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function loadHtml(relativePath) {
  const abs = path.join(ROOT, relativePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Built HTML not found: ${relativePath}. Run npm.cmd run build first.`);
  }
  return fs.readFileSync(abs, "utf8");
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
      blocks.push({ parseError: true, raw: raw.slice(0, 160) });
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

function count(text, keyword) {
  if (!keyword) return 0;
  return normalizeText(text).split(keyword).length - 1;
}

function gitDiffNameOnly(paths) {
  const output = execFileSync("git", ["diff", "--name-only", "--", ...paths], {
    cwd: ROOT,
    encoding: "utf8",
  });
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function checkKoPage() {
  const html = loadHtml(KO_HTML);
  const $ = cheerio.load(html);
  const title = normalizeText($("title").first().text());
  const description = normalizeText($('meta[name="description"]').attr("content"));
  const ogTitle = normalizeText($('meta[property="og:title"]').attr("content"));
  const ogDescription = normalizeText($('meta[property="og:description"]').attr("content"));
  const canonical = normalizeText($('link[rel="canonical"]').attr("href"));
  const metaRobots = normalizeText($('meta[name="robots"]').attr("content"));
  const h1Texts = $("h1").map((_, el) => normalizeText($(el).text())).get().filter(Boolean);
  const alternates = $('link[rel="alternate"]')
    .map((_, el) => ({
      lang: normalizeText($(el).attr("hreflang")),
      href: normalizeText($(el).attr("href")),
    }))
    .get()
    .filter((item) => item.lang);

  const jsonLdBlocks = parseJsonLdBlocks($);
  const types = jsonLdTypes(jsonLdBlocks);
  const faqPages = findFaqPages(jsonLdBlocks);
  const faqQuestions = faqPages.flatMap((faq) =>
    (faq.mainEntity || []).map((item) => normalizeText(item.name))
  );
  const visibleFaqQuestions = $("details summary")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);
  const faqSync =
    faqQuestions.length > 0 &&
    faqQuestions.every((question) => visibleFaqQuestions.includes(question));

  const $visible = cheerio.load(html);
  $visible("script,style,noscript").remove();
  const bodyText = normalizeText($visible("body").text());
  const first500 = bodyText.slice(0, 500);
  const first1000 = bodyText.slice(0, 1000);

  const checks = [
    ["title head query 유지", title === "복리 계산기 | 월복리·적립식 투자 미래가치 계산 | FinMap"],
    ["description에 primary intent", description.includes("복리 계산기")],
    ["description에 월복리 intent", description.includes("월복리")],
    ["description에 연복리 비교 intent", description.includes("연복리 비교")],
    ["description에 핵심 입력값", ["원금", "월 적립금", "연 수익률", "투자 기간"].every((keyword) => description.includes(keyword))],
    ["OG title 존재", ogTitle.includes("복리 계산기")],
    ["OG description sync", ogDescription === description],
    ["H1 1개", h1Texts.length === 1],
    ["H1 exact", h1Texts[0] === "복리 계산기"],
    ["self canonical", canonical === `${SITE}${ROUTE}`],
    ["hreflang ko", alternates.some((item) => item.lang === "ko" && item.href === `${SITE}${ROUTE}`)],
    ["hreflang en", alternates.some((item) => item.lang === "en" && item.href === `${SITE}/en${ROUTE}`)],
    ["no noindex", !/noindex/i.test(metaRobots)],
    ["SSR first 500에 계산 입력", first500.includes("복리 계산 입력")],
    ["SSR first 500에 핵심 입력값", ["초기 투자금", "월 적립금", "연 수익률", "투자 기간", "계산하기"].every((keyword) => first500.includes(keyword))],
    ["first 1000에 월복리 고정 안내", first1000.includes("월복리") && first1000.includes("보수적 연복리 비교값")],
    ["body에 연복리 비교 정합 문구", bodyText.includes("같은 조건의 보수적 연복리 비교값")],
    ["body에 적립식 intent", bodyText.includes("적립식 복리 계산") && bodyText.includes("적립식 투자")],
    ["old inconsistent copy 제거", !bodyText.includes("연복리 직접 비교는 제공하지 않습니다")],
    ["old later-update copy 제거", !bodyText.includes("후속 검증 후 별도 기능")],
    ["FAQPage JSON-LD", faqPages.length === 1],
    ["FAQ visible/schema sync", faqSync],
    ["HowTo JSON-LD", types.includes("HowTo")],
    ["Breadcrumb JSON-LD", types.includes("BreadcrumbList")],
    ["SoftwareApplication JSON-LD", types.includes("SoftwareApplication")],
    ["복리 계산기 과도 반복 없음", count(bodyText, "복리 계산기") <= 20],
    ["월복리/연복리 long-tail 보존", bodyText.includes("월복리") && bodyText.includes("연복리")],
  ];

  return {
    label: "KO compound page",
    title,
    description,
    canonical,
    h1Texts,
    types,
    faqQuestions,
    visibleFaqQuestions,
    first500,
    checks,
  };
}

function checkEnglishPageUnchangedSurface() {
  const html = loadHtml(EN_HTML);
  const $ = cheerio.load(html);
  const title = normalizeText($("title").first().text());
  const description = normalizeText($('meta[name="description"]').attr("content"));
  const $visible = cheerio.load(html);
  $visible("script,style,noscript").remove();
  const bodyText = normalizeText($visible("body").text());

  const checks = [
    ["EN title unchanged surface", title === "Compound Interest Calculator: Future Value, Monthly Contributions & Taxes | FinMap"],
    ["EN description unchanged surface", description === "Calculate future value with principal, monthly contributions, annual return and years using monthly compounding. Review taxes, fees, inflation, charts and year-by-year tables."],
    ["EN body kept existing annual-copy surface", bodyText.includes("Annual-compounding comparison is reserved for a later verified update.")],
  ];

  return {
    label: "EN unchanged guard",
    title,
    description,
    checks,
  };
}

function checkSourceCopyGuard() {
  const sourceFiles = [
    "pages/tools/compound-interest.js",
    "_components/CompoundForm.js",
    "_components/CompoundDetailSummary.js",
  ];
  const sourceText = sourceFiles
    .map((relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8"))
    .join("\n");

  const checks = [
    ["source에 보수적 연복리 비교 copy 존재", sourceText.includes("보수적 연복리 비교값")],
    ["source에 연복리 미제공 copy 없음", !sourceText.includes("연복리 직접 비교는 제공하지 않습니다")],
    ["source에 후속 기능 copy 없음", !sourceText.includes("후속 검증 후 별도 기능")],
    ["source에 후속 검증 대상 copy 없음", !sourceText.includes("연복리 비교는 후속 검증 대상입니다.")],
  ];

  return {
    label: "Source copy guard",
    checks,
  };
}

function checkProtectedDiffs() {
  const changed = gitDiffNameOnly(PROTECTED_PATHS);
  return {
    label: "Protected file diff",
    changed,
    checks: [["protected calculator/global/formula diff 없음", changed.length === 0]],
  };
}

function printResult(result) {
  console.log(`\n[compound-serp-p1] ${result.label}`);
  if (result.title) console.log(`title=${result.title}`);
  if (result.description) console.log(`description=${result.description}`);
  if (result.canonical) console.log(`canonical=${result.canonical}`);
  if (result.h1Texts) console.log(`h1=${result.h1Texts.join(" | ") || "-"}`);
  if (result.types) console.log(`jsonLdTypes=${result.types.join(", ") || "-"}`);
  if (result.faqQuestions) {
    console.log(`faqJsonLd=${result.faqQuestions.length} visibleFaq=${result.visibleFaqQuestions.length}`);
  }
  if (result.changed) console.log(`changedProtected=${result.changed.join(", ") || "-"}`);
  for (const [label, ok] of result.checks) {
    console.log(`${ok ? "PASS" : "FAIL"}\t${label}`);
  }
}

function run() {
  const results = [
    checkKoPage(),
    checkEnglishPageUnchangedSurface(),
    checkSourceCopyGuard(),
    checkProtectedDiffs(),
  ];

  for (const result of results) printResult(result);

  if (results.some((result) => result.checks.some(([, ok]) => !ok))) {
    process.exitCode = 1;
  }
}

run();
