# Finmap KO/EN Search Channel Split Audit

- Date: 2026-06-18
- Scope: `SeoHead`, post routes, tools pages, `next-sitemap`, RSS, robots, generated sitemaps, KO/EN post content, internal links
- Goal: KO pages can be operated mainly for Naver, while EN pages can be operated mainly for Google/Bing.

## Summary

결론: 핵심 canonical/hreflang 구조는 이미 대체로 안전하다. 큰 SEO 로직 변경은 필요하지 않았다. 이번 작업에서는 기존 전체 sitemap을 유지하면서, 채널별 제출 운영을 위해 postbuild 후 `sitemap-ko.xml`, `sitemap-en.xml`을 자동 생성하도록 최소 변경했다.

## Changes Applied

| File | Change | Reason |
| --- | --- | --- |
| `package.json` | `postbuild`에 `node scripts/generate_channel_sitemaps.js` 추가 | `next-sitemap` 생성 후 KO/EN 파생 sitemap 자동 생성 |
| `scripts/generate_channel_sitemaps.js` | 신규 | `public/sitemap-0.xml`을 기준으로 KO loc / EN loc를 분리 |
| `scripts/verify_seo_channel_split.js` | 신규 | 주요 KO/EN URL 10개 canonical, hreflang, noindex, X-Robots 점검 |
| `public/sitemap-ko.xml` | 신규 생성 | Naver 제출 또는 KO-only 진단용 |
| `public/sitemap-en.xml` | 신규 생성 | Google/Bing EN 제출 또는 EN-only 진단용 |
| `reports/seo-channel-split-url-check.md` | 신규 생성 | 10개 URL HTTP 검증 결과 |
| `public/sitemap-0.xml` | build 재생성 | URL 추가/삭제 없음. `/en`, `/en/sitemap-pages` 순서만 이동 |

## Audit Findings

### Route Note

요청 범위의 `pages/posts/[category]/[lang]/[slug].js` 형태는 현재 실제 렌더 파일이 아니다. 실제 렌더러는 `pages/posts/[category]/[slug].js`이고, 과거 `/posts/{category}/{lang}/{slug}` URL은 `pages/posts/[...all].js`와 `next.config.js` redirect에서 canonical URL로 이동한다.

### 1. Self-Canonical

PASS.

- `SeoHead`는 `locale="en"`일 때 `/en` prefix를 붙이고, KO는 root path를 사용한다.
- `pages/posts/[category]/[slug].js`는 `lang` 기준으로 canonical URL을 만든다.
- tools 페이지들은 `locale={router.locale === "en" ? "en" : "ko"}` 패턴을 사용한다.
- 검증 URL 10개 모두 canonical이 자기 언어 URL과 일치했다.

### 2. hreflang

PASS.

- `SeoHead`는 `ko`, `en` alternate를 양방향으로 출력한다.
- sitemap도 `xhtml:link`로 `ko`, `en` 쌍을 출력한다.
- 포스트 sitemap alternates는 KO/EN 파일이 모두 존재하는 경우에만 생성된다.
- 현재 콘텐츠 파일 수는 KO 71개, EN 71개로 1:1 페어가 맞다.

### 3. x-default

PASS.

- `SeoHead`와 `next-sitemap.config.js` 모두 x-default를 홈 쌍에만 출력한다.
- `public/sitemap-0.xml`: x-default 2개 (`/`, `/en` home pair)
- `public/sitemap-ko.xml`: x-default 1개
- `public/sitemap-en.xml`: x-default 1개
- non-home URL x-default는 발견되지 않았다.

### 4. EN -> KO Canonical 묶임

발견 안 됨.

- EN 포스트 라우트는 `getPostBySlugStrict("en", slug)`를 사용해 KO fallback을 막는다.
- EN tools/category/market URL은 `locale="en"` canonical을 출력한다.
- `scripts/verify_seo_channel_split.js --local-server` 결과 EN 샘플 5개 모두 `/en/...` self-canonical이었다.

