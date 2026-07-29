#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.finmaphub.com";
const ADS_SRC = "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
const ADS_CLIENT = "ca-pub-1869932115288976";

const TARGETS = [
  {
    path: "/tools/home-buying-budget-calculator",
    expectSlot: true,
    slotSourceFiles: ["_components/DsrLtvCalculator.js"],
  },
  {
    path: "/tools/mortgage-loan-calculator",
    expectSlot: false,
    slotSourceFiles: ["_components/MortgageLoanCalculator.js"],
    note: "No existing AdSense slot was present; ad count was intentionally not increased.",
  },
  {
    path: "/tools/dsr-ltv-calculator",
    expectSlot: true,
    slotSourceFiles: ["_components/DsrLtvCalculator.js"],
  },
  {
    path: "/tools/compound-interest",
    expectSlot: true,
    slotSourceFiles: ["pages/tools/compound-interest.js"],
  },
  {
    path: "/market/real-estate/seoul-top100",
    expectSlot: false,
    slotSourceFiles: ["_components/RealEstateTop100Landing.js"],
    note: "No existing AdSense slot was present on Top100 landing pages; ad count was intentionally not increased.",
  },
  {
    path: "/posts/personalFinance/apartment-buying-calculator-guide",
    expectSlot: true,
    slotSourceFiles: ["pages/posts/[category]/[slug].js"],
  },
];

