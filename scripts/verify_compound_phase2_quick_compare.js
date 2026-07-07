const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { simulateCompoundPlan } = require("../lib/compoundCore");

const ROOT = process.cwd();
const COMPONENT_PATH = path.join(ROOT, "_components", "CompoundQuickComparePanel.js");
const PAGE_PATH = path.join(ROOT, "pages", "tools", "compound-interest.js");
const component = fs.existsSync(COMPONENT_PATH) ? fs.readFileSync(COMPONENT_PATH, "utf8") : "";
const page = fs.readFileSync(PAGE_PATH, "utf8");

function countMatches(input, pattern) {
  return (input.match(pattern) || []).length;
}

function coreLibrariesUnchanged() {
  try {
    execFileSync("git", ["diff", "--quiet", "HEAD", "--", "lib/compoundCore.js", "lib/compound.js"], {
      cwd: ROOT,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function faqCounts() {
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

const baseInput = {
  initialAmount: 10_000_000,
  monthlyContribution: 300_000,
  annualReturn: 7,
  years: 10,
  taxRate: 15.4,
  feeRate: 0.5,
  inflationRate: 0,
};
const base = simulateCompoundPlan(baseInput);
const noTaxFee = simulateCompoundPlan({ ...baseInput, taxRate: 0, feeRate: 0 });
const counts = faqCounts();
const quickRenderIndexes = [...page.matchAll(/<CompoundQuickComparePanel\b/g)].map((match) => match.index);
const actionRenderIndexes = [...page.matchAll(/<CompoundResultActions\b/g)].map((match) => match.index);
const faqRenderIndex = page.indexOf("{/* FAQ */}");

const checks = [
  ["Quick Comparison component exists", fs.existsSync(COMPONENT_PATH)],
  ["Years presets are 5, 10, 20, 30", component.includes("[5, 10, 20, 30]")],
  ["KRW monthly presets are 100k, 300k, 500k, 1m", component.includes("[100_000, 300_000, 500_000, 1_000_000]")],
  ["USD monthly presets are 100, 300, 500, 1000", component.includes("[100, 300, 500, 1_000]")],
  ["Monthly compounding disclosure exists", component.includes("월복리 시뮬레이션") && component.includes("monthly contribution. Actual returns")],
  ["Verified calcCompound wrapper is reused", component.includes('import { calcCompound } from "../lib/compound"') && countMatches(component, /calcCompound\(/g) >= 2],
  ["Quick panel renders in both exclusive result branches", quickRenderIndexes.length === 2],
  ["Result actions render after quick panel in both branches", actionRenderIndexes.length === 2 && quickRenderIndexes.every((index, i) => index < actionRenderIndexes[i])],
  ["Result actions remain before FAQ", actionRenderIndexes.every((index) => index < faqRenderIndex)],
  ["Result actions stay excluded from PDF export", page.includes('className="fm-export-exclude grid gap-6"') && page.includes('data-html2canvas-ignore="true"')],
  ["Quick comparison view event exists", component.includes('trackGaEvent("tool_quick_compare_view"')],
  ["Quick comparison click event exists", component.includes('trackGaEvent("tool_quick_compare_click"')],
  ["Compound core libraries are unchanged", coreLibrariesUnchanged()],
  ["Default result remains 6,600.2만원", (base.afterTaxFinalAmount / 10_000).toFixed(1) === "6600.2"],
  ["Tax/fee OFF result remains 7,202.2만원", (noTaxFee.afterTaxFinalAmount / 10_000).toFixed(1) === "7202.2"],
  ["KO SEO title unchanged", page.includes('"복리 계산기 | 월복리·적립식 투자 미래가치 계산"')],
  ["EN SEO title unchanged", page.includes('"Compound Interest Calculator: Future Value, Monthly Contributions & Taxes"')],
  ["KO SEO description unchanged", page.includes("원금, 월 적립금, 연 수익률, 투자 기간으로 월복리 기준 미래가치를 계산합니다.")],
  ["EN SEO description unchanged", page.includes("Calculate future value with principal, monthly contributions, annual return and years using monthly compounding.")],
  ["FAQ counts remain KO 24 / EN 8", counts.ko === 24 && counts.en === 8],
  ["FAQPage JSON-LD remains single", countMatches(page, /"@type":\s*"FAQPage"/g) === 1],
];

console.log("Compound Phase 2-1 Quick Comparison verification");
console.log("-------------------------------------------------");
for (const [name, pass] of checks) console.log(`${pass ? "PASS" : "FAIL"}\t${name}`);

const failed = checks.filter(([, pass]) => !pass);
if (failed.length) {
  console.error(`FAIL: ${failed.length} check(s) failed`);
  process.exit(1);
}

console.log(`FAQ counts: KO ${counts.ko}, EN ${counts.en}`);
console.log("All Phase 2-1 Quick Comparison checks PASS");
