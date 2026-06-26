# DCA Bear Market Hreflang Slug Mismatch Audit

## Summary

- Audit date: 2026-06-26
- Scope: audit only. No code, content, URL, canonical, noindex, robots, or sitemap policy changes were made.
- KO URL: `https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-bear-market`
- EN URL: `https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-a-bear-market`
- Slug mismatch: KO uses `is-dca-better-in-bear-market`; EN uses `is-dca-better-in-a-bear-market`.
- Classification: `explicit_alternate_mapping_candidate`
- Intent equivalence score: `high`
- Recommended next action: add an explicit reciprocal alternate mapping. Do not use `hreflangEquivalent: false` as the main solution for this pair.

## File Existence

| File | Exists | Notes |
| --- | --- | --- |
| `content/posts/personalFinance/ko/is-dca-better-in-bear-market.md` | yes | KO DCA bear-market article. |
| `content/posts/personalFinance/en/is-dca-better-in-a-bear-market.md` | yes | EN DCA bear-market article with one-word slug difference. |

## Frontmatter Comparison

| Field | KO | EN | Assessment |
| --- | --- | --- | --- |
| `slug` | `is-dca-better-in-bear-market` | `is-dca-better-in-a-bear-market` | Mismatch only. |
| `title` | `하락장에서 적립식 투자가 유리하다는 말은 진짜일까?` | `Is Dollar-Cost Averaging Better in a Bear Market?` | Same core question. |
| `seoTitle` | `하락장에서 적립식 투자가 유리하다는 말은 진짜일까? DCA 시나리오로 보기` | `Is Dollar-Cost Averaging Better in a Bear Market?` | KO adds scenario framing; still equivalent. |
| `description` | DCA average-cost effect and limits under early/mid/final-year declines. | DCA behavior in bear-market scenarios with early/mid/final-year drawdowns. | Equivalent. |
| `seoDescription` | Same as KO description. | Same as EN description. | Equivalent. |
| `tags` | `하락장`, `적립식 투자`, `DCA`, `MDD`, `하락장 시나리오`, `평균 매수단가`, `투자 시뮬레이션` | `dca`, `bear market`, `dollar cost averaging`, `drawdown`, `monthly investing`, `target portfolio`, `investment simulator` | Localized equivalents plus EN search phrasing. |
| `hreflangEquivalent` | absent, defaults to `true` through `lib/posts.js` | absent, defaults to `true` through `lib/posts.js` | Opt-out is not currently applied. |

## Content Comparison

### Intent

- KO intent: Korean reader asks whether monthly DCA is actually advantageous in a bear market, using scenario comparisons, MDD, final after-tax asset value, and a KRW 1억원 target example.
- EN intent: English reader asks whether dollar-cost averaging is better in a bear market, using the same scenario logic, MDD, final after-tax value, and a 100,000 target example.
- Assessment: the examples are localized, but the search intent and answer shape are highly equivalent.

### First Paragraph / Intro

- Both articles open with summary bullets explaining that DCA buys more units when prices are lower, but drawdown timing matters.
- Both hero sections frame the same caveat: "DCA works better in a bear market" is too broad; early decline plus recovery differs from a final-year decline.
- KO uses Korean phrasing and KRW-oriented planning language. EN uses English DCA/drawdown terminology.

### Major Sections

| KO section | EN section | Assessment |
| --- | --- | --- |
| `DCA가 하락장에서 다르게 보이는 이유` | `Why DCA Can Look Different in a Bear Market` | Direct equivalent. |
| `하락 시점별 DCA 영향` | `Four Scenarios to Compare` | Direct equivalent. |
| `예시: 월 50만원, 10년, 연 7%, 목표 1억원` | `Example: 500 Monthly, 10 Years, 7% Return Assumption` | Localized amount/target, same model. |
| `MDD와 최종 자산을 함께 봐야 하는 이유` | `Read MDD With Final Value` | Direct equivalent. |
| `계산기에서 직접 비교하는 방법` | `How to Test It` | Direct equivalent CTA section. |
| `FAQ` | `FAQ` | Same FAQ intent and question order. |

### Tables

Both posts contain the same three table types:

1. Scenario comparison: base model, early drop and recovery, mid-period drop and recovery, final-year drop.
2. Example outcome table: final after-tax value, difference versus base, MDD, target status.
3. Metric explanation table: final after-tax value, MDD, average cost, final price.

The KO example uses `월 50만원` and `목표 1억원`; the EN example uses `500 monthly` and a `100,000 target amount`. This is localization, not a different search intent.

### FAQ

Both articles have five equivalent FAQ questions:

- Is DCA always better in a bear market?
- Why does an early drop differ from a final-year drop?
- What is MDD?
- Are bear-market scenarios forecasts?
- Why add a target amount?

