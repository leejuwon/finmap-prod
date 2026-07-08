# Compound Interest Calculator Phase 2-3B UI 연결 보고서

- 작업일: 2026-07-08
- 대상: `/tools/compound-interest`, `/en/tools/compound-interest`
- 최종 판정: **PASS - Phase 2-3B contribution scenario UI 배포 가능**

## 1. 작업 목적

Phase 2-3A에서 고정한 `calcContributionScenario` helper를 결과 화면에 연결했다. 기본 월복리 계산값과 입력 폼은 유지하면서 월 적립금 증가율, 일시 추가 납입, 두 조건의 결합 결과를 별도 시나리오로 비교한다.

## 2. 변경 파일

- `_components/CompoundContributionScenarioPanel.js`: 시나리오 입력·비교·이벤트 UI 추가
- `pages/tools/compound-interest.js`: PRO Mobile 및 Basic/Desktop 결과 흐름에 패널 연결
- `scripts/verify_compound_contribution_scenario.js`: page baseline SHA-256 한 줄 갱신
- `scripts/verify_compound_frequency_compare.js`: page baseline SHA-256 한 줄 갱신
- `scripts/verify_compound_phase2_contribution_ui.js`: Phase 2-3B 전용 UI verifier 추가
- `reports/compound-interest-phase2-contribution-scenario-ui.md`: 본 보고서

Phase 2-3A에서 추가된 `lib/compoundContributionScenario.js`, fixture verifier 및 감사 보고서는 그대로 유지했다.

## 3. UI 배치

두 결과 branch 모두 다음 순서를 유지한다.

`Quick Comparison -> Monthly vs Annual Comparison -> Contribution Scenario -> ToolResultCta/관련 계산기 -> 상세 분석 -> FAQ`

새 패널은 CTA 앞에 배치하되 `<details>` 기본 접힘 상태로 렌더링한다. 런타임에서 시나리오 패널과 `CompoundResultActions`는 각각 1개만 존재했다.

## 4. 시나리오 입력 기준

- 월 적립금 증가율: 기본 5%, 직접 입력 및 0/3/5/10% 프리셋
- 일시 추가 납입: KRW 기본 500만원, USD 기본 $5,000
- 추가 납입 시점: 기본 3년 차 1월
- 기본 시나리오: 매년 5% 증가 + 3년 차 500만원 또는 $5,000 추가
- 입력값은 패널 local state에만 저장하며 기본 계산 폼과 URL preset은 변경하지 않는다.

## 5. 프리셋 기준

- 증가 없음: fixture A와 대응
- 매년 5% 증가: fixture C와 대응
- 3년 차 추가 납입: fixture D와 대응
- 5% 증가 + 3년 차 추가 납입: fixture E와 대응

브라우저에서 KRW 기준 결과가 각각 `6,600.2만원`, `7,706.9만원`, `7,383.9만원`, `8,490.5만원`으로 표시되는 것을 확인했다.

## 6. KRW/USD 단위 처리

- KRW 입력값은 만원 단위이며 `500 * 10,000 = 5,000,000원`으로 helper에 전달한다.
- USD 입력값은 달러 단위이며 기본값 `5000`을 그대로 전달한다.
- KO 320/390/768/1024px와 EN 390px에서 각 기본 입력값 및 표시 통화를 확인했다.

## 7. 추가 납입 시점 변환

연차와 월 입력을 아래 식으로 helper의 1-based 월 번호로 변환한다.

```js
extraContributionMonth = (extraYear - 1) * 12 + extraMonthOfYear
```

따라서 기본값 3년 차 1월은 25개월차로 전달된다.

## 8. 표시 항목

현재 기본 결과와 시나리오 결과에 각각 총 납입원금, 세후 최종금액, 세후 수익, 현재가치를 표시한다. 별도 차이 영역에는 추가 납입원금, 세후 최종금액 차이, 세후 수익 차이, 현재가치 차이를 분리해 표시한다.

## 9. 차이 계산 방식

각 차이는 `scenarioResult - baseResult`로 계산한다. 납입원금 증가분과 세후 최종금액 증가분을 별도 값으로 제공해 증가한 최종금액 전체를 수익으로 오해하지 않도록 했다. 패널 하단에는 기본 계산값을 바꾸지 않는 별도 교육용 비교라는 KO/EN 안내문을 유지한다.

## 10. GA4 이벤트

