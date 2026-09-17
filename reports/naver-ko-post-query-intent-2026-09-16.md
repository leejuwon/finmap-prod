# FinMap KO Post Naver Search Query Intent Map

Generated: 2026-09-16T06:57:06.150Z

## Final Verdict

Final Verdict: QUERY_INTENT_MAP_COMPLETE_WITH_REVIEW_ITEMS

This is an audit/design-only Step 2 output. No post content, frontmatter, tags, headings, internal links, schema, sitemap, canonical, hreflang, page component, or runtime code was changed.

## Summary

- posts analyzed: 79
- primary queries assigned: 79
- HIGH confidence: 39
- MEDIUM confidence: 38
- LOW confidence: 2
- unclear ownership: 29
- ownership conflict candidates: 87
- high-severity ownership conflict candidates: 24
- topic families: 19
- topic hub candidates: 5
- tag support distribution: TAG_SUPPORTS_QUERY:64, TAG_PARTIALLY_SUPPORTS_QUERY:15

## A. QUERY OWNERSHIP OVERVIEW

- Primary query는 exact title phrase가 아니라, 문서가 실제로 소유할 수 있는 자연 검색어 기준으로 설계했다.
- Search volume, Naver ranking, 노출량은 추정하지 않았다.
- `possibleCompetingPosts`는 최종 cannibalization 판단이 아니라 Step 3 검토 후보로만 본다.

### High-confidence Primary Query Examples

- economicInfo/fx-basics: 환율 뜻
- economicInfo/geopolitics-oil-fx-dashboard: 지정학 리스크 유가 환율 영향
- economicInfo/hormuz-risk-oil-insurance-freight-premium: 중동 원유 운송 리스크
- economicInfo/inflation-basics: 인플레이션 뜻
- economicInfo/interest-rate-basics: 금리 뜻
- economicInfo/real-rates-and-breakevens: 실질금리 기대인플레이션
- economicInfo/war-risk-oil-supply-insurance-shipping: 전쟁 유가 영향
- investingInfo/bond-etf-duration-drives-returns: 채권 ETF 듀레이션 수익률
- investingInfo/dca-consistency-7-fail-patterns: 적립식 투자 실패 패턴
- investingInfo/dxy-dollar-index-basics: 달러인덱스 뜻
- investingInfo/rates-discount-mortgage-demand-apt-prices: 금리 아파트 가격 영향
- investingInfo/sp500-impact-on-korea-kospi: S&P500 코스피 영향
- investingInfo/tnx-basics: 미국 10년물 국채금리 뜻
- investingInfo/us10y-impact-on-korea-and-stock-market: 미국 10년물 금리 한국 증시 영향

## B. TOPIC FAMILY MAP

| Topic Family | Posts | Representative Primary Queries | Conflict Candidates | Strongest Post Candidates | Weak/Unclear Posts | Gap Flags |
|---|---:|---|---:|---|---|---|
| DCA | 10 | 적립식 투자 일시금 투자 선택; 적립식 투자 실패 패턴; 하락장 적립식 투자 | 32 | personalFinance/dca-vs-lumpsum-decision-rules; investingInfo/dca-consistency-7-fail-patterns; personalFinance/is-dca-better-in-bear-market | personalFinance/dca-fx-volatility-decomposition; personalFinance/dca-step-up-ruleset; personalFinance/how-much-monthly-invest-for-100m; personalFinance/how-much-per-month-for-100m; personalFinance/monthly-investment-for-100m-table | TOPIC_HUB_CANDIDATE |
| DSR_LTV | 7 | DSR 40 연봉별 대출한도; LTV DSR 계산기 사용법; DSR LTV 현금 부족 | 7 | personalFinance/dsr-40-income-loan-limit-table; personalFinance/ltv-dsr-calculator-guide; personalFinance/dsr-pass-ltv-cash-bottleneck | personalFinance/mortgage-risk-checklist-dsr-variable | TOPIC_HUB_CANDIDATE |
| HOUSEHOLD_FINANCE | 6 | 개인 재무관리 3요소; 목표 금액 빨리 모으는 법; 물가 상승 가계부 관리 | 1 | personalFinance/personal-finance-3pillars; personalFinance/goal-amount-fast-strategy; personalFinance/inflation-household-survival-strategy | personalFinance/emergency-fund-by-risk; personalFinance/goal-amount-fast-strategy; personalFinance/personal-finance-3pillars; personalFinance/personal-start-5steps | TOPIC_HUB_CANDIDATE |
| REAL_ESTATE_BUDGET | 6 | 아파트 구매 계산기 사용법; 아파트 매수 비용; 현금 1억 2억 3억 아파트 예산 | 5 | personalFinance/apartment-buying-calculator-guide; personalFinance/apartment-buying-costs-before-purchase; personalFinance/cash-100m-200m-300m-apartment-budget | - | TOPIC_HUB_CANDIDATE |
| REAL_ESTATE_DATA | 6 | 아파트 시세 대시보드 활용법; 금리 아파트 가격 영향; 아파트 거래량 감소 의미 | 7 | personalFinance/apt-dashboard-home-goal-roadmap; investingInfo/rates-discount-mortgage-demand-apt-prices; personalFinance/apartment-transaction-volume-decline-meaning | investingInfo/seoul-gyeonggi-incheon-risk-budget-framework | TOPIC_HUB_CANDIDATE |
| CAGR | 4 | CAGR 뜻; ETF 투자 CAGR 확인 이유; 연 7% 수익률 현실성 | 5 | personalFinance/what-is-cagr; investingInfo/why-check-cagr-etf; investingInfo/cagr-7percent-reality-check | investingInfo/cagr-7percent-reality-check | - |
| COMPOUND_INTEREST | 4 | 복리 계산기 사용법; 단리 복리 차이; 연복리 월복리 차이 | 5 | personalFinance/compound-calculator-guide; personalFinance/simple-vs-compound; personalFinance/annual-vs-monthly-compound | - | - |
| FIRE | 4 | 파이어족 은퇴자금 계산; 파이어족 계산 실수; 은퇴 초기 순서위험 | 2 | personalFinance/fire-3-numbers-spending-horizon-withdrawal; personalFinance/fire-assumption-errors-7-fixes; personalFinance/fire-sequence-risk-first-5-years | personalFinance/fire-3-numbers-spending-horizon-withdrawal; personalFinance/fire-assumption-errors-7-fixes; personalFinance/fire-sequence-risk-first-5-years | - |
| GEOPOLITICS | 4 | 지정학 리스크 유가 환율 영향; 전쟁 유가 영향; 관세 인상 경제 영향 | 5 | economicInfo/geopolitics-oil-fx-dashboard; economicInfo/war-risk-oil-supply-insurance-shipping; economicInfo/tariffs-growth-margins-fx-package-shock | economicInfo/geopolitics-oil-fx-dashboard; economicInfo/tariffs-growth-margins-fx-package-shock; economicInfo/war-theme-investing-price-chain-not-winners | - |
| INTEREST_RATES | 4 | 금리 뜻; 실질금리 기대인플레이션; 기준금리 인하 시장금리 영향 | 2 | economicInfo/interest-rate-basics; economicInfo/real-rates-and-breakevens; economicInfo/policy-rate-cut-market-rates | economicInfo/yield-curve-2s10s-3m10y-recession-reading | - |
| OIL_ENERGY | 4 | 중동 원유 운송 리스크; WTI 유가 코스피 영향; 러시아 가스 중단 유럽 물가 영향 | 3 | economicInfo/hormuz-risk-oil-insurance-freight-premium; investingInfo/wti-impact-on-korea-kospi; economicInfo/eu-russia-gas-phaseout-price-channel | economicInfo/oil-shock-to-usdkrw-korea-transmission | - |
| ASSET_ALLOCATION | 3 | 60대40 포트폴리오 리스크 관리; 금 가격 지정학 실질금리 달러; 부동산 포트폴리오 비중 | 2 | investingInfo/modern-6040-risk-budget; economicInfo/gold-geopolitics-real-rates-dollar-uncertainty; investingInfo/real-estate-role-in-portfolio-risk-budget | investingInfo/modern-6040-risk-budget; investingInfo/real-estate-role-in-portfolio-risk-budget | - |
| ETF | 3 | 채권 ETF 듀레이션 수익률; 미국 10년물 금리 ETF 영향; 국내 ETF 미국 10년물 금리 영향 | 4 | investingInfo/bond-etf-duration-drives-returns; investingInfo/etf-impact-of-tnx; investingInfo/korea-etf-deep-dive-tnx | investingInfo/etf-impact-of-tnx; investingInfo/korea-etf-deep-dive-tnx | - |
| FX | 3 | 환율 뜻; 지정학 리스크 달러 환율; 환헤지 환노출 선택 기준 | 3 | economicInfo/fx-basics; economicInfo/geopolitics-to-usd-liquidity-fx; investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions | economicInfo/geopolitics-to-usd-liquidity-fx | - |
| KOSPI_GLOBAL_LINK | 3 | S&P500 코스피 영향; 원달러 환율 코스피 영향; 원화 약세 수혜 업종 | 5 | investingInfo/sp500-impact-on-korea-kospi; investingInfo/usd-krw-exchange-rate-and-kospi; investingInfo/usd-krw-weak-won-sector-map-kospi | - | - |
| DXY | 2 | 달러인덱스 뜻; 달러인덱스 주식시장 영향 | 1 | investingInfo/dxy-dollar-index-basics; investingInfo/dxy-market-impact | investingInfo/dxy-market-impact | - |
| INFLATION | 2 | 인플레이션 뜻; 물가상승률 뜻 | 1 | economicInfo/inflation-basics; economicInfo/inflation-rate-basics | economicInfo/inflation-rate-basics | - |
| MACRO_INDICATORS | 2 | 경제지표 보는 법; 투자 지표 보는 법 | 1 | economicInfo/indicator-basics; investingInfo/indicator-marketinfo | economicInfo/indicator-basics; investingInfo/indicator-marketinfo | - |
| TNX | 2 | 미국 10년물 국채금리 뜻; 미국 10년물 금리 한국 증시 영향 | 5 | investingInfo/tnx-basics; investingInfo/us10y-impact-on-korea-and-stock-market | - | - |

