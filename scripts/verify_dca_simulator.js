const fs = require("fs");
const path = require("path");
const {
  buildDcaDrawdownScenarios,
  buildDcaSensitivity,
  simulateDcaPlan,
  analyzeDcaResult,
  solveMonthlyContributionForTarget,
} = require("../lib/dcaCore");

const REPORT_PATH = path.join(process.cwd(), "reports", "dca-simulator-audit.md");

function fmtMoney(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("ko-KR")}원`;
}

function fmtNumber(value, digits = 2) {
  return (Number(value) || 0).toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtPct(value, digits = 2) {
  return `${fmtNumber(value, digits)}%`;
}

function runScenario(name, params, includePeriods = false) {
  const simulation = simulateDcaPlan({ ...params, includePeriods });
  const analysis = analyzeDcaResult(simulation.rows, params);
  return {
    name,
    params,
    rows: simulation.rows,
    periodRows: simulation.periodRows,
    meta: simulation.meta,
    analysis,
  };
}

function assertClose(label, actual, expected, epsilon = 1e-6) {
  if (Math.abs((Number(actual) || 0) - expected) > epsilon) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function makeCostBreakdownApprox(params) {
  const grossScenario = runScenario("gross", { ...params, taxRate: 0, feeRate: 0 });
  const taxOnlyScenario = runScenario("tax only", { ...params, feeRate: 0 });
  const feeOnlyScenario = runScenario("fee only", { ...params, taxRate: 0 });
  const fullScenario = runScenario("full", params);

  const grossFinal = grossScenario.analysis.finalGross;
  const taxOnlyFinal = taxOnlyScenario.analysis.finalNet;
  const feeOnlyFinal = feeOnlyScenario.analysis.finalNet;
  const fullFinal = fullScenario.analysis.finalNet;

  return {
    taxableGainApprox: Math.max(0, grossScenario.analysis.finalGross - grossScenario.analysis.totalInvested),
    taxDragApprox: Math.max(0, grossFinal - taxOnlyFinal),
    feeDragApprox: Math.max(0, grossFinal - feeOnlyFinal),
    combinedDrag: Math.max(0, grossFinal - fullFinal),
  };
}

function paramsTable(params) {
  const rows = [
    ["초기 투자금", fmtMoney(params.initial)],
    ["정기 납입금", fmtMoney(params.monthly)],
    ["투자 기간", `${params.years}년`],
    ["연 수익률", fmtPct(params.annualRate)],
    ["세율", fmtPct(params.taxRate)],
    ["연 수수료율", fmtPct(params.feeRate)],
    ["납입 주기", params.contributionFrequency === "weekly" ? "매주" : "매월"],
    ["복리 설정", params.compounding === "yearly" ? "연복리 환산" : "월/주기 단순 환산"],
    ["화면 입력 기준", "KRW 화면에서는 100,000원 = 10(만원)으로 입력"],
  ];
  if (Number(params.targetAmount) > 0) rows.splice(rows.length - 1, 0, ["목표 금액", fmtMoney(params.targetAmount)]);
  return rows;
}

function resultTable(scenario) {
  const a = scenario.analysis;
  return [
    ["총 납입금", fmtMoney(a.totalInvested)],
    ["최종 세전 자산", fmtMoney(a.finalGross)],
    ["세전 수익", fmtMoney(a.grossGain)],
    ["세금 효과 추정", fmtMoney(a.taxDragApprox)],
    ["수수료 효과 추정", fmtMoney(a.feeDragApprox)],
    ["최종 세후 자산", fmtMoney(a.finalNet)],
    ["세후 수익금", fmtMoney(a.totalGain)],
    ["총 수익률", fmtPct(a.cumulativeReturn)],
    ["마지막 가격(지수 100 기준)", fmtNumber(a.priceProxy, 4)],
    ["총 매수수량", fmtNumber(a.totalUnits, 4)],
    ["평균 매수단가", fmtNumber(a.averageCost, 4)],
    ["단순 모델 MDD", fmtPct(a.maxDrawdownPct)],
    ["세금·수수료 효과(통합)", fmtMoney(a.taxFeeDrag)],
    ["최종 자산 중 원금 비중", fmtPct(a.principalSharePct, 1)],
    ["최종 자산 중 수익 비중", fmtPct(a.gainSharePct, 1)],
  ];
}

function moneyBreakdownTable(scenario) {
  const a = scenario.analysis;
  return [
    ["총 납입원금", fmtMoney(a.totalInvested)],
    ["세전 평가금액", fmtMoney(a.finalGross)],
    ["세전 수익", fmtMoney(a.grossGain)],
    ["세금", fmtMoney(a.taxDragApprox)],
    ["수수료", fmtMoney(a.feeDragApprox)],
    ["세후 자산", fmtMoney(a.finalNet)],
    ["세후 수익", fmtMoney(a.totalGain)],
    ["최종 자산 중 원금 비중", fmtPct(a.principalSharePct, 1)],
    ["최종 자산 중 수익 비중", fmtPct(a.gainSharePct, 1)],
  ];
}

function targetAnalysisTable(target) {
  return [
    ["목표 금액", fmtMoney(target.targetAmount)],
    ["현재 조건 최종 세후 자산", fmtMoney(target.projectedNetValue)],
    ["목표 달성 여부", target.reached ? "달성" : "부족"],
    ["목표 대비 초과/부족", fmtMoney(target.projectedNetValue - target.targetAmount)],
    ["목표 달성률", fmtPct(target.achievementRate, 2)],
    ["현재 월 납입금", fmtMoney(target.currentMonthlyContribution)],
    [
      "목표 달성 필요 월 납입금",
      target.requiredMonthlyContribution == null ? "계산 불가" : fmtMoney(target.requiredMonthlyContribution),
    ],
    [
      "추가 필요 월 납입금",
      target.additionalMonthlyContribution == null ? "계산 불가" : fmtMoney(target.additionalMonthlyContribution),
    ],
    ["이분 탐색 반복 수", target.iterations],
  ];
}

function drawdownScenarioLabel(key) {
  if (key === "early_drop_recovery") return "초반 하락 후 회복";
  if (key === "mid_drop_recovery") return "중간 하락 후 회복";
  if (key === "final_year_drop") return "마지막 해 하락";
  return "기본 모델";
}

function signedMoney(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) < 1) return fmtMoney(0);
  return `${n > 0 ? "+" : "-"}${fmtMoney(Math.abs(n))}`;
}

function scenarioMdd(value) {
  const n = Number(value) || 0;
  return n > 0 ? `-${fmtPct(n)}` : "0.00%";
}

function markdownTable(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => String(cell).replace(/\n/g, "<br>")).join(" | ")} |`);
  return [head, sep, ...body].join("\n");
}

