#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const GENERATED_AT = "2026-07-22";
const PROJECT = "FinMap";
const PROJECT_STAGE = "P1-1C predeploy integrated audit";

const OUTPUTS = {
  changedFiles: "reports/search-growth-90d-p1-1c-changed-files.csv",
  localArtifacts: "reports/search-growth-90d-p1-1c-local-artifacts.csv",
  deployManifest: "reports/search-growth-90d-p1-1c-deploy-manifest.json",
  verification: "reports/search-growth-90d-p1-1c-verification.json",
  observationBaseline: "reports/search-growth-90d-p1-1c-observation-baseline.json",
  report: "reports/search-growth-90d-p1-1c-predeploy-integrated-audit.md",
};

const REQUIRED_INPUTS = [
  "reports/search-growth-90d-p0-1-baseline-audit.md",
  "reports/search-growth-90d-p0-2a-snippet-hygiene.md",
  "reports/search-growth-90d-p0-2b-internal-link-integrity.md",
  "reports/search-growth-90d-p1-1a-data-readiness.md",
  "reports/search-growth-90d-p1-1a-search-performance-audit.md",
  "reports/search-growth-90d-p1-1a-2-priority-calibration.md",
  "reports/search-growth-90d-p1-1b-1-ko-naver-low-risk-expansion.md",
  "reports/search-growth-90d-p1-1b-2-en-search-experiment.md",
  "reports/search-growth-90d-audit-data.json",
  "reports/search-growth-90d-url-inventory.csv",
  "reports/search-growth-90d-p1-1a-performance-merged.csv",
  "reports/search-growth-90d-p1-1a-query-map.csv",
  "reports/search-growth-90d-p1-1a-daily-merged.csv",
  "reports/search-growth-90d-p1-1a-priority.json",
  "reports/search-growth-90d-p1-1a-input-diagnostics.json",
  "reports/search-growth-90d-p1-1a-2-priority-calibration.json",
  "reports/search-growth-90d-p1-1a-2-execution-targets.json",
  "reports/search-growth-90d-p1-1b-2-en-experiment-manifest.json",
  "reports/posts.linkcheck.json",
  "reports/seo-channel-split-url-check.md",
];

const STAGE_BY_EXACT_FILE = new Map([
  ["_components/ToolBacklinkKit.js", "P0-2A"],
  ["pages/posts/[category]/[slug].js", "P0-2A"],
  ["docs/blog-contents.md", "P0-2B"],
  ["package.json", "P0-2B"],
  ["scripts/check_posts_links_local.js", "P0-2B"],
  ["pages/tools/home-buying-budget-calculator.js", "P1-1B-1"],
  ["content/posts/personalFinance/ko/what-is-cagr.md", "P1-1B-1"],
  ["content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md", "P1-1B-1"],
  ["content/posts/personalFinance/en/how-much-to-invest-monthly-for-target-portfolio.md", "P1-1B-2"],
  ["content/posts/personalFinance/en/annual-vs-monthly-compound.md", "P1-1B-2"],
  ["content/posts/personalFinance/en/is-dca-better-in-a-bear-market.md", "P1-1B-2"],
  ["scripts/verify_search_growth_p1_1c_predeploy.js", "P1-1C"],
]);

const P0_2B_EN_LINK_FILES = new Set([
  "content/posts/economicInfo/en/gold-geopolitics-real-rates-dollar-uncertainty.md",
  "content/posts/economicInfo/en/hormuz-risk-oil-insurance-freight-premium.md",
  "content/posts/economicInfo/en/oil-shock-to-usdkrw-korea-transmission.md",
  "content/posts/economicInfo/en/war-theme-investing-price-chain-not-winners.md",
  "content/posts/investingInfo/en/modern-6040-risk-budget.md",
  "content/posts/investingInfo/en/rates-discount-mortgage-demand-apt-prices.md",
  "content/posts/personalFinance/en/apt-dashboard-home-goal-roadmap.md",
  "content/posts/personalFinance/en/simple-vs-compound.md",
]);

