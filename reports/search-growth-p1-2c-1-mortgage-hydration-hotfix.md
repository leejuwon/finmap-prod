# FinMap P1-2C-1 Mortgage Hydration Hotfix Audit

Generated: 2026-07-30T00:35:35+09:00

## Verdict

PASS_HOTFIX_READY

`/tools/mortgage-loan-calculator` and `/en/tools/mortgage-loan-calculator` were failing the live production hydration matrix with React minified error `#418`. The local production hotfix build now passes the same mortgage-specific hydration matrix: 42/42 passed, hydration failures 0.

No mortgage calculation formula, default value, SEO text, canonical, hreflang, sitemap policy, GA4 event contract, ad slot position, or ad slot count was changed.

## Original Failure

Live production, before deployment of this hotfix:

| Report | Base URL | Status | Pass | Fail | Hydration Fail | React Codes |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `reports/search-growth-p1-2c-1-mortgage-hydration-reproduction.json` | `https://www.finmaphub.com` | FAIL | 26/42 | 16 | 16 | `418` |

Failure distribution:

| Dimension | Count |
| --- | ---: |
| KO failures | 8 |
| EN failures | 8 |
| 320px failures | 11 |
| 390px failures | 2 |
| 768px failures | 1 |
| 1280px failures | 2 |
| hard load failures | 7 |
| cache-disabled reload failures | 3 |
| client navigation failures | 6 |

The issue was not limited to a single viewport, but 320px remained the highest-risk viewport and matched the original blocker.

## Reproduction Matrix

The new verifier covers both mortgage URLs:

- `/tools/mortgage-loan-calculator`
- `/en/tools/mortgage-loan-calculator`

Viewport and navigation matrix:

| Viewport | Hard Load | Cache-Disabled Reload | Client Navigation |
| --- | --- | --- | --- |
| 320px | 5 runs per locale | 3 runs per locale | 3 runs per locale |
| 360px | 2 runs per locale | - | - |
| 390px | 3 runs per locale | - | - |
| 768px | 2 runs per locale | - | - |
| 1280px | 3 runs per locale | - | - |

The verifier fails on hydration console errors, page errors, horizontal overflow, missing H1, missing inputs, missing CTA, missing result text, or missing document response.

## Root Cause Isolation

Actual browser DOM inspection with JavaScript disabled did not show a server/client HTML shape mismatch in the mortgage page body. The captured no-JS browser DOM for KO 320px matched the SSR `#__next` structure, and invalid nesting probes did not identify likely browser auto-correction causes.

Third-party isolation pointed at the hydration-critical script timing path:

| Test | Result |
| --- | --- |
| Live production, normal third-party loading | FAIL, hydration `#418` reproduced |
| Live production, all Google third-party requests blocked | PASS in the reduced isolation run |
| Local production hotfix, normal third-party loading | PASS 42/42 |

The actionable site-owned trigger was the AdSense bootstrap script executing from the document head during the first load path. The fix moves that raw AdSense bootstrap later in document order so Next's own runtime scripts initialize first.

## Applied Fix

Changed `pages/_document.js`:

- Removed the raw AdSense script from `<Head>`.
- Kept the `google-adsense-account` meta tag in `<Head>`.
- Added one raw AdSense bootstrap script immediately after `<NextScript />`.
- Used `defer` and a marker attribute: `data-finmap-adsense-bootstrap="after-next-script"`.
- Kept the same publisher id: `ca-pub-1869932115288976`.
- Did not use `next/script`, so `data-nscript` is not introduced.

Before:

- Raw AdSense script existed in the HTML head and could execute in the same timing window as React hydration startup.

After:

- Raw AdSense script is still SSR-rendered exactly once, but appears after Next runtime scripts and is deferred.

## Why This Is Minimal

No source edits were made to:

- `_components/MortgageLoanCalculator.js`
- `lib/calculators/mortgageLoan.js`
- `pages/tools/mortgage-loan-calculator.js`
- DSR/LTV calculator components
- home buying budget calculator components
- ad slot components or slot placement
- SEO metadata and sitemap configuration

The only runtime behavior change is the AdSense bootstrap script timing.

## AdSense Checks

`node scripts\verify_adsense_bootstrap.js` passed.

Key assertions:

| Check | Result |
| --- | --- |
| `_app.js` has no pagead2 bootstrap | PASS |
| `_document.js` has the pagead2 bootstrap | PASS |
| publisher id unchanged | PASS |
| no `next/script` AdSense bootstrap | PASS |
| exactly one AdSense script in built HTML | PASS |
| no `data-nscript` attribute | PASS |
| bootstrap appears as hydration-safe body script | PASS |
| existing ad push retry helper still present | PASS |

Mortgage page note: it still has no AdSense slot in the built HTML, matching the prior ad-count constraint. Existing slots on the home-buying, DSR/LTV, compound, and post pages were verified without adding new slots.

## Hotfix Regression

Local production build after the fix:

| Report | Base URL | Status | Pass | Fail | Hydration Fail | React Codes |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `reports/search-growth-p1-2c-1-mortgage-hydration-regression.json` | `http://127.0.0.1:8002` | PASS | 42/42 | 0 | 0 | none |

Mobile-specific mortgage checks:

| URL | 320px | 360px | 390px | 768px | 1280px |
| --- | --- | --- | --- | --- | --- |
| `/tools/mortgage-loan-calculator` | PASS | PASS | PASS | PASS | PASS |
| `/en/tools/mortgage-loan-calculator` | PASS | PASS | PASS | PASS | PASS |

## P1-2C Verification

`node scripts\verify_search_growth_p1_2c_postdeploy.js --base-url=http://127.0.0.1:8002` returned `CONDITIONAL_PASS` with blockers 0.

Remaining manual checks in that report are operational checks that require an actual deployment or console access:

- deploy date/time
- GA4 DebugView
- GSC sitemap submission screen
- representative calculator input GA4 receipt

## SEO And Snippet Checks

| Command | Result |
| --- | --- |
| `node scripts\verify_search_snippet_hygiene.js --base-url=http://127.0.0.1:8002` | PASS |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `node scripts\verify_naver_calculator_seo.js` | PASS |

SEO channel split confirmed:

- `sitemap-0.xml`: 211 URLs
- `sitemap-ko.xml`: 111 URLs
- `sitemap-en.xml`: 100 URLs
- `en/sitemap.xml`: 100 URLs
- `/tools/mortgage-loan-calculator`: 200, self canonical, no noindex
- `/en/tools/mortgage-loan-calculator`: 200, self canonical, no noindex

## Calculation And CTA Checks

| Command | Result |
| --- | --- |
| `node scripts\verify_mortgage_loan_calculator.js` | PASS 22/22 |
| `node scripts\verify_tool_result_cta_events.js` | PASS |
| `npm.cmd run check:posts-links` | PASS, broken 0, suspicious 0 |

Mortgage sample results remained unchanged:

- Equal payment monthly: `1,432,246원`
- Equal payment total interest: `215,608,519원`
- Equal principal first month: `1,833,333원`
- Equal principal last month: `836,111원`
- Equal principal total interest: `180,500,000원`
- Rate +1%p sensitivity: `178,219원`

## Build

`npm.cmd run build` passed.

Build summary:

- Next.js production build compiled successfully.
- Static pages generated: 223.
- `next-sitemap` and `scripts/generate_channel_sitemaps.js` completed.

## Changed Files

Source and verifier files:

- `pages/_document.js`
- `scripts/verify_adsense_bootstrap.js`
- `scripts/verify_mortgage_hydration_regression.js`
- `scripts/verify_search_growth_p1_2c_postdeploy.js`

Reports and generated verification outputs:

- `reports/search-growth-p1-2c-1-mortgage-hydration-hotfix.md`
- `reports/search-growth-p1-2c-1-mortgage-hydration-reproduction.json`
- `reports/search-growth-p1-2c-1-mortgage-hydration-regression.json`
- `reports/search-growth-p1-2c-1-hotfix-files.json`
- `reports/search-growth-p1-2c-postdeploy-verification.md`
- `reports/search-growth-p1-2c-postdeploy-verification.json`
- `reports/search-growth-p1-2c-production-url-check.csv`
- `reports/search-growth-p1-2c-observation-calendar.json`
- `reports/search-growth-90d-p0-2a-snippet-hygiene-rendered.json`
- `reports/search-growth-90d-p0-2b-internal-link-http-check.json`
- `reports/search-growth-90d-p1-1c-observation-baseline.json`
- `reports/seo-channel-split-url-check.md`
- `reports/mortgage-loan-calculator-p1-2-audit.md`

Failure artifacts:

- `reports/search-growth-p1-2c-1-hydration-artifacts/`

Temporary zero-byte server logs were created while checking local server startup and are not part of the deployment scope:

- `reports/p1-2c-1-dev-server.err.log`
- `reports/p1-2c-1-dev-server.out.log`
- `reports/p1-2c-1-prod-server.err.log`
- `reports/p1-2c-1-prod-server.out.log`

## Commands Run

| Command | Result |
| --- | --- |
| `git status --short --untracked-files=all` | Completed; existing report changes and new hotfix files present |
| `node --check scripts\verify_mortgage_hydration_regression.js` | PASS |
| `node --check scripts\verify_search_growth_p1_2c_postdeploy.js` | PASS |
| `node --check scripts\verify_adsense_bootstrap.js` | PASS |
| `node scripts\verify_mortgage_hydration_regression.js --base-url=https://www.finmaphub.com --runs=5 --mode=reproduction` | Expected FAIL; live pre-hotfix reproduction captured |
| `node scripts\verify_mortgage_hydration_regression.js --base-url=http://127.0.0.1:8002 --runs=5 --mode=regression` | PASS 42/42 |
| `npm.cmd run build` | PASS |
| `node scripts\verify_adsense_bootstrap.js` | PASS |
| `node scripts\verify_mortgage_loan_calculator.js` | PASS 22/22 |
| `node scripts\verify_tool_result_cta_events.js` | PASS |
| `npm.cmd run check:posts-links` | PASS |
| `node scripts\verify_naver_calculator_seo.js` | PASS |
| `node scripts\verify_search_growth_p1_2c_postdeploy.js --base-url=http://127.0.0.1:8002` | CONDITIONAL_PASS, blockers 0 |
| `node scripts\verify_search_snippet_hygiene.js --base-url=http://127.0.0.1:8002` | PASS |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `git diff --check` | PASS; only LF-to-CRLF conversion warnings |
| JSON parse check for P1-2C-1 reports | PASS |
| trailing whitespace check for new hotfix files | PASS |

## Remaining Risks

- This hotfix has not been committed, pushed, or deployed.
- Live production will continue to show the pre-hotfix behavior until deployment.
- After deployment, rerun the hydration regression against `https://www.finmaphub.com`.
- GA4 DebugView and real AdSense fill behavior require operating-console/manual browser checks.
- Moving AdSense out of `<Head>` is intentional for hydration stability, but first-entry ad request timing should be monitored after deployment.

## Post-Deploy Manual Check

After deployment:

1. Open Chrome incognito with mobile emulation.
2. Hard-load `/tools/mortgage-loan-calculator` and `/en/tools/mortgage-loan-calculator` at 320px and 390px.
3. Confirm no React hydration error and no `Minified React error #418`.
4. Confirm one `adsbygoogle.js?client=ca-pub-1869932115288976` request.
5. Confirm the script tag has no `data-nscript`.
6. Run `node scripts\verify_mortgage_hydration_regression.js --base-url=https://www.finmaphub.com --runs=5 --mode=regression`.
