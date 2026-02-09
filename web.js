// web.js (Cafe24 hardened)
process.title = 'finmap';
process.on('uncaughtException', (e) => console.error('[uncaughtException]', e));
process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));

const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const compression = require('compression');
const next = require('next');

// ✅ Cafe24가 CWD를 이상하게 주는 경우 방지
try {
  const here = __dirname;
  if (process.cwd() !== here) process.chdir(here);
} catch (e) {
  console.error('[chdir error]', e);
}

// ✅ 반드시 프로덕션
process.env.NODE_ENV = 'production';
const dev = false;

const APP_DIR = __dirname;
const PORT = Number(process.env.PORT || 8002);

(async () => {
  console.log('────────────────────────────────────────────');
  console.log('🚀 Booting finmap server');
  console.log('📌 CWD         :', process.cwd());
  console.log('📌 NODE_ENV    :', process.env.NODE_ENV);
  console.log('📌 PORT        :', PORT);
  console.log('📌 .next exists:', fs.existsSync(path.join(APP_DIR, '.next')));
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
  app.get('/healthz', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.status(200).send('ok');
  });
  app.get('/test', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.status(200).send('OK');
  });

  // 정적 파일 (선택: /public을 별도 라우트로 노출)
  app.use('/public', express.static(path.join(APP_DIR, 'public'), { fallthrough: true, maxAge: 0 }));

  // ✅ public 폴더를 루트에서 정적 서빙 (favicon.ico 같은 표준 경로 해결)
  app.use(express.static(path.join(APP_DIR, 'public'), {
    fallthrough: true,
    maxAge: 0,
  }));

  app.use((req, res, next) => {
    const p = req.path || '';
    if (
      p.includes('[') || p.includes(']') ||
      p.toLowerCase().includes('%5b') || p.toLowerCase().includes('%5d')
    ) {
      res.status(404).send('Not Found');
      return;
    }

    if (req.url === '/ko' || req.url.startsWith('/ko/')) {
      const dest = req.url.replace(/^\/ko(?=\/|$)/, '') || '/';
      res.redirect(308, dest);
      return;
    }
    next();
  });
  
  // Next 핸들러
  app.all('*', (req, res) => handle(req, res));

  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening → 0.0.0.0:${PORT}`);
  });

  server.on('error', (e) => {
    console.error('💥 server error:', e);
  });

})();
