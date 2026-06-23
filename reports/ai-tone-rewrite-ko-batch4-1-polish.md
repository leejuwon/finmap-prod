# Finmap AI-like Prose Rewrite - KO Batch 4.1 Polish

작성일: 2026-06-23

## 1. 실제 수정 파일 목록

| File | 수정 내용 |
| --- | --- |
| `content/posts/economicInfo/ko/real-rates-and-breakevens.md` | 하단의 불필요한 ```html 코드펜스 제거 |
| `content/posts/personalFinance/ko/dca-vs-lumpsum-decision-rules.md` | 수동 Article JSON-LD `inLanguage`를 `ko`로 통일, 렌더링되지 않는 `<ToolCta type="dca" />` 2개 제거 |
| `content/posts/personalFinance/ko/dca-fx-volatility-decomposition.md` | 렌더링되지 않는 `<ToolCta type="dca" />` 2개 제거 |

## 2. 수정하지 않은 점과 이유

- `title`, `description`, `tool`, `cover`는 Batch 4 기준으로 새 문제가 없어 변경하지 않았다.
- `slug`, `link`, `category`, `postCategory`, `lang`은 변경하지 않았다.
- canonical/hreflang/robots/sitemap/routing/SeoHead 정책은 변경하지 않았다.
- FAQ visible 질문과 FAQPage JSON-LD 질문 수/문구는 유지했다.
- `ToolCta` 렌더링 문제는 Markdown 태그가 React 컴포넌트로 치환되지 않는 구조 문제다. 코드 수정은 이번 polish 범위를 넘기므로, 인접한 DCA 계산기 링크/설명 문단을 유지하고 raw custom tag만 제거했다.

## 3. real-rates 코드펜스 제거 확인

원문 검사:

- `rg '```html|```' content/posts/economicInfo/ko/real-rates-and-breakevens.md`: no hits
- `## 함께 보면 좋은 글/도구` 아래 링크 목록은 코드블록 밖 Markdown으로 남아 있다.
- 수동 Article JSON-LD와 FAQPage JSON-LD는 코드블록 밖 `<script type="application/ld+json">`로 남아 있다.

Built HTML 검사:

| Check | Result |
| --- | --- |
| contains ```html | false |
| contains `<pre` | false |
| contains `language-html` | false |
| related link hrefs | present |
| `application/ld+json` scripts | 4 |

## 4. built HTML에서 JSON-LD script 정상 렌더링 확인

대상 파일:

- `.next/server/pages/ko/posts/economicInfo/real-rates-and-breakevens.html`

파싱 결과:

| Script | Type | 확인 내용 |
| ---: | --- | --- |
| 0 | `BlogPosting` | 템플릿 자동 구조화데이터 |
| 1 | `BreadcrumbList` | 템플릿 자동 구조화데이터 |
| 2 | `Article` | 수동 Article JSON-LD 정상 파싱 |
| 3 | `FAQPage` | 수동 FAQPage JSON-LD 정상 파싱, FAQ 8개 |

## 5. FAQ/JSON-LD parse 결과

로컬 Node 파싱 결과:

| File | JSON-LD scripts | Article `inLanguage` | visible FAQ | FAQPage mainEntity | Result |
| --- | ---: | --- | ---: | ---: | --- |
| `real-rates-and-breakevens.md` | 2 | `ko` | 8 | 8 | OK |
| `dca-vs-lumpsum-decision-rules.md` | 2 | `ko` | 8 | 8 | OK |
| `dca-fx-volatility-decomposition.md` | 2 | `ko` | 8 | 8 | OK |

## 6. ToolCta 렌더링 확인 결과

수정 전 built HTML에서 다음 문제가 확인됐다.

- `dca-vs-lumpsum-decision-rules.html`: `<toolcta type="dca">` 2개가 실제 HTML에 남음
- `dca-fx-volatility-decomposition.html`: `<toolcta type="dca">` 2개가 실제 HTML에 남음
- 태그가 React 컴포넌트로 렌더링되지 않고 뒤 문단/링크를 감싸는 형태였다.
- 원인은 `lang` 누락이 아니라 Markdown/HTML parser가 `<ToolCta />`를 React 컴포넌트로 치환하지 않는 구조다.

수정 후 built HTML 검사:

| File | `<toolcta>` tags | DCA calculator link |
| --- | ---: | --- |
| `.next/server/pages/ko/posts/personalFinance/dca-vs-lumpsum-decision-rules.html` | 0 | present |
| `.next/server/pages/ko/posts/personalFinance/dca-fx-volatility-decomposition.html` | 0 | present |

따라서 이번 polish에서는 `<ToolCta lang="ko" type="dca" />`로 바꾸지 않고, 렌더링되지 않는 raw 태그만 제거했다. 기존 `/tools/dca-calculator` 링크와 설명 문단은 유지했다.

## 7. 빌드/검증 결과

실행 명령:

- `npm.cmd run build`: PASS
  - Next.js build 성공
  - postbuild sitemap 생성 성공
  - 로그: `sitemap-ko.xml: 101 URLs`, `sitemap-en.xml: 98 URLs`, `en/sitemap.xml: 98 URLs`
- `node scripts\verify_seo_channel_split.js --local-server`: PASS
  - forbidden loc patterns: PASS
  - `/en/sitemap.xml` EN-only locs: PASS
  - 주요 URL canonical/self 검증: PASS
- `node scripts\verify_post_publish_urls.js --local-server` Batch 4 대상 5개 KO URL: PASS
  - 5개 모두 HTTP 200
  - canonical self: yes
  - robots blocked: no
  - meta noindex: no
  - sitemap: `main:yes`, `ko:yes`
  - RSS: yes
  - hreflang pair: yes
- `git diff --check`: PASS

postbuild/검증 중 재생성된 `public/sitemap*.xml`, `public/en/sitemap.xml`, `reports/seo-channel-split-url-check.md`는 이번 작업 범위 밖 산출물이므로 검증 후 되돌렸다.

## 8. 남은 이슈

- `content/posts/economicInfo/ko/war-theme-investing-price-chain-not-winners.md`, `content/posts/economicInfo/ko/oil-shock-to-usdkrw-korea-transmission.md`는 Batch 4 작업 변경분으로 남아 있으며, 이번 4.1 polish에서는 수정하지 않았다.
- `reports/ai-tone-content-audit-refresh-after-ko-batch3-2026-06-23.md`와 `reports/ai-tone-rewrite-ko-batch4.md`는 작업 전부터 untracked 상태로 남아 있다.
- `reports/*`가 gitignore 대상이면, 이 보고서를 커밋하려면 `git add -f reports/ai-tone-rewrite-ko-batch4-1-polish.md`가 필요할 수 있다.
