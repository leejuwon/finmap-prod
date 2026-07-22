# FinMap 검색 성장 90일 P0-2B 내부 링크 정합성 개선

- 기준일: 2026-07-22
- 작업 모드: broken/suspicious 내부 링크 정합성 최소 수정
- 제외 범위: 포스트 제목, description, H1, 본문 대규모 재작성, slug, redirect, canonical, hreflang, robots, sitemap 정책, 계산 로직, GA4, 광고 구조

## 1. Summary

P0-1/P0-2A에서 남은 내부 링크 검사 결과를 실제 파일, route, sitemap 기준으로 재검증하고 정리했다.

처리 결과:

- broken before: 8
- broken fixed: 8
- broken remaining: 0
- suspicious before: 13
- suspicious corrected: 13
- suspicious intentionally retained: 0
- false positive: 0
- self URL missing before: 24
- self URL added: 24
- self URL missing remaining: 0
- `npm.cmd run check:posts-links`: 단독 실행 PASS

핵심 판정:

- broken 8개는 실제 target 파일/route가 없는 문제가 아니라 `docs/blog-contents.md` registry 누락이었다.
- suspicious 13개는 EN 포스트에서 KO 도구 URL(`/tools/...`)을 가리키는 locale prefix 문제였다.
- registry self URL missing 24개는 모두 실제 Markdown 파일이 있고 sitemap에도 포함된 published URL이었다.

## 2. Link Fixes

| # | Source | Locale | Anchor | Before href | Issue | Resolution | After href | HTTP | Canonical | Result |
| -: | --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| 1 | `content/posts/personalFinance/en/annual-vs-monthly-compound.md` | en | existing link | `/en/posts/personalFinance/compound-return-3-5-7-10-table` | REGISTRY_ONLY_MISMATCH | target file/sitemap exists; add registry URL | same | 200 | self | PASS |
| 2 | `content/posts/personalFinance/en/how-much-per-month-for-100m.md` | en | existing link | `/en/posts/personalFinance/monthly-investment-for-100m-table` | REGISTRY_ONLY_MISMATCH | target file/sitemap exists; add registry URL | same | 200 | self | PASS |
| 3 | `content/posts/personalFinance/en/personal-start-5steps.md` | en | existing link | `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | REGISTRY_ONLY_MISMATCH | target file/sitemap exists; add registry URL | same | 200 | self | PASS |
| 4 | `content/posts/personalFinance/ko/how-much-per-month-for-100m.md` | ko | existing link | `/posts/personalFinance/monthly-investment-for-100m-table` | REGISTRY_ONLY_MISMATCH | target file/sitemap exists; add registry URL | same | 200 | self | PASS |
| 5 | `content/posts/personalFinance/ko/how-much-per-month-for-100m.md` | ko | existing link | `/posts/personalFinance/how-much-monthly-invest-for-100m` | REGISTRY_ONLY_MISMATCH | target file/sitemap exists; add registry URL | same | 200 | self | PASS |
| 6 | `content/posts/personalFinance/ko/how-much-per-month-for-100m.md` | ko | existing link | `/posts/personalFinance/compound-calculator-guide` | REGISTRY_ONLY_MISMATCH | target file/sitemap exists; add registry URL | same | 200 | self | PASS |
| 7 | `content/posts/personalFinance/ko/monthly-dca-10-year-result.md` | ko | existing link | `/posts/personalFinance/compound-calculator-guide` | REGISTRY_ONLY_MISMATCH | target file/sitemap exists; add registry URL | same | 200 | self | PASS |
| 8 | `content/posts/personalFinance/ko/personal-start-5steps.md` | ko | existing link | `/posts/personalFinance/compound-calculator-guide` | REGISTRY_ONLY_MISMATCH | target file/sitemap exists; add registry URL | same | 200 | self | PASS |
| 9 | `content/posts/economicInfo/en/gold-geopolitics-real-rates-dollar-uncertainty.md` | en | Open CAGR calculator | `/tools/cagr-calculator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/cagr-calculator` | 200 | self | PASS |
| 10 | `content/posts/economicInfo/en/hormuz-risk-oil-insurance-freight-premium.md` | en | Open DCA calculator | `/tools/dca-calculator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/dca-calculator` | 200 | self | PASS |
| 11 | `content/posts/economicInfo/en/oil-shock-to-usdkrw-korea-transmission.md` | en | Open DCA calculator | `/tools/dca-calculator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/dca-calculator` | 200 | self | PASS |
| 12 | `content/posts/economicInfo/en/war-theme-investing-price-chain-not-winners.md` | en | Open CAGR calculator | `/tools/cagr-calculator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/cagr-calculator` | 200 | self | PASS |
| 13 | `content/posts/investingInfo/en/modern-6040-risk-budget.md` | en | Open goal simulator | `/tools/goal-simulator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/goal-simulator` | 200 | self | PASS |
| 14 | `content/posts/investingInfo/en/modern-6040-risk-budget.md` | en | Open DCA calculator | `/tools/dca-calculator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/dca-calculator` | 200 | self | PASS |
| 15 | `content/posts/investingInfo/en/modern-6040-risk-budget.md` | en | Open CAGR calculator | `/tools/cagr-calculator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/cagr-calculator` | 200 | self | PASS |
| 16 | `content/posts/investingInfo/en/rates-discount-mortgage-demand-apt-prices.md` | en | Open CAGR calculator | `/tools/cagr-calculator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/cagr-calculator` | 200 | self | PASS |
| 17 | `content/posts/investingInfo/en/rates-discount-mortgage-demand-apt-prices.md` | en | Open goal simulator | `/tools/goal-simulator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/goal-simulator` | 200 | self | PASS |
| 18 | `content/posts/personalFinance/en/apt-dashboard-home-goal-roadmap.md` | en | Open goal simulator | `/tools/goal-simulator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/goal-simulator` | 200 | self | PASS |
| 19 | `content/posts/personalFinance/en/apt-dashboard-home-goal-roadmap.md` | en | Open CAGR calculator | `/tools/cagr-calculator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/cagr-calculator` | 200 | self | PASS |
| 20 | `content/posts/personalFinance/en/simple-vs-compound.md` | en | Open compound interest calculator | `/tools/compound-interest` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/compound-interest` | 200 | self | PASS |
| 21 | `content/posts/personalFinance/en/simple-vs-compound.md` | en | Open CAGR calculator | `/tools/cagr-calculator` | MISSING_LOCALE_PREFIX | use EN canonical tool route | `/en/tools/cagr-calculator` | 200 | self | PASS |

