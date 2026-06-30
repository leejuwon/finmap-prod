# 복리 계산기 Phase 1-1 현황 감사

- 감사일: 2026-06-29
- 대상: `/tools/compound-interest`, `/en/tools/compound-interest`
- 범위: 구조, 입력 UX, 결과, 표/차트, FAQ, 내부 링크, GA4, SEO, 모바일 흐름, 빌드 가능 여부
- 결론: 계산 코어와 SEO 채널 구조는 안정적이다. Phase 1의 가장 큰 성장 병목은 계산식이 아니라 **입력 폼까지의 거리, 결과 요약의 모바일 밀도, 결과 CTA 위치**다.
- 변경 정책: 이 보고서 외 코드, 콘텐츠, 계산식, canonical, hreflang, sitemap, robots, AdSense, 의존성은 수정하지 않았다.

## 1. 핵심 판정

| 영역 | 상태 | 판정 |
| --- | --- | --- |
| 계산 로직 | 월복리 고정 코어와 A-D 샘플 검증 존재 | PASS |
| 기본 입력 | 원금, 월 적립금, 수익률, 기간 존재 | PASS |
| 비용/물가 입력 | 세율, 수수료율, 물가상승률 존재 | PASS, 다만 반영 여부 UX 없음 |
| 결과 | 세후 금액, 원금, 수익, 세금, 수수료 영향, 현재가치, 표/차트 제공 | PASS |
| FAQ | KO 9개, EN 5개, 화면과 FAQPage가 같은 배열 사용 | PASS |
| SEO | self canonical, KO/EN hreflang, sitemap 포함, noindex 없음 | PASS |
| SEO 문구 정합성 | 월복리 고정인데 KO title에 `연복리` 포함 | 개선 필요 |
| GA4 | 계산, 결과 CTA, sticky navigation, 공유/인용 이벤트 존재 | PASS, 파라미터 보강 필요 |
| 모바일 첫 계산 | 390px에서 입력 카드가 1,817px 아래 | P0 개선 필요 |
| 모바일 결과 CTA | 결과 시작보다 약 3,289px 아래, FAQ 뒤에 위치 | P0 개선 필요 |
| 빌드 | Next.js 214개 정적 페이지 생성 성공 | PASS |

## 2. 실제 파일 구조와 실행 경로

### 활성 경로

| 파일 | 역할 |
| --- | --- |
| `pages/tools/compound-interest.js` | 라우트, SEO, FAQ/JSON-LD, 상태, 계산 실행, 결과/CTA 조립 |
| `_components/CompoundForm.js` | 입력, 프리셋, 검증, 계산 버튼 |
| `lib/compound.js` | 화면 호환 wrapper, 단리식 비교 계산, core helper export |
| `lib/compoundCore.js` | 검증된 월복리 계산, 연도별 row, 민감도, 목표 역산 |
| `_components/CompoundDetailSummary.js` | 핵심 결과 카드와 해석 |
| `_components/CompoundChart.js` | 연도별 stacked bar와 비교 line |
| `_components/CompoundYearTable.js` | 연도별 8열 표, 기본 10년 표시 |
| `_components/ScenarioPanel.js` | 보수/기본/공격 시나리오 |
| `_components/CashFlowLayerChart.js` | 연 납입, 성장, 비용 레이어 |
| `_components/TimelineComparePanel.js` | 결과 저장 및 복수 시나리오 비교 |
| `_components/GoalEngineCard.js` | 목표금액 필요 월납입금/도달 기간 역산 |
| `_components/SensitivityPanel.js` | 수익률, 월납입금, 기간 민감도 |
| `_components/DragBreakdownChart.js` | 세금, 수수료, 복리 손실 영향 시각화 |
| `_components/ToolResultCta.js` | PDF, URL 복사, 체크리스트, 다음 계산기, 무료 자료 CTA |
| `_components/ToolCta.js` | 목표자산/CAGR/DCA 계산기 링크 |
| `_components/CTABar.js` | 모바일 결과 섹션 navigation과 공유 |
| `_components/ToolBacklinkKit.js` | 상단 공유와 하단 인용 HTML |
| `_components/SeoHead.js` | title, description, canonical, hreflang, OG/Twitter |
| `utils/analytics.js` | GA4 공통 page context와 event dispatch |
| `scripts/verify_compound_calculator.js` | 계산 샘플과 UI source 검증 |
| `scripts/verify_seo_channel_split.js` | canonical/hreflang/sitemap 채널 검증 |

실제 브라우저 계산 경로는 다음과 같다.

