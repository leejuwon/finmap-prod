#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const cheerio = require("cheerio");

const SITE = "https://www.finmaphub.com";
const GENERATED_AT = "2026-07-29";
const TIMEZONE = "Asia/Seoul";

const OUT_MD = path.join("reports", "search-growth-p1-2c-postdeploy-verification.md");
const OUT_JSON = path.join("reports", "search-growth-p1-2c-postdeploy-verification.json");
const OUT_CSV = path.join("reports", "search-growth-p1-2c-production-url-check.csv");
const OUT_CALENDAR = path.join("reports", "search-growth-p1-2c-observation-calendar.json");
const OBSERVATION_BASELINE = path.join("reports", "search-growth-90d-p1-1c-observation-baseline.json");

const TARGETS = [
  { group: "KO Track B", url: `${SITE}/posts/personalFinance/what-is-cagr`, locale: "ko", type: "post" },
  { group: "KO Track B", url: `${SITE}/tools/home-buying-budget-calculator`, locale: "ko", type: "tool" },
  { group: "KO Track B", url: `${SITE}/posts/personalFinance/dsr-40-income-loan-limit-table`, locale: "ko", type: "post" },
  {
    group: "EN Track A",
    url: `${SITE}/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio`,
    locale: "en",
    type: "post",
  },
  {
    group: "EN Track A",
    url: `${SITE}/en/posts/personalFinance/annual-vs-monthly-compound`,
    locale: "en",
    type: "post",
  },
  {
    group: "EN Track A",
    url: `${SITE}/en/posts/personalFinance/is-dca-better-in-a-bear-market`,
    locale: "en",
    type: "post",
  },
  { group: "Google top loss calculator", url: `${SITE}/tools/compound-interest`, locale: "ko", type: "tool" },
  { group: "Google top loss calculator", url: `${SITE}/tools/cagr-calculator`, locale: "ko", type: "tool" },
  { group: "Google top loss calculator", url: `${SITE}/tools/dca-calculator`, locale: "ko", type: "tool" },
  { group: "Google top loss calculator", url: `${SITE}/tools/goal-simulator`, locale: "ko", type: "tool" },
  { group: "New Google calculator", url: `${SITE}/tools/mortgage-loan-calculator`, locale: "ko", type: "tool" },
  { group: "New Google calculator", url: `${SITE}/en/tools/mortgage-loan-calculator`, locale: "en", type: "tool" },
  { group: "Real estate", url: `${SITE}/market/real-estate`, locale: "ko", type: "market" },
  { group: "Real estate", url: `${SITE}/market/real-estate/seoul-top100`, locale: "ko", type: "market" },
  { group: "Real estate", url: `${SITE}/market/real-estate/magok-top100`, locale: "ko", type: "market" },
  { group: "Real estate", url: `${SITE}/market/real-estate/gangnam3-top100`, locale: "ko", type: "market" },
];

const SITEMAP_PATHS = ["/sitemap.xml", "/sitemap-ko.xml", "/sitemap-en.xml", "/en/sitemap.xml"];
const ROBOTS_PATH = "/robots.txt";
const SLUG_WORD_RE = /^[a-z0-9-_/|]+$/i;

function arg(name, fallback = null) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((value) => value.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, value, "utf8");
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  writeText(filePath, `${lines.join("\n")}\n`);
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function toPathname(url) {
  const parsed = new URL(url, SITE);
  let pathname = parsed.pathname || "/";
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
  return pathname;
}

function absoluteUrl(baseUrl, pathname) {
  return new URL(pathname, `${baseUrl.replace(/\/+$/, "")}/`).toString();
}

function isSlugFallback(text, url) {
  const value = normalizeText(text);
  if (!value) return true;
  const slug = toPathname(url).split("/").filter(Boolean).pop() || "";
  if (value === slug) return true;
  if (value.length < 12 && SLUG_WORD_RE.test(value) && value.toLowerCase().includes(slug.toLowerCase())) return true;
  return false;
}

