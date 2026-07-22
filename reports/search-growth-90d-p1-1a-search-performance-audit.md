# FinMap 검색 유입 90일 P1-1A 검색 성과 병합 감사

- 기준일: 2026-07-22
- 분석 범위: local-only search performance CSV parsing and merge
- 배포/운영/검색도구 계정 변경: 없음

## 1. Executive Summary

실제 입력 CSV 10개를 진단했고, 기존 URL inventory 192개와 병합했습니다.
검색 성과가 관측된 inventory URL은 100개이며, inventory에 없는 입력 URL은 13개입니다.
P1-1B 우선 후보는 6개, 관찰 대상은 10개로 제한했습니다.

## 2. Local-only Analysis Scope

이번 작업은 로컬 분석 산출물 생성만 수행했습니다. 운영 서버, 운영 DB, 검색도구 계정, 배포, git commit, git push는 수행하지 않았습니다.

## 3. Input Files

| File | Platform | Type | Rows | Status |
| --- | --- | --- | --- | --- |
| reports\search-performance-input\bing-daily-2026-04-23_2026-07-19.csv | bing | daily | 88 | PASS |
| reports\search-performance-input\bing-pages-2026-04-23_2026-07-19.csv | bing | pages | 86 | PASS |
| reports\search-performance-input\bing-queries-2026-04-23_2026-07-19.csv | bing | queries | 569 | PASS |
| reports\search-performance-input\gsc-daily-2026-04-23_2026-07-19.csv | gsc | daily | 33 | PASS |
| reports\search-performance-input\gsc-filter-2026-04-23_2026-07-19.csv | gsc | filter | 2 | PASS |
| reports\search-performance-input\gsc-pages-2026-04-23_2026-07-19.csv | gsc | pages | 33 | PASS |
| reports\search-performance-input\gsc-queries-2026-04-23_2026-07-19.csv | gsc | queries | 5 | PASS |
| reports\search-performance-input\naver-daily-2026-04-23_2026-07-19.csv | naver | daily | 2 | PASS |
| reports\search-performance-input\naver-pages-top30-2026-04-23_2026-07-19.csv | naver | pages | 30 | PASS |
| reports\search-performance-input\naver-queries-top30-2026-04-23_2026-07-19.csv | naver | queries | 30 | PASS |

## 4. Encoding and Delimiter Detection

| File | Encoding | BOM | Delimiter | Warnings |
| --- | --- | --- | --- | --- |
| reports\search-performance-input\bing-daily-2026-04-23_2026-07-19.csv | utf-8 | false | , | none |
| reports\search-performance-input\bing-pages-2026-04-23_2026-07-19.csv | utf-8 | false | , | FILE_LEVEL_RANGE_ONLY |
| reports\search-performance-input\bing-queries-2026-04-23_2026-07-19.csv | euc-kr | false | , | FILE_LEVEL_RANGE_ONLY |
| reports\search-performance-input\gsc-daily-2026-04-23_2026-07-19.csv | utf-8 | false | , | none |
| reports\search-performance-input\gsc-filter-2026-04-23_2026-07-19.csv | utf-8 | false | , | none |
| reports\search-performance-input\gsc-pages-2026-04-23_2026-07-19.csv | utf-8 | false | , | FILE_LEVEL_RANGE_ONLY |
| reports\search-performance-input\gsc-queries-2026-04-23_2026-07-19.csv | utf-8 | false | , | FILE_LEVEL_RANGE_ONLY |
| reports\search-performance-input\naver-daily-2026-04-23_2026-07-19.csv | euc-kr | false | , | none |
| reports\search-performance-input\naver-pages-top30-2026-04-23_2026-07-19.csv | euc-kr | false | , | FILE_LEVEL_RANGE_ONLY |
| reports\search-performance-input\naver-queries-top30-2026-04-23_2026-07-19.csv | euc-kr | false | , | FILE_LEVEL_RANGE_ONLY |

## 5. Requested Date Range

| File | Requested Start | Requested End |
| --- | --- | --- |
| reports\search-performance-input\bing-daily-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 |
| reports\search-performance-input\bing-pages-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 |
| reports\search-performance-input\bing-queries-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 |
| reports\search-performance-input\gsc-daily-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 |
| reports\search-performance-input\gsc-filter-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 |
| reports\search-performance-input\gsc-pages-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 |
| reports\search-performance-input\gsc-queries-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 |
| reports\search-performance-input\naver-daily-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 |
| reports\search-performance-input\naver-pages-top30-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 |
| reports\search-performance-input\naver-queries-top30-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 |

## 6. Actual Data Ranges

