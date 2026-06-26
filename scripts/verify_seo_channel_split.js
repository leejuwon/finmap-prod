const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const matter = require('gray-matter');

const SITE_URL = 'https://www.finmaphub.com';
const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, 'reports', 'seo-channel-split-url-check.md');
const DEFAULT_PORT = Number(process.env.SEO_VERIFY_PORT || 8017);
const USE_LOCAL_SERVER = process.argv.includes('--local-server');
const BASE_URL = (process.env.SEO_VERIFY_BASE_URL || (USE_LOCAL_SERVER ? `http://127.0.0.1:${DEFAULT_PORT}` : SITE_URL)).replace(/\/+$/, '');
const MAIN_SITEMAP_PATH = path.join(ROOT, 'public', 'sitemap-0.xml');
const KO_SITEMAP_PATH = path.join(ROOT, 'public', 'sitemap-ko.xml');
const EN_SITEMAP_PATH = path.join(ROOT, 'public', 'sitemap-en.xml');
const EN_PREFIX_SITEMAP_PATH = path.join(ROOT, 'public', 'en', 'sitemap.xml');
const POSTS_ROOT = path.join(ROOT, 'content', 'posts');

const REQUIRED_EN_SITEMAP_PATHS = [
  '/en',
  '/en/tools',
  '/en/tools/compound-interest',
  '/en/tools/cagr-calculator',
  '/en/tools/dca-calculator',
  '/en/tools/dsr-ltv-calculator',
  '/en/tools/fire-calculator',
  '/en/tools/goal-simulator',
  '/en/market',
  '/en/market/indices',
  '/en/market/real-estate',
  '/en/about',
  '/en/contact',
  '/en/privacy',
  '/en/terms',
  '/en/disclaimer',
];

const SAMPLES = [
  { path: '/', lang: 'ko', group: 'home' },
  { path: '/en', lang: 'en', group: 'home' },
  { path: '/tools', lang: 'ko', group: 'tools' },
  { path: '/en/tools', lang: 'en', group: 'tools' },
  { path: '/en/tools/compound-interest', lang: 'en', group: 'tool-detail' },
  { path: '/en/tools/cagr-calculator', lang: 'en', group: 'tool-detail' },
  { path: '/tools/dca-calculator', lang: 'ko', group: 'tool-detail' },
  { path: '/en/tools/dca-calculator', lang: 'en', group: 'tool-detail' },
  { path: '/en/tools/dsr-ltv-calculator', lang: 'en', group: 'tool-detail' },
  { path: '/en/tools/fire-calculator', lang: 'en', group: 'tool-detail' },
  { path: '/en/tools/goal-simulator', lang: 'en', group: 'tool-detail' },
  { path: '/market/real-estate', lang: 'ko', group: 'market' },
  { path: '/en/market/real-estate', lang: 'en', group: 'market' },
  { path: '/en/market/indices', lang: 'en', group: 'market' },
  { path: '/posts/personalFinance/dsr-40-income-loan-limit-table', lang: 'ko', group: 'post' },
  { path: '/en/posts/personalFinance/dsr-40-income-loan-limit-table', lang: 'en', group: 'post' },
  { path: '/posts/personalFinance/is-dca-better-in-bear-market', lang: 'ko', group: 'post-explicit-map' },
  { path: '/en/posts/personalFinance/is-dca-better-in-a-bear-market', lang: 'en', group: 'post-explicit-map' },
  { path: '/posts/personalFinance/how-much-per-month-for-100m', lang: 'ko', group: 'post-opt-out' },
  { path: '/en/posts/personalFinance/how-much-per-month-for-100m', lang: 'en', group: 'post-opt-out' },
  { path: '/posts/personalFinance/what-is-cagr', lang: 'ko', group: 'post-pair' },
  { path: '/en/posts/personalFinance/what-is-cagr', lang: 'en', group: 'post-pair' },
];

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

function isNoindex(data) {
  return data?.draft === true || data?.noindex === true || String(data?.robots || '').toLowerCase().includes('noindex');
}

