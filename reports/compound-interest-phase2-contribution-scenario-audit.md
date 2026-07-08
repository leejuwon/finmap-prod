# 복리 계산기 Phase 2-3A Contribution Scenario 공식 검증 보고서

- 작업일: 2026-07-08 (KST)
- 최종 판정: **PASS - Phase 2-3A contribution scenario 공식 검증 완료**

## 1. 작업 목적

기존 월복리 계산과 UI를 변경하지 않고, 월 적립금의 연간 증가와 특정 월의 일시 추가 납입을 조합한 시나리오 계산식을 독립 helper로 검증했다. A~H fixture와 반환 구조를 고정해 Phase 2-3B UI 연결 전 계산 계약을 잠갔다.

## 2. 변경 파일

- `lib/compoundContributionScenario.js`: 독립 계산 helper와 A~H fixture
- `scripts/verify_compound_contribution_scenario.js`: fixture, validation, 금지 파일 hash 검증
- `reports/compound-interest-phase2-contribution-scenario-audit.md`: 본 보고서

기존 core, page, UI, SEO/FAQ, sitemap 및 package 설정은 수정하지 않았다.

## 3. 기존 월복리 기준

- 월복리, 월말 납입
- 순 연수익률: `annualRate - feeRatePercent`
- 월 수익률: `순 연수익률 / 100 / 12`
- 매월 수익을 먼저 반영하고 해당 월 납입액을 더함
- 최종 양수 세전 투자수익에 세금을 1회 적용
- 물가는 최종 세후 금액의 현재가치 할인에만 사용
- fixture 금액은 원 단위 `Math.round`

성장률 0, 추가 납입 0인 A/B는 기존 `simulateCompoundPlan`과 원 단위 반올림 결과가 같다.

## 4. 월 적립금 증가율

1년차 월 적립금은 입력 `monthly`다. 2년차부터 매년 시작 시 다음 식으로 갱신한다.

`currentMonthly = monthly * (1 + monthlyGrowthRatePercent / 100) ^ yearIndex`

월 적립금은 중간에 원 단위로 반올림하지 않고 계산 정밀도를 유지하며, 합계와 결과를 표시할 때 원 단위로 반올림한다.

## 5. 일시 추가 납입

`extraContributionMonth`는 1부터 시작하는 전체 투자 월 번호다. 해당 월의 수익을 기존 잔액에 먼저 적용한 뒤, 월말 정기 납입금과 `extraContributionAmount`를 함께 더한다.

25개월차 500만원 추가 납입은 25개월차 수익을 받지 않고 월말에 투입되며, 26개월차부터 남은 기간 동안 월복리 영향을 받는다. 추가 납입이 없으면 amount는 0, month는 `null`이다.

## 6. 월별 및 연도별 반환

`monthlySummary`는 월 번호, 연차, 달력 연도, 해당 연도 월 적립금, 정기/추가 납입액, 월 수익, 월 수수료 영향, 누적 원금과 세전 기말 잔액을 반환한다.

`yearSummary`는 연차, 달력 연도, 기초 잔액, 연간 정기/추가 납입, 연간 수익, 세전/세후 기말 잔액, 누적 원금과 수수료 영향을 반환한다. 최종 월과 최종 연도 행에는 최종 세금 및 세후 잔액을 반영한다.

## 7. 세금·수수료·물가

- 수수료 반영 잔액: 순 연수익률의 월 수익률 사용
- 수수료 미반영 잔액: 원래 연 수익률의 월 수익률 사용
- `feeDrag`: 같은 납입 시나리오에서 수수료 미반영 잔액과 세전 잔액 차이
- `tax`: `max(pretaxInvestmentGain, 0) * taxRatePercent / 100`
- `presentValue`: 세후 최종금액을 물가상승률로 기간만큼 할인

실제 금융상품 수익을 보장하지 않는 교육용 시뮬레이션 기준이다.

## 8. Validation

- 기존 `validateCompoundInputs` 재사용
- `years`: 양의 정수만 허용, fractional years reject
- `monthlyGrowthRatePercent`: -100% 초과 100% 이하
- 권장 실사용 범위: -50% 이상 100% 이하
- `extraContributionAmount`: 0 이상
- `extraContributionMonth`: `null` 또는 1~`years * 12` 범위의 정수
- 추가 납입액이 양수이면 추가 납입 월 필수
- 최종 결과와 월별/연도별 주요 값 finite 확인

## 9. A~H Fixture 입력

