# Compound Interest Calculator Phase 1 Post-Deploy Production Check

- 확인 일자: 2026-06-30
- 확인 대상:
  - `https://www.finmaphub.com/tools/compound-interest`
  - `https://www.finmaphub.com/en/tools/compound-interest`
- 최종 판정: **HOLD - Phase 1 production 적용 완료 판정 보류**

이번 작업에서는 코드와 production 설정을 수정하지 않았다. 공개 HTTP 응답과 실제 production Chrome screenshot을 확인했으나, 필수 판정 항목 일부가 실행 환경 제한으로 완료되지 않아 `PASS - Phase 1 production 적용 완료`로 판정하지 않는다.

## 1. HTTP 상태

캐시 우회 요청에서 다음 production URL이 모두 HTTP 200을 반환했다.

| URL | 상태 | Content-Type | 판정 |
| --- | ---: | --- | --- |
| KO 계산기 | 200 | `text/html; charset=utf-8` | PASS |
| EN 계산기 | 200 | `text/html; charset=utf-8` | PASS |
| `/sitemap.xml` | 200 | `application/xml` | PASS |
| `/sitemap-0.xml` | 200 | `application/xml` | PASS |
| `/sitemap-ko.xml` | 200 | `application/xml` | PASS |
| `/sitemap-en.xml` | 200 | `application/xml` | PASS |
| `/en/sitemap.xml` | 200 | `application/xml` | PASS |

응답의 `x-vercel-cache`는 `DYNAMIC`이었다. KO HTML은 Phase 1 최종 title 문자열을, EN HTML은 `monthly compounding` 문자열을 포함했다.

## 2. 모바일 화면과 기본 계산

승인된 production Chrome 실행에서 320x720, 390x844, 768x1024 screenshot을 생성해 직접 확인했다.

| viewport | 입력 UI | 기본 결과 | horizontal overflow | sticky/result UI | 판정 |
| --- | --- | --- | --- | --- | --- |
| 320x720 | 기본 입력 4개와 계산 버튼이 경계 안에 표시 | `6,600.2만원` 표시 | 육안상 없음 | compact result와 sticky 4개 section nav 표시 | PASS |
| 390x844 | 기본 입력 4개와 계산 버튼이 경계 안에 표시 | `6,600.2만원` 표시 | 육안상 없음 | compact result와 sticky 4개 section nav 표시 | PASS |
| 768x1024 | 2-column 기본 입력과 접힌 option 3개 표시 | `6,600.2만원` 표시 | 육안상 없음 | full summary 표시 | PASS |

화면에서 확인한 공통 사항:

- 원금 `1,000`, 월 적립금 `30`, 연 수익률 `7`, 기간 `10`
- 계산 버튼 잘림 없음
- 320/390px compact 핵심 결과 표시
- 768px full summary 표시
- 결과 영역의 광고 slot이 별도 높이를 확보해 인접 UI를 덮지 않음

다음 항목은 production 브라우저 실행이 결과 JSON을 내보내기 전에 timeout되어 완료 근거를 확보하지 못했다.

- 세금/수수료 OFF 결과 `7,202.2만원`
- `applyTax=false`, `applyFee=false` preset 복원
- CTA와 FAQ의 실제 DOM/화면 순서
- 관련 계산기 goal -> dca -> cagr -> fire 순서

## 3. SEO head

| 항목 | 확인 결과 | 판정 |
| --- | --- | --- |
| KO HTML의 최종 title 문자열 | 포함 | PASS |
| EN HTML의 `monthly compounding` | 포함 | PASS |
| KO/EN URL 상호 참조 | 두 HTML 응답에 두 URL 문자열 존재 | PARTIAL |
| runtime canonical self | 결과 출력 전 timeout | 미확인 |
| runtime hreflang KO/EN | 결과 출력 전 timeout | 미확인 |
| runtime noindex 없음 | 결과 출력 전 timeout | 미확인 |
| EN `compound frequency` 미포함 | 결과 출력 전 timeout | 미확인 |

검색 수집기 출력은 KO/EN에서 이전 본문 heading을 page title처럼 표시했지만, 캐시 우회 원문 HTML에는 Phase 1 최종 head 문자열이 포함됐다. 정확한 runtime `document.title`, canonical, hreflang, robots 결과가 확보되지 않았으므로 head 전체 PASS로 판정하지 않는다.

## 4. FAQ 및 JSON-LD

KO 24개, EN 8개, FAQPage JSON-LD 1개와 `mainEntity` 일치 여부는 production browser 결과가 timeout 전에 출력되지 않아 **미확인**이다.

## 5. GA4 DebugView

GA4 DebugView에는 인증된 속성 접근 정보가 없어 직접 접속하지 못했다. production Chrome에서 `gtag` 호출과 GA4 collect 요청을 수집하도록 실행했으나, 브라우저 timeout으로 수집 결과가 출력되지 않았다.

