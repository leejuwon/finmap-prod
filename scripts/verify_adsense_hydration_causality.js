#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.finmaphub.com";
const OUT_JSON = path.join(ROOT, "reports", "search-growth-p1-2c-3-adsense-causality-ab.json");
const OUT_CSV = path.join(ROOT, "reports", "search-growth-p1-2c-3-adsense-causality-ab.csv");
const OUT_EDGE_JSON = path.join(ROOT, "reports", "search-growth-p1-2c-3-edge-build-consistency.json");
const OUT_MUTATION_JSON = path.join(ROOT, "reports", "search-growth-p1-2c-3-dom-mutation-trace.json");

const PRIMARY_TARGET = { group: "primary", path: "/tools/mortgage-loan-calculator", locale: "ko" };
const EXTRA_TARGETS = [
  { group: "extra", path: "/en/tools/mortgage-loan-calculator", locale: "en" },
  { group: "extra", path: "/tools/compound-interest", locale: "ko" },
  { group: "extra", path: "/tools/home-buying-budget-calculator", locale: "ko" },
  { group: "extra", path: "/tools/dsr-ltv-calculator", locale: "ko" },
  { group: "extra", path: "/posts/personalFinance/what-is-cagr", locale: "ko" },
];

const VIEWPORTS = [
  { name: "320", width: 320, height: 800, isMobile: true },
  { name: "390", width: 390, height: 844, isMobile: true },
  { name: "1280", width: 1280, height: 900, isMobile: false },
];

const CONDITIONS = [
  {
    name: "CONTROL",
    description: "Allow all requests.",
  },
  {
    name: "BLOCK_BOOTSTRAP_ONLY",
    description: "Block only the adsbygoogle.js bootstrap request.",
  },
  {
    name: "ALLOW_BOOTSTRAP_BLOCK_AD_REQUESTS",
    description: "Allow the bootstrap script, block downstream ad requests and ad iframes.",
  },
  {
    name: "BLOCK_ALL_AD_DOMAINS",
    description: "Block AdSense bootstrap and downstream ad domains.",
  },
];

const ADS_BOOTSTRAP_RE = /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i;
const AD_DOMAIN_RE =
  /googlesyndication\.com|googleads\.g\.doubleclick\.net|securepubads\.g\.doubleclick\.net|googleadservices\.com|adtrafficquality\.google|fundingchoicesmessages\.google\.com/i;
const DOWNSTREAM_AD_RE =
  /googleads\.g\.doubleclick\.net|securepubads\.g\.doubleclick\.net|googleadservices\.com|tpc\.googlesyndication\.com|adtrafficquality\.google|fundingchoicesmessages\.google\.com|pagead2\.googlesyndication\.com\/pagead\/(?!js\/adsbygoogle\.js)/i;
