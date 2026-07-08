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
const HELPER_PATH = path.join(ROOT, "lib", "compoundFrequencyCompare.js");
const page = fs.readFileSync(PAGE_PATH, "utf8");
const helperSource = fs.readFileSync(HELPER_PATH, "utf8");

const BASELINE_HASHES = {
  "lib/compoundCore.js": "9ea424f60ffd9305b8af9c34ef70475db8f330ca2be58fcd6464d00316726b6e",
  "lib/compound.js": "7dac56894523f9f1566b3f6f559212b77f48b356c85fa1bea153849f0cbb9476",
  "pages/tools/compound-interest.js": "1cb38b68fbca29a65ce10221116f907ca665cf7b487ca7c3dde56ac2486c3483",
};

const EXPECTED_ANNUAL = {
  A: { principalTotal: 46_000_000, pretaxFinalAmount: 67_351_296, tax: 3_288_100, afterTaxFinalAmount: 64_063_196, presentValue: 64_063_196 },
  B: { principalTotal: 46_000_000, pretaxFinalAmount: 69_410_726, tax: 0, afterTaxFinalAmount: 69_410_726, presentValue: 69_410_726 },
  C: { principalTotal: 10_000_000, pretaxFinalAmount: 16_288_946, tax: 968_498, afterTaxFinalAmount: 15_320_449, presentValue: 15_320_449 },
  D: { principalTotal: 46_000_000, pretaxFinalAmount: 46_000_000, tax: 0, afterTaxFinalAmount: 46_000_000, presentValue: 46_000_000 },
  E: { principalTotal: 46_000_000, pretaxFinalAmount: 37_830_932, tax: 0, afterTaxFinalAmount: 37_830_932, presentValue: 37_830_932 },
  F: { principalTotal: 46_000_000, pretaxFinalAmount: 67_351_296, tax: 3_288_100, afterTaxFinalAmount: 64_063_196, presentValue: 50_046_067 },
};

function hashFile(relativePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(ROOT, relativePath)))
    .digest("hex");
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
  return Object.entries(expected).every(([field, value]) => result.rounded[field] === value);
}

const annual = {};
const monthly = {};
for (const [id, fixture] of Object.entries(COMPOUND_FREQUENCY_COMPARE_FIXTURES)) {
  annual[id] = calcAnnualCompoundForComparison(fixture);
  monthly[id] = simulateCompoundPlan(monthlyInput(fixture));
}

const faqCounts = readFaqCounts();
const helperRemainsStandalone =
  !helperSource.includes("_components") &&
  !helperSource.includes("pages/tools");

const checks = [
  ["Annual comparison helper exists", fs.existsSync(HELPER_PATH)],
  ["Fixtures A-F are defined", Object.keys(COMPOUND_FREQUENCY_COMPARE_FIXTURES).join("") === "ABCDEF"],
  ["All annual fixtures match locked rounded results", Object.entries(EXPECTED_ANNUAL).every(([id, expected]) => expectedMatches(annual[id], expected))],
  ["Sample A monthly result remains 6,600.2만원", (monthly.A.afterTaxFinalAmount / 10_000).toFixed(1) === "6600.2"],
  ["Sample B monthly result remains 7,202.2만원", (monthly.B.afterTaxFinalAmount / 10_000).toFixed(1) === "7202.2"],
  ["All annual results are finite", Object.values(annual).every((result) => result.ok && Number.isFinite(result.afterTaxFinalAmount))],
  ["All annual results identify yearly compounding", Object.values(annual).every((result) => result.compounding === "yearly")],
  ["All annual results contain ten year rows", Object.values(annual).every((result) => Array.isArray(result.yearSummary) && result.yearSummary.length === 10)],
  ["All annual results include after-tax amounts", Object.values(annual).every((result) => Number.isFinite(result.afterTaxFinalAmount))],
  ["All annual results include present values", Object.values(annual).every((result) => Number.isFinite(result.presentValue))],
  ["Sample A monthly is at least annual", monthly.A.afterTaxFinalAmount >= annual.A.afterTaxFinalAmount],
  ["Sample B monthly is at least annual", monthly.B.afterTaxFinalAmount >= annual.B.afterTaxFinalAmount],
  ["Sample D tax is zero", annual.D.tax === 0],
  ["Sample D final amount equals contributed principal", annual.D.afterTaxFinalAmount === annual.D.principalTotal],
  ["Sample E loss has zero tax and finite result", annual.E.pretaxInvestmentGain < 0 && annual.E.tax === 0 && Number.isFinite(annual.E.afterTaxFinalAmount)],
  ["Sample F inflation lowers present value only", annual.F.presentValue < annual.F.afterTaxFinalAmount && annual.F.afterTaxFinalAmount === annual.A.afterTaxFinalAmount],
  ["compoundCore baseline hash is unchanged", hashFile("lib/compoundCore.js") === BASELINE_HASHES["lib/compoundCore.js"]],
  ["compound wrapper baseline hash is unchanged", hashFile("lib/compound.js") === BASELINE_HASHES["lib/compound.js"]],
  ["Compound page baseline hash is unchanged", hashFile("pages/tools/compound-interest.js") === BASELINE_HASHES["pages/tools/compound-interest.js"]],
  ["Phase 2-2A helper remains standalone from UI modules", helperRemainsStandalone],
  ["KO SEO title and description remain unchanged", page.includes('"복리 계산기 | 월복리·적립식 투자 미래가치 계산"') && page.includes("원금, 월 적립금, 연 수익률, 투자 기간으로 월복리 기준 미래가치를 계산합니다.")],
  ["EN SEO title and description remain unchanged", page.includes('"Compound Interest Calculator: Future Value, Monthly Contributions & Taxes"') && page.includes("Calculate future value with principal, monthly contributions, annual return and years using monthly compounding.")],
  ["FAQ counts remain KO 24 / EN 8", faqCounts.ko === 24 && faqCounts.en === 8],
  ["FAQPage JSON-LD remains single", countMatches(page, /"@type":\s*"FAQPage"/g) === 1],
  ["Fractional years are rejected", calcAnnualCompoundForComparison({ ...COMPOUND_FREQUENCY_COMPARE_FIXTURES.A, years: 10.5 }).ok === false],
];

console.log("Compound Phase 2-2A frequency comparison verification");
console.log("----------------------------------------------------");
for (const [name, pass] of checks) console.log(`${pass ? "PASS" : "FAIL"}\t${name}`);

console.log("\nLocked annual fixture results (rounded KRW)");
for (const id of Object.keys(COMPOUND_FREQUENCY_COMPARE_FIXTURES)) {
  const result = annual[id].rounded;
  console.log(`${id}\tprincipal=${result.principalTotal}\tpretax=${result.pretaxFinalAmount}\ttax=${result.tax}\tafterTax=${result.afterTaxFinalAmount}\tpresentValue=${result.presentValue}`);
}

const failed = checks.filter(([, pass]) => !pass);
if (failed.length) {
  console.error(`FAIL: ${failed.length} check(s) failed`);
  process.exit(1);
}

console.log("All Phase 2-2A frequency comparison checks PASS");
