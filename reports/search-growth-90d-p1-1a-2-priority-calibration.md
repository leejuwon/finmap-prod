# FinMap 검색 유입 90일 P1-1A-2 우선순위 재보정

- 기준일: 2026-07-22
- 범위: P1-1A 검색 성과 재해석, 검색엔진별 역할 분리, P1-1B 실행 대상 확정
- 실제 콘텐츠/페이지/계산기/SEO 정책 변경 없음

## 1. Executive Summary

P1-1A의 EN 후보 6개를 재검토해 Track A EN 실험 대상을 3개로 제한했습니다.
Naver TOP 30 성과는 전체 클릭의 대부분을 차지하므로 전부 HOLD로 묶지 않고, 보호 대상과 저위험 확장 대상을 분리했습니다. Track B KO Naver 확장 대상은 3개입니다.
Inventory 미매칭 URL 13개도 별도 분류했습니다.

## 2. Why Recalibration Was Needed

P1-1A의 기존 우선 후보는 Bing/GSC의 평균 순위와 노출을 중심으로 잡혀 모두 EN URL이었습니다. 그러나 실제 클릭은 Naver가 압도적으로 크기 때문에, EN 실험과 KO Naver 성장 실험을 같은 점수로 비교하면 실행 우선순위가 왜곡됩니다.

## 3. Platform Traffic Share

| Platform | Clicks | Impressions | Click Share | Impression Share |
| --- | --- | --- | --- | --- |
| gsc | 0 | 168 | 0% | 0.2% |
| naver | 623 | 83117 | 97.5% | 97.3% |
| bing | 16 | 2139 | 2.5% | 2.5% |

## 4. Current EN Candidate Review

| URL | Current Title | Current H1 | Bing C/I | Bing CTR | Bing Pos. | GSC C/I | GSC CTR | GSC Pos. | Sample | Date Modified | Inbound Links | Change Value | Change Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio | Monthly Investment Needed to Reach a Target Portfolio | Monthly Investment Needed to Reach a Target Portfolio | 0/399 | 0 | 5.35 | 0/1 | 0 | 29 | SUFFICIENT | 2026-07-22 | 2 | HIGH | LOW_TO_MEDIUM | Track A |
| /en/posts/personalFinance/annual-vs-monthly-compound | Annual vs Monthly Compounding: Which Grows Faster? | Annual vs Monthly Compounding: Which Grows Faster? | 0/145 | 0 | 8.61 | 0/5 | 0 | 9.6 | SUFFICIENT | 2026-07-22 | 5 | HIGH | LOW_TO_MEDIUM | Track A |
| /en/posts/investingInfo/dxy-dollar-index-basics | What Is DXY? Dollar Index, USD/KRW, and KOSPI Explained | What Is DXY? Dollar Index, USD/KRW, and KOSPI Explained | 0/300 | 0 | 8.32 | 0/0 |  |  | SUFFICIENT | 2026-06-19 | 15 | HIGH | LOW_TO_MEDIUM | Track A limited to max 3 |
| /en/posts/investingInfo/tnx-basics | 10-Year Treasury Yield (TNX): How It Moves Stocks, FX, and Korea | 10-Year Treasury Yield (TNX): How It Moves Stocks, FX, and Korea | 2/121 | 0.0165 | 4.92 | 0/32 | 0 | 9.84 | SUFFICIENT | 2026-05-18 | 25 | HIGH | LOW_TO_MEDIUM | Track A limited to max 3 |
| /en/posts/personalFinance/is-dca-better-in-a-bear-market | Is Dollar-Cost Averaging Better in a Bear Market? | Is Dollar-Cost Averaging Better in a Bear Market? | 0/349 | 0 | 3.88 | 0/3 | 0 | 4.67 | SUFFICIENT | 2026-07-22 | 0 | MEDIUM | LOW_TO_MEDIUM | Track A |
| /en/posts/personalFinance/dca-vs-lump-sum-when-results-differ | DCA vs Lump Sum: When Do the Results Differ? | DCA vs Lump Sum: When Do the Results Differ? | 0/40 | 0 | 5.97 | 0/1 | 0 | 9 | LIMITED | 2026-05-28 | 2 | MEDIUM | LOW_TO_MEDIUM | Track A limited to max 3 |

