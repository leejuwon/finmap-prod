// lib/fireMonteCarlo.js

import { simulateAccumulation, simulateRetirement } from "./fire";

/**
 * 정규분포 랜덤 생성기 (Box–Muller transform)
 */
function randomNormal(mean, stdev) {
  const u = 1 - Math.random();
  const v = Math.random();
  return (
    mean +
    stdev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  );
}

/**
 * FIRE 몬테카를로 시뮬레이션
 */
export function runMonteCarlo({
  initialParams,
  netRealReturn,
  stdev = 0.12, // 기본 연 수익률 변동성 (12%)
  trials = 500,
}) {
  const accYears = Number(initialParams.accumulationYears) || 0;
  const results = [];

  let fireSuccessCount = 0;
  let sustain30Count = 0;
  let totalDepletionYears = 0;
  let depletionSamples = 0;

  for (let t = 0; t < trials; t++) {
    // 매년 랜덤 수익률 적용
    let randomAccParams = { ...initialParams };
    let currentAsset = initialParams.currentAsset;

    // ---- 1) 적립 구간 ----
    let reachedFire = false;
    let randomRowsAcc = [];

    for (let y = 1; y <= accYears; y++) {
      const yearlySave =
        initialParams.monthlyContribution * 12 +
        initialParams.annualContribution;

      const r = randomNormal(netRealReturn, stdev);

      const start = currentAsset;
      const mid = start + yearlySave;
      const end = mid * (1 + r);

      currentAsset = end;

      randomRowsAcc.push({ year: y, asset: end });

      if (end >= initialParams.fireTarget) {
        reachedFire = true;
      }
    }

    if (reachedFire) fireSuccessCount++;

    // ---- 2) 은퇴 구간 ----
    let withdrawal = initialParams.annualSpending;
    let retirementAsset = currentAsset;
    let depletedAt = null;

    for (let y = 1; y <= 60; y++) {
      let beforeWithdraw = retirementAsset - withdrawal;
      if (beforeWithdraw <= 0) {
        depletedAt = y;
        break;
      }
      const r = randomNormal(netRealReturn, stdev);
      retirementAsset = beforeWithdraw * (1 + r);
    }

    if (depletedAt === null || depletedAt >= 30) {
      sustain30Count++;
    }

    if (depletedAt !== null) {
      depletionSamples++;
      totalDepletionYears += depletedAt;
    }
  }

  const fireProb = (fireSuccessCount / trials) * 100;
  const sustain30 = (sustain30Count / trials) * 100;
  const avgDepletion =
    depletionSamples > 0
      ? totalDepletionYears / depletionSamples
      : 60;

  return {
    trials,
    fireProb,
    sustain30,
    avgDepletion,
  };
}
