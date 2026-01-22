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

function toIntOrNull(v) {
  if (v == null) return null;
  const n = Number(String(v));
  return Number.isFinite(n) ? n : null;
}

function pyeongBandToM2Range(bandKey) {
  if (!bandKey || bandKey === 'all') return null;
  const band = Number(bandKey);
  if (!Number.isFinite(band) || band <= 0) return null;

  const m2PerPyeong = 3.305785;
  const lo = band * m2PerPyeong;
  const hi = (band + 10) * m2PerPyeong; // 10평대 = [10,20)
  return { lo, hi };
}

function pct(cur, prev) {
  const c = cur == null ? null : Number(cur);
  const p = prev == null ? null : Number(prev);
  if (c == null || !Number.isFinite(c) || p == null || !Number.isFinite(p) || p === 0) return null;
  return ((c - p) / p) * 100;
}

function buildWhere({ timeframe, period, sido, lawd, gu, pyeong, buildFrom, buildTo }) {
  const filters = [];
  const params = [];

  // 기간
  if (timeframe === 'year') {
    const y = String(period).slice(0, 4);
    filters.push(`t.deal_ym BETWEEN ? AND ?`);
    params.push(`${y}01`, `${y}12`);
  } else {
    filters.push(`t.deal_ym = ?`);
    params.push(period);
  }

  // 범위
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

  // 유효성
  filters.push(`(t.cancel_yn IS NULL OR t.cancel_yn <> 'Y')`);
  filters.push(`t.area_m2 > 0`);
  filters.push(`t.deal_amount_man IS NOT NULL AND t.deal_amount_man > 0`);
  filters.push(`t.apt_name IS NOT NULL AND t.apt_name <> ''`);
  filters.push(`t.dong_name IS NOT NULL AND t.dong_name <> ''`);

  // 평형
  const range = pyeongBandToM2Range(pyeong);
  if (range) {
    filters.push(`t.area_m2 >= ? AND t.area_m2 < ?`);
    params.push(range.lo, range.hi);
  }

  // 년식
  if (buildFrom != null || buildTo != null) {
    filters.push(`t.build_year IS NOT NULL`);
    if (buildFrom != null) {
      filters.push(`t.build_year >= ?`);
      params.push(buildFrom);
    }
    if (buildTo != null) {
      filters.push(`t.build_year <= ?`);
      params.push(buildTo);
    }
  }

  const whereSql = filters.length ? `WHERE ${filters.join('\n  AND ')}` : '';
  return { whereSql, params };
}

