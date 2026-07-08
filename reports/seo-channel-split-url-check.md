# SEO Channel Split URL Check

- Checked at: 2026-07-08T15:06:50.281Z
- Fetch base: http://127.0.0.1:8017
- URL samples: 22
- Failures: 0
- sitemap-0.xml URL count: 205
- sitemap-ko.xml URL count: 107
- sitemap-en.xml URL count: 98
- sitemap-en.xml required URLs: 16/16
- /en/sitemap.xml exists: yes
- /en/sitemap.xml URL count: 98
- /en/sitemap.xml EN-only locs: PASS
- Forbidden sitemap loc patterns: PASS (0)
- Sitemap membership normalizes the root host-only loc to `https://www.finmaphub.com/` for canonical comparison.

| Path | Lang | Status | Final URL | Canonical | hreflang ko | hreflang en | x-default | Meta robots | X-Robots-Tag | Sitemap | EN prefix sitemap | Result | Notes |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | ko | 200 | https://www.finmaphub.com/ | https://www.finmaphub.com/ | https://www.finmaphub.com/ | https://www.finmaphub.com/en | https://www.finmaphub.com/ | - | - | main:yes, ko:yes | N/A | PASS | OK |
| /en | en | 200 | https://www.finmaphub.com/en | https://www.finmaphub.com/en | https://www.finmaphub.com/ | https://www.finmaphub.com/en | https://www.finmaphub.com/ | - | - | main:yes, en:yes | yes | PASS | OK |
| /tools | ko | 200 | https://www.finmaphub.com/tools | https://www.finmaphub.com/tools | https://www.finmaphub.com/tools | https://www.finmaphub.com/en/tools | - | - | - | main:yes, ko:yes | N/A | PASS | OK |
| /en/tools | en | 200 | https://www.finmaphub.com/en/tools | https://www.finmaphub.com/en/tools | https://www.finmaphub.com/tools | https://www.finmaphub.com/en/tools | - | - | - | main:yes, en:yes | yes | PASS | OK |
| /en/tools/compound-interest | en | 200 | https://www.finmaphub.com/en/tools/compound-interest | https://www.finmaphub.com/en/tools/compound-interest | https://www.finmaphub.com/tools/compound-interest | https://www.finmaphub.com/en/tools/compound-interest | - | - | - | main:yes, en:yes | yes | PASS | OK |
| /en/tools/cagr-calculator | en | 200 | https://www.finmaphub.com/en/tools/cagr-calculator | https://www.finmaphub.com/en/tools/cagr-calculator | https://www.finmaphub.com/tools/cagr-calculator | https://www.finmaphub.com/en/tools/cagr-calculator | - | - | - | main:yes, en:yes | yes | PASS | OK |
| /tools/dca-calculator | ko | 200 | https://www.finmaphub.com/tools/dca-calculator | https://www.finmaphub.com/tools/dca-calculator | https://www.finmaphub.com/tools/dca-calculator | https://www.finmaphub.com/en/tools/dca-calculator | - | - | - | main:yes, ko:yes | N/A | PASS | OK |
| /en/tools/dca-calculator | en | 200 | https://www.finmaphub.com/en/tools/dca-calculator | https://www.finmaphub.com/en/tools/dca-calculator | https://www.finmaphub.com/tools/dca-calculator | https://www.finmaphub.com/en/tools/dca-calculator | - | - | - | main:yes, en:yes | yes | PASS | OK |
| /en/tools/dsr-ltv-calculator | en | 200 | https://www.finmaphub.com/en/tools/dsr-ltv-calculator | https://www.finmaphub.com/en/tools/dsr-ltv-calculator | https://www.finmaphub.com/tools/dsr-ltv-calculator | https://www.finmaphub.com/en/tools/dsr-ltv-calculator | - | - | - | main:yes, en:yes | yes | PASS | OK |
| /en/tools/fire-calculator | en | 200 | https://www.finmaphub.com/en/tools/fire-calculator | https://www.finmaphub.com/en/tools/fire-calculator | https://www.finmaphub.com/tools/fire-calculator | https://www.finmaphub.com/en/tools/fire-calculator | - | - | - | main:yes, en:yes | yes | PASS | OK |
| /en/tools/goal-simulator | en | 200 | https://www.finmaphub.com/en/tools/goal-simulator | https://www.finmaphub.com/en/tools/goal-simulator | https://www.finmaphub.com/tools/goal-simulator | https://www.finmaphub.com/en/tools/goal-simulator | - | - | - | main:yes, en:yes | yes | PASS | OK |
| /market/real-estate | ko | 200 | https://www.finmaphub.com/market/real-estate | https://www.finmaphub.com/market/real-estate | https://www.finmaphub.com/market/real-estate | https://www.finmaphub.com/en/market/real-estate | - | index,follow,max-image-preview:large | - | main:yes, ko:yes | N/A | PASS | OK |
| /en/market/real-estate | en | 200 | https://www.finmaphub.com/en/market/real-estate | https://www.finmaphub.com/en/market/real-estate | https://www.finmaphub.com/market/real-estate | https://www.finmaphub.com/en/market/real-estate | - | index,follow,max-image-preview:large | - | main:yes, en:yes | yes | PASS | OK |
| /en/market/indices | en | 200 | https://www.finmaphub.com/en/market/indices | https://www.finmaphub.com/en/market/indices | https://www.finmaphub.com/market/indices | https://www.finmaphub.com/en/market/indices | - | - | - | main:yes, en:yes | yes | PASS | OK |
| /posts/personalFinance/dsr-40-income-loan-limit-table | ko | 200 | https://www.finmaphub.com/posts/personalFinance/dsr-40-income-loan-limit-table | https://www.finmaphub.com/posts/personalFinance/dsr-40-income-loan-limit-table | https://www.finmaphub.com/posts/personalFinance/dsr-40-income-loan-limit-table | https://www.finmaphub.com/en/posts/personalFinance/dsr-40-income-loan-limit-table | - | - | - | main:yes, ko:yes | N/A | PASS | OK |
| /en/posts/personalFinance/dsr-40-income-loan-limit-table | en | 200 | https://www.finmaphub.com/en/posts/personalFinance/dsr-40-income-loan-limit-table | https://www.finmaphub.com/en/posts/personalFinance/dsr-40-income-loan-limit-table | https://www.finmaphub.com/posts/personalFinance/dsr-40-income-loan-limit-table | https://www.finmaphub.com/en/posts/personalFinance/dsr-40-income-loan-limit-table | - | - | - | main:yes, en:yes | yes | PASS | OK |
| /posts/personalFinance/is-dca-better-in-bear-market | ko | 200 | https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-bear-market | https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-bear-market | https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-bear-market | https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-a-bear-market | - | - | - | main:yes, ko:yes | N/A | PASS | OK |
| /en/posts/personalFinance/is-dca-better-in-a-bear-market | en | 200 | https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-a-bear-market | https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-a-bear-market | https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-bear-market | https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-a-bear-market | - | - | - | main:yes, en:yes | yes | PASS | OK |
| /posts/personalFinance/how-much-per-month-for-100m | ko | 200 | https://www.finmaphub.com/posts/personalFinance/how-much-per-month-for-100m | https://www.finmaphub.com/posts/personalFinance/how-much-per-month-for-100m | https://www.finmaphub.com/posts/personalFinance/how-much-per-month-for-100m | - | - | - | - | main:yes, ko:yes | N/A | PASS | OK |
| /en/posts/personalFinance/how-much-per-month-for-100m | en | 200 | https://www.finmaphub.com/en/posts/personalFinance/how-much-per-month-for-100m | https://www.finmaphub.com/en/posts/personalFinance/how-much-per-month-for-100m | - | https://www.finmaphub.com/en/posts/personalFinance/how-much-per-month-for-100m | - | - | - | main:yes, en:yes | yes | PASS | OK |
| /posts/personalFinance/what-is-cagr | ko | 200 | https://www.finmaphub.com/posts/personalFinance/what-is-cagr | https://www.finmaphub.com/posts/personalFinance/what-is-cagr | https://www.finmaphub.com/posts/personalFinance/what-is-cagr | https://www.finmaphub.com/en/posts/personalFinance/what-is-cagr | - | - | - | main:yes, ko:yes | N/A | PASS | OK |
| /en/posts/personalFinance/what-is-cagr | en | 200 | https://www.finmaphub.com/en/posts/personalFinance/what-is-cagr | https://www.finmaphub.com/en/posts/personalFinance/what-is-cagr | https://www.finmaphub.com/posts/personalFinance/what-is-cagr | https://www.finmaphub.com/en/posts/personalFinance/what-is-cagr | - | - | - | main:yes, en:yes | yes | PASS | OK |

