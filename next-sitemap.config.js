/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: 'https://www.finmaphub.com',

  // ✨ 구글이 sitemap을 인덱스로 인식하도록!
  // sitemap.xml이 자동으로 index 역할을 하게 한다.
  generateIndexSitemap: true,

  // ✨ URL 수가 많아지면 sitemap-0.xml, sitemap-1.xml 자동 분리
  sitemapSize: 2000,

  // ✨ robots.txt 자동 생성
  generateRobotsTxt: true,

  // ✨ 기본 changefreq, priority
  changefreq: 'daily',
  priority: 0.7,

  // ✨ 불필요한 경로 색인 방지
  exclude: [
    '/api/*',
    '/admin/*',
    '/private/*'
  ],

  // ✨ robots.txt 추가 설정
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    // sitemap.xml만 있으면 충분함 (추가 sitemap 없음)
    additionalSitemaps: [],
  },
};
