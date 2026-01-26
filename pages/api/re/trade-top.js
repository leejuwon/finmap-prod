// pages/api/re/trade-top.js
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

// ---- TTL 캐시 (trade-top은 같은 파라미터 반복 호출 많음) ----
const _cache = globalThis.__re_trade_top_cache || (globalThis.__re_trade_top_cache = new Map());
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
  if (_cache.size > 300) {
    const keys = Array.from(_cache.keys());
    for (let i = 0; i < 100; i++) _cache.delete(keys[i]);
  }
  _cache.set(key, { exp: Date.now() + ttlMs, data });
}

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.min(Math.max(x, lo), hi);
}
function toNum(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function toIntOrNull(v) {
  if (v == null) return null;
  const n = Number(String(v));
  return Number.isFinite(n) ? n : null;
}

function computeQuality({ txCount, cvPpm2 }) {
  const tx = Math.max(0, Number(txCount || 0));
  const txScore = clamp((Math.log10(tx + 1) / Math.log10(31)) * 100, 0, 100);

  const cv = toNum(cvPpm2);
  const cvScore =
    cv == null ? 60 :
    cv <= 0.05 ? 100 :
    cv >= 0.35 ? 20 :
    clamp(100 - ((cv - 0.05) / (0.35 - 0.05)) * 80, 20, 100);

  const score = Math.round(txScore * 0.7 + cvScore * 0.3);
  const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';
  return { score, grade };
}

function prevMonth(yyyymm) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const py = m === 1 ? y - 1 : y;
  const pm = m === 1 ? 12 : m - 1;
  return `${py}${String(pm).padStart(2, '0')}`;
}
function prevYearMonth(yyyymm) {
  const y = Number(yyyymm.slice(0, 4));
  const mm = yyyymm.slice(4, 6);
  return `${y - 1}${mm}`;
}
function pct(cur, prev) {
  const c = cur == null ? null : Number(cur);
  const p = prev == null ? null : Number(prev);
  if (c == null || !Number.isFinite(c) || p == null || !Number.isFinite(p) || p === 0) return null;
  return ((c - p) / p) * 100;
}

function normalizeGu(v) {
  const s = (v == null ? '' : String(v)).trim();
  return s; // stats에서는 ''가 전체/없음
}

// stats WHERE
function buildStatsWhere({ timeframe, period, pyeongBand, sido, lawd, gu, buildFrom, buildTo }) {
  const filters = [];
  const params = [];

  if (timeframe === 'year') {
    const y = String(period).slice(0, 4);
    filters.push(`s.deal_y = ?`);
    params.push(y);
  } else {
    filters.push(`s.deal_ym = ?`);
    params.push(period);
  }

  const band = (!pyeongBand || pyeongBand === 'all') ? 'all' : String(pyeongBand);
  filters.push(`s.pyeong_band = ?`);
  params.push(band);

  if (sido && sido !== 'all') {
    filters.push(`s.sido_code = ?`);
    params.push(sido);
  }
  if (lawd) {
    filters.push(`s.lawd_cd = ?`);
    params.push(lawd);
  }
  if (gu) {
    filters.push(`s.gu_name = ?`);
    params.push(normalizeGu(gu));
  }

  if (buildFrom != null || buildTo != null) {
    filters.push(`s.build_year IS NOT NULL`);
    if (buildFrom != null) { filters.push(`s.build_year >= ?`); params.push(buildFrom); }
    if (buildTo != null) { filters.push(`s.build_year <= ?`); params.push(buildTo); }
  }

  return { whereSql: `WHERE ${filters.join('\n  AND ')}`, params, band };
}

function makeStatsTopSql({ table, whereSql, metricCol, orderDir }) {
  return `
    WITH filtered AS (
      SELECT
        s.apt_key,
        s.sido_name,
        s.sido_code,
        s.lawd_cd,
        s.sigungu_name,
        NULLIF(s.gu_name,'') AS gu_name,
        s.dong_name,
        s.apt_name,

        s.tx_count,
        s.avg_price_per_m2,
        s.median_price_per_m2,
        s.std_price_per_m2,
        s.avg_price,
        s.median_price,

        s.latest_deal_date,
        s.latest_apt_dong,
        s.latest_floor,
        s.latest_area_m2,
        s.latest_deal_amount_man,
        s.build_year,
        s.rgst_date,

        ${metricCol} AS value
      FROM ${table} s
      ${whereSql}
    ),
    final AS (
      SELECT
        *,
        ROW_NUMBER() OVER (ORDER BY value ${orderDir}, tx_count DESC) AS rank_no
      FROM filtered
      WHERE value IS NOT NULL
    )
    SELECT * FROM final
    WHERE rank_no <= ?
    ORDER BY rank_no
  `;
}

