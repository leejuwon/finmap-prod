const BASIS_DATE = "2026-05-21";
const EPSILON = 1e-7;

function hasOwn(input, key) {
  return Object.prototype.hasOwnProperty.call(input, key);
}

function isBlank(value) {
  return value === "" || value === null || value === undefined;
}

function toFiniteNumber(value) {
  if (isBlank(value)) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function readNumber(input, keys, fallback = 0) {
  for (const key of keys) {
    if (!hasOwn(input, key)) continue;
    const value = toFiniteNumber(input[key]);
    return {
      value: value === null ? fallback : value,
      invalid: value === null,
      sourceKey: key,
    };
  }

  return { value: fallback, invalid: false, sourceKey: null };
}

function isWithin(value, min, max, options = {}) {
  const minOk = options.exclusiveMin ? value > min : value >= min;
  const maxOk = options.exclusiveMax ? value < max : value <= max;
  return minOk && maxOk;
}

function addRangeError(errors, key, value, min, max, options = {}) {
  if (!isWithin(value, min, max, options)) {
    errors.push({
      field: key,
      code: `${key}_out_of_range`,
      value,
      min,
      max,
      exclusiveMin: Boolean(options.exclusiveMin),
      exclusiveMax: Boolean(options.exclusiveMax),
    });
  }
}

function normalizeInput(input = {}) {
  const validationErrors = [];

  const annualIncome = readNumber(input, ["annualIncome"]);
  const annualRate = readNumber(input, ["annualRate"]);
  const loanTermYears = readNumber(input, ["loanTermYears", "loanYears"]);
  const ltvRate = readNumber(input, ["ltvRate", "ltvPercent"]);
  const dsrRate = readNumber(input, ["dsrRate", "dsrPercent"]);
  const extraCostRate = readNumber(input, ["extraCostRate", "costRatePercent"]);
  const targetHomePrice = readNumber(input, ["targetHomePrice"], 0);
  const existingMonthlyDebtPayment = readNumber(input, [
    "existingMonthlyDebtPayment",
    "existingMonthlyPayment",
  ]);

  const invalidReads = [
    ["annualIncome", annualIncome],
    ["annualRate", annualRate],
    ["loanTermYears", loanTermYears],
    ["ltvRate", ltvRate],
    ["dsrRate", dsrRate],
    ["extraCostRate", extraCostRate],
    ["targetHomePrice", targetHomePrice],
    ["existingMonthlyDebtPayment", existingMonthlyDebtPayment],
  ];

  invalidReads.forEach(([field, result]) => {
    if (result.invalid) {
      validationErrors.push({
        field,
        code: `${field}_invalid_number`,
        sourceKey: result.sourceKey,
      });
    }
  });

  let cashOnHandResult = readNumber(input, ["cashOnHand"], null);
  const assets = readNumber(input, ["assets"], 0);
  const reserveCash = readNumber(input, ["reserveCash"], 0);

  if (cashOnHandResult.sourceKey === null) {
    cashOnHandResult = {
      value: Math.max(assets.value - reserveCash.value, 0),
      invalid: assets.invalid || reserveCash.invalid,
      sourceKey: assets.sourceKey || reserveCash.sourceKey,
    };
  }

  if (cashOnHandResult.invalid) {
    validationErrors.push({
      field: "cashOnHand",
      code: "cashOnHand_invalid_number",
      sourceKey: cashOnHandResult.sourceKey,
    });
  }

  const normalized = {
    annualIncome: annualIncome.value,
    cashOnHand: cashOnHandResult.value,
    existingMonthlyDebtPayment: existingMonthlyDebtPayment.value,
    annualRate: annualRate.value,
    loanTermYears: loanTermYears.value,
    ltvRate: ltvRate.value,
    dsrRate: dsrRate.value,
    extraCostRate: extraCostRate.value,
    targetHomePrice: targetHomePrice.value,
    assets: assets.value,
    reserveCash: reserveCash.value,
  };

  addRangeError(validationErrors, "annualIncome", normalized.annualIncome, 0, Infinity, {
    exclusiveMin: true,
  });
  addRangeError(validationErrors, "cashOnHand", normalized.cashOnHand, 0, Infinity);
  addRangeError(
    validationErrors,
    "existingMonthlyDebtPayment",
    normalized.existingMonthlyDebtPayment,
    0,
    Infinity
  );
  addRangeError(validationErrors, "annualRate", normalized.annualRate, 0, 30, {
    exclusiveMax: true,
  });
  addRangeError(validationErrors, "loanTermYears", normalized.loanTermYears, 0, 50, {
    exclusiveMin: true,
  });
  addRangeError(validationErrors, "ltvRate", normalized.ltvRate, 0, 100, {
    exclusiveMin: true,
  });
  addRangeError(validationErrors, "dsrRate", normalized.dsrRate, 0, 100, {
    exclusiveMin: true,
  });
  addRangeError(validationErrors, "extraCostRate", normalized.extraCostRate, 0, 30);
  addRangeError(validationErrors, "targetHomePrice", normalized.targetHomePrice, 0, Infinity);

  return { ...normalized, validationErrors };
}

function safeForCalculation(value) {
  return Math.max(0, Number.isFinite(value) ? value : 0);
}

function clampForScenario(value, min, max) {
  return Math.min(max, Math.max(min, safeForCalculation(value)));
}

function getMonths(loanTermYears) {
  return Math.max(0, Math.floor(safeForCalculation(loanTermYears) * 12));
}

export function calculateMonthlyPaymentFactor(annualRatePercent, months) {
  const periodCount = Math.max(0, Math.floor(Number(months) || 0));
  if (periodCount <= 0) return 0;

  const monthlyRate = safeForCalculation(annualRatePercent) / 100 / 12;
  if (monthlyRate === 0) return 1 / periodCount;

  const compoundFactor = Math.pow(1 + monthlyRate, periodCount);
  return (monthlyRate * compoundFactor) / (compoundFactor - 1);
}

export function calculateMonthlyPayment(loanAmount, annualRatePercent, months) {
  const principal = safeForCalculation(loanAmount);
  if (principal <= 0) return 0;
  return principal * calculateMonthlyPaymentFactor(annualRatePercent, months);
}

export function calculateLoanFromMonthlyPayment(monthlyPayment, annualRatePercent, months) {
  const payment = safeForCalculation(monthlyPayment);
  const factor = calculateMonthlyPaymentFactor(annualRatePercent, months);
  if (payment <= 0 || factor <= 0) return 0;
  return payment / factor;
}

function getCanonicalInput(input) {
  const normalized = normalizeInput(input);
  return {
    annualIncome: normalized.annualIncome,
    cashOnHand: normalized.cashOnHand,
    existingMonthlyDebtPayment: normalized.existingMonthlyDebtPayment,
    annualRate: normalized.annualRate,
    loanTermYears: normalized.loanTermYears,
    ltvRate: normalized.ltvRate,
    dsrRate: normalized.dsrRate,
    extraCostRate: normalized.extraCostRate,
    targetHomePrice: normalized.targetHomePrice,
    assets: normalized.assets,
    reserveCash: normalized.reserveCash,
  };
}

function getCandidateShortfall({ candidateRequiredLoan, dsrLoanCapacity, candidateMaxLoanByLtv, candidateCashRequirement, cashOnHand }) {
  const dsr = Math.max(candidateRequiredLoan - dsrLoanCapacity, 0) / Math.max(candidateRequiredLoan, 1);
  const ltv = Math.max(candidateRequiredLoan - candidateMaxLoanByLtv, 0) / Math.max(candidateRequiredLoan, 1);
  const cash = Math.max(candidateCashRequirement - cashOnHand, 0) / Math.max(candidateCashRequirement, 1);
  return {
    dsr,
    ltv,
    cash,
    max: Math.max(dsr, ltv, cash),
  };
}

function getCandidateStatus(candidateChecks, candidateShortfallRates) {
  if (candidateChecks.dsr && candidateChecks.ltv && candidateChecks.cash) return "PASS";
  if (candidateShortfallRates.max > 0 && candidateShortfallRates.max <= 0.05) return "WARNING";
  return "FAIL";
}

function calculateBase(input) {
  const normalized = normalizeInput(input);
  const validationErrors = normalized.validationErrors;

  const annualIncome = safeForCalculation(normalized.annualIncome);
  const cashOnHand = safeForCalculation(normalized.cashOnHand);
  const existingMonthlyDebtPayment = safeForCalculation(normalized.existingMonthlyDebtPayment);
  const annualRate = safeForCalculation(normalized.annualRate);
  const loanTermYears = safeForCalculation(normalized.loanTermYears);
  const ltvRate = Math.min(100, safeForCalculation(normalized.ltvRate));
  const dsrRate = Math.min(100, safeForCalculation(normalized.dsrRate));
  const extraCostRate = Math.min(30, safeForCalculation(normalized.extraCostRate));
  const targetHomePrice = safeForCalculation(normalized.targetHomePrice);
  const months = getMonths(loanTermYears);

  const ltvRatio = ltvRate / 100;
  const extraCostRatio = extraCostRate / 100;
  const monthlyDsrPaymentLimit = (annualIncome * dsrRate) / 100 / 12;
  const newMortgageMonthlyPaymentCapacity = Math.max(
    monthlyDsrPaymentLimit - existingMonthlyDebtPayment,
    0
  );
  const monthlyPaymentFactor = calculateMonthlyPaymentFactor(annualRate, months);
  const dsrLoanCapacity =
    monthlyPaymentFactor > 0 ? newMortgageMonthlyPaymentCapacity / monthlyPaymentFactor : 0;
  const dsrPriceLimit = ltvRatio > 0 ? dsrLoanCapacity / ltvRatio : 0;
  const cashLtvDenominator = 1 - ltvRatio + extraCostRatio;
  const cashLtvPriceLimit =
    cashLtvDenominator > 0 ? cashOnHand / cashLtvDenominator : Number.POSITIVE_INFINITY;

  const finalAffordablePrice = Math.max(0, Math.min(dsrPriceLimit, cashLtvPriceLimit));
  const safeSearchPriceLow = finalAffordablePrice * 0.8;
  const safeSearchPriceHigh = finalAffordablePrice * 0.9;
  const finalLoanAmount = Math.max(
    0,
    Math.min(dsrLoanCapacity, finalAffordablePrice * ltvRatio)
  );
  const finalMonthlyPayment = finalLoanAmount * monthlyPaymentFactor;
  const finalDsrUsageRate =
    annualIncome > 0
      ? ((existingMonthlyDebtPayment + finalMonthlyPayment) * 12 * 100) / annualIncome
      : 0;
  const finalExtraCost = finalAffordablePrice * extraCostRatio;
  const requiredEquity = Math.max(0, finalAffordablePrice + finalExtraCost - finalLoanAmount);
  const appliedLtv = finalAffordablePrice > 0 ? (finalLoanAmount / finalAffordablePrice) * 100 : 0;
  const bottleneck = dsrPriceLimit < cashLtvPriceLimit ? "DSR" : "CASH_LTV";

  const candidateExtraCost = targetHomePrice * extraCostRatio;
  const candidateRequiredLoan = Math.max(targetHomePrice + candidateExtraCost - cashOnHand, 0);
  const candidateMaxLoanByLtv = targetHomePrice * ltvRatio;
  const candidateMonthlyPayment = candidateRequiredLoan * monthlyPaymentFactor;
  const candidateDsrUsageRate =
    annualIncome > 0
      ? ((existingMonthlyDebtPayment + candidateMonthlyPayment) * 12 * 100) / annualIncome
      : 0;
  const candidateCashRequirement = targetHomePrice * (1 - ltvRatio + extraCostRatio);
  const candidateChecks = {
    dsr: candidateRequiredLoan <= dsrLoanCapacity + EPSILON,
    ltv: candidateRequiredLoan <= candidateMaxLoanByLtv + EPSILON,
    cash: cashOnHand + EPSILON >= candidateCashRequirement,
  };
  const candidateAffordable =
    candidateChecks.dsr && candidateChecks.ltv && candidateChecks.cash;
  const candidateShortfallRates = getCandidateShortfall({
    candidateRequiredLoan,
    dsrLoanCapacity,
    candidateMaxLoanByLtv,
    candidateCashRequirement,
    cashOnHand,
  });
  const candidateStatus = getCandidateStatus(candidateChecks, candidateShortfallRates);
  const candidateCashGap = cashOnHand - candidateCashRequirement;

  const warnings = [];
  if (normalized.annualIncome <= 0) warnings.push("annual_income_required");
  if (months <= 0) warnings.push("loan_term_required");
  if (normalized.assets < normalized.reserveCash) warnings.push("reserve_exceeds_assets");
  if (newMortgageMonthlyPaymentCapacity <= 0 && annualIncome > 0) {
    warnings.push("dsr_capacity_exhausted");
  }
  if (ltvRate >= 100 && extraCostRate === 0) warnings.push("ltv_100_no_cost");

  return {
    basisDate: BASIS_DATE,
    validationErrors,
    isValid: validationErrors.length === 0,

    annualIncome,
    cashOnHand,
    existingMonthlyDebtPayment,
    annualRate,
    loanTermYears,
    ltvRate,
    dsrRate,
    extraCostRate,
    targetHomePrice,
    months,
    monthlyPaymentFactor,

    monthlyDsrPaymentLimit,
    newMortgageMonthlyPaymentCapacity,
    dsrLoanCapacity,
    dsrPriceLimit,
    cashLtvPriceLimit,
    finalAffordablePrice,
    safeSearchPriceLow,
    safeSearchPriceHigh,
    finalLoanAmount,
    finalMonthlyPayment,
    finalDsrUsageRate,
    finalExtraCost,
    requiredEquity,
    appliedLtv,
    bottleneck,

    candidateExtraCost,
    candidateRequiredLoan,
    candidateMaxLoanByLtv,
    candidateMonthlyPayment,
    candidateDsrUsageRate,
    candidateCashRequirement,
    candidateCashGap,
    candidateChecks,
    candidateAffordable,
    candidateShortfallRates,
    candidateStatus,

    assets: normalized.assets,
    reserveCash: normalized.reserveCash,
    usableCash: cashOnHand,
    existingMonthlyPayment: existingMonthlyDebtPayment,
    existingAnnualPayment: existingMonthlyDebtPayment * 12,
    loanYears: loanTermYears,
    ltvPercent: ltvRate,
    dsrPercent: dsrRate,
    costRatePercent: extraCostRate,
    dsrAnnualPaymentLimit: monthlyDsrPaymentLimit * 12,
    newMonthlyPaymentLimit: newMortgageMonthlyPaymentCapacity,
    loanLimitByDsr: dsrLoanCapacity,
    priceLimitByDsr: dsrPriceLimit,
    priceLimitByLtvAndCash: cashLtvPriceLimit,
    purchasePriceMax: finalAffordablePrice,
    loanAmount: finalLoanAmount,
    expectedMonthlyPayment: finalMonthlyPayment,
    appliedDsr: finalDsrUsageRate,
    safePriceLow: safeSearchPriceLow,
    safePriceHigh: safeSearchPriceHigh,
    warnings,
  };
}

export function buildDsrLtvSensitivity(input) {
  const baseInput = getCanonicalInput(input);
  const specs = [
    {
      key: "rate_minus1",
      group: "rate",
      labelKo: "금리 -1%p",
      labelEn: "Rate -1%p",
      input: { annualRate: clampForScenario(baseInput.annualRate - 1, 0, 29.999) },
    },
    {
      key: "rate_base",
      group: "rate",
      labelKo: "금리 기준",
      labelEn: "Base rate",
      input: {},
    },
    {
      key: "rate_plus1",
      group: "rate",
      labelKo: "금리 +1%p",
      labelEn: "Rate +1%p",
      input: { annualRate: clampForScenario(baseInput.annualRate + 1, 0, 29.999) },
    },
    {
      key: "rate_plus2",
      group: "rate",
      labelKo: "금리 +2%p",
      labelEn: "Rate +2%p",
      input: { annualRate: clampForScenario(baseInput.annualRate + 2, 0, 29.999) },
    },
    {
      key: "dsr_minus5",
      group: "dsr",
      labelKo: "DSR -5%p",
      labelEn: "DSR -5%p",
      input: { dsrRate: clampForScenario(baseInput.dsrRate - 5, 0.001, 100) },
    },
    {
      key: "dsr_base",
      group: "dsr",
      labelKo: "DSR 기준",
      labelEn: "Base DSR",
      input: {},
    },
    {
      key: "dsr_plus5",
      group: "dsr",
      labelKo: "DSR +5%p",
      labelEn: "DSR +5%p",
      input: { dsrRate: clampForScenario(baseInput.dsrRate + 5, 0.001, 100) },
    },
    {
      key: "debt_zero",
      group: "debt",
      labelKo: "기존 월상환액 0원",
      labelEn: "No existing monthly debt",
      input: { existingMonthlyDebtPayment: 0 },
    },
    {
      key: "debt_base",
      group: "debt",
      labelKo: "기존 월상환액 기준",
      labelEn: "Base existing debt",
      input: {},
    },
    {
      key: "debt_plus500k",
      group: "debt",
      labelKo: "기존 월상환액 +50만원",
      labelEn: "Existing debt + KRW 500k",
      input: {
        existingMonthlyDebtPayment: baseInput.existingMonthlyDebtPayment + 500000,
      },
    },
    {
      key: "ltv_minus10",
      group: "ltv",
      labelKo: "LTV -10%p",
      labelEn: "LTV -10%p",
      input: { ltvRate: clampForScenario(baseInput.ltvRate - 10, 0.001, 100) },
    },
    {
      key: "ltv_base",
      group: "ltv",
      labelKo: "LTV 기준",
      labelEn: "Base LTV",
      input: {},
    },
    {
      key: "ltv_plus10",
      group: "ltv",
      labelKo: "LTV +10%p",
      labelEn: "LTV +10%p",
      input: { ltvRate: clampForScenario(baseInput.ltvRate + 10, 0.001, 100) },
    },
  ];

  return specs.map((spec) => ({
    ...spec,
    ...calculateBase({
      ...baseInput,
      ...spec.input,
    }),
  }));
}

export function calculateDsrLtvAffordability(input) {
  const base = calculateBase(input);
  const scenarioPlus1 = calculateBase({
    ...input,
    annualRate: safeForCalculation(input.annualRate) + 1,
  });
  const scenarioPlus2 = calculateBase({
    ...input,
    annualRate: safeForCalculation(input.annualRate) + 2,
  });

  return {
    ...base,
    scenarios: [
      { key: "base", rateShock: 0, label: "base", ...base },
      { key: "plus1", rateShock: 1, label: "+1%p", ...scenarioPlus1 },
      { key: "plus2", rateShock: 2, label: "+2%p", ...scenarioPlus2 },
    ],
    extendedSensitivity: buildDsrLtvSensitivity(input),
  };
}
