#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const cheerio = require("cheerio");
const matter = require("gray-matter");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.finmaphub.com";
const DEFAULT_BASE_URL = "http://127.0.0.1:8002";
const MODIFIED_DATE = "2026-07-22";
const WON_TOLERANCE = 20000;
const DB_BACKED_LOCAL_ALLOWED_PATHS = new Set([
  "/market/real-estate/seoul-top100",
  "/market/real-estate/magok-top100",
  "/market/real-estate/gangnam3-top100",
]);

const TARGETS = [
  {
    id: "cagr_article",
    type: "post",
    path: "/posts/personalFinance/what-is-cagr",
    source: "content/posts/personalFinance/ko/what-is-cagr.md",
    expectedSlug: "what-is-cagr",
    expectedTitle: "CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시",
    expectedH1: "CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시",
    requiredLinks: ["/tools/cagr-calculator", "/tools/dca-calculator", "/tools/compound-interest"],
    requiredText: [
      "시작금액과 최종금액으로 CAGR 계산하기",
      "CAGR을 해석할 때 같이 봐야 하는 것",
      "마이너스 CAGR",
    ],
    faqMode: "visible_optional_jsonld",
  },
  {
    id: "home_buying_tool",
    type: "tool",
    path: "/tools/home-buying-budget-calculator",
    source: "pages/tools/home-buying-budget-calculator.js",
    expectedTitle: "아파트 구매 계산기 - 보유 현금·주담대 한도·DSR LTV 예산 계산",
    expectedH1: "아파트 구매 계산기",
    requiredLinks: [
      "/tools/dsr-ltv-calculator",
      "/tools/mortgage-loan-calculator",
      "/market/real-estate/seoul-top100",
      "/market/real-estate/magok-top100",
      "/market/real-estate/gangnam3-top100",
    ],
    requiredText: [
      "계산 결과를 읽는 순서",
      "주담대 원리금 계산하기",
    ],
  },
  {
    id: "dsr_income_article",
    type: "post",
    path: "/posts/personalFinance/dsr-40-income-loan-limit-table",
    source: "content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md",
    expectedSlug: "dsr-40-income-loan-limit-table",
    expectedTitle: "DSR 40% 연봉별 대출 한도표 | 연봉별 주담대 한도·대출 가능액",
    expectedH1: "DSR 40% 연봉별 대출 한도표 | 연봉별 주담대 한도·대출 가능액",
    requiredLinks: [
      "/tools/dsr-ltv-calculator",
      "/tools/mortgage-loan-calculator",
      "/tools/home-buying-budget-calculator",
      "/market/real-estate",
    ],
    requiredText: [
      "대출금액별 월상환액 계산하기",
      "대출 가능액과 월상환액도 구분해야 합니다",
      "주담대 월상환액은 어디서 확인하나요?",
    ],
    faqMode: "jsonld_required",
    expectedFaqQuestions: [
      "DSR 40%란 무엇인가요?",
      "연소득별 한도는 왜 금리에 따라 달라지나요?",
      "기존 대출이 있으면 어떻게 되나요?",
      "DSR과 LTV 중 무엇이 더 중요한가요?",
      "표와 실제 대출 심사가 다른 이유는 무엇인가요?",
      "주담대 월상환액은 어디서 확인하나요?",
    ],
  },
];

function arg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((item) => item.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function add(checks, name, pass, details = "") {
  checks.push({ name, pass: Boolean(pass), details: normalizeText(details) });
}

function publicUrl(pathname) {
  return `${SITE}${pathname}`;
}

function fetchUrl(baseUrl, pathname) {
  return `${baseUrl.replace(/\/+$/, "")}${pathname}`;
}

function normalizedPathname(pathname) {
  try {
    return new URL(pathname, SITE).pathname.replace(/\/+$/, "") || "/";
  } catch (_) {
    return String(pathname || "").split("?")[0].replace(/\/+$/, "") || "/";
  }
}

function isDbBackedLocalAllowed(pathname) {
  return DB_BACKED_LOCAL_ALLOWED_PATHS.has(normalizedPathname(pathname));
}

async function fetchFollow(url, maxRedirects = 5) {
  let current = url;
  const redirects = [];
  for (let i = 0; i <= maxRedirects; i += 1) {
    const res = await fetch(current, {
      redirect: "manual",
      headers: { "user-agent": "FinMap P1-1B KO expansion verifier" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      const next = new URL(res.headers.get("location"), current).toString();
      redirects.push({ status: res.status, from: current, to: next });
      current = next;
      continue;
    }
    return { res, finalUrl: current, redirects, html: await res.text() };
  }
  throw new Error(`Too many redirects: ${url}`);
}

function readSitemapLocs() {
  const files = [
    "public/sitemap-0.xml",
    "public/sitemap-ko.xml",
    "public/sitemap-en.xml",
    "public/en/sitemap.xml",
  ];
  const locs = new Set();
  for (const file of files) {
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) continue;
    const xml = fs.readFileSync(abs, "utf8");
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      locs.add(match[1].trim());
    }
  }
  return locs;
}

function parseJsonLdBlocks($) {
  const blocks = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch (error) {
      blocks.push({ parseError: true, error: error.message });
    }
  });
  return blocks;
}

