const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const matter = require("gray-matter");

const ROOT = process.cwd();
const DATE_STAMP = "2026-09-16";
const POSTS_ROOT = path.join(ROOT, "content", "posts");
const REPORT_DIR = path.join(ROOT, "reports");
const STEP4_JSON = path.join(REPORT_DIR, `naver-ko-post-topic-links-${DATE_STAMP}.json`);
const APPROVED_CSV = path.join(REPORT_DIR, `naver-ko-approved-link-plan-${DATE_STAMP}.csv`);
const PREEDIT_JSON = path.join(REPORT_DIR, `naver-ko-topic-links-batch-b-preedit-${DATE_STAMP}.json`);
const REPORT_MD = path.join(REPORT_DIR, `naver-ko-topic-links-batch-b-${DATE_STAMP}.md`);
const REPORT_JSON = path.join(REPORT_DIR, `naver-ko-topic-links-batch-b-${DATE_STAMP}.json`);
const STEP6A_JSON = path.join(REPORT_DIR, `naver-ko-query-boundary-batch-a-${DATE_STAMP}.json`);
const BATCH_F_DATE_STAMP = "2026-09-17";
const BATCH_F_JSON = path.join(REPORT_DIR, `naver-ko-100m-cannibalization-batch-f-${BATCH_F_DATE_STAMP}.json`);
const BATCH_G_DATE_STAMP = "2026-09-17";
const BATCH_G_JSON = path.join(REPORT_DIR, `naver-ko-technical-seo-batch-g-${BATCH_G_DATE_STAMP}.json`);

const KO_CATEGORY_DIRS = ["economicInfo", "personalFinance", "investingInfo"];
const ALLOWED_RELATIONSHIPS = new Set(["CORE_TO_SPOKE", "SPOKE_TO_CORE", "PARENT_TO_CHILD", "CHILD_TO_PARENT"]);
const DEFERRED_OTHER_BATCH = new Set(["MARKET_FUNNEL", "TOOL_FUNNEL", "HUB_INTEGRATION", "QUERY_BOUNDARY"]);