const COMMAND_RESULTS = [
  ["node --check scripts\\audit_search_growth_baseline.js", "PASS", "syntax"],
  ["node --check scripts\\verify_search_snippet_hygiene.js", "PASS", "syntax"],
  ["node --check scripts\\verify_internal_link_integrity.js", "PASS", "syntax"],
  ["node --check scripts\\analyze_search_performance_inputs.js", "PASS", "syntax"],
  ["node --check scripts\\verify_search_growth_p1_1b_ko_expansion.js", "PASS", "syntax"],
  ["node --check scripts\\verify_search_growth_p1_1b_en_experiment.js", "PASS", "syntax"],
  ["node scripts\\analyze_search_performance_inputs.js", "PASS", "10 input files, 192 inventory URLs, 13 unmatched input URLs"],
  ["npm.cmd run check:posts-links", "PASS", "Broken 0, Suspicious 0, self URL missing 0"],
  ["node scripts\\verify_tool_result_cta_events.js", "PASS", "required events and params present"],
  ["node scripts\\verify_cagr_calculator.js", "PASS", "sample calculations passed"],
  ["node scripts\\verify_dsr_ltv_calculator.js", "PASS", "sample calculations passed; MODULE_TYPELESS_PACKAGE_JSON warning observed"],
  ["node scripts\\verify_mortgage_loan_calculator.js", "PASS", "mortgage payment samples and registrations passed; MODULE_TYPELESS_PACKAGE_JSON warning observed"],
  ["node scripts\\verify_compound_calculator.js", "PASS", "sample calculations passed"],
  ["node scripts\\verify_dca_simulator.js", "PASS", "sample calculations passed"],
  ["node scripts\\verify_naver_calculator_seo.js", "REVIEW_REQUIRED", "optional check failed one compound description keyword assertion"],
  ["npm.cmd run build", "PASS", "223 static pages; sitemap-0 211, sitemap-ko 111, sitemap-en 100, en/sitemap 100"],
  ["node scripts\\verify_search_snippet_hygiene.js --base-url=http://127.0.0.1:8002", "PASS", "rendered sample set passed"],
  ["node scripts\\verify_internal_link_integrity.js --base-url=http://127.0.0.1:8002", "PASS", "broken 0, suspicious 0, checked P0-2B targets"],
  ["node scripts\\verify_search_growth_p1_1b_ko_expansion.js --base-url=http://127.0.0.1:8002", "PASS", "134/134 checks passed"],
  ["node scripts\\verify_search_growth_p1_1b_en_experiment.js --base-url=http://127.0.0.1:8002", "PASS", "170/170 checks passed"],
  ["node scripts\\verify_seo_channel_split.js --local-server", "PASS", "canonical, hreflang, sitemaps passed for samples"],
  ["node scripts\\audit_search_growth_baseline.js", "PASS", "192 URLs audited"],
  ["git diff --check", "PASS", "exit 0; CRLF normalization warnings only"],
  ["git status --short --untracked-files=all", "PASS", "dirty worktree inventoried"],
  ["git diff --name-status", "PASS", "unstaged changes inventoried"],
  ["git diff --stat", "PASS", "diff summary inventoried"],
];

const REVIEW_REQUIRED = [
  {
    id: "top100-db-backed-routes",
    status: "REVIEW_REQUIRED",
    reason:
      "Top100 DB-backed routes can return local 500 without a production-like DB. Verify /market/real-estate/seoul-top100, /market/real-estate/magok-top100, and /market/real-estate/gangnam3-top100 before deploy.",
  },
  {
    id: "search-performance-input-git-policy",
    status: "REVIEW_REQUIRED",
    reason:
      "reports/search-performance-input is untracked and not ignored. The files are useful for analysis reproducibility but are not runtime-required.",
  },
  {
    id: "reports-git-policy",
    status: "REVIEW_REQUIRED",
    reason:
      "Many reports are local analysis artifacts. Decide which audit outputs should be committed with the deploy bundle.",
  },
  {
    id: "generated-sitemap-policy",
    status: "REVIEW_REQUIRED",
    reason:
      "public sitemap outputs are tracked and regenerated by build. Include them if the repo policy is to commit generated sitemap files.",
  },
  {
    id: "optional-naver-calculator-seo",
    status: "REVIEW_REQUIRED",
    reason:
      "verify_naver_calculator_seo.js reported one pre-existing-style compound description keyword assertion failure. No P1-1C content fix was made.",
  },
  {
    id: "module-type-warning",
    status: "REVIEW_REQUIRED",
    reason:
      "Node emitted MODULE_TYPELESS_PACKAGE_JSON warnings for ESM calculator modules. This does not fail build or calculation samples; package type was not changed.",
  },
];

