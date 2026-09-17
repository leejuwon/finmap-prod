const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DATE_STAMP = "2026-09-16";

const STEP1_JSON = path.join(ROOT, "reports", `naver-ko-post-search-inventory-${DATE_STAMP}.json`);
const STEP2_JSON = path.join(ROOT, "reports", `naver-ko-post-query-intent-${DATE_STAMP}.json`);
const STEP3_JSON = path.join(ROOT, "reports", `naver-ko-post-cannibalization-${DATE_STAMP}.json`);
const STEP4_JSON = path.join(ROOT, "reports", `naver-ko-post-topic-links-${DATE_STAMP}.json`);

const REPORT_MD = path.join(ROOT, "reports", `naver-ko-full-site-remediation-plan-${DATE_STAMP}.md`);
const REPORT_JSON = path.join(ROOT, "reports", `naver-ko-full-site-remediation-plan-${DATE_STAMP}.json`);
const MATRIX_CSV = path.join(ROOT, "reports", `naver-ko-full-site-remediation-map-${DATE_STAMP}.csv`);
const LINK_PLAN_CSV = path.join(ROOT, "reports", `naver-ko-approved-link-plan-${DATE_STAMP}.csv`);
const HUB_PLAN_MD = path.join(ROOT, "reports", `naver-ko-hub-plan-${DATE_STAMP}.md`);

const ACTION_TAXONOMY = [
  "KEEP",
  "LINK_ONLY",
  "ANCHOR_ALIGNMENT",
  "QUERY_BOUNDARY_FIX",
  "META_ALIGNMENT",
  "CONTENT_ALIGNMENT",
  "HUB_INTEGRATION",
  "MARKET_FUNNEL_ALIGNMENT",
  "TOOL_FUNNEL_ALIGNMENT",
  "MERGE_REVIEW",
  "NO_CHANGE_REQUIRED",
];

const H2_ACTION_OPTIONS = ["KEEP_H2", "RENAME_H2", "ADD_H2", "MERGE_H2", "REMOVE_REDUNDANT_H2"];

const EXISTING_MARKET_ROUTES = [
  { url: "/market", file: "pages/market/index.js", role: "market landing" },
  { url: "/market/indices", file: "pages/market/indices.js", role: "market indices dashboard" },
  { url: "/market/real-estate", file: "pages/market/real-estate.js", role: "real estate dashboard" },
  { url: "/market/real-estate/seoul-top100", file: "pages/market/real-estate/seoul-top100.js", role: "real estate landing" },
  { url: "/market/real-estate/seoul-apartment-top100", file: "pages/market/real-estate/seoul-apartment-top100.js", role: "real estate landing" },
  { url: "/market/real-estate/gangnam-top100", file: "pages/market/real-estate/gangnam-top100.js", role: "real estate landing" },
  { url: "/market/real-estate/gangnam3-top100", file: "pages/market/real-estate/gangnam3-top100.js", role: "real estate landing" },
  { url: "/market/real-estate/magok-top100", file: "pages/market/real-estate/magok-top100.js", role: "real estate landing" },
  { url: "/market/real-estate/mayongseong-top100", file: "pages/market/real-estate/mayongseong-top100.js", role: "real estate landing" },
  { url: "/market/real-estate/songpa-top100", file: "pages/market/real-estate/songpa-top100.js", role: "real estate landing" },
  { url: "/market/real-estate/songpa-gangnam-top100", file: "pages/market/real-estate/songpa-gangnam-top100.js", role: "real estate landing" },
  { url: "/market/real-estate/gyeonggi-apartment-top100", file: "pages/market/real-estate/gyeonggi-apartment-top100.js", role: "real estate landing" },
  { url: "/market/real-estate/incheon-apartment-top100", file: "pages/market/real-estate/incheon-apartment-top100.js", role: "real estate landing" },
].map((route) => ({
  ...route,
  exists: fs.existsSync(path.join(ROOT, route.file)),
}));

const MARKET_INDEX_FAMILIES = new Set(["OIL_ENERGY", "FX", "INTEREST_RATES", "ETF", "DXY", "KOSPI_GLOBAL_LINK", "TNX"]);
const DASHBOARD_SIGNAL_BY_FAMILY = {
  OIL_ENERGY: "WTI, USD/KRW, KOSPI를 같은 화면에서 확인하는 문맥",
  FX: "USD/KRW와 DXY를 함께 확인하는 문맥",
  INTEREST_RATES: "미국 10년물 금리와 증시/환율을 함께 확인하는 문맥",
  ETF: "미국 10년물, KOSPI, 글로벌 지수와 ETF 반응을 연결하는 문맥",
  DXY: "DXY와 USD/KRW, 위험자산 흐름을 함께 확인하는 문맥",
  KOSPI_GLOBAL_LINK: "KOSPI와 S&P500/Nasdaq/Dow를 비교하는 문맥",
  TNX: "TNX와 성장주/ETF/KOSPI 반응을 비교하는 문맥",
};

