# Finmap Backlink Content Package Audit

## Scope

- Created 4 Korean and 4 English reference-style blog posts for backlink-friendly tables.
- Each post includes a strong introduction, quick summary, assumptions, numeric table(s), interpretation notes, FAQ, calculator CTA copy, internal links, and Article/FAQPage JSON-LD blocks.
- Added a helper script to regenerate the numeric tables from Finmap calculator logic or matching calculator formulas.

## Generated Posts

| Topic | Locale | File | Slug | Title | Tool Meta |
| --- | --- | --- | --- | --- | --- |
| Compound return comparison | ko | `content/posts/personalFinance/ko/compound-return-3-5-7-10-table.md` | `compound-return-3-5-7-10-table` | 연 3%·5%·7%·10% 복리 차이, 10년·20년·30년 뒤 얼마일까? | `["comp","cagr"]` |
| Compound return comparison | en | `content/posts/personalFinance/en/compound-return-3-5-7-10-table.md` | `compound-return-3-5-7-10-table` | Compound Growth at 3%, 5%, 7%, and 10%: 10-, 20-, and 30-Year Tables | `["comp","cagr"]` |
| KRW 100M monthly investment | ko | `content/posts/personalFinance/ko/monthly-investment-for-100m-table.md` | `monthly-investment-for-100m-table` | 1억 만들려면 월 얼마씩 투자해야 할까? 기간·수익률별 월 투자금 표 | `["goal","comp","dca"]` |
| KRW 100M monthly investment | en | `content/posts/personalFinance/en/monthly-investment-for-100m-table.md` | `monthly-investment-for-100m-table` | How Much to Invest Monthly to Reach KRW 100 Million? A Timeline and Return Table | `["goal","comp","dca"]` |
| DSR 40% income table | ko | `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md` | `dsr-40-income-loan-limit-table` | DSR 40% 기준 연봉별 대출 가능액 표 | `["dsr-ltv"]` |
| DSR 40% income table | en | `content/posts/personalFinance/en/dsr-40-income-loan-limit-table.md` | `dsr-40-income-loan-limit-table` | DSR 40% Mortgage Capacity by Income: A Korean Loan Affordability Table | `["dsr-ltv"]` |
| 1%p rate impact | ko | `content/posts/personalFinance/ko/interest-rate-1p-loan-limit-impact.md` | `interest-rate-1p-loan-limit-impact` | 금리 1%p 차이가 대출 가능액에 미치는 영향 | `["dsr-ltv"]` |
| 1%p rate impact | en | `content/posts/personalFinance/en/interest-rate-1p-loan-limit-impact.md` | `interest-rate-1p-loan-limit-impact` | How a 1 Percentage Point Rate Change Affects Mortgage Capacity | `["dsr-ltv"]` |

## Table Generation

- Script: `scripts/generate_backlink_tables.js`
- Compound tables reuse `simulateCompoundPlan` from `lib/compoundCore.js`.
- KRW 100M monthly target table reuses `solveRequiredMonthly` from `lib/goalSimulator.js`.
- DSR and rate-impact tables use the same equal-payment annuity formulas as `lib/calculators/dsrLtv.js`.

### Calculation Criteria

| Post | Main Criteria |
| --- | --- |
| Compound comparison | Initial KRW 10,000,000 lump sum; KRW 300,000 monthly contribution; 10/20/30 years; annual return 3/5/7/10%; tax/fee/inflation 0%. |
| KRW 100M monthly investment | Target KRW 100,000,000; initial assets KRW 0; 5/10/15/20 years; annual return 3/5/7/10%; tax/fee/inflation 0%. |
| DSR 40% income table | DSR 40%; existing debt KRW 0; annual rate 4.0%; 30-year equal principal-and-interest payment; salaries KRW 30M/40M/50M/60M/70M/80M/100M/120M. |
| 1%p rate impact | Annual income KRW 60M; DSR 40%; existing debt KRW 0; 30-year equal payment; rates 3/4/5/6%; plus KRW 300M same-loan payment table. |

## Internal Links and Calculator CTAs

