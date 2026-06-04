# Finmap 부동산 대시보드 가격대 딥링크 감사

- 작업일: 2026-06-04
- 목표: 부동산 관련 블로그 CTA에서 대시보드 가격 필터를 사용자가 다시 입력하지 않아도 되도록 가격대 query 딥링크를 검토하고 적용
- 대상 글:
  - `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md`
  - `content/posts/personalFinance/en/dsr-40-income-loan-limit-table.md`
  - `content/posts/personalFinance/ko/cash-100m-200m-300m-apartment-budget.md`
  - `content/posts/personalFinance/en/cash-100m-200m-300m-apartment-budget.md`

## 1. 대시보드 query parameter 지원 상태

`pages/market/real-estate.js`는 `router.query`를 읽어 초기 필터 상태를 설정한 뒤 같은 값을 `/api/re/trade-top` 요청에 전달한다.

| parameter | 지원 값/단위 | 동작 |
|---|---|---|
| `priceMetric` | `none`, `median_price`, `avg_price`, `latest_price`, `max_price`, `sum_price` | 가격 필터에 사용할 지표 |
| `priceMin` | 억원 단위 숫자, 소수 허용 | 선택 지표의 최소 가격 |
| `priceMax` | 억원 단위 숫자, 소수 허용 | 선택 지표의 최대 가격 |
| `sido` | `all`, `11`, `28`, `41` | 전체, 서울, 인천, 경기 |
| `top` | `10`, `20`, `50`, `100`, `300`, `500` | 결과 개수, 기본값 `100` |
| `pyeong` / `band` | `all`, `10`, `20`, `30`, `40` | 평형 구간, 기본값 `all` |
| `metric` / `topBy` | 거래량·가격·평단가 관련 정렬 지표 | 결과 정렬 기준 |
| `timeframe`, `period`, `from`, `to` | 월/연 및 유효 기간 | 조회 기간 |

가격 query 처리 흐름:

1. `router.isReady` 이후 `priceMetric`, `priceMin`, `priceMax`, `sido`를 query에서 읽는다.
2. 허용된 `priceMetric`과 `sido`를 상태에 적용한다.
3. `priceMetric !== none`이면 가격 최소·최대 값을 `/api/re/trade-top` 요청에 전달한다.
4. API는 `priceMin`과 `priceMax`를 억원 단위 숫자로 읽고 각각 `100,000,000`을 곱해 원 단위 필터로 변환한다.

## 2. 딥링크 지표 결정

딥링크에는 `priceMetric=median_price`를 사용했다.

- 대시보드 표시명: KO `대표가격(중앙값)`, EN `Typical (Median)`
- DSR/LTV 계산기 결과 CTA도 이미 같은 `median_price + priceMin + priceMax` 구조를 사용한다.
- 한 건의 최근 거래나 고가 거래가 가격대 필터를 크게 흔드는 것을 줄이는 목적에 적합하다.

지역은 `sido=all`을 사용했다. 대시보드의 query 없는 기본값은 서울(`11`)이므로, `all`을 넣어 CTA 문맥대로 서울·경기·인천 전체 단지를 조회한다.

`top`과 `pyeong`은 기본값을 유지했다. 글의 가격대 예시는 특정 평형을 전제로 하지 않으며, 결과 개수를 URL에 추가할 필요도 없었다.

## 3. 적용한 딥링크

### DSR 40% 연소득별 한도표

예시 안전 탐색 가격대 약 4.57억~5.14억원:

```text
/market/real-estate?sido=all&priceMetric=median_price&priceMin=4.57&priceMax=5.14
/en/market/real-estate?sido=all&priceMetric=median_price&priceMin=4.57&priceMax=5.14
```

KO/EN 예시 설명도 가격 필터가 미리 적용된다는 문구로 수정했다.

### 보유현금별 아파트 예산

| 구간 | priceMin | priceMax | KO/EN 적용 |
|---|---:|---:|---|
| 현금 1억원 | `2.28` | `2.57` | 적용 |
| 현금 2억원 | `4.57` | `5.14` | 적용 |
| 현금 3억원 | `4.79` | `5.39` | 적용 |

