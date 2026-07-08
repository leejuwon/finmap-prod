# Compound Interest Calculator Phase 2-3B Production Check

- 확인 일자: 2026-07-08 (KST)
- 확인 대상: `https://www.finmaphub.com/tools/compound-interest`, `https://www.finmaphub.com/en/tools/compound-interest`
- 확인 방식: production HTTP 요청, headless Chrome runtime, 실제 PDF 다운로드
- 최종 판정: **FAIL - Phase 2-3B production 미반영**

## 1. HTTP 상태

| URL | 상태 |
| --- | ---: |
| `/tools/compound-interest` | 200 |
| `/en/tools/compound-interest` | 200 |
| `/sitemap.xml` | 200 |
| `/sitemap-ko.xml` | 200 |
| `/sitemap-en.xml` | 200 |
| `/en/sitemap.xml` | 200 |

KO sitemap, EN sitemap, `/en/sitemap.xml`에 각 compound calculator URL이 포함된 것도 확인했다.

## 2. Production 배포 상태

production 계산 실행 후 확인된 `data-testid`는 다음과 같다.

- `compound-quick-compare`: 존재
- `compound-frequency-compare`: 존재
- `compound-result-actions`: 존재
- `compound-contribution-scenario`: **없음**

콘솔 오류는 없었고 계산 버튼은 활성 상태였으며 기본 결과도 렌더링됐다. Cloudflare 응답은 `CF-Cache-Status: DYNAMIC`이었고 cache-busting 요청에서도 같은 결과가 나와 CDN 잔존 캐시로 보이지 않는다.

- production build ID: `uWY_1mk_b7eeREmO0w2ic`
- 현재 검증된 로컬 production build ID: `O5SMTxqEPpsTcb1EK2hHR`

따라서 현재 production에는 Phase 2-3B를 포함한 최신 build가 반영되지 않은 것으로 판단한다.

## 3. UI 순서와 Viewport

| Viewport | Quick | Frequency | Scenario | CTA | CTA before FAQ | Overflow |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| KO 320px | 1 | 1 | **0** | 1 | PASS | 없음 |
| KO 390px | 1 | 1 | **0** | 1 | PASS | 없음 |
| KO 768px | 1 | 1 | **0** | 1 | PASS | 없음 |
| KO 1024px | 1 | 1 | **0** | 1 | PASS | 없음 |
| EN 390px | 1 | 1 | **0** | 1 | PASS | 없음 |

기존 `Quick Comparison -> Frequency Compare -> CTA -> FAQ` 순서와 모바일 overflow 상태는 정상이다. 그러나 필수 순서인 `Quick Comparison -> Frequency Compare -> Contribution Scenario -> CTA -> FAQ`는 Scenario 부재로 FAIL이다.

패널 기본 접힘, 펼침/접힘, EN 긴 패널 문구는 production에서 확인할 수 없었다.

## 4. 시나리오 프리셋

Contribution Scenario 패널과 입력·프리셋이 production DOM에 없어 아래 항목은 모두 확인 불가/FAIL이다.

- 증가 없음: 기대 `6,600.2만원`
- 매년 5% 증가: 기대 `7,706.9만원`
- 3년 차 500만원 추가: 기대 `7,383.9만원`
- 5% 증가 + 3년 차 500만원: 기대 `8,490.5만원`
- 납입원금/세후 최종금액/세후 수익/현재가치 차이 표시
- `기본 계산값을 바꾸지 않는 별도 비교` 안내

## 5. 기존 결과 보존

기존 production 계산 기능은 정상이다.

- 기본 월복리: `6,600.2만원` PASS
- 세금/수수료 OFF: `7,202.2만원` PASS
- 연복리 비교: `6,406.3만원` PASS
- 월복리와 연복리 차이: `193.9만원` PASS

## 6. GA4 확인

브라우저 runtime에서 확인한 기존 `gtag` 호출:

- `tool_calculate`: 확인
- `tool_quick_compare_view`: 확인
- `tool_frequency_compare_view`: 확인
- `tool_result_cta_view`: 확인
- `tool_result_cta_click`: PDF 저장 클릭 시 확인
  - `action=save_pdf`
  - `location=result_after`

Phase 2-3B 패널이 없으므로 다음 신규 이벤트는 발생시킬 수 없었다.

- `tool_contribution_scenario_view`: 확인 불가/FAIL
- `tool_contribution_scenario_preset_click`: 확인 불가/FAIL
- 재스크롤 중복 방지 및 새 result signature 발화: 확인 불가
- raw input 변경 조건: 확인 불가

headless production 확인에서는 GA collect 요청이 관찰되지 않았다. 실제 GA4 DebugView 수신 확인은 계정 접근이 필요한 수동 항목이지만, 우선 신규 UI와 이벤트 자체가 production에 배포되어야 한다.

## 7. PDF

기존 PDF 기능:

- `compound-result.pdf`: 다운로드 PASS
- `%PDF` header: PASS
- `%%EOF` marker: PASS
- CTA/관련 계산기 제외: PASS
- `fm-exporting` 제거: PASS
- `tool_result_cta_click`의 `save_pdf/result_after`: PASS

Phase 2-3B 요구사항:

- Contribution Scenario 패널 포함: **FAIL - production DOM에 패널 없음**
- Scenario details 상태 복원: 확인 불가

## 8. SEO/FAQ

KO:

- title exact match: PASS
- description의 `월복리 기준`: PASS
- canonical self: PASS
- hreflang KO/EN: PASS
- noindex 없음: PASS
- FAQPage 1개 / mainEntity 24개: PASS

EN:

- title exact match: PASS
- description의 `monthly compounding`: PASS
- canonical self: PASS
- hreflang KO/EN: PASS
- noindex 없음: PASS
- FAQPage 1개 / mainEntity 8개: PASS

## 9. AdSense/Layout

production runtime에서 페이지당 AdSense slot 4개를 확인했다.

- KO viewport: filled 또는 iframe 확인 1개, visible 3개
- EN 390px: filled 또는 iframe 확인 2개, visible 2개
- 기존 결과 화면 horizontal overflow: 없음
- 기존 Quick/Frequency/CTA 화면의 치명적 겹침: 관찰되지 않음

Contribution Scenario가 없으므로 광고와 새 패널의 겹침, 패널 확장 layout shift, sticky CTA와 패널 관계, CTA 밀림 정도는 확인할 수 없다.

## 10. 발견 이슈

### Blocker

Phase 2-3B `CompoundContributionScenarioPanel`이 KO/EN production 모든 확인 viewport에서 렌더링되지 않는다. 이에 따라 프리셋, 신규 GA4 이벤트, PDF 패널 포함, 패널 기반 AdSense/layout 검증도 수행할 수 없다.

### 정상 유지 항목

HTTP/sitemap, 기존 월복리·연복리 계산, CTA 순서, 기존 PDF, SEO/FAQ는 정상이다.

## 11. 권장 다음 조치

현재 Phase 2-3B 산출물을 포함한 production build를 다시 배포한 뒤 production build ID 변경과 `compound-contribution-scenario` 렌더링을 먼저 확인한다. 이후 본 production check의 viewport, preset, GA4 DebugView, PDF, AdSense/layout 항목을 재실행한다.

## 12. 최종 판정

**FAIL - Phase 2-3B production 미반영**
