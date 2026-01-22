// pages/api/re/top-apt.js
import mysql from "mysql2/promise";

const PY = 3.305785; // 1평 ≈ 3.305785㎡

let _pool;
function getPool() {
  if (_pool) return _pool;
  _pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    charset: "utf8mb4",
  });
  return _pool;
}

function s(v, def = "") {
  return v === undefined || v === null ? def : String(v);
}
function n(v, def = null) {
  const x = Number(v);
  return Number.isFinite(x) ? x : def;
}

function parseSigungu(value) {
  const v = s(value, "ALL");
  if (v === "ALL") return { sigungu_name: null, gu_name: null };
  const parts = v.split("|");
  if (parts[0] === "SIG" && parts[1]) return { sigungu_name: parts[1], gu_name: null };
  if (parts[0] === "GU" && parts[1] && parts[2]) return { sigungu_name: parts[1], gu_name: parts[2] };
  return { sigungu_name: v, gu_name: null };
}

function addMonth(yyyymm) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  return `${ny}${String(nm).padStart(2, "0")}`;
}
function prevMonth(yyyymm) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const py = m === 1 ? y - 1 : y;
  const pm = m === 1 ? 12 : m - 1;
  return `${py}${String(pm).padStart(2, "0")}`;
}
function yoyMonth(yyyymm) {
  const y = Number(yyyymm.slice(0, 4)) - 1;
  const m = yyyymm.slice(4, 6);
  return `${y}${m}`;
}

function periodToWhere(timeframe, period) {
  if (timeframe === "year") {
    const y = String(period).slice(0, 4);
    return { sql: "t.deal_ym BETWEEN ? AND ?", params: [`${y}01`, `${y}12`] };
  }
  return { sql: "t.deal_ym = ?", params: [String(period)] };
}

function pyeongRange(pyeong) {
  const p = s(pyeong, "ALL");
  if (p === "ALL") return null;
  const band = Number(p); // 10/20/30/40
  if (![10, 20, 30, 40].includes(band)) return null;
  const minM2 = band * PY;
  const maxM2 = (band + 10) * PY;
  return { minM2, maxM2 };
}

function pct(cur, prev) {
  const a = Number(cur);
  const b = Number(prev);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
  return ((a - b) / b) * 100;
}

// period 한 번에 단지(키)별 tx_count/median/avg + 대표 1건(최근 거래)까지 뽑기
async function fetchAgg(pool, { timeframe, period, sido, sigunguSel, pyeong, buildFrom, buildTo }) {
  const { sigungu_name, gu_name } = parseSigungu(sigunguSel);

  const wheres = [];
  const params = [];

  // 기간
  const pw = periodToWhere(timeframe, period);
  wheres.push(pw.sql);
  params.push(...pw.params);

  // 지역
  if (sido && sido !== "ALL") {
    wheres.push("LEFT(t.lawd_cd,2)=?");
    params.push(sido);
  }
  if (sigungu_name) {
    wheres.push("t.sigungu_name=?");
    params.push(sigungu_name);
  }
  if (gu_name) {
    wheres.push("t.gu_name=?");
    params.push(gu_name);
  }

  // 기본 필터
  wheres.push("(t.cancel_yn IS NULL OR t.cancel_yn <> 'Y')");
  wheres.push("t.area_m2 > 0");
  wheres.push("t.deal_amount_man IS NOT NULL");
  wheres.push("t.deal_amount_man > 0");

  // 평형
  const pr = pyeongRange(pyeong);
  if (pr) {
    wheres.push("t.area_m2 >= ? AND t.area_m2 < ?");
    params.push(pr.minM2, pr.maxM2);
  }

  // 년식(from/to)
  const bf = s(buildFrom, "ALL");
  const bt = s(buildTo, "ALL");
  if (bf !== "ALL" || bt !== "ALL") {
    wheres.push("t.build_year IS NOT NULL");
    if (bf !== "ALL") {
      wheres.push("t.build_year >= ?");
      params.push(Number(bf));
    }
    if (bt !== "ALL") {
      wheres.push("t.build_year <= ?");
      params.push(Number(bt));
    }
  }

  const whereSql = wheres.length ? `WHERE ${wheres.join(" AND ")}` : "";

  const sql = `
WITH base AS (
  SELECT
    t.sido_name, t.sigungu_name, t.gu_name, t.dong_name, t.apt_name,
    t.apt_dong, t.floor, t.deal_date, t.deal_amount_man, t.area_m2, t.build_year,
    t.dealing_gbn, t.rgst_date,
    CONCAT_WS('|',
      t.sido_name,
      t.sigungu_name,
      IFNULL(t.gu_name,''),
      IFNULL(t.dong_name,''),
      t.apt_name
    ) AS k,
    (CAST(t.deal_amount_man AS DECIMAL(18,2)) * 10000) AS price_won,
    (CAST(t.deal_amount_man AS DECIMAL(18,2)) * 10000) / NULLIF(t.area_m2,0) AS ppm2
  FROM re_trade_apt t
  ${whereSql}
),
ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY k ORDER BY price_won) AS rn_price,
    ROW_NUMBER() OVER (PARTITION BY k ORDER BY ppm2)      AS rn_ppm2,
    COUNT(*)    OVER (PARTITION BY k) AS cnt
  FROM base
),
med AS (
  SELECT
    k,
    AVG(CASE WHEN rn_price IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN price_won END) AS median_price,
    AVG(CASE WHEN rn_ppm2  IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN ppm2 END)      AS median_price_per_m2
  FROM ranked
  GROUP BY k
),
agg AS (
  SELECT
    k,
    MIN(sido_name) AS sido_name,
    MIN(sigungu_name) AS sigungu_name,
    MIN(gu_name) AS gu_name,
    MIN(dong_name) AS dong_name,
    MIN(apt_name) AS apt_name,
    COUNT(*) AS tx_count,
    AVG(price_won) AS avg_price,
    AVG(ppm2) AS avg_price_per_m2
  FROM base
  GROUP BY k
),
rep AS (
  SELECT * FROM (
    SELECT
      k,
      apt_dong, floor, deal_date, deal_amount_man, area_m2, build_year, dealing_gbn, rgst_date,
      ROW_NUMBER() OVER (PARTITION BY k ORDER BY deal_date DESC, deal_amount_man DESC) AS rn
    FROM base
  ) x
  WHERE rn = 1
)
SELECT
  a.k,
  a.sido_name, a.sigungu_name, a.gu_name, a.dong_name, a.apt_name,
  a.tx_count,
  m.median_price, a.avg_price,
  m.median_price_per_m2, a.avg_price_per_m2,
  r.deal_date AS latest_deal_date,
  r.deal_amount_man AS latest_deal_amount_man,
  r.area_m2 AS latest_area_m2,
  r.floor AS latest_floor,
  r.apt_dong AS latest_apt_dong,
  r.build_year,
  r.dealing_gbn,
  r.rgst_date
FROM agg a
JOIN med m ON m.k = a.k
JOIN rep r ON r.k = a.k
`;

  const [rows] = await pool.query(sql, params);
  return rows || [];
}

