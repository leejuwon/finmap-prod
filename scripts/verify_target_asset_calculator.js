const fs = require("fs");
const path = require("path");
const {
  buildTargetAssetScenario,
  buildTargetAssetSensitivity,
  findFirstReachMonth,
  formatReachText,
  getTargetAssetReturnMeta,
  simulateGoalPath,
  solveRequiredMonthly,
  summarizeTargetAssetRows,
} = require("../lib/goalSimulator");

const REPORT_PATH = path.join(process.cwd(), "reports", "target-asset-calculator-audit.md");

function fmtMoney(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("ko-KR")}원`;
}

function fmtPct(value, digits = 2) {
  return `${(Number(value) || 0).toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

function fmtNumber(value, digits = 2) {
  return (Number(value) || 0).toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function signedMoney(value) {
  const n = Number(value) || 0;
  if (n === 0) return fmtMoney(0);
  return `${n > 0 ? "+" : "-"}${fmtMoney(Math.abs(n))}`;
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" |")} |`,
    `| ${headers.map(() => "---").join(" |")} |`,
    ...rows.map((row) => `| ${row.join(" |")} |`),
  ].join("\n");
}

function assertClose(label, actual, expected, epsilon = 1) {
  if (Math.abs((Number(actual) || 0) - expected) > epsilon) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function runSample(name, params) {
  const rows = simulateGoalPath(params);
  const summary = summarizeTargetAssetRows(rows, {
    target: params.target,
    current: params.current,
  });
  const reachMonth = findFirstReachMonth(params);
  const requiredMonthly = solveRequiredMonthly(params);
  return {
    name,
    params,
    rows,
    summary,
    reachMonth,
    reachText: formatReachText(reachMonth, "ko"),
    requiredMonthly,
  };
}

function paramsTable(params) {
  return [
    ["현재 자산", fmtMoney(params.current)],
    ["목표 자산", fmtMoney(params.target)],
    ["월 납입금", fmtMoney(params.monthly)],
    ["투자 기간", `${params.years}년`],
    ["연 수익률", fmtPct(params.annualRate)],
    ["세율", fmtPct(params.taxRatePercent || 0)],
    ["연 수수료율", fmtPct(params.feeRatePercent || 0)],
    ["수익률 환산", params.compounding === "yearly" ? "연 복리 월 환산" : "연 수익률 / 12"],
  ];
}

function resultTable(sample) {
  const s = sample.summary;
  return [
    ["목표 도달 예상 기간", sample.reachText || "기간 내 미도달"],
    ["목표 달성 여부", s.targetReached ? "달성" : "미달"],
    ["최종 세전 자산", fmtMoney(s.finalGross)],
    ["최종 세후 자산", fmtMoney(s.finalNet)],
    ["총 납입원금", fmtMoney(s.totalInvested)],
    ["현재 자산", fmtMoney(s.currentAssets)],
    ["추가 납입 원금", fmtMoney(s.addedPrincipal)],
    ["투자 수익", signedMoney(s.netGain)],
    ["세금/수수료 효과", fmtMoney(s.taxFeeDragApprox)],
    ["목표 대비 초과/부족", signedMoney(s.targetDelta)],
    ["목표 달성률", fmtPct(s.targetAchievementRate)],
    ["필요 월 납입금", sample.requiredMonthly == null ? "계산 불가" : fmtMoney(sample.requiredMonthly)],
    ["현재 월 납입금 대비 추가 필요액", sample.requiredMonthly == null ? "계산 불가" : fmtMoney(Math.max(0, sample.requiredMonthly - sample.params.monthly))],
  ];
}

function yearRowsTable(sample) {
  return sample.rows.slice(0, 12).map((row) => [
    row.year,
    fmtMoney(row.invested),
    fmtMoney(row.valueGross),
    fmtMoney(row.valueNet),
    fmtMoney(row.valueNet - row.invested),
    sample.params.target > 0 ? fmtPct((row.valueNet / sample.params.target) * 100, 1) : "-",
  ]);
}

function sensitivityTable(rows, type) {
  if (type === "return") {
    return rows.map((row) => [
      row.key === "current" ? "현재" : row.delta > 0 ? "+2%p" : "-2%p",
      fmtPct(row.annualRate, 1),
      row.reachTextKo || "기간 내 미도달",
      fmtMoney(row.finalNet),
      fmtPct(row.targetAchievementRate, 1),
      signedMoney(row.targetDelta),
      row.requiredMonthly == null ? "계산 불가" : fmtMoney(row.requiredMonthly),
    ]);
  }
  if (type === "monthly") {
    return rows.map((row) => [
      row.key === "current" ? "현재" : row.deltaRatio > 0 ? "+20%" : "-20%",
      fmtMoney(row.monthly),
      row.reachTextKo || "기간 내 미도달",
      fmtMoney(row.finalNet),
      fmtPct(row.targetAchievementRate, 1),
      signedMoney(row.targetDelta),
    ]);
  }
  return rows.map((row) => [
    row.key === "current" ? "현재" : `+${row.delta}년`,
    `${fmtNumber(row.years, 1)}년`,
    fmtMoney(row.finalNet),
    fmtPct(row.targetAchievementRate, 1),
    signedMoney(row.targetDelta),
    fmtMoney(row.totalInvested),
  ]);
}

const baseDefaults = {
  compounding: "monthly",
  taxRatePercent: 0,
  feeRatePercent: 0,
  inflationPercent: 0,
  contribGrowthPercent: 0,
  valueKey: "valueNet",
};

const samples = [
  runSample("샘플 1. 무수익 단순 검증", {
    ...baseDefaults,
    current: 0,
    target: 12_000_000,
    monthly: 1_000_000,
    years: 1,
    annualRate: 0,
  }),
  runSample("샘플 2. 현재 자산이 있는 무수익 검증", {
    ...baseDefaults,
    current: 5_000_000,
    target: 17_000_000,
    monthly: 1_000_000,
    years: 1,
    annualRate: 0,
  }),
  runSample("샘플 3. 수익률 포함 검증", {
    ...baseDefaults,
    current: 10_000_000,
    target: 100_000_000,
    monthly: 500_000,
    years: 30,
    annualRate: 7,
    taxRatePercent: 15.4,
    feeRatePercent: 0.5,
  }),
  runSample("샘플 4. 목표 미달 케이스", {
    ...baseDefaults,
    current: 0,
    target: 100_000_000,
    monthly: 100_000,
    years: 5,
    annualRate: 3,
    taxRatePercent: 15.4,
    feeRatePercent: 0.5,
  }),
  runSample("샘플 5. 이미 목표 달성 케이스", {
    ...baseDefaults,
    current: 120_000_000,
    target: 100_000_000,
    monthly: 0,
    years: 1,
    annualRate: 0,
  }),
];

assertClose("sample1 reach month", samples[0].reachMonth, 12);
assertClose("sample1 total invested", samples[0].summary.totalInvested, 12_000_000);
assertClose("sample1 final net", samples[0].summary.finalNet, 12_000_000);
assertClose("sample1 net gain", samples[0].summary.netGain, 0);
assertClose("sample1 progress", samples[0].summary.targetAchievementRate, 100);

assertClose("sample2 reach month", samples[1].reachMonth, 12);
assertClose("sample2 final net", samples[1].summary.finalNet, 17_000_000);

if (samples[3].summary.targetReached) {
  throw new Error("sample4 should be short of target");
}

if (!samples[4].summary.targetReached) {
  throw new Error("sample5 should already reach target");
}
assertClose("sample5 reach month", samples[4].reachMonth, 0);
assertClose("sample5 additional monthly", Math.max(0, samples[4].requiredMonthly - samples[4].params.monthly), 0);

const sample3Sensitivity = buildTargetAssetSensitivity(samples[2].params);
const sample4Scenario = buildTargetAssetScenario(samples[3].params);
const returnMeta = getTargetAssetReturnMeta(samples[2].params);

const report = `# 목표자산 도달 계산기 검증 보고서

생성일: ${new Date().toISOString().slice(0, 10)}

## 점검 대상

- 페이지: \`pages/tools/goal-simulator.js\`
- 입력 폼: \`_components/GoalForm.js\`
- 공통 계산 코어: \`lib/goalSimulator.js\`
- 검증 스크립트: \`scripts/verify_target_asset_calculator.js\`

## 계산 산식 요약

- 월 단위로 계산합니다. 투자 기간은 \`years * 12\`개월이며, 화면의 연도별 표는 12개월 단위 행입니다.
- 월 납입금은 **월초 납입**으로 처리합니다. 즉, 매월 납입금이 먼저 더해진 뒤 해당 월 수익률이 적용됩니다.
- 월 수익률 환산 방식:
  - 월 단순 환산: \`annualRate / 12\`
  - 연 복리 환산: \`(1 + annualRate)^(1/12) - 1\`
- 세금/수수료는 실제 상품별 과세 계산이 아니라 화면 기존 산식과 같은 단순 조정입니다.
  - \`netYear = annualReturn * (1 - taxRate) - feeRate\`
  - 세후 자산은 \`netYear\`를 월 수익률로 환산해 계산합니다.
- 목표 자산은 **최종 세후 자산 기준**으로 비교합니다.
- 현재 자산도 입력한 수익률과 같은 조건으로 운용된다고 가정합니다.
- 수익률, 세금, 수수료, 기간은 모두 시뮬레이션 가정입니다.

## 샘플 검증 결과 요약

${markdownTable(
  ["샘플", "도달 기간", "최종 세후 자산", "목표 달성률", "목표 대비 초과/부족", "필요 월 납입금"],
  samples.map((sample) => [
    sample.name,
    sample.reachText || "기간 내 미도달",
    fmtMoney(sample.summary.finalNet),
    fmtPct(sample.summary.targetAchievementRate),
    signedMoney(sample.summary.targetDelta),
    sample.requiredMonthly == null ? "계산 불가" : fmtMoney(sample.requiredMonthly),
  ])
)}

## 샘플별 입력값과 결과

${samples.map((sample) => `### ${sample.name}

#### 입력값

${markdownTable(["항목", "값"], paramsTable(sample.params))}

#### 결과값

${markdownTable(["항목", "값"], resultTable(sample))}

#### 연도별 표

${markdownTable(["연도", "총 납입원금", "세전 자산", "세후 자산", "세후 수익", "목표 달성률"], yearRowsTable(sample))}
`).join("\n")}

## 샘플 3 민감도 결과

### 수익률 민감도

${markdownTable(
  ["구분", "연 수익률", "도달 기간", "최종 세후 자산", "달성률", "초과/부족", "필요 월 납입금"],
  sensitivityTable(sample3Sensitivity.returnScenarios, "return")
)}

### 월 납입금 민감도

${markdownTable(
  ["구분", "월 납입금", "도달 기간", "최종 세후 자산", "달성률", "초과/부족"],
  sensitivityTable(sample3Sensitivity.monthlyScenarios, "monthly")
)}

### 기간 민감도

${markdownTable(
  ["구분", "기간", "최종 세후 자산", "달성률", "초과/부족", "총 납입원금"],
  sensitivityTable(sample3Sensitivity.periodScenarios, "period")
)}

## 화면에서 비교할 값

- 샘플 1: 현재 자산 0, 목표 자산 12,000,000, 월 납입금 1,000,000, 연 수익률 0, 세금/수수료 0 입력 시 12개월 후 목표 도달과 최종 세후 자산 12,000,000원이 표시되어야 합니다.
- 샘플 2: 현재 자산 5,000,000, 목표 자산 17,000,000, 월 납입금 1,000,000, 연 수익률 0 입력 시 12개월 후 목표 도달과 최종 세후 자산 17,000,000원이 표시되어야 합니다.
- 샘플 4: 목표 미달 카드에서 부족액 ${fmtMoney(samples[3].summary.shortfall)} 및 필요 월 납입금 ${sample4Scenario.requiredMonthly == null ? "계산 불가" : fmtMoney(sample4Scenario.requiredMonthly)}이 표시되어야 합니다.
- 샘플 5: 이미 목표 달성 상태로 표시되고 추가 필요 월 납입금은 0원이어야 합니다.

## 발견 및 수정 내용

- 화면 내부에 있던 목표자산 계산 산식을 \`lib/goalSimulator.js\` 공통 코어로 정리했습니다.
- 화면과 검증 스크립트가 같은 \`simulateGoalPath\`, \`findFirstReachMonth\`, \`solveRequiredMonthly\`, \`buildTargetAssetSensitivity\` 함수를 사용합니다.
- 입력 폼의 한국어/영어 라벨을 목표 자산, 현재 자산, 월 납입금, 세율/수수료 의미가 드러나도록 정리했습니다.
- 결과 영역에 목표 달성 분석, 원금 vs 수익 분해, 수익률/월 납입금/기간 민감도, 결과 해석 박스를 추가했습니다.

## 샘플 3 계산 메타

- 세후 연 수익률 근사: ${fmtPct(returnMeta.netAnnualReturn * 100, 4)}
- 세후 월 수익률 근사: ${fmtPct(returnMeta.netMonth * 100, 4)}
- 세전 월 수익률 근사: ${fmtPct(returnMeta.grossMonth * 100, 4)}

## 남은 TODO

- 현재 세금/수수료 모델은 실제 상품별 과세 방식이 아니라 연 수익률을 단순 조정하는 방식입니다. 상품별 과세를 반영하려면 별도 2차 작업이 필요합니다.
- 기존 페이지 일부 오래된 설명 문구는 보존했습니다. 이번 작업에서는 계산 검증과 결과 해석 영역 중심으로 수정했습니다.
`;

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, report, "utf8");

console.log("Target asset calculator verification completed.");
console.log(`Report written: ${REPORT_PATH}`);
