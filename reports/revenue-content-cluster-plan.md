# Finmap 계산기 클러스터 콘텐츠 30개 기획

- 작성일: 2026-06-04
- 목표: 검색자가 구체적인 금액·기간·조건을 확인한 뒤 Finmap 계산기를 직접 사용하도록 연결하는 신규 콘텐츠 30개를 기획한다.
- 범위: 기획 문서만 작성. 실제 글과 기존 콘텐츠는 생성·수정하지 않는다.
- 수익화 전제: 월 `$1,000` 수익은 보장할 수 없다. 검색 유입, 계산 완료, 결과 광고 도달, 관련 도구 이동을 함께 높일 수 있는 주제를 우선한다.

## 1. 기획 원칙

### 우선순위

| 우선순위 | 후보 수 | 기준 |
| --- | ---: | --- |
| P0 | 9 | 검색 질문이 구체적이고 계산기 입력 의도가 강한 1차 제작 후보 |
| P1 | 14 | 기존 글의 해석 범위를 숫자표·시나리오로 확장하는 2차 후보 |
| P2 | 7 | 검색량, 정책 변화, 기존 글과의 중복도를 먼저 확인할 실험 후보 |

### 중복 방지 기준

다음 주제는 기존 콘텐츠가 이미 강하므로 같은 검색 의도로 다시 만들지 않는다.

- 일반적인 `1억 모으려면 월 얼마` 글과 기간·수익률별 1억 표
- 일반적인 단리 vs 복리, 연복리 vs 월복리 설명
- 일반적인 DCA vs 일시금 투자 비교와 하락장 DCA 설명
- DSR 40% 연소득별 주담대 한도표
- 보유현금 1억·2억·3억 아파트 구매 가능 금액
- 금리 1%p 상승에 따른 주담대 한도 변화
- 일반적인 CAGR 정의와 ETF에서 CAGR을 보는 이유
- FIRE 목표를 정하는 3개 숫자, 순서 리스크, 지출 버킷, 가정 오류

신규 후보는 기존 글을 대체하지 않고 `구체적인 숫자 질문 → 비교표 → 내 조건 계산 CTA` 역할을 맡는다.

### KO/EN 운영 원칙

- KO 글은 네이버·Google에서 실제로 입력할 법한 금액형 질문을 제목 앞부분에 둔다.
- EN 글은 KO 글을 직역하지 않고 달러 예시와 국제 독자의 검색 표현에 맞춰 작성한다.
- 아래 내부 링크는 KO canonical 기준이다. EN 글 제작 시 대응 EN 글이 존재하는지 확인하고 `/en` locale 링크를 사용한다.
- 대출·투자·은퇴 결과를 보장하지 않고 입력 가정에 따른 시뮬레이션임을 명확히 한다.

## 2. 목표자산·복리·DCA 클러스터 10개

### A1. 월 100만원 장기 적립식 투자표

- **우선순위 / 역할:** P0 / 검색 유입형 숫자표 + DCA 전환
- **KO title:** 월 100만원 투자하면 10년·20년·30년 뒤 얼마일까? 수익률별 적립식 투자표
- **EN title:** What Can $1,000 a Month Grow Into? 10-, 20-, and 30-Year DCA Scenarios
- **Target keyword:** KO `월 100만원 투자 10년`, `월 100만원 투자 20년` / EN `invest $1,000 a month for 20 years`
- **검색 의도:** 월 100만원을 장기간 투자했을 때 수익률별 최종 자산을 빠르게 확인하려는 정보형·계산형 의도
- **연결할 계산기:** `/tools/dca-calculator` 중심, `/tools/compound-interest` 보조
- **연결할 기존 글:** `/posts/personalFinance/monthly-dca-10-year-result`, `/posts/personalFinance/compound-return-3-5-7-10-table`
- **CTA 위치 제안:** 첫 10·20·30년 비교표 직후 DCA 계산기, 세금·수수료 설명 직후 복리 계산기
- **기존 글과의 차별점:** 기존 월 50만원 10년 글과 월 30만원 복리표를 반복하지 않고 월 100만원과 장기 기간축에 집중한다.

### A2. 1억 이후 2억·3억 도달 기간

- **우선순위 / 역할:** P1 / 목표자산 연속 전환형
- **KO title:** 1억을 만든 뒤 2억·3억까지 얼마나 걸릴까? 복리가 빨라지는 구간
- **EN title:** After Your First $100K: How Long Could It Take to Reach $200K and $300K?
- **Target keyword:** KO `1억에서 2억 걸리는 시간`, `1억 이후 자산 증가` / EN `how long to grow 100k to 200k`
- **검색 의도:** 이미 종잣돈을 보유한 사용자가 다음 목표까지 필요한 기간과 월 적립금을 확인하려는 의도
- **연결할 계산기:** `/tools/goal-simulator`, `/tools/compound-interest`
- **연결할 기존 글:** `/posts/personalFinance/how-much-per-month-for-100m`, `/posts/personalFinance/goal-amount-fast-strategy`
- **CTA 위치 제안:** 1억→2억→3억 마일스톤 표 직후 목표자산 계산기
- **기존 글과의 차별점:** 0원에서 1억을 만드는 기존 글이 아니라 현재 자산 1억원을 시작값으로 쓰는 다음 단계 글이다.

