const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const Module = require("module");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function runGit(args) {
  return childProcess
    .execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertOrder(source, relPath, first, second, label) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assert(firstIndex !== -1, `${relPath}: missing ${first}`);
  assert(secondIndex !== -1, `${relPath}: missing ${second}`);
  assert(firstIndex < secondIndex, `${relPath}: order failed for ${label}`);
}

function countMatches(source, regex) {
  return (source.match(regex) || []).length;
}

function allChangedPaths() {
  return [
    ...runGit(["diff", "--name-only"]),
    ...runGit(["ls-files", "--others", "--exclude-standard"]),
  ].map((entry) => entry.replace(/\\/g, "/"));
}

function loadFireModule() {
  const firePath = path.join(root, "lib", "fire.js");
  const source = fs
    .readFileSync(firePath, "utf8")
    .replace(/export function /g, "function ");
  const compiled = `${source}
module.exports = {
  calcFireTarget,
  calcNetRealReturn,
  mapFireParamsToRetirementInput,
  runFireSimulation,
};`;
  const mod = new Module(firePath, module);
  mod.filename = firePath;
  mod.paths = Module._nodeModulePaths(path.dirname(firePath));
  mod._compile(compiled, firePath);
  return mod.exports;
}

function verifyPageBasics() {
  const goal = read("pages/tools/goal-simulator.js");
  const fire = read("pages/tools/fire-calculator.js");

  assert(countMatches(goal, /<h1\b/g) === 1, "goal page must have exactly one h1");
  assert(countMatches(fire, /<h1\b/g) === 1, "fire page must have exactly one h1");

  assert(goal.includes("목표자산·목표 금액 계산기"), "goal title must expose target-amount intent");
  assert(goal.includes("필요한 월 투자액, 기간, 수익률"), "goal description must match solver features");
  assert(goal.includes("목표 금액까지 매달 얼마가 필요할까요?"), "goal intro must expose primary intent");
  assert(goal.includes("<GoalForm"), "goal form must be present");
  assertOrder(goal, "pages/tools/goal-simulator.js", "<GoalForm", "프리미엄 옵션", "goal form before optional panels");
  assertOrder(goal, "pages/tools/goal-simulator.js", "<GoalForm", "{t.toolHubTitle}", "goal form before related tools section");
  assertOrder(goal, "pages/tools/goal-simulator.js", "<GoalForm", '{locale === "ko" ? "추천 가이드 글"', "goal form before guide links");

  assert(fire.includes("은퇴자금 계산기 | 노후자금 계산기·은퇴 생활비·FIRE 계산기"), "fire title must expose retirement intent");
  assert(fire.includes("현재 자산, 연 지출, 저축액, 출금률"), "fire description must match modeled inputs");
  assert(!fire.includes("국민연금·개인연금 반영 전후"), "fire page must not promise pension before/after modeling");
  assert(fire.includes("<FireForm"), "fire form must be present");
  assertOrder(fire, "pages/tools/fire-calculator.js", "<ToolSharePanel", "<FireForm", "share before form");
  assertOrder(fire, "pages/tools/fire-calculator.js", "<FireForm", "<FireHero", "fire form before hero");
  assertOrder(fire, "pages/tools/fire-calculator.js", "<FireForm", "은퇴 생활비별 필요자금 표", "fire form before explanatory table");
  assertOrder(fire, "pages/tools/fire-calculator.js", "<FireForm", "<RetirementDetailSimulator", "fire form before detailed simulator");

  assert(goal.includes('url="/tools/goal-simulator"'), "goal self canonical route must remain explicit");
  assert(fire.includes('const pageUrl = "/tools/fire-calculator"'), "fire self canonical route must remain explicit");
  assert(!/noindex/i.test(goal), "goal page must not contain noindex");
  assert(!/noindex/i.test(fire), "fire page must not contain noindex");
  assert(goal.includes("@type\": \"SoftwareApplication") || goal.includes('"@type": "SoftwareApplication"'), "goal structured data must remain present");
  assert(fire.includes('"@type": "WebApplication"'), "fire structured data must remain present");
}

function verifyNumericParity() {
  const changed = new Set(allChangedPaths());
  assert(!changed.has("lib/goalSimulator.js"), "goal math core changed unexpectedly");
  assert(!changed.has("lib/fire.js"), "fire math core changed unexpectedly");

  const goalCore = require(path.join(root, "lib", "goalSimulator"));
  const goalParams = {
    current: 0,
    monthly: 1_000_000,
    annualRate: 0,
    years: 1,
    target: 12_000_000,
    compounding: "monthly",
    taxRatePercent: 0,
    feeRatePercent: 0,
    valueKey: "valueNet",
  };
  const goalRows = goalCore.simulateGoalPath(goalParams);
  const goalSummary = goalCore.summarizeTargetAssetRows(goalRows, goalParams);
  assert(goalRows.length === 1, "goal sample should produce one yearly row");
  assert(goalSummary.finalNet === 12_000_000, "goal sample final net mismatch");
  assert(goalSummary.totalInvested === 12_000_000, "goal sample invested amount mismatch");
  assert(goalCore.findFirstReachMonth(goalParams) === 12, "goal sample reach month mismatch");
  assert(Math.abs(goalCore.solveRequiredMonthly(goalParams) - 1_000_000) < 0.01, "goal sample required monthly mismatch");

  const fireCore = loadFireModule();
  assert(fireCore.calcFireTarget(36_000_000, 4) === 900_000_000, "fire target formula mismatch");
  const fireResult = fireCore.runFireSimulation({
    currentAsset: 900_000_000,
    annualSpending: 36_000_000,
    annualReturnPct: 0,
    monthlyContribution: 0,
    annualContribution: 0,
    accumulationYears: 1,
    withdrawRatePct: 4,
    taxRatePct: 0,
    feeRatePct: 0,
    inflationPct: 0,
  });
  assert(fireResult.fireTarget === 900_000_000, "fire sample target mismatch");
  assert(fireResult.canFireAtEnd === true, "fire sample should be ready at target");
  assert(fireResult.retirement.depletionYear === 25, "fire sample depletion year mismatch");
  assert(fireResult.timeline.length === 61, "fire sample timeline length mismatch");
}

function verifyScopeIntegrity() {
  const changed = allChangedPaths();
  const protectedPrefixes = [
    "pages/tools/dsr-ltv-calculator",
    "pages/tools/home-buying-budget-calculator",
    "pages/tools/mortgage-loan-calculator",
    "pages/tools/compound-interest",
    "pages/tools/dca-calculator",
    "pages/tools/cagr-calculator",
    "pages/market/real-estate",
    "pages/api/re",
    "_components/RealEstateTop100Landing",
    "_components/RealEstateSeoLanding",
    "_components/Header",
    "_components/Footer",
    "_components/SeoHead",
    "pages/_app",
    "pages/_document",
    "public/sitemap",
    "public/robots",
    "next-sitemap",
  ];
  const illegal = changed.filter((entry) =>
    protectedPrefixes.some((prefix) => entry.startsWith(prefix))
  );
  assert(illegal.length === 0, `protected scope changed: ${illegal.join(", ")}`);
}

function main() {
  verifyPageBasics();
  verifyNumericParity();
  verifyScopeIntegrity();

  console.log("PASS verify_naver_goal_fire_search_p1");
  console.log("- Goal/FIRE h1, intent copy, calculator order, noindex, structured data: OK");
  console.log("- Goal/FIRE numeric parity and math-core immutability: OK");
  console.log("- Protected cohort, sitemap, robots, canonical/hreflang plumbing: OK");
}

main();
