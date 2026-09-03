# 복리 포스트 독립 노출 최소 보정 보고서

작업 기준일: 2026-09-03

## 1. 작업 배경

네이버에서 `복리 계산기` 도구 페이지가 1페이지 마지막에 노출되기 시작한 상태를 보호하면서, 복리 관련 포스트들이 `복리 계산기 사용법`, `단리 vs 복리`, `연복리 월복리`, `월 50만원 적립식 투자`, `목표금액 복리 계산` 같은 독립 검색 의도를 맡을 수 있도록 최소 보정했다.

## 2. 복리 계산기 1페이지 성과 보호 원칙

- 복리 계산기 `seoTitle`, `seoDesc`, H1, FAQ, 계산 로직, GA4 이벤트는 수정하지 않았다.
- `pages/tools/compound-interest.js`는 하단 관련 글 영역에 KO 전용 허브 글 링크 1개만 추가했다.
- sitemap/RSS/robots 생성 정책, canonical/hreflang 정책, package.json, 공통 Article/BlogPosting 렌더러는 수정하지 않았다.

## 3. 수정 파일 목록

- `pages/tools/compound-interest.js`
- `content/posts/personalFinance/ko/compound-calculator-guide.md`
- `content/posts/personalFinance/ko/simple-vs-compound.md`
- `content/posts/personalFinance/ko/annual-vs-monthly-compound.md`
- `content/posts/personalFinance/ko/monthly-dca-10-year-result.md`
- `content/posts/personalFinance/ko/how-much-per-month-for-100m.md`
- `content/posts/personalFinance/ko/goal-amount-fast-strategy.md`
- `content/posts/personalFinance/ko/what-is-cagr.md`
- `scripts/verify_compound_posts_independent_visibility_minimal_fix.js`
- `scripts/audit_naver_compound_posts_independent_visibility.js`
- `reports/naver-compound-posts-independent-visibility-audit.md`
- `reports/compound-posts-independent-visibility-minimal-fix.md`

## 4. 계산기 페이지 변경 범위

`pages/tools/compound-interest.js`의 하단 `추천 가이드 글` 영역에 KO locale일 때만 보이는 링크 1개를 추가했다.

| Link | Anchor | Placement |
| --- | --- | --- |
| `/posts/personalFinance/compound-calculator-guide` | 복리 계산기 사용법 보기 | 하단 추천 가이드 글 영역 |

영어 대응 포스트가 없어서 `relatedGuides` 공통 배열에는 추가하지 않고, KO 전용 직접 링크로 제한했다.

## 5. compound-calculator-guide 허브 보강 내용

- 상단 500자 안에 `FinMap 복리 계산기 사용법` 문장을 자연스럽게 추가했다.
- `복리 계산 방법을 이어서 볼 글` H2를 추가했다.
- 단리/복리, 연복리/월복리, 월 50만원 적립식, 1억 월 납입, 목표금액 복리 글로 연결되는 클러스터 링크 5개를 추가했다.

## 6. 포스트별 담당 검색 의도 보강 내용

| Post | Minimal fix |
| --- | --- |
| `simple-vs-compound` | 상단에 `단리와 복리 차이`, `단리 vs 복리` 목적 문장 추가 |
| `annual-vs-monthly-compound` | 상단에 `연복리 월복리`, `월복리 연복리 차이` 목적 문장 추가 |
| `monthly-dca-10-year-result` | 상단에 `월 50만원 적립식 투자`, `적립식 복리 계산`, `월 적립식 투자 10년` 목적 문장 추가 |
| `how-much-per-month-for-100m` | 상단에 `1억 모으기 월 납입`, `목표금액 복리 계산` 목적 문장 추가, 초반 CTA를 설명 문단 뒤로 이동 |
| `goal-amount-fast-strategy` | 상단에 `목표금액 모으는 법`, `복리로 목표금액` 문장 추가, H2에 `목표금액 복리 계산` 반영 |
| `what-is-cagr` | 상단에 `CAGR 계산법`, `CAGR 계산식`, `연평균 수익률 계산` 기준 문장 추가 |

## 7. 포스트 간 내부링크 변경

| Source | Added/changed links |
| --- | --- |
| `compound-calculator-guide` | 복리 클러스터 포스트 5개로 허브 링크 추가 |
| `annual-vs-monthly-compound` | `monthly-dca-10-year-result` 링크 1개 추가 |

다른 포스트는 이미 관련 글 링크가 있어 중복 추가하지 않았다.

## 8. 계산기 → 허브 글 역링크 추가 여부

PASS. 계산기 하단 관련 글 영역에서 `/posts/personalFinance/compound-calculator-guide`로 가는 KO 전용 링크 1개가 확인된다.

## 9. 브랜드 신호 보강 내용

대상 7개 포스트 상단 또는 상단 근처에 서로 다른 문장으로 `FinMap`을 1회 내외 자연스럽게 포함했다. 제목과 frontmatter description에는 `FinMap`을 억지로 넣지 않았다.

## 10. Article/BlogPosting 중복 재발 없음 확인

`node scripts\verify_compound_posts_article_schema_consistency.js` 기준 대상 7개 포스트 모두 manual `Article`/`BlogPosting` 0개다. FAQPage는 `simple-vs-compound`, `monthly-dca-10-year-result`, `how-much-per-month-for-100m`에서 유지됐다.

## 11. sitemap/RSS/noindex 유지 확인

| Check | Result |
| --- | --- |
| 대상 7개 포스트 sitemap-ko 포함 | PASS |
| 대상 7개 포스트 RSS 최신 50 후보 포함 | PASS |
| 대상 7개 포스트 draft/noindex 없음 | PASS |
| build page count | PASS, 223 pages |
| sitemap-ko URL count | PASS, 111 URLs |

## 12. 검증 결과

| Command | Result |
| --- | --- |
| `node --check scripts\verify_compound_posts_independent_visibility_minimal_fix.js` | PASS |
| `node scripts\verify_compound_posts_independent_visibility_minimal_fix.js` | PASS, 0 failing items |
| `node scripts\audit_naver_compound_posts_independent_visibility.js` | PASS 실행, technical fail 0개, warning 8개, 최종 HOLD |
| `node scripts\verify_compound_posts_article_schema_consistency.js` | PASS, 0 failing posts |
| `npm.cmd run build` | PASS, 223 pages, sitemap-ko 111 URLs |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `node scripts\verify_post_publish_urls.js --local-server ...` | PASS, 계산기와 대상 7개 포스트 모두 OK |
| `git diff --check` | PASS, 줄끝 경고만 출력 |

## 13. 최종 판정

PASS - 복리 포스트 독립 노출 최소 보정 완료
