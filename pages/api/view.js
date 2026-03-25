// pages/api/view.js
import { getDB } from '../../lib/db';

function normalizeLang(raw) {
  return raw === 'en' ? 'en' : 'ko';
}

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;
  const lang = normalizeLang(req.query.lang);

  if (!slug) {
    return res.status(400).json({ error: 'slug is required' });
  }

  const db = await getDB();

  try {
    if (method === 'GET') {
      const [rows] = await db.query(
        'SELECT views FROM blog_post_views WHERE slug = ? AND lang = ?',
        [slug, lang]
      );
      const views = rows[0]?.views || 0;
      return res.status(200).json({ views, lang });
    }

    if (method === 'POST') {
      await db.query(
        `
        INSERT INTO blog_post_views (slug, lang, views)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE views = views + 1
        `,
        [slug, lang]
      );

      const [rows] = await db.query(
        'SELECT views FROM blog_post_views WHERE slug = ? AND lang = ?',
        [slug, lang]
      );
      const views = rows[0]?.views || 0;

      return res.status(200).json({ views, lang });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}
