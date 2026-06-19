# EN Inflation Rate Differentiation Rewrite - 2026-06-19

## Scope

Rewrote only:

- `content/posts/economicInfo/en/inflation-rate-basics.md`

Read for context:

- `content/posts/economicInfo/en/inflation-basics.md`
- `reports/en-inflation-cannibalization-audit.md`
- `pages/posts/[category]/[slug].js`
- `_components/SeoHead.js`

No Korean files, slugs, URLs, canonical, hreflang, noindex, robots, `SeoHead`, or sitemap generation policy were changed.

## Purpose

The cannibalization audit found `high` overlap between:

- primary: `/en/posts/economicInfo/inflation-basics`
- secondary: `/en/posts/economicInfo/inflation-rate-basics`

This rewrite keeps `inflation-basics` as the broad evergreen inflation/rates framework and narrows `inflation-rate-basics` into a market reaction guide focused on inflation surprises, rate expectations, yields, real rates, USD/KRW, KOSPI, DXY, WTI, and foreign flows.

## Content Rewrite Summary

| Area | Before | After |
| --- | --- | --- |
| `title` | `Inflation and Interest Rates Explained: Why Rate Changes Shake Markets` | `How Markets React to Inflation Surprises and Rate Changes` |
| `seoTitle` | Not present | `Inflation Surprise and Rate Change Market Reaction Guide` |
| `description` | Broad inflation/rates/stocks/ETFs/currencies guide | CPI surprise, rate expectations, Treasury yields, real rates, USD/KRW, and KOSPI reaction guide |
| `seoDescription` | Not present | Market reaction guide for inflation surprises, rate changes, yields, USD/KRW, KOSPI, and risk assets |
| `dateModified` | `2026-06-01` | `2026-06-19` |
| Main intent | Broad inflation and interest-rate explainer | Secondary market interpretation guide |
| CTA | Compound calculator as main action | Calculator CTA moved to a secondary step |

## New Section Structure

- Quick Answer
- Start With the Foundation: Inflation vs Rates
- What Is an Inflation Surprise?
- Why Rate Expectations Move Before Policy Rates
- Nominal Yields, Real Rates, and Risk Assets
- Market Reaction Map
- Korea Market Connection: USD/KRW and KOSPI
- Market Reaction Checklist
- Common Mistakes
- Calculator CTA: Use as a Secondary Step
- Bottom Line
- FAQ

## Primary / Secondary Role

| URL | Recommended role after rewrite |
| --- | --- |
| `/en/posts/economicInfo/inflation-basics` | Primary broad evergreen framework for inflation, interest rates, liquidity, asset valuation, and long-term investor context. |
| `/en/posts/economicInfo/inflation-rate-basics` | Secondary market reaction guide for CPI surprises, rate expectations, Treasury yields, real rates, USD/KRW, KOSPI, DXY, WTI, and foreign flows. |

## Title / H1 Differentiation Result

Build HTML check:

| URL | Rendered H1 | Structured role |
| --- | --- | --- |
| `/en/posts/economicInfo/inflation-rate-basics` | `Inflation Surprise and Rate Change Market Reaction Guide` | Secondary market reaction guide |
| `/en/posts/economicInfo/inflation-basics` | `Inflation and Interest Rates: A Long-Term Investor's Core Framework` | Primary broad framework |

Note: the blog detail page renders `seoTitle` as the post title/H1 because `lib/posts.js` maps `data.seoTitle || data.title` to `post.title`.

## Internal Link Check

The rewritten secondary page includes the required EN links:

- `/en/posts/economicInfo/inflation-basics`
- `/en/posts/economicInfo/interest-rate-basics`
- `/en/posts/economicInfo/real-rates-and-breakevens`
- `/en/posts/economicInfo/policy-rate-cut-market-rates`
- `/en/posts/investingInfo/us10y-impact-on-korea-and-stock-market`
- `/en/market/indices`

It also includes related Korea market links:

- `/en/posts/investingInfo/usd-krw-exchange-rate-and-kospi`
- `/en/posts/investingInfo/dxy-dollar-index-basics`
- `/en/posts/investingInfo/wti-impact-on-korea-kospi`

No KO-root internal link patterns such as `/posts/...`, `/tools/...`, or `/market/...` were found in the rewritten EN page.

## Structured Data Check

Source inspection:

| File | Manual JSON-LD scripts | FAQPage count | Article count |
| --- | ---: | ---: | ---: |
| `inflation-rate-basics.md` | 1 | 1 | 0 |

The old manual `Article` JSON-LD was not retained because it would have described the previous broad article rather than the rewritten market-reaction guide. The blog template already emits `BlogPosting` and `BreadcrumbList`, so the rewritten markdown now contributes only one FAQPage block that matches the visible FAQ.

Visible FAQ and FAQPage JSON-LD match:

| Check | Result |
| --- | --- |
| Visible FAQ count | 5 |
| JSON-LD FAQ question count | 5 |
| Visible FAQ questions match JSON-LD `name` values | PASS |

Build HTML check:

| URL | JSON-LD types found | Notes |
| --- | --- | --- |
| `/en/posts/economicInfo/inflation-rate-basics` | `BlogPosting`, `BreadcrumbList`, `FAQPage` | No manual `Article`; one FAQPage. |
| `/en/posts/economicInfo/inflation-basics` | `BlogPosting`, `BreadcrumbList`, `Article` | Existing primary page unchanged; it still has its previous manual `Article` block and no FAQPage. |

No duplicate FAQPage output was found.

## SEO Structure Check

The rewrite did not edit canonical, hreflang, robots, noindex, `SeoHead`, or sitemap generation logic.

Target EN URL verification:

| URL | HTTP | Self canonical | Meta noindex | Sitemap | hreflang pair | Result |
| --- | ---: | --- | --- | --- | --- | --- |
| `/en/posts/economicInfo/inflation-rate-basics` | 200 | yes | no | main/en/en-prefix yes | yes | PASS |
| `/en/posts/economicInfo/inflation-basics` | 200 | yes | no | main/en/en-prefix yes | yes | PASS |

## Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `npm.cmd run build` | PASS | Next.js compiled successfully and generated 209 static pages. Postbuild regenerated channel sitemaps. |
| `node scripts\verify_post_publish_urls.js --local-server ...two EN URLs` | PASS | Both URLs returned 200, self canonical, no robots block, no meta noindex, sitemap inclusion, and hreflang pair. |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS | Forbidden sitemap loc patterns PASS, EN prefix sitemap present, EN-only locs PASS, `sitemap-en.xml` and `/en/sitemap.xml` match. |
| Structured data count over built HTML | PASS | Target page has one `FAQPage`; primary page remains unchanged with one manual `Article`. |
| `git diff --check` | PASS | Exit code 0. LF-to-CRLF warnings only. |

## Generated Output Notes

Running build/postbuild refreshed sitemap XML files because `inflation-rate-basics` now has `dateModified: 2026-06-19`. This is generated output from the existing build pipeline, not a sitemap policy change.

Running `verify_seo_channel_split.js --local-server` refreshed `reports/seo-channel-split-url-check.md`.

## Remaining Issues

- Search performance impact cannot be measured immediately; review GSC/Bing impressions and query split after re-crawl.
- `inflation-basics` still contains an existing manual `Article` JSON-LD block; it was not modified because the request explicitly prohibited editing that file.
- The secondary page now has a clearer market-reaction role, but it should be monitored for broad "inflation and interest rates" query overlap after indexing settles.
