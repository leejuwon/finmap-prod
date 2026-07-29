# Search Weekly Input

This directory stores local-only weekly search performance inputs for FinMap search growth audits.

## Current P1-2A Periods

- Recent 7 days: `2026-07-22` to `2026-07-28`
- Previous 7 days: `2026-07-15` to `2026-07-21`
- The two periods must not overlap.

## Required Summary

Place the manual weekly baseline at:

`reports/search-weekly-input/2026-07-22_2026-07-28/weekly-summary.json`

The summary should contain only numbers directly observed by the user from GSC, Bing Webmaster Tools, Naver Search Advisor, and GA4. Do not invent missing page/query/device/country values.

## Optional GSC Detail Exports

Put these files in the recent-period directory when available:

- `gsc-recent-pages.csv`
- `gsc-previous-pages.csv`
- `gsc-recent-queries.csv`
- `gsc-previous-queries.csv`
- `gsc-recent-countries.csv`
- `gsc-previous-countries.csv`
- `gsc-recent-devices.csv`
- `gsc-previous-devices.csv`
- `gsc-recent-search-appearance.csv`
- `gsc-previous-search-appearance.csv`

If the GSC page/query files are absent, `scripts/analyze_weekly_search_growth.js` writes `DATA_REQUIRED` loss CSVs instead of fabricating loss data.

## Run

```powershell
node scripts\analyze_weekly_search_growth.js
```

Equivalent explicit form:

```powershell
node scripts\analyze_weekly_search_growth.js --current=reports/search-weekly-input/2026-07-22_2026-07-28 --previous=reports/search-weekly-input/2026-07-15_2026-07-21 --output=reports/search-growth-weekly-2026-07-22_2026-07-28.md
```

## Guardrails

- No Naver, Google, or Bing SERP scraping.
- No production deployment.
- No content, calculator, GA4 event, canonical, hreflang, robots, sitemap, redirect, or ad changes from weekly input alone.
- Keep GA4 all-traffic reports separate from channel-filtered organic reports.
