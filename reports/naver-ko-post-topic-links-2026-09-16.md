# FinMap KO Post Internal Link / Topic Cluster Architecture Audit

Generated: 2026-09-16T23:19:53.207Z

## Final Verdict

Final Verdict: TOPIC_LINK_AUDIT_COMPLETE_WITH_REVIEW_ITEMS

This is an audit/design-only Step 4 output. No post content, internal links, frontmatter, sitemap, canonical, hreflang, schema, component, or runtime code was changed.

## Summary

- total contextual internal links: 1041
- related-template links: 395
- core -> spoke missing count: 3
- spoke -> core missing count: 10
- weak owner anchor count: 1
- generic contextual anchor count: 3
- topic isolated posts: 4
- cross-category weak posts: 27
- high-value link opportunities: 22
- HUB_REQUIRED count: 1
- HUB_USEFUL count: 4
- HUB_NOT_NEEDED count: 14

## Internal Link Graph Overview

- EXPLICIT_CONTEXTUAL post links: 665
- TOOL_CTA links: 434
- MARKET_DASHBOARD_LINK links: 92
- RELATED_POST_TEMPLATE links: 395
- CATEGORY_TEMPLATE links: 79
- SITEMAP_OR_INDEX_PAGE links: 79

## Topic Family Link Coverage

| Topic Family | Posts | Core -> Spoke | Spoke -> Core | Weak Anchors | Status |
|---|---:|---|---|---:|---|
| ASSET_ALLOCATION | 3 | 2/2 | 2/2 | 0 | STRONG |
| CAGR | 4 | 3/3 | 3/3 | 0 | STRONG |
| COMPOUND_INTEREST | 4 | 3/3 | 0/3 | 0 | PARTIAL |
| DCA | 10 | 6/9 | 8/9 | 0 | STRONG |
| DSR_LTV | 7 | 8/10 | 5/10 | 0 | STRONG |
| DXY | 2 | 1/1 | 1/1 | 0 | STRONG |
| ETF | 3 | 2/2 | 0/2 | 1 | PARTIAL |
| FIRE | 4 | 2/3 | 3/3 | 0 | STRONG |
| FX | 3 | 2/2 | 2/2 | 0 | STRONG |
| GEOPOLITICS | 4 | 0/4 | 0/4 | 0 | PARTIAL |
| HOUSEHOLD_FINANCE | 6 | 3/5 | 4/5 | 0 | STRONG |
| INFLATION | 2 | 1/1 | 1/1 | 0 | STRONG |
| INTEREST_RATES | 4 | 0/3 | 3/3 | 0 | PARTIAL |
| KOSPI_GLOBAL_LINK | 3 | 2/2 | 1/2 | 0 | STRONG |
| MACRO_INDICATORS | 2 | 1/1 | 0/1 | 0 | PARTIAL |
| OIL_ENERGY | 4 | 2/3 | 1/3 | 0 | PARTIAL |
| REAL_ESTATE_BUDGET | 6 | 5/5 | 3/5 | 0 | STRONG |
| REAL_ESTATE_DATA | 6 | 5/5 | 5/5 | 0 | STRONG |
| TNX | 2 | 1/1 | 1/1 | 0 | STRONG |

## Core -> Spoke Audit

