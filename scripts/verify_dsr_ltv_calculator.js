const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const AMOUNT_TOLERANCE = 100;
const RATIO_TOLERANCE = 0.01;

const samples = [
  {
    name: "A",
    input: {
      annualIncome: 60000000,
      cashOnHand: 200000000,
      existingMonthlyDebtPayment: 0,
      annualRate: 4,
      loanTermYears: 30,
      ltvRate: 70,
      dsrRate: 40,
      extraCostRate: 5,
      targetHomePrice: 600000000,
    },
    expected: {
      monthlyDsrPaymentLimit: 2000000,
      newMortgageMonthlyPaymentCapacity: 2000000,
      dsrLoanCapacity: 418922481,
      dsrPriceLimit: 598460687,
      cashLtvPriceLimit: 571428571,
      finalAffordablePrice: 571428571,
      safeSearchPriceLow: 457142857,
      safeSearchPriceHigh: 514285714,
      bottleneck: "CASH_LTV",
      candidateAffordable: false,
      candidateStatus: "WARNING",
    },
  },
  {
    name: "B",
    input: {
      annualIncome: 50000000,
      cashOnHand: 300000000,
      existingMonthlyDebtPayment: 500000,
      annualRate: 5,
      loanTermYears: 30,
      ltvRate: 70,
      dsrRate: 40,
      extraCostRate: 5,
      targetHomePrice: 600000000,
    },
    expected: {
      monthlyDsrPaymentLimit: 1666667,
      newMortgageMonthlyPaymentCapacity: 1166667,
      dsrLoanCapacity: 217328553,
      dsrPriceLimit: 310469362,
      cashLtvPriceLimit: 857142857,
      finalAffordablePrice: 310469362,
      safeSearchPriceLow: 248375489,
      safeSearchPriceHigh: 279422426,
      bottleneck: "DSR",
      candidateAffordable: false,
      candidateStatus: "FAIL",
    },
  },
  {
    name: "C",
    input: {
      annualIncome: 120000000,
      cashOnHand: 100000000,
      existingMonthlyDebtPayment: 0,
      annualRate: 4,
      loanTermYears: 30,
      ltvRate: 60,
      dsrRate: 40,
      extraCostRate: 5,
      targetHomePrice: 250000000,
    },
    expected: {
      monthlyDsrPaymentLimit: 4000000,
      newMortgageMonthlyPaymentCapacity: 4000000,
      dsrLoanCapacity: 837844962,
      dsrPriceLimit: 1396408270,
      cashLtvPriceLimit: 222222222,
      finalAffordablePrice: 222222222,
      safeSearchPriceLow: 177777778,
      safeSearchPriceHigh: 200000000,
      bottleneck: "CASH_LTV",
      candidateAffordable: false,
      candidateStatus: "FAIL",
    },
  },
  {
    name: "D",
    input: {
      annualIncome: 80000000,
      cashOnHand: 300000000,
      existingMonthlyDebtPayment: 200000,
      annualRate: 3.5,
      loanTermYears: 40,
      ltvRate: 70,
      dsrRate: 40,
      extraCostRate: 5,
      targetHomePrice: 700000000,
    },
    expected: {
      monthlyDsrPaymentLimit: 2666667,
      newMortgageMonthlyPaymentCapacity: 2466667,
      dsrLoanCapacity: 636738313,
      dsrPriceLimit: 909626161,
      cashLtvPriceLimit: 857142857,
      finalAffordablePrice: 857142857,
      safeSearchPriceLow: 685714286,
      safeSearchPriceHigh: 771428571,
      bottleneck: "CASH_LTV",
      candidateAffordable: true,
      candidateStatus: "PASS",
    },
  },
];

