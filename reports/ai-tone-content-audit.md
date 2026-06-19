# Finmap AI-like Prose Audit

Audit date: 2026-06-19

Scope:

- Checked `content/posts/**/*.md`
- KO and EN markdown files included
- Draft/private exclusion check: no `draft:`, `private:`, `hidden:`, or `published: false` files were found in the scanned markdown set
- This report does not assert authorship. It flags **AI-like tone risk**, **generic prose**, and **template-heavy prose** candidates for future rewrite review.

Method:

- Combined lexical scan and manual review of top candidates.
- Signals included generic openers, repeated summary phrases, repeated modal phrasing, lack of action-specific wording, and heavy reuse of Quick Answer / Checklist / FAQ / Bottom Line structures.
- Risk level is a rewrite-priority signal, not a quality verdict.

## Summary

- Total scanned files: 142
- Excluded files: 0
- High candidates: 49
- Medium candidates: 50
- Low candidates: 27
- No material signal: 16

Priority counts are based on a conservative heuristic scan. The tables below list representative candidates ordered by rewrite urgency, not every flagged file.

### Recommended TOP 10

1. `content/posts/personalFinance/ko/how-much-monthly-invest-for-100m.md` - generic intro and repeated "can check/important" phrasing despite good numeric content.
2. `content/posts/personalFinance/ko/simple-vs-compound.md` - "핵심은" repeated heavily; FAQ count and summary rhythm feel templated.
3. `content/posts/personalFinance/en/fire-sequence-risk-first-5-years.md` - strong topic, but EN prose overuses "can/should/may" and guide-style framing.
4. `content/posts/personalFinance/en/large-apartment-complex-households-price-stability.md` - generic article/disclaimer phrasing plus repeated conditional language.
5. `content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md` - repeated "도움이 됩니다/핵심은" makes otherwise specific chain analysis feel formulaic.
6. `content/posts/personalFinance/ko/is-dca-better-in-bear-market.md` - repeated "확인할 수 있습니다/볼 수 있습니다" weakens action clarity.
7. `content/posts/economicInfo/ko/geopolitics-to-usd-liquidity-fx.md` - high concept is distinctive, but recurring "핵심은/도움이 됩니다" softens the voice.
8. `content/posts/personalFinance/en/how-to-read-apartment-transaction-prices.md` - good topic, but "This article/guide explains" and modal repetition should be tightened.
9. `content/posts/economicInfo/ko/interest-rate-basics.md` - repeated "핵심은/정리하면/중요합니다" suggests a rewrite pass for transitions.
10. `content/posts/economicInfo/en/inflation-rate-basics.md` - recently differentiated by intent, but still has high EN modal density; review after search recrawl.

## High Priority

