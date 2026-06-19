const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const matter = require('gray-matter');

const SITE_URL = 'https://www.finmaphub.com';
const ROOT = process.cwd();
const POSTS_ROOT = path.join(ROOT, 'content', 'posts');
const DEFAULT_PORT = Number(process.env.POST_PUBLISH_SEO_PORT || 8017);
const USE_LOCAL_SERVER = process.argv.includes('--local-server');
const BASE_URL = getArgValue('--base') || (USE_LOCAL_SERVER ? `http://127.0.0.1:${DEFAULT_PORT}` : SITE_URL);
const SITEMAPS = {
  main: path.join(ROOT, 'public', 'sitemap-0.xml'),
  ko: path.join(ROOT, 'public', 'sitemap-ko.xml'),
  en: path.join(ROOT, 'public', 'sitemap-en.xml'),
  enPrefix: path.join(ROOT, 'public', 'en', 'sitemap.xml'),
};
const ROBOTS_TXT_PATH = path.join(ROOT, 'public', 'robots.txt');

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : '';
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function isNoindex(data) {
  return data?.draft === true || data?.noindex === true || String(data?.robots || '').toLowerCase().includes('noindex');
}

function postUrlFromFile(fullPath) {
  const rel = path.relative(POSTS_ROOT, fullPath).replace(/\\/g, '/');
  const parts = rel.split('/');
  if (parts.length < 3) return null;
  const category = parts[0];
  const lang = parts[1];
  const slug = parts[parts.length - 1].replace(/\.md$/, '');
  if (!category || !['ko', 'en'].includes(lang) || !slug) return null;

  let data = {};
  try {
    data = matter(fs.readFileSync(fullPath, 'utf8')).data || {};
  } catch {
    data = {};
  }
  if (isNoindex(data)) return null;

  const prefix = lang === 'en' ? '/en' : '';
  return {
    url: `${SITE_URL}${prefix}/posts/${category}/${slug}`,
    fileModifiedAt: fs.statSync(fullPath).mtime.toISOString(),
  };
}

function recentPostUrls(limit) {
  return walkDir(POSTS_ROOT)
    .filter((file) => file.endsWith('.md'))
    .map(postUrlFromFile)
    .filter(Boolean)
    .sort((a, b) => new Date(b.fileModifiedAt).getTime() - new Date(a.fileModifiedAt).getTime())
    .slice(0, limit)
    .map((item) => item.url);
}

function extractLocs(xml) {
  return Array.from(String(xml || '').matchAll(/<loc>([\s\S]*?)<\/loc>/g), (match) => match[1].trim()).filter(Boolean);
}

function extractRssLinks(xml) {
  return Array.from(String(xml || '').matchAll(/<link>([\s\S]*?)<\/link>/g), (match) => match[1].trim()).filter(Boolean);
}

function normalizeLocForMembership(loc) {
  try {
    const parsed = new URL(loc);
    if (parsed.origin === SITE_URL && parsed.pathname === '/' && !parsed.search && !parsed.hash) {
      return `${SITE_URL}/`;
    }
  } catch {
    return loc;
  }
  return loc;
}

function readLocSet(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  return new Set(extractLocs(fs.readFileSync(filePath, 'utf8')).map(normalizeLocForMembership));
}

function loadSitemapSets() {
  return {
    main: readLocSet(SITEMAPS.main),
    ko: readLocSet(SITEMAPS.ko),
    en: readLocSet(SITEMAPS.en),
    enPrefix: readLocSet(SITEMAPS.enPrefix),
  };
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

function hasNoindex(...values) {
  return values.join(',').toLowerCase().includes('noindex');
}

function publicUrlFromInput(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  const parsed = new URL(trimmed, SITE_URL);
  if (parsed.origin !== SITE_URL) {
    throw new Error(`Only ${SITE_URL} URLs are supported: ${trimmed}`);
  }
  const pathname = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/+$/, '');
  return `${SITE_URL}${pathname}${parsed.search}`;
}

function fetchUrlForPublicUrl(publicUrl) {
  const parsed = new URL(publicUrl);
  const base = BASE_URL.replace(/\/+$/, '');
  return `${base}${parsed.pathname}${parsed.search}`;
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
    'user-agent': 'Finmap-Post-Publish-SEO-Verify/1.0',
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
      finalUrl: toPublicUrl(currentUrl),
      redirects,
    };
  }

  throw new Error(`Too many redirects while checking ${url}`);
}

function stripEnPrefix(pathname) {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  return pathname || '/';
}

function expectedHreflangs(publicUrl) {
  const parsed = new URL(publicUrl);
  const koPath = stripEnPrefix(parsed.pathname);
  const enPath = koPath === '/' ? '/en' : `/en${koPath}`;
  return {
    ko: `${SITE_URL}${koPath}`,
    en: `${SITE_URL}${enPath}`,
  };
}

