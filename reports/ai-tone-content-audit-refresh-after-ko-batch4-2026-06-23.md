# Finmap AI-like Prose Audit Refresh After KO Batch 4

Audit date: 2026-06-23

Scope:

- Checked `content/posts/**/*.md`
- KO and EN markdown files included
- Draft/private exclusion check: no `draft: true`, `private: true`, `hidden: true`, or `published: false` files were found
- Checked Markdown ToolCta raw tag cleanup and built HTML raw custom tag output
- This report does not assert authorship. It flags **AI-like tone risk**, **generic prose**, and **template-heavy structure** candidates only.
- No content, code, sitemap, robots, SeoHead, canonical, hreflang, or routing files were modified during this audit.

## Summary

| Metric | Previous refresh after KO Batch 3 | Current refresh after KO Batch 4 | Change |
| --- | ---: | ---: | ---: |
| Total scanned files | 142 | 147 | +5 |
| Excluded files | 0 | 0 | 0 |
| High candidates | 21 | 16 | -5 |
| Medium candidates | 72 | 82 | +10 |
| Low candidates | 42 | 42 | 0 |
| No material signal | 7 | 7 | 0 |

Interpretation:

- KO Batch 4 moved the five targeted High candidates out of the final High queue.
- The scanned file count increased by 5 because the DSR/LTV content cluster now exists in `content/posts`.
- The remaining High queue is now concentrated in older KO macro/FIRE/portfolio posts and EN posts that were not part of KO Batch 4.
- Raw lexical scoring still sees many FAQ-heavy pages as noisy because it counts visible FAQ and FAQPage JSON-LD together. Final risk below is normalized against the previous refresh scale, so FAQ density alone does not automatically mean High.

## Current Risk Counts By Language

| Lang | High | Medium | Low | No material signal |
| --- | ---: | ---: | ---: | ---: |
| KO | 12 | 49 | 13 | 2 |
| EN | 4 | 33 | 29 | 5 |
| Total | 16 | 82 | 42 | 7 |

## KO Remaining High TOP 10

| Rank | File | Main signal | Recommended rewrite scope |
| ---: | --- | --- | --- |
| 1 | `content/posts/economicInfo/ko/hormuz-risk-oil-insurance-freight-premium.md` | `중요합니다`, `핵심은`, one-line conclusion labels, checklist/routine density | Recast as Hormuz risk signal map: oil, freight, insurance, inventory, USD/KRW. |
| 2 | `content/posts/economicInfo/ko/eu-russia-gas-phaseout-price-channel.md` | `도움이 됩니다`, `핵심은`, checklist and FAQ-heavy structure | Replace broad gas-phaseout explanation with price-channel examples and Korea import-cost implications. |
| 3 | `content/posts/personalFinance/ko/personal-finance-3pillars.md` | `중요합니다`, `루틴`, checklist density, 10 FAQ-style questions | Rebuild as income/cashflow/investing workflow with one example household budget. |
| 4 | `content/posts/personalFinance/ko/fire-sequence-risk-first-5-years.md` | `핵심은`, one-line conclusion blocks, FAQ density | Use first-five-years withdrawal sequence examples and reduce repeated summary labels. |
| 5 | `content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md` | `핵심은`, repeated conclusion blocks, FAQ density | Use mortgage-rate, transaction volume, affordability trigger table. |
| 6 | `content/posts/personalFinance/ko/rent-jeonse-buy-cashflow-opportunity-cost.md` | `핵심은`, one-line conclusion labels, 15 FAQ-style questions | Reframe as rent/jeonse/buy cashflow comparison table with opportunity-cost inputs. |
| 7 | `content/posts/personalFinance/ko/dca-step-up-ruleset.md` | `핵심은`, checklist/routine labels, FAQ density | Turn step-up rules into amount/frequency examples and shorten FAQ answers. |
| 8 | `content/posts/personalFinance/ko/fire-assumption-errors-7-fixes.md` | repeated one-line conclusion blocks and checklist structure | Convert error/fix list into assumption input table for the FIRE calculator. |
| 9 | `content/posts/economicInfo/ko/gold-geopolitics-real-rates-dollar-uncertainty.md` | one-line conclusion labels, checklist density, FAQ density | Rebuild around real rates, DXY, uncertainty, and gold reaction scenarios. |
| 10 | `content/posts/personalFinance/ko/inflation-household-survival-strategy.md` | `중요합니다`, `도움이 됩니다`, summary/checklist labels | Use household spending categories and monthly budget examples instead of generic survival framing. |

Other KO High candidates to keep in queue:

- `content/posts/investingInfo/ko/real-estate-role-in-portfolio-risk-budget.md`
- `content/posts/economicInfo/ko/policy-rate-cut-market-rates.md`
- `content/posts/personalFinance/ko/fire-spending-buckets-essential-choice-insurance.md`
- `content/posts/personalFinance/ko/mortgage-risk-checklist-dsr-variable.md`
- `content/posts/investingInfo/ko/wti-impact-on-korea-kospi.md`

## EN High

| File | Main signal | Suggested scope |
| --- | --- | --- |
| `content/posts/personalFinance/en/fire-sequence-risk-first-5-years.md` | `The key is`, `This guide explains`, `can be useful`, checklist/FAQ structure | Rewrite as withdrawal-sequence stress-test steps with numeric scenarios. |
| `content/posts/economicInfo/en/eu-russia-gas-phaseout-price-channel.md` | `The key is`, `can help you`, checklist/FAQ structure | Use Europe gas price channel examples instead of generic guide language. |
| `content/posts/economicInfo/en/geopolitics-to-usd-liquidity-fx.md` | `The key is`, FAQ/checklist structure, modal-heavy prose | Turn liquidity/fundamental distinction into market-reading rules. |
| `content/posts/economicInfo/en/geopolitics-oil-fx-dashboard.md` | `The key is`, FAQ/checklist structure, dashboard prose still generic | Convert guide prose into dashboard observation order. |

## EN Medium Watchlist

| File | Main signal |
| --- | --- |
| `content/posts/economicInfo/en/war-risk-oil-supply-insurance-shipping.md` | `The key is`, checklist/FAQ structure, modal-heavy prose |
| `content/posts/investingInfo/en/real-estate-role-in-portfolio-risk-budget.md` | `The key is`, modal-heavy allocation guide |
| `content/posts/economicInfo/en/war-theme-investing-price-chain-not-winners.md` | FAQ/checklist structure and modal-heavy prose |
| `content/posts/economicInfo/en/gold-geopolitics-real-rates-dollar-uncertainty.md` | FAQ/checklist structure, modal-heavy macro guide |
| `content/posts/investingInfo/en/bond-etf-duration-drives-returns.md` | `The key is`, FAQ/checklist structure |
| `content/posts/personalFinance/en/dca-vs-lumpsum-decision-rules.md` | `The key is`, checklist/FAQ structure |
| `content/posts/economicInfo/en/tariffs-growth-margins-fx-package-shock.md` | FAQ/checklist structure, modal-heavy prose |
| `content/posts/investingInfo/en/fx-hedge-vs-fx-exposure-korea-3-conditions.md` | FAQ density and modal phrasing |
| `content/posts/economicInfo/en/yield-curve-2s10s-3m10y-recession-reading.md` | `This guide explains`, FAQ structure |
| `content/posts/investingInfo/en/modern-6040-risk-budget.md` | `This article explains`, FAQ structure |
| `content/posts/investingInfo/en/rates-discount-mortgage-demand-apt-prices.md` | `The key is`, checklist/FAQ structure |
| `content/posts/investingInfo/en/seoul-gyeonggi-incheon-risk-budget-framework.md` | FAQ density, modal-heavy Korea housing guide |
| `content/posts/personalFinance/en/fire-assumption-errors-7-fixes.md` | checklist/FAQ structure |
| `content/posts/personalFinance/en/simple-vs-compound.md` | `The key is`, checklist/FAQ structure |
| `content/posts/economicInfo/en/real-rates-and-breakevens.md` | `The key is`, FAQ-heavy market signal guide |

## Batch Target Reclassification

### Batch 1 KO

| File | Current risk | High again? | Residual signal |
| --- | --- | --- | --- |
| `content/posts/personalFinance/ko/how-much-monthly-invest-for-100m.md` | Low | No | Light FAQ/template signal only |
| `content/posts/personalFinance/ko/simple-vs-compound.md` | Medium | No | FAQ/routine labels remain |
| `content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md` | Medium | No | Observation-order labels remain |
| `content/posts/personalFinance/ko/is-dca-better-in-bear-market.md` | Low | No | FAQ structure only |
| `content/posts/economicInfo/ko/geopolitics-to-usd-liquidity-fx.md` | Medium | No | FAQ/checklist density remains |

### Batch 2 KO

| File | Current risk | High again? | Residual signal |
| --- | --- | --- | --- |
| `content/posts/economicInfo/ko/interest-rate-basics.md` | Medium | No | FAQ density and basic explainer structure |
| `content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md` | Medium | No | Checklist/FAQ structure remains |
| `content/posts/investingInfo/ko/modern-6040-risk-budget.md` | Medium | No | FAQ and summary framing |
| `content/posts/economicInfo/ko/tariffs-growth-margins-fx-package-shock.md` | Medium | No | Checklist/FAQ structure |
| `content/posts/investingInfo/ko/cagr-7percent-reality-check.md` | Low | No | Light FAQ/checklist signal |

### Batch 3 KO

| File | Current risk | High again? | Residual signal |
| --- | --- | --- | --- |
| `content/posts/investingInfo/ko/bond-etf-duration-drives-returns.md` | Medium | No | FAQ density remains |
| `content/posts/economicInfo/ko/war-risk-oil-supply-insurance-shipping.md` | Medium | No | `관측 순서` / checklist labels remain |
| `content/posts/investingInfo/ko/sp500-impact-on-korea-kospi.md` | Medium | No | observation-order structure remains |
| `content/posts/economicInfo/ko/yield-curve-2s10s-3m10y-recession-reading.md` | Medium | No | FAQ structure remains |
| `content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md` | Medium | No | routine/check sequence labels remain |

### Batch 4 KO

| File | Current risk | High again? | Residual signal |
| --- | --- | --- | --- |
| `content/posts/economicInfo/ko/real-rates-and-breakevens.md` | Medium | No | FAQ density remains after 4-quadrant rewrite |
| `content/posts/economicInfo/ko/war-theme-investing-price-chain-not-winners.md` | Medium | No | price-chain checklist structure remains |
| `content/posts/personalFinance/ko/dca-vs-lumpsum-decision-rules.md` | Medium | No | FAQ structure remains |
| `content/posts/personalFinance/ko/dca-fx-volatility-decomposition.md` | Medium | No | FAQ structure remains |
| `content/posts/economicInfo/ko/oil-shock-to-usdkrw-korea-transmission.md` | Low/Medium | No | transmission-table structure improved; FAQ remains |

## Repeated Expression Count Changes

| Pattern | Previous refresh after Batch 3 | Current refresh | Change |
| --- | ---: | ---: | ---: |
| `이 글에서는` | 11 | 11 | 0 |
| `알아보겠습니다` | 0 | 0 | 0 |
| `중요합니다` | 46 | 40 | -6 |
| `도움이 됩니다` | 16 | 10 | -6 |
| `핵심은` | 52 | 38 | -14 |
| `확인할 수 있습니다` | 10 | 10 | 0 |
| `볼 수 있습니다` | 16 | 16 | 0 |
| `정리하면` | 4 | 1 | -3 |
| `결론적으로` | 6 | 6 | 0 |
| `단순히` | 21 | 20 | -1 |
| `투자자는 신중하게` | 0 | 0 | 0 |
| `본인의 상황에 맞게` | 0 | 0 | 0 |
| `한 문장으로 정리하면` | 0 | 0 | 0 |
| `The key is` | 20 | 20 | 0 |
| `This guide explains` | 9 | 9 | 0 |
| `This article explains` | 5 | 5 | 0 |
| `can help you` | 3 | 3 | 0 |
| `can be useful` | 3 | 3 | 0 |

Template marker counts:

| Pattern | Previous refresh after Batch 3 | Current refresh | Change |
| --- | ---: | ---: | ---: |
| `FAQ` | 260 | 270 | +10 |
| `FAQPage` | 124 | 129 | +5 |
| `Quick Answer` | 8 | 13 | +5 |
| `Bottom Line` | 16 | 16 | 0 |
| `Checklist` | 74 | 73 | -1 |
| `체크리스트` | 146 | 120 | -26 |
| `여기까지 한 줄 결론` | 39 | 30 | -9 |
| `요약 (10문장)` | 17 | 17 | 0 |
| `범위/한계` | 17 | 14 | -3 |
| `루틴` | 47 | 42 | -5 |
| `점검표` | 13 | 14 | +1 |
| `점검 순서` | 10 | 10 | 0 |
| `관측 순서` | 11 | 21 | +10 |

Note: FAQ and FAQPage counts increased partly because five new DSR/LTV cluster posts were added and because structured data strings are counted together with visible body text.

## FAQ / Template-Heavy Watchlist

| File | Lang | Risk | Signal |
| --- | --- | --- | --- |
| `content/posts/economicInfo/ko/hormuz-risk-oil-insurance-freight-premium.md` | ko | High | one-line conclusion labels, checklist/routine density, FAQ |
| `content/posts/economicInfo/ko/eu-russia-gas-phaseout-price-channel.md` | ko | High | checklist density, repeated summary labels, FAQ |
| `content/posts/personalFinance/ko/personal-finance-3pillars.md` | ko | High | routine/checklist density, FAQ |
| `content/posts/personalFinance/ko/fire-sequence-risk-first-5-years.md` | ko | High | one-line conclusion labels, routine/checklist density, FAQ |
| `content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md` | ko | High | repeated conclusion labels and FAQ |
| `content/posts/personalFinance/ko/rent-jeonse-buy-cashflow-opportunity-cost.md` | ko | High | one-line conclusion labels and 15 FAQ-style questions |
| `content/posts/personalFinance/ko/dca-step-up-ruleset.md` | ko | High | checklist/routine labels and FAQ |
| `content/posts/personalFinance/en/fire-sequence-risk-first-5-years.md` | en | High | checklist/FAQ structure and modal-heavy prose |
| `content/posts/economicInfo/en/geopolitics-to-usd-liquidity-fx.md` | en | High | checklist/FAQ structure and modal-heavy prose |
| `content/posts/economicInfo/en/eu-russia-gas-phaseout-price-channel.md` | en | High | checklist/FAQ structure and modal-heavy prose |

## ToolCta Raw Tag Follow-up

| Check | Result |
| --- | --- |
| `rg -n "<ToolCta" content/posts` | PASS: no matches |
| `npm.cmd run build` | PASS |
| `rg -n "<toolcta" .next/server/pages` | PASS: no matches |
| Former raw-tag file sample `/tools/` link check | PASS: all 25 previously affected files still have at least one `/tools/` link |

Former raw-tag file sample summary:

- 25 files from `reports/markdown-toolcta-raw-tag-audit.md` were checked.
- Minimum `/tools/` link count: 1
- No sampled file lost all calculator links.
- Files where a raw tag was removed because a nearby calculator link already existed still retain visible `/tools/` links.

## Verification

| Command / check | Result |
| --- | --- |
| `content/posts/**/*.md` scan | PASS: 147 markdown files scanned, 0 excluded |
| `rg -n "<ToolCta" content/posts` | PASS: no matches |
| `npm.cmd run build` | PASS |
| `rg -n "<toolcta" .next/server/pages` | PASS: no matches |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `git diff --check` | PASS: CRLF warning only |

Build/postbuild generated sitemap artifacts and `reports/seo-channel-split-url-check.md`; those generated files were restored after verification because they are outside this report-only task.

## Next Suggested Queue

Recommended KO tone queue:

1. `content/posts/economicInfo/ko/hormuz-risk-oil-insurance-freight-premium.md`
2. `content/posts/economicInfo/ko/eu-russia-gas-phaseout-price-channel.md`
3. `content/posts/personalFinance/ko/personal-finance-3pillars.md`
4. `content/posts/personalFinance/ko/fire-sequence-risk-first-5-years.md`
5. `content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md`

Recommended EN tone queue:

1. `content/posts/personalFinance/en/fire-sequence-risk-first-5-years.md`
2. `content/posts/economicInfo/en/eu-russia-gas-phaseout-price-channel.md`
3. `content/posts/economicInfo/en/geopolitics-to-usd-liquidity-fx.md`
4. `content/posts/economicInfo/en/geopolitics-oil-fx-dashboard.md`
5. `content/posts/economicInfo/en/war-risk-oil-supply-insurance-shipping.md`

Rewrite principle:

- Do not remove FAQ blocks mechanically.
- Replace repeated labels and section endings with numeric examples, calculator inputs, dashboard observation order, or concrete exception cases.
- Keep SEO metadata, canonical, slug, hreflang, sitemap, robots, and routing untouched unless a separate SEO task requires it.