### A3. 투자를 5년 늦게 시작하는 비용

- **우선순위 / 역할:** P0 / 강한 목표자산 계산 전환
- **KO title:** 투자를 5년 늦게 시작하면 월 얼마를 더 넣어야 할까?
- **EN title:** The Cost of Starting Five Years Late: How Much More Must You Invest Monthly?
- **Target keyword:** KO `투자 5년 늦게 시작`, `늦게 투자 시작 월 투자금` / EN `cost of starting investing late`
- **검색 의도:** 같은 목표금액을 유지하면서 시작 시점 차이가 필요한 월 투자금에 미치는 영향을 확인하려는 의도
- **연결할 계산기:** `/tools/goal-simulator`
- **연결할 기존 글:** `/posts/personalFinance/monthly-investment-for-100m-table`, `/posts/personalFinance/simple-vs-compound`
- **CTA 위치 제안:** 시작 연령·기간 비교표 직후 목표자산 계산기 preset CTA
- **기존 글과의 차별점:** 복리 개념 설명보다 목표일을 고정한 상태에서 늦은 시작의 월 납입 비용을 역산한다.

### A4. 적립식 투자 1년 중단 비용

- **우선순위 / 역할:** P1 / DCA 재계획 전환형
- **KO title:** 적립식 투자를 1년 쉬면 목표 도달은 얼마나 늦어질까?
- **EN title:** What Does a One-Year Investing Pause Cost Your Long-Term Goal?
- **Target keyword:** KO `투자 중단 1년`, `적립식 투자 쉬면` / EN `pause investing for a year`
- **검색 의도:** 실직·육아·주거비 등으로 납입을 중단할 때 목표기간과 재개 후 납입액을 확인하려는 의도
- **연결할 계산기:** `/tools/dca-calculator`, `/tools/goal-simulator`
- **연결할 기존 글:** `/posts/investingInfo/dca-consistency-7-fail-patterns`, `/posts/personalFinance/dca-step-up-ruleset`
- **CTA 위치 제안:** 중단 6개월·1년·2년 비교표 직후 DCA 계산기, 재개 계획 뒤 목표자산 계산기
- **기존 글과의 차별점:** 기존 지속성·운영규칙 글을 숫자로 보완하고 중단 시 손실을 비난하지 않는 재계획 글로 만든다.

### A5. 매주 투자 vs 매월 투자

- **우선순위 / 역할:** P2 / DCA 기능 설명형
- **KO title:** 매주 투자 vs 매월 투자, 납입 빈도가 결과를 바꿀까?
- **EN title:** Weekly vs Monthly DCA: Does Contribution Frequency Meaningfully Change the Result?
- **Target keyword:** KO `매주 투자 매월 투자 비교`, `DCA 투자 주기` / EN `weekly vs monthly DCA`
- **검색 의도:** 같은 연간 납입액에서 투자 빈도가 최종 결과와 실행 편의성에 미치는 영향을 비교하려는 의도
- **연결할 계산기:** `/tools/dca-calculator`
- **연결할 기존 글:** `/posts/personalFinance/annual-vs-monthly-compound`, `/posts/investingInfo/dca-consistency-7-fail-patterns`
- **CTA 위치 제안:** 동일 연간 납입액 비교표 직후 DCA 계산기
- **기존 글과의 차별점:** 연복리·월복리 계산 주기가 아니라 실제 납입 빈도와 지속 가능성을 비교한다.

### A6. 투자 수수료의 장기 복리 비용

- **우선순위 / 역할:** P2 / 백링크용 자료형
- **KO title:** 연 0.2%·0.5%·1% 수수료가 20년 복리를 얼마나 깎을까?
- **EN title:** How Much Do 0.2%, 0.5%, and 1% Annual Fees Cost Over 20 Years?
- **Target keyword:** KO `투자 수수료 복리`, `펀드 수수료 장기 수익률` / EN `investment fee impact over 20 years`
- **검색 의도:** 작은 비용 차이가 장기 최종자산과 체감 CAGR에 미치는 영향을 확인하려는 의도
- **연결할 계산기:** `/tools/compound-interest`, `/tools/cagr-calculator`
- **연결할 기존 글:** `/posts/personalFinance/compound-return-3-5-7-10-table`, `/posts/investingInfo/why-check-cagr-etf`
- **CTA 위치 제안:** 비용률 비교표 직후 복리 계산기, 체감 CAGR 설명 뒤 CAGR 계산기
- **기존 글과의 차별점:** 수익률 가정 비교가 아니라 비용률만 바꾼 인용 가능한 자료표에 집중한다.

### A7. 물가를 반영한 목표자산

- **우선순위 / 역할:** P1 / 목표자산 고도화 전환형
- **KO title:** 명목 1억과 오늘 가치 1억은 다르다: 물가 반영 목표자산 계산법
- **EN title:** A Future $100K Is Not Today's $100K: How to Set an Inflation-Adjusted Goal
- **Target keyword:** KO `물가 반영 목표자산`, `미래 1억 현재가치` / EN `inflation adjusted savings goal`
- **검색 의도:** 장기 목표금액을 현재 구매력 기준으로 다시 설정하려는 의도
- **연결할 계산기:** `/tools/goal-simulator`, `/tools/compound-interest`
- **연결할 기존 글:** `/posts/economicInfo/inflation-basics`, `/posts/personalFinance/goal-amount-fast-strategy`
- **CTA 위치 제안:** 물가 2%·3%·4% 목표금액 표 직후 목표자산 계산기
- **기존 글과의 차별점:** 일반 물가 설명이 아니라 목표금액 자체를 물가에 맞춰 상향하는 계산 절차에 집중한다.

