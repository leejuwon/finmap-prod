//next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SITE_URL = "https://www.finmaphub.com";
const POSTS_ROOT = path.join(process.cwd(), 'content', 'posts');

// 빌드 시각(정적 페이지 lastmod 용)
const BUILD_TIME_ISO = new Date().toISOString();

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkDir(full));
    else out.push(full);
  }
  return out;
}

// YYYY-MM-DD or ISO 형태를 ISO로 정규화
function normalizeDateToIso(v) {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  // YYYY-MM-DD 같은 경우도 Date로 파싱되긴 함(UTC 기준)
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// posts의 lastmod 맵 생성: loc -> ISO
function buildPostsLastmodMap() {
  const map = new Map();
  if (!fs.existsSync(POSTS_ROOT)) return map;

  const mdFiles = walkDir(POSTS_ROOT).filter(f => f.endsWith('.md'));

  for (const fullPath of mdFiles) {
    // content/posts/{category}/{lang}/{slug}.md
    const rel = path.relative(POSTS_ROOT, fullPath).replace(/\\/g, '/');
    const parts = rel.split('/');
    if (parts.length < 3) continue;

    const categorySlug = parts[0];
    const lang = parts[1]; // 'ko' | 'en'
    const filename = parts[parts.length - 1];
    const slug = filename.replace(/\.md$/, '');

    // 파일에서 frontmatter 읽기
    let fm = {};
    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      fm = matter(raw).data || {};
    } catch (e) {
      fm = {};
    }

    // 1) dateModified 우선
    let lastmod = normalizeDateToIso(fm.dateModified);

    // 2) 없으면 datePublished
    if (!lastmod) lastmod = normalizeDateToIso(fm.datePublished);

    // 3) 그것도 없으면 파일 수정시간
    if (!lastmod) {
      try {
        const st = fs.statSync(fullPath);
        lastmod = new Date(st.mtime).toISOString();
      } catch (e) {
        lastmod = BUILD_TIME_ISO;
      }
    }

    // loc 만들기 (네 사이트 라우팅 규칙)
    const prefix = lang === 'en' ? '/en' : '';
    const loc = `${prefix}/posts/${categorySlug}/${slug}`;
    map.set(loc, lastmod);
  }

  return map;
}

const POSTS_LASTMOD_MAP = buildPostsLastmodMap();

