#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { XMLParser } = require('fast-xml-parser');

try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), quiet: true });
  require('dotenv').config({ path: path.join(process.cwd(), '.env.production'), quiet: true });
} catch {
  // dotenv is optional. Never print env values from this audit script.
}

const PUBLIC_SITE_URL = 'https://www.finmaphub.com';
const DEFAULT_REPORT_PATH = path.join(
  process.cwd(),
  'reports',
  'naver-index-exclusion-audit-20260616.md'
);
const MAX_REDIRECTS = Number(process.env.NAVER_AUDIT_MAX_REDIRECTS || 8);
const TIMEOUT_MS = Number(process.env.NAVER_AUDIT_TIMEOUT_MS || 15000);
const CONCURRENCY = Math.max(1, Number(getArg('concurrency') || process.env.NAVER_AUDIT_CONCURRENCY || 4));
const EMPTY_BODY_THRESHOLD = Number(process.env.NAVER_AUDIT_EMPTY_BODY_THRESHOLD || 200);
const USER_AGENT = process.env.NAVER_AUDIT_USER_AGENT
  || 'Finmap-Naver-Indexability-Audit/1.0 (+https://www.finmaphub.com)';

const BASE_URL = trimTrailingSlash(getArg('base') || process.env.NAVER_AUDIT_BASE_URL || PUBLIC_SITE_URL);
const REPORT_PATH = getArg('report') || process.env.NAVER_AUDIT_REPORT || DEFAULT_REPORT_PATH;
const LIMIT = Math.max(0, Number(getArg('limit') || process.env.NAVER_AUDIT_LIMIT || 0));

const MANUAL_URLS = [
  '/',
  '/en',
  '/ko',
  '/en/en',
  '/en/en/tools',
  '/market',
  '/en/market',
  '/market/indices',
  '/en/market/indices',
  '/market/real-estate',
  '/en/market/real-estate',
  '/market/real-estate?sido=11&top=100&metric=median_price',
  '/market/real-estate?priceMetric=median_price&priceMin=2.28&priceMax=2.57',
  '/en/market/real-estate?sido=11&top=100',
  '/market/real-estate/apt/[aptKey]',
  '/en/market/real-estate/apt/[aptKey]',
  '/market/real-estate/seoul-apartment-top100',
  '/market/real-estate/gyeonggi-apartment-top100',
  '/market/real-estate/incheon-apartment-top100',
  '/market/real-estate/seoul-top100',
  '/en/market/real-estate/seoul-top100',
  '/tools',
  '/en/tools',
  '/tools/dca-calculator',
  '/tools/dca-calculator?utm_source=naver-audit',
  '/en/tools/dca-calculator',
  '/category/personalFinance',
  '/en/category/personalFinance',
  '/posts/personalFinance/how-much-per-month-for-100m',
  '/en/posts/personalFinance/how-much-per-month-for-100m',
  '/posts/personalFinance/en/monthly-investment',
  '/posts/personalFinance/ko/personal-finance-3pillars',
  '/posts/economics-inflation-basics',
  '/posts/compound-interest',
  '/api/market/summary',
];

