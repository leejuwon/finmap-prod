# Finmap 부동산 대시보드 콘텐츠 갭 분석

작성일: 2026-06-03

이번 문서는 신규 글을 생성하지 않고, 기존 Finmap 포스트와 부동산 대시보드/계산기 연결 구조를 점검해 신규 블로그 후보를 도출하기 위한 분석 리포트입니다.

## 1. 요약 결론

- 기존 콘텐츠는 `DSR/LTV`, `보유현금별 아파트 예산`, `금리 변화와 주담대 한도`, `내 집 마련 로드맵` 쪽이 이미 강합니다.
- `/market/real-estate` 대시보드는 중앙값, 평균, 평단가, 거래량, 전월/전년 변화율, 세대수 필터까지 갖추고 있지만, 이 지표를 검색자 눈높이에서 독립적으로 설명하는 블로그 글은 아직 부족합니다.
- `/market/real-estate/*top100` 랜딩은 이미 존재하므로 단순 “Top100 순위 글”은 중복 위험이 큽니다. 대신 “Top100을 어떻게 해석해야 하는가” 또는 “같은 예산으로 서울·경기·인천을 비교하는 법”처럼 사용 시나리오 중심으로 가야 합니다.
- 신규 후보는 대출 계산 자체보다 `실거래 지표 해석 -> 대시보드 필터 적용 -> 계산기 검증` 흐름이 가장 효율적입니다.
- 최우선 후보는 “아파트 실거래가 보는 법: 평균·중앙값·평단가·거래량”입니다. 백링크용 자료형 글이면서 대시보드 유입 전환도 자연스럽습니다.

## 2. 분석 범위와 검색 방법

### 확인한 주요 경로

- `content/posts` 전체
- `content/posts/personalFinance/ko`, `content/posts/personalFinance/en`
- `content/posts/investingInfo/ko`, `content/posts/investingInfo/en`
- `content/posts/economicInfo/ko`, `content/posts/economicInfo/en`
- `pages/market/real-estate.js`
- `pages/market/real-estate/apt/[aptKey].js`
- `pages/market/real-estate/*top100.js`
- `pages/tools/dsr-ltv-calculator.js`
- `pages/tools/index.js`
- `_components/RealEstateTop100Landing.js`
- `_components/RealEstateSeoLanding.js`
- `_components/ToolBacklinkKit.js`
- `lib/reTop100Landing.js`
- `lib/realEstateSeoLandingPages.js`
- `next-sitemap.config.js`
- `public/sitemap-0.xml`

### 검색에 사용한 키워드

한국어:

- `부동산`
- `아파트`
- `실거래`
- `실거래가`
- `대출`
- `주담대`
- `DSR`
- `LTV`
- `내 집`
- `내집`
- `내 집 마련`
- `주택`
- `전세`
- `월세`
- `담보`
- `평단가`
- `거래량`
- `세대수`
- `Top100`

영어:

- `mortgage`
- `real estate`
- `apartment`
- `housing`
- `home buying`
- `home purchase`
- `loan`
- `jeonse`
- `rent`
- `transaction volume`
- `price distribution`

## 3. 대시보드/계산기/라우트 연결 구조

| 구분 | 경로/파일 | 확인 내용 | 콘텐츠 전략상 의미 |
|---|---|---|---|
| 메인 대시보드 | `/market/real-estate` / `pages/market/real-estate.js` | 국토부 아파트 매매 실거래 기반. 지역, 기간, 평형, 년식, 가격, 세대수, 단지명 필터. 정렬 기준은 거래량, 중앙값, 평균, 최고가, 총액, 대표평단가, 평균평단가 등. | 신규 글에서 “지표 해석 -> 필터 적용” CTA를 걸기 좋음. |
| 단지 상세 | `/market/real-estate/apt/[aptKey]` | 단지별 중앙값, 평균, 대표평단가, 거래량, 최근 거래, 세대수/동수/주차 등 표시. | 상세 URL은 유용하지만 sitemap 제외 성격이 있어 직접 SEO 타깃보다는 대시보드 내부 탐색용. |
| Top100 SEO 가이드 | `/market/real-estate/seoul-apartment-top100`, `/gyeonggi-apartment-top100`, `/incheon-apartment-top100` | `lib/realEstateSeoLandingPages.js`에 대표가격, 평단가, 거래량 해석 가이드 존재. 영어 locale은 notFound 처리. | 단순 Top100 “보는 법”은 이미 일부 존재. 블로그로 만들면 더 깊은 해석/사례형이어야 함. |
| Top100 랭킹 | `/market/real-estate/seoul-top100`, `/gangnam-top100`, `/gangnam3-top100`, `/mayongseong-top100`, `/songpa-top100`, `/songpa-gangnam-top100`, `/magok-top100` | 지역별 실거래 Top100 랭킹. 대표가격, 최근 거래, 거래량 강조. | 지역명 검색 대응은 이미 페이지가 있음. 신규 글은 랭킹 자체보다 랭킹 해석/비교/주의점 쪽 권장. |
| 계산기 | `/tools/dsr-ltv-calculator` | 보유자산, 소득, 기존부채, 금리, 대출기간, LTV, DSR로 대출 가능액/매수 가능 가격/안전 탐색 가격대 계산. 대시보드 CTA 있음. | 대출/예산 글의 전환 허브. 신규 글에서는 실제 심사 보장 아님을 계속 명시해야 함. |
| 도구 허브 | `/tools` | DSR LTV 계산기 카드가 있고 아파트 구매 가능 가격대 설명 포함. | 신규 글에서 계산기 진입 보조 링크로 활용. |
| sitemap | `next-sitemap.config.js`, `public/sitemap-0.xml` | `/market/real-estate`, Top100, `/tools/dsr-ltv-calculator` 포함. `/market/real-estate/apt/*`는 sitemap 제외. | 신규 블로그는 sitemap에 실릴 수 있는 포스트 URL로 허브/계산기/Top100에 내부 링크 집중. |

