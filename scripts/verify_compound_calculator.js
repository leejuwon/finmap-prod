const fs = require("fs");
const path = require("path");

const {
  buildCompoundSensitivity,
  estimateYearsToTarget,
  simulateCompoundPlan,
  solveMonthlyContributionForTarget,
} = require("../lib/compoundCore");

const REPORT_PATH = path.join(__dirname, "..", "reports", "compound-calculator-audit.md");
const AMOUNT_TOLERANCE = 100;
const PERCENT_TOLERANCE = 0.01;

const SAMPLES = {
  A: {
    initialAmount: 10_000_000,
    monthlyContribution: 300_000,
    years: 10,
    annualReturn: 5,
    taxRate: 0,
    feeRate: 0,
    inflationRate: 2,
  },
  B: {
    initialAmount: 0,
    monthlyContribution: 500_000,
    years: 20,
    annualReturn: 7,
    taxRate: 15.4,
    feeRate: 0.2,
    inflationRate: 2.5,
  },
  C: {
    initialAmount: 10_000_000,
    monthlyContribution: 1_000_000,
    years: 5,
    annualReturn: 0,
    taxRate: 0,
    feeRate: 0,
    inflationRate: 0,
  },
  D: {
    initialAmount: 50_000_000,
    monthlyContribution: 0,
    years: 10,
    annualReturn: -2,
    taxRate: 0,
    feeRate: 0,
    inflationRate: 2,
  },
};

const EXPECTED = {
  A: {
    months: 120,
    principalTotal: 46_000_000,
    pretaxFinalAmount: 63_054_779,
    pretaxInvestmentGain: 17_054_779,
    tax: 0,
    afterTaxFinalAmount: 63_054_779,
    presentValue: 51_726_881,
  },
  B: {
    months: 240,
    principalTotal: 120_000_000,
    pretaxFinalAmount: 254_229_275,
    pretaxInvestmentGain: 134_229_275,
    tax: 20_671_308,
    afterTaxFinalAmount: 233_557_967,
    presentValue: 142_533_641,
  },
  C: {
    months: 60,
    principalTotal: 70_000_000,
    pretaxFinalAmount: 70_000_000,
    pretaxInvestmentGain: 0,
    tax: 0,
    afterTaxFinalAmount: 70_000_000,
    presentValue: 70_000_000,
  },
  D: {
    months: 120,
    principalTotal: 50_000_000,
    pretaxFinalAmount: 40_929_708,
    pretaxInvestmentGain: -9_070_292,
    tax: 0,
    afterTaxFinalAmount: 40_929_708,
    presentValue: 33_576_616,
  },
};

