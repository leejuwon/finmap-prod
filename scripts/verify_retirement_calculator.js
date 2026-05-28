const fs = require("fs");
const path = require("path");

const { simulateRetirementPlan } = require("../lib/retirementCore");

const REPORT_PATH = path.join(
  __dirname,
  "..",
  "reports",
  "retirement-calculator-audit.md"
);

const AMOUNT_TOLERANCE = 100;
const PERCENT_TOLERANCE = 0.01;

const SAMPLES = {
  A: {
    currentAge: 40,
    retirementAge: 65,
    lifeExpectancy: 90,
    currentAssets: 100_000_000,
    monthlySaving: 1_000_000,
    annualReturn: 5,
    retirementReturn: 3,
    inflation: 2.5,
    monthlyExpense: 2_500_000,
  },
  B: {
    currentAge: 35,
    retirementAge: 60,
    lifeExpectancy: 90,
    currentAssets: 50_000_000,
    monthlySaving: 1_500_000,
    annualReturn: 6,
    retirementReturn: 3.5,
    inflation: 2,
    monthlyExpense: 3_000_000,
  },
  C: {
    currentAge: 50,
    retirementAge: 60,
    lifeExpectancy: 95,
    currentAssets: 300_000_000,
    monthlySaving: 500_000,
    annualReturn: 4,
    retirementReturn: 2.5,
    inflation: 3,
    monthlyExpense: 2_800_000,
  },
  D: {
    currentAge: 65,
    retirementAge: 65,
    lifeExpectancy: 90,
    currentAssets: 800_000_000,
    monthlySaving: 0,
    annualReturn: 0,
    retirementReturn: 3,
    inflation: 2.5,
    monthlyExpense: 3_000_000,
  },
};

const EXPECTED = {
  A: {
    yearsToRetirement: 25,
    retirementYears: 25,
    monthlyExpenseAtRetirement: 4_634_860,
    currentAssetsFutureValue: 348_129_045,
    monthlySavingFutureValue: 595_509_708,
    expectedRetirementAssets: 943_638_754,
    requiredRetirementFund: 1_308_767_883,
    surplusOrShortfall: -365_129_129,
    achievementRate: 72.1013,
    sustainableMonthlyExpenseAtRetirement: 3_341_795,
    sustainableMonthlyExpensePresentValue: 1_802_533,
    requiredMonthlySaving: 1_613_137,
  },
  B: {
    yearsToRetirement: 25,
    retirementYears: 30,
    monthlyExpenseAtRetirement: 4_921_818,
    currentAssetsFutureValue: 223_248_491,
    monthlySavingFutureValue: 1_039_490_944,
    expectedRetirementAssets: 1_262_739_434,
    requiredRetirementFund: 1_431_965_481,
    surplusOrShortfall: -169_226_046,
    achievementRate: 88.1823,
    sustainableMonthlyExpenseAtRetirement: 4_340_170,
    sustainableMonthlyExpensePresentValue: 2_645_468,
    requiredMonthlySaving: 1_744_196,
  },
  C: {
    yearsToRetirement: 10,
    retirementYears: 35,
    monthlyExpenseAtRetirement: 3_762_966,
    currentAssetsFutureValue: 447_249_805,
    monthlySavingFutureValue: 73_624_902,
    expectedRetirementAssets: 520_874_707,
    requiredRetirementFund: 1_723_023_858,
    surplusOrShortfall: -1_202_149_151,
    achievementRate: 30.2303,
    sustainableMonthlyExpenseAtRetirement: 1_137_555,
    sustainableMonthlyExpensePresentValue: 846_447,
    requiredMonthlySaving: 8_664_012,
  },
  D: {
    yearsToRetirement: 0,
    retirementYears: 25,
    monthlyExpenseAtRetirement: 3_000_000,
    currentAssetsFutureValue: 800_000_000,
    monthlySavingFutureValue: 0,
    expectedRetirementAssets: 800_000_000,
    requiredRetirementFund: 847_124_496,
    surplusOrShortfall: -47_124_496,
    achievementRate: 94.4371,
    sustainableMonthlyExpenseAtRetirement: 2_833_114,
    sustainableMonthlyExpensePresentValue: 2_833_114,
    requiredMonthlySaving: null,
  },
};

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function money(value) {
  if (value === null) return "계산 불가";
  if (!Number.isFinite(Number(value))) return "-";
  return `${Math.round(Number(value)).toLocaleString("ko-KR")}원`;
}