## 4. 기존 관련 포스트 목록

직접 관련성이 높은 글만 표로 정리했습니다. 넓은 키워드 검색에 잡혔지만 단순 언급 수준인 글은 5장에 별도 정리했습니다.

| locale | title | slug | category/postCategory | 주요 키워드 | 연결된 계산기 또는 대시보드 링크 | 글의 핵심 목적 | 신규 글과 중복될 가능성 |
|---|---|---|---|---|---|---|---|
| ko | 서울·경기·인천 아파트 실거래 대시보드로 ‘내 집 마련 목표’를 숫자로 바꾸는 3단계 로드맵 | `apt-dashboard-home-goal-roadmap` | 재테크 / personalFinance | 내집마련, 실거래가, 아파트, 대시보드, 예산, LTV, DSR, 거래량, 가격분포 | `/market/real-estate`, `/tools/dsr-ltv-calculator`, `/market/real-estate/seoul-apartment-top100` | 대시보드를 목표 가격대, 자금조달, 실행 루틴으로 연결 | 일반 “대시보드 사용법”, “내 예산으로 찾는 순서”와 높음 |
| en | A 3-Step Home-Buying Roadmap Using Real Estate Transaction Data | `apt-dashboard-home-goal-roadmap` | Personal Finance / personalFinance | home buying, Korea real estate, apartment, transaction data, budget, debt rules | `/en/market/real-estate`, `/en/tools/dsr-ltv-calculator` | 한국 아파트 실거래 데이터를 홈바잉 로드맵으로 전환 | 영어 홈바잉 로드맵과 높음 |
| ko | 보유현금 1억·2억·3억이면 어느 가격대 아파트까지 가능할까? | `cash-100m-200m-300m-apartment-budget` | 재테크 / personalFinance | 보유현금, DSR, LTV, 아파트 구매 가능 금액, 주담대 한도, 부대비용 | `/tools/dsr-ltv-calculator`, `/market/real-estate` | 보유현금별 매수 가능 가격대 시뮬레이션 | 예산/현금 기준 신규 글과 높음 |
| en | Cash KRW 100M, 200M, 300M: What Apartment Budget Can It Support in Korea? | `cash-100m-200m-300m-apartment-budget` | Personal Finance / personalFinance | Korea apartment budget, DSR, LTV, cash, mortgage affordability | `/en/tools/dsr-ltv-calculator`, `/en/market/real-estate` | KRW 현금 수준별 한국 아파트 예산 추정 | 영어 affordability 글과 높음 |
| ko | DSR 40%면 연소득별 주담대 한도는 얼마나 될까? | `dsr-40-income-loan-limit-table` | 재테크 / personalFinance | DSR 40%, 연소득, 주담대 한도, 대출 가능액, 원리금균등 | `/tools/dsr-ltv-calculator`, `/market/real-estate` | 연소득별 주담대 한도 기준표 | 대출 한도표/DSR 설명과 매우 높음 |
| en | DSR 40% by Income: How Much Korean Mortgage Principal Can It Support? | `dsr-40-income-loan-limit-table` | Personal Finance / personalFinance | DSR, Korea mortgage, income, loan capacity | `/en/tools/dsr-ltv-calculator`, `/en/market/real-estate` | DSR 40% 소득별 대출 가능액 영어 기준표 | 영어 DSR 표와 매우 높음 |
| ko | DSR은 통과했는데 왜 집을 못 살까? LTV·현금·부대비용 병목 이해하기 | `dsr-pass-ltv-cash-bottleneck` | 재테크 / personalFinance | DSR, LTV, 현금 병목, 부대비용, 후보 집값 | `/tools/dsr-ltv-calculator`, `/market/real-estate` | DSR 통과 후에도 매수 불가가 나오는 병목 설명 | DSR/LTV 병목 글과 매우 높음 |
| en | Passing DSR but Still Blocked? Understanding LTV, Cash, and Cost Bottlenecks | `dsr-pass-ltv-cash-bottleneck` | Personal Finance / personalFinance | DSR, LTV, cash bottleneck, apartment budget | `/en/tools/dsr-ltv-calculator`, `/en/market/real-estate` | LTV/현금/비용 병목 영어 설명 | 영어 affordability 병목 글과 매우 높음 |
| ko | 금리 1%p 오르면 내 주담대 한도는 얼마나 줄어들까? | `interest-rate-1p-loan-limit-impact` | 재테크 / personalFinance | 금리 1%p, DSR, LTV, 주담대 한도, 대출 가능액 | `/tools/dsr-ltv-calculator`, `/market/real-estate` | 금리 민감도가 대출한도와 후보 집값에 주는 영향 | 금리-대출 한도 글과 높음 |
| en | How Much Can a 1pp Rate Increase Reduce Korean Mortgage Capacity? | `interest-rate-1p-loan-limit-impact` | Personal Finance / personalFinance | mortgage rate, DSR, LTV, loan capacity | `/en/tools/dsr-ltv-calculator`, `/en/market/real-estate` | 금리 1%p 변화의 대출 가능액 영향 | 영어 mortgage capacity 글과 높음 |
| ko | 아파트 매수 전 대출 리스크 체크리스트: DSR, LTV, 금리, 비상금 | `mortgage-risk-checklist-dsr-variable` | 재테크 / personalFinance | 주택대출, DSR, LTV, 대출 리스크, 비상금, 부동산 실거래 | `/tools/dsr-ltv-calculator`, `/market/real-estate` | 매수 전 대출·금리·현금흐름 사전 점검 | 대출 리스크 체크리스트와 매우 높음 |
| en | Mortgage Risk Checklist Before Buying a Korean Apartment | `mortgage-risk-checklist-dsr-variable` | Personal Finance / personalFinance | Korea mortgage, DSR, LTV, cash buffer, real estate dashboard | `/en/tools/dsr-ltv-calculator`, `/en/market/real-estate` | 한국 아파트 매수 전 모기지 리스크 체크 | 영어 mortgage checklist와 매우 높음 |
| ko | 전세·월세·매매, 무엇이 ‘더 싸다’가 아니라 무엇이 ‘내게 더 안전하다’인가 | `rent-jeonse-buy-cashflow-opportunity-cost` | 재테크 / personalFinance | 전세, 월세, 매매, 주거의사결정, 현금흐름, 기회비용, 실거래, 대시보드 | `/market/real-estate`, `/tools/dsr-ltv-calculator`, `/market/real-estate/incheon-apartment-top100` | 주거 선택을 비용보다 안정성/트리거로 비교 | 전월세 vs 매매 글과 높음 |
| en | Rent vs Jeonse vs Buy: Not “Cheaper,” but “Safer” | `rent-jeonse-buy-cashflow-opportunity-cost` | Personal Finance / personalFinance | Korea housing, rent, jeonse, buy, cash flow, mortgage | `/en/market/real-estate`, `/en/tools/dsr-ltv-calculator` | 한국 주거 선택을 현금흐름/기회비용으로 비교 | 영어 Korea housing decision 글과 높음 |
| ko | 금리(할인율)는 어떻게 서울·경기·인천 아파트 가격을 흔드는가 | `rates-discount-mortgage-demand-apt-prices` | 투자정보 / investingInfo | 금리, 할인율, 대출금리, DSR, 거래량, 서울아파트, 실거래, 대시보드 | `/market/real-estate`, `/market/real-estate/gyeonggi-apartment-top100`, `/tools/dsr-ltv-calculator` | 금리 -> 대출금리/수요/심리 -> 아파트 가격 채널 설명 | 금리와 거래량 해석 일부와 중간 |
| en | How Rates Transmit Into Korea Apartment Prices | `rates-discount-mortgage-demand-apt-prices` | Investing Info / investingInfo | Korea real estate, mortgage rates, demand, sentiment, transaction volume | `/en/market/real-estate`, `/en/tools/dsr-ltv-calculator` | 금리 전이 경로를 영어권 독자에게 설명 | 영어 macro-housing 글과 중간 |
| ko | 가계 자산배분에서 부동산은 ‘비중’이 아니라 ‘역할’이다 | `real-estate-role-in-portfolio-risk-budget` | 투자정보 / investingInfo | 리스크예산, 자산배분, 부동산역할, 거래량, 유동성, 금리민감도 | `/market/real-estate`, `/market/real-estate/incheon-apartment-top100`, `/tools/dsr-ltv-calculator` | 부동산을 가계 포트폴리오 역할/리스크로 재정의 | 자산배분형 글과 높음, 실거래 지표 기초와는 낮음 |
| en | Real Estate Is a Role, Not a Weight | `real-estate-role-in-portfolio-risk-budget` | Investing Info / investingInfo | portfolio, risk budget, Korea real estate, liquidity, rates | `/en/market/real-estate` | 한국 부동산을 포트폴리오 리스크 관점으로 설명 | 영어 portfolio-housing 글과 높음 |
| ko | 서울·경기·인천을 ‘지역 선택’이 아니라 ‘리스크 예산’으로 읽는 법 | `seoul-gyeonggi-incheon-risk-budget-framework` | 투자정보 / investingInfo | 서울, 경기, 인천, 부동산투자, 리스크예산, 거래량, 하방방어 | `/market/real-estate`, `/market/real-estate/seoul-apartment-top100`, `/tools/dsr-ltv-calculator` | 수도권 지역을 변동성/유동성/회복탄력으로 비교 | 지역 리스크 비교와 높음, 예산 실전형과는 중간 |
| en | Seoul vs Gyeonggi vs Incheon as a Risk-Budget Problem | `seoul-gyeonggi-incheon-risk-budget-framework` | Investing Info / investingInfo | Korea real estate, Seoul, Gyeonggi, Incheon, risk budget, volume | `/en/market/real-estate` | 수도권 지역 비교를 리스크 예산으로 설명 | 영어 regional risk 글과 높음 |
| ko | 지정학·유가·환율 충격이 서울·경기·인천 집값에 전이되는 5단 체인 | `geopolitics-oil-fx-dashboard` | 경제정보 / economicInfo | 지정학, 유가, 환율, 물가, 금리, 대출금리, 주택시장, 거래량, 가격분포 | `/market/real-estate`, `/market/real-estate/incheon-apartment-top100`, `/tools/dsr-ltv-calculator` | 거시 충격이 주택시장 거래량/가격분포로 전이되는 경로 설명 | 거시 전이/거래량 선행 신호와 중간 |
| en | From Geopolitics to Korea Housing: The 5-Step Transmission Chain | `geopolitics-oil-fx-dashboard` | Economic Info / economicInfo | geopolitics, oil, FX, mortgages, housing, volume, price distribution | `/en/market/real-estate`, `/en/tools/dsr-ltv-calculator` | 거시 충격과 한국 주택시장 연결 설명 | 영어 macro-housing 전이 글과 중간 |

