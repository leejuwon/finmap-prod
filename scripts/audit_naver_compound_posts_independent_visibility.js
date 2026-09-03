const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = process.cwd();
const SITE_URL = "https://www.finmaphub.com";
const AUDIT_DATE = "2026-09-03";
const REPORT_PATH = path.join(ROOT, "reports", "naver-compound-posts-independent-visibility-audit.md");
const POST_PAGE_PATH = path.join(ROOT, "pages", "posts", "[category]", "[slug].js");
const COMPOUND_TOOL_PATH = path.join(ROOT, "pages", "tools", "compound-interest.js");
const SITEMAP_KO_PATH = path.join(ROOT, "public", "sitemap-ko.xml");

const TOOL_PATHS = [
  "/tools/compound-interest",
  "/tools/cagr-calculator",
  "/tools/dca-calculator",
  "/tools/goal-simulator",
];

const TARGET_POSTS = [
  {
    label: "복리 계산기 사용법",
    file: "content/posts/personalFinance/ko/compound-calculator-guide.md",
    urlPath: "/posts/personalFinance/compound-calculator-guide",
    intents: ["복리 계산기 사용법", "복리 계산 방법", "복리 계산 순서", "FinMap 복리 계산 가이드"],
    reverseRequired: true,
  },
  {
    label: "단리 vs 복리",
    file: "content/posts/personalFinance/ko/simple-vs-compound.md",
    urlPath: "/posts/personalFinance/simple-vs-compound",
    intents: ["단리 vs 복리", "단리 복리 차이", "단리와 복리"],
    reverseRequired: true,
  },
  {
    label: "연복리 월복리",
    file: "content/posts/personalFinance/ko/annual-vs-monthly-compound.md",
    urlPath: "/posts/personalFinance/annual-vs-monthly-compound",
    intents: ["연복리 월복리", "월복리 연복리 차이", "연복리와 월복리"],
    reverseRequired: true,
  },
  {
    label: "월 50만원 적립식",
    file: "content/posts/personalFinance/ko/monthly-dca-10-year-result.md",
    urlPath: "/posts/personalFinance/monthly-dca-10-year-result",
    intents: ["적립식 복리 계산", "월 50만원 적립식 투자", "월 적립식 투자 10년"],
    reverseRequired: true,
  },
  {
    label: "1억 모으기 월 납입",
    file: "content/posts/personalFinance/ko/how-much-per-month-for-100m.md",
    urlPath: "/posts/personalFinance/how-much-per-month-for-100m",
    intents: ["1억 모으기 월 납입", "1억 만들기 복리", "목표금액 복리 계산"],
    reverseRequired: true,
  },
  {
    label: "목표금액 복리",
    file: "content/posts/personalFinance/ko/goal-amount-fast-strategy.md",
    urlPath: "/posts/personalFinance/goal-amount-fast-strategy",
    intents: ["목표금액 모으는 법", "복리로 목표금액"],
    reverseRequired: true,
  },
  {
    label: "CAGR 개념",
    file: "content/posts/personalFinance/ko/what-is-cagr.md",
    urlPath: "/posts/personalFinance/what-is-cagr",
    intents: ["CAGR이란", "CAGR 계산법", "연평균 복리 수익률"],
    reverseRequired: false,
  },
];

const MANUAL_SERP_QUERIES = [
  "복리 finmap",
  "복리 계산기 사용법 finmap",
  "단리 vs 복리 finmap",
  "연복리 월복리 finmap",
  "월 50만원 적립식 투자 finmap",
  "복리 계산 공식 finmap",
  "site:finmaphub.com \"복리 계산기 사용법\"",
  "site:finmaphub.com \"단리 vs 복리\"",
  "site:finmaphub.com \"연복리와 월복리\"",
];

