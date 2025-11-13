// lib/posts.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// content/posts 아래에서 마크다운 파일 읽기
const postsDir = path.join(process.cwd(), 'content', 'posts');

// ✅ cover 경로 정규화(helper)
// - /public/images/...  → /images/...
// - images/aaa.png      → /images/aaa.png
// - http로 시작하면 그대로 사용
function normalizeCover(rawCover) {
  if (!rawCover) return null;
  let c = String(rawCover).trim();
  if (!c) return null;

  // 절대 URL이면 그대로 사용
  if (c.startsWith('http://') || c.startsWith('https://')) {
    return c;
  }

  // /public 접두어 제거
  if (c.startsWith('/public/')) {
    c = c.replace(/^\/public/, '');
  }

  // public 기준 루트 경로로 맞추기
  if (!c.startsWith('/')) {
    c = '/' + c;
  }

  return c;
}

export function getAllSlugs() {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getPostBySlug(slug) {
  const fullPath = path.join(postsDir, `${slug}.md`);
  const file = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(file);
  const html = marked.parse(content || '');

  // front-matter에서 필요한 필드 꺼내고, cover는 정규화
  const cover = normalizeCover(data.cover);

  return {
    slug,
    title: data.title || '',
    description: data.description || '',
    category: data.category || '',
    tags: data.tags || [],
    datePublished: data.datePublished || '',
    dateModified: data.dateModified || data.datePublished || '',
    cover,                 // ✅ 여기서 항상 /images/... 형태
    contentHtml: html,
  };
}

export function getAllPosts() {
  const slugs = getAllSlugs();
  const posts = slugs.map((s) => getPostBySlug(s));
  // 최신순 정렬 (datePublished 기준)
  return posts.sort((a, b) => {
    return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
  });
}

export function getPostsByCategory(category) {
  return getAllPosts().filter(
    (p) => (p.category || '').toLowerCase() === category.toLowerCase()
  );
}