1. `CompoundForm`이 입력값을 검증한다.
2. 사용자가 `계산하기`를 눌러 `onSubmit`을 호출한다.
3. 페이지가 KRW 입력을 만원 단위에서 원 단위로 변환한다.
4. `calcCompound`, `calcCompoundNoTaxFee`, `calcSimpleLump`를 클라이언트에서 직접 실행한다.
5. `calcCompound`와 `calcCompoundNoTaxFee`는 `compoundCore.simulateCompoundPlan`을 사용한다.
6. 결과를 summary, chart, table, scenario, goal, sensitivity 컴포넌트에 전달한다.

`pages/api/compound.js`도 존재하지만 현재 도구 페이지에서는 호출하지 않는다. 이 API는 `taxOption`/`feeOption`을 받지만 활성 core가 사용하는 `taxRatePercent`/`feeRatePercent`/`inflationRate`와 계약이 다르므로, 외부 사용자가 있다면 별도 호환성 감사가 필요하다.

## 3. 현재 입력 항목

기본값은 `원금 1,000만원`, `월 30만원`, `연 7%`, `10년`, `세율 15.4%`, `연 수수료율 0.5%`, `물가상승률 0%`, `월복리`다.

| 구역 | 입력/표시 | 현재 동작 |
| --- | --- | --- |
| 검증 샘플 | A 기본형, B 장기 적립, C 0% 수익률, D 손실 수익률 | 클릭 시 KRW와 검증값 입력 |
| 기본 입력 | 초기 투자금 | KRW는 만원, USD는 실제 달러 단위 |
| 기본 입력 | 월 적립금 | KRW는 만원, USD는 실제 달러 단위 |
| 기본 입력 | 연 수익률 | 음수 허용, 고수익률 경고 제공 |
| 기본 입력 | 투자 기간 | 0 초과, 60년 초과 경고 제공 |
| 비용 옵션 | 세율 | 숫자 입력, 0이면 미반영 |
| 비용 옵션 | 연 수수료율 | 숫자 입력, 0이면 미반영 |
| 비용 옵션 | 물가상승률 | 숫자 입력, 현재가치에 반영 |
| 고급 옵션 | 계산 기준 | 월복리 고정, 읽기 전용 안내 |
| 고급 옵션 | 통화 | KRW/USD 선택 |

현재 기본 입력과 비용 옵션은 펼쳐져 있고 고급 옵션만 접혀 있다. 세금/수수료는 별도 on/off 제어가 없어 사용자가 `0`을 입력해야 제외된다. 초기 결과는 자동 표시되지 않으며 `계산하기`가 필수다.

## 4. 계산 기준

- 월복리 고정
- 월 납입은 매월 말 납입
- 순 연수익률 = 연 수익률 - 연 수수료율
- 월 수익률 = 순 연수익률 / 12
- 세금 = 양수인 세전 투자수익에 최종 시점 1회 적용
- 현재가치 = 세후 최종금액을 물가상승률로 할인
- 손실 시나리오의 세금은 0

`node scripts\verify_compound_calculator.js`에서 A-D 네 샘플 모두 PASS했다. 계산 방식은 이번 감사에서 수정하지 않았다.

## 5. 현재 결과 항목

### 핵심 summary

- 세후 최종금액
- 원금합계
- 세전 투자수익
- 물가 반영 현재가치
- 세금
- 총수익률
- CAGR 참고값
- 초기 투자금 미래가치
- 월 납입금 미래가치
- 수수료 영향
- 세후 수익
- 조건에 따른 결과 해석과 계산 가정 안내

### 추가 분석

- 세후 결과와 세전 이상치의 비율 및 비용 영향 해석
- 연도별 자산 성장 chart
- 초기 투자금, 추가 투자금, 세후 이자 stacked bar
- 세금/수수료 미적용 line
- 같은 총 납입액을 일시금으로 둔 단리식 line
- 보수/기본/공격 수익률 시나리오
- 연도별 현금흐름 레이어
- 저장한 시나리오 비교
- 월 적립 복리식 연도별 표
- 단리식 일시금 연도별 표
- drag breakdown
- 목표금액 역산
- 수익률/월납입금/기간 민감도

연도별 표는 `연도, 납입원금, 세전금액, 세전 투자수익, 예상 세금, 세후금액, 현재가치, 목표 대비율` 8개 열이다. 10년 초과 시 기본 10개 row만 표시하고 전체 보기로 확장한다.

단리식 비교는 총 납입액을 시작 시점 일시금으로 둔 별도 계산이다. 월 적립식과 현금흐름 시점이 다르므로 “월복리와 연복리 비교”로 오해되지 않도록 별도 검증과 설명 보강이 필요하다.

## 6. FAQ와 구조화데이터

