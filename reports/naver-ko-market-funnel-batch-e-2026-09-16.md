# FinMap KO Post Naver Search Visibility Step 6E

## Final Verdict
PASS_MARKET_FUNNEL_BATCH_E

## Market Dashboard Preflight
- Route exists: YES
- Data route: /api/stock-index/dashboard
- Source table: STOCK_INVEST_INFO
- Reverse funnel surface: EXISTING_SURFACE_AVAILABLE_ALREADY_PRESENT

## Confirmed Indicators
- WTI: CONFIRMED
- USD/KRW: CONFIRMED
- DXY: CONFIRMED
- US10Y/TNX: CONFIRMED
- S&P 500: CONFIRMED
- Dow Jones: CONFIRMED
- Nasdaq: CONFIRMED
- KOSPI: CONFIRMED

## Candidate Reconciliation
| Candidate | Family | Decision | Anchor | Rationale |
| --- | --- | --- | --- | --- |
| economicInfo/eu-russia-gas-phaseout-price-channel | OIL_ENERGY | SKIP_DATA_NOT_AVAILABLE | - | Dashboard provides WTI, not European gas/storage/LNG replacement data. |
| economicInfo/fx-basics | FX | APPLY | “주요 시장 지표 흐름” |  |
| economicInfo/geopolitics-to-usd-liquidity-fx | FX | APPLY | “달러·금리·지수 흐름” |  |
| economicInfo/hormuz-risk-oil-insurance-freight-premium | OIL_ENERGY | SKIP_NOT_NATURAL | - | Article focuses on shipping, insurance, and Hormuz risk premiums beyond current dashboard scope. |
| economicInfo/interest-rate-basics | INTEREST_RATES | APPLY | “미국 10년물 금리 흐름” |  |
| economicInfo/oil-shock-to-usdkrw-korea-transmission | OIL_ENERGY | APPLY | “WTI와 원/달러 흐름” |  |
| economicInfo/policy-rate-cut-market-rates | INTEREST_RATES | SKIP_NOT_NATURAL | - | Policy-rate transmission is broader than the available dashboard indicator set. |
| economicInfo/real-rates-and-breakevens | INTEREST_RATES | SKIP_DATA_NOT_AVAILABLE | - | Dashboard does not provide real rates or breakeven inflation series. |
| economicInfo/yield-curve-2s10s-3m10y-recession-reading | INTEREST_RATES | SKIP_DATA_NOT_AVAILABLE | - | Dashboard does not provide 2Y/10Y or 3M/10Y yield-curve spreads. |
| investingInfo/bond-etf-duration-drives-returns | ETF | APPLY | “TNX 흐름 확인” |  |
| investingInfo/dxy-dollar-index-basics | DXY | APPLY | “달러와 환율 흐름” |  |
| investingInfo/dxy-market-impact | DXY | APPLY | “달러·환율·주요 지수 흐름” |  |
| investingInfo/etf-impact-of-tnx | ETF | APPLY | “TNX와 주요 지수 흐름” |  |
| investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions | FX | SKIP_NOT_NATURAL | - | Article is a hedge decision guide, not a market-indicator lookup flow. |
| investingInfo/korea-etf-deep-dive-tnx | ETF | APPLY | “TNX·환율·코스피 흐름” |  |
| investingInfo/sp500-impact-on-korea-kospi | KOSPI_GLOBAL_LINK | APPLY | “미국 지수와 코스피 흐름” |  |
| investingInfo/tnx-basics | TNX | APPLY | “미국 10년물 금리와 지수 흐름” |  |
| investingInfo/us10y-impact-on-korea-and-stock-market | TNX | APPLY | “TNX·환율·주요 지수 흐름” |  |
| investingInfo/usd-krw-exchange-rate-and-kospi | KOSPI_GLOBAL_LINK | APPLY | “원/달러·달러인덱스·코스피 흐름” |  |
| investingInfo/usd-krw-weak-won-sector-map-kospi | KOSPI_GLOBAL_LINK | APPLY | “원/달러와 코스피 흐름” |  |
| investingInfo/wti-impact-on-korea-kospi | OIL_ENERGY | APPLY | “WTI와 주요 지수 흐름” |  |