function typeList(block) {
  const type = block?.["@type"];
  return Array.isArray(type) ? type : [type].filter(Boolean);
}

function findFaqPages(blocks) {
  const pages = [];
  for (const block of blocks) {
    if (typeList(block).includes("FAQPage")) pages.push(block);
    if (Array.isArray(block?.["@graph"])) {
      pages.push(...block["@graph"].filter((item) => typeList(item).includes("FAQPage")));
    }
  }
  return pages;
}

function renderedFaqQuestions($) {
  const headings = $(".fm-post-body h3")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);
  const summaries = $(".fm-post-body details summary")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);
  return [...headings, ...summaries].filter((text) => /[?？]$/.test(text));
}

function sourceChecks(target, checks) {
  const source = read(target.source);

  if (target.type === "post") {
    const parsed = matter(source);
    const data = parsed.data || {};
    const renderedTitle = data.seoTitle || data.title || "";
    add(checks, `${target.id} source slug unchanged`, data.slug === target.expectedSlug, data.slug);
    add(checks, `${target.id} source title unchanged`, renderedTitle === target.expectedTitle, renderedTitle);
    add(checks, `${target.id} dateModified updated`, data.dateModified === MODIFIED_DATE, data.dateModified);
    add(checks, `${target.id} no manual Article JSON-LD duplicate`, !/"@type"\s*:\s*"Article"/.test(parsed.content), "manual Article block absent");
  } else {
    add(checks, `${target.id} seoTitle unchanged`, source.includes(`seoTitle: "${target.expectedTitle}"`), target.expectedTitle);
    add(checks, `${target.id} h1 unchanged`, source.includes(`h1: "${target.expectedH1}"`), target.expectedH1);
  }

  for (const text of target.requiredText || []) {
    add(checks, `${target.id} source contains ${text}`, source.includes(text), text);
  }
}

function collectInternalLinks($) {
  const links = new Set();
  $("a[href]").each((_, el) => {
    const href = String($(el).attr("href") || "").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    let parsed;
    try {
      parsed = new URL(href, SITE);
    } catch (_) {
      return;
    }
    if (parsed.origin !== SITE) return;
    if (parsed.pathname.startsWith("/api/")) return;
    const normalizedPath = parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, "") : parsed.pathname;
    links.add(`${normalizedPath}${parsed.search || ""}`);
  });
  return Array.from(links).sort();
}

async function checkRequiredTargets(baseUrl, target, checks) {
  for (const required of target.requiredLinks || []) {
    const fetched = await fetchFollow(fetchUrl(baseUrl, required));
    const allowedLocalDb500 = fetched.res.status === 500 && isDbBackedLocalAllowed(required);
    add(
      checks,
      `${target.id} CTA target 200 ${required}`,
      fetched.res.status === 200 || allowedLocalDb500,
      allowedLocalDb500 ? "local 500 allowed for DB-backed route; link and sitemap checked" : String(fetched.res.status),
    );
  }
}

async function checkBrokenInternalLinks(baseUrl, target, $, checks) {
  const links = collectInternalLinks($);
  const broken = [];
  const allowed = [];
  for (const link of links) {
    const fetched = await fetchFollow(fetchUrl(baseUrl, link));
    const allowedLocalDb500 = fetched.res.status === 500 && isDbBackedLocalAllowed(link);
    if (allowedLocalDb500) {
      allowed.push(`${link}=local-db-500`);
    } else if (fetched.res.status !== 200) {
      broken.push(`${link}=${fetched.res.status}`);
    }
  }
  add(
    checks,
    `${target.id} broken internal links absent`,
    broken.length === 0,
    broken.join("; ") || `${links.length} links checked${allowed.length ? ` (${allowed.length} DB-backed local 500 allowed)` : ""}`,
  );
}