| Post | Calculator Links | Internal Context Links |
| --- | --- | --- |
| Compound comparison | `/tools/compound-interest`, `/tools/cagr-calculator`; English uses `/en/tools/...` | Monthly DCA result, annual vs monthly compounding. |
| KRW 100M monthly investment | `/tools/goal-simulator`, `/tools/compound-interest`, `/tools/dca-calculator`; English uses `/en/tools/...` | Existing target-portfolio and monthly DCA posts. |
| DSR 40% income table | `/tools/dsr-ltv-calculator`; English uses `/en/tools/...` | Mortgage risk checklist, apartment dashboard roadmap, real estate dashboard. |
| 1%p rate impact | `/tools/dsr-ltv-calculator`; English uses `/en/tools/...` | DSR 40% income table, mortgage risk checklist, real estate dashboard. |

## SEO and Structured Data Checks

- Frontmatter follows the existing post convention: `slug`, `link`, `title`, `description`, `datePublished`, `dateModified`, `seoTitle`, `seoDescription`, `category`, `postCategory`, `tags`, `tool`, `cover`, `lang`.
- Korean posts use `category: "재테크"` and English posts use `category: "Personal Finance"`.
- Same slugs are used for Korean and English pairs so canonical/hreflang pairing can resolve naturally.
- Each post includes Article JSON-LD and FAQPage JSON-LD in the body.
- Build-generated sitemap output included the 8 new Korean/English post URLs.

## Validation Results

| Check | Command | Result |
| --- | --- | --- |
| Table generation | `node scripts\generate_backlink_tables.js` | Passed. Output matched inserted tables. |
| Metadata/link spot check | `rg` over new post files | Passed. Tool meta, calculator links, post links, and real estate dashboard links were present. |
| Production build | `npm.cmd run build` | Passed. Next.js compiled and generated 199 static pages. |
| Whitespace diff check | `git diff --check` | Passed with CRLF conversion warnings only for sitemap files. |

## Notes

- Investment return and loan capacity figures are explicitly described as examples/simulations, not guarantees, recommendations, or product invitations.
- DSR posts warn that actual underwriting may differ due to lender review, LTV, collateral value, credit profile, regulation, existing debt, and stress-rate handling.
- English posts are not direct translations; they explain KRW and Korean DSR context for international readers.

## Second QA Review - 2026-06-01

### Issues Found and Fixed

| Area | Finding | Action |
| --- | --- | --- |
| Internal anchor text | The existing Korean `monthly-dca-10-year-result` post is a 월 50만원 article, while two new Korean posts linked to it with "월 30만원" anchor text. | Updated the anchors in `compound-return-3-5-7-10-table.md` and `monthly-investment-for-100m-table.md` to "월 50만원 적립식 투자, 10년 뒤 얼마가 될까?". |
| Cover images | No missing local cover image was found. | No placeholder image was needed. |
| Calculator CTA metadata | `comp`, `cagr`, `goal`, `dca`, and `dsr-ltv` are supported by the blog detail page and `ToolBacklinkKit` normalization. | No metadata change was needed. |

### Frontmatter and CTA Review

- All 8 posts keep the existing Finmap frontmatter structure: `slug`, `link`, `title`, `description`, `datePublished`, `dateModified`, `seoTitle`, `seoDescription`, `category`, `postCategory`, `tags`, `tool`, `cover`, `lang`.
- Korean posts use `category: "재테크"`, `postCategory: "personalFinance"`, and `lang: "ko"`.
- English posts use `category: "Personal Finance"`, `postCategory: "personalFinance"`, and `lang: "en"`.
- Tool metadata review:
  - Compound comparison: `["comp","cagr"]`
  - KRW 100M monthly investment: `["goal","comp","dca"]`
  - DSR income and rate-impact posts: `["dsr-ltv"]`
- `pages/posts/[category]/[slug].js` reads `post.tool`/`post.tools`, normalizes the IDs, and passes them to `RelatedCalculatorCtaGrid`; therefore the bottom calculator CTA connection is valid.

