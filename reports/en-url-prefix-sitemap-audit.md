# EN URL-Prefix Sitemap Audit

- Audit date: 2026-06-18
- Goal: expose the EN-only sitemap at `https://www.finmaphub.com/en/sitemap.xml` for the Google Search Console URL-prefix property `https://www.finmaphub.com/en/`
- Policy: keep `public/sitemap-en.xml`, `public/sitemap-ko.xml`, `public/sitemap-0.xml`, and `robots.txt` structure intact

## Changes

- `scripts/generate_channel_sitemaps.js`
  - Keeps generating `public/sitemap-en.xml`.
  - Also writes the same EN sitemap XML to `public/en/sitemap.xml`.
  - Creates `public/en` automatically when missing.

- `scripts/verify_seo_channel_split.js`
  - Checks that `public/en/sitemap.xml` exists.
  - Checks that `public/en/sitemap.xml` has only EN `<loc>` values:
    - `https://www.finmaphub.com/en`
    - `https://www.finmaphub.com/en/...`
  - Checks that `public/en/sitemap.xml` exactly matches `public/sitemap-en.xml`.

- `web.js`
  - Added `redirect: false` to the root `public` static middleware.
  - Reason: once `public/en` exists, Express would otherwise treat `/en` as a static directory and return a 301 before Next.js can render the EN home page.

## Generated Files

`node scripts\generate_channel_sitemaps.js` result:

- `public/sitemap-ko.xml`: 101 URLs
- `public/sitemap-en.xml`: 98 URLs
- `public/en/sitemap.xml`: 98 URLs
- Required EN static URLs in source: 16/16
- Backfilled EN static URLs: 0

## Validation

- `node --check scripts\generate_channel_sitemaps.js`: PASS
- `node --check scripts\verify_seo_channel_split.js`: PASS
- `node scripts\generate_channel_sitemaps.js`: PASS
- `npm.cmd run build`: PASS
  - postbuild generated `public/sitemap-en.xml` and `public/en/sitemap.xml`.
  - `public/en/sitemap.xml`: 98 URLs.
- `node scripts\verify_seo_channel_split.js --local-server`: PASS
  - `public/en/sitemap.xml`: present.
  - URL count: 98.
  - EN-only locs: PASS.
  - Matches `public/sitemap-en.xml`: PASS.
- `curl -I http://127.0.0.1:8017/en/sitemap.xml`: PASS
  - HTTP status: `200 OK`.
  - Content-Type: `application/xml`.
  - Content-Length: `41115`.
- `/en/sitemap.xml` internal loc prefix check: PASS
  - `<loc>` count: 98.
  - Non-EN `<loc>` count: 0.
