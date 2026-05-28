// lib/goalSimulator.js

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeCompounding(value) {
  return value === "yearly" ? "yearly" : "monthly";
}

function getTargetAssetReturnMeta({
  annualRate = 0,
  compounding = "monthly",
  taxRatePercent = 0,
  feeRatePercent = 0,
  inflationPercent = 0,
  contribGrowthPercent = 0,
}) {
  const compoundingMode = normalizeCompounding(compounding);
  const rYear = toNumber(annualRate) / 100;
  const taxRate = Math.max(0, toNumber(taxRatePercent) / 100);
  const feeRate = Math.max(0, toNumber(feeRatePercent) / 100);

  let netYear = rYear;
  netYear *= 1 - taxRate;
  netYear -= feeRate;
  if (netYear < -0.99) netYear = -0.99;

  const grossMonth =
    compoundingMode === "yearly"
      ? Math.pow(1 + rYear, 1 / 12) - 1
      : rYear / 12;

  const netMonth =
    compoundingMode === "yearly"
      ? Math.pow(1 + netYear, 1 / 12) - 1
      : netYear / 12;

  const inflYear = toNumber(inflationPercent) / 100;
  const inflMonth =
    compoundingMode === "yearly"
      ? Math.pow(1 + inflYear, 1 / 12) - 1
      : inflYear / 12;

  const gYear = toNumber(contribGrowthPercent) / 100;
  const contribGrowthMonth =
    compoundingMode === "yearly"
      ? Math.pow(1 + gYear, 1 / 12) - 1
      : gYear / 12;

  return {
    compounding: compoundingMode,
    grossAnnualReturn: rYear,
    netAnnualReturn: netYear,
    grossMonth,
    netMonth,
    inflationMonth: inflMonth,
    contribGrowthMonth,
    taxRatePercent: toNumber(taxRatePercent),
    feeRatePercent: toNumber(feeRatePercent),
  };
}

function simulateGoalPath({
  current = 0,
  monthly = 0,
  annualRate = 0,
  years = 1,
  compounding = "monthly",
  taxRatePercent = 0,
  feeRatePercent = 0,
  inflationPercent = 0,
  contribGrowthPercent = 0,
}) {
  const months = Math.max(1, Math.floor(toNumber(years) * 12));
  const meta = getTargetAssetReturnMeta({
    annualRate,
    compounding,
    taxRatePercent,
    feeRatePercent,
    inflationPercent,
    contribGrowthPercent,
  });

  let invested = toNumber(current);
  let valueGross = invested;
  let valueNet = invested;
  const monthlyBase = toNumber(monthly);
  const rows = [];

  for (let m = 1; m <= months; m += 1) {
    const monthlyNow = monthlyBase * Math.pow(1 + meta.contribGrowthMonth, m - 1);
    invested += monthlyNow;

    // Existing screen logic: contribution is added first, then monthly return is applied.
    valueGross = (valueGross + monthlyNow) * (1 + meta.grossMonth);
    valueNet = (valueNet + monthlyNow) * (1 + meta.netMonth);

    const deflator = Math.pow(1 + meta.inflationMonth, m);
    const valueGrossReal = deflator > 0 ? valueGross / deflator : valueGross;
    const valueNetReal = deflator > 0 ? valueNet / deflator : valueNet;
    const investedReal = deflator > 0 ? invested / deflator : invested;

    if (m % 12 === 0 || m === months) {
      rows.push({
        year: Math.ceil(m / 12),
        month: m,
        invested,
        valueGross,
        valueNet,
        investedReal,
        valueGrossReal,
        valueNetReal,
      });
    }
  }

  return rows;
}

function getLastRow(rows = []) {
  return rows.length ? rows[rows.length - 1] : null;
}

function getValueFromLast(rows, valueKey = "valueNet") {
  const last = getLastRow(rows);
  return last ? toNumber(last[valueKey]) : 0;
}

function findFirstReachMonth({
  target,
  current,
  monthly,
  annualRate,
  years,
  compounding = "monthly",
  taxRatePercent = 0,
  feeRatePercent = 0,
  inflationPercent = 0,
  contribGrowthPercent = 0,
  valueKey = "valueNet",
}) {
  const targetValue = toNumber(target);
  if (targetValue <= 0) return null;
  if (toNumber(current) >= targetValue) return 0;

  const months = Math.max(1, Math.floor(toNumber(years) * 12));
  const meta = getTargetAssetReturnMeta({
    annualRate,
    compounding,
    taxRatePercent,
    feeRatePercent,
    inflationPercent,
    contribGrowthPercent,
  });

  let invested = toNumber(current);
  let valueGross = invested;
  let valueNet = invested;
  const monthlyBase = toNumber(monthly);

  for (let m = 1; m <= months; m += 1) {
    const monthlyNow = monthlyBase * Math.pow(1 + meta.contribGrowthMonth, m - 1);
    invested += monthlyNow;
    valueGross = (valueGross + monthlyNow) * (1 + meta.grossMonth);
    valueNet = (valueNet + monthlyNow) * (1 + meta.netMonth);

    const deflator = Math.pow(1 + meta.inflationMonth, m);
    const row = {
      month: m,
      year: Math.ceil(m / 12),
      invested,
      valueGross,
      valueNet,
      investedReal: deflator > 0 ? invested / deflator : invested,
      valueGrossReal: deflator > 0 ? valueGross / deflator : valueGross,
      valueNetReal: deflator > 0 ? valueNet / deflator : valueNet,
    };

    if (toNumber(row[valueKey]) >= targetValue) return m;
  }

  return null;
}

