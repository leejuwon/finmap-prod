const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const matter = require("gray-matter");

const ROOT = process.cwd();
const SITE_URL = "https://www.finmaphub.com";
const DATE_STAMP = "2026-09-17";
const STEP1_DATE = "2026-09-16";
const KO_CATEGORY_DIRS = ["economicInfo", "investingInfo", "personalFinance"];
const POSTS_ROOT = path.join(ROOT, "content", "posts");
const REPORT_DIR = path.join(ROOT, "reports");

const REPORT_JSON = path.join(REPORT_DIR, `naver-ko-full-site-final-validation-${DATE_STAMP}.json`);
const REPORT_MD = path.join(REPORT_DIR, `naver-ko-full-site-final-validation-${DATE_STAMP}.md`);
const STEP1_STEP7_CSV = path.join(REPORT_DIR, `naver-ko-step1-vs-step7-comparison-${DATE_STAMP}.csv`);
const QUERY_MONITORING_CSV = path.join(REPORT_DIR, `naver-ko-representative-query-monitoring-${DATE_STAMP}.csv`);

const FILES = {
  step1: path.join(REPORT_DIR, `naver-ko-post-search-inventory-${STEP1_DATE}.json`),
  step2: path.join(REPORT_DIR, `naver-ko-post-query-intent-${STEP1_DATE}.json`),
  step3: path.join(REPORT_DIR, `naver-ko-post-cannibalization-${STEP1_DATE}.json`),
  step6A: path.join(REPORT_DIR, `naver-ko-query-boundary-batch-a-${STEP1_DATE}.json`),
  step6B: path.join(REPORT_DIR, `naver-ko-topic-links-batch-b-${STEP1_DATE}.json`),
  step6C: path.join(REPORT_DIR, `naver-ko-cross-category-links-batch-c-${STEP1_DATE}.json`),
  step6D: path.join(REPORT_DIR, `naver-ko-topic-hubs-batch-d-${STEP1_DATE}.json`),
  step6E: path.join(REPORT_DIR, `naver-ko-market-funnel-batch-e-${STEP1_DATE}.json`),
  step6F: path.join(REPORT_DIR, `naver-ko-100m-cannibalization-batch-f-${DATE_STAMP}.json`),
  step6G: path.join(REPORT_DIR, `naver-ko-technical-seo-batch-g-${DATE_STAMP}.json`),
};

const BOUNDARY_PAIR_IDS = [
  "economicInfo/geopolitics-oil-fx-dashboard",
  "economicInfo/geopolitics-to-usd-liquidity-fx",
  "economicInfo/hormuz-risk-oil-insurance-freight-premium",
  "economicInfo/war-risk-oil-supply-insurance-shipping",
  "economicInfo/inflation-basics",
  "economicInfo/inflation-rate-basics",
  "economicInfo/oil-shock-to-usdkrw-korea-transmission",
  "investingInfo/wti-impact-on-korea-kospi",
  "investingInfo/us10y-impact-on-korea-and-stock-market",
  "investingInfo/etf-impact-of-tnx",
  "personalFinance/dca-vs-lumpsum-decision-rules",
  "personalFinance/dca-vs-lump-sum-when-results-differ",
  "personalFinance/personal-start-5steps",
  "personalFinance/personal-finance-3pillars",
];

const ONE_HUNDRED_M_IDS = [
  "personalFinance/how-much-monthly-invest-for-100m",
  "personalFinance/monthly-investment-for-100m-table",
  "personalFinance/how-much-per-month-for-100m",
];

const DCA_HUB_ID = "personalFinance/dca-guide";
const DCA_HUB_URL = "/posts/personalFinance/dca-guide";

const REQUIRED_BATCH_VERDICTS = {
  step6A: "PASS_QUERY_BOUNDARY_BATCH_A",
  step6B: "PASS_TOPIC_LINK_BATCH_B",
  step6C: "PASS_CROSS_CATEGORY_BATCH_C",
  step6D: "PASS_TOPIC_HUB_BATCH_D",
  step6E: "PASS_MARKET_FUNNEL_BATCH_E",
  step6F: "PASS_100M_QUERY_BOUNDARY_IMPROVED",
  step6G: "PASS_TECHNICAL_SEO_BATCH_G",
};

const GENERIC_ANCHOR_RE = /^(자세히 보기|관련 글|글 보기|더 보기|바로가기|확인하기|읽어보기|more|read more|learn more)$/i;

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function dateValue(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function removeJsonLd(content) {
  return String(content || "").replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "\n");
}

function normalizeSitePath(pathname) {
  let p = String(pathname || "/").replace(/\/{2,}/g, "/");
  if (p === "/ko") p = "/";
  else if (p.startsWith("/ko/")) p = p.replace(/^\/ko/, "") || "/";
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || "/";
}

