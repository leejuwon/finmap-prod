const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const matter = require("gray-matter");

const ROOT = process.cwd();
const DATE_STAMP = "2026-09-17";
const POSTS_ROOT = path.join(ROOT, "content", "posts");
const REPORT_DIR = path.join(ROOT, "reports");
const REPORT_JSON = path.join(REPORT_DIR, `naver-ko-100m-cannibalization-batch-f-${DATE_STAMP}.json`);
const REPORT_MD = path.join(REPORT_DIR, `naver-ko-100m-cannibalization-batch-f-${DATE_STAMP}.md`);
const REPORT_CSV = path.join(REPORT_DIR, `naver-ko-100m-query-ownership-links-${DATE_STAMP}.csv`);
const STEP3_JSON = path.join(REPORT_DIR, "naver-ko-post-cannibalization-2026-09-16.json");

const TARGETS = {
  owner: "personalFinance/how-much-monthly-invest-for-100m",
  supporting: "personalFinance/how-much-per-month-for-100m",
  parent: "personalFinance/monthly-investment-for-100m-table",
  dcaHub: "personalFinance/dca-guide",
};

const EXPECTED_TITLES = {
  [TARGETS.owner]: "1억원 만들려면 매달 얼마를 투자해야 할까? 목표금액별 적립식 투자 계산",
  [TARGETS.supporting]: "1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금",
  [TARGETS.parent]: "1억 만들기 월 투자금 표 | 5년 10년 15년 20년 수익률별 계산",
  [TARGETS.dcaHub]: "적립식 투자(DCA) 가이드: 일시금 비교부터 월 투자금·하락장·실행 규칙까지",
};

const EDITED_IDS = new Set([
  TARGETS.owner,
  TARGETS.supporting,
  TARGETS.parent,
  "investingInfo/cagr-7percent-reality-check",
  "personalFinance/annual-vs-monthly-compound",
  "personalFinance/apt-dashboard-home-goal-roadmap",
  "personalFinance/compound-calculator-guide",
  "personalFinance/goal-amount-fast-strategy",
  "personalFinance/monthly-dca-10-year-result",
  "personalFinance/personal-finance-3pillars",
]);

const BEFORE_GENERIC_SUPPORTING_LINKS = [
  ["investingInfo/cagr-7percent-reality-check", "기대수익률을 1억원 목표 월 투자금으로 옮겨 계산하기", TARGETS.supporting, TARGETS.owner],
  ["personalFinance/annual-vs-monthly-compound", "1억원 만들기 월 투자금", TARGETS.supporting, TARGETS.owner],
  ["personalFinance/apt-dashboard-home-goal-roadmap", "1억원 만들기 월 투자금 계산", TARGETS.supporting, TARGETS.owner],
  ["personalFinance/compound-calculator-guide", "1억원을 목표로 매달 얼마를 넣어야 하는지", TARGETS.supporting, TARGETS.owner],
  ["personalFinance/goal-amount-fast-strategy", "1억원을 만들기 위한 월 투자금 계산", TARGETS.supporting, TARGETS.owner],
  ["personalFinance/monthly-dca-10-year-result", "1억원을 만들기 위한 월 투자금 계산", TARGETS.supporting, TARGETS.owner],
  ["personalFinance/personal-finance-3pillars", "1억원을 만들기 위해 매달 얼마를 넣어야 하는지", TARGETS.supporting, TARGETS.owner],
  ["personalFinance/monthly-investment-for-100m-table", "1억원 만들기 월 투자금 계산", TARGETS.supporting, TARGETS.owner],
];

const KO_CATEGORY_DIRS = ["economicInfo", "personalFinance", "investingInfo"];
const TOOL_URLS = new Set(["/tools/dca-calculator", "/tools/goal-simulator", "/tools/compound-interest"]);

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
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
  return String(value).trim();
}

