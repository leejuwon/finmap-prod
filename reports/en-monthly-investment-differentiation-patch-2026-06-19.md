# EN Monthly Investment Differentiation Patch - 2026-06-19

## Scope

Patched only:

- `content/posts/personalFinance/en/monthly-investment-for-100m-table.md`

Read for context:

- `content/posts/personalFinance/en/how-much-to-invest-monthly-for-target-portfolio.md`
- `reports/en-monthly-investment-cannibalization-audit.md`

No Korean files, slugs, URLs, canonical, hreflang, noindex, robots, `SeoHead`, or sitemap generation policy were changed.

## Purpose

The cannibalization audit found `medium` overlap between:

- primary: `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio`
- secondary: `/en/posts/personalFinance/monthly-investment-for-100m-table`

The main issue was exact title/H1 overlap. This patch keeps the secondary URL but narrows its intent to a monthly contribution table / reference page for `$100,000` and `KRW 100M` examples.

## Content Patch Summary

| Area | Before | After |
| --- | --- | --- |
| `title` | `How Much Should You Invest Monthly to Reach a Target Portfolio?` | `Monthly Contribution Table for a $100,000 Target and KRW 100M Goal` |
| `seoTitle` | `Monthly Investment Calculator Guide \| Target Portfolio Contribution Table` | `Monthly Contribution Table \| $100,000 and KRW 100M Goal Examples` |
| `description` | Broad target portfolio monthly investment framing | `$100,000` and `KRW 100M` monthly contribution table framing |
| `seoDescription` | Broad calculator guide framing | Contribution tables plus FinMap calculator comparison framing |
| Intro | General target portfolio monthly investment answer | Explicitly states the page is a contribution table reference and links to the primary broad guide |
| Quick Answer | Broad monthly amount drivers | Table/reference role, primary guide link, and calculator routing |
| Section heading | `The Basic Formula Behind a Monthly Investment Goal` | `How to Read the Monthly Contribution Table` |
| FAQ first question | `How much should I invest monthly to reach a target portfolio?` | `What does this monthly contribution table show?` |
| Bottom Line | General target portfolio planning | Reference table orientation plus calculator follow-up |

## Primary / Secondary Role

| URL | Recommended role |
| --- | --- |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | Primary broad guide for target portfolio monthly investing, DCA workflow, after-tax target planning, fees, and taxes. |
| `/en/posts/personalFinance/monthly-investment-for-100m-table` | Secondary reference page for `$100,000` and `KRW 100M` monthly contribution tables by timeline and return assumption. |

## Title / H1 Differentiation Result

Build HTML check:

| URL | Rendered H1 | Result |
| --- | --- | --- |
| `/en/posts/personalFinance/monthly-investment-for-100m-table` | `Monthly Contribution Table \| $100,000 and KRW 100M Goal Examples` | Differentiated |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | `How Much Should You Invest Monthly to Reach a Target Portfolio?` | Primary title retained |

Note: the blog detail page renders `seoTitle` as the post title/H1 because `lib/posts.js` maps `data.seoTitle || data.title` to `post.title`.

## Internal Link Check

The secondary page now links to the primary guide in the intro and related reading section:

- `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio`

No KO-root internal link patterns such as `/posts/...`, `/tools/...`, or `/market/...` were found in the patched EN page.

## FAQPage JSON-LD Check

The visible FAQ and manual FAQPage JSON-LD were updated together.

| Check | Result |
| --- | --- |
| Visible FAQ count | 5 |
| JSON-LD FAQ question count | 5 |
| Visible FAQ questions match JSON-LD `name` values | PASS |
| Built HTML FAQPage count for secondary URL | 1 |
| Built HTML FAQPage count for primary URL | 1 |

The patched secondary URL outputs `BlogPosting`, `BreadcrumbList`, and one `FAQPage`. The primary URL also has one `FAQPage`; no FAQPage duplication was found.

## Validation Results

| Command | Result | Notes |
| --- | --- | --- |
| `npm.cmd run build` | PASS | Next.js compiled successfully and generated 209 static pages. Postbuild completed. |
| `node scripts\verify_post_publish_urls.js --local-server ...two EN URLs` | PASS | Both URLs returned 200, self canonical, no robots block, no meta noindex, sitemap inclusion, and hreflang pair. |
| FAQPage/H1 built HTML count | PASS | Secondary H1 is differentiated; both pages have exactly one FAQPage JSON-LD block. |
| `git diff --check` | PASS | Exit code 0. LF-to-CRLF warnings only. |

## Remaining Issues

- No canonical, hreflang, noindex, redirect, or slug change is recommended.
- The two pages still share the same broad topic family, but the secondary page now has a clearer table/reference role.
- Search performance impact should be reviewed after Google/Bing re-crawl and query data settle.
