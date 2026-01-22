// pages/api/re/trade-options.js
'use strict';

import mysql from 'mysql2/promise';

let _pool;
function getPool() {
  if (_pool) return _pool;
  _pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    charset: 'utf8mb4',
  });
  return _pool;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    const pool = getPool();

    const [months] = await pool.query(`
      SELECT DISTINCT deal_ym
      FROM re_trade_apt
      WHERE deal_ym IS NOT NULL AND deal_ym <> ''
      ORDER BY deal_ym DESC
      LIMIT 600
    `);

    const [years] = await pool.query(`
      SELECT DISTINCT LEFT(deal_ym, 4) AS deal_y
      FROM re_trade_apt
      WHERE deal_ym IS NOT NULL AND deal_ym <> ''
      ORDER BY deal_y DESC
      LIMIT 50
    `);

    const [sidos] = await pool.query(`
      SELECT DISTINCT LEFT(lawd_cd, 2) AS sido_code, sido_name
      FROM re_trade_apt
      WHERE sido_name IS NOT NULL AND sido_name <> ''
      ORDER BY sido_code
    `);

    const [buildYears] = await pool.query(`
      SELECT MIN(build_year) AS min_year, MAX(build_year) AS max_year
      FROM re_trade_apt
      WHERE build_year IS NOT NULL
    `);

    return res.json({
      ok: true,
      periods: {
        month: months.map((r) => String(r.deal_ym)),
        year: years.map((r) => String(r.deal_y)),
      },
      sidos: [
        { code: 'all', name: '전체' },
        ...sidos.map((r) => ({ code: String(r.sido_code), name: String(r.sido_name) })),
      ],
      buildYearRange: {
        min: buildYears?.[0]?.min_year ?? null,
        max: buildYears?.[0]?.max_year ?? null,
      },
      pyeongBands: [
        { key: 'all', label: '전체' },
        { key: '10', label: '10평대' },
        { key: '20', label: '20평대' },
        { key: '30', label: '30평대' },
        { key: '40', label: '40평대' },
        { key: '50', label: '50평대' },
      ],
      metrics: [
        { key: 'tx_count', label: '거래량' },
        { key: 'median_price', label: '중위(총액)' },
        { key: 'avg_price', label: '평균(총액)' },
        { key: 'median_price_per_m2', label: '중위(㎡당)' },
        { key: 'avg_price_per_m2', label: '평균(㎡당)' },
      ],
      tops: [10, 20, 50, 100],
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || 'Server Error' });
  }
}
