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
      { source: '/personalFinance', destination: '/category/personalFinance', permanent: true },
      { source: '/economicInfo', destination: '/category/economicInfo', permanent: true },
      { source: '/investingInfo', destination: '/category/investingInfo', permanent: true },
      { source: '/economics', destination: '/category/economicInfo', permanent: true },
      { source: '/category/economics', destination: '/category/economicInfo', permanent: true },
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
