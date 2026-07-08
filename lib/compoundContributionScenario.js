const {
  toFiniteNumber,
  validateCompoundInputs,
} = require("./compoundCore");

const BASE_SCENARIO = {
  principal: 10_000_000,
  monthly: 300_000,
  annualRate: 7,
  years: 10,
  taxRatePercent: 15.4,
  feeRatePercent: 0.5,
  inflationRate: 0,
  monthlyGrowthRatePercent: 0,
  extraContributionAmount: 0,
  extraContributionMonth: null,
  currency: "KRW",
  baseYear: 2026,
};

const COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES = {
  A: { ...BASE_SCENARIO, label: "Fixed monthly contribution" },
  B: {
    ...BASE_SCENARIO,
    label: "No tax or fee",
    taxRatePercent: 0,
    feeRatePercent: 0,
  },
  C: {
    ...BASE_SCENARIO,
    label: "Monthly contribution grows 5% annually",
    monthlyGrowthRatePercent: 5,
  },
  D: {
    ...BASE_SCENARIO,
    label: "KRW 5m extra contribution in month 25",
    extraContributionAmount: 5_000_000,
    extraContributionMonth: 25,
  },
  E: {
    ...BASE_SCENARIO,
    label: "5% annual contribution growth and KRW 5m extra",
    monthlyGrowthRatePercent: 5,
    extraContributionAmount: 5_000_000,
    extraContributionMonth: 25,
  },
  F: {
    ...BASE_SCENARIO,
    label: "Zero return with contribution growth and extra",
    annualRate: 0,
    feeRatePercent: 0,
    monthlyGrowthRatePercent: 5,
    extraContributionAmount: 5_000_000,
    extraContributionMonth: 25,
  },
  G: {
    ...BASE_SCENARIO,
    label: "Loss with an extra contribution",
    annualRate: -3,
    feeRatePercent: 0.5,
    extraContributionAmount: 5_000_000,
    extraContributionMonth: 25,
  },
  H: {
    ...BASE_SCENARIO,
    label: "Growth and extra contribution with inflation",
    inflationRate: 2.5,
    monthlyGrowthRatePercent: 5,
    extraContributionAmount: 5_000_000,
    extraContributionMonth: 25,
  },
};

function numberOrDefault(value, fallback) {
  if (value == null || value === "") return fallback;
  return Number(value);
}

function roundMoney(value) {
  return Math.round(toFiniteNumber(value));
}

function addError(errors, field, ko, en) {
  errors.push({ field, ko, en });
}

function normalizeInput(input = {}) {
  return {
    principal: numberOrDefault(input.principal, 0),
    monthly: numberOrDefault(input.monthly, 0),
    annualRate: numberOrDefault(input.annualRate, 0),
    years: numberOrDefault(input.years, 0),
    taxRatePercent: numberOrDefault(input.taxRatePercent, 0),
    feeRatePercent: numberOrDefault(input.feeRatePercent, 0),
    inflationRate: numberOrDefault(input.inflationRate, 0),
    monthlyGrowthRatePercent: numberOrDefault(input.monthlyGrowthRatePercent, 0),
    extraContributionAmount: numberOrDefault(input.extraContributionAmount, 0),
    extraContributionMonth:
      input.extraContributionMonth == null || input.extraContributionMonth === ""
        ? null
        : Number(input.extraContributionMonth),
    currency: input.currency === "USD" ? "USD" : "KRW",
    baseYear: numberOrDefault(input.baseYear, new Date().getFullYear()),
  };
}

