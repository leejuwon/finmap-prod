# FinMap KO Post Cannibalization / Query Ownership Boundary Audit

Generated: 2026-09-17T00:17:45.186Z

## Final Verdict

Final Verdict: CANNIBALIZATION_AUDIT_COMPLETE_WITH_REVIEW_ITEMS

This is an audit/design-only Step 3 output. No post content, frontmatter, title, description, tags, headings, internal links, schema, sitemap, canonical, hreflang, page component, or runtime code was changed.

## Summary

- Step 2 conflict candidates reviewed: 87
- structural query ownership risk candidates: 8
- normal relationship / false-positive candidates: 79
- ownership matrix rows: 79
- exact internal anchor collisions: 0

## Step 2 Conflict Reduction

- Step 2 candidates: 87
- TRUE_CANNIBALIZATION: 1
- QUERY_BOUNDARY_WEAK: 7
- PARENT_CHILD_RELATION: 10
- COMPLEMENTARY_DOCUMENTS: 25
- SCENARIO_VARIANTS: 12
- DEFINITION_VS_IMPACT: 5
- HUB_SPOKE_RELATION: 14
- CALCULATOR_GUIDE_VS_INFORMATIONAL: 10
- NO_MEANINGFUL_CONFLICT: 3

## A. TRUE CANNIBALIZATION CANDIDATES

| Evidence | Pair | Owner | Supporting Role | Leakage | Boundary Signals | Recommendation |
|---|---|---|---|---|---|---|
| CONFIRMED_STRUCTURAL | personalFinance/how-much-monthly-invest-for-100m <-> personalFinance/how-much-per-month-for-100m | personalFinance/how-much-monthly-invest-for-100m | 질문형 phrase를 보완하는 supporting document 후보 | A->B MEDIUM, B->A NONE | TITLE_BOUNDARY:WEAK, DESCRIPTION_BOUNDARY:WEAK, INTRO_BOUNDARY:WEAK, H2_BOUNDARY:WEAK, FAQ_BOUNDARY:WEAK, ANCHOR_BOUNDARY:PARTIAL | MERGE_REVIEW_REQUIRED |

## B. QUERY BOUNDARY WEAK CANDIDATES

| Evidence | Pair | Owner | Supporting Role | Leakage | Boundary Signals | Recommendation |
|---|---|---|---|---|---|---|
| LIKELY_STRUCTURAL | economicInfo/geopolitics-oil-fx-dashboard <-> economicInfo/geopolitics-to-usd-liquidity-fx | economicInfo/geopolitics-oil-fx-dashboard | 달러 유동성과 환율 전이 경로를 좁게 보완 | A->B LOW, B->A LOW | TITLE_BOUNDARY:WEAK, DESCRIPTION_BOUNDARY:PARTIAL, INTRO_BOUNDARY:PARTIAL, H2_BOUNDARY:PARTIAL, FAQ_BOUNDARY:PARTIAL, ANCHOR_BOUNDARY:PARTIAL | CLARIFY_QUERY_BOUNDARY |
| LIKELY_STRUCTURAL | economicInfo/hormuz-risk-oil-insurance-freight-premium <-> economicInfo/war-risk-oil-supply-insurance-shipping | economicInfo/hormuz-risk-oil-insurance-freight-premium | 전쟁이라는 넓은 지정학 shock과 원유 공급 chain을 설명 | A->B MEDIUM, B->A LOW | TITLE_BOUNDARY:PARTIAL, DESCRIPTION_BOUNDARY:PARTIAL, INTRO_BOUNDARY:WEAK, H2_BOUNDARY:WEAK, FAQ_BOUNDARY:WEAK, ANCHOR_BOUNDARY:PARTIAL | CLARIFY_QUERY_BOUNDARY |
| LIKELY_STRUCTURAL | economicInfo/inflation-basics <-> economicInfo/inflation-rate-basics | economicInfo/inflation-basics | 물가상승률, CPI 측정과 지표 해석을 담당 | A->B NONE, B->A LOW | TITLE_BOUNDARY:PARTIAL, DESCRIPTION_BOUNDARY:PARTIAL, INTRO_BOUNDARY:WEAK, H2_BOUNDARY:PARTIAL, FAQ_BOUNDARY:WEAK, ANCHOR_BOUNDARY:PARTIAL | CLARIFY_QUERY_BOUNDARY |
| POSSIBLE | economicInfo/oil-shock-to-usdkrw-korea-transmission <-> investingInfo/wti-impact-on-korea-kospi | investingInfo/wti-impact-on-korea-kospi | 유가 shock이 원달러 환율과 한국 macro로 전이되는 경로 | A->B HIGH, B->A LOW | TITLE_BOUNDARY:WEAK, DESCRIPTION_BOUNDARY:PARTIAL, INTRO_BOUNDARY:PARTIAL, H2_BOUNDARY:PARTIAL, FAQ_BOUNDARY:PARTIAL, ANCHOR_BOUNDARY:WEAK | CLARIFY_QUERY_BOUNDARY |
| POSSIBLE | investingInfo/etf-impact-of-tnx <-> investingInfo/us10y-impact-on-korea-and-stock-market | investingInfo/us10y-impact-on-korea-and-stock-market | ETF 가격 반응이라는 하위 자산군 관점 | A->B LOW, B->A MEDIUM | TITLE_BOUNDARY:WEAK, DESCRIPTION_BOUNDARY:PARTIAL, INTRO_BOUNDARY:PARTIAL, H2_BOUNDARY:PARTIAL, FAQ_BOUNDARY:PARTIAL, ANCHOR_BOUNDARY:PARTIAL | CLARIFY_QUERY_BOUNDARY |
| LIKELY_STRUCTURAL | personalFinance/dca-vs-lumpsum-decision-rules <-> personalFinance/dca-vs-lump-sum-when-results-differ | personalFinance/dca-vs-lumpsum-decision-rules | 수익 결과와 scenario 차이가 왜 발생하는지 설명 | A->B MEDIUM, B->A LOW | TITLE_BOUNDARY:PARTIAL, DESCRIPTION_BOUNDARY:PARTIAL, H2_BOUNDARY:WEAK, FAQ_BOUNDARY:PARTIAL | CLARIFY_QUERY_BOUNDARY |
| LIKELY_STRUCTURAL | personalFinance/personal-finance-3pillars <-> personalFinance/personal-start-5steps | personalFinance/personal-start-5steps | 예산, 비상금, 장기투자라는 framework를 설명 | A->B NONE, B->A NONE | TITLE_BOUNDARY:WEAK, DESCRIPTION_BOUNDARY:WEAK, INTRO_BOUNDARY:WEAK, H2_BOUNDARY:WEAK, FAQ_BOUNDARY:WEAK, ANCHOR_BOUNDARY:WEAK | CLARIFY_QUERY_BOUNDARY |

## C. NORMAL CONTENT RELATIONSHIPS

| Classification | Count | Meaning |
|---|---:|---|
| PARENT_CHILD_RELATION | 10 | Broader owner and narrower scenario/data child. |
| COMPLEMENTARY_DOCUMENTS | 25 | Same broad topic, different user question. |
| SCENARIO_VARIANTS | 12 | Different numeric condition, period, market state, or scenario. |
| DEFINITION_VS_IMPACT | 5 | Definition/basic concept versus impact/application. |
| HUB_SPOKE_RELATION | 14 | Core/overview and spoke relationship. |
| CALCULATOR_GUIDE_VS_INFORMATIONAL | 10 | Tool guide versus informational or table document. |
| NO_MEANINGFUL_CONFLICT | 3 | Lexical overlap only; structural risk not supported. |