| File | Actual Start | Actual End | Source |
| --- | --- | --- | --- |
| reports\search-performance-input\bing-daily-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 | row_dates |
| reports\search-performance-input\bing-pages-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 | file_name |
| reports\search-performance-input\bing-queries-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 | file_name |
| reports\search-performance-input\gsc-daily-2026-04-23_2026-07-19.csv | 2026-06-17 | 2026-07-19 | row_dates |
| reports\search-performance-input\gsc-filter-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 | filter_file |
| reports\search-performance-input\gsc-pages-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 | file_name |
| reports\search-performance-input\gsc-queries-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 | file_name |
| reports\search-performance-input\naver-daily-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 | row_dates |
| reports\search-performance-input\naver-pages-top30-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 | file_name |
| reports\search-performance-input\naver-queries-top30-2026-04-23_2026-07-19.csv | 2026-04-23 | 2026-07-19 | file_name |

## 7. GSC Data Quality

| Type | Encoding | Delimiter | Rows | Actual Range | Warnings |
| --- | --- | --- | --- | --- | --- |
| daily | utf-8 | , | 33 | 2026-06-17 ~ 2026-07-19 | none |
| filter | utf-8 | , | 2 | 2026-04-23 ~ 2026-07-19 | none |
| pages | utf-8 | , | 33 | 2026-04-23 ~ 2026-07-19 | FILE_LEVEL_RANGE_ONLY |
| queries | utf-8 | , | 5 | 2026-04-23 ~ 2026-07-19 | FILE_LEVEL_RANGE_ONLY |

## 8. Naver Data Quality

| Type | Encoding | Delimiter | Rows | Actual Range | Warnings |
| --- | --- | --- | --- | --- | --- |
| daily | euc-kr | , | 2 | 2026-04-23 ~ 2026-07-19 | none |
| pages | euc-kr | , | 30 | 2026-04-23 ~ 2026-07-19 | FILE_LEVEL_RANGE_ONLY |
| queries | euc-kr | , | 30 | 2026-04-23 ~ 2026-07-19 | FILE_LEVEL_RANGE_ONLY |

## 9. Bing Data Quality

| Type | Encoding | Delimiter | Rows | Actual Range | Warnings |
| --- | --- | --- | --- | --- | --- |
| daily | utf-8 | , | 88 | 2026-04-23 ~ 2026-07-19 | none |
| pages | utf-8 | , | 86 | 2026-04-23 ~ 2026-07-19 | FILE_LEVEL_RANGE_ONLY |
| queries | euc-kr | , | 569 | 2026-04-23 ~ 2026-07-19 | FILE_LEVEL_RANGE_ONLY |

## 10. Naver TOP 30 Limitations

- Naver queries/pages are marked `CLICK_TOP_30`.
- Naver TOP 30 is not treated as a complete query or URL dataset.
- Naver daily totals, query TOP 30, and page TOP 30 totals were not force-reconciled.
- Naver horizontal daily dates were reconstructed from filename range and column sequence.

## 11. URL Normalization

- Protocol, host, query string, hash, duplicated slash, and trailing slash were normalized.
- `/en` prefix was preserved.
- External hosts were not merged into FinMap inventory.

## 12. Inventory Merge Results

- inventory URLs: 192
- merged URLs with observed data: 100
- unmatched input URLs: 13

## 13. Daily Search Trend

| Platform | Recorded days | First date | Last date | Clicks | Impressions | CTR |
| --- | --- | --- | --- | --- | --- | --- |
| gsc | 4 | 2026-06-17 | 2026-07-19 | 33 | 0 | 168 | 0 |
| naver | 3 | 2026-04-23 | 2026-07-19 | 88 | 623 | 83117 | 0.0075 |
| bing | 3 | 2026-04-23 | 2026-07-19 | 88 | 16 | 2139 | 0.0075 |

First 4 weeks vs last 4 weeks:

| Platform | First 4w clicks | Last 4w clicks | First 4w impressions | Last 4w impressions |
| --- | --- | --- | --- | --- |
| gsc | 0 | 0 | 147 | 136 |
| naver | 33 | 226 | 865 | 49669 |
| bing | 5 | 7 | 470 | 662 |

## 14. Platform Comparison

GSC/Bing page-level data and Naver TOP 30 page data are kept separate in the merged CSV. `known_clicks_excluding_naver_total` excludes Naver TOP 30, while `platform_observed_clicks` includes observed Naver TOP 30 clicks.

## 15. Branded vs Non-Branded

| Segment | Queries | Clicks | Impressions |
| --- | --- | --- | --- |
| branded | 5 | 0 | 17 |
| non-branded | 599 | 299 | 26747 |

## 16. QUICK_WIN