function readFile(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkDir(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value) {
  return normalizeText(String(value || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " "));
}

function stripMarkdown(value) {
  return normalizeText(
    String(value || "")
      .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, " $1 ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
      .replace(/<[^>]+>/g, " ")
      .replace(/[>#*_`~|:-]+/g, " ")
  );
}

function mdEscape(value) {
  return normalizeText(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function firstNonEmpty(...values) {
  return values.map((value) => String(value || "").trim()).find(Boolean) || "";
}

function normalizePathFromHref(href) {
  const raw = String(href || "").trim();
  if (!raw) return "";
  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      if (url.hostname === "finmaphub.com" || url.hostname.endsWith(".finmaphub.com")) {
        return normalizeUrlPath(url.pathname);
      }
      return raw;
    }
  } catch {
    return raw;
  }
  const withoutHash = raw.split("#")[0].split("?")[0];
  if (withoutHash.startsWith("/")) return normalizeUrlPath(withoutHash);
  return withoutHash;
}

function normalizeUrlPath(value) {
  const normalized = String(value || "").replace(/\/+$/, "");
  return normalized || "/";
}

function extractLinks(markdown) {
  const links = [];
  let match;

  const mdLinkPattern = /(!?)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  while ((match = mdLinkPattern.exec(markdown))) {
    if (match[1] === "!") continue;
    links.push({
      anchor: stripTags(match[2]),
      href: match[3],
      path: normalizePathFromHref(match[3]),
      index: match.index,
      source: "markdown",
    });
  }

  const htmlLinkPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = htmlLinkPattern.exec(markdown))) {
    links.push({
      anchor: stripTags(match[2]),
      href: match[1],
      path: normalizePathFromHref(match[1]),
      index: match.index,
      source: "html",
    });
  }

  return links.sort((a, b) => a.index - b.index);
}

function extractMarkdownH1(markdown) {
  const md = String(markdown || "").match(/^#\s+(.+)$/m);
  if (md) return stripTags(md[1]);
  const html = String(markdown || "").match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return html ? stripTags(html[1]) : "";
}

function queryTokens(query) {
  const stopWords = new Set(["finmap", "vs", "계산", "가이드", "방법", "순서"]);
  return normalizeText(query)
    .toLowerCase()
    .replace(/[“”"'·:|,?()[\]{}]/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/(와|과|의|은|는|이|가|을|를|로|으로)$/g, ""))
    .filter((token) => token && !stopWords.has(token));
}

function fieldIntentHit(value, query) {
  const haystack = normalizeText(value).toLowerCase();
  const needle = normalizeText(query).toLowerCase();
  if (!haystack || !needle) return false;
  if (haystack.includes(needle)) return true;
  const tokens = queryTokens(query);
  return tokens.length > 0 && tokens.every((token) => haystack.includes(token));
}

function queryCoverage(fields, intents) {
  return intents.map((query) => {
    const hitFields = Object.entries(fields)
      .filter(([, value]) => fieldIntentHit(value, query))
      .map(([name]) => name);
    return { query, hitFields };
  });
}

function hasNoindex(data) {
  return data.draft === true || data.noindex === true || /\bnoindex\b/i.test(String(data.robots || ""));
}

function typeList(node) {
  const type = node && node["@type"];
  if (Array.isArray(type)) return type.map(String);
  return type ? [String(type)] : [];
}

function flattenJsonLd(node) {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(flattenJsonLd);
  if (node["@graph"]) return [node, ...flattenJsonLd(node["@graph"])];
  return [node];
}

function extractJsonLdBlocks(markdown) {
  const blocks = [];
  const scriptPattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptPattern.exec(markdown))) {
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw);
      for (const node of flattenJsonLd(parsed)) {
        const types = typeList(node);
        if (types.includes("Article") || types.includes("BlogPosting")) {
          blocks.push({ node, index: match.index });
        }
      }
    } catch (error) {
      blocks.push({ parseError: error.message, index: match.index });
    }
  }
  return blocks;
}

function readSitemapLocs() {
  const xml = readFile(SITEMAP_KO_PATH);
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
}

function normalizeDate(value, fallback) {
  const parsed = value ? new Date(value) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return fallback || new Date(0).toISOString();
}

