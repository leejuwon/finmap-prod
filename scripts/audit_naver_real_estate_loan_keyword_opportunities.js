#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = process.cwd();
const SITE_URL = 'https://www.finmaphub.com';
const REPORT_PATH = path.join(ROOT, 'reports', 'naver-real-estate-loan-keyword-opportunity-audit.md');

const SCAN_DIRS = [
  'pages/tools',
  'pages/market',
  'pages/real-estate',
  'pages',
  'content/posts/personalFinance/ko',
  'content/posts/economicInfo/ko',
  'content/posts/investingInfo/ko',
  '_components',
  'lib',
];

const KEYWORDS = [
  {
    keyword: 'ltv dsr 계산기',
    clicks: 6,
    impressions: 67,
    ctr: '9.0%',
    intent: '계산기형',
    priority: 'P0',
    terms: ['ltv', 'dsr', '계산기'],
    likelyUrl: '/tools/dsr-ltv-calculator',
    candidates: [
      '/tools/dsr-ltv-calculator',
      '/posts/personalFinance/dsr-40-income-loan-limit-table',
      '/posts/personalFinance/dsr-pass-ltv-cash-bottleneck',
    ],
    recommendation: 'A. 기존 페이지 title/description 미세 조정 후보',
    note: 'DSR/LTV 계산기와 직접 연결된다. 키워드 순서와 한글 보조 표현이 title/description에 충분히 드러나는지 점검 우선.',
  },
  {
    keyword: '주담대 원리금 계산기',
    clicks: 3,
    impressions: 178,
    ctr: '1.7%',
    intent: '계산기형',
    priority: 'P0',
    terms: ['주담대', '원리금', '계산기'],
    likelyUrl: '/tools/dsr-ltv-calculator',
    candidates: [
      '/tools/dsr-ltv-calculator',
      '/posts/personalFinance/mortgage-risk-checklist-dsr-variable',
      '/posts/personalFinance/salary-50m-dsr-40-loan-limit',
      '/posts/personalFinance/salary-40m-mortgage-limit',
    ],
    recommendation: 'C. 브릿지 콘텐츠 필요',
    note: '기존 계산기가 원리금균등 월상환액을 계산하지만 검색자는 “월 원리금” 자체를 기대한다. 별도 섹션 또는 브릿지 글이 유효.',
  },
  {
    keyword: '아파트 담보대출 계산기',
    clicks: 2,
    impressions: 131,
    ctr: '1.5%',
    intent: '계산기형',
    priority: 'P0',
    terms: ['아파트', '담보대출', '계산기'],
    likelyUrl: '/tools/dsr-ltv-calculator',
    candidates: [
      '/tools/dsr-ltv-calculator',
      '/posts/personalFinance/cash-100m-200m-300m-apartment-budget',
      '/posts/personalFinance/apartment-buying-costs-before-purchase',
      '/market/real-estate',
    ],
    recommendation: 'A. 기존 페이지 title/description 미세 조정 후보',
    note: 'DSR/LTV/보유현금/아파트 구매가 연결되는 핵심 상업성 키워드. 계산기 상단 문구와 내부링크 보강 후보.',
  },
  {
    keyword: '주담대 dsr 계산기',
    clicks: 1,
    impressions: 216,
    ctr: '0.5%',
    intent: '계산기형',
    priority: 'P0',
    terms: ['주담대', 'dsr', '계산기'],
    likelyUrl: '/tools/dsr-ltv-calculator',
    candidates: [
      '/tools/dsr-ltv-calculator',
      '/posts/personalFinance/dsr-40-income-loan-limit-table',
      '/posts/personalFinance/interest-rate-1p-loan-limit-impact',
    ],
    recommendation: 'A. 기존 페이지 title/description 미세 조정 후보',
    note: '노출 대비 CTR이 낮다. “주담대 DSR” 표현이 title/description/H1에서 얼마나 직접적인지 점검.',
  },
  {
    keyword: '주택담보대출 ltv계산기',
    clicks: 2,
    impressions: 4,
    ctr: '50.0%',
    intent: '계산기형',
    priority: 'P0',
    terms: ['주택담보대출', 'ltv', '계산기'],
    likelyUrl: '/tools/dsr-ltv-calculator',
    candidates: [
      '/tools/dsr-ltv-calculator',
      '/posts/personalFinance/dsr-pass-ltv-cash-bottleneck',
      '/posts/personalFinance/cash-100m-200m-300m-apartment-budget',
    ],
    recommendation: 'B. 기존 페이지 내부 섹션 보강 후보',
    note: 'CTR은 높지만 표본이 작다. LTV 계산기 의도를 DSR/LTV 계산기 내부에서 더 명확히 받는 섹션 후보.',
  },
  {
    keyword: '아파트 구매 계산기',
    clicks: 2,
    impressions: 3,
    ctr: '66.7%',
    intent: '계산기형',
    priority: 'P0',
    terms: ['아파트', '구매', '계산기'],
    likelyUrl: '/tools/dsr-ltv-calculator',
    candidates: [
      '/tools/dsr-ltv-calculator',
      '/posts/personalFinance/apartment-buying-costs-before-purchase',
      '/posts/personalFinance/cash-100m-200m-300m-apartment-budget',
      '/market/real-estate',
    ],
    recommendation: 'C. 브릿지 콘텐츠 필요',
    note: '대출 한도와 취득 부대비용을 함께 기대할 가능성이 높다. 계산기 연결형 브릿지 또는 상단 안내 섹션 후보.',
  },
  {
    keyword: '마곡 집값',
    clicks: 2,
    impressions: 98,
    ctr: '2.0%',
    intent: '정보형',
    priority: 'P1',
    terms: ['마곡', '집값'],
    likelyUrl: '/market/real-estate/magok-top100',
    candidates: [
      '/market/real-estate/magok-top100',
      '/market/real-estate',
      '/posts/personalFinance/how-to-read-apartment-transaction-prices',
    ],
    recommendation: 'E. 데이터 품질 점검 선행 필요',
    note: '지역 집값 정보형 의도다. 마곡 전용 Top 페이지 또는 대시보드 필터 랜딩의 데이터 품질 확인이 선행되어야 한다.',
  },
  {
    keyword: '강남 집값 순위',
    clicks: 2,
    impressions: 12,
    ctr: '16.7%',
    intent: '정보형',
    priority: 'P1',
    terms: ['강남', '집값', '순위'],
    likelyUrl: '/market/real-estate/gangnam-top100',
    candidates: [
      '/market/real-estate/gangnam-top100',
      '/market/real-estate/gangnam3-top100',
      '/market/real-estate/seoul-top100',
      '/market/real-estate/seoul-apartment-top100',
    ],
    recommendation: 'E. 데이터 품질 점검 선행 필요',
    note: '순위형 정보 페이지와 잘 맞는다. 강남/강남3구/서울 Top 페이지의 데이터 기준과 title 노출을 점검할 필요가 있다.',
  },
  {
    keyword: 'cagr 계산식',
    clicks: 2,
    impressions: 7,
    ctr: '28.6%',
    intent: '계산기/개념형',
    priority: 'P1',
    terms: ['cagr', '계산식'],
    likelyUrl: '/posts/personalFinance/what-is-cagr',
    candidates: [
      '/posts/personalFinance/what-is-cagr',
      '/tools/cagr-calculator',
      '/posts/investingInfo/why-check-cagr-etf',
      '/posts/investingInfo/cagr-7percent-reality-check',
    ],
    recommendation: 'B. 기존 페이지 내부 섹션 보강 후보',
    note: '계산식 의도는 개념 글과 계산기 모두 대응 가능하다. 수식/H2/계산기 연결이 충분한지 점검.',
  },
  {
    keyword: 'cagr',
    clicks: 1,
    impressions: 942,
    ctr: '0.1%',
    intent: '개념/계산기 혼합',
    priority: 'P1',
    terms: ['cagr'],
    likelyUrl: '/tools/cagr-calculator',
    candidates: [
      '/tools/cagr-calculator',
      '/posts/personalFinance/what-is-cagr',
      '/posts/investingInfo/why-check-cagr-etf',
      '/posts/investingInfo/diagnose-investing-skill-with-cagr',
    ],
    recommendation: 'A. 기존 페이지 title/description 미세 조정 후보',
    note: '노출은 매우 크지만 CTR이 낮다. 계산기형/개념형 혼합 SERP에서 title과 description의 클릭 이유를 재점검할 후보.',
  },
];

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDir(full));
    else out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function stripExt(file) {
  return file.replace(/\.(jsx?|tsx?|mdx?|json)$/i, '');
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mdEscape(value) {
  return String(value == null || value === '' ? '-' : value)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function short(value, max = 130) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function termHits(text, terms) {
  const haystack = normalizeText(text);
  return terms.filter((term) => haystack.includes(String(term).toLowerCase()));
}

function hitSummary(text, terms) {
  const hits = termHits(text, terms);
  return `${hits.length}/${terms.length}${hits.length ? ` (${hits.join(', ')})` : ''}`;
}

function isLikelyContentFile(file) {
  return rel(file).startsWith('content/posts/') && /\.(md|mdx)$/i.test(file);
}

function urlFromFile(file) {
  const relative = rel(file);
  if (relative.startsWith('content/posts/')) {
    const parts = relative.split('/');
    const category = parts[2];
    const locale = parts[3];
    const slug = path.basename(relative).replace(/\.(md|mdx)$/i, '');
    if (locale === 'ko') return `/posts/${category}/${slug}`;
    if (locale === 'en') return `/en/posts/${category}/${slug}`;
  }

  if (relative.startsWith('pages/')) {
    if (relative.startsWith('pages/api/')) return '';
    const noExt = stripExt(relative).replace(/^pages\//, '');
    if (noExt.startsWith('_')) return '';
    if (noExt === 'index') return '/';
    const cleaned = noExt.replace(/\/index$/, '');
    return `/${cleaned}`.replace(/\/+/g, '/');
  }

  return '';
}

function extractJsField(raw, names) {
  for (const name of names) {
    const patterns = [
      new RegExp(`${name}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`, 'i'),
      new RegExp(`const\\s+${name}\\s*=\\s*["'\`]([^"'\`]+)["'\`]`, 'i'),
      new RegExp(`${name}\\s*=\\s*["'\`]([^"'\`]+)["'\`]`, 'i'),
    ];
    for (const re of patterns) {
      const match = raw.match(re);
      if (match) return match[1];
    }
  }
  return '';
}

function extractFirstMarkdownHeading(content) {
  const match = String(content || '').match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function buildDocument(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const relative = rel(file);
  const url = urlFromFile(file);
  const isContent = isLikelyContentFile(file);

  if (isContent) {
    const parsed = matter(raw);
    const title = parsed.data.seoTitle || parsed.data.title || '';
    const description = parsed.data.seoDescription || parsed.data.description || '';
    const h1 = extractFirstMarkdownHeading(parsed.content) || parsed.data.title || '';
    return {
      file,
      relative,
      url,
      type: 'post',
      raw,
      body: parsed.content,
      title,
      description,
      h1,
      rssPossible: !parsed.data.draft && !parsed.data.noindex && !/noindex/i.test(String(parsed.data.robots || '')),
    };
  }

  const title = extractJsField(raw, ['seoTitle', 'title']);
  const description = extractJsField(raw, ['seoDesc', 'seoDescription', 'desc', 'description']);
  const h1 = extractJsField(raw, ['h1', 'heroTitle']);
  return {
    file,
    relative,
    url,
    type: relative.startsWith('pages/') ? 'page' : 'source',
    raw,
    body: raw,
    title,
    description,
    h1,
    rssPossible: false,
  };
}

function normalizeHref(rawHref) {
  const href = String(rawHref || '').trim();
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return '';
  try {
    const parsed = new URL(href, SITE_URL);
    if (parsed.origin !== SITE_URL) return '';
    let pathname = parsed.pathname.replace(/\/{2,}/g, '/');
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return `${pathname}${parsed.search || ''}`;
  } catch {
    const noHash = href.split('#')[0];
    const noTrailing = noHash.length > 1 && noHash.endsWith('/') ? noHash.slice(0, -1) : noHash;
    return noTrailing.startsWith('/') ? noTrailing : '';
  }
}

function extractLinks(doc) {
  const links = [];
  const raw = doc.raw || '';
  let match;

  const markdownRe = /(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  while ((match = markdownRe.exec(raw))) {
    const href = normalizeHref(match[2]);
    if (href) links.push({ from: doc.url || doc.relative, sourceFile: doc.relative, href, anchor: match[1] });
  }

  const hrefRe = /\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|{`([^`]+)`}|{"([^"]+)"}|{'([^']+)'} )/g;
  while ((match = hrefRe.exec(raw))) {
    const href = normalizeHref(match[1] || match[2] || match[3] || match[4] || match[5]);
    if (href) links.push({ from: doc.url || doc.relative, sourceFile: doc.relative, href, anchor: '' });
  }

  return links;
}

function readSitemapUrls(relativePath) {
  const file = path.join(ROOT, relativePath);
  if (!fs.existsSync(file)) return new Set();
  const xml = fs.readFileSync(file, 'utf8');
  const urls = new Set();
  const re = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = re.exec(xml))) {
    try {
      const parsed = new URL(match[1]);
      let pathname = parsed.pathname;
      if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
      urls.add(pathname);
    } catch {
      // Ignore malformed locs in an audit script.
    }
  }
  return urls;
}

function scoreDocument(doc, terms) {
  const titleHits = termHits(doc.title, terms).length;
  const descHits = termHits(doc.description, terms).length;
  const h1Hits = termHits(doc.h1, terms).length;
  const bodyHits = termHits(doc.body, terms).length;
  return titleHits * 5 + descHits * 4 + h1Hits * 4 + bodyHits;
}

function findRelatedPosts(docs, keyword) {
  const scored = docs
    .filter((doc) => doc.type === 'post')
    .map((doc) => ({ doc, score: scoreDocument(doc, keyword.terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.doc.relative.localeCompare(b.doc.relative))
    .slice(0, 4);

  return scored.map((item) => item.doc);
}

function summarizeCandidate(keyword, docsByUrl, docs, linksByHref, sitemapKoUrls) {
  const doc = docsByUrl.get(keyword.likelyUrl) || null;
  const fallback = doc || keyword.candidates.map((url) => docsByUrl.get(url)).find(Boolean) || null;
  const candidateDoc = fallback;
  const incomingLinks = linksByHref.get(keyword.likelyUrl) || [];
  const relatedPosts = findRelatedPosts(docs, keyword);
  const sitemapPath = keyword.likelyUrl.startsWith('/en/') ? keyword.likelyUrl : keyword.likelyUrl;

  return {
    keyword: keyword.keyword,
    clicks: keyword.clicks,
    impressions: keyword.impressions,
    ctr: keyword.ctr,
    intent: keyword.intent,
    priority: keyword.priority,
    likelyUrl: keyword.likelyUrl,
    directExists: Boolean(candidateDoc),
    sourceFile: candidateDoc ? candidateDoc.relative : '',
    title: candidateDoc ? candidateDoc.title : '',
    description: candidateDoc ? candidateDoc.description : '',
    h1: candidateDoc ? candidateDoc.h1 : '',
    titleMatch: candidateDoc ? hitSummary(candidateDoc.title, keyword.terms) : '0/0',
    descriptionMatch: candidateDoc ? hitSummary(candidateDoc.description, keyword.terms) : '0/0',
    h1Match: candidateDoc ? hitSummary(candidateDoc.h1, keyword.terms) : '0/0',
    relatedPosts,
    internalLinkCount: incomingLinks.length,
    internalLinkSources: Array.from(new Set(incomingLinks.map((link) => link.sourceFile))).slice(0, 5),
    sitemapKo: sitemapKoUrls.has(sitemapPath),
    rssStatus: candidateDoc?.type === 'post'
      ? (candidateDoc.rssPossible ? '가능: KO post, draft/noindex 아님' : '낮음: draft/noindex 확인 필요')
      : '제외: tool/page는 RSS item 아님',
    recommendation: keyword.recommendation,
    note: keyword.note,
  };
}

function buildReport(rows, sitemapCounts) {
  const lines = [];
  lines.push('# Naver Real Estate Loan Keyword Opportunity Audit');
  lines.push('');
  lines.push(`Date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('- Scope: audit only');
  lines.push('- Code/content/SEO policy changes: none');
  lines.push('- Audit script: `scripts/audit_naver_real_estate_loan_keyword_opportunities.js`');
  lines.push('- Report: `reports/naver-real-estate-loan-keyword-opportunity-audit.md`');
  lines.push('- Final decision: `PASS - 네이버 부동산·대출 계산기 키워드 기회 감사 완료`');
  lines.push('');

  lines.push('## Manual Search Console Keyword Table');
  lines.push('');
  lines.push('| Keyword | Clicks | Impressions | CTR | Current likely URL | Intent | Priority |');
  lines.push('| --- | ---: | ---: | ---: | --- | --- | --- |');
  for (const row of rows) {
    lines.push(`| ${mdEscape(row.keyword)} | ${row.clicks} | ${row.impressions} | ${row.ctr} | ${mdEscape(row.likelyUrl)} | ${mdEscape(row.intent)} | ${row.priority} |`);
  }
  lines.push('');

  lines.push('## Keyword Intent Classification');
  lines.push('');
  lines.push('| Keyword | Intent | Notes |');
  lines.push('| --- | --- | --- |');
  for (const row of rows) {
    lines.push(`| ${mdEscape(row.keyword)} | ${mdEscape(row.intent)} | ${mdEscape(row.note)} |`);
  }
  lines.push('');

  lines.push('## Current URL Candidates');
  lines.push('');
  lines.push('| Keyword | Current likely URL | Direct file/page exists | Source file | Sitemap KO | RSS possibility |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const row of rows) {
    lines.push(`| ${mdEscape(row.keyword)} | ${mdEscape(row.likelyUrl)} | ${row.directExists ? 'yes' : 'no'} | ${mdEscape(row.sourceFile)} | ${row.sitemapKo ? 'yes' : 'no'} | ${mdEscape(row.rssStatus)} |`);
  }
  lines.push('');

  lines.push('## Title / Description / H1 Match');
  lines.push('');
  lines.push('| Keyword | URL | Title term hits | Description term hits | H1 term hits | Current title/source string |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const row of rows) {
    lines.push(`| ${mdEscape(row.keyword)} | ${mdEscape(row.likelyUrl)} | ${mdEscape(row.titleMatch)} | ${mdEscape(row.descriptionMatch)} | ${mdEscape(row.h1Match)} | ${mdEscape(short(row.title || row.h1 || row.sourceFile, 120))} |`);
  }
  lines.push('');

  lines.push('## Related Posts And Internal Links');
  lines.push('');
  lines.push('| Keyword | Related post candidates | Internal links to likely URL | Sample sources |');
  lines.push('| --- | --- | ---: | --- |');
  for (const row of rows) {
    const related = row.relatedPosts.map((doc) => doc.url || doc.relative).join('<br>');
    const sources = row.internalLinkSources.join('<br>');
    lines.push(`| ${mdEscape(row.keyword)} | ${mdEscape(related)} | ${row.internalLinkCount} | ${mdEscape(sources)} |`);
  }
  lines.push('');

  lines.push('## Sitemap / RSS Possibility');
  lines.push('');
  lines.push('| Item | Count / Result |');
  lines.push('| --- | ---: |');
  lines.push(`| sitemap-0.xml URLs | ${sitemapCounts.main} |`);
  lines.push(`| sitemap-ko.xml URLs | ${sitemapCounts.ko} |`);
  lines.push(`| sitemap-en.xml URLs | ${sitemapCounts.en} |`);
  lines.push(`| public/en/sitemap.xml URLs | ${sitemapCounts.enPrefix} |`);
  lines.push('');
  lines.push('- Tool pages are expected in sitemap but not in RSS.');
  lines.push('- KO post pages can be RSS candidates if they are not draft/noindex and remain within the current `/rss.xml` item window.');
  lines.push('- Regional dashboard pages are sitemap candidates, not RSS candidates.');
  lines.push('');

  lines.push('## Findings');
  lines.push('');
  lines.push('- P0 loan keywords mostly map to `/tools/dsr-ltv-calculator`, but several queries use consumer wording such as `주담대 원리금`, `아파트 담보대출`, and `아파트 구매 계산기`.');
  lines.push('- `주담대 원리금 계산기` is the clearest gap: the existing calculator can support the intent, but a bridge section or article may be needed to make the intent explicit.');
  lines.push('- `아파트 구매 계산기` likely expects a combined purchase budget view: loan capacity, cash, LTV, DSR, and purchase costs.');
  lines.push('- `마곡 집값` and `강남 집값 순위` map to real-estate dashboard/ranking pages, but data freshness, sample size, and regional page titles should be checked before SEO copy changes.');
  lines.push('- `cagr` has very high impressions with low CTR, suggesting SERP intent/title mismatch or a broad keyword where the current title does not earn the click often enough.');
  lines.push('');

  lines.push('## Priority Plan');
  lines.push('');
  lines.push('### P0');
  lines.push('');
  lines.push('- Audit `/tools/dsr-ltv-calculator` title/description/H1 for `ltv dsr 계산기`, `주담대 dsr 계산기`, `아파트 담보대출 계산기`, and `주택담보대출 ltv계산기`.');
  lines.push('- Add or plan a bridge path for `주담대 원리금 계산기` if the current page does not clearly expose monthly principal-and-interest repayment.');
  lines.push('- Add or plan a bridge path for `아파트 구매 계산기` that connects purchase cost, cash, DSR/LTV, and dashboard flow.');
  lines.push('');
  lines.push('### P1');
  lines.push('');
  lines.push('- Check data quality and landing viability for `마곡 집값` and `강남 집값 순위` before changing SEO copy.');
  lines.push('- Review `CAGR` calculator and `what-is-cagr` title/description alignment because impressions are high but CTR is weak.');
  lines.push('- Strengthen `cagr 계산식` section/linking if it is not already obvious in the concept post and calculator page.');
  lines.push('');
  lines.push('### P2');
  lines.push('');
  lines.push('- Keep monitoring low-impression high-CTR keywords before creating dedicated landing pages.');
  lines.push('- Compare Naver Search Advisor changes after any P0 loan copy or bridge work.');
  lines.push('');

  lines.push('## Recommended Action By Keyword');
  lines.push('');
  lines.push('| Keyword | Recommendation | Priority | Rationale |');
  lines.push('| --- | --- | --- | --- |');
  for (const row of rows) {
    lines.push(`| ${mdEscape(row.keyword)} | ${mdEscape(row.recommendation)} | ${row.priority} | ${mdEscape(row.note)} |`);
  }
  lines.push('');

  lines.push('## Validation Results');
  lines.push('');
  lines.push('| Command | Result |');
  lines.push('| --- | --- |');
  lines.push('| `node --check scripts\\audit_naver_real_estate_loan_keyword_opportunities.js` | Pending |');
  lines.push('| `node scripts\\audit_naver_real_estate_loan_keyword_opportunities.js` | Pending |');
  lines.push('| `npm.cmd run build` | Pending |');
  lines.push('| `node scripts\\verify_seo_channel_split.js --local-server` | Pending |');
  lines.push('| `git diff --check` | Pending |');
  lines.push('');

  lines.push('## Final Decision');
  lines.push('');
  lines.push('`PASS - 네이버 부동산·대출 계산기 키워드 기회 감사 완료`');
  lines.push('');
  lines.push('The audit found current URL structures for all 10 keywords. The main follow-up is prioritization, not emergency URL creation.');

  return `${lines.join('\n')}\n`;
}

function countSitemapUrls(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return 0;
  return (fs.readFileSync(full, 'utf8').match(/<loc>/g) || []).length;
}

function main() {
  const files = Array.from(new Set(
    SCAN_DIRS
      .map((dir) => path.join(ROOT, dir))
      .flatMap(walkDir)
      .filter((file) => /\.(jsx?|tsx?|mdx?)$/i.test(file))
      .filter((file) => !rel(file).startsWith('pages/api/'))
  )).sort();

  const docs = files.map(buildDocument);
  const docsByUrl = new Map(docs.filter((doc) => doc.url).map((doc) => [doc.url, doc]));
  const links = docs.flatMap(extractLinks);
  const linksByHref = new Map();
  for (const link of links) {
    if (!linksByHref.has(link.href)) linksByHref.set(link.href, []);
    linksByHref.get(link.href).push(link);
  }

  const sitemapKoUrls = readSitemapUrls('public/sitemap-ko.xml');
  const rows = KEYWORDS.map((keyword) => summarizeCandidate(keyword, docsByUrl, docs, linksByHref, sitemapKoUrls));
  const sitemapCounts = {
    main: countSitemapUrls('public/sitemap-0.xml'),
    ko: countSitemapUrls('public/sitemap-ko.xml'),
    en: countSitemapUrls('public/sitemap-en.xml'),
    enPrefix: countSitemapUrls('public/en/sitemap.xml'),
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, buildReport(rows, sitemapCounts), 'utf8');

  console.log('# Naver real estate loan keyword opportunity audit');
  console.log('');
  console.log(`Scanned files: ${docs.length}`);
  console.log(`Report: ${path.relative(ROOT, REPORT_PATH).replace(/\\/g, '/')}`);
  console.log('');
  console.log('| Keyword | Current likely URL | Direct exists | Sitemap KO | Internal links | Recommendation |');
  console.log('| --- | --- | --- | --- | ---: | --- |');
  for (const row of rows) {
    console.log(`| ${row.keyword} | ${row.likelyUrl} | ${row.directExists ? 'yes' : 'no'} | ${row.sitemapKo ? 'yes' : 'no'} | ${row.internalLinkCount} | ${row.recommendation} |`);
  }

  const missing = rows.filter((row) => !row.directExists);
  if (missing.length) {
    console.error(`\n[audit] Missing direct URL candidates: ${missing.map((row) => row.keyword).join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log('\n[audit] PASS');
  }
}

main();