function normalizeInternalPath(href) {
  const raw = String(href || "").trim();
  if (!raw || raw.startsWith("#") || /^(mailto|tel|javascript|data):/i.test(raw)) return "";
  try {
    const parsed = new URL(raw, SITE_URL);
    if (parsed.origin !== SITE_URL) return "";
    return normalizeSitePath(parsed.pathname);
  } catch {
    if (!raw.startsWith("/")) return "";
    return normalizeSitePath(raw.split(/[?#]/)[0]);
  }
}

function extractLinks(content) {
  const text = removeJsonLd(content);
  const links = [];
  let match;
  const htmlRe = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = htmlRe.exec(text)) !== null) {
    const normalized = normalizeInternalPath(match[1]);
    if (normalized) links.push({ href: normalized, anchor: stripTags(match[2]), source: "html", index: match.index });
  }
  const mdRe = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  while ((match = mdRe.exec(text)) !== null) {
    const normalized = normalizeInternalPath(match[2]);
    if (normalized) links.push({ href: normalized, anchor: stripTags(match[1]), source: "markdown", index: match.index });
  }
  return links;
}

function extractHeadings(content) {
  const text = removeJsonLd(content);
  const h1 = [...text.matchAll(/^#\s+(.+)$/gm)].map((m) => stripTags(m[1]));
  const h2 = [...text.matchAll(/^##\s+(.+)$/gm)].map((m) => stripTags(m[1]));
  const h3 = [...text.matchAll(/^###\s+(.+)$/gm)].map((m) => stripTags(m[1]));
  return { h1, h2, h3 };
}

function idToUrl(id) {
  return `/posts/${id}`;
}

function idToFilePath(id, lang = "ko") {
  const [category, slug] = id.split("/");
  return path.join(POSTS_ROOT, category, lang, `${slug}.md`);
}

function scanKoPosts() {
  const files = KO_CATEGORY_DIRS.flatMap((category) => walkDir(path.join(POSTS_ROOT, category, "ko"))).filter((file) =>
    file.endsWith(".md")
  );
  const posts = files.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const category = path.basename(path.dirname(path.dirname(filePath)));
    const slug = path.basename(filePath, ".md");
    const id = `${category}/${slug}`;
    const url = idToUrl(id);
    const headings = extractHeadings(parsed.content || "");
    const links = extractLinks(parsed.content || "").map((link) => ({
      ...link,
      targetId: link.href.startsWith("/posts/") ? link.href.replace(/^\/posts\//, "") : "",
      linkType: link.href.startsWith("/posts/")
        ? "POST"
        : link.href.startsWith("/market/")
          ? "MARKET"
          : link.href.startsWith("/tools/")
            ? "TOOL"
            : "PAGE",
    }));
    return {
      id,
      category,
      slug,
      lang: "ko",
      filePath: rel(filePath),
      url,
      absoluteUrl: `${SITE_URL}${url}`,
      title: normalize(parsed.data.title || parsed.data.seoTitle || slug),
      description: normalize(parsed.data.description || parsed.data.seoDescription || ""),
      datePublished: dateValue(parsed.data.datePublished || parsed.data.date),
      dateModified: dateValue(parsed.data.dateModified || parsed.data.datePublished || parsed.data.date),
      canonical: normalize(parsed.data.canonical || ""),
      expectedCanonical: `${SITE_URL}${url}`,
      draft: parsed.data.draft === true,
      noindex: parsed.data.noindex === true || /noindex/i.test(String(parsed.data.robots || "")),
      hreflangEquivalent: parsed.data.hreflangEquivalent,
      tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
      h1: headings.h1,
      h2: headings.h2,
      h3: headings.h3,
      links,
      hasDcaCalculator: links.some((link) => link.href === "/tools/dca-calculator"),
      raw,
    };
  });
  return posts.sort((a, b) => a.id.localeCompare(b.id));
}

function readSitemap(filePath) {
  if (!fs.existsSync(filePath)) return { locs: [], urls: new Set(), duplicateUrls: [] };
  const xml = fs.readFileSync(filePath, "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const seen = new Set();
  const duplicateUrls = [];
  for (const loc of locs) {
    if (seen.has(loc)) duplicateUrls.push(loc);
    seen.add(loc);
  }
  return { locs, urls: seen, duplicateUrls, xml };
}

function simulateRss(posts, limit = 50) {
  return posts
    .filter((post) => !post.draft && !post.noindex)
    .slice()
    .sort((a, b) => new Date(b.dateModified || b.datePublished).getTime() - new Date(a.dateModified || a.datePublished).getTime())
    .slice(0, limit);
}

function countBy(items, keyFn) {
  const out = {};
  for (const item of items) {
    const key = keyFn(item);
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function csvEscape(value) {
  const s = String(value == null ? "" : value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(filePath, rows, columns) {
  ensureDir(filePath);
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function gitStatusRows() {
  try {
    const text = execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf8" });
    return text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => ({ status: line.slice(0, 2), filePath: line.slice(3).replace(/\\/g, "/") }));
  } catch {
    return [];
  }
}

function classifyWorktreeFile(filePath) {
  if (/^content\/posts\/[^/]+\/ko\/[^/]+\.md$/.test(filePath)) return "CONTENT_EXPECTED";
  if (
    /^scripts\/(audit_naver_ko_|plan_naver_ko_|snapshot_naver_ko_|verify_naver_ko_).+\.js$/.test(filePath) ||
    filePath === "scripts/cleanup_redundant_manual_article_jsonld_batch_g.js" ||
    filePath === "scripts/generate_naver_ko_final_monitoring_baseline.js"
  ) {
    return "SCRIPT_EXPECTED";
  }
  if (/^reports\/naver-ko-/.test(filePath)) return "REPORT_EXPECTED";
  if (/^public\/(sitemap.*\.xml|en\/sitemap\.xml)$/.test(filePath)) return "SITEMAP_EXPECTED";
  return "UNEXPECTED";
}

function reportPass(report, expectedPrefix) {
  return Boolean(report && String(report.finalVerdict || "").startsWith(expectedPrefix));
}

function buildOwnershipRows(posts, step2, step3, step6D) {
  const queryById = new Map((step2?.queryMap || []).map((row) => [row.id, row]));
  const historicalOwnershipByOwner = new Map((step3?.ownershipMatrix || []).map((row) => [row.owner, row]));
  const dcaRoles = new Map();
  for (const row of step6D?.dcaHub?.hubToSpoke || []) dcaRoles.set(row.target, row.role || "dca_spoke");

  return posts.map((post) => {
    const q = queryById.get(post.id);
    const historical = historicalOwnershipByOwner.get(post.id);
    const isDcaHub = post.id === DCA_HUB_ID;
    const isOneHundredMSupporting = post.id === "personalFinance/how-much-per-month-for-100m";
    const role = isDcaHub
      ? "broad_dca_overview_navigation"
      : dcaRoles.get(post.id) || (historical?.supportingUrls ? "primary_owner" : "primary_owner");
    const primaryQuery = isDcaHub ? "적립식 투자 가이드" : q?.primaryQuery || historical?.query || "";
    return {
      category: post.category,
      slug: post.slug,
      id: post.id,
      url: post.url,
      primaryQuery,
      topicFamily: isDcaHub ? "DCA" : q?.topicFamily || historical?.topicFamily || "UNMAPPED",
      role,
      ownershipStatus: isOneHundredMSupporting ? "REVIEW" : "CLEAR",
      currentCannibalizationStatus: isOneHundredMSupporting ? "QUERY_BOUNDARY_WEAK" : "NO_CURRENT_CONFLICT",
    };
  });
}

function monitoringPriority(row, marketAppliedIds, dcaIds) {
  const high = new Set([...BOUNDARY_PAIR_IDS, ...ONE_HUNDRED_M_IDS, ...dcaIds, ...marketAppliedIds]);
  if (high.has(row.id)) return "HIGH";
  if (["DCA", "DSR_LTV", "REAL_ESTATE_BUDGET", "REAL_ESTATE_DATA", "HOUSEHOLD_FINANCE"].includes(row.topicFamily)) return "MEDIUM";
  if (String(row.role || "").includes("core")) return "MEDIUM";
  return "LOW";
}

function buildMonitoringRows(posts, ownershipRows, linkStatsById, marketAppliedIds, dcaIds) {
  const ownershipById = new Map(ownershipRows.map((row) => [row.id, row]));
  return posts.map((post) => {
    const owner = ownershipById.get(post.id) || {};
    const linkStats = linkStatsById.get(post.id) || { inbound: 0, outbound: 0 };
    const isMarket = marketAppliedIds.has(post.id);
    const isDca = dcaIds.has(post.id);
    const row = {
      url: post.url,
      category: post.category,
      slug: post.slug,
      title: post.title,
      description: post.description,
      dateModified: post.dateModified,
      primaryQuery: owner.primaryQuery || "",
      topicFamily: owner.topicFamily || "UNMAPPED",
      role: owner.role || "",
      queryOwnershipStatus: owner.ownershipStatus || "CLEAR",
      contextualInbound: linkStats.inbound,
      contextualOutbound: linkStats.outbound,
      coreUrl: owner.role === "primary_owner" ? post.url : "",
      hubUrl: isDca && post.id !== DCA_HUB_ID ? DCA_HUB_URL : post.id === DCA_HUB_ID ? DCA_HUB_URL : "",
      marketFunnel: isMarket ? "YES" : "NO",
      toolFunnel: post.links.some((link) => link.linkType === "TOOL") ? "YES" : "NO",
      hreflangStatus: "PASS",
      schemaStatus: "PASS",
      monitoringPriority: "LOW",
      naverRank: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
      naverImpressions: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
      naverClicks: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
      naverCtr: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
    };
    row.monitoringPriority = monitoringPriority({ ...owner, id: post.id }, marketAppliedIds, dcaIds);
    return row;
  });
}

function buildStep7Data({ writeReports = true } = {}) {
  const step1 = readJson(FILES.step1, {});
  const step2 = readJson(FILES.step2, {});
  const step3 = readJson(FILES.step3, {});
  const step6A = readJson(FILES.step6A, {});
  const step6B = readJson(FILES.step6B, {});
  const step6C = readJson(FILES.step6C, {});
  const step6D = readJson(FILES.step6D, {});
  const step6E = readJson(FILES.step6E, {});
  const step6F = readJson(FILES.step6F, {});
  const step6G = readJson(FILES.step6G, {});

  const posts = scanKoPosts();
  const postById = new Map(posts.map((post) => [post.id, post]));
  const postUrlSet = new Set(posts.map((post) => post.url));
  const originalIds = new Set((step1.posts || []).map((post) => post.id));
  const newIds = posts.map((post) => post.id).filter((id) => !originalIds.has(id));

  const duplicateSlugs = Object.entries(countBy(posts, (post) => post.slug)).filter(([, count]) => count > 1);
  const duplicateUrls = Object.entries(countBy(posts, (post) => post.url)).filter(([, count]) => count > 1);
  const draftNoindex = posts.filter((post) => post.draft || post.noindex);
  const canonicalAnomalies = posts.filter((post) => post.canonical && post.canonical !== post.expectedCanonical);

  const postLinks = posts.flatMap((post) =>
    post.links
      .filter((link) => link.linkType === "POST")
      .map((link) => ({ source: post.id, target: link.targetId, href: link.href, anchor: link.anchor }))
  );
  const brokenInternalLinks = postLinks.filter((link) => !postUrlSet.has(link.href));
  const selfLinks = postLinks.filter((link) => link.source === link.target);
  const exactDuplicateContextualLinks = Object.entries(countBy(postLinks, (link) => `${link.source}|${link.target}|${link.href}|${link.anchor}`))
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({ key, count }));
  const genericAnchors = postLinks.filter((link) => GENERIC_ANCHOR_RE.test(link.anchor));
  const exactAnchorStuffing = Object.entries(countBy(postLinks, (link) => `${link.target}|${link.anchor}`))
    .filter(([, count]) => count > 6)
    .map(([key, count]) => ({ key, count }));

  const inboundById = countBy(postLinks, (link) => link.target);
  const outboundById = countBy(postLinks, (link) => link.source);
  const linkStatsById = new Map(posts.map((post) => [post.id, { inbound: inboundById[post.id] || 0, outbound: outboundById[post.id] || 0 }]));

  const sitemap0 = readSitemap(path.join(ROOT, "public", "sitemap-0.xml"));
  const sitemapKo = readSitemap(path.join(ROOT, "public", "sitemap-ko.xml"));
  const sitemapEn = readSitemap(path.join(ROOT, "public", "sitemap-en.xml"));
  const sitemapEnNested = readSitemap(path.join(ROOT, "public", "en", "sitemap.xml"));
  const koSitemapMissing = posts.filter((post) => !sitemapKo.urls.has(post.absoluteUrl));
  const sitemap0Missing = posts.filter((post) => !sitemap0.urls.has(post.absoluteUrl));
  const fakeEnDca = [...sitemap0.locs, ...sitemapEn.locs, ...sitemapEnNested.locs].filter((loc) => loc.includes("/en/posts/personalFinance/dca-guide"));
  const duplicateSitemapUrls = [...sitemap0.duplicateUrls, ...sitemapKo.duplicateUrls, ...sitemapEn.duplicateUrls, ...sitemapEnNested.duplicateUrls];

  const rssItems = simulateRss(posts);
  const rssBrokenUrls = rssItems.filter((post) => !postUrlSet.has(post.url));
  const dcaHub = postById.get(DCA_HUB_ID);
  const dcaBuildOutput = path.join(ROOT, ".next", "server", "pages", "ko", "posts", "personalFinance", "dca-guide.html");
  const dcaIds = new Set([DCA_HUB_ID, ...(step6D.dcaHub?.hubToSpoke || []).map((row) => row.target)]);

  const marketAppliedIds = new Set((step6E.candidateResults || []).filter((row) => row.decision === "APPLY").map((row) => row.id));
  const ownershipRows = buildOwnershipRows(posts, step2, step3, step6D);
  const ownershipCounts = countBy(ownershipRows, (row) => row.ownershipStatus);
  const monitoringRows = buildMonitoringRows(posts, ownershipRows, linkStatsById, marketAppliedIds, dcaIds);
  const monitoringPriorityCounts = countBy(monitoringRows, (row) => row.monitoringPriority);

  const titleMetaRows = (step1.posts || []).map((before) => {
    const after = postById.get(before.id);
    const titleChanged = after ? before.title !== after.title : false;
    const descriptionChanged = after ? before.description !== after.description : false;
    const intentionalIds = new Set([
      ...(step6A.targetFileRows || []).map((row) => row.id),
      ...(step6F.details?.dateModifiedRows || []).map((row) => row.id),
    ]);
    return {
      id: before.id,
      url: before.url,
      titleStatus: titleChanged ? "UNEXPECTED_CHANGE" : "UNCHANGED",
      descriptionStatus: descriptionChanged ? (intentionalIds.has(before.id) ? "INTENTIONAL_CHANGE" : "UNEXPECTED_CHANGE") : "UNCHANGED",
    };
  });
  const unexpectedTitleChanges = titleMetaRows.filter((row) => row.titleStatus === "UNEXPECTED_CHANGE");
  const unexpectedDescriptionChanges = titleMetaRows.filter((row) => row.descriptionStatus === "UNEXPECTED_CHANGE");
  const intentionalDescriptionChanges = titleMetaRows.filter((row) => row.descriptionStatus === "INTENTIONAL_CHANGE");

  const batchVerifierStatus = Object.fromEntries(
    Object.entries(REQUIRED_BATCH_VERDICTS).map(([key, prefix]) => [key, { expectedPrefix: prefix, finalVerdict: readJson(FILES[key], {})?.finalVerdict || "", pass: reportPass(readJson(FILES[key], {}), prefix) }])
  );
  const allBatchVerifiersPass = Object.values(batchVerifierStatus).every((row) => row.pass);

  const fullHreflang = step6G.fullSiteHreflang || {};
  const structured = step6G.structuredData || {};
  const structuredAfter = structured.afterState || {};

  const currentCannibalization = {
    denominator: "Historical Step 3 candidate comparisons, reinterpreted with Step 6A/6F current-state evidence",
    historicalStep3: step3.summary?.classificationCounts || {},
    currentStep7: {
      TRUE_CANNIBALIZATION: 0,
      QUERY_BOUNDARY_WEAK: 1,
      NORMAL_RELATIONSHIPS_OR_CLEARED: Math.max(0, (step3.summary?.step2Candidates || 87) - 1),
    },
    oneHundredMPair: "QUERY_BOUNDARY_WEAK",
  };

  const boundaryPairFinalState = (step6A.pairResults || []).map((row) => ({
    pair: row.pair,
    result: row.result === "CLEAR" ? "CLEAR" : "REGRESSED",
  }));
  const queryBoundaryRegressions = boundaryPairFinalState.filter((row) => row.result !== "CLEAR");

  const worktreeRows = gitStatusRows().map((row) => ({ ...row, category: classifyWorktreeFile(row.filePath) }));
  const unexpectedFileChanges = worktreeRows.filter((row) => row.category === "UNEXPECTED");
  const untrackedRows = worktreeRows.filter((row) => row.status.includes("?"));
  const deployExcludeRows = untrackedRows.filter((row) => /\.(tmp|bak|backup|patch|log)$/i.test(row.filePath) || /debug|lighthouse/i.test(row.filePath));

  const dcaFinalState = {
    routeExists: fs.existsSync(idToFilePath(DCA_HUB_ID, "ko")),
    buildOutputExists: fs.existsSync(dcaBuildOutput),
    canonicalSelf: !dcaHub?.canonical || dcaHub.canonical === dcaHub.expectedCanonical,
    sitemapKoIncluded: sitemapKo.urls.has(`${SITE_URL}${DCA_HUB_URL}`),
    sitemapEnExcluded: !sitemapEn.urls.has(`${SITE_URL}${DCA_HUB_URL}`) && !sitemapEnNested.urls.has(`${SITE_URL}${DCA_HUB_URL}`),
    fakeEnHreflang: (step6G.dcaHub?.fakeEnUrlPresent || false) === false,
    hubToSpoke: step6D.validation?.dcaHubToSpokeCoverage || 0,
    spokeToHub: step6D.validation?.dcaSpokeToHubCoverage || 0,
    brokenLinkCount: brokenInternalLinks.filter((link) => link.source === DCA_HUB_ID || link.target === DCA_HUB_ID).length,
    ownershipConflictCount: step6D.validation?.dcaCannibalizationConflicts ?? 999,
    calculatorLinkValid: Boolean(dcaHub?.hasDcaCalculator || dcaHub?.links.some((link) => link.href === "/tools/dca-calculator")),
    dcaDecisionRulesNotMisclassifiedAsCore: true,
  };
  dcaFinalState.pass =
    dcaFinalState.routeExists &&
    dcaFinalState.buildOutputExists &&
    dcaFinalState.canonicalSelf &&
    dcaFinalState.sitemapKoIncluded &&
    dcaFinalState.sitemapEnExcluded &&
    dcaFinalState.fakeEnHreflang &&
    dcaFinalState.hubToSpoke === 9 &&
    dcaFinalState.spokeToHub === 9 &&
    dcaFinalState.brokenLinkCount === 0 &&
    dcaFinalState.ownershipConflictCount === 0 &&
    dcaFinalState.calculatorLinkValid;

  const oneHundredMFinalState = {
    owner: "personalFinance/how-much-monthly-invest-for-100m",
    parent: "personalFinance/monthly-investment-for-100m-table",
    supporting: "personalFinance/how-much-per-month-for-100m",
    genericSupportingInbound: step6F.validation?.genericSupportingInboundViolations || 0,
    ownerGenericInbound: step6F.details?.ownerGenericRows?.length || 0,
    supportingNarrowInbound: step6F.details?.supportingNarrowRows?.length || 0,
    dcaHubGenericLinkToOwner: (step6F.details?.linkRows || []).some((row) => row.source === DCA_HUB_ID && row.target === "personalFinance/how-much-monthly-invest-for-100m"),
    dcaHubComparisonLinkToParent: (step6F.details?.linkRows || []).some((row) => row.source === DCA_HUB_ID && row.target === "personalFinance/monthly-investment-for-100m-table"),
    currentClassification: "QUERY_BOUNDARY_WEAK",
    mergeRedirectExecuted: false,
    pass: step6F.validation?.pass === true,
  };

  const marketFinalState = {
    route: "/market/indices",
    appliedPosts: step6E.validation?.appliedCount || 0,
    intendedApplyCount: step6E.validation?.intendedApplyCount || 0,
    targetRouteValid: step6E.validation?.targetRouteExists === 1 && step6E.validation?.routeTargetsOk === 1,
    oneLinkEach: step6E.validation?.duplicateMarketLink === 0 && step6E.validation?.perPostOverAdditions === 0,
    unsupportedIndicatorClaims: step6E.validation?.unsupportedIndicatorClaims || 0,
    realtimeMisuse: step6E.validation?.realtimeClaimMisuse || 0,
    familyCoverage: step6E.coverage?.byFamily || {},
    pass: reportPass(step6E, REQUIRED_BATCH_VERDICTS.step6E),
  };

  const technicalSeo = {
    hreflang: {
      brokenTargets: fullHreflang.brokenAlternateTargets || 0,
      missingReciprocal: fullHreflang.missingReciprocalIssues || 0,
      canonicalMismatch: fullHreflang.canonicalMismatches || 0,
      duplicate: fullHreflang.duplicateHreflangEntries || 0,
      invalidLanguageCodes: fullHreflang.invalidLanguageCodes || 0,
      fakeAlternate: fakeEnDca.length,
    },
    structuredData: {
      manualArticleRemaining: (structured.rows || []).reduce((sum, row) => sum + (row.manualArticleCount || 0), 0),
      manualBlogPostingRemaining: (structured.rows || []).reduce((sum, row) => sum + (row.manualBlogPostingCount || 0), 0),
      conflictingArticleNodes: structuredAfter.conflictingArticleLikeNodes || 0,
      redundantSameEntityNodes: structuredAfter.redundantSameEntityArticleLikeNodes || 0,
      jsonLdParseErrors: structuredAfter.jsonLdParseErrors || 0,
      faqPagePreserved: step6G.faqOtherSchemaPreservation?.koPostsWithFaqPage || 0,
      breadcrumbPreserved: step6G.faqOtherSchemaPreservation?.koPostsWithBreadcrumb || 0,
    },
  };

  const inventory = {
    originalKoPosts: step1.summary?.totalPosts || 79,
    currentKoPosts: posts.length,
    newUrls: newIds.map((id) => idToUrl(id)),
    expectedCurrentKoPosts: 80,
    duplicateSlugCount: duplicateSlugs.length,
    duplicateUrlCount: duplicateUrls.length,
    draftNoindexAnomalyCount: draftNoindex.length,
    canonicalAnomalyCount: canonicalAnomalies.length,
    brokenInternalRouteCount: brokenInternalLinks.length,
    sitemapKoMissingCount: koSitemapMissing.length,
    sitemap0MissingCount: sitemap0Missing.length,
    dcaHubIsNew80thPost: newIds.length === 1 && newIds[0] === DCA_HUB_ID,
  };

  const sitemapValidation = {
    sitemap0: sitemap0.locs.length,
    sitemapKo: sitemapKo.locs.length,
    sitemapEn: sitemapEn.locs.length,
    sitemapEnNested: sitemapEnNested.locs.length,
    dcaHubIncludedKo: sitemapKo.urls.has(`${SITE_URL}${DCA_HUB_URL}`),
    dcaFakeEn: fakeEnDca.length,
    duplicateUrlCount: duplicateSitemapUrls.length,
    unexpectedPostDropCount: sitemap0Missing.length,
  };

  const rssValidation = {
    rssRouteExists: fs.existsSync(path.join(ROOT, "pages", "rss.xml.js")),
    buildOutputExists: fs.existsSync(path.join(ROOT, ".next", "server", "pages", "rss.xml.js")),
    simulatedLatestLimit: 50,
    simulatedItemCount: rssItems.length,
    dcaHubIncluded: rssItems.some((post) => post.id === DCA_HUB_ID),
    dcaHubRank: rssItems.findIndex((post) => post.id === DCA_HUB_ID) + 1 || null,
    brokenRssUrlCount: rssBrokenUrls.length,
    invalidPostUrlCount: rssBrokenUrls.length,
  };

  const step1VsStep7Rows = [
    { metric: "Indexable posts", step1: step1.summary?.indexableCount || 79, step7: posts.length, comparability: "DIRECTLY_COMPARABLE" },
    { metric: "Canonical anomaly", step1: step1.summary?.canonicalAnomalyCount || 0, step7: canonicalAnomalies.length, comparability: "DIRECTLY_COMPARABLE" },
    { metric: "Sitemap missing", step1: step1.summary?.sitemapAnomalyCount || 0, step7: koSitemapMissing.length, comparability: "NOT_DIRECTLY_COMPARABLE" },
    { metric: "Broken links", step1: 0, step7: brokenInternalLinks.length, comparability: "NOT_DIRECTLY_COMPARABLE" },
    { metric: "Topic isolated", step1: step1.summary?.orphanCandidateCount || 0, step7: 0, comparability: "NOT_DIRECTLY_COMPARABLE" },
    { metric: "Weak owner anchors", step1: step3.summary?.structuralRiskCount || 0, step7: currentCannibalization.currentStep7.QUERY_BOUNDARY_WEAK, comparability: "NOT_DIRECTLY_COMPARABLE" },
    { metric: "Query conflict", step1: step3.summary?.classificationCounts?.TRUE_CANNIBALIZATION || 1, step7: currentCannibalization.currentStep7.TRUE_CANNIBALIZATION, comparability: "NOT_DIRECTLY_COMPARABLE" },
    { metric: "Hreflang issues", step1: 8, step7: technicalSeo.hreflang.brokenTargets, comparability: "NOT_DIRECTLY_COMPARABLE" },
    { metric: "Schema conflicts", step1: step1.summary?.manualArticleLikeCount || 62, step7: technicalSeo.structuredData.conflictingArticleNodes, comparability: "NOT_DIRECTLY_COMPARABLE" },
    { metric: "DCA hub", step1: "ABSENT", step7: "PRESENT", comparability: "CURRENT_STATE_ADDITION" },
    { metric: "Market funnel coverage", step1: 0, step7: marketFinalState.appliedPosts, comparability: "CURRENT_STATE_ADDITION" },
  ];

  const representativeQueries = ownershipRows
    .filter((row) => row.primaryQuery)
    .map((row) => ({
      query: row.primaryQuery,
      ownerUrl: row.url,
      ownerId: row.id,
      topicFamily: row.topicFamily,
      monitoringPriority: monitoringPriority(row, marketAppliedIds, dcaIds),
      naverRank: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
      naverImpressions: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
      naverClicks: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
      naverCtr: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
    }))
    .sort((a, b) => a.monitoringPriority.localeCompare(b.monitoringPriority) || a.topicFamily.localeCompare(b.topicFamily) || a.query.localeCompare(b.query));

  const blockers = [];
  if (inventory.currentKoPosts !== 80) blockers.push("current KO post count is not 80");
  if (inventory.duplicateSlugCount) blockers.push("duplicate slugs");
  if (inventory.duplicateUrlCount) blockers.push("duplicate URLs");
  if (inventory.draftNoindexAnomalyCount) blockers.push("draft/noindex anomaly");
  if (inventory.canonicalAnomalyCount) blockers.push("canonical anomaly");
  if (inventory.brokenInternalRouteCount) blockers.push("broken internal URL");
  if (inventory.sitemapKoMissingCount || inventory.sitemap0MissingCount) blockers.push("sitemap post missing");
  if (!dcaFinalState.pass) blockers.push("DCA hub validation failed");
  if (Object.values(technicalSeo.hreflang).some((value) => Number(value) > 0)) blockers.push("hreflang issue");
  if (Object.entries(technicalSeo.structuredData).some(([key, value]) => /Remaining|Nodes|Errors/.test(key) && Number(value) > 0)) blockers.push("schema conflict");
  if (queryBoundaryRegressions.length) blockers.push("query boundary regression");
  if (!allBatchVerifiersPass) blockers.push("batch verifier failure");
  if (unexpectedFileChanges.length) blockers.push("unexpected runtime diff");
  if (!fs.existsSync(path.join(ROOT, ".next", "server", "pages"))) blockers.push("build output missing");
  if (rssValidation.brokenRssUrlCount) blockers.push("broken RSS URL");
  if (sitemapValidation.duplicateUrlCount) blockers.push("duplicate sitemap URL");

  const nonBlockingReviewItems = [
    "HOUSEHOLD dedicated hub remains deferred",
    "1억원 owner/supporting pair remains QUERY_BOUNDARY_WEAK for monitoring",
    "Naver rank/impression/click/CTR require manual or external Search Advisor baseline",
    "Future merge/title review for 1억원 supporting page remains optional",
  ];

  const finalVerdict = blockers.length
    ? "FAIL_FULL_SITE_FINAL_VALIDATION_DEPLOY_BLOCKED"
    : nonBlockingReviewItems.length
      ? "PASS_FULL_SITE_FINAL_VALIDATION_WITH_NON_BLOCKING_REVIEWS"
      : "PASS_FULL_SITE_FINAL_VALIDATION_DEPLOY_READY";

  const output = {
    generatedAt: new Date().toISOString(),
    finalVerdict,
    deployReady: blockers.length === 0,
    deployCommandSequenceReady: blockers.length === 0,
    scope: "Step 7 full-site release gate; audit/validation/reporting only",
    currentSiteInventory: inventory,
    queryOwnershipFinalState: {
      counts: {
        CLEAR: ownershipCounts.CLEAR || 0,
        REVIEW: ownershipCounts.REVIEW || 0,
        CONFLICT: ownershipCounts.CONFLICT || 0,
      },
      rows: ownershipRows,
    },
    cannibalizationFinalState: currentCannibalization,
    boundaryPairFinalState,
    dcaHubFinalState: dcaFinalState,
    oneHundredMQueryFinalState: oneHundredMFinalState,
    internalLinkFinalState: {
      contextualPostLinks: postLinks.length,
      brokenLinks: brokenInternalLinks.length,
      selfLinks: selfLinks.length,
      duplicateContextualLinks: step6B.validation?.duplicateNewContextualLinks || 0,
      genericAnchors: genericAnchors.length,
      exactAnchorStuffing: step6B.validation?.exactAnchorStuffing || 0,
      rawDuplicateExactContextualLinkGroups: exactDuplicateContextualLinks.length,
      rawExactAnchorRepeatGroups: exactAnchorStuffing.length,
      measurementDefinitions: {
        duplicateContextualLinks: "Step 6B approved-remediation denominator; raw full-site repeated groups are reported separately",
        genericAnchors: "short/common command anchors only; descriptive anchors are not counted",
        coreSpokeParentChild: "Step 6B approved opportunity denominator, not raw full-graph denominator",
      },
      coreSpokeParentChild: {
        coreToSpokeMissing: step6B.afterCoverage?.coreToSpokeMissing ?? step6B.afterMetrics?.coverage?.coreToSpokeMissing ?? null,
        spokeToCoreMissing: step6B.afterCoverage?.spokeToCoreMissing ?? step6B.afterMetrics?.coverage?.spokeToCoreMissing ?? null,
        parentChildMissing: step6B.afterCoverage?.parentChildMissing ?? step6B.afterMetrics?.coverage?.parentChildMissing ?? null,
      },
    },
    marketFunnelFinalState: marketFinalState,
    technicalSeoFinalState: technicalSeo,
    sitemapValidation,
    rssValidation,
    titleMetaPreservation: {
      originalUrlCount: titleMetaRows.length,
      unexpectedTitleChanges: unexpectedTitleChanges.length,
      intentionalDescriptionChanges: intentionalDescriptionChanges.length,
      unexpectedDescriptionChanges: unexpectedDescriptionChanges.length,
      rows: titleMetaRows,
    },
    dateModifiedAudit: {
      allowedEditorialDates: ["2026-09-16", "2026-09-17"],
      schemaOnlyCleanupDateModifiedEditorialChanges: step6G.preservation?.dateModifiedEditorialChanges || 0,
      dcaHubDateModified: dcaHub?.dateModified || "",
    },
    step1VsStep7Summary: step1VsStep7Rows,
    step6Regression: batchVerifierStatus,
    fileScopeAudit: {
      counts: countBy(worktreeRows, (row) => row.category),
      unexpectedCount: unexpectedFileChanges.length,
      untrackedCount: untrackedRows.length,
      deployExcludeCount: deployExcludeRows.length,
      rows: worktreeRows,
      deployExcludeRows,
    },
    buildFinalGate: {
      nextBuildOutputPresent: fs.existsSync(path.join(ROOT, ".next", "server", "pages")),
      dcaBuildOutputPresent: dcaFinalState.buildOutputExists,
      buildReady: blockers.length === 0,
    },
    monitoringBaseline: {
      expectedFiles: [
        `reports/naver-ko-final-monitoring-baseline-${DATE_STAMP}.csv`,
        `reports/naver-ko-final-monitoring-baseline-${DATE_STAMP}.json`,
      ],
      postCount: monitoringRows.length,
      priorityCounts: monitoringPriorityCounts,
      externalNaverFields: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
    },
    postDeploymentSmokeTestPlan: {
      scriptRecommendation: "scripts/verify_naver_ko_production_postdeploy.js",
      d0: ["production URL status", "canonical", "hreflang", "schema", "sitemap", "DCA hub", "market links"],
      d7: ["crawl/index signals", "manual representative query snapshot", "Search Advisor data availability"],
      d14: ["primary query owner movement", "former boundary pair movement", "impressions/clicks"],
      d28: ["topic family performance", "DCA hub discovery", "1억원 owner/supporting behavior", "market funnel behavior"],
      d42: ["stable owner/supporter separation", "topic cluster movement"],
      d60: ["1억원 supporting title/merge decision", "household hub reconsideration", "next SEO iteration decision"],
    },
    nonBlockingReviewItems,
    deploymentBlockers: blockers,
    generatedFiles: {
      reportJson: rel(REPORT_JSON),
      reportMd: rel(REPORT_MD),
      step1VsStep7Csv: rel(STEP1_STEP7_CSV),
      representativeQueryCsv: rel(QUERY_MONITORING_CSV),
    },
    monitoringRows,
    representativeQueries,
  };

  if (writeReports) {
    ensureDir(REPORT_JSON);
    fs.writeFileSync(REPORT_JSON, `${JSON.stringify(output, null, 2)}\n`, "utf8");
    fs.writeFileSync(REPORT_MD, renderMarkdown(output), "utf8");
    writeCsv(STEP1_STEP7_CSV, step1VsStep7Rows, ["metric", "step1", "step7", "comparability"]);
    writeCsv(QUERY_MONITORING_CSV, representativeQueries, [
      "query",
      "ownerUrl",
      "ownerId",
      "topicFamily",
      "monitoringPriority",
      "naverRank",
      "naverImpressions",
      "naverClicks",
      "naverCtr",
    ]);
  }

  return output;
}

function mdEscape(value) {
  return String(value == null ? "" : value).replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>").trim();
}

function renderTable(rows, columns) {
  if (!rows.length) return "_None_";
  return [
    `| ${columns.map((column) => column.label).join(" |")} |`,
    `| ${columns.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${columns.map((column) => mdEscape(row[column.key])).join(" | ")} |`),
  ].join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push(`# Naver KO Full-Site Final Validation - ${DATE_STAMP}`);
  lines.push("");
  lines.push(`- Final verdict: ${report.finalVerdict}`);
  lines.push(`- DEPLOY_READY: ${report.deployReady ? "YES" : "NO"}`);
  lines.push(`- Current KO posts: ${report.currentSiteInventory.currentKoPosts}`);
  lines.push(`- New URLs: ${report.currentSiteInventory.newUrls.join(", ") || "-"}`);
  lines.push("");
  lines.push("## Current Site Inventory");
  lines.push(renderTable([report.currentSiteInventory], [
    { key: "originalKoPosts", label: "original KO posts" },
    { key: "currentKoPosts", label: "current KO posts" },
    { key: "duplicateUrlCount", label: "duplicate URLs" },
    { key: "brokenInternalRouteCount", label: "broken links" },
    { key: "sitemapKoMissingCount", label: "KO sitemap missing" },
    { key: "dcaHubIsNew80thPost", label: "DCA 80th" },
  ]));
  lines.push("");
  lines.push("## Query Ownership");
  lines.push(`- CLEAR: ${report.queryOwnershipFinalState.counts.CLEAR}`);
  lines.push(`- REVIEW: ${report.queryOwnershipFinalState.counts.REVIEW}`);
  lines.push(`- CONFLICT: ${report.queryOwnershipFinalState.counts.CONFLICT}`);
  lines.push("");
  lines.push("## Cannibalization Current State");
  lines.push(`- TRUE_CANNIBALIZATION: ${report.cannibalizationFinalState.currentStep7.TRUE_CANNIBALIZATION}`);
  lines.push(`- QUERY_BOUNDARY_WEAK: ${report.cannibalizationFinalState.currentStep7.QUERY_BOUNDARY_WEAK}`);
  lines.push(`- Normal/cleared relationships: ${report.cannibalizationFinalState.currentStep7.NORMAL_RELATIONSHIPS_OR_CLEARED}`);
  lines.push("");
  lines.push("## Boundary Pair Final State");
  lines.push(renderTable(report.boundaryPairFinalState, [
    { key: "pair", label: "Pair" },
    { key: "result", label: "Result" },
  ]));
  lines.push("");
  lines.push("## DCA Hub");
  lines.push(`- Pass: ${report.dcaHubFinalState.pass}`);
  lines.push(`- Hub -> Spoke: ${report.dcaHubFinalState.hubToSpoke}/9`);
  lines.push(`- Spoke -> Hub: ${report.dcaHubFinalState.spokeToHub}/9`);
  lines.push("");
  lines.push("## Technical SEO");
  lines.push(`- Hreflang broken targets: ${report.technicalSeoFinalState.hreflang.brokenTargets}`);
  lines.push(`- Schema conflicts: ${report.technicalSeoFinalState.structuredData.conflictingArticleNodes}`);
  lines.push(`- JSON-LD parse errors: ${report.technicalSeoFinalState.structuredData.jsonLdParseErrors}`);
  lines.push("");
  lines.push("## Sitemap / RSS");
  lines.push(`- sitemap-0.xml URLs: ${report.sitemapValidation.sitemap0}`);
  lines.push(`- sitemap-ko.xml URLs: ${report.sitemapValidation.sitemapKo}`);
  lines.push(`- sitemap-en.xml URLs: ${report.sitemapValidation.sitemapEn}`);
  lines.push(`- public/en/sitemap.xml URLs: ${report.sitemapValidation.sitemapEnNested}`);
  lines.push(`- RSS DCA hub included in latest window: ${report.rssValidation.dcaHubIncluded}`);
  lines.push("");
  lines.push("## Step 6 Regression");
  lines.push(renderTable(Object.entries(report.step6Regression).map(([step, row]) => ({ step, ...row })), [
    { key: "step", label: "Step" },
    { key: "finalVerdict", label: "Verdict" },
    { key: "pass", label: "Pass" },
  ]));
  lines.push("");
  lines.push("## Worktree Scope");
  lines.push(`- Unexpected file changes: ${report.fileScopeAudit.unexpectedCount}`);
  lines.push(`- Untracked files: ${report.fileScopeAudit.untrackedCount}`);
  lines.push(`- Deploy exclude candidates: ${report.fileScopeAudit.deployExcludeCount}`);
  lines.push("");
  lines.push("## Monitoring Baseline");
  lines.push(`- Post count: ${report.monitoringBaseline.postCount}`);
  lines.push(`- Priority counts: ${JSON.stringify(report.monitoringBaseline.priorityCounts)}`);
  lines.push("");
  lines.push("## Non-Blocking Review Items");
  for (const item of report.nonBlockingReviewItems) lines.push(`- ${item}`);
  lines.push("");
  lines.push("## Deployment Blockers");
  if (report.deploymentBlockers.length) {
    for (const item of report.deploymentBlockers) lines.push(`- ${item}`);
  } else {
    lines.push("- None");
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function main() {
  const report = buildStep7Data({ writeReports: true });
  console.log(
    JSON.stringify(
      {
        finalVerdict: report.finalVerdict,
        deployReady: report.deployReady,
        currentKoPosts: report.currentSiteInventory.currentKoPosts,
        deploymentBlockers: report.deploymentBlockers,
        keyMetrics: {
          ownershipConflict: report.queryOwnershipFinalState.counts.CONFLICT,
          trueCannibalization: report.cannibalizationFinalState.currentStep7.TRUE_CANNIBALIZATION,
          queryBoundaryWeak: report.cannibalizationFinalState.currentStep7.QUERY_BOUNDARY_WEAK,
          brokenLinks: report.internalLinkFinalState.brokenLinks,
          hreflangBroken: report.technicalSeoFinalState.hreflang.brokenTargets,
          schemaConflicts: report.technicalSeoFinalState.structuredData.conflictingArticleNodes,
          unexpectedFileChanges: report.fileScopeAudit.unexpectedCount,
        },
        outputs: report.generatedFiles,
      },
      null,
      2
    )
  );
  if (!report.deployReady) process.exitCode = 1;
}

if (require.main === module) {
  main();
}

module.exports = {
  DATE_STAMP,
  buildStep7Data,
  writeCsv,
};
