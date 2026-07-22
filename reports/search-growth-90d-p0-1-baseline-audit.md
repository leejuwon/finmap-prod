# FinMap 검색 성장 90일 P0-1 기준선 감사

- 기준일: 2026-07-22
- 범위: Google Search Console, Naver Search Advisor, Bing Webmaster Tools 성장을 위한 로컬 구조 기준선
- 작업 모드: 감사 전용
- 데이터 출처: 로컬 저장소 구조, Markdown front matter, Next.js page source, sitemap 파일, 정적 내부 링크
- 외부 검색 데이터: 이번 단계에서는 사용하지 않음

## 1. 요약

이번 감사는 기존 페이지, 본문, canonical, hreflang, robots, sitemap 설정, GA4 로직, 계산기 로직을 바꾸지 않고 FinMap의 검색 성장 기준선을 만들기 위한 작업이다.

총 192개 URL을 인벤토리화했다. 포스트 150개, 도구 16개, 도구 허브 2개, 시장/부동산 페이지 24개가 포함됐다. 검색 성장 여지가 큰 축은 계산기 중심 클러스터와 부동산 대출 의도 클러스터다.

가장 큰 병목은 세 가지다.

- 포스트 템플릿의 조회수/댓글/공유 UI가 검색 스니펫에 섞일 수 있는 구조
- 일부 고가치 도구와 market top100 페이지의 title/description 품질 편차
- DSR/LTV, 주담대 월상환액, 아파트 구매 예산, 아파트 실거래 대시보드 사이의 검색 의도 중첩

권장 다음 단계는 대규모 콘텐츠 추가가 아니라 P0-2 스니펫 위생 및 고가치 URL 메타 정리다.

## 2. 생성 산출물

- 감사 스크립트: `scripts/audit_search_growth_baseline.js`
- URL 인벤토리 CSV: `reports/search-growth-90d-url-inventory.csv`
- 감사 데이터 JSON: `reports/search-growth-90d-audit-data.json`
- 본 보고서: `reports/search-growth-90d-p0-1-baseline-audit.md`

## 3. URL 인벤토리 요약

| 항목 | 수 |
| --- | ---: |
| 전체 URL | 192 |
| KO URL | 100 |
| EN URL | 92 |
| 포스트 | 150 |
| 도구 | 16 |
| 도구 허브 | 2 |
| 시장/부동산 페이지 | 24 |

검색 의도 그룹:

| 그룹 | URL | P0 | P1 | 정적 고립 URL | 평균 inbound | 평균 outbound |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| real-estate-loan | 107 | 12 | 95 | 20 | 6.9 | 7.6 |
| compound-goal | 44 | 4 | 40 | 6 | 7.4 | 5.9 |
| dca-cagr | 13 | 3 | 10 | 2 | 11.3 | 4.7 |
| macro-market | 16 | 0 | 0 | 5 | 4.6 | 7.4 |
| fire-retirement | 4 | 0 | 2 | 2 | 3.5 | 3.8 |
| real-estate-data | 3 | 0 | 0 | 0 | 1.7 | 6.3 |
| calculator-hub | 2 | 0 | 0 | 1 | 0.5 | 12.0 |
| general | 3 | 0 | 0 | 0 | 5.3 | 6.7 |

## 4. 감사 점수 기준

각 URL은 저장소 기준 휴리스틱으로 점수화했다.

- Search Intent Clarity
- Business Value
- Existing Authority
- Improvement Potential
- Cannibalization Risk
- Internal Link Gap
- Conversion Potential

이 점수는 실제 트래픽 예측이 아니다. P0-2 또는 P0-3에서 GSC/Naver/Bing의 impressions, clicks, CTR, average position, index coverage와 결합해야 우선순위가 더 정확해진다.

## 5. 주요 병목

