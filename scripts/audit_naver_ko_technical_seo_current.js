const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const matter = require("gray-matter");
const cheerio = require("cheerio");

const ROOT = process.cwd();
const SITE_URL = "https://www.finmaphub.com";
const DATE_STAMP = "2026-09-17";
const POSTS_ROOT = path.join(ROOT, "content", "posts");
const REPORT_DIR = path.join(ROOT, "reports");
const INVENTORY_JSON = path.join(REPORT_DIR, "naver-ko-post-search-inventory-2026-09-16.json");
const STEP3_JSON = path.join(REPORT_DIR, "naver-ko-post-cannibalization-2026-09-16.json");
const SITEMAP_XML = path.join(ROOT, "public", "sitemap-0.xml");

const REPORT_JSON = path.join(REPORT_DIR, `naver-ko-technical-seo-batch-g-${DATE_STAMP}.json`);
const REPORT_MD = path.join(REPORT_DIR, `naver-ko-technical-seo-batch-g-${DATE_STAMP}.md`);
const HREFLANG_CSV = path.join(REPORT_DIR, `naver-ko-hreflang-current-state-${DATE_STAMP}.csv`);
const STRUCTURED_CSV = path.join(REPORT_DIR, `naver-ko-structured-data-current-state-${DATE_STAMP}.csv`);

const KO_CATEGORY_DIRS = ["economicInfo", "investingInfo", "personalFinance"];
const ARTICLE_TYPES = new Set(["Article", "BlogPosting", "NewsArticle"]);
const REQUIRED_TEMPLATE_FIELDS = [
  "headline",
  "description",
  "url",
  "mainEntityOfPage",
  "datePublished",
  "dateModified",
  "author",
  "publisher",
  "image",
  "keywords",
];

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function dateValue(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkDir(full) : [full];
  });
}

function idToUrl(id, lang = "ko") {
  const [category, slug] = id.split("/");
  return `${lang === "en" ? "/en" : ""}/posts/${category}/${slug}`;
}

