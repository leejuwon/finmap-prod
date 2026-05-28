# 은퇴자금 계산기 1차 검증 보고서

생성일: 2026-05-28

## 변경 파일 목록

- `lib/retirementCore.js`
- `lib/retirement.js`
- `lib/fire.js`
- `_components/RetirementDetailSimulator.js`
- `pages/tools/fire-calculator.js`
- `scripts/verify_retirement_calculator.js`
- `reports/retirement-calculator-audit.md`

## 계산 공식

- 은퇴까지 남은 연수: `retirementAge - currentAge`
- 은퇴 후 생활기간: `lifeExpectancy - retirementAge`
- 은퇴 전 월 수익률: `annualReturn / 100 / 12`
- 월저축 납입 시점: 매월 말
- 현재자산 미래가치: `currentAssets * (1 + monthlyReturn)^monthsToRetirement`
- 월저축 미래가치: `monthlySaving * (((1 + monthlyReturn)^months - 1) / monthlyReturn)`
- 월 수익률이 0에 가까우면 월저축 미래가치계수는 `months`를 사용합니다.
- 은퇴 시점 월생활비: `current monthlyExpense * (1 + inflation)^yearsToRetirement`
- 실질 연수익률: `(1 + retirementReturn) / (1 + inflation) - 1`
- 실질 월수익률: `realAnnualReturn / 12`
- 연금현가계수: `(1 - (1 + realMonthlyReturn)^(-retirementMonths)) / realMonthlyReturn`
- 실질 월수익률이 0에 가까우면 연금현가계수는 `retirementMonths`를 사용합니다.
- 필요 은퇴자금: `retirement monthlyExpense * annuityPresentValueFactor`
- 달성률: `expectedRetirementAssets / requiredRetirementFund * 100`
- 부족/초과: `expectedRetirementAssets - requiredRetirementFund`
- 목표 달성 월저축: `(requiredRetirementFund - currentAssetsFutureValue) / monthlySavingFutureValueFactor`

## 샘플 입력값

| 샘플 | 입력값 |
| --- | --- |
| A | 현재나이 40<br />은퇴나이 65<br />기대수명 90<br />현재자산 100,000,000원<br />월저축 1,000,000원<br />은퇴 전 수익률 5%<br />은퇴 후 수익률 3%<br />물가 2.5%<br />현재 월생활비 2,500,000원 |
| B | 현재나이 35<br />은퇴나이 60<br />기대수명 90<br />현재자산 50,000,000원<br />월저축 1,500,000원<br />은퇴 전 수익률 6%<br />은퇴 후 수익률 3.5%<br />물가 2%<br />현재 월생활비 3,000,000원 |
| C | 현재나이 50<br />은퇴나이 60<br />기대수명 95<br />현재자산 300,000,000원<br />월저축 500,000원<br />은퇴 전 수익률 4%<br />은퇴 후 수익률 2.5%<br />물가 3%<br />현재 월생활비 2,800,000원 |
| D | 현재나이 65<br />은퇴나이 65<br />기대수명 90<br />현재자산 800,000,000원<br />월저축 0원<br />은퇴 전 수익률 0%<br />은퇴 후 수익률 3%<br />물가 2.5%<br />현재 월생활비 3,000,000원 |

## 샘플 실행 결과

| 샘플 | 은퇴까지 | 은퇴 후 기간 | 은퇴 시점 월생활비 | 현재자산 FV | 월저축 FV | 예상 은퇴자산 | 필요 은퇴자금 | 부족/초과 | 달성률 | 유지 가능 월생활비 | 현재가치 유지 월생활비 | 필요 월저축 | 검증 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 25년 | 25년 | 4,634,860원 | 348,129,045원 | 595,509,708원 | 943,638,754원 | 1,308,767,883원 | -365,129,129원 | 72.10% | 3,341,795원 | 1,802,533원 | 1,613,137원 | PASS |
| B | 25년 | 30년 | 4,921,818원 | 223,248,491원 | 1,039,490,944원 | 1,262,739,434원 | 1,431,965,481원 | -169,226,046원 | 88.18% | 4,340,170원 | 2,645,468원 | 1,744,196원 | PASS |
| C | 10년 | 35년 | 3,762,966원 | 447,249,805원 | 73,624,902원 | 520,874,707원 | 1,723,023,858원 | -1,202,149,151원 | 30.23% | 1,137,555원 | 846,447원 | 8,664,012원 | PASS |
| D | 0년 | 25년 | 3,000,000원 | 800,000,000원 | 0원 | 800,000,000원 | 847,124,496원 | -47,124,496원 | 94.44% | 2,833,114원 | 2,833,114원 | 계산 불가 | PASS |

