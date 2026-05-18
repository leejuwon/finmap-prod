#!/usr/bin/env node
'use strict';

const cheerio = require('cheerio');

const SITE_URL = 'https://www.finmaphub.com';

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : '';
}

const BASE_URL = (getArg('base') || process.env.SEO_AUDIT_BASE_URL || '').replace(/\/+$/, '');
const TIMEOUT_MS = Number(process.env.SEO_AUDIT_TIMEOUT_MS || 15000);

function site(path) {
  return `${SITE_URL}${path}`;
}

function aptUrl(aptKey, lang = 'ko') {
  const prefix = lang === 'en' ? '/en' : '';
  return site(`${prefix}/market/real-estate/apt/${encodeURIComponent(aptKey)}`);
}

const APT_SAMPLE_URLS = (process.env.SEO_AUDIT_APT_URLS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const defaultAptSamples = APT_SAMPLE_URLS.length
  ? APT_SAMPLE_URLS
  : [
      aptUrl('11680|강남구|대치동|은마', 'ko'),
      aptUrl('11710|송파구|잠실동|잠실엘스', 'ko'),
      aptUrl('11650|서초구|반포동|래미안퍼스티지', 'en'),
    ];

const targets = [
  { label: 'Home KO', url: site('/') },
  { label: 'Home EN', url: site('/en') },
  { label: 'Real estate KO', url: site('/market/real-estate') },
  { label: 'Real estate EN', url: site('/en/market/real-estate') },
  ...defaultAptSamples.map((url, idx) => ({ label: `Apartment detail ${idx + 1}`, url })),
  { label: 'Blog KO inflation', url: site('/posts/economicInfo/inflation-basics') },
  { label: 'Blog KO CAGR', url: site('/posts/personalFinance/what-is-cagr') },
  { label: 'Blog EN inflation', url: site('/en/posts/economicInfo/inflation-basics') },
  { label: 'Blog EN CAGR', url: site('/en/posts/personalFinance/what-is-cagr') },
  { label: 'Tool KO compound', url: site('/tools/compound-interest') },
  { label: 'Tool KO CAGR', url: site('/tools/cagr-calculator') },
  { label: 'Tool EN compound', url: site('/en/tools/compound-interest') },
  { label: 'Tool EN CAGR', url: site('/en/tools/cagr-calculator') },
  { label: 'Legacy /posts category en', url: site('/posts/personalFinance/en/personal-finance-3pillars'), expectRedirect: true, expectedFinal: site('/en/posts/personalFinance/personal-finance-3pillars') },
  { label: 'Legacy /posts category ko', url: site('/posts/personalFinance/ko/personal-finance-3pillars'), expectRedirect: true, expectedFinal: site('/posts/personalFinance/personal-finance-3pillars') },
  { label: 'Legacy /en/posts ko', url: site('/en/posts/personalFinance/ko/personal-finance-3pillars'), expectRedirect: true, expectedFinal: site('/posts/personalFinance/personal-finance-3pillars') },
  { label: 'Legacy /en/posts en', url: site('/en/posts/personalFinance/en/personal-finance-3pillars'), expectRedirect: true, expectedFinal: site('/en/posts/personalFinance/personal-finance-3pillars') },
  { label: 'Legacy tools lang=en', url: site('/tools/compound-interest?lang=en'), expectRedirect: true, expectedFinal: site('/en/tools/compound-interest') },
  { label: 'Legacy root lang=en', url: site('/?lang=en'), expectRedirect: true, expectedFinal: site('/en') },
  { label: 'Legacy en lang=en', url: site('/en?lang=en'), expectRedirect: true, expectedFinal: site('/en') },
];

function rewriteToBase(url) {
  if (!BASE_URL) return url;
  const target = new URL(url);
  const base = new URL(BASE_URL);
  return `${base.origin}${target.pathname}${target.search}${target.hash}`;
}

function displayUrl(url) {
  if (!BASE_URL) return url;
  const parsed = new URL(url);
  const base = new URL(BASE_URL);
  if (parsed.origin !== base.origin) return url;
  return `${SITE_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
}

function normalizeComparable(url) {
  const parsed = new URL(url);
  let pathname = parsed.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
  return `${parsed.origin}${pathname}${parsed.search}`;
}

async function fetchHtml(targetUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const requestUrl = rewriteToBase(targetUrl);
    const res = await fetch(requestUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'finmap-seo-audit/1.0',
        accept: 'text/html,application/xhtml+xml',
      },
    });
    const html = await res.text();
    return {
      status: res.status,
      requestedUrl: displayUrl(requestUrl),
      finalUrl: displayUrl(res.url),
      redirected: res.redirected || normalizeComparable(displayUrl(requestUrl)) !== normalizeComparable(displayUrl(res.url)),
      html,
    };
  } finally {
    clearTimeout(timer);
  }
}

function inspectHtml(html) {
  const $ = cheerio.load(html || '');
  const hreflangs = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    hreflangs.push({
      hreflang: String($(el).attr('hreflang') || '').trim(),
      href: String($(el).attr('href') || '').trim(),
    });
  });

  return {
    title: $('title').first().text().trim(),
    h1: $('h1').first().text().trim(),
    robots: $('meta[name="robots"]').first().attr('content') || '',
    googlebot: $('meta[name="googlebot"]').first().attr('content') || '',
    canonical: $('link[rel="canonical"]').first().attr('href') || '',
    hreflangs,
  };
}

function findProblems(target, response, meta) {
  const problems = [];
  if (response.status !== 200) problems.push(`status=${response.status}`);
  if (target.expectRedirect && !response.redirected) problems.push('expected redirect');
  if (!target.expectRedirect && response.redirected) problems.push('unexpected redirect');

  if (target.expectedFinal) {
    const actual = normalizeComparable(response.finalUrl);
    const expected = normalizeComparable(target.expectedFinal);
    if (actual !== expected) problems.push(`final URL mismatch: ${response.finalUrl}`);
  }

  if (!meta.title) problems.push('missing title');
  if (!meta.h1) problems.push('missing h1');
  if (!meta.canonical) problems.push('missing canonical');
  if (meta.canonical && !meta.canonical.startsWith(SITE_URL)) problems.push(`canonical is not fully qualified: ${meta.canonical}`);
  if (meta.canonical && meta.canonical.includes('?')) problems.push(`canonical has query string: ${meta.canonical}`);
  if (/noindex/i.test(`${meta.robots},${meta.googlebot}`)) problems.push(`noindex robots: ${meta.robots || meta.googlebot}`);

  const hreflangMap = new Map(meta.hreflangs.map((item) => [item.hreflang, item.href]));
  for (const lang of ['ko', 'en', 'x-default']) {
    if (!hreflangMap.has(lang)) problems.push(`missing hreflang ${lang}`);
  }
  for (const item of meta.hreflangs) {
    if (!item.href.startsWith(SITE_URL)) problems.push(`hreflang ${item.hreflang} is not fully qualified`);
    if (item.href.includes('?')) problems.push(`hreflang ${item.hreflang} has query string`);
  }

  return problems;
}

async function main() {
  let failed = 0;
  console.log(`SEO audit target base: ${BASE_URL || SITE_URL}`);
  console.log(`URLs: ${targets.length}`);

  for (const target of targets) {
    try {
      const response = await fetchHtml(target.url);
      const meta = inspectHtml(response.html);
      const problems = findProblems(target, response, meta);
      const ok = problems.length === 0;
      if (!ok) failed += 1;

      console.log(`\n[${ok ? 'PASS' : 'FAIL'}] ${target.label}`);
      console.log(`  status: ${response.status}`);
      console.log(`  final URL: ${response.finalUrl}`);
      console.log(`  redirected: ${response.redirected}`);
      console.log(`  robots: ${meta.robots || '-'}`);
      console.log(`  canonical: ${meta.canonical || '-'}`);
      console.log(`  hreflang: ${meta.hreflangs.map((x) => `${x.hreflang}=${x.href}`).join(' | ') || '-'}`);
      console.log(`  title: ${meta.title ? 'yes' : 'no'}`);
      console.log(`  h1: ${meta.h1 ? 'yes' : 'no'}`);
      if (!ok) console.log(`  problems: ${problems.join('; ')}`);
    } catch (e) {
      failed += 1;
      console.log(`\n[FAIL] ${target.label}`);
      console.log(`  error: ${e?.message || e}`);
    }
  }

  console.log(`\nResult: ${failed ? `FAIL (${failed})` : 'PASS'}`);
  if (failed) process.exitCode = 1;
}

main();