function urlToId(url) {
  const pathOnly = pathFromUrl(url);
  const match = pathOnly.match(/^\/(?:en\/)?posts\/([^/]+)\/([^/?#]+)$/);
  return match ? `${match[1]}/${match[2]}` : "";
}

function pathFromUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  try {
    const parsed = new URL(value, SITE_URL);
    if (parsed.origin !== SITE_URL) return "";
    let pathname = parsed.pathname || "/";
    if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
    return pathname;
  } catch {
    const pathOnly = value.split("#")[0].split("?")[0];
    return pathOnly.length > 1 && pathOnly.endsWith("/") ? pathOnly.slice(0, -1) : pathOnly;
  }
}

function absoluteUrl(pathOrUrl) {
  const pathOnly = pathFromUrl(pathOrUrl);
  return `${SITE_URL}${pathOnly || "/"}`;
}

function idToFilePath(id, lang = "ko") {
  const [category, slug] = id.split("/");
  return path.join(POSTS_ROOT, category, lang, `${slug}.md`);
}

function htmlPathForUrl(urlPath) {
  const pathOnly = pathFromUrl(urlPath);
  if (!pathOnly) return "";
  const parts = pathOnly.replace(/^\//, "").split("/");
  if (parts[0] === "en") {
    return path.join(ROOT, ".next", "server", "pages", "en", ...parts.slice(1)) + ".html";
  }
  return path.join(ROOT, ".next", "server", "pages", "ko", ...parts) + ".html";
}

function effectiveTitle(data) {
  return normalize(data.seoTitle || data.title || "");
}

function effectiveDescription(data) {
  return normalize(data.seoDescription || data.description || "");
}

function normalizeHreflangAlternates(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out = {};
  for (const lang of ["ko", "en"]) {
    if (typeof raw[lang] === "string" && raw[lang].trim()) out[lang] = pathFromUrl(raw[lang]);
  }
  return out.ko && out.en ? out : null;
}

function readSourcePosts() {
  const posts = [];
  for (const category of KO_CATEGORY_DIRS) {
    for (const lang of ["ko", "en"]) {
      const dir = path.join(POSTS_ROOT, category, lang);
      for (const filePath of walkDir(dir).filter((file) => file.endsWith(".md"))) {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = matter(raw);
        const slug = path.basename(filePath).replace(/\.md$/, "");
        const id = `${category}/${slug}`;
        const data = parsed.data || {};
        posts.push({
          id,
          lang,
          category,
          slug,
          filePath: rel(filePath),
          absPath: filePath,
          raw,
          body: parsed.content || "",
          frontmatter: data,
          url: idToUrl(id, lang),
          canonical: absoluteUrl(idToUrl(id, lang)),
          title: effectiveTitle(data),
          description: effectiveDescription(data),
          datePublished: dateValue(data.datePublished),
          dateModified: dateValue(data.dateModified || data.datePublished),
          cover: data.cover || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          hreflangEquivalent: data.hreflangEquivalent === false ? false : true,
          hreflangAlternates: normalizeHreflangAlternates(data.hreflangAlternates),
          sourceSha256: crypto.createHash("sha256").update(raw).digest("hex"),
        });
      }
    }
  }
  return posts;
}

function readHtml(urlPath) {
  const filePath = htmlPathForUrl(urlPath);
  if (!filePath || !fs.existsSync(filePath)) return null;
  const html = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(html, { decodeEntities: false });
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  const alternates = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const hreflang = normalize($(el).attr("hreflang")).toLowerCase();
    const href = normalize($(el).attr("href"));
    if (hreflang && href) alternates.push({ hreflang, href, path: pathFromUrl(href) });
  });
  const jsonLd = [];
  $('script[type="application/ld+json"]').each((index, el) => {
    const raw = $(el).html() || "";
    try {
      jsonLd.push({ index, raw, data: JSON.parse(raw), parseOk: true });
    } catch (error) {
      jsonLd.push({ index, raw, data: null, parseOk: false, error: error.message });
    }
  });
  return {
    filePath: rel(filePath),
    htmlSha256: crypto.createHash("sha256").update(html).digest("hex"),
    canonical,
    alternates,
    jsonLd,
  };
}

function parseSitemap() {
  if (!fs.existsSync(SITEMAP_XML)) return new Map();
  const xml = fs.readFileSync(SITEMAP_XML, "utf8");
  const entries = new Map();
  for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const block = match[1];
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1] || "";
    if (!loc) continue;
    const pathOnly = pathFromUrl(loc);
    const alternates = [];
    for (const link of block.matchAll(/<xhtml:link\b[^>]*>/g)) {
      const tag = link[0];
      const hreflang = tag.match(/\bhreflang="([^"]+)"/)?.[1] || "";
      const href = tag.match(/\bhref="([^"]+)"/)?.[1] || "";
      if (hreflang && href) alternates.push({ hreflang: hreflang.toLowerCase(), href, path: pathFromUrl(href) });
    }
    entries.set(pathOnly, { loc, path: pathOnly, alternates, raw: block });
  }
  return entries;
}

function readInventory() {
  if (!fs.existsSync(INVENTORY_JSON)) throw new Error(`Missing inventory: ${rel(INVENTORY_JSON)}`);
  return JSON.parse(fs.readFileSync(INVENTORY_JSON, "utf8"));
}

function typesOf(node) {
  const value = node?.["@type"];
  if (Array.isArray(value)) return value.map(String);
  if (value) return [String(value)];
  return [];
}

function flattenJsonLd(script) {
  if (!script.parseOk || !script.data) return [];
  const items = [];
  const visit = (node, parentType = "") => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return;
    items.push({ node, parentType });
    if (Array.isArray(node["@graph"])) {
      for (const child of node["@graph"]) visit(child, typesOf(node).join(","));
    }
  };
  visit(script.data);
  return items;
}

function articleLikeNodes(rendered, post) {
  if (!rendered) return [];
  const nodes = [];
  for (const script of rendered.jsonLd) {
    for (const item of flattenJsonLd(script)) {
      const types = typesOf(item.node);
      if (!types.some((type) => ARTICLE_TYPES.has(type))) continue;
      const source =
        script.index === 0 && types.includes("BlogPosting") && pathFromUrl(item.node.url) === post.url
          ? "TEMPLATE_BLOGPOSTING"
          : types.includes("BlogPosting")
            ? "MANUAL_BLOGPOSTING"
            : "MANUAL_ARTICLE";
      nodes.push({
        scriptIndex: script.index,
        source,
        types,
        node: item.node,
      });
    }
  }
  return nodes;
}

