# Search Growth P1-2C Postdeploy Verification

Generated: 2026-07-29

## Overall Verdict

CONDITIONAL_PASS

- Blockers: 0
- Manual checks remaining: deploy date/time, GA4 DebugView, GSC sitemap submission screen, representative calculator input GA4 receipt

## Deployment Information

- Deploy date: MANUAL_INPUT_REQUIRED
- Deploy time: MANUAL_INPUT_REQUIRED
- Timezone: Asia/Seoul
- Commit: c10f6802211c3f1b837fe134827141147869686c
- Branch: master
- Deployment method: MANUAL_INPUT_REQUIRED
- PM2 process: MANUAL_INPUT_REQUIRED
- Build result: MANUAL_INPUT_REQUIRED
- Commit date: 2026-07-29T22:23:30+09:00
- Commit subject: Update: Finmap 성능향상1

## Production URL Results

| Group | Total | Pass | Fail |
| --- | --- | --- | --- |
| KO Track B | 3 | 3 | 0 |
| EN Track A | 3 | 3 | 0 |
| Google top loss calculator | 4 | 4 | 0 |
| New Google calculator | 2 | 2 | 0 |
| Real estate | 4 | 4 | 0 |

| Group | URL | HTTP | Canonical | Noindex | H1 | Sitemap | Hreflang | JSONLD | CTA | Snippet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| KO Track B | /posts/personalFinance/what-is-cagr | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| KO Track B | /tools/home-buying-budget-calculator | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| KO Track B | /posts/personalFinance/dsr-40-income-loan-limit-table | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| EN Track A | /en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| EN Track A | /en/posts/personalFinance/annual-vs-monthly-compound | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| EN Track A | /en/posts/personalFinance/is-dca-better-in-a-bear-market | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| Google top loss calculator | /tools/compound-interest | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| Google top loss calculator | /tools/cagr-calculator | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| Google top loss calculator | /tools/dca-calculator | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| Google top loss calculator | /tools/goal-simulator | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| New Google calculator | /tools/mortgage-loan-calculator | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| New Google calculator | /en/tools/mortgage-loan-calculator | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| Real estate | /market/real-estate | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | REVIEW |
| Real estate | /market/real-estate/seoul-top100 | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| Real estate | /market/real-estate/magok-top100 | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |
| Real estate | /market/real-estate/gangnam3-top100 | 200 | PASS | PASS | 1 | PASS | PASS | PASS | PASS | PASS |

## P0-2A Verification

Production snippet hygiene was checked on the target pages for unprotected view/comment/share/loading text, H1 availability, and first meaningful text. Detailed per-URL fields are in reports\search-growth-p1-2c-postdeploy-verification.json.

## P0-2B Verification

Internal CTA targets discovered in the checked production pages were fetched with GET only and verified for HTTP 200. Existing P0-2B script can be run separately against the production base URL for the original manifest.

## KO Track B Verification

KO Track B targets are included in the production URL table above.

## EN Track A Verification

EN Track A targets are included in the production URL table above. EN hrefs are checked as production URLs; any missing reciprocal hreflang is left as REVIEW rather than source-edited in this task.

## Mobile Browser Verification

- Status: PASS
- Scope: production hard-load checks at 320px and 390px for horizontal overflow, H1 count, page errors, hydration errors, fatal console errors, and first interactive control position.

| URL | Width | Overflow | H1 | PageErrors | Hydration | FatalConsole | FirstInputTop | TableOverflow | ResultText | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /posts/personalFinance/what-is-cagr | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 2/2 | PASS | PASS |
| /posts/personalFinance/what-is-cagr | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 2/2 | PASS | PASS |
| /tools/home-buying-budget-calculator | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 0/1 | PASS | PASS |
| /tools/home-buying-budget-calculator | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 0/1 | PASS | PASS |
| /posts/personalFinance/dsr-40-income-loan-limit-table | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 4/4 | PASS | PASS |
| /posts/personalFinance/dsr-40-income-loan-limit-table | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 4/4 | PASS | PASS |
| /en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 3/3 | PASS | PASS |
| /en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 3/3 | PASS | PASS |
| /en/posts/personalFinance/annual-vs-monthly-compound | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 3/3 | PASS | PASS |
| /en/posts/personalFinance/annual-vs-monthly-compound | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 3/3 | PASS | PASS |
| /en/posts/personalFinance/is-dca-better-in-a-bear-market | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 3/3 | PASS | PASS |
| /en/posts/personalFinance/is-dca-better-in-a-bear-market | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 3/3 | PASS | PASS |
| /tools/compound-interest | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 0/1 | PASS | PASS |
| /tools/compound-interest | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 0/1 | PASS | PASS |
| /tools/cagr-calculator | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 0/0 | PASS | PASS |
| /tools/cagr-calculator | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 0/0 | PASS | PASS |
| /tools/dca-calculator | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 0/0 | PASS | PASS |
| /tools/dca-calculator | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 0/0 | PASS | PASS |
| /tools/goal-simulator | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 0/0 | PASS | PASS |
| /tools/goal-simulator | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 0/0 | PASS | PASS |
| /tools/mortgage-loan-calculator | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 0/2 | PASS | PASS |
| /tools/mortgage-loan-calculator | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 0/2 | PASS | PASS |
| /en/tools/mortgage-loan-calculator | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 0/2 | PASS | PASS |
| /en/tools/mortgage-loan-calculator | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 0/2 | PASS | PASS |
| /market/real-estate | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 0/0 | REVIEW | PASS |
| /market/real-estate | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 0/0 | REVIEW | PASS |
| /market/real-estate/seoul-top100 | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 0/0 | PASS | PASS |
| /market/real-estate/seoul-top100 | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 0/0 | PASS | PASS |
| /market/real-estate/magok-top100 | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 0/0 | PASS | PASS |
| /market/real-estate/magok-top100 | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 0/0 | PASS | PASS |
| /market/real-estate/gangnam3-top100 | 320px | PASS | 1 | 0 | 0 | 0 | 7 | 0/0 | PASS | PASS |
| /market/real-estate/gangnam3-top100 | 390px | PASS | 1 | 0 | 0 | 0 | 8 | 0/0 | PASS | PASS |

