# GSC Blog Audit

Generated: 2026-05-18T07:40:47.705Z

## CSV Debug

- pages csv parsed row count: 102
- pages detected headers: 인기 페이지, 클릭수, 노출, CTR, 게재 순위
- queries csv parsed row count: 95
- queries detected headers: 인기 검색어, 클릭수, 노출, CTR, 게재 순위
- normalized blog page row count: 58
- normalized tool page row count: 10
- skipped row reason count: 34

| Reason | Count |
| --- | --- |
| unsupported_path | 34 |

## Input status

- data/gsc-pages.csv: found
- data/gsc-queries.csv: found
- data/gsc-page-query.csv: missing
- Local posts scanned: 116

## Performance groups

| Group | Pages |
| --- | --- |
| GOOD_IMPRESSION_NO_CLICK | 11 |
| LOW_CTR | 8 |
| LOW_IMPRESSION | 56 |
| LOW_POSITION | 3 |

## Summary by language/type

| Group | Pages | Clicks | Impressions | CTR | Avg position |
| --- | --- | --- | --- | --- | --- |
| blog:en | 29 | 1 | 1,222 | 0.08% | 7.2 |
| blog:ko | 29 | 3 | 760 | 0.39% | 7.3 |
| tool:ko | 6 | 10 | 448 | 2.23% | 21.4 |
| tool:en | 4 | 1 | 25 | 4.00% | 11.7 |

## Summary by blog category

| Category | Pages | Clicks | Impressions | CTR | Avg position |
| --- | --- | --- | --- | --- | --- |
| en/investingInfo | 13 | 1 | 881 | 0.11% | 7.1 |
| ko/investingInfo | 11 | 2 | 442 | 0.45% | 6.8 |
| en/personalFinance | 11 | 0 | 290 | 0.00% | 8.1 |
| ko/personalFinance | 12 | 1 | 270 | 0.37% | 8.5 |
| en/economicInfo | 5 | 0 | 51 | 0.00% | 5.0 |
| ko/economicInfo | 6 | 0 | 48 | 0.00% | 5.6 |

## Improvement priority

