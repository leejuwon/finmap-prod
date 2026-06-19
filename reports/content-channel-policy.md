# Finmap Content Channel Policy

- 작성일: 2026-06-19
- 목적: 신규 글 작성 시 KO-only, true_pair, adapted_pair, en_only를 사전에 판단하여 KO=Naver, EN=GSC+Bing 운영을 분리한다.
- 적용 범위: `content/posts/**`, tools/calculator 연계 글, market/real-estate guide 글

## 기본 원칙

1. KO 글을 만들었다고 EN 글을 자동으로 만들지 않는다.
2. EN 글을 만들었다고 KO 글을 자동으로 만들지 않는다.
3. 같은 slug를 쓰려면 KO/EN 검색 의도가 실질적으로 같거나, adapted pair로 운영할 이유가 명확해야 한다.
4. KO는 네이버에서 한국 사용자가 바로 검색하는 표현과 즉답형 구조를 우선한다.
5. EN은 Google/Bing에서 검색 가능한 calculator, evergreen explainer, Korea finance, Korea market guide를 우선한다.
6. 기존 canonical/hreflang/sitemap 구조는 콘텐츠 정책 때문에 자동 변경하지 않는다. 구조 변경은 별도 SEO 검토 후 진행한다.

## 분류 기준

| type | 만들 조건 | 만들지 말아야 할 조건 | 예시 |
| --- | --- | --- | --- |
| `ko_only` | 네이버형 질문, 한국 금액표, 한국 대출/부동산 실무, 한국어 생활 표현이 핵심 | 영어권에서 같은 질문을 거의 검색하지 않거나 번역 시 의도가 흐려짐 | `1억 모으려면 월 얼마`, `연봉별 DSR 대출한도표`, `보유현금 1억·2억·3억 아파트 예산` |
| `true_pair` | 복리, CAGR, DCA, FIRE, 예산, 비상금처럼 언어가 달라도 검색 의도가 거의 같음 | currency/제도/시장 맥락이 달라 같은 답을 줄 수 없음 | `compound interest calculator`, `CAGR calculator`, `DCA vs lump sum`, `FIRE calculator assumptions` |
| `adapted_pair` | 같은 주제 뿌리는 있으나 KO/EN의 독자, 예시, FAQ, 내부링크가 달라야 함 | 단순 번역으로만 만들 수 있거나 한쪽 검색 의도가 약함 | `DSR/LTV`, `USD/KRW and KOSPI`, `Korean apartment transaction data`, `Jeonse vs rent vs buy` |
| `en_only` | 영어권 독자가 검색할 독립 가치가 있음. Korea finance, Korea market, Korea housing data, global calculator guide | KO에서 네이버 검색어가 어색하거나 한국어 독자 니즈가 약함 | `Korea DSR mortgage rule`, `USD/KRW explained`, `Korean apartment dashboard guide`, `KOSPI sector map` |

## 글 작성 전 판단 질문

### KO 후보 질문

- 네이버에서 사용자가 실제로 칠 만한 표현인가?
- 첫 문단에서 숫자나 표로 바로 답할 수 있는가?
- 한국 제도, 한국 금액 단위, 한국 대출/부동산 의사결정과 연결되는가?
- RSS 또는 네이버 수집요청에 올릴 가치가 있는가?
- EN으로 번역하면 검색 의도가 살아나는가, 아니면 한국어 문맥에 갇히는가?

### EN 후보 질문

- 영어권 사용자가 Google/Bing에서 검색할 만한 long-tail query인가?
- `calculator`, `explained`, `guide`, `table`, `Korea`, `USD/KRW`, `KOSPI`, `DSR`, `apartment transaction data` 같은 intent가 선명한가?
- 한국 제도나 시장을 모르는 독자에게 배경 설명을 제공하는가?
- Finmap tools 또는 market page로 자연스럽게 연결되는가?
- KO 원문을 직역하지 않고, EN 독자의 예시/FAQ/표로 다시 설계했는가?

## type별 작성 규칙

### `ko_only`

