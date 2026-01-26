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

// TTL 캐시
const _cache = globalThis.__re_trade_options_cache || (globalThis.__re_trade_options_cache = new Map());
function cacheGet(key) {
  const v = _cache.get(key);
  if (!v) return null;
  if (Date.now() > v.exp) {
    _cache.delete(key);
    return null;
  }
  return v.data;
}
function cacheSet(key, data, ttlMs) {
  _cache.set(key, { exp: Date.now() + ttlMs, data });
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    // HTTP 캐시
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');

    const cacheKey = 'trade-options:v2';
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const pool = getPool();

    // ✅ deal_ym 인덱스만 있으면 GROUP BY + ORDER BY가 매우 빨라짐
    const [monthsRows] = await pool.query(`
      SELECT deal_ym
      FROM re_trade_apt
      WHERE deal_ym IS NOT NULL AND deal_ym <> ''
      GROUP BY deal_ym
      ORDER BY deal_ym DESC
      LIMIT 600
    `);

    const months = monthsRows.map(r => String(r.deal_ym)).filter(Boolean);

    // ✅ years는 DB LEFT() 없이 JS로 파생
    const yearSet = new Set();
    for (const ym of months) {
      if (ym.length >= 4) yearSet.add(ym.slice(0, 4));
    }
    const years = Array.from(yearSet).sort((a, b) => b.localeCompare(a));

    // build year range (인덱스 있으면 빨라짐)
    const [buildYears] = await pool.query(`
      SELECT MIN(build_year) AS min_year, MAX(build_year) AS max_year
      FROM re_trade_apt
      WHERE build_year IS NOT NULL
    `);

    // ✅ sidos는 상수 (데이터가 서울/인천/경기만 쌓이는 상황에서 가장 가벼움)
    const sidos = [
      { code: 'all', name: '전체' },
      { code: '11', name: '서울특별시' },
      { code: '28', name: '인천광역시' },
      { code: '41', name: '경기도' },
    ];

    const out = {
      ok: true,
      periods: {
        month: months,
        year: years,
      },
      sidos,
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
    };

    cacheSet(cacheKey, out, 60 * 60 * 1000); // 1h
    return res.json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || 'Server Error' });
  }
}
