// lib/posts.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// 언어별 폴더
function getPostsDir(lang = 'ko') {
  return path.join(process.cwd(), 'content', 'posts', lang);
}

// 커버 URL 정규화
function normalizeCover(rawCover) {
  if (!rawCover) return null;
  let c = String(rawCover).trim();
  if (!c) return null;

  if (c.startsWith('http://') || c.startsWith('https://')) return c;

  if (c.startsWith('/public/')) c = c.replace(/^\/public/, '');

  if (!c.startsWith('/')) c = '/' + c;

  return c;
}

// 언어별 slugs 가져오기
export function getAllSlugs(lang = 'ko') {
  const dir = getPostsDir(lang);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

// 언어별 슬러그에 해당하는 한 개 파일
// 👉 영어(en)에서 파일이 없으면 자동으로 ko에서 다시 찾도록 fallback
export function getPostBySlug(lang = 'ko', slug) {
  let effectiveLang = lang;
  let dir = getPostsDir(effectiveLang);
  let fullPath = path.join(dir, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    // 영어/다른 언어에서 못 찾으면 한국어로 fallback
    if (effectiveLang !== 'ko') {
      effectiveLang = 'ko';
      dir = getPostsDir(effectiveLang);
      fullPath = path.join(dir, `${slug}.md`);
    }
  }

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found (lang=${effectiveLang}, slug=${slug})`);
  }

  const file = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(file);
  const html = marked.parse(content || '');

  const cover = normalizeCover(data.cover);

  return {
    lang: effectiveLang, // ✅ 실제 사용된 언어(ko로 fallback 되었는지 포함)
    slug,
    title: data.title || '',
    description: data.description || '',
    category: data.category || '',
    tags: data.tags || [],
    datePublished: data.datePublished || '',
    dateModified: data.dateModified || data.datePublished || '',
    cover,
    contentHtml: html,
  };
}

// 언어별 전체 리스트
// 👉 en에 글이 없으면 자동으로 ko로 전체 fallback
export function getAllPosts(lang = 'ko') {
  let effectiveLang = lang;
  let slugs = getAllSlugs(effectiveLang);

  // en/posts 디렉토리 비었으면 자동 ko로 전환
  if (!slugs.length && effectiveLang !== 'ko') {
    effectiveLang = 'ko';
    slugs = getAllSlugs(effectiveLang);
  }

  const posts = slugs.map((s) => getPostBySlug(effectiveLang, s));

  return posts.sort((a, b) => {
    return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
  });
}

// ✅ KO + EN 전부 한 번에 가져오는 헬퍼 (홈 화면용)
// - 빌드 타임에 모든 언어 글을 읽어두고
// - 런타임에서 router.query.lang 으로 필터링하는 용도
export function getAllPostsAllLangs() {
  const langs = ['ko', 'en'];
  const combined = [];

  langs.forEach((lang) => {
    const slugs = getAllSlugs(lang);
    slugs.forEach((slug) => {
      // 여기서는 fallback 필요 없음(슬러그는 해당 lang 디렉토리에서 온 것이라 존재 보장)
      const post = getPostBySlug(lang, slug);
      combined.push(post);
    });
  });

  return combined.sort((a, b) => {
    return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
  });
}

// 카테고리별 필터 (언어 포함)
// 👉 여기서도 getAllPosts가 이미 fallback을 처리하므로 그대로 사용
export function getPostsByCategory(lang = 'ko', category) {
  return getAllPosts(lang).filter(
    (p) => (p.category || '').toLowerCase() === category.toLowerCase()
  );
}

// 🔹 언어별 디렉토리에서만 글을 읽어오는 버전 (fallback 없음)
export function getAllPostsStrict(lang = 'ko') {
  const slugs = getAllSlugs(lang);
  if (!slugs.length) return [];

  // 여기서는 getPostBySlug의 fallback이 절대 발동하지 않음
  // (slugs가 해당 lang 디렉토리에서 가져온 값이기 때문)
  return slugs.map((slug) => getPostBySlug(lang, slug));
}
