const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.finmaphub.com';
const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const SOURCE_SITEMAP = path.join(PUBLIC_DIR, 'sitemap-0.xml');

const REQUIRED_EN_STATIC_PATHS = [
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

function extractUrlEntries(xml) {
  return Array.from(xml.matchAll(/<url>([\s\S]*?)<\/url>/g), (match) => {
    const body = match[1];
    const loc = body.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim() || '';
    return { loc, xml: match[0] };
  }).filter((entry) => entry.loc);
}

function isEnglishLoc(loc) {
  return loc === `${SITE_URL}/en` || loc.startsWith(`${SITE_URL}/en/`);
}

function stripEnPrefix(pathname) {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  return pathname || '/';
}

function buildRequiredEnEntry(pathname) {
  const enPath = pathname === '/en/' ? '/en' : pathname;
  const koPath = stripEnPrefix(enPath);
  const loc = `${SITE_URL}${enPath}`;
  const koHref = `${SITE_URL}${koPath}`;
  const enHref = `${SITE_URL}${enPath}`;
  const xDefault = koPath === '/'
    ? `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${koHref}"/>`
    : '';

  return {
    loc,
    xml: [
      '<url>',
      `  <loc>${loc}</loc>`,
      `    <xhtml:link rel="alternate" hreflang="ko" href="${koHref}"/>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${enHref}"/>${xDefault}`,
      '</url>',
    ].join('\n'),
  };
}

function ensureRequiredEnStaticEntries(enEntries) {
  const entries = enEntries.slice();
  const seen = new Set(entries.map((entry) => entry.loc));
  const added = [];

  for (const pathname of REQUIRED_EN_STATIC_PATHS) {
    const loc = `${SITE_URL}${pathname}`;
    if (seen.has(loc)) continue;
    const entry = buildRequiredEnEntry(pathname);
    entries.push(entry);
    seen.add(entry.loc);
    added.push(pathname);
  }

  const presentCount = REQUIRED_EN_STATIC_PATHS.length - added.length;
  return { entries, added, presentCount };
}

function buildSitemap(entries) {
  const body = entries.map((entry) => entry.xml).join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    body,
    '</urlset>',
    '',
  ].join('\n');
}

function writeSitemap(filename, entries) {
  const target = path.join(PUBLIC_DIR, filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, buildSitemap(entries), 'utf8');
  return { filename, count: entries.length };
}

function main() {
  if (!fs.existsSync(SOURCE_SITEMAP)) {
    throw new Error(`Missing source sitemap: ${path.relative(ROOT, SOURCE_SITEMAP)}`);
  }

  const sourceXml = fs.readFileSync(SOURCE_SITEMAP, 'utf8');
  const entries = extractUrlEntries(sourceXml);
  const enStatic = ensureRequiredEnStaticEntries(entries.filter((entry) => isEnglishLoc(entry.loc)));
  const enEntries = enStatic.entries;
  const koEntries = entries.filter((entry) => entry.loc.startsWith(SITE_URL) && !isEnglishLoc(entry.loc));

  const results = [
    writeSitemap('sitemap-ko.xml', koEntries),
    writeSitemap('sitemap-en.xml', enEntries),
    writeSitemap(path.join('en', 'sitemap.xml'), enEntries),
  ];

  for (const result of results) {
    console.log(`[channel-sitemap] ${result.filename}: ${result.count} URLs`);
  }

  console.log(
    `[channel-sitemap] sitemap-en.xml required static URLs: ${enStatic.presentCount}/${REQUIRED_EN_STATIC_PATHS.length} present in source, ${enStatic.added.length} backfilled`
  );
  for (const pathname of enStatic.added) {
    console.log(`[channel-sitemap] sitemap-en.xml backfilled ${pathname}`);
  }
}

main();