| locale | FAQ 수 | 화면 위치 |
| --- | ---: | --- |
| KO | 9 | 결과 전에는 입력 아래, 결과 후에는 결과 분석 뒤 |
| EN | 5 | KO와 같은 조건부 위치 |

- 화면 FAQ와 FAQPage JSON-LD는 동일한 `faqItems` 배열을 사용한다.
- 결과 전/후의 FAQ JSX는 두 군데 있지만 `hasResult` 조건이 상호 배타적이므로 DOM에는 한 세트만 존재한다.
- FAQPage JSON-LD도 페이지당 한 번만 출력된다.
- 추가 JSON-LD는 HowTo, BreadcrumbList, SoftwareApplication 각 1개다.
- H1은 locale별 1개다.

현재 중복 위험은 낮다. Phase 1-4에서 FAQ를 늘릴 때도 배열 단일 소스를 유지하고, 화면에는 accordion을 유지하는 편이 안전하다.

## 7. SEO 현황

### 현재 문구

KO title:

`복리 계산기 | 월복리·연복리·적립식 투자 미래가치 계산 | FinMap`

KO description:

`복리 계산기로 원금, 월 적립금, 연 수익률, 기간, 세금, 수수료, 물가상승률을 반영해 월복리·적립식 투자 미래가치와 현재가치를 계산합니다.`

EN title:

`Compound Interest Calculator: Future Value, Monthly Contributions & Taxes | FinMap`

EN description:

`Calculate future value with principal, monthly or lump-sum contributions, compound frequency, taxes, fees, inflation, charts, and year-by-year tables.`

### canonical/hreflang/indexability

| URL | canonical | hreflang |
| --- | --- | --- |
| `/tools/compound-interest` | `https://www.finmaphub.com/tools/compound-interest` | KO self + EN alternate |
| `/en/tools/compound-interest` | `https://www.finmaphub.com/en/tools/compound-interest` | KO alternate + EN self |

- `robots` meta를 별도로 출력하지 않으며 noindex가 없다.
- `sitemap-0.xml`, `sitemap-ko.xml`, `sitemap-en.xml`, `public/en/sitemap.xml`에 해당 locale URL이 포함된다.
- head와 sitemap의 alternate pair가 일치한다.
- `verify_seo_channel_split.js --local-server`가 target EN route와 전체 sample을 PASS했다.

### 정합성 이슈

활성 계산은 월복리 고정이고 UI도 “연복리 비교는 후속 검증 대상”이라고 밝힌다. 그러나 KO title에는 `연복리`가 포함되고, 본문에도 월복리/연복리 차이 설명이 있어 사용자가 현재 계산기에서 두 방식을 직접 비교할 수 있다고 기대할 수 있다. Phase 1-4에서 title을 실제 기능에 맞게 줄이는 것이 우선이다. canonical/hreflang 정책 변경은 필요하지 않다.

## 8. 현재 내부 링크

### 계산 결과 CTA

- 체크리스트: `/posts/personalFinance/simple-vs-compound`
- 다음 계산기: `/tools/goal-simulator`
- 관련 계산기 cards: goal, CAGR, DCA
- PDF 저장, 결과 URL 복사, 무료 자료 다운로드

Roadmap의 우선순위는 goal, DCA, CAGR, FIRE다. 현재는 goal, CAGR, DCA이며 FIRE가 없다. Phase 1-3에서 순서와 개수를 CTA 성과 기준으로 다시 정할 수 있다.

### 추천 가이드

- `simple-vs-compound`
- `annual-vs-monthly-compound`
- `how-much-per-month-for-100m`
- `monthly-dca-10-year-result`
- `goal-amount-fast-strategy`
- `personal-start-5steps`
- personalFinance category index

여섯 slug 모두 KO/EN 파일이 존재한다. `how-much-per-month-for-100m`은 SEO hreflang opt-out 글이지만 여기서는 “추천 글” 링크로 locale별 독립 콘텐츠에 연결되므로 현재 링크 자체는 유효하다.

## 9. GA4 이벤트 현황

| 동작 | 이벤트 | 주요 파라미터 |
| --- | --- | --- |
| 계산 버튼 | `tool_calculate` | `source_tool=compound`, locale, currency, has_result, location |
| sticky section 이동 | `tool_nav_click` | source_tool, section, locale, location |
| sticky 공유 | `tool_result_action` | source_tool, action, locale, location |
| 결과 CTA 노출 | `tool_result_cta_view` | source_tool, checklist_url, related_tool, locale, location |
| 결과 CTA 클릭 | `tool_result_cta_click` | source_tool, action, target 정보, locale, location |
| 체크리스트 | `checklist_cta_click` | source_tool, target_url, locale, location |
| 관련 계산기 card | `tool_hub_click` | source_tool, target_tool, locale, location |
| 공유/인용 | `tool_backlink_action` | action, source_tool, locale, location |
| PDF/무료 자료 | success/error 및 lead magnet 세부 이벤트 | source_tool, action 상태, locale, location |

