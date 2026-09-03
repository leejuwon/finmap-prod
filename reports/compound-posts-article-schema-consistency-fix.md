# 복리 포스트 Article JSON-LD 정합성 보정 보고서

작업 기준일: 2026-09-03

## 1. 작업 배경

네이버에서 `복리 계산기` 도구 페이지는 노출 후보로 잡히기 시작했지만, 복리 관련 포스트의 독립 노출 신호는 약했다. 직전 감사에서 sitemap/RSS/noindex는 정상인 반면, 일부 포스트 본문에 수동 `Article` JSON-LD가 남아 공통 포스트 렌더러의 자동 `BlogPosting`과 중복/불일치할 수 있는 문제가 확인됐다.

## 2. 발견된 Article/BlogPosting 이슈 요약

| Post | Previous issue |
| --- | --- |
| `/posts/personalFinance/simple-vs-compound` | manual `Article` 1개, 자동 `BlogPosting`과 headline/description 불일치 |
| `/posts/personalFinance/annual-vs-monthly-compound` | manual `Article` 1개, 자동 `BlogPosting`과 headline/description 불일치 |
| `/posts/personalFinance/monthly-dca-10-year-result` | manual `Article` 1개, 자동 `BlogPosting`과 headline/description 불일치 |
| `/posts/personalFinance/goal-amount-fast-strategy` | manual `Article` 1개, 자동 `BlogPosting`과 headline/description 불일치 |

## 3. 수정한 포스트 목록

- `content/posts/personalFinance/ko/simple-vs-compound.md`
- `content/posts/personalFinance/ko/annual-vs-monthly-compound.md`
- `content/posts/personalFinance/ko/monthly-dca-10-year-result.md`
- `content/posts/personalFinance/ko/goal-amount-fast-strategy.md`

## 4. 각 포스트별 조치 내용

| Post | Action |
| --- | --- |
| `compound-calculator-guide.md` | 수동 Article/BlogPosting 없음, 변경 없음 |
| `simple-vs-compound.md` | 수동 `Article` JSON-LD 제거, FAQPage 유지 |
| `annual-vs-monthly-compound.md` | 수동 `Article` JSON-LD 제거 |
| `monthly-dca-10-year-result.md` | 수동 `Article` JSON-LD 제거, FAQPage 유지 |
| `how-much-per-month-for-100m.md` | 수동 Article/BlogPosting 없음, FAQPage 유지, 변경 없음 |
| `goal-amount-fast-strategy.md` | 수동 `Article` JSON-LD 제거 |
| `what-is-cagr.md` | 수동 Article/BlogPosting 없음, 변경 없음 |

## 5. 수동 Article 제거 여부

대상 7개 포스트 모두 본문 내 수동 `Article`/`BlogPosting` 개수는 0개다. 포스트 공통 렌더러의 자동 `BlogPosting` 하나로 단일화했다.

## 6. FAQPage 유지 여부

| Post | FAQPage |
| --- | --- |
| `/posts/personalFinance/simple-vs-compound` | 유지 |
| `/posts/personalFinance/monthly-dca-10-year-result` | 유지 |
| `/posts/personalFinance/how-much-per-month-for-100m` | 유지 |

나머지 대상 포스트에는 수동 FAQPage가 없었다.

## 7. datePublished/dateModified 정합성

frontmatter의 `datePublished`와 `dateModified`는 수정하지 않았다. 새 검증 스크립트 기준으로 7개 포스트 모두 `datePublished`, `dateModified` 존재 및 noindex/draft 부재가 PASS다.

## 8. mainEntityOfPage 정합성

본문 내 수동 `Article`/`BlogPosting`이 모두 제거되어 수동 `mainEntityOfPage`는 남지 않았다. 공통 포스트 렌더러는 `canonicalUrl`을 기준으로 자동 `BlogPosting.url`과 `mainEntityOfPage.@id`를 생성한다.

## 9. sitemap/RSS/noindex 유지 확인

| Post | Sitemap | RSS latest 50 | Noindex |
| --- | --- | --- | --- |
| `/posts/personalFinance/compound-calculator-guide` | PASS | PASS | PASS |
| `/posts/personalFinance/simple-vs-compound` | PASS | PASS | PASS |
| `/posts/personalFinance/annual-vs-monthly-compound` | PASS | PASS | PASS |
| `/posts/personalFinance/monthly-dca-10-year-result` | PASS | PASS | PASS |
| `/posts/personalFinance/how-much-per-month-for-100m` | PASS | PASS | PASS |
| `/posts/personalFinance/goal-amount-fast-strategy` | PASS | PASS | PASS |
| `/posts/personalFinance/what-is-cagr` | PASS | PASS | PASS |

## 10. 계산기 페이지 미수정 확인

`pages/tools/compound-interest.js` 및 복리 계산기 관련 컴포넌트/코어 로직/package/sitemap 정책은 수정하지 않았다. 이번 변경은 포스트 markdown의 수동 Article 제거와 검증 스크립트 추가에 한정된다.

## 11. 검증 결과

| Command | Result |
| --- | --- |
| `node --check scripts\verify_compound_posts_article_schema_consistency.js` | PASS |
| `node scripts\verify_compound_posts_article_schema_consistency.js` | PASS, 7개 포스트 모두 Article/BlogPosting 0개 |
| `node --check scripts\audit_naver_compound_posts_independent_visibility.js` | PASS |
| `node scripts\audit_naver_compound_posts_independent_visibility.js` | PASS 실행, 최종 판정 HOLD로 변경 |
| `npm.cmd run build` | PASS, 223 pages |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS, sitemap-ko 111 URLs |
| `node scripts\verify_post_publish_urls.js --local-server ...` | PASS, 7개 URL 모두 200/self canonical/noindex 없음/sitemap/RSS 포함 |
| `git diff --check` | PASS, 줄끝 경고만 출력 |

## 12. 최종 판정

PASS - 복리 포스트 Article JSON-LD 정합성 보정 완료
