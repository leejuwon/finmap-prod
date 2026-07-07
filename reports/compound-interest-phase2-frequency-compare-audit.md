# 복리 계산기 Phase 2-2A 공식 검증 보고서

- 검증일: 2026-07-07 (KST)
- 대상: 월복리 기준 결과와 독립 연복리 비교 공식
- 최종 판정: **PASS - Phase 2-2A 공식 검증 및 SEO blocker 해소 완료**

## 1. 작업 목적

기존 월복리 계산 결과와 UI를 변경하지 않고, 월복리와 비교할 교육용 연복리 계산 helper를 독립 구현했다. A~F fixture로 결과를 고정하고 기존 계산, SEO/FAQ, build 및 채널 sitemap 회귀를 점검했다.

## 2. 변경 파일

- `lib/compoundFrequencyCompare.js`: 독립 연복리 비교 함수와 A~F fixture
- `scripts/verify_compound_frequency_compare.js`: fixture, 회귀 해시, UI 미연결 검증
- `reports/compound-interest-phase2-frequency-compare-audit.md`: 본 보고서

금지 대상인 기존 core, page, UI, SEO/FAQ, sitemap, GA4, AdSense 및 `package.json`은 수정하지 않았다. Build와 기존 verifier가 갱신한 sitemap 및 기존 보고서는 원복했다.

## 3. UI 미연결

`compoundFrequencyCompare`는 `pages/tools/compound-interest.js`, `CompoundForm`, `CompoundQuickComparePanel`, `CompoundDetailSummary`에서 import하거나 호출하지 않는다. 입력 폼, Quick Comparison, PDF, GA4에도 연결하지 않았다.

## 4. 계산 기준

### 기존 월복리

- 기존 `simulateCompoundPlan` 결과를 기준값으로 사용한다.
- 순 연수익률을 12로 나눈 월 수익률과 매월 말 납입을 적용한다.
- 양수인 최종 세전 투자수익에 세금을 한 번 적용한다.
- 물가상승률은 최종 세후 금액의 현재가치 할인에만 적용한다.

### 신규 연복리 비교

Phase 2-2A에서는 연복리 비교를 보수적으로 정의했다. 원금과 이전 연도 말 잔액에는 연 1회 순수익률을 적용하고, 해당 연도 중 매월 납입한 12개월분은 연말에 합산하되 그해 수익률은 적용하지 않는다. 이는 실제 금융상품 수익 계산이 아니라 월복리 기준 결과와 비교하기 위한 교육용 시뮬레이션 기준이다.

초기 의사코드는 연간 납입액을 수익률 적용 전에 합산했다. 그 방식은 해당 연도 월말 납입액 전체가 1년 수익을 얻는 효과가 생겨 Sample A/B에서 연복리가 월복리보다 커졌다. 필수 검증식 `월복리 >= 연복리`와 보수적 비교 목적을 지키기 위해 최종 구현은 연 수익률 적용 후 연간 납입액을 합산한다.

### 세금·수수료·물가

- 순 연수익률: `annualRate - feeRatePercent`
- 수수료 영향: 같은 연복리 모델의 수수료 미차감 잔액과 순수익률 잔액 차이
- 세금: 최종 세전 투자수익이 양수일 때만 최종 시점에 1회 적용
- 물가: 명목 세후 금액은 바꾸지 않고 `presentValue`만 할인
- 금액 fixture: 기존 core convention과 같이 `Math.round`로 원 단위 반올림

## 5. Fixture 입력

| Sample | 원금 | 월 적립금 | 연 수익률 | 기간 | 세율 | 수수료율 | 물가 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A | 10,000,000 | 300,000 | 7% | 10년 | 15.4% | 0.5% | 0% |
| B | 10,000,000 | 300,000 | 7% | 10년 | 0% | 0% | 0% |
| C | 10,000,000 | 0 | 5% | 10년 | 15.4% | 0% | 0% |
| D | 10,000,000 | 300,000 | 0% | 10년 | 15.4% | 0% | 0% |
| E | 10,000,000 | 300,000 | -3% | 10년 | 15.4% | 0.5% | 0% |
| F | 10,000,000 | 300,000 | 7% | 10년 | 15.4% | 0.5% | 2.5% |

모든 fixture는 KRW, `baseYear: 2026`이다.

## 6. 연복리 고정 결과

| Sample | principalTotal | pretaxFinalAmount | tax | afterTaxFinalAmount | presentValue |
| --- | ---: | ---: | ---: | ---: | ---: |
| A | 46,000,000 | 67,351,296 | 3,288,100 | 64,063,196 | 64,063,196 |
| B | 46,000,000 | 69,410,726 | 0 | 69,410,726 | 69,410,726 |
| C | 10,000,000 | 16,288,946 | 968,498 | 15,320,449 | 15,320,449 |
| D | 46,000,000 | 46,000,000 | 0 | 46,000,000 | 46,000,000 |
| E | 46,000,000 | 37,830,932 | 0 | 37,830,932 | 37,830,932 |
| F | 46,000,000 | 67,351,296 | 3,288,100 | 64,063,196 | 50,046,067 |

