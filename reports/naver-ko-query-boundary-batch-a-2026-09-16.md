# FinMap KO Query Boundary Batch A Verification

Generated: 2026-09-17T05:46:02.886Z

## Final Verdict

PASS_QUERY_BOUNDARY_BATCH_A

## Baseline Snapshot

- Source: reports/naver-ko-pre-implementation-baseline-2026-09-16.json
- Baseline rows: 79
- Baseline generated: 2026-09-16T07:51:45.612Z
- Git HEAD at baseline: 4012d8f88e3a1d654f717faeca24f8b3baadbc24

## Modified Posts

| Post | File | Changed |
| --- | --- | --- |
| economicInfo/geopolitics-oil-fx-dashboard | content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md | true |
| economicInfo/geopolitics-to-usd-liquidity-fx | content/posts/economicInfo/ko/geopolitics-to-usd-liquidity-fx.md | true |
| economicInfo/hormuz-risk-oil-insurance-freight-premium | content/posts/economicInfo/ko/hormuz-risk-oil-insurance-freight-premium.md | true |
| economicInfo/inflation-basics | content/posts/economicInfo/ko/inflation-basics.md | true |
| economicInfo/inflation-rate-basics | content/posts/economicInfo/ko/inflation-rate-basics.md | true |
| economicInfo/oil-shock-to-usdkrw-korea-transmission | content/posts/economicInfo/ko/oil-shock-to-usdkrw-korea-transmission.md | true |
| economicInfo/war-risk-oil-supply-insurance-shipping | content/posts/economicInfo/ko/war-risk-oil-supply-insurance-shipping.md | true |
| investingInfo/etf-impact-of-tnx | content/posts/investingInfo/ko/etf-impact-of-tnx.md | true |
| investingInfo/us10y-impact-on-korea-and-stock-market | content/posts/investingInfo/ko/us10y-impact-on-korea-and-stock-market.md | true |
| investingInfo/wti-impact-on-korea-kospi | content/posts/investingInfo/ko/wti-impact-on-korea-kospi.md | true |
| personalFinance/dca-vs-lump-sum-when-results-differ | content/posts/personalFinance/ko/dca-vs-lump-sum-when-results-differ.md | true |
| personalFinance/dca-vs-lumpsum-decision-rules | content/posts/personalFinance/ko/dca-vs-lumpsum-decision-rules.md | true |
| personalFinance/personal-finance-3pillars | content/posts/personalFinance/ko/personal-finance-3pillars.md | true |
| personalFinance/personal-start-5steps | content/posts/personalFinance/ko/personal-start-5steps.md | true |

## Pair-by-Pair Boundary Results

| Pair | Owner | Supporting | Description | Intro | H2 | FAQ | Contextual Link | Stuffing | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | economicInfo/geopolitics-oil-fx-dashboard | economicInfo/geopolitics-to-usd-liquidity-fx | CLEAR / CLEAR | CLEAR / CLEAR | CLEAR | CLEAR | CLEAR | PASS | CLEAR |
| B | economicInfo/hormuz-risk-oil-insurance-freight-premium | economicInfo/war-risk-oil-supply-insurance-shipping | CLEAR / CLEAR | CLEAR / CLEAR | CLEAR | CLEAR | CLEAR | PASS | CLEAR |
| C | economicInfo/inflation-basics | economicInfo/inflation-rate-basics | CLEAR / CLEAR | PARTIAL / CLEAR | CLEAR | CLEAR | CLEAR | PASS | CLEAR |
| D | investingInfo/wti-impact-on-korea-kospi | economicInfo/oil-shock-to-usdkrw-korea-transmission | CLEAR / CLEAR | CLEAR / CLEAR | CLEAR | CLEAR | CLEAR | PASS | CLEAR |
| E | investingInfo/us10y-impact-on-korea-and-stock-market | investingInfo/etf-impact-of-tnx | CLEAR / CLEAR | CLEAR / CLEAR | CLEAR | CLEAR | CLEAR | PASS | CLEAR |
| F | personalFinance/dca-vs-lumpsum-decision-rules | personalFinance/dca-vs-lump-sum-when-results-differ | CLEAR / CLEAR | CLEAR / CLEAR | CLEAR | CLEAR | CLEAR | PASS | CLEAR |
| G | personalFinance/personal-start-5steps | personalFinance/personal-finance-3pillars | CLEAR / CLEAR | CLEAR / CLEAR | CLEAR | PARTIAL | CLEAR | PASS | CLEAR |

