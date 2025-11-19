// pages/api/comments.js
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
        `
        SELECT id, nickname, content, created_at
        FROM blog_post_comments
        WHERE slug = ?
        ORDER BY id DESC
        `,
        [slug]
      );
      return res.status(200).json({ comments: rows });
    }

    if (method === 'POST') {
      const { nickname, password, content } = req.body || {};

      if (!nickname || !password || !content) {
        return res.status(400).json({ error: 'invalid body' });
      }

      await db.query(
        `
        INSERT INTO blog_post_comments (slug, nickname, password, content)
        VALUES (?, ?, ?, ?)
        `,
        [slug, nickname, password, content]
      );

      return res.status(201).json({ ok: true });
    }

    // 삭제/수정 API는 나중에 확장
    return res.status(405).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}