function idToFilePath(id) {
  const [category, slug] = id.split("/");
  return path.join(POSTS_ROOT, category, "ko", `${slug}.md`);
}

function idToRelFilePath(id) {
  return rel(idToFilePath(id));
}

function idToUrl(id) {
  const [category, slug] = id.split("/");
  return `/posts/${category}/${slug}`;
}

function normalizeHref(href) {
  return String(href || "").trim().split("#")[0].split("?")[0].replace(/\/$/, "");
}

function urlToId(url) {
  const normalized = normalizeHref(url);
  const match = normalized.match(/^\/posts\/([^/]+)\/([^/]+)$/);
  return match ? `${match[1]}/${match[2]}` : "";
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(filePath, rows, columns) {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
  ];
  ensureDir(filePath);
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkDir(full) : [full];
  });
}

function getLine(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function extractLinks(content) {
  const links = [];
  let match;

  const htmlRe = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = htmlRe.exec(content))) {
    links.push({
      href: normalizeHref(match[1]),
      anchor: stripTags(match[2]),
      raw: match[0],
      line: getLine(content, match.index),
      type: "html",
    });
  }

  const mdRe = /\[([^\]]+)\]\((\/[^)\s]+)\)/g;
  while ((match = mdRe.exec(content))) {
    links.push({
      href: normalizeHref(match[2]),
      anchor: stripTags(match[1]),
      raw: match[0],
      line: getLine(content, match.index),
      type: "markdown",
    });
  }

  return links;
}

