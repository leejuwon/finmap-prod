const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { simulateCompoundPlan } = require("../lib/compoundCore");
const {
  COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES,
  calcContributionScenario,
} = require("../lib/compoundContributionScenario");

const ROOT = path.join(__dirname, "..");
const PAGE_PATH = path.join(ROOT, "pages", "tools", "compound-interest.js");
const COMPONENT_PATH = path.join(ROOT, "_components", "CompoundContributionScenarioPanel.js");
const page = fs.readFileSync(PAGE_PATH, "utf8");
const component = fs.existsSync(COMPONENT_PATH) ? fs.readFileSync(COMPONENT_PATH, "utf8") : "";

const BASELINE_HASHES = {
  "lib/compoundCore.js": "9ea424f60ffd9305b8af9c34ef70475db8f330ca2be58fcd6464d00316726b6e",
  "lib/compound.js": "7dac56894523f9f1566b3f6f559212b77f48b356c85fa1bea153849f0cbb9476",
  "lib/compoundFrequencyCompare.js": "4c4ca4f1048354764aeb3773ce6ed132535d18e8cb5fa7bb267c8e48bb954958",
  "lib/compoundContributionScenario.js": "5e7952b282ac51da191ff83a8e1ec68261478160e865cc4afe6555922f8fd062",
};

function hashFile(relativePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(ROOT, relativePath)))
    .digest("hex");
}

function countMatches(input, pattern) {
  return (input.match(pattern) || []).length;
}

function matchIndexes(input, pattern) {
  return [...input.matchAll(pattern)].map((match) => match.index);
}

