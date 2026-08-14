# FinMap P1-2C-4 Final Production Verification

작성일: 2026-07-30
대상: https://www.finmaphub.com

## Overall Verdict

판정: `CONDITIONAL_PASS`

운영 배포본에서 AdSense post-hydration singleton hotfix는 기술 blocker 없이 동작한다. React #418, hydration error, duplicate bootstrap, data-nscript, slot push failure, duplicate slot push는 이번 검증 범위에서 모두 0이다.

`CONDITIONAL_PASS`로 둔 이유는 GA4 DebugView 실제 수신, 실제 광고 fill, GSC/네이버/Bing 노출 관찰은 Codex 환경에서 확정할 수 없는 수동 확인 영역이기 때문이다.

## Deployment Information

- deploy date: `MANUAL_INPUT_REQUIRED`
- deploy time: `MANUAL_INPUT_REQUIRED`
- timezone: `Asia/Seoul`
- commit hash: `2a332112600e04a8b3ed23ba51910c9acc403bec`
- branch: `master`
- commit date: `2026-07-30T09:44:38+09:00`
- commit subject: `Update: fix(adsense): load bootstrap after React hydration`
- build command: `MANUAL_INPUT_REQUIRED` (expected: `npm.cmd run build`)
- PM2 process name: `MANUAL_INPUT_REQUIRED`
- restart result: `MANUAL_INPUT_REQUIRED`
- production build ID: `HPOU2C5yRTCjs8-zBCyPJ`

P0~P1 검색 실험 배포일과 AdSense hydration hotfix 배포일은 분리 기록한다. AdSense hotfix 날짜로 28일 검색 관찰 기간을 다시 시작하지 않는다.

## Mortgage Hydration

- command: `node scripts\verify_mortgage_hydration_regression.js --base-url=https://www.finmaphub.com --runs=5 --mode=regression`
- status: `PASS`
- pass: `42/42`
- React #418: `0`
- hydrationFail: `0`
- pageErrorFail: `0`

## Global Hydration

- hard-load rows: `132/132`
- React #418: `0`
- hydration errors: `0`
- page errors: `0`
- horizontal overflow: `0`
- duplicate bootstrap: `0`
- data-nscript: `0`

## AdSense Singleton Loader

- server HTML checked: `5`
- executable adsbygoogle.js in server HTML: `0`
- data-nscript in server HTML: `0`
- missing google-adsense-account meta: `0`
- wrong publisher id: `0`
- runtime script count in global checks: `1 per page`
- runtime script location: `document.head`
- marker: `post-hydration-singleton`

## Loader Timeline

대표 샘플은 `/tools/compound-interest` 320px first-entry에서 수집했다.

- DOMContentLoaded observed
- AdSenseBootstrap effect 이후 script marker 설정
- `document.head.appendChild(script)` 관찰
- script load 관찰
- slot push attempt/success 관찰
- push exception: `0`
- duplicate push: `0`

세부 이벤트는 `reports/search-growth-p1-2c-4-loader-timeline.json`에 기록했다.

## First-Entry Ads

- rows: `21/21`
- React #418: `0`
- hydration errors: `0`
- slot push failed: `0`
- duplicate bootstrap: `0`
- duplicate slot push: `0`
- statuses:
- AD_REQUEST_SENT_NO_FILL_OR_FILLED: 21

실제 광고 fill은 네트워크/계정/쿠키/정책 상태의 영향을 받으므로, 광고 요청이 정상 전송되고 no-fill인 경우 기술 PASS로 분류했다.

## Global Client Navigation

- rows: `36/36`
- React #418: `0`
- hydration errors: `0`
- duplicate bootstrap: `0`
- data-nscript: `0`
- slot push failed: `0`
- direct fallback navigations where no matching anchor was found: `9`

## Route Navigation

Flow: `/` -> `/tools` -> `/tools/mortgage-loan-calculator` -> `/tools/compound-interest` -> `/posts/personalFinance/what-is-cagr`