const screenPresets = [
  ["A", "기본형", "annualIncome 6000, assets 20000, reserveCash 0, existingMonthlyPayment 0, annualRate 4, loanYears 30, ltvPercent 70, dsrPercent 40, costRatePercent 5, targetHomePrice 60000"],
  ["B", "기존부채/DSR 병목", "annualIncome 5000, assets 30000, reserveCash 0, existingMonthlyPayment 50, annualRate 5, loanYears 30, ltvPercent 70, dsrPercent 40, costRatePercent 5, targetHomePrice 60000"],
  ["C", "현금/LTV 병목", "annualIncome 12000, assets 10000, reserveCash 0, existingMonthlyPayment 0, annualRate 4, loanYears 30, ltvPercent 60, dsrPercent 40, costRatePercent 5, targetHomePrice 25000"],
  ["D", "매수 가능형", "annualIncome 8000, assets 30000, reserveCash 0, existingMonthlyPayment 20, annualRate 3.5, loanYears 40, ltvPercent 70, dsrPercent 40, costRatePercent 5, targetHomePrice 70000"],
];

const internalLinks = [
  ["/market/real-estate", "pages/market/real-estate.js"],
  ["/posts/personalFinance/dsr-40-income-loan-limit-table", "content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md"],
  ["/posts/personalFinance/interest-rate-1p-loan-limit-impact", "content/posts/personalFinance/ko/interest-rate-1p-loan-limit-impact.md"],
  ["/posts/personalFinance/mortgage-risk-checklist-dsr-variable", "content/posts/personalFinance/ko/mortgage-risk-checklist-dsr-variable.md"],
  ["/posts/personalFinance/apt-dashboard-home-goal-roadmap", "content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md"],
];

const outputFields = [
  ["monthlyDsrPaymentLimit", "Monthly DSR payment limit", "amount"],
  ["newMortgageMonthlyPaymentCapacity", "New mortgage monthly capacity", "amount"],
  ["monthlyPaymentFactor", "Monthly payment factor", "factor"],
  ["dsrLoanCapacity", "DSR loan capacity", "amount"],
  ["dsrPriceLimit", "DSR price limit", "amount"],
  ["cashLtvPriceLimit", "LTV/cash price limit", "amount"],
  ["finalAffordablePrice", "Final affordable price", "amount"],
  ["safeSearchPriceLow", "Safe search low", "amount"],
  ["safeSearchPriceHigh", "Safe search high", "amount"],
  ["finalLoanAmount", "Final-price loan amount", "amount"],
  ["finalMonthlyPayment", "Final-price monthly payment", "amount"],
  ["finalDsrUsageRate", "Final-price DSR usage", "ratio"],
  ["bottleneck", "Bottleneck", "text"],
  ["candidateRequiredLoan", "Candidate required loan", "amount"],
  ["candidateMaxLoanByLtv", "Candidate LTV max loan", "amount"],
  ["candidateMonthlyPayment", "Candidate monthly payment", "amount"],
  ["candidateDsrUsageRate", "Candidate DSR usage", "ratio"],
  ["candidateCashRequirement", "Candidate required cash", "amount"],
  ["candidateCashGap", "Candidate cash gap/surplus", "amount"],
  ["candidateAffordable", "Candidate affordable", "boolean"],
  ["candidateStatus", "Candidate decision", "text"],
];

function roundWon(value) {
  return Math.round(Number(value) || 0);
}

function formatAmount(value) {
  return `${roundWon(value).toLocaleString("ko-KR")} KRW`;
}

function formatRatio(value) {
  return `${(Number(value) || 0).toFixed(4)}%`;
}

function formatFactor(value) {
  return (Number(value) || 0).toFixed(12);
}

function formatValue(value, type) {
  if (type === "amount") return formatAmount(value);
  if (type === "ratio") return formatRatio(value);
  if (type === "factor") return formatFactor(value);
  if (type === "boolean") return String(Boolean(value));
  return String(value);
}

