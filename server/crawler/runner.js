// server/crawler/runner.js
process.title = "finmap-crawler";

let shuttingDown = false;

async function closePuppeteer(reason) {
  try {
    const { closeAllBrowsers } = require("./lib/puppeteer/launch");
    await closeAllBrowsers(reason);
  } catch (err) {
    console.error("[crawler shutdown cleanup failed]", err?.message || err);
  }
}

async function shutdown(reason, err, exitCode) {
  if (err) console.error(`[crawler ${reason}]`, err);
  if (shuttingDown) return;
  shuttingDown = true;

  const forceExit = setTimeout(() => process.exit(exitCode), 15000);
  forceExit.unref();

  try {
    await closePuppeteer(reason);
  } finally {
    clearTimeout(forceExit);
    process.exit(exitCode);
  }
}

process.on("SIGINT", () => shutdown("SIGINT", null, 130));
process.on("SIGTERM", () => shutdown("SIGTERM", null, 143));
process.on("uncaughtException", (e) => shutdown("uncaughtException", e, 1));
process.on("unhandledRejection", (e) => shutdown("unhandledRejection", e, 1));

const path = require("path");
const moment = require("moment-timezone");

function loadEnv() {
  const envFile =
    process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";

  try {
    require("dotenv").config({
      path: path.join(process.cwd(), envFile),
      override: true,
    });
    console.log(`🔧 dotenv loaded: ${envFile}`);
  } catch (e) {
    console.error("❌ dotenv load failed:", e?.message || e);
  }
}

function parseArgs(argv) {
  const args = { close: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--once") args.once = argv[i + 1];
    if (a === "--date") args.date = argv[i + 1];
    if (a === "--close") args.close = true;
  }
  return args;
}

(async () => {
  // ✅ env 먼저 로드
  loadEnv();

  try {
    const { cleanupStaleChromiumProfiles } = require("./lib/puppeteer/launch");
    await cleanupStaleChromiumProfiles();
  } catch (e) {
    console.warn("[crawler] puppeteer stale profile cleanup skipped:", e?.message || e);
  }

  const args = parseArgs(process.argv.slice(2));
  const doDate = args.date || moment().tz(process.env.TZ || "Asia/Seoul").format("YYYY-MM-DD");

  console.log("────────────────────────────────────────────");
  console.log("🤖 Booting finmap crawler");
  console.log("📌 CWD      :", process.cwd());
  console.log("📌 NODE_ENV :", process.env.NODE_ENV);
  console.log("📌 TZ       :", process.env.TZ);
  console.log("📌 CHROMIUM :", process.env.CHROMIUM_PATH);
  console.log("📌 DB       :", `${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log("📌 doDate   :", doDate);
  console.log("📌 close    :", args.close);
  console.log("────────────────────────────────────────────");

  const {
    startScheduler,
    runBfIfAllOnce,
    runAfIfAllOnce,
  } = require("./scheduler");

  // ✅ 즉시 1회 실행 모드 (스케줄러 안 켬)
  if (args.once) {
    const key = String(args.once).toLowerCase();
    if (key === "bf") {
      await runBfIfAllOnce(doDate);
      process.exit(0);
    }
    if (key === "af") {
      await runAfIfAllOnce(doDate, args.close);
      process.exit(0);
    }
    console.error("❌ Unknown --once value. Use bf | af");
    process.exit(1);
  }

  // ✅ 기본은 스케줄러 모드
  startScheduler();
})();
