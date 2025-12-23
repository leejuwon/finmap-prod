// server/crawler/lib/puppeteer/launch.js
const fs = require("fs");
const puppeteer = require("puppeteer-core");

function resolveChromiumPath() {
  const p = process.env.CHROMIUM_PATH;
  if (p && fs.existsSync(p)) return p;

  const candidates = [
    "/snap/bin/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  throw new Error(
    "Chromium not found. Install chromium (snap) or chrome and set CHROMIUM_PATH (e.g. /snap/bin/chromium)."
  );
}

function mergeArgs(baseArgs, extraArgs) {
  const set = new Set([...(baseArgs || []), ...(extraArgs || [])]);
  return Array.from(set);
}

function getBaseLaunchOptions() {
  return {
    headless: "new",
    executablePath: resolveChromiumPath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-features=site-per-process",
    ],
    defaultViewport: { width: 1280, height: 720 },
    timeout: 0,
  };
}

/**
 * puppeteer-core launch wrapper
 * @param {object} override puppeteer.launch 옵션 (args/headless/defaultViewport 등)
 */
async function launchBrowser(override = {}) {
  const base = getBaseLaunchOptions();
  const merged = {
    ...base,
    ...override,
    args: mergeArgs(base.args, override.args),
  };
  return puppeteer.launch(merged);
}

/**
 * 안전한 브라우저 실행 헬퍼 (항상 close)
 */
async function withBrowser(fn, override = {}) {
  const browser = await launchBrowser(override);
  try {
    return await fn(browser);
  } finally {
    await browser.close().catch(() => {});
  }
}

module.exports = { launchBrowser, withBrowser };
