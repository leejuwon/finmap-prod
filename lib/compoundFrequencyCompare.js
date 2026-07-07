const {
  toFiniteNumber,
  validateCompoundInputs,
} = require("./compoundCore");

const COMPOUND_FREQUENCY_COMPARE_FIXTURES = {
  A: {
    label: "Default",
    principal: 10_000_000,
    monthly: 300_000,
    annualRate: 7,
    years: 10,
    taxRatePercent: 15.4,
    feeRatePercent: 0.5,
    inflationRate: 0,
    currency: "KRW",
    baseYear: 2026,
  },
  B: {
    label: "No tax or fee",
    principal: 10_000_000,
    monthly: 300_000,
    annualRate: 7,
    years: 10,
    taxRatePercent: 0,
    feeRatePercent: 0,
    inflationRate: 0,
    currency: "KRW",
    baseYear: 2026,
  },
  C: {
    label: "Lump sum only",
    principal: 10_000_000,
    monthly: 0,
    annualRate: 5,
    years: 10,
    taxRatePercent: 15.4,
    feeRatePercent: 0,
    inflationRate: 0,
    currency: "KRW",
    baseYear: 2026,
  },
  D: {
    label: "Zero return",
    principal: 10_000_000,
    monthly: 300_000,
    annualRate: 0,
    years: 10,
    taxRatePercent: 15.4,
    feeRatePercent: 0,
    inflationRate: 0,
    currency: "KRW",
    baseYear: 2026,
  },
  E: {
    label: "Loss",
    principal: 10_000_000,
    monthly: 300_000,
    annualRate: -3,
    years: 10,
    taxRatePercent: 15.4,
    feeRatePercent: 0.5,
    inflationRate: 0,
    currency: "KRW",
    baseYear: 2026,
  },
  F: {
    label: "Inflation",
    principal: 10_000_000,
    monthly: 300_000,
    annualRate: 7,
    years: 10,
    taxRatePercent: 15.4,
    feeRatePercent: 0.5,
    inflationRate: 2.5,
    currency: "KRW",
    baseYear: 2026,
  },
};

function roundMoney(value) {
  return Math.round(toFiniteNumber(value));
}

function normalizeInput(input = {}) {
  return {
    principal: toFiniteNumber(input.principal, 0),
    monthly: toFiniteNumber(input.monthly, 0),
    annualRate: toFiniteNumber(input.annualRate, 0),
    years: toFiniteNumber(input.years, 0),
    taxRatePercent: toFiniteNumber(input.taxRatePercent, 0),
    feeRatePercent: toFiniteNumber(input.feeRatePercent, 0),
    inflationRate: toFiniteNumber(input.inflationRate, 0),
    currency: input.currency === "USD" ? "USD" : "KRW",
    baseYear: toFiniteNumber(input.baseYear, new Date().getFullYear()),
  };
}

function validateAnnualComparisonInput(input) {
  const validation = validateCompoundInputs({
    initialAmount: input.principal,
    monthlyContribution: input.monthly,
    years: input.years,
    annualReturn: input.annualRate,
    taxRate: input.taxRatePercent,
    feeRate: input.feeRatePercent,
    inflationRate: input.inflationRate,
  });
  const errors = [...validation.errors];

  if (Number.isFinite(input.years) && input.years > 0 && !Number.isInteger(input.years)) {
    errors.push({
      field: "years",
      ko: "연복리 비교 기간은 양의 정수 연도여야 합니다.",
      en: "Annual comparison years must be a positive integer.",
    });
  }

  return { ok: errors.length === 0, errors };
}

