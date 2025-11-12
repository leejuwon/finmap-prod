// web.js (Cafe24 고정판)
process.title = 'finmap';
process.on('uncaughtException', (e) => console.error('[uncaughtException]', e));
process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));

const path = require('path');
const http = require('http');
const express = require('express');
const compression = require('compression');
const next = require('next');

// ✅ Cafe24가 / 에서 시작하는 문제 방지
try {
  const here = __dirname;
  if (process.cwd() !== here) process.chdir(here);
} catch (e) {
  console.error('[chdir error]', e);
}

// ✅ 반드시 프로덕션으로 고정
process.env.NODE_ENV = 'production';
const dev = false;

const APP_DIR = __dirname;
const PORT = Number(process.env.PORT || 8002);

(async () => {
  console.log('1────────────────────────────────────────────2');
  console.log('🚀 Booting finmap server');
  console.log('📌 CWD         :', process.cwd());
  console.log('📌 NODE_ENV    :', process.env.NODE_ENV);
  console.log('📌 PORT        :', PORT);
  console.log('📌 .next exists:', require('fs').existsSync(path.join(APP_DIR, '.next')));
  console.log('────────────────────────────────────────────');

  const nextApp = next({ dev, dir: APP_DIR });
  const handle = nextApp.getRequestHandler();

  try {
    await nextApp.prepare();
    console.log('🧩 Next prepared (prod).');
  } catch (err) {
    console.error('💥 Next prepare error:', err);
    process.exit(1);
  }

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);
  app.use(compression());

  // 헬스체크
  app.get('/test', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.status(200).send('OK');
  });

  // 정적 파일 (public/ping.txt 등)
  app.use('/public', express.static(path.join(APP_DIR, 'public'), { fallthrough: false, maxAge: 0 }));

  // Next 핸들러
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  // 서버 시작
  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening → 0.0.0.0:${PORT}`);
  });

  server.on('error', (e) => {
    console.error('💥 server error:', e);
  });

  // 가드 로그(프록시 타임아웃 추적용)
  setInterval(() => {
    console.log(`[beat] alive @ ${new Date().toISOString()}`);
  }, 30000);
})();
