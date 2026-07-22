# FinMap 검색 유입 10배 성장 프로젝트 P1-1B-1

생성일: 2026-07-22

범위: KO 네이버 성과 보호형 저위험 확장
대상 URL:

- `/posts/personalFinance/what-is-cagr`
- `/tools/home-buying-budget-calculator`
- `/posts/personalFinance/dsr-40-income-loan-limit-table`

## 1. Executive Summary

P1-1A/P1-1A-2에서 Track B로 분류된 KO 네이버 성과 URL 3개만 제한적으로 보강했다. 기존 title, H1, slug, canonical, hreflang, 계산 코어, GA4 이벤트 이름과 광고 슬롯은 변경하지 않았다.

변경 방향은 검색 의도 확장이 아니라 기존 의도 보호를 전제로 한 보조 정보 개선이다. 상단 답변 명확화, 계산기 CTA, 관련 계산기 연결, FAQ/JSON-LD 동기화, 모바일 overflow 검증만 수행했다.

## 2. Why Track B Was Executed First

Track B는 이미 네이버 클릭 또는 노출 반응이 확인된 KO URL이다. 따라서 대규모 제목 변경이나 검색 의도 재작성보다, 기존 랭킹 의도를 유지한 상태에서 계산기 연결과 답변 명확도를 높이는 접근이 가장 낮은 위험의 실행안이다.

Track A의 EN 실험은 별도 관찰군으로 남기고, 이번 작업에서는 KO 네이버 성과 URL만 수정했다.

## 3. Search Performance Baseline

기준 파일: `reports/search-growth-90d-p1-1a-2-execution-targets.json`

| URL | 분류 | 네이버 순위 | 클릭 | 노출 | CTR | Query Cluster |
|---|---:|---:|---:|---:|---:|---|
| `/posts/personalFinance/what-is-cagr` | NAVER_LOW_RISK_EXPAND | 3 | 53 | 5,084 | 1.00% | CAGR |
| `/tools/home-buying-budget-calculator` | NAVER_ADJACENT_OPPORTUNITY | - | 33 | 2,209 | 1.49% | 주담대 |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | NAVER_LOW_RISK_EXPAND | 12 | 18 | 538 | 3.30% | 주담대 |

## 4. Target Selection Rationale

| URL | 선택 이유 | 실행 강도 |
|---|---|---|
| `/posts/personalFinance/what-is-cagr` | 네이버 3위 성과가 있어 title/H1 보호가 중요하지만, 계산기 연결과 해석 문맥 보강 여지가 있음 | 낮음 |
| `/tools/home-buying-budget-calculator` | 주담대 인접 의도 노출이 있으나 DSR/LTV·월상환 계산기와 역할 분리가 필요함 | 낮음 |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | 네이버 12위 성과가 있고 주담대 월상환액 후속 의도 연결 가치가 있음 | 낮음 |

## 5. CAGR Article Before

기존 글은 CAGR 개념과 단순 수익률 차이를 설명했지만, 상단에서 “실제 매년 같은 수익률”이 아니라 “비교용 연평균 환산값”이라는 경계가 상대적으로 약했다. 또한 CAGR 계산기 CTA가 하단 중심이라 상단 검색 방문자가 바로 행동하기에는 거리가 있었다.

## 6. CAGR Article Changes

- `dateModified`를 `2026-07-22`로 갱신했다.
- 상단 한 문단 요약에 CAGR의 비교용 환산값 성격을 명확히 했다.
- 상단에 `/tools/cagr-calculator` CTA를 추가했다.
- 추가 납입이 있는 적립식 투자는 `/tools/dca-calculator`도 함께 보도록 안내했다.
- `CAGR을 해석할 때 같이 봐야 하는 것` 섹션을 추가해 단순 수익률, 평균 수익률, 마이너스 CAGR, 추가 납입 해석을 보강했다.
- 수동 Article JSON-LD 블록을 제거해 렌더러가 생성하는 BlogPosting JSON-LD와 중복되지 않게 했다.

