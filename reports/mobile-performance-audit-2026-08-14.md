# FinMap Mobile Performance / LCP Audit - 2026-08-14

## Final Verdict

`PASS_WITH_SAFE_P0_FIXES`

The mobile homepage LCP was not the hero H1/text. Lighthouse identified the first "Start here" card cover image as the LCP element. The image was discoverable in the initial HTML, but it was still emitted as `loading="lazy"` without a high priority hint. The same image also flowed through Cloudinary fixed transforms and then through FinMap's `/_next/image` optimizer.

Applied changes are intentionally narrow:

- Prioritize only the confirmed homepage LCP image.
- Route homepage card Cloudinary images directly to Cloudinary responsive renditions.
- Keep SEO, canonical, hreflang, robots, content text, AdSense bootstrap, GA4, and page layout semantics unchanged.

Production After Lighthouse cannot be measured until this source change is deployed. Local production Lighthouse after the change was measured and is reported separately.

## Baseline

### Lab - Production URL

Target: `https://www.finmaphub.com/`

Measured with Lighthouse CLI, mobile emulation, 3 runs.

Raw files:

- `reports/mobile-lighthouse-before-1.json`
- `reports/mobile-lighthouse-before-2.json`
- `reports/mobile-lighthouse-before-3.json`

Median production baseline:

| Metric | Median |
| --- | ---: |
| Performance | 56 |
| Accessibility | 96 |
| Best Practices | 77 |
| SEO | 100 |
| FCP | 1.76s |
| LCP | 3.89s |
| Speed Index | 7.23s |
| TBT | 182ms |
| CLS | 0.421 |
| Transferred bytes | 2,051,503 bytes |
| Main-thread work | 2.59s |

Notes:

- The user's observed external PageSpeed LCP was about 7.4s. This run's Lighthouse lab median was 3.89s, so the exact external run could not be reproduced locally.
- The production lab CLS was 0.421 in this Lighthouse run, while the user observed about 0.004. Lighthouse attributed the shift only to `#__next`, so the likely trigger needs a separate ad/layout trace if it reproduces after deploy.
- Production TTFB was not the bottleneck: the three root-document server response readings were about 230ms, 190ms, and 100ms.

### Field / CrUX

PageSpeed Insights API was attempted for `loadingExperience` and `originLoadingExperience`, but returned HTTP 429 Too Many Requests. Lighthouse CLI output does not include CrUX `loadingExperience` fields.

Result: URL-level vs origin-level CrUX classification was not available in this run. Do not infer field data from the lab numbers above.

Reference: Google documents that PageSpeed Insights API responses can include `loadingExperience` and `originLoadingExperience`: https://developers.google.com/speed/docs/insights/v5/reference/pagespeedapi/runpagespeed

## Root Cause

### Actual LCP Element

Confirmed LCP element:

- Element: first `Start here` card image
- Selector: `div.grid > article.card > div.relative > img.object-cover`
- Label: `물가와 금리 기본 구조: 장기 투자자가 봐야 할 인플레이션 흐름`
- Rendered box in Lighthouse mobile run: about `328 x 185`, top `398px`

It was not:

- hero H1
- hero description
- CTA
- stat cards

### LCP Request Before

Production baseline request:

```text
https://www.finmaphub.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdwonflmnn%2Fimage%2Fupload%2Ff_auto%2Cq_auto%2Cc_fill%2Cw_480%2Ch_270%2Fv1782905589%2Fblog%2Finsight%2Finflation-basics%2Frework-20260701%2Fslot-001-cover.png&w=1200&q=75
```

Before diagnostics:

| Check | Result |
| --- | --- |
| Request discoverable in initial document | true |
| `fetchpriority=high` applied | false |
| Eagerly loaded | false, emitted as `loading="lazy"` |
| Upstream transform | Cloudinary `f_auto,q_auto,c_fill,w_480,h_270` |
| Final optimizer | FinMap `/_next/image` with `w=1200&q=75` |

### LCP Subpart Breakdown

Production median run's LCP insight subparts:

| Subpart | Duration |
| --- | ---: |
| TTFB | 255.7ms |
| Resource load delay | 255.4ms |
| Resource load duration | 133.5ms |
| Element render delay | 7.2ms |

The actionable source issue was the LCP discovery/prioritization state, not server response time or font rendering.

Local production before run showed the same element and discovery issue, with a cold `/_next/image` resource duration of about 1.81s. That confirmed the homepage image path could put unnecessary work on the FinMap Node/Next image optimizer.

## Changes Applied

1. Added a Cloudinary direct responsive image loader in `lib/cloudinaryUrl.js`.
2. Changed homepage card images in `pages/index.js` to use raw Cloudinary URLs with that loader, instead of passing already transformed Cloudinary URLs into `/_next/image`.
3. Added `priority` and `fetchPriority="high"` only to the confirmed LCP image: the first `Start here` card cover.
4. Removed unnecessary priority from the first `Latest posts` image when the `Start here` list exists, so a lower section does not compete with the real LCP image.
5. Replaced broad `100vw / 50vw / 33vw` card image sizes with a homepage-card-specific `sizes` value based on the actual padded card image width:

```text
(max-width: 640px) calc(100vw - 3.875rem), (max-width: 1023px) calc(50vw - 4rem), 333px
```

## Files Changed

- `lib/cloudinaryUrl.js`
- `pages/index.js`
- `reports/mobile-performance-audit-2026-08-14.md`

Generated measurement artifacts:

- `reports/mobile-lighthouse-before-1.json`
- `reports/mobile-lighthouse-before-2.json`
- `reports/mobile-lighthouse-before-3.json`
- `reports/mobile-lighthouse-local-before.json`
- `reports/mobile-lighthouse-local-after-1.json`
- `reports/mobile-lighthouse-local-after-2.json`
- `reports/mobile-lighthouse-local-after-3.json`
- `reports/mobile-lighthouse-local-after-seq-1.json`
- `reports/mobile-lighthouse-local-after-seq-2.json`
- `reports/mobile-lighthouse-local-after-seq-3.json`

## Image Pipeline Findings

Before:

- Homepage card images were using Cloudinary transforms such as `c_fill,w_480,h_270` or `c_fill,w_400,h_225`.
- Next Image then wrapped those transformed images again through `/_next/image`.
- On the production mobile Lighthouse run, the LCP request selected `/_next/image ... &w=1200&q=75` for a roughly `328px` rendered image on a DPR 3 mobile profile.
- `/_next/image` response had `x-nextjs-cache: HIT` and `Cache-Control: public, max-age=2592000, must-revalidate`, but Cloudflare reported `cf-cache-status: DYNAMIC`, so a cold or uncached path can still cost FinMap origin/Next optimizer work.

After:

- Homepage cards request Cloudinary directly with responsive `srcset`.
- The confirmed LCP image is preloaded and has `fetchPriority="high"`.
- Sequential local Lighthouse after the change selected:

```text
https://res.cloudinary.com/dwonflmnn/image/upload/f_auto,q_auto,c_fill,w_1080,h_608/v1782905589/blog/insight/inflation-basics/rework-20260701/slot-001-cover.png
```

- The browser selected the `1080w` Cloudinary rendition for the `390px / DPR 3` mobile run.
- The generated `srcset` still contains larger candidates because Next's default device sizes include them, but Lighthouse network logs showed the mobile run actually requested `1080w`, not `3840w`.

## Font / JS / CSS Findings

Fonts:

- No `next/font` usage found.
- No external Google Font request was found in `_app`, `_document`, `styles/globals.css`, or the homepage path.
- No font-display issue was reported by Lighthouse.
- Text LCP/font rendering was not the root cause.

CSS:

- One render-blocking CSS file was reported: about 13.8KB transfer and about 283ms potential blocking in the production baseline.
- Unused CSS saving estimate was about 11KB.
- This was not changed because it is small and a global CSS rewrite would be higher risk than the confirmed LCP image fix.

JavaScript:

- The homepage page chunk was small in the production treemap, about 4.3KB transferred.
- Largest unused JS findings were third-party scripts: GA4, AdSense, Funding Choices, and related ad scripts.
- Main-thread work in the production median was about 2.59s, with script evaluation the largest category.
- No calculator/chart/market dashboard component was found in the homepage initial bundle path.

## AdSense / GA4 Safety

No AdSense or GA4 removal was applied.

Observed source state:

- GA4 loader uses `strategy="lazyOnload"`.
- GA4 init script remains `afterInteractive`.
- AdSense bootstrap remains post-hydration through `AdSenseBootstrap` and `ensureAdSenseBootstrap()`.
- Ad slot push logic remains IntersectionObserver-based in `useAdSenseSlot`.

Lighthouse findings:

- Unused JS and long tasks are dominated by GA4/AdSense/Funding Choices scripts.
- Production lab CLS was high in this run, but the field-like user observation was low and the source already reserves a minimum ad height in responsive slots.

Decision:

- Third-party script behavior was not changed automatically, because doing so could affect ad fill, first-entry ad stability, or analytics collection.

## Before vs After

### Production

Production Before was measured. Production After is not available until deployment.

| Metric | Production Before Median | Production After |
| --- | ---: | --- |
| Performance | 56 | Not measured before deploy |
| FCP | 1.76s | Not measured before deploy |
| LCP | 3.89s | Not measured before deploy |
| Speed Index | 7.23s | Not measured before deploy |
| TBT | 182ms | Not measured before deploy |
| CLS | 0.421 | Not measured before deploy |
| Transferred bytes | 2,051,503 | Not measured before deploy |
| Main-thread work | 2.59s | Not measured before deploy |

### Local Production Server

Local Before was measured once before the code change. Local After was measured sequentially 3 times after `npm run build`; median is shown.

| Metric | Local Before | Local After Median |
| --- | ---: | ---: |
| Performance | 76 | 99 |
| FCP | 0.98s | 0.78s |
| LCP | 5.77s | 2.12s |
| Speed Index | 2.56s | 1.45s |
| TBT | 184ms | 70ms |
| CLS | 0 | 0 |
| Transferred bytes | 748,948 | 846,653 |
| Main-thread work | 1.28s | 1.12s |

LCP discovery after:

| Check | After |
| --- | --- |
| `fetchpriority=high` applied | true |
| Request discoverable in initial document | true |
| Eagerly loaded | true |

## Build / Verification

Commands run:

```text
node --check lib\cloudinaryUrl.js
node --check pages\index.js
npm.cmd run build
npx.cmd --yes lighthouse https://www.finmaphub.com/ ... 3 runs
npx.cmd --yes lighthouse http://127.0.0.1:<port>/ ... local before/after runs
```

Results:

- `node --check lib\cloudinaryUrl.js`: PASS
- `node --check pages\index.js`: PASS
- `npm.cmd run build`: PASS
- Production Lighthouse baseline: PASS, 3 raw JSON files generated
- Local production Lighthouse after: PASS, 3 sequential raw JSON files generated
- Local rendered HTML confirmed direct Cloudinary `srcset` and `fetchPriority="high"` for the LCP image

Build note:

- Build printed the existing Browserslist/caniuse-lite age notice. No package update was performed.

## Remaining Recommendations

1. After deployment, run mobile Lighthouse against `https://www.finmaphub.com/` 3 times again and compare production median. The local after result is promising but is not a substitute for production after.
2. Retry PageSpeed Insights or CrUX API later, ideally with an API key/quota, to distinguish URL-level field data from origin fallback data.
3. Remember that CrUX/Core Web Vitals field LCP is 28-day rolling data. The observed 7.4s field-like LCP will not drop immediately after deployment.
4. If production lab CLS still reproduces near 0.42 after deployment, take a trace focused on ad/funding choices insertion and only then consider ad container reservation changes.
5. The category and post detail image paths still use the existing `cloudinaryThumb` + Next optimizer pattern. This audit fixed the homepage P0 LCP path only; broader image pipeline migration should be a separate, measured task.