function arg(name, fallback = "") {
  const prefix = `--${name}=`;
  const hit = process.argv.find((value) => value.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

function rel(...parts) {
  return path.join(ROOT, ...parts);
}

function normalizePathname(input) {
  const raw = String(input || "").trim();
  if (!raw) return "/";
  try {
    const parsed = new URL(raw, SITE);
    return parsed.pathname || "/";
  } catch {
    return raw.startsWith("/") ? raw : `/${raw}`;
  }
}

function builtHtmlCandidates(routePath) {
  const cleanPath = normalizePathname(routePath).replace(/^\/+/, "");
  const withoutEn = cleanPath.replace(/^en\//, "");
  const locale = cleanPath.startsWith("en/") ? "en" : "ko";
  return [
    rel(".next", "server", "pages", `${cleanPath}.html`),
    rel(".next", "server", "pages", locale, `${withoutEn}.html`),
    rel(".next", "server", "app", `${cleanPath}.html`),
    rel(".next", "server", "app", locale, `${withoutEn}.html`),
  ];
}

function readFirstExisting(candidates) {
  const found = candidates.find((file) => fs.existsSync(file));
  if (!found) return null;
  return {
    mode: "built-html",
    source: path.relative(ROOT, found).replace(/\\/g, "/"),
    html: fs.readFileSync(found, "utf8"),
  };
}

async function loadHtml(target, baseUrl) {
  if (baseUrl) {
    const url = `${baseUrl.replace(/\/+$/, "")}${target.path}`;
    const response = await fetch(url, { redirect: "manual" });
    return {
      mode: "http",
      source: url,
      status: response.status,
      html: await response.text(),
    };
  }

  const built = readFirstExisting(builtHtmlCandidates(target.path));
  if (built) return { ...built, status: 200 };

  return {
    mode: "source-fallback",
    source: "pages/_document.js",
    status: 0,
    html: "",
  };
}

function scriptTagAttrs(el) {
  const attrs = el.attribs || {};
  return Object.keys(attrs)
    .sort()
    .map((key) => `${key}=${attrs[key] || ""}`)
    .join(" ");
}

function inspectBootstrap(html) {
  const $ = cheerio.load(html || "");
  const tags = $(`script[src*="${ADS_SRC}"]`).toArray();
  const headTags = $(`head script[src*="${ADS_SRC}"]`).toArray();
  const hydrationSafeTags = $(`body script[data-finmap-adsense-bootstrap="after-next-script"][src*="${ADS_SRC}"]`).toArray();
  const attrs = tags.map(scriptTagAttrs);
  return {
    count: tags.length,
    headCount: headTags.length,
    hydrationSafeBodyCount: hydrationSafeTags.length,
    hasClient: attrs.some((item) => item.includes(ADS_CLIENT)),
    hasDataNscript: attrs.some((item) => /data-nscript/i.test(item)),
    attrs,
  };
}

function sourceBootstrapCheck() {
  const appSource = fs.readFileSync(rel("pages", "_app.js"), "utf8");
  const documentSource = fs.readFileSync(rel("pages", "_document.js"), "utf8");
  return {
    appHasPagead2: appSource.includes(ADS_SRC),
    documentHasPagead2: documentSource.includes(ADS_SRC),
    documentHasClient: documentSource.includes(ADS_CLIENT),
    documentUsesNextScriptForAds: /<Script\b[\s\S]+pagead2\.googlesyndication/.test(documentSource),
    documentUsesPlainScript: /<script[\s\S]+pagead2\.googlesyndication/i.test(documentSource),
    documentUsesHydrationSafeBodyScript:
      documentSource.includes('data-finmap-adsense-bootstrap="after-next-script"') &&
      documentSource.indexOf("<NextScript />") < documentSource.indexOf("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"),
  };
}

function sourceSlotCheck(target) {
  const details = [];
  let found = false;
  for (const file of target.slotSourceFiles || []) {
    const abs = rel(...file.split("/"));
    if (!fs.existsSync(abs)) {
      details.push(`${file}: missing`);
      continue;
    }
    const source = fs.readFileSync(abs, "utf8");
    const hasSlotComponent =
      source.includes("ResultAdSlot") ||
      source.includes("DashboardAdSlot") ||
      source.includes("AdSenseUnit") ||
      source.includes("AdResponsive") ||
      source.includes("AdInArticle");
    const hasIns = source.includes('className="adsbygoogle"') || source.includes("className='adsbygoogle'");
    if (hasSlotComponent || hasIns) found = true;
    details.push(`${file}: ${hasSlotComponent || hasIns ? "ad slot source found" : "no ad slot source"}`);
  }
  return { found, details };
}

function inspectSlots(html, target) {
  const $ = cheerio.load(html || "");
  const insCount = $("ins.adsbygoogle").length;
  const sourceCheck = sourceSlotCheck(target);
  const pass = target.expectSlot ? insCount > 0 || sourceCheck.found : true;
  return {
    expectSlot: target.expectSlot,
    insCount,
    sourceFound: sourceCheck.found,
    sourceDetails: sourceCheck.details,
    pass,
    note: target.note || "",
  };
}

function pushRuntimeCheck() {
  const hookPath = rel("_components", "useAdSenseSlot.js");
  const unitPath = rel("_components", "AdSenseUnit.js");
  const responsivePath = rel("_components", "AdResponsive.js");
  const inArticlePath = rel("_components", "AdInArticle.js");
  const resultPath = rel("_components", "ResultAdSlot.js");
  const dashboardPath = rel("_components", "DashboardAdSlot.js");

  const hook = fs.readFileSync(hookPath, "utf8");
  const unit = fs.readFileSync(unitPath, "utf8");
  const responsive = fs.readFileSync(responsivePath, "utf8");
  const inArticle = fs.readFileSync(inArticlePath, "utf8");
  const result = fs.readFileSync(resultPath, "utf8");
  const dashboard = fs.readFileSync(dashboardPath, "utf8");

  const checks = [
    ["helper exists", fs.existsSync(hookPath)],
    ["max attempts 5", hook.includes("DEFAULT_MAX_ATTEMPTS = 5")],
    ["retry interval 500ms", hook.includes("DEFAULT_RETRY_MS = 500")],
    ["checks data-adsbygoogle-status", hook.includes("data-adsbygoogle-status")],
    ["checks data-fm-ads-pushed", hook.includes("data-fm-ads-pushed")],
    ["marks bounded failure", hook.includes("data-fm-ads-push-failed")],
    ["uses adsbygoogle.push", hook.includes("window.adsbygoogle.push({})")],
    ["uses IntersectionObserver", hook.includes("IntersectionObserver")],
    ["no production warn spam", !hook.includes("console.warn")],
    ["AdSenseUnit uses helper", unit.includes("useAdSenseSlot")],
    ["AdResponsive uses helper", responsive.includes("useAdSenseSlot")],
    ["AdInArticle uses helper", inArticle.includes("useAdSenseSlot")],
    ["ResultAdSlot uses AdSenseUnit", result.includes("<AdSenseUnit")],
    ["DashboardAdSlot uses AdSenseUnit", dashboard.includes("<AdSenseUnit")],
  ];

  return {
    checks: checks.map(([name, pass]) => ({ name, pass })),
    pass: checks.every(([, pass]) => pass),
  };
}

function passLine(ok, label, details = "") {
  console.log(`${ok ? "PASS" : "FAIL"}\t${label}${details ? `\t${details}` : ""}`);
}

async function main() {
  const baseUrl = arg("base-url");
  const sourceBootstrap = sourceBootstrapCheck();
  const sourceBootstrapPass =
    !sourceBootstrap.appHasPagead2 &&
    sourceBootstrap.documentHasPagead2 &&
    sourceBootstrap.documentHasClient &&
    sourceBootstrap.documentUsesPlainScript &&
    !sourceBootstrap.documentUsesNextScriptForAds &&
    sourceBootstrap.documentUsesHydrationSafeBodyScript;

  passLine(sourceBootstrapPass, "source bootstrap", JSON.stringify(sourceBootstrap));

  const runtime = pushRuntimeCheck();
  for (const check of runtime.checks) {
    passLine(check.pass, `push runtime: ${check.name}`);
  }

  const targetResults = [];
  for (const target of TARGETS) {
    const loaded = await loadHtml(target, baseUrl);
    const bootstrap = loaded.html ? inspectBootstrap(loaded.html) : null;
    const slots = inspectSlots(loaded.html, target);
    const bootstrapPass =
      loaded.mode === "source-fallback"
        ? sourceBootstrapPass
        : bootstrap.count === 1 &&
          (bootstrap.headCount === 1 || bootstrap.hydrationSafeBodyCount === 1) &&
          bootstrap.hasClient &&
          !bootstrap.hasDataNscript;

    const pass = bootstrapPass && slots.pass;
    targetResults.push({ target, loaded, bootstrap, slots, pass });

    passLine(pass, target.path, `${loaded.mode} ${loaded.source}`);
    passLine(bootstrapPass, `${target.path} bootstrap`, bootstrap ? JSON.stringify(bootstrap) : "source fallback");
    passLine(
      slots.pass,
      `${target.path} slot`,
      `expect=${slots.expectSlot} ins=${slots.insCount} source=${slots.sourceFound}${slots.note ? ` note=${slots.note}` : ""}`
    );
  }

  const allPass = sourceBootstrapPass && runtime.pass && targetResults.every((result) => result.pass);
  if (!allPass) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
