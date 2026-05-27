const PRICE_INDEX_START = 100;
const DEFAULT_TAX_RATE = 15.4;
const DEFAULT_FEE_RATE = 0.5;
const DEFAULT_DRAWDOWN_PCT = -20;
const DCA_DRAWDOWN_SCENARIOS = [
  { key: "base" },
  { key: "early_drop_recovery" },
  { key: "mid_drop_recovery" },
  { key: "final_year_drop" },
];

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeFrequency(value) {
  return value === "weekly" ? "weekly" : "monthly";
}

function normalizeCompounding(value) {
  return value === "yearly" ? "yearly" : "monthly";
}

function normalizeDrawdownScenario(value) {
  return DCA_DRAWDOWN_SCENARIOS.some((scenario) => scenario.key === value)
    ? value
    : "base";
}

function getDcaPeriodLabel(startDate, year) {
  if (!startDate || !year) return "";
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return "";
  const end = new Date(start);
  end.setFullYear(start.getFullYear() + Number(year));
  return end.toISOString().slice(0, 7);
}

function getDcaReturnMeta({
  annualRate,
  contributionFrequency = "monthly",
  compounding = "monthly",
  taxRate = DEFAULT_TAX_RATE,
  feeRate = DEFAULT_FEE_RATE,
}) {
  const frequency = normalizeFrequency(contributionFrequency);
  const periodsPerYear = frequency === "weekly" ? 52 : 12;
  const compoundingMode = normalizeCompounding(compounding);

  const grossAnnualReturn = Math.max(-0.99, toNumber(annualRate) / 100);
  const tax = toNumber(taxRate) / 100;
  const fee = toNumber(feeRate) / 100;
  const netAnnualReturn = Math.max(-0.99, grossAnnualReturn * (1 - tax) - fee);

  const grossPeriodReturn =
    compoundingMode === "yearly"
      ? Math.pow(1 + grossAnnualReturn, 1 / periodsPerYear) - 1
      : grossAnnualReturn / periodsPerYear;

  const netPeriodReturn =
    compoundingMode === "yearly"
      ? Math.pow(1 + netAnnualReturn, 1 / periodsPerYear) - 1
      : netAnnualReturn / periodsPerYear;

  return {
    periodsPerYear,
    compounding: compoundingMode,
    contributionFrequency: frequency,
    grossAnnualReturn,
    netAnnualReturn,
    grossPeriodReturn,
    netPeriodReturn,
    taxRate: toNumber(taxRate),
    feeRate: toNumber(feeRate),
  };
}

function normalizePlanParams(params = {}) {
  return {
    initial: toNumber(params.initial),
    monthly: toNumber(params.monthly ?? params.periodContribution),
    annualRate: toNumber(params.annualRate),
    years: toNumber(params.years),
    startDate: params.startDate || "",
    contributionFrequency: normalizeFrequency(params.contributionFrequency),
    annualIncrease: toNumber(params.annualIncrease),
    compounding: normalizeCompounding(params.compounding),
    taxRate: toNumber(params.taxRate, DEFAULT_TAX_RATE),
    feeRate: toNumber(params.feeRate, DEFAULT_FEE_RATE),
    drawdownScenario: normalizeDrawdownScenario(params.drawdownScenario ?? params.scenario),
    drawdownPct: Math.min(0, Math.max(-99, toNumber(params.drawdownPct, DEFAULT_DRAWDOWN_PCT))),
  };
}

function getShockWindow({ scenario, periods, periodsPerYear }) {
  const totalPeriods = Math.max(1, Math.floor(toNumber(periods, 1)));
  const perYear = Math.max(1, Math.floor(toNumber(periodsPerYear, 12)));
  const twentyPctWindow = Math.max(1, Math.ceil(totalPeriods * 0.2));

  if (scenario === "early_drop_recovery") {
    const length = Math.max(1, Math.min(twentyPctWindow, perYear, totalPeriods));
    return { start: 1, length };
  }

  if (scenario === "mid_drop_recovery") {
    return { start: Math.max(1, Math.ceil(totalPeriods / 2)), length: 1 };
  }

  if (scenario === "final_year_drop") {
    const length = Math.max(1, Math.min(twentyPctWindow, perYear, totalPeriods));
    return { start: Math.max(1, totalPeriods - length + 1), length };
  }

  return { start: 0, length: 0 };
}