function compareValue(actual, expected, type) {
  if (expected === undefined) return { status: "INFO", delta: "" };
  if (type === "amount") {
    const delta = Math.abs(Number(actual) - Number(expected));
    return {
      status: delta <= AMOUNT_TOLERANCE ? "PASS" : "FAIL",
      delta: `${Math.round(delta).toLocaleString("ko-KR")} KRW`,
    };
  }
  if (type === "ratio") {
    const delta = Math.abs(Number(actual) - Number(expected));
    return {
      status: delta <= RATIO_TOLERANCE ? "PASS" : "FAIL",
      delta: `${delta.toFixed(4)}%p`,
    };
  }
  return {
    status: actual === expected ? "PASS" : "FAIL",
    delta: actual === expected ? "" : `${actual} != ${expected}`,
  };
}

function makeResultRows(result, expected) {
  return outputFields.map(([key, label, type]) => {
    const actual = result[key];
    const expectedValue = expected[key];
    const comparison = compareValue(actual, expectedValue, type);
    return {
      key,
      label,
      type,
      actual,
      expected: expectedValue,
      status: comparison.status,
      delta: comparison.delta,
    };
  });
}

function printSample(sample, rows) {
  const failed = rows.filter((row) => row.status === "FAIL");
  const status = failed.length === 0 ? "PASS" : "FAIL";

  console.log(`\n[Sample ${sample.name}] ${status}`);
  for (const row of rows) {
    const expectedText =
      row.expected === undefined ? "" : ` | expected=${formatValue(row.expected, row.type)}`;
    const deltaText = row.delta ? ` | delta=${row.delta}` : "";
    console.log(
      `- ${row.label}: ${formatValue(row.actual, row.type)}${expectedText}${deltaText} [${row.status}]`
    );
  }

  return status;
}

function printSensitivityCount(sampleName, result) {
  const count = Array.isArray(result.extendedSensitivity) ? result.extendedSensitivity.length : 0;
  const status = count === 13 ? "PASS" : "FAIL";
  console.log(`- Extended sensitivity rows: ${count} | expected=13 [${status}]`);
  return status;
}

function sampleInputTable(sample) {
  return Object.entries(sample.input)
    .map(([key, value]) => `| ${key} | ${value.toLocaleString("ko-KR")} |`)
    .join("\n");
}

function sampleResultTable(rows) {
  return rows
    .map((row) => {
      const expected = row.expected === undefined ? "-" : formatValue(row.expected, row.type);
      const delta = row.delta || "-";
      return `| ${row.label} | ${formatValue(row.actual, row.type)} | ${expected} | ${delta} | ${row.status} |`;
    })
    .join("\n");
}

function internalLinkTable() {
  return internalLinks
    .map(([urlPath, filePath]) => {
      const exists = fs.existsSync(path.join(__dirname, "..", filePath));
      return `| ${urlPath} | ${filePath} | ${exists ? "확인" : "미확인"} |`;
    })
    .join("\n");
}

