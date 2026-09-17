const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const DATE_STAMP = '2026-09-16';
const MARKET_ROUTE = '/market/indices';
const SITE_URL = 'https://finmap.app';
const LEGACY_SITE_URL = 'https://www.finmaphub.com';

const REPORT_MD = path.join(ROOT, 'reports', `naver-ko-market-funnel-batch-e-${DATE_STAMP}.md`);
const REPORT_JSON = path.join(ROOT, 'reports', `naver-ko-market-funnel-batch-e-${DATE_STAMP}.json`);
const REPORT_CSV = path.join(ROOT, 'reports', `naver-ko-market-funnel-map-${DATE_STAMP}.csv`);
const PREEDIT_JSON = path.join(ROOT, 'reports', `naver-ko-market-funnel-batch-e-preedit-${DATE_STAMP}.json`);

const BATCH_A_JSON = path.join(ROOT, 'reports', `naver-ko-query-boundary-batch-a-${DATE_STAMP}.json`);
const BATCH_B_JSON = path.join(ROOT, 'reports', `naver-ko-topic-links-batch-b-${DATE_STAMP}.json`);
const BATCH_C_JSON = path.join(ROOT, 'reports', `naver-ko-cross-category-links-batch-c-${DATE_STAMP}.json`);
const BATCH_D_JSON = path.join(ROOT, 'reports', `naver-ko-topic-hubs-batch-d-${DATE_STAMP}.json`);
const BATCH_G_DATE_STAMP = '2026-09-17';
const BATCH_G_JSON = path.join(ROOT, 'reports', `naver-ko-technical-seo-batch-g-${BATCH_G_DATE_STAMP}.json`);
const BATCH_G_TECHNICAL_DIFFS = new Set(['jsonLdSignature', 'hreflang']);

const CONFIRMED_INDICATORS = [
  'WTI',
  'USD/KRW',
  'DXY',
  'US10Y/TNX',
  'S&P 500',
  'Dow Jones',
  'Nasdaq',
  'KOSPI',
];

