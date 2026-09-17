const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DATE_STAMP = "2026-09-16";
const STEP1_JSON = path.join(ROOT, "reports", `naver-ko-post-search-inventory-${DATE_STAMP}.json`);
const STEP2_JSON = path.join(ROOT, "reports", `naver-ko-post-query-intent-${DATE_STAMP}.json`);
const REPORT_MD = path.join(ROOT, "reports", `naver-ko-post-cannibalization-${DATE_STAMP}.md`);
const REPORT_JSON = path.join(ROOT, "reports", `naver-ko-post-cannibalization-${DATE_STAMP}.json`);
const MATRIX_CSV = path.join(ROOT, "reports", `naver-ko-query-ownership-matrix-${DATE_STAMP}.csv`);

const CLASSIFICATIONS = [
  "TRUE_CANNIBALIZATION",
  "QUERY_BOUNDARY_WEAK",
  "PARENT_CHILD_RELATION",
  "COMPLEMENTARY_DOCUMENTS",
  "SCENARIO_VARIANTS",
  "DEFINITION_VS_IMPACT",
  "HUB_SPOKE_RELATION",
  "CALCULATOR_GUIDE_VS_INFORMATIONAL",
  "NO_MEANINGFUL_CONFLICT",
];

const CORE_INTENTS = new Set(["DEFINITION", "EXPLANATION", "HOW_TO"]);
const IMPACT_INTENTS = new Set(["MARKET_IMPACT", "DATA_INTERPRETATION"]);
const SCENARIO_INTENTS = new Set(["SCENARIO_ANALYSIS", "CALCULATION", "COMPARISON", "DECISION_SUPPORT"]);
const STOPWORDS = new Set([
  "그리고",
  "하지만",
  "있는",
  "없는",
  "하는",
  "하면",
  "사용법",
  "가이드",
  "방법",
  "영향",
  "의미",
  "기준",
  "전략",
  "비교",
  "체크",
  "계산기",
  "투자",
  "시장",
]);

function pairKey(a, b) {
  return [a, b].sort().join("::");
}

