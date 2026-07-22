#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const matter = require("gray-matter");

const SITE_URL = "https://www.finmaphub.com";
const OUT_CSV = path.join("reports", "search-growth-90d-url-inventory.csv");
const OUT_JSON = path.join("reports", "search-growth-90d-audit-data.json");

const CATEGORY_LABELS = {
  economicInfo: { ko: "경제정보", en: "Economic Info" },
  personalFinance: { ko: "재테크", en: "Personal Finance" },
  investingInfo: { ko: "투자정보", en: "Investing Info" },
};

const TOOL_FILES = [
  "compound-interest",
  "goal-simulator",
  "fire-calculator",
  "cagr-calculator",
  "dca-calculator",
  "dsr-ltv-calculator",
  "home-buying-budget-calculator",
  "mortgage-loan-calculator",
];

const IMPORTANT_MARKET_ROUTES = [
  { route: "/market", file: "pages/market/index.js", role: "PRIMARY_HUB" },
  { route: "/market/indices", file: "pages/market/indices.js", role: "DATA_PAGE" },
  { route: "/market/real-estate", file: "pages/market/real-estate.js", role: "PRIMARY_HUB" },
  { route: "/market/real-estate/seoul-top100", file: "pages/market/real-estate/seoul-top100.js", role: "DATA_PAGE" },
  { route: "/market/real-estate/magok-top100", file: "pages/market/real-estate/magok-top100.js", role: "DATA_PAGE" },
  { route: "/market/real-estate/gangnam3-top100", file: "pages/market/real-estate/gangnam3-top100.js", role: "DATA_PAGE" },
  { route: "/market/real-estate/gangnam-top100", file: "pages/market/real-estate/gangnam-top100.js", role: "DATA_PAGE" },
  { route: "/market/real-estate/songpa-top100", file: "pages/market/real-estate/songpa-top100.js", role: "DATA_PAGE" },
  { route: "/market/real-estate/mayongseong-top100", file: "pages/market/real-estate/mayongseong-top100.js", role: "DATA_PAGE" },
  { route: "/market/real-estate/seoul-apartment-top100", file: "pages/market/real-estate/seoul-apartment-top100.js", role: "DATA_PAGE" },
  { route: "/market/real-estate/gyeonggi-apartment-top100", file: "pages/market/real-estate/gyeonggi-apartment-top100.js", role: "DATA_PAGE" },
  { route: "/market/real-estate/incheon-apartment-top100", file: "pages/market/real-estate/incheon-apartment-top100.js", role: "DATA_PAGE" },
];

const SEARCH_INTENT_GROUPS = [
  {
    id: "real-estate-loan",
    label: "아파트 구매·DSR·LTV·주담대",
    patterns: [
      /dsr/i,
      /ltv/i,
      /mortgage/i,
      /loan/i,
      /home[-\s]?buy/i,
      /apartment/i,
      /cash[-\s]?100m/i,
      /interest[-\s]?rate/i,
      /주담대/,
      /대출/,
      /아파트/,
      /구매/,
      /보유 ?현금/,
      /금리/,
    ],
  },
  {
    id: "compound-goal",
    label: "복리·목표자산·월 투자금",
    patterns: [
      /compound/i,
      /goal/i,
      /100m/i,
      /monthly[-\s]?invest/i,
      /how[-\s]?much/i,
      /복리/,
      /목표/,
      /1억/,
      /월 ?투자/,
      /월 ?납입/,
    ],
  },
  {
    id: "dca-cagr",
    label: "DCA·CAGR·적립식 투자",
    patterns: [/dca/i, /cagr/i, /lump/i, /return/i, /적립식/, /수익률/, /CAGR/],
  },
  {
    id: "real-estate-data",
    label: "부동산 실거래·Top100",
    patterns: [/real[-\s]?estate/i, /top100/i, /transaction/i, /seoul/i, /magok/i, /gangnam/i, /실거래/, /시세/, /Top100/],
  },
  {
    id: "fire-retirement",
    label: "FIRE·은퇴자금",
    patterns: [/fire/i, /retire/i, /withdraw/i, /은퇴/, /FIRE/],
  },
  {
    id: "macro-market",
    label: "경제지표·시장 데이터",
    patterns: [/inflation/i, /fx/i, /kospi/i, /tnx/i, /dxy/i, /oil/i, /경제/, /금리/, /환율/, /인플레이션/],
  },
];

const RISK_TEXTS = [
  { id: "views", pattern: /조회수|Views/i },
  { id: "comments", pattern: /댓글|Comments/i },
  { id: "empty_comments", pattern: /아직 댓글이 없습니다|No comments yet/i },
  { id: "share_buttons", pattern: /공유하기|Share|Facebook|Twitter|X\(Twitter\)/i },
  { id: "loading", pattern: /로딩|Loading/i },
  { id: "empty_result", pattern: /결과가 없습니다|No results|Result area was not found|missing_target/i },
  { id: "ad_copy", pattern: /광고|Advertisement|AdSense/i },
];