### EN Query Evidence

| URL | Identifiable Queries | Query Impr. | Query Pos. | Evidence Status |
| --- | --- | --- | --- | --- |
| /en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio | how much should i invest monthly for a regular investment plan? \| compounding monthly vs annually \| how much should i invest monthly for long-term regular investing? \| how much should i invest monthly for regular contributions? \| compounded monthly vs annually | 143 | 6.76 | HEURISTIC_QUERY_MATCH |
| /en/posts/personalFinance/annual-vs-monthly-compound | compounding monthly vs annually \| annual compounding vs monthly \| compounded monthly vs annually \| is compounding interest annually the same as compounding monthly \| dxy meaning in finance | 93 | 9.64 | HEURISTIC_QUERY_MATCH |
| /en/posts/investingInfo/dxy-dollar-index-basics | what is dxy \| dxy index meaning \| dxy meaning \| what is the dxy \| what is tnx | 284 | 7.43 | HEURISTIC_QUERY_MATCH |
| /en/posts/investingInfo/tnx-basics | cboe 10 year treasury yield index tnx explain what it means when it falls \| breakeven = nominal yield ? real (inflation-linked) yield \| what is dxy in stock market \| 10 year treasury yield explained \| tnx 10 | 66 | 6.03 | HEURISTIC_QUERY_MATCH |
| /en/posts/personalFinance/is-dca-better-in-a-bear-market | dollar cost averaging etf allocation monthly 2026 \| should i continue dollar-cost averaging or hold onto the investment after a 15% loss? \| why cagr better than simple average \| is dollar-cost averaging suitable for big market declines? \| semiconductor etf dollar-cost averaging price | 41 | 4.68 | HEURISTIC_QUERY_MATCH |
| /en/posts/personalFinance/dca-vs-lump-sum-when-results-differ | most important assumptions when calculating cagr \| which is better for the nasdaq 100: dca or lump sum? \| is it appropriate to start dollar-cost averaging when the valuation is at its low point? \| can stop-loss orders be used when dollar-cost averaging encounters a downturn? | 4 | 4.75 | HEURISTIC_QUERY_MATCH |

## 5. EN Sample Sufficiency

- EN 후보는 page impressions 30 이상 또는 쿼리 evidence 20 이상을 우선 기준으로 삼았습니다.
- page-query가 없으므로 쿼리와 URL 연결은 확정이 아니라 heuristic evidence입니다.
- 최종 Track A는 최대 3개로 제한했습니다.

## 6. Naver Query TOP 30 Clusters

| Cluster | Queries | Clicks | Impressions | CTR | Representative Queries | Primary URL Candidates |
| --- | --- | --- | --- | --- | --- | --- |
| 실거래가 | 13 | 102 | 5082 | 0.0201 | 마곡 집값 \| 강남 집값 순위 \| 서울 집값 순위 \| 잠실 집값 \| 서울 아파트값 순위 | /market/real-estate/gangnam-top100 \| /market/real-estate/gangnam3-top100 \| /market/real-estate/magok-top100 |
| CAGR | 6 | 96 | 17265 | 0.0056 | cagr \| 연평균 수익률 계산기 \| cagr 계산법 \| 연평균 수익률 계산 \| dca 복리 시뮬레이터 | /tools/cagr-calculator \| /en/posts/investingInfo/diagnose-investing-skill-with-cagr \| /en/posts/investingInfo/cagr-7percent-reality-check |
| 주담대 | 5 | 33 | 2209 | 0.0149 | 아파트 구매 계산기 \| 주담대 원리금 계산기 \| 주담대 dsr 계산기 \| 주택담보대출 dsr 계산기 \| 아파트 대출금 계산기 | /tools/dsr-ltv-calculator \| /tools/home-buying-budget-calculator \| /tools/mortgage-loan-calculator |
| DSR | 2 | 29 | 371 | 0.0782 | ltv dsr 계산기 \| 연소득 계산기 | /tools/dsr-ltv-calculator \| /tools/home-buying-budget-calculator \| /posts/personalFinance/cash-100m-200m-300m-apartment-budget |
| 환율·시장 | 3 | 18 | 788 | 0.0228 | 원화약세피해주 \| 물가가 오르면 금리 \| 환율상승 수혜주 | /posts/economicInfo/inflation-rate-basics \| /posts/economicInfo/war-theme-investing-price-chain-not-winners \| /posts/investingInfo/usd-krw-weak-won-sector-map-kospi |
| 아파트 구매 가능 금액 | 1 | 5 | 65 | 0.0769 | 아파트 구매 대출 계산 | /market \| /market/real-estate \| /market/real-estate/gangnam-top100 |

