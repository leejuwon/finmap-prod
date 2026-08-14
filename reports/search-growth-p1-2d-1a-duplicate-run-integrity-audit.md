# Search Growth P1-2D-1A Duplicate Run Integrity Audit

Generated: 2026-08-06 KST
Overall Verdict: PASS_WITH_MINIMAL_CONSOLIDATION
Safe to Configure Credentials: YES

## Overall Verdict
P1-2D-1의 두 번째 실행은 기존 foundation 위에 GSC device/country/page-query, GA4 calculator funnel, Bing 보강, retry/partial handling, fixture test를 추가한 형태로 정리됐다. 운영 페이지, 포스트, 계산기, sitemap, robots, canonical, hreflang, GA4 tag, AdSense 파일에는 diff가 없다.

## Duplicate Run Impact
- Blocking duplicate: 없음.
- Duplicate runner directory: 없음. `scripts/search-analytics/run.js` 단일 진입점 유지.
- Duplicate package script name: 없음. 검색 관련 npm script 13개가 모두 동일 runner를 가리킨다.
- Minimal consolidation applied: `search:discover:gsc`가 full GSC collection을 재사용할 수 있던 경로를 제거하고, `sites.list` 전용 discovery로 고정했다.
- Retry message cleanup: non-retryable error에서 실제 attempt count가 기록되도록 정리했다.

## Worktree Integrity
- Runtime diff check: PASS, `pages`, `_components`, `content`, `public`, `next-sitemap.config.js` 변경 없음.
- Raw actual API directory: 생성되지 않음.
- Temporary env file: `.env.search.local` 삭제 완료.
- Duplicate temp file scan: PASS, `.bak`, `.tmp`, copy류 산출물 없음.
- 기존 P1-2C/P1-2D-0 untracked report들은 감사 범위 밖 산출물로 남겨두고 삭제하지 않았다.

## Package and npm Scripts
- `package.json` / `package-lock.json` parse: PASS.
- Installed search API packages: `googleapis@174.0.1`, `@google-analytics/data@7.0.0`.
- Search npm scripts: 13개 확인.
- Missing search scripts: 없음.

## Environment Loading
- Final `search:config:check`: `FOUNDATION_READY_MANUAL_SETUP_REQUIRED`.
- 최종 credential configured: false.
- 임시 fixture env load check: PASS, config output에서 key성 필드는 redacted 처리 확인.
- `.env.search.local`은 최종 상태에서 존재하지 않는다.

## Gitignore Safety
- `.env.search.local`: ignored.
- `.env.search.example`: explicitly unignored.
- `credentials/`: ignored.
- `reports/search-performance/raw/`: ignored.
- `reports/search-performance/private/`: ignored.

## GSC Collector
- Status: PASS.
- Scope: `webmasters.readonly`, Search Analytics read, discovery는 `sites.list` only.
- Datasets: daily, pages, queries, devices, countries, page_query.
- Partial handling: dataset 단위 warning/error를 manifest에 격리.

## GA4 Collector
- Status: PASS.
- Scope: GA4 Data API read-only report, realtime probe.
- Datasets: channels, landings, events, event_pages, calculator_funnel, realtime_probe.
- Calculator funnel: landing sessions, calculate events/users, CTA views/clicks, CTA CTR, event-to-session ratio.

## Bing Collector
- Status: PASS.
- Scope: Bing Webmaster read-only endpoints.
- Datasets: daily, pages, queries, crawl.
- Write/submit endpoint 사용: 없음.

## Fixture Artifacts
- `search:test`: PASS, 23 assertions.
- `search:weekly --fixture`: READY.
- Normalized CSV: 15개.
- Weekly outputs: 7개.
- Manifest files: 5개.
- Raw API payload directory: 없음.

## Reports Consistency
- P1-2D-1 foundation JSON/MD: PASS, second-run dataset/reliability 내용 반영.
- Weekly JSON/MD: PASS, fixture window `2026-07-27` to `2026-08-02`.
- GSC discovery manifest: PASS, Search Analytics fetch 없이 `sites.list` note 기록.

## Security
- Secret scan: PASS.
- Bing API key logged: false.
- Raw/private output paths ignored: true.
- `.env.search.example`의 service account path는 placeholder이며 private key material 없음.

## npm Audit Observation
- `npm audit --json`: 9 vulnerabilities observed, fix not applied.
- Severity: low 2, high 7, critical 0.
- Direct packages mentioned: `fast-xml-parser`, `next`, `postcss`.
- `googleapis` / `@google-analytics/data`는 audit vulnerability node로 표시되지 않았다.
- 관찰된 경로는 기존 app/build 의존성 중심이다: `next`, `fast-xml-parser`, `postcss`, `express/body-parser`, `eslint/brace-expansion`, `jspdf/dompurify`, `cheerio/undici`, `sharp`.

## Verification
- `node --check scripts\search-analytics\run.js`: PASS.
- `npm.cmd run search:config:check -- --date=2026-08-06`: PASS.
- `npm.cmd run search:test`: PASS.
- `npm.cmd run search:health -- --date=2026-08-06`: PASS, `NO_OBVIOUS_TECHNICAL_BLOCKER`.
- `npm.cmd run search:weekly -- --fixture --date=2026-08-06`: PASS.
- `npm.cmd run search:discover:gsc -- --fixture --date=2026-08-06`: PASS.
- `npm.cmd ls googleapis @google-analytics/data`: PASS.
- `npm.cmd audit --json`: observed only, no fix.
- `git diff --check`: PASS with CRLF warnings only.
- `git diff --name-only -- pages _components content public next-sitemap.config.js`: empty.

## Files Changed
- `scripts/search-analytics/run.js`
- `reports/search-growth-p1-2d-1-search-api-automation-foundation.json`
- `reports/search-growth-p1-2d-1-search-api-automation-foundation.md`
- `reports/search-performance/normalized/2026-08-06/*.csv`
- `reports/search-performance/weekly/search-health-2026-08-06.json`
- `reports/search-performance/weekly/search-weekly-2026-08-06.json`
- `reports/search-performance/weekly/search-weekly-2026-08-06.md`
- `reports/search-performance/weekly/search-weekly-*-2026-08-06.csv`
- `reports/search-performance/manifests/fetch-manifest-2026-08-06*.json`
- `reports/search-performance/manifests/gsc-discovery-2026-08-06.json`
- `reports/search-growth-p1-2d-1a-duplicate-run-integrity-audit.json`
- `reports/search-growth-p1-2d-1a-duplicate-run-integrity-audit.md`

## No Runtime Changes
Confirmed. No page, post, calculator, sitemap, robots, canonical, hreflang, GA4 tag, or AdSense runtime file was changed.

## Safe to Configure Credentials
YES. Use local `.env.search.local` only, then run discovery before the first real weekly fetch.

## Recommended Next Step
Configure read-only credentials locally in `.env.search.local`, run `npm.cmd run search:discover:gsc`, then run one controlled real weekly collection.