function buildHreflangOptOutPathSet() {
  const paths = new Set();
  for (const fullPath of walkDir(POSTS_ROOT).filter((file) => file.endsWith('.md'))) {
    const rel = path.relative(POSTS_ROOT, fullPath).replace(/\\/g, '/');
    const parts = rel.split('/');
    if (parts.length < 3) continue;

    const category = parts[0];
    const lang = parts[1];
    const slug = parts[parts.length - 1].replace(/\.md$/, '');
    if (!category || !['ko', 'en'].includes(lang) || !slug) continue;

    let data = {};
    try {
      data = matter(fs.readFileSync(fullPath, 'utf8')).data || {};
    } catch {
      data = {};
    }
    if (isNoindex(data) || data.hreflangEquivalent !== false) continue;

    const prefix = lang === 'en' ? '/en' : '';
    paths.add(`${prefix}/posts/${category}/${slug}`);
  }
  return paths;
}

const HREFLANG_OPT_OUT_PATHS = buildHreflangOptOutPathSet();

function normalizeHreflangAlternatePath(rawPath) {
  if (typeof rawPath !== 'string') return '';
  const trimmed = rawPath.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed, SITE_URL);
    if (parsed.origin !== SITE_URL) return '';

    let pathname = parsed.pathname || '/';
    if (pathname === '/ko') pathname = '/';
    else if (pathname.startsWith('/ko/')) pathname = pathname.replace(/^\/ko/, '') || '/';
    if (pathname === '/en/en') pathname = '/en';
    else if (pathname.startsWith('/en/en/')) pathname = pathname.replace(/^\/en\/en/, '/en');
    pathname = pathname.replace(/\/{2,}/g, '/');
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);

    return `${pathname || '/'}${parsed.search || ''}`;
  } catch {
    return '';
  }
}

function buildHreflangAlternatePathMap() {
  const map = new Map();
  for (const fullPath of walkDir(POSTS_ROOT).filter((file) => file.endsWith('.md'))) {
    const rel = path.relative(POSTS_ROOT, fullPath).replace(/\\/g, '/');
    const parts = rel.split('/');
    if (parts.length < 3) continue;

    const category = parts[0];
    const lang = parts[1];
    const slug = parts[parts.length - 1].replace(/\.md$/, '');
    if (!category || !['ko', 'en'].includes(lang) || !slug) continue;

    let data = {};
    try {
      data = matter(fs.readFileSync(fullPath, 'utf8')).data || {};
    } catch {
      data = {};
    }
    if (isNoindex(data) || data.hreflangEquivalent === false) continue;

    const koPath = normalizeHreflangAlternatePath(data.hreflangAlternates?.ko);
    const enPath = normalizeHreflangAlternatePath(data.hreflangAlternates?.en);
    if (!koPath || !enPath) continue;

    const prefix = lang === 'en' ? '/en' : '';
    map.set(`${prefix}/posts/${category}/${slug}`, { koPath, enPath });
  }
  return map;
}

