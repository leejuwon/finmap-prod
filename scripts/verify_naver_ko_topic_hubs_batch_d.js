const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const matter = require("gray-matter");

const ROOT = process.cwd();
const DATE_STAMP = "2026-09-16";
const POSTS_ROOT = path.join(ROOT, "content", "posts");
const REPORT_DIR = path.join(ROOT, "reports");

const PREEDIT_JSON = path.join(REPORT_DIR, `naver-ko-topic-hubs-batch-d-preedit-${DATE_STAMP}.json`);
const REPORT_JSON = path.join(REPORT_DIR, `naver-ko-topic-hubs-batch-d-${DATE_STAMP}.json`);
const REPORT_MD = path.join(REPORT_DIR, `naver-ko-topic-hubs-batch-d-${DATE_STAMP}.md`);
const LINK_MAP_CSV = path.join(REPORT_DIR, `naver-ko-topic-hub-link-map-${DATE_STAMP}.csv`);

const STEP6A_JSON = path.join(REPORT_DIR, `naver-ko-query-boundary-batch-a-${DATE_STAMP}.json`);
const STEP6B_JSON = path.join(REPORT_DIR, `naver-ko-topic-links-batch-b-${DATE_STAMP}.json`);
const STEP6C_JSON = path.join(REPORT_DIR, `naver-ko-cross-category-links-batch-c-${DATE_STAMP}.json`);
const BATCH_F_DATE_STAMP = "2026-09-17";
const BATCH_F_JSON = path.join(REPORT_DIR, `naver-ko-100m-cannibalization-batch-f-${BATCH_F_DATE_STAMP}.json`);
const BATCH_G_DATE_STAMP = "2026-09-17";
const BATCH_G_JSON = path.join(REPORT_DIR, `naver-ko-technical-seo-batch-g-${BATCH_G_DATE_STAMP}.json`);

const KO_CATEGORY_DIRS = ["economicInfo", "investingInfo", "personalFinance"];
const SITE_URL = "https://www.finmaphub.com";
const DCA_HUB = "personalFinance/dca-guide";
const HOUSEHOLD_HUB = "personalFinance/personal-finance-guide";

const DCA_PRIMARY_SPOKES = [
  {
    id: "personalFinance/dca-vs-lumpsum-decision-rules",
    ownedQuery: "적립식 투자 vs 일시금 선택",
    role: "choice_decision_rules",
  },
  {
    id: "personalFinance/dca-vs-lump-sum-when-results-differ",
    ownedQuery: "적립식 투자 거치식 결과 차이",
    role: "result_path_difference",
  },
  {
    id: "personalFinance/is-dca-better-in-bear-market",
    ownedQuery: "하락장 적립식 투자",
    role: "bear_market_scenario",
  },
  {
    id: "personalFinance/dca-step-up-ruleset",
    ownedQuery: "적립식 투자 증액 전략",
    role: "contribution_step_up_rules",
  },
  {
    id: "personalFinance/dca-fx-volatility-decomposition",
    ownedQuery: "적립식 투자 환율 변동성 영향",
    role: "fx_volatility_decomposition",
  },
  {
    id: "personalFinance/monthly-dca-10-year-result",
    ownedQuery: "월 적립식 투자 10년 결과",
    role: "long_run_monthly_example",
  },
  {
    id: "personalFinance/how-much-monthly-invest-for-100m",
    ownedQuery: "1억원 만들기 월 투자금",
    role: "goal_amount_monthly_input",
  },
  {
    id: "personalFinance/monthly-investment-for-100m-table",
    ownedQuery: "목표금액별 월 투자금 표",
    role: "goal_amount_table",
  },
  {
    id: "investingInfo/dca-consistency-7-fail-patterns",
    ownedQuery: "적립식 투자 실패 패턴",
    role: "execution_failure_patterns",
  },
];

const DCA_AUX_EXCLUDED_FROM_PRIMARY_NAV = "personalFinance/how-much-per-month-for-100m";

const HOUSEHOLD_FINANCE = {
  core: "personalFinance/personal-finance-3pillars",
  starter: "personalFinance/personal-start-5steps",
  spokes: [
    "personalFinance/personal-start-5steps",
    "personalFinance/emergency-fund-by-risk",
    "personalFinance/goal-amount-fast-strategy",
    "personalFinance/high-rate-debt-vs-invest-threshold-rule",
    "personalFinance/inflation-household-survival-strategy",
  ],
  deferReasons: [
    "The broad household-finance query is close to personalFinance/personal-finance-3pillars.",
    "Step 6A already separated personal-start-5steps from personal-finance-3pillars.",
    "A new personal-finance-guide hub could blur the beginner-sequence vs framework boundary.",
  ],
};

const CORE_GROUPS = [
  {
    key: "DSR_LTV",
    mode: "group_core",
    cores: ["personalFinance/dsr-40-income-loan-limit-table", "personalFinance/ltv-dsr-calculator-guide"],
    spokes: [
      "personalFinance/interest-rate-1p-loan-limit-impact",
      "personalFinance/salary-40m-mortgage-limit",
      "personalFinance/salary-50m-dsr-40-loan-limit",
      "personalFinance/mortgage-risk-checklist-dsr-variable",
      "personalFinance/dsr-pass-ltv-cash-bottleneck",
    ],
  },
  {
    key: "REAL_ESTATE_BUDGET",
    mode: "single_core",
    cores: ["personalFinance/apartment-buying-calculator-guide"],
    spokes: [
      "personalFinance/apartment-buying-costs-before-purchase",
      "personalFinance/cash-100m-200m-300m-apartment-budget",
      "personalFinance/first-home-buyer-budget-calculation",
      "personalFinance/jeonse-to-home-purchase-cash-needed",
      "personalFinance/rent-jeonse-buy-cashflow-opportunity-cost",
    ],
  },
  {
    key: "REAL_ESTATE_DATA",
    mode: "single_core",
    cores: ["personalFinance/apt-dashboard-home-goal-roadmap"],
    spokes: [
      "investingInfo/rates-discount-mortgage-demand-apt-prices",
      "investingInfo/seoul-gyeonggi-incheon-risk-budget-framework",
      "personalFinance/apartment-transaction-volume-decline-meaning",
      "personalFinance/how-to-read-apartment-transaction-prices",
      "personalFinance/large-apartment-complex-households-price-stability",
    ],
  },
];

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

