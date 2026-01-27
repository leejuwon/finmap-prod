// pages/api/re/trade-top.js
'use strict';

const { pool: dbPool } = require('../../../lib/db');

// ---- TTL 캐시 ----
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
  return s;
}

// -------------------------
// stats WHERE / SQL
// -------------------------
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

// -------------------------
// raw fallback WHERE / SQL
// -------------------------
function pyeongBandToM2Range(bandKey) {
  if (!bandKey || bandKey === 'all') return null;
  const band = Number(bandKey);
  if (!Number.isFinite(band) || band <= 0) return null;

  const m2PerPyeong = 3.305785;
  const lo = band * m2PerPyeong;
  const hi = (band + 10) * m2PerPyeong;
  return { lo, hi };
}

function buildRawWhere({ timeframe, period, sido, lawd, gu, pyeong, buildFrom, buildTo }) {
  const filters = [];
  const params = [];

  if (timeframe === 'year') {
    const y = String(period).slice(0, 4);
    filters.push(`t.deal_ym BETWEEN ? AND ?`);
    params.push(`${y}01`, `${y}12`);
  } else {
    filters.push(`t.deal_ym = ?`);
    params.push(period);
  }

  if (sido && sido !== 'all') {
    filters.push(`LEFT(t.lawd_cd, 2) = ?`);
    params.push(sido);
  }
  if (lawd) {
    filters.push(`t.lawd_cd = ?`);
    params.push(lawd);
  }
  if (gu) {
    filters.push(`t.gu_name = ?`);
    params.push(gu);
  }

  filters.push(`(t.cancel_yn IS NULL OR t.cancel_yn <> 'Y')`);
  filters.push(`t.area_m2 > 0`);
  filters.push(`t.deal_amount_man IS NOT NULL AND t.deal_amount_man > 0`);
  filters.push(`t.apt_name IS NOT NULL AND t.apt_name <> ''`);
  filters.push(`t.dong_name IS NOT NULL AND t.dong_name <> ''`);

  const range = pyeongBandToM2Range(pyeong);
  if (range) {
    filters.push(`t.area_m2 >= ? AND t.area_m2 < ?`);
    params.push(range.lo, range.hi);
  }

  if (buildFrom != null || buildTo != null) {
    filters.push(`t.build_year IS NOT NULL`);
    if (buildFrom != null) { filters.push(`t.build_year >= ?`); params.push(buildFrom); }
    if (buildTo != null) { filters.push(`t.build_year <= ?`); params.push(buildTo); }
  }

  const whereSql = filters.length ? `WHERE ${filters.join('\n  AND ')}` : '';
  return { whereSql, params };
}

function makeRawTopSql({ whereSql, metricCol, orderDir, withLatest }) {
  // metricCol: 'tx_count' | 'median_price' | 'avg_price' | ...
  return `
    WITH base AS (
      SELECT
        t.sido_name,
        t.lawd_cd,
        t.sigungu_name,
        t.gu_name,
        t.dong_name,
        t.apt_name,

        t.apt_dong,
        t.floor,
        t.area_m2,
        t.deal_date,
        t.deal_amount_man,
        t.build_year,
        t.rgst_date,

        (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) AS price_won,
        (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) / NULLIF(t.area_m2, 0) AS ppm2
      FROM re_trade_apt t
      ${whereSql}
    ),
    ranked AS (
      SELECT
        *,
        ROW_NUMBER() OVER (
          PARTITION BY lawd_cd, sigungu_name, gu_name, dong_name, apt_name
          ORDER BY price_won
        ) AS rn_price,
        ROW_NUMBER() OVER (
          PARTITION BY lawd_cd, sigungu_name, gu_name, dong_name, apt_name
          ORDER BY ppm2
        ) AS rn_ppm2,
        ${withLatest ? `
        ROW_NUMBER() OVER (
          PARTITION BY lawd_cd, sigungu_name, gu_name, dong_name, apt_name
          ORDER BY deal_date DESC, price_won DESC
        ) AS rn_latest,
        ` : ``}
        COUNT(*) OVER (
          PARTITION BY lawd_cd, sigungu_name, gu_name, dong_name, apt_name
        ) AS cnt
      FROM base
    ),
    agg AS (
      SELECT
        CONCAT(lawd_cd,'|',IFNULL(gu_name,''),'|',dong_name,'|',apt_name) AS apt_key,

        MAX(sido_name) AS sido_name,
        LEFT(lawd_cd,2) AS sido_code,
        lawd_cd,
        sigungu_name,
        gu_name,
        dong_name,
        apt_name,

        MAX(cnt) AS tx_count,

        ROUND(AVG(ppm2), 2) AS avg_price_per_m2,
        ROUND(AVG(CASE WHEN rn_ppm2 IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN ppm2 END), 2) AS median_price_per_m2,
        ROUND(STDDEV_SAMP(ppm2), 2) AS std_price_per_m2,

        CAST(ROUND(AVG(price_won), 0) AS UNSIGNED) AS avg_price,
        CAST(ROUND(AVG(CASE WHEN rn_price IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN price_won END), 0) AS UNSIGNED) AS median_price
        ${withLatest ? `,
        MAX(CASE WHEN rn_latest=1 THEN deal_date END) AS latest_deal_date,
        MAX(CASE WHEN rn_latest=1 THEN apt_dong END) AS latest_apt_dong,
        MAX(CASE WHEN rn_latest=1 THEN floor END) AS latest_floor,
        MAX(CASE WHEN rn_latest=1 THEN area_m2 END) AS latest_area_m2,
        MAX(CASE WHEN rn_latest=1 THEN deal_amount_man END) AS latest_deal_amount_man,
        MAX(CASE WHEN rn_latest=1 THEN build_year END) AS build_year,
        MAX(CASE WHEN rn_latest=1 THEN rgst_date END) AS rgst_date
        ` : ``}
      FROM ranked
      GROUP BY
        lawd_cd, sigungu_name, gu_name, dong_name, apt_name
    ),
    final AS (
      SELECT
        *,
        ${metricCol} AS value,
        ROW_NUMBER() OVER (ORDER BY ${metricCol} ${orderDir}, tx_count DESC) AS rank_no
      FROM agg
      WHERE ${metricCol} IS NOT NULL
    )
    SELECT * FROM final
  `;
}

