const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { simulateCompoundPlan } = require("../lib/compoundCore");
const {
  COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES,
  calcContributionScenario,
} = require("../lib/compoundContributionScenario");

const ROOT = path.join(__dirname, "..");
const HELPER_PATH = path.join(ROOT, "lib", "compoundContributionScenario.js");
const PAGE_PATH = path.join(ROOT, "pages", "tools", "compound-interest.js");
const page = fs.readFileSync(PAGE_PATH, "utf8");

const BASELINE_HASHES = {
  "lib/compoundCore.js": "9ea424f60ffd9305b8af9c34ef70475db8f330ca2be58fcd6464d00316726b6e",
  "lib/compound.js": "7dac56894523f9f1566b3f6f559212b77f48b356c85fa1bea153849f0cbb9476",
  "lib/compoundFrequencyCompare.js": "4c4ca4f1048354764aeb3773ce6ed132535d18e8cb5fa7bb267c8e48bb954958",
  "pages/tools/compound-interest.js": "1cb38b68fbca29a65ce10221116f907ca665cf7b487ca7c3dde56ac2486c3483",
  "_components/CompoundForm.js": "c7fde4f5f9ad6fb74278e6cfd65caa0a21387eb8709ef67899d481d554aa2805",
  "_components/CompoundQuickComparePanel.js": "cc508ba10ce5686d3db7ead8e0721891c2ec4feb70a21d3c45939ff67b055d97",
  "_components/CompoundFrequencyComparePanel.js": "1a14cbf29163f7f5184df2942d64ba05e317eabaa6bfda77c726e8c7631bf254",
  "_components/CompoundDetailSummary.js": "86952ed5ac6e4cc2a4275beaa1aa0d204f8af261322595bd61e695ee401e68e4",
};