## 5. 검색에 잡혔지만 직접 후보에서는 제외한 인접 글

아래 글들은 키워드 검색에 잡혔지만 부동산 대시보드 신규 글과 직접 중복되는 글은 아닙니다. 내부 링크 보조나 배경지식으로 활용할 수 있습니다.

| 파일/주제 | 잡힌 이유 | 처리 |
|---|---|---|
| `content/posts/economicInfo/ko/interest-rate-basics.md`, `en/interest-rate-basics.md` | 예금/대출/채권 금리 설명 | 금리 배경 링크로만 활용 |
| `content/posts/economicInfo/ko/policy-rate-cut-market-rates.md`, `en/policy-rate-cut-market-rates.md` | 기준금리와 대출금리 분리 | 대출금리 배경 링크로 활용 |
| `content/posts/economicInfo/ko/inflation-basics.md`, `en/inflation-basics.md` | 부동산 시장 언급 | 거시 배경 링크로만 활용 |
| `content/posts/personalFinance/ko/emergency-fund-by-risk.md`, `en/emergency-fund-by-risk.md` | 대출/주거 리스크 포함 | 매수 전 현금 buffer 보조 링크 |
| `content/posts/personalFinance/ko/fire-*.md`, `en/fire-*.md` | 주거비, 대출, 월세/전세 언급 | 은퇴/현금흐름 맥락에서만 관련 |
| `content/posts/personalFinance/ko/high-rate-debt-vs-invest-threshold-rule.md`, `en/high-rate-debt-vs-invest-threshold-rule.md` | 고금리 부채/대출 | 주담대 직접 글은 아니므로 제외 |
| `content/posts/personalFinance/ko/what-is-cagr.md`, `en/what-is-cagr.md` | 부동산을 자산 예시로 언급 | 실거래 대시보드 후보와 직접 관련 낮음 |
| `content/posts/investingInfo/*/bond-etf-duration-drives-returns.md`, `tnx-basics.md`, `us10y-impact-on-korea-and-stock-market.md` | mortgage rates 또는 금리 민감도 언급 | 금리/채권 배경 링크로만 활용 |