| Topic | Core | Spoke | Status | Link Type | Anchors |
|---|---|---|---|---|---|
| CAGR | personalFinance/what-is-cagr | investingInfo/cagr-7percent-reality-check | PARTIAL | EXPLICIT_CONTEXTUAL | 연 7% 복리 현실 체크 |
| CAGR | personalFinance/what-is-cagr | investingInfo/diagnose-investing-skill-with-cagr | PARTIAL | EXPLICIT_CONTEXTUAL | CAGR로 투자 실력 진단하기 |
| DCA | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/dca-step-up-ruleset | WEAK | RELATED_POST_TEMPLATE | DCA의 핵심은 ‘월 납입액 설계’다: 증액(스텝업)·감액·일시중단 조건을 운영규칙으로 만드는 법 |
| DCA | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/how-much-monthly-invest-for-100m | PARTIAL | EXPLICIT_CONTEXTUAL | 1억원 목표에 필요한 월 납입금을 기간·수익률별로 계산하는 글 |
| DCA | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/how-much-per-month-for-100m | MISSING | NONE | - |
| DCA | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/monthly-investment-for-100m-table | WEAK | RELATED_POST_TEMPLATE | 1억 만들기 월 투자금 표 \| 5년 10년 15년 20년 수익률별 계산 |
| DSR_LTV | personalFinance/dsr-40-income-loan-limit-table | personalFinance/dsr-pass-ltv-cash-bottleneck | PARTIAL | EXPLICIT_CONTEXTUAL | DSR은 통과했는데 왜 집을 못 살까? |
| DSR_LTV | personalFinance/dsr-40-income-loan-limit-table | personalFinance/mortgage-risk-checklist-dsr-variable | PARTIAL | EXPLICIT_CONTEXTUAL | 아파트 매수 전 대출 리스크 체크리스트 |
| DSR_LTV | personalFinance/dsr-40-income-loan-limit-table | personalFinance/salary-40m-mortgage-limit | WEAK | EXPLICIT_CONTEXTUAL | 연봉 4000만원 주담대 가능액을 별도 사례로 확인하기 |
| DSR_LTV | personalFinance/ltv-dsr-calculator-guide | personalFinance/dsr-pass-ltv-cash-bottleneck | PARTIAL | EXPLICIT_CONTEXTUAL | DSR은 통과했는데 왜 집을 못 살까 |
| DSR_LTV | personalFinance/ltv-dsr-calculator-guide | personalFinance/mortgage-risk-checklist-dsr-variable | PARTIAL | EXPLICIT_CONTEXTUAL | 아파트 매수 전 대출 리스크 체크리스트로 금리·비상금까지 점검하기 |
| DSR_LTV | personalFinance/ltv-dsr-calculator-guide | personalFinance/salary-40m-mortgage-limit | WEAK | RELATED_POST_TEMPLATE | 연봉 4000만원 주담대 가능액 계산 \| DSR 40% LTV 예산표 |
| DXY | investingInfo/dxy-dollar-index-basics | investingInfo/dxy-market-impact | PARTIAL | EXPLICIT_CONTEXTUAL | DXY가 시장을 움직이는 방식 미국 주식·원달러·코스피 영향 |
| FIRE | personalFinance/fire-3-numbers-spending-horizon-withdrawal | personalFinance/fire-assumption-errors-7-fixes | PARTIAL | EXPLICIT_CONTEXTUAL | FIRE 계산에서 자주 틀리는 가정 7가지를 점검하는 법 |
| FIRE | personalFinance/fire-3-numbers-spending-horizon-withdrawal | personalFinance/fire-sequence-risk-first-5-years | WEAK | EXPLICIT_CONTEXTUAL | 은퇴 초반 5년 수익률 순서 리스크를 먼저 확인하기 |
| FX | economicInfo/fx-basics | investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions | PARTIAL | EXPLICIT_CONTEXTUAL | 기간·현금흐름 통화·헤지 비용으로 환헤지 여부를 정하는 글 |
| GEOPOLITICS | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/tariffs-growth-margins-fx-package-shock | WEAK | RELATED_POST_TEMPLATE | 관세는 ‘물가’만의 문제가 아니다: 성장·마진·환율을 동시에 흔드는 패키지 충격 |
| GEOPOLITICS | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/war-theme-investing-price-chain-not-winners | MISSING | NONE | - |
| GEOPOLITICS | economicInfo/war-risk-oil-supply-insurance-shipping | economicInfo/tariffs-growth-margins-fx-package-shock | WEAK | RELATED_POST_TEMPLATE | 관세는 ‘물가’만의 문제가 아니다: 성장·마진·환율을 동시에 흔드는 패키지 충격 |
| GEOPOLITICS | economicInfo/war-risk-oil-supply-insurance-shipping | economicInfo/war-theme-investing-price-chain-not-winners | MISSING | NONE | - |
| HOUSEHOLD_FINANCE | personalFinance/personal-finance-3pillars | personalFinance/emergency-fund-by-risk | PARTIAL | EXPLICIT_CONTEXTUAL | 비상금 규모를 직장·가족·대출 리스크로 계산하기 |
| HOUSEHOLD_FINANCE | personalFinance/personal-finance-3pillars | personalFinance/high-rate-debt-vs-invest-threshold-rule | WEAK | RELATED_POST_TEMPLATE | 고금리 시대: 빚부터 갚을까, 투자부터 할까? (이자율 ‘임계값’ 룰) |
| HOUSEHOLD_FINANCE | personalFinance/personal-finance-3pillars | personalFinance/inflation-household-survival-strategy | WEAK | RELATED_POST_TEMPLATE | 물가 상승 시대의 가계 생존전략: 생활비/고정비 줄이기, 현금흐름 관리(가계부·예산·비상금) |
| HOUSEHOLD_FINANCE | personalFinance/personal-finance-3pillars | personalFinance/personal-start-5steps | PARTIAL | EXPLICIT_CONTEXTUAL | 사회초년생을 위한 월급 관리 5단계 가이드; 사회초년생 월급 관리를 처음 실행하는 5단계 순서 보기 |
| INTEREST_RATES | economicInfo/interest-rate-basics | economicInfo/policy-rate-cut-market-rates | WEAK | RELATED_POST_TEMPLATE | 금리 인하에도 대출금리가 안 내려가는 이유: 정책금리 vs 시장금리 |
| INTEREST_RATES | economicInfo/interest-rate-basics | economicInfo/real-rates-and-breakevens | WEAK | RELATED_POST_TEMPLATE | 실질금리(Real Rate)와 기대인플레이션(Breakeven): 자산가격의 ‘진짜 온도계’ |
| INTEREST_RATES | economicInfo/interest-rate-basics | economicInfo/yield-curve-2s10s-3m10y-recession-reading | WEAK | RELATED_POST_TEMPLATE | 수익률곡선(2y~10y, 3m~10y)은 왜 다르게 말하나: 침체 신호 해석법 |
| OIL_ENERGY | economicInfo/hormuz-risk-oil-insurance-freight-premium | economicInfo/oil-shock-to-usdkrw-korea-transmission | WEAK | RELATED_POST_TEMPLATE | 유가 급등이 원/달러에 미치는 영향: 한국식 전파 경로(무역수지·물가·수급)로 읽기 |
| OIL_ENERGY | economicInfo/hormuz-risk-oil-insurance-freight-premium | investingInfo/wti-impact-on-korea-kospi | PARTIAL | EXPLICIT_CONTEXTUAL | WTI가 한국 경제에 미치는 5단 연결(핵심 요약) |
| REAL_ESTATE_DATA | personalFinance/apt-dashboard-home-goal-roadmap | investingInfo/seoul-gyeonggi-incheon-risk-budget-framework | PARTIAL | EXPLICIT_CONTEXTUAL | 서울·경기·인천을 지역 선택이 아니라 리스크 예산으로 나누는 법 |