function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = stableJson(value[key]);
      return acc;
    }, {});
  }
  return value;
}

function dateValue(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function idToFilePath(id, lang = "ko") {
  const [category, slug] = id.split("/");
  return path.join(POSTS_ROOT, category, lang, `${slug}.md`);
}

function idToRelFilePath(id, lang = "ko") {
  return rel(idToFilePath(id, lang));
}

function idToUrl(id) {
  const [category, slug] = id.split("/");
  return `/posts/${category}/${slug}`;
}

function idToEnUrl(id) {
  const [category, slug] = id.split("/");
  return `/en/posts/${category}/${slug}`;
}

function urlToId(url) {
  const match = String(url || "").match(/^\/posts\/([^/]+)\/([^/?#]+)$/);
  return match ? `${match[1]}/${match[2]}` : "";
}

function normalizeInternalPath(href) {
  const raw = String(href || "").trim();
  if (!raw || raw.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(raw)) return "";
  let value = raw;
  try {
    if (/^https?:\/\//i.test(raw)) {
      const parsed = new URL(raw);
      if (parsed.hostname !== "www.finmaphub.com" && parsed.hostname !== "finmaphub.com") return "";
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

function extractHeading(content, level) {
  return [
    ...Array.from(content.matchAll(new RegExp(`^#{${level}}\\s+(.+)$`, "gm")), (match) => stripTags(match[1])),
    ...Array.from(content.matchAll(new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, "gi")), (match) =>
      stripTags(match[1])
    ),
  ];
}

function extractFaqQuestions(content) {
  const visible = Array.from(content.matchAll(/^#{3,4}\s+(.+\?)\s*$/gm), (match) => stripTags(match[1]));
  const json = Array.from(content.matchAll(/"name"\s*:\s*"([^"]+\?)"/g), (match) => normalize(match[1]));
  return Array.from(new Set([...visible, ...json]));
}

function extractJsonLdBlocks(raw) {
  return Array.from(
    raw.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    (match) => match[1]
  );
}

function jsonLdTypes(raw) {
  return extractJsonLdBlocks(raw).flatMap((block) => {
    try {
      const parsed = JSON.parse(block);
      if (Array.isArray(parsed)) return parsed.map((item) => item && item["@type"]).filter(Boolean);
      return [parsed && parsed["@type"]].filter(Boolean);
    } catch {
      return ["UNPARSEABLE"];
    }
  });
}

function normalizeSchemaBlock(block) {
  const masked = String(block || "")
    .replace(/"dateModified"\s*:\s*"[^"]*"/g, '"dateModified":"__DATE_MODIFIED__"')
    .replace(/"dateModified"\s*:\s*[^,\n\r}]+/g, '"dateModified":"__DATE_MODIFIED__"');
  try {
    return JSON.stringify(stableJson(JSON.parse(masked)));
  } catch {
    return normalize(masked);
  }
}

function sectionForIndex(content, index) {
  const before = content.slice(0, index);
  const mdHeadings = [...before.matchAll(/^#{2,4}\s+(.+)$/gm)].map((match) => ({
    index: match.index,
    title: stripTags(match[1]),
  }));
  const htmlHeadings = [...before.matchAll(/<h[2-4]\b[^>]*>([\s\S]*?)<\/h[2-4]>/gi)].map((match) => ({
    index: match.index,
    title: stripTags(match[1]),
  }));
  const headings = [...mdHeadings, ...htmlHeadings].sort((a, b) => a.index - b.index);
  return headings.length ? headings[headings.length - 1].title : "intro";
}

function classifyLink(normalizedHref, targetId) {
  if (normalizedHref.startsWith("/tools/")) return "TOOL_LINK";
  if (normalizedHref.startsWith("/market/")) return "MARKET_LINK";
  if (targetId) return "POST_LINK";
  return "OTHER_INTERNAL_LINK";
}

function plainText(content) {
  return stripTags(
    String(content || "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#>*_\-|`{}[\]():]/g, " ")
  );
}

function parsePostFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const fileRel = rel(filePath);
  const parts = fileRel.split("/");
  const category = parts[2];
  const slug = path.basename(filePath).replace(/\.md$/, "");
  const id = `${category}/${slug}`;
  const links = [];

  for (const link of extractLinks(parsed.content || "")) {
    const normalizedHref = normalizeInternalPath(link.href);
    if (!normalizedHref) continue;
    const targetId = urlToId(normalizedHref);
    links.push({
      source: id,
      sourceFile: fileRel,
      href: normalizedHref,
      target: targetId,
      anchor: link.anchor,
      section: sectionForIndex(parsed.content || "", link.index),
      linkType: classifyLink(normalizedHref, targetId),
    });
  }

  return {
    id,
    filePath: fileRel,
    category,
    slug,
    raw,
    content: parsed.content || "",
    data: parsed.data || {},
    link: normalize(parsed.data.link || ""),
    lang: normalize(parsed.data.lang || ""),
    title: normalize(parsed.data.seoTitle || parsed.data.title || ""),
    frontmatterTitle: normalize(parsed.data.title || ""),
    description: normalize(parsed.data.seoDescription || parsed.data.description || ""),
    datePublished: dateValue(parsed.data.datePublished),
    dateModified: dateValue(parsed.data.dateModified),
    canonical: normalize(parsed.data.canonical || ""),
    hreflangEquivalent: parsed.data.hreflangEquivalent,
    hreflangAlternates: JSON.stringify(parsed.data.hreflangAlternates || null),
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
    h1s: extractHeading(parsed.content || "", 1),
    h2s: extractHeading(parsed.content || "", 2),
    h3s: extractHeading(parsed.content || "", 3),
    faqQuestions: extractFaqQuestions(parsed.content || ""),
    jsonLdTypes: jsonLdTypes(raw),
    schemaStructuralSignatures: extractJsonLdBlocks(raw).map(normalizeSchemaBlock),
    plainText: plainText(parsed.content || ""),
    links,
    sha256: crypto.createHash("sha256").update(raw, "utf8").digest("hex"),
  };
}

function scanPosts() {
  const files = KO_CATEGORY_DIRS.flatMap((category) =>
    walkDir(path.join(POSTS_ROOT, category, "ko")).filter((file) => file.endsWith(".md"))
  ).sort();
  const posts = files.map(parsePostFile);
  const postIds = new Set(posts.map((post) => post.id));
  const allLinks = posts.flatMap((post) => post.links);
  const postEdges = allLinks.filter((link) => link.target);
  const brokenPostLinks = postEdges.filter((link) => !postIds.has(link.target));
  const selfLinks = postEdges.filter((link) => link.source === link.target);
  return { posts, postIds, allLinks, postEdges, brokenPostLinks, selfLinks };
}

function postsById(posts) {
  return new Map(posts.map((post) => [post.id, post]));
}

function compactPost(post) {
  return {
    id: post.id,
    filePath: post.filePath,
    title: post.title,
    description: post.description,
    dateModified: post.dateModified,
    canonical: post.canonical,
    hreflangEquivalent: post.hreflangEquivalent,
    hreflangAlternates: post.hreflangAlternates,
    tags: post.tags,
    h1s: post.h1s,
    h2s: post.h2s,
    h3s: post.h3s,
    faqQuestions: post.faqQuestions,
    schemaStructuralSignatures: post.schemaStructuralSignatures,
    sha256: post.sha256,
  };
}

function snapshot() {
  const current = scanPosts();
  const out = {
    generatedAt: new Date().toISOString(),
    source: "batch_d_preedit_current_source_after_batch_c",
    posts: current.posts.map(compactPost),
    allLinks: current.allLinks,
    postEdges: current.postEdges,
    graph: {
      totalKoPosts: current.posts.length,
      totalInternalLinks: current.allLinks.length,
      totalPostLinks: current.postEdges.length,
      brokenPostLinks: current.brokenPostLinks.length,
      selfLinks: current.selfLinks.length,
    },
  };
  ensureDir(PREEDIT_JSON);
  fs.writeFileSync(PREEDIT_JSON, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(
    JSON.stringify(
      {
        wrote: rel(PREEDIT_JSON),
        posts: out.graph.totalKoPosts,
        postLinks: out.graph.totalPostLinks,
        brokenPostLinks: out.graph.brokenPostLinks,
      },
      null,
      2
    )
  );
}

function readPreedit() {
  if (!fs.existsSync(PREEDIT_JSON)) {
    throw new Error(`Missing pre-edit snapshot. Run: node ${rel(__filename)} --write-preedit`);
  }
  return JSON.parse(fs.readFileSync(PREEDIT_JSON, "utf8"));
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

function postDiffs(beforePosts, afterPosts) {
  const beforeById = postsById(beforePosts);
  const diffs = [];
  for (const after of afterPosts) {
    const before = beforeById.get(after.id);
    if (!before) continue;
    const scalarFields = ["title", "description", "canonical", "hreflangAlternates"];
    for (const field of scalarFields) {
      if (JSON.stringify(before[field] || "") !== JSON.stringify(after[field] || "")) {
        diffs.push({ id: after.id, field, before: before[field] || "", after: after[field] || "" });
      }
    }
    if (JSON.stringify(before.hreflangEquivalent ?? null) !== JSON.stringify(after.hreflangEquivalent ?? null)) {
      diffs.push({ id: after.id, field: "hreflangEquivalent", before: before.hreflangEquivalent, after: after.hreflangEquivalent });
    }
    const arrayFields = ["h1s", "h2s", "h3s", "faqQuestions", "tags", "schemaStructuralSignatures"];
    for (const field of arrayFields) {
      if (JSON.stringify(before[field] || []) !== JSON.stringify(after[field] || [])) {
        diffs.push({ id: after.id, field, before: before[field] || [], after: after[field] || [] });
      }
    }
  }
  return diffs;
}

function changedPosts(beforePosts, afterPosts) {
  const beforeById = postsById(beforePosts);
  return afterPosts
    .filter((post) => beforeById.get(post.id)?.sha256 !== post.sha256)
    .map((post) => ({
      id: post.id,
      filePath: post.filePath,
      changeType: beforeById.has(post.id) ? "MODIFIED_EXISTING" : "NEW_POST",
      dateModified: post.dateModified,
      dateModifiedOk: post.dateModified === DATE_STAMP,
    }));
}

function linkCount(post, targetId) {
  if (!post) return 0;
  return post.links.filter((link) => link.target === targetId).length;
}

function linkRows(post, targetId) {
  if (!post) return [];
  return post.links.filter((link) => link.target === targetId);
}

function duplicateTargetRows(posts, ids) {
  const idSet = new Set(ids);
  const rows = [];
  for (const post of posts.filter((item) => idSet.has(item.id))) {
    const counts = {};
    for (const link of post.links.filter((item) => item.target)) {
      counts[link.target] = (counts[link.target] || 0) + 1;
    }
    for (const [target, count] of Object.entries(counts)) {
      if (count > 1) rows.push({ source: post.id, target, count });
    }
  }
  return rows;
}

function countPhrase(text, phrase) {
  if (!phrase) return 0;
  return String(text || "").split(phrase).length - 1;
}

function dcaHubDecision(afterById) {
  const hub = afterById.get(DCA_HUB);
  if (!hub) {
    return {
      decision: "BLOCKED_MISSING_DCA_HUB",
      url: idToUrl(DCA_HUB),
      exists: false,
      checks: { exists: false },
      hubToSpoke: [],
      spokeToHub: [],
      cannibalization: [],
    };
  }

  const primaryUrl = idToUrl(DCA_HUB);
  const hubToSpoke = DCA_PRIMARY_SPOKES.map((spoke) => {
    const count = linkCount(hub, spoke.id);
    return {
      source: DCA_HUB,
      target: spoke.id,
      role: spoke.role,
      ownedQuery: spoke.ownedQuery,
      count,
      status: count === 1 ? "PASS" : count > 1 ? "DUPLICATE_REVIEW" : "MISSING",
      anchor: linkRows(hub, spoke.id)[0]?.anchor || "",
      section: linkRows(hub, spoke.id)[0]?.section || "",
    };
  });

  const spokeToHub = DCA_PRIMARY_SPOKES.map((spoke) => {
    const source = afterById.get(spoke.id);
    const rows = linkRows(source, DCA_HUB);
    return {
      source: spoke.id,
      target: DCA_HUB,
      role: spoke.role,
      count: rows.length,
      status: rows.length === 1 ? "PASS" : rows.length > 1 ? "DUPLICATE_REVIEW" : "MISSING",
      anchor: rows[0]?.anchor || "",
      section: rows[0]?.section || "",
    };
  });

  const exactAnchorCounts = spokeToHub.reduce((acc, row) => {
    const key = normalize(row.anchor).toLowerCase();
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const repeatedReverseAnchors = Object.entries(exactAnchorCounts)
    .filter(([, count]) => count > 1)
    .map(([anchor, count]) => ({ anchor, count }));

  const auxExcludedCount = linkCount(hub, DCA_AUX_EXCLUDED_FROM_PRIMARY_NAV);
  const nonLinkTextChars = plainText(hub.content.replace(/\[[^\]]+\]\([^)]+\)/g, " ")).length;
  const articleJsonLdCount = hub.jsonLdTypes.filter((type) => String(type).toLowerCase() === "article").length;
  const faqJsonLdCount = hub.jsonLdTypes.filter((type) => String(type).toLowerCase() === "faqpage").length;
  const expectedH2s = [
    "적립식 투자(DCA)는 무엇인가",
    "DCA와 일시금 투자는 무엇이 다른가",
    "월 투자금은 어떻게 정할까",
    "하락장에도 계속해야 할까",
    "해외자산 DCA에서 환율은 어떻게 볼까",
    "장기 적립식 결과는 어떻게 달라질까",
    "DCA를 실패하게 만드는 실행 패턴",
    "직접 계산해 보기",
  ];
  const h2Joined = hub.h2s.join(" ");

  const cannibalization = DCA_PRIMARY_SPOKES.map((spoke) => {
    const phraseCount = countPhrase(hub.plainText, spoke.ownedQuery);
    const titleHit = normalize(hub.title).includes(spoke.ownedQuery);
    const deepOwnershipRisk = phraseCount > 2 || titleHit;
    return {
      hub: DCA_HUB,
      spoke: spoke.id,
      ownedQuery: spoke.ownedQuery,
      hubPhraseCount: phraseCount,
      hubTitleHit: titleHit,
      conflict: deepOwnershipRisk ? 1 : 0,
      status: deepOwnershipRisk ? "REVIEW" : "CLEAR",
    };
  });

  const checks = {
    exists: true,
    slug: hub.slug === "dca-guide",
    link: hub.link === primaryUrl,
    url: primaryUrl,
    lang: hub.lang === "ko",
    datePublished: hub.datePublished === DATE_STAMP,
    dateModified: hub.dateModified === DATE_STAMP,
    hreflangEquivalentFalse: hub.hreflangEquivalent === false,
    canonicalSafe: !hub.canonical || hub.canonical === `${SITE_URL}${primaryUrl}`,
    noEnglishFile: !fs.existsSync(idToFilePath(DCA_HUB, "en")),
    noManualArticleSchema: articleJsonLdCount === 0,
    manualFaqSchemaCount: faqJsonLdCount,
    h2Count: hub.h2s.length,
    expectedH2sPresent: expectedH2s.filter((h2) => h2Joined.includes(h2)).length,
    plainTextChars: hub.plainText.length,
    nonLinkTextChars,
    hubToSpokePass: hubToSpoke.filter((row) => row.status === "PASS").length,
    spokeToHubPass: spokeToHub.filter((row) => row.status === "PASS").length,
    auxExcludedFromPrimaryNav: auxExcludedCount === 0,
    duplicateHubTargets: duplicateTargetRows([hub], [DCA_HUB]).length,
    repeatedReverseAnchorCount: repeatedReverseAnchors.length,
    cannibalizationConflicts: cannibalization.reduce((sum, row) => sum + row.conflict, 0),
  };

  const technicalPass =
    checks.slug &&
    checks.link &&
    checks.lang &&
    checks.datePublished &&
    checks.dateModified &&
    checks.hreflangEquivalentFalse &&
    checks.canonicalSafe &&
    checks.noEnglishFile &&
    checks.noManualArticleSchema &&
    checks.h2Count >= 8 &&
    checks.expectedH2sPresent >= 8 &&
    checks.plainTextChars >= 3000 &&
    checks.nonLinkTextChars >= 2500 &&
    checks.hubToSpokePass === DCA_PRIMARY_SPOKES.length &&
    checks.spokeToHubPass === DCA_PRIMARY_SPOKES.length &&
    checks.auxExcludedFromPrimaryNav &&
    checks.duplicateHubTargets === 0 &&
    checks.repeatedReverseAnchorCount === 0 &&
    checks.cannibalizationConflicts === 0;

  return {
    decision: technicalPass ? "DEDICATED_HUB_CREATED" : "DEDICATED_HUB_REVIEW_REQUIRED",
    url: primaryUrl,
    primaryRole: "broad_dca_overview_navigation_decision_framework",
    exists: true,
    checks,
    repeatedReverseAnchors,
    hubToSpoke,
    spokeToHub,
    cannibalization,
  };
}

function householdDecision(afterById) {
  const householdHubExists = fs.existsSync(idToFilePath(HOUSEHOLD_HUB, "ko"));
  const core = afterById.get(HOUSEHOLD_FINANCE.core);
  const coreLinks = HOUSEHOLD_FINANCE.spokes.map((target) => ({
    source: HOUSEHOLD_FINANCE.core,
    target,
    count: linkCount(core, target),
    status: linkCount(core, target) > 0 ? "PASS" : "MISSING",
  }));
  const starterLinkCount = linkCount(core, HOUSEHOLD_FINANCE.starter);
  const coreReinforced = coreLinks.every((row) => row.status === "PASS");
  return {
    decision: householdHubExists ? "REVIEW_UNEXPECTED_HUB_CREATED" : "HOUSEHOLD_HUB_DEFERRED",
    dedicatedHubPath: idToRelFilePath(HOUSEHOLD_HUB),
    reasons: HOUSEHOLD_FINANCE.deferReasons,
    existingCore: HOUSEHOLD_FINANCE.core,
    starterBoundaryGuard: {
      coreToStarterLinks: starterLinkCount,
      status: starterLinkCount > 0 ? "CLEAR" : "REVIEW",
    },
    coreReinforcement: {
      status: coreReinforced ? "PASS" : "REVIEW_MISSING_SPOKES",
      links: coreLinks,
    },
  };
}

function coreGroupCoverage(afterById) {
  return CORE_GROUPS.map((group) => {
    const rows = group.spokes.map((target) => {
      const sourceRows = group.cores.map((source) => {
        const sourcePost = afterById.get(source);
        return {
          source,
          target,
          count: linkCount(sourcePost, target),
          anchor: linkRows(sourcePost, target)[0]?.anchor || "",
          section: linkRows(sourcePost, target)[0]?.section || "",
        };
      });
      const total = sourceRows.reduce((sum, row) => sum + row.count, 0);
      return {
        target,
        totalCoreLinks: total,
        status: total > 0 ? "PASS" : "MISSING",
        sources: sourceRows,
      };
    });
    return {
      key: group.key,
      mode: group.mode,
      cores: group.cores,
      spokes: group.spokes,
      status: rows.every((row) => row.status === "PASS") ? "ALREADY_SATISFIED_OR_REINFORCED" : "REVIEW_MISSING_LINKS",
      rows,
    };
  });
}

function readOptionalJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function step6ARegression() {
  const data = readOptionalJson(STEP6A_JSON);
  if (!data) return { ok: false, finalVerdict: "MISSING", clearCount: 0, total: 0 };
  const total = data.pairResults?.length || 0;
  const clearCount = (data.pairResults || []).filter((row) => row.result === "CLEAR").length;
  return {
    ok: String(data.finalVerdict || "").startsWith("PASS") && total === 7 && clearCount === 7,
    finalVerdict: data.finalVerdict || "",
    clearCount,
    total,
    validation: data.validation || {},
  };
}

function step6BRegression() {
  const data = readOptionalJson(STEP6B_JSON);
  if (!data) return { ok: false, finalVerdict: "MISSING" };
  const validation = data.validation || {};
  const ok =
    String(data.finalVerdict || "").startsWith("PASS_TOPIC_LINK_BATCH_B") &&
    validation.brokenInternalPostLinks === 0 &&
    validation.selfLinks === 0 &&
    validation.duplicateNewContextualLinks === 0 &&
    validation.titleChanges === 0 &&
    validation.descriptionChanges === 0 &&
    validation.faqChanges === 0 &&
    validation.h1Changes === 0 &&
    validation.h2Changes === 0 &&
    validation.tagChanges === 0 &&
    validation.canonicalHreflangChanges === 0 &&
    validation.dateModifiedOk === true &&
    validation.exactAnchorStuffing === 0 &&
    validation.step6ABoundaryClear === true;
  return { ok, finalVerdict: data.finalVerdict || "", validation };
}

function step6CRegression() {
  const data = readOptionalJson(STEP6C_JSON);
  if (!data) return { ok: false, finalVerdict: "MISSING" };
  const validation = data.preservationCheck?.validation || {};
  const ok =
    String(data.finalVerdict || "").startsWith("PASS_CROSS_CATEGORY_BATCH_C") &&
    validation.brokenInternalPostLinks === 0 &&
    validation.selfLinks === 0 &&
    validation.duplicateNewContextualLinks === 0 &&
    validation.titleChanges === 0 &&
    validation.descriptionChanges === 0 &&
    validation.faqChanges === 0 &&
    validation.h1Changes === 0 &&
    validation.h2Changes === 0 &&
    validation.h3Changes === 0 &&
    validation.tagChanges === 0 &&
    validation.canonicalHreflangChanges === 0 &&
    validation.schemaStructuralChanges === 0 &&
    validation.marketLinkAdditions === 0 &&
    validation.toolLinkAdditions === 0 &&
    validation.relatedBlockAppliedLinks === 0 &&
    validation.dateModifiedOk === true &&
    validation.exactAnchorStuffing === 0 &&
    validation.step6ABoundaryClear === true &&
    validation.step6BRegressionOk === true;
  return { ok, finalVerdict: data.finalVerdict || "", validation };
}

function readTextIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function extractLocSet(xml) {
  return new Set([...String(xml || "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
}

function gitHeadText(filePath) {
  try {
    return execFileSync("git", ["show", `HEAD:${filePath.replace(/\\/g, "/")}`], { cwd: ROOT, encoding: "utf8" });
  } catch {
    return "";
  }
}

function compareSitemapUrlSet(filePath) {
  const current = extractLocSet(readTextIfExists(path.join(ROOT, filePath)));
  const previousText = gitHeadText(filePath);
  const previous = extractLocSet(previousText);
  const drops = [...previous].filter((url) => !current.has(url));
  const additions = [...current].filter((url) => !previous.has(url));
  return {
    filePath,
    previousCount: previous.size,
    currentCount: current.size,
    drops,
    additions,
  };
}

function sitemapCheck() {
  const ko = readTextIfExists(path.join(ROOT, "public", "sitemap-ko.xml"));
  const root = readTextIfExists(path.join(ROOT, "public", "sitemap-0.xml"));
  const en = [
    readTextIfExists(path.join(ROOT, "public", "sitemap-en.xml")),
    readTextIfExists(path.join(ROOT, "public", "en", "sitemap.xml")),
  ].join("\n");
  const hubKoAbs = `${SITE_URL}${idToUrl(DCA_HUB)}`;
  const hubEnAbs = `${SITE_URL}${idToEnUrl(DCA_HUB)}`;
  const koEntry = [ko, root].join("\n");
  const hubIndex = koEntry.indexOf(`<loc>${hubKoAbs}</loc>`);
  const entrySlice = hubIndex >= 0 ? koEntry.slice(hubIndex, koEntry.indexOf("</url>", hubIndex) + 6) : "";
  const urlSetComparison = [
    compareSitemapUrlSet("public/sitemap-ko.xml"),
    compareSitemapUrlSet("public/sitemap-0.xml"),
    compareSitemapUrlSet("public/sitemap-en.xml"),
    compareSitemapUrlSet("public/en/sitemap.xml"),
  ];
  const oldUrlDropCount = urlSetComparison.reduce((sum, row) => sum + row.drops.length, 0);
  const koAdditions = urlSetComparison
    .filter((row) => row.filePath === "public/sitemap-ko.xml" || row.filePath === "public/sitemap-0.xml")
    .flatMap((row) => row.additions);
  const enAdditions = urlSetComparison
    .filter((row) => row.filePath === "public/sitemap-en.xml" || row.filePath === "public/en/sitemap.xml")
    .flatMap((row) => row.additions);
  const expectedNewKoUrlOnly =
    koAdditions.length === 2 && koAdditions.every((url) => url === hubKoAbs) && enAdditions.length === 0;
  return {
    koSitemapExists: Boolean(ko),
    rootSitemapExists: Boolean(root),
    enSitemapExists: Boolean(en.trim()),
    dcaHubInKoSitemap: ko.includes(hubKoAbs) || root.includes(hubKoAbs),
    dcaHubInEnSitemap: en.includes(hubEnAbs) || root.includes(hubEnAbs),
    dcaHubHasFalseEnAlternate: entrySlice.includes('hreflang="en"') && entrySlice.includes(hubEnAbs),
    dcaHubSelfKoAlternate: entrySlice.includes('hreflang="ko"') && entrySlice.includes(hubKoAbs),
    oldUrlDropCount,
    expectedNewKoUrlOnly,
    unexpectedEnDcaUrlCount: [en, root].filter((text) => text.includes(hubEnAbs)).length,
    urlSetComparison,
    entry: entrySlice.replace(/\s+/g, " ").trim(),
  };
}

function rssCheck(posts) {
  const eligible = posts
    .filter((post) => !post.data.draft && !post.data.noindex && post.lang === "ko")
    .sort((a, b) => {
      const ad = a.dateModified || a.datePublished || "1970-01-01";
      const bd = b.dateModified || b.datePublished || "1970-01-01";
      return bd.localeCompare(ad);
    })
    .slice(0, 50);
  return {
    rssRouteExists: fs.existsSync(path.join(ROOT, "pages", "rss.xml.js")),
    simulatedLatest50IncludesDcaHub: eligible.some((post) => post.id === DCA_HUB),
    latest50Count: eligible.length,
    dcaHubRank: eligible.findIndex((post) => post.id === DCA_HUB) + 1,
  };
}

function csvEscape(value) {
  const text = String(value == null ? "" : value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(rows) {
  const columns = ["scope", "source", "target", "anchor", "section", "status"];
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ];
  ensureDir(LINK_MAP_CSV);
  fs.writeFileSync(LINK_MAP_CSV, `${lines.join("\n")}\n`, "utf8");
}

function mdEscape(value) {
  return String(value == null ? "" : value)
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>")
    .trim();
}

function mdTable(rows, columns) {
  if (!rows.length) return "- None";
  const header = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => mdEscape(row[column.key])).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
}

function renderReport(output) {
  const validationRows = Object.entries(output.validation).map(([key, value]) => ({
    key,
    value: Array.isArray(value) ? JSON.stringify(value) : value,
  }));
  return `# FinMap KO Topic Hubs Batch D Verification

Generated: ${output.generatedAt}

## Final Verdict

${output.finalVerdict}

## DCA Hub Decision

- decision: ${output.dcaHub.decision}
- url: ${output.dcaHub.url}
- primary role: ${output.dcaHub.primaryRole || ""}

## DCA Hub Checks

${mdTable(Object.entries(output.dcaHub.checks || {}).map(([key, value]) => ({ key, value })), [
  { key: "key", label: "Check" },
  { key: "value", label: "Value" },
])}

## DCA Hub -> Spoke Coverage

${mdTable(output.dcaHub.hubToSpoke || [], [
  { key: "target", label: "Target" },
  { key: "ownedQuery", label: "Owned Query" },
  { key: "anchor", label: "Anchor" },
  { key: "section", label: "Section" },
  { key: "status", label: "Status" },
])}

## Spoke -> DCA Hub Coverage

${mdTable(output.dcaHub.spokeToHub || [], [
  { key: "source", label: "Source" },
  { key: "anchor", label: "Anchor" },
  { key: "section", label: "Section" },
  { key: "status", label: "Status" },
])}

## DCA Cannibalization Guard

${mdTable(output.dcaHub.cannibalization || [], [
  { key: "spoke", label: "Spoke" },
  { key: "ownedQuery", label: "Owned Query" },
  { key: "hubPhraseCount", label: "Hub Phrase Count" },
  { key: "hubTitleHit", label: "Title Hit" },
  { key: "status", label: "Status" },
])}

## HOUSEHOLD_FINANCE Hub Decision

- decision: ${output.household.decision}
- existing core: ${output.household.existingCore}
- reasons: ${output.household.reasons.join(" / ")}

${mdTable(output.household.coreReinforcement.links, [
  { key: "target", label: "Target" },
  { key: "count", label: "Links From Existing Core" },
  { key: "status", label: "Status" },
])}

## Existing Core Reinforcement

${mdTable(output.coreGroups.map((group) => ({
  key: group.key,
  cores: group.cores.join(" / "),
  spokes: group.spokes.length,
  status: group.status,
})), [
  { key: "key", label: "Topic" },
  { key: "cores", label: "Core" },
  { key: "spokes", label: "Spokes" },
  { key: "status", label: "Status" },
])}

## New / Modified Posts

${mdTable(output.modifiedPosts, [
  { key: "id", label: "Post" },
  { key: "filePath", label: "File" },
  { key: "changeType", label: "Change" },
  { key: "dateModified", label: "dateModified" },
  { key: "dateModifiedOk", label: "OK" },
])}

## Hreflang / Canonical Check

${mdTable(Object.entries(output.hreflangCanonicalCheck).map(([key, value]) => ({ key, value })), [
  { key: "key", label: "Check" },
  { key: "value", label: "Value" },
])}

## Sitemap / RSS Check

${mdTable(Object.entries(output.sitemapRssCheck).map(([key, value]) => ({ key, value })), [
  { key: "key", label: "Check" },
  { key: "value", label: "Value" },
])}

## Step 6A Regression

- verdict: ${output.regressions.step6A.finalVerdict}
- clear pairs: ${output.regressions.step6A.clearCount}/${output.regressions.step6A.total}
- status: ${output.regressions.step6A.ok ? "PASS" : "FAIL"}

## Step 6B Regression

- verdict: ${output.regressions.step6B.finalVerdict}
- status: ${output.regressions.step6B.ok ? "PASS" : "FAIL"}

## Step 6C Regression

- verdict: ${output.regressions.step6C.finalVerdict}
- status: ${output.regressions.step6C.ok ? "PASS" : "FAIL"}

## Preservation / Validation

${mdTable(validationRows, [
  { key: "key", label: "Check" },
  { key: "value", label: "Value" },
])}

## Files Generated

- \`${rel(REPORT_MD)}\`
- \`${rel(REPORT_JSON)}\`
- \`${rel(LINK_MAP_CSV)}\`
- \`${rel(PREEDIT_JSON)}\`
`;
}

function main() {
  if (process.argv.includes("--write-preedit")) {
    snapshot();
    return;
  }

  const before = readPreedit();
  const after = scanPosts();
  const afterById = postsById(after.posts);
  const batchFScope = batchFVerifiedScope();
  const batchGScope = batchGVerifiedScope();
  const diffs = postDiffs(before.posts, after.posts).filter((row) => {
    const filePath = idToRelFilePath(row.id);
    return !batchFScope.allowedFiles.has(filePath) && !batchGScope.allowedFiles.has(filePath);
  });
  const modifiedPosts = changedPosts(before.posts, after.posts).filter(
    (row) => !batchFScope.allowedFiles.has(row.filePath) && !batchGScope.allowedFiles.has(row.filePath)
  );
  const modifiedExistingPosts = modifiedPosts.filter((row) => row.changeType === "MODIFIED_EXISTING");
  const newPosts = modifiedPosts.filter((row) => row.changeType === "NEW_POST");
  const dcaHub = dcaHubDecision(afterById);
  const household = householdDecision(afterById);
  const coreGroups = coreGroupCoverage(afterById);
  const step6A = step6ARegression();
  const step6B = step6BRegression();
  const step6C = step6CRegression();
  const sitemap = sitemapCheck();
  const rss = rssCheck(after.posts);
  const duplicateTargets = [
    ...duplicateTargetRows(afterById.get(DCA_HUB) ? [afterById.get(DCA_HUB)] : [], [DCA_HUB]),
    ...DCA_PRIMARY_SPOKES.flatMap((spoke) => {
      const sourcePost = afterById.get(spoke.id);
      const count = linkCount(sourcePost, DCA_HUB);
      return count > 1 ? [{ source: spoke.id, target: DCA_HUB, count }] : [];
    }),
  ];

  const dcaHubPost = afterById.get(DCA_HUB);
  const hreflangCanonicalCheck = {
    hreflangEquivalentFalse: dcaHubPost?.hreflangEquivalent === false,
    noEnglishDcaFile: !fs.existsSync(idToFilePath(DCA_HUB, "en")),
    noEnglishSitemapDcaUrl: sitemap.dcaHubInEnSitemap === false,
    canonicalSafe: !dcaHubPost?.canonical || dcaHubPost.canonical === `${SITE_URL}${idToUrl(DCA_HUB)}`,
    noManualArticleSchema: (dcaHubPost?.jsonLdTypes || []).filter((type) => String(type).toLowerCase() === "article").length === 0,
  };

  const sitemapRssCheck = {
    dcaHubInKoSitemap: sitemap.dcaHubInKoSitemap,
    dcaHubInEnSitemap: sitemap.dcaHubInEnSitemap,
    dcaHubHasFalseEnAlternate: sitemap.dcaHubHasFalseEnAlternate,
    dcaHubSelfKoAlternate: sitemap.dcaHubSelfKoAlternate,
    sitemapOldUrlDropCount: sitemap.oldUrlDropCount,
    sitemapExpectedNewKoUrlOnly: sitemap.expectedNewKoUrlOnly,
    sitemapUnexpectedEnDcaUrlCount: sitemap.unexpectedEnDcaUrlCount,
    rssRouteExists: rss.rssRouteExists,
    rssLatest50IncludesDcaHub: rss.simulatedLatest50IncludesDcaHub,
    rssDcaHubRank: rss.dcaHubRank,
  };

  const validation = {
    preeditKoPostCount: before.posts.length,
    currentKoPostCount: after.posts.length,
    newPostCount: newPosts.length,
    expectedNewDcaHubOnly: newPosts.length === 1 && newPosts[0]?.id === DCA_HUB,
    brokenInternalPostLinks: after.brokenPostLinks.length,
    selfLinks: after.selfLinks.length,
    duplicateTargetLinksInScope: duplicateTargets.length,
    titleChanges: diffs.filter((row) => row.field === "title").length,
    descriptionChanges: diffs.filter((row) => row.field === "description").length,
    h1Changes: diffs.filter((row) => row.field === "h1s").length,
    h2Changes: diffs.filter((row) => row.field === "h2s").length,
    h3Changes: diffs.filter((row) => row.field === "h3s").length,
    faqChanges: diffs.filter((row) => row.field === "faqQuestions").length,
    tagChanges: diffs.filter((row) => row.field === "tags").length,
    canonicalHreflangChanges: diffs.filter((row) =>
      ["canonical", "hreflangAlternates", "hreflangEquivalent"].includes(row.field)
    ).length,
    schemaStructuralChanges: diffs.filter((row) => row.field === "schemaStructuralSignatures").length,
    dateModifiedOk: modifiedPosts.every((row) => row.dateModifiedOk),
    dcaHubCreated: dcaHub.decision === "DEDICATED_HUB_CREATED",
    dcaCannibalizationConflicts: dcaHub.checks?.cannibalizationConflicts ?? 999,
    dcaHubToSpokeCoverage: dcaHub.checks?.hubToSpokePass || 0,
    dcaSpokeToHubCoverage: dcaHub.checks?.spokeToHubPass || 0,
    householdDeferred: household.decision === "HOUSEHOLD_HUB_DEFERRED",
    householdCoreReinforced: household.coreReinforcement.status === "PASS",
    coreGroupsReinforced: coreGroups.every((group) => group.status === "ALREADY_SATISFIED_OR_REINFORCED"),
    hreflangCanonicalOk: Object.values(hreflangCanonicalCheck).every((value) => value === true),
    sitemapRssOk:
      sitemapRssCheck.dcaHubInKoSitemap === true &&
      sitemapRssCheck.dcaHubInEnSitemap === false &&
      sitemapRssCheck.dcaHubHasFalseEnAlternate === false &&
      sitemapRssCheck.dcaHubSelfKoAlternate === true &&
      sitemapRssCheck.sitemapOldUrlDropCount === 0 &&
      sitemapRssCheck.sitemapExpectedNewKoUrlOnly === true &&
      sitemapRssCheck.sitemapUnexpectedEnDcaUrlCount === 0 &&
      sitemapRssCheck.rssRouteExists === true &&
      sitemapRssCheck.rssLatest50IncludesDcaHub === true,
    step6ARegressionOk: step6A.ok,
    step6BRegressionOk: step6B.ok,
    step6CRegressionOk: step6C.ok,
    batchFScopeActive: batchFScope.active,
    batchFScopeVerdict: batchFScope.verdict,
    batchFAllowedFileCount: batchFScope.allowedFiles.size,
    batchGScopeActive: batchGScope.active,
    batchGScopeVerdict: batchGScope.verdict,
    batchGAllowedFileCount: batchGScope.allowedFiles.size,
  };

  const hardFail =
    !validation.expectedNewDcaHubOnly ||
    validation.brokenInternalPostLinks ||
    validation.selfLinks ||
    validation.duplicateTargetLinksInScope ||
    validation.titleChanges ||
    validation.descriptionChanges ||
    validation.h1Changes ||
    validation.h2Changes ||
    validation.h3Changes ||
    validation.faqChanges ||
    validation.tagChanges ||
    validation.canonicalHreflangChanges ||
    validation.schemaStructuralChanges ||
    !validation.dateModifiedOk ||
    !validation.dcaHubCreated ||
    validation.dcaCannibalizationConflicts ||
    !validation.householdDeferred ||
    !validation.householdCoreReinforced ||
    !validation.coreGroupsReinforced ||
    !validation.hreflangCanonicalOk ||
    !validation.sitemapRssOk ||
    !validation.step6ARegressionOk ||
    !validation.step6BRegressionOk ||
    !validation.step6CRegressionOk;

  const finalVerdict = hardFail
    ? validation.dcaCannibalizationConflicts
      ? "FAIL_HUB_CANNIBALIZATION"
      : "FAIL_HUB_TECHNICAL_BLOCKER"
    : "PASS_TOPIC_HUB_BATCH_D_WITH_HOUSEHOLD_DEFERRED";

  const linkMapRows = [
    ...(dcaHub.hubToSpoke || []).map((row) => ({
      scope: "DCA_HUB_TO_SPOKE",
      source: row.source,
      target: row.target,
      anchor: row.anchor,
      section: row.section,
      status: row.status,
    })),
    ...(dcaHub.spokeToHub || []).map((row) => ({
      scope: "DCA_SPOKE_TO_HUB",
      source: row.source,
      target: row.target,
      anchor: row.anchor,
      section: row.section,
      status: row.status,
    })),
    ...household.coreReinforcement.links.map((row) => ({
      scope: "HOUSEHOLD_EXISTING_CORE",
      source: household.existingCore,
      target: row.target,
      anchor: "",
      section: "",
      status: row.status,
    })),
    ...coreGroups.flatMap((group) =>
      group.rows.flatMap((row) =>
        row.sources
          .filter((source) => source.count > 0)
          .map((source) => ({
            scope: group.key,
            source: source.source,
            target: row.target,
            anchor: source.anchor,
            section: source.section,
            status: row.status,
          }))
      )
    ),
  ];
  writeCsv(linkMapRows);

  const output = {
    generatedAt: new Date().toISOString(),
    finalVerdict,
    dcaHub,
    household,
    coreGroups,
    modifiedPosts,
    newPosts,
    modifiedExistingPosts,
    hreflangCanonicalCheck,
    sitemapRssCheck,
    sitemapUrlSetComparison: sitemap.urlSetComparison,
    sitemapEntry: sitemap.entry,
    regressions: {
      step6A,
      step6B,
      step6C,
    },
    validation,
    structureDiffs: diffs,
    duplicateTargets,
    brokenLinks: after.brokenPostLinks,
    selfLinks: after.selfLinks,
    filesGenerated: {
      md: rel(REPORT_MD),
      json: rel(REPORT_JSON),
      linkMapCsv: rel(LINK_MAP_CSV),
      preedit: rel(PREEDIT_JSON),
    },
  };

  ensureDir(REPORT_JSON);
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  fs.writeFileSync(REPORT_MD, renderReport(output), "utf8");

  console.log(
    JSON.stringify(
      {
        finalVerdict,
        dcaHubDecision: dcaHub.decision,
        householdDecision: household.decision,
        modifiedPosts: modifiedPosts.length,
        validation,
        output: output.filesGenerated,
      },
      null,
      2
    )
  );
}

main();
