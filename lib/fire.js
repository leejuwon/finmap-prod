// ========================================================
// 🔥 공통 한국식 금액 포맷 (음수 지원 / 억·천만·만 단위)
// ========================================================
export function formatKrwUnit(n) {
  const num = Number(n) || 0;
  const abs = Math.abs(num);

  let formatted =
    abs >= 100_000_000
      ? (abs / 100_000_000).toFixed(2) + "억"
      : abs >= 10_000_000
      ? (abs / 10_000_000).toFixed(1) + "천만"
      : abs >= 10_000
      ? (abs / 10_000).toFixed(0) + "만"
      : abs.toLocaleString("ko-KR") + "원";

  return num < 0 ? "-" + formatted : formatted;
}

// ========================================================
// 🔥 실질 수익률 계산
// ========================================================
export function calcNetRealReturn({
  annualReturnPct,
  taxRatePct = 0,
  feeRatePct = 0,
  inflationPct = 0,
}) {
  const r = (Number(annualReturnPct) || 0) / 100;
  const t = (Number(taxRatePct) || 0) / 100;
  const f = (Number(feeRatePct) || 0) / 100;
  const i = (Number(inflationPct) || 0) / 100;

  const nominalAfterTax = (r - f) * (1 - t);
  const realReturn = (1 + nominalAfterTax) / (1 + i) - 1;

  return realReturn;
}

// FIRE 목표 자산
export function calcFireTarget(annualSpending, withdrawRatePct) {
  const spending = Number(annualSpending) || 0;
  const w = Number(withdrawRatePct) || 0;
  if (spending <= 0 || w <= 0) return 0;
  return spending / (w / 100);
}

// ========================================================
// 🔥 최종 FIRE ENGINE — 누적·수익·진행률·실질/명목 완전 버전
// ========================================================
function resolveContributionYears(contributionYears, accumulationYears) {
  const raw = contributionYears ?? accumulationYears ?? 20;
  const years = Number(raw);
  if (!Number.isFinite(years)) return 20;
  return Math.max(0, Math.floor(years));
}

export function runFireSimulation(params = {}) {
  const {
    currentAsset = 0,
    annualSpending = 0,
    annualReturnPct = 5,
    contributionYears: inputContributionYears,
    accumulationYears,
    monthlyContribution = 0,
    annualContribution = 0,
    withdrawRatePct = 4,
    taxRatePct = 0,
    feeRatePct = 0.5,
    inflationPct = 2,
  } = params;

  const contributionYears = resolveContributionYears(
    inputContributionYears,
    accumulationYears
  );

  // 수익률 계산
  const grossReturn = Number(annualReturnPct) / 100 || 0;
  const fee = Number(feeRatePct) / 100 || 0;
  const tax = Number(taxRatePct) / 100 || 0;

  const nominalReturn = grossReturn - fee;
  const nominalAfterTax = nominalReturn * (1 - tax);
  const realReturn =
    calcNetRealReturn({
      annualReturnPct,
      taxRatePct,
      feeRatePct,
      inflationPct,
    }) || 0;

  const fireTarget = calcFireTarget(annualSpending, withdrawRatePct);

  // 초기 설정
  let assetReal = currentAsset;
  let assetNominal = currentAsset;
  let cumulativeContribution = 0;
  let fireYear = null;

  const timeline = [];

  // ========================================================
  // 🔵 1) 적립 구간
  // ========================================================
  for (let year = 1; year <= contributionYears; year++) {
    const beforeNominal = assetNominal;
    const beforeReal = assetReal;

    const contribution = monthlyContribution * 12 + annualContribution;
    cumulativeContribution += contribution;

    // 실질·명목 자산 증가
    assetReal = assetReal * (1 + realReturn) + contribution;
    assetNominal = assetNominal * (1 + nominalAfterTax) + contribution;

    const nominalYield = assetNominal - beforeNominal;
    const realYield = assetReal - beforeReal;

    const progressRate = fireTarget
      ? Number(((assetReal / fireTarget) * 100).toFixed(2))
      : 0;

    if (!fireYear && assetReal >= fireTarget) fireYear = year;

    timeline.push({
      year,
      phase: "accumulation",
      contributionYear: contribution,
      cashflow: contribution,
      nominalYield,
      realYield,
      cumulativeContribution,
      progressRate,
      assetReal,
      assetNominal,
      fireTarget,
    });
  }

  // ========================================================
  // 🔵 2) 은퇴 시작 지점 기록
  // ========================================================
  const retirementStartReal = assetReal;
  const retirementStartNominal = assetNominal;
  const canFireAtEnd = retirementStartReal >= fireTarget;
  const progressRateOverall = fireTarget
    ? Number(((retirementStartReal / fireTarget) * 100).toFixed(1))
    : 0;

  // ========================================================
  // 🔵 3) 은퇴 구간 (최대 60년)
  // ========================================================
  let depletionYear = null;

  for (let i = 1; i <= 60; i++) {
    const year = contributionYears + i;

    const beforeNominal = assetNominal;
    const beforeReal = assetReal;

    const withdrawal = annualSpending;

    assetReal = assetReal * (1 + realReturn) - withdrawal;
    assetNominal = assetNominal * (1 + nominalAfterTax) - withdrawal;

    const nominalYield = assetNominal - beforeNominal;
    const realYield = assetReal - beforeReal;

    if (assetReal <= 0 && depletionYear == null) depletionYear = i;

    timeline.push({
      year,
      phase: "retirement",
      withdrawal,
      cashflow: -withdrawal,
      nominalYield,
      realYield,
      cumulativeContribution,
      progressRate: 100,
      assetReal: Math.max(assetReal, 0),
      assetNominal: Math.max(assetNominal, 0),
      fireTarget,
    });
  }

  // ========================================================
  // 🔥 4) FIRE Score 계산 (0~100)
  // ========================================================
  let fireScore = 0;

  if (fireYear) fireScore += Math.max(0, 40 - fireYear); // 빨리 달성할수록 점수+
  if (depletionYear === null) fireScore += 60;           // 60년 유지 → FULL score
  else fireScore += depletionYear;                       // 유지 기간이 길수록+

  if (fireScore > 100) fireScore = 100;

  // 위험도 계산
  let risk = {};
  if (depletionYear === null) {
    risk = {
      level: "low",
      labelKo: "낮음 (60년 유지)",
      labelEn: "Low (60+ years)",
    };
  } else if (depletionYear >= 40) {
    risk = {
      level: "mid",
      labelKo: "중간 (40~60년)",
      labelEn: "Mid (40~60 yrs)",
    };
  } else {
    risk = {
      level: "high",
      labelKo: "높음 (40년 미만)",
      labelEn: "High (<40 yrs)",
    };
  }

  return {
    fireTarget,
    timeline,
    accumulation: { fireYear },
    retirement: { depletionYear },
    canFireAtEnd,
    retirementStartReal,
    retirementStartNominal,
    netRealReturn: realReturn,
    progressRateOverall,
    fireScore,
    risk,
  };
}