if (process.env.NAVER_AUDIT_APT_SAMPLE_KEY) {
  const key = encodeURIComponent(process.env.NAVER_AUDIT_APT_SAMPLE_KEY);
  MANUAL_URLS.push(
    `/market/real-estate/apt/${key}`,
    `/market/real-estate/apt/${key}?period=202501&band=all`,
    `/en/market/real-estate/apt/${key}?period=202501&band=all`
  );
}

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : '';
}

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function mdEscape(value) {
  return String(value == null || value === '' ? '-' : value)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function short(value, max = 120) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function absolutePublicUrl(input) {
  return new URL(String(input || '/'), PUBLIC_SITE_URL).toString();
}

function rewriteToBase(publicUrl) {
  const target = new URL(publicUrl, PUBLIC_SITE_URL);
  const base = new URL(BASE_URL);
  return `${base.origin}${target.pathname}${target.search}${target.hash}`;
}

function displayUrl(url) {
  const parsed = new URL(url, PUBLIC_SITE_URL);
  const base = new URL(BASE_URL);
  if (parsed.origin === base.origin) {
    return `${PUBLIC_SITE_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
  }
  return parsed.toString();
}

function comparableUrl(value) {
  const parsed = new URL(value, PUBLIC_SITE_URL);
  parsed.hash = '';
  if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  return `${parsed.origin}${parsed.pathname}${parsed.search}`;
}

function isHtml(contentType, text) {
  return /text\/html|application\/xhtml\+xml/i.test(contentType || '')
    || /<html[\s>]/i.test(text || '')
    || /<head[\s>]/i.test(text || '');
}

function getAttr(tag, attr) {
  const re = new RegExp(`${attr}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  const match = String(tag || '').match(re);
  return match ? match[2].trim() : '';
}

function extractXmlLocs(xml) {
  const text = String(xml || '').trim();
  if (!text) return { sitemapLocs: [], pageLocs: [], rssLinks: [] };

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    trimValues: true,
  });

  try {
    const parsed = parser.parse(text);
    const sitemapLocs = asArray(parsed?.sitemapindex?.sitemap)
      .map((item) => item?.loc)
      .filter(Boolean);
    const pageLocs = asArray(parsed?.urlset?.url)
      .map((item) => item?.loc)
      .filter(Boolean);
    const rssLinks = asArray(parsed?.rss?.channel?.item)
      .map((item) => item?.link || item?.guid?.['#text'] || item?.guid)
      .filter(Boolean);
    return { sitemapLocs, pageLocs, rssLinks };
  } catch (error) {
    console.warn(`[audit] XML parse failed: ${error.message}`);
    return { sitemapLocs: [], pageLocs: [], rssLinks: [] };
  }
}

function readLocalXml(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf8');
}

function collectLocalSitemapTargets() {
  const sitemapXml = readLocalXml(path.join('public', 'sitemap.xml'));
  const childXml = readLocalXml(path.join('public', 'sitemap-0.xml'));
  const indexParsed = extractXmlLocs(sitemapXml);
  const childParsed = extractXmlLocs(childXml);

  return {
    sitemapIndexChildren: indexParsed.sitemapLocs.map(absolutePublicUrl),
    sitemapPageUrls: childParsed.pageLocs.map(absolutePublicUrl),
  };
}

async function fetchManual(requestUrl, accept = 'text/html,application/xhtml+xml,application/xml,text/xml,*/*') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(requestUrl, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        accept,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTextFollow(publicUrl, accept) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const requestUrl = rewriteToBase(publicUrl);
    const response = await fetch(requestUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        accept,
      },
    });
    return {
      ok: response.ok,
      status: response.status,
      url: displayUrl(response.url),
      contentType: response.headers.get('content-type') || '',
      text: await response.text().catch(() => ''),
    };
  } finally {
    clearTimeout(timer);
  }
}

function inspectHtml(html) {
  const $ = cheerio.load(html || '');
  const canonical = $('link[rel~="canonical"]').first().attr('href') || '';
  const metaRobots = $('meta[name="robots" i]').first().attr('content') || '';
  const metaGooglebot = $('meta[name="googlebot" i]').first().attr('content') || '';
  const title = $('title').first().text().trim();
  const description = $('meta[name="description" i]').first().attr('content') || '';
  const h1 = $('h1').first().text().trim();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const hreflangs = [];
  $('link[rel~="alternate"][hreflang]').each((_, el) => {
    hreflangs.push({
      hreflang: String($(el).attr('hreflang') || '').trim(),
      href: String($(el).attr('href') || '').trim(),
    });
  });

  return {
    canonical,
    metaRobots,
    metaGooglebot,
    title,
    description,
    h1,
    bodyLength: bodyText.length,
    hreflangs,
  };
}