const base = {
  initial: 0,
  monthly: 100_000,
  annualRate: 0,
  years: 1,
  startDate: "",
  contributionFrequency: "monthly",
  annualIncrease: 0,
  compounding: "monthly",
  taxRate: 0,
  feeRate: 0,
};

const sample1 = runScenario("무수익 단순 검증", base, true);
assertClose("sample1 total invested", sample1.analysis.totalInvested, 1_200_000);
assertClose("sample1 final price", sample1.analysis.priceProxy, 100);
assertClose("sample1 units", sample1.analysis.totalUnits, 12_000);
assertClose("sample1 average cost", sample1.analysis.averageCost, 100);
assertClose("sample1 final net", sample1.analysis.finalNet, 1_200_000);
assertClose("sample1 gain", sample1.analysis.totalGain, 0);
assertClose("sample1 return", sample1.analysis.cumulativeReturn, 0);
assertClose("sample1 mdd", sample1.analysis.maxDrawdownPct, 0);

const sample2 = runScenario(
  "수익률 있는 단순 검증",
  { ...base, annualRate: 12 },
  true
);

const sample3Params = {
  ...base,
  years: 3,
  annualRate: 7,
  taxRate: 15.4,
  feeRate: 0.5,
};
const sample3 = runScenario("수수료/세금 검증", sample3Params, true);
const sample3Costs = makeCostBreakdownApprox(sample3Params);

const sample4Params = {
  ...base,
  years: 10,
  annualRate: 7,
  taxRate: 15.4,
  feeRate: 0.5,
};
const sample4 = runScenario("일괄투자 비교", sample4Params, false);
const sample4Sensitivity = buildDcaSensitivity(sample4Params);
const sample1Sensitivity = buildDcaSensitivity(base);

const sample5Params = {
  ...base,
  monthly: 500_000,
  years: 10,
  annualRate: 7,
  taxRate: 15.4,
  feeRate: 0.5,
  targetAmount: 100_000_000,
};
const sample5 = runScenario("목표 금액 역산 기본 검증", sample5Params, false);
const sample5Target = solveMonthlyContributionForTarget(sample5Params);