function maxIso(a, b) {
  if (!a) return b;
  if (!b) return a;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

// 카테고리 허브 lastmod = 해당 카테고리 글 중 최신(lastmod 최대)
function buildCategoryLastmodMap(postsMap) {
  const catMap = new Map();
  for (const [loc, lastmod] of postsMap.entries()) {
    const m = loc.match(/^\/(?:en\/)?posts\/([^/]+)\//);
    if (!m) continue;
    const cat = m[1];
    const koLoc = `/category/${cat}`;
    const enLoc = `/en/category/${cat}`;
    catMap.set(koLoc, maxIso(catMap.get(koLoc), lastmod));
    catMap.set(enLoc, maxIso(catMap.get(enLoc), lastmod));
  }
  return catMap;
}

const CATEGORY_LASTMOD_MAP = buildCategoryLastmodMap(POSTS_LASTMOD_MAP);

/* ---------------------- hreflang (xhtml:link) ---------------------- */
// next-sitemap은 transform()에서 alternateRefs를 반환하면
// sitemap에 <xhtml:link rel="alternate" hreflang="..."> 를 함께 출력합니다.
// (ko: 기본, en: /en 프리픽스)

const STATIC_I18N_BASE_LOCS = new Set([
  '/',
  '/about',
  '/contact',
  '/disclaimer',
  '/privacy',
  '/terms',
  '/sitemap-pages',
  '/tools',
  '/tools/cagr-calculator',
  '/tools/compound-interest',
  '/tools/dca-calculator',
  '/tools/fire-calculator',
  '/tools/goal-simulator',
  '/market',
  '/market/real-estate',
]);

function toKoLoc(loc) {
  if (loc === '/en') return '/';
  if (loc.startsWith('/en/')) return loc.slice(3);
  return loc;
}

function toEnLoc(loc) {
  if (loc === '/') return '/en';
  if (loc.startsWith('/en')) return loc;
  return `/en${loc}`;
}

function hasKoEnPairForLoc(koLoc, enLoc) {
  // posts: 양쪽 모두 실제 글이 존재할 때만
  if (koLoc.startsWith('/posts/') || enLoc.startsWith('/en/posts/')) {
    return POSTS_LASTMOD_MAP.has(koLoc) && POSTS_LASTMOD_MAP.has(enLoc);
  }
  // category: 양쪽 모두 허브가 존재할 때만
  if (koLoc.startsWith('/category/') || enLoc.startsWith('/en/category/')) {
    return CATEGORY_LASTMOD_MAP.has(koLoc) && CATEGORY_LASTMOD_MAP.has(enLoc);
  }
  // static: 우리가 관리하는 정적 페이지 목록만
  return STATIC_I18N_BASE_LOCS.has(koLoc);
}

function buildAlternateRefs(loc) {
  const koLoc = toKoLoc(loc);
  const enLoc = toEnLoc(koLoc);

  if (!hasKoEnPairForLoc(koLoc, enLoc)) return null;

  // href는 absolute URL이어야 sitemap에 xhtml:link로 정상 출력됩니다.
  const koHref = `${SITE_URL}${koLoc}`;
  const enHref = `${SITE_URL}${enLoc}`;

  return [
    { hreflang: 'ko', href: koHref },
    { hreflang: 'en', href: enHref },
    // 기본(대표) 언어를 명시하고 싶으면 x-default 추가 (선택)
    { hreflang: 'x-default', href: koHref },
  ];
}


module.exports = {
  siteUrl: SITE_URL,
  trailingSlash: false,
  generateIndexSitemap: true,
  sitemapSize: 2000,
  generateRobotsTxt: false, // ✅ robots는 직접 public/robots.txt로 관리

  changefreq: "daily",
  priority: 0.7,

  exclude: [
    "/ko",
    "/ko/*", "/ko/**",
    "/api/*", "/api/**",
    "/admin/*", "/admin/**",
    "/private/*", "/private/**",
    "/en/en/*", "/en/en/**", "/en/en",
    "/posts/*/en/*", "/posts/*/en/**",
    "/posts/*/ko/*", "/posts/*/ko/**",
    "/en/posts/*/en/*", "/en/posts/*/en/**",
    "/en/posts/*/ko/*", "/en/posts/*/ko/**",
    "/posts/economics-inflation-basics",
    "/404", "/500",
    "/en/404", "/en/500",
  ],

  transform: async (config, loc) => {
    // ---- 이상 경로 제거 ----
    if (!loc) return null;
    if (loc === "/ko" || loc.startsWith("/ko/")) return null;
    if (loc.includes("[") || loc.includes("]")) return null;
    if (loc.includes("//")) return null;
    if (loc === "/en/en" || loc.startsWith("/en/en/")) return null;
    if (loc.includes("?")) return null;

    // ---- posts는 글별 lastmod 적용 ----
    let lastmod = POSTS_LASTMOD_MAP.get(loc);

    // ---- category hub는 "카테고리 최신 글" lastmod 적용 ----
    if (!lastmod) lastmod = CATEGORY_LASTMOD_MAP.get(loc);

    // posts인데 맵에 없으면(예: 동적/잘못된) 빌드 시각으로라도 넣기
    if (!lastmod && (loc.startsWith('/posts/') || loc.startsWith('/en/posts/'))) {
      lastmod = BUILD_TIME_ISO;
    }

    // ---- 나머지 페이지는 빌드 시각 사용 ----
    if (!lastmod) lastmod = BUILD_TIME_ISO;

    // ---- hreflang alternateRefs(ko/en) ----
    const alternateRefs = buildAlternateRefs(loc);

    return {
      loc,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod,
      ...(alternateRefs ? { alternateRefs } : {}),
    };
  },

  additionalPaths: async (config) => {
    // ✅ 카테고리 허브를 sitemap에 실제 URL로 추가 (목차 허브 노출/크롤링 가속)
    const categories = Array.from(
      new Set(
        Array.from(CATEGORY_LASTMOD_MAP.keys())
          .filter((p) => p.startsWith("/category/"))
          .map((p) => p.replace("/category/", ""))
      )
    );

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
      "/en/market",
      "/en/market/real-estate",
    ];

    for (const c of categories) {
      extra.push(`/category/${c}`);
      extra.push(`/en/category/${c}`);
    }

    const res = [];
    for (const p of extra) {
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
        disallow: ["/api/", "/admin/", "/private/"],
      },
    ],
    additionalSitemaps: [],
  },
};
