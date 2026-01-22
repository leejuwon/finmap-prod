// pages/api/re/top-dong.js
import { dbQuery } from "../../../lib/db";

function ymMinus(ym, months) {
  const y = Number(ym.slice(0, 4));
  const m = Number(ym.slice(4, 6));
  const d = new Date(Date.UTC(y, m - 1, 1));
  d.setUTCMonth(d.getUTCMonth() - months);
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}${mm}`;
}

const METRICS = new Set([
  "median_price_per_m2",
  "avg_price_per_m2",
  "median_price",
  "avg_price",
  "tx_count",
]);

export default async function handler(req, res) {
  try {
    const scope = String(req.query.scope || "11"); // 서울=11
    const ym = String(req.query.ym || "");
    const metric = String(req.query.metric || "median_price_per_m2");
    const limit = Math.min(Number(req.query.limit || 100), 200);

    if (!/^\d{6}$/.test(ym)) return res.status(400).json({ error: "bad_ym" });
    if (!METRICS.has(metric)) return res.status(400).json({ error: "bad_metric" });

    const prevYm = ymMinus(ym, 1);
    const yoyYm = ymMinus(ym, 12);

    const sql = `
      WITH curr AS (
        SELECT rank_no, lawd_cd, dong_name, value
        FROM re_rank_month_dong
        WHERE scope_sido_code = ? AND deal_ym = ? AND metric = ?
        ORDER BY rank_no ASC
        LIMIT ?
      ),
      prev AS (
        SELECT lawd_cd, dong_name, rank_no AS prev_rank, value AS prev_value
        FROM re_rank_month_dong
        WHERE scope_sido_code = ? AND deal_ym = ? AND metric = ?
      ),
      yoy AS (
        SELECT lawd_cd, dong_name, rank_no AS yoy_rank, value AS yoy_value
        FROM re_rank_month_dong
        WHERE scope_sido_code = ? AND deal_ym = ? AND metric = ?
      )
      SELECT
        c.rank_no,
        c.lawd_cd,
        c.dong_name,
        c.value,
        p.prev_rank,
        p.prev_value,
        y.yoy_rank,
        y.yoy_value,
        d.sigungu_name
      FROM curr c
      LEFT JOIN prev p
        ON p.lawd_cd = c.lawd_cd AND p.dong_name = c.dong_name
      LEFT JOIN yoy y
        ON y.lawd_cd = c.lawd_cd AND y.dong_name = c.dong_name
      LEFT JOIN re_legal_dong d
        ON d.sido_code = ?
       AND CONCAT(d.sido_code, d.sigungu_code) = c.lawd_cd
       AND (d.dong_name <=> c.dong_name)
       AND d.is_exist = 1
      ORDER BY c.rank_no ASC
    `;

    const rows = await dbQuery(sql, [
      scope, ym, metric, limit,
      scope, prevYm, metric,
      scope, yoyYm, metric,
      scope,
    ]);

    const items = rows.map((r) => {
      const momPct =
        r.prev_value != null && Number(r.prev_value) !== 0
          ? ((Number(r.value) - Number(r.prev_value)) / Number(r.prev_value)) * 100
          : null;

      const yoyPct =
        r.yoy_value != null && Number(r.yoy_value) !== 0
          ? ((Number(r.value) - Number(r.yoy_value)) / Number(r.yoy_value)) * 100
          : null;

      const momRankDelta =
        r.prev_rank != null ? Number(r.prev_rank) - Number(r.rank_no) : null; // +면 상승
      const yoyRankDelta =
        r.yoy_rank != null ? Number(r.yoy_rank) - Number(r.rank_no) : null;

      // 간단 “열기 배지” 룰(초기)
      let heat = "Neutral";
      if (momPct != null && momPct > 1 && momRankDelta != null && momRankDelta > 0) heat = "Hot";
      else if (momPct != null && momPct < -1) heat = "Cool";

      return {
        rank: Number(r.rank_no),
        lawdCd: r.lawd_cd,
        sigunguName: r.sigungu_name || "",
        dongName: r.dong_name,
        value: Number(r.value),
        momPct,
        yoyPct,
        momRankDelta,
        yoyRankDelta,
        heat,
      };
    });

    res.status(200).json({
      scope,
      ym,
      metric,
      prevYm,
      yoyYm,
      count: items.length,
      items,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "top_failed" });
  }
}