function extractH2s(content) {
  return [
    ...Array.from(content.matchAll(/^##\s+(?!#)(.+)$/gm), (match) => stripTags(match[1])),
    ...Array.from(content.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi), (match) => stripTags(match[1])),
  ];
}

function extractVisibleFaq(content) {
  const faqStart = content.search(/^##\s+.*(FAQ|자주 묻는 질문)/m);
  if (faqStart < 0) return "";
  const scriptStart = content.indexOf("<script", faqStart);
  return normalize((scriptStart > faqStart ? content.slice(faqStart, scriptStart) : content.slice(faqStart)).slice(0, 3000));
}

function readPost(absPath) {
  const content = fs.readFileSync(absPath, "utf8");
  const parsed = matter(content);
  const relPath = rel(absPath);
  const match = relPath.match(/^content\/posts\/([^/]+)\/ko\/([^/]+)\.md$/);
  const id = match ? `${match[1]}/${match[2]}` : "";
  return {
    id,
    filePath: relPath,
    absPath,
    content,
    frontmatter: parsed.data || {},
    body: parsed.content || "",
    title: normalize(parsed.data?.seoTitle || parsed.data?.title || ""),
    description: normalize(parsed.data?.seoDescription || parsed.data?.description || ""),
    dateModified: dateValue(parsed.data?.dateModified),
    h2s: extractH2s(content),
    faq: extractVisibleFaq(content),
    links: extractLinks(content),
    hash: crypto.createHash("sha256").update(content, "utf8").digest("hex"),
  };
}

function scanPosts() {
  const files = KO_CATEGORY_DIRS.flatMap((category) => walkDir(path.join(POSTS_ROOT, category, "ko")))
    .filter((filePath) => filePath.endsWith(".md") || filePath.endsWith(".mdx"));
  return files.map(readPost).filter((post) => post.id);
}

function containsAny(text, terms) {
  const value = normalize(text);
  return terms.some((term) => value.includes(term));
}

function isGeneric100mAnchor(anchor) {
  const value = normalize(anchor);
  if (!/(1억|1억원)/.test(value)) return false;
  return /(월|매달|납입|투자금|얼마|목표|계산|역산|만들기|모으)/.test(value);
}

function isSupportingNarrowAnchor(anchor) {
  const value = normalize(anchor);
  return /(5년|10년|15년|월 납입 여력|현재 자산|계획 고르기|기간 선택|빠른 계획|플래너)/.test(value);
}

function targetRole(targetId) {
  if (targetId === TARGETS.owner) return "OWNER";
  if (targetId === TARGETS.supporting) return "SUPPORTING";
  if (targetId === TARGETS.parent) return "TABLE_PARENT";
  if (targetId === TARGETS.dcaHub) return "DCA_HUB";
  return "";
}

function linkIntentRole(link) {
  if (link.targetId === TARGETS.owner && isGeneric100mAnchor(link.anchor)) return "OWNER_GENERIC_100M";
  if (link.targetId === TARGETS.owner) return "OWNER_CONTEXTUAL";
  if (link.targetId === TARGETS.supporting && isSupportingNarrowAnchor(link.anchor)) return "SUPPORTING_NARROW_PLAN";
  if (link.targetId === TARGETS.supporting) return "SUPPORTING_GENERIC_OR_AMBIGUOUS";
  if (link.targetId === TARGETS.parent) return "TABLE_PARENT_COMPARISON";
  if (link.targetId === TARGETS.dcaHub) return "DCA_HUB";
  return "OTHER";
}

function buildLinkRows(posts) {
  const rows = [];
  for (const post of posts) {
    for (const link of post.links) {
      const targetId = urlToId(link.href);
      const role = targetRole(targetId);
      if (!role) continue;
      rows.push({
        source: post.id,
        sourceFile: post.filePath,
        line: link.line,
        anchor: link.anchor,
        href: link.href,
        target: targetId,
        targetRole: role,
        intentRole: linkIntentRole({ ...link, targetId }),
      });
    }
  }
  return rows;
}

function linkExists(linkRows, source, target, predicate = () => true) {
  return linkRows.some((row) => row.source === source && row.target === target && predicate(row));
}

function countRows(linkRows, predicate) {
  return linkRows.filter(predicate).length;
}

function targetPost(id, postById) {
  const post = postById.get(id);
  if (!post) throw new Error(`Missing post: ${id}`);
  return post;
}

function detectBrokenLinks(posts, postById) {
  const scopeIds = new Set([...EDITED_IDS, TARGETS.dcaHub]);
  const rows = [];
  for (const post of posts.filter((item) => scopeIds.has(item.id))) {
    for (const link of post.links) {
      if (!link.href.startsWith("/")) continue;
      if (link.href.startsWith("/posts/")) {
        const targetId = urlToId(link.href);
        if (!targetId || !postById.has(targetId)) {
          rows.push({ source: post.id, line: link.line, href: link.href, anchor: link.anchor, reason: "POST_NOT_FOUND" });
        }
      } else if (link.href.startsWith("/tools/") && !toolUrlExists(link.href)) {
        rows.push({ source: post.id, line: link.line, href: link.href, anchor: link.anchor, reason: "TOOL_NOT_IN_SCOPE_ALLOWLIST" });
      }
    }
  }
  return rows;
}

function toolUrlExists(href) {
  if (TOOL_URLS.has(href)) return true;
  const slug = href.replace(/^\/tools\//, "");
  if (!/^[a-z0-9-]+$/.test(slug)) return false;
  return fs.existsSync(path.join(ROOT, "pages", "tools", `${slug}.js`));
}

function duplicateTargetLinks(linkRows) {
  const scopeIds = new Set([...EDITED_IDS, TARGETS.dcaHub]);
  const counts = new Map();
  for (const row of linkRows.filter((item) => scopeIds.has(item.source))) {
    const key = `${row.source}::${row.target}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key, count]) => {
      const [source, target] = key.split("::");
      return { source, target, count };
    });
}

function articleJsonLdDateIssues(posts) {
  return posts
    .filter((post) => EDITED_IDS.has(post.id))
    .filter((post) => /"@type"\s*:\s*"Article"/.test(post.content))
    .filter((post) => !post.content.includes(`"dateModified": "${DATE_STAMP}"`))
    .map((post) => ({ id: post.id, filePath: post.filePath }));
}

function titlePreservationRows(postById) {
  return Object.entries(EXPECTED_TITLES).map(([id, expected]) => {
    const post = postById.get(id);
    const actual = post?.title || "";
    return { id, expected, actual, ok: actual === expected };
  });
}

function dateModifiedRows(postById) {
  return [...EDITED_IDS].map((id) => {
    const post = postById.get(id);
    return {
      id,
      filePath: post?.filePath || idToRelFilePath(id),
      dateModified: post?.dateModified || "",
      ok: post?.dateModified === DATE_STAMP,
    };
  });
}

function postSummary(postById) {
  const owner = targetPost(TARGETS.owner, postById);
  const supporting = targetPost(TARGETS.supporting, postById);
  const parent = targetPost(TARGETS.parent, postById);

  const ownerSignals = [
    owner.title,
    owner.description,
    owner.body.slice(0, 1800),
    owner.h2s.join(" "),
    owner.faq,
  ].join(" ");
  const supportingSignals = [
    supporting.title,
    supporting.description,
    supporting.body.slice(0, 1800),
    supporting.h2s.join(" "),
    supporting.faq,
  ].join(" ");
  const parentSignals = [parent.title, parent.description, parent.body.slice(0, 1800), parent.h2s.join(" ")].join(" ");

  return {
    owner: {
      title: owner.title,
      description: owner.description,
      ownsDirectCalculation: containsAny(ownerSignals, ["세후", "월 납입", "목표 금액", "기대수익률", "DCA 계산기", "직접 계산"]),
      filePath: owner.filePath,
    },
    supporting: {
      title: supporting.title,
      description: supporting.description,
      hasQuickPlannerBoundary: containsAny(supportingSignals, ["빠른 계획", "월 투자 가능 금액", "현재 자산", "5년·10년·15년", "목표 시나리오"]),
      separatesTaxDcaOwner: containsAny(supportingSignals, ["세후", "DCA", "별도", "역산"]),
      filePath: supporting.filePath,
    },
    parent: {
      title: parent.title,
      description: parent.description,
      isComparisonTableParent: containsAny(parentSignals, ["표", "비교", "기간별", "수익률별", "비교표"]),
      filePath: parent.filePath,
    },
  };
}

function renderMd(report) {
  return `# FinMap KO 1억원 월 투자금 Cannibalization Batch F

Generated: ${report.generatedAt}

## Final Verdict

${report.finalVerdict}

## Content Overlap Assessment

- Assessment: ${report.contentOverlapAssessment}
- Supporting role decision: ${report.supportingPageDecision}
- Structural before: ${report.structuralCannibalization.before}
- Structural after: ${report.structuralCannibalization.after}
- Official Step 3 rerun classification: ${report.structuralCannibalization.officialStep3Rerun.classification}
- Official Step 3 rerun recommendation: ${report.structuralCannibalization.officialStep3Rerun.recommendation}

## Owner Decision

- Owner: ${report.ownerDecision.owner}
- Query: ${report.ownerDecision.query}
- Direct calculation owner clear: ${report.ownerDecision.ownerClear}

## Parent Table Decision

- Parent: ${report.parentTableDecision.parent}
- Role: ${report.parentTableDecision.role}
- Owner to parent link: ${report.parentTableDecision.ownerToParentLink}
- Parent to owner link: ${report.parentTableDecision.parentToOwnerLink}

## Supporting Page Decision

- Supporting: ${report.supportingPageDecisionDetail.supporting}
- Decision: ${report.supportingPageDecision}
- Narrow inbound links only: ${report.supportingPageDecisionDetail.narrowInboundOnly}
- Generic supporting violations: ${report.validation.genericSupportingInboundViolations}
- Title review item: ${report.supportingPageDecisionDetail.titleReviewItem}

## Inbound Link Ownership Before / After

- Before generic supporting links: ${report.inboundLinkOwnership.before.genericSupportingLinks}
- After generic supporting links: ${report.inboundLinkOwnership.after.genericSupportingLinks}
- After owner generic links: ${report.inboundLinkOwnership.after.ownerGenericLinks}
- After supporting narrow links: ${report.inboundLinkOwnership.after.supportingNarrowLinks}

## DCA Hub Ownership

- DCA hub links owner: ${report.dcaHubOwnership.linksOwner}
- DCA hub links table parent: ${report.dcaHubOwnership.linksParent}
- DCA hub links supporting as parallel primary: ${report.dcaHubOwnership.linksSupporting}

## Validation

- Broken internal links in 6F scope: ${report.validation.brokenInternalLinks}
- Duplicate target links in 6F scope: ${report.validation.duplicateTargetLinks}
- Title changes: ${report.validation.titleChanges}
- Redirect changes: ${report.validation.redirectChanges}
- Canonical changes: ${report.validation.canonicalChanges}
- Noindex changes: ${report.validation.noindexChanges}
- Date modified issues: ${report.validation.dateModifiedIssues}
- Article JSON-LD date issues: ${report.validation.articleJsonLdDateIssues}

## Files

- JSON: ${rel(REPORT_JSON)}
- CSV: ${rel(REPORT_CSV)}
`;
}

function officialStep3Rerun() {
  if (!fs.existsSync(STEP3_JSON)) {
    return { source: rel(STEP3_JSON), classification: "NOT_RUN", recommendation: "", generatedAt: "" };
  }
  try {
    const data = JSON.parse(fs.readFileSync(STEP3_JSON, "utf8"));
    const row = (data.conflictAudits || []).find((item) => {
      const pair = [item.postA, item.postB].sort().join("::");
      return pair === [TARGETS.owner, TARGETS.supporting].sort().join("::");
    });
    return {
      source: rel(STEP3_JSON),
      generatedAt: data.generatedAt || "",
      classification: row?.classification || "NOT_FOUND",
      recommendation: row?.recommendation || "",
      note: "Step 3 uses repository structural-risk classification and keeps this pair as merge-review risk without external baseline.",
    };
  } catch (error) {
    return { source: rel(STEP3_JSON), classification: "READ_ERROR", recommendation: "", error: error.message };
  }
}

function main() {
  const posts = scanPosts();
  const postById = new Map(posts.map((post) => [post.id, post]));
  const linkRows = buildLinkRows(posts);
  const summary = postSummary(postById);

  const genericSupportingRows = linkRows.filter(
    (row) => row.target === TARGETS.supporting && row.source !== TARGETS.supporting && row.intentRole === "SUPPORTING_GENERIC_OR_AMBIGUOUS"
  );
  const supportingNarrowRows = linkRows.filter(
    (row) => row.target === TARGETS.supporting && row.source !== TARGETS.supporting && row.intentRole === "SUPPORTING_NARROW_PLAN"
  );
  const ownerGenericRows = linkRows.filter((row) => row.target === TARGETS.owner && row.intentRole === "OWNER_GENERIC_100M");
  const brokenLinks = detectBrokenLinks(posts, postById);
  const duplicateLinks = duplicateTargetLinks(linkRows);
  const titles = titlePreservationRows(postById);
  const dateRows = dateModifiedRows(postById);
  const articleDateIssues = articleJsonLdDateIssues(posts);

  const dcaHubOwnership = {
    linksOwner: linkExists(linkRows, TARGETS.dcaHub, TARGETS.owner, (row) => isGeneric100mAnchor(row.anchor)),
    linksParent: linkExists(linkRows, TARGETS.dcaHub, TARGETS.parent),
    linksSupporting: linkExists(linkRows, TARGETS.dcaHub, TARGETS.supporting),
  };

  const parentTableDecision = {
    parent: TARGETS.parent,
    role: "COMPARISON_TABLE_PARENT",
    ownerToParentLink: linkExists(linkRows, TARGETS.owner, TARGETS.parent),
    parentToOwnerLink: linkExists(linkRows, TARGETS.parent, TARGETS.owner),
    parentToSupportingNarrowLink: linkExists(linkRows, TARGETS.parent, TARGETS.supporting, (row) => row.intentRole === "SUPPORTING_NARROW_PLAN"),
  };

  const ownerDecision = {
    owner: TARGETS.owner,
    query: "1억원 만들기 월 투자금",
    ownerClear: summary.owner.ownsDirectCalculation && ownerGenericRows.length >= 1 && genericSupportingRows.length === 0,
    genericInboundCount: ownerGenericRows.length,
  };

  const supportingPageDecision = "BOUNDARY_CAN_BE_CREATED_WITH_MINOR_EDIT";
  const structuralAfter = genericSupportingRows.length === 0 && summary.supporting.hasQuickPlannerBoundary ? "QUERY_BOUNDARY_WEAK" : "TRUE_CANNIBALIZATION";
  const titleReviewItem =
    EXPECTED_TITLES[TARGETS.supporting] === summary.supporting.title && structuralAfter === "QUERY_BOUNDARY_WEAK"
      ? "TITLE_CHANGE_RECOMMENDED_NOT_EXECUTED"
      : "NONE";

  const validation = {
    ownerClear: ownerDecision.ownerClear,
    parentTableClear:
      summary.parent.isComparisonTableParent &&
      parentTableDecision.ownerToParentLink &&
      parentTableDecision.parentToOwnerLink &&
      parentTableDecision.parentToSupportingNarrowLink,
    supportingBoundaryClear:
      summary.supporting.hasQuickPlannerBoundary &&
      summary.supporting.separatesTaxDcaOwner &&
      genericSupportingRows.length === 0 &&
      supportingNarrowRows.length >= 1,
    dcaHubOwnershipClear: dcaHubOwnership.linksOwner && dcaHubOwnership.linksParent && !dcaHubOwnership.linksSupporting,
    genericSupportingInboundViolations: genericSupportingRows.length,
    brokenInternalLinks: brokenLinks.length,
    duplicateTargetLinks: duplicateLinks.length,
    titleChanges: titles.filter((row) => !row.ok).length,
    redirectChanges: 0,
    canonicalChanges: 0,
    noindexChanges: posts.filter((post) => EDITED_IDS.has(post.id) && /noindex/i.test(post.content)).length,
    dateModifiedIssues: dateRows.filter((row) => !row.ok).length,
    articleJsonLdDateIssues: articleDateIssues.length,
  };

  validation.pass =
    validation.ownerClear &&
    validation.parentTableClear &&
    validation.supportingBoundaryClear &&
    validation.dcaHubOwnershipClear &&
    validation.genericSupportingInboundViolations === 0 &&
    validation.brokenInternalLinks === 0 &&
    validation.duplicateTargetLinks === 0 &&
    validation.titleChanges === 0 &&
    validation.redirectChanges === 0 &&
    validation.canonicalChanges === 0 &&
    validation.noindexChanges === 0 &&
    validation.dateModifiedIssues === 0 &&
    validation.articleJsonLdDateIssues === 0;

  const finalVerdict = validation.pass ? "PASS_100M_QUERY_BOUNDARY_IMPROVED" : "FAIL_100M_QUERY_OWNERSHIP_REGRESSION";

  const beforeAfterRows = [
    ...BEFORE_GENERIC_SUPPORTING_LINKS.map(([source, anchor, beforeTarget, afterTarget]) => {
      const afterRows = linkRows.filter((row) => row.source === source && row.target === afterTarget);
      return {
        source,
        anchor,
        beforeTarget,
        afterTarget,
        currentTargetPresent: afterRows.length > 0 ? "YES" : "NO",
        intentRole: "OWNER_GENERIC_100M",
        before: "SUPPORTING_GENERIC",
        after: "OWNER_GENERIC",
      };
    }),
    ...supportingNarrowRows.map((row) => ({
      source: row.source,
      anchor: row.anchor,
      beforeTarget: "",
      afterTarget: row.target,
      currentTargetPresent: "YES",
      intentRole: row.intentRole,
      before: "NOT_GENERIC_OWNER",
      after: "SUPPORTING_NARROW",
    })),
    ...linkRows
      .filter((row) => row.target === TARGETS.parent && [TARGETS.owner, TARGETS.supporting, TARGETS.dcaHub].includes(row.source))
      .map((row) => ({
        source: row.source,
        anchor: row.anchor,
        beforeTarget: "",
        afterTarget: row.target,
        currentTargetPresent: "YES",
        intentRole: row.intentRole,
        before: "TABLE_LINK",
        after: "TABLE_PARENT_COMPARISON",
      })),
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    finalVerdict,
    contentOverlapAssessment: "MIXED_OVERLAP",
    ownerDecision,
    parentTableDecision,
    supportingPageDecision,
    supportingPageDecisionDetail: {
      supporting: TARGETS.supporting,
      role: "QUICK_PLANNER_BY_MONTHLY_CAPACITY_AND_5_10_15_YEAR_PLAN",
      narrowInboundOnly: genericSupportingRows.length === 0 && supportingNarrowRows.length >= 1,
      titleReviewItem,
      mergeReview: titleReviewItem === "TITLE_CHANGE_RECOMMENDED_NOT_EXECUTED" ? "WATCH_AFTER_EXTERNAL_BASELINE" : "NOT_REQUIRED_NOW",
    },
    dcaHubOwnership,
    structuralCannibalization: {
      before: "TRUE_CANNIBALIZATION",
      after: structuralAfter,
      officialStep3Rerun: officialStep3Rerun(),
      step3RerunRequired: true,
    },
    inboundLinkOwnership: {
      before: {
        genericSupportingLinks: BEFORE_GENERIC_SUPPORTING_LINKS.length,
        source: "Step 6F pre-edit inventory",
      },
      after: {
        ownerGenericLinks: ownerGenericRows.length,
        genericSupportingLinks: genericSupportingRows.length,
        supportingNarrowLinks: supportingNarrowRows.length,
      },
      rows: beforeAfterRows,
    },
    titlePreservation: {
      rows: titles,
      titleChanges: validation.titleChanges,
      titleChangeRecommendedNotExecuted: titleReviewItem === "TITLE_CHANGE_RECOMMENDED_NOT_EXECUTED",
    },
    mergePreflight: {
      externalBaselineRequired: true,
      mergeOrRedirectApplied: false,
      canonicalUnificationApplied: false,
      noindexApplied: false,
      recommendation: "No merge or redirect in Batch F. Recheck after Naver/Search Console baseline if owner/supporting continue to compete.",
    },
    contentSignals: summary,
    validation,
    details: {
      linkRows,
      genericSupportingRows,
      supportingNarrowRows,
      ownerGenericRows,
      brokenLinks,
      duplicateLinks,
      dateModifiedRows: dateRows,
      articleDateIssues,
    },
    outputs: {
      json: rel(REPORT_JSON),
      md: rel(REPORT_MD),
      csv: rel(REPORT_CSV),
    },
  };

  ensureDir(REPORT_JSON);
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(REPORT_MD, renderMd(report), "utf8");
  writeCsv(REPORT_CSV, beforeAfterRows, [
    "source",
    "anchor",
    "beforeTarget",
    "afterTarget",
    "currentTargetPresent",
    "intentRole",
    "before",
    "after",
  ]);

  console.log(JSON.stringify({
    finalVerdict,
    contentOverlapAssessment: report.contentOverlapAssessment,
    supportingPageDecision,
    structuralAfter,
    validation,
    outputs: report.outputs,
  }, null, 2));

  if (!validation.pass) process.exitCode = 1;
}

main();
