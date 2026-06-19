# EN Inflation Cannibalization Audit

Date: 2026-06-19

## Scope

Compared two English economic-info posts:

1. `content/posts/economicInfo/en/inflation-basics.md`
2. `content/posts/economicInfo/en/inflation-rate-basics.md`

This audit did not edit content, slugs, canonical, hreflang, noindex, sitemap, robots, or templates.

## Decision Summary

| Item | Finding |
| --- | --- |
| overlap level | `high` |
| primary URL candidate | `/en/posts/economicInfo/inflation-basics` |
| secondary URL role | `/en/posts/economicInfo/inflation-rate-basics` as a market reaction guide focused on rate changes, inflation surprises, yields, USD/KRW, KOSPI, and risk-asset response |
| title/seoTitle differentiation needed? | Yes |
| internal link direction | Primary should own the broad inflation/rates framework; secondary should link up to primary as the foundation and out to market-specific guides/dashboards |
| canonical/hreflang/noindex change needed? | No |

Current state has high cannibalization risk because both posts explain inflation, interest rates, rate hikes/cuts, liquidity, stocks/ETFs, and long-term investing from a broad beginner-to-investor perspective.

The URLs can still be separated without redirects or noindex if `inflation-rate-basics` is rewritten around market reaction mechanics instead of basic inflation/rate education.

## Frontmatter Comparison

| Field | `inflation-basics` | `inflation-rate-basics` | Overlap assessment |
| --- | --- | --- | --- |
| title | `Understanding Inflation and Interest Rates: The Core Framework Every Long-Term Investor Must Know` | `Inflation and Interest Rates Explained: Why Rate Changes Shake Markets` | High. Both target inflation + interest rates for investors. |
| seoTitle | `Inflation and Interest Rates: A Long-Term Investor's Core Framework` | Not present | High by default. The second page relies on its broad title. |
| description | Explains inflation driving rates and rates affecting stocks, ETFs, real estate, liquidity cycles. | Explains inflation, interest rates, and how rate changes affect stocks, ETFs, currencies, and investing decisions. | High. Same asset and market-impact frame. |
| seoDescription | Connects inflation to rates, liquidity, stocks, ETFs, real estate, compounding, and goal planning. | Not present | Medium-high. Missing `seoDescription` makes the page less differentiated. |
| tags | `Inflation`, `Interest Rates`, `Macro`, `Economy`, `Liquidity`, `InvestmentBasics` | `inflation`, `interest rates`, `rate hikes`, `monetary policy`, `market basics` | High. Same keyword family, with only minor rate-hike emphasis on the second page. |

## H1 / Rendered Title

The blog template uses `data.seoTitle || data.title` as `post.title`, so the likely rendered H1 differs slightly:

| URL | H1 source | Current H1/title signal |
| --- | --- | --- |
| `/en/posts/economicInfo/inflation-basics` | `seoTitle` | Broad evergreen framework: inflation, rates, long-term investor macro cycle. |
| `/en/posts/economicInfo/inflation-rate-basics` | `title` | Broad explainer: inflation, rates, why rate changes shake markets. |

The wording differs, but not enough. Both H1/title signals compete for broad "inflation and interest rates explained" intent.

## Intro Comparison

| Page | Intro direction | Assessment |
| --- | --- | --- |
| `inflation-basics` | Summary says inflation and interest rates control the economy, asset performance, rate cycles, stocks, ETFs, real estate, and long-term planning. | Broad evergreen inflation/rate framework. |
| `inflation-rate-basics` | Summary says inflation measures purchasing power loss, rates control inflation, higher rates slow borrowing/investment, markets react before the economy. | Also broad framework; not yet narrow enough to be a distinct market-reaction page. |

The intros share the same reader promise: understand inflation and rates so investors can understand market volatility.

## Main Structure Comparison

| Area | `inflation-basics` | `inflation-rate-basics` | Overlap |
| --- | --- | --- | --- |
| Inflation definition | `Understanding Inflation (What pushes prices up?)` | `What Inflation Really Represents` | High |
| Rates mechanism | `Interest Rates - How they are determined` | `Why Interest Rates Are Used to Control Inflation` | High |
| Market transmission | `Economic impact of inflation vs interest rate cycles` | `From Inflation to Markets: The Full Chain Reaction` | High |
| Stocks/ETFs | Growth stock valuation compression, rate cuts revive risk assets | Rates as discount rate for stocks and ETFs | High |
| Liquidity/rate cycle | Tables on inflation phase and rate direction | Visualizing inflation, rates, and liquidity | High |
| Investor checklist | Practical investor checklist | Simple rate environment checklist | High |
| Tools CTA | Compound calculator and goal simulator | Compound calculator | Medium |

Both pages currently function as broad "inflation + rates + markets for investors" explainers.

## Tables / Visuals / CTA

| Element | `inflation-basics` | `inflation-rate-basics` | Assessment |
| --- | --- | --- | --- |
| Tables | Market reaction by inflation phase; economic flow by rate direction. | No markdown table, but visual sections and checklist cover similar mechanics. | `inflation-basics` is more table/framework-heavy. |
| Visuals | Three images for inflation-to-rates, rates vs growth stocks, rate cuts/liquidity. | Three similar images for inflation/rates/liquidity. | High visual/concept overlap. |
| CTA | Compound Interest Calculator and Goal Simulator. | Compound Interest Calculator. | Medium overlap; both connect macro assumptions to tools. |