장점:

- 입력 변경마다 `tool_calculate`가 발송되지 않고 명시적 계산 버튼에서만 발송된다.
- 공통 `page_group`과 `source_path`가 자동 첨부된다.
- 결과 CTA는 view와 click을 분리한다.

보완점:

- `tool_calculate`에 `has_tax`, `has_fee`, `has_inflation`, `scenario_type`이 없다.
- 같은 세션의 반복 계산을 구분하는 `is_first_calculation` 또는 동등한 값이 없다.
- 관련 계산기는 기존 공통 이벤트 `tool_hub_click`을 쓰며 roadmap 예시의 `related_calculator_click`은 사용하지 않는다. 이벤트명 교체보다 기존 이름 유지와 분석 문서 정렬이 안전하다.
- 추천 가이드 링크에는 `blog_engagement` 또는 전용 click event가 없다.

## 10. 모바일 UX 실측

2026-06-29 production build를 로컬로 실행하고 Chrome headless, 390×844 viewport에서 확인했다.

### 계산 전

| 항목 | 실측 |
| --- | ---: |
| 문서 높이 | 5,262px |
| 문서 너비 / viewport | 390px / 390px |
| 입력 card top | 1,817px |
| 계산 버튼 top | 2,873px |
| 입력 card까지 viewport 수 | 약 2.2개 |
| H1 | 1개 |

첫 화면에는 H1, mode toggle, 공유 패널, 설명 카드가 보이며 입력은 보이지 않는다. 사용법, 공식, 예시 표도 입력 전에 있어 검색 콘텐츠는 풍부하지만 계산 실행률에는 불리하다.

### 계산 후

| 항목 | 실측 top |
| --- | ---: |
| 결과 시작 | 2,959px |
| 핵심 summary 높이 | 1,465px |
| chart | 4,674px |
| 주요 해석 | 5,268px |
| FAQ | 5,568px |
| 결과 CTA | 6,248px |
| 관련 계산기 | 6,771px |

- 계산 후 문서 높이는 9,254px다.
- horizontal overflow는 없었다.
- chart canvas 3개가 렌더링됐다.
- 모바일 PRO mode에서 고급 분석은 접혀 있다.
- sticky bar는 `요약, 차트, 해석, CTA, 공유하기`를 제공해 긴 결과를 보완한다.
- CTA card와 sticky bar의 버튼 겹침이나 잘림은 관찰되지 않았다.

가장 큰 문제는 결과 CTA가 주요 해석 바로 뒤가 아니라 9개 FAQ 뒤에 있다는 점이다. sticky CTA jump가 있지만 자연 스크롤 사용자에게는 전환 행동이 늦게 노출된다.

## 11. 개선 우선순위

### P0

1. **입력 폼을 상단으로 이동**
   - H1과 짧은 한두 문장 안내 다음에 기본 입력을 배치한다.
   - 공유 패널, 긴 사용법, 공식, 예시 표는 계산 폼 뒤로 이동한다.
   - 계산식이나 기본값 변경 없이 가장 직접적으로 실행률을 개선할 수 있다.

2. **모바일 기본 입력 흐름 축약**
   - 원금, 월 적립금, 연 수익률, 기간, 계산 버튼을 먼저 보인다.
   - A-D 검증 프리셋과 비용 옵션은 접힘 영역으로 보내되 현재 적용값은 짧게 표시한다.

3. **세금/수수료 반영 여부를 명시적으로 표현**
   - 단순히 `0`을 입력하게 하지 말고 toggle/checkbox로 반영 여부를 알린다.
   - 기존 rate 값은 보존하고 off일 때 계산에 0을 전달하는 최소 방식이 적합하다.
   - 기본 on 상태와 기본 결과는 현재와 동일하게 유지해야 한다.

4. **결과 CTA를 FAQ보다 앞에 배치**
   - 주요 해석 직후 ToolResultCta를 노출하고 FAQ는 그 뒤에 둔다.
   - 이는 Phase 1-3 범위이며 Phase 1-2에서 섞어 수정하지 않는다.

5. **SEO 문구와 월복리 고정 기능 정렬**
   - KO title의 `연복리`를 제거하거나 실제 연복리 비교 기능이 검증된 뒤 사용한다.
   - Phase 1-4에서 문구만 조정하며 SeoHead/canonical/hreflang 구조는 유지한다.

