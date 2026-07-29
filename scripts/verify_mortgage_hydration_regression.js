#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.finmaphub.com";
const OUT_JSON = path.join(ROOT, "reports", "search-growth-p1-2c-1-mortgage-hydration-regression.json");
const OUT_REPRO_JSON = path.join(ROOT, "reports", "search-growth-p1-2c-1-mortgage-hydration-reproduction.json");
const ARTIFACT_DIR = path.join(ROOT, "reports", "search-growth-p1-2c-1-hydration-artifacts");

const TARGETS = [
  { locale: "ko", path: "/tools/mortgage-loan-calculator" },
  { locale: "en", path: "/en/tools/mortgage-loan-calculator" },
];

const VIEWPORTS = [
  { name: "320", width: 320, height: 800, runs: 5 },
  { name: "360", width: 360, height: 800, runs: 2 },
  { name: "390", width: 390, height: 844, runs: 3 },
  { name: "768", width: 768, height: 1024, runs: 2 },
  { name: "1280", width: 1280, height: 900, runs: 3 },
];

const HYDRATION_RE = /hydration|Hydration failed|did not match|Minified React error #418|react\.dev\/errors\/418/i;
const REACT_ERROR_RE = /Minified React error #(\d+)/i;
const NETWORK_IGNORE_RE = /googlesyndication|googletagmanager|google-analytics|doubleclick|googleadservices|favicon/i;
const THIRD_PARTY_RE = /googlesyndication|googletagmanager|google-analytics|doubleclick|googleadservices/i;
const ADSENSE_RE = /googlesyndication|doubleclick|googleadservices/i;
const GA_RE = /googletagmanager|google-analytics/i;

function arg(name, fallback = null) {
  const prefix = `--${name}=`;
  const found = process.argv.find((item) => item.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeSelectedReports(mode, data) {
  if (mode === "reproduction") {
    writeJson(OUT_REPRO_JSON, data);
    return OUT_REPRO_JSON;
  }
  if (mode === "both") {
    writeJson(OUT_REPRO_JSON, data);
    writeJson(OUT_JSON, data);
    return OUT_JSON;
  }
  writeJson(OUT_JSON, data);
  return OUT_JSON;
}

function safeName(value) {
  return String(value || "item").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");
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

function absoluteUrl(baseUrl, pathname) {
  return new URL(pathname, baseUrl.replace(/\/+$/, "") + "/").toString();
}

function compact(lines) {
  return lines.map(normalizeText).filter(Boolean).slice(0, 8);
}

async function captureFailureArtifacts(page, meta) {
  ensureDir(ARTIFACT_DIR);
  const stem = safeName(`${meta.locale}-${meta.viewport}-${meta.navigation}-${meta.run}`);
  const screenshotPath = path.join(ARTIFACT_DIR, `${stem}.png`);
  const htmlPath = path.join(ARTIFACT_DIR, `${stem}-client-dom.html`);
  const textPath = path.join(ARTIFACT_DIR, `${stem}-visible-text.txt`);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  const html = await page.content();
  const text = await page.evaluate(() => document.body?.innerText || "");
  fs.writeFileSync(htmlPath, html, "utf8");
  fs.writeFileSync(textPath, text, "utf8");

  return {
    screenshotPath: path.relative(ROOT, screenshotPath),
    clientDomPath: path.relative(ROOT, htmlPath),
    visibleTextPath: path.relative(ROOT, textPath),
  };
}

function shouldBlockRequest(url, mode) {
  if (mode === "all") return THIRD_PARTY_RE.test(url);
  if (mode === "adsense") return ADSENSE_RE.test(url);
  if (mode === "ga") return GA_RE.test(url);
  return false;
}

async function inspectPage(page, url, meta, { cacheDisabled = false, blockMode = "none" } = {}) {
  const consoleMessages = [];
  const pageErrors = [];
  const requestFailures = [];
  const responses = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error" || HYDRATION_RE.test(text)) {
      consoleMessages.push({
        type: msg.type(),
        text,
        location: msg.location?.() || null,
      });
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const failure = request.failure();
    const requestUrl = request.url();
    if (NETWORK_IGNORE_RE.test(requestUrl)) return;
    requestFailures.push({
      url: requestUrl,
      method: request.method(),
      errorText: failure?.errorText || "",
      resourceType: request.resourceType(),
    });
  });
  page.on("response", (response) => {
    const responseUrl = response.url();
    if (responseUrl === url || responseUrl.startsWith(`${url}?`)) {
      responses.push({
        url: responseUrl,
        status: response.status(),
        fromCache: response.fromCache(),
      });
    }
  });

  if (blockMode !== "none") {
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (shouldBlockRequest(request.url(), blockMode)) {
        request.abort();
        return;
      }
      request.continue();
    });
  }

  await page.setCacheEnabled(!cacheDisabled);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  if (cacheDisabled) {
    await page.reload({ waitUntil: "networkidle2", timeout: 60000 });
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const layout = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll("input, select, textarea"));
    const buttons = Array.from(document.querySelectorAll("button"));
    const ctas = Array.from(document.querySelectorAll("a[href*='/tools/'], a[href*='/market/real-estate']"));
    const tables = Array.from(document.querySelectorAll("table")).map((table) => ({
      scrollWidth: table.scrollWidth,
      clientWidth: table.clientWidth,
    }));
    return {
      readyState: document.readyState,
      url: window.location.href,
      userAgent: navigator.userAgent,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      h1Count: document.querySelectorAll("h1").length,
      inputCount: inputs.length,
      buttonCount: buttons.length,
      ctaCount: ctas.length,
      tableCount: tables.length,
      tableOverflowCount: tables.filter((table) => table.scrollWidth > table.clientWidth + 1).length,
      resultTextPresent:
        /(?:\uC6D4\uC0C1\uD658|\uC0C1\uD658|\uC774\uC790|payment|repayment|interest|total)/i.test(
          document.body.innerText || ""
        ),
      activeElementTag: document.activeElement?.tagName || "",
      rootChildCount: document.querySelector("#__next")?.childElementCount || 0,
    };
  });

  const hydrationMessages = [
    ...consoleMessages.map((item) => item.text),
    ...pageErrors,
  ].filter((line) => HYDRATION_RE.test(line));
  const reactErrorCodes = [...new Set(hydrationMessages.map((line) => line.match(REACT_ERROR_RE)?.[1]).filter(Boolean))];
  const horizontalOverflow = layout.scrollWidth > layout.clientWidth + 1;
  const hasOkDocumentResponse = responses.some((response) => response.status === 200 || response.status === 304);
  const pass =
    hasOkDocumentResponse &&
    !horizontalOverflow &&
    layout.h1Count === 1 &&
    layout.inputCount > 0 &&
    layout.ctaCount > 0 &&
    layout.resultTextPresent &&
    hydrationMessages.length === 0 &&
    pageErrors.length === 0;

  const result = {
    ...meta,
    url,
    pass,
    timestamp: new Date().toISOString(),
    responses,
    hasOkDocumentResponse,
    layout,
    horizontalOverflow,
    consoleMessages: compact(consoleMessages.map((item) => `${item.type}: ${item.text}`)),
    pageErrors: compact(pageErrors),
    hydrationMessages: compact(hydrationMessages),
    reactErrorCodes,
    requestFailures: requestFailures.slice(0, 8),
  };

  if (!pass) {
    result.artifacts = await captureFailureArtifacts(page, meta);
  }

  return result;
}