const sample6Params = {
  ...base,
  monthly: 1_000_000,
  years: 20,
  annualRate: 7,
  taxRate: 15.4,
  feeRate: 0.5,
  targetAmount: 100_000_000,
};
const sample6 = runScenario("목표 금액 이미 달성 케이스", sample6Params, false);
const sample6Target = solveMonthlyContributionForTarget(sample6Params);

const sample7Params = {
  ...base,
  monthly: 0,
  years: 10,
  annualRate: 0,
  taxRate: 0,
  feeRate: 0,
  targetAmount: 120_000_000,
};
const sample7 = runScenario("무수익 단순 역산", sample7Params, false);
const sample7Target = solveMonthlyContributionForTarget(sample7Params);
const sample5Sensitivity = buildDcaSensitivity(sample5Params);

const sample8Params = {
  ...base,
  monthly: 500_000,
  years: 10,
  annualRate: 7,
  taxRate: 15.4,
  feeRate: 0.5,
  targetAmount: 100_000_000,
  drawdownPct: -20,
};
const sample8Scenarios = buildDcaDrawdownScenarios(sample8Params);

assertClose("sample1 tax drag", sample1.analysis.taxDragApprox, 0);
assertClose("sample1 fee drag", sample1.analysis.feeDragApprox, 0);
assertClose("sample1 principal share", sample1.analysis.principalSharePct, 100);
assertClose("sample1 gain share", sample1.analysis.gainSharePct, 0);
if (sample1Sensitivity.returnScenarios.length !== 3) throw new Error("sample1 return sensitivity should have 3 rows");
if (sample1Sensitivity.periodScenarios.length !== 3) throw new Error("sample1 period sensitivity should have 3 rows");
if (!(sample1Sensitivity.returnScenarios[0].finalNet < sample1.analysis.finalNet)) {
  throw new Error("sample1 -2%p sensitivity should be lower than current");
}
if (!(sample1Sensitivity.returnScenarios[2].finalNet > sample1.analysis.finalNet)) {
  throw new Error("sample1 +2%p sensitivity should be higher than current");
}
assertClose("sample4 lump gap", sample4.analysis.lumpSumGap, sample4.analysis.lumpSumNet - sample4.analysis.finalNet);
assertClose(
  "sample4 lump gap pct",
  sample4.analysis.lumpSumGapPct,
  (sample4.analysis.lumpSumGap / sample4.analysis.finalNet) * 100
);
const sample4CurrentReturn = sample4Sensitivity.returnScenarios.find((row) => row.delta === 0);
const sample4CurrentPeriod = sample4Sensitivity.periodScenarios.find((row) => row.delta === 0);
assertClose("sample4 current return sensitivity final", sample4CurrentReturn.finalNet, sample4.analysis.finalNet);
assertClose("sample4 current period sensitivity final", sample4CurrentPeriod.finalNet, sample4.analysis.finalNet);
assertClose("sample5 target projected net", sample5Target.projectedNetValue, sample5.analysis.finalNet);
if (!(sample5Target.requiredMonthlyContribution > sample5Target.currentMonthlyContribution)) {
  throw new Error("sample5 should require a higher monthly contribution than current");
}
if (!sample6Target.reached) throw new Error("sample6 should already reach the target");
if (sample6Target.shortfall > 0) throw new Error("sample6 shortfall should not be positive");
assertClose("sample6 additional monthly", sample6Target.additionalMonthlyContribution, 0, 1);
assertClose("sample7 required monthly", sample7Target.requiredMonthlyContribution, 1_000_000, 10);
assertClose("sample7 additional monthly", sample7Target.additionalMonthlyContribution, 1_000_000, 10);
if (sample8Scenarios.length !== 4) throw new Error("sample8 should return 4 drawdown scenarios");
const sample8Base = sample8Scenarios.find((row) => row.key === "base");
const sample8Final = sample8Scenarios.find((row) => row.key === "final_year_drop");
assertClose("sample8 base final net", sample8Base.finalNet, sample5.analysis.finalNet);
if (!sample8Scenarios.some((row) => !row.isBase && row.priceMaxDrawdownPct > 0)) {
  throw new Error("sample8 should include at least one drawdown scenario with MDD > 0");
}
if (!(sample8Final.finalNet < sample8Base.finalNet)) {
  throw new Error("sample8 final-year drop should be below the base model");
}