## Spoke -> Core Audit

| Topic | Core | Spoke | Status | Link Type | Anchors |
|---|---|---|---|---|---|
| ASSET_ALLOCATION | investingInfo/modern-6040-risk-budget | economicInfo/gold-geopolitics-real-rates-dollar-uncertainty | PARTIAL | EXPLICIT_CONTEXTUAL | 현대형 60/40에서 금이 ‘수익’이 아니라 ‘역할’로 들어가는 구조를 이해 |
| COMPOUND_INTEREST | personalFinance/compound-calculator-guide | personalFinance/annual-vs-monthly-compound | WEAK | RELATED_POST_TEMPLATE | 복리 계산기 사용법: 월복리·연복리·적립식 결과 보는 법 |
| COMPOUND_INTEREST | personalFinance/compound-calculator-guide | personalFinance/compound-return-3-5-7-10-table | WEAK | RELATED_POST_TEMPLATE | 복리 계산기 사용법: 월복리·연복리·적립식 결과 보는 법 |
| COMPOUND_INTEREST | personalFinance/compound-calculator-guide | personalFinance/simple-vs-compound | MISSING | NONE | - |
| DCA | personalFinance/dca-vs-lumpsum-decision-rules | investingInfo/dca-consistency-7-fail-patterns | PARTIAL | EXPLICIT_CONTEXTUAL | DCA와 일시금 중 무엇을 고를지 먼저 정하는 실행 리스크 기준표 |
| DCA | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/dca-fx-volatility-decomposition | WEAK | RELATED_POST_TEMPLATE | DCA vs 일시금투자: 기대수익이 아니라 ‘후회·중단·변동성(실행 리스크)’로 결정하는 3단계 규칙 |
| DCA | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/dca-step-up-ruleset | PARTIAL | EXPLICIT_CONTEXTUAL | DCA와 일시금 투자를 실행 리스크 기준으로 비교하기 |
| DCA | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/monthly-dca-10-year-result | PARTIAL | EXPLICIT_CONTEXTUAL | DCA vs 일시투자 의사결정 규칙 |
| DSR_LTV | personalFinance/dsr-40-income-loan-limit-table | personalFinance/mortgage-risk-checklist-dsr-variable | WEAK | RELATED_POST_TEMPLATE | DSR 40% 연봉별 대출 한도표 \| 연봉별 주담대 한도·대출 가능액 |
| DSR_LTV | personalFinance/ltv-dsr-calculator-guide | personalFinance/interest-rate-1p-loan-limit-impact | MISSING | NONE | - |
| DSR_LTV | personalFinance/ltv-dsr-calculator-guide | personalFinance/mortgage-risk-checklist-dsr-variable | WEAK | EXPLICIT_CONTEXTUAL | LTV DSR 계산기 사용법으로 집값·소득·기존부채 입력 순서 확인하기 |
| DSR_LTV | personalFinance/ltv-dsr-calculator-guide | personalFinance/salary-40m-mortgage-limit | MISSING | NONE | - |
| DSR_LTV | personalFinance/ltv-dsr-calculator-guide | personalFinance/salary-50m-dsr-40-loan-limit | MISSING | NONE | - |
| ETF | investingInfo/bond-etf-duration-drives-returns | investingInfo/etf-impact-of-tnx | WEAK | RELATED_POST_TEMPLATE | 채권 ETF와 듀레이션: 금리 1%p 변화가 수익률을 얼마나 흔드는가 |
| ETF | investingInfo/bond-etf-duration-drives-returns | investingInfo/korea-etf-deep-dive-tnx | WEAK | RELATED_POST_TEMPLATE | 채권 ETF와 듀레이션: 금리 1%p 변화가 수익률을 얼마나 흔드는가 |
| FIRE | personalFinance/fire-3-numbers-spending-horizon-withdrawal | personalFinance/fire-assumption-errors-7-fixes | PARTIAL | EXPLICIT_CONTEXTUAL | FIRE 목표를 지출·기간·인출률 3개 숫자로 점검하기 |
| FIRE | personalFinance/fire-3-numbers-spending-horizon-withdrawal | personalFinance/fire-sequence-risk-first-5-years | PARTIAL | EXPLICIT_CONTEXTUAL | FIRE 목표를 지출·기간·인출률 3개 숫자로 점검하기 |
| FIRE | personalFinance/fire-3-numbers-spending-horizon-withdrawal | personalFinance/fire-spending-buckets-essential-choice-insurance | PARTIAL | EXPLICIT_CONTEXTUAL | FIRE 목표를 지출·기간·인출률 3개 숫자로 점검하기 |
| GEOPOLITICS | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/tariffs-growth-margins-fx-package-shock | MISSING | NONE | - |
| GEOPOLITICS | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/war-theme-investing-price-chain-not-winners | MISSING | NONE | - |
| GEOPOLITICS | economicInfo/war-risk-oil-supply-insurance-shipping | economicInfo/tariffs-growth-margins-fx-package-shock | WEAK | RELATED_POST_TEMPLATE | 전쟁 뉴스가 유가를 움직이는 3단계: 공급·보험·운송이 만드는 ‘리스크 프리미엄’ |
| GEOPOLITICS | economicInfo/war-risk-oil-supply-insurance-shipping | economicInfo/war-theme-investing-price-chain-not-winners | WEAK | RELATED_POST_TEMPLATE | 전쟁 뉴스가 유가를 움직이는 3단계: 공급·보험·운송이 만드는 ‘리스크 프리미엄’ |
| HOUSEHOLD_FINANCE | personalFinance/personal-finance-3pillars | personalFinance/emergency-fund-by-risk | PARTIAL | EXPLICIT_CONTEXTUAL | 가계 재무 3대장 예산·비상금·장기투자를 먼저 세팅하라; 가계 재무 3대장 예산·비상금·장기투자; 가계 재무 3대장 예산·비상금·장기투자를 먼저 세팅하라 |
| HOUSEHOLD_FINANCE | personalFinance/personal-finance-3pillars | personalFinance/goal-amount-fast-strategy | PARTIAL | EXPLICIT_CONTEXTUAL | 재무 기초 3단계로 목표자산 계획의 기준 먼저 세우기 |
| HOUSEHOLD_FINANCE | personalFinance/personal-finance-3pillars | personalFinance/high-rate-debt-vs-invest-threshold-rule | WEAK | RELATED_POST_TEMPLATE | 가계 재무 3대장: 예산·비상금·장기투자를 먼저 세팅하라 |
| HOUSEHOLD_FINANCE | personalFinance/personal-finance-3pillars | personalFinance/inflation-household-survival-strategy | PARTIAL | EXPLICIT_CONTEXTUAL | 예산·비상금·장기투자 3단계로 가계 재무 기반 만들기 |
| HOUSEHOLD_FINANCE | personalFinance/personal-finance-3pillars | personalFinance/personal-start-5steps | PARTIAL | EXPLICIT_CONTEXTUAL | 가계 재무 3대장; 가계 재무 3대장 |
| KOSPI_GLOBAL_LINK | investingInfo/sp500-impact-on-korea-kospi | investingInfo/usd-krw-weak-won-sector-map-kospi | WEAK | RELATED_POST_TEMPLATE | 미국 증시(S&P500)가 한국 경제·코스피에 미치는 영향: 환율·금리·외국인 수급의 연결고리 |
| MACRO_INDICATORS | economicInfo/indicator-basics | investingInfo/indicator-marketinfo | MISSING | NONE | - |
| OIL_ENERGY | economicInfo/hormuz-risk-oil-insurance-freight-premium | economicInfo/eu-russia-gas-phaseout-price-channel | MISSING | NONE | - |
| OIL_ENERGY | economicInfo/hormuz-risk-oil-insurance-freight-premium | economicInfo/oil-shock-to-usdkrw-korea-transmission | WEAK | RELATED_POST_TEMPLATE | 중동 원유 수송 리스크 한 장으로 끝내기: 유가는 ‘봉쇄’보다 ‘보험료·운임 프리미엄’에 먼저 반응한다 |
| REAL_ESTATE_BUDGET | personalFinance/apartment-buying-calculator-guide | personalFinance/cash-100m-200m-300m-apartment-budget | MISSING | NONE | - |
| REAL_ESTATE_BUDGET | personalFinance/apartment-buying-calculator-guide | personalFinance/rent-jeonse-buy-cashflow-opportunity-cost | MISSING | NONE | - |
| REAL_ESTATE_DATA | personalFinance/apt-dashboard-home-goal-roadmap | investingInfo/rates-discount-mortgage-demand-apt-prices | PARTIAL | EXPLICIT_CONTEXTUAL | 대시보드 숫자를 내 집 마련 목표로 바꾸는 3단계 로드맵 |
| REAL_ESTATE_DATA | personalFinance/apt-dashboard-home-goal-roadmap | investingInfo/seoul-gyeonggi-incheon-risk-budget-framework | PARTIAL | EXPLICIT_CONTEXTUAL | 대시보드 숫자를 내 집 마련 목표로 바꾸는 3단계 로드맵 |