## D. QUERY OWNERSHIP MATRIX

| Query | Owner | Confidence | Status | Supporting URLs | Topic |
|---|---|---|---|---|---|
| 러시아 가스 중단 유럽 물가 영향 | economicInfo/eu-russia-gas-phaseout-price-channel | MEDIUM | OWNER_ASSIGNED | - | OIL_ENERGY / 유럽 가스 공급과 가격 전이 |
| 환율 뜻 | economicInfo/fx-basics | HIGH | OWNER_ASSIGNED | - | FX / 환율 기초 |
| 지정학 리스크 유가 환율 영향 | economicInfo/geopolitics-oil-fx-dashboard | HIGH | REVIEW_REQUIRED | economicInfo/geopolitics-to-usd-liquidity-fx | GEOPOLITICS / 지정학 리스크 대시보드 해석 |
| 지정학 리스크 달러 환율 | economicInfo/geopolitics-to-usd-liquidity-fx | MEDIUM | REVIEW_REQUIRED | - | FX / 위험회피와 달러 유동성 |
| 금 가격 지정학 실질금리 달러 | economicInfo/gold-geopolitics-real-rates-dollar-uncertainty | MEDIUM | OWNER_ASSIGNED | - | ASSET_ALLOCATION / 금 가격 요인 |
| 중동 원유 운송 리스크 | economicInfo/hormuz-risk-oil-insurance-freight-premium | HIGH | REVIEW_REQUIRED | economicInfo/war-risk-oil-supply-insurance-shipping | OIL_ENERGY / 호르무즈 운송, 보험료, 운임 프리미엄 |
| 경제지표 보는 법 | economicInfo/indicator-basics | MEDIUM | OWNER_ASSIGNED | - | MACRO_INDICATORS / 경제지표 입문 |
| 인플레이션 뜻 | economicInfo/inflation-basics | HIGH | REVIEW_REQUIRED | economicInfo/inflation-rate-basics | INFLATION / 인플레이션 기초 |
| 물가상승률 뜻 | economicInfo/inflation-rate-basics | LOW | REVIEW_REQUIRED | - | INFLATION / 물가상승률과 CPI |
| 금리 뜻 | economicInfo/interest-rate-basics | HIGH | OWNER_ASSIGNED | - | INTEREST_RATES / 금리 기초 |
| 유가 상승 원달러 환율 영향 | economicInfo/oil-shock-to-usdkrw-korea-transmission | MEDIUM | REVIEW_REQUIRED | - | OIL_ENERGY / 유가 shock의 한국 전이 |
| 기준금리 인하 시장금리 영향 | economicInfo/policy-rate-cut-market-rates | MEDIUM | OWNER_ASSIGNED | - | INTEREST_RATES / 정책금리와 시장금리 전이 |
| 실질금리 기대인플레이션 | economicInfo/real-rates-and-breakevens | HIGH | OWNER_ASSIGNED | - | INTEREST_RATES / 실질금리와 BEI |
| 관세 인상 경제 영향 | economicInfo/tariffs-growth-margins-fx-package-shock | MEDIUM | OWNER_ASSIGNED | - | GEOPOLITICS / 관세 shock와 성장, 마진, 환율 |
| 전쟁 유가 영향 | economicInfo/war-risk-oil-supply-insurance-shipping | HIGH | REVIEW_REQUIRED | - | GEOPOLITICS / 전쟁 리스크와 원유 가격 chain |
| 전쟁 테마주 투자 리스크 | economicInfo/war-theme-investing-price-chain-not-winners | MEDIUM | OWNER_ASSIGNED | - | GEOPOLITICS / 전쟁 테마 투자 판단 |
| 장단기 금리차 경기침체 신호 | economicInfo/yield-curve-2s10s-3m10y-recession-reading | MEDIUM | OWNER_ASSIGNED | - | INTEREST_RATES / 수익률 곡선과 recession signal |
| 채권 ETF 듀레이션 수익률 | investingInfo/bond-etf-duration-drives-returns | HIGH | OWNER_ASSIGNED | - | ETF / 채권 ETF와 duration |
| 연 7% 수익률 현실성 | investingInfo/cagr-7percent-reality-check | MEDIUM | OWNER_ASSIGNED | - | CAGR / 목표 수익률 현실성 |
| 적립식 투자 실패 패턴 | investingInfo/dca-consistency-7-fail-patterns | HIGH | OWNER_ASSIGNED | - | DCA / 적립식 투자 실행 실패 |
| CAGR로 투자 성과 평가 | investingInfo/diagnose-investing-skill-with-cagr | MEDIUM | OWNER_ASSIGNED | - | CAGR / 투자 성과 진단 |
| 달러인덱스 뜻 | investingInfo/dxy-dollar-index-basics | HIGH | OWNER_ASSIGNED | - | DXY / 달러인덱스 기초 |
| 달러인덱스 주식시장 영향 | investingInfo/dxy-market-impact | MEDIUM | OWNER_ASSIGNED | - | DXY / DXY와 자산시장 영향 |
| 미국 10년물 금리 ETF 영향 | investingInfo/etf-impact-of-tnx | MEDIUM | REVIEW_REQUIRED | investingInfo/korea-etf-deep-dive-tnx | ETF / TNX와 ETF 가격 반응 |
| 환헤지 환노출 선택 기준 | investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions | MEDIUM | OWNER_ASSIGNED | - | FX / 환헤지와 환노출 선택 |
| 투자 지표 보는 법 | investingInfo/indicator-marketinfo | MEDIUM | OWNER_ASSIGNED | - | MACRO_INDICATORS / 투자용 시장지표 |
| 국내 ETF 미국 10년물 금리 영향 | investingInfo/korea-etf-deep-dive-tnx | MEDIUM | OWNER_ASSIGNED | - | ETF / 국내 ETF와 TNX 민감도 |
| 60대40 포트폴리오 리스크 관리 | investingInfo/modern-6040-risk-budget | MEDIUM | OWNER_ASSIGNED | - | ASSET_ALLOCATION / 60/40와 risk budget |
| 금리 아파트 가격 영향 | investingInfo/rates-discount-mortgage-demand-apt-prices | HIGH | OWNER_ASSIGNED | - | REAL_ESTATE_DATA / 금리와 아파트 가격 |
| 부동산 포트폴리오 비중 | investingInfo/real-estate-role-in-portfolio-risk-budget | MEDIUM | OWNER_ASSIGNED | - | ASSET_ALLOCATION / 부동산의 포트폴리오 역할 |
| 수도권 부동산 리스크 관리 | investingInfo/seoul-gyeonggi-incheon-risk-budget-framework | MEDIUM | OWNER_ASSIGNED | - | REAL_ESTATE_DATA / 수도권 지역별 risk budget |
| S&P500 코스피 영향 | investingInfo/sp500-impact-on-korea-kospi | HIGH | OWNER_ASSIGNED | - | KOSPI_GLOBAL_LINK / S&P500과 코스피 연결 |
| 미국 10년물 국채금리 뜻 | investingInfo/tnx-basics | HIGH | OWNER_ASSIGNED | - | TNX / 미국 10년물 금리 기초 |
| 미국 10년물 금리 한국 증시 영향 | investingInfo/us10y-impact-on-korea-and-stock-market | HIGH | REVIEW_REQUIRED | investingInfo/etf-impact-of-tnx | TNX / TNX와 한국 증시 |
| 원달러 환율 코스피 영향 | investingInfo/usd-krw-exchange-rate-and-kospi | HIGH | OWNER_ASSIGNED | investingInfo/usd-krw-weak-won-sector-map-kospi | KOSPI_GLOBAL_LINK / 환율과 코스피 |
| 원화 약세 수혜 업종 | investingInfo/usd-krw-weak-won-sector-map-kospi | HIGH | OWNER_ASSIGNED | - | KOSPI_GLOBAL_LINK / 원화 약세와 업종 지도 |
| ETF 투자 CAGR 확인 이유 | investingInfo/why-check-cagr-etf | HIGH | OWNER_ASSIGNED | - | CAGR / ETF 성과와 CAGR |
| WTI 유가 코스피 영향 | investingInfo/wti-impact-on-korea-kospi | HIGH | REVIEW_REQUIRED | economicInfo/oil-shock-to-usdkrw-korea-transmission | OIL_ENERGY / WTI와 한국 증시 |
| 연복리 월복리 차이 | personalFinance/annual-vs-monthly-compound | MEDIUM | OWNER_ASSIGNED | - | COMPOUND_INTEREST / 복리 주기 비교 |
| 아파트 구매 계산기 사용법 | personalFinance/apartment-buying-calculator-guide | HIGH | OWNER_ASSIGNED | - | REAL_ESTATE_BUDGET / 아파트 구매 계산기 |
| 아파트 매수 비용 | personalFinance/apartment-buying-costs-before-purchase | HIGH | OWNER_ASSIGNED | - | REAL_ESTATE_BUDGET / 매수 전 부대비용 |
| 아파트 거래량 감소 의미 | personalFinance/apartment-transaction-volume-decline-meaning | HIGH | OWNER_ASSIGNED | - | REAL_ESTATE_DATA / 거래량 해석 |
| 아파트 시세 대시보드 활용법 | personalFinance/apt-dashboard-home-goal-roadmap | MEDIUM | OWNER_ASSIGNED | - | REAL_ESTATE_DATA / FinMap 아파트 대시보드 활용 |
| 현금 1억 2억 3억 아파트 예산 | personalFinance/cash-100m-200m-300m-apartment-budget | HIGH | OWNER_ASSIGNED | - | REAL_ESTATE_BUDGET / 보유현금별 매수 예산 |
| 복리 계산기 사용법 | personalFinance/compound-calculator-guide | HIGH | OWNER_ASSIGNED | - | COMPOUND_INTEREST / 복리 계산기 |
| 복리 수익률 기간별 결과 | personalFinance/compound-return-3-5-7-10-table | MEDIUM | OWNER_ASSIGNED | - | COMPOUND_INTEREST / 수익률별 복리표 |
| 적립식 투자 환율 변동성 영향 | personalFinance/dca-fx-volatility-decomposition | MEDIUM | OWNER_ASSIGNED | - | DCA / DCA와 FX 변동성 |
| 적립식 투자 증액 전략 | personalFinance/dca-step-up-ruleset | MEDIUM | OWNER_ASSIGNED | - | DCA / 적립금 증액 규칙 |
| 적립식 투자 거치식 결과 차이 | personalFinance/dca-vs-lump-sum-when-results-differ | MEDIUM | REVIEW_REQUIRED | - | DCA / DCA와 일시금 결과 차이 |
| 적립식 투자 일시금 투자 선택 | personalFinance/dca-vs-lumpsum-decision-rules | MEDIUM | REVIEW_REQUIRED | personalFinance/dca-vs-lump-sum-when-results-differ | DCA / DCA vs lump sum decision rules |
| DSR 40 연봉별 대출한도 | personalFinance/dsr-40-income-loan-limit-table | HIGH | OWNER_ASSIGNED | personalFinance/salary-40m-mortgage-limit; personalFinance/salary-50m-dsr-40-loan-limit | DSR_LTV / 연봉별 DSR 40 한도표 |
| DSR LTV 현금 부족 | personalFinance/dsr-pass-ltv-cash-bottleneck | HIGH | OWNER_ASSIGNED | - | DSR_LTV / 대출한도와 현금 bottleneck |
| 비상금 얼마 필요 | personalFinance/emergency-fund-by-risk | MEDIUM | OWNER_ASSIGNED | - | HOUSEHOLD_FINANCE / 비상금 기준 |
| 파이어족 은퇴자금 계산 | personalFinance/fire-3-numbers-spending-horizon-withdrawal | MEDIUM | OWNER_ASSIGNED | - | FIRE / FIRE 3 numbers |
| 파이어족 계산 실수 | personalFinance/fire-assumption-errors-7-fixes | MEDIUM | OWNER_ASSIGNED | - | FIRE / FIRE assumptions review |
| 은퇴 초기 순서위험 | personalFinance/fire-sequence-risk-first-5-years | MEDIUM | OWNER_ASSIGNED | - | FIRE / Sequence risk |
| 은퇴 생활비 버킷 전략 | personalFinance/fire-spending-buckets-essential-choice-insurance | MEDIUM | OWNER_ASSIGNED | - | FIRE / 은퇴 지출 bucket |
| 생애최초 주택 구입 예산 | personalFinance/first-home-buyer-budget-calculation | HIGH | OWNER_ASSIGNED | - | REAL_ESTATE_BUDGET / 생애최초 구입 예산 |
| 목표 금액 빨리 모으는 법 | personalFinance/goal-amount-fast-strategy | HIGH | OWNER_ASSIGNED | - | HOUSEHOLD_FINANCE / 목표금액 달성 전략 |
| 고금리 대출 상환 투자 비교 | personalFinance/high-rate-debt-vs-invest-threshold-rule | MEDIUM | OWNER_ASSIGNED | - | HOUSEHOLD_FINANCE / 부채 상환 vs 투자 |
| 1억원 만들기 월 투자금 | personalFinance/how-much-monthly-invest-for-100m | MEDIUM | REVIEW_REQUIRED | personalFinance/how-much-per-month-for-100m | DCA / 1억원 목표 월납입 계산 |
| 1억 모으기 매달 얼마 | personalFinance/how-much-per-month-for-100m | MEDIUM | REVIEW_REQUIRED | - | DCA / 1억 목표 monthly question |
| 아파트 실거래가 보는 법 | personalFinance/how-to-read-apartment-transaction-prices | HIGH | OWNER_ASSIGNED | - | REAL_ESTATE_DATA / 실거래가 읽기 |
| 물가 상승 가계부 관리 | personalFinance/inflation-household-survival-strategy | HIGH | OWNER_ASSIGNED | - | HOUSEHOLD_FINANCE / 가계 인플레이션 대응 |
| 금리 1%p 대출한도 영향 | personalFinance/interest-rate-1p-loan-limit-impact | MEDIUM | OWNER_ASSIGNED | - | DSR_LTV / 금리 변화와 대출한도 |
| 하락장 적립식 투자 | personalFinance/is-dca-better-in-bear-market | HIGH | OWNER_ASSIGNED | - | DCA / 하락장 DCA decision |
| 전세에서 매매 갈아타기 현금 | personalFinance/jeonse-to-home-purchase-cash-needed | HIGH | OWNER_ASSIGNED | - | REAL_ESTATE_BUDGET / 전세에서 매매 전환 |
| 대단지 아파트 가격 안정성 | personalFinance/large-apartment-complex-households-price-stability | HIGH | OWNER_ASSIGNED | - | REAL_ESTATE_DATA / 단지 규모와 가격 안정성 |
| LTV DSR 계산기 사용법 | personalFinance/ltv-dsr-calculator-guide | HIGH | OWNER_ASSIGNED | - | DSR_LTV / LTV/DSR calculator guide |
| 월 적립식 투자 10년 결과 | personalFinance/monthly-dca-10-year-result | HIGH | OWNER_ASSIGNED | - | DCA / 10년 월투자 결과 |
| 목표금액별 월 투자금 표 | personalFinance/monthly-investment-for-100m-table | MEDIUM | OWNER_ASSIGNED | personalFinance/how-much-monthly-invest-for-100m; personalFinance/how-much-per-month-for-100m | DCA / 목표금액별 월납입 표 |
| 주담대 위험 체크리스트 | personalFinance/mortgage-risk-checklist-dsr-variable | MEDIUM | OWNER_ASSIGNED | - | DSR_LTV / 주담대 risk checklist |
| 개인 재무관리 3요소 | personalFinance/personal-finance-3pillars | LOW | REVIEW_REQUIRED | - | HOUSEHOLD_FINANCE / 개인재무 framework |
| 재테크 시작하는 법 | personalFinance/personal-start-5steps | MEDIUM | REVIEW_REQUIRED | personalFinance/personal-finance-3pillars | HOUSEHOLD_FINANCE / 재테크 시작 sequence |
| 월세 전세 매매 비교 | personalFinance/rent-jeonse-buy-cashflow-opportunity-cost | HIGH | OWNER_ASSIGNED | - | REAL_ESTATE_BUDGET / 주거 선택 cashflow 비교 |
| 연봉 4000만원 주담대 가능액 | personalFinance/salary-40m-mortgage-limit | HIGH | OWNER_ASSIGNED | - | DSR_LTV / 연봉 4000만원 주담대 scenario |
| 연봉 5000만원 DSR 40 대출 가능액 | personalFinance/salary-50m-dsr-40-loan-limit | HIGH | OWNER_ASSIGNED | - | DSR_LTV / 연봉 5000만원 DSR scenario |
| 단리 복리 차이 | personalFinance/simple-vs-compound | HIGH | OWNER_ASSIGNED | - | COMPOUND_INTEREST / 단리 vs 복리 |
| CAGR 뜻 | personalFinance/what-is-cagr | HIGH | OWNER_ASSIGNED | - | CAGR / CAGR 기초 |