const HUB_FAMILY_ORDER = ["DCA", "DSR_LTV", "HOUSEHOLD_FINANCE", "REAL_ESTATE_BUDGET", "REAL_ESTATE_DATA"];

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required input is missing: ${path.relative(ROOT, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function sortById(rows) {
  return [...rows].sort((a, b) => String(a.id || "").localeCompare(String(b.id || "")));
}

function csvEscape(value) {
  if (Array.isArray(value)) return csvEscape(value.join("|"));
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(filePath, rows, columns) {
  ensureDir(filePath);
  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] || 0) + 1;
  return counts;
}

function increment(obj, key, amount = 1) {
  obj[key] = (obj[key] || 0) + amount;
}

function addAction(actions, action) {
  if (!ACTION_TAXONOMY.includes(action)) throw new Error(`Unknown action: ${action}`);
  actions.add(action);
}

function flagMax(...flags) {
  if (flags.includes("YES")) return "YES";
  if (flags.includes("REVIEW")) return "REVIEW";
  return "NO";
}

function fieldFlagFromBoundary(signal, yesWhenWeak = true) {
  if (signal === "WEAK") return yesWhenWeak ? "YES" : "REVIEW";
  if (signal === "PARTIAL") return "REVIEW";
  return "NO";
}

function h2ActionFromBoundary(signal) {
  if (signal === "WEAK") return "ADD_H2";
  if (signal === "PARTIAL") return "RENAME_H2";
  return "KEEP_H2";
}

function pairKey(a, b) {
  return [a, b].sort().join("::");
}

function idToUrl(id) {
  const [category, slug] = String(id || "").split("/");
  return category && slug ? `/posts/${category}/${slug}` : "";
}

function highestRisk(row) {
  if (row.mergeReview === "YES" || row.titleChangeNeeded !== "NO") return "HIGH_RISK";
  if (
    row.descriptionChangeNeeded !== "NO" ||
    row.introChangeNeeded !== "NO" ||
    row.h2ChangeNeeded !== "NO" ||
    row.faqChangeNeeded !== "NO" ||
    row.tagChangeNeeded !== "NO"
  ) {
    return "MEDIUM_RISK";
  }
  if (
    row.internalLinkChangeNeeded !== "NO" ||
    row.marketLinkChangeNeeded !== "NO" ||
    row.toolLinkChangeNeeded !== "NO"
  ) {
    return "LOW_RISK";
  }
  return "LOW_RISK_NO_CHANGE";
}

function relationshipForOpportunity(opp, context) {
  const key = pairKey(opp.source, opp.target);
  const boundary = context.boundaryPairKeys.has(key);
  const trueCannibal = context.trueCannibalPairKeys.has(key);
  if (boundary) return "BOUNDARY_CLARIFICATION";
  if (trueCannibal) {
    const audit = context.trueCannibalPairs.find((pair) => pairKey(pair.postA, pair.postB) === key);
    if (audit && opp.source === audit.ownerPost) return "PARENT_TO_CHILD";
    return "CHILD_TO_PARENT";
  }

  const parentChild = context.parentChildByPair.get(key);
  if (parentChild) {
    if (opp.source === parentChild.parent && opp.target === parentChild.child) return "PARENT_TO_CHILD";
    if (opp.source === parentChild.child && opp.target === parentChild.parent) return "CHILD_TO_PARENT";
  }

  const reason = String(opp.reason || "");
  if (/Spoke -> core/i.test(reason)) return "SPOKE_TO_CORE";
  if (/Core -> spoke/i.test(reason)) return "CORE_TO_SPOKE";

  const sourceQuery = context.queryById.get(opp.source);
  const targetQuery = context.queryById.get(opp.target);
  if (sourceQuery && targetQuery && sourceQuery.category !== targetQuery.category) return "CROSS_CATEGORY";

  return "CORE_TO_SPOKE";
}

function statusForOpportunity(opp, relationship, context) {
  const key = pairKey(opp.source, opp.target);
  if (context.trueCannibalPairKeys.has(key)) return "REVIEW";
  if (context.boundaryPairKeys.has(key)) return "REVIEW";
  if (relationship === "CROSS_CATEGORY") return "REVIEW";
  return "APPROVE";
}

function sectionConceptForRelationship(relationship) {
  if (relationship === "CORE_TO_SPOKE") return "핵심 가이드 말미의 다음 적용/심화 섹션";
  if (relationship === "SPOKE_TO_CORE") return "도입부 또는 첫 전환부의 상위 개념 회수 섹션";
  if (relationship === "PARENT_TO_CHILD") return "상위 개념을 읽은 뒤 세부 사례로 넘기는 섹션";
  if (relationship === "CHILD_TO_PARENT") return "세부 사례에서 상위 가이드로 되돌리는 섹션";
  if (relationship === "BOUNDARY_CLARIFICATION") return "비슷한 개념을 구분하는 비교/주의 섹션";
  if (relationship === "MARKET_FUNNEL") return "데이터로 확인하기 CTA 섹션";
  if (relationship === "TOOL_FUNNEL") return "계산기로 확인하기 CTA 섹션";
  return "관련 주제 확장 섹션";
}

function titleChangeReason(row) {
  const reasons = [];
  if (row.titleChangeNeeded !== "NO") reasons.push("title-query boundary review");
  if (row.descriptionChangeNeeded !== "NO") reasons.push("description intent clarification");
  if (row.introChangeNeeded !== "NO") reasons.push("intro boundary clarification");
  if (row.h2ChangeNeeded !== "NO") reasons.push("H2 role/ownership clarification");
  if (row.faqChangeNeeded !== "NO") reasons.push("FAQ answer boundary clarification");
  if (row.internalLinkChangeNeeded !== "NO") reasons.push("internal link graph alignment");
  if (row.marketLinkChangeNeeded !== "NO") reasons.push("market dashboard funnel");
  if (row.toolLinkChangeNeeded !== "NO") reasons.push("tool funnel check");
  if (row.tagChangeNeeded !== "NO") reasons.push("tag taxonomy review");
  if (row.mergeReview === "YES") reasons.push("merge/redirect decision review");
  return reasons.join("; ") || "current structure is sufficient";
}

function expectedBenefit(row) {
  if (row.mergeReview === "YES") return "중복 계산 intent를 한 대표 URL로 모을 수 있는지 판단한다.";
  if (row.actions.includes("QUERY_BOUNDARY_FIX")) return "비슷한 검색어 사이의 대표 URL과 보조 URL 역할을 더 명확히 한다.";
  if (row.actions.includes("HUB_INTEGRATION")) return "주제군의 상위-하위 구조와 내부 링크 흐름을 강화한다.";
  if (row.actions.includes("MARKET_FUNNEL_ALIGNMENT")) return "글에서 실제 시장 대시보드로 이어지는 검증 경로를 만든다.";
  if (row.actions.includes("TOOL_FUNNEL_ALIGNMENT")) return "가이드와 계산기 사이의 전환 맥락을 더 분명히 한다.";
  if (row.actions.includes("LINK_ONLY")) return "현재 문서 의미는 보존하면서 내부 링크 신호를 보강한다.";
  return "현재 검색 의도와 문서 구조를 보존한다.";
}

function currentStatusFromSignals(signals) {
  if (signals.trueCannibal) return "TRUE_CANNIBALIZATION_REVIEW";
  if (signals.boundary.length) return "QUERY_BOUNDARY_REVIEW";
  if (signals.lowQueryConfidence || signals.lowTitleAlignment) return "QUERY_ALIGNMENT_REVIEW";
  if (signals.hubAssessment) return "HUB_INTEGRATION_REVIEW";
  if (signals.marketWeak) return "MARKET_FUNNEL_GAP";
  if (signals.linkOpportunities.length || signals.topicIsolated || signals.weakAnchor) return "LINK_GRAPH_GAP";
  if (signals.toolPartial) return "TOOL_FUNNEL_REVIEW";
  return "STABLE_NO_CHANGE";
}

function hubRoleForPost(queryRow, hubByFamily) {
  const hub = hubByFamily.get(queryRow.topicFamily);
  if (!hub) return "NONE";
  const id = queryRow.id;
  const isCore = (hub.coreDocuments || []).includes(id);
  const isSpoke = (hub.linkedSpokes || []).includes(id);
  const isInbound = (hub.inboundSources || []).includes(id);

  if (hub.topicFamily === "DCA") {
    if (id === "personalFinance/dca-vs-lumpsum-decision-rules") return "CORE_NOT_HUB__DEDICATED_HUB_REQUIRED";
    if (isCore || isSpoke || isInbound) return "SPOKE_TO_DEDICATED_HUB";
  }

  if (hub.topicFamily === "HOUSEHOLD_FINANCE") {
    if (id === "personalFinance/personal-finance-3pillars") return "FRAMEWORK_CORE_NOT_FULL_HUB";
    if (id === "personalFinance/personal-start-5steps") return "STARTER_CORE_NOT_FULL_HUB";
    if (isCore || isSpoke || isInbound) return "SPOKE_TO_DEDICATED_HUB_REVIEW";
  }

  if (hub.mode === "EXISTING_CORE_CAN_SERVE_AS_HUB") {
    if (isCore) return "EXISTING_CORE_HUB_REINFORCE";
    if (isSpoke || isInbound) return "SPOKE_TO_EXISTING_CORE_HUB";
  }

  return isCore || isSpoke || isInbound ? "HUB_REVIEW" : "NONE";
}

function buildBoundaryPairPlans(boundaryPairs, queryById) {
  return boundaryPairs.map((pair) => {
    const owner = queryById.get(pair.ownerPost);
    const supporting = queryById.get(pair.supportingPost);
    const signals = pair.onPageBoundarySignals || {};
    return {
      pair: `${pair.postA} :: ${pair.postB}`,
      ownerPost: pair.ownerPost,
      ownerPrimaryQuery: pair.ownerPrimaryQuery,
      supportingPost: pair.supportingPost,
      supportingRole: pair.supportingRole,
      ownerTitle: owner ? owner.title : "",
      supportingTitle: supporting ? supporting.title : "",
      titlePlan:
        signals.TITLE_BOUNDARY === "WEAK"
          ? "REVIEW only after description/intro/H2 boundary is insufficient"
          : "KEEP title unless external baseline proves confusion",
      descriptionPlan: signals.DESCRIPTION_BOUNDARY === "WEAK" ? "YES - clarify owned query and excluded neighboring query" : "REVIEW - light boundary wording only",
      introPlan: signals.INTRO_BOUNDARY === "WEAK" ? "YES - first screen should state document role" : "REVIEW - avoid over-editing",
      h2Plan: h2ActionFromBoundary(signals.H2_BOUNDARY),
      faqPlan: signals.FAQ_BOUNDARY === "WEAK" ? "YES - add or adjust one boundary answer only" : "REVIEW/KEEP",
      anchorPlan: "Use bidirectional contextual links with descriptive partial anchors; avoid exact-match repetition.",
      ownerOwns: pair.boundaryDefinition?.[pair.ownerPost]?.own || [],
      supportingOwns: pair.boundaryDefinition?.[pair.supportingPost]?.own || [],
      ownerShouldDeemphasize: pair.boundaryDefinition?.[pair.ownerPost]?.avoidOrDeemphasize || [],
      supportingShouldDeemphasize: pair.boundaryDefinition?.[pair.supportingPost]?.avoidOrDeemphasize || [],
      evidenceLevel: pair.evidenceLevel,
      rationale: pair.rationale,
    };
  });
}

function buildHubPlans(hubAssessments) {
  const byFamily = new Map(hubAssessments.map((hub) => [hub.topicFamily, hub]));
  const dca = byFamily.get("DCA");
  const dsr = byFamily.get("DSR_LTV");
  const household = byFamily.get("HOUSEHOLD_FINANCE");
  const realEstateBudget = byFamily.get("REAL_ESTATE_BUDGET");
  const realEstateData = byFamily.get("REAL_ESTATE_DATA");

  return {
    dca: {
      decision: "DEDICATED_HUB_RECOMMENDED",
      purpose: "DCA 뜻, 일시금 비교, 하락장/환율/증액/10년 결과/목표금액 계산 글을 한 주제 지도 아래 묶는다.",
      primaryQuery: "적립식 투자",
      secondaryQueries: ["DCA 뜻", "적립식 투자 일시금 비교", "하락장 적립식 투자", "월 투자금 계산", "적립식 투자 10년 결과"],
      suggestedUrl: "/posts/personalFinance/dca-guide",
      suggestedUrlStatus: "URL_CONCEPT_ONLY_NOT_CREATED",
      sections: dca ? dca.sections : [],
      docsToLink: uniq([...(dca?.coreDocuments || []), ...(dca?.linkedSpokes || [])]),
      whyExistingCoreCannotServe:
        "personalFinance/dca-vs-lumpsum-decision-rules는 '선택/비교' intent를 소유해야 하므로 전체 DCA 허브가 되면 결정 규칙 query와 DCA 뜻/목표금액/하락장/환율 query가 섞인다.",
      futureAction: "Create a dedicated hub only in an implementation batch; no file is created in Step 5.",
    },
    householdFinance: {
      decision: "DEDICATED_HUB_RECOMMENDED_BUT_LOWER_URGENCY_THAN_DCA",
      purpose: "재테크 시작, 개인 재무관리 3요소, 비상금, 고금리 부채, 물가 대응, 목표금액 전략을 한 입문 경로로 묶는다.",
      primaryQuery: "재테크 시작 / 개인 재무관리",
      suggestedUrl: "/posts/personalFinance/personal-finance-guide",
      suggestedUrlStatus: "URL_CONCEPT_ONLY_NOT_CREATED",
      existingDocDecision:
        "personal-start-5steps는 시작 순서 intent, personal-finance-3pillars는 framework intent를 보존하는 편이 안전하다. 둘 중 하나를 전체 허브로 키우면 Step3 boundary weak pair가 더 커질 수 있다.",
      docsToLink: uniq([...(household?.coreDocuments || []), ...(household?.linkedSpokes || [])]),
      sections: household ? household.sections : [],
    },
    existingCoreReinforcement: [
      {
        topicFamily: "DSR_LTV",
        decision: "EXISTING_CORE_CAN_SERVE_AS_HUB",
        coreDocuments: dsr?.coreDocuments || [],
        candidateUrl: dsr?.candidateUrl || "",
        introRole: "DSR/LTV 대출한도 계산의 대표 가이드임을 도입부에서 분명히 한다.",
        navSection: "연봉별 한도, 금리 변화, 현금 병목, 변동금리 리스크, 계산기 순서로 내부 탐색 블록을 정리한다.",
        linkedSpokes: dsr?.linkedSpokes || [],
        toolDashboardLinks: ["/tools/dsr-ltv-calculator", "/tools/mortgage-loan-calculator", "/market/real-estate"],
        inboundReverseLinks: dsr?.inboundSources || [],
      },
      {
        topicFamily: "REAL_ESTATE_BUDGET",
        decision: "EXISTING_CORE_CAN_SERVE_AS_HUB",
        coreDocuments: realEstateBudget?.coreDocuments || [],
        candidateUrl: realEstateBudget?.candidateUrl || "",
        introRole: "아파트 구매 예산 계산의 대표 가이드 역할을 명시한다.",
        navSection: "부대비용, 보유현금별 예산, 생애최초, 전세->매매, 월세/전세/매매 비교로 분기한다.",
        linkedSpokes: realEstateBudget?.linkedSpokes || [],
        toolDashboardLinks: ["/tools/home-buying-budget-calculator", "/tools/dsr-ltv-calculator", "/tools/mortgage-loan-calculator", "/market/real-estate"],
        inboundReverseLinks: realEstateBudget?.inboundSources || [],
      },
      {
        topicFamily: "REAL_ESTATE_DATA",
        decision: "EXISTING_CORE_CAN_SERVE_AS_HUB",
        coreDocuments: realEstateData?.coreDocuments || [],
        candidateUrl: realEstateData?.candidateUrl || "",
        introRole: "아파트 실거래가/시세 데이터 읽기의 대표 가이드 역할을 명시한다.",
        navSection: "대시보드 사용법, 실거래가 해석, 거래량, 금리/가격, 대단지, 수도권 risk budget로 연결한다.",
        linkedSpokes: realEstateData?.linkedSpokes || [],
        toolDashboardLinks: ["/market/real-estate"],
        inboundReverseLinks: realEstateData?.inboundSources || [],
      },
    ],
  };
}

function buildImplementationBatches() {
  return [
    {
      batch: "A",
      name: "Query Boundary Fixes",
      scope: "Step3 QUERY_BOUNDARY_WEAK 7쌍의 description/intro/H2/FAQ/anchor 경계 정리",
      files: "content/posts/**/ko/*.md only",
      risk: "MEDIUM_RISK, title is REVIEW-only",
      dependency: "Step5 baseline snapshot first",
      validation: "각 7쌍 owner/supporting primary query 재확인, FAQ visible text와 JSON-LD 일치",
    },
    {
      batch: "B",
      name: "Core/Spoke + Parent/Child Links",
      scope: "APPROVE 링크 중 core-to-spoke, spoke-to-core, parent-child 우선 반영",
      files: "content/posts/**/ko/*.md only",
      risk: "LOW_RISK",
      dependency: "Batch A anchor boundary wording",
      validation: "링크 존재/중복/앵커 stuffing 점검, post link audit 재실행",
    },
    {
      batch: "C",
      name: "Cross-Category Links",
      scope: "REVIEW로 분류된 cross-category 링크를 자연스러운 독자 경로에만 제한 적용",
      files: "content/posts/**/ko/*.md only",
      risk: "LOW_TO_MEDIUM_RISK",
      dependency: "Batch B after link density review",
      validation: "소스 글당 신규 링크 수와 섹션 맥락 수동 검토",
    },
    {
      batch: "D",
      name: "Hub Creation/Integration",
      scope: "DCA dedicated hub, HOUSEHOLD_FINANCE dedicated hub 검토, DSR/LTV/부동산 예산/부동산 데이터 core hub 보강",
      files: "content/posts/personalFinance/ko/*.md, reports only until implementation approval",
      risk: "MEDIUM_RISK",
      dependency: "Batch A/B complete; no route creation until approved",
      validation: "hub->spoke and spoke->hub 링크, sitemap/canonical/hreflang generated output",
    },
    {
      batch: "E",
      name: "Market Dashboard Funnel",
      scope: "OIL_ENERGY, FX, INTEREST_RATES, ETF, DXY, KOSPI_GLOBAL_LINK, TNX posts에서 /market/indices 연결",
      files: "content/posts/**/ko/*.md; optional future pages/market/indices.js editorial module review",
      risk: "LOW_RISK for post links, MEDIUM_RISK for dashboard UI module",
      dependency: "Actual route existence confirmed",
      validation: "사용 URL이 /market/indices 또는 existing route인지 확인, canonical/querystring 생성 없음",
    },
    {
      batch: "F",
      name: "True Cannibalization Resolution",
      scope: "1억원 만들기 월 투자금 pair의 future architecture 결정",
      files: "content/posts/personalFinance/ko/*.md plus redirect/canonical only after separate approval",
      risk: "HIGH_RISK",
      dependency: "Naver/GSC baseline and 28-60 day data",
      validation: "대표 URL, redirect, canonical, sitemap, internal links를 별도 체크리스트로 검증",
    },
    {
      batch: "G",
      name: "Technical SEO Follow-Up",
      scope: "sitemap hreflang 8건, manual Article schema 62건 review",
      files: "sitemap generation/template/schema files, not content batch unless needed",
      risk: "MEDIUM_RISK",
      dependency: "Content batches do not depend on this except release ordering",
      validation: "next-sitemap/postbuild, structured data sample validation, git diff of sitemap outputs",
    },
  ];
}

function buildMonitoringPlan() {
  return [
    { day: "D+0", scope: "배포 직후", checks: "변경 URL 색인 가능, canonical/hreflang/robots, 내부 링크 클릭 경로, sitemap diff" },
    { day: "D+7", scope: "초기 크롤링", checks: "대표 query owner별 수동 Naver 검색 스냅샷, Search Advisor/GSC 가능 데이터 확인" },
    { day: "D+14", scope: "초기 반응", checks: "topicFamily별 impressions/clicks/CTR 변동, boundary pair query 혼선 여부" },
    { day: "D+28", scope: "1차 안정화", checks: "DCA/DSR/시장 funnel 클릭 경로, true cannibal pair 분리/병합 판단 보류 또는 진행" },
    { day: "D+42", scope: "중기 추세", checks: "owner URL이 primary query를 받는지, supporting URL이 secondary query를 받는지 확인" },
    { day: "D+60", scope: "결정 시점", checks: "merge/redirect 같은 HIGH_RISK 조치 여부를 외부 성과 데이터로 결정" },
  ];
}

function main() {
  const step1 = readJson(STEP1_JSON);
  const step2 = readJson(STEP2_JSON);
  const step3 = readJson(STEP3_JSON);
  const step4 = readJson(STEP4_JSON);

  const inventoryById = new Map(step1.posts.map((post) => [post.id, post]));
  const queryById = new Map(step2.queryMap.map((post) => [post.id, post]));
  const postLinkById = new Map(step4.postLinkRows.map((row) => [row.id, row]));

  const boundaryPairs = step3.conflictAudits.filter((audit) => audit.classification === "QUERY_BOUNDARY_WEAK");
  const trueCannibalPairs = step3.conflictAudits.filter((audit) => audit.classification === "TRUE_CANNIBALIZATION");
  const boundaryPairKeys = new Set(boundaryPairs.map((pair) => pairKey(pair.postA, pair.postB)));
  const trueCannibalPairKeys = new Set(trueCannibalPairs.map((pair) => pairKey(pair.postA, pair.postB)));
  const boundaryById = new Map();
  const trueCannibalById = new Map();

  for (const pair of boundaryPairs) {
    for (const id of [pair.postA, pair.postB]) {
      if (!boundaryById.has(id)) boundaryById.set(id, []);
      boundaryById.get(id).push(pair);
    }
  }
  for (const pair of trueCannibalPairs) {
    for (const id of [pair.postA, pair.postB]) trueCannibalById.set(id, pair);
  }

  const parentChildByPair = new Map();
  for (const audit of step4.parentChildAudit || []) {
    parentChildByPair.set(pairKey(audit.parent, audit.child), audit);
  }

  const opportunities = step4.highValueLinkOpportunities || [];
  const oppsBySource = new Map();
  const oppsByTarget = new Map();
  for (const opp of opportunities) {
    if (!oppsBySource.has(opp.source)) oppsBySource.set(opp.source, []);
    if (!oppsByTarget.has(opp.target)) oppsByTarget.set(opp.target, []);
    oppsBySource.get(opp.source).push(opp);
    oppsByTarget.get(opp.target).push(opp);
  }

  const weakMarketFamilies = new Set(
    (step4.marketDashboardFunnelAudit || [])
      .filter((audit) => audit.status === "WEAK" && MARKET_INDEX_FAMILIES.has(audit.topicFamily))
      .map((audit) => audit.topicFamily)
  );
  const partialToolFamilies = new Set(
    (step4.calculatorFunnelAudit || [])
      .filter((audit) => audit.status === "PARTIAL")
      .map((audit) => audit.topicFamily)
  );
  const topicIsolatedIds = new Set((step4.topicIsolatedPosts || []).map((post) => post.id));
  const sitemapAnomalyIds = new Set((step1.sitemapAnomalies?.items || []).map((item) => item.id));
  const manualArticleIds = new Set(step1.posts.filter((post) => post.jsonLd?.manualArticleLike).map((post) => post.id));
  const hubAssessments = (step4.hubAssessments || []).filter((hub) => hub.hubNeed !== "HUB_NOT_NEEDED");
  const hubByFamily = new Map(hubAssessments.map((hub) => [hub.topicFamily, hub]));

  const singleUseTagsByPost = new Map();
  for (const item of step1.tags?.singleUse || []) {
    for (const id of item.posts || []) {
      if (!singleUseTagsByPost.has(id)) singleUseTagsByPost.set(id, []);
      singleUseTagsByPost.get(id).push(item.tag);
    }
  }
  const normalizableTags = new Set((step1.tags?.similarGroups || []).flat());

  const linkContext = { boundaryPairKeys, trueCannibalPairKeys, trueCannibalPairs, parentChildByPair, queryById };
  const linkPlan = opportunities.map((opp, index) => {
    const relationship = relationshipForOpportunity(opp, linkContext);
    const status = statusForOpportunity(opp, relationship, linkContext);
    const source = queryById.get(opp.source);
    const target = queryById.get(opp.target);
    return {
      index: index + 1,
      status,
      source: opp.source,
      target: opp.target,
      sourceUrl: idToUrl(opp.source),
      targetUrl: idToUrl(opp.target),
      sourceSectionConcept: sectionConceptForRelationship(relationship),
      anchorConcept: opp.recommendedAnchorConcept,
      relationship,
      sourceTopicFamily: source?.topicFamily || "",
      targetTopicFamily: target?.topicFamily || "",
      reason: opp.reason,
      anchorPolicy: "partial/synonym/descriptive/natural anchor; avoid repeated exact-match stuffing",
    };
  });

  const linkPlanBySource = new Map();
  const linkPlanByTarget = new Map();
  for (const row of linkPlan) {
    if (!linkPlanBySource.has(row.source)) linkPlanBySource.set(row.source, []);
    if (!linkPlanByTarget.has(row.target)) linkPlanByTarget.set(row.target, []);
    linkPlanBySource.get(row.source).push(row);
    linkPlanByTarget.get(row.target).push(row);
  }

  const remediationRows = sortById(step2.queryMap).map((queryRow) => {
    const inventory = inventoryById.get(queryRow.id);
    const linkRow = postLinkById.get(queryRow.id);
    const boundary = boundaryById.get(queryRow.id) || [];
    const trueCannibal = trueCannibalById.get(queryRow.id) || null;
    const hubAssessment = hubByFamily.get(queryRow.topicFamily);
    const hubRole = hubRoleForPost(queryRow, hubByFamily);
    const linkOpportunities = [...(linkPlanBySource.get(queryRow.id) || []), ...(linkPlanByTarget.get(queryRow.id) || [])];
    const marketWeak = weakMarketFamilies.has(queryRow.topicFamily);
    const toolPartial = partialToolFamilies.has(queryRow.topicFamily);
    const weakAnchor = linkRow?.queryAnchorSupport === "ANCHOR_SUPPORT_WEAK";
    const lowQueryConfidence = queryRow.primaryQueryConfidence === "LOW";
    const lowTitleAlignment = queryRow.titleQueryAlignment === "LOW";
    const topicIsolated = topicIsolatedIds.has(queryRow.id);

    const actions = new Set();
    const signals = {
      boundary,
      trueCannibal,
      lowQueryConfidence,
      lowTitleAlignment,
      hubAssessment,
      marketWeak,
      toolPartial,
      linkOpportunities,
      weakAnchor,
      topicIsolated,
    };

    let titleChangeNeeded = "NO";
    let descriptionChangeNeeded = "NO";
    let introChangeNeeded = "NO";
    let h2ChangeNeeded = "NO";
    let faqChangeNeeded = "NO";
    let tagChangeNeeded = "NO";
    let internalLinkChangeNeeded = "NO";
    let marketLinkChangeNeeded = "NO";
    let toolLinkChangeNeeded = "NO";
    let h2Action = "KEEP_H2";
    let mergeReview = "NO";

    if (trueCannibal) {
      addAction(actions, "MERGE_REVIEW");
      addAction(actions, "QUERY_BOUNDARY_FIX");
      addAction(actions, "META_ALIGNMENT");
      addAction(actions, "CONTENT_ALIGNMENT");
      mergeReview = "YES";
      titleChangeNeeded = "REVIEW";
      descriptionChangeNeeded = "REVIEW";
      introChangeNeeded = "REVIEW";
      h2ChangeNeeded = "REVIEW";
      faqChangeNeeded = "REVIEW";
      h2Action = "RENAME_H2";
      internalLinkChangeNeeded = "REVIEW";
    }

    for (const pair of boundary) {
      const boundarySignals = pair.onPageBoundarySignals || {};
      addAction(actions, "QUERY_BOUNDARY_FIX");
      addAction(actions, "ANCHOR_ALIGNMENT");
      addAction(actions, "CONTENT_ALIGNMENT");
      titleChangeNeeded = flagMax(titleChangeNeeded, fieldFlagFromBoundary(boundarySignals.TITLE_BOUNDARY, false));
      descriptionChangeNeeded = flagMax(descriptionChangeNeeded, fieldFlagFromBoundary(boundarySignals.DESCRIPTION_BOUNDARY));
      introChangeNeeded = flagMax(introChangeNeeded, fieldFlagFromBoundary(boundarySignals.INTRO_BOUNDARY));
      h2ChangeNeeded = flagMax(h2ChangeNeeded, fieldFlagFromBoundary(boundarySignals.H2_BOUNDARY));
      faqChangeNeeded = flagMax(faqChangeNeeded, fieldFlagFromBoundary(boundarySignals.FAQ_BOUNDARY));
      h2Action = H2_ACTION_OPTIONS.includes(h2ActionFromBoundary(boundarySignals.H2_BOUNDARY)) ? h2ActionFromBoundary(boundarySignals.H2_BOUNDARY) : h2Action;
      internalLinkChangeNeeded = flagMax(internalLinkChangeNeeded, "REVIEW");
      if (boundarySignals.DESCRIPTION_BOUNDARY === "WEAK" || lowQueryConfidence || lowTitleAlignment) addAction(actions, "META_ALIGNMENT");
    }

    if (lowQueryConfidence || lowTitleAlignment) {
      addAction(actions, "META_ALIGNMENT");
      addAction(actions, "CONTENT_ALIGNMENT");
      titleChangeNeeded = flagMax(titleChangeNeeded, "REVIEW");
      descriptionChangeNeeded = flagMax(descriptionChangeNeeded, "REVIEW");
      introChangeNeeded = flagMax(introChangeNeeded, "REVIEW");
      h2ChangeNeeded = flagMax(h2ChangeNeeded, "REVIEW");
      h2Action = h2Action === "KEEP_H2" ? "RENAME_H2" : h2Action;
    }

    if (queryRow.tagQuerySupport === "TAG_PARTIALLY_SUPPORTS_QUERY") {
      tagChangeNeeded = "REVIEW";
    }
    const ownTags = inventory?.tags || [];
    if (ownTags.some((tag) => normalizableTags.has(tag)) || (singleUseTagsByPost.get(queryRow.id) || []).length >= 6) {
      tagChangeNeeded = flagMax(tagChangeNeeded, "REVIEW");
    }
    if (tagChangeNeeded !== "NO") {
      addAction(actions, "META_ALIGNMENT");
    }

    if (linkOpportunities.length || topicIsolated || weakAnchor) {
      addAction(actions, "LINK_ONLY");
      internalLinkChangeNeeded = linkOpportunities.some((opp) => opp.status === "APPROVE") ? "YES" : "REVIEW";
      if (weakAnchor || linkOpportunities.some((opp) => opp.relationship === "BOUNDARY_CLARIFICATION")) {
        addAction(actions, "ANCHOR_ALIGNMENT");
      }
    }

    if (hubAssessment && hubRole !== "NONE") {
      addAction(actions, "HUB_INTEGRATION");
      if (!actions.has("CONTENT_ALIGNMENT") && hubRole.includes("HUB_REINFORCE")) {
        addAction(actions, "CONTENT_ALIGNMENT");
        introChangeNeeded = flagMax(introChangeNeeded, "YES");
        h2ChangeNeeded = flagMax(h2ChangeNeeded, "YES");
        h2Action = "ADD_H2";
      }
      if (hubRole.includes("DEDICATED_HUB") || hubRole.includes("EXISTING_CORE") || hubRole.includes("SPOKE")) {
        addAction(actions, "LINK_ONLY");
        internalLinkChangeNeeded = flagMax(internalLinkChangeNeeded, "YES");
      }
    }

    if (marketWeak) {
      addAction(actions, "MARKET_FUNNEL_ALIGNMENT");
      addAction(actions, "LINK_ONLY");
      marketLinkChangeNeeded = "YES";
    }

    if (toolPartial) {
      addAction(actions, "TOOL_FUNNEL_ALIGNMENT");
      addAction(actions, "LINK_ONLY");
      toolLinkChangeNeeded = "REVIEW";
    }

    if (!actions.size) {
      addAction(actions, "NO_CHANGE_REQUIRED");
    } else if (
      titleChangeNeeded === "NO" &&
      descriptionChangeNeeded === "NO" &&
      introChangeNeeded === "NO" &&
      h2ChangeNeeded === "NO" &&
      faqChangeNeeded === "NO" &&
      tagChangeNeeded === "NO"
    ) {
      addAction(actions, "KEEP");
    }

    const row = {
      category: queryRow.category,
      slug: queryRow.slug,
      id: queryRow.id,
      url: queryRow.url,
      title: queryRow.title,
      primaryQuery: queryRow.primaryQuery,
      queryConfidence: queryRow.primaryQueryConfidence,
      topicFamily: queryRow.topicFamily,
      role: linkRow?.role || (queryRow.coreDocumentCandidate ? "CORE_DOCUMENT_CANDIDATE" : "POST"),
      currentStatus: currentStatusFromSignals(signals),
      actions: Array.from(actions),
      titleChangeNeeded,
      descriptionChangeNeeded,
      introChangeNeeded,
      h2ChangeNeeded,
      h2Action,
      faqChangeNeeded,
      tagChangeNeeded,
      internalLinkChangeNeeded,
      marketLinkChangeNeeded,
      toolLinkChangeNeeded,
      hubRole,
      mergeReview,
      marketDashboardTarget: marketWeak ? "/market/indices" : queryRow.topicFamily === "REAL_ESTATE_DATA" ? "/market/real-estate" : "",
      marketDashboardSignal: marketWeak ? DASHBOARD_SIGNAL_BY_FAMILY[queryRow.topicFamily] || "" : "",
      sitemapHreflangFollowup: sitemapAnomalyIds.has(queryRow.id) ? "SEPARATE_TECH_FIX" : "NO_ACTION",
      manualArticleSchemaFollowup: manualArticleIds.has(queryRow.id) ? "REVIEW_REQUIRED" : "SAFE_REDUNDANCY",
      changeReason: "",
      riskIfChanged: "",
      expectedStructuralBenefit: "",
      baselineStatus: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
    };
    row.changeReason = titleChangeReason(row);
    row.riskIfChanged = highestRisk(row);
    row.expectedStructuralBenefit = expectedBenefit(row);
    return row;
  });

  const actionDistribution = {};
  for (const row of remediationRows) {
    for (const action of row.actions) increment(actionDistribution, action);
  }

  const postsRequiringAnyContentFileModification = remediationRows.filter(
    (row) =>
      row.titleChangeNeeded !== "NO" ||
      row.descriptionChangeNeeded !== "NO" ||
      row.introChangeNeeded !== "NO" ||
      row.h2ChangeNeeded !== "NO" ||
      row.faqChangeNeeded !== "NO" ||
      row.tagChangeNeeded !== "NO" ||
      row.internalLinkChangeNeeded !== "NO" ||
      row.marketLinkChangeNeeded !== "NO" ||
      row.toolLinkChangeNeeded !== "NO"
  );
  const postsRequiringOnlyLinkChanges = remediationRows.filter(
    (row) =>
      (row.internalLinkChangeNeeded !== "NO" || row.marketLinkChangeNeeded !== "NO" || row.toolLinkChangeNeeded !== "NO") &&
      row.titleChangeNeeded === "NO" &&
      row.descriptionChangeNeeded === "NO" &&
      row.introChangeNeeded === "NO" &&
      row.h2ChangeNeeded === "NO" &&
      row.faqChangeNeeded === "NO" &&
      row.tagChangeNeeded === "NO" &&
      row.mergeReview === "NO"
  );
  const postsRequiringNoChange = remediationRows.filter((row) => row.actions.length === 1 && row.actions[0] === "NO_CHANGE_REQUIRED");

  const changeCounts = {
    postsRequiringAnyContentFileModification: postsRequiringAnyContentFileModification.length,
    postsRequiringOnlyLinkChanges: postsRequiringOnlyLinkChanges.length,
    postsRequiringTitleChangeReview: remediationRows.filter((row) => row.titleChangeNeeded !== "NO").length,
    postsRequiringDescriptionChange: remediationRows.filter((row) => row.descriptionChangeNeeded !== "NO").length,
    postsRequiringBodyIntroH2FaqChange: remediationRows.filter(
      (row) => row.introChangeNeeded !== "NO" || row.h2ChangeNeeded !== "NO" || row.faqChangeNeeded !== "NO"
    ).length,
    postsRequiringTagReview: remediationRows.filter((row) => row.tagChangeNeeded !== "NO").length,
    postsRequiringInternalLinkChange: remediationRows.filter((row) => row.internalLinkChangeNeeded !== "NO").length,
    postsRequiringMarketLinkChange: remediationRows.filter((row) => row.marketLinkChangeNeeded !== "NO").length,
    postsRequiringToolLinkReview: remediationRows.filter((row) => row.toolLinkChangeNeeded !== "NO").length,
    postsRequiringNoChange: postsRequiringNoChange.length,
  };

  const boundaryPairPlans = buildBoundaryPairPlans(boundaryPairs, queryById);
  const hubPlans = buildHubPlans(hubAssessments);
  const implementationBatches = buildImplementationBatches();
  const monitoringPlan = buildMonitoringPlan();

  const marketDashboardPlan = (step4.marketDashboardFunnelAudit || []).map((audit) => {
    const useIndices = MARKET_INDEX_FAMILIES.has(audit.topicFamily);
    const targetUrl = useIndices ? "/market/indices" : audit.topicFamily === "REAL_ESTATE_DATA" ? "/market/real-estate" : "";
    return {
      topicFamily: audit.topicFamily,
      currentStatus: audit.status,
      postCount: audit.postCount,
      currentMarketDashboardLinkCount: audit.marketDashboardLinkCount,
      targetUrl,
      routeExists: targetUrl ? EXISTING_MARKET_ROUTES.some((route) => route.url === targetUrl && route.exists) : false,
      postToDashboardPlan:
        audit.status === "WEAK" && targetUrl
          ? `Add one contextual dashboard link where data validation is natural: ${DASHBOARD_SIGNAL_BY_FAMILY[audit.topicFamily] || targetUrl}.`
          : "Keep existing dashboard links; avoid adding more unless a reader workflow needs it.",
      dashboardToPostPlan:
        audit.status === "WEAK" && targetUrl
          ? "Future safe architecture: manually curated related-explainer module on /market/indices; no querystring canonical or dynamic mass linking."
          : "No new dashboard-to-post plan needed in Step 5.",
    };
  });

  const toolFunnelPlan = (step4.calculatorFunnelAudit || []).map((audit) => ({
    topicFamily: audit.topicFamily,
    status: audit.status,
    toolPaths: audit.toolPaths,
    postCount: audit.postCount,
    guidePosts: audit.guidePosts,
    plan:
      audit.status === "PARTIAL"
        ? "All linked posts already reach the tool, but guide ownership is thin. Keep links natural; review whether one existing guide should be labelled as the primary workflow page before creating anything new."
        : "Keep existing tool funnel. No blanket link additions.",
  }));

  const tagStrategy = {
    totalUniqueTags: step1.tags?.totalUnique || 0,
    totalAssignments: step1.tags?.totalAssignments || 0,
    singleUseTags: (step1.tags?.singleUse || []).length,
    similarGroups: step1.tags?.similarGroups || [],
    policy: "Tags are taxonomy/reader aids, not ranking-keyword fields.",
    classifications: [
      { classification: "KEEP", rule: "Meaningful post-specific tags that help users understand the topic." },
      { classification: "NORMALIZE", rule: "Near-duplicate spacing variants such as 적립식 투자/적립식투자, 목표 자산/목표자산." },
      { classification: "CONSOLIDATE_CANDIDATE", rule: "Single-use tags only when they fragment a real topic family; no automatic tag archive creation." },
    ],
  };

  const technicalSeoFollowups = {
    sitemapHreflang: {
      count: step1.sitemapAnomalies?.summary?.sitemapHreflangSelfMissing || 0,
      classification: "SEPARATE_TECH_FIX",
      affectedIds: step1.sitemapAnomalies?.items || [],
      rationale: "Content remediation should not casually change sitemap/hreflang output.",
    },
    manualArticleSchema: {
      count: manualArticleIds.size,
      classification: "REVIEW_REQUIRED",
      rationale: "Manual Article-like blocks coexist with template BlogPosting. Do not remove in Step 5; review separately for redundancy and visible-content consistency.",
    },
  };

  const baselineSnapshotPlan = {
    fields: [
      "url",
      "title",
      "description",
      "dateModified",
      "primaryQuery",
      "topicFamily",
      "internalInbound",
      "internalOutbound",
      "currentActions",
      "naverRank",
      "naverImpression",
      "naverClick",
      "naverCtr",
    ],
    externalMetricsStatus: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
    note: "Repo reports provide structural baseline. Naver rank/impression/click/CTR require Search Advisor/manual collection or existing external exports.",
  };

  const riskSummary = countBy(remediationRows.map((row) => row.riskIfChanged));
  const linkStatusDistribution = countBy(linkPlan.map((row) => row.status));
  const linkRelationshipDistribution = countBy(linkPlan.map((row) => row.relationship));

  const duplicateUrls = remediationRows
    .map((row) => row.url)
    .filter((url, index, urls) => urls.indexOf(url) !== index);
  const missingFromInventory = remediationRows.filter((row) => !inventoryById.has(row.id)).map((row) => row.id);
  const validation = {
    expectedRows: 79,
    actualRows: remediationRows.length,
    allUrlsAccounted: remediationRows.length === step1.summary.totalPosts && missingFromInventory.length === 0,
    duplicateUrlCount: new Set(duplicateUrls).size,
    duplicateUrls: uniq(duplicateUrls),
    boundaryWeakPairsExpected: 7,
    boundaryWeakPairsActual: boundaryPairs.length,
    boundaryWeakPairsRepresented: boundaryPairs.every((pair) =>
      [pair.postA, pair.postB].every((id) => remediationRows.find((row) => row.id === id)?.actions.includes("QUERY_BOUNDARY_FIX"))
    ),
    trueCannibalizationExpected: 1,
    trueCannibalizationActual: trueCannibalPairs.length,
    trueCannibalizationRepresented: trueCannibalPairs.every((pair) =>
      [pair.postA, pair.postB].every((id) => remediationRows.find((row) => row.id === id)?.actions.includes("MERGE_REVIEW"))
    ),
    hubCandidatesExpected: 5,
    hubCandidatesActual: hubAssessments.length,
    hubCandidatesRepresented: HUB_FAMILY_ORDER.every((family) => hubByFamily.has(family)),
    highValueLinksExpected: step4.summary.highValueLinkOpportunities,
    highValueLinksActual: linkPlan.length,
    highValueLinksClassified: linkPlan.length === step4.summary.highValueLinkOpportunities && linkPlan.every((row) => ["APPROVE", "REVIEW", "SKIP"].includes(row.status)),
    actionTaxonomyValid: remediationRows.every((row) => row.actions.every((action) => ACTION_TAXONOMY.includes(action))),
    h2ActionTaxonomyValid: remediationRows.every((row) => H2_ACTION_OPTIONS.includes(row.h2Action)),
    scriptsReportsOnly: true,
  };

  const result = {
    generatedAt: new Date().toISOString(),
    dateStamp: DATE_STAMP,
    finalVerdict: "FULL_SITE_REMEDIATION_PLAN_READY_IMPLEMENTATION_NOT_STARTED",
    scope: {
      posts: remediationRows.length,
      language: "ko",
      sourceReports: [
        path.relative(ROOT, STEP1_JSON).replace(/\\/g, "/"),
        path.relative(ROOT, STEP2_JSON).replace(/\\/g, "/"),
        path.relative(ROOT, STEP3_JSON).replace(/\\/g, "/"),
        path.relative(ROOT, STEP4_JSON).replace(/\\/g, "/"),
      ],
      noContentOrRuntimeFilesModified: true,
    },
    actionTaxonomy: ACTION_TAXONOMY,
    h2ActionOptions: H2_ACTION_OPTIONS,
    summary: {
      actionDistribution,
      changeCounts,
      riskSummary,
      linkStatusDistribution,
      linkRelationshipDistribution,
    },
    remediationRows,
    linkPlan,
    boundaryPairPlans,
    cannibalizationPlan: {
      pair: trueCannibalPairs[0]
        ? `${trueCannibalPairs[0].postA} :: ${trueCannibalPairs[0].postB}`
        : "",
      ownerCandidate: trueCannibalPairs[0]?.ownerPost || "personalFinance/how-much-monthly-invest-for-100m",
      options: [
        {
          option: "A",
          name: "Separate intent",
          description: "두 문서를 유지하되 owner는 '1억원 만들기 월 투자금', supporting은 질문형/기간별 표 intent로 좁힌다.",
          risk: "MEDIUM_RISK",
          recommendation: "Only if external baseline shows both URLs independently earn distinct queries.",
        },
        {
          option: "B",
          name: "Owner-centered merge + redirect",
          description: "supporting 내용을 owner에 흡수하고 redirect/canonical/internal links를 owner로 정리한다.",
          risk: "HIGH_RISK",
          recommendation: "Use only after baseline confirms one URL should consolidate equity.",
        },
        {
          option: "C",
          name: "Owner + table parent architecture",
          description: "owner를 대표 계산 가이드로 두고 기간별 표/질문형 intent는 하위 구조 또는 future merge candidate로 관리한다.",
          risk: "MEDIUM_TO_HIGH_RISK",
          recommendation: "RECOMMENDED_FUTURE_ACTION",
        },
      ],
      recommendedFutureAction: "C_NOW_OWNER_PLUS_TABLE_PARENT_ARCHITECTURE__REVIEW_B_AFTER_BASELINE",
      noActualMergeRedirectInStep5: true,
    },
    hubPlans,
    marketDashboardRoutes: EXISTING_MARKET_ROUTES,
    marketDashboardPlan,
    toolFunnelPlan,
    tagStrategy,
    technicalSeoFollowups,
    implementationBatches,
    baselineSnapshotPlan,
    monitoringPlan,
    limitations: [
      "No live Naver ranking, impressions, clicks, or CTR data was used.",
      "No content/posts, runtime code, sitemap, canonical, hreflang, schema, title, description, body, FAQ, image, or internal link files were modified.",
      "Suggested hub URLs are route-convention concepts only and were not created.",
      "Market dashboard links use only existing repository routes confirmed under pages/market/**.",
    ],
    validation,
  };

  writeCsv(
    MATRIX_CSV,
    remediationRows.map((row) => ({ ...row, actions: row.actions.join("|") })),
    [
      "category",
      "slug",
      "url",
      "title",
      "primaryQuery",
      "queryConfidence",
      "topicFamily",
      "role",
      "currentStatus",
      "actions",
      "titleChangeNeeded",
      "descriptionChangeNeeded",
      "introChangeNeeded",
      "h2ChangeNeeded",
      "faqChangeNeeded",
      "tagChangeNeeded",
      "internalLinkChangeNeeded",
      "marketLinkChangeNeeded",
      "toolLinkChangeNeeded",
      "hubRole",
      "mergeReview",
      "changeReason",
      "riskIfChanged",
      "expectedStructuralBenefit",
    ]
  );

  writeCsv(
    LINK_PLAN_CSV,
    linkPlan,
    [
      "index",
      "status",
      "source",
      "target",
      "sourceUrl",
      "targetUrl",
      "sourceSectionConcept",
      "anchorConcept",
      "relationship",
      "sourceTopicFamily",
      "targetTopicFamily",
      "reason",
      "anchorPolicy",
    ]
  );

  ensureDir(REPORT_JSON);
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  fs.writeFileSync(REPORT_MD, renderMainReport(result), "utf8");
  fs.writeFileSync(HUB_PLAN_MD, renderHubReport(result), "utf8");

  console.log(JSON.stringify({
    finalVerdict: result.finalVerdict,
    rows: remediationRows.length,
    noChange: postsRequiringNoChange.length,
    linkPlanRows: linkPlan.length,
    output: {
      reportMd: path.relative(ROOT, REPORT_MD).replace(/\\/g, "/"),
      reportJson: path.relative(ROOT, REPORT_JSON).replace(/\\/g, "/"),
      matrixCsv: path.relative(ROOT, MATRIX_CSV).replace(/\\/g, "/"),
      linkPlanCsv: path.relative(ROOT, LINK_PLAN_CSV).replace(/\\/g, "/"),
      hubPlanMd: path.relative(ROOT, HUB_PLAN_MD).replace(/\\/g, "/"),
    },
    validation,
  }, null, 2));
}

function mdTable(rows, columns) {
  const header = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => String(row[column.key] ?? "").replace(/\|/g, "/")).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
}