function classifyBase(result) {
  const classes = [];
  const status = Number(result.statusCode || 0);
  const robotsText = `${result.metaRobots},${result.metaGooglebot}`.toLowerCase();
  const xRobotsText = String(result.xRobotsTag || '').toLowerCase();
  const hasMetaNoindex = robotsText.includes('noindex');
  const hasXNoindex = xRobotsText.includes('noindex');
  const isPage = result.kind === 'page';
  const is2xx = status >= 200 && status < 300;

  if (result.redirectChain.length) classes.push('REDIRECT');
  if (status >= 400 || status === 0) classes.push('HTTP_ERROR');
  if (hasXNoindex) classes.push('X_ROBOTS_NOINDEX');
  if (hasMetaNoindex) classes.push('NOINDEX');
  if (result.sources.includes('sitemap') && (hasMetaNoindex || hasXNoindex)) {
    classes.push('SITEMAP_NOINDEX_MISMATCH');
  }
  if (isPage && is2xx && result.isHtml && result.bodyLength < EMPTY_BODY_THRESHOLD) {
    classes.push('EMPTY_BODY');
  }
  if (isPage && is2xx && result.canonical && !result.canonicalMatches) {
    classes.push('CANONICAL_MISMATCH');
  }
  if (
    isPage
    && is2xx
    && result.isHtml
    && !classes.some((item) => [
      'HTTP_ERROR',
      'X_ROBOTS_NOINDEX',
      'NOINDEX',
      'SITEMAP_NOINDEX_MISMATCH',
      'EMPTY_BODY',
      'CANONICAL_MISMATCH',
      'REDIRECT',
    ].includes(item))
  ) {
    classes.push('INDEXABLE');
  }

  result.classes = Array.from(new Set(classes));
}

async function inspectUrl(target) {
  const inputPublicUrl = absolutePublicUrl(target.url);
  let currentDisplayUrl = inputPublicUrl;
  let currentRequestUrl = rewriteToBase(currentDisplayUrl);
  const redirectChain = [];

  for (let hop = 0; hop < MAX_REDIRECTS; hop += 1) {
    const response = await fetchManual(currentRequestUrl, target.accept);
    const status = response.status;
    const xRobotsTag = response.headers.get('x-robots-tag') || '';

    if (status >= 300 && status < 400) {
      const location = response.headers.get('location') || '';
      const nextRequestUrl = location ? new URL(location, currentRequestUrl).toString() : '';
      const nextDisplayUrl = nextRequestUrl ? displayUrl(nextRequestUrl) : '';
      redirectChain.push({
        status,
        from: currentDisplayUrl,
        to: nextDisplayUrl,
        xRobotsTag,
      });
      if (!nextDisplayUrl) break;
      currentDisplayUrl = nextDisplayUrl;
      currentRequestUrl = rewriteToBase(currentDisplayUrl);
      continue;
    }

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text().catch(() => '');
    const htmlLike = isHtml(contentType, text);
    const meta = htmlLike ? inspectHtml(text) : {
      canonical: '',
      metaRobots: '',
      metaGooglebot: '',
      title: '',
      description: '',
      h1: '',
      bodyLength: String(text || '').trim().length,
      hreflangs: [],
    };

    const result = {
      kind: target.kind || 'page',
      sources: target.sources || [],
      inputUrl: inputPublicUrl,
      statusCode: status,
      redirectChain,
      finalUrl: currentDisplayUrl,
      contentType,
      isHtml: htmlLike,
      xRobotsTag,
      canonical: meta.canonical,
      canonicalMatches: meta.canonical
        ? comparableUrl(meta.canonical) === comparableUrl(currentDisplayUrl)
        : false,
      metaRobots: meta.metaRobots,
      metaGooglebot: meta.metaGooglebot,
      title: meta.title,
      description: meta.description,
      h1: meta.h1,
      bodyLength: meta.bodyLength,
      hreflangs: meta.hreflangs,
      classes: [],
      error: '',
    };
    classifyBase(result);
    return result;
  }

  const result = {
    kind: target.kind || 'page',
    sources: target.sources || [],
    inputUrl: inputPublicUrl,
    statusCode: 0,
    redirectChain,
    finalUrl: currentDisplayUrl,
    contentType: '',
    isHtml: false,
    xRobotsTag: '',
    canonical: '',
    canonicalMatches: false,
    metaRobots: '',
    metaGooglebot: '',
    title: '',
    description: '',
    h1: '',
    bodyLength: 0,
    hreflangs: [],
    classes: ['HTTP_ERROR'],
    error: 'redirect limit reached',
  };
  classifyBase(result);
  return result;
}