function calcAnnualCompoundForComparison(rawInput = {}) {
  const input = normalizeInput(rawInput);
  const validation = validateAnnualComparisonInput(input);

  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      compounding: "yearly",
      input,
    };
  }

  const netAnnualReturn = input.annualRate - input.feeRatePercent;
  const netAnnualRate = netAnnualReturn / 100;
  const noFeeAnnualRate = input.annualRate / 100;
  const yearlyContribution = input.monthly * 12;
  let balance = input.principal;
  let balanceNoFee = input.principal;
  let principalTotal = input.principal;
  let cumulativeFee = 0;
  const yearSummary = [];

  for (let year = 1; year <= input.years; year += 1) {
    const openingBalanceGross = balance;
    const openingBalanceNoFee = balanceNoFee;
    principalTotal += yearlyContribution;

    // Apply one annual return to the opening balance, then add that year's
    // month-end contributions. This keeps the annual comparison conservative.
    const beforeReturn = balance;
    const beforeReturnNoFee = balanceNoFee;
    const annualGain = beforeReturn * netAnnualRate;
    const annualGainNoFee = beforeReturnNoFee * noFeeAnnualRate;
    balance = beforeReturn + annualGain + yearlyContribution;
    balanceNoFee = beforeReturnNoFee + annualGainNoFee + yearlyContribution;

    const nextCumulativeFee = Math.max(0, balanceNoFee - balance);
    const feeYear = Math.max(0, nextCumulativeFee - cumulativeFee);
    cumulativeFee = nextCumulativeFee;

    yearSummary.push({
      year,
      calendarYear: input.baseYear + year - 1,
      openingBalanceGross,
      openingBalanceNet: openingBalanceGross,
      openingBalanceNoFee,
      contributionYear: yearlyContribution,
      contribution: yearlyContribution,
      beforeReturn,
      interestYearGross: annualGain,
      interestYearNet: annualGain,
      closingBalanceGross: balance,
      closingBalancePretax: balance,
      closingBalanceNet: balance,
      principalTotal,
      totalContribution: principalTotal,
      taxYear: 0,
      feeYear,
      cumulativeFee,
      cumulativeTax: 0,
    });
  }

  const pretaxFinalAmount = balance;
  const pretaxInvestmentGain = pretaxFinalAmount - principalTotal;
  const tax = Math.max(pretaxInvestmentGain, 0) * input.taxRatePercent / 100;
  const afterTaxFinalAmount = pretaxFinalAmount - tax;
  const afterTaxInvestmentGain = afterTaxFinalAmount - principalTotal;
  const presentValue = afterTaxFinalAmount /
    Math.pow(1 + input.inflationRate / 100, input.years);
  const totalReturn = principalTotal > 0
    ? afterTaxFinalAmount / principalTotal - 1
    : null;
  const cagrReference = principalTotal > 0 && afterTaxFinalAmount > 0
    ? Math.pow(afterTaxFinalAmount / principalTotal, 1 / input.years) - 1
    : null;
  const initialFutureValue = input.principal * Math.pow(1 + netAnnualRate, input.years);
  const monthlyContributionFutureValue = pretaxFinalAmount - initialFutureValue;
  const feeDrag = Math.max(0, balanceNoFee - pretaxFinalAmount);

  const lastYear = yearSummary[yearSummary.length - 1];
  if (lastYear) {
    lastYear.taxYear = tax;
    lastYear.cumulativeTax = tax;
    lastYear.interestYearNet = lastYear.interestYearGross - tax;
    lastYear.closingBalanceNet = afterTaxFinalAmount;
  }

  const rounded = {
    months: input.years * 12,
    netAnnualReturn,
    initialFutureValue: roundMoney(initialFutureValue),
    monthlyContributionFutureValue: roundMoney(monthlyContributionFutureValue),
    principalTotal: roundMoney(principalTotal),
    pretaxFinalAmount: roundMoney(pretaxFinalAmount),
    pretaxInvestmentGain: roundMoney(pretaxInvestmentGain),
    tax: roundMoney(tax),
    feeDrag: roundMoney(feeDrag),
    afterTaxFinalAmount: roundMoney(afterTaxFinalAmount),
    presentValue: roundMoney(presentValue),
    afterTaxInvestmentGain: roundMoney(afterTaxInvestmentGain),
    totalReturnPercent: totalReturn == null ? null : totalReturn * 100,
    cagrReferencePercent: cagrReference == null ? null : cagrReference * 100,
  };

  return {
    ok: true,
    errors: [],
    input,
    principal: input.principal,
    monthly: input.monthly,
    annualRate: input.annualRate,
    yearsTotal: input.years,
    monthsTotal: input.years * 12,
    compounding: "yearly",
    taxRate: input.taxRatePercent / 100,
    feeRate: input.feeRatePercent / 100,
    inflationRate: input.inflationRate / 100,
    baseYear: input.baseYear,
    netAnnualReturn,
    annualRateDecimal: netAnnualRate,
    initialFutureValue,
    monthlyContributionFutureValue,
    totalContribution: principalTotal,
    totalContributionNet: principalTotal,
    principalTotal,
    futureValueGross: pretaxFinalAmount,
    futureValueNet: afterTaxFinalAmount,
    pretaxFinalAmount,
    afterTaxFinalAmount,
    presentValue,
    totalInterestGross: pretaxInvestmentGain,
    totalInterestNet: afterTaxInvestmentGain,
    pretaxInvestmentGain,
    afterTaxInvestmentGain,
    tax,
    feeDrag,
    totalTax: tax,
    totalFee: feeDrag,
    totalTaxFee: tax + feeDrag,
    totalReturn,
    totalReturnPercent: totalReturn == null ? null : totalReturn * 100,
    cagrReference,
    cagrReferencePercent: cagrReference == null ? null : cagrReference * 100,
    series: yearSummary,
    yearSummary,
    rounded,
  };
}

module.exports = {
  COMPOUND_FREQUENCY_COMPARE_FIXTURES,
  calcAnnualCompoundForComparison,
};