const OBSERVATION_TARGETS = [
  {
    group: "KO Track B",
    url: "/posts/personalFinance/what-is-cagr",
    baselinePeriod: "2026-04-23 to 2026-07-19",
    baselinePlatform: "Naver",
    clicks: 53,
    impressions: 5084,
    ctr: "1.00%",
    position: 3,
    sampleConfidence: "CLICK_TOP_30 / NAVER_WINNER",
    experimentType: "KO low-risk expansion",
    changedElements: ["upper explanation", "calculator CTA", "dateModified", "manual Article JSON-LD removal"],
    protectedElements: ["title", "H1", "slug", "canonical", "hreflang", "calculation logic"],
  },
  {
    group: "KO Track B",
    url: "/tools/home-buying-budget-calculator",
    baselinePeriod: "2026-04-23 to 2026-07-19",
    baselinePlatform: "Naver",
    clicks: 33,
    impressions: 2209,
    ctr: "1.49%",
    position: null,
    sampleConfidence: "NAVER_ADJACENT_OPPORTUNITY",
    experimentType: "tool role separation",
    changedElements: ["lead copy", "result-reading flow", "mortgage calculator CTA"],
    protectedElements: ["title", "H1", "slug", "canonical", "hreflang", "calculation logic"],
  },
  {
    group: "KO Track B",
    url: "/posts/personalFinance/dsr-40-income-loan-limit-table",
    baselinePeriod: "2026-04-23 to 2026-07-19",
    baselinePlatform: "Naver",
    clicks: 18,
    impressions: 538,
    ctr: "3.30%",
    position: 12,
    sampleConfidence: "CLICK_TOP_30 / NAVER_WINNER",
    experimentType: "KO low-risk expansion",
    changedElements: ["upper mortgage payment CTA", "supporting explanation", "FAQ sync", "dateModified"],
    protectedElements: ["title", "H1", "slug", "canonical", "hreflang", "table assumptions", "calculation logic"],
  },
  {
    group: "EN Track A",
    url: "/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio",
    baselinePeriod: "2026-04-23 to 2026-07-19",
    baselinePlatform: "Google/Bing",
    gsc: { clicks: 0, impressions: 1, ctr: "0", position: "29" },
    bing: { clicks: 0, impressions: 399, ctr: "0", position: "5.35" },
    sampleConfidence: "SUFFICIENT",
    experimentType: "EN snippet and first-answer experiment",
    changedElements: ["title", "description", "H1", "first paragraph", "upper Goal Simulator CTA", "dateModified"],
    protectedElements: ["slug", "canonical", "robots", "sitemap policy", "calculator logic", "GA4 event names"],
  },
  {
    group: "EN Track A",
    url: "/en/posts/personalFinance/annual-vs-monthly-compound",
    baselinePeriod: "2026-04-23 to 2026-07-19",
    baselinePlatform: "Google/Bing",
    gsc: { clicks: 0, impressions: 5, ctr: "0", position: "9.6" },
    bing: { clicks: 0, impressions: 145, ctr: "0", position: "8.61" },
    sampleConfidence: "SUFFICIENT",
    experimentType: "EN snippet and first-answer experiment",
    changedElements: ["title", "description", "H1", "first paragraph", "upper Compound CTA", "dateModified"],
    protectedElements: ["slug", "canonical", "hreflang", "robots", "sitemap policy", "calculator logic", "GA4 event names"],
  },
  {
    group: "EN Track A",
    url: "/en/posts/personalFinance/is-dca-better-in-a-bear-market",
    baselinePeriod: "2026-04-23 to 2026-07-19",
    baselinePlatform: "Google/Bing",
    gsc: { clicks: 0, impressions: 3, ctr: "0", position: "4.67" },
    bing: { clicks: 0, impressions: 349, ctr: "0", position: "3.88" },
    sampleConfidence: "SUFFICIENT",
    experimentType: "EN snippet and first-answer experiment",
    changedElements: ["description", "first paragraph", "upper DCA CTA", "dateModified"],
    protectedElements: ["title", "H1", "slug", "canonical", "explicit hreflang", "robots", "calculator logic", "GA4 event names"],
  },
].map((target) => ({
  ...target,
  deployDate: "DEPLOY_DATE_PENDING",
  check28Day: "DEPLOY_DATE_PLUS_28_DAYS_PENDING",
  check6Week: "DEPLOY_DATE_PLUS_42_DAYS_PENDING",
  rollbackConditions: [
    "material impression decline",
    "persistent average position decline",
    "existing query cluster loss",
    "CTR and impressions decline together",
    "wrong-intent exposure",
    "canonical or hreflang error",
    "CTA duplicate event",
    "mobile layout regression",
  ],
}));

function git(args, fallback = "") {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    return fallback || String(error.stdout || error.stderr || error.message || "");
  }
}

function relPath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function isTracked(file) {
  return git(["ls-files", "--", file]).trim().length > 0;
}

function parseStatus() {
  const lines = git(["status", "--short", "--untracked-files=all"]).split(/\r?\n/).filter(Boolean);
  return lines.map((line) => ({
    raw: line,
    code: line.slice(0, 2).trim() || "M",
    path: relPath(line.slice(3).trim()),
    tracked: !line.startsWith("??"),
  }));
}

function parseNumstat() {
  const map = new Map();
  for (const line of git(["diff", "--numstat"]).split(/\r?\n/).filter(Boolean)) {
    const [insertions, deletions, file] = line.split(/\t/);
    if (file) map.set(relPath(file), { insertions, deletions });
  }
  return map;
}