const EXPECTED_LINKS = [
  ["investingInfo/dca-consistency-7-fail-patterns", "personalFinance/dca-vs-lumpsum-decision-rules", "SPOKE_TO_CORE"],
  ["personalFinance/dca-vs-lumpsum-decision-rules", "investingInfo/dca-consistency-7-fail-patterns", "CORE_TO_SPOKE"],
  ["personalFinance/how-much-monthly-invest-for-100m", "personalFinance/dca-vs-lumpsum-decision-rules", "SPOKE_TO_CORE"],
  ["personalFinance/dca-vs-lumpsum-decision-rules", "personalFinance/how-much-monthly-invest-for-100m", "CORE_TO_SPOKE"],
  ["personalFinance/is-dca-better-in-bear-market", "personalFinance/dca-vs-lumpsum-decision-rules", "SPOKE_TO_CORE"],
  ["personalFinance/dca-vs-lumpsum-decision-rules", "personalFinance/is-dca-better-in-bear-market", "CORE_TO_SPOKE"],
  ["personalFinance/monthly-investment-for-100m-table", "personalFinance/dca-vs-lumpsum-decision-rules", "CHILD_TO_PARENT"],
  ["personalFinance/dca-vs-lumpsum-decision-rules", "personalFinance/dca-fx-volatility-decomposition", "CORE_TO_SPOKE"],

  ["personalFinance/dsr-40-income-loan-limit-table", "personalFinance/salary-40m-mortgage-limit", "PARENT_TO_CHILD"],
  ["personalFinance/dsr-40-income-loan-limit-table", "personalFinance/salary-50m-dsr-40-loan-limit", "PARENT_TO_CHILD"],
  ["personalFinance/salary-40m-mortgage-limit", "personalFinance/dsr-40-income-loan-limit-table", "CHILD_TO_PARENT"],
  ["personalFinance/salary-50m-dsr-40-loan-limit", "personalFinance/dsr-40-income-loan-limit-table", "CHILD_TO_PARENT"],
  ["personalFinance/dsr-pass-ltv-cash-bottleneck", "personalFinance/ltv-dsr-calculator-guide", "SPOKE_TO_CORE"],
  ["personalFinance/interest-rate-1p-loan-limit-impact", "personalFinance/dsr-40-income-loan-limit-table", "SPOKE_TO_CORE"],
  ["personalFinance/mortgage-risk-checklist-dsr-variable", "personalFinance/ltv-dsr-calculator-guide", "SPOKE_TO_CORE"],
  ["personalFinance/ltv-dsr-calculator-guide", "personalFinance/mortgage-risk-checklist-dsr-variable", "CORE_TO_SPOKE"],
  ["personalFinance/ltv-dsr-calculator-guide", "personalFinance/salary-50m-dsr-40-loan-limit", "CORE_TO_SPOKE"],

  ["personalFinance/apartment-buying-costs-before-purchase", "personalFinance/apartment-buying-calculator-guide", "SPOKE_TO_CORE"],
  ["personalFinance/cash-100m-200m-300m-apartment-budget", "personalFinance/apartment-buying-calculator-guide", "SPOKE_TO_CORE"],
  ["personalFinance/first-home-buyer-budget-calculation", "personalFinance/apartment-buying-calculator-guide", "SPOKE_TO_CORE"],
  ["personalFinance/jeonse-to-home-purchase-cash-needed", "personalFinance/apartment-buying-calculator-guide", "SPOKE_TO_CORE"],
  ["personalFinance/rent-jeonse-buy-cashflow-opportunity-cost", "personalFinance/apartment-buying-calculator-guide", "SPOKE_TO_CORE"],
  ["personalFinance/apartment-buying-calculator-guide", "personalFinance/first-home-buyer-budget-calculation", "CORE_TO_SPOKE"],
  ["personalFinance/apartment-buying-calculator-guide", "personalFinance/jeonse-to-home-purchase-cash-needed", "CORE_TO_SPOKE"],
  ["personalFinance/apartment-buying-calculator-guide", "personalFinance/rent-jeonse-buy-cashflow-opportunity-cost", "CORE_TO_SPOKE"],
  ["personalFinance/apartment-buying-calculator-guide", "personalFinance/cash-100m-200m-300m-apartment-budget", "CORE_TO_SPOKE"],

  ["investingInfo/rates-discount-mortgage-demand-apt-prices", "personalFinance/apt-dashboard-home-goal-roadmap", "SPOKE_TO_CORE"],
  ["investingInfo/seoul-gyeonggi-incheon-risk-budget-framework", "personalFinance/apt-dashboard-home-goal-roadmap", "SPOKE_TO_CORE"],
  ["personalFinance/apartment-transaction-volume-decline-meaning", "personalFinance/apt-dashboard-home-goal-roadmap", "SPOKE_TO_CORE"],
  ["personalFinance/how-to-read-apartment-transaction-prices", "personalFinance/apt-dashboard-home-goal-roadmap", "SPOKE_TO_CORE"],
  ["personalFinance/large-apartment-complex-households-price-stability", "personalFinance/apt-dashboard-home-goal-roadmap", "SPOKE_TO_CORE"],
  ["personalFinance/apt-dashboard-home-goal-roadmap", "investingInfo/rates-discount-mortgage-demand-apt-prices", "CORE_TO_SPOKE"],
  ["personalFinance/apt-dashboard-home-goal-roadmap", "investingInfo/seoul-gyeonggi-incheon-risk-budget-framework", "CORE_TO_SPOKE"],
  ["personalFinance/apt-dashboard-home-goal-roadmap", "personalFinance/apartment-transaction-volume-decline-meaning", "CORE_TO_SPOKE"],
  ["personalFinance/apt-dashboard-home-goal-roadmap", "personalFinance/how-to-read-apartment-transaction-prices", "CORE_TO_SPOKE"],
  ["personalFinance/apt-dashboard-home-goal-roadmap", "personalFinance/large-apartment-complex-households-price-stability", "CORE_TO_SPOKE"],

  ["personalFinance/goal-amount-fast-strategy", "personalFinance/personal-finance-3pillars", "SPOKE_TO_CORE"],
  ["personalFinance/compound-calculator-guide", "personalFinance/compound-return-3-5-7-10-table", "CORE_TO_SPOKE"],
  ["personalFinance/fire-3-numbers-spending-horizon-withdrawal", "personalFinance/fire-assumption-errors-7-fixes", "CORE_TO_SPOKE"],
  ["personalFinance/fire-3-numbers-spending-horizon-withdrawal", "personalFinance/fire-spending-buckets-essential-choice-insurance", "CORE_TO_SPOKE"],
  ["investingInfo/modern-6040-risk-budget", "investingInfo/real-estate-role-in-portfolio-risk-budget", "CORE_TO_SPOKE"],
  ["economicInfo/hormuz-risk-oil-insurance-freight-premium", "economicInfo/eu-russia-gas-phaseout-price-channel", "CORE_TO_SPOKE"],
].map(([source, target, relationship]) => ({ source, target, relationship }));

