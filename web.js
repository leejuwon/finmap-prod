const path = require("path");
const express = require("express");
const compression = require("compression");
const next = require("next");

const PORT = Number(process.env.PORT) || 8002;
const DEV = process.env.NODE_ENV !== "production";
const APP_DIR = process.cwd();

function log(...a){ console.log(...a); }

(async () => {
  console.log("────────────────────────────────────────────");
  console.log("🚀 Booting finmap server");
  console.log("📌 CWD         :", APP_DIR);
  console.log("📌 NODE_ENV    :", process.env.NODE_ENV);
  console.log("📌 PORT        :", PORT);
  console.log("📌 .next exists:", require("fs").existsSync(path.join(APP_DIR,".next")));
  console.log("────────────────────────────────────────────");

  const app = next({ dev: DEV, dir: APP_DIR });
  try {
    await app.prepare();
  } catch (e) {
    console.error("💥 Next prepare error:", e);
    // 그래도 /test 는 살려서 상태 확인 가능하게
  }

  const server = express();
  server.disable("x-powered-by");
  server.use(compression());

  // 헬스체크/핑 라우트 (Next와 무관, 최우선 확인용)
  server.get("/test", (req, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`OK : ${new Date().toISOString()}\n`);
  });

  // Next 핸들러
  if (app && app.getRequestHandler) {
    const handle = app.getRequestHandler();
    server.all("*", (req, res) => {
      log("REQ", req.method, req.url, "UA=", req.headers["user-agent"] || "");
      return handle(req, res);
    });
  } else {
    // 만약 Next 준비 실패 시 기본 루트만 간단히 응답
    server.get("/", (req, res) => {
      res.set("Content-Type", "text/plain; charset=utf-8");
      res.send("Next prepare failed, but server is up.\n");
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server listening → 0.0.0.0:${PORT}`);
  });
})();