## E. SECONDARY QUERY LEAKAGE

- Directional leakage counts: MEDIUM:30, LOW:80, NONE:59, HIGH:5

| Level | A -> B | B -> A | Post A | Post B |
|---|---|---|---|---|
| MEDIUM | MEDIUM: 원달러 환율 뜻 | MEDIUM: 환율 업종 영향 | economicInfo/fx-basics | investingInfo/usd-krw-exchange-rate-and-kospi |
| LOW | LOW: 지정학 리스크 대시보드 | LOW: 지정학 리스크 외환시장 | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/geopolitics-to-usd-liquidity-fx |
| MEDIUM | MEDIUM: 전쟁 보험료 유가 | LOW: 전쟁 원유 공급 리스크 | economicInfo/hormuz-risk-oil-insurance-freight-premium | economicInfo/war-risk-oil-supply-insurance-shipping |
| LOW | NONE: - | LOW: 물가상승률 인플레이션 차이 | economicInfo/inflation-basics | economicInfo/inflation-rate-basics |
| MEDIUM | MEDIUM: 국제유가 원달러 환율 | MEDIUM: 원달러 환율 상승 코스피 | economicInfo/oil-shock-to-usdkrw-korea-transmission | investingInfo/usd-krw-exchange-rate-and-kospi |
| HIGH | HIGH: 유가 코스피 영향 | LOW: 유가 환율 코스피 | economicInfo/oil-shock-to-usdkrw-korea-transmission | investingInfo/wti-impact-on-korea-kospi |
| MEDIUM | MEDIUM: 10년물 금리 나스닥 ETF | MEDIUM: 미국 10년물 국내 ETF | investingInfo/etf-impact-of-tnx | investingInfo/korea-etf-deep-dive-tnx |
| MEDIUM | MEDIUM: 미국 국채금리 ETF 영향 | MEDIUM: 미국 국채 10년물 금리 | investingInfo/etf-impact-of-tnx | investingInfo/tnx-basics |
| MEDIUM | LOW: 10년물 금리 나스닥 ETF | MEDIUM: 미국 10년물 금리 코스피 영향 | investingInfo/etf-impact-of-tnx | investingInfo/us10y-impact-on-korea-and-stock-market |
| HIGH | HIGH: 부동산 리스크 관리 | NONE: 지역별 부동산 위험 | investingInfo/real-estate-role-in-portfolio-risk-budget | investingInfo/seoul-gyeonggi-incheon-risk-budget-framework |
| MEDIUM | MEDIUM: 미국 증시 한국 증시 영향 | NONE: 미국 10년물 금리 코스피 영향 | investingInfo/sp500-impact-on-korea-kospi | investingInfo/us10y-impact-on-korea-and-stock-market |
| MEDIUM | MEDIUM: 미국 국채 10년물 금리 | MEDIUM: 미국 국채금리 성장주 | investingInfo/tnx-basics | investingInfo/us10y-impact-on-korea-and-stock-market |
| MEDIUM | LOW: 원화 약세 주식시장 | MEDIUM: 원달러 환율 업종별 영향 | investingInfo/usd-krw-exchange-rate-and-kospi | investingInfo/usd-krw-weak-won-sector-map-kospi |
| LOW | LOW: 적립식 투자 금액 늘리기 | LOW: 베어마켓 적립식 투자 | personalFinance/dca-step-up-ruleset | personalFinance/is-dca-better-in-bear-market |
| LOW | LOW: 시장 상황별 적립식 투자 | LOW: 적립식 투자 장기 결과 | personalFinance/dca-vs-lump-sum-when-results-differ | personalFinance/monthly-dca-10-year-result |
| MEDIUM | MEDIUM: 적립식 투자 거치식 비교 | LOW: 시장 상황별 적립식 투자 | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/dca-vs-lump-sum-when-results-differ |
| LOW | NONE: 연봉별 주담대 한도 | LOW: 연봉 4000 DSR 40 | personalFinance/dsr-40-income-loan-limit-table | personalFinance/salary-40m-mortgage-limit |
| HIGH | HIGH: DSR 40 대출 가능액 | LOW: DSR 40 대출 가능액 | personalFinance/dsr-40-income-loan-limit-table | personalFinance/salary-50m-dsr-40-loan-limit |
| MEDIUM | MEDIUM: DSR LTV 현금 계산 | LOW: LTV 계산기 | personalFinance/dsr-pass-ltv-cash-bottleneck | personalFinance/ltv-dsr-calculator-guide |
| MEDIUM | MEDIUM: 1억 만들려면 매달 얼마 | NONE: 1억 만들기 월 저축액 | personalFinance/how-much-monthly-invest-for-100m | personalFinance/how-much-per-month-for-100m |
| LOW | LOW: 목표금액 월 투자금 계산 | LOW: 월 투자금 계산표 | personalFinance/how-much-monthly-invest-for-100m | personalFinance/monthly-investment-for-100m-table |
| MEDIUM | LOW: 연봉 4000 DSR 40 | MEDIUM: 연봉 5000 주담대 가능액 | personalFinance/salary-40m-mortgage-limit | personalFinance/salary-50m-dsr-40-loan-limit |
| LOW | LOW: 달러 환율 보는 법 | LOW: 달러 유동성 환율 영향 | economicInfo/fx-basics | economicInfo/geopolitics-to-usd-liquidity-fx |
| LOW | LOW: 전쟁 리스크 금융시장 | LOW: 지정학 리스크 원유 가격 | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/war-risk-oil-supply-insurance-shipping |
| MEDIUM | MEDIUM: 전쟁 리스크 금융시장 | MEDIUM: 지정학 리스크 투자 전략 | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/war-theme-investing-price-chain-not-winners |
| LOW | LOW: 기준금리 뜻 | LOW: 금리 인하 대출금리 영향 | economicInfo/interest-rate-basics | economicInfo/policy-rate-cut-market-rates |
| HIGH | NONE: - | HIGH: 미국 장기금리 뜻 | economicInfo/interest-rate-basics | investingInfo/tnx-basics |
| MEDIUM | MEDIUM: 전쟁 리스크 인플레이션 | LOW: 전쟁 뉴스 투자 판단 | economicInfo/war-risk-oil-supply-insurance-shipping | economicInfo/war-theme-investing-price-chain-not-winners |
| LOW | LOW: 채권 ETF 금리 영향 | LOW: 금리 상승 ETF 수익률 | investingInfo/bond-etf-duration-drives-returns | investingInfo/etf-impact-of-tnx |
| LOW | NONE: - | LOW: 벤치마크 비교 수익률 | investingInfo/cagr-7percent-reality-check | investingInfo/diagnose-investing-skill-with-cagr |
| LOW | LOW: 적립식 투자 꾸준히 하는 법 | NONE: 달러 투자 적립식 리스크 | investingInfo/dca-consistency-7-fail-patterns | personalFinance/dca-fx-volatility-decomposition |
| LOW | LOW: 적립식 투자 꾸준히 하는 법 | NONE: 적립식 투자 금액 늘리기 | investingInfo/dca-consistency-7-fail-patterns | personalFinance/dca-step-up-ruleset |
| LOW | NONE: 적립식 투자 꾸준히 하는 법 | LOW: 시장 상황별 적립식 투자 | investingInfo/dca-consistency-7-fail-patterns | personalFinance/dca-vs-lump-sum-when-results-differ |
| LOW | LOW: 적립식 투자 꾸준히 하는 법 | LOW: 적립식 투자 거치식 비교 | investingInfo/dca-consistency-7-fail-patterns | personalFinance/dca-vs-lumpsum-decision-rules |
| LOW | LOW: 적립식 투자 꾸준히 하는 법 | LOW: 베어마켓 적립식 투자 | investingInfo/dca-consistency-7-fail-patterns | personalFinance/is-dca-better-in-bear-market |
| LOW | LOW: 적립식 투자 꾸준히 하는 법 | NONE: 월 50만원 적립식 투자 10년 | investingInfo/dca-consistency-7-fail-patterns | personalFinance/monthly-dca-10-year-result |
| LOW | NONE: - | LOW: 적립식 투자 목표금액 표 | investingInfo/dca-consistency-7-fail-patterns | personalFinance/monthly-investment-for-100m-table |
| MEDIUM | MEDIUM: CAGR 계산 투자 | NONE: - | investingInfo/diagnose-investing-skill-with-cagr | personalFinance/what-is-cagr |
| MEDIUM | LOW: 달러인덱스 구성 | MEDIUM: 달러인덱스 금리 영향 | investingInfo/dxy-dollar-index-basics | investingInfo/dxy-market-impact |
| LOW | NONE: 60 40 포트폴리오 | LOW: 부동산 리스크 관리 | investingInfo/modern-6040-risk-budget | investingInfo/real-estate-role-in-portfolio-risk-budget |
| LOW | NONE: 대출금리 아파트 수요 | LOW: 아파트 가격 지도 보는 법 | investingInfo/rates-discount-mortgage-demand-apt-prices | personalFinance/apt-dashboard-home-goal-roadmap |
| LOW | NONE: 대출금리 아파트 수요 | LOW: 아파트 가격 자료 읽기 | investingInfo/rates-discount-mortgage-demand-apt-prices | personalFinance/how-to-read-apartment-transaction-prices |
| LOW | NONE: 대출금리 아파트 수요 | LOW: 세대수 많은 아파트 가격 | investingInfo/rates-discount-mortgage-demand-apt-prices | personalFinance/large-apartment-complex-households-price-stability |
| LOW | NONE: S&P500 상승 코스피 | LOW: 환율 코스피 관계 | investingInfo/sp500-impact-on-korea-kospi | investingInfo/usd-krw-exchange-rate-and-kospi |
| LOW | LOW: ETF CAGR 계산 | LOW: 투자 CAGR 의미 | investingInfo/why-check-cagr-etf | personalFinance/what-is-cagr |
| LOW | LOW: 복리 계산 주기 차이 | NONE: - | personalFinance/annual-vs-monthly-compound | personalFinance/compound-calculator-guide |
| LOW | LOW: 복리 계산 주기 차이 | NONE: 이자 계산 방식 차이 | personalFinance/annual-vs-monthly-compound | personalFinance/simple-vs-compound |
| LOW | LOW: 내 연봉으로 살 수 있는 아파트 | LOW: 아파트 매수 부대비용 | personalFinance/apartment-buying-calculator-guide | personalFinance/apartment-buying-costs-before-purchase |
| MEDIUM | LOW: 아파트 필요 현금 계산 | MEDIUM: 현금 1억 아파트 구매 | personalFinance/apartment-buying-calculator-guide | personalFinance/cash-100m-200m-300m-apartment-budget |
| MEDIUM | NONE: - | MEDIUM: 생애최초 아파트 구매 자금 | personalFinance/apartment-buying-calculator-guide | personalFinance/first-home-buyer-budget-calculation |
| LOW | LOW: 주택 구입 필요 현금 | NONE: 생애최초 아파트 구매 자금 | personalFinance/apartment-buying-costs-before-purchase | personalFinance/first-home-buyer-budget-calculation |
| MEDIUM | MEDIUM: 아파트 시장 거래량 보는 법 | NONE: 아파트 실거래가 해석 | personalFinance/apartment-transaction-volume-decline-meaning | personalFinance/how-to-read-apartment-transaction-prices |
| MEDIUM | MEDIUM: 아파트 실거래가 대시보드 | NONE: 아파트 실거래가 해석 | personalFinance/apt-dashboard-home-goal-roadmap | personalFinance/how-to-read-apartment-transaction-prices |
| MEDIUM | LOW: 원금 수익률 기간 복리 계산 | MEDIUM: 복리 수익률 표 | personalFinance/compound-calculator-guide | personalFinance/compound-return-3-5-7-10-table |
| HIGH | LOW: 복리 계산기 | HIGH: 복리 뜻 | personalFinance/compound-calculator-guide | personalFinance/simple-vs-compound |
| LOW | LOW: 복리 수익률 표 | LOW: 복리 뜻 | personalFinance/compound-return-3-5-7-10-table | personalFinance/simple-vs-compound |
| LOW | LOW: 달러 투자 적립식 리스크 | NONE: 적립식 투자 금액 늘리기 | personalFinance/dca-fx-volatility-decomposition | personalFinance/dca-step-up-ruleset |
| LOW | NONE: 달러 투자 적립식 리스크 | LOW: 시장 상황별 적립식 투자 | personalFinance/dca-fx-volatility-decomposition | personalFinance/dca-vs-lump-sum-when-results-differ |
| LOW | NONE: 달러 투자 적립식 리스크 | LOW: 적립식 투자 거치식 비교 | personalFinance/dca-fx-volatility-decomposition | personalFinance/dca-vs-lumpsum-decision-rules |
| LOW | LOW: 달러 투자 적립식 리스크 | LOW: 베어마켓 적립식 투자 | personalFinance/dca-fx-volatility-decomposition | personalFinance/is-dca-better-in-bear-market |
| LOW | NONE: - | LOW: 적립식 투자 목표금액 표 | personalFinance/dca-fx-volatility-decomposition | personalFinance/monthly-investment-for-100m-table |
| LOW | NONE: 적립식 투자 금액 늘리기 | LOW: 시장 상황별 적립식 투자 | personalFinance/dca-step-up-ruleset | personalFinance/dca-vs-lump-sum-when-results-differ |
| LOW | NONE: 적립식 투자 금액 늘리기 | LOW: 적립식 투자 거치식 비교 | personalFinance/dca-step-up-ruleset | personalFinance/dca-vs-lumpsum-decision-rules |
| LOW | NONE: - | LOW: 목표 1억 적립식 투자 | personalFinance/dca-step-up-ruleset | personalFinance/how-much-per-month-for-100m |
| LOW | NONE: 적립식 투자 금액 늘리기 | LOW: 월 50만원 적립식 투자 10년 | personalFinance/dca-step-up-ruleset | personalFinance/monthly-dca-10-year-result |
| LOW | LOW: 월 투자금 증액 규칙 | LOW: 적립식 투자 목표금액 표 | personalFinance/dca-step-up-ruleset | personalFinance/monthly-investment-for-100m-table |
| LOW | LOW: 시장 상황별 적립식 투자 | NONE: 베어마켓 적립식 투자 | personalFinance/dca-vs-lump-sum-when-results-differ | personalFinance/is-dca-better-in-bear-market |
| LOW | LOW: 적립식 투자 거치식 비교 | LOW: 베어마켓 적립식 투자 | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/is-dca-better-in-bear-market |
| LOW | LOW: 적립식 투자 거치식 비교 | NONE: 월 50만원 적립식 투자 10년 | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/monthly-dca-10-year-result |
| LOW | NONE: - | LOW: 적립식 투자 목표금액 표 | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/monthly-investment-for-100m-table |
| MEDIUM | NONE: 은퇴 생활비 계산 | MEDIUM: 은퇴자금 계산 주의점 | personalFinance/fire-3-numbers-spending-horizon-withdrawal | personalFinance/fire-assumption-errors-7-fixes |
| MEDIUM | MEDIUM: 은퇴 생활비 계산 | NONE: 파이어족 생활비 관리 | personalFinance/fire-3-numbers-spending-horizon-withdrawal | personalFinance/fire-spending-buckets-essential-choice-insurance |
| LOW | LOW: 목표 1억 적립식 투자 | NONE: - | personalFinance/how-much-per-month-for-100m | personalFinance/is-dca-better-in-bear-market |
| LOW | LOW: DSR 금리 변화 영향 | NONE: - | personalFinance/interest-rate-1p-loan-limit-impact | personalFinance/ltv-dsr-calculator-guide |
| LOW | LOW: 베어마켓 적립식 투자 | LOW: 월 50만원 적립식 투자 10년 | personalFinance/is-dca-better-in-bear-market | personalFinance/monthly-dca-10-year-result |
| LOW | NONE: - | LOW: 적립식 투자 목표금액 표 | personalFinance/is-dca-better-in-bear-market | personalFinance/monthly-investment-for-100m-table |
| LOW | LOW: DSR 40 계산 | LOW: 연소득 DSR 계산 | personalFinance/ltv-dsr-calculator-guide | personalFinance/dsr-40-income-loan-limit-table |
| LOW | NONE: - | LOW: 적립식 투자 목표금액 표 | personalFinance/monthly-dca-10-year-result | personalFinance/monthly-investment-for-100m-table |