## 6. 기존 주제 클러스터

### 6.1 대출/DSR/LTV 클러스터

포함 글:

- `dsr-40-income-loan-limit-table`
- `dsr-pass-ltv-cash-bottleneck`
- `interest-rate-1p-loan-limit-impact`
- `mortgage-risk-checklist-dsr-variable`
- `cash-100m-200m-300m-apartment-budget`

특징:

- 계산기 전환이 강함.
- “대출 가능액”, “구매 가능 금액”, “금리 민감도”, “현금 병목”을 이미 상세히 다룸.
- 신규 글에서 DSR/LTV 자체를 다시 설명하면 중복이 심함.

### 6.2 내 집 마련 계획/주거 선택 클러스터

포함 글:

- `apt-dashboard-home-goal-roadmap`
- `rent-jeonse-buy-cashflow-opportunity-cost`
- `cash-100m-200m-300m-apartment-budget`

특징:

- 대시보드 가격대 -> 계산기 -> 실행 규칙 흐름이 이미 있음.
- “내 예산으로 살 수 있는 아파트 찾는 순서”는 가능하지만 기존 로드맵과 겹치므로 더 실무형 체크리스트/필터 순서로 좁혀야 함.

### 6.3 아파트 실거래 데이터 해석 클러스터

포함 글/페이지:

- `apt-dashboard-home-goal-roadmap`
- `rates-discount-mortgage-demand-apt-prices`
- `geopolitics-oil-fx-dashboard`
- `seoul-apartment-top100`, `gyeonggi-apartment-top100`, `incheon-apartment-top100` SEO 랜딩

특징:

- 거래량, 가격분포, 중앙값/평단가가 여러 글에 등장하지만 독립적인 “기초 해석 글”은 아직 없음.
- 대시보드 기능과 가장 직접적으로 연결되는 갭이 여기에 있음.

### 6.4 부동산 대시보드 사용법/전환 클러스터

포함 글/페이지:

- `apt-dashboard-home-goal-roadmap`
- `/market/real-estate`
- `/market/real-estate/*top100`
- `/tools/dsr-ltv-calculator`

특징:

- 허브와 계산기 간 내부 링크는 좋음.
- 다만 사용자가 검색하는 질문은 “대시보드 사용법”보다 “실거래가 어떻게 봐야 하나”, “거래량 줄면 무슨 뜻인가”, “평단가와 평균가 뭐가 다른가”에 가까움.

### 6.5 거시/포트폴리오 리스크 클러스터

포함 글:

- `rates-discount-mortgage-demand-apt-prices`
- `real-estate-role-in-portfolio-risk-budget`
- `seoul-gyeonggi-incheon-risk-budget-framework`
- `geopolitics-oil-fx-dashboard`

특징:

- 투자자/자산배분 관점이 강함.
- 검색 유입은 대중적인 “실거래가 보는 법”보다 좁을 수 있으나, 내부 링크 깊이를 만드는 데 좋음.

## 7. 부족한 주제와 콘텐츠 갭