- `tool_contribution_scenario_view`: 패널 50% 이상 노출 시 같은 result signature당 1회
- `tool_contribution_scenario_preset_click`: 성장률 또는 시나리오 프리셋 클릭 시 1회
- 공통 파라미터: `source_tool=compound`, `locale`, `currency`, `location=result_contribution_scenario`
- view에는 `scenario_type=growth_extra_contribution`, preset click에는 `preset_type`을 추가한다.
- 브라우저 stub 검증에서 view 중복 없음, raw input 변경 시 preset 이벤트 없음, 프리셋 4회 클릭 시 이벤트 4회 발생을 확인했다.

## 11. PDF

시나리오 패널은 `pdf-target` 내부에 포함된다. PDF export 시 details가 열리고 완료 후 원래 접힘 상태로 복원되며 `fm-exporting` class가 제거됐다. 결과 CTA와 관련 계산기는 기존 `fm-export-exclude` 규칙으로 제외된다. 다운로드 파일의 `%PDF` header와 `%%EOF` marker도 확인했다.

## 12. 계산 결과 보존

- 기본 월복리 세후 최종금액: `6,600.2만원` 유지
- 세금/수수료 OFF: `7,202.2만원` 유지
- 기존 A-D 계산 verifier: PASS
- `CompoundForm`, Quick Comparison, Frequency Compare 및 계산 core: 변경 없음

## 13. Fixture 보존

- contribution fixture A~H: 전부 PASS, 기대값 변경 없음
- frequency fixture A~F: 전부 PASS, 기대값 변경 없음
- fixture E 세후 최종금액: `84,905,411원` 유지
- `lib/compoundCore.js`, `lib/compound.js`, `lib/compoundFrequencyCompare.js`, `lib/compoundContributionScenario.js` hash 변경 없음

## 14. Page Baseline 갱신

새 `pages/tools/compound-interest.js` SHA-256:

`1cb38b68fbca29a65ce10221116f907ca665cf7b487ca7c3dde56ac2486c3483`

Phase 2-3B UI 연결로 page hash가 의도적으로 변경되어 contribution/frequency verifier의 page baseline만 새 정상값으로 갱신함. 다른 baseline hash, fixture 기대값 또는 verifier 조건은 변경하거나 완화하지 않았다.

## 15. SEO/FAQ

- KO/EN title 및 description 변경 없음
- canonical, hreflang, sitemap, robots, noindex 정책 변경 없음
- KO FAQ 24개, EN FAQ 8개 유지
- FAQPage JSON-LD 1개 유지

## 16. Verifier 결과

| 명령 | 결과 |
| --- | --- |
| `node scripts/verify_compound_calculator.js` | PASS, A-D |
| `node scripts/verify_compound_phase1_seo_faq.js` | PASS, KO 24 / EN 8 / FAQPage 1개 |
| `node scripts/verify_compound_phase2_quick_compare.js` | PASS |
| `node scripts/verify_compound_frequency_compare.js` | PASS, A-F 유지 |
| `node scripts/verify_compound_phase2_frequency_ui.js` | PASS |
| `node scripts/verify_compound_contribution_scenario.js` | PASS, A-H 유지 |
| `node scripts/verify_compound_phase2_contribution_ui.js` | PASS, 37개 체크 |
| `node scripts/verify_seo_channel_split.js --local-server` | PASS, main 204 / KO 106 / EN 98 |
| `git diff --check` | PASS |

## 17. Build 결과

`npm.cmd run build`: PASS. Next.js production build에서 정적 페이지 `214/214` 생성 완료. postbuild sitemap은 main 204, KO 106, EN 98 URL을 생성했으며 자동 갱신 파일은 검증 후 작업 범위 밖 변경으로 원복했다.

## 18. 브라우저 확인

- KO 320px, 390px, 768px, 1024px 및 EN 390px: PASS
- 기본 접힘과 펼침: PASS
- Frequency Compare -> Contribution Scenario -> CTA -> FAQ 순서: PASS
- KRW/USD 기본 단위, 3년 차 1월, A/C/D/E preset 결과: PASS
- 납입원금 차이와 최종금액 차이 분리: PASS
- horizontal overflow 및 가시 텍스트 clipping: 없음
- GA4 view 1회 및 preset click 조건: PASS
- PDF 포함, CTA 제외, details/class 복원: PASS

## 19. 발견 이슈 및 배포 가능 여부

기능·회귀 blocker는 발견되지 않았다. 브라우저 검증은 로컬 production build와 GA4 stub을 사용했으므로 배포 후 실제 GA4 DebugView 수신만 운영 환경에서 재확인한다.

**PASS - Phase 2-3B contribution scenario UI 배포 가능**