const HYDRATION_RE = /hydration|Hydration failed|did not match|Minified React error #418|react\.dev\/errors\/418/i;
const REACT_CODE_RE = /Minified React error #(\d+)/i;
const NEXT_SCRIPT_RE = /\/_next\/static\/[^"'?]+\.js/i;

function arg(name, fallback = "") {
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

function csvEscape(value) {
  if (value === undefined || value === null) return "";
  const text = Array.isArray(value) ? value.join("|") : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(filePath, rows, headers) {
  ensureDir(filePath);
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function hashText(value) {
  return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function absoluteUrl(pathname) {
  return new URL(pathname, SITE).toString();
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
    .find((candidate) => fs.existsSync(candidate));
}

function shouldBlock(url, conditionName) {
  if (conditionName === "CONTROL") return false;
  if (conditionName === "BLOCK_BOOTSTRAP_ONLY") return ADS_BOOTSTRAP_RE.test(url);
  if (conditionName === "ALLOW_BOOTSTRAP_BLOCK_AD_REQUESTS") return DOWNSTREAM_AD_RE.test(url);
  if (conditionName === "BLOCK_ALL_AD_DOMAINS") return AD_DOMAIN_RE.test(url);
  return false;
}

function classifyCondition(summary) {
  const control = summary.find((row) => row.condition === "CONTROL");
  const blockBootstrap = summary.find((row) => row.condition === "BLOCK_BOOTSTRAP_ONLY");
  const allowBootstrapBlockAds = summary.find((row) => row.condition === "ALLOW_BOOTSTRAP_BLOCK_AD_REQUESTS");
  const blockAll = summary.find((row) => row.condition === "BLOCK_ALL_AD_DOMAINS");

  if (control?.runs > 0 && control.react418 === 0) return "CONTROL_NO_REACT_418";
  if (control?.react418 > 0 && blockBootstrap?.react418 === 0) return "ADSENSE_BOOTSTRAP_CAUSALITY_CONFIRMED";
  if (
    control?.react418 > 0 &&
    blockBootstrap?.react418 === 0 &&
    allowBootstrapBlockAds?.react418 > 0
  ) {
    return "ADSENSE_BOOTSTRAP_EXECUTION_CAUSALITY_CONFIRMED";
  }
  if (control?.react418 > 0 && allowBootstrapBlockAds?.react418 === 0 && blockAll?.react418 === 0) {
    return "ADSENSE_SLOT_MUTATION_CAUSALITY_CONFIRMED";
  }
  if (control?.react418 > 0 && blockAll?.react418 > 0) return "ADSENSE_NOT_CAUSAL";
  return "INCONCLUSIVE";
}

function mutationProbeSource() {
  return `
(() => {
  const max = 120;
  const start = Date.now();
  window.__FINMAP_MUTATIONS__ = [];
  function shortNode(node) {
    if (!node) return "";
    if (node.nodeType === 3) return "#text:" + String(node.textContent || "").slice(0, 60);
    if (node.nodeType !== 1) return String(node.nodeName || node.nodeType);
    const el = node;
    const attrs = ["id", "class", "src", "href", "data-ad-client", "data-ad-slot", "data-adsbygoogle-status"]
      .map((name) => {
        const value = el.getAttribute && el.getAttribute(name);
        return value ? name + "=" + String(value).slice(0, 90) : "";
      })
      .filter(Boolean)
      .join(" ");
    return "<" + String(el.tagName || "").toLowerCase() + (attrs ? " " + attrs : "") + ">";
  }
  function isNearNext(node) {
    try {
      const next = document.getElementById("__next");
      if (!next || !node) return false;
      if (node === next || next.contains(node)) return true;
      if (node.parentNode && (node.parentNode === next || next.contains(node.parentNode))) return true;
      if (node.previousSibling === next || node.nextSibling === next) return true;
    } catch {}
    return false;
  }
  function record(method, target, detail) {
    if (window.__FINMAP_MUTATIONS__.length >= max) return;
    if (!isNearNext(target) && !isNearNext(detail && detail.node)) return;
    window.__FINMAP_MUTATIONS__.push({
      atMs: Date.now() - start,
      method,
      readyState: document.readyState,
      target: shortNode(target),
      node: shortNode(detail && detail.node),
      name: detail && detail.name || "",
      value: detail && detail.value || "",
      adsbygoogleType: typeof window.adsbygoogle,
      stack: String((new Error()).stack || "").split("\\n").slice(2, 8).join(" | ")
    });
  }
  const methods = [
    [Node.prototype, "appendChild", function(original, node) {
      record("appendChild", this, { node });
      return original.call(this, node);
    }],
    [Node.prototype, "insertBefore", function(original, node, ref) {
      record("insertBefore", this, { node });
      return original.call(this, node, ref);
    }],
    [Node.prototype, "replaceChild", function(original, node, oldNode) {
      record("replaceChild", this, { node });
      return original.call(this, node, oldNode);
    }],
    [Element.prototype, "setAttribute", function(original, name, value) {
      record("setAttribute", this, { name, value: String(value).slice(0, 90) });
      return original.call(this, name, value);
    }],
    [Element.prototype, "remove", function(original) {
      record("remove", this, {});
      return original.call(this);
    }],
  ];
  for (const [proto, name, wrapper] of methods) {
    const original = proto[name];
    if (typeof original !== "function") continue;
    Object.defineProperty(proto, name, {
      configurable: true,
      writable: true,
      value: function(...args) {
        return wrapper.call(this, original, ...args);
      },
    });
  }
})();
`;
}

async function collectHtmlSnapshot(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "FinMap P1-2C-3 build consistency verifier",
      "cache-control": "no-cache",
    },
  });
  const html = await response.text();
  const headers = Object.fromEntries(response.headers.entries());
  const nextDataMatch = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  let nextData = null;
  try {
    nextData = nextDataMatch ? JSON.parse(nextDataMatch[1]) : null;
  } catch {}
  const scriptUrls = [...html.matchAll(/<script[^>]+src=["']([^"']*\/_next\/static\/[^"']+\.js[^"']*)["']/gi)]
    .map((match) => new URL(match[1], url).toString());
  const buildId = nextData?.buildId || "";
  const manifestUrl = buildId ? new URL(`/_next/static/${buildId}/_buildManifest.js`, SITE).toString() : "";
  let manifest = null;
  if (manifestUrl) {
    try {
      const manifestResponse = await fetch(manifestUrl, { redirect: "follow" });
      const manifestText = await manifestResponse.text();
      manifest = {
        url: manifestUrl,
        status: manifestResponse.status,
        headers: Object.fromEntries(manifestResponse.headers.entries()),
        hash: hashText(manifestText),
        length: manifestText.length,
      };
    } catch (error) {
      manifest = { url: manifestUrl, status: "ERROR", error: error.message };
    }
  }

  const chunkStatuses = [];
  for (const scriptUrl of scriptUrls.slice(0, 12)) {
    try {
      const scriptResponse = await fetch(scriptUrl, { redirect: "follow" });
      const text = await scriptResponse.text();
      chunkStatuses.push({
        url: scriptUrl,
        status: scriptResponse.status,
        hash: hashText(text),
        length: text.length,
        cacheControl: scriptResponse.headers.get("cache-control") || "",
        etag: scriptResponse.headers.get("etag") || "",
      });
    } catch (error) {
      chunkStatuses.push({ url: scriptUrl, status: "ERROR", error: error.message });
    }
  }

  return {
    url,
    finalUrl: response.url,
    status: response.status,
    headers: {
      cacheControl: headers["cache-control"] || "",
      contentEncoding: headers["content-encoding"] || "",
      contentType: headers["content-type"] || "",
      age: headers.age || "",
      etag: headers.etag || "",
      server: headers.server || "",
      xVercelCache: headers["x-vercel-cache"] || "",
      cfCacheStatus: headers["cf-cache-status"] || "",
    },
    htmlHash: hashText(html),
    htmlLength: html.length,
    buildId,
    page: nextData?.page || "",
    scriptUrls,
    manifest,
    chunkStatuses,
  };
}

async function createCleanPage(browser, viewport, conditionName) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
  });
  await page.evaluateOnNewDocument(mutationProbeSource());
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (shouldBlock(request.url(), conditionName)) {
      request.abort();
      return;
    }
    request.continue();
  });
  return { context, page };
}