function getDrawdownShockPct({ scenario, period, periods, periodsPerYear, drawdownPct }) {
  const key = normalizeDrawdownScenario(scenario);
  if (key === "base") return 0;

  const window = getShockWindow({ scenario: key, periods, periodsPerYear });
  if (period < window.start || period >= window.start + window.length) return 0;

  const shockFactor = Math.max(0.01, 1 + toNumber(drawdownPct, DEFAULT_DRAWDOWN_PCT) / 100);
  return (Math.pow(shockFactor, 1 / Math.max(1, window.length)) - 1) * 100;
}

function applyDrawdown(rows) {
  let peak = 0;
  let maxDrawdown = 0;

  return rows.map((row) => {
    const value = toNumber(row.valueNet);
    peak = Math.max(peak, value);
    const drawdown = peak > 0 ? Math.min(0, value / peak - 1) : 0;
    maxDrawdown = Math.min(maxDrawdown, drawdown);
    return {
      ...row,
      modelDrawdownPct: Math.abs(drawdown) * 100,
      maxDrawdownPctToDate: Math.abs(maxDrawdown) * 100,
    };
  });
}

function simulateDcaPlan(rawParams = {}) {
  const params = normalizePlanParams(rawParams);
  const meta = getDcaReturnMeta(params);
  const periods = Math.max(1, Math.floor(params.years * meta.periodsPerYear));

  let invested = params.initial;
  let valueGross = invested;
  let valueNet = invested;
  let priceProxy = PRICE_INDEX_START;
  let pricePeak = PRICE_INDEX_START;
  let maxPriceDrawdown = 0;
  let units = invested > 0 ? invested / priceProxy : 0;

  let contributionCur = params.monthly;
  let investedPrevYear = invested;
  let valueNetPrevYear = valueNet;

  const rows = [];
  const periodRows = [];

  for (let p = 1; p <= periods; p += 1) {
    const priceBefore = priceProxy;
    const contribution = contributionCur;
    const unitsBought = priceBefore > 0 ? contribution / priceBefore : 0;

    invested += contribution;
    units += unitsBought;

    valueGross = (valueGross + contribution) * (1 + meta.grossPeriodReturn);
    valueNet = (valueNet + contribution) * (1 + meta.netPeriodReturn);
    priceProxy *= 1 + meta.grossPeriodReturn;

    const scenarioShockPct = getDrawdownShockPct({
      scenario: params.drawdownScenario,
      period: p,
      periods,
      periodsPerYear: meta.periodsPerYear,
      drawdownPct: params.drawdownPct,
    });
    if (scenarioShockPct !== 0) {
      const shockFactor = Math.max(0.000001, 1 + scenarioShockPct / 100);
      valueGross *= shockFactor;
      valueNet *= shockFactor;
      priceProxy = Math.max(0.000001, priceProxy * shockFactor);
    }

    pricePeak = Math.max(pricePeak, priceProxy);
    const priceDrawdown = pricePeak > 0 ? Math.min(0, priceProxy / pricePeak - 1) : 0;
    maxPriceDrawdown = Math.min(maxPriceDrawdown, priceDrawdown);

    if (rawParams.includePeriods) {
      periodRows.push({
        period: p,
        year: Math.ceil(p / meta.periodsPerYear),
        contribution,
        invested,
        priceBefore,
        priceAfter: priceProxy,
        unitsBought,
        units,
        valueGross,
        valueNet,
        averageCost: units > 0 ? invested / units : 0,
        scenarioShockPct,
        priceDrawdownPct: Math.abs(priceDrawdown) * 100,
        priceMaxDrawdownPctToDate: Math.abs(maxPriceDrawdown) * 100,
      });
    }

    const isYearEnd = p % meta.periodsPerYear === 0 || p === periods;
    if (isYearEnd) {
      const year = Math.round(p / meta.periodsPerYear);
      const contributionYear = invested - investedPrevYear;
      const gainYearNet = valueNet - valueNetPrevYear - contributionYear;

      rows.push({
        year,
        invested,
        valueGross,
        valueNet,
        contributionYear,
        gainYearNet,
        contributionAtEnd: contributionCur,
        monthlyAtEnd:
          params.contributionFrequency === "weekly"
            ? contributionCur * (52 / 12)
            : contributionCur,
        averageCost: units > 0 ? invested / units : 0,
        priceProxy,
        units,
        drawdownScenario: params.drawdownScenario,
        priceDrawdownPct: Math.abs(priceDrawdown) * 100,
        priceMaxDrawdownPctToDate: Math.abs(maxPriceDrawdown) * 100,
        periodLabel: getDcaPeriodLabel(params.startDate, year),
      });

      investedPrevYear = invested;
      valueNetPrevYear = valueNet;

      if (params.annualIncrease !== 0) {
        contributionCur *= 1 + params.annualIncrease / 100;
      }
    }
  }

  return {
    rows: applyDrawdown(rows),
    periodRows,
    meta: {
      ...meta,
      periods,
      priceIndexStart: PRICE_INDEX_START,
      drawdownScenario: params.drawdownScenario,
      drawdownPct: params.drawdownPct,
    },
    params,
  };
}

