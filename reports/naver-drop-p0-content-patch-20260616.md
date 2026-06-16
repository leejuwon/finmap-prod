# Finmap Naver Drop P0 Content Patch - 2026-06-16

## 범위

- 수정 대상:
  - `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md`
  - `content/posts/investingInfo/ko/usd-krw-weak-won-sector-map-kospi.md`
- 목적: GA4 네이버 유입 감소 P0 후보 2개 글의 검색어 매칭을 최소 복구.
- 수정하지 않은 항목:
  - 앱 코드, `SeoHead`, `ToolSeo`
  - sitemap/RSS/robots/canonical 구조
  - CAGR 계산기, `what-is-cagr`
  - 대량 내부 링크

## 변경 요약

| URL | 변경 범위 | 의도 |
| --- | --- | --- |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | `title`, `seoTitle`, `seoDescription` | `연봉별 대출 가능액 표`, `연봉 4천 6천 1억`, `주담대 한도` 검색어 매칭 복구 |
| `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi` | `title`, `description`, `seoTitle`, `seoDescription`, 도입부 첫 문단 | `환율 상승 수혜주`, `원달러 환율 상승 수혜주`, `환율 오르면 오르는 주식` 의도에 맞게 첫 신호 보강 |

## DSR 글 변경 전후

| 항목 | 변경 전 | 변경 후 |
| --- | --- | --- |
| title | `DSR 40%면 연소득별 주담대 한도는 얼마나 될까?` | `DSR 40% 연봉별 대출 가능액 표` |
| seoTitle | `DSR 40% 연소득별 주담대 한도표 \| DSR 계산기·LTV 계산기` | `DSR 40% 연봉별 대출 가능액 표 \| 연봉 4천 6천 1억 주담대 한도` |
| seoDescription | `연소득별 DSR 40% 주담대 한도를 금리 4%, 30년 원리금균등 기준으로 정리하고 DSR/LTV 계산기와 부동산 실거래 대시보드 활용법을 안내합니다.` | `DSR 40%, 금리 4%, 30년 원리금균등 기준으로 연봉별 대출 가능액과 월 상환 가능액을 표로 정리합니다. DSR/LTV 계산기로 내 조건의 주담대 한도도 확인해보세요.` |
| 도입부 요약 | `연봉이 4,000만원인지, 6,000만원인지, 1억원인지에 따라 주담대 한도는 크게 달라집니다...` | 변경 없음. 계산기/대시보드 연결 문맥 유지. |

### 수정 이유

- 2026-06-02 이전 문구의 핵심 검색어였던 `연봉별 대출 가능액 표`가 title/seoTitle에서 빠진 뒤, 네이버 검색어 매칭이 약해졌을 가능성이 있었다.
- 현재 글의 장점인 DSR/LTV 계산기 연결은 `seoDescription` 뒤쪽에 유지했다.
- `연소득별`보다 일반 사용자가 검색할 가능성이 높은 `연봉별`을 title/seoTitle 전면에 배치했다.

## 환율 글 변경 전후

| 항목 | 변경 전 | 변경 후 |
| --- | --- | --- |
| title | `환율 상승(원화 약세) 수혜·피해 섹터 지도: 코스피 업종별 체크리스트` | `환율 상승 수혜주·피해주: 원화 약세 때 코스피 업종 정리` |
| description | `원달러 환율 상승(원화 약세)은 모든 주식에 같은 영향을 주지 않습니다. 수출·수입·내수·원자재·2차전지·항공·운송까지, 업종별로 누가 수혜를 보고 누가 부담을 받는지 표와 체크리스트로 정리합니다.` | `원달러 환율이 오를 때 어떤 코스피 업종이 유리하고 불리한지 수출주, 내수주, 항공·운송, 원자재, 2차전지 관점에서 정리합니다.` |
| seoTitle | `원화 약세 수혜주·피해주: 환율 상승 때 코스피 업종별 체크리스트` | `환율 상승 수혜주·피해주 \| 원화 약세 코스피 업종 체크` |
| seoDescription | `환율 상승이 수출주, 내수주, 항공·운송, 2차전지에 주는 영향을 업종 구조와 외국인 수급 관점에서 정리합니다. 원화 약세 국면에서 수혜·피해 섹터를 구분하는 체크리스트를 제공합니다.` | `원달러 환율이 오를 때 어떤 코스피 업종이 유리하고 불리한지 수출주, 내수주, 항공·운송, 원자재, 2차전지 관점에서 정리합니다.` |
| 도입부 요약 | `환율 상승(원화 약세)은 “수혜주 vs 피해주”로 단순히 나눌 수 있는 문제가 아닙니다...` | `원달러 환율이 오르면 모든 주식이 같은 방향으로 움직이지 않습니다. 수출 비중이 높은 업종은 환율 상승 수혜주로 묶일 수 있지만...` |