## 화면에서 비교할 때 입력해야 하는 값

현재 `/tools/fire-calculator` 화면은 기존 FIRE 방식의 입력 구조를 유지합니다. 화면에서 유사 비교를 할 때는 아래처럼 대응해서 입력합니다.

- 현재자산: `currentAssets`
- 월저축: `monthlySaving`
- 적립 기간: `retirementAge - currentAge`
- 은퇴 후 연 지출: `monthlyExpense * 12`
- 은퇴 전 수익률: `annualReturn`
- 물가상승률: `inflation`

단, 기대수명과 은퇴 후 예상수익률은 현재 화면에 독립 입력값으로 분리되어 있지 않습니다. 이번 1차 작업에서는 계산 코어와 검증 보고서를 먼저 만들고, UI 입력 확장은 후속 작업으로 분리하는 것이 안전합니다.

## 검증 스크립트 실행 명령어

```powershell
node scripts/verify_retirement_calculator.js
```

## 2차 UI/기능 확장 내용

### 추가된 화면 입력값

- 현재나이 `currentAge`
- 은퇴나이 `retirementAge`
- 기대수명 `lifeExpectancy`
- 현재자산 `currentAssets`
- 월저축 `monthlySaving`
- 은퇴 전 예상수익률 `annualReturn`
- 은퇴 후 예상수익률 `retirementReturn`
- 물가상승률 `inflation`
- 현재 월생활비 `monthlyExpense`

### 추가된 결과 카드/표

- 핵심 요약 카드: 예상 은퇴자산, 필요 은퇴자금, 부족/초과, 목표 달성률
- 은퇴 시점 생활비 카드: 현재 월생활비, 은퇴 시점 월생활비, 물가상승 증가분, 은퇴까지 남은 연수
- 은퇴 후 사용 가능액 카드: 은퇴 시점 기준 유지 가능 월생활비, 현재가치 기준 유지 가능 월생활비, 목표 월생활비 대비 차이
- 목표 달성 월저축 안내: 필요 월저축, 현재 월저축, 추가 필요 월저축
- 달성률 기준 해석 박스
- 민감도 분석 표: 은퇴 전 수익률 ±1%p, 은퇴나이 +3/+5년, 월생활비 ±10%
- 연도별 예상 자산 추이 표: 나이, 경과연수, 예상자산, 누적저축, 투자수익 추정, 목표 대비율

### 샘플 프리셋 A~D 사용 방법

`/tools/fire-calculator` 또는 `/en/tools/fire-calculator`에서 “은퇴자금 상세 입력” 영역의 A/B/C/D 버튼을 누르면 1차 검증 스크립트와 동일한 입력값이 세팅됩니다. 버튼 클릭 즉시 같은 `simulateRetirementPlan` 결과를 화면에서 확인할 수 있습니다.

### 화면에서 샘플 A~D 비교 시 확인해야 할 핵심 결과값

| 샘플 | 예상 은퇴자산 | 필요 은퇴자금 | 부족/초과 | 달성률 | 필요 월저축 |
| --- | --- | --- | --- | --- | --- |
| A | 943,638,754원 | 1,308,767,883원 | -365,129,129원 | 72.10% | 1,613,137원 |
| B | 1,262,739,434원 | 1,431,965,481원 | -169,226,046원 | 88.18% | 1,744,196원 |
| C | 520,874,707원 | 1,723,023,858원 | -1,202,149,151원 | 30.23% | 8,664,012원 |
| D | 800,000,000원 | 847,124,496원 | -47,124,496원 | 94.44% | 계산 불가 |

## 3차 배포 전 보완 내용

- 상세 은퇴자금 계산기는 한국어/영어 화면 모두 원화(KRW) 기준으로 표시합니다.
- 영어 화면에서도 샘플 A~D 결과 금액이 USD가 아니라 KRW 금액으로 보이도록 고정했습니다.
- 입력 영역에 “금액 입력은 원(KRW) 기준입니다.” / “Money inputs are in Korean won (KRW).” 안내를 추가했습니다.
- 부족/초과 카드의 숫자 색상이 부족이면 rose 계열, 초과면 emerald 계열로 보이도록 ResultMetric의 valueClassName 처리를 보완했습니다.
- A~D 프리셋이 검증 스크립트와 같은 테스트 샘플임을 안내하고, 버튼 title에 기본형/적극저축형/준비부족형/은퇴직전형 설명을 추가했습니다.
- 상세 은퇴자금 계산과 기존 간단 FIRE 계산 사이에 안내 박스를 추가해 두 계산 방식의 역할을 구분했습니다.

## Build 결과

npm.cmd run build 성공 (Next.js build 및 next-sitemap 완료)
