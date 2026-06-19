# P0 EN Content Rewrite Review - 2026-06-19

## Scope

This pass rewrote three existing English posts only:

1. `content/posts/personalFinance/en/what-is-cagr.md`
2. `content/posts/personalFinance/en/annual-vs-monthly-compound.md`
3. `content/posts/personalFinance/en/dsr-40-income-loan-limit-table.md`

No Korean post files were edited. No slug, URL, canonical, hreflang, robots, noindex, `SeoHead`, or sitemap generation policy changes were made.

## Content Changes

| File | Rewrite focus | Summary |
| --- | --- | --- |
| `what-is-cagr.md` | CAGR calculator and annualized-return search intent | Reframed the article around what CAGR means, how it differs from simple return, and why it helps compare ETF/fund returns over uneven holding periods. Added quick answer, example calculation tables, calculator CTA, related English links, and 5 FAQs. |
| `annual-vs-monthly-compound.md` | Annual vs monthly compounding and compound-interest calculator intent | Reframed the article around compounding frequency, same-principal comparisons, monthly contribution examples, and why rate, time, and contributions usually matter more than frequency alone. Added quick answer, calculation tables, calculator CTA, related English links, and 5 FAQs. |
| `dsr-40-income-loan-limit-table.md` | Korea DSR 40 mortgage rule explainer intent | Reframed the article for international readers searching for Korea DSR rules, income-based borrowing capacity, LTV interaction, existing-debt impact, and simplified loan-limit examples. Added quick answer, DSR formula, example tables, calculator CTA, related English links, and 5 FAQs. |

## Frontmatter Updates

| File | Updated title direction |
| --- | --- |
| `what-is-cagr.md` | `What Is CAGR? How to Compare Long-Term Returns Using Annualized Return` |
| `annual-vs-monthly-compound.md` | `Annual vs Monthly Compounding: How Much Does Compounding Frequency Really Matter?` |
| `dsr-40-income-loan-limit-table.md` | `Korea DSR 40% Rule Explained: How Income Limits Mortgage Borrowing Capacity` |

Each file also received stronger `seoTitle`, `description`, and `seoDescription` text for Google/Bing-style English calculator or explainer intent. `dateModified` was updated to `2026-06-19`.

## Internal Link Check

Manual and `rg` checks confirmed that the rewritten EN posts do not contain root KO-style internal links such as `/posts/...`, `/tools/...`, or `/market/...`.

All added internal links use `/en` paths, including:

- `/en/tools/cagr-calculator`
- `/en/tools/compound-interest`
- `/en/tools/dca-calculator`
- `/en/tools/dsr-ltv-calculator`
- `/en/tools/goal-simulator`
- `/en/market/real-estate`
- Related EN post URLs under `/en/posts/...`

## SEO Structure Check

The content rewrite did not add or edit canonical, hreflang, robots, noindex, `SeoHead`, or sitemap generation logic.

Target EN URL verification:

| URL | HTTP | Self canonical | Meta noindex | Sitemap | hreflang pair | Result |
| --- | ---: | --- | --- | --- | --- | --- |
| `/en/posts/personalFinance/what-is-cagr` | 200 | yes | no | main/en/en-prefix yes | yes | PASS |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | 200 | yes | no | main/en/en-prefix yes | yes | PASS |
| `/en/posts/personalFinance/dsr-40-income-loan-limit-table` | 200 | yes | no | main/en/en-prefix yes | yes | PASS |

## Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `npm.cmd run build` | PASS | Next.js compiled successfully and generated 209 static pages. Postbuild regenerated channel sitemaps. |
| `node scripts\generate_channel_sitemaps.js` via postbuild | PASS | `sitemap-ko.xml`: 101 URLs, `sitemap-en.xml`: 98 URLs, `en\sitemap.xml`: 98 URLs, required EN static URLs 16/16 present. |
| `node scripts\verify_post_publish_urls.js --local-server ...target EN URLs` | PASS | All three target URLs returned 200, self canonical, no robots block, no meta noindex, EN sitemap inclusion, and hreflang pair. |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS | Forbidden sitemap loc patterns PASS, EN prefix sitemap present, EN-only locs PASS, `sitemap-en.xml` and `/en/sitemap.xml` match. |
| `git diff --check` | PASS | Exit code 0. Git reported expected LF-to-CRLF working-copy warnings only. |

## Generated Output Notes

Running the build/postbuild refreshed sitemap XML files because the three EN posts now have `dateModified: 2026-06-19`. This is generated output from the existing build pipeline, not a sitemap policy change.

The working tree also contains unrelated pre-existing uncommitted report/script changes from earlier SEO tasks. They were not part of this content rewrite.

## Remaining Issues

- Search performance impact cannot be measured immediately; review GSC/Bing impressions and queries after indexing settles.
- The DSR article intentionally stays educational and simplified. Actual borrowing limits may differ by lender review, regulation, loan type, region, collateral value, and borrower profile.
- No KO content, routing, canonical, hreflang, robots, noindex, or sitemap generation policy changes were made in this pass.