async function runHardLoads(browser, baseUrl, runs, options = {}) {
  const rows = [];
  for (const target of TARGETS) {
    for (const viewport of VIEWPORTS) {
      const iterations = viewport.name === "320" ? runs : Math.min(viewport.runs, runs);
      for (let run = 1; run <= iterations; run += 1) {
        const page = await browser.newPage();
        await page.setViewport({
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 1,
          isMobile: viewport.width < 768,
        });
        try {
          rows.push(
            await inspectPage(
              page,
              absoluteUrl(baseUrl, target.path),
              {
                locale: target.locale,
                path: target.path,
                viewport: viewport.name,
                width: viewport.width,
                height: viewport.height,
                navigation: "hard_load",
                run,
              },
              options
            )
          );
        } catch (error) {
          rows.push({
            locale: target.locale,
            path: target.path,
            viewport: viewport.name,
            width: viewport.width,
            height: viewport.height,
            navigation: "hard_load",
            run,
            pass: false,
            error: error.stack || error.message,
          });
        } finally {
          await page.close();
        }
      }
    }
  }
  return rows;
}

async function runCacheDisabled(browser, baseUrl, runs, options = {}) {
  const rows = [];
  for (const target of TARGETS) {
    for (let run = 1; run <= Math.min(runs, 3); run += 1) {
      const page = await browser.newPage();
      await page.setViewport({ width: 320, height: 800, deviceScaleFactor: 1, isMobile: true });
      try {
        rows.push(
          await inspectPage(
            page,
            absoluteUrl(baseUrl, target.path),
            {
              locale: target.locale,
              path: target.path,
              viewport: "320",
              width: 320,
              height: 800,
              navigation: "cache_disabled_reload",
              run,
            },
            { ...options, cacheDisabled: true }
          )
        );
      } catch (error) {
        rows.push({
          locale: target.locale,
          path: target.path,
          viewport: "320",
          width: 320,
          height: 800,
          navigation: "cache_disabled_reload",
          run,
          pass: false,
          error: error.stack || error.message,
        });
      } finally {
        await page.close();
      }
    }
  }
  return rows;
}

