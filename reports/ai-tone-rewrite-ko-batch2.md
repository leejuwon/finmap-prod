# Finmap AI-like Prose Rewrite - KO Batch 2

Date: 2026-06-19

## Summary

Batch 2에서는 KO 콘텐츠 5개 글의 SEO 구조를 유지한 상태에서 본문 문체를 더 구체적인 Finmap 스타일로 다듬었다.

- 새 글, EN 글, sitemap/robots/routing/SeoHead 수정 없음
- slug/link/category/postCategory/lang/canonical/hreflang/noindex 정책 변경 없음
- `dateModified`는 5개 글 모두 `2026-06-19`로 갱신
- 수동 Article JSON-LD가 있는 글은 `dateModified`를 frontmatter와 맞춤
- FAQPage JSON-LD가 있는 글은 visible FAQ 질문 수/문구 정합성 확인 완료
- build/postbuild로 재생성된 sitemap 산출물 변경은 검증 후 되돌림

## Modified Files

| File | Main changes |
|---|---|
| `content/posts/economicInfo/ko/interest-rate-basics.md` | 정책금리/시장금리/상품금리를 예금자·대출자·채권/주식 투자자 관점으로 다시 연결. 독자 상황별 금리 체크 표 추가. 반복되는 "핵심은/정리하면/중요합니다" 계열 문구 완화. |
| `content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md` | 서울·경기·인천을 예산 압박, 대출, 현금흐름 질문으로 재정리. 지역별 예산 압박 표 추가. 관련 tool 메타를 기존 ID인 `dsrLtv`로 조정. |
| `content/posts/investingInfo/ko/modern-6040-risk-budget.md` | 현대형 60/40을 금리·물가·주식/채권 동반 하락 환경에서 읽도록 표 추가. "한 줄 결론" 반복을 운영 기준 문장으로 변경. |
| `content/posts/economicInfo/ko/tariffs-growth-margins-fx-package-shock.md` | 관세 충격을 성장·마진·환율·물가 경로별 관측 항목으로 구체화. 한국 투자자가 먼저 볼 기업/시장 지표 표 추가. |
| `content/posts/investingInfo/ko/cagr-7percent-reality-check.md` | "연 7% 복리" 검색 의도에 바로 답하도록 intro와 description/seoDescription 보강. CAGR 7%를 기간·납입액·세금·손실 구간 기준으로 해석하도록 문체 개선. |

## Reduced Repetitive Expressions

대상 5개 파일에서 아래 표현을 재점검했고, 반복 위치를 중심으로 완화했다.

- `이 글에서는`
- `핵심은`
- `중요합니다`
- `도움이 됩니다`
- `확인할 수 있습니다`
- `볼 수 있습니다`
- `정리하면`
- `본인의 상황에 맞게`
- `투자자는 신중하게`
- `한 문장으로 정리하면`
- `결론적으로`
- `단순히`

최종 `rg` 점검 결과: 대상 5개 파일에서 위 패턴 0건.

## Added Concrete Examples / Action Sentences

| File | Added or strengthened |
|---|---|
| `interest-rate-basics.md` | 예금자, 변동금리 대출자, 채권 투자자, 주식 투자자별로 먼저 볼 금리와 바로 할 일을 표로 추가. |
| `seoul-gyeonggi-incheon-risk-budget-framework.md` | 서울 핵심지, 경기 주요 생활권, 인천/외곽 선택지를 예산 압박과 DSR/LTV 행동 문장으로 연결. |
| `modern-6040-risk-budget.md` | 금리 급등, 인플레이션 재상승, 경기 둔화, 주식·채권 동반 하락 환경별 운영 문장 추가. |
| `tariffs-growth-margins-fx-package-shock.md` | 수출기업 마진, 주문·재고, 원/달러, 국내 물가에서 먼저 볼 문장/지표 추가. |
| `cagr-7percent-reality-check.md` | 월 50만 원, 30년, 7%/세후 5% 비교 관점과 CAGR/목표 자산 시뮬레이터 입력 흐름 구체화. |

## Title / Description / Tool / Image Changes