### CTA and Internal Links

| Item | KO | EN | Assessment |
| --- | --- | --- | --- |
| DCA calculator CTA | `/tools/dca-calculator` | `/en/tools/dca-calculator` | Localized correctly. |
| Goal simulator CTA | `/tools/goal-simulator` | `/en/tools/goal-simulator` | Localized correctly. |
| DCA vs lump sum link | `/posts/personalFinance/dca-vs-lump-sum-when-results-differ` | `/en/posts/personalFinance/dca-vs-lump-sum-when-results-differ` | Localized correctly. |
| Monthly DCA example link | `/posts/personalFinance/monthly-dca-10-year-result` | `/en/posts/personalFinance/monthly-dca-10-year-result` | Localized correctly. |

## Current Routing Behavior

Relevant routing facts from `pages/posts/[category]/[slug].js` and `lib/posts.js`:

- `getStaticPaths()` emits actual KO and EN slugs separately with `fallback: false`.
- `getStaticProps()` loads with `getPostBySlugStrict(lang, slug)`, so missing same-slug counterparts do not fall back.
- `otherLangAvailable` is computed as `hasSlugCached(otherLang, slug)`, which is same-slug only.
- For this pair:
  - KO page checks EN slug `is-dca-better-in-bear-market`: not found.
  - EN page checks KO slug `is-dca-better-in-a-bear-market`: not found.

Observed with local verifier:

| URL | HTTP | Result |
| --- | ---: | --- |
| `https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-bear-market` | 200 | Existing KO article. |
| `https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-a-bear-market` | 200 | Existing EN article. |
| `https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-bear-market` | 404 | Same-slug EN URL generated by KO head logic does not exist. |
| `https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-a-bear-market` | 404 | Same-slug KO URL generated by EN head logic does not exist. |

## Current Hreflang Behavior in Head

`SeoHead` receives `alternateLanguages={post.hreflangEquivalent !== false}`. Since neither post has `hreflangEquivalent: false`, both pages use normal alternate output.

`SeoHead` normalizes the current URL path by stripping `/en`, then emits same-path KO/EN alternates. It does not check whether the alternate target actually exists.

Observed head output from a temporary local `web.js` server:

| Page | Canonical | `hreflang="ko"` | `hreflang="en"` | Assessment |
| --- | --- | --- | --- | --- |
| KO actual slug | `https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-bear-market` | `https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-bear-market` | `https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-bear-market` | EN alternate points to a 404 URL. |
| EN actual slug | `https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-a-bear-market` | `https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-a-bear-market` | `https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-a-bear-market` | KO alternate points to a 404 URL. |

So the current head behavior is not truly "unpaired"; it is a same-slug inferred pair whose opposite-language target does not exist.

## Current Hreflang Behavior in Sitemap

`next-sitemap.config.js` builds sitemap alternates with same-slug logic:

- It strips `/en` to get `koLoc`.
- It builds `enLoc` as `/en${koLoc}`.
- For posts, `hasKoEnPairForLoc(koLoc, enLoc)` requires both exact locs to exist in `POSTS_LASTMOD_MAP`.
- Since the DCA bear-market slugs differ, no `alternateRefs` are emitted.
- `scripts/generate_channel_sitemaps.js` preserves the source entry XML, so channel sitemaps keep the no-`xhtml:link` state.

Observed sitemap state:

| Sitemap | KO slug entry | EN slug entry | `xhtml:link` state |
| --- | --- | --- | --- |
| `public/sitemap-0.xml` | present | present | Neither target entry has `xhtml:link`. |
| `public/sitemap-ko.xml` | present | N/A | KO entry has no `xhtml:link`. |
| `public/sitemap-en.xml` | N/A | present | EN entry has no `xhtml:link`. |
| `public/en/sitemap.xml` | N/A | present | EN entry has no `xhtml:link`. |

This means head and sitemap are inconsistent:

- Head emits same-slug alternates to 404 targets.
- Sitemap emits no alternates for the real KO/EN articles.

## Current UI Language Switch Behavior

After the UI opt-out patch, Header still uses `fm_post_availability.available` for ordinary missing-language checks and disables only `hreflangEquivalent === false` opt-out posts.

For this DCA slug mismatch:

- `hreflangEquivalent` defaults to `true`.
- `otherLangAvailable` is `false` because the opposite language same slug does not exist.
- The Header language buttons remain visible/enabled.
- Clicking the opposite language is blocked by the missing-version check:
  - KO page: `이 글은 영어 버전이 아직 없습니다.`
  - EN page: `This post doesn't have the other language version yet.`

The UI therefore does not route to the real mismatched counterpart and does not route to the 404 same-slug alternate. It behaves as if the article is unpaired, even though a high-equivalence counterpart exists under a different slug.