function solveRequiredMonthly({
  target,
  current,
  annualRate,
  years,
  compounding,
  taxRatePercent,
  feeRatePercent,
  inflationPercent,
  contribGrowthPercent,
  valueKey = "valueNet",
}) {
  const targetValue = toNumber(target);
  if (targetValue <= 0) return null;
  if (toNumber(current) >= targetValue) return 0;

  const finalValue = (monthly) => {
    const rows = simulateGoalPath({
      current,
      monthly,
      annualRate,
      years,
      compounding,
      taxRatePercent,
      feeRatePercent,
      inflationPercent,
      contribGrowthPercent,
    });
    return getValueFromLast(rows, valueKey);
  };

  let lo = 0;
  let hi = 1;
  while (finalValue(hi) < targetValue && hi < 1e12) hi *= 1.8;
  if (hi >= 1e12 && finalValue(hi) < targetValue) return null;

  for (let i = 0; i < 50; i += 1) {
    const mid = (lo + hi) / 2;
    if (finalValue(mid) >= targetValue) hi = mid;
    else lo = mid;
  }
  return hi;
}

function solveRequiredYears({
  target,
  current,
  monthly,
  annualRate,
  compounding,
  taxRatePercent,
  feeRatePercent,
  inflationPercent,
  contribGrowthPercent,
  valueKey = "valueNet",
  minYears = 0.5,
  maxYears = 80,
}) {
  const targetValue = toNumber(target);
  if (targetValue <= 0) return null;
  if (toNumber(current) >= targetValue) return 0;

  const finalValue = (years) => {
    const rows = simulateGoalPath({
      current,
      monthly,
      annualRate,
      years,
      compounding,
      taxRatePercent,
      feeRatePercent,
      inflationPercent,
      contribGrowthPercent,
    });
    return getValueFromLast(rows, valueKey);
  };

  if (finalValue(maxYears) < targetValue) return null;

  let lo = minYears;
  let hi = maxYears;
  for (let i = 0; i < 50; i += 1) {
    const mid = (lo + hi) / 2;
    if (finalValue(mid) >= targetValue) hi = mid;
    else lo = mid;
  }
  return hi;
}

function solveRequiredRate({
  target,
  current,
  monthly,
  years,
  compounding,
  taxRatePercent,
  feeRatePercent,
  inflationPercent,
  contribGrowthPercent,
  valueKey = "valueNet",
}) {
  const targetValue = toNumber(target);
  if (targetValue <= 0) return null;
  if (toNumber(current) >= targetValue) return 0;

  const finalValue = (annualRate) => {
    const rows = simulateGoalPath({
      current,
      monthly,
      annualRate,
      years,
      compounding,
      taxRatePercent,
      feeRatePercent,
      inflationPercent,
      contribGrowthPercent,
    });
    return getValueFromLast(rows, valueKey);
  };

  let lo = -99;
  let hi = 20;
  let guard = 0;
  while (finalValue(hi) < targetValue && guard < 30) {
    hi *= 1.5;
    guard += 1;
    if (hi > 500) return null;
  }

  for (let i = 0; i < 50; i += 1) {
    const mid = (lo + hi) / 2;
    if (finalValue(mid) >= targetValue) hi = mid;
    else lo = mid;
  }
  return hi;
}

function yearsFloatToYM(yFloat) {
  const y = toNumber(yFloat, NaN);
  if (!Number.isFinite(y) || y < 0) return null;
  const totalMonths = Math.max(0, Math.ceil(y * 12));
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    totalMonths,
  };
}