## Query Owner Anchor Audit

| Post | Query | Anchor Support | Contextual Inbound | Strongest Anchor | Generic Inbound |
|---|---|---|---:|---|---:|
| economicInfo/eu-russia-gas-phaseout-price-channel | 러시아 가스 중단 유럽 물가 영향 | ANCHOR_SUPPORT_PARTIAL | 1 | 러시아 가스 단계적 축소가 에너지 가격 채널에 남기는 압력 | 0 |
| economicInfo/oil-shock-to-usdkrw-korea-transmission | 유가 상승 원달러 환율 영향 | ANCHOR_SUPPORT_PARTIAL | 18 | 유가 급등이 원/달러에 미치는 영향 한국식 전파 경로 | 0 |
| economicInfo/tariffs-growth-margins-fx-package-shock | 관세 인상 경제 영향 | ANCHOR_SUPPORT_PARTIAL | 14 | 관세는 패키지 충격이다 성장·마진·환율·물가 | 0 |
| economicInfo/war-theme-investing-price-chain-not-winners | 전쟁 테마주 투자 리스크 | ANCHOR_SUPPORT_PARTIAL | 2 | 전쟁 테마의 함정 ‘수혜주’가 아니라 ‘가격 사슬(원가·운임·환율)’로 읽어야 한다 | 0 |
| economicInfo/yield-curve-2s10s-3m10y-recession-reading | 장단기 금리차 경기침체 신호 | ANCHOR_SUPPORT_PARTIAL | 15 | 수익률곡선(2 10, 3m 10y)은 왜 다르게 말하나 침체 신호 해석법 | 0 |
| investingInfo/bond-etf-duration-drives-returns | 채권 ETF 듀레이션 수익률 | ANCHOR_SUPPORT_WEAK | 0 | - | 0 |
| investingInfo/cagr-7percent-reality-check | 연 7% 수익률 현실성 | ANCHOR_SUPPORT_PARTIAL | 18 | 연 7% 복리는 현실적인가? CAGR로 다시 보기 | 0 |
| investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions | 환헤지 환노출 선택 기준 | ANCHOR_SUPPORT_PARTIAL | 1 | 기간·현금흐름 통화·헤지 비용으로 환헤지 여부를 정하는 글 | 0 |
| investingInfo/seoul-gyeonggi-incheon-risk-budget-framework | 수도권 부동산 리스크 관리 | ANCHOR_SUPPORT_PARTIAL | 2 | 서울·경기·인천을 지역 선택이 아니라 리스크 예산으로 나누는 법 | 0 |
| personalFinance/dsr-pass-ltv-cash-bottleneck | DSR LTV 현금 부족 | ANCHOR_SUPPORT_PARTIAL | 7 | DSR은 통과했는데 왜 집을 못 살까? | 0 |
| personalFinance/emergency-fund-by-risk | 비상금 얼마 필요 | ANCHOR_SUPPORT_PARTIAL | 16 | 변동성 국면에 비상금을 ‘개월’이 아니라 ‘리스크’로 정하는 기준표 | 0 |
| personalFinance/fire-3-numbers-spending-horizon-withdrawal | 파이어족 은퇴자금 계산 | ANCHOR_SUPPORT_PARTIAL | 3 | - | 0 |
| personalFinance/fire-assumption-errors-7-fixes | 파이어족 계산 실수 | ANCHOR_SUPPORT_PARTIAL | 1 | FIRE 계산에서 자주 틀리는 가정 7가지를 점검하는 법 | 0 |
| personalFinance/fire-sequence-risk-first-5-years | 은퇴 초기 순서위험 | ANCHOR_SUPPORT_PARTIAL | 1 | 은퇴 초반 5년 수익률 순서 리스크를 먼저 확인하기 | 1 |
| personalFinance/how-much-monthly-invest-for-100m | 1억원 만들기 월 투자금 | ANCHOR_SUPPORT_PARTIAL | 2 | 1억원 목표에 필요한 월 납입금을 기간·수익률별로 계산하는 글 | 0 |
| personalFinance/mortgage-risk-checklist-dsr-variable | 주담대 위험 체크리스트 | ANCHOR_SUPPORT_PARTIAL | 7 | 아파트 매수 전 대출 리스크 체크리스트 | 0 |
| personalFinance/personal-finance-3pillars | 개인 재무관리 3요소 | ANCHOR_SUPPORT_PARTIAL | 15 | - | 0 |
| personalFinance/personal-start-5steps | 재테크 시작하는 법 | ANCHOR_SUPPORT_PARTIAL | 2 | - | 0 |

