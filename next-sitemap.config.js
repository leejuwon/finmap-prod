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

module.exports = {
  siteUrl: SITE_URL,

  generateIndexSitemap: true,
  sitemapSize: 2000,
  generateRobotsTxt: true,

  changefreq: "daily",
  priority: 0.7,

  exclude: [
    "/ko",
    "/ko/*", "/ko/**",
    "/api/*", "/api/**",
    "/admin/*", "/admin/**",
    "/private/*", "/private/**",
    "/en/en/*", "/en/en/**",
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
    if (loc.startsWith("/en/en/")) return null;
    if (loc.includes("?")) return null;

    // ---- posts는 글별 lastmod 적용 ----
    let lastmod = POSTS_LASTMOD_MAP.get(loc);

    // posts인데 맵에 없으면(예: 동적/잘못된) 빌드 시각으로라도 넣기
    if (!lastmod && (loc.startsWith('/posts/') || loc.startsWith('/en/posts/'))) {
      lastmod = BUILD_TIME_ISO;
    }

    // ---- 나머지 페이지는 빌드 시각 사용 ----
    if (!lastmod) lastmod = BUILD_TIME_ISO;

    return {
      loc,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod,
    };
  },

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
      "/en/market",
      "/en/market/real-estate",
    ];

    const res = [];
    for (const p of extra) {
      const out = await config.transform(config, p);
      if (out) res.push(out);
    }
    return res;
  },

  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
    additionalSitemaps: [],
  },
};