async function inspectRun(browser, condition, target, viewport, run) {
  const url = absoluteUrl(target.path);
  const { context, page } = await createCleanPage(browser, viewport, condition.name);
  const consoleErrors = [];
  const pageErrors = [];
  const responses = [];
  const blockedRequests = [];
  const requestFailures = [];
  const mutationTrace = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error" || HYDRATION_RE.test(text) || /adsbygoogle|no_div|TagError|duplicate/i.test(text)) {
      consoleErrors.push({ type: msg.type(), text });
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message || String(error)));
  page.on("requestfailed", (request) => {
    const row = {
      url: request.url(),
      resourceType: request.resourceType(),
      errorText: request.failure()?.errorText || "",
    };
    if (shouldBlock(row.url, condition.name)) blockedRequests.push(row);
    else requestFailures.push(row);
  });
  page.on("response", (response) => {
    const responseUrl = response.url();
    if (
      responseUrl === url ||
      ADS_BOOTSTRAP_RE.test(responseUrl) ||
      DOWNSTREAM_AD_RE.test(responseUrl) ||
      NEXT_SCRIPT_RE.test(responseUrl)
    ) {
      responses.push({
        url: responseUrl,
        status: response.status(),
        fromCache: response.fromCache(),
        resourceType: response.request().resourceType(),
        headers: responseUrl === url ? response.headers() : undefined,
      });
    }
  });

  let navigationError = "";
  let mainStatus = null;
  try {
    const mainResponse = await page.goto(url, { waitUntil: "load", timeout: 60000 });
    mainStatus = mainResponse?.status() || null;
  } catch (error) {
    navigationError = error.message;
  }
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const runtime = await page.evaluate(() => {
    const scripts = Array.from(document.scripts).map((script, index) => ({
      index,
      src: script.src || "",
      defer: script.defer === true,
      async: script.async === true,
      marker: script.getAttribute("data-finmap-adsense-bootstrap") || "",
      dataNscript: script.getAttribute("data-nscript") || "",
    }));
    const adsScripts = scripts.filter((script) => script.src.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"));
    const slots = Array.from(document.querySelectorAll("ins.adsbygoogle")).map((slot, index) => ({
      index,
      adsStatus: slot.getAttribute("data-adsbygoogle-status") || "",
      fmPushed: slot.getAttribute("data-fm-ads-pushed") || "",
      fmFailed: slot.getAttribute("data-fm-ads-push-failed") || "",
      fmAttempts: slot.getAttribute("data-fm-ads-push-attempts") || "",
      adStatus: slot.getAttribute("data-ad-status") || "",
      rectHeight: Math.round(slot.getBoundingClientRect().height),
    }));
    const nextData = document.getElementById("__NEXT_DATA__")?.textContent || "";
    let buildId = "";
    try {
      buildId = JSON.parse(nextData).buildId || "";
    } catch {}
    return {
      href: location.href,
      readyState: document.readyState,
      buildId,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      h1Count: document.querySelectorAll("h1").length,
      inputCount: document.querySelectorAll("input,select,textarea").length,
      ctaCount: document.querySelectorAll("a[href*='/tools/'],a[href*='/market/real-estate']").length,
      adsScripts,
      slots,
      adsbygoogleType: typeof window.adsbygoogle,
      adsbygooglePushType: typeof window.adsbygoogle?.push,
      mutations: window.__FINMAP_MUTATIONS__ || [],
    };
  });

  mutationTrace.push(...runtime.mutations.slice(0, 120));
  const hydrationMessages = [
    ...consoleErrors.map((item) => item.text),
    ...pageErrors,
  ].filter((line) => HYDRATION_RE.test(line));
  const reactCodes = [...new Set(hydrationMessages.map((line) => line.match(REACT_CODE_RE)?.[1]).filter(Boolean))];
  const bootstrapResponses = responses.filter((row) => ADS_BOOTSTRAP_RE.test(row.url));
  const adResponses = responses.filter((row) => DOWNSTREAM_AD_RE.test(row.url));
  const slotPushed = runtime.slots.some((slot) => slot.fmPushed === "1" || slot.adsStatus);
  const slotFailed = runtime.slots.some((slot) => slot.fmFailed);

  const result = {
    generatedAt: new Date().toISOString(),
    condition: condition.name,
    conditionDescription: condition.description,
    targetGroup: target.group,
    path: target.path,
    locale: target.locale,
    url,
    viewport: viewport.name,
    width: viewport.width,
    height: viewport.height,
    run,
    pass: !navigationError && hydrationMessages.length === 0 && pageErrors.length === 0,
    navigationError,
    mainStatus,
    buildId: runtime.buildId,
    react418: reactCodes.includes("418") ? 1 : 0,
    hydrationErrorCount: hydrationMessages.length,
    reactErrorCodes: reactCodes,
    pageErrorCount: pageErrors.length,
    otherPageErrorCount: pageErrors.filter((line) => !HYDRATION_RE.test(line)).length,
    consoleErrorCount: consoleErrors.length,
    bootstrapLoaded: bootstrapResponses.some((row) => row.status >= 200 && row.status < 400) || runtime.adsScripts.length > 0,
    bootstrapScriptCount: runtime.adsScripts.length,
    bootstrapRequestCount: bootstrapResponses.length,
    adRequestCount: adResponses.length,
    blockedRequestCount: blockedRequests.length,
    slotCount: runtime.slots.length,
    slotPushed,
    slotFailed,
    slotStatusCount: runtime.slots.filter((slot) => slot.adsStatus).length,
    slotFailedCount: runtime.slots.filter((slot) => slot.fmFailed).length,
    adsbygoogleType: runtime.adsbygoogleType,
    adsbygooglePushType: runtime.adsbygooglePushType,
    horizontalOverflow: runtime.scrollWidth > runtime.clientWidth + 1,
    h1Count: runtime.h1Count,
    inputCount: runtime.inputCount,
    ctaCount: runtime.ctaCount,
    consoleErrors: consoleErrors.slice(0, 6),
    pageErrors: pageErrors.slice(0, 6),
    blockedRequests: blockedRequests.slice(0, 8),
    requestFailures: requestFailures.slice(0, 8),
    mutationCount: mutationTrace.length,
    mutationSample: mutationTrace.slice(0, 12),
  };

  await context.close().catch(() => {});
  return result;
}