## Description Changes

All target posts now include role-specific descriptions for the intended owner/supporting query boundary. Article JSON-LD descriptions were synced to frontmatter descriptions.

## Intro Changes

Intro/early-summary text now states the document role for all 7 pairs: overview vs specialist, transport vs war-risk, concept vs metric, FX vs KOSPI, ETF vs Korea-market, decision vs result, framework vs starter sequence.

## H2 Changes

H2 changes were limited to boundary clarification where useful. No title/H1 changes were made.

## FAQ Changes

FAQ changes were limited to boundary-sensitive answers in Hormuz vs war-risk and DCA decision vs result. FAQPage JSON-LD was synced for those changed answers.

## Contextual Link Changes

Each boundary pair has bidirectional contextual links or existing reciprocal links with natural descriptive anchors. Step 4 non-boundary APPROVE links were not batch-applied here.

## Title Preservation Check

- Title changes: 0
- Title preservation: PASS

## dateModified Check

| Post | dateModified | OK |
| --- | --- | --- |
| economicInfo/geopolitics-oil-fx-dashboard | 2026-09-16 | true |
| economicInfo/geopolitics-to-usd-liquidity-fx | 2026-09-16 | true |
| economicInfo/hormuz-risk-oil-insurance-freight-premium | 2026-09-16 | true |
| economicInfo/inflation-basics | 2026-09-16 | true |
| economicInfo/inflation-rate-basics | 2026-09-16 | true |
| economicInfo/oil-shock-to-usdkrw-korea-transmission | 2026-09-16 | true |
| economicInfo/war-risk-oil-supply-insurance-shipping | 2026-09-16 | true |
| investingInfo/etf-impact-of-tnx | 2026-09-16 | true |
| investingInfo/us10y-impact-on-korea-and-stock-market | 2026-09-16 | true |
| investingInfo/wti-impact-on-korea-kospi | 2026-09-16 | true |
| personalFinance/dca-vs-lump-sum-when-results-differ | 2026-09-16 | true |
| personalFinance/dca-vs-lumpsum-decision-rules | 2026-09-16 | true |
| personalFinance/personal-finance-3pillars | 2026-09-17 | false |
| personalFinance/personal-start-5steps | 2026-09-16 | true |

## Query Stuffing Guard

| Pair | Exact Phrase Counts | Guard |
| --- | --- | --- |
| A | {"ownerPrimaryInOwner":0,"supportingPrimaryInOwner":0,"ownerPrimaryInSupporting":0,"supportingPrimaryInSupporting":0} | PASS |
| B | {"ownerPrimaryInOwner":1,"supportingPrimaryInOwner":2,"ownerPrimaryInSupporting":0,"supportingPrimaryInSupporting":1} | PASS |
| C | {"ownerPrimaryInOwner":0,"supportingPrimaryInOwner":0,"ownerPrimaryInSupporting":0,"supportingPrimaryInSupporting":0} | PASS |
| D | {"ownerPrimaryInOwner":0,"supportingPrimaryInOwner":0,"ownerPrimaryInSupporting":0,"supportingPrimaryInSupporting":0} | PASS |
| E | {"ownerPrimaryInOwner":0,"supportingPrimaryInOwner":0,"ownerPrimaryInSupporting":0,"supportingPrimaryInSupporting":0} | PASS |
| F | {"ownerPrimaryInOwner":0,"supportingPrimaryInOwner":0,"ownerPrimaryInSupporting":0,"supportingPrimaryInSupporting":0} | PASS |
| G | {"ownerPrimaryInOwner":0,"supportingPrimaryInOwner":1,"ownerPrimaryInSupporting":0,"supportingPrimaryInSupporting":0} | PASS |