## F. INTERNAL ANCHOR COLLISION

- Exact contextual anchor collisions among conflict pairs: 0
- No exact inbound contextual anchor collision was detected among Step 2 conflict pairs. Related-post title anchors remain URL-specific because they use target titles.

## G. TOPIC FAMILY QUERY ARCHITECTURE

| Topic Family | Core | Spokes |
|---|---|---|
| ASSET_ALLOCATION | investingInfo/modern-6040-risk-budget (60대40 포트폴리오 리스크 관리) | economicInfo/gold-geopolitics-real-rates-dollar-uncertainty (금 가격 지정학 실질금리 달러); investingInfo/real-estate-role-in-portfolio-risk-budget (부동산 포트폴리오 비중) |
| CAGR | personalFinance/what-is-cagr (CAGR 뜻) | investingInfo/cagr-7percent-reality-check (연 7% 수익률 현실성); investingInfo/diagnose-investing-skill-with-cagr (CAGR로 투자 성과 평가); investingInfo/why-check-cagr-etf (ETF 투자 CAGR 확인 이유) |
| COMPOUND_INTEREST | personalFinance/compound-calculator-guide (복리 계산기 사용법) | personalFinance/annual-vs-monthly-compound (연복리 월복리 차이); personalFinance/compound-return-3-5-7-10-table (복리 수익률 기간별 결과); personalFinance/simple-vs-compound (단리 복리 차이) |
| DCA | personalFinance/dca-vs-lumpsum-decision-rules (적립식 투자 일시금 투자 선택) | investingInfo/dca-consistency-7-fail-patterns (적립식 투자 실패 패턴); personalFinance/dca-fx-volatility-decomposition (적립식 투자 환율 변동성 영향); personalFinance/dca-step-up-ruleset (적립식 투자 증액 전략); personalFinance/dca-vs-lump-sum-when-results-differ (적립식 투자 거치식 결과 차이); personalFinance/how-much-monthly-invest-for-100m (1억원 만들기 월 투자금); personalFinance/how-much-per-month-for-100m (1억 모으기 매달 얼마); personalFinance/is-dca-better-in-bear-market (하락장 적립식 투자); personalFinance/monthly-dca-10-year-result (월 적립식 투자 10년 결과); personalFinance/monthly-investment-for-100m-table (목표금액별 월 투자금 표) |
| DSR_LTV | personalFinance/dsr-40-income-loan-limit-table (DSR 40 연봉별 대출한도); personalFinance/ltv-dsr-calculator-guide (LTV DSR 계산기 사용법) | personalFinance/dsr-pass-ltv-cash-bottleneck (DSR LTV 현금 부족); personalFinance/interest-rate-1p-loan-limit-impact (금리 1%p 대출한도 영향); personalFinance/mortgage-risk-checklist-dsr-variable (주담대 위험 체크리스트); personalFinance/salary-40m-mortgage-limit (연봉 4000만원 주담대 가능액); personalFinance/salary-50m-dsr-40-loan-limit (연봉 5000만원 DSR 40 대출 가능액) |
| DXY | investingInfo/dxy-dollar-index-basics (달러인덱스 뜻) | investingInfo/dxy-market-impact (달러인덱스 주식시장 영향) |
| ETF | investingInfo/bond-etf-duration-drives-returns (채권 ETF 듀레이션 수익률) | investingInfo/etf-impact-of-tnx (미국 10년물 금리 ETF 영향); investingInfo/korea-etf-deep-dive-tnx (국내 ETF 미국 10년물 금리 영향) |
| FIRE | personalFinance/fire-3-numbers-spending-horizon-withdrawal (파이어족 은퇴자금 계산) | personalFinance/fire-assumption-errors-7-fixes (파이어족 계산 실수); personalFinance/fire-sequence-risk-first-5-years (은퇴 초기 순서위험); personalFinance/fire-spending-buckets-essential-choice-insurance (은퇴 생활비 버킷 전략) |
| FX | economicInfo/fx-basics (환율 뜻) | economicInfo/geopolitics-to-usd-liquidity-fx (지정학 리스크 달러 환율); investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions (환헤지 환노출 선택 기준) |
| GEOPOLITICS | economicInfo/geopolitics-oil-fx-dashboard (지정학 리스크 유가 환율 영향); economicInfo/war-risk-oil-supply-insurance-shipping (전쟁 유가 영향) | economicInfo/tariffs-growth-margins-fx-package-shock (관세 인상 경제 영향); economicInfo/war-theme-investing-price-chain-not-winners (전쟁 테마주 투자 리스크) |
| HOUSEHOLD_FINANCE | personalFinance/personal-finance-3pillars (개인 재무관리 3요소) | personalFinance/emergency-fund-by-risk (비상금 얼마 필요); personalFinance/goal-amount-fast-strategy (목표 금액 빨리 모으는 법); personalFinance/high-rate-debt-vs-invest-threshold-rule (고금리 대출 상환 투자 비교); personalFinance/inflation-household-survival-strategy (물가 상승 가계부 관리); personalFinance/personal-start-5steps (재테크 시작하는 법) |
| INFLATION | economicInfo/inflation-basics (인플레이션 뜻) | economicInfo/inflation-rate-basics (물가상승률 뜻) |
| INTEREST_RATES | economicInfo/interest-rate-basics (금리 뜻) | economicInfo/policy-rate-cut-market-rates (기준금리 인하 시장금리 영향); economicInfo/real-rates-and-breakevens (실질금리 기대인플레이션); economicInfo/yield-curve-2s10s-3m10y-recession-reading (장단기 금리차 경기침체 신호) |
| KOSPI_GLOBAL_LINK | investingInfo/sp500-impact-on-korea-kospi (S&P500 코스피 영향) | investingInfo/usd-krw-exchange-rate-and-kospi (원달러 환율 코스피 영향); investingInfo/usd-krw-weak-won-sector-map-kospi (원화 약세 수혜 업종) |
| MACRO_INDICATORS | economicInfo/indicator-basics (경제지표 보는 법) | investingInfo/indicator-marketinfo (투자 지표 보는 법) |
| OIL_ENERGY | economicInfo/hormuz-risk-oil-insurance-freight-premium (중동 원유 운송 리스크) | economicInfo/eu-russia-gas-phaseout-price-channel (러시아 가스 중단 유럽 물가 영향); economicInfo/oil-shock-to-usdkrw-korea-transmission (유가 상승 원달러 환율 영향); investingInfo/wti-impact-on-korea-kospi (WTI 유가 코스피 영향) |
| REAL_ESTATE_BUDGET | personalFinance/apartment-buying-calculator-guide (아파트 구매 계산기 사용법) | personalFinance/apartment-buying-costs-before-purchase (아파트 매수 비용); personalFinance/cash-100m-200m-300m-apartment-budget (현금 1억 2억 3억 아파트 예산); personalFinance/first-home-buyer-budget-calculation (생애최초 주택 구입 예산); personalFinance/jeonse-to-home-purchase-cash-needed (전세에서 매매 갈아타기 현금); personalFinance/rent-jeonse-buy-cashflow-opportunity-cost (월세 전세 매매 비교) |
| REAL_ESTATE_DATA | personalFinance/apt-dashboard-home-goal-roadmap (아파트 시세 대시보드 활용법) | investingInfo/rates-discount-mortgage-demand-apt-prices (금리 아파트 가격 영향); investingInfo/seoul-gyeonggi-incheon-risk-budget-framework (수도권 부동산 리스크 관리); personalFinance/apartment-transaction-volume-decline-meaning (아파트 거래량 감소 의미); personalFinance/how-to-read-apartment-transaction-prices (아파트 실거래가 보는 법); personalFinance/large-apartment-complex-households-price-stability (대단지 아파트 가격 안정성) |
| TNX | investingInfo/tnx-basics (미국 10년물 국채금리 뜻) | investingInfo/us10y-impact-on-korea-and-stock-market (미국 10년물 금리 한국 증시 영향) |

