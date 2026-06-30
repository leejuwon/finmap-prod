# Finmap Compound Interest Calculator Phase 1 Final Audit

- 감사일: 2026-06-30
- 대상: `/tools/compound-interest`, `/en/tools/compound-interest`
- 범위: Phase 1-1 ~ Phase 1-4 통합 회귀 검증 및 Phase 2 준비
- 최종 판정: **PASS - 배포 후보 상태**

이번 감사에서는 신규 기능이나 문구를 추가하지 않았다. 기존 Phase 1 변경을 대상으로 계산, 입력/결과 UX, SEO/FAQ, GA4 이벤트, PDF export, KO/EN 채널 정책을 다시 검증했으며 이 보고서만 새로 생성했다.

## 1. Phase 1 전체 요약

Phase 1은 계산 공식을 유지한 채 모바일 입력과 결과 탐색 비용을 줄이고, 실제 월복리 계산 기준에 맞게 SEO 문구와 FAQ를 정리한 작업이다.

| 영역 | Phase 1 전 | Phase 1 완료 후 | 최종 감사 |
| --- | --- | --- | --- |
| 모바일 입력 | 입력 카드와 계산 버튼이 본문 하단에 위치 | 기본 입력 4개를 먼저 노출하고 세부 옵션 접음 | PASS |
| 모바일 결과 | 긴 full summary와 FAQ 뒤 CTA | compact summary 4개, CTA를 FAQ 앞으로 이동 | PASS |
| 계산 기준 안내 | 연복리 표현이 실제 월복리 계산과 혼재 | 월복리 기준을 명시하고 연복리는 개념 설명으로 분리 | PASS |
| FAQ | KO 9개 / EN 5개 | KO 24개 / EN 8개 | 화면과 JSON-LD 동일, PASS |
| 계산 로직 | 기준 A-D 샘플 | 계산 라이브러리 변경 없음 | A-D 전체 PASS |
| SEO 채널 | KO/EN self canonical 및 상호 hreflang | 정책 변경 없음 | PASS |

## 2. 단계별 결과

### Phase 1-1 현황 감사

- 모바일 390x844에서 입력 카드 top `1,817px`, 계산 버튼 top `2,873px`로 초기 행동까지 거리가 길었다.
- 결과 summary 높이는 `1,465px`였고, CTA top은 `6,248px`, FAQ top은 `5,568px`였다.
- 계산 로직, 현재 월복리 기준, GA4 이벤트, SEO 채널 구조를 변경 전 기준선으로 기록했다.
- 보고서: `reports/compound-interest-phase1-audit.md`

### Phase 1-2 입력 UX

- 원금, 월 적립금, 연 수익률, 투자 기간을 첫 화면의 기본 입력 4개로 배치했다.
- 프리셋, 비용/물가 옵션, 고급 옵션은 기본 닫힘 상태의 `details`로 구성했다.
- 세금과 수수료 checkbox는 기본 ON이며, OFF일 때 rate 입력만 비활성화하고 `15.4`, `0.5` 값을 보존한다.
- URL에 `applyTax`, `applyFee`를 저장하고 재로드 후 상태와 rate를 복원한다.
- 보고서: `reports/compound-interest-phase1-input-ux.md`

### Phase 1-3 결과 UX

- 모바일 PRO mode에서 세후 최종금액, 총 납입원금, 세후 수익, 물가 반영 현재가치 4개를 먼저 표시한다.
- 상세 지표 7개와 계산 가정은 `세부 지표 더 보기` 안에 유지한다.
- `ToolResultCta`를 FAQ 앞으로 옮기고 중복 렌더링 없이 1개만 유지했다.
- 관련 계산기 순서를 goal, dca, cagr, fire로 정리했다.
- sticky CTA 이동과 PDF export의 `details` open/restore 동작을 유지했다.
- 보고서: `reports/compound-interest-phase1-result-ux.md`

### Phase 1-4 SEO/FAQ

- KO title에서 실제 계산에 없는 `연복리` 표현을 제거하고 월복리/적립식 intent를 유지했다.
- KO/EN description을 현재 입력과 월복리 계산 기준에 맞게 정리했다.
- 본문에서는 연복리를 개념 설명으로만 다루고 현재 계산 결과가 월복리 기준임을 분리했다.
- KO FAQ를 24개, EN FAQ를 8개로 확장하고 화면과 FAQPage JSON-LD가 같은 `faqItems`를 사용하도록 유지했다.
- 보고서: `reports/compound-interest-phase1-faq-seo.md`