## C. PRIMARY QUERY MAP

| Category | URL | Primary Query | Confidence | Intent | Type | Topic Family | Title Alignment | Exact-title Risk | Tag Support | Competing Candidates |
|---|---|---|---|---|---|---|---|---|---|---|
| economicInfo | /posts/economicInfo/eu-russia-gas-phaseout-price-channel | 러시아 가스 중단 유럽 물가 영향 | MEDIUM | MARKET_IMPACT / EXPLANATION | LONG_TAIL | OIL_ENERGY / 유럽 가스 공급과 가격 전이 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | - |
| economicInfo | /posts/economicInfo/fx-basics | 환율 뜻 | HIGH | DEFINITION / EXPLANATION | HEAD | FX / 환율 기초 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | economicInfo/geopolitics-to-usd-liquidity-fx (MEDIUM); investingInfo/usd-krw-exchange-rate-and-kospi (HIGH) |
| economicInfo | /posts/economicInfo/geopolitics-oil-fx-dashboard | 지정학 리스크 유가 환율 영향 | HIGH | MARKET_IMPACT / DATA_INTERPRETATION | MID_TAIL | GEOPOLITICS / 지정학 리스크 대시보드 해석 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | economicInfo/geopolitics-to-usd-liquidity-fx (HIGH); economicInfo/war-risk-oil-supply-insurance-shipping (MEDIUM); economicInfo/war-theme-investing-price-chain-not-winners (MEDIUM) |
| economicInfo | /posts/economicInfo/geopolitics-to-usd-liquidity-fx | 지정학 리스크 달러 환율 | MEDIUM | MARKET_IMPACT / EXPLANATION | MID_TAIL | FX / 위험회피와 달러 유동성 | LOW | HIGH | TAG_SUPPORTS_QUERY | economicInfo/fx-basics (MEDIUM); economicInfo/geopolitics-oil-fx-dashboard (HIGH) |
| economicInfo | /posts/economicInfo/gold-geopolitics-real-rates-dollar-uncertainty | 금 가격 지정학 실질금리 달러 | MEDIUM | EXPLANATION / MARKET_IMPACT | LONG_TAIL | ASSET_ALLOCATION / 금 가격 요인 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | - |
| economicInfo | /posts/economicInfo/hormuz-risk-oil-insurance-freight-premium | 중동 원유 운송 리스크 | HIGH | MARKET_IMPACT / EXPLANATION | MID_TAIL | OIL_ENERGY / 호르무즈 운송, 보험료, 운임 프리미엄 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | economicInfo/war-risk-oil-supply-insurance-shipping (HIGH) |
| economicInfo | /posts/economicInfo/indicator-basics | 경제지표 보는 법 | MEDIUM | HOW_TO / DATA_INTERPRETATION | MID_TAIL | MACRO_INDICATORS / 경제지표 입문 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/indicator-marketinfo (MEDIUM) |
| economicInfo | /posts/economicInfo/inflation-basics | 인플레이션 뜻 | HIGH | DEFINITION / EXPLANATION | HEAD | INFLATION / 인플레이션 기초 | HIGH | MEDIUM | TAG_PARTIALLY_SUPPORTS_QUERY | economicInfo/inflation-rate-basics (HIGH) |
| economicInfo | /posts/economicInfo/inflation-rate-basics | 물가상승률 뜻 | LOW | DEFINITION / DATA_INTERPRETATION | MID_TAIL | INFLATION / 물가상승률과 CPI | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | economicInfo/inflation-basics (HIGH) |
| economicInfo | /posts/economicInfo/interest-rate-basics | 금리 뜻 | HIGH | DEFINITION / EXPLANATION | HEAD | INTEREST_RATES / 금리 기초 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | economicInfo/policy-rate-cut-market-rates (MEDIUM); investingInfo/tnx-basics (MEDIUM) |
| economicInfo | /posts/economicInfo/oil-shock-to-usdkrw-korea-transmission | 유가 상승 원달러 환율 영향 | MEDIUM | MARKET_IMPACT / EXPLANATION | LONG_TAIL | OIL_ENERGY / 유가 shock의 한국 전이 | LOW | HIGH | TAG_SUPPORTS_QUERY | investingInfo/usd-krw-exchange-rate-and-kospi (HIGH); investingInfo/wti-impact-on-korea-kospi (HIGH) |
| economicInfo | /posts/economicInfo/policy-rate-cut-market-rates | 기준금리 인하 시장금리 영향 | MEDIUM | EXPLANATION / MARKET_IMPACT | LONG_TAIL | INTEREST_RATES / 정책금리와 시장금리 전이 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | economicInfo/interest-rate-basics (MEDIUM) |
| economicInfo | /posts/economicInfo/real-rates-and-breakevens | 실질금리 기대인플레이션 | HIGH | EXPLANATION / DATA_INTERPRETATION | MID_TAIL | INTEREST_RATES / 실질금리와 BEI | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | - |
| economicInfo | /posts/economicInfo/tariffs-growth-margins-fx-package-shock | 관세 인상 경제 영향 | MEDIUM | MARKET_IMPACT / EXPLANATION | MID_TAIL | GEOPOLITICS / 관세 shock와 성장, 마진, 환율 | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | - |
| economicInfo | /posts/economicInfo/war-risk-oil-supply-insurance-shipping | 전쟁 유가 영향 | HIGH | MARKET_IMPACT / EXPLANATION | MID_TAIL | GEOPOLITICS / 전쟁 리스크와 원유 가격 chain | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | economicInfo/hormuz-risk-oil-insurance-freight-premium (HIGH); economicInfo/geopolitics-oil-fx-dashboard (MEDIUM); economicInfo/war-theme-investing-price-chain-not-winners (MEDIUM) |
| economicInfo | /posts/economicInfo/war-theme-investing-price-chain-not-winners | 전쟁 테마주 투자 리스크 | MEDIUM | DECISION_SUPPORT / CHECKLIST | MID_TAIL | GEOPOLITICS / 전쟁 테마 투자 판단 | LOW | HIGH | TAG_SUPPORTS_QUERY | economicInfo/geopolitics-oil-fx-dashboard (MEDIUM); economicInfo/war-risk-oil-supply-insurance-shipping (MEDIUM) |
| economicInfo | /posts/economicInfo/yield-curve-2s10s-3m10y-recession-reading | 장단기 금리차 경기침체 신호 | MEDIUM | DATA_INTERPRETATION / MARKET_IMPACT | DATA_QUERY | INTEREST_RATES / 수익률 곡선과 recession signal | LOW | HIGH | TAG_SUPPORTS_QUERY | - |
| investingInfo | /posts/investingInfo/bond-etf-duration-drives-returns | 채권 ETF 듀레이션 수익률 | HIGH | EXPLANATION / DECISION_SUPPORT | MID_TAIL | ETF / 채권 ETF와 duration | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/etf-impact-of-tnx (MEDIUM) |
| investingInfo | /posts/investingInfo/cagr-7percent-reality-check | 연 7% 수익률 현실성 | MEDIUM | SCENARIO_ANALYSIS / CALCULATION | MID_TAIL | CAGR / 목표 수익률 현실성 | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | investingInfo/diagnose-investing-skill-with-cagr (MEDIUM); investingInfo/why-check-cagr-etf (MEDIUM) |
| investingInfo | /posts/investingInfo/dca-consistency-7-fail-patterns | 적립식 투자 실패 패턴 | HIGH | CHECKLIST / HOW_TO | MID_TAIL | DCA / 적립식 투자 실행 실패 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/dca-step-up-ruleset (MEDIUM); personalFinance/dca-fx-volatility-decomposition (MEDIUM); personalFinance/dca-vs-lump-sum-when-results-differ (MEDIUM); personalFinance/dca-vs-lumpsum-decision-rules (MEDIUM) |
| investingInfo | /posts/investingInfo/diagnose-investing-skill-with-cagr | CAGR로 투자 성과 평가 | MEDIUM | HOW_TO / DATA_INTERPRETATION | MID_TAIL | CAGR / 투자 성과 진단 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/cagr-7percent-reality-check (MEDIUM); investingInfo/why-check-cagr-etf (MEDIUM); personalFinance/what-is-cagr (MEDIUM) |
| investingInfo | /posts/investingInfo/dxy-dollar-index-basics | 달러인덱스 뜻 | HIGH | DEFINITION / EXPLANATION | HEAD | DXY / 달러인덱스 기초 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/dxy-market-impact (MEDIUM) |
| investingInfo | /posts/investingInfo/dxy-market-impact | 달러인덱스 주식시장 영향 | MEDIUM | MARKET_IMPACT / DATA_INTERPRETATION | MID_TAIL | DXY / DXY와 자산시장 영향 | LOW | HIGH | TAG_SUPPORTS_QUERY | investingInfo/dxy-dollar-index-basics (MEDIUM) |
| investingInfo | /posts/investingInfo/etf-impact-of-tnx | 미국 10년물 금리 ETF 영향 | MEDIUM | MARKET_IMPACT / DATA_INTERPRETATION | LONG_TAIL | ETF / TNX와 ETF 가격 반응 | LOW | HIGH | TAG_SUPPORTS_QUERY | investingInfo/korea-etf-deep-dive-tnx (HIGH); investingInfo/bond-etf-duration-drives-returns (MEDIUM); investingInfo/tnx-basics (HIGH); investingInfo/us10y-impact-on-korea-and-stock-market (HIGH) |
| investingInfo | /posts/investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions | 환헤지 환노출 선택 기준 | MEDIUM | DECISION_SUPPORT / COMPARISON | MID_TAIL | FX / 환헤지와 환노출 선택 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | - |
| investingInfo | /posts/investingInfo/indicator-marketinfo | 투자 지표 보는 법 | MEDIUM | HOW_TO / DATA_INTERPRETATION | MID_TAIL | MACRO_INDICATORS / 투자용 시장지표 | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | economicInfo/indicator-basics (MEDIUM) |
| investingInfo | /posts/investingInfo/korea-etf-deep-dive-tnx | 국내 ETF 미국 10년물 금리 영향 | MEDIUM | DATA_INTERPRETATION / MARKET_IMPACT | LONG_TAIL | ETF / 국내 ETF와 TNX 민감도 | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | investingInfo/etf-impact-of-tnx (HIGH) |
| investingInfo | /posts/investingInfo/modern-6040-risk-budget | 60대40 포트폴리오 리스크 관리 | MEDIUM | DECISION_SUPPORT / SCENARIO_ANALYSIS | MID_TAIL | ASSET_ALLOCATION / 60/40와 risk budget | LOW | HIGH | TAG_SUPPORTS_QUERY | investingInfo/real-estate-role-in-portfolio-risk-budget (MEDIUM) |
| investingInfo | /posts/investingInfo/rates-discount-mortgage-demand-apt-prices | 금리 아파트 가격 영향 | HIGH | MARKET_IMPACT / EXPLANATION | MID_TAIL | REAL_ESTATE_DATA / 금리와 아파트 가격 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/apartment-transaction-volume-decline-meaning (MEDIUM); personalFinance/apt-dashboard-home-goal-roadmap (MEDIUM); personalFinance/how-to-read-apartment-transaction-prices (MEDIUM); personalFinance/large-apartment-complex-households-price-stability (MEDIUM) |
| investingInfo | /posts/investingInfo/real-estate-role-in-portfolio-risk-budget | 부동산 포트폴리오 비중 | MEDIUM | DECISION_SUPPORT / ASSET_ALLOCATION | MID_TAIL | ASSET_ALLOCATION / 부동산의 포트폴리오 역할 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/modern-6040-risk-budget (MEDIUM); investingInfo/seoul-gyeonggi-incheon-risk-budget-framework (HIGH) |
| investingInfo | /posts/investingInfo/seoul-gyeonggi-incheon-risk-budget-framework | 수도권 부동산 리스크 관리 | MEDIUM | DECISION_SUPPORT / SCENARIO_ANALYSIS | MID_TAIL | REAL_ESTATE_DATA / 수도권 지역별 risk budget | LOW | HIGH | TAG_SUPPORTS_QUERY | investingInfo/real-estate-role-in-portfolio-risk-budget (HIGH) |
| investingInfo | /posts/investingInfo/sp500-impact-on-korea-kospi | S&P500 코스피 영향 | HIGH | MARKET_IMPACT / DATA_INTERPRETATION | MID_TAIL | KOSPI_GLOBAL_LINK / S&P500과 코스피 연결 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/us10y-impact-on-korea-and-stock-market (HIGH); investingInfo/usd-krw-exchange-rate-and-kospi (MEDIUM) |
| investingInfo | /posts/investingInfo/tnx-basics | 미국 10년물 국채금리 뜻 | HIGH | DEFINITION / EXPLANATION | HEAD | TNX / 미국 10년물 금리 기초 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | economicInfo/interest-rate-basics (MEDIUM); investingInfo/us10y-impact-on-korea-and-stock-market (HIGH); investingInfo/etf-impact-of-tnx (HIGH) |
| investingInfo | /posts/investingInfo/us10y-impact-on-korea-and-stock-market | 미국 10년물 금리 한국 증시 영향 | HIGH | MARKET_IMPACT / DATA_INTERPRETATION | LONG_TAIL | TNX / TNX와 한국 증시 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/tnx-basics (HIGH); investingInfo/etf-impact-of-tnx (HIGH); investingInfo/sp500-impact-on-korea-kospi (HIGH) |
| investingInfo | /posts/investingInfo/usd-krw-exchange-rate-and-kospi | 원달러 환율 코스피 영향 | HIGH | MARKET_IMPACT / DATA_INTERPRETATION | MID_TAIL | KOSPI_GLOBAL_LINK / 환율과 코스피 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/usd-krw-weak-won-sector-map-kospi (HIGH); economicInfo/fx-basics (HIGH); economicInfo/oil-shock-to-usdkrw-korea-transmission (HIGH); investingInfo/sp500-impact-on-korea-kospi (MEDIUM) |
| investingInfo | /posts/investingInfo/usd-krw-weak-won-sector-map-kospi | 원화 약세 수혜 업종 | HIGH | DATA_INTERPRETATION / MARKET_IMPACT | DATA_QUERY | KOSPI_GLOBAL_LINK / 원화 약세와 업종 지도 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/usd-krw-exchange-rate-and-kospi (HIGH) |
| investingInfo | /posts/investingInfo/why-check-cagr-etf | ETF 투자 CAGR 확인 이유 | HIGH | EXPLANATION / HOW_TO | MID_TAIL | CAGR / ETF 성과와 CAGR | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/cagr-7percent-reality-check (MEDIUM); investingInfo/diagnose-investing-skill-with-cagr (MEDIUM); personalFinance/what-is-cagr (MEDIUM) |
| investingInfo | /posts/investingInfo/wti-impact-on-korea-kospi | WTI 유가 코스피 영향 | HIGH | MARKET_IMPACT / DATA_INTERPRETATION | MID_TAIL | OIL_ENERGY / WTI와 한국 증시 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | economicInfo/oil-shock-to-usdkrw-korea-transmission (HIGH) |
| personalFinance | /posts/personalFinance/annual-vs-monthly-compound | 연복리 월복리 차이 | MEDIUM | COMPARISON / EXPLANATION | MID_TAIL | COMPOUND_INTEREST / 복리 주기 비교 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/simple-vs-compound (MEDIUM); personalFinance/compound-calculator-guide (MEDIUM) |
| personalFinance | /posts/personalFinance/apartment-buying-calculator-guide | 아파트 구매 계산기 사용법 | HIGH | HOW_TO / CALCULATION | CALCULATOR_SUPPORT | REAL_ESTATE_BUDGET / 아파트 구매 계산기 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/first-home-buyer-budget-calculation (MEDIUM); personalFinance/cash-100m-200m-300m-apartment-budget (MEDIUM); personalFinance/apartment-buying-costs-before-purchase (MEDIUM) |
| personalFinance | /posts/personalFinance/apartment-buying-costs-before-purchase | 아파트 매수 비용 | HIGH | CHECKLIST / CALCULATION | MID_TAIL | REAL_ESTATE_BUDGET / 매수 전 부대비용 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/apartment-buying-calculator-guide (MEDIUM); personalFinance/first-home-buyer-budget-calculation (MEDIUM) |
| personalFinance | /posts/personalFinance/apartment-transaction-volume-decline-meaning | 아파트 거래량 감소 의미 | HIGH | DATA_INTERPRETATION / MARKET_IMPACT | DATA_QUERY | REAL_ESTATE_DATA / 거래량 해석 | HIGH | LOW | TAG_SUPPORTS_QUERY | investingInfo/rates-discount-mortgage-demand-apt-prices (MEDIUM); personalFinance/how-to-read-apartment-transaction-prices (MEDIUM) |
| personalFinance | /posts/personalFinance/apt-dashboard-home-goal-roadmap | 아파트 시세 대시보드 활용법 | MEDIUM | HOW_TO / DECISION_SUPPORT | DATA_QUERY | REAL_ESTATE_DATA / FinMap 아파트 대시보드 활용 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/rates-discount-mortgage-demand-apt-prices (MEDIUM); personalFinance/how-to-read-apartment-transaction-prices (MEDIUM) |
| personalFinance | /posts/personalFinance/cash-100m-200m-300m-apartment-budget | 현금 1억 2억 3억 아파트 예산 | HIGH | CALCULATION / SCENARIO_ANALYSIS | LONG_TAIL | REAL_ESTATE_BUDGET / 보유현금별 매수 예산 | HIGH | MEDIUM | TAG_PARTIALLY_SUPPORTS_QUERY | personalFinance/apartment-buying-calculator-guide (MEDIUM) |
| personalFinance | /posts/personalFinance/compound-calculator-guide | 복리 계산기 사용법 | HIGH | HOW_TO / CALCULATION | CALCULATOR_SUPPORT | COMPOUND_INTEREST / 복리 계산기 | HIGH | LOW | TAG_SUPPORTS_QUERY | personalFinance/compound-return-3-5-7-10-table (MEDIUM); personalFinance/simple-vs-compound (MEDIUM); personalFinance/annual-vs-monthly-compound (MEDIUM) |
| personalFinance | /posts/personalFinance/compound-return-3-5-7-10-table | 복리 수익률 기간별 결과 | MEDIUM | CALCULATION / SCENARIO_ANALYSIS | DATA_QUERY | COMPOUND_INTEREST / 수익률별 복리표 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/compound-calculator-guide (MEDIUM); personalFinance/simple-vs-compound (MEDIUM) |
| personalFinance | /posts/personalFinance/dca-fx-volatility-decomposition | 적립식 투자 환율 변동성 영향 | MEDIUM | EXPLANATION / SCENARIO_ANALYSIS | LONG_TAIL | DCA / DCA와 FX 변동성 | LOW | HIGH | TAG_SUPPORTS_QUERY | investingInfo/dca-consistency-7-fail-patterns (MEDIUM); personalFinance/dca-step-up-ruleset (MEDIUM); personalFinance/dca-vs-lump-sum-when-results-differ (MEDIUM); personalFinance/dca-vs-lumpsum-decision-rules (MEDIUM) |
| personalFinance | /posts/personalFinance/dca-step-up-ruleset | 적립식 투자 증액 전략 | MEDIUM | HOW_TO / DECISION_SUPPORT | MID_TAIL | DCA / 적립금 증액 규칙 | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | investingInfo/dca-consistency-7-fail-patterns (MEDIUM); personalFinance/dca-fx-volatility-decomposition (MEDIUM); personalFinance/dca-vs-lump-sum-when-results-differ (MEDIUM); personalFinance/dca-vs-lumpsum-decision-rules (MEDIUM) |
| personalFinance | /posts/personalFinance/dca-vs-lump-sum-when-results-differ | 적립식 투자 거치식 결과 차이 | MEDIUM | COMPARISON / SCENARIO_ANALYSIS | MID_TAIL | DCA / DCA와 일시금 결과 차이 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/dca-vs-lumpsum-decision-rules (HIGH); investingInfo/dca-consistency-7-fail-patterns (MEDIUM); personalFinance/dca-fx-volatility-decomposition (MEDIUM); personalFinance/dca-step-up-ruleset (MEDIUM) |
| personalFinance | /posts/personalFinance/dca-vs-lumpsum-decision-rules | 적립식 투자 일시금 투자 선택 | MEDIUM | DECISION_SUPPORT / COMPARISON | MID_TAIL | DCA / DCA vs lump sum decision rules | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/dca-vs-lump-sum-when-results-differ (HIGH); investingInfo/dca-consistency-7-fail-patterns (MEDIUM); personalFinance/dca-fx-volatility-decomposition (MEDIUM); personalFinance/dca-step-up-ruleset (MEDIUM) |
| personalFinance | /posts/personalFinance/dsr-40-income-loan-limit-table | DSR 40 연봉별 대출한도 | HIGH | CALCULATION / DATA_INTERPRETATION | DATA_QUERY | DSR_LTV / 연봉별 DSR 40 한도표 | HIGH | MEDIUM | TAG_PARTIALLY_SUPPORTS_QUERY | personalFinance/ltv-dsr-calculator-guide (MEDIUM); personalFinance/salary-40m-mortgage-limit (HIGH); personalFinance/salary-50m-dsr-40-loan-limit (HIGH) |
| personalFinance | /posts/personalFinance/dsr-pass-ltv-cash-bottleneck | DSR LTV 현금 부족 | HIGH | DECISION_SUPPORT / CALCULATION | MID_TAIL | DSR_LTV / 대출한도와 현금 bottleneck | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/ltv-dsr-calculator-guide (HIGH) |
| personalFinance | /posts/personalFinance/emergency-fund-by-risk | 비상금 얼마 필요 | MEDIUM | CALCULATION / CHECKLIST | QUESTION | HOUSEHOLD_FINANCE / 비상금 기준 | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | - |
| personalFinance | /posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal | 파이어족 은퇴자금 계산 | MEDIUM | CALCULATION / SCENARIO_ANALYSIS | CALCULATOR_SUPPORT | FIRE / FIRE 3 numbers | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | personalFinance/fire-assumption-errors-7-fixes (MEDIUM); personalFinance/fire-spending-buckets-essential-choice-insurance (MEDIUM) |
| personalFinance | /posts/personalFinance/fire-assumption-errors-7-fixes | 파이어족 계산 실수 | MEDIUM | CHECKLIST / DECISION_SUPPORT | MID_TAIL | FIRE / FIRE assumptions review | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | personalFinance/fire-3-numbers-spending-horizon-withdrawal (MEDIUM) |
| personalFinance | /posts/personalFinance/fire-sequence-risk-first-5-years | 은퇴 초기 순서위험 | MEDIUM | EXPLANATION / SCENARIO_ANALYSIS | MID_TAIL | FIRE / Sequence risk | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | - |
| personalFinance | /posts/personalFinance/fire-spending-buckets-essential-choice-insurance | 은퇴 생활비 버킷 전략 | MEDIUM | DECISION_SUPPORT / CHECKLIST | MID_TAIL | FIRE / 은퇴 지출 bucket | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/fire-3-numbers-spending-horizon-withdrawal (MEDIUM) |
| personalFinance | /posts/personalFinance/first-home-buyer-budget-calculation | 생애최초 주택 구입 예산 | HIGH | CALCULATION / DECISION_SUPPORT | LONG_TAIL | REAL_ESTATE_BUDGET / 생애최초 구입 예산 | HIGH | LOW | TAG_SUPPORTS_QUERY | personalFinance/apartment-buying-calculator-guide (MEDIUM); personalFinance/jeonse-to-home-purchase-cash-needed (MEDIUM); personalFinance/apartment-buying-costs-before-purchase (MEDIUM) |
| personalFinance | /posts/personalFinance/goal-amount-fast-strategy | 목표 금액 빨리 모으는 법 | HIGH | HOW_TO / CALCULATION | MID_TAIL | HOUSEHOLD_FINANCE / 목표금액 달성 전략 | HIGH | LOW | TAG_SUPPORTS_QUERY | - |
| personalFinance | /posts/personalFinance/high-rate-debt-vs-invest-threshold-rule | 고금리 대출 상환 투자 비교 | MEDIUM | DECISION_SUPPORT / COMPARISON | MID_TAIL | HOUSEHOLD_FINANCE / 부채 상환 vs 투자 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | - |
| personalFinance | /posts/personalFinance/how-much-monthly-invest-for-100m | 1억원 만들기 월 투자금 | MEDIUM | CALCULATION / HOW_TO | CALCULATOR_SUPPORT | DCA / 1억원 목표 월납입 계산 | LOW | HIGH | TAG_SUPPORTS_QUERY | personalFinance/how-much-per-month-for-100m (HIGH); personalFinance/monthly-investment-for-100m-table (HIGH) |
| personalFinance | /posts/personalFinance/how-much-per-month-for-100m | 1억 모으기 매달 얼마 | MEDIUM | CALCULATION / SCENARIO_ANALYSIS | QUESTION | DCA / 1억 목표 monthly question | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/how-much-monthly-invest-for-100m (HIGH); personalFinance/monthly-investment-for-100m-table (HIGH); personalFinance/dca-step-up-ruleset (MEDIUM); personalFinance/is-dca-better-in-bear-market (MEDIUM) |
| personalFinance | /posts/personalFinance/how-to-read-apartment-transaction-prices | 아파트 실거래가 보는 법 | HIGH | HOW_TO / DATA_INTERPRETATION | DATA_QUERY | REAL_ESTATE_DATA / 실거래가 읽기 | HIGH | LOW | TAG_SUPPORTS_QUERY | investingInfo/rates-discount-mortgage-demand-apt-prices (MEDIUM); personalFinance/apartment-transaction-volume-decline-meaning (MEDIUM); personalFinance/apt-dashboard-home-goal-roadmap (MEDIUM) |
| personalFinance | /posts/personalFinance/inflation-household-survival-strategy | 물가 상승 가계부 관리 | HIGH | HOW_TO / DECISION_SUPPORT | MID_TAIL | HOUSEHOLD_FINANCE / 가계 인플레이션 대응 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | - |
| personalFinance | /posts/personalFinance/interest-rate-1p-loan-limit-impact | 금리 1%p 대출한도 영향 | MEDIUM | CALCULATION / SCENARIO_ANALYSIS | LONG_TAIL | DSR_LTV / 금리 변화와 대출한도 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/ltv-dsr-calculator-guide (MEDIUM) |
| personalFinance | /posts/personalFinance/is-dca-better-in-bear-market | 하락장 적립식 투자 | HIGH | DECISION_SUPPORT / SCENARIO_ANALYSIS | MID_TAIL | DCA / 하락장 DCA decision | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/dca-consistency-7-fail-patterns (MEDIUM); personalFinance/dca-fx-volatility-decomposition (MEDIUM); personalFinance/dca-step-up-ruleset (HIGH); personalFinance/dca-vs-lump-sum-when-results-differ (MEDIUM) |
| personalFinance | /posts/personalFinance/jeonse-to-home-purchase-cash-needed | 전세에서 매매 갈아타기 현금 | HIGH | CALCULATION / DECISION_SUPPORT | LONG_TAIL | REAL_ESTATE_BUDGET / 전세에서 매매 전환 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/first-home-buyer-budget-calculation (MEDIUM) |
| personalFinance | /posts/personalFinance/large-apartment-complex-households-price-stability | 대단지 아파트 가격 안정성 | HIGH | EXPLANATION / DATA_INTERPRETATION | MID_TAIL | REAL_ESTATE_DATA / 단지 규모와 가격 안정성 | HIGH | LOW | TAG_SUPPORTS_QUERY | investingInfo/rates-discount-mortgage-demand-apt-prices (MEDIUM) |
| personalFinance | /posts/personalFinance/ltv-dsr-calculator-guide | LTV DSR 계산기 사용법 | HIGH | HOW_TO / CALCULATION | CALCULATOR_SUPPORT | DSR_LTV / LTV/DSR calculator guide | HIGH | LOW | TAG_SUPPORTS_QUERY | personalFinance/dsr-40-income-loan-limit-table (MEDIUM); personalFinance/dsr-pass-ltv-cash-bottleneck (HIGH); personalFinance/interest-rate-1p-loan-limit-impact (MEDIUM); personalFinance/salary-40m-mortgage-limit (MEDIUM) |
| personalFinance | /posts/personalFinance/monthly-dca-10-year-result | 월 적립식 투자 10년 결과 | HIGH | CALCULATION / SCENARIO_ANALYSIS | LONG_TAIL | DCA / 10년 월투자 결과 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/dca-consistency-7-fail-patterns (MEDIUM); personalFinance/dca-fx-volatility-decomposition (MEDIUM); personalFinance/dca-step-up-ruleset (MEDIUM); personalFinance/dca-vs-lump-sum-when-results-differ (HIGH) |
| personalFinance | /posts/personalFinance/monthly-investment-for-100m-table | 목표금액별 월 투자금 표 | MEDIUM | CALCULATION / DATA_INTERPRETATION | DATA_QUERY | DCA / 목표금액별 월납입 표 | MEDIUM | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/how-much-monthly-invest-for-100m (HIGH); personalFinance/how-much-per-month-for-100m (HIGH); investingInfo/dca-consistency-7-fail-patterns (MEDIUM); personalFinance/dca-fx-volatility-decomposition (MEDIUM) |
| personalFinance | /posts/personalFinance/mortgage-risk-checklist-dsr-variable | 주담대 위험 체크리스트 | MEDIUM | CHECKLIST / DECISION_SUPPORT | MID_TAIL | DSR_LTV / 주담대 risk checklist | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | - |
| personalFinance | /posts/personalFinance/personal-finance-3pillars | 개인 재무관리 3요소 | LOW | EXPLANATION / CHECKLIST | MID_TAIL | HOUSEHOLD_FINANCE / 개인재무 framework | LOW | HIGH | TAG_PARTIALLY_SUPPORTS_QUERY | personalFinance/personal-start-5steps (HIGH) |
| personalFinance | /posts/personalFinance/personal-start-5steps | 재테크 시작하는 법 | MEDIUM | HOW_TO / CHECKLIST | MID_TAIL | HOUSEHOLD_FINANCE / 재테크 시작 sequence | LOW | HIGH | TAG_SUPPORTS_QUERY | personalFinance/personal-finance-3pillars (HIGH) |
| personalFinance | /posts/personalFinance/rent-jeonse-buy-cashflow-opportunity-cost | 월세 전세 매매 비교 | HIGH | COMPARISON / DECISION_SUPPORT | MID_TAIL | REAL_ESTATE_BUDGET / 주거 선택 cashflow 비교 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | - |
| personalFinance | /posts/personalFinance/salary-40m-mortgage-limit | 연봉 4000만원 주담대 가능액 | HIGH | CALCULATION / SCENARIO_ANALYSIS | LONG_TAIL | DSR_LTV / 연봉 4000만원 주담대 scenario | HIGH | LOW | TAG_SUPPORTS_QUERY | personalFinance/dsr-40-income-loan-limit-table (HIGH); personalFinance/ltv-dsr-calculator-guide (MEDIUM); personalFinance/salary-50m-dsr-40-loan-limit (HIGH) |
| personalFinance | /posts/personalFinance/salary-50m-dsr-40-loan-limit | 연봉 5000만원 DSR 40 대출 가능액 | HIGH | CALCULATION / SCENARIO_ANALYSIS | LONG_TAIL | DSR_LTV / 연봉 5000만원 DSR scenario | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/dsr-40-income-loan-limit-table (HIGH); personalFinance/salary-40m-mortgage-limit (HIGH) |
| personalFinance | /posts/personalFinance/simple-vs-compound | 단리 복리 차이 | HIGH | COMPARISON / DEFINITION | MID_TAIL | COMPOUND_INTEREST / 단리 vs 복리 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | personalFinance/compound-calculator-guide (MEDIUM); personalFinance/annual-vs-monthly-compound (MEDIUM); personalFinance/compound-return-3-5-7-10-table (MEDIUM) |
| personalFinance | /posts/personalFinance/what-is-cagr | CAGR 뜻 | HIGH | DEFINITION / CALCULATION | HEAD | CAGR / CAGR 기초 | HIGH | MEDIUM | TAG_SUPPORTS_QUERY | investingInfo/diagnose-investing-skill-with-cagr (MEDIUM); investingInfo/why-check-cagr-etf (MEDIUM) |

