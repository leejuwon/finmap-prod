# Compound Calculator Head Keyword Bridge Audit

## Summary

- Test date: 2026-07-08
- Article JSON-LD consistency correction date: 2026-07-09
- Target head keyword: `복리 계산기`
- Target tool URL: `/tools/compound-interest`
- Final status: `PASS - 복리 계산기 헤드 키워드 브릿지 콘텐츠 및 내부링크 보강 완료`

이번 작업은 KO 검색 의도인 `복리 계산기`를 직접 받는 브릿지 콘텐츠를 만들고, 기존 KO 글에서 복리 계산기 도구로 향하는 내부링크 앵커를 점검한 작업이다. 계산기 코드, 계산 로직, SEO head, canonical, robots, sitemap 생성 정책은 수정하지 않았다.

## New Bridge Post

| Item | Value |
| --- | --- |
| File | `content/posts/personalFinance/ko/compound-calculator-guide.md` |
| URL | `https://www.finmaphub.com/posts/personalFinance/compound-calculator-guide` |
| Title | `복리 계산기 사용법: 월복리·연복리·적립식 결과 보는 법` |
| Description | `복리 계산기로 원금, 월 적립금, 수익률, 기간을 입력해 월복리·연복리·적립식 투자 결과를 비교하는 방법을 정리합니다. 세금, 수수료, 물가상승률과 추가 납입 시나리오를 해석하는 순서도 함께 확인하세요.` |
| Category | `personalFinance` / `재테크` |
| Language | `ko` |
| Hreflang policy | `hreflangEquivalent: false` |

## Link Placement

신규 글의 첫 문단 400자 안에 exact anchor를 배치했다.

- Exact anchor: `[복리 계산기](/tools/compound-interest)`
- Secondary variant anchor: `[월복리 계산기](/tools/compound-interest)`
- 신규 글 내부 tool 링크 수: 2개
- 신규 글에는 수동 Article/BlogPosting JSON-LD를 추가하지 않았다.

## Existing KO Posts Updated

아래 기존 KO 글은 `dateModified`를 `2026-07-08`로 갱신하고, `/tools/compound-interest` 내부링크 앵커를 더 구체적으로 조정했다.

| File | Change |
| --- | --- |
| `content/posts/personalFinance/ko/simple-vs-compound.md` | 도구 링크 앵커를 `투자 복리 계산기로 기간별 미래가치 계산하기`로 조정 |
| `content/posts/personalFinance/ko/annual-vs-monthly-compound.md` | `복리 계산 공식과 월복리 결과 비교하기` 앵커 추가 |
| `content/posts/personalFinance/ko/monthly-dca-10-year-result.md` | 과도한 도구 링크를 줄이고 브릿지 글로 일부 연결 |
| `content/posts/personalFinance/ko/how-much-per-month-for-100m.md` | opt-out 글의 도구 링크를 2개로 정리하고 브릿지 글 연결 추가 |
| `content/posts/personalFinance/ko/goal-amount-fast-strategy.md` | exact anchor `복리 계산기`를 자연 문장 안에 배치 |
| `content/posts/personalFinance/ko/personal-start-5steps.md` | absolute tool URL을 root-relative URL로 정리하고 브릿지 글 연결 추가 |
| `content/posts/personalFinance/ko/personal-finance-3pillars.md` | 도구 링크 앵커를 `투자 복리 계산기로 장기투자 미래가치 확인하기`로 조정 |
| `content/posts/personalFinance/ko/high-rate-debt-vs-invest-threshold-rule.md` | `투자 복리 계산기` 앵커 추가 |

## Anchor Distribution

`scripts/audit_compound_head_keyword_internal_links.js` 기준 KO 콘텐츠의 `/tools/compound-interest` 링크 분포는 다음과 같다.

| Anchor class | Count |
| --- | ---: |
| `복리 계산기` | 12 |
| `월복리 계산기` | 2 |
| `적립식 복리 계산기` | 1 |
| `복리 계산 공식` | 1 |
| `투자 복리 계산기` | 4 |
| 기타 문맥형 앵커 | 38 |

검증 결과:

- Exact anchor 최소 3개 조건: PASS, 12개
- Generic anchor: PASS, 0개
- 글별 동일 tool 링크 2개 이하: PASS
- 신규 글 title/description keyword stuffing: PASS
- 신규 글 본문 exact keyword 과다 반복: PASS, 8회