## Sitemap Policy Check

| Sitemap | URL count |
| --- | ---: |
| sitemap-0.xml | 205 |
| sitemap-ko.xml | 107 |
| sitemap-en.xml | 98 |
| en/sitemap.xml | 98 |

- Forbidden loc pattern check: PASS
- /en/sitemap.xml EN-only loc check: PASS

- No forbidden sitemap loc patterns found: query URL, `/ko`, `/en/en`, legacy post language URL, or real-estate apt detail URL.

## sitemap-en.xml Required Loc Membership

- File present: yes
- URL count: 98
- Required URL membership: 16/16
- EN home trailing slash check: PASS (https://www.finmaphub.com/en)
- EN URL-prefix sitemap: present (`public/en/sitemap.xml`)
- EN URL-prefix sitemap URL count: 98
- EN URL-prefix sitemap loc prefix check: PASS
- EN URL-prefix sitemap matches `public/sitemap-en.xml`: PASS

| Required path | loc | Result |
| --- | --- | --- |
| /en | https://www.finmaphub.com/en | OK |
| /en/tools | https://www.finmaphub.com/en/tools | OK |
| /en/tools/compound-interest | https://www.finmaphub.com/en/tools/compound-interest | OK |
| /en/tools/cagr-calculator | https://www.finmaphub.com/en/tools/cagr-calculator | OK |
| /en/tools/dca-calculator | https://www.finmaphub.com/en/tools/dca-calculator | OK |
| /en/tools/dsr-ltv-calculator | https://www.finmaphub.com/en/tools/dsr-ltv-calculator | OK |
| /en/tools/fire-calculator | https://www.finmaphub.com/en/tools/fire-calculator | OK |
| /en/tools/goal-simulator | https://www.finmaphub.com/en/tools/goal-simulator | OK |
| /en/market | https://www.finmaphub.com/en/market | OK |
| /en/market/indices | https://www.finmaphub.com/en/market/indices | OK |
| /en/market/real-estate | https://www.finmaphub.com/en/market/real-estate | OK |
| /en/about | https://www.finmaphub.com/en/about | OK |
| /en/contact | https://www.finmaphub.com/en/contact | OK |
| /en/privacy | https://www.finmaphub.com/en/privacy | OK |
| /en/terms | https://www.finmaphub.com/en/terms | OK |
| /en/disclaimer | https://www.finmaphub.com/en/disclaimer | OK |

## /en/sitemap.xml Loc Prefix Check

- All `<loc>` values are under `https://www.finmaphub.com/en`.
