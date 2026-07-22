# FinMap 검색 성장 90일 P0-2A 스니펫 위생 개선

- 기준일: 2026-07-22
- 작업 모드: 실제 렌더링 기반 최소 수정
- 범위: 검색 스니펫에 노출될 수 있는 조회수/댓글/공유/초기 UI 문구 보호
- 제외 범위: 포스트 본문, 계산 로직, 계산 결과, GA4 이벤트명/파라미터, 광고 슬롯, canonical, hreflang, robots, sitemap 정책

## 1. Executive Summary

P0-1 정적 감사에서 확인된 스니펫 리스크를 실제 build HTML과 브라우저 렌더링으로 재검증했다. 실제 문제로 확인된 영역은 포스트 템플릿의 조회수 0 노출 가능성, 댓글 UI, 공유 UI, 그리고 계산기 공통 공유 패널이었다.

수정은 UI 보존형으로 처리했다.

- 조회수는 0 또는 유효하지 않은 값이면 렌더링하지 않는다.
- 조회수가 1 이상일 때만 표시하고 `data-nosnippet`으로 보호한다.
- 포스트 댓글 영역과 공유 영역은 `data-nosnippet`으로 보호한다.
- 계산기 공통 공유 패널도 `data-nosnippet`으로 보호한다.
- article 본문, H1, 요약 문단, FAQ, 계산 설명은 `data-nosnippet` 안에 넣지 않았다.

compound/goal/CAGR 도구의 slug 형태 title 문제는 실제 HTML 문제가 아니라 P0-1 정적 감사 스크립트의 메타 추출 한계로 확인됐다. 실제 렌더링 title/description은 정상이라 도구 페이지 메타는 수정하지 않았다.

## 2. P0-1 감사 결과 재검증

P0-1의 `post_template_*_ssr` 판정은 실제 HTML 확정이 아니라 소스 문자열 기반이었다. 이번 단계에서 로컬 production build HTML을 직접 확인한 결과, 다음처럼 분리된다.

| 항목 | P0-1 판정 | 실제 렌더링 확인 | P0-2A 처리 |
| --- | --- | --- | --- |
| 조회수 0 | SSR 위험 가능성 | 초기 HTML에서 `조회수 0`/`Views 0`가 노출될 수 있는 구조 | 0 이하 미렌더링, 1 이상 `data-nosnippet` |
| 빈 댓글 | 전 포스트 공통 위험 | 댓글 UI와 empty state가 본문 뒤에 렌더링 | 댓글 section `data-nosnippet` |
| 공유 UI | 전 포스트 공통 위험 | X(Twitter), Facebook, 공유하기가 본문 뒤에 렌더링 | 공유 action 영역 `data-nosnippet` |
| 도구 slug title | `/tools/compound-interest` 등에서 slug 추출 | 실제 HTML title/description 정상 | 페이지 메타 수정 없음, 감사 스크립트 보완 |
| intent group | 본문 포함 키워드 기반 오분류 가능 | 일부 글은 보조 키워드만으로 real-estate-loan에 잡힐 수 있음 | URL/title/H1/description 우선 분류와 confidence 필드 추가 |

## 3. 정적 감사와 실제 렌더링 비교

정적 감사 스크립트는 인벤토리와 위험 후보를 찾는 용도다. 실제 스니펫 위생 판정은 `scripts/verify_search_snippet_hygiene.js`가 맡도록 분리했다.

정적 감사 스크립트 보완:

- `post_template_view_count_ssr` 같은 확정 표현을 `post_template_view_count_protected_by_data_nosnippet` 또는 `*_review` 상태로 변경
- compound/goal/CAGR의 conditional metadata 추출 지원
- slug fallback을 정상 title처럼 기록하지 않고 `META_EXTRACTION_FAILED`와 구분
- `overlap_group_confidence`, `overlap_group_source`, `manual_review_required` 필드 추가
- 본문 전체보다 URL, slug, title, H1, description을 우선해 intent group 분류

## 4. 변경 대상 URL HTML 상태

