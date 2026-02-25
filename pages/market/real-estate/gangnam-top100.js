// pages/market/real-estate/gangnam-top100.js
import RealEstateTop100Landing from "../../../_components/RealEstateTop100Landing";
import { jsonSafe } from "../../../lib/jsonSafe";
import { calcRangeFromLatestYm, fetchTop100Rows } from "../../../lib/reTop100Landing";

const REGION = {
  slug: "gangnam-top100",
  lawd: "11680", // 서울 강남구
  nameKo: "강남구",
  nameEn: "Gangnam-gu",
  detailSido: "11",
};

const TEXT = {
  ko: {
    title: "강남 아파트값 순위 TOP 100 | 강남구 실거래 기반",
    desc:
      "강남구 아파트 실거래 집계 데이터를 기반으로, 대표가격(중앙값) 기준 TOP 100 순위를 제공합니다. 최신 거래월 기준으로 빠르게 확인하세요.",
    h1: "강남 아파트값 순위 TOP 100",
    sub: "강남구 실거래 기반 · 대표가격(중앙값) 기준",
    bullets: [
      "‘강남 아파트값 순위’ 검색 의도에 맞춘 고정 URL 랜딩페이지입니다.",
      "순위는 ‘대표가격(중앙값, 총액)’ 기준으로 정렬됩니다.",
      "거래량(표본수)이 작은 단지는 변동이 클 수 있어요.",
      "자세한 필터(평형/년식/금액구간/정렬)는 대시보드에서 확장 가능합니다.",
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
    ctaTitle: "강남3구/서울 전체도 보고 싶다면?",
    ctaDesc:
      "서울 전체 Top100, 또는 대시보드에서 지역을 확장해 비교할 수 있어요.",
    ctaBtn: "대시보드로 이동",
    faqTitle: "자주 묻는 질문",
    faqs: [
      {
        q: "이 페이지의 ‘강남’은 어디를 의미하나요?",
        a: "이 페이지는 행정구역 기준 ‘서울 강남구(11680)’만 포함합니다. ‘강남3구’(강남·서초·송파)처럼 범위를 확장하려면 대시보드에서 지역을 추가로 선택해 비교하세요.",
      },
      {
        q: "순위 기준은 무엇인가요?",
        a: "대표가격(중앙값, 총액) 내림차순 기준입니다. 중앙값은 평균보다 극단값 영향을 덜 받는 편입니다.",
      },
      {
        q: "거래량이 적으면 어떤 문제가 있나요?",
        a: "표본이 적으면 한두 건 거래가 ‘대표가격’ 자체를 흔들 수 있습니다. 거래량을 함께 보면서 해석하는 것이 안전합니다.",
      },
      {
        q: "평형/년식이 섞이면 비교가 불리하지 않나요?",
        a: "네, 큰 평형/신축 비중이 높은 단지는 총액 기준에서 상위로 올라가기 쉽습니다. 대시보드에서 평형/년식 필터를 걸면 더 공정한 비교가 가능합니다.",
      },
      {
        q: "데이터는 언제 업데이트되나요?",
        a: "DB에 존재하는 최신 거래월 기준으로 자동 갱신됩니다. 상단 ‘업데이트 기준’을 확인하세요.",
      },
    ],
  },
  en: {
    title: "Gangnam Apartment Prices Top 100 | Official Transactions",
    desc:
      "Top 100 apartment complexes in Gangnam-gu ranked by median total sale price from official transaction data.",
    h1: "Gangnam Apartment Prices Top 100",
    sub: "Gangnam-gu · Ranked by median total sale price",
    bullets: [
      "A fixed-URL landing page for the query “Gangnam apartment price ranking.”",
      "Ranking metric: median total sale price.",
      "Check transaction count to avoid small-sample noise.",
      "Use the dashboard for deeper filters (size/build year/price range).",
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
    ctaTitle: "Need broader scope (Seoul / Gangnam 3 districts)?",
    ctaDesc: "Open the dashboard and expand the region filters.",
    ctaBtn: "Open dashboard",
    faqTitle: "FAQ",
    faqs: [
      {
        q: "What does ‘Gangnam’ mean on this page?",
        a: "This page includes Gangnam-gu (11680) only. For broader scopes, use the dashboard.",
      },
      {
        q: "What is the ranking metric?",
        a: "Median total sale price (descending).",
      },
      {
        q: "Why does transaction count matter?",
        a: "With few transactions, prices can be noisy. Interpret ranks with tx count.",
      },
      {
        q: "Is mixing sizes/build years unfair?",
        a: "It can be. Use the dashboard filters for more apples-to-apples comparisons.",
      },
      {
        q: "How often is data updated?",
        a: "This page uses the latest available transaction month in the database.",
      },
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
  about: { "@type": "Place", name: "South Korea" },
  keywordsKo: "강남 아파트값 순위, 강남구 아파트 집값, 실거래 순위, Top100",
  keywordsEn: "Gangnam apartment prices, Seoul real estate ranking, transaction data, top 100",
};

const RELATED = [
  { href: '/market/real-estate/mayongseong-top100',    labelEn: 'Mayongseong Top 100',     labelKo: '마용성 Top100' },  
  { href: '/market/real-estate/songpa-top100',         labelEn: 'Songpa Top 100',          labelKo: '송파(잠실) Top100' },
  { href: '/market/real-estate/magok-top100',          labelEn: 'Magok Top 100',           labelKo: '마곡 Top100' },
  { href: '/market/real-estate/gangnam3-top100',       labelEn: 'Gangnam 3Gu Top 100',     labelKo: '강남3구 Top100' },    
  { href: '/market/real-estate/songpa-gangnam-top100', labelEn: 'Songpa-Gangnam Top 100',  labelKo: '송파(잠실)+강남구 Top100' },    
  { href: '/market/real-estate/seoul-top100',          labelEn: 'Seoul Top 100',           labelKo: '서울 Top100' },
];

export default function GangnamTop100Page({ period, band, rows, rangeKey, fromYm, toYm, rangeLabelKo, rangeLabelEn, year }) {
  return (
    <RealEstateTop100Landing
      region={REGION}
      text={TEXT}
      seo={SEO}
      relatedLinks={RELATED}
      period={period}
      band={band}
      rows={rows}
      rangeKey={rangeKey}
      fromYm={fromYm}
      toYm={toYm}
      rangeLabelKo={rangeLabelKo}
      rangeLabelEn={rangeLabelEn}
      year={year}
    />
  );
}

export async function getServerSideProps(ctx) {
  const { res, locale, query } = ctx;
  const lang = String(locale || "ko").startsWith("en") ? "en" : "ko";
  const nocache = String(query.nocache || "0") === "1";
  const band = String(query.band || "all").trim() || "all";
  const rangeKey = String(query.range || "pm").trim() || "pm";

  res.setHeader(
    "Cache-Control",
    nocache ? "no-store" : "public, s-maxage=300, stale-while-revalidate=86400"
  );

  const cacheKey = JSON.stringify({ page: REGION.slug, band, lang, rangeKey });
  if (!nocache) {
    const cached = cacheGet(cacheKey);
    if (cached) return { props: cached };
  }

  const { pool } = require("../../../lib/db");

  // ✅ "업데이트 기준" 앵커(항상 전월 데이터): latestYm
    const [pRows] = await pool.query(`SELECT MAX(deal_ym) AS max_ym FROM re_trade_deal_ym`);
    const latestYm = String(pRows?.[0]?.max_ym || "").trim();
  
    // ✅ 기간 범위 계산: 전월/3개월/6개월/1년/2026년(1월~전월)
    const rangeInfo = calcRangeFromLatestYm(latestYm, rangeKey);
  
    // ✅ 기간 집계 Top100
    const rows = await fetchTop100Rows({
      pool,
      latestYm,
      fromYm: rangeInfo.fromYm,
      toYm: rangeInfo.toYm,
      band,
      regionWhereSql: "s.lawd_cd  = ?",
      regionParams: [REGION.lawd],
      limit: 100,
    });
  
    // ✅ rows 안에 Date 객체가 들어오면 Next SSR 직렬화 에러 발생
    const props = jsonSafe({
      period: latestYm, // UI 상 "업데이트 기준" 표시용(앵커)
      band,
      rows: rows || [],
      rangeKey: rangeInfo.rangeKey,
      fromYm: rangeInfo.fromYm,
      toYm: rangeInfo.toYm,
      rangeLabelKo: rangeInfo.labelKo,
      rangeLabelEn: rangeInfo.labelEn,
      year: rangeInfo.year,
    });
  if (!nocache) cacheSet(cacheKey, props, 5 * 60 * 1000);

  return { props };
}