네 단계 보고서가 모두 존재하는 것을 확인했다.

## 3. 변경 파일 목록

Phase 1 구현 및 검증 파일:

| 파일 | 역할 |
| --- | --- |
| `pages/tools/compound-interest.js` | 모바일 결과 흐름, CTA 순서, SEO 문구, FAQ, URL toggle 상태 연결 |
| `_components/CompoundForm.js` | 기본 입력 우선 배치, 세부 옵션 접기, 세금/수수료 toggle |
| `_components/CompoundDetailSummary.js` | 모바일 compact summary와 상세 지표 접기 |
| `scripts/verify_compound_phase1_seo_faq.js` | Phase 1 SEO/FAQ 정적 회귀 검사 |
| `reports/compound-interest-phase1-audit.md` | Phase 1-1 기준선 |
| `reports/compound-interest-phase1-input-ux.md` | Phase 1-2 결과 |
| `reports/compound-interest-phase1-result-ux.md` | Phase 1-3 결과 |
| `reports/compound-interest-phase1-faq-seo.md` | Phase 1-4 결과 |
| `reports/compound-interest-phase1-final-audit.md` | 이번 통합 감사 |

`lib/compoundCore.js`와 `lib/compound.js`는 `HEAD` 대비 변경이 없었다. `package.json`, canonical/hreflang/sitemap/robots 구성, AdSense 코드도 Phase 1 변경 파일에 포함되지 않았다.

## 4. 입력 UX 전후 수치

390x844 실측:

| 항목 | Phase 1-1 | Phase 1 완료 | 변화 |
| --- | ---: | ---: | ---: |
| 입력 카드 top | 1,817px | 521px | 1,296px 상향 |
| 계산 버튼 top | 2,873px | 950px | 1,923px 상향 |
| 초기 노출 입력 | 긴 전체 옵션 흐름 | 원금/월 적립금/연 수익률/기간 | 기본 행동 우선 |
| 세부 option | 펼쳐진 흐름 | 3개 `details` 기본 닫힘 | 탐색 부담 감소 |

최종 런타임 감사 결과:

- 기본 입력 순서: `principal`, `monthly`, `annualRate`, `years`
- 세금/수수료: 기본 ON, rate `15.4%` / `0.5%`
- 두 toggle OFF: rate 값 유지, rate input disabled
- OFF 계산 결과: `7,202.2만원`
- URL: `applyTax=false`, `applyFee=false` 포함
- 재로드: OFF 상태, rate 값, `7,202.2만원` 결과 복원
- 다시 ON: 기본 결과 `6,600.2만원` 복원

## 5. 결과 UX 전후 수치

390x844 실측:

| 항목 | Phase 1-1 | Phase 1 완료 | 변화 |
| --- | ---: | ---: | ---: |
| summary 높이 | 1,465px | 235px | 1,230px 감소 |
| CTA top | 6,248px | 2,639px | 3,609px 상향 |
| FAQ top | 5,568px | 4,258px | CTA가 FAQ 앞으로 이동 |

최종 런타임 감사에서 compact metric 4개, 접힌 상세 지표, `ToolResultCta` 1개를 확인했다. CTA top `2,639px`는 FAQ top `4,258px`보다 앞이다. 관련 계산기 순서는 다음과 같다.

1. `/tools/goal-simulator`
2. `/tools/dca-calculator`
3. `/tools/cagr-calculator`
4. `/tools/fire-calculator`

sticky navigation은 버튼 4개를 유지했고 `CTA` 클릭 후 CTA viewport top은 `90px`였다. 390px에서 horizontal overflow는 없었다.

PDF export 전에는 compact/advanced `details`가 모두 닫혀 있었고, export 중에는 두 영역이 모두 열렸으며 완료 후 원래 닫힘 상태로 복원됐다. `fm-exporting` class도 완료 후 제거됐다.

잔여 설계 사항: 768px 이상 basic layout은 상세 분석과 PDF 범위를 보존하기 위해 CTA가 full advanced analysis 뒤, FAQ 앞에 있다. 모바일처럼 chart 직후로 옮기는 작업은 Phase 1 범위가 아니다.

## 6. SEO title/description 전후

### KO

| 항목 | 변경 전 | 변경 후 |
| --- | --- | --- |
| title | `복리 계산기 \| 월복리·연복리·적립식 투자 미래가치 계산` | `복리 계산기 \| 월복리·적립식 투자 미래가치 계산` |
| description | `복리 계산기로 원금, 월 적립금, 연 수익률, 기간, 세금, 수수료, 물가상승률을 반영해 월복리·적립식 투자 미래가치와 현재가치를 계산합니다.` | `원금, 월 적립금, 연 수익률, 투자 기간으로 월복리 기준 미래가치를 계산합니다. 세금, 수수료, 물가상승률을 반영한 세후 금액과 현재가치를 표와 차트로 확인하세요.` |