function renderedChecks(target, fetched, sitemapLocs, checks) {
  const $ = cheerio.load(fetched.html);
  const title = normalizeText($("head > title").first().text());
  const description = normalizeText($('meta[name="description"]').attr("content"));
  const canonical = normalizeText($('link[rel="canonical"]').attr("href"));
  const robots = normalizeText($('meta[name="robots"]').attr("content"));
  const h1Texts = $("h1")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);
  const hreflangKo = normalizeText($('link[rel="alternate"][hreflang="ko"]').attr("href"));
  const bodyText = normalizeText($("body").text());
  const canonicalExpected = publicUrl(target.path);

  add(checks, `${target.id} HTTP 200`, fetched.res.status === 200, String(fetched.res.status));
  add(checks, `${target.id} self canonical`, canonical === canonicalExpected, canonical);
  add(checks, `${target.id} meta noindex absent`, !/noindex/i.test(robots), robots || "(none)");
  add(checks, `${target.id} x-robots noindex absent`, !/noindex/i.test(fetched.res.headers.get("x-robots-tag") || ""), fetched.res.headers.get("x-robots-tag") || "(none)");
  add(checks, `${target.id} sitemap includes canonical`, sitemapLocs.has(canonicalExpected), canonicalExpected);
  add(checks, `${target.id} H1 one`, h1Texts.length === 1, h1Texts.join(" | "));
  add(checks, `${target.id} H1 unchanged`, h1Texts[0] === target.expectedH1, h1Texts[0] || "(missing)");
  add(checks, `${target.id} title unchanged`, title === `${target.expectedTitle} | FinMap`, title);
  add(checks, `${target.id} description exists`, description.length > 40, description);
  add(checks, `${target.id} self hreflang kept`, hreflangKo === canonicalExpected, hreflangKo || "(missing)");

  for (const required of target.requiredLinks || []) {
    const found = $(`a[href="${required}"], a[href^="${required}?"]`).length > 0;
    add(checks, `${target.id} CTA/link present ${required}`, found, required);
  }

  for (const text of target.requiredText || []) {
    add(checks, `${target.id} rendered contains ${text}`, bodyText.includes(text), text);
  }

  const blocks = parseJsonLdBlocks($);
  const articleLike = blocks.filter((block) => typeList(block).some((type) => type === "Article" || type === "BlogPosting"));
  if (target.type === "post") {
    add(checks, `${target.id} article JSON-LD not duplicated`, articleLike.length === 1, `${articleLike.length} article-like blocks`);
    add(checks, `${target.id} rendered dateModified`, articleLike[0]?.dateModified === MODIFIED_DATE, articleLike[0]?.dateModified || "(missing)");
  }

  const faqPages = findFaqPages(blocks);
  const visibleFaqs = renderedFaqQuestions($);
  if (target.faqMode === "jsonld_required") {
    const jsonFaqs = faqPages.flatMap((page) => (page.mainEntity || []).map((item) => normalizeText(item.name)));
    add(checks, `${target.id} FAQPage JSON-LD exists`, faqPages.length === 1, `${faqPages.length} FAQPage blocks`);
    for (const question of target.expectedFaqQuestions || []) {
      add(checks, `${target.id} visible FAQ ${question}`, visibleFaqs.includes(question), question);
      add(checks, `${target.id} JSON-LD FAQ ${question}`, jsonFaqs.includes(question), question);
    }
  } else if (target.faqMode === "visible_optional_jsonld") {
    const jsonFaqs = faqPages.flatMap((page) => (page.mainEntity || []).map((item) => normalizeText(item.name)));
    const sync = faqPages.length === 0 || jsonFaqs.every((question) => visibleFaqs.includes(question));
    add(checks, `${target.id} FAQ JSON-LD sync if present`, sync, faqPages.length ? `${jsonFaqs.length} JSON-LD FAQs` : "no manual FAQPage");
  }

  return $;
}