function formatYMText(ym, locale = "ko") {
  if (!ym) return null;
  const isKo = locale === "ko";
  const { years, months } = ym;

  if (isKo) {
    if (years <= 0) return `${months}개월`;
    if (months === 0) return `${years}년`;
    return `${years}년 ${months}개월`;
  }

  if (years <= 0) return `${months}m`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}m`;
}

function reachMonthToYM(reachMonth) {
  if (reachMonth == null) return null;
  const month = toNumber(reachMonth, NaN);
  if (!Number.isFinite(month) || month < 0) return null;
  if (month === 0) return { years: 0, months: 0, month: 0 };
  return {
    years: Math.floor((month - 1) / 12),
    months: ((month - 1) % 12) + 1,
    month,
  };
}

function formatReachText(reachMonth, locale = "ko") {
  const ym = reachMonthToYM(reachMonth);
  if (!ym) return null;
  if (ym.month === 0) return locale === "ko" ? "이미 달성" : "Already reached";
  return formatYMText({ years: ym.years, months: ym.months }, locale);
}

function summarizeTargetAssetRows(rows = [], {
  target = 0,
  current = 0,
  valueKey = "valueNet",
  grossKey = "valueGross",
  investedKey = "invested",
} = {}) {
  const last = getLastRow(rows);
  if (!last) return null;

  const finalNet = toNumber(last[valueKey]);
  const finalGross = toNumber(last[grossKey]);
  const totalInvested = toNumber(last[investedKey]);
  const currentAssets = toNumber(current);
  const addedPrincipal = Math.max(0, totalInvested - currentAssets);
  const netGain = finalNet - totalInvested;
  const grossGain = finalGross - totalInvested;
  const taxFeeDragApprox = Math.max(0, finalGross - finalNet);
  const targetValue = toNumber(target);
  const targetDelta = targetValue > 0 ? finalNet - targetValue : null;
  const targetReached = targetValue > 0 ? targetDelta >= 0 : null;
  const targetAchievementRate = targetValue > 0 ? (finalNet / targetValue) * 100 : null;

  return {
    finalNet,
    finalGross,
    totalInvested,
    currentAssets,
    addedPrincipal,
    netGain,
    grossGain,
    taxFeeDragApprox,
    target: targetValue,
    targetReached,
    targetDelta,
    shortfall: targetDelta == null ? null : Math.max(0, -targetDelta),
    surplus: targetDelta == null ? null : Math.max(0, targetDelta),
    targetAchievementRate,
    principalSharePct: finalNet > 0 ? (totalInvested / finalNet) * 100 : 0,
    gainSharePct: finalNet > 0 ? (netGain / finalNet) * 100 : 0,
  };
}

function buildTargetAssetScenario(rawOptions = {}) {
  const valueKey = rawOptions.valueKey || "valueNet";
  const grossKey = valueKey === "valueNetReal" ? "valueGrossReal" : "valueGross";
  const investedKey = valueKey === "valueNetReal" ? "investedReal" : "invested";
  const rows = simulateGoalPath(rawOptions);
  const summary = summarizeTargetAssetRows(rows, {
    target: rawOptions.target,
    current: rawOptions.current,
    valueKey,
    grossKey,
    investedKey,
  });
  const reachMonth = findFirstReachMonth({ ...rawOptions, valueKey });
  const requiredMonthly = solveRequiredMonthly({ ...rawOptions, valueKey });
  return {
    rows,
    summary,
    reachMonth,
    requiredMonthly,
  };
}

function buildTargetAssetSensitivity(rawOptions = {}) {
  const baseRate = toNumber(rawOptions.annualRate);
  const baseMonthly = Math.max(0, toNumber(rawOptions.monthly));
  const baseYears = Math.max(1 / 12, toNumber(rawOptions.years));
  const target = toNumber(rawOptions.target);

  const decorate = (options, extra = {}) => {
    const scenario = buildTargetAssetScenario({ ...rawOptions, ...options, target });
    return {
      ...extra,
      ...scenario.summary,
      reachMonth: scenario.reachMonth,
      reachTextKo: formatReachText(scenario.reachMonth, "ko"),
      reachTextEn: formatReachText(scenario.reachMonth, "en"),
      requiredMonthly: scenario.requiredMonthly,
    };
  };

  return {
    returnScenarios: [-2, 0, 2].map((delta) => {
      const annualRate = Math.max(-98.9, baseRate + delta);
      return decorate(
        { annualRate },
        {
          key: delta === 0 ? "current" : delta > 0 ? "up2" : "down2",
          delta,
          annualRate,
        }
      );
    }),
    monthlyScenarios: [-0.2, 0, 0.2].map((deltaRatio) => {
      const monthly = Math.max(0, baseMonthly * (1 + deltaRatio));
      return decorate(
        { monthly },
        {
          key: deltaRatio === 0 ? "current" : deltaRatio > 0 ? "up20" : "down20",
          deltaRatio,
          monthly,
        }
      );
    }),
    periodScenarios: [0, 5, 10].map((delta) => {
      const years = delta === 0 ? baseYears : Math.min(80, baseYears + delta);
      return decorate(
        { years },
        {
          key: delta === 0 ? "current" : `plus${delta}`,
          delta,
          years,
        }
      );
    }),
  };
}

module.exports = {
  toNumber,
  normalizeCompounding,
  getTargetAssetReturnMeta,
  simulateGoalPath,
  findFirstReachMonth,
  solveRequiredMonthly,
  solveRequiredYears,
  solveRequiredRate,
  yearsFloatToYM,
  formatYMText,
  reachMonthToYM,
  formatReachText,
  summarizeTargetAssetRows,
  buildTargetAssetScenario,
  buildTargetAssetSensitivity,
};