## Applied Post -> Dashboard Links
- economicInfo/fx-basics -> /market/indices (주요 시장 지표 흐름)
- economicInfo/geopolitics-to-usd-liquidity-fx -> /market/indices (달러·금리·지수 흐름)
- economicInfo/interest-rate-basics -> /market/indices (미국 10년물 금리 흐름)
- economicInfo/oil-shock-to-usdkrw-korea-transmission -> /market/indices (WTI와 원/달러 흐름)
- investingInfo/bond-etf-duration-drives-returns -> /market/indices (TNX 흐름 확인)
- investingInfo/dxy-dollar-index-basics -> /market/indices (달러와 환율 흐름)
- investingInfo/dxy-market-impact -> /market/indices (달러·환율·주요 지수 흐름)
- investingInfo/etf-impact-of-tnx -> /market/indices (TNX와 주요 지수 흐름)
- investingInfo/korea-etf-deep-dive-tnx -> /market/indices (TNX·환율·코스피 흐름)
- investingInfo/sp500-impact-on-korea-kospi -> /market/indices (미국 지수와 코스피 흐름)
- investingInfo/tnx-basics -> /market/indices (미국 10년물 금리와 지수 흐름)
- investingInfo/us10y-impact-on-korea-and-stock-market -> /market/indices (TNX·환율·주요 지수 흐름)
- investingInfo/usd-krw-exchange-rate-and-kospi -> /market/indices (원/달러·달러인덱스·코스피 흐름)
- investingInfo/usd-krw-weak-won-sector-map-kospi -> /market/indices (원/달러와 코스피 흐름)
- investingInfo/wti-impact-on-korea-kospi -> /market/indices (WTI와 주요 지수 흐름)

## Unsupported / Skipped Cases
- economicInfo/eu-russia-gas-phaseout-price-channel: SKIP_DATA_NOT_AVAILABLE - Dashboard provides WTI, not European gas/storage/LNG replacement data.
- economicInfo/hormuz-risk-oil-insurance-freight-premium: SKIP_NOT_NATURAL - Article focuses on shipping, insurance, and Hormuz risk premiums beyond current dashboard scope.
- economicInfo/policy-rate-cut-market-rates: SKIP_NOT_NATURAL - Policy-rate transmission is broader than the available dashboard indicator set.
- economicInfo/real-rates-and-breakevens: SKIP_DATA_NOT_AVAILABLE - Dashboard does not provide real rates or breakeven inflation series.
- economicInfo/yield-curve-2s10s-3m10y-recession-reading: SKIP_DATA_NOT_AVAILABLE - Dashboard does not provide 2Y/10Y or 3M/10Y yield-curve spreads.
- investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions: SKIP_NOT_NATURAL - Article is a hedge decision guide, not a market-indicator lookup flow.

## Market Coverage Before / After
- Before market route links in candidate set: 0
- After market route links in candidate set: 15
- New market route links: 15
- Family result: {"DXY":{"apply":2,"skipped":0,"already":0,"review":0},"ETF":{"apply":3,"skipped":0,"already":0,"review":0},"FX":{"apply":2,"skipped":1,"already":0,"review":0},"INTEREST_RATES":{"apply":1,"skipped":3,"already":0,"review":0},"KOSPI_GLOBAL_LINK":{"apply":3,"skipped":0,"already":0,"review":0},"OIL_ENERGY":{"apply":2,"skipped":2,"already":0,"review":0},"TNX":{"apply":2,"skipped":0,"already":0,"review":0}}

## Freshness Wording Check
- Realtime claim misuse: 0
- Unsupported indicator claims: 0

## Dashboard -> Post Reverse Funnel Decision
EXISTING_SURFACE_AVAILABLE_ALREADY_PRESENT

## Previous Batch Regression
- Step 6A: PASS_QUERY_BOUNDARY_BATCH_A
- Step 6B: PASS_TOPIC_LINK_BATCH_B
- Step 6C: PASS_CROSS_CATEGORY_BATCH_C
- Step 6D: PASS_TOPIC_HUB_BATCH_D_WITH_HOUSEHOLD_DEFERRED

## Sitemap Preservation
- DCA hub included: YES
- Fake English DCA hub present: NO
- Step 6E unexpected URL additions: 0
- URL drops: 0

## Validation
- candidateCount: 21
- intendedApplyCount: 15
- appliedCount: 15
- reviewRequired: 0
- targetRouteExists: 1
- routeTargetsOk: 1
- brokenMarketLink: 0
- duplicateMarketLink: 0
- perPostOverAdditions: 0
- unsupportedIndicatorClaims: 0
- realtimeClaimMisuse: 0
- dateModifiedIssues: 0
- structureIssues: 0
- missingConfirmedIndicators: 0
- previousBatchPass: 1
- sitemapUnexpectedStep6EUrlAdditions: 0
- sitemapUrlDrops: 0
- fakeEnglishDcaHubPresent: 0
- batchGScopeActive: 1
- batchGScopeVerdict: PASS_TECHNICAL_SEO_BATCH_G
- batchGAllowedFileCount: 69
- batchGTechnicalOnlyChangedCandidates: 20
