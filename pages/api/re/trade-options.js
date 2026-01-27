// pages/api/re/trade-options.js
'use strict';

const { pool: dbPool } = require('../../../lib/db');

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

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');

    const cacheKey = 'trade-options:v3';
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    //const pool = getPool();
    const pool = dbPool;

    // ✅ 월 목록: re_trade_deal_ym
    const [monthsRows] = await pool.query(`
      SELECT deal_ym
      FROM re_trade_deal_ym
      ORDER BY deal_ym DESC
      LIMIT 600
    `);
    const months = monthsRows.map(r => String(r.deal_ym)).filter(Boolean);

    // ✅ year 파생
    const yearSet = new Set();
    for (const ym of months) if (ym.length >= 4) yearSet.add(ym.slice(0, 4));
    const years = Array.from(yearSet).sort((a, b) => b.localeCompare(a));

    // ✅ build year range: re_trade_meta
    const [metaRows] = await pool.query(`
      SELECT min_build_year AS min_year, max_build_year AS max_year
      FROM re_trade_meta
      WHERE id=1
      LIMIT 1
    `);
    const min_year = metaRows?.[0]?.min_year ?? null;
    const max_year = metaRows?.[0]?.max_year ?? null;

    const sidos = [
      { code: 'all', name: '전체' },
      { code: '11', name: '서울특별시' },
      { code: '28', name: '인천광역시' },
      { code: '41', name: '경기도' },
    ];

    const out = {
      ok: true,
      periods: { month: months, year: years },
      sidos,
      buildYearRange: { min: min_year, max: max_year },
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
        { key: 'sum_price', label: '총거래금액(합계)' },
        { key: 'median_price', label: '중위(총액)' },
        { key: 'avg_price', label: '평균(총액)' },
        { key: 'median_price_per_m2', label: '중위(㎡당)' },
        { key: 'avg_price_per_m2', label: '평균(㎡당)' },
      ],
      tops: [10, 20, 50, 100],
    };

    cacheSet(cacheKey, out, 60 * 60 * 1000);
    return res.json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || 'Server Error' });
  }
}
