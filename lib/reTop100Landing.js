//lib/reTop100Landing.js
export function ymAdd(ym, deltaMonths) {
  const s = String(ym || "");
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6));
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return s;

  const base = y * 12 + (m - 1) + Number(deltaMonths || 0);
  const yy = Math.floor(base / 12);
  const mm = (base % 12) + 1;
  return `${yy}${String(mm).padStart(2, "0")}`;
}

/**
 * rangeKey:
 * - pm  : 전월(=latestYm 단일월) (default)
 * - m3  : 최근 3개월(전월 포함 3개월)
 * - m6  : 최근 6개월
 * - y1  : 최근 1년(12개월)
 * - ytd : YYYY년(1월~전월)  ← "연도"는 이것만 제공
 */
export function calcRangeFromLatestYm(latestYm, rangeKey) {
  const ly = String(latestYm || "");
  const year = ly.slice(0, 4);
  const key = String(rangeKey || "pm");

  if (key === "m3") {
    return { rangeKey: "m3", fromYm: ymAdd(ly, -2), toYm: ly, year, labelKo: "최근 3개월", labelEn: "Last 3 months" };
  }
  if (key === "m6") {
    return { rangeKey: "m6", fromYm: ymAdd(ly, -5), toYm: ly, year, labelKo: "최근 6개월", labelEn: "Last 6 months" };
  }
  if (key === "y1") {
    return { rangeKey: "y1", fromYm: ymAdd(ly, -11), toYm: ly, year, labelKo: "최근 1년", labelEn: "Last 12 months" };
  }
  if (key === "ytd") {
    return { rangeKey: "ytd", fromYm: `${year}01`, toYm: ly, year, labelKo: `${year}년`, labelEn: `${year} (YTD)` };
  }
  return { rangeKey: "pm", fromYm: ly, toYm: ly, year, labelKo: "전월", labelEn: "Prev month" };
}

/**
 * stats_m 집계(기간범위) Top100
 * - tx_count: 기간 합계
 * - median_price/avg_price: (월 값 * 월 tx) 가중평균 (근사)
 * - max_price: 기간 최대
 * - sum_price: 기간 합계
 * - latest_deal_date/latest_deal_amount_man: "선택 기간 내" 가장 최근 거래월(last_ym)의 값 (검색의도: 최근거래)
 *
 * regionWhereSql 예)
 * - "s.sido_code = ?"              params: ["11"]
 * - "s.lawd_cd = ?"                params: ["11680"]
 * - "s.lawd_cd IN (?,?,?)"         params: ["11440","11170","11200"]
 */
export async function fetchTop100Rows({
  pool,
  latestYm,
  fromYm,
  toYm,
  band,
  regionWhereSql,
  regionParams = [],
  limit = 100,
}) {
  if (!pool) throw new Error("pool is required");
  const ly = String(latestYm || "").trim();
  const from = String(fromYm || "").trim();
  const to = String(toYm || "").trim();
  const pyeongBand = String(band || "all").trim() || "all";
  // regionWhereSql은 기본 alias s 를 쓰는 형태를 가정
  const regionWhereSql1 = String(regionWhereSql || "").replace(/\bs\./g, "s1.");
 

  const sql = `
    SELECT
      a.apt_key,
      a.sigungu_name,
      a.apt_name,
      a.tx_count,
      a.median_price,
      a.avg_price,
      a.max_price,
      a.sum_price,
      ld.latest_deal_date,
      ld.latest_deal_amount_man,
      a.build_year
    FROM (
      SELECT
        s.apt_key,
        MAX(s.sigungu_name) AS sigungu_name,
        MAX(s.apt_name) AS apt_name,
        SUM(s.tx_count) AS tx_count,

        /* 가중평균(근사): 월 대표값 * 월 거래량 */
        CASE
          WHEN SUM(s.tx_count) > 0 THEN
            ROUND(SUM(CAST(s.median_price AS DECIMAL(20,0)) * CAST(s.tx_count AS DECIMAL(20,0))) / SUM(s.tx_count))
          ELSE NULL
        END AS median_price,

        CASE
          WHEN SUM(s.tx_count) > 0 THEN
            ROUND(SUM(CAST(s.avg_price AS DECIMAL(20,0)) * CAST(s.tx_count AS DECIMAL(20,0))) / SUM(s.tx_count))
          ELSE NULL
        END AS avg_price,

        MAX(s.max_price) AS max_price,
        SUM(CAST(s.sum_price AS DECIMAL(20,0))) AS sum_price,
        MAX(s.build_year) AS build_year
      FROM re_trade_apt_stats_m s
      WHERE s.deal_ym BETWEEN ? AND ?
        AND s.pyeong_band = ?
        AND (${regionWhereSql})
        AND s.median_price IS NOT NULL
      GROUP BY s.apt_key
    ) a
    /* ✅ 선택 기간 내에서 "거래가 있었던" 가장 최근 월(last_ym)의 최근거래 정보를 붙임 */
    LEFT JOIN (
      SELECT
        s2.apt_key,
        s2.latest_deal_date,
        s2.latest_deal_amount_man
      FROM re_trade_apt_stats_m s2
      INNER JOIN (
        SELECT
          s1.apt_key,
          MAX(s1.deal_ym) AS last_ym
        FROM re_trade_apt_stats_m s1
        WHERE s1.deal_ym BETWEEN ? AND ?
          AND s1.pyeong_band = ?
          AND (${regionWhereSql1})
          AND s1.tx_count > 0
        GROUP BY s1.apt_key
      ) m
        ON m.apt_key = s2.apt_key
       AND m.last_ym = s2.deal_ym
      WHERE s2.pyeong_band = ?
    ) ld
      ON ld.apt_key = a.apt_key
    ORDER BY a.median_price DESC, a.tx_count DESC
    LIMIT ?
  `;

  const params = [
    // a 서브쿼리
    from, to, pyeongBand, ...regionParams,
    // last_ym 서브쿼리
    from, to, pyeongBand, ...regionParams,
    // s2 band
    pyeongBand,
    Number(limit),
  ];
  const [rows] = await pool.query(sql, params);
  return rows || [];
}