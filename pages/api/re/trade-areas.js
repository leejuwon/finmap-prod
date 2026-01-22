// pages/api/re/trade-areas.js
'use strict';

import mysql from 'mysql2/promise';

let _pool;
function getPool() {
  if (_pool) return _pool;
  _pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    charset: 'utf8mb4',
  });
  return _pool;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    const sido = String(req.query.sido || '').trim(); // '11','28','41'
    const lang = String(req.query.lang || 'ko').startsWith('en') ? 'en' : 'ko';

    if (!/^\d{2}$/.test(sido)) {
      return res.status(400).json({ ok: false, error: 'sido is required (2 digits)' });
    }

    const pool = getPool();

    const sql = `
      SELECT
        t.lawd_cd,
        t.sigungu_name,
        NULLIF(TRIM(t.gu_name), '') AS gu_name
      FROM re_trade_apt t
      WHERE LEFT(t.lawd_cd, 2) = ?
        AND (t.cancel_yn IS NULL OR t.cancel_yn <> 'Y')
      GROUP BY
        t.lawd_cd, t.sigungu_name, NULLIF(TRIM(t.gu_name), '')
      ORDER BY
        t.sigungu_name ASC,
        gu_name ASC
    `;

    const [rows] = await pool.query(sql, [sido]);

    // 서울/인천: lawd_cd(구/군) 단위만
    if (sido !== '41') {
      const map = new Map(); // lawd_cd -> sigungu_name
      for (const r of rows) {
        if (!map.has(r.lawd_cd)) map.set(r.lawd_cd, r.sigungu_name);
      }
      const areas = Array.from(map.entries()).map(([code, name]) => ({
        value: String(code),
        label_ko: String(name),
        label_en: String(name),
      }));
      return res.json({ ok: true, areas, lang, sido });
    }

    // 경기도: 도시(lawd_cd) + 구(gu_name) 조합 옵션 생성
    const byCity = new Map(); // lawd_cd -> { name, guSet }
    for (const r of rows) {
      const code = String(r.lawd_cd);
      const cityName = String(r.sigungu_name || '');
      const gu = r.gu_name ? String(r.gu_name) : '';
      if (!byCity.has(code)) byCity.set(code, { name: cityName, guSet: new Set() });
      if (gu) byCity.get(code).guSet.add(gu);
    }

    const areas = [];
    const cityCodes = Array.from(byCity.keys()).sort((a, b) => {
      const an = byCity.get(a).name || '';
      const bn = byCity.get(b).name || '';
      return an.localeCompare(bn, 'ko');
    });

    for (const code of cityCodes) {
      const { name, guSet } = byCity.get(code);

      if (guSet.size === 0) {
        // 구가 없는 도시는 그냥 "도시명"만
        areas.push({
          value: code,
          label_ko: name,
          label_en: name,
        });
        continue;
      }

      // "도시 전체"
      areas.push({
        value: code,
        label_ko: `${name} 전체`,
        label_en: `${name} All`,
      });

      // "도시 구"
      const gus = Array.from(guSet).sort((a, b) => a.localeCompare(b, 'ko'));
      for (const gu of gus) {
        areas.push({
          value: `${code}|${gu}`,
          label_ko: `${name} ${gu}`,
          label_en: `${name} ${gu}`, // 영문 번역은 나중에 프리미엄화 때 처리해도 됨
        });
      }
    }

    return res.json({ ok: true, areas, lang, sido });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || 'Server Error' });
  }
}
