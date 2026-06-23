# Finmap AI-like Prose Audit Refresh

Audit date: 2026-06-19

Scope:

- Checked `content/posts/**/*.md`
- KO and EN markdown files included
- Draft/private exclusion check: no `draft:`, `private:`, `hidden:`, or `published: false` files were found in the scanned markdown set
- This report does not assert authorship. It flags **AI-like tone risk**, **generic prose**, and **template-heavy prose** candidates for future rewrite review.
- No content files were modified during this refresh.

Method:

- Re-ran the lexical/template scan after KO Batch 1, Batch 1.1, and Batch 2 edits.
- Signals included generic openers, repeated summary phrases, repeated modal phrasing, CTA/passive calculator language, FAQ density, and heavy reuse of Quick Answer / Checklist / FAQ / Bottom Line structures.
- Risk level is a rewrite-priority signal, not a quality verdict.

## Summary

| Metric | Previous audit | Refresh | Change |
|---|---:|---:|---:|
| Total scanned files | 142 | 142 | 0 |
| Excluded files | 0 | 0 | 0 |
| High candidates | 49 | 37 | -12 |
| Medium candidates | 50 | 55 | +5 |
| Low candidates | 27 | 25 | -2 |
| No material signal | 16 | 25 | +9 |

Interpretation:

- KO Batch 1 and Batch 2 rewrites lowered the strongest KO tone risks. None of the 10 rewritten KO files remain High.
- Several rewritten files still appear as Medium because the remaining signal is mostly **template-heavy FAQ/checklist density**, not repeated generic prose.
- EN was not part of KO Batch 1/2, so EN risk is reported separately rather than mixed into the KO rewrite result.

## Current Risk Counts By Language

| Lang | High | Medium | Low | No material signal |
|---|---:|---:|---:|---:|
| KO | 26 | 25 | 12 | 8 |
| EN | 11 | 30 | 13 | 17 |
| Total | 37 | 55 | 25 | 25 |

## Batch 1 Reclassification

All five Batch 1 files moved out of High. Remaining Medium signals are mainly FAQ/template structure, not the original repeated phrase problem.

| File | Previous | Refresh | Score | Current reason |
|---|---|---|---:|---|
| `content/posts/personalFinance/ko/how-much-monthly-invest-for-100m.md` | High | No material signal | 1 | Generic CTA/opening signal largely cleared. |
| `content/posts/personalFinance/ko/simple-vs-compound.md` | High | Medium | 5 | Repeated prose reduced; still has dense FAQ/template structure. |
| `content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md` | High | Medium | 7 | Phrase repetition cleared; template-heavy structure remains visible. |
| `content/posts/personalFinance/ko/is-dca-better-in-bear-market.md` | High | No material signal | 1 | Passive calculator language largely cleared. |
| `content/posts/economicInfo/ko/geopolitics-to-usd-liquidity-fx.md` | High | Medium | 4 | Much improved; one residual generic closing signal and broad explanatory cadence remain. |

## Batch 2 Reclassification

All five Batch 2 files moved out of High. Remaining Medium signals are driven by FAQ/checklist density rather than the removed target expressions.

| File | Previous | Refresh | Score | Current reason |
|---|---|---|---:|---|
| `content/posts/economicInfo/ko/interest-rate-basics.md` | High | Low | 3 | Repeated "핵심은/정리하면/중요합니다" signal cleared; mild template signal remains. |
| `content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md` | High | Medium | 5 | Generic phrase signal cleared; still has 8 FAQ items and multiple checklist/bottom-line style blocks. |
| `content/posts/investingInfo/ko/modern-6040-risk-budget.md` | High | Low | 3 | Repeated conclusion style reduced; mild FAQ/template signal remains. |
| `content/posts/economicInfo/ko/tariffs-growth-margins-fx-package-shock.md` | High | Medium | 7 | Repeated key-point language reduced; checklist and 8+ FAQ structure still template-heavy. |
| `content/posts/investingInfo/ko/cagr-7percent-reality-check.md` | High | Low | 3 | Intro/CTA now more numeric and calculator-driven; low residual structure signal. |

## Remaining KO High TOP 10

These are the highest-priority KO candidates after Batch 1 and Batch 2.

