const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SITE_URL = 'https://www.finmaphub.com';
const INDEX_URL = `${SITE_URL}/sitemap.xml`;
const CHILD_URL = `${SITE_URL}/sitemap-0.xml`;
const ROOT = process.cwd();
const POSTS_ROOT = path.join(ROOT, 'content', 'posts');

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkDir(fullPath) : [fullPath];
  });
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(String(value).trim());
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function extractLocs(xml) {
  return Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g), (match) => match[1].trim());
}

function extractUrlEntries(xml) {
  return Array.from(xml.matchAll(/<url>([\s\S]*?)<\/url>/g), (match) => {
    const body = match[1];
    const loc = body.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim() || '';
    const lastmod = body.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1]?.trim() || null;
    return { loc, lastmod };
  });
}

function buildExpectedPostMap() {
  const expected = new Map();
  const files = walkDir(POSTS_ROOT).filter((file) => file.endsWith('.md'));

  for (const file of files) {
    const parts = path.relative(POSTS_ROOT, file).replace(/\\/g, '/').split('/');
    if (parts.length < 3) continue;

    const [category, lang] = parts;
    const slug = path.basename(file, '.md');
    const frontmatter = matter(fs.readFileSync(file, 'utf8')).data || {};
    if (
      frontmatter.draft === true
      || frontmatter.noindex === true
      || String(frontmatter.robots || '').includes('noindex')
    ) {
      continue;
    }

    let lastmod = normalizeDate(frontmatter.dateModified);
    if (!lastmod) lastmod = normalizeDate(frontmatter.datePublished);
    if (!lastmod) lastmod = fs.statSync(file).mtime.toISOString();

    const localePrefix = lang === 'en' ? '/en' : '';
    expected.set(`${SITE_URL}${localePrefix}/posts/${category}/${slug}`, lastmod);
  }

  return expected;
}

function getExactConfiguredSources() {
  const config = fs.readFileSync(path.join(ROOT, 'next.config.js'), 'utf8');
  return Array.from(config.matchAll(/source:\s*['"]([^'"]+)['"]/g), (match) => match[1])
    .filter((source) => !source.includes(':') && !source.includes('*'));
}

function duplicates(values) {
  const seen = new Set();
  return Array.from(new Set(values.filter((value) => {
    if (seen.has(value)) return true;
    seen.add(value);
    return false;
  })));
}

function main() {
  const indexXml = fs.readFileSync(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8');
  const childXml = fs.readFileSync(path.join(ROOT, 'public', 'sitemap-0.xml'), 'utf8');
  const robots = fs.readFileSync(path.join(ROOT, 'public', 'robots.txt'), 'utf8');
  const entries = extractUrlEntries(childXml);
  const locs = entries.map((entry) => entry.loc);
  const entryMap = new Map(entries.map((entry) => [entry.loc, entry]));
  const expectedPosts = buildExpectedPostMap();
  const exactConfiguredSources = new Set(getExactConfiguredSources());

  const indexChildren = extractLocs(indexXml);
  const robotsSitemaps = Array.from(
    robots.matchAll(/^Sitemap:\s*(.+)$/gm),
    (match) => match[1].trim(),
  );

  const results = {
    indexIsSitemapIndex: /<sitemapindex\b/.test(indexXml),
    indexChildren,
    robotsSitemaps,
    urlCount: entries.length,
    lastmodCount: entries.filter((entry) => entry.lastmod).length,
    duplicateUrls: duplicates(locs),
    nonWwwOrNonHttpsUrls: locs.filter((loc) => {
      try {
        return new URL(loc).origin !== SITE_URL;
      } catch {
        return true;
      }
    }),
    malformedOrNoncanonicalUrls: locs.filter((loc) => (
      loc.includes('?')
      || loc.includes('#')
      || /\/en\/en(?:\/|$)/.test(loc)
      || /\/posts\/[^/]+\/(?:ko|en)\//.test(loc)
      || (loc !== SITE_URL && loc.endsWith('/'))
    )),
    knownNoindexUrls: locs.filter((loc) => (
      /\/(?:en\/)?(?:404|500)$/.test(loc)
      || /\/(?:en\/)?market\/real-estate\/apt\//.test(loc)
    )),
    exactConfiguredSourceUrls: locs.filter((loc) => {
      try {
        return exactConfiguredSources.has(new URL(loc).pathname);
      } catch {
        return false;
      }
    }),
    expectedPostCount: expectedPosts.size,
    sitemapPostCount: entries.filter((entry) => /\/(?:en\/)?posts\//.test(entry.loc)).length,
    missingPostUrls: Array.from(expectedPosts.keys()).filter((loc) => !entryMap.has(loc)),
    unexpectedPostUrls: entries
      .filter((entry) => /\/(?:en\/)?posts\//.test(entry.loc) && !expectedPosts.has(entry.loc))
      .map((entry) => entry.loc),
    postLastmodMismatches: Array.from(expectedPosts.entries())
      .filter(([loc, lastmod]) => entryMap.has(loc) && entryMap.get(loc).lastmod !== lastmod)
      .map(([loc, expectedLastmod]) => ({
        loc,
        expectedLastmod,
        actualLastmod: entryMap.get(loc).lastmod,
      })),
  };

  const failures = [
    !results.indexIsSitemapIndex,
    results.indexChildren.length !== 1 || results.indexChildren[0] !== CHILD_URL,
    results.robotsSitemaps.length !== 1 || results.robotsSitemaps[0] !== INDEX_URL,
    results.duplicateUrls.length > 0,
    results.nonWwwOrNonHttpsUrls.length > 0,
    results.malformedOrNoncanonicalUrls.length > 0,
    results.knownNoindexUrls.length > 0,
    results.exactConfiguredSourceUrls.length > 0,
    results.missingPostUrls.length > 0,
    results.unexpectedPostUrls.length > 0,
    results.postLastmodMismatches.length > 0,
  ].filter(Boolean).length;

  console.log(JSON.stringify({ ...results, failures }, null, 2));
  if (failures) process.exitCode = 1;
}

main();
