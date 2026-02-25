// pages/market/real-estate/magok-top100.js
import RealEstateTop100Landing from "../../../_components/RealEstateTop100Landing";
import { jsonSafe } from "../../../lib/jsonSafe";

const REGION = {
  slug: "magok-top100",
  lawd: "11500", // 서울 강서구
  dongName: "마곡동",
  nameKo: "마곡(강서구 마곡동)",
  nameEn: "Magok (Magok-dong, Gangseo-gu)",
  detailSido: "11",
};

const TEXT = {
  ko: {
    title: "마곡 아파트 집값 TOP 100 | 강서구 마곡동 실거래 순위",
    desc:
      "마곡(강서구 마곡동) 아파트 실거래 집계 데이터를 기반으로, 대표가격(중앙값) 기준 TOP 100 순위를 제공합니다. 최신 거래월 기준으로 확인하세요.",
    h1: "마곡 아파트 집값 TOP 100",
    sub: "강서구 마곡동 · 실거래 기반 · 대표가격(중앙값) 기준",
    bullets: [
      "‘마곡 아파트 집값/순위’ 검색 의도에 맞춘 고정 URL 랜딩페이지입니다.",
      "행정구역은 강서구(11500)이며, 동 기준으로 ‘마곡동’만 포함합니다.",
      "순위는 ‘대표가격(중앙값, 총액)’ 내림차순입니다(극단값 영향↓).",
      "거래량(표본수)이 적은 단지는 값이 튈 수 있으니 거래량도 함께 확인하세요.",
      "평형/년식/금액구간을 고정하면 비교가 더 공정해집니다(대시보드에서 확장).",
    ],
    updated: "업데이트 기준",
    tableTitle: "TOP 100 (대표가격·중앙값 기준)",
    cols: {
      rank: "#",
      sigungu: "시군구",
      apt: "단지",
      latestDeal: "최근 거래",
      latestDate: "최근 계약일",
      median: "대표가격(중앙값)",
      tx: "거래량",
      build: "년식",
    },
    ctaTitle: "필터를 더 조정하고 싶다면?",
    ctaDesc:
      "대시보드에서 평형/년식/금액구간/정렬을 더 세밀하게 조정할 수 있어요.",
    ctaBtn: "대시보드로 이동",
    faqTitle: "자주 묻는 질문",
    faqs: [
      {
        q: "이 페이지의 ‘마곡’ 범위는 어디예요?",
        a: "강서구(11500) 내 ‘마곡동’만 포함합니다. (행정동/법정동 표기 차이가 있을 수 있지만, DB의 동명(dong_name) 기준으로 필터링합니다.)",
      },
      {
        q: "순위 기준은 무엇인가요?",
        a: "대표가격(중앙값, 총액) 내림차순입니다. 중앙값은 평균보다 극단값 영향을 덜 받는 편입니다.",
      },
      {
        q: "거래량이 적으면 왜 주의해야 하나요?",
        a: "표본이 적으면 특정 거래 1~2건에 의해 대표값이 흔들릴 수 있습니다. 거래량을 함께 보고 해석하는 게 안전합니다.",
      },
      {
        q: "평형/년식/금액구간을 걸고 보고 싶어요.",
        a: "대시보드로 이동해서 평형/년식/금액구간/정렬을 추가로 설정할 수 있습니다.",
      },
    ],
  },
  en: {
    title: "Magok Apartment Prices Top 100 | Magok-dong (Gangseo-gu) Ranking",
    desc:
      "Top apartment complexes in Magok-dong (Gangseo-gu) ranked by median total sale price from official transaction data.",
    h1: "Magok Apartment Prices Top 100",
    sub: "Magok-dong, Gangseo-gu · Ranked by median total sale price",
    bullets: [
      "A fixed-URL landing page for the query “Magok apartment price ranking.”",
      "Scope: Magok-dong within Gangseo-gu (11500).",
      "Ranking metric: median total sale price (more robust than average).",
      "Use transaction count to avoid small-sample noise.",
      "For deeper filters (size/build-year/price range), use the dashboard.",
    ],
    updated: "Last updated month",
    tableTitle: "Top 100 (Ranked by median total price)",
    cols: {
      rank: "#",
      sigungu: "District",
      apt: "Complex",
      latestDeal: "Latest deal",
      latestDate: "Latest contract date",
      median: "Median price",
      tx: "Tx count",
      build: "Build year",
    },
    ctaTitle: "Want more filters?",
    ctaDesc: "Use the dashboard to filter by size/build year/price range and more.",
    ctaBtn: "Open dashboard",
    faqTitle: "FAQ",
    faqs: [
      { q: "What is the scope?", a: "Magok-dong within Gangseo-gu (11500), filtered by dong_name." },
      { q: "What is the ranking metric?", a: "Median total sale price (descending)." },
      { q: "Why does transaction count matter?", a: "Small samples can be noisy; interpret ranks with tx count." },
      { q: "How do I apply filters?", a: "Open the dashboard and use size/build-year/price-range controls." },
    ],
  },
};

