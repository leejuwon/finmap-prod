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

async function loadDealMonths() {
  try {
    const [rows] = await pool.execute(`
      SELECT deal_ym
      FROM re_trade_deal_ym
      WHERE deal_ym IS NOT NULL AND deal_ym <> ''
      ORDER BY deal_ym
    `);
    const months = (rows || []).map(r => String(r.deal_ym)).filter(Boolean);
    if (months.length) return months;
  } catch (e) {
    // Auxiliary table may be absent in a local/dev DB; fall back to the source table.
  }

  const [rows] = await pool.execute(`
    SELECT DISTINCT deal_ym
    FROM re_trade_apt
    WHERE deal_ym IS NOT NULL AND deal_ym <> ''
    ORDER BY deal_ym
  `);
  return (rows || []).map(r => String(r.deal_ym)).filter(Boolean);
}

function buildYearRange() {
  const currentYear = new Date().getFullYear();
  const minY = 1900;
  const maxY = Math.min(2100, currentYear + 1);
  const years = Array.from({ length: (maxY - minY + 1) }, (_, i) => String(minY + i));
  return { min: minY, max: maxY, years };
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

    // 1) 시도 목록: 초기 옵션 API는 원천 거래 테이블 DISTINCT를 피하고 고정 목록을 반환
    const codes = ['11', '28', '41'];

    // ✅ 통일된 shape: value / label_ko / label_en
    const sidos = [
      { value: 'all', label_ko: '전체', label_en: 'All' },
      ...codes.map((c) => {
        const bi = sidoBilingual(c);
        return { value: c, label_ko: bi.ko, label_en: bi.en };
      }),
    ];

    // 2) 기간(월/년): 보조 기간 테이블을 우선 사용
    const months = await loadDealMonths();
    const maxYm = months.length ? months[months.length - 1] : '';

    const yearSet = {};
    for (const ym of months) yearSet[ym.slice(0, 4)] = true;
    const years = Object.keys(yearSet).sort();

    const buildYears = buildYearRange();

    res.statusCode = 200;
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');
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
      buildYears,
      priceMetricOptions: ['none','median_price','avg_price','latest_price','max_price','sum_price'],
    }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: e.message }));  
  }
}

module.exports = handler;
module.exports.default = handler;