const HREFLANG_ALTERNATE_PATHS = buildHreflangAlternatePathMap();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAttr(tag, attr) {
  const re = new RegExp(`${attr}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  const match = String(tag || '').match(re);
  return match ? match[2].trim() : '';
}

function extractCanonical(html) {
  const links = String(html || '').match(/<link\b[^>]*>/gi) || [];
  for (const tag of links) {
    const rel = getAttr(tag, 'rel').toLowerCase();
    if (rel.split(/\s+/).includes('canonical')) return getAttr(tag, 'href');
  }
  return '';
}

function extractHreflangs(html) {
  const links = String(html || '').match(/<link\b[^>]*>/gi) || [];
  const map = {};
  for (const tag of links) {
    const rel = getAttr(tag, 'rel').toLowerCase();
    const hreflang = getAttr(tag, 'hreflang') || getAttr(tag, 'hrefLang');
    if (!rel.split(/\s+/).includes('alternate') || !hreflang) continue;
    map[hreflang] = getAttr(tag, 'href');
  }
  return map;
}

function extractMeta(html, name) {
  const metas = String(html || '').match(/<meta\b[^>]*>/gi) || [];
  for (const tag of metas) {
    if (getAttr(tag, 'name').toLowerCase() === name.toLowerCase()) return getAttr(tag, 'content');
  }
  return '';
}

function stripEnPrefix(pathname) {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  return pathname || '/';
}

function toEnPath(koPath) {
  if (!koPath || koPath === '/') return '/en';
  return `/en${koPath}`;
}

function expectedFor(sample) {
  const koPath = stripEnPrefix(sample.path);
  const enPath = toEnPath(koPath);
  const canonical = `${SITE_URL}${sample.path === '/' ? '/' : sample.path}`;
  const hreflangOptOut = HREFLANG_OPT_OUT_PATHS.has(sample.path);
  if (hreflangOptOut) {
    return {
      canonical,
      koHref: sample.lang === 'ko' ? `${SITE_URL}${koPath}` : '',
      enHref: sample.lang === 'en' ? `${SITE_URL}${enPath}` : '',
      xDefault: '',
      hreflangOptOut,
      hreflangMode: 'self-only',
    };
  }
  const explicit = HREFLANG_ALTERNATE_PATHS.get(sample.path);
  if (explicit?.koPath && explicit?.enPath) {
    return {
      canonical,
      koHref: `${SITE_URL}${explicit.koPath}`,
      enHref: `${SITE_URL}${explicit.enPath}`,
      xDefault: '',
      hreflangOptOut,
      hreflangMode: 'explicit',
    };
  }
  return {
    canonical,
    koHref: `${SITE_URL}${koPath}`,
    enHref: `${SITE_URL}${enPath}`,
    xDefault: koPath === '/' ? `${SITE_URL}/` : '',
    hreflangOptOut,
    hreflangMode: 'pair',
  };
}

function hasNoindex(...values) {
  return values.join(',').toLowerCase().includes('noindex');
}

function extractSitemapLocs(xml) {
  return Array.from(String(xml || '').matchAll(/<loc>([\s\S]*?)<\/loc>/g), (match) => match[1].trim()).filter(Boolean);
}

function readSitemapLocs(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return extractSitemapLocs(fs.readFileSync(filePath, 'utf8'));
}

function normalizeLocForMembership(loc) {
  try {
    const parsed = new URL(loc);
    if (parsed.origin === SITE_URL && parsed.pathname === '/' && !parsed.search && !parsed.hash) {
      return `${SITE_URL}/`;
    }
  } catch {
    // Keep the raw value so the policy check can report invalid URLs separately.
  }
  return loc;
}

function loadSitemapSets() {
  const mainLocs = readSitemapLocs(MAIN_SITEMAP_PATH);
  const koLocs = readSitemapLocs(KO_SITEMAP_PATH);
  const enLocs = readSitemapLocs(EN_SITEMAP_PATH);
  const enPrefixLocs = readSitemapLocs(EN_PREFIX_SITEMAP_PATH);

  return {
    mainLocs,
    koLocs,
    enLocs,
    enPrefixLocs,
    main: new Set(mainLocs.map(normalizeLocForMembership)),
    ko: new Set(koLocs.map(normalizeLocForMembership)),
    en: new Set(enLocs.map(normalizeLocForMembership)),
    enPrefix: new Set(enPrefixLocs.map(normalizeLocForMembership)),
  };
}

function isForbiddenSitemapLoc(loc) {
  let pathname = '';
  try {
    pathname = new URL(loc).pathname;
  } catch {
    return 'invalid-url';
  }

  if (loc.includes('?')) return 'query-url';
  if (pathname === '/ko' || pathname.startsWith('/ko/')) return 'ko-prefix';
  if (pathname === '/en/en' || pathname.startsWith('/en/en/')) return 'en-en-prefix';
  if (/^\/(?:en\/)?posts\/[^/]+\/(?:ko|en)\//.test(pathname)) return 'legacy-post-lang-url';
  if (/^\/(?:en\/)?market\/real-estate\/apt\//.test(pathname)) return 'real-estate-apt-detail-url';
  return '';
}

function inspectSitemapPolicy(sitemapSets) {
  const files = [
    { name: 'sitemap-0.xml', locs: sitemapSets.mainLocs },
    { name: 'sitemap-ko.xml', locs: sitemapSets.koLocs },
    { name: 'sitemap-en.xml', locs: sitemapSets.enLocs },
    { name: 'en/sitemap.xml', locs: sitemapSets.enPrefixLocs },
  ];
  const forbidden = [];

  for (const file of files) {
    for (const loc of file.locs) {
      const reason = isForbiddenSitemapLoc(loc);
      if (reason) forbidden.push({ file: file.name, reason, loc });
    }
  }

  const enPrefixNonEnLocs = sitemapSets.enPrefixLocs.filter(
    (loc) => loc !== `${SITE_URL}/en` && !loc.startsWith(`${SITE_URL}/en/`)
  );

  return {
    mainCount: sitemapSets.mainLocs.length,
    koCount: sitemapSets.koLocs.length,
    enCount: sitemapSets.enLocs.length,
    enPrefixCount: sitemapSets.enPrefixLocs.length,
    forbidden,
    enPrefixNonEnLocs,
    enPrefixOnly: sitemapSets.enPrefixLocs.length > 0 && enPrefixNonEnLocs.length === 0,
  };
}

function inspectEnSitemapMembership() {
  const exists = fs.existsSync(EN_SITEMAP_PATH);
  const xml = exists ? fs.readFileSync(EN_SITEMAP_PATH, 'utf8') : '';
  const locs = exists ? extractSitemapLocs(xml) : [];
  const locSet = new Set(locs);
  const prefixExists = fs.existsSync(EN_PREFIX_SITEMAP_PATH);
  const prefixXml = prefixExists ? fs.readFileSync(EN_PREFIX_SITEMAP_PATH, 'utf8') : '';
  const prefixLocs = prefixExists ? extractSitemapLocs(prefixXml) : [];
  const prefixNonEnLocs = prefixLocs.filter((loc) => loc !== `${SITE_URL}/en` && !loc.startsWith(`${SITE_URL}/en/`));
  const required = REQUIRED_EN_SITEMAP_PATHS.map((pathname) => {
    const loc = `${SITE_URL}${pathname}`;
    return {
      path: pathname,
      loc,
      present: locSet.has(loc),
    };
  });
  const enHomeLoc = `${SITE_URL}/en`;
  return {
    exists,
    count: locs.length,
    required,
    missing: required.filter((item) => !item.present),
    enHomeLoc,
    enHomePresent: locSet.has(enHomeLoc),
    enHomeTrailingSlashOk: locSet.has(enHomeLoc) && !locSet.has(`${SITE_URL}/en/`),
    prefixExists,
    prefixCount: prefixLocs.length,
    prefixNonEnLocs,
    prefixEnLocOnly: prefixExists && prefixLocs.length > 0 && prefixNonEnLocs.length === 0,
    prefixMatchesRootXml: exists && prefixExists && xml === prefixXml,
  };
}

async function waitForLocalServer(baseUrl) {
  const healthUrl = `${baseUrl}/healthz`;
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(healthUrl, { redirect: 'manual' });
      if (res.ok) return;
    } catch {
      // keep polling
    }
    await sleep(500);
  }
  throw new Error(`Local server did not become ready: ${healthUrl}`);
}

function startLocalServer() {
  const child = spawn(process.execPath, ['web.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(DEFAULT_PORT), NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  let logs = '';
  child.stdout.on('data', (chunk) => {
    logs += chunk.toString();
    logs = logs.slice(-4000);
  });
  child.stderr.on('data', (chunk) => {
    logs += chunk.toString();
    logs = logs.slice(-4000);
  });

  return {
    child,
    getLogs: () => logs,
    stop: async () => {
      if (child.exitCode != null) return;
      child.kill();
      await sleep(500);
      if (child.exitCode == null) child.kill('SIGKILL');
    },
  };
}

function toPublicUrl(fetchUrl) {
  const parsed = new URL(fetchUrl);
  const pathname = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/+$/, '');
  return `${SITE_URL}${pathname}${parsed.search}`;
}

async function fetchFinal(url) {
  let currentUrl = url;
  const redirects = [];
  const headers = {
    'user-agent': 'Finmap-SEO-Channel-Split-Verify/1.0',
    accept: 'text/html,application/xhtml+xml',
  };

  for (let i = 0; i < 8; i += 1) {
    const res = await fetch(currentUrl, { redirect: 'manual', headers });
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      const nextUrl = new URL(location, currentUrl).toString();
      redirects.push(`${res.status} ${toPublicUrl(currentUrl)} -> ${toPublicUrl(nextUrl)}`);
      currentUrl = nextUrl;
      continue;
    }

    return {
      res,
      html: await res.text(),
      finalFetchUrl: currentUrl,
      finalUrl: toPublicUrl(currentUrl),
      redirects,
    };
  }

  throw new Error(`Too many redirects while checking ${url}`);
}

async function inspectSample(sample, sitemapSets) {
  const url = `${BASE_URL}${sample.path}`;
  const fetched = await fetchFinal(url);
  const { res, html, finalUrl, redirects } = fetched;
  const canonical = extractCanonical(html);
  const hreflangs = extractHreflangs(html);
  const metaRobots = extractMeta(html, 'robots');
  const metaGooglebot = extractMeta(html, 'googlebot');
  const xRobots = res.headers.get('x-robots-tag') || '';
  const expected = expectedFor(sample);
  const problems = [];
  const mainSitemapIncluded = sitemapSets.main.has(expected.canonical);
  const channelSitemapIncluded = sample.lang === 'en' ? sitemapSets.en.has(expected.canonical) : sitemapSets.ko.has(expected.canonical);
  const enPrefixSitemapIncluded = sitemapSets.enPrefix.has(expected.canonical);

  if (res.status !== 200) problems.push(`status ${res.status}`);
  if (finalUrl !== expected.canonical) problems.push(`finalUrl expected ${expected.canonical}`);
  if (canonical !== expected.canonical) problems.push(`canonical expected ${expected.canonical}`);
  if (expected.koHref) {
    if (hreflangs.ko !== expected.koHref) problems.push(`hreflang ko expected ${expected.koHref}`);
  } else if (hreflangs.ko) {
    problems.push('hreflang ko should be omitted by opt-out');
  }
  if (expected.enHref) {
    if (hreflangs.en !== expected.enHref) problems.push(`hreflang en expected ${expected.enHref}`);
  } else if (hreflangs.en) {
    problems.push('hreflang en should be omitted by opt-out');
  }
  if (expected.xDefault) {
    if (hreflangs['x-default'] !== expected.xDefault) problems.push(`x-default expected ${expected.xDefault}`);
  } else if (hreflangs['x-default']) {
    problems.push('x-default emitted on non-home URL');
  }
  if (hreflangs[sample.lang] !== expected.canonical) problems.push('self hreflang does not match canonical');
  if (hasNoindex(metaRobots, metaGooglebot, xRobots)) problems.push('noindex found');
  if (!mainSitemapIncluded) problems.push('canonical missing from sitemap-0.xml');
  if (!channelSitemapIncluded) problems.push(`canonical missing from sitemap-${sample.lang}.xml`);
  if (sample.lang === 'en' && !enPrefixSitemapIncluded) problems.push('canonical missing from /en/sitemap.xml');
  if (sample.lang !== 'en' && enPrefixSitemapIncluded) problems.push('KO canonical found in /en/sitemap.xml');

  return {
    ...sample,
    status: res.status,
    finalUrl,
    canonical,
    hreflangs,
    metaRobots,
    metaGooglebot,
    xRobots,
    mainSitemapIncluded,
    channelSitemapIncluded,
    enPrefixSitemapIncluded,
    redirects,
    result: problems.length ? 'FAIL' : 'PASS',
    problems,
  };
}

function mdEscape(value) {
  return String(value || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function formatSitemapMembership(item) {
  const channel = item.lang === 'en' ? 'en' : 'ko';
  const parts = [];
  parts.push(item.mainSitemapIncluded ? 'main:yes' : 'main:no');
  parts.push(item.channelSitemapIncluded ? `${channel}:yes` : `${channel}:no`);
  return parts.join(', ');
}

function formatEnPrefixMembership(item) {
  if (item.lang === 'en') return item.enPrefixSitemapIncluded ? 'yes' : 'no';
  return item.enPrefixSitemapIncluded ? 'FAIL: KO included' : 'N/A';
}

function buildReport(results, sitemapCheck, sitemapPolicy) {
  const lines = [];
  lines.push('# SEO Channel Split URL Check');
  lines.push('');
  lines.push(`- Checked at: ${new Date().toISOString()}`);
  lines.push(`- Fetch base: ${BASE_URL}`);
  lines.push(`- URL samples: ${results.length}`);
  lines.push(`- Failures: ${results.filter((item) => item.result !== 'PASS').length}`);
  lines.push(`- sitemap-0.xml URL count: ${sitemapPolicy.mainCount}`);
  lines.push(`- sitemap-ko.xml URL count: ${sitemapPolicy.koCount}`);
  lines.push(`- sitemap-en.xml URL count: ${sitemapCheck.count}`);
  lines.push(`- sitemap-en.xml required URLs: ${sitemapCheck.required.length - sitemapCheck.missing.length}/${sitemapCheck.required.length}`);
  lines.push(`- /en/sitemap.xml exists: ${sitemapCheck.prefixExists ? 'yes' : 'no'}`);
  lines.push(`- /en/sitemap.xml URL count: ${sitemapCheck.prefixCount}`);
  lines.push(`- /en/sitemap.xml EN-only locs: ${sitemapCheck.prefixEnLocOnly ? 'PASS' : 'FAIL'}`);
  lines.push(`- Forbidden sitemap loc patterns: ${sitemapPolicy.forbidden.length ? 'FAIL' : 'PASS'} (${sitemapPolicy.forbidden.length})`);
  lines.push('- Sitemap membership normalizes the root host-only loc to `https://www.finmaphub.com/` for canonical comparison.');
  lines.push('');
  lines.push('| Path | Lang | Status | Final URL | Canonical | hreflang ko | hreflang en | x-default | Meta robots | X-Robots-Tag | Sitemap | EN prefix sitemap | Result | Notes |');
  lines.push('| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const item of results) {
    lines.push([
      item.path,
      item.lang,
      item.status,
      mdEscape(item.finalUrl),
      mdEscape(item.canonical),
      mdEscape(item.hreflangs.ko),
      mdEscape(item.hreflangs.en),
      mdEscape(item.hreflangs['x-default']),
      mdEscape(item.metaRobots || item.metaGooglebot),
      mdEscape(item.xRobots),
      formatSitemapMembership(item),
      formatEnPrefixMembership(item),
      item.result,
      mdEscape(item.problems.join('; ') || (item.redirects.length ? item.redirects.join('; ') : 'OK')),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  lines.push('');
  lines.push('## Sitemap Policy Check');
  lines.push('');
  lines.push('| Sitemap | URL count |');
  lines.push('| --- | ---: |');
  lines.push(`| sitemap-0.xml | ${sitemapPolicy.mainCount} |`);
  lines.push(`| sitemap-ko.xml | ${sitemapPolicy.koCount} |`);
  lines.push(`| sitemap-en.xml | ${sitemapPolicy.enCount} |`);
  lines.push(`| en/sitemap.xml | ${sitemapPolicy.enPrefixCount} |`);
  lines.push('');
  lines.push(`- Forbidden loc pattern check: ${sitemapPolicy.forbidden.length ? 'FAIL' : 'PASS'}`);
  lines.push(`- /en/sitemap.xml EN-only loc check: ${sitemapPolicy.enPrefixOnly ? 'PASS' : 'FAIL'}`);
  lines.push('');
  if (!sitemapPolicy.forbidden.length) {
    lines.push('- No forbidden sitemap loc patterns found: query URL, `/ko`, `/en/en`, legacy post language URL, or real-estate apt detail URL.');
  } else {
    lines.push('| Sitemap | Reason | loc |');
    lines.push('| --- | --- | --- |');
    for (const item of sitemapPolicy.forbidden) {
      lines.push(`| ${item.file} | ${item.reason} | ${item.loc} |`);
    }
  }
  lines.push('');
  lines.push('## sitemap-en.xml Required Loc Membership');
  lines.push('');
  lines.push(`- File present: ${sitemapCheck.exists ? 'yes' : 'no'}`);
  lines.push(`- URL count: ${sitemapCheck.count}`);
  lines.push(`- Required URL membership: ${sitemapCheck.required.length - sitemapCheck.missing.length}/${sitemapCheck.required.length}`);
  lines.push(`- EN home trailing slash check: ${sitemapCheck.enHomeTrailingSlashOk ? 'PASS' : 'FAIL'} (${sitemapCheck.enHomeLoc})`);
  lines.push(`- EN URL-prefix sitemap: ${sitemapCheck.prefixExists ? 'present' : 'missing'} (\`public/en/sitemap.xml\`)`);
  lines.push(`- EN URL-prefix sitemap URL count: ${sitemapCheck.prefixCount}`);
  lines.push(`- EN URL-prefix sitemap loc prefix check: ${sitemapCheck.prefixEnLocOnly ? 'PASS' : 'FAIL'}`);
  lines.push(`- EN URL-prefix sitemap matches \`public/sitemap-en.xml\`: ${sitemapCheck.prefixMatchesRootXml ? 'PASS' : 'FAIL'}`);
  lines.push('');
  lines.push('| Required path | loc | Result |');
  lines.push('| --- | --- | --- |');
  for (const item of sitemapCheck.required) {
    lines.push(`| ${item.path} | ${item.loc} | ${item.present ? 'OK' : 'MISSING'} |`);
  }
  lines.push('');
  lines.push('## /en/sitemap.xml Loc Prefix Check');
  lines.push('');
  if (!sitemapCheck.prefixNonEnLocs.length) {
    lines.push('- All `<loc>` values are under `https://www.finmaphub.com/en`.');
  } else {
    lines.push('| Non-EN loc |');
    lines.push('| --- |');
    for (const loc of sitemapCheck.prefixNonEnLocs) {
      lines.push(`| ${loc} |`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

async function main() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  let server = null;
  try {
    if (USE_LOCAL_SERVER) {
      server = startLocalServer();
      await waitForLocalServer(BASE_URL);
    }

    const sitemapSets = loadSitemapSets();
    const sitemapPolicy = inspectSitemapPolicy(sitemapSets);
    const sitemapCheck = inspectEnSitemapMembership();
    console.log(`[sitemap-policy] sitemap-0.xml URL count: ${sitemapPolicy.mainCount}`);
    console.log(`[sitemap-policy] sitemap-ko.xml URL count: ${sitemapPolicy.koCount}`);
    console.log(`[sitemap-policy] sitemap-en.xml URL count: ${sitemapPolicy.enCount}`);
    console.log(`[sitemap-policy] en/sitemap.xml URL count: ${sitemapPolicy.enPrefixCount}`);
    console.log(`[sitemap-policy] forbidden loc patterns: ${sitemapPolicy.forbidden.length ? 'FAIL' : 'PASS'} (${sitemapPolicy.forbidden.length})`);
    for (const item of sitemapPolicy.forbidden) {
      console.log(`[sitemap-policy]\t${item.file}\t${item.reason}\t${item.loc}`);
    }
    console.log(`[sitemap-en] URL count: ${sitemapCheck.count}`);
    console.log(
      `[sitemap-en] required URLs: ${sitemapCheck.required.length - sitemapCheck.missing.length}/${sitemapCheck.required.length}`
    );
    for (const item of sitemapCheck.required) {
      console.log(`[sitemap-en]\t${item.present ? 'OK' : 'MISSING'}\t${item.path}`);
    }
    console.log(`[sitemap-en-prefix] file: ${sitemapCheck.prefixExists ? 'present' : 'missing'} public/en/sitemap.xml`);
    console.log(`[sitemap-en-prefix] URL count: ${sitemapCheck.prefixCount}`);
    console.log(`[sitemap-en-prefix] EN-only locs: ${sitemapCheck.prefixEnLocOnly ? 'PASS' : 'FAIL'}`);
    console.log(`[sitemap-en-prefix] matches sitemap-en.xml: ${sitemapCheck.prefixMatchesRootXml ? 'PASS' : 'FAIL'}`);
    for (const loc of sitemapCheck.prefixNonEnLocs) {
      console.log(`[sitemap-en-prefix]\tNON_EN_LOC\t${loc}`);
    }

    const results = [];
    for (const sample of SAMPLES) {
      const result = await inspectSample(sample, sitemapSets);
      results.push(result);
      console.log(`${result.result}\t${sample.path}\t${result.status}\t${result.finalUrl}\t${result.canonical || '-'}`);
    }

    fs.writeFileSync(REPORT_PATH, buildReport(results, sitemapCheck, sitemapPolicy), 'utf8');
    console.log(`Wrote ${path.relative(ROOT, REPORT_PATH)}`);

    if (
      sitemapPolicy.forbidden.length ||
      !sitemapPolicy.enPrefixOnly ||
      sitemapCheck.missing.length ||
      !sitemapCheck.enHomeTrailingSlashOk ||
      !sitemapCheck.prefixExists ||
      !sitemapCheck.prefixEnLocOnly ||
      !sitemapCheck.prefixMatchesRootXml ||
      results.some((item) => item.result !== 'PASS')
    ) {
      process.exitCode = 1;
    }
  } catch (error) {
    if (server?.getLogs) {
      const logs = server.getLogs();
      if (logs) console.error(logs);
    }
    throw error;
  } finally {
    if (server) await server.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