## Validation

| Check | Value |
| --- | --- |
| titlePreservationOk | true |
| titleChangeCount | 0 |
| dateModifiedOk | true |
| changedTargetFileCount | 14 |
| expectedTargetFileMax | 14 |
| step3BoundaryRepresented | true |
| allPairLinksClear | true |
| queryStuffingGuardOk | true |
| scopeOk | true |
| batchBScopeActive | true |
| batchBScopeVerdict | PASS_TOPIC_LINK_BATCH_B |
| batchBAllowedFileCount | 3 |
| batchCScopeActive | true |
| batchCScopeVerdict | PASS_CROSS_CATEGORY_BATCH_C |
| batchCAllowedFileCount | 0 |
| batchDScopeActive | true |
| batchDScopeVerdict | PASS_TOPIC_HUB_BATCH_D_WITH_HOUSEHOLD_DEFERRED |
| batchDAllowedFileCount | 6 |
| batchEScopeActive | true |
| batchEScopeVerdict | PASS_MARKET_FUNNEL_BATCH_E |
| batchEAllowedFileCount | 26 |
| batchFScopeActive | true |
| batchFScopeVerdict | PASS_100M_QUERY_BOUNDARY_IMPROVED |
| batchFAllowedFileCount | 10 |
| batchGScopeActive | true |
| batchGScopeVerdict | PASS_TECHNICAL_SEO_BATCH_G |
| batchGAllowedFileCount | 74 |
| disallowedChangedFiles |  |

## Files Changed Scope

Changed files observed by git diff:

- content/posts/economicInfo/ko/eu-russia-gas-phaseout-price-channel.md
- content/posts/economicInfo/ko/fx-basics.md
- content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md
- content/posts/economicInfo/ko/geopolitics-to-usd-liquidity-fx.md
- content/posts/economicInfo/ko/gold-geopolitics-real-rates-dollar-uncertainty.md
- content/posts/economicInfo/ko/hormuz-risk-oil-insurance-freight-premium.md
- content/posts/economicInfo/ko/indicator-basics.md
- content/posts/economicInfo/ko/inflation-basics.md
- content/posts/economicInfo/ko/inflation-rate-basics.md
- content/posts/economicInfo/ko/interest-rate-basics.md
- content/posts/economicInfo/ko/oil-shock-to-usdkrw-korea-transmission.md
- content/posts/economicInfo/ko/policy-rate-cut-market-rates.md
- content/posts/economicInfo/ko/real-rates-and-breakevens.md
- content/posts/economicInfo/ko/tariffs-growth-margins-fx-package-shock.md
- content/posts/economicInfo/ko/war-risk-oil-supply-insurance-shipping.md
- content/posts/economicInfo/ko/war-theme-investing-price-chain-not-winners.md
- content/posts/economicInfo/ko/yield-curve-2s10s-3m10y-recession-reading.md
- content/posts/investingInfo/ko/bond-etf-duration-drives-returns.md
- content/posts/investingInfo/ko/cagr-7percent-reality-check.md
- content/posts/investingInfo/ko/dca-consistency-7-fail-patterns.md
- content/posts/investingInfo/ko/diagnose-investing-skill-with-cagr.md
- content/posts/investingInfo/ko/dxy-dollar-index-basics.md
- content/posts/investingInfo/ko/dxy-market-impact.md
- content/posts/investingInfo/ko/etf-impact-of-tnx.md
- content/posts/investingInfo/ko/fx-hedge-vs-fx-exposure-korea-3-conditions.md
- content/posts/investingInfo/ko/indicator-marketinfo.md
- content/posts/investingInfo/ko/korea-etf-deep-dive-tnx.md
- content/posts/investingInfo/ko/modern-6040-risk-budget.md
- content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md
- content/posts/investingInfo/ko/real-estate-role-in-portfolio-risk-budget.md
- content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md
- content/posts/investingInfo/ko/sp500-impact-on-korea-kospi.md
- content/posts/investingInfo/ko/tnx-basics.md
- content/posts/investingInfo/ko/us10y-impact-on-korea-and-stock-market.md
- content/posts/investingInfo/ko/usd-krw-exchange-rate-and-kospi.md
- content/posts/investingInfo/ko/usd-krw-weak-won-sector-map-kospi.md
- content/posts/investingInfo/ko/why-check-cagr-etf.md
- content/posts/investingInfo/ko/wti-impact-on-korea-kospi.md
- content/posts/personalFinance/ko/annual-vs-monthly-compound.md
- content/posts/personalFinance/ko/apartment-buying-calculator-guide.md
- content/posts/personalFinance/ko/apartment-buying-costs-before-purchase.md
- content/posts/personalFinance/ko/apartment-transaction-volume-decline-meaning.md
- content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md
- content/posts/personalFinance/ko/compound-calculator-guide.md
- content/posts/personalFinance/ko/compound-return-3-5-7-10-table.md
- content/posts/personalFinance/ko/dca-fx-volatility-decomposition.md
- content/posts/personalFinance/ko/dca-step-up-ruleset.md
- content/posts/personalFinance/ko/dca-vs-lump-sum-when-results-differ.md
- content/posts/personalFinance/ko/dca-vs-lumpsum-decision-rules.md
- content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md
- content/posts/personalFinance/ko/dsr-pass-ltv-cash-bottleneck.md
- content/posts/personalFinance/ko/emergency-fund-by-risk.md
- content/posts/personalFinance/ko/fire-3-numbers-spending-horizon-withdrawal.md
- content/posts/personalFinance/ko/fire-assumption-errors-7-fixes.md
- content/posts/personalFinance/ko/fire-sequence-risk-first-5-years.md
- content/posts/personalFinance/ko/fire-spending-buckets-essential-choice-insurance.md
- content/posts/personalFinance/ko/first-home-buyer-budget-calculation.md
- content/posts/personalFinance/ko/goal-amount-fast-strategy.md
- content/posts/personalFinance/ko/high-rate-debt-vs-invest-threshold-rule.md
- content/posts/personalFinance/ko/how-much-monthly-invest-for-100m.md
- content/posts/personalFinance/ko/how-much-per-month-for-100m.md
- content/posts/personalFinance/ko/how-to-read-apartment-transaction-prices.md
- content/posts/personalFinance/ko/inflation-household-survival-strategy.md
- content/posts/personalFinance/ko/interest-rate-1p-loan-limit-impact.md
- content/posts/personalFinance/ko/is-dca-better-in-bear-market.md
- content/posts/personalFinance/ko/jeonse-to-home-purchase-cash-needed.md
- content/posts/personalFinance/ko/large-apartment-complex-households-price-stability.md
- content/posts/personalFinance/ko/ltv-dsr-calculator-guide.md
- content/posts/personalFinance/ko/monthly-dca-10-year-result.md
- content/posts/personalFinance/ko/monthly-investment-for-100m-table.md
- content/posts/personalFinance/ko/mortgage-risk-checklist-dsr-variable.md
- content/posts/personalFinance/ko/personal-finance-3pillars.md
- content/posts/personalFinance/ko/personal-start-5steps.md
- content/posts/personalFinance/ko/rent-jeonse-buy-cashflow-opportunity-cost.md
- content/posts/personalFinance/ko/salary-40m-mortgage-limit.md
- content/posts/personalFinance/ko/salary-50m-dsr-40-loan-limit.md
- public/en/sitemap.xml
- public/sitemap-0.xml
- public/sitemap-en.xml
- public/sitemap-ko.xml