### A8. 월 투자금 증액 vs 수익률 상승

- **우선순위 / 역할:** P1 / 의사결정형 계산기 전환
- **KO title:** 월 투자금 10만원 늘리기 vs 수익률 1%p 높이기, 무엇이 더 효과적일까?
- **EN title:** Invest More or Chase 1% Higher Returns? Comparing the Two Levers
- **Target keyword:** KO `월 투자금 늘리기 수익률`, `투자금 수익률 뭐가 중요` / EN `increase contributions vs investment returns`
- **검색 의도:** 목표 달성을 위해 통제 가능한 월 납입액과 불확실한 수익률 중 무엇을 조정할지 비교하려는 의도
- **연결할 계산기:** `/tools/goal-simulator`, `/tools/compound-interest`
- **연결할 기존 글:** `/posts/personalFinance/goal-amount-fast-strategy`, `/posts/investingInfo/cagr-7percent-reality-check`
- **CTA 위치 제안:** 기간별 민감도 비교표 직후 목표자산 계산기
- **기존 글과의 차별점:** 세 변수의 일반 설명이 아니라 월 10만원과 수익률 1%p의 효과를 동일 조건에서 비교한다.

### A9. 3억·5억·10억 목표별 월 투자금

- **우선순위 / 역할:** P0 / 고의도 목표자산 검색 허브
- **KO title:** 3억·5억·10억 모으려면 월 얼마? 기간·수익률별 필요 투자금
- **EN title:** How Much Should You Invest Monthly for $300K, $500K, and $1M Goals?
- **Target keyword:** KO `3억 모으려면 월 얼마`, `5억 모으기`, `10억 모으기` / EN `monthly investment needed for 1 million`
- **검색 의도:** 큰 목표금액별 필요 월 투자금과 현실적인 기간을 빠르게 비교하려는 의도
- **연결할 계산기:** `/tools/goal-simulator`
- **연결할 기존 글:** `/posts/personalFinance/how-much-per-month-for-100m`, `/posts/personalFinance/monthly-investment-for-100m-table`
- **CTA 위치 제안:** 첫 목표금액·기간 표 직후 목표자산 계산기
- **기존 글과의 차별점:** 기존 1억원 글의 숫자만 늘리지 않고 3억·5억·10억에서 기간 연장이 월 부담을 어떻게 바꾸는지 비교한다.

### A10. 매년 적립금 증액 효과

- **우선순위 / 역할:** P1 / DCA step-up 숫자표
- **KO title:** 월 적립금을 매년 3%·5% 늘리면 목표 기간은 얼마나 줄어들까?
- **EN title:** How Annual Contribution Increases Can Shorten Your Investment Timeline
- **Target keyword:** KO `적립식 투자 매년 증액`, `월 투자금 증액 효과` / EN `increase investment contributions annually`
- **검색 의도:** 소득 증가에 맞춰 납입액을 높일 때 목표기간과 최종자산 변화를 확인하려는 의도
- **연결할 계산기:** `/tools/dca-calculator`, `/tools/goal-simulator`
- **연결할 기존 글:** `/posts/personalFinance/dca-step-up-ruleset`, `/posts/personalFinance/monthly-dca-10-year-result`
- **CTA 위치 제안:** 0%·3%·5% 증액 비교표 직후 DCA 계산기
- **기존 글과의 차별점:** 기존 증액 운영규칙 글의 실행 원칙을 구체적인 증가율별 결과표로 보완한다.

## 3. DSR·LTV·부동산 예산 클러스터 10개

### B1. 5억·7억·10억 아파트 필요 현금·연봉

- **우선순위 / 역할:** P0 / 최고 의도 부동산 예산 허브
- **KO title:** 5억·7억·10억 아파트 사려면 현금과 연봉이 얼마나 필요할까?
- **EN title:** How Much Cash and Income Do You Need for a KRW 500M, 700M, or 1B Apartment?
- **Target keyword:** KO `5억 아파트 필요한 현금`, `7억 아파트 연봉`, `10억 아파트 대출` / EN `cash and income needed to buy apartment in Korea`
- **검색 의도:** 후보 집값을 먼저 정한 사용자가 필요한 자기자본과 소득 조건을 함께 확인하려는 강한 계산 의도
- **연결할 계산기:** `/tools/dsr-ltv-calculator`, `/market/real-estate`
- **연결할 기존 글:** `/posts/personalFinance/cash-100m-200m-300m-apartment-budget`, `/posts/personalFinance/dsr-40-income-loan-limit-table`
- **CTA 위치 제안:** 가격대별 필요 현금·소득 표 직후 DSR/LTV 계산기, 각 가격대 설명 뒤 실거래 대시보드
- **기존 글과의 차별점:** 기존 현금 기준 글과 소득 기준 한도표를 후보 집값 기준으로 결합한다.

### B2. 기존 신용대출이 주담대 한도에 미치는 영향