function summarizeRows(rows) {
  const byCondition = CONDITIONS.map((condition) => {
    const conditionRows = rows.filter((row) => row.condition === condition.name && row.targetGroup === "primary");
    return {
      condition: condition.name,
      runs: conditionRows.length,
      react418: conditionRows.reduce((sum, row) => sum + row.react418, 0),
      hydrationErrors: conditionRows.reduce((sum, row) => sum + row.hydrationErrorCount, 0),
      otherPageErrors: conditionRows.reduce((sum, row) => sum + row.otherPageErrorCount, 0),
      bootstrapLoaded: conditionRows.filter((row) => row.bootstrapLoaded).length,
      slotPushed: conditionRows.filter((row) => row.slotPushed).length,
      slotFailed: conditionRows.filter((row) => row.slotFailed).length,
      adRequests: conditionRows.reduce((sum, row) => sum + row.adRequestCount, 0),
      blockedRequests: conditionRows.reduce((sum, row) => sum + row.blockedRequestCount, 0),
      pass: conditionRows.filter((row) => row.pass).length,
      fail: conditionRows.filter((row) => !row.pass).length,
    };
  });
  return {
    generatedAt: new Date().toISOString(),
    primaryTarget: PRIMARY_TARGET.path,
    primaryViewport: "320",
    byCondition,
    causality: classifyCondition(byCondition),
  };
}

