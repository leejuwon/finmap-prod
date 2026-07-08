# Compound Interest Calculator Phase 2-3B Pre-Deploy Smoke Test

- 테스트 일자: 2026-07-08
- 테스트 대상: `/tools/compound-interest`, `/en/tools/compound-interest`
- 테스트 기준: Next.js production build 및 로컬 production server
- 최종 판정: **PASS with manual follow-up - 실제 GA4 DebugView 수신은 배포 후 확인**

## 1. 변경 파일 범위

Smoke test에서는 제품 코드를 수정하지 않았다. 시작 및 종료 작업 트리에서 확인한 Phase 2-3A/2-3B 산출물은 다음과 같다.

- `_components/CompoundContributionScenarioPanel.js`
- `pages/tools/compound-interest.js`
- `lib/compoundContributionScenario.js` (Phase 2-3A 신규 파일, smoke test 중 변경 없음)
- `scripts/verify_compound_contribution_scenario.js`
- `scripts/verify_compound_frequency_compare.js`
- `scripts/verify_compound_phase2_contribution_ui.js`
- `reports/compound-interest-phase2-contribution-scenario-audit.md`
- `reports/compound-interest-phase2-contribution-scenario-ui.md`
- `reports/compound-interest-phase2-contribution-scenario-ui-smoke-test.md`

`lib/compoundCore.js`, `lib/compound.js`, `CompoundForm`, Quick/Frequency Compare, DetailSummary는 변경되지 않았다. build/verifier가 갱신한 sitemap과 기존 자동 보고서는 테스트 후 원복했다. 임시 smoke test script와 PDF도 삭제했다.

## 2. Verifier 결과

| 명령 | 결과 |
| --- | --- |
| `node scripts/verify_compound_calculator.js` | PASS, 기존 계산 A-D |
| `node scripts/verify_compound_phase1_seo_faq.js` | PASS, KO 24 / EN 8 / FAQPage 1개 |
| `node scripts/verify_compound_phase2_quick_compare.js` | PASS |
| `node scripts/verify_compound_frequency_compare.js` | PASS, frequency A-F |
| `node scripts/verify_compound_phase2_frequency_ui.js` | PASS |
| `node scripts/verify_compound_contribution_scenario.js` | PASS, contribution A-H |
| `node scripts/verify_compound_phase2_contribution_ui.js` | PASS, 37개 체크 |

기본 월복리 결과 `6,600.2만원`, 세금/수수료 OFF 결과 `7,202.2만원`, contribution A-H와 frequency A-F 기대값이 모두 유지됐다. core/helper 및 기존 UI baseline hash도 PASS했다.

## 3. Build 결과

`npm.cmd run build`: **PASS**

- optimized production build compile 성공
- 정적 페이지 `214/214` 생성
- postbuild sitemap 생성 성공
- channel sitemap: KO 106 / EN 98 / `/en/sitemap.xml` 98

## 4. SEO Channel Split

`node scripts/verify_seo_channel_split.js --local-server`: **PASS**

- main sitemap: 204 URL
- KO sitemap: 106 URL
- EN sitemap: 98 URL
- `/en/sitemap.xml`: 98 URL, EN-only prefix PASS
- compound KO/EN canonical self 및 채널 membership PASS
- 금지 URL 패턴, canonical/hreflang 회귀 없음

## 5. UI 순서

모든 확인 viewport에서 다음 순서를 확인했다.

`Quick Comparison -> Frequency Compare -> Contribution Scenario -> CTA -> FAQ`

- Contribution Scenario 패널 1개
- CTA/result actions 1개
- CTA가 FAQ보다 앞
- 패널 기본 접힘, 펼침 및 재접힘 정상

## 6. Viewport 결과

| 대상 | 결과 |
| --- | --- |
| KO 320px | PASS |
| KO 390px | PASS |
| KO 768px | PASS |
| KO 1024px | PASS |
| EN 390px | PASS |

모든 viewport에서 horizontal overflow와 가시 텍스트 clipping이 없었다. EN 긴 제목과 안내문도 정상 표시됐다.

## 7. 시나리오 입력 및 프리셋

기본 입력:

- 증가율: 5%
- KO/KRW 추가 납입: 500만원 (`5,000,000원`)
- EN/USD 추가 납입: $5,000
- 추가 납입 시점: 3년 차 1월, helper 기준 25개월차

KO 프리셋 결과:

| 프리셋 | 결과 |
| --- | ---: |
| 증가 없음 | `6,600.2만원` |
| 매년 5% 증가 | `7,706.9만원` |
| 3년 차 500만원 추가 | `7,383.9만원` |
| 5% 증가 + 3년 차 500만원 | `8,490.5만원` |

납입원금 증가분, 세후 최종금액 차이, 세후 수익 차이, 현재가치 차이가 각각 분리 표시됐다. KO `기본 계산값을 바꾸지 않는 별도 비교` 및 대응 EN 안내문도 확인했다.

## 8. GA4 이벤트

로컬 production server에서 `window.gtag` smoke stub으로 실제 런타임 발화를 확인했다.

- `tool_contribution_scenario_view`: 50% 노출 시 1회, 재스크롤 중복 없음
- 새 결과 signature 재계산 후: 추가 view 1회 허용
- `tool_contribution_scenario_preset_click`: 프리셋 4회 클릭에 4회 발생
- preset 이벤트에 `preset_type`, `location=result_contribution_scenario` 포함
- raw input 변경 시 preset 이벤트 없음
- 기존 `tool_calculate`: 발화 확인
- 기존 `tool_quick_compare_view`: 발화 확인
- 기존 `tool_frequency_compare_view`: 발화 확인
- 기존 `tool_result_cta_view`: 발화 확인

실제 GA4 endpoint/DebugView 수신 여부는 로컬 stub 범위 밖이므로 배포 후 확인한다.

## 9. tool_result_cta_click

소스 보존과 실제 클릭 발화를 분리해 확인했다.

- 소스 보존: `ToolResultCta`의 `tool_result_cta_click` 및 `trackClick` 경로 유지
- 실제 클릭: PDF 저장 버튼 클릭 시 이벤트 발생 확인
- `action=save_pdf`
- `location=result_after`

결과: **PASS - tool_result_cta_click remains active for PDF**

## 10. PDF 결과

390px KO에서 실제 `compound-result.pdf` 다운로드를 확인했다.

- 파일명: PASS
- `%PDF` header: PASS
- `%%EOF` marker: PASS
- Contribution Scenario 패널 포함: PASS
- export 중 details open 및 완료 후 기존 접힘 상태 복원: PASS
- CTA/관련 계산기 제외: PASS
- `fm-exporting` 제거: PASS

## 11. SEO/FAQ 결과

- KO title/description: 변경 없음
- EN title/description: 변경 없음
- KO/EN canonical self: PASS
- KO/EN hreflang: PASS
- noindex 없음
- FAQ KO 24 / EN 8
- FAQPage JSON-LD 각 페이지 1개
- JSON-LD mainEntity KO 24 / EN 8
- robots/sitemap 정책 변경 없음

## 12. 발견 이슈

배포 차단 이슈는 발견되지 않았다. production GA4 DebugView에서 신규/기존 이벤트가 실제 수신되는지만 배포 후 수동 확인이 필요하다.

최종 `git diff --check`는 PASS했다. 작업 트리에는 Phase 2-3A/2-3B 산출물과 본 smoke-test 보고서만 남았고, 자동 생성 sitemap·기존 자동 보고서·임시 test script/PDF는 남아 있지 않다.

## 13. 최종 판정

**PASS with manual follow-up - 실제 GA4 DebugView 수신은 배포 후 확인**