const CANDIDATES = [
  {
    id: 'economicInfo/eu-russia-gas-phaseout-price-channel',
    family: 'OIL_ENERGY',
    intendedDecision: 'SKIP_DATA_NOT_AVAILABLE',
    rationale: 'Dashboard provides WTI, not European gas/storage/LNG replacement data.',
  },
  {
    id: 'economicInfo/fx-basics',
    family: 'FX',
    intendedDecision: 'APPLY',
    indicators: ['USD/KRW', 'DXY'],
  },
  {
    id: 'economicInfo/geopolitics-to-usd-liquidity-fx',
    family: 'FX',
    intendedDecision: 'APPLY',
    indicators: ['USD/KRW', 'DXY', 'US10Y/TNX'],
  },
  {
    id: 'economicInfo/hormuz-risk-oil-insurance-freight-premium',
    family: 'OIL_ENERGY',
    intendedDecision: 'SKIP_NOT_NATURAL',
    rationale: 'Article focuses on shipping, insurance, and Hormuz risk premiums beyond current dashboard scope.',
  },
  {
    id: 'economicInfo/interest-rate-basics',
    family: 'INTEREST_RATES',
    intendedDecision: 'APPLY',
    indicators: ['US10Y/TNX'],
  },
  {
    id: 'economicInfo/oil-shock-to-usdkrw-korea-transmission',
    family: 'OIL_ENERGY',
    intendedDecision: 'APPLY',
    indicators: ['WTI', 'USD/KRW'],
  },
  {
    id: 'economicInfo/policy-rate-cut-market-rates',
    family: 'INTEREST_RATES',
    intendedDecision: 'SKIP_NOT_NATURAL',
    rationale: 'Policy-rate transmission is broader than the available dashboard indicator set.',
  },
  {
    id: 'economicInfo/real-rates-and-breakevens',
    family: 'INTEREST_RATES',
    intendedDecision: 'SKIP_DATA_NOT_AVAILABLE',
    rationale: 'Dashboard does not provide real rates or breakeven inflation series.',
  },
  {
    id: 'economicInfo/yield-curve-2s10s-3m10y-recession-reading',
    family: 'INTEREST_RATES',
    intendedDecision: 'SKIP_DATA_NOT_AVAILABLE',
    rationale: 'Dashboard does not provide 2Y/10Y or 3M/10Y yield-curve spreads.',
  },
  {
    id: 'investingInfo/bond-etf-duration-drives-returns',
    family: 'ETF',
    intendedDecision: 'APPLY',
    indicators: ['US10Y/TNX'],
  },
  {
    id: 'investingInfo/dxy-dollar-index-basics',
    family: 'DXY',
    intendedDecision: 'APPLY',
    indicators: ['DXY', 'USD/KRW'],
  },
  {
    id: 'investingInfo/dxy-market-impact',
    family: 'DXY',
    intendedDecision: 'APPLY',
    indicators: ['DXY', 'USD/KRW', 'S&P 500', 'Nasdaq', 'KOSPI'],
  },
  {
    id: 'investingInfo/etf-impact-of-tnx',
    family: 'ETF',
    intendedDecision: 'APPLY',
    indicators: ['US10Y/TNX', 'KOSPI', 'S&P 500'],
  },
  {
    id: 'investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions',
    family: 'FX',
    intendedDecision: 'SKIP_NOT_NATURAL',
    rationale: 'Article is a hedge decision guide, not a market-indicator lookup flow.',
  },
  {
    id: 'investingInfo/korea-etf-deep-dive-tnx',
    family: 'ETF',
    intendedDecision: 'APPLY',
    indicators: ['US10Y/TNX', 'USD/KRW', 'KOSPI'],
  },
  {
    id: 'investingInfo/sp500-impact-on-korea-kospi',
    family: 'KOSPI_GLOBAL_LINK',
    intendedDecision: 'APPLY',
    indicators: ['S&P 500', 'Nasdaq', 'Dow Jones', 'KOSPI'],
  },
  {
    id: 'investingInfo/tnx-basics',
    family: 'TNX',
    intendedDecision: 'APPLY',
    indicators: ['US10Y/TNX'],
  },
  {
    id: 'investingInfo/us10y-impact-on-korea-and-stock-market',
    family: 'TNX',
    intendedDecision: 'APPLY',
    indicators: ['US10Y/TNX', 'KOSPI', 'S&P 500'],
  },
  {
    id: 'investingInfo/usd-krw-exchange-rate-and-kospi',
    family: 'KOSPI_GLOBAL_LINK',
    intendedDecision: 'APPLY',
    indicators: ['USD/KRW', 'DXY', 'KOSPI'],
  },
  {
    id: 'investingInfo/usd-krw-weak-won-sector-map-kospi',
    family: 'KOSPI_GLOBAL_LINK',
    intendedDecision: 'APPLY',
    indicators: ['USD/KRW', 'KOSPI'],
  },
  {
    id: 'investingInfo/wti-impact-on-korea-kospi',
    family: 'OIL_ENERGY',
    intendedDecision: 'APPLY',
    indicators: ['WTI', 'KOSPI'],
  },
];

const CANDIDATE_BY_ID = new Map(CANDIDATES.map((candidate) => [candidate.id, candidate]));

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function pathForPostId(id) {
  const [category, slug] = id.split('/');
  return path.join(ROOT, 'content', 'posts', category, 'ko', `${slug}.md`);
}

function sha(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function normalizeSlug(raw, filePath) {
  if (raw) return String(raw).replace(/^\/+|\/+$/g, '');
  return path.basename(filePath, path.extname(filePath));
}

function postIdFromFile(filePath, data) {
  const normalized = filePath.split(path.sep).join('/');
  const match = normalized.match(/content\/posts\/([^/]+)\/ko\/([^/]+)\.md$/);
  if (!match) return null;
  return `${match[1]}/${normalizeSlug(data.slug, filePath)}`;
}

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.md') ? [fullPath] : [];
  });
}

function extractLinks(content) {
  const links = [];
  const mdLinkRe = /\[([^\]]+)\]\((\/[^)\s#?]+(?:[?#][^)]+)?)\)/g;
  const htmlLinkRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = mdLinkRe.exec(content))) {
    links.push({
      anchor: match[1].replace(/\s+/g, ' ').trim(),
      href: match[2],
      index: match.index,
      raw: match[0],
      line: lineForIndex(content, match.index),
    });
  }

  while ((match = htmlLinkRe.exec(content))) {
    if (!match[1].startsWith('/')) continue;
    links.push({
      anchor: match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
      href: match[1],
      index: match.index,
      raw: match[0],
      line: lineForIndex(content, match.index),
    });
  }

  return links.sort((a, b) => a.index - b.index);
}

function lineForIndex(content, index) {
  const start = content.lastIndexOf('\n', index) + 1;
  const end = content.indexOf('\n', index);
  return content.slice(start, end === -1 ? content.length : end).trim();
}

