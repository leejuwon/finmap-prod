# FAQPage JSON-LD Duplication Audit

Date: 2026-06-19

## Scope

Checked the three rewritten EN articles and the blog detail rendering path:

- `content/posts/personalFinance/en/what-is-cagr.md`
- `content/posts/personalFinance/en/annual-vs-monthly-compound.md`
- `content/posts/personalFinance/en/dsr-40-income-loan-limit-table.md`
- `pages/posts/[category]/[slug].js`
- `_components/SeoHead.js`
- `lib/posts.js`

This audit did not change article content, canonical, hreflang, sitemap, robots, noindex, `SeoHead`, or structured-data generation logic.

## Conclusion

No duplicate FAQPage JSON-LD output was found for the three target EN posts.

Each target post currently outputs:

- 1 `BlogPosting` JSON-LD block from the blog detail template
- 1 `BreadcrumbList` JSON-LD block from the blog detail template
- 1 `FAQPage` JSON-LD block from the manual script embedded in the markdown body

The blog detail template does not generate an automatic FAQPage JSON-LD block, and `SeoHead` does not generate JSON-LD.

## Source Findings

| Area | Finding | Evidence |
| --- | --- | --- |
| Target markdown files | Each target article has one manual `FAQPage` JSON-LD block. | `what-is-cagr.md:143`, `annual-vs-monthly-compound.md:137`, `dsr-40-income-loan-limit-table.md:175` |
| Markdown loading | Markdown is converted with `marked.parse(content || '')` and stored as `post.contentHtml`; no FAQ extraction or automatic FAQ schema generation was found here. | `lib/posts.js:166` |
| Blog template JSON-LD | The post template defines and renders `BlogPosting` and `BreadcrumbList` JSON-LD only. | `pages/posts/[category]/[slug].js:173`, `pages/posts/[category]/[slug].js:194`, `pages/posts/[category]/[slug].js:567`, `pages/posts/[category]/[slug].js:568` |
| Blog body rendering | The converted markdown body is parsed and rendered from `post.contentHtml`, so the manual markdown JSON-LD is the FAQPage source. | `pages/posts/[category]/[slug].js:550` |
| `SeoHead` | `SeoHead` handles title, description, canonical, hreflang, RSS alternate, Open Graph, and Twitter tags. It does not output JSON-LD. | `_components/SeoHead.js:29` |

## Target Page Output Check

Existing build HTML under `.next/server/pages/en/posts/personalFinance/` was inspected for `application/ld+json` blocks.

| URL path | JSON-LD types found | FAQPage count | Duplicate FAQPage? |
| --- | --- | ---: | --- |
| `/en/posts/personalFinance/what-is-cagr` | `BlogPosting`, `BreadcrumbList`, `FAQPage` | 1 | No |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | `BlogPosting`, `BreadcrumbList`, `FAQPage` | 1 | No |
| `/en/posts/personalFinance/dsr-40-income-loan-limit-table` | `BlogPosting`, `BreadcrumbList`, `FAQPage` | 1 | No |

## Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `rg -n "FAQPage\|faq\|faqs\|structuredData\|json-ld\|application/ld\+json\|SeoHead" ...` | PASS | Located manual FAQPage blocks and template JSON-LD code paths. |
| `Get-Content -LiteralPath "pages\posts\[category]\[slug].js"` | PASS | Confirmed template emits `BlogPosting` and `BreadcrumbList`, not FAQPage. |
| `Get-Content -Path _components\SeoHead.js` | PASS | Confirmed no JSON-LD output in `SeoHead`. |
| `Get-Content -Path lib\posts.js` | PASS | Confirmed markdown body conversion path. |
| PowerShell JSON-LD count over `.next/server/pages/en/posts/personalFinance/*.html` | PASS | Each target page has exactly one `FAQPage` JSON-LD block. |

`npm run build` was not rerun for this audit because the required conclusion was confirmed by source inspection plus the existing generated HTML from the latest build.

## Recommendation

No code or content change is needed now.

If a future template-level automatic FAQPage generator is added, choose a single owner for FAQPage schema per post:

- either keep manual markdown FAQPage scripts and do not auto-generate FAQPage from headings, or
- move FAQ data into frontmatter/content parsing and remove manual markdown FAQPage scripts for affected posts.

Do not output both for the same visible FAQ section.