| URL | Type | Clicks | Impressions | CTR | Position | Naver | Confidence | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /en/posts/personalFinance/is-dca-better-in-a-bear-market | QUICK_WIN |  | 352 | 0 | 4.67 |  | SUFFICIENT | 100 |
| /en/posts/personalFinance/annual-vs-monthly-compound | QUICK_WIN |  | 150 | 0 | 9.6 |  | SUFFICIENT | 91 |
| /en/posts/investingInfo/dxy-dollar-index-basics | QUICK_WIN |  | 300 | 0 | 8.32 |  | SUFFICIENT | 85 |
| /en/posts/investingInfo/tnx-basics | QUICK_WIN | 2 | 153 | 0.0131 | 9.84 |  | SUFFICIENT | 79 |
| /en/posts/personalFinance/dca-vs-lump-sum-when-results-differ | QUICK_WIN |  | 41 | 0 | 9 |  | SUFFICIENT | 78 |

## 17. PAGE_ONE_CANDIDATE

| URL | Type | Clicks | Impressions | CTR | Position | Naver | Confidence | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio | PAGE_ONE_CANDIDATE |  | 400 | 0 | 29 |  | SUFFICIENT | 83 |

## 18. CTR_REPAIR

- 해당 항목 없음

## 19. GROWTH_CANDIDATE

- 해당 항목 없음

## 20. NAVER_WINNER

| URL | Type | Clicks | Impressions | CTR | Position | Naver | Confidence | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /posts/economicInfo/inflation-rate-basics | NAVER_WINNER | 21 | 2362 | 0.0089 | 7.1 | top30 #10 | SUFFICIENT | 89 |
| /tools/cagr-calculator | NAVER_WINNER | 95 | 16277 | 0.0058 | 7 | top30 #2 | LIMITED | 87 |
| /market/real-estate/magok-top100 | NAVER_WINNER | 40 | 1289 | 0.031 | 5.43 | top30 #6 | LIMITED | 81 |
| /posts/personalFinance/annual-vs-monthly-compound | NAVER_WINNER | 9 | 334 | 0.0269 | 5 | top30 #14 | LIMITED | 78 |
| /market/real-estate/songpa-top100 | NAVER_WINNER | 37 | 2313 | 0.016 | 3 | top30 #7 | LIMITED | 77 |
| /tools/dsr-ltv-calculator | NAVER_WINNER | 118 | 34585 | 0.0034 | 7 | top30 #1 | LIMITED | 77 |
| /market/real-estate/seoul-top100 | NAVER_WINNER | 44 | 2850 | 0.0154 | 5.38 | top30 #4 | LIMITED | 75 |
| /posts/personalFinance/dsr-40-income-loan-limit-table | NAVER_WINNER | 18 | 541 | 0.0333 | 6.67 | top30 #12 | LIMITED | 72 |
| /market/real-estate/gangnam-top100 | NAVER_WINNER | 11 | 890 | 0.0124 | 8.33 | top30 #13 | LIMITED | 70 |
| /market/real-estate | NAVER_WINNER | 4 | 64 | 0.0625 | 6 | top30 #24 | LIMITED | 69 |

## 21. HOLD

| URL | Type | Clicks | Impressions | CTR | Position | Naver | Confidence | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /en/market/real-estate/magok-top100 | HOLD |  | 1 | 0 | 1 |  | VERY_LOW | 100 |
| /en/tools/dsr-ltv-calculator | HOLD |  | 3 | 0 | 2 |  | VERY_LOW | 100 |
| /market/real-estate/mayongseong-top100 | HOLD |  | 1 | 0 | 3 |  | VERY_LOW | 100 |
| /en/market/real-estate | HOLD |  | 8 | 0 | 3.63 |  | VERY_LOW | 94 |
| /en/posts/personalFinance/dca-step-up-ruleset | HOLD |  | 1 | 0 | 1 |  | VERY_LOW | 92 |
| /en/posts/personalFinance/dsr-40-income-loan-limit-table | HOLD |  | 6 | 0 | 6 |  | VERY_LOW | 91 |
| /en/posts/personalFinance/dca-vs-lumpsum-decision-rules | HOLD |  | 1 | 0 | 3 |  | VERY_LOW | 90 |
| /en/posts/investingInfo/cagr-7percent-reality-check | HOLD | 1 | 25 | 0.04 | 3.67 |  | LIMITED | 88 |
| /posts/economicInfo/real-rates-and-breakevens | HOLD |  | 3 | 0 | 4.33 |  | VERY_LOW | 87 |
| /posts/investingInfo/indicator-marketinfo | HOLD |  | 3 | 0 | 4.67 |  | VERY_LOW | 86 |

