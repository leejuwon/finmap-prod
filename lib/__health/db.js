import { getDB } from "../../../lib/db";

export default async function handler(req, res) {
  try {
    const db = await getDB();
    await db.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