const SKIP_DECISIONS = new Map([
  ["personalFinance/dca-vs-lumpsum-decision-rules::personalFinance/how-much-per-month-for-100m", "SKIP_CONTEXT_NOT_NATURAL"],
  ["personalFinance/monthly-investment-for-100m-table::personalFinance/is-dca-better-in-bear-market", "SKIP_CONTEXT_NOT_NATURAL"],
  ["personalFinance/dsr-40-income-loan-limit-table::personalFinance/ltv-dsr-calculator-guide", "ALREADY_SATISFIED"],
  ["personalFinance/dsr-pass-ltv-cash-bottleneck::personalFinance/dsr-40-income-loan-limit-table", "SKIP_CONTEXT_NOT_NATURAL"],
  ["personalFinance/interest-rate-1p-loan-limit-impact::personalFinance/ltv-dsr-calculator-guide", "SKIP_CONTEXT_NOT_NATURAL"],
  ["personalFinance/mortgage-risk-checklist-dsr-variable::personalFinance/dsr-40-income-loan-limit-table", "SKIP_CONTEXT_NOT_NATURAL"],
  ["personalFinance/salary-40m-mortgage-limit::personalFinance/ltv-dsr-calculator-guide", "SKIP_CONTEXT_NOT_NATURAL"],
  ["personalFinance/salary-50m-dsr-40-loan-limit::personalFinance/ltv-dsr-calculator-guide", "SKIP_CONTEXT_NOT_NATURAL"],
  ["personalFinance/apartment-buying-calculator-guide::personalFinance/apartment-buying-costs-before-purchase", "SKIP_CONTEXT_NOT_NATURAL"],
  ["personalFinance/cash-100m-200m-300m-apartment-budget::personalFinance/apartment-buying-calculator-guide", "ALREADY_SATISFIED"],
  ["personalFinance/rent-jeonse-buy-cashflow-opportunity-cost::personalFinance/apartment-buying-calculator-guide", "ALREADY_SATISFIED"],
  ["personalFinance/apartment-transaction-volume-decline-meaning::personalFinance/apt-dashboard-home-goal-roadmap", "ALREADY_SATISFIED"],
  ["personalFinance/how-to-read-apartment-transaction-prices::personalFinance/apt-dashboard-home-goal-roadmap", "ALREADY_SATISFIED"],
  ["personalFinance/large-apartment-complex-households-price-stability::personalFinance/apt-dashboard-home-goal-roadmap", "ALREADY_SATISFIED"],
]);

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkDir(full) : [full];
  });
}

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripTags(value) {
  return normalize(String(value || "").replace(/<[^>]+>/g, " "));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes && ch === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && ch === ",") {
      row.push(cell);
      cell = "";
    } else if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((item) => item !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((item) => item !== "")) rows.push(row);
  const headers = rows.shift() || [];
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function idToFilePath(id) {
  const [category, slug] = id.split("/");
  return path.join(POSTS_ROOT, category, "ko", `${slug}.md`);
}

function idToUrl(id) {
  const [category, slug] = id.split("/");
  return `/posts/${category}/${slug}`;
}

