# Hreflang Opt-Out UI Language Switch Patch - 2026-06-26

## Summary

- Target slug: `how-much-per-month-for-100m`
- Goal: keep URL, canonical, robots, noindex, sitemap, and SEO hreflang opt-out behavior unchanged while preventing the Header language switch from treating this opt-out pair as a direct language version.
- Implemented policy: `hide_ui_language_switch_for_opt_out` as an interim minimal patch, using disabled opposite-language controls on post detail pages.
- Not implemented: `convert_to_related_language_link`; this remains a follow-up option only.

## Changed Files

| File | Change |
| --- | --- |
| `pages/posts/[category]/[slug].js` | Adds `hreflangEquivalent: post.hreflangEquivalent !== false` to the `fm_post_availability` event detail. |
| `_components/Header.js` | Stores post availability event detail in state, detects `hreflangEquivalent === false`, disables the opposite-language button, and guards against same-slug locale routing for opt-out post detail pages. |
| `reports/hreflang-opt-out-ui-language-switch-patch-2026-06-26.md` | This patch report. |

## Event Detail Change

`pages/posts/[category]/[slug].js` now dispatches:

```js
{
  type: 'post',
  slug,
  category: categorySlug,
  hreflangEquivalent: post.hreflangEquivalent !== false,
  available: {
    [lang]: true,
    [otherLang]: !!otherLangAvailable,
  },
}
```

This keeps the existing `available` shape intact for normal missing-translation behavior and adds one explicit semantic flag for SEO/UI consistency.

## Header Behavior Change

`_components/Header.js` now:

- keeps `postAvailRef.current` for the existing click-time availability check;
- also stores the event detail in `postAvailability` state so the language buttons can render disabled state;
- treats `router.pathname === "/posts/[category]/[slug]" && postAvailability?.hreflangEquivalent === false` as an opt-out post detail;
- disables only the opposite-language button for opt-out post details;
- preserves the existing "other language version missing" message for posts without a counterpart;
- keeps general same-slug hreflang pairs unchanged.

Opt-out message text is attached as the disabled button `title`:

- KO UI: `이 글은 번역 버전이 아니라 별도 글로 운영됩니다.`
- EN UI: `This post is managed as a separate article, not a language version.`

## Expected UI Behavior

| Page | Current language button | Opposite language button | Same-slug route push |
| --- | --- | --- | --- |
| `/posts/personalFinance/how-much-per-month-for-100m` | `한국어` enabled | `EN` disabled | Blocked |
| `/en/posts/personalFinance/how-much-per-month-for-100m` | `EN` enabled | `한국어` disabled | Blocked |
| `/posts/personalFinance/what-is-cagr` | `한국어` enabled | `EN` enabled | Preserved |
| `/en/posts/personalFinance/what-is-cagr` | `EN` enabled | `한국어` enabled | Preserved |

## Validation Results

| Command / Check | Result |
| --- | --- |
| `npm.cmd run build` | PASS. Next build completed and postbuild regenerated sitemap files. |
| `node scripts\verify_post_publish_urls.js --local-server <4 target URLs>` | PASS. Opt-out URLs stayed self canonical, indexable, sitemap-included, and self-only hreflang; `what-is-cagr` kept normal hreflang pair behavior. |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS. Channel sitemap policy, required EN URLs, opt-out samples, and normal pair samples passed. |
| Puppeteer DOM check with temporary `web.js` server on port `8017` | PASS. Opt-out opposite-language buttons were disabled; normal pair buttons remained enabled. |
| `git diff --check` | PASS. Exit code 0; LF/CRLF conversion warnings only. |

DOM check details:

| Page | DOM result |
| --- | --- |
| `opt-out ko` | `한국어 disabled=false`, `EN disabled=true`, EN title has KO opt-out message. |
| `opt-out en` | `한국어 disabled=true`, `EN disabled=false`, KO title has EN opt-out message. |
| `normal ko` | `한국어 disabled=false`, `EN disabled=false`. |
| `normal en` | `한국어 disabled=false`, `EN disabled=false`. |

## SEO Policy Impact

- URL: unchanged.
- Canonical: unchanged and self.
- Robots/noindex: unchanged; no noindex added.
- Sitemap generation policy: unchanged in this patch.
- SEO hreflang opt-out: preserved from the prior implementation.
- UI language switch policy: now aligned with the self-only SEO hreflang policy for this opt-out pair.

## Remaining Issues / Follow-Up

- `convert_to_related_language_link` is still the cleaner long-term UX if cross-language discovery should be preserved without implying translation equivalence.
- The DCA bear market slug mismatch / decouple candidate was not touched.
