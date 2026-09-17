const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DATE_STAMP = "2026-09-16";
const STEP1_JSON = path.join(ROOT, "reports", `naver-ko-post-search-inventory-${DATE_STAMP}.json`);
const STEP2_JSON = path.join(ROOT, "reports", `naver-ko-post-query-intent-${DATE_STAMP}.json`);
const STEP3_JSON = path.join(ROOT, "reports", `naver-ko-post-cannibalization-${DATE_STAMP}.json`);
const REPORT_MD = path.join(ROOT, "reports", `naver-ko-post-topic-links-${DATE_STAMP}.md`);
const REPORT_JSON = path.join(ROOT, "reports", `naver-ko-post-topic-links-${DATE_STAMP}.json`);
const OPPORTUNITIES_CSV = path.join(ROOT, "reports", `naver-ko-topic-link-opportunities-${DATE_STAMP}.csv`);
const CLUSTER_CSV = path.join(ROOT, "reports", `naver-ko-topic-cluster-map-${DATE_STAMP}.csv`);

const HUB_CANDIDATE_FAMILIES = new Set(["DCA", "DSR_LTV", "HOUSEHOLD_FINANCE", "REAL_ESTATE_BUDGET", "REAL_ESTATE_DATA"]);
const CROSS_CATEGORY_RELEVANT_FAMILIES = new Set([
  "OIL_ENERGY",
  "INTEREST_RATES",
  "FX",
  "DCA",
  "CAGR",
  "DSR_LTV",
  "REAL_ESTATE_DATA",
  "KOSPI_GLOBAL_LINK",
  "TNX",
  "ETF",
]);

const GENERIC_ANCHORS = [
  "자세히 보기",
  "관련 글",
  "여기",
  "확인하기",
  "더 알아보기",
  "이전 글",
  "참고",
  "이 글",
  "다음 글",
  "바로가기",
  "글 보기",
  "관련 글 보기",
  "읽어보기",
  "more",
  "read more",
  "learn more",
];

const FAMILY_TO_TOOLS = {
  COMPOUND_INTEREST: ["/tools/compound-interest"],
  CAGR: ["/tools/cagr-calculator"],
  DCA: ["/tools/dca-calculator"],
  FIRE: ["/tools/fire-calculator"],
  DSR_LTV: ["/tools/dsr-ltv-calculator", "/tools/mortgage-loan-calculator"],
  REAL_ESTATE_BUDGET: ["/tools/home-buying-budget-calculator", "/tools/dsr-ltv-calculator", "/tools/mortgage-loan-calculator"],
  HOUSEHOLD_FINANCE: ["/tools/goal-simulator"],
};

const MARKET_RELEVANT_FAMILIES = new Set([
  "TNX",
  "DXY",
  "OIL_ENERGY",
  "KOSPI_GLOBAL_LINK",
  "FX",
  "ETF",
  "INTEREST_RATES",
  "REAL_ESTATE_DATA",
]);

const STOPWORDS = new Set(["사용법", "가이드", "방법", "영향", "의미", "기준", "전략", "비교", "계산기", "투자", "시장", "보고", "하는"]);

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

function isGenericAnchor(anchor) {
  const text = normalize(anchor).toLowerCase();
  if (!text) return true;
  if (text.length <= 2) return true;
  return GENERIC_ANCHORS.some((generic) => text === generic.toLowerCase() || text.includes(generic.toLowerCase()));
}