function addDuplicateCanonicalClasses(results) {
  const byCanonical = new Map();
  for (const result of results) {
    if (result.kind !== 'page') continue;
    if (!result.isHtml || !result.canonical) continue;
    if (Number(result.statusCode) < 200 || Number(result.statusCode) >= 300) continue;

    const key = comparableUrl(result.canonical);
    if (!byCanonical.has(key)) byCanonical.set(key, []);
    byCanonical.get(key).push(result);
  }

  for (const group of byCanonical.values()) {
    const finals = new Set(group.map((item) => comparableUrl(item.finalUrl)));
    if (finals.size <= 1) continue;
    for (const item of group) {
      if (!item.classes.includes('DUPLICATE_CANONICAL')) {
        item.classes.push('DUPLICATE_CANONICAL');
      }
      item.classes = item.classes.filter((klass) => klass !== 'INDEXABLE');
    }
  }
}

function chainText(chain) {
  if (!chain.length) return '-';
  return chain
    .map((hop) => `${hop.status} ${new URL(hop.from).pathname}${new URL(hop.from).search} -> ${new URL(hop.to).pathname}${new URL(hop.to).search}`)
    .join('<br>');
}

function sourceText(sources) {
  return Array.from(new Set(sources || [])).join(', ') || '-';
}

