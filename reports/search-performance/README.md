# Search Performance Reports

This directory stores read-only search analytics outputs for FinMap.

## Structure

- `raw/YYYY-MM-DD/gsc/`: ignored real GSC API payloads.
- `raw/YYYY-MM-DD/ga4/`: ignored real GA4 API payloads.
- `raw/YYYY-MM-DD/bing/`: ignored real Bing API payloads.
- `normalized/YYYY-MM-DD/`: common CSV rows used by weekly analysis.
- `normalized/YYYY-MM-DD/gsc-devices.csv`: GSC device dimension rows.
- `normalized/YYYY-MM-DD/gsc-countries.csv`: GSC country dimension rows.
- `normalized/YYYY-MM-DD/ga4-calculator-funnel.csv`: calculator landing/event/CTA aggregate rows.
- `weekly/`: Markdown, JSON, and CSV weekly summaries.
- `manifests/`: fetch status and credential/capability probes.
- `private/`: ignored local-only scratch area.

## Common Schema

Normalized CSVs use these fields where applicable:

`platform, property, dataset, date, page, query, country, device, sourceMedium, channel, clicks, impressions, ctr, position, sessions, engagedSessions, users, eventName, eventCount, dataFreshness, fetchedAt, sourceTimezone`

Missing values are stored as empty CSV cells and `null` in JSON. A real zero is preserved as `0`.

`ga4-calculator-funnel.csv` uses a purpose-specific aggregate schema:

`platform, property, url, landingSessions, calculateEventCount, calculateUsers, ctaViewEventCount, ctaClickEventCount, ctaClickThroughRate, eventToSessionRatio, dataFreshness, fetchedAt, notes`

`eventToSessionRatio` is labeled as a ratio only. It is not a user conversion rate because GA4 event and session denominators can differ.

## Security

Do not commit real raw payloads, credentials, API keys, OAuth tokens, or service-account JSON files. Bing API keys are passed as query parameters to the official API, so full request URLs must not be logged.

## Fixture Mode

Fixture mode uses only `example.com` data:

```powershell
npm.cmd run search:weekly -- --fixture --date=2026-08-06
```

It is safe to run without credentials and does not call external APIs.