function getLatestKoRssCandidatePaths() {
  const postsRoot = path.join(ROOT, "content", "posts");
  return walkDir(postsRoot)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const rel = path.relative(postsRoot, file).replace(/\\/g, "/");
      const parts = rel.split("/");
      if (parts.length < 3 || parts[1] !== "ko") return null;
      const raw = readFile(file);
      const parsed = matter(raw);
      const data = parsed.data || {};
      if (hasNoindex(data)) return null;
      const fallback = fs.statSync(file).mtime.toISOString();
      const category = parts[0];
      const slug = path.basename(file, ".md");
      return {
        urlPath: `/posts/${category}/${slug}`,
        sortDate: normalizeDate(data.dateModified || data.datePublished || data.date, fallback),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
    .slice(0, 50)
    .map((item) => item.urlPath);
}

function parsePost(target) {
  const filePath = path.join(ROOT, target.file);
  const raw = readFile(filePath);
  if (!raw) {
    return {
      ...target,
      exists: false,
      data: {},
      content: "",
      raw: "",
      fields: {},
      links: [],
      top500: "",
    };
  }

  const parsed = matter(raw);
  const data = parsed.data || {};
  const content = parsed.content || "";
  const title = firstNonEmpty(data.title);
  const seoTitle = firstNonEmpty(data.seoTitle);
  const renderedTitle = firstNonEmpty(data.seoTitle, data.title);
  const description = firstNonEmpty(data.description);
  const seoDescription = firstNonEmpty(data.seoDescription);
  const renderedDescription = firstNonEmpty(data.seoDescription, data.description);
  const explicitH1 = extractMarkdownH1(content);
  const renderedH1 = firstNonEmpty(explicitH1, renderedTitle);
  const bodyText = stripMarkdown(content);
  const top500 = bodyText.slice(0, 500);
  const links = extractLinks(content);
  const jsonLdBlocks = extractJsonLdBlocks(content);
  const expectedDateModified = firstNonEmpty(data.dateModified, data.datePublished, data.date);

  const fields = {
    title,
    seoTitle,
    h1: renderedH1,
    description,
    seoDescription,
    top500,
  };
  const coverage = queryCoverage(fields, target.intents);
  const titleIntentHits = coverage.filter((row) => row.hitFields.some((field) => ["title", "seoTitle", "h1"].includes(field)));
  const descIntentHits = coverage.filter((row) => row.hitFields.some((field) => ["description", "seoDescription", "top500"].includes(field)));
  const calcLinks = links.filter((link) => TOOL_PATHS.includes(link.path));
  const relatedPostLinks = links.filter((link) => link.path.startsWith("/posts/") && link.path !== target.urlPath);
  const targetClusterLinks = relatedPostLinks.filter((link) => TARGET_POSTS.some((post) => post.urlPath === link.path));
  const firstCalcLink = calcLinks[0] || null;
  const independentPurposeClear = titleIntentHits.length > 0 && descIntentHits.length > 0;
  const calcLinkEarly = firstCalcLink ? firstCalcLink.index < 700 : false;
  const calcLinkStatus = !firstCalcLink
    ? "WARN"
    : calcLinkEarly && !independentPurposeClear
      ? "WARN"
      : "PASS";
  const manualArticleParseErrors = jsonLdBlocks.filter((block) => block.parseError);
  const manualArticleNodes = jsonLdBlocks.filter((block) => block.node);
  const manualArticleMismatches = [];

  for (const block of manualArticleNodes) {
    const { node } = block;
    if (normalizeText(node.headline) !== normalizeText(renderedTitle)) manualArticleMismatches.push("headline");
    if (normalizeText(node.description) !== normalizeText(renderedDescription)) manualArticleMismatches.push("description");
    if (normalizeText(node.dateModified) !== normalizeText(expectedDateModified)) manualArticleMismatches.push("dateModified");
  }

  return {
    ...target,
    exists: true,
    data,
    content,
    raw,
    fields,
    renderedTitle,
    renderedDescription,
    renderedH1,
    top500,
    links,
    coverage,
    titleIntentHits,
    descIntentHits,
    brand: {
      title: /finmap/i.test(`${title} ${seoTitle}`),
      description: /finmap/i.test(`${description} ${seoDescription}`),
      topBody: /finmap/i.test(top500),
      fullBody: /finmap/i.test(content),
    },
    calcLinks,
    relatedPostLinks,
    targetClusterLinks,
    firstCalcLink,
    calcLinkEarly,
    calcLinkStatus,
    independentPurposeClear,
    jsonLd: {
      manualArticleCount: manualArticleNodes.length,
      parseErrorCount: manualArticleParseErrors.length,
      mismatchFields: [...new Set(manualArticleMismatches)],
      expectedHeadline: renderedTitle,
      expectedDescription: renderedDescription,
      expectedDateModified,
    },
    indexState: {
      noindex: hasNoindex(data),
    },
  };
}

function auditPostPageSource() {
  const source = readFile(POST_PAGE_PATH);
  return {
    exists: Boolean(source),
    autoBlogPosting:
      source.includes("'@type': 'BlogPosting'") &&
      source.includes("headline: post.title") &&
      source.includes("description: post.description") &&
      source.includes("dateModified: post.dateModified || post.datePublished"),
    seoHeadSelfUrl: source.includes("SeoHead") && source.includes("url={`${prefix}/posts/${categorySlug}/${post.slug}`}"),
    h1FromPostTitle: /<h1\b[^>]*>\s*\{post\.title\}\s*<\/h1>/.test(source),
  };
}

function extractRelatedGuides(source) {
  const relatedStart = source.indexOf("const relatedGuides");
  const relatedEnd = source.indexOf("];", relatedStart);
  const relatedBlock = relatedStart >= 0 && relatedEnd > relatedStart ? source.slice(relatedStart, relatedEnd + 2) : "";
  const renderIndex = source.indexOf("relatedGuides.map");
  const slugs = [...relatedBlock.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
  const entries = [];
  for (const slug of slugs) {
    const objectStart = relatedBlock.lastIndexOf("{", relatedBlock.indexOf(`slug: "${slug}"`));
    const objectEnd = relatedBlock.indexOf("}", relatedBlock.indexOf(`slug: "${slug}"`));
    const objectText = objectStart >= 0 && objectEnd > objectStart ? relatedBlock.slice(objectStart, objectEnd) : "";
    const titleKo = (objectText.match(/titleKo:\s*"([^"]+)"/) || [])[1] || "";
    const descKo = (objectText.match(/descKo:\s*"([^"]+)"/) || [])[1] || "";
    entries.push({
      slug,
      urlPath: `/posts/personalFinance/${slug}`,
      titleKo,
      descKo,
      sourceIndex: source.indexOf(`slug: "${slug}"`),
      renderIndex,
    });
  }
  return entries;
}

function auditCalculatorBacklinks(posts) {
  const source = readFile(COMPOUND_TOOL_PATH);
  const relatedGuides = extractRelatedGuides(source);
  const renderIndex = source.indexOf("relatedGuides.map");
  const guideHrefPattern = /href=["']\/posts\/personalFinance\/compound-calculator-guide["']/;
  const renderRatio = renderIndex >= 0 && source.length > 0 ? renderIndex / source.length : 1;

  return posts
    .filter((post) => post.reverseRequired)
    .map((post) => {
      const relatedGuide = relatedGuides.find((item) => item.urlPath === post.urlPath);
      const directGuide = post.urlPath === "/posts/personalFinance/compound-calculator-guide" && guideHrefPattern.test(source)
        ? {
            titleKo: "복리 계산기 사용법 보기",
            urlPath: post.urlPath,
            renderIndex: source.search(guideHrefPattern),
          }
        : null;
      const guide = relatedGuide || directGuide;
      const genericAnchor = guide ? /^(보기|열기|자세히|관련 글|가이드|확인|바로가기)$/i.test(normalizeText(guide.titleKo)) : false;
      const bottomOnly = Boolean(guide) && renderRatio > 0.7;
      const status = !guide ? "WARN" : bottomOnly || genericAnchor ? "WARN" : "PASS";
      const notes = !guide
        ? "compound-interest.js relatedGuides에서 slug 미확인"
        : bottomOnly
          ? `relatedGuides 렌더링이 소스 하단부(${Math.round(renderRatio * 100)}%)에 위치`
          : "관련 글 카드 링크 확인";
      return {
        urlPath: post.urlPath,
        exists: Boolean(guide),
        titleKo: guide?.titleKo || "",
        genericAnchor,
        bottomOnly,
        status,
        notes,
      };
    });
}

function statusFromPost(post, sitemapLocs, rssPaths) {
  const technicalFails = [];
  const warnings = [];
  const fullUrl = `${SITE_URL}${post.urlPath}`;

  if (!post.exists) technicalFails.push("file missing");
  if (post.indexState.noindex) technicalFails.push("draft/noindex");
  if (!sitemapLocs.has(fullUrl)) technicalFails.push("sitemap-ko missing");
  if (post.jsonLd.parseErrorCount > 0) technicalFails.push("manual JSON-LD parse error");
  if (post.jsonLd.manualArticleCount > 0) technicalFails.push("manual Article duplicate risk");
  if (post.jsonLd.mismatchFields.length > 0) technicalFails.push(`manual Article mismatch: ${post.jsonLd.mismatchFields.join(", ")}`);

  if (post.titleIntentHits.length === 0) warnings.push("title/seoTitle/H1 target query weak");
  if (post.descIntentHits.length === 0) warnings.push("description/top body target query weak");
  if (!post.brand.title && !post.brand.description && !post.brand.topBody) warnings.push("FinMap brand not visible in title/description/top body");
  if (post.calcLinkStatus === "WARN") warnings.push("calculator link position or absence needs review");
  if (post.targetClusterLinks.length === 0) warnings.push("target post-to-post link absent");
  if (!rssPaths.includes(post.urlPath)) warnings.push("not in latest 50 KO RSS candidates");

  return {
    technicalFails,
    warnings,
    overall: technicalFails.length ? "FAIL" : warnings.length ? "WARN" : "PASS",
  };
}

function renderIntentAssignments(posts) {
  return posts.map((post) => `| ${post.urlPath} | ${post.intents.map(mdEscape).join("<br>")} |`).join("\n");
}

function renderTitleTable(posts) {
  return posts
    .map((post) => {
      const hitSummary = post.coverage
        .map((row) => `${row.query}: ${row.hitFields.length ? row.hitFields.join(", ") : "-"}`)
        .join("<br>");
      const status = post.titleIntentHits.length > 0 && post.descIntentHits.length > 0 ? "PASS" : "WARN";
      return `| ${post.urlPath} | ${status} | ${mdEscape(post.fields.title)} | ${mdEscape(post.fields.seoTitle)} | ${mdEscape(post.fields.h1)} | ${mdEscape(post.fields.description)} | ${hitSummary} |`;
    })
    .join("\n");
}

function renderBrandTable(posts) {
  return posts
    .map((post) => (
      `| ${post.urlPath} | ${post.brand.title ? "yes" : "no"} | ${post.brand.description ? "yes" : "no"} | ${post.brand.topBody ? "yes" : "no"} | ${post.brand.fullBody ? "yes" : "no"} |`
    ))
    .join("\n");
}

function renderCalcLinkTable(posts) {
  return posts
    .map((post) => {
      const first = post.firstCalcLink
        ? `${post.firstCalcLink.path} / ${post.firstCalcLink.anchor || "-"} / index ${post.firstCalcLink.index}`
        : "-";
      const note = !post.firstCalcLink
        ? "계산기 링크 없음"
        : post.calcLinkEarly
          ? (post.independentPurposeClear ? "초반 링크지만 글 목적 신호가 앞/동시에 확인됨" : "초반 계산기 링크가 포스트 목적보다 앞설 수 있음")
          : "계산기 링크가 본문 목적 설명 이후 등장";
      return `| ${post.urlPath} | ${post.calcLinkStatus} | ${post.calcLinks.length} | ${mdEscape(first)} | ${mdEscape(note)} |`;
    })
    .join("\n");
}

function renderPostLinkTable(posts) {
  return posts
    .map((post) => {
      const links = post.targetClusterLinks.map((link) => `${link.path} (${link.anchor || "-"})`).join("<br>") || "-";
      return `| ${post.urlPath} | ${post.relatedPostLinks.length} | ${post.targetClusterLinks.length} | ${mdEscape(links)} |`;
    })
    .join("\n");
}

function renderReverseLinkTable(rows) {
  return rows
    .map((row) => (
      `| ${row.urlPath} | ${row.status} | ${row.exists ? "yes" : "no"} | ${mdEscape(row.titleKo || "-")} | ${row.genericAnchor ? "yes" : "no"} | ${row.bottomOnly ? "yes" : "no"} | ${mdEscape(row.notes)} |`
    ))
    .join("\n");
}

function renderJsonLdTable(posts, pageSourceAudit) {
  return posts
    .map((post) => {
      const status = post.jsonLd.parseErrorCount || post.jsonLd.manualArticleCount || post.jsonLd.mismatchFields.length ? "FAIL" : "PASS";
      const detail = post.jsonLd.manualArticleCount
        ? `manual Article ${post.jsonLd.manualArticleCount}개; mismatch ${post.jsonLd.mismatchFields.join(", ") || "-"}`
        : "manual Article 없음; 공통 BlogPosting 사용";
      return `| ${post.urlPath} | ${status} | ${pageSourceAudit.autoBlogPosting ? "yes" : "no"} | ${post.jsonLd.manualArticleCount} | ${mdEscape(post.jsonLd.expectedHeadline)} | ${mdEscape(post.jsonLd.expectedDescription)} | ${post.jsonLd.expectedDateModified || "-"} | ${mdEscape(detail)} |`;
    })
    .join("\n");
}

function renderIndexTable(posts, sitemapLocs, rssPaths) {
  return posts
    .map((post) => {
      const fullUrl = `${SITE_URL}${post.urlPath}`;
      return `| ${post.urlPath} | ${sitemapLocs.has(fullUrl) ? "PASS" : "FAIL"} | ${rssPaths.includes(post.urlPath) ? "PASS" : "WARN"} | ${post.indexState.noindex ? "FAIL" : "PASS"} | ${post.data.dateModified || "-"} |`;
    })
    .join("\n");
}

function renderGaps(posts, statuses, reverseRows, pageSourceAudit) {
  const gaps = [];

  if (!pageSourceAudit.autoBlogPosting) gaps.push("- FAIL: 포스트 공통 페이지의 자동 BlogPosting 생성 신호가 예상과 다름");
  for (const post of posts) {
    const status = statuses.get(post.urlPath);
    for (const fail of status.technicalFails) gaps.push(`- FAIL: ${post.urlPath} - ${fail}`);
    for (const warning of status.warnings) gaps.push(`- WARN: ${post.urlPath} - ${warning}`);
  }
  for (const row of reverseRows) {
    if (row.status !== "PASS") gaps.push(`- WARN: 계산기 -> ${row.urlPath} - ${row.notes}`);
  }
  if (!gaps.length) gaps.push("- PASS: source-level 기준에서 별도 Gap 없음");
  gaps.push("- OBSERVE: 네이버 일반 검색/site 검색 실제 노출은 동봉한 SERP 관찰 템플릿에 수동 기록 필요");
  return gaps.join("\n");
}

function finalVerdict(posts, statuses, pageSourceAudit) {
  const hasTechnicalFail = !pageSourceAudit.autoBlogPosting || posts.some((post) => statuses.get(post.urlPath).technicalFails.length > 0);
  if (hasTechnicalFail) return "FAIL - 포스트의 sitemap/noindex/canonical/Article 구조에 회귀 발견";
  const hasWarnings = posts.some((post) => statuses.get(post.urlPath).warnings.length > 0);
  if (hasWarnings) return "HOLD - site 검색은 노출되나 일반 검색에서 tool만 대표 노출되어 포스트 독립성 보강 필요";
  return "PASS - 복리 포스팅 독립 노출 감사 완료";
}

function renderRecommendationTable(posts, statuses, reverseRows) {
  const rows = [];
  const manualArticleCount = posts.reduce((sum, post) => sum + post.jsonLd.manualArticleCount, 0);
  const hubBacklink = reverseRows.find((row) => row.urlPath === "/posts/personalFinance/compound-calculator-guide");
  const brandWeakCount = posts.filter((post) => statuses.get(post.urlPath).warnings.some((warning) => warning.includes("FinMap brand"))).length;
  const intentWeakCount = posts.filter((post) => statuses.get(post.urlPath).warnings.some((warning) => warning.includes("target query"))).length;
  const hubLinks = posts.find((post) => post.urlPath === "/posts/personalFinance/compound-calculator-guide")?.targetClusterLinks.length || 0;

  rows.push(manualArticleCount
    ? ["P0", "수동 Article JSON-LD 제거 또는 공통 BlogPosting과 정합성 보정", `남은 manual Article ${manualArticleCount}개`]
    : ["DONE", "수동 Article/BlogPosting 중복 제거", "대상 포스트 manual Article/BlogPosting 0개"]);

  rows.push(hubBacklink?.exists
    ? ["DONE", "계산기 -> compound-calculator-guide 역링크 확인", hubBacklink.bottomOnly ? "하단 관련 글 영역에서 확인, bottom-only WARN은 유지" : "관련 글 링크 확인"]
    : ["P0", "계산기 -> compound-calculator-guide 역링크 추가 검토", "사용법 포스트가 계산기 대표 보조문서로 연결되지 않음"]);

  rows.push(hubLinks >= 3
    ? ["DONE", "compound-calculator-guide 허브 링크 보강", `감사 클러스터 링크 ${hubLinks}개`]
    : ["P1", "compound-calculator-guide에서 관련 포스트 링크 보강", `감사 클러스터 링크 ${hubLinks}개`]);

  rows.push(brandWeakCount
    ? ["P1", "FinMap 브랜드를 title/description/top body 중 하나에 자연스럽게 보강", `${brandWeakCount}개 포스트 약함`]
    : ["DONE", "FinMap 브랜드 top body 신호 보강", "대상 포스트 top body/full body에서 확인"]);

  rows.push(intentWeakCount
    ? ["P1", "title/H1 또는 상단 문단의 담당 쿼리 신호 추가 검토", `${intentWeakCount}개 포스트 title/H1 기준 약함`]
    : ["DONE", "상단 500자/description의 담당 쿼리 신호 보강", "대상 포스트 상단 의도 신호 확인"]);

  return rows.map((row) => `| ${row[0]} | ${row[1]} | ${row[2]} |`).join("\n");
}

function renderReport({ posts, statuses, reverseRows, pageSourceAudit, sitemapLocs, rssPaths }) {
  const technicalFailCount = posts.reduce((sum, post) => sum + statuses.get(post.urlPath).technicalFails.length, pageSourceAudit.autoBlogPosting ? 0 : 1);
  const warningCount = posts.reduce((sum, post) => sum + statuses.get(post.urlPath).warnings.length, 0) + reverseRows.filter((row) => row.status !== "PASS").length;
  const verdict = finalVerdict(posts, statuses, pageSourceAudit);

  return `# FinMap 네이버 복리 포스팅 독립 노출 감사

감사 기준일: ${AUDIT_DATE}

이번 감사는 네이버에서 \`/tools/compound-interest\`가 \`복리 계산기\` 대표 후보로 보이는 상황에서, 복리 관련 포스트들이 별도 검색 의도를 맡을 수 있는지 현재 source-level 상태를 점검한다. 계산기 SEO title/description/H1/FAQ, canonical/hreflang, sitemap/RSS/robots 정책, GA4, package.json 회귀 여부는 별도 검증 대상으로 둔다.

## 1. 현재 현상 요약

- 관찰 전제: 네이버에서 \`복리 계산기\` 계열은 계산기 페이지가 대표 후보로 먼저 잡히는 상태다.
- 감사 질문: 포스트들이 \`복리 계산기 사용법\`, \`단리 vs 복리\`, \`연복리 월복리\`, \`월 50만원 적립식 투자\`처럼 독립 의도를 맡을 수 있는가.
- Codex는 네이버 SERP를 임의 판단하지 않았다. 실제 일반 검색/site 검색 결과는 \`reports/naver-compound-posts-serp-observation-template.md\`에 수동 기록한다.
- Source-level 결과: technical fail ${technicalFailCount}개, warning ${warningCount}개.

## 2. 기술적 색인 문제 여부 판단

| 항목 | 판정 | 근거 |
| --- | --- | --- |
| 포스트 공통 페이지 존재 | ${pageSourceAudit.exists ? "PASS" : "FAIL"} | pages/posts/[category]/[slug].js |
| 자동 BlogPosting 생성 | ${pageSourceAudit.autoBlogPosting ? "PASS" : "FAIL"} | headline/description/dateModified를 post 데이터에서 생성 |
| SeoHead self URL | ${pageSourceAudit.seoHeadSelfUrl ? "PASS" : "WARN"} | post canonical URL source marker |
| 렌더 H1 | ${pageSourceAudit.h1FromPostTitle ? "PASS" : "WARN"} | post.title 기반 H1 source marker |

## 3. 일반 검색에서 tool만 노출되는 현상 해석

- 계산기 페이지는 검색어 \`복리 계산기\`와 직접 일치하고, 사용자가 즉시 계산할 수 있는 도구형 의도에 강하다.
- 포스트는 정보형/비교형/사용법 의도에서 별도 후보가 되어야 한다.
- 따라서 일반 검색에서 tool만 대표 노출된다면 기술적 미색인보다 "포스트의 독립 검색 의도 신호와 내부 링크 배분" 문제일 가능성이 높다.
- 수동 Article JSON-LD가 남아 있다면 구조 리스크로 별도 표시한다.

## 4. 포스트별 담당 검색 의도

| URL | 담당 검색 의도 |
| --- | --- |
${renderIntentAssignments(posts)}

## 5. 포스트별 title/description/H1 매칭

| URL | Status | title | seoTitle | H1 | description | Query field hits |
| --- | --- | --- | --- | --- | --- | --- |
${renderTitleTable(posts)}

## 6. 브랜드명 FinMap 포함 여부

| URL | Title/seoTitle | Description/seoDescription | Top body 500 | Full body |
| --- | --- | --- | --- | --- |
${renderBrandTable(posts)}

## 7. 계산기 링크가 과도하게 앞서는지 여부

| URL | Status | Tool links | First calculator link | Note |
| --- | --- | ---: | --- | --- |
${renderCalcLinkTable(posts)}

## 8. 포스트끼리 내부링크 구조

| URL | Related post links | Links to audited cluster | Cluster link detail |
| --- | ---: | ---: | --- |
${renderPostLinkTable(posts)}

## 9. 계산기 → 포스트 역방향 링크 구조

| Post URL | Status | Link exists | Anchor/title | Generic anchor | Bottom-only | Note |
| --- | --- | --- | --- | --- | --- | --- |
${renderReverseLinkTable(reverseRows)}

## 10. Article/BlogPosting JSON-LD 정합성

| URL | Status | Auto BlogPosting | Manual Article count | Expected headline | Expected description | Expected dateModified | Detail |
| --- | --- | --- | ---: | --- | --- | --- | --- |
${renderJsonLdTable(posts, pageSourceAudit)}

## 11. sitemap/RSS/noindex 상태

| URL | sitemap-ko | RSS latest 50 candidate | noindex/draft | dateModified |
| --- | --- | --- | --- | --- |
${renderIndexTable(posts, sitemapLocs, rssPaths)}

## 12. 발견 Gap

${renderGaps(posts, statuses, reverseRows, pageSourceAudit)}

## 13. 최소 보정 후보

| Priority | Candidate | Reason |
| --- | --- | --- |
${renderRecommendationTable(posts, statuses, reverseRows)}

## 14. 최종 판정

${verdict}

## 부록. 수동 SERP 확인 쿼리

${MANUAL_SERP_QUERIES.map((query) => `- ${query}`).join("\n")}
`;
}

function runAudit() {
  const posts = TARGET_POSTS.map(parsePost);
  const pageSourceAudit = auditPostPageSource();
  const sitemapLocs = readSitemapLocs();
  const rssPaths = getLatestKoRssCandidatePaths();
  const statuses = new Map();

  for (const post of posts) {
    statuses.set(post.urlPath, statusFromPost(post, sitemapLocs, rssPaths));
  }

  const reverseRows = auditCalculatorBacklinks(posts);
  const report = renderReport({ posts, statuses, reverseRows, pageSourceAudit, sitemapLocs, rssPaths });

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, "utf8");

  console.log("Naver compound posts independent visibility audit complete.");
  console.log(`Report: ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`Final verdict: ${finalVerdict(posts, statuses, pageSourceAudit)}`);
}

runAudit();