| URL | Type | HTTP | Canonical | Robots | H1 | Unprotected bad text | 판정 |
| --- | --- | ---: | --- | --- | ---: | --- | --- |
| /posts/investingInfo/rates-discount-mortgage-demand-apt-prices | post | 200 | OK | none | 1 | none | PASS |
| /posts/personalFinance/apartment-buying-calculator-guide | post | 200 | OK | none | 1 | none | PASS |
| /posts/personalFinance/ltv-dsr-calculator-guide | post | 200 | OK | none | 1 | none | PASS |
| /posts/personalFinance/salary-40m-mortgage-limit | post | 200 | OK | none | 1 | none | PASS |
| /posts/economicInfo/interest-rate-basics | post | 200 | OK | none | 1 | none | PASS |
| /en/posts/personalFinance/dsr-40-income-loan-limit-table | post | 200 | OK | none | 1 | none | PASS |
| /tools/compound-interest | tool | 200 | OK | none | 1 | none | PASS |
| /tools/goal-simulator | tool | 200 | OK | none | 1 | none | PASS |
| /tools/cagr-calculator | tool | 200 | OK | none | 1 | none | PASS |
| /tools/dsr-ltv-calculator | tool | 200 | OK | none | 1 | none | PASS |
| /tools/home-buying-budget-calculator | tool | 200 | OK | none | 1 | none | PASS |
| /tools/mortgage-loan-calculator | tool | 200 | OK | none | 1 | none | PASS |
| /market/real-estate/gyeonggi-apartment-top100 | market | 200 | OK | none | 1 | none | PASS |
| /en/tools/compound-interest | tool | 200 | OK | none | 1 | none | PASS |
| /en/tools/goal-simulator | tool | 200 | OK | none | 1 | none | PASS |
| /en/tools/cagr-calculator | tool | 200 | OK | none | 1 | none | PASS |

## 5. 포스트 조회수 처리

변경 전:

- 조회수 상태 초기값이 0이고, 템플릿에서 `조회수/Views {views}`를 바로 렌더링했다.
- 실제 검색 스니펫에 `조회수 0` 또는 `Views 0`가 잡힐 가능성이 있었다.

변경 후:

- `Number.isFinite(Number(views)) && Number(views) > 0`일 때만 조회수 UI를 렌더링한다.
- 표시되는 조회수 컨테이너에는 `data-nosnippet`과 `data-snippet-region="post-views"`를 부여했다.
- 조회수 API 호출, 집계 요청, DB 로직은 변경하지 않았다.

검증:

- 6개 포스트 샘플에서 `조회수 0`/`Views 0` unprotected 노출 없음
- 0 조회수 상태에서는 view region 자체가 렌더링되지 않음

## 6. 댓글 영역 처리

변경 전:

- 댓글 제목, 입력 폼, 빈 댓글 문구가 일반 텍스트로 렌더링됐다.
- `아직 댓글이 없습니다.` 또는 `No comments yet.`가 본문 스니펫보다 앞설 가능성이 있었다.

변경 후:

- 댓글 section에 `data-nosnippet`과 `data-snippet-region="post-comments"`를 부여했다.
- 댓글 작성/조회/수정/삭제 로직은 변경하지 않았다.
- 포스트 본문 `.fm-post-body`는 `data-nosnippet` 밖에 유지했다.

검증:

- 6개 포스트 샘플 모두 comments region 존재 및 보호 확인
- 본문 첫 문단은 스니펫 가능 텍스트로 남아 있음

## 7. 공유 영역 처리

변경 전:

- 포스트 하단 action 영역의 `공유하기`, `X(Twitter)`, `Facebook`, `Share`가 일반 텍스트로 렌더링됐다.
- 도구 상단 공통 `share & cite` 패널도 스니펫 후보가 될 수 있었다.

변경 후:

- 포스트 action 영역에 `data-nosnippet`, `data-snippet-region="post-share"` 적용
- 도구 공통 `ToolSharePanel` section에 `data-nosnippet`, `data-snippet-region="tool-share"` 적용
- 공유 함수, 버튼, GA4 action, 접근성, 화면 표시 방식은 변경하지 않았다.

검증:

- 포스트 공유 region 보호 확인
- 도구 공유 패널 보호 확인
- unprotected text에서 공유 UI 문구 hit 없음

## 8. 계산기 초기 상태 처리

대상 도구:

- `/tools/compound-interest`
- `/tools/goal-simulator`
- `/tools/cagr-calculator`
- `/tools/dsr-ltv-calculator`
- `/tools/home-buying-budget-calculator`
- `/tools/mortgage-loan-calculator`

