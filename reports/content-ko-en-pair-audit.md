# Finmap KO/EN Content Pair Audit

- 작성일: 2026-06-19
- 목적: 기존 KO/EN 포스팅을 전수 감사하여 KO=Naver, EN=GSC+Bing 운영 체계에 맞게 콘텐츠 관계를 재분류한다.
- 범위: `content/posts/**/ko/*.md`, `content/posts/**/en/*.md`, `pages/posts/[category]/[slug].js`, `_components/SeoHead.js`, sitemap 생성 스크립트 읽기 전용 확인
- 제한: 이번 작업에서는 새 글 생성, 기존 글 수정, canonical/hreflang 수정, noindex 적용, URL 삭제를 하지 않는다.

## 감사 방법

- `category + slug` 기준으로 KO/EN 파일을 매칭했다.
- 각 글의 frontmatter `title`, `seoTitle`, `description`, 본문 headings, FAQ 단서, 내부링크, `tools`/calculator CTA 단서를 확인했다.
- `pages/posts/[category]/[slug].js`는 같은 slug의 반대 언어 글이 있으면 `otherLangAvailable`로 pair를 인식한다.
- `_components/SeoHead.js`는 URL 기준으로 `ko`/`en` hreflang을 출력한다. 따라서 같은 slug라도 검색 의도가 다르면 `decouple_hreflang_review` 검토가 필요하다.
- `scripts/generate_channel_sitemaps.js`는 KO/EN sitemap을 나누지만, 콘텐츠 의도까지 판단하지는 않는다.

## 전체 요약

| 항목 | 수량 |
| --- | ---: |
| 전체 markdown post 파일 | 142 |
| `category + slug` 기준 행 | 73 |
| KO/EN same-slug pair | 69 |
| KO-only slug | 2 |
| EN-only slug | 2 |
| 즉시 수정하지 않고 검토 후보로 표시한 항목 | 73 |

## P0 우선 검토 10개

| priority | category | slug / issue | recommended type | action | reason |
| --- | --- | --- | --- | --- | --- |
| P0 | personalFinance | `how-much-per-month-for-100m` | decouple_hreflang_review | review_hreflang_pair | KO는 "1억 모으기", EN은 "$100,000 target"으로 currency/search intent가 다르다. 같은 slug pair 유지가 맞는지 우선 검토. |
| P0 | personalFinance | `is-dca-better-in-bear-market` / `is-dca-better-in-a-bear-market` | decouple_hreflang_review | review_hreflang_pair | 같은 주제인데 KO/EN slug가 달라 현재 pair가 끊겨 있다. URL 변경 없이 운영상 pair 정책 검토 필요. |
| P0 | personalFinance | `monthly-investment-for-100m-table` | needs_rewrite | rewrite_en | KO는 네이버형 1억원 표, EN은 KRW 100M 표라 영어권 검색 의도가 좁다. EN은 target portfolio calculator intent로 재기획 필요. |
| P0 | personalFinance | `dsr-40-income-loan-limit-table` | adapted_pair | rewrite_en | KO는 연봉별 표가 강하지만 EN은 Korea DSR rule explainer로 제도 설명과 계산 의도를 강화해야 한다. |
| P0 | personalFinance | `personal-start-5steps` | needs_rewrite | rewrite_en | EN 제목/구조가 generic salary guide라 GSC/Bing 경쟁력이 약하다. calculator/internal link 중심 재작성 필요. |
| P0 | personalFinance | `what-is-cagr` | needs_rewrite | rewrite_en | evergreen true_pair 후보지만 EN이 짧고 일반적이다. CAGR calculator / ETF comparison intent로 보강 필요. |
| P0 | personalFinance | `annual-vs-monthly-compound` | needs_rewrite | rewrite_en | EN calculator intent와 표/FAQ 깊이가 약하다. compound calculator 유입형으로 재작성 필요. |
| P0 | economicInfo | `indicator-basics` | needs_rewrite | rewrite_en | EN이 넓은 macro explainer라 검색 의도가 분산된다. market-signal guide로 재기획 필요. |
| P0 | economicInfo | `inflation-rate-basics` | needs_rewrite | rewrite_en | `inflation-basics`와 겹치며 EN intent가 generic하다. 중복/역할 분리 검토 필요. |
| P0 | investingInfo | `dxy-dollar-index-basics` | needs_rewrite | rewrite_en | DXY 기초 설명은 경쟁이 강하다. USD/KRW/KOSPI 연결형 Korea market guide로 재작성 필요. |

## 전체 분류표

