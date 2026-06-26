// lib/posts.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

/* =========================================================
   0. 루트 디렉터리: content/posts
   - 구조: content/posts/[category]/[lang]/[slug].md
========================================================= */

const postsRootDir = path.join(process.cwd(), 'content', 'posts');

/* 공통: 디렉터리 재귀 탐색 */
function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

// 언어별 md 파일 목록
// - 카테고리 이름은 상관없이,
//   예) content/posts/(카테고리)/[lang]/*.md 형태의 파일을 전부 가져옴
//=========================================================
function getPostFilesByLang(lang = 'ko') {
  if (!fs.existsSync(postsRootDir)) return [];

  const categoryDirs = fs
    .readdirSync(postsRootDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name); // economics, personalFinance ...

  let files = [];
  for (const category of categoryDirs) {
    const langDir = path.join(postsRootDir, category, lang);
    if (!fs.existsSync(langDir)) continue;
    files.push(...walkDir(langDir));
  }

  return files.filter((f) => f.endsWith('.md'));
}

/* 커버 URL 정규화 (원본 그대로 유지) */
function normalizeCover(rawCover) {
  if (!rawCover) return null;
  let c = String(rawCover).trim();
  if (!c) return null;

  if (c.startsWith('http://') || c.startsWith('https://')) return c;
  if (c.startsWith('/public/')) c = c.replace(/^\/public/, '');
  if (!c.startsWith('/')) c = '/' + c;

  return c;
}

function normalizeInternalHref(rawHref) {
  if (!rawHref) return rawHref;
  const href = String(rawHref).trim();
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('javascript:')
  ) {
    return rawHref;
  }

  const site = 'https://www.finmaphub.com';
  const isAbsolute = /^https?:\/\//i.test(href);
  const isRootRelative = href.startsWith('/');
  if (!isAbsolute && !isRootRelative) return rawHref;

  let parsed;
  try {
    parsed = new URL(href, site);
  } catch {
    return rawHref;
  }
  if (parsed.origin !== site) return rawHref;

  let path = parsed.pathname.replace(/\/{2,}/g, '/');

  if (path === '/ko') path = '/';
  else if (path.startsWith('/ko/')) path = path.replace(/^\/ko/, '') || '/';

  if (path === '/en/en') path = '/en';
  else if (path.startsWith('/en/en/')) path = path.replace(/^\/en\/en/, '/en');

  const lang = parsed.searchParams.get('lang');
  if (lang === 'en' || lang === 'ko') {
    parsed.searchParams.delete('lang');
    if (lang === 'en') {
      if (path === '/') path = '/en';
      else if (!path.startsWith('/en')) path = `/en${path}`;
    } else {
      if (path === '/en') path = '/';
      else if (path.startsWith('/en/')) path = path.replace(/^\/en/, '') || '/';
    }
  }

  let m = path.match(/^\/posts\/([^/]+)\/en\/([^/]+)$/);
  if (m) path = `/en/posts/${m[1]}/${m[2]}`;
  m = path.match(/^\/posts\/([^/]+)\/ko\/([^/]+)$/);
  if (m) path = `/posts/${m[1]}/${m[2]}`;
  m = path.match(/^\/en\/posts\/([^/]+)\/en\/([^/]+)$/);
  if (m) path = `/en/posts/${m[1]}/${m[2]}`;
  m = path.match(/^\/en\/posts\/([^/]+)\/ko\/([^/]+)$/);
  if (m) path = `/posts/${m[1]}/${m[2]}`;

  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);

  const query = parsed.searchParams.toString();
  const normalized = `${path}${query ? `?${query}` : ''}${parsed.hash || ''}`;
  return isAbsolute ? `${site}${normalized}` : normalized;
}

function normalizeInternalLinksInHtml(html) {
  return String(html || '').replace(/\bhref=(["'])([^"']+)\1/g, (match, quote, href) => {
    const nextHref = normalizeInternalHref(href);
    return nextHref === href ? match : `href=${quote}${nextHref}${quote}`;
  });
}

function stripMarkdownForReadingStats(content) {
  return String(content || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+\]\([^)]+\)/g, ' ')
    .replace(/[#>*_`~|:-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getReadingStats(content) {
  const text = stripMarkdownForReadingStats(content);
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 220));
  return { wordCount, readingTimeMinutes };
}

/* slug로 파일 경로 찾기 (언어 기준, fallback 없음) */
function findPostPathBySlug(lang = 'ko', slug) {
  const files = getPostFilesByLang(lang);
  return (
    files.find((full) => path.basename(full).replace(/\.md$/, '') === slug) ||
    null
  );
}