function estimateLumpSumNet({
  amount,
  annualRate,
  years,
  compounding = "monthly",
  taxRate = DEFAULT_TAX_RATE,
  feeRate = DEFAULT_FEE_RATE,
}) {
  const a = toNumber(amount);
  const y = toNumber(years);
  if (a <= 0 || y <= 0) return 0;

  const rYear = Math.max(-0.99, toNumber(annualRate) / 100);
  const tax = toNumber(taxRate) / 100;
  const fee = toNumber(feeRate) / 100;
  const netYear = Math.max(-0.99, rYear * (1 - tax) - fee);

  if (normalizeCompounding(compounding) === "yearly") {
    return a * Math.pow(1 + netYear, y);
  }

  return a * Math.pow(1 + netYear / 12, Math.floor(y * 12));
}

function getLastRowValue(params, field = "valueNet") {
  const simulation = simulateDcaPlan(params);
  const last = simulation.rows.length ? simulation.rows[simulation.rows.length - 1] : null;
  return last ? toNumber(last[field]) : 0;
}

function estimateCostBreakdownApprox(params, finalGross, finalNet) {
  const grossValue = toNumber(finalGross);
  const netValue = toNumber(finalNet);
  const taxRate = toNumber(params.taxRate);
  const feeRate = toNumber(params.feeRate);

  const taxOnlyNet =
    taxRate > 0
      ? getLastRowValue({ ...params, feeRate: 0 }, "valueNet")
      : grossValue;
  const feeOnlyNet =
    feeRate > 0
      ? getLastRowValue({ ...params, taxRate: 0 }, "valueNet")
      : grossValue;

  const taxDragApprox = Math.max(0, grossValue - taxOnlyNet);
  const feeDragApprox = Math.max(0, grossValue - feeOnlyNet);
  const combinedDrag = Math.max(0, grossValue - netValue);

  return {
    taxDragApprox,
    feeDragApprox,
    taxFeeDrag: combinedDrag,
    taxFeeInteractionApprox: combinedDrag - taxDragApprox - feeDragApprox,
  };
}

