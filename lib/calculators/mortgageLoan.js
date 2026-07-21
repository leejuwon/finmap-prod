import { calculateMonthlyPayment } from "./dsrLtv.js";

export const MORTGAGE_REPAYMENT_TYPES = {
  EQUAL_PAYMENT: "equal_payment",
  EQUAL_PRINCIPAL: "equal_principal",
  BULLET: "bullet",
};

const VALID_REPAYMENT_TYPES = new Set(Object.values(MORTGAGE_REPAYMENT_TYPES));

function toNumber(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function nonNegative(value) {
  return Math.max(0, toNumber(value, 0));
}

function getRepaymentType(value) {
  const raw = String(value || "").trim();
  return VALID_REPAYMENT_TYPES.has(raw)
    ? raw
    : MORTGAGE_REPAYMENT_TYPES.EQUAL_PAYMENT;
}

function getTermMonths(input) {
  const years = nonNegative(input.termYears ?? input.loanTermYears ?? input.loanYears);
  return Math.max(0, Math.floor(years * 12));
}

function getGraceMonths(input, totalMonths, repaymentType) {
  if (repaymentType === MORTGAGE_REPAYMENT_TYPES.BULLET) return 0;
  const rawMonths =
    input.graceMonths !== undefined
      ? nonNegative(input.graceMonths)
      : nonNegative(input.graceYears) * 12;
  return Math.min(Math.floor(rawMonths), Math.max(totalMonths - 1, 0));
}

function pushRow(rows, row) {
  rows.push({
    ...row,
    year: Math.ceil(row.month / 12),
    payment: Math.max(0, row.payment),
    principal: Math.max(0, row.principal),
    interest: Math.max(0, row.interest),
    balance: Math.max(0, row.balance),
  });
}

function buildAnnualSummary(rows) {
  const byYear = new Map();
  rows.forEach((row) => {
    const current =
      byYear.get(row.year) || {
        year: row.year,
        months: 0,
        payment: 0,
        principal: 0,
        interest: 0,
        endBalance: row.balance,
      };
    current.months += 1;
    current.payment += row.payment;
    current.principal += row.principal;
    current.interest += row.interest;
    current.endBalance = row.balance;
    byYear.set(row.year, current);
  });
  return Array.from(byYear.values());
}

function summarizeSchedule(rows) {
  const totals = rows.reduce(
    (acc, row) => ({
      payment: acc.payment + row.payment,
      principal: acc.principal + row.principal,
      interest: acc.interest + row.interest,
    }),
    { payment: 0, principal: 0, interest: 0 }
  );

  return {
    totalPayment: totals.payment,
    totalPrincipal: totals.principal,
    totalInterest: totals.interest,
    firstMonthPayment: rows[0]?.payment || 0,
    lastMonthPayment: rows[rows.length - 1]?.payment || 0,
    maxMonthlyPayment: rows.reduce((max, row) => Math.max(max, row.payment), 0),
    minMonthlyPayment: rows.reduce(
      (min, row) => Math.min(min, row.payment),
      rows[0]?.payment || 0
    ),
  };
}

function emptyResult(input, warnings) {
  const loanAmount = nonNegative(input.loanAmount);
  const annualRate = nonNegative(input.annualRate);
  const totalMonths = getTermMonths(input);
  const repaymentType = getRepaymentType(input.repaymentType);
  return {
    isValid: false,
    warnings,
    repaymentType,
    loanAmount,
    annualRate,
    termYears: totalMonths / 12,
    totalMonths,
    graceMonths: 0,
    monthlyRate: annualRate / 100 / 12,
    expectedMonthlyPayment: 0,
    averageMonthlyPayment: 0,
    firstMonthPayment: 0,
    lastMonthPayment: 0,
    maxMonthlyPayment: 0,
    minMonthlyPayment: 0,
    totalInterest: 0,
    totalPayment: 0,
    totalPrincipal: 0,
    estimatedDsrRate: null,
    dsrReferenceMonthlyPayment: 0,
    schedule: [],
    first12Months: [],
    annualSummary: [],
    ratePlusOneMonthlyPayment: 0,
    ratePlusOneDelta: 0,
  };
}

export function calculateMortgageLoan(input = {}, options = {}) {
  const includeSensitivity = options.includeSensitivity !== false;
  const loanAmount = nonNegative(input.loanAmount);
  const annualRate = nonNegative(input.annualRate);
  const totalMonths = getTermMonths(input);
  const repaymentType = getRepaymentType(input.repaymentType);
  const monthlyRate = annualRate / 100 / 12;
  const warnings = [];

  if (loanAmount <= 0) warnings.push("loan_amount_required");
  if (totalMonths <= 0) warnings.push("term_required");
  if (annualRate >= 30) warnings.push("rate_high");

  if (loanAmount <= 0 || totalMonths <= 0) return emptyResult(input, warnings);

  const graceMonths = getGraceMonths(input, totalMonths, repaymentType);
  if (
    repaymentType !== MORTGAGE_REPAYMENT_TYPES.BULLET &&
    nonNegative(input.graceMonths ?? nonNegative(input.graceYears) * 12) >= totalMonths
  ) {
    warnings.push("grace_period_clamped");
  }

  const rows = [];
  let remaining = loanAmount;

  if (repaymentType === MORTGAGE_REPAYMENT_TYPES.BULLET) {
    for (let month = 1; month <= totalMonths; month += 1) {
      const interest = loanAmount * monthlyRate;
      const principal = month === totalMonths ? loanAmount : 0;
      const payment = interest + principal;
      remaining = month === totalMonths ? 0 : loanAmount;
      pushRow(rows, { month, payment, principal, interest, balance: remaining });
    }
  } else {
    for (let month = 1; month <= graceMonths; month += 1) {
      const interest = remaining * monthlyRate;
      pushRow(rows, {
        month,
        payment: interest,
        principal: 0,
        interest,
        balance: remaining,
      });
    }

    const amortizationMonths = totalMonths - graceMonths;
    if (repaymentType === MORTGAGE_REPAYMENT_TYPES.EQUAL_PRINCIPAL) {
      const fixedPrincipal = loanAmount / amortizationMonths;
      for (let i = 1; i <= amortizationMonths; i += 1) {
        const month = graceMonths + i;
        const interest = remaining * monthlyRate;
        const principal = i === amortizationMonths ? remaining : Math.min(remaining, fixedPrincipal);
        const payment = principal + interest;
        remaining -= principal;
        pushRow(rows, { month, payment, principal, interest, balance: remaining });
      }
    } else {
      const fixedPayment = calculateMonthlyPayment(loanAmount, annualRate, amortizationMonths);
      for (let i = 1; i <= amortizationMonths; i += 1) {
        const month = graceMonths + i;
        const interest = remaining * monthlyRate;
        const scheduledPrincipal = fixedPayment - interest;
        const principal =
          i === amortizationMonths
            ? remaining
            : Math.min(remaining, Math.max(0, scheduledPrincipal));
        const payment = principal + interest;
        remaining -= principal;
        pushRow(rows, { month, payment, principal, interest, balance: remaining });
      }
    }
  }

  const summary = summarizeSchedule(rows);
  const firstAmortizingRow = rows[graceMonths] || rows[0];
  const expectedMonthlyPayment =
    repaymentType === MORTGAGE_REPAYMENT_TYPES.EQUAL_PAYMENT
      ? firstAmortizingRow?.payment || 0
      : summary.firstMonthPayment;
  const averageMonthlyPayment = summary.totalPayment / totalMonths;
  const existingMonthlyPayment = nonNegative(input.existingMonthlyPayment);
  const annualIncome = nonNegative(input.annualIncome);
  const dsrReferenceMonthlyPayment =
    repaymentType === MORTGAGE_REPAYMENT_TYPES.EQUAL_PAYMENT
      ? expectedMonthlyPayment
      : summary.firstMonthPayment;
  const estimatedDsrRate =
    annualIncome > 0
      ? ((existingMonthlyPayment + dsrReferenceMonthlyPayment) * 12 * 100) / annualIncome
      : null;

  let plusOne = null;
  if (includeSensitivity) {
    plusOne = calculateMortgageLoan(
      {
        ...input,
        loanAmount,
        annualRate: Math.min(annualRate + 1, 29.999),
        termYears: totalMonths / 12,
        repaymentType,
        graceMonths,
      },
      { includeSensitivity: false }
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    repaymentType,
    loanAmount,
    annualRate,
    termYears: totalMonths / 12,
    totalMonths,
    graceMonths,
    monthlyRate,
    expectedMonthlyPayment,
    averageMonthlyPayment,
    ...summary,
    estimatedDsrRate,
    dsrReferenceMonthlyPayment,
    schedule: rows,
    first12Months: rows.slice(0, 12),
    annualSummary: buildAnnualSummary(rows),
    ratePlusOneMonthlyPayment: plusOne?.expectedMonthlyPayment || 0,
    ratePlusOneDelta: plusOne
      ? (plusOne.expectedMonthlyPayment || 0) - expectedMonthlyPayment
      : 0,
  };
}

export function getLoanAmountBucket(loanAmount) {
  const amount = nonNegative(loanAmount);
  if (amount < 300000000) return "under_300m";
  if (amount < 500000000) return "300m_500m";
  if (amount < 700000000) return "500m_700m";
  if (amount < 1000000000) return "700m_1000m";
  return "over_1000m";
}

export function getRateBucket(annualRate) {
  const rate = nonNegative(annualRate);
  if (rate < 3) return "under_3";
  if (rate < 4) return "3_4";
  if (rate < 5) return "4_5";
  if (rate < 6) return "5_6";
  return "over_6";
}