- **우선순위 / 역할:** P0 / DSR 계산기 직접 전환
- **KO title:** 신용대출이 있으면 주담대 한도는 얼마나 줄까? 잔액보다 월상환액으로 보는 DSR
- **EN title:** How Existing Debt Reduces Korean Mortgage Capacity: Read Monthly Payments, Not Just Balance
- **Target keyword:** KO `신용대출 있으면 주담대 한도`, `기존 대출 DSR` / EN `existing debt impact on Korean mortgage capacity`
- **검색 의도:** 신용대출·자동차 할부·학자금 대출이 신규 주담대 여력을 얼마나 줄이는지 확인하려는 의도
- **연결할 계산기:** `/tools/dsr-ltv-calculator`
- **연결할 기존 글:** `/posts/personalFinance/dsr-40-income-loan-limit-table`, `/posts/personalFinance/mortgage-risk-checklist-dsr-variable`
- **CTA 위치 제안:** 기존 월상환액별 한도 감소표 직후 DSR/LTV 계산기
- **기존 글과의 차별점:** 연소득별 기본 한도가 아니라 기존부채 월상환액을 핵심 변수로 분리한다.

### B3. 주담대 기간 20년·30년·40년 비교

- **우선순위 / 역할:** P1 / 대출기간 민감도 전환형
- **KO title:** 주담대 20년·30년·40년 비교: 월상환액·DSR 한도·총이자
- **EN title:** 20 vs 30 vs 40-Year Korean Mortgages: Payment, DSR Capacity, and Total Interest
- **Target keyword:** KO `주담대 30년 40년 비교`, `대출기간별 월상환액` / EN `20 vs 30 vs 40 year mortgage Korea`
- **검색 의도:** 대출기간을 늘릴 때 월 부담과 총이자가 어떻게 달라지는지 비교하려는 의도
- **연결할 계산기:** `/tools/dsr-ltv-calculator`
- **연결할 기존 글:** `/posts/personalFinance/interest-rate-1p-loan-limit-impact`, `/posts/personalFinance/dsr-40-income-loan-limit-table`
- **CTA 위치 제안:** 기간별 비교표 직후 DSR/LTV 계산기
- **기존 글과의 차별점:** 금리 변화가 아니라 대출기간만 바꿔 DSR 한도와 총비용의 상충관계를 보여준다.

### B4. LTV별 필요한 현금

- **우선순위 / 역할:** P1 / 현금 병목 숫자표
- **KO title:** LTV 40%·50%·60%·70%면 아파트 살 때 현금이 얼마나 필요할까?
- **EN title:** How Much Cash Do 40%, 50%, 60%, and 70% LTV Ratios Require?
- **Target keyword:** KO `LTV별 필요한 현금`, `LTV 70% 자기자본` / EN `cash needed by LTV ratio Korea`
- **검색 의도:** 집값과 LTV 조건에 따라 준비해야 할 자기자본을 빠르게 확인하려는 의도
- **연결할 계산기:** `/tools/dsr-ltv-calculator`, `/market/real-estate`
- **연결할 기존 글:** `/posts/personalFinance/cash-100m-200m-300m-apartment-budget`, `/posts/personalFinance/dsr-pass-ltv-cash-bottleneck`
- **CTA 위치 제안:** 집값·LTV 매트릭스 직후 DSR/LTV 계산기
- **기존 글과의 차별점:** 보유현금에서 집값을 역산하지 않고 같은 집값에서 LTV별 필요 현금을 비교한다.

### B5. 연봉별 실제 탐색 가능한 아파트 가격대

- **우선순위 / 역할:** P1 / 계산기→대시보드 연결형
- **KO title:** 연봉 5천·7천·1억원이면 어느 가격대 아파트까지 볼 수 있을까? DSR·LTV·현금 함께 계산
- **EN title:** What Apartment Price Can KRW 50M, 70M, or 100M Income Support in Korea?
- **Target keyword:** KO `연봉 5000 아파트`, `연봉 7000 주담대 집값` / EN `apartment budget by income Korea`
- **검색 의도:** 소득을 기준으로 대출 한도가 아니라 실제 탐색 가능한 집값 범위를 확인하려는 의도
- **연결할 계산기:** `/tools/dsr-ltv-calculator`, `/market/real-estate`
- **연결할 기존 글:** `/posts/personalFinance/dsr-40-income-loan-limit-table`, `/posts/personalFinance/cash-100m-200m-300m-apartment-budget`
- **CTA 위치 제안:** 연봉별 안전 탐색 가격표 직후 계산기, 가격대별 대시보드 deep link
- **기존 글과의 차별점:** 기존 연소득별 대출 원금 표를 현금·LTV까지 포함한 실제 아파트 탐색 가격대로 확장한다.

### B6. 아파트 매매 부대비용 표

