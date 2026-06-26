# how-much-per-month-for-100m Hreflang Pair Audit

- 작성일: 2026-06-26
- 대상:
  - `content/posts/personalFinance/ko/how-much-per-month-for-100m.md`
  - `content/posts/personalFinance/en/how-much-per-month-for-100m.md`
- 범위: 읽기 전용 감사. 코드, 콘텐츠, URL, canonical, hreflang, sitemap, noindex는 수정하지 않는다.
- 최종 분류: `decouple_hreflang_candidate`
- intent equivalence score: `medium`

## 결론

현재 KO/EN 글은 본문 구조, 계산 방식, 섹션 배열, FAQ, 계산기 CTA가 거의 같은 형태다. 그러나 KO는 한국어 검색자의 `1억 모으려면 월 얼마?` 의도이며 금액 단위가 KRW 1억원/만원이다. EN은 영어권 검색자의 `$100,000 target` 또는 target portfolio calculator 의도이며 금액 단위가 USD다.

따라서 구조적 유사성은 높지만, hreflang equivalent로 보기에는 목표 금액의 의미와 검색자 맥락이 다르다. 현재 상태 그대로 pair를 유지하기보다는 `decouple_hreflang_candidate`로 보고, 다음 단계에서 EN을 KRW 100M Korea guide로 조정해 pair를 유지할지, 아니면 현재 EN을 USD 100k 독립 글로 두고 hreflang을 분리할지 결정하는 것이 적절하다.

## Frontmatter 비교

| 항목 | KO | EN | 감사 메모 |
| --- | --- | --- | --- |
| `title` | `1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금` | `How Much Should You Invest Monthly to Reach $100,000? 5-, 10-, and 15-Year Plans` | 같은 월 투자금 문제지만 KO는 KRW 1억원, EN은 USD 100,000이다. |
| `seoTitle` | title과 동일 | title과 동일 | 제목 구조는 대응되지만 통화/검색 intent가 다르다. |
| `description` | 연 5% 기준 5년 월 147만원, 10년 64만원, 15년 37만원 | 5% 기준 5년 $1,470, 10년 $644, 15년 $374 | 계산 구조는 같으나 답변 단위가 다르다. |
| `seoDescription` | 1억 모으는 기간과 월 필요금액을 표/계산기로 확인 | $100,000 from $0 monthly amounts and scenarios | KO는 `1억 모으기` 검색어, EN은 `$100,000` 목표 포트폴리오 검색어에 맞춰져 있다. |
| `tags` | `1억 모으기`, `월 투자금`, `목표 자산`, `재테크 계획`, `복리`, `적립식 투자`, `목표자산 계산기`, `DCA` | `save 100k`, `monthly investment`, `financial goal`, `goal calculator`, `compound interest`, `DCA`, `investment planning`, `wealth building` | 공통 주제는 목표자산/복리/DCA이나 KO의 핵심 태그는 한국 금액 표현이고 EN은 글로벌 개인재무 표현이다. |

## 본문 비교

