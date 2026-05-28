function toFiniteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function roundMoney(value) {
  return Math.round(toFiniteNumber(value));
}

const COMPOUND_SAMPLE_PRESETS = {
  A: {
    labelKo: "A 기본형",
    labelEn: "A Base",
    initialAmount: 10_000_000,
    monthlyContribution: 300_000,
    years: 10,
    annualReturn: 5,
    taxRate: 0,
    feeRate: 0,
    inflationRate: 2,
  },
  B: {
    labelKo: "B 장기 적립",
    labelEn: "B Long-term",
    initialAmount: 0,
    monthlyContribution: 500_000,
    years: 20,
    annualReturn: 7,
    taxRate: 15.4,
    feeRate: 0.2,
    inflationRate: 2.5,
  },
  C: {
    labelKo: "C 수익률 0%",
    labelEn: "C 0% return",
    initialAmount: 10_000_000,
    monthlyContribution: 1_000_000,
    years: 5,
    annualReturn: 0,
    taxRate: 0,
    feeRate: 0,
    inflationRate: 0,
  },
  D: {
    labelKo: "D 손실 수익률",
    labelEn: "D Loss case",
    initialAmount: 50_000_000,
    monthlyContribution: 0,
    years: 10,
    annualReturn: -2,
    taxRate: 0,
    feeRate: 0,
    inflationRate: 2,
  },
};

function addError(errors, field, ko, en) {
  errors.push({ field, ko, en });
}

