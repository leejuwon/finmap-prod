# Compound Interest Calculator Phase 2-3B Production Check

- 확인 일자: 2026-07-08 (KST)
- 확인 대상:
  - `https://www.finmaphub.com/tools/compound-interest`
  - `https://www.finmaphub.com/en/tools/compound-interest`
- 확인 방식: production HTTP 요청, headless Chrome runtime DOM/SEO/GA wrapper/PDF 확인
- production build ID: `hXboXOXK40h4o5FeuPESk`
- 최종 판정: **PASS with manual follow-up - GA4 DebugView 수신만 후속 확인**

## 1. HTTP 상태

| URL | 상태 |
| --- | ---: |
| `/tools/compound-interest` | 200 |
| `/en/tools/compound-interest` | 200 |
| `/sitemap.xml` | 200 |
| `/sitemap-ko.xml` | 200 |
| `/sitemap-en.xml` | 200 |
| `/en/sitemap.xml` | 200 |

`/sitemap.xml`은 sitemap index이며 `sitemap-0.xml`을 참조한다. `sitemap-0.xml`, `sitemap-ko.xml`, `sitemap-en.xml`, `/en/sitemap.xml`에서 KO/EN compound calculator URL 포함을 확인했다.

## 2. UI 순서와 Viewport

계산 후 모든 확인 viewport에서 아래 순서가 유지됐다.

`Quick Comparison -> Frequency Compare -> Contribution Scenario -> CTA/result actions -> FAQ`

| Viewport | Quick | Frequency | Scenario | CTA/actions | 기본 접힘 | CTA before FAQ | Horizontal overflow |
| --- | ---: | ---: | ---: | ---: | --- | --- | ---: |
| KO 320px | 1 | 1 | 1 | 1 | PASS | PASS | 0px |
| KO 390px | 1 | 1 | 1 | 1 | PASS | PASS | 0px |
| KO 768px | 1 | 1 | 1 | 1 | PASS | PASS | 0px |
| KO 1024px | 1 | 1 | 1 | 1 | PASS | PASS | 0px |
| EN 390px | 1 | 1 | 1 | 1 | PASS | PASS | 0px |

Contribution Scenario 패널은 기본 접힘 상태였고, 펼침/접힘 동작 모두 정상이다. EN 390px에서도 document scrollWidth 기준 horizontal overflow는 없었다.

## 3. 시나리오 프리셋 결과

기본 조건:

- 원금 1,000만원
- 월 30만원
- 연 7%
- 10년
- 세금 15.4%
- 수수료 0.5%
- 물가 0%

| KO preset | 기대값 | Production 확인 |
| --- | ---: | --- |
| 증가 없음 | 6,600.2만원 | PASS |
| 매년 5% 증가 | 7,706.9만원 | PASS |
| 3년 차 500만원 추가 | 7,383.9만원 | PASS |
| 5% 증가 + 3년 차 500만원 | 8,490.5만원 | PASS |

아래 표시도 확인했다.

- 납입원금 증가분: PASS
- 세후 최종금액 차이: PASS
- 세후 수익 차이: PASS
- 현재가치 차이: PASS
- `기본 계산값을 바꾸지 않는 별도 비교` 안내: PASS

## 4. 기존 결과 보존

| 항목 | 기대값 | Production 확인 |
| --- | ---: | --- |
| 기본 월복리 결과 | 6,600.2만원 | PASS |
| 세금/수수료 OFF URL preset 복원 | 7,202.2만원 | PASS |
| 연복리 비교 | 약 6,406.3만원 | PASS |
| 월복리-연복리 차이 | 약 193.9만원 | PASS |

OFF 검증은 `applyTax=false&applyFee=false` URL preset으로 새 탭 복원 경로를 확인했다. 토글 상태도 세금 OFF, 수수료 OFF로 복원됐다.

## 5. GA4 DebugView / Runtime Event 확인