| 갭 | 현재 상태 | 왜 필요함 | 권장 처리 |
|---|---|---|---|
| 평균가/중앙값/평단가/거래량을 한 번에 설명하는 기초 글 | 각 글과 SEO 랜딩에 분산 | 네이버 검색자가 가장 많이 헷갈리는 지점. 대시보드 주요 컬럼과 정확히 맞음. | 신규 1순위 |
| 거래량 감소/급감 해석법 | 거시 글에서 일부 다룸 | “거래량 줄면 집값?” 검색 의도에 직접 대응 가능. 가격 예측이 아니라 신뢰도/유동성 해석으로 안전하게 작성 가능. | 신규 2순위 |
| 세대수와 대단지 여부가 가격 안정성에 미치는 영향 | 대시보드에 세대수 필터는 있으나 설명 글 부족 | 세대수 필터의 존재 이유를 콘텐츠로 설명 가능. 대단지/소규모 단지 비교 검색 의도도 있음. | 신규 3순위 |
| 내 예산으로 살 수 있는 아파트 찾는 필터 순서 | 기존 로드맵/현금 글 있음 | 기존 글은 전략형, 신규 글은 `DSR/LTV 계산기 -> 가격 필터 -> 지역/평형/세대수` 실무 루틴으로 차별화 가능. | 보완형 신규 4순위 |
| 서울/경기/인천 같은 예산 가격대 비교 | 리스크 예산 글은 있음 | 실수요자는 “같은 예산이면 어디까지 볼 수 있나”를 검색. 대시보드 유입 전환에 좋음. | 신규 5순위 |
| Top100 단지/지역 랭킹 콘텐츠 | 라우트와 SEO 랜딩 이미 존재 | 단순 랭킹 글은 중복. 월간/연간 데이터 리포트형으로 만들 때만 가치 있음. | 보류 |

## 8. 네이버 검색 키워드 후보

| 키워드 묶음 | 한국어 검색 키워드 | 영어 확장 가능성 | 메모 |
|---|---|---|---|
| 실거래가 기초 | 아파트 실거래가 보는법, 국토부 실거래가 보는법, 아파트 실거래가 해석, 실거래가 평균 중앙값 | 높음 | 영어는 `how to read Korean apartment transaction data`로 확장 가능 |
| 지표 해석 | 아파트 평균가 중앙값 차이, 아파트 평단가 보는 법, 평단가 계산법, 아파트 거래량 보는 법 | 높음 | 대시보드 컬럼과 직접 연결 |
| 거래량 감소 | 아파트 거래량 감소 의미, 아파트 거래량 줄면, 아파트 거래량과 집값, 거래량 급감 집값 | 높음 | 예측 대신 유동성/신뢰도/표본수로 작성 |
| 대단지/세대수 | 대단지 아파트 장점 단점, 세대수 많은 아파트 가격, 1000세대 이상 아파트, 아파트 세대수 가격 안정성 | 중간 | 영어는 Korea-specific이지만 자료형 글로 가능 |
| 예산 기반 탐색 | 내 예산으로 살 수 있는 아파트, 아파트 매수 예산 계산, 보유현금 아파트 구매, DSR LTV 아파트 계산 | 높음 | 기존 글과 겹치므로 필터 순서 중심으로 차별화 필요 |
| 지역 비교 | 서울 경기 인천 아파트 가격 비교, 수도권 아파트 가격대, 경기 인천 아파트 실거래가, 서울 아파트 가격대 | 중간~높음 | 대시보드 전환에 좋음. 영어는 `Seoul vs Gyeonggi vs Incheon apartment prices` |
| 랭킹 | 서울 아파트 실거래가 Top100, 경기 아파트 실거래가 Top100, 인천 아파트 실거래가 Top100, 강남 아파트값 순위 | 낮음~중간 | 이미 랜딩/랭킹 페이지가 있으므로 블로그 신규보다는 기존 페이지 강화 우선 |

## 9. 최종 신규 글 후보 5개

### 1순위: 아파트 실거래가 보는 법 - 평균가, 중앙값, 평단가, 거래량

| 항목 | 내용 |
|---|---|
| 추천 유형 | 백링크용 자료형 글 + 대시보드 전환용 |
| 한국어 제목 후보 | 아파트 실거래가 보는 법: 평균가·중앙값·평단가·거래량을 함께 읽어야 하는 이유 |
| 영어 제목 후보 | How to Read Korean Apartment Transaction Prices: Median, Average, Unit Price, and Volume |
| slug 후보 | `how-to-read-apartment-transaction-prices` |
| target keyword | 아파트 실거래가 보는법, 아파트 평균가 중앙값, 아파트 평단가 보는 법 |
| 검색 의도 | 실거래가 사이트/대시보드에서 어떤 숫자를 먼저 봐야 하는지 이해하려는 정보형 의도 |
| 반드시 다룰 내용 | 중앙값과 평균의 차이, 평단가가 필요한 이유, 거래량이 표본 신뢰도에 주는 영향, 같은 단지라도 평형/층/시점 차이가 있다는 주의, 대시보드에서 `대표가격`, `평균`, `대표평단가`, `거래량`을 보는 순서 |
| 연결할 내부 링크 | `/market/real-estate`, `/market/real-estate/seoul-apartment-top100`, `/market/real-estate/gyeonggi-apartment-top100`, `/market/real-estate/incheon-apartment-top100`, `/posts/personalFinance/apt-dashboard-home-goal-roadmap` |
| 연결할 계산기/대시보드 | `/market/real-estate`, `/tools/dsr-ltv-calculator` |
| 백링크 가능성 | 높음. 지표 용어표/해석표/체크리스트로 커뮤니티·블로그 인용 가능 |
| 기존 글과의 차별점 | 기존 글들은 대시보드 활용이나 주택 계획의 일부로 지표를 설명함. 이 글은 지표 해석 자체를 독립 자료로 정리 |
| 영어 확장 | 높음. 한국 부동산 데이터 입문 글로 자연스러움 |