function parseArg(name, fallback = "") {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function money(value) {
  if (value == null || !Number.isFinite(Number(value))) return "-";
  return `${Math.round(Number(value)).toLocaleString("ko-KR")}원`;
}

function pct(value, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return "-";
  return `${Number(value).toFixed(digits)}%`;
}

function diffAmount(actual, expected) {
  return Math.abs(Math.round(Number(actual)) - Math.round(Number(expected)));
}

function passAmount(actual, expected) {
  return diffAmount(actual, expected) <= AMOUNT_TOLERANCE;
}

function passPercent(actual, expected) {
  return Math.abs(Number(actual) - Number(expected)) <= PERCENT_TOLERANCE;
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function verifySample(key, input) {
  const result = simulateCompoundPlan(input);
  if (!result.ok) {
    return {
      key,
      input,
      result,
      pass: false,
      failures: result.errors.map((err) => `${err.field}: ${err.ko}`),
    };
  }

  const expected = EXPECTED[key];
  const checks = [
    ["투자개월", result.rounded.months, expected.months, passAmount],
    ["원금합계", result.rounded.principalTotal, expected.principalTotal, passAmount],
    ["세전 최종금액", result.rounded.pretaxFinalAmount, expected.pretaxFinalAmount, passAmount],
    ["세전 투자수익", result.rounded.pretaxInvestmentGain, expected.pretaxInvestmentGain, passAmount],
    ["세금", result.rounded.tax, expected.tax, passAmount],
    ["세후 최종금액", result.rounded.afterTaxFinalAmount, expected.afterTaxFinalAmount, passAmount],
    ["현재가치", result.rounded.presentValue, expected.presentValue, passAmount],
  ];

  const failures = checks
    .filter(([, actual, expectedValue, passFn]) => !passFn(actual, expectedValue))
    .map(([label, actual, expectedValue]) => `${label}: expected ${expectedValue}, got ${actual}`);

  return {
    key,
    input,
    result,
    pass: failures.length === 0,
    failures,
  };
}

const verified = Object.entries(SAMPLES).map(([key, input]) => verifySample(key, input));
const failed = verified.filter((item) => !item.pass);

console.log("Compound calculator verification");
console.log("--------------------------------");
verified.forEach(({ key, input, result, pass, failures }) => {
  const r = result.rounded || {};
  console.log(`Sample ${key}: ${pass ? "PASS" : "FAIL"}`);
  console.log(`  input: initial=${money(input.initialAmount)}, monthly=${money(input.monthlyContribution)}, years=${input.years}, return=${input.annualReturn}%, tax=${input.taxRate}%, fee=${input.feeRate}%, inflation=${input.inflationRate}%`);
  console.log(`  months=${r.months}, netAnnualReturn=${pct(r.netAnnualReturn, 2)}`);
  console.log(`  principalTotal=${money(r.principalTotal)}, initialFV=${money(r.initialFutureValue)}, monthlyFV=${money(r.monthlyContributionFutureValue)}`);
  console.log(`  pretaxFinal=${money(r.pretaxFinalAmount)}, pretaxGain=${money(r.pretaxInvestmentGain)}, tax=${money(r.tax)}`);
  console.log(`  afterTaxFinal=${money(r.afterTaxFinalAmount)}, presentValue=${money(r.presentValue)}`);
  console.log(`  totalReturn=${pct(r.totalReturnPercent, 2)}, cagrReference=${pct(r.cagrReferencePercent, 4)}`);
  failures.forEach((failure) => console.log(`  - ${failure}`));
});

const summaryRows = verified.map(({ key, result, pass }) => {
  const r = result.rounded || {};
  return [
    key,
    String(r.months ?? "-"),
    pct(r.netAnnualReturn, 2),
    money(r.principalTotal),
    money(r.initialFutureValue),
    money(r.monthlyContributionFutureValue),
    money(r.pretaxFinalAmount),
    money(r.pretaxInvestmentGain),
    money(r.tax),
    money(r.afterTaxFinalAmount),
    money(r.presentValue),
    pct(r.totalReturnPercent, 2),
    pct(r.cagrReferencePercent, 4),
    pass ? "PASS" : "FAIL",
  ];
});

const inputRows = Object.entries(SAMPLES).map(([key, input]) => [
  key,
  money(input.initialAmount),
  money(input.monthlyContribution),
  `${input.years}년`,
  pct(input.annualReturn, 2),
  pct(input.taxRate, 2),
  pct(input.feeRate, 2),
  pct(input.inflationRate, 2),
]);

const screenRows = Object.entries(SAMPLES).map(([key, input]) => [
  key,
  input.currency || "KRW",
  (input.initialAmount / 10_000).toLocaleString("ko-KR"),
  (input.monthlyContribution / 10_000).toLocaleString("ko-KR"),
  String(input.years),
  String(input.annualReturn),
  String(input.taxRate),
  String(input.feeRate),
  String(input.inflationRate),
]);

const sampleASensitivity = buildCompoundSensitivity(SAMPLES.A)
  .map((row) => [
    row.group,
    row.key,
    money(row.rounded.afterTaxFinalAmount),
    money(row.rounded.principalTotal),
    money(row.rounded.pretaxInvestmentGain),
    money(row.rounded.presentValue),
    pct(row.rounded.totalReturnPercent, 2),
  ]);

const targetRows = Object.entries(SAMPLES).map(([key, input]) => {
  const targetAmount = 100_000_000;
  const requiredMonthly = solveMonthlyContributionForTarget({ ...input, targetAmount });
  const yearsToTarget = estimateYearsToTarget({ ...input, targetAmount });
  return [
    key,
    money(targetAmount),
    requiredMonthly == null ? "-" : money(requiredMonthly),
    yearsToTarget == null ? "-" : `${yearsToTarget.toFixed(2)}년`,
  ];
});

const buildResult = parseArg("buildResult", "아직 실행 전");
const generatedAt = new Date().toISOString();

const report = `# 복리 계산기 검증 보고서

생성일: ${generatedAt}

## 변경 파일 목록

- \`lib/compoundCore.js\`
- \`lib/compound.js\`
- \`_components/CompoundForm.js\`
- \`pages/tools/compound-interest.js\`
- \`scripts/verify_compound_calculator.js\`
- \`reports/compound-calculator-audit.md\`

## 계산 공식

- 월복리 기준입니다.
- 월 납입은 매월 말 납입으로 계산합니다.
- 순 연수익률 = \`annualReturn - feeRate\`
- 월 수익률 = \`순 연수익률 / 100 / 12\`
- 초기 투자금 미래가치 = \`initialAmount * (1 + monthlyRate)^months\`
- 월 납입금 미래가치 = \`monthlyContribution * (((1 + monthlyRate)^months - 1) / monthlyRate)\`
- \`monthlyRate\`가 0에 가까우면 월 납입금 미래가치계수는 \`months\`를 사용합니다.
- 세전 최종금액 = \`초기 투자금 미래가치 + 월 납입금 미래가치\`
- 원금합계 = \`initialAmount + monthlyContribution * months\`
- 세전 투자수익 = \`세전 최종금액 - 원금합계\`
- 세금 = \`max(세전 투자수익, 0) * taxRate / 100\`
- 세후 최종금액 = \`세전 최종금액 - 세금\`
- 현재가치 = \`세후 최종금액 / (1 + inflationRate / 100)^years\`
- 총수익률 = \`세후 최종금액 / 원금합계 - 1\`
- CAGR 참고값 = \`(세후 최종금액 / 원금합계)^(1 / years) - 1\`
- 투자수익이 음수이면 세금은 0원입니다.

## 기존 계산 방식과의 차이

- 기존 \`lib/compound.js\`는 월별 루프에서 납입 후 이자를 계산하고, 세금/수수료를 월별 또는 매입/매도 수수료처럼 반영했습니다.
- 이번 검증 코어는 요청 기준에 맞춰 월말 납입, 순 연수익률 차감, 최종 수익에 대한 세금 계산 방식으로 정리했습니다.
- 화면의 \`calcCompound\`와 검증 스크립트는 모두 \`lib/compoundCore.js\`의 \`simulateCompoundPlan\`을 사용합니다.

## 1.5차 월복리 기준 명확화

- 1차 검증 기준은 월복리 고정입니다.
- \`compoundCore\` 계산 공식은 이번 보완에서 변경하지 않았습니다.
- 화면의 복리 주기 선택 UI는 사용자 혼란을 줄이기 위해 읽기 전용 "월복리 기준" 안내로 변경했습니다.
- 기존 URL query 또는 저장 preset에 \`compounding=yearly\` 값이 남아 있어도 오류 없이 동작하며, 계산 호출 시 \`compounding: "monthly"\`로 정규화합니다.
- 연복리 비교는 이번 검증 범위가 아니며 후속 검증 대상입니다.

## 2차 UX/기능 확장 내용

### 2차 변경 파일 목록

- \`lib/compoundCore.js\`: 샘플 프리셋, 민감도 분석, 목표금액 역산, 연도별 분석 row helper 추가
- \`lib/compound.js\`: 화면 호환 wrapper에서 compoundCore helper export
- \`_components/CompoundForm.js\`: 검증 샘플 A-D 프리셋 버튼 추가
- \`_components/CompoundDetailSummary.js\`: 핵심 요약 카드, 수익 구조 분석, 결과 해석 박스 신규 추가
- \`_components/SensitivityPanel.js\`: compoundCore 기준 민감도 표로 교체
- \`_components/GoalEngineCard.js\`: compoundCore 기준 목표금액 역산 UI로 정리
- \`_components/CompoundYearTable.js\`: 연도별 예상 추이 표 보강
- \`pages/tools/compound-interest.js\`: 확장 결과 영역 연결

### 추가된 화면 입력값/결과 카드

- 입력 영역: 검증 샘플 A-D 버튼, 물가상승률, 월복리 고정 안내
- 핵심 결과: 세후 최종금액, 원금합계, 세전 투자수익, 세금, 현재가치, 총수익률, CAGR 참고값
- 수익 구조: 초기 투자금 미래가치, 월 납입금 미래가치, 수수료 영향, 세후 수익
- 해석 박스: 손실/원금 영향/납입+수익 동반/복리 효과 구간 안내

### 샘플 프리셋 A-D 사용 방법

- 복리 계산기 입력 영역의 "검증 샘플" 버튼을 클릭합니다.
- KO/EN 모두 버튼 클릭 시 통화가 KRW로 전환됩니다.
- 한국어 화면은 만원 단위 입력이므로 실제 금액을 10,000으로 나눈 값이 입력됩니다.
- 계산 버튼을 누른 뒤 아래 "샘플 실행 결과"의 핵심 값과 비교합니다.

### 화면에서 샘플 A-D 비교 시 확인해야 할 핵심 결과값

- 투자개월
- 원금합계
- 세전 최종금액
- 세전 투자수익
- 세금
- 세후 최종금액
- 물가 반영 현재가치
- 총수익률
- CAGR 참고값

### 민감도 분석 기준

- 연 수익률: -2%p, -1%p, 기준, +1%p, +2%p
- 월납입금: -20%, 기준, +20%
- 투자기간: -5년, 기준, +5년
- 투자기간 -5년이 1년 미만이면 1년으로 보정합니다.
- 각 시나리오는 \`simulateCompoundPlan\`을 다시 호출해 세후 최종금액, 원금합계, 세전 투자수익, 현재가치, 총수익률을 계산합니다.

샘플 A 민감도 예시:

${markdownTable(
  ["그룹", "키", "세후 최종금액", "원금합계", "세전 투자수익", "현재가치", "총수익률"],
  sampleASensitivity
)}

### 목표금액 역산 공식/기준

- 목표금액은 세후 최종금액 기준으로 비교합니다.
- 필요 월납입금은 \`solveMonthlyContributionForTarget\`에서 이분 탐색으로 구합니다.
- 현재 월납입 기준 도달 기간은 \`estimateYearsToTarget\`에서 같은 \`simulateCompoundPlan\` 결과로 탐색합니다.
- 세금/수수료/물가상승률과 월복리·월말 납입 조건을 그대로 사용합니다.
- 100년 안에 도달하지 않는 경우 \`null\`을 반환합니다.

목표금액 1억원 기준 역산 예시:

${markdownTable(
  ["샘플", "목표금액", "필요 월납입금", "현재 월납입 기준 도달 기간"],
  targetRows
)}

### 연도별 테이블 기준

- 각 연도 종료 시점에 같은 월복리/월말 납입 공식으로 정산한다고 가정합니다.
- 표시 항목: 연도, 납입원금, 세전금액, 세전 투자수익, 예상 세금, 세후금액, 현재가치, 목표 대비율
- 기본 10년만 표시하고 전체 보기 토글로 전체 기간을 확인합니다.

## 샘플 입력값

${markdownTable(
  ["샘플", "초기 투자금", "월 납입금", "기간", "연 수익률", "세율", "연 수수료율", "물가상승률"],
  inputRows
)}

## 샘플 실행 결과

허용 오차: 금액 100원 이내, 비율 0.01%p 이내

${markdownTable(
  [
    "샘플",
    "투자개월",
    "순 연수익률",
    "원금합계",
    "초기 FV",
    "월납입 FV",
    "세전 최종",
    "세전 수익",
    "세금",
    "세후 최종",
    "현재가치",
    "총수익률",
    "CAGR 참고값",
    "검증",
  ],
  summaryRows
)}

## 화면에서 비교할 때 입력해야 하는 값

복리 계산기 한국어 화면은 KRW 금액을 만원 단위로 입력합니다.

${markdownTable(
  ["샘플", "통화", "초기 투자금 입력값", "월 납입금 입력값", "기간", "연 수익률", "세율", "연 수수료율", "물가상승률"],
  screenRows
)}

## 검증 스크립트 실행 명령어

\`\`\`bash
node scripts/verify_compound_calculator.js
\`\`\`

## build 결과

${buildResult}

## 남은 TODO

- 연복리 비교는 후속 검증 대상입니다.
- 기존 단리 비교 영역은 이번 검증 코어와 별도 계산식이므로, 별도 검증 작업에서 정리할 수 있습니다.
`;

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, report, "utf8");

console.log("--------------------------------");
console.log(`Report written: ${REPORT_PATH}`);

if (failed.length) {
  console.error(`FAIL: ${failed.map((item) => item.key).join(", ")}`);
  process.exit(1);
}

const percentChecks = verified.every(({ result }) => {
  const r = result.rounded || {};
  return passPercent(r.totalReturnPercent, r.totalReturnPercent) &&
    passPercent(r.cagrReferencePercent, r.cagrReferencePercent);
});

if (!percentChecks) {
  console.error("FAIL: percent sanity check failed");
  process.exit(1);
}

console.log("All compound calculator samples PASS");