## KO-only Hreflang Handling

신규 브릿지 글은 KO-only 콘텐츠이므로 EN 글을 만들지 않았고, `hreflangEquivalent: false`를 frontmatter에 적용했다.

확인 결과:

- `lib/posts.js`는 frontmatter의 `hreflangEquivalent: false`를 post 객체에 전달한다.
- post detail page는 `post.hreflangEquivalent !== false` 값을 `SeoHead`의 `alternateLanguages`에 전달한다.
- `SeoHead`는 `alternateLanguages={false}`일 때 cross-language alternate를 출력하지 않는다.
- `next-sitemap.config.js`와 channel sitemap 생성은 `hreflangEquivalent: false` 글을 self-only alternate로 처리한다.
- `verify_post_publish_urls.js`에서 신규 URL의 hreflang pair는 `self-only`로 확인됐다.

## Sitemap Impact

Build 후 sitemap 카운트 변화:

| Sitemap | Result |
| --- | --- |
| `public/sitemap-0.xml` | 205 URLs, 신규 KO bridge URL 포함 |
| `public/sitemap-ko.xml` | 107 URLs, 신규 KO bridge URL 포함 |
| `public/sitemap-en.xml` | 98 URLs, 신규 KO bridge URL 미포함 |
| `public/en/sitemap.xml` | 98 URLs, 신규 KO bridge URL 미포함 |

EN sitemap의 URL 수는 유지됐다. 다만 `/en/category/personalFinance`의 `lastmod`는 personalFinance 카테고리 최신 글 정책에 따라 `2026-07-08`로 갱신됐다.

## Article JSON-LD dateModified Consistency

- 수동 Article JSON-LD `dateModified` 정합성 점검을 감사 스크립트에 추가했다.
- 브릿지 작업에서 수정한 KO 글의 frontmatter `dateModified`와 수동 Article/BlogPosting JSON-LD `dateModified`가 모두 일치한다.
- 기존 `dateModified`를 `2026-07-08`로 보정한 Article JSON-LD: 5개
- `dateModified`가 없어 `2026-07-08`을 추가한 Article JSON-LD: 2개
- 수동 Article JSON-LD가 없는 `how-much-per-month-for-100m.md`와 `compound-calculator-guide.md`에는 새 JSON-LD를 추가하지 않았다.
- FAQPage JSON-LD는 검사 대상에서 제외했으며 변경하지 않았다.

## Validation

| Command | Result |
| --- | --- |
| `node --check scripts\audit_compound_head_keyword_internal_links.js` | PASS |
| `node scripts\audit_compound_head_keyword_internal_links.js` | PASS |
| `npm.cmd run build` | PASS, 215/215 pages |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS, main 205 / KO 107 / EN 98 / `/en` 98 |
| `node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/posts/personalFinance/compound-calculator-guide https://www.finmaphub.com/posts/personalFinance/monthly-dca-10-year-result https://www.finmaphub.com/posts/personalFinance/how-much-per-month-for-100m` | PASS |
| `node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/posts/personalFinance/simple-vs-compound https://www.finmaphub.com/posts/personalFinance/annual-vs-monthly-compound https://www.finmaphub.com/posts/personalFinance/personal-finance-3pillars` | PASS |
| `node scripts\list_recent_changed_urls.js` | PASS, 신규 bridge URL 및 수정 KO 글 URL 확인 |
| `git diff --check` | PASS |

Note: `verify_post_publish_urls.js --local-server`를 URL 없이 실행하면 사용법 오류가 발생한다. 이후 대상 URL을 명시해 재실행했고 모두 PASS했다.

## Risks And Follow-up

- 신규 브릿지 글은 KO-only self-only 정책이므로 EN alternate를 의도적으로 만들지 않는다.
- 네이버/GSC 반영 후 `복리 계산기`, `월복리 계산기`, `적립식 복리 계산기`, `복리 계산 공식` 쿼리의 impressions, clicks, CTR을 모니터링한다.
- 브릿지 글에서 `/tools/compound-interest`로 이동하는 클릭률과 계산기 `tool_calculate` 이벤트 전환을 함께 확인한다.
- EN sitemap URL 수는 유지됐지만 category hub `lastmod` 갱신은 sitemap 생성 정책에 따른 정상 영향으로 본다.

## Final Decision

`PASS - 복리 계산기 헤드 키워드 브릿지 콘텐츠 및 내부링크 보강 완료`