function validateScenarioInput(input) {
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
  const monthsTotal = input.years * 12;

  if (Number.isFinite(input.years) && input.years > 0 && !Number.isInteger(input.years)) {
    addError(
      errors,
      "years",
      "적립 시나리오 기간은 양의 정수 연도여야 합니다.",
      "Contribution scenario years must be a positive integer."
    );
  }
  if (
    !Number.isFinite(input.monthlyGrowthRatePercent) ||
    input.monthlyGrowthRatePercent <= -100 ||
    input.monthlyGrowthRatePercent > 100
  ) {
    addError(
      errors,
      "monthlyGrowthRatePercent",
      "월 적립금 증가율은 -100% 초과 100% 이하이어야 합니다.",
      "Monthly contribution growth must be greater than -100% and at most 100%."
    );
  }
  if (!Number.isFinite(input.extraContributionAmount) || input.extraContributionAmount < 0) {
    addError(
      errors,
      "extraContributionAmount",
      "일시 추가 납입금은 0 이상이어야 합니다.",
      "Extra contribution amount must be 0 or greater."
    );
  }

  if (input.extraContributionMonth != null) {
    if (
      !Number.isInteger(input.extraContributionMonth) ||
      input.extraContributionMonth < 1 ||
      !Number.isFinite(monthsTotal) ||
      input.extraContributionMonth > monthsTotal
    ) {
      addError(
        errors,
        "extraContributionMonth",
        "일시 추가 납입 월은 전체 투자 기간 내의 정수 월이어야 합니다.",
        "Extra contribution month must be an integer within the investment period."
      );
    }
  } else if (Number.isFinite(input.extraContributionAmount) && input.extraContributionAmount > 0) {
    addError(
      errors,
      "extraContributionMonth",
      "일시 추가 납입금이 있으면 납입 월을 지정해야 합니다.",
      "Extra contribution month is required when an extra contribution amount is set."
    );
  }

  return { ok: errors.length === 0, errors };
}

function allFinite(values) {
  return values.every((value) => Number.isFinite(value));
}