| Rank | File | Score | Main signal | Suggested rewrite scope |
|---:|---|---:|---|---|
| 1 | `content/posts/investingInfo/ko/bond-etf-duration-drives-returns.md` | 14 | Repeated `중요합니다/핵심은/정리하면/단순히`, 11 FAQ items | Rewrite intro and section endings around duration examples; compress FAQ. |
| 2 | `content/posts/economicInfo/ko/war-risk-oil-supply-insurance-shipping.md` | 14 | `핵심은` repeated, many checklist/bottom-line blocks | Convert war-risk chain into event-to-indicator map; reduce checklist repetition. |
| 3 | `content/posts/investingInfo/ko/sp500-impact-on-korea-kospi.md` | 14 | `중요합니다/도움이 됩니다/핵심은` plus broad market framing | Recast as S&P500 -> FX -> foreign flow -> KOSPI case flow. |
| 4 | `content/posts/economicInfo/ko/yield-curve-2s10s-3m10y-recession-reading.md` | 13 | `도움이 됩니다/핵심은` and heavy FAQ/checklist cadence | Replace generic curve explanation with 2s10s vs 3m10y interpretation examples. |
| 5 | `content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md` | 13 | `중요합니다/도움이 됩니다` and dashboard checklist density | Rewrite around a concrete home-budget workflow and dashboard sequence. |
| 6 | `content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md` | 12 | `핵심은` repeated, 11 FAQ items | Use mortgage-rate/volume/affordability trigger table; reduce FAQ duplication. |
| 7 | `content/posts/personalFinance/ko/dca-fx-volatility-decomposition.md` | 12 | `핵심은` repeated, template-heavy FAQ/checklist | Add one DCA + FX example table; shorten repeated summary endings. |
| 8 | `content/posts/economicInfo/ko/war-theme-investing-price-chain-not-winners.md` | 12 | `중요합니다/도움이 됩니다/핵심은/단순히` | Reframe from warning prose to price-chain observation rules. |
| 9 | `content/posts/personalFinance/ko/dca-vs-lumpsum-decision-rules.md` | 11 | `핵심은` repeated, multiple checklist blocks | Convert decision rules into input-based if/then table. |
| 10 | `content/posts/personalFinance/ko/dca-step-up-ruleset.md` | 11 | `핵심은` repeated, 8 FAQ items | Rework as step-up amount/frequency examples; reduce FAQ repetition. |

Additional KO High candidates worth keeping on the queue:

- `content/posts/personalFinance/ko/rent-jeonse-buy-cashflow-opportunity-cost.md`
- `content/posts/economicInfo/ko/real-rates-and-breakevens.md`
- `content/posts/economicInfo/ko/oil-shock-to-usdkrw-korea-transmission.md`
- `content/posts/economicInfo/ko/gold-geopolitics-real-rates-dollar-uncertainty.md`
- `content/posts/personalFinance/ko/monthly-dca-10-year-result.md`

## EN Section

EN content is reported separately because this refresh follows KO Batch 1/2. The main EN risk is still modal-heavy guide prose (`can/should/may`) and repeated "The key is / This guide explains" framing.

### EN High

| File | Score | Main signal | Suggested scope |
|---|---:|---|---|
| `content/posts/personalFinance/en/fire-sequence-risk-first-5-years.md` | 14 | `This guide explains`, `The key is`, `can be useful`, 8 FAQ items | Rewrite as withdrawal-sequence stress-test steps. |
| `content/posts/economicInfo/en/gold-geopolitics-real-rates-dollar-uncertainty.md` | 11 | `The key is`, 11 FAQ items | Reframe around real rates, DXY, and geopolitical uncertainty signal map. |
| `content/posts/investingInfo/en/real-estate-role-in-portfolio-risk-budget.md` | 11 | `The key is`, 8 FAQ items | Add Korea housing allocation examples; reduce generic role language. |
| `content/posts/economicInfo/en/geopolitics-oil-fx-dashboard.md` | 10 | `The key is`, 8 FAQ items | Convert guide prose into dashboard observation order. |
| `content/posts/economicInfo/en/yield-curve-2s10s-3m10y-recession-reading.md` | 9 | `This guide explains` repeated, 8 FAQ items | Rewrite intro as direct 2s10s vs 3m10y comparison. |
| `content/posts/economicInfo/en/tariffs-growth-margins-fx-package-shock.md` | 8 | Template-heavy FAQ/checklist structure | Tighten scenario interpretation and reduce repeated caveats. |
| `content/posts/economicInfo/en/war-risk-oil-supply-insurance-shipping.md` | 8 | `The key is` repeated | Add oil/shipping premium signal examples. |
| `content/posts/personalFinance/en/dca-vs-lumpsum-decision-rules.md` | 8 | `The key is`, 8 FAQ items | Convert to if/then decision table. |
| `content/posts/economicInfo/en/eu-russia-gas-phaseout-price-channel.md` | 8 | `The key is`, `can help you` | Use Europe gas price channel examples instead of generic guide language. |
| `content/posts/investingInfo/en/rates-discount-mortgage-demand-apt-prices.md` | 8 | `The key is`, template-heavy FAQ/checklist | Reframe around Korea mortgage demand and apartment-price triggers. |
| `content/posts/economicInfo/en/geopolitics-to-usd-liquidity-fx.md` | 8 | `The key is` repeated | Turn liquidity/fundamental distinction into market-reading rules. |