| category | slug | ko title | en title | ko exists | en exists | current relation | recommended type | reason | action | priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| economicInfo | eu-russia-gas-phaseout-price-channel | EU의 러시아 가스 축소가 에너지 가격을 흔드는 방식: 계약·저장·대체의 3요소 | Europe’s Shift Away from Russian Gas: How Contracts, Storage, and Substitution Drive Prices | yes | yes | same_slug_pair | adapted_pair | 같은 에너지 가격 뿌리지만 EN은 Europe/global energy explainer로 유지하는 편이 좋다. | keep_pair | P2 |
| economicInfo | fx-basics | 환율의 기초: 원/달러가 움직이는 진짜 이유 | Currency Basics: What Really Moves the USD/KRW Exchange Rate | yes | yes | same_slug_pair | adapted_pair | KO는 환율 기초, EN은 USD/KRW explainer로 독립 가치가 있다. | rewrite_en | P1 |
| economicInfo | geopolitics-oil-fx-dashboard | 지정학·유가·환율 충격이 서울·경기·인천 집값에 전이되는 5단 체인: 물가→금리→대출→심리→거래량 | From Geopolitics to Korea Housing: The 5-Step Transmission Chain (CPI → Rates → Mortgages → Sentiment → Volume) | yes | yes | same_slug_pair | adapted_pair | EN은 Korea housing transmission guide로 가치가 있으나 내부링크 보강 여지가 있다. | improve_internal_links | P1 |
| economicInfo | geopolitics-to-usd-liquidity-fx | 전쟁이 달러 강세로 번역되는 순간: ‘안전자산’이 아니라 ‘달러 유동성’으로 읽기 | When Geopolitics Turns Into Dollar Strength: Read It as USD Liquidity, Not Just “Fear” | yes | yes | same_slug_pair | adapted_pair | 같은 거시 전이 주제이며 EN도 USD liquidity explainer로 검색 의도가 있다. | keep_pair | P2 |
| economicInfo | gold-geopolitics-real-rates-dollar-uncertainty | 중동 리스크에서 금이 강한 이유: ‘전쟁’이 아니라 실질금리·달러·불확실성의 합 | Why Gold Can Rise in Geopolitical Stress: Real Rates + USD + Uncertainty (and When It Doesn’t) | yes | yes | same_slug_pair | adapted_pair | EN은 gold/rates/USD framework로 독립 가치가 있으나 관련 내부링크가 약하다. | improve_internal_links | P2 |
| economicInfo | hormuz-risk-oil-insurance-freight-premium | 중동 원유 수송 리스크 한 장으로 끝내기: 유가는 ‘봉쇄’보다 ‘보험료·운임 프리미엄’에 먼저 반응한다 | Middle East Oil Shipping Risk, Explained on One Page: Oil Often Reacts to Insurance and Freight Premia Before Any “Blockade” | yes | yes | same_slug_pair | adapted_pair | shipping risk/oil premium intent가 EN에서도 자연스럽다. | keep_pair | P2 |
| economicInfo | indicator-basics | 경제지표 읽는 법: GDP·실업률·PMI를 실제로 쓰는 방법 | How to Read Economic Indicators: GDP, Unemployment, PMI and Market Signals | yes | yes | same_slug_pair | needs_rewrite | EN이 너무 넓은 generic indicator guide다. Korea/market dashboard 연결 또는 별도 evergreen 재기획 필요. | rewrite_en | P0 |
| economicInfo | inflation-basics | 물가와 금리의 기본 이해: 장기 투자자가 반드시 알아야 할 핵심 구조 | Understanding Inflation and Interest Rates: The Core Framework Every Long-Term Investor Must Know | yes | yes | same_slug_pair | needs_rewrite | EN에서 `inflation-rate-basics`와 역할이 겹친다. 중복 의도 정리가 필요하다. | rewrite_en | P1 |
| economicInfo | inflation-rate-basics | 물가와 금리의 기본 이해: 왜 금리가 오르면 시장이 흔들릴까? | Inflation and Interest Rates Explained: Why Rate Changes Shake Markets | yes | yes | same_slug_pair | needs_rewrite | generic inflation/rates 키워드는 경쟁이 강하고 기존 inflation 글과 중복된다. | rewrite_en | P0 |
| economicInfo | interest-rate-basics | 금리의 구조와 기준금리: 예·적금, 대출, 채권 금리까지 한 번에 이해 | How Interest Rates Work: From Policy Rates to Deposits, Loans, and Bonds | yes | yes | same_slug_pair | true_pair | 금리 구조 evergreen explainer로 KO/EN 모두 유지 가치가 있다. | keep_pair | P2 |
| economicInfo | oil-shock-to-usdkrw-korea-transmission | 유가 급등이 원/달러에 미치는 영향: 한국식 전파 경로(무역수지·물가·수급)로 읽기 | Oil Shocks and USD/KRW: How Trade Balance, Import Inflation, and Flows Drive Korea’s FX | yes | yes | same_slug_pair | adapted_pair | EN은 Korea FX/oil shock guide로 독립 검색 의도가 있다. | keep_pair | P1 |
| economicInfo | policy-rate-cut-market-rates | “금리 인하”가 와도 안 오를 수 있다: 시장금리 vs 정책금리 분리해서 읽기 | A Rate Cut Doesn’t Guarantee Lower Borrowing Costs: How to Read Policy Rates vs Market Rates | yes | yes | same_slug_pair | adapted_pair | 같은 정책금리/시장금리 뿌리이며 EN도 explainer intent가 있다. | keep_pair | P2 |
| economicInfo | real-rates-and-breakevens | 실질금리(Real Rate)와 기대인플레이션(Breakeven): 자산가격의 ‘진짜 온도계’ | Real Rates & Breakeven Inflation: The Asset-Pricing Thermometer Most Investors Ignore | yes | yes | same_slug_pair | true_pair | real rates/breakeven은 EN evergreen macro explainer로 유지 가능하다. | keep_pair | P2 |
| economicInfo | tariffs-growth-margins-fx-package-shock | 관세는 ‘물가’만의 문제가 아니다: 성장·마진·환율을 동시에 흔드는 패키지 충격 | Tariffs as a Package Shock: Growth, Margins, FX, and Inflation Move Together | yes | yes | same_slug_pair | adapted_pair | EN도 tariff package shock explainer로 독립 가치가 있다. | keep_pair | P2 |
| economicInfo | war-risk-oil-supply-insurance-shipping | 전쟁 뉴스가 유가를 움직이는 3단계: 공급·보험·운송이 만드는 ‘리스크 프리미엄’ | Why War Headlines Move Oil in Three Steps: Supply, Insurance, and Shipping Risk Premiums | yes | yes | same_slug_pair | adapted_pair | oil risk premium explainer로 EN 가치가 있다. | keep_pair | P2 |
| economicInfo | war-theme-investing-price-chain-not-winners | 전쟁 테마의 함정: ‘수혜주’가 아니라 ‘가격 사슬(원가·운임·환율)’로 읽어야 한다 | The War-Theme Trap: Don’t Chase “Winners”—Read the Price Chain (Costs, Freight, FX, Demand) | yes | yes | same_slug_pair | adapted_pair | EN은 theme investing caution/price chain으로 운영 가능하다. | keep_pair | P2 |
| economicInfo | yield-curve-2s10s-3m10y-recession-reading | 수익률곡선(2y~10y, 3m~10y)은 왜 다르게 말하나: 침체 신호 해석법 | Why 2s10s and 3m10y Disagree: A Practical Recession-Signal Reading Guide | yes | yes | same_slug_pair | true_pair | yield curve explainer는 EN evergreen intent가 있다. | keep_pair | P2 |
| investingInfo | bond-etf-duration-drives-returns | 채권 ETF 완전정복: 듀레이션이 수익률을 결정한다 (TNX로 읽는 실전 프레임) | Bond ETF Mastery: Duration Drives Returns (and Why TNX Sets the Tempo) | yes | yes | same_slug_pair | true_pair | bond ETF duration/TNX 주제는 EN evergreen finance intent가 있다. | keep_pair | P2 |
| investingInfo | cagr-7percent-reality-check | ‘연 7% 복리’는 실제로 무엇을 의미할까? CAGR로 현실 체크하기 | What Does a “7% Annual Return” Really Mean? A Reality Check Using CAGR | yes | yes | same_slug_pair | true_pair | CAGR 기반 기대수익률 설명은 calculator/explainer pair로 유지 가능하다. | keep_pair | P1 |
| investingInfo | dca-consistency-7-fail-patterns | 적립식(DCA)은 ‘수익률’이 아니라 ‘지속성’ 게임: 실패하는 DCA 패턴 7가지 | DCA Is a Consistency Game, Not a Return Hack: 7 Ways People Fail (and How to Fix Them) | yes | yes | same_slug_pair | true_pair | DCA behavior evergreen으로 EN 검색 의도가 있다. | keep_pair | P1 |
| investingInfo | diagnose-investing-skill-with-cagr | CAGR로 투자 실력 진단하기: MDD·변동성·샤프비율과 함께 보는 현실적인 평가법 | Diagnosing Your Investing Skill Using CAGR: Understanding MDD, Volatility, and Sharpe Ratio | yes | yes | same_slug_pair | needs_rewrite | EN이 broad performance metrics guide다. CAGR calculator/portfolio comparison intent 보강 필요. | rewrite_en | P1 |
| investingInfo | dxy-dollar-index-basics | DXY(달러인덱스)란 무엇인가? 투자자가 꼭 알아야 할 의미 정리 | What Is DXY (Dollar Index)? A Beginner-Friendly Explanation for Investors | yes | yes | same_slug_pair | needs_rewrite | generic DXY 설명은 경쟁이 강하다. USD/KRW/KOSPI 연결형으로 재작성 필요. | rewrite_en | P0 |
| investingInfo | dxy-market-impact | DXY가 변화하면 시장은 어떻게 움직일까? 미국 증시·환율·코스피까지 | How DXY Moves the Market: Impact on U.S. Stocks, USD/KRW, and KOSPI | yes | yes | same_slug_pair | adapted_pair | EN은 DXY to USD/KRW/KOSPI guide로 운영 가치가 있다. | keep_pair | P1 |
| investingInfo | etf-impact-of-tnx | 미국 10년물 금리(TNX)는 왜 ETF를 뒤흔드는가? 성장·가치·신흥국 ETF까지 모두 설명하는 금리 로직 | How U.S. 10Y Yield (TNX) Affects ETFs: Growth, Value, EM, and Korea | yes | yes | same_slug_pair | needs_rewrite | 좋은 주제지만 EN은 ETF/TNX/Korea query를 더 명확히 쪼개야 한다. | rewrite_en | P1 |
| investingInfo | fx-hedge-vs-fx-exposure-korea-3-conditions | 환헤지 vs 환노출: 국내 개인 투자자(원화 기준)에게 ‘정답’이 달라지는 3가지 조건 | FX-Hedged vs Unhedged Korea Exposure: 3 Conditions That Change the Right Answer | yes | yes | same_slug_pair | adapted_pair | EN은 Korea exposure/FX hedge guide로 독립 가치가 높다. | keep_pair | P1 |
| investingInfo | indicator-marketinfo | 코스피에 가장 큰 영향을 끼치는 글로벌 시장 환경 총정리 | Global Market Forces That Influence the KOSPI: A Complete Overview | yes | yes | same_slug_pair | adapted_pair | EN은 KOSPI market guide로 가능하지만 내부링크와 market page 연결 강화 필요. | improve_internal_links | P1 |
| investingInfo | korea-etf-deep-dive-tnx | 왜 한국 ETF는 TNX(미국 10년물 금리)에 가장 민감한가: 구조·환율·유동성 심화 분석 | Why Korea ETFs Are the Most Sensitive to TNX: A Deep Structural Analysis | yes | yes | same_slug_pair | adapted_pair | EN-only 가치가 강한 Korea ETF guide다. 같은 slug pair는 유지하되 EN intent 우선. | keep_pair | P1 |
| investingInfo | modern-6040-risk-budget | 요즘형 60/40: 주식·채권·현금·금(또는 원자재)로 ‘리스크 예산’ 짜기 | The Modern 60/40: Build a Risk Budget with Stocks, Bonds, Cash, and Gold (or Commodities) | yes | yes | same_slug_pair | true_pair | asset allocation evergreen pair로 유지 가능하다. | keep_pair | P2 |
| investingInfo | rates-discount-mortgage-demand-apt-prices | 금리(할인율)는 어떻게 서울·경기·인천 아파트 가격을 흔드는가: 대출금리·수요·심리 3채널로 분해하기 | How Rates (Discount Rate) Transmit Into Korea Apartment Prices: Mortgage Rates, Demand, and Sentiment Channels | yes | yes | same_slug_pair | adapted_pair | EN은 Korea apartment/rates guide로 독립 가치가 있다. | keep_pair | P2 |
| investingInfo | real-estate-role-in-portfolio-risk-budget | 가계 자산배분에서 부동산은 ‘비중’이 아니라 ‘역할’이다: 현대형 60/40(리스크 예산)로 다시 설계하기 | Real Estate Is a Role, Not a Weight: Korea’s Modern 60/40 Risk Budget (with the Apartment Dashboard) | yes | yes | same_slug_pair | adapted_pair | EN은 Korea real estate portfolio guide로 유지 가능하다. | keep_pair | P2 |
| investingInfo | seoul-gyeonggi-incheon-risk-budget-framework | 서울·경기·인천을 ‘지역 선택’이 아니라 ‘리스크 예산’으로 읽는 법: 변동성·유동성·회복탄력 3축 | Seoul vs Gyeonggi vs Incheon as a Risk-Budget Problem: Volatility, Liquidity, Recovery Resilience | yes | yes | same_slug_pair | adapted_pair | EN은 regional Korea housing guide로 가치가 있다. | keep_pair | P2 |
| investingInfo | sp500-impact-on-korea-kospi | 미국 증시(S&P500)가 한국 경제·코스피에 미치는 영향: 환율·금리·외국인 수급의 연결고리 | How the S&P 500 Moves Korea’s Economy and KOSPI: The FX–Rates–Foreign Flow Chain | yes | yes | same_slug_pair | adapted_pair | EN은 Korea overlay market guide로 운영 가능하다. | keep_pair | P1 |
| investingInfo | tnx-basics | TNX(미국 10년물 국채금리) 완전 이해: 주식·환율·채권을 움직이는 ‘기준 금리’ | TNX Explained: Why the 10-Year Treasury Yield Drives Markets | yes | yes | same_slug_pair | true_pair | TNX explainer evergreen pair로 유지 가능하다. | keep_pair | P1 |
| investingInfo | us10y-impact-on-korea-and-stock-market | 미국 10년물 국채금리(TNX)가 미국·한국 시장에 미치는 실제 영향 | How the U.S. 10-Year Treasury Yield (TNX) Affects the U.S. Economy, Korea, and Global Stock Markets | yes | yes | same_slug_pair | needs_rewrite | `tnx-basics`와 겹친다. EN은 Korea/KOSPI transmission intent로 분리 필요. | rewrite_en | P1 |
| investingInfo | usd-krw-exchange-rate-and-kospi | 원달러 환율이 한국 경제와 코스피에 미치는 영향: 외국인 수급·수출·물가·금리로 읽는 법 | USD/KRW Exchange Rate: What It Means for Korea’s Economy and the KOSPI | yes | yes | same_slug_pair | adapted_pair | EN에서 Korea FX/KOSPI guide로 핵심 가치가 높다. | keep_pair | P1 |
| investingInfo | usd-krw-weak-won-sector-map-kospi | 환율 상승 수혜주·피해주: 원화 약세 때 코스피 업종 정리 | Who Wins and Loses When the KRW Weakens? A Sector Map for the KOSPI | yes | yes | same_slug_pair | adapted_pair | EN은 weak KRW sector map으로 독립 검색 의도가 있다. | keep_pair | P1 |
| investingInfo | why-check-cagr-etf | ETF·펀드 선택 시 CAGR을 반드시 확인해야 하는 이유 | Why You Must Check the CAGR When Choosing ETFs and Funds | yes | yes | same_slug_pair | needs_rewrite | calculator/ETF comparison intent는 좋지만 EN 제목이 generic하다. | rewrite_en | P1 |
| investingInfo | wti-impact-on-korea-kospi | WTI 유가가 한국 경제·코스피에 미치는 영향: 물가·환율·금리·기업이익으로 이어지는 5단 연결 | How WTI Oil Shapes Korea’s Economy and KOSPI: Inflation, FX, Rates, and Earnings in One Chain | yes | yes | same_slug_pair | adapted_pair | EN은 Korea oil/KOSPI guide로 가치가 있다. | keep_pair | P1 |
| personalFinance | annual-vs-monthly-compound | 연복리 vs 월복리: 목표 도달 기간은 얼마나 달라질까? | Annual vs Monthly Compounding: How Much Faster Can You Reach Your Goal? | yes | yes | same_slug_pair | needs_rewrite | true_pair 후보지만 EN calculator intent와 표/FAQ 보강이 필요하다. | rewrite_en | P0 |
| personalFinance | apartment-transaction-volume-decline-meaning | 아파트 거래량 감소는 집값 하락 신호일까? 실거래 데이터로 보는 4가지 해석 | What Falling Apartment Transaction Volume Means in Korea: 4 Ways to Read the Signal | yes | yes | same_slug_pair | adapted_pair | EN은 Korean apartment transaction volume guide로 독립 가치가 있다. | keep_pair | P1 |
| personalFinance | apt-dashboard-home-goal-roadmap | 서울·경기·인천 아파트 실거래 대시보드로 ‘내 집 마련 목표’를 숫자로 바꾸는 3단계 로드맵 | A 3-Step Home-Buying Roadmap Using Real Estate Transaction Data: Turn Anxiety Into Rules (Not Predictions) | yes | yes | same_slug_pair | adapted_pair | EN은 Korea real estate dashboard guide로 운영 가능하다. | keep_pair | P1 |
| personalFinance | cash-100m-200m-300m-apartment-budget | 보유현금 1억·2억·3억이면 어느 가격대 아파트까지 가능할까? | Cash KRW 100M, 200M, 300M: What Apartment Budget Can It Support in Korea? | yes | yes | same_slug_pair | adapted_pair | KO는 네이버형 금액표, EN은 Korean housing affordability guide로 재기획 유지. | keep_pair | P1 |
| personalFinance | compound-return-3-5-7-10-table | 연 3%·5%·7%·10% 복리 차이, 10년·20년·30년 뒤 얼마일까? | Compound Growth at 3%, 5%, 7%, and 10%: 10-, 20-, and 30-Year Tables | yes | yes | same_slug_pair | true_pair | compound table/calculator evergreen으로 pair 유지 가능하다. | keep_pair | P1 |
| personalFinance | dca-fx-volatility-decomposition | 해외자산 DCA에서 ‘수익률 변동’과 ‘환율 변동’을 분리해 읽는 법: 한국 사용자용 운영 규칙(불안·중단 방지) | DCA Returns Are “Asset Return + Currency Return”: A Volatility Decomposition Framework That Reduces Panic and Rule-Drift | yes | yes | same_slug_pair | adapted_pair | KO는 원화 투자자, EN은 global DCA/FX decomposition으로 다르게 운영해야 한다. | keep_pair | P1 |
| personalFinance | dca-step-up-ruleset | DCA의 핵심은 ‘월 납입액 설계’다: 증액(스텝업)·감액·일시중단 조건을 운영규칙으로 만드는 법 | Step-Up DCA: A Rulebook for Raising (or Pausing) Contributions Without Breaking Your Plan | yes | yes | same_slug_pair | true_pair | DCA contribution rule evergreen으로 유지 가능하다. | keep_pair | P1 |
| personalFinance | dca-vs-lump-sum-when-results-differ | 적립식 투자와 일괄투자, 언제 결과가 달라질까? | DCA vs Lump Sum: When Do the Results Differ? | yes | yes | same_slug_pair | true_pair | DCA vs lump sum calculator intent로 pair 유지 가능하다. | improve_calculator_cta | P1 |
| personalFinance | dca-vs-lumpsum-decision-rules | DCA vs 일시금투자: 기대수익이 아니라 ‘후회·중단·변동성(실행 리스크)’로 결정하는 3단계 규칙 | DCA vs Lump Sum Without the Debate: A 3-Step Rule Based on Behavior Risk, Cash Buffers, and Time Horizon | yes | yes | same_slug_pair | true_pair | behavior-risk angle이 EN에서도 자연스럽다. | keep_pair | P1 |
| personalFinance | dsr-40-income-loan-limit-table | DSR 40% 연봉별 대출 가능액 표 | DSR 40% by Income: How Much Korean Mortgage Principal Can It Support? | yes | yes | same_slug_pair | adapted_pair | KO는 연봉별 표, EN은 Korea DSR rule explainer로 강화해야 한다. | rewrite_en | P0 |
| personalFinance | dsr-pass-ltv-cash-bottleneck | DSR은 통과했는데 왜 집을 못 살까? LTV·현금·부대비용 병목 이해하기 | Passing DSR but Still Blocked? Understanding LTV, Cash, and Cost Bottlenecks | yes | yes | same_slug_pair | adapted_pair | EN은 Korean mortgage bottleneck guide로 가치가 있다. | keep_pair | P1 |
| personalFinance | emergency-fund-by-risk | 비상금은 ‘몇 개월’이 아니라 ‘리스크’로 정한다: 직장·가족·대출 기준표로 끝내기 | Your Emergency Fund Isn’t a ‘Months’ Number — It’s a Risk Number (Job, Family, Debt) | yes | yes | same_slug_pair | true_pair | emergency fund risk framework는 EN evergreen intent가 있다. | keep_pair | P2 |
| personalFinance | fire-3-numbers-spending-horizon-withdrawal | 은퇴자산 목표는 ‘3개 숫자’로 결정된다: 연지출·은퇴기간·인출률(4%룰 오해까지) + FIRE 툴로 10분 계산 | FIRE Is Just 3 Numbers: Annual Spending, Retirement Horizon, and Withdrawal Rate (Then Validate in 10 Minutes) | yes | yes | same_slug_pair | true_pair | FIRE calculator intent로 pair 유지 가능하다. | keep_pair | P1 |
| personalFinance | fire-assumption-errors-7-fixes | FIRE 계산이 틀리는 가장 흔한 이유 7가지: 수익률·인플레·세금·현금흐름 가정을 현실로 내리는 법 + 툴로 민감도 체크 | The 7 Most Common FIRE Modeling Mistakes: Fix Your Return, Inflation, and Tax Assumptions (Then Run Sensitivity Checks) | yes | yes | same_slug_pair | true_pair | FIRE model assumption evergreen으로 유지 가능하다. | keep_pair | P1 |
| personalFinance | fire-sequence-risk-first-5-years | 은퇴 직전·직후 5년이 FIRE를 결정한다: ‘순서 리스크’(초반 급락)와 인출 전략을 정리 + 툴로 스트레스 테스트 | The First 5 Years of Retirement Decide FIRE: Sequence-of-Returns Risk, Withdrawal Rules, and a 10-Minute Stress Test | yes | yes | same_slug_pair | true_pair | sequence risk/FIRE calculator intent가 명확하다. | keep_pair | P1 |
| personalFinance | fire-spending-buckets-essential-choice-insurance | 은퇴 지출은 ‘필수·선택·보험(리스크 비용)’으로 나눠야 흔들리지 않는다: 생활비 설계 + FIRE 시뮬레이터로 안전마진 잡기 | Retirement spending should be split into Essential / Lifestyle / Insurance (risk costs): build buffers and validate with the FIRE calculator | yes | yes | same_slug_pair | true_pair | 주제는 좋지만 EN title/H1 스타일은 개선 여지가 있다. | rewrite_en | P1 |
| personalFinance | goal-amount-fast-strategy | 목표 금액을 빠르게 모으는 법: 원금·수익률·기간의 균형 | How to Reach Your Target Amount Faster: Balancing Principal, Return, and Time | yes | yes | same_slug_pair | needs_rewrite | EN이 generic하다. goal simulator/monthly contribution intent로 재작성 필요. | rewrite_en | P1 |
| personalFinance | high-rate-debt-vs-invest-threshold-rule | 고금리 시대: 빚부터 갚을까, 투자부터 할까? (이자율 ‘임계값’ 룰) | High-Rate Era: Should You Pay Down Debt or Invest First? (The Interest-Rate Threshold Rule) | yes | yes | same_slug_pair | true_pair | debt vs invest evergreen으로 pair 유지 가능하다. | keep_pair | P2 |
| personalFinance | how-much-monthly-invest-for-100m | 1억원 만들려면 매달 얼마를 투자해야 할까? | - | yes | no | ko_only_slug | ko_only | 네이버형 1억원 목표 질문으로 KO 수요가 강하지만 EN에는 같은 slug 글이 없다. | keep_ko_only | P0 |
| personalFinance | how-much-per-month-for-100m | 1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금 | How Much Should You Invest Monthly to Reach $100,000? 5-, 10-, and 15-Year Plans | yes | yes | same_slug_pair | decouple_hreflang_review | KO는 KRW 1억, EN은 USD 100k로 검색 의도와 금액 단위가 다르다. | review_hreflang_pair | P0 |
| personalFinance | how-much-to-invest-monthly-for-target-portfolio | - | How Much Should You Invest Monthly to Reach a Target Portfolio? | no | yes | en_only_slug | en_only | EN 독립 calculator intent가 있다. KO 번역을 만들기보다 EN-only로 유지 가능하다. | create_new_en_independent | P1 |
| personalFinance | how-to-read-apartment-transaction-prices | 아파트 실거래가 보는 법: 평균가·중앙값·평단가·거래량을 함께 읽어야 하는 이유 | How to Read Korean Apartment Transaction Prices: Median, Average, Unit Price, and Volume | yes | yes | same_slug_pair | adapted_pair | EN은 Korean apartment data guide로 독립 검색 가치가 있다. | keep_pair | P1 |
| personalFinance | inflation-household-survival-strategy | 물가 상승 시대의 가계 생존전략: 생활비/고정비 줄이기, 현금흐름 관리(가계부·예산·비상금) | Household Survival in an Inflation Era: Cut Fixed Costs, Control Spending, and Protect Cash Flow | yes | yes | same_slug_pair | true_pair | household inflation budgeting evergreen으로 유지 가능하다. | keep_pair | P2 |
| personalFinance | interest-rate-1p-loan-limit-impact | 금리 1%p 오르면 내 주담대 한도는 얼마나 줄어들까? | How Much Can a 1pp Rate Increase Reduce Korean Mortgage Capacity? | yes | yes | same_slug_pair | adapted_pair | EN은 Korean mortgage capacity explainer로 가치가 있다. | keep_pair | P1 |
| personalFinance | is-dca-better-in-a-bear-market | - | Is Dollar-Cost Averaging Better in a Bear Market? | no | yes | en_only_slug | decouple_hreflang_review | 같은 주제의 KO 글이 `is-dca-better-in-bear-market`로 존재해 slug mismatch가 있다. | review_hreflang_pair | P0 |
| personalFinance | is-dca-better-in-bear-market | 하락장에서 적립식 투자가 유리하다는 말은 진짜일까? | - | yes | no | ko_only_slug | decouple_hreflang_review | 같은 주제의 EN 글이 `is-dca-better-in-a-bear-market`로 존재해 pair가 끊겼다. | review_hreflang_pair | P0 |
| personalFinance | large-apartment-complex-households-price-stability | 세대수 많은 대단지 아파트가 더 안정적일까? 거래량·평단가·가격분포로 확인하는 법 | Are Large Apartment Complexes More Stable? Reading Households, Volume, and Unit Prices in Korea | yes | yes | same_slug_pair | adapted_pair | EN은 Korea apartment complex data guide로 유지 가능하다. | keep_pair | P1 |
| personalFinance | monthly-dca-10-year-result | 월 50만원 적립식 투자, 10년 후 얼마가 될까? | What Happens If You Invest $500 a Month for 10 Years? | yes | yes | same_slug_pair | true_pair | currency는 다르지만 DCA calculator intent가 명확해 pair 유지 가능하다. | keep_pair | P1 |
| personalFinance | monthly-investment-for-100m-table | 1억 만들려면 월 얼마씩 투자해야 할까? 기간·수익률별 월 투자금 표 | How Much to Invest Monthly to Reach KRW 100 Million? A Timeline and Return Table | yes | yes | same_slug_pair | needs_rewrite | EN의 KRW 100M intent는 좁다. target portfolio/monthly investment calculator로 재작성 검토. | rewrite_en | P0 |
| personalFinance | mortgage-risk-checklist-dsr-variable | 아파트 매수 전 대출 리스크 체크리스트: DSR, LTV, 금리, 비상금 | Mortgage Risk Checklist Before Buying a Korean Apartment: DSR, LTV, Rates, Cash Buffer | yes | yes | same_slug_pair | adapted_pair | EN은 Korean apartment mortgage checklist로 가치가 있다. | keep_pair | P1 |
| personalFinance | personal-finance-3pillars | 가계 재무 3대장: 예산·비상금·장기투자를 먼저 세팅하라 | The Three Pillars of Personal Finance: Budgeting, Emergency Funds, and Long-Term Investing (A Practical Setup Guide) | yes | yes | same_slug_pair | true_pair | general evergreen이지만 EN도 cashflow setup guide로 유지 가능하다. | keep_pair | P2 |
| personalFinance | personal-start-5steps | 사회초년생을 위한 월급 관리 5단계 가이드 | A 5-Step Salary Management Guide for Young Professionals | yes | yes | same_slug_pair | needs_rewrite | EN은 generic young professional guide라 차별성이 약하다. | rewrite_en | P0 |
| personalFinance | rent-jeonse-buy-cashflow-opportunity-cost | 전세·월세·매매, 무엇이 ‘더 싸다’가 아니라 무엇이 ‘내게 더 안전하다’인가: 현금흐름·기회비용·리스크 3표로 끝내기 | Rent vs Jeonse vs Buy: Not “Cheaper,” but “Safer” — Compare Cash Flow, Opportunity Cost, and Risk Triggers | yes | yes | same_slug_pair | adapted_pair | EN은 Jeonse/Korea housing explainer로 독립 가치가 높다. | keep_pair | P1 |
| personalFinance | simple-vs-compound | 단리 vs 복리 — 초보 투자자가 반드시 알아야 할 최고의 금융 공식 | Simple vs. Compound Interest — The Most Important Finance Principle for Beginners | yes | yes | same_slug_pair | true_pair | compound evergreen pair로 유지 가능하나 EN 내부링크/CTA 보강 여지가 있다. | improve_internal_links | P1 |
| personalFinance | what-is-cagr | CAGR이란 무엇인가? 단순 수익률과의 차이 이해하기 | What Is CAGR? Understanding the Difference From Simple Returns | yes | yes | same_slug_pair | needs_rewrite | CAGR true_pair 후보지만 EN은 calculator/ETF comparison intent가 약하다. | rewrite_en | P0 |