실제 GA4 DebugView 화면은 계정 접근이 필요해 직접 확인하지 못했다. 대신 production runtime에서 `gtag` wrapper로 이벤트 호출과 파라미터를 확인했다.

확인된 기존 이벤트:

- `tool_calculate`: PASS
- `tool_quick_compare_view`: PASS
- `tool_frequency_compare_view`: PASS
- `tool_result_cta_view`: PASS
- `tool_result_cta_click`: PASS
  - `action=save_pdf`
  - `location=result_after`

확인된 신규 이벤트:

- `tool_contribution_scenario_view`: PASS
  - 패널 노출 시 1회
  - 같은 result signature에서 재스크롤 중복 없음
- `tool_contribution_scenario_preset_click`: PASS
  - 프리셋 4개 클릭 시 4회
  - raw input change에서는 preset click 추가 발송 없음

후속 수동 확인:

- 실제 GA4 DebugView 수신 여부는 production 배포 후 계정 화면에서 최종 확인 필요.

## 6. PDF 확인

390px KO production에서 실제 PDF 다운로드를 확인했다.

| 항목 | 결과 |
| --- | --- |
| 파일명 `compound-result.pdf` | PASS |
| `%PDF` header | PASS |
| `%%EOF` marker | PASS |
| Contribution Scenario 패널 DOM 포함 | PASS |
| CTA/result actions export 제외 | PASS |
| details 상태 복원 | PASS |
| `fm-exporting` 제거 | PASS |
| PDF 저장 클릭 이벤트 | PASS, `tool_result_cta_click action=save_pdf location=result_after` |

## 7. SEO/FAQ 확인

KO:

- title: `복리 계산기 | 월복리·적립식 투자 미래가치 계산 | FinMap` PASS
- description: `월복리 기준` 문구 유지 PASS
- canonical self: PASS
- hreflang KO/EN: PASS
- noindex 없음: PASS
- FAQPage JSON-LD 1개 / mainEntity 24개: PASS

EN:

- title: `Compound Interest Calculator: Future Value, Monthly Contributions & Taxes | FinMap` PASS
- description: `monthly compounding` 문구 유지 PASS
- canonical self: PASS
- hreflang KO/EN: PASS
- noindex 없음: PASS
- FAQPage JSON-LD 1개 / mainEntity 8개: PASS

## 8. AdSense / Layout 확인

production runtime에서 `ins.adsbygoogle` 슬롯이 관찰됐다.

- KO 320/390/768/1024, EN 390에서 document-level horizontal overflow 없음
- 광고 영역과 Scenario 패널 겹침 없음
- sticky CTA/result actions와 Scenario 패널 겹침 없음
- Scenario 패널 기본 접힘 상태에서 CTA가 FAQ보다 앞에 유지됨
- 패널 펼침/접힘 후 layout 흐름 정상
- 일부 광고 slot은 `unfilled` 또는 hidden 상태였으나 치명적 layout shift나 overlap은 관찰되지 않음

## 9. 발견 이슈

차단 이슈 없음.

남은 수동 확인:

- 실제 GA4 DebugView 화면에서 `tool_contribution_scenario_view`, `tool_contribution_scenario_preset_click`, `tool_result_cta_click` 수신을 최종 확인해야 한다.
- Headless 환경에서는 광고 creative fill이 운영 사용자 환경과 다를 수 있으므로, 실제 브라우저에서 광고 fill 후 layout shift를 한 번 더 눈으로 확인하면 좋다.

## 10. 최종 판정

**PASS with manual follow-up - GA4 DebugView 수신만 후속 확인**

Phase 2-3B Contribution Scenario UI는 production에 반영됐고, 필수 UI 순서, 프리셋 결과, 기존 계산 결과, PDF, SEO/FAQ, sitemap 포함 상태는 정상이다. 실제 GA4 DebugView 수신은 계정 화면에서 후속 확인 대상으로 남긴다.
