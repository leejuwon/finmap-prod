// server/crawler/lib/db.js
// finmaphub의 mysql2/promise pool을 재사용합니다.
const { pool, dbQuery, dbExecute } = require("../../../lib/db");

module.exports = {
  query: (...args) => pool.query(...args),
  execute: (...args) => pool.execute(...args),
  getConnection: (...args) => pool.getConnection(...args),
  pool,
  // 선택: 크롤러에서도 동일한 헬퍼를 쓰고 싶으면
  dbQuery,
  dbExecute,
};