## 22. Possible Cannibalization and Data Limitations

- No page-query dataset was available, so cannibalization is not confirmed.
- Query rows include `LIMITED_DATA`, `MANUAL_REVIEW_REQUIRED`, or `POSSIBLE_OVERLAP` style signals only.
- GSC anonymous query handling can make page totals and query totals differ.
- Bing may omit position for some exports; missing position was left blank.

## 23. Priority URLs for P1-1B

| URL | Type | Clicks | Impressions | CTR | Position | Naver | Confidence | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /en/posts/personalFinance/is-dca-better-in-a-bear-market | QUICK_WIN |  | 352 | 0 | 4.67 |  | SUFFICIENT | 100 |
| /en/posts/personalFinance/annual-vs-monthly-compound | QUICK_WIN |  | 150 | 0 | 9.6 |  | SUFFICIENT | 91 |
| /en/posts/investingInfo/dxy-dollar-index-basics | QUICK_WIN |  | 300 | 0 | 8.32 |  | SUFFICIENT | 85 |
| /en/posts/investingInfo/tnx-basics | QUICK_WIN | 2 | 153 | 0.0131 | 9.84 |  | SUFFICIENT | 79 |
| /en/posts/personalFinance/dca-vs-lump-sum-when-results-differ | QUICK_WIN |  | 41 | 0 | 9 |  | SUFFICIENT | 78 |
| /en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio | PAGE_ONE_CANDIDATE |  | 400 | 0 | 29 |  | SUFFICIENT | 83 |

## 24. Observation URLs

| URL | Type | Clicks | Impressions | CTR | Position | Naver | Confidence | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /posts/economicInfo/inflation-rate-basics | NAVER_WINNER | 21 | 2362 | 0.0089 | 7.1 | top30 #10 | SUFFICIENT | 89 |
| /tools/cagr-calculator | NAVER_WINNER | 95 | 16277 | 0.0058 | 7 | top30 #2 | LIMITED | 87 |
| /market/real-estate/magok-top100 | NAVER_WINNER | 40 | 1289 | 0.031 | 5.43 | top30 #6 | LIMITED | 81 |
| /posts/personalFinance/annual-vs-monthly-compound | NAVER_WINNER | 9 | 334 | 0.0269 | 5 | top30 #14 | LIMITED | 78 |
| /market/real-estate/songpa-top100 | NAVER_WINNER | 37 | 2313 | 0.016 | 3 | top30 #7 | LIMITED | 77 |
| /tools/dsr-ltv-calculator | NAVER_WINNER | 118 | 34585 | 0.0034 | 7 | top30 #1 | LIMITED | 77 |
| /market/real-estate/seoul-top100 | NAVER_WINNER | 44 | 2850 | 0.0154 | 5.38 | top30 #4 | LIMITED | 75 |
| /posts/personalFinance/dsr-40-income-loan-limit-table | NAVER_WINNER | 18 | 541 | 0.0333 | 6.67 | top30 #12 | LIMITED | 72 |
| /market/real-estate/gangnam-top100 | NAVER_WINNER | 11 | 890 | 0.0124 | 8.33 | top30 #13 | LIMITED | 70 |
| /market/real-estate | NAVER_WINNER | 4 | 64 | 0.0625 | 6 | top30 #24 | LIMITED | 69 |

## 25. Data Gaps

- No page-query export for GSC/Bing.
- Naver query/page exports are TOP 30 only.
- GSC actual daily data starts later than the requested filename range.
- Some GSC URLs point to apt detail paths that are not part of the 192 URL inventory.

## 26. Files Created

- `scripts/analyze_search_performance_inputs.js`
- `reports/search-growth-90d-p1-1a-performance-merged.csv`
- `reports/search-growth-90d-p1-1a-query-map.csv`
- `reports/search-growth-90d-p1-1a-daily-merged.csv`
- `reports/search-growth-90d-p1-1a-priority.json`
- `reports/search-growth-90d-p1-1a-input-diagnostics.json`
- `reports/search-growth-90d-p1-1a-search-performance-audit.md`
- `reports/search-growth-90d-p1-1a-naver-daily-normalized.csv`

## 27. Verification

- `node scripts\analyze_search_performance_inputs.js`: PASS

## 28. No Content Changes

No title, description, H1, first paragraph, body, internal links, calculator UI, calculator logic, calculator results, GA4, ads, canonical, hreflang, robots, or sitemap policy was changed.

## 29. Recommended P1-1B Scope

Use the priority JSON as a shortlist only. Split P1-1B into 3-5 URL batches and edit only after reviewing each URL's visible SERP intent, current title/H1, and recrawl risk.