async function fetchFollow(url, maxRedirects = 5) {
  let current = url;
  const redirects = [];
  for (let i = 0; i <= maxRedirects; i += 1) {
    const res = await fetch(current, {
      redirect: "manual",
      headers: { "user-agent": "FinMap P1-2C postdeploy verifier" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      const next = new URL(res.headers.get("location"), current).toString();
      redirects.push({ status: res.status, from: current, to: next });
      current = next;
      continue;
    }
    return { res, finalUrl: current, redirects, text: await res.text() };
  }
  throw new Error(`Too many redirects for ${url}`);
}

function scriptJsonLdItems($) {
  const items = [];
  const errors = [];
  $('script[type="application/ld+json"]').each((index, node) => {
    const raw = $(node).contents().text();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items.push(...parsed);
      else items.push(parsed);
    } catch (error) {
      errors.push({ index, message: error.message });
    }
  });
  return { items, errors };
}

function flattenJsonLdTypes(items) {
  const types = [];
  function visit(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const type = value["@type"];
    if (Array.isArray(type)) types.push(...type.map(String));
    else if (type) types.push(String(type));
    if (Array.isArray(value["@graph"])) value["@graph"].forEach(visit);
  }
  items.forEach(visit);
  return types;
}

function collectInternalCtaTargets($) {
  const targets = [];
  const seen = new Set();
  $("a[href]").each((_, node) => {
    const text = normalizeText($(node).text());
    const href = String($(node).attr("href") || "").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const url = new URL(href, SITE);
    if (url.origin !== SITE) return;
    const pathOnly = url.pathname.replace(/\/+$/, "") || "/";
    const looksLikeCta =
      /계산|calculator|DSR|LTV|CAGR|복리|투자|대출|담보|아파트|보기|확인|tool|budget|mortgage/i.test(text) ||
      /\/tools\/|\/market\/real-estate/.test(pathOnly);
    if (!looksLikeCta || seen.has(pathOnly)) return;
    seen.add(pathOnly);
    targets.push({ text, href: `${SITE}${pathOnly}` });
  });
  return targets.slice(0, 5);
}

function faqConsistency($, jsonTypes, jsonItems) {
  const hasFaqJson = jsonTypes.includes("FAQPage");
  const visibleText = normalizeText($("body").text());
  if (!hasFaqJson) return { status: "NOT_APPLICABLE", details: "No FAQPage JSON-LD" };
  const questions = [];
  function visit(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) return value.forEach(visit);
    if (String(value["@type"] || "") === "Question" && value.name) questions.push(normalizeText(value.name));
    Object.values(value).forEach((item) => {
      if (item && typeof item === "object") visit(item);
    });
  }
  jsonItems.forEach(visit);
  const matched = questions.filter((question) => question && visibleText.includes(question)).length;
  return {
    status: questions.length === 0 || matched > 0 ? "PASS" : "REVIEW",
    details: `questions=${questions.length}; visibleMatched=${matched}`,
  };
}

async function checkCtaTargets(targets, baseUrl = SITE) {
  const out = [];
  for (const target of targets) {
    try {
      const fetched = await fetchFollow(absoluteUrl(baseUrl, toPathname(target.href)), 3);
      out.push({ ...target, status: fetched.res.status, pass: fetched.res.status === 200 });
    } catch (error) {
      out.push({ ...target, status: "ERROR", pass: false, error: error.message });
    }
  }
  return out;
}

function inspectSnippetHygiene($, target) {
  const body = $("body");
  const allText = normalizeText(body.text());
  const unprotectedText = normalizeText(
    body
      .clone()
      .find("[data-nosnippet],script,style,noscript,svg")
      .remove()
      .end()
      .text()
  );
  const viewZeroUnprotected = /조회수\s*0(?![0-9])|Views\s*0(?![0-9])/i.test(unprotectedText);
  const commentUnprotected = /아직\s*댓글이\s*없습니다|No comments yet/i.test(unprotectedText);
  const shareUnprotected = /공유하기|Share this|Share calculator|Copy canonical URL/i.test(unprotectedText);
  const loadingEarly = /\bLoading\b|로딩\s*중|불러오는\s*중/.test(unprotectedText.slice(0, 400));
  const h1Text = normalizeText($("h1").first().text());
  const firstMeaningful = normalizeText(unprotectedText.slice(0, 220));
  const firstBad = /조회수|댓글|공유|광고|ad\s*slot|loading|로딩/i.test(firstMeaningful);
  return {
    viewZeroUnprotected,
    commentUnprotected,
    shareUnprotected,
    loadingEarly,
    h1SnippetAvailable: Boolean(h1Text) && unprotectedText.includes(h1Text),
    bodySnippetAvailable: target.type !== "post" || $(".fm-post-body").length > 0 || allText.length > 500,
    firstMeaningfulBad: firstBad,
    pass: !viewZeroUnprotected && !commentUnprotected && !shareUnprotected && !loadingEarly && !firstBad,
  };
}

function inspectCalculatorHtml($, target) {
  if (target.type !== "tool") return { status: "NOT_APPLICABLE", pass: true };
  const inputs = $("input,select,button,textarea").length;
  const buttons = $("button").length;
  const resultText = /결과|상환|계산|result|payment|total|CTA/i.test(normalizeText($("body").text()));
  const ctaLike = collectInternalCtaTargets($).length > 0;
  return {
    status: inputs > 0 && buttons > 0 && resultText ? "STATIC_HTML_PASS_BROWSER_MANUAL_RECOMMENDED" : "REVIEW",
    inputs,
    buttons,
    resultText,
    ctaLike,
    pass: inputs > 0 && buttons > 0 && resultText,
  };
}

