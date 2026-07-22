#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const SITE_URL = "https://www.finmaphub.com";
const DEFAULT_BASE_URL = "http://127.0.0.1:8002";
const OUT_JSON = path.join("reports", "search-growth-90d-p0-2a-snippet-hygiene-rendered.json");

const TARGETS = [
  { path: "/posts/investingInfo/rates-discount-mortgage-demand-apt-prices", type: "post", locale: "ko" },
  { path: "/posts/personalFinance/apartment-buying-calculator-guide", type: "post", locale: "ko" },
  { path: "/posts/personalFinance/ltv-dsr-calculator-guide", type: "post", locale: "ko" },
  { path: "/posts/personalFinance/salary-40m-mortgage-limit", type: "post", locale: "ko" },
  { path: "/posts/economicInfo/interest-rate-basics", type: "post", locale: "ko" },
  { path: "/en/posts/personalFinance/dsr-40-income-loan-limit-table", type: "post", locale: "en" },
  { path: "/tools/compound-interest", type: "tool", locale: "ko" },
  { path: "/tools/goal-simulator", type: "tool", locale: "ko" },
  { path: "/tools/cagr-calculator", type: "tool", locale: "ko" },
  { path: "/tools/dsr-ltv-calculator", type: "tool", locale: "ko" },
  { path: "/tools/home-buying-budget-calculator", type: "tool", locale: "ko" },
  { path: "/tools/mortgage-loan-calculator", type: "tool", locale: "ko" },
  { path: "/market/real-estate/gyeonggi-apartment-top100", type: "market", locale: "ko" },
  { path: "/en/tools/compound-interest", type: "tool", locale: "en" },
  { path: "/en/tools/goal-simulator", type: "tool", locale: "en" },
  { path: "/en/tools/cagr-calculator", type: "tool", locale: "en" },
];

const BAD_GLOBAL_PATTERNS = [
  { id: "ko_view_zero", re: /조회수\s*0(?![0-9])/ },
  { id: "en_view_zero", re: /Views\s*0(?![0-9])/i },
  { id: "ko_loading", re: /로딩\s*중|불러오는\s*중/ },
  { id: "en_loading", re: /\bLoading\b/i },
  { id: "ko_empty_result", re: /결과가\s*없습니다|계산\s*결과가\s*표시됩니다/ },
  { id: "en_empty_result", re: /\bNo results?\b|Result area was not found|results? will appear/i },
];

const BAD_POST_UI_PATTERNS = [
  { id: "ko_empty_comments", re: /아직\s*댓글이\s*없습니다/ },
  { id: "en_empty_comments", re: /No comments yet/i },
  { id: "share_button_text", re: /공유하기|X\(Twitter\)|Facebook|\bShare\b/ },
];

const BAD_TOOL_UI_PATTERNS = [
  { id: "tool_share_panel", re: /share\s*&\s*cite|Share this calculator|Share calculator|Copy canonical URL|canonical URL 복사|계산기 공유하기/i },
];

function arg(name, fallback = null) {
  const prefix = `--${name}=`;
  const item = process.argv.find((value) => value.startsWith(prefix));
  return item ? item.slice(prefix.length) : fallback;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
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
    if (!fs.existsSync(file)) continue;
    const xml = fs.readFileSync(file, "utf8");
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      locs.add(match[1].trim());
    }
  }
  return locs;
}

