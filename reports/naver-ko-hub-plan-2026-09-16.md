# FinMap KO Topic Hub Plan

Generated: 2026-09-16T07:40:14.618Z

## DCA Hub

- Decision: DEDICATED_HUB_RECOMMENDED
- Purpose: DCA 뜻, 일시금 비교, 하락장/환율/증액/10년 결과/목표금액 계산 글을 한 주제 지도 아래 묶는다.
- Primary query: 적립식 투자
- Secondary queries: DCA 뜻, 적립식 투자 일시금 비교, 하락장 적립식 투자, 월 투자금 계산, 적립식 투자 10년 결과
- Suggested URL concept: /posts/personalFinance/dca-guide (URL_CONCEPT_ONLY_NOT_CREATED)
- Sections: DCA 뜻 / DCA vs 일시금 / 하락장 DCA / 월 투자금 설계 / 증액 전략 / 환율 영향 / 10년 결과 / 실패 패턴 / DCA calculator
- Docs to link:
  - personalFinance/dca-vs-lumpsum-decision-rules
  - investingInfo/dca-consistency-7-fail-patterns
  - personalFinance/dca-fx-volatility-decomposition
  - personalFinance/dca-step-up-ruleset
  - personalFinance/dca-vs-lump-sum-when-results-differ
  - personalFinance/how-much-monthly-invest-for-100m
  - personalFinance/how-much-per-month-for-100m
  - personalFinance/is-dca-better-in-bear-market
  - personalFinance/monthly-dca-10-year-result
  - personalFinance/monthly-investment-for-100m-table
- Why existing dca-vs-lumpsum cannot serve as hub: personalFinance/dca-vs-lumpsum-decision-rules는 '선택/비교' intent를 소유해야 하므로 전체 DCA 허브가 되면 결정 규칙 query와 DCA 뜻/목표금액/하락장/환율 query가 섞인다.

## Household Finance Hub

- Decision: DEDICATED_HUB_RECOMMENDED_BUT_LOWER_URGENCY_THAN_DCA
- Purpose: 재테크 시작, 개인 재무관리 3요소, 비상금, 고금리 부채, 물가 대응, 목표금액 전략을 한 입문 경로로 묶는다.
- Primary query: 재테크 시작 / 개인 재무관리
- Suggested URL concept: /posts/personalFinance/personal-finance-guide (URL_CONCEPT_ONLY_NOT_CREATED)
- Existing-doc decision: personal-start-5steps는 시작 순서 intent, personal-finance-3pillars는 framework intent를 보존하는 편이 안전하다. 둘 중 하나를 전체 허브로 키우면 Step3 boundary weak pair가 더 커질 수 있다.
- Sections: 재무관리 framework / 시작 5단계 / 비상금 / 부채 상환 vs 투자 / 물가 대응 / 목표금액 계획
- Docs to link:
  - personalFinance/personal-finance-3pillars
  - personalFinance/emergency-fund-by-risk
  - personalFinance/goal-amount-fast-strategy
  - personalFinance/high-rate-debt-vs-invest-threshold-rule
  - personalFinance/inflation-household-survival-strategy
  - personalFinance/personal-start-5steps

## Existing Core Hub Reinforcement

### DSR_LTV

- Decision: EXISTING_CORE_CAN_SERVE_AS_HUB
- Core documents: personalFinance/dsr-40-income-loan-limit-table, personalFinance/ltv-dsr-calculator-guide
- Candidate URL: /posts/personalFinance/dsr-40-income-loan-limit-table
- Intro role: DSR/LTV 대출한도 계산의 대표 가이드임을 도입부에서 분명히 한다.
- Nav section: 연봉별 한도, 금리 변화, 현금 병목, 변동금리 리스크, 계산기 순서로 내부 탐색 블록을 정리한다.
- Linked spokes: personalFinance/dsr-pass-ltv-cash-bottleneck, personalFinance/interest-rate-1p-loan-limit-impact, personalFinance/mortgage-risk-checklist-dsr-variable, personalFinance/salary-40m-mortgage-limit, personalFinance/salary-50m-dsr-40-loan-limit
- Tool/dashboard links: /tools/dsr-ltv-calculator, /tools/mortgage-loan-calculator, /market/real-estate
- Inbound reverse links: personalFinance/dsr-40-income-loan-limit-table, personalFinance/dsr-pass-ltv-cash-bottleneck, personalFinance/interest-rate-1p-loan-limit-impact, personalFinance/mortgage-risk-checklist-dsr-variable

### REAL_ESTATE_BUDGET

- Decision: EXISTING_CORE_CAN_SERVE_AS_HUB
- Core documents: personalFinance/apartment-buying-calculator-guide
- Candidate URL: /posts/personalFinance/apartment-buying-calculator-guide
- Intro role: 아파트 구매 예산 계산의 대표 가이드 역할을 명시한다.
- Nav section: 부대비용, 보유현금별 예산, 생애최초, 전세->매매, 월세/전세/매매 비교로 분기한다.
- Linked spokes: personalFinance/apartment-buying-costs-before-purchase, personalFinance/cash-100m-200m-300m-apartment-budget, personalFinance/first-home-buyer-budget-calculation, personalFinance/jeonse-to-home-purchase-cash-needed, personalFinance/rent-jeonse-buy-cashflow-opportunity-cost
- Tool/dashboard links: /tools/home-buying-budget-calculator, /tools/dsr-ltv-calculator, /tools/mortgage-loan-calculator, /market/real-estate
- Inbound reverse links: personalFinance/apartment-buying-costs-before-purchase, personalFinance/cash-100m-200m-300m-apartment-budget, personalFinance/rent-jeonse-buy-cashflow-opportunity-cost

### REAL_ESTATE_DATA

- Decision: EXISTING_CORE_CAN_SERVE_AS_HUB
- Core documents: personalFinance/apt-dashboard-home-goal-roadmap
- Candidate URL: /posts/personalFinance/apt-dashboard-home-goal-roadmap
- Intro role: 아파트 실거래가/시세 데이터 읽기의 대표 가이드 역할을 명시한다.
- Nav section: 대시보드 사용법, 실거래가 해석, 거래량, 금리/가격, 대단지, 수도권 risk budget로 연결한다.
- Linked spokes: investingInfo/rates-discount-mortgage-demand-apt-prices, investingInfo/seoul-gyeonggi-incheon-risk-budget-framework, personalFinance/apartment-transaction-volume-decline-meaning, personalFinance/how-to-read-apartment-transaction-prices, personalFinance/large-apartment-complex-households-price-stability
- Tool/dashboard links: /market/real-estate
- Inbound reverse links: investingInfo/rates-discount-mortgage-demand-apt-prices, investingInfo/seoul-gyeonggi-incheon-risk-budget-framework, personalFinance/apt-dashboard-home-goal-roadmap


## Guardrails

- Do not create hub pages in Step 5.
- Do not use a comparison article as a broad hub if it owns a narrower query.
- Spokes should link back to hub/core with natural anchors, not repeated exact-match anchors.
- Any new hub URL must go through sitemap, canonical, hreflang, structured data, and internal link validation in a later implementation batch.