function inspectGa4Html($) {
  const scripts = $("script")
    .toArray()
    .map((node) => String($(node).attr("src") || $(node).html() || ""));
  return {
    gtagLoaderPresent: scripts.some((value) => value.includes("googletagmanager.com/gtag/js")),
    gtagConfigPresent: scripts.some((value) => value.includes("gtag(") && value.includes("config")),
    debugViewStatus: "GA4_DEBUGVIEW_MANUAL_CHECK_REQUIRED",
  };
}

function findBrowserExecutable() {
  return [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ]
    .filter(Boolean)
    .find((candidate) => fs.existsSync(candidate)) || "";
}

function compactErrorLines(lines) {
  return lines
    .map((line) => normalizeText(line))
    .filter(Boolean)
    .slice(0, 3);
}

async function inspectBrowserTargets(targets) {
  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    return {
      status: "SKIPPED",
      reason: "No local Chrome or Edge executable found for puppeteer-core.",
      widths: [320, 390],
      results: [],
    };
  }

  const puppeteer = require("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const results = [];
  try {
    for (const target of targets) {
      for (const width of [320, 390]) {
        const page = await browser.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        let navigationError = "";
        page.on("console", (msg) => {
          if (msg.type() === "error") consoleErrors.push(msg.text());
        });
        page.on("pageerror", (error) => pageErrors.push(error.message));
        try {
          await page.setViewport({ width, height: 900, deviceScaleFactor: 1, isMobile: true });
          await page.goto(target.url, { waitUntil: "networkidle2", timeout: 60000 });
          await new Promise((resolve) => setTimeout(resolve, 750));
        } catch (error) {
          navigationError = error.message;
        }

        const layout = await page.evaluate(() => {
          const interactive = document.querySelector("input, select, textarea, button");
          const interactiveRect = interactive ? interactive.getBoundingClientRect() : null;
          const tables = Array.from(document.querySelectorAll("table")).map((table) => ({
            scrollWidth: table.scrollWidth,
            clientWidth: table.clientWidth,
          }));
          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            h1Count: document.querySelectorAll("h1").length,
            firstInteractiveTop: interactiveRect ? Math.round(interactiveRect.top) : null,
            tableOverflowCount: tables.filter((table) => table.scrollWidth > table.clientWidth + 1).length,
            tableCount: tables.length,
            bodyHasResultText: /결과|월상환|상환표|Result|Payment|Total/i.test(document.body.innerText || ""),
          };
        });
        await page.close();

        const hydrationErrors = [...consoleErrors, ...pageErrors].filter((line) =>
          /hydration|Hydration failed|did not match|Minified React error #418/i.test(line)
        );
        const fatalConsoleErrors = [...consoleErrors, ...pageErrors].filter((line) =>
          /Application error|Minified React error|Hydration failed|did not match/i.test(line) ||
          (/Internal Server Error/i.test(line) && !/Failed to load resource/i.test(line))
        );
        const horizontalOverflow = layout.scrollWidth > layout.clientWidth + 1;
        const pass =
          !navigationError &&
          !horizontalOverflow &&
          pageErrors.length === 0 &&
          hydrationErrors.length === 0 &&
          fatalConsoleErrors.length === 0;

        results.push({
          url: target.url,
          group: target.group,
          width,
          pass,
          navigationError,
          horizontalOverflow,
          scrollWidth: layout.scrollWidth,
          clientWidth: layout.clientWidth,
          h1Count: layout.h1Count,
          firstInteractiveTop: layout.firstInteractiveTop,
          tableOverflowCount: layout.tableOverflowCount,
          tableCount: layout.tableCount,
          bodyHasResultText: layout.bodyHasResultText,
          consoleErrorCount: consoleErrors.length,
          pageErrorCount: pageErrors.length,
          hydrationErrorCount: hydrationErrors.length,
          fatalConsoleErrorCount: fatalConsoleErrors.length,
          pageErrors: compactErrorLines(pageErrors),
          hydrationErrors: compactErrorLines(hydrationErrors),
          fatalConsoleErrors: compactErrorLines(fatalConsoleErrors),
        });
      }
    }
  } finally {
    await browser.close();
  }

  return {
    status: results.every((row) => row.pass) ? "PASS" : "FAIL",
    reason: "",
    widths: [320, 390],
    results,
  };
}

