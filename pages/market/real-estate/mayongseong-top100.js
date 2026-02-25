// pages/market/real-estate/mayongseong-top100.js
import RealEstateTop100Landing from "../../../_components/RealEstateTop100Landing";
import { jsonSafe } from "../../../lib/jsonSafe";


const REGION = {
  slug: "mayongseong-top100",
  // 마포(11440), 용산(11170), 성동(11200) — “성수”는 성동구에 포함
  lawds: ["11440", "11170", "11200"],
  nameKo: "마용성(마포·용산·성수)",
  nameEn: "Mayongseong (Mapo · Yongsan · Seongsu)",
  detailSido: "11",
};

const TEXT = {
  ko: {
    title: "마용성 아파트 집값 TOP 100 | 마포·용산·성수 실거래 순위",
    desc:
      "마용성(마포·용산·성수) 아파트 실거래를 기반으로, 대표가격(중앙값) 기준 TOP 100을 보여줍니다. 최신 거래월, 거래량, 최근 거래도 함께 확인하세요.",
    h1: "마용성 아파트 집값 TOP 100",
    sub: "마포·용산·성수(성동) 실거래 기반 · 대표가격(중앙값) 기준",
    bullets: [
      "마용성은 마포·용산·성수(성동) 핵심 지역을 묶어 부르는 별칭입니다.",
      "순위는 ‘대표가격(중앙값, 총액)’ 기준으로 정렬됩니다.",
      "취소거래는 집계 데이터에 반영되지 않도록 처리되어 있습니다(기존 대시보드 기준).",
      "거래량(표본수)이 적은 단지는 값이 튈 수 있으니 거래량도 함께 보세요.",
      "동일 월 기준이므로 ‘최근 시장 분위기’를 빠르게 파악하는 용도에 적합합니다.",
      "상세 필터(평형/년식/금액구간/정렬)는 대시보드에서 확장할 수 있습니다.",
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
    related: "관련 랜딩페이지",
    faqTitle: "자주 묻는 질문",
    faqs: [
      {
        q: "마용성이 정확히 뭐예요?",
        a: "‘마용성’은 보통 마포·용산·성수(성동) 일대를 묶어 부르는 별칭입니다. 이 페이지는 해당 3개 구(마포구, 용산구, 성동구)의 실거래 집계 데이터를 합쳐 TOP 100을 보여줍니다.",
      },
      {
        q: "순위 기준은 무엇인가요?",
        a: "기본 정렬은 ‘대표가격(중앙값, 총액)’ 내림차순입니다. 중앙값은 극단값 영향이 비교적 적어, 평균보다 ‘전형적인 거래 가격’을 보기에 유리합니다.",
      },
      {
        q: "거래량이 적으면 왜 주의해야 하나요?",
        a: "표본(거래 수)이 적으면 특정 고가/저가 거래 1~2건에 의해 값이 왜곡될 수 있습니다. TOP 리스트에서는 거래량(표본수)을 함께 확인하는 게 안전합니다.",
      },
      {
        q: "성수는 성동구인데, 왜 ‘성수’로 표기하나요?",
        a: "검색어/인지도 측면에서 ‘마용성’ 구성요소로 ‘성수’를 많이 쓰기 때문입니다. 행정구역 필터는 성동구(11200) 기준으로 포함됩니다.",
      },
      {
        q: "데이터는 언제 업데이트되나요?",
        a: "이 페이지는 DB에 존재하는 ‘최신 거래월’ 기준으로 자동 갱신됩니다. 표 상단의 ‘업데이트 기준’을 확인하세요.",
      },
      {
        q: "평형/년식/금액 구간을 걸고 보고 싶어요.",
        a: "상단의 ‘대시보드로 이동’ 버튼으로 들어가면 평형/년식/금액구간/정렬을 추가로 설정할 수 있습니다.",
      },
    ],
  },
  en: {
    title: "Mayongseong Apartment Prices Top 100 | Mapo · Yongsan · Seongsu",
    desc:
      "Top 100 apartment complexes in Mayongseong (Mapo, Yongsan, Seongsu/Seongdong) based on median total sale price from official transaction data.",
    h1: "Mayongseong Apartment Prices Top 100",
    sub: "Official transactions · Ranked by median total sale price",
    bullets: [
      "“Mayongseong” commonly refers to Mapo, Yongsan, and Seongsu (Seongdong).",
      "Ranking metric: median total price (less sensitive to outliers than average).",
      "Use transaction count as a reliability check for small-sample complexes.",
      "This page is best for a quick snapshot of the latest market month.",
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
    ctaDesc:
      "Use the dashboard to filter by size/build year/price range and more.",
    ctaBtn: "Open dashboard",
    related: "Related pages",
    faqTitle: "FAQ",
    faqs: [
      {
        q: "What does Mayongseong mean?",
        a: "It’s a nickname grouping Mapo, Yongsan, and Seongsu (Seongdong). This page merges those districts and shows the Top 100 complexes.",
      },
      {
        q: "What is the ranking metric?",
        a: "Median total sale price. Median is typically more robust than average when outliers exist.",
      },
      {
        q: "Why does transaction count matter?",
        a: "With few transactions, prices can be noisy. Always interpret ranks with tx count as a reliability signal.",
      },
      {
        q: "Why ‘Seongsu’ but filtering by Seongdong?",
        a: "Seongsu is a neighborhood within Seongdong-gu. The administrative filter uses Seongdong-gu (11200).",
      },
      {
        q: "How often is data updated?",
        a: "This page uses the latest available transaction month in the database. Check the “Last updated month” label.",
      },
      {
        q: "How do I apply size/build-year/price range filters?",
        a: "Open the dashboard and use the filter controls.",
      },
    ],
  },
};

const SEO = {
  image:
    "https://res.cloudinary.com/dwonflmnn/image/upload/v1769749571/blog/insight/apt-dashboard-home-goal-roadmap-kr-img1.png",
  about: { "@type": "Place", name: "South Korea" },
  keywordsKo: "마용성, 마포 아파트 집값, 용산 아파트 집값, 성수 아파트 집값, 실거래 순위, 서울 아파트값",
  keywordsEn: "Mayongseong, Mapo apartment prices, Yongsan apartment prices, Seongsu apartment prices, Seoul real estate ranking",
};

const RELATED = [
  { href: '/market/real-estate/gangnam-top100',        labelEn: 'Gangnam Top 100',         labelKo: '강남 Top100' },
  { href: '/market/real-estate/songpa-top100',         labelEn: 'Songpa Top 100',          labelKo: '송파(잠실) Top100' },
  { href: '/market/real-estate/magok-top100',          labelEn: 'Magok Top 100',           labelKo: '마곡 Top100' },
  { href: '/market/real-estate/gangnam3-top100',       labelEn: 'Gangnam 3Gu Top 100',     labelKo: '강남3구 Top100' },    
  { href: '/market/real-estate/songpa-gangnam-top100', labelEn: 'Songpa-Gangnam Top 100',  labelKo: '송파(잠실)+강남구 Top100' },    
  { href: '/market/real-estate/seoul-top100',          labelEn: 'Seoul Top 100',           labelKo: '서울 Top100' },
];

export default function MayongseongTop100Page({ period, band, rows }) {
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

export async function getServerSideProps(ctx) {
  const { req, res, locale, query } = ctx;
  const lang = String(locale || "ko").startsWith("en") ? "en" : "ko";
  const nocache = String(query.nocache || "0") === "1";
  const band = String(query.band || "all").trim() || "all";

  // CDN/Proxy 캐시 힌트(원치 않으면 제거 가능)
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

  // 최신 거래월
  const [pRows] = await pool.query(`SELECT MAX(deal_ym) AS max_ym FROM re_trade_deal_ym`);
  const period = String(pRows?.[0]?.max_ym || "").trim();

  // Top 100 (stats_m) — 대표가격(중앙값) 기준
  const placeholders = REGION.lawds.map(() => "?").join(", ");
  const params = [period, band, ...REGION.lawds, 100];

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
      AND s.lawd_cd IN (${placeholders})
      AND s.median_price IS NOT NULL
    ORDER BY s.median_price DESC, s.tx_count DESC
    LIMIT ?
  `;

  const [rows] = await pool.query(sql, params);

  // ✅ rows 안에 Date 객체가 들어오면 Next SSR 직렬화 에러 발생
  const props = jsonSafe({ period, band, rows: rows || [] });

  if (!nocache) cacheSet(cacheKey, props, 5 * 60 * 1000);
  return { props };
}