- **우선순위 / 역할:** P2 / 보완형 자료표
- **KO title:** 5억·7억·10억 아파트, 매매가 외 현금은 얼마나 더 필요할까?
- **EN title:** Beyond the Purchase Price: Extra Cash Needed for a KRW 500M, 700M, or 1B Apartment
- **Target keyword:** KO `아파트 매매 부대비용`, `5억 아파트 취득 부대비용` / EN `Korea apartment purchase closing costs`
- **검색 의도:** 취득 관련 비용, 중개보수, 이사·수리비, 남길 비상금을 예산에 반영하려는 의도
- **연결할 계산기:** `/tools/dsr-ltv-calculator`
- **연결할 기존 글:** `/posts/personalFinance/mortgage-risk-checklist-dsr-variable`, `/posts/personalFinance/cash-100m-200m-300m-apartment-budget`
- **CTA 위치 제안:** 가격대별 부대비용 체크표 직후 DSR/LTV 계산기
- **기존 글과의 차별점:** 기존 글에서 주의사항으로 언급한 부대비용을 독립 숫자표로 확장한다. 세율·요율 변경 가능성을 명시해야 한다.

### B7. 부부합산소득과 단독소득 비교

- **우선순위 / 역할:** P2 / 조건 비교형
- **KO title:** 부부합산소득이면 주담대 한도가 얼마나 달라질까? 단독소득과 비교할 때 주의점
- **EN title:** Combined Household Income vs Single Income for Korean Mortgage Affordability
- **Target keyword:** KO `부부합산소득 주담대 한도`, `맞벌이 DSR` / EN `combined household income mortgage Korea`
- **검색 의도:** 맞벌이 부부가 단독소득과 합산소득 기준의 차이와 실제 심사 변수를 확인하려는 의도
- **연결할 계산기:** `/tools/dsr-ltv-calculator`
- **연결할 기존 글:** `/posts/personalFinance/dsr-40-income-loan-limit-table`, `/posts/personalFinance/mortgage-risk-checklist-dsr-variable`
- **CTA 위치 제안:** 단독·합산 입력 시나리오 뒤 DSR/LTV 계산기
- **기존 글과의 차별점:** 소득 합산이 자동 승인이나 한도 증가를 보장하지 않는다는 전제로 부부 의사결정을 다룬다.

### B8. 월 원리금 기준 감당 가능한 집값

- **우선순위 / 역할:** P0 / 현금흐름 중심 계산 전환
- **KO title:** 월 원리금 150만·200만·250만원으로 감당 가능한 주담대와 집값은?
- **EN title:** What Mortgage and Home Price Fit a Monthly Payment of KRW 1.5M, 2M, or 2.5M?
- **Target keyword:** KO `월 200만원 주담대`, `월상환액별 대출 가능 금액` / EN `mortgage amount by monthly payment Korea`
- **검색 의도:** 연소득 규정표보다 실제 가계가 감당 가능한 월상환액에서 대출 원금과 집값을 역산하려는 의도
- **연결할 계산기:** `/tools/dsr-ltv-calculator`, `/market/real-estate`
- **연결할 기존 글:** `/posts/personalFinance/dsr-40-income-loan-limit-table`, `/posts/personalFinance/mortgage-risk-checklist-dsr-variable`
- **CTA 위치 제안:** 월상환액별 대출·안전 집값 표 직후 DSR/LTV 계산기, 이후 대시보드 가격 deep link
- **기존 글과의 차별점:** 규제상 최대 한도가 아니라 사용자가 정한 월 현금흐름 상한에서 시작한다.

### B9. 5억원 이하 수도권 아파트 찾기

- **우선순위 / 역할:** P1 / 대시보드 검색 유입·전환형
- **KO title:** 서울·경기·인천 5억원 이하 아파트, 실거래·거래량·평단가로 찾는 법
- **EN title:** How to Find Apartments Under KRW 500M in Seoul, Gyeonggi, and Incheon
- **Target keyword:** KO `서울 5억 이하 아파트`, `경기 5억 아파트` / EN `apartments under KRW 500 million Korea`
- **검색 의도:** 특정 예산 이하에서 실제 거래가 있는 지역·단지를 탐색하고 비교하려는 의도
- **연결할 계산기:** `/market/real-estate`, `/tools/dsr-ltv-calculator`
- **연결할 기존 글:** `/posts/personalFinance/apt-dashboard-home-goal-roadmap`, `/posts/personalFinance/how-to-read-apartment-transaction-prices`
- **CTA 위치 제안:** 지역별 비교 직후 가격 필터 deep link, 결론에서 DSR/LTV 계산기
- **기존 글과의 차별점:** 일반 대시보드 사용법이 아니라 5억원이라는 명확한 예산 필터와 실거래 해석에 집중한다.

### B10. 아파트 계약금·중도금·잔금 현금 타임라인

- **우선순위 / 역할:** P1 / 구매 준비 체크리스트형
- **KO title:** 아파트 매매 계약금·중도금·잔금은 언제 얼마 필요할까? 5억·7억 예시
- **EN title:** Apartment Purchase Cash Timeline in Korea: Deposit, Interim Payment, and Closing Balance
- **Target keyword:** KO `아파트 계약금 중도금 잔금`, `아파트 매매 현금 준비` / EN `Korea apartment purchase payment timeline`
- **검색 의도:** 총 구매 가능액뿐 아니라 계약부터 잔금일까지 필요한 현금 시점과 부족 가능성을 확인하려는 의도
- **연결할 계산기:** `/tools/dsr-ltv-calculator`, `/market/real-estate`
- **연결할 기존 글:** `/posts/personalFinance/cash-100m-200m-300m-apartment-budget`, `/posts/personalFinance/mortgage-risk-checklist-dsr-variable`
- **CTA 위치 제안:** 현금 타임라인 표 직후 DSR/LTV 계산기, 후보 가격 확인 단계에서 대시보드
- **기존 글과의 차별점:** 최종 구매 가능 금액이 아니라 현금이 필요한 시점을 분리해 계약 실행 리스크를 다룬다.

