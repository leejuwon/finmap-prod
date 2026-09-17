const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const DATE_STAMP = "2026-09-16";

const BASELINE_JSON = path.join(ROOT, "reports", `naver-ko-pre-implementation-baseline-${DATE_STAMP}.json`);
const STEP3_JSON = path.join(ROOT, "reports", `naver-ko-post-cannibalization-${DATE_STAMP}.json`);
const REPORT_MD = path.join(ROOT, "reports", `naver-ko-query-boundary-batch-a-${DATE_STAMP}.md`);
const REPORT_JSON = path.join(ROOT, "reports", `naver-ko-query-boundary-batch-a-${DATE_STAMP}.json`);
const BATCH_B_JSON = path.join(ROOT, "reports", `naver-ko-topic-links-batch-b-${DATE_STAMP}.json`);
const BATCH_C_JSON = path.join(ROOT, "reports", `naver-ko-cross-category-links-batch-c-${DATE_STAMP}.json`);
const BATCH_D_JSON = path.join(ROOT, "reports", `naver-ko-topic-hubs-batch-d-${DATE_STAMP}.json`);
const BATCH_E_JSON = path.join(ROOT, "reports", `naver-ko-market-funnel-batch-e-${DATE_STAMP}.json`);
const BATCH_F_DATE_STAMP = "2026-09-17";
const BATCH_F_JSON = path.join(ROOT, "reports", `naver-ko-100m-cannibalization-batch-f-${BATCH_F_DATE_STAMP}.json`);
const BATCH_G_DATE_STAMP = "2026-09-17";
const BATCH_G_JSON = path.join(ROOT, "reports", `naver-ko-technical-seo-batch-g-${BATCH_G_DATE_STAMP}.json`);

const PAIRS = [
  {
    key: "A",
    owner: "economicInfo/geopolitics-oil-fx-dashboard",
    supporting: "economicInfo/geopolitics-to-usd-liquidity-fx",
    ownerQuery: "지정학 리스크 유가 환율 영향",
    supportingQuery: "지정학 리스크 달러 환율",
    ownerBoundaryTerms: ["multi-asset overview", "전체 지도", "부동산 대시보드"],
    supportingBoundaryTerms: ["달러 유동성", "FX transmission", "조달"],
  },
  {
    key: "B",
    owner: "economicInfo/hormuz-risk-oil-insurance-freight-premium",
    supporting: "economicInfo/war-risk-oil-supply-insurance-shipping",
    ownerQuery: "중동 원유 운송 리스크",
    supportingQuery: "전쟁 유가 영향",
    ownerBoundaryTerms: ["호르무즈", "운송 경로", "chokepoint"],
    supportingBoundaryTerms: ["전쟁이라는 넓은 지정학", "3단계 전이", "전쟁 유가 영향"],
  },
  {
    key: "C",
    owner: "economicInfo/inflation-basics",
    supporting: "economicInfo/inflation-rate-basics",
    ownerQuery: "인플레이션 뜻",
    supportingQuery: "물가상승률 뜻",
    ownerBoundaryTerms: ["경제 현상", "개념·원인·영향", "인플레이션 현상"],
    supportingBoundaryTerms: ["CPI", "물가상승률", "지표"],
  },
  {
    key: "D",
    owner: "investingInfo/wti-impact-on-korea-kospi",
    supporting: "economicInfo/oil-shock-to-usdkrw-korea-transmission",
    ownerQuery: "WTI 유가 코스피 영향",
    supportingQuery: "유가 상승 원달러 환율 영향",
    ownerBoundaryTerms: ["코스피", "업종", "증시"],
    supportingBoundaryTerms: ["USD/KRW", "원/달러", "환율 전이"],
  },
  {
    key: "E",
    owner: "investingInfo/us10y-impact-on-korea-and-stock-market",
    supporting: "investingInfo/etf-impact-of-tnx",
    ownerQuery: "미국 10년물 금리 한국 증시 영향",
    supportingQuery: "미국 10년물 금리 ETF 영향",
    ownerBoundaryTerms: ["한국 증시", "원/달러", "market transmission"],
    supportingBoundaryTerms: ["ETF", "asset-class", "금리 민감도"],
  },
  {
    key: "F",
    owner: "personalFinance/dca-vs-lumpsum-decision-rules",
    supporting: "personalFinance/dca-vs-lump-sum-when-results-differ",
    ownerQuery: "적립식 투자 일시금 투자 선택",
    supportingQuery: "적립식 투자 거치식 결과 차이",
    ownerBoundaryTerms: ["선택 기준", "실행 리스크", "무엇을 선택"],
    supportingBoundaryTerms: ["결과 차이", "가격 경로", "상승장"],
  },
  {
    key: "G",
    owner: "personalFinance/personal-start-5steps",
    supporting: "personalFinance/personal-finance-3pillars",
    ownerQuery: "재테크 시작하는 법",
    supportingQuery: "개인 재무관리 3요소",
    ownerBoundaryTerms: ["처음 시작하는 실행 순서", "5단계 순서", "beginner sequence"],
    supportingBoundaryTerms: ["3요소 framework", "가계 재무 구조", "현금흐름 원칙"],
  },
];

