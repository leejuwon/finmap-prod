const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const matter = require('gray-matter');

const ROOT = process.cwd();
const SITE_URL = 'https://www.finmaphub.com';
const TARGET_PATH = '/tools/compound-interest';
const BRIDGE_REL = 'content/posts/personalFinance/ko/compound-calculator-guide.md';
const BRIDGE_FILE = path.join(ROOT, BRIDGE_REL);
const BRIDGE_EN_FILE = path.join(ROOT, 'content/posts/personalFinance/en/compound-calculator-guide.md');
const KO_DIRS = [
  'content/posts/personalFinance/ko',
  'content/posts/investingInfo/ko',
  'content/posts/economicInfo/ko',
].map((dir) => path.join(ROOT, dir));
const BRIDGE_UPDATED_KO_POSTS = [
  'content/posts/personalFinance/ko/simple-vs-compound.md',
  'content/posts/personalFinance/ko/annual-vs-monthly-compound.md',
  'content/posts/personalFinance/ko/monthly-dca-10-year-result.md',
  'content/posts/personalFinance/ko/how-much-per-month-for-100m.md',
  'content/posts/personalFinance/ko/goal-amount-fast-strategy.md',
  'content/posts/personalFinance/ko/personal-start-5steps.md',
  'content/posts/personalFinance/ko/personal-finance-3pillars.md',
  'content/posts/personalFinance/ko/high-rate-debt-vs-invest-threshold-rule.md',
  BRIDGE_REL,
];

const VARIANT_RULES = [
  { key: 'exact', label: '복리 계산기', test: (anchor) => anchor === '복리 계산기' },
  { key: 'monthly', label: '월복리 계산기', test: (anchor) => anchor.includes('월복리 계산기') },
  { key: 'dcaCompound', label: '적립식 복리 계산기', test: (anchor) => anchor.includes('적립식 복리 계산기') },
  { key: 'formula', label: '복리 계산 공식', test: (anchor) => anchor.includes('복리 계산 공식') },
  { key: 'investment', label: '투자 복리 계산기', test: (anchor) => anchor.includes('투자 복리 계산기') },
];

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkDir(full));
    else files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function stripTags(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeHref(rawHref) {
  const href = String(rawHref || '').trim();
  if (!href) return '';
  try {
    const parsed = new URL(href, SITE_URL);
    if (parsed.origin !== SITE_URL) return href;
    let pathname = parsed.pathname.replace(/\/{2,}/g, '/');
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return `${pathname}${parsed.search || ''}${parsed.hash || ''}`;
  } catch {
    const pathname = href.split('#')[0].split('?')[0];
    return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  }
}

function extractLinks(markdown) {
  const links = [];
  const markdownLinkRe = /(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;
  while ((match = markdownLinkRe.exec(markdown))) {
    links.push({
      type: 'markdown',
      anchor: stripTags(match[1]),
      href: normalizeHref(match[2]),
      index: match.index,
    });
  }

  const htmlLinkRe = /<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = htmlLinkRe.exec(markdown))) {
    links.push({
      type: 'html',
      anchor: stripTags(match[3]),
      href: normalizeHref(match[2]),
      index: match.index,
    });
  }

  return links.sort((a, b) => a.index - b.index);
}

function classifyAnchor(anchor) {
  for (const rule of VARIANT_RULES) {
    if (rule.test(anchor)) return rule.key;
  }
  return 'other';
}

function isGenericAnchor(anchor) {
  const normalized = String(anchor || '').replace(/[👉🔗]/g, '').trim();
  if (!normalized) return true;
  return [
    '여기',
    '여기를 클릭',
    '클릭',
    '자세히 보기',
    '더 보기',
    '바로가기',
    '열기',
    '확인하기',
  ].includes(normalized);
}

function countOccurrences(text, needle) {
  return (String(text || '').match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
}

function normalizeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value || '').trim().slice(0, 10);
}

function extractArticleJsonLd(markdown, file) {
  const articles = [];
  const scriptRe = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRe.exec(markdown))) {
    let parsed;
    try {
      parsed = JSON.parse(match[1].trim());
    } catch (error) {
      throw new Error(`${rel(file)} contains invalid manual JSON-LD: ${error.message}`);
    }

    const candidates = Array.isArray(parsed)
      ? parsed
      : parsed && Array.isArray(parsed['@graph'])
        ? parsed['@graph']
        : [parsed];

    for (const candidate of candidates) {
      if (!candidate || typeof candidate !== 'object') continue;
      const types = Array.isArray(candidate['@type']) ? candidate['@type'] : [candidate['@type']];
      if (types.includes('Article') || types.includes('BlogPosting')) articles.push(candidate);
    }
  }

  return articles;
}