/* 파일 경로로 포스트 객체 생성 */
function buildPostFromPath(fullPath, lang, slug) {
  const file = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(file);
  const html = normalizeInternalLinksInHtml(marked.parse(content || ''));
  const readingStats = getReadingStats(content);

  const cover = normalizeCover(data.cover);

  // 🔥 tools 필드 정규화
  let tools = [];
  if (Array.isArray(data.tools)) {
    tools = data.tools.map((t) => String(t).trim()).filter(Boolean);
  } else if (Array.isArray(data.tool)) {
    // 혹시 tool: ["goal","compound"] 이렇게 썼을 경우도 지원
    tools = data.tool.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof data.tools === 'string') {
    // "goal,compound" 처럼 문자열로 쓴 경우 대비
    tools = data.tools
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return {
    lang,
    slug,
    title: data.seoTitle || data.title || '',
    description: data.seoDescription || data.description || '',
    sourceTitle: data.title || '',
    sourceDescription: data.description || '',
    category: data.category || '',
    tags: data.tags || [],
    datePublished: data.datePublished || '',
    dateModified: data.dateModified || data.datePublished || '',
    cover,
    hreflangEquivalent: data.hreflangEquivalent === false ? false : true,
    contentHtml: html,
    tools,
    ...readingStats,
  };
}

/* =========================================================
   1. 언어별 slugs 가져오기 (하위 폴더 포함)
========================================================= */
export function getAllSlugs(lang = 'ko') {
  const files = getPostFilesByLang(lang);
  return files.map((full) => path.basename(full).replace(/\.md$/, ''));
}

/* =========================================================
   1-1. (추가) 번역본 존재 여부만 strict하게 체크
   - getPostBySlug('en', slug)는 ko로 fallback할 수 있어 "존재" 판정이 틀어질 수 있음
   - otherLangAvailable 체크에는 이 함수를 사용 권장
========================================================= */
export function hasPostSlugStrict(lang = 'ko', slug) {
  return Boolean(findPostPathBySlug(lang, slug));
}

/* =========================================================
   2. (추가) strict 버전: fallback 없이 해당 언어에서만 찾기
========================================================= */
export function getPostBySlugStrict(lang = 'ko', slug) {
  const targetPath = findPostPathBySlug(lang, slug);
  if (!targetPath) {
    throw new Error(`Post not found (lang=${lang}, slug=${slug})`);
  }
  return buildPostFromPath(targetPath, lang, slug);
}

/* =========================================================
   3. 언어별 슬러그에 해당하는 한 개 파일
      👉 영어(en)에서 파일이 없으면 ko로 fallback (기존 로직 유지)
========================================================= */
export function getPostBySlug(lang = 'ko', slug) {
  let effectiveLang = lang;

  // 1) 요청한 언어에서 slug 찾기
  let targetPath = findPostPathBySlug(effectiveLang, slug);

  // 2) 못 찾았고, 언어가 ko가 아니면 ko에서 다시 시도
  if (!targetPath && effectiveLang !== 'ko') {
    effectiveLang = 'ko';
    targetPath = findPostPathBySlug(effectiveLang, slug);
  }

  if (!targetPath) {
    throw new Error(`Post not found (lang=${effectiveLang}, slug=${slug})`);
  }

  // ✅ ko로 fallback 되었는지 포함해서 반환
  return buildPostFromPath(targetPath, effectiveLang, slug);
}

/* =========================================================
   4. 언어별 전체 리스트
      👉 en에 글이 없으면 자동으로 ko 전체 fallback (기존 의미 유지)
========================================================= */
export function getAllPosts(lang = 'ko') {
  let effectiveLang = lang;
  let files = getPostFilesByLang(effectiveLang);

  // en 디렉토리에 글이 하나도 없으면 ko로 폴백
  if (!files.length && effectiveLang !== 'ko') {
    effectiveLang = 'ko';
    files = getPostFilesByLang(effectiveLang);
  }

  const posts = files.map((full) => {
    const slug = path.basename(full).replace(/\.md$/, '');
    return getPostBySlug(effectiveLang, slug);
  });

  return posts.sort((a, b) => {
    return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
  });
}

/* =========================================================
   5. KO + EN 전부 한 번에 가져오는 헬퍼 (홈 화면용)
========================================================= */
export function getAllPostsAllLangs() {
  const langs = ['ko', 'en'];
  const combined = [];

  langs.forEach((lang) => {
    const files = getPostFilesByLang(lang);
    files.forEach((full) => {
      const slug = path.basename(full).replace(/\.md$/, '');
      // ✅ 여기서는 strict 사용 (해당 lang 파일에서만 읽는 것이므로 fallback 불필요)
      const post = getPostBySlugStrict(lang, slug);
      combined.push(post);
    });
  });

  return combined.sort((a, b) => {
    return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
  });
}

/* =========================================================
   6. 카테고리별 필터 (언어 포함)
   👉 여기서도 getAllPosts가 fallback 처리하므로 그대로 사용
========================================================= */
export function getPostsByCategory(lang = 'ko', category) {
  return getAllPosts(lang).filter(
    (p) => (p.category || '').toLowerCase() === category.toLowerCase()
  );
}

/* =========================================================
   7. 언어별 디렉터리에서만 글을 읽어오는 버전 (fallback 없음)
========================================================= */
export function getAllPostsStrict(lang = 'ko') {
  const files = getPostFilesByLang(lang);
  if (!files.length) return [];

  return files
    .map((full) => {
      const slug = path.basename(full).replace(/\.md$/, '');
      return getPostBySlugStrict(lang, slug);
    })
    .sort((a, b) => new Date(b.datePublished || 0) - new Date(a.datePublished || 0));
}
