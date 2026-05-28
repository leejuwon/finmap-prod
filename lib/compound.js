// lib/compound.js
const compoundCore = require("./compoundCore");

export const validateCompoundInputs = compoundCore.validateCompoundInputs;
export const simulateCompoundPlan = compoundCore.simulateCompoundPlan;
export const COMPOUND_SAMPLE_PRESETS = compoundCore.COMPOUND_SAMPLE_PRESETS;
export const buildCompoundSensitivity = compoundCore.buildCompoundSensitivity;
export const buildCompoundYearRows = compoundCore.buildCompoundYearRows;
export const solveMonthlyContributionForTarget = compoundCore.solveMonthlyContributionForTarget;
export const estimateYearsToTarget = compoundCore.estimateYearsToTarget;

// =========================
// 복리 월적립 계산 (세금/수수료 포함)
// =========================

function _coreCompoundCalc({
  principal = 0,
  monthly = 0,
  annualRate = 0,
  years = 1,
  months,
  compounding = 'monthly',

  // 이 부분이 핵심: calcCompound / calcCompoundNoTaxFee가 여기로 값을 주입
  taxRate = 0,     // 소수점 (예: 0.154)
  feeRate = 0,     // 소수점 (예: 0.005)
  baseYear = new Date().getFullYear(),
}) {
  const totalMonths =
    months != null
      ? Math.max(1, Math.floor(Number(months) || 1))
      : Math.max(1, Math.floor((Number(years) || 0) * 12));

  const mRate = (Number(annualRate) || 0) / 100 / 12;

  const applyTax = taxRate > 0;
  const applyFee = feeRate > 0;

  let balanceGross = Number(principal) || 0;
  let balanceNet = Number(principal) || 0;

  // 매입 수수료: 초기 투자금
  const initialBuyFee = applyFee ? balanceNet * feeRate : 0;
  balanceNet -= initialBuyFee;

  let totalContribution = balanceNet;
  let totalContributionRaw = Number(principal) || 0;

  let cumulativeInterestGross = 0;
  let cumulativeInterestNet = 0;
  let cumulativeTax = 0;
  let cumulativeFee = initialBuyFee;

  const series = [];
  let yearSummary = [];
  let currentYear = 1;

  let openingGrossYear = balanceGross;
  let openingNetYear = balanceNet;
  let contributionYear = 0;
  let interestYearGross = 0;
  let interestYearNet = 0;
  let taxYear = 0;
  let feeYear = initialBuyFee;

  for (let month = 1; month <= totalMonths; month++) {
    // 1) 월 적립금 + 매입 수수료
    const contrib = Number(monthly) || 0;
    if (contrib > 0) {
      balanceGross += contrib;
      balanceNet += contrib;
      totalContributionRaw += contrib;

      let buyFeeMonth = 0;
      if (applyFee) {
        buyFeeMonth = contrib * feeRate;
        balanceNet -= buyFeeMonth;
        cumulativeFee += buyFeeMonth;
      }

      totalContribution += contrib - buyFeeMonth;
      contributionYear += contrib - buyFeeMonth;
      feeYear += buyFeeMonth;
    }

    // 2) 이자 계산
    const interestGross = balanceGross * mRate;
    const taxMonth = applyTax ? interestGross * taxRate : 0;
    const interestNet = interestGross - taxMonth;

    balanceGross += interestGross;
    balanceNet += interestNet;

    cumulativeInterestGross += interestGross;
    cumulativeInterestNet += interestNet;
    cumulativeTax += taxMonth;

    interestYearGross += interestGross;
    interestYearNet += interestNet;
    taxYear += taxMonth;

    series.push({
      month,
      balanceGross,
      balanceNet,
      contributionMonth: contrib,
      totalContribution,
      totalContributionRaw,
      cumulativeInterestGross,
      cumulativeInterestNet,
      cumulativeTax,
      cumulativeFee,
    });

    // 3) 연말 처리
    const isYearEnd = month % 12 === 0 || month === totalMonths;
    if (isYearEnd) {
      const closingGrossYear = balanceGross;
      const closingNetYear = balanceNet;

      yearSummary.push({
        year: currentYear,
        openingBalanceGross: openingGrossYear,
        openingBalanceNet: openingNetYear,
        contributionYear,
        closingBalanceGross: closingGrossYear,
        closingBalanceNet: closingNetYear,
        interestYearGross,
        interestYearNet,
        taxYear,
        feeYear,
        cumulativeInterestGross,
        cumulativeInterestNet,
        cumulativeTax,
        cumulativeFee,
        calendarYear: baseYear + (currentYear - 1),
      });

      currentYear += 1;
      openingGrossYear = closingGrossYear;
      openingNetYear = closingNetYear;
      contributionYear = 0;
      interestYearGross = 0;
      interestYearNet = 0;
      taxYear = 0;
      feeYear = 0;
    }
  }

  // 4) 환매 수수료
  if (applyFee) {
    const lastIndex = yearSummary.length - 1;
    if (lastIndex >= 0) {
      const sellFee = balanceNet * feeRate;
      balanceNet -= sellFee;
      cumulativeFee += sellFee;

      const lastYear = yearSummary[lastIndex];
      lastYear.closingBalanceNet = balanceNet;
      lastYear.feeYear += sellFee;
      lastYear.cumulativeFee = cumulativeFee;
    }
  }

  const yearsTotal = Math.ceil(totalMonths / 12);

  return {
    principal: Number(principal) || 0,
    monthly: Number(monthly) || 0,
    annualRate: Number(annualRate) || 0,
    yearsTotal,
    monthsTotal: totalMonths,
    compounding,
    taxRate,
    feeRate,
    baseYear,

    totalContribution: totalContributionRaw,
    totalContributionNet: totalContribution,

    futureValueGross: balanceGross,
    futureValueNet: balanceNet,

    totalInterestGross: cumulativeInterestGross,
    totalInterestNet: cumulativeInterestNet,

    totalTax: cumulativeTax,
    totalFee: cumulativeFee,
    totalTaxFee: cumulativeTax + cumulativeFee,

    series,
    yearSummary,
  };
}

