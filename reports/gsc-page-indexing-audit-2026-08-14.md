# FinMap GSC Page Indexing Audit - 2026-08-14

## Final Verdict

PASS_WITH_FIXES

Source-of-truth GSC Page Indexing exports were read from `reports/search-performance/raw/gsc/page-indexing/2026-08-14/`. No package, dependency, content body, dateModified, sitemap lastmod, or production setting changes were made by this audit script.

## GSC Inventory

| Reason | Count |
| --- | ---: |
| NOINDEX | 710 |
| Crawled - currently not indexed | 62 |
| Discovered - currently not indexed | 58 |
| Alternate page with proper canonical | 42 |
| Redirect | 8 |
| Not found | 4 |
| Total not indexed reasons audited | 884 |

Expected task count check: 710 + 62 + 58 + 42 + 8 + 4 = 884. Actual export total: 884.

## Intended Index Health

- Intended-index URLs in GSC non-index exports: 99
- Source-level OK for route/canonical/sitemap/noindex checks: 99
- Source-level technical issue candidates: 0

| Desired index state | Count |
| --- | ---: |
| EXPECTED_NOINDEX | 646 |
| EXPECTED_CANONICAL_ALT | 123 |
| INTENDED_INDEX | 99 |
| EXPECTED_REDIRECT | 10 |
| LEGACY_404 | 4 |
| MALFORMED_URL | 1 |
| NEEDS_REVIEW | 1 |

## Discovered 58 Findings

- Total: 58
- INTENDED_INDEX: 58
- Technical source issue candidates: 0
- ORPHAN_CANDIDATE by conservative source scan: 0

The discovered set is primarily canonical posts plus the home-buying-budget calculator pair. Category pages and tool hubs provide crawlable links for these source-known pages; the audit did not add bulk footer links.

## Crawled 62 Findings

- Total: 62
- INTENDED_INDEX: 40
- EXPECTED_NOINDEX / apt policy: 7
- EXPECTED_CANONICAL_ALT / parameter or apt alternate: 10
- Technical source issue candidates: 0

Priority EN URLs requested in the brief are present as INTENDED_INDEX unless absent from the export; use the priority file for manual URL Inspection.

## Apartment NOINDEX Policy

- Source policy: `/market/real-estate/apt/[aptKey]` sets `seoRobots = noindex,follow` and also sends `X-Robots-Tag: noindex, follow` when an apartment stats row exists.
- Source policy: apartment detail URLs are excluded from `next-sitemap.config.js` and `buildAptDetailPaths()` intentionally returns an empty list.
- GSC apt rows audited: 752
- clean URL rows: 644
- query URL rows: 108
- KO rows: 404
- EN rows: 348
- NOINDEX export apt rows: 710

Conclusion: the 710 NOINDEX cluster is expected policy, not a bulk index recovery candidate. Any apartment index expansion should be a separate approved policy change with content/data thresholds.

## Crawl Waste Findings

- Parameter/canonical alternate, malformed, legacy redirect, or legacy 404 rows: 138
- Forbidden sitemap loc patterns: 0
- Sitemap loc total across checked sitemap files: 522

No query URLs, apartment detail URLs, duplicate `/en/en`, `/ko`, or legacy `/posts/*/(ko|en)/*` URLs were found in sitemap loc entries.

Real-estate UI can still expose share/state parameters, but sitemap generation keeps canonical inventory clean.

## Source Changes

- Added `scripts/audit_gsc_page_indexing.js` as a read-only GSC xlsx/sitemap/source inventory audit utility.
- Added safe 301 redirect candidates for language-slug crossed legacy 404 URLs in `next.config.js` and `web.js`.

## Priority Recovery URLs

| Priority | URL | Type | GSC reason | Action |
| --- | --- | --- | --- | --- |
| P0 | https://www.finmaphub.com/en/posts/economicInfo/inflation-rate-basics | post | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P0 | https://www.finmaphub.com/en/posts/investingInfo/tnx-basics | post | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P0 | https://www.finmaphub.com/en/posts/personalFinance/apt-dashboard-home-goal-roadmap | post | Discovered - currently not indexed | URL_INSPECTION_RECHECK |
| P0 | https://www.finmaphub.com/en/posts/personalFinance/personal-finance-3pillars | post | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P0 | https://www.finmaphub.com/en/posts/personalFinance/simple-vs-compound | post | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P0 | https://www.finmaphub.com/en/posts/personalFinance/what-is-cagr | post | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P0 | https://www.finmaphub.com/posts/personalFinance/apt-dashboard-home-goal-roadmap | post | Discovered - currently not indexed | URL_INSPECTION_RECHECK |
| P0 | https://www.finmaphub.com/en/market/real-estate | real-estate-hub | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P0 | https://www.finmaphub.com/en/tools/compound-interest | tool | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P0 | https://www.finmaphub.com/en/tools/goal-simulator | tool | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P0 | https://www.finmaphub.com/en/tools/home-buying-budget-calculator | tool | Discovered - currently not indexed | URL_INSPECTION_RECHECK |
| P0 | https://www.finmaphub.com/tools/home-buying-budget-calculator | tool | Discovered - currently not indexed | URL_INSPECTION_RECHECK |
| P1 | https://www.finmaphub.com/en/posts/economicInfo/eu-russia-gas-phaseout-price-channel | post | Discovered - currently not indexed | URL_INSPECTION_RECHECK |
| P1 | https://www.finmaphub.com/en/posts/economicInfo/fx-basics | post | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P1 | https://www.finmaphub.com/en/posts/economicInfo/geopolitics-to-usd-liquidity-fx | post | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P1 | https://www.finmaphub.com/en/posts/economicInfo/gold-geopolitics-real-rates-dollar-uncertainty | post | Discovered - currently not indexed | URL_INSPECTION_RECHECK |
| P1 | https://www.finmaphub.com/en/posts/economicInfo/hormuz-risk-oil-insurance-freight-premium | post | Discovered - currently not indexed | URL_INSPECTION_RECHECK |
| P1 | https://www.finmaphub.com/en/posts/economicInfo/indicator-basics | post | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P1 | https://www.finmaphub.com/en/posts/economicInfo/interest-rate-basics | post | Crawled - currently not indexed | URL_INSPECTION_RECHECK |
| P1 | https://www.finmaphub.com/en/posts/economicInfo/policy-rate-cut-market-rates | post | Discovered - currently not indexed | URL_INSPECTION_RECHECK |

Full priority list: `reports/gsc-index-recovery-priority-2026-08-14.txt`.

## Verification

- `node scripts/audit_gsc_page_indexing.js`: PASS
- Additional syntax/build checks should be recorded in the final response after execution.

## Remaining Manual Actions

- After build/deploy, use GSC URL Inspection on P0/P1 priority URLs only.
- Do not request indexing for expected exclusions: apt noindex pages, parameter canonical alternates, redirect sources, static noise, or legacy 404 URLs.
- Monitor Page Indexing validation status separately from page runtime health; the Korean `submitted/in progress` and `failed` labels in the export are GSC validation states.