1. 포스트 템플릿 스니펫 리스크가 전역적이다.
   포스트 상세 템플릿에서 조회수, 댓글, 공유 UI가 본문 주변에 렌더링된다. 정적 감사에서 `post_template_view_count_ssr`, `post_template_empty_comments_ssr`, `post_template_share_buttons`가 포스트 150개에 걸쳐 잡혔다. 검색 스니펫에 저가치 UI 문구가 노출될 수 있다.

2. 일부 고권위 도구 페이지가 slug 형태 메타로 잡힌다.
   `/tools/compound-interest`, `/tools/goal-simulator`, `/tools/cagr-calculator` 및 EN 대응 URL은 inbound가 강하지만 정적 추출에서 slug 같은 title 또는 description 공백이 잡힌다. 메타 정리 효과가 클 수 있다.

3. 부동산 대출 클러스터가 크고 의도가 촘촘하다.
   real-estate-loan 그룹은 107개 URL이다. DSR/LTV, 주담대 원리금, 아파트 구매 예산, 아파트 실거래, 금리, 연봉별 대출한도, 구매 가이드가 한 클러스터에 있다. 역할 분리는 되어 있으나 title, H1, intro, CTA, 내부 링크에서 더 명확한 계층이 필요하다.

4. market top100 페이지 description 공백이 있다.
   일부 `/market/real-estate/*top100` 페이지는 지역 아파트 가격/순위 검색 의도와 맞지만 description이 비어 있는 것으로 잡혔다.

5. EN 유지 경로는 구조적으로 존재하지만 검색 품질은 균일하지 않다.
   EN sitemap과 canonical 검증은 통과했지만 일부 EN URL은 긴 title, description 공백, KO fallback loading text가 정적 추출에 잡혔다.

## 6. 스니펫 리스크

| 리스크 신호 | 수 |
| --- | ---: |
| post_template_view_count_ssr | 150 |
| post_template_empty_comments_ssr | 150 |
| post_template_share_buttons | 150 |
| share_buttons | 31 |
| tool_initial_result_copy_review | 16 |
| views | 7 |
| loading | 6 |
| empty_result | 2 |
| comments | 1 |

해석:

- 우선순위는 포스트 본문 재작성보다 템플릿 UI 문구가 검색 스니펫을 먹지 않게 하는 것이다.
- 도구 페이지는 빈 결과/초기 상태 문구보다 계산기 목적 설명이 먼저 잡히는지 확인해야 한다.
- 이번 P0-1에서는 스니펫 수정은 하지 않았다.

## 7. Title, Description, H1 감사

| 점검 항목 | 수 |
| --- | ---: |
| description 없음 | 30 |
| title 60자 초과 | 71 |
| description 160자 초과 | 50 |
| H1 없음 | 0 |
| 중복 title 그룹 | 8 |
| 중복 description 그룹 | 0 |

중복 title 그룹:

- `compound-interest`: `/tools/compound-interest`, `/en/tools/compound-interest`
- `goal-simulator`: `/tools/goal-simulator`, `/en/tools/goal-simulator`
- `fire-calculator`: `/tools/fire-calculator`, `/en/tools/fire-calculator`
- `cagr-calculator`: `/tools/cagr-calculator`, `/en/tools/cagr-calculator`
- `시장 데이터를 불러오는 중입니다.`: `/market/indices`, `/en/market/indices`
- `seoul-apartment-top100`: `/market/real-estate/seoul-apartment-top100`, `/en/market/real-estate/seoul-apartment-top100`
- `gyeonggi-apartment-top100`: `/market/real-estate/gyeonggi-apartment-top100`, `/en/market/real-estate/gyeonggi-apartment-top100`
- `incheon-apartment-top100`: `/market/real-estate/incheon-apartment-top100`, `/en/market/real-estate/incheon-apartment-top100`

## 8. 검색 의도 중복 점검

### 부동산 대출 클러스터

핵심 역할:

- `/tools/mortgage-loan-calculator`: 대출금액 기준 월상환액, 총이자, 상환표
- `/tools/dsr-ltv-calculator`: 소득/집값 기준 대출 가능성 및 한도
- `/tools/home-buying-budget-calculator`: 보유 현금 기준 구매 가능 여부
- `/market/real-estate`: 아파트 실거래 대시보드
- `/market/real-estate/seoul-top100`, `/market/real-estate/magok-top100`: 지역 아파트 가격/순위

리스크:

- DSR, LTV, 연봉, 금리, 주담대, 아파트 구매, 월상환액 키워드가 여러 글과 도구에 걸쳐 있다.
- P0-2에서 의도별 대표 흐름을 고정하는 것이 좋다. 월상환액은 mortgageLoan, 대출한도는 dsrLtv, 구매 가능 여부는 homeBuying, 후보 아파트 탐색은 real-estate dashboard로 연결한다.

### 복리, 목표자산, DCA 클러스터

핵심 역할:

- `/tools/compound-interest`: 복리 성장 계산
- `/tools/goal-simulator`: 목표자산과 월 납입액 계획
- `/tools/dca-calculator`: 적립식 투자 시뮬레이션
- `/tools/cagr-calculator`: 연평균 수익률 해석

리스크:

- 관련 글의 내부 링크는 많지만 일부 핵심 도구 메타가 정적 추출에서 slug처럼 잡힌다.
- 1억 목표, 월 투자금, CAGR, DCA, 하락장, 복리 표 콘텐츠는 의도별 대표 도구를 하나씩 명확히 가리켜야 한다.

## 9. 내부 링크 감사

감사 스크립트 기준:

- 정적 고립 URL: 36
- inbound 정적 링크 1개 이하 URL: 26
- real-estate-loan 그룹 고립 URL: 20
- compound-goal 그룹 고립 URL: 6

주의:

정적 링크 수는 저장소에서 보이는 링크만 계산한다. 동적 카드, 관련 콘텐츠 모듈, 런타임 추천 링크는 과소 집계될 수 있다. 따라서 이 수치는 "고립 가능성 발견 목록"으로 보는 것이 안전하다.

포스트 링크 검사:

- `npm.cmd run check:posts-links`는 루트의 `blog-contents.md`가 없어 실패했다.
- 동일 스크립트를 `docs/blog-contents.md`로 직접 실행하면 완료된다.
- 결과: 150개 파일 스캔, 109개 published 파일 검사, broken 8개, suspicious 13개, registry self URL missing 24개
- 산출물: `reports/posts.linkcheck.json`

## 10. 금융 콘텐츠 신뢰 신호

현재 포스트와 계산기는 대체로 실용 설명, 가정, 주의 문구, 내부 도구 연결을 갖고 있다. 검색 성장 관점에서는 다음 신호를 유지해야 한다.

- 계산기 가정과 금융 조언을 분리한다.
- 금리, 수익률, 대출, 세금, 부동산 조건의 한계를 결과 근처에 둔다.
- 부동산/대출 페이지에서 승인 보장처럼 보이는 표현을 피한다.
- 시장 페이지는 대시보드 데이터와 공식 데이터 표현을 구분한다.
- 포스트의 author/date/modified/structured data 일관성을 유지한다.

이번 감사에서는 신뢰 문구를 수정하지 않았다.

## 11. GA4 퍼널 이벤트 현황

확인된 주요 이벤트:

- `tool_calculate`
- `tool_hub_click`
- `tool_result_cta_view`
- `tool_result_cta_click`
- `tool_result_action`
- `tool_nav_click`
- `related_calculator_click`
- `dsr_ltv_calculate`
- `mortgage_payment_calculate`
- `mortgage_payment_next_click`
- `home_buying_calculate`
- `post_to_dsr_ltv_click`
- `real_estate_to_dsr_click`
- `dashboard_to_dsr_click`
- `dsr_to_real_estate_click`
- `blog_engagement`
- ToolResultCta의 lead magnet 및 PDF download 이벤트

해석:

- 계산기와 결과 CTA 이벤트는 기본적으로 존재한다.
- P0-2에서는 검색 랜딩 분석을 위해 landing URL, source tool, target tool, result state, click location 같은 파라미터 정규화가 필요하다.
- 이번 감사에서는 GA4 로직을 수정하지 않았다.

## 12. 우선순위 상위 20개 URL

| 순위 | 점수 | 우선순위 | URL | 그룹 | Inbound | Outbound | 다음 액션 |
| ---: | ---: | --- | --- | --- | ---: | ---: | --- |
| 1 | 30 | P0 | /tools/compound-interest | compound-goal | 50 | 0 | P0-2 snippet hygiene review |
| 2 | 30 | P0 | /tools/goal-simulator | compound-goal | 28 | 5 | P0-2 snippet hygiene review |
| 3 | 29 | P0 | /posts/investingInfo/rates-discount-mortgage-demand-apt-prices | real-estate-loan | 1 | 10 | P0-2 snippet hygiene review |
| 4 | 29 | P0 | /tools/cagr-calculator | dca-cagr | 41 | 3 | P0-2 snippet hygiene review |
| 5 | 28 | P1 | /market/real-estate/gyeonggi-apartment-top100 | real-estate-loan | 3 | 0 | P1-2 internal CTA/link structure review |
| 6 | 28 | P1 | /posts/economicInfo/interest-rate-basics | real-estate-loan | 21 | 9 | P0-2 snippet hygiene review |
| 7 | 28 | P1 | /posts/investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions | real-estate-loan | 0 | 8 | P0-2 snippet hygiene review |
| 8 | 28 | P1 | /posts/investingInfo/real-estate-role-in-portfolio-risk-budget | real-estate-loan | 0 | 8 | P0-2 snippet hygiene review |
| 9 | 28 | P1 | /posts/personalFinance/apartment-buying-calculator-guide | real-estate-loan | 0 | 6 | P0-2 snippet hygiene review |
| 10 | 28 | P1 | /posts/personalFinance/apartment-transaction-volume-decline-meaning | real-estate-loan | 0 | 4 | P0-2 snippet hygiene review |
| 11 | 28 | P1 | /posts/personalFinance/dca-vs-lumpsum-decision-rules | real-estate-loan | 5 | 8 | P0-2 snippet hygiene review |
| 12 | 28 | P1 | /posts/personalFinance/emergency-fund-by-risk | real-estate-loan | 14 | 10 | P0-2 snippet hygiene review |
| 13 | 28 | P1 | /posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal | real-estate-loan | 3 | 9 | P0-2 snippet hygiene review |
| 14 | 28 | P1 | /posts/personalFinance/fire-sequence-risk-first-5-years | real-estate-loan | 1 | 9 | P0-2 snippet hygiene review |
| 15 | 28 | P1 | /posts/personalFinance/first-home-buyer-budget-calculation | real-estate-loan | 0 | 6 | P0-2 snippet hygiene review |
| 16 | 28 | P1 | /posts/personalFinance/how-to-read-apartment-transaction-prices | real-estate-loan | 0 | 6 | P0-2 snippet hygiene review |
| 17 | 28 | P1 | /posts/personalFinance/jeonse-to-home-purchase-cash-needed | real-estate-loan | 0 | 6 | P0-2 snippet hygiene review |
| 18 | 28 | P1 | /posts/personalFinance/large-apartment-complex-households-price-stability | real-estate-loan | 0 | 5 | P0-2 snippet hygiene review |
| 19 | 28 | P1 | /posts/personalFinance/ltv-dsr-calculator-guide | real-estate-loan | 0 | 6 | P0-2 snippet hygiene review |
| 20 | 28 | P1 | /posts/personalFinance/salary-40m-mortgage-limit | real-estate-loan | 0 | 5 | P0-2 snippet hygiene review |

## 13. P0/P1/P2 작업 큐

P0:

- 포스트 템플릿과 고가치 도구 페이지의 스니펫 위생 개선
- 계산기 첫 crawlable text가 결과/카운터/댓글/공유 UI보다 계산기 목적을 먼저 설명하도록 정리
- compound, goal, CAGR, FIRE, market fallback 페이지의 slug-like 메타 점검