const OVERCONFIDENT_PATTERNS = [
  /정확한|확정|반드시|무조건|보장|최대 한도 보장|실제 가능 금액|guarantee|guaranteed|exact/i,
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function rel(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, "/");
}

function stripMd(md) {
  return String(md || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+]\([^)]+\)/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCategory(raw, filePath) {
  const normalized = String(raw || "").trim();
  if (CATEGORY_LABELS[normalized]) return normalized;
  const parts = rel(filePath).split("/");
  const idx = parts.indexOf("posts");
  if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  if (/personal/i.test(normalized) || /재테크/.test(normalized)) return "personalFinance";
  if (/invest/i.test(normalized) || /투자/.test(normalized)) return "investingInfo";
  if (/economic/i.test(normalized) || /경제/.test(normalized)) return "economicInfo";
  return normalized || "unknown";
}

function localePath(pathname, locale) {
  if (locale === "en") {
    if (pathname === "/") return "/en";
    if (pathname.startsWith("/en/") || pathname === "/en") return pathname;
    return `/en${pathname}`;
  }
  if (pathname === "/en") return "/";
  return pathname.replace(/^\/en(?=\/|$)/, "") || "/";
}

function normalizeInternalHref(href, sourceLocale) {
  if (!href) return null;
  const raw = String(href).trim();
  if (
    !raw ||
    raw.startsWith("#") ||
    raw.startsWith("mailto:") ||
    raw.startsWith("tel:") ||
    raw.startsWith("javascript:")
  ) {
    return null;
  }

  let pathname = raw;
  try {
    if (/^https?:\/\//i.test(raw)) {
      const parsed = new URL(raw);
      if (parsed.origin !== SITE_URL) return null;
      pathname = parsed.pathname;
    }
  } catch {
    return null;
  }

  if (!pathname.startsWith("/")) return null;
  pathname = pathname.split("?")[0].split("#")[0].replace(/\/{2,}/g, "/");
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);

  if (sourceLocale === "en" && !pathname.startsWith("/en") && !pathname.startsWith("/api/")) {
    pathname = localePath(pathname, "en");
  }

  return pathname || "/";
}

function extractMarkdownLinks(md, sourceLocale) {
  const links = [];
  let match;
  const htmlRe = /<a\s+[^>]*href=["']([^"']+)["']/gi;
  while ((match = htmlRe.exec(md))) {
    const href = normalizeInternalHref(match[1], sourceLocale);
    if (href) links.push(href);
  }

  const mdRe = /(?<!!)\[[^\]]+]\(([^)]+)\)/g;
  while ((match = mdRe.exec(md))) {
    const href = normalizeInternalHref(match[1], sourceLocale);
    if (href) links.push(href);
  }

  return Array.from(new Set(links));
}

function extractJsLinks(source, sourceLocale) {
  const links = [];
  const patterns = [
    /\bhref\s*=\s*["'](\/[^"']+)["']/g,
    /\bhref\s*:\s*["'](\/[^"']+)["']/g,
    /\brankingHref\s*:\s*["'](\/[^"']+)["']/g,
    /\bpath\s*:\s*["'](\/[^"']+)["']/g,
    /\bchecklistHref\s*:\s*["'](\/[^"']+)["']/g,
  ];

  for (const re of patterns) {
    let match;
    while ((match = re.exec(source))) {
      const href = normalizeInternalHref(match[1], sourceLocale);
      if (href) links.push(href);
    }
  }

  return Array.from(new Set(links));
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows) {
  const columns = [
    "url",
    "locale",
    "content_type",
    "category",
    "role",
    "title",
    "title_length",
    "description_length",
    "h1",
    "inbound_internal_links",
    "outbound_internal_links",
      "snippet_risk",
      "overlap_group",
      "overlap_group_confidence",
      "overlap_group_source",
      "manual_review_required",
      "title_source",
      "description_source",
      "priority",
      "recommended_action",
      "source_file",
  ];
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((col) => csvEscape(row[col])).join(",")),
  ].join("\n");
}

function getPostUrl(data, category, slug, lang) {
  const link = String(data.link || "").trim();
  if (link.startsWith("/")) return localePath(link.replace(/^\/en(?=\/|$)/, ""), lang);
  const base = lang === "en" ? "/en/posts" : "/posts";
  return `${base}/${category}/${slug}`;
}

