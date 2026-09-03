# Search Growth P1-2D-1 Search API Automation Foundation

Generated: 2026-09-02T07:38:43.400Z
Overall Verdict: FOUNDATION_READY_MANUAL_SETUP_REQUIRED

## Architecture
- Node.js CLI under `scripts/search-analytics/run.js`.
- Config under `config/search-analytics/`.
- Normalized outputs under `reports/search-performance/normalized/`.
- Weekly outputs under `reports/search-performance/weekly/`.
- Real API raw payloads are restricted to ignored `reports/search-performance/raw/`.

## Collectors
- GSC: official `googleapis`, `webmasters.readonly`, datasets daily, pages, queries, devices, countries, page_query.
- GA4: official `@google-analytics/data`, metadata probe, datasets channels, landings, events, event_pages, calculator_funnel, realtime_probe.
- Bing: official Webmaster JSON HTTP API, read-only datasets daily, pages, queries, crawl.
- GSC discovery: `sites.list` only; it does not run Search Analytics fetches.

## Reliability
- Retry policy: Transient 408/409/425/429/5xx and network errors retry with bounded exponential backoff.
- Partial handling: Dataset-level failures are isolated in manifests so available read-only data can still be analyzed.
- Fixture validation: search:test covers 23 assertions for normalization, fixture outputs, secrets, and report generation.

## Security
- Secrets printed: false
- Raw ignored: true
- Private ignored: true
- Bing API key logged: false

## Configuration Required
- Create `.env.search.local` locally from `.env.search.example`.
- Set Google service-account JSON path outside this repository.
- Set exact GSC properties from `search:discover:gsc`.
- Set GA4 numeric property ID, not the `G-XXXX` measurement ID.
- Set Bing site URL and API key locally.

## Dependencies
- googleapis: true
- @google-analytics/data: true

## No Runtime Changes
No page, post, calculator, sitemap, robots, canonical, hreflang, GA4 tag, or AdSense runtime file is modified by this foundation.