### 5. Sitemap Split

적용 완료.

| Sitemap | URLs | Intended Use |
| --- | ---: | --- |
| `public/sitemap.xml` | index | 기존 전체 sitemap index, robots에 유지 |
| `public/sitemap-0.xml` | 199 | 기존 canonical 전체 목록 |
| `public/sitemap-ko.xml` | 101 | Naver/KO 진단 또는 선택 제출 |
| `public/sitemap-en.xml` | 98 | Google/Bing EN 우선 제출 |

`sitemap-ko.xml`이 3개 더 많은 이유는 KO-only 부동산 설명형 랜딩 3개가 있고, 해당 EN URL은 sitemap에서 제외되어 있기 때문이다.

### 6. Naver RSS

PASS.

- `pages/rss.xml.js`는 `lang !== "ko"`를 제외한다.
- RSS language는 `ko-KR`이며 최신 KO 글 중심으로 최대 50개를 생성한다.
- 네이버 제출용은 계속 `https://www.finmaphub.com/rss.xml`을 우선 유지한다.

### 7. Google/Bing Submission Structure

권장 운영:

1. Google Search Console / Bing Webmaster Tools에는 `https://www.finmaphub.com/sitemap-en.xml`을 먼저 제출한다.
2. 전체 색인 커버리지가 필요하면 기존 `https://www.finmaphub.com/sitemap.xml`도 함께 제출한다.
3. EN tools URL은 `sitemap-en.xml`에 포함되어 있으므로 영어 도구 페이지 우선 제출이 가능하다.
4. `robots.txt`는 기존처럼 `Sitemap: https://www.finmaphub.com/sitemap.xml`만 유지한다. split sitemap은 수동 제출용으로 두어 Naver가 EN split을 자동으로 강하게 따라가지 않게 한다.

### 8. Internal Links

PASS with watchlist.

- EN markdown에서 `/posts/...` 같은 KO root 내부 링크는 발견되지 않았다.
- KO markdown에서 `/en/...` 내부 링크도 발견되지 않았다.
- EN JSON-LD 내부의 root asset URL(`og-default.png`, favicon, brand logo)은 언어 페이지가 아니므로 문제로 보지 않는다.

## EN Content Watchlist

아래는 “삭제” 후보가 아니라 Google/Bing용으로 별도 검색 의도를 더 강하게 만들어야 할 후보다. 기준은 제목의 generic함, 본문 길이, 미국/국제 독자 관점의 독립 기획성, Finmap 도구/대시보드와의 연결 강도다.

| Priority | File | Why |
| ---: | --- | --- |
| 1 | `content/posts/investingInfo/en/dxy-dollar-index-basics.md` | 663 words, broad keyword, 경쟁 강함 |
| 2 | `content/posts/personalFinance/en/goal-amount-fast-strategy.md` | 826 words, 검색 의도가 너무 일반적 |
| 3 | `content/posts/economicInfo/en/inflation-rate-basics.md` | 955 words, generic finance explainer |
| 4 | `content/posts/personalFinance/en/personal-start-5steps.md` | 1000 words, 차별화 약함 |
| 5 | `content/posts/economicInfo/en/indicator-basics.md` | 1074 words, broad topic |
| 6 | `content/posts/personalFinance/en/annual-vs-monthly-compound.md` | 1125 words, calculator-led intent 보강 필요 |
| 7 | `content/posts/investingInfo/en/korea-etf-deep-dive-tnx.md` | niche는 좋지만 1224 words로 깊이 부족 |
| 8 | `content/posts/investingInfo/en/etf-impact-of-tnx.md` | `korea-etf-deep-dive-tnx`와 intent 중복 가능 |
| 9 | `content/posts/personalFinance/en/what-is-cagr.md` | broad keyword, 이미지/구조가 오래된 글 성격 |
| 10 | `content/posts/personalFinance/en/dca-vs-lump-sum-when-results-differ.md` | 1332 words, 검색 의도는 있으나 차별화 약함 |
| 11 | `content/posts/economicInfo/en/inflation-basics.md` | broad evergreen, Finmap 고유 각도 약함 |
| 12 | `content/posts/investingInfo/en/us10y-impact-on-korea-and-stock-market.md` | Korea angle은 좋지만 1390 words로 얇음 |
| 13 | `content/posts/personalFinance/en/how-much-to-invest-monthly-for-target-portfolio.md` | generic calculator intent, USD examples 강화 필요 |
| 14 | `content/posts/personalFinance/en/monthly-investment-for-100m-table.md` | KRW 100M intent가 EN 독자에게 애매함 |
| 15 | `content/posts/investingInfo/en/diagnose-investing-skill-with-cagr.md` | topic은 좋지만 query intent 재정의 필요 |

