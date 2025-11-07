// web.js
const path = require('path');
const express = require('express');
const compression = require('compression');
const next = require('next');

const PORT = process.env.PORT || 8002;
const NODE_ENV = process.env.NODE_ENV || 'development';
const dev = NODE_ENV !== 'production';

const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

(async () => {
  console.log('2────────────────────────────────────────────2');
  console.log('🚀 Booting finmap server');
  console.log('📌 CWD         :', process.cwd());
  console.log('📌 NODE_ENV    :', NODE_ENV);
  console.log('📌 PORT        :', PORT);
  console.log('📌 .next exists:', require('fs').existsSync(path.join(__dirname, '.next')));
  console.log('────────────────────────────────────────────');

  try {
    await app.prepare();
    const server = express();

    server.use(compression());

    // 헬스체크
    server.get('/test', (req, res) => {
      return res.status(200).send('OK ' + new Date().toISOString());
    });
    // 빌드 동기화 확인
    server.get('/ping.txt', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'ping.txt'));
    });

    // Next 핸들러 (ko/en 모두 이 아래서 처리)
    server.all('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server listening → 0.0.0.0:${PORT}`);
    });
  } catch (e) {
    console.error('💥 Fatal boot error:', e);
    process.exit(1);
  }
})();