| 항목 | KO | EN | 감사 메모 |
| --- | --- | --- | --- |
| 첫 문단 | 초기자산 0원, 연 5% 가정 시 5년 월 약 147만원, 10년 약 64만원, 15년 약 37만원 | starting from $0, 5% return, $1,470/$644/$374 per month | 문장 구조와 논리는 대응되지만 사용자가 기대하는 금액 체계가 다르다. |
| 주요 섹션 | 한눈에 보는 답, 월 투자 가능 금액, 5/10/15년 계획, 월 투자금 기준 기간 선택, 실행 순서, 체크리스트 | At a glance, contribution control, 5/10/15-year plan, budget-based timeline, actionable plan, checklist | 섹션 구조는 localized equivalent에 가까울 정도로 유사하다. |
| 표 1 | 1억원 목표, 월 167만원/147만원/140만원 등 | $100,000 목표, $1,667/$1,470/$1,397 등 | 같은 수학 모델을 다른 통화 목표에 적용한다. hreflang 관점에서는 핵심 답이 다른 글이다. |
| 표 2 | 5년/10년/15년 계획별 적합 상황과 위험 | 동일한 계획 프레임 | intent 차이는 작다. |
| 표 3 | 월 30만~40만원, 50만~70만원, 80만~100만원, 140만원 이상 | $300-$400, $500-$700, $800-$1,000, $1,400+ | 예산대 자체가 각 언어권 독자에게 맞춰 바뀌어 있다. |
| FAQ | 1억, 월 50만원, 연 7%, 이미 모은 돈, 계산기 사용 | $100,000, $500/mo, 7%, existing balance, calculators | FAQ도 구조는 같지만 검색 질의의 금액 단위가 다르다. |
| CTA | `/tools/goal-simulator`, `/tools/compound-interest`, `/tools/dca-calculator` | `/en/tools/goal-simulator`, `/en/tools/compound-interest`, `/en/tools/dca-calculator` | 언어별 tool CTA는 잘 분리되어 있다. |
| 내부링크 | KO 1억 표, KO 1억 계산법, KO DCA/lump-sum 글 | EN $100,000 reference table, EN DCA/lump-sum 글 | 내부링크도 각 채널 intent에 맞다. 이는 좋은 점이지만 hreflang equivalent 판단에는 분리 신호이기도 하다. |

## Intent 판단

- KO intent: 한국어 사용자가 네이버 등에서 `1억 모으려면 월 얼마`, `1억 만들기 월 투자금`, `월 50만원 1억 기간`처럼 검색했을 때 즉답, 표, 계산기 연결을 제공하는 글이다.
- EN intent: 영어권 사용자가 Google/Bing에서 `how much invest monthly to reach $100,000`, `save 100k monthly investment`, `target portfolio monthly contribution`처럼 검색했을 때 USD 기준 목표 포트폴리오 계획을 제공하는 글이다.
- 공통 intent: 특정 목표 금액에 도달하기 위한 월 납입액, 기간, 수익률 시나리오를 계산하고 goal/compound/DCA tools로 유도한다.
- 비동등 intent: 목표 금액 자체가 KRW 100M vs USD 100k로 다르며, 둘은 단순 번역이나 지역화 표현 차이를 넘어 검색자의 재무 목표와 답변 금액을 바꾼다.

판정: 현재 상태는 `keep_hreflang_pair`로 보기 어렵다. 콘텐츠 구조가 유사하므로 `adapt_content_to_keep_pair`도 가능하지만, 현재 파일 그대로의 감사 분류는 `decouple_hreflang_candidate`가 맞다.

## Current Hreflang Behavior

현재 라우팅은 같은 slug를 가진 KO/EN 파일을 각각 SSG 경로로 만든다.

- `lib/posts.js`는 `content/posts/[category]/[lang]/*.md`를 언어별로 읽고, `getPostBySlugStrict(lang, slug)`로 해당 언어 파일을 fallback 없이 로드한다.
- `pages/posts/[category]/[slug].js`의 `getStaticPaths`는 KO 파일을 `/posts/[category]/[slug]`, EN 파일을 `/en/posts/[category]/[slug]`로 생성한다.
- `getStaticProps`는 `locale`로 `lang`을 정하고, 같은 slug의 반대 언어 파일 존재 여부를 `otherLangAvailable = hasSlugCached(otherLang, slug)`로 확인한다.
- 다만 `otherLangAvailable`은 availability event 등에 쓰이며, `SeoHead`의 hreflang 출력 여부를 제어하지 않는다.

`SeoHead` 동작은 URL path 기반이다.

- `_components/SeoHead.js`의 `alternateLanguages` 기본값은 `true`다.
- `normalizePath(canonical || url)`는 `/en` 또는 `/ko` prefix를 제거한 normalized path를 만든다.
- canonical은 현재 locale이 `en`이면 `/en` prefix를 붙이고, KO면 prefix 없이 만든다.
- alternate는 항상 `hrefLang="ko"`에 normalized KO URL, `hrefLang="en"`에 `/en` prefixed URL을 출력한다.
- `alternateLanguages={false}`를 넘기면 self hreflang만 출력하는 분기가 있지만, 현재 포스트 페이지에서는 이 값을 넘기지 않는다.
- non-home URL에는 `x-default`를 출력하지 않는다.