## 7. Naver Page TOP 30 Review

| Rank | URL | Title | H1 | Type | Clicks | Impressions | CTR | Date Modified | Topic | Related Calculator | Class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | /tools/dsr-ltv-calculator | LTV DSR 계산기 - 주택담보대출 한도와 아파트 구매 가능액 계산 | LTV DSR 계산기: 주담대 한도와 아파트 구매 가능액 계산 | tool | 118 | 34584 | 0.003 | not declared | 주담대 | /tools/mortgage-loan-calculator | NAVER_PROTECT |
| 2 | /tools/cagr-calculator | CAGR 계산기 (연평균 수익률·연복리 수익률·연평균 성장률) | CAGR 계산기 (연평균 수익률·연복리 수익률·연평균 성장률) | tool | 95 | 16270 | 0.006 | not declared | CAGR | /tools/cagr-calculator | NAVER_PROTECT |
| 3 | /posts/personalFinance/what-is-cagr | CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시 | CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시 | post | 53 | 5084 | 0.01 | 2026-07-22 | CAGR | /tools/cagr-calculator | NAVER_LOW_RISK_EXPAND |
| 4 | /market/real-estate/seoul-top100 | 서울 아파트 집값 Top 100 \| 서울 실거래 순위 | 서울 아파트 집값 TOP 100 | market | 43 | 2837 | 0.015 | not declared | 실거래가 | /market/real-estate | NAVER_PROTECT |
| 5 | /posts/investingInfo/usd-krw-weak-won-sector-map-kospi | 환율 상승 수혜주·피해주 \| 원화 약세 코스피 업종 체크 | 환율 상승 수혜주·피해주 \| 원화 약세 코스피 업종 체크 | post | 40 | 1365 | 0.029 | 2026-05-18 | 환율·시장 |  | HOLD |
| 6 | /market/real-estate/magok-top100 | 마곡 아파트 집값 TOP 100 \| 강서구 마곡동 실거래 순위 | 마곡 아파트 집값 TOP 100 | market | 40 | 1282 | 0.031 | not declared | 실거래가 | /market/real-estate | NAVER_PROTECT |
| 7 | /market/real-estate/songpa-top100 | 송파(잠실) 아파트 집값 TOP 100 \| 송파구 실거래 순위 | 송파(잠실) 아파트 집값 TOP 100 | market | 35 | 2302 | 0.015 | not declared | 실거래가 | /market/real-estate | NAVER_PROTECT |
| 8 | /market/real-estate/gangnam3-top100 | 강남3구 아파트 집값 TOP 100 \| 강남·서초·송파 실거래 순위 | 강남3구 아파트 집값 TOP 100 | market | 31 | 471 | 0.066 | not declared | 실거래가 | /market/real-estate | NAVER_PROTECT |
| 9 | /tools/dca-calculator | ETF·주식 자동 적립식 시뮬레이터 (DCA) | ETF·주식 자동 적립식 시뮬레이터 (DCA) | tool | 22 | 630 | 0.035 | not declared | DCA | /tools/dca-calculator | NAVER_PROTECT |
| 10 | /posts/economicInfo/inflation-rate-basics | 물가와 금리의 기본 이해: 왜 금리가 오르면 시장이 흔들릴까? | 물가와 금리의 기본 이해: 왜 금리가 오르면 시장이 흔들릴까? | post | 21 | 2331 | 0.009 | 2026-02-24 | 환율·시장 |  | HOLD |
| 11 | /tools/compound-interest | 복리 계산기 \| 월복리·적립식 투자 미래가치 계산 | 복리 계산기 | tool | 20 | 5298 | 0.004 | not declared | 복리 | /tools/compound-interest | NAVER_PROTECT |
| 12 | /posts/personalFinance/dsr-40-income-loan-limit-table | DSR 40% 연봉별 대출 한도표 \| 연봉별 주담대 한도·대출 가능액 | DSR 40% 연봉별 대출 한도표 \| 연봉별 주담대 한도·대출 가능액 | post | 18 | 538 | 0.033 | 2026-07-22 | 주담대 | /tools/mortgage-loan-calculator | NAVER_LOW_RISK_EXPAND |
| 13 | /market/real-estate/gangnam-top100 | 강남 아파트값 순위 TOP 100 \| 강남구 실거래 기반 | 강남 아파트값 순위 TOP 100 | market | 11 | 887 | 0.012 | not declared | 실거래가 | /market/real-estate | NAVER_PROTECT |
| 14 | /posts/personalFinance/annual-vs-monthly-compound | 연복리 vs 월복리: 목표 달성 기간이 얼마나 달라질까? | 연복리 vs 월복리: 목표 달성 기간이 얼마나 달라질까? | post | 9 | 332 | 0.027 | 2026-07-08 | 복리 | /tools/compound-interest | NAVER_LOW_RISK_EXPAND |
| 15 | /posts/personalFinance/compound-return-3-5-7-10-table | 연 3% 5% 7% 10% 복리 결과 비교표 \| 10년 20년 30년 | 연 3% 5% 7% 10% 복리 결과 비교표 \| 10년 20년 30년 | post | 9 | 84 | 0.107 | 2026-06-01 | 복리 | /tools/compound-interest | NAVER_LOW_RISK_EXPAND |
| 16 | /posts/investingInfo/usd-krw-exchange-rate-and-kospi | 원달러 환율과 코스피 관계: 외국인 수급·수출주·물가 체크법 | 원달러 환율과 코스피 관계: 외국인 수급·수출주·물가 체크법 | post | 7 | 2985 | 0.002 | 2026-05-18 | 환율·시장 |  | HOLD |
| 17 | /tools/goal-simulator | 목표자산 도달 계산기 \| 매달 얼마 투자해야 할까? | 목표자산 도달 계산기 \| 매달 얼마 투자해야 할까? | tool | 7 | 49 | 0.143 | not declared | 목표 자산 | /tools/goal-simulator | NAVER_ADJACENT_OPPORTUNITY |
| 18 | /tools/fire-calculator |  |  | tool | 6 | 118 | 0.051 | not declared | FIRE | /tools/fire-calculator | HOLD |
| 19 | /posts/investingInfo/wti-impact-on-korea-kospi | WTI 유가가 한국 경제·코스피에 미치는 영향: 물가·환율·금리·기업이익으로 이어지는 5단 연결 | WTI 유가가 한국 경제·코스피에 미치는 영향: 물가·환율·금리·기업이익으로 이어지는 5단 연결 | post | 6 | 100 | 0.06 | 2026-02-24 | 환율·시장 |  | HOLD |
| 20 | /posts/investingInfo/dxy-dollar-index-basics | DXY(달러인덱스)란 무엇인가? 투자자가 꼭 알아야 할 의미 정리 | DXY(달러인덱스)란 무엇인가? 투자자가 꼭 알아야 할 의미 정리 | post | 5 | 2575 | 0.002 | 2025-11-23 | 환율·시장 |  | HOLD |
| 21 | /market/real-estate/gyeonggi-apartment-top100 |  |  | market | 5 | 206 | 0.024 | not declared | 실거래가 | /market/real-estate | NAVER_ADJACENT_OPPORTUNITY |
| 22 | /posts/investingInfo/cagr-7percent-reality-check | 연 7% 복리 현실 체크: CAGR로 목표 자산 계산하는 법 | 연 7% 복리 현실 체크: CAGR로 목표 자산 계산하는 법 | post | 4 | 1533 | 0.003 | 2026-06-19 | CAGR | /tools/cagr-calculator | NAVER_ADJACENT_OPPORTUNITY |
| 23 | /tools | 금융 계산기 모음 | 금융 계산기·도구 | tool_hub | 4 | 142 | 0.028 | not declared | 기타 |  | HOLD |
| 24 | /market/real-estate | 서울·경기·인천 아파트 실거래 대시보드 | 서울·경기·인천 아파트 실거래 대시보드 | market | 4 | 62 | 0.065 | not declared | 실거래가 | /market/real-estate | NAVER_ADJACENT_OPPORTUNITY |
| 25 | /market/real-estate/seoul-apartment-top100 |  |  | market | 3 | 328 | 0.009 | not declared | 실거래가 | /market/real-estate | NAVER_ADJACENT_OPPORTUNITY |
| 26 | /posts/personalFinance/simple-vs-compound | 단리 vs 복리 계산: 월 30만원 투자 예시로 보는 장기 차이 | 단리 vs 복리 계산: 월 30만원 투자 예시로 보는 장기 차이 | post | 3 | 253 | 0.012 | 2026-07-08 | 복리 | /tools/compound-interest | NAVER_ADJACENT_OPPORTUNITY |
| 27 | /posts/investingInfo/bond-etf-duration-drives-returns | 채권 ETF와 듀레이션: 금리 1%p 변화가 수익률을 얼마나 흔드는가 | 채권 ETF와 듀레이션: 금리 1%p 변화가 수익률을 얼마나 흔드는가 | post | 3 | 151 | 0.02 | 2026-06-19 | CAGR | /tools/cagr-calculator | NAVER_ADJACENT_OPPORTUNITY |
| 28 | /posts/personalFinance/how-much-per-month-for-100m | 1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금 | 1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금 | post | 3 | 148 | 0.02 | 2026-07-08 | 목표 자산 | /tools/goal-simulator | NAVER_ADJACENT_OPPORTUNITY |
| 29 | /posts/personalFinance/dca-step-up-ruleset | DCA의 핵심은 ‘월 납입액 설계’다: 증액(스텝업)·감액·일시중단 조건을 운영규칙으로 만드는 법 | DCA의 핵심은 ‘월 납입액 설계’다: 증액(스텝업)·감액·일시중단 조건을 운영규칙으로 만드는 법 | post | 3 | 39 | 0.077 | 2026-02-04 | DCA | /tools/dca-calculator | NAVER_ADJACENT_OPPORTUNITY |
| 30 | /posts/investingInfo/why-check-cagr-etf | ETF CAGR 확인법: 총수익률보다 연평균 복리수익률이 중요한 이유 | ETF CAGR 확인법: 총수익률보다 연평균 복리수익률이 중요한 이유 | post | 2 | 1283 | 0.002 | 2025-11-29 | CAGR | /tools/cagr-calculator | HOLD |