async function main() {
  const runs = Math.max(1, Number(arg("runs", "10")) || 10);
  const extraRuns = Math.max(0, Number(arg("extra-runs", "1")) || 0);
  const executablePath = findBrowserExecutable();
  if (!executablePath) throw new Error("No Chrome or Edge executable found for puppeteer-core.");

  const puppeteer = require("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-extensions"],
  });

  const rows = [];
  try {
    for (const condition of CONDITIONS) {
      for (let run = 1; run <= runs; run += 1) {
        rows.push(await inspectRun(browser, condition, PRIMARY_TARGET, VIEWPORTS[0], run));
      }
      for (const target of EXTRA_TARGETS) {
        for (const viewport of VIEWPORTS) {
          for (let run = 1; run <= extraRuns; run += 1) {
            rows.push(await inspectRun(browser, condition, target, viewport, run));
          }
        }
      }
    }
  } finally {
    await browser.close();
  }

  const summary = summarizeRows(rows);
  const edgeTargets = [PRIMARY_TARGET, ...EXTRA_TARGETS].map((target) => absoluteUrl(target.path));
  const edgeSnapshots = [];
  for (const url of edgeTargets) {
    try {
      edgeSnapshots.push(await collectHtmlSnapshot(url));
    } catch (error) {
      edgeSnapshots.push({ url, status: "ERROR", error: error.message });
    }
  }
  const buildIds = [...new Set(edgeSnapshots.map((item) => item.buildId).filter(Boolean))];
  const htmlHashes = [...new Set(edgeSnapshots.map((item) => item.htmlHash).filter(Boolean))];
  const chunk404 = edgeSnapshots.flatMap((item) => item.chunkStatuses || []).filter((chunk) => Number(chunk.status) === 404);
  const edgeSummary = {
    generatedAt: new Date().toISOString(),
    buildIds,
    mixedBuildIds: buildIds.length > 1,
    htmlHashes,
    chunk404Count: chunk404.length,
    buildManifestMismatch: edgeSnapshots.some((item) => item.manifest && item.manifest.status !== 200),
    snapshots: edgeSnapshots,
  };

  const mutationReport = {
    generatedAt: new Date().toISOString(),
    rowsWithMutations: rows
      .filter((row) => row.mutationCount > 0 || row.react418)
      .map((row) => ({
        condition: row.condition,
        path: row.path,
        viewport: row.viewport,
        run: row.run,
        react418: row.react418,
        mutationCount: row.mutationCount,
        mutationSample: row.mutationSample,
        pageErrors: row.pageErrors,
        consoleErrors: row.consoleErrors,
      })),
  };

  writeJson(OUT_JSON, { ...summary, rows });
  writeJson(OUT_EDGE_JSON, edgeSummary);
  writeJson(OUT_MUTATION_JSON, mutationReport);
  writeCsv(OUT_CSV, rows, [
    "condition",
    "targetGroup",
    "path",
    "viewport",
    "run",
    "mainStatus",
    "pass",
    "react418",
    "hydrationErrorCount",
    "otherPageErrorCount",
    "bootstrapLoaded",
    "bootstrapScriptCount",
    "bootstrapRequestCount",
    "adRequestCount",
    "blockedRequestCount",
    "slotCount",
    "slotPushed",
    "slotFailed",
    "slotStatusCount",
    "slotFailedCount",
    "buildId",
    "horizontalOverflow",
    "h1Count",
    "inputCount",
    "ctaCount",
    "mutationCount",
  ]);

  console.log(`[adsense-causality] causality=${summary.causality}`);
  for (const row of summary.byCondition) {
    console.log(
      `[adsense-causality] ${row.condition} runs=${row.runs} react418=${row.react418} bootstrapLoaded=${row.bootstrapLoaded} slotPushed=${row.slotPushed} pass=${row.pass}/${row.runs}`
    );
  }
  console.log(`[adsense-causality] report=${path.relative(ROOT, OUT_JSON)}`);
  if (summary.causality === "ADSENSE_NOT_CAUSAL" || summary.causality === "INCONCLUSIVE") process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[adsense-causality] FAIL ${error.stack || error.message}`);
  process.exitCode = 1;
});