실제 head title은 공통 suffix를 포함해 `복리 계산기 | 월복리·적립식 투자 미래가치 계산 | FinMap`으로 출력됐다.

### EN

| 항목 | 변경 전 | 변경 후 |
| --- | --- | --- |
| title | `Compound Interest Calculator: Future Value, Monthly Contributions & Taxes` | 변경 없음 |
| description | `Calculate future value with principal, monthly or lump-sum contributions, compound frequency, taxes, fees, inflation, charts, and year-by-year tables.` | `Calculate future value with principal, monthly contributions, annual return and years using monthly compounding. Review taxes, fees, inflation, charts and year-by-year tables.` |

실제 head title은 공통 suffix를 포함해 `Compound Interest Calculator: Future Value, Monthly Contributions & Taxes | FinMap`으로 출력됐다.

## 7. FAQ 수량과 일치성

| 언어 | 변경 전 | 변경 후 | 화면 표시 | FAQPage JSON-LD |
| --- | ---: | ---: | ---: | ---: |
| KO | 9 | 24 | 24 | 24 |
| EN | 5 | 8 | 8 | 8 |

- FAQPage JSON-LD는 언어별 1개다.
- 화면 FAQ와 JSON-LD는 같은 `faqItems`를 사용한다.
- H1은 KO/EN 각각 1개다.
- 결과 표시 전후 FAQ container는 중복되지 않는다.

## 8. 계산 결과 보존

- `lib/compoundCore.js`: 변경 없음
- `lib/compound.js`: 변경 없음
- 기본 조건: 원금 1,000만원, 월 적립금 30만원, 연 7%, 10년, 세금 15.4%, 수수료 0.5%, 물가 0%
- 기본 세후 최종금액: `6,600.2만원` 유지

`node scripts\verify_compound_calculator.js` 재실행 결과:

| 샘플 | 세후 최종금액 | 현재가치 | 결과 |
| --- | ---: | ---: | --- |
| A | 63,054,779 | 51,726,881 | PASS |
| B | 233,557,967 | 142,533,641 | PASS |
| C | 70,000,000 | - | PASS |
| D | 40,929,708 | - | PASS |

## 9. GA4 이벤트

기존 이벤트명은 변경하지 않았다.

- `tool_calculate`
- `tool_result_action`
- `tool_result_cta_view`
- `tool_result_cta_click`
- `tool_hub_click`
- `tool_nav_click`
- `tool_backlink_action`

390px 런타임 재검증:

| 이벤트 | 확인값 | 결과 |
| --- | --- | --- |
| `tool_calculate` | `source_tool=compound`, `has_tax=true`, `has_fee=true`, `has_inflation=false`, `location=form_submit` | PASS |
| `tool_result_cta_view` | `location=result_after`, 1회 | PASS |
| `tool_result_cta_click` | `action=copy_result_url`, `location=result_after` | PASS |
| `tool_hub_click` | `target_tool=goal`, `location=result_cta` | PASS |
| `tool_nav_click` | `section=cta`, `location=sticky_cta` | PASS |

첫 통합 브라우저 프로브는 페이지 초기화가 사전 주입한 `window.gtag` 스텁을 덮어써 이벤트 배열만 비어 있었다. 같은 빌드에서 앱 로드 후 스텁을 주입하는 이벤트 전용 프로브로 재실행했고 위 이벤트와 파라미터가 모두 PASS했다. DOM, 계산, PDF, SEO 검사는 첫 프로브에서도 통과했다.

## 10. SEO 채널 정책

SEO 정책 변경 없음:

- KO canonical: `https://www.finmaphub.com/tools/compound-interest`
- EN canonical: `https://www.finmaphub.com/en/tools/compound-interest`
- hreflang: KO/EN 상호 alternate 유지
- robots/noindex: 변경 없음
- sitemap source: main 204 URL
- channel sitemap: KO 106 URL / EN 98 URL
- `public/en/sitemap.xml`: EN 98 URL, EN prefix 전용, `sitemap-en.xml`과 일치
- KO/EN 계산기 URL 모두 해당 채널 sitemap에 포함

빌드와 verifier가 재생성한 sitemap 및 기존 검사 보고서는 검증 후 원복했다. 이번 감사로 추적 sitemap 파일의 내용 변경을 남기지 않았다.

