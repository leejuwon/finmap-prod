# Finmap 부동산 대시보드 신규 콘텐츠 1차 생성 리포트

작성일: 2026-06-03

## 1. 생성 범위

`reports/real-estate-content-gap-audit.md`의 1~3순위 후보만 실제 포스트로 생성했습니다. 4~5순위 후보는 이번 작업에서 생성하지 않았습니다.

## 2. 생성한 파일

| locale | file | title | slug | target keyword |
| --- | --- | --- | --- | --- |
| ko | `content/posts/personalFinance/ko/how-to-read-apartment-transaction-prices.md` | 아파트 실거래가 보는 법: 평균가·중앙값·평단가·거래량을 함께 읽어야 하는 이유 | `how-to-read-apartment-transaction-prices` | 아파트 실거래가 보는법, 아파트 평균가 중앙값, 아파트 평단가 보는 법 |
| en | `content/posts/personalFinance/en/how-to-read-apartment-transaction-prices.md` | How to Read Korean Apartment Transaction Prices: Median, Average, Unit Price, and Volume | `how-to-read-apartment-transaction-prices` | Korean apartment transaction data, median price, average price, unit price, transaction volume |
| ko | `content/posts/personalFinance/ko/apartment-transaction-volume-decline-meaning.md` | 아파트 거래량 감소는 집값 하락 신호일까? 실거래 데이터로 보는 4가지 해석 | `apartment-transaction-volume-decline-meaning` | 아파트 거래량 감소 의미, 아파트 거래량 줄면, 아파트 거래량과 집값 |
| en | `content/posts/personalFinance/en/apartment-transaction-volume-decline-meaning.md` | What Falling Apartment Transaction Volume Means in Korea: 4 Ways to Read the Signal | `apartment-transaction-volume-decline-meaning` | apartment transaction volume, falling volume, Korean real estate liquidity |
| ko | `content/posts/personalFinance/ko/large-apartment-complex-households-price-stability.md` | 세대수 많은 대단지 아파트가 더 안정적일까? 거래량·평단가·가격분포로 확인하는 법 | `large-apartment-complex-households-price-stability` | 대단지 아파트 가격 안정성, 세대수 많은 아파트 가격, 대단지 아파트 장점 단점 |
| en | `content/posts/personalFinance/en/large-apartment-complex-households-price-stability.md` | Are Large Apartment Complexes More Stable? Reading Households, Volume, and Unit Prices in Korea | `large-apartment-complex-households-price-stability` | large apartment complex Korea, household count, price stability, transaction volume |

## 3. 내부 링크 목록

### 글 1: 실거래가 보는 법

- KO: `/market/real-estate`
- KO: `/market/real-estate/seoul-apartment-top100`
- KO: `/market/real-estate/gyeonggi-apartment-top100`
- KO: `/market/real-estate/incheon-apartment-top100`
- KO: `/posts/personalFinance/apt-dashboard-home-goal-roadmap`
- KO: `/tools/dsr-ltv-calculator`
- EN: `/en/market/real-estate`
- EN: `/en/market/real-estate/seoul-top100`
- EN: `/en/market/real-estate/gangnam-top100`
- EN: `/en/posts/personalFinance/apt-dashboard-home-goal-roadmap`
- EN: `/en/tools/dsr-ltv-calculator`

주의: 영어 `seoul-apartment-top100`, `gyeonggi-apartment-top100`, `incheon-apartment-top100` 랜딩은 `getStaticProps`에서 `locale === "en"`일 때 `notFound`이므로 영어 글에서는 실제 존재하는 영어 Top100/대시보드 링크로 대체했습니다.

### 글 2: 거래량 감소 해석

- KO: `/market/real-estate`
- KO: `/posts/investingInfo/rates-discount-mortgage-demand-apt-prices`
- KO: `/posts/economicInfo/geopolitics-oil-fx-dashboard`
- KO: `/posts/personalFinance/apt-dashboard-home-goal-roadmap`
- EN: `/en/market/real-estate`
- EN: `/en/posts/investingInfo/rates-discount-mortgage-demand-apt-prices`
- EN: `/en/posts/economicInfo/geopolitics-oil-fx-dashboard`
- EN: `/en/posts/personalFinance/apt-dashboard-home-goal-roadmap`

### 글 3: 세대수/대단지 안정성

- KO: `/market/real-estate`
- KO: `/market/real-estate/seoul-top100`
- KO: `/market/real-estate/gangnam-top100`
- KO: `/posts/investingInfo/seoul-gyeonggi-incheon-risk-budget-framework`
- KO: `/posts/personalFinance/apt-dashboard-home-goal-roadmap`
- EN: `/en/market/real-estate`
- EN: `/en/market/real-estate/seoul-top100`
- EN: `/en/market/real-estate/gangnam-top100`
- EN: `/en/posts/investingInfo/seoul-gyeonggi-incheon-risk-budget-framework`
- EN: `/en/posts/personalFinance/apt-dashboard-home-goal-roadmap`

## 4. 기존 글과의 차별점