## H. DEEP-DIVE GROUPS

### Middle East / Oil

- Pair count reviewed: 3
- Classification counts: QUERY_BOUNDARY_WEAK:2, HUB_SPOKE_RELATION:1
- Result: 분리 가능하지만 query boundary 강화 필요
- economicInfo/hormuz-risk-oil-insurance-freight-premium: 중동 원유 운송 리스크 / transport/chokepoint, insurance premium, freight premium
- economicInfo/war-risk-oil-supply-insurance-shipping: 전쟁 유가 영향 / war/geopolitics, oil supply risk, inflation chain
- economicInfo/geopolitics-oil-fx-dashboard: 지정학 리스크 유가 환율 영향 / multi-asset dashboard across oil, FX, risk assets
- economicInfo/oil-shock-to-usdkrw-korea-transmission: 유가 상승 원달러 환율 영향 / oil to USD/KRW and Korea macro transmission
- investingInfo/wti-impact-on-korea-kospi: WTI 유가 코스피 영향 / oil to Korea/KOSPI and sector interpretation

### 1억원 / 월 투자금

- Pair count reviewed: 3
- Classification counts: TRUE_CANNIBALIZATION:1, PARENT_CHILD_RELATION:2
- Result: 구조적 cannibalization review 필요
- personalFinance/how-much-monthly-invest-for-100m: 1억원 만들기 월 투자금 / 1억원 만들기 월 투자금 calculator support
- personalFinance/how-much-per-month-for-100m: 1억 모으기 매달 얼마 / 1억 모으기 매달 얼마 question phrase
- personalFinance/monthly-investment-for-100m-table: 목표금액별 월 투자금 표 / 목표금액별 월 투자금 table parent

