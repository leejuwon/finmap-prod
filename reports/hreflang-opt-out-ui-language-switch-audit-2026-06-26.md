# Hreflang Opt-Out UI Language Switch Audit - 2026-06-26

## Summary

- Target slug: `how-much-per-month-for-100m`
- Scope: audit only. No UI/code/content changes in this task.
- SEO state from prior implementation: `hreflangEquivalent: false` makes head and sitemap hreflang self-only.
- UI finding: the global Header language switch still treats the opposite same-slug post as available because it only receives `otherLangAvailable`, not `hreflangEquivalent`.
- Recommendation: `convert_to_related_language_link`

## Relevant UI Files

| File | Role |
| --- | --- |
| `_components/Header.js` | Global navigation and language switch buttons. Only component found that listens to `fm_post_availability`. |
| `_components/Layout.js` | Renders `<Header />` around all pages. |
| `pages/_app.js` | Wraps every page in `Layout`. |
| `pages/posts/[category]/[slug].js` | Dispatches `fm_post_availability`; computes `otherLangAvailable`; passes `alternateLanguages` to `SeoHead`. |
| `lib/posts.js` | Exposes `hreflangEquivalent`; strict post existence helpers used by post page. |
| `reports/hreflang-opt-out-implementation-2026-06-26.md` | Confirms SEO head/sitemap opt-out implementation. |

No separate `LanguageSwitcher` or `LocaleSwitcher` component was found. The language switch is implemented directly in `_components/Header.js`.

## `fm_post_availability` Usage

Producer:

- `pages/posts/[category]/[slug].js` dispatches `fm_post_availability` on post detail mount.
- Event detail shape:
  - `type: "post"`
  - `slug`
  - `category`
  - `available: { [currentLang]: true, [otherLang]: !!otherLangAvailable }`
- `otherLangAvailable` is computed with `hasSlugCached(otherLang, slug)`.
- Current event detail does not include `hreflangEquivalent`.

Consumer:

- `_components/Header.js` is the only listener found.
- It stores the event detail in `postAvailRef.current`.
- On post detail pages, `handleLangChange(next)` checks `postAvailRef.current?.available?.[next]`.
- If unavailable, it blocks navigation and shows:
  - KO UI: `이 글은 영어 버전이 아직 없습니다.`
  - EN UI: `This post doesn't have the other language version yet.`
- If available, it calls:
  - `router.push({ pathname: router.pathname, query: q }, undefined, { locale: next })`

## Target Slug Expected UI Behavior

For `how-much-per-month-for-100m`, both KO and EN markdown files exist with the same slug. Therefore:

| Current page | `otherLangAvailable` | Header visible control | Expected click behavior |
| --- | ---: | --- | --- |
| KO `/posts/personalFinance/how-much-per-month-for-100m` | `true` | `한국어` active, `EN` visible/enabled | Clicking `EN` routes to `/en/posts/personalFinance/how-much-per-month-for-100m`. |
| EN `/en/posts/personalFinance/how-much-per-month-for-100m` | `true` | `EN` active, `한국어` visible/enabled | Clicking `한국어` routes to `/posts/personalFinance/how-much-per-month-for-100m`. |

The UI does not render a literal text link saying `translation`. However, the implementation comments and missing-version messages frame this as a post language version/translation availability check. To a user, the compact `한국어` / `EN` toggle in the same page position also naturally reads as a language version switch, not as a related-article recommendation.

## SEO Opt-Out vs UI Consistency

Current SEO policy says this pair is not a localized equivalent:

- KO intent: KRW 1억원 monthly plan.
- EN intent: USD $100,000 target portfolio plan.
- Head/sitemap behavior: self-only hreflang for both target URLs.

Current UI still allows direct KO/EN switching as long as the same slug exists. That means the UI and SEO policies are partially inconsistent:

- SEO says: these are not equivalent language alternatives.
- UI says, implicitly: this same post has another language version available.

This is not a canonical/noindex risk because the click is client-side navigation and the canonical URLs remain self. The risk is user expectation and product semantics: users may treat the opposite-language page as the translation of the current post even though the target amount and search intent differ.

## Recommendation

Recommended action: `convert_to_related_language_link`

Reason:

- Keeping the current switch is understandable as a broad site-language control, but on post detail pages it behaves like a language-version switch.
- Hiding the language switch entirely for opt-out posts is SEO-consistent but may be too blunt for global navigation.
- A clearer model is:
  - keep global site language controls for non-post pages and true hreflang pairs;
  - for opt-out post pairs, do not switch the current article as if it were a translation;
  - optionally surface the opposite-language same-slug article as a contextual link with copy such as `Related English article` / `관련 영어 글`.

If implementation scope must stay minimal, `hide_ui_language_switch_for_opt_out` is the safer interim policy for post detail pages.

## Follow-Up Implementation Options

| Option | What changes | Pros | Risks |
| --- | --- | --- | --- |
| `keep_ui_language_switch` | Do nothing. Header keeps switching to opposite same-slug post. | No implementation work. Users can still move across language channels quickly. | Continues to imply language-version equivalence for opt-out posts. |
| `hide_ui_language_switch_for_opt_out` | Include `hreflangEquivalent` in `fm_post_availability`; Header disables/hides opposite language action when false. | Most consistent with SEO opt-out; small implementation. | Removes a possible cross-channel path even though related content exists. |
| `convert_to_related_language_link` | Include opt-out status plus optional related URL/copy; Header or post detail renders it as a related article, not a language version. | Best semantic match; preserves discovery without saying "translation." | More UI copy/state work and needs mobile layout review. |

Implementation detail if pursued:

- Extend `fm_post_availability` detail with `hreflangEquivalent: post.hreflangEquivalent !== false`.
- In `_components/Header.js`, when `isPostDetail && hreflangEquivalent === false`, avoid routing the language toggle directly to the same slug as a language version.
- Add a separate related-language link only if the product decision is to keep cross-language discovery.

## Commands Run

| Command | Result |
| --- | --- |
| `git status --short` | PASS. Existing dirty worktree from prior hreflang opt-out implementation observed. |
| `rg -n "fm_post_availability\|otherLangAvailable\|LanguageSwitcher\|LocaleSwitcher\|language switch\|locale switch\|router\.locale..." ...` | PASS. Found post producer and Header consumer; some missing `components`/`hooks` dirs reported by `rg`. |
| `rg --files _components components hooks utils pages \| rg "(Header\|Language\|Locale\|Switcher\|Nav\|Navbar\|Layout\|App\|Top\|Menu)"` | PASS with missing-dir noise for absent `components`/`hooks`; relevant files are `_components/Header.js`, `_components/Layout.js`, `pages/_app.js`. |
| `Get-Content -Encoding UTF8 -Path _components\Header.js` | PASS. Confirmed labels, event listener, blocking message, and router push behavior. |
| `Get-Content -Path _components\Layout.js` | PASS. Confirmed Header wraps page content. |
| `Get-Content -Path pages\_app.js` | PASS. Confirmed Layout wraps all pages. |
| `rg -n "fm_post_availability" _components pages utils lib` | PASS. Only Header listener and post page dispatcher found. |
| `rg -n "postAvailRef\|langBlockMsg\|handleLangChange\|available.*next\|router.push" _components\Header.js` | PASS. Confirmed `otherLangAvailable`-based navigation gate. |
| `git diff --check` | PASS. Exit code 0; LF/CRLF conversion warnings only from existing modified files. |
