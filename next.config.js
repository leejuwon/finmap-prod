/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  poweredByHeader: false,
  swcMinify: false,

  async redirects() {
    return [
      { source: '/investing', destination: '/category/investing', permanent: true },
      { source: '/economics', destination: '/category/economics', permanent: true },
      { source: '/tax', destination: '/category/tax', permanent: true },

      // ✅ 옛날 /posts/slug -> 새 경로 /posts/ko/slug
      { source: '/posts/:slug', destination: '/posts/ko/:slug', permanent: true },
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