function auditArticleDateModified() {
  const mismatches = [];
  let articleCount = 0;

  for (const relativeFile of BRIDGE_UPDATED_KO_POSTS) {
    const file = path.join(ROOT, relativeFile);
    if (!fs.existsSync(file)) {
      mismatches.push({ file: relativeFile, frontmatter: 'missing-file', jsonld: '-' });
      continue;
    }

    const raw = fs.readFileSync(file, 'utf8');
    const parsed = matter(raw);
    const frontmatterDate = normalizeDate(parsed.data.dateModified);
    const articles = extractArticleJsonLd(parsed.content, file);
    articleCount += articles.length;

    for (const article of articles) {
      const jsonLdDate = normalizeDate(article.dateModified);
      if (!frontmatterDate || jsonLdDate !== frontmatterDate) {
        mismatches.push({
          file: relativeFile,
          frontmatter: frontmatterDate || 'missing',
          jsonld: jsonLdDate || 'missing',
        });
      }
    }
  }

  return { articleCount, mismatches };
}

function getChangedKoPostFiles() {
  try {
    return execSync('git diff --name-only -- content/posts/personalFinance/ko content/posts/investingInfo/ko content/posts/economicInfo/ko', {
      cwd: ROOT,
      encoding: 'utf8',
    })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function main() {
  const files = KO_DIRS.flatMap(walkDir).filter((file) => file.endsWith('.md')).sort();
  const bridgeExists = fs.existsSync(BRIDGE_FILE);
  const bridgeRaw = bridgeExists ? fs.readFileSync(BRIDGE_FILE, 'utf8') : '';
  const bridgeParsed = bridgeExists ? matter(bridgeRaw) : { data: {}, content: '' };
  const bridgeTop400 = bridgeParsed.content.replace(/\s+/g, ' ').trim().slice(0, 400);
  const bridgeLinks = extractLinks(bridgeParsed.content).filter((link) => link.href === TARGET_PATH);

  const rows = [];
  const anchorDistribution = {
    exact: 0,
    monthly: 0,
    dcaCompound: 0,
    formula: 0,
    investment: 0,
    other: 0,
  };
  const genericAnchors = [];
  const overLinkedFiles = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = matter(raw);
    const links = extractLinks(parsed.content).filter((link) => link.href === TARGET_PATH);
    if (!links.length) continue;

    for (const link of links) {
      anchorDistribution[classifyAnchor(link.anchor)] += 1;
      if (isGenericAnchor(link.anchor)) {
        genericAnchors.push({ file: rel(file), anchor: link.anchor });
      }
    }

    if (links.length > 2) overLinkedFiles.push({ file: rel(file), count: links.length });
    rows.push({
      file: rel(file),
      count: links.length,
      anchors: links.map((link) => link.anchor),
    });
  }

  const bridgeTitle = String(bridgeParsed.data.title || '');
  const bridgeDescription = String(bridgeParsed.data.description || bridgeParsed.data.seoDescription || '');
  const bridgeBodyExactCount = countOccurrences(bridgeParsed.content, '복리 계산기');
  const changedKoPostFiles = getChangedKoPostFiles();
  const articleDateAudit = auditArticleDateModified();
  const checks = [
    {
      name: '신규 브릿지 글 존재',
      pass: bridgeExists,
      detail: BRIDGE_REL,
    },
    {
      name: '신규 글 title에 복리 계산기 포함',
      pass: bridgeTitle.includes('복리 계산기'),
      detail: bridgeTitle || '-',
    },
    {
      name: '신규 글 description에 복리 계산기 포함',
      pass: bridgeDescription.includes('복리 계산기'),
      detail: bridgeDescription || '-',
    },
    {
      name: '상단 400자 안 exact anchor 존재',
      pass: bridgeTop400.includes('[복리 계산기](/tools/compound-interest)'),
      detail: bridgeTop400.includes('[복리 계산기](/tools/compound-interest)') ? 'found' : 'missing',
    },
    {
      name: '신규 글 도구 링크 2개 이하',
      pass: bridgeLinks.length <= 2,
      detail: `${bridgeLinks.length} links`,
    },
    {
      name: '전체 KO 링크 exact anchor 최소 3개',
      pass: anchorDistribution.exact >= 3,
      detail: `${anchorDistribution.exact} exact anchors`,
    },
    {
      name: 'generic anchor 0개',
      pass: genericAnchors.length === 0,
      detail: `${genericAnchors.length} generic anchors`,
    },
    {
      name: '글별 동일 도구 링크 2개 이하',
      pass: overLinkedFiles.length === 0,
      detail: overLinkedFiles.length ? overLinkedFiles.map((item) => `${item.file}=${item.count}`).join(', ') : 'OK',
    },
    {
      name: 'title/description keyword stuffing 없음',
      pass: countOccurrences(bridgeTitle, '복리 계산기') <= 1 && countOccurrences(bridgeDescription, '복리 계산기') <= 1,
      detail: `title=${countOccurrences(bridgeTitle, '복리 계산기')}, description=${countOccurrences(bridgeDescription, '복리 계산기')}`,
    },
    {
      name: '신규 글 본문 exact keyword 과다 반복 없음',
      pass: bridgeBodyExactCount <= 12,
      detail: `${bridgeBodyExactCount} occurrences`,
    },
    {
      name: 'KO-only hreflang self-only 처리',
      pass: bridgeParsed.data.hreflangEquivalent === false && !fs.existsSync(BRIDGE_EN_FILE),
      detail: `hreflangEquivalent=${bridgeParsed.data.hreflangEquivalent}, enExists=${fs.existsSync(BRIDGE_EN_FILE)}`,
    },
    {
      name: 'Article JSON-LD dateModified matches frontmatter dateModified',
      pass: articleDateAudit.mismatches.length === 0,
      detail: articleDateAudit.mismatches.length
        ? articleDateAudit.mismatches.map((item) => item.file).join(', ')
        : `${articleDateAudit.articleCount} Article/BlogPosting blocks checked; FAQPage excluded`,
    },
  ];

  const failed = checks.filter((check) => !check.pass);

  console.log('# Compound Calculator Head Keyword Internal Link Audit');
  console.log('');
  console.log('## Checks');
  console.log('');
  console.log('| Check | Result | Detail |');
  console.log('| --- | --- | --- |');
  for (const check of checks) {
    console.log(`| ${check.name} | ${check.pass ? 'PASS' : 'FAIL'} | ${String(check.detail).replace(/\|/g, '\\|')} |`);
  }
  console.log('');
  console.log('## Anchor Distribution');
  console.log('');
  console.log('| Anchor class | Count |');
  console.log('| --- | ---: |');
  for (const rule of VARIANT_RULES) {
    console.log(`| ${rule.label} | ${anchorDistribution[rule.key]} |`);
  }
  console.log(`| 기타 앵커 | ${anchorDistribution.other} |`);
  console.log('');
  console.log('## Links By File');
  console.log('');
  console.log('| File | Count | Anchors |');
  console.log('| --- | ---: | --- |');
  for (const row of rows) {
    console.log(`| ${row.file} | ${row.count} | ${row.anchors.join(' / ').replace(/\|/g, '\\|')} |`);
  }
  console.log('');
  console.log('## Changed KO Posts');
  console.log('');
  if (changedKoPostFiles.length) {
    for (const file of changedKoPostFiles) console.log(`- ${file}`);
  } else {
    console.log('- none detected by git diff');
  }

  if (genericAnchors.length) {
    console.log('');
    console.log('## Generic Anchors');
    for (const item of genericAnchors) console.log(`- ${item.file}: ${item.anchor}`);
  }

  console.log('');
  if (articleDateAudit.mismatches.length) {
    console.error('FAIL dateModified mismatch:');
    for (const item of articleDateAudit.mismatches) {
      console.error(`${item.file} frontmatter=${item.frontmatter} jsonld=${item.jsonld}`);
    }
  } else {
    console.log('PASS - Article JSON-LD dateModified matches frontmatter dateModified');
  }

  if (failed.length) {
    console.error('');
    console.error(`[compound-head-keyword-audit] FAIL: ${failed.map((check) => check.name).join(', ')}`);
    process.exit(1);
  }

  console.log('');
  console.log('[compound-head-keyword-audit] PASS');
}

main();
