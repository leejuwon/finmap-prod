// lib/goalSimulator.js

/**
 * params:
 *  current: 현재 자산 (원 단위)
 *  monthly: 월 저축/투자액 (원 단위)
 *  years: 시뮬레이션 기간 (년)
 *  annualRate: 연 수익률 (%)  예: 7
 *  goal: 목표 자산 (원 단위)
 */
export function simulateGoalPath({ current, monthly, years, annualRate, goal }) {
  const months = Math.max(1, Math.round(years * 12));
  const rMonthly = annualRate > 0 ? annualRate / 100 / 12 : 0;

  let balance = current;
  let totalContribution = current; // 초기 자산도 내 돈이니까
  let goalReachedAtMonth = null;

  const timeline = [];

  for (let m = 1; m <= months; m++) {
    // 월 복리 + 월 저축
    balance = balance * (1 + rMonthly) + monthly;
    totalContribution += monthly;

    if (!goalReachedAtMonth && balance >= goal) {
      goalReachedAtMonth = m;
    }

    // 매년(12개월)마다 스냅샷 저장
    if (m % 12 === 0) {
      const year = m / 12;
      timeline.push({
        year,
        value: balance,
        contribution: totalContribution,
        gain: balance - totalContribution,
      });
    }
  }

  const result = {
    finalBalance: balance,
    totalContribution,
    totalGain: balance - totalContribution,
    goalReachedAtMonth,
    timeline,
  };

  // 목표 달성 시점(년/개월) 도출
  if (goalReachedAtMonth) {
    const y = Math.floor(goalReachedAtMonth / 12);
    const m = goalReachedAtMonth % 12;
    result.goalYear = y;
    result.goalExtraMonths = m;
  } else {
    result.goalYear = null;
    result.goalExtraMonths = null;
  }

  return result;
}