async function fetchFollow(url, maxRedirects = 5) {
  let current = url;
  const redirects = [];
  for (let i = 0; i <= maxRedirects; i += 1) {
    const res = await fetch(current, {
      redirect: "manual",
      headers: { "user-agent": "FinMap snippet hygiene verifier" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      const next = new URL(res.headers.get("location"), current).toString();
      redirects.push({ status: res.status, from: current, to: next });
      current = next;
      continue;
    }
    return { res, finalUrl: current, redirects, html: await res.text() };
  }
  throw new Error(`Too many redirects for ${url}`);
}

function nodeHasNosnippetAncestor($, node) {
  let current = node && node.parent;
  while (current) {
    if (current.type === "tag" && current.attribs && Object.prototype.hasOwnProperty.call(current.attribs, "data-nosnippet")) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function collectBodyText($, { includeNosnippet = false } = {}) {
  const body = $("body")[0];
  const chunks = [];

  function visit(node, protectedByNosnippet) {
    if (!node) return;
    if (node.type === "tag") {
      const name = String(node.name || "").toLowerCase();
      if (["script", "style", "noscript", "svg"].includes(name)) return;
      const nextProtected =
        protectedByNosnippet ||
        Boolean(node.attribs && Object.prototype.hasOwnProperty.call(node.attribs, "data-nosnippet"));
      for (const child of node.children || []) visit(child, nextProtected);
      return;
    }
    if (node.type === "text" && (includeNosnippet || !protectedByNosnippet)) {
      const text = normalizeText(node.data);
      if (text) chunks.push(text);
    }
  }

  visit(body, false);
  return normalizeText(chunks.join(" "));
}

function findHits(text, patterns) {
  return patterns.filter((item) => item.re.test(text)).map((item) => item.id);
}

function hasProtectedRegion($, region) {
  const nodes = $(`[data-snippet-region="${region}"]`).toArray();
  return {
    exists: nodes.length > 0,
    protected: nodes.length > 0 && nodes.every((node) => node.attribs && Object.prototype.hasOwnProperty.call(node.attribs, "data-nosnippet")),
  };
}

function isInsideNosnippet($, selector) {
  const node = $(selector).first()[0];
  if (!node) return false;
  const selfProtected = node.attribs && Object.prototype.hasOwnProperty.call(node.attribs, "data-nosnippet");
  return Boolean(selfProtected || nodeHasNosnippetAncestor($, node));
}

function inspectHtml(target, html, finalUrl, status, sitemapLocs) {
  const $ = cheerio.load(html);
  const title = normalizeText($("head > title").first().text());
  const description = normalizeText($('meta[name="description"]').attr("content"));
  const canonical = normalizeText($('link[rel="canonical"]').attr("href"));
  const robots = normalizeText($('meta[name="robots"]').attr("content"));
  const h1Nodes = $("h1").toArray();
  const h1Texts = h1Nodes.map((node) => normalizeText($(node).text())).filter(Boolean);
  const canonicalExpected = `${SITE_URL}${target.path}`;
  const sitemapLoc = canonical || canonicalExpected;
  const unprotectedText = collectBodyText($, { includeNosnippet: false });
  const allText = collectBodyText($, { includeNosnippet: true });
  const globalHits = findHits(unprotectedText, BAD_GLOBAL_PATTERNS);
  const postHits = target.type === "post" ? findHits(unprotectedText, BAD_POST_UI_PATTERNS) : [];
  const toolHits = target.type === "tool" ? findHits(unprotectedText, BAD_TOOL_UI_PATTERNS) : [];
  const postViewRegion = hasProtectedRegion($, "post-views");
  const postCommentsRegion = hasProtectedRegion($, "post-comments");
  const postShareRegion = hasProtectedRegion($, "post-share");
  const toolShareRegion = hasProtectedRegion($, "tool-share");
  const postBody = target.type === "post" ? $(".fm-post-body").first() : null;
  const firstBodyText =
    target.type === "post"
      ? normalizeText(postBody?.text()).slice(0, 280)
      : unprotectedText.slice(0, 280);

  const checks = [];
  const add = (name, pass, details = "") => checks.push({ name, pass: Boolean(pass), details });

  add("http_200", status === 200, String(status));
  add("title_exists", Boolean(title), title);
  add("description_exists", Boolean(description), description);
  add("self_canonical", canonical === canonicalExpected, canonical || "(missing)");
  add("no_noindex", !/noindex/i.test(robots), robots || "(none)");
  add("h1_exactly_one", h1Texts.length === 1, h1Texts.join(" | "));
  add("h1_not_nosnippet", !isInsideNosnippet($, "h1"), h1Texts[0] || "(missing)");
  add("sitemap_membership", sitemapLocs.has(sitemapLoc), sitemapLoc);
  add("no_unprotected_global_bad_text", globalHits.length === 0, globalHits.join(", ") || "none");
  if (target.type === "post") {
    add("no_unprotected_post_ui_text", postHits.length === 0, postHits.join(", ") || "none");
    add("comments_region_protected", postCommentsRegion.exists && postCommentsRegion.protected, JSON.stringify(postCommentsRegion));
    add("share_region_protected", postShareRegion.exists && postShareRegion.protected, JSON.stringify(postShareRegion));
    add("article_body_not_nosnippet", !isInsideNosnippet($, ".fm-post-body"), firstBodyText);
    add("article_body_text_exists", Boolean(firstBodyText), firstBodyText);
    add("views_zero_not_rendered", !/조회수\s*0(?![0-9])|Views\s*0(?![0-9])/i.test(allText), postViewRegion.exists ? JSON.stringify(postViewRegion) : "no view region rendered");
    if (postViewRegion.exists) {
      add("views_region_protected_when_rendered", postViewRegion.protected, JSON.stringify(postViewRegion));
    }
  }
  if (target.type === "tool") {
    add("no_unprotected_tool_share_text", toolHits.length === 0, toolHits.join(", ") || "none");
    if (toolShareRegion.exists) {
      add("tool_share_region_protected", toolShareRegion.protected, JSON.stringify(toolShareRegion));
    }
    add("tool_intro_text_exists", Boolean(firstBodyText), firstBodyText);
  }

  return {
    ...target,
    status,
    finalUrl,
    title,
    description,
    canonical,
    robots,
    h1_count: h1Texts.length,
    h1_texts: h1Texts,
    first_body_text: firstBodyText,
    unprotected_hits: [...globalHits, ...postHits, ...toolHits],
    protected_regions: {
      post_views: postViewRegion,
      post_comments: postCommentsRegion,
      post_share: postShareRegion,
      tool_share: toolShareRegion,
    },
    checks,
    pass: checks.every((check) => check.pass),
  };
}

function findBrowserExecutable() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) || "";
}

async function runBrowserChecks(baseUrl, targets) {
  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    return {
      status: "SKIPPED",
      reason: "No local Chrome or Edge executable found for puppeteer-core.",
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
      const page = await browser.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      await page.setViewport({ width: 320, height: 900, deviceScaleFactor: 1, isMobile: true });
      await page.goto(`${baseUrl}${target.path}`, { waitUntil: "networkidle0", timeout: 45000 });
      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyText: document.body.innerText.slice(0, 300),
      }));
      await page.close();
      const hydrationErrors = [...consoleErrors, ...pageErrors].filter((line) => /hydration|Hydration failed|did not match/i.test(line));
      results.push({
        path: target.path,
        viewport: "320x900",
        horizontal_overflow: layout.scrollWidth > layout.clientWidth + 1,
        scrollWidth: layout.scrollWidth,
        clientWidth: layout.clientWidth,
        console_status: consoleErrors.length === 0 ? "PASS" : "WARN",
        console_error_count: consoleErrors.length,
        page_error_count: pageErrors.length,
        hydration_error_count: hydrationErrors.length,
        sample_console_errors: consoleErrors.slice(0, 5),
        pass: layout.scrollWidth <= layout.clientWidth + 1 && pageErrors.length === 0 && hydrationErrors.length === 0,
      });
    }
  } finally {
    await browser.close();
  }

  return {
    status: "RUN",
    executablePath,
    results,
  };
}

