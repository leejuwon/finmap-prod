// web.js (초미니 헬스 서버)
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 8002;

// 압축 + 정적파일
app.use(compression());
app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: '1m', etag: true }));

// 헬스 엔드포인트
app.get('/test', (req, res) => {
  res.type('text/plain').send(`OK ${new Date().toISOString()}`);
});

// 루트
app.get('/', (req, res) => {
  res.type('text/plain').send('root ok');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ listening on 0.0.0.0:${PORT}`);
});