공통 구조:

```text
/market/real-estate?sido=all&priceMetric=median_price&priceMin={min}&priceMax={max}
/en/market/real-estate?sido=all&priceMetric=median_price&priceMin={min}&priceMax={max}
```

각 URL은 필요한 query만 포함해 길이가 과도하지 않고, CTA 문구에도 적용된 중앙값 가격대를 표시했다.

## 4. 정상 동작 검증

- 대시보드는 query를 초기 필터 상태에 적용하고 이후 API 요청에 전달한다.
- `median_price`는 프론트와 API 양쪽에서 지원하는 허용 값이다.
- `priceMin`과 `priceMax`는 억원 단위 소수값으로 API에서 원 단위 변환된다.
- `sido=all`은 허용 값이며 서울·경기·인천 전체 조회에 사용된다.
- `lib/posts.js`의 내부 링크 정규화는 URL query string을 보존한다.
- Markdown 렌더링 결과에서도 딥링크 query가 그대로 유지됨을 확인했다.
- production build가 생성한 KO/EN SSG JSON에도 `sido=all&priceMetric=median_price&priceMin=...&priceMax=...` 링크가 포함됨을 확인했다.

Markdown 렌더링 딥링크 확인 결과:

| 글 | 예상 딥링크 수 | 결과 |
|---|---:|---|
| KO DSR 한도표 | 1 | PASS |
| EN DSR 한도표 | 1 | PASS |
| KO 보유현금별 예산 | 3 | PASS |
| EN 보유현금별 예산 | 3 | PASS |

## 5. 코드 변경 판단

`pages/market/real-estate.js`와 API가 필요한 가격 query 구조를 이미 지원하므로 대시보드 코드는 변경하지 않았다.

- 가격 query 신규 구현 불필요
- 계산 로직 변경 없음
- 광고 위치 및 광고 수 변경 없음
- URL 길이와 CTA UX가 수용 가능한 수준이므로 딥링크 적용

## 6. SEO 및 라우팅 보존

- 네 글의 slug 변경 없음
- canonical 및 hreflang 처리 변경 없음
- KO 링크는 `/market/real-estate`
- EN 링크는 `/en/market/real-estate`
- query parameter는 대시보드 필터 상태에만 사용되며 블로그 canonical에는 영향 없음

## 7. 변경 파일

- `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md`
- `content/posts/personalFinance/en/dsr-40-income-loan-limit-table.md`
- `content/posts/personalFinance/ko/cash-100m-200m-300m-apartment-budget.md`
- `content/posts/personalFinance/en/cash-100m-200m-300m-apartment-budget.md`
- `reports/real-estate-dashboard-price-deeplink-audit.md`
- `public/sitemap-0.xml` - postbuild 생성 결과 유지

검토만 하고 변경하지 않은 파일:

- `pages/market/real-estate.js`
- `pages/api/re/trade-top.js`
- `_components/DsrLtvCalculator.js`

## 8. 실행 명령과 결과

| 명령 | 결과 |
|---|---|
| `rg` 기반 query 처리·CTA·라우팅 검색 | PASS |
| Markdown query 보존 Node 검증 | PASS - KO/EN DSR 각 1개, KO/EN 현금 글 각 3개 |
| `.next/server/pages` 생성 결과 딥링크 검색 | PASS |
| `npm.cmd run build` | PASS - Next.js production build 및 next-sitemap 생성 성공 |
| `git diff --check` | PASS |

## 9. 운영 확인 사항

- 배포 후 각 CTA 클릭 시 지역 필터가 전체, 가격 지표가 대표가격(중앙값), 최소·최대 가격이 지정 범위로 표시되는지 확인한다.
- 결과는 최신 기본 조회 기간과 전체 평형 기준이다. 특정 평형이나 기간이 필요하면 사용자가 대시보드에서 추가 조정해야 한다.
- 가격 필터 결과는 실제 매수 가능 여부나 대출 실행 가능성을 보장하지 않는다.
