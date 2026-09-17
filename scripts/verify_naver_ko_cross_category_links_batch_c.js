const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const matter = require("gray-matter");

const ROOT = process.cwd();
const DATE_STAMP = "2026-09-16";
const POSTS_ROOT = path.join(ROOT, "content", "posts");
const REPORT_DIR = path.join(ROOT, "reports");
const TOPIC_AUDIT_JSON = path.join(REPORT_DIR, `naver-ko-post-topic-links-${DATE_STAMP}.json`);
const STEP6A_JSON = path.join(REPORT_DIR, `naver-ko-query-boundary-batch-a-${DATE_STAMP}.json`);
const STEP6B_JSON = path.join(REPORT_DIR, `naver-ko-topic-links-batch-b-${DATE_STAMP}.json`);
const STEP6B_PREEDIT_JSON = path.join(REPORT_DIR, `naver-ko-topic-links-batch-b-preedit-${DATE_STAMP}.json`);
const PREEDIT_JSON = path.join(REPORT_DIR, `naver-ko-cross-category-links-batch-c-preedit-${DATE_STAMP}.json`);
const REPORT_JSON = path.join(REPORT_DIR, `naver-ko-cross-category-links-batch-c-${DATE_STAMP}.json`);
const REPORT_MD = path.join(REPORT_DIR, `naver-ko-cross-category-links-batch-c-${DATE_STAMP}.md`);
const BATCH_D_JSON = path.join(REPORT_DIR, `naver-ko-topic-hubs-batch-d-${DATE_STAMP}.json`);
const BATCH_E_JSON = path.join(REPORT_DIR, `naver-ko-market-funnel-batch-e-${DATE_STAMP}.json`);
const BATCH_F_DATE_STAMP = "2026-09-17";
const BATCH_F_JSON = path.join(REPORT_DIR, `naver-ko-100m-cannibalization-batch-f-${BATCH_F_DATE_STAMP}.json`);
const BATCH_G_DATE_STAMP = "2026-09-17";
const BATCH_G_JSON = path.join(REPORT_DIR, `naver-ko-technical-seo-batch-g-${BATCH_G_DATE_STAMP}.json`);

const KO_CATEGORY_DIRS = ["economicInfo", "investingInfo", "personalFinance"];
const DIRECTION_KEYS = [
  "economicInfo -> investingInfo",
  "investingInfo -> economicInfo",
  "economicInfo -> personalFinance",
  "personalFinance -> economicInfo",
  "investingInfo -> personalFinance",
  "personalFinance -> investingInfo",
];

const DEFERRED_STEP5_CROSS_CATEGORY = [
  {
    source: "investingInfo/modern-6040-risk-budget",
    target: "economicInfo/gold-geopolitics-real-rates-dollar-uncertainty",
    topicFamily: "ASSET_ALLOCATION",
    bridgeRole: "portfolio_role_to_gold_macro_drivers",
    intendedDecision: "APPLY",
  },
  {
    source: "economicInfo/fx-basics",
    target: "investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions",
    topicFamily: "FX",
    bridgeRole: "fx_concept_to_hedge_decision",
    intendedDecision: "APPLY",
  },
  {
    source: "investingInfo/rates-discount-mortgage-demand-apt-prices",
    target: "personalFinance/apt-dashboard-home-goal-roadmap",
    topicFamily: "REAL_ESTATE_DATA",
    bridgeRole: "market_rate_real_estate_signal_to_home_goal",
    intendedDecision: "ALREADY_SATISFIED",
  },
  {
    source: "investingInfo/seoul-gyeonggi-incheon-risk-budget-framework",
    target: "personalFinance/apt-dashboard-home-goal-roadmap",
    topicFamily: "REAL_ESTATE_DATA",
    bridgeRole: "regional_risk_signal_to_home_goal",
    intendedDecision: "ALREADY_SATISFIED",
  },
];

