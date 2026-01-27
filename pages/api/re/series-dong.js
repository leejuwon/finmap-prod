// pages/api/re/series-dong.js
const { dbQuery } = require("../../../lib/db");

const COLS = new Set([
  "tx_count",
  "median_price_per_m2",
  "avg_price_per_m2",
  "median_price",
  "avg_price",
]);

export default async function handler(req, res) {
  try {
    const lawdCd = String(req.query.lawdCd || "");
    const dongName = String(req.query.dongName || "");
    const metric = String(req.query.metric || "median_price_per_m2");
    const fromYm = String(req.query.fromYm || "200001");
    const toYm = String(req.query.toYm || "209912");

    if (!/^\d{5}$/.test(lawdCd)) return res.status(400).json({ error: "bad_lawdCd" });
    if (!COLS.has(metric)) return res.status(400).json({ error: "bad_metric" });
    if (!/^\d{6}$/.test(fromYm) || !/^\d{6}$/.test(toYm))
      return res.status(400).json({ error: "bad_ym" });

    const sql = `
      SELECT deal_ym, tx_count, median_price_per_m2, avg_price_per_m2, median_price, avg_price
      FROM re_stat_month_dong
      WHERE lawd_cd = ?
        AND dong_name = ?
        AND deal_ym BETWEEN ? AND ?
      ORDER BY deal_ym ASC
    `;

    const rows = await dbQuery(sql, [lawdCd, dongName, fromYm, toYm]);

    const points = rows.map((r) => ({
      ym: r.deal_ym,
      value: r[metric] != null ? Number(r[metric]) : null,
      txCount: r.tx_count != null ? Number(r.tx_count) : null,
      medianPricePerM2: r.median_price_per_m2 != null ? Number(r.median_price_per_m2) : null,
      avgPricePerM2: r.avg_price_per_m2 != null ? Number(r.avg_price_per_m2) : null,
      medianPrice: r.median_price != null ? Number(r.median_price) : null,
      avgPrice: r.avg_price != null ? Number(r.avg_price) : null,
    }));

    res.status(200).json({ lawdCd, dongName, metric, fromYm, toYm, points });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "series_failed" });
  }
}