const EXPECTED = {
  A: { principalTotal: 46_000_000, pretaxFinalAmount: 69_642_784, tax: 3_640_989, afterTaxFinalAmount: 66_001_795, presentValue: 66_001_795 },
  B: { principalTotal: 46_000_000, pretaxFinalAmount: 72_022_056, tax: 0, afterTaxFinalAmount: 72_022_056, presentValue: 72_022_056 },
  C: { principalTotal: 55_280_413, pretaxFinalAmount: 81_034_876, tax: 3_966_187, afterTaxFinalAmount: 77_068_689, presentValue: 77_068_689 },
  D: { principalTotal: 51_000_000, pretaxFinalAmount: 77_995_883, tax: 4_157_366, afterTaxFinalAmount: 73_838_517, presentValue: 73_838_517 },
  E: { principalTotal: 60_280_413, pretaxFinalAmount: 89_387_975, tax: 4_482_565, afterTaxFinalAmount: 84_905_411, presentValue: 84_905_411 },
  F: { principalTotal: 60_280_413, pretaxFinalAmount: 60_280_413, tax: 0, afterTaxFinalAmount: 60_280_413, presentValue: 60_280_413 },
  G: { principalTotal: 51_000_000, pretaxFinalAmount: 41_243_699, tax: 0, afterTaxFinalAmount: 41_243_699, presentValue: 41_243_699 },
  H: { principalTotal: 60_280_413, pretaxFinalAmount: 89_387_975, tax: 4_482_565, afterTaxFinalAmount: 84_905_411, presentValue: 66_327_971 },
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

function expectedMatches(result, expected) {
  return result.ok && Object.entries(expected).every(([field, value]) => result.rounded[field] === value);
}

function monthlyCoreInput(fixture) {
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

function resultIsFinite(result) {
  if (!result.ok) return false;
  const resultValues = [
    result.principalTotal,
    result.pretaxFinalAmount,
    result.pretaxInvestmentGain,
    result.tax,
    result.feeDrag,
    result.afterTaxFinalAmount,
    result.afterTaxInvestmentGain,
    result.presentValue,
  ];
  const monthlyFinite = result.monthlySummary.every((row) => [
    row.currentMonthly,
    row.contributionThisMonth,
    row.closingBalancePretax,
    row.principalTotal,
  ].every(Number.isFinite));
  const yearlyFinite = result.yearSummary.every((row) => [
    row.contributionYear,
    row.closingBalancePretax,
    row.principalTotal,
  ].every(Number.isFinite));
  return resultValues.every(Number.isFinite) && monthlyFinite && yearlyFinite;
}

const results = Object.fromEntries(
  Object.entries(COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES)
    .map(([id, input]) => [id, calcContributionScenario(input)])
);
const coreA = simulateCompoundPlan(monthlyCoreInput(COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES.A));
const coreB = simulateCompoundPlan(monthlyCoreInput(COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES.B));
const faqCounts = readFaqCounts();

const outsideMonth = calcContributionScenario({
  ...COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES.D,
  extraContributionMonth: 121,
});
const fractionalYears = calcContributionScenario({
  ...COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES.A,
  years: 10.5,
});
const invalidGrowth = calcContributionScenario({
  ...COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES.A,
  monthlyGrowthRatePercent: -100,
});

const checks = [
  ["Contribution scenario helper exists", fs.existsSync(HELPER_PATH)],
  ["Fixtures A-H are defined", Object.keys(COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES).join("") === "ABCDEFGH"],
  ["All A-H fixtures match locked rounded results", Object.entries(EXPECTED).every(([id, expected]) => expectedMatches(results[id], expected))],
  ["Sample A matches existing 6,600.2만원 result", (results.A.afterTaxFinalAmount / 10_000).toFixed(1) === "6600.2" && results.A.rounded.afterTaxFinalAmount === coreA.rounded.afterTaxFinalAmount],
  ["Sample B matches existing 7,202.2만원 result", (results.B.afterTaxFinalAmount / 10_000).toFixed(1) === "7202.2" && results.B.rounded.afterTaxFinalAmount === coreB.rounded.afterTaxFinalAmount],
  ["Sample C principal increases over A", results.C.principalTotal > results.A.principalTotal],
  ["Sample C final amount increases over A", results.C.afterTaxFinalAmount > results.A.afterTaxFinalAmount],
  ["Sample D principal is exactly KRW 5m above A", results.D.rounded.principalTotal - results.A.rounded.principalTotal === 5_000_000],
  ["Sample D final amount increases over A", results.D.afterTaxFinalAmount > results.A.afterTaxFinalAmount],
  ["Sample E principal increases over C", results.E.principalTotal > results.C.principalTotal],
  ["Sample E principal increases over D", results.E.principalTotal > results.D.principalTotal],
  ["Sample E final amount is at least D", results.E.afterTaxFinalAmount >= results.D.afterTaxFinalAmount],
  ["Sample E final amount exceeds A, C and D", results.E.afterTaxFinalAmount > Math.max(results.A.afterTaxFinalAmount, results.C.afterTaxFinalAmount, results.D.afterTaxFinalAmount)],
  ["Sample F tax is zero", results.F.tax === 0],
  ["Sample F final amount equals principal", results.F.afterTaxFinalAmount === results.F.principalTotal],
  ["Sample G tax is zero", results.G.tax === 0],
  ["Sample G pretax gain is negative", results.G.pretaxInvestmentGain < 0],
  ["Sample H nominal final amount equals E", results.H.afterTaxFinalAmount === results.E.afterTaxFinalAmount],
  ["Sample H present value is below final amount", results.H.presentValue < results.H.afterTaxFinalAmount],
  ["Extra contribution month outside the period is rejected", !outsideMonth.ok && outsideMonth.errors.some((error) => error.field === "extraContributionMonth")],
  ["Fractional years are rejected", !fractionalYears.ok && fractionalYears.errors.some((error) => error.field === "years")],
  ["Monthly growth of -100 percent is rejected", !invalidGrowth.ok && invalidGrowth.errors.some((error) => error.field === "monthlyGrowthRatePercent")],
  ["All fixture results and summaries are finite", Object.values(results).every(resultIsFinite)],
  ["All fixtures contain 120 monthly and 10 yearly rows", Object.values(results).every((result) => result.monthlySummary.length === 120 && result.yearSummary.length === 10)],
  ["Compound core hash is unchanged", hashFile("lib/compoundCore.js") === BASELINE_HASHES["lib/compoundCore.js"]],
  ["Compound wrapper hash is unchanged", hashFile("lib/compound.js") === BASELINE_HASHES["lib/compound.js"]],
  ["Frequency helper hash is unchanged", hashFile("lib/compoundFrequencyCompare.js") === BASELINE_HASHES["lib/compoundFrequencyCompare.js"]],
  ["Compound page hash is unchanged", hashFile("pages/tools/compound-interest.js") === BASELINE_HASHES["pages/tools/compound-interest.js"]],
  ["Compound form hash is unchanged", hashFile("_components/CompoundForm.js") === BASELINE_HASHES["_components/CompoundForm.js"]],
  ["Quick Comparison UI hash is unchanged", hashFile("_components/CompoundQuickComparePanel.js") === BASELINE_HASHES["_components/CompoundQuickComparePanel.js"]],
  ["Frequency Comparison UI hash is unchanged", hashFile("_components/CompoundFrequencyComparePanel.js") === BASELINE_HASHES["_components/CompoundFrequencyComparePanel.js"]],
  ["Detail Summary UI hash is unchanged", hashFile("_components/CompoundDetailSummary.js") === BASELINE_HASHES["_components/CompoundDetailSummary.js"]],
  ["KO SEO title and description are unchanged", page.includes('"복리 계산기 | 월복리·적립식 투자 미래가치 계산"') && page.includes("원금, 월 적립금, 연 수익률, 투자 기간으로 월복리 기준 미래가치를 계산합니다.")],
  ["EN SEO title and description are unchanged", page.includes('"Compound Interest Calculator: Future Value, Monthly Contributions & Taxes"') && page.includes("Calculate future value with principal, monthly contributions, annual return and years using monthly compounding.")],
  ["FAQ counts remain KO 24 / EN 8", faqCounts.ko === 24 && faqCounts.en === 8],
  ["FAQPage JSON-LD remains single", countMatches(page, /"@type":\s*"FAQPage"/g) === 1],
];

console.log("Compound Phase 2-3A contribution scenario verification");
console.log("----------------------------------------------------");
for (const [name, pass] of checks) console.log(`${pass ? "PASS" : "FAIL"}\t${name}`);

console.log("\nLocked contribution scenario results (rounded KRW)");
for (const id of Object.keys(COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES)) {
  const rounded = results[id].rounded;
  console.log(`${id}\tprincipal=${rounded.principalTotal}\tpretax=${rounded.pretaxFinalAmount}\ttax=${rounded.tax}\tafterTax=${rounded.afterTaxFinalAmount}\tpresentValue=${rounded.presentValue}`);
}

const failed = checks.filter(([, pass]) => !pass);
if (failed.length) {
  console.error(`FAIL: ${failed.length} check(s) failed`);
  process.exit(1);
}

console.log("All Phase 2-3A contribution scenario checks PASS");
