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

  // ✅ Next 빌드 산출물(청크/매니페스트)을 Express가 직접 서빙 (가장 안전)
  const NEXT_STATIC_DIR = path.join(APP_DIR, '.next', 'static');
  console.log('📌 .next/static exists:', fs.existsSync(NEXT_STATIC_DIR), NEXT_STATIC_DIR);

  app.use('/_next/static', express.static(NEXT_STATIC_DIR, {
    fallthrough: false,     // 없으면 바로 404 (다른 미들웨어로 새지 않게)
    immutable: true,
    maxAge: '365d',
  }));

  // ✅ _next, api 는 어떤 미들웨어도 타지 말고 Next로 즉시 넘김 (안전)
  app.all('/_next/*', (req, res) => handle(req, res));
  app.all('/api/*', (req, res) => handle(req, res));

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

    // ✅ Next 내부 정적 자산/빌드 산출물은 절대 차단하면 안 됨
    //    동적 라우트 chunk 파일명이 [slug] 형태라 URL에 %5B/%5D가 포함됨
    if (p.startsWith('/_next')) return next();
    if (p.startsWith('/api')) return next();

    // (선택) 정적 확장자도 통과
    if (/\.(?:js|css|map|png|jpg|jpeg|webp|svg|ico|txt|xml)$/.test(p)) return next();
    // ✅ /ko prefix 정규화: /ko/* -> /* (그리고 끝 슬래시도 제거해서 체인/중복 최소화)
    if (req.url === '/ko' || req.url.startsWith('/ko/')) {
      const original = req.url || '';
      const [pathname, qs] = original.split('?');

      // prefix 제거
      let destPath = pathname.replace(/^\/ko(?=\/|$)/, '') || '/';
      // trailing slash 제거 (루트 "/" 제외)
      if (destPath.length > 1) destPath = destPath.replace(/\/+$/, '');

      const dest = destPath + (qs ? `?${qs}` : '');
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