| Priority | Group | URL | Clicks | Impressions | CTR | Position | Local flags |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 128 | LOW_CTR, GOOD_IMPRESSION_NO_CLICK | /en/posts/investingInfo/tnx-basics | 1 | 483 | 0.21% | 7.2 |  |
| 121 | LOW_CTR, GOOD_IMPRESSION_NO_CLICK | /posts/investingInfo/usd-krw-exchange-rate-and-kospi | 0 | 186 | 0.00% | 7.1 |  |
| 119 | LOW_CTR, GOOD_IMPRESSION_NO_CLICK | /en/posts/investingInfo/usd-krw-weak-won-sector-map-kospi | 0 | 139 | 0.00% | 7.2 |  |
| 118 | LOW_CTR, GOOD_IMPRESSION_NO_CLICK | /en/posts/personalFinance/annual-vs-monthly-compound | 0 | 129 | 0.00% | 8.2 |  |
| 117 | LOW_CTR, GOOD_IMPRESSION_NO_CLICK | /en/posts/investingInfo/wti-impact-on-korea-kospi | 0 | 117 | 0.00% | 6.6 |  |
| 117 | LOW_CTR, GOOD_IMPRESSION_NO_CLICK | /posts/personalFinance/how-much-per-month-for-100m | 0 | 110 | 0.00% | 7.2 |  |
| 91 | LOW_CTR, LOW_POSITION, GOOD_IMPRESSION_NO_CLICK | /tools/compound-interest | 1 | 192 | 0.52% | 40.0 |  |
| 86 | LOW_CTR | /tools/fire-calculator | 3 | 178 | 1.69% | 7.6 |  |
| 66 | GOOD_IMPRESSION_NO_CLICK | /posts/personalFinance/what-is-cagr | 0 | 98 | 0.00% | 7.6 |  |
| 64 | GOOD_IMPRESSION_NO_CLICK | /en/posts/personalFinance/what-is-cagr | 0 | 79 | 0.00% | 7.3 |  |
| 61 | GOOD_IMPRESSION_NO_CLICK | /posts/investingInfo/cagr-7percent-reality-check | 0 | 55 | 0.00% | 5.7 |  |
| 61 | GOOD_IMPRESSION_NO_CLICK | /posts/investingInfo/usd-krw-weak-won-sector-map-kospi | 0 | 53 | 0.00% | 7.0 |  |
| 60 | LOW_IMPRESSION | /posts/investingInfo/wti-impact-on-korea-kospi | 1 | 48 | 2.08% | 6.5 |  |
| 60 | LOW_IMPRESSION | /en/posts/investingInfo/usd-krw-exchange-rate-and-kospi | 0 | 46 | 0.00% | 6.6 |  |
| 57 | LOW_IMPRESSION | /en/posts/personalFinance/high-rate-debt-vs-invest-threshold-rule | 0 | 30 | 0.00% | 5.5 | title_too_long, description_too_long |
| 57 | LOW_IMPRESSION | /en/posts/investingInfo/why-check-cagr-etf | 0 | 30 | 0.00% | 6.9 | description_too_long |
| 56 | LOW_IMPRESSION | /posts/investingInfo/dca-consistency-7-fail-patterns | 0 | 28 | 0.00% | 5.8 |  |
| 55 | LOW_IMPRESSION | /posts/personalFinance/annual-vs-monthly-compound | 0 | 25 | 0.00% | 19.4 | description_too_short, thin_content |
| 54 | LOW_IMPRESSION | /posts/investingInfo/bond-etf-duration-drives-returns | 0 | 21 | 0.00% | 8.1 | description_too_long |
| 54 | LOW_IMPRESSION | /posts/investingInfo/dxy-dollar-index-basics | 0 | 20 | 0.00% | 7.3 | description_too_short, thin_content |
| 53 | LOW_IMPRESSION | /tools | 1 | 37 | 2.70% | 9.6 |  |
| 53 | LOW_IMPRESSION | /en/posts/investingInfo/indicator-marketinfo | 0 | 18 | 0.00% | 8.4 | description_too_long |
| 53 | LOW_IMPRESSION | /en/posts/personalFinance/how-much-per-month-for-100m | 0 | 18 | 0.00% | 8.7 | thin_content |
| 52 | LOW_IMPRESSION | /en/posts/personalFinance/simple-vs-compound | 0 | 15 | 0.00% | 12.3 |  |
| 50 | LOW_IMPRESSION | /posts/investingInfo/korea-etf-deep-dive-tnx | 1 | 12 | 8.33% | 7.3 | thin_content |
| 50 | LOW_IMPRESSION | /posts/economicInfo/interest-rate-basics | 0 | 12 | 0.00% | 6.7 | no_tool_link |
| 50 | LOW_IMPRESSION | /en/posts/investingInfo/cagr-7percent-reality-check | 0 | 12 | 0.00% | 9.0 | description_too_long |
| 49 | LOW_IMPRESSION | /en/posts/investingInfo/korea-etf-deep-dive-tnx | 0 | 11 | 0.00% | 5.0 | title_too_long, description_too_long |
| 48 | LOW_IMPRESSION | /en/posts/investingInfo/dxy-dollar-index-basics | 0 | 9 | 0.00% | 5.1 | title_too_long, thin_content |
| 48 | LOW_IMPRESSION | /en/posts/economicInfo/fx-basics | 0 | 9 | 0.00% | 5.3 |  |

## Pages needing title rewrite

| URL | Clicks | Impressions | CTR | Position | Current title |
| --- | --- | --- | --- | --- | --- |
| /en/posts/investingInfo/tnx-basics | 1 | 483 | 0.21% | 7.2 | 10-Year Treasury Yield (TNX): How It Moves Stocks, FX, and Korea |
| /posts/investingInfo/usd-krw-exchange-rate-and-kospi | 0 | 186 | 0.00% | 7.1 | 원달러 환율과 코스피 관계: 외국인 수급·수출주·물가 체크법 |
| /en/posts/investingInfo/usd-krw-weak-won-sector-map-kospi | 0 | 139 | 0.00% | 7.2 | Weak Korean Won: KOSPI Sector Winners, Losers, and FX Checklist |
| /en/posts/personalFinance/annual-vs-monthly-compound | 0 | 129 | 0.00% | 8.2 | Annual vs Monthly Compounding: Calculator Examples for Investors |
| /en/posts/investingInfo/wti-impact-on-korea-kospi | 0 | 117 | 0.00% | 6.6 | WTI Oil and the KOSPI: Inflation, USD/KRW, Rates and Sector Impact |
| /posts/personalFinance/how-much-per-month-for-100m | 0 | 110 | 0.00% | 7.2 | 1억 모으기 월 투자금 계산: 5년·10년·15년 수익률별 기준 |
| /tools/compound-interest | 1 | 192 | 0.52% | 40.0 |  |
| /tools/fire-calculator | 3 | 178 | 1.69% | 7.6 |  |
| /posts/personalFinance/what-is-cagr | 0 | 98 | 0.00% | 7.6 | CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시 |
| /en/posts/personalFinance/what-is-cagr | 0 | 79 | 0.00% | 7.3 | CAGR Calculator Guide: Formula, Example, and Simple Return Difference |
| /posts/investingInfo/cagr-7percent-reality-check | 0 | 55 | 0.00% | 5.7 | 연 7% 복리 현실 체크: CAGR로 목표 자산 계산하는 법 |
| /posts/investingInfo/usd-krw-weak-won-sector-map-kospi | 0 | 53 | 0.00% | 7.0 | 원화 약세 수혜주·피해주: 환율 상승 때 코스피 업종별 체크리스트 |

