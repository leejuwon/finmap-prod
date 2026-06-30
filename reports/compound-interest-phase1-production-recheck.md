# Compound Interest Calculator Phase 1 Production Recheck

- 확인 일자: 2026-06-30
- 대상:
  - `https://www.finmaphub.com/tools/compound-interest`
  - `https://www.finmaphub.com/en/tools/compound-interest`
- 작업 범위: 기존 production HOLD 항목의 분할 재검증
- 코드 변경: 없음
- 최종 판정: **PASS - Phase 1 production 적용 완료**

## 1. 기존 HOLD 사유

이전 post-deploy 검사는 다음 항목을 확인했다.

- KO/EN 및 sitemap HTTP 200
- 320/390/768px 기본 화면
- 기본 계산 결과 `6,600.2만원`
- screenshot 기준 치명적 광고 overlap 없음
- `git diff --check` PASS

하지만 긴 production browser 세션이 timeout되어 다음 항목이 미확인으로 남았다.

- GA4 DebugView/collect
- production PDF 다운로드
- 세금/수수료 OFF preset 복원
- CTA/FAQ와 관련 계산기 순서
- FAQ/canonical/hreflang 전체 검사
- channel sitemap의 정확한 `<loc>` 역할

이번 재검증은 정적 HTTP, interaction, PDF, GA4/AdSense를 각각 독립 실행해 위 HOLD 사유를 해소했다.

## 2. Static SEO/FAQ/Sitemap Recheck

브라우저 없이 production HTML과 XML을 직접 fetch하고 구조를 파싱했다.

### KO HTML

| 항목 | production 결과 | 판정 |
| --- | --- | --- |
| HTTP | 200 | PASS |
| title | `복리 계산기 \| 월복리·적립식 투자 미래가치 계산 \| FinMap` | PASS |
| description | `월복리 기준` 포함 | PASS |
| canonical | `https://www.finmaphub.com/tools/compound-interest` | PASS |
| hreflang ko | KO self | PASS |
| hreflang en | EN alternate | PASS |
| robots / X-Robots-Tag | `noindex` 없음 | PASS |
| FAQPage JSON-LD | 1개 | PASS |
| FAQ mainEntity | 24개 | PASS |

### EN HTML

| 항목 | production 결과 | 판정 |
| --- | --- | --- |
| HTTP | 200 | PASS |
| title | `Compound Interest Calculator: Future Value, Monthly Contributions & Taxes \| FinMap` | PASS |
| description | `monthly compounding` 포함 | PASS |
| description | `compound frequency` 없음 | PASS |
| canonical | `https://www.finmaphub.com/en/tools/compound-interest` | PASS |
| hreflang en | EN self | PASS |
| hreflang ko | KO alternate | PASS |
| robots / X-Robots-Tag | `noindex` 없음 | PASS |
| FAQPage JSON-LD | 1개 | PASS |
| FAQ mainEntity | 8개 | PASS |

### Sitemap `<loc>` 역할

| sitemap | `<loc>` 수 | KO 계산기 | EN 계산기 | 판정 |
| --- | ---: | --- | --- | --- |
| `/sitemap-0.xml` | 204 | `<loc>` | `<loc>` | PASS |
| `/sitemap-ko.xml` | 106 | `<loc>` | alternate만 존재 | PASS |
| `/sitemap-en.xml` | 98 | alternate만 존재 | `<loc>` | PASS |
| `/en/sitemap.xml` | 98 | alternate만 존재 | `<loc>` | PASS |

`/en/sitemap.xml`의 98개 `<loc>`는 모두 `/en` 또는 `/en/` prefix를 사용했다. channel sitemap에서 반대 언어 URL은 `<loc>`가 아니라 hreflang alternate로만 존재하는 것을 구분해 확인했다.

정적 재검증 결과: **PASS**

## 3. Browser Interaction Recheck

390x844 viewport 한 개만 사용하고 기본 계산, OFF 계산, query 복원, 결과 DOM 순서를 작은 probe로 분리했다.

### 기본 및 OFF 계산

| 항목 | 결과 | 판정 |
| --- | --- | --- |
| production HTTP | 200 | PASS |
| 기본 계산 | `6,600.2만원` | PASS |
| 세금 checkbox OFF | `false` | PASS |
| 수수료 checkbox OFF | `false` | PASS |
| OFF 계산 | `7,202.2만원` | PASS |
| URL | `applyTax=false`, `applyFee=false` 포함 | PASS |
| rate 보존 | `15.4`, `0.5` | PASS |
| horizontal overflow | 없음 | PASS |

확인된 OFF URL:

`https://www.finmaphub.com/tools/compound-interest?principal=1000&monthly=30&annualRate=7&years=10&compounding=monthly&taxRatePercent=15.4&feeRatePercent=0.5&applyTax=false&applyFee=false&inflationRate=0&currency=KRW`

### 새 페이지 preset 복원과 결과 순서

위 URL을 새 390px 페이지에 직접 로드했다.

- tax OFF, fee OFF 복원
- tax rate `15.4`, fee rate `0.5` 보존
- 재계산 결과 `7,202.2만원`
- `ToolResultCta`: 1개
- CTA top: `2,662px`
- FAQ top: `4,281px`
- CTA가 DOM 순서와 화면 top 모두 FAQ보다 앞
- 관련 계산기 순서:
  1. `/tools/goal-simulator`
  2. `/tools/dca-calculator`
  3. `/tools/cagr-calculator`
  4. `/tools/fire-calculator`
- horizontal overflow 없음

Browser interaction 재검증 결과: **PASS**

## 4. Production PDF Recheck

다른 검증과 분리한 production KO 390px 세션에서 기본 계산 직후 PDF 버튼만 실행했다.

