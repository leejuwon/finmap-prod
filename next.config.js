/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  poweredByHeader: false,
  swcMinify: false,

  // ✅ i18n 추가: /en/... URL 생성
  i18n: {
    locales: ["ko", "en"],
    defaultLocale: "ko",
    localeDetection: false,
  },

  images: {
    unoptimized: true,
  },

  async redirects() {
    const rules = [
      // -------------------------
      // (A) 기존 카테고리 리다이렉트 유지
      // -------------------------
      { source: '/personalFinance', destination: '/category/personalFinance', permanent: true },
      { source: '/economicInfo', destination: '/category/economicInfo', permanent: true },
      { source: '/investingInfo', destination: '/category/investingInfo', permanent: true },
      { source: '/economics', destination: '/category/economicInfo', permanent: true },
      { source: '/category/economics', destination: '/category/economicInfo', permanent: true },
      // -------------------------
      // (B) posts URL 정규화 (중복 lang 세그먼트 제거)
      // ✅ locale:false 필수 (안 붙이면 /en/en/... 발생 가능)
      // -------------------------
      {
        source: "/posts/:category/ko/:slug",
        destination: "/posts/:category/:slug",
        permanent: true,
        locale: false,
      },
      {
        source: "/posts/:category/en/:slug",
        destination: "/en/posts/:category/:slug",
        permanent: true,
        locale: false,
      },
      {
        source: "/en/posts/:category/en/:slug",
        destination: "/en/posts/:category/:slug",
        permanent: true,
        locale: false,
      },
      {
        source: "/en/posts/:category/ko/:slug",
        destination: "/en/posts/:category/:slug",
        permanent: true,
        locale: false,
      },      

      // -------------------------
      // (C) ?lang=ko/en 파라미터 정규화
      // ✅ locale:false 필수
      // -------------------------
      {
        source: "/tools/:path*",
        has: [{ type: "query", key: "lang", value: "en" }],
        destination: "/en/tools/:path*",
        permanent: true,
        locale: false,
      },
      {
        source: "/tools/:path*",
        has: [{ type: "query", key: "lang", value: "ko" }],
        destination: "/tools/:path*",
        permanent: true,
        locale: false,
      },
      {
        source: "/category/:path*",
        has: [{ type: "query", key: "lang", value: "en" }],
        destination: "/en/category/:path*",
        permanent: true,
        locale: false,
      },
      {
        source: "/category/:path*",
        has: [{ type: "query", key: "lang", value: "ko" }],
        destination: "/category/:path*",
        permanent: true,
        locale: false,
      },

      // (옵션) posts에도 ?lang= 붙는 경우 정리
      {
        source: "/posts/:path*",
        has: [{ type: "query", key: "lang", value: "en" }],
        destination: "/en/posts/:path*",
        permanent: true,
        locale: false,
      },
      {
        source: "/posts/:path*",
        has: [{ type: "query", key: "lang", value: "ko" }],
        destination: "/posts/:path*",
        permanent: true,
        locale: false,
      },

      // -------------------------
      // (D) 루트 / 또는 /en 에 붙는 ?lang= 정리
      // ✅ next.config redirects는 "쿼리 제거"를 못해서
      //    /en?lang=en → /en 같은 형태를 여기서 처리하면 루프/중복 신호가 커질 수 있음.
      // ✅ 따라서 이 블록은 제거하고, 쿼리 제거는 (권장) middleware에서 처리.
      // -------------------------

      // -------------------------
      // (E) /en/en/... 같은 과거 중복 URL 청소 (혹시 남아있다면)
      // -------------------------
      { source: "/en/en", destination: "/en", permanent: true, locale: false },
      { source: "/en/en/:path*", destination: "/en/:path*", permanent: true, locale: false },
      // (추가) /en/ → /en (슬래시 정규화)
      { source: "/en/", destination: "/en", permanent: true, locale: false },

      // -------------------------
      // (X) 이상한 템플릿 URL 직접 유입 방어 (500 → 404로 차단)
      // -------------------------
      { source: "/posts/[category]/[slug]", destination: "/404", permanent: false, locale: false },
      { source: "/en/posts/[category]/[slug]", destination: "/404", permanent: false, locale: false },
      { source: "/posts/%5Bcategory%5D/%5Bslug%5D", destination: "/404", permanent: false, locale: false },
      { source: "/en/posts/%5Bcategory%5D/%5Bslug%5D", destination: "/404", permanent: false, locale: false },


      // -------------------------
      // (F) Search Console 404로 찍힌 개별 URL 매핑
      // -------------------------
      {
        source: "/posts/economics-inflation-basics",
        destination: "/posts/economicInfo/inflation-basics",
        permanent: true,
        locale: false,
      },
      // 아래는 원칙상 이미 (B)로 커버되지만, 혹시 404로 계속 찍히면 "명시"로 박아두면 더 강력함
      {
        source: "/posts/personalFinance/en/personal-finance-3pillars",
        destination: "/en/posts/personalFinance/personal-finance-3pillars",
        permanent: true,
        locale: false,
      },
      {
        source: "/category/investing",
        destination: "/category/investingInfo",
        permanent: true,
        locale: false,
      },
      {
        source: "/en/category/investing",
        destination: "/en/category/investingInfo",
        permanent: true,
        locale: false,
      },
      // tax 카테고리를 지금 안 쓰더라도, 가장 가까운 personalFinance로 정리 (원하면 /category/economicInfo로 바꿔도 됨)
      {
        source: "/category/tax",
        destination: "/category/personalFinance",
        permanent: true,
        locale: false,
      },
      {
        source: "/en/category/tax",
        destination: "/en/category/personalFinance",
        permanent: true,
        locale: false,
      },
      
      // slug가 category 없이 있던 과거 URL → investingInfo로 이동 (추정 매핑)
      {
        source: "/posts/usd-krw-weak-won-sector-map-kospi",
        destination: "/posts/investingInfo/usd-krw-weak-won-sector-map-kospi",
        permanent: true,
        locale: false,
      },

      // en 쪽에서 category 누락된 과거 URL → investingInfo로 이동
      {
        source: "/en/posts/weak-krw-winners-losers-sector-map",
        destination: "/en/posts/investingInfo/usd-krw-weak-won-sector-map-kospi",
        permanent: true,
        locale: false,
      },

      // usdkrw (붙여쓴 slug) → usd-krw (하이픈 slug)로 정리
      {
        source: "/posts/investingInfo/usdkrw-exchange-rate-and-kospi",
        destination: "/posts/investingInfo/usd-krw-exchange-rate-and-kospi",
        permanent: true,
        locale: false,
      },
      {
        source: "/en/posts/investingInfo/usdkrw-exchange-rate-and-kospi",
        destination: "/en/posts/investingInfo/usd-krw-exchange-rate-and-kospi",
        permanent: true,
        locale: false,
      },      
      {
        source: "/en/posts/investingInfo/usd-krw-exchange-rate-kospi",
        destination: "/en/posts/investingInfo/usd-krw-exchange-rate-and-kospi",
        permanent: true,
        locale: false,
      },            
      {
        source: "/posts/investingInfo/usd-krw-exchange-rate-kospi",
        destination: "/posts/investingInfo/usd-krw-exchange-rate-and-kospi",
        permanent: true,
        locale: false,
      },            
      {
        source: "/posts/personalFinance/en/monthly-investment",
        destination: "/en/posts/personalFinance/how-much-per-month-for-100m",
        permanent: true,
        locale: false,
      },                  
    ];
    
    // ✅ Next build에서 죽는 "null route" 방지
    const cleaned = rules.filter(Boolean);

    // ✅ (디버깅용) source/destination 누락된 항목이 있으면 바로 어떤 건지 터뜨리기
    for (const r of cleaned) {
      if (!r || typeof r !== "object" || !r.source || !r.destination) {
        throw new Error("Invalid redirect found: " + JSON.stringify(r));
      }
    }
    return cleaned;
  },  

  // 🔥 여기 추가됨
  webpack: (config, { isServer }) => {
    // 클라이언트 번들에서는 Node 모듈 사용 금지 → fs/path false 처리
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
      };
    }
    return config;
  },
};