## Generic Anchor Findings

- Generic contextual post anchors detected: 3
- personalFinance/dsr-40-income-loan-limit-table -> personalFinance/salary-40m-mortgage-limit: "연봉 4000만원 주담대 가능액을 별도 사례로 확인하기"
- personalFinance/fire-3-numbers-spending-horizon-withdrawal -> personalFinance/fire-sequence-risk-first-5-years: "은퇴 초반 5년 수익률 순서 리스크를 먼저 확인하기"
- personalFinance/mortgage-risk-checklist-dsr-variable -> personalFinance/ltv-dsr-calculator-guide: "LTV DSR 계산기 사용법으로 집값·소득·기존부채 입력 순서 확인하기"

## Boundary Weak Pair Link Audit

| Pair | Owner | A -> B | B -> A | Boundary | Anchor Risk |
|---|---|---|---|---|---|
| economicInfo/geopolitics-oil-fx-dashboard <-> economicInfo/geopolitics-to-usd-liquidity-fx | economicInfo/geopolitics-oil-fx-dashboard | STRONG / EXPLICIT_CONTEXTUAL | STRONG / EXPLICIT_CONTEXTUAL | PARTIAL | QUERY_STEALING_ANCHOR_REVIEW |
| economicInfo/hormuz-risk-oil-insurance-freight-premium <-> economicInfo/war-risk-oil-supply-insurance-shipping | economicInfo/hormuz-risk-oil-insurance-freight-premium | STRONG / EXPLICIT_CONTEXTUAL | PARTIAL / EXPLICIT_CONTEXTUAL | CLEAR | NO_QUERY_STEALING_ANCHOR_DETECTED |
| economicInfo/inflation-basics <-> economicInfo/inflation-rate-basics | economicInfo/inflation-basics | STRONG / EXPLICIT_CONTEXTUAL | STRONG / EXPLICIT_CONTEXTUAL | CLEAR | NO_QUERY_STEALING_ANCHOR_DETECTED |
| economicInfo/oil-shock-to-usdkrw-korea-transmission <-> investingInfo/wti-impact-on-korea-kospi | investingInfo/wti-impact-on-korea-kospi | STRONG / EXPLICIT_CONTEXTUAL | PARTIAL / EXPLICIT_CONTEXTUAL | PARTIAL | QUERY_STEALING_ANCHOR_REVIEW |
| investingInfo/etf-impact-of-tnx <-> investingInfo/us10y-impact-on-korea-and-stock-market | investingInfo/us10y-impact-on-korea-and-stock-market | STRONG / EXPLICIT_CONTEXTUAL | STRONG / EXPLICIT_CONTEXTUAL | PARTIAL | QUERY_STEALING_ANCHOR_REVIEW |
| personalFinance/dca-vs-lumpsum-decision-rules <-> personalFinance/dca-vs-lump-sum-when-results-differ | personalFinance/dca-vs-lumpsum-decision-rules | STRONG / EXPLICIT_CONTEXTUAL | STRONG / EXPLICIT_CONTEXTUAL | CLEAR | NO_QUERY_STEALING_ANCHOR_DETECTED |
| personalFinance/personal-finance-3pillars <-> personalFinance/personal-start-5steps | personalFinance/personal-start-5steps | PARTIAL / EXPLICIT_CONTEXTUAL | PARTIAL / EXPLICIT_CONTEXTUAL | CLEAR | NO_QUERY_STEALING_ANCHOR_DETECTED |