## D. QUERY OWNERSHIP CONFLICT CANDIDATES

| Severity | Type | Post A | Post B | Overlap | Reason |
|---|---|---|---|---|---|
| HIGH | PRIMARY_SECONDARY | economicInfo/fx-basics | investingInfo/usd-krw-exchange-rate-and-kospi | query token overlap | primary 0.33, primary-secondary 0.67, secondary 0.50 |
| HIGH | PRIMARY_PRIMARY | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/geopolitics-to-usd-liquidity-fx | query token overlap | primary 0.60, primary-secondary 0.40, secondary 0.50 |
| HIGH | PRIMARY_SECONDARY | economicInfo/hormuz-risk-oil-insurance-freight-premium | economicInfo/war-risk-oil-supply-insurance-shipping | 중동/전쟁 유가 리스크 | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_SECONDARY | economicInfo/inflation-basics | economicInfo/inflation-rate-basics | 인플레이션과 물가상승률 기초 | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_SECONDARY | economicInfo/oil-shock-to-usdkrw-korea-transmission | investingInfo/usd-krw-exchange-rate-and-kospi | query token overlap | primary 0.40, primary-secondary 0.60, secondary 0.40 |
| HIGH | PRIMARY_SECONDARY | economicInfo/oil-shock-to-usdkrw-korea-transmission | investingInfo/wti-impact-on-korea-kospi | OIL_ENERGY | primary 0.17, primary-secondary 0.67, secondary 0.67 |
| HIGH | PRIMARY_PRIMARY | investingInfo/etf-impact-of-tnx | investingInfo/korea-etf-deep-dive-tnx | TNX와 ETF 영향 | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_SECONDARY | investingInfo/etf-impact-of-tnx | investingInfo/tnx-basics | query token overlap | primary 0.40, primary-secondary 0.60, secondary 0.40 |
| HIGH | PRIMARY_PRIMARY | investingInfo/etf-impact-of-tnx | investingInfo/us10y-impact-on-korea-and-stock-market | query token overlap | primary 0.50, primary-secondary 0.60, secondary 0.50 |
| HIGH | PRIMARY_SECONDARY | investingInfo/real-estate-role-in-portfolio-risk-budget | investingInfo/seoul-gyeonggi-incheon-risk-budget-framework | query token overlap | primary 0.17, primary-secondary 0.75, secondary 0.25 |
| HIGH | PRIMARY_SECONDARY | investingInfo/sp500-impact-on-korea-kospi | investingInfo/us10y-impact-on-korea-and-stock-market | query token overlap | primary 0.00, primary-secondary 0.60, secondary 0.75 |
| HIGH | PRIMARY_SECONDARY | investingInfo/tnx-basics | investingInfo/us10y-impact-on-korea-and-stock-market | 미국 10년물 금리 | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_SECONDARY | investingInfo/usd-krw-exchange-rate-and-kospi | investingInfo/usd-krw-weak-won-sector-map-kospi | 원달러 환율과 코스피/업종 | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_PRIMARY | personalFinance/dca-step-up-ruleset | personalFinance/is-dca-better-in-bear-market | DCA | primary 0.50, primary-secondary 0.50, secondary 0.40 |
| HIGH | PRIMARY_PRIMARY | personalFinance/dca-vs-lump-sum-when-results-differ | personalFinance/monthly-dca-10-year-result | DCA | primary 0.50, primary-secondary 0.50, secondary 0.40 |
| HIGH | PRIMARY_PRIMARY | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/dca-vs-lump-sum-when-results-differ | DCA vs 일시금 | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_SECONDARY | personalFinance/dsr-40-income-loan-limit-table | personalFinance/salary-40m-mortgage-limit | 연봉별 주담대 한도와 4000만원 scenario | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_SECONDARY | personalFinance/dsr-40-income-loan-limit-table | personalFinance/salary-50m-dsr-40-loan-limit | 연봉별 주담대 한도와 5000만원 scenario | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_PRIMARY | personalFinance/dsr-pass-ltv-cash-bottleneck | personalFinance/ltv-dsr-calculator-guide | DSR_LTV | primary 0.50, primary-secondary 0.50, secondary 0.40 |
| HIGH | PRIMARY_PRIMARY | personalFinance/how-much-monthly-invest-for-100m | personalFinance/how-much-per-month-for-100m | 1억원 목표 월 투자금 | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_SECONDARY | personalFinance/how-much-monthly-invest-for-100m | personalFinance/monthly-investment-for-100m-table | 목표금액 월 투자금 계산 | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_SECONDARY | personalFinance/how-much-per-month-for-100m | personalFinance/monthly-investment-for-100m-table | 1억/목표금액 월 납입표 | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_SECONDARY | personalFinance/personal-finance-3pillars | personalFinance/personal-start-5steps | 개인재무 입문 | Manual review candidate from overlapping query ownership and shared topic family. |
| HIGH | PRIMARY_SECONDARY | personalFinance/salary-40m-mortgage-limit | personalFinance/salary-50m-dsr-40-loan-limit | DSR_LTV | primary 0.25, primary-secondary 0.60, secondary 0.60 |
| MEDIUM | SECONDARY_SECONDARY | economicInfo/fx-basics | economicInfo/geopolitics-to-usd-liquidity-fx | FX | primary 0.25, primary-secondary 0.40, secondary 0.67 |
| MEDIUM | SECONDARY_SECONDARY | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/war-risk-oil-supply-insurance-shipping | GEOPOLITICS | primary 0.20, primary-secondary 0.33, secondary 0.50 |
| MEDIUM | SECONDARY_SECONDARY | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/war-theme-investing-price-chain-not-winners | GEOPOLITICS | primary 0.14, primary-secondary 0.40, secondary 0.75 |
| MEDIUM | PRIMARY_PRIMARY | economicInfo/indicator-basics | investingInfo/indicator-marketinfo | 경제지표/투자지표 보는 법 | Manual review candidate from overlapping query ownership and shared topic family. |
| MEDIUM | PRIMARY_SECONDARY | economicInfo/interest-rate-basics | economicInfo/policy-rate-cut-market-rates | 금리와 기준금리 영향 | Manual review candidate from overlapping query ownership and shared topic family. |
| MEDIUM | SECONDARY_SECONDARY | economicInfo/interest-rate-basics | investingInfo/tnx-basics | 금리 뜻과 국채금리 뜻 | Manual review candidate from overlapping query ownership and shared topic family. |
| MEDIUM | SECONDARY_SECONDARY | economicInfo/war-risk-oil-supply-insurance-shipping | economicInfo/war-theme-investing-price-chain-not-winners | GEOPOLITICS | primary 0.20, primary-secondary 0.40, secondary 0.50 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/bond-etf-duration-drives-returns | investingInfo/etf-impact-of-tnx | ETF | primary 0.14, primary-secondary 0.40, secondary 0.50 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/cagr-7percent-reality-check | investingInfo/diagnose-investing-skill-with-cagr | CAGR | primary 0.00, primary-secondary 0.25, secondary 0.50 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/cagr-7percent-reality-check | investingInfo/why-check-cagr-etf | CAGR | primary 0.00, primary-secondary 0.20, secondary 0.50 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/dca-consistency-7-fail-patterns | personalFinance/dca-fx-volatility-decomposition | DCA | primary 0.33, primary-secondary 0.40, secondary 0.40 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/dca-consistency-7-fail-patterns | personalFinance/dca-step-up-ruleset | 적립식 투자 실행 규칙 | Manual review candidate from overlapping query ownership and shared topic family. |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/dca-consistency-7-fail-patterns | personalFinance/dca-vs-lump-sum-when-results-differ | DCA | primary 0.29, primary-secondary 0.33, secondary 0.40 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/dca-consistency-7-fail-patterns | personalFinance/dca-vs-lumpsum-decision-rules | DCA | primary 0.33, primary-secondary 0.40, secondary 0.50 |
| MEDIUM | PRIMARY_SECONDARY | investingInfo/dca-consistency-7-fail-patterns | personalFinance/is-dca-better-in-bear-market | DCA | primary 0.40, primary-secondary 0.50, secondary 0.50 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/dca-consistency-7-fail-patterns | personalFinance/monthly-dca-10-year-result | DCA | primary 0.33, primary-secondary 0.40, secondary 0.40 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/dca-consistency-7-fail-patterns | personalFinance/monthly-investment-for-100m-table | DCA | primary 0.00, primary-secondary 0.40, secondary 0.50 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/diagnose-investing-skill-with-cagr | investingInfo/why-check-cagr-etf | CAGR | primary 0.13, primary-secondary 0.33, secondary 0.50 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/diagnose-investing-skill-with-cagr | personalFinance/what-is-cagr | CAGR | primary 0.00, primary-secondary 0.33, secondary 0.67 |
| MEDIUM | PRIMARY_SECONDARY | investingInfo/dxy-dollar-index-basics | investingInfo/dxy-market-impact | 달러인덱스 정의와 영향 | Manual review candidate from overlapping query ownership and shared topic family. |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/modern-6040-risk-budget | investingInfo/real-estate-role-in-portfolio-risk-budget | ASSET_ALLOCATION | primary 0.17, primary-secondary 0.40, secondary 0.33 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/rates-discount-mortgage-demand-apt-prices | personalFinance/apartment-transaction-volume-decline-meaning | REAL_ESTATE_DATA | primary 0.20, primary-secondary 0.20, secondary 0.50 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/rates-discount-mortgage-demand-apt-prices | personalFinance/apt-dashboard-home-goal-roadmap | REAL_ESTATE_DATA | primary 0.17, primary-secondary 0.40, secondary 0.20 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/rates-discount-mortgage-demand-apt-prices | personalFinance/how-to-read-apartment-transaction-prices | REAL_ESTATE_DATA | primary 0.20, primary-secondary 0.40, secondary 0.20 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/rates-discount-mortgage-demand-apt-prices | personalFinance/large-apartment-complex-households-price-stability | REAL_ESTATE_DATA | primary 0.40, primary-secondary 0.40, secondary 0.20 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/sp500-impact-on-korea-kospi | investingInfo/usd-krw-exchange-rate-and-kospi | KOSPI_GLOBAL_LINK | primary 0.25, primary-secondary 0.25, secondary 0.40 |
| MEDIUM | SECONDARY_SECONDARY | investingInfo/why-check-cagr-etf | personalFinance/what-is-cagr | CAGR | primary 0.20, primary-secondary 0.40, secondary 1.00 |
| MEDIUM | SECONDARY_SECONDARY | personalFinance/annual-vs-monthly-compound | personalFinance/compound-calculator-guide | COMPOUND_INTEREST | primary 0.00, primary-secondary 0.25, secondary 0.75 |
| MEDIUM | SECONDARY_SECONDARY | personalFinance/annual-vs-monthly-compound | personalFinance/simple-vs-compound | 복리 방식 비교 | Manual review candidate from overlapping query ownership and shared topic family. |
| MEDIUM | SECONDARY_SECONDARY | personalFinance/apartment-buying-calculator-guide | personalFinance/apartment-buying-costs-before-purchase | REAL_ESTATE_BUDGET | primary 0.25, primary-secondary 0.25, secondary 0.33 |
| MEDIUM | PRIMARY_SECONDARY | personalFinance/apartment-buying-calculator-guide | personalFinance/cash-100m-200m-300m-apartment-budget | 보유현금별 아파트 예산 | Manual review candidate from overlapping query ownership and shared topic family. |
| MEDIUM | PRIMARY_SECONDARY | personalFinance/apartment-buying-calculator-guide | personalFinance/first-home-buyer-budget-calculation | 주택 구입 예산 계산 | Manual review candidate from overlapping query ownership and shared topic family. |
| MEDIUM | SECONDARY_SECONDARY | personalFinance/apartment-buying-costs-before-purchase | personalFinance/first-home-buyer-budget-calculation | REAL_ESTATE_BUDGET | primary 0.00, primary-secondary 0.33, secondary 0.75 |
| MEDIUM | SECONDARY_SECONDARY | personalFinance/apartment-transaction-volume-decline-meaning | personalFinance/how-to-read-apartment-transaction-prices | REAL_ESTATE_DATA | primary 0.20, primary-secondary 0.40, secondary 0.20 |
| MEDIUM | PRIMARY_SECONDARY | personalFinance/apt-dashboard-home-goal-roadmap | personalFinance/how-to-read-apartment-transaction-prices | REAL_ESTATE_DATA | primary 0.17, primary-secondary 0.50, secondary 0.50 |
| MEDIUM | PRIMARY_SECONDARY | personalFinance/compound-calculator-guide | personalFinance/compound-return-3-5-7-10-table | 복리 계산과 복리 결과표 | Manual review candidate from overlapping query ownership and shared topic family. |