const sample2MonthlyRows = sample2.periodRows.map((row) => [
  row.period,
  fmtNumber(row.priceBefore, 4),
  fmtMoney(row.contribution),
  fmtNumber(row.unitsBought, 4),
  fmtNumber(row.units, 4),
  fmtMoney(row.invested),
  fmtMoney(row.valueNet),
  fmtNumber(row.priceAfter, 4),
]);

const sensitivityRows = sample4Sensitivity.returnScenarios.map((row) => [
  row.delta === 0 ? "현재 수익률" : `수익률 ${row.delta > 0 ? "+" : ""}${row.delta}%p`,
  fmtPct(row.annualRate),
  fmtMoney(row.finalNet),
  fmtMoney(row.totalGain),
  fmtPct(row.cumulativeReturn),
  fmtNumber(row.priceProxy, 4),
  fmtNumber(row.averageCost, 4),
]);

const periodRows = sample4Sensitivity.periodScenarios.map((row) => [
  row.delta === 0 ? "현재 기간" : `+${row.delta}년`,
  `${row.years}년`,
  fmtMoney(row.totalInvested),
  fmtMoney(row.finalNet),
  fmtMoney(row.totalGain),
  fmtPct(row.cumulativeReturn),
]);

const sample1SensitivityRows = sample1Sensitivity.returnScenarios.map((row) => [
  row.delta === 0 ? "현재 수익률" : `수익률 ${row.delta > 0 ? "+" : ""}${row.delta}%p`,
  fmtPct(row.annualRate),
  fmtMoney(row.finalNet),
  fmtPct(row.cumulativeReturn),
  fmtNumber(row.priceProxy, 4),
  fmtNumber(row.averageCost, 4),
]);

const sample5TargetReturnRows = sample5Sensitivity.returnScenarios.map((row) => [
  row.delta === 0 ? "현재 수익률" : `수익률 ${row.delta > 0 ? "+" : ""}${row.delta}%p`,
  fmtPct(row.annualRate),
  fmtMoney(row.finalNet),
  row.targetReached ? "달성" : "부족",
  fmtMoney(row.targetDelta),
]);

const sample5TargetPeriodRows = sample5Sensitivity.periodScenarios.map((row) => [
  row.delta === 0 ? "현재 기간" : `+${row.delta}년`,
  `${row.years}년`,
  fmtMoney(row.finalNet),
  row.targetReached ? "달성" : "부족",
  fmtMoney(row.targetDelta),
]);

const sample8Rows = sample8Scenarios.map((row) => [
  drawdownScenarioLabel(row.key),
  fmtMoney(row.finalNet),
  fmtMoney(row.totalInvested),
  fmtMoney(row.totalGain),
  fmtPct(row.cumulativeReturn),
  fmtNumber(row.priceProxy, 4),
  fmtNumber(row.averageCost, 4),
  fmtNumber(row.totalUnits, 4),
  scenarioMdd(row.priceMaxDrawdownPct ?? row.maxDrawdownPct),
  signedMoney(row.baseDiff),
  `${row.baseDiff >= 0 ? "+" : ""}${fmtPct(row.baseDiffPct)}`,
  row.targetReached ? "달성" : "부족",
  signedMoney(row.targetDelta),
]);