function getFirstMarkdownHeading(md) {
  const match = String(md || "").match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

function getFirstParagraph(md) {
  const body = String(md || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .split(/\n{2,}/)
    .map((part) => stripMd(part))
    .find((part) => part && !part.startsWith("- ") && !part.startsWith("|"));
  return body || "";
}

function classifyOverlap(text) {
  const haystack = String(text || "");
  const matches = [];
  for (const group of SEARCH_INTENT_GROUPS) {
    if (group.patterns.some((pattern) => pattern.test(haystack))) matches.push(group.id);
  }
  return matches[0] || "general";
}

function scoreIntentClarity(entry) {
  const text = `${entry.url} ${entry.title} ${entry.description} ${entry.h1}`;
  if (entry.content_type === "tool") return 5;
  if (/dsr|ltv|mortgage|home-buying|apartment|compound|dca|cagr|goal|100m/i.test(text)) return 4;
  if (entry.overlap_group !== "general") return 3;
  return 2;
}

function scoreBusinessValue(entry) {
  if (entry.overlap_group === "real-estate-loan") return 5;
  if (entry.content_type === "tool") return 5;
  if (entry.overlap_group === "compound-goal") return 4;
  if (entry.overlap_group === "dca-cagr") return 4;
  if (entry.overlap_group === "real-estate-data") return 4;
  return 2;
}

function scoreExistingAuthority(inbound) {
  if (inbound >= 12) return 5;
  if (inbound >= 7) return 4;
  if (inbound >= 3) return 3;
  if (inbound >= 1) return 2;
  return 1;
}

function scoreImprovementPotential(entry, duplicateTitleCount, duplicateDescCount) {
  let score = 1;
  if (entry.title_length > 55 || entry.description_length > 145) score += 1;
  if (entry.title === entry.h1) score += 1;
  if (duplicateTitleCount > 1 || duplicateDescCount > 1) score += 1;
  if (entry.snippet_risk !== "none") score += 1;
  return Math.min(5, score);
}

function scoreCannibalization(entry, groupCounts) {
  const count = groupCounts[entry.overlap_group] || 0;
  if (count >= 16) return 5;
  if (count >= 10) return 4;
  if (count >= 5) return 3;
  if (count >= 2) return 2;
  return 1;
}

function scoreInternalLinkGap(inbound) {
  if (inbound === 0) return 5;
  if (inbound === 1) return 4;
  if (inbound <= 3) return 3;
  if (inbound <= 6) return 2;
  return 1;
}

function scoreConversion(entry) {
  if (entry.content_type === "tool") return 5;
  if (entry.overlap_group === "real-estate-loan") return 5;
  if (entry.overlap_group === "compound-goal" || entry.overlap_group === "dca-cagr") return 4;
  if (entry.overlap_group === "real-estate-data") return 4;
  return 2;
}

function extractLocaleValue(source, locale, key) {
  const start = source.indexOf(`${locale}:`);
  if (start === -1) return "";
  const other = locale === "ko" ? "en:" : "ko:";
  const next = source.indexOf(other, start + 1);
  const block = source.slice(start, next === -1 ? source.length : next);
  const re = new RegExp(`${key}\\s*:\\s*(["'\`])([\\s\\S]*?)\\1`);
  const match = block.match(re);
  return match ? match[2].replace(/\s+/g, " ").trim() : "";
}

function extractSeoHeadValue(source, prop) {
  const re = new RegExp(`${prop}\\s*=\\s*{?\\s*(["'\`])([\\s\\S]*?)\\1\\s*}?`);
  const match = source.match(re);
  return match ? match[2].replace(/\s+/g, " ").trim() : "";
}

function extractConditionalLocaleValue(source, locale, key) {
  const patterns = [
    new RegExp(`${key}\\s*:\\s*(?:\\n\\s*)?locale\\s*===\\s*(["'])ko\\1\\s*\\?\\s*(["'\`])([\\s\\S]*?)\\2\\s*:\\s*(["'\`])([\\s\\S]*?)\\4`),
    new RegExp(`${key}\\s*:\\s*(?:\\n\\s*)?lang\\s*===\\s*(["'])ko\\1\\s*\\?\\s*(["'\`])([\\s\\S]*?)\\2\\s*:\\s*(["'\`])([\\s\\S]*?)\\4`),
    new RegExp(`${key}\\s*:\\s*(?:\\n\\s*)?router\\.locale\\s*===\\s*(["'])en\\1\\s*\\?\\s*(["'\`])([\\s\\S]*?)\\2\\s*:\\s*(["'\`])([\\s\\S]*?)\\4`),
  ];

  for (const re of patterns) {
    const match = source.match(re);
    if (!match) continue;
    if (re.source.includes("router\\.locale")) {
      return (locale === "en" ? match[3] : match[5]).replace(/\s+/g, " ").trim();
    }
    return (locale === "ko" ? match[3] : match[5]).replace(/\s+/g, " ").trim();
  }

  return "";
}

function extractJsxConditionalText(source, locale, tagName) {
  const re = new RegExp(`<${tagName}\\b[\\s\\S]*?{\\s*(?:locale|lang)\\s*===\\s*(["'])ko\\1\\s*\\?\\s*(["'\`])([\\s\\S]*?)\\2\\s*:\\s*(["'\`])([\\s\\S]*?)\\4\\s*}[\\s\\S]*?<\\/${tagName}>`);
  const match = source.match(re);
  return match ? (locale === "ko" ? match[3] : match[5]).replace(/\s+/g, " ").trim() : "";
}

function firstMetaCandidate(candidates) {
  for (const candidate of candidates) {
    const value = String(candidate.value || "").replace(/\s+/g, " ").trim();
    if (value) return { value, source: candidate.source };
  }
  return { value: "", source: "META_EXTRACTION_FAILED" };
}

function classifyOverlapAudit(fields) {
  const primaryText = [
    fields.url,
    fields.slug,
    fields.title,
    fields.h1,
    fields.description,
  ].filter(Boolean).join(" ");
  const primaryGroup = classifyOverlap(primaryText);
  if (primaryGroup !== "general") {
    return {
      group: primaryGroup,
      confidence: "high",
      source: "url_slug_title_h1_description",
      manual_review_required: false,
    };
  }

  const secondaryText = Array.isArray(fields.tags) ? fields.tags.join(" ") : "";
  const secondaryGroup = classifyOverlap(secondaryText);
  if (secondaryGroup !== "general") {
    return {
      group: secondaryGroup,
      confidence: "medium",
      source: "tags_only",
      manual_review_required: true,
    };
  }

  return {
    group: "general",
    confidence: "low",
    source: "no_primary_overlap_signal",
    manual_review_required: true,
  };
}

function collectPosts() {
  const files = glob.sync("content/posts/**/{ko,en}/*.md", { nodir: true });
  return files.map((file) => {
    const source = readText(file);
    const parsed = matter(source);
    const data = parsed.data || {};
    const slug = String(data.slug || path.basename(file, ".md"));
    const locale = String(data.lang || (file.includes("/en/") || file.includes("\\en\\") ? "en" : "ko"));
    const category = normalizeCategory(data.postCategory || data.category, file);
    const title = String(data.seoTitle || data.title || "").trim();
    const description = String(data.seoDescription || data.description || "").trim();
    const h1 = title || getFirstMarkdownHeading(parsed.content);
    const url = getPostUrl(data, category, slug, locale);
    const firstParagraph = getFirstParagraph(parsed.content);
    const links = extractMarkdownLinks(parsed.content, locale);
    const overlapAudit = classifyOverlapAudit({
      url,
      slug,
      title,
      description,
      h1,
      tags: data.tags || [],
    });
    const overlap = overlapAudit.group;
    const role =
      locale === "en"
        ? "EN_MAINTENANCE_ONLY"
        : overlap === "real-estate-loan" || overlap === "compound-goal" || overlap === "dca-cagr"
          ? "SUPPORTING_ARTICLE"
          : "LOW_PRIORITY";
    return {
      url,
      locale,
      content_type: "post",
      category,
      role,
      title,
      description,
      h1,
      source_file: rel(file),
      first_paragraph: firstParagraph,
      links,
      overlap_group: overlap,
      overlap_group_confidence: overlapAudit.confidence,
      overlap_group_source: overlapAudit.source,
      manual_review_required: overlapAudit.manual_review_required,
      title_source: data.seoTitle ? "frontmatter.seoTitle" : data.title ? "frontmatter.title" : "META_EXTRACTION_FAILED",
      description_source: data.seoDescription
        ? "frontmatter.seoDescription"
        : data.description
          ? "frontmatter.description"
          : "META_EXTRACTION_FAILED",
      source_text: parsed.content,
    };
  });
}

function collectTools() {
  const entries = [];
  for (const slug of TOOL_FILES) {
    const file = path.join("pages", "tools", `${slug}.js`);
    if (!fs.existsSync(file)) continue;
    const source = readText(file);
    for (const locale of ["ko", "en"]) {
      const titleMeta = firstMetaCandidate([
        { source: "locale_object.seoTitle", value: extractLocaleValue(source, locale, "seoTitle") },
        { source: "conditional.title", value: extractConditionalLocaleValue(source, locale, "title") },
        { source: "locale_object.title", value: extractLocaleValue(source, locale, "title") },
        { source: "seo_head_literal.title", value: extractSeoHeadValue(source, "title") },
      ]);
      const descMeta = firstMetaCandidate([
        { source: "locale_object.seoDesc", value: extractLocaleValue(source, locale, "seoDesc") },
        { source: "conditional.desc", value: extractConditionalLocaleValue(source, locale, "desc") },
        { source: "locale_object.desc", value: extractLocaleValue(source, locale, "desc") },
        { source: "seo_head_literal.desc", value: extractSeoHeadValue(source, "desc") },
      ]);
      const h1Meta = firstMetaCandidate([
        { source: "locale_object.h1", value: extractLocaleValue(source, locale, "h1") },
        { source: "jsx_h1_conditional", value: extractJsxConditionalText(source, locale, "h1") },
        { source: "title_fallback", value: titleMeta.value },
      ]);
      const title = titleMeta.value;
      const description = descMeta.value;
      const h1 = h1Meta.value;
      const links = extractJsLinks(source, locale);
      const url = localePath(`/tools/${slug}`, locale);
      const overlapAudit = classifyOverlapAudit({
        url,
        slug,
        title,
        description,
        h1,
      });
      entries.push({
        url,
        locale,
        content_type: "tool",
        category: "tools",
        role: locale === "ko" ? "PRIMARY_TOOL" : "EN_MAINTENANCE_ONLY",
        title,
        description,
        h1,
        source_file: rel(file),
        first_paragraph: extractLocaleValue(source, locale, "lead"),
        links,
        overlap_group: overlapAudit.group,
        overlap_group_confidence: overlapAudit.confidence,
        overlap_group_source: overlapAudit.source,
        manual_review_required: overlapAudit.manual_review_required || !title || !description,
        title_source: titleMeta.source,
        description_source: descMeta.source,
        h1_source: h1Meta.source,
        source_text: source,
      });
    }
  }

  const toolsIndex = path.join("pages", "tools", "index.js");
  if (fs.existsSync(toolsIndex)) {
    const source = readText(toolsIndex);
    entries.push(
      {
        url: "/tools",
        locale: "ko",
        content_type: "tool_hub",
        category: "tools",
        role: "PRIMARY_HUB",
        title: "금융 계산기 모음",
        description: "FinMap 금융 계산기 도구 모음",
        h1: "금융 계산기·도구",
        source_file: rel(toolsIndex),
        first_paragraph: "",
        links: extractJsLinks(source, "ko"),
        overlap_group: "calculator-hub",
        source_text: source,
      },
      {
        url: "/en/tools",
        locale: "en",
        content_type: "tool_hub",
        category: "tools",
        role: "EN_MAINTENANCE_ONLY",
        title: "Finance Tools",
        description: "FinMap finance tools hub",
        h1: "Finance tools",
        source_file: rel(toolsIndex),
        first_paragraph: "",
        links: extractJsLinks(source, "en"),
        overlap_group: "calculator-hub",
        source_text: source,
      }
    );
  }

  return entries;
}

function collectMarketPages() {
  const entries = [];
  for (const item of IMPORTANT_MARKET_ROUTES) {
    if (!fs.existsSync(item.file)) continue;
    const source = readText(item.file);
    for (const locale of ["ko", "en"]) {
      const route = localePath(item.route, locale);
      const titleMeta = firstMetaCandidate([
        { source: "locale_object.seoTitle", value: extractLocaleValue(source, locale, "seoTitle") },
        { source: "conditional.title", value: extractConditionalLocaleValue(source, locale, "title") },
        { source: "locale_object.title", value: extractLocaleValue(source, locale, "title") },
        { source: "seo_head_literal.title", value: extractSeoHeadValue(source, "title") },
      ]);
      const descMeta = firstMetaCandidate([
        { source: "locale_object.seoDesc", value: extractLocaleValue(source, locale, "seoDesc") },
        { source: "conditional.description", value: extractConditionalLocaleValue(source, locale, "description") },
        { source: "locale_object.description", value: extractLocaleValue(source, locale, "description") },
        { source: "seo_head_literal.desc", value: extractSeoHeadValue(source, "desc") },
      ]);
      const h1Meta = firstMetaCandidate([
        { source: "locale_object.h1", value: extractLocaleValue(source, locale, "h1") },
        { source: "jsx_h1_conditional", value: extractJsxConditionalText(source, locale, "h1") },
        { source: "title_fallback", value: titleMeta.value },
      ]);
      const title = titleMeta.value;
      const description = descMeta.value;
      const h1 = h1Meta.value;
      const overlapAudit = classifyOverlapAudit({
        url: route,
        slug: path.basename(item.file, ".js"),
        title,
        description,
        h1,
      });
      entries.push({
        url: route,
        locale,
        content_type: "market",
        category: "realEstate",
        role: locale === "ko" ? item.role : "EN_MAINTENANCE_ONLY",
        title,
        description,
        h1,
        source_file: rel(item.file),
        first_paragraph: extractLocaleValue(source, locale, "intro") || extractLocaleValue(source, locale, "lead"),
        links: extractJsLinks(source, locale),
        overlap_group: overlapAudit.group,
        overlap_group_confidence: overlapAudit.confidence,
        overlap_group_source: overlapAudit.source,
        manual_review_required: overlapAudit.manual_review_required || !title || !description,
        title_source: titleMeta.source,
        description_source: descMeta.source,
        h1_source: h1Meta.source,
        source_text: source,
      });
    }
  }
  return entries;
}

function inspectSnippetRisks(entry, templateRisks) {
  const risks = [];
  const text = `${entry.source_text || ""}\n${entry.title}\n${entry.description}\n${entry.h1}`;
  for (const risk of RISK_TEXTS) {
    if (risk.pattern.test(text)) risks.push(risk.id);
  }
  if (entry.content_type === "post") risks.push(...templateRisks.post);
  if (entry.content_type === "tool") {
    if (/result|결과|Result/i.test(text) && /useState\(|initial|초기|placeholder/i.test(text)) {
      risks.push("tool_initial_result_copy_review");
    }
  }
  return Array.from(new Set(risks));
}

function getTextSafetyIssues(entries) {
  const issues = [];
  for (const entry of entries) {
    const haystack = `${entry.title}\n${entry.description}\n${entry.h1}\n${entry.first_paragraph || ""}`;
    for (const pattern of OVERCONFIDENT_PATTERNS) {
      if (pattern.test(haystack)) {
        issues.push({
          url: entry.url,
          source_file: entry.source_file,
          pattern: pattern.toString(),
          sample: haystack.split(/\n/).find((line) => pattern.test(line)) || "",
        });
        break;
      }
    }
  }
  return issues;
}

function inspectTemplates() {
  const postTemplate = fs.existsSync("pages/posts/[category]/[slug].js")
    ? readText("pages/posts/[category]/[slug].js")
    : "";
  const postRisks = [];
  const viewsPresent = /views\.toLocaleString\(\)|Number\(views\)|Views|조회수/.test(postTemplate);
  const commentsPresent = /comments\.length === 0|No comments yet|아직 댓글/.test(postTemplate);
  const sharePresent = /Facebook|Twitter|공유/.test(postTemplate);
  const viewsProtected =
    /data-snippet-region=["']post-views["'][\s\S]*?data-nosnippet|data-nosnippet[\s\S]*?data-snippet-region=["']post-views["']/.test(postTemplate);
  const commentsProtected =
    /data-snippet-region=["']post-comments["'][\s\S]*?data-nosnippet|data-nosnippet[\s\S]*?data-snippet-region=["']post-comments["']/.test(postTemplate);
  const shareProtected =
    /data-snippet-region=["']post-share["'][\s\S]*?data-nosnippet|data-nosnippet[\s\S]*?data-snippet-region=["']post-share["']/.test(postTemplate);

  if (viewsPresent) {
    postRisks.push(viewsProtected ? "post_template_view_count_protected_by_data_nosnippet" : "post_template_view_count_review");
  }
  if (commentsPresent) {
    postRisks.push(commentsProtected ? "post_template_empty_comments_protected_by_data_nosnippet" : "post_template_empty_comments_review");
  }
  if (sharePresent) {
    postRisks.push(shareProtected ? "post_template_share_buttons_protected_by_data_nosnippet" : "post_template_share_buttons_review");
  }
  return {
    post: postRisks,
    templateFiles: {
      post: "pages/posts/[category]/[slug].js",
    },
  };
}

function inspectGa4Events() {
  const files = glob.sync("{pages,_components,utils,content}/**/*.{js,jsx,md,mdx}", { nodir: true });
  const eventMap = new Map();
  const trackRe = /trackGaEvent\(\s*["']([^"']+)["']/g;
  const dataRe = /data-ga-event=["']([^"']+)["']/g;
  const gtagRe = /gtag\(\s*["']event["']\s*,\s*["']([^"']+)["']/g;

  for (const file of files) {
    const source = readText(file);
    for (const re of [trackRe, dataRe, gtagRe]) {
      let match;
      while ((match = re.exec(source))) {
        const name = match[1];
        if (!eventMap.has(name)) eventMap.set(name, { event: name, count: 0, files: new Set() });
        const item = eventMap.get(name);
        item.count += 1;
        item.files.add(rel(file));
      }
    }
  }

  return Array.from(eventMap.values())
    .map((item) => ({ ...item, files: Array.from(item.files).sort() }))
    .sort((a, b) => a.event.localeCompare(b.event));
}

function buildGraph(entries) {
  const byUrl = new Map(entries.map((entry) => [entry.url, entry]));
  const inbound = new Map(entries.map((entry) => [entry.url, new Set()]));
  for (const entry of entries) {
    const normalizedLinks = Array.from(new Set((entry.links || []).filter(Boolean)));
    entry.links = normalizedLinks;
    for (const target of normalizedLinks) {
      if (byUrl.has(target)) inbound.get(target).add(entry.url);
    }
  }
  for (const entry of entries) {
    entry.inboundSources = Array.from(inbound.get(entry.url) || []).sort();
    entry.inbound_internal_links = entry.inboundSources.length;
    entry.outbound_internal_links = entry.links.length;
  }
}

function enrichEntries(entries) {
  const titleCounts = {};
  const descCounts = {};
  const groupCounts = {};
  for (const entry of entries) {
    titleCounts[entry.title] = (titleCounts[entry.title] || 0) + 1;
    descCounts[entry.description] = (descCounts[entry.description] || 0) + 1;
    groupCounts[entry.overlap_group] = (groupCounts[entry.overlap_group] || 0) + 1;
  }

  const templateRisks = inspectTemplates();
  for (const entry of entries) {
    entry.overlap_group_confidence =
      entry.overlap_group_confidence || (entry.overlap_group === "general" ? "low" : "manual");
    entry.overlap_group_source = entry.overlap_group_source || "manual_or_static_route";
    entry.manual_review_required = Boolean(entry.manual_review_required);
    entry.title_source = entry.title_source || (entry.title ? "static" : "META_EXTRACTION_FAILED");
    entry.description_source = entry.description_source || (entry.description ? "static" : "META_EXTRACTION_FAILED");
    entry.h1_source = entry.h1_source || (entry.h1 ? "static" : "META_EXTRACTION_FAILED");
    const risks = inspectSnippetRisks(entry, templateRisks);
    entry.snippet_risk = risks.length ? risks.join("|") : "none";
    entry.title_length = [...String(entry.title || "")].length;
    entry.description_length = [...String(entry.description || "")].length;
    entry.title_h1_same = entry.title && entry.h1 && entry.title === entry.h1;
    entry.duplicate_title_count = titleCounts[entry.title] || 0;
    entry.duplicate_description_count = descCounts[entry.description] || 0;
    entry.scores = {
      search_intent_clarity: scoreIntentClarity(entry),
      business_value: scoreBusinessValue(entry),
      existing_authority: scoreExistingAuthority(entry.inbound_internal_links),
      improvement_potential: scoreImprovementPotential(
        entry,
        entry.duplicate_title_count,
        entry.duplicate_description_count
      ),
      cannibalization_risk: scoreCannibalization(entry, groupCounts),
      internal_link_gap: scoreInternalLinkGap(entry.inbound_internal_links),
      conversion_potential: scoreConversion(entry),
    };
    entry.priority_score = Object.values(entry.scores).reduce((sum, value) => sum + value, 0);
    entry.priority =
      entry.priority_score >= 29 ? "P0" : entry.priority_score >= 24 ? "P1" : entry.priority_score >= 18 ? "P2" : "P3";
    entry.recommended_action = recommendAction(entry);
  }
}

function hasOpenSnippetRisk(entry) {
  return String(entry.snippet_risk || "none")
    .split("|")
    .filter(Boolean)
    .some((risk) => risk !== "none" && !/protected_by_data_nosnippet|not_rendered/i.test(risk));
}

function recommendAction(entry) {
  if (hasOpenSnippetRisk(entry)) return "P0-2 snippet hygiene review";
  if (entry.content_type === "tool" && entry.locale === "ko") return "P1-1 meta/H1 and first-screen intent refinement";
  if (entry.overlap_group === "real-estate-loan") return "P1-2 internal CTA/link structure review";
  if (entry.duplicate_title_count > 1 || entry.duplicate_description_count > 1) return "P1-3 intent split or consolidation review";
  if (entry.inbound_internal_links <= 1) return "P1-2 add contextual internal links";
  return "Monitor or low-priority editorial refresh";
}

function summarize(entries, ga4Events) {
  const byType = {};
  const byLocale = {};
  const byGroup = {};
  const snippetRisks = {};
  const duplicates = {
    titles: [],
    descriptions: [],
  };

  for (const entry of entries) {
    byType[entry.content_type] = (byType[entry.content_type] || 0) + 1;
    byLocale[entry.locale] = (byLocale[entry.locale] || 0) + 1;
    byGroup[entry.overlap_group] = (byGroup[entry.overlap_group] || 0) + 1;
    for (const risk of String(entry.snippet_risk || "none").split("|")) {
      if (!risk || risk === "none") continue;
      snippetRisks[risk] = (snippetRisks[risk] || 0) + 1;
    }
  }

  const titleMap = new Map();
  const descMap = new Map();
  for (const entry of entries) {
    if (entry.title) {
      if (!titleMap.has(entry.title)) titleMap.set(entry.title, []);
      titleMap.get(entry.title).push(entry.url);
    }
    if (entry.description) {
      if (!descMap.has(entry.description)) descMap.set(entry.description, []);
      descMap.get(entry.description).push(entry.url);
    }
  }

  for (const [title, urls] of titleMap) {
    if (urls.length > 1) duplicates.titles.push({ title, urls });
  }
  for (const [description, urls] of descMap) {
    if (urls.length > 1) duplicates.descriptions.push({ description, urls });
  }

  const isolated = entries
    .filter((entry) => entry.inbound_internal_links === 0)
    .map((entry) => entry.url)
    .sort();
  const oneInbound = entries
    .filter((entry) => entry.inbound_internal_links === 1)
    .map((entry) => entry.url)
    .sort();

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      urls: entries.length,
      byType,
      byLocale,
      byGroup,
    },
    snippetRisks,
    duplicates,
    isolated,
    oneInbound,
    textSafetyIssues: getTextSafetyIssues(entries),
    ga4Events,
    topPriority: entries
      .filter((entry) => entry.locale === "ko")
      .sort((a, b) => b.priority_score - a.priority_score || a.url.localeCompare(b.url))
      .slice(0, 20)
      .map((entry) => ({
        url: entry.url,
        role: entry.role,
        overlap_group: entry.overlap_group,
        overlap_group_confidence: entry.overlap_group_confidence,
        overlap_group_source: entry.overlap_group_source,
        manual_review_required: entry.manual_review_required,
        priority: entry.priority,
        priority_score: entry.priority_score,
        scores: entry.scores,
        title: entry.title,
        h1: entry.h1,
        description: entry.description,
        inbound_internal_links: entry.inbound_internal_links,
        outbound_internal_links: entry.outbound_internal_links,
        snippet_risk: entry.snippet_risk,
        recommended_action: entry.recommended_action,
        source_file: entry.source_file,
      })),
  };
}

function main() {
  const entries = [
    ...collectPosts(),
    ...collectTools(),
    ...collectMarketPages(),
  ];

  buildGraph(entries);
  const ga4Events = inspectGa4Events();
  enrichEntries(entries);
  const summary = summarize(entries, ga4Events);

  const csvRows = entries
    .sort((a, b) => a.url.localeCompare(b.url))
    .map((entry) => ({
      url: entry.url,
      locale: entry.locale,
      content_type: entry.content_type,
      category: entry.category,
      role: entry.role,
      title: entry.title,
      title_length: entry.title_length,
      description_length: entry.description_length,
      h1: entry.h1,
      inbound_internal_links: entry.inbound_internal_links,
      outbound_internal_links: entry.outbound_internal_links,
      snippet_risk: entry.snippet_risk,
      overlap_group: entry.overlap_group,
      overlap_group_confidence: entry.overlap_group_confidence,
      overlap_group_source: entry.overlap_group_source,
      manual_review_required: entry.manual_review_required,
      title_source: entry.title_source,
      description_source: entry.description_source,
      priority: entry.priority,
      recommended_action: entry.recommended_action,
      source_file: entry.source_file,
    }));

  ensureDir(OUT_CSV);
  fs.writeFileSync(OUT_CSV, `${toCsv(csvRows)}\n`, "utf8");
  ensureDir(OUT_JSON);
  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify(
      {
        summary,
        entries: entries.map((entry) => ({
          url: entry.url,
          locale: entry.locale,
          content_type: entry.content_type,
          category: entry.category,
          role: entry.role,
          title: entry.title,
          description: entry.description,
          h1: entry.h1,
          title_length: entry.title_length,
          description_length: entry.description_length,
          title_h1_same: entry.title_h1_same,
          duplicate_title_count: entry.duplicate_title_count,
          duplicate_description_count: entry.duplicate_description_count,
          inbound_internal_links: entry.inbound_internal_links,
          outbound_internal_links: entry.outbound_internal_links,
          inboundSources: entry.inboundSources,
          links: entry.links,
          snippet_risk: entry.snippet_risk,
          overlap_group: entry.overlap_group,
          overlap_group_confidence: entry.overlap_group_confidence,
          overlap_group_source: entry.overlap_group_source,
          manual_review_required: entry.manual_review_required,
          title_source: entry.title_source,
          description_source: entry.description_source,
          h1_source: entry.h1_source,
          priority: entry.priority,
          priority_score: entry.priority_score,
          scores: entry.scores,
          recommended_action: entry.recommended_action,
          first_paragraph: entry.first_paragraph,
          source_file: entry.source_file,
        })),
      },
      null,
      2
    ),
    "utf8"
  );

  console.log("Search growth baseline audit complete.");
  console.log(`URLs: ${entries.length}`);
  console.log(`CSV: ${OUT_CSV}`);
  console.log(`JSON: ${OUT_JSON}`);
  console.log("Top priority URLs:");
  for (const item of summary.topPriority.slice(0, 10)) {
    console.log(`- ${item.priority_score} ${item.priority} ${item.url} :: ${item.recommended_action}`);
  }
}

main();