### DCA vs Lump Sum

- Pair count reviewed: 1
- Classification counts: QUERY_BOUNDARY_WEAK:1
- Result: 분리 가능하지만 query boundary 강화 필요
- personalFinance/dca-vs-lump-sum-when-results-differ: 적립식 투자 거치식 결과 차이 / 수익 결과와 scenario 차이
- personalFinance/dca-vs-lumpsum-decision-rules: 적립식 투자 일시금 투자 선택 / 사용자 의사결정과 실행 rule

### DSR Income

- Pair count reviewed: 3
- Classification counts: PARENT_CHILD_RELATION:2, SCENARIO_VARIANTS:1
- Result: 분리 가능
- personalFinance/dsr-40-income-loan-limit-table: DSR 40 연봉별 대출한도 / DSR 40% 연봉별 대출한도 parent table
- personalFinance/salary-40m-mortgage-limit: 연봉 4000만원 주담대 가능액 / 연봉 4000만원 child scenario
- personalFinance/salary-50m-dsr-40-loan-limit: 연봉 5000만원 DSR 40 대출 가능액 / 연봉 5000만원 child scenario

### Inflation

- Pair count reviewed: 1
- Classification counts: QUERY_BOUNDARY_WEAK:1
- Result: 분리 가능하지만 query boundary 강화 필요
- economicInfo/inflation-basics: 인플레이션 뜻 / 인플레이션 개념, 원인, 금리 관계
- economicInfo/inflation-rate-basics: 물가상승률 뜻 / 물가상승률, CPI 측정과 해석