| File | Lang | Category | Slug | Risk | Main reason | Example phrases | Recommended rewrite scope |
|---|---|---|---|---|---|---|---|
| `content/posts/personalFinance/ko/how-much-monthly-invest-for-100m.md` | ko | personalFinance | how-much-monthly-invest-for-100m | High | Generic intro and repeated "확인/볼 수 있습니다" phrasing; action is calculator-based but prose leans explanatory. | "이 글에서는 목표 금액을 세후 최종 자산으로 보고...", "유지 가능성이 중요합니다", "점검할 수 있습니다" | Rewrite intro and CTA paragraphs; replace soft verbs with direct calculator steps and one concrete reader scenario. |
| `content/posts/personalFinance/ko/simple-vs-compound.md` | ko | personalFinance | simple-vs-compound | High | "핵심은" appears repeatedly and FAQ/summary rhythm feels formulaic. | "어디서 재투자(복리)가 일어나느냐가 더 중요합니다", "핵심은 '기간'입니다" | Tighten transitions; vary section conclusions; merge repetitive FAQ items. |
| `content/posts/personalFinance/en/fire-sequence-risk-first-5-years.md` | en | personalFinance | fire-sequence-risk-first-5-years | High | EN guide framing and modal verbs are dense, making a strong FIRE topic sound generic. | "This guide explains sequence-of-returns risk...", "can be useful", "The key is..." | Rewrite intro, decision rules, and FAQ answers into sharper stress-test instructions. |
| `content/posts/personalFinance/en/large-apartment-complex-households-price-stability.md` | en | personalFinance | large-apartment-complex-households-price-stability | High | Generic article wording and frequent can/should/may phrases dilute Korea apartment-specific insight. | "This article explains data interpretation...", "can/should/may count 45" | Reframe around transaction sample size, household count thresholds, and dashboard reading steps. |
| `content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md` | ko | economicInfo | geopolitics-oil-fx-dashboard | High | Repeated "도움이 됩니다" and "핵심은" make the chain analysis feel templated. | "헷갈리면... 도움이 됩니다", "핵심은 '집값 방향' 예측이 아니라..." | Rewrite connector paragraphs; use event-specific trigger examples instead of generic usefulness claims. |
| `content/posts/personalFinance/ko/is-dca-better-in-bear-market.md` | ko | personalFinance | is-dca-better-in-bear-market | High | Repeated "확인할 수 있습니다/볼 수 있습니다" makes calculator usage feel passive. | "중간에 겪는 하락 부담을 이해하는 데 도움이 됩니다", "목표 달성 여부와 부족액을 볼 수 있어..." | Convert passive calculator mentions into step-by-step scenarios and one bear-market table narrative. |
| `content/posts/economicInfo/ko/geopolitics-to-usd-liquidity-fx.md` | ko | economicInfo | geopolitics-to-usd-liquidity-fx | High | Distinctive thesis, but repeated "핵심은/도움이 됩니다" weakens editorial voice. | "퍼즐 조각을 맞추는 데 도움이 됩니다", "여기서 핵심은 단어 선택입니다" | Preserve concept; rewrite repeated conclusions as market-reading rules with data triggers. |
| `content/posts/personalFinance/en/how-to-read-apartment-transaction-prices.md` | en | personalFinance | how-to-read-apartment-transaction-prices | High | "This article/guide explains" plus high modal density; EN tone can feel instructional but generic. | "This article explains data interpretation", "This guide explains", "can/should/may count 41" | Rewrite intro and FAQ to focus on median/average/unit-price mistakes with concrete apartment examples. |
| `content/posts/economicInfo/ko/interest-rate-basics.md` | ko | economicInfo | interest-rate-basics | High | Repeats "중요합니다/도움이 됩니다/핵심은/정리하면"; basics article risks sounding like a template. | "현금흐름 안정성이 더 중요합니다", "만기별 금리(곡선)을 같이 보는 습관이 도움이 됩니다" | Rewrite section endings; keep explanation but add reader-specific actions for deposits, loans, and bonds. |
| `content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md` | ko | investingInfo | seoul-gyeonggi-incheon-risk-budget-framework | High | Strong concept but repeated "핵심은" and "정리하면" create a formulaic cadence. | "이때 핵심은 수익률이 아니라 유동성 예산입니다", "한 문장으로 정리하면..." | Vary conclusions; add Seoul/Gyeonggi/Incheon example cases instead of repeated abstract summaries. |
| `content/posts/investingInfo/ko/modern-6040-risk-budget.md` | ko | investingInfo | modern-6040-risk-budget | High | Repeated "중요합니다/핵심은" and many FAQ items can feel over-templated. | "조정하는 게 중요합니다", "60/40의 핵심은..." | Reduce FAQ repetition; rewrite intro and risk-budget explanation with one portfolio example. |
| `content/posts/economicInfo/ko/tariffs-growth-margins-fx-package-shock.md` | ko | economicInfo | tariffs-growth-margins-fx-package-shock | High | Repeated "핵심은" around an otherwise specific macro chain. | "국내 투자자에게 특히 중요합니다", "관세 충격의 핵심은..." | Keep macro chain; rewrite repeated key-point lines as checklist of tariff shock variables. |
| `content/posts/investingInfo/ko/cagr-7percent-reality-check.md` | ko | investingInfo | cagr-7percent-reality-check | High | Calculator topic is concrete, but repeated "중요합니다/확인할 수 있습니다/볼 수 있습니다" softens the read. | "저축 증가 속도가 더 중요합니다", "직관적으로 확인할 수 있습니다" | Rewrite with one actual CAGR comparison workflow and reduce generic importance claims. |
| `content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md` | ko | investingInfo | rates-discount-mortgage-demand-apt-prices | High | Repeated "핵심은" and "도움이 됩니다"; table purpose is good but prose drifts toward meta explanation. | "습관을 교정하는 데 도움이 됩니다", "핵심은 '금리'가 아니라..." | Convert meta explanation into dashboard trigger examples: mortgage rate, volume, listing gap, affordability. |
| `content/posts/economicInfo/en/inflation-rate-basics.md` | en | economicInfo | inflation-rate-basics | High | Market-reaction intent is now clearer, but modal density remains high. | "can/should/may count 42" | Later polish pass after index recrawl; tighten market reaction checklist and FAQ answer verbs. |
| `content/posts/investingInfo/en/usd-krw-exchange-rate-and-kospi.md` | en | investingInfo | usd-krw-exchange-rate-and-kospi | High | EN summary-guide wording risks sounding generic despite Korea-market topic. | "This guide explains how USD/KRW connects...", "The key is..." | Rewrite opening and summary bullets as USD/KRW-to-KOSPI transmission cases. |