| 글 | 기존 글과 겹치는 지점 | 차별점 |
| --- | --- | --- |
| 실거래가 보는 법 | `apt-dashboard-home-goal-roadmap`과 Top100 랜딩에서 일부 지표 언급 | 평균가/중앙값/평단가/거래량을 독립 용어집 겸 해석 가이드로 구성 |
| 거래량 감소 해석 | `rates-discount-mortgage-demand-apt-prices`, `geopolitics-oil-fx-dashboard`에서 거래량 선행 신호 언급 | 거래량 감소 자체를 가격 예측이 아닌 유동성/관망/표본수 신호로 분해 |
| 세대수/대단지 안정성 | 기존 글에는 세대수 필터 중심 설명이 약함 | 대시보드의 세대수 필터를 거래량/평단가/가격분포와 연결 |

## 5. 대시보드 연결 방식

- 모든 글에 `/market/real-estate` 또는 `/en/market/real-estate` CTA를 본문 중간과 결론에 배치했습니다.
- 글 1은 대표가격, 평균, 대표평단가, 거래량을 보는 순서로 대시보드 사용을 유도합니다.
- 글 2는 거래량을 먼저 보고 중앙값/평균/평단가/가격분포를 함께 확인하도록 구성했습니다.
- 글 3은 세대수 필터를 거래량, 대표평단가, 평균-중앙값 차이와 함께 쓰도록 구성했습니다.
- 1~3번 글은 대출 계산보다 대시보드 해석이 중심이므로 `tool` 메타는 넣지 않았고, 글 1에만 DSR/LTV 계산기를 보조 내부 링크로 연결했습니다.

## 6. FAQ/JSON-LD 포함 여부

| slug | Article JSON-LD | FAQPage JSON-LD | FAQ 개수 |
| --- | --- | --- | ---: |
| `how-to-read-apartment-transaction-prices` | 포함 | 포함 | 5 |
| `apartment-transaction-volume-decline-meaning` | 포함 | 포함 | 5 |
| `large-apartment-complex-households-price-stability` | 포함 | 포함 | 5 |

각 ko/en 파일 모두 `Article`과 `FAQPage` JSON-LD를 포함했습니다.

## 7. 검증 결과

### 내부 링크 존재 확인

- `rg`로 신규 포스트 내 `/market/real-estate`, `/posts/*`, `/tools/dsr-ltv-calculator` 링크를 확인했습니다.
- 주요 대상 파일 확인:
  - `pages/market/real-estate.js`
  - `pages/market/real-estate/seoul-apartment-top100.js`
  - `pages/market/real-estate/gyeonggi-apartment-top100.js`
  - `pages/market/real-estate/incheon-apartment-top100.js`
  - `pages/market/real-estate/seoul-top100.js`
  - `pages/market/real-estate/gangnam-top100.js`
  - `pages/tools/dsr-ltv-calculator.js`
  - 기존 관련 포스트 ko/en 파일

### 한국어/영어 slug pair 확인

아래 3개 slug가 ko/en 양쪽에 모두 생성되었습니다.

- `how-to-read-apartment-transaction-prices`
- `apartment-transaction-volume-decline-meaning`
- `large-apartment-complex-households-price-stability`

### build 결과

명령:

```bash
npm.cmd run build
```

결과:

- 성공
- `next build --webpack` 컴파일 성공
- 정적 페이지 생성 성공: `209/209`
- 신규 포스트 경로가 SSG 목록에 포함됨
- `postbuild`로 `next-sitemap` 실행 성공

### git diff --check 결과

명령:

```bash
git diff --check
```

결과:

- exit code 0
- 경고: `public/sitemap-0.xml`, `public/sitemap.xml`의 LF가 Git 처리 시 CRLF로 바뀔 수 있다는 line-ending 경고가 출력됨
- whitespace error는 없음

### sitemap 변경 여부

`npm.cmd run build`의 `postbuild`에서 `next-sitemap`이 실행되어 `public/sitemap-0.xml`이 변경되었습니다.

확인된 신규 sitemap URL:

- `https://www.finmaphub.com/posts/personalFinance/apartment-transaction-volume-decline-meaning`
- `https://www.finmaphub.com/posts/personalFinance/how-to-read-apartment-transaction-prices`
- `https://www.finmaphub.com/posts/personalFinance/large-apartment-complex-households-price-stability`
- `https://www.finmaphub.com/en/posts/personalFinance/apartment-transaction-volume-decline-meaning`
- `https://www.finmaphub.com/en/posts/personalFinance/how-to-read-apartment-transaction-prices`
- `https://www.finmaphub.com/en/posts/personalFinance/large-apartment-complex-households-price-stability`

주의:

- sitemap 재생성 과정에서 신규 URL 추가 외에도 여러 정적 URL의 `lastmod`가 `2026-06-03T13:48:16.400Z`로 갱신되었습니다.
- `public/sitemap.xml`은 이번 status 범위에서는 변경 파일로 표시되지 않았고, `public/sitemap-0.xml`만 수정 상태로 확인되었습니다.

## 8. 남은 확인 사항

- 커버 이미지는 기존 `apt-dashboard-home-goal-roadmap` 이미지를 임시 fallback으로 사용했습니다. 추후 별도 이미지 생성 작업에서 각 글별 cover/img1~img3 교체를 권장합니다.
- 이번 작업에서는 4~5순위 후보인 `find-apartments-within-budget-dsr-ltv-dashboard`, `seoul-gyeonggi-incheon-apartment-price-band-comparison`은 생성하지 않았습니다.