const report = `# DCA 시뮬레이터 계산 검증 및 UX 개선 보고서

생성일: 2026-05-27

## 구조 파악 요약

- 페이지: \`pages/tools/dca-calculator.js\`
- 입력 컴포넌트: \`_components/DcaForm.js\`
- 차트/표시 컴포넌트: \`_components/DcaChart.js\`, \`_components/DcaYearTable.js\`
- 기존 \`lib/dca.js\`는 현재 DCA 페이지에서 import되지 않는 보조 계산 파일로 확인했습니다.
- 주요 입력값: 초기 투자금, 정기 납입금, 연 수익률, 투자 기간, 시작일, 납입 주기, 연간 적립금 증가율, 복리 설정, 세율, 연 수수료율, 통화
- 주요 출력값: 총 납입금, 최종 세전/세후 자산, 세후 수익금, 총 수익률, 평균 매수단가, 마지막 가격, 보유 수량, 단순 모델 MDD, 연도별 요약, 일괄투자 비교
- import 대소문자 확인: 실제 파일명은 \`DcaChart.js\`, \`DcaYearTable.js\`이며 \`pages/tools/dca-calculator.js\`의 import 경로도 같은 대소문자를 사용합니다.

## 현재 계산 산식 요약

- 기준 가격은 실제 ETF/주식 가격이 아니라 **시작 가격 지수 100**입니다.
- 각 납입 주기마다 납입금을 먼저 더한 뒤 해당 주기의 수익률을 적용합니다.
- 기본 월복리 설정의 주기 수익률은 \`annualRate / periodsPerYear\`입니다. 매월은 12, 매주는 52를 사용합니다.
- 연복리 설정의 주기 수익률은 \`(1 + annualRate)^(1 / periodsPerYear) - 1\`입니다.
- 세후 모델은 \`netYear = annualRate * (1 - taxRate) - feeRate\`를 만든 뒤 같은 주기 환산 방식을 적용합니다.
- 평균 매수단가는 \`totalInvested / totalUnits\`입니다.
- 단순 모델 MDD는 연도별 세후 자산의 고점 대비 낙폭입니다. 실제 일별 가격 데이터 기반 MDD가 아닙니다.
- 일괄투자 비교는 DCA 총 납입 예정액을 첫 달에 한 번에 투자했다고 가정한 세후 자산과 비교합니다.

## 샘플 1. 무수익 단순 검증

${markdownTable(["항목", "값"], paramsTable(sample1.params))}

${markdownTable(["결과", "값"], resultTable(sample1))}

원금 vs 수익 분해:

${markdownTable(["항목", "값"], moneyBreakdownTable(sample1))}

샘플 1 수익률 민감도:

${markdownTable(["조건", "연 수익률", "최종 세후 자산", "총 수익률", "마지막 가격", "평균 매수단가"], sample1SensitivityRows)}

화면 비교 방법:
- KRW 화면에서 초기 투자금 \`0\`, 월 적립금 \`10\`, 연 수익률 \`0\`, 투자 기간 \`1\`, 세금 \`0\`, 수수료 \`0\` 입력
- 비교 값: 누적 투자금 1,200,000원, 마지막 가격 100, 평균 매수단가 100, 총 매수수량 12,000, 최종 세후 자산 1,200,000원, MDD 0.00%
- 민감도 표는 3행(-2%p / 현재 / +2%p)으로 표시되어야 하며 현재 수익률 행이 강조되어야 합니다.

## 샘플 2. 수익률 있는 단순 검증

${markdownTable(["항목", "값"], paramsTable(sample2.params))}

주기 수익률:
- 현재 월복리 설정에서는 연 12%를 월 \`${fmtPct(sample2.meta.grossPeriodReturn * 100, 4)}\`로 단순 환산합니다.
- 마지막 가격은 시작 지수 100에 월 수익률을 12번 누적 적용한 \`${fmtNumber(sample2.analysis.priceProxy, 4)}\`입니다.

${markdownTable(["결과", "값"], resultTable(sample2))}

월별 검증 표:

${markdownTable(
  ["월", "매수 전 가격", "납입금", "매수수량", "누적수량", "누적 투자금", "평가금액(세후)", "월말 가격"],
  sample2MonthlyRows
)}

## 샘플 3. 수수료/세금 검증

${markdownTable(["항목", "값"], paramsTable(sample3.params))}

${markdownTable(["결과", "값"], resultTable(sample3))}

세금/수수료 참고 분해:

${markdownTable(
  ["항목", "값", "설명"],
  [
    ["과세 대상 수익 근사", fmtMoney(sample3Costs.taxableGainApprox), "세전 모델 자산 - 총 납입금"],
    ["세금 효과 근사", fmtMoney(sample3Costs.taxDragApprox), "수수료 0%, 세율만 반영한 재시뮬레이션과 세전 모델의 차이"],
    ["수수료 효과 근사", fmtMoney(sample3Costs.feeDragApprox), "세율 0%, 수수료만 반영한 재시뮬레이션과 세전 모델의 차이"],
    ["세금·수수료 통합 효과", fmtMoney(sample3Costs.combinedDrag), "현재 UI가 표시하는 세전/세후 모델 차이"],
  ]
)}

주의: 현재 계산기는 실제 매도 시점 세금 원장과 총보수 원장을 별도로 적립하지 않고, 세율과 수수료율을 세후 수익률 가정에 통합 반영합니다. 따라서 위 분해는 같은 산식으로 다시 돌린 참고값입니다.

## 샘플 4. 일괄투자 비교

${markdownTable(["항목", "값"], paramsTable(sample4.params))}

${markdownTable(
  ["비교 항목", "값"],
  [
    ["DCA 총 납입 예정액", fmtMoney(sample4.analysis.totalInvested)],
    ["DCA 최종 세후 자산", fmtMoney(sample4.analysis.finalNet)],
    ["같은 금액 일괄투자 세후 자산", fmtMoney(sample4.analysis.lumpSumNet)],
    ["일괄투자 - DCA 차이", fmtMoney(sample4.analysis.lumpSumGap)],
    ["차이율(DCA 세후 자산 대비)", fmtPct(sample4.analysis.lumpSumGapPct)],
  ]
)}

원금 vs 수익 분해:

${markdownTable(["항목", "값"], moneyBreakdownTable(sample4))}

설명 문구:
- 일괄투자 비교는 마지막 해 세후 자산을 다시 투자하는 개념이 아닙니다.
- 매월 나누어 넣을 총 원금 \`${fmtMoney(sample4.analysis.totalInvested)}\`을 첫 달에 한 번에 투자했다고 가정한 참고 비교입니다.
- 상승장이 꾸준히 이어지는 단순 모델에서는 일괄투자가 DCA보다 유리하게 나올 수 있습니다.
- DCA는 투자 시점을 나누기 때문에 하락장이나 변동성이 큰 구간에서 평균 매수단가를 낮추는 효과를 기대할 수 있습니다.
- 이 비교는 입력한 수익률이 일정하게 적용된 단순 모델 기준입니다.

## 민감도 예시

연 수익률 민감도:

${markdownTable(["조건", "연 수익률", "최종 세후 자산", "세후 수익금", "총 수익률", "마지막 가격", "평균 매수단가"], sensitivityRows)}

투자 기간 민감도:

${markdownTable(["조건", "기간", "총 납입원금", "최종 세후 자산", "세후 수익금", "총 수익률"], periodRows)}

검증 메모:
- 원금 vs 수익 분해는 총 납입원금, 세전 평가금액, 세전 수익, 세금, 수수료, 세후 자산, 세후 수익, 원금 비중, 수익 비중을 모두 출력합니다.
- 샘플 4의 차이 금액은 \`일괄투자 최종 세후 자산 - DCA 최종 세후 자산\`과 일치합니다.
- 샘플 4의 차이율은 \`차이 금액 / DCA 최종 세후 자산\`과 일치합니다.

## 목표 금액 역산 방식

- 목표 금액은 **최종 세후 자산** 기준으로 비교합니다.
- 필요 월 납입금은 새 산식을 만들지 않고 \`solveMonthlyContributionForTarget()\`에서 기존 \`simulateDcaPlan()\`을 반복 호출해 계산합니다.
- 역산은 이분 탐색을 사용합니다. 하한은 0, 상한은 현재 납입금 또는 목표 금액 기준 추정값에서 시작해 충분할 때까지 2배씩 늘립니다.
- 최대 반복은 상한 탐색 60회, 이분 탐색 60회이며 허용 오차는 최종 세후 자산 기준 약 1원입니다.
- 주간 납입 모드는 필요 주 납입금을 계산한 뒤 월 환산값(\`주 납입금 * 52 / 12\`)을 함께 표시합니다.
- 목표가 초기 투자금만으로 이미 달성되는 경우 필요 월 납입금은 0으로 처리합니다.

## 샘플 5. 목표 금액 역산 기본 검증

${markdownTable(["항목", "값"], paramsTable(sample5.params))}

목표 분석:

${markdownTable(["항목", "값"], targetAnalysisTable(sample5Target))}

수익률 민감도 목표 비교:

${markdownTable(["조건", "연 수익률", "최종 세후 자산", "목표 여부", "목표 대비 초과/부족"], sample5TargetReturnRows)}

기간 민감도 목표 비교:

${markdownTable(["조건", "기간", "최종 세후 자산", "목표 여부", "목표 대비 초과/부족"], sample5TargetPeriodRows)}

## 샘플 6. 목표 금액 이미 달성 케이스

${markdownTable(["항목", "값"], paramsTable(sample6.params))}

${markdownTable(["항목", "값"], targetAnalysisTable(sample6Target))}

검증 포인트:
- \`reached=true\`입니다.
- 목표 대비 부족 금액은 0 이하이며, 화면의 추가 필요 월 납입금은 0으로 표시되어야 합니다.

## 샘플 7. 무수익 단순 역산

${markdownTable(["항목", "값"], paramsTable(sample7.params))}

${markdownTable(["항목", "값"], targetAnalysisTable(sample7Target))}

수작업 검증:
- 연 수익률 0%, 세금 0%, 수수료 0%, 초기 투자금 0원입니다.
- 10년은 120개월이므로 목표 120,000,000원을 만들려면 월 1,000,000원이 필요합니다.
- 화면에서는 KRW 기준 월 적립금 0, 목표 금액 120,000,000, 기간 10년, 수익률/세금/수수료 0을 입력했을 때 필요 월 납입금이 약 1,000,000원으로 표시되어야 합니다.

## 하락장 시나리오 산식 요약

- 하락장 시나리오는 기본 DCA 산식을 유지한 상태에서 가격 지수와 세전/세후 평가금액에 단순 가격 충격을 곱합니다.
- 시작 가격 지수는 기존과 동일하게 100입니다.
- 기본 모델은 기존 계산과 동일하며 충격을 적용하지 않습니다.
- 초반 하락 후 회복은 첫 20% 구간 또는 첫 1년 중 더 짧은 기간에 누적 -20%가 되도록 충격을 나누어 적용합니다.
- 중간 하락 후 회복은 전체 투자 기간의 중간 지점에 -20% 충격을 1회 적용합니다.
- 마지막 해 하락은 마지막 12개월 또는 마지막 20% 구간 중 더 짧은 기간에 누적 -20%가 되도록 충격을 나누어 적용합니다.
- 충격 이후에는 입력한 연 수익률의 기본 경로가 이어집니다.
- 이 비교는 시장 예측이 아니라 하락 시점에 따른 DCA 경로 차이를 이해하기 위한 참고용입니다.

## 샘플 8. 하락장 시나리오 기본 검증

${markdownTable(["항목", "값"], paramsTable(sample8Params))}

${markdownTable(
  [
    "시나리오",
    "최종 세후 자산",
    "총 납입원금",
    "세후 수익",
    "총 수익률",
    "마지막 가격",
    "평균 매수단가",
    "보유 수량",
    "가격 경로 MDD",
    "기본 대비 차이",
    "기본 대비 차이율",
    "목표 여부",
    "목표 대비 초과/부족",
  ],
  sample8Rows
)}

검증 포인트:
- 기본 모델 결과는 샘플 5의 현재 조건 최종 세후 자산과 일치합니다.
- 하락장 시나리오 중 최소 1개 이상은 가격 경로 MDD가 0이 아닌 값으로 표시됩니다.
- 마지막 해 하락 시나리오는 기본 모델보다 낮은 최종 세후 자산을 보여줍니다.
- 목표 금액 100,000,000원 기준으로 각 시나리오의 목표 달성 여부와 초과/부족 금액을 함께 확인합니다.

## MDD/모델 낙폭 0.00% 조건

- 현재 모델은 사용자가 입력한 연평균 수익률을 일정한 경로로 적용합니다.
- 별도 변동성, 하락장, 일별 가격 데이터가 없으면 가격 경로가 하락하지 않을 수 있습니다.
- 특히 양의 수익률과 계속되는 납입이 함께 있으면 연도별 세후 자산이 이전 고점을 밑돌지 않아 단순 모델 낙폭이 0.00%로 표시될 수 있습니다.
- 이는 실제 시장 MDD가 0이라는 뜻이 아니라, 단순 가격 경로의 결과입니다.

## 수정 내용

- 페이지 내부에 있던 DCA 계산 산식을 \`lib/dcaCore.js\` 공통 모듈로 분리했습니다.
- 화면과 검증 스크립트가 동일한 산식을 사용하도록 연결했습니다.
- MDD, 단순 모델 낙폭, 지수 100 기준, 마지막 가격, 평균 매수단가, 일괄투자 비교 설명을 보강했습니다.
- 기존의 모호한 일괄투자 설명을 “DCA 총 납입 예정액” 기준 설명으로 변경했습니다.
- 결과 해석 카드, 투자 원금 vs 성과 분해, 수익률/기간 민감도 표, 해석 박스를 추가했습니다.
- 2차 작업에서 “내 돈과 수익 분해” 항목을 9개 값으로 확장하고, 세금/수수료가 0일 때도 0으로 표시하도록 확인했습니다.
- 2차 작업에서 수익률 민감도 표에 마지막 가격과 평균 매수단가를 추가하고, 기간 민감도 표에 총 납입원금을 추가했습니다.
- 2차 작업에서 일괄투자 비교 상세값(DCA 세후 자산, 일괄투자 세후 자산, 차이 금액, 차이율, 사용 원금)과 해석 문구를 추가했습니다.
- 연도별 표에 평균 매수단가, 가격 지수, 단순 모델 낙폭 컬럼을 추가했습니다.
- 연도별 표와 차트 tooltip의 누적 수익률 표시식을 \`net / invested * 100\`에서 \`(net / invested - 1) * 100\`으로 수정했습니다.
- 목표 금액 입력, 목표 달성 분석 카드, 필요 월 납입금 역산, 목표 기준 수익률/기간 민감도 표시를 추가했습니다.
- 하락장 시나리오 4개(기본, 초반 하락 후 회복, 중간 하락 후 회복, 마지막 해 하락)를 추가하고 기본 모델 대비 차이와 목표 달성 여부를 표시했습니다.

## 발견된 버그와 판단

- 샘플 1 검증 기준에서 총 납입금, 수량, 평균 매수단가, 마지막 가격, 최종 자산, MDD는 기대값과 일치했습니다.
- 화면 QA 중 연도별 표와 차트 tooltip의 누적 수익률이 손익분기에서도 100.00%로 표시되는 버그를 확인했고, 0.00%가 표시되도록 수정했습니다.
- 연도별 모델 낙폭이 0.00%로 나오는 것은 양의 수익률과 단순 증가 경로에서는 버그가 아니라 모델 구조의 결과입니다.
- 다만 세금과 수수료는 실제 원장처럼 분리 계산하지 않고 세후 수익률에 통합 반영되므로, 향후 더 정교한 비용 원장 기능은 별도 개선 과제로 남깁니다.

## 남은 TODO

- 실제 가격 데이터 기반 MDD 또는 변동성 입력
- 세금/수수료를 실제 현금흐름 원장으로 분리하는 고급 모드
`;

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, report, "utf8");