const BRIDGE_CANDIDATES = [
  {
    source: "economicInfo/oil-shock-to-usdkrw-korea-transmission",
    target: "investingInfo/wti-impact-on-korea-kospi",
    topicFamily: "OIL_ENERGY",
    bridgeRole: "oil_fx_transmission_to_kospi_sector_impact",
    intendedDecision: "ALREADY_SATISFIED",
  },
  {
    source: "investingInfo/wti-impact-on-korea-kospi",
    target: "economicInfo/oil-shock-to-usdkrw-korea-transmission",
    topicFamily: "OIL_ENERGY",
    bridgeRole: "kospi_oil_impact_to_usdkrw_transmission",
    intendedDecision: "ALREADY_SATISFIED",
  },
  {
    source: "economicInfo/hormuz-risk-oil-insurance-freight-premium",
    target: "investingInfo/wti-impact-on-korea-kospi",
    topicFamily: "OIL_ENERGY",
    bridgeRole: "chokepoint_transport_risk_to_korea_market_impact",
    intendedDecision: "ALREADY_SATISFIED",
  },
  {
    source: "economicInfo/war-risk-oil-supply-insurance-shipping",
    target: "investingInfo/wti-impact-on-korea-kospi",
    topicFamily: "OIL_ENERGY",
    bridgeRole: "war_risk_supply_chain_to_korea_market_impact",
    intendedDecision: "ALREADY_SATISFIED",
  },
  {
    source: "economicInfo/fx-basics",
    target: "investingInfo/usd-krw-exchange-rate-and-kospi",
    topicFamily: "FX",
    bridgeRole: "fx_concept_to_kospi_flow",
    intendedDecision: "ALREADY_SATISFIED",
  },
  {
    source: "economicInfo/fx-basics",
    target: "investingInfo/usd-krw-weak-won-sector-map-kospi",
    topicFamily: "FX",
    bridgeRole: "fx_concept_to_sector_map",
    intendedDecision: "ALREADY_SATISFIED",
  },
  {
    source: "economicInfo/fx-basics",
    target: "investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions",
    topicFamily: "FX",
    bridgeRole: "fx_concept_to_hedge_decision",
    intendedDecision: "APPLY",
  },
  {
    source: "economicInfo/interest-rate-basics",
    target: "investingInfo/tnx-basics",
    topicFamily: "INTEREST_RATES_TNX_ETF",
    bridgeRole: "rate_concept_to_tnx_market_reference",
    intendedDecision: "ALREADY_SATISFIED",
  },
  {
    source: "economicInfo/interest-rate-basics",
    target: "personalFinance/interest-rate-1p-loan-limit-impact",
    topicFamily: "INTEREST_RATES_TNX_ETF",
    bridgeRole: "rate_concept_to_household_loan_limit",
    intendedDecision: "SKIP_NOT_NATURAL",
  },
  {
    source: "economicInfo/inflation-basics",
    target: "personalFinance/inflation-household-survival-strategy",
    topicFamily: "INFLATION_PERSONAL_FINANCE",
    bridgeRole: "inflation_concept_to_household_cashflow",
    intendedDecision: "DEFER_TO_HUB_BATCH",
  },
  {
    source: "personalFinance/inflation-household-survival-strategy",
    target: "economicInfo/inflation-basics",
    topicFamily: "INFLATION_PERSONAL_FINANCE",
    bridgeRole: "household_cashflow_to_inflation_concept",
    intendedDecision: "DEFER_TO_HUB_BATCH",
  },
  {
    source: "investingInfo/modern-6040-risk-budget",
    target: "economicInfo/gold-geopolitics-real-rates-dollar-uncertainty",
    topicFamily: "ASSET_ALLOCATION",
    bridgeRole: "portfolio_role_to_gold_macro_drivers",
    intendedDecision: "APPLY",
  },
  {
    source: "economicInfo/gold-geopolitics-real-rates-dollar-uncertainty",
    target: "investingInfo/modern-6040-risk-budget",
    topicFamily: "ASSET_ALLOCATION",
    bridgeRole: "gold_macro_drivers_to_portfolio_role",
    intendedDecision: "ALREADY_SATISFIED",
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

function idToUrl(id) {
  const [category, slug] = id.split("/");
  return `/posts/${category}/${slug}`;
}

function idToFilePath(id) {
  const [category, slug] = String(id || "").split("/");
  if (!category || !slug) return "";
  return `content/posts/${category}/ko/${slug}.md`;
}

function urlToId(url) {
  const match = String(url || "").match(/^\/posts\/([^/]+)\/([^/?#]+)$/);
  return match ? `${match[1]}/${match[2]}` : "";
}

function sourceCategory(id) {
  return String(id || "").split("/")[0] || "";
}

function targetCategory(id) {
  return sourceCategory(id);
}

function directionKey(sourceId, targetId) {
  return `${sourceCategory(sourceId)} -> ${targetCategory(targetId)}`;
}

function pairKey(source, target) {
  return `${source}::${target}`;
}

function dateValue(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return String(value).trim();
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
  const markdown = Array.from(content.matchAll(new RegExp(`^#{${level}}\\s+(.+)$`, "gm")), (match) => stripTags(match[1]));
  const html = Array.from(content.matchAll(new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, "gi")), (match) =>
    stripTags(match[1])
  );
  return Array.from(new Set([...markdown, ...html]));
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

function isRelatedTemplateSection(section) {
  const value = normalize(section).toLowerCase();
  return /(함께|관련|이어|읽으면|좋은 글|좋은글|추천|더 보기|도구|계산기|related|next|also read|cta|faq)/i.test(value);
}

function classifyLinkType(normalizedHref, sourceId, targetId, section) {
  if (normalizedHref.startsWith("/tools/")) return "TOOL_LINK";
  if (normalizedHref.startsWith("/market/")) return "MARKET_LINK";
  if (!targetId) return "OTHER_INTERNAL_LINK";
  return "EXPLICIT_CONTEXTUAL";
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
    const section = sectionForIndex(parsed.content || "", link.index);
    links.push({
      source: id,
      sourceCategory: category,
      target: targetId,
      targetCategory: targetId ? targetCategory(targetId) : "",
      href: normalizedHref,
      anchor: link.anchor,
      section,
      linkType: classifyLinkType(normalizedHref, id, targetId, section),
    });
  }

  return {
    id,
    filePath: fileRel,
    category,
    title: normalize(parsed.data.seoTitle || parsed.data.title || ""),
    description: normalize(parsed.data.seoDescription || parsed.data.description || ""),
    dateModified: dateValue(parsed.data.dateModified),
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
    canonical: normalize(parsed.data.canonical || ""),
    hreflangAlternates: JSON.stringify(parsed.data.hreflangAlternates || null),
    h1s: extractHeading(parsed.content || "", 1),
    h2s: extractHeading(parsed.content || "", 2),
    h3s: extractHeading(parsed.content || "", 3),
    faqQuestions: extractFaqQuestions(parsed.content || ""),
    schemaStructuralSignatures: extractJsonLdBlocks(raw).map(normalizeSchemaBlock),
    sha256: crypto.createHash("sha256").update(raw, "utf8").digest("hex"),
    links,
  };
}

function scanPosts() {
  const files = KO_CATEGORY_DIRS.flatMap((category) =>
    walkDir(path.join(POSTS_ROOT, category, "ko")).filter((file) => file.endsWith(".md"))
  ).sort();
  const posts = files.map(parsePostFile);
  const postIds = new Set(posts.map((post) => post.id));
  const allLinks = posts.flatMap((post) => post.links);
  const postEdges = allLinks.filter((edge) => edge.target);
  const selfLinks = postEdges.filter((edge) => edge.source === edge.target);
  const brokenPostLinks = postEdges.filter((edge) => !postIds.has(edge.target));
  return { posts, postIds, allLinks, postEdges, selfLinks, brokenPostLinks };
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

function crossCategoryExplicitEdges(edges) {
  return edges.filter(
    (edge) =>
      edge.linkType === "EXPLICIT_CONTEXTUAL" &&
      sourceCategory(edge.source) !== targetCategory(edge.target) &&
      KO_CATEGORY_DIRS.includes(sourceCategory(edge.source)) &&
      KO_CATEGORY_DIRS.includes(targetCategory(edge.target))
  );
}

function linkTypeCounts(links) {
  return links.reduce((acc, link) => {
    acc[link.linkType] = (acc[link.linkType] || 0) + 1;
    return acc;
  }, {});
}

function directionCounts(edges) {
  const counts = Object.fromEntries(DIRECTION_KEYS.map((key) => [key, 0]));
  for (const edge of edges) {
    const key = directionKey(edge.source, edge.target);
    if (key in counts) counts[key] += 1;
  }
  return counts;
}

function readOptionalJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function batchDVerifiedScope() {
  const empty = { allowedFiles: new Set(), allowedIds: new Set(), verdict: "", active: false };
  if (!fs.existsSync(BATCH_D_JSON)) return empty;
  try {
    const data = JSON.parse(fs.readFileSync(BATCH_D_JSON, "utf8"));
    const validation = data.validation || {};
    const dVerdict = String(data.finalVerdict || "");
    const verdictEligible =
      dVerdict.startsWith("PASS_TOPIC_HUB_BATCH_D") ||
      dVerdict === "FAIL_HUB_TECHNICAL_BLOCKER";
    const pass =
      verdictEligible &&
      validation.expectedNewDcaHubOnly === true &&
      validation.brokenInternalPostLinks === 0 &&
      validation.selfLinks === 0 &&
      validation.duplicateTargetLinksInScope === 0 &&
      validation.titleChanges === 0 &&
      validation.descriptionChanges === 0 &&
      validation.h1Changes === 0 &&
      validation.h2Changes === 0 &&
      validation.h3Changes === 0 &&
      validation.faqChanges === 0 &&
      validation.tagChanges === 0 &&
      validation.canonicalHreflangChanges === 0 &&
      validation.schemaStructuralChanges === 0 &&
      validation.dateModifiedOk === true &&
      validation.dcaHubCreated === true &&
      validation.dcaCannibalizationConflicts === 0 &&
      validation.householdDeferred === true &&
      validation.householdCoreReinforced === true &&
      validation.coreGroupsReinforced === true &&
      validation.hreflangCanonicalOk === true &&
      validation.sitemapRssOk === true;
    if (!pass) return { ...empty, verdict: data.finalVerdict || "" };
    const dcaRows = [
      ...(data.dcaHub?.hubToSpoke || []),
      ...(data.dcaHub?.spokeToHub || []),
    ];
    const allowedIds = new Set(["personalFinance/dca-guide"]);
    dcaRows.forEach((row) => {
      if (row.source) allowedIds.add(row.source);
      if (row.target) allowedIds.add(row.target);
    });
    return {
      active: true,
      verdict: data.finalVerdict || "",
      allowedIds,
      allowedFiles: new Set([...allowedIds].map(idToFilePath).filter(Boolean)),
    };
  } catch {
    return empty;
  }
}

function batchEVerifiedScope() {
  const empty = { allowedFiles: new Set(), verdict: "", active: false };
  if (!fs.existsSync(BATCH_E_JSON)) return empty;
  try {
    const data = JSON.parse(fs.readFileSync(BATCH_E_JSON, "utf8"));
    const validation = data.validation || {};
    const pass =
      String(data.finalVerdict || "").startsWith("PASS_MARKET_FUNNEL_BATCH_E") &&
      validation.reviewRequired === 0 &&
      validation.brokenMarketLink === 0 &&
      validation.duplicateMarketLink === 0 &&
      validation.perPostOverAdditions === 0 &&
      validation.unsupportedIndicatorClaims === 0 &&
      validation.realtimeClaimMisuse === 0 &&
      validation.dateModifiedIssues === 0 &&
      validation.structureIssues === 0 &&
      validation.sitemapUnexpectedStep6EUrlAdditions === 0 &&
      validation.sitemapUrlDrops === 0 &&
      validation.fakeEnglishDcaHubPresent === 0;
    if (!pass) return { ...empty, verdict: data.finalVerdict || "" };
    return {
      active: true,
      verdict: data.finalVerdict || "",
      allowedFiles: new Set(
        (data.candidateResults || [])
          .filter((row) => row.hashChanged || row.decision === "APPLY")
          .map((row) => row.filePath)
          .filter(Boolean)
      ),
    };
  } catch {
    return empty;
  }
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

function compactTopicAudit(data) {
  if (!data) return null;
  return {
    generatedAt: data.generatedAt || "",
    summary: data.summary || {},
    graphOverview: data.graphOverview || {},
  };
}

function snapshot() {
  const current = scanPosts();
  const explicitCrossCategory = crossCategoryExplicitEdges(current.postEdges);
  const out = {
    generatedAt: new Date().toISOString(),
    source: "batch_c_preedit_current_source_after_batch_b",
    topicAuditBefore: compactTopicAudit(readOptionalJson(TOPIC_AUDIT_JSON)),
    posts: current.posts.map((post) => ({
      id: post.id,
      filePath: post.filePath,
      category: post.category,
      title: post.title,
      description: post.description,
      dateModified: post.dateModified,
      tags: post.tags,
      canonical: post.canonical,
      hreflangAlternates: post.hreflangAlternates,
      h1s: post.h1s,
      h2s: post.h2s,
      h3s: post.h3s,
      faqQuestions: post.faqQuestions,
      schemaStructuralSignatures: post.schemaStructuralSignatures,
      sha256: post.sha256,
    })),
    allLinks: current.allLinks,
    postEdges: current.postEdges,
    graph: {
      totalPosts: current.posts.length,
      totalInternalLinks: current.allLinks.length,
      linkTypeCounts: linkTypeCounts(current.allLinks),
      explicitCrossCategoryPostLinks: explicitCrossCategory.length,
      explicitCrossCategoryDirectionCounts: directionCounts(explicitCrossCategory),
    },
  };
  ensureDir(PREEDIT_JSON);
  fs.writeFileSync(PREEDIT_JSON, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(
    JSON.stringify(
      {
        wrote: rel(PREEDIT_JSON),
        posts: out.posts.length,
        explicitCrossCategoryPostLinks: out.graph.explicitCrossCategoryPostLinks,
        linkTypeCounts: out.graph.linkTypeCounts,
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

function postsById(posts) {
  return new Map(posts.map((post) => [post.id, post]));
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
      category: post.category,
      dateModified: post.dateModified,
      dateModifiedOk: post.dateModified === DATE_STAMP,
    }));
}

function linkIdentity(link) {
  return [link.source, link.href, normalize(link.anchor), normalize(link.section), link.linkType].join("::");
}

function linkAdditions(beforeLinks, afterLinks, predicate) {
  const beforeSet = new Set(beforeLinks.filter(predicate).map(linkIdentity));
  return afterLinks.filter(predicate).filter((link) => !beforeSet.has(linkIdentity(link)));
}

function classifyCandidate(candidate, beforeMap, afterMap) {
  const before = beforeMap.get(pairKey(candidate.source, candidate.target)) || [];
  const after = afterMap.get(pairKey(candidate.source, candidate.target)) || [];
  const beforeExplicit = before.filter((edge) => edge.linkType === "EXPLICIT_CONTEXTUAL");
  const afterExplicit = after.filter((edge) => edge.linkType === "EXPLICIT_CONTEXTUAL");
  let status = "REVIEW_REQUIRED";

  if (beforeExplicit.length) status = "ALREADY_SATISFIED";
  else if (candidate.intendedDecision === "APPLY" && afterExplicit.length) status = "APPLY";
  else if (candidate.intendedDecision === "ALREADY_SATISFIED" && afterExplicit.length) status = "ALREADY_SATISFIED";
  else if (candidate.intendedDecision === "SKIP_NOT_NATURAL") status = "SKIP_NOT_NATURAL";
  else if (candidate.intendedDecision === "DEFER_TO_MARKET_BATCH") status = "DEFER_TO_MARKET_BATCH";
  else if (candidate.intendedDecision === "DEFER_TO_HUB_BATCH") status = "DEFER_TO_HUB_BATCH";
  else if (candidate.intendedDecision === "APPLY") status = "REVIEW_REQUIRED";

  const selectedEdge = afterExplicit[0] || after[0] || null;
  return {
    sourceCategory: sourceCategory(candidate.source),
    source: candidate.source,
    targetCategory: targetCategory(candidate.target),
    target: candidate.target,
    topicFamily: candidate.topicFamily,
    bridgeRole: candidate.bridgeRole,
    anchor: selectedEdge?.anchor || "",
    context: selectedEdge?.section || "",
    linkType: selectedEdge?.linkType || "NONE",
    beforeExplicitCount: beforeExplicit.length,
    afterExplicitCount: afterExplicit.length,
    intendedDecision: candidate.intendedDecision,
    status,
  };
}

function summarizeDeferredOpportunityReconciliation(rows) {
  return {
    total: rows.length,
    APPLY: rows.filter((row) => row.status === "APPLY").length,
    ALREADY_SATISFIED: rows.filter((row) => row.status === "ALREADY_SATISFIED").length,
    SKIP_NOT_NATURAL: rows.filter((row) => row.status === "SKIP_NOT_NATURAL").length,
    DEFER_TO_MARKET_BATCH: rows.filter((row) => row.status === "DEFER_TO_MARKET_BATCH").length,
    DEFER_TO_HUB_BATCH: rows.filter((row) => row.status === "DEFER_TO_HUB_BATCH").length,
    REVIEW_REQUIRED: rows.filter((row) => row.status === "REVIEW_REQUIRED").length,
  };
}

function step6ARegression() {
  const data = readOptionalJson(STEP6A_JSON);
  if (!data) return { ok: false, clearCount: 0, total: 0, finalVerdict: "MISSING" };
  const total = data.pairResults?.length || 0;
  const clearCount = (data.pairResults || []).filter((row) => row.result === "CLEAR").length;
  return {
    ok: String(data.finalVerdict || "").startsWith("PASS") && total === 7 && clearCount === 7,
    clearCount,
    total,
    finalVerdict: data.finalVerdict || "",
  };
}

function step6BRegression() {
  const data = readOptionalJson(STEP6B_JSON);
  if (!data) return { ok: false, finalVerdict: "MISSING", applied: 0 };
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
    validation.exactAnchorStuffing === 0;
  return {
    ok,
    finalVerdict: data.finalVerdict || "",
    applied: data.opportunityReconciliation?.APPLY_NOW || data.appliedLinks?.length || 0,
    validation,
  };
}

function baselineMetricSemantics(before) {
  const step6b = readOptionalJson(STEP6B_JSON);
  const step6bPreedit = readOptionalJson(STEP6B_PREEDIT_JSON);
  return {
    ORIGINAL_STEP4_BASELINE: {
      source: `reports/naver-ko-post-topic-links-${DATE_STAMP}.json before implementation`,
      coreToSpokeMissing:
        step6b?.beforeMetrics?.step4Summary?.coreToSpokeMissingCount ??
        before.topicAuditBefore?.summary?.coreToSpokeMissingCount ??
        null,
      spokeToCoreMissing:
        step6b?.beforeMetrics?.step4Summary?.spokeToCoreMissingCount ??
        before.topicAuditBefore?.summary?.spokeToCoreMissingCount ??
        null,
      note: "Original Step 4 audit summary counted missing topic-family signals in its own report denominator.",
    },
    BATCH_B_RECONCILED_BASELINE: {
      source: `reports/naver-ko-topic-links-batch-b-${DATE_STAMP}.json`,
      coreToSpokeBefore:
        step6b?.beforeMetrics?.coverage?.coreToSpokeMissing ?? step6bPreedit?.coverageBeforeStep6B?.coreToSpokeMissing ?? null,
      coreToSpokeAfter: step6b?.afterMetrics?.coverage?.coreToSpokeMissing ?? null,
      spokeToCoreBefore:
        step6b?.beforeMetrics?.coverage?.spokeToCoreMissing ?? step6bPreedit?.coverageBeforeStep6B?.spokeToCoreMissing ?? null,
      spokeToCoreAfter: step6b?.afterMetrics?.coverage?.spokeToCoreMissing ?? null,
      parentChildBefore:
        step6b?.beforeMetrics?.coverage?.parentChildMissing ?? step6bPreedit?.coverageBeforeStep6B?.parentChildMissing ?? null,
      parentChildAfter: step6b?.afterMetrics?.coverage?.parentChildMissing ?? null,
      note: "Batch B reconciled the approved-link-plan denominator at execution time, so its before/after numbers differ from original Step 4 summary counts.",
    },
    CURRENT_AFTER_BATCH_B: {
      source: rel(PREEDIT_JSON),
      topicAuditSummary: before.topicAuditBefore?.summary || {},
      graphOverview: before.topicAuditBefore?.graphOverview || {},
      note: "Future monitoring should use the current audit logic and this post-Batch-B snapshot as the comparable baseline.",
    },
  };
}

function countAppliedPerSource(appliedRows) {
  return appliedRows.reduce((acc, row) => {
    acc[row.source] = (acc[row.source] || 0) + 1;
    return acc;
  }, {});
}

function exactAnchorIssues(appliedRows, afterPosts) {
  const afterById = postsById(afterPosts);
  const seen = new Map();
  const issues = [];
  for (const row of appliedRows) {
    const key = `${row.source}::${normalize(row.anchor).toLowerCase()}`;
    seen.set(key, (seen.get(key) || 0) + 1);
    const target = afterById.get(row.target);
    if (target && normalize(row.anchor) && normalize(row.anchor) === normalize(target.title)) {
      issues.push({ ...row, issue: "ANCHOR_EQUALS_TARGET_TITLE" });
    }
  }
  for (const row of appliedRows) {
    const key = `${row.source}::${normalize(row.anchor).toLowerCase()}`;
    if (seen.get(key) > 1) issues.push({ ...row, issue: "REPEATED_EXACT_ANCHOR_IN_SOURCE" });
  }
  return issues;
}

function groupByFamily(rows) {
  return rows.reduce((acc, row) => {
    if (!acc[row.topicFamily]) acc[row.topicFamily] = [];
    acc[row.topicFamily].push(row);
    return acc;
  }, {});
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

function renderCandidateRows(rows) {
  if (!rows.length) return "- None";
  return mdTable(rows, [
    { key: "topicFamily", label: "Topic" },
    { key: "source", label: "Source" },
    { key: "target", label: "Target" },
    { key: "bridgeRole", label: "Bridge Role" },
    { key: "anchor", label: "Anchor" },
    { key: "context", label: "Context" },
    { key: "status", label: "Status" },
  ]);
}

function main() {
  if (process.argv.includes("--write-preedit")) {
    snapshot();
    return;
  }

  const before = readPreedit();
  const after = scanPosts();
  const batchDScope = batchDVerifiedScope();
  const batchEScope = batchEVerifiedScope();
  const batchFScope = batchFVerifiedScope();
  const batchGScope = batchGVerifiedScope();
  const afterById = postsById(after.posts);
  const isBatchDSource = (sourceId) => {
    const sourcePost = afterById.get(sourceId);
    return batchDScope.allowedIds.has(sourceId) || (sourcePost ? batchDScope.allowedFiles.has(sourcePost.filePath) : false);
  };
  const isBatchESource = (sourceId) => {
    const sourcePost = afterById.get(sourceId);
    return sourcePost ? batchEScope.allowedFiles.has(sourcePost.filePath) : false;
  };
  const isBatchFSource = (sourceId) => {
    const sourcePost = afterById.get(sourceId);
    return sourcePost ? batchFScope.allowedFiles.has(sourcePost.filePath) : false;
  };
  const afterAllLinksForBatchC = after.allLinks.filter((link) => !isBatchDSource(link.source) && !isBatchFSource(link.source));
  const afterPostEdgesForBatchC = after.postEdges.filter((edge) => !isBatchDSource(edge.source) && !isBatchFSource(edge.source));
  const beforePostEdges = before.postEdges || [];
  const beforeAllLinks = before.allLinks || beforePostEdges;
  const beforeMap = edgeMap(beforePostEdges);
  const afterMap = edgeMap(afterPostEdgesForBatchC);
  const deferredReconciliation = DEFERRED_STEP5_CROSS_CATEGORY.map((candidate) =>
    classifyCandidate(candidate, beforeMap, afterMap)
  );
  const bridgeCandidateResults = BRIDGE_CANDIDATES.map((candidate) => classifyCandidate(candidate, beforeMap, afterMap));
  const appliedCrossCategoryLinks = deferredReconciliation.filter((row) => row.status === "APPLY");
  const modifiedPosts = changedPosts(before.posts, after.posts).filter(
    (row) =>
      !batchDScope.allowedFiles.has(row.filePath) &&
      !batchEScope.allowedFiles.has(row.filePath) &&
      !batchFScope.allowedFiles.has(row.filePath) &&
      !batchGScope.allowedFiles.has(row.filePath)
  );
  const structureDiffs = postDiffs(before.posts, after.posts).filter((row) => {
    const post = afterById.get(row.id);
    return post
      ? !batchDScope.allowedFiles.has(post.filePath) &&
          !batchEScope.allowedFiles.has(post.filePath) &&
          !batchFScope.allowedFiles.has(post.filePath) &&
          !batchGScope.allowedFiles.has(post.filePath)
      : true;
  });
  const beforeExplicitCrossCategory = crossCategoryExplicitEdges(beforePostEdges);
  const afterExplicitCrossCategory = crossCategoryExplicitEdges(afterPostEdgesForBatchC);
  const beforeDirections = directionCounts(beforeExplicitCrossCategory);
  const afterDirections = directionCounts(afterExplicitCrossCategory);
  const appliedDirections = directionCounts(
    appliedCrossCategoryLinks.map((row) => ({
      source: row.source,
      target: row.target,
    }))
  );
  const marketAdditions = linkAdditions(
    beforeAllLinks,
    afterAllLinksForBatchC,
    (link) => link.linkType === "MARKET_LINK" || link.href.startsWith("/market/")
  ).filter((link) => !isBatchESource(link.source));
  const toolAdditions = linkAdditions(
    beforeAllLinks,
    afterAllLinksForBatchC,
    (link) => link.linkType === "TOOL_LINK" || link.href.startsWith("/tools/")
  );
  const relatedBlockAppliedLinks = appliedCrossCategoryLinks.filter((row) => row.linkType !== "EXPLICIT_CONTEXTUAL");
  const perSourceApplied = countAppliedPerSource(appliedCrossCategoryLinks);
  const reviewLimitRows = Object.entries(perSourceApplied)
    .filter(([, count]) => count > 2)
    .map(([source, count]) => ({ source, count }));
  const duplicateNewContextualLinks = appliedCrossCategoryLinks.filter((row) => row.afterExplicitCount > 1);
  const anchorIssues = exactAnchorIssues(appliedCrossCategoryLinks, after.posts);
  const step6a = step6ARegression();
  const step6b = step6BRegression();
  const currentTopicAuditAfter = compactTopicAudit(readOptionalJson(TOPIC_AUDIT_JSON));

  const validation = {
    brokenInternalPostLinks: after.brokenPostLinks.length,
    selfLinks: after.selfLinks.length,
    duplicateNewContextualLinks: duplicateNewContextualLinks.length,
    titleChanges: structureDiffs.filter((row) => row.field === "title").length,
    descriptionChanges: structureDiffs.filter((row) => row.field === "description").length,
    h1Changes: structureDiffs.filter((row) => row.field === "h1s").length,
    h2Changes: structureDiffs.filter((row) => row.field === "h2s").length,
    h3Changes: structureDiffs.filter((row) => row.field === "h3s").length,
    faqChanges: structureDiffs.filter((row) => row.field === "faqQuestions").length,
    tagChanges: structureDiffs.filter((row) => row.field === "tags").length,
    canonicalHreflangChanges: structureDiffs.filter((row) => row.field === "canonical" || row.field === "hreflangAlternates").length,
    schemaStructuralChanges: structureDiffs.filter((row) => row.field === "schemaStructuralSignatures").length,
    marketLinkAdditions: marketAdditions.length,
    toolLinkAdditions: toolAdditions.length,
    relatedBlockAppliedLinks: relatedBlockAppliedLinks.length,
    exactAnchorStuffing: anchorIssues.length,
    dateModifiedOk: modifiedPosts.every((row) => row.dateModifiedOk),
    step6ABoundaryClear: step6a.ok,
    step6BRegressionOk: step6b.ok,
    reviewLimitRows: reviewLimitRows.length,
    batchDScopeActive: batchDScope.active,
    batchDScopeVerdict: batchDScope.verdict,
    batchDAllowedFileCount: batchDScope.allowedFiles.size,
    batchEScopeActive: batchEScope.active,
    batchEScopeVerdict: batchEScope.verdict,
    batchEAllowedFileCount: batchEScope.allowedFiles.size,
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
    validation.h1Changes ||
    validation.h2Changes ||
    validation.h3Changes ||
    validation.faqChanges ||
    validation.tagChanges ||
    validation.canonicalHreflangChanges ||
    validation.schemaStructuralChanges ||
    validation.marketLinkAdditions ||
    validation.toolLinkAdditions ||
    validation.relatedBlockAppliedLinks ||
    validation.exactAnchorStuffing ||
    !validation.dateModifiedOk ||
    !validation.step6ABoundaryClear ||
    !validation.step6BRegressionOk;

  const reviewRequired = [
    ...deferredReconciliation.filter((row) => row.status === "REVIEW_REQUIRED"),
    ...reviewLimitRows.map((row) => ({ ...row, status: "REVIEW_REQUIRED", reason: "More than 2 new cross-category links from one source" })),
  ];
  const finalVerdict = hardFail
    ? "FAIL_CROSS_CATEGORY_REGRESSION"
    : reviewRequired.length
      ? "PASS_CROSS_CATEGORY_BATCH_C_WITH_REVIEW_ITEMS"
      : "PASS_CROSS_CATEGORY_BATCH_C";

  const output = {
    generatedAt: new Date().toISOString(),
    finalVerdict,
    baselineMetricSemantics: baselineMetricSemantics(before),
    deferredOpportunityReconciliation: {
      summary: summarizeDeferredOpportunityReconciliation(deferredReconciliation),
      rows: deferredReconciliation,
    },
    newNaturalBridgeCandidates: bridgeCandidateResults,
    appliedCrossCategoryLinks,
    modifiedPosts,
    categoryDirectionSummary: {
      applied: appliedDirections,
      beforeAllExplicitCrossCategory: beforeDirections,
      afterAllExplicitCrossCategory: afterDirections,
    },
    crossCategoryBeforeAfter: {
      beforeExplicitContextualPostLinks: beforeExplicitCrossCategory.length,
      afterExplicitContextualPostLinks: afterExplicitCrossCategory.length,
      beforeLinkTypeCounts: before.graph?.linkTypeCounts || linkTypeCounts(beforeAllLinks),
      afterLinkTypeCounts: linkTypeCounts(afterAllLinksForBatchC),
      topicAuditBefore: before.topicAuditBefore,
      topicAuditAfter: currentTopicAuditAfter,
    },
    skippedDeferredCandidates: bridgeCandidateResults.filter((row) =>
      ["SKIP_NOT_NATURAL", "DEFER_TO_MARKET_BATCH", "DEFER_TO_HUB_BATCH", "REVIEW_REQUIRED"].includes(row.status)
    ),
    step6ARegression: step6a,
    step6BRegression: step6b,
    preservationCheck: {
      validation,
      structureDiffs,
      marketAdditions,
      toolAdditions,
      relatedBlockAppliedLinks,
      duplicateNewContextualLinks,
      anchorIssues,
      brokenPostLinks: after.brokenPostLinks,
      selfLinks: after.selfLinks,
    },
    reviewRequired,
    filesGenerated: {
      md: rel(REPORT_MD),
      json: rel(REPORT_JSON),
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
        deferredOpportunityReconciliation: output.deferredOpportunityReconciliation.summary,
        appliedCrossCategoryLinks: appliedCrossCategoryLinks.length,
        modifiedPosts: modifiedPosts.length,
        directionSummary: output.categoryDirectionSummary.applied,
        crossCategoryBeforeAfter: {
          before: output.crossCategoryBeforeAfter.beforeExplicitContextualPostLinks,
          after: output.crossCategoryBeforeAfter.afterExplicitContextualPostLinks,
        },
        validation,
        output: output.filesGenerated,
      },
      null,
      2
    )
  );
}

function renderReport(output) {
  const byFamily = groupByFamily(output.newNaturalBridgeCandidates);
  const validationRows = Object.entries(output.preservationCheck.validation).map(([key, value]) => ({
    key,
    value: Array.isArray(value) ? JSON.stringify(value) : value,
  }));

  return `# FinMap KO Cross-category Links Batch C Verification

Generated: ${output.generatedAt}

## Final Verdict

${output.finalVerdict}

## Baseline Metric Semantics

- ORIGINAL_STEP4_BASELINE: core->spoke missing ${output.baselineMetricSemantics.ORIGINAL_STEP4_BASELINE.coreToSpokeMissing}, spoke->core missing ${output.baselineMetricSemantics.ORIGINAL_STEP4_BASELINE.spokeToCoreMissing}. This is the original Step 4 report denominator.
- BATCH_B_RECONCILED_BASELINE: core->spoke ${output.baselineMetricSemantics.BATCH_B_RECONCILED_BASELINE.coreToSpokeBefore} -> ${output.baselineMetricSemantics.BATCH_B_RECONCILED_BASELINE.coreToSpokeAfter}, spoke->core ${output.baselineMetricSemantics.BATCH_B_RECONCILED_BASELINE.spokeToCoreBefore} -> ${output.baselineMetricSemantics.BATCH_B_RECONCILED_BASELINE.spokeToCoreAfter}, parent/child ${output.baselineMetricSemantics.BATCH_B_RECONCILED_BASELINE.parentChildBefore} -> ${output.baselineMetricSemantics.BATCH_B_RECONCILED_BASELINE.parentChildAfter}. This used the execution-time approved-link-plan denominator.
- CURRENT_AFTER_BATCH_B: use the current audit logic and the Batch C pre-edit snapshot for future monitoring. Old reports were not retrofixed.

## Deferred Opportunity Reconciliation

${mdTable([output.deferredOpportunityReconciliation.summary], [
  { key: "total", label: "Total" },
  { key: "APPLY", label: "Apply" },
  { key: "ALREADY_SATISFIED", label: "Already" },
  { key: "SKIP_NOT_NATURAL", label: "Skip" },
  { key: "DEFER_TO_MARKET_BATCH", label: "Market Defer" },
  { key: "DEFER_TO_HUB_BATCH", label: "Hub Defer" },
  { key: "REVIEW_REQUIRED", label: "Review" },
])}

${renderCandidateRows(output.deferredOpportunityReconciliation.rows)}

## Applied Cross-category Links

${renderCandidateRows(output.appliedCrossCategoryLinks)}

## Modified Posts

${mdTable(output.modifiedPosts, [
  { key: "id", label: "Post" },
  { key: "filePath", label: "File" },
  { key: "dateModified", label: "dateModified" },
  { key: "dateModifiedOk", label: "OK" },
])}

## Category Direction Summary

${mdTable(DIRECTION_KEYS.map((key) => ({
  direction: key,
  applied: output.categoryDirectionSummary.applied[key],
  beforeAll: output.categoryDirectionSummary.beforeAllExplicitCrossCategory[key],
  afterAll: output.categoryDirectionSummary.afterAllExplicitCrossCategory[key],
})), [
  { key: "direction", label: "Direction" },
  { key: "applied", label: "Applied in Batch C" },
  { key: "beforeAll", label: "Before Explicit" },
  { key: "afterAll", label: "After Explicit" },
])}

## OIL / ENERGY Bridge

${renderCandidateRows(byFamily.OIL_ENERGY || [])}

## FX Bridge

${renderCandidateRows(byFamily.FX || [])}

## Interest Rates / TNX / ETF Bridge

${renderCandidateRows(byFamily.INTEREST_RATES_TNX_ETF || [])}

## Inflation / Personal Finance Bridge

${renderCandidateRows(byFamily.INFLATION_PERSONAL_FINANCE || [])}

## Cross-category Before / After

- Explicit contextual cross-category post links: ${output.crossCategoryBeforeAfter.beforeExplicitContextualPostLinks} -> ${output.crossCategoryBeforeAfter.afterExplicitContextualPostLinks}
- Topic audit graph explicit contextual post links: ${output.crossCategoryBeforeAfter.topicAuditBefore?.graphOverview?.explicitContextualPostLinks ?? "n/a"} -> ${output.crossCategoryBeforeAfter.topicAuditAfter?.graphOverview?.explicitContextualPostLinks ?? "n/a"}
- Topic audit cross-category weak posts: ${output.crossCategoryBeforeAfter.topicAuditBefore?.summary?.crossCategoryWeakPosts ?? "n/a"} -> ${output.crossCategoryBeforeAfter.topicAuditAfter?.summary?.crossCategoryWeakPosts ?? "n/a"}

## Skipped / Deferred Candidates

${renderCandidateRows(output.skippedDeferredCandidates)}

## Step 6A Regression

- verdict: ${output.step6ARegression.finalVerdict}
- clear pairs: ${output.step6ARegression.clearCount}/${output.step6ARegression.total}
- status: ${output.step6ARegression.ok ? "PASS" : "FAIL"}

## Step 6B Regression

- verdict: ${output.step6BRegression.finalVerdict}
- applied links: ${output.step6BRegression.applied}
- status: ${output.step6BRegression.ok ? "PASS" : "FAIL"}

## Preservation Check

${mdTable(validationRows, [
  { key: "key", label: "Check" },
  { key: "value", label: "Value" },
])}

Schema preservation allows dateModified value sync only; JSON-LD structural signatures are compared with dateModified masked.

## Build / Validation

Run externally after content changes:
- node --check scripts/verify_naver_ko_cross_category_links_batch_c.js
- node scripts/verify_naver_ko_cross_category_links_batch_c.js
- node scripts/audit_naver_ko_post_search_inventory.js
- node scripts/audit_naver_ko_post_topic_links.js
- node scripts/verify_naver_ko_query_boundary_batch_a.js
- node scripts/verify_naver_ko_topic_links_batch_b.js
- npm.cmd run build
- git diff --check
- git status --short

## Files Changed

Generated files:
- \`${output.filesGenerated.md}\`
- \`${output.filesGenerated.json}\`
- \`${output.filesGenerated.preedit}\`

Modified posts are listed above.

## Important Review Items

${output.reviewRequired.length ? renderCandidateRows(output.reviewRequired) : "- None"}
`;
}

main();