### 2순위: 아파트 거래량 감소를 해석하는 법

| 항목 | 내용 |
|---|---|
| 추천 유형 | 백링크용 자료형 글 |
| 한국어 제목 후보 | 아파트 거래량 감소는 집값 하락 신호일까? 실거래 데이터로 보는 4가지 해석 |
| 영어 제목 후보 | What Falling Apartment Transaction Volume Means in Korea: 4 Ways to Read the Signal |
| slug 후보 | `apartment-transaction-volume-decline-meaning` |
| target keyword | 아파트 거래량 감소 의미, 아파트 거래량 줄면, 아파트 거래량과 집값 |
| 검색 의도 | 거래량이 줄었다는 뉴스/지역 분위기를 보고 가격 전망보다 먼저 의미를 알고 싶은 정보형 의도 |
| 반드시 다룰 내용 | 거래량은 가격보다 먼저 얼어붙을 수 있음, 거래량 감소가 항상 하락 확정은 아님, 표본수 부족 시 평균/중앙값 왜곡, 지역/평형별 분리 필요, 전월/전년동월 비교의 한계, 대시보드에서 거래량과 가격분포를 함께 보는 순서 |
| 연결할 내부 링크 | `/market/real-estate`, `/posts/investingInfo/rates-discount-mortgage-demand-apt-prices`, `/posts/economicInfo/geopolitics-oil-fx-dashboard`, `/posts/personalFinance/apt-dashboard-home-goal-roadmap` |
| 연결할 계산기/대시보드 | `/market/real-estate`, 필요 시 `/tools/dsr-ltv-calculator` |
| 백링크 가능성 | 높음. 뉴스 해석/커뮤니티 토론에 인용되기 쉬움 |
| 기존 글과의 차별점 | 기존 거시 글은 금리/지정학 전이 경로가 중심. 신규 글은 거래량 하나를 깊게 파는 검색 대응형 |
| 영어 확장 | 높음. `transaction volume`은 영어권 독자에게도 이해 가능한 데이터 주제 |

### 3순위: 세대수와 대단지 여부가 가격 안정성에 미치는 영향

| 항목 | 내용 |
|---|---|
| 추천 유형 | 백링크용 자료형 글 |
| 한국어 제목 후보 | 세대수 많은 대단지 아파트가 더 안정적일까? 거래량·평단가·가격분포로 확인하는 법 |
| 영어 제목 후보 | Are Large Apartment Complexes More Stable? Reading Households, Volume, and Unit Prices in Korea |
| slug 후보 | `large-apartment-complex-households-price-stability` |
| target keyword | 대단지 아파트 가격 안정성, 세대수 많은 아파트 가격, 대단지 아파트 장점 단점 |
| 검색 의도 | 대단지/소규모 단지 중 어느 쪽이 더 안전한지 판단하려는 비교형 정보 의도 |
| 반드시 다룰 내용 | 세대수가 거래 표본과 유동성에 주는 영향, 대단지의 장점과 착시, 소규모 고급 단지의 평균 왜곡 가능성, 세대수만으로 판단하면 안 되는 이유, 대시보드의 세대수 필터와 거래량/평단가 조합 |
| 연결할 내부 링크 | `/market/real-estate`, `/market/real-estate/seoul-top100`, `/market/real-estate/gangnam-top100`, `/posts/investingInfo/seoul-gyeonggi-incheon-risk-budget-framework` |
| 연결할 계산기/대시보드 | `/market/real-estate` |
| 백링크 가능성 | 중간~높음. 대단지 장단점 검색과 커뮤니티 토론에 맞음 |
| 기존 글과의 차별점 | 기존 글은 지역/금리/예산 중심. 세대수 필터를 콘텐츠 주제로 직접 해석한 글은 없음 |
| 영어 확장 | 중간. 한국 아파트 단지 구조 설명을 곁들이면 가능 |

### 4순위: 내 예산으로 살 수 있는 아파트를 찾는 순서

| 항목 | 내용 |
|---|---|
| 추천 유형 | 대시보드 사용법/전환용 글 |
| 한국어 제목 후보 | 내 예산으로 살 수 있는 아파트 찾는 순서: DSR/LTV 계산기부터 실거래 대시보드 필터까지 |
| 영어 제목 후보 | How to Find Korean Apartments Within Your Budget: DSR/LTV Calculator to Transaction Dashboard |
| slug 후보 | `find-apartments-within-budget-dsr-ltv-dashboard` |
| target keyword | 내 예산으로 살 수 있는 아파트, 아파트 매수 예산 계산, DSR LTV 아파트 계산 |
| 검색 의도 | “얼마까지 가능?”에서 끝나지 않고 실제 지역/단지 후보를 좁히려는 실무형 의도 |
| 반드시 다룰 내용 | 계산기 입력 순서, 안전 탐색 가격대 80~90% 개념, 대시보드 가격 필터/지역/평형/년식/세대수 순서, 후보 10개 리스트업, 실제 심사와 투자 결과 보장 아님 명시 |
| 연결할 내부 링크 | `/tools/dsr-ltv-calculator`, `/market/real-estate`, `/posts/personalFinance/cash-100m-200m-300m-apartment-budget`, `/posts/personalFinance/mortgage-risk-checklist-dsr-variable`, `/posts/personalFinance/apt-dashboard-home-goal-roadmap` |
| 연결할 계산기/대시보드 | `/tools/dsr-ltv-calculator`, `/market/real-estate` |
| 백링크 가능성 | 중간. 자료형보다는 전환형이 강함 |
| 기존 글과의 차별점 | 기존 로드맵은 목표 설정/실행 규칙 중심. 신규 글은 실제 입력값과 필터 조작 순서 중심으로 차별화 |
| 영어 확장 | 높음. 외국인/영어 독자에게 한국 아파트 탐색 워크플로우로 유용 |