## 3. Registry and Checker

### `docs/blog-contents.md`

Added 24 published self URLs confirmed by local file existence and sitemap membership.

KO additions:

- `/posts/personalFinance/apartment-buying-calculator-guide`
- `/posts/personalFinance/apartment-buying-costs-before-purchase`
- `/posts/personalFinance/apartment-transaction-volume-decline-meaning`
- `/posts/personalFinance/compound-calculator-guide`
- `/posts/personalFinance/compound-return-3-5-7-10-table`
- `/posts/personalFinance/dca-vs-lump-sum-when-results-differ`
- `/posts/personalFinance/first-home-buyer-budget-calculation`
- `/posts/personalFinance/how-much-monthly-invest-for-100m`
- `/posts/personalFinance/how-to-read-apartment-transaction-prices`
- `/posts/personalFinance/is-dca-better-in-bear-market`
- `/posts/personalFinance/jeonse-to-home-purchase-cash-needed`
- `/posts/personalFinance/large-apartment-complex-households-price-stability`
- `/posts/personalFinance/ltv-dsr-calculator-guide`
- `/posts/personalFinance/monthly-investment-for-100m-table`
- `/posts/personalFinance/salary-40m-mortgage-limit`
- `/posts/personalFinance/salary-50m-dsr-40-loan-limit`

EN additions:

- `/en/posts/personalFinance/apartment-transaction-volume-decline-meaning`
- `/en/posts/personalFinance/compound-return-3-5-7-10-table`
- `/en/posts/personalFinance/dca-vs-lump-sum-when-results-differ`
- `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio`
- `/en/posts/personalFinance/how-to-read-apartment-transaction-prices`
- `/en/posts/personalFinance/is-dca-better-in-a-bear-market`
- `/en/posts/personalFinance/large-apartment-complex-households-price-stability`
- `/en/posts/personalFinance/monthly-investment-for-100m-table`

### `package.json`

Changed `check:posts-links` to use the actual registry:

```json
"check:posts-links": "node scripts/check_posts_links_local.js --registry=docs/blog-contents.md --dir=content/posts --ext=md,mdx --out=reports/posts.linkcheck.json"
```