async function inspectPage(target, sitemapLocs, baseUrl = SITE) {
  const fetched = await fetchFollow(absoluteUrl(baseUrl, toPathname(target.url)));
  const headers = Object.fromEntries(fetched.res.headers.entries());
  const $ = cheerio.load(fetched.text);
  const title = normalizeText($("head > title").first().text());
  const description = normalizeText($('meta[name="description"]').first().attr("content"));
  const canonical = normalizeText($('link[rel="canonical"]').first().attr("href"));
  const metaRobots = normalizeText($('meta[name="robots"]').first().attr("content"));
  const xRobots = normalizeText(headers["x-robots-tag"]);
  const h1Texts = $("h1")
    .toArray()
    .map((node) => normalizeText($(node).text()))
    .filter(Boolean);
  const alternates = $('link[rel="alternate"][hreflang]')
    .toArray()
    .map((node) => ({
      hreflang: normalizeText($(node).attr("hreflang")),
      href: normalizeText($(node).attr("href")),
    }))
    .filter((item) => item.href);
  const htmlLang = normalizeText($("html").attr("lang"));
  const jsonLd = scriptJsonLdItems($);
  const jsonTypes = flattenJsonLdTypes(jsonLd.items);
  const articleCount = jsonTypes.filter((type) => ["Article", "BlogPosting"].includes(type)).length;
  const faq = faqConsistency($, jsonTypes, jsonLd.items);
  const ctaTargets = collectInternalCtaTargets($);
  const ctaResults = await checkCtaTargets(ctaTargets.slice(0, 3), baseUrl);
  const snippet = inspectSnippetHygiene($, target);
  const calculator = inspectCalculatorHtml($, target);
  const ga4 = inspectGa4Html($);
  const expectedCanonical = target.url;
  const sitemapMembership = sitemapLocs.has(expectedCanonical);
  const bodyText = normalizeText($("body").text());
  const errorScreen = /Application error|Internal Server Error|This page could not be found|500 server/i.test(bodyText);
  const checks = {
    http200: fetched.res.status === 200,
    unexpectedRedirect: fetched.redirects.length === 0,
    selfCanonical: canonical === expectedCanonical,
    noMetaNoindex: !/noindex/i.test(metaRobots),
    noXRobotsNoindex: !/noindex/i.test(xRobots),
    h1ExactlyOne: h1Texts.length === 1,
    titlePresent: Boolean(title),
    descriptionPresent: Boolean(description),
    titleNotSlugFallback: !isSlugFallback(title, target.url),
    descriptionNotSlugFallback: !isSlugFallback(description, target.url),
    sitemapMembership,
    expectedLocale: !htmlLang || htmlLang.toLowerCase().startsWith(target.locale),
    hreflangPresent: alternates.length > 0,
    jsonLdParse: jsonLd.errors.length === 0,
    articleNotDuplicate: articleCount <= 1,
    faqConsistency: faq.status !== "REVIEW",
    ctaTarget200: ctaResults.every((item) => item.pass),
    notErrorScreen: !errorScreen,
    snippetHygiene: snippet.pass,
    calculatorStatic: calculator.pass,
    ga4LoaderPresent: ga4.gtagLoaderPresent,
  };
  const criticalKeys = [
    "http200",
    "unexpectedRedirect",
    "selfCanonical",
    "noMetaNoindex",
    "noXRobotsNoindex",
    "h1ExactlyOne",
    "titlePresent",
    "descriptionPresent",
    "titleNotSlugFallback",
    "descriptionNotSlugFallback",
    "sitemapMembership",
    "expectedLocale",
    "hreflangPresent",
    "jsonLdParse",
    "articleNotDuplicate",
    "faqConsistency",
    "ctaTarget200",
    "notErrorScreen",
  ];
  const pass = criticalKeys.every((key) => Boolean(checks[key]));
  return {
    ...target,
    status: fetched.res.status,
    finalUrl: fetched.finalUrl,
    redirects: fetched.redirects,
    canonical,
    metaRobots,
    xRobots,
    h1Count: h1Texts.length,
    h1: h1Texts[0] || "",
    title,
    description,
    htmlLang,
    alternates,
    jsonLdTypes: jsonTypes,
    jsonLdErrors: jsonLd.errors,
    articleCount,
    faq,
    ctaTargets: ctaResults,
    snippet,
    calculator,
    ga4,
    checks,
    pass,
  };
}

