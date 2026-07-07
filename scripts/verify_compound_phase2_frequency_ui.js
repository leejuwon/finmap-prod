const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { simulateCompoundPlan } = require("../lib/compoundCore");
const {
  COMPOUND_FREQUENCY_COMPARE_FIXTURES,
  calcAnnualCompoundForComparison,
} = require("../lib/compoundFrequencyCompare");

const ROOT = path.join(__dirname, "..");
const PAGE_PATH = path.join(ROOT, "pages", "tools", "compound-interest.js");
const COMPONENT_PATH = path.join(ROOT, "_components", "CompoundFrequencyComparePanel.js");
const page = fs.readFileSync(PAGE_PATH, "utf8");
const component = fs.existsSync(COMPONENT_PATH) ? fs.readFileSync(COMPONENT_PATH, "utf8") : "";

const BASELINE_HASHES = {
  "lib/compoundCore.js": "9ea424f60ffd9305b8af9c34ef70475db8f330ca2be58fcd6464d00316726b6e",
  "lib/compound.js": "7dac56894523f9f1566b3f6f559212b77f48b356c85fa1bea153849f0cbb9476",
  "lib/compoundFrequencyCompare.js": "4c4ca4f1048354764aeb3773ce6ed132535d18e8cb5fa7bb267c8e48bb954958",
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

const monthlyA = simulateCompoundPlan(monthlyInput(COMPOUND_FREQUENCY_COMPARE_FIXTURES.A));
const monthlyB = simulateCompoundPlan(monthlyInput(COMPOUND_FREQUENCY_COMPARE_FIXTURES.B));
const annualA = calcAnnualCompoundForComparison(COMPOUND_FREQUENCY_COMPARE_FIXTURES.A);
const annualB = calcAnnualCompoundForComparison(COMPOUND_FREQUENCY_COMPARE_FIXTURES.B);
const quickIndexes = matchIndexes(page, /<CompoundQuickComparePanel\b/g);
const frequencyIndexes = matchIndexes(page, /<CompoundFrequencyComparePanel\b/g);
const actionIndexes = matchIndexes(page, /<CompoundResultActions\b/g);
const faqIndex = page.indexOf("{/* FAQ */}");
const faqCounts = readFaqCounts();

const orderedInBothBranches =
  quickIndexes.length === 2 &&
  frequencyIndexes.length === 2 &&
  actionIndexes.length === 2 &&
  quickIndexes.every((index, branch) => index < frequencyIndexes[branch] && frequencyIndexes[branch] < actionIndexes[branch]);

const checks = [
  ["Frequency comparison component exists", fs.existsSync(COMPONENT_PATH)],
  ["Annual comparison helper is imported by the page", page.includes('import { calcAnnualCompoundForComparison } from "../../lib/compoundFrequencyCompare"')],
  ["Frequency component is imported by the page", page.includes('import CompoundFrequencyComparePanel from "../../_components/CompoundFrequencyComparePanel"')],
  ["Annual result is calculated only after a result exists", page.includes("if (!hasResult) return null;") && page.includes("const annualFrequencyResult = useMemo")],
  ["Effective tax and fee states feed annual comparison", page.includes("taxRatePercent: taxRatePercentState") && page.includes("feeRatePercent: feeRatePercentState")],
  ["Frequency panel renders in both exclusive result branches", frequencyIndexes.length === 2],
  ["Quick Comparison -> Frequency Compare -> Result Actions order holds", orderedInBothBranches],
  ["Result actions remain before FAQ", actionIndexes.length === 2 && actionIndexes.every((index) => index < faqIndex)],
  ["ToolResultCta source remains singular", countMatches(page, /<ToolResultCta\b/g) === 1],
  ["Panel has KO and EN titles", component.includes("월복리 vs 연복리 비교") && component.includes("Monthly vs Annual Compounding")],
  ["Panel renders both comparison cards", component.includes("monthlyResult") && component.includes("annualResult") && component.includes("afterTaxFinalAmount")],
  ["Panel shows principal, gain and present value", component.includes("principalTotal") && component.includes("afterTaxInvestmentGain") && component.includes("presentValue")],
  ["Difference amount and percentage are calculated", component.includes("monthlyFinal - annualFinal") && component.includes("difference / annualFinal * 100")],
  ["KO conservative simulation disclosure exists", component.includes("교육용 보수적 시뮬레이션")],
  ["EN conservative simulation disclosure exists", component.includes("conservative educational simulation")],
  ["Frequency comparison view event exists", component.includes('trackGaEvent("tool_frequency_compare_view"')],
  ["View event uses 50 percent observer and one-result signature guard", component.includes("intersectionRatio >= 0.5") && component.includes("trackedSignatureRef.current === resultSignature")],
  ["Frequency panel stays inside the PDF result flow", page.indexOf('id="pdf-target"') < frequencyIndexes[0] && !component.includes("fm-export-exclude")],
  ["Result actions remain excluded from PDF", page.includes('className="fm-export-exclude grid gap-6"') && page.includes('data-html2canvas-ignore="true"')],
  ["Default monthly result remains 6,600.2만원", (monthlyA.afterTaxFinalAmount / 10_000).toFixed(1) === "6600.2"],
  ["Tax and fee OFF monthly result remains 7,202.2만원", (monthlyB.afterTaxFinalAmount / 10_000).toFixed(1) === "7202.2"],
  ["Annual Sample A remains 64,063,196원", annualA.rounded.afterTaxFinalAmount === 64_063_196],
  ["Annual Sample B remains 69,410,726원", annualB.rounded.afterTaxFinalAmount === 69_410_726],
  ["Compound core hash is unchanged", hashFile("lib/compoundCore.js") === BASELINE_HASHES["lib/compoundCore.js"]],
  ["Compound wrapper hash is unchanged", hashFile("lib/compound.js") === BASELINE_HASHES["lib/compound.js"]],
  ["Frequency helper and fixtures hash is unchanged", hashFile("lib/compoundFrequencyCompare.js") === BASELINE_HASHES["lib/compoundFrequencyCompare.js"]],
  ["KO SEO title and description remain unchanged", page.includes('"복리 계산기 | 월복리·적립식 투자 미래가치 계산"') && page.includes("원금, 월 적립금, 연 수익률, 투자 기간으로 월복리 기준 미래가치를 계산합니다.")],
  ["EN SEO title and description remain unchanged", page.includes('"Compound Interest Calculator: Future Value, Monthly Contributions & Taxes"') && page.includes("Calculate future value with principal, monthly contributions, annual return and years using monthly compounding.")],
  ["FAQ counts remain KO 24 / EN 8", faqCounts.ko === 24 && faqCounts.en === 8],
  ["FAQPage JSON-LD remains single", countMatches(page, /"@type":\s*"FAQPage"/g) === 1],
];

console.log("Compound Phase 2-2B frequency comparison UI verification");
console.log("-------------------------------------------------------");
for (const [name, pass] of checks) console.log(`${pass ? "PASS" : "FAIL"}\t${name}`);

const failed = checks.filter(([, pass]) => !pass);
if (failed.length) {
  console.error(`FAIL: ${failed.length} check(s) failed`);
  process.exit(1);
}

console.log("All Phase 2-2B frequency comparison UI checks PASS");
