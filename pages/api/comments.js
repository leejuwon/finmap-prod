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

    // 🔧 댓글 수정 (PUT)
    if (method === 'PUT') {
      const { id, password, content } = req.body || {};

      if (!id || !password || !content) {
        return res.status(400).json({ error: 'id, password, content required' });
      }

      // 저장된 비밀번호 조회
      const [rows] = await db.query(
        `
        SELECT password
        FROM blog_post_comments
        WHERE id = ? AND slug = ?
        `,
        [id, slug]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'comment not found' });
      }

      const savedPw = rows[0].password;
      if (savedPw !== password) {
        return res.status(403).json({ error: 'invalid password' });
      }

      // 내용만 업데이트 (updated_at 컬럼이 있다면 SET updated_at = NOW() 추가해도 됨)
      await db.query(
        `
        UPDATE blog_post_comments
        SET content = ?
        WHERE id = ?
        `,
        [content, id]
      );

      return res.status(200).json({ ok: true });
    }

    // 🗑 댓글 삭제 (DELETE)
    if (method === 'DELETE') {
      const { id, password } = req.body || {};

      if (!id || !password) {
        return res.status(400).json({ error: 'id, password required' });
      }

      const [rows] = await db.query(
        `
        SELECT password
        FROM blog_post_comments
        WHERE id = ? AND slug = ?
        `,
        [id, slug]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'comment not found' });
      }

      const savedPw = rows[0].password;
      if (savedPw !== password) {
        return res.status(403).json({ error: 'invalid password' });
      }

      await db.query(
        `
        DELETE FROM blog_post_comments
        WHERE id = ?
        `,
        [id]
      );

      return res.status(200).json({ ok: true });
    }

    // 그 외 메서드는 허용 안 함
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}
