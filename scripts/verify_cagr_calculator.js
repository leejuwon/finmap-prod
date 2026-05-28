const fs = require("fs");
const path = require("path");

const {
  calculateCagr,
  calculateEndingValueFromCagr,
  calculateYearsToTarget,
  calculateRealCagr,
  calcCagr,
  formatYearsText,
} = require("../lib/cagrCore");

const reportPath = path.join(__dirname, "..", "reports", "cagr-calculator-audit.md");

function money(value) {
  if (value == null || !Number.isFinite(Number(value))) return "-";
  return `${Math.round(Number(value)).toLocaleString("ko-KR")}원`;
}

function pct(value, digits = 4) {
  if (value == null || !Number.isFinite(Number(value))) return "-";
  return `${Number(value).toFixed(digits)}%`;
}

function years(value, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return "-";
  return `${Number(value).toFixed(digits)}년`;
}

function assertClose(label, actual, expected, tolerance = 0.01) {
  if (Math.abs(Number(actual) - Number(expected)) > tolerance) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

const sample1 = calculateCagr({
  initial: 1_000_000,
  final: 2_000_000,
  years: 10,
});
assertClose("sample1 total return", sample1.totalReturnPercent, 100, 0.0001);
assertClose("sample1 CAGR", sample1.cagrPercent, 7.1773462536, 0.0001);

const sample2 = calculateCagr({
  initial: 10_000_000,
  final: 20_000_000,
  years: 5,
});
assertClose("sample2 total return", sample2.totalReturnPercent, 100, 0.0001);
assertClose("sample2 CAGR", sample2.cagrPercent, 14.8698354997, 0.0001);

const sample3 = calculateCagr({
  initial: 10_000_000,
  final: 8_000_000,
  years: 4,
});
assertClose("sample3 total return", sample3.totalReturnPercent, -20, 0.0001);
assertClose("sample3 CAGR", sample3.cagrPercent, -5.4258390997, 0.0001);

const sample4Ending = calculateEndingValueFromCagr({
  initial: 10_000_000,
  cagrPercent: 7,
  years: 10,
});
assertClose("sample4 ending value", sample4Ending, 19_671_513.66, 1);

const sample5Years = calculateYearsToTarget({
  initial: 30_000_000,
  target: 100_000_000,
  cagrPercent: 7,
});
assertClose("sample5 years to target", sample5Years, 17.794810146, 0.0001);

const sample6Real = calculateRealCagr({
  nominalCagrPercent: 7,
  inflationRatePercent: 3,
});
assertClose("sample6 real CAGR", sample6Real, 3.8834951456, 0.0001);

const sample7 = calculateCagr({
  initial: 0,
  final: 10_000_000,
  years: 10,
});
if (sample7.ok) {
  throw new Error("sample7 should be invalid");
}

const screenSample = calcCagr({
  initial: 1_000_000,
  final: 2_000_000,
  years: 10,
  taxRate: 0,
  feeRate: 0,
  targetCagr: 7,
  targetValue: 10_000_000,
  inflationRate: 3,
});

const sensitivityRows = screenSample.sensitivity.cagrScenarios.map((row) => [
  row.key === "current" ? "현재 CAGR" : row.delta < 0 ? "CAGR -2%p" : "CAGR +2%p",
  pct(row.cagrPercent, 2),
  money(row.endingValue),
  pct(row.totalReturnPercent, 2),
  row.finalDiff >= 0 ? `+${money(row.finalDiff)}` : `-${money(Math.abs(row.finalDiff))}`,
]);

const periodRows = screenSample.sensitivity.periodScenarios.map((row) => [
  row.key === "current" ? "현재 기간" : row.key === "shorter" ? "기간 -2년" : "기간 +2년",
  years(row.years, 2),
  pct(row.cagrPercent, 4),
  pct(row.totalReturnPercent, 2),
]);

const sampleRows = [
  [
    "샘플 1. 10년 2배 성장",
    "1,000,000 -> 2,000,000 / 10년",
    pct(sample1.totalReturnPercent, 2),
    pct(sample1.cagrPercent, 4),
    "-",
  ],
  [
    "샘플 2. 5년 2배 성장",
    "10,000,000 -> 20,000,000 / 5년",
    pct(sample2.totalReturnPercent, 2),
    pct(sample2.cagrPercent, 4),
    "-",
  ],
  [
    "샘플 3. 손실 구간",
    "10,000,000 -> 8,000,000 / 4년",
    pct(sample3.totalReturnPercent, 2),
    pct(sample3.cagrPercent, 4),
    "음수 CAGR 정상",
  ],
  [
    "샘플 4. 목표 CAGR 최종금액",
    "10,000,000 / CAGR 7% / 10년",
    "-",
    "7.0000%",
    money(sample4Ending),
  ],
  [
    "샘플 5. 목표금액 도달 기간",
    "30,000,000 -> 100,000,000 / CAGR 7%",
    "-",
    "7.0000%",
    `${years(sample5Years, 2)} (${formatYearsText(sample5Years, "ko")})`,
  ],
  [
    "샘플 6. 실질 CAGR",
    "명목 7% / 물가 3%",
    "-",
    pct(sample6Real, 4),
    "구매력 기준",
  ],
  [
    "샘플 7. 유효성 검증",
    "시작금액 0 / 최종 10,000,000 / 10년",
    "-",
    "계산 불가",
    sample7.errors[0]?.ko || "시작금액은 0보다 커야 합니다.",
  ],
];

const report = `# CAGR 계산기 검증 보고서

생성일: 2026-05-28

## 현재 계산 산식 요약

- 기본 CAGR 공식: \`CAGR = (최종금액 / 시작금액)^(1 / 기간) - 1\`
- 시작금액은 0보다 커야 합니다.
- 최종금액은 현재 화면 정책상 0보다 커야 합니다. 0 또는 음수 최종금액은 일반적인 CAGR 계산에 적합하지 않아 validation으로 처리합니다.
- 기간은 0보다 커야 하며, 소수 연도 입력을 지원합니다. 예: 2.5년.
- 총수익률 공식: \`최종금액 / 시작금액 - 1\`
- 목표 CAGR 기준 최종금액 공식: \`final = start × (1 + CAGR)^years\`
- 목표금액 도달 기간 공식: \`years = ln(target / start) / ln(1 + CAGR)\`
- 실질 CAGR 공식: \`realCagr = (1 + nominalCagr) / (1 + inflationRate) - 1\`
- 세율/수수료는 실제 상품별 과세 계산이 아니라 기존 화면 정책과 같은 단순 수익률 조정입니다.
- 화면은 입력한 시작금액과 최종금액 자체를 기준으로 계산합니다. 세전/세후 여부는 사용자가 입력한 금액 기준입니다.

## 샘플 검증 결과 요약

${markdownTable(
  ["샘플", "입력", "총수익률", "CAGR/수익률", "추가 결과"],
  sampleRows
)}

## 화면에서 비교할 값

- 샘플 1: 시작금액 100만원, 최종금액 200만원, 기간 10년 입력 시 총수익률 100%, CAGR 약 7.1773%가 표시되어야 합니다.
- 샘플 2: 시작금액 1,000만원, 최종금액 2,000만원, 기간 5년 입력 시 CAGR 약 14.8698%가 표시되어야 합니다.
- 샘플 3: 시작금액 1,000만원, 최종금액 800만원, 기간 4년 입력 시 총수익률 -20%, CAGR 약 -5.4250%가 표시되어야 합니다.
- 샘플 4: 시작금액 1,000만원, 목표 CAGR 7%, 기간 10년 입력 시 목표 CAGR 기준 최종금액 약 19,671,514원이 표시되어야 합니다.
- 샘플 5: 시작금액 3,000만원, 목표금액 1억원, 목표 CAGR 7% 입력 시 필요 기간 약 17.79년, 즉 약 17년 10개월로 표시됩니다.
- 샘플 7: 시작금액 0 입력 시 "시작금액은 0보다 커야 합니다." validation이 표시되어야 합니다.

## 민감도 샘플

### CAGR 민감도

${markdownTable(
  ["조건", "CAGR", "같은 기간 후 최종금액", "총수익률", "현재 최종금액 대비 차이"],
  sensitivityRows
)}

### 기간 민감도

${markdownTable(
  ["조건", "기간", "필요 CAGR", "총수익률"],
  periodRows
)}

## 발견된 버그와 수정 내용

- 화면과 검증 스크립트가 같은 \`lib/cagrCore.js\` 계산 함수를 사용하도록 공통화했습니다.
- 소수 연도 입력 시 연도별 성장 경로가 최종 소수 기간을 반영하도록 보완했습니다.
- 시작금액 0, 최종금액 0 이하, 기간 0 이하를 validation으로 분리했습니다.
- 결과 영역에 총수익률 vs CAGR 설명, 목표 CAGR 기준 최종금액, 목표금액 도달 기간, 실질 CAGR, 민감도 표를 추가했습니다.

## 남은 TODO

- 실제 상품별 세금/수수료 구조를 반영하려면 별도 세법/상품 유형 입력이 필요합니다.
- 월 단위 기간 입력 UI는 현재 날짜 입력 또는 소수 연도 입력으로 대체하고 있습니다.
`;

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, report, "utf8");

console.log("CAGR calculator verification completed.");
console.log(`Sample 1 CAGR: ${pct(sample1.cagrPercent, 4)} / total return: ${pct(sample1.totalReturnPercent, 2)}`);
console.log(`Sample 2 CAGR: ${pct(sample2.cagrPercent, 4)} / total return: ${pct(sample2.totalReturnPercent, 2)}`);
console.log(`Sample 3 CAGR: ${pct(sample3.cagrPercent, 4)} / total return: ${pct(sample3.totalReturnPercent, 2)}`);
console.log(`Sample 4 ending value: ${money(sample4Ending)}`);
console.log(`Sample 5 years to target: ${years(sample5Years, 2)} (${formatYearsText(sample5Years, "ko")})`);
console.log(`Sample 6 real CAGR: ${pct(sample6Real, 4)}`);
console.log(`Sample 7 validation: ${sample7.errors[0]?.en || "invalid"}`);
console.log(`Report written: ${reportPath}`);