## 8. NAVER_PROTECT

| URL | Class | Clicks | Impressions | Topic | Scope |
| --- | --- | --- | --- | --- | --- |
| /tools/dsr-ltv-calculator | NAVER_PROTECT | 118 | 34584 | 주담대 | avoid broad copy changes; monitor current winner |
| /tools/cagr-calculator | NAVER_PROTECT | 95 | 16270 | CAGR | avoid broad copy changes; monitor current winner |
| /market/real-estate/seoul-top100 | NAVER_PROTECT | 43 | 2837 | 실거래가 | avoid broad copy changes; monitor current winner |
| /market/real-estate/magok-top100 | NAVER_PROTECT | 40 | 1282 | 실거래가 | avoid broad copy changes; monitor current winner |
| /market/real-estate/songpa-top100 | NAVER_PROTECT | 35 | 2302 | 실거래가 | avoid broad copy changes; monitor current winner |
| /market/real-estate/gangnam3-top100 | NAVER_PROTECT | 31 | 471 | 실거래가 | avoid broad copy changes; monitor current winner |
| /tools/dca-calculator | NAVER_PROTECT | 22 | 630 | DCA | avoid broad copy changes; monitor current winner |
| /tools/compound-interest | NAVER_PROTECT | 20 | 5298 | 복리 | avoid broad copy changes; monitor current winner |
| /market/real-estate/gangnam-top100 | NAVER_PROTECT | 11 | 887 | 실거래가 | avoid broad copy changes; monitor current winner |