P1:

- 부동산 대출 클러스터 계층 강화
- top100 페이지 description 보강
- 고립 가능성이 있는 부동산 대출 글에서 대표 도구로 내부 링크 보강
- `reports/posts.linkcheck.json`의 broken/suspicious 링크 해결

P2:

- GSC/Naver/Bing 데이터를 인벤토리에 병합
- URL별 indexed, impressions, CTR, average position, landing conversion event 컬럼 추가
- 월간 검색 성장 scorecard 생성

## 14. 검증 결과

| 명령 | 결과 | 메모 |
| --- | --- | --- |
| `node scripts\audit_search_growth_baseline.js` | PASS | 192개 URL 인벤토리 생성 |
| `node --check scripts\audit_search_growth_baseline.js` | PASS | 신규 스크립트 문법 확인 |
| `node scripts\verify_tool_result_cta_events.js` | PASS | ToolResultCta 및 계산기 이벤트 확인 |
| `npm.cmd run check:posts-links` | FAIL | 루트 `blog-contents.md` 없음 |
| `node scripts\check_posts_links_local.js --registry=docs\blog-contents.md --dir=content/posts --ext=md,mdx --out=reports/posts.linkcheck.json` | PASS with findings | broken 8, suspicious 13, self URL missing 24 |
| `npm.cmd run build` | PASS | Next.js build 및 postbuild sitemap 생성 완료 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS | 샘플 canonical, EN sitemap membership, forbidden sitemap pattern 통과 |
| `git diff --check` | PASS | 생성 report 파일 line-ending 경고만 있음 |
| `git status --short --untracked-files=all` | PASS | 아래 감사/보고서 산출물만 표시 |

최종 `git status --short --untracked-files=all`:

```text
 M reports/posts.linkcheck.json
 M reports/seo-channel-split-url-check.md
?? reports/search-growth-90d-audit-data.json
?? reports/search-growth-90d-p0-1-baseline-audit.md
?? reports/search-growth-90d-url-inventory.csv
?? scripts/audit_search_growth_baseline.js
```

## 15. 변경 파일

생성:

- `scripts/audit_search_growth_baseline.js`
- `reports/search-growth-90d-url-inventory.csv`
- `reports/search-growth-90d-audit-data.json`
- `reports/search-growth-90d-p0-1-baseline-audit.md`

검증 명령으로 갱신:

- `reports/posts.linkcheck.json`
- `reports/seo-channel-split-url-check.md`

기존 content, pages, components, canonical, hreflang, robots, sitemap config, GA4, 계산기 로직, 광고 슬롯 구조는 수동 수정하지 않았다.

## 16. 남은 리스크

- 실제 GSC/Naver/Bing/GA4 데이터가 반영되지 않은 로컬 저장소 기준 감사다.
- 정적 내부 링크 수는 동적 UI 링크를 과소 집계할 수 있다.
- 일부 metadata 추출은 JS 패턴과 fallback text의 영향을 받을 수 있다. 구현 전 브라우저 렌더링 기준 확인이 필요하다.
- `package.json`의 `check:posts-links` registry 경로는 현재 루트 파일을 가리키므로 별도 정리가 필요하다.

## 17. 권장 다음 단계 P0-2

1. 포스트 조회수, 빈 댓글, 공유 UI에 `data-nosnippet` 또는 렌더링 가드 적용 여부를 검토한다.
2. inbound가 강한 도구 페이지의 slug-like title/description을 정리한다.
3. 계산기 페이지의 첫 crawlable text가 검색 의도를 정확히 반영하는지 점검한다.
4. broken internal post link 8개와 EN cross-language suspicious link 13개를 해결한다.
5. DSR/LTV, mortgageLoan, homeBuying의 역할이 title, intro, CTA, 내부 링크에서 서로 침범하지 않도록 정리한다.