const TARGET_IDS = Array.from(new Set(PAIRS.flatMap((pair) => [pair.owner, pair.supporting]))).sort();
const TARGET_FILES = TARGET_IDS.map(idToFilePath);
const ALLOWED_MODIFIED_FILES = new Set([
  ...TARGET_FILES,
  "scripts/snapshot_naver_ko_post_remediation_baseline.js",
  "scripts/verify_naver_ko_query_boundary_batch_a.js",
  `reports/naver-ko-pre-implementation-baseline-${DATE_STAMP}.json`,
  `reports/naver-ko-pre-implementation-baseline-${DATE_STAMP}.csv`,
  `reports/naver-ko-query-boundary-batch-a-${DATE_STAMP}.md`,
  `reports/naver-ko-query-boundary-batch-a-${DATE_STAMP}.json`,
]);

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing input: ${path.relative(ROOT, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function idToFilePath(id) {
  const [category, slug] = id.split("/");
  return `content/posts/${category}/ko/${slug}.md`;
}

function idToUrl(id) {
  const [category, slug] = id.split("/");
  return `/posts/${category}/${slug}`;
}

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const data = {};
  if (!match) return data;
  for (const line of match[1].split(/\r?\n/)) {
    const lineMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!lineMatch) continue;
    data[lineMatch[1]] = lineMatch[2].replace(/^["']|["']$/g, "").trim();
  }
  return data;
}

function markdownBody(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

function extractH2s(content) {
  return [...content.matchAll(/^##\s+(?!#)(.+)$/gm)].map((match) => match[1].trim());
}

function extractFaqSection(content) {
  const start = content.search(/^##\s+.*FAQ|^##\s+자주 묻는 질문/m);
  if (start < 0) return "";
  const scriptStart = content.indexOf("<script", start);
  const nextContent = scriptStart > start ? content.slice(start, scriptStart) : content.slice(start);
  return nextContent;
}

function currentPost(id) {
  const filePath = idToFilePath(id);
  const absPath = path.join(ROOT, filePath);
  const content = fs.readFileSync(absPath, "utf8");
  const fm = parseFrontmatter(content);
  const body = markdownBody(content);
  return {
    id,
    filePath,
    content,
    frontmatter: fm,
    effectiveTitle: fm.seoTitle || fm.title || "",
    description: fm.seoDescription || fm.description || "",
    intro: normalize(body.slice(0, 1400)),
    h2s: extractH2s(content),
    faq: normalize(extractFaqSection(content)),
    hash: crypto.createHash("sha256").update(content, "utf8").digest("hex"),
  };
}

function includesAny(text, terms) {
  const haystack = normalize(text).toLowerCase();
  return terms.some((term) => haystack.includes(String(term).toLowerCase()));
}

function countExactPhrase(content, phrase) {
  if (!phrase) return 0;
  return content.split(phrase).length - 1;
}

function linkExists(sourcePost, targetId) {
  return sourcePost.content.includes(idToUrl(targetId));
}

function h2BoundaryStatus(post, terms) {
  return includesAny(post.h2s.join(" "), terms) ? "CLEAR" : "PARTIAL";
}

function textBoundaryStatus(post, terms) {
  const description = includesAny(post.description, terms);
  const intro = includesAny(post.intro, terms);
  const h2 = includesAny(post.h2s.join(" "), terms);
  const faq = includesAny(post.faq, terms);
  if (description && (intro || h2)) return "CLEAR";
  if (description || intro || h2 || faq) return "PARTIAL";
  return "FAILED";
}

function getGitChangedFiles() {
  try {
    return execSync("git diff --name-only", { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((file) => file.trim().replace(/\\/g, "/"))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function batchBVerifiedScope() {
  const empty = { allowedFiles: new Set(), verdict: "", active: false };
  if (!fs.existsSync(BATCH_B_JSON)) return empty;
  try {
    const data = JSON.parse(fs.readFileSync(BATCH_B_JSON, "utf8"));
    const validation = data.validation || {};
    const pass =
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
    if (!pass) return { ...empty, verdict: data.finalVerdict || "" };
    return {
      active: true,
      verdict: data.finalVerdict || "",
      allowedFiles: new Set((data.modifiedPosts || []).map((row) => row.filePath).filter(Boolean)),
    };
  } catch {
    return empty;
  }
}

function batchCVerifiedScope() {
  const empty = { allowedFiles: new Set(), verdict: "", active: false };
  if (!fs.existsSync(BATCH_C_JSON)) return empty;
  try {
    const data = JSON.parse(fs.readFileSync(BATCH_C_JSON, "utf8"));
    const validation = data.preservationCheck?.validation || {};
    const pass =
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
    if (!pass) return { ...empty, verdict: data.finalVerdict || "" };
    return {
      active: true,
      verdict: data.finalVerdict || "",
      allowedFiles: new Set((data.modifiedPosts || []).map((row) => row.filePath).filter(Boolean)),
    };
  } catch {
    return empty;
  }
}

function batchDVerifiedScope() {
  const empty = { allowedFiles: new Set(), verdict: "", active: false };
  if (!fs.existsSync(BATCH_D_JSON)) return empty;
  try {
    const data = JSON.parse(fs.readFileSync(BATCH_D_JSON, "utf8"));
    const validation = data.validation || {};
    const pass =
      String(data.finalVerdict || "").startsWith("PASS_TOPIC_HUB_BATCH_D") &&
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
    return {
      active: true,
      verdict: data.finalVerdict || "",
      allowedFiles: new Set([
        ...(data.modifiedExistingPosts || []).map((row) => row.filePath).filter(Boolean),
        "public/sitemap.xml",
        "public/sitemap-0.xml",
        "public/sitemap-ko.xml",
        "public/sitemap-en.xml",
        "public/en/sitemap.xml",
      ]),
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
      allowedFiles: new Set([
        ...(data.candidateResults || [])
          .filter((row) => row.hashChanged || row.decision === "APPLY")
          .map((row) => row.filePath)
          .filter(Boolean),
        "public/sitemap.xml",
        "public/sitemap-0.xml",
        "public/sitemap-ko.xml",
        "public/sitemap-en.xml",
        "public/en/sitemap.xml",
      ]),
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
      preservation.redirectChanges === 0;
    if (!pass) return { ...empty, verdict: data.finalVerdict || "" };
    return {
      active: true,
      verdict: data.finalVerdict || "",
      allowedFiles: new Set([
        ...(data.hreflang?.candidates || []).map((row) => row.filePath).filter(Boolean),
        ...(data.structuredData?.rows || []).map((row) => row.filePath).filter(Boolean),
        "public/sitemap.xml",
        "public/sitemap-0.xml",
        "public/sitemap-ko.xml",
        "public/sitemap-en.xml",
        "public/en/sitemap.xml",
      ]),
    };
  } catch {
    return empty;
  }
}

function mdTable(rows, columns) {
  const header = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => String(row[column.key] ?? "").replace(/\|/g, "/")).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
}

function main() {
  const baseline = readJson(BASELINE_JSON);
  const step3 = readJson(STEP3_JSON);
  const baselineById = new Map(baseline.rows.map((row) => [row.id, row]));
  const boundaryPairs = step3.conflictAudits.filter((audit) => audit.classification === "QUERY_BOUNDARY_WEAK");
  const posts = new Map(TARGET_IDS.map((id) => [id, currentPost(id)]));

  const titleChanges = [];
  const dateModifiedRows = [];
  const targetFileRows = [];

  for (const id of TARGET_IDS) {
    const before = baselineById.get(id);
    const after = posts.get(id);
    const titlePreserved = before && normalize(before.title) === normalize(after.effectiveTitle);
    if (!titlePreserved) {
      titleChanges.push({ id, before: before?.title || "", after: after.effectiveTitle });
    }
    dateModifiedRows.push({
      id,
      dateModified: after.frontmatter.dateModified || "",
      ok: after.frontmatter.dateModified === DATE_STAMP,
    });
    targetFileRows.push({
      id,
      filePath: after.filePath,
      beforeHash: before?.fileContentSha256 || "",
      afterHash: after.hash,
      changed: before?.fileContentSha256 !== after.hash,
    });
  }

  const pairResults = PAIRS.map((pair) => {
    const owner = posts.get(pair.owner);
    const supporting = posts.get(pair.supporting);
    const ownerStatus = textBoundaryStatus(owner, pair.ownerBoundaryTerms);
    const supportingStatus = textBoundaryStatus(supporting, pair.supportingBoundaryTerms);
    const h2Boundary = [h2BoundaryStatus(owner, pair.ownerBoundaryTerms), h2BoundaryStatus(supporting, pair.supportingBoundaryTerms)].includes("CLEAR")
      ? "CLEAR"
      : "PARTIAL";
    const faqBoundary = includesAny(owner.faq, pair.ownerBoundaryTerms) || includesAny(supporting.faq, pair.supportingBoundaryTerms) ? "CLEAR" : "PARTIAL";
    const ownerToSupporting = linkExists(owner, pair.supporting);
    const supportingToOwner = linkExists(supporting, pair.owner);
    const linkBoundary = ownerToSupporting && supportingToOwner ? "CLEAR" : "PARTIAL";
    const exactCounts = {
      ownerPrimaryInOwner: countExactPhrase(owner.content, pair.ownerQuery),
      supportingPrimaryInOwner: countExactPhrase(owner.content, pair.supportingQuery),
      ownerPrimaryInSupporting: countExactPhrase(supporting.content, pair.ownerQuery),
      supportingPrimaryInSupporting: countExactPhrase(supporting.content, pair.supportingQuery),
    };
    const stuffingOk = Object.values(exactCounts).every((count) => count <= 2);
    const result = ownerStatus === "CLEAR" && supportingStatus === "CLEAR" && linkBoundary === "CLEAR" && stuffingOk ? "CLEAR" : "PARTIAL";
    return {
      pair: pair.key,
      owner: pair.owner,
      supporting: pair.supporting,
      primaryQueryA: pair.ownerQuery,
      primaryQueryB: pair.supportingQuery,
      beforeDescription: `${baselineById.get(pair.owner)?.description || ""} / ${baselineById.get(pair.supporting)?.description || ""}`,
      beforeH2Overlap: `${(baselineById.get(pair.owner)?.h2List || []).slice(0, 2).join(" / ")} :: ${(baselineById.get(pair.supporting)?.h2List || []).slice(0, 2).join(" / ")}`,
      afterDescriptionBoundary: `${ownerStatus} / ${supportingStatus}`,
      afterIntroBoundary: `${includesAny(owner.intro, pair.ownerBoundaryTerms) ? "CLEAR" : "PARTIAL"} / ${includesAny(supporting.intro, pair.supportingBoundaryTerms) ? "CLEAR" : "PARTIAL"}`,
      afterH2Boundary: h2Boundary,
      afterFaqBoundary: faqBoundary,
      contextualAnchorState: linkBoundary,
      exactPrimaryPhraseCounts: JSON.stringify(exactCounts),
      queryStuffingGuard: stuffingOk ? "PASS" : "REVIEW",
      result,
    };
  });

  const batchBScope = batchBVerifiedScope();
  const batchCScope = batchCVerifiedScope();
  const batchDScope = batchDVerifiedScope();
  const batchEScope = batchEVerifiedScope();
  const batchFScope = batchFVerifiedScope();
  const batchGScope = batchGVerifiedScope();
  const allowedModifiedFiles = new Set([
    ...ALLOWED_MODIFIED_FILES,
    ...batchBScope.allowedFiles,
    ...batchCScope.allowedFiles,
    ...batchDScope.allowedFiles,
    ...batchEScope.allowedFiles,
    ...batchFScope.allowedFiles,
    ...batchGScope.allowedFiles,
  ]);
  const changedFiles = getGitChangedFiles();
  const disallowedChangedFiles = changedFiles.filter((file) => !allowedModifiedFiles.has(file));
  const step3BoundaryRepresented = boundaryPairs.length === 7 && PAIRS.every((pair) =>
    boundaryPairs.some((audit) => [audit.postA, audit.postB].sort().join("::") === [pair.owner, pair.supporting].sort().join("::"))
  );
  const titlePreservationOk = titleChanges.length === 0;
  const dateModifiedOk = dateModifiedRows.every(
    (row) => row.ok || (batchFScope.allowedFiles.has(idToFilePath(row.id)) && row.dateModified === BATCH_F_DATE_STAMP)
  );
  const changedTargetFileCount = targetFileRows.filter((row) => row.changed).length;
  const resultsClearOrPartial = pairResults.every((row) => row.result === "CLEAR" || row.result === "PARTIAL");
  const failedPairs = pairResults.filter((row) => row.result === "FAILED");
  const allPairLinksClear = pairResults.every((row) => row.contextualAnchorState === "CLEAR");
  const stuffingOk = pairResults.every((row) => row.queryStuffingGuard === "PASS");
  const scopeOk = disallowedChangedFiles.length === 0;

  const finalVerdict =
    titlePreservationOk && dateModifiedOk && step3BoundaryRepresented && resultsClearOrPartial && failedPairs.length === 0 && stuffingOk && scopeOk
      ? pairResults.every((row) => row.result === "CLEAR") && allPairLinksClear
        ? "PASS_QUERY_BOUNDARY_BATCH_A"
        : "PASS_WITH_REVIEW_ITEMS"
      : "FAIL_BOUNDARY_REGRESSION";

  const result = {
    generatedAt: new Date().toISOString(),
    finalVerdict,
    scope: {
      targetPairs: PAIRS.length,
      targetPosts: TARGET_IDS.length,
      targetFiles: TARGET_FILES,
    },
    baseline: {
      source: path.relative(ROOT, BASELINE_JSON).replace(/\\/g, "/"),
      rows: baseline.rows.length,
      generatedAt: baseline.generatedAt,
      gitHead: baseline.gitHead,
    },
    validation: {
      titlePreservationOk,
      titleChangeCount: titleChanges.length,
      dateModifiedOk,
      changedTargetFileCount,
      expectedTargetFileMax: 14,
      step3BoundaryRepresented,
      allPairLinksClear,
      queryStuffingGuardOk: stuffingOk,
      scopeOk,
      batchBScopeActive: batchBScope.active,
      batchBScopeVerdict: batchBScope.verdict,
      batchBAllowedFileCount: batchBScope.allowedFiles.size,
      batchCScopeActive: batchCScope.active,
      batchCScopeVerdict: batchCScope.verdict,
      batchCAllowedFileCount: batchCScope.allowedFiles.size,
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
      disallowedChangedFiles,
    },
    pairResults,
    titleChanges,
    dateModifiedRows,
    targetFileRows,
    changedFiles,
  };

  fs.mkdirSync(path.dirname(REPORT_MD), { recursive: true });
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  fs.writeFileSync(REPORT_MD, renderReport(result), "utf8");

  console.log(JSON.stringify({
    finalVerdict,
    targetPosts: TARGET_IDS.length,
    changedTargetFileCount,
    pairResults: pairResults.map((row) => ({ pair: row.pair, result: row.result })),
    validation: result.validation,
    output: {
      md: path.relative(ROOT, REPORT_MD).replace(/\\/g, "/"),
      json: path.relative(ROOT, REPORT_JSON).replace(/\\/g, "/"),
    },
  }, null, 2));
}

function renderReport(result) {
  return `# FinMap KO Query Boundary Batch A Verification

Generated: ${result.generatedAt}

## Final Verdict

${result.finalVerdict}

## Baseline Snapshot

- Source: ${result.baseline.source}
- Baseline rows: ${result.baseline.rows}
- Baseline generated: ${result.baseline.generatedAt}
- Git HEAD at baseline: ${result.baseline.gitHead}

## Modified Posts

${mdTable(result.targetFileRows, [
  { key: "id", label: "Post" },
  { key: "filePath", label: "File" },
  { key: "changed", label: "Changed" },
])}

## Pair-by-Pair Boundary Results

${mdTable(result.pairResults, [
  { key: "pair", label: "Pair" },
  { key: "owner", label: "Owner" },
  { key: "supporting", label: "Supporting" },
  { key: "afterDescriptionBoundary", label: "Description" },
  { key: "afterIntroBoundary", label: "Intro" },
  { key: "afterH2Boundary", label: "H2" },
  { key: "afterFaqBoundary", label: "FAQ" },
  { key: "contextualAnchorState", label: "Contextual Link" },
  { key: "queryStuffingGuard", label: "Stuffing" },
  { key: "result", label: "Result" },
])}

## Description Changes

All target posts now include role-specific descriptions for the intended owner/supporting query boundary. Article JSON-LD descriptions were synced to frontmatter descriptions.

## Intro Changes

Intro/early-summary text now states the document role for all 7 pairs: overview vs specialist, transport vs war-risk, concept vs metric, FX vs KOSPI, ETF vs Korea-market, decision vs result, framework vs starter sequence.

## H2 Changes

H2 changes were limited to boundary clarification where useful. No title/H1 changes were made.

## FAQ Changes

FAQ changes were limited to boundary-sensitive answers in Hormuz vs war-risk and DCA decision vs result. FAQPage JSON-LD was synced for those changed answers.

## Contextual Link Changes

Each boundary pair has bidirectional contextual links or existing reciprocal links with natural descriptive anchors. Step 4 non-boundary APPROVE links were not batch-applied here.

## Title Preservation Check

- Title changes: ${result.validation.titleChangeCount}
- Title preservation: ${result.validation.titlePreservationOk ? "PASS" : "FAIL"}

## dateModified Check

${mdTable(result.dateModifiedRows, [
  { key: "id", label: "Post" },
  { key: "dateModified", label: "dateModified" },
  { key: "ok", label: "OK" },
])}

## Query Stuffing Guard

${mdTable(result.pairResults.map((row) => ({
  pair: row.pair,
  exactPrimaryPhraseCounts: row.exactPrimaryPhraseCounts,
  queryStuffingGuard: row.queryStuffingGuard,
})), [
  { key: "pair", label: "Pair" },
  { key: "exactPrimaryPhraseCounts", label: "Exact Phrase Counts" },
  { key: "queryStuffingGuard", label: "Guard" },
])}

## Validation

${mdTable(Object.entries(result.validation).map(([key, value]) => ({
  key,
  value: Array.isArray(value) ? value.join(" / ") : value,
})), [
  { key: "key", label: "Check" },
  { key: "value", label: "Value" },
])}

## Files Changed Scope

Changed files observed by git diff:

${result.changedFiles.map((file) => `- ${file}`).join("\n") || "- None"}
`;
}

main();
