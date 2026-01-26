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

// ---- 간단 TTL 캐시 (serverless/pm2 모두에서 “가능한 만큼” 이득) ----
const _cache = globalThis.__re_trade_areas_cache || (globalThis.__re_trade_areas_cache = new Map());
function cacheGet(key) {
  const v = _cache.get(key);
  if (!v) return null;
  if (Date.now() > v.exp) {
    _cache.delete(key);
    return null;
  }
  return v.data;
}
function cacheSet(key, data, ttlMs) {
 _toggleCacheSize();
  _cache.set(key, { exp: Date.now() + ttlMs, data });
}
function _toggleCacheSize(max = 200) {
  if (_cache.size <= max) return;
  // 오래된 것부터 제거(간단)
  const keys = Array.from(_cache.keys());
  for (let i = 0; i < Math.floor(max / 3); i++) _cache.delete(keys[i]);
}

// sido(2자리) -> lawd_cd(5자리) range
function sidoToLawdRange(sido2) {
  const n = Number(sido2);
  if (!Number.isFinite(n)) return null;
  const start = `${sido2}000`; // '11' -> '11000'
  const end = `${String(n + 1).padStart(2, '0')}000`; // '11' -> '12000'
  return { start, end };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    const sido = String(req.query.sido || '').trim(); // '11','28','41'
    const lang = String(req.query.lang || 'ko').startsWith('en') ? 'en' : 'ko';

    if (!/^\d{2}$/.test(sido)) {
      return res.status(400).json({ ok: false, error: 'sido is required (2 digits)' });
    }

    // HTTP 캐시 (프록시/브라우저)
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');

    const cacheKey = `sido=${sido}|lang=${lang}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const range = sidoToLawdRange(sido);
    if (!range) return res.status(400).json({ ok: false, error: 'invalid sido' });

    const pool = getPool();

    // ✅ 함수 없는 쿼리: LEFT/TRIM/NULLIF 제거
    // - lawd_cd range로 필터링 (인덱스 잘 탐)
    // - group by는 raw 값 기준, 정규화는 JS에서 처리
    const sql = `
      SELECT
        t.lawd_cd,
        t.sigungu_name,
        t.gu_name
      FROM re_trade_apt t
      WHERE t.lawd_cd >= ?
        AND t.lawd_cd < ?
        AND (t.cancel_yn IS NULL OR t.cancel_yn <> 'Y')
      GROUP BY
        t.lawd_cd, t.sigungu_name, t.gu_name
      ORDER BY
        t.sigungu_name ASC,
        t.gu_name ASC
    `;

    const [rows] = await pool.query(sql, [range.start, range.end]);

    // 서울/인천: lawd_cd(구/군) 단위만
    if (sido !== '41') {
      const map = new Map(); // lawd_cd -> sigungu_name
      for (const r of rows) {
        const code = String(r.lawd_cd || '');
        const name = String(r.sigungu_name || '');
        if (!code || !name) continue;
        if (!map.has(code)) map.set(code, name);
      }
      const areas = Array.from(map.entries()).map(([code, name]) => ({
        value: String(code),
        label_ko: String(name),
        label_en: String(name),
      }));

      const out = { ok: true, areas, lang, sido };
      cacheSet(cacheKey, out, 60 * 60 * 1000); // 1h
      return res.json(out);
    }

    // 경기도: 도시(lawd_cd) + 구(gu_name) 조합 옵션 생성
    // - 구 정규화는 JS에서 trim + empty->null
    const byCity = new Map(); // lawd_cd -> { name, guSet }
    for (const r of rows) {
      const code = String(r.lawd_cd || '');
      const cityName = String(r.sigungu_name || '');
      const guNorm = (r.gu_name == null ? '' : String(r.gu_name)).trim(); // ✅ TRIM은 JS에서
      if (!code || !cityName) continue;

      if (!byCity.has(code)) byCity.set(code, { name: cityName, guSet: new Set() });
      if (guNorm) byCity.get(code).guSet.add(guNorm);
    }

    const areas = [];
    const cityCodes = Array.from(byCity.keys()).sort((a, b) => {
      const an = byCity.get(a).name || '';
      const bn = byCity.get(b).name || '';
      return an.localeCompare(bn, 'ko');
    });

    for (const code of cityCodes) {
      const { name, guSet } = byCity.get(code);

      // ✅ 항상 "도시 전체" 1개는 넣는다 (구가 없는 도시도 '전체'로 표시 요구 반영)
      areas.push({
        value: code, // city code
        label_ko: `${name} 전체`,
        label_en: `${name} All`,
      });

      if (guSet.size === 0) continue;

      const gus = Array.from(guSet).sort((a, b) => a.localeCompare(b, 'ko'));
      for (const gu of gus) {
        areas.push({
          value: `${code}|${gu}`,
          label_ko: `${name} ${gu}`,
          label_en: `${name} ${gu}`,
        });
      }
    }

    const out = { ok: true, areas, lang, sido };
    cacheSet(cacheKey, out, 60 * 60 * 1000); // 1h
    return res.json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || 'Server Error' });
  }
}