## E. UNCLEAR QUERY OWNERSHIP

| Post | Primary Query | Reasons | Notes |
|---|---|---|---|
| economicInfo/geopolitics-oil-fx-dashboard | 지정학 리스크 유가 환율 영향 | MULTIPLE_INTENTS | 유가와 환율을 함께 읽는 bridge 문서다. |
| economicInfo/geopolitics-to-usd-liquidity-fx | 지정학 리스크 달러 환율 | OVERLAPS_OTHER_POST, TITLE_DEPENDENCY | 지정학 이벤트가 달러 강세와 원화 약세로 번지는 경로를 맡는다. |
| economicInfo/indicator-basics | 경제지표 보는 법 | TOO_BROAD, OVERLAPS_OTHER_POST | 거시 지표 전체의 입문 문서라 범위가 넓다. |
| economicInfo/inflation-rate-basics | 물가상승률 뜻 | WEAK_SEARCH_PHRASE, TITLE_DEPENDENCY | 인플레이션 자체보다 측정 지표와 읽는 법에 초점을 둔다. |
| economicInfo/oil-shock-to-usdkrw-korea-transmission | 유가 상승 원달러 환율 영향 | TITLE_DEPENDENCY | 중동 운송 리스크보다 한국 원화와 수입물가 전이에 가깝다. |
| economicInfo/tariffs-growth-margins-fx-package-shock | 관세 인상 경제 영향 | TITLE_DEPENDENCY | 관세를 물가와 환율까지 묶은 패키지 shock으로 본다. |
| economicInfo/war-theme-investing-price-chain-not-winners | 전쟁 테마주 투자 리스크 | EDITORIAL_TITLE | 시장 영향 해설이 아니라 투자 의사결정 위험을 담당한다. |
| economicInfo/yield-curve-2s10s-3m10y-recession-reading | 장단기 금리차 경기침체 신호 | TITLE_DEPENDENCY | 금리 레벨이 아니라 금리차 해석 문서다. |
| investingInfo/cagr-7percent-reality-check | 연 7% 수익률 현실성 | TITLE_DEPENDENCY | CAGR 기초가 아니라 기대수익률 가정 검증 문서다. |
| investingInfo/dxy-market-impact | 달러인덱스 주식시장 영향 | TITLE_DEPENDENCY | 달러인덱스 정의 문서와 영향 문서의 경계를 둔다. |
| investingInfo/etf-impact-of-tnx | 미국 10년물 금리 ETF 영향 | TITLE_DEPENDENCY | ETF를 중심에 두고 TNX 영향을 설명한다. |
| investingInfo/indicator-marketinfo | 투자 지표 보는 법 | TOO_BROAD, OVERLAPS_OTHER_POST, TITLE_DEPENDENCY | 경제지표 일반론보다 투자 화면에서 볼 지표에 가깝다. |
| investingInfo/korea-etf-deep-dive-tnx | 국내 ETF 미국 10년물 금리 영향 | TITLE_DEPENDENCY | 국내 상장 ETF 관점으로 좁힌 TNX 문서다. |
| investingInfo/modern-6040-risk-budget | 60대40 포트폴리오 리스크 관리 | WEAK_SEARCH_PHRASE, TITLE_DEPENDENCY | 자산배분의 core document 후보로 볼 수 있다. |
| investingInfo/real-estate-role-in-portfolio-risk-budget | 부동산 포트폴리오 비중 | MULTIPLE_INTENTS | 부동산 데이터 해석보다 자산배분 역할에 둔다. |
| investingInfo/seoul-gyeonggi-incheon-risk-budget-framework | 수도권 부동산 리스크 관리 | WEAK_SEARCH_PHRASE, TITLE_DEPENDENCY | 서울/경기/인천 선택 프레임워크 문서다. |
| personalFinance/dca-fx-volatility-decomposition | 적립식 투자 환율 변동성 영향 | TITLE_DEPENDENCY | DCA 일반론보다 환율 decomposition 문서다. |
| personalFinance/dca-step-up-ruleset | 적립식 투자 증액 전략 | TITLE_DEPENDENCY | 투자 방식 비교가 아니라 납입액 운영 규칙이다. |
| personalFinance/emergency-fund-by-risk | 비상금 얼마 필요 | TITLE_DEPENDENCY | 개인 재무의 cash buffer query다. |
| personalFinance/fire-3-numbers-spending-horizon-withdrawal | 파이어족 은퇴자금 계산 | TITLE_DEPENDENCY | FIRE 계열의 자금 계산 대표 문서다. |
| personalFinance/fire-assumption-errors-7-fixes | 파이어족 계산 실수 | TITLE_DEPENDENCY | FIRE 계산 후 검증 checklist 문서다. |
| personalFinance/fire-sequence-risk-first-5-years | 은퇴 초기 순서위험 | TITLE_DEPENDENCY | FIRE 계산보다 인출 순서 리스크를 맡는다. |
| personalFinance/goal-amount-fast-strategy | 목표 금액 빨리 모으는 법 | TOO_BROAD | 목표금액 계산과 실행 전략 사이의 문서다. |
| personalFinance/how-much-monthly-invest-for-100m | 1억원 만들기 월 투자금 | OVERLAPS_OTHER_POST, TITLE_DEPENDENCY | 1억원 목표를 계산기와 연결하는 대표 후보 중 하나다. |
| personalFinance/how-much-per-month-for-100m | 1억 모으기 매달 얼마 | OVERLAPS_OTHER_POST | 사용자 질문형 표현을 맡지만 1억원 월납입 문서들과 충돌한다. |
| personalFinance/monthly-investment-for-100m-table | 목표금액별 월 투자금 표 | OVERLAPS_OTHER_POST | 1억원 단일 query보다 table/targets query에 둔다. |
| personalFinance/mortgage-risk-checklist-dsr-variable | 주담대 위험 체크리스트 | TITLE_DEPENDENCY | 한도 계산 이후 risk review 문서다. |
| personalFinance/personal-finance-3pillars | 개인 재무관리 3요소 | TOO_BROAD, OVERLAPS_OTHER_POST, WEAK_SEARCH_PHRASE, TITLE_DEPENDENCY | 개인재무의 broad framework라 ownership review가 필요하다. |
| personalFinance/personal-start-5steps | 재테크 시작하는 법 | TOO_BROAD, OVERLAPS_OTHER_POST, TITLE_DEPENDENCY | 개인재무 framework와 겹치지만 starter sequence를 맡긴다. |

