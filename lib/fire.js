// lib/fire.js

/**
 * 연 수익률에서 세금, 수수료, 인플레이션을 반영한
 * "실질(after-tax, after-fee, real) 수익률" 계산
 *
 * 단순화된 모델:
 *  - 명목 수익률: r
 *  - 연 수수료: f
 *  - 인플레이션: i
 *  - 세금: t (수익 부분에만)
 *
 * 1) 수수료 차감: r_fee = r - f
 * 2) 실질 수익률: r_real ≈ ((1 + r_fee) / (1 + i)) - 1
 * 3) 세후 실질 수익률: r_real_after_tax = r_real * (1 - t)
 */
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

  const rFee = r - f;
  const rReal = (1 + rFee) / (1 + i) - 1;
  const rAfterTax = rReal * (1 - t);

  return rAfterTax;
}

/**
 * FIRE 목표 자산 = 연 지출 / 출금률
 */
export function calcFireTarget(annualSpending, withdrawRatePct) {
  const spending = Number(annualSpending) || 0;
  const w = Number(withdrawRatePct) || 0;
  if (spending <= 0 || w <= 0) return 0;
  return spending / (w / 100); // 4% rule → spending / 0.04
}

/**
 * 적립(근로) 기간 동안의 자산 성장 시뮬레이션
 *  - 매년 연 저축 + (월 저축 × 12)를 더한 뒤, 실질 수익률 적용
 */
export function simulateAccumulation({
  currentAsset,
  netRealReturn,       // calcNetRealReturn 결과 (예: 0.03 = 3%)
  annualSpending,
  withdrawRatePct,
  accumulationYears,
  monthlyContribution = 0,
  annualContribution = 0,
}) {
  const r = Number(netRealReturn) || 0;
  let asset = Number(currentAsset) || 0;
  const years = Number(accumulationYears) || 0;
  const yearlySave =
    (Number(monthlyContribution) || 0) * 12 +
    (Number(annualContribution) || 0);

  const fireTarget = calcFireTarget(annualSpending, withdrawRatePct);
  const rows = [];
  let fireYear = null;

  for (let y = 1; y <= years; y++) {
    const startAsset = asset;
    const totalContribution = yearlySave;
    const mid = startAsset + totalContribution;
    const endAsset = mid * (1 + r);
    asset = endAsset;

    const reached = fireTarget > 0 && endAsset >= fireTarget;
    if (reached && fireYear === null) {
      fireYear = y;
    }

    rows.push({
      year: y,
      phase: 'accumulation',
      startAsset,
      contributionYear: totalContribution,
      endAsset,
      fireTarget,
      reachedFire: reached,
    });
  }

  return { rows, fireYear, finalAsset: asset, fireTarget };
}

/**
 * 은퇴 후 자산 시뮬레이션
 *  - 매년 연 지출만큼 인출
 *  - 남은 자산에 실질 수익률 적용
 */
export function simulateRetirement({
  startingAsset,
  netRealReturn,
  annualSpending,
  maxYears = 60, // 60년 이상 버티면 사실상 매우 안전
}) {
  const r = Number(netRealReturn) || 0;
  const spending = Number(annualSpending) || 0;
  let asset = Number(startingAsset) || 0;

  const rows = [];
  let depletionYear = null;

  for (let y = 1; y <= maxYears; y++) {
    const startAsset = asset;
    const withdrawal = spending;
    const afterWithdrawal = startAsset - withdrawal;

    if (afterWithdrawal <= 0) {
      rows.push({
        year: y,
        phase: 'retirement',
        startAsset,
        withdrawal,
        endAsset: 0,
        depleted: true,
      });
      depletionYear = y;
      break;
    }

    const endAsset = afterWithdrawal * (1 + r);
    asset = endAsset;

    rows.push({
      year: y,
      phase: 'retirement',
      startAsset,
      withdrawal,
      endAsset,
      depleted: false,
    });
  }

  return { rows, depletionYear };
}

// lib/fire.js — FINAL REAL/NOMINAL FIRE ENGINE