## 7. HomeBuying Calculator Before

아파트 구매 계산기는 보유 현금, DSR/LTV, 월상환액을 함께 보여주고 있었지만, 주담대 원리금 계산기와의 역할 분리가 상단 설명과 후속 CTA에서 충분히 드러나지 않았다.

## 8. HomeBuying Calculator Changes

- KO/EN lead 문구를 보유 현금 기준 구매 가능성 중심으로 정리했다.
- `계산 결과를 읽는 순서` 섹션을 추가해 현금, DSR/LTV 한도, 월상환액, 실거래 가격 비교를 분리했다.
- 관련 링크에 `/tools/mortgage-loan-calculator` CTA를 추가했다.
- 기존 DSR/LTV 계산 컴포넌트와 계산 props, 이벤트 이름은 변경하지 않았다.

## 9. DSR Income Table Before

기존 글은 연봉별 DSR 40% 대출 가능액 표에 집중되어 있었다. 다만 “대출 가능액”과 “월상환액/총이자”의 차이를 별도 도구로 이어주는 흐름이 약했다.

## 10. DSR Income Table Changes

- `dateModified`를 `2026-07-22`로 갱신했다.
- 상단 CTA에 `/tools/mortgage-loan-calculator`를 추가했다.
- 요약과 본문에 대출 가능액과 월상환액을 구분해야 한다는 설명을 추가했다.
- 결론부에 대출금액 후보 확정 후 주담대 원리금 계산기로 월상환액과 총이자를 확인하도록 연결했다.
- FAQ `주담대 월상환액은 어디서 확인하나요?`를 추가하고 FAQPage JSON-LD `mainEntity`와 동기화했다.

## 11. Protected Elements

| URL | Element | Before | After | Reason | Risk |
|---|---|---|---|---|---|
| `/posts/personalFinance/what-is-cagr` | title/H1 | CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시 | UNCHANGED | 네이버 3위 의도 보호 | 낮음 |
| `/posts/personalFinance/what-is-cagr` | slug/canonical | `/posts/personalFinance/what-is-cagr` | UNCHANGED | 기존 색인 URL 보호 | 낮음 |
| `/tools/home-buying-budget-calculator` | title/H1 | 아파트 구매 계산기 - 보유 현금·주담대 한도·DSR LTV 예산 계산 / 아파트 구매 계산기 | UNCHANGED | 기존 도구 의도 보호 | 낮음 |
| `/tools/home-buying-budget-calculator` | 계산 코어 | DSR/LTV affordability core | UNCHANGED | 기존 계산 결과 보호 | 낮음 |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | title/H1 | DSR 40% 연봉별 대출 한도표 \| 연봉별 주담대 한도·대출 가능액 | UNCHANGED | 네이버 12위 의도 보호 | 낮음 |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | 표/계산 가정 | 금리 4%, 30년 원리금균등, DSR 40% | UNCHANGED | 기존 샘플 결과 보호 | 낮음 |

## 12. Internal Link and CTA Changes

| Source | Added/Confirmed Target | Purpose |
|---|---|---|
| CAGR article | `/tools/cagr-calculator` | 시작금액·최종금액·기간 기반 CAGR 계산 |
| CAGR article | `/tools/dca-calculator` | 추가 납입이 있는 적립식 투자 보조 확인 |
| HomeBuying calculator | `/tools/dsr-ltv-calculator` | 소득·집값 기준 대출 가능 한도 점검 |
| HomeBuying calculator | `/tools/mortgage-loan-calculator` | 대출금액 기준 월상환액·총이자 점검 |
| HomeBuying calculator | `/market/real-estate/seoul-top100`, `/market/real-estate/magok-top100`, `/market/real-estate/gangnam3-top100` | 후보 지역 실거래 가격 비교 |
| DSR income article | `/tools/dsr-ltv-calculator` | 연소득·기존부채 조건 재계산 |
| DSR income article | `/tools/mortgage-loan-calculator` | 대출금액별 월상환액과 총이자 확인 |
| DSR income article | `/tools/home-buying-budget-calculator` | 보유 현금 기준 구매 가능성 점검 |
| DSR income article | `/market/real-estate` | 실거래 대시보드 연결 |

