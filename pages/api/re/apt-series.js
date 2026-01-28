// pages/api/re/apt-series.js
'use strict';

const { pool: dbPool } = require('../../../lib/db');

const _colCache = globalThis.__re_col_cache || (globalThis.__re_col_cache = new Map());

async function hasColumn(tableName, columnName) {
  const key = `${tableName}.${columnName}`;
  if (_colCache.has(key)) return _colCache.get(key);

  const [rows] = await dbPool.execute(
    `
    SELECT 1 AS ok
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND column_name = ?
    LIMIT 1
    `,
    [tableName, columnName]
  );

  const yes = !!(rows && rows.length);
  _colCache.set(key, yes);
  return yes;
}

function isYm(v) {
  return /^\d{6}$/.test(String(v || ''));
}
function isYear(v) {
  return /^\d{4}$/.test(String(v || ''));
}

export default async function handler(req, res) {
  try {
    const q = req.query || {};
    const apt_key = q.apt_key || q.aptKey;
    if (!apt_key) return res.status(400).json({ ok: false, error: 'apt_key is required' });

    const timeframe = String(q.timeframe || 'month').toLowerCase() === 'year' ? 'year' : 'month';
    const band = String(q.band || q.pyeong_band || 'all').toLowerCase();

    // 범위(선택): 없으면 전체
    const from = String(q.from || '').trim();
    const to = String(q.to || '').trim();

    if (timeframe === 'month') {
      if (from && !isYm(from)) return res.status(400).json({ ok: false, error: 'from must be YYYYMM' });
      if (to && !isYm(to)) return res.status(400).json({ ok: false, error: 'to must be YYYYMM' });
    } else {
      if (from && !isYear(from)) return res.status(400).json({ ok: false, error: 'from must be YYYY' });
      if (to && !isYear(to)) return res.status(400).json({ ok: false, error: 'to must be YYYY' });
    }

    const statsTable = timeframe === 'month' ? 're_trade_apt_stats_m' : 're_trade_apt_stats_y';
    const periodCol = timeframe === 'month' ? 'deal_ym' : 'deal_y';

    const hasSum = await hasColumn(statsTable, 'sum_price');
    const hasMax = await hasColumn(statsTable, 'max_price');

    const where = [];
    const params = [];

    where.push('apt_key = ?');
    params.push(apt_key);

    where.push('pyeong_band = ?');
    params.push(band);

    if (from && to) {
      where.push(`${periodCol} BETWEEN ? AND ?`);
      params.push(from, to);
    } else if (from) {
      where.push(`${periodCol} >= ?`);
      params.push(from);
    } else if (to) {
      where.push(`${periodCol} <= ?`);
      params.push(to);
    }

    const sql = `
      SELECT
        ${periodCol} AS period,
        tx_count,
        avg_price, median_price,
        ${hasMax ? 'max_price' : 'NULL AS max_price'},
        ${hasSum ? 'sum_price' : 'NULL AS sum_price'},
        avg_price_per_m2, median_price_per_m2, std_price_per_m2
      FROM ${statsTable}
      WHERE ${where.join(' AND ')}
      ORDER BY ${periodCol} ASC
    `;

    const [rows] = await dbPool.execute(sql, params);
    return res.status(200).json({ ok: true, rows: rows || [] });
  } catch (e) {
    console.error('[apt-series] error:', e);
    return res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}
