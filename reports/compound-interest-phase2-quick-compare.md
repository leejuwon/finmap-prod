# Finmap 복리 계산기 Phase 2-1 Quick Comparison 구현 보고서

- 작업일: 2026-07-07
- 대상: `/tools/compound-interest`, `/en/tools/compound-interest`
- 범위: 기간·월 적립금 Quick Comparison 결과 UI

## 1. 작업 목적

사용자가 한 번 계산한 수익률, 세금, 수수료, 물가상승률 조건을 유지한 채 투자 기간 또는 월 적립금만 바꿨을 때 결과가 어떻게 달라지는지 빠르게 비교할 수 있도록 했다. 월복리/연복리 비교와 복리 주기 선택은 포함하지 않았다.

## 2. 변경 파일

| 파일 | 변경 내용 |
| --- | --- |
| `_components/CompoundQuickComparePanel.js` | 기간·월 적립금 비교 계산, 반응형 표시, GA4 view/click 이벤트 |
| `pages/tools/compound-interest.js` | 결과 흐름에 패널 추가, CTA·관련 계산기를 고급 분석 앞으로 이동 |
| `styles/globals.css` | PDF export 중 결과 CTA 블록을 기존처럼 캡처 대상에서 제외 |
| `scripts/verify_compound_phase2_quick_compare.js` | Phase 2-1 계산·배치·SEO·FAQ 회귀 검증 |
| `reports/compound-interest-phase2-quick-compare.md` | 구현 및 검증 결과 |

`lib/compoundCore.js`와 `lib/compound.js`는 수정하지 않았다.

## 3. Quick Comparison 구성

패널 제목은 KO `빠른 비교`, EN `Quick Comparison`이다. 두 개의 segmented tab을 제공한다.

### 기간 비교

- 5년
- 10년
- 20년
- 30년

사용자가 입력한 원금과 월 적립금은 유지하고 `years`만 변경한다.

### 월 적립금 비교

- KRW: 월 10만원, 30만원, 50만원, 100만원
- USD: 월 $100, $300, $500, $1,000

사용자가 입력한 기간은 유지하고 `monthly`만 변경한다.

각 행은 세후 최종금액, 총 납입원금, 세후 수익, 물가 반영 현재가치를 표시한다. 현재 입력과 같은 preset에는 `현재 조건`/`Current` 표시를 붙인다.

모바일과 768px에서는 세로 카드형 목록, 1024px 이상에서는 표를 사용한다. 비교 유형을 전환해도 한 번에 4개 시나리오만 보여 정보 밀도를 제한했다.

## 4. 계산 기준

새 계산식을 만들지 않고 `lib/compound.js`의 `calcCompound`를 재사용한다.

공통 유지 값:

- 원금
- 연 수익률
- 적용 중인 세율
- 적용 중인 수수료율
- 물가상승률
- 통화
- base year
- 월복리
- 매월 말 납입

세금 또는 수수료 toggle이 OFF이면 기존 결과와 동일하게 effective rate `0`을 비교 계산에 전달한다. 연복리 계산, 적립금 증가율, 추가 납입, 변동 수익률은 추가하지 않았다.

## 5. 결과 화면 배치

### PRO mobile

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

두 분기는 동시에 렌더되지 않으므로 `ToolResultCta`는 런타임에 1개만 존재한다. CTA와 관련 계산기는 `data-html2canvas-ignore`와 `fm-export-exclude`를 사용해 기존처럼 결과 PDF 본문에서 제외한다.

## 6. GA4 이벤트

기존 이벤트명은 변경하지 않았다. 다음 두 이벤트를 추가했다.

| 이벤트 | 조건 | 파라미터 |
| --- | --- | --- |
| `tool_quick_compare_view` | 패널이 viewport에 50% 이상 최초 진입할 때 컴포넌트 마운트당 1회 | `source_tool=compound`, `locale`, `currency`, `comparison_type`, `location=result_quick_compare` |
| `tool_quick_compare_click` | 기간/월 적립금 tab을 실제로 전환할 때 | 동일 |

입력 변경과 재계산만으로 이벤트를 보내지 않는다. 기존 `tool_calculate`, `tool_result_cta_view`, `tool_result_cta_click`, `tool_hub_click`은 유지했다.

## 7. 계산 결과 보존

| 항목 | 결과 |
| --- | --- |
| 기본 조건 세후 최종금액 | `6,600.2만원` PASS |
| 세금/수수료 OFF | `7,202.2만원` PASS |
| `lib/compoundCore.js` 변경 | 없음 |
| `lib/compound.js` 변경 | 없음 |
| 월복리 기준 | 유지 |
| 세금/수수료 방식 | 유지 |

## 8. SEO 및 FAQ

다음 항목은 변경하지 않았다.

- KO/EN SEO title
- KO/EN SEO description
- canonical
- hreflang
- sitemap 정책
- robots/noindex
- FAQPage, HowTo, BreadcrumbList, SoftwareApplication JSON-LD

FAQ는 KO 24개, EN 8개를 유지하고 FAQPage JSON-LD도 1개다.

## 9. 검증 결과

| 검증 | 결과 |
| --- | --- |
| `node scripts\verify_compound_calculator.js` | PASS, 기존 A-D sample |
| `node scripts\verify_compound_phase1_seo_faq.js` | PASS |
| `node scripts\verify_compound_phase2_quick_compare.js` | PASS, 21개 항목 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `npm.cmd run build` | PASS, 214/214 pages |
| channel sitemap | main 204 / KO 106 / EN 98 / `/en` 98 |
| `git diff --check` | PASS, 공백 오류 없음 |

build가 재정렬한 sitemap 파일은 작업 범위 밖이므로 원래 tracked 상태로 복원했다.

## 10. 모바일 및 PDF 확인

production build를 로컬 서버와 headless Chrome으로 확인했다.

| viewport | 패널/행 | overflow | 순서 | 광고 겹침 | sticky CTA |
| ---: | --- | --- | --- | --- | --- |
| 320px | 기간 4개, 월 적립금 4개 PASS | 없음 | Quick → CTA → 고급 분석 → FAQ | 없음 | PASS |
| 390px | 기간 4개, 월 적립금 4개 PASS | 없음 | Quick → CTA → 고급 분석 → FAQ | 없음 | PASS |
| 768px | 기간 4개, 월 적립금 4개 PASS | 없음 | Quick → CTA → 상세 분석 → FAQ | 없음 | PASS |

320·390·768px 패널 screenshot을 직접 확인해 텍스트 잘림, 카드 겹침, 버튼 overflow가 없음을 확인했다.

390px에서 실제 PDF 다운로드를 실행했다.

- PDF 생성 및 `%PDF` header: PASS
- export 중 details open 후 원래 상태 복원: PASS
- `fm-exporting` class 제거: PASS
- 결과 CTA 블록 export 제외: PASS

## 11. 남은 이슈

- GA4 DebugView의 실제 production 수신은 배포 후 확인이 필요하다.
- USD 비교 문구와 금액 형식은 코드와 브라우저 레이아웃을 확인했지만 이번 모바일 자동화는 기본 KRW 조건으로 수행했다.
- 비교값은 고정 수익률 시뮬레이션이며 실제 수익률을 예측하거나 투자안을 추천하지 않는다.

## 12. Phase 2-2 후보

월복리/연복리 직접 비교 또는 복리 주기 선택은 별도 Phase로 진행한다. 기존 월복리 결과를 유지한 상태에서 연복리 공식, 월말 납입 시점, 세금·수수료 적용 시점, 샘플별 기대값을 먼저 독립 검증한 뒤 UI를 연결하는 순서가 적합하다.