## 9. NAVER_LOW_RISK_EXPAND

| URL | Class | Clicks | Impressions | Topic | Scope |
| --- | --- | --- | --- | --- | --- |
| /posts/personalFinance/what-is-cagr | NAVER_LOW_RISK_EXPAND | 53 | 5084 | CAGR | preserve title/H1; consider answer summary, concrete examples, calculator CTA, and lower-risk internal support |
| /posts/personalFinance/dsr-40-income-loan-limit-table | NAVER_LOW_RISK_EXPAND | 18 | 538 | 주담대 | preserve title/H1; consider answer summary, concrete examples, calculator CTA, and lower-risk internal support |
| /posts/personalFinance/annual-vs-monthly-compound | NAVER_LOW_RISK_EXPAND | 9 | 332 | 복리 | preserve title/H1; consider answer summary, concrete examples, calculator CTA, and lower-risk internal support |
| /posts/personalFinance/compound-return-3-5-7-10-table | NAVER_LOW_RISK_EXPAND | 9 | 84 | 복리 | preserve title/H1; consider answer summary, concrete examples, calculator CTA, and lower-risk internal support |

## 10. NAVER_ADJACENT_OPPORTUNITY

| URL | Class | Clicks | Impressions | Topic | Scope |
| --- | --- | --- | --- | --- | --- |
| /tools/home-buying-budget-calculator | NAVER_ADJACENT_OPPORTUNITY | 33 | 2209 | 주담대 | align answer summary, calculator CTA, and supporting examples without keyword repetition |