## 13. GA4 Event Review

유지 확인 이벤트:

- `post_to_dsr_ltv_click`
- `related_calculator_click`
- `tool_result_cta_view`
- `tool_result_cta_click`
- `tool_result_action`
- `dsr_to_real_estate_click`
- `real_estate_to_dsr_click`
- `home_buying_calculate`
- `dsr_ltv_calculate`
- `mortgage_payment_calculate`
- `tool_calculate`

신규 CTA는 기존 포스트 CTA 패턴의 `related_calculator_click` 또는 기존 `post_to_dsr_ltv_click` 흐름을 사용했다. 이벤트 이름이나 파라미터 구조는 변경하지 않았다.

## 14. Metadata and Structured Data

- 3개 대상 URL 모두 canonical self 확인 완료.
- 3개 대상 URL 모두 `noindex` 없음.
- 3개 대상 URL 모두 sitemap 포함 확인 완료.
- CAGR 글은 수동 Article JSON-LD를 제거해 렌더러 생성 BlogPosting 1개만 남도록 정리했다.
- DSR 글은 FAQPage JSON-LD 1개와 visible FAQ 6개가 동기화됨을 확인했다.

## 15. Mobile Verification

전용 검증 스크립트에서 320px/390px 모바일 viewport를 확인했다.

| URL | 320px overflow | 390px overflow | Page/Hydration error |
|---|---:|---:|---:|
| `/posts/personalFinance/what-is-cagr` | 없음 | 없음 | 없음 |
| `/tools/home-buying-budget-calculator` | 없음 | 없음 | 없음 |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | 없음 | 없음 | 없음 |

## 16. Calculation Regression

`lib/calculators/dsrLtv.js` 샘플 회귀 확인:

- DSR loan capacity: 418,922,481원
- Monthly payment capacity: 2,000,000원
- Final affordable price: 571,428,571원
- Bottleneck: `CASH_LTV`

기존 DSR/LTV, HomeBuying 계산 결과를 변경하지 않았다.

## 17. Rendered HTML Verification

`node scripts\verify_search_growth_p1_1b_ko_expansion.js --base-url=http://127.0.0.1:8002` 결과:

- 134/134 checks passed
- 대상 3개 URL HTTP 200
- canonical self
- meta/x-robots noindex 없음
- sitemap 포함
- H1 1개 및 기존 H1 유지
- 필수 CTA/link 렌더링 확인
- FAQ/Article JSON-LD 중복 및 동기화 확인

참고: 로컬 dev 서버에서 DB 의존 Top100 상세 경로(`/market/real-estate/seoul-top100`, `/market/real-estate/magok-top100`, `/market/real-estate/gangnam3-top100`)는 DB 연결 상태에 따라 500을 반환할 수 있어, 전용 검증 스크립트에서는 링크 렌더링과 sitemap 포함을 확인하고 local DB 500은 허용 처리했다. 이번 변경으로 새로 만든 경로가 아니며 기존 내부 링크 목적지다.

## 18. Files Changed

이번 P1-1B-1 작업에서 직접 수정/추가한 파일:

- `content/posts/personalFinance/ko/what-is-cagr.md`
- `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md`
- `pages/tools/home-buying-budget-calculator.js`
- `scripts/verify_search_growth_p1_1b_ko_expansion.js`
- `reports/search-growth-90d-p1-1b-1-ko-naver-low-risk-expansion.md`

검증 명령으로 갱신된 산출물:

- `reports/posts.linkcheck.json`
- `reports/search-growth-90d-p0-2a-snippet-hygiene-rendered.json`
- `reports/seo-channel-split-url-check.md`
- `reports/search-growth-90d-url-inventory.csv`
- `reports/search-growth-90d-audit-data.json`
- `public/sitemap-0.xml`
- `public/sitemap-ko.xml`
- `public/sitemap-en.xml`
- `public/en/sitemap.xml`

## 19. Commands and Results

| Command | Result |
|---|---|
| `git status --short --untracked-files=all` | 실행 완료, 기존 dirty worktree 및 이번 변경 파일 확인 |
| `node --check scripts\verify_search_growth_p1_1b_ko_expansion.js` | PASS |
| `npm.cmd run check:posts-links` | PASS, Broken 0, Suspicious 0 |
| `node scripts\verify_tool_result_cta_events.js` | PASS |
| `npm.cmd run build` | PASS, 223 static pages, postbuild sitemap 생성 완료 |
| `node scripts\verify_search_growth_p1_1b_ko_expansion.js --base-url=http://127.0.0.1:8002` | PASS, 134/134 |
| `node scripts\verify_search_snippet_hygiene.js --base-url=http://127.0.0.1:8002` | PASS, rendered JSON 저장 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS, report 저장 |
| `node scripts\audit_search_growth_baseline.js` | PASS, URL 192개 기준선 산출 |
| `git diff --check` | PASS, trailing whitespace 없음. LF→CRLF 경고만 출력 |
| `git status --short --untracked-files=all` | 실행 완료, 기존 dirty worktree와 이번 P1-1B-1 변경/신규 파일 확인 |

`git diff --check` 최초 실행에서 `content/posts/personalFinance/ko/what-is-cagr.md`의 헤딩 줄 끝 공백 1건이 발견되어 제거했고, 재실행 결과는 통과했다.

## 20. No Functional Changes

- DSR/LTV 계산 로직 변경 없음.
- HomeBuying 계산 props 및 계산 코어 변경 없음.
- MortgageLoan 계산 로직 변경 없음.
- 광고 슬롯 구조 변경 없음.
- title/H1/slug/canonical/hreflang 보호.
- 배포, 커밋, 푸시 수행 없음.

## 21. Remaining Risks

- 네이버 검색 성과는 배포 후 크롤링/재평가 지연이 있을 수 있어 28일 이상 관찰이 필요하다.
- HomeBuying 페이지의 Top100 관련 CTA는 로컬 DB 없는 dev 환경에서 대상 동적 경로가 500이 될 수 있다. 링크 자체와 sitemap 포함은 확인했다.
- `lib/calculators/dsrLtv.js` 동적 import 시 `MODULE_TYPELESS_PACKAGE_JSON` 경고가 출력된다. 기존 패키지 설정 경고이며 이번 작업에서는 package type 변경을 하지 않았다.
- 이미 존재하던 dirty worktree와 선행 검색 성장 산출물이 많아, 배포 전에는 이번 작업 파일과 기존 작업 파일을 함께 리뷰해야 한다.

## 22. 28-Day and 6-Week Observation Plan

배포 후 28일과 6주 시점에 다음 지표를 비교한다.

- 네이버 URL별 클릭, 노출, CTR, 평균 순위
- `what-is-cagr`의 CAGR 관련 쿼리 순위 유지 여부
- `home-buying-budget-calculator`의 주담대 인접 쿼리 노출 변화
- `dsr-40-income-loan-limit-table`의 연봉별 DSR/주담대 한도 쿼리 유지 여부
- `related_calculator_click`, `post_to_dsr_ltv_click`, `tool_result_cta_click` 이벤트 흐름

## 23. Recommended Next Step

이번 변경은 배포 가능한 검증 상태다. 다음 실행은 Track A EN 실험 또는 P1-1B-2 후보를 별도 브랜치/작업 단위로 분리해 진행하는 편이 안전하다.
