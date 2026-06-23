# Finmap AI-like Prose Rewrite - KO Batch 4

작성일: 2026-06-23

## 1. 수정 파일 목록

| File | 변경 범위 |
| --- | --- |
| `content/posts/economicInfo/ko/real-rates-and-breakevens.md` | 본문 요약 구조, 관측 순서 표, description/dateModified, Article JSON-LD |
| `content/posts/economicInfo/ko/war-theme-investing-price-chain-not-winners.md` | 가격 체인 관측표, 반복 라벨 완화, description/dateModified, Article JSON-LD |
| `content/posts/personalFinance/ko/dca-vs-lumpsum-decision-rules.md` | if/then 판단표, checklist 통합, description/dateModified, FAQPage 질문명 |
| `content/posts/personalFinance/ko/dca-fx-volatility-decomposition.md` | 원화 수익률 숫자 예시, 운영표 2개, description/dateModified, FAQPage 답변 정합화 |
| `content/posts/economicInfo/ko/oil-shock-to-usdkrw-korea-transmission.md` | 한국 환율 전이 관측표, checklist 통합, description/dateModified, Article JSON-LD |

## 2. 파일별 주요 수정 내용

### real-rates-and-breakevens

- `dateModified`를 `2026-06-23`으로 갱신했다.
- `description`과 수동 Article JSON-LD `description/dateModified`를 맞췄다.
- 상단의 9개 요약 bullet과 “여기까지 한 줄 결론” 라벨을 줄이고, `실질금리 x BEI` 4분면 표로 재구성했다.
- 하단 checklist bullet을 `명목금리 -> BEI -> 실질금리 -> 달러/신용스프레드` 관측 순서 표로 바꿨다.
- FAQ 답변의 반복 표현을 줄이고, FAQPage JSON-LD 답변도 같은 방향으로 맞췄다.

### war-theme-investing-price-chain-not-winners

- `dateModified`를 `2026-06-23`으로 갱신했다.
- `description`과 수동 Article JSON-LD `description/dateModified`를 맞췄다.
- “수혜주/승자 찾기” 프레임을 유지하되, 본문 결론 라벨을 `관측 기준`, `가격 연결`, `리스크 예산 기준`으로 완화했다.
- 15분 checklist를 `뉴스 유형별 먼저 볼 가격` 표로 통합했다.
- 내부링크는 유지하되, 앵커에서 template-heavy한 “체크리스트” 표현을 줄였다.

### dca-vs-lumpsum-decision-rules

- `dateModified`를 `2026-06-23`으로 갱신했다.
- `description`과 수동 Article JSON-LD `description/dateModified`를 맞췄다.
- 기존 의사결정 표를 `if/then` 성격으로 강화하고, 하단 checklist 2개를 하나의 실행 판단표로 통합했다.
- FAQPage JSON-LD 질문명 3개를 visible FAQ 질문과 일치시켰다.
- 이미지 캡션의 “선택의 핵심은” 표현을 “선택은 ... 규칙” 문장으로 낮췄다.

### dca-fx-volatility-decomposition

- `dateModified`를 `2026-06-23`으로 갱신했다.
- `description`과 수동 Article JSON-LD `description/dateModified`를 맞췄다.
- `원자산 +5%, 환율 -3%` 숫자 예시 표를 추가해 원화 수익률 분해를 바로 계산할 수 있게 했다.
- “오늘 바로 적용하는 체크리스트 2개”를 `운영표 2개`로 바꾸고, bullet 반복을 표 중심으로 정리했다.
- FAQ visible 답변과 FAQPage JSON-LD 답변 일부를 함께 조정했다.

### oil-shock-to-usdkrw-korea-transmission

- `dateModified`를 `2026-06-23`으로 갱신했다.
- `description`과 수동 Article JSON-LD `description/dateModified`를 맞췄다.
- 기존 checklist 2개를 `한국 환율 전이 관측 순서` 표로 통합했다.
- 내용 초점을 `war-risk-oil-supply-insurance-shipping`의 운임/보험료 프레임과 겹치지 않도록 한국 수입물가, USD/KRW, 외국인 수급, KOSPI 업종 전이로 좁혔다.
- FAQPage JSON-LD 답변 일부를 visible FAQ의 방향과 맞췄다.

## 3. 줄인 반복 표현

대상 표현:

- `이 글에서는`
- `핵심은`
- `중요합니다`
- `도움이 됩니다`
- `확인할 수 있습니다`
- `볼 수 있습니다`
- `정리하면`
- `결론적으로`
- `단순히`
- `여기까지 한 줄 결론`
- `요약 (10문장)`
- `범위/한계`
- `체크리스트`
- `루틴`
- `투자자는 신중하게`
- `본인의 상황에 맞게`

점검 결과:

- 대상 5개 파일 기준 `rg` 재점검 결과: 0 hits
- 남긴 구조: FAQ 자체는 유지했다. 단, 본문 checklist/bottom-line 성격의 반복은 관측표/판단표로 흡수했다.

