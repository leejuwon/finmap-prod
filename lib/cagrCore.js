function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function percentFmt(value, digits = 2) {
  const v = Number(value) || 0;
  return `${v.toFixed(digits)}%`;
}

function validateCagrInputs({ initial, final, years }) {
  const errors = [];
  const P = toNumber(initial);
  const F = toNumber(final);
  const Y = toNumber(years);

  if (!Number.isFinite(P) || P <= 0) {
    errors.push({
      field: "initial",
      ko: "시작금액은 0보다 커야 합니다.",
      en: "Starting value must be greater than 0.",
    });
  }
  if (!Number.isFinite(F) || F <= 0) {
    errors.push({
      field: "final",
      ko: "최종금액은 0보다 커야 합니다.",
      en: "Ending value must be greater than 0.",
    });
  }
  if (!Number.isFinite(Y) || Y <= 0) {
    errors.push({
      field: "years",
      ko: "기간은 0보다 커야 합니다.",
      en: "Years must be greater than 0.",
    });
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

function calculateCagr({ initial, final, years }) {
  const validation = validateCagrInputs({ initial, final, years });
  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      cagr: null,
      cagrPercent: null,
      totalReturn: null,
      totalReturnPercent: null,
    };
  }

  const P = toNumber(initial);
  const F = toNumber(final);
  const Y = toNumber(years);
  const cagr = Math.pow(F / P, 1 / Y) - 1;
  const totalReturn = F / P - 1;

  return {
    ok: true,
    errors: [],
    cagr,
    cagrPercent: cagr * 100,
    totalReturn,
    totalReturnPercent: totalReturn * 100,
  };
}

function calculateEndingValueFromCagr({ initial, cagrPercent, years }) {
  const P = toNumber(initial);
  const rate = toNumber(cagrPercent) / 100;
  const Y = toNumber(years);

  if (P <= 0 || Y < 0 || rate <= -1) return null;
  return P * Math.pow(1 + rate, Y);
}

function calculateStartingValueForTarget({ final, cagrPercent, years }) {
  const F = toNumber(final);
  const rate = toNumber(cagrPercent) / 100;
  const Y = toNumber(years);

  if (F <= 0 || Y < 0 || rate <= -1) return null;
  return F / Math.pow(1 + rate, Y);
}

function calculateYearsToTarget({ initial, target, cagrPercent }) {
  const P = toNumber(initial);
  const T = toNumber(target);
  const rate = toNumber(cagrPercent) / 100;

  if (P <= 0 || T <= 0 || rate <= -1) return null;
  if (T <= P) return 0;
  if (rate === 0) return null;
  if (rate < 0) return null;
  return Math.log(T / P) / Math.log(1 + rate);
}

function calculateRealCagr({ nominalCagrPercent, inflationRatePercent = 0 }) {
  const nominal = toNumber(nominalCagrPercent) / 100;
  const inflation = toNumber(inflationRatePercent) / 100;
  if (inflation <= -1) return null;
  return ((1 + nominal) / (1 + inflation) - 1) * 100;
}

function estimateGrossCagr({ netCagr, taxRate = 15.4, feeRate = 0.5 }) {
  const tax = Math.max(0, toNumber(taxRate) / 100);
  const fee = Math.max(0, toNumber(feeRate) / 100);
  let grossCagr = (netCagr + fee) / (1 - tax || 1);
  if (!Number.isFinite(grossCagr)) grossCagr = netCagr;
  if (grossCagr < -0.99) grossCagr = -0.99;
  return grossCagr;
}

function buildCagrYearRows({
  initial,
  years,
  netCagr,
  grossCagr = netCagr,
}) {
  const P = toNumber(initial);
  const Y = toNumber(years);
  const net = toNumber(netCagr);
  const gross = toNumber(grossCagr);
  if (P <= 0 || Y <= 0) return [];

  const wholeYears = Math.floor(Y);
  const hasFraction = Math.abs(Y - wholeYears) > 1e-9;
  const checkpoints = [0];
  for (let y = 1; y <= wholeYears; y += 1) checkpoints.push(y);
  if (hasFraction) checkpoints.push(Y);

  return checkpoints.map((yearValue, index) => {
    const grossValue = P * Math.pow(1 + gross, yearValue);
    const netValue = P * Math.pow(1 + net, yearValue);
    const prevYearValue = index > 0 ? checkpoints[index - 1] : 0;
    const prevNetValue = P * Math.pow(1 + net, prevYearValue);
    const totalReturn = P > 0 ? netValue / P - 1 : 0;

    return {
      year: Number.isInteger(yearValue) ? yearValue : round(yearValue, 2),
      yearLabel: Number.isInteger(yearValue)
        ? String(yearValue)
        : round(yearValue, 2).toFixed(2).replace(/\.?0+$/, ""),
      grossValue,
      netValue,
      taxFeeImpact: grossValue - netValue,
      gainFromStart: netValue - P,
      totalReturn,
      totalReturnPercent: totalReturn * 100,
      gainFromPrevious: index === 0 ? 0 : netValue - prevNetValue,
    };
  });
}

