# P0 EN personal-start-5steps Rewrite Report

Date: 2026-06-19

## Scope

- Target file: `content/posts/personalFinance/en/personal-start-5steps.md`
- Goal: rewrite the EN article for Google/Bing search intent around first salary budget setup, emergency fund, monthly investing, and goal planning.
- Non-goals: no KO content edit, no slug change, no canonical/hreflang/noindex/robots/SeoHead/sitemap policy change, no new URL.

## Modified Content Summary

- Updated frontmatter for EN search intent:
  - `title`: `First Salary Budget Setup: 5 Steps to Build Cash Flow, Emergency Fund, and Investing Habits`
  - `seoTitle`: `First Salary Budget Setup: 5 Steps for Young Professionals`
  - `description` and `seoDescription` rewritten for first salary setup, fixed costs, emergency fund, debt, monthly investing, and calculator workflows.
  - `dateModified`: `2026-06-19`
  - Tags expanded around first salary budget, first paycheck, emergency fund, monthly investing, and goal planning.
- Rebuilt the body as a calculator-supported guide:
  - Quick Answer
  - Step 1: Map Take-Home Pay and Fixed Costs
  - Step 2: Build a Starter Emergency Fund
  - Step 3: Set a Debt Rule Before Investing More
  - Step 4: Start Monthly Investing with a Sustainable Amount
  - Step 5: Turn Goals Into Calculator-Based Monthly Targets
  - Example First Salary Budget Table
  - Calculator Workflow
  - Common Mistakes
  - Bottom Line
  - FAQ
- Added educational disclaimer language that the framework and calculator outputs are not personal financial advice.

## Internal Link Check

Required EN internal links were included with `/en` paths:

- `/en/tools/goal-simulator`
- `/en/tools/dca-calculator`
- `/en/tools/compound-interest`
- `/en/tools/fire-calculator`
- `/en/posts/personalFinance/personal-finance-3pillars`
- `/en/posts/personalFinance/emergency-fund-by-risk`
- `/en/posts/personalFinance/high-rate-debt-vs-invest-threshold-rule`
- `/en/posts/personalFinance/monthly-dca-10-year-result`
- `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio`

Route note:

- The requested `/en/tools/fire-simulator` route does not exist in the repository.
- Existing route `pages/tools/fire-calculator.js` exists, so the article links to `/en/tools/fire-calculator`.

Static link check:

- KO root-style internal links such as `/posts/...`, `/tools/...`, and `/market/...` were not found in the rewritten EN article.
- KO file diff for `content/posts/personalFinance/ko/personal-start-5steps.md` was empty.

## Structured Data Check

- Removed the old manual `Article` JSON-LD from this article because the blog detail template already outputs `BlogPosting`.
- Added one manual `FAQPage` JSON-LD block matching the visible FAQ.
- Source FAQ check:
  - Visible FAQ count: 5
  - FAQPage JSON-LD question count: 5
  - Question text match: PASS
- Built HTML JSON-LD check:
  - JSON-LD blocks: 3
  - Types: `BlogPosting`, `BreadcrumbList`, `FAQPage`
  - `FAQPage` count: 1
  - `Article` count: 0
  - `BlogPosting` count: 1
- Built HTML H1:
  - `First Salary Budget Setup: 5 Steps for Young Professionals`

## Validation Results

### `npm.cmd run build`

Result: PASS

Notes:

- Next.js build completed successfully.
- `postbuild` ran `next-sitemap` and `node scripts/generate_channel_sitemaps.js`.
- Channel sitemap output:
  - `sitemap-ko.xml`: 101 URLs
  - `sitemap-en.xml`: 98 URLs
  - `en/sitemap.xml`: 98 URLs
  - Required EN static URLs: 16/16 present

### `node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/en/posts/personalFinance/personal-start-5steps`

Result: PASS

Target URL result:

- HTTP: 200
- Final URL: `https://www.finmaphub.com/en/posts/personalFinance/personal-start-5steps`
- Canonical self: yes
- Robots blocked: no
- Meta noindex: no
- Sitemap: `main:yes`, `en:yes`, `enPrefix:yes`
- RSS: N/A
- hreflang pair: yes

### `node scripts\verify_seo_channel_split.js --local-server`

Result: PASS

Key output:

- `sitemap-0.xml` URL count: 199
- `sitemap-ko.xml` URL count: 101
- `sitemap-en.xml` URL count: 98
- `en/sitemap.xml` URL count: 98
- Forbidden sitemap loc patterns: PASS
- EN prefix sitemap file present: PASS
- EN-only locs: PASS
- `sitemap-en.xml` and `en/sitemap.xml` match: PASS
- Required EN static URLs: 16/16

### `git diff --check`

Result: PASS

Notes:

- No whitespace errors were reported.
- Git reported CRLF normalization warnings for existing modified/generated files.

## Remaining Issues

- No URL, canonical, hreflang, noindex, robots, SeoHead, or sitemap generation policy changes were made.
- Build/postbuild regenerated sitemap XML outputs as part of the normal build workflow.
- Search performance cannot be judged from this rewrite alone; GSC/Bing impressions and query data should be reviewed after recrawl.