| 항목 | 결과 | 판정 |
| --- | --- | --- |
| HTTP | 200 | PASS |
| 다운로드 파일 | `compound-result.pdf` | PASS |
| 파일 크기 | 641,404 bytes | PASS |
| PDF header | `%PDF-1.3` | PASS |
| EOF marker | `%%EOF` 확인 | PASS |
| page object | 12개 | PASS |
| export 전 details | compact/advanced 모두 닫힘 | PASS |
| export 중 details | compact/advanced 모두 열림 | PASS |
| export 후 details | 모두 원래 닫힘으로 복원 | PASS |
| `fm-exporting` | export 후 제거 | PASS |

파일은 구조 검증 후 시스템 임시 디렉터리에서 삭제했다.

Production PDF 재검증 결과: **PASS**

## 5. GA4 and AdSense Recheck

### 5.1 Production GA4 dispatch

광고 요청을 차단한 production 390px 세션에서 `window.gtag` 호출을 원래 함수에 전달하면서 동시에 기록했다.

| 이벤트 | 주요 파라미터 | 판정 |
| --- | --- | --- |
| `tool_calculate` | `source_tool=compound`, `has_tax=true`, `has_fee=true`, `has_inflation=false`, `location=form_submit` | PASS |
| `tool_result_cta_view` | `source_tool=compound`, `location=result_after` | PASS |
| `tool_result_cta_click` | `action=copy_result_url`, `location=result_after` | PASS |
| `tool_hub_click` | `target_tool=goal`, `location=result_cta` | PASS |
| `tool_nav_click` | `section=cta`, `location=sticky_cta` | PASS |

`tool_result_cta_view`는 계산 결과 mount에서 정확히 1회 발생했다.

### 5.2 Production collect와 DebugView

- production dispatch: PASS
- headless session의 GA4 collect 요청: 관찰되지 않음
- GA4 DebugView: 인증 속성 접근이 없어 자동 확인 불가

collect 부재는 consent, headless 환경 또는 전송 시점의 영향을 받을 수 있으므로 제품 FAIL로 판정하지 않는다. 작업 지시의 최종 기준에 따라 production dispatch가 확인됐으므로 HOLD 해소에 충분한 자동 근거로 사용한다.

### 5.3 AdSense와 layout shift

광고 요청을 허용한 별도 production 세션에서 5초 동안 측정했다.

| viewport | HTTP | 광고 요청 | `ins.adsbygoogle` | 광고 iframe | CLS | overflow | 판정 |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 320x720 | 200 | 8 | 2 | 3 | 0 | 없음 | PASS |
| 390x844 | 200 | 8 | 2 | 3 | 0 | 없음 | PASS |

이전 production screenshot에서도 광고 영역이 결과 metric과 sticky CTA를 덮지 않았다. 실제 광고 creative fill의 체감과 Safari/일반 Chrome 장기 CLS는 수동 확인 항목으로 남긴다.

GA4/AdSense 자동 재검증 결과: **PASS**, 일부 수동 확인 필요

## 6. HOLD 해소 여부

| 기존 HOLD 항목 | 재검증 결과 |
| --- | --- |
| canonical/hreflang/noindex | PASS |
| KO FAQ 24 / EN FAQ 8 / FAQPage 1개 | PASS |
| channel sitemap `<loc>` | PASS |
| 세금/수수료 OFF와 query 복원 | PASS |
| CTA/FAQ 순서와 ToolResultCta 1개 | PASS |
| 관련 계산기 goal -> dca -> cagr -> fire | PASS |
| production PDF | PASS |
| GA4 주요 이벤트 | production dispatch PASS, collect/DebugView 수동 확인 |
| AdSense layout | 자동 CLS/overflow PASS, 실제 fill 수동 확인 |

자동 검증 가능한 필수 항목은 모두 PASS했다. GA4 DebugView와 실제 광고 fill은 작업 지시에 따라 별도 수동 항목으로 남기며, 이 두 항목만으로 production 적용 완료를 HOLD하지 않는다.

## 7. 최종 판정

**PASS - Phase 1 production 적용 완료**

판정 근거:

1. KO/EN HTTP 200
2. KO/EN canonical, hreflang, noindex 정상
3. KO FAQ 24개, EN FAQ 8개, FAQPage JSON-LD 각 1개
4. 기본 및 OFF 계산, query preset 복원 PASS
5. CTA가 FAQ보다 앞이고 `ToolResultCta` 1개
6. 관련 계산기 goal -> dca -> cagr -> fire
7. production PDF 다운로드 및 구조/상태 복원 PASS
8. sitemap `<loc>` 역할과 EN prefix PASS
9. production GA4 필수 이벤트 dispatch PASS
10. AdSense 자동 CLS/overflow PASS
11. 코드 변경 없음
12. `git diff --check` PASS

## 8. 사용자가 직접 확인할 항목

### GA4 DebugView

1. production KO 계산기에서 기본 계산을 실행한다.
2. 결과 URL 복사를 클릭한다.
3. 관련 계산기 goal을 클릭한다.
4. sticky CTA를 클릭한다.
5. GA4 DebugView에서 다음 이벤트를 확인한다.
   - `tool_calculate`
   - `tool_result_cta_view`
   - `tool_result_cta_click`
   - `tool_hub_click`
   - `tool_nav_click`
6. `tool_result_cta_view`가 결과 표시당 중복되지 않는지 확인한다.

### AdSense 실제 fill

1. 모바일 Chrome과 Safari에서 실제 광고 creative가 채워진 상태를 확인한다.
2. 광고가 결과 metric, CTA, sticky navigation을 덮지 않는지 확인한다.
3. 스크롤 중 체감 layout shift가 없는지 확인한다.
