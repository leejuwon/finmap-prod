// server/crawler/runner.js
process.title = "finmap-crawler";
process.on("uncaughtException", (e) =>
  console.error("[crawler uncaughtException]", e)
);
process.on("unhandledRejection", (e) =>
  console.error("[crawler unhandledRejection]", e)
);

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
