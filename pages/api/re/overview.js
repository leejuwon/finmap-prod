// pages/api/re/overview.js
// Premium-friendly summary for a given month/scope: diffusion + movers

const { dbQuery } = require("../../../lib/db");

function prevMonth(yyyymm) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const py = m === 1 ? y - 1 : y;
  const pm = m === 1 ? 12 : m - 1;
  return `${py}${String(pm).padStart(2, "0")}`;
}

const METRICS = new Set([
  "median_price_per_m2",
  "avg_price_per_m2",
  "median_price",
  "avg_price",
  "tx_count",
]);

function clampInt(x, lo, hi, defVal) {
  const n = Number(x);
  if (!Number.isFinite(n)) return defVal;
  return Math.min(hi, Math.max(lo, Math.trunc(n)));
}

export default async function handler(req, res) {
  try {
    const scope = String(req.query.scope || "11"); // 서울=11
    const ym = String(req.query.ym || "");
    const metric = String(req.query.metric || "median_price_per_m2");
    const limit = clampInt(req.query.limit, 1, 50, 10);

    if (!/^\d{6}$/.test(ym)) return res.status(400).json({ ok: false, error: "bad_ym" });
    if (!METRICS.has(metric)) return res.status(400).json({ ok: false, error: "bad_metric" });

    const prevYm = prevMonth(ym);
    const metricCol = metric; // safe because we validated against METRICS

    // 1) Diffusion summary (how broad is the move?)
    const diffSql = `
      WITH cur AS (
        SELECT lawd_cd, dong_name, tx_count, ${metricCol} AS v
        FROM re_stat_month_dong
        WHERE deal_ym = ? AND LEFT(lawd_cd, 2) = ?
      ),
      prev AS (
        SELECT lawd_cd, dong_name, tx_count AS prev_tx, ${metricCol} AS prev_v
        FROM re_stat_month_dong
        WHERE deal_ym = ? AND LEFT(lawd_cd, 2) = ?
      ),
      j AS (
        SELECT
          c.lawd_cd,
          c.dong_name,
          c.tx_count,
          c.v,
          p.prev_tx,
          p.prev_v,
          CASE
            WHEN p.prev_v IS NULL OR p.prev_v = 0 THEN NULL
            ELSE (c.v - p.prev_v) / p.prev_v * 100
          END AS mom_pct,
          CASE
            WHEN p.prev_tx IS NULL OR p.prev_tx = 0 THEN NULL
            ELSE (c.tx_count - p.prev_tx) / p.prev_tx * 100
          END AS tx_mom_pct
        FROM cur c
        LEFT JOIN prev p
          ON p.lawd_cd = c.lawd_cd AND (p.dong_name <=> c.dong_name)
        WHERE c.v IS NOT NULL
      )
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN prev_v IS NOT NULL THEN 1 ELSE 0 END) AS comparable,
        SUM(CASE WHEN prev_v IS NOT NULL AND v > prev_v THEN 1 ELSE 0 END) AS up,
        SUM(CASE WHEN prev_v IS NOT NULL AND v < prev_v THEN 1 ELSE 0 END) AS down,
        SUM(CASE WHEN prev_v IS NOT NULL AND v = prev_v THEN 1 ELSE 0 END) AS flat,
        AVG(mom_pct) AS avg_mom_pct,
        AVG(tx_mom_pct) AS avg_tx_mom_pct
      FROM j;
    `;

    const diffRows = await dbQuery(diffSql, [ym, scope, prevYm, scope]);
    const d0 = (diffRows && diffRows[0]) ? diffRows[0] : {};
    const total = Number(d0.total || 0);
    const comp = Number(d0.comparable || 0);
    const up = Number(d0.up || 0);
    const down = Number(d0.down || 0);
    const flat = Number(d0.flat || 0);
    const denom = (comp > 0 ? comp : 1);

    const diffusion = {
      total,
      comparable: comp,
      up,
      down,
      flat,
      up_ratio: comp > 0 ? up / denom : null,
      down_ratio: comp > 0 ? down / denom : null,
      flat_ratio: comp > 0 ? flat / denom : null,
      avg_mom_pct: d0.avg_mom_pct == null ? null : Number(d0.avg_mom_pct),
      avg_tx_mom_pct: d0.avg_tx_mom_pct == null ? null : Number(d0.avg_tx_mom_pct),
    };

    // 2) Movers (biggest MoM gainers/losers by metric)
    const moversSql = `
      WITH cur AS (
        SELECT lawd_cd, dong_name, tx_count, ${metricCol} AS v
        FROM re_stat_month_dong
        WHERE deal_ym = ? AND LEFT(lawd_cd, 2) = ?
      ),
      prev AS (
        SELECT lawd_cd, dong_name, tx_count AS prev_tx, ${metricCol} AS prev_v
        FROM re_stat_month_dong
        WHERE deal_ym = ? AND LEFT(lawd_cd, 2) = ?
      )
      SELECT
        c.lawd_cd,
        c.dong_name,
        d.sigungu_name,
        c.v AS value,
        p.prev_v AS prev_value,
        c.tx_count,
        p.prev_tx,
        CASE
          WHEN p.prev_v IS NULL OR p.prev_v = 0 THEN NULL
          ELSE (c.v - p.prev_v) / p.prev_v * 100
        END AS mom_pct
      FROM cur c
      LEFT JOIN prev p
        ON p.lawd_cd = c.lawd_cd AND (p.dong_name <=> c.dong_name)
      LEFT JOIN re_legal_dong d
        ON d.sido_code = ?
       AND CONCAT(d.sido_code, d.sigungu_code) = c.lawd_cd
       AND (d.dong_name <=> c.dong_name)
       AND d.is_exist = 1
      WHERE p.prev_v IS NOT NULL AND p.prev_v <> 0 AND c.v IS NOT NULL
      ORDER BY mom_pct DESC
      LIMIT ?;
    `;

    const gainers = await dbQuery(moversSql, [ym, scope, prevYm, scope, scope, limit]);

    const losersSql = moversSql.replace("ORDER BY mom_pct DESC", "ORDER BY mom_pct ASC");
    const losers = await dbQuery(losersSql, [ym, scope, prevYm, scope, scope, limit]);

    return res.status(200).json({
      ok: true,
      scope,
      ym,
      prevYm,
      metric,
      diffusion,
      movers: {
        gainers: (gainers || []).map((r) => ({
          lawdCd: r.lawd_cd,
          sigunguName: r.sigungu_name || "",
          dongName: r.dong_name,
          value: Number(r.value),
          prevValue: Number(r.prev_value),
          txCount: Number(r.tx_count),
          prevTxCount: r.prev_tx == null ? null : Number(r.prev_tx),
          momPct: r.mom_pct == null ? null : Number(r.mom_pct),
        })),
        losers: (losers || []).map((r) => ({
          lawdCd: r.lawd_cd,
          sigunguName: r.sigungu_name || "",
          dongName: r.dong_name,
          value: Number(r.value),
          prevValue: Number(r.prev_value),
          txCount: Number(r.tx_count),
          prevTxCount: r.prev_tx == null ? null : Number(r.prev_tx),
          momPct: r.mom_pct == null ? null : Number(r.mom_pct),
        })),
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || "overview_failed" });
  }
}
