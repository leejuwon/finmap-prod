const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SITE_URL = 'https://www.finmaphub.com';
const ROOT = process.cwd();
const POSTS_ROOT = path.join(ROOT, 'content', 'posts');

function parseArgs(argv) {
  const args = {
    limit: 20,
    lang: 'all',
    format: 'text',
    since: '',
  };

  for (const arg of argv) {
    if (arg.startsWith('--limit=')) args.limit = Number(arg.slice('--limit='.length)) || args.limit;
    else if (arg.startsWith('--lang=')) args.lang = arg.slice('--lang='.length);
    else if (arg.startsWith('--format=')) args.format = arg.slice('--format='.length);
    else if (arg.startsWith('--since=')) args.since = arg.slice('--since='.length);
  }

  if (!['all', 'ko', 'en'].includes(args.lang)) args.lang = 'all';
  if (!['text', 'json', 'md'].includes(args.format)) args.format = 'text';
  args.limit = Math.max(1, Math.min(Math.floor(args.limit), 500));
  return args;
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDir(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function normalizeDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toISOString();
}

function isNoindex(data) {
  return data?.draft === true || data?.noindex === true || String(data?.robots || '').toLowerCase().includes('noindex');
}

function buildPath({ category, lang, slug }) {
  const prefix = lang === 'en' ? '/en' : '';
  return `${prefix}/posts/${category}/${slug}`;
}

function buildUrl(post) {
  return `${SITE_URL}${buildPath(post)}`;
}

function readPostFile(fullPath) {
  const rel = path.relative(POSTS_ROOT, fullPath).replace(/\\/g, '/');
  const parts = rel.split('/');
  if (parts.length < 3) return null;

  const category = parts[0];
  const lang = parts[1];
  const filename = parts[parts.length - 1];
  const slug = filename.replace(/\.md$/, '');
  if (!category || !['ko', 'en'].includes(lang) || !slug) return null;

  let data = {};
  try {
    data = matter(fs.readFileSync(fullPath, 'utf8')).data || {};
  } catch {
    data = {};
  }

  if (isNoindex(data)) return null;

  const stat = fs.statSync(fullPath);
  const fileModifiedAt = stat.mtime.toISOString();
  const dateModified = normalizeDate(data.dateModified || data.modified || '');
  const datePublished = normalizeDate(data.datePublished || data.date || '');

  return {
    category,
    lang,
    slug,
    path: buildPath({ category, lang, slug }),
    url: buildUrl({ category, lang, slug }),
    file: path.relative(ROOT, fullPath).replace(/\\/g, '/'),
    title: String(data.title || data.seoTitle || slug).trim(),
    datePublished,
    dateModified,
    fileModifiedAt,
    channel: lang === 'ko' ? 'naver-ko' : 'gsc-bing-en',
  };
}

function loadPosts() {
  return walkDir(POSTS_ROOT)
    .filter((file) => file.endsWith('.md'))
    .map(readPostFile)
    .filter(Boolean);
}

function addPairInfo(posts) {
  const byPairKey = new Map();
  for (const post of posts) {
    byPairKey.set(`${post.category}/${post.slug}/${post.lang}`, post);
  }

  return posts.map((post) => {
    const otherLang = post.lang === 'ko' ? 'en' : 'ko';
    const pair = byPairKey.get(`${post.category}/${post.slug}/${otherLang}`);
    return {
      ...post,
      pairLang: otherLang,
      pairExists: !!pair,
      pairUrl: pair ? pair.url : '',
    };
  });
}

function filterPosts(posts, args) {
  let out = posts;
  if (args.lang !== 'all') out = out.filter((post) => post.lang === args.lang);
  if (args.since) {
    const sinceTime = new Date(args.since).getTime();
    if (!Number.isNaN(sinceTime)) {
      out = out.filter((post) => new Date(post.fileModifiedAt).getTime() >= sinceTime);
    }
  }
  return out
    .sort((a, b) => new Date(b.fileModifiedAt).getTime() - new Date(a.fileModifiedAt).getTime())
    .slice(0, args.limit);
}

function printText(posts) {
  for (const post of posts) {
    console.log([
      post.url,
      post.lang,
      post.channel,
      post.category,
      post.slug,
      post.fileModifiedAt,
      post.pairExists ? `pair=${post.pairUrl}` : `pair=missing-${post.pairLang}`,
    ].join('\t'));
  }
}

function printMarkdown(posts) {
  console.log('| URL | Lang | Channel | Category | Slug | File modified | Pair |');
  console.log('| --- | --- | --- | --- | --- | --- | --- |');
  for (const post of posts) {
    console.log(`| ${post.url} | ${post.lang} | ${post.channel} | ${post.category} | ${post.slug} | ${post.fileModifiedAt} | ${post.pairExists ? post.pairUrl : `missing-${post.pairLang}`} |`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const posts = filterPosts(addPairInfo(loadPosts()), args);

  if (args.format === 'json') {
    console.log(JSON.stringify(posts, null, 2));
  } else if (args.format === 'md') {
    printMarkdown(posts);
  } else {
    printText(posts);
  }
}

main();