const MANUAL_PAIR_RULES = new Map([
  [
    pairKey("economicInfo/geopolitics-oil-fx-dashboard", "economicInfo/geopolitics-to-usd-liquidity-fx"),
    {
      classification: "QUERY_BOUNDARY_WEAK",
      evidenceLevel: "LIKELY_STRUCTURAL",
      ownerPost: "economicInfo/geopolitics-oil-fx-dashboard",
      supportingPost: "economicInfo/geopolitics-to-usd-liquidity-fx",
      supportingRole: "달러 유동성과 환율 전이 경로를 좁게 보완",
      recommendation: "CLARIFY_QUERY_BOUNDARY",
      reason: "둘 다 지정학과 환율을 다루지만 dashboard 문서는 multi-asset overview, USD-liquidity 문서는 달러 유동성 전이로 경계를 세울 수 있다.",
    },
  ],
  [
    pairKey("economicInfo/hormuz-risk-oil-insurance-freight-premium", "economicInfo/war-risk-oil-supply-insurance-shipping"),
    {
      classification: "QUERY_BOUNDARY_WEAK",
      evidenceLevel: "LIKELY_STRUCTURAL",
      ownerPost: "economicInfo/hormuz-risk-oil-insurance-freight-premium",
      supportingPost: "economicInfo/war-risk-oil-supply-insurance-shipping",
      supportingRole: "전쟁이라는 넓은 지정학 shock과 원유 공급 chain을 설명",
      recommendation: "CLARIFY_QUERY_BOUNDARY",
      reason: "중동 운송/chokepoint query와 전쟁-원유 공급 query가 인접해 있어 ownership boundary를 명확히 둘 필요가 있다.",
    },
  ],
  [
    pairKey("economicInfo/inflation-basics", "economicInfo/inflation-rate-basics"),
    {
      classification: "QUERY_BOUNDARY_WEAK",
      evidenceLevel: "LIKELY_STRUCTURAL",
      ownerPost: "economicInfo/inflation-basics",
      supportingPost: "economicInfo/inflation-rate-basics",
      supportingRole: "물가상승률, CPI 측정과 지표 해석을 담당",
      recommendation: "CLARIFY_QUERY_BOUNDARY",
      reason: "인플레이션 개념과 물가상승률 지표는 분리 가능하지만 definition query가 겹칠 수 있다.",
    },
  ],
  [
    pairKey("economicInfo/oil-shock-to-usdkrw-korea-transmission", "investingInfo/wti-impact-on-korea-kospi"),
    {
      classification: "QUERY_BOUNDARY_WEAK",
      evidenceLevel: "POSSIBLE",
      ownerPost: "investingInfo/wti-impact-on-korea-kospi",
      supportingPost: "economicInfo/oil-shock-to-usdkrw-korea-transmission",
      supportingRole: "유가 shock이 원달러 환율과 한국 macro로 전이되는 경로",
      recommendation: "CLARIFY_QUERY_BOUNDARY",
      reason: "둘 다 유가의 한국 영향이지만 WTI/KOSPI와 USDKRW 전이를 분리하면 정상 구조가 된다.",
    },
  ],
  [
    pairKey("investingInfo/etf-impact-of-tnx", "investingInfo/korea-etf-deep-dive-tnx"),
    {
      classification: "PARENT_CHILD_RELATION",
      evidenceLevel: "POSSIBLE",
      ownerPost: "investingInfo/etf-impact-of-tnx",
      supportingPost: "investingInfo/korea-etf-deep-dive-tnx",
      supportingRole: "국내 상장 ETF라는 narrower child scenario",
      recommendation: "PARENT_CHILD_RESTRUCTURE",
      reason: "general ETF impact 문서와 국내 ETF deep-dive 문서의 parent-child 구조가 자연스럽다.",
    },
  ],
  [
    pairKey("investingInfo/etf-impact-of-tnx", "investingInfo/us10y-impact-on-korea-and-stock-market"),
    {
      classification: "QUERY_BOUNDARY_WEAK",
      evidenceLevel: "POSSIBLE",
      ownerPost: "investingInfo/us10y-impact-on-korea-and-stock-market",
      supportingPost: "investingInfo/etf-impact-of-tnx",
      supportingRole: "ETF 가격 반응이라는 하위 자산군 관점",
      recommendation: "CLARIFY_QUERY_BOUNDARY",
      reason: "미국 10년물의 한국 증시 영향과 ETF 영향이 secondary query에서 섞일 수 있다.",
    },
  ],
  [
    pairKey("investingInfo/usd-krw-exchange-rate-and-kospi", "investingInfo/usd-krw-weak-won-sector-map-kospi"),
    {
      classification: "PARENT_CHILD_RELATION",
      evidenceLevel: "POSSIBLE",
      ownerPost: "investingInfo/usd-krw-exchange-rate-and-kospi",
      supportingPost: "investingInfo/usd-krw-weak-won-sector-map-kospi",
      supportingRole: "원화 약세의 업종별 수혜/피해 map",
      recommendation: "PARENT_CHILD_RESTRUCTURE",
      reason: "환율-코스피 일반 문서와 업종 지도 문서로 자연스럽게 분화된다.",
    },
  ],
  [
    pairKey("personalFinance/dca-vs-lumpsum-decision-rules", "personalFinance/dca-vs-lump-sum-when-results-differ"),
    {
      classification: "QUERY_BOUNDARY_WEAK",
      evidenceLevel: "LIKELY_STRUCTURAL",
      ownerPost: "personalFinance/dca-vs-lumpsum-decision-rules",
      supportingPost: "personalFinance/dca-vs-lump-sum-when-results-differ",
      supportingRole: "수익 결과와 scenario 차이가 왜 발생하는지 설명",
      recommendation: "CLARIFY_QUERY_BOUNDARY",
      reason: "DCA vs lump sum query가 거의 같지만 one is decision rules, the other is result divergence.",
    },
  ],
  [
    pairKey("personalFinance/dsr-40-income-loan-limit-table", "personalFinance/salary-40m-mortgage-limit"),
    {
      classification: "PARENT_CHILD_RELATION",
      evidenceLevel: "POSSIBLE",
      ownerPost: "personalFinance/dsr-40-income-loan-limit-table",
      supportingPost: "personalFinance/salary-40m-mortgage-limit",
      supportingRole: "연봉 4000만원 단일 scenario",
      recommendation: "PARENT_CHILD_RESTRUCTURE",
      reason: "연봉별 DSR 40% 한도표가 parent, 연봉 4000만원은 child scenario다.",
    },
  ],
  [
    pairKey("personalFinance/dsr-40-income-loan-limit-table", "personalFinance/salary-50m-dsr-40-loan-limit"),
    {
      classification: "PARENT_CHILD_RELATION",
      evidenceLevel: "POSSIBLE",
      ownerPost: "personalFinance/dsr-40-income-loan-limit-table",
      supportingPost: "personalFinance/salary-50m-dsr-40-loan-limit",
      supportingRole: "연봉 5000만원 단일 scenario",
      recommendation: "PARENT_CHILD_RESTRUCTURE",
      reason: "연봉별 DSR 40% 한도표가 parent, 연봉 5000만원은 child scenario다.",
    },
  ],
  [
    pairKey("personalFinance/how-much-monthly-invest-for-100m", "personalFinance/how-much-per-month-for-100m"),
    {
      classification: "TRUE_CANNIBALIZATION",
      evidenceLevel: "CONFIRMED_STRUCTURAL",
      ownerPost: "personalFinance/how-much-monthly-invest-for-100m",
      supportingPost: "personalFinance/how-much-per-month-for-100m",
      supportingRole: "질문형 phrase를 보완하는 supporting document 후보",
      recommendation: "MERGE_REVIEW_REQUIRED",
      reason: "두 문서가 같은 1억원 목표, 월 투자금 계산, calculation intent를 동시에 겨냥한다.",
    },
  ],
  [
    pairKey("personalFinance/how-much-monthly-invest-for-100m", "personalFinance/monthly-investment-for-100m-table"),
    {
      classification: "PARENT_CHILD_RELATION",
      evidenceLevel: "LIKELY_STRUCTURAL",
      ownerPost: "personalFinance/monthly-investment-for-100m-table",
      supportingPost: "personalFinance/how-much-monthly-invest-for-100m",
      supportingRole: "1억원 단일 목표 계산기 support",
      recommendation: "PARENT_CHILD_RESTRUCTURE",
      reason: "목표금액별 표가 broader parent, 1억원 monthly 투자금은 child scenario다.",
    },
  ],
  [
    pairKey("personalFinance/how-much-per-month-for-100m", "personalFinance/monthly-investment-for-100m-table"),
    {
      classification: "PARENT_CHILD_RELATION",
      evidenceLevel: "LIKELY_STRUCTURAL",
      ownerPost: "personalFinance/monthly-investment-for-100m-table",
      supportingPost: "personalFinance/how-much-per-month-for-100m",
      supportingRole: "1억 모으기 질문형 single-target scenario",
      recommendation: "PARENT_CHILD_RESTRUCTURE",
      reason: "목표금액별 표와 1억 단일 질문형 문서는 parent-child로 분리할 수 있다.",
    },
  ],
  [
    pairKey("personalFinance/personal-finance-3pillars", "personalFinance/personal-start-5steps"),
    {
      classification: "QUERY_BOUNDARY_WEAK",
      evidenceLevel: "LIKELY_STRUCTURAL",
      ownerPost: "personalFinance/personal-start-5steps",
      supportingPost: "personalFinance/personal-finance-3pillars",
      supportingRole: "예산, 비상금, 장기투자라는 framework를 설명",
      recommendation: "CLARIFY_QUERY_BOUNDARY",
      reason: "재테크 시작과 개인 재무관리 framework가 입문 검색 intent에서 겹칠 수 있다.",
    },
  ],
  [
    pairKey("personalFinance/salary-40m-mortgage-limit", "personalFinance/salary-50m-dsr-40-loan-limit"),
    {
      classification: "SCENARIO_VARIANTS",
      evidenceLevel: "NOT_SUPPORTED",
      ownerPost: "OWNER_SEPARATE_SCENARIOS",
      supportingPost: "",
      supportingRole: "연봉 금액별 독립 scenario",
      recommendation: "KEEP_AS_IS",
      reason: "연봉 4000만원과 5000만원은 숫자 조건이 다른 scenario variants다.",
    },
  ],
]);