이 대상의 현재 head/sitemap상 pair는 다음과 같다.

| URL | canonical | hreflang ko | hreflang en |
| --- | --- | --- | --- |
| KO | `https://www.finmaphub.com/posts/personalFinance/how-much-per-month-for-100m` | self | `https://www.finmaphub.com/en/posts/personalFinance/how-much-per-month-for-100m` |
| EN | `https://www.finmaphub.com/en/posts/personalFinance/how-much-per-month-for-100m` | `https://www.finmaphub.com/posts/personalFinance/how-much-per-month-for-100m` | self |

현재 sitemap 출력도 같은 pair를 보강한다.

- `public/sitemap-0.xml`에는 KO loc와 EN loc가 모두 있으며 각각 같은 `xhtml:link` KO/EN alternate를 가진다.
- `public/sitemap-ko.xml`에는 KO loc가 있으며 EN alternate를 가진다.
- `public/sitemap-en.xml` 및 `public/en/sitemap.xml`에는 EN loc가 있으며 KO alternate를 가진다.
- `scripts/generate_channel_sitemaps.js`는 source sitemap entry XML을 KO/EN loc prefix로 분리하므로, 콘텐츠 intent를 판단하지 않고 기존 alternate XML을 보존한다.
- `scripts/verify_seo_channel_split.js`의 `expectedFor(sample)`도 URL prefix 기준으로 KO/EN hreflang을 기대한다. 현재 sample에는 이 target slug가 없고, decouple 후보를 검증하는 로직도 없다.

## Risk If Kept As-Is

- hreflang cluster가 실제 localized equivalent보다 넓게 묶인다. 검색엔진이 pair를 무시하거나 신호 품질을 낮게 볼 수 있다.
- 사용자가 언어 전환 또는 SERP 대체 URL을 통해 이동했을 때, KRW 1억원 답을 기대했는데 USD 100,000 답을 보거나 그 반대가 된다.
- 같은 slug의 `100m` 의미가 KO에서는 100 million won, EN에서는 100,000 dollars로 달라진다.
- EN 글의 독립적인 `$100,000` calculator intent와 KO 글의 한국형 `1억 모으기` intent가 서로 묶여 각 채널 최적화 판단을 흐릴 수 있다.

## Risk If Decoupled

- Head만 decouple하고 sitemap을 그대로 두면 페이지 head와 sitemap hreflang이 충돌한다.
- Sitemap만 decouple하고 head를 그대로 두면 여전히 브라우저 HTML에서 pair 신호가 출력된다.
- 현재 `SeoHead`는 path 기반 전역 alternate 생성에 가깝기 때문에, per-post decouple을 하려면 포스트 메타 또는 별도 manifest를 `SeoHead`와 sitemap 생성 경로에 동시에 연결해야 한다.
- `verify_seo_channel_split.js`는 기본적으로 URL prefix pair를 기대하므로, decouple 예외를 검증하는 테스트 케이스를 추가하지 않으면 회귀 확인이 어렵다.
- pair를 끊으면 cross-language discovery 신호는 줄어든다. 다만 현재처럼 intent가 다른 경우에는 이 손실보다 잘못된 equivalent 신호를 줄이는 이점이 클 수 있다.

## Recommended Next Action

현재 상태로는 `decouple_hreflang_candidate`로 유지한다. 즉시 URL 삭제, slug 변경, noindex, canonical 변경은 하지 않는다.

다음 작업에서 먼저 제품/SEO 방향을 결정한다.