## TOP20 EN Planning Priorities

| Priority | Proposed EN Page | Search Intent |
| ---: | --- | --- |
| 1 | South Korea Apartment Transaction Dashboard Guide | Korea real estate data dashboard |
| 2 | Korean Apartment Prices: Median vs Average vs Unit Price | how to read Korea apartment prices |
| 3 | Korea Mortgage DSR/LTV Calculator Guide | Korean mortgage DSR LTV calculator |
| 4 | DSR 40% Income Table for Korean Mortgages | DSR 40 income mortgage limit |
| 5 | Cash Needed to Buy an Apartment in Korea | Korea apartment cash down payment |
| 6 | Jeonse vs Rent vs Buy in Korea for Global Readers | jeonse explained / Korea housing decision |
| 7 | Seoul vs Gyeonggi vs Incheon Apartment Market Signals | Seoul Gyeonggi Incheon real estate |
| 8 | Korean Apartment Transaction Volume: Why It Moves First | apartment transaction volume Korea |
| 9 | USD/KRW Exchange Rate Dashboard Reading Guide | USD KRW exchange rate impact |
| 10 | How DXY Moves USD/KRW and KOSPI | DXY USDKRW KOSPI |
| 11 | U.S. 10Y Yield and Korea ETFs | TNX Korea ETF sensitivity |
| 12 | KOSPI vs S&P 500: FX, Rates, Foreign Flow Chain | S&P 500 KOSPI correlation |
| 13 | Korea ETF Currency-Hedged vs Unhedged Exposure | hedged vs unhedged Korea ETF |
| 14 | WTI Oil Shock and Korea Inflation/FX | oil USDKRW Korea inflation |
| 15 | FIRE Calculator with Inflation and Taxes | FIRE calculator inflation tax |
| 16 | Compound Interest Calculator with Fees, Taxes, Inflation | compound calculator after tax inflation |
| 17 | DCA Calculator: Monthly Investing With Step-Up Contributions | DCA calculator monthly contribution |
| 18 | CAGR Calculator for ETF Comparison | CAGR calculator ETF comparison |
| 19 | Modern 60/40 Portfolio With Real Estate and FX Risk | portfolio risk budget real estate FX |
| 20 | Korean Housing Risk Checklist Before Buying | Korea apartment buying checklist |

## Verification

| Command | Result |
| --- | --- |
| `node --check scripts\generate_channel_sitemaps.js` | PASS |
| `node --check scripts\verify_seo_channel_split.js` | PASS |
| `npm.cmd run build` | PASS. Next build completed; `next-sitemap` completed; channel sitemaps generated |
| `node scripts\verify_bing_sitemap.js` | PASS. failures 0; 199 canonical URLs; 142 post URLs |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS. 10/10 URLs passed canonical/hreflang/noindex/X-Robots checks |

## Remaining Notes

- `public/sitemap-0.xml` diff is only generated ordering churn for `/en` and `/en/sitemap-pages`; no URL count or URL membership changed.
- `robots.txt` intentionally still exposes only the full sitemap index. Split sitemaps are manual submission targets.
- EN content quality work should be handled as content planning, not by canonical/noindex changes.