function stripQueryHash(href) {
  return href.split(/[?#]/)[0].replace(/\/$/, '');
}

function countRouteLinks(links, route) {
  return links.filter((link) => stripQueryHash(link.href) === route).length;
}

function collectPostSnapshot() {
  const roots = ['economicInfo', 'investingInfo', 'personalFinance'].map((category) =>
    path.join(ROOT, 'content', 'posts', category, 'ko')
  );
  const files = roots.flatMap(listMarkdownFiles).sort();
  const posts = {};

  files.forEach((filePath) => {
    const raw = readText(filePath);
    const parsed = matter(raw);
    const id = postIdFromFile(filePath, parsed.data);
    if (!id) return;
    const links = extractLinks(raw);
    posts[id] = {
      id,
      filePath: path.relative(ROOT, filePath).split(path.sep).join('/'),
      hash: sha(raw),
      data: parsed.data,
      content: parsed.content,
      links,
      marketLinks: links.filter((link) => stripQueryHash(link.href).startsWith('/market/')),
      marketRouteCount: countRouteLinks(links, MARKET_ROUTE),
      title: parsed.data.title || '',
      description: parsed.data.description || '',
      tags: parsed.data.tags || [],
      dateModified: parsed.data.dateModified || '',
      h1: extractHeadings(parsed.content, 1),
      h2: extractHeadings(parsed.content, 2),
      h3: extractHeadings(parsed.content, 3),
      faqQuestions: extractFaqQuestions(parsed.content),
      canonical: extractCanonical(raw),
      hreflang: extractHreflang(raw),
      jsonLdSignature: extractJsonLdSignature(raw),
    };
  });

  return posts;
}

function extractHeadings(content, level) {
  const prefix = '#'.repeat(level);
  return content
    .split(/\r?\n/)
    .filter((line) => line.startsWith(`${prefix} `))
    .map((line) => line.slice(level + 1).trim());
}

function extractFaqQuestions(content) {
  const faqSection = content.split(/\r?\n##\s+FAQ\b/i)[1] || '';
  return faqSection
    .split(/\r?\n/)
    .filter((line) => /^#{3,4}\s+/.test(line))
    .map((line) => line.replace(/^#{3,4}\s+/, '').trim());
}

function extractCanonical(raw) {
  const matches = [...raw.matchAll(/canonical(?:Url)?["']?\s*[:=]\s*["']([^"']+)["']/gi)];
  return matches.map((match) => match[1]).sort();
}

function extractHreflang(raw) {
  const matches = [...raw.matchAll(/hreflang["']?\s*[:=]\s*["']([^"']+)["']/gi)];
  return matches.map((match) => match[1]).sort();
}

function extractJsonLdSignature(raw) {
  return raw
    .replace(/("dateModified"\s*:\s*)"[^"]+"/g, '$1"__DATE_MODIFIED__"')
    .replace(/(dateModified:\s*)["'][^"']+["']/g, '$1"__DATE_MODIFIED__"')
    .match(/<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>|JSON\.stringify\([\s\S]*?\)/gi)?.join('\n---\n') || '';
}

function writePreedit() {
  const preedit = {
    generatedAt: new Date().toISOString(),
    dateStamp: DATE_STAMP,
    marketRoute: MARKET_ROUTE,
    candidates: CANDIDATES,
    posts: collectPostSnapshot(),
    routeExists: fs.existsSync(path.join(ROOT, 'pages', 'market', 'indices.js')),
  };
  fs.mkdirSync(path.dirname(PREEDIT_JSON), { recursive: true });
  fs.writeFileSync(PREEDIT_JSON, `${JSON.stringify(preedit, null, 2)}\n`);
  console.log(`WROTE ${path.relative(ROOT, PREEDIT_JSON)}`);
}

function loadJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    return { parseError: error.message };
  }
}

function batchGVerifiedScope() {
  const empty = { allowedFiles: new Set(), verdict: '', active: false };
  if (!fs.existsSync(BATCH_G_JSON)) return empty;
  try {
    const data = JSON.parse(readText(BATCH_G_JSON));
    const full = data.fullSiteHreflang || {};
    const structured = data.structuredData || {};
    const after = structured.afterState || {};
    const dca = data.dcaHub || {};
    const preservation = data.preservation || {};
    const pass =
      String(data.finalVerdict || '').startsWith('PASS_TECHNICAL_SEO_BATCH_G') &&
      full.brokenAlternateTargets === 0 &&
      full.missingReciprocalIssues === 0 &&
      full.canonicalMismatches === 0 &&
      full.duplicateHreflangEntries === 0 &&
      full.invalidLanguageCodes === 0 &&
      structured.renderedConflicting === 0 &&
      structured.manualRequired === 0 &&
      after.conflictingArticleLikeNodes === 0 &&
      after.jsonLdParseErrors === 0 &&
      dca.canonicalSelf === true &&
      dca.koSitemapIncluded === true &&
      dca.fakeEnUrlPresent === false &&
      dca.brokenHreflang === false &&
      preservation.titleChanges === 0 &&
      preservation.descriptionChanges === 0 &&
      preservation.h1H2Changes === 0 &&
      preservation.faqVisibleTextChanges === 0 &&
      preservation.internalLinkArchitectureChanges === 0 &&
      preservation.slugChanges === 0 &&
      preservation.redirectChanges === 0 &&
      preservation.dateModifiedEditorialChanges === 0;
    if (!pass) return { ...empty, verdict: data.finalVerdict || '' };
    return {
      active: true,
      verdict: data.finalVerdict || '',
      allowedFiles: new Set([
        ...(data.hreflang?.candidates || []).map((row) => row.filePath),
        ...(structured.rows || []).map((row) => row.filePath),
      ].filter(Boolean)),
    };
  } catch {
    return empty;
  }
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function compareArrays(before, after) {
  return JSON.stringify(before || []) === JSON.stringify(after || []);
}

function structuralDiffs(beforePost, afterPost) {
  if (!beforePost || !afterPost) return ['missingSnapshot'];
  const diffs = [];
  [
    'title',
    'description',
    'canonical',
    'hreflang',
    'h1',
    'h2',
    'h3',
    'faqQuestions',
    'jsonLdSignature',
  ].forEach((key) => {
    if (key === 'jsonLdSignature') {
      const beforeSignature = normalizeLineEndings(beforePost[key] || '');
      const afterSignature = normalizeLineEndings(afterPost[key] || '');
      if (beforeSignature !== afterSignature) diffs.push(key);
      return;
    }
    const same = Array.isArray(beforePost[key]) || Array.isArray(afterPost[key])
      ? compareArrays(beforePost[key], afterPost[key])
      : beforePost[key] === afterPost[key];
    if (!same) diffs.push(key);
  });
  if (JSON.stringify(beforePost.tags || []) !== JSON.stringify(afterPost.tags || [])) {
    diffs.push('tags');
  }
  return diffs;
}

function normalizeLineEndings(text) {
  return String(text || '').replace(/\r\n/g, '\n').trim();
}

function linkKey(link) {
  return `${stripQueryHash(link.href)}|${link.anchor}`;
}

function newMarketLinks(beforePost, afterPost) {
  const beforeKeys = new Set((beforePost?.marketLinks || []).map(linkKey));
  return (afterPost?.marketLinks || []).filter((link) => !beforeKeys.has(linkKey(link)));
}

function classifyCandidate(candidate, beforePost, afterPost) {
  const beforeCount = beforePost?.marketRouteCount || 0;
  const afterCount = afterPost?.marketRouteCount || 0;
  const added = Math.max(0, afterCount - beforeCount);

  if (beforeCount > 0 && afterCount >= beforeCount && added === 0) {
    return 'ALREADY_HAS_MARKET_LINK';
  }

  if (candidate.intendedDecision === 'APPLY') {
    return added > 0 ? 'APPLY' : 'REVIEW_REQUIRED';
  }

  if (added > 0) return 'REVIEW_UNEXPECTED_LINK';
  return candidate.intendedDecision;
}

function checkIndicatorSource() {
  const sourceFiles = [
    path.join(ROOT, 'lib', 'stockIndexCore.js'),
    path.join(ROOT, 'pages', 'api', 'stock-index', 'dashboard.js'),
    path.join(ROOT, 'pages', 'api', 'market', 'summary.js'),
    path.join(ROOT, 'pages', 'market', 'indices.js'),
  ];
  const combined = sourceFiles
    .filter(fs.existsSync)
    .map((filePath) => readText(filePath))
    .join('\n');

  const patterns = {
    WTI: /WTI|wti|CL=F|Crude/i,
    'USD/KRW': /USD\/KRW|USDKRW|USD_KRW|원\/달러|환율/i,
    DXY: /DXY|Dollar Index|달러\s*인덱스/i,
    'US10Y/TNX': /US10Y|TNX|10Y|10년/i,
    'S&P 500': /S&P\s*500|SP500|SNP/i,
    'Dow Jones': /Dow|다우/i,
    Nasdaq: /Nasdaq|NASDAQ|나스닥/i,
    KOSPI: /KOSPI|코스피/i,
  };

  return Object.fromEntries(
    CONFIRMED_INDICATORS.map((indicator) => [indicator, patterns[indicator].test(combined)])
  );
}

function analyzeFreshnessAndClaims(afterPosts, candidateResults) {
  const realtimePattern = /실시간|realtime|real-time|초단위|즉시\s*확인|바로\s*확인/i;
  const unsupportedPattern =
    /천연가스|가스\s*재고|LNG\s*가격|브레이크이븐|실질금리|2Y|2년물|3M|3개월물|수익률\s*곡선|ETF\s*현황|ETF\s*가격\s*확인/i;
  const issues = [];
  const realtimeIssues = [];

  candidateResults
    .filter((result) => ['APPLY', 'ALREADY_HAS_MARKET_LINK'].includes(result.decision))
    .forEach((result) => {
      const post = afterPosts[result.id];
      if (!post) return;
      post.links
        .filter((link) => stripQueryHash(link.href) === MARKET_ROUTE)
        .forEach((link) => {
          const text = `${link.anchor} ${link.line}`.replace(/\s+/g, ' ');
          if (realtimePattern.test(text)) {
            realtimeIssues.push({ id: result.id, line: link.line });
          }
          if (unsupportedPattern.test(text)) {
            issues.push({ id: result.id, line: link.line });
          }
        });
    });

  return { unsupportedIndicatorClaims: issues, realtimeClaimMisuse: realtimeIssues };
}

function getGitFile(filePath) {
  try {
    return execFileSync('git', ['show', `HEAD:${filePath}`], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

function extractSitemapUrls(xml) {
  return sortedUnique([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
}

function analyzeSitemaps() {
  const files = ['public/sitemap-0.xml', 'public/server-sitemap.xml'];
  const allowedPriorAdditions = [
    `${SITE_URL}/posts/personalFinance/dca-guide`,
    `${LEGACY_SITE_URL}/posts/personalFinance/dca-guide`,
  ];
  const fakeEnglishDcaHubUrls = [
    `${SITE_URL}/en/posts/personalFinance/dca-guide`,
    `${LEGACY_SITE_URL}/en/posts/personalFinance/dca-guide`,
  ];
  const perFile = files.map((file) => {
    const before = extractSitemapUrls(getGitFile(file));
    const full = path.join(ROOT, file);
    const after = fs.existsSync(full) ? extractSitemapUrls(readText(full)) : [];
    const additions = after.filter((url) => !before.includes(url));
    const drops = before.filter((url) => !after.includes(url));
    return {
      file,
      additions,
      drops,
      unexpectedAdditions: additions.filter((url) => !allowedPriorAdditions.includes(url)),
    };
  });

  const allAfter = sortedUnique(
    perFile.flatMap((item) => (fs.existsSync(path.join(ROOT, item.file)) ? extractSitemapUrls(readText(path.join(ROOT, item.file))) : []))
  );

  return {
    perFile,
    dcaHubIncluded: allowedPriorAdditions.some((url) => allAfter.includes(url)),
    fakeEnglishDcaHubPresent: fakeEnglishDcaHubUrls.some((url) => allAfter.includes(url)),
    unexpectedStep6EUrlAdditions: perFile.flatMap((item) => item.unexpectedAdditions),
    drops: perFile.flatMap((item) => item.drops),
  };
}

function previousBatchStatus() {
  const batchA = loadJson(BATCH_A_JSON);
  const batchB = loadJson(BATCH_B_JSON);
  const batchC = loadJson(BATCH_C_JSON);
  const batchD = loadJson(BATCH_D_JSON);

  return {
    batchA: {
      finalVerdict: batchA?.finalVerdict || null,
      pass: /^PASS/.test(batchA?.finalVerdict || ''),
    },
    batchB: {
      finalVerdict: batchB?.finalVerdict || null,
      pass: /^PASS/.test(batchB?.finalVerdict || ''),
    },
    batchC: {
      finalVerdict: batchC?.finalVerdict || null,
      pass: /^PASS/.test(batchC?.finalVerdict || ''),
    },
    batchD: {
      finalVerdict: batchD?.finalVerdict || null,
      pass: /^PASS/.test(batchD?.finalVerdict || ''),
    },
  };
}

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(results) {
  const header = [
    'id',
    'family',
    'intendedDecision',
    'decision',
    'targetRoute',
    'beforeMarketRouteCount',
    'afterMarketRouteCount',
    'newMarketLinks',
    'anchors',
    'indicators',
    'rationale',
  ];
  const rows = [header.join(',')].concat(
    results.map((result) =>
      [
        result.id,
        result.family,
        result.intendedDecision,
        result.decision,
        MARKET_ROUTE,
        result.beforeMarketRouteCount,
        result.afterMarketRouteCount,
        result.newMarketLinks.length,
        result.newMarketLinks.map((link) => link.anchor).join(' | '),
        (result.indicators || []).join(' | '),
        result.rationale || '',
      ].map(csvEscape).join(',')
    )
  );
  fs.writeFileSync(REPORT_CSV, `${rows.join('\n')}\n`);
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'UNKNOWN';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function formatList(values) {
  if (!values.length) return '- none';
  return values.map((value) => `- ${value}`).join('\n');
}

function writeMarkdown(report) {
  const candidateLines = report.candidateResults.map((result) => {
    const anchorText = result.newMarketLinks.map((link) => `“${link.anchor}”`).join(' / ') || '-';
    return `| ${result.id} | ${result.family} | ${result.decision} | ${anchorText} | ${result.rationale || ''} |`;
  });

  const applied = report.candidateResults.filter((result) => result.decision === 'APPLY');
  const skipped = report.candidateResults.filter((result) => result.decision.startsWith('SKIP'));

  const md = `# FinMap KO Post Naver Search Visibility Step 6E

## Final Verdict
${report.finalVerdict}

## Market Dashboard Preflight
- Route exists: ${report.marketDashboardPreflight.routeExists ? 'YES' : 'NO'}
- Data route: /api/stock-index/dashboard
- Source table: STOCK_INVEST_INFO
- Reverse funnel surface: ${report.marketDashboardPreflight.reverseFunnelDecision}

## Confirmed Indicators
${CONFIRMED_INDICATORS.map((indicator) => `- ${indicator}: ${report.confirmedIndicators[indicator] ? 'CONFIRMED' : 'MISSING'}`).join('\n')}

## Candidate Reconciliation
| Candidate | Family | Decision | Anchor | Rationale |
| --- | --- | --- | --- | --- |
${candidateLines.join('\n')}

## Applied Post -> Dashboard Links
${applied.map((result) => `- ${result.id} -> ${MARKET_ROUTE} (${result.newMarketLinks.map((link) => link.anchor).join(', ')})`).join('\n') || '- none'}

## Unsupported / Skipped Cases
${skipped.map((result) => `- ${result.id}: ${result.decision} - ${result.rationale}`).join('\n') || '- none'}

## Market Coverage Before / After
- Before market route links in candidate set: ${report.coverage.beforeMarketRouteLinks}
- After market route links in candidate set: ${report.coverage.afterMarketRouteLinks}
- New market route links: ${report.coverage.newMarketRouteLinks}
- Family result: ${JSON.stringify(report.coverage.byFamily)}

## Freshness Wording Check
- Realtime claim misuse: ${report.validation.realtimeClaimMisuse}
- Unsupported indicator claims: ${report.validation.unsupportedIndicatorClaims}

## Dashboard -> Post Reverse Funnel Decision
${report.marketDashboardPreflight.reverseFunnelDecision}

## Previous Batch Regression
- Step 6A: ${report.previousBatchStatus.batchA.finalVerdict}
- Step 6B: ${report.previousBatchStatus.batchB.finalVerdict}
- Step 6C: ${report.previousBatchStatus.batchC.finalVerdict}
- Step 6D: ${report.previousBatchStatus.batchD.finalVerdict}

## Sitemap Preservation
- DCA hub included: ${report.sitemap.dcaHubIncluded ? 'YES' : 'NO'}
- Fake English DCA hub present: ${report.sitemap.fakeEnglishDcaHubPresent ? 'YES' : 'NO'}
- Step 6E unexpected URL additions: ${report.sitemap.unexpectedStep6EUrlAdditions.length}
- URL drops: ${report.sitemap.drops.length}

## Validation
${Object.entries(report.validation).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.length : value}`).join('\n')}
`;

  fs.writeFileSync(REPORT_MD, md);
}

function main() {
  if (process.argv.includes('--write-preedit')) {
    writePreedit();
    return;
  }

  if (!fs.existsSync(PREEDIT_JSON)) {
    throw new Error(`Missing preedit snapshot: ${path.relative(ROOT, PREEDIT_JSON)}. Run with --write-preedit before editing.`);
  }

  const preedit = loadJson(PREEDIT_JSON);
  const beforePosts = preedit.posts || {};
  const afterPosts = collectPostSnapshot();
  const routeExists = fs.existsSync(path.join(ROOT, 'pages', 'market', 'indices.js'));
  const dashboardPage = routeExists ? readText(path.join(ROOT, 'pages', 'market', 'indices.js')) : '';
  const reverseSurfaceExists = /RELATED_LINKS/.test(dashboardPage) && /\/posts\/investingInfo\//.test(dashboardPage);
  const confirmedIndicators = checkIndicatorSource();
  const batchGScope = batchGVerifiedScope();

  const candidateResults = CANDIDATES.map((candidate) => {
    const beforePost = beforePosts[candidate.id];
    const afterPost = afterPosts[candidate.id];
    const addedMarketLinks = newMarketLinks(beforePost, afterPost)
      .filter((link) => stripQueryHash(link.href).startsWith('/market/'));
    const decision = classifyCandidate(candidate, beforePost, afterPost);
    const diffs = structuralDiffs(beforePost, afterPost);
    const filePath = afterPost?.filePath || beforePost?.filePath || '';
    const batchGTechnicalOnlyChange =
      batchGScope.allowedFiles.has(filePath) &&
      diffs.length > 0 &&
      diffs.every((diff) => BATCH_G_TECHNICAL_DIFFS.has(diff));
    return {
      ...candidate,
      filePath,
      decision,
      beforeMarketRouteCount: beforePost?.marketRouteCount || 0,
      afterMarketRouteCount: afterPost?.marketRouteCount || 0,
      newMarketLinks: addedMarketLinks,
      structureDiffs: diffs,
      dateModified: afterPost?.dateModified || '',
      hashChanged: beforePost?.hash !== afterPost?.hash,
      batchGTechnicalOnlyChange,
    };
  });

  const changedCandidates = candidateResults.filter((result) => result.hashChanged);
  const changedCandidatesForRegression = changedCandidates.filter((result) => !result.batchGTechnicalOnlyChange);
  const batchGTechnicalOnlyChangedCandidates = changedCandidates.filter((result) => result.batchGTechnicalOnlyChange);
  const applied = candidateResults.filter((result) => result.decision === 'APPLY');
  const reviewRequired = candidateResults.filter((result) => /REVIEW/.test(result.decision));
  const overAdditions = candidateResults.filter(
    (result) => Math.max(0, result.afterMarketRouteCount - result.beforeMarketRouteCount) > 1
  );
  const duplicateMarketLinks = candidateResults.filter((result) => result.afterMarketRouteCount > 1);
  const unexpectedMarketRoutes = candidateResults.flatMap((result) =>
    result.newMarketLinks
      .filter((link) => stripQueryHash(link.href) !== MARKET_ROUTE)
      .map((link) => ({ id: result.id, href: link.href, anchor: link.anchor }))
  );
  const routeTargetsOk = unexpectedMarketRoutes.length === 0 && routeExists;
  const dateModifiedIssues = changedCandidatesForRegression.filter((result) => result.dateModified !== DATE_STAMP);
  const structureIssues = changedCandidatesForRegression.filter((result) => result.structureDiffs.length > 0);
  const { unsupportedIndicatorClaims, realtimeClaimMisuse } = analyzeFreshnessAndClaims(afterPosts, candidateResults);
  const indicatorsMissing = Object.entries(confirmedIndicators)
    .filter(([, confirmed]) => !confirmed)
    .map(([indicator]) => indicator);
  const previous = previousBatchStatus();
  const previousBatchPass = Object.values(previous).every((item) => item.pass);
  const sitemap = analyzeSitemaps();

  const intendedApplyCount = CANDIDATES.filter((candidate) => candidate.intendedDecision === 'APPLY').length;
  const validation = {
    candidateCount: CANDIDATES.length,
    intendedApplyCount,
    appliedCount: applied.length,
    reviewRequired: reviewRequired.length,
    targetRouteExists: routeExists ? 1 : 0,
    routeTargetsOk: routeTargetsOk ? 1 : 0,
    brokenMarketLink: routeExists ? 0 : applied.length,
    duplicateMarketLink: duplicateMarketLinks.length,
    perPostOverAdditions: overAdditions.length,
    unsupportedIndicatorClaims: unsupportedIndicatorClaims.length,
    realtimeClaimMisuse: realtimeClaimMisuse.length,
    dateModifiedIssues: dateModifiedIssues.length,
    structureIssues: structureIssues.length,
    missingConfirmedIndicators: indicatorsMissing.length,
    previousBatchPass: previousBatchPass ? 1 : 0,
    sitemapUnexpectedStep6EUrlAdditions: sitemap.unexpectedStep6EUrlAdditions.length,
    sitemapUrlDrops: sitemap.drops.length,
    fakeEnglishDcaHubPresent: sitemap.fakeEnglishDcaHubPresent ? 1 : 0,
    batchGScopeActive: batchGScope.active ? 1 : 0,
    batchGScopeVerdict: batchGScope.verdict,
    batchGAllowedFileCount: batchGScope.allowedFiles.size,
    batchGTechnicalOnlyChangedCandidates: batchGTechnicalOnlyChangedCandidates.length,
  };

  const hardFailures = [
    validation.reviewRequired,
    routeTargetsOk ? 0 : 1,
    validation.brokenMarketLink,
    validation.duplicateMarketLink,
    validation.perPostOverAdditions,
    validation.unsupportedIndicatorClaims,
    validation.realtimeClaimMisuse,
    validation.dateModifiedIssues,
    validation.structureIssues,
    validation.missingConfirmedIndicators,
    previousBatchPass ? 0 : 1,
    validation.sitemapUnexpectedStep6EUrlAdditions,
    validation.sitemapUrlDrops,
    sitemap.fakeEnglishDcaHubPresent ? 1 : 0,
  ].reduce((sum, value) => sum + value, 0);

  const finalVerdict = hardFailures === 0 ? 'PASS_MARKET_FUNNEL_BATCH_E' : 'FAIL_MARKET_FUNNEL_BATCH_E';

  const report = {
    generatedAt: new Date().toISOString(),
    dateStamp: DATE_STAMP,
    finalVerdict,
    marketRoute: MARKET_ROUTE,
    marketDashboardPreflight: {
      routeExists,
      dashboardPage: 'pages/market/indices.js',
      apiRoute: 'pages/api/stock-index/dashboard.js',
      sourceTable: 'STOCK_INVEST_INFO',
      reverseFunnelDecision: reverseSurfaceExists
        ? 'EXISTING_SURFACE_AVAILABLE_ALREADY_PRESENT'
        : 'DEFER_NO_EXISTING_SURFACE',
    },
    confirmedIndicators,
    candidateResults,
    coverage: {
      beforeMarketRouteLinks: candidateResults.reduce((sum, item) => sum + item.beforeMarketRouteCount, 0),
      afterMarketRouteLinks: candidateResults.reduce((sum, item) => sum + item.afterMarketRouteCount, 0),
      newMarketRouteLinks: candidateResults.reduce(
        (sum, item) => sum + Math.max(0, item.afterMarketRouteCount - item.beforeMarketRouteCount),
        0
      ),
      byDecision: countBy(candidateResults, 'decision'),
      byFamily: Object.fromEntries(
        Object.entries(
          candidateResults.reduce((acc, item) => {
            acc[item.family] ||= { apply: 0, skipped: 0, already: 0, review: 0 };
            if (item.decision === 'APPLY') acc[item.family].apply += 1;
            else if (item.decision === 'ALREADY_HAS_MARKET_LINK') acc[item.family].already += 1;
            else if (item.decision.startsWith('SKIP')) acc[item.family].skipped += 1;
            else acc[item.family].review += 1;
            return acc;
          }, {})
        ).sort(([a], [b]) => a.localeCompare(b))
      ),
    },
    validation,
    issues: {
      reviewRequired,
      duplicateMarketLinks,
      overAdditions,
      unexpectedMarketRoutes,
      unsupportedIndicatorClaims,
      realtimeClaimMisuse,
      dateModifiedIssues,
      structureIssues,
      indicatorsMissing,
    },
    sitemap,
    previousBatchStatus: previous,
  };

  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);
  writeCsv(candidateResults);
  writeMarkdown(report);
  console.log(`${finalVerdict}`);
  console.log(`Report: ${path.relative(ROOT, REPORT_JSON)}`);
  console.log(`Applied links: ${applied.length}/${intendedApplyCount}`);
  console.log(`Review required: ${reviewRequired.length}`);
  console.log(`Freshness misuse: ${validation.realtimeClaimMisuse}`);
}

main();