### 수정 이유

- 기존 title은 경제 용어형 `원화 약세`가 앞에 있어, 네이버 사용자가 직접 입력할 가능성이 높은 `환율 상승 수혜주`와 첫 신호가 어긋날 수 있었다.
- title/seoTitle 첫머리에 `환율 상승 수혜주`를 배치하고, `원화 약세`는 보조 키워드로 유지했다.
- 도입부 첫 문단에서 `환율 오르면 어떤 주식/업종이 유리하거나 불리한가`라는 검색 의도에 바로 답하도록 보강했다.

## 검증 결과

### Build

- 명령: `npm.cmd run build`
- 결과: 성공
- 참고: `npm run build`가 `postbuild`로 `next-sitemap`을 자동 실행해 `public/sitemap-0.xml`이 갱신되었으나, 이번 범위 밖 변경이라 즉시 원복했다.

### Local HTTP

| URL | HTTP status | X-Robots-Tag |
| --- | ---: | --- |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | 200 | 없음 |
| `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi` | 200 | 없음 |

### Built HTML head

| URL | title 반영 | description 반영 | canonical | meta robots | H1 |
| --- | --- | --- | --- | --- | --- |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | `DSR 40% 연봉별 대출 가능액 표 \| 연봉 4천 6천 1억 주담대 한도 \| FinMap` | 반영됨 | `https://www.finmaphub.com/posts/personalFinance/dsr-40-income-loan-limit-table` | 없음 | 1개 |
| `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi` | `환율 상승 수혜주·피해주 \| 원화 약세 코스피 업종 체크 \| FinMap` | 반영됨 | `https://www.finmaphub.com/posts/investingInfo/usd-krw-weak-won-sector-map-kospi` | 없음 | 1개 |

## 후속 모니터링 항목

- 네이버 포함 GA4 조회수: 3일, 7일 단위로 동일 URL 비교.
- 네이버 서치어드바이저: 색인 제외/수집 성공/검색 노출 변화 확인.
- GSC 또는 네이버 검색어 데이터가 확보되면 `환율 상승 수혜주`, `연봉별 대출 가능액`, `DSR 40% 대출 한도` 계열의 노출/CTR 변화 확인.
- DSR 글은 `연봉별 대출 가능액` 복구 효과를 먼저 보고, 성과가 없을 때 도입부 표 상단 문구까지 추가 조정.
- 환율 글은 `환율 상승 수혜주` 노출 회복이 없으면 제목 후보를 `원달러 환율 상승 수혜주`까지 더 직접적으로 테스트.

## 사용한 명령

- `git status --short`
- `Get-Content -Path content\posts\personalFinance\ko\dsr-40-income-loan-limit-table.md -Encoding UTF8 -TotalCount 28`
- `Get-Content -Path content\posts\investingInfo\ko\usd-krw-weak-won-sector-map-kospi.md -Encoding UTF8 -TotalCount 36`
- `rg -n "DSR 40% 연봉별 대출 가능액 표|환율 상승 수혜주·피해주|원달러 환율이 오르면" ...`
- `npm.cmd run build`
- 로컬 서버 `node web.js` 실행 후 두 URL `Invoke-WebRequest` 확인
- 빌드 HTML을 `cheerio`로 파싱해 title, description, canonical, robots, H1 확인