## F. TAG VS QUERY ANALYSIS

- TAG_SUPPORTS_QUERY: 64
- TAG_PARTIALLY_SUPPORTS_QUERY: 15
- TAG_WEAKLY_SUPPORTS_QUERY: 0

| Post | Tag Support | Tags Supporting Primary | Missing Query Concepts | Broad/Generic Tags |
|---|---|---|---|---|
| economicInfo/inflation-basics | TAG_PARTIALLY_SUPPORTS_QUERY | - | 인플레이션 | 물가; 금리; 통화정책; 기준금리; 경제기초; 투자기초; 매크로 |
| economicInfo/inflation-rate-basics | TAG_PARTIALLY_SUPPORTS_QUERY | - | 물가상승률 | 물가; 금리; 인플레이션; 기준금리; 통화정책; 경제기초 |
| economicInfo/tariffs-growth-margins-fx-package-shock | TAG_PARTIALLY_SUPPORTS_QUERY | 관세 | 인상; 경제 | 관세; 무역전쟁; 교역; 성장; 기업마진; 가격전가; 환율; 원달러 |
| investingInfo/cagr-7percent-reality-check | TAG_PARTIALLY_SUPPORTS_QUERY | 연7% | 수익률; 현실성 | CAGR; 복리; S&P500; 연7%; 투자기초; 재테크전략 |
| investingInfo/indicator-marketinfo | TAG_PARTIALLY_SUPPORTS_QUERY | - | 투자; 지표; 보는 | 코스피; 원달러환율; WTI; 미국증시; DXY; 10년물국채; Stoxx50 |
| investingInfo/korea-etf-deep-dive-tnx | TAG_PARTIALLY_SUPPORTS_QUERY | 한국ETF; 반도체ETF; ETF매크로 | 국내; 미국; 10년물; 금리 | 한국ETF; EWY; KOSPI; TNX; DXY; KRW; 반도체ETF; ETF매크로 |
| personalFinance/cash-100m-200m-300m-apartment-budget | TAG_PARTIALLY_SUPPORTS_QUERY | 보유현금; 아파트 구매 가능 금액 | 1억; 2억; 3억; 예산 | 보유현금; DSR 계산기; LTV 계산기; 부대비용; 부동산 실거래 |
| personalFinance/dca-step-up-ruleset | TAG_PARTIALLY_SUPPORTS_QUERY | 적립식 | 투자; 증액 | DCA; 적립식; 월 납입액; 스텝업; 현금흐름; 비상금 |
| personalFinance/dsr-40-income-loan-limit-table | TAG_PARTIALLY_SUPPORTS_QUERY | DSR 계산기 | 40; 연봉별; 대출한도 | DSR 계산기; LTV 계산기; 대출 가능액; 부동산 실거래; 원리금균등 |
| personalFinance/emergency-fund-by-risk | TAG_PARTIALLY_SUPPORTS_QUERY | 비상금 | 얼마; 필요 | 비상금; 현금흐름; 가계부; 예산; 리스크관리; 실직리스크; 부채; 변동금리 |
| personalFinance/fire-3-numbers-spending-horizon-withdrawal | TAG_PARTIALLY_SUPPORTS_QUERY | - | 파이어족; 은퇴자금; 계산 | 은퇴자산; FIRE; 연지출; 은퇴기간; 인출률; 4%룰; 국민연금; 퇴직연금 |
| personalFinance/fire-assumption-errors-7-fixes | TAG_PARTIALLY_SUPPORTS_QUERY | - | 파이어족; 계산; 실수 | FIRE; 은퇴설계; 인출률; 가정오류; 수익률; 인플레이션; 세금; 국민연금 |
| personalFinance/fire-sequence-risk-first-5-years | TAG_PARTIALLY_SUPPORTS_QUERY | 은퇴 5년 | 초기; 순서위험 | FIRE; 인출 전략; 인출률; 현금흐름; 국민연금; 퇴직연금; IRP; 건강보험료 |
| personalFinance/mortgage-risk-checklist-dsr-variable | TAG_PARTIALLY_SUPPORTS_QUERY | 주담대 한도 | 위험; 체크리스트 | 주택대출; DSR 계산기; LTV 계산기; 대출 리스크; 비상금; 부동산 실거래 |
| personalFinance/personal-finance-3pillars | TAG_PARTIALLY_SUPPORTS_QUERY | - | 개인; 재무관리; 3요소 | 가계재무; 예산; 비상금; 장기투자; 현금흐름; 재테크기초; 체크리스트 |