## FAQ Comparison

| Page | FAQ questions | Overlap assessment |
| --- | --- | --- |
| `inflation-basics` | Do central banks raise rates if inflation rises slightly? Why do growth stocks fall first during rate hikes? Can markets rise during a rate-hike cycle? When inflation stabilizes, do rates immediately fall? | Broad inflation/rate-cycle FAQ with market reaction angle. |
| `inflation-rate-basics` | Does rising inflation always lead to higher interest rates? Do lower rates guarantee stock gains? Should individual investors track interest rates closely? | Very similar rate-cycle and market-impact FAQ. |

FAQ overlap is medium-high. The exact questions differ, but they answer the same conceptual cluster.

Note: both files currently include manual `Article` JSON-LD only and do not include manual `FAQPage` JSON-LD. This audit does not recommend adding or removing structured data; it only notes the current state.

## Internal Links Comparison

| Page | Current internal links |
| --- | --- |
| `inflation-basics` | `/en/posts/economicInfo/interest-rate-basics`, `/en/posts/economicInfo/policy-rate-cut-market-rates`, `/en/posts/investingInfo/cagr-7percent-reality-check` |
| `inflation-rate-basics` | `/en/posts/personalFinance/what-is-cagr`, `/en/posts/investingInfo/us10y-impact-on-korea-and-stock-market`, `/en/posts/investingInfo/why-check-cagr-etf`, `/en/posts/economicInfo/fx-basics` |

Current links do not clearly establish page hierarchy. The secondary page does not link to the primary broad inflation framework, and neither page clearly assigns `inflation-rate-basics` to a narrower "market reaction / rate surprise" role.

## Search Intent Judgment

Current overlap is `high`.

Reasons:

- Both titles target inflation + interest rates explained for investors.
- Both introductions promise a broad framework for inflation, rates, and markets.
- Both explain rate hikes/cuts, liquidity, growth stocks, valuations, and long-term investing.
- FAQ topics substantially overlap.
- Internal links do not establish a primary/secondary hierarchy.

The overlap can be reduced without changing URLs if roles are separated:

- `inflation-basics`: broad evergreen inflation and interest-rate framework.
- `inflation-rate-basics`: market reaction guide for inflation surprises, rate changes, yield moves, USD/KRW, KOSPI, and sector/risk-asset response.

## Recommended Ownership

| URL | Recommended role |
| --- | --- |
| `/en/posts/economicInfo/inflation-basics` | Primary broad evergreen framework for inflation, interest rates, liquidity, asset valuation, and long-term investor context. |
| `/en/posts/economicInfo/inflation-rate-basics` | Secondary market-reaction guide: how inflation prints, rate expectations, Treasury yields, real rates, USD/KRW, and KOSPI/risk assets respond. |

## Differentiation Candidates

No edits were made in this audit. If a future rewrite is approved, consider:

| Page | Suggested title direction | Suggested intent |
| --- | --- | --- |
| `inflation-basics` | Keep broad framework direction. | "What inflation and rates mean for long-term investors." |
| `inflation-rate-basics` | `How Markets React to Inflation Surprises and Rate Changes` | "Why CPI surprises, rate expectations, yields, and USD moves shake stocks and Korea markets." |

For `inflation-rate-basics`, future sections could include:

- CPI surprise vs consensus,
- nominal yields vs real rates,
- policy rate expectations vs market yields,
- growth stocks and duration sensitivity,
- USD/KRW and foreign-flow pressure,
- KOSPI and sector impact,
- market reaction checklist,
- links to `/en/market/indices`, `real-rates-and-breakevens`, `interest-rate-basics`, and Korea market guides.

## Internal Link Direction

Recommended hierarchy:

1. `inflation-rate-basics` should link to `inflation-basics` as the foundational inflation/rates framework.
2. `inflation-basics` can link to `inflation-rate-basics` as a follow-up market-reaction guide.
3. `inflation-rate-basics` should link to market-specific pages and tools:
   - `/en/market/indices`
   - `/en/posts/economicInfo/interest-rate-basics`
   - `/en/posts/economicInfo/real-rates-and-breakevens`
   - `/en/posts/economicInfo/policy-rate-cut-market-rates`
   - `/en/posts/investingInfo/us10y-impact-on-korea-and-stock-market`
4. Keep calculator CTAs secondary. The main differentiation should be market interpretation, not compound/goal planning.

## Canonical, Hreflang, Noindex

No canonical, hreflang, noindex, redirect, slug, or URL deletion is recommended.

Reason:

- Both URLs can serve distinct evergreen roles after content differentiation.
- `inflation-basics` can own the broad framework.
- `inflation-rate-basics` can own inflation/rate surprise and market reaction intent.
- Structural SEO changes would be too heavy before a content rewrite.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `git diff --check` | PASS | Exit code 0. No whitespace errors reported. |

## Final Recommendation

Treat this as a content differentiation issue, not a technical SEO issue.

Keep both URLs indexable and self-canonical. In a future content rewrite, preserve `inflation-basics` as the primary broad framework and narrow `inflation-rate-basics` into a market reaction guide centered on inflation surprises, rate expectations, yields, USD/KRW, KOSPI, and investor checklist behavior.
