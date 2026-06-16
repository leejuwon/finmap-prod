# GA4 Naver Page Drop Analysis - 2026-06-16

Generated: 2026-06-16T07:31:57.811Z

## Input Status

- Before CSV: `reports\input\ga4_naver_pages_20260604_0609.csv` (missing)
- After CSV: `reports\input\ga4_naver_pages_20260610_0614.csv` (missing)
- Before period days: 6
- After period days: 5
- Before filter mode: not_read
- After filter mode: not_read
- Before rows used: 0 / 0
- After rows used: 0 / 0
- Warning: Input file not found: C:\finmap\reports\input\ga4_naver_pages_20260604_0609.csv
- Warning: Input file not found: C:\finmap\reports\input\ga4_naver_pages_20260610_0614.csv

## Summary

| Metric | Before | After | Delta | Daily before | Daily after | Daily change |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Views | 0 | 0 | 0 | 0.00 | 0.00 | 0.0% |
| Active users | 0 | 0 | 0 | - | - | - |
| Event count | 0 | 0 | 0 | - | - | - |

## Data Gap

The requested GA4 CSV input files are not present in `reports/input`, so this report could not calculate URL-level drops yet.
Place the exported CSV files at the requested paths and rerun:

```powershell
node scripts\analyze_ga4_naver_pages.js --before=reports/input/ga4_naver_pages_20260604_0609.csv --after=reports/input/ga4_naver_pages_20260610_0614.csv
```

## Group Changes

- No rows

## Top 30 Drops

- No rows

## Top 30 Gains

- No rows

## Notes

- Daily change uses 6 days for 2026-06-04 to 2026-06-09 and 5 days for 2026-06-10 to 2026-06-14 by default.
- If a GA4 export does not include a source/medium column, the script treats rows as pre-filtered to Naver only.
- URL groups are based on normalized page paths after removing the Korean `/ko` prefix.