## 4. CAGR·FIRE·은퇴자금 클러스터 10개

### C1. 원금 2배에 필요한 CAGR

- **우선순위 / 역할:** P0 / 백링크용 핵심 자료표 + CAGR 전환
- **KO title:** 원금이 2배 되려면 연 수익률이 몇 %여야 할까? 5·10·15·20년 CAGR 표
- **EN title:** What CAGR Doubles Your Money? A 5-, 10-, 15-, and 20-Year Table
- **Target keyword:** KO `원금 2배 수익률`, `10년 2배 CAGR` / EN `CAGR to double money`
- **검색 의도:** 목표 기간 안에 자산을 두 배로 만들기 위해 필요한 연평균 복리수익률을 확인하려는 의도
- **연결할 계산기:** `/tools/cagr-calculator`
- **연결할 기존 글:** `/posts/personalFinance/what-is-cagr`, `/posts/investingInfo/cagr-7percent-reality-check`
- **CTA 위치 제안:** 기간별 필요 CAGR 표 직후 CAGR 계산기
- **기존 글과의 차별점:** CAGR 정의를 반복하지 않고 목표 배수와 기간에서 필요한 CAGR을 역산하는 인용 자료로 만든다.

### C2. 손실 후 원금 회복 수익률

- **우선순위 / 역할:** P1 / 데이터 자료형 + 위험 해석
- **KO title:** 투자 손실 후 원금 회복에 필요한 수익률: -10%·-20%·-30%·-50%
- **EN title:** Required Return to Recover From a 10%, 20%, 30%, or 50% Loss
- **Target keyword:** KO `원금 회복 수익률`, `마이너스 50% 회복` / EN `return needed to recover investment loss`
- **검색 의도:** 손실률과 회복에 필요한 상승률이 대칭이 아닌 이유를 숫자로 확인하려는 의도
- **연결할 계산기:** `/tools/cagr-calculator`, `/tools/compound-interest`
- **연결할 기존 글:** `/posts/investingInfo/diagnose-investing-skill-with-cagr`, `/posts/investingInfo/cagr-7percent-reality-check`
- **CTA 위치 제안:** 손실·회복률 표 직후 CAGR 계산기
- **기존 글과의 차별점:** 투자 실력 평가나 기대수익률 대신 손실 후 회복에 필요한 수익률과 기간을 집중적으로 다룬다.

### C3. 명목 수익률과 실질 CAGR

- **우선순위 / 역할:** P2 / 기존 CAGR 글 보완형
- **KO title:** 명목 수익률 7%면 실질 CAGR은 얼마일까? 물가 2%·3%·4% 비교
- **EN title:** Nominal 7% vs Real CAGR: The Impact of 2%, 3%, and 4% Inflation
- **Target keyword:** KO `실질 CAGR`, `물가 반영 수익률` / EN `real CAGR after inflation`
- **검색 의도:** 명목 수익률에서 물가를 반영한 실제 구매력 성장률을 확인하려는 의도
- **연결할 계산기:** `/tools/cagr-calculator`, `/tools/compound-interest`
- **연결할 기존 글:** `/posts/investingInfo/cagr-7percent-reality-check`, `/posts/economicInfo/inflation-basics`
- **CTA 위치 제안:** 명목·실질 CAGR 표 직후 CAGR 계산기
- **기존 글과의 차별점:** 기존 연 7% 현실 체크의 물가 부분을 실질 CAGR 계산표로 좁혀 보완한다.

### C4. 월 은퇴생활비별 필요한 은퇴자금

- **우선순위 / 역할:** P0 / 최고 의도 FIRE 전환형
- **KO title:** 은퇴 후 월 200만·300만·400만·500만원 쓰려면 은퇴자금 얼마가 필요할까?
- **EN title:** How Much Retirement Savings Do You Need for $2K, $3K, $4K, or $5K Monthly Spending?
- **Target keyword:** KO `은퇴 생활비 300만원 필요한 자금`, `월 400만원 은퇴자금` / EN `retirement savings needed by monthly spending`
- **검색 의도:** 원하는 월 생활비를 기준으로 필요한 은퇴자산을 빠르게 확인하려는 강한 계산 의도
- **연결할 계산기:** `/tools/fire-calculator`
- **연결할 기존 글:** `/posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal`, `/posts/personalFinance/fire-spending-buckets-essential-choice-insurance`
- **CTA 위치 제안:** 첫 월생활비·인출률 표 직후 FIRE 계산기
- **기존 글과의 차별점:** 은퇴 설계 원칙보다 사용자가 검색하는 월 생활비 금액별 필요자산 표에 집중한다.

### C5. 은퇴 연령별 필요한 월 저축액

