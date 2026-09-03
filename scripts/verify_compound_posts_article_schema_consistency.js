const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = process.cwd();
const SITE_URL = "https://www.finmaphub.com";
const POST_RENDERER_PATH = path.join(ROOT, "pages", "posts", "[category]", "[slug].js");
const SITEMAP_KO_PATH = path.join(ROOT, "public", "sitemap-ko.xml");

const TARGETS = [
  "content/posts/personalFinance/ko/compound-calculator-guide.md",
  "content/posts/personalFinance/ko/simple-vs-compound.md",
  "content/posts/personalFinance/ko/annual-vs-monthly-compound.md",
  "content/posts/personalFinance/ko/monthly-dca-10-year-result.md",
  "content/posts/personalFinance/ko/how-much-per-month-for-100m.md",
  "content/posts/personalFinance/ko/goal-amount-fast-strategy.md",
  "content/posts/personalFinance/ko/what-is-cagr.md",
];

function readFile(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeDateOnly(value) {
  const text = normalizeText(value);
  const match = text.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : text;
}

function mdEscape(value) {
  return normalizeText(value).replace(/\|/g, "\\|");
}

function hasNoindex(data) {
  return data.draft === true || data.noindex === true || /\bnoindex\b/i.test(String(data.robots || ""));
}

function postUrlPathFromFile(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  const match = normalized.match(/^content\/posts\/([^/]+)\/ko\/([^/]+)\.md$/);
  if (!match) return "";
  return `/posts/${match[1]}/${match[2]}`;
}

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

function normalizeDate(value, fallback) {
  const parsed = value ? new Date(value) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return fallback || new Date(0).toISOString();
}

function latestKoRssCandidates(limit = 50) {
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
      return {
        urlPath: `/posts/${parts[0]}/${path.basename(file, ".md")}`,
        sortDate: normalizeDate(data.dateModified || data.datePublished || data.date, fallback),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
    .slice(0, limit);
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

function extractJsonLd(markdown) {
  const scripts = [];
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(markdown))) {
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw);
      scripts.push({ index: match.index, nodes: flattenJsonLd(parsed), parseError: "" });
    } catch (error) {
      scripts.push({ index: match.index, nodes: [], parseError: error.message });
    }
  }
  return scripts;
}

function mainEntityId(node) {
  const value = node?.mainEntityOfPage;
  if (!value) return "";
  if (typeof value === "string") return value;
  return value["@id"] || value.url || "";
}

function readSitemapKoSet() {
  const xml = readFile(SITEMAP_KO_PATH);
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
}

function rendererCreatesBlogPosting() {
  const source = readFile(POST_RENDERER_PATH);
  return (
    source.includes("'@type': 'BlogPosting'") &&
    source.includes("headline: post.title") &&
    source.includes("description: post.description") &&
    source.includes("dateModified: post.dateModified || post.datePublished") &&
    source.includes("<JsonLd data={jsonld} />")
  );
}

