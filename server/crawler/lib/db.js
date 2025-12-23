// server/crawler/lib/db.js
// finmaphub의 mysql2/promise pool을 재사용합니다.
const { pool } = require("../../../lib/db");

module.exports = {
  query: (...args) => pool.query(...args),
  execute: (...args) => pool.execute(...args),
  getConnection: (...args) => pool.getConnection(...args),
  pool,
};