function renderMainReport(result) {
  const s = result.summary;
  const rows = result.remediationRows;
  const change = s.changeCounts;
  const titleCandidates = rows.filter((row) => row.titleChangeNeeded !== "NO");
  const contentCandidates = rows.filter((row) => row.descriptionChangeNeeded !== "NO" || row.introChangeNeeded !== "NO" || row.h2ChangeNeeded !== "NO" || row.faqChangeNeeded !== "NO");
  const linkOnlyRows = rows.filter(
    (row) =>
      (row.internalLinkChangeNeeded !== "NO" || row.marketLinkChangeNeeded !== "NO" || row.toolLinkChangeNeeded !== "NO") &&
      row.titleChangeNeeded === "NO" &&
      row.descriptionChangeNeeded === "NO" &&
      row.introChangeNeeded === "NO" &&
      row.h2ChangeNeeded === "NO" &&
      row.faqChangeNeeded === "NO" &&
      row.tagChangeNeeded === "NO" &&
      row.mergeReview === "NO"
  );
  const noChangeRows = rows.filter((row) => row.actions.length === 1 && row.actions[0] === "NO_CHANGE_REQUIRED");

  const actionRows = Object.entries(s.actionDistribution)
    .sort((a, b) => b[1] - a[1])
    .map(([action, count]) => ({ action, count }));
  const riskRows = Object.entries(s.riskSummary).map(([risk, count]) => ({ risk, count }));
  const linkRows = Object.entries(s.linkStatusDistribution).map(([status, count]) => ({ status, count }));

  return `# FinMap KO Post Naver Search Visibility Audit Step 5

Generated: ${result.generatedAt}

## Final Verdict

${result.finalVerdict}

Step 5 is a plan-only remediation map. It modifies no content/runtime/SEO output files. The generated matrix covers all ${result.scope.posts} Korean posts and classifies every Step 4 high-value link opportunity.

## Full-Site Summary

- Scope: ${result.scope.posts} KO posts
- Inputs: ${result.scope.sourceReports.join(", ")}
- Output mode: planning artifacts only
- Actual market routes used: ${result.marketDashboardRoutes.filter((route) => route.exists).map((route) => route.url).join(", ")}
- External search baseline: ${result.baselineSnapshotPlan.externalMetricsStatus}

## 79-Post Action Distribution

${mdTable(actionRows, [
  { key: "action", label: "Action" },
  { key: "count", label: "Posts" },
])}

## Title/Meta Change Summary

- Posts requiring any content-file modification: ${change.postsRequiringAnyContentFileModification}
- Link-only posts: ${change.postsRequiringOnlyLinkChanges}
- Title change candidates: ${change.postsRequiringTitleChangeReview}
- Description change candidates: ${change.postsRequiringDescriptionChange}
- Intro/H2/FAQ body candidates: ${change.postsRequiringBodyIntroH2FaqChange}
- Tag review candidates: ${change.postsRequiringTagReview}
- No-change posts: ${change.postsRequiringNoChange}

Title changes are conservative REVIEW-only candidates. Description, intro, H2, FAQ, and anchor wording are preferred before changing a title.

## Content Alignment Summary

${mdTable(
  contentCandidates.slice(0, 30).map((row) => ({
    id: row.id,
    topicFamily: row.topicFamily,
    description: row.descriptionChangeNeeded,
    intro: row.introChangeNeeded,
    h2: `${row.h2ChangeNeeded}/${row.h2Action}`,
    faq: row.faqChangeNeeded,
    risk: row.riskIfChanged,
  })),
  [
    { key: "id", label: "Post" },
    { key: "topicFamily", label: "Topic" },
    { key: "description", label: "Description" },
    { key: "intro", label: "Intro" },
    { key: "h2", label: "H2" },
    { key: "faq", label: "FAQ" },
    { key: "risk", label: "Risk" },
  ]
)}

Full row-level details are in ${path.relative(ROOT, MATRIX_CSV).replace(/\\/g, "/")}.

## Internal Link Remediation

- Step 4 high-value link opportunities: ${result.linkPlan.length}
- Status distribution: ${Object.entries(s.linkStatusDistribution).map(([k, v]) => `${k} ${v}`).join(", ")}
- Relationship distribution: ${Object.entries(s.linkRelationshipDistribution).map(([k, v]) => `${k} ${v}`).join(", ")}
- Anchor policy: partial/synonym/descriptive/natural anchors; avoid repeated exact-match stuffing.

${mdTable(linkRows, [
  { key: "status", label: "Status" },
  { key: "count", label: "Links" },
])}

## Boundary Weak Pair Plan

${mdTable(
  result.boundaryPairPlans.map((pair) => ({
    owner: pair.ownerPost,
    supporting: pair.supportingPost,
    ownerQuery: pair.ownerPrimaryQuery,
    title: pair.titlePlan,
    h2: pair.h2Plan,
    faq: pair.faqPlan,
  })),
  [
    { key: "owner", label: "Owner" },
    { key: "supporting", label: "Supporting" },
    { key: "ownerQuery", label: "Owner Query" },
    { key: "title", label: "Title" },
    { key: "h2", label: "H2" },
    { key: "faq", label: "FAQ" },
  ]
)}

## Cannibalization Resolution Plan

- Pair: ${result.cannibalizationPlan.pair}
- Owner candidate: ${result.cannibalizationPlan.ownerCandidate}
- Recommended future action: ${result.cannibalizationPlan.recommendedFutureAction}
- Step 5 action: no merge, no redirect, no canonical change.

## Hub Strategy

- DCA: ${result.hubPlans.dca.decision}; suggested URL concept ${result.hubPlans.dca.suggestedUrl}
- HOUSEHOLD_FINANCE: ${result.hubPlans.householdFinance.decision}; suggested URL concept ${result.hubPlans.householdFinance.suggestedUrl}
- Existing core reinforcement: ${result.hubPlans.existingCoreReinforcement.map((hub) => `${hub.topicFamily} -> ${hub.candidateUrl}`).join("; ")}

## Market Dashboard Funnel Plan

${mdTable(
  result.marketDashboardPlan.map((row) => ({
    topicFamily: row.topicFamily,
    status: row.currentStatus,
    targetUrl: row.targetUrl || "NO_ACTION",
    routeExists: row.routeExists,
    plan: row.postToDashboardPlan,
  })),
  [
    { key: "topicFamily", label: "Topic" },
    { key: "status", label: "Current" },
    { key: "targetUrl", label: "Target URL" },
    { key: "routeExists", label: "Exists" },
    { key: "plan", label: "Plan" },
  ]
)}

## Tool Funnel Plan

${mdTable(
  result.toolFunnelPlan.map((row) => ({
    topicFamily: row.topicFamily,
    status: row.status,
    tools: row.toolPaths.join(" / "),
    guidePosts: row.guidePosts.join(" / ") || "REVIEW",
    plan: row.plan,
  })),
  [
    { key: "topicFamily", label: "Topic" },
    { key: "status", label: "Status" },
    { key: "tools", label: "Tools" },
    { key: "guidePosts", label: "Guide" },
    { key: "plan", label: "Plan" },
  ]
)}

## Tag Strategy

- Total unique tags: ${result.tagStrategy.totalUniqueTags}
- Single-use tags: ${result.tagStrategy.singleUseTags}
- Similar groups to normalize: ${result.tagStrategy.similarGroups.map((group) => group.join(" / ")).join("; ")}
- Policy: ${result.tagStrategy.policy}

## Technical SEO Follow-ups

- Sitemap/hreflang self missing: ${result.technicalSeoFollowups.sitemapHreflang.count}, classification ${result.technicalSeoFollowups.sitemapHreflang.classification}
- Manual Article-like schema with template BlogPosting: ${result.technicalSeoFollowups.manualArticleSchema.count}, classification ${result.technicalSeoFollowups.manualArticleSchema.classification}
- These are separate technical fixes, not content-batch edits.

## Implementation Batches

${mdTable(result.implementationBatches, [
  { key: "batch", label: "Batch" },
  { key: "name", label: "Name" },
  { key: "scope", label: "Scope" },
  { key: "risk", label: "Risk" },
  { key: "dependency", label: "Dependency" },
  { key: "validation", label: "Validation" },
])}

## Risk Summary

${mdTable(riskRows, [
  { key: "risk", label: "Risk" },
  { key: "count", label: "Posts" },
])}

High-risk actions are title/merge/redirect/canonical-class decisions and remain review-only in this Step 5 plan.

## Baseline Snapshot Plan

- Fields: ${result.baselineSnapshotPlan.fields.join(", ")}
- Naver rank/impression/click/CTR: ${result.baselineSnapshotPlan.externalMetricsStatus}
- Existing repo search collection reports can be used as an input source if fresh exports are available; no credentials/settings are invented here.

## Monitoring Plan

${mdTable(result.monitoringPlan, [
  { key: "day", label: "Time" },
  { key: "scope", label: "Scope" },
  { key: "checks", label: "Checks" },
])}

## Data Quality / Limitations

${result.limitations.map((item) => `- ${item}`).join("\n")}

## Validation Snapshot

${mdTable(
  Object.entries(result.validation).map(([key, value]) => ({ key, value: Array.isArray(value) ? value.join(" / ") : value })),
  [
    { key: "key", label: "Check" },
    { key: "value", label: "Value" },
  ]
)}

## Appendix: Title Change Candidates

${titleCandidates.map((row) => `- ${row.id}: ${row.titleChangeNeeded} (${row.primaryQuery})`).join("\n") || "- None"}

## Appendix: Link-Only Posts

${linkOnlyRows.map((row) => `- ${row.id}`).join("\n") || "- None"}

## Appendix: No-Change Posts

${noChangeRows.map((row) => `- ${row.id}`).join("\n") || "- None"}
`;
}

