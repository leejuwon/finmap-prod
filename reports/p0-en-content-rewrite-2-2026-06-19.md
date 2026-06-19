# P0 EN Content Rewrite 2 Review - 2026-06-19

## Scope

This pass rewrote three existing English posts only:

1. `content/posts/investingInfo/en/dxy-dollar-index-basics.md`
2. `content/posts/personalFinance/en/monthly-investment-for-100m-table.md`
3. `content/posts/economicInfo/en/indicator-basics.md`

No Korean post files were edited. No slug, URL, canonical, hreflang, robots, noindex, `SeoHead`, or sitemap generation policy changes were made.

## Content Changes

| File | Rewrite focus | Summary |
| --- | --- | --- |
| `dxy-dollar-index-basics.md` | DXY + USD/KRW + KOSPI Korea market guide | Reframed the article from a generic DXY explainer into a Korea market guide. Added what DXY measures, what it does not measure, USD/KRW interpretation, KOSPI/foreign-flow channels, a Korea market checklist, related EN links, and 5 FAQs. |
| `monthly-investment-for-100m-table.md` | Target portfolio / monthly investment calculator intent | Reframed the article away from only KRW 100M and toward target portfolio planning. Added a $100,000 target table, return-sensitivity table, KRW 100M Korea example note, calculator workflow, related EN links, and 5 FAQs. |
| `indicator-basics.md` | Economic indicators as Korea-linked market signals | Reframed the article from a broad macro guide into a market signal guide. Added GDP/PMI/jobs/inflation/rates signal map, leading/coincident/lagging table, Korea dashboard connection, checklist, scenario table, related EN links, and 5 FAQs. |

## Frontmatter Updates

| File | Updated title direction | dateModified |
| --- | --- | --- |
| `dxy-dollar-index-basics.md` | `What Is DXY? How the Dollar Index Affects USD/KRW and KOSPI` | `2026-06-19` |
| `monthly-investment-for-100m-table.md` | `How Much Should You Invest Monthly to Reach a Target Portfolio?` | `2026-06-19` |
| `indicator-basics.md` | `How to Read Economic Indicators as Market Signals: GDP, PMI, Jobs, Inflation, and Rates` | `2026-06-19` |

All three files now have strengthened `seoTitle`, `description`, `seoDescription`, and EN-search-oriented `tags`.

## Internal Link Check

Manual and string checks found no KO-root internal link patterns such as `/posts/...`, `/tools/...`, or `/market/...` in the three rewritten EN posts.

Added or retained EN-only internal links include:

- `/en/posts/investingInfo/dxy-market-impact`
- `/en/posts/investingInfo/usd-krw-exchange-rate-and-kospi`
- `/en/posts/investingInfo/usd-krw-weak-won-sector-map-kospi`
- `/en/market/indices`
- `/en/tools/goal-simulator`
- `/en/tools/dca-calculator`
- `/en/tools/compound-interest`
- `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio`
- `/en/posts/personalFinance/monthly-dca-10-year-result`
- `/en/posts/personalFinance/dca-vs-lump-sum-when-results-differ`
- `/en/posts/economicInfo/inflation-basics`
- `/en/posts/economicInfo/interest-rate-basics`
- `/en/posts/economicInfo/real-rates-and-breakevens`
- `/en/posts/investingInfo/indicator-marketinfo`

## FAQPage JSON-LD Check

Each rewritten post now has one manual FAQPage JSON-LD block that matches the visible FAQ section.

Static markdown check:

| File | Manual JSON-LD scripts | FAQPage count | Manual Article count |
| --- | ---: | ---: | ---: |
| `dxy-dollar-index-basics.md` | 1 | 1 | 0 |
| `monthly-investment-for-100m-table.md` | 1 | 1 | 0 |
| `indicator-basics.md` | 1 | 1 | 0 |

Build HTML check:

| URL path | JSON-LD types found | FAQPage count | Duplicate FAQPage? |
| --- | --- | ---: | --- |
| `/en/posts/investingInfo/dxy-dollar-index-basics` | `BlogPosting`, `BreadcrumbList`, `FAQPage` | 1 | No |
| `/en/posts/personalFinance/monthly-investment-for-100m-table` | `BlogPosting`, `BreadcrumbList`, `FAQPage` | 1 | No |
| `/en/posts/economicInfo/indicator-basics` | `BlogPosting`, `BreadcrumbList`, `FAQPage` | 1 | No |

The blog detail template remains the owner of `BlogPosting` and `BreadcrumbList`. The markdown body now contributes only one FAQPage block per target article.

## SEO Structure Check

The rewrite did not edit canonical, hreflang, robots, noindex, `SeoHead`, or sitemap generation logic.

Target EN URL verification:

| URL | HTTP | Self canonical | Meta noindex | Sitemap | hreflang pair | Result |
| --- | ---: | --- | --- | --- | --- | --- |
| `/en/posts/investingInfo/dxy-dollar-index-basics` | 200 | yes | no | main/en/en-prefix yes | yes | PASS |
| `/en/posts/personalFinance/monthly-investment-for-100m-table` | 200 | yes | no | main/en/en-prefix yes | yes | PASS |
| `/en/posts/economicInfo/indicator-basics` | 200 | yes | no | main/en/en-prefix yes | yes | PASS |

## Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `npm.cmd run build` | PASS | Next.js compiled successfully and generated 209 static pages. Postbuild regenerated channel sitemaps. |
| `node scripts\generate_channel_sitemaps.js` via postbuild | PASS | `sitemap-ko.xml`: 101 URLs, `sitemap-en.xml`: 98 URLs, `en\sitemap.xml`: 98 URLs, required EN static URLs 16/16 present. |
| `node scripts\verify_post_publish_urls.js --local-server ...target EN URLs` | PASS | All three target URLs returned 200, self canonical, no robots block, no meta noindex, EN sitemap inclusion, and hreflang pair. |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS | Forbidden sitemap loc patterns PASS, EN prefix sitemap present, EN-only locs PASS, `sitemap-en.xml` and `/en/sitemap.xml` match. |
| FAQPage count over built HTML | PASS | Each target page has exactly one `FAQPage` JSON-LD block. |
| `git diff --check` | PASS | Exit code 0. Git reported expected LF-to-CRLF working-copy warnings only. |

## Generated Output Notes

Running build/postbuild refreshed sitemap XML files because the three EN posts now have `dateModified: 2026-06-19`. This is generated output from the existing build pipeline, not a sitemap policy change.

Running `verify_seo_channel_split.js --local-server` refreshed `reports/seo-channel-split-url-check.md`.

The working tree also contains `reports/faq-jsonld-duplication-audit.md` from the prior FAQPage audit. It was not part of this content rewrite.

## Remaining Issues

- Search performance impact cannot be measured immediately; review GSC/Bing impressions and queries after indexing settles.
- DXY and economic indicator interpretations remain educational market-analysis frameworks, not predictions.
- Monthly investment tables exclude taxes, fees, inflation, product costs, and sequence-of-return risk.
- No KO content, routing, canonical, hreflang, robots, noindex, `SeoHead`, or sitemap generation policy changes were made in this pass.