## G. TOPIC COVERAGE GAPS

- DCA: TOPIC_HUB_CANDIDATE - 하위 문서가 많아 향후 hub/overview 후보 검토 가치가 있다.
- DSR_LTV: TOPIC_HUB_CANDIDATE - 하위 문서가 많아 향후 hub/overview 후보 검토 가치가 있다.
- HOUSEHOLD_FINANCE: TOPIC_HUB_CANDIDATE - 하위 문서가 많아 향후 hub/overview 후보 검토 가치가 있다.
- REAL_ESTATE_BUDGET: TOPIC_HUB_CANDIDATE - 하위 문서가 많아 향후 hub/overview 후보 검토 가치가 있다.
- REAL_ESTATE_DATA: TOPIC_HUB_CANDIDATE - 하위 문서가 많아 향후 hub/overview 후보 검토 가치가 있다.

## H. CASE STUDY: Middle East Oil Transport Risk

- Primary owner candidate for "중동 원유 운송 리스크": economicInfo/hormuz-risk-oil-insurance-freight-premium
- Recommended primary owner query: 중동 원유 운송 리스크
- Assessment: 두 문서는 분리 가능하다. hormuz 문서는 특정 chokepoint와 운송/보험/운임 프리미엄을 소유하고, war-risk 문서는 전쟁이라는 더 넓은 shock이 원유 공급과 물가로 번지는 chain을 소유하는 편이 자연스럽다.
- economicInfo/hormuz-risk-oil-insurance-freight-premium should own: 중동 원유 운송 리스크; 호르무즈 해협 유가; 원유 운송 보험료; 해상 운임 유가 영향; 운송 차질과 risk premium
- economicInfo/war-risk-oil-supply-insurance-shipping should own: 전쟁 유가 영향; 전쟁 원유 공급 리스크; 전쟁 보험료 운임 유가; 지정학 리스크 원유 가격; 전쟁 리스크 인플레이션
- Title-query alignment: HIGH
- Tag-query alignment: TAG_SUPPORTS_QUERY
- Related/competing FinMap posts: economicInfo/war-risk-oil-supply-insurance-shipping (HIGH)
- Current separation assessment: YES, 분리 가능하지만 Step 3에서 내부링크 anchor와 query boundary를 확인해야 한다.

## I. DATA QUALITY / LIMITATIONS

- This audit used Step 1 inventory JSON plus repository markdown only.
- No Naver Search, Naver Search Advisor, GSC, keyword volume, click, impression, or ranking data was used.
- Confidence means content-query fit inside FinMap source, not expected ranking difficulty or traffic.
- Ownership conflicts are review candidates only. No merge, redirect, delete, rewrite, priority, or scoring decision is made in Step 2.
- Tag-query matching is lexical. Some existing tag text appears inconsistent in the source/report encoding, so tag support should be treated as a first-pass baseline.

## Generated Files

- `reports/naver-ko-post-query-intent-2026-09-16.md`
- `reports/naver-ko-post-query-intent-2026-09-16.json`
- `reports/naver-ko-post-query-map-2026-09-16.csv`

## Step 3 Readiness

Step 3 Cannibalization / Query Ownership Audit readiness: YES

