# Finmap 복리 계산기 Phase 2-1 배포 전 Smoke Test

- 테스트 일자: 2026-07-07 (KST)
- 테스트 유형: production build 기반 로컬 Smoke Test
- 코드 수정: 없음
- 대상 URL: `/tools/compound-interest`, `/en/tools/compound-interest`

## 1. 최종 판정

**PASS - Phase 2-1 배포 가능**

기존 계산 결과, 기간·월 적립금 비교, KO/KRW와 EN/USD 표시, 반응형 레이아웃, 결과 순서, GA4 이벤트, PDF export, SEO/FAQ, build가 모두 판정 기준을 통과했다. 배포 차단 이슈는 발견되지 않았다.

## 2. Build 및 verifier

| 명령 | 결과 |
| --- | --- |
| `node scripts\verify_compound_calculator.js` | PASS, 기존 A-D sample |
| `node scripts\verify_compound_phase1_seo_faq.js` | PASS |
| `node scripts\verify_compound_phase2_quick_compare.js` | PASS, 21개 항목 |
| `npm.cmd run build` | PASS, 214/214 pages |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `git diff --check` | PASS, 공백 오류 없음 |

build 후 channel sitemap 수는 main 204, KO 106, EN 98, `/en/sitemap.xml` 98이었다. build가 재정렬한 tracked sitemap 파일은 테스트 후 기존 상태로 복원했다.

## 3. 기존 계산 결과 보존

| 항목 | 기대값 | 결과 |
| --- | ---: | --- |
| 기본 세후 최종금액 | `6,600.2만원` | PASS |
| 세금/수수료 OFF | `7,202.2만원` | PASS |
| 기존 A-D sample | 전부 PASS | PASS |
| `lib/compoundCore.js` 변경 | 없음 | PASS |
| `lib/compound.js` 변경 | 없음 | PASS |

월복리, 매월 말 납입, 세금·수수료 계산 방식은 변경되지 않았다.

## 4. Quick Comparison UI

KO와 EN 모두 계산 후 패널이 표시됐다.

| 항목 | KO | EN | 결과 |
| --- | --- | --- | --- |
| 제목 | `빠른 비교` | `Quick Comparison` | PASS |
| 기간 tab | `기간 비교` | `Time horizon` | PASS |
| 월 적립금 tab | `월 적립금 비교` | `Monthly contribution` | PASS |
| 기간 | 5년, 10년, 20년, 30년 | 5, 10, 20, 30 years | PASS |
| 현재 조건 badge | `현재 조건` | `Current` | PASS |

### KRW 월 적립금

- 월 10만원
- 월 30만원
- 월 50만원
- 월 100만원

### USD 월 적립금

- `$100/mo`
- `$300/mo`
- `$500/mo`
- `$1,000/mo`

각 비교 유형은 정확히 4개 행을 표시했고, tab 전환 후 금액과 scenario label이 정상 갱신됐다.

## 5. 반응형 레이아웃

KO/EN 각각 모든 viewport를 검사했다.

| viewport | KO | EN | document overflow | 광고 겹침 |
| ---: | --- | --- | --- | --- |
| 320px | 카드형 PASS | 카드형 PASS | 없음 | 없음 |
| 390px | 카드형 PASS | 카드형 PASS | 없음 | 없음 |
| 768px | 카드형 PASS | 카드형 PASS | 없음 | 없음 |
| 1024px | 표형 PASS | 표형 PASS | 없음 | 없음 |

320px KO, 390px EN, 768px KO, 1024px EN panel screenshot을 직접 확인했다. 텍스트 잘림, 행 겹침, tab overflow는 관찰되지 않았다. 모바일의 고정 CTA는 기존 동작대로 viewport 하단에 유지되며 페이지 하단 safe area를 사용한다.

## 6. 결과 순서

### PRO mobile

DOM 순서와 화면 위치를 함께 확인했다.

1. Summary
2. Chart
3. Key Insights
4. Quick Comparison
5. ToolResultCta
6. 관련 계산기
7. 고급 분석 접힘
8. FAQ

### Basic/Desktop

1. Summary
2. Chart
3. Quick Comparison
4. ToolResultCta
5. 관련 계산기
6. 기존 상세 분석
7. FAQ

공통 결과:

- Quick Comparison이 CTA보다 앞: PASS
- CTA가 고급/상세 분석과 FAQ보다 앞: PASS
- `ToolResultCta` runtime count 1: PASS
- 관련 계산기 순서 `goal -> dca -> cagr -> fire`: PASS

## 7. GA4 이벤트

local production page에서 `window.gtag` event dispatch를 수집했다.

### 신규 이벤트

