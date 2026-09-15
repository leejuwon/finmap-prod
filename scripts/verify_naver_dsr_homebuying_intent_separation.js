const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const cheerio = require("cheerio");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.finmaphub.com";

const PAGES = {
  dsr: {
    label: "DSR/LTV",
    route: "/tools/dsr-ltv-calculator",
  },
  home: {
    label: "Home-buying",
    route: "/tools/home-buying-budget-calculator",
  },
  mortgage: {
    label: "Mortgage control",
    route: "/tools/mortgage-loan-calculator",
  },
};

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
    if (fs.existsSync(abs)) return { candidate, abs };
  }

  return null;
}

function loadPage(config) {
  const resolved = resolveBuiltHtml(config.route);
  if (!resolved) {
    throw new Error(`Built HTML not found for ${config.route}. Run npm run build first.`);
  }

  const html = fs.readFileSync(resolved.abs, "utf8");
  const $ = cheerio.load(html);
  const title = normalizeText($("title").first().text());
  const description = normalizeText($('meta[name="description"]').attr("content"));
  const canonical = normalizeText($('link[rel="canonical"]').attr("href"));
  const robots = normalizeText($('meta[name="robots"]').attr("content"));
  const hreflangs = $("link[rel='alternate']")
    .map((_, el) => ({
      lang: normalizeText($(el).attr("hrefLang") || $(el).attr("hreflang")),
      href: normalizeText($(el).attr("href")),
    }))
    .get();
  const h1Texts = $("h1").map((_, el) => normalizeText($(el).text())).get().filter(Boolean);
  const body = normalizeText($("body").text());

  return {
    ...config,
    file: resolved.candidate,
    title,
    description,
    canonical,
    robots,
    hreflangs,
    h1Texts,
    body,
  };
}

function includesAll(text, keywords) {
  const haystack = normalizeText(text);
  return keywords.every((keyword) => haystack.includes(keyword));
}

function excludesAll(text, keywords) {
  const haystack = normalizeText(text);
  return keywords.every((keyword) => !haystack.includes(keyword));
}

function pageTechnicalChecks(page) {
  return [
    ["built HTML exists", Boolean(page.file)],
    ["self canonical", page.canonical === `${SITE}${page.route}`],
    ["meta robots noindex 없음", !/noindex/i.test(page.robots)],
    ["H1 1개", page.h1Texts.length === 1],
    ["hreflang ko", page.hreflangs.some((item) => item.lang === "ko" && item.href === `${SITE}${page.route}`)],
    [
      "hreflang en",
      page.hreflangs.some((item) => item.lang === "en" && item.href === `${SITE}/en${page.route}`),
    ],
  ];
}

function checkDsr(page) {
  return [
    ...pageTechnicalChecks(page),
    ["title/H1 LTV DSR", includesAll(`${page.title} ${page.h1Texts.join(" ")}`, ["LTV", "DSR", "계산기"])],
    ["title/H1 loan capacity promise", includesAll(`${page.title} ${page.h1Texts.join(" ")}`, ["주택담보대출 한도", "대출 가능액"])],
    ["title/H1 아파트 구매 가능액 primary 제거", excludesAll(`${page.title} ${page.h1Texts.join(" ")}`, ["아파트 구매 가능액"])],
    ["description loan-capacity 중심", includesAll(page.description, ["LTV", "DSR", "주담대 한도", "대출 가능액"])],
    ["primary result heading", page.body.includes("LTV·DSR 대출 한도 결과")],
    ["primary result loan labels", includesAll(page.body, ["DSR 기준 대출 가능액", "후보 LTV상 최대 대출액", "대출 한도 병목"])],
    ["home-buying handoff link", page.body.includes("보유 현금과 부대비용까지 반영한 아파트 구매 예산 확인")],
    ["internal SEO wording removed", !page.body.includes("네이버 유입 빠른 프리셋")],
  ];
}

function checkHomeBuying(page) {
  return [
    ...pageTechnicalChecks(page),
    ["title/H1 apartment buying", includesAll(`${page.title} ${page.h1Texts.join(" ")}`, ["아파트 구매 계산기"])],
    ["title cash/budget promise", includesAll(page.title, ["보유 현금", "부대비용", "구매 예산"])],
    ["title DSR/LTV primary 제거", excludesAll(page.title, ["DSR", "LTV"])],
    ["description cash-budget 중심", includesAll(page.description, ["보유 현금", "부대비용률", "필요 현금", "구매 예산"])],
    ["primary result heading", page.body.includes("아파트 구매 예산 결과")],
    ["primary result cash labels", includesAll(page.body, ["구매 가능 가격", "후보 필요 현금", "보유 현금", "현금 부족/여유"])],
    ["wrong DSR/LTV result CTA removed", !page.body.includes("DSR/LTV 계산기 결과")],
    ["DSR/LTV detailed handoff link", page.body.includes("LTV/DSR 기준 주담대 한도 확인")],
    ["internal SEO wording removed", !page.body.includes("네이버 유입 빠른 프리셋")],
  ];
}

