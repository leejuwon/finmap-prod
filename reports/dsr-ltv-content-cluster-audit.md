# DSR/LTV Content Cluster Audit

Date: 2026-06-02

## Scope

DSR/LTV calculator improvement 후 검색 유입 글에서 계산기 실행, 안전 탐색 가격대 확인, 부동산 대시보드 실거래 확인으로 이어지는 콘텐츠 클러스터를 작성/보강했다.

## Created Or Updated Files

### Updated Posts

| Lang | File | Slug | Target keyword |
| --- | --- | --- | --- |
| KO | `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md` | `/posts/personalFinance/dsr-40-income-loan-limit-table` | DSR 계산기, 주담대 한도, 대출 가능액 |
| EN | `content/posts/personalFinance/en/dsr-40-income-loan-limit-table.md` | `/en/posts/personalFinance/dsr-40-income-loan-limit-table` | Korea DSR calculator, mortgage capacity by income |
| KO | `content/posts/personalFinance/ko/interest-rate-1p-loan-limit-impact.md` | `/posts/personalFinance/interest-rate-1p-loan-limit-impact` | 금리 1%p, 주담대 한도, DSR/LTV 계산기 |
| EN | `content/posts/personalFinance/en/interest-rate-1p-loan-limit-impact.md` | `/en/posts/personalFinance/interest-rate-1p-loan-limit-impact` | Korea mortgage rate sensitivity, 1pp rate impact |
| KO | `content/posts/personalFinance/ko/mortgage-risk-checklist-dsr-variable.md` | `/posts/personalFinance/mortgage-risk-checklist-dsr-variable` | 주택대출 리스크, DSR LTV, 비상금 |
| EN | `content/posts/personalFinance/en/mortgage-risk-checklist-dsr-variable.md` | `/en/posts/personalFinance/mortgage-risk-checklist-dsr-variable` | Korean mortgage risk checklist, DSR LTV |

### New Posts

| Lang | File | Slug | Target keyword |
| --- | --- | --- | --- |
| KO | `content/posts/personalFinance/ko/cash-100m-200m-300m-apartment-budget.md` | `/posts/personalFinance/cash-100m-200m-300m-apartment-budget` | 보유현금 1억 2억 3억, 아파트 구매 가능 금액 |
| EN | `content/posts/personalFinance/en/cash-100m-200m-300m-apartment-budget.md` | `/en/posts/personalFinance/cash-100m-200m-300m-apartment-budget` | KRW cash apartment budget, Korea housing affordability |
| KO | `content/posts/personalFinance/ko/dsr-pass-ltv-cash-bottleneck.md` | `/posts/personalFinance/dsr-pass-ltv-cash-bottleneck` | DSR 통과, LTV 현금 병목, 부대비용 |
| EN | `content/posts/personalFinance/en/dsr-pass-ltv-cash-bottleneck.md` | `/en/posts/personalFinance/dsr-pass-ltv-cash-bottleneck` | DSR pass LTV cash bottleneck, Korea mortgage check |

### Supporting Updates

| File | Reason |
| --- | --- |
| `docs/blog-contents.md` | 링크 체크 레지스트리에 DSR/LTV 클러스터 URL을 등록하고 mortgage checklist 설명을 최신화했다. |
| `scripts/check_posts_links_local.js` | 실제 도구 라우트인 `dsr-ltv-calculator`를 허용 목록에 추가했다. |
| `reports/posts.linkcheck.json` | 레지스트리 기반 링크 체크 결과를 갱신했다. |
| `public/sitemap-0.xml` | `npm.cmd run build` 후 `postbuild`로 재생성되었다. 신규 4개 URL과 보강 6개 URL의 lastmod 반영이 포함된다. 일반 정적 페이지 lastmod timestamp 변경도 함께 섞여 있다. |

## Content Coverage

