# Finmap AI-like Prose Rewrite - KO Batch 1

Date: 2026-06-19

## Scope

Modified KO content files:

1. `content/posts/personalFinance/ko/how-much-monthly-invest-for-100m.md`
2. `content/posts/personalFinance/ko/simple-vs-compound.md`
3. `content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md`
4. `content/posts/personalFinance/ko/is-dca-better-in-bear-market.md`
5. `content/posts/economicInfo/ko/geopolitics-to-usd-liquidity-fx.md`

Non-goals:

- No slug, category, lang, canonical, hreflang, robots, routing, or sitemap policy change.
- No new article creation.
- No EN content edit.

## File-by-file Changes

| File | Main rewrite | Concrete action sentence added |
|---|---|---|
| `how-much-monthly-invest-for-100m.md` | Replaced generic intro and passive calculator CTA with a direct 1억원/monthly contribution answer. | Enter `100,000,000` as target amount, compare 10/15/20-year periods, then read 세후 자산, 부족액, 목표 달성률. |
| `simple-vs-compound.md` | Reduced repeated "핵심은/중요합니다" style transitions and shifted explanation to numeric duration, reinvestment, and interruption rules. | Put 원금, 월 납입액, 기간, 세후 수익률 into the compound calculator and compare 10-year vs 20-year outcomes. |
| `geopolitics-oil-fx-dashboard.md` | Replaced generic "도움이 됩니다/핵심은" wording with event-to-dashboard observation order. | Check 거래량, 중위값, 가격 분포, and 대출 부담 in that order after geopolitics/oil/FX news. |
| `is-dca-better-in-bear-market.md` | Reframed "DCA is good in a bear market" as scenario-specific comparison. | Compare 기본 모델, 초반 하락, 중간 하락, 마지막 해 하락 by 최종 세후 자산, 목표 달성률, 부족액, and MDD. |
| `geopolitics-to-usd-liquidity-fx.md` | Reduced repeated "핵심은/도움이 됩니다" conclusions and recast the article as a market-reading rule. | After war/geopolitical news, identify whether 환율, 금리, 변동성, or 수급 moved first before choosing the liquidity/fundamental frame. |

## Reduced Repetitive Phrases

The following targeted phrases no longer appear in the 5 modified files after the rewrite check:

- `이 글에서는`
- `핵심은`
- `중요합니다`
- `도움이 됩니다`
- `확인할 수 있습니다`
- `볼 수 있습니다`
- `정리하면`
- `본인의 상황에 맞게`
- `투자자는 신중하게`

## SEO Elements Kept

- Slugs unchanged.
- `category`, `postCategory`, `lang`, `link`, and internal route structure unchanged.
- Titles and SEO titles were not changed.
- Descriptions and SEO descriptions were not changed.
- Existing internal links were preserved.
- `dateModified` was updated to `2026-06-19` in frontmatter and matching manual Article JSON-LD blocks.

## FAQ and JSON-LD Check

Source markdown checks:

| File | Visible FAQ count | FAQPage JSON-LD question count | Question match | JSON-LD parse |
|---|---:|---:|---|---|
| `how-much-monthly-invest-for-100m.md` | 5 | 5 | PASS | PASS |
| `simple-vs-compound.md` | 8 | 8 | PASS | PASS |
| `geopolitics-oil-fx-dashboard.md` | 8 | 8 | PASS | PASS |
| `is-dca-better-in-bear-market.md` | 5 | 5 | PASS | PASS |
| `geopolitics-to-usd-liquidity-fx.md` | 8 | 8 | PASS | PASS |

Built HTML structured data check:

- Each target page outputs 4 JSON-LD blocks:
  - `BlogPosting`
  - `BreadcrumbList`
  - manual `Article`
  - manual `FAQPage`
- The manual `Article` blocks were retained because this batch focused on prose and did not change the project's structured-data policy.
- `geopolitics-oil-fx-dashboard.md` had its manual Article JSON-LD syntax/date/`mainEntityOfPage` aligned during the edit so the JSON-LD parses correctly.

## Validation

### `npm.cmd run build`

Result: PASS

Notes:

- Next.js build completed successfully.
- `postbuild` regenerated sitemap files as part of the normal project build.
- Because this task explicitly said not to modify sitemap files, generated sitemap/report changes were restored after validation.

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

| URL | HTTP | Canonical self | Robots blocked | Meta noindex | Sitemap | RSS | hreflang pair |
|---|---:|---|---|---|---|---|---|
| `/posts/personalFinance/how-much-monthly-invest-for-100m` | 200 | yes | no | no | main:yes, ko:yes | yes | yes |
| `/posts/personalFinance/simple-vs-compound` | 200 | yes | no | no | main:yes, ko:yes | yes | yes |
| `/posts/economicInfo/geopolitics-oil-fx-dashboard` | 200 | yes | no | no | main:yes, ko:yes | yes | yes |
| `/posts/personalFinance/is-dca-better-in-bear-market` | 200 | yes | no | no | main:yes, ko:yes | yes | yes |
| `/posts/economicInfo/geopolitics-to-usd-liquidity-fx` | 200 | yes | no | no | main:yes, ko:yes | yes | yes |

### `git diff --check`

Result: PASS

Notes:

- No whitespace errors.
- Git reported CRLF normalization warnings only.

## Remaining Notes

- The existing pattern of template-level `BlogPosting` plus manual `Article` remains. This report records it but does not change it because the current task was prose-focused.
- Search snippets and Naver behavior should be judged after recrawl, not immediately after this rewrite.
