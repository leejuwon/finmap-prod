# Finmap AI-like Prose Audit Refresh After KO Batch 3

Audit date: 2026-06-23

Scope:

- Checked `content/posts/**/*.md`
- KO and EN markdown files included
- Draft/private exclusion check: no `draft: true`, `private: true`, `hidden: true`, or `published: false` files were found
- Checked recent `dsrLtv` / `dsr-ltv` tool label rendering after the DSR/LTV mapping fix
- This report does not assert authorship. It flags **AI-like tone risk**, **generic prose**, and **template-heavy structure** candidates only.
- No content, sitemap, robots, SeoHead, canonical, hreflang, or routing files were modified during this audit.

## Summary

| Metric | Previous refresh 2026-06-19 | Current refresh 2026-06-23 | Change |
| --- | ---: | ---: | ---: |
| Total scanned files | 142 | 142 | 0 |
| Excluded files | 0 | 0 | 0 |
| High candidates | 37 | 21 | -16 |
| Medium candidates | 55 | 72 | +17 |
| Low candidates | 25 | 42 | +17 |
| No material signal | 25 | 7 | -18 |

Interpretation:

- KO Batch 1/2/3/3.1 reduced the strongest phrase-repetition risk. The clearest improvement is that the former Batch 3 TOP 5 no longer dominate the KO High queue.
- Remaining risk is now less about generic sentences and more about **repeated SEO article scaffolding**: FAQ density, checklist labels, routine labels, and repeated "one-line conclusion" style blocks.
- The current scan is slightly stricter on template markers than the prior refresh. For that reason, the most meaningful movement is the drop in High candidates, while Medium/Low should be treated as watchlist buckets rather than urgent rewrite verdicts.

## Current Risk Counts By Language

| Lang | High | Medium | Low | No material signal |
| --- | ---: | ---: | ---: | ---: |
| KO | 17 | 39 | 13 | 2 |
| EN | 4 | 33 | 29 | 5 |
| Total | 21 | 72 | 42 | 7 |

## Batch 1 KO Reclassification

| File | Current score | Current risk | Main residual signal |
| --- | ---: | --- | --- |
| `content/posts/personalFinance/ko/how-much-monthly-invest-for-100m.md` | 3 | Low | FAQ/FAQPage structure only; phrase risk remains low. |
| `content/posts/personalFinance/ko/simple-vs-compound.md` | 13 | Medium | FAQ 8, `루틴`, `점검표`, and FAQPage structure remain visible. |
| `content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md` | 15 | Medium | `점검 순서` / `관측 순서` labels are still frequent, but raw generic phrase risk is low. |
| `content/posts/personalFinance/ko/is-dca-better-in-bear-market.md` | 3 | Low | FAQ/FAQPage structure only; calculator prose remains improved. |
| `content/posts/economicInfo/ko/geopolitics-to-usd-liquidity-fx.md` | 17 | Medium | `점검표` and 8 FAQ-style questions remain; one `결론적으로` remains. |

## Batch 2 KO Reclassification

| File | Current score | Current risk | Main residual signal |
| --- | ---: | --- | --- |
| `content/posts/economicInfo/ko/interest-rate-basics.md` | 8 | Medium | FAQ, `요약 (10문장)`, and `루틴` labels remain. |
| `content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md` | 15 | Medium | `체크리스트` density and 8 FAQ questions remain. |
| `content/posts/investingInfo/ko/modern-6040-risk-budget.md` | 10 | Medium | 8 FAQ questions and summary-style structure remain. |
| `content/posts/economicInfo/ko/tariffs-growth-margins-fx-package-shock.md` | 16 | Medium | `체크리스트` appears frequently; 8 FAQ questions remain. |
| `content/posts/investingInfo/ko/cagr-7percent-reality-check.md` | 3 | Low | Only light FAQ/checklist summary markers remain. |

## Batch 3 KO Reclassification

| File | Current score | Current risk | Main residual signal |
| --- | ---: | --- | --- |
| `content/posts/investingInfo/ko/bond-etf-duration-drives-returns.md` | 10 | Medium | 8 FAQ questions remain; phrase repetition is much lower than before. |
| `content/posts/economicInfo/ko/war-risk-oil-supply-insurance-shipping.md` | 15 | Medium | `관측 순서` / `체크리스트` labels and 8 FAQ questions remain. |
| `content/posts/investingInfo/ko/sp500-impact-on-korea-kospi.md` | 8 | Medium | `루틴` / `관측 순서` labels remain, but top structure is less template-heavy after polish. |
| `content/posts/economicInfo/ko/yield-curve-2s10s-3m10y-recession-reading.md` | 10 | Medium | 8 FAQ questions and `자주 헷갈리는` style label remain. |
| `content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md` | 13 | Medium | `루틴`, `점검 순서`, and 8 FAQ questions remain; DSR/LTV CTA consistency is fixed. |

## Remaining KO High TOP 10

| Rank | File | Score | Main signal | Recommended rewrite scope |
| ---: | --- | ---: | --- | --- |
| 1 | `content/posts/economicInfo/ko/real-rates-and-breakevens.md` | 28 | `중요합니다`, `도움이 됩니다`, `핵심은`, `정리하면`, 12 FAQ-style questions | Replace summary labels with real-rate / breakeven signal examples and compress FAQ. |
| 2 | `content/posts/economicInfo/ko/war-theme-investing-price-chain-not-winners.md` | 28 | `핵심은`, 7 checklist hits, repeated one-line conclusion blocks | Recast as event-to-price-chain observation rules. |
| 3 | `content/posts/personalFinance/ko/dca-vs-lumpsum-decision-rules.md` | 27 | `핵심은`, 6 checklist hits, 8 FAQ questions | Convert decision rules into input-based if/then table. |
| 4 | `content/posts/personalFinance/ko/dca-fx-volatility-decomposition.md` | 25 | `도움이 됩니다`, `핵심은`, FAQ/checklist/routine structure | Add DCA + FX numerical scenarios and shorten repeated section closures. |
| 5 | `content/posts/economicInfo/ko/oil-shock-to-usdkrw-korea-transmission.md` | 24 | `중요합니다`, `핵심은`, 9 checklist hits | Reframe as oil shock to USD/KRW to Korea-market transmission sequence. |
| 6 | `content/posts/economicInfo/ko/eu-russia-gas-phaseout-price-channel.md` | 23 | `도움이 됩니다`, `핵심은`, 8 checklist hits | Replace broad checklist prose with gas-price channel examples. |
| 7 | `content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md` | 23 | `핵심은`, one-line conclusion blocks, 8 FAQ questions | Use mortgage-rate / volume / affordability trigger table. |
| 8 | `content/posts/economicInfo/ko/hormuz-risk-oil-insurance-freight-premium.md` | 22 | `중요합니다`, `핵심은`, `단순히`, checklist/conclusion density | Make it a Hormuz risk signal map: oil, freight, insurance, FX. |
| 9 | `content/posts/personalFinance/ko/fire-spending-buckets-essential-choice-insurance.md` | 22 | `이 글에서는`, `핵심은`, repeated one-line conclusion blocks, 8 FAQ questions | Rewrite around spending buckets and insurance choice examples. |
| 10 | `content/posts/personalFinance/ko/dca-step-up-ruleset.md` | 21 | `핵심은`, checklist/conclusion blocks, 8 FAQ questions | Turn step-up rules into amount/frequency examples. |

## EN High

| File | Score | Main signal | Suggested scope |
| --- | ---: | --- | --- |
| `content/posts/personalFinance/en/fire-sequence-risk-first-5-years.md` | 22 | `The key is`, `This guide explains`, `can be useful`, 8 FAQ questions, modal count 51 | Rewrite as withdrawal-sequence stress-test steps. |
| `content/posts/economicInfo/en/eu-russia-gas-phaseout-price-channel.md` | 19 | `The key is`, `can help you`, 8 FAQ questions, modal count 56 | Use Europe gas price channel examples instead of generic guide language. |
| `content/posts/economicInfo/en/geopolitics-to-usd-liquidity-fx.md` | 19 | `The key is`, FAQ/checklist structure, modal count 54 | Turn liquidity/fundamental distinction into market-reading rules. |
| `content/posts/economicInfo/en/geopolitics-oil-fx-dashboard.md` | 18 | `The key is`, 8 FAQ questions, modal count 55 | Convert guide prose into dashboard observation order. |

## EN Medium Watchlist

| File | Score | Main signal |
| --- | ---: | --- |
| `content/posts/economicInfo/en/war-risk-oil-supply-insurance-shipping.md` | 17 | `The key is`, 9 FAQ questions, modal count 50 |
| `content/posts/investingInfo/en/real-estate-role-in-portfolio-risk-budget.md` | 17 | `The key is`, 8 FAQ questions, modal count 71 |
| `content/posts/economicInfo/en/war-theme-investing-price-chain-not-winners.md` | 16 | 9 FAQ questions, modal count 64 |
| `content/posts/economicInfo/en/gold-geopolitics-real-rates-dollar-uncertainty.md` | 15 | 8 FAQ questions, modal count 63 |
| `content/posts/investingInfo/en/bond-etf-duration-drives-returns.md` | 15 | `The key is`, 8 FAQ questions, modal count 41 |
| `content/posts/personalFinance/en/dca-vs-lumpsum-decision-rules.md` | 15 | `The key is`, checklist/FAQ structure |
| `content/posts/economicInfo/en/tariffs-growth-margins-fx-package-shock.md` | 14 | 8 FAQ questions, modal count 66 |
| `content/posts/investingInfo/en/fx-hedge-vs-fx-exposure-korea-3-conditions.md` | 14 | 11 FAQ questions |
| `content/posts/economicInfo/en/yield-curve-2s10s-3m10y-recession-reading.md` | 13 | `This guide explains`, 8 FAQ questions |
| `content/posts/investingInfo/en/modern-6040-risk-budget.md` | 13 | `This article explains`, 8 FAQ questions, modal count 45 |
| `content/posts/investingInfo/en/rates-discount-mortgage-demand-apt-prices.md` | 13 | `The key is`, 8 FAQ questions |
| `content/posts/investingInfo/en/seoul-gyeonggi-incheon-risk-budget-framework.md` | 13 | 8 FAQ questions, modal count 58 |
| `content/posts/personalFinance/en/fire-assumption-errors-7-fixes.md` | 13 | checklist/FAQ structure |
| `content/posts/personalFinance/en/simple-vs-compound.md` | 13 | `The key is`, checklist/FAQ structure |
| `content/posts/economicInfo/en/real-rates-and-breakevens.md` | 12 | `The key is`, 8 FAQ questions, modal count 50 |
| `content/posts/personalFinance/en/dca-fx-volatility-decomposition.md` | 12 | `The key is`, checklist/FAQ structure |
| `content/posts/personalFinance/en/fire-3-numbers-spending-horizon-withdrawal.md` | 12 | 8 FAQ questions, modal count 43 |
| `content/posts/personalFinance/en/fire-spending-buckets-essential-choice-insurance.md` | 12 | checklist/FAQ structure |
| `content/posts/personalFinance/en/rent-jeonse-buy-cashflow-opportunity-cost.md` | 12 | 8 FAQ questions, modal count 41 |
| `content/posts/personalFinance/en/dca-step-up-ruleset.md` | 11 | checklist/FAQ structure |

## Repeated Expression Count Changes

KO comparison uses the target phrase mapping from the earlier report. The previous report had mojibake in several KO labels, so this table maps those counts back to the intended Korean phrases.

| Pattern | Previous refresh | Current refresh | Change |
| --- | ---: | ---: | ---: |
| `이 글에서는` | 11 | 11 | 0 |
| `알아보겠습니다` | 0 | 0 | 0 |
| `중요합니다` | 56 | 46 | -10 |
| `도움이 됩니다` | 23 | 16 | -7 |
| `핵심은` | 65 | 52 | -13 |
| `확인할 수 있습니다` | 10 | 10 | 0 |
| `볼 수 있습니다` | 17 | 16 | -1 |
| `정리하면` | 6 | 4 | -2 |
| `결론적으로` | 8 | 6 | -2 |
| `단순히` | 26 | 21 | -5 |
| `투자자는 신중하게` | 0 | 0 | 0 |
| `본인의 상황에 맞게` | 0 | 0 | 0 |
| `한 문장으로 정리하면` | 0 | 0 | 0 |
| `The key is` | 22 | 20 | -2 |
| `This guide explains` | 10 | 9 | -1 |
| `This article explains` | 5 | 5 | 0 |
| `can help you` | 3 | 3 | 0 |
| `can be useful` | 3 | 3 | 0 |
| EN modal family `can/should/may/could/might` | 2,209 | 2,172 | -37 |

Current template marker counts:

| Pattern | Current count |
| --- | ---: |
| `FAQ` | 260 |
| `FAQPage` | 124 |
| `Quick Answer` | 8 |
| `Bottom Line` | 16 |
| `Checklist` | 74 |
| `체크리스트` | 146 |
| `오해 교정` | 7 |
| `자주 헷갈리는` | 2 |
| `여기까지 한 줄 결론` | 39 |
| `요약 (10문장)` | 17 |
| `범위/한계` | 17 |
| `루틴` | 47 |
| `자주 묻는 질문` | 13 |
| `점검표` | 13 |
| `점검 순서` | 10 |
| `관측 순서` | 11 |

Note: Template marker counts include visible Markdown and JSON-LD strings. They are useful for triage, but not every count is visible body prose.

## FAQ / Template-Heavy Watchlist

| File | Lang | Risk | Score | Signal |
| --- | --- | --- | ---: | --- |
| `content/posts/economicInfo/ko/real-rates-and-breakevens.md` | ko | High | 28 | 12 FAQ-style questions, checklist/conclusion labels. |
| `content/posts/economicInfo/ko/war-theme-investing-price-chain-not-winners.md` | ko | High | 28 | 8 FAQ questions, 7 checklist hits, repeated one-line conclusion blocks. |
| `content/posts/personalFinance/ko/dca-vs-lumpsum-decision-rules.md` | ko | High | 27 | 8 FAQ questions, 6 checklist hits. |
| `content/posts/personalFinance/ko/dca-fx-volatility-decomposition.md` | ko | High | 25 | 8 FAQ questions and repeated FAQ/checklist/routine structure. |
| `content/posts/economicInfo/ko/oil-shock-to-usdkrw-korea-transmission.md` | ko | High | 24 | 9 checklist hits and repeated macro-chain labels. |
| `content/posts/economicInfo/ko/eu-russia-gas-phaseout-price-channel.md` | ko | High | 23 | 8 FAQ questions, 8 checklist hits. |
| `content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md` | ko | High | 23 | 8 FAQ questions and repeated one-line conclusion labels. |
| `content/posts/economicInfo/ko/hormuz-risk-oil-insurance-freight-premium.md` | ko | High | 22 | 5 checklist hits and repeated conclusion labels. |
| `content/posts/personalFinance/en/fire-sequence-risk-first-5-years.md` | en | High | 22 | 8 FAQ questions, checklist structure, modal count 51. |
| `content/posts/personalFinance/ko/fire-spending-buckets-essential-choice-insurance.md` | ko | High | 22 | 8 FAQ questions and repeated one-line conclusion labels. |
| `content/posts/personalFinance/ko/dca-step-up-ruleset.md` | ko | High | 21 | 8 FAQ questions and checklist/conclusion labels. |
| `content/posts/personalFinance/ko/fire-sequence-risk-first-5-years.md` | ko | High | 21 | 8 FAQ questions and repeated `핵심은`. |
| `content/posts/economicInfo/en/eu-russia-gas-phaseout-price-channel.md` | en | High | 19 | 8 FAQ questions, checklist structure, modal count 56. |
| `content/posts/economicInfo/en/geopolitics-to-usd-liquidity-fx.md` | en | High | 19 | 8 FAQ questions, checklist structure, modal count 54. |
| `content/posts/economicInfo/en/geopolitics-oil-fx-dashboard.md` | en | High | 18 | 8 FAQ questions, modal count 55. |

## DSR/LTV Tool Metadata and Rendering Check

### `tool: ["dsrLtv"]` usage

| File | Usage |
| --- | --- |
| `content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md` | `tool: ["dsrLtv"]` |
| `content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md` | `tool: ["dsrLtv","goal"]` |
| `content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md` | `tool: ["dsrLtv"]` |

### `tool: ["dsr-ltv"]` usage

| File | Usage |
| --- | --- |
| `content/posts/personalFinance/ko/cash-100m-200m-300m-apartment-budget.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/en/cash-100m-200m-300m-apartment-budget.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/en/dsr-40-income-loan-limit-table.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/ko/dsr-pass-ltv-cash-bottleneck.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/en/dsr-pass-ltv-cash-bottleneck.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/ko/interest-rate-1p-loan-limit-impact.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/en/interest-rate-1p-loan-limit-impact.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/ko/mortgage-risk-checklist-dsr-variable.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/en/mortgage-risk-checklist-dsr-variable.md` | `tool: ["dsr-ltv"]` |

### Built HTML visible-text check

The check stripped `<script>`, `<style>`, and `<noscript>` before searching text. Raw ids may still exist inside serialized page data, but they were not visible in the rendered text layer.

| Area | Samples checked | Raw `dsrLtv` / `dsr-ltv` visible text | Expected label result |
| --- | ---: | --- | --- |
| Post detail HTML | 13 | NO | KO posts show `DSR/LTV 계산기`; EN posts show `DSR/LTV Calculator`. |
| Category HTML | 4 | NO | KO category samples show `DSR/LTV 계산기`; EN personalFinance category shows `DSR/LTV Calculator`. |

Checked category HTML:

- `.next/server/pages/ko/category/personalFinance.html`
- `.next/server/pages/ko/category/investingInfo.html`
- `.next/server/pages/ko/category/economicInfo.html`
- `.next/server/pages/en/category/personalFinance.html`

Checked representative detail HTML:

- `.next/server/pages/ko/posts/economicInfo/geopolitics-oil-fx-dashboard.html`
- `.next/server/pages/ko/posts/personalFinance/apt-dashboard-home-goal-roadmap.html`
- `.next/server/pages/ko/posts/investingInfo/seoul-gyeonggi-incheon-risk-budget-framework.html`
- KO/EN detail HTML for the 10 `dsr-ltv` posts listed above

## Verification

| Command / check | Result |
| --- | --- |
| `content/posts/**/*.md` scan | PASS. 142 markdown files scanned, 0 excluded. |
| `npm.cmd run build` | PASS. Next build compiled successfully and generated 209/209 static pages. |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS. Sitemap policy PASS, EN required URLs 16/16, sampled URLs PASS. |
| DSR/LTV visible HTML text check | PASS. No raw `dsrLtv` or `dsr-ltv` visible in sampled category/detail text. |
| Build/postbuild sitemap output | `public/en/sitemap.xml`, `public/sitemap-0.xml`, `public/sitemap-en.xml`, and `public/sitemap-ko.xml` were regenerated by build and restored afterward. |
| SEO verify report output | `reports/seo-channel-split-url-check.md` was regenerated by the SEO verification script and restored afterward. |
| `git diff --check` | Recorded after report creation. |

## Next Suggested Queue

Recommended KO Batch 4 candidates:

1. `content/posts/economicInfo/ko/real-rates-and-breakevens.md`
2. `content/posts/economicInfo/ko/war-theme-investing-price-chain-not-winners.md`
3. `content/posts/personalFinance/ko/dca-vs-lumpsum-decision-rules.md`
4. `content/posts/personalFinance/ko/dca-fx-volatility-decomposition.md`
5. `content/posts/economicInfo/ko/oil-shock-to-usdkrw-korea-transmission.md`

Recommended EN tone pass candidates:

1. `content/posts/personalFinance/en/fire-sequence-risk-first-5-years.md`
2. `content/posts/economicInfo/en/eu-russia-gas-phaseout-price-channel.md`
3. `content/posts/economicInfo/en/geopolitics-to-usd-liquidity-fx.md`
4. `content/posts/economicInfo/en/geopolitics-oil-fx-dashboard.md`
5. `content/posts/economicInfo/en/war-risk-oil-supply-insurance-shipping.md`

Rewrite principle:

- Do not remove FAQ blocks mechanically.
- Prioritize replacing repeated labels and section endings with numeric examples, calculator inputs, dashboard observation order, or concrete exception cases.
- Keep SEO metadata, canonical, slug, hreflang, sitemap, robots, and routing untouched unless a separate SEO task requires it.