## Pages needing content expansion

| URL | Position | Words | Tools | Flags |
| --- | --- | --- | --- | --- |
| /tools/compound-interest | 40.0 |  |  |  |
| /posts/personalFinance/annual-vs-monthly-compound | 19.4 | 457 | goal, comp, cagr, fire, dca | description_too_short, thin_content |
| /posts/investingInfo/dxy-dollar-index-basics | 7.3 | 495 | goal, comp, cagr, fire, dca | description_too_short, thin_content |
| /en/posts/personalFinance/how-much-per-month-for-100m | 8.7 | 750 | goal, comp, cagr, fire, dca | thin_content |
| /posts/investingInfo/korea-etf-deep-dive-tnx | 7.3 | 886 | goal, comp, cagr, fire, dca | thin_content |
| /en/posts/investingInfo/dxy-dollar-index-basics | 5.1 | 496 | goal, comp, cagr, fire, dca | title_too_long, thin_content |
| /posts/economicInfo/inflation-rate-basics | 7.3 | 667 | goal, comp, cagr, fire, dca | description_too_short, thin_content |
| /en/posts/personalFinance/goal-amount-fast-strategy | 5.3 | 652 | goal, comp, cagr, fire, dca | thin_content |
| /posts/personalFinance/goal-amount-fast-strategy | 9.7 | 549 | goal, comp, cagr, fire, dca | description_too_short, thin_content |
| /posts/personalFinance/personal-start-5steps | 6.0 | 813 | goal, comp, cagr, fire, dca | thin_content |
| /posts/economicInfo/indicator-basics | 6.5 | 834 | goal, comp, cagr, fire, dca | description_too_short, thin_content |
| /en/posts/economicInfo/inflation-rate-basics | 9.0 | 743 | goal, comp, cagr, fire, dca | thin_content |
| /en/posts/personalFinance/personal-start-5steps | 4.8 | 830 | goal, comp, cagr, fire, dca | thin_content |
| /en/posts/personalFinance/rent-jeonse-buy-cashflow-opportunity-cost | 30.3 | 3433 | cagr | title_too_long, description_too_long |
| /en/tools/fire-calculator | 44.0 |  |  |  |

## Pages needing internal links