## Parent / Child Link Audit

| Strength | Parent | Child | Parent -> Child | Child -> Parent |
|---|---|---|---|---|
| PARENT_CHILD_STRONG | investingInfo/etf-impact-of-tnx | investingInfo/korea-etf-deep-dive-tnx | PARTIAL | STRONG |
| PARENT_CHILD_STRONG | investingInfo/usd-krw-exchange-rate-and-kospi | investingInfo/usd-krw-weak-won-sector-map-kospi | STRONG | STRONG |
| PARENT_CHILD_PARTIAL | personalFinance/dsr-40-income-loan-limit-table | personalFinance/salary-40m-mortgage-limit | WEAK | STRONG |
| PARENT_CHILD_STRONG | personalFinance/dsr-40-income-loan-limit-table | personalFinance/salary-50m-dsr-40-loan-limit | STRONG | STRONG |
| PARENT_CHILD_PARTIAL | personalFinance/monthly-investment-for-100m-table | personalFinance/how-much-monthly-invest-for-100m | WEAK | WEAK |
| PARENT_CHILD_STRONG | personalFinance/monthly-investment-for-100m-table | personalFinance/how-much-per-month-for-100m | STRONG | STRONG |
| PARENT_CHILD_PARTIAL | personalFinance/compound-return-3-5-7-10-table | personalFinance/simple-vs-compound | WEAK | WEAK |
| PARENT_CHILD_PARTIAL | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/monthly-investment-for-100m-table | WEAK | STRONG |
| PARENT_CHILD_PARTIAL | personalFinance/is-dca-better-in-bear-market | personalFinance/monthly-investment-for-100m-table | WEAK | MISSING |
| PARENT_CHILD_PARTIAL | personalFinance/monthly-dca-10-year-result | personalFinance/monthly-investment-for-100m-table | WEAK | STRONG |