- 제목은 네이버 검색어처럼 자연스럽게 쓴다.
- 첫 문단에 즉답을 둔다.
- 표는 한국 금액/기간/금리 단위를 우선한다.
- EN 파일을 만들지 않는다.
- 기존 EN 파일이 이미 있으면 삭제/noindex하지 말고 `needs_rewrite` 또는 `decouple_hreflang_review`로 별도 감사한다.

### `true_pair`

- KO/EN 모두 같은 문제를 푼다.
- slug를 맞춰도 된다.
- 계산기 CTA를 양쪽 모두 넣는다.
- FAQ는 언어만 번역하지 말고 각 언어 검색자가 묻는 표현으로 다듬는다.
- hreflang pair 유지가 기본값이다.

### `adapted_pair`

- 같은 slug를 쓰더라도 같은 글이라고 가정하지 않는다.
- KO는 국내 검색어와 한국 사례를 우선한다.
- EN은 "Korea guide for global readers" 또는 calculator/explainer intent를 우선한다.
- title, H1, intro, FAQ, table, internal links를 각 채널별로 따로 작성한다.
- 구조상 hreflang pair를 유지할지 애매하면 `decouple_hreflang_review` 후보로 표시한다.

### `en_only`

- EN 독립 검색 의도가 명확할 때만 만든다.
- KO 대응 글을 억지로 만들지 않는다.
- `/en/sitemap.xml`, `sitemap-en.xml`, Bing/GSC 제출 대상임을 확인한다.
- Korea market guide라면 `/en/market`, `/en/market/indices`, `/en/market/real-estate` 중 적절한 내부링크를 넣는다.

## `needs_rewrite` 판정 신호

- EN title이 너무 일반적이다.
- EN description이 KO 설명의 직역처럼 보인다.
- EN 첫 문단이 "이 글은..." 수준의 설명이고 검색자의 질문에 바로 답하지 않는다.
- EN 표가 USD/글로벌 독자 또는 Korea guide 맥락으로 재구성되어 있지 않다.
- FAQ가 1~2개로 적거나, 질문 표현이 영어 검색어답지 않다.
- 관련 calculator/tools CTA가 없거나 약하다.
- 내부링크가 KO root URL로 가거나 EN 관련 글/툴로 충분히 이어지지 않는다.

## `decouple_hreflang_review` 판정 신호

- 같은 slug인데 KO/EN의 금액 단위, 독자, 질문이 다르다.
- KO는 한국형 생활 질문이고 EN은 국제형 calculator query다.
- 같은 주제인데 slug가 달라 현재 pair가 끊겨 있다.
- 한쪽은 제도 설명, 다른 쪽은 계산표라 검색 의도가 다르다.
- 이 판정이 나와도 즉시 canonical/hreflang을 수정하지 않는다. 별도 SEO 검증 작업으로 분리한다.

## 신규 글 발행 전 체크

| 체크 | KO | EN |
| --- | --- | --- |
| target channel | `naver-ko` | `gsc-bing-en` |
| title style | 네이버 검색어형 질문/즉답 | calculator/explainer/guide long-tail |
| intro | 숫자·표·결론 먼저 | 검색자의 문제와 사용 방법 먼저 |
| table | 한국 금액/대출/부동산/기간 | USD 또는 Korea guide 맥락으로 재설계 |
| FAQ | 한국 사용자의 실무 질문 | 영어권 독자의 개념/입력값/한계 질문 |
| internal links | KO tools/posts/market | EN tools/posts/market |
| sitemap/RSS | KO sitemap, 필요 시 RSS/Naver | EN sitemap, `/en/sitemap.xml`, Bing/GSC |

## 금지 사항

- KO 글을 이유 없이 EN으로 단순 번역하지 않는다.
- EN 글을 이유 없이 KO로 역번역하지 않는다.
- 콘텐츠 정책 판단만으로 noindex를 적용하지 않는다.
- 콘텐츠 정책 판단만으로 canonical/hreflang을 바꾸지 않는다.
- 기존 URL을 삭제하거나 slug를 바꾸지 않는다.