| 확인 | KO | EN |
| --- | --- | --- |
| 입력값만 변경했을 때 quick event | 0 | 0 |
| `tool_quick_compare_view` | 1회 | 1회 |
| view `comparison_type` | `years` | `years` |
| monthly tab 전환 click | 1회 | 1회 |
| 같은 monthly tab 재클릭 후 증가 | 없음 | 없음 |
| years tab 복귀 click | 1회 | 1회 |

신규 이벤트에서 다음 파라미터를 확인했다.

- `source_tool=compound`
- `locale=ko|en`
- `currency=KRW|USD`
- `comparison_type=years|monthly`
- `location=result_quick_compare`

### 기존 이벤트 회귀

다음 이벤트 dispatch를 확인했다.

- `tool_calculate`
- `tool_result_cta_view`
- `tool_result_cta_click` (`copy_result_url`)
- `tool_hub_click` (`target_tool=goal`)
- `tool_nav_click` (`section=cta`)

기존 이벤트명 변경은 없다.

## 8. PDF export

390px KO에서 실제 PDF 다운로드를 실행했다.

| 확인 항목 | 결과 |
| --- | --- |
| 파일 다운로드 | PASS |
| 파일 크기 | 709,776 bytes |
| header `%PDF` | PASS |
| EOF marker `%%EOF` | PASS |
| export 중 모든 details open | PASS |
| export 후 details 상태 복원 | PASS |
| `fm-exporting` class 제거 | PASS |
| Quick Comparison이 `pdf-target` 내부 | PASS |
| export 시 Quick Comparison visible | PASS |
| 결과 CTA `display:none`, height 0 | PASS |
| 관련 계산기 CTA render rect 없음 | PASS |

PDF binary가 정상이고, html2canvas 캡처 시점의 DOM에서 Quick Comparison은 포함 상태, `compound-result-actions`와 그 안의 관련 계산기는 제외 상태임을 확인했다.

## 9. SEO 및 FAQ 회귀

| 항목 | KO | EN | 결과 |
| --- | --- | --- | --- |
| title | 기존 문구 | 기존 문구 | PASS |
| description | 기존 문구 | 기존 문구 | PASS |
| canonical | self | self | PASS |
| hreflang | KO/EN | KO/EN | PASS |
| noindex | 없음 | 없음 | PASS |
| 화면 FAQ | 24 | 8 | PASS |
| FAQPage JSON-LD | 1개 / 24 entities | 1개 / 8 entities | PASS |

canonical, hreflang, sitemap, robots, JSON-LD 정책은 수정하지 않았다.

## 10. CSS 영향 확인

runtime 코드에서 `fm-export-exclude`를 사용하는 곳은 `pages/tools/compound-interest.js`의 `CompoundResultActions` 1곳뿐이다.

`styles/globals.css` 규칙은 다음 두 조건이 동시에 맞을 때만 작동한다.

1. body에 `fm-exporting`이 있음
2. descendant에 `fm-export-exclude`가 있음

다른 페이지/component에는 해당 class가 없어 현재 영향은 복리 계산기 PDF export로 제한된다. 보고서와 verifier의 문자열 참조는 runtime 영향이 없다.

## 11. 발견 이슈

배포 차단 이슈는 없다.

비차단 관찰:

1. 계산기 recent preset은 locale 사이에 같은 localStorage key를 사용한다. 기존 KO/KRW preset이 있으면 EN 진입에서도 KRW가 복원될 수 있다. 저장 상태를 초기화한 EN fresh-session 검사에서는 요구된 USD preset이 정상 표시됐다. 이는 기존 persistence 동작이며 이번 Phase 2-1 변경 범위가 아니다.
2. 실제 GA4 DebugView 수신은 local `gtag` dispatch 검사와 별개이므로 배포 후 production에서 한 번 확인해야 한다.

## 12. 배포 가능 여부

**PASS - 배포 가능**

최종 판정 조건을 모두 만족했다.

- 기존 계산 결과 보존: PASS
- 기간/월 적립금 비교: PASS
- KRW/USD preset: PASS
- 모바일/데스크톱 overflow: PASS
- Quick Comparison → CTA → FAQ 순서: PASS
- PDF 및 CTA 제외: PASS
- GA4 신규/기존 이벤트: PASS
- SEO/FAQ: PASS
- build 및 diff check: PASS

## 13. Phase 2-2 착수 여부

**착수 가능**이다. 다만 월복리/연복리 직접 비교는 기존 월복리 결과를 그대로 보존하는 독립 계산 검증을 먼저 만들고, 납입 시점과 세금·수수료 적용 시점의 차이를 sample별 기대값으로 고정한 뒤 UI를 연결해야 한다.
