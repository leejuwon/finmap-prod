#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const cheerio = require("cheerio");
const matter = require("gray-matter");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.finmaphub.com";
const DEFAULT_BASE_URL = "http://127.0.0.1:8002";
const MODIFIED_DATE = "2026-07-22";

const TARGETS = [
  {
    id: "monthly_investment_target",
    path: "/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio",
    source: "content/posts/personalFinance/en/how-much-to-invest-monthly-for-target-portfolio.md",
    slug: "how-much-to-invest-monthly-for-target-portfolio",
    expectedTitle: "Monthly Investment Needed to Reach a Target Portfolio",
    expectedDescription:
      "The monthly investment needed depends on your current balance, target amount, timeline, expected return, fees, and taxes. Use the goal simulator to compare required contributions without treating the result as a guaranteed return.",
    firstAnswer: "The monthly investment needed for a target portfolio depends on your current balance",
    ctaHref: "/en/tools/goal-simulator",
    ctaAnchor: "Calculate the monthly investment for your goal",
    koPath: "",
    koSources: [
      "content/posts/personalFinance/ko/how-much-per-month-for-100m.md",
      "content/posts/personalFinance/ko/goal-amount-fast-strategy.md",
    ],
    hreflangMode: "no-explicit-counterpart",
  },
  {
    id: "annual_vs_monthly_compound",
    path: "/en/posts/personalFinance/annual-vs-monthly-compound",
    source: "content/posts/personalFinance/en/annual-vs-monthly-compound.md",
    slug: "annual-vs-monthly-compound",
    expectedTitle: "Annual vs Monthly Compounding: Which Grows Faster?",
    expectedDescription:
      "Monthly compounding can grow slightly faster than annual compounding at the same nominal rate. Compare examples by rate, time horizon, and contributions, and avoid double-counting APY or effective annual rates.",
    firstAnswer: "Monthly compounding can grow money slightly faster than annual compounding",
    ctaHref: "/en/tools/compound-interest",
    ctaAnchor: "Compare annual and monthly compounding",
    koPath: "/posts/personalFinance/annual-vs-monthly-compound",
    koSources: ["content/posts/personalFinance/ko/annual-vs-monthly-compound.md"],
    hreflangMode: "same-slug",
  },
  {
    id: "dca_bear_market",
    path: "/en/posts/personalFinance/is-dca-better-in-a-bear-market",
    source: "content/posts/personalFinance/en/is-dca-better-in-a-bear-market.md",
    slug: "is-dca-better-in-a-bear-market",
    expectedTitle: "Is Dollar-Cost Averaging Better in a Bear Market?",
    expectedDescription:
      "DCA is not automatically better in every bear market. Compare when dollar-cost averaging can reduce timing risk, when lump-sum investing can recover faster, and how drawdown timing changes the result.",
    firstAnswer: "DCA is not automatically better in every bear market",
    ctaHref: "/en/tools/dca-calculator",
    ctaAnchor: "Compare DCA and lump-sum scenarios",
    koPath: "/posts/personalFinance/is-dca-better-in-bear-market",
    koSources: ["content/posts/personalFinance/ko/is-dca-better-in-bear-market.md"],
    hreflangMode: "explicit",
  },
];

function arg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((item) => item.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

function abs(relPath) {
  return path.join(ROOT, relPath);
}

function read(relPath) {
  return fs.readFileSync(abs(relPath), "utf8");
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

async function fetchFollow(url, maxRedirects = 5) {
  let current = url;
  const redirects = [];
  for (let i = 0; i <= maxRedirects; i += 1) {
    const res = await fetch(current, {
      redirect: "manual",
      headers: { "user-agent": "FinMap P1-1B EN experiment verifier" },
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
    if (!fs.existsSync(abs(file))) continue;
    const xml = read(file);
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      locs.add(match[1].trim());
    }
  }
  return locs;
}

function readSitemapXml() {
  return [
    "public/sitemap-0.xml",
    "public/sitemap-ko.xml",
    "public/sitemap-en.xml",
    "public/en/sitemap.xml",
  ]
    .filter((file) => fs.existsSync(abs(file)))
    .map((file) => read(file))
    .join("\n");
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
  return $(".fm-post-body h3, .fm-post-body details summary")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter((text) => /\?$/.test(text));
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
    const pathname = parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, "") : parsed.pathname;
    links.add(`${pathname}${parsed.search || ""}`);
  });
  return Array.from(links).sort();
}

