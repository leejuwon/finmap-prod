#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { XMLParser } = require('fast-xml-parser');

const SITE = 'https://www.finmaphub.com';
const DEFAULT_OUT = path.join(process.cwd(), 'reports', 'naver-drop-core-url-technical-audit-20260616.md');

const TARGET_PATHS = [
  '/',
  '/posts/investingInfo/usd-krw-weak-won-sector-map-kospi',
  '/tools/cagr-calculator',
  '/posts/personalFinance/what-is-cagr',
  '/posts/personalFinance/dsr-40-income-loan-limit-table',
  '/market/real-estate/magok-top100',
  '/market/real-estate/songpa-top100',
  '/tools/goal-simulator',
  '/posts/personalFinance/compound-return-3-5-7-10-table',
];

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function arrayify(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeAbsoluteUrl(raw) {
  if (!raw) return '';
  try {
    const parsed = new URL(raw, SITE);
    let pathname = parsed.pathname || '/';
    if (pathname === '/ko') pathname = '/';
    else if (pathname.startsWith('/ko/')) pathname = pathname.replace(/^\/ko/, '') || '/';
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return `${parsed.origin}${pathname}${parsed.search || ''}`;
  } catch {
    return String(raw || '').trim();
  }
}

function normalizePath(raw) {
  try {
    const parsed = new URL(raw, SITE);
    let pathname = parsed.pathname || '/';
    if (pathname === '/ko') pathname = '/';
    else if (pathname.startsWith('/ko/')) pathname = pathname.replace(/^\/ko/, '') || '/';
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return `${pathname}${parsed.search || ''}`;
  } catch {
    return String(raw || '').trim();
  }
}

function hasNoindex(value) {
  return /\bnoindex\b/i.test(String(value || ''));
}

async function fetchText(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'FinmapNaverDropAudit/1.0 (+https://www.finmaphub.com)',
      Accept: 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
    },
  });
  return { status: res.status, url: res.url, headers: res.headers, text: await res.text() };
}

async function fetchWithRedirectChain(url, maxRedirects = 10) {
  const chain = [];
  let currentUrl = url;

  for (let i = 0; i <= maxRedirects; i += 1) {
    const res = await fetch(currentUrl, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'FinmapNaverDropAudit/1.0 (+https://www.finmaphub.com)',
        Accept: 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
      },
    });

    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      const nextUrl = new URL(location, currentUrl).toString();
      chain.push({ status: res.status, from: currentUrl, to: nextUrl });
      currentUrl = nextUrl;
      continue;
    }

    return {
      status: res.status,
      requestedUrl: url,
      finalUrl: currentUrl,
      headers: res.headers,
      html: await res.text(),
      redirectChain: chain,
    };
  }

  throw new Error(`Too many redirects for ${url}`);
}

function extractLocsFromXml(xml, baseUrl) {
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const locs = [];
  const sitemapLocs = [];

  for (const item of arrayify(parsed?.sitemapindex?.sitemap)) {
    if (item?.loc) sitemapLocs.push(String(item.loc));
  }

  for (const item of arrayify(parsed?.urlset?.url)) {
    if (item?.loc) locs.push(String(item.loc));
  }

  return {
    locs: locs.map((loc) => new URL(loc, baseUrl).toString()),
    sitemapLocs: sitemapLocs.map((loc) => new URL(loc, baseUrl).toString()),
  };
}

async function loadSitemapSet(site) {
  const root = `${site}/sitemap.xml`;
  const seen = new Set();
  const locs = new Set();
  const queue = [root];

  while (queue.length) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);

    const res = await fetchText(url);
    if (res.status >= 400) continue;
    const extracted = extractLocsFromXml(res.text, url);
    extracted.locs.forEach((loc) => locs.add(normalizeAbsoluteUrl(loc)));
    extracted.sitemapLocs.forEach((loc) => {
      if (!seen.has(loc)) queue.push(loc);
    });
  }

  return { locs, filesChecked: Array.from(seen) };
}

function collectRssLinks(xml, rssUrl) {
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const links = new Set();
  const items = arrayify(parsed?.rss?.channel?.item);

  for (const item of items) {
    if (item?.link) links.add(normalizeAbsoluteUrl(new URL(String(item.link), rssUrl).toString()));
    if (typeof item?.guid === 'string' && /^https?:\/\//i.test(item.guid)) {
      links.add(normalizeAbsoluteUrl(item.guid));
    }
  }

  return links;
}

async function loadRssSet(site) {
  const rssUrl = `${site}/rss.xml`;
  const res = await fetchText(rssUrl);
  if (res.status >= 400) return { links: new Set(), status: res.status };
  return { links: collectRssLinks(res.text, rssUrl), status: res.status };
}

