// server/crawler/lib/puppeteer/launch.js
const fs = require("fs");
const fsp = fs.promises;
const os = require("os");
const path = require("path");
const puppeteer = require("puppeteer-core");

const PROFILE_PREFIX = "finmap-puppeteer-profile-";
const LEGACY_PROFILE_PREFIX = "puppeteer_dev_chrome_profile-";
const SNAP_CHROMIUM_TMP = "/tmp/snap-private-tmp/snap.chromium/tmp";
const STALE_PROFILE_MIN_AGE_MS = Number(
  process.env.PUPPETEER_PROFILE_CLEANUP_MIN_AGE_MS || 12 * 60 * 60 * 1000
);
const STALE_CLEANUP_THROTTLE_MS = 60 * 60 * 1000;
const LAUNCH_TIMEOUT_MS = Number(process.env.PUPPETEER_LAUNCH_TIMEOUT_MS || 120000);

const activeBrowsers = new Set();
const activeProfileDirs = new Set();
let lastStaleCleanupAt = 0;

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

function createUserDataDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), PROFILE_PREFIX));
}

function profilePathCandidates(profileDir) {
  const paths = [profileDir];

  if (process.platform !== "win32" && profileDir) {
    paths.push(path.join(SNAP_CHROMIUM_TMP, path.basename(profileDir)));
  }

  return Array.from(new Set(paths.filter(Boolean)));
}

async function removeDir(dir, label = "profile") {
  try {
    await fsp.rm(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    console.log(`[puppeteer] cleaned ${label}: ${dir}`);
  } catch (err) {
    console.warn(`[puppeteer] cleanup failed ${label}: ${dir} - ${err?.message || err}`);
  }
}

async function cleanupManagedProfile(profileDir) {
  for (const dir of profilePathCandidates(profileDir)) {
    await removeDir(dir, "managed profile");
  }
}

async function cleanupStaleChromiumProfiles({ minAgeMs = STALE_PROFILE_MIN_AGE_MS } = {}) {
  const roots = Array.from(new Set([os.tmpdir(), SNAP_CHROMIUM_TMP]));
  const activeBasenames = new Set(Array.from(activeProfileDirs).map((dir) => path.basename(dir)));
  const cutoff = Date.now() - Number(minAgeMs || 0);

  for (const root of roots) {
    try {
      if (!fs.existsSync(root)) continue;
      const entries = await fsp.readdir(root, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (!entry.name.startsWith(PROFILE_PREFIX) && !entry.name.startsWith(LEGACY_PROFILE_PREFIX)) continue;
        if (activeBasenames.has(entry.name)) continue;

        const fullPath = path.join(root, entry.name);
        const stat = await fsp.stat(fullPath).catch(() => null);
        if (!stat || stat.mtimeMs > cutoff) continue;

        await removeDir(fullPath, "stale profile");
      }
    } catch (err) {
      console.warn(`[puppeteer] stale cleanup skipped for ${root}: ${err?.message || err}`);
    }
  }
}

async function cleanupStaleChromiumProfilesThrottled() {
  const now = Date.now();
  if (now - lastStaleCleanupAt < STALE_CLEANUP_THROTTLE_MS) return;
  lastStaleCleanupAt = now;
  await cleanupStaleChromiumProfiles();
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
    timeout: LAUNCH_TIMEOUT_MS,
  };
}

/**
 * puppeteer-core launch wrapper
 * @param {object} override puppeteer.launch 옵션 (args/headless/defaultViewport 등)
 */
async function launchBrowser(override = {}) {
  await cleanupStaleChromiumProfilesThrottled();

  const base = getBaseLaunchOptions();
  const managedUserDataDir = !override.userDataDir;
  const userDataDir = managedUserDataDir ? createUserDataDir() : override.userDataDir;
  const merged = {
    ...base,
    ...override,
    ...(userDataDir ? { userDataDir } : {}),
    args: mergeArgs(base.args, override.args),
  };

  try {
    const browser = await puppeteer.launch(merged);
    activeBrowsers.add(browser);
    if (managedUserDataDir) activeProfileDirs.add(userDataDir);

    const originalClose = browser.close.bind(browser);
    let closeStarted = false;

    browser.close = async () => {
      if (closeStarted) return;
      closeStarted = true;
      try {
        await originalClose();
      } finally {
        activeBrowsers.delete(browser);
        if (managedUserDataDir) {
          activeProfileDirs.delete(userDataDir);
          await cleanupManagedProfile(userDataDir);
        }
      }
    };

    browser.once("disconnected", () => {
      if (!closeStarted) {
        console.warn("[puppeteer] browser disconnected before close; cleaning profile");
        browser.close().catch((err) => {
          console.warn(`[puppeteer] disconnected cleanup failed: ${err?.message || err}`);
        });
      }
    });

    console.log(`[puppeteer] launched browser profile=${userDataDir || "(external)"}`);
    return browser;
  } catch (err) {
    if (managedUserDataDir) {
      activeProfileDirs.delete(userDataDir);
      await cleanupManagedProfile(userDataDir);
    }
    throw err;
  }
}

async function closePage(page, label = "") {
  if (!page) return;
  try {
    await page.close();
    console.log(`[puppeteer] page closed${label ? `: ${label}` : ""}`);
  } catch (err) {
    console.warn(`[puppeteer] page close failed${label ? `: ${label}` : ""} - ${err?.message || err}`);
  }
}

async function closeBrowser(browser, label = "") {
  if (!browser) return;
  try {
    await browser.close();
    console.log(`[puppeteer] browser closed${label ? `: ${label}` : ""}`);
  } catch (err) {
    console.warn(`[puppeteer] browser close failed${label ? `: ${label}` : ""} - ${err?.message || err}`);
  }
}

async function closeAllBrowsers(reason = "shutdown") {
  const browsers = Array.from(activeBrowsers);
  if (browsers.length) {
    console.log(`[puppeteer] closing ${browsers.length} active browser(s): ${reason}`);
  }
  await Promise.allSettled(browsers.map((browser) => closeBrowser(browser, reason)));
}

/**
 * 안전한 브라우저 실행 헬퍼 (항상 close)
 */
async function withBrowser(fn, override = {}) {
  const browser = await launchBrowser(override);
  try {
    return await fn(browser);
  } finally {
    await closeBrowser(browser, "withBrowser");
  }
}

module.exports = {
  launchBrowser,
  withBrowser,
  closePage,
  closeBrowser,
  closeAllBrowsers,
  cleanupStaleChromiumProfiles,
};