function metricValue(row, metric, prevRow, yoyRow) {
  switch (metric) {
    case "tx_count": return Number(row.tx_count);
    case "median_price": return Number(row.median_price);
    case "avg_price": return Number(row.avg_price);
    case "median_price_per_m2": return Number(row.median_price_per_m2);
    case "avg_price_per_m2": return Number(row.avg_price_per_m2);

    // 변화율 Top
    case "tx_count_mom_pct": return pct(row.tx_count, prevRow?.tx_count);
    case "tx_count_yoy_pct": return pct(row.tx_count, yoyRow?.tx_count);
    case "avg_price_mom_pct": return pct(row.avg_price, prevRow?.avg_price);
    case "avg_price_yoy_pct": return pct(row.avg_price, yoyRow?.avg_price);

    default: return null;
  }
}

export default async function handler(req, res) {
  try {
    const pool = getPool();

    const timeframe = s(req.query.timeframe, "month"); // month|year
    const period = s(req.query.period, "");            // 202501 or 2025
    const sido = s(req.query.sido, "ALL");             // ALL|11|28|41
    const sigungu = s(req.query.sigungu, "ALL");       // ALL | SIG|... | GU|...|...
    const metric = s(req.query.metric, "avg_price");   // 기본: 평균(총액)
    const order = s(req.query.order, "desc");          // desc|asc
    const topN = Math.max(1, Math.min(100, Number(req.query.top || 100)));

    const pyeong = s(req.query.pyeong, "ALL");         // ALL|10|20|30|40
    const buildFrom = s(req.query.buildFrom, "ALL");   // ALL or year
    const buildTo = s(req.query.buildTo, "ALL");       // ALL or year

    if (!period) {
      return res.status(400).json({ error: "period is required" });
    }

    // prev / yoy period
    let prevP = null;
    let yoyP = null;
    if (timeframe === "month") {
      prevP = prevMonth(period);
      yoyP = yoyMonth(period);
    } else {
      prevP = String(Number(period) - 1);
      yoyP = String(Number(period) - 1);
    }

    const cur = await fetchAgg(pool, { timeframe, period, sido, sigunguSel: sigungu, pyeong, buildFrom, buildTo });
    const prev = prevP ? await fetchAgg(pool, { timeframe, period: prevP, sido, sigunguSel: sigungu, pyeong, buildFrom, buildTo }) : [];
    const yoy = yoyP ? await fetchAgg(pool, { timeframe, period: yoyP, sido, sigunguSel: sigungu, pyeong, buildFrom, buildTo }) : [];

    const prevMap = new Map(prev.map((r) => [r.k, r]));
    const yoyMap = new Map(yoy.map((r) => [r.k, r]));

    // 정렬 값 계산
    const enriched = cur.map((r) => {
      const pr = prevMap.get(r.k);
      const yr = yoyMap.get(r.k);
      const v = metricValue(r, metric, pr, yr);
      return { ...r, _metric_value: v, _prev: pr || null, _yoy: yr || null };
    });

    // 정렬 (null은 뒤로)
    enriched.sort((a, b) => {
      const av = a._metric_value;
      const bv = b._metric_value;

      const aNull = av === null || av === undefined || Number.isNaN(Number(av));
      const bNull = bv === null || bv === undefined || Number.isNaN(Number(bv));
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;

      if (order === "asc") return Number(av) - Number(bv);
      return Number(bv) - Number(av);
    });

    // rank 부여
    enriched.forEach((r, i) => (r.rank_no = i + 1));

    // prevRank / yoyRank (같은 metric 기준으로 비교)
    // ※ pct metric의 “이전 rank”는 정의가 복잡해서(전월%의 전월…) 일단 base metric으로만 rank_delta 계산
    const baseMetric = (metric.endsWith("_mom_pct") || metric.endsWith("_yoy_pct"))
      ? metric.replace(/_(mom|yoy)_pct$/, "")  // avg_price_mom_pct -> avg_price
      : metric;

    const prevRankMap = new Map();
    if (prev.length) {
      const tmp = prev
        .map((r) => ({ k: r.k, v: metricValue(r, baseMetric, null, null) }))
        .sort((a, b) => Number(b.v) - Number(a.v));
      tmp.forEach((x, i) => prevRankMap.set(x.k, i + 1));
    }

    const yoyRankMap = new Map();
    if (yoy.length) {
      const tmp = yoy
        .map((r) => ({ k: r.k, v: metricValue(r, baseMetric, null, null) }))
        .sort((a, b) => Number(b.v) - Number(a.v));
      tmp.forEach((x, i) => yoyRankMap.set(x.k, i + 1));
    }

    const items = enriched.slice(0, topN).map((r) => {
      const pr = r._prev;
      const yr = r._yoy;

      const momPct =
        timeframe === "month"
          ? pct(metricValue(r, baseMetric, null, null), pr ? metricValue(pr, baseMetric, null, null) : null)
          : null;

      const yoyPct =
        timeframe === "month"
          ? pct(metricValue(r, baseMetric, null, null), yr ? metricValue(yr, baseMetric, null, null) : null)
          : null;

      const prevRank = prevRankMap.get(r.k) ?? null;
      const yoyRank = yoyRankMap.get(r.k) ?? null;

      return {
        // location + key
        k: r.k,
        sido_name: r.sido_name,
        sigungu_name: r.sigungu_name,
        gu_name: r.gu_name,
        dong_name: r.dong_name,

        // complex + 대표 거래 1건
        apt_name: r.apt_name,
        latest_apt_dong: r.latest_apt_dong,
        latest_floor: r.latest_floor,
        latest_deal_date: r.latest_deal_date,
        latest_deal_amount_man: r.latest_deal_amount_man,
        latest_area_m2: r.latest_area_m2,
        build_year: r.build_year,
        dealing_gbn: r.dealing_gbn,
        rgst_date: r.rgst_date,

        // metrics (현재)
        tx_count: Number(r.tx_count),
        median_price: r.median_price === null ? null : Number(r.median_price),
        avg_price: r.avg_price === null ? null : Number(r.avg_price),
        median_price_per_m2: r.median_price_per_m2 === null ? null : Number(r.median_price_per_m2),
        avg_price_per_m2: r.avg_price_per_m2 === null ? null : Number(r.avg_price_per_m2),

        // ranking
        rank_no: r.rank_no,
        metric,
        metric_value: r._metric_value,

        // 변화(기본 metric 기준)
        prev_period: prevP,
        yoy_period: yoyP,
        mom_pct: momPct,
        yoy_pct: yoyPct,

        prev_rank_no: prevRank,
        rank_delta_mom: prevRank ? (prevRank - r.rank_no) : null, // +면 상승
        yoy_rank_no: yoyRank,
        rank_delta_yoy: yoyRank ? (yoyRank - r.rank_no) : null,
      };
    });

    res.status(200).json({
      timeframe,
      period,
      sido,
      sigungu,
      metric,
      order,
      top: topN,
      items,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e?.message || e) });
  }
}
