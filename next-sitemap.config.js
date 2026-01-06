/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.finmaphub.com",

  generateIndexSitemap: true,
  sitemapSize: 2000,
  generateRobotsTxt: true,

  changefreq: "daily",
  priority: 0.7,

  exclude: [
    "/api/*", 
    "/admin/*", 
    "/private/*",
    // ✅ 중복 언어 prefix (실수로 생성되면 안 됨)
    "/en/en/*",

    // ✅ 과거 구조: /posts/{category}/en/{slug} 류는 sitemap에 포함되면 안 됨
    "/posts/*/en/*",
    "/posts/*/ko/*",
     
    // ✅ 혹시라도 /en/posts/... 아래에서 또 언어가 붙는 형태 방지
    "/en/posts/*/en/*",
    "/en/posts/*/ko/*",
    "/posts/economics-inflation-basics",
  ],

  // ✅ 혹시라도 이상 경로가 들어오면 sitemap에서 제거
  transform: async (config, path) => {
    // 템플릿/이상 URL 차단
    if (path.includes("[") || path.includes("]")) return null;
    if (path.includes("//")) return null;
    if (path.startsWith("/en/en/")) return null;

    // 기본 동작 유지
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },

  // ✅ hreflang을 sitemap에도 같이 넣어줌(강추)
  /*
  alternateRefs: [
    { href: "https://www.finmaphub.com", hreflang: "ko" },
    { href: "https://www.finmaphub.com/en", hreflang: "en" },
  ],
  */

  
  // ✅ /en 정적/툴 페이지가 sitemap에 빠지는 경우를 보강
  additionalPaths: async (config) => {
    const extra = [
      "/en",
      "/en/about",
      "/en/contact",
      "/en/disclaimer",
      "/en/privacy",
      "/en/terms",
      "/en/tools",
      "/en/tools/cagr-calculator",
      "/en/tools/compound-interest",
      "/en/tools/dca-calculator",
      "/en/tools/fire-calculator",
      "/en/tools/goal-simulator",
    ];

    const res = [];
    for (const p of extra) {
      // ✅ 위 transform을 타게 해서 lastmod 가드 적용
      const out = await config.transform(config, p);
      if (out) res.push(out);
    }
    return res;
  },

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