## 11. Inventory Unmatched URLs

| Classification | Count |
| --- | --- |
| APARTMENT_DETAIL_DYNAMIC_ROUTE | 9 |
| INVENTORY_SCOPE_GAP | 4 |

Full original URLs are kept in `reports/search-growth-90d-p1-1a-2-unmatched-urls.csv`.

| Normalized URL | Platform | Clicks/Impr. | HTTP/Route Status | Sitemap | Class | Script Update | Content Action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /en/market/real-estate/apt/11710\|\|가락동\|대림 | gsc | 0/66 | DYNAMIC_ROUTE_NOT_FETCHED | false | APARTMENT_DETAIL_DYNAMIC_ROUTE | no | no |
| / | bing | 0/3 | EXPECTED_200_FROM_SITEMAP | true | INVENTORY_SCOPE_GAP | review_inventory_scope | no |
| /market/real-estate/apt/41360\|\|별내면 청학리\|청학주공(7단지) | bing | 0/2 | DYNAMIC_ROUTE_NOT_FETCHED | false | APARTMENT_DETAIL_DYNAMIC_ROUTE | no | no |
| /en/about | bing | 0/2 | EXPECTED_200_FROM_SITEMAP | true | INVENTORY_SCOPE_GAP | review_inventory_scope | no |
| /en/market/real-estate/songpa-gangnam-top100 | gsc | 0/2 | EXPECTED_200_FROM_SITEMAP | true | INVENTORY_SCOPE_GAP | review_inventory_scope | no |
| /en/market/real-estate/apt/11170\|\|산천동\|리버힐삼성 | gsc | 0/2 | DYNAMIC_ROUTE_NOT_FETCHED | false | APARTMENT_DETAIL_DYNAMIC_ROUTE | no | no |
| /en/market/real-estate/apt/11710\|\|거여동\|쌍용스윗닷홈2차 | gsc | 0/2 | DYNAMIC_ROUTE_NOT_FETCHED | false | APARTMENT_DETAIL_DYNAMIC_ROUTE | no | no |
| /market/real-estate/apt/41630\|\|고암동\|주원마을(주공2단지) | bing | 0/1 | DYNAMIC_ROUTE_NOT_FETCHED | false | APARTMENT_DETAIL_DYNAMIC_ROUTE | no | no |
| /market/real-estate/apt/41280\|덕양구\|화정동\|옥빛마을(주공)15 | bing | 0/1 | DYNAMIC_ROUTE_NOT_FETCHED | false | APARTMENT_DETAIL_DYNAMIC_ROUTE | no | no |
| /market/real-estate/apt/41280\|덕양구\|화정동\|달빛마을(부영)2 | bing | 0/1 | DYNAMIC_ROUTE_NOT_FETCHED | false | APARTMENT_DETAIL_DYNAMIC_ROUTE | no | no |
| /market/real-estate/apt/41190\|원미구\|상동\|반달마을(극동신라) | bing | 0/1 | DYNAMIC_ROUTE_NOT_FETCHED | false | APARTMENT_DETAIL_DYNAMIC_ROUTE | no | no |
| /en/market/real-estate/songpa-gangnam-top100 | bing | 0/1 | EXPECTED_200_FROM_SITEMAP | true | INVENTORY_SCOPE_GAP | review_inventory_scope | no |
| /en/market/real-estate/apt/11500\|\|등촌동\|태영 | gsc | 0/1 | DYNAMIC_ROUTE_NOT_FETCHED | false | APARTMENT_DETAIL_DYNAMIC_ROUTE | no | no |

