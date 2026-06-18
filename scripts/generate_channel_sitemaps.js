const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.finmaphub.com';
const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const SOURCE_SITEMAP = path.join(PUBLIC_DIR, 'sitemap-0.xml');

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
  fs.writeFileSync(target, buildSitemap(entries), 'utf8');
  return { filename, count: entries.length };
}

function main() {
  if (!fs.existsSync(SOURCE_SITEMAP)) {
    throw new Error(`Missing source sitemap: ${path.relative(ROOT, SOURCE_SITEMAP)}`);
  }

  const sourceXml = fs.readFileSync(SOURCE_SITEMAP, 'utf8');
  const entries = extractUrlEntries(sourceXml);
  const enEntries = entries.filter((entry) => isEnglishLoc(entry.loc));
  const koEntries = entries.filter((entry) => entry.loc.startsWith(SITE_URL) && !isEnglishLoc(entry.loc));

  const results = [
    writeSitemap('sitemap-ko.xml', koEntries),
    writeSitemap('sitemap-en.xml', enEntries),
  ];

  for (const result of results) {
    console.log(`[channel-sitemap] ${result.filename}: ${result.count} URLs`);
  }
}

main();