| URL | Group | Impressions | Tools | Flags |
| --- | --- | --- | --- | --- |
| /posts/investingInfo/wti-impact-on-korea-kospi | LOW_IMPRESSION | 48 | goal, comp, cagr, fire, dca |  |
| /en/posts/investingInfo/usd-krw-exchange-rate-and-kospi | LOW_IMPRESSION | 46 | goal, comp, cagr, fire, dca |  |
| /en/posts/personalFinance/high-rate-debt-vs-invest-threshold-rule | LOW_IMPRESSION | 30 | comp, goal, dca, cagr, fire | title_too_long, description_too_long |
| /en/posts/investingInfo/why-check-cagr-etf | LOW_IMPRESSION | 30 | goal, comp, cagr, fire, dca | description_too_long |
| /posts/investingInfo/dca-consistency-7-fail-patterns | LOW_IMPRESSION | 28 | dca, cagr, goal |  |
| /posts/personalFinance/annual-vs-monthly-compound | LOW_IMPRESSION | 25 | goal, comp, cagr, fire, dca | description_too_short, thin_content |
| /posts/investingInfo/bond-etf-duration-drives-returns | LOW_IMPRESSION | 21 | cagr, goal, comp, dca, fire | description_too_long |
| /posts/investingInfo/dxy-dollar-index-basics | LOW_IMPRESSION | 20 | goal, comp, cagr, fire, dca | description_too_short, thin_content |
| /tools | LOW_IMPRESSION | 37 |  |  |
| /en/posts/investingInfo/indicator-marketinfo | LOW_IMPRESSION | 18 | goal, comp, cagr, fire, dca | description_too_long |
| /en/posts/personalFinance/how-much-per-month-for-100m | LOW_IMPRESSION | 18 | goal, comp, cagr, fire, dca | thin_content |
| /en/posts/personalFinance/simple-vs-compound | LOW_IMPRESSION | 15 | goal, comp, cagr, fire, dca |  |
| /posts/investingInfo/korea-etf-deep-dive-tnx | LOW_IMPRESSION | 12 | goal, comp, cagr, fire, dca | thin_content |
| /posts/economicInfo/interest-rate-basics | LOW_IMPRESSION | 12 |  | no_tool_link |
| /en/posts/investingInfo/cagr-7percent-reality-check | LOW_IMPRESSION | 12 | goal, comp, cagr, fire, dca | description_too_long |
| /en/posts/investingInfo/korea-etf-deep-dive-tnx | LOW_IMPRESSION | 11 | goal, comp, cagr, fire, dca | title_too_long, description_too_long |
| /en/posts/investingInfo/dxy-dollar-index-basics | LOW_IMPRESSION | 9 | goal, comp, cagr, fire, dca | title_too_long, thin_content |
| /en/posts/economicInfo/fx-basics | LOW_IMPRESSION | 9 | goal, comp, cagr, fire, dca |  |
| /posts/investingInfo/why-check-cagr-etf | LOW_IMPRESSION | 9 | goal, comp, cagr, fire, dca |  |
| /tools/cagr-calculator | LOW_IMPRESSION | 16 |  |  |

## Pages needing index/canonical check

_No rows._

## Top query opportunities

_No rows._

## Local metadata fallback priorities

