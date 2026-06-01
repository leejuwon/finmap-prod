# GSC Index Fix Audit

Checked: 2026-06-01

## Modified Files

- `next.config.js`
- `next-sitemap.config.js`
- `pages/market/real-estate/apt/[aptKey].js`
- `pages/tools/compound-interest.js`
- `content/posts/economicInfo/en/inflation-rate-basics.md`
- `content/posts/economicInfo/en/indicator-basics.md`
- `scripts/verify_gsc_index_urls.js`
- `scripts/verify_sitemap_clean.js`
- `reports/gsc-index-url-audit.md`
- `reports/sitemap-clean-audit.md`
- `public/sitemap-0.xml`

## Redirect Handling

The following legacy URLs were verified as 301 redirects to live final URLs in the local production build:

| Source | Destination | Handling |
| --- | --- | --- |
| `/posts/compound-interest` | `/tools/compound-interest` | `next.config.js`, with `locale: false` |
| `/posts/economics-inflation-basics` | `/posts/economicInfo/inflation-basics` | existing `next.config.js` rule |
| `/posts/usd-krw-weak-won-sector-map-kospi` | `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi` | existing `next.config.js` rule |
| `/posts/investingInfo/usdkrw-exchange-rate-and-kospi` | `/posts/investingInfo/usd-krw-exchange-rate-and-kospi` | existing `next.config.js` rule |
| `/en/posts/investingInfo/usdkrw-exchange-rate-and-kospi` | `/en/posts/investingInfo/usd-krw-exchange-rate-and-kospi` | existing `next.config.js` rule |
| `/en/posts/investingInfo/usd-krw-exchange-rate-kospi` | `/en/posts/investingInfo/usd-krw-exchange-rate-and-kospi` | existing `next.config.js` rule |
| `/posts/personalFinance/en/personal-finance-3pillars` | `/en/posts/personalFinance/personal-finance-3pillars` | existing language-normalization rule |
| `/en/en` | `/en` | existing `next.config.js`/`proxy.js` normalization |
| `/en/en/category/personalFinance` | `/en/category/personalFinance` | existing `/en/en/:path*` normalization |
| `/en/en/category/investingInfo` | `/en/category/investingInfo` | existing `/en/en/:path*` normalization |
| `/category/tax?lang=ko` | `/category/personalFinance` | `proxy.js` strips `lang=ko` and maps tax category |
| `/market/real-estate/apt/[aptKey]` | `/market/real-estate` | existing `proxy.js` template guard |
| `/en/market/real-estate/apt/[aptKey]` | `/en/market/real-estate` | existing `proxy.js` template guard |

`/category/tax` and `/en/category/tax` were removed from `next.config.js` redirects so the existing `proxy.js` query cleanup can remove `lang=ko` without carrying the query string forward.

## Apartment Detail Noindex Policy

- Apartment detail pages remain non-index targets.
- `pages/market/real-estate/apt/[aptKey].js` now sends `robots=noindex,follow` through `ToolSeo` for valid detail pages.
- The response also sets `X-Robots-Tag: noindex, follow`.
- Query URLs canonicalize to the queryless detail URL:
  - KO: `https://www.finmaphub.com/market/real-estate/apt/{encoded aptKey}`
  - EN: `https://www.finmaphub.com/en/market/real-estate/apt/{encoded aptKey}`
- Local QA with a DB sample returned `OK_NOINDEX` for both KO and EN query URLs. Details are in `reports/gsc-index-url-audit.md`.

## Sitemap Result

`next-sitemap.config.js` now hard-blocks apartment detail URLs even if `RE_APT_SITEMAP=true` is set.

`node scripts/verify_sitemap_clean.js` result:

- Sitemap files checked: `public/sitemap.xml`, `public/sitemap-0.xml`
- Total `<loc>` entries: 190
- Forbidden URL violations: 0
- Missing required canonical URLs: 0

Forbidden patterns checked:

- URLs containing `?`
- `[aptKey]` or `%5BaptKey%5D`
- `/en/en`
- `/posts/*/en/*`
- `/posts/*/ko/*`
- `/market/real-estate/apt/`

Required URLs checked as present:

- `https://www.finmaphub.com/en/tools/compound-interest`
- `https://www.finmaphub.com/tools/dsr-ltv-calculator`
- `https://www.finmaphub.com/posts/investingInfo/tnx-basics`
- `https://www.finmaphub.com/posts/personalFinance/dca-vs-lump-sum-when-results-differ`
- `https://www.finmaphub.com/posts/personalFinance/how-much-monthly-invest-for-100m`
- `https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-bear-market`
- `https://www.finmaphub.com/posts/investingInfo/modern-6040-risk-budget`
- `https://www.finmaphub.com/en/posts/economicInfo/inflation-rate-basics`
- `https://www.finmaphub.com/en/posts/economicInfo/indicator-basics`

## Content Quality Checks

Indexable pages checked:

- `/posts/investingInfo/tnx-basics`
- `/tools/dsr-ltv-calculator`
- `/posts/personalFinance/dca-vs-lump-sum-when-results-differ`
- `/posts/personalFinance/how-much-monthly-invest-for-100m`
- `/posts/personalFinance/is-dca-better-in-bear-market`
- `/posts/investingInfo/modern-6040-risk-budget`
- `/en/posts/economicInfo/inflation-rate-basics`
- `/en/posts/economicInfo/indicator-basics`
- `/en/tools/compound-interest`

Changes made:

- Improved `/en/tools/compound-interest` SEO title and description to better reflect monthly contributions, taxes, future value, charts, tables, and related guides.
- Improved `/en/posts/economicInfo/inflation-rate-basics` description and `dateModified`.
- Improved `/en/posts/economicInfo/indicator-basics` title, description, and `dateModified`.

Existing checks confirmed:

- Target posts have visible body content, internal links, calculator/tool CTA paths, and FAQ sections.
- Blog detail pages output canonical URLs through `SeoHead` and related calculator CTA through `RelatedCalculatorCtaGrid` where `tool` metadata exists.
- Tool pages checked include WebApplication/FAQ structured data.

## Indexing Request List

Request indexing after deployment:

- `/posts/investingInfo/tnx-basics`
- `/tools/dsr-ltv-calculator`
- `/posts/personalFinance/dca-vs-lump-sum-when-results-differ`
- `/posts/personalFinance/how-much-monthly-invest-for-100m`
- `/posts/personalFinance/is-dca-better-in-bear-market`
- `/posts/investingInfo/modern-6040-risk-budget`
- `/en/posts/economicInfo/inflation-rate-basics`
- `/en/posts/economicInfo/indicator-basics`
- `/en/tools/compound-interest`

Do not request indexing:

- `/market/real-estate/apt/[aptKey]`
- `/en/market/real-estate/apt/[aptKey]`
- Any apartment detail query URL
- `/en/en` and `/en/en/*`
- `/posts/*/en/*`
- `/posts/*/ko/*`
- Legacy source URLs that now 301 redirect

## GSC Validation Guidance

Press "Validate fix" after deployment:

- `찾을 수 없음(404)` for the mapped legacy URLs that now return 301 redirects.
- `크롤링됨 - 현재 색인이 생성되지 않음` for the listed indexable content/tool URLs after requesting indexing.

Do not press, or treat as expected:

- `적절한 표준 태그가 포함된 대체 페이지` for query URLs that correctly canonicalize.
- Apartment detail URLs with `noindex,follow`.
- `리디렉션이 포함된 페이지` for legacy URLs that are intentionally retired into canonical destinations.

## Validation Commands

- `npm.cmd run build`: passed. `postbuild` ran during build and completed.
- `npm.cmd run postbuild`: passed after rerun with elevated filesystem permission. Sandbox-only runs hit Windows `EPERM` while opening existing sitemap files.
- `node scripts/verify_sitemap_clean.js`: passed, 0 forbidden entries and 0 missing required URLs.
- `node scripts/verify_gsc_index_urls.js`: passed against local production server via `GSC_BASE_URL`, including optional DB apt sample noindex check.

## Follow-up: GSC Verification Script and Structured Data

Checked: 2026-06-01

### Script Updates

- `scripts/verify_gsc_index_urls.js` now reads the final response `X-Robots-Tag` header.
- The robots judgment string now combines:
  - meta `robots`
  - meta `googlebot`
  - HTTP `X-Robots-Tag`
- `reports/gsc-index-url-audit.md` now includes an `X-Robots-Tag` column.
- Redirect judgments were split into:
  - `OK_REDIRECT_INDEXABLE`
  - `OK_REDIRECT_NOINDEX`
  - `OK_REDIRECT_CANONICAL_MISMATCH`
  - `OK_REDIRECT_TO_404`
  - `OK_NOINDEX`
  - `CHECK_CONTENT`
  - `CHECK_CANONICAL`
  - `FIX_404`

### Literal `[aptKey]` Production Check

The following production URLs were checked directly with redirects disabled:

| URL | Production status | Location | x-fm-redirect |
| --- | ---: | --- | --- |
| `https://www.finmaphub.com/market/real-estate/apt/%5BaptKey%5D` | 301 | `/market/real-estate` | `middleware` |
| `https://www.finmaphub.com/en/market/real-estate/apt/%5BaptKey%5D` | 301 | `/en/market/real-estate` | `middleware` |

This confirms the GSC literal template 404 cleanup path is already active on the production server through `proxy.js`.

### x-default Policy

- Sitemap policy is now aligned to "home pair only".
- `next-sitemap.config.js` emits `x-default` only when the KO base path is `/`.
- `_components/SeoHead.js` now follows the same rule for HTML head output.
- KO/EN hreflang alternates remain unchanged.
- `node scripts/verify_sitemap_clean.js` now reports x-default counts and policy violations.

Current sitemap result:

- Total `<loc>` entries: 190
- Forbidden URL violations: 0
- Missing required canonical URLs: 0
- x-default references: 2
- x-default policy violations: 0

### JSON-LD Date Sync

Updated body Article JSON-LD `dateModified` to match frontmatter:

| File | dateModified |
| --- | --- |
| `content/posts/economicInfo/en/indicator-basics.md` | `2026-06-01` |
| `content/posts/economicInfo/en/inflation-rate-basics.md` | `2026-06-01` |

### Additional Local QA

After rebuilding, a local production server check with `GSC_INCLUDE_APT_SAMPLE=1` returned `OK_NOINDEX` for both KO and EN apartment detail query sample URLs. This verifies the pending code state reads meta robots and `X-Robots-Tag` together and treats apartment detail query pages as noindex with a queryless canonical.

### Follow-up Validation Commands

- `npm.cmd run build`: passed.
- `npm.cmd run postbuild`: passed.
- `node scripts/verify_sitemap_clean.js`: passed.
- `node scripts/verify_gsc_index_urls.js`: passed against `https://www.finmaphub.com` after network escalation.