## 4. 추가한 숫자 예시/표/계산기 또는 관측 순서

| File | 추가/강화한 구조 |
| --- | --- |
| `real-rates-and-breakevens.md` | 실질금리 상승/하락 + BEI 상승/하락 4분면 표, 4단계 금리 뉴스 관측 순서 |
| `war-theme-investing-price-chain-not-winners.md` | 뉴스 유형별 먼저 볼 가격/지표, 비용 고리, if/then 판단표 |
| `dca-vs-lumpsum-decision-rules.md` | 비상금·부채이자율·손실 허용폭·투자기간·소득 안정성 기반 실행 판단표 |
| `dca-fx-volatility-decomposition.md` | 원자산 +5%, 환율 -3% 기준 원화 수익률 계산표 |
| `oil-shock-to-usdkrw-korea-transmission.md` | 유가 -> 수입물가 -> 무역수지 -> USD/KRW -> KOSPI 업종 전이 관측표 |

계산기/Tool CTA는 기존 구조를 유지했다.

## 5. title/description/tool/image 변경 여부

| File | title | description | tool | image/cover |
| --- | --- | --- | --- | --- |
| `real-rates-and-breakevens.md` | 변경 없음 | 변경 | 변경 없음 | 변경 없음 |
| `war-theme-investing-price-chain-not-winners.md` | 변경 없음 | 변경 | 변경 없음 (`cagr` 유지) | 변경 없음 |
| `dca-vs-lumpsum-decision-rules.md` | 변경 없음 | 변경 | 변경 없음 (`dca` 유지) | 변경 없음 |
| `dca-fx-volatility-decomposition.md` | 변경 없음 | 변경 | 변경 없음 (`dca`, `cagr` 유지) | 변경 없음 |
| `oil-shock-to-usdkrw-korea-transmission.md` | 변경 없음 | 변경 | 변경 없음 (`dca` 유지) | 변경 없음 |

tool 메타는 기존 프로젝트에서 사용 중인 id 범위 안에 있고, 이번 Batch 4의 목적이 본문 문체/구조 개선이므로 변경하지 않았다.

## 6. 유지한 SEO 요소

- `slug`, `link`, `category`, `postCategory`, `lang` 변경 없음
- canonical/hreflang/robots/sitemap/SeoHead/routing 정책 변경 없음
- 내부링크 삭제 없음
- 새 글 또는 EN 글 수정 없음
- noindex/redirect 추가 없음

## 7. FAQ/JSON-LD 정합성 점검

로컬 Node 파싱 결과:

| File | JSON-LD scripts | visible FAQ | FAQPage mainEntity | Result |
| --- | ---: | ---: | ---: | --- |
| `real-rates-and-breakevens.md` | 2 | 8 | 8 | OK |
| `war-theme-investing-price-chain-not-winners.md` | 2 | 8 | 8 | OK |
| `dca-vs-lumpsum-decision-rules.md` | 2 | 8 | 8 | OK |
| `dca-fx-volatility-decomposition.md` | 2 | 8 | 8 | OK |
| `oil-shock-to-usdkrw-korea-transmission.md` | 2 | 8 | 8 | OK |

## 8. 빌드/검증 결과

실행 명령:

- `npm.cmd run build`: PASS
  - Next.js build 성공
  - postbuild sitemap 생성도 성공
  - 생성 로그: `sitemap-ko.xml: 101 URLs`, `sitemap-en.xml: 98 URLs`, `en/sitemap.xml: 98 URLs`
- `node scripts\verify_seo_channel_split.js --local-server`: PASS
  - `sitemap-0.xml URL count: 199`
  - forbidden loc patterns: PASS
  - `/en/sitemap.xml` EN-only locs: PASS
  - 주요 URL canonical/self 검증: PASS
- `node scripts\verify_post_publish_urls.js --local-server` 대상 5개 KO URL: PASS
  - 5개 모두 HTTP 200
  - canonical self: yes
  - robots blocked: no
  - meta noindex: no
  - sitemap: `main:yes`, `ko:yes`
  - RSS: yes
  - hreflang pair: yes
- FAQ/JSON-LD parse check: PASS
- 반복 표현 `rg` 점검: 0 hits
- `git diff --check`: PASS

postbuild/검증 중 재생성된 `public/sitemap*.xml`, `public/en/sitemap.xml`, `reports/seo-channel-split-url-check.md`는 이번 작업 범위 밖 산출물이므로 검증 후 되돌렸다.

## 9. 남은 이슈

- `reports/ai-tone-content-audit-refresh-after-ko-batch3-2026-06-23.md`는 작업 시작 전부터 untracked 상태로 남아 있다. 이번 Batch 4 범위에는 포함하지 않았다.
- `reports/*`가 gitignore 대상이면, 이 보고서를 커밋하려면 `git add -f reports/ai-tone-rewrite-ko-batch4.md`가 필요할 수 있다.
