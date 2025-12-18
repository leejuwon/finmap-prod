/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.finmaphub.com",

  generateIndexSitemap: true,
  sitemapSize: 2000,
  generateRobotsTxt: true,

  changefreq: "daily",
  priority: 0.7,

  exclude: ["/api/*", "/admin/*", "/private/*"],

  // ✅ hreflang을 sitemap에도 같이 넣어줌(강추)
  alternateRefs: [
    { href: "https://www.finmaphub.com", hreflang: "ko" },
    { href: "https://www.finmaphub.com/en", hreflang: "en" },
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    additionalSitemaps: [],
  },
};