// ===============================
// calcCompound (세금/수수료 포함 실제 시나리오)
// ===============================
export function calcCompound({
  principal = 0,
  monthly = 0,
  annualRate = 0,
  years = 1,
  months,
  compounding = 'monthly',
  taxRatePercent = 15.4,
  feeRatePercent = 0.5,
  inflationRate = 0,
  baseYear = new Date().getFullYear(),
}) {
  return compoundCore.simulateCompoundPlan({
    initialAmount: principal,
    monthlyContribution: monthly,
    annualReturn: annualRate,
    years,
    months,
    compounding,
    taxRate: taxRatePercent,
    feeRate: feeRatePercent,
    inflationRate,
    baseYear,
  });
}

// ===============================
// calcCompoundNoTaxFee (이상치: 세금·수수료 미적용)
// ===============================
export function calcCompoundNoTaxFee({
  principal = 0,
  monthly = 0,
  annualRate = 0,
  years = 1,
  months,
  compounding = 'monthly',
  inflationRate = 0,
  baseYear = new Date().getFullYear(),
}) {
  return compoundCore.simulateCompoundPlan({
    initialAmount: principal,
    monthlyContribution: monthly,
    annualReturn: annualRate,
    years,
    months,
    compounding,
    taxRate: 0,
    feeRate: 0,
    inflationRate,
    baseYear,
  });
}