function urlToId(url) {
  const match = String(url || "").match(/^\/posts\/([^/]+)\/([^/?#]+)$/);
  return match ? `${match[1]}/${match[2]}` : "";
}

function edgeKey(sourceId, targetId) {
  return `${sourceId} -> ${targetId}`;
}

function countBy(items, keyFn) {
  const out = {};
  for (const item of items) {
    const key = keyFn(item);
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function statusRank(status) {
  return { STRONG: 4, PARTIAL: 3, WEAK: 2, MISSING: 1, NA: 0 }[status] || 0;
}

function worstStatus(statuses) {
  if (!statuses.length) return "NA";
  return statuses.slice().sort((a, b) => statusRank(a) - statusRank(b))[0];
}

function bestStatus(statuses) {
  if (!statuses.length) return "NA";
  return statuses.slice().sort((a, b) => statusRank(b) - statusRank(a))[0];
}

function linkStatus(sourceId, targetId, explicitEdgesByPair, relatedEdgesByPair, queryById) {
  const explicit = explicitEdgesByPair.get(edgeKey(sourceId, targetId)) || [];
  const related = relatedEdgesByPair.get(edgeKey(sourceId, targetId)) || [];
  if (explicit.length) {
    const targetQuery = queryById.get(targetId)?.primaryQuery || "";
    const hasStrongAnchor = explicit.some((edge) => !isGenericAnchor(edge.anchor) && tokenCoverage(targetQuery, edge.anchor) >= 0.34);
    const hasDescriptiveAnchor = explicit.some((edge) => !isGenericAnchor(edge.anchor) && tokens(edge.anchor).length >= 2);
    return {
      status: hasStrongAnchor ? "STRONG" : hasDescriptiveAnchor ? "PARTIAL" : "WEAK",
      linkType: "EXPLICIT_CONTEXTUAL",
      anchors: explicit.map((edge) => edge.anchor),
    };
  }
  if (related.length) {
    return {
      status: "WEAK",
      linkType: "RELATED_POST_TEMPLATE",
      anchors: related.map((edge) => edge.anchor),
    };
  }
  return { status: "MISSING", linkType: "NONE", anchors: [] };
}

function buildEdges(step1Posts) {
  const postByUrl = new Map(step1Posts.map((post) => [post.url, post]));
  const explicitEdges = [];
  const relatedEdges = [];
  const toolEdges = [];
  const marketEdges = [];
  const pageTemplateEdges = [];

  for (const post of step1Posts) {
    for (const link of post.links?.explicitInternalLinks || []) {
      if (link.kind === "post") {
        const target = postByUrl.get(link.normalized);
        if (target && target.id !== post.id) {
          explicitEdges.push({
            type: "EXPLICIT_CONTEXTUAL",
            sourceId: post.id,
            targetId: target.id,
            sourceCategory: post.categorySlug,
            targetCategory: target.categorySlug,
            anchor: normalize(link.anchor),
            href: link.normalized,
            source: link.source,
          });
        }
      } else if (link.kind === "tool") {
        toolEdges.push({ type: "TOOL_CTA", sourceId: post.id, targetPath: link.normalized, anchor: normalize(link.anchor), source: link.source });
      } else if (link.kind === "market") {
        marketEdges.push({ type: "MARKET_DASHBOARD_LINK", sourceId: post.id, targetPath: link.normalized, anchor: normalize(link.anchor), source: link.source });
      }
    }

    for (const targetUrl of post.links?.templateOutboundPostUrls || []) {
      const target = postByUrl.get(targetUrl);
      if (target && target.id !== post.id) {
        relatedEdges.push({
          type: "RELATED_POST_TEMPLATE",
          sourceId: post.id,
          targetId: target.id,
          sourceCategory: post.categorySlug,
          targetCategory: target.categorySlug,
          anchor: target.title,
          href: target.url,
          source: "template",
        });
      }
    }

    for (const toolUrl of post.links?.templateOutboundToolUrls || []) {
      toolEdges.push({ type: "TOOL_CTA", sourceId: post.id, targetPath: toolUrl, anchor: toolUrl, source: "template" });
    }

    for (const inbound of post.links?.templatePageInboundUrls || []) {
      pageTemplateEdges.push({
        type: inbound.startsWith("/category/") ? "CATEGORY_TEMPLATE" : "SITEMAP_OR_INDEX_PAGE",
        sourcePath: inbound,
        targetId: post.id,
        anchor: post.title,
      });
    }
  }

  const explicitEdgesByPair = new Map();
  const relatedEdgesByPair = new Map();
  const inboundExplicit = new Map();
  const outboundExplicit = new Map();
  for (const edge of explicitEdges) {
    const key = edgeKey(edge.sourceId, edge.targetId);
    if (!explicitEdgesByPair.has(key)) explicitEdgesByPair.set(key, []);
    explicitEdgesByPair.get(key).push(edge);
    if (!inboundExplicit.has(edge.targetId)) inboundExplicit.set(edge.targetId, []);
    inboundExplicit.get(edge.targetId).push(edge);
    if (!outboundExplicit.has(edge.sourceId)) outboundExplicit.set(edge.sourceId, []);
    outboundExplicit.get(edge.sourceId).push(edge);
  }
  for (const edge of relatedEdges) {
    const key = edgeKey(edge.sourceId, edge.targetId);
    if (!relatedEdgesByPair.has(key)) relatedEdgesByPair.set(key, []);
    relatedEdgesByPair.get(key).push(edge);
  }

  return {
    explicitEdges,
    relatedEdges,
    toolEdges,
    marketEdges,
    pageTemplateEdges,
    explicitEdgesByPair,
    relatedEdgesByPair,
    inboundExplicit,
    outboundExplicit,
  };
}

function deriveRole(item, topicArchitecture) {
  const family = topicArchitecture.find((familyItem) => familyItem.topicFamily === item.topicFamily);
  const coreIds = family?.core?.map((core) => core.id) || [];
  if (coreIds[0] === item.id) return "CORE_DOCUMENT";
  if (coreIds.includes(item.id)) return "SECONDARY_CORE_DOCUMENT";
  if (item.queryType === "CALCULATOR_SUPPORT") return "CALCULATOR_GUIDE";
  if (item.queryType === "DATA_QUERY") return "DATA_TABLE_PAGE";
  if (item.primaryIntent === "DEFINITION") return "DEFINITION_PAGE";
  if (["MARKET_IMPACT", "DATA_INTERPRETATION", "EXPLANATION"].includes(item.primaryIntent)) return "IMPACT_APPLICATION_PAGE";
  if (["SCENARIO_ANALYSIS", "CALCULATION", "COMPARISON", "DECISION_SUPPORT", "CHECKLIST"].includes(item.primaryIntent)) return "SCENARIO_PAGE";
  return "SPOKE";
}

function queryAnchorSupport(item, inboundEdges) {
  const inbound = inboundEdges.get(item.id) || [];
  if (!inbound.length) {
    return { status: "ANCHOR_SUPPORT_WEAK", contextualInbound: 0, strongestAnchor: "", genericAnchorCount: 0 };
  }
  let bestScore = 0;
  let strongestAnchor = "";
  let descriptiveCount = 0;
  let genericCount = 0;
  for (const edge of inbound) {
    if (isGenericAnchor(edge.anchor)) genericCount += 1;
    else descriptiveCount += 1;
    const score = tokenCoverage(item.primaryQuery, edge.anchor);
    if (score > bestScore) {
      bestScore = score;
      strongestAnchor = edge.anchor;
    }
  }
  let status = "ANCHOR_SUPPORT_WEAK";
  if (bestScore >= 0.5 || (bestScore >= 0.34 && descriptiveCount >= 2)) status = "ANCHOR_SUPPORT_STRONG";
  else if (bestScore >= 0.2 || descriptiveCount > 0) status = "ANCHOR_SUPPORT_PARTIAL";
  return { status, contextualInbound: inbound.length, strongestAnchor, genericAnchorCount: genericCount };
}

function buildCoreSpokeAudits(topicArchitecture, queryById, edges) {
  const audits = [];
  for (const family of topicArchitecture) {
    const coreIds = (family.core || []).map((item) => item.id);
    const spokeIds = (family.spokes || []).map((item) => item.id);
    for (const coreId of coreIds) {
      for (const spokeId of spokeIds) {
        audits.push({
          topicFamily: family.topicFamily,
          coreId,
          spokeId,
          coreQuery: queryById.get(coreId)?.primaryQuery || "",
          spokeQuery: queryById.get(spokeId)?.primaryQuery || "",
          coreToSpoke: linkStatus(coreId, spokeId, edges.explicitEdgesByPair, edges.relatedEdgesByPair, queryById),
          spokeToCore: linkStatus(spokeId, coreId, edges.explicitEdgesByPair, edges.relatedEdgesByPair, queryById),
        });
      }
    }
  }
  return audits.map((audit) => ({
    ...audit,
    coreToSpokeFlag: audit.coreToSpoke.status === "MISSING" ? "CORE_TO_SPOKE_MISSING" : "",
    spokeToCoreFlag: audit.spokeToCore.status === "MISSING" ? "SPOKE_TO_CORE_MISSING" : "",
  }));
}

function sameFamilyEdges(item, queryById, edges, direction) {
  const source = direction === "out" ? edges.outboundExplicit.get(item.id) || [] : edges.inboundExplicit.get(item.id) || [];
  return source.filter((edge) => {
    const otherId = direction === "out" ? edge.targetId : edge.sourceId;
    return queryById.get(otherId)?.topicFamily === item.topicFamily;
  });
}

function crossCategorySupport(item, queryById, edges) {
  if (!CROSS_CATEGORY_RELEVANT_FAMILIES.has(item.topicFamily)) return "NA";
  const inbound = (edges.inboundExplicit.get(item.id) || []).filter((edge) => edge.sourceCategory !== edge.targetCategory);
  const outbound = (edges.outboundExplicit.get(item.id) || []).filter((edge) => edge.sourceCategory !== edge.targetCategory);
  const sameTopicCross = [...inbound, ...outbound].filter((edge) => {
    const other = edge.sourceId === item.id ? edge.targetId : edge.sourceId;
    return queryById.get(other)?.topicFamily === item.topicFamily;
  });
  if (sameTopicCross.length >= 2) return "CROSS_CATEGORY_STRONG";
  if (sameTopicCross.length >= 1) return "CROSS_CATEGORY_PARTIAL";
  return "CROSS_CATEGORY_WEAK";
}

function buildPostRows(queryMap, step1ById, topicArchitecture, queryById, coreSpokeAudits, edges) {
  const coreByFamily = new Map(topicArchitecture.map((family) => [family.topicFamily, (family.core || []).map((item) => item.id)]));
  return queryMap.map((item) => {
    const post = step1ById.get(item.id);
    const role = deriveRole(item, topicArchitecture);
    const anchor = queryAnchorSupport(item, edges.inboundExplicit);
    const familyCoreIds = coreByFamily.get(item.topicFamily) || [];
    const relatedCoreAudits = coreSpokeAudits.filter((audit) => audit.coreId === item.id || audit.spokeId === item.id);
    const coreToSpokeStatus = role.includes("CORE")
      ? worstStatus(relatedCoreAudits.filter((audit) => audit.coreId === item.id).map((audit) => audit.coreToSpoke.status))
      : "NA";
    const spokeToCoreStatus = role.includes("CORE")
      ? "NA"
      : worstStatus(relatedCoreAudits.filter((audit) => audit.spokeId === item.id).map((audit) => audit.spokeToCore.status));
    const inboundSameFamily = sameFamilyEdges(item, queryById, edges, "in");
    const outboundSameFamily = sameFamilyEdges(item, queryById, edges, "out");
    const topicIsolation = (familyCoreIds.length || queryMap.filter((row) => row.topicFamily === item.topicFamily).length > 1) &&
      inboundSameFamily.length === 0 &&
      outboundSameFamily.length === 0;
    return {
      category: item.category,
      slug: item.slug,
      url: item.url,
      id: item.id,
      topicFamily: item.topicFamily,
      role,
      primaryQuery: item.primaryQuery,
      coreUrl: familyCoreIds.map((id) => queryById.get(id)?.url || "").filter(Boolean),
      coreToSpokeStatus,
      spokeToCoreStatus,
      contextualInbound: anchor.contextualInbound,
      templateInbound: post?.links?.inboundTemplatePostCount || 0,
      queryAnchorSupport: anchor.status,
      strongestInboundAnchor: anchor.strongestAnchor,
      genericInboundAnchorCount: anchor.genericAnchorCount,
      crossCategorySupport: crossCategorySupport(item, queryById, edges),
      topicIsolation,
      recommendedLinkSources: [],
      recommendedLinkTargets: [],
    };
  });
}

function buildBoundaryWeakPairAudit(step3, queryById, edges) {
  return (step3.conflictAudits || [])
    .filter((item) => item.classification === "QUERY_BOUNDARY_WEAK")
    .map((item) => {
      const aToB = linkStatus(item.postA, item.postB, edges.explicitEdgesByPair, edges.relatedEdgesByPair, queryById);
      const bToA = linkStatus(item.postB, item.postA, edges.explicitEdgesByPair, edges.relatedEdgesByPair, queryById);
      const qa = queryById.get(item.postA);
      const qb = queryById.get(item.postB);
      const aStealsB = aToB.anchors.some((anchor) => tokenCoverage(qa?.primaryQuery || "", anchor) >= 0.5);
      const bStealsA = bToA.anchors.some((anchor) => tokenCoverage(qb?.primaryQuery || "", anchor) >= 0.5);
      let boundaryStatus = "WEAK";
      if (aToB.status !== "MISSING" && bToA.status !== "MISSING" && !aStealsB && !bStealsA) boundaryStatus = "CLEAR";
      else if (aToB.status !== "MISSING" || bToA.status !== "MISSING") boundaryStatus = "PARTIAL";
      return {
        postA: item.postA,
        postB: item.postB,
        ownerPost: item.ownerPost,
        supportingPost: item.supportingPost,
        aToB,
        bToA,
        boundaryStatus,
        anchorRisk: aStealsB || bStealsA ? "QUERY_STEALING_ANCHOR_REVIEW" : "NO_QUERY_STEALING_ANCHOR_DETECTED",
        recommendedAnchorConceptAtoB: qb ? `${qb.primaryQuery} 맥락의 supporting concept` : "",
        recommendedAnchorConceptBtoA: qa ? `${qa.primaryQuery} 맥락의 owner concept` : "",
      };
    });
}

function buildTrueCannibalizationLinkAudit(step3, queryById, edges) {
  return (step3.conflictAudits || [])
    .filter((item) => item.classification === "TRUE_CANNIBALIZATION")
    .map((item) => {
      const aToB = linkStatus(item.postA, item.postB, edges.explicitEdgesByPair, edges.relatedEdgesByPair, queryById);
      const bToA = linkStatus(item.postB, item.postA, edges.explicitEdgesByPair, edges.relatedEdgesByPair, queryById);
      const inboundA = edges.inboundExplicit.get(item.postA) || [];
      const inboundB = edges.inboundExplicit.get(item.postB) || [];
      const owner = item.ownerPost;
      return {
        postA: item.postA,
        postB: item.postB,
        ownerPost: owner,
        futureMergeEquityReceiver: owner,
        aToB,
        bToA,
        inboundDistribution: {
          [item.postA]: inboundA.map((edge) => ({ sourceId: edge.sourceId, anchor: edge.anchor })),
          [item.postB]: inboundB.map((edge) => ({ sourceId: edge.sourceId, anchor: edge.anchor })),
        },
        monthlyInvestmentTableRelation: linkStatus("personalFinance/monthly-investment-for-100m-table", owner, edges.explicitEdgesByPair, edges.relatedEdgesByPair, queryById),
        calculatorCtaDirection: "DCA calculator should remain the tool endpoint; owner post should receive consolidation-oriented contextual links if future merge is chosen.",
      };
    });
}

function buildParentChildAudit(step3, queryById, edges) {
  return (step3.conflictAudits || [])
    .filter((item) => item.classification === "PARENT_CHILD_RELATION")
    .map((item) => {
      const parent = item.ownerPost && !item.ownerPost.startsWith("OWNER_") ? item.ownerPost : item.postA;
      const child = parent === item.postA ? item.postB : item.postA;
      const parentToChild = linkStatus(parent, child, edges.explicitEdgesByPair, edges.relatedEdgesByPair, queryById);
      const childToParent = linkStatus(child, parent, edges.explicitEdgesByPair, edges.relatedEdgesByPair, queryById);
      let strength = "PARENT_CHILD_WEAK";
      if (["STRONG", "PARTIAL"].includes(parentToChild.status) && ["STRONG", "PARTIAL"].includes(childToParent.status)) strength = "PARENT_CHILD_STRONG";
      else if (parentToChild.status !== "MISSING" || childToParent.status !== "MISSING") strength = "PARENT_CHILD_PARTIAL";
      return {
        parent,
        child,
        parentQuery: queryById.get(parent)?.primaryQuery || "",
        childQuery: queryById.get(child)?.primaryQuery || "",
        parentToChild,
        childToParent,
        strength,
      };
    });
}

function buildCalculatorFunnel(queryMap, edges) {
  return Object.entries(FAMILY_TO_TOOLS).map(([topicFamily, toolPaths]) => {
    const posts = queryMap.filter((item) => item.topicFamily === topicFamily);
    const toolLinkedPostIds = new Set(
      edges.toolEdges
        .filter((edge) => posts.some((post) => post.id === edge.sourceId) && toolPaths.some((tool) => edge.targetPath === tool))
        .map((edge) => edge.sourceId)
    );
    const guidePosts = posts.filter((item) => item.queryType === "CALCULATOR_SUPPORT");
    let status = "WEAK";
    if (guidePosts.length && toolLinkedPostIds.size >= Math.ceil(posts.length * 0.5)) status = "STRONG";
    else if (guidePosts.length || toolLinkedPostIds.size > 0) status = "PARTIAL";
    return {
      topicFamily,
      toolPaths,
      postCount: posts.length,
      guidePosts: guidePosts.map((item) => item.id),
      toolLinkedPostCount: toolLinkedPostIds.size,
      status,
    };
  });
}

function buildMarketFunnel(queryMap, edges) {
  const byFamily = new Map();
  for (const item of queryMap) {
    if (!MARKET_RELEVANT_FAMILIES.has(item.topicFamily)) continue;
    if (!byFamily.has(item.topicFamily)) byFamily.set(item.topicFamily, []);
    byFamily.get(item.topicFamily).push(item);
  }
  return Array.from(byFamily.entries()).map(([topicFamily, posts]) => {
    const linked = edges.marketEdges.filter((edge) => posts.some((post) => post.id === edge.sourceId));
    let status = "WEAK";
    if (linked.length >= Math.ceil(posts.length * 0.5)) status = "STRONG";
    else if (linked.length > 0) status = "PARTIAL";
    return {
      topicFamily,
      postCount: posts.length,
      marketDashboardLinkCount: linked.length,
      linkedPosts: Array.from(new Set(linked.map((edge) => edge.sourceId))).sort(),
      status,
    };
  });
}

function buildHubAssessments(topicArchitecture, queryMap, coreSpokeAudits, postRows) {
  const families = new Set(queryMap.map((item) => item.topicFamily));
  return Array.from(families)
    .sort()
    .map((topicFamily) => {
      const posts = queryMap.filter((item) => item.topicFamily === topicFamily);
      const queryTypes = new Set(posts.map((item) => item.queryType));
      const intents = new Set(posts.map((item) => item.primaryIntent));
      const architecture = topicArchitecture.find((item) => item.topicFamily === topicFamily);
      const coreIds = (architecture?.core || []).map((item) => item.id);
      const relatedAudits = coreSpokeAudits.filter((item) => item.topicFamily === topicFamily);
      const missingLinks = relatedAudits.filter((item) => item.coreToSpoke.status === "MISSING" || item.spokeToCore.status === "MISSING").length;
      let hubNeed = "HUB_NOT_NEEDED";
      if (topicFamily === "DCA") hubNeed = "HUB_REQUIRED";
      else if (HUB_CANDIDATE_FAMILIES.has(topicFamily)) hubNeed = "HUB_USEFUL";
      const mode = topicFamily === "DCA" || topicFamily === "HOUSEHOLD_FINANCE" ? "DEDICATED_HUB_RECOMMENDED" : hubNeed === "HUB_NOT_NEEDED" ? "NOT_APPLICABLE" : "EXISTING_CORE_CAN_SERVE_AS_HUB";
      const candidateUrl = mode === "EXISTING_CORE_CAN_SERVE_AS_HUB" ? (queryMap.find((item) => item.id === coreIds[0])?.url || "") : "URL concept not assigned in Step 4";
      return {
        topicFamily,
        hubNeed,
        mode,
        postCount: posts.length,
        queryDiversity: queryTypes.size + intents.size,
        coreDocuments: coreIds,
        missingCoreSpokeLinks: missingLinks,
        candidateUrl,
        hubTitleConcept: hubTitleConcept(topicFamily),
        primaryQueryConcept: primaryQueryConcept(topicFamily),
        sections: hubSections(topicFamily, posts),
        linkedSpokes: posts.filter((item) => !coreIds.includes(item.id)).map((item) => item.id),
        inboundSources: postRows.filter((row) => row.topicFamily === topicFamily && row.contextualInbound > 0).map((row) => row.id).slice(0, 8),
        outboundStructure: "Core/Hub -> key guides, scenario pages, data pages, calculators; spokes -> core/hub plus 1-2 natural siblings.",
      };
    });
}

function hubTitleConcept(topicFamily) {
  return {
    DCA: "적립식 투자(DCA) 가이드",
    DSR_LTV: "DSR/LTV 대출한도 계산 가이드",
    HOUSEHOLD_FINANCE: "개인 재무관리 시작 가이드",
    REAL_ESTATE_BUDGET: "아파트 구매 예산 가이드",
    REAL_ESTATE_DATA: "아파트 실거래가/시세 데이터 가이드",
  }[topicFamily] || `${topicFamily} topic guide`;
}

function primaryQueryConcept(topicFamily) {
  return {
    DCA: "적립식 투자",
    DSR_LTV: "DSR LTV 대출한도",
    HOUSEHOLD_FINANCE: "재테크 시작 / 개인 재무관리",
    REAL_ESTATE_BUDGET: "아파트 구매 예산",
    REAL_ESTATE_DATA: "아파트 실거래가 보는 법",
  }[topicFamily] || topicFamily;
}

function hubSections(topicFamily, posts) {
  if (topicFamily === "DCA") return ["DCA 뜻", "DCA vs 일시금", "하락장 DCA", "월 투자금 설계", "증액 전략", "환율 영향", "10년 결과", "실패 패턴", "DCA calculator"];
  if (topicFamily === "DSR_LTV") return ["DSR/LTV 기본", "연봉별 한도", "연봉 4000/5000 scenario", "금리 변화 영향", "현금 병목", "주담대 risk", "DSR/LTV calculator"];
  if (topicFamily === "HOUSEHOLD_FINANCE") return ["재무관리 framework", "시작 5단계", "비상금", "부채 상환 vs 투자", "물가 대응", "목표금액 계획"];
  if (topicFamily === "REAL_ESTATE_BUDGET") return ["매수 예산", "계산기", "부대비용", "보유현금별 budget", "생애최초", "전세에서 매매", "월세/전세/매매 비교"];
  if (topicFamily === "REAL_ESTATE_DATA") return ["대시보드 활용", "실거래가 읽기", "거래량", "금리와 가격", "대단지", "수도권 risk budget"];
  return posts.map((item) => item.topicSubtopic).slice(0, 8);
}

function familyCoverage(coreSpokeAudits, postRows, topicFamily) {
  const audits = coreSpokeAudits.filter((item) => item.topicFamily === topicFamily);
  const rows = postRows.filter((row) => row.topicFamily === topicFamily);
  const strongOrPartialCore = audits.filter((item) => ["STRONG", "PARTIAL"].includes(item.coreToSpoke.status)).length;
  const strongOrPartialReverse = audits.filter((item) => ["STRONG", "PARTIAL"].includes(item.spokeToCore.status)).length;
  const denom = Math.max(1, audits.length);
  const weakAnchors = rows.filter((row) => row.queryAnchorSupport === "ANCHOR_SUPPORT_WEAK").length;
  let status = "WEAK";
  if (strongOrPartialCore / denom >= 0.5 && strongOrPartialReverse / denom >= 0.5 && weakAnchors <= Math.ceil(rows.length * 0.25)) status = "STRONG";
  else if (strongOrPartialCore || strongOrPartialReverse || weakAnchors < rows.length) status = "PARTIAL";
  return {
    topicFamily,
    postCount: rows.length,
    coreToSpokeCoverage: `${strongOrPartialCore}/${denom}`,
    spokeToCoreCoverage: `${strongOrPartialReverse}/${denom}`,
    weakAnchorCount: weakAnchors,
    status,
  };
}

function buildOpportunities(coreSpokeAudits, postRows, boundaryWeakAudits, parentChildAudits, hubAssessments, queryById) {
  const opportunities = [];
  const add = (source, target, anchorConcept, reason, type) => {
    if (!source || !target || source === target) return;
    opportunities.push({ source, target, recommendedAnchorConcept: anchorConcept, reason, type });
  };

  for (const audit of coreSpokeAudits) {
    if (audit.spokeToCore.status === "MISSING" && HUB_CANDIDATE_FAMILIES.has(audit.topicFamily)) {
      add(audit.spokeId, audit.coreId, `${audit.coreQuery}로 돌아가는 핵심 개념`, "Spoke -> core contextual link is missing in a hub-candidate topic.", "HIGH_VALUE_LINK_OPPORTUNITY");
    }
    if (audit.coreToSpoke.status === "MISSING" && HUB_CANDIDATE_FAMILIES.has(audit.topicFamily)) {
      add(audit.coreId, audit.spokeId, `${audit.spokeQuery}로 확장되는 하위 주제`, "Core -> spoke contextual link is missing in a hub-candidate topic.", "HIGH_VALUE_LINK_OPPORTUNITY");
    }
  }

  for (const audit of boundaryWeakAudits) {
    if (audit.aToB.status === "MISSING") add(audit.postA, audit.postB, audit.recommendedAnchorConceptAtoB, "Boundary-weak pair lacks a contextual link in one direction.", "HIGH_VALUE_LINK_OPPORTUNITY");
    if (audit.bToA.status === "MISSING") add(audit.postB, audit.postA, audit.recommendedAnchorConceptBtoA, "Boundary-weak pair lacks a contextual link in one direction.", "HIGH_VALUE_LINK_OPPORTUNITY");
  }

  for (const audit of parentChildAudits) {
    if (audit.childToParent.status === "MISSING") add(audit.child, audit.parent, `${audit.parentQuery} parent guide`, "Child page lacks reverse link to parent.", "HIGH_VALUE_LINK_OPPORTUNITY");
    if (audit.parentToChild.status === "MISSING") add(audit.parent, audit.child, `${audit.childQuery} scenario`, "Parent page lacks contextual path to child.", "HIGH_VALUE_LINK_OPPORTUNITY");
  }

  for (const row of postRows.filter((item) => item.queryAnchorSupport === "ANCHOR_SUPPORT_WEAK" && item.contextualInbound <= 1)) {
    const core = row.coreUrl[0] ? urlToId(row.coreUrl[0]) : "";
    if (core && core !== row.id) {
      add(core, row.id, `${row.primaryQuery} 관련 하위 주제`, "Query owner has weak contextual inbound anchor support.", "HIGH_VALUE_LINK_OPPORTUNITY");
    }
  }

  for (const hub of hubAssessments.filter((item) => item.hubNeed !== "HUB_NOT_NEEDED" && item.mode === "EXISTING_CORE_CAN_SERVE_AS_HUB")) {
    for (const spoke of hub.linkedSpokes.slice(0, 6)) {
      const core = hub.coreDocuments[0];
      add(spoke, core, `${hub.primaryQueryConcept} 전체 가이드`, "Existing core can serve as hub but spoke-to-core reinforcement is useful.", "HIGH_VALUE_LINK_OPPORTUNITY");
    }
  }

  const seen = new Set();
  return opportunities.filter((item) => {
    const key = `${item.source}::${item.target}::${item.recommendedAnchorConcept}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return Boolean(queryById.get(item.source) && queryById.get(item.target));
  });
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
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

function buildReport(output) {
  const lines = [];
  lines.push("# FinMap KO Post Internal Link / Topic Cluster Architecture Audit");
  lines.push("");
  lines.push(`Generated: ${output.generatedAt}`);
  lines.push("");
  lines.push("## Final Verdict");
  lines.push("");
  lines.push(`Final Verdict: ${output.summary.finalVerdict}`);
  lines.push("");
  lines.push("This is an audit/design-only Step 4 output. No post content, internal links, frontmatter, sitemap, canonical, hreflang, schema, component, or runtime code was changed.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  for (const item of [
    ["total contextual internal links", output.summary.totalContextualInternalLinks],
    ["related-template links", output.summary.relatedTemplateLinks],
    ["core -> spoke missing count", output.summary.coreToSpokeMissingCount],
    ["spoke -> core missing count", output.summary.spokeToCoreMissingCount],
    ["weak owner anchor count", output.summary.weakOwnerAnchorCount],
    ["generic contextual anchor count", output.summary.genericContextualAnchorCount],
    ["topic isolated posts", output.summary.topicIsolatedPosts],
    ["cross-category weak posts", output.summary.crossCategoryWeakPosts],
    ["high-value link opportunities", output.summary.highValueLinkOpportunities],
    ["HUB_REQUIRED count", output.summary.hubRequiredCount],
    ["HUB_USEFUL count", output.summary.hubUsefulCount],
    ["HUB_NOT_NEEDED count", output.summary.hubNotNeededCount],
  ]) {
    lines.push(`- ${item[0]}: ${item[1]}`);
  }
  lines.push("");
  lines.push("## Internal Link Graph Overview");
  lines.push("");
  lines.push(`- EXPLICIT_CONTEXTUAL post links: ${output.graphOverview.explicitContextualPostLinks}`);
  lines.push(`- TOOL_CTA links: ${output.graphOverview.toolCtaLinks}`);
  lines.push(`- MARKET_DASHBOARD_LINK links: ${output.graphOverview.marketDashboardLinks}`);
  lines.push(`- RELATED_POST_TEMPLATE links: ${output.graphOverview.relatedPostTemplateLinks}`);
  lines.push(`- CATEGORY_TEMPLATE links: ${output.graphOverview.categoryTemplateLinks}`);
  lines.push(`- SITEMAP_OR_INDEX_PAGE links: ${output.graphOverview.sitemapOrIndexPageLinks}`);
  lines.push("");
  lines.push("## Topic Family Link Coverage");
  lines.push("");
  lines.push("| Topic Family | Posts | Core -> Spoke | Spoke -> Core | Weak Anchors | Status |");
  lines.push("|---|---:|---|---|---:|---|");
  for (const item of output.topicFamilyLinkCoverage) {
    lines.push(`| ${mdEscape(item.topicFamily)} | ${item.postCount} | ${item.coreToSpokeCoverage} | ${item.spokeToCoreCoverage} | ${item.weakAnchorCount} | ${item.status} |`);
  }
  lines.push("");
  lines.push("## Core -> Spoke Audit");
  lines.push("");
  writeCoreSpokeTable(lines, output.coreSpokeAudits, "coreToSpoke");
  lines.push("");
  lines.push("## Spoke -> Core Audit");
  lines.push("");
  writeCoreSpokeTable(lines, output.coreSpokeAudits, "spokeToCore");
  lines.push("");
  lines.push("## Query Owner Anchor Audit");
  lines.push("");
  lines.push("| Post | Query | Anchor Support | Contextual Inbound | Strongest Anchor | Generic Inbound |");
  lines.push("|---|---|---|---:|---|---:|");
  for (const row of output.postLinkRows.filter((item) => item.queryAnchorSupport !== "ANCHOR_SUPPORT_STRONG").slice(0, 60)) {
    lines.push(`| ${mdEscape(row.id)} | ${mdEscape(row.primaryQuery)} | ${row.queryAnchorSupport} | ${row.contextualInbound} | ${mdEscape(row.strongestInboundAnchor || "-")} | ${row.genericInboundAnchorCount} |`);
  }
  lines.push("");
  lines.push("## Generic Anchor Findings");
  lines.push("");
  lines.push(`- Generic contextual post anchors detected: ${output.genericAnchorFindings.count}`);
  for (const item of output.genericAnchorFindings.items.slice(0, 30)) {
    lines.push(`- ${item.sourceId} -> ${item.targetId}: "${item.anchor}"`);
  }
  lines.push("");
  lines.push("## Boundary Weak Pair Link Audit");
  lines.push("");
  lines.push("| Pair | Owner | A -> B | B -> A | Boundary | Anchor Risk |");
  lines.push("|---|---|---|---|---|---|");
  for (const item of output.boundaryWeakPairAudit) {
    lines.push(
      [
        `${item.postA} <-> ${item.postB}`,
        item.ownerPost,
        `${item.aToB.status} / ${item.aToB.linkType}`,
        `${item.bToA.status} / ${item.bToA.linkType}`,
        item.boundaryStatus,
        item.anchorRisk,
      ]
        .map(mdEscape)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }
  lines.push("");
  lines.push("## Parent / Child Link Audit");
  lines.push("");
  lines.push("| Strength | Parent | Child | Parent -> Child | Child -> Parent |");
  lines.push("|---|---|---|---|---|");
  for (const item of output.parentChildAudit) {
    lines.push(`| ${item.strength} | ${mdEscape(item.parent)} | ${mdEscape(item.child)} | ${item.parentToChild.status} | ${item.childToParent.status} |`);
  }
  lines.push("");
  lines.push("## Calculator Funnel Audit");
  lines.push("");
  lines.push("| Topic Family | Tools | Guide Posts | Linked Posts | Status |");
  lines.push("|---|---|---|---:|---|");
  for (const item of output.calculatorFunnelAudit) {
    lines.push(`| ${item.topicFamily} | ${mdEscape(item.toolPaths.join("; "))} | ${mdEscape(item.guidePosts.join("; ") || "-")} | ${item.toolLinkedPostCount}/${item.postCount} | ${item.status} |`);
  }
  lines.push("");
  lines.push("## Market Dashboard Funnel Audit");
  lines.push("");
  lines.push("| Topic Family | Posts | Market Links | Linked Posts | Status |");
  lines.push("|---|---:|---:|---|---|");
  for (const item of output.marketDashboardFunnelAudit) {
    lines.push(`| ${item.topicFamily} | ${item.postCount} | ${item.marketDashboardLinkCount} | ${mdEscape(item.linkedPosts.join("; ") || "-")} | ${item.status} |`);
  }
  lines.push("");
  lines.push("## Cross-category Link Audit");
  lines.push("");
  lines.push(`- CROSS_CATEGORY_STRONG: ${output.crossCategorySummary.CROSS_CATEGORY_STRONG || 0}`);
  lines.push(`- CROSS_CATEGORY_PARTIAL: ${output.crossCategorySummary.CROSS_CATEGORY_PARTIAL || 0}`);
  lines.push(`- CROSS_CATEGORY_WEAK: ${output.crossCategorySummary.CROSS_CATEGORY_WEAK || 0}`);
  lines.push("");
  lines.push("## Topic Isolated Posts");
  lines.push("");
  if (!output.topicIsolatedPosts.length) lines.push("- None.");
  for (const row of output.topicIsolatedPosts) {
    lines.push(`- ${row.id}: ${row.topicFamily} / ${row.primaryQuery}`);
  }
  lines.push("");
  lines.push("## Topic Hub Candidate Assessment");
  lines.push("");
  lines.push("| Topic Family | Assessment | Existing/New | Candidate URL | Sections |");
  lines.push("|---|---|---|---|---|");
  for (const item of output.hubAssessments.filter((hub) => hub.hubNeed !== "HUB_NOT_NEEDED")) {
    lines.push(`| ${item.topicFamily} | ${item.hubNeed} | ${item.mode} | ${mdEscape(item.candidateUrl)} | ${mdEscape(item.sections.join("; "))} |`);
  }
  lines.push("");
  lines.push("## Topic Cluster Architecture");
  lines.push("");
  lines.push("| Topic Family | Core | Spokes |");
  lines.push("|---|---|---|");
  for (const item of output.topicClusterMap) {
    lines.push(`| ${mdEscape(item.topicFamily)} | ${mdEscape(item.core.join("; ") || "-")} | ${mdEscape(item.spokes.join("; ") || "-")} |`);
  }
  lines.push("");
  lines.push("## High-value Link Opportunities");
  lines.push("");
  lines.push("| Source | Target | Anchor Concept | Reason |");
  lines.push("|---|---|---|---|");
  for (const item of output.highValueLinkOpportunities.slice(0, 80)) {
    lines.push(`| ${mdEscape(item.source)} | ${mdEscape(item.target)} | ${mdEscape(item.recommendedAnchorConcept)} | ${mdEscape(item.reason)} |`);
  }
  lines.push("");
  lines.push("## Data Quality / Limitations");
  lines.push("");
  lines.push("- This audit used local Step 1-3 reports and repository-derived link data only.");
  lines.push("- No Naver Search, Search Advisor, GSC, click, impression, ranking, or external keyword-volume data was used.");
  lines.push("- Related-post template links are treated as secondary signals, not as replacements for contextual links.");
  lines.push("- Recommendations are anchor concepts and architecture opportunities only. No internal link, content, metadata, route, or component change was made.");
  lines.push("- Dense all-to-all link mesh is intentionally not recommended; opportunities are limited to core/spoke, parent/child, boundary clarification, and calculator/dashboard funnels.");
  lines.push("");
  lines.push("## Generated Files");
  lines.push("");
  lines.push(`- \`${rel(REPORT_MD)}\``);
  lines.push(`- \`${rel(REPORT_JSON)}\``);
  lines.push(`- \`${rel(OPPORTUNITIES_CSV)}\``);
  lines.push(`- \`${rel(CLUSTER_CSV)}\``);
  lines.push("");
  lines.push("## Step 5 Readiness");
  lines.push("");
  lines.push("Step 5 Priority / Pilot Selection readiness: YES");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function writeCoreSpokeTable(lines, audits, direction) {
  lines.push("| Topic | Core | Spoke | Status | Link Type | Anchors |");
  lines.push("|---|---|---|---|---|---|");
  for (const item of audits.filter((audit) => audit[direction].status !== "STRONG").slice(0, 80)) {
    const signal = item[direction];
    lines.push(`| ${mdEscape(item.topicFamily)} | ${mdEscape(item.coreId)} | ${mdEscape(item.spokeId)} | ${signal.status} | ${signal.linkType} | ${mdEscape(signal.anchors.join("; ") || "-")} |`);
  }
}

function main() {
  if (!fs.existsSync(STEP1_JSON)) throw new Error(`Missing Step 1 JSON: ${rel(STEP1_JSON)}`);
  if (!fs.existsSync(STEP2_JSON)) throw new Error(`Missing Step 2 JSON: ${rel(STEP2_JSON)}`);
  if (!fs.existsSync(STEP3_JSON)) throw new Error(`Missing Step 3 JSON: ${rel(STEP3_JSON)}`);

  const step1 = readJson(STEP1_JSON);
  const step2 = readJson(STEP2_JSON);
  const step3 = readJson(STEP3_JSON);
  const posts = step1.posts || [];
  const queryMap = step2.queryMap || [];
  const topicArchitecture = step3.topicFamilyArchitecture || [];
  const step1ById = new Map(posts.map((post) => [post.id, post]));
  const queryById = new Map(queryMap.map((post) => [post.id, post]));
  const edges = buildEdges(posts);
  const coreSpokeAudits = buildCoreSpokeAudits(topicArchitecture, queryById, edges);
  const postLinkRows = buildPostRows(queryMap, step1ById, topicArchitecture, queryById, coreSpokeAudits, edges);
  const boundaryWeakPairAudit = buildBoundaryWeakPairAudit(step3, queryById, edges);
  const trueCannibalizationLinkAudit = buildTrueCannibalizationLinkAudit(step3, queryById, edges);
  const parentChildAudit = buildParentChildAudit(step3, queryById, edges);
  const calculatorFunnelAudit = buildCalculatorFunnel(queryMap, edges);
  const marketDashboardFunnelAudit = buildMarketFunnel(queryMap, edges);
  const hubAssessments = buildHubAssessments(topicArchitecture, queryMap, coreSpokeAudits, postLinkRows);
  const topicFamilyLinkCoverage = Array.from(new Set(queryMap.map((item) => item.topicFamily))).sort().map((family) => familyCoverage(coreSpokeAudits, postLinkRows, family));
  const highValueLinkOpportunities = buildOpportunities(coreSpokeAudits, postLinkRows, boundaryWeakPairAudit, parentChildAudit, hubAssessments, queryById);
  const genericAnchorItems = edges.explicitEdges.filter((edge) => isGenericAnchor(edge.anchor));
  const crossCategorySummary = countBy(postLinkRows.filter((row) => row.crossCategorySupport !== "NA"), (row) => row.crossCategorySupport);
  const topicIsolatedPosts = postLinkRows.filter((row) => row.topicIsolation);
  const topicClusterMap = topicArchitecture.map((family) => ({
    topicFamily: family.topicFamily,
    core: (family.core || []).map((item) => `${item.id} (${item.query})`),
    spokes: (family.spokes || []).map((item) => `${item.id} (${item.query})`),
  }));

  for (const opportunity of highValueLinkOpportunities) {
    const source = postLinkRows.find((row) => row.id === opportunity.source);
    const target = postLinkRows.find((row) => row.id === opportunity.target);
    if (source) source.recommendedLinkTargets.push(opportunity.target);
    if (target) target.recommendedLinkSources.push(opportunity.source);
  }

  const hubCounts = countBy(hubAssessments, (item) => item.hubNeed);
  const summary = {
    finalVerdict: highValueLinkOpportunities.length ? "TOPIC_LINK_AUDIT_COMPLETE_WITH_REVIEW_ITEMS" : "TOPIC_LINK_AUDIT_COMPLETE",
    totalPosts: queryMap.length,
    totalContextualInternalLinks: edges.explicitEdges.length + edges.toolEdges.filter((edge) => edge.source !== "template").length + edges.marketEdges.length,
    relatedTemplateLinks: edges.relatedEdges.length,
    coreToSpokeMissingCount: coreSpokeAudits.filter((item) => item.coreToSpoke.status === "MISSING").length,
    spokeToCoreMissingCount: coreSpokeAudits.filter((item) => item.spokeToCore.status === "MISSING").length,
    weakOwnerAnchorCount: postLinkRows.filter((row) => row.queryAnchorSupport === "ANCHOR_SUPPORT_WEAK").length,
    genericContextualAnchorCount: genericAnchorItems.length,
    topicIsolatedPosts: topicIsolatedPosts.length,
    crossCategoryWeakPosts: postLinkRows.filter((row) => row.crossCategorySupport === "CROSS_CATEGORY_WEAK").length,
    highValueLinkOpportunities: highValueLinkOpportunities.length,
    hubRequiredCount: hubCounts.HUB_REQUIRED || 0,
    hubUsefulCount: hubCounts.HUB_USEFUL || 0,
    hubNotNeededCount: hubCounts.HUB_NOT_NEEDED || 0,
  };

  const output = {
    generatedAt: new Date().toISOString(),
    scope: {
      language: "ko",
      auditOnly: true,
      source: "step1_step2_step3_repository_reports",
      networkUsed: false,
      noContentChanges: true,
    },
    summary,
    graphOverview: {
      explicitContextualPostLinks: edges.explicitEdges.length,
      toolCtaLinks: edges.toolEdges.length,
      marketDashboardLinks: edges.marketEdges.length,
      relatedPostTemplateLinks: edges.relatedEdges.length,
      categoryTemplateLinks: edges.pageTemplateEdges.filter((edge) => edge.type === "CATEGORY_TEMPLATE").length,
      sitemapOrIndexPageLinks: edges.pageTemplateEdges.filter((edge) => edge.type === "SITEMAP_OR_INDEX_PAGE").length,
    },
    topicFamilyLinkCoverage,
    coreSpokeAudits,
    postLinkRows,
    boundaryWeakPairAudit,
    trueCannibalizationLinkAudit,
    parentChildAudit,
    calculatorFunnelAudit,
    marketDashboardFunnelAudit,
    crossCategorySummary,
    topicIsolatedPosts,
    hubAssessments,
    topicClusterMap,
    highValueLinkOpportunities,
    genericAnchorFindings: {
      count: genericAnchorItems.length,
      items: genericAnchorItems.map((edge) => ({ sourceId: edge.sourceId, targetId: edge.targetId, anchor: edge.anchor })),
    },
    limitations: [
      "No live Naver ranking/search data was used.",
      "Related-post template links are secondary signals.",
      "No internal link or content changes were made.",
      "Anchor recommendations are concepts, not mandatory exact-match anchor strings.",
    ],
  };

  ensureDir(REPORT_JSON);
  fs.writeFileSync(REPORT_JSON, JSON.stringify(output, null, 2), "utf8");
  writeCsv(OPPORTUNITIES_CSV, highValueLinkOpportunities, ["source", "target", "recommendedAnchorConcept", "reason", "type"]);
  writeCsv(CLUSTER_CSV, topicClusterMap.map((row) => ({
    topicFamily: row.topicFamily,
    core: row.core.join("; "),
    spokes: row.spokes.join("; "),
  })), ["topicFamily", "core", "spokes"]);
  fs.writeFileSync(REPORT_MD, buildReport(output), "utf8");

  console.log("PASS audit_naver_ko_post_topic_links");
  console.log(`- KO posts analyzed: ${summary.totalPosts}`);
  console.log(`- Contextual post links: ${edges.explicitEdges.length}`);
  console.log(`- Core -> spoke missing: ${summary.coreToSpokeMissingCount}`);
  console.log(`- Spoke -> core missing: ${summary.spokeToCoreMissingCount}`);
  console.log(`- High-value link opportunities: ${summary.highValueLinkOpportunities}`);
  console.log(`- Report: ${rel(REPORT_MD)}`);
  console.log(`- JSON: ${rel(REPORT_JSON)}`);
  console.log(`- Opportunities CSV: ${rel(OPPORTUNITIES_CSV)}`);
  console.log(`- Cluster CSV: ${rel(CLUSTER_CSV)}`);
  console.log(`- Final Verdict: ${summary.finalVerdict}`);
}

main();