No root-level duplicate `blog-contents.md` was created.

### `scripts/check_posts_links_local.js`

Updated usage comments and error message to point to `docs/blog-contents.md`. Checker behavior was not loosened and no allowlist was added to suppress broken links.

## 4. Verification Script

Added:

- `scripts/verify_internal_link_integrity.js`
- `reports/search-growth-90d-p0-2b-internal-link-targets.json`

The script reads the current linkcheck report and the P0-2B target manifest, then verifies:

- broken count 0
- suspicious count 0
- self URL missing count 0
- target HTTP 200
- self canonical
- noindex absent
- sitemap membership
- H1 present

Output:

- `reports/search-growth-90d-p0-2b-internal-link-http-check.json`

Result:

- report checks: PASS
- target URLs checked: 28
- target pass: 28
- target fail: 0

## 5. Files Changed

Link href fixes:

- `content/posts/economicInfo/en/gold-geopolitics-real-rates-dollar-uncertainty.md`
- `content/posts/economicInfo/en/hormuz-risk-oil-insurance-freight-premium.md`
- `content/posts/economicInfo/en/oil-shock-to-usdkrw-korea-transmission.md`
- `content/posts/economicInfo/en/war-theme-investing-price-chain-not-winners.md`
- `content/posts/investingInfo/en/modern-6040-risk-budget.md`
- `content/posts/investingInfo/en/rates-discount-mortgage-demand-apt-prices.md`
- `content/posts/personalFinance/en/apt-dashboard-home-goal-roadmap.md`
- `content/posts/personalFinance/en/simple-vs-compound.md`

Registry/checker:

- `docs/blog-contents.md`
- `package.json`
- `scripts/check_posts_links_local.js`

New verification/report files:

- `scripts/verify_internal_link_integrity.js`
- `reports/search-growth-90d-p0-2b-internal-link-targets.json`
- `reports/search-growth-90d-p0-2b-internal-link-http-check.json`
- `reports/search-growth-90d-p0-2b-internal-link-integrity.md`

Updated by verification:

- `reports/posts.linkcheck.json`
- `reports/seo-channel-split-url-check.md`
- `reports/search-growth-90d-audit-data.json`
- `reports/search-growth-90d-url-inventory.csv`
- `reports/search-growth-90d-p0-2a-snippet-hygiene-rendered.json`

## 6. Verification

| Command | Result | Notes |
| --- | --- | --- |
| `node --check scripts\check_posts_links_local.js` | PASS | checker syntax |
| `node --check scripts\verify_internal_link_integrity.js` | PASS | new verifier syntax |
| `npm.cmd run check:posts-links` | PASS | broken 0, suspicious 0, self missing 0 |
| `npm.cmd run build` | PASS | Next.js build and sitemap postbuild passed |
| `node scripts\verify_internal_link_integrity.js --base-url=http://127.0.0.1:8002` | PASS | 28 target URLs HTTP/canonical/sitemap/H1 passed |
| `node scripts\verify_search_snippet_hygiene.js --base-url=http://127.0.0.1:8002` | PASS | P0-2A snippet hygiene still passes |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS | SEO channel split still passes |
| `node scripts\audit_search_growth_baseline.js` | PASS | baseline inventory regenerated |
| `git diff --check` | PASS | no whitespace errors; CRLF normalization warnings only |
| `git status --short --untracked-files=all` | PASS | reviewed working tree; P0-1/P0-2A files remain in same workspace |

Final workspace status:

- Modified tracked files reviewed: 15
- Untracked P0 report/script artifacts reviewed: 11
- No destructive git command was run.

## 7. No Functional Changes

The following were not changed:

- calculator logic
- calculator results
- GA4 events or params
- ad slot structure
- canonical policy
- hreflang policy
- sitemap generation policy
- robots policy
- P0-2A `data-nosnippet` behavior
- post title/description/H1
- slugs or redirects

## 8. Remaining Findings

- No broken or suspicious internal links remain in `reports/posts.linkcheck.json`.
- No self URL missing items remain after registry additions.
- Browser console warnings from P0-2A local API/external resource checks remain unrelated to this link-integrity scope.

## 9. Recommended Next Step

P1-1 should focus on high-priority URL metadata and first-paragraph quality, not additional link-integrity cleanup.
