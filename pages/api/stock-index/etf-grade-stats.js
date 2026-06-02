'use strict';

const {
  getEtfGradeStats,
  parseEtfStatsQuery,
} = require('../../../lib/stockIndexEtfStats');

const _cache = globalThis.__stock_index_etf_grade_stats_cache || (globalThis.__stock_index_etf_grade_stats_cache = new Map());

function cacheGet(key) {
  const item = _cache.get(key);
  if (!item) return null;
  if (Date.now() > item.exp) {
    _cache.delete(key);
    return null;
  }
  return item.data;
}

function cacheSet(key, data, ttlMs = 60 * 1000) {
  if (_cache.size > 200) _cache.clear();
  _cache.set(key, { exp: Date.now() + ttlMs, data });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const parsed = parseEtfStatsQuery(req.query);
  if (!parsed.ok) {
    return res.status(parsed.status || 400).json({
      ok: false,
      error: parsed.error,
      maxDate: parsed.maxDate,
      proxyEtfs: parsed.proxyEtfs,
      unsupportedEtfs: parsed.unsupportedEtfs,
    });
  }

  try {
    const cacheKey = `etf-grade-stats:${JSON.stringify(parsed.options)}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);

    const out = await getEtfGradeStats(parsed.options);
    cacheSet(cacheKey, out);
    return res.status(200).json(out);
  } catch (error) {
    console.error('[stock-index/etf-grade-stats] error:', error?.message || error);
    return res.status(500).json({ ok: false, error: 'stock_index_etf_grade_stats_failed' });
  }
}