function auditTarget(relativePath, context) {
  const fullPath = path.join(ROOT, relativePath);
  const urlPath = postUrlPathFromFile(relativePath);
  const fullUrl = `${SITE_URL}${urlPath}`;
  const raw = readFile(fullPath);
  const result = {
    post: urlPath || relativePath,
    exists: Boolean(raw),
    manualArticleCount: 0,
    faqPageCount: 0,
    dateModifiedMatch: "N/A",
    mainEntityMatch: "N/A",
    sitemap: false,
    rss: false,
    noindex: true,
    result: "FAIL",
    problems: [],
  };

  if (!raw) {
    result.problems.push("file missing");
    return result;
  }

  const parsed = matter(raw);
  const data = parsed.data || {};
  const content = parsed.content || "";
  const jsonLd = extractJsonLd(content);
  const allNodes = jsonLd.flatMap((script) => script.nodes);
  const parseErrors = jsonLd.filter((script) => script.parseError);
  const articleNodes = allNodes.filter((node) => {
    const types = typeList(node);
    return types.includes("Article") || types.includes("BlogPosting");
  });
  const faqNodes = allNodes.filter((node) => typeList(node).includes("FAQPage"));
  const expectedDateModified = normalizeDateOnly(data.dateModified);

  result.manualArticleCount = articleNodes.length;
  result.faqPageCount = faqNodes.length;
  result.sitemap = context.sitemapKo.has(fullUrl);
  result.rss = context.rssPaths.has(urlPath);
  result.noindex = hasNoindex(data);

  if (!data.title) result.problems.push("frontmatter title missing");
  if (!data.description && !data.seoDescription) result.problems.push("frontmatter description/seoDescription missing");
  if (!data.datePublished) result.problems.push("frontmatter datePublished missing");
  if (!data.dateModified) result.problems.push("frontmatter dateModified missing");
  if (data.draft === true) result.problems.push("draft true");
  if (result.noindex) result.problems.push("noindex/robots noindex");
  if (!result.sitemap) result.problems.push("sitemap-ko missing");
  if (parseErrors.length) result.problems.push(`JSON-LD parse errors: ${parseErrors.length}`);

  if (articleNodes.length > 0) {
    const dateOk = articleNodes.every((node) => normalizeDateOnly(node.dateModified) === expectedDateModified);
    const mainEntityOk = articleNodes.every((node) => mainEntityId(node) === fullUrl);
    result.dateModifiedMatch = dateOk ? "PASS" : "FAIL";
    result.mainEntityMatch = mainEntityOk ? "PASS" : "FAIL";
    if (!dateOk) result.problems.push("manual Article dateModified mismatch");
    if (!mainEntityOk) result.problems.push("manual Article mainEntityOfPage mismatch");
    if (context.rendererAutoBlogPosting) result.problems.push("duplicate Article/BlogPosting render risk");
  }

  if (!result.rss) {
    result.problems.push("RSS latest 50 candidate missing");
  }

  result.result = result.problems.length ? "FAIL" : "PASS";
  return result;
}

function renderTable(rows) {
  return rows
    .map((row) => (
      `| ${mdEscape(row.post)} | ${row.manualArticleCount} | ${row.faqPageCount} | ${row.dateModifiedMatch} | ${row.mainEntityMatch} | ${row.sitemap ? "PASS" : "FAIL"} | ${row.noindex ? "FAIL" : "PASS"} | ${row.result} |`
    ))
    .join("\n");
}

function run() {
  const context = {
    rendererAutoBlogPosting: rendererCreatesBlogPosting(),
    sitemapKo: readSitemapKoSet(),
    rssPaths: new Set(latestKoRssCandidates().map((item) => item.urlPath)),
  };

  const rows = TARGETS.map((target) => auditTarget(target, context));
  if (!context.rendererAutoBlogPosting) {
    for (const row of rows) row.problems.push("post renderer automatic BlogPosting missing");
    for (const row of rows) row.result = "FAIL";
  }

  console.log("# Compound Posts Article Schema Consistency Verification");
  console.log("");
  console.log(`Common renderer automatic BlogPosting: ${context.rendererAutoBlogPosting ? "PASS" : "FAIL"}`);
  console.log("");
  console.log("| Post | Manual Article/BlogPosting | FAQPage | dateModified match | mainEntityOfPage match | Sitemap | Noindex | Result |");
  console.log("| --- | ---: | ---: | --- | --- | --- | --- | --- |");
  console.log(renderTable(rows));
  console.log("");
  console.log("| Post | RSS latest 50 candidate | Problems |");
  console.log("| --- | --- | --- |");
  for (const row of rows) {
    console.log(`| ${mdEscape(row.post)} | ${row.rss ? "PASS" : "FAIL"} | ${mdEscape(row.problems.join("; ") || "OK")} |`);
  }

  const failures = rows.filter((row) => row.result !== "PASS");
  console.log("");
  console.log(`Final: ${failures.length ? "FAIL" : "PASS"} (${failures.length} failing posts)`);
  if (failures.length) process.exitCode = 1;
}

run();