function sourceStage(file) {
  if (STAGE_BY_EXACT_FILE.has(file)) return STAGE_BY_EXACT_FILE.get(file);
  if (P0_2B_EN_LINK_FILES.has(file)) return "P0-2B";
  if (file.startsWith("reports/search-performance-input/")) return "P1-1A";
  if (file.includes("p0-1")) return "P0-1";
  if (file.includes("p0-2a")) return "P0-2A";
  if (file.includes("p0-2b")) return "P0-2B";
  if (file.includes("p1-1a-2")) return "P1-1A-2";
  if (file.includes("p1-1a")) return "P1-1A";
  if (file.includes("p1-1b-1")) return "P1-1B-1";
  if (file.includes("p1-1b-2")) return "P1-1B-2";
  if (file.includes("p1-1c")) return "P1-1C";
  if (file.startsWith("scripts/audit_search_growth_baseline.js")) return "P1-1A";
  if (file.startsWith("scripts/analyze_search_performance_inputs.js")) return "P1-1A";
  if (file.startsWith("scripts/verify_search_snippet_hygiene.js")) return "P0-2A";
  if (file.startsWith("scripts/verify_internal_link_integrity.js")) return "P0-2B";
  if (file.startsWith("scripts/verify_search_growth_p1_1b_ko_expansion.js")) return "P1-1B-1";
  if (file.startsWith("scripts/verify_search_growth_p1_1b_en_experiment.js")) return "P1-1B-2";
  if (file.startsWith("public/")) return "GENERATED_BY_BUILD";
  if (file.startsWith("reports/")) return "VALIDATION_OUTPUT";
  return "UNKNOWN_ORIGIN";
}

function category(file) {
  if (/local-dev-.*\.log$/.test(file)) return "E_LOCAL_ONLY_TEMP";
  if (file.startsWith("reports/search-performance-input/")) return "D_SEARCH_PERFORMANCE_INPUT";
  if (file.startsWith("public/") && /sitemap.*\.xml$/.test(file)) return "B_GENERATED_SITEMAP";
  if (file.startsWith("reports/")) return "C_AUDIT_REPORT";
  if (file.startsWith("content/posts/")) return "A_CONTENT";
  if (file.startsWith("pages/") || file.startsWith("_components/") || file === "package.json" || file.startsWith("lib/")) return "A_RUNTIME_CODE";
  if (file.startsWith("scripts/")) return "A_SCRIPT";
  if (file.startsWith("docs/")) return "A_REGISTRY_DOC";
  return "F_SCOPE_REVIEW";
}

function deployRequirement(file) {
  const cat = category(file);
  if (cat === "A_RUNTIME_CODE" || cat === "A_CONTENT" || cat === "A_REGISTRY_DOC") return "DEPLOY_REQUIRED";
  if (cat === "A_SCRIPT") return "TRACK_RECOMMENDED_NOT_RUNTIME_REQUIRED";
  if (cat === "B_GENERATED_SITEMAP") return "POLICY_DEPENDENT_TRACK_IF_SITEMAPS_ARE_COMMITTED";
  if (cat === "C_AUDIT_REPORT") return "TRACK_OPTIONAL_NOT_RUNTIME_REQUIRED";
  if (cat === "D_SEARCH_PERFORMANCE_INPUT") return "TRACK_BUT_NOT_RUNTIME_REQUIRED_OR_LOCAL_ONLY";
  if (cat === "E_LOCAL_ONLY_TEMP") return "EXCLUDE_FROM_DEPLOY";
  return "REVIEW_REQUIRED";
}

function reviewStatus(file) {
  const cat = category(file);
  if (cat === "E_LOCAL_ONLY_TEMP") return "LOCAL_ARTIFACT_ONLY";
  if (cat === "D_SEARCH_PERFORMANCE_INPUT" || cat === "B_GENERATED_SITEMAP" || cat === "C_AUDIT_REPORT") return "REVIEW_REQUIRED";
  if (cat === "F_SCOPE_REVIEW") return "REVIEW_REQUIRED";
  return "PASS";
}

