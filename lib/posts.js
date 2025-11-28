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

/* =========================================================
   1. 언어별 slugs 가져오기 (하위 폴더 포함)
========================================================= */
export function getAllSlugs(lang = 'ko') {
  const files = getPostFilesByLang(lang);
  return files.map((full) => path.basename(full).replace(/\.md$/, ''));
}

/* =========================================================
   2. 언어별 슬러그에 해당하는 한 개 파일
      👉 영어(en)에서 파일이 없으면 ko로 fallback (원본 로직 유지)
========================================================= */
export function getPostBySlug(lang = 'ko', slug) {
  let effectiveLang = lang;

  // 1) 요청한 언어에서 slug 찾기
  let files = getPostFilesByLang(effectiveLang);
  let targetPath = files.find((full) => {
    const base = path.basename(full).replace(/\.md$/, '');
    return base === slug;
  });

  // 2) 못 찾았고, 언어가 ko가 아니면 ko에서 다시 시도
  if (!targetPath && effectiveLang !== 'ko') {
    effectiveLang = 'ko';
    files = getPostFilesByLang(effectiveLang);
    targetPath = files.find((full) => {
      const base = path.basename(full).replace(/\.md$/, '');
      return base === slug;
    });
  }

  if (!targetPath) {
    throw new Error(`Post not found (lang=${effectiveLang}, slug=${slug})`);
  }

  const file = fs.readFileSync(targetPath, 'utf-8');
  const { data, content } = matter(file);
  const html = marked.parse(content || '');

  const cover = normalizeCover(data.cover);

  // 🔥 tools 필드 정규화
  let tools = [];
  if (Array.isArray(data.tools)) {
    tools = data.tools.map((t) => String(t).trim()).filter(Boolean);
  } else if (Array.isArray(data.tool)) {
    // 혹시 tool: ["goal","compound"] 이렇게 썼을 경우도 지원
    tools = data.tool.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof data.tools === "string") {
    // "goal,compound" 처럼 문자열로 쓴 경우 대비
    tools = data.tools
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return {
    lang: effectiveLang, // ✅ ko로 fallback 되었는지 포함
    slug,
    title: data.title || '',
    description: data.description || '',
    category: data.category || '',
    tags: data.tags || [],
    datePublished: data.datePublished || '',
    dateModified: data.dateModified || data.datePublished || '',
    cover,
    contentHtml: html,
    tools,
  };
}

/* =========================================================
   3. 언어별 전체 리스트
      👉 en에 글이 없으면 자동으로 ko 전체 fallback (원본 의미 유지)
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
   4. KO + EN 전부 한 번에 가져오는 헬퍼 (홈 화면용)
========================================================= */
export function getAllPostsAllLangs() {
  const langs = ['ko', 'en'];
  const combined = [];

  langs.forEach((lang) => {
    const files = getPostFilesByLang(lang);
    files.forEach((full) => {
      const slug = path.basename(full).replace(/\.md$/, '');
      // 여기서는 fallback 필요 없음 (파일은 이미 해당 lang 디렉터리에서 온 것)
      const post = getPostBySlug(lang, slug);
      combined.push(post);
    });
  });

  return combined.sort((a, b) => {
    return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
  });
}

/* =========================================================
   5. 카테고리별 필터 (언어 포함)
   👉 여기서도 getAllPosts가 fallback 처리하므로 그대로 사용
========================================================= */
export function getPostsByCategory(lang = 'ko', category) {
  return getAllPosts(lang).filter(
    (p) => (p.category || '').toLowerCase() === category.toLowerCase()
  );
}

/* =========================================================
   6. 언어별 디렉터리에서만 글을 읽어오는 버전 (fallback 없음)
========================================================= */
export function getAllPostsStrict(lang = 'ko') {
  const files = getPostFilesByLang(lang);
  if (!files.length) return [];

  return files.map((full) => {
    const slug = path.basename(full).replace(/\.md$/, '');
    // 여기서는 lang 그대로 사용 (fallback X)
    return getPostBySlug(lang, slug);
  });
}
