//pages/api/re/options.js
'use strict';

const { pool } = require('../../../lib/db');

function pickLang(req) {
  const q = (req.query && (req.query.lang || req.query.locale)) || '';
  const qs = String(q).toLowerCase();
  if (qs.startsWith('en')) return 'en';
  if (qs.startsWith('ko')) return 'ko';

  // fallback: accept-language
  const al = String(req.headers['accept-language'] || '').toLowerCase();
  return al.includes('en') ? 'en' : 'ko';
}

function sidoBilingual(code) {
  const map = {
    '11': { ko: '서울특별시', en: 'Seoul' },
    '28': { ko: '인천광역시', en: 'Incheon' },
    '41': { ko: '경기도',     en: 'Gyeonggi-do' },
  };
  const v = map[String(code)];
  if (!v) return { ko: String(code), en: String(code) };
  return v;
}

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    return;
  }

  const lang = pickLang(req);

  const need = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  for (const k of need) {
    if (!process.env[k]) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: `${k} is missing` }));
      return;
    }
  }

  try {    

    // 1) 시도 목록: 실제 데이터에 존재하는 시도만
    const [sidoRows] = await pool.execute(`
      SELECT DISTINCT LEFT(lawd_cd, 2) AS sido_code
      FROM re_trade_apt
      WHERE lawd_cd IS NOT NULL AND lawd_cd <> ''
      ORDER BY sido_code
    `);

    const allow = { '11': true, '28': true, '41': true };
    const codes = (sidoRows || [])
      .map(r => String(r.sido_code))
      .filter(c => allow[c]);

    // ✅ 통일된 shape: value / label_ko / label_en
    const sidos = [
      { value: 'all', label_ko: '전체', label_en: 'All' },
      ...codes.map((c) => {
        const bi = sidoBilingual(c);
        return { value: c, label_ko: bi.ko, label_en: bi.en };
      }),
    ];

    // 2) 기간(월/년)
    const [monthRows] = await pool.execute(`
      SELECT DISTINCT deal_ym
      FROM re_trade_apt
      WHERE deal_ym IS NOT NULL AND deal_ym <> ''
      ORDER BY deal_ym
    `);

    const months = (monthRows || []).map(r => String(r.deal_ym));
    const maxYm = months.length ? months[months.length - 1] : '';

    const yearSet = {};
    for (const ym of months) yearSet[ym.slice(0, 4)] = true;
    const years = Object.keys(yearSet).sort();

    // 2-1) build year 범위 (UI에서 년식 From~To 리스트로 사용)
    const [byRows] = await pool.execute(`
      SELECT
        MIN(build_year) AS min_y,
        MAX(build_year) AS max_y
      FROM re_trade_apt
      WHERE build_year IS NOT NULL
        AND build_year >= 1900
        AND build_year <= 2100
    `);
    const minY = byRows?.[0]?.min_y ? Number(byRows[0].min_y) : null;
    const maxY = byRows?.[0]?.max_y ? Number(byRows[0].max_y) : null;
    let buildYears = [];
    if (Number.isFinite(minY) && Number.isFinite(maxY) && minY <= maxY) {
      const lo = Math.max(1900, minY);
      const hi = Math.min(2100, maxY);
      // 너무 길어지는 것 방지(최대 180개)
      const capLo = Math.max(lo, hi - 179);
      buildYears = Array.from({ length: (hi - capLo + 1) }, (_, i) => String(capLo + i));
    }

    // 3) 시군구 목록(기본 fallback 용) - 여기서는 영문 표기가 없으니 en은 ko를 그대로
    const sigunguBySido = {};
    for (const c of codes) {
      const [gRows] = await pool.execute(
        `
        SELECT DISTINCT lawd_cd, sigungu_name
        FROM re_trade_apt
        WHERE LEFT(lawd_cd, 2) = ?
          AND sigungu_name IS NOT NULL AND sigungu_name <> ''
        ORDER BY sigungu_name, lawd_cd
        `,
        [c]
      );

      sigunguBySido[c] = [
        { value: 'all', label_ko: '전체', label_en: 'All' },
        ...(gRows || []).map(r => ({
          value: String(r.lawd_cd),
          label_ko: String(r.sigungu_name),
          label_en: String(r.sigungu_name), // 번역/로마자화는 프리미엄 단계에서
        })),
      ];
    }

    res.statusCode = 200;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      ok: true,
      lang, // 디버깅용 echo
      sidos,
      periods: {
        months,
        years,
        maxYm,
        minYm: months.length ? months[0] : '',
        maxY: years.length ? years[years.length - 1] : '',
        minY: years.length ? years[0] : '',
      },
      // UI 편의 옵션들
      topOptions: ['10','20','50','100','300','500'],
      buildYears: { min: minY, max: maxY, years: buildYears },
      priceMetricOptions: ['none','median_price','avg_price','latest_price','max_price','sum_price'],
      sigunguBySido,
    }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: e.message }));  
  }
}

module.exports = handler;
module.exports.default = handler;
