// pages/api/comments.js
import { getDB } from '../../lib/db';
import bcrypt from 'bcryptjs';

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
    // 📌 댓글 목록 조회 (언어별 분리)
    if (method === 'GET') {
      const [rows] = await db.query(
        `
        SELECT id, nickname, content, created_at
        FROM blog_post_comments
        WHERE slug = ? AND lang = ?
        ORDER BY id DESC
        `,
        [slug, lang]
      );
      return res.status(200).json({ comments: rows, lang });
    }

    // 📌 댓글 등록 (비밀번호 해시 저장, 언어별 분리)
    if (method === 'POST') {
      const { nickname, password, content } = req.body || {};

      if (!nickname || !password || !content) {
        return res.status(400).json({ error: 'invalid body' });
      }

      const hash = await bcrypt.hash(password, 10);

      await db.query(
        `
        INSERT INTO blog_post_comments (slug, lang, nickname, password, content)
        VALUES (?, ?, ?, ?, ?)
        `,
        [slug, lang, nickname, hash, content]
      );

      return res.status(201).json({ ok: true, lang });
    }

    // 📌 댓글 수정 (PUT) – 비밀번호 검증 후 내용 수정
    if (method === 'PUT') {
      const { id, password, content } = req.body || {};

      if (!id || !password || !content) {
        return res
          .status(400)
          .json({ error: 'id, password, content required' });
      }

      const [rows] = await db.query(
        `
        SELECT password
        FROM blog_post_comments
        WHERE id = ? AND slug = ? AND lang = ?
        `,
        [id, slug, lang]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'comment not found' });
      }

      const savedHash = rows[0].password;
      const match = await bcrypt.compare(password, savedHash);
      if (!match) {
        return res.status(403).json({ error: 'invalid password' });
      }

      await db.query(
        `
        UPDATE blog_post_comments
        SET content = ?
        WHERE id = ? AND slug = ? AND lang = ?
        `,
        [content, id, slug, lang]
      );

      return res.status(200).json({ ok: true, lang });
    }

    // 📌 댓글 삭제 (DELETE) – 비밀번호 검증 후 삭제
    if (method === 'DELETE') {
      const { id, password } = req.body || {};

      if (!id || !password) {
        return res.status(400).json({ error: 'id, password required' });
      }

      const [rows] = await db.query(
        `
        SELECT password
        FROM blog_post_comments
        WHERE id = ? AND slug = ? AND lang = ?
        `,
        [id, slug, lang]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'comment not found' });
      }

      const savedHash = rows[0].password;
      const match = await bcrypt.compare(password, savedHash);
      if (!match) {
        return res.status(403).json({ error: 'invalid password' });
      }

      await db.query(
        `
        DELETE FROM blog_post_comments
        WHERE id = ? AND slug = ? AND lang = ?
        `,
        [id, slug, lang]
      );

      return res.status(200).json({ ok: true, lang });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}