| Topic | KO/EN | Main additions | Calculator links | Dashboard links | JSON-LD |
| --- | --- | --- | ---: | ---: | --- |
| DSR 40% income table | Yes | DSR 개념, 연소득별 상환 가능액, 기존부채 영향, 후보 집값 예시 | KO 4 / EN 4 | KO 5 / EN 5 | Article + FAQPage |
| Rate +1pp impact | Yes | 금리 3-6% 민감도, +1%p/+2%p 한도 감소, 후보 가격 판정 | KO 3 / EN 3 | KO 4 / EN 4 | Article + FAQPage |
| Cash KRW 100M/200M/300M | Yes | 보유현금별 구매 가능 가격, 안전 탐색 가격대, 6억원 후보 판정 | KO 3 / EN 4 | KO 5 / EN 5 | Article + FAQPage |
| DSR pass but LTV/cash bottleneck | Yes | DSR/LTV/현금 병목 차이, 후보 판정 조건, 샘플 A-D 해석 | KO 3 / EN 3 | KO 4 / EN 5 | Article + FAQPage |
| Mortgage risk checklist | Yes | DSR/LTV/금리/기존부채/비상금 체크리스트, 실행 루틴 | KO 4 / EN 4 | KO 5 / EN 5 | Article + FAQPage |

All posts include:

- 정책 자동 반영 없음
- 사용자가 입력한 DSR/LTV 기준
- 원리금균등 상환 기준
- 실제 금융기관 심사와 다를 수 있음
- 안전 탐색 가격대는 구매 가능 가격 상한의 80-90% 구간
- DSR/LTV 계산기와 부동산 대시보드 CTA

## Internal Links

Validated target links:

- `/tools/dsr-ltv-calculator`, `/en/tools/dsr-ltv-calculator`
- `/market/real-estate`, `/en/market/real-estate`
- `/posts/personalFinance/dsr-40-income-loan-limit-table`
- `/posts/personalFinance/interest-rate-1p-loan-limit-impact`
- `/posts/personalFinance/cash-100m-200m-300m-apartment-budget`
- `/posts/personalFinance/dsr-pass-ltv-cash-bottleneck`
- `/posts/personalFinance/mortgage-risk-checklist-dsr-variable`
- `/posts/personalFinance/apt-dashboard-home-goal-roadmap`
- English `/en/posts/personalFinance/...` counterparts

Targeted file/route validation: PASS for all 10 posts.

## Sitemap And Listing

`public/sitemap-0.xml` contains all 10 cluster URLs after build:

- KO/EN DSR 40 income table
- KO/EN rate +1pp impact
- KO/EN cash KRW 100M/200M/300M budget
- KO/EN DSR pass but LTV/cash bottleneck
- KO/EN mortgage risk checklist

Decision: sitemap file was not reverted because it includes meaningful new URLs and updated post `lastmod` values. The diff also includes generated timestamp churn for static routes from `next-sitemap`.

`docs/blog-contents.md` now includes the cluster URLs used by the local link checker. Link checker still reports 10 self URLs missing in registry, but those are outside this DSR/LTV cluster and are not broken links.

## Verification

| Command/check | Result |
| --- | --- |
| Target frontmatter/link/JSON-LD Node check | PASS: 10/10 posts have required metadata, `tool: ["dsr-ltv"]`, calculator/dashboard links, Article JSON-LD, FAQPage JSON-LD |
| Target internal route existence check | PASS: all DSR/LTV cluster links exist as post files or Next i18n routes |
| `npm.cmd run check:posts-links` | FAIL: script default registry path `blog-contents.md` does not exist |
| `node scripts/check_posts_links_local.js --registry=docs/blog-contents.md --dir=content/posts --ext=md,mdx --out=reports/posts.linkcheck.json` | PASS: Broken 0, Suspicious 0, Self URL missing 10 |
| `npm.cmd run build` | PASS: Next build completed, 203 static pages generated, `next-sitemap` completed |
| Target sitemap URL check | PASS: all 10 cluster URLs are present |
| `git diff --check` | PASS: no whitespace errors. Windows CRLF warnings only. |

## Image Needs

No new image files were generated in this task. Existing DSR table, rate impact, and mortgage checklist covers were retained. New posts intentionally do not reference missing cover/img paths.

Needed later:

| Slug | Needed assets |
| --- | --- |
| `cash-100m-200m-300m-apartment-budget` | `cover.png`, `cover-en.png`, `img1.png`, `img1-en.png`, `img2.png`, `img2-en.png`, `img3.png`, `img3-en.png` |
| `dsr-pass-ltv-cash-bottleneck` | `cover.png`, `cover-en.png`, `img1.png`, `img1-en.png`, `img2.png`, `img2-en.png`, `img3.png`, `img3-en.png` |

Suggested concepts:

- Cash budget article: cash/LTV price limit cards, safer search range band, target apartment pass/near-limit/fail panel
- Bottleneck article: DSR vs LTV vs cash constraint diagram, sample A-D comparison, target home decision checklist
