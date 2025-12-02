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

/**
 * 전체 FIRE 시뮬레이션
 */
export function runFireSimulation(params) {
  const {
    currentAsset,
    annualSpending,
    annualReturnPct,
    taxRatePct,
    feeRatePct,
    inflationPct,
    withdrawRatePct,
    accumulationYears,
    monthlyContribution,
    annualContribution,
  } = params;

  const netReal = calcNetRealReturn({
    annualReturnPct,
    taxRatePct,
    feeRatePct,
    inflationPct,
  });

  // 1) 적립 구간
  const acc = simulateAccumulation({
    currentAsset,
    netRealReturn: netReal,
    annualSpending,
    withdrawRatePct,
    accumulationYears,
    monthlyContribution,
    annualContribution,
  });

  // 2) 은퇴 시작 시점 자산
  const retirementStartAsset = acc.finalAsset;
  const fireTarget = acc.fireTarget;
  const canFireAtEnd =
    fireTarget > 0 && retirementStartAsset >= fireTarget;

  // 3) 은퇴 구간
  const ret = simulateRetirement({
    startingAsset: retirementStartAsset,
    netRealReturn: netReal,
    annualSpending,
    maxYears: 60,
  });

  // 4) 파산 리스크 라벨 (간단 버전)
  let riskLevel = 'unknown';
  let riskLabelKo = '알 수 없음';
  let riskLabelEn = 'Unknown';

  if (ret.depletionYear === null) {
    riskLevel = 'low';
    riskLabelKo = '낮음 (60년 내 자산 고갈 없음)';
    riskLabelEn = 'Low (no depletion within 60 years)';
  } else if (ret.depletionYear >= 50) {
    riskLevel = 'low';
    riskLabelKo = '낮음 (50년 이후 자산 고갈)';
    riskLabelEn = 'Low (depletion after 50 years)';
  } else if (ret.depletionYear >= 30) {
    riskLevel = 'medium';
    riskLabelKo = '중간 (30~50년 사이 자산 고갈)';
    riskLabelEn = 'Medium (depletion in 30–50 years)';
  } else {
    riskLevel = 'high';
    riskLabelKo = '높음 (30년 이내 자산 고갈)';
    riskLabelEn = 'High (depletion within 30 years)';
  }

  const timeline = [
    ...acc.rows.map((r) => ({
        year: r.year,
        phase: 'accumulation',
        asset: r.endAsset,
        fireTarget: r.fireTarget,
        contributionYear: r.contributionYear, // ⬅ 추가
    })),
    ...ret.rows.map((r) => ({
        year: accumulationYears + r.year,
        phase: 'retirement',
        asset: r.endAsset,
        fireTarget,
        withdrawal: r.withdrawal, // ⬅ 추가
    })),
    ];

  return {
    accumulation: acc,
    retirement: ret,
    fireTarget,
    retirementStartAsset,
    canFireAtEnd,
    risk: {
      level: riskLevel,
      labelKo: riskLabelKo,
      labelEn: riskLabelEn,
    },
    timeline,
    netRealReturn: netReal,
  };
}