기존 월복리 Sample A는 `6,600.2만원`, 세금/수수료 OFF Sample B는 `7,202.2만원`으로 유지됐다. A/B 모두 월복리 결과가 보수적 연복리 결과 이상이다.

## 7. 반환 및 Validation

결과는 `compounding: "yearly"`, 원금·세전·세후·현재가치·세금·수수료 영향과 `yearSummary`를 반환한다. `yearSummary`에는 연도, 달력 연도, 기초 잔액, 연간 납입액, 수익 적용 전 잔액, 연 수익, 세전/세후 기말 잔액, 누적 원금·세금·수수료가 포함된다. 마지막 행에 최종 세금과 세후 기말 잔액을 반영한다.

기존 core validation을 재사용해 원금/납입액 음수, 기간 0 이하, 연 수익률 및 물가 -99% 이하, 세율 범위 밖, 수수료 범위 밖, 순 연수익률 -99% 이하를 거부한다. 연복리의 연도별 loop를 위해 양의 정수 기간만 허용하며 `10.5년` fixture가 reject되는 것을 확인했다.

## 8. 회귀 보호

- `lib/compoundCore.js` SHA-256 유지: `9ea424f60ffd9305b8af9c34ef70475db8f330ca2be58fcd6464d00316726b6e`
- `lib/compound.js` SHA-256 유지: `7dac56894523f9f1566b3f6f559212b77f48b356c85fa1bea153849f0cbb9476`
- `pages/tools/compound-interest.js` SHA-256 유지: `9d6d050460e872a2d3b77906b8e9934729da9f56eb7392cfebe09a5107da2b1a`
  - KO SEO description hotfix 이후 새 정상 기준선이다.
  - frequency verifier의 page baseline도 같은 값으로 갱신됐다.
- FAQ: KO 24개, EN 8개, FAQPage JSON-LD 1개 유지

## 9. 검증 결과

| 명령 | 결과 |
| --- | --- |
| `node scripts\verify_compound_calculator.js` | PASS, 기존 A~D 유지 |
| `node scripts\verify_compound_phase1_seo_faq.js` | PASS, KO 24 / EN 8 / FAQPage 1개 |
| `node scripts\verify_compound_phase2_quick_compare.js` | PASS |
| `node scripts\verify_compound_frequency_compare.js` | PASS, 25개 체크 |
| `npm.cmd run build` | PASS, 214/214 페이지 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS, main 204 / KO 106 / EN 98 URL |
| `git diff --check` | PASS |

Build 후 `next-sitemap`과 channel sitemap 생성도 성공했다. 범위 밖 자동 생성 파일은 원복했다.

## 10. Phase 1 SEO Verifier 분석

초기 Phase 2-2A 검증 당시 KO SEO description에 `월복리 기준` 정확 문구가 없어 Phase 1 SEO verifier가 1건 실패했다. 이후 별도 SEO description hotfix에서 KO description을 Phase 1 기준 문구로 수정했고, page baseline SHA-256만 새 정상값으로 갱신했다.

최종 상태에서는 `verify_compound_phase1_seo_faq.js`가 PASS하며, verifier 조건 완화 없이 blocker가 해소됐다. KO/EN title과 EN description은 변경하지 않았고 FAQ는 KO 24개, EN 8개, FAQPage JSON-LD 1개를 유지한다.

## 11. 최종 판정 및 Phase 2-2B

연복리 helper, fixture, 기존 계산 보존, UI 미연결, build 및 SEO 채널 검증은 모두 PASS다. 최초 검증에서 확인된 Phase 1 SEO description blocker도 후속 hotfix로 해소되어 전체 판정은 **PASS - Phase 2-2A 공식 검증 및 SEO blocker 해소 완료**다.

Phase 2-2B UI 연결 시에는 보수적 연복리 가정과 실제 상품 계산이 아님을 가까운 위치에 표시하고, 기존 월복리 기본값과 URL preset을 변경하지 않아야 한다.

## 후속 Hotfix 반영

Phase 2-2A 최초 검증 당시 KO SEO description에 `월복리 기준` 정확 문구가 없어 `verify_compound_phase1_seo_faq.js`가 1건 실패했고, 최종 판정 전 후속 조치가 필요했다.

이후 별도 hotfix에서 다음을 반영했다.

- KO SEO description을 Phase 1 기준 문구로 수정
- `scripts/verify_compound_frequency_compare.js`의 page baseline SHA-256만 새 정상값으로 갱신
- verifier 조건 완화 없음
- core hash 유지
- 기존 계산 결과 유지
- Phase 1 SEO/FAQ verifier PASS
- Phase 2-1 Quick Comparison verifier PASS
- Phase 2-2A frequency verifier PASS
- build PASS
- SEO channel split PASS
- `git diff --check` PASS

따라서 Phase 2-2A의 최종 상태는 **PASS - Phase 2-2A 공식 검증 및 SEO blocker 해소 완료**로 정리한다.