function makeSql({ whereSql, metricCol, orderDir, withLatest }) {
  // 키: (lawd_cd, sigungu_name, gu_name, dong_name, apt_name)
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
        lawd_cd,
        sigungu_name,
        gu_name,
        dong_name,
        apt_name,

        MAX(cnt) AS tx_count,

        ROUND(AVG(ppm2), 2) AS avg_price_per_m2,
        ROUND(AVG(CASE WHEN rn_ppm2 IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN ppm2 END), 2) AS median_price_per_m2,

        CAST(ROUND(AVG(price_won), 0) AS UNSIGNED) AS avg_price,
        CAST(ROUND(AVG(CASE WHEN rn_price IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN price_won END), 0) AS UNSIGNED) AS median_price
        ${withLatest ? `,
        MAX(CASE WHEN rn_latest=1 THEN deal_date END) AS latest_deal_date,
        MAX(CASE WHEN rn_latest=1 THEN apt_dong END) AS latest_apt_dong,
        MAX(CASE WHEN rn_latest=1 THEN floor END) AS latest_floor,
        MAX(CASE WHEN rn_latest=1 THEN area_m2 END) AS latest_area_m2,
        MAX(CASE WHEN rn_latest=1 THEN deal_amount_man END) AS latest_deal_amount_man,
        MAX(CASE WHEN rn_latest=1 THEN build_year END) AS latest_build_year,
        MAX(CASE WHEN rn_latest=1 THEN rgst_date END) AS latest_rgst_date
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
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    const pool = getPool();

    const sido = String(req.query.sido || 'all'); // all|11|28|41
    const lawd = String(req.query.lawd || '');   // 구 코드(서울/인천) / 도시코드(경기)
    const gu = String(req.query.gu || '');       // 경기 구(수정구/분당구/영통구...)

    const timeframe = String(req.query.timeframe || 'month'); // month|year
    let period = String(req.query.period || '');

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

    // period 기본값: 최신
    if (!period) {
      const [r] = await pool.query(`SELECT MAX(deal_ym) AS max_ym FROM re_trade_apt`);
      period = String(r?.[0]?.max_ym || '');
    }
    if (!period) return res.status(400).json({ ok: false, error: 'period is required' });

    const METRIC_MAP = {
      tx_count: 'tx_count',
      median_price: 'median_price',
      avg_price: 'avg_price',
      median_price_per_m2: 'median_price_per_m2',
      avg_price_per_m2: 'avg_price_per_m2',
    };
    const metricCol = METRIC_MAP[metric] || 'avg_price';
    const orderDir = order === 'asc' ? 'ASC' : 'DESC';

    // 현재 기간 / 비교 기간 계산
    let momPeriod = null;
    let yoyPeriod = null;

    if (timeframe === 'year') {
      const y = String(period).slice(0, 4);
      momPeriod = null;                // 연간은 MoM 의미 없음
      yoyPeriod = String(Number(y) - 1);
    } else {
      // month
      momPeriod = prevMonth(period);
      yoyPeriod = prevYearMonth(period);
    }

    // WHERE (현재)
    const curWhere = buildWhere({ timeframe, period, sido, lawd, gu, pyeong, buildFrom, buildTo });
    const sqlCur = makeSql({ whereSql: curWhere.whereSql, metricCol, orderDir, withLatest: true }) + `
      WHERE rank_no <= ?
      ORDER BY rank_no
    `;
    const [curRowsRaw] = await pool.query(sqlCur, [...curWhere.params, topN]);

    // 비교 안하면 종료
    if (compareMode === 'none' || compareMode === '0' || compareMode === 'false') {
      return res.json({
        ok: true,
        meta: { timeframe, period, metric: metricCol, order: orderDir, top: topN },
        rows: curRowsRaw,
      });
    }

    // prev/month (MoM)
    let momRowsRaw = [];
    if (wantMoM && timeframe !== 'year' && momPeriod) {
      const momWhere = buildWhere({ timeframe, period: momPeriod, sido, lawd, gu, pyeong, buildFrom, buildTo });
      const sqlMoM = makeSql({ whereSql: momWhere.whereSql, metricCol, orderDir, withLatest: false });
      const [rows] = await pool.query(sqlMoM, momWhere.params);
      momRowsRaw = rows || [];
    }

    // yoy (전년동월 or 전년)
    let yoyRowsRaw = [];
    if (wantYoY && yoyPeriod) {
      const yoyWhere = buildWhere({ timeframe, period: yoyPeriod, sido, lawd, gu, pyeong, buildFrom, buildTo });
      const sqlYoY = makeSql({ whereSql: yoyWhere.whereSql, metricCol, orderDir, withLatest: false });
      const [rows] = await pool.query(sqlYoY, yoyWhere.params);
      yoyRowsRaw = rows || [];
    }

    const keyOf = (r) =>
      `${r.lawd_cd}||${r.sigungu_name || ''}||${r.gu_name || ''}||${r.dong_name || ''}||${r.apt_name || ''}`;

    const momMap = new Map();
    for (const r of momRowsRaw) momMap.set(keyOf(r), r);

    const yoyMap = new Map();
    for (const r of yoyRowsRaw) yoyMap.set(keyOf(r), r);

    const rows = curRowsRaw.map((r) => {
      const mom = momMap.get(keyOf(r));
      const yoy = yoyMap.get(keyOf(r));

      // 선택 metric 기준 순위 변동
      const momRankDelta = mom && mom.rank_no != null ? Number(mom.rank_no) - Number(r.rank_no) : null;
      const yoyRankDelta = yoy && yoy.rank_no != null ? Number(yoy.rank_no) - Number(r.rank_no) : null;

      // 선택 metric 값 변동(%)
      const momMetricPct = mom ? pct(Number(r.value), Number(mom.value)) : null;
      const yoyMetricPct = yoy ? pct(Number(r.value), Number(yoy.value)) : null;

      return {
        ...r,

        // 기간 정보
        mom_period: momPeriod,
        yoy_period: yoyPeriod,

        // 순위(선택 metric)
        mom_rank_delta: momRankDelta,
        yoy_rank_delta: yoyRankDelta,

        // % 변화(선택 metric)
        mom_metric_pct: momMetricPct,
        yoy_metric_pct: yoyMetricPct,

        // 거래량/가격 % (요청한 것들)
        mom_tx_count_pct: mom ? pct(r.tx_count, mom.tx_count) : null,
        yoy_tx_count_pct: yoy ? pct(r.tx_count, yoy.tx_count) : null,

        mom_median_price_pct: mom ? pct(r.median_price, mom.median_price) : null,
        yoy_median_price_pct: yoy ? pct(r.median_price, yoy.median_price) : null,

        mom_avg_price_pct: mom ? pct(r.avg_price, mom.avg_price) : null,
        yoy_avg_price_pct: yoy ? pct(r.avg_price, yoy.avg_price) : null,

        // 평단가 쪽도 같이(원/㎡ 기준)
        mom_median_price_per_m2_pct: mom ? pct(r.median_price_per_m2, mom.median_price_per_m2) : null,
        yoy_median_price_per_m2_pct: yoy ? pct(r.median_price_per_m2, yoy.median_price_per_m2) : null,

        mom_avg_price_per_m2_pct: mom ? pct(r.avg_price_per_m2, mom.avg_price_per_m2) : null,
        yoy_avg_price_per_m2_pct: yoy ? pct(r.avg_price_per_m2, yoy.avg_price_per_m2) : null,
      };
    });

    return res.json({
      ok: true,
      meta: {
        timeframe,
        period,
        mom_period: momPeriod,
        yoy_period: yoyPeriod,
        metric: metricCol,
        order: orderDir,
        top: topN,
        compare: compareMode,
      },
      rows,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || 'Server Error' });
  }
}