## 12. Track A EN Experiment Targets

| URL | Bing C/I | GSC C/I | Query Evidence | Sample | Change Value | Change Risk | Recommended Scope |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio | 0/399 | 0/1 | how much should i invest monthly for a regular investment plan? \| compounding monthly vs annually \| how much should i invest monthly for long-term regular investing? \| how much should i invest monthly for regular contributions? \| compounded monthly vs annually | SUFFICIENT | HIGH | LOW_TO_MEDIUM | title/description/first paragraph/answer summary |
| /en/posts/personalFinance/annual-vs-monthly-compound | 0/145 | 0/5 | compounding monthly vs annually \| annual compounding vs monthly \| compounded monthly vs annually \| is compounding interest annually the same as compounding monthly \| dxy meaning in finance | SUFFICIENT | HIGH | LOW_TO_MEDIUM | title/description/first paragraph/answer summary |
| /en/posts/personalFinance/is-dca-better-in-a-bear-market | 0/349 | 0/3 | dollar cost averaging etf allocation monthly 2026 \| should i continue dollar-cost averaging or hold onto the investment after a 15% loss? \| why cagr better than simple average \| is dollar-cost averaging suitable for big market declines? \| semiconductor etf dollar-cost averaging price | SUFFICIENT | MEDIUM | LOW_TO_MEDIUM | title/description/first paragraph/answer summary |

## 13. Track B KO Naver Expansion Targets

| URL | Current Title | Class | Rank | Clicks | Impressions | Topic | Date Modified | Related Calculator | Protect Elements | Low-risk Scope |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /posts/personalFinance/what-is-cagr | CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시 | NAVER_LOW_RISK_EXPAND | 3 | 53 | 5084 | CAGR | 2026-07-22 | /tools/cagr-calculator | preserve title/H1 and current ranking intent | preserve title/H1; consider answer summary, concrete examples, calculator CTA, and lower-risk internal support |
| /tools/home-buying-budget-calculator | 아파트 구매 계산기 - 보유 현금·주담대 한도·DSR LTV 예산 계산 | NAVER_ADJACENT_OPPORTUNITY |  | 33 | 2209 | 주담대 | not declared | /tools/mortgage-loan-calculator | no current Naver page winner to rewrite; keep target URL role clear | align answer summary, calculator CTA, and supporting examples without keyword repetition |
| /posts/personalFinance/dsr-40-income-loan-limit-table | DSR 40% 연봉별 대출 한도표 \| 연봉별 주담대 한도·대출 가능액 | NAVER_LOW_RISK_EXPAND | 12 | 18 | 538 | 주담대 | 2026-07-22 | /tools/mortgage-loan-calculator | preserve title/H1 and current ranking intent | preserve title/H1; consider answer summary, concrete examples, calculator CTA, and lower-risk internal support |

## 14. HOLD

