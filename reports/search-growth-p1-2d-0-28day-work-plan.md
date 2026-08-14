# Search Growth P1-2D-0 28-Day Work Plan

Generated: 2026-08-06 KST
Observation window: 2026-08-06 to 2026-09-03
Operating mix: Naver 45%, Google 40%, Measurement/Bing/Operations 15%

## Freeze Rule

Do not change the freeze URLs or their title, description, H1, slug, body, internal links, calculator UI/logic, ads, GA4 events, canonical, hreflang, sitemap, robots, structured data, redirects, or dependencies during the 28-day observation window.

## Week 1

- Lock the freeze URL list in this report and use it before every SEO/content edit request.
- Export missing GA4 landing sessions and calculator event counts by source/medium for all freeze URLs.
- Re-export Naver/GSC page and query data with direct URL filters for missing home-buying and repayment-method rows.
- Draft Google data-content specs only. Do not publish or edit pages.

## Week 2

- Monitor Naver query families: CAGR, DSR/LTV, DCA, mortgage, home buying budget, target portfolio.
- Build offline SQL/notebook prototypes for P1 Google data topics without changing routes or content.
- Review safe-refresh candidates only after backlink/core-page status is confirmed.
- Record any operational change in reports/search-growth-change-log-template.csv format.

## Week 3

- Compare GSC calculator impressions against the 2026-07-22..2026-07-28 baseline.
- Compare Naver top query CTR movement against the 2026-04-23..2026-07-19 baseline.
- Keep Google data backlog in spec/prototype status if overlap risk is HIGH.
- Prepare post-freeze cannibalization decisions for CAGR, compound, DSR/LTV, home-buying budget, and target-portfolio clusters.

## Week 4

- Perform final 28-day read on 2026-09-03.
- Mark each freeze URL as KEEP_FROZEN, RELEASE_FOR_REFRESH, or NEED_MORE_DATA.
- Promote only low-overlap Google data topics to production planning.
- Convert safe candidates to individual tickets with one URL, one query family, one measurement target, and one rollback condition.

## Allowed During Freeze

- Measurement exports and report updates.
- Offline data analysis.
- New draft specs that are not published.
- Bing/Naver/GSC verification checks.
- Change-log maintenance.

## Not Allowed During Freeze

- Page, post, calculator, sitemap, robots, internal-link, title, description, or H1 changes on freeze URLs.
- Publishing Google data pages that overlap frozen calculators.
- Broad refreshes of CAGR, compound, DSR/LTV, DCA, mortgage, FIRE, target portfolio, or real-estate dashboard content.