function parseHtml(html) {
  const $ = cheerio.load(html || '');
  $('script, style, noscript, svg').remove();

  const title = $('title').first().text().trim();
  const description = $('meta[name="description"]').first().attr('content') || '';
  const canonical = $('link[rel="canonical"]').first().attr('href') || '';
  const robots = [
    $('meta[name="robots"]').first().attr('content') || '',
    $('meta[name="googlebot"]').first().attr('content') || '',
  ].filter(Boolean).join(' / ');
  const ogUrl = $('meta[property="og:url"]').first().attr('content') || '';
  const h1Texts = $('h1')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter(Boolean);
  const hreflangs = {};
  $('link[rel="alternate"][hreflang], link[rel="alternate"][hrefLang]').each((_, el) => {
    const hreflang = $(el).attr('hreflang') || $(el).attr('hrefLang');
    const href = $(el).attr('href') || '';
    if (hreflang) hreflangs[String(hreflang).toLowerCase()] = href;
  });
  const bodyTextLength = $('body').text().replace(/\s+/g, ' ').trim().length;

  return {
    title,
    description,
    canonical,
    robots,
    ogUrl,
    h1Count: h1Texts.length,
    h1Texts,
    bodyTextLength,
    hreflangKo: hreflangs.ko || '',
    hreflangEn: hreflangs.en || '',
  };
}

function classify(record) {
  const classes = [];
  if (record.fetchError || record.status >= 400 || record.status === 0) classes.push('HTTP_ERROR');
  if (record.redirectChain.length > 0) classes.push('REDIRECT');
  if (record.selfCanonical === false) classes.push('CANONICAL_MISMATCH');
  if (hasNoindex(record.metaRobots)) classes.push('NOINDEX');
  if (hasNoindex(record.xRobotsTag)) classes.push('X_ROBOTS_NOINDEX');
  if (!record.title) classes.push('MISSING_TITLE');
  if (!record.description) classes.push('MISSING_DESCRIPTION');
  if (record.h1Count !== 1) classes.push('H1_PROBLEM');
  if (record.bodyTextLength > 0 && record.bodyTextLength < 300) classes.push('SHORT_BODY');
  if (!record.sitemapIncluded) classes.push('SITEMAP_MISSING');
  return classes.length ? classes : ['OK'];
}

async function auditUrl(site, pathName, sitemapSet, rssSet) {
  const targetUrl = new URL(pathName, site).toString();
  const baseRecord = {
    path: pathName,
    requestedUrl: targetUrl,
    status: 0,
    finalUrl: '',
    redirectChain: [],
    canonical: '',
    selfCanonical: null,
    metaRobots: '',
    xRobotsTag: '',
    title: '',
    description: '',
    h1Count: 0,
    h1Texts: [],
    bodyTextLength: 0,
    ogUrl: '',
    hreflangKo: '',
    hreflangEn: '',
    sitemapIncluded: sitemapSet.has(normalizeAbsoluteUrl(targetUrl)),
    rssIncluded: rssSet.has(normalizeAbsoluteUrl(targetUrl)),
    classes: [],
    fetchError: '',
  };

  try {
    const res = await fetchWithRedirectChain(targetUrl);
    const xRobotsTag = res.headers.get('x-robots-tag') || '';
    const meta = parseHtml(res.html);
    const finalUrl = normalizeAbsoluteUrl(res.finalUrl);
    const canonical = meta.canonical ? normalizeAbsoluteUrl(meta.canonical) : '';

    const record = {
      ...baseRecord,
      status: res.status,
      finalUrl,
      redirectChain: res.redirectChain,
      canonical,
      selfCanonical: Boolean(canonical) && canonical === finalUrl,
      metaRobots: meta.robots,
      xRobotsTag,
      title: meta.title,
      description: meta.description,
      h1Count: meta.h1Count,
      h1Texts: meta.h1Texts,
      bodyTextLength: meta.bodyTextLength,
      ogUrl: meta.ogUrl ? normalizeAbsoluteUrl(meta.ogUrl) : '',
      hreflangKo: meta.hreflangKo ? normalizeAbsoluteUrl(meta.hreflangKo) : '',
      hreflangEn: meta.hreflangEn ? normalizeAbsoluteUrl(meta.hreflangEn) : '',
    };
    record.classes = classify(record);
    return record;
  } catch (error) {
    const record = {
      ...baseRecord,
      fetchError: error.message || String(error),
    };
    record.classes = classify(record);
    return record;
  }
}

