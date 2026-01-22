// pages/api/re/meta.js
import { dbQuery } from "../../../lib/db";

export default async function handler(req, res) {
  try {
    const scope = String(req.query.scope || "11"); // 11=서울
    const rows = await dbQuery(
      `SELECT MAX(deal_ym) AS max_ym
       FROM re_rank_month_dong
       WHERE scope_sido_code = ?`,
      [scope]
    );
    res.status(200).json({ scope, maxYm: rows?.[0]?.max_ym || null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "meta_failed" });
  }
}