## Calculator Verification

| URL | Status | Inputs | Buttons | CTA |
| --- | --- | --- | --- | --- |
| /tools/home-buying-budget-calculator | STATIC_HTML_PASS_BROWSER_MANUAL_RECOMMENDED | 26 | 16 | PASS |
| /tools/compound-interest | STATIC_HTML_PASS_BROWSER_MANUAL_RECOMMENDED | 23 | 13 | PASS |
| /tools/cagr-calculator | STATIC_HTML_PASS_BROWSER_MANUAL_RECOMMENDED | 18 | 7 | PASS |
| /tools/dca-calculator | STATIC_HTML_PASS_BROWSER_MANUAL_RECOMMENDED | 19 | 7 | PASS |
| /tools/goal-simulator | STATIC_HTML_PASS_BROWSER_MANUAL_RECOMMENDED | 28 | 16 | PASS |
| /tools/mortgage-loan-calculator | STATIC_HTML_PASS_BROWSER_MANUAL_RECOMMENDED | 24 | 18 | PASS |
| /en/tools/mortgage-loan-calculator | STATIC_HTML_PASS_BROWSER_MANUAL_RECOMMENDED | 24 | 18 | PASS |

Static production HTML checks passed where inputs/buttons/result text were present. The mobile browser pass above covers production rendering, hydration/page-error checks, and page-level overflow; GA4 DebugView and representative calculate-event receipt remain manual checks.

## GA4 Manual Checks

GA4 loader/config presence is recorded per URL in reports\search-growth-p1-2c-postdeploy-verification.json. DebugView and event receipt remain GA4_DEBUGVIEW_MANUAL_CHECK_REQUIRED.

## Sitemap and Robots

| URL | HTTP | XML | Locs | DCA |
| --- | --- | --- | --- | --- |
| http://127.0.0.1:8002/sitemap.xml | 200 | PASS | 1 | REVIEW |
| http://127.0.0.1:8002/sitemap-ko.xml | 200 | PASS | 111 | PASS_OR_PRESENT |
| http://127.0.0.1:8002/sitemap-en.xml | 200 | PASS | 100 | PASS_OR_PRESENT |
| http://127.0.0.1:8002/en/sitemap.xml | 200 | PASS | 100 | PASS_OR_PRESENT |

- robots.txt HTTP: 200
- robots core block: false
- robots sitemap refs: https://www.finmaphub.com/sitemap.xml, https://www.finmaphub.com/sitemap-ko.xml

## Observation Dates

- Deploy +72 hours: MANUAL_INPUT_REQUIRED
- Deploy +7 days: MANUAL_INPUT_REQUIRED
- Deploy +28 days: MANUAL_INPUT_REQUIRED
- Deploy +42 days: MANUAL_INPUT_REQUIRED

## Files Created

- reports\search-growth-p1-2c-postdeploy-verification.md
- reports\search-growth-p1-2c-postdeploy-verification.json
- reports\search-growth-p1-2c-production-url-check.csv
- reports\search-growth-p1-2c-observation-calendar.json
- reports\search-growth-90d-p1-1c-observation-baseline.json

## No Runtime Changes

This task only performed read-only production GET checks and local report/baseline updates. No content, calculator, GA4, ad, canonical, hreflang, sitemap, commit, push, or redeploy action was performed.

## Recommended Next Step

For 72 hours, monitor only technical status: HTTP, canonical, noindex, sitemap, calculator loading, and GA4. Do not rewrite content or meta during this window.