const SEO = {
  image:
    "https://res.cloudinary.com/dwonflmnn/image/upload/v1769749571/blog/insight/apt-dashboard-home-goal-roadmap-kr-img1.png",
  about: { "@type": "Place", name: "Seoul, South Korea" },
  keywordsKo: "마곡 아파트 집값, 마곡동 아파트값 순위, 강서구 아파트 실거래, Top100",
  keywordsEn: "Magok apartment prices, Magok-dong ranking, Seoul real estate ranking, top 100",
};

const RELATED = [
  { href: '/market/real-estate/mayongseong-top100',    labelEn: 'Mayongseong Top 100',     labelKo: '마용성 Top100' },
  { href: '/market/real-estate/gangnam-top100',        labelEn: 'Gangnam Top 100',         labelKo: '강남 Top100' },
  { href: '/market/real-estate/songpa-top100',         labelEn: 'Songpa Top 100',          labelKo: '송파(잠실) Top100' },
  { href: '/market/real-estate/magok-top100',          labelEn: 'Magok Top 100',           labelKo: '마곡 Top100' },
  { href: '/market/real-estate/gangnam3-top100',       labelEn: 'Gangnam 3Gu Top 100',     labelKo: '강남3구 Top100' },    
  { href: '/market/real-estate/songpa-gangnam-top100', labelEn: 'Songpa-Gangnam Top 100',  labelKo: '송파(잠실)+강남구 Top100' },    
  { href: '/market/real-estate/seoul-top100',          labelEn: 'Seoul Top 100',           labelKo: '서울 Top100' },
];

// ---- lightweight TTL cache (SSR) ----
const _cache = globalThis.__re_landing_cache || (globalThis.__re_landing_cache = new Map());
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
    for (let i = 0; i < 50; i++) _cache.delete(keys[i]);
  }
  _cache.set(key, { exp: Date.now() + ttlMs, data });
}

export default function MagokTop100Page({ period, band, rows }) {
  return (
    <RealEstateTop100Landing
      region={REGION}
      text={TEXT}
      seo={SEO}
      relatedLinks={RELATED}
      period={period}
      band={band}
      rows={rows}
    />
  );
}

export async function getServerSideProps(ctx) {
  const { res, locale, query } = ctx;
  const lang = String(locale || "ko").startsWith("en") ? "en" : "ko";
  const nocache = String(query.nocache || "0") === "1";
  const band = String(query.band || "all").trim() || "all";

  res.setHeader(
    "Cache-Control",
    nocache ? "no-store" : "public, s-maxage=300, stale-while-revalidate=86400"
  );

  const cacheKey = JSON.stringify({ page: REGION.slug, band, lang });
  if (!nocache) {
    const cached = cacheGet(cacheKey);
    if (cached) return { props: cached };
  }

  const { pool } = require("../../../lib/db");

  const [pRows] = await pool.query(`SELECT MAX(deal_ym) AS max_ym FROM re_trade_deal_ym`);
  const period = String(pRows?.[0]?.max_ym || "").trim();

  // ✅ 마곡동만 필터 (stats_m에 dong_name 컬럼 존재 전제)
  const sql = `
    SELECT
      s.apt_key,
      s.sigungu_name,
      s.apt_name,
      s.tx_count,
      s.median_price,
      s.latest_deal_date,
      s.latest_deal_amount_man,
      s.build_year
    FROM re_trade_apt_stats_m s
    WHERE s.deal_ym = ?
      AND s.pyeong_band = ?
      AND s.lawd_cd = ?
      AND s.dong_name = ?
      AND s.median_price IS NOT NULL
    ORDER BY s.median_price DESC, s.tx_count DESC
    LIMIT 100
  `;
  const [rows] = await pool.query(sql, [period, band, REGION.lawd, REGION.dongName]);

  const props = jsonSafe({ period, band, rows: rows || [] });
  if (!nocache) cacheSet(cacheKey, props, 5 * 60 * 1000);
  return { props };
}