function pct(value, digits = 2) {
  if (!Number.isFinite(Number(value))) return "-";
  return `${Number(value).toFixed(digits)}%`;
}

function years(value) {
  if (!Number.isFinite(Number(value))) return "-";
  return `${Number(value).toLocaleString("ko-KR", {
    maximumFractionDigits: 2,
  })}년`;
}

function diffOk(actual, expected, tolerance) {
  if (expected === null) return actual === null;
  return Math.abs(Number(actual) - Number(expected)) <= tolerance;
}

function compareResult(key, result) {
  const expected = EXPECTED[key];
  const rounded = result.rounded || {};
  const checks = [];

  const exactFields = ["yearsToRetirement", "retirementYears"];
  const amountFields = [
    "monthlyExpenseAtRetirement",
    "currentAssetsFutureValue",
    "monthlySavingFutureValue",
    "expectedRetirementAssets",
    "requiredRetirementFund",
    "surplusOrShortfall",
    "sustainableMonthlyExpenseAtRetirement",
    "sustainableMonthlyExpensePresentValue",
    "requiredMonthlySaving",
  ];

  for (const field of exactFields) {
    checks.push({
      field,
      pass: diffOk(rounded[field], expected[field], 0),
      actual: rounded[field],
      expected: expected[field],
    });
  }

  for (const field of amountFields) {
    checks.push({
      field,
      pass: diffOk(rounded[field], expected[field], AMOUNT_TOLERANCE),
      actual: rounded[field],
      expected: expected[field],
    });
  }

  checks.push({
    field: "achievementRate",
    pass: diffOk(
      rounded.achievementRate,
      expected.achievementRate,
      PERCENT_TOLERANCE
    ),
    actual: rounded.achievementRate,
    expected: expected.achievementRate,
  });

  return {
    pass: checks.every((check) => check.pass),
    checks,
  };
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function inputSummary(input) {
  return [
    `현재나이 ${input.currentAge}`,
    `은퇴나이 ${input.retirementAge}`,
    `기대수명 ${input.lifeExpectancy}`,
    `현재자산 ${money(input.currentAssets)}`,
    `월저축 ${money(input.monthlySaving)}`,
    `은퇴 전 수익률 ${input.annualReturn}%`,
    `은퇴 후 수익률 ${input.retirementReturn}%`,
    `물가 ${input.inflation}%`,
    `현재 월생활비 ${money(input.monthlyExpense)}`,
  ].join("<br />");
}

function resultRow(key, result, status) {
  const r = result.rounded;
  return [
    key,
    years(r.yearsToRetirement),
    years(r.retirementYears),
    money(r.monthlyExpenseAtRetirement),
    money(r.currentAssetsFutureValue),
    money(r.monthlySavingFutureValue),
    money(r.expectedRetirementAssets),
    money(r.requiredRetirementFund),
    money(r.surplusOrShortfall),
    pct(r.achievementRate, 2),
    money(r.sustainableMonthlyExpenseAtRetirement),
    money(r.sustainableMonthlyExpensePresentValue),
    money(r.requiredMonthlySaving),
    status.pass ? "PASS" : "FAIL",
  ];
}

const results = {};
const statuses = {};

for (const [key, input] of Object.entries(SAMPLES)) {
  const result = simulateRetirementPlan(input);
  results[key] = result;
  statuses[key] = result.ok
    ? compareResult(key, result)
    : { pass: false, checks: [{ field: "validation", pass: false }] };
}

const allPassed = Object.values(statuses).every((status) => status.pass);
const buildResult =
  getArg("buildResult") ||
  "미실행: 검증 스크립트 실행 후 npm.cmd run build를 별도로 실행해야 합니다.";

const changedFiles = [
  "lib/retirementCore.js",
  "lib/retirement.js",
  "lib/fire.js",
  "_components/RetirementDetailSimulator.js",
  "pages/tools/fire-calculator.js",
  "scripts/verify_retirement_calculator.js",
  "reports/retirement-calculator-audit.md",
];

const sampleRows = Object.entries(results).map(([key, result]) =>
  resultRow(key, result, statuses[key])
);

const report = `# 은퇴자금 계산기 1차 검증 보고서

생성일: 2026-05-28

## 변경 파일 목록

${changedFiles.map((file) => `- \`${file}\``).join("\n")}

## 계산 공식

- 은퇴까지 남은 연수: \`retirementAge - currentAge\`
- 은퇴 후 생활기간: \`lifeExpectancy - retirementAge\`
- 은퇴 전 월 수익률: \`annualReturn / 100 / 12\`
- 월저축 납입 시점: 매월 말
- 현재자산 미래가치: \`currentAssets * (1 + monthlyReturn)^monthsToRetirement\`
- 월저축 미래가치: \`monthlySaving * (((1 + monthlyReturn)^months - 1) / monthlyReturn)\`
- 월 수익률이 0에 가까우면 월저축 미래가치계수는 \`months\`를 사용합니다.
- 은퇴 시점 월생활비: \`current monthlyExpense * (1 + inflation)^yearsToRetirement\`
- 실질 연수익률: \`(1 + retirementReturn) / (1 + inflation) - 1\`
- 실질 월수익률: \`realAnnualReturn / 12\`
- 연금현가계수: \`(1 - (1 + realMonthlyReturn)^(-retirementMonths)) / realMonthlyReturn\`
- 실질 월수익률이 0에 가까우면 연금현가계수는 \`retirementMonths\`를 사용합니다.
- 필요 은퇴자금: \`retirement monthlyExpense * annuityPresentValueFactor\`
- 달성률: \`expectedRetirementAssets / requiredRetirementFund * 100\`
- 부족/초과: \`expectedRetirementAssets - requiredRetirementFund\`
- 목표 달성 월저축: \`(requiredRetirementFund - currentAssetsFutureValue) / monthlySavingFutureValueFactor\`

## 샘플 입력값

${markdownTable(
  ["샘플", "입력값"],
  Object.entries(SAMPLES).map(([key, input]) => [key, inputSummary(input)])
)}

## 샘플 실행 결과

${markdownTable(
  [
    "샘플",
    "은퇴까지",
    "은퇴 후 기간",
    "은퇴 시점 월생활비",
    "현재자산 FV",
    "월저축 FV",
    "예상 은퇴자산",
    "필요 은퇴자금",
    "부족/초과",
    "달성률",
    "유지 가능 월생활비",
    "현재가치 유지 월생활비",
    "필요 월저축",
    "검증",
  ],
  sampleRows
)}

## 화면에서 비교할 때 입력해야 하는 값

현재 \`/tools/fire-calculator\` 화면은 기존 FIRE 방식의 입력 구조를 유지합니다. 화면에서 유사 비교를 할 때는 아래처럼 대응해서 입력합니다.

- 현재자산: \`currentAssets\`
- 월저축: \`monthlySaving\`
- 적립 기간: \`retirementAge - currentAge\`
- 은퇴 후 연 지출: \`monthlyExpense * 12\`
- 은퇴 전 수익률: \`annualReturn\`
- 물가상승률: \`inflation\`

단, 기대수명과 은퇴 후 예상수익률은 현재 화면에 독립 입력값으로 분리되어 있지 않습니다. 이번 1차 작업에서는 계산 코어와 검증 보고서를 먼저 만들고, UI 입력 확장은 후속 작업으로 분리하는 것이 안전합니다.

## 검증 스크립트 실행 명령어

\`\`\`powershell
node scripts/verify_retirement_calculator.js
\`\`\`

## 2차 UI/기능 확장 내용

### 추가된 화면 입력값

- 현재나이 \`currentAge\`
- 은퇴나이 \`retirementAge\`
- 기대수명 \`lifeExpectancy\`
- 현재자산 \`currentAssets\`
- 월저축 \`monthlySaving\`
- 은퇴 전 예상수익률 \`annualReturn\`
- 은퇴 후 예상수익률 \`retirementReturn\`
- 물가상승률 \`inflation\`
- 현재 월생활비 \`monthlyExpense\`

### 추가된 결과 카드/표

- 핵심 요약 카드: 예상 은퇴자산, 필요 은퇴자금, 부족/초과, 목표 달성률
- 은퇴 시점 생활비 카드: 현재 월생활비, 은퇴 시점 월생활비, 물가상승 증가분, 은퇴까지 남은 연수
- 은퇴 후 사용 가능액 카드: 은퇴 시점 기준 유지 가능 월생활비, 현재가치 기준 유지 가능 월생활비, 목표 월생활비 대비 차이
- 목표 달성 월저축 안내: 필요 월저축, 현재 월저축, 추가 필요 월저축
- 달성률 기준 해석 박스
- 민감도 분석 표: 은퇴 전 수익률 ±1%p, 은퇴나이 +3/+5년, 월생활비 ±10%
- 연도별 예상 자산 추이 표: 나이, 경과연수, 예상자산, 누적저축, 투자수익 추정, 목표 대비율

### 샘플 프리셋 A~D 사용 방법

\`/tools/fire-calculator\` 또는 \`/en/tools/fire-calculator\`에서 “은퇴자금 상세 입력” 영역의 A/B/C/D 버튼을 누르면 1차 검증 스크립트와 동일한 입력값이 세팅됩니다. 버튼 클릭 즉시 같은 \`simulateRetirementPlan\` 결과를 화면에서 확인할 수 있습니다.

### 화면에서 샘플 A~D 비교 시 확인해야 할 핵심 결과값

${markdownTable(
  ["샘플", "예상 은퇴자산", "필요 은퇴자금", "부족/초과", "달성률", "필요 월저축"],
  Object.entries(results).map(([key, result]) => [
    key,
    money(result.rounded.expectedRetirementAssets),
    money(result.rounded.requiredRetirementFund),
    money(result.rounded.surplusOrShortfall),
    pct(result.rounded.achievementRate, 2),
    money(result.rounded.requiredMonthlySaving),
  ])
)}

## 3차 배포 전 보완 내용

- 상세 은퇴자금 계산기는 한국어/영어 화면 모두 원화(KRW) 기준으로 표시합니다.
- 영어 화면에서도 샘플 A~D 결과 금액이 USD가 아니라 KRW 금액으로 보이도록 고정했습니다.
- 입력 영역에 “금액 입력은 원(KRW) 기준입니다.” / “Money inputs are in Korean won (KRW).” 안내를 추가했습니다.
- 부족/초과 카드의 숫자 색상이 부족이면 rose 계열, 초과면 emerald 계열로 보이도록 ResultMetric의 valueClassName 처리를 보완했습니다.
- A~D 프리셋이 검증 스크립트와 같은 테스트 샘플임을 안내하고, 버튼 title에 기본형/적극저축형/준비부족형/은퇴직전형 설명을 추가했습니다.
- 상세 은퇴자금 계산과 기존 간단 FIRE 계산 사이에 안내 박스를 추가해 두 계산 방식의 역할을 구분했습니다.

## Build 결과

${buildResult}
`;

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, report, "utf8");