function analyzeDcaResult(rows = [], rawParams = {}) {
  const last = rows.length ? rows[rows.length - 1] : null;
  const params = normalizePlanParams(rawParams);
  if (!last) return null;

  const finalGross = toNumber(last.valueGross);
  const finalNet = toNumber(last.valueNet);
  const totalInvested = toNumber(last.invested);
  const totalGain = finalNet - totalInvested;
  const grossGain = finalGross - totalInvested;
  const costBreakdown = estimateCostBreakdownApprox(params, finalGross, finalNet);
  const taxFeeDrag = costBreakdown.taxFeeDrag;
  const cumulativeReturn = totalInvested > 0 ? (finalNet / totalInvested - 1) * 100 : 0;
  const maxDrawdownPct = rows.reduce(
    (min, row) => Math.max(min, toNumber(row.maxDrawdownPctToDate)),
    0
  );
  const priceMaxDrawdownPct = rows.reduce(
    (max, row) => Math.max(max, toNumber(row.priceMaxDrawdownPctToDate)),
    0
  );
  const lumpSumNet = estimateLumpSumNet({
    amount: totalInvested,
    annualRate: params.annualRate,
    years: params.years,
    compounding: params.compounding,
    taxRate: params.taxRate,
    feeRate: params.feeRate,
  });
  const lumpSumGap = lumpSumNet - finalNet;

  return {
    finalGross,
    finalNet,
    totalInvested,
    totalGain,
    grossGain,
    taxableGainApprox: Math.max(0, grossGain),
    taxDragApprox: costBreakdown.taxDragApprox,
    feeDragApprox: costBreakdown.feeDragApprox,
    taxFeeInteractionApprox: costBreakdown.taxFeeInteractionApprox,
    taxFeeDrag,
    cumulativeReturn,
    maxDrawdownPct,
    priceMaxDrawdownPct,
    averageCost: toNumber(last.averageCost),
    priceProxy: toNumber(last.priceProxy),
    totalUnits: toNumber(last.units),
    lumpSumNet,
    lumpSumGap,
    lumpSumGapPct: finalNet > 0 ? (lumpSumGap / finalNet) * 100 : 0,
    principalSharePct: finalNet > 0 ? (totalInvested / finalNet) * 100 : 0,
    gainSharePct: finalNet > 0 ? (totalGain / finalNet) * 100 : 0,
  };
}

function withTargetMetrics(analysis, targetAmount) {
  const target = toNumber(targetAmount);
  if (!analysis || target <= 0) {
    return {
      ...analysis,
      targetAmount: target,
      targetReached: null,
      targetDelta: null,
      targetAchievementRate: null,
    };
  }

  const finalNet = toNumber(analysis.finalNet);
  const targetDelta = finalNet - target;
  return {
    ...analysis,
    targetAmount: target,
    targetReached: targetDelta >= 0,
    targetDelta,
    targetAchievementRate: (finalNet / target) * 100,
  };
}

function solveMonthlyContributionForTarget(rawOptions = {}) {
  const targetAmount = toNumber(rawOptions.targetAmount);
  const params = normalizePlanParams(rawOptions);
  const currentPeriodContribution = params.monthly;
  const monthsEquivalent = params.contributionFrequency === "weekly" ? 52 / 12 : 1;

  const currentSimulation = simulateDcaPlan(params);
  const currentAnalysis = analyzeDcaResult(currentSimulation.rows, params);
  const projectedNetValue = currentAnalysis ? currentAnalysis.finalNet : 0;
  const shortfall = targetAmount - projectedNetValue;
  const achievementRate = targetAmount > 0 ? (projectedNetValue / targetAmount) * 100 : 0;
  const reached = targetAmount > 0 && projectedNetValue >= targetAmount;

  const baseResult = {
    targetAmount,
    projectedNetValue,
    shortfall,
    surplus: Math.max(0, -shortfall),
    achievementRate,
    reached,
    currentPeriodContribution,
    currentMonthlyContribution: currentPeriodContribution * monthsEquivalent,
    requiredPeriodContribution: 0,
    requiredMonthlyContribution: 0,
    additionalPeriodContribution: 0,
    additionalMonthlyContribution: 0,
    iterations: 0,
    solvable: targetAmount > 0,
  };

  if (targetAmount <= 0) return { ...baseResult, solvable: false };

  const valueForContribution = (periodContribution) => {
    const simulation = simulateDcaPlan({ ...params, monthly: periodContribution });
    const last = simulation.rows.length ? simulation.rows[simulation.rows.length - 1] : null;
    return last ? toNumber(last.valueNet) : 0;
  };

  if (valueForContribution(0) >= targetAmount) {
    return {
      ...baseResult,
      reached,
      requiredPeriodContribution: 0,
      requiredMonthlyContribution: 0,
      additionalPeriodContribution: 0,
      additionalMonthlyContribution: 0,
      iterations: 1,
    };
  }

  let low = 0;
  let high = Math.max(currentPeriodContribution, targetAmount / Math.max(1, params.years * 12), 1);
  let highValue = valueForContribution(high);
  let guard = 0;

  while (highValue < targetAmount && guard < 60) {
    low = high;
    high *= 2;
    highValue = valueForContribution(high);
    guard += 1;
  }

  if (highValue < targetAmount) {
    return {
      ...baseResult,
      requiredPeriodContribution: null,
      requiredMonthlyContribution: null,
      additionalPeriodContribution: null,
      additionalMonthlyContribution: null,
      iterations: guard,
      solvable: false,
    };
  }

  let iterations = guard;
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const value = valueForContribution(mid);
    iterations += 1;
    if (Math.abs(value - targetAmount) <= 1) {
      high = mid;
      break;
    }
    if (value >= targetAmount) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const requiredPeriodContribution = high;
  const additionalPeriodContribution = Math.max(0, requiredPeriodContribution - currentPeriodContribution);

  return {
    ...baseResult,
    requiredPeriodContribution,
    requiredMonthlyContribution: requiredPeriodContribution * monthsEquivalent,
    additionalPeriodContribution,
    additionalMonthlyContribution: additionalPeriodContribution * monthsEquivalent,
    iterations,
    solvable: true,
  };
}

