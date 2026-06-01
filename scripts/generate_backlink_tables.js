const { simulateCompoundPlan } = require("../lib/compoundCore");
const { solveRequiredMonthly } = require("../lib/goalSimulator");

const KRW = new Intl.NumberFormat("ko-KR");

function roundTo(value, unit) {
  return Math.round(value / unit) * unit;
}

function krw(value) {
  return `${KRW.format(Math.round(value))}원`;
}

function krwMan(value) {
  return `${KRW.format(Math.round(value / 10_000))}만원`;
}

function krwEokMan(value) {
  const rounded = roundTo(value, 10_000);
  const eok = Math.floor(rounded / 100_000_000);
  const man = Math.round((rounded - eok * 100_000_000) / 10_000);
  if (eok > 0 && man > 0) return `${eok}억 ${KRW.format(man)}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${KRW.format(man)}만원`;
}

function markdownTable(headers, rows) {
  const aligns = headers.map((header, index) => (index === 0 ? "---" : "---:"));
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${aligns.join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ];
  return lines.join("\n");
}

function compoundResult({ initialAmount, monthlyContribution, annualReturn, years }) {
  const result = simulateCompoundPlan({
    initialAmount,
    monthlyContribution,
    annualReturn,
    years,
    taxRate: 0,
    feeRate: 0,
    inflationRate: 0,
  });
  if (!result.ok) {
    throw new Error(`Compound simulation failed: ${JSON.stringify(result.errors)}`);
  }
  return result.afterTaxFinalAmount;
}

function requiredMonthly({ target, annualReturn, years }) {
  const value = solveRequiredMonthly({
    target,
    current: 0,
    annualRate: annualReturn,
    years,
    compounding: "monthly",
    taxRatePercent: 0,
    feeRatePercent: 0,
    inflationPercent: 0,
    contribGrowthPercent: 0,
    valueKey: "valueNet",
  });
  if (value == null) {
    throw new Error(`Goal simulation failed: ${JSON.stringify({ target, annualReturn, years })}`);
  }
  return value;
}

// Same equal-principal-and-interest formulas used in lib/calculators/dsrLtv.js.
function calculateMonthlyPayment(loanAmount, annualRatePercent, months) {
  const principal = Math.max(0, Number(loanAmount) || 0);
  const periodCount = Math.max(0, Math.floor(Number(months) || 0));
  if (principal <= 0 || periodCount <= 0) return 0;

  const monthlyRate = (Number(annualRatePercent) || 0) / 100 / 12;
  if (monthlyRate === 0) return principal / periodCount;

  const factor = Math.pow(1 + monthlyRate, periodCount);
  return principal * (monthlyRate * factor) / (factor - 1);
}

function calculateLoanFromMonthlyPayment(monthlyPayment, annualRatePercent, months) {
  const payment = Math.max(0, Number(monthlyPayment) || 0);
  const periodCount = Math.max(0, Math.floor(Number(months) || 0));
  if (payment <= 0 || periodCount <= 0) return 0;

  const monthlyRate = (Number(annualRatePercent) || 0) / 100 / 12;
  if (monthlyRate === 0) return payment * periodCount;

  return payment * (1 - Math.pow(1 + monthlyRate, -periodCount)) / monthlyRate;
}

function section(title, content) {
  console.log(`\n## ${title}\n`);
  console.log(content);
}

const returnRates = [3, 5, 7, 10];
const longYears = [10, 20, 30];

section(
  "Compound lump sum: 10,000,000 KRW",
  markdownTable(
    ["기간", ...returnRates.map((rate) => `연 ${rate}%`)],
    longYears.map((years) => [
      `${years}년`,
      ...returnRates.map((rate) =>
        krwEokMan(compoundResult({ initialAmount: 10_000_000, monthlyContribution: 0, annualReturn: rate, years }))
      ),
    ])
  )
);

section(
  "Compound monthly: 300,000 KRW",
  markdownTable(
    ["기간", "원금 합계", ...returnRates.map((rate) => `연 ${rate}%`)],
    longYears.map((years) => [
      `${years}년`,
      krwEokMan(300_000 * years * 12),
      ...returnRates.map((rate) =>
        krwEokMan(compoundResult({ initialAmount: 0, monthlyContribution: 300_000, annualReturn: rate, years }))
      ),
    ])
  )
);

const goalYears = [5, 10, 15, 20];
section(
  "Required monthly for 100,000,000 KRW target",
  markdownTable(
    ["기간", ...returnRates.map((rate) => `연 ${rate}%`)],
    goalYears.map((years) => [
      `${years}년`,
      ...returnRates.map((rate) => krwMan(roundTo(requiredMonthly({ target: 100_000_000, annualReturn: rate, years }), 1_000))),
    ])
  )
);

const salaries = [30_000_000, 40_000_000, 50_000_000, 60_000_000, 70_000_000, 80_000_000, 100_000_000, 120_000_000];
section(
  "DSR 40% loan capacity by income",
  markdownTable(
    ["연봉", "연간 상환 가능액", "월 상환 가능액", "추정 대출 가능액"],
    salaries.map((salary) => {
      const annualPayment = salary * 0.4;
      const monthlyPayment = annualPayment / 12;
      const loan = calculateLoanFromMonthlyPayment(monthlyPayment, 4, 30 * 12);
      return [krwEokMan(salary), krwMan(annualPayment), krwMan(monthlyPayment), krwEokMan(roundTo(loan, 10_000))];
    })
  )
);

const rateScenarios = [3, 4, 5, 6];
const baseMonthlyPayment = 60_000_000 * 0.4 / 12;
let previousLoan = null;
section(
  "Rate impact on loan capacity",
  markdownTable(
    ["금리", "월 상환 가능액", "추정 대출 가능액", "직전 대비 감소액", "직전 대비 감소율"],
    rateScenarios.map((rate) => {
      const loan = calculateLoanFromMonthlyPayment(baseMonthlyPayment, rate, 30 * 12);
      const decrease = previousLoan == null ? 0 : previousLoan - loan;
      const decreaseRate = previousLoan == null ? 0 : (decrease / previousLoan) * 100;
      previousLoan = loan;
      return [
        `연 ${rate}%`,
        krwMan(baseMonthlyPayment),
        krwEokMan(roundTo(loan, 10_000)),
        previousLoan === loan && rate === 3 ? "-" : krwEokMan(roundTo(decrease, 10_000)),
        rate === 3 ? "-" : `${decreaseRate.toFixed(1)}%`,
      ];
    })
  )
);

section(
  "Monthly payment for 300,000,000 KRW loan",
  markdownTable(
    ["금리", "월 상환액", "연간 상환액"],
    rateScenarios.map((rate) => {
      const payment = calculateMonthlyPayment(300_000_000, rate, 30 * 12);
      return [`연 ${rate}%`, krwMan(roundTo(payment, 1_000)), krwMan(roundTo(payment * 12, 1_000))];
    })
  )
);