// ===============================
// numberFmt (요약용 통화 포맷)
// ===============================
export function numberFmt(locale, currency, n) {
  const num = Number(n) || 0;

  const isValidCurrency =
    typeof currency === 'string' && /^[A-Z]{3}$/.test(currency);

  if (!isValidCurrency) {
    return new Intl.NumberFormat(locale || 'ko-KR').format(num);
  }

  return new Intl.NumberFormat(locale || 'ko-KR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}


// =========================
// 금액 단위 옵션 (표시용)
// =========================

export const UNIT_OPTIONS = {
  KRW: [
    {
      id: 'KRW-1', 
      divisor: 1,
      labelKo: '원 단위',
      labelEn: 'KRW (1)',
      unitTextKo: '원',
      unitTextEn: 'KRW',
    },
    {
      id: 'KRW-1k',
      divisor: 1000,
      labelKo: '천원 단위',
      labelEn: 'KRW 1,000',
      unitTextKo: '천원',
      unitTextEn: 'thousand KRW',
    },
    {
      id: 'KRW-10m',
      divisor: 10000000,
      labelKo: '천만 원 단위',
      labelEn: 'KRW 10,000,000',
      unitTextKo: '천만 원',
      unitTextEn: 'ten-million KRW',
      default: true,
    },
    {
      id: 'KRW-100m',
      divisor: 100000000,
      labelKo: '억 단위',
      labelEn: 'KRW 100,000,000',
      unitTextKo: '억',
      unitTextEn: 'hundred-million KRW',
    },
  ],
  USD: [
    {
      id: 'USD-1',
      divisor: 1,
      labelKo: '1달러 단위',
      labelEn: '1 USD',
      unitTextKo: '1 USD',
      unitTextEn: '1 USD',
    },
    {
      id: 'USD-1k',
      divisor: 1000,
      labelKo: '1,000달러 단위',
      labelEn: '1,000 USD',
      unitTextKo: '1,000 USD',
      unitTextEn: '1,000 USD',
    },
    {
      id: 'USD-10k',
      divisor: 10000,
      labelKo: '10,000달러 단위',
      labelEn: '10,000 USD',
      unitTextKo: '10,000 USD',
      unitTextEn: '10,000 USD',
      default: true,
    },
  ],
};

export function getUnitOptions(currency = 'KRW', locale = 'ko-KR') {
  const list = UNIT_OPTIONS[currency] || UNIT_OPTIONS.KRW;
  const isKo = locale.toLowerCase().startsWith('ko');
  return list.map((u) => ({
    id: u.id,
    divisor: u.divisor,
    label: isKo ? u.labelKo : u.labelEn,
    unitText: isKo ? (u.unitTextKo || u.labelKo) : (u.unitTextEn || u.labelEn),
    default: !!u.default,
  }));
}

export function pickUnit(options, unitId) {
  if (!options || !options.length) return null;
  return (
    options.find((o) => o.id === unitId) ||
    options.find((o) => o.default) ||
    options[0]
  );
}

export function formatScaledAmount(value, unit, locale = 'ko-KR') {
  const divisor = unit?.divisor ?? 1;
  const v = (Number(value) || 0) / divisor;

  const isBaseUnit = divisor === 1;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: isBaseUnit ? 0 : 2,
    maximumFractionDigits: isBaseUnit ? 0 : 2,
  }).format(v);
}


// =========================
// 단리 거치식 계산 (일시불, Simple Interest)
// =========================

/**
 * 단리 거치식:
 * - principal: 총 투자금 (일시불)
 * - annualRate: 연 이율 (%)
 * - years: 투자 기간(년)
 * - taxMode: 'apply' | 'none'
 *   - apply: 이자에 taxRatePercent% 세금
 * - feeMode: 'apply' | 'none'
 *   - apply: 매입 + 환매에 feeRatePercent% 적용 (각각 50%씩이 아니라,
 *            단순히 "총 연 수수료율"로 보고 buy/sell에 나눠 쓰는 구조로 확장 가능)
 */
export function calcSimpleLump({
  principal = 0,
  annualRate = 0,
  years = 1,
  taxMode = 'apply',
  feeMode = 'apply',
  // 🔥 새로 추가: 세율/수수료율(%) – 기본값은 한국 기준
  taxRatePercent = 15.4,
  feeRatePercent = 0.5,
  baseYear = new Date().getFullYear(),
}) {
  const P = Number(principal) || 0;
  const r = (Number(annualRate) || 0) / 100;
  const Y = Math.max(1, Math.floor(Number(years) || 1));

  // 🔥 세율/수수료율 처리
  let taxRate = taxRatePercent != null ? Number(taxRatePercent) : 15.4;
  let feeRate = feeRatePercent != null ? Number(feeRatePercent) : 0.5;

  taxRate = Math.max(0, taxRate) / 100;
  feeRate = Math.max(0, feeRate) / 100;

  if (taxMode === 'none') taxRate = 0;
  if (feeMode === 'none') feeRate = 0;

  const applyTax = taxRate > 0;
  const applyFee = feeRate > 0;

  let cumulativeInterestGross = 0;
  let cumulativeInterestNet = 0;
  let cumulativeTax = 0;
  let cumulativeFee = 0;

  const rows = [];

  // 매입 수수료: 처음 한 번
  const buyFee = applyFee ? P * feeRate : 0;

  let openingGross = P;
  let openingNet = P - buyFee;

  cumulativeFee += buyFee;

  for (let y = 1; y <= Y; y++) {
    const interestYearGross = P * r;
    const taxYear = applyTax ? interestYearGross * taxRate : 0;
    const interestYearNet = interestYearGross - taxYear;

    const closingGross = openingGross + interestYearGross;
    let closingNet = openingNet + interestYearNet;

    let feeYear = 0;
    if (applyFee && y === Y) {
      feeYear = closingNet * feeRate;
      closingNet -= feeYear;
    }

    cumulativeInterestGross += interestYearGross;
    cumulativeInterestNet += interestYearNet;
    cumulativeTax += taxYear;
    cumulativeFee += feeYear;

    rows.push({
      year: y,
      openingBalanceGross: openingGross,
      openingBalanceNet: openingNet,
      contributionYear: 0,
      closingBalanceGross: closingGross,
      closingBalanceNet: closingNet,
      interestYearGross,
      interestYearNet,
      taxYear,
      feeYear,
      cumulativeInterestGross,
      cumulativeInterestNet,
      cumulativeTax,
      cumulativeFee,
      calendarYear: baseYear + (y - 1),
    });

    openingGross = closingGross;
    openingNet = closingNet;
  }

  const last = rows[rows.length - 1];

  return {
    principal: P,
    monthly: 0,
    annualRate,
    yearsTotal: Y,
    monthsTotal: Y * 12,
    compounding: 'simple_lump',
    taxMode,
    feeMode,
    taxRatePercent,
    feeRatePercent,
    totalContribution: P,
    futureValueGross: last.closingBalanceGross,
    futureValueNet: last.closingBalanceNet,
    totalInterestGross: cumulativeInterestGross,
    totalInterestNet: cumulativeInterestNet,
    totalTax: cumulativeTax,
    totalFee: cumulativeFee,
    yearSummary: rows,
  };
}

