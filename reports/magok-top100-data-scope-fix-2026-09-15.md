# Magok Top100 Data Scope Fix - 2026-09-15

## 1. Final Verdict

PASS_MAGOK_SCOPE_FIXED

## 2. Previous Root Cause

`/market/real-estate/magok-top100` used only `s.lawd_cd = ?`, so the Top100 query selected all Gangseo-gu rows. The intended page scope is Gangseo-gu Magok-dong.

## 3. DB Schema Verification

- Main source table: `re_trade_apt_stats_m`
- Verified columns include `lawd_cd`, `dong_name`, `apt_key`, `deal_ym`, `pyeong_band`, `tx_count`, and `median_price`.
- Live DB validation status: `PASS`

## 4. Distinct Gangseo Dong Values

| dong_name | rows | apt_count | months | latest_ym | tx_count |
| --- | --- | --- | --- | --- | --- |
| 가양동 | 2686 | 24 | 248 | 202608 | 12242 |
| 공항동 | 270 | 9 | 162 | 202608 | 523 |
| 내발산동 | 3883 | 91 | 248 | 202608 | 8646 |
| 등촌동 | 5000 | 69 | 247 | 202608 | 13410 |
| 마곡동 | 2602 | 37 | 246 | 202608 | 5513 |
| 방화동 | 4938 | 64 | 248 | 202608 | 13756 |
| 염창동 | 5846 | 72 | 249 | 202608 | 12238 |
| 화곡동 | 8131 | 297 | 249 | 202608 | 17083 |

## 5. Magok Data Existence

```json
{
  "row_count": 2602,
  "apt_count": 37,
  "month_count": 246,
  "latest_ym": "202608",
  "tx_count": "5513"
}
```

## 6. Before SQL

```js
regionWhereSql: "s.lawd_cd  = ?",
regionParams: [REGION.lawd],
```

## 7. After SQL

```js
regionWhereSql: "s.lawd_cd = ? AND s.dong_name = ?",
regionParams: [REGION.lawd, REGION.dongName],
```

## 8. Parameter Binding

- `REGION.dongName = "마곡동"`
- Captured SQL uses placeholders for both `s.lawd_cd` and `s.dong_name`.
- Captured params:

```json
[
  "202608",
  "202608",
  "all",
  "11500",
  "마곡동",
  "202608",
  "202608",
  "all",
  "11500",
  "마곡동",
  "all",
  100
]
```

## 9. Latest Month Verification

```json
{
  "latestYm": "202608",
  "latestMonthMagok": {
    "deal_ym": "202608",
    "row_count": 11,
    "apt_count": 11,
    "tx_count": "15",
    "distinct_dong_count": 1
  },
  "page": {
    "period": "202608",
    "fromYm": "202608",
    "toYm": "202608"
  }
}
```

## 10. Range / Area Verification

| case | rows | distinct_dongs | distribution | non_magok |
| --- | --- | --- | --- | --- |
| pm/all | 11 | 1 | {"마곡동":11} | 0 |
| m3/all | 23 | 1 | {"마곡동":23} | 0 |
| en/pm/all | 11 | 1 | {"마곡동":11} | 0 |
| pm/band=10 | 5 | 1 | {"마곡동":5} | 0 |

## 11. Returned Dong Distribution

```json
{
  "마곡동": 11
}
```

## 12. Magok Row Count

- Returned rows: 11
- Non-Magok rows: 0
- Top100 limit respected: yes

## 13. Other Landing Integrity

- Other landing files changed: none
- Protected hashed files changed: none

## 14. Files Changed

- `pages/market/real-estate/magok-top100.js`: scope condition changed from Gangseo-gu only to Gangseo-gu + Magok-dong.
- `scripts/verify_magok_top100_scope.js`: added live DB validation and report generation.
- `reports/magok-top100-scope-evidence-2026-09-15.json`: validation evidence.
- `reports/magok-top100-data-scope-fix-2026-09-15.md`: this report.

## 15. Protected Experiment Integrity

- Protected calculator/search experiment files changed: none

## 16. Build / SSR Verification

- Source/fixture verification: PASS_MAGOK_SCOPE_FIXED
- Live DB SSR getServerSideProps verification: PASS
- `npm.cmd run build`: PASS
- `node scripts/verify_magok_top100_scope.js`: PASS (`liveDb=PASS`, latestYm `202608`, returned rows `11`, distribution `{"마곡동":11}`)
- `node scripts/verify_naver_real_estate_dashboard_p1.js`: render phase failed on SSR Top100 routes with generic `Error`; local HTTP phase passed.
- `node scripts/verify_naver_real_estate_dashboard_p1.js --phase=local --base-url=http://127.0.0.1:8002`: PASS (19 routes, failures `[]`; `/market/real-estate/magok-top100` HTTP 200, rows `11`; `/en/market/real-estate/magok-top100` HTTP 200, rows `11`)
- `git diff --check`: PASS

## 17. Remaining Risks

- The Top100 page intentionally shows fewer than 100 rows if Magok-dong has fewer eligible rows for the selected range/band.
- This fix does not alter other real-estate landing pages, calculators, canonical URLs, hreflang, sitemap, robots, or redirects.
