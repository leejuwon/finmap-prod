# Search Analytics API Setup

This guide sets up read-only collection for Google Search Console, Google Analytics 4, and Bing Webmaster Tools on Windows.

## 1. Local Env File

Create a local file from the tracked example:

```powershell
Copy-Item .env.search.example .env.search.local
```

Never paste credential JSON, API keys, OAuth tokens, cookies, or private keys into chat or reports.

## 2. Google Common Setup

1. Create or select a Google Cloud project.
2. Enable Search Console API.
3. Enable Google Analytics Data API.
4. Create a read-only service account.
5. Store the service-account JSON outside this repository, for example:

```text
C:\finmap-secrets\finmap-search-reader.json
```

6. Add the service-account email to the FinMap Search Console property with restricted/read access.
7. Add the service-account email to the FinMap GA4 property as Viewer.
8. Set `GOOGLE_APPLICATION_CREDENTIALS` in `.env.search.local` to the JSON path.

Do not place the JSON file inside `C:\finmap`.

## 3. GSC

Use read-only scope:

```text
https://www.googleapis.com/auth/webmasters.readonly
```

After credentials are set, discover accessible properties:

```powershell
npm.cmd run search:discover:gsc
```

Copy the exact property identifier into `GSC_PROPERTIES`.

Examples:

```text
GSC_PROPERTIES=sc-domain:finmaphub.com
GSC_PROPERTIES=https://www.finmaphub.com/,https://www.finmaphub.com/en/
```

The collector uses `sites.list` and Search Analytics query only. It does not add, remove, or edit properties.

## 4. GA4

Find the numeric GA4 property ID in Admin. It is not the `G-XXXX` measurement ID.

Set:

```text
GA4_PROPERTY_ID=123456789
GA4_TIMEZONE=Asia/Seoul
```

The Data API report is separate from DebugView. Realtime API checks confirm connection and event-name visibility, but do not replace DebugView.

## 5. Bing

1. Open Bing Webmaster Tools.
2. Go to Settings.
3. Open API Access.
4. Generate an API key.
5. Put the value only in `.env.search.local`.
6. Run:

```powershell
npm.cmd run search:check:bing
```

The implementation only calls read-only endpoints and masks API key values in errors and manifests.

## 6. First Real Run

After local credentials are configured:

```powershell
npm.cmd run search:config:check
npm.cmd run search:discover:gsc
npm.cmd run search:check:bing
npm.cmd run search:weekly -- --end-date=2026-08-03
```

To fetch a fixed range:

```powershell
npm.cmd run search:fetch -- --start-date=2026-07-28 --end-date=2026-08-03
npm.cmd run search:analyze -- --date=2026-08-06 --end-date=2026-08-03
npm.cmd run search:report -- --date=2026-08-06
```

## 7. Fixture Run

Credential-free validation:

```powershell
npm.cmd run search:test
npm.cmd run search:weekly -- --fixture --date=2026-08-06
```

Fixture data uses only `example.com`; it does not include real FinMap queries, property IDs, API keys, or user data.

## 8. Known Limitations

- GSC can return top rows only and may hide low-volume/private queries.
- GA4 reporting identity and thresholding can affect user/session counts.
- Bing schema and freshness can differ from GSC.
- Naver CSV is not automatically collected in this phase.
- DebugView still needs manual confirmation when event debugging is required.