검증 결과:

- `Loading`, `No results`, `결과가 없습니다`, `계산 결과가 표시됩니다` 등 초기 placeholder 문구의 unprotected 노출 없음
- 계산기 H1 1개 유지
- title/description 존재
- noindex 없음
- self canonical 유지
- 계산 결과와 계산 로직은 변경하지 않음

도구 첫 crawlable text는 nav 이후 계산기 목적/입력/결과 설명으로 이어졌다. 별도 hidden SEO text는 추가하지 않았다.

## 9. 도구 메타 실제 상태

| URL | 실제 title | 실제 description 상태 | 실제 H1 |
| --- | --- | --- | --- |
| /tools/compound-interest | 복리 계산기 \| 월복리·적립식 투자 미래가치 계산 | 존재 | 복리 계산기 |
| /tools/goal-simulator | 목표자산 도달 계산기 \| 매달 얼마 투자해야 할까? | 존재 | 목표자산 도달 계산기 \| 매달 얼마 투자해야 할까? |
| /tools/cagr-calculator | CAGR 계산기 (연평균 수익률·연복리 수익률·연평균 성장률) | 존재 | CAGR(연평균 수익률)로 내 투자 성과를 한 줄 숫자로 |
| /en/tools/compound-interest | Compound Interest Calculator: Future Value, Monthly Contributions & Taxes | 존재 | Compound Interest Calculator for Future Value |
| /en/tools/goal-simulator | Investment Goal Calculator: How Much to Invest Per Month | 존재 | Investment Goal Calculator: How Much to Invest Per Month |
| /en/tools/cagr-calculator | CAGR Calculator: Annualized Return, Growth Rate & Future Value | 존재 | CAGR Calculator for Annualized Return |

판정:

- 실제 HTML에서 slug title 문제 없음
- meta description 존재
- canonical 정상
- noindex 없음
- 따라서 도구 페이지 title/description/H1은 수정하지 않았다.

## 10. 감사 스크립트 보완

대상:

- `scripts/audit_search_growth_baseline.js`

변경:

- conditional title/description 추출 추가
- JSX H1 conditional 추출 추가
- meta 추출 실패와 빈 값을 slug fallback과 분리
- 정적 템플릿 판정을 `_ssr` 확정 표현에서 review/protected 상태로 변경
- intent overlap 분류에 confidence/source/manual review 필드 추가
- CSV/JSON 출력에 신규 필드 추가

산출물:

- `reports/search-growth-90d-url-inventory.csv`
- `reports/search-growth-90d-audit-data.json`

## 11. 신규 검증 스크립트

대상:

- `scripts/verify_search_snippet_hygiene.js`

검증 항목:

- HTTP 200
- self canonical
- noindex 없음
- sitemap membership
- H1 정확히 1개
- title/description 존재
- unprotected `조회수 0`/`Views 0` 없음
- 댓글 UI `data-nosnippet` 보호
- 공유 UI `data-nosnippet` 보호
- 포스트 본문 전체가 `data-nosnippet` 안에 들어가지 않음
- 계산기 초기 로딩/빈 결과 문구 unprotected 노출 없음
- 모바일 320px horizontal overflow 없음
- hydration error 없음

브라우저 검증:

- local Chrome/Edge가 확인되어 `puppeteer-core`로 320px viewport 검증 실행
- 15개 post/tool URL에서 overflow 없음
- hydration error 0
- page error 0

콘솔 경고:

- 15개 URL에서 console error 카운트가 있었다.
- 포스트 샘플은 `/api/view`, `/api/comments` 계열 local 500과 외부 리소스 `ERR_NETWORK_ACCESS_DENIED`가 섞여 있었다.
- 도구 샘플은 외부 리소스 `ERR_NETWORK_ACCESS_DENIED`가 주 원인이었다.
- 이번 수정에서 만든 hydration/page error는 없으며, 검색 스니펫 위생 검증은 PASS다.

## 12. 변경 파일

수정:

- `pages/posts/[category]/[slug].js`
- `_components/ToolBacklinkKit.js`
- `scripts/audit_search_growth_baseline.js`

생성:

- `scripts/verify_search_snippet_hygiene.js`
- `reports/search-growth-90d-p0-2a-snippet-hygiene.md`
- `reports/search-growth-90d-p0-2a-snippet-hygiene-rendered.json`