async function main() {
  const baseUrl = (arg("base-url", DEFAULT_BASE_URL) || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const sitemapLocs = readSitemapLocs();
  const rendered = [];

  for (const target of TARGETS) {
    const url = `${baseUrl}${target.path}`;
    try {
      const fetched = await fetchFollow(url);
      const result = inspectHtml(target, fetched.html, fetched.finalUrl, fetched.res.status, sitemapLocs);
      rendered.push(result);
      console.log(`${result.pass ? "PASS" : "FAIL"}\t${target.path}\t${result.status}\t${result.canonical || "-"}`);
      for (const check of result.checks.filter((item) => !item.pass)) {
        console.log(`  FAIL\t${check.name}\t${check.details}`);
      }
    } catch (error) {
      const result = {
        ...target,
        status: 0,
        finalUrl: url,
        checks: [{ name: "fetch", pass: false, details: error.message }],
        pass: false,
        error: error.message,
      };
      rendered.push(result);
      console.log(`FAIL\t${target.path}\tFETCH\t${error.message}`);
    }
  }

  const browser = await runBrowserChecks(baseUrl, TARGETS.filter((target) => target.type === "post" || target.type === "tool"));
  if (browser.status === "RUN") {
    for (const item of browser.results) {
      console.log(`${item.pass ? "PASS" : "FAIL"}\tmobile_320\t${item.path}\toverflow=${item.horizontal_overflow}\tconsoleErrors=${item.console_error_count}\thydration=${item.hydration_error_count}`);
    }
  } else {
    console.log(`SKIP\tmobile_browser\t${browser.reason}`);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    rendered_total: rendered.length,
    rendered_pass: rendered.filter((item) => item.pass).length,
    rendered_fail: rendered.filter((item) => !item.pass).length,
    browser_status: browser.status,
    browser_console_warning_pages:
      browser.status === "RUN"
        ? browser.results.filter((item) => item.console_error_count > 0).length
        : 0,
    browser_pass:
      browser.status === "RUN"
        ? browser.results.filter((item) => item.pass).length
        : 0,
    browser_fail:
      browser.status === "RUN"
        ? browser.results.filter((item) => !item.pass).length
        : 0,
  };

  const output = { summary, rendered, browser };
  ensureDir(OUT_JSON);
  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2), "utf8");
  console.log(`Wrote ${OUT_JSON}`);

  if (summary.rendered_fail > 0 || (browser.status === "RUN" && summary.browser_fail > 0)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