function parseRobotsTxt() {
  if (!fs.existsSync(ROBOTS_TXT_PATH)) return [];
  const lines = fs.readFileSync(ROBOTS_TXT_PATH, 'utf8').split(/\r?\n/);
  return lines
    .map((line) => line.replace(/#.*/, '').trim())
    .filter((line) => /^disallow\s*:/i.test(line))
    .map((line) => line.replace(/^disallow\s*:/i, '').trim())
    .filter(Boolean);
}

function isRobotsTxtBlocked(pathname, disallowRules) {
  return disallowRules.some((rule) => rule !== '/' && pathname.startsWith(rule));
}

async function fetchRssSet() {
  try {
    const rssUrl = `${BASE_URL.replace(/\/+$/, '')}/rss.xml`;
    const res = await fetch(rssUrl, {
      redirect: 'follow',
      headers: { 'user-agent': 'Finmap-Post-Publish-SEO-Verify/1.0' },
    });
    if (!res.ok) return { ok: false, set: new Set(), status: res.status };
    return { ok: true, set: new Set(extractRssLinks(await res.text())), status: res.status };
  } catch (error) {
    return { ok: false, set: new Set(), status: `error: ${error.message}` };
  }
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

async function waitForLocalServer() {
  const healthUrl = `${BASE_URL.replace(/\/+$/, '')}/healthz`;
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

function collectInputUrls() {
  const recent = hasFlag('--recent');
  const limit = Math.max(1, Math.min(Number(getArgValue('--limit')) || 10, 200));
  const positional = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
  const urls = recent ? recentPostUrls(limit) : positional;
  return Array.from(new Set(urls.map(publicUrlFromInput).filter(Boolean)));
}

async function inspectUrl(publicUrl, context) {
  const lang = new URL(publicUrl).pathname.startsWith('/en/') || new URL(publicUrl).pathname === '/en' ? 'en' : 'ko';
  const fetched = await fetchFinal(fetchUrlForPublicUrl(publicUrl));
  const canonical = extractCanonical(fetched.html);
  const hreflangs = extractHreflangs(fetched.html);
  const metaRobots = extractMeta(fetched.html, 'robots');
  const metaGooglebot = extractMeta(fetched.html, 'googlebot');
  const xRobots = fetched.res.headers.get('x-robots-tag') || '';
  const expectedHref = expectedHreflangs(publicUrl);
  const pathname = new URL(publicUrl).pathname;
  const problems = [];
  const sitemap = {
    main: context.sitemaps.main.has(publicUrl),
    channel: lang === 'en' ? context.sitemaps.en.has(publicUrl) : context.sitemaps.ko.has(publicUrl),
    enPrefix: context.sitemaps.enPrefix.has(publicUrl),
  };
  const rssIncluded = lang === 'ko' ? context.rss.set.has(publicUrl) : false;
  const robotsTxtBlocked = isRobotsTxtBlocked(pathname, context.robotsDisallow);

  if (fetched.res.status !== 200) problems.push(`status ${fetched.res.status}`);
  if (fetched.finalUrl !== publicUrl) problems.push(`finalUrl expected ${publicUrl}`);
  if (canonical !== publicUrl) problems.push(`canonical expected ${publicUrl}`);
  if (robotsTxtBlocked) problems.push('blocked by robots.txt');
  if (hasNoindex(metaRobots, metaGooglebot, xRobots)) problems.push('noindex found');
  if (!sitemap.main) problems.push('missing from sitemap-0.xml');
  if (!sitemap.channel) problems.push(`missing from sitemap-${lang}.xml`);
  if (lang === 'en' && !sitemap.enPrefix) problems.push('missing from /en/sitemap.xml');
  if (lang === 'ko' && sitemap.enPrefix) problems.push('KO URL found in /en/sitemap.xml');
  if (hreflangs.ko !== expectedHref.ko) problems.push(`hreflang ko expected ${expectedHref.ko}`);
  if (hreflangs.en !== expectedHref.en) problems.push(`hreflang en expected ${expectedHref.en}`);

  return {
    url: publicUrl,
    lang,
    status: fetched.res.status,
    finalUrl: fetched.finalUrl,
    canonical,
    metaRobots: metaRobots || metaGooglebot || '',
    xRobots,
    robotsTxtBlocked,
    sitemap,
    rssIncluded,
    hreflangKo: hreflangs.ko || '',
    hreflangEn: hreflangs.en || '',
    result: problems.length ? 'FAIL' : 'PASS',
    problems,
  };
}

function printResults(results, rssStatus) {
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`RSS fetch status: ${rssStatus}`);
  console.log('| URL | Lang | HTTP | Final URL | Canonical self | Robots blocked | Meta noindex | Sitemap | RSS | hreflang pair | Result | Notes |');
  console.log('| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const item of results) {
    const canonicalSelf = item.canonical === item.url ? 'yes' : 'no';
    const metaNoindex = hasNoindex(item.metaRobots, item.xRobots) ? 'yes' : 'no';
    const sitemap = [
      item.sitemap.main ? 'main:yes' : 'main:no',
      item.sitemap.channel ? `${item.lang}:yes` : `${item.lang}:no`,
      item.lang === 'en' ? (item.sitemap.enPrefix ? 'enPrefix:yes' : 'enPrefix:no') : 'enPrefix:N/A',
    ].join(', ');
    const rss = item.lang === 'ko' ? (item.rssIncluded ? 'yes' : 'no') : 'N/A';
    const hreflangPair = item.hreflangKo && item.hreflangEn ? 'yes' : 'no';
    console.log(`| ${item.url} | ${item.lang} | ${item.status} | ${item.finalUrl} | ${canonicalSelf} | ${item.robotsTxtBlocked ? 'yes' : 'no'} | ${metaNoindex} | ${sitemap} | ${rss} | ${hreflangPair} | ${item.result} | ${item.problems.join('; ') || 'OK'} |`);
  }
}

async function main() {
  let server = null;
  try {
    if (USE_LOCAL_SERVER) {
      server = startLocalServer();
      await waitForLocalServer();
    }

    const urls = collectInputUrls();
    if (!urls.length) {
      throw new Error('No URLs provided. Use URLs as arguments or pass --recent --limit=10.');
    }

    const context = {
      sitemaps: loadSitemapSets(),
      robotsDisallow: parseRobotsTxt(),
      rss: await fetchRssSet(),
    };
    const results = [];
    for (const url of urls) {
      results.push(await inspectUrl(url, context));
    }
    printResults(results, context.rss.status);

    if (results.some((item) => item.result !== 'PASS')) {
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