export function runFireSimulation(params) {
  const {
    currentAsset = 0,
    annualSpending = 0,
    annualReturnPct = 5,
    contributionYears = 20,
    monthlyContribution = 0,
    annualContribution = 0,
    withdrawRatePct = 4,
    taxRatePct = 0,
    feeRatePct = 0.5,
    inflationPct = 2,
  } = params;

  // ---------------------------
  // 1) 기본 계산값
  // ---------------------------
  const grossReturn = annualReturnPct / 100;
  const fee = feeRatePct / 100;
  const tax = taxRatePct / 100;
  const inflation = inflationPct / 100;

  // 실질 수익률 계산
  const nominalReturn = grossReturn - fee; // 세전 명목
  const nominalAfterTax = nominalReturn * (1 - tax); // 세후 명목
  const realReturn = (1 + nominalAfterTax) / (1 + inflation) - 1; // 실질 수익률

  // FIRE 목표 (연 지출 / 출금률)
  const fireTarget = annualSpending / (withdrawRatePct / 100);

  // ---------------------------
  // 2) 적립 구간 시뮬레이션
  // ---------------------------
  let assetReal = currentAsset;
  let assetNominal = currentAsset;
  let realScale = 1; // 실질 가치 환산 스케일

  let fireYear = null;

  const timeline = [];

  for (let year = 1; year <= contributionYears; year++) {
    // 2-1) 현실(실질) 자산 증가
    assetReal =
      assetReal * (1 + realReturn) +
      monthlyContribution * 12 +
      annualContribution;

    // 2-2) 명목 자산 증가
    assetNominal =
      assetNominal * (1 + nominalAfterTax) +
      monthlyContribution * 12 +
      annualContribution;

    // 2-3) 실질 가치 스케일 갱신
    realScale *= 1 / (1 + inflation); // 실질 가치 보정

    // 2-4) FIRE 도달 여부 확인 (실질 기준)
    if (!fireYear && assetReal >= fireTarget) {
      fireYear = year;
    }

    timeline.push({
      year,
      phase: "accumulation",
      assetReal,
      assetNominal,
      fireTarget,
    });
  }

  // ---------------------------
  // 3) 은퇴 시작 시점 기록
  // ---------------------------
  const retirementStartReal = assetReal;
  const retirementStartNominal = assetNominal;

  // FIRE 가능 여부 (실질 자산 기준)
  const canFireAtEnd = retirementStartReal >= fireTarget;

  // ---------------------------
  // 4) 은퇴 구간 시뮬레이션 (최대 60년)
  // ---------------------------
  let depletionYear = null;

  for (let i = 1; i <= 60; i++) {
    const year = contributionYears + i;

    // 실질·명목 자산에서 연 지출 차감
    assetReal = assetReal * (1 + realReturn) - annualSpending;
    assetNominal = assetNominal * (1 + nominalAfterTax) - annualSpending;

    if (assetReal <= 0 && depletionYear == null) {
      depletionYear = i; // 실질 기준 고갈
    }

    timeline.push({
      year,
      phase: "retirement",
      assetReal: Math.max(assetReal, 0),
      assetNominal: Math.max(assetNominal, 0),
      fireTarget,
    });
  }

  // ---------------------------
  // 5) 위험도 레이블
  // ---------------------------
  let risk = {};
  if (depletionYear === null) {
    risk = {
      level: "low",
      labelKo: "낮음 (60년 내 자산 고갈 없음)",
      labelEn: "Low (assets last 60+ yrs)",
    };
  } else if (depletionYear >= 40) {
    risk = {
      level: "mid",
      labelKo: "중간 (40~60년 사이 고갈)",
      labelEn: "Medium (40~60 yrs)",
    };
  } else {
    risk = {
      level: "high",
      labelKo: "높음 (40년 미만 고갈)",
      labelEn: "High (under 40 yrs)",
    };
  }

  // ---------------------------
  // 6) 최종 반환 구조
  // ---------------------------
  return {
    fireTarget,
    timeline,
    accumulation: { fireYear },
    retirement: {
      depletionYear, // null = 고갈 없음
    },
    canFireAtEnd,
    // 🔥 매우 중요: REAL/NOMINAL 분리
    retirementStartReal,
    retirementStartNominal,
    netRealReturn: realReturn,
    risk,
  };
}