1. same-slug hreflang pair를 유지하려면 EN을 `$100,000` 글이 아니라 `KRW 100 million` 또는 `Korea 100M won savings goal` guide로 조정한다. 이 경우 분류는 `adapt_content_to_keep_pair`로 바뀔 수 있다.
2. EN의 `$100,000` target portfolio intent를 살리고 싶다면 이 pair는 decouple한다. 현재 EN은 `/en` channel에서 독립 검색 의도가 있으므로 삭제하거나 noindex할 필요는 없다.

우선순위 관점에서는 2번이 현재 콘텐츠 의도를 더 잘 보존한다. 다만 구현 복잡도는 1번이 낮다.

## Implementation Options

| 옵션 | 개요 | 장점 | 주의점 |
| --- | --- | --- | --- |
| A. EN 콘텐츠 조정 후 pair 유지 | EN title, description, 표, FAQ를 KRW 100M/Korea guide로 바꾼다. URL과 hreflang 구조는 유지한다. | 코드 변경이 거의 없고 현재 same-slug 구조와 맞는다. | EN의 `$100,000` 독립 검색 의도를 포기하거나 다른 EN 글로 분리해야 한다. |
| B. Per-post hreflang opt-out | frontmatter 또는 manifest에 `hreflangEquivalent: false` 같은 플래그를 두고, 포스트 페이지에서 `SeoHead alternateLanguages={false}` 또는 self-only alternate를 넘긴다. sitemap 생성도 같은 플래그를 반영한다. | 현재 EN을 독립 글로 유지하면서 잘못된 equivalent 신호를 제거한다. | `SeoHead`, sitemap source/generation, verifier를 함께 고쳐야 한다. |
| C. Explicit alternate mapping | slug 자동 pair 대신 `koSlug -> enSlug` 또는 `alternateUrls` manifest를 둔다. 같은 slug라도 pair를 끊거나 다른 slug와 연결할 수 있다. | 향후 slug mismatch나 adapted pair를 세밀하게 관리할 수 있다. | 구현 범위가 가장 크고 검증 케이스가 필요하다. |
| D. Sitemap-only 임시 decouple | sitemap의 `xhtml:link`만 제거한다. | 구현은 작아 보인다. | Head의 hreflang이 남아 충돌하므로 권장하지 않는다. |

권장 구현안은 B 또는 C다. 단일 예외만 처리하려면 B가 작고, 앞으로 `decouple_hreflang_review` 후보가 계속 늘어날 가능성을 고려하면 C가 더 확장성이 있다.

## Audit Commands

| Command | Result |
| --- | --- |
| `git status --short` | PASS. 작업 전 출력 없음. |
| `rg -n "how-much-per-month-for-100m\|hreflang\|alternate\|canonical\|same-slug\|lang\|locale" ...` | PASS. 관련 pair, SeoHead, sitemap, 정책 문서 위치 확인. |
| `Get-Content -Encoding UTF8 -Path content\posts\personalFinance\ko\how-much-per-month-for-100m.md` | PASS. KO frontmatter/body 확인. |
| `Get-Content -Path content\posts\personalFinance\en\how-much-per-month-for-100m.md` | PASS. EN frontmatter/body 확인. |
| `Get-Content -LiteralPath pages\posts\[category]\[slug].js` | PASS. SSG routing, strict load, `otherLangAvailable`, `SeoHead` 호출 확인. |
| `Get-Content -Path _components\SeoHead.js` | PASS. path 기반 canonical/hreflang 출력 확인. |
| `Get-Content -Path lib\posts.js` | PASS. 언어별 파일 탐색과 strict/fallback loader 확인. |
| `Get-Content -Path scripts\generate_channel_sitemaps.js` | PASS. channel sitemap split이 source entry XML을 보존하는 구조 확인. |
| `Get-Content -Path scripts\verify_seo_channel_split.js` | PASS. verifier가 URL prefix 기반 KO/EN href를 기대하는 구조 확인. |
| `rg -n "how-much-per-month-for-100m" public\sitemap-0.xml public\sitemap-ko.xml public\sitemap-en.xml public\en\sitemap.xml` | PASS. target URL의 sitemap hreflang pair 확인. |
| `git diff --check` | PASS. 출력 없음. |