function classCounts(results) {
  const counts = new Map();
  for (const result of results) {
    for (const klass of result.classes || []) {
      counts.set(klass, (counts.get(klass) || 0) + 1);
    }
  }
  return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function rowsForClass(results, klass) {
  return results.filter((result) => (result.classes || []).includes(klass));
}

function buildIssueTable(lines, title, rows, maxRows = 40) {
  lines.push(`## ${title}`);
  lines.push('');
  if (!rows.length) {
    lines.push('- None found.');
    lines.push('');
    return;
  }
  lines.push('| URL | Status | Sources | Final URL | Canonical | Robots | X-Robots-Tag | Classes |');
  lines.push('| --- | ---: | --- | --- | --- | --- | --- | --- |');
  for (const row of rows.slice(0, maxRows)) {
    lines.push([
      mdEscape(row.inputUrl),
      row.statusCode,
      mdEscape(sourceText(row.sources)),
      mdEscape(row.finalUrl),
      mdEscape(row.canonical),
      mdEscape([row.metaRobots, row.metaGooglebot].filter(Boolean).join(' / ')),
      mdEscape(row.xRobotsTag),
      mdEscape(row.classes.join(', ')),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  if (rows.length > maxRows) {
    lines.push(`- Omitted ${rows.length - maxRows} additional rows from this section.`);
  }
  lines.push('');
}

function buildReport({ results, sourceResults, sitemapPageUrls, rssUrls, manualUrls, rssFetch }) {
  const lines = [];
  const generatedAt = new Date().toISOString();
  const allPageResults = results.filter((result) => result.kind === 'page');

  lines.push('# Naver Index Exclusion Technical Audit');
  lines.push('');
  lines.push(`- Generated at: ${generatedAt}`);
  lines.push(`- Public site URL: ${PUBLIC_SITE_URL}`);
  lines.push(`- HTTP request base: ${BASE_URL}`);
  lines.push(`- Sitemap page URLs from local public/sitemap-0.xml: ${sitemapPageUrls.length}`);
  lines.push(`- RSS item URLs fetched from /rss.xml: ${rssUrls.length}`);
  lines.push(`- Manual URLs: ${manualUrls.length}`);
  lines.push(`- Unique page targets checked: ${allPageResults.length}`);
  lines.push(`- Concurrency: ${CONCURRENCY}`);
  lines.push('');

  lines.push('## Classification Summary');
  lines.push('');
  lines.push('| Class | Count |');
  lines.push('| --- | ---: |');
  for (const [klass, count] of classCounts(allPageResults)) {
    lines.push(`| ${klass} | ${count} |`);
  }
  lines.push('');

  lines.push('## Source Document Checks');
  lines.push('');
  lines.push('| Source | Status | Final URL | Content-Type | X-Robots-Tag | Body length | Classes |');
  lines.push('| --- | ---: | --- | --- | --- | ---: | --- |');
  for (const row of sourceResults) {
    lines.push([
      mdEscape(row.inputUrl),
      row.statusCode,
      mdEscape(row.finalUrl),
      mdEscape(row.contentType),
      mdEscape(row.xRobotsTag),
      row.bodyLength,
      mdEscape(row.classes.join(', ')),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  if (rssFetch && !rssFetch.ok) {
    lines.push(`- RSS URL discovery failed with status ${rssFetch.status}; page checks still used sitemap and manual targets.`);
  }
  lines.push('');

  buildIssueTable(lines, 'Sitemap Noindex Mismatches', rowsForClass(allPageResults, 'SITEMAP_NOINDEX_MISMATCH'));
  buildIssueTable(lines, 'X-Robots Noindex', rowsForClass(allPageResults, 'X_ROBOTS_NOINDEX'));
  buildIssueTable(lines, 'Meta Robots Noindex', rowsForClass(allPageResults, 'NOINDEX'));
  buildIssueTable(lines, 'Canonical Mismatches', rowsForClass(allPageResults, 'CANONICAL_MISMATCH'));
  buildIssueTable(lines, 'Duplicate Canonicals', rowsForClass(allPageResults, 'DUPLICATE_CANONICAL'));
  buildIssueTable(lines, 'Redirects', rowsForClass(allPageResults, 'REDIRECT'));
  buildIssueTable(lines, 'Empty Body', rowsForClass(allPageResults, 'EMPTY_BODY'));
  buildIssueTable(lines, 'HTTP Errors', rowsForClass(allPageResults, 'HTTP_ERROR'));

  lines.push('## Full Page Result Table');
  lines.push('');
  lines.push('| URL | Status | Sources | Redirect chain | Final URL | Canonical | Meta robots | X-Robots-Tag | Title | Description length | H1 | Body length | Classes |');
  lines.push('| --- | ---: | --- | --- | --- | --- | --- | --- | --- | ---: | --- | ---: | --- |');
  for (const row of allPageResults) {
    lines.push([
      mdEscape(row.inputUrl),
      row.statusCode,
      mdEscape(sourceText(row.sources)),
      mdEscape(chainText(row.redirectChain)),
      mdEscape(row.finalUrl),
      mdEscape(row.canonical),
      mdEscape([row.metaRobots, row.metaGooglebot].filter(Boolean).join(' / ')),
      mdEscape(row.xRobotsTag),
      mdEscape(short(row.title, 90)),
      String(row.description || '').length,
      mdEscape(short(row.h1, 80)),
      row.bodyLength,
      mdEscape(row.classes.join(', ')),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  lines.push('');

  lines.push('## Class Definitions');
  lines.push('');
  lines.push('- `INDEXABLE`: 2xx HTML page with no noindex signal, non-empty body, and self-matching canonical.');
  lines.push('- `NOINDEX`: HTML meta robots or googlebot contains noindex.');
  lines.push('- `X_ROBOTS_NOINDEX`: HTTP `X-Robots-Tag` contains noindex.');
  lines.push('- `REDIRECT`: input URL redirects before the final response.');
  lines.push('- `CANONICAL_MISMATCH`: final HTML canonical differs from final URL.');
  lines.push('- `SITEMAP_NOINDEX_MISMATCH`: sitemap URL resolves with meta or HTTP noindex.');
  lines.push('- `EMPTY_BODY`: HTML body text is below the configured threshold.');
  lines.push('- `DUPLICATE_CANONICAL`: multiple checked URLs declare the same canonical URL.');
  lines.push('- `HTTP_ERROR`: final status is 0, 4xx, or 5xx.');
  lines.push('');

  return lines.join('\n');
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;
  async function runWorker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current], current);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, runWorker);
  await Promise.all(workers);
  return results;
}

function mergeTarget(targets, url, source, kind = 'page', accept) {
  const publicUrl = absolutePublicUrl(url);
  const key = comparableUrl(publicUrl);
  if (!targets.has(key)) {
    targets.set(key, {
      url: publicUrl,
      kind,
      accept,
      sources: [],
    });
  }
  const target = targets.get(key);
  if (!target.sources.includes(source)) target.sources.push(source);
  if (accept && !target.accept) target.accept = accept;
}

async function main() {
  const { sitemapIndexChildren, sitemapPageUrls } = collectLocalSitemapTargets();

  const sourceTargets = [
    { url: '/sitemap.xml', kind: 'source', sources: ['source:sitemap.xml'], accept: 'application/xml,text/xml,*/*' },
    { url: '/sitemap-0.xml', kind: 'source', sources: ['source:sitemap-0.xml'], accept: 'application/xml,text/xml,*/*' },
    { url: '/rss.xml', kind: 'source', sources: ['source:rss.xml'], accept: 'application/rss+xml,application/xml,text/xml,*/*' },
    { url: '/robots.txt', kind: 'source', sources: ['source:robots.txt'], accept: 'text/plain,*/*' },
  ];

  let rssUrls = [];
  let rssFetch = null;
  try {
    rssFetch = await fetchTextFollow(absolutePublicUrl('/rss.xml'), 'application/rss+xml,application/xml,text/xml,*/*');
    rssUrls = extractXmlLocs(rssFetch.text).rssLinks.map(absolutePublicUrl);
  } catch (error) {
    rssFetch = { ok: false, status: 0, error: error.message };
    console.warn(`[audit] RSS discovery failed: ${error.message}`);
  }

  const targets = new Map();
  for (const url of sitemapPageUrls) mergeTarget(targets, url, 'sitemap');
  for (const url of rssUrls) mergeTarget(targets, url, 'rss');
  for (const url of MANUAL_URLS) mergeTarget(targets, url, 'manual');
  for (const url of sitemapIndexChildren) mergeTarget(targets, url, 'manual:sitemap-child', 'source', 'application/xml,text/xml,*/*');

  const pageTargets = Array.from(targets.values()).filter((target) => target.kind === 'page');
  const limitedPageTargets = LIMIT > 0 ? pageTargets.slice(0, LIMIT) : pageTargets;

  console.log(`Naver audit base: ${BASE_URL}`);
  console.log(`Sitemap URLs: ${sitemapPageUrls.length}`);
  console.log(`RSS item URLs: ${rssUrls.length}`);
  console.log(`Manual URLs: ${MANUAL_URLS.length}`);
  console.log(`Page targets: ${limitedPageTargets.length}${LIMIT > 0 ? ` (limit ${LIMIT})` : ''}`);

  const sourceResults = await mapLimit(sourceTargets, Math.min(CONCURRENCY, 2), async (target) => {
    try {
      const result = await inspectUrl(target);
      console.log(`${result.classes.join(',') || 'SOURCE'}\t${result.statusCode}\t${result.inputUrl}`);
      return result;
    } catch (error) {
      return {
        ...target,
        inputUrl: absolutePublicUrl(target.url),
        statusCode: 0,
        redirectChain: [],
        finalUrl: absolutePublicUrl(target.url),
        contentType: '',
        isHtml: false,
        xRobotsTag: '',
        canonical: '',
        canonicalMatches: false,
        metaRobots: '',
        metaGooglebot: '',
        title: '',
        description: '',
        h1: '',
        bodyLength: 0,
        hreflangs: [],
        classes: ['HTTP_ERROR'],
        error: error.message,
      };
    }
  });

  const pageResults = await mapLimit(limitedPageTargets, CONCURRENCY, async (target, idx) => {
    try {
      const result = await inspectUrl(target);
      console.log(`${idx + 1}/${limitedPageTargets.length}\t${result.classes.join(',')}\t${result.statusCode}\t${result.inputUrl}`);
      return result;
    } catch (error) {
      const inputUrl = absolutePublicUrl(target.url);
      const result = {
        kind: 'page',
        sources: target.sources || [],
        inputUrl,
        statusCode: 0,
        redirectChain: [],
        finalUrl: inputUrl,
        contentType: '',
        isHtml: false,
        xRobotsTag: '',
        canonical: '',
        canonicalMatches: false,
        metaRobots: '',
        metaGooglebot: '',
        title: '',
        description: '',
        h1: '',
        bodyLength: 0,
        hreflangs: [],
        classes: ['HTTP_ERROR'],
        error: error.message,
      };
      console.log(`${idx + 1}/${limitedPageTargets.length}\tHTTP_ERROR\t0\t${inputUrl}\t${error.message}`);
      return result;
    }
  });

  addDuplicateCanonicalClasses(pageResults);

  const results = [...sourceResults, ...pageResults];
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(
    REPORT_PATH,
    buildReport({
      results,
      sourceResults,
      sitemapPageUrls,
      rssUrls,
      manualUrls: MANUAL_URLS,
      rssFetch,
    }),
    'utf8'
  );

  console.log(`\nWrote ${REPORT_PATH}`);
  console.log('Class counts:');
  for (const [klass, count] of classCounts(pageResults)) {
    console.log(`  ${klass}: ${count}`);
  }
}

main().catch((error) => {
  console.error(`[audit] fatal: ${error.stack || error.message || error}`);
  process.exitCode = 1;
});