function md(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

function yn(value) {
  return value ? 'yes' : 'no';
}

function renderRedirectChain(chain) {
  if (!chain.length) return '-';
  return chain.map((item) => `${item.status} ${normalizePath(item.from)} -> ${normalizePath(item.to)}`).join('<br>');
}

function renderReport(records, sitemapInfo, rssInfo, site) {
  const counts = new Map();
  records.forEach((record) => {
    record.classes.forEach((klass) => counts.set(klass, (counts.get(klass) || 0) + 1));
  });

  const lines = [];
  lines.push('# Naver Drop Core URL Technical Audit - 2026-06-16');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Site: ${site}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Class | Count |');
  lines.push('| --- | ---: |');
  Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([klass, count]) => {
    lines.push(`| ${klass} | ${count} |`);
  });
  lines.push('');
  lines.push(`- Sitemap URLs loaded: ${sitemapInfo.locs.size}`);
  lines.push(`- Sitemap files checked: ${sitemapInfo.filesChecked.map((u) => normalizePath(u)).join(', ') || '-'}`);
  lines.push(`- RSS status: ${rssInfo.status || '-'}`);
  lines.push(`- RSS URLs loaded: ${rssInfo.links.size}`);
  lines.push('');
  lines.push('## Core URL Table');
  lines.push('');
  lines.push('| URL | Status | Final URL | Redirect | Canonical | Self canonical | Robots | X-Robots-Tag | Title | Description length | H1 count | H1 text | Body length | OG URL | Hreflang KO | Hreflang EN | Sitemap | RSS | Classes |');
  lines.push('| --- | ---: | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | --- | ---: | --- | --- | --- | --- | --- | --- |');
  for (const r of records) {
    lines.push([
      r.requestedUrl,
      r.status || '-',
      r.finalUrl || '-',
      renderRedirectChain(r.redirectChain),
      r.canonical || '-',
      r.selfCanonical === null ? '-' : yn(r.selfCanonical),
      r.metaRobots || '-',
      r.xRobotsTag || '-',
      r.title || '-',
      String((r.description || '').length),
      String(r.h1Count),
      r.h1Texts.join('<br>') || '-',
      String(r.bodyTextLength),
      r.ogUrl || '-',
      r.hreflangKo || '-',
      r.hreflangEn || '-',
      yn(r.sitemapIncluded),
      yn(r.rssIncluded),
      r.classes.join(', '),
    ].map(md).join(' | ').replace(/^/, '| ') + ' |');
  }
  lines.push('');
  lines.push('## Problem Details');
  lines.push('');
  const problems = records.filter((record) => !(record.classes.length === 1 && record.classes[0] === 'OK'));
  if (!problems.length) {
    lines.push('- None. All checked core URLs are technically indexable by the configured checks.');
  } else {
    for (const r of problems) {
      lines.push(`### ${r.requestedUrl}`);
      lines.push('');
      lines.push(`- Classes: ${r.classes.join(', ')}`);
      if (r.fetchError) lines.push(`- Fetch error: ${r.fetchError}`);
      if (r.selfCanonical === false) lines.push(`- Canonical mismatch: final \`${r.finalUrl}\`, canonical \`${r.canonical || '-'}\``);
      if (!r.sitemapIncluded) lines.push('- Not found in sitemap URL set.');
      if (r.h1Count !== 1) lines.push(`- H1 count is ${r.h1Count}.`);
      if (!r.description) lines.push('- Missing meta description.');
      lines.push('');
    }
  }
  lines.push('## Follow-up Patch Suggestions');
  lines.push('');
  const patchSuggestions = problems
    .filter((r) => r.classes.some((klass) => ['CANONICAL_MISMATCH', 'NOINDEX', 'X_ROBOTS_NOINDEX', 'MISSING_TITLE', 'MISSING_DESCRIPTION', 'H1_PROBLEM', 'SITEMAP_MISSING'].includes(klass)))
    .map((r) => `- ${r.requestedUrl}: ${r.classes.join(', ')}`);
  if (!patchSuggestions.length) {
    lines.push('- No definite technical patch is suggested from this core URL audit alone.');
  } else {
    lines.push(...patchSuggestions);
  }
  lines.push('');
  lines.push('## Classification Rules');
  lines.push('');
  lines.push('- `OK`: no detected issue among the configured checks.');
  lines.push('- `HTTP_ERROR`: fetch failed or HTTP status is 4xx/5xx.');
  lines.push('- `REDIRECT`: target URL redirects before final HTML.');
  lines.push('- `CANONICAL_MISMATCH`: final URL and canonical URL differ after normalization.');
  lines.push('- `NOINDEX`: meta robots/googlebot contains noindex.');
  lines.push('- `X_ROBOTS_NOINDEX`: X-Robots-Tag contains noindex.');
  lines.push('- `MISSING_TITLE`, `MISSING_DESCRIPTION`, `H1_PROBLEM`, `SHORT_BODY`, `SITEMAP_MISSING`: self-explanatory page-level checks.');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const site = getArg('site', SITE).replace(/\/$/, '');
  const outPath = path.resolve(getArg('out', DEFAULT_OUT));
  const targetsArg = getArg('targets', '');
  const targets = targetsArg ? targetsArg.split(',').map((s) => s.trim()).filter(Boolean) : TARGET_PATHS;

  console.log(`Loading sitemap from ${site}...`);
  const sitemapInfo = await loadSitemapSet(site);
  console.log(`Loading RSS from ${site}/rss.xml...`);
  const rssInfo = await loadRssSet(site);

  const records = [];
  for (const target of targets) {
    console.log(`Auditing ${target}...`);
    records.push(await auditUrl(site, target, sitemapInfo.locs, rssInfo.links));
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, renderReport(records, sitemapInfo, rssInfo, site), 'utf8');

  const problemCount = records.filter((r) => !(r.classes.length === 1 && r.classes[0] === 'OK')).length;
  console.log(`Checked ${records.length} core URLs.`);
  console.log(`Problem URLs: ${problemCount}`);
  console.log(`Report: ${path.relative(process.cwd(), outPath).replace(/\\/g, '/')}`);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
