// pages/api/re/trade-areas.js
'use strict';

const { pool: dbPool } = require('../../../lib/db');

// TTL 캐시
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
  if (_cache.size > 200) {
    const keys = Array.from(_cache.keys());
    for (let i = 0; i < 70; i++) _cache.delete(keys[i]);
  }
  _cache.set(key, { exp: Date.now() + ttlMs, data });
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    const sido = String(req.query.sido || '').trim(); // '11','28','41'
    const lang = String(req.query.lang || 'ko').startsWith('en') ? 'en' : 'ko';

    if (!/^\d{2}$/.test(sido)) {
      return res.status(400).json({ ok: false, error: 'sido is required (2 digits)' });
    }

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');

    const cacheKey = `sido=${sido}|lang=${lang}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const pool = dbPool;

    const [rows] = await pool.query(
      `
      SELECT sido_code, lawd_cd, sigungu_name, gu_name
      FROM re_trade_area_dim
      WHERE sido_code = ?
      ORDER BY sigungu_name ASC, gu_name ASC
      `,
      [sido]
    );

    // 서울/인천: lawd_cd 단위만
    if (sido !== '41') {
      const map = new Map();
      for (const r of rows) {
        const code = String(r.lawd_cd || '');
        const name = String(r.sigungu_name || '');
        if (!code || !name) continue;
        if (!map.has(code)) map.set(code, name);
      }
      const areas = Array.from(map.entries()).map(([code, name]) => ({
        value: code,
        label_ko: name,
        label_en: name,
      }));
      const out = { ok: true, areas, lang, sido };
      cacheSet(cacheKey, out, 60 * 60 * 1000);
      return res.json(out);
    }

    // 경기도: city(all) + gu
    const byCity = new Map(); // lawd_cd -> { name, guSet }
    for (const r of rows) {
      const code = String(r.lawd_cd || '');
      const cityName = String(r.sigungu_name || '');
      const gu = String(r.gu_name || '').trim(); // '' = 전체
      if (!code || !cityName) continue;

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

      areas.push({
        value: code,
        label_ko: `${name} 전체`,
        label_en: `${name} All`,
      });

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
    cacheSet(cacheKey, out, 60 * 60 * 1000);
    return res.json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || 'Server Error' });
  }
}