### P1

1. `tool_calculate`에 tax/fee/inflation/scenario/first-calculation 파라미터를 기존 event name을 유지한 채 추가한다.
2. 모바일 summary의 11개 metric을 핵심 4개와 상세 펼침으로 분리한다.
3. goal, DCA, CAGR, FIRE CTA 우선순위를 성과 측정 기준으로 재배치한다.
4. FAQ를 질문형 long-tail로 확장하되 KO 우선, 화면 accordion과 단일 FAQPage source를 유지한다.
5. 단리식 일시금 비교의 현금흐름 차이를 더 명확히 설명하고 별도 테스트한다.
6. accordion trigger에 `aria-expanded`, `aria-controls`를 추가해 접근성을 보완한다.
7. 사용되지 않는 legacy `_components/CompoundCTA.js`는 별도 정리 작업에서 참조 스크립트/문서와 함께 검토한다.
8. `pages/api/compound.js`의 실제 소비자와 core parameter 계약을 별도 감사한다.

### P2

1. 연 적립 증가율
2. 일시 추가 납입
3. 하락장 또는 변동 수익률 시나리오
4. 나이/투자 시작 연령과 목표 시점
5. 기간별 5/10/20/30년 quick comparison
6. 월 적립금 10/30/50/100만원 quick comparison
7. 수익률 3/5/7/10% quick comparison
8. 저장/공유 결과의 장기 persistence 정책

## 12. Phase 1-2 권장 구현 범위

바로 진행 가능한 최소 범위는 `pages/tools/compound-interest.js`와 `_components/CompoundForm.js` 중심이다.

1. H1/짧은 안내 다음에 입력 card를 배치한다.
2. 기본 입력 4개와 계산 버튼을 첫 흐름에 유지한다.
3. 검증 프리셋을 접힘 또는 보조 영역으로 옮긴다.
4. 세금/수수료/물가 옵션을 “시나리오 옵션”으로 접고 적용값 summary를 표시한다.
5. 세금/수수료 toggle을 추가하되 기존 기본 결과와 URL preset field를 보존한다.
6. 320/360/390/430/768px에서 입력 label, 버튼, 오류 문구, horizontal overflow를 확인한다.
7. 기존 A-D 샘플과 default 입력의 변경 전/후 결과를 비교한다.
8. `tool_calculate` event name은 유지하고 입력 변경 시 자동 발송하지 않는다.

초기 결과 자동 표시는 roadmap 완료 기준과 맞지만, 계산 실행률 event 정의와 충돌할 수 있다. Phase 1-2에서 적용한다면 초기 렌더는 `tool_calculate`로 집계하지 않고, 사용자 계산과 구분하는 명시적 측정 규칙을 먼저 정해야 한다.

Phase 1-2에서 제외할 항목:

- 계산 공식 변경
- 단리식 비교 공식 변경
- result CTA 재배치
- FAQ 대규모 확장
- SEO title/description 수정
- canonical/hreflang/sitemap/robots 수정
- API contract 변경

## 13. 검증 결과

| 명령/확인 | 결과 |
| --- | --- |
| `node scripts\verify_compound_calculator.js` | PASS, A-D 4개 샘플 전체 통과 |
| `npm.cmd run build` | PASS, Next.js compile 및 214개 static page 생성 |
| build postbuild | PASS, main 204 / KO 106 / EN 98 URL 생성 확인 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS, target 및 전체 sample canonical/hreflang/sitemap 통과 |
| Chrome 390×844 DOM/visual 확인 | PASS, overflow/겹침 없음. 입력/CTA 거리 이슈 확인 |
| `git diff --check` | PASS |

검증 과정에서 재생성된 sitemap과 기존 verifier 보고서는 범위 밖 변경을 남기지 않도록 복원했다. 임시 모바일 screenshot도 삭제했다.

## 14. 남은 위험과 수동 확인

- 실제 GA4 DebugView와 production analytics 수신 여부는 이번 로컬 감사에서 확인하지 않았다.
- 모바일 실측은 390×844 한 viewport에서 수행했다. Phase 1-2 구현 시 320~768px 회귀 확인이 필요하다.
- EN 사용자는 기본 locale에서 USD로 전환되지만 A-D 프리셋은 KRW로 강제 전환된다. 기능 오류는 아니나 EN UX 목적과 맞는지는 후속 판단이 필요하다.
- 결과 영역은 기능이 풍부한 대신 모바일에서 매우 길다. 기능 삭제보다 progressive disclosure와 CTA 순서 조정이 우선이다.