## Existing Opt-Out Implementation Fit

The `hreflangEquivalent: false` opt-out implementation is not sufficient as the primary solution.

- It can suppress alternate output for same-slug intent mismatches.
- It cannot connect two equivalent posts with different slugs.
- Applying `hreflangEquivalent: false` here would hide the invalid head alternates, but it would also declare a high-equivalence pair as not equivalent and would leave the useful KO/EN relationship unexpressed.

Conclusion: `hreflang_opt_out_not_needed`; explicit alternate mapping is needed if the pair should be connected.

## Risks

### Risk If Left Unpaired / As-Is

- Head points to non-existent opposite-language URLs.
- Sitemap has no reciprocal `xhtml:link`, so head and sitemap send conflicting language-alt signals.
- Search engines may encounter hreflang targets that 404, weakening hreflang trust for these URLs.
- Users cannot reach the real counterpart through the Header language switch.
- Existing verification scripts can pass the actual URLs because they expect same-path alternates but do not validate alternate target existence.

### Risk If Explicitly Mapped

- Requires a new mapping source and reciprocal validation.
- A stale mapping could point to renamed or deleted content if not checked.
- `SeoHead`, sitemap generation, Header UI, and verification scripts must agree on the same mapping to avoid another head/sitemap/UI mismatch.

The implementation risk is manageable because this is a narrow, explicit exception to same-slug pairing.

## Recommended Next Action

Recommended classification: `explicit_alternate_mapping_candidate`

Reason:

- The KO and EN articles are high-equivalence localized counterparts.
- The only meaningful mismatch is slug wording: `bear-market` vs `a-bear-market`.
- Same-slug automation cannot express the relationship.
- Opt-out would remove a useful hreflang relationship rather than fix it.
- Rename/redirect would be heavier than necessary and would alter existing URL behavior.

## Implementation Options

| Option | Recommendation | Notes |
| --- | --- | --- |
| `do nothing` | Not recommended | Leaves head alternates pointing to 404 targets and keeps sitemap unpaired. |
| `add explicit alternate mapping` | Recommended | Add reciprocal KO/EN alternate metadata and use it consistently in head, sitemap, Header UI, and verifiers. |
| `rename/redirect` | Not recommended unless strongly justified | Would align same-slug automation, but changes URL/canonical/redirect surface and is unnecessary for a one-word slug mismatch. |
| `content adaptation` | Not needed for equivalence | Content is already structurally and semantically aligned. Minor localization edits are optional, not required for hreflang. |

Suggested explicit mapping shape for a future implementation:

```yaml
hreflangAlternates:
  ko: "/posts/personalFinance/is-dca-better-in-bear-market"
  en: "/en/posts/personalFinance/is-dca-better-in-a-bear-market"
```

Future implementation should:

- expose this mapping from `lib/posts.js`;
- let `SeoHead` accept explicit alternate hrefs, not only a boolean;
- make `next-sitemap.config.js` use explicit mappings before same-slug fallback;
- let Header use the explicit alternate URL for true mapped pairs;
- update `verify_post_publish_urls.js` and `verify_seo_channel_split.js` to validate reciprocal alternate targets, HTTP 200, canonical self, and sitemap membership.

## Commands Run

| Command / Check | Result |
| --- | --- |
| `Get-Content` for both target markdown files | PASS. Both files exist and were inspected. |
| Node/gray-matter frontmatter and structure extraction | PASS. Frontmatter, headings, tables, internal links, and FAQ lists extracted. |
| `rg` over `pages/posts/[category]/[slug].js`, `_components/SeoHead.js`, `lib/posts.js`, `next-sitemap.config.js`, sitemap scripts, and verifier scripts | PASS. Confirmed same-slug routing/head/sitemap assumptions. |
| `rg -n "is-dca-better-in-bear-market\|is-dca-better-in-a-bear-market" public\sitemap-0.xml public\sitemap-ko.xml public\sitemap-en.xml public\en\sitemap.xml` | PASS. Real KO/EN locs are present; no target `xhtml:link` alternates are present. |
| `node scripts\verify_post_publish_urls.js --local-server <actual KO/EN URLs>` | PASS. Actual URLs return 200, self canonical, no noindex, sitemap included. Script reports hreflang pair present because it does not validate alternate target existence. |
| `node scripts\verify_post_publish_urls.js --local-server <same-slug opposite URLs>` | Expected FAIL. Both same-slug opposite URLs return 404, confirming the head-generated alternate targets do not exist. |
| Temporary `web.js` server + PowerShell HTML head extraction | PASS. Confirmed actual head emits same-slug alternates to 404 targets. |
| `git diff --check` | PASS. Exit code 0; no output. |