### 5순위: 서울·경기·인천 지역별 가격대 비교

| 항목 | 내용 |
|---|---|
| 추천 유형 | 대시보드 전환용 글 + 보완형 자료형 |
| 한국어 제목 후보 | 서울·경기·인천 아파트 가격대 비교: 같은 예산으로 어디까지 볼 수 있을까? |
| 영어 제목 후보 | Seoul vs Gyeonggi vs Incheon Apartment Price Bands: What Can the Same Budget Buy? |
| slug 후보 | `seoul-gyeonggi-incheon-apartment-price-band-comparison` |
| target keyword | 서울 경기 인천 아파트 가격 비교, 수도권 아파트 가격대, 같은 예산 아파트 |
| 검색 의도 | 같은 예산으로 어느 지역/가격대까지 볼 수 있는지 비교하려는 실수요형 의도 |
| 반드시 다룰 내용 | 서울/경기/인천을 우열이 아닌 가격대·거래량·평단가·접근성 차이로 비교, 같은 예산 입력 후 대시보드 지역 필터 사용, Top100은 고가 단지 착시가 있으므로 평형/평단가를 함께 볼 것 |
| 연결할 내부 링크 | `/market/real-estate`, `/market/real-estate/seoul-apartment-top100`, `/market/real-estate/gyeonggi-apartment-top100`, `/market/real-estate/incheon-apartment-top100`, `/posts/investingInfo/seoul-gyeonggi-incheon-risk-budget-framework`, `/posts/personalFinance/cash-100m-200m-300m-apartment-budget` |
| 연결할 계산기/대시보드 | `/market/real-estate`, `/tools/dsr-ltv-calculator` |
| 백링크 가능성 | 중간. 지역 비교 자료표가 있으면 상승 |
| 기존 글과의 차별점 | 기존 글은 리스크 예산 프레임. 신규 글은 동일 예산으로 가격대/후보 지역을 찾는 실무 비교 |
| 영어 확장 | 중간~높음. 한국 수도권 지역 비교 주제로 가능 |

## 10. 백링크용 vs 전환용 구분

| 후보 | 백링크용 자료형 적합도 | 대시보드 사용법/전환 적합도 | 판단 |
|---|---:|---:|---|
| 아파트 실거래가 보는 법 | 높음 | 높음 | 최우선. 용어표/해석표/체크리스트 모두 가능 |
| 아파트 거래량 감소 해석 | 높음 | 중간 | 뉴스/커뮤니티 인용 가능성이 큼 |
| 세대수와 대단지 가격 안정성 | 중간~높음 | 중간 | 세대수 필터 사용 이유를 설명하기 좋음 |
| 내 예산으로 살 수 있는 아파트 찾는 순서 | 중간 | 높음 | 계산기와 대시보드 전환 최적 |
| 서울·경기·인천 가격대 비교 | 중간 | 높음 | 지역 필터/Top100 연결에 좋음 |

## 11. 보류/제외 주제

| 주제 | 분류 | 이유 | 대안 |
|---|---|---|---|
| 단순 “부동산 대시보드 사용법” | 제외 | `apt-dashboard-home-goal-roadmap`과 `/market/real-estate` 설명 영역과 중복 | 지표별 문제 해결형 제목으로 전환 |
| DSR 40% 한도표 추가 | 제외 | `dsr-40-income-loan-limit-table`이 이미 있음 | 정책 변경/입력값 변경 시 기존 글 업데이트 |
| 보유현금 1억·2억·3억 예산 | 제외 | `cash-100m-200m-300m-apartment-budget`이 이미 있음 | 4억/5억 확장은 필요성 확인 후 별도 |
| 금리 1%p와 대출한도 | 제외 | `interest-rate-1p-loan-limit-impact`가 이미 있음 | 금리와 거래량/매수심리 연결 글은 가능 |
| 대출 리스크 체크리스트 | 제외 | `mortgage-risk-checklist-dsr-variable`이 이미 있음 | 체크리스트 업데이트만 권장 |
| 전세·월세·매매 비교 | 제외 | `rent-jeonse-buy-cashflow-opportunity-cost`가 이미 있음 | 전세 보증금 리스크 등 별도 깊은 주제는 가능 |
| 서울/경기/인천 리스크 예산 | 제외 | `seoul-gyeonggi-incheon-risk-budget-framework`가 이미 있음 | 동일 예산 가격대 비교로 각도 변경 |
| 단순 Top100 랭킹 블로그 | 보류 | Top100 라우트와 SEO 랜딩이 이미 있음 | 월간/연간 데이터 리포트형이면 가능 |
| 지정학/유가/환율과 주택시장 | 제외 | `geopolitics-oil-fx-dashboard`가 이미 있음 | 거래량 감소 해석 글에서 보조 링크로 활용 |

