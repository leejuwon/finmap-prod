# Naver Compound Cluster Collection Readiness

Date: 2026-07-09

## Summary

- Manual collection URL list: created
- Naver search check query sheet: created
- Build: PASS, 215/215 pages
- SEO channel split: PASS
- Target URL readiness: PASS
- RSS readiness: PASS for `/rss.xml`
- Robots readiness: PASS, `sitemap-ko.xml` is declared directly
- Final decision: `PASS - 네이버 복리 클러스터 수집 요청 준비 완료`

This task did not modify calculator code, post body copy, internal-link anchors, RSS generation policy, sitemap generation policy, canonical, hreflang, or package files.

Changed scope:

- `public/robots.txt`: added direct KO sitemap declaration
- `reports/naver-compound-cluster-collection-readiness.md`: updated readiness decision from HOLD to PASS

## Naver SERP Exposure Check

The working assumption from the request is that `site:finmaphub.com 복리` exposes the compound calculator page more strongly than related posts.

For this run, live Naver SERP scraping was not used as the source of truth. Instead, a manual monitoring query sheet was created so the same queries can be checked consistently in Naver after manual collection requests.

Created query sheet:

- `reports/naver-search-check-queries-compound-cluster.md`

Important monitoring note:

- Path-level queries such as `site:finmaphub.com/posts ...` can be unstable in Naver and should not be used as the primary monitoring baseline.
- Prefer host-level `site:finmaphub.com ...` and brand/query combinations such as `복리 계산기 finmap`.

## Manual Collection URL List

Created file:

- `reports/naver-manual-collection-url-list-compound-cluster.txt`

URLs:

```text
https://www.finmaphub.com/posts/personalFinance/compound-calculator-guide
https://www.finmaphub.com/posts/personalFinance/simple-vs-compound
https://www.finmaphub.com/posts/personalFinance/annual-vs-monthly-compound
https://www.finmaphub.com/posts/personalFinance/monthly-dca-10-year-result
https://www.finmaphub.com/posts/personalFinance/how-much-per-month-for-100m
https://www.finmaphub.com/posts/personalFinance/goal-amount-fast-strategy
https://www.finmaphub.com/posts/personalFinance/personal-start-5steps
https://www.finmaphub.com/posts/personalFinance/personal-finance-3pillars
https://www.finmaphub.com/posts/personalFinance/high-rate-debt-vs-invest-threshold-rule
https://www.finmaphub.com/tools/compound-interest
```

## RSS Check

Checked against local production server after `npm.cmd run build`.

| Feed path | HTTP | Item count | Notes |
| --- | ---: | ---: | --- |
| `/rss.xml` | 200 | 50 | PASS |
| `/rss-ko.xml` | 404 | 0 | Not currently provided |
| `/feed.xml` | 404 | 0 | Not currently provided |

Target RSS item membership in `/rss.xml`:

| URL | Included | Canonical link match | pubDate | Description |
| --- | --- | --- | --- | --- |
| `https://www.finmaphub.com/posts/personalFinance/compound-calculator-guide` | yes | yes | Wed, 08 Jul 2026 00:00:00 GMT | present |
| `https://www.finmaphub.com/posts/personalFinance/simple-vs-compound` | yes | yes | Sat, 15 Nov 2025 00:00:00 GMT | present |
| `https://www.finmaphub.com/posts/personalFinance/annual-vs-monthly-compound` | yes | yes | Sun, 23 Nov 2025 00:00:00 GMT | present |
| `https://www.finmaphub.com/posts/personalFinance/monthly-dca-10-year-result` | yes | yes | Thu, 21 May 2026 00:00:00 GMT | present |

RSS implementation notes:

- Route: `pages/rss.xml.js`
- Current feed is KO-only by implementation.
- Item limit is 50.
- `compound-calculator-guide` is included as a recent KO item.
- The bridge cluster posts checked above are present in `/rss.xml`.
- RSS remains `/rss.xml`; this task did not add a `/rss-ko.xml` alias.
- No RSS generation policy was changed in this task.

## Robots.txt Check

Checked file:

- `public/robots.txt`

Before:

```text
# Sitemaps
Sitemap: https://www.finmaphub.com/sitemap.xml
```

After:

```text
# Sitemaps
Sitemap: https://www.finmaphub.com/sitemap.xml
Sitemap: https://www.finmaphub.com/sitemap-ko.xml
```

Existing crawl policy was preserved:

```text
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /cdn-cgi/
```

Result:

| Check | Result |
| --- | --- |
| `User-agent: *` | PASS |
| `Allow: /` | PASS |
| Existing `Disallow` policy | PASS |
| `Sitemap: https://www.finmaphub.com/sitemap.xml` | PASS |
| `Sitemap: https://www.finmaphub.com/sitemap-ko.xml` | PASS |

Finding:

- `sitemap-ko.xml` exists, is generated, and is now directly declared in `robots.txt`.
- RSS still works through `/rss.xml` as the KO feed.
- This task did not add a `/rss-ko.xml` alias.

## URL Readiness

Checked against local production server after build.

| URL | HTTP | Canonical self | Robots blocked | Meta noindex | Sitemap | RSS | hreflang pair | Result |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| `https://www.finmaphub.com/posts/personalFinance/compound-calculator-guide` | 200 | yes | no | no | main:yes, ko:yes | yes | self-only | PASS |
| `https://www.finmaphub.com/posts/personalFinance/simple-vs-compound` | 200 | yes | no | no | main:yes, ko:yes | yes | yes | PASS |
| `https://www.finmaphub.com/posts/personalFinance/annual-vs-monthly-compound` | 200 | yes | no | no | main:yes, ko:yes | yes | yes | PASS |
| `https://www.finmaphub.com/posts/personalFinance/monthly-dca-10-year-result` | 200 | yes | no | no | main:yes, ko:yes | yes | yes | PASS |
| `https://www.finmaphub.com/tools/compound-interest` | 200 | yes | no | no | main:yes, ko:yes | no | yes | PASS |

## SEO Channel Split

Command:

```bash
node scripts\verify_seo_channel_split.js --local-server
```

Result: PASS

Sitemap counts:

| Sitemap | URL count |
| --- | ---: |
| `sitemap-0.xml` | 205 |
| `sitemap-ko.xml` | 107 |
| `sitemap-en.xml` | 98 |
| `public/en/sitemap.xml` | 98 |

Additional checks:

- Forbidden sitemap loc patterns: PASS, 0
- `/en/sitemap.xml` EN-only locs: PASS
- `/en/sitemap.xml` matches `sitemap-en.xml`: PASS

## Naver Search Queries

Created file:

- `reports/naver-search-check-queries-compound-cluster.md`

Queries included:

```text
site:finmaphub.com 복리
site:finmaphub.com "복리 계산기"
site:finmaphub.com "복리 계산기 사용법"
site:finmaphub.com "단리 vs 복리"
site:finmaphub.com "연복리 vs 월복리"
site:finmaphub.com "월 50만원 적립식 투자"
site:finmaphub.com "목표 금액을 빠르게 모으는 법"
복리 finmap
복리 계산기 finmap
복리 계산기 사용법 finmap
월복리 finmap
적립식 복리 finmap
단리 복리 finmap
```

## Validation Commands

```bash
npm.cmd run build
node scripts\verify_seo_channel_split.js --local-server
node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/posts/personalFinance/compound-calculator-guide https://www.finmaphub.com/posts/personalFinance/simple-vs-compound https://www.finmaphub.com/posts/personalFinance/annual-vs-monthly-compound https://www.finmaphub.com/posts/personalFinance/monthly-dca-10-year-result https://www.finmaphub.com/tools/compound-interest
git diff --check
```

Results:

| Command | Result |
| --- | --- |
| `npm.cmd run build` | PASS, 215/215 pages |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `node scripts\verify_post_publish_urls.js --local-server ...` | PASS |
| `public/robots.txt` content check | PASS, main and KO sitemap declarations present |
| `git diff --check` | PASS |

## Remaining Notes

- `/rss.xml` remains the KO feed path.
- `/rss-ko.xml` alias was not added in this task.
- EN sitemap was not added to `robots.txt` in this task.
- URL list and query sheet contents were not changed.
- After manual collection submission, monitor Naver for 1-2 weeks using the generated query sheet.

## Final Decision

`PASS - 네이버 복리 클러스터 수집 요청 준비 완료`

Reason:

- Target URLs are 200, indexable, self-canonical, in sitemap, and the key KO posts are present in `/rss.xml`.
- RSS is sufficient through `/rss.xml`.
- `robots.txt` now directly declares both `https://www.finmaphub.com/sitemap.xml` and `https://www.finmaphub.com/sitemap-ko.xml`.