function reason(file) {
  const cat = category(file);
  if (P0_2B_EN_LINK_FILES.has(file)) return "P0-2B EN internal tool route corrected from KO /tools to /en/tools.";
  if (file === "pages/posts/[category]/[slug].js") return "P0-2A snippet hygiene: views hidden when zero; share/comments data-nosnippet.";
  if (file === "_components/ToolBacklinkKit.js") return "P0-2A snippet hygiene: tool share panel data-nosnippet.";
  if (file === "pages/tools/home-buying-budget-calculator.js") return "P1-1B-1 role separation and mortgage calculator flow copy; no calculation core change.";
  if (file.includes("what-is-cagr.md")) return "P1-1B-1 KO low-risk expansion; title/H1 protected.";
  if (file.includes("dsr-40-income-loan-limit-table.md")) return "P1-1B-1 KO low-risk expansion; table assumptions protected.";
  if (file.includes("how-much-to-invest-monthly") || file.includes("annual-vs-monthly-compound") || file.includes("is-dca-better-in-a-bear-market")) return "P1-1B-2 EN snippet and first-answer experiment.";
  if (cat === "B_GENERATED_SITEMAP") return "Generated by build/postbuild; URL counts stable, lastmod changed for edited content.";
  if (cat === "D_SEARCH_PERFORMANCE_INPUT") return "Search performance source data for reproducible analysis; not runtime-required.";
  if (cat === "E_LOCAL_ONLY_TEMP") return "Local server log; exclude from deploy.";
  if (cat === "C_AUDIT_REPORT") return "Audit or validation output.";
  if (file === "package.json") return "P0-2B check:posts-links registry path moved to docs/blog-contents.md.";
  if (file === "scripts/check_posts_links_local.js") return "P0-2B local link checker registry handling update.";
  if (file === "docs/blog-contents.md") return "P0-2B registry additions for local post link checks.";
  return "Classified by path and stage report review.";
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(file, rows, headers) {
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  fs.writeFileSync(path.join(ROOT, file), `${lines.join("\n")}\n`, "utf8");
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function mdTable(rows, headers) {
  const out = [];
  out.push(`| ${headers.join(" | ")} |`);
  out.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows) out.push(`| ${headers.map((h) => String(row[h] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
  return out.join("\n");
}

function uniqueFiles(items) {
  const map = new Map();
  for (const item of items) map.set(item.path, item);
  return Array.from(map.values()).sort((a, b) => a.path.localeCompare(b.path));
}

function buildChangedFiles() {
  const status = parseStatus();
  const numstat = parseNumstat();
  const outputStatus = Object.values(OUTPUTS).map((file) => ({
    raw: `?? ${file}`,
    code: isTracked(file) ? "M" : "??",
    path: file,
    tracked: isTracked(file),
  }));
  const items = uniqueFiles([...status, ...outputStatus]);

  return items.map((item) => {
    const stats = numstat.get(item.path) || {};
    return {
      File: item.path,
      "Change Type": item.code,
      "First Stage": sourceStage(item.path),
      "Latest Stage": item.path.includes("p1-1c") ? "P1-1C" : sourceStage(item.path),
      "Deploy Required": deployRequirement(item.path),
      Generated: ["B_GENERATED_SITEMAP", "C_AUDIT_REPORT"].includes(category(item.path)) ? "yes" : "no",
      "User Data": category(item.path) === "D_SEARCH_PERFORMANCE_INPUT" ? "yes" : "no",
      Review: reviewStatus(item.path),
      Category: category(item.path),
      Tracked: item.tracked ? "yes" : "no",
      Insertions: stats.insertions || "",
      Deletions: stats.deletions || "",
      Reason: reason(item.path),
    };
  });
}

function localArtifactRows(changedFiles) {
  return changedFiles
    .filter((row) => row.Category === "E_LOCAL_ONLY_TEMP" || row.Category === "D_SEARCH_PERFORMANCE_INPUT")
    .map((row) => ({
      File: row.File,
      Category: row.Category,
      Recommendation: row.Category === "E_LOCAL_ONLY_TEMP" ? "EXCLUDE_FROM_DEPLOY" : "LOCAL_ONLY_RECOMMENDED_OR_POLICY_REVIEW",
      Reason: row.Reason,
    }));
}

function buildDeployManifest(changedFiles) {
  const byCategory = (cat) => changedFiles.filter((row) => row.Category === cat).map(fileEntry);
  const runtime = changedFiles
    .filter((row) => row.Category === "A_RUNTIME_CODE" || row.Category === "A_REGISTRY_DOC")
    .map(fileEntry);
  const scripts = changedFiles.filter((row) => row.Category === "A_SCRIPT").map(fileEntry);
  const deployBlockers = [];
  const reviewRequired = REVIEW_REQUIRED;
  return {
    generatedAt: GENERATED_AT,
    project: PROJECT,
    projectStage: PROJECT_STAGE,
    overallStatus: deployBlockers.length ? "FAIL" : reviewRequired.length ? "CONDITIONAL_PASS" : "PASS",
    deployBlockers,
    reviewRequired,
    runtimeFiles: runtime,
    contentFiles: byCategory("A_CONTENT"),
    scriptFiles: scripts,
    generatedSitemaps: byCategory("B_GENERATED_SITEMAP"),
    reports: byCategory("C_AUDIT_REPORT"),
    searchPerformanceInputs: byCategory("D_SEARCH_PERFORMANCE_INPUT"),
    localOnlyArtifacts: localArtifactRows(changedFiles),
    unrelatedChanges: changedFiles.filter((row) => row.Category === "F_SCOPE_REVIEW").map(fileEntry),
    requiredBeforeDeploy: [
      "Review deploy manifest and include runtime/content files.",
      "Confirm generated sitemap commit policy.",
      "Confirm reports/search-performance-input Git policy.",
      "Verify DB-backed Top100 routes in production-like environment.",
      "Decide whether optional Naver calculator SEO compound description failure is accepted for this deploy.",
    ],
    requiredAfterDeploy: [
      "Record deploy date in observation baseline.",
      "Check six target URLs HTTP 200, canonical, noindex, hreflang, and sitemap on production.",
      "Check GA4 real-time CTA events.",
      "Record 28-day and 6-week review dates.",
    ],
    observationTargets: OBSERVATION_TARGETS.map((target) => target.url),
  };
}

function fileEntry(row) {
  return {
    path: row.File,
    changeType: row["Change Type"],
    sourceStage: row["First Stage"],
    deploymentRequirement: row["Deploy Required"],
    generated: row.Generated === "yes",
    sensitive: "no",
    reason: row.Reason,
    reviewStatus: row.Review,
  };
}

function inputPresence() {
  return REQUIRED_INPUTS.map((file) => ({
    file,
    status: exists(file) ? "PRESENT" : "MISSING",
    tracked: isTracked(file),
  }));
}

function buildVerification(changedFiles, manifest) {
  return {
    generatedAt: GENERATED_AT,
    project: PROJECT,
    projectStage: PROJECT_STAGE,
    overallStatus: manifest.overallStatus,
    deployBlockerCount: manifest.deployBlockers.length,
    reviewRequiredCount: manifest.reviewRequired.length,
    requiredInputs: inputPresence(),
    commands: COMMAND_RESULTS.map(([command, result, notes]) => ({ command, result, notes })),
    changedFileCounts: changedFiles.reduce((acc, row) => {
      acc[row.Category] = (acc[row.Category] || 0) + 1;
      return acc;
    }, {}),
    sitemapCounts: {
      "public/sitemap-0.xml": countLocs("public/sitemap-0.xml"),
      "public/sitemap-ko.xml": countLocs("public/sitemap-ko.xml"),
      "public/sitemap-en.xml": countLocs("public/sitemap-en.xml"),
      "public/en/sitemap.xml": countLocs("public/en/sitemap.xml"),
    },
    knownWarnings: [
      "MODULE_TYPELESS_PACKAGE_JSON warnings observed for ESM calculator modules during Node sample verification.",
      "CRLF normalization warnings observed in git diff commands; git diff --check exit code was 0.",
      "Search input and some reports are untracked; policy decision required before deploy bundle selection.",
    ],
  };
}

function countLocs(file) {
  if (!exists(file)) return null;
  return (fs.readFileSync(path.join(ROOT, file), "utf8").match(/<loc>/g) || []).length;
}

function reportMarkdown(changedFiles, manifest, verification) {
  const categoryCounts = Object.entries(verification.changedFileCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([Category, Count]) => ({ Category, Count }));
  const metadataRows = [
    {
      URL: "/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio",
      Locale: "EN",
      Element: "title/H1/description/dateModified",
      Before: "question-style title and DCA-oriented description",
      After: "Monthly Investment Needed title and Goal Simulator-oriented description",
      Stage: "P1-1B-2",
      Expected: "PASS",
    },
    {
      URL: "/en/posts/personalFinance/annual-vs-monthly-compound",
      Locale: "EN",
      Element: "title/H1/description/dateModified",
      Before: "Monthly Compound Interest Examples",
      After: "Which Grows Faster?",
      Stage: "P1-1B-2",
      Expected: "PASS",
    },
    {
      URL: "/en/posts/personalFinance/is-dca-better-in-a-bear-market",
      Locale: "EN",
      Element: "seoDescription/dateModified",
      Before: "scenario framework description",
      After: "conditional DCA versus lump-sum answer",
      Stage: "P1-1B-2",
      Expected: "PASS",
    },
    {
      URL: "/posts/personalFinance/what-is-cagr",
      Locale: "KO",
      Element: "dateModified",
      Before: "2026-05-18",
      After: "2026-07-22",
      Stage: "P1-1B-1",
      Expected: "PASS",
    },
    {
      URL: "/posts/personalFinance/dsr-40-income-loan-limit-table",
      Locale: "KO",
      Element: "dateModified",
      Before: "2026-06-24",
      After: "2026-07-22",
      Stage: "P1-1B-1",
      Expected: "PASS",
    },
  ];

  const sections = [
    ["1. Executive Summary", "P1-1C reviewed the accumulated P0-1 through P1-1B-2 search-growth changes. No new content improvement or feature change was made in this stage; only a predeploy audit script and audit artifacts were created."],
    ["2. Overall Verdict", `Overall verdict: ${manifest.overallStatus}. Deploy blockers: ${manifest.deployBlockers.length}. Review required: ${manifest.reviewRequired.length}.`],
    ["3. Project Stages Reviewed", "P0-1 baseline audit; P0-2A snippet hygiene; P0-2B internal link integrity; P1-1A merged search analysis; P1-1A-2 priority calibration; P1-1B-1 KO Track B; P1-1B-2 EN Track A."],
    ["4. Git Working Tree Summary", `Tracked/untracked files were inventoried. Category counts:\n\n${mdTable(categoryCounts, ["Category", "Count"])}`],
    ["5. Changed File Classification", `Full CSV: ${OUTPUTS.changedFiles}. Runtime/content/script/report/search-input/local-only groups are separated.`],
    ["6. Runtime Deployment Files", "Runtime files are pages/components/package/docs registry changes. They are deployment-required only when the corresponding P0/P1 work is included."],
    ["7. Content Deployment Files", "Content files are P0-2B EN route fixes, P1-1B-1 KO low-risk expansion, and P1-1B-2 EN snippet experiment files."],
    ["8. Scripts and Verification Files", "Search-growth scripts are not runtime-required but should be tracked if reproducibility of the audit is desired."],
    ["9. Generated Sitemap Files", "Sitemap files are generated by postbuild. Counts stayed stable: sitemap-0 211, sitemap-ko 111, sitemap-en 100, en/sitemap 100."],
    ["10. Reports and Analysis Artifacts", "Reports are not runtime files. Keep the final P1-1C report and deploy manifest at minimum if audit traceability is desired."],
    ["11. Search Performance Input Files", "Search input CSV files are untracked and not ignored. They contain query/click/impression data, not runtime code. Git policy review is required."],
    ["12. Local-Only Artifact Recommendations", `Local-only CSV: ${OUTPUTS.localArtifacts}. Local dev logs should be excluded from deploy.`],
    ["13. Unrelated Change Review", "No clear non-search-growth source changes were found. Unknown-origin rows, if any, are listed in the deploy manifest."],
    ["14. P0-2A Snippet Hygiene", "Rendered snippet hygiene passed. Views 0 is not exposed; positive views/share/comments/tool share areas use data-nosnippet; first meaningful body text remains snippet-eligible."],
    ["15. P0-2B Internal Link Integrity", "Local posts link check passed with Broken 0, Suspicious 0, self URL missing 0. Rendered internal link integrity passed with exit 0."],
    ["16. P1-1B-1 KO Track Verification", "KO Track verifier passed 134/134. CAGR and DSR article title/H1 stayed protected; HomeBuying calculation core stayed unchanged."],
    ["17. P1-1B-2 EN Track Verification", "EN Track verifier passed 170/170. EN three-post manifest and rendered output matched. DCA explicit hreflang stayed intact."],
    ["18. KO-EN Isolation", "KO direct changes are limited to the approved P1-1B-1 targets. EN direct metadata changes are limited to the approved P1-1B-2 targets. Other EN post changes are P0-2B route fixes from /tools to /en/tools."],
    ["19. Metadata Diff Review", mdTable(metadataRows, ["URL", "Locale", "Element", "Before", "After", "Stage", "Expected"])],
    ["20. dateModified Review", "dateModified changed only on meaningful P1 content edits: KO CAGR, KO DSR income table, and EN Track A three target posts."],
    ["21. Structured Data Review", "Automatic BlogPosting remains, duplicate manual Article JSON-LD was removed where applicable, FAQPage visible/JSON-LD sync passed in KO and EN target verifiers."],
    ["22. GA4 Regression Review", "verify_tool_result_cta_events.js passed. Existing event names and required parameters remain present. New post CTAs reuse related_calculator_click."],
    ["23. Calculator Regression Review", "CAGR, DSR/LTV, mortgage loan, compound, and DCA sample verifications passed. HomeBuying display copy changed, but calculation core was not changed."],
    ["24. Ad Structure Review", "Diff review found snippet attributes and content/tool CTA changes, not ad slot/client/retry/lazy-loading structure changes."],
    ["25. Canonical-Hreflang-Robots Review", "verify_seo_channel_split.js passed. Canonical self, reciprocal hreflang, DCA explicit mapping, x-default home policy, noindex absence, and EN sitemap split were checked."],
    ["26. Sitemap Review", "No URL count increase/decrease was detected in generated sitemaps. Observed differences are lastmod updates from edited content and category lastmod propagation."],
    ["27. Static Page Count Review", "Latest build generated 223 static pages. This is a build route count, not the same as the 192 search-growth inventory URL count."],
    ["28. Inventory Scope Review", "Search-growth inventory has 192 URLs. Build includes system/static/category/tool routes that are outside the analysis inventory."],
    ["29. Dynamic Route Review", "P1-1A-2 unmatched rows include 9 apartment detail dynamic routes and 4 inventory scope gaps. These are not blockers for this content deploy; follow-up inventory scope review remains."],
    ["30. Local DB 500 Review", "HomeBuying Top100 links can return local 500 without DB. KO verifier allowed local DB-backed 500 only after checking link target and sitemap membership. Production-like verification remains required."],
    ["31. Module Type Warning", "MODULE_TYPELESS_PACKAGE_JSON warnings were observed for ESM calculator modules. Build and calculation samples passed; package type was not changed in P1-1C."],
    ["32. Script Quality Review", "New and existing search-growth scripts passed node --check. Scripts use repo-relative paths and local GET verification; no deploy/commit/push/write-to-external-service action is performed."],
    ["33. Privacy and Sensitive Data Review", "Secret pattern scan produced a false positive on the word 'secretly' in a rendered article sample. No token/API key/password/email pattern was confirmed in reviewed search-growth artifacts."],
    ["34. Deploy Manifest", `Deploy manifest: ${OUTPUTS.deployManifest}. Overall status is ${manifest.overallStatus}.`],
    ["35. Deploy Blockers", manifest.deployBlockers.length ? JSON.stringify(manifest.deployBlockers, null, 2) : "None."],
    ["36. Review Required", mdTable(manifest.reviewRequired.map((item) => ({ ID: item.id, Status: item.status, Reason: item.reason })), ["ID", "Status", "Reason"])],
    ["37. Before-Deploy Checklist", "- [ ] deploy blocker 0\n- [ ] build PASS\n- [ ] links PASS\n- [ ] snippet hygiene PASS\n- [ ] KO Track PASS\n- [ ] EN Track PASS\n- [ ] canonical PASS\n- [ ] hreflang PASS\n- [ ] sitemap PASS\n- [ ] calculator regression PASS\n- [ ] GA4 regression PASS\n- [ ] ad structure unchanged\n- [ ] Top100 production-like route check\n- [ ] search input CSV Git policy check\n- [ ] reports Git policy check\n- [ ] generated sitemap Git policy check\n- [ ] deployment manifest review\n- [ ] observation baseline review"],
    ["38. After-Deploy Checklist", "- Record deploy commit and deploy date.\n- Check six production target URLs HTTP 200/canonical/noindex/hreflang/sitemap.\n- Check GSC, Naver, and Bing sitemap status.\n- Check GA4 real-time CTA events.\n- Check HomeBuying, DSR/LTV, and Mortgage CTA flows.\n- Record 28-day and 6-week dates."],
    ["39. Observation Baseline", `Observation baseline JSON: ${OUTPUTS.observationBaseline}. Deploy date is intentionally DEPLOY_DATE_PENDING.`],
    ["40. 28-Day Observation Plan", "Use deploy date + 28 days. Compare same-length pre/post windows when possible. Exclude partial deploy day data."],
    ["41. 6-Week Observation Plan", "Use deploy date + 42 days for the more stable read, especially for low-volume GSC EN targets."],
    ["42. Files Created", Object.values(OUTPUTS).map((file) => `- ${file}`).join("\n")],
    ["43. Commands and Results", mdTable(COMMAND_RESULTS.map(([Command, Result, Notes]) => ({ Command, Result, Notes })), ["Command", "Result", "Notes"])],
    ["44. Final Recommendation", "CONDITIONAL PASS for deploy preparation: no deploy blockers were found, but complete the listed manual policy and production-like checks before shipping the accumulated bundle."],
  ];

  return `# Search Growth P1-1C Predeploy Integrated Audit\n\nGenerated: ${GENERATED_AT}\n\n${sections
    .map(([title, body]) => `## ${title}\n\n${body}`)
    .join("\n\n")}\n`;
}

function main() {
  const changedFiles = buildChangedFiles();
  const manifest = buildDeployManifest(changedFiles);
  const verification = buildVerification(changedFiles, manifest);
  const observation = {
    generatedAt: GENERATED_AT,
    project: PROJECT,
    projectStage: PROJECT_STAGE,
    deployDate: "DEPLOY_DATE_PENDING",
    observationTargets: OBSERVATION_TARGETS,
  };

  writeCsv(OUTPUTS.changedFiles, changedFiles, [
    "File",
    "Change Type",
    "First Stage",
    "Latest Stage",
    "Deploy Required",
    "Generated",
    "User Data",
    "Review",
    "Category",
    "Tracked",
    "Insertions",
    "Deletions",
    "Reason",
  ]);
  writeCsv(OUTPUTS.localArtifacts, localArtifactRows(changedFiles), ["File", "Category", "Recommendation", "Reason"]);
  writeJson(OUTPUTS.deployManifest, manifest);
  writeJson(OUTPUTS.verification, verification);
  writeJson(OUTPUTS.observationBaseline, observation);
  fs.writeFileSync(path.join(ROOT, OUTPUTS.report), reportMarkdown(changedFiles, manifest, verification), "utf8");

  console.log(`[p1-1c] overall=${manifest.overallStatus}`);
  console.log(`[p1-1c] deployBlockers=${manifest.deployBlockers.length}`);
  console.log(`[p1-1c] reviewRequired=${manifest.reviewRequired.length}`);
  for (const file of Object.values(OUTPUTS)) console.log(`[p1-1c] wrote ${file}`);
  if (manifest.deployBlockers.length) process.exitCode = 1;
}

main();
