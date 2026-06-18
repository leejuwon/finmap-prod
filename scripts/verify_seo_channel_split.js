const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SITE_URL = 'https://www.finmaphub.com';
const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, 'reports', 'seo-channel-split-url-check.md');
const DEFAULT_PORT = Number(process.env.SEO_VERIFY_PORT || 8017);
const USE_LOCAL_SERVER = process.argv.includes('--local-server');
const BASE_URL = (process.env.SEO_VERIFY_BASE_URL || (USE_LOCAL_SERVER ? `http://127.0.0.1:${DEFAULT_PORT}` : SITE_URL)).replace(/\/+$/, '');
const EN_SITEMAP_PATH = path.join(ROOT, 'public', 'sitemap-en.xml');

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
];

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
  return {
    canonical: `${SITE_URL}${sample.path === '/' ? '/' : sample.path}`,
    koHref: `${SITE_URL}${koPath}`,
    enHref: `${SITE_URL}${enPath}`,
    xDefault: koPath === '/' ? `${SITE_URL}/` : '',
  };
}

function hasNoindex(...values) {
  return values.join(',').toLowerCase().includes('noindex');
}

function extractSitemapLocs(xml) {
  return Array.from(String(xml || '').matchAll(/<loc>([\s\S]*?)<\/loc>/g), (match) => match[1].trim()).filter(Boolean);
}

function inspectEnSitemapMembership() {
  const exists = fs.existsSync(EN_SITEMAP_PATH);
  const locs = exists ? extractSitemapLocs(fs.readFileSync(EN_SITEMAP_PATH, 'utf8')) : [];
  const locSet = new Set(locs);
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

async function inspectSample(sample) {
  const url = `${BASE_URL}${sample.path}`;
  const res = await fetch(url, {
    redirect: 'manual',
    headers: {
      'user-agent': 'Finmap-SEO-Channel-Split-Verify/1.0',
      accept: 'text/html,application/xhtml+xml',
    },
  });
  const html = await res.text();
  const canonical = extractCanonical(html);
  const hreflangs = extractHreflangs(html);
  const metaRobots = extractMeta(html, 'robots');
  const metaGooglebot = extractMeta(html, 'googlebot');
  const xRobots = res.headers.get('x-robots-tag') || '';
  const expected = expectedFor(sample);
  const problems = [];

  if (res.status !== 200) problems.push(`status ${res.status}`);
  if (canonical !== expected.canonical) problems.push(`canonical expected ${expected.canonical}`);
  if (hreflangs.ko !== expected.koHref) problems.push(`hreflang ko expected ${expected.koHref}`);
  if (hreflangs.en !== expected.enHref) problems.push(`hreflang en expected ${expected.enHref}`);
  if (expected.xDefault) {
    if (hreflangs['x-default'] !== expected.xDefault) problems.push(`x-default expected ${expected.xDefault}`);
  } else if (hreflangs['x-default']) {
    problems.push('x-default emitted on non-home URL');
  }
  if (hreflangs[sample.lang] !== expected.canonical) problems.push('self hreflang does not match canonical');
  if (hasNoindex(metaRobots, metaGooglebot, xRobots)) problems.push('noindex found');

  return {
    ...sample,
    status: res.status,
    canonical,
    hreflangs,
    metaRobots,
    metaGooglebot,
    xRobots,
    result: problems.length ? 'FAIL' : 'PASS',
    problems,
  };
}

function mdEscape(value) {
  return String(value || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function buildReport(results, sitemapCheck) {
  const lines = [];
  lines.push('# SEO Channel Split URL Check');
  lines.push('');
  lines.push(`- Checked at: ${new Date().toISOString()}`);
  lines.push(`- Fetch base: ${BASE_URL}`);
  lines.push(`- URL samples: ${results.length}`);
  lines.push(`- Failures: ${results.filter((item) => item.result !== 'PASS').length}`);
  lines.push(`- sitemap-en.xml URL count: ${sitemapCheck.count}`);
  lines.push(`- sitemap-en.xml required URLs: ${sitemapCheck.required.length - sitemapCheck.missing.length}/${sitemapCheck.required.length}`);
  lines.push('');
  lines.push('| Path | Lang | Status | Canonical | hreflang ko | hreflang en | x-default | Meta robots | X-Robots-Tag | Result | Notes |');
  lines.push('| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const item of results) {
    lines.push([
      item.path,
      item.lang,
      item.status,
      mdEscape(item.canonical),
      mdEscape(item.hreflangs.ko),
      mdEscape(item.hreflangs.en),
      mdEscape(item.hreflangs['x-default']),
      mdEscape(item.metaRobots || item.metaGooglebot),
      mdEscape(item.xRobots),
      item.result,
      mdEscape(item.problems.join('; ') || 'OK'),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  lines.push('');
  lines.push('## sitemap-en.xml Required Loc Membership');
  lines.push('');
  lines.push(`- File present: ${sitemapCheck.exists ? 'yes' : 'no'}`);
  lines.push(`- URL count: ${sitemapCheck.count}`);
  lines.push(`- Required URL membership: ${sitemapCheck.required.length - sitemapCheck.missing.length}/${sitemapCheck.required.length}`);
  lines.push(`- EN home trailing slash check: ${sitemapCheck.enHomeTrailingSlashOk ? 'PASS' : 'FAIL'} (${sitemapCheck.enHomeLoc})`);
  lines.push('');
  lines.push('| Required path | loc | Result |');
  lines.push('| --- | --- | --- |');
  for (const item of sitemapCheck.required) {
    lines.push(`| ${item.path} | ${item.loc} | ${item.present ? 'OK' : 'MISSING'} |`);
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

    const sitemapCheck = inspectEnSitemapMembership();
    console.log(`[sitemap-en] URL count: ${sitemapCheck.count}`);
    console.log(
      `[sitemap-en] required URLs: ${sitemapCheck.required.length - sitemapCheck.missing.length}/${sitemapCheck.required.length}`
    );
    for (const item of sitemapCheck.required) {
      console.log(`[sitemap-en]\t${item.present ? 'OK' : 'MISSING'}\t${item.path}`);
    }

    const results = [];
    for (const sample of SAMPLES) {
      const result = await inspectSample(sample);
      results.push(result);
      console.log(`${result.result}\t${sample.path}\t${result.canonical || '-'}`);
    }

    fs.writeFileSync(REPORT_PATH, buildReport(results, sitemapCheck), 'utf8');
    console.log(`Wrote ${path.relative(ROOT, REPORT_PATH)}`);

    if (sitemapCheck.missing.length || !sitemapCheck.enHomeTrailingSlashOk || results.some((item) => item.result !== 'PASS')) {
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