async function runClientNavigation(browser, baseUrl, runs, options = {}) {
  const rows = [];
  const cases = [
    { locale: "ko", startPath: "/tools", targetPath: "/tools/mortgage-loan-calculator" },
    { locale: "en", startPath: "/en/tools", targetPath: "/en/tools/mortgage-loan-calculator" },
  ];

  for (const item of cases) {
    for (let run = 1; run <= Math.min(runs, 3); run += 1) {
      const page = await browser.newPage();
      await page.setViewport({ width: 320, height: 800, deviceScaleFactor: 1, isMobile: true });
      try {
        await page.goto(absoluteUrl(baseUrl, item.startPath), { waitUntil: "networkidle2", timeout: 60000 });
        await page.click(`a[href="${item.targetPath}"], a[href$="${item.targetPath}"]`);
        await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => {});
        rows.push(
          await inspectPage(
            page,
            absoluteUrl(baseUrl, item.targetPath),
            {
              locale: item.locale,
              path: item.targetPath,
              viewport: "320",
              width: 320,
              height: 800,
              navigation: "client_navigation",
              run,
            },
            options
          )
        );
      } catch (error) {
        rows.push({
          locale: item.locale,
          path: item.targetPath,
          viewport: "320",
          width: 320,
          height: 800,
          navigation: "client_navigation",
          run,
          pass: false,
          error: error.stack || error.message,
        });
      } finally {
        await page.close();
      }
    }
  }

  return rows;
}

function summarize(results) {
  const failRows = results.filter((row) => !row.pass);
  const hydrationFails = results.filter((row) => row.hydrationMessages?.length || row.reactErrorCodes?.length);
  const pageErrorFails = results.filter((row) => row.pageErrors?.length);
  const networkOnlyFails = failRows.filter(
    (row) =>
      !row.hydrationMessages?.length &&
      !row.reactErrorCodes?.length &&
      !row.pageErrors?.length &&
      row.requestFailures?.length
  );
  return {
    total: results.length,
    pass: results.length - failRows.length,
    fail: failRows.length,
    hydrationFail: hydrationFails.length,
    pageErrorFail: pageErrorFails.length,
    networkOnlyFail: networkOnlyFails.length,
    reactErrorCodes: [...new Set(results.flatMap((row) => row.reactErrorCodes || []))],
    failedCombos: failRows.map((row) => ({
      locale: row.locale,
      path: row.path,
      viewport: row.viewport,
      navigation: row.navigation,
      run: row.run,
      hydrationMessages: row.hydrationMessages || [],
      pageErrors: row.pageErrors || [],
      error: row.error || "",
      artifacts: row.artifacts || null,
    })),
  };
}

async function main() {
  const baseUrl = arg("base-url", arg("production-url", SITE));
  const runs = Math.max(1, Number(arg("runs", "5")) || 5);
  const blockMode = arg("block", arg("block-third-party", "0") === "1" ? "all" : "none");
  const outputMode = arg("mode", "regression");
  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    const data = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      runs,
      blockMode,
      outputMode,
      status: "SKIPPED",
      reason: "No local Chrome or Edge executable found for puppeteer-core.",
      results: [],
    };
    const reportPath = writeSelectedReports(outputMode, data);
    console.log("[mortgage-hydration] SKIPPED no browser executable");
    console.log(`[mortgage-hydration] report=${path.relative(ROOT, reportPath)}`);
    return;
  }

  const puppeteer = require("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-extensions"],
  });

  let results = [];
  try {
    const options = { blockMode };
    results = [
      ...(await runHardLoads(browser, baseUrl, runs, options)),
      ...(await runCacheDisabled(browser, baseUrl, runs, options)),
      ...(await runClientNavigation(browser, baseUrl, runs, options)),
    ];
  } finally {
    await browser.close();
  }

  const summary = summarize(results);
  const data = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    runs,
    blockMode,
    outputMode,
    status: summary.fail === 0 ? "PASS" : "FAIL",
    summary,
    results,
  };
  const reportPath = writeSelectedReports(outputMode, data);

  console.log(`[mortgage-hydration] status=${data.status}`);
  console.log(`[mortgage-hydration] pass=${summary.pass}/${summary.total}`);
  console.log(`[mortgage-hydration] hydrationFail=${summary.hydrationFail}`);
  console.log(`[mortgage-hydration] report=${path.relative(ROOT, reportPath)}`);
  if (summary.fail > 0) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[mortgage-hydration] FAIL ${error.stack || error.message}`);
    process.exitCode = 1;
  });
}
