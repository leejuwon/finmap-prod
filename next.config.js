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

  async redirects() {
    return [
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
        destination: "/posts/:category/:slug",
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
    ];
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
