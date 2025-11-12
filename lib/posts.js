import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const postsDir = path.join(process.cwd(), 'content', 'posts');

export function getAllSlugs(){
  if (!fs.existsSync(postsDir)) return [];
  return fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

export function getPostBySlug(slug){
  const fullPath = path.join(postsDir, `${slug}.md`);
  const file = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(file);
  const html = marked.parse(content || '');
  return {
    slug,
    ...data,
    contentHtml: html
  };
}

export function getAllPosts(){
  const slugs = getAllSlugs();
  const posts = slugs.map(s => getPostBySlug(s));
  // 최신순 정렬 (datePublished 기준)
  return posts.sort((a,b)=>{
    return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
  });
}

export function getPostsByCategory(category){
  return getAllPosts().filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
}