function renderHubReport(result) {
  const hub = result.hubPlans;
  return `# FinMap KO Topic Hub Plan

Generated: ${result.generatedAt}

## DCA Hub

- Decision: ${hub.dca.decision}
- Purpose: ${hub.dca.purpose}
- Primary query: ${hub.dca.primaryQuery}
- Secondary queries: ${hub.dca.secondaryQueries.join(", ")}
- Suggested URL concept: ${hub.dca.suggestedUrl} (${hub.dca.suggestedUrlStatus})
- Sections: ${hub.dca.sections.join(" / ")}
- Docs to link:
${hub.dca.docsToLink.map((id) => `  - ${id}`).join("\n")}
- Why existing dca-vs-lumpsum cannot serve as hub: ${hub.dca.whyExistingCoreCannotServe}

## Household Finance Hub

- Decision: ${hub.householdFinance.decision}
- Purpose: ${hub.householdFinance.purpose}
- Primary query: ${hub.householdFinance.primaryQuery}
- Suggested URL concept: ${hub.householdFinance.suggestedUrl} (${hub.householdFinance.suggestedUrlStatus})
- Existing-doc decision: ${hub.householdFinance.existingDocDecision}
- Sections: ${hub.householdFinance.sections.join(" / ")}
- Docs to link:
${hub.householdFinance.docsToLink.map((id) => `  - ${id}`).join("\n")}

## Existing Core Hub Reinforcement

${hub.existingCoreReinforcement
  .map(
    (item) => `### ${item.topicFamily}

- Decision: ${item.decision}
- Core documents: ${item.coreDocuments.join(", ")}
- Candidate URL: ${item.candidateUrl}
- Intro role: ${item.introRole}
- Nav section: ${item.navSection}
- Linked spokes: ${item.linkedSpokes.join(", ")}
- Tool/dashboard links: ${item.toolDashboardLinks.join(", ")}
- Inbound reverse links: ${item.inboundReverseLinks.join(", ")}
`
  )
  .join("\n")}

## Guardrails

- Do not create hub pages in Step 5.
- Do not use a comparison article as a broad hub if it owns a narrower query.
- Spokes should link back to hub/core with natural anchors, not repeated exact-match anchors.
- Any new hub URL must go through sitemap, canonical, hreflang, structured data, and internal link validation in a later implementation batch.
`;
}

main();