따라서 다음 production 수신 여부는 **미확인**이다.

- `tool_calculate`
- `tool_result_cta_view`
- `tool_result_cta_click`
- `tool_hub_click`
- `tool_nav_click`
- `tool_result_cta_view` 중복 여부

로컬 pre-deploy smoke에서 이벤트 dispatch가 PASS한 사실은 production DebugView 수신을 대체하지 않는다.

## 6. AdSense layout shift

320/390px 결과 screenshot에서 광고 slot은 독립된 빈 공간을 확보했고 sticky navigation이나 결과 metric을 덮지 않았다. 768px 결과 screenshot에서도 광고 영역과 상세 결과가 겹치지 않았다.

- 치명적 overlap: screenshot에서 관찰되지 않음
- 정량 CLS: production 실행 결과 출력 전 timeout으로 미확인
- 실제 광고 fill: headless session에서 확인하지 못함

판정은 **PARTIAL PASS**다. 실제 광고가 채워진 production 세션의 CLS를 추가 확인해야 한다.

## 7. PDF

production 실행은 PDF 다운로드 디렉터리를 만들었으나 PDF 버튼 동작 구간에서 DevTools protocol timeout이 발생했다. PDF 파일은 생성되지 않았으므로 다음 항목은 **미확인**이다.

- production PDF 다운로드 성공
- PDF 열기
- export 중 compact/advanced details open
- export 후 details 상태 복원
- `fm-exporting` class 제거

로컬 pre-deploy PDF PASS는 production 확인을 대체하지 않는다.

## 8. Sitemap

| sitemap | HTTP | 응답 내 KO URL | 응답 내 EN URL | 판정 |
| --- | ---: | --- | --- | --- |
| `/sitemap.xml` | 200 | sitemap index이므로 직접 없음 | sitemap index이므로 직접 없음 | PASS |
| `/sitemap-0.xml` | 200 | 존재 | 존재 | PASS |
| `/sitemap-ko.xml` | 200 | 존재 | alternate 포함 | PARTIAL PASS |
| `/sitemap-en.xml` | 200 | alternate 포함 | 존재 | PARTIAL PASS |
| `/en/sitemap.xml` | 200 | alternate 포함 | 존재 | PARTIAL PASS |

원격 XML에서 대상 URL 문자열 존재는 확인했다. 다만 재실행 차단으로 channel sitemap의 정확한 `<loc>` 역할과 `/en/sitemap.xml` 전체 EN-prefix 조건을 다시 파싱하지 못했으므로 channel membership 전체 PASS로 과장하지 않는다.

## 9. 실행 이슈

1. 첫 production Chrome 통합 검사는 320/390/768 input/result screenshot을 생성한 뒤 `ProtocolError: Runtime.callFunctionOn timed out`로 종료됐다.
2. 핵심 UI와 GA/AdSense를 분리한 재실행은 외부 네트워크 실행 승인 사용 한도 때문에 실행 전에 거절됐다.
3. 거절 이후 동일 production 자동화를 우회 실행하지 않았다.

이 이슈는 현재까지 확인된 production 제품 장애가 아니라 검증 실행 환경의 제한이다. 그러나 최종 판정 필수 항목을 확인하지 못했으므로 결과는 HOLD다.

## 10. 발견 이슈

- 제품 결함으로 확정된 이슈: 없음
- 검증 차단 이슈: production GA4 DebugView/collect, OFF preset, CTA/FAQ 순서, 관련 계산기 순서, PDF, 정량 CLS 미완료
- 임시 screenshot 경로: 시스템 temp의 `finmap-compound-postdeploy-fIsoH9` 디렉터리

## 11. 최종 판정

**HOLD - Phase 1 production 적용 완료 판정 보류**

HTTP 200, 세 viewport의 기본 입력/결과, 기본 `6,600.2만원`, Phase 1 head 문자열, sitemap HTTP 응답은 확인됐다. 하지만 사용자 지정 PASS 기준 중 GA4 주요 이벤트 수신, PDF, canonical/hreflang 전체, FAQ/JSON-LD, OFF preset, CTA/FAQ 순서를 완료하지 못했다.

재확인이 필요한 최소 항목:

1. production URL에서 세금/수수료 OFF 및 query preset 복원
2. 결과 하단 CTA/FAQ와 관련 계산기 순서
3. runtime canonical/hreflang/noindex와 FAQPage 개수
4. GA4 DebugView의 5개 이벤트 및 view 중복 여부
5. production PDF 다운로드/열기와 export 상태 복원
6. 실제 광고 fill 상태의 CLS
7. channel sitemap `<loc>` 및 `/en/sitemap.xml` EN-prefix 조건