async function calculationChecks(checks) {
  const modulePath = path.join(ROOT, "lib", "calculators", "dsrLtv.js");
  const { calculateDsrLtvAffordability } = await import(pathToFileURL(modulePath).href);
  const result = calculateDsrLtvAffordability({
    annualIncome: 60000000,
    cashOnHand: 200000000,
    existingMonthlyDebtPayment: 0,
    annualRate: 4,
    loanTermYears: 30,
    ltvRate: 70,
    dsrRate: 40,
    extraCostRate: 5,
    targetHomePrice: 600000000,
    assets: 200000000,
    reserveCash: 0,
  });
  const close = (actual, expected) => Math.abs(Math.round(actual) - expected) <= WON_TOLERANCE;
  add(checks, "calculation DSR loan capacity unchanged", close(result.dsrLoanCapacity, 418922481), String(Math.round(result.dsrLoanCapacity)));
  add(checks, "calculation monthly capacity unchanged", close(result.newMortgageMonthlyPaymentCapacity, 2000000), String(Math.round(result.newMortgageMonthlyPaymentCapacity)));
  add(checks, "calculation final affordable price unchanged", close(result.finalAffordablePrice, 571428571), String(Math.round(result.finalAffordablePrice)));
  add(checks, "calculation bottleneck unchanged", result.bottleneck === "CASH_LTV", result.bottleneck);
}

function eventChecks(checks) {
  const eventFiles = [
    "utils/analytics.js",
    "_components/DsrLtvCalculator.js",
    "_components/ToolResultCta.js",
    "_components/CompoundCTA.js",
    "_components/CTABar.js",
    "_components/MortgageLoanCalculator.js",
    "_components/RealEstateTop100Landing.js",
    "content/posts/personalFinance/ko/what-is-cagr.md",
    "content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md",
    "pages/tools/home-buying-budget-calculator.js",
  ];
  const combined = eventFiles
    .filter((file) => fs.existsSync(path.join(ROOT, file)))
    .map((file) => read(file))
    .join("\n");
  [
    "post_to_dsr_ltv_click",
    "related_calculator_click",
    "tool_result_cta_view",
    "tool_result_cta_click",
    "tool_result_action",
    "dsr_to_real_estate_click",
    "real_estate_to_dsr_click",
    "home_buying_calculate",
    "dsr_ltv_calculate",
    "mortgage_payment_calculate",
    "tool_calculate",
  ].forEach((eventName) => add(checks, `GA4 event string kept ${eventName}`, combined.includes(eventName), eventName));
}

function findBrowserExecutable() {
  return [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean).find((candidate) => fs.existsSync(candidate)) || "";
}

async function browserChecks(baseUrl, checks) {
  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    add(checks, "mobile browser checks skipped", true, "No local Chrome or Edge executable found");
    return;
  }
  const puppeteer = require("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    for (const target of TARGETS) {
      for (const width of [320, 390]) {
        const page = await browser.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") consoleErrors.push(msg.text());
        });
        page.on("pageerror", (error) => pageErrors.push(error.message));
        await page.setViewport({ width, height: 900, deviceScaleFactor: 1, isMobile: true });
        await page.goto(fetchUrl(baseUrl, target.path), { waitUntil: "networkidle0", timeout: 45000 });
        const layout = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          h1Count: document.querySelectorAll("h1").length,
          bodyText: document.body.innerText,
        }));
        await page.close();
        const hydrationErrors = [...consoleErrors, ...pageErrors].filter((line) => /hydration|Hydration failed|did not match/i.test(line));
        add(checks, `${target.id} mobile ${width}px no horizontal overflow`, layout.scrollWidth <= layout.clientWidth + 1, `${layout.scrollWidth}/${layout.clientWidth}`);
        add(checks, `${target.id} mobile ${width}px no page errors`, pageErrors.length === 0, pageErrors.slice(0, 3).join("; "));
        add(checks, `${target.id} mobile ${width}px no hydration errors`, hydrationErrors.length === 0, hydrationErrors.slice(0, 3).join("; "));
      }
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const baseUrl = arg("base-url", DEFAULT_BASE_URL);
  const sitemapLocs = readSitemapLocs();
  const checks = [];

  for (const target of TARGETS) sourceChecks(target, checks);
  eventChecks(checks);
  await calculationChecks(checks);

  for (const target of TARGETS) {
    const fetched = await fetchFollow(fetchUrl(baseUrl, target.path));
    const $ = renderedChecks(target, fetched, sitemapLocs, checks);
    await checkRequiredTargets(baseUrl, target, checks);
    await checkBrokenInternalLinks(baseUrl, target, $, checks);
  }

  await browserChecks(baseUrl, checks);

  const failed = checks.filter((item) => !item.pass);
  for (const check of checks) {
    console.log(`${check.pass ? "PASS" : "FAIL"}\t${check.name}\t${check.details || "-"}`);
  }
  console.log(`Summary: ${checks.length - failed.length}/${checks.length} checks passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
