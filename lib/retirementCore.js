const EPSILON = 1e-10;

const RETIREMENT_SAMPLE_PRESETS = {
  A: {
    currentAge: 40,
    retirementAge: 65,
    lifeExpectancy: 90,
    currentAssets: 100_000_000,
    monthlySaving: 1_000_000,
    annualReturn: 5,
    retirementReturn: 3,
    inflation: 2.5,
    monthlyExpense: 2_500_000,
  },
  B: {
    currentAge: 35,
    retirementAge: 60,
    lifeExpectancy: 90,
    currentAssets: 50_000_000,
    monthlySaving: 1_500_000,
    annualReturn: 6,
    retirementReturn: 3.5,
    inflation: 2,
    monthlyExpense: 3_000_000,
  },
  C: {
    currentAge: 50,
    retirementAge: 60,
    lifeExpectancy: 95,
    currentAssets: 300_000_000,
    monthlySaving: 500_000,
    annualReturn: 4,
    retirementReturn: 2.5,
    inflation: 3,
    monthlyExpense: 2_800_000,
  },
  D: {
    currentAge: 65,
    retirementAge: 65,
    lifeExpectancy: 90,
    currentAssets: 800_000_000,
    monthlySaving: 0,
    annualReturn: 0,
    retirementReturn: 3,
    inflation: 2.5,
    monthlyExpense: 3_000_000,
  },
};