function readFaqCounts() {
  const start = page.indexOf("const faqItems = useMemo");
  const end = page.indexOf("const faqJsonLd = useMemo", start);
  const block = page.slice(start, end);
  const koStart = block.indexOf("? [");
  const enStart = block.indexOf("\n        : [", koStart);
  const enEnd = block.lastIndexOf("],");
  return {
    ko: countMatches(block.slice(koStart, enStart), /\bq:\s*"/g),
    en: countMatches(block.slice(enStart, enEnd), /\bq:\s*"/g),
  };
}

function monthlyInput(fixture) {
  return {
    initialAmount: fixture.principal,
    monthlyContribution: fixture.monthly,
    annualReturn: fixture.annualRate,
    years: fixture.years,
    taxRate: fixture.taxRatePercent,
    feeRate: fixture.feeRatePercent,
    inflationRate: fixture.inflationRate,
    baseYear: fixture.baseYear,
  };
}

const frequencyIndexes = matchIndexes(page, /<CompoundFrequencyComparePanel\b/g);
const contributionIndexes = matchIndexes(page, /<CompoundContributionScenarioPanel\b/g);
const actionIndexes = matchIndexes(page, /<CompoundResultActions\b/g);
const faqIndex = page.indexOf("{/* FAQ */}");
const faqCounts = readFaqCounts();
const monthlyA = simulateCompoundPlan(monthlyInput(COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES.A));
const monthlyB = simulateCompoundPlan(monthlyInput(COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES.B));
const fixtures = Object.fromEntries(
  Object.entries(COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES)
    .map(([id, input]) => [id, calcContributionScenario(input)])
);

const orderedInBothBranches =
  frequencyIndexes.length === 2 &&
  contributionIndexes.length === 2 &&
  actionIndexes.length === 2 &&
  frequencyIndexes.every((index, branch) =>
    index < contributionIndexes[branch] && contributionIndexes[branch] < actionIndexes[branch]
  );

const checks = [
  ["Contribution scenario component exists", fs.existsSync(COMPONENT_PATH)],
  ["Contribution helper is imported by the component", component.includes('import { calcContributionScenario } from "../lib/compoundContributionScenario"')],
  ["Contribution component is imported by the page", page.includes('import CompoundContributionScenarioPanel from "../../_components/CompoundContributionScenarioPanel"')],
  ["Contribution panel renders in both exclusive result branches", contributionIndexes.length === 2],
  ["Frequency Compare -> Contribution Scenario -> Result Actions order holds", orderedInBothBranches],
  ["Result actions remain before FAQ", actionIndexes.length === 2 && actionIndexes.every((index) => index < faqIndex)],
  ["ToolResultCta source remains singular", countMatches(page, /<ToolResultCta\b/g) === 1],
  ["Panel is a closed details disclosure by default", component.includes("<details") && !/<details[^>]*\sopen(?:=|\s|>)/.test(component)],
  ["Panel has KO and EN titles", component.includes("적립금 증가·추가 납입 시나리오") && component.includes("Contribution Growth & Extra Deposit Scenario")],
  ["Growth input and 0/3/5/10 presets exist", component.includes("contribution-growth-rate") && [0, 3, 5, 10].every((value) => component.includes(String(value)))],
  ["Four scenario presets exist", ["no_growth", "growth_5", "extra_year_3", "growth_5_extra_year_3"].every((value) => component.includes(value))],
  ["KRW extra deposit uses ten-thousand-won input scale", component.includes('currency === "KRW" ? 10_000 : 1')],
  ["USD default extra deposit is 5000", component.includes('currency === "KRW" ? 500 : 5_000')],
  ["Year and month convert to one-based investment month", component.includes("(Number(extraYear) - 1) * 12 + Number(extraMonthOfYear)")],
  ["Default scenario maps to fixture E inputs", component.includes("useState(5)") && component.includes("useState(defaultExtraAmount)") && component.includes("useState(Math.min(3, maxYears))") && component.includes("useState(1)")],
  ["Base and scenario cards show required amounts", ["principalTotal", "afterTaxFinalAmount", "afterTaxInvestmentGain", "presentValue"].every((field) => component.includes(field))],
  ["Contribution and return differences are separated", component.includes("Additional contributions") && component.includes("After-tax final value change") && component.includes("After-tax gain change")],
  ["KO separate-comparison disclosure exists", component.includes("기본 계산값을 바꾸지 않는 별도 비교")],
  ["EN separate-comparison disclosure exists", component.includes("does not change the base result")],
  ["Scenario view event exists", component.includes('trackGaEvent("tool_contribution_scenario_view"')],
  ["Scenario view uses 50 percent observer and signature guard", component.includes("intersectionRatio >= 0.5") && component.includes("trackedSignatureRef.current === resultSignature")],
  ["Preset click event exists", component.includes('trackGaEvent("tool_contribution_scenario_preset_click"') && component.includes("preset_type: presetType")],
  ["Raw input changes do not call GA directly", countMatches(component, /trackGaEvent\(/g) === 2 && !/onChange=\{[^}]*trackGaEvent/.test(component)],
  ["Panel stays inside PDF flow and is not excluded", page.indexOf('id="pdf-target"') < contributionIndexes[0] && !component.includes("fm-export-exclude")],
  ["Result actions remain excluded from PDF", page.includes('className="fm-export-exclude grid gap-6"') && page.includes('data-html2canvas-ignore="true"')],
  ["Default monthly result remains 6,600.2만원", (monthlyA.afterTaxFinalAmount / 10_000).toFixed(1) === "6600.2"],
  ["Tax and fee OFF result remains 7,202.2만원", (monthlyB.afterTaxFinalAmount / 10_000).toFixed(1) === "7202.2"],
  ["Fixture E remains 84,905,411원", fixtures.E.rounded.afterTaxFinalAmount === 84_905_411],
  ["All A-H contribution fixtures remain valid", Object.keys(fixtures).join("") === "ABCDEFGH" && Object.values(fixtures).every((result) => result.ok)],
  ["Compound core hash is unchanged", hashFile("lib/compoundCore.js") === BASELINE_HASHES["lib/compoundCore.js"]],
  ["Compound wrapper hash is unchanged", hashFile("lib/compound.js") === BASELINE_HASHES["lib/compound.js"]],
  ["Frequency helper hash is unchanged", hashFile("lib/compoundFrequencyCompare.js") === BASELINE_HASHES["lib/compoundFrequencyCompare.js"]],
  ["Contribution helper and fixtures hash is unchanged", hashFile("lib/compoundContributionScenario.js") === BASELINE_HASHES["lib/compoundContributionScenario.js"]],
  ["KO SEO title and description remain unchanged", page.includes('"복리 계산기 | 월복리·적립식 투자 미래가치 계산"') && page.includes("원금, 월 적립금, 연 수익률, 투자 기간으로 월복리 기준 미래가치를 계산합니다.")],
  ["EN SEO title and description remain unchanged", page.includes('"Compound Interest Calculator: Future Value, Monthly Contributions & Taxes"') && page.includes("Calculate future value with principal, monthly contributions, annual return and years using monthly compounding.")],
  ["FAQ counts remain KO 24 / EN 8", faqCounts.ko === 24 && faqCounts.en === 8],
  ["FAQPage JSON-LD remains single", countMatches(page, /"@type":\s*"FAQPage"/g) === 1],
];

console.log("Compound Phase 2-3B contribution scenario UI verification");
console.log("-------------------------------------------------------");
for (const [name, pass] of checks) console.log(`${pass ? "PASS" : "FAIL"}\t${name}`);

const failed = checks.filter(([, pass]) => !pass);
if (failed.length) {
  console.error(`FAIL: ${failed.length} check(s) failed`);
  process.exit(1);
}

console.log("All Phase 2-3B contribution scenario UI checks PASS");
