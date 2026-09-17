const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = process.cwd();
const SITE_URL = "https://www.finmaphub.com";
const POSTS_ROOT = path.join(ROOT, "content", "posts");
const KO_CATEGORY_DIRS = ["economicInfo", "personalFinance", "investingInfo"];
const DATE_STAMP = "2026-09-16";
const REPORT_MD = path.join(ROOT, "reports", `naver-ko-post-search-inventory-${DATE_STAMP}.md`);
const REPORT_JSON = path.join(ROOT, "reports", `naver-ko-post-search-inventory-${DATE_STAMP}.json`);

const TOOL_PATHS = {
  comp: "/tools/compound-interest",
  compound: "/tools/compound-interest",
  "compound-interest": "/tools/compound-interest",
  cagr: "/tools/cagr-calculator",
  dca: "/tools/dca-calculator",
  goal: "/tools/goal-simulator",
  "goal-simulator": "/tools/goal-simulator",
  fire: "/tools/fire-calculator",
  dsr: "/tools/dsr-ltv-calculator",
  ltv: "/tools/dsr-ltv-calculator",
  dsrLtv: "/tools/dsr-ltv-calculator",
  "dsr-ltv": "/tools/dsr-ltv-calculator",
  "dsr-ltv-calculator": "/tools/dsr-ltv-calculator",
  mortgageLoan: "/tools/mortgage-loan-calculator",
  mortgageloan: "/tools/mortgage-loan-calculator",
  "mortgage-loan": "/tools/mortgage-loan-calculator",
  "mortgage-loan-calculator": "/tools/mortgage-loan-calculator",
  homeBuying: "/tools/home-buying-budget-calculator",
  homebuying: "/tools/home-buying-budget-calculator",
  "home-buying": "/tools/home-buying-budget-calculator",
  "home-buying-budget": "/tools/home-buying-budget-calculator",
  "home-buying-budget-calculator": "/tools/home-buying-budget-calculator",
};

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDir(full));
    else out.push(full);
  }
  return out;
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function readMaybe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function dateValue(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

function asArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value) {
  return normalizeText(String(value || "").replace(/<[^>]+>/g, " "));
}

function removeJsonLdAndComments(content) {
  return String(content || "")
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

function stripMarkdown(content) {
  return normalizeText(
    removeJsonLdAndComments(content)
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, " $1 ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#>*_`~|:-]/g, " ")
      .replace(/\s+/g, " ")
  );
}

function readingWordCount(content) {
  const text = stripMarkdown(content);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function previewText(content, max = 360) {
  const cleaned = removeJsonLdAndComments(content)
    .replace(/```[\s\S]*?```/g, "\n")
    .replace(/<figure[\s\S]*?<\/figure>/gi, "\n")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "\n")
    .trim();
  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((block) => stripMarkdown(block))
    .filter((block) => {
      if (!block) return false;
      if (/^\|/.test(block)) return false;
      if (/^script\b/i.test(block)) return false;
      return true;
    });
  const text = paragraphs[0] || stripMarkdown(content);
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function mdEscape(value) {
  return String(value == null ? "" : value)
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>")
    .trim();
}

function truncate(value, max = 80) {
  const s = normalizeText(value);
  return s.length > max ? `${s.slice(0, max - 1)}...` : s;
}

function extractHeadings(content) {
  const noScripts = removeJsonLdAndComments(content);
  const mdH1 = [];
  const mdH2 = [];
  const mdH3 = [];
  let m;

  const h1Re = /^#\s+(.+)$/gm;
  while ((m = h1Re.exec(noScripts)) !== null) mdH1.push(stripTags(m[1]));

  const h2Re = /^##\s+(.+)$/gm;
  while ((m = h2Re.exec(noScripts)) !== null) mdH2.push(stripTags(m[1]));

  const h3Re = /^###\s+(.+)$/gm;
  while ((m = h3Re.exec(noScripts)) !== null) mdH3.push(stripTags(m[1]));

  const htmlH2Re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  while ((m = htmlH2Re.exec(noScripts)) !== null) mdH2.push(stripTags(m[1]));

  const htmlH3Re = /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi;
  while ((m = htmlH3Re.exec(noScripts)) !== null) mdH3.push(stripTags(m[1]));

  return {
    markdownH1s: mdH1,
    renderedH2s: [...mdH1, ...mdH2],
    h2s: mdH2,
    h3s: mdH3,
  };
}

function getAttr(tag, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, "i");
  const hit = String(tag || "").match(re);
  if (!hit) return "";
  return hit[1].replace(/^['"]|['"]$/g, "").trim();
}

function extractImages(content, cover) {
  const images = [];
  let m;
  const mdImageRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((m = mdImageRe.exec(content)) !== null) {
    images.push({ source: "markdown", alt: normalizeText(m[1]), src: normalizeText(m[2]) });
  }

  const htmlImgRe = /<img\b[^>]*>/gi;
  while ((m = htmlImgRe.exec(content)) !== null) {
    images.push({
      source: "html",
      alt: normalizeText(getAttr(m[0], "alt")),
      src: normalizeText(getAttr(m[0], "src")),
    });
  }

  return {
    coverImagePresent: Boolean(cover),
    contentImages: images,
    contentImageCount: images.length,
    renderedImageCount: images.length + (cover ? 1 : 0),
    figureCount: (content.match(/<figure\b/gi) || []).length,
    missingAltCount: images.filter((img) => !img.alt).length,
    presentAltCount: images.filter((img) => Boolean(img.alt)).length + (cover ? 1 : 0),
  };
}

function extractTables(content) {
  const htmlTables = (content.match(/<table\b/gi) || []).length;
  const lines = content.split(/\r?\n/);
  let mdTables = 0;
  for (let i = 1; i < lines.length; i += 1) {
    if (/\|/.test(lines[i - 1]) && /^\s*\|?\s*:?-{3,}:?\s*\|/.test(lines[i])) {
      mdTables += 1;
    }
  }
  return { tableCount: htmlTables + mdTables, tablePresent: htmlTables + mdTables > 0 };
}

function extractJsonLdBlocks(content) {
  const blocks = [];
  const scriptRe = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(content)) !== null) {
    const raw = m[1].trim();
    const typeMatches = Array.from(raw.matchAll(/"@type"\s*:\s*"([^"]+)"/g), (hit) => hit[1]);
    let parsedTypes = [];
    try {
      const parsed = JSON.parse(raw);
      parsedTypes = collectJsonLdTypes(parsed);
    } catch {
      parsedTypes = [];
    }
    blocks.push({
      rawTypeMatches: typeMatches,
      parsedTypes,
      parseStatus: parsedTypes.length ? "PARSED" : "RAW_ONLY",
    });
  }
  return blocks;
}

function collectJsonLdTypes(value) {
  const types = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (node["@type"]) {
      if (Array.isArray(node["@type"])) types.push(...node["@type"].map(String));
      else types.push(String(node["@type"]));
    }
    if (Array.isArray(node["@graph"])) node["@graph"].forEach(visit);
  };
  visit(value);
  return types;
}