async function tableExists(pool, tableName) {
  const [rows] = await pool.query(
    `
    SELECT 1 AS ok
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = ?
    LIMIT 1
    `,
    [tableName]
  );
  return rows && rows.length > 0;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    // HTTP 캐시
    res.setHeader('Cache-Control', 'public, max-age=20, s-maxage=120, stale-while-revalidate=86400');

    const pool = getPool();

    const sido = String(req.query.sido || 'all'); // all|11|28|41
    const lawd = String(req.query.lawd || '').trim();
    const gu = String(req.query.gu || '').trim();

    const timeframe = String(req.query.timeframe || 'month'); // month|year
    let period = String(req.query.period || '').trim();

    const metric = String(req.query.metric || 'avg_price');
    const order = String(req.query.order || 'desc').toLowerCase();
    const topN = Math.min(Math.max(Number(req.query.top || 100), 1), 200);

    const pyeong = String(req.query.pyeong || 'all');
    const buildFrom = toIntOrNull(req.query.buildFrom === 'all' ? null : req.query.buildFrom);
    const buildTo = toIntOrNull(req.query.buildTo === 'all' ? null : req.query.buildTo);

    const compareModeRaw = String(req.query.compare || 'both').toLowerCase();
    const compareMode = (compareModeRaw === '1' || compareModeRaw === 'true') ? 'both' : compareModeRaw;
    const wantMoM = compareMode === 'both' || compareMode === 'mom';
    const wantYoY = compareMode === 'both' || compareMode === 'yoy';

    const METRIC_MAP = {
      tx_count: 's.tx_count',
      median_price: 's.median_price',
      avg_price: 's.avg_price',
      median_price_per_m2: 's.median_price_per_m2',
      avg_price_per_m2: 's.avg_price_per_m2',
    };

    const metricCol = METRIC_MAP[metric] || 's.avg_price';
    const orderDir = order === 'asc' ? 'ASC' : 'DESC';

    const table = timeframe === 'year' ? 're_trade_apt_stats_y' : 're_trade_apt_stats_m';
    const exists = await tableExists(pool, table);
    if (!exists) {
      return res.status(503).json({
        ok: false,
        error: `Missing ${table}. Build apt stats first (re_build_apt_stats.js).`,
      });
    }

    // period 기본값(최신): re_trade_deal_ym
    if (!period) {
      if (timeframe === 'year') {
        const [r] = await pool.query(`SELECT LEFT(MAX(deal_ym),4) AS max_y FROM re_trade_deal_ym`);
        period = String(r?.[0]?.max_y || '');
      } else {
        const [r] = await pool.query(`SELECT MAX(deal_ym) AS max_ym FROM re_trade_deal_ym`);
        period = String(r?.[0]?.max_ym || '');
      }
    }
    if (!period) return res.status(400).json({ ok: false, error: 'period is required' });

    // 캐시 키
    const cacheKey = JSON.stringify({
      sido, lawd, gu, timeframe, period, metric, order, topN, pyeong, buildFrom, buildTo, compareMode
    });
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    // 비교기간 계산
    let momPeriod = null;
    let yoyPeriod = null;

    if (timeframe === 'year') {
      const y = String(period).slice(0, 4);
      momPeriod = null;
      yoyPeriod = String(Number(y) - 1);
    } else {
      momPeriod = prevMonth(period);
      yoyPeriod = prevYearMonth(period);
    }

    // 현재 TOP
    const curWhere = buildStatsWhere({
      timeframe, period, pyeongBand: pyeong, sido, lawd, gu, buildFrom, buildTo
    });
    const sqlCur = makeStatsTopSql({
      table,
      whereSql: curWhere.whereSql,
      metricCol,
      orderDir
    });
    const [curRowsRaw] = await pool.query(sqlCur, [...curWhere.params, topN]);

    if (compareMode === 'none' || compareMode === '0' || compareMode === 'false') {
      const out = {
        ok: true,
        meta: { timeframe, period, metric, order: orderDir, top: topN, compare: 'none' },
        rows: curRowsRaw,
      };
      cacheSet(cacheKey, out, 20 * 1000);
      return res.json(out);
    }

    // prev는 stats라 가볍지만, 그래도 안전하게 "적당히 넉넉한 top"만 뽑아 매핑(랭크Δ는 범위 밖이면 null)
    const prevTop = Math.min(2000, Math.max(600, topN * 10));

    let momRowsRaw = [];
    if (wantMoM && timeframe !== 'year' && momPeriod) {
      const w = buildStatsWhere({
        timeframe, period: momPeriod, pyeongBand: pyeong, sido, lawd, gu, buildFrom, buildTo
      });
      const sql = makeStatsTopSql({ table, whereSql: w.whereSql, metricCol, orderDir });
      const [rows] = await pool.query(sql, [...w.params, prevTop]);
      momRowsRaw = rows || [];
    }

    let yoyRowsRaw = [];
    if (wantYoY && yoyPeriod) {
      const w = buildStatsWhere({
        timeframe, period: yoyPeriod, pyeongBand: pyeong, sido, lawd, gu, buildFrom, buildTo
      });
      const sql = makeStatsTopSql({ table, whereSql: w.whereSql, metricCol, orderDir });
      const [rows] = await pool.query(sql, [...w.params, prevTop]);
      yoyRowsRaw = rows || [];
    }

    const momMap = new Map();
    for (const r of momRowsRaw) momMap.set(String(r.apt_key), r);

    const yoyMap = new Map();
    for (const r of yoyRowsRaw) yoyMap.set(String(r.apt_key), r);

    const rows = (curRowsRaw || []).map((r) => {
      const key = String(r.apt_key);
      const mom = momMap.get(key);
      const yoy = yoyMap.get(key);

      const momRankDelta = mom && mom.rank_no != null ? Number(mom.rank_no) - Number(r.rank_no) : null;
      const yoyRankDelta = yoy && yoy.rank_no != null ? Number(yoy.rank_no) - Number(r.rank_no) : null;

      const momMetricPct = mom ? pct(Number(r.value), Number(mom.value)) : null;
      const yoyMetricPct = yoy ? pct(Number(r.value), Number(yoy.value)) : null;

      const momMedianDeltaWon =
        mom && r.median_price != null && mom.median_price != null
          ? (Number(r.median_price) - Number(mom.median_price))
          : null;

      const yoyMedianDeltaWon =
        yoy && r.median_price != null && yoy.median_price != null
          ? (Number(r.median_price) - Number(yoy.median_price))
          : null;

      const momAvgDeltaWon =
        mom && r.avg_price != null && mom.avg_price != null
          ? (Number(r.avg_price) - Number(mom.avg_price))
          : null;

      const yoyAvgDeltaWon =
        yoy && r.avg_price != null && yoy.avg_price != null
          ? (Number(r.avg_price) - Number(yoy.avg_price))
          : null;

      const avgPpm2 = toNum(r.avg_price_per_m2);
      const stdPpm2 = toNum(r.std_price_per_m2);
      const cvPpm2 =
        (avgPpm2 != null && stdPpm2 != null && avgPpm2 > 0)
          ? (stdPpm2 / avgPpm2)
          : null;

      const q = computeQuality({ txCount: r.tx_count, cvPpm2 });

      return {
        ...r,
        mom_period: momPeriod,
        yoy_period: yoyPeriod,

        mom_rank_delta: momRankDelta,
        yoy_rank_delta: yoyRankDelta,

        mom_metric_pct: momMetricPct,
        yoy_metric_pct: yoyMetricPct,

        mom_tx_count_pct: mom ? pct(r.tx_count, mom.tx_count) : null,
        yoy_tx_count_pct: yoy ? pct(r.tx_count, yoy.tx_count) : null,

        mom_median_price_pct: mom ? pct(r.median_price, mom.median_price) : null,
        yoy_median_price_pct: yoy ? pct(r.median_price, yoy.median_price) : null,
        mom_avg_price_pct: mom ? pct(r.avg_price, mom.avg_price) : null,
        yoy_avg_price_pct: yoy ? pct(r.avg_price, yoy.avg_price) : null,

        mom_median_price_per_m2_pct: mom ? pct(r.median_price_per_m2, mom.median_price_per_m2) : null,
        yoy_median_price_per_m2_pct: yoy ? pct(r.median_price_per_m2, yoy.median_price_per_m2) : null,
        mom_avg_price_per_m2_pct: mom ? pct(r.avg_price_per_m2, mom.avg_price_per_m2) : null,
        yoy_avg_price_per_m2_pct: yoy ? pct(r.avg_price_per_m2, yoy.avg_price_per_m2) : null,

        mom_median_price_delta_won: momMedianDeltaWon,
        yoy_median_price_delta_won: yoyMedianDeltaWon,
        mom_avg_price_delta_won: momAvgDeltaWon,
        yoy_avg_price_delta_won: yoyAvgDeltaWon,

        cv_price_per_m2: cvPpm2,
        quality_score: q.score,
        quality_grade: q.grade,
      };
    });

    const out = {
      ok: true,
      meta: {
        timeframe,
        period,
        mom_period: momPeriod,
        yoy_period: yoyPeriod,
        metric,
        order: orderDir,
        top: topN,
        compare: compareMode,
        note: `compare period rank is mapped from top ${prevTop} of prev periods`,
      },
      rows,
    };

    cacheSet(cacheKey, out, 20 * 1000);
    return res.json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || 'Server Error' });
  }
}