const DEEP_DIVE_GROUPS = [
  {
    name: "Middle East / Oil",
    posts: [
      "economicInfo/hormuz-risk-oil-insurance-freight-premium",
      "economicInfo/war-risk-oil-supply-insurance-shipping",
      "economicInfo/geopolitics-oil-fx-dashboard",
      "economicInfo/oil-shock-to-usdkrw-korea-transmission",
      "investingInfo/wti-impact-on-korea-kospi",
    ],
    roles: {
      "economicInfo/hormuz-risk-oil-insurance-freight-premium": "transport/chokepoint, insurance premium, freight premium",
      "economicInfo/war-risk-oil-supply-insurance-shipping": "war/geopolitics, oil supply risk, inflation chain",
      "economicInfo/geopolitics-oil-fx-dashboard": "multi-asset dashboard across oil, FX, risk assets",
      "economicInfo/oil-shock-to-usdkrw-korea-transmission": "oil to USD/KRW and Korea macro transmission",
      "investingInfo/wti-impact-on-korea-kospi": "oil to Korea/KOSPI and sector interpretation",
    },
  },
  {
    name: "1억원 / 월 투자금",
    posts: [
      "personalFinance/how-much-monthly-invest-for-100m",
      "personalFinance/how-much-per-month-for-100m",
      "personalFinance/monthly-investment-for-100m-table",
    ],
    roles: {
      "personalFinance/how-much-monthly-invest-for-100m": "1억원 만들기 월 투자금 calculator support",
      "personalFinance/how-much-per-month-for-100m": "1억 모으기 매달 얼마 question phrase",
      "personalFinance/monthly-investment-for-100m-table": "목표금액별 월 투자금 table parent",
    },
  },
  {
    name: "DCA vs Lump Sum",
    posts: [
      "personalFinance/dca-vs-lump-sum-when-results-differ",
      "personalFinance/dca-vs-lumpsum-decision-rules",
    ],
    roles: {
      "personalFinance/dca-vs-lump-sum-when-results-differ": "수익 결과와 scenario 차이",
      "personalFinance/dca-vs-lumpsum-decision-rules": "사용자 의사결정과 실행 rule",
    },
  },
  {
    name: "DSR Income",
    posts: [
      "personalFinance/dsr-40-income-loan-limit-table",
      "personalFinance/salary-40m-mortgage-limit",
      "personalFinance/salary-50m-dsr-40-loan-limit",
    ],
    roles: {
      "personalFinance/dsr-40-income-loan-limit-table": "DSR 40% 연봉별 대출한도 parent table",
      "personalFinance/salary-40m-mortgage-limit": "연봉 4000만원 child scenario",
      "personalFinance/salary-50m-dsr-40-loan-limit": "연봉 5000만원 child scenario",
    },
  },
  {
    name: "Inflation",
    posts: ["economicInfo/inflation-basics", "economicInfo/inflation-rate-basics"],
    roles: {
      "economicInfo/inflation-basics": "인플레이션 개념, 원인, 금리 관계",
      "economicInfo/inflation-rate-basics": "물가상승률, CPI 측정과 해석",
    },
  },
  {
    name: "TNX / ETF",
    posts: [
      "investingInfo/tnx-basics",
      "investingInfo/us10y-impact-on-korea-and-stock-market",
      "investingInfo/etf-impact-of-tnx",
      "investingInfo/korea-etf-deep-dive-tnx",
      "investingInfo/bond-etf-duration-drives-returns",
    ],
    roles: {
      "investingInfo/tnx-basics": "미국 10년물 국채금리 definition owner",
      "investingInfo/us10y-impact-on-korea-and-stock-market": "미국 10년물의 한국 증시 영향",
      "investingInfo/etf-impact-of-tnx": "미국 10년물의 ETF 영향",
      "investingInfo/korea-etf-deep-dive-tnx": "미국 10년물의 국내 ETF 영향",
      "investingInfo/bond-etf-duration-drives-returns": "채권 ETF duration과 수익률",
    },
  },
  {
    name: "Personal Finance Beginner",
    posts: ["personalFinance/personal-finance-3pillars", "personalFinance/personal-start-5steps"],
    roles: {
      "personalFinance/personal-finance-3pillars": "개인 재무관리 framework",
      "personalFinance/personal-start-5steps": "재테크 시작 sequence",
    },
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function normalize(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMarkdown(value) {
  return normalize(
    String(value || "")
      .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, " $1 ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#>*_`~|:-]/g, " ")
      .replace(/\s+/g, " ")
  );
}

function readMarkdownContent(post) {
  try {
    const raw = fs.readFileSync(path.join(ROOT, post.filePath), "utf8");
    return raw.replace(/^---[\s\S]*?---/, "");
  } catch {
    return "";
  }
}

function faqText(rawContent) {
  const questions = Array.from(rawContent.matchAll(/"name"\s*:\s*"([^"]+\?)"/g), (hit) => hit[1]);
  const faqBlock = rawContent
    .split(/\r?\n/)
    .filter((line) => /FAQ|Q&A|자주|묻는|질문|\?/.test(line))
    .join(" ");
  return stripMarkdown([...questions, faqBlock].join(" "));
}

function tokens(value) {
  return Array.from(
    new Set(
      normalize(value)
        .toLowerCase()
        .split(/[^\p{L}\p{N}%+]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2 && !STOPWORDS.has(token))
    )
  );
}

function tokenCoverage(query, text) {
  const q = tokens(query);
  if (!q.length) return 0;
  const haystack = normalize(text).toLowerCase();
  const hits = q.filter((token) => haystack.includes(token)).length;
  return hits / q.length;
}

function jaccard(a, b) {
  const aa = new Set(a);
  const bb = new Set(b);
  if (!aa.size && !bb.size) return 0;
  let hits = 0;
  for (const item of aa) if (bb.has(item)) hits += 1;
  return hits / (aa.size + bb.size - hits);
}

function similarity(a, b) {
  return jaccard(tokens(a), tokens(b));
}

function gradeBoundary(ownA, crossA, ownB, crossB) {
  const ownStrong = ownA >= 0.5 && ownB >= 0.5;
  const crossLow = crossA < 0.34 && crossB < 0.34;
  const anyOwn = ownA >= 0.34 || ownB >= 0.34;
  const crossHigh = crossA >= 0.5 || crossB >= 0.5;
  if (ownStrong && crossLow) return "CLEAR";
  if (crossHigh && !ownStrong) return "WEAK";
  if (anyOwn || crossA >= 0.25 || crossB >= 0.25) return "PARTIAL";
  return "WEAK";
}

function leakageGrade(sourceSecondaryQueries, targetPrimary) {
  let maxScore = 0;
  let strongestQuery = "";
  for (const query of sourceSecondaryQueries || []) {
    const direct = normalize(query).includes(normalize(targetPrimary)) || normalize(targetPrimary).includes(normalize(query));
    const score = direct ? 1 : similarity(query, targetPrimary);
    if (score > maxScore) {
      maxScore = score;
      strongestQuery = query;
    }
  }
  let level = "NONE";
  if (maxScore >= 0.75) level = "HIGH";
  else if (maxScore >= 0.45) level = "MEDIUM";
  else if (maxScore >= 0.25) level = "LOW";
  return { level, score: Number(maxScore.toFixed(2)), strongestQuery };
}

function signalText(post, rawContent, field) {
  if (field === "title") return post.title;
  if (field === "description") return post.description;
  if (field === "intro") return post.structure?.introPreview || "";
  if (field === "h2") return (post.structure?.h2s || []).join(" ");
  if (field === "faq") return faqText(rawContent);
  return "";
}

function buildAnchors(step1Posts) {
  const postByUrl = new Map(step1Posts.map((post) => [post.url, post]));
  const byTarget = new Map();
  const anchorTargets = new Map();
  const addAnchor = (targetId, anchor, type, sourceId) => {
    const text = normalize(anchor);
    if (!targetId || !text) return;
    if (!byTarget.has(targetId)) byTarget.set(targetId, []);
    byTarget.get(targetId).push({ anchor: text, type, sourceId });
    const key = text.toLowerCase();
    if (!anchorTargets.has(key)) anchorTargets.set(key, new Set());
    anchorTargets.get(key).add(targetId);
  };

  for (const post of step1Posts) {
    for (const link of post.links?.explicitInternalLinks || []) {
      if (link.kind !== "post") continue;
      const target = postByUrl.get(link.normalized);
      if (target && target.id !== post.id) addAnchor(target.id, link.anchor, "inbound_contextual_anchor", post.id);
    }
    for (const targetUrl of post.links?.templateOutboundPostUrls || []) {
      const target = postByUrl.get(targetUrl);
      if (target && target.id !== post.id) addAnchor(target.id, target.title, "related_post_title_anchor", post.id);
    }
  }
  for (const post of step1Posts) {
    addAnchor(post.id, post.title, "hub_category_title_anchor", "category_or_sitemap_template");
  }

  const collisions = [];
  for (const [anchor, targets] of anchorTargets.entries()) {
    if (targets.size > 1) collisions.push({ anchor, targetIds: Array.from(targets).sort() });
  }
  return { byTarget, collisions };
}

function boundarySignals(a, b, postA, postB, rawA, rawB, anchorsByTarget) {
  const fields = {
    TITLE_BOUNDARY: "title",
    DESCRIPTION_BOUNDARY: "description",
    INTRO_BOUNDARY: "intro",
    H2_BOUNDARY: "h2",
    FAQ_BOUNDARY: "faq",
  };
  const out = {};
  for (const [name, field] of Object.entries(fields)) {
    const textA = signalText(postA, rawA, field);
    const textB = signalText(postB, rawB, field);
    out[name] = gradeBoundary(
      tokenCoverage(a.primaryQuery, textA),
      tokenCoverage(b.primaryQuery, textA),
      tokenCoverage(b.primaryQuery, textB),
      tokenCoverage(a.primaryQuery, textB)
    );
  }
  const anchorsA = (anchorsByTarget.get(a.id) || []).map((item) => item.anchor).join(" ");
  const anchorsB = (anchorsByTarget.get(b.id) || []).map((item) => item.anchor).join(" ");
  out.ANCHOR_BOUNDARY = gradeBoundary(
    tokenCoverage(a.primaryQuery, anchorsA),
    tokenCoverage(b.primaryQuery, anchorsA),
    tokenCoverage(b.primaryQuery, anchorsB),
    tokenCoverage(a.primaryQuery, anchorsB)
  );
  return out;
}

function sameSpecificNumber(a, b) {
  const numsA = tokens(a).filter((token) => /\d/.test(token));
  const numsB = tokens(b).filter((token) => /\d/.test(token));
  return numsA.length && numsB.length && numsA.some((num) => numsB.includes(num));
}

function hasDifferentNumbers(a, b) {
  const numsA = tokens(a).filter((token) => /\d/.test(token));
  const numsB = tokens(b).filter((token) => /\d/.test(token));
  return numsA.length && numsB.length && !numsA.some((num) => numsB.includes(num));
}

function autoClassify(conflict, a, b, leak, signals) {
  const primarySim = similarity(a.primaryQuery, b.primaryQuery);
  const sameIntent = a.primaryIntent === b.primaryIntent || a.secondaryIntent === b.primaryIntent || b.secondaryIntent === a.primaryIntent;
  const oneDefinition = a.primaryIntent === "DEFINITION" || b.primaryIntent === "DEFINITION";
  const oneImpact = IMPACT_INTENTS.has(a.primaryIntent) || IMPACT_INTENTS.has(b.primaryIntent);
  const oneCalculator = a.queryType === "CALCULATOR_SUPPORT" || b.queryType === "CALCULATOR_SUPPORT";
  const oneData = a.queryType === "DATA_QUERY" || b.queryType === "DATA_QUERY";
  const bothScenario = SCENARIO_INTENTS.has(a.primaryIntent) && SCENARIO_INTENTS.has(b.primaryIntent);
  const boundaryWeakSignals = Object.values(signals).filter((value) => value === "WEAK").length;
  const highLeak = leak.aToB.level === "HIGH" || leak.bToA.level === "HIGH";
  const mediumLeak = leak.aToB.level === "MEDIUM" || leak.bToA.level === "MEDIUM";

  if (primarySim >= 0.72 && sameIntent && highLeak) {
    return {
      classification: "TRUE_CANNIBALIZATION",
      evidenceLevel: "LIKELY_STRUCTURAL",
      recommendation: "MERGE_REVIEW_REQUIRED",
      reason: "Primary query, intent, and secondary query leakage are all close.",
    };
  }
  if (oneDefinition && oneImpact) {
    return {
      classification: "DEFINITION_VS_IMPACT",
      evidenceLevel: mediumLeak ? "POSSIBLE" : "NOT_SUPPORTED",
      recommendation: mediumLeak ? "DEEMPHASIZE_SECONDARY_QUERY" : "KEEP_AS_IS",
      reason: "Definition/core document and impact/application document can normally coexist.",
    };
  }
  if (oneCalculator && (CORE_INTENTS.has(a.primaryIntent) || CORE_INTENTS.has(b.primaryIntent) || oneData)) {
    return {
      classification: "CALCULATOR_GUIDE_VS_INFORMATIONAL",
      evidenceLevel: highLeak ? "POSSIBLE" : "NOT_SUPPORTED",
      recommendation: highLeak ? "CLARIFY_QUERY_BOUNDARY" : "KEEP_AS_IS",
      reason: "Calculator guide and informational/table document have different usage intent.",
    };
  }
  if (hasDifferentNumbers(a.primaryQuery, b.primaryQuery)) {
    return {
      classification: "SCENARIO_VARIANTS",
      evidenceLevel: "NOT_SUPPORTED",
      recommendation: "KEEP_AS_IS",
      reason: "The pair is separated by numeric condition or scenario.",
    };
  }
  if (oneData && bothScenario) {
    return {
      classification: "PARENT_CHILD_RELATION",
      evidenceLevel: mediumLeak ? "POSSIBLE" : "NOT_SUPPORTED",
      recommendation: mediumLeak ? "PARENT_CHILD_RESTRUCTURE" : "KEEP_AS_IS",
      reason: "Data/table style document can act as parent to a narrower scenario.",
    };
  }
  if (sameSpecificNumber(a.primaryQuery, b.primaryQuery) && bothScenario && primarySim >= 0.45) {
    return {
      classification: "QUERY_BOUNDARY_WEAK",
      evidenceLevel: "LIKELY_STRUCTURAL",
      recommendation: "CLARIFY_QUERY_BOUNDARY",
      reason: "The same numeric target appears in both calculation/scenario documents.",
    };
  }
  if (primarySim >= 0.45 && sameIntent && (boundaryWeakSignals >= 3 || mediumLeak)) {
    return {
      classification: "QUERY_BOUNDARY_WEAK",
      evidenceLevel: "POSSIBLE",
      recommendation: "CLARIFY_QUERY_BOUNDARY",
      reason: "Primary query and intent are close enough that on-page ownership signals should be separated.",
    };
  }
  if (a.topicFamily === b.topicFamily && bothScenario) {
    return {
      classification: "SCENARIO_VARIANTS",
      evidenceLevel: mediumLeak ? "POSSIBLE" : "NOT_SUPPORTED",
      recommendation: mediumLeak ? "DEEMPHASIZE_SECONDARY_QUERY" : "KEEP_AS_IS",
      reason: "Same topic family but distinct scenario, condition, or decision frame.",
    };
  }
  if (a.topicFamily === b.topicFamily && (a.coreDocumentCandidate || b.coreDocumentCandidate)) {
    return {
      classification: "HUB_SPOKE_RELATION",
      evidenceLevel: mediumLeak ? "POSSIBLE" : "NOT_SUPPORTED",
      recommendation: mediumLeak ? "HUB_SPOKE_RESTRUCTURE" : "KEEP_AS_IS",
      reason: "A core/overview candidate and a narrower spoke can form a normal topic cluster.",
    };
  }
  if (a.topicFamily === b.topicFamily) {
    return {
      classification: "COMPLEMENTARY_DOCUMENTS",
      evidenceLevel: mediumLeak ? "POSSIBLE" : "NOT_SUPPORTED",
      recommendation: mediumLeak ? "DEEMPHASIZE_SECONDARY_QUERY" : "KEEP_AS_IS",
      reason: "The pair shares a topic family but answers different user questions.",
    };
  }
  return {
    classification: "NO_MEANINGFUL_CONFLICT",
    evidenceLevel: "NOT_SUPPORTED",
    recommendation: "KEEP_AS_IS",
    reason: "The Step 2 overlap appears lexical or contextual rather than structural.",
  };
}

function ownershipBoundaries(a, b, classification, ownerPost) {
  const ownA = [a.primaryQuery, ...a.secondaryQueries.slice(0, 4)];
  const ownB = [b.primaryQuery, ...b.secondaryQueries.slice(0, 4)];
  let avoidA = [b.primaryQuery];
  let avoidB = [a.primaryQuery];
  if (classification === "PARENT_CHILD_RELATION" || classification === "HUB_SPOKE_RELATION") {
    avoidA = ownerPost === a.id ? [`Do not over-own narrow query: ${b.primaryQuery}`] : [`Do not over-own broad query: ${b.primaryQuery}`];
    avoidB = ownerPost === b.id ? [`Do not over-own narrow query: ${a.primaryQuery}`] : [`Do not over-own broad query: ${a.primaryQuery}`];
  }
  return {
    [a.id]: {
      own: ownA,
      avoidOrDeemphasize: avoidA,
    },
    [b.id]: {
      own: ownB,
      avoidOrDeemphasize: avoidB,
    },
  };
}

function classifyConflict(conflict, queryById, postById, rawById, anchorsByTarget) {
  const a = queryById.get(conflict.postA);
  const b = queryById.get(conflict.postB);
  const postA = postById.get(conflict.postA);
  const postB = postById.get(conflict.postB);
  if (!a || !b || !postA || !postB) {
    throw new Error(`Missing post/query data for conflict ${conflict.postA} vs ${conflict.postB}`);
  }
  const leak = {
    aToB: leakageGrade(a.secondaryQueries, b.primaryQuery),
    bToA: leakageGrade(b.secondaryQueries, a.primaryQuery),
  };
  const signals = boundarySignals(a, b, postA, postB, rawById.get(a.id) || "", rawById.get(b.id) || "", anchorsByTarget);
  const manual = MANUAL_PAIR_RULES.get(pairKey(a.id, b.id));
  const base = manual || autoClassify(conflict, a, b, leak, signals);
  const ownerPost =
    base.ownerPost ||
    (["TRUE_CANNIBALIZATION", "QUERY_BOUNDARY_WEAK"].includes(base.classification)
      ? (a.primaryQueryConfidence === "HIGH" && b.primaryQueryConfidence !== "HIGH" ? a.id : b.primaryQueryConfidence === "HIGH" && a.primaryQueryConfidence !== "HIGH" ? b.id : "OWNER_UNRESOLVED")
      : "OWNER_SEPARATE");
  const supportingPost = base.supportingPost || (ownerPost === a.id ? b.id : ownerPost === b.id ? a.id : "");
  return {
    postA: a.id,
    postB: b.id,
    queryA: a.primaryQuery,
    queryB: b.primaryQuery,
    classification: base.classification,
    evidenceLevel: base.evidenceLevel,
    sourceReviewSeverity: conflict.reviewSeverity,
    step2ConflictType: conflict.conflictType,
    ownerPost,
    ownerPrimaryQuery: ownerPost === a.id ? a.primaryQuery : ownerPost === b.id ? b.primaryQuery : "OWNER_UNRESOLVED",
    supportingPost,
    supportingRole: base.supportingRole || "",
    secondaryQueryLeakage: leak,
    onPageBoundarySignals: signals,
    boundaryDefinition: ownershipBoundaries(a, b, base.classification, ownerPost),
    recommendation: base.recommendation || "KEEP_AS_IS",
    rationale: base.reason,
  };
}

function buildAnchorCollisionReport(conflictAudits, anchorCollisions) {
  const conflictPairs = new Set(conflictAudits.map((item) => pairKey(item.postA, item.postB)));
  const exactCollisionItems = [];
  for (const collision of anchorCollisions) {
    const targets = collision.targetIds;
    for (let i = 0; i < targets.length; i += 1) {
      for (let j = i + 1; j < targets.length; j += 1) {
        if (conflictPairs.has(pairKey(targets[i], targets[j]))) {
          exactCollisionItems.push({
            anchor: collision.anchor,
            postA: targets[i],
            postB: targets[j],
            collisionType: "ANCHOR_OWNERSHIP_COLLISION",
          });
        }
      }
    }
  }
  return {
    exactContextualAnchorCollisionCount: exactCollisionItems.length,
    items: exactCollisionItems,
    note: exactCollisionItems.length
      ? "Exact duplicate inbound anchors point to multiple conflict-candidate URLs."
      : "No exact inbound contextual anchor collision was detected among Step 2 conflict pairs. Related-post title anchors remain URL-specific because they use target titles.",
  };
}

function buildOwnershipMatrix(queryMap, conflictAudits) {
  const supportByOwner = new Map();
  const reviewByPost = new Map();
  for (const item of conflictAudits) {
    if (item.ownerPost && !["OWNER_SEPARATE", "OWNER_SEPARATE_SCENARIOS", "OWNER_UNRESOLVED"].includes(item.ownerPost)) {
      if (!supportByOwner.has(item.ownerPost)) supportByOwner.set(item.ownerPost, []);
      if (item.supportingPost) supportByOwner.get(item.ownerPost).push(item.supportingPost);
    }
    if (["TRUE_CANNIBALIZATION", "QUERY_BOUNDARY_WEAK"].includes(item.classification)) {
      reviewByPost.set(item.postA, true);
      reviewByPost.set(item.postB, true);
    }
  }
  return queryMap.map((item) => ({
    query: item.primaryQuery,
    owner: item.id,
    ownerUrl: item.url,
    supportingUrls: Array.from(new Set(supportByOwner.get(item.id) || [])).sort(),
    confidence: item.primaryQueryConfidence,
    ownershipStatus: reviewByPost.has(item.id) ? "REVIEW_REQUIRED" : "OWNER_ASSIGNED",
    topicFamily: item.topicFamily,
    topicSubtopic: item.topicSubtopic,
  }));
}

function buildTopicArchitecture(queryMap) {
  const byFamily = new Map();
  for (const item of queryMap) {
    if (!byFamily.has(item.topicFamily)) byFamily.set(item.topicFamily, []);
    byFamily.get(item.topicFamily).push(item);
  }
  return Array.from(byFamily.entries())
    .map(([topicFamily, items]) => {
      const core = items.filter((item) => item.coreDocumentCandidate);
      const fallback = items
        .slice()
        .sort((a, b) => {
          const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return rank[b.primaryQueryConfidence] - rank[a.primaryQueryConfidence] || a.id.localeCompare(b.id);
        })
        .slice(0, 1);
      const coreItems = core.length ? core : fallback;
      const coreIds = new Set(coreItems.map((item) => item.id));
      return {
        topicFamily,
        core: coreItems.map((item) => ({ id: item.id, query: item.primaryQuery })),
        spokes: items
          .filter((item) => !coreIds.has(item.id))
          .map((item) => ({ id: item.id, query: item.primaryQuery, role: item.topicSubtopic })),
      };
    })
    .sort((a, b) => a.topicFamily.localeCompare(b.topicFamily));
}

function buildDeepDiveGroups(conflictAudits, queryById) {
  return DEEP_DIVE_GROUPS.map((group) => {
    const ids = new Set(group.posts);
    const pairAudits = conflictAudits.filter((item) => ids.has(item.postA) && ids.has(item.postB));
    const classificationCounts = countBy(pairAudits, (item) => item.classification);
    let conclusion = "분리 가능";
    if ((classificationCounts.TRUE_CANNIBALIZATION || 0) > 0) conclusion = "구조적 cannibalization review 필요";
    else if ((classificationCounts.QUERY_BOUNDARY_WEAK || 0) > 0) conclusion = "분리 가능하지만 query boundary 강화 필요";
    return {
      name: group.name,
      posts: group.posts.map((id) => ({
        id,
        primaryQuery: queryById.get(id)?.primaryQuery || "",
        role: group.roles[id] || "",
      })),
      pairCount: pairAudits.length,
      classificationCounts,
      conclusion,
    };
  });
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
  const s = Array.isArray(value) ? value.join("; ") : String(value == null ? "" : value);
  return `"${s.replace(/"/g, '""')}"`;
}

function mdEscape(value) {
  return String(value == null ? "" : value)
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>")
    .trim();
}

function maxLeakageLevel(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };
  return (rank[a] || 0) >= (rank[b] || 0) ? a : b;
}

function writeMatrixCsv(matrix) {
  const headers = ["query", "owner", "ownerUrl", "supportingUrls", "confidence", "ownershipStatus", "topicFamily", "topicSubtopic"];
  const lines = [headers.join(",")];
  for (const row of matrix) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  fs.writeFileSync(MATRIX_CSV, `${lines.join("\n")}\n`, "utf8");
}

function buildSummary(conflictAudits, matrix, deepDiveGroups, anchorReport) {
  const classificationCounts = countBy(conflictAudits, (item) => item.classification);
  const evidenceCounts = countBy(conflictAudits, (item) => item.evidenceLevel);
  const leakageCounts = countBy(conflictAudits.flatMap((item) => [item.secondaryQueryLeakage.aToB, item.secondaryQueryLeakage.bToA]), (item) => item.level);
  const resolutionCounts = countBy(conflictAudits, (item) => item.recommendation);
  const structuralRiskCount = (classificationCounts.TRUE_CANNIBALIZATION || 0) + (classificationCounts.QUERY_BOUNDARY_WEAK || 0);
  return {
    finalVerdict: structuralRiskCount ? "CANNIBALIZATION_AUDIT_COMPLETE_WITH_REVIEW_ITEMS" : "CANNIBALIZATION_AUDIT_COMPLETE",
    step2Candidates: conflictAudits.length,
    classificationCounts: Object.fromEntries(CLASSIFICATIONS.map((key) => [key, classificationCounts[key] || 0])),
    evidenceCounts,
    secondaryQueryLeakageCounts: leakageCounts,
    resolutionCounts,
    structuralRiskCount,
    normalRelationshipCount: conflictAudits.length - structuralRiskCount,
    ownershipMatrixRows: matrix.length,
    deepDiveGroups: deepDiveGroups.length,
    anchorCollisionCount: anchorReport.exactContextualAnchorCollisionCount,
  };
}

function buildReport(output) {
  const { summary, conflictAudits, ownershipMatrix, secondaryQueryLeakage, anchorCollisionReport, topicFamilyArchitecture, deepDiveGroups } = output;
  const lines = [];
  lines.push("# FinMap KO Post Cannibalization / Query Ownership Boundary Audit");
  lines.push("");
  lines.push(`Generated: ${output.generatedAt}`);
  lines.push("");
  lines.push("## Final Verdict");
  lines.push("");
  lines.push(`Final Verdict: ${summary.finalVerdict}`);
  lines.push("");
  lines.push("This is an audit/design-only Step 3 output. No post content, frontmatter, title, description, tags, headings, internal links, schema, sitemap, canonical, hreflang, page component, or runtime code was changed.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Step 2 conflict candidates reviewed: ${summary.step2Candidates}`);
  lines.push(`- structural query ownership risk candidates: ${summary.structuralRiskCount}`);
  lines.push(`- normal relationship / false-positive candidates: ${summary.normalRelationshipCount}`);
  lines.push(`- ownership matrix rows: ${summary.ownershipMatrixRows}`);
  lines.push(`- exact internal anchor collisions: ${summary.anchorCollisionCount}`);
  lines.push("");
  lines.push("## Step 2 Conflict Reduction");
  lines.push("");
  lines.push(`- Step 2 candidates: ${summary.step2Candidates}`);
  for (const key of CLASSIFICATIONS) {
    lines.push(`- ${key}: ${summary.classificationCounts[key] || 0}`);
  }
  lines.push("");
  lines.push("## A. TRUE CANNIBALIZATION CANDIDATES");
  lines.push("");
  writeConflictTable(lines, conflictAudits.filter((item) => item.classification === "TRUE_CANNIBALIZATION"));
  lines.push("");
  lines.push("## B. QUERY BOUNDARY WEAK CANDIDATES");
  lines.push("");
  writeConflictTable(lines, conflictAudits.filter((item) => item.classification === "QUERY_BOUNDARY_WEAK"));
  lines.push("");
  lines.push("## C. NORMAL CONTENT RELATIONSHIPS");
  lines.push("");
  lines.push("| Classification | Count | Meaning |");
  lines.push("|---|---:|---|");
  for (const key of CLASSIFICATIONS.filter((item) => !["TRUE_CANNIBALIZATION", "QUERY_BOUNDARY_WEAK"].includes(item))) {
    lines.push(`| ${key} | ${summary.classificationCounts[key] || 0} | ${normalRelationshipMeaning(key)} |`);
  }
  lines.push("");
  lines.push("## D. QUERY OWNERSHIP MATRIX");
  lines.push("");
  lines.push("| Query | Owner | Confidence | Status | Supporting URLs | Topic |");
  lines.push("|---|---|---|---|---|---|");
  for (const row of ownershipMatrix) {
    lines.push(
      [
        row.query,
        row.owner,
        row.confidence,
        row.ownershipStatus,
        row.supportingUrls.join("; ") || "-",
        `${row.topicFamily} / ${row.topicSubtopic}`,
      ]
        .map(mdEscape)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }
  lines.push("");
  lines.push("## E. SECONDARY QUERY LEAKAGE");
  lines.push("");
  lines.push(`- Directional leakage counts: ${Object.entries(summary.secondaryQueryLeakageCounts).map(([key, value]) => `${key}:${value}`).join(", ")}`);
  lines.push("");
  lines.push("| Level | A -> B | B -> A | Post A | Post B |");
  lines.push("|---|---|---|---|---|");
  for (const item of secondaryQueryLeakage.filter((row) => row.aToB.level !== "NONE" || row.bToA.level !== "NONE").slice(0, 80)) {
    lines.push(
      [
        maxLeakageLevel(item.aToB.level, item.bToA.level),
        `${item.aToB.level}: ${item.aToB.strongestQuery || "-"}`,
        `${item.bToA.level}: ${item.bToA.strongestQuery || "-"}`,
        item.postA,
        item.postB,
      ]
        .map(mdEscape)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }
  lines.push("");
  lines.push("## F. INTERNAL ANCHOR COLLISION");
  lines.push("");
  lines.push(`- Exact contextual anchor collisions among conflict pairs: ${anchorCollisionReport.exactContextualAnchorCollisionCount}`);
  lines.push(`- ${anchorCollisionReport.note}`);
  if (anchorCollisionReport.items.length) {
    lines.push("");
    for (const item of anchorCollisionReport.items) {
      lines.push(`- ${item.anchor}: ${item.postA} / ${item.postB}`);
    }
  }
  lines.push("");
  lines.push("## G. TOPIC FAMILY QUERY ARCHITECTURE");
  lines.push("");
  lines.push("| Topic Family | Core | Spokes |");
  lines.push("|---|---|---|");
  for (const family of topicFamilyArchitecture) {
    lines.push(
      [
        family.topicFamily,
        family.core.map((item) => `${item.id} (${item.query})`).join("; "),
        family.spokes.map((item) => `${item.id} (${item.query})`).join("; ") || "-",
      ]
        .map(mdEscape)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }
  lines.push("");
  lines.push("## H. DEEP-DIVE GROUPS");
  lines.push("");
  for (const group of deepDiveGroups) {
    lines.push(`### ${group.name}`);
    lines.push("");
    lines.push(`- Pair count reviewed: ${group.pairCount}`);
    lines.push(`- Classification counts: ${Object.entries(group.classificationCounts).map(([key, value]) => `${key}:${value}`).join(", ") || "-"}`);
    lines.push(`- Result: ${group.conclusion}`);
    for (const post of group.posts) {
      lines.push(`- ${post.id}: ${post.primaryQuery} / ${post.role}`);
    }
    lines.push("");
  }
  lines.push("## I. RESOLUTION RECOMMENDATIONS");
  lines.push("");
  lines.push("| Action | Pair | Classification | Owner | Supporting | Reason |");
  lines.push("|---|---|---|---|---|---|");
  for (const item of conflictAudits.filter((row) => ["TRUE_CANNIBALIZATION", "QUERY_BOUNDARY_WEAK"].includes(row.classification))) {
    lines.push(
      [
        item.recommendation,
        `${item.postA} <-> ${item.postB}`,
        item.classification,
        item.ownerPost,
        item.supportingPost || "-",
        item.rationale,
      ]
        .map(mdEscape)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }
  lines.push("");
  lines.push("## J. DATA QUALITY / LIMITATIONS");
  lines.push("");
  lines.push("- This audit used Step 1 and Step 2 repository-derived outputs plus local markdown only.");
  lines.push("- No Naver ranking, impression, click, Search Advisor, GSC, or external keyword-volume data was used.");
  lines.push("- `TRUE_CANNIBALIZATION` here means confirmed structural query ownership collision in repo/content design, not confirmed live Naver cannibalization.");
  lines.push("- `MERGE_REVIEW_REQUIRED` is a future review direction only. No merge, redirect, delete, rewrite, or title/internal-link change was performed.");
  lines.push("- Token overlap alone was not used to call true cannibalization; definition/impact, parent/child, scenario, and hub/spoke relationships were treated as normal first where appropriate.");
  lines.push("");
  lines.push("## Generated Files");
  lines.push("");
  lines.push(`- \`${rel(REPORT_MD)}\``);
  lines.push(`- \`${rel(REPORT_JSON)}\``);
  lines.push(`- \`${rel(MATRIX_CSV)}\``);
  lines.push("");
  lines.push("## Step 4 Readiness");
  lines.push("");
  lines.push("Step 4 Internal Link / Topic Cluster Architecture readiness: YES");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function normalRelationshipMeaning(key) {
  return {
    PARENT_CHILD_RELATION: "Broader owner and narrower scenario/data child.",
    COMPLEMENTARY_DOCUMENTS: "Same broad topic, different user question.",
    SCENARIO_VARIANTS: "Different numeric condition, period, market state, or scenario.",
    DEFINITION_VS_IMPACT: "Definition/basic concept versus impact/application.",
    HUB_SPOKE_RELATION: "Core/overview and spoke relationship.",
    CALCULATOR_GUIDE_VS_INFORMATIONAL: "Tool guide versus informational or table document.",
    NO_MEANINGFUL_CONFLICT: "Lexical overlap only; structural risk not supported.",
  }[key] || "";
}

function writeConflictTable(lines, rows) {
  if (!rows.length) {
    lines.push("- None.");
    return;
  }
  lines.push("| Evidence | Pair | Owner | Supporting Role | Leakage | Boundary Signals | Recommendation |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const item of rows) {
    const weakSignals = Object.entries(item.onPageBoundarySignals)
      .filter(([, value]) => value !== "CLEAR")
      .map(([key, value]) => `${key}:${value}`)
      .join(", ");
    lines.push(
      [
        item.evidenceLevel,
        `${item.postA} <-> ${item.postB}`,
        item.ownerPost,
        item.supportingRole || "-",
        `A->B ${item.secondaryQueryLeakage.aToB.level}, B->A ${item.secondaryQueryLeakage.bToA.level}`,
        weakSignals || "all clear",
        item.recommendation,
      ]
        .map(mdEscape)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }
}

function main() {
  if (!fs.existsSync(STEP1_JSON)) throw new Error(`Missing Step 1 JSON: ${rel(STEP1_JSON)}`);
  if (!fs.existsSync(STEP2_JSON)) throw new Error(`Missing Step 2 JSON: ${rel(STEP2_JSON)}`);
  const step1 = readJson(STEP1_JSON);
  const step2 = readJson(STEP2_JSON);
  const step1Posts = step1.posts || [];
  const queryMap = step2.queryMap || [];
  const conflicts = step2.ownershipConflictCandidates || [];
  const postById = new Map(step1Posts.map((post) => [post.id, post]));
  const queryById = new Map(queryMap.map((post) => [post.id, post]));
  const rawById = new Map(step1Posts.map((post) => [post.id, readMarkdownContent(post)]));
  const anchors = buildAnchors(step1Posts);
  const conflictAudits = conflicts.map((conflict) => classifyConflict(conflict, queryById, postById, rawById, anchors.byTarget));
  const anchorCollisionReport = buildAnchorCollisionReport(conflictAudits, anchors.collisions);
  const ownershipMatrix = buildOwnershipMatrix(queryMap, conflictAudits);
  const topicFamilyArchitecture = buildTopicArchitecture(queryMap);
  const deepDiveGroups = buildDeepDiveGroups(conflictAudits, queryById);
  const secondaryQueryLeakage = conflictAudits.map((item) => ({
    postA: item.postA,
    postB: item.postB,
    aToB: item.secondaryQueryLeakage.aToB,
    bToA: item.secondaryQueryLeakage.bToA,
    classification: item.classification,
  }));
  const summary = buildSummary(conflictAudits, ownershipMatrix, deepDiveGroups, anchorCollisionReport);
  const output = {
    generatedAt: new Date().toISOString(),
    scope: {
      language: "ko",
      auditOnly: true,
      source: "step1_inventory_plus_step2_query_intent_outputs",
      networkUsed: false,
      noContentChanges: true,
    },
    summary,
    conflictAudits,
    ownershipMatrix,
    secondaryQueryLeakage,
    anchorCollisionReport,
    topicFamilyArchitecture,
    deepDiveGroups,
    limitations: [
      "No live Naver ranking/search data was used.",
      "Cannibalization labels are structural risk classifications only.",
      "No content, metadata, component, sitemap, canonical, hreflang, redirect, merge, or delete action was performed.",
    ],
  };

  ensureDir(REPORT_JSON);
  fs.writeFileSync(REPORT_JSON, JSON.stringify(output, null, 2), "utf8");
  writeMatrixCsv(ownershipMatrix);
  fs.writeFileSync(REPORT_MD, buildReport(output), "utf8");

  console.log("PASS audit_naver_ko_post_cannibalization");
  console.log(`- Step 2 candidates reviewed: ${summary.step2Candidates}`);
  console.log(`- Structural risk candidates: ${summary.structuralRiskCount}`);
  console.log(`- True structural cannibalization candidates: ${summary.classificationCounts.TRUE_CANNIBALIZATION}`);
  console.log(`- Report: ${rel(REPORT_MD)}`);
  console.log(`- JSON: ${rel(REPORT_JSON)}`);
  console.log(`- Matrix CSV: ${rel(MATRIX_CSV)}`);
  console.log(`- Final Verdict: ${summary.finalVerdict}`);
}

main();
