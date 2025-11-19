// pages/api/like.js
import { getDB } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'slug is required' });
  }

  const db = await getDB();

  try {
    if (method === 'GET') {
      const [rows] = await db.query(
        'SELECT likes FROM blog_post_likes WHERE slug = ?',
        [slug]
      );
      const likes = rows[0]?.likes || 0;
      return res.status(200).json({ likes });
    }

    if (method === 'POST') {
      // 단순 +1 (IP당 제한이나 로그인 검증은 나중에)
      await db.query(
        `
        INSERT INTO blog_post_likes (slug, likes)
        VALUES (?, 1)
        ON DUPLICATE KEY UPDATE likes = likes + 1
        `,
        [slug]
      );

      const [rows] = await db.query(
        'SELECT likes FROM blog_post_likes WHERE slug = ?',
        [slug]
      );
      const likes = rows[0]?.likes || 0;

      return res.status(200).json({ likes });
    }

    return res.status(405).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}