function extractHreflangs($) {
  const out = {};
  $('link[rel="alternate"][hreflang], link[rel="alternate"][hrefLang]').each((_, el) => {
    const key = String($(el).attr("hreflang") || $(el).attr("hrefLang") || "").trim();
    const href = String($(el).attr("href") || "").trim();
    if (key && href) out[key] = href;
  });
  return out;
}

function firstMeaningfulText($) {
  const bad = /views?\s*0|comments?|share|advertis|loading|no results?|category/i;
  const candidates = $(".fm-post-body p, .fm-post-body li, .fm-post-body td")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter((text) => text.length > 40);
  return candidates.find((text) => !bad.test(text)) || "";
}

function sourceChecks(target, checks) {
  const source = read(target.source);
  const parsed = matter(source);
  const data = parsed.data || {};
  const renderedTitle = data.seoTitle || data.title || "";
  const renderedDescription = data.seoDescription || data.description || "";

  add(checks, `${target.id} source slug unchanged`, data.slug === target.slug, data.slug);
  add(checks, `${target.id} source title expected`, renderedTitle === target.expectedTitle, renderedTitle);
  add(checks, `${target.id} source description expected`, renderedDescription === target.expectedDescription, renderedDescription);
  add(checks, `${target.id} source dateModified updated`, data.dateModified === MODIFIED_DATE, data.dateModified);
  add(checks, `${target.id} source first answer present`, parsed.content.includes(target.firstAnswer), target.firstAnswer);
  add(checks, `${target.id} source top CTA href`, parsed.content.includes(`href="${target.ctaHref}"`), target.ctaHref);
  add(checks, `${target.id} source top CTA anchor`, parsed.content.includes(target.ctaAnchor), target.ctaAnchor);
  add(checks, `${target.id} source CTA event reused`, parsed.content.includes('data-ga-event="related_calculator_click"'), "related_calculator_click");
  add(checks, `${target.id} source single explicit top CTA`, (parsed.content.match(/<div class="tool-cta">/g) || []).length === 1, "tool-cta count");
  add(checks, `${target.id} no manual Article JSON-LD`, !/"@type"\s*:\s*"Article"/.test(parsed.content), "manual Article absent");
  add(checks, `${target.id} no KO tool link in EN source`, !/href="\/tools\/|\]\(\/tools\//.test(parsed.content), "EN tool routes only");
}

function koSourceDiffChecks(checks) {
  const koSources = Array.from(new Set(TARGETS.flatMap((target) => target.koSources || []))).filter((file) => fs.existsSync(abs(file)));
  let changed = "";
  try {
    changed = execFileSync("git", ["diff", "--name-only", "--", ...koSources], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    add(checks, "KO counterpart source diff check runnable", false, error.message);
    return;
  }
  add(checks, "KO counterpart source diff absent", !changed, changed || koSources.join(", "));
}

async function checkBrokenInternalLinks(baseUrl, target, $, checks) {
  const links = collectInternalLinks($);
  const broken = [];
  for (const link of links) {
    const fetched = await fetchFollow(fetchUrl(baseUrl, link));
    if (fetched.res.status !== 200) broken.push(`${link}=${fetched.res.status}`);
  }
  add(checks, `${target.id} broken internal links absent`, broken.length === 0, broken.join("; ") || `${links.length} links checked`);
}

async function checkReciprocalHreflang(baseUrl, target, checks) {
  if (!target.koPath) {
    add(checks, `${target.id} KO alternate mode documented`, true, "no explicit KO counterpart in source/sitemap");
    return;
  }

  const koFetched = await fetchFollow(fetchUrl(baseUrl, target.koPath));
  const $ko = cheerio.load(koFetched.html);
  const koCanonical = normalizeText($ko('link[rel="canonical"]').attr("href"));
  const koHreflangs = extractHreflangs($ko);

  add(checks, `${target.id} KO alternate HTTP 200`, koFetched.res.status === 200, String(koFetched.res.status));
  add(checks, `${target.id} KO canonical self`, koCanonical === publicUrl(target.koPath), koCanonical);
  add(checks, `${target.id} KO reciprocal hreflang en`, koHreflangs.en === publicUrl(target.path), koHreflangs.en || "(missing)");
  add(checks, `${target.id} KO reciprocal hreflang ko`, koHreflangs.ko === publicUrl(target.koPath), koHreflangs.ko || "(missing)");
}

async function renderedChecks(baseUrl, target, sitemapLocs, sitemapXml, checks) {
  const fetched = await fetchFollow(fetchUrl(baseUrl, target.path));
  const $ = cheerio.load(fetched.html);
  const title = normalizeText($("head > title").first().text());
  const description = normalizeText($('meta[name="description"]').attr("content"));
  const canonical = normalizeText($('link[rel="canonical"]').attr("href"));
  const robots = normalizeText($('meta[name="robots"]').attr("content"));
  const htmlLang = normalizeText($("html").attr("lang"));
  const ogLocale = normalizeText($('meta[property="og:locale"]').attr("content"));
  const hreflangs = extractHreflangs($);
  const h1Texts = $("h1")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);
  const canonicalExpected = publicUrl(target.path);
  const bodyText = normalizeText($("body").text());
  const firstText = firstMeaningfulText($);

  add(checks, `${target.id} HTTP 200`, fetched.res.status === 200, String(fetched.res.status));
  add(checks, `${target.id} self canonical`, canonical === canonicalExpected, canonical);
  add(checks, `${target.id} meta noindex absent`, !/noindex/i.test(robots), robots || "(none)");
  add(checks, `${target.id} x-robots noindex absent`, !/noindex/i.test(fetched.res.headers.get("x-robots-tag") || ""), fetched.res.headers.get("x-robots-tag") || "(none)");
  add(checks, `${target.id} sitemap includes canonical`, sitemapLocs.has(canonicalExpected), canonicalExpected);
  add(checks, `${target.id} H1 one`, h1Texts.length === 1, h1Texts.join(" | "));
  add(checks, `${target.id} H1 expected`, h1Texts[0] === target.expectedTitle, h1Texts[0] || "(missing)");
  add(checks, `${target.id} title expected`, title === `${target.expectedTitle} | FinMap`, title);
  add(checks, `${target.id} description expected`, description === target.expectedDescription, description);
  add(checks, `${target.id} title not slug fallback`, title && !title.includes(target.slug), title);
  add(checks, `${target.id} description not slug fallback`, description && !description.includes(target.slug), description);
  add(checks, `${target.id} EN language metadata`, htmlLang === "en" || ogLocale === "en_US", `html=${htmlLang || "(missing)"}, og=${ogLocale || "(missing)"}`);
  add(checks, `${target.id} x-default policy kept`, !hreflangs["x-default"], hreflangs["x-default"] || "(none)");
  add(checks, `${target.id} self hreflang en`, hreflangs.en === canonicalExpected, hreflangs.en || "(missing)");

  if (target.koPath) {
    const koExpected = publicUrl(target.koPath);
    add(checks, `${target.id} KO hreflang expected`, hreflangs.ko === koExpected, hreflangs.ko || "(missing)");
    add(checks, `${target.id} sitemap reciprocal xhtml ko`, sitemapXml.includes(`hreflang="ko" href="${koExpected}"`), koExpected);
    add(checks, `${target.id} sitemap reciprocal xhtml en`, sitemapXml.includes(`hreflang="en" href="${canonicalExpected}"`), canonicalExpected);
  } else {
    add(checks, `${target.id} no explicit sitemap reciprocal required`, !sitemapXml.includes(`<loc>${canonicalExpected}</loc>`) || !sitemapXml.includes(`href="${canonicalExpected}"`), "no KO source counterpart");
  }

  const cta = $(`.fm-post-body a[href="${target.ctaHref}"]`)
    .filter((_, el) => normalizeText($(el).text()) === target.ctaAnchor)
    .first();
  add(checks, `${target.id} CTA present`, cta.length === 1, `${target.ctaAnchor} -> ${target.ctaHref}`);
  add(checks, `${target.id} rendered top CTA event`, cta.attr("data-ga-event") === "related_calculator_click", cta.attr("data-ga-event") || "(missing)");

  const ctaTarget = await fetchFollow(fetchUrl(baseUrl, target.ctaHref));
  add(checks, `${target.id} CTA target HTTP 200`, ctaTarget.res.status === 200, String(ctaTarget.res.status));

  const koToolLinks = $("a[href^='/tools/'], a[href^=\"/tools/\"]")
    .map((_, el) => String($(el).attr("href") || ""))
    .get();
  add(checks, `${target.id} no KO tool link in EN rendered`, koToolLinks.length === 0, koToolLinks.join(", ") || "none");
  add(checks, `${target.id} rendered first answer present`, bodyText.includes(target.firstAnswer), target.firstAnswer);
  add(checks, `${target.id} first meaningful text clean`, Boolean(firstText) && !/views?\s*0|comments?|share|advertis|loading|no results?|category/i.test(firstText), firstText);
  add(checks, `${target.id} Views 0 absent`, !/Views\s*0(?![0-9])/i.test(bodyText), "Views 0 not exposed");
  add(checks, `${target.id} comments nosnippet`, $('[data-snippet-region="post-comments"][data-nosnippet]').length === 1, "post-comments");
  add(checks, `${target.id} share nosnippet`, $('[data-snippet-region="post-share"][data-nosnippet]').length === 1, "post-share");

  const blocks = parseJsonLdBlocks($);
  const parseErrors = blocks.filter((block) => block.parseError);
  const articleLike = blocks.filter((block) => typeList(block).some((type) => type === "Article" || type === "BlogPosting"));
  const blogPosting = articleLike.find((block) => typeList(block).includes("BlogPosting"));
  add(checks, `${target.id} JSON-LD parseable`, parseErrors.length === 0, parseErrors.map((item) => item.error).join("; ") || `${blocks.length} blocks`);
  add(checks, `${target.id} Article/BlogPosting not duplicated`, articleLike.length === 1, `${articleLike.length} article-like blocks`);
  add(checks, `${target.id} BlogPosting headline expected`, blogPosting?.headline === target.expectedTitle, blogPosting?.headline || "(missing)");
  add(checks, `${target.id} BlogPosting description expected`, blogPosting?.description === target.expectedDescription, blogPosting?.description || "(missing)");
  add(checks, `${target.id} BlogPosting dateModified expected`, blogPosting?.dateModified === MODIFIED_DATE, blogPosting?.dateModified || "(missing)");
  add(checks, `${target.id} BlogPosting canonical URL`, blogPosting?.url === canonicalExpected, blogPosting?.url || "(missing)");

  const faqPages = findFaqPages(blocks);
  const visibleFaqs = renderedFaqQuestions($);
  if (faqPages.length) {
    const jsonFaqs = faqPages.flatMap((page) => (page.mainEntity || []).map((item) => normalizeText(item.name)));
    const missingVisible = jsonFaqs.filter((question) => !visibleFaqs.includes(question));
    const missingJson = visibleFaqs.filter((question) => !jsonFaqs.includes(question));
    add(checks, `${target.id} FAQPage single if present`, faqPages.length === 1, `${faqPages.length} FAQPage blocks`);
    add(checks, `${target.id} FAQ visible JSON-LD sync`, missingVisible.length === 0 && missingJson.length === 0, [...missingVisible, ...missingJson].join("; ") || `${jsonFaqs.length} FAQs`);
  } else {
    add(checks, `${target.id} FAQPage absent allowed`, true, "no FAQPage");
  }

  await checkReciprocalHreflang(baseUrl, target, checks);
  await checkBrokenInternalLinks(baseUrl, target, $, checks);

  return {
    path: target.path,
    title,
    description,
    h1: h1Texts[0] || "",
    firstMeaningfulText: firstText,
    firstCtaAnchor: normalizeText(cta.text()),
    canonical,
    hreflangs,
    jsonLdTypes: blocks.flatMap((block) => typeList(block)),
  };
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
        }));
        await page.close();
        const hydrationErrors = [...consoleErrors, ...pageErrors].filter((line) => /hydration|Hydration failed|did not match/i.test(line));
        add(checks, `${target.id} mobile ${width}px no horizontal overflow`, layout.scrollWidth <= layout.clientWidth + 1, `${layout.scrollWidth}/${layout.clientWidth}`);
        add(checks, `${target.id} mobile ${width}px one H1`, layout.h1Count === 1, String(layout.h1Count));
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
  const sitemapXml = readSitemapXml();
  const checks = [];
  const rendered = [];

  for (const target of TARGETS) sourceChecks(target, checks);
  koSourceDiffChecks(checks);

  for (const target of TARGETS) {
    rendered.push(await renderedChecks(baseUrl, target, sitemapLocs, sitemapXml, checks));
  }

  await browserChecks(baseUrl, checks);

  const failed = checks.filter((item) => !item.pass);
  for (const check of checks) {
    console.log(`${check.pass ? "PASS" : "FAIL"}\t${check.name}\t${check.details || "-"}`);
  }

  console.log("\nRendered snippet extract:");
  for (const item of rendered) {
    console.log(JSON.stringify(item, null, 2));
  }

  console.log(`Summary: ${checks.length - failed.length}/${checks.length} checks passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
