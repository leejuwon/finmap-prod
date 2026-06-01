const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.finmaphub.com';
const REPORT_PATH = path.join(process.cwd(), 'reports', 'sitemap-clean-audit.md');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

const REQUIRED_PATHS = [
  '/en/tools/compound-interest',
  '/tools/dsr-ltv-calculator',
  '/posts/investingInfo/tnx-basics',
  '/posts/personalFinance/dca-vs-lump-sum-when-results-differ',
  '/posts/personalFinance/how-much-monthly-invest-for-100m',
  '/posts/personalFinance/is-dca-better-in-bear-market',
  '/posts/investingInfo/modern-6040-risk-budget',
  '/en/posts/economicInfo/inflation-rate-basics',
  '/en/posts/economicInfo/indicator-basics',
].map((pathValue) => `${SITE_URL}${pathValue}`);

const FORBIDDEN_RULES = [
  { name: 'query string', test: (loc) => loc.includes('?') },
  { name: 'aptKey template', test: (loc) => /\[aptKey\]|%5BaptKey%5D/i.test(loc) },
  { name: 'duplicate /en/en prefix', test: (loc) => /\/en\/en(?:\/|$)/.test(loc) },
  { name: 'post lang segment /posts/*/en/*', test: (loc) => /\/posts\/[^/]+\/en\//.test(loc) },
  { name: 'post lang segment /posts/*/ko/*', test: (loc) => /\/posts\/[^/]+\/ko\//.test(loc) },
  { name: 'apartment detail URL', test: (loc) => /\/(?:en\/)?market\/real-estate\/apt\//.test(loc) },
];

function getSitemapFiles() {
  if (!fs.existsSync(PUBLIC_DIR)) return [];
  return fs
    .readdirSync(PUBLIC_DIR)
    .filter((name) => /^sitemap(?:-\d+)?\.xml$/.test(name))
    .map((name) => path.join(PUBLIC_DIR, name));
}

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>([\s\S]*?)<\/loc>/g;
  let match;
  while ((match = re.exec(xml))) {
    locs.push(match[1].trim());
  }
  return locs;
}

function extractXDefaultHrefs(xml) {
  const hrefs = [];
  const re = /<xhtml:link\b[^>]*hreflang=["']x-default["'][^>]*>/gi;
  const hrefRe = /\bhref=["']([^"']+)["']/i;
  let match;
  while ((match = re.exec(xml))) {
    const hrefMatch = match[0].match(hrefRe);
    hrefs.push(hrefMatch ? hrefMatch[1].trim() : '');
  }
  return hrefs;
}

function mdEscape(value) {
  return String(value || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function main() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const files = getSitemapFiles();
  const locs = [];
  const xDefaultRefs = [];
  for (const file of files) {
    const xml = fs.readFileSync(file, 'utf8');
    for (const loc of extractLocs(xml)) {
      locs.push({ file: path.relative(process.cwd(), file), loc });
    }
    for (const href of extractXDefaultHrefs(xml)) {
      xDefaultRefs.push({ file: path.relative(process.cwd(), file), href });
    }
  }

  const violations = [];
  for (const item of locs) {
    for (const rule of FORBIDDEN_RULES) {
      if (rule.test(item.loc)) {
        violations.push({ ...item, rule: rule.name });
      }
    }
  }

  const locSet = new Set(locs.map((item) => item.loc));
  const missingRequired = REQUIRED_PATHS.filter((loc) => !locSet.has(loc));
  const xDefaultViolations = xDefaultRefs.filter((item) => item.href !== `${SITE_URL}/`);

  const lines = [];
  lines.push('# Sitemap Clean Audit');
  lines.push('');
  lines.push(`- Checked at: ${new Date().toISOString()}`);
  lines.push(`- Sitemap files: ${files.map((file) => `\`${path.relative(process.cwd(), file)}\``).join(', ') || '-'}`);
  lines.push(`- Total loc entries: ${locs.length}`);
  lines.push(`- Forbidden URL violations: ${violations.length}`);
  lines.push(`- Missing required canonical URLs: ${missingRequired.length}`);
  lines.push(`- x-default references: ${xDefaultRefs.length}`);
  lines.push(`- x-default policy violations: ${xDefaultViolations.length}`);
  lines.push('');

  lines.push('## Forbidden URL Checks');
  lines.push('');

  lines.push('## x-default Policy');
  lines.push('');
  lines.push('- Policy: sitemap `x-default` is emitted only for the home hreflang pair and points to `https://www.finmaphub.com/`.');
  if (xDefaultViolations.length) {
    lines.push('');
    lines.push('| File | x-default href |');
    lines.push('| --- | --- |');
    for (const item of xDefaultViolations) {
      lines.push(`| ${mdEscape(item.file)} | ${mdEscape(item.href)} |`);
    }
  } else {
    lines.push('- OK: no non-home `x-default` references were found.');
  }
  lines.push('');
  if (violations.length) {
    lines.push('| Rule | File | URL |');
    lines.push('| --- | --- | --- |');
    for (const violation of violations) {
      lines.push(`| ${mdEscape(violation.rule)} | ${mdEscape(violation.file)} | ${mdEscape(violation.loc)} |`);
    }
  } else {
    lines.push('- OK: no query URLs, apt detail URLs, template URLs, duplicate `/en/en`, or `/posts/*/(en|ko)/*` entries were found.');
  }
  lines.push('');

  lines.push('## Required Canonical URL Checks');
  lines.push('');
  lines.push('| URL | Result |');
  lines.push('| --- | --- |');
  for (const required of REQUIRED_PATHS) {
    lines.push(`| ${mdEscape(required)} | ${locSet.has(required) ? 'OK' : 'MISSING'} |`);
  }
  lines.push('');

  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');
  console.log(`Checked ${locs.length} sitemap loc entries from ${files.length} file(s).`);
  console.log(`Forbidden violations: ${violations.length}`);
  console.log(`Missing required URLs: ${missingRequired.length}`);
  console.log(`x-default references: ${xDefaultRefs.length}`);
  console.log(`x-default policy violations: ${xDefaultViolations.length}`);
  console.log(`Wrote ${REPORT_PATH}`);

  if (violations.length || missingRequired.length || xDefaultViolations.length) process.exitCode = 1;
}

main();