공통 입력은 원금 1,000만원, 월 30만원, 연 7%, 10년, 세율 15.4%, 수수료 0.5%, 물가 0%, KRW, base year 2026이다.

| Fixture | 변경 조건 |
| --- | --- |
| A | 고정 월 적립금, 추가 납입 없음 |
| B | 세금 0%, 수수료 0% |
| C | 월 적립금 매년 5% 증가 |
| D | 25개월차 500만원 추가 납입 |
| E | 매년 5% 증가 + 25개월차 500만원 추가 |
| F | E 조건에서 수익률 0%, 수수료 0% |
| G | 연 -3%, 수수료 0.5%, 25개월차 500만원 추가 |
| H | E 조건 + 물가 2.5% |

## 10. A~H Fixture 결과

| Fixture | principalTotal | pretaxFinalAmount | tax | afterTaxFinalAmount | presentValue |
| --- | ---: | ---: | ---: | ---: | ---: |
| A | 46,000,000 | 69,642,784 | 3,640,989 | 66,001,795 | 66,001,795 |
| B | 46,000,000 | 72,022,056 | 0 | 72,022,056 | 72,022,056 |
| C | 55,280,413 | 81,034,876 | 3,966,187 | 77,068,689 | 77,068,689 |
| D | 51,000,000 | 77,995,883 | 4,157,366 | 73,838,517 | 73,838,517 |
| E | 60,280,413 | 89,387,975 | 4,482,565 | 84,905,411 | 84,905,411 |
| F | 60,280,413 | 60,280,413 | 0 | 60,280,413 | 60,280,413 |
| G | 51,000,000 | 41,243,699 | 0 | 41,243,699 | 41,243,699 |
| H | 60,280,413 | 89,387,975 | 4,482,565 | 84,905,411 | 66,327,971 |

관계 검증:

- C는 A보다 원금과 세후 최종금액이 큼
- D 원금은 A보다 정확히 500만원 큼
- E는 A/C/D보다 세후 최종금액이 큼
- F는 세금 0이며 세후 최종금액과 납입원금이 같음
- G는 세전 손실이며 세금 0
- H의 명목 세후 최종금액은 E와 같고 현재가치는 더 낮음

## 11. 기존 결과 및 금지 파일 보존

- 기존 기본 월복리: `6,600.2만원` 유지
- 세금/수수료 OFF: `7,202.2만원` 유지
- `lib/compoundCore.js`: hash 유지
- `lib/compound.js`: hash 유지
- `lib/compoundFrequencyCompare.js`: hash 유지
- `pages/tools/compound-interest.js`: hash 유지
- CompoundForm, Quick Compare, Frequency Compare, Detail Summary: hash 유지
- KO/EN SEO title·description 변경 없음
- FAQ KO 24 / EN 8, FAQPage JSON-LD 1개 유지

## 12. 검증 결과

| 명령 | 결과 |
| --- | --- |
| `node scripts\verify_compound_calculator.js` | PASS |
| `node scripts\verify_compound_phase1_seo_faq.js` | PASS |
| `node scripts\verify_compound_phase2_quick_compare.js` | PASS |
| `node scripts\verify_compound_frequency_compare.js` | PASS |
| `node scripts\verify_compound_phase2_frequency_ui.js` | PASS |
| `node scripts\verify_compound_contribution_scenario.js` | PASS, 36개 체크 |
| `npm.cmd run build` | PASS, 214/214 페이지 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS, main 204 / KO 106 / EN 98 URL |
| `git diff --check` | PASS |

Build가 갱신한 범위 밖 sitemap과 기존 verifier 보고서는 원복했다.

## 13. Phase 2-3B UI 연결 시 주의사항

- 기본 계산과 기존 URL preset은 계속 고정 월 적립식으로 유지한다.
- 성장률 및 추가 납입은 별도 시나리오 입력으로 명확히 구분한다.
- 추가 납입 월은 1부터 시작하는 전체 월 번호보다 `몇 년 차/몇 월`처럼 사용자가 이해하기 쉬운 입력으로 변환하는 편이 안전하다.
- 증가한 총 납입원금과 투자수익을 분리해 보여줘야 결과 증가를 수익 효과로 오해하지 않는다.
- 성장률이 음수일 때의 의미와 교육용 고정 수익률 가정을 가까운 위치에 안내한다.
- UI 연결 전 A~H fixture와 기존 기본/OFF 결과를 다시 회귀 검증한다.

## 14. 최종 판정

**PASS - Phase 2-3A contribution scenario 공식 검증 완료**