function validateCompoundInputs(input = {}) {
  const errors = [];
  const initialAmount = Number(input.initialAmount);
  const monthlyContribution = Number(input.monthlyContribution);
  const years = Number(input.years);
  const annualReturn = Number(input.annualReturn);
  const taxRate = Number(input.taxRate);
  const feeRate = Number(input.feeRate);
  const inflationRate = Number(input.inflationRate);

  if (!Number.isFinite(initialAmount) || initialAmount < 0) {
    addError(errors, "initialAmount", "초기 투자금은 0 이상이어야 합니다.", "Initial amount must be 0 or greater.");
  }
  if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) {
    addError(errors, "monthlyContribution", "월 납입금은 0 이상이어야 합니다.", "Monthly contribution must be 0 or greater.");
  }
  if (!Number.isFinite(years) || years <= 0) {
    addError(errors, "years", "투자 기간은 0보다 커야 합니다.", "Years must be greater than 0.");
  }
  if (!Number.isFinite(annualReturn) || annualReturn <= -99) {
    addError(errors, "annualReturn", "연 수익률은 -99% 초과여야 합니다.", "Annual return must be greater than -99%.");
  }
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
    addError(errors, "taxRate", "세율은 0% 이상 100% 이하이어야 합니다.", "Tax rate must be between 0% and 100%.");
  }
  if (!Number.isFinite(feeRate) || feeRate < 0 || feeRate >= 100) {
    addError(errors, "feeRate", "연 수수료율은 0% 이상 100% 미만이어야 합니다.", "Fee rate must be at least 0% and less than 100%.");
  }
  if (!Number.isFinite(inflationRate) || inflationRate <= -99) {
    addError(errors, "inflationRate", "물가상승률은 -99% 초과여야 합니다.", "Inflation rate must be greater than -99%.");
  }
  if (Number.isFinite(annualReturn) && Number.isFinite(feeRate) && annualReturn - feeRate <= -99) {
    addError(errors, "netAnnualReturn", "연 수익률에서 수수료율을 뺀 값은 -99% 초과여야 합니다.", "Annual return minus fee rate must be greater than -99%.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

function futureValueFactor(monthlyRate, months) {
  if (Math.abs(monthlyRate) < 1e-12) return months;
  return (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
}

function calculateClosedForm(input = {}, monthsOverride) {
  const initialAmount = toFiniteNumber(input.initialAmount, 0);
  const monthlyContribution = toFiniteNumber(input.monthlyContribution, 0);
  const years = toFiniteNumber(input.years, 0);
  const months = monthsOverride == null
    ? Math.max(1, Math.round(years * 12))
    : Math.max(1, Math.floor(toFiniteNumber(monthsOverride, 1)));
  const effectiveYears = months / 12;
  const annualReturn = toFiniteNumber(input.annualReturn, 0);
  const taxRate = toFiniteNumber(input.taxRate, 0);
  const feeRate = toFiniteNumber(input.feeRate, 0);
  const inflationRate = toFiniteNumber(input.inflationRate, 0);
  const netAnnualReturn = annualReturn - feeRate;
  const monthlyRate = netAnnualReturn / 100 / 12;
  const initialFutureValue = initialAmount * Math.pow(1 + monthlyRate, months);
  const monthlyContributionFutureValue = monthlyContribution * futureValueFactor(monthlyRate, months);
  const pretaxFinalAmount = initialFutureValue + monthlyContributionFutureValue;
  const principalTotal = initialAmount + monthlyContribution * months;
  const pretaxInvestmentGain = pretaxFinalAmount - principalTotal;
  const tax = Math.max(pretaxInvestmentGain, 0) * taxRate / 100;
  const afterTaxFinalAmount = pretaxFinalAmount - tax;
  const presentValue = afterTaxFinalAmount / Math.pow(1 + inflationRate / 100, effectiveYears);
  const totalReturn = principalTotal > 0 ? afterTaxFinalAmount / principalTotal - 1 : null;
  const cagrReference = principalTotal > 0 && afterTaxFinalAmount > 0
    ? Math.pow(afterTaxFinalAmount / principalTotal, 1 / effectiveYears) - 1
    : null;

  const noFeeMonthlyRate = annualReturn / 100 / 12;
  const noFeeTotal =
    initialAmount * Math.pow(1 + noFeeMonthlyRate, months) +
    monthlyContribution * futureValueFactor(noFeeMonthlyRate, months);
  const feeDrag = Math.max(0, noFeeTotal - pretaxFinalAmount);

  return {
    months,
    years: effectiveYears,
    netAnnualReturn,
    monthlyRate,
    initialFutureValue,
    monthlyContributionFutureValue,
    principalTotal,
    pretaxFinalAmount,
    pretaxInvestmentGain,
    tax,
    feeDrag,
    afterTaxFinalAmount,
    presentValue,
    afterTaxInvestmentGain: afterTaxFinalAmount - principalTotal,
    totalReturn,
    totalReturnPercent: totalReturn == null ? null : totalReturn * 100,
    cagrReference,
    cagrReferencePercent: cagrReference == null ? null : cagrReference * 100,
    rounded: {
      months,
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
      afterTaxInvestmentGain: roundMoney(afterTaxFinalAmount - principalTotal),
      totalReturnPercent: totalReturn == null ? null : totalReturn * 100,
      cagrReferencePercent: cagrReference == null ? null : cagrReference * 100,
    },
  };
}

function buildCompoundYearRows(input = {}) {
  const years = toFiniteNumber(input.years, 0);
  const months = Math.max(1, Math.round(years * 12));
  const maxYear = Math.ceil(months / 12);
  const rows = [];

  for (let year = 1; year <= maxYear; year += 1) {
    const rowMonths = Math.min(year * 12, months);
    const row = calculateClosedForm(input, rowMonths);
    rows.push({
      year,
      months: rowMonths,
      principalTotal: row.principalTotal,
      pretaxFinalAmount: row.pretaxFinalAmount,
      pretaxInvestmentGain: row.pretaxInvestmentGain,
      tax: row.tax,
      feeDrag: row.feeDrag,
      afterTaxFinalAmount: row.afterTaxFinalAmount,
      presentValue: row.presentValue,
      totalReturnPercent: row.totalReturnPercent,
      cagrReferencePercent: row.cagrReferencePercent,
      rounded: row.rounded,
    });
  }

  return rows;
}

function simulateCompoundPlan(input = {}) {
  const initialAmount = toFiniteNumber(input.initialAmount, 0);
  const monthlyContribution = toFiniteNumber(input.monthlyContribution, 0);
  const years = toFiniteNumber(input.years, 0);
  const annualReturn = toFiniteNumber(input.annualReturn, 0);
  const taxRate = toFiniteNumber(input.taxRate, 0);
  const feeRate = toFiniteNumber(input.feeRate, 0);
  const inflationRate = toFiniteNumber(input.inflationRate, 0);
  const baseYear = toFiniteNumber(input.baseYear, new Date().getFullYear());
  const months = input.months == null
    ? Math.max(1, Math.round(years * 12))
    : Math.max(1, Math.floor(toFiniteNumber(input.months, 1)));
  const effectiveYears = months / 12;

  const validation = validateCompoundInputs({
    initialAmount,
    monthlyContribution,
    years: effectiveYears,
    annualReturn,
    taxRate,
    feeRate,
    inflationRate,
  });

  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      input: {
        initialAmount,
        monthlyContribution,
        years: effectiveYears,
        annualReturn,
        taxRate,
        feeRate,
        inflationRate,
      },
    };
  }

  const closed = calculateClosedForm({
    initialAmount,
    monthlyContribution,
    years: effectiveYears,
    annualReturn,
    taxRate,
    feeRate,
    inflationRate,
  }, months);
  const {
    netAnnualReturn,
    monthlyRate,
    initialFutureValue,
    monthlyContributionFutureValue,
    pretaxFinalAmount,
    principalTotal,
    pretaxInvestmentGain,
    tax,
    afterTaxFinalAmount,
    afterTaxInvestmentGain,
    presentValue,
    totalReturn,
    cagrReference,
  } = closed;

  const noFeeMonthlyRate = annualReturn / 100 / 12;
  const noFeeInitialFutureValue = initialAmount * Math.pow(1 + noFeeMonthlyRate, months);
  const noFeeMonthlyContributionFutureValue =
    monthlyContribution * futureValueFactor(noFeeMonthlyRate, months);
  const feeDrag = closed.feeDrag;

  const series = [];
  const yearSummary = [];
  let balanceGross = initialAmount;
  let balanceNet = initialAmount;
  let balanceNoFee = initialAmount;
  let cumulativeTax = 0;
  let cumulativeFee = 0;
  let openingGrossYear = initialAmount;
  let openingNetYear = initialAmount;
  let contributionYear = 0;
  let interestYearGross = 0;
  let interestYearNet = 0;
  let feeYear = 0;

  for (let month = 1; month <= months; month += 1) {
    const beforeGross = balanceGross;
    const beforeNoFee = balanceNoFee;
    balanceGross = balanceGross * (1 + monthlyRate) + monthlyContribution;
    balanceNoFee = balanceNoFee * (1 + noFeeMonthlyRate) + monthlyContribution;
    balanceNet = balanceGross;

    const interestGross = beforeGross * monthlyRate;
    const noFeeInterest = beforeNoFee * noFeeMonthlyRate;
    const feeImpactMonth = Math.max(0, noFeeInterest - interestGross);
    cumulativeFee += feeImpactMonth;
    feeYear += feeImpactMonth;
    contributionYear += monthlyContribution;
    interestYearGross += interestGross;
    interestYearNet += interestGross;

    const isFinalMonth = month === months;
    if (isFinalMonth && tax > 0) {
      balanceNet = balanceGross - tax;
      cumulativeTax = tax;
    }

    series.push({
      month,
      balanceGross,
      balanceNet,
      contributionMonth: monthlyContribution,
      totalContribution: initialAmount + monthlyContribution * month,
      totalContributionRaw: initialAmount + monthlyContribution * month,
      cumulativeInterestGross: balanceGross - (initialAmount + monthlyContribution * month),
      cumulativeInterestNet: balanceNet - (initialAmount + monthlyContribution * month),
      cumulativeTax,
      cumulativeFee,
    });

    const isYearEnd = month % 12 === 0 || isFinalMonth;
    if (isYearEnd) {
      const year = Math.ceil(month / 12);
      const taxYear = isFinalMonth ? tax : 0;
      yearSummary.push({
        year,
        openingBalanceGross: openingGrossYear,
        openingBalanceNet: openingNetYear,
        contributionYear,
        closingBalanceGross: balanceGross,
        closingBalanceNet: balanceNet,
        interestYearGross,
        interestYearNet: interestYearGross - taxYear,
        taxYear,
        feeYear,
        cumulativeInterestGross: balanceGross - (initialAmount + monthlyContribution * month),
        cumulativeInterestNet: balanceNet - (initialAmount + monthlyContribution * month),
        cumulativeTax,
        cumulativeFee,
        calendarYear: baseYear + year - 1,
      });
      openingGrossYear = balanceGross;
      openingNetYear = balanceNet;
      contributionYear = 0;
      interestYearGross = 0;
      interestYearNet = 0;
      feeYear = 0;
    }
  }

  const rounded = closed.rounded;
  const yearAnalysisRows = buildCompoundYearRows({
    initialAmount,
    monthlyContribution,
    years: effectiveYears,
    annualReturn,
    taxRate,
    feeRate,
    inflationRate,
  });

  return {
    ok: true,
    errors: [],
    input: {
      initialAmount,
      monthlyContribution,
      years: effectiveYears,
      annualReturn,
      taxRate,
      feeRate,
      inflationRate,
    },
    principal: initialAmount,
    monthly: monthlyContribution,
    annualRate: annualReturn,
    yearsTotal: Math.ceil(months / 12),
    monthsTotal: months,
    compounding: input.compounding || "monthly",
    taxRate: taxRate / 100,
    feeRate: feeRate / 100,
    inflationRate: inflationRate / 100,
    baseYear,
    netAnnualReturn,
    monthlyRate,
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
    totalTax: tax,
    totalFee: feeDrag,
    totalTaxFee: tax + feeDrag,
    totalReturn,
    totalReturnPercent: totalReturn == null ? null : totalReturn * 100,
    cagrReference,
    cagrReferencePercent: cagrReference == null ? null : cagrReference * 100,
    series,
    yearSummary,
    yearAnalysisRows,
    rounded,
  };
}

function buildCompoundSensitivity(input = {}) {
  const base = {
    initialAmount: toFiniteNumber(input.initialAmount, 0),
    monthlyContribution: toFiniteNumber(input.monthlyContribution, 0),
    years: toFiniteNumber(input.years, 0),
    annualReturn: toFiniteNumber(input.annualReturn, 0),
    taxRate: toFiniteNumber(input.taxRate, 0),
    feeRate: toFiniteNumber(input.feeRate, 0),
    inflationRate: toFiniteNumber(input.inflationRate, 0),
  };

  const scenarios = [
    ...[-2, -1, 0, 1, 2].map((delta) => ({
      group: "rate",
      key: delta === 0 ? "rate_base" : `rate_${delta > 0 ? "plus" : "minus"}${Math.abs(delta)}`,
      delta,
      input: {
        ...base,
        annualReturn: Math.max(-98.9 + base.feeRate, base.annualReturn + delta),
      },
    })),
    ...[-0.2, 0, 0.2].map((delta) => ({
      group: "monthly",
      key: delta === 0 ? "monthly_base" : delta < 0 ? "monthly_minus20" : "monthly_plus20",
      delta,
      input: {
        ...base,
        monthlyContribution: Math.max(0, base.monthlyContribution * (1 + delta)),
      },
    })),
    ...[-5, 0, 5].map((delta) => ({
      group: "years",
      key: delta === 0 ? "years_base" : delta < 0 ? "years_minus5" : "years_plus5",
      delta,
      input: {
        ...base,
        years: Math.max(1, base.years + delta),
      },
    })),
  ];

  return scenarios.map((scenario) => {
    const result = simulateCompoundPlan(scenario.input);
    return {
      ...scenario,
      result,
      rounded: result.rounded || {},
    };
  });
}

function solveMonthlyContributionForTarget(input = {}) {
  const targetAmount = toFiniteNumber(input.targetAmount, 0);
  const base = {
    initialAmount: toFiniteNumber(input.initialAmount, 0),
    monthlyContribution: 0,
    years: toFiniteNumber(input.years, 0),
    annualReturn: toFiniteNumber(input.annualReturn, 0),
    taxRate: toFiniteNumber(input.taxRate, 0),
    feeRate: toFiniteNumber(input.feeRate, 0),
    inflationRate: toFiniteNumber(input.inflationRate, 0),
  };

  if (targetAmount <= 0 || base.years <= 0) return null;
  const zeroMonthly = simulateCompoundPlan(base);
  if (!zeroMonthly.ok) return null;
  if (zeroMonthly.afterTaxFinalAmount >= targetAmount) return 0;

  let low = 0;
  let high = Math.max(1, targetAmount / (base.years * 12));
  let guard = 0;
  const valueFor = (monthlyContribution) => simulateCompoundPlan({
    ...base,
    monthlyContribution,
  }).afterTaxFinalAmount || 0;

  while (valueFor(high) < targetAmount && guard < 60) {
    high *= 2;
    guard += 1;
  }
  if (guard >= 60) return null;

  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    if (valueFor(mid) >= targetAmount) high = mid;
    else low = mid;
  }

  return high;
}