function buildCagrSensitivity({ initial, final, years, cagrPercent }) {
  const P = toNumber(initial);
  const F = toNumber(final);
  const Y = toNumber(years);
  const cagr = toNumber(cagrPercent);

  const cagrScenarios = [-2, 0, 2].map((delta) => {
    const nextCagr = Math.max(-99, cagr + delta);
    const endingValue = calculateEndingValueFromCagr({
      initial: P,
      cagrPercent: nextCagr,
      years: Y,
    });
    const totalReturn = endingValue && P > 0 ? endingValue / P - 1 : null;
    return {
      key: delta === 0 ? "current" : delta < 0 ? "minus2" : "plus2",
      delta,
      cagrPercent: nextCagr,
      endingValue,
      totalReturn,
      totalReturnPercent: totalReturn == null ? null : totalReturn * 100,
      finalDiff: endingValue == null ? null : endingValue - F,
    };
  });

  const periodCandidates = [
    Math.max(0.1, Y - 2),
    Y,
    Y + 2,
  ];
  const seen = new Set();
  const periodScenarios = periodCandidates
    .filter((period) => {
      const key = round(period, 2);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((period) => {
      const result = calculateCagr({ initial: P, final: F, years: period });
      return {
        key: period === Y ? "current" : period < Y ? "shorter" : "longer",
        years: period,
        cagrPercent: result.cagrPercent,
        totalReturnPercent: result.totalReturnPercent,
      };
    });

  return {
    cagrScenarios,
    periodScenarios,
  };
}

function formatYearsParts(years) {
  const y = toNumber(years, NaN);
  if (!Number.isFinite(y)) return null;
  const totalMonths = Math.max(0, Math.round(y * 12));
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    totalMonths,
  };
}

function formatYearsText(years, locale = "ko") {
  const parts = formatYearsParts(years);
  if (!parts) return null;
  if (parts.totalMonths === 0) return locale === "ko" ? "이미 도달" : "Already reached";
  if (locale === "ko") {
    if (parts.months === 0) return `${parts.years}년`;
    if (parts.years === 0) return `${parts.months}개월`;
    return `${parts.years}년 ${parts.months}개월`;
  }
  if (parts.months === 0) return `${parts.years}y`;
  if (parts.years === 0) return `${parts.months}m`;
  return `${parts.years}y ${parts.months}m`;
}

function calcCagr({
  initial,
  final,
  years,
  taxRate = 15.4,
  feeRate = 0.5,
  targetCagr = 7,
  targetValue = 0,
  inflationRate = 0,
}) {
  const P = toNumber(initial);
  const F = toNumber(final);
  const Y = toNumber(years);
  const targetCagrPercent = toNumber(targetCagr);
  const targetAmount = toNumber(targetValue);
  const inflationRatePercent = toNumber(inflationRate);
  const base = calculateCagr({ initial: P, final: F, years: Y });

  if (!base.ok) {
    return {
      ok: false,
      errors: base.errors,
      netCagr: 0,
      grossCagr: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      yearSummary: [],
      taxRate,
      feeRate,
      targetCagrPercent,
      targetValue: targetAmount,
      targetEndingValue: null,
      yearsToTarget: null,
      realCagrPercent: null,
      sensitivity: { cagrScenarios: [], periodScenarios: [] },
    };
  }

  const netCagr = base.cagr;
  const grossCagr = estimateGrossCagr({ netCagr, taxRate, feeRate });
  const yearSummary = buildCagrYearRows({
    initial: P,
    years: Y,
    netCagr,
    grossCagr,
  });
  const targetEndingValue = calculateEndingValueFromCagr({
    initial: P,
    cagrPercent: targetCagrPercent,
    years: Y,
  });
  const yearsToTarget = targetAmount > 0
    ? calculateYearsToTarget({
        initial: P,
        target: targetAmount,
        cagrPercent: targetCagrPercent,
      })
    : null;
  const realCagrPercent = calculateRealCagr({
    nominalCagrPercent: base.cagrPercent,
    inflationRatePercent,
  });
  const sensitivity = buildCagrSensitivity({
    initial: P,
    final: F,
    years: Y,
    cagrPercent: base.cagrPercent,
  });

  return {
    ok: true,
    errors: [],
    initial: P,
    final: F,
    years: Y,
    netCagr,
    netCagrPercent: base.cagrPercent,
    grossCagr,
    grossCagrPercent: grossCagr * 100,
    totalReturn: base.totalReturn,
    totalReturnPercent: base.totalReturnPercent,
    yearSummary,
    taxRate,
    feeRate,
    targetCagrPercent,
    targetValue: targetAmount,
    targetEndingValue,
    yearsToTarget,
    realCagrPercent,
    inflationRatePercent,
    sensitivity,
  };
}

module.exports = {
  percentFmt,
  validateCagrInputs,
  calculateCagr,
  calculateEndingValueFromCagr,
  calculateStartingValueForTarget,
  calculateYearsToTarget,
  calculateRealCagr,
  estimateGrossCagr,
  buildCagrYearRows,
  buildCagrSensitivity,
  formatYearsParts,
  formatYearsText,
  calcCagr,
};
