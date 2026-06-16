# GA4 Naver Page Drop Analysis - 2026-06-16

Generated: 2026-06-16T08:03:23.292Z

## Input Status

- Before CSV: `reports\input\ga4_naver_pages_20260604_0609.csv` (missing)
- After CSV: `reports\input\ga4_naver_pages_20260610_0614.csv` (missing)
- Before period days: 6
- After period days: 5
- Before rows used: 0 / 0
- After rows used: 0 / 0
- Warning: Input file not found: C:\finmap\reports\input\ga4_naver_pages_20260604_0609.csv
- Warning: Input file not found: C:\finmap\reports\input\ga4_naver_pages_20260610_0614.csv

## Parsing Details

### Before CSV

- Parse mode: not_read
- Filter mode: not_read
- CSV rows scanned: 0
- Section line: -
- Section title: -
- Header line: -
- Data line range: - to -
- Rows used: 0 / 0
- Column indexes: page=-, views=-, activeUsers=-, eventCount=-

### After CSV

- Parse mode: not_read
- Filter mode: not_read
- CSV rows scanned: 0
- Section line: -
- Section title: -
- Header line: -
- Data line range: - to -
- Rows used: 0 / 0
- Column indexes: page=-, views=-, activeUsers=-, eventCount=-

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

- The parser first looks for a section title row whose first column starts with `#` and whose row text contains `naver`.
- It then skips comment metadata rows, uses the next non-comment row as the header, and reads only rows whose first column starts with `/`.
- The section ends at the next blank row, the next `#` row, or end of file.
- Metric columns use header names when detected. Fallback indexes are page=0, views=1, activeUsers=2, eventCount=5.
- Daily change uses 6 days for 2026-06-04 to 2026-06-09 and 5 days for 2026-06-10 to 2026-06-14 by default.
- URL groups are based on normalized page paths after removing the Korean `/ko` prefix.