## 12. 권장 발행 순서

1. `how-to-read-apartment-transaction-prices`
   - 이유: 대시보드 핵심 지표 전체를 설명하고, 다른 글들이 모두 링크할 수 있는 허브형 자료가 됨.
2. `apartment-transaction-volume-decline-meaning`
   - 이유: 검색 의도가 선명하고 기존 거시 글을 보완하면서 중복은 낮음.
3. `large-apartment-complex-households-price-stability`
   - 이유: 세대수 필터와 직접 연결되는 신규 각도. 대단지 검색 수요도 현실적.
4. `find-apartments-within-budget-dsr-ltv-dashboard`
   - 이유: 기존 예산/DSR 글들과 겹치지만 전환 효율이 높음. 아주 실무형으로 좁혀야 함.
5. `seoul-gyeonggi-incheon-apartment-price-band-comparison`
   - 이유: 지역 필터와 Top100 랜딩으로 내부 유입을 늘리기 좋음. 기존 리스크 예산 글과 중복되지 않게 “같은 예산”으로 제한.

## 13. 내부 링크 설계 제안

신규 글 1번을 허브형 자료로 만들면 아래처럼 연결하면 좋습니다.

- 글 1: 실거래가 보는 법
  - 링크 out: `/market/real-estate`, `/market/real-estate/seoul-apartment-top100`, `/market/real-estate/gyeonggi-apartment-top100`, `/market/real-estate/incheon-apartment-top100`, `/tools/dsr-ltv-calculator`
  - 링크 in 후보: `apt-dashboard-home-goal-roadmap`, `rates-discount-mortgage-demand-apt-prices`, `geopolitics-oil-fx-dashboard`, Top100 SEO 랜딩
- 글 2: 거래량 감소 해석
  - 링크 out: `/market/real-estate`, `rates-discount-mortgage-demand-apt-prices`, `geopolitics-oil-fx-dashboard`
  - 링크 in 후보: 거시/금리 관련 글
- 글 3: 세대수/대단지 안정성
  - 링크 out: `/market/real-estate` 세대수 필터 안내, 지역 Top100
  - 링크 in 후보: `/market/real-estate` 대시보드 내 가이드 카드, Top100 랜딩
- 글 4: 내 예산 탐색 순서
  - 링크 out: `/tools/dsr-ltv-calculator`, `/market/real-estate`, 기존 DSR/LTV 5개 글
  - 링크 in 후보: DSR/LTV 계산기, 도구 허브, 현금/금리/리스크 글
- 글 5: 수도권 가격대 비교
  - 링크 out: `/market/real-estate`, 서울/경기/인천 Top100 가이드, `cash-100m-200m-300m-apartment-budget`
  - 링크 in 후보: 시장정보 허브, 지역 Top100 페이지

## 14. 주의할 표현

- “집값이 오른다/내린다”처럼 결과를 예측하거나 보장하는 표현은 피해야 합니다.
- DSR/LTV 계산기는 사용자 입력 기준 추정이며 실제 금융기관 심사와 다를 수 있다고 명시해야 합니다.
- 거래량 감소는 하락 확정 신호가 아니라 유동성, 관망, 표본수, 가격 신뢰도 변화로 설명하는 편이 안전합니다.
- 평균가/중앙값/평단가는 층, 평형, 동, 시점, 리모델링/신축 여부 차이 때문에 단독 판단 지표가 아니라고 안내해야 합니다.
- Top100은 총액 기준 착시가 생길 수 있어 평단가와 거래량을 반드시 함께 보게 해야 합니다.

## 15. 검증 기록

실행한 주요 확인:

- `rg --files content/posts`
  - `personalFinance`, `investingInfo`, `economicInfo`의 ko/en 포스트 파일 목록 확인.
- `rg -n -i "부동산 ... loan" content/posts pages lib _components next-sitemap.config.js public/sitemap-0.xml`
  - 부동산/대출/아파트/실거래 관련 넓은 키워드 검색.
- `rg -n -e "^title:" -e "^description:" -e "^slug:" -e "^category:" -e "^postCategory:" -e "^tags:" -e "^tool:" ...`
  - 핵심 관련 포스트의 frontmatter 확인.
- `rg -n -e "/market/real-estate" -e "/tools/dsr-ltv-calculator" ...`
  - 기존 포스트 내부 링크 확인.
- `rg -n -e "real-estate" -e "DSR" -e "LTV" ... pages/tools pages/market _components`
  - 대시보드/계산기/도구 허브 연결 구조 확인.
- `rg -n "." lib/realEstateSeoLandingPages.js`
  - 서울/경기/인천 Top100 SEO 랜딩의 대표가격/평단가/거래량 가이드 확인.
- `rg -n -e "real-estate" -e "apt" -e "top100" next-sitemap.config.js public/sitemap-0.xml`
  - sitemap 포함/제외 구조 확인.

누락 가능성:

- `components/` 폴더는 첫 검색 시 존재하지 않는 경로로 확인되었습니다. 실제 연결 컴포넌트는 `_components/`에서 확인했습니다.
- `pages/api/re/*`는 데이터 API로 키워드 검색에 일부 잡히지만, 이번 작업은 콘텐츠 갭과 내부 링크 구조 분석이므로 상세 SQL/API 로직 검토는 깊게 하지 않았습니다.
- 실제 네이버/Google 검색량은 외부 키워드 도구를 사용하지 않았습니다. 위 키워드는 로컬 콘텐츠 구조와 현실적인 검색 문구 기반의 후보입니다.

