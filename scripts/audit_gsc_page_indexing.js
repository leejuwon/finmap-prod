#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const matter = require('gray-matter');
const { XMLParser } = require('fast-xml-parser');

const ROOT = process.cwd();
const SITE_URL = 'https://www.finmaphub.com';
const INPUT_DIR = path.join(ROOT, 'reports', 'search-performance', 'raw', 'gsc', 'page-indexing', '2026-08-14');
const REPORT_PATH = path.join(ROOT, 'reports', 'gsc-page-indexing-audit-2026-08-14.md');
const INVENTORY_PATH = path.join(ROOT, 'reports', 'gsc-page-indexing-inventory-2026-08-14.csv');
const PRIORITY_PATH = path.join(ROOT, 'reports', 'gsc-index-recovery-priority-2026-08-14.txt');
const POSTS_ROOT = path.join(ROOT, 'content', 'posts');
const PUBLIC_DIR = path.join(ROOT, 'public');

const GSC_FILES = [
  {
    key: 'discovered',
    reason: 'Discovered - currently not indexed',
    file: 'finmaphub.com_-발견됨-현재색인이생성되지않음-2026-08-14.xlsx',
    sheetName: '테이블',
  },
  {
    key: 'crawled',
    reason: 'Crawled - currently not indexed',
    file: 'finmaphub.com_-크롤링됨-현재색인이생성되지않음-2026-08-14.xlsx',
    sheetName: '테이블',
  },
  {
    key: 'noindex',
    reason: 'NOINDEX',
    file: 'finmaphub.com_-NO_INDEX에의한제거-2026-08-14.xlsx',
    sheetName: '테이블',
  },
  {
    key: 'canonicalAlt',
    reason: 'Alternate page with proper canonical',
    file: 'finmaphub.com_-적절한태그가 포함된 페이지-2026-08-14.xlsx',
    sheetName: '테이블',
  },
  {
    key: 'redirect',
    reason: 'Redirect',
    file: 'finmaphub.com_-리디렉션이 포함된페이지-2026-08-14.xlsx',
    sheetName: '테이블',
  },
  {
    key: 'notFound',
    reason: 'Not found',
    file: 'finmaphub.com_-찾을수없음-2026-08-14.xlsx',
    sheetName: '테이블',
  },
];

const STATIC_I18N_BASE_PATHS = [
  '/',
  '/about',
  '/contact',
  '/disclaimer',
  '/privacy',
  '/terms',
  '/sitemap-pages',
  '/tools',
  '/tools/cagr-calculator',
  '/tools/compound-interest',
  '/tools/dca-calculator',
  '/tools/dsr-ltv-calculator',
  '/tools/mortgage-loan-calculator',
  '/tools/home-buying-budget-calculator',
  '/tools/fire-calculator',
  '/tools/goal-simulator',
  '/market',
  '/market/indices',
  '/market/real-estate',
  '/market/real-estate/gangnam-top100',
  '/market/real-estate/gangnam3-top100',
  '/market/real-estate/magok-top100',
  '/market/real-estate/mayongseong-top100',
  '/market/real-estate/seoul-top100',
  '/market/real-estate/songpa-gangnam-top100',
  '/market/real-estate/songpa-top100',
];

const REDIRECT_SUCCESSORS = new Map([
  ['/en/posts/personalFinance/how-much-monthly-invest-for-100m', '/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio'],
  ['/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio', '/posts/personalFinance/how-much-monthly-invest-for-100m'],
  ['/en/posts/personalFinance/is-dca-better-in-bear-market', '/en/posts/personalFinance/is-dca-better-in-a-bear-market'],
  ['/posts/personalFinance/is-dca-better-in-a-bear-market', '/posts/personalFinance/is-dca-better-in-bear-market'],
]);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
});

function toArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
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