### Internal Link Review

All internal links used by the 8 posts were checked against existing routes or content files.

| Link Group | Result |
| --- | --- |
| Korean calculator links under `/tools/...` | Exists: compound, cagr, goal, dca, dsr-ltv. |
| English calculator links under `/en/tools/...` | Route-backed by existing calculator pages. |
| Korean post links under `/posts/personalFinance/...` | Exists: annual vs monthly compound, monthly DCA result, mortgage checklist, apartment dashboard roadmap, DSR table, existing 100M article. |
| English post links under `/en/posts/personalFinance/...` | Exists: annual vs monthly compound, monthly DCA result, mortgage checklist, apartment dashboard roadmap, DSR table, existing target portfolio article. |
| Real estate dashboard links | `/market/real-estate` exists; `/en/market/real-estate` is covered by the locale-prefixed page route. |

### Image Path Review

| Cover | Type | Result |
| --- | --- | --- |
| `/images/posts/monthly-dca-10-year-result/cover.png` | Local public image | Exists. |
| `/images/posts/monthly-dca-10-year-result/cover-en.png` | Local public image | Exists. |
| `/images/posts/how-much-monthly-invest-for-100m/cover.svg` | Local public image | Exists. |
| `/images/posts/how-much-to-invest-monthly-for-target-portfolio/cover.svg` | Local public image | Exists. |
| `https://res.cloudinary.com/dwonflmnn/image/upload/v1769863768/blog/insight/mortgage-risk-checklist-cover.png` | Cloudinary image | HEAD request returned HTTP 200 with `image/png`. |

### Table Number Review

- Re-ran `node scripts\generate_backlink_tables.js`.
- The generated compound, goal, DSR, rate-impact, and KRW 300M payment tables match the inserted post tables.
- The DSR and loan payment calculations still mirror the equal principal-and-interest annuity formulas used by `lib/calculators/dsrLtv.js`.

### Content Completeness Review

Each post includes:

- Strong introduction
- Quick summary
- Assumptions
- At least one core numeric table
- Interpretation/caution section
- FAQ section
- Related calculator CTA copy
- At least two useful internal links
- Clear simulation/disclaimer language for investment or loan outcomes
- Article and FAQPage JSON-LD blocks

SEO review:

- `seoTitle` and `seoDescription` are unique by topic and locale.
- No obvious overlong or duplicate SEO title/description was found during spot review.

### Sitemap Review

- `npm.cmd run build` regenerated `public/sitemap-0.xml` through `next-sitemap`.
- The sitemap now contains the 8 new post URLs:
  - 4 Korean URLs under `/posts/personalFinance/...`
  - 4 English URLs under `/en/posts/personalFinance/...`
- The sitemap diff is not timestamp-only. It includes meaningful new post URL entries.
- The diff also includes normal build-time `lastmod` refreshes for static pages and category pages.
- The regenerated sitemap additionally surfaced a few previously existing recent post URLs that were not present in the old sitemap snapshot. This appears to be a `next-sitemap` regeneration effect, not a manual content edit.
- Decision: keep `public/sitemap-0.xml` regenerated because it contains the new backlink content URLs needed for discovery.

### Second QA Validation Results

| Check | Command | Result |
| --- | --- | --- |
| Existing monthly DCA title check | `Get-Content content\posts\personalFinance\ko\monthly-dca-10-year-result.md -TotalCount 40` and EN equivalent | KO article is 월 50만원 themed; EN title is `$500 a Month`. Anchor mismatch fixed. |
| Local cover existence | `Test-Path` for local cover paths | Passed. |
| Cloudinary cover existence | `Invoke-WebRequest -Method Head` | Passed: HTTP 200, `image/png`. |
| Internal route existence | PowerShell route/content `Test-Path` checks | Passed. |
| Table generation | `node scripts\generate_backlink_tables.js` | Passed. |
| Production build | `npm.cmd run build` | Passed. Next.js compiled and generated 199 static pages. |
| Whitespace diff check | `git diff --check` | Passed with CRLF conversion warnings only for sitemap files. |
