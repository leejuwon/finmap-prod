#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = process.cwd();
const SITE_URL = 'https://www.finmaphub.com';
const INPUTS = {
  pages: path.join(ROOT, 'data', 'gsc-pages.csv'),
  queries: path.join(ROOT, 'data', 'gsc-queries.csv'),
  pageQuery: path.join(ROOT, 'data', 'gsc-page-query.csv'),
};
const REPORT_PATH = path.join(ROOT, 'reports', 'gsc-blog-audit.md');
const POSTS_ROOT = path.join(ROOT, 'content', 'posts');

const LOW_IMPRESSION_MAX = 50;
const CTR_REWRITE_IMPRESSIONS = 100;
const LOW_CTR = 0.02;

function readIfExists(file) {
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
}

function parseCsvLine(line) {
  const out = [];
  let current = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      out.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out;
}

function parseCsv(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim().replace(/^\uFEFF/, ''));
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] == null ? '' : cells[i].trim();
    });
    return row;
  });
}

function normalizeHeader(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/^\uFEFF/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pick(row, names) {
  const map = new Map(Object.keys(row || {}).map((k) => [normalizeHeader(k), k]));
  for (const name of names) {
    const key = map.get(normalizeHeader(name));
    if (key) return row[key];
  }
  return '';
}

function toNumber(value) {
  if (value == null || value === '') return 0;
  const cleaned = String(value).replace(/[%,$,\s]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function toCtr(value) {
  if (value == null || value === '') return 0;
  const raw = String(value).trim();
  const n = toNumber(raw);
  if (raw.includes('%')) return n / 100;
  return n > 1 ? n / 100 : n;
}

function normalizePath(raw) {
  if (!raw) return '';
  const value = String(raw).trim();
  try {
    const parsed = /^https?:\/\//i.test(value)
      ? new URL(value)
      : new URL(value, SITE_URL);
    let pathname = parsed.pathname.replace(/\/{2,}/g, '/');
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return pathname || '/';
  } catch {
    return value.split('?')[0].split('#')[0].replace(/\/{2,}/g, '/');
  }
}

function classifyPath(pagePath) {
  const p = normalizePath(pagePath);
  const lang = p === '/en' || p.startsWith('/en/') ? 'en' : 'ko';

  let type = 'other';
  let category = '';
  let slug = '';

  let m = p.match(/^\/posts\/([^/]+)\/([^/]+)$/);
  if (m) {
    type = 'blog';
    category = m[1];
    slug = m[2];
  }

  m = p.match(/^\/en\/posts\/([^/]+)\/([^/]+)$/);
  if (m) {
    type = 'blog';
    category = m[1];
    slug = m[2];
  }

  m = p.match(/^\/(?:en\/)?tools(?:\/([^/]+))?$/);
  if (m) {
    type = 'tool';
    category = 'tools';
    slug = m[1] || 'index';
  }

  return { path: p, type, lang, category, slug };
}

function rowToMetric(row) {
  const page = pick(row, ['Top pages', 'Page', 'Pages', 'Landing page', 'URL']);
  const query = pick(row, ['Queries', 'Query', 'Top queries']);
  const clicks = toNumber(pick(row, ['Clicks']));
  const impressions = toNumber(pick(row, ['Impressions']));
  const ctr = toCtr(pick(row, ['CTR']));
  const position = toNumber(pick(row, ['Position', 'Average position']));
  return { page, query, clicks, impressions, ctr, position };
}

function readMetrics() {
  const rawPages = readIfExists(INPUTS.pages);
  const rawQueries = readIfExists(INPUTS.queries);
  const rawPageQuery = readIfExists(INPUTS.pageQuery);
  return {
    pageRows: rawPages ? parseCsv(rawPages).map(rowToMetric) : [],
    queryRows: rawQueries ? parseCsv(rawQueries).map(rowToMetric) : [],
    pageQueryRows: rawPageQuery ? parseCsv(rawPageQuery).map(rowToMetric) : [],
    found: {
      pages: Boolean(rawPages),
      queries: Boolean(rawQueries),
      pageQuery: Boolean(rawPageQuery),
    },
  };
}

function aggregatePages(pageRows, pageQueryRows) {
  const byPage = new Map();

  function add(row) {
    if (!row.page) return;
    const info = classifyPath(row.page);
    if (info.type !== 'blog' && info.type !== 'tool') return;
    const current = byPage.get(info.path) || {
      ...info,
      clicks: 0,
      impressions: 0,
      weightedPosition: 0,
      rowCount: 0,
    };
    current.clicks += row.clicks;
    current.impressions += row.impressions;
    current.weightedPosition += (row.position || 0) * Math.max(1, row.impressions);
    current.rowCount += 1;
    byPage.set(info.path, current);
  }

  if (pageRows.length) pageRows.forEach(add);
  else pageQueryRows.forEach(add);

  return Array.from(byPage.values()).map((p) => ({
    ...p,
    ctr: p.impressions > 0 ? p.clicks / p.impressions : 0,
    position: p.impressions > 0 ? p.weightedPosition / Math.max(1, p.impressions) : 0,
  }));
}

function classifyPerformance(page) {
  const groups = [];
  if (page.impressions < LOW_IMPRESSION_MAX) groups.push('LOW_IMPRESSION');
  if (page.impressions >= CTR_REWRITE_IMPRESSIONS && page.ctr < LOW_CTR) groups.push('LOW_CTR');
  if (page.position > 20) groups.push('LOW_POSITION');
  if (page.impressions >= LOW_IMPRESSION_MAX && page.clicks <= 1) groups.push('GOOD_IMPRESSION_NO_CLICK');
  if (page.clicks >= 5 && page.ctr >= 0.04 && page.position <= 12) groups.push('WINNER');
  if (!groups.length) groups.push('WATCH');

  const priority =
    Math.min(50, Math.log10(page.impressions + 1) * 18)
    + (page.impressions >= 100 && page.clicks <= 1 ? 30 : 0)
    + (page.position >= 5 && page.position <= 20 ? 25 : 0)
    + (page.ctr < LOW_CTR && page.impressions >= CTR_REWRITE_IMPRESSIONS ? 20 : 0)
    + (page.type === 'blog' ? 5 : 0);

  return { groups, primaryGroup: groups[0], priority: Math.round(priority) };
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkDir(full) : [full];
  });
}

function stripMarkdown(content) {
  return String(content || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+\]\([^)]+\)/g, ' ')
    .replace(/[#>*_`~|:-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readLocalPosts() {
  const files = walkDir(POSTS_ROOT).filter((file) => file.endsWith('.md'));
  return files.map((file) => {
    const rel = path.relative(POSTS_ROOT, file).replace(/\\/g, '/');
    const [category, lang, filename] = rel.split('/');
    const slug = filename.replace(/\.md$/, '');
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    const text = stripMarkdown(content);
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const contentH1 = (content.match(/^#\s+(.+)$/m) || [])[1] || '';
    const tools = []
      .concat(data.tools || data.tool || [])
      .filter(Boolean)
      .map((v) => String(v).trim());
    const renderedTitle = data.seoTitle || data.title || '';
    const renderedDesc = data.seoDescription || data.description || '';
    const h1 = contentH1 || renderedTitle;
    const url = `${lang === 'en' ? '/en' : ''}/posts/${category}/${slug}`;
    const flags = [];
    if (!renderedTitle) flags.push('missing_title');
    if (!renderedDesc) flags.push('missing_description');
    if (!h1) flags.push('missing_h1');
    if (renderedTitle.length > 70) flags.push('title_too_long');
    if (renderedTitle.length < 18) flags.push('title_too_short');
    if (renderedDesc.length > 170) flags.push('description_too_long');
    if (renderedDesc.length < 80) flags.push('description_too_short');
    if (words < 900) flags.push('thin_content');
    if (!tools.length) flags.push('no_tool_link');

    return {
      file: path.relative(ROOT, file).replace(/\\/g, '/'),
      url,
      category,
      lang,
      slug,
      title: renderedTitle,
      description: renderedDesc,
      h1,
      words,
      tools,
      flags,
      datePublished: data.datePublished || '',
      dateModified: data.dateModified || data.datePublished || '',
    };
  });
}

function mergeLocal(pages, localPosts) {
  const map = new Map(localPosts.map((p) => [p.url, p]));
  return pages.map((page) => {
    const local = map.get(page.path) || null;
    return {
      ...page,
      local,
      ...classifyPerformance(page),
    };
  });
}

function summarizeBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item) || 'unknown';
    const v = map.get(key) || { key, pages: 0, clicks: 0, impressions: 0, weightedPosition: 0 };
    v.pages += 1;
    v.clicks += item.clicks || 0;
    v.impressions += item.impressions || 0;
    v.weightedPosition += (item.position || 0) * Math.max(1, item.impressions || 0);
    map.set(key, v);
  }
  return Array.from(map.values()).map((v) => ({
    ...v,
    ctr: v.impressions ? v.clicks / v.impressions : 0,
    position: v.impressions ? v.weightedPosition / Math.max(1, v.impressions) : 0,
  })).sort((a, b) => b.impressions - a.impressions);
}