function buildReport(results) {
  const now = new Date().toISOString();
  const allPass = results.every((item) => item.status === "PASS");
  const sections = [];

  sections.push("# DSR/LTV Calculator Audit");
  sections.push("");
  sections.push(`Generated: ${now}`);
  sections.push(`Overall sample verification: ${allPass ? "PASS" : "FAIL"}`);
  sections.push("");
  sections.push("## Changed Files");
  sections.push("");
  sections.push("- `lib/calculators/dsrLtv.js`: shared DSR/LTV calculation core");
  sections.push("- `_components/DsrLtvCalculator.js`: imports the shared core and renders presets, result cards, candidate decision, sensitivity table, dashboard CTA, and related links");
  sections.push("- `pages/tools/dsr-ltv-calculator.js`: strengthened page copy and related links");
  sections.push("- `scripts/verify_dsr_ltv_calculator.js`: sample verification runner");
  sections.push("- `reports/dsr-ltv-calculator-audit.md`: audit result");
  sections.push("");
  sections.push("## Calculation Formula");
  sections.push("");
  sections.push("- Monthly DSR limit = `annualIncome * dsrRate / 100 / 12`");
  sections.push("- New mortgage capacity = `max(monthlyDsrLimit - existingMonthlyDebtPayment, 0)`");
  sections.push("- Equal-payment factor = `r * (1 + r)^n / ((1 + r)^n - 1)`; if `r = 0`, use `1 / n`");
  sections.push("- DSR loan capacity = `newMortgageMonthlyCapacity / monthlyPaymentFactor`");
  sections.push("- DSR price limit = `dsrLoanCapacity / (ltvRate / 100)`");
  sections.push("- LTV/cash price limit = `cashOnHand / (1 - ltvRate / 100 + extraCostRate / 100)`");
  sections.push("- Final affordable price = `min(dsrPriceLimit, cashLtvPriceLimit)`");
  sections.push("- Bottleneck = `DSR` when DSR price limit is lower; otherwise `CASH_LTV`");
  sections.push("");
  sections.push("## 2nd UX Expansion");
  sections.push("");
  sections.push("- Added A-D preset buttons using the same KRW sample inputs as this verification script.");
  sections.push("- Reorganized key cards around final affordable price, DSR loan capacity, new monthly capacity, final monthly payment, safer search range, and bottleneck.");
  sections.push("- Expanded the target home card with target price, required loan, LTV max loan, monthly payment, DSR usage, required cash, cash on hand, cash gap/surplus, and DSR/LTV/cash checks.");
  sections.push("- Added result interpretation and a strengthened real estate dashboard CTA.");
  sections.push("- Added extended sensitivity rows for rate, DSR, existing monthly debt, and LTV changes.");
  sections.push("");
  sections.push("## Preset Buttons");
  sections.push("");
  sections.push("| Preset | Meaning | Screen values in KRW 10k units |");
  sections.push("| --- | --- | --- |");
  sections.push(screenPresets.map((row) => `| ${row[0]} | ${row[1]} | ${row[2]} |`).join("\n"));
  sections.push("");
  sections.push("## Candidate Decision Rule");
  sections.push("");
  sections.push("- `PASS`: DSR, LTV, and cash checks all pass.");
  sections.push("- `WARNING`: at least one check fails, but the maximum shortfall ratio is greater than 0 and less than or equal to 5%.");
  sections.push("- `FAIL`: any failed check has a maximum shortfall ratio greater than 5%.");
  sections.push("- DSR shortfall = `max(candidateRequiredLoan - dsrLoanCapacity, 0) / max(candidateRequiredLoan, 1)`");
  sections.push("- LTV shortfall = `max(candidateRequiredLoan - candidateMaxLoanByLtv, 0) / max(candidateRequiredLoan, 1)`");
  sections.push("- Cash shortfall = `max(candidateCashRequirement - cashOnHand, 0) / max(candidateCashRequirement, 1)`");
  sections.push("");
  sections.push("## Sensitivity Analysis");
  sections.push("");
  sections.push("- Rate: `-1%p`, base, `+1%p`, `+2%p`");
  sections.push("- DSR: `-5%p`, base, `+5%p`");
  sections.push("- Existing monthly debt: `0`, base, `+500,000 KRW`");
  sections.push("- LTV: `-10%p`, base, `+10%p`");
  sections.push("- Every row is generated by `buildDsrLtvSensitivity(input)` and the same `calculateDsrLtvAffordability` core formula.");
  sections.push("");
  sections.push("## Dashboard CTA");
  sections.push("");
  sections.push("- The primary link remains `/market/real-estate`.");
  sections.push("- The dashboard already supports `priceMetric`, `priceMin`, and `priceMax`, so the CTA passes the safer range as `priceMetric=median_price` with KRW eok values.");
  sections.push("- No unsupported query key was added.");
  sections.push("");
  sections.push("## Internal Link Check");
  sections.push("");
  sections.push("| URL | Local file checked | Status |");
  sections.push("| --- | --- | --- |");
  sections.push(internalLinkTable());
  sections.push("");
  sections.push("## Policy Scope");
  sections.push("");
  sections.push("- No automatic policy update is applied.");
  sections.push("- User-entered LTV and DSR values are used as-is.");
  sections.push("- Repayment method is equal principal-and-interest monthly repayment only.");
  sections.push("- Actual lender review may differ because income recognition, credit profile, existing debt, collateral type, region, guarantee conditions, and lender policy can vary.");
  sections.push("");
  sections.push("## Input Validation");
  sections.push("");
  sections.push("- `annualIncome > 0`");
  sections.push("- `cashOnHand >= 0`");
  sections.push("- `existingMonthlyDebtPayment >= 0`");
  sections.push("- `annualRate >= 0 && annualRate < 30`");
  sections.push("- `loanTermYears > 0 && loanTermYears <= 50`");
  sections.push("- `ltvRate > 0 && ltvRate <= 100`");
  sections.push("- `dsrRate > 0 && dsrRate <= 100`");
  sections.push("- `extraCostRate >= 0 && extraCostRate <= 30`");
  sections.push("- `targetHomePrice >= 0`");
  sections.push("- Blank, `NaN`, and `Infinity` inputs are recorded in `validationErrors` and protected with safe numeric fallbacks.");
  sections.push("");

  for (const item of results) {
    sections.push(`## Sample ${item.sample.name}`);
    sections.push("");
    sections.push("### Input");
    sections.push("");
    sections.push("| Field | Value |");
    sections.push("| --- | ---: |");
    sections.push(sampleInputTable(item.sample));
    sections.push("");
    sections.push("### Result");
    sections.push("");
    sections.push("| Field | Actual | Expected | Delta | Status |");
    sections.push("| --- | ---: | ---: | ---: | --- |");
    sections.push(sampleResultTable(item.rows));
    sections.push("");
    sections.push(`Extended sensitivity rows: ${item.sensitivityCount} / 13 (${item.sensitivityStatus})`);
    sections.push("");
  }

  sections.push("## Screen QA Inputs");
  sections.push("");
  sections.push("- The screen still uses KRW 10k units.");
  sections.push("- To match the sample `cashOnHand`, enter the same amount in `Available assets` and set `Cash to keep aside` to `0`.");
  sections.push("- Enter `targetHomePrice` in the new target home price field, also in KRW 10k units.");
  sections.push("- Example A screen values: annual income `6000`, available assets `20000`, cash to keep aside `0`, existing monthly debt `0`, rate `4`, term `30`, LTV `70`, DSR `40`, closing cost `5`, target home `60000`.");
  sections.push("");
  sections.push("## Build Result");
  sections.push("");
  sections.push("- `npm.cmd run build`: pending after this script; update this section after build validation.");
  sections.push("");

  return sections.join("\n");
}

async function main() {
  const modulePath = path.join(__dirname, "..", "lib", "calculators", "dsrLtv.js");
  const { calculateDsrLtvAffordability } = await import(pathToFileURL(modulePath).href);

  const results = samples.map((sample) => {
    const result = calculateDsrLtvAffordability(sample.input);
    const rows = makeResultRows(result, sample.expected);
    const status = printSample(sample, rows);
    const sensitivityStatus = printSensitivityCount(sample.name, result);
    const finalStatus = status === "PASS" && sensitivityStatus === "PASS" ? "PASS" : "FAIL";
    return {
      sample,
      result,
      rows,
      status: finalStatus,
      sensitivityStatus,
      sensitivityCount: Array.isArray(result.extendedSensitivity) ? result.extendedSensitivity.length : 0,
    };
  });

  const allPass = results.every((item) => item.status === "PASS");
  console.log(`\nOverall DSR/LTV verification: ${allPass ? "PASS" : "FAIL"}`);

  const reportPath = path.join(__dirname, "..", "reports", "dsr-ltv-calculator-audit.md");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, buildReport(results), "utf8");
  console.log(`Report written: ${path.relative(process.cwd(), reportPath)}`);

  if (!allPass) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
