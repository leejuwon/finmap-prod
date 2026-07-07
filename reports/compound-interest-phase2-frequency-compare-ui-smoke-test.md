# 복리 계산기 Phase 2-2B 배포 전 Smoke Test

- 테스트 일자: 2026-07-07 (KST)
- 대상: `/tools/compound-interest`, `/en/tools/compound-interest`
- 최종 판정: **PASS - Phase 2-2B 배포 가능**

## 1. 변경 파일 범위 및 경로

Phase 2-2B 변경 범위:

- `_components/CompoundFrequencyComparePanel.js`
- `pages/tools/compound-interest.js`
- `scripts/verify_compound_frequency_compare.js`
- `scripts/verify_compound_phase2_frequency_ui.js`
- `reports/compound-interest-phase2-frequency-compare-ui.md`

컴포넌트 실제 경로는 `C:\finmap\_components\CompoundFrequencyComparePanel.js`이며 파일이 존재한다. 잘못된 `C:\finmap_components\CompoundFrequencyComparePanel.js` 경로에는 파일이 없다.

## 2. Verifier 결과

| 명령 | 결과 |
| --- | --- |
| `node scripts\verify_compound_calculator.js` | PASS, 기존 A~D |
| `node scripts\verify_compound_phase1_seo_faq.js` | PASS |
| `node scripts\verify_compound_phase2_quick_compare.js` | PASS |
| `node scripts\verify_compound_frequency_compare.js` | PASS, Phase 2-2A fixture |
| `node scripts\verify_compound_phase2_frequency_ui.js` | PASS, Phase 2-2B UI 30개 체크 |

기존 core, wrapper, frequency helper hash와 연복리 A~F fixture가 유지됐다.

## 3. Build 및 SEO Channel

- `npm.cmd run build`: PASS
- 정적 페이지: 214/214
- next-sitemap 및 channel sitemap 생성: PASS
- main sitemap: 204 URL
- KO sitemap: 106 URL
- EN sitemap: 98 URL
- `/en/sitemap.xml`: 98 URL
- `node scripts\verify_seo_channel_split.js --local-server`: PASS

Build와 verifier가 갱신한 범위 밖 sitemap 및 기존 자동 보고서는 원복했다.

## 4. 모바일/데스크톱 UI

Production build를 로컬 서버로 실행하고 Chrome/Puppeteer에서 확인했다.

| Viewport | 언어/모드 | 패널 수 | CTA 수 | 필수 순서 | Horizontal overflow |
| ---: | --- | ---: | ---: | --- | --- |
| 320px | KO PRO Mobile | 1 | 1 | PASS | 없음 |
| 390px | KO PRO Mobile | 1 | 1 | PASS | 없음 |
| 768px | KO Basic/Desktop | 1 | 1 | PASS | 없음 |
| 1024px | KO Basic/Desktop | 1 | 1 | PASS | 없음 |
| 390px | EN PRO Mobile | 1 | 1 | PASS | 없음 |

필수 순서 `Quick Comparison → Frequency Compare → CTA → FAQ`를 모두 확인했다. Summary, Chart, 월복리 카드, 연복리 카드, 결과 차이 박스, 보수적 시뮬레이션 안내문이 표시됐다. 320px badge/text와 EN 390px 긴 문구도 패널 경계를 넘지 않았다.

## 5. 계산 결과 및 URL Preset

기본 조건:

- 월복리: `6,600.2만원`
- 연복리: 화면 `6,406.3만원`, fixture `64,063,196원`
- 차이: `1,938,599원`, 화면 약 `193.9만원`
- 차이율: 연복리 비교 대비 `3%` 표시

세금/수수료 OFF preset:

- 월복리: `7,202.2만원`
- 연복리: 화면 `6,941.1만원`, fixture `69,410,726원`
- 비교 패널과 안내문 정상 표시

Query preset으로 페이지를 연 뒤 계산을 실행해 입력 복원과 결과 연결을 확인했다. `applyTax=false`, `applyFee=false`가 연복리 비교에도 effective 0으로 반영됐다.

## 6. GA4 이벤트

`window.gtag` runtime interception 결과:

- `tool_frequency_compare_view`: 패널 50% 노출 시 1회
- 같은 결과 재스크롤 후: 총 1회 유지
- 입력값만 변경하고 계산하지 않은 상태: 추가 발송 없음
- 수익률 변경 후 재계산: 새 result signature 기준 1회 추가, 총 2회
- 파라미터: `source_tool=compound`, `locale`, `currency`, `location=result_frequency_compare`, `comparison_type=monthly_vs_annual` 확인

기존 이벤트 runtime 확인:

- `tool_calculate`
- `tool_quick_compare_view`
- `tool_quick_compare_click`
- `tool_result_cta_view`
- `tool_result_cta_click`
- `tool_hub_click`
- `tool_nav_click`

실제 GA4 DebugView 수신은 배포 후 확인 대상이지만, 브라우저의 이벤트 호출과 중복 방지 로직은 PASS다.

## 7. PDF

390px KO에서 실제 다운로드를 수행했다.

- 파일명: `compound-result.pdf`
- 파일 크기: 769,995 bytes
- Header: `%PDF`
- EOF: `%%EOF`
- Frequency Compare가 `pdf-target` 내부에 포함: PASS
- CTA/관련 계산기 `data-html2canvas-ignore=true`: PASS
- export 전후 details 상태 복원: PASS
- export 후 `fm-exporting` 제거: PASS

## 8. SEO/FAQ 회귀

KO:

- title: `복리 계산기 | 월복리·적립식 투자 미래가치 계산 | FinMap`
- description 변경 없음
- canonical self, KO/EN hreflang, noindex 없음
- FAQPage mainEntity 24개

EN:

- title: `Compound Interest Calculator: Future Value, Monthly Contributions & Taxes | FinMap`
- description 변경 없음
- canonical self, KO/EN hreflang, noindex 없음
- FAQPage mainEntity 8개

FAQPage JSON-LD는 언어별 페이지에서 1개이며 verifier도 PASS했다.

## 9. 발견 이슈

배포 차단 이슈는 없다. 브라우저 자동화 첫 시도에서 Puppeteer 키 조합 문법과 PowerShell 파이프의 한글 literal 비교 때문에 테스트 harness를 보정해 재실행했으며, 애플리케이션 결함은 아니었다. 보정 후 전체 smoke 항목이 PASS했다.

## 10. 배포 가능 여부

**PASS - Phase 2-2B 배포 가능**