export default async function handler(req, res) {
  try {
    console.log('[trade-top query]', req.query);

    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    // ✅ 캐시 정책은 한 번만 설정 (nocache=1이면 완전 비활성)
    const noCache = String(req.query.nocache || '0') === '1';
    res.setHeader(
      'Cache-Control',
      noCache
        ? 'no-store'
        : 'public, max-age=20, s-maxage=120, stale-while-revalidate=86400'
    );

    const pool = dbPool;

    const sido = String(req.query.sido || 'all').trim(); // all|11|28|41
    let lawd = String(req.query.lawd || '').trim();
    let gu = String(req.query.gu || '').trim();

    if (lawd.includes('|')) {
      const [code, maybeGu] = lawd.split('|');
      lawd = (code || '').trim();
      if (!gu && maybeGu) gu = String(maybeGu).trim();
    }

    // mismatch 방어
    if (sido !== 'all' && lawd && !lawd.startsWith(sido)) {
      lawd = '';
      gu = '';
    }
    if (sido !== '41') gu = '';

    const timeframe = String(req.query.timeframe || 'month').trim(); // month|year
    let period = String(req.query.period || '').trim();

    const metric = String(req.query.metric || 'avg_price').trim();
    const order = String(req.query.order || 'desc').toLowerCase();
    const orderDir = order === 'asc' ? 'ASC' : 'DESC';
    const topN = Math.min(Math.max(Number(req.query.top || 100), 1), 200);

    const pyeong = String(req.query.pyeong || 'all').trim();
    const buildFrom = toIntOrNull(req.query.buildFrom === 'all' ? null : req.query.buildFrom);
    const buildTo = toIntOrNull(req.query.buildTo === 'all' ? null : req.query.buildTo);

    const compareModeRaw = String(req.query.compare || 'both').toLowerCase();
    const compareMode = (compareModeRaw === '1' || compareModeRaw === 'true') ? 'both' : compareModeRaw;
    const wantMoM = compareMode === 'both' || compareMode === 'mom';
    const wantYoY = compareMode === 'both' || compareMode === 'yoy';

    // period 기본값: re_trade_deal_ym
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

    // 캐시 (nocache면 내부 캐시도 스킵)
    const cacheKey = JSON.stringify({
      sido, lawd, gu, timeframe, period, metric, orderDir, topN, pyeong, buildFrom, buildTo, compareMode
    });
    if (!noCache) {
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);
    }

    // 비교기간 계산
    let momPeriod = null;
    let yoyPeriod = null;
    if (timeframe === 'year') {
      const y = String(period).slice(0, 4);
      yoyPeriod = String(Number(y) - 1);
    } else {
      momPeriod = prevMonth(period);
      yoyPeriod = prevYearMonth(period);
    }

    // ---- 1) stats 시도 ----
    const METRIC_MAP_STATS = {
      tx_count: 's.tx_count',
      sum_price: 'sum_price',
      median_price: 's.median_price',
      avg_price: 's.avg_price',
      median_price_per_m2: 's.median_price_per_m2',
      avg_price_per_m2: 's.avg_price_per_m2',
    };
    const metricColStats = METRIC_MAP_STATS[metric] || 's.avg_price';

    const table = timeframe === 'year' ? 're_trade_apt_stats_y' : 're_trade_apt_stats_m';
    const exists = await tableExists(pool, table);

    let source = 'stats';
    let curRowsRaw = [];

    if (exists) {
      const curWhere = buildStatsWhere({
        timeframe, period, pyeongBand: pyeong, sido, lawd, gu, buildFrom, buildTo
      });
      const sqlCur = makeStatsTopSql({
        table,
        whereSql: curWhere.whereSql,
        metricCol: metricColStats,
        orderDir
      });
      const [rows] = await pool.query(sqlCur, [...curWhere.params, topN]);
      curRowsRaw = rows || [];
    }

    // ---- 2) stats 결과가 0이면 raw fallback ----
    if (!curRowsRaw || curRowsRaw.length === 0) {
      source = 'raw';

      const METRIC_MAP_RAW = {
        tx_count: 'tx_count',
        median_price: 'median_price',
        avg_price: 'avg_price',
        median_price_per_m2: 'median_price_per_m2',
        avg_price_per_m2: 'avg_price_per_m2',
      };
      const metricColRaw = METRIC_MAP_RAW[metric] || 'avg_price';

      const curWhere = buildRawWhere({ timeframe, period, sido, lawd, gu, pyeong, buildFrom, buildTo });
      const sql = makeRawTopSql({ whereSql: curWhere.whereSql, metricCol: metricColRaw, orderDir, withLatest: true }) + `
        WHERE rank_no <= ?
        ORDER BY rank_no
      `;
      const [rows] = await pool.query(sql, [...curWhere.params, topN]);
      curRowsRaw = rows || [];
    }

    // 비교 안하면 종료
    if (compareMode === 'none' || compareMode === '0' || compareMode === 'false') {
      const out = {
        ok: true,
        meta: { timeframe, period, metric, order: orderDir, top: topN, compare: 'none', source },
        rows: curRowsRaw,
      };
      if (!noCache) cacheSet(cacheKey, out, 20 * 1000);
      return res.json(out);
    }

    // prevTop
    const prevTop = Math.min(2000, Math.max(600, topN * 10));

    // ---- prev 데이터 로딩 (source에 맞춰 동일 방식) ----
    let momRowsRaw = [];
    let yoyRowsRaw = [];

    if (source === 'stats') {
      const metricCol = METRIC_MAP_STATS[metric] || 's.avg_price';

      if (wantMoM && timeframe !== 'year' && momPeriod) {
        const w = buildStatsWhere({
          timeframe, period: momPeriod, pyeongBand: pyeong, sido, lawd, gu, buildFrom, buildTo
        });
        const sql = makeStatsTopSql({ table, whereSql: w.whereSql, metricCol, orderDir });
        const [rows] = await pool.query(sql, [...w.params, prevTop]);
        momRowsRaw = rows || [];
      }
      if (wantYoY && yoyPeriod) {
        const w = buildStatsWhere({
          timeframe, period: yoyPeriod, pyeongBand: pyeong, sido, lawd, gu, buildFrom, buildTo
        });
        const sql = makeStatsTopSql({ table, whereSql: w.whereSql, metricCol, orderDir });
        const [rows] = await pool.query(sql, [...w.params, prevTop]);
        yoyRowsRaw = rows || [];
      }
    } else {
      const METRIC_MAP_RAW = {
        tx_count: 'tx_count',
        median_price: 'median_price',
        avg_price: 'avg_price',
        median_price_per_m2: 'median_price_per_m2',
        avg_price_per_m2: 'avg_price_per_m2',
      };
      const metricCol = METRIC_MAP_RAW[metric] || 'avg_price';

      if (wantMoM && timeframe !== 'year' && momPeriod) {
        const w = buildRawWhere({ timeframe, period: momPeriod, sido, lawd, gu, pyeong, buildFrom, buildTo });
        const sql = makeRawTopSql({ whereSql: w.whereSql, metricCol, orderDir, withLatest: false }) + `
          WHERE rank_no <= ?
          ORDER BY rank_no
        `;
        const [rows] = await pool.query(sql, [...w.params, prevTop]);
        momRowsRaw = rows || [];
      }

      if (wantYoY && yoyPeriod) {
        const w = buildRawWhere({ timeframe, period: yoyPeriod, sido, lawd, gu, pyeong, buildFrom, buildTo });
        const sql = makeRawTopSql({ whereSql: w.whereSql, metricCol, orderDir, withLatest: false }) + `
          WHERE rank_no <= ?
          ORDER BY rank_no
        `;
        const [rows] = await pool.query(sql, [...w.params, prevTop]);
        yoyRowsRaw = rows || [];
      }
    }

    // 매핑: stats/raw 모두 apt_key로 join
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
        source,
        note: `compare period rank is mapped from top ${prevTop} of prev periods`,
      },
      rows,
    };

    if (!noCache) cacheSet(cacheKey, out, 20 * 1000);
    return res.json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || 'Server Error' });
  }
}