### EN Medium Watchlist

- `content/posts/investingInfo/en/seoul-gyeonggi-incheon-risk-budget-framework.md`
- `content/posts/personalFinance/en/large-apartment-complex-households-price-stability.md`
- `content/posts/investingInfo/en/bond-etf-duration-drives-returns.md`
- `content/posts/personalFinance/en/dca-fx-volatility-decomposition.md`
- `content/posts/personalFinance/en/dca-step-up-ruleset.md`
- `content/posts/personalFinance/en/fire-assumption-errors-7-fixes.md`
- `content/posts/personalFinance/en/fire-3-numbers-spending-horizon-withdrawal.md`
- `content/posts/investingInfo/en/usd-krw-exchange-rate-and-kospi.md`
- `content/posts/economicInfo/en/inflation-rate-basics.md`
- `content/posts/personalFinance/en/personal-start-5steps.md`

## Repeated Expression Count Changes

| Pattern | Previous audit | Refresh | Change |
|---|---:|---:|---:|
| KO `핵심은` | 100 | 65 | -35 |
| KO `중요합니다` | 66 | 56 | -10 |
| KO `도움이 됩니다` | 30 | 23 | -7 |
| KO `볼 수 있습니다` | 24 | 17 | -7 |
| KO `확인할 수 있습니다` | 16 | 10 | -6 |
| KO `이 글에서는` | 12 | 11 | -1 |
| KO modal family | 234 | 221 | -13 |
| EN `The key is` | 20 | 22 | +2 |
| EN `This guide explains` | 9 | 10 | +1 |
| EN `This article explains` | 5 | 5 | 0 |
| EN `can help you` | 3 | 3 | 0 |
| EN `can be useful` | 3 | 3 | 0 |
| EN modal family `can/should/may/could/might` | 2,173 | 2,209 | +36 |

Current additional KO target counts:

| Pattern | Refresh count |
|---|---:|
| `알아보겠습니다` | 0 |
| `투자자는 신중하게` | 0 |
| `본인의 상황에 맞게` | 0 |
| `한 문장으로 정리하면` | 0 |
| `정리하면` | 6 |
| `결론적으로` | 8 |
| `단순히` | 26 |

Notes:

- KO repeated prose improved materially after Batch 1/2.
- EN modal count increased slightly. This refresh does not attribute that to KO rewrites; EN content needs a separate EN tone pass if the goal is to reduce Google/Bing-facing generic guide language.

## FAQ / Template-Heavy Still Excessive

The following files still have high FAQ/checklist/bottom-line density. Some may be structurally intentional for SEO, but they should be reviewed if the page feels repetitive or if FAQ answers restate the body without adding a decision rule or exception.