function summarizeScenario(params) {
  const simulation = simulateDcaPlan(params);
  const analysis = analyzeDcaResult(simulation.rows, params);
  return {
    rows: simulation.rows,
    meta: simulation.meta,
    analysis: withTargetMetrics(analysis, params.targetAmount),
  };
}

function buildDcaSensitivity(rawParams = {}) {
  const params = normalizePlanParams(rawParams);
  const targetAmount = toNumber(rawParams.targetAmount);
  const baseRate = params.annualRate;
  const returnScenarios = [-2, 0, 2].map((delta) => {
    const annualRate = Math.max(-98.9, baseRate + delta);
    const scenario = summarizeScenario({ ...params, annualRate, targetAmount });
    return {
      key: delta === 0 ? "current" : delta > 0 ? "up2" : "down2",
      delta,
      annualRate,
      ...scenario.analysis,
    };
  });

  const periodScenarios = [0, 5, 10].map((delta) => {
    const years =
      delta === 0
        ? Math.max(1 / 12, params.years)
        : Math.min(50, Math.max(1 / 12, params.years + delta));
    const scenario = summarizeScenario({ ...params, years, targetAmount });
    return {
      key: delta === 0 ? "current" : `plus${delta}`,
      delta,
      years,
      ...scenario.analysis,
    };
  });

  return {
    returnScenarios,
    periodScenarios,
  };
}

function buildDcaDrawdownScenarios(rawParams = {}) {
  const params = normalizePlanParams(rawParams);
  const targetAmount = toNumber(rawParams.targetAmount);
  const drawdownPct = Math.min(0, Math.max(-99, toNumber(rawParams.drawdownPct, DEFAULT_DRAWDOWN_PCT)));
  const baseScenario = summarizeScenario({
    ...params,
    drawdownScenario: "base",
    drawdownPct,
    targetAmount,
  });
  const baseFinalNet = toNumber(baseScenario.analysis?.finalNet);

  return DCA_DRAWDOWN_SCENARIOS.map((definition) => {
    const scenario = summarizeScenario({
      ...params,
      drawdownScenario: definition.key,
      drawdownPct,
      targetAmount,
    });
    const analysis = scenario.analysis || {};
    const baseDiff = toNumber(analysis.finalNet) - baseFinalNet;

    return {
      key: definition.key,
      isBase: definition.key === "base",
      drawdownPct,
      baseDiff,
      baseDiffPct: baseFinalNet > 0 ? (baseDiff / baseFinalNet) * 100 : 0,
      ...analysis,
    };
  });
}

module.exports = {
  PRICE_INDEX_START,
  DEFAULT_TAX_RATE,
  DEFAULT_FEE_RATE,
  DEFAULT_DRAWDOWN_PCT,
  DCA_DRAWDOWN_SCENARIOS,
  getDcaPeriodLabel,
  getDcaReturnMeta,
  simulateDcaPlan,
  estimateLumpSumNet,
  analyzeDcaResult,
  solveMonthlyContributionForTarget,
  buildDcaSensitivity,
  buildDcaDrawdownScenarios,
};