for (const [key, result] of Object.entries(results)) {
  const r = result.rounded;
  const status = statuses[key];
  console.log(`Sample ${key}: ${status.pass ? "PASS" : "FAIL"}`);
  console.log(`  은퇴까지 남은 연수: ${years(r.yearsToRetirement)}`);
  console.log(`  은퇴 후 생활기간: ${years(r.retirementYears)}`);
  console.log(`  은퇴 시점 월생활비: ${money(r.monthlyExpenseAtRetirement)}`);
  console.log(`  현재자산의 미래가치: ${money(r.currentAssetsFutureValue)}`);
  console.log(`  월저축의 미래가치: ${money(r.monthlySavingFutureValue)}`);
  console.log(`  예상 은퇴자산: ${money(r.expectedRetirementAssets)}`);
  console.log(`  필요 은퇴자금: ${money(r.requiredRetirementFund)}`);
  console.log(`  부족/초과 금액: ${money(r.surplusOrShortfall)}`);
  console.log(`  달성률: ${pct(r.achievementRate, 2)}`);
  console.log(`  은퇴 시 유지 가능한 월생활비: ${money(r.sustainableMonthlyExpenseAtRetirement)}`);
  console.log(`  현재가치 기준 유지 가능한 월생활비: ${money(r.sustainableMonthlyExpensePresentValue)}`);
  console.log(`  목표 달성에 필요한 월저축: ${money(r.requiredMonthlySaving)}`);
}

console.log(`Report written: ${REPORT_PATH}`);

if (!allPassed) {
  for (const [key, status] of Object.entries(statuses)) {
    for (const check of status.checks.filter((item) => !item.pass)) {
      console.error(
        `Mismatch ${key}.${check.field}: expected ${check.expected}, got ${check.actual}`
      );
    }
  }
  process.exit(1);
}