| File | Title | Description / seoDescription | Tool | Image / cover |
|---|---|---|---|---|
| `interest-rate-basics.md` | 유지 | 유지 | 유지 `["comp","goal"]` | 변경 없음 |
| `seoul-gyeonggi-incheon-risk-budget-framework.md` | 유지 | 유지 | `["comp"]` -> `["dsrLtv"]` | 변경 없음 |
| `modern-6040-risk-budget.md` | 유지 | 유지 | 유지 | 변경 없음 |
| `tariffs-growth-margins-fx-package-shock.md` | 유지 | 유지 | 유지 | 변경 없음 |
| `cagr-7percent-reality-check.md` | 유지 | description/seoDescription만 검색 의도에 맞게 최소 보정 | 유지 | 변경 없음 |

## Preserved SEO Elements

- slug 유지
- link 유지
- category/postCategory/lang 유지
- canonical/hreflang/robots/noindex 구조 변경 없음
- sitemap 생성 정책 변경 없음
- 내부링크 삭제 없음
- KO root URL 구조 유지
- EN 파일 수정 없음

## FAQ / JSON-LD Check

정적 점검 결과:

| File | JSON-LD parse | FAQ visible count | FAQPage JSON-LD count | Result |
|---|---:|---:|---:|---|
| `interest-rate-basics.md` | PASS | 5 | 5 | PASS |
| `seoul-gyeonggi-incheon-risk-budget-framework.md` | PASS | 8 | 8 | PASS |
| `modern-6040-risk-budget.md` | PASS | 8 | 8 | PASS |
| `tariffs-growth-margins-fx-package-shock.md` | PASS | 8 | 8 | PASS |
| `cagr-7percent-reality-check.md` | PASS | 0 | 0 | 기존 구조 유지 |

Article JSON-LD:

- 5개 글 모두 parse PASS
- 수동 Article JSON-LD가 있는 글은 `dateModified: 2026-06-19`로 정합화
- 기존 Article image가 있는 글은 cover/본문 이미지 경로와 크게 어긋나지 않음
- `cagr-7percent-reality-check.md`, `interest-rate-basics.md`는 기존처럼 Article JSON-LD image 없음

## Validation Results

Commands run:

```bash
npm.cmd run build
node scripts\verify_seo_channel_split.js --local-server
node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/posts/economicInfo/interest-rate-basics https://www.finmaphub.com/posts/investingInfo/seoul-gyeonggi-incheon-risk-budget-framework https://www.finmaphub.com/posts/investingInfo/modern-6040-risk-budget https://www.finmaphub.com/posts/economicInfo/tariffs-growth-margins-fx-package-shock https://www.finmaphub.com/posts/investingInfo/cagr-7percent-reality-check
git diff --check
```

Results:

- `npm.cmd run build`: PASS
- `postbuild`: sitemap generation completed
  - `sitemap-ko.xml`: 101 URLs
  - `sitemap-en.xml`: 98 URLs
  - `en/sitemap.xml`: 98 URLs
- `verify_seo_channel_split.js --local-server`: PASS
  - sitemap forbidden loc patterns: PASS
  - `/en/sitemap.xml` present, EN-only locs PASS, `sitemap-en.xml` match PASS
- `verify_post_publish_urls.js --local-server`: 5/5 PASS
  - HTTP 200
  - canonical self: yes
  - robots blocked: no
  - meta noindex: no
  - sitemap: main yes, ko yes
  - RSS: yes
  - hreflang pair: yes
- `git diff --check`: PASS

Generated artifacts:

- `public/en/sitemap.xml`
- `public/sitemap-0.xml`
- `public/sitemap-en.xml`
- `public/sitemap-ko.xml`
- `reports/seo-channel-split-url-check.md`

위 파일들은 build/verification 과정에서 재생성되었고, 이번 작업 커밋 대상에서 제외하기 위해 되돌렸다.

## Remaining Notes

- 이번 작업은 문체와 일부 메타 정합성 개선에 한정했다.
- `seoul-gyeonggi-incheon-risk-budget-framework.md`의 tool 메타는 부동산 예산/대출 맥락에 맞춰 `dsrLtv`로 조정했다.
- `cagr-7percent-reality-check.md`는 기존처럼 FAQPage JSON-LD가 없으므로 새로 추가하지 않았다.
- 줄 끝 공백은 대상 5개 파일에서 함께 정리했다.