function calcContributionScenario(rawInput = {}) {
  const input = normalizeInput(rawInput);
  const validation = validateScenarioInput(input);

  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      compounding: "monthly",
      input,
    };
  }

  const monthsTotal = input.years * 12;
  const netAnnualReturn = input.annualRate - input.feeRatePercent;
  const monthlyRate = netAnnualReturn / 100 / 12;
  const noFeeMonthlyRate = input.annualRate / 100 / 12;
  const growthRate = input.monthlyGrowthRatePercent / 100;
  let balance = input.principal;
  let balanceNoFee = input.principal;
  let principalTotal = input.principal;
  let cumulativeFee = 0;
  let yearOpeningBalance = input.principal;
  let yearContribution = 0;
  let yearRegularContribution = 0;
  let yearExtraContribution = 0;
  let yearInterest = 0;
  const monthlySummary = [];
  const yearSummary = [];

  for (let month = 1; month <= monthsTotal; month += 1) {
    const yearIndex = Math.floor((month - 1) / 12);
    const currentMonthly = input.monthly * Math.pow(1 + growthRate, yearIndex);
    const extraContribution =
      input.extraContributionMonth === month ? input.extraContributionAmount : 0;
    const contributionThisMonth = currentMonthly + extraContribution;
    const openingBalance = balance;
    const interestThisMonth = openingBalance * monthlyRate;
    const interestNoFeeThisMonth = balanceNoFee * noFeeMonthlyRate;

    balance = openingBalance + interestThisMonth + contributionThisMonth;
    balanceNoFee = balanceNoFee + interestNoFeeThisMonth + contributionThisMonth;
    principalTotal += contributionThisMonth;
    const nextCumulativeFee = Math.max(0, balanceNoFee - balance);
    const feeThisMonth = Math.max(0, nextCumulativeFee - cumulativeFee);
    cumulativeFee = nextCumulativeFee;
    yearContribution += contributionThisMonth;
    yearRegularContribution += currentMonthly;
    yearExtraContribution += extraContribution;
    yearInterest += interestThisMonth;

    monthlySummary.push({
      month,
      year: yearIndex + 1,
      calendarYear: input.baseYear + yearIndex,
      monthOfYear: (month - 1) % 12 + 1,
      openingBalance,
      currentMonthly,
      regularContribution: currentMonthly,
      extraContribution,
      contributionThisMonth,
      interestThisMonth,
      feeThisMonth,
      cumulativeFee,
      principalTotal,
      closingBalancePretax: balance,
      closingBalanceNoFee: balanceNoFee,
    });

    if (month % 12 === 0) {
      yearSummary.push({
        year: yearIndex + 1,
        calendarYear: input.baseYear + yearIndex,
        openingBalance: yearOpeningBalance,
        currentMonthlyAtYearStart: input.monthly * Math.pow(1 + growthRate, yearIndex),
        regularContributionYear: yearRegularContribution,
        extraContributionYear: yearExtraContribution,
        contributionYear: yearContribution,
        interestYear: yearInterest,
        closingBalancePretax: balance,
        closingBalanceNet: balance,
        principalTotal,
        taxYear: 0,
        cumulativeFee,
      });
      yearOpeningBalance = balance;
      yearContribution = 0;
      yearRegularContribution = 0;
      yearExtraContribution = 0;
      yearInterest = 0;
    }
  }

  const pretaxFinalAmount = balance;
  const pretaxInvestmentGain = pretaxFinalAmount - principalTotal;
  const tax = Math.max(pretaxInvestmentGain, 0) * input.taxRatePercent / 100;
  const afterTaxFinalAmount = pretaxFinalAmount - tax;
  const afterTaxInvestmentGain = afterTaxFinalAmount - principalTotal;
  const presentValue = afterTaxFinalAmount /
    Math.pow(1 + input.inflationRate / 100, input.years);
  const feeDrag = Math.max(0, balanceNoFee - pretaxFinalAmount);
  const totalReturn = principalTotal > 0
    ? afterTaxFinalAmount / principalTotal - 1
    : null;
  const cagrReference = principalTotal > 0 && afterTaxFinalAmount > 0
    ? Math.pow(afterTaxFinalAmount / principalTotal, 1 / input.years) - 1
    : null;

  const lastMonth = monthlySummary[monthlySummary.length - 1];
  if (lastMonth) {
    lastMonth.tax = tax;
    lastMonth.closingBalanceNet = afterTaxFinalAmount;
  }
  const lastYear = yearSummary[yearSummary.length - 1];
  if (lastYear) {
    lastYear.taxYear = tax;
    lastYear.closingBalanceNet = afterTaxFinalAmount;
  }

  const finiteValues = [
    principalTotal,
    pretaxFinalAmount,
    pretaxInvestmentGain,
    tax,
    feeDrag,
    afterTaxFinalAmount,
    afterTaxInvestmentGain,
    presentValue,
  ];
  if (!allFinite(finiteValues)) {
    return {
      ok: false,
      errors: [{
        field: "result",
        ko: "적립 시나리오 계산 결과가 유효한 숫자가 아닙니다.",
        en: "Contribution scenario result is not finite.",
      }],
      compounding: "monthly",
      input,
    };
  }

  const rounded = {
    months: monthsTotal,
    netAnnualReturn,
    principalTotal: roundMoney(principalTotal),
    pretaxFinalAmount: roundMoney(pretaxFinalAmount),
    pretaxInvestmentGain: roundMoney(pretaxInvestmentGain),
    tax: roundMoney(tax),
    feeDrag: roundMoney(feeDrag),
    afterTaxFinalAmount: roundMoney(afterTaxFinalAmount),
    afterTaxInvestmentGain: roundMoney(afterTaxInvestmentGain),
    presentValue: roundMoney(presentValue),
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
    monthsTotal,
    compounding: "monthly",
    monthlyGrowthRatePercent: input.monthlyGrowthRatePercent,
    extraContributionAmount: input.extraContributionAmount,
    extraContributionMonth: input.extraContributionMonth,
    taxRate: input.taxRatePercent / 100,
    feeRate: input.feeRatePercent / 100,
    inflationRate: input.inflationRate / 100,
    baseYear: input.baseYear,
    netAnnualReturn,
    monthlyRate,
    principalTotal,
    totalContribution: principalTotal,
    pretaxFinalAmount,
    futureValueGross: pretaxFinalAmount,
    pretaxInvestmentGain,
    tax,
    totalTax: tax,
    feeDrag,
    totalFee: feeDrag,
    afterTaxFinalAmount,
    futureValueNet: afterTaxFinalAmount,
    afterTaxInvestmentGain,
    totalInterestNet: afterTaxInvestmentGain,
    presentValue,
    totalReturn,
    totalReturnPercent: totalReturn == null ? null : totalReturn * 100,
    cagrReference,
    cagrReferencePercent: cagrReference == null ? null : cagrReference * 100,
    yearSummary,
    monthlySummary,
    rounded,
  };
}

module.exports = {
  COMPOUND_CONTRIBUTION_SCENARIO_FIXTURES,
  calcContributionScenario,
};