function estimateYearsToTarget(input = {}) {
  const targetAmount = toFiniteNumber(input.targetAmount, 0);
  const base = {
    initialAmount: toFiniteNumber(input.initialAmount, 0),
    monthlyContribution: toFiniteNumber(input.monthlyContribution, 0),
    annualReturn: toFiniteNumber(input.annualReturn, 0),
    taxRate: toFiniteNumber(input.taxRate, 0),
    feeRate: toFiniteNumber(input.feeRate, 0),
    inflationRate: toFiniteNumber(input.inflationRate, 0),
  };

  if (targetAmount <= 0) return null;
  const immediate = simulateCompoundPlan({ ...base, years: 1 / 12, monthlyContribution: 0 });
  if (immediate.ok && immediate.afterTaxFinalAmount >= targetAmount) return 0;

  const valueFor = (years) => simulateCompoundPlan({ ...base, years }).afterTaxFinalAmount || 0;
  let low = 0;
  let high = 1;
  let guard = 0;

  while (valueFor(high) < targetAmount && high < 100 && guard < 40) {
    high *= 2;
    guard += 1;
  }
  if (high >= 100 && valueFor(100) < targetAmount) return null;

  for (let i = 0; i < 50; i += 1) {
    const mid = (low + high) / 2;
    if (valueFor(mid) >= targetAmount) high = mid;
    else low = mid;
  }

  return high;
}

module.exports = {
  COMPOUND_SAMPLE_PRESETS,
  toFiniteNumber,
  validateCompoundInputs,
  futureValueFactor,
  calculateClosedForm,
  buildCompoundYearRows,
  simulateCompoundPlan,
  buildCompoundSensitivity,
  solveMonthlyContributionForTarget,
  estimateYearsToTarget,
};