## 분류별 운영 메모

- `true_pair`: 현재 hreflang pair 유지 가능. 다만 EN이 짧거나 CTA가 약하면 `improve_calculator_cta` 또는 `improve_internal_links`를 별도 작업으로 처리한다.
- `adapted_pair`: 같은 slug를 유지하더라도 KO와 EN의 제목, 도입부, 예시, FAQ를 다르게 운영해야 한다. 특히 Korea market, Korean housing, USD/KRW, DSR/LTV는 EN에서 "Korea guide" 의도를 선명하게 둔다.
- `ko_only`: 네이버 검색어에 맞춘 금액표/생활형 질문은 EN 번역을 만들지 않아도 된다.
- `en_only`: Google/Bing에서 독립 가치가 있는 calculator/explainer/Korea market guide는 KO 대응 글 없이도 운영할 수 있다.
- `needs_rewrite`: 기존 EN을 noindex하거나 삭제하지 않는다. 우선순위에 따라 title/H1/intro/FAQ/table/internal links를 영어권 검색 의도에 맞게 다시 쓴다.
- `decouple_hreflang_review`: 이번 작업에서는 수정하지 않는다. 추후 실제 수정 시에는 URL 변경, canonical, sitemap, hreflang 영향을 별도 검토해야 한다.

## 실행한 검증

| Command | Result |
| --- | --- |
| `rg --files content\posts` | PASS. 142개 markdown post 확인 |
| metadata extraction via Node/gray-matter | PASS. 73개 category+slug 행, 69 same-slug pair, 2 KO-only slug, 2 EN-only slug 확인 |
| `git diff --check` | PASS. whitespace error 없음. 기존 작업 파일의 LF/CRLF 경고만 출력됨 |