async function inspectSitemapsAndRobots(targetUrls, baseUrl = SITE) {
  const sitemapResults = [];
  const allLocs = new Set();
  for (const sitemapPath of SITEMAP_PATHS) {
    const url = absoluteUrl(baseUrl, sitemapPath);
    try {
      const fetched = await fetchFollow(url);
      const locs = [...fetched.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
      locs.forEach((loc) => allLocs.add(loc));
      const isXml = /<\?xml|<urlset|<sitemapindex/.test(fetched.text);
      sitemapResults.push({
        url,
        status: fetched.res.status,
        xmlParse: isXml,
        locCount: locs.length,
        containsDcaExplicitAlternate:
          fetched.text.includes("/en/posts/personalFinance/is-dca-better-in-a-bear-market") ||
          fetched.text.includes("/posts/personalFinance/dca-step-up-ruleset"),
        pass: fetched.res.status === 200 && isXml,
      });
    } catch (error) {
      sitemapResults.push({ url, status: "ERROR", xmlParse: false, locCount: 0, pass: false, error: error.message });
    }
  }
  const robotsUrl = absoluteUrl(baseUrl, ROBOTS_PATH);
  let robots = { url: robotsUrl, status: "ERROR", disallowBlocksCore: "UNKNOWN", pass: false };
  try {
    const fetched = await fetchFollow(robotsUrl);
    const text = fetched.text;
    const blocksCore = targetUrls.some((url) => {
      const pathname = toPathname(url);
      return new RegExp(`Disallow:\\s*${pathname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "im").test(text);
    });
    robots = {
      url: robotsUrl,
      status: fetched.res.status,
      sitemapRefs: [...text.matchAll(/^Sitemap:\s*(.+)$/gim)].map((match) => match[1].trim()),
      disallowBlocksCore: blocksCore,
      pass: fetched.res.status === 200 && !blocksCore,
    };
  } catch (error) {
    robots = { ...robots, error: error.message };
  }
  return {
    sitemapResults,
    robots,
    allLocs,
    targetMembership: targetUrls.map((url) => ({ url, inSitemap: allLocs.has(url) })),
  };
}

function runGit(args, fallback) {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return fallback;
  }
}

function addDays(dateText, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return "MANUAL_INPUT_REQUIRED";
  const date = new Date(`${dateText}T00:00:00+09:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addHours(dateText, hours) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return "MANUAL_INPUT_REQUIRED";
  const date = new Date(`${dateText}T00:00:00+09:00`);
  date.setUTCHours(date.getUTCHours() + hours);
  return date.toISOString();
}

function buildDeploymentInfo() {
  const deployDate = arg("deploy-date", "MANUAL_INPUT_REQUIRED");
  const deployTime = arg("deploy-time", "MANUAL_INPUT_REQUIRED");
  return {
    deployDate,
    deployTime,
    timezone: TIMEZONE,
    deployedCommitHash: arg("commit", runGit(["rev-parse", "HEAD"], "MANUAL_INPUT_REQUIRED")),
    deployedBranch: arg("branch", runGit(["branch", "--show-current"], "MANUAL_INPUT_REQUIRED")),
    deploymentCommandOrMethod: arg("deployment-method", "MANUAL_INPUT_REQUIRED"),
    pm2ProcessName: arg("pm2-process", "MANUAL_INPUT_REQUIRED"),
    buildResult: arg("build-result", "MANUAL_INPUT_REQUIRED"),
    commitDate: runGit(["log", "-1", "--format=%cd", "--date=iso-strict"], "MANUAL_INPUT_REQUIRED"),
    commitSubject: runGit(["log", "-1", "--format=%s"], "MANUAL_INPUT_REQUIRED"),
  };
}

function buildObservationCalendar(deploymentInfo) {
  const deployDate = deploymentInfo.deployDate;
  return {
    generatedAt: GENERATED_AT,
    timezone: TIMEZONE,
    deployDate,
    deployTime: deploymentInfo.deployTime,
    deployPlus72Hours: addHours(deployDate, 72),
    deployPlus7Days: addDays(deployDate, 7),
    deployPlus28Days: addDays(deployDate, 28),
    deployPlus42Days: addDays(deployDate, 42),
    checks: {
      "72h": ["HTTP", "canonical", "noindex", "sitemap", "calculator function", "GA4"],
      "7d": ["Naver clicks/impressions", "Bing clicks/impressions", "provisional GSC impressions", "GA4 calculate events"],
      "28d": ["KO Track B performance", "EN Track A performance", "calculator Google impressions", "Naver calculator rank", "CTA conversion"],
      "42d": ["keep", "partial rollback", "additional improvement decision"],
    },
  };
}

function updateObservationBaseline(deploymentInfo, calendar, verificationSummary) {
  if (!fs.existsSync(OBSERVATION_BASELINE)) return { updated: false, reason: "baseline missing" };
  const data = JSON.parse(fs.readFileSync(OBSERVATION_BASELINE, "utf8"));
  data.projectStage = "P1-2C postdeploy observation baseline";
  data.deployDate = deploymentInfo.deployDate;
  data.deploymentInfo = deploymentInfo;
  data.observationCalendar = calendar;
  data.p1_2bWeeklyBaseline = {
    googleReportTotal: {
      clicks: "2 -> 0",
      impressions: "414 -> 30",
      position: "9.9 -> 15.0",
    },
    calculatorPageTable: {
      compound: "139 -> 9",
      CAGR: "47 -> 3",
      DCA: "18 -> 2",
      goal: "16 -> 10",
      mortgageKo: "0 -> 10",
      mortgageEn: "0 -> 11",
    },
    naver: {
      clicks: "74 -> 92",
      impressions: "15844 -> 15108",
      ctr: "about 0.47% -> about 0.61%",
    },
    bing: {
      clicks: "3 -> 4",
      impressions: "134 -> 178",
    },
  };
  data.p1_2cPostdeployVerification = verificationSummary;
  if (Array.isArray(data.observationTargets)) {
    data.observationTargets = data.observationTargets.map((target) => ({
      ...target,
      deployDate: deploymentInfo.deployDate,
      check72Hours: calendar.deployPlus72Hours,
      check7Day: calendar.deployPlus7Days,
      check28Day: calendar.deployPlus28Days,
      check6Week: calendar.deployPlus42Days,
    }));
  }
  writeJson(OBSERVATION_BASELINE, data);
  return { updated: true, path: OBSERVATION_BASELINE };
}

function summarizeByGroup(urlResults) {
  const map = new Map();
  for (const row of urlResults) {
    const item = map.get(row.group) || { group: row.group, total: 0, pass: 0, fail: 0 };
    item.total += 1;
    if (row.pass) item.pass += 1;
    else item.fail += 1;
    map.set(row.group, item);
  }
  return [...map.values()];
}

function verdictFor(data) {
  const blockers = [];
  for (const row of data.urlResults) {
    if (!row.checks.http200) blockers.push(`${row.url}: HTTP ${row.status}`);
    if (!row.checks.noMetaNoindex || !row.checks.noXRobotsNoindex) blockers.push(`${row.url}: noindex`);
    if (!row.checks.selfCanonical) blockers.push(`${row.url}: canonical`);
    if (!row.checks.sitemapMembership) blockers.push(`${row.url}: sitemap missing`);
    if (!row.checks.h1ExactlyOne) blockers.push(`${row.url}: h1 count ${row.h1Count}`);
    if (!row.checks.ctaTarget200) blockers.push(`${row.url}: CTA target`);
  }
  for (const item of data.sitemaps.sitemapResults) {
    if (!item.pass) blockers.push(`${item.url}: sitemap check`);
  }
  if (!data.sitemaps.robots.pass) blockers.push(`${data.sitemaps.robots.url}: robots check`);
  if (data.browser?.status === "FAIL") {
    for (const row of data.browser.results.filter((item) => !item.pass)) {
      blockers.push(
        `${row.url}: mobile ${row.width}px browser check failed` +
          (row.pageErrors.length ? ` (${row.pageErrors.join("; ")})` : "")
      );
    }
  }
  const manual = [];
  if (data.deploymentInfo.deployDate === "MANUAL_INPUT_REQUIRED") manual.push("deploy date/time");
  manual.push("GA4 DebugView");
  manual.push("GSC sitemap submission screen");
  if (!data.browser || data.browser.status === "SKIPPED") manual.push("browser console/hydration and mobile overflow");
  manual.push("representative calculator input GA4 receipt");
  return {
    status: blockers.length ? "FAIL" : manual.length ? "CONDITIONAL_PASS" : "PASS",
    blockers,
    manualChecks: manual,
  };
}

function markdownTable(headers, rows) {
  const lines = [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`];
  for (const row of rows) lines.push(`| ${headers.map((header) => row[header] ?? "").join(" | ")} |`);
  return lines.join("\n");
}

function browserSummaryForUrl(browser, url) {
  if (!browser || browser.status === "SKIPPED") {
    return { status: "SKIPPED", pass: "", details: browser?.reason || "" };
  }
  const rows = browser.results.filter((row) => toPathname(row.url) === toPathname(url));
  return {
    status: rows.every((row) => row.pass) ? "PASS" : "FAIL",
    pass: rows.every((row) => row.pass),
    details: rows.map((row) => `${row.width}px:${row.pass ? "PASS" : "FAIL"}`).join(" "),
  };
}

function renderReport(data) {
  const groupRows = summarizeByGroup(data.urlResults).map((row) => ({
    Group: row.group,
    Total: row.total,
    Pass: row.pass,
    Fail: row.fail,
  }));
  const urlRows = data.urlResults.map((row) => ({
    Group: row.group,
    URL: toPathname(row.url),
    HTTP: row.status,
    Canonical: row.checks.selfCanonical ? "PASS" : "FAIL",
    Noindex: row.checks.noMetaNoindex && row.checks.noXRobotsNoindex ? "PASS" : "FAIL",
    H1: row.h1Count,
    Sitemap: row.checks.sitemapMembership ? "PASS" : "FAIL",
    Hreflang: row.checks.hreflangPresent ? "PASS" : "REVIEW",
    JSONLD: row.checks.jsonLdParse ? "PASS" : "FAIL",
    CTA: row.checks.ctaTarget200 ? "PASS" : "FAIL",
    Snippet: row.snippet.pass ? "PASS" : "REVIEW",
  }));
  const sitemapRows = data.sitemaps.sitemapResults.map((row) => ({
    URL: row.url.replace(SITE, ""),
    HTTP: row.status,
    XML: row.xmlParse ? "PASS" : "FAIL",
    Locs: row.locCount,
    DCA: row.containsDcaExplicitAlternate ? "PASS_OR_PRESENT" : "REVIEW",
  }));
  const calcRows = data.urlResults
    .filter((row) => row.type === "tool")
    .map((row) => ({
      URL: toPathname(row.url),
      Status: row.calculator.status,
      Inputs: row.calculator.inputs ?? "",
      Buttons: row.calculator.buttons ?? "",
      CTA: row.calculator.ctaLike ? "PASS" : "REVIEW",
    }));
  const browserRows =
    data.browser.status === "SKIPPED"
      ? []
      : data.browser.results.map((row) => ({
          URL: toPathname(row.url),
          Width: `${row.width}px`,
          Overflow: row.horizontalOverflow ? "FAIL" : "PASS",
          H1: row.h1Count,
          PageErrors: row.pageErrorCount,
          Hydration: row.hydrationErrorCount,
          FatalConsole: row.fatalConsoleErrorCount,
          FirstInputTop: row.firstInteractiveTop ?? "",
          TableOverflow: `${row.tableOverflowCount}/${row.tableCount}`,
          ResultText: row.bodyHasResultText ? "PASS" : "REVIEW",
          Pass: row.pass ? "PASS" : "FAIL",
        }));
  return `# Search Growth P1-2C Postdeploy Verification

Generated: ${GENERATED_AT}

## Overall Verdict

${data.verdict.status}

- Blockers: ${data.verdict.blockers.length}
- Manual checks remaining: ${data.verdict.manualChecks.join(", ")}

## Deployment Information

- Deploy date: ${data.deploymentInfo.deployDate}
- Deploy time: ${data.deploymentInfo.deployTime}
- Timezone: ${data.deploymentInfo.timezone}
- Commit: ${data.deploymentInfo.deployedCommitHash}
- Branch: ${data.deploymentInfo.deployedBranch}
- Deployment method: ${data.deploymentInfo.deploymentCommandOrMethod}
- PM2 process: ${data.deploymentInfo.pm2ProcessName}
- Build result: ${data.deploymentInfo.buildResult}
- Commit date: ${data.deploymentInfo.commitDate}
- Commit subject: ${data.deploymentInfo.commitSubject}

## Production URL Results

${markdownTable(["Group", "Total", "Pass", "Fail"], groupRows)}

${markdownTable(["Group", "URL", "HTTP", "Canonical", "Noindex", "H1", "Sitemap", "Hreflang", "JSONLD", "CTA", "Snippet"], urlRows)}

## P0-2A Verification

Production snippet hygiene was checked on the target pages for unprotected view/comment/share/loading text, H1 availability, and first meaningful text. Detailed per-URL fields are in ${OUT_JSON}.

## P0-2B Verification

Internal CTA targets discovered in the checked production pages were fetched with GET only and verified for HTTP 200. Existing P0-2B script can be run separately against the production base URL for the original manifest.

## KO Track B Verification

KO Track B targets are included in the production URL table above.

## EN Track A Verification

EN Track A targets are included in the production URL table above. EN hrefs are checked as production URLs; any missing reciprocal hreflang is left as REVIEW rather than source-edited in this task.

## Mobile Browser Verification

- Status: ${data.browser.status}${data.browser.reason ? ` (${data.browser.reason})` : ""}
- Scope: production hard-load checks at 320px and 390px for horizontal overflow, H1 count, page errors, hydration errors, fatal console errors, and first interactive control position.

${browserRows.length ? markdownTable(["URL", "Width", "Overflow", "H1", "PageErrors", "Hydration", "FatalConsole", "FirstInputTop", "TableOverflow", "ResultText", "Pass"], browserRows) : "- Browser verification was skipped because no local browser executable was available."}

## Calculator Verification

${markdownTable(["URL", "Status", "Inputs", "Buttons", "CTA"], calcRows)}

Static production HTML checks passed where inputs/buttons/result text were present. The mobile browser pass above covers production rendering, hydration/page-error checks, and page-level overflow; GA4 DebugView and representative calculate-event receipt remain manual checks.

## GA4 Manual Checks

GA4 loader/config presence is recorded per URL in ${OUT_JSON}. DebugView and event receipt remain GA4_DEBUGVIEW_MANUAL_CHECK_REQUIRED.

## Sitemap and Robots

${markdownTable(["URL", "HTTP", "XML", "Locs", "DCA"], sitemapRows)}

- robots.txt HTTP: ${data.sitemaps.robots.status}
- robots core block: ${data.sitemaps.robots.disallowBlocksCore}
- robots sitemap refs: ${(data.sitemaps.robots.sitemapRefs || []).join(", ")}

## Observation Dates

- Deploy +72 hours: ${data.calendar.deployPlus72Hours}
- Deploy +7 days: ${data.calendar.deployPlus7Days}
- Deploy +28 days: ${data.calendar.deployPlus28Days}
- Deploy +42 days: ${data.calendar.deployPlus42Days}

## Files Created

- ${OUT_MD}
- ${OUT_JSON}
- ${OUT_CSV}
- ${OUT_CALENDAR}
- ${OBSERVATION_BASELINE}

## No Runtime Changes

This task only performed read-only production GET checks and local report/baseline updates. No content, calculator, GA4, ad, canonical, hreflang, sitemap, commit, push, or redeploy action was performed.

## Recommended Next Step

For 72 hours, monitor only technical status: HTTP, canonical, noindex, sitemap, calculator loading, and GA4. Do not rewrite content or meta during this window.
`;
}

async function main() {
  const baseUrl = arg("base-url", SITE);
  const deploymentInfo = buildDeploymentInfo();
  const targetUrls = TARGETS.map((target) => target.url);
  const sitemapProbe = await inspectSitemapsAndRobots(targetUrls, baseUrl);
  const sitemapLocs = sitemapProbe.allLocs;
  const urlResults = [];
  for (const target of TARGETS) {
    urlResults.push(await inspectPage(target, sitemapLocs, baseUrl));
  }
  const browser = await inspectBrowserTargets(
    TARGETS.map((target) => ({ ...target, url: absoluteUrl(baseUrl, toPathname(target.url)) }))
  );
  const calendar = buildObservationCalendar(deploymentInfo);
  const data = {
    generatedAt: GENERATED_AT,
    baseUrl,
    deploymentInfo,
    urlResults,
    browser,
    sitemaps: {
      sitemapResults: sitemapProbe.sitemapResults,
      robots: sitemapProbe.robots,
      targetMembership: sitemapProbe.targetMembership,
    },
    calendar,
  };
  data.verdict = verdictFor(data);
  data.observationBaselineUpdate =
    baseUrl.replace(/\/+$/, "") === SITE
      ? updateObservationBaseline(deploymentInfo, calendar, {
          generatedAt: GENERATED_AT,
          verdict: data.verdict.status,
          blockers: data.verdict.blockers,
          manualChecks: data.verdict.manualChecks,
          productionUrlCount: urlResults.length,
          mobileBrowserStatus: browser.status,
        })
      : {
          updated: false,
          reason: "Skipped for non-production baseUrl",
          baseUrl,
        };
  writeJson(OUT_JSON, data);
  writeJson(OUT_CALENDAR, calendar);
  writeCsv(
    OUT_CSV,
    urlResults.map((row) => ({
      mobile_browser_status: browserSummaryForUrl(browser, row.url).status,
      mobile_browser_pass: browserSummaryForUrl(browser, row.url).pass,
      mobile_browser_details: browserSummaryForUrl(browser, row.url).details,
      group: row.group,
      url: row.url,
      status: row.status,
      final_url: row.finalUrl,
      redirect_count: row.redirects.length,
      canonical: row.canonical,
      self_canonical: row.checks.selfCanonical,
      meta_noindex_absent: row.checks.noMetaNoindex,
      x_robots_noindex_absent: row.checks.noXRobotsNoindex,
      h1_count: row.h1Count,
      title_present: row.checks.titlePresent,
      description_present: row.checks.descriptionPresent,
      sitemap_membership: row.checks.sitemapMembership,
      expected_locale: row.checks.expectedLocale,
      hreflang_present: row.checks.hreflangPresent,
      jsonld_parse: row.checks.jsonLdParse,
      article_count: row.articleCount,
      faq_status: row.faq.status,
      cta_target_200: row.checks.ctaTarget200,
      not_error_screen: row.checks.notErrorScreen,
      snippet_hygiene: row.snippet.pass,
      calculator_static: row.calculator.status,
      ga4_loader_present: row.ga4.gtagLoaderPresent,
      pass: row.pass,
    })),
    [
      "group",
      "url",
      "mobile_browser_status",
      "mobile_browser_pass",
      "mobile_browser_details",
      "status",
      "final_url",
      "redirect_count",
      "canonical",
      "self_canonical",
      "meta_noindex_absent",
      "x_robots_noindex_absent",
      "h1_count",
      "title_present",
      "description_present",
      "sitemap_membership",
      "expected_locale",
      "hreflang_present",
      "jsonld_parse",
      "article_count",
      "faq_status",
      "cta_target_200",
      "not_error_screen",
      "snippet_hygiene",
      "calculator_static",
      "ga4_loader_present",
      "pass",
    ]
  );
  writeText(OUT_MD, renderReport(data));
  console.log(`[p1-2c] verdict=${data.verdict.status}`);
  console.log(`[p1-2c] blockers=${data.verdict.blockers.length}`);
  console.log(`[p1-2c] report=${OUT_MD}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[p1-2c] FAIL ${error.stack || error.message}`);
    process.exitCode = 1;
  });
}