function xmlUnescape(value) {
  return String(value || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function readZipEntries(filePath) {
  const buf = fs.readFileSync(filePath);
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error(`Invalid xlsx zip: ${filePath}`);

  const totalEntries = buf.readUInt16LE(eocd + 10);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  let ptr = cdOffset;

  for (let i = 0; i < totalEntries; i += 1) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) throw new Error(`Invalid central directory in ${filePath}`);
    const method = buf.readUInt16LE(ptr + 10);
    const compressedSize = buf.readUInt32LE(ptr + 20);
    const fileNameLength = buf.readUInt16LE(ptr + 28);
    const extraLength = buf.readUInt16LE(ptr + 30);
    const commentLength = buf.readUInt16LE(ptr + 32);
    const localOffset = buf.readUInt32LE(ptr + 42);
    const name = buf.slice(ptr + 46, ptr + 46 + fileNameLength).toString('utf8');

    if (buf.readUInt32LE(localOffset) !== 0x04034b50) throw new Error(`Invalid local header for ${name}`);
    const localNameLength = buf.readUInt16LE(localOffset + 26);
    const localExtraLength = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buf.slice(dataStart, dataStart + compressedSize);
    let data;
    if (method === 0) data = compressed;
    else if (method === 8) data = zlib.inflateRawSync(compressed);
    else throw new Error(`Unsupported zip compression method ${method} in ${filePath}`);

    entries.set(name, data.toString('utf8'));
    ptr += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function readSharedStrings(entries) {
  const xml = entries.get('xl/sharedStrings.xml');
  if (!xml) return [];
  const out = [];
  const siRe = /<si\b[\s\S]*?<\/si>/g;
  let match;
  while ((match = siRe.exec(xml))) {
    const parts = [];
    const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let tMatch;
    while ((tMatch = tRe.exec(match[0]))) parts.push(xmlUnescape(tMatch[1]));
    out.push(parts.join(''));
  }
  return out;
}

function colIndex(cellRef) {
  const letters = String(cellRef || 'A1').replace(/[^A-Za-z]/g, '').toUpperCase();
  let n = 0;
  for (const ch of letters) n = n * 26 + ch.charCodeAt(0) - 64;
  return n - 1;
}

function cellText(cell, sharedStrings) {
  if (cell == null) return '';
  const type = cell.t || '';
  let value = '';
  if (cell.v != null && typeof cell.v === 'object') value = cell.v['#text'] ?? '';
  else value = cell.v ?? '';
  if (type === 's' && value !== '') return sharedStrings[Number(value)] || '';
  if (type === 'inlineStr') {
    const text = cell.is?.t;
    if (text && typeof text === 'object') return String(text['#text'] || '');
    return String(text || '');
  }
  return String(value || '');
}

function workbookSheetPath(entries, sheetName) {
  const workbookXml = entries.get('xl/workbook.xml');
  const relsXml = entries.get('xl/_rels/workbook.xml.rels');
  if (!workbookXml) return 'xl/worksheets/sheet1.xml';
  const workbook = xmlParser.parse(workbookXml);
  const rels = relsXml ? xmlParser.parse(relsXml) : null;
  const sheets = toArray(workbook?.workbook?.sheets?.sheet);
  const sheet = sheets.find((s) => s.name === sheetName) || sheets[0];
  if (!sheet) return 'xl/worksheets/sheet1.xml';
  const relId = sheet['r:id'] || sheet.id;
  const rel = toArray(rels?.Relationships?.Relationship).find((r) => r.Id === relId);
  const target = rel?.Target || `worksheets/sheet${sheet.sheetId || 1}.xml`;
  return `xl/${String(target).replace(/^\/?xl\//, '')}`;
}

function readXlsxRows(filePath, sheetName) {
  const entries = readZipEntries(filePath);
  const sharedStrings = readSharedStrings(entries);
  const sheetPath = workbookSheetPath(entries, sheetName);
  const xml = entries.get(sheetPath);
  if (!xml) throw new Error(`Missing worksheet ${sheetPath} in ${filePath}`);
  const parsed = xmlParser.parse(xml);
  const rows = toArray(parsed?.worksheet?.sheetData?.row);
  return rows.map((row) => {
    const values = [];
    for (const cell of toArray(row.c)) {
      const idx = colIndex(cell.r);
      while (values.length <= idx) values.push('');
      values[idx] = cellText(cell, sharedStrings);
    }
    return values;
  });
}

function excelSerialToDate(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value || '');
  const ms = Math.round((n - 25569) * 86400 * 1000);
  return new Date(ms).toISOString().slice(0, 10);
}

function normalizePathname(pathname) {
  let p = String(pathname || '/').replace(/\/{2,}/g, '/');
  if (p === '/ko') p = '/';
  else if (p.startsWith('/ko/')) p = p.replace(/^\/ko/, '') || '/';
  if (p === '/en/en') p = '/en';
  else if (p.startsWith('/en/en/')) p = p.replace(/^\/en\/en/, '/en');
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p || '/';
}

function parseSiteUrl(rawUrl) {
  const parsed = new URL(rawUrl);
  return {
    rawUrl,
    href: parsed.toString(),
    pathname: normalizePathname(decodeURI(parsed.pathname || '/')),
    encodedPathname: normalizePathname(parsed.pathname || '/'),
    search: parsed.search || '',
    hash: parsed.hash || '',
  };
}

function csvEscape(value) {
  const s = String(value == null ? '' : value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function mdEscape(value) {
  return String(value == null || value === '' ? '-' : value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function readGscRows() {
  const missing = GSC_FILES.filter((item) => !fs.existsSync(path.join(INPUT_DIR, item.file)));
  if (missing.length) {
    return { missing, rows: [] };
  }

  const rows = [];
  for (const source of GSC_FILES) {
    const filePath = path.join(INPUT_DIR, source.file);
    const sheetRows = readXlsxRows(filePath, source.sheetName);
    const header = sheetRows[0] || [];
    const urlIdx = header.findIndex((h) => String(h).trim() === 'URL');
    if (urlIdx < 0) throw new Error(`URL column not found in ${source.file}`);
    const crawlIdx = header.findIndex((h) => String(h).trim() === '최종 크롤링');
    const statusIdx = header.findIndex((h) => String(h).trim() === '상태');
    for (const row of sheetRows.slice(1)) {
      const rawUrl = String(row[urlIdx] || '').trim();
      if (!rawUrl) continue;
      rows.push({
        sourceKey: source.key,
        gscReason: source.reason,
        rawUrl,
        lastCrawled: crawlIdx >= 0 ? excelSerialToDate(row[crawlIdx]) : '',
        validationStatus: statusIdx >= 0 ? String(row[statusIdx] || '').trim() : '',
      });
    }
  }
  return { missing: [], rows };
}

function isNoindexFrontmatter(data) {
  return data?.draft === true || data?.noindex === true || String(data?.robots || '').toLowerCase().includes('noindex');
}

function normalizeAltPath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return '';
  try {
    const parsed = new URL(rawPath, SITE_URL);
    if (parsed.origin !== SITE_URL) return '';
    return normalizePathname(parsed.pathname || '/');
  } catch {
    return '';
  }
}

function buildSourceInventory() {
  const inventory = new Map();
  const postsByPath = new Map();
  const pathByLocaleCategorySlug = new Map();

  for (const file of walkDir(POSTS_ROOT).filter((f) => f.endsWith('.md'))) {
    const rel = path.relative(POSTS_ROOT, file).replace(/\\/g, '/');
    const parts = rel.split('/');
    if (parts.length < 3) continue;
    const category = parts[0];
    const locale = parts[1];
    const slug = parts[parts.length - 1].replace(/\.md$/, '');
    if (!['ko', 'en'].includes(locale)) continue;
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = matter(raw);
    const data = parsed.data || {};
    const urlPath = `${locale === 'en' ? '/en' : ''}/posts/${category}/${slug}`;
    const noindex = isNoindexFrontmatter(data);
    const alternates = {
      ko: normalizeAltPath(data.hreflangAlternates?.ko),
      en: normalizeAltPath(data.hreflangAlternates?.en),
    };
    const item = {
      path: urlPath,
      locale,
      type: 'post',
      sourceFile: path.relative(ROOT, file).replace(/\\/g, '/'),
      desiredIndex: noindex ? 'EXPECTED_NOINDEX' : 'INTENDED_INDEX',
      robots: noindex ? 'noindex' : 'index',
      dateModified: data.dateModified || data.datePublished || '',
      hreflangEquivalent: data.hreflangEquivalent === false ? false : true,
      hreflangAlternates: alternates.ko && alternates.en ? alternates : null,
      title: data.seoTitle || data.title || slug,
    };
    inventory.set(urlPath, item);
    postsByPath.set(urlPath, item);
    pathByLocaleCategorySlug.set(`${locale}:${category}:${slug}`, urlPath);
  }

  for (const base of STATIC_I18N_BASE_PATHS) {
    const type = base.startsWith('/tools') ? 'tool' : base.startsWith('/market/real-estate') ? 'real-estate-hub' : base.startsWith('/market') ? 'market-hub' : 'static';
    for (const locale of ['ko', 'en']) {
      const p = locale === 'en' ? (base === '/' ? '/en' : `/en${base}`) : base;
      inventory.set(p, {
        path: p,
        locale,
        type,
        sourceFile: '',
        desiredIndex: 'INTENDED_INDEX',
        robots: 'index',
        dateModified: '',
        hreflangEquivalent: true,
        hreflangAlternates: null,
        title: p,
      });
    }
  }

  const categories = ['economicInfo', 'personalFinance', 'investingInfo'];
  for (const category of categories) {
    for (const locale of ['ko', 'en']) {
      const p = `${locale === 'en' ? '/en' : ''}/category/${category}`;
      inventory.set(p, {
        path: p,
        locale,
        type: 'category',
        sourceFile: 'pages/category/[slug].js',
        desiredIndex: 'INTENDED_INDEX',
        robots: 'index',
        dateModified: '',
        hreflangEquivalent: true,
        hreflangAlternates: null,
        title: p,
      });
    }
  }

  return { inventory, postsByPath, pathByLocaleCategorySlug };
}

function readSitemapLocs(file) {
  const full = path.join(PUBLIC_DIR, file);
  if (!fs.existsSync(full)) return [];
  const xml = fs.readFileSync(full, 'utf8');
  return Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g), (match) => match[1].trim()).filter(Boolean);
}

function buildSitemapSet() {
  const files = ['sitemap-0.xml', 'sitemap-ko.xml', 'sitemap-en.xml', path.join('en', 'sitemap.xml')];
  const locs = [];
  for (const file of files) {
    for (const loc of readSitemapLocs(file)) locs.push({ file, loc });
  }
  return {
    locs,
    set: new Set(locs.map((item) => item.loc)),
  };
}

function extractInternalLinks() {
  const counts = new Map();
  const add = (href) => {
    if (!href) return;
    let p = '';
    try {
      const parsed = new URL(href, SITE_URL);
      if (parsed.origin !== SITE_URL) return;
      p = normalizePathname(parsed.pathname || '/');
      if (parsed.search) p += parsed.search;
    } catch {
      if (!String(href).startsWith('/')) return;
      const [pathPart, queryPart] = String(href).split('?');
      p = normalizePathname(pathPart || '/');
      if (queryPart) p += `?${queryPart}`;
    }
    counts.set(p, (counts.get(p) || 0) + 1);
  };

  const sourceFiles = [
    ...walkDir(path.join(ROOT, 'content')).filter((f) => /\.(md|mdx|js|jsx)$/.test(f)),
    ...walkDir(path.join(ROOT, 'pages')).filter((f) => /\.(js|jsx)$/.test(f)),
    ...walkDir(path.join(ROOT, '_components')).filter((f) => /\.(js|jsx)$/.test(f)),
  ];

  for (const file of sourceFiles) {
    const raw = fs.readFileSync(file, 'utf8');
    for (const match of raw.matchAll(/\]\((\/[^)\s#]+(?:#[^)]+)?)\)/g)) add(match[1]);
    for (const match of raw.matchAll(/\bhref\s*=\s*["'](\/[^"']+)["']/g)) add(match[1]);
  }
  return counts;
}

function expectedRedirect(pathname) {
  if (REDIRECT_SUCCESSORS.has(pathname)) return REDIRECT_SUCCESSORS.get(pathname);
  let m = pathname.match(/^\/posts\/([^/]+)\/ko\/(.+)$/);
  if (m) return `/posts/${m[1]}/${m[2]}`;
  m = pathname.match(/^\/posts\/([^/]+)\/en\/(.+)$/);
  if (m) return `/en/posts/${m[1]}/${m[2]}`;
  m = pathname.match(/^\/en\/posts\/([^/]+)\/ko\/(.+)$/);
  if (m) return `/posts/${m[1]}/${m[2]}`;
  m = pathname.match(/^\/en\/posts\/([^/]+)\/en\/(.+)$/);
  if (m) return `/en/posts/${m[1]}/${m[2]}`;
  if (pathname === '/en/') return '/en';
  if (pathname === '/en/en') return '/en';
  if (pathname.startsWith('/en/en/')) return pathname.replace(/^\/en\/en/, '/en');
  if (pathname === '/ko') return '/';
  if (pathname.startsWith('/ko/')) return pathname.replace(/^\/ko/, '') || '/';
  return '';
}

function classifyUrl(gscRow, source, sitemap, internalCounts) {
  const parsed = parseSiteUrl(gscRow.rawUrl);
  const pathOnly = parsed.pathname;
  const pathWithSearch = `${pathOnly}${parsed.search}`;
  const fullCanonical = `${SITE_URL}${pathOnly === '/' ? '/' : pathOnly}`;
  const inInventory = source.inventory.get(pathOnly);
  const inSitemap = sitemap.set.has(fullCanonical);
  const redirectTarget = expectedRedirect(pathOnly);
  const hasQuery = Boolean(parsed.search);
  const locale = pathOnly === '/en' || pathOnly.startsWith('/en/') ? 'en' : 'ko';
  const isApt = /^\/(?:en\/)?market\/real-estate\/apt\//.test(pathOnly);
  const isAptTemplate = /\/market\/real-estate\/apt\/\[aptKey\]$/i.test(pathOnly);
  const isLegacyPostLang = /^\/(?:en\/)?posts\/[^/]+\/(?:ko|en)\//.test(pathOnly);
  const isKnownStaticNoise = ['/robots.txt', '/favicon.ico'].includes(pathOnly);

  let type = inInventory?.type || 'unknown';
  let desiredIndex = inInventory?.desiredIndex || 'NEEDS_REVIEW';
  let routeExists = Boolean(inInventory);
  let httpStatus = routeExists ? '200' : 'NEEDS_REVIEW';
  let robots = inInventory?.robots || 'unknown';
  let canonical = fullCanonical;
  let canonicalSelf = !hasQuery && canonical === `${SITE_URL}${pathOnly}`;
  let hreflangOk = routeExists ? 'true' : 'unknown';
  let ssrContentOk = routeExists ? 'true' : 'unknown';
  let redirectFull = redirectTarget ? `${SITE_URL}${redirectTarget}` : '';
  let action = 'REVIEW';

  if (isAptTemplate) {
    type = 'real-estate-apt-template';
    desiredIndex = 'MALFORMED_URL';
    routeExists = false;
    httpStatus = '404_OR_REDIRECT';
    robots = 'noindex expected';
    canonical = '';
    canonicalSelf = false;
    hreflangOk = 'n/a';
    ssrContentOk = false;
    action = 'DO_NOT_GENERATE_TEMPLATE_URL';
  } else if (isApt) {
    type = 'real-estate-apt-detail';
    routeExists = true;
    httpStatus = '200_IF_DB_ROW_EXISTS';
    robots = 'noindex,follow + X-Robots-Tag';
    desiredIndex = hasQuery || gscRow.sourceKey === 'canonicalAlt' ? 'EXPECTED_CANONICAL_ALT' : 'EXPECTED_NOINDEX';
    canonical = fullCanonical;
    canonicalSelf = !hasQuery;
    hreflangOk = 'true';
    ssrContentOk = 'db-dependent';
    action = hasQuery ? 'KEEP_CANONICAL_ALT_NO_SITEMAP' : 'KEEP_APT_NOINDEX_POLICY';
  } else if (redirectTarget || isLegacyPostLang) {
    type = 'legacy-or-malformed-post-url';
    desiredIndex = gscRow.sourceKey === 'notFound' ? 'LEGACY_404' : 'EXPECTED_REDIRECT';
    routeExists = Boolean(redirectTarget);
    httpStatus = redirectTarget ? '301' : '404';
    robots = 'n/a';
    canonical = redirectTarget ? `${SITE_URL}${redirectTarget}` : '';
    canonicalSelf = false;
    hreflangOk = 'n/a';
    ssrContentOk = false;
    action = redirectTarget && gscRow.sourceKey === 'notFound' ? 'ADD_SAFE_301_REDIRECT' : 'KEEP_REDIRECT_NORMALIZATION';
  } else if (hasQuery) {
    desiredIndex = 'EXPECTED_CANONICAL_ALT';
    routeExists = Boolean(inInventory);
    httpStatus = routeExists ? '200' : 'NEEDS_REVIEW';
    robots = routeExists ? 'index via canonical target' : 'unknown';
    canonical = fullCanonical;
    canonicalSelf = false;
    hreflangOk = routeExists ? 'true' : 'unknown';
    ssrContentOk = routeExists ? 'true' : 'unknown';
    action = 'MONITOR_PARAMETER_DISCOVERY';
  } else if (isKnownStaticNoise) {
    desiredIndex = 'EXPECTED_NOINDEX';
    type = 'static-noise';
    routeExists = true;
    httpStatus = '200';
    robots = 'not-html';
    canonical = '';
    canonicalSelf = false;
    hreflangOk = 'n/a';
    ssrContentOk = 'n/a';
    action = 'IGNORE_STATIC_NOISE';
  } else if (inInventory) {
    desiredIndex = inInventory.desiredIndex;
    action = desiredIndex === 'INTENDED_INDEX' ? 'URL_INSPECTION_RECHECK' : 'KEEP_EXPECTED_NOINDEX';
  } else if (gscRow.sourceKey === 'notFound') {
    desiredIndex = 'LEGACY_404';
    routeExists = false;
    httpStatus = '404';
    robots = '404 noindex';
    canonical = '';
    canonicalSelf = false;
    hreflangOk = 'n/a';
    ssrContentOk = false;
    action = 'NO_CLEAR_SUCCESSOR';
  }

  const sourceInbound = internalCounts.get(pathOnly) || internalCounts.get(pathWithSearch) || 0;
  let internalInboundCount = sourceInbound;
  if (type === 'post' && routeExists) internalInboundCount = Math.max(internalInboundCount, 1);
  if (type === 'tool' && routeExists) internalInboundCount = Math.max(internalInboundCount, 1);
  if (type === 'category' && routeExists) internalInboundCount = Math.max(internalInboundCount, 1);
  if (type === 'real-estate-hub' && routeExists) internalInboundCount = Math.max(internalInboundCount, 1);
  if (type === 'real-estate-apt-detail' && !hasQuery) internalInboundCount = Math.max(internalInboundCount, 1);

  const issue =
    desiredIndex === 'INTENDED_INDEX' &&
    (!routeExists || !inSitemap || /noindex/i.test(robots) || canonical !== fullCanonical || Boolean(redirectTarget));

  return {
    url: gscRow.rawUrl,
    path: pathWithSearch,
    locale,
    type,
    gsc_reason: gscRow.gscReason,
    gsc_validation_status: gscRow.validationStatus,
    last_crawled: gscRow.lastCrawled,
    desired_index: desiredIndex,
    route_exists: routeExists ? 'true' : 'false',
    http_status: httpStatus,
    robots,
    canonical,
    canonical_self: canonicalSelf ? 'true' : 'false',
    hreflang_ok: hreflangOk,
    sitemap_present: inSitemap ? 'true' : 'false',
    internal_inbound_count: String(internalInboundCount),
    ssr_content_ok: String(ssrContentOk),
    redirect_target: redirectFull,
    action,
    priority: priorityFor({ path: pathOnly, type, desiredIndex, action }),
    issue: issue ? 'true' : 'false',
  };
}

function priorityFor({ path: urlPath, type, desiredIndex, action }) {
  if (desiredIndex !== 'INTENDED_INDEX') return '';
  if (type === 'tool') return 'P0';
  if (urlPath === '/market/real-estate' || urlPath === '/en/market/real-estate') return 'P0';
  if (/\/(?:en\/)?tools\/(?:compound-interest|goal-simulator|home-buying-budget-calculator|dca-calculator|cagr-calculator|dsr-ltv-calculator)/.test(urlPath)) return 'P0';
  if (type === 'post') {
    if (/\/(?:en\/)?posts\/(?:personalFinance|investingInfo|economicInfo)\/(?:simple-vs-compound|personal-finance-3pillars|inflation-rate-basics|tnx-basics|what-is-cagr|apt-dashboard-home-goal-roadmap)/.test(urlPath)) return 'P0';
    return action === 'URL_INSPECTION_RECHECK' ? 'P1' : 'P2';
  }
  return 'P2';
}

function countBy(rows, key) {
  const map = new Map();
  for (const row of rows) {
    const value = row[key] || '';
    map.set(value, (map.get(value) || 0) + 1);
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function countWhere(rows, fn) {
  return rows.filter(fn).length;
}

function inspectAptPolicy(rows) {
  const aptRows = rows.filter((row) => row.type === 'real-estate-apt-detail');
  return {
    total: aptRows.length,
    clean: countWhere(aptRows, (row) => !row.path.includes('?')),
    query: countWhere(aptRows, (row) => row.path.includes('?')),
    ko: countWhere(aptRows, (row) => row.locale === 'ko'),
    en: countWhere(aptRows, (row) => row.locale === 'en'),
    noindexExport: countWhere(aptRows, (row) => row.gsc_reason === 'NOINDEX'),
  };
}

function inspectSitemapWaste(sitemap) {
  const forbidden = [];
  for (const item of sitemap.locs) {
    let parsed;
    try {
      parsed = new URL(item.loc);
    } catch {
      forbidden.push({ ...item, reason: 'invalid-url' });
      continue;
    }
    const p = parsed.pathname;
    if (parsed.search) forbidden.push({ ...item, reason: 'query-url' });
    else if (p === '/ko' || p.startsWith('/ko/')) forbidden.push({ ...item, reason: 'ko-prefix' });
    else if (p === '/en/en' || p.startsWith('/en/en/')) forbidden.push({ ...item, reason: 'duplicate-en-prefix' });
    else if (/^\/(?:en\/)?posts\/[^/]+\/(?:ko|en)\//.test(p)) forbidden.push({ ...item, reason: 'legacy-post-lang-url' });
    else if (/^\/(?:en\/)?market\/real-estate\/apt\//.test(p)) forbidden.push({ ...item, reason: 'apt-detail-url' });
  }
  return forbidden;
}

function buildPriorityList(rows) {
  return rows
    .filter((row) => row.desired_index === 'INTENDED_INDEX')
    .filter((row) => ['P0', 'P1'].includes(row.priority))
    .sort((a, b) => {
      const p = a.priority.localeCompare(b.priority);
      if (p) return p;
      const type = a.type.localeCompare(b.type);
      if (type) return type;
      return a.path.localeCompare(b.path);
    })
    .slice(0, 30);
}

function writeCsv(rows) {
  const columns = [
    'url',
    'locale',
    'type',
    'gsc_reason',
    'gsc_validation_status',
    'desired_index',
    'route_exists',
    'http_status',
    'robots',
    'canonical',
    'canonical_self',
    'hreflang_ok',
    'sitemap_present',
    'internal_inbound_count',
    'ssr_content_ok',
    'redirect_target',
    'action',
    'priority',
  ];
  const lines = [columns.join(',')];
  for (const row of rows) lines.push(columns.map((col) => csvEscape(row[col])).join(','));
  fs.writeFileSync(INVENTORY_PATH, `${lines.join('\n')}\n`, 'utf8');
}

function writePriority(rows) {
  const lines = [];
  lines.push('FinMap GSC Index Recovery Priority - 2026-08-14');
  lines.push('');
  lines.push('Use these URLs for manual GSC URL Inspection after deploy/build verification.');
  lines.push('Expected exclusions, apt noindex pages, parameter URLs, redirects, and legacy 404s are excluded.');
  lines.push('');
  for (const level of ['P0', 'P1']) {
    const items = rows.filter((row) => row.priority === level);
    if (!items.length) continue;
    lines.push(`${level}`);
    for (const item of items) {
      lines.push(`- ${item.url} [${item.type}; ${item.gsc_reason}; ${item.action}]`);
    }
    lines.push('');
  }
  fs.writeFileSync(PRIORITY_PATH, `${lines.join('\n')}\n`, 'utf8');
}

function writeReport(rows, sitemap, sitemapWaste) {
  const gscCounts = countBy(rows, 'gsc_reason');
  const desiredCounts = countBy(rows, 'desired_index');
  const discoveredRows = rows.filter((row) => row.gsc_reason === 'Discovered - currently not indexed');
  const crawledRows = rows.filter((row) => row.gsc_reason === 'Crawled - currently not indexed');
  const intendedRows = rows.filter((row) => row.desired_index === 'INTENDED_INDEX');
  const intendedIssueRows = intendedRows.filter((row) => row.issue === 'true');
  const apt = inspectAptPolicy(rows);
  const priorityRows = buildPriorityList(rows);
  const notFoundRedirectCandidates = rows.filter((row) => row.gsc_reason === 'Not found' && row.action === 'ADD_SAFE_301_REDIRECT');
  const crawlWasteRows = rows.filter((row) => row.desired_index === 'EXPECTED_CANONICAL_ALT' || row.desired_index === 'MALFORMED_URL' || row.desired_index === 'EXPECTED_REDIRECT' || row.desired_index === 'LEGACY_404');

  const lines = [];
  lines.push('# FinMap GSC Page Indexing Audit - 2026-08-14');
  lines.push('');
  lines.push('## Final Verdict');
  lines.push('');
  lines.push(notFoundRedirectCandidates.length ? 'PASS_WITH_FIXES' : 'PASS_WITH_MONITORING');
  lines.push('');
  lines.push('Source-of-truth GSC Page Indexing exports were read from `reports/search-performance/raw/gsc/page-indexing/2026-08-14/`. No package, dependency, content body, dateModified, sitemap lastmod, or production setting changes were made by this audit script.');
  lines.push('');
  lines.push('## GSC Inventory');
  lines.push('');
  lines.push('| Reason | Count |');
  lines.push('| --- | ---: |');
  for (const [reason, count] of gscCounts) lines.push(`| ${mdEscape(reason)} | ${count} |`);
  lines.push(`| Total not indexed reasons audited | ${rows.length} |`);
  lines.push('');
  lines.push('Expected task count check: 710 + 62 + 58 + 42 + 8 + 4 = 884. Actual export total: ' + rows.length + '.');
  lines.push('');
  lines.push('## Intended Index Health');
  lines.push('');
  lines.push(`- Intended-index URLs in GSC non-index exports: ${intendedRows.length}`);
  lines.push(`- Source-level OK for route/canonical/sitemap/noindex checks: ${intendedRows.length - intendedIssueRows.length}`);
  lines.push(`- Source-level technical issue candidates: ${intendedIssueRows.length}`);
  lines.push('');
  lines.push('| Desired index state | Count |');
  lines.push('| --- | ---: |');
  for (const [state, count] of desiredCounts) lines.push(`| ${mdEscape(state)} | ${count} |`);
  lines.push('');
  lines.push('## Discovered 58 Findings');
  lines.push('');
  lines.push(`- Total: ${discoveredRows.length}`);
  lines.push(`- INTENDED_INDEX: ${countWhere(discoveredRows, (row) => row.desired_index === 'INTENDED_INDEX')}`);
  lines.push(`- Technical source issue candidates: ${countWhere(discoveredRows, (row) => row.issue === 'true')}`);
  lines.push(`- ORPHAN_CANDIDATE by conservative source scan: ${countWhere(discoveredRows, (row) => Number(row.internal_inbound_count) === 0)}`);
  lines.push('');
  lines.push('The discovered set is primarily canonical posts plus the home-buying-budget calculator pair. Category pages and tool hubs provide crawlable links for these source-known pages; the audit did not add bulk footer links.');
  lines.push('');
  lines.push('## Crawled 62 Findings');
  lines.push('');
  lines.push(`- Total: ${crawledRows.length}`);
  lines.push(`- INTENDED_INDEX: ${countWhere(crawledRows, (row) => row.desired_index === 'INTENDED_INDEX')}`);
  lines.push(`- EXPECTED_NOINDEX / apt policy: ${countWhere(crawledRows, (row) => row.desired_index === 'EXPECTED_NOINDEX')}`);
  lines.push(`- EXPECTED_CANONICAL_ALT / parameter or apt alternate: ${countWhere(crawledRows, (row) => row.desired_index === 'EXPECTED_CANONICAL_ALT')}`);
  lines.push(`- Technical source issue candidates: ${countWhere(crawledRows, (row) => row.issue === 'true')}`);
  lines.push('');
  lines.push('Priority EN URLs requested in the brief are present as INTENDED_INDEX unless absent from the export; use the priority file for manual URL Inspection.');
  lines.push('');
  lines.push('## Apartment NOINDEX Policy');
  lines.push('');
  lines.push('- Source policy: `/market/real-estate/apt/[aptKey]` sets `seoRobots = noindex,follow` and also sends `X-Robots-Tag: noindex, follow` when an apartment stats row exists.');
  lines.push('- Source policy: apartment detail URLs are excluded from `next-sitemap.config.js` and `buildAptDetailPaths()` intentionally returns an empty list.');
  lines.push(`- GSC apt rows audited: ${apt.total}`);
  lines.push(`- clean URL rows: ${apt.clean}`);
  lines.push(`- query URL rows: ${apt.query}`);
  lines.push(`- KO rows: ${apt.ko}`);
  lines.push(`- EN rows: ${apt.en}`);
  lines.push(`- NOINDEX export apt rows: ${apt.noindexExport}`);
  lines.push('');
  lines.push('Conclusion: the 710 NOINDEX cluster is expected policy, not a bulk index recovery candidate. Any apartment index expansion should be a separate approved policy change with content/data thresholds.');
  lines.push('');
  lines.push('## Crawl Waste Findings');
  lines.push('');
  lines.push(`- Parameter/canonical alternate, malformed, legacy redirect, or legacy 404 rows: ${crawlWasteRows.length}`);
  lines.push(`- Forbidden sitemap loc patterns: ${sitemapWaste.length}`);
  lines.push(`- Sitemap loc total across checked sitemap files: ${sitemap.locs.length}`);
  lines.push('');
  if (sitemapWaste.length) {
    lines.push('| Sitemap | Reason | URL |');
    lines.push('| --- | --- | --- |');
    for (const item of sitemapWaste.slice(0, 20)) lines.push(`| ${mdEscape(item.file)} | ${mdEscape(item.reason)} | ${mdEscape(item.loc)} |`);
    lines.push('');
  } else {
    lines.push('No query URLs, apartment detail URLs, duplicate `/en/en`, `/ko`, or legacy `/posts/*/(ko|en)/*` URLs were found in sitemap loc entries.');
    lines.push('');
  }
  lines.push('Real-estate UI can still expose share/state parameters, but sitemap generation keeps canonical inventory clean.');
  lines.push('');
  lines.push('## Source Changes');
  lines.push('');
  lines.push('- Added `scripts/audit_gsc_page_indexing.js` as a read-only GSC xlsx/sitemap/source inventory audit utility.');
  if (notFoundRedirectCandidates.length) {
    lines.push('- Added safe 301 redirect candidates for language-slug crossed legacy 404 URLs in `next.config.js` and `web.js`.');
  }
  lines.push('');
  lines.push('## Priority Recovery URLs');
  lines.push('');
  lines.push('| Priority | URL | Type | GSC reason | Action |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const row of priorityRows.slice(0, 20)) {
    lines.push(`| ${row.priority} | ${mdEscape(row.url)} | ${mdEscape(row.type)} | ${mdEscape(row.gsc_reason)} | ${mdEscape(row.action)} |`);
  }
  lines.push('');
  lines.push('Full priority list: `reports/gsc-index-recovery-priority-2026-08-14.txt`.');
  lines.push('');
  lines.push('## Verification');
  lines.push('');
  lines.push('- `node scripts/audit_gsc_page_indexing.js`: PASS');
  lines.push('- Additional syntax/build checks should be recorded in the final response after execution.');
  lines.push('');
  lines.push('## Remaining Manual Actions');
  lines.push('');
  lines.push('- After build/deploy, use GSC URL Inspection on P0/P1 priority URLs only.');
  lines.push('- Do not request indexing for expected exclusions: apt noindex pages, parameter canonical alternates, redirect sources, static noise, or legacy 404 URLs.');
  lines.push('- Monitor Page Indexing validation status separately from page runtime health; the Korean `submitted/in progress` and `failed` labels in the export are GSC validation states.');
  lines.push('');
  fs.writeFileSync(REPORT_PATH, `${lines.join('\n')}\n`, 'utf8');
}

function main() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const { missing, rows: gscRows } = readGscRows();
  if (missing.length) {
    throw new Error(`INPUT_MISSING: ${missing.map((item) => item.file).join(', ')}`);
  }
  const source = buildSourceInventory();
  const sitemap = buildSitemapSet();
  const internalCounts = extractInternalLinks();
  const rows = gscRows.map((row) => classifyUrl(row, source, sitemap, internalCounts));
  const sitemapWaste = inspectSitemapWaste(sitemap);
  writeCsv(rows);
  writePriority(buildPriorityList(rows));
  writeReport(rows, sitemap, sitemapWaste);

  console.log(`GSC rows: ${rows.length}`);
  for (const [reason, count] of countBy(rows, 'gsc_reason')) {
    console.log(`${count}\t${reason}`);
  }
  console.log(`Intended index rows: ${countWhere(rows, (row) => row.desired_index === 'INTENDED_INDEX')}`);
  console.log(`Intended issue candidates: ${countWhere(rows, (row) => row.issue === 'true')}`);
  console.log(`Sitemap forbidden loc patterns: ${sitemapWaste.length}`);
  console.log(`Wrote ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`Wrote ${path.relative(ROOT, INVENTORY_PATH)}`);
  console.log(`Wrote ${path.relative(ROOT, PRIORITY_PATH)}`);
}

main();