### TNX / ETF

- Pair count reviewed: 5
- Classification counts: PARENT_CHILD_RELATION:1, DEFINITION_VS_IMPACT:2, QUERY_BOUNDARY_WEAK:1, COMPLEMENTARY_DOCUMENTS:1
- Result: 분리 가능하지만 query boundary 강화 필요
- investingInfo/tnx-basics: 미국 10년물 국채금리 뜻 / 미국 10년물 국채금리 definition owner
- investingInfo/us10y-impact-on-korea-and-stock-market: 미국 10년물 금리 한국 증시 영향 / 미국 10년물의 한국 증시 영향
- investingInfo/etf-impact-of-tnx: 미국 10년물 금리 ETF 영향 / 미국 10년물의 ETF 영향
- investingInfo/korea-etf-deep-dive-tnx: 국내 ETF 미국 10년물 금리 영향 / 미국 10년물의 국내 ETF 영향
- investingInfo/bond-etf-duration-drives-returns: 채권 ETF 듀레이션 수익률 / 채권 ETF duration과 수익률

### Personal Finance Beginner

- Pair count reviewed: 1
- Classification counts: QUERY_BOUNDARY_WEAK:1
- Result: 분리 가능하지만 query boundary 강화 필요
- personalFinance/personal-finance-3pillars: 개인 재무관리 3요소 / 개인 재무관리 framework
- personalFinance/personal-start-5steps: 재테크 시작하는 법 / 재테크 시작 sequence