console.log("DCA simulator verification completed.");
console.log(`Report: ${REPORT_PATH}`);
console.log(
  JSON.stringify(
    {
      sample1: {
        totalInvested: sample1.analysis.totalInvested,
        finalNet: sample1.analysis.finalNet,
        finalPrice: sample1.analysis.priceProxy,
        totalUnits: sample1.analysis.totalUnits,
        averageCost: sample1.analysis.averageCost,
        mdd: sample1.analysis.maxDrawdownPct,
      },
      sample2: {
        periodReturnPct: sample2.meta.grossPeriodReturn * 100,
        finalPrice: sample2.analysis.priceProxy,
        averageCost: sample2.analysis.averageCost,
        finalNet: sample2.analysis.finalNet,
      },
      sample3: {
        finalGross: sample3.analysis.finalGross,
        finalNet: sample3.analysis.finalNet,
        combinedCostDrag: sample3.analysis.taxFeeDrag,
      },
      sample4: {
        dcaFinalNet: sample4.analysis.finalNet,
        lumpSumNet: sample4.analysis.lumpSumNet,
        gap: sample4.analysis.lumpSumGap,
        gapPct: sample4.analysis.lumpSumGapPct,
      },
      sample5: {
        projectedNetValue: sample5Target.projectedNetValue,
        targetAmount: sample5Target.targetAmount,
        shortfall: sample5Target.shortfall,
        achievementRate: sample5Target.achievementRate,
        requiredMonthlyContribution: sample5Target.requiredMonthlyContribution,
        additionalMonthlyContribution: sample5Target.additionalMonthlyContribution,
      },
      sample6: {
        reached: sample6Target.reached,
        shortfall: sample6Target.shortfall,
        additionalMonthlyContribution: sample6Target.additionalMonthlyContribution,
      },
      sample7: {
        requiredMonthlyContribution: sample7Target.requiredMonthlyContribution,
        additionalMonthlyContribution: sample7Target.additionalMonthlyContribution,
      },
      sample8: sample8Scenarios.map((row) => ({
        key: row.key,
        finalNet: row.finalNet,
        finalPrice: row.priceProxy,
        averageCost: row.averageCost,
        mdd: row.priceMaxDrawdownPct,
        baseDiff: row.baseDiff,
        targetReached: row.targetReached,
      })),
    },
    null,
    2
  )
);
