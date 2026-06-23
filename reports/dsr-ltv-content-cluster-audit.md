# DSR/LTV Content Cluster Audit

Checked at: 2026-06-23

## Summary

DSR/LTV 계산기 유입을 목표로 KO-only 신규 콘텐츠 5개를 추가했다. 새 글은 모두 `/posts/personalFinance/...` 경로를 사용하며, EN 대응 글은 생성하지 않았다.

이번 작업에서는 콘텐츠 Markdown만 추가했고 canonical, hreflang, robots, sitemap 생성 정책, SeoHead, 라우팅 파일은 수정하지 않았다.

## Created Posts

| Topic | File | URL | Status |
| --- | --- | --- | --- |
| 연봉 4000만원 주담대 가능액 계산 | `content/posts/personalFinance/ko/salary-40m-mortgage-limit.md` | `/posts/personalFinance/salary-40m-mortgage-limit` | created |
| 연봉 5000만원 DSR 40% 대출 가능액 | `content/posts/personalFinance/ko/salary-50m-dsr-40-loan-limit.md` | `/posts/personalFinance/salary-50m-dsr-40-loan-limit` | created |
| 생애최초 주택 구입 예산 계산 | `content/posts/personalFinance/ko/first-home-buyer-budget-calculation.md` | `/posts/personalFinance/first-home-buyer-budget-calculation` | created |
| 전세에서 매매로 갈아탈 때 필요한 현금 | `content/posts/personalFinance/ko/jeonse-to-home-purchase-cash-needed.md` | `/posts/personalFinance/jeonse-to-home-purchase-cash-needed` | created |
| 아파트 매수 전 계산해야 할 비용 5가지 | `content/posts/personalFinance/ko/apartment-buying-costs-before-purchase.md` | `/posts/personalFinance/apartment-buying-costs-before-purchase` | created |

## Content Requirements Check

| URL | KO only | Quick Answer | Table | DSR/LTV calculator link | Related links | FAQ 5 | FAQPage JSON-LD |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/posts/personalFinance/salary-40m-mortgage-limit` | yes | yes | yes | yes | yes | yes | pass |
| `/posts/personalFinance/salary-50m-dsr-40-loan-limit` | yes | yes | yes | yes | yes | yes | pass |
| `/posts/personalFinance/first-home-buyer-budget-calculation` | yes | yes | yes | yes | yes | yes | pass |
| `/posts/personalFinance/jeonse-to-home-purchase-cash-needed` | yes | yes | yes | yes | yes | yes | pass |
| `/posts/personalFinance/apartment-buying-costs-before-purchase` | yes | yes | yes | yes | yes | yes | pass |

## SEO/Policy Scope

- `lang: "ko"` only.
- `tool: ["dsr-ltv"]` applied to the new posts.
- Required internal calculator link: `/tools/dsr-ltv-calculator`.
- Related links use existing KO routes and tools.
- No EN files were created.
- No canonical, hreflang, robots, sitemap generation, routing, or SeoHead policy files were changed.
- No bank-specific recommendation or financial product recommendation was added.
- Loan and housing numbers are framed as educational estimates, not approvals or guarantees.

## Validation

### FAQ/JSON-LD

Manual check confirmed that all 5 posts include 5 visible FAQ questions and matching FAQPage JSON-LD question names.

```text
PASS salary-40m-mortgage-limit faq=5 tool=["dsr-ltv"] lang=ko
PASS salary-50m-dsr-40-loan-limit faq=5 tool=["dsr-ltv"] lang=ko
PASS first-home-buyer-budget-calculation faq=5 tool=["dsr-ltv"] lang=ko
PASS jeonse-to-home-purchase-cash-needed faq=5 tool=["dsr-ltv"] lang=ko
PASS apartment-buying-costs-before-purchase faq=5 tool=["dsr-ltv"] lang=ko
```

### Build

`npm.cmd run build` completed successfully.

Relevant output:

```text
Static pages: 214
[channel-sitemap] sitemap-ko.xml: 106 URLs
[channel-sitemap] sitemap-en.xml: 98 URLs
[channel-sitemap] en\sitemap.xml: 98 URLs
```

The generated sitemap files were restored after validation to avoid committing build/postbuild artifacts.

### Post URL Verification

`node scripts\verify_post_publish_urls.js --local-server` passed for all 5 new KO URLs.

Each checked URL returned:

```text
HTTP 200
canonical self: yes
robots blocked: no
meta noindex: no
sitemap main: yes
sitemap ko: yes
RSS: yes
hreflang pair: yes
PASS
```

### Channel Split Verification

`node scripts\verify_seo_channel_split.js --local-server` passed.

Relevant output:

```text
sitemap-0.xml URL count: 204
sitemap-ko.xml URL count: 106
sitemap-en.xml URL count: 98
en/sitemap.xml URL count: 98
required EN static URLs: 16/16
failures: 0
```

### Link Check

`node scripts\check_posts_links_local.js --registry=docs\blog-contents.md --dir=content/posts --ext=md,mdx --out=reports/posts.linkcheck.json` completed with exit code 0, but reported pre-existing repository issues:

```text
Files total: 147
Published checked: 109
Broken: 5
Suspicious: 13
Self URL missing in registry: 21
```

The broken examples were in existing posts, not in the 5 new DSR/LTV cluster posts. The new posts are not yet listed in `docs/blog-contents.md`; this can be handled separately if the registry is meant to be exhaustive.

## Remaining Notes

- The 5 new posts reuse the existing DSR/LTV visual asset path in frontmatter. A later image pass can create dedicated thumbnails if needed.
- Because the posts are KO-only, no EN sitemap membership was added.
- Search Console/Naver submission should use the generated KO sitemap/RSS after the next normal build/deploy cycle.