- **우선순위 / 역할:** P0 / FIRE·목표자산 양방향 전환
- **KO title:** 50세·55세·60세 은퇴하려면 지금부터 월 얼마를 모아야 할까?
- **EN title:** How Much Should You Save Monthly to Retire at 50, 55, or 60?
- **Target keyword:** KO `50세 은퇴 월 저축`, `55세 은퇴자금` / EN `how much to save to retire at 50`
- **검색 의도:** 목표 은퇴 연령별 필요한 월 저축액과 현재 계획의 부족액을 확인하려는 의도
- **연결할 계산기:** `/tools/fire-calculator`, `/tools/goal-simulator`
- **연결할 기존 글:** `/posts/personalFinance/fire-assumption-errors-7-fixes`, `/posts/personalFinance/goal-amount-fast-strategy`
- **CTA 위치 제안:** 은퇴 연령별 필요 월저축 표 직후 FIRE 계산기, 부족액 조정 뒤 목표자산 계산기
- **기존 글과의 차별점:** 은퇴 후 인출보다 은퇴 전 축적 기간과 월 저축액 역산에 집중한다.

### C6. 인출률별 필요한 은퇴자금

- **우선순위 / 역할:** P1 / FIRE 숫자표 보완형
- **KO title:** 3%·3.5%·4%·5% 인출률별 필요한 은퇴자금 비교
- **EN title:** Retirement Savings Needed at 3%, 3.5%, 4%, and 5% Withdrawal Rates
- **Target keyword:** KO `인출률별 은퇴자금`, `4%룰 은퇴자금` / EN `retirement savings by withdrawal rate`
- **검색 의도:** 같은 생활비에서도 인출률 가정에 따라 필요한 은퇴자산이 얼마나 달라지는지 비교하려는 의도
- **연결할 계산기:** `/tools/fire-calculator`
- **연결할 기존 글:** `/posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal`, `/posts/personalFinance/fire-sequence-risk-first-5-years`
- **CTA 위치 제안:** 생활비·인출률 매트릭스 직후 FIRE 계산기
- **기존 글과의 차별점:** 4%룰 개념 설명을 반복하지 않고 여러 인출률별 필요자산을 한 표에서 비교한다.

### C7. 국민연금 전 공백 자금

- **우선순위 / 역할:** P1 / 한국형 은퇴 현금흐름 전환
- **KO title:** 국민연금 받기 전 5년·10년 공백, 얼마를 따로 준비해야 할까?
- **EN title:** How Much Should You Save for the Gap Before Pension Income Starts?
- **Target keyword:** KO `국민연금 전 은퇴 공백`, `연금 공백 자금` / EN `retirement income bridge before pension`
- **검색 의도:** 조기 은퇴 시 연금 수령 전 생활비를 별도 자산으로 준비하려는 의도
- **연결할 계산기:** `/tools/fire-calculator`, `/tools/goal-simulator`
- **연결할 기존 글:** `/posts/personalFinance/fire-assumption-errors-7-fixes`, `/posts/personalFinance/fire-sequence-risk-first-5-years`
- **CTA 위치 제안:** 공백 기간·월생활비 표 직후 FIRE 계산기
- **기존 글과의 차별점:** 연금을 일반 현금흐름으로 언급하는 기존 글에서 연금 시작 전 공백 구간만 독립 계산한다.

### C8. 자가 보유 vs 월세 은퇴자금

- **우선순위 / 역할:** P2 / 주거비 시나리오형
- **KO title:** 자가 보유 vs 월세 거주, 은퇴자금 목표는 얼마나 달라질까?
- **EN title:** Retirement Planning With a Paid-Off Home vs Renting
- **Target keyword:** KO `자가 월세 은퇴자금 비교`, `은퇴 후 주거비` / EN `retirement savings homeowner vs renter`
- **검색 의도:** 은퇴 후 주거 형태가 월지출과 필요 은퇴자산에 미치는 영향을 비교하려는 의도
- **연결할 계산기:** `/tools/fire-calculator`
- **연결할 기존 글:** `/posts/personalFinance/fire-spending-buckets-essential-choice-insurance`, `/posts/personalFinance/rent-jeonse-buy-cashflow-opportunity-cost`
- **CTA 위치 제안:** 주거비 시나리오 비교표 직후 FIRE 계산기
- **기존 글과의 차별점:** 일반 주거 선택이 아니라 은퇴 이후 지속 주거비가 FIRE 목표자산을 바꾸는 효과에 집중한다.

### C9. Coast FIRE 계산법

- **우선순위 / 역할:** P1 / 신규 검색 의도·EN 확장형
- **KO title:** Coast FIRE 계산법: 지금 얼마가 있으면 추가 저축 없이 은퇴 목표에 도달할까?
- **EN title:** Coast FIRE Guide: How Much Do You Need Invested Today?
- **Target keyword:** KO `Coast FIRE 계산`, `코스트 파이어 목표금액` / EN `Coast FIRE number`
- **검색 의도:** 현재 투자자산이 향후 추가 저축 없이 은퇴 목표까지 성장할 수 있는지 확인하려는 의도
- **연결할 계산기:** `/tools/fire-calculator`, `/tools/compound-interest`
- **연결할 기존 글:** `/posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal`, `/posts/personalFinance/simple-vs-compound`
- **CTA 위치 제안:** 현재 연령·은퇴 연령별 필요 시작자산 표 직후 복리 계산기, 결론에서 FIRE 계산기
- **기존 글과의 차별점:** 일반 FIRE 목표액이 아니라 현재 확보해야 할 투자자산을 역산하는 Coast FIRE 검색 의도를 새로 확보한다.