## I. RESOLUTION RECOMMENDATIONS

| Action | Pair | Classification | Owner | Supporting | Reason |
|---|---|---|---|---|---|
| CLARIFY_QUERY_BOUNDARY | economicInfo/geopolitics-oil-fx-dashboard <-> economicInfo/geopolitics-to-usd-liquidity-fx | QUERY_BOUNDARY_WEAK | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/geopolitics-to-usd-liquidity-fx | 둘 다 지정학과 환율을 다루지만 dashboard 문서는 multi-asset overview, USD-liquidity 문서는 달러 유동성 전이로 경계를 세울 수 있다. |
| CLARIFY_QUERY_BOUNDARY | economicInfo/hormuz-risk-oil-insurance-freight-premium <-> economicInfo/war-risk-oil-supply-insurance-shipping | QUERY_BOUNDARY_WEAK | economicInfo/hormuz-risk-oil-insurance-freight-premium | economicInfo/war-risk-oil-supply-insurance-shipping | 중동 운송/chokepoint query와 전쟁-원유 공급 query가 인접해 있어 ownership boundary를 명확히 둘 필요가 있다. |
| CLARIFY_QUERY_BOUNDARY | economicInfo/inflation-basics <-> economicInfo/inflation-rate-basics | QUERY_BOUNDARY_WEAK | economicInfo/inflation-basics | economicInfo/inflation-rate-basics | 인플레이션 개념과 물가상승률 지표는 분리 가능하지만 definition query가 겹칠 수 있다. |
| CLARIFY_QUERY_BOUNDARY | economicInfo/oil-shock-to-usdkrw-korea-transmission <-> investingInfo/wti-impact-on-korea-kospi | QUERY_BOUNDARY_WEAK | investingInfo/wti-impact-on-korea-kospi | economicInfo/oil-shock-to-usdkrw-korea-transmission | 둘 다 유가의 한국 영향이지만 WTI/KOSPI와 USDKRW 전이를 분리하면 정상 구조가 된다. |
| CLARIFY_QUERY_BOUNDARY | investingInfo/etf-impact-of-tnx <-> investingInfo/us10y-impact-on-korea-and-stock-market | QUERY_BOUNDARY_WEAK | investingInfo/us10y-impact-on-korea-and-stock-market | investingInfo/etf-impact-of-tnx | 미국 10년물의 한국 증시 영향과 ETF 영향이 secondary query에서 섞일 수 있다. |
| CLARIFY_QUERY_BOUNDARY | personalFinance/dca-vs-lumpsum-decision-rules <-> personalFinance/dca-vs-lump-sum-when-results-differ | QUERY_BOUNDARY_WEAK | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/dca-vs-lump-sum-when-results-differ | DCA vs lump sum query가 거의 같지만 one is decision rules, the other is result divergence. |
| MERGE_REVIEW_REQUIRED | personalFinance/how-much-monthly-invest-for-100m <-> personalFinance/how-much-per-month-for-100m | TRUE_CANNIBALIZATION | personalFinance/how-much-monthly-invest-for-100m | personalFinance/how-much-per-month-for-100m | 두 문서가 같은 1억원 목표, 월 투자금 계산, calculation intent를 동시에 겨냥한다. |
| CLARIFY_QUERY_BOUNDARY | personalFinance/personal-finance-3pillars <-> personalFinance/personal-start-5steps | QUERY_BOUNDARY_WEAK | personalFinance/personal-start-5steps | personalFinance/personal-finance-3pillars | 재테크 시작과 개인 재무관리 framework가 입문 검색 intent에서 겹칠 수 있다. |

## J. DATA QUALITY / LIMITATIONS

- This audit used Step 1 and Step 2 repository-derived outputs plus local markdown only.
- No Naver ranking, impression, click, Search Advisor, GSC, or external keyword-volume data was used.
- `TRUE_CANNIBALIZATION` here means confirmed structural query ownership collision in repo/content design, not confirmed live Naver cannibalization.
- `MERGE_REVIEW_REQUIRED` is a future review direction only. No merge, redirect, delete, rewrite, or title/internal-link change was performed.
- Token overlap alone was not used to call true cannibalization; definition/impact, parent/child, scenario, and hub/spoke relationships were treated as normal first where appropriate.

## Generated Files

- `reports/naver-ko-post-cannibalization-2026-09-16.md`
- `reports/naver-ko-post-cannibalization-2026-09-16.json`
- `reports/naver-ko-query-ownership-matrix-2026-09-16.csv`

## Step 4 Readiness

Step 4 Internal Link / Topic Cluster Architecture readiness: YES