| Score | URL | Lang | Words | Tools | Flags | Title |
| --- | --- | --- | --- | --- | --- | --- |
| 73 | /en/posts/investingInfo/dxy-dollar-index-basics | en | 496 | goal, comp, cagr, fire, dca | title_too_long, thin_content | What Is DXY (Dollar Index)? A Beginner-Friendly Explanation for Investors |
| 73 | /en/posts/economicInfo/indicator-basics | en | 835 | goal, comp, cagr, fire, dca | title_too_long, thin_content | How to Read Economic Indicators: Using GDP, Unemployment, and PMI in Real Investing |
| 63 | /en/posts/investingInfo/korea-etf-deep-dive-tnx | en | 923 | goal, comp, cagr, fire, dca | title_too_long, description_too_long | Why Korea ETFs Are the Most Sensitive to TNX: A Deep Structural Analysis |
| 63 | /en/posts/economicInfo/inflation-basics | en | 1041 | goal, comp, cagr, fire, dca | title_too_long, description_too_long | Understanding Inflation and Interest Rates: The Core Framework Every Long-Term Investor Must Know |
| 63 | /en/posts/investingInfo/us10y-impact-on-korea-and-stock-market | en | 1080 | goal, comp, cagr, fire, dca | title_too_long, description_too_long | How the U.S. 10-Year Treasury Yield (TNX) Affects the U.S. Economy, Korea, and Global Stock Markets |
| 63 | /en/posts/investingInfo/diagnose-investing-skill-with-cagr | en | 1139 | goal, comp, cagr, fire, dca | title_too_long, description_too_long | Diagnosing Your Investing Skill Using CAGR: Understanding MDD, Volatility, and Sharpe Ratio |
| 63 | /en/posts/investingInfo/dca-consistency-7-fail-patterns | en | 1827 | dca, cagr, goal | title_too_long, description_too_long | DCA Is a Consistency Game, Not a Return Hack: 7 Ways People Fail (and How to Fix Them) |
| 63 | /en/posts/personalFinance/inflation-household-survival-strategy | en | 1962 | goal, compound, fire | title_too_long, description_too_long | Household Survival in an Inflation Era: Cut Fixed Costs, Control Spending, and Protect Cash Flow |
| 63 | /en/posts/economicInfo/yield-curve-2s10s-3m10y-recession-reading | en | 2054 | dca, goal, cagr, fire, comp | title_too_long, description_too_long | Why 2s10s and 3m10y Disagree: A Practical Recession-Signal Reading Guide |
| 63 | /en/posts/personalFinance/personal-finance-3pillars | en | 2084 | goal, comp, cagr, fire, dca | title_too_long, description_too_long | The Three Pillars of Personal Finance: Budgeting, Emergency Funds, and Long-Term Investing (A Practical Setup Guide) |
| 63 | /en/posts/personalFinance/high-rate-debt-vs-invest-threshold-rule | en | 2172 | comp, goal, dca, cagr, fire | title_too_long, description_too_long | High-Rate Era: Should You Pay Down Debt or Invest First? (The Interest-Rate Threshold Rule) |
| 63 | /en/posts/investingInfo/sp500-impact-on-korea-kospi | en | 2219 | goal, comp, cagr, fire, dca | title_too_long, description_too_long | How the S&P 500 Moves Korea’s Economy and KOSPI: The FX–Rates–Foreign Flow Chain |
| 63 | /en/posts/investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions | en | 2342 | goal, dca, cagr, comp, fire | title_too_long, description_too_long | FX-Hedged vs Unhedged Korea Exposure: 3 Conditions That Change the Right Answer |
| 63 | /en/posts/economicInfo/hormuz-risk-oil-insurance-freight-premium | en | 2560 | dca | title_too_long, description_too_long | Middle East Oil Shipping Risk, Explained on One Page: Oil Often Reacts to Insurance and Freight Premia Before Any “Blockade” |
| 63 | /en/posts/economicInfo/real-rates-and-breakevens | en | 2657 | goal, comp, cagr, dca, fire | title_too_long, description_too_long | Real Rates & Breakeven Inflation: The Asset-Pricing Thermometer Most Investors Ignore |
| 63 | /en/posts/economicInfo/geopolitics-to-usd-liquidity-fx | en | 2725 | dca | title_too_long, description_too_long | When Geopolitics Turns Into Dollar Strength: Read It as USD Liquidity, Not Just “Fear” |
| 63 | /en/posts/personalFinance/apt-dashboard-home-goal-roadmap | en | 2825 | goal, cagr | title_too_long, description_too_long | A 3-Step Home-Buying Roadmap Using Real Estate Transaction Data: Turn Anxiety Into Rules (Not Predictions) |
| 63 | /en/posts/economicInfo/war-risk-oil-supply-insurance-shipping | en | 2931 | dca, cagr | title_too_long, description_too_long | Why War Headlines Move Oil in Three Steps: Supply, Insurance, and Shipping Risk Premiums |
| 63 | /en/posts/economicInfo/tariffs-growth-margins-fx-package-shock | en | 3006 | dca, cagr | title_too_long, description_too_long | Tariffs as a Package Shock: Growth, Margins, FX, and Inflation Move Together |
| 63 | /en/posts/investingInfo/seoul-gyeonggi-incheon-risk-budget-framework | en | 3024 | comp, cagr | title_too_long, description_too_long | Seoul vs Gyeonggi vs Incheon as a Risk-Budget Problem: Volatility, Liquidity, Recovery Resilience |

## Title and description rewrite rules

- Korean titles should answer a concrete search problem, use numbers/comparisons/checklists when natural, and avoid abstract labels such as only "복리란?".
- English titles should be written for English search behavior, using terms such as calculator, simulator, monthly investment, CAGR, DCA, retirement, and guide only when they match the article.
- Meta descriptions should usually stay around 110-160 characters, state the outcome the reader gets, and mention the calculator/tool when the article connects to one.
- Avoid repeating the same description template across posts. Treat title, h1, intro, and description as one coherent promise.

## Recommended content structure

1. Two to three sentence answer-first summary.
2. Formula or concept box.
3. Practical example with assumptions.
4. One or two compact tables.
5. Common mistakes.
6. Related calculator/tool links.
7. Three to five related posts.
8. Three to five FAQ items when the visible article has matching FAQ content.
9. Article JSON-LD and FAQPage JSON-LD only when the FAQ is visible.

## Measurement note

The current view counter can show page popularity, but it is not enough to diagnose search quality. For privacy-safe internal measurement, add an event table with `page_path`, `canonical_path`, `lang`, `slug`, `category`, `referrer_origin`, `utm_source`, `utm_medium`, `created_at`, and an optional salted session/user-agent hash. Do not store raw IP addresses.