검증으로 갱신:

- `reports/search-growth-90d-url-inventory.csv`
- `reports/search-growth-90d-audit-data.json`
- `reports/seo-channel-split-url-check.md`

## 13. 검증 결과

| 명령 | 결과 | 메모 |
| --- | --- | --- |
| `node --check scripts\audit_search_growth_baseline.js` | PASS | 감사 스크립트 문법 확인 |
| `node --check scripts\verify_search_snippet_hygiene.js` | PASS | 신규 검증 스크립트 문법 확인 |
| `node scripts\audit_search_growth_baseline.js` | PASS | 192개 URL 인벤토리 재생성 |
| `node scripts\verify_tool_result_cta_events.js` | PASS | GA4 계산/CTA 이벤트명 유지 |
| `npm.cmd run build` | PASS | Next.js build 및 postbuild sitemap 생성 완료 |
| `node scripts\verify_search_snippet_hygiene.js --base-url=http://127.0.0.1:8002` | PASS | 16개 URL rendered HTML 검사 PASS |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS | canonical/hreflang/sitemap 채널 분리 PASS |
| `git diff --check` | PASS | CRLF line-ending warning만 있음 |
| `git status --short --untracked-files=all` | PASS | 아래 변경 파일 확인 |

최종 `git status --short --untracked-files=all`:

```text
 M _components/ToolBacklinkKit.js
 M pages/posts/[category]/[slug].js
 M reports/posts.linkcheck.json
 M reports/seo-channel-split-url-check.md
?? reports/search-growth-90d-audit-data.json
?? reports/search-growth-90d-p0-1-baseline-audit.md
?? reports/search-growth-90d-p0-2a-snippet-hygiene-rendered.json
?? reports/search-growth-90d-p0-2a-snippet-hygiene.md
?? reports/search-growth-90d-url-inventory.csv
?? scripts/audit_search_growth_baseline.js
?? scripts/verify_search_snippet_hygiene.js
```

## 14. 미변경 영역

다음은 변경하지 않았다.

- 포스트 Markdown 본문
- 신규 포스트 생성 또는 기존 포스트 통합
- broken/suspicious internal link 수정
- 계산 코어
- 계산 결과 표시값
- GA4 이벤트명과 파라미터
- 광고 슬롯 구조
- canonical 생성 정책
- hreflang 생성 정책
- robots 정책
- sitemap URL 정책
- API/DB 로직

## 15. 완료 기준 체크

| 기준 | 판정 |
| --- | --- |
| 대상 포스트 HTML에 `조회수 0`/`Views 0` 노출 없음 | PASS |
| 조회수 표시 시 `data-nosnippet` 보호 | PASS |
| 댓글 UI 스니펫 제외 | PASS |
| 공유 UI 스니펫 제외 | PASS |
| 포스트 H1과 본문은 스니펫 가능 상태 유지 | PASS |
| 계산기 초기 placeholder 문구가 본문 설명보다 우선하지 않음 | PASS |
| compound/goal/CAGR 실제 title/description 확인 | PASS |
| 실제 메타가 정상이라 불필요한 페이지 메타 수정 없음 | PASS |
| 감사 스크립트가 slug fallback을 정상 title처럼 기록하지 않음 | PASS |
| build PASS | PASS |
| SEO 채널 분리 검증 PASS | PASS |
| 계산 결과와 GA4 이벤트 변경 없음 | PASS |

## 16. Remaining Findings

- P0-2B 범위로 남긴 broken internal link 8개와 suspicious link 13개는 이번 작업에서 수정하지 않았다.
- `package.json`의 `check:posts-links`는 여전히 루트 `blog-contents.md`를 기대한다. 실제 registry는 `docs/blog-contents.md`에 있다.
- local browser 검증에서 console error가 남아 있다. 원인은 local API 500과 외부 네트워크 차단으로 보이며, 이번 스니펫 패치에서 만든 hydration/page error는 아니다.
- market top100 일부 description 개선, 내부 링크 구조 개선, EN 유지 경로 polish는 후속 작업이다.

## 17. 다음 단계 P0-2B

P0-2B는 broken/suspicious internal link 정리만 별도 범위로 진행하는 것이 좋다. 이번 P0-2A는 스니펫 위생 범위에서 종료한다.