| URL | Class | Clicks | Impressions | Topic | Scope |
| --- | --- | --- | --- | --- | --- |
| /tools/dsr-ltv-calculator | NAVER_PROTECT | 118 | 34584 | 주담대 | avoid broad copy changes; monitor current winner |
| /tools/cagr-calculator | NAVER_PROTECT | 95 | 16270 | CAGR | avoid broad copy changes; monitor current winner |
| /market/real-estate/seoul-top100 | NAVER_PROTECT | 43 | 2837 | 실거래가 | avoid broad copy changes; monitor current winner |
| /posts/investingInfo/usd-krw-weak-won-sector-map-kospi | HOLD | 40 | 1365 | 환율·시장 | observe only |
| /market/real-estate/magok-top100 | NAVER_PROTECT | 40 | 1282 | 실거래가 | avoid broad copy changes; monitor current winner |
| /market/real-estate/songpa-top100 | NAVER_PROTECT | 35 | 2302 | 실거래가 | avoid broad copy changes; monitor current winner |
| /market/real-estate/gangnam3-top100 | NAVER_PROTECT | 31 | 471 | 실거래가 | avoid broad copy changes; monitor current winner |
| /tools/dca-calculator | NAVER_PROTECT | 22 | 630 | DCA | avoid broad copy changes; monitor current winner |
| /posts/economicInfo/inflation-rate-basics | HOLD | 21 | 2331 | 환율·시장 | observe only |
| /tools/compound-interest | NAVER_PROTECT | 20 | 5298 | 복리 | avoid broad copy changes; monitor current winner |
| /market/real-estate/gangnam-top100 | NAVER_PROTECT | 11 | 887 | 실거래가 | avoid broad copy changes; monitor current winner |
| /posts/investingInfo/usd-krw-exchange-rate-and-kospi | HOLD | 7 | 2985 | 환율·시장 | observe only |
| /tools/fire-calculator | HOLD | 6 | 118 | FIRE | observe only |
| /posts/investingInfo/wti-impact-on-korea-kospi | HOLD | 6 | 100 | 환율·시장 | observe only |
| /posts/investingInfo/dxy-dollar-index-basics | HOLD | 5 | 2575 | 환율·시장 | observe only |
| /tools | HOLD | 4 | 142 | 기타 | observe only |
| /posts/investingInfo/why-check-cagr-etf | HOLD | 2 | 1283 | CAGR | observe only |

## 15. NO_ACTION

| URL | Reason |
| --- | --- |
| /en/posts/investingInfo/dxy-dollar-index-basics | Track A limited to max 3 |
| /en/posts/investingInfo/tnx-basics | Track A limited to max 3 |
| /en/posts/personalFinance/dca-vs-lump-sum-when-results-differ | Track A limited to max 3 |

## 16. Recommended Execution Order

1. Track A EN 2-3개를 먼저 실험하고 최소 28일 관찰합니다.
2. 배포/색인 반영 뒤 Bing/GSC impressions, CTR, clicks를 비교합니다.
3. Track B KO Naver 확장은 기존 title/H1 보호 원칙으로 별도 배치에서 진행합니다.
4. Naver winner URL은 광범위한 rewrite보다 answer summary, calculator CTA, 관련 예시처럼 작은 변경만 검토합니다.

## 17. Risks and Data Limitations

- Naver TOP 30은 전체 데이터가 아니라 클릭 상위 30개입니다.
- GSC/Bing page-query 데이터가 없어 특정 쿼리의 대표 URL은 확정하지 않았습니다.
- Bing 표본은 EN 실험 신호로만 사용하고, Naver 클릭과 같은 가중치로 보지 않았습니다.
- unmatched URL의 HTTP 상태는 로컬 route/sitemap 범위로 추정했으며 production fetch를 수행하지 않았습니다.

## 18. Files Created

- `reports/search-growth-90d-p1-1a-2-priority-calibration.md`
- `reports/search-growth-90d-p1-1a-2-priority-calibration.json`
- `reports/search-growth-90d-p1-1a-2-unmatched-urls.csv`
- `reports/search-growth-90d-p1-1a-2-naver-query-clusters.csv`
- `reports/search-growth-90d-p1-1a-2-execution-targets.json`

## 19. Verification

- `node scripts\analyze_search_performance_inputs.js`: PASS

## 20. No Content Changes

No title, description, H1, first paragraph, body, internal link, calculator, GA4, ad, canonical, hreflang, robots, sitemap, slug, or redirect changes were made.

## 21. Local-only Confirmation

- Production server changes: none
- Deployment: none
- Commit: none
- Push: none

## 22. Recommended P1-1B Scope

Track A는 EN 실험으로, Track B는 KO Naver 저위험 확장으로 분리해서 진행하는 것이 좋습니다. 두 트랙을 한 번에 모두 수정하지 말고, 변경일과 관찰 기간을 URL별로 기록하세요.