- pass: `5/5`
- React #418: `0`
- duplicate bootstrap: `0`
- slot push failed: `0`
- duplicate slot push: `0`

## Calculator Regression

- `node scripts\verify_mortgage_loan_calculator.js`: `PASS (22/22)`
- `node scripts\verify_tool_result_cta_events.js`: `PASS`
- `node scripts\verify_naver_calculator_seo.js`: `PASS`
- `npm.cmd run check:posts-links`: `PASS` (broken 0, suspicious 0, self URL missing 0)

## GA4 Regression

- GA4 helper/source checks: `PASS` via `verify_tool_result_cta_events.js`
- route page_view source regression: no code change in this phase
- GA4 DebugView receipt: `MANUAL_INPUT_REQUIRED`

## SEO Regression

- canonical/noindex/publisher meta server HTML checks: `PASS`
- Naver calculator SEO verifier: `PASS`
- post internal link verifier: `PASS`
- sitemap/robots/hreflang policy: no runtime change in this phase

## Existing P1-2C Verifier

- command: `node scripts\verify_search_growth_p1_2c_postdeploy.js --base-url=https://www.finmaphub.com`
- status: `CONDITIONAL_PASS`
- blockers: `0`
- browser status: `PASS`
- production URL failed count: `0`

## Operating A/B Recheck

판정: `CONTROL_NO_REACT_418`

| Condition | Runs | React #418 | Hydration Errors | Bootstrap Loaded | Slot Pushed | Pass |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| CONTROL | 10 | 0 | 0 | 10 | 10 | 10/10 |
| BLOCK_BOOTSTRAP_ONLY | 10 | 0 | 0 | 10 | 0 | 10/10 |
| ALLOW_BOOTSTRAP_BLOCK_AD_REQUESTS | 10 | 0 | 0 | 10 | 10 | 10/10 |
| BLOCK_ALL_AD_DOMAINS | 10 | 0 | 0 | 10 | 0 | 10/10 |

CONTROL과 차단 조건 모두 React #418이 0이므로 hotfix 이후 causality 재현은 해소됐다.

## Remaining Manual Checks

- GA4 DebugView에서 계산 이벤트 실제 수신 확인
- 실제 광고 fill/no-fill 운영 화면 확인
- GSC/네이버/Bing 노출 화면 관찰
- 배포일/배포시각/PM2 restart 결과 수동 입력

## Files Created

- `reports/search-growth-p1-2c-4-final-production-verification.md`
- `reports/search-growth-p1-2c-4-final-production-verification.json`
- `reports/search-growth-p1-2c-4-hydration-matrix.csv`
- `reports/search-growth-p1-2c-4-first-entry-ads.csv`
- `reports/search-growth-p1-2c-4-loader-timeline.json`
- `reports/search-growth-p1-2c-4-deployment-record.json`

## No Additional Runtime Changes

이번 단계에서는 앱 런타임 코드, 계산기 로직, 광고 슬롯 구조, SEO 메타, GA4 이벤트, canonical/hreflang/robots/sitemap, verifier allowlist를 수정하지 않았다. commit, push, 배포도 수행하지 않았다.

## Observation Dates

- original search experiment deployment: `UNCHANGED_FROM_EXISTING_BASELINE / MANUAL_INPUT_REQUIRED`
- AdSense hydration hotfix deployment: `MANUAL_INPUT_REQUIRED`
- 72-hour technical check: `MANUAL_INPUT_REQUIRED`
- 7-day channel check: `MANUAL_INPUT_REQUIRED`
- 28-day search check: `MANUAL_INPUT_REQUIRED`
- 42-day search check: `MANUAL_INPUT_REQUIRED`

## Recommended Next Step

최소 72시간 동안 기술 상태만 관찰하고, 검색 title/description/본문/계산기 SEO는 추가 변경하지 않는다.