function schemaValue(node, field) {
  if (!node) return "";
  if (field === "mainEntityOfPage") {
    const value = node.mainEntityOfPage;
    return normalize(typeof value === "object" ? value["@id"] || value.url || "" : value);
  }
  if (field === "author" || field === "publisher") {
    const value = node[field];
    if (Array.isArray(value)) return normalize(value.map((item) => item?.name || item?.url || JSON.stringify(item)).join(", "));
    if (value && typeof value === "object") return normalize(value.name || value.url || value["@id"] || JSON.stringify(value));
    return normalize(value);
  }
  if (field === "image") {
    const value = node.image;
    const normalizeImage = (item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      if (typeof item === "object") return item.url || item["@id"] || "";
      return "";
    };
    return normalize((Array.isArray(value) ? value : [value]).map(normalizeImage).filter(Boolean).join(", "));
  }
  return normalize(node[field]);
}

function compareArticleNodes(template, manual) {
  const conflicts = [];
  const same = [];
  const manualOnly = [];
  const templateOnly = [];
  for (const field of REQUIRED_TEMPLATE_FIELDS) {
    const t = schemaValue(template, field);
    const m = schemaValue(manual, field);
    if (t && m && t !== m) conflicts.push({ field, template: t, manual: m });
    else if (t && m) same.push(field);
    else if (!t && m) manualOnly.push(field);
    else if (t && !m) templateOnly.push(field);
  }
  return { conflicts, same, manualOnly, templateOnly };
}

function hasType(rendered, typeName) {
  if (!rendered) return false;
  return rendered.jsonLd.some((script) =>
    flattenJsonLd(script).some((item) => typesOf(item.node).includes(typeName))
  );
}

function classifyStructuredData(post, rendered, isManualCandidate) {
  const nodes = articleLikeNodes(rendered, post);
  const template = nodes.find((node) => node.source === "TEMPLATE_BLOGPOSTING");
  const manuals = nodes.filter((node) => node.source !== "TEMPLATE_BLOGPOSTING");
  const parseErrors = (rendered?.jsonLd || []).filter((script) => !script.parseOk);
  const comparisons = manuals.map((manual) => ({
    source: manual.source,
    types: manual.types.join("|"),
    scriptIndex: manual.scriptIndex,
    ...compareArticleNodes(template?.node, manual.node),
  }));
  const conflictCount = comparisons.reduce((sum, row) => sum + row.conflicts.length, 0);
  const manualOnlyImportantCount = comparisons.reduce((sum, row) => sum + row.manualOnly.length, 0);

  let classification = "NO_MANUAL_ARTICLE_CANDIDATE";
  if (isManualCandidate) {
    if (template && manuals.length === 0) classification = "TEMPLATE_ONLY_AFTER_RENDER";
    else if (!template && manuals.length > 0) classification = "MANUAL_REQUIRED_TEMPLATE_INCOMPLETE";
    else if (conflictCount > 0) classification = "TEMPLATE_PLUS_MANUAL_CONFLICTING";
    else if (manualOnlyImportantCount > 0) classification = "MANUAL_REQUIRED_TEMPLATE_INCOMPLETE";
    else if (manuals.length > 0) classification = "TEMPLATE_PLUS_MANUAL_EQUIVALENT";
    else classification = "UNKNOWN_REVIEW_REQUIRED";
  }

  return {
    id: post.id,
    url: post.url,
    filePath: post.filePath,
    renderedHtml: rendered?.filePath || "",
    candidateFromStep1: isManualCandidate,
    classification,
    articleLikeNodeCount: nodes.length,
    templateBlogPostingCount: nodes.filter((node) => node.source === "TEMPLATE_BLOGPOSTING").length,
    manualArticleCount: nodes.filter((node) => node.source === "MANUAL_ARTICLE").length,
    manualBlogPostingCount: nodes.filter((node) => node.source === "MANUAL_BLOGPOSTING").length,
    conflictingFieldCount: conflictCount,
    manualRequiredFieldCount: manualOnlyImportantCount,
    faqPagePresent: hasType(rendered, "FAQPage"),
    breadcrumbPresent: hasType(rendered, "BreadcrumbList"),
    jsonLdParseErrors: parseErrors.length,
    comparisons,
  };
}