export function requiredMonthlyToReachGoal({
  goalAmount,
  principal,
  years,
  annualRate,
}) {
  const r = annualRate / 100 / 12;
  const n = years * 12;

  if (r === 0) {
    return Math.max(0, (goalAmount - principal) / n);
  }

  return Math.max(
    0,
    (goalAmount - principal * Math.pow(1 + r, n)) * (r / (Math.pow(1 + r, n) - 1))
  );
}


export function requiredRateToReachGoal({
  goalAmount,
  principal,
  monthly,
  years,
}) {
  const n = years * 12;

  let low = 0;
  let high = 0.5; // 50% 수익률 상한선
  let mid;

  for (let i = 0; i < 40; i++) {
    mid = (low + high) / 2;
    const fv = principal * Math.pow(1 + mid / 12, n) +
               monthly * ((Math.pow(1 + mid / 12, n) - 1) / (mid / 12));

    if (fv > goalAmount) high = mid;
    else low = mid;
  }

  return mid * 100; // %
}

export function requiredPrincipalToReachGoal({
  goalAmount,
  monthly,
  years,
  annualRate,
}) {
  const r = annualRate / 100 / 12;
  const n = years * 12;

  const fvMonthly =
    monthly > 0
      ? monthly * ((Math.pow(1 + r, n) - 1) / r)
      : 0;

  return Math.max(0, goalAmount - fvMonthly) / Math.pow(1 + r, n);
}

// 1) 수익률 민감도 (±1% ~ ±10%)
export function sensitivityRate({
  principal,
  monthly,
  annualRate,
  years,
  taxRatePercent,
  feeRatePercent,
  deltaRate, // ±1, ±2, ... ±10 (%)
}) {
  const newRate = annualRate + deltaRate;
  const r = Math.max(-99, newRate); // 방어적 처리

  const out = calcCompound({
    principal,
    monthly,
    annualRate: r,
    years,
    taxRatePercent,
    feeRatePercent,
  });

  return {
    delta: deltaRate,
    annualRate: r,
    fvNet: out.futureValueNet,
    fvGross: out.futureValueGross,
    cagr: (Math.pow(out.futureValueNet / (principal + monthly * 12 * years), 1 / years) - 1) * 100,
  };
}

// 2) 수수료 민감도 (±0.1% 단위)
export function sensitivityFee({
  principal,
  monthly,
  annualRate,
  years,
  taxRatePercent,
  feeRatePercent,
  deltaFee, // ±0.1, ±0.2 ... (%)
}) {
  const newFee = Math.max(0, feeRatePercent + deltaFee);

  const out = calcCompound({
    principal,
    monthly,
    annualRate,
    years,
    taxRatePercent,
    feeRatePercent: newFee,
  });

  return {
    delta: deltaFee,
    feeRate: newFee,
    fvNet: out.futureValueNet,
    fvGross: out.futureValueGross,
  };
}

// 3) 세금 민감도 (14% ~ 25%)
export function sensitivityTax({
  principal,
  monthly,
  annualRate,
  years,
  taxRatePercent,
  feeRatePercent,
  deltaTax, // 예: +1, -1 (%)
}) {
  const newTax = Math.min(25, Math.max(0, taxRatePercent + deltaTax));

  const out = calcCompound({
    principal,
    monthly,
    annualRate,
    years,
    taxRatePercent: newTax,
    feeRatePercent,
  });

  return {
    delta: deltaTax,
    taxRate: newTax,
    fvNet: out.futureValueNet,
    fvGross: out.futureValueGross,
  };
}

