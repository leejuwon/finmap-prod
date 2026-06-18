# EN Sitemap & Tools SEO Audit

- Audit date: 2026-06-18
- Scope: `sitemap-en.xml`, EN tools, EN market pages, SEO verification script
- Policy: KO/Naver structure unchanged, `robots.txt` unchanged

## Sitemap EN Membership

`node scripts\generate_channel_sitemaps.js` result:

- `sitemap-ko.xml`: 101 URLs
- `sitemap-en.xml`: 98 URLs
- Required EN static URLs: 16/16 present in source
- Backfilled required EN static URLs: 0

Home trailing slash alignment:

- EN sitemap loc: `https://www.finmaphub.com/en`
- EN `SeoHead` canonical: `https://www.finmaphub.com/en`
- Result: PASS

| Required URL | Direct loc in `sitemap-en.xml` |
| --- | --- |
| `/en` | OK |
| `/en/tools` | OK |
| `/en/tools/compound-interest` | OK |
| `/en/tools/cagr-calculator` | OK |
| `/en/tools/dca-calculator` | OK |
| `/en/tools/dsr-ltv-calculator` | OK |
| `/en/tools/fire-calculator` | OK |
| `/en/tools/goal-simulator` | OK |
| `/en/market` | OK |
| `/en/market/indices` | OK |
| `/en/market/real-estate` | OK |
| `/en/about` | OK |
| `/en/contact` | OK |
| `/en/privacy` | OK |
| `/en/terms` | OK |
| `/en/disclaimer` | OK |

## Generator Changes

- `scripts/generate_channel_sitemaps.js`
  - Added a protected required EN static URL list.
  - If a future `sitemap-0.xml` output drops a required EN static URL, `sitemap-en.xml` now backfills it without changing `sitemap-ko.xml`.
  - Console output now reports required EN static URL source presence and backfilled paths.

- `scripts/verify_seo_channel_split.js`
  - Added `sitemap-en.xml` URL count output.
  - Added required EN URL membership output.
  - Added EN home trailing slash check.
  - Expanded EN samples to include core tool pages and `/en/market/indices`.

## Tools SEO Audit

| Page | SEO/H1/intro action | Internal link status |
| --- | --- | --- |
| `/en/tools/compound-interest` | Title, meta description, H1, intro rewritten around `compound interest calculator`, future value, monthly contributions, taxes, fees, inflation. | Existing recommended guide links retained. |
| `/en/tools/cagr-calculator` | Title, meta description, hero H1, intro bullets rewritten around annualized return, growth rate, future value, gross/net/real CAGR. | Existing pre-result related tool hub retained. |
| `/en/tools/dca-calculator` | Title, meta description, H1/intro rewritten around `dollar-cost averaging calculator`, ETF/stock investing, weekly/monthly contributions, targets, drawdowns. | Existing guide links and result tool CTAs retained. |
| `/en/tools/dsr-ltv-calculator` | Title, meta description, H1, lead rewritten around Korean mortgage affordability, DSR, LTV, apartment budget. | Added EN-only links to goal amount and compound interest calculators; existing real estate/blog links retained. |
| `/en/tools/fire-calculator` | Title, meta description, FIRE hero, intro, and simple calculator copy rewritten around early retirement, FIRE number, withdrawal rate, asset longevity. | Existing recommended guides and result tool CTAs retained. |
| `/en/tools/goal-simulator` | Title, meta description, intro H2/lead/bullet rewritten around monthly investment needed to reach a target amount. | Existing related tool hub and guide links retained. |

## Market EN Audit

| Page | Finding | Action |
| --- | --- | --- |
| `/en/market` | EN title/description/H1 already language-aware. | No change. |
| `/en/market/real-estate` | EN title/description/H1 already language-aware via page text/`ToolSeo`. | No change. |
| `/en/market/indices` | Page was included in EN sitemap, but SEO title/description/H1/intro were Korean-only. | Added EN-specific title, description, H1, intro, and back label while preserving KO output. |

## Verification

- `node --check scripts\generate_channel_sitemaps.js`: PASS
- `node --check scripts\verify_seo_channel_split.js`: PASS
- `node scripts\generate_channel_sitemaps.js`: PASS, `sitemap-en.xml` 98 URLs, required URLs 16/16
- `npm.cmd run build`: PASS
  - Next.js production build completed.
  - postbuild ran `next-sitemap && node scripts/generate_channel_sitemaps.js`.
  - `sitemap-en.xml`: 98 URLs, required URLs 16/16.
- `node scripts\verify_bing_sitemap.js`: PASS
  - URL count: 199
  - Post URLs: 142/142
  - Failures: 0
- `node scripts\verify_seo_channel_split.js --local-server`: PASS
  - `sitemap-en.xml` URL count: 98
  - Required EN URLs: 16/16
  - Checked URL samples: 16
  - URL sample failures: 0