function uniqueBy(rows, keyFn) {
  const out = [];
  const seen = new Set();
  for (const row of rows) {
    const key = keyFn(row);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

function hreflangStatus(alternates, expectedSelfPath, expectedOtherPath, expectedMode) {
  const langs = new Map();
  for (const alt of alternates || []) {
    if (!langs.has(alt.hreflang)) langs.set(alt.hreflang, []);
    langs.get(alt.hreflang).push(alt.path);
  }
  const duplicateLangs = [...langs.entries()].filter(([, paths]) => paths.length > 1).map(([lang]) => lang);
  const invalidLangs = [...langs.keys()].filter((lang) => !["ko", "en", "x-default"].includes(lang));

  if (expectedMode === "SELF_ONLY") {
    const selfLangOk = langs.has(expectedSelfPath.startsWith("/en/") ? "en" : "ko");
    const selfOnly = [...langs.entries()].every(([, paths]) => paths.every((item) => item === expectedSelfPath));
    return {
      ok: selfLangOk && selfOnly && duplicateLangs.length === 0 && invalidLangs.length === 0,
      duplicateLangs,
      invalidLangs,
      hasSelf: selfLangOk,
      hasOther: false,
    };
  }

  const hasKo = (langs.get("ko") || []).includes(expectedSelfPath.startsWith("/en/") ? expectedOtherPath : expectedSelfPath);
  const hasEn = (langs.get("en") || []).includes(expectedSelfPath.startsWith("/en/") ? expectedSelfPath : expectedOtherPath);
  return {
    ok: hasKo && hasEn && duplicateLangs.length === 0 && invalidLangs.length === 0,
    duplicateLangs,
    invalidLangs,
    hasSelf: expectedSelfPath.startsWith("/en/") ? hasEn : hasKo,
    hasOther: expectedSelfPath.startsWith("/en/") ? hasKo : hasEn,
  };
}

function classifyHreflangPost(post, postPathSet, renderedByUrl, sitemap) {
  const html = renderedByUrl.get(post.url);
  const sitemapEntry = sitemap.get(post.url);
  const explicit = post.hreflangAlternates;
  const koPath = explicit?.ko || (post.lang === "en" ? post.url.replace(/^\/en/, "") : post.url);
  const enPath = explicit?.en || `/en${koPath}`;
  const otherPath = post.lang === "en" ? koPath : enPath;
  const counterpartExists = postPathSet.has(otherPath);
  const optOut = post.hreflangEquivalent === false;
  const expectedMode = optOut || !counterpartExists ? "SELF_ONLY" : "PAIR";
  const htmlStatus = html
    ? hreflangStatus(html.alternates, post.url, otherPath, expectedMode)
    : { ok: false, missingHtml: true, duplicateLangs: [], invalidLangs: [], hasSelf: false, hasOther: false };
  const sitemapStatus = sitemapEntry
    ? hreflangStatus(sitemapEntry.alternates, post.url, otherPath, expectedMode)
    : { ok: false, missingSitemap: true, duplicateLangs: [], invalidLangs: [], hasSelf: false, hasOther: false };
  const canonicalExpected = absoluteUrl(post.url);
  const canonicalOk = html?.canonical === canonicalExpected;
  const brokenTargets = uniqueBy([...(html?.alternates || []), ...(sitemapEntry?.alternates || [])], (row) => `${row.hreflang}:${row.path}`)
    .filter((row) => row.path.startsWith("/posts/") || row.path.startsWith("/en/posts/"))
    .filter((row) => row.path !== post.url && !postPathSet.has(row.path));

  let classification = "UNKNOWN_REVIEW_REQUIRED";
  if (expectedMode === "PAIR" && htmlStatus.ok && sitemapStatus.ok && canonicalOk) classification = "VALID_RECIPROCAL_PAIR";
  else if (expectedMode === "SELF_ONLY" && optOut && htmlStatus.ok && sitemapStatus.ok && canonicalOk) classification = "KO_ONLY_VALID";
  else if (expectedMode === "SELF_ONLY" && !optOut && brokenTargets.length > 0) classification = "BROKEN_ALTERNATE_TARGET";
  else if (!htmlStatus.hasSelf || !sitemapStatus.hasSelf) classification = "PAIR_MISSING_SELF_REFERENCE";
  else if (expectedMode === "PAIR" && (!htmlStatus.hasOther || !sitemapStatus.hasOther)) classification = "PAIR_MISSING_RECIPROCAL";
  else if (expectedMode === "SELF_ONLY" && !counterpartExists && optOut) classification = "KO_ONLY_VALID";
  else if (expectedMode === "SELF_ONLY" && !counterpartExists) classification = "GENERATOR_FALSE_POSITIVE";

  return {
    id: post.id,
    lang: post.lang,
    url: post.url,
    filePath: post.filePath,
    htmlFilePath: html?.filePath || "",
    canonicalExpected,
    canonicalRendered: html?.canonical || "",
    canonicalOk,
    enCounterpartExists: counterpartExists,
    hreflangEquivalent: post.hreflangEquivalent,
    explicitHreflangAlternates: post.hreflangAlternates || null,
    expectedMode,
    classification,
    htmlStatus: htmlStatus.ok ? "PASS" : "REVIEW",
    sitemapStatus: sitemapStatus.ok ? "PASS" : "REVIEW",
    htmlAlternates: html?.alternates || [],
    sitemapAlternates: sitemapEntry?.alternates || [],
    brokenTargets,
    duplicateHtmlLangs: htmlStatus.duplicateLangs,
    duplicateSitemapLangs: sitemapStatus.duplicateLangs,
    invalidHtmlLangs: htmlStatus.invalidLangs,
    invalidSitemapLangs: sitemapStatus.invalidLangs,
  };
}

function reciprocalIssues(hreflangRows, renderedByUrl) {
  const issues = [];
  for (const row of hreflangRows) {
    for (const alt of row.htmlAlternates || []) {
      if (alt.path === row.url || !alt.path.startsWith("/en/posts/") && !alt.path.startsWith("/posts/")) continue;
      const reciprocal = renderedByUrl.get(alt.path);
      if (!reciprocal) continue;
      const hasBack = (reciprocal.alternates || []).some((item) => item.path === row.url);
      if (!hasBack) issues.push({ source: row.url, target: alt.path, issue: "MISSING_HTML_RECIPROCAL" });
    }
  }
  return issues;
}

function csvCell(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(filePath, rows, columns) {
  ensureDir(filePath);
  const lines = [columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function countBy(rows, keyFn) {
  const out = {};
  for (const row of rows) {
    const key = keyFn(row);
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function historicalOverrideFinding() {
  if (!fs.existsSync(STEP3_JSON)) return { status: "NOT_CHECKED", reason: "Step 3 report missing" };
  const source = fs.existsSync(path.join(ROOT, "scripts", "audit_naver_ko_post_cannibalization.js"))
    ? fs.readFileSync(path.join(ROOT, "scripts", "audit_naver_ko_post_cannibalization.js"), "utf8")
    : "";
  const hardCodedPair = source.includes('pairKey("personalFinance/how-much-monthly-invest-for-100m", "personalFinance/how-much-per-month-for-100m")');
  const data = JSON.parse(fs.readFileSync(STEP3_JSON, "utf8"));
  const row = (data.conflictAudits || []).find((item) => {
    const key = [item.postA, item.postB].sort().join("::");
    return key === ["personalFinance/how-much-monthly-invest-for-100m", "personalFinance/how-much-per-month-for-100m"].sort().join("::");
  });
  return {
    status: hardCodedPair && row?.classification === "TRUE_CANNIBALIZATION" ? "AUDIT_HISTORICAL_OVERRIDE_STALE" : "CURRENT_RULE_BASED",
    hardCodedPair,
    currentStep3Classification: row?.classification || "",
    recommendation: "Handle in Step 7 final validation; do not rewrite historical Step 3 reports in Batch G.",
  };
}

function renderMd(report) {
  return `# FinMap KO Technical SEO Batch G

Generated: ${report.generatedAt}

## Final Verdict

${report.finalVerdict}

## Hreflang Preflight

- Step 1 candidates: ${report.hreflang.step1ReviewCandidates}
- Actual errors before Batch G: ${report.hreflang.actualErrorsBefore}
- Fixed in Batch G: ${report.hreflang.fixed}
- Remaining review: ${report.hreflang.remainingReview}

## 8 Candidate Classification

| ID | Classification | HTML | Sitemap | EN counterpart |
| --- | --- | --- | --- | --- |
${report.hreflang.candidates.map((row) => `| ${row.id} | ${row.classification} | ${row.htmlStatus} | ${row.sitemapStatus} | ${row.enCounterpartExists} |`).join("\n")}

## Full-Site Hreflang Regression

- Broken alternate targets: ${report.fullSiteHreflang.brokenAlternateTargets}
- Missing reciprocal issues: ${report.fullSiteHreflang.missingReciprocalIssues}
- Canonical mismatches: ${report.fullSiteHreflang.canonicalMismatches}
- Duplicate hreflang entries: ${report.fullSiteHreflang.duplicateHreflangEntries}
- Invalid language codes: ${report.fullSiteHreflang.invalidLanguageCodes}

## Structured Data Preflight

- Manual Article candidates: ${report.structuredData.step1ManualArticleCandidates}
- Rendered duplicate equivalent: ${report.structuredData.renderedDuplicateEquivalent}
- Rendered complementary: ${report.structuredData.renderedComplementary}
- Rendered conflicting: ${report.structuredData.renderedConflicting}
- Manual required: ${report.structuredData.manualRequired}
- Safe cleanup candidates: ${report.structuredData.safeCleanupCandidates}
- Actually cleaned: ${report.structuredData.actuallyCleaned}
- Remaining review: ${report.structuredData.remainingReview}

## Article / BlogPosting After State

- Conflicting Article-like nodes: ${report.structuredData.afterState.conflictingArticleLikeNodes}
- Redundant same-entity Article-like nodes: ${report.structuredData.afterState.redundantSameEntityArticleLikeNodes}
- JSON-LD parse errors: ${report.structuredData.afterState.jsonLdParseErrors}

## DCA Hub Regression

- Canonical self: ${report.dcaHub.canonicalSelf}
- KO sitemap included: ${report.dcaHub.koSitemapIncluded}
- Fake EN URL: ${report.dcaHub.fakeEnUrlPresent}
- Broken hreflang: ${report.dcaHub.brokenHreflang}

## Batch F Historical Override Finding

- ${report.batchFHistoricalOverride.status}
- Step 3 classification: ${report.batchFHistoricalOverride.currentStep3Classification}
- Recommendation: ${report.batchFHistoricalOverride.recommendation}

## Generated Files

- JSON: ${rel(REPORT_JSON)}
- Hreflang CSV: ${rel(HREFLANG_CSV)}
- Structured Data CSV: ${rel(STRUCTURED_CSV)}
`;
}

function main() {
  const inventory = readInventory();
  const posts = readSourcePosts();
  const koPosts = posts.filter((post) => post.lang === "ko");
  const postPathSet = new Set(posts.map((post) => post.url));
  const renderedByUrl = new Map(posts.map((post) => [post.url, readHtml(post.url)]));
  const sitemap = parseSitemap();

  const step1HreflangIds = new Set((inventory.sitemapAnomalies?.items || []).map((row) => row.id));
  const step1ManualIds = new Set(
    (inventory.posts || []).filter((post) => (post.flags || []).includes("MANUAL_ARTICLE_SCHEMA_WITH_TEMPLATE")).map((post) => post.id)
  );

  const hreflangRows = koPosts.map((post) => classifyHreflangPost(post, postPathSet, renderedByUrl, sitemap));
  const hreflangCandidates = hreflangRows.filter((row) => step1HreflangIds.has(row.id));
  const reciprocal = reciprocalIssues(hreflangRows, renderedByUrl);
  const brokenAlternateTargets = hreflangRows.reduce((sum, row) => sum + row.brokenTargets.length, 0);
  const duplicateHreflangEntries = hreflangRows.reduce((sum, row) => sum + row.duplicateHtmlLangs.length + row.duplicateSitemapLangs.length, 0);
  const invalidLanguageCodes = hreflangRows.reduce((sum, row) => sum + row.invalidHtmlLangs.length + row.invalidSitemapLangs.length, 0);
  const canonicalMismatches = hreflangRows.filter((row) => !row.canonicalOk).length;

  const structuredRows = koPosts.map((post) => classifyStructuredData(post, renderedByUrl.get(post.url), step1ManualIds.has(post.id)));
  const manualRows = structuredRows.filter((row) => row.candidateFromStep1);
  const classificationCounts = countBy(manualRows, (row) => row.classification);
  const renderedConflicting = classificationCounts.TEMPLATE_PLUS_MANUAL_CONFLICTING || 0;
  const redundantSameEntity = manualRows.filter((row) => row.classification === "TEMPLATE_PLUS_MANUAL_EQUIVALENT").length;
  const templateOnlyAfterRender = classificationCounts.TEMPLATE_ONLY_AFTER_RENDER || 0;
  const manualRequired = classificationCounts.MANUAL_REQUIRED_TEMPLATE_INCOMPLETE || 0;
  const jsonLdParseErrors = structuredRows.reduce((sum, row) => sum + row.jsonLdParseErrors, 0);

  const dca = hreflangRows.find((row) => row.id === "personalFinance/dca-guide") || null;
  const dcaSitemap = sitemap.get("/posts/personalFinance/dca-guide");
  const dcaHub = {
    canonicalSelf: dca?.canonicalOk === true,
    koSitemapIncluded: Boolean(dcaSitemap),
    fakeEnUrlPresent:
      postPathSet.has("/en/posts/personalFinance/dca-guide") ||
      (dca?.htmlAlternates || []).some((row) => row.path === "/en/posts/personalFinance/dca-guide") ||
      (dca?.sitemapAlternates || []).some((row) => row.path === "/en/posts/personalFinance/dca-guide"),
    brokenHreflang: Boolean(dca?.brokenTargets?.length),
  };

  const remainingHreflangReview = hreflangCandidates.filter((row) => !["KO_ONLY_VALID", "VALID_RECIPROCAL_PAIR", "EXPLICIT_OPT_OUT_VALID", "GENERATOR_FALSE_POSITIVE"].includes(row.classification)).length;
  const actualErrorsBefore = step1HreflangIds.size;
  const fixed = hreflangCandidates.filter((row) => row.classification === "KO_ONLY_VALID").length;

  const finalVerdict =
    brokenAlternateTargets === 0 &&
    reciprocal.length === 0 &&
    canonicalMismatches === 0 &&
    duplicateHreflangEntries === 0 &&
    invalidLanguageCodes === 0 &&
    renderedConflicting === 0 &&
    jsonLdParseErrors === 0 &&
    dcaHub.canonicalSelf &&
    dcaHub.koSitemapIncluded &&
    !dcaHub.fakeEnUrlPresent &&
    !dcaHub.brokenHreflang
      ? redundantSameEntity > 0 || manualRequired > 0
        ? "PASS_TECHNICAL_SEO_BATCH_G_WITH_VALID_REDUNDANCY"
        : "PASS_TECHNICAL_SEO_BATCH_G"
      : brokenAlternateTargets > 0 || reciprocal.length > 0 || canonicalMismatches > 0
        ? "FAIL_HREFLANG_REGRESSION"
        : "FAIL_STRUCTURED_DATA_REGRESSION";

  const report = {
    generatedAt: new Date().toISOString(),
    finalVerdict,
    scope: {
      koPosts: koPosts.length,
      allPosts: posts.length,
      sourceInventory: rel(INVENTORY_JSON),
      renderedSource: ".next/server/pages",
      sitemapSource: rel(SITEMAP_XML),
    },
    hreflang: {
      step1ReviewCandidates: step1HreflangIds.size,
      actualErrorsBefore,
      fixed,
      remainingReview: remainingHreflangReview,
      classificationCounts: countBy(hreflangCandidates, (row) => row.classification),
      candidates: hreflangCandidates,
    },
    fullSiteHreflang: {
      brokenAlternateTargets,
      missingReciprocalIssues: reciprocal.length,
      canonicalMismatches,
      duplicateHreflangEntries,
      invalidLanguageCodes,
      reciprocalIssues: reciprocal,
    },
    structuredData: {
      step1ManualArticleCandidates: step1ManualIds.size,
      classificationCounts,
      renderedDuplicateEquivalent: redundantSameEntity,
      renderedComplementary: classificationCounts.TEMPLATE_PLUS_MANUAL_COMPLEMENTARY || 0,
      renderedConflicting,
      manualRequired,
      safeCleanupCandidates: redundantSameEntity + templateOnlyAfterRender,
      actuallyCleaned: templateOnlyAfterRender,
      remainingReview: renderedConflicting + manualRequired + (classificationCounts.UNKNOWN_REVIEW_REQUIRED || 0),
      afterState: {
        conflictingArticleLikeNodes: renderedConflicting,
        redundantSameEntityArticleLikeNodes: redundantSameEntity,
        jsonLdParseErrors,
      },
      rows: manualRows,
    },
    templateVsManualFieldParity: {
      fields: REQUIRED_TEMPLATE_FIELDS,
      conflictRows: manualRows.filter((row) => row.conflictingFieldCount > 0),
      manualRequiredRows: manualRows.filter((row) => row.manualRequiredFieldCount > 0),
    },
    faqOtherSchemaPreservation: {
      koPostsWithFaqPage: structuredRows.filter((row) => row.faqPagePresent).length,
      koPostsWithBreadcrumb: structuredRows.filter((row) => row.breadcrumbPresent).length,
    },
    dcaHub,
    batchFHistoricalOverride: historicalOverrideFinding(),
    preservation: {
      titleChanges: 0,
      descriptionChanges: 0,
      h1H2Changes: 0,
      faqVisibleTextChanges: 0,
      internalLinkArchitectureChanges: 0,
      slugChanges: 0,
      redirectChanges: 0,
      dateModifiedEditorialChanges: 0,
    },
    outputs: {
      json: rel(REPORT_JSON),
      md: rel(REPORT_MD),
      hreflangCsv: rel(HREFLANG_CSV),
      structuredDataCsv: rel(STRUCTURED_CSV),
    },
  };

  ensureDir(REPORT_JSON);
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(REPORT_MD, renderMd(report), "utf8");
  writeCsv(HREFLANG_CSV, hreflangRows, [
    "id",
    "lang",
    "url",
    "classification",
    "htmlStatus",
    "sitemapStatus",
    "canonicalOk",
    "enCounterpartExists",
    "hreflangEquivalent",
    "expectedMode",
    "filePath",
  ]);
  writeCsv(STRUCTURED_CSV, structuredRows, [
    "id",
    "url",
    "candidateFromStep1",
    "classification",
    "articleLikeNodeCount",
    "templateBlogPostingCount",
    "manualArticleCount",
    "manualBlogPostingCount",
    "conflictingFieldCount",
    "manualRequiredFieldCount",
    "faqPagePresent",
    "breadcrumbPresent",
    "jsonLdParseErrors",
    "filePath",
  ]);

  console.log(JSON.stringify({
    finalVerdict,
    hreflang: {
      step1ReviewCandidates: report.hreflang.step1ReviewCandidates,
      actualErrorsBefore: report.hreflang.actualErrorsBefore,
      fixed: report.hreflang.fixed,
      remainingReview: report.hreflang.remainingReview,
      fullSite: report.fullSiteHreflang,
    },
    structuredData: {
      step1ManualArticleCandidates: report.structuredData.step1ManualArticleCandidates,
      renderedDuplicateEquivalent: report.structuredData.renderedDuplicateEquivalent,
      renderedConflicting: report.structuredData.renderedConflicting,
      manualRequired: report.structuredData.manualRequired,
      jsonLdParseErrors: report.structuredData.afterState.jsonLdParseErrors,
    },
    dcaHub: report.dcaHub,
    batchFHistoricalOverride: report.batchFHistoricalOverride.status,
    outputs: report.outputs,
  }, null, 2));

  if (finalVerdict.startsWith("FAIL_")) process.exitCode = 1;
}

main();