## Calculator Funnel Audit

| Topic Family | Tools | Guide Posts | Linked Posts | Status |
|---|---|---|---:|---|
| COMPOUND_INTEREST | /tools/compound-interest | personalFinance/compound-calculator-guide | 4/4 | STRONG |
| CAGR | /tools/cagr-calculator | - | 4/4 | PARTIAL |
| DCA | /tools/dca-calculator | personalFinance/how-much-monthly-invest-for-100m | 10/10 | STRONG |
| FIRE | /tools/fire-calculator | personalFinance/fire-3-numbers-spending-horizon-withdrawal | 4/4 | STRONG |
| DSR_LTV | /tools/dsr-ltv-calculator; /tools/mortgage-loan-calculator | personalFinance/ltv-dsr-calculator-guide | 7/7 | STRONG |
| REAL_ESTATE_BUDGET | /tools/home-buying-budget-calculator; /tools/dsr-ltv-calculator; /tools/mortgage-loan-calculator | personalFinance/apartment-buying-calculator-guide | 6/6 | STRONG |
| HOUSEHOLD_FINANCE | /tools/goal-simulator | - | 6/6 | PARTIAL |

## Market Dashboard Funnel Audit

| Topic Family | Posts | Market Links | Linked Posts | Status |
|---|---:|---:|---|---|
| OIL_ENERGY | 4 | 0 | - | WEAK |
| FX | 3 | 0 | - | WEAK |
| INTEREST_RATES | 4 | 0 | - | WEAK |
| ETF | 3 | 0 | - | WEAK |
| DXY | 2 | 0 | - | WEAK |
| REAL_ESTATE_DATA | 6 | 34 | investingInfo/rates-discount-mortgage-demand-apt-prices; investingInfo/seoul-gyeonggi-incheon-risk-budget-framework; personalFinance/apartment-transaction-volume-decline-meaning; personalFinance/apt-dashboard-home-goal-roadmap; personalFinance/how-to-read-apartment-transaction-prices; personalFinance/large-apartment-complex-households-price-stability | STRONG |
| KOSPI_GLOBAL_LINK | 3 | 0 | - | WEAK |
| TNX | 2 | 0 | - | WEAK |

## Cross-category Link Audit

- CROSS_CATEGORY_STRONG: 15
- CROSS_CATEGORY_PARTIAL: 4
- CROSS_CATEGORY_WEAK: 27

## Topic Isolated Posts

- economicInfo/geopolitics-oil-fx-dashboard: GEOPOLITICS / 지정학 리스크 유가 환율 영향
- economicInfo/tariffs-growth-margins-fx-package-shock: GEOPOLITICS / 관세 인상 경제 영향
- economicInfo/war-risk-oil-supply-insurance-shipping: GEOPOLITICS / 전쟁 유가 영향
- economicInfo/war-theme-investing-price-chain-not-winners: GEOPOLITICS / 전쟁 테마주 투자 리스크

## Topic Hub Candidate Assessment

| Topic Family | Assessment | Existing/New | Candidate URL | Sections |
|---|---|---|---|---|
| DCA | HUB_REQUIRED | DEDICATED_HUB_RECOMMENDED | URL concept not assigned in Step 4 | DCA 뜻; DCA vs 일시금; 하락장 DCA; 월 투자금 설계; 증액 전략; 환율 영향; 10년 결과; 실패 패턴; DCA calculator |
| DSR_LTV | HUB_USEFUL | EXISTING_CORE_CAN_SERVE_AS_HUB | /posts/personalFinance/dsr-40-income-loan-limit-table | DSR/LTV 기본; 연봉별 한도; 연봉 4000/5000 scenario; 금리 변화 영향; 현금 병목; 주담대 risk; DSR/LTV calculator |
| HOUSEHOLD_FINANCE | HUB_USEFUL | DEDICATED_HUB_RECOMMENDED | URL concept not assigned in Step 4 | 재무관리 framework; 시작 5단계; 비상금; 부채 상환 vs 투자; 물가 대응; 목표금액 계획 |
| REAL_ESTATE_BUDGET | HUB_USEFUL | EXISTING_CORE_CAN_SERVE_AS_HUB | /posts/personalFinance/apartment-buying-calculator-guide | 매수 예산; 계산기; 부대비용; 보유현금별 budget; 생애최초; 전세에서 매매; 월세/전세/매매 비교 |
| REAL_ESTATE_DATA | HUB_USEFUL | EXISTING_CORE_CAN_SERVE_AS_HUB | /posts/personalFinance/apt-dashboard-home-goal-roadmap | 대시보드 활용; 실거래가 읽기; 거래량; 금리와 가격; 대단지; 수도권 risk budget |