function faqSignals(content, jsonLdBlocks) {
  const types = jsonLdBlocks.flatMap((block) => [...block.rawTypeMatches, ...block.parsedTypes]);
  const hasFaqJsonLd = types.includes("FAQPage");
  const questionMatches = Array.from(content.matchAll(/"@type"\s*:\s*"Question"/g)).length;
  const faqHeading = /자주\s*묻는\s*질문|FAQ|Q&A/i.test(content);
  const faqSectionQuestions = faqHeading
    ? (content.match(/^#{2,4}\s+.+\?/gm) || []).length
    : 0;
  return {
    faqPresent: hasFaqJsonLd || faqHeading || questionMatches > 0,
    faqJsonLdPresent: hasFaqJsonLd,
    faqQuestionCount: Math.max(questionMatches, faqSectionQuestions),
    faqDetection: hasFaqJsonLd ? "STATIC_CONFIRMED_JSONLD" : faqHeading ? "STATIC_INFERRED_HEADING" : "NOT_CONFIRMED",
  };
}

function extractLinks(content) {
  const links = [];
  let m;
  const htmlRe = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((m = htmlRe.exec(content)) !== null) {
    links.push({ source: "html", href: normalizeText(m[1]), anchor: stripTags(m[2]) });
  }

  const mdRe = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  while ((m = mdRe.exec(content)) !== null) {
    links.push({ source: "markdown", href: normalizeText(m[2]), anchor: stripMarkdown(m[1]) });
  }
  return links.filter((link) => link.href);
}

function toInternalPath(rawHref) {
  const href = String(rawHref || "").trim().replace(/\\\//g, "/");
  if (!href || href.startsWith("#")) return null;
  if (/^(mailto:|tel:|javascript:)/i.test(href)) return null;

  try {
    if (/^https?:\/\//i.test(href)) {
      const parsed = new URL(href);
      if (parsed.origin !== SITE_URL) return null;
      return normalizeInternalPath(`${parsed.pathname}${parsed.search || ""}${parsed.hash || ""}`);
    }
  } catch {
    return null;
  }

  if (href.startsWith("/")) return normalizeInternalPath(href);
  return { relative: true, value: href };
}

function normalizeInternalPath(value) {
  let raw = String(value || "").trim();
  if (!raw) return raw;
  raw = raw.split("#")[0].split("?")[0];
  raw = raw.replace(/\/{2,}/g, "/");
  if (raw === "/ko") raw = "/";
  else if (raw.startsWith("/ko/")) raw = raw.replace(/^\/ko/, "") || "/";
  if (raw.length > 1 && raw.endsWith("/")) raw = raw.slice(0, -1);
  return raw;
}

function linkKind(internalPath) {
  if (!internalPath || typeof internalPath !== "string") return "other";
  if (/^\/(?:en\/)?posts\/[^/]+\/[^/]+$/.test(internalPath)) return "post";
  if (/^\/(?:en\/)?tools(?:\/|$)/.test(internalPath)) return "tool";
  if (/^\/(?:en\/)?market(?:\/|$)/.test(internalPath)) return "market";
  if (/^\/(?:en\/)?category(?:\/|$)/.test(internalPath)) return "category";
  return "page";
}

function normalizeToolId(raw) {
  const value = String(raw || "").trim();
  return TOOL_PATHS[value] ? value : value.toLowerCase();
}

function postTools(data) {
  const raw = data.tools != null ? data.tools : data.tool;
  return asArray(raw);
}

function toolPathFor(rawTool) {
  const raw = String(rawTool || "").trim();
  return TOOL_PATHS[raw] || TOOL_PATHS[raw.toLowerCase()] || null;
}

function isNoindex(data) {
  const robots = String(data.robots || "");
  return data.draft === true || data.noindex === true || /noindex/i.test(robots);
}

function loadSitemapLocs(filePath) {
  const xml = readMaybe(filePath);
  const entries = new Map();
  const re = /<url>([\s\S]*?)<\/url>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const body = m[1];
    const loc = body.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim();
    if (loc) entries.set(loc, body);
  }
  return entries;
}

function titleKey(value) {
  return normalizeText(value).toLowerCase();
}

function looseKey(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function tokenSet(value) {
  return new Set(
    normalizeText(value)
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2)
  );
}

function charNgrams(value, n = 3) {
  const compact = looseKey(value);
  const out = new Set();
  if (compact.length <= n) {
    if (compact) out.add(compact);
    return out;
  }
  for (let i = 0; i <= compact.length - n; i += 1) out.add(compact.slice(i, i + n));
  return out;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 0;
  let hit = 0;
  for (const item of a) if (b.has(item)) hit += 1;
  return hit / (a.size + b.size - hit);
}

function scoreRelatedPost(base, candidate) {
  const baseTags = new Set(base.tags.map((tag) => String(tag).toLowerCase()));
  const candTags = new Set(candidate.tags.map((tag) => String(tag).toLowerCase()));
  const baseTools = new Set(base.tools.map((tool) => String(tool).toLowerCase()));
  const candTools = new Set(candidate.tools.map((tool) => String(tool).toLowerCase()));
  let score = 0;
  for (const tag of candTags) if (baseTags.has(tag)) score += 4;
  for (const tool of candTools) if (baseTools.has(tool)) score += 5;
  if (candidate.categorySlug === base.categorySlug) score += 2;
  const year = new Date(candidate.datePublished || 0).getFullYear();
  if (Number.isFinite(year)) score += Math.min(2, Math.max(0, year - 2023) * 0.25);
  return score;
}

function parsePostFile(fullPath) {
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data || {};
  const content = parsed.content || "";
  const categorySlug = rel(fullPath).split("/")[2];
  const fileSlug = path.basename(fullPath).replace(/\.md$/, "");
  const fmSlug = data.slug ? String(data.slug).trim() : "";
  const slug = fileSlug;
  const url = `/posts/${categorySlug}/${slug}`;
  const canonical = `${SITE_URL}${url}`;
  const effectiveTitle = String(data.seoTitle || data.title || "").trim();
  const effectiveDescription = String(data.seoDescription || data.description || "").trim();
  const tags = asArray(data.tags);
  const tools = postTools(data);
  const headings = extractHeadings(content);
  const jsonLdBlocks = extractJsonLdBlocks(content);
  const jsonLdTypes = jsonLdBlocks.flatMap((block) => [...block.rawTypeMatches, ...block.parsedTypes]);
  const faq = faqSignals(content, jsonLdBlocks);
  const images = extractImages(content, data.cover);
  const tables = extractTables(content);
  const rawLinks = extractLinks(content);
  const internalLinks = [];
  const externalLinks = [];
  const relativeLinks = [];

  for (const link of rawLinks) {
    const internal = toInternalPath(link.href);
    if (!internal) {
      if (/^https?:\/\//i.test(link.href)) externalLinks.push(link);
      continue;
    }
    if (typeof internal === "object" && internal.relative) {
      relativeLinks.push({ ...link, normalized: internal.value });
      continue;
    }
    internalLinks.push({ ...link, normalized: internal, kind: linkKind(internal) });
  }

  const contentText = stripMarkdown(content);
  const flags = [];
  const titleLength = effectiveTitle.length;
  const descriptionLength = effectiveDescription.length;
  if (!effectiveTitle) flags.push("MISSING_TITLE");
  else if (titleLength > 65) flags.push("LONG_TITLE_REVIEW");
  else if (titleLength < 15) flags.push("SHORT_TITLE_REVIEW");
  if (!effectiveDescription) flags.push("MISSING_DESCRIPTION");
  else if (descriptionLength > 170) flags.push("LONG_DESCRIPTION_REVIEW");
  else if (descriptionLength < 50) flags.push("SHORT_DESCRIPTION_REVIEW");
  if (headings.renderedH2s.length < 2) flags.push("LOW_H2_COUNT");
  if (headings.renderedH2s.length > 14) flags.push("HIGH_H2_COUNT");
  if (!faq.faqPresent) flags.push("NO_FAQ_DETECTED");
  if (images.missingAltCount > 0) flags.push("IMAGE_ALT_MISSING");
  if (relativeLinks.length > 0) flags.push("RELATIVE_LINK_REVIEW");
  if (jsonLdTypes.includes("Article") || jsonLdTypes.includes("BlogPosting")) {
    flags.push("MANUAL_ARTICLE_SCHEMA_WITH_TEMPLATE");
  }
  if (fmSlug && fmSlug !== fileSlug) flags.push("FRONTMATTER_SLUG_DIFFERS_FROM_FILENAME");
  if (data.postCategory && String(data.postCategory) !== categorySlug) flags.push("POST_CATEGORY_DIFFERS_FROM_FOLDER");
  if (isNoindex(data)) flags.push("NOINDEX_OR_DRAFT");

  return {
    id: `${categorySlug}/${slug}`,
    filePath: rel(fullPath),
    categorySlug,
    category: String(data.category || ""),
    postCategory: String(data.postCategory || ""),
    slug,
    frontmatterSlug: fmSlug,
    url,
    canonical,
    title: effectiveTitle,
    sourceTitle: String(data.title || "").trim(),
    description: effectiveDescription,
    sourceDescription: String(data.description || "").trim(),
    datePublished: dateValue(data.datePublished || data.date),
    dateModified: dateValue(data.dateModified),
    tags,
    tools,
    cover: data.cover ? String(data.cover).trim() : "",
    lang: String(data.lang || ""),
    hreflangEquivalent: data.hreflangEquivalent === false ? false : true,
    hreflangAlternates: data.hreflangAlternates || null,
    counts: {
      wordCount: readingWordCount(content),
      characterCount: contentText.length,
      titleLength,
      descriptionLength,
    },
    structure: {
      renderedH1: effectiveTitle,
      h1Status: "RENDER_INFERRED_TEMPLATE",
      markdownH1s: headings.markdownH1s,
      h2s: headings.renderedH2s,
      h2Count: headings.renderedH2s.length,
      h3Count: headings.h3s.length,
      introPreview: previewText(content, 380),
      faqPresent: faq.faqPresent,
      faqQuestionCount: faq.faqQuestionCount,
      faqDetection: faq.faqDetection,
      tablePresent: tables.tablePresent,
      tableCount: tables.tableCount,
      figureCount: images.figureCount,
      contentImageCount: images.contentImageCount,
      renderedImageCount: images.renderedImageCount,
      imageAltMissingCount: images.missingAltCount,
      imageAltPresentCount: images.presentAltCount,
      coverImagePresent: images.coverImagePresent,
    },
    jsonLd: {
      manualBlockCount: jsonLdBlocks.length,
      manualTypes: Array.from(new Set(jsonLdTypes)),
      manualArticleLike: jsonLdTypes.includes("Article") || jsonLdTypes.includes("BlogPosting"),
      manualFaqPage: faq.faqJsonLdPresent,
      templateBlogPosting: "RENDER_INFERRED",
      templateBreadcrumb: "RENDER_INFERRED",
    },
    links: {
      explicitInternalLinks: internalLinks,
      explicitExternalLinkCount: externalLinks.length,
      relativeLinks,
      explicitOutboundInternalCount: internalLinks.length,
      explicitOutboundPostCount: internalLinks.filter((link) => link.kind === "post").length,
      explicitOutboundToolCount: internalLinks.filter((link) => link.kind === "tool").length,
      explicitOutboundMarketCount: internalLinks.filter((link) => link.kind === "market").length,
      explicitOutboundPageCount: internalLinks.filter((link) => ["page", "category"].includes(link.kind)).length,
      templateOutboundPostUrls: [],
      templateOutboundToolUrls: [],
      inboundExplicitPostUrls: [],
      inboundTemplatePostUrls: [],
      templatePageInboundUrls: [`/category/${categorySlug}`, "/sitemap-pages"],
      relatedPostsComponent: "RENDER_INFERRED_TEMPLATE",
      toolCtaComponent: tools.length ? "RENDER_INFERRED_TEMPLATE" : "NOT_APPLICABLE",
    },
    seo: {
      robots: String(data.robots || ""),
      noindex: isNoindex(data),
      indexable: !isNoindex(data),
      canonicalExpected: canonical,
      canonicalSelf: "RENDER_INFERRED_TEMPLATE",
      articleSchema: "RENDER_INFERRED_TEMPLATE_BLOGPOSTING",
      faqSchema: faq.faqJsonLdPresent ? "STATIC_CONFIRMED_MANUAL" : "NOT_CONFIRMED",
      breadcrumbSchema: "RENDER_INFERRED_TEMPLATE",
      hreflang: "RENDER_INFERRED_TEMPLATE",
      hreflangMode: "PENDING_EN_COUNTERPART_CHECK",
      koSelfCanonical: "RENDER_INFERRED_TEMPLATE",
      sitemapMain: false,
      sitemapKo: false,
      sitemapHreflangSelf: false,
    },
    flags,
  };
}

function postUrlToId(url) {
  const m = String(url || "").match(/^\/posts\/([^/]+)\/([^/]+)$/);
  return m ? `${m[1]}/${m[2]}` : null;
}

function buildDuplicateGroups(posts, field) {
  const map = new Map();
  for (const post of posts) {
    const key = titleKey(post[field]);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(post.id);
  }
  return Array.from(map.entries())
    .filter(([, ids]) => ids.length > 1)
    .map(([value, ids]) => ({ value, ids }));
}

function buildSimilarTitleCandidates(posts) {
  const out = [];
  for (let i = 0; i < posts.length; i += 1) {
    for (let j = i + 1; j < posts.length; j += 1) {
      const a = posts[i];
      const b = posts[j];
      const tokenScore = jaccard(tokenSet(a.title), tokenSet(b.title));
      const charScore = jaccard(charNgrams(a.title), charNgrams(b.title));
      const tagScore = jaccard(new Set(a.tags), new Set(b.tags));
      const score = Math.max(tokenScore, charScore * 0.9) + tagScore * 0.2;
      if (score >= 0.42 || (tagScore >= 0.8 && (tokenScore >= 0.25 || charScore >= 0.3))) {
        out.push({
          a: a.id,
          b: b.id,
          score: Number(score.toFixed(3)),
          titleA: a.title,
          titleB: b.title,
          tagOverlap: Number(tagScore.toFixed(3)),
        });
      }
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 50);
}

function buildTagSummary(posts) {
  const map = new Map();
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!map.has(tag)) {
        map.set(tag, {
          tag,
          count: 0,
          categories: {},
          posts: [],
        });
      }
      const item = map.get(tag);
      item.count += 1;
      item.categories[post.categorySlug] = (item.categories[post.categorySlug] || 0) + 1;
      item.posts.push(post.id);
    }
  }

  const tags = Array.from(map.values()).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  const normMap = new Map();
  for (const item of tags) {
    const key = looseKey(item.tag);
    if (!key) continue;
    if (!normMap.has(key)) normMap.set(key, []);
    normMap.get(key).push(item.tag);
  }
  const similarGroups = Array.from(normMap.values())
    .filter((items) => new Set(items).size > 1)
    .map((items) => Array.from(new Set(items)));

  return {
    totalUnique: tags.length,
    totalAssignments: tags.reduce((sum, tag) => sum + tag.count, 0),
    singleUse: tags.filter((tag) => tag.count === 1),
    broad: tags.filter((tag) => tag.count >= 8),
    similarGroups,
    tags,
    currentState: {
      frontmatterTags: "STATIC_CONFIRMED",
      visibleInPostTemplate: "RENDER_INFERRED_TEXT_CHIPS",
      tagLinks: "NOT_CONFIRMED",
      tagArchivePages: "NOT_CONFIRMED",
      jsonLdKeywords: "RENDER_INFERRED_TEMPLATE",
      relatedPostScoringUsesTags: "RENDER_INFERRED_TEMPLATE",
    },
  };
}

function summarizeFlags(posts) {
  const counts = {};
  for (const post of posts) {
    for (const flag of post.flags) counts[flag] = (counts[flag] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([flag, count]) => ({ flag, count }));
}

function median(values) {
  const nums = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!nums.length) return 0;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

function buildReport(data) {
  const { summary, posts, tags, duplicates, similarDocuments, sitemapAnomalies } = data;
  const lines = [];
  lines.push("# FinMap KO Post Naver Search Inventory Baseline");
  lines.push("");
  lines.push(`Generated: ${data.generatedAt}`);
  lines.push("");
  lines.push("## Final Verdict");
  lines.push("");
  lines.push(`Final Verdict: ${summary.finalVerdict}`);
  lines.push("");
  lines.push("This is an audit-only inventory. No post content, frontmatter, component, SEO component, sitemap config, robots, canonical, hreflang, or runtime code was changed.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- KO post total: ${summary.totalPosts}`);
  lines.push(`- economicInfo: ${summary.categoryCounts.economicInfo || 0}`);
  lines.push(`- personalFinance: ${summary.categoryCounts.personalFinance || 0}`);
  lines.push(`- investingInfo: ${summary.categoryCounts.investingInfo || 0}`);
  lines.push(`- indexable: ${summary.indexableCount}`);
  lines.push(`- noindex/draft: ${summary.noindexCount}`);
  lines.push(`- canonical anomalies: ${summary.canonicalAnomalyCount}`);
  lines.push(`- duplicate title candidates: ${duplicates.title.length}`);
  lines.push(`- similar title candidates: ${similarDocuments.length}`);
  lines.push(`- post-graph orphan candidates, excluding category/sitemap templates: ${summary.orphanCandidateCount}`);
  lines.push(`- low inbound candidates, explicit + related-post template <= 1: ${summary.lowInboundCandidateCount}`);
  lines.push(`- tag total: ${tags.totalUnique}`);
  lines.push(`- single-use tag count: ${tags.singleUse.length}`);
  lines.push(`- posts with FAQ signal: ${summary.postsWithFaq}`);
  lines.push(`- posts without FAQ signal: ${summary.postsWithoutFaq}`);
  lines.push(`- template BlogPosting schema inferred: ${summary.templateArticleCount}`);
  lines.push(`- manual Article/BlogPosting JSON-LD blocks: ${summary.manualArticleLikeCount}`);
  lines.push(`- image alt anomalies: ${summary.imageAltAnomalyCount}`);
  lines.push(`- sitemap anomalies: ${summary.sitemapAnomalyCount}`);
  lines.push("");
  lines.push("## Category Counts");
  lines.push("");
  lines.push("| Category | Count | Indexable | Noindex | In sitemap-ko | In sitemap-0 |");
  lines.push("|---|---:|---:|---:|---:|---:|");
  for (const category of KO_CATEGORY_DIRS) {
    const rows = posts.filter((post) => post.categorySlug === category);
    lines.push(
      `| ${category} | ${rows.length} | ${rows.filter((p) => p.seo.indexable).length} | ${rows.filter((p) => p.seo.noindex).length} | ${rows.filter((p) => p.seo.sitemapKo).length} | ${rows.filter((p) => p.seo.sitemapMain).length} |`
    );
  }
  lines.push("");
  lines.push("## Top Structural Findings");
  lines.push("");
  for (const item of summary.flagCounts.slice(0, 15)) {
    lines.push(`- ${item.flag}: ${item.count}`);
  }
  lines.push("");
  lines.push(`- Median H2 count: ${summary.medians.h2Count}`);
  lines.push(`- Median explicit outbound internal links: ${summary.medians.explicitOutboundInternal}`);
  lines.push(`- Median explicit inbound post links: ${summary.medians.explicitInboundPost}`);
  lines.push(`- Median explicit + related-template inbound post links: ${summary.medians.postGraphInbound}`);
  lines.push("");
  lines.push("## TAG SYSTEM CURRENT STATE");
  lines.push("");
  lines.push(`- Frontmatter tags: ${tags.currentState.frontmatterTags}`);
  lines.push(`- Visible post tags: ${tags.currentState.visibleInPostTemplate}`);
  lines.push(`- Tag links: ${tags.currentState.tagLinks}`);
  lines.push(`- Tag archive pages: ${tags.currentState.tagArchivePages}`);
  lines.push(`- JSON-LD keywords: ${tags.currentState.jsonLdKeywords}`);
  lines.push(`- Related-post scoring uses tags: ${tags.currentState.relatedPostScoringUsesTags}`);
  lines.push("");
  lines.push("### Most Used Tags");
  lines.push("");
  lines.push("| Tag | Count | Categories |");
  lines.push("|---|---:|---|");
  for (const tag of tags.tags.slice(0, 30)) {
    lines.push(`| ${mdEscape(tag.tag)} | ${tag.count} | ${mdEscape(Object.entries(tag.categories).map(([k, v]) => `${k}:${v}`).join(", "))} |`);
  }
  lines.push("");
  lines.push(`Single-use tags are listed in the JSON output (${tags.singleUse.length} entries).`);
  if (tags.similarGroups.length) {
    lines.push("");
    lines.push("### Similar/Duplicate Tag Candidates");
    lines.push("");
    for (const group of tags.similarGroups.slice(0, 30)) {
      lines.push(`- ${group.map((tag) => `\`${tag}\``).join(", ")}`);
    }
  }
  lines.push("");
  lines.push("## INTERNAL LINK CURRENT STATE");
  lines.push("");
  lines.push("- EXPLICIT means links written directly in markdown/html body.");
  lines.push("- TEMPLATE means the post template's related-post section or category/sitemap listing can create the link.");
  lines.push("- INFERRED page inbound is counted from category hub and sitemap-pages only; home/latest cards are not assumed for every post.");
  lines.push("");
  lines.push(`- Explicit post-graph orphan candidates: ${summary.orphanCandidateCount}`);
  lines.push(`- Explicit + related-template low inbound candidates: ${summary.lowInboundCandidateCount}`);
  lines.push(`- Posts with zero explicit outbound internal links: ${posts.filter((p) => p.links.explicitOutboundInternalCount === 0).length}`);
  lines.push(`- Posts with zero explicit outbound post links: ${posts.filter((p) => p.links.explicitOutboundPostCount === 0).length}`);
  lines.push("");
  lines.push("## SEARCH DOCUMENT STRUCTURE");
  lines.push("");
  lines.push(`- Long title review candidates: ${posts.filter((p) => p.flags.includes("LONG_TITLE_REVIEW")).length}`);
  lines.push(`- Short title review candidates: ${posts.filter((p) => p.flags.includes("SHORT_TITLE_REVIEW")).length}`);
  lines.push(`- Missing descriptions: ${posts.filter((p) => p.flags.includes("MISSING_DESCRIPTION")).length}`);
  lines.push(`- Long description review candidates: ${posts.filter((p) => p.flags.includes("LONG_DESCRIPTION_REVIEW")).length}`);
  lines.push(`- Low H2 count candidates: ${posts.filter((p) => p.flags.includes("LOW_H2_COUNT")).length}`);
  lines.push(`- High H2 count candidates: ${posts.filter((p) => p.flags.includes("HIGH_H2_COUNT")).length}`);
  lines.push(`- FAQ not detected: ${summary.postsWithoutFaq}`);
  lines.push(`- Image alt missing candidates: ${summary.imageAltAnomalyCount}`);
  lines.push("");
  lines.push("## INDEXABILITY");
  lines.push("");
  lines.push("- Canonical, BlogPosting schema, Breadcrumb schema, visible tag chips, and hreflang are inferred from the shared post template.");
  lines.push("- Sitemap membership is checked against current `public/sitemap-0.xml` and `public/sitemap-ko.xml`.");
  lines.push("");
  lines.push("| Type | Count |");
  lines.push("|---|---:|");
  for (const [key, value] of Object.entries(sitemapAnomalies.summary)) {
    lines.push(`| ${key} | ${value} |`);
  }
  lines.push("");
  if (sitemapAnomalies.items.length) {
    lines.push("### Sitemap/Indexability Anomaly Candidates");
    lines.push("");
    for (const item of sitemapAnomalies.items.slice(0, 50)) {
      lines.push(`- ${item.id}: ${item.flags.join(", ")}`);
    }
    lines.push("");
  }
  lines.push("## Duplicate / Similar Document Candidates");
  lines.push("");
  lines.push(`- Exact duplicate title groups: ${duplicates.title.length}`);
  lines.push(`- Exact duplicate description groups: ${duplicates.description.length}`);
  lines.push(`- Similar title candidates: ${similarDocuments.length}`);
  lines.push("");
  for (const item of similarDocuments.slice(0, 25)) {
    lines.push(`- ${item.a} <-> ${item.b} (score ${item.score}, tag overlap ${item.tagOverlap})`);
  }
  lines.push("");
  lines.push("## All KO Posts Inventory");
  lines.push("");
  lines.push("| Category | URL | Title | Description | Tags | H2 Count | FAQ | Images | Inbound | Outbound | Canonical | Indexable | Article Schema | Sitemap | Flags |");
  lines.push("|---|---|---|---|---|---:|---|---:|---:|---:|---|---|---|---|---|");
  for (const post of posts) {
    const inbound = post.links.inboundExplicitPostCount + post.links.inboundTemplatePostCount;
    const sitemap = post.seo.sitemapMain && post.seo.sitemapKo ? "main+ko" : post.seo.sitemapMain ? "main" : post.seo.sitemapKo ? "ko" : "missing";
    lines.push(
      [
        post.categorySlug,
        post.url,
        truncate(post.title, 70),
        truncate(post.description, 80),
        truncate(post.tags.slice(0, 5).join(", "), 70),
        post.structure.h2Count,
        post.structure.faqPresent ? `yes:${post.structure.faqQuestionCount}` : "no",
        post.structure.renderedImageCount,
        inbound,
        post.links.explicitOutboundInternalCount + post.links.templateOutboundPostCount + post.links.templateOutboundToolCount,
        post.seo.canonicalSelf,
        post.seo.indexable ? "yes" : "no",
        post.seo.articleSchema,
        sitemap,
        post.flags.slice(0, 5).join(", "),
      ].map(mdEscape).join(" | ").replace(/^/, "| ").replace(/$/, " |")
    );
  }
  lines.push("");
  lines.push("## DATA QUALITY / LIMITATIONS");
  lines.push("");
  lines.push("- This audit is repository/static-source based only. It did not call Naver Search, Naver Search Advisor, Google Search Console, or external SEO APIs.");
  lines.push("- Rendered canonical/hreflang/schema status is inferred from shared Next.js components and current source, not fetched from a running production URL.");
  lines.push("- Related-post template links are reproduced from the scoring logic visible in `pages/posts/[category]/[slug].js`; exact runtime UI can still vary after future template changes.");
  lines.push("- Query, intent, cannibalization final decisions, title rewrites, tag rewrites, content rewrites, and internal-link additions are intentionally deferred to Step 2+.");
  lines.push("");
  lines.push("## Generated Files");
  lines.push("");
  lines.push(`- \`${rel(REPORT_MD)}\``);
  lines.push(`- \`${rel(REPORT_JSON)}\``);
  lines.push("");
  lines.push("## Step 2 Readiness");
  lines.push("");
  lines.push("Step 2 Query/Intent Audit can proceed: YES");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function main() {
  const files = KO_CATEGORY_DIRS.flatMap((category) =>
    walkDir(path.join(POSTS_ROOT, category, "ko")).filter((file) => file.endsWith(".md"))
  ).sort();

  const posts = files.map(parsePostFile);
  const postById = new Map(posts.map((post) => [post.id, post]));
  const postByUrl = new Map(posts.map((post) => [post.url, post]));

  const enFiles = new Set(
    KO_CATEGORY_DIRS.flatMap((category) =>
      walkDir(path.join(POSTS_ROOT, category, "en")).filter((file) => file.endsWith(".md"))
    ).map((file) => {
      const category = rel(file).split("/")[2];
      const slug = path.basename(file).replace(/\.md$/, "");
      return `${category}/${slug}`;
    })
  );

  const mainSitemap = loadSitemapLocs(path.join(ROOT, "public", "sitemap-0.xml"));
  const koSitemap = loadSitemapLocs(path.join(ROOT, "public", "sitemap-ko.xml"));

  for (const post of posts) {
    const enId = post.id;
    const hasEnCounterpart = enFiles.has(enId);
    post.seo.hreflangMode = post.hreflangEquivalent === false
      ? "SELF_ONLY_OPT_OUT"
      : hasEnCounterpart
        ? "KO_EN_PAIR_INFERRED"
        : "SELF_OR_MISSING_EN_REVIEW";
    post.seo.enCounterpart = hasEnCounterpart;
    post.seo.sitemapMain = mainSitemap.has(post.canonical);
    post.seo.sitemapKo = koSitemap.has(post.canonical);
    post.seo.sitemapHreflangSelf = (mainSitemap.get(post.canonical) || koSitemap.get(post.canonical) || "").includes(`hreflang="ko" href="${post.canonical}"`);
    if (post.seo.indexable && !post.seo.sitemapMain) post.flags.push("INDEXABLE_MISSING_MAIN_SITEMAP");
    if (post.seo.indexable && !post.seo.sitemapKo) post.flags.push("INDEXABLE_MISSING_KO_SITEMAP");
    if (post.seo.sitemapMain && !post.seo.sitemapHreflangSelf) post.flags.push("SITEMAP_HREFLANG_SELF_MISSING_REVIEW");
    if (post.seo.noindex && (post.seo.sitemapMain || post.seo.sitemapKo)) post.flags.push("NOINDEX_IN_SITEMAP");
  }

  for (const post of posts) {
    const sameCategory = posts
      .filter((candidate) => candidate.id !== post.id && candidate.categorySlug === post.categorySlug)
      .sort((a, b) => {
        const scoreDiff = scoreRelatedPost(post, b) - scoreRelatedPost(post, a);
        if (scoreDiff) return scoreDiff;
        return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
      })
      .slice(0, 5);
    post.links.templateOutboundPostUrls = sameCategory.map((candidate) => candidate.url);
    post.links.templateOutboundToolUrls = Array.from(new Set(post.tools.map(toolPathFor).filter(Boolean))).slice(0, 3);
  }

  for (const post of posts) {
    for (const link of post.links.explicitInternalLinks) {
      if (link.kind !== "post") continue;
      const target = postByUrl.get(link.normalized);
      if (target && target.id !== post.id) target.links.inboundExplicitPostUrls.push(post.url);
    }
    for (const targetUrl of post.links.templateOutboundPostUrls) {
      const target = postByUrl.get(targetUrl);
      if (target && target.id !== post.id) target.links.inboundTemplatePostUrls.push(post.url);
    }
  }

  for (const post of posts) {
    post.links.inboundExplicitPostUrls = Array.from(new Set(post.links.inboundExplicitPostUrls)).sort();
    post.links.inboundTemplatePostUrls = Array.from(new Set(post.links.inboundTemplatePostUrls)).sort();
    post.links.inboundExplicitPostCount = post.links.inboundExplicitPostUrls.length;
    post.links.inboundTemplatePostCount = post.links.inboundTemplatePostUrls.length;
    post.links.inboundToolPageCount = 0;
    post.links.inboundTotalIncludingInferredPages =
      post.links.inboundExplicitPostCount + post.links.inboundTemplatePostCount + post.links.templatePageInboundUrls.length;
    post.links.orphanCandidateExcludingCategoryAndSitemap =
      post.links.inboundExplicitPostCount + post.links.inboundTemplatePostCount === 0;
    post.links.lowInboundCandidateExcludingCategoryAndSitemap =
      post.links.inboundExplicitPostCount + post.links.inboundTemplatePostCount <= 1;
    post.links.templateOutboundPostCount = post.links.templateOutboundPostUrls.length;
    post.links.templateOutboundToolCount = post.links.templateOutboundToolUrls.length;

    if (post.links.orphanCandidateExcludingCategoryAndSitemap) post.flags.push("POST_GRAPH_ORPHAN_CANDIDATE");
    if (post.links.lowInboundCandidateExcludingCategoryAndSitemap) post.flags.push("LOW_POST_GRAPH_INBOUND");
    if (post.links.explicitOutboundInternalCount < 2) post.flags.push("LOW_EXPLICIT_OUTBOUND_INTERNAL");
  }

  const duplicates = {
    title: buildDuplicateGroups(posts, "title"),
    description: buildDuplicateGroups(posts, "description"),
  };
  for (const group of duplicates.title) {
    for (const id of group.ids) postById.get(id)?.flags.push("DUPLICATE_TITLE_CANDIDATE");
  }
  for (const group of duplicates.description) {
    for (const id of group.ids) postById.get(id)?.flags.push("DUPLICATE_DESCRIPTION_CANDIDATE");
  }

  const similarDocuments = buildSimilarTitleCandidates(posts);
  const tags = buildTagSummary(posts);
  const sitemapItems = posts
    .map((post) => ({
      id: post.id,
      flags: post.flags.filter((flag) => /SITEMAP|NOINDEX_IN_SITEMAP|CANONICAL/.test(flag)),
    }))
    .filter((item) => item.flags.length);
  const sitemapAnomalies = {
    summary: {
      indexableMissingMainSitemap: posts.filter((post) => post.flags.includes("INDEXABLE_MISSING_MAIN_SITEMAP")).length,
      indexableMissingKoSitemap: posts.filter((post) => post.flags.includes("INDEXABLE_MISSING_KO_SITEMAP")).length,
      noindexInSitemap: posts.filter((post) => post.flags.includes("NOINDEX_IN_SITEMAP")).length,
      sitemapHreflangSelfMissing: posts.filter((post) => post.seo.sitemapMain && !post.seo.sitemapHreflangSelf).length,
    },
    items: sitemapItems,
  };

  const categoryCounts = {};
  for (const post of posts) categoryCounts[post.categorySlug] = (categoryCounts[post.categorySlug] || 0) + 1;

  const summary = {
    finalVerdict: sitemapItems.length ? "INVENTORY_COMPLETE_WITH_GAPS" : "INVENTORY_COMPLETE",
    totalPosts: posts.length,
    categoryCounts,
    indexableCount: posts.filter((post) => post.seo.indexable).length,
    noindexCount: posts.filter((post) => post.seo.noindex).length,
    canonicalAnomalyCount: posts.filter((post) => post.flags.some((flag) => /CANONICAL/.test(flag))).length,
    sitemapAnomalyCount: sitemapItems.length,
    orphanCandidateCount: posts.filter((post) => post.links.orphanCandidateExcludingCategoryAndSitemap).length,
    lowInboundCandidateCount: posts.filter((post) => post.links.lowInboundCandidateExcludingCategoryAndSitemap).length,
    postsWithFaq: posts.filter((post) => post.structure.faqPresent).length,
    postsWithoutFaq: posts.filter((post) => !post.structure.faqPresent).length,
    templateArticleCount: posts.length,
    manualArticleLikeCount: posts.filter((post) => post.jsonLd.manualArticleLike).length,
    manualFaqJsonLdCount: posts.filter((post) => post.jsonLd.manualFaqPage).length,
    imageAltAnomalyCount: posts.filter((post) => post.structure.imageAltMissingCount > 0).length,
    medians: {
      h2Count: median(posts.map((post) => post.structure.h2Count)),
      explicitOutboundInternal: median(posts.map((post) => post.links.explicitOutboundInternalCount)),
      explicitInboundPost: median(posts.map((post) => post.links.inboundExplicitPostCount)),
      postGraphInbound: median(posts.map((post) => post.links.inboundExplicitPostCount + post.links.inboundTemplatePostCount)),
    },
    flagCounts: summarizeFlags(posts),
  };

  const output = {
    generatedAt: new Date().toISOString(),
    scope: {
      language: "ko",
      categories: KO_CATEGORY_DIRS,
      auditOnly: true,
      source: "repository_static_inventory",
      networkUsed: false,
    },
    summary,
    posts,
    tags,
    duplicates,
    similarDocuments,
    sitemapAnomalies,
    limitations: [
      "No Naver Search, Naver Search Advisor, GSC, Bing, or external SEO API data was used.",
      "Rendered canonical/hreflang/schema signals are inferred from shared source components.",
      "Template related-post links are reproduced from visible local scoring logic.",
      "No query/intent assignment or final cannibalization decision is made in Step 1.",
    ],
  };

  ensureDir(REPORT_JSON);
  fs.writeFileSync(REPORT_JSON, JSON.stringify(output, null, 2), "utf8");
  fs.writeFileSync(REPORT_MD, buildReport(output), "utf8");

  console.log("PASS audit_naver_ko_post_search_inventory");
  console.log(`- KO posts: ${summary.totalPosts}`);
  console.log(`- Report: ${rel(REPORT_MD)}`);
  console.log(`- JSON: ${rel(REPORT_JSON)}`);
  console.log(`- Final Verdict: ${summary.finalVerdict}`);
}

main();
