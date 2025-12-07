// lib/fireMonteCarlo.js — MonteCarlo 시나리오 5개 추출 기능 추가

export function runMonteCarlo({
  initialParams,
  netRealReturn,
  stdev = 0.12,
  trials = 500,
}) {
  const {
    currentAsset,
    annualSpending,
    withdrawRatePct,
    accumulationYears,
    monthlyContribution,
    annualContribution,
  } = initialParams;

  const yearlySave =
    (Number(monthlyContribution) || 0) * 12 +
    (Number(annualContribution) || 0);

  const fireTarget = initialParams.fireTarget;

  const paths = []; // 모든 시나리오 저장

  for (let t = 0; t < trials; t++) {
    const path = [];
    let asset = Number(currentAsset);

    // 적립 구간
    for (let y = 1; y <= accumulationYears; y++) {
      const r = randomReturn(netRealReturn, stdev);

      const mid = asset + yearlySave;
      asset = mid * (1 + r);

      path.push({ year: y, asset });
    }

    // 은퇴 구간 60년
    for (let y = 1; y <= 60; y++) {
      const r = randomReturn(netRealReturn, stdev);

      const afterWithdraw = asset - annualSpending;

      if (afterWithdraw <= 0) {
        asset = 0;
        path.push({ year: accumulationYears + y, asset });
        break;
      }

      asset = afterWithdraw * (1 + r);
      path.push({ year: accumulationYears + y, asset });
    }

    paths.push(path);
  }

  // FIRE 성공 시나리오 비율 계산
  const fireSuccess = paths.filter(
    (p) => p[accumulationYears - 1]?.asset >= fireTarget
  ).length;

  // 30년 유지 성공 비율 계산
  const sustain30 = paths.filter(
    (p) => p[accumulationYears + 30]?.asset > 0
  ).length;

  // 평균 고갈 시점
  const depletionYears = paths.map((p) => {
    const last = p[p.length - 1];
    if (last.asset <= 0)
      return last.year - accumulationYears;
    return 60; // 고갈 안됨
  });

  const avgDepletion =
    depletionYears.reduce((a, b) => a + b, 0) / depletionYears.length;

  // 🔥 샘플 시나리오 5개 추출
  const sorted = [...paths].sort(
    (a, b) => b[b.length - 1]?.asset - a[a.length - 1]?.asset
  );

  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const optimistic = sorted[Math.floor(trials * 0.1)];
  const median = sorted[Math.floor(trials * 0.5)];
  const conservative = sorted[Math.floor(trials * 0.9)];

  return {
    fireProb: (fireSuccess / trials) * 100,
    sustain30: (sustain30 / trials) * 100,
    avgDepletion,
    trials,

    // ⭐ 새로 추가된 데이터
    samplePaths: {
      best,
      worst,
      optimistic,
      median,
      conservative,
    },
  };
}

function randomReturn(mean, stdev) {
  // 정규분포 Box–Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const randStdNormal =
    Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  return mean + stdev * randStdNormal;
}
