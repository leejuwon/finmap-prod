# Finmap AI-like Prose Rewrite - KO Batch 1.1 Polish

Date: 2026-06-19

## Scope

Target files:

1. `content/posts/personalFinance/ko/how-much-monthly-invest-for-100m.md`
2. `content/posts/personalFinance/ko/simple-vs-compound.md`
3. `content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md`
4. `content/posts/personalFinance/ko/is-dca-better-in-bear-market.md`
5. `content/posts/economicInfo/ko/geopolitics-to-usd-liquidity-fx.md`

Polish constraints:

- No large body rewrite.
- No slug, link, category, postCategory, lang, canonical, hreflang, robots, routing, SeoHead, or sitemap policy change.
- Existing internal links were kept.
- `dateModified: "2026-06-19"` was already present and kept.

## Modified Items

| File | Change |
|---|---|
| `simple-vs-compound.md` | Changed the visible `title` from an exaggerated phrasing to `단리 vs 복리: 월 30만원 예시로 보는 장기 자산 차이`. |
| `simple-vs-compound.md` | Updated manual Article JSON-LD `headline` to match the new title. |
| `simple-vs-compound.md` | Replaced manual Article JSON-LD `image` from the old `/images/posts/simple-vs-compound/cover.png` path to the actual Cloudinary cover/figure image. |
| `simple-vs-compound.md` | Reworded repeated template labels such as `이 글을 다 읽고 나면`, `여기까지 한 줄 결론`, `오해 교정`, `체크리스트`, and `범위/한계`. |
| `geopolitics-oil-fx-dashboard.md` | Changed `tool: ["cagr"]` to `tool: ["dsrLtv"]` because the article focuses on housing, lending burden, and DSR/LTV-adjacent decisions rather than CAGR. |
| `geopolitics-oil-fx-dashboard.md` | Reduced repeated `루틴/체크리스트/여기까지 한 줄 결론/범위/한계` rhythm by using `점검 순서`, `관측 목록`, and `다루는 범위`. |
| `geopolitics-oil-fx-dashboard.md` | Updated description and manual Article JSON-LD description to match the new `10분 점검 순서` wording. |
| `geopolitics-to-usd-liquidity-fx.md` | Reduced repeated `체크리스트/여기까지 한 줄 결론/오해 교정/범위/한계` rhythm by using `점검표`, `규칙`, and `다루는 범위`. |
| `geopolitics-to-usd-liquidity-fx.md` | Updated description and manual Article JSON-LD description from `체크리스트` to `점검표`. |

## Unchanged Items and Reasons

| File | Unchanged | Reason |
|---|---|---|
| `how-much-monthly-invest-for-100m.md` | No extra polish change in this pass. | Title, tool metadata, FAQ, and JSON-LD were already aligned after Batch 1. |
| `is-dca-better-in-bear-market.md` | No extra polish change in this pass. | No excessive title, template label, image, or tool mismatch was found. |
| All 5 files | slug/link/category/postCategory/lang | Explicitly preserved. |
| All 5 files | FAQ visible questions and FAQPage JSON-LD questions | Already matching; only non-FAQ prose labels were adjusted. |
| All 5 files | sitemap/robots/routing/SeoHead | Not part of this polish task. |

## Title and Metadata

- `simple-vs-compound.md`
  - `title` changed to a less exaggerated, search-intent-aligned title.
  - `seoTitle` stayed unchanged: `단리 vs 복리 계산: 월 30만원 투자 예시로 보는 장기 차이`.
  - Manual Article JSON-LD `headline` was updated to match the visible title.
- `geopolitics-oil-fx-dashboard.md`
  - `description` and manual Article JSON-LD `description` changed only to replace `10분 루틴` with `10분 점검 순서`.
  - `tool` changed from `cagr` to existing project tool id `dsrLtv`.
- `geopolitics-to-usd-liquidity-fx.md`
  - `description` and manual Article JSON-LD `description` changed only to replace `체크리스트` with `점검표`.

## JSON-LD Image Check

`simple-vs-compound.md` image alignment:

- Frontmatter `cover`: `https://res.cloudinary.com/dwonflmnn/image/upload/v1764429436/blog/personalFinance/simple-vs-compound-cover.png`
- Body figure image: same Cloudinary URL
- Manual Article JSON-LD `image`: same Cloudinary URL
- Old non-matching path `/images/posts/simple-vs-compound/cover.png` no longer appears in the file.

JSON-LD parse check:

- All 5 target files: PASS
- Built HTML structured data types for each target URL:
  - `BlogPosting`
  - `BreadcrumbList`
  - manual `Article`
  - manual `FAQPage`

## Tool Metadata Check

- Project tool label mapping includes:
  - `comp`
  - `compound`
  - `goal`
  - `cagr`
  - `dca`
  - `fire`
  - `dsrLtv`
- `geopolitics-oil-fx-dashboard.md` previously used `tool: ["cagr"]`.
- Because the article centers on housing-market transmission, lending burden, and dashboard interpretation, `dsrLtv` is the more relevant existing tool id.
- No new tool id was introduced.

## Repetition Check

Targeted AI-like/generic expressions after polish:

| Phrase | Count across target 5 |
|---|---:|
| `이 글을 다 읽고 나면` | 0 |
| `여기까지 한 줄 결론` | 0 |
| `범위/한계` | 0 |
| `오해 교정` | 0 |
| `체크리스트` | 0 |
| `이 글에서는` | 0 |
| `핵심은` | 0 |
| `중요합니다` | 0 |
| `도움이 됩니다` | 0 |
| `확인할 수 있습니다` | 0 |
| `볼 수 있습니다` | 0 |
| `정리하면` | 0 |
| `본인의 상황에 맞게` | 0 |
| `투자자는 신중하게` | 0 |

Remaining allowed context-specific term:

- `루틴`: 3 occurrences in `simple-vs-compound.md`, all tied to `재투자 루틴` behavior and not used as a repeated template section label.

## Validation Results

### `npm.cmd run build`

Result: PASS

Notes:

- Build completed successfully.
- `postbuild` regenerated sitemap files as expected.
- Generated sitemap/report changes were restored afterward because this task excludes sitemap output changes from commit scope.

### `node scripts\verify_seo_channel_split.js --local-server`

Result: PASS

Key output:

- `sitemap-0.xml` URL count: 199
- `sitemap-ko.xml` URL count: 101
- `sitemap-en.xml` URL count: 98
- `en/sitemap.xml` URL count: 98
- Forbidden sitemap loc patterns: PASS
- EN prefix sitemap locs: PASS
- Required EN static URLs: 16/16

### `node scripts\verify_post_publish_urls.js --local-server ...`

Result: PASS for all 5 target KO URLs.

- HTTP 200
- Canonical self: yes
- Robots blocked: no
- Meta noindex: no
- Sitemap: `main:yes`, `ko:yes`
- RSS: yes
- hreflang pair: yes

### FAQ/JSON-LD Parse Check

Result: PASS

- All 5 files have valid manual JSON-LD.
- Visible FAQ question count and FAQPage JSON-LD question count match in all 5 files.

### `git diff --check`

Result: PASS

Notes:

- No whitespace errors.
- CRLF normalization warnings only.
