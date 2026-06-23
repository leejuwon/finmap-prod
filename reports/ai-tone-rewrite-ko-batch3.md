# Finmap AI-like Prose Rewrite - KO Batch 3

Date: 2026-06-19

## Scope

Batch 3는 `reports/ai-tone-content-audit-refresh-2026-06-19.md` 기준 KO High 후보 5개만 수정했다. 새 글, EN 글, sitemap/robots/routing/SeoHead 구조는 수정하지 않았다.

## Modified Files

| File | Main changes | FAQ/checklist/bottom-line adjustment | Concrete additions |
| --- | --- | --- | --- |
| `content/posts/investingInfo/ko/bond-etf-duration-drives-returns.md` | 과장형 title/description을 금리 1%p 민감도 중심으로 낮추고 `dateModified` 및 Article JSON-LD를 맞춤 | 10문장 체크리스트를 "내 채권 ETF 룰북" 표로 통합, FAQ 질문명과 FAQPage JSON-LD 정합화 | 듀레이션 3년/7년/10년 ETF의 금리 +1%p/-1%p 민감도 표 추가 |
| `content/posts/economicInfo/ko/war-risk-oil-supply-insurance-shipping.md` | 전쟁 리스크를 공급 차질, 보험료/운임, 재고/기대 프리미엄 경로로 재정리 | checklist/bottom-line 반복을 사건 후 관측 순서 표로 대체, FAQ 번호 표기를 JSON-LD 질문명과 맞춤 | 생산/수출/정제, 보험료/운임, 재고/정책 기대, 한국 전이 경로를 순서대로 보는 표 추가 |
| `content/posts/investingInfo/ko/sp500-impact-on-korea-kospi.md` | broad market 설명을 S&P500 -> 달러/금리 -> 외국인 수급 -> 업종 흐름으로 재구성 | 원인 분류 checklist를 수급/금리/실적 재평가 표로 통합, FAQPage JSON-LD를 보이는 FAQ와 일치시킴 | 다음 거래일 4단계 관측 순서와 업종별 반응 표 추가 |
| `content/posts/economicInfo/ko/yield-curve-2s10s-3m10y-recession-reading.md` | 2s10s, 3m10y, 재스티프닝을 분리해서 설명하도록 문단 리듬 조정 | 체크리스트를 7분 해석 순서 표로 통합, FAQ 질문 문구를 2s10s/3m10y 기준으로 정리 | 2s10s 역전, 3m10y 역전, 재스티프닝 해석표 추가 |
| `content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md` | 내 집 마련 로드맵을 예산, 대출, 현금흐름, 관심 지역 대시보드 순서로 구체화 | 15분/60분/1주 액션 플랜을 30분 점검 순서 표로 통합 | 후보 지역/단지 10개 제한, 가격 밴드, DSR/LTV, 현금흐름 스트레스, 실행 문장 표 추가 |

## Repeated Phrase Cleanup

대상 표현 검색 결과: 0건

- `핵심은`
- `중요합니다`
- `도움이 됩니다`
- `확인할 수 있습니다`
- `볼 수 있습니다`
- `정리하면`
- `결론적으로`
- `단순히`
- `한 문장으로 정리하면`
- `투자자는 신중하게`
- `본인의 상황에 맞게`

## SEO Elements Preserved

- `slug`, `link`, `category`, `postCategory`, `lang` 유지
- canonical/hreflang/robots/sitemap 정책 수정 없음
- 기존 내부링크 삭제 없음
- FAQPage JSON-LD가 없는 글에 신규 추가하지 않음
- build/postbuild로 재생성된 `public/sitemap*.xml`, `public/en/sitemap.xml`, `reports/seo-channel-split-url-check.md`는 검증 후 복원

## Title / Description / Tool / Image Notes

- `bond-etf-duration-drives-returns.md`: title/description을 검색 의도에 맞춰 완화했고 Article JSON-LD headline/description/dateModified를 맞춤.
- `war-risk-oil-supply-insurance-shipping.md`: title/description/tool/image는 유지, Article JSON-LD dateModified만 갱신.
- `sp500-impact-on-korea-kospi.md`: title/description/tool/image는 유지, FAQPage JSON-LD 질문 세트를 보이는 FAQ 기준으로 정리.
- `yield-curve-2s10s-3m10y-recession-reading.md`: title/description/tool/image는 유지, Article JSON-LD description/dateModified와 FAQ 질문명을 정합화.
- `apt-dashboard-home-goal-roadmap.md`: tool을 `["goal","cagr"]`에서 `["dsrLtv","goal"]`로 조정. `dsrLtv`는 게시글 상세 템플릿과 ToolBacklinkKit에 존재하는 ID다. 다만 카테고리 목록의 TOOL_LABELS에는 `dsrLtv` 라벨이 없어, 카테고리 카드 노출은 별도 확인 후보로 남긴다.

## FAQ / JSON-LD Check

| File | Visible FAQ | FAQPage JSON-LD | JSON-LD parse |
| --- | ---: | ---: | --- |
| `bond-etf-duration-drives-returns.md` | 8 | 8 | OK, 2 scripts |
| `war-risk-oil-supply-insurance-shipping.md` | 8 | 8 | OK, 2 scripts |
| `sp500-impact-on-korea-kospi.md` | 5 | 5 | OK, 2 scripts |
| `yield-curve-2s10s-3m10y-recession-reading.md` | 8 | 8 | OK, 2 scripts |
| `apt-dashboard-home-goal-roadmap.md` | 8 | 8 | OK, 2 scripts |

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm.cmd run build` | PASS | Next.js build succeeded. postbuild generated sitemap files; restored after verification. |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS | `sitemap-ko.xml` 101 URLs, `sitemap-en.xml` 98 URLs, `/en/sitemap.xml` 98 URLs, forbidden loc patterns 0, EN required static URLs 16/16. |
| `node scripts\verify_post_publish_urls.js --local-server ...5 KO URLs` | PASS | All 5 URLs returned 200, self-canonical yes, robots blocked no, meta noindex no, sitemap main/ko yes, RSS yes, hreflang pair yes. |
| FAQ/JSON-LD parse check | PASS | All target files parsed with `ConvertFrom-Json`; visible FAQ question counts and JSON-LD question names match. |
| repeated phrase `rg` check | PASS | Target phrase list returned no matches. |
| `git diff --check` | PASS | Only CRLF conversion warnings from Git, no whitespace errors. |

## Remaining Notes

- `apt-dashboard-home-goal-roadmap.md`의 `dsrLtv` tool ID는 상세 페이지/ToolBacklinkKit 기준으로 유효하지만, 카테고리 목록 라벨 매핑에는 아직 없다. 이번 요청은 콘텐츠 5개와 리포트로 제한되어 코드 수정은 하지 않았다.
- `reports/ai-tone-content-audit-refresh-2026-06-19.md`는 작업 전부터 untracked 상태로 남아 있으며, 이번 Batch 3에서 수정하지 않았다.
