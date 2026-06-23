# Finmap AI-like Prose Rewrite - KO Batch 3.1 Polish

Date: 2026-06-23

## Summary

- Scope: KO Batch 3 대상 5개 글의 메타 정합성, 라벨 반복, Tool CTA 정합성 미세 보정
- Large rewrite: not performed
- SEO routing/canonical/hreflang/robots/sitemap/SeoHead policy: not changed
- Build result: PASS

## 실제 수정 파일

| File | Changes |
| --- | --- |
| `content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md` | Article JSON-LD `datePublished`를 frontmatter와 같은 `2026-01-29`로 보정. `description`과 Article JSON-LD description을 본문 구조에 맞게 `30분 점검 순서` 중심으로 보정. 본문 `ToolCta type="cagr"`를 제거하고 DSR/LTV 계산기 링크 문장으로 교체해 frontmatter `tool: ["dsrLtv","goal"]`와 맞춤. |
| `content/posts/economicInfo/ko/war-risk-oil-supply-insurance-shipping.md` | frontmatter/Article JSON-LD description의 `체크리스트를 제공합니다`를 `관측 순서를 정리합니다`로 보정. Article JSON-LD `mainEntityOfPage.@id`를 절대 URL로 보정. Article JSON-LD author를 기존 수동 Article 관례에 맞춰 `Organization/FinMap`으로 보정. |
| `content/posts/investingInfo/ko/sp500-impact-on-korea-kospi.md` | description과 Article JSON-LD description을 `전이 경로와 다음 거래일 관측 순서` 중심으로 보정. 상단 `요약 (10문장)`, `한 문단 요약` 라벨을 각각 `다음 거래일 관측 포인트`, `전이 경로 한 문단`으로 완화. |
| `content/posts/economicInfo/ko/yield-curve-2s10s-3m10y-recession-reading.md` | `여기까지 한 줄 결론`을 `해석 기준`으로 변경. `오해 교정` 섹션명을 `자주 헷갈리는 지점`으로 변경. 상단 checklist 표현 일부를 `해석 순서`, `관측표`로 분산. |

## 수정하지 않은 파일

| File | Reason |
| --- | --- |
| `content/posts/investingInfo/ko/bond-etf-duration-drives-returns.md` | title/description/Article JSON-LD date/description/mainEntityOfPage/author 정합성이 양호했고, FAQ visible 질문 8개와 FAQPage JSON-LD 질문명 8개가 모두 일치했다. 새 수정 불필요. |

## 메타/JSON-LD 정합성

| File | Result |
| --- | --- |
| `bond-etf-duration-drives-returns.md` | frontmatter/Article `datePublished=2026-01-18`, `dateModified=2026-06-19` 일치. |
| `war-risk-oil-supply-insurance-shipping.md` | frontmatter/Article `datePublished=2026-01-26`, `dateModified=2026-06-19` 일치. Article description, author, absolute `mainEntityOfPage.@id` 보정 완료. |
| `sp500-impact-on-korea-kospi.md` | frontmatter/Article `datePublished=2026-01-04`, `dateModified=2026-06-19` 일치. description 정합화 완료. |
| `yield-curve-2s10s-3m10y-recession-reading.md` | frontmatter/Article `datePublished=2026-01-16`, `dateModified=2026-06-19` 일치. |
| `apt-dashboard-home-goal-roadmap.md` | frontmatter/Article `datePublished=2026-01-29`, `dateModified=2026-06-19` 일치. description 정합화 완료. |

## Tool CTA 정합성

| File | Result |
| --- | --- |
| `apt-dashboard-home-goal-roadmap.md` | frontmatter `tool: ["dsrLtv","goal"]`. 본문은 `ToolCta type="goal"` 유지, `ToolCta type="cagr"` 제거, DSR/LTV 계산기 링크 문장 추가. `ToolCta` 컴포넌트에 존재하지 않는 `dsrLtv` 타입은 만들지 않았다. |
| Other 4 files | 이번 polish 범위에서 Tool CTA 불일치 없음. |

## 남은 Template Label Count

| Pattern | Count |
| --- | ---: |
| `여기까지 한 줄 결론` | 0 |
| `오해 교정` | 0 |
| `요약 (10문장)` | 0 |
| `한 문단 요약` | 0 |
| `체크리스트` | 4 |
| `관측 기준` | 6 |
| `해석 기준` | 1 |
| `관측 순서` | 8 |
| `점검 순서` | 3 |
| `관측표` | 1 |

남은 `체크리스트`는 일부 기존 이미지 alt/figcaption, FAQ 답변, 개별 글의 의미상 필요한 heading에 남아 있어 추가 제거하지 않았다.

## FAQ / JSON-LD Check

| File | JSON-LD parse | Visible FAQ | FAQPage JSON-LD | Mismatch |
| --- | ---: | ---: | ---: | ---: |
| `bond-etf-duration-drives-returns.md` | 2 blocks PASS | 8 | 8 | 0 |
| `war-risk-oil-supply-insurance-shipping.md` | 2 blocks PASS | 8 | 8 | 0 |
| `sp500-impact-on-korea-kospi.md` | 2 blocks PASS | 5 | 5 | 0 |
| `yield-curve-2s10s-3m10y-recession-reading.md` | 2 blocks PASS | 8 | 8 | 0 |
| `apt-dashboard-home-goal-roadmap.md` | 2 blocks PASS | 8 | 8 | 0 |

## Verification

| Command | Result |
| --- | --- |
| `npm.cmd run build` | PASS. Next build compiled successfully and generated 209/209 static pages. Postbuild sitemap files were restored because sitemap changes are outside this task. |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS. Sitemap policy PASS, EN required URLs 16/16, sampled URLs PASS. Generated common report was restored because it is outside this task's commit target. |
| `node scripts\verify_post_publish_urls.js --local-server <5 KO URLs>` | PASS. All 5 target KO URLs returned 200, self-canonical, not blocked, no noindex, sitemap/RSS included, hreflang pair present. |
| FAQ/JSON-LD parse check | PASS. 5 files parsed, FAQ mismatch 0. |

## Notes

- This was a polish pass only. No new post, EN post, route, sitemap, robots, SeoHead, canonical, or hreflang changes were made.
- Existing unrelated working-tree changes were left untouched.