### C10. 은퇴 시점의 주담대 잔액

- **우선순위 / 역할:** P2 / FIRE·DSR 교차 클러스터
- **KO title:** 은퇴 시점에 주담대가 남아 있으면 필요한 은퇴자금은 얼마나 늘어날까?
- **EN title:** How a Mortgage at Retirement Changes Your FIRE Number
- **Target keyword:** KO `주담대 남은 은퇴`, `대출 있는 은퇴자금` / EN `retirement planning with a mortgage`
- **검색 의도:** 은퇴 후에도 남는 월상환액이 필요 은퇴자산과 현금흐름에 미치는 영향을 확인하려는 의도
- **연결할 계산기:** `/tools/fire-calculator`, `/tools/dsr-ltv-calculator`
- **연결할 기존 글:** `/posts/personalFinance/fire-sequence-risk-first-5-years`, `/posts/personalFinance/mortgage-risk-checklist-dsr-variable`
- **CTA 위치 제안:** 은퇴 시 대출 잔액·월상환액 시나리오 뒤 FIRE 계산기, 대출 조건 확인 뒤 DSR/LTV 계산기
- **기존 글과의 차별점:** 기존 순서 리스크 글의 대출 주의사항을 은퇴 목표자산 증가액으로 수치화한다.

## 5. P0 1차 제작 순서

월 수익화 목표를 고려하면 행동 의도와 계산기 전환이 강한 아래 9개를 먼저 제작한다.

| 제작 순서 | 후보 | 핵심 전환 |
| ---: | --- | --- |
| 1 | B1. 5억·7억·10억 아파트 필요 현금·연봉 | DSR/LTV 계산기 → 부동산 대시보드 |
| 2 | B2. 기존 신용대출이 주담대 한도에 미치는 영향 | DSR/LTV 계산기 |
| 3 | B8. 월 원리금 기준 감당 가능한 집값 | DSR/LTV 계산기 → 가격 deep link |
| 4 | A9. 3억·5억·10억 목표별 월 투자금 | 목표자산 계산기 |
| 5 | A1. 월 100만원 장기 적립식 투자표 | DCA 계산기 → 복리 계산기 |
| 6 | A3. 투자를 5년 늦게 시작하는 비용 | 목표자산 계산기 |
| 7 | C4. 월 은퇴생활비별 필요한 은퇴자금 | FIRE 계산기 |
| 8 | C5. 은퇴 연령별 필요한 월 저축액 | FIRE 계산기 → 목표자산 계산기 |
| 9 | C1. 원금 2배에 필요한 CAGR | CAGR 계산기 |

## 6. 클러스터 내부링크 구조

### 목표자산·복리·DCA

`금액·기간 숫자표 → 목표자산 계산기 → DCA/복리 결과 → 비용·중단·증액 글`

- 허브 계산기: `/tools/goal-simulator`
- 보조 계산기: `/tools/dca-calculator`, `/tools/compound-interest`
- 백링크용 자료 후보: A1, A6, A9
- 전환형 후보: A3, A4, A8, A10

### DSR·LTV·부동산 예산

`후보 집값·월상환 질문 → DSR/LTV 계산기 → 안전 탐색 가격대 → 실거래 대시보드`

- 허브 계산기: `/tools/dsr-ltv-calculator`
- 보조 대시보드: `/market/real-estate`
- 백링크용 자료 후보: B1, B3, B4, B8
- 전환형 후보: B2, B5, B9, B10

### CAGR·FIRE·은퇴자금

`CAGR·생활비 숫자표 → CAGR/FIRE 계산기 → 목표 부족액 확인 → 목표자산 계산기`

- 허브 계산기: `/tools/fire-calculator`, `/tools/cagr-calculator`
- 보조 계산기: `/tools/goal-simulator`, `/tools/compound-interest`
- 백링크용 자료 후보: C1, C2, C4, C6
- 전환형 후보: C5, C7, C9, C10

## 7. 제작 전 최종 확인 체크리스트

- [ ] GSC와 네이버에서 target keyword의 실제 노출·유사 query를 확인한다.
- [ ] 기존 글과 제목뿐 아니라 첫 핵심 표의 검색 의도까지 중복되지 않는지 확인한다.
- [ ] 첫 비교표 직후 연결할 계산기 CTA를 하나만 강하게 배치한다.
- [ ] 보조 계산기·관련 글 링크는 핵심 답변 이후에 배치한다.
- [ ] KO/EN 예시는 각 독자에게 자연스러운 통화와 상황으로 별도 작성한다.
- [ ] 수익률, 대출 가능액, 매수 가능 금액, 은퇴 결과를 보장하지 않는다고 명시한다.
- [ ] 금리·세율·대출 정책에 민감한 글은 기준일과 가정을 표시한다.
- [ ] 제작 후 `tool_calculate`, `result_ad_view`, CTA 이동과 검색 CTR을 2주 단위로 측정한다.

## 8. 이번 작업 결과

- 신규 콘텐츠 후보: 30개
- 목표자산·복리·DCA: 10개
- DSR·LTV·부동산 예산: 10개
- CAGR·FIRE·은퇴자금: 10개
- 실제 글 생성: 없음
- 기존 콘텐츠 수정: 없음