function toFiniteNumber(value, fallback = NaN) {
  if (value === "" || value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function round(value, digits = 6) {
  if (!Number.isFinite(Number(value))) return value;
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function addError(errors, field, ko, en) {
  errors.push({ field, ko, en });
}

function validateRetirementInputs(input = {}) {
  const errors = [];
  const currentAge = toFiniteNumber(input.currentAge);
  const retirementAge = toFiniteNumber(input.retirementAge);
  const lifeExpectancy = toFiniteNumber(input.lifeExpectancy);
  const currentAssets = toFiniteNumber(input.currentAssets);
  const monthlySaving = toFiniteNumber(input.monthlySaving);
  const annualReturn = toFiniteNumber(input.annualReturn);
  const retirementReturn = toFiniteNumber(input.retirementReturn);
  const inflation = toFiniteNumber(input.inflation);
  const monthlyExpense = toFiniteNumber(input.monthlyExpense);

  if (!Number.isFinite(currentAge) || currentAge < 0) {
    addError(errors, "currentAge", "현재나이는 0 이상이어야 합니다.", "Current age must be 0 or greater.");
  }
  if (!Number.isFinite(retirementAge)) {
    addError(errors, "retirementAge", "은퇴나이는 숫자로 입력해야 합니다.", "Retirement age must be a valid number.");
  } else if (Number.isFinite(currentAge) && retirementAge < currentAge) {
    addError(errors, "retirementAge", "은퇴나이는 현재나이 이상이어야 합니다.", "Retirement age must be greater than or equal to current age.");
  }
  if (!Number.isFinite(lifeExpectancy)) {
    addError(errors, "lifeExpectancy", "기대수명은 숫자로 입력해야 합니다.", "Life expectancy must be a valid number.");
  } else if (Number.isFinite(retirementAge) && lifeExpectancy <= retirementAge) {
    addError(errors, "lifeExpectancy", "기대수명은 은퇴나이보다 커야 합니다.", "Life expectancy must be greater than retirement age.");
  }
  if (!Number.isFinite(currentAssets) || currentAssets < 0) {
    addError(errors, "currentAssets", "현재자산은 0 이상이어야 합니다.", "Current assets must be 0 or greater.");
  }
  if (!Number.isFinite(monthlySaving) || monthlySaving < 0) {
    addError(errors, "monthlySaving", "월저축은 0 이상이어야 합니다.", "Monthly saving must be 0 or greater.");
  }
  if (!Number.isFinite(monthlyExpense) || monthlyExpense < 0) {
    addError(errors, "monthlyExpense", "현재 월생활비는 0 이상이어야 합니다.", "Current monthly expense must be 0 or greater.");
  }
  if (!Number.isFinite(annualReturn) || annualReturn <= -99) {
    addError(errors, "annualReturn", "은퇴 전 예상수익률은 -99% 초과여야 합니다.", "Pre-retirement return must be greater than -99%.");
  }
  if (!Number.isFinite(retirementReturn) || retirementReturn <= -99) {
    addError(errors, "retirementReturn", "은퇴 후 예상수익률은 -99% 초과여야 합니다.", "Post-retirement return must be greater than -99%.");
  }
  if (!Number.isFinite(inflation) || inflation <= -99) {
    addError(errors, "inflation", "물가상승률은 -99% 초과여야 합니다.", "Inflation must be greater than -99%.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

function futureValueOfCurrentAssets(currentAssets, monthlyReturn, months) {
  const asset = Math.max(0, toFiniteNumber(currentAssets, 0));
  const n = Math.max(0, Math.floor(toFiniteNumber(months, 0)));
  const r = toFiniteNumber(monthlyReturn, 0);
  if (n === 0) return asset;
  return asset * Math.pow(1 + r, n);
}

function monthlySavingFutureValueFactor(monthlyReturn, months) {
  const n = Math.max(0, Math.floor(toFiniteNumber(months, 0)));
  const r = toFiniteNumber(monthlyReturn, 0);
  if (n === 0) return 0;
  if (Math.abs(r) < EPSILON) return n;
  return (Math.pow(1 + r, n) - 1) / r;
}

function futureValueOfMonthlySavings(monthlySaving, monthlyReturn, months) {
  const saving = Math.max(0, toFiniteNumber(monthlySaving, 0));
  return saving * monthlySavingFutureValueFactor(monthlyReturn, months);
}

function annuityPresentValueFactor(realMonthlyReturn, months) {
  const n = Math.max(0, Math.floor(toFiniteNumber(months, 0)));
  const r = toFiniteNumber(realMonthlyReturn, 0);
  if (n === 0) return 0;
  if (Math.abs(r) < EPSILON) return n;
  return (1 - Math.pow(1 + r, -n)) / r;
}

function calculateRequiredMonthlySaving({
  requiredRetirementFund,
  currentAssetsFutureValue,
  preRetirementMonthlyReturn,
  monthsToRetirement,
}) {
  const required = toFiniteNumber(requiredRetirementFund, 0);
  const assetFutureValue = toFiniteNumber(currentAssetsFutureValue, 0);
  const remaining = required - assetFutureValue;
  if (remaining <= 0) return 0;

  const factor = monthlySavingFutureValueFactor(
    preRetirementMonthlyReturn,
    monthsToRetirement
  );
  if (factor <= 0) return null;
  return remaining / factor;
}

function simulateRetirementPlan(input = {}) {
  const validation = validateRetirementInputs(input);
  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
    };
  }

  const currentAge = toFiniteNumber(input.currentAge, 0);
  const retirementAge = toFiniteNumber(input.retirementAge, currentAge);
  const lifeExpectancy = toFiniteNumber(input.lifeExpectancy, retirementAge + 1);
  const currentAssets = toFiniteNumber(input.currentAssets, 0);
  const monthlySaving = toFiniteNumber(input.monthlySaving, 0);
  const annualReturn = toFiniteNumber(input.annualReturn, 0);
  const retirementReturn = toFiniteNumber(input.retirementReturn, 0);
  const inflation = toFiniteNumber(input.inflation, 0);
  const monthlyExpense = toFiniteNumber(input.monthlyExpense, 0);

  const yearsToRetirement = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;
  const monthsToRetirement = Math.round(yearsToRetirement * 12);
  const retirementMonths = Math.round(retirementYears * 12);

  const preRetirementMonthlyReturn = annualReturn / 100 / 12;
  const inflationRate = inflation / 100;
  const retirementReturnRate = retirementReturn / 100;
  const realAnnualReturn =
    (1 + retirementReturnRate) / (1 + inflationRate) - 1;
  const realMonthlyReturn = realAnnualReturn / 12;

  const monthlyExpenseAtRetirement =
    monthlyExpense * Math.pow(1 + inflationRate, yearsToRetirement);
  const currentAssetsFutureValue = futureValueOfCurrentAssets(
    currentAssets,
    preRetirementMonthlyReturn,
    monthsToRetirement
  );
  const monthlySavingFutureValue = futureValueOfMonthlySavings(
    monthlySaving,
    preRetirementMonthlyReturn,
    monthsToRetirement
  );
  const expectedRetirementAssets =
    currentAssetsFutureValue + monthlySavingFutureValue;
  const annuityFactor = annuityPresentValueFactor(
    realMonthlyReturn,
    retirementMonths
  );
  const requiredRetirementFund = monthlyExpenseAtRetirement * annuityFactor;
  const surplusOrShortfall =
    expectedRetirementAssets - requiredRetirementFund;
  const achievementRate =
    requiredRetirementFund > 0
      ? (expectedRetirementAssets / requiredRetirementFund) * 100
      : 100;
  const sustainableMonthlyExpenseAtRetirement =
    annuityFactor > 0 ? expectedRetirementAssets / annuityFactor : 0;
  const sustainableMonthlyExpensePresentValue =
    yearsToRetirement === 0
      ? sustainableMonthlyExpenseAtRetirement
      : sustainableMonthlyExpenseAtRetirement /
        Math.pow(1 + inflationRate, yearsToRetirement);
  const requiredMonthlySaving = calculateRequiredMonthlySaving({
    requiredRetirementFund,
    currentAssetsFutureValue,
    preRetirementMonthlyReturn,
    monthsToRetirement,
  });

  return {
    ok: true,
    errors: [],
    input: {
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentAssets,
      monthlySaving,
      annualReturn,
      retirementReturn,
      inflation,
      monthlyExpense,
    },
    yearsToRetirement,
    retirementYears,
    monthsToRetirement,
    retirementMonths,
    preRetirementMonthlyReturn,
    realAnnualReturn,
    realMonthlyReturn,
    monthlyExpenseAtRetirement,
    currentAssetsFutureValue,
    monthlySavingFutureValue,
    expectedRetirementAssets,
    annuityFactor,
    requiredRetirementFund,
    surplusOrShortfall,
    achievementRate,
    sustainableMonthlyExpenseAtRetirement,
    sustainableMonthlyExpensePresentValue,
    requiredMonthlySaving,
    rounded: {
      yearsToRetirement: round(yearsToRetirement, 2),
      retirementYears: round(retirementYears, 2),
      monthlyExpenseAtRetirement: Math.round(monthlyExpenseAtRetirement),
      currentAssetsFutureValue: Math.round(currentAssetsFutureValue),
      monthlySavingFutureValue: Math.round(monthlySavingFutureValue),
      expectedRetirementAssets: Math.round(expectedRetirementAssets),
      requiredRetirementFund: Math.round(requiredRetirementFund),
      surplusOrShortfall: Math.round(surplusOrShortfall),
      achievementRate: round(achievementRate, 4),
      sustainableMonthlyExpenseAtRetirement: Math.round(
        sustainableMonthlyExpenseAtRetirement
      ),
      sustainableMonthlyExpensePresentValue: Math.round(
        sustainableMonthlyExpensePresentValue
      ),
      requiredMonthlySaving:
        requiredMonthlySaving == null ? null : Math.round(requiredMonthlySaving),
    },
  };
}

function buildRetirementSensitivity(input = {}) {
  const base = simulateRetirementPlan(input);
  if (!base.ok) return [];

  const scenarios = [
    {
      key: "annualReturnMinus1",
      group: "annualReturn",
      ko: "은퇴 전 수익률 -1%p",
      en: "Pre-retirement return -1pp",
      input: { ...input, annualReturn: toFiniteNumber(input.annualReturn, 0) - 1 },
    },
    {
      key: "annualReturnBase",
      group: "annualReturn",
      ko: "은퇴 전 수익률 기준",
      en: "Base pre-retirement return",
      input: { ...input },
    },
    {
      key: "annualReturnPlus1",
      group: "annualReturn",
      ko: "은퇴 전 수익률 +1%p",
      en: "Pre-retirement return +1pp",
      input: { ...input, annualReturn: toFiniteNumber(input.annualReturn, 0) + 1 },
    },
    {
      key: "retirementAgeBase",
      group: "retirementAge",
      ko: "은퇴나이 기준",
      en: "Base retirement age",
      input: { ...input },
    },
    {
      key: "retirementAgePlus3",
      group: "retirementAge",
      ko: "은퇴나이 +3년",
      en: "Retirement age +3 years",
      input: {
        ...input,
        retirementAge: toFiniteNumber(input.retirementAge, 0) + 3,
      },
    },
    {
      key: "retirementAgePlus5",
      group: "retirementAge",
      ko: "은퇴나이 +5년",
      en: "Retirement age +5 years",
      input: {
        ...input,
        retirementAge: toFiniteNumber(input.retirementAge, 0) + 5,
      },
    },
    {
      key: "monthlyExpenseMinus10",
      group: "monthlyExpense",
      ko: "월생활비 -10%",
      en: "Monthly expense -10%",
      input: {
        ...input,
        monthlyExpense: toFiniteNumber(input.monthlyExpense, 0) * 0.9,
      },
    },
    {
      key: "monthlyExpenseBase",
      group: "monthlyExpense",
      ko: "월생활비 기준",
      en: "Base monthly expense",
      input: { ...input },
    },
    {
      key: "monthlyExpensePlus10",
      group: "monthlyExpense",
      ko: "월생활비 +10%",
      en: "Monthly expense +10%",
      input: {
        ...input,
        monthlyExpense: toFiniteNumber(input.monthlyExpense, 0) * 1.1,
      },
    },
  ];

  return scenarios.map((scenario) => {
    const result = simulateRetirementPlan(scenario.input);
    return {
      ...scenario,
      result,
      rounded: result.ok ? result.rounded : null,
    };
  });
}

function buildRetirementYearRows(input = {}) {
  const result = simulateRetirementPlan(input);
  if (!result.ok) return [];

  const {
    currentAge,
    currentAssets,
    monthlySaving,
    annualReturn,
  } = result.input;
  const yearsToRetirement = Math.max(0, Math.floor(result.yearsToRetirement));
  const monthlyReturn = annualReturn / 100 / 12;
  const target = result.requiredRetirementFund;

  const rows = [];
  for (let elapsedYear = 0; elapsedYear <= yearsToRetirement; elapsedYear += 1) {
    const months = elapsedYear * 12;
    const currentAssetFutureValue = futureValueOfCurrentAssets(
      currentAssets,
      monthlyReturn,
      months
    );
    const savingFutureValue = futureValueOfMonthlySavings(
      monthlySaving,
      monthlyReturn,
      months
    );
    const expectedAssets = currentAssetFutureValue + savingFutureValue;
    const cumulativeSaving = monthlySaving * months;
    const investmentGain = expectedAssets - currentAssets - cumulativeSaving;
    const targetProgressRate = target > 0 ? (expectedAssets / target) * 100 : 100;

    rows.push({
      age: currentAge + elapsedYear,
      elapsedYear,
      expectedAssets,
      cumulativeSaving,
      investmentGain,
      targetProgressRate,
      rounded: {
        age: round(currentAge + elapsedYear, 2),
        elapsedYear,
        expectedAssets: Math.round(expectedAssets),
        cumulativeSaving: Math.round(cumulativeSaving),
        investmentGain: Math.round(investmentGain),
        targetProgressRate: round(targetProgressRate, 2),
      },
    });
  }

  return rows;
}

module.exports = {
  EPSILON,
  RETIREMENT_SAMPLE_PRESETS,
  toFiniteNumber,
  validateRetirementInputs,
  futureValueOfCurrentAssets,
  monthlySavingFutureValueFactor,
  futureValueOfMonthlySavings,
  annuityPresentValueFactor,
  calculateRequiredMonthlySaving,
  simulateRetirementPlan,
  buildRetirementSensitivity,
  buildRetirementYearRows,
};