function checkMortgage(page) {
  return [
    ...pageTechnicalChecks(page),
    [
      "title unchanged",
      page.title === "주담대 원리금 계산기 - 아파트 담보대출 월상환액 계산 | FinMap",
    ],
    [
      "H1 unchanged",
      page.h1Texts.join(" ") === "주담대 원리금 계산기: 아파트 담보대출 월상환액 계산",
    ],
  ];
}

function checkMortgageDiff() {
  try {
    execFileSync("git", [
      "diff",
      "--quiet",
      "--",
      "pages/tools/mortgage-loan-calculator.js",
      "_components/MortgageLoanCalculator.js",
    ], { cwd: ROOT });
    return true;
  } catch {
    return false;
  }
}

async function checkNumericSnapshot() {
  const { calculateDsrLtvAffordability } = await import("../lib/calculators/dsrLtv.js");
  const result = calculateDsrLtvAffordability({
    annualIncome: 70000000,
    cashOnHand: 300000000,
    existingMonthlyDebtPayment: 300000,
    annualRate: 4.3,
    loanTermYears: 30,
    ltvRate: 70,
    dsrRate: 40,
    extraCostRate: 5,
    targetHomePrice: 800000000,
  });

  const actual = {
    dsrLoanCapacity: Math.round(result.dsrLoanCapacity),
    candidateMaxLoanByLtv: Math.round(result.candidateMaxLoanByLtv),
    finalAffordablePrice: Math.round(result.finalAffordablePrice),
    finalMonthlyPayment: Math.round(result.finalMonthlyPayment),
    candidateCashRequirement: Math.round(result.candidateCashRequirement),
    candidateCashGap: Math.round(result.candidateCashGap),
    candidateMonthlyPayment: Math.round(result.candidateMonthlyPayment),
    bottleneck: result.bottleneck,
    candidateStatus: result.candidateStatus,
  };

  const expected = {
    dsrLoanCapacity: 410881122,
    candidateMaxLoanByLtv: 560000000,
    finalAffordablePrice: 586973032,
    finalMonthlyPayment: 2033333,
    candidateCashRequirement: 280000000,
    candidateCashGap: 20000000,
    candidateMonthlyPayment: 2672306,
    bottleneck: "DSR",
    candidateStatus: "FAIL",
  };

  return {
    actual,
    expected,
    pass: Object.entries(expected).every(([key, value]) => actual[key] === value),
  };
}

function printChecks(label, page, checks) {
  console.log(`\n[intent-separation] ${label} ${page.route}`);
  console.log(`file=${page.file}`);
  console.log(`title=${page.title}`);
  console.log(`description=${page.description}`);
  console.log(`h1=${page.h1Texts.join(" | ") || "-"}`);
  for (const [name, ok] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"}\t${name}`);
  }
}

(async () => {
  const dsr = loadPage(PAGES.dsr);
  const home = loadPage(PAGES.home);
  const mortgage = loadPage(PAGES.mortgage);

  const groups = [
    [PAGES.dsr.label, dsr, checkDsr(dsr)],
    [PAGES.home.label, home, checkHomeBuying(home)],
    [PAGES.mortgage.label, mortgage, checkMortgage(mortgage)],
  ];

  for (const [label, page, checks] of groups) {
    printChecks(label, page, checks);
  }

  const mortgageDiffOk = checkMortgageDiff();
  console.log(`\n[intent-separation] Mortgage source diff`);
  console.log(`${mortgageDiffOk ? "PASS" : "FAIL"}\tMortgage page/component diff 0`);

  const numeric = await checkNumericSnapshot();
  console.log(`\n[intent-separation] Numeric snapshot`);
  console.log(`${numeric.pass ? "PASS" : "FAIL"}\tDSR/LTV calculation core snapshot`);
  console.log(`actual=${JSON.stringify(numeric.actual)}`);

  const allPageChecksPass = groups.every(([, , checks]) => checks.every(([, ok]) => ok));
  if (!allPageChecksPass || !mortgageDiffOk || !numeric.pass) {
    process.exitCode = 1;
  }
})();