## Topic Cluster Architecture

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

## High-value Link Opportunities

| Source | Target | Anchor Concept | Reason |
|---|---|---|---|
| personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/how-much-per-month-for-100m | 1억 모으기 매달 얼마로 확장되는 하위 주제 | Core -> spoke contextual link is missing in a hub-candidate topic. |
| personalFinance/interest-rate-1p-loan-limit-impact | personalFinance/ltv-dsr-calculator-guide | LTV DSR 계산기 사용법로 돌아가는 핵심 개념 | Spoke -> core contextual link is missing in a hub-candidate topic. |
| personalFinance/salary-40m-mortgage-limit | personalFinance/ltv-dsr-calculator-guide | LTV DSR 계산기 사용법로 돌아가는 핵심 개념 | Spoke -> core contextual link is missing in a hub-candidate topic. |
| personalFinance/salary-50m-dsr-40-loan-limit | personalFinance/ltv-dsr-calculator-guide | LTV DSR 계산기 사용법로 돌아가는 핵심 개념 | Spoke -> core contextual link is missing in a hub-candidate topic. |
| personalFinance/cash-100m-200m-300m-apartment-budget | personalFinance/apartment-buying-calculator-guide | 아파트 구매 계산기 사용법로 돌아가는 핵심 개념 | Spoke -> core contextual link is missing in a hub-candidate topic. |
| personalFinance/rent-jeonse-buy-cashflow-opportunity-cost | personalFinance/apartment-buying-calculator-guide | 아파트 구매 계산기 사용법로 돌아가는 핵심 개념 | Spoke -> core contextual link is missing in a hub-candidate topic. |
| personalFinance/monthly-investment-for-100m-table | personalFinance/is-dca-better-in-bear-market | 하락장 적립식 투자 parent guide | Child page lacks reverse link to parent. |
| personalFinance/dsr-pass-ltv-cash-bottleneck | personalFinance/dsr-40-income-loan-limit-table | DSR LTV 대출한도 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/interest-rate-1p-loan-limit-impact | personalFinance/dsr-40-income-loan-limit-table | DSR LTV 대출한도 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/mortgage-risk-checklist-dsr-variable | personalFinance/dsr-40-income-loan-limit-table | DSR LTV 대출한도 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/salary-40m-mortgage-limit | personalFinance/dsr-40-income-loan-limit-table | DSR LTV 대출한도 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/salary-50m-dsr-40-loan-limit | personalFinance/dsr-40-income-loan-limit-table | DSR LTV 대출한도 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/apartment-buying-costs-before-purchase | personalFinance/apartment-buying-calculator-guide | 아파트 구매 예산 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/cash-100m-200m-300m-apartment-budget | personalFinance/apartment-buying-calculator-guide | 아파트 구매 예산 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/first-home-buyer-budget-calculation | personalFinance/apartment-buying-calculator-guide | 아파트 구매 예산 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/jeonse-to-home-purchase-cash-needed | personalFinance/apartment-buying-calculator-guide | 아파트 구매 예산 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/rent-jeonse-buy-cashflow-opportunity-cost | personalFinance/apartment-buying-calculator-guide | 아파트 구매 예산 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| investingInfo/rates-discount-mortgage-demand-apt-prices | personalFinance/apt-dashboard-home-goal-roadmap | 아파트 실거래가 보는 법 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| investingInfo/seoul-gyeonggi-incheon-risk-budget-framework | personalFinance/apt-dashboard-home-goal-roadmap | 아파트 실거래가 보는 법 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/apartment-transaction-volume-decline-meaning | personalFinance/apt-dashboard-home-goal-roadmap | 아파트 실거래가 보는 법 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/how-to-read-apartment-transaction-prices | personalFinance/apt-dashboard-home-goal-roadmap | 아파트 실거래가 보는 법 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |
| personalFinance/large-apartment-complex-households-price-stability | personalFinance/apt-dashboard-home-goal-roadmap | 아파트 실거래가 보는 법 전체 가이드 | Existing core can serve as hub but spoke-to-core reinforcement is useful. |

## Data Quality / Limitations

- This audit used local Step 1-3 reports and repository-derived link data only.
- No Naver Search, Search Advisor, GSC, click, impression, ranking, or external keyword-volume data was used.
- Related-post template links are treated as secondary signals, not as replacements for contextual links.
- Recommendations are anchor concepts and architecture opportunities only. No internal link, content, metadata, route, or component change was made.
- Dense all-to-all link mesh is intentionally not recommended; opportunities are limited to core/spoke, parent/child, boundary clarification, and calculator/dashboard funnels.

## Generated Files

- `reports/naver-ko-post-topic-links-2026-09-16.md`
- `reports/naver-ko-post-topic-links-2026-09-16.json`
- `reports/naver-ko-topic-link-opportunities-2026-09-16.csv`
- `reports/naver-ko-topic-cluster-map-2026-09-16.csv`

## Step 5 Readiness

Step 5 Priority / Pilot Selection readiness: YES