function formatPct(v) {
  return `${((v || 0) * 100).toFixed(2)}%`;
}

function formatNum(v) {
  return Math.round(v || 0).toLocaleString('en-US');
}

function mdTable(headers, rows) {
  if (!rows.length) return '_No rows._\n';
  const escapeCell = (v) => String(v == null ? '' : v).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [
    `| ${headers.map(escapeCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`),
  ].join('\n') + '\n';
}

function buildPageQueryOpportunities(rows) {
  return rows
    .map((row) => ({ ...row, info: classifyPath(row.page) }))
    .filter((row) => (row.info.type === 'blog' || row.info.type === 'tool') && row.query)
    .map((row) => ({
      ...row,
      score:
        Math.min(50, Math.log10(row.impressions + 1) * 18)
        + (row.clicks <= 1 ? 20 : 0)
        + (row.position >= 5 && row.position <= 20 ? 25 : 0)
        + (row.ctr < LOW_CTR ? 15 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
}

function localPriorityFallback(localPosts) {
  return [...localPosts]
    .map((p) => {
      const score =
        (p.flags.includes('thin_content') ? 25 : 0)
        + (p.flags.includes('title_too_long') || p.flags.includes('title_too_short') ? 20 : 0)
        + (p.flags.includes('description_too_long') || p.flags.includes('description_too_short') ? 15 : 0)
        + (p.tools.length ? 20 : 0)
        + (p.lang === 'en' ? 8 : 0);
      return { ...p, localScore: score };
    })
    .sort((a, b) => b.localScore - a.localScore || a.words - b.words)
    .slice(0, 20);
}

function buildReport({ found, pages, localPosts, pageQueryRows }) {
  const hasCsv = found.pages || found.pageQuery || found.queries;
  const now = new Date().toISOString();
  const localByUrl = new Map(localPosts.map((p) => [p.url, p]));
  const priorityPages = pages
    .filter((p) => p.primaryGroup !== 'WINNER')
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 30);

  const titleRewrite = pages
    .filter((p) => p.groups.includes('LOW_CTR') || p.groups.includes('GOOD_IMPRESSION_NO_CLICK'))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 20);

  const contentExpansion = pages
    .filter((p) => p.groups.includes('LOW_POSITION') || p.local?.flags.includes('thin_content'))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 20);

  const internalLinks = pages
    .filter((p) => p.groups.includes('LOW_IMPRESSION') || p.local?.flags.includes('no_tool_link'))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 20);

  const indexCheck = pages
    .filter((p) => !localByUrl.has(p.path) && p.type === 'blog')
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);

  const opportunities = buildPageQueryOpportunities(pageQueryRows);
  const fallback = localPriorityFallback(localPosts);
  const byLang = summarizeBy(pages, (p) => `${p.type}:${p.lang}`);
  const byCategory = summarizeBy(pages.filter((p) => p.type === 'blog'), (p) => `${p.lang}/${p.category}`);
  const groups = new Map();
  for (const page of pages) {
    for (const group of page.groups) groups.set(group, (groups.get(group) || 0) + 1);
  }

  const lines = [];
  lines.push('# GSC Blog Audit');
  lines.push('');
  lines.push(`Generated: ${now}`);
  lines.push('');
  lines.push('## Input status');
  lines.push('');
  lines.push(`- data/gsc-pages.csv: ${found.pages ? 'found' : 'missing'}`);
  lines.push(`- data/gsc-queries.csv: ${found.queries ? 'found' : 'missing'}`);
  lines.push(`- data/gsc-page-query.csv: ${found.pageQuery ? 'found' : 'missing'}`);
  lines.push(`- Local posts scanned: ${localPosts.length}`);
  lines.push('');
  if (!hasCsv) {
    lines.push('No GSC CSV was found, so this report uses local content metadata as a fallback. Export GSC Performance CSV files into `data/` and rerun `node scripts/gsc-blog-audit.js` for click/impression-based priorities.');
    lines.push('');
  }

  lines.push('## Performance groups');
  lines.push('');
  lines.push(mdTable(['Group', 'Pages'], Array.from(groups.entries()).sort().map(([k, v]) => [k, v])));

  lines.push('## Summary by language/type');
  lines.push('');
  lines.push(mdTable(
    ['Group', 'Pages', 'Clicks', 'Impressions', 'CTR', 'Avg position'],
    byLang.map((r) => [r.key, r.pages, formatNum(r.clicks), formatNum(r.impressions), formatPct(r.ctr), r.position.toFixed(1)])
  ));

  lines.push('## Summary by blog category');
  lines.push('');
  lines.push(mdTable(
    ['Category', 'Pages', 'Clicks', 'Impressions', 'CTR', 'Avg position'],
    byCategory.map((r) => [r.key, r.pages, formatNum(r.clicks), formatNum(r.impressions), formatPct(r.ctr), r.position.toFixed(1)])
  ));

  lines.push('## Improvement priority');
  lines.push('');
  lines.push(mdTable(
    ['Priority', 'Group', 'URL', 'Clicks', 'Impressions', 'CTR', 'Position', 'Local flags'],
    priorityPages.map((p) => [
      p.priority,
      p.groups.join(', '),
      p.path,
      formatNum(p.clicks),
      formatNum(p.impressions),
      formatPct(p.ctr),
      p.position.toFixed(1),
      p.local?.flags.join(', ') || '',
    ])
  ));

  lines.push('## Pages needing title rewrite');
  lines.push('');
  lines.push(mdTable(
    ['URL', 'Clicks', 'Impressions', 'CTR', 'Position', 'Current title'],
    titleRewrite.map((p) => [
      p.path,
      formatNum(p.clicks),
      formatNum(p.impressions),
      formatPct(p.ctr),
      p.position.toFixed(1),
      p.local?.title || '',
    ])
  ));

  lines.push('## Pages needing content expansion');
  lines.push('');
  lines.push(mdTable(
    ['URL', 'Position', 'Words', 'Tools', 'Flags'],
    contentExpansion.map((p) => [
      p.path,
      p.position.toFixed(1),
      p.local?.words || '',
      p.local?.tools.join(', ') || '',
      p.local?.flags.join(', ') || '',
    ])
  ));

  lines.push('## Pages needing internal links');
  lines.push('');
  lines.push(mdTable(
    ['URL', 'Group', 'Impressions', 'Tools', 'Flags'],
    internalLinks.map((p) => [
      p.path,
      p.groups.join(', '),
      formatNum(p.impressions),
      p.local?.tools.join(', ') || '',
      p.local?.flags.join(', ') || '',
    ])
  ));

  lines.push('## Pages needing index/canonical check');
  lines.push('');
  lines.push(mdTable(
    ['URL', 'Clicks', 'Impressions', 'Reason'],
    indexCheck.map((p) => [p.path, formatNum(p.clicks), formatNum(p.impressions), 'GSC URL has no matching local post file'])
  ));

  lines.push('## Top query opportunities');
  lines.push('');
  lines.push(mdTable(
    ['Score', 'Query', 'URL', 'Clicks', 'Impressions', 'CTR', 'Position'],
    opportunities.map((o) => [
      Math.round(o.score),
      o.query,
      classifyPath(o.page).path,
      formatNum(o.clicks),
      formatNum(o.impressions),
      formatPct(o.ctr),
      o.position.toFixed(1),
    ])
  ));

  lines.push('## Local metadata fallback priorities');
  lines.push('');
  lines.push(mdTable(
    ['Score', 'URL', 'Lang', 'Words', 'Tools', 'Flags', 'Title'],
    fallback.map((p) => [p.localScore, p.url, p.lang, p.words, p.tools.join(', '), p.flags.join(', '), p.title])
  ));

  lines.push('## Title and description rewrite rules');
  lines.push('');
  lines.push('- Korean titles should answer a concrete search problem, use numbers/comparisons/checklists when natural, and avoid abstract labels such as only "복리란?".');
  lines.push('- English titles should be written for English search behavior, using terms such as calculator, simulator, monthly investment, CAGR, DCA, retirement, and guide only when they match the article.');
  lines.push('- Meta descriptions should usually stay around 110-160 characters, state the outcome the reader gets, and mention the calculator/tool when the article connects to one.');
  lines.push('- Avoid repeating the same description template across posts. Treat title, h1, intro, and description as one coherent promise.');
  lines.push('');

  lines.push('## Recommended content structure');
  lines.push('');
  lines.push('1. Two to three sentence answer-first summary.');
  lines.push('2. Formula or concept box.');
  lines.push('3. Practical example with assumptions.');
  lines.push('4. One or two compact tables.');
  lines.push('5. Common mistakes.');
  lines.push('6. Related calculator/tool links.');
  lines.push('7. Three to five related posts.');
  lines.push('8. Three to five FAQ items when the visible article has matching FAQ content.');
  lines.push('9. Article JSON-LD and FAQPage JSON-LD only when the FAQ is visible.');
  lines.push('');

  lines.push('## Measurement note');
  lines.push('');
  lines.push('The current view counter can show page popularity, but it is not enough to diagnose search quality. For privacy-safe internal measurement, add an event table with `page_path`, `canonical_path`, `lang`, `slug`, `category`, `referrer_origin`, `utm_source`, `utm_medium`, `created_at`, and an optional salted session/user-agent hash. Do not store raw IP addresses.');
  lines.push('');

  return lines.join('\n');
}

function main() {
  const metrics = readMetrics();
  const localPosts = readLocalPosts();
  const pages = mergeLocal(aggregatePages(metrics.pageRows, metrics.pageQueryRows), localPosts);
  const report = buildReport({
    found: metrics.found,
    pages,
    localPosts,
    pageQueryRows: metrics.pageQueryRows,
  });

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, 'utf8');

  console.log(`Wrote ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`GSC pages analyzed: ${pages.length}`);
  console.log(`Local posts scanned: ${localPosts.length}`);
  if (!metrics.found.pages && !metrics.found.pageQuery) {
    console.log('No page-level GSC CSV found. Local metadata fallback was used.');
  }
}

main();