function urlToId(url) {
  const match = String(url || "").match(/^\/posts\/([^/]+)\/([^/?#]+)$/);
  return match ? `${match[1]}/${match[2]}` : "";
}

function dateValue(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function extractH2s(content) {
  return [
    ...Array.from(content.matchAll(/^##\s+(?!#)(.+)$/gm), (match) => stripTags(match[1])),
    ...Array.from(content.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi), (match) => stripTags(match[1])),
  ];
}

function extractFaqQuestions(content) {
  const visible = Array.from(content.matchAll(/^#{3,4}\s+(.+\?)\s*$/gm), (match) => stripTags(match[1]));
  const json = Array.from(content.matchAll(/"name"\s*:\s*"([^"]+\?)"/g), (match) => normalize(match[1]));
  return Array.from(new Set([...visible, ...json]));
}

function extractLinks(content) {
  const links = [];
  let match;
  const htmlRe = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = htmlRe.exec(content)) !== null) {
    links.push({ href: normalize(match[1]), anchor: stripTags(match[2]), index: match.index });
  }
  const mdRe = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  while ((match = mdRe.exec(content)) !== null) {
    links.push({ href: normalize(match[2]), anchor: stripTags(match[1]), index: match.index });
  }
  return links;
}

function normalizeInternalPath(href) {
  const raw = String(href || "").trim();
  if (!raw || raw.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(raw)) return "";
  let value = raw;
  try {
    if (/^https?:\/\//i.test(raw)) {
      const parsed = new URL(raw);
      if (parsed.hostname !== "www.finmaphub.com") return "";
      value = parsed.pathname;
    }
  } catch {
    return "";
  }
  if (!value.startsWith("/")) return "";
  value = value.split("#")[0].split("?")[0].replace(/\/{2,}/g, "/");
  if (value.startsWith("/ko/")) value = value.replace(/^\/ko/, "");
  if (value.length > 1 && value.endsWith("/")) value = value.slice(0, -1);
  return value;
}

function sectionForIndex(content, index) {
  const before = content.slice(0, index);
  const headings = [...before.matchAll(/^#{2,4}\s+(.+)$/gm)];
  return headings.length ? stripTags(headings[headings.length - 1][1]) : "intro";
}

function parsePostFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const category = rel(filePath).split("/")[2];
  const slug = path.basename(filePath).replace(/\.md$/, "");
  const id = `${category}/${slug}`;
  const postLinks = [];
  for (const link of extractLinks(parsed.content || "")) {
    const normalized = normalizeInternalPath(link.href);
    const targetId = urlToId(normalized);
    if (targetId) {
      postLinks.push({
        source: id,
        target: targetId,
        href: normalized,
        anchor: link.anchor,
        section: sectionForIndex(parsed.content || "", link.index),
      });
    }
  }
  return {
    id,
    filePath: rel(filePath),
    url: idToUrl(id),
    title: normalize(parsed.data.seoTitle || parsed.data.title || ""),
    description: normalize(parsed.data.seoDescription || parsed.data.description || ""),
    dateModified: dateValue(parsed.data.dateModified),
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
    canonical: normalize(parsed.data.canonical || ""),
    hreflangAlternates: JSON.stringify(parsed.data.hreflangAlternates || null),
    h1: normalize(parsed.data.title || parsed.data.seoTitle || ""),
    h2s: extractH2s(parsed.content || ""),
    faqQuestions: extractFaqQuestions(parsed.content || ""),
    sha256: crypto.createHash("sha256").update(raw, "utf8").digest("hex"),
    links: postLinks,
  };
}

function scanPosts() {
  const files = KO_CATEGORY_DIRS.flatMap((category) =>
    walkDir(path.join(POSTS_ROOT, category, "ko")).filter((file) => file.endsWith(".md"))
  ).sort();
  const posts = files.map(parsePostFile);
  const postIds = new Set(posts.map((post) => post.id));
  const edges = posts.flatMap((post) => post.links).filter((edge) => edge.source !== edge.target);
  const selfLinks = posts.flatMap((post) => post.links).filter((edge) => edge.source === edge.target);
  return { posts, postIds, edges, selfLinks };
}

function pairKey(source, target) {
  return `${source}::${target}`;
}

function edgeMap(edges) {
  const map = new Map();
  for (const edge of edges) {
    const key = pairKey(edge.source, edge.target);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(edge);
  }
  return map;
}

function computeCoverage(edges, opportunities) {
  const map = edgeMap(edges);
  const allowed = opportunities.filter((row) => row.status === "APPROVE" && ALLOWED_RELATIONSHIPS.has(row.relationship));
  const missing = allowed.filter((row) => !(map.get(pairKey(row.source, row.target)) || []).length);
  return {
    coreToSpokeMissing: missing.filter((row) => row.relationship === "CORE_TO_SPOKE").length,
    spokeToCoreMissing: missing.filter((row) => row.relationship === "SPOKE_TO_CORE").length,
    parentChildMissing: missing.filter((row) => row.relationship === "PARENT_TO_CHILD" || row.relationship === "CHILD_TO_PARENT").length,
  };
}

function snapshot() {
  const current = scanPosts();
  const step4 = fs.existsSync(STEP4_JSON) ? JSON.parse(fs.readFileSync(STEP4_JSON, "utf8")) : null;
  const opportunities = fs.existsSync(APPROVED_CSV) ? parseCsv(fs.readFileSync(APPROVED_CSV, "utf8")) : [];
  const out = {
    generatedAt: new Date().toISOString(),
    source: "batch_b_preedit_current_source",
    step4BeforeSummary: step4?.summary || {},
    coverageBeforeStep6B: computeCoverage(current.edges, opportunities),
    posts: current.posts.map((post) => ({
      id: post.id,
      filePath: post.filePath,
      title: post.title,
      description: post.description,
      dateModified: post.dateModified,
      tags: post.tags,
      canonical: post.canonical,
      hreflangAlternates: post.hreflangAlternates,
      h1: post.h1,
      h2s: post.h2s,
      faqQuestions: post.faqQuestions,
      sha256: post.sha256,
    })),
    edges: current.edges,
  };
  ensureDir(PREEDIT_JSON);
  fs.writeFileSync(PREEDIT_JSON, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    wrote: rel(PREEDIT_JSON),
    posts: out.posts.length,
    edges: out.edges.length,
    coverageBeforeStep6B: out.coverageBeforeStep6B,
  }, null, 2));
}

function readPreedit() {
  if (!fs.existsSync(PREEDIT_JSON)) {
    throw new Error(`Missing pre-edit snapshot. Run: node ${rel(__filename)} --write-preedit`);
  }
  return JSON.parse(fs.readFileSync(PREEDIT_JSON, "utf8"));
}

function classifyOpportunities(opportunities, beforeEdges, afterEdges) {
  const beforeMap = edgeMap(beforeEdges);
  const afterMap = edgeMap(afterEdges);
  const expected = new Set(EXPECTED_LINKS.map((item) => pairKey(item.source, item.target)));
  return opportunities.map((row) => {
    const key = pairKey(row.source, row.target);
    const before = beforeMap.get(key) || [];
    const after = afterMap.get(key) || [];
    let reconciliation = "REVIEW_REQUIRED";
    if (before.length) reconciliation = "ALREADY_SATISFIED";
    else if (row.relationship === "CROSS_CATEGORY") reconciliation = "DEFER_CROSS_CATEGORY";
    else if (!ALLOWED_RELATIONSHIPS.has(row.relationship)) reconciliation = "DEFER_OTHER_BATCH";
    else if (DEFERRED_OTHER_BATCH.has(row.relationship)) reconciliation = "DEFER_OTHER_BATCH";
    else if (after.length && expected.has(key)) reconciliation = "APPLY_NOW";
    else if (SKIP_DECISIONS.has(key)) reconciliation = SKIP_DECISIONS.get(key);
    else if (after.length) reconciliation = "APPLY_NOW";
    return {
      ...row,
      reconciliation,
      duplicateAfterCount: after.length,
      anchorsAfter: after.map((edge) => edge.anchor),
      sectionsAfter: after.map((edge) => edge.section),
    };
  });
}

function postDiffs(beforePosts, afterPosts) {
  const beforeById = new Map(beforePosts.map((post) => [post.id, post]));
  const diffs = [];
  for (const after of afterPosts) {
    const before = beforeById.get(after.id);
    if (!before) continue;
    const fields = ["title", "description", "h1", "canonical", "hreflangAlternates"];
    for (const field of fields) {
      if (JSON.stringify(before[field] || "") !== JSON.stringify(after[field] || "")) {
        diffs.push({ id: after.id, field, before: before[field] || "", after: after[field] || "" });
      }
    }
    if (JSON.stringify(before.h2s) !== JSON.stringify(after.h2s)) diffs.push({ id: after.id, field: "h2s", before: before.h2s, after: after.h2s });
    if (JSON.stringify(before.faqQuestions) !== JSON.stringify(after.faqQuestions)) {
      diffs.push({ id: after.id, field: "faqQuestions", before: before.faqQuestions, after: after.faqQuestions });
    }
    if (JSON.stringify(before.tags) !== JSON.stringify(after.tags)) diffs.push({ id: after.id, field: "tags", before: before.tags, after: after.tags });
  }
  return diffs;
}

function changedPosts(beforePosts, afterPosts) {
  const beforeById = new Map(beforePosts.map((post) => [post.id, post]));
  return afterPosts
    .filter((post) => beforeById.get(post.id)?.sha256 !== post.sha256)
    .map((post) => ({
      id: post.id,
      filePath: post.filePath,
      dateModified: post.dateModified,
      dateModifiedOk: post.dateModified === DATE_STAMP,
    }));
}

function brokenPostLinks(posts, postIds) {
  return posts.flatMap((post) =>
    post.links
      .filter((link) => !postIds.has(link.target))
      .map((link) => ({ source: post.id, target: link.target, href: link.href, anchor: link.anchor }))
  );
}

function exactAnchorStuffing(applied) {
  return applied.filter((item) => {
    const anchors = item.anchorsAfter.map((anchor) => normalize(anchor).toLowerCase()).filter(Boolean);
    if (!anchors.length) return false;
    return anchors.some((anchor) => anchors.filter((other) => other === anchor).length > 1);
  });
}

function step6ABoundary() {
  if (!fs.existsSync(STEP6A_JSON)) return { clearCount: 0, total: 0, ok: false };
  const data = JSON.parse(fs.readFileSync(STEP6A_JSON, "utf8"));
  const total = data.pairResults?.length || 0;
  const clearCount = (data.pairResults || []).filter((row) => row.result === "CLEAR").length;
  return { clearCount, total, ok: total === 7 && clearCount === 7 };
}

function mdEscape(value) {
  return String(value == null ? "" : value)
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>")
    .trim();
}

function mdTable(rows, columns) {
  const header = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => mdEscape(row[column.key])).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
}

function batchFVerifiedScope() {
  const empty = { allowedFiles: new Set(), verdict: "", active: false };
  if (!fs.existsSync(BATCH_F_JSON)) return empty;
  try {
    const data = JSON.parse(fs.readFileSync(BATCH_F_JSON, "utf8"));
    const validation = data.validation || {};
    const pass =
      String(data.finalVerdict || "").startsWith("PASS_100M") &&
      validation.pass === true &&
      validation.genericSupportingInboundViolations === 0 &&
      validation.brokenInternalLinks === 0 &&
      validation.duplicateTargetLinks === 0 &&
      validation.titleChanges === 0 &&
      validation.redirectChanges === 0 &&
      validation.canonicalChanges === 0 &&
      validation.noindexChanges === 0 &&
      validation.dateModifiedIssues === 0 &&
      validation.articleJsonLdDateIssues === 0;
    if (!pass) return { ...empty, verdict: data.finalVerdict || "" };
    return {
      active: true,
      verdict: data.finalVerdict || "",
      allowedFiles: new Set((data.details?.dateModifiedRows || []).map((row) => row.filePath).filter(Boolean)),
    };
  } catch {
    return empty;
  }
}

function batchGVerifiedScope() {
  const empty = { allowedFiles: new Set(), verdict: "", active: false };
  if (!fs.existsSync(BATCH_G_JSON)) return empty;
  try {
    const data = JSON.parse(fs.readFileSync(BATCH_G_JSON, "utf8"));
    const full = data.fullSiteHreflang || {};
    const structured = data.structuredData || {};
    const after = structured.afterState || {};
    const dca = data.dcaHub || {};
    const preservation = data.preservation || {};
    const pass =
      String(data.finalVerdict || "").startsWith("PASS_TECHNICAL_SEO_BATCH_G") &&
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
    if (!pass) return { ...empty, verdict: data.finalVerdict || "" };
    return {
      active: true,
      verdict: data.finalVerdict || "",
      allowedFiles: new Set([
        ...(data.hreflang?.candidates || []).map((row) => row.filePath),
        ...(structured.rows || []).map((row) => row.filePath),
      ].filter(Boolean)),
    };
  } catch {
    return empty;
  }
}

function main() {
  if (process.argv.includes("--write-preedit")) {
    snapshot();
    return;
  }

  const before = readPreedit();
  const after = scanPosts();
  const opportunities = parseCsv(fs.readFileSync(APPROVED_CSV, "utf8"));
  const reconciliation = classifyOpportunities(opportunities, before.edges, after.edges);
  const applied = reconciliation.filter((row) => row.reconciliation === "APPLY_NOW");
  const satisfied = reconciliation.filter((row) => row.reconciliation === "ALREADY_SATISFIED");
  const deferred = reconciliation.filter((row) => row.reconciliation.startsWith("DEFER"));
  const skipped = reconciliation.filter((row) => row.reconciliation === "SKIP_CONTEXT_NOT_NATURAL");
  const review = reconciliation.filter((row) => row.reconciliation === "REVIEW_REQUIRED");
  const batchFScope = batchFVerifiedScope();
  const batchGScope = batchGVerifiedScope();
  const modifiedPosts = changedPosts(before.posts, after.posts).filter(
    (row) => !batchFScope.allowedFiles.has(row.filePath) && !batchGScope.allowedFiles.has(row.filePath)
  );
  const structureDiffs = postDiffs(before.posts, after.posts).filter((row) => {
    const filePath = rel(idToFilePath(row.id));
    return !batchFScope.allowedFiles.has(filePath) && !batchGScope.allowedFiles.has(filePath);
  });
  const brokenLinks = brokenPostLinks(after.posts, after.postIds);
  const selfLinks = after.selfLinks;
  const beforeCoverage = before.coverageBeforeStep6B || computeCoverage(before.edges, opportunities);
  const afterCoverage = computeCoverage(after.edges, opportunities);
  const duplicateNewLinks = applied.filter((row) => row.duplicateAfterCount > 1);
  const stuffing = exactAnchorStuffing(applied);
  const step6a = step6ABoundary();

  const validation = {
    brokenInternalPostLinks: brokenLinks.length,
    invalidCategorySlugLinks: brokenLinks.length,
    selfLinks: selfLinks.length,
    duplicateNewContextualLinks: duplicateNewLinks.length,
    titleChanges: structureDiffs.filter((row) => row.field === "title").length,
    descriptionChanges: structureDiffs.filter((row) => row.field === "description").length,
    faqChanges: structureDiffs.filter((row) => row.field === "faqQuestions").length,
    h1Changes: structureDiffs.filter((row) => row.field === "h1").length,
    h2Changes: structureDiffs.filter((row) => row.field === "h2s").length,
    tagChanges: structureDiffs.filter((row) => row.field === "tags").length,
    canonicalHreflangChanges: structureDiffs.filter((row) => row.field === "canonical" || row.field === "hreflangAlternates").length,
    dateModifiedOk: modifiedPosts.every((row) => row.dateModifiedOk),
    exactAnchorStuffing: stuffing.length,
    step6ABoundaryClear: step6a.ok,
    batchFScopeActive: batchFScope.active,
    batchFScopeVerdict: batchFScope.verdict,
    batchFAllowedFileCount: batchFScope.allowedFiles.size,
    batchGScopeActive: batchGScope.active,
    batchGScopeVerdict: batchGScope.verdict,
    batchGAllowedFileCount: batchGScope.allowedFiles.size,
  };

  const hardFail =
    validation.brokenInternalPostLinks ||
    validation.selfLinks ||
    validation.duplicateNewContextualLinks ||
    validation.titleChanges ||
    validation.descriptionChanges ||
    validation.faqChanges ||
    validation.h1Changes ||
    validation.h2Changes ||
    validation.tagChanges ||
    validation.canonicalHreflangChanges ||
    !validation.dateModifiedOk ||
    validation.exactAnchorStuffing ||
    !validation.step6ABoundaryClear;

  const finalVerdict = hardFail ? "FAIL_TOPIC_LINK_REGRESSION" : review.length ? "PASS_TOPIC_LINK_BATCH_B_WITH_REVIEW_ITEMS" : "PASS_TOPIC_LINK_BATCH_B";
  const counts = {
    originalOpportunities: opportunities.length,
    APPLY_NOW: applied.length,
    ALREADY_SATISFIED: satisfied.length,
    DEFER: deferred.length,
    REVIEW_SKIP: review.length + skipped.length,
    REVIEW_REQUIRED: review.length,
    SKIP_CONTEXT_NOT_NATURAL: skipped.length,
  };

  const byFamily = {};
  for (const row of applied) {
    const key = row.sourceTopicFamily || row.targetTopicFamily || "UNKNOWN";
    if (!byFamily[key]) byFamily[key] = { applied: 0, relationships: {} };
    byFamily[key].applied += 1;
    byFamily[key].relationships[row.relationship] = (byFamily[key].relationships[row.relationship] || 0) + 1;
  }

  const output = {
    generatedAt: new Date().toISOString(),
    finalVerdict,
    opportunityReconciliation: counts,
    beforeMetrics: {
      step4Summary: before.step4BeforeSummary,
      coverage: beforeCoverage,
    },
    afterMetrics: {
      coverage: afterCoverage,
      explicitContextualPostLinks: after.edges.length,
    },
    appliedLinks: applied.map((row) => ({
      source: row.source,
      target: row.target,
      relationship: row.relationship,
      anchor: row.anchorsAfter[0] || "",
      section: row.sectionsAfter[0] || "",
      duplicate: row.duplicateAfterCount > 1,
    })),
    alreadySatisfied: satisfied.map((row) => ({ source: row.source, target: row.target, relationship: row.relationship })),
    deferred: deferred.map((row) => ({ source: row.source, target: row.target, relationship: row.relationship, reconciliation: row.reconciliation })),
    skipped: skipped.map((row) => ({ source: row.source, target: row.target, relationship: row.relationship, reconciliation: row.reconciliation })),
    reviewRequired: review.map((row) => ({ source: row.source, target: row.target, relationship: row.relationship })),
    modifiedPosts,
    topicFamilyImprovements: byFamily,
    parentChildResults: applied
      .filter((row) => row.relationship === "PARENT_TO_CHILD" || row.relationship === "CHILD_TO_PARENT")
      .map((row) => ({ source: row.source, target: row.target, relationship: row.relationship, anchor: row.anchorsAfter[0] || "" })),
    anchorQuality: {
      exactAnchorStuffingCount: stuffing.length,
      duplicateNewLinks,
      stuffing,
    },
    step6ABoundaryRegression: step6a,
    validation,
    structureDiffs,
    brokenLinks,
  };

  ensureDir(REPORT_JSON);
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  fs.writeFileSync(REPORT_MD, renderReport(output), "utf8");

  console.log(JSON.stringify({
    finalVerdict,
    opportunityReconciliation: counts,
    beforeCoverage,
    afterCoverage,
    modifiedPosts: modifiedPosts.length,
    validation,
    output: {
      md: rel(REPORT_MD),
      json: rel(REPORT_JSON),
    },
  }, null, 2));
}

function renderReport(output) {
  return `# FinMap KO Topic Links Batch B Verification

Generated: ${output.generatedAt}

## Final Verdict

${output.finalVerdict}

## Opportunity Reconciliation

- original opportunities: ${output.opportunityReconciliation.originalOpportunities}
- APPLY_NOW: ${output.opportunityReconciliation.APPLY_NOW}
- ALREADY_SATISFIED: ${output.opportunityReconciliation.ALREADY_SATISFIED}
- DEFER: ${output.opportunityReconciliation.DEFER}
- REVIEW/SKIP: ${output.opportunityReconciliation.REVIEW_SKIP}

## Applied Links

${mdTable(output.appliedLinks, [
  { key: "source", label: "Source" },
  { key: "target", label: "Target" },
  { key: "relationship", label: "Relationship" },
  { key: "anchor", label: "Anchor" },
  { key: "section", label: "Section/Context" },
  { key: "duplicate", label: "Duplicate" },
])}

## Modified Posts

${mdTable(output.modifiedPosts, [
  { key: "id", label: "Post" },
  { key: "filePath", label: "File" },
  { key: "dateModified", label: "dateModified" },
  { key: "dateModifiedOk", label: "OK" },
])}

## Topic Family Improvements

${mdTable(Object.entries(output.topicFamilyImprovements).map(([topicFamily, row]) => ({
  topicFamily,
  applied: row.applied,
  relationships: Object.entries(row.relationships).map(([key, value]) => `${key}:${value}`).join("; "),
})), [
  { key: "topicFamily", label: "Topic Family" },
  { key: "applied", label: "Applied" },
  { key: "relationships", label: "Relationships" },
])}

## Core -> Spoke Before / After

- before missing: ${output.beforeMetrics.coverage.coreToSpokeMissing}
- after missing: ${output.afterMetrics.coverage.coreToSpokeMissing}

## Spoke -> Core Before / After

- before missing: ${output.beforeMetrics.coverage.spokeToCoreMissing}
- after missing: ${output.afterMetrics.coverage.spokeToCoreMissing}

## Parent / Child Results

- before missing: ${output.beforeMetrics.coverage.parentChildMissing}
- after missing: ${output.afterMetrics.coverage.parentChildMissing}

${mdTable(output.parentChildResults, [
  { key: "source", label: "Source" },
  { key: "target", label: "Target" },
  { key: "relationship", label: "Relationship" },
  { key: "anchor", label: "Anchor" },
])}

## Anchor Quality Check

- duplicate new contextual links: ${output.anchorQuality.duplicateNewLinks.length}
- exact anchor stuffing count: ${output.anchorQuality.exactAnchorStuffingCount}

## Step 6A Boundary Regression Check

- clear pairs: ${output.step6ABoundaryRegression.clearCount}/${output.step6ABoundaryRegression.total}
- status: ${output.step6ABoundaryRegression.ok ? "PASS" : "FAIL"}

## Title / Meta Preservation Check

${mdTable(Object.entries(output.validation).map(([key, value]) => ({ key, value })), [
  { key: "key", label: "Check" },
  { key: "value", label: "Value" },
])}

## Deferred / Skipped

- deferred: ${output.deferred.length}
- skipped: ${output.skipped.length}
- review required: ${output.reviewRequired.length}

## Files Generated

- \`${rel(REPORT_MD)}\`
- \`${rel(REPORT_JSON)}\`
- \`${rel(PREEDIT_JSON)}\`
`;
}

main();
