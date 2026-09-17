const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const INVENTORY_JSON = path.join(ROOT, "reports", "naver-ko-post-search-inventory-2026-09-16.json");
const POSTS_ROOT = path.join(ROOT, "content", "posts");
const ARTICLE_TYPES = new Set(["Article", "BlogPosting", "NewsArticle"]);
const PROTECTED_TYPES = new Set(["FAQPage", "Question", "Answer", "BreadcrumbList", "HowTo", "WebSite", "Organization"]);

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function idToFilePath(id) {
  const [category, slug] = id.split("/");
  return path.join(POSTS_ROOT, category, "ko", `${slug}.md`);
}

function typesOf(node) {
  const value = node?.["@type"];
  if (Array.isArray(value)) return value.map(String);
  if (value) return [String(value)];
  return [];
}

function flatten(node, rows = []) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return rows;
  rows.push(node);
  if (Array.isArray(node["@graph"])) {
    for (const child of node["@graph"]) flatten(child, rows);
  }
  return rows;
}

function scriptDecision(scriptHtml) {
  const json = scriptHtml
    .replace(/^<script\b[^>]*>/i, "")
    .replace(/<\/script>\s*$/i, "")
    .trim();
  try {
    const data = JSON.parse(json);
    const types = Array.from(new Set(flatten(data).flatMap(typesOf)));
    const hasArticleLike = types.some((type) => ARTICLE_TYPES.has(type));
    const hasProtected = types.some((type) => PROTECTED_TYPES.has(type));
    return {
      remove: hasArticleLike && !hasProtected,
      parseOk: true,
      types,
      reason: hasArticleLike && !hasProtected ? "ARTICLE_LIKE_ONLY" : hasProtected ? "PROTECTED_SCHEMA_PRESENT" : "NO_ARTICLE_LIKE",
    };
  } catch (error) {
    return { remove: false, parseOk: false, types: [], reason: `PARSE_ERROR: ${error.message}` };
  }
}

function cleanupFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const scriptRe = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi;
  let output = "";
  let lastIndex = 0;
  const decisions = [];
  for (const match of raw.matchAll(scriptRe)) {
    const scriptHtml = match[0];
    const decision = scriptDecision(scriptHtml);
    decisions.push({ ...decision, index: decisions.length });
    output += raw.slice(lastIndex, match.index);
    if (!decision.remove) output += scriptHtml;
    lastIndex = match.index + scriptHtml.length;
  }
  output += raw.slice(lastIndex);
  output = output.replace(/\n{4,}/g, "\n\n\n");
  const removedCount = decisions.filter((row) => row.remove).length;
  return {
    changed: removedCount > 0 && output !== raw,
    output,
    removedCount,
    protectedCount: decisions.filter((row) => row.reason === "PROTECTED_SCHEMA_PRESENT").length,
    decisions,
  };
}

function main() {
  const apply = process.argv.includes("--apply");
  if (!fs.existsSync(INVENTORY_JSON)) throw new Error(`Missing inventory: ${rel(INVENTORY_JSON)}`);
  const inventory = JSON.parse(fs.readFileSync(INVENTORY_JSON, "utf8"));
  const ids = (inventory.posts || [])
    .filter((post) => (post.flags || []).includes("MANUAL_ARTICLE_SCHEMA_WITH_TEMPLATE"))
    .map((post) => post.id);

  const rows = [];
  for (const id of ids) {
    const filePath = idToFilePath(id);
    if (!fs.existsSync(filePath)) {
      rows.push({ id, filePath: rel(filePath), changed: false, removedCount: 0, reason: "FILE_NOT_FOUND" });
      continue;
    }
    const result = cleanupFile(filePath);
    if (apply && result.changed) fs.writeFileSync(filePath, result.output, "utf8");
    rows.push({
      id,
      filePath: rel(filePath),
      changed: result.changed,
      removedCount: result.removedCount,
      protectedCount: result.protectedCount,
      decisions: result.decisions.map((row) => ({ index: row.index, reason: row.reason, types: row.types })),
    });
  }

  const summary = {
    mode: apply ? "APPLY" : "DRY_RUN",
    candidates: ids.length,
    changedFiles: rows.filter((row) => row.changed).length,
    removedBlocks: rows.reduce((sum, row) => sum + row.removedCount, 0),
    protectedBlocks: rows.reduce((sum, row) => sum + row.protectedCount, 0),
    skippedFiles: rows.filter((row) => !row.changed).length,
  };

  console.log(JSON.stringify({ summary, rows }, null, 2));
}

main();