## 11. 검증 명령 결과

| 명령/확인 | 결과 |
| --- | --- |
| `git diff --quiet HEAD -- lib\compoundCore.js lib\compound.js` | PASS, 계산 라이브러리 변경 없음 |
| `node scripts\verify_compound_calculator.js` | PASS, A-D 전체 통과 |
| `node scripts\verify_compound_phase1_seo_faq.js` | PASS |
| `npm.cmd run build` | PASS, 214개 static page 생성 |
| postbuild `next-sitemap` / channel sitemap | PASS, main 204 / KO 106 / EN 98 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| 390x844 DOM/계산/toggle/PDF/SEO 통합 프로브 | PASS |
| GA4 이벤트 전용 런타임 프로브 | PASS |
| `git diff --check` | 최종 실행 결과: PASS |

## 12. 배포 전 수동 확인

1. KO/EN 계산기 페이지가 production build에서 정상 로드되는지 확인한다.
2. 320px, 390px, 768px에서 입력, 결과, sticky bar, FAQ가 겹치지 않는지 확인한다.
3. 세금/수수료 OFF 후 URL 복사와 새 탭 재로드에서 상태가 복원되는지 확인한다.
4. 기본 결과 `6,600.2만원`과 toggle OFF 결과 `7,202.2만원`을 확인한다.
5. CTA copy, 관련 계산기, sticky CTA 이동을 확인한다.
6. 실제 PDF 파일이 다운로드되고 열리는지 확인한다.
7. KO 24개, EN 8개 FAQ accordion과 중복 container 유무를 확인한다.
8. page source에서 title, description, canonical, KO/EN hreflang을 확인한다.
9. 배포 산출물의 main/KO/EN URL-prefix sitemap 포함 여부를 확인한다.
10. 실제 AdSense 환경에서 결과와 CTA의 layout shift가 없는지 확인한다.

## 13. 배포 후 확인과 KPI

### GA4

- `tool_calculate` 발생 세션 / 계산기 세션: 초기 관찰 목표 `60% 이상`
- `tool_result_cta_click` / `tool_result_cta_view`: 초기 관찰 목표 `12% 이상`
- goal/dca/cagr/fire 관련 계산기 클릭 분포
- PDF/lead download conversion: 초기 관찰 목표 `2% 이상`
- `has_tax`, `has_fee`, `has_inflation`, locale, currency별 사용 분포
- `tool_result_cta_view` 또는 click의 비정상 중복 여부

### Google Search Console

- `/tools/compound-interest`, `/en/tools/compound-interest`의 impressions, clicks, CTR, average position
- KO `복리 계산기`, `월복리`, `적립식` 계열 query 변화
- EN `compound interest calculator`, `monthly contributions`, `monthly compounding` query 변화
- title/description 변경 뒤 CTR과 query mix를 최소 2~4주 단위로 비교

### Naver Search Advisor

- KO URL index 상태와 최근 수집일
- `복리 계산기`, `월복리 계산기`, `적립식 계산기` 계열 유입 query
- robots, canonical, sitemap 수집 오류와 crawl 이상 유무

로컬 감사는 실제 production GA4 DebugView, GSC/Naver index 반영, 광고 로딩 영향을 검증할 수 없다. 배포 직후 production smoke test가 필요하다.

## 14. Phase 2 우선순위

### P0

1. 검증된 공식과 별도 테스트를 전제로 월복리/연복리 직접 비교 또는 복리 주기 선택 기능
2. 기간 quick comparison: 5년, 10년, 20년, 30년
3. 월 적립금 quick comparison: 10만원, 30만원, 50만원, 100만원

연복리 직접 비교는 현재 계산 기준과 SEO 문구를 다시 바꾸므로 UI보다 계산식, 세금/수수료 적용 순서, 회귀 fixture를 먼저 확정해야 한다.

### P1

1. 월 적립금 연간 증가율
2. 일시 추가 납입
3. 하락장 또는 변동 수익률 시나리오
4. production GA4 데이터 기반 CTA 위치 재조정

### P2

1. 실제 검색 유입 query 기반 FAQ 순서 재조정
2. 복리 계산기 전용 콘텐츠 클러스터
3. PDF 결과 리포트 디자인 개선
4. 저장/공유 결과 persistence 강화

FAQ 확대나 메타 문구 정리가 검색 성과 개선을 보장하지는 않는다. Phase 2의 SEO 작업은 배포 후 query와 CTR 데이터를 근거로 결정하는 것이 적절하다.
