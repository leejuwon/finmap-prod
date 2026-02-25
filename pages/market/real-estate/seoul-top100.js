// pages/market/real-estate/seoul-top100.js
import RealEstateTop100Landing from "../../../_components/RealEstateTop100Landing";
import { jsonSafe } from "../../../lib/jsonSafe";

const REGION = {
  slug: "seoul-top100",
  sido: "11",
  nameKo: "서울",
  nameEn: "Seoul",
  detailSido: "11",
};

const TEXT = {
  ko: {
    title: "서울 아파트 집값 Top 100 | 서울 실거래 순위",
    desc:
      "서울 아파트 실거래 집계 데이터를 기반으로, 대표가격(중앙값) 기준 TOP 100 순위를 제공합니다. 최신 거래월 기준으로 확인하세요.",
    h1: "서울 아파트 집값 TOP 100",
    sub: "서울 전체 · 실거래 기반 · 대표가격(중앙값) 기준",
    bullets: [
      "서울 전체를 한 번에 훑는 ‘기본 벤치마크’용 페이지입니다.",
      "순위는 ‘대표가격(중앙값, 총액)’ 기준 내림차순입니다.",
      "총액 기준이라 평형/신축 비중이 높은 단지가 상위로 올라갈 수 있어요.",
      "평형/년식/금액구간을 통제하려면 대시보드에서 필터를 사용하세요.",
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
    ctaTitle: "마용성/강남 같은 키워드 페이지도 있어요",
    ctaDesc:
      "특정 지역 검색어를 공략하는 고정 URL 랜딩페이지를 함께 운영하면 검색 유입이 더 쉬워집니다.",
    ctaBtn: "대시보드로 이동",
    faqTitle: "자주 묻는 질문",
    faqs: [
      {
        q: "서울 Top100은 어떤 기준으로 정렬되나요?",
        a: "대표가격(중앙값, 총액) 내림차순입니다. 평균보다 극단값 영향이 적은 중앙값을 사용합니다.",
      },
      {
        q: "평형/신축 비중이 높은 단지가 유리하지 않나요?",
        a: "맞습니다. 총액 기준이라 큰 평형/신축 비중이 높은 단지가 상위로 올라가기 쉽습니다. 대시보드에서 평형/년식을 고정해 비교하는 걸 추천합니다.",
      },
      {
        q: "거래량이 적으면 왜 주의해야 하나요?",
        a: "표본이 적으면 대표값이 불안정할 수 있습니다. 거래량을 함께 보는 것이 안전합니다.",
      },
      {
        q: "데이터는 언제 업데이트되나요?",
        a: "DB의 최신 거래월 기준으로 자동 갱신됩니다. 상단 ‘업데이트 기준’을 확인하세요.",
      },
      {
        q: "마용성/강남 페이지는 어디서 보나요?",
        a: "이 페이지 하단의 관련 링크에서 바로 이동할 수 있습니다.",
      },
    ],
  },
  en: {
    title: "Seoul Apartment Prices Top 100 | Official Transactions",
    desc:
      "Top 100 apartment complexes in Seoul ranked by median total sale price from official transaction data.",
    h1: "Seoul Apartment Prices Top 100",
    sub: "Seoul-wide · Ranked by median total sale price",
    bullets: [
      "A Seoul-wide benchmark page (fixed URL) for SEO and quick scanning.",
      "Ranked by median total sale price (descending).",
      "Total-price ranks can favor larger/newer complexes; use filters for fairness.",
      "Use the dashboard for size/build-year/price-range controls.",
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
    ctaTitle: "Try keyword-focused pages (Mayongseong / Gangnam)",
    ctaDesc: "Fixed-URL pages tend to perform better for search intent matching.",
    ctaBtn: "Open dashboard",
    faqTitle: "FAQ",
    faqs: [
      { q: "What is the ranking metric?", a: "Median total sale price (descending)." },
      { q: "Do larger/newer complexes have an advantage?", a: "Yes, total-price ranks often do. Use dashboard filters for more comparable sets." },
      { q: "Why does transaction count matter?", a: "Small samples can be noisy; interpret ranks with tx count." },
      { q: "How often is data updated?", a: "This page uses the latest available transaction month in the database." },
      { q: "Where can I see Mayongseong/Gangnam pages?", a: "Use the related links below." },
    ],
  },
};

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
 
const SEO = {
  image:
    "https://res.cloudinary.com/dwonflmnn/image/upload/v1769749571/blog/insight/apt-dashboard-home-goal-roadmap-kr-img1.png",
  about: { "@type": "Place", name: "Seoul, South Korea" },
  keywordsKo: "서울 아파트 집값, 서울 아파트값 순위, 실거래 Top100, 부동산 순위",
  keywordsEn: "Seoul apartment prices, Seoul real estate ranking, transaction data, top 100",
};

const RELATED = [
  { href: '/market/real-estate/mayongseong-top100',    labelEn: 'Mayongseong Top 100',     labelKo: '마용성 Top100' },
  { href: '/market/real-estate/gangnam-top100',        labelEn: 'Gangnam Top 100',         labelKo: '강남 Top100' },
  { href: '/market/real-estate/songpa-top100',         labelEn: 'Songpa Top 100',          labelKo: '송파(잠실) Top100' },
  { href: '/market/real-estate/magok-top100',          labelEn: 'Magok Top 100',           labelKo: '마곡 Top100' },
  { href: '/market/real-estate/gangnam3-top100',       labelEn: 'Gangnam 3Gu Top 100',     labelKo: '강남3구 Top100' },      
  { href: '/market/real-estate/songpa-gangnam-top100', labelEn: 'Songpa-Gangnam Top 100',  labelKo: '송파(잠실)+강남구 Top100' },        
];

export default function SeoulTop100Page({ period, band, rows }) {
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

  const sql = `
    SELECT
      s.apt_key,
      s.sigungu_name,
      s.apt_name,
      s.tx_count,
      s.median_price,
      s.avg_price,
      s.max_price,
      s.sum_price,
      s.latest_deal_date,
      s.latest_deal_amount_man,
      s.build_year
    FROM re_trade_apt_stats_m s
    WHERE s.deal_ym = ?
      AND s.pyeong_band = ?
      AND s.sido_code = ?
      AND s.median_price IS NOT NULL
    ORDER BY s.median_price DESC, s.tx_count DESC
    LIMIT 100
  `;
  const [rows] = await pool.query(sql, [period, band, REGION.sido]);

  // ✅ rows 안에 Date 객체가 들어오면 Next SSR 직렬화 에러 발생
  const props = jsonSafe({ period, band, rows: rows || [] });
  if (!nocache) cacheSet(cacheKey, props, 5 * 60 * 1000);

  return { props };
}