## Medium Priority

| File | Lang | Category | Slug | Risk | Main reason | Example phrases | Recommended rewrite scope |
|---|---|---|---|---|---|---|---|
| `content/posts/investingInfo/en/rates-discount-mortgage-demand-apt-prices.md` | en | investingInfo | rates-discount-mortgage-demand-apt-prices | Medium | Good Korea-specific frame, but "The key is" and modal phrasing repeat. | "The key is what flips first..." | Rewrite key-rule paragraphs into concise trigger tables. |
| `content/posts/investingInfo/en/fx-hedge-vs-fx-exposure-korea-3-conditions.md` | en | investingInfo | fx-hedge-vs-fx-exposure-korea-3-conditions | Medium | High can/should/may density; few tables despite decision-rule intent. | "can/should/may count 31" | Add explicit hedge/unhedged decision table; reduce modal verbs. |
| `content/posts/economicInfo/ko/yield-curve-2s10s-3m10y-recession-reading.md` | ko | economicInfo | yield-curve-2s10s-3m10y-recession-reading | Medium | Repeats "중요합니다/도움이 됩니다/핵심은" in explanatory transitions. | "타이밍보다 지속성이 중요합니다", "한국 체감으로 번역할 때 특히 도움이 됩니다" | Rewrite connector blocks with signal interpretation examples. |
| `content/posts/personalFinance/ko/cash-100m-200m-300m-apartment-budget.md` | ko | personalFinance | cash-100m-200m-300m-apartment-budget | Medium | Numeric content is strong, but "확인할 수 있습니다" repeats in calculator CTA areas. | "바로 확인할 수 있습니다" | Polish CTA paragraphs only; keep tables. |
| `content/posts/economicInfo/en/gold-geopolitics-real-rates-dollar-uncertainty.md` | en | economicInfo | gold-geopolitics-real-rates-dollar-uncertainty | Medium | High modal density across macro interpretation. | "can/should/may count 64" | Reduce hedging in FAQ and scenario interpretation; keep uncertainty disclaimer. |
| `content/posts/economicInfo/en/hormuz-risk-oil-insurance-freight-premium.md` | en | economicInfo | hormuz-risk-oil-insurance-freight-premium | Medium | High modal density, likely from cautious scenario language. | "can/should/may count 46" | Convert cautious prose into shipping-premium signal map. |
| `content/posts/economicInfo/en/oil-shock-to-usdkrw-korea-transmission.md` | en | economicInfo | oil-shock-to-usdkrw-korea-transmission | Medium | Frequent can/should/may in Korea FX transmission guide. | "can/should/may count 58" | Rewrite chain explanation as numbered paths with concrete data signals. |
| `content/posts/economicInfo/en/tariffs-growth-margins-fx-package-shock.md` | en | economicInfo | tariffs-growth-margins-fx-package-shock | Medium | High modal density; title is specific but body may over-qualify. | "can/should/may count 67" | Tighten scenario sections and reduce repeated caution language. |
| `content/posts/economicInfo/en/war-theme-investing-price-chain-not-winners.md` | en | economicInfo | war-theme-investing-price-chain-not-winners | Medium | Frequent can/should/may and many FAQ-like explanations. | "can/should/may count 63" | Emphasize price-chain examples and remove redundant warnings. |
| `content/posts/investingInfo/en/seoul-gyeonggi-incheon-risk-budget-framework.md` | en | investingInfo | seoul-gyeonggi-incheon-risk-budget-framework | Medium | Strong local angle but EN prose has high modal density. | "can/should/may count 57" | Add region-specific mini cases; reduce generic risk-budget wording. |
| `content/posts/personalFinance/en/high-rate-debt-vs-invest-threshold-rule.md` | en | personalFinance | high-rate-debt-vs-invest-threshold-rule | Medium | Decision topic is useful, but repeated modal verbs create generic advice tone. | "can/should/may count 40" | Rewrite threshold rule as if/then decision table with one borrower example. |
| `content/posts/economicInfo/en/yield-curve-2s10s-3m10y-recession-reading.md` | en | economicInfo | yield-curve-2s10s-3m10y-recession-reading | Medium | "This guide explains" appears in metadata/body and creates guide-template feel. | "This guide explains why..." | Rewrite intro and meta-like sentences into a direct comparison of 2s10s vs 3m10y. |
| `content/posts/economicInfo/ko/real-rates-and-breakevens.md` | ko | economicInfo | real-rates-and-breakevens | Medium | Repeated "중요합니다/도움이 됩니다/정리하면"; FAQ echoes body. | "숫자 자체보다 방향과 변화 속도가 더 중요합니다" | Rewrite FAQ answers to use market-dashboard use cases. |
| `content/posts/personalFinance/en/apartment-transaction-volume-decline-meaning.md` | en | personalFinance | apartment-transaction-volume-decline-meaning | Medium | Modal density plus repeated signal interpretation wording. | "can/should/may count 39" | Add specific before/after volume examples; shorten FAQ. |
| `content/posts/personalFinance/en/fire-assumption-errors-7-fixes.md` | en | personalFinance | fire-assumption-errors-7-fixes | Medium | Template-heavy FIRE checklist plus many modal verbs. | "can/should/may count 39" | Keep checklist but rewrite each fix as one testable calculator input change. |
| `content/posts/personalFinance/en/rent-jeonse-buy-cashflow-opportunity-cost.md` | en | personalFinance | rent-jeonse-buy-cashflow-opportunity-cost | Medium | Korea housing topic is valuable, but modal density can read generic. | "can/should/may count 39" | Strengthen jeonse-specific explanation and reduce broad "safer/depends" phrasing. |
| `content/posts/personalFinance/en/simple-vs-compound.md` | en | personalFinance | simple-vs-compound | Medium | EN article has generic "can be appropriate" and repeated explanatory structure. | "Simple interest can be appropriate..." | Rewrite examples around calculator usage and reduce abstract finance-principle phrasing. |
| `content/posts/personalFinance/en/personal-finance-3pillars.md` | en | personalFinance | personal-finance-3pillars | Medium | Broad topic plus "depending on your situation" and "The key is" flags. | "tax efficiency (depending on your situation)", "The key is..." | Differentiate from first-salary guide; use a clearer setup checklist. |

## Low Priority

| File | Lang | Category | Slug | Risk | Main reason | Example phrases | Recommended rewrite scope |
|---|---|---|---|---|---|---|---|
| `content/posts/investingInfo/ko/fx-hedge-vs-fx-exposure-korea-3-conditions.md` | ko | investingInfo | fx-hedge-vs-fx-exposure-korea-3-conditions | Low | One generic "중요합니다" style sentence; otherwise topic is specific. | "내가 중간에 포기하지 않느냐가 더 중요합니다" | Light sentence-level polish only. |
| `content/posts/investingInfo/ko/wti-impact-on-korea-kospi.md` | ko | investingInfo | wti-impact-on-korea-kospi | Low | A few generic "중요합니다/도움이 됩니다" transitions. | "시장 변수... 계획이 중요합니다" | Rewrite one transition with WTI/KOSPI dashboard action. |
| `content/posts/personalFinance/ko/emergency-fund-by-risk.md` | ko | personalFinance | emergency-fund-by-risk | Low | Minor repeated "핵심은/볼 수 있습니다" usage. | "핵심은 '남으면 모으자'가 아니라..." | Leave unless doing broader KO tone pass. |
| `content/posts/personalFinance/en/dsr-pass-ltv-cash-bottleneck.md` | en | personalFinance | dsr-pass-ltv-cash-bottleneck | Low | Moderate modal density, but topic specificity reduces risk. | "can/should/may count 21" | Light FAQ verb tightening. |
| `content/posts/personalFinance/en/how-much-to-invest-monthly-for-target-portfolio.md` | en | personalFinance | how-much-to-invest-monthly-for-target-portfolio | Low | Some modal repetition after recent EN planning content work. | "can/should/may count 21" | Review only if monthly-investment cluster is rewritten again. |
| `content/posts/personalFinance/en/is-dca-better-in-a-bear-market.md` | en | personalFinance | is-dca-better-in-a-bear-market | Low | Moderate modal density; calculator intent likely protects specificity. | "can/should/may count 21" | Light edit to make bear-market examples more concrete. |
| `content/posts/personalFinance/ko/dsr-pass-ltv-cash-bottleneck.md` | ko | personalFinance | dsr-pass-ltv-cash-bottleneck | Low | One "볼 수 있습니다" signal in a practical calculator context. | "`가능`, `주의`, `불가`로 볼 수 있습니다" | No urgent rewrite; keep for future CTA polish. |
| `content/posts/personalFinance/ko/large-apartment-complex-households-price-stability.md` | ko | personalFinance | large-apartment-complex-households-price-stability | Low | A few "중요합니다" instances but strong real-estate specificity. | "분포와 평단가를 함께 보는 것이 중요합니다" | Light transition edit only. |
| `content/posts/personalFinance/en/annual-vs-monthly-compound.md` | en | personalFinance | annual-vs-monthly-compound | Low | Template sections present after rewrite, but calculator intent is clear. | "Quick Answer / FAQ structure" | Monitor; avoid adding more generic FAQ blocks. |
| `content/posts/personalFinance/en/monthly-investment-for-100m-table.md` | en | personalFinance | monthly-investment-for-100m-table | Low | Recently differentiated as table/reference page; template signal exists but role is clear. | "Quick Answer / FAQ structure" | No immediate edit unless monthly contribution cluster is refreshed. |
| `content/posts/personalFinance/ko/how-much-per-month-for-100m.md` | ko | personalFinance | how-much-per-month-for-100m | Low | Some "확인할 수 있습니다/도움" CTA phrasing. | "결과에 미치는 영향을 확인할 수 있습니다" | Polish CTA sentence only. |
| `content/posts/investingInfo/en/dca-consistency-7-fail-patterns.md` | en | investingInfo | dca-consistency-7-fail-patterns | Low | Modal density is visible but title/structure are specific. | "can/should/may count 17" | Light edit if DCA cluster is updated. |

## Common patterns found

### Repeated expressions

- KO: `핵심은` appeared 100 times across scanned markdown.
- KO: `중요합니다` appeared 66 times.
- KO: `도움이 됩니다` appeared 30 times.
- KO: `볼 수 있습니다` appeared 24 times.
- KO: `확인할 수 있습니다` appeared 16 times.
- KO: `이 글에서는` appeared 12 times.
- KO modal family `~할 수 있습니다 / ~볼 수 있습니다 / ~될 수 있습니다`: 234 total hits.
- EN: `The key is` appeared 20 times.
- EN: `This guide explains` appeared 9 times.
- EN: `This article explains` appeared 5 times.
- EN: `can help you` appeared 3 times.
- EN: `can be useful` appeared 3 times.
- EN modal family `can / should / may`: 2,173 total hits.

### KO patterns

- Many KO posts are specific and numeric, but section endings often repeat the same explanatory closure:
  - "핵심은..."
  - "중요합니다"
  - "도움이 됩니다"
  - "확인할 수 있습니다"
- Calculator CTAs often describe that a user "can check" something instead of telling the reader exactly what input to enter and what result to compare.
- Some FAQ answers repeat body claims with only minor wording changes, which increases template-heavy risk.

### EN patterns

- EN posts often have strong topics, especially Korea market and calculator topics, but the prose can lean on generic guide scaffolding:
  - "This guide explains..."
  - "This article explains..."
  - "The key is..."
  - frequent `can / should / may`
- The modal density is partly natural for educational finance disclaimers, so it should not be treated as a defect by itself.
- Higher-risk EN rewrites should focus on replacing generic guide language with:
  - concrete Korea-market examples,
  - calculator input/output workflows,
  - signal maps,
  - short if/then decision rules.

### Template-heavy structure

- `## FAQ` appeared in 116 files.
- `## Bottom Line` appeared in 16 files.
- `## Checklist` appeared in 11 files.
- `## Quick Answer` appeared in 8 files.
- `## Common Mistakes` appeared in 2 files.

The FAQ pattern is expected for SEO content, but high-frequency FAQ usage becomes a tone risk when the FAQ repeats the body rather than adding new decision rules, examples, or edge cases.

## Suggested rewrite policy

- Do not remove all repeated phrases mechanically. Some are natural in financial education.
- Prioritize rewrites where repeated phrases appear in the intro, section endings, CTAs, and FAQ answers.
- For KO/Naver content, replace generic closure with practical reader actions:
  - input values,
  - table reading instructions,
  - threshold checks,
  - dashboard or calculator paths.
- For EN/GSC+Bing content, replace generic guide language with international-reader framing:
  - "Korea market signal",
  - "calculator workflow",
  - "monthly contribution example",
  - "USD/KRW/KOSPI transmission",
  - "DSR/LTV borrowing constraint".
- Keep SEO metadata, canonical, slug, hreflang, sitemap, and robots untouched unless a separate SEO task requires it.