| File | Lang | Risk | Template signal | FAQ count | Checklist hits | Bottom/Conclusion hits | Common mistakes / misunderstanding hits |
|---|---|---|---:|---:|---:|---:|---:|
| `content/posts/economicInfo/ko/war-risk-oil-supply-insurance-shipping.md` | ko | High | 7 | 8 | 11 | 8 | 3 |
| `content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md` | ko | High | 7 | 8 | 4 | 3 | 1 |
| `content/posts/economicInfo/ko/yield-curve-2s10s-3m10y-recession-reading.md` | ko | High | 7 | 8 | 4 | 6 | 9 |
| `content/posts/personalFinance/ko/dca-fx-volatility-decomposition.md` | ko | High | 7 | 8 | 3 | 2 | 3 |
| `content/posts/economicInfo/ko/real-rates-and-breakevens.md` | ko | High | 7 | 11 | 4 | 4 | 3 |
| `content/posts/personalFinance/ko/dca-vs-lumpsum-decision-rules.md` | ko | High | 7 | 8 | 6 | 4 | 2 |
| `content/posts/economicInfo/ko/gold-geopolitics-real-rates-dollar-uncertainty.md` | ko | High | 7 | 11 | 10 | 3 | 4 |
| `content/posts/personalFinance/ko/dca-step-up-ruleset.md` | ko | High | 7 | 8 | 3 | 2 | 2 |
| `content/posts/personalFinance/ko/rent-jeonse-buy-cashflow-opportunity-cost.md` | ko | High | 7 | 8 | 3 | 9 | 2 |
| `content/posts/investingInfo/ko/fx-hedge-vs-fx-exposure-korea-3-conditions.md` | ko | High | 7 | 12 | 3 | 1 | 1 |
| `content/posts/personalFinance/ko/fire-assumption-errors-7-fixes.md` | ko | High | 7 | 15 | 4 | 5 | 2 |
| `content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md` | ko | Medium | 7 | 8 | 6 | 4 | 2 |
| `content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md` | ko | High | 6 | 11 | 2 | 3 | 2 |
| `content/posts/personalFinance/ko/monthly-dca-10-year-result.md` | ko | High | 6 | 8 | 1 | 1 | 2 |
| `content/posts/personalFinance/ko/fire-sequence-risk-first-5-years.md` | ko | High | 6 | 8 | 2 | 5 | 2 |
| `content/posts/investingInfo/ko/real-estate-role-in-portfolio-risk-budget.md` | ko | High | 6 | 8 | 1 | 3 | 3 |
| `content/posts/investingInfo/en/rates-discount-mortgage-demand-apt-prices.md` | en | High | 6 | 8 | 4 | 0 | 1 |
| `content/posts/economicInfo/ko/tariffs-growth-margins-fx-package-shock.md` | ko | Medium | 6 | 11 | 9 | 0 | 2 |
| `content/posts/personalFinance/ko/fire-3-numbers-spending-horizon-withdrawal.md` | ko | Medium | 6 | 8 | 1 | 4 | 4 |
| `content/posts/personalFinance/ko/simple-vs-compound.md` | ko | Medium | 5 | 8 | 0 | 3 | 3 |

## What Improved

- The 10 rewritten KO posts no longer appear in the High bucket.
- KO phrase counts dropped most sharply for `핵심은`, which was the strongest recurring AI-like cadence signal in the first audit.
- Batch 1 produced the strongest movement into `No material signal` for calculator-intent posts:
  - `how-much-monthly-invest-for-100m.md`
  - `is-dca-better-in-bear-market.md`
- Batch 2 reduced phrase risk strongly, but some files remain Medium because their structure still uses many FAQ/checklist blocks.

## Suggested Next Queue

Recommended KO Batch 3 candidates:

1. `content/posts/investingInfo/ko/bond-etf-duration-drives-returns.md`
2. `content/posts/economicInfo/ko/war-risk-oil-supply-insurance-shipping.md`
3. `content/posts/investingInfo/ko/sp500-impact-on-korea-kospi.md`
4. `content/posts/economicInfo/ko/yield-curve-2s10s-3m10y-recession-reading.md`
5. `content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md`

Recommended EN tone pass candidates:

1. `content/posts/personalFinance/en/fire-sequence-risk-first-5-years.md`
2. `content/posts/economicInfo/en/gold-geopolitics-real-rates-dollar-uncertainty.md`
3. `content/posts/investingInfo/en/real-estate-role-in-portfolio-risk-budget.md`
4. `content/posts/economicInfo/en/geopolitics-oil-fx-dashboard.md`
5. `content/posts/economicInfo/en/yield-curve-2s10s-3m10y-recession-reading.md`

Rewrite principle for the next pass:

- Do not remove FAQ blocks mechanically.
- Prefer replacing repeated section endings with:
  - concrete reader scenario,
  - calculator input/output,
  - dashboard observation order,
  - numeric threshold,
  - exception case.
- Keep SEO metadata, canonical, slug, hreflang, sitemap, and robots untouched unless a separate SEO task requires it.
