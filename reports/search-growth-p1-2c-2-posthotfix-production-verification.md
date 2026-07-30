# Search Growth P1-2C-2 Post-Hotfix Production Verification

Generated: 2026-07-30T01:14:07+09:00

## Overall Verdict

FAIL

## Hotfix Deployment Information

- Search experiment deploy date: MANUAL_INPUT_REQUIRED
- Hydration hotfix deploy date: MANUAL_INPUT_REQUIRED
- Hydration hotfix deploy time: MANUAL_INPUT_REQUIRED
- Timezone: Asia/Seoul
- Hotfix commit hash: cf136f1400edab381c2219e8775b4bfd53788d99
- Deployed branch: master
- PM2 process: MANUAL_INPUT_REQUIRED
- Build result: MANUAL_INPUT_REQUIRED
- Restart result: MANUAL_INPUT_REQUIRED
- Observation window: not reset by hydration hotfix

## Mortgage Hydration Results

| Metric | Value |
| --- | ---: |
| Total | 42 |
| Pass | 0 |
| Fail | 42 |
| Hydration Fail | 42 |
| Page Error Fail | 42 |

React error codes: 418

## Global Hydration Results

| Metric | Value |
| --- | ---: |
| Total | 49 |
| Pass | 38 |
| Fail | 11 |

Global failed rows are listed in reports\search-growth-p1-2c-2-posthotfix-production-verification.json and reports\search-growth-p1-2c-2-production-hydration-matrix.csv.

## AdSense Bootstrap

`node scripts\verify_adsense_bootstrap.js --base-url=https://www.finmaphub.com` returned PASS for production HTML:

- one raw `adsbygoogle.js` bootstrap script
- `data-nscript` absent
- `defer` present
- `crossorigin="anonymous"` present
- publisher id preserved
- hydration-safe body marker present

| Check | Result |
| --- | --- |
| Single bootstrap script on first-entry rows | PASS |
| Bootstrap request observed | PASS |
| data-nscript absent | PASS |
| defer preserved | PASS |
| crossorigin anonymous | PASS |
| publisher client id preserved | PASS |
| Rows where script appears after Next scripts | 20/21 |

Category counts: AD_REQUEST_SENT_NO_FILL=1, AD_REQUEST_SENT_FILLED=11, SLOT_PUSH_FAILED=9

Referrer note: Naver referrer simulation returned `ERR_BLOCKED_BY_CLIENT` in headless Chrome, so the CSV records direct clean-context hard loads.

## First-Entry Ad Results

| Metric | Value |
| --- | ---: |
| Total | 21 |
| Page-level pass | 12 |
| Page-level fail | 9 |

Detailed rows: reports\search-growth-p1-2c-2-adsense-first-entry-check.csv

## Calculator Regression

- Mortgage calculator: PASS 22/22
- Tool result CTA events: PASS
- Naver calculator SEO: PASS

## GA4 Regression

Static GA4/CTA event contract checks passed. GA4 DebugView receipt remains MANUAL_INPUT_REQUIRED.

## SEO and Sitemap

P1-2C production URL checks passed for canonical, noindex absence, sitemap membership, hreflang, JSON-LD, CTA and snippet hygiene. Existing P1-2C verifier still returned FAIL because mobile browser hydration checks failed.

## Technical Blockers

- Mortgage hydration matrix failed: 42/42, React codes=418
- Global hydration matrix failed: 11/49
- Existing P1-2C verifier failed with 6 blockers

The blocker is therefore not an HTML bootstrap-count regression. Production HTML has the expected AdSense bootstrap shape, but browser execution still reproduces React `#418` on mortgage and related calculator entry paths.

## Remaining Manual Checks

- GA4 DebugView actual event receipt: MANUAL_INPUT_REQUIRED
- AdSense dashboard request/fill confirmation: MANUAL_INPUT_REQUIRED
- GSC sitemap submission screen: MANUAL_INPUT_REQUIRED
- Real user browser ad fill: MANUAL_INPUT_REQUIRED

## Files Created

- reports\search-growth-p1-2c-2-posthotfix-production-verification.md
- reports\search-growth-p1-2c-2-posthotfix-production-verification.json
- reports\search-growth-p1-2c-2-production-hydration-matrix.csv
- reports\search-growth-p1-2c-2-adsense-first-entry-check.csv
- reports\search-growth-p1-2c-2-deployment-record.json

## Commands Run

| Command | Result |
| --- | --- |
| `git status --short --untracked-files=normal` | Clean at start |
| `git rev-parse HEAD` | `cf136f1400edab381c2219e8775b4bfd53788d99` |
| `pm2.cmd list --no-color` | No output available in this Codex session |
| `node scripts\verify_mortgage_hydration_regression.js --base-url=https://www.finmaphub.com --runs=5 --mode=regression` | FAIL, 0/42 PASS, React `#418` |
| `node scripts\verify_adsense_bootstrap.js --base-url=https://www.finmaphub.com` | PASS |
| `node scripts\verify_mortgage_loan_calculator.js` | PASS 22/22 |
| `node scripts\verify_tool_result_cta_events.js` | PASS |
| `node scripts\verify_naver_calculator_seo.js` | PASS |
| `node scripts\verify_search_growth_p1_2c_postdeploy.js --base-url=https://www.finmaphub.com` | FAIL, blockers 6 |
| P1-2C-2 browser first-entry/global checks | FAIL, reports generated |

## No Additional Runtime Changes

This P1-2C-2 pass only performed read-only production checks and report generation. It did not change page code, calculator code, SEO, GA4, ad slot placement, AdSense bootstrap placement, canonical, hreflang, robots, sitemap policy, commits, pushes, or deployments.

## Observation Dates

- Search experiment deploy date: MANUAL_INPUT_REQUIRED
- Hydration hotfix deploy date: MANUAL_INPUT_REQUIRED
- 72-hour technical check: MANUAL_INPUT_REQUIRED
- 28-day search check: keep original search experiment baseline
- 6-week search check: keep original search experiment baseline

## Recommended Next Step

Do not mark P1-2C as final PASS yet. The production browser still reproduces React #418, so resolve that technical blocker before starting the 72-hour observation window.
