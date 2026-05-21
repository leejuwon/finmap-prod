const BASIS_DATE = "2026-05-21";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function nonNegative(value) {
  return Math.max(0, toNumber(value));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, toNumber(value)));
}

function getMonthlyRate(annualRatePercent) {
  return toNumber(annualRatePercent) / 100 / 12;
}

export function calculateMonthlyPayment(loanAmount, annualRatePercent, months) {
  const principal = nonNegative(loanAmount);
  const periodCount = Math.max(0, Math.floor(toNumber(months)));
  if (principal <= 0 || periodCount <= 0) return 0;

  const monthlyRate = getMonthlyRate(annualRatePercent);
  if (monthlyRate === 0) return principal / periodCount;

  const factor = Math.pow(1 + monthlyRate, periodCount);
  return principal * (monthlyRate * factor) / (factor - 1);
}

export function calculateLoanFromMonthlyPayment(monthlyPayment, annualRatePercent, months) {
  const payment = nonNegative(monthlyPayment);
  const periodCount = Math.max(0, Math.floor(toNumber(months)));
  if (payment <= 0 || periodCount <= 0) return 0;

  const monthlyRate = getMonthlyRate(annualRatePercent);
  if (monthlyRate === 0) return payment * periodCount;

  return payment * (1 - Math.pow(1 + monthlyRate, -periodCount)) / monthlyRate;
}

function calculateBase(input) {
  const assets = nonNegative(input.assets);
  const annualIncome = nonNegative(input.annualIncome);
  const existingMonthlyPayment = nonNegative(input.existingMonthlyPayment);
  const annualRate = Math.max(0, toNumber(input.annualRate));
  const loanYears = Math.max(0, toNumber(input.loanYears));
  const ltvPercent = clamp(input.ltvPercent, 0, 100);
  const dsrPercent = clamp(input.dsrPercent, 0, 100);
  const costRatePercent = clamp(input.costRatePercent, 0, 50);
  const reserveCash = nonNegative(input.reserveCash);

  const ltvRate = ltvPercent / 100;
  const dsrRate = dsrPercent / 100;
  const costRate = costRatePercent / 100;
  const months = Math.max(0, Math.floor(loanYears * 12));

  const usableCash = Math.max(0, assets - reserveCash);
  const existingAnnualPayment = existingMonthlyPayment * 12;
  const dsrAnnualPaymentLimit = annualIncome * dsrRate;
  const newAnnualPaymentLimit = Math.max(0, dsrAnnualPaymentLimit - existingAnnualPayment);
  const newMonthlyPaymentLimit = newAnnualPaymentLimit / 12;
  const loanLimitByDsr = calculateLoanFromMonthlyPayment(newMonthlyPaymentLimit, annualRate, months);

  const priceLimitByDsr = (usableCash + loanLimitByDsr) / (1 + costRate);
  const ltvCashDenominator = 1 + costRate - ltvRate;
  const priceLimitByLtvAndCash =
    ltvCashDenominator > 0 ? usableCash / ltvCashDenominator : Number.POSITIVE_INFINITY;

  const purchasePriceMax = Math.max(0, Math.min(priceLimitByDsr, priceLimitByLtvAndCash));
  const rawLoanNeeded = Math.max(0, purchasePriceMax * (1 + costRate) - usableCash);
  const loanAmount = Math.max(0, Math.min(rawLoanNeeded, loanLimitByDsr, purchasePriceMax * ltvRate));
  const requiredEquity = Math.max(0, purchasePriceMax * (1 + costRate) - loanAmount);
  const expectedMonthlyPayment = calculateMonthlyPayment(loanAmount, annualRate, months);

  const appliedDsr =
    annualIncome > 0 ? ((existingAnnualPayment + expectedMonthlyPayment * 12) / annualIncome) * 100 : 0;
  const appliedLtv = purchasePriceMax > 0 ? (loanAmount / purchasePriceMax) * 100 : 0;

  let bottleneck = "balanced";
  if (annualIncome <= 0) bottleneck = "income";
  else if (months <= 0) bottleneck = "term";
  else if (usableCash <= 0 && ltvPercent < 100) bottleneck = "cash";
  else if (newMonthlyPaymentLimit <= 0) bottleneck = "dsr_existing_debt";
  else if (priceLimitByDsr < priceLimitByLtvAndCash * 0.995) bottleneck = "dsr";
  else if (priceLimitByLtvAndCash < priceLimitByDsr * 0.995) bottleneck = "ltv_cash";

  const warnings = [];
  if (annualIncome <= 0) warnings.push("annual_income_required");
  if (months <= 0) warnings.push("loan_term_required");
  if (assets < reserveCash) warnings.push("reserve_exceeds_assets");
  if (newMonthlyPaymentLimit <= 0 && annualIncome > 0) warnings.push("dsr_capacity_exhausted");
  if (ltvPercent >= 100 && costRatePercent === 0) warnings.push("ltv_100_no_cost");

  return {
    basisDate: BASIS_DATE,
    assets,
    annualIncome,
    existingMonthlyPayment,
    existingAnnualPayment,
    annualRate,
    loanYears,
    months,
    ltvPercent,
    dsrPercent,
    costRatePercent,
    reserveCash,
    usableCash,
    dsrAnnualPaymentLimit,
    newMonthlyPaymentLimit,
    loanLimitByDsr,
    priceLimitByDsr,
    priceLimitByLtvAndCash: Number.isFinite(priceLimitByLtvAndCash) ? priceLimitByLtvAndCash : 0,
    purchasePriceMax,
    loanAmount,
    requiredEquity,
    expectedMonthlyPayment,
    appliedDsr,
    appliedLtv,
    bottleneck,
    safePriceLow: purchasePriceMax * 0.8,
    safePriceHigh: purchasePriceMax * 0.9,
    warnings,
  };
}

export function calculateDsrLtvAffordability(input) {
  const base = calculateBase(input);
  const scenarioPlus1 = calculateBase({
    ...input,
    annualRate: toNumber(input.annualRate) + 1,
  });
  const scenarioPlus2 = calculateBase({
    ...input,
    annualRate: toNumber(input.annualRate) + 2,
  });

  return {
    ...base,
    scenarios: [
      { key: "base", rateShock: 0, label: "base", ...base },
      { key: "plus1", rateShock: 1, label: "+1%p", ...scenarioPlus1 },
      { key: "plus2", rateShock: 2, label: "+2%p", ...scenarioPlus2 },
    ],
  };
}
