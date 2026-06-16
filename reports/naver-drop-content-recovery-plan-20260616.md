# Finmap Naver Drop Content Recovery Plan - 2026-06-16

## 범위와 전제

- 대상 URL:
  - `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi`
  - `/tools/cagr-calculator`
  - `/posts/personalFinance/what-is-cagr`
  - `/posts/personalFinance/dsr-40-income-loan-limit-table`
- 이번 보고서는 기술 SEO가 아니라 검색어 매칭, 제목, 설명, 도입부, 내부 링크 관점의 복구 전략이다.
- 앱 코드, 콘텐츠 원문, SEO frontmatter는 수정하지 않았다.
- 네이버 실제 검색어 로그와 Search Advisor 쿼리별 노출 데이터는 이 저장소에 없으므로, 검색어 후보와 검색 의도 평가는 현재 콘텐츠, URL 주제, GA4 감소 패턴 기반의 추정이다.
- 기술 SEO 감사 기준으로 위 4개 URL은 모두 200, self-canonical, indexable, H1 1개, sitemap 포함으로 확인되어 있다. 따라서 이번 감소는 기술 오류보다 검색 결과 노출/순위/CTR 또는 검색 의도 매칭 변화 가능성을 우선 본다.

## 핵심 결론

| URL | GA4 Naver views | 우선순위 | 콘텐츠 관점 판단 |
| --- | ---: | --- | --- |
| `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi` | 25 -> 0 | P0 | 본문 품질은 충분하지만, 네이버 사용자가 입력할 법한 `환율 상승 수혜주`, `환율 오르면 오르는 주식`, `원달러 환율 상승 수혜 업종`과 현재 제목의 첫 키워드가 완전히 맞물리지는 않는다. |
| `/tools/cagr-calculator` | 41 -> 21 | P1 | `CAGR 계산기` 매칭은 좋다. 다만 H1이 계산기형 검색 의도보다 설명형 문장에 가깝고, 제목이 키워드를 많이 담아 CTR이 분산될 수 있다. |
| `/posts/personalFinance/what-is-cagr` | 21 -> 5 | P1 | `CAGR 계산법`은 잡고 있으나 `CAGR 뜻`, `CAGR 공식`, `연평균 수익률 뜻` 의도까지 첫 화면에서 강하게 회수하지 못할 수 있다. |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | 15 -> 1 | P0 | 2026-06-02에 `연봉별 대출 가능액 표`에서 `연소득별 주담대 한도표` 중심으로 제목/설명이 실제 변경되었다. 네이버 검색어 관점에서는 이전 문구의 exact-match 손실 가능성이 크다. |

## URL별 현재 추출값

### 1. `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi`

| 항목 | 현재 값 |
| --- | --- |
| frontmatter title | `환율 상승(원화 약세) 수혜·피해 섹터 지도: 코스피 업종별 체크리스트` |
| seoTitle / 현재 H1 | `원화 약세 수혜주·피해주: 환율 상승 때 코스피 업종별 체크리스트` |
| seoDescription | `환율 상승이 수출주, 내수주, 항공·운송, 2차전지에 주는 영향을 업종 구조와 외국인 수급 관점에서 정리합니다. 원화 약세 국면에서 수혜·피해 섹터를 구분하는 체크리스트를 제공합니다.` |
| 첫 300자 도입부 | `원달러 환율 상승은 ‘원화 약세’를 의미하지만, 코스피 업종에는 서로 다른 영향을 줍니다. 수출 비중이 높은 업종은 매출 환산 효과를 기대할 수 있지만, 원자재·에너지·달러 부채 부담이 큰 업종은 비용 압박을 받을 수 있습니다. 이 글은 원화 약세 국면에서 어떤 섹터가 수혜 또는 피해를 받을 수 있는지 구조별로 정리합니다.` |

### 2. `/tools/cagr-calculator`

| 항목 | 현재 값 |
| --- | --- |
| SeoHead title | `CAGR 계산기 (연평균 수익률·연복리 수익률·연평균 성장률)` |
| seoDescription / desc | `초기 자산·최종 자산·기간으로 CAGR(연평균 복리 수익률)을 계산하고, 세금·수수료 반영 전후 차이를 비교해보세요. 주식/ETF/부동산/코인 수익률 분석에 활용할 수 있습니다.` |
| 현재 H1 | `CAGR(연평균 수익률)로 내 투자 성과를 한 줄 숫자로` |
| 첫 300자 도입부 | `“초기에 얼마를 넣어서, 지금 얼마가 되었는지”만 알아도, 그 사이의 연평균 복리 수익률(CAGR)을 추정할 수 있습니다. 초기 자산·최종 자산·투자 기간을 입력하면 세금·수수료 전후의 CAGR과 기간별 성장 흐름을 함께 확인할 수 있습니다.` |

### 3. `/posts/personalFinance/what-is-cagr`

| 항목 | 현재 값 |
| --- | --- |
| frontmatter title | `CAGR이란 무엇인가? 단순 수익률과의 차이 이해하기` |
| seoTitle / 현재 H1 | `CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시` |
| seoDescription | `CAGR 계산식과 단순 수익률의 차이를 예시로 정리합니다. CAGR 계산기로 기간이 다른 투자 성과를 같은 기준에서 비교해보세요.` |
| 첫 300자 도입부 | `CAGR(연평균 복리 수익률)은 특정 기간 동안 투자 가치가 매년 동일한 비율로 증가했다고 가정했을 때의 연간 성장 속도를 의미합니다. 단순 수익률은 “얼마나 올랐는가”를 보여주지만, CAGR은 “매년 평균적으로 어느 정도 성장했는가”를 보여줍니다. 그래서 기간이 다른 투자 성과를 비교할 때 유용합니다.` |

### 4. `/posts/personalFinance/dsr-40-income-loan-limit-table`

| 항목 | 현재 값 |
| --- | --- |
| frontmatter title | `DSR 40%면 연소득별 주담대 한도는 얼마나 될까?` |
| seoTitle / 현재 H1 | `DSR 40% 연소득별 주담대 한도표 \| DSR 계산기·LTV 계산기` |
| seoDescription | `연소득별 DSR 40% 주담대 한도를 금리 4%, 30년 원리금균등 기준으로 정리하고 DSR/LTV 계산기와 부동산 실거래 대시보드 활용법을 안내합니다.` |
| 첫 300자 도입부 | `연봉이 4,000만원인지, 6,000만원인지, 1억원인지에 따라 주담대 한도는 크게 달라집니다. 하지만 시작점은 “집값”이 아니라 연소득에서 월 얼마까지 원리금 상환에 쓸 수 있는가입니다. 이 글의 기준 가정은 DSR 40%, 금리 연 4.0%, 30년 원리금균등 상환, 기존부채 없음입니다.` |

## URL별 검색어 매칭 전략

| URL | 현재 SEO title | 현재 description | 현재 H1 | 타깃 검색어 후보 | 검색 의도 | 현재 문제 가능성 | 추천 수정 방향 | 우선순위 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi` | `원화 약세 수혜주·피해주: 환율 상승 때 코스피 업종별 체크리스트` | `환율 상승이 수출주, 내수주, 항공·운송, 2차전지에 주는 영향을 업종 구조와 외국인 수급 관점에서 정리합니다...` | `원화 약세 수혜주·피해주: 환율 상승 때 코스피 업종별 체크리스트` | 추정: `환율 상승 수혜주`, `원화 약세 수혜주`, `원달러 환율 상승 수혜주`, `환율 오르면 오르는 주식`, `환율 상승 피해주`, `코스피 환율 수혜 업종` | 환율이 오를 때 바로 볼 업종/종목군 목록, 수혜와 피해의 빠른 구분 | 제목 첫머리가 `원화 약세`라 경제용어 친화적이지만, 일반 검색어인 `환율 상승 수혜주`와 첫 토큰이 어긋날 수 있다. `섹터 지도`도 좋지만 네이버 검색에서는 `수혜주/피해주/업종`이 더 직접적일 가능성이 있다. | title/H1 후보는 `환율 상승 수혜주·피해주: 원화 약세 때 코스피 업종 정리`처럼 `환율 상승 수혜주`를 앞에 둔다. description 첫 문장에도 `환율 오르면 어떤 주식/업종이 유리한가`를 넣는다. 도입부 상단에는 수출주, 항공, 원자재, 내수주를 3초 요약형으로 배치한다. | P0 |
| `/tools/cagr-calculator` | `CAGR 계산기 (연평균 수익률·연복리 수익률·연평균 성장률)` | `초기 자산·최종 자산·기간으로 CAGR(연평균 복리 수익률)을 계산하고...` | `CAGR(연평균 수익률)로 내 투자 성과를 한 줄 숫자로` | 추정: `CAGR 계산기`, `연평균 수익률 계산기`, `연복리 수익률 계산기`, `연평균 성장률 계산`, `투자 수익률 계산기`, `CAGR 공식` | 숫자를 바로 입력해 결과를 얻고, 공식과 예시를 짧게 확인 | SEO title은 강하지만 H1은 계산기 직접 의도보다 해설형이다. title 괄호 안 키워드가 많아 CTR 문구가 다소 길고 빽빽하게 보일 수 있다. | 검색 결과용 title은 `CAGR 계산기`를 유지하되 `연평균 수익률 계산`을 보조로 둔다. 첫 화면 H1 또는 보조 문구는 `초기금액, 최종금액, 기간으로 바로 계산`의 행동 의도를 더 강하게 드러낸다. | P1 |
| `/posts/personalFinance/what-is-cagr` | `CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시` | `CAGR 계산식과 단순 수익률의 차이를 예시로 정리합니다...` | `CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시` | 추정: `CAGR 뜻`, `CAGR 계산법`, `CAGR 공식`, `CAGR이란`, `연평균 수익률 뜻`, `연평균 성장률 계산`, `CAGR 예시` | 용어의 뜻, 공식, 계산 예시를 빠르게 이해하고 계산기로 확인 | 현재 title이 `계산법` 중심이라 `CAGR 뜻` 검색 의도에 덜 직접적일 수 있다. 설명에는 `공식`보다 `계산식`이 들어가 있어 사용자가 입력하는 단어와 약간 다르다. | title 후보는 `CAGR 뜻과 계산법: 공식·예시·단순 수익률 차이`처럼 `뜻`, `공식`, `계산법`을 함께 포괄한다. 도입부 첫 줄에 `CAGR 뜻 = 연평균 복리 수익률`을 명시한다. | P1 |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | `DSR 40% 연소득별 주담대 한도표 \| DSR 계산기·LTV 계산기` | `연소득별 DSR 40% 주담대 한도를 금리 4%, 30년 원리금균등 기준으로 정리하고...` | `DSR 40% 연소득별 주담대 한도표 \| DSR 계산기·LTV 계산기` | 추정: `DSR 40% 대출 한도`, `DSR 40% 연봉별 대출 가능액`, `연봉별 주담대 한도`, `연봉 5000 대출 한도`, `연봉 6000 주담대 한도`, `주담대 한도 계산`, `DSR 계산기` | 내 연봉이면 대출이 얼마까지 가능한지 표로 바로 확인 | 2026-06-02 변경 후 `연봉별 대출 가능액`과 `연봉 3천 4천 6천 1억` 같은 검색형 문구가 title/description에서 사라졌다. `연소득별`은 정확하지만 검색어로는 `연봉별`보다 약할 가능성이 있다. | `연봉별 대출 가능액`을 title과 description 전면에 복원하고, `주담대 한도표`는 보조로 둔다. 예: `DSR 40% 연봉별 대출 가능액 표: 주담대 한도 계산`. 도입부 첫 문장도 `연봉 4천/6천/1억` query를 유지한다. | P0 |

## DSR 글 변경 전후 비교

`/posts/personalFinance/dsr-40-income-loan-limit-table`은 2026-06-02와 2026-06-04에 실제 변경이 있었다. 네이버 유입 감소 기간 직전 변경이므로 별도 추적 대상이다.

| 항목 | 2026-06-01 이전 | 2026-06-02 이후 현재 | 콘텐츠/검색어 관점 해석 |
| --- | --- | --- | --- |
| title | `DSR 40% 기준 연봉별 대출 가능액 표` | `DSR 40%면 연소득별 주담대 한도는 얼마나 될까?` | 이전 문구는 `DSR 40%`, `연봉별`, `대출 가능액`, `표`가 모두 직접 검색어형이었다. 현재 문구는 자연스럽지만 exact-match가 줄었다. |
| description | `DSR 40%, 금리 연 4.0%, 30년 원리금균등 상환을 가정해 연봉 3천만원부터 1.2억원까지 추정 대출 가능액을 표로 정리했습니다.` | `DSR 40%, 금리 연 4.0%, 30년 원리금균등 상환을 가정해 연소득별 월 상환 가능액과 추정 주담대 한도를 정리했습니다.` | `연봉 3천만원부터 1.2억원`, `대출 가능액`, `표`가 약해졌다. 네이버 스니펫에서 숫자 구간이 사라진 점은 CTR 하락 후보다. |
| seoTitle | `DSR 40% 연봉별 대출 가능액 표 \| 연봉 3천 4천 6천 1억` | `DSR 40% 연소득별 주담대 한도표 \| DSR 계산기·LTV 계산기` | 이전 title은 검색자가 바로 입력할 만한 salary-specific phrase를 포함했다. 현재 title은 도구/브랜드 흐름은 좋아졌지만 자료형 검색에는 덜 직접적이다. |
| seoDescription | `연봉별로 DSR 40% 기준 대출 가능액이 어느 정도인지 금리 4%, 30년 원리금균등 기준으로 계산한 참고표입니다.` | `연소득별 DSR 40% 주담대 한도를 금리 4%, 30년 원리금균등 기준으로 정리하고 DSR/LTV 계산기와 부동산 실거래 대시보드 활용법을 안내합니다.` | 현재 description은 내부 도구 연결을 잘 설명하지만 검색 결과에서 사용자가 찾는 `내 연봉이면 얼마?` 의도가 덜 선명할 수 있다. |
| 도입부 | `집을 알아볼 때 “연봉이 이 정도면 대출이 얼마나 나올까?”라는 질문은 거의 항상 먼저 나옵니다...` | `연봉이 4,000만원인지, 6,000만원인지, 1억원인지에 따라 주담대 한도는 크게 달라집니다...` | 현재 도입부는 여전히 좋다. 다만 title/description에서 약해진 `연봉별 대출 가능액`을 도입부만으로 보완하기는 어렵다. |

DSR 글의 추천 복구 방향은 전체 되돌리기가 아니라, 현재 계산기/대시보드 연결 장점은 유지하면서 title과 description에 이전의 검색어형 문구를 부분 복원하는 것이다.

## 내부 링크 보강 제안

| 대상 URL | 현재 관찰 | 보강하면 좋은 출처 | 추천 앵커 문구 |
| --- | --- | --- | --- |
| `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi` | `usd-krw-exchange-rate-and-kospi`, `dxy-market-impact`, `sp500-impact-on-korea-kospi`, `tnx-basics`, `fx-basics` 등에서 이미 일부 링크가 있다. | 환율/달러/유가/전쟁 리스크 글의 상단 요약 또는 관련 읽기 영역. 특히 `fx-basics`, `usd-krw-exchange-rate-and-kospi`, `dxy-dollar-index-basics`, `war-theme-investing-price-chain-not-winners`. | `환율 상승 수혜주·피해주`, `원화 약세 수혜 업종`, `환율 오르면 유리한 코스피 업종` |
| `/tools/cagr-calculator` | 다수의 투자/복리 글과 `ToolCta`, `ToolBacklinkKit`, tools index에서 이미 링크가 있다. | `what-is-cagr`, `simple-vs-compound`, `compound-return-3-5-7-10-table`, `cagr-7percent-reality-check`, `diagnose-investing-skill-with-cagr`, `why-check-cagr-etf`의 계산 예시 직후. | `CAGR 계산기`, `연평균 수익률 계산기`, `초기금액·최종금액으로 CAGR 계산` |
| `/posts/personalFinance/what-is-cagr` | `what-is-cagr` 자체에서 계산기로 연결되고, 여러 복리/투자 글에서 일부 링크가 있다. | `simple-vs-compound`, `compound-return-3-5-7-10-table`, `dca-fx-volatility-decomposition`, `indicator-basics`, `inflation-rate-basics`, `why-check-cagr-etf`의 용어 설명 위치. | `CAGR 뜻과 공식`, `CAGR 계산법`, `단순 수익률과 CAGR 차이` |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | `DsrLtvCalculator`와 DSR/LTV 관련 글 흐름에서 링크가 확인된다. 전체 투자 글 대비 부동산/대출 클러스터 내 앵커 강화 여지가 크다. | `pages/tools/dsr-ltv-calculator.js`, `interest-rate-1p-loan-limit-impact`, `mortgage-risk-checklist-dsr-variable`, `dsr-pass-ltv-cash-bottleneck`, `apt-dashboard-home-goal-roadmap`, 실거래 대시보드 가이드성 글. | `DSR 40% 연봉별 대출 가능액 표`, `연봉별 주담대 한도`, `연봉 6천 주담대 한도 계산` |

## 네이버 CTR용 후보 문구

### `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi`

| 구분 | 후보 |
| --- | --- |
| Title 1 | `환율 상승 수혜주·피해주: 원화 약세 때 코스피 업종 정리` |
| Title 2 | `원달러 환율 오르면 어떤 주식이 유리할까? 수혜 업종 체크리스트` |
| Title 3 | `원화 약세 수혜주와 피해주: 수출주·항공·원자재 업종별 정리` |
| Description 1 | `환율 상승 때 수혜를 볼 수 있는 업종과 비용 부담이 커지는 업종을 수출주, 내수주, 항공, 운송, 2차전지 관점에서 정리합니다.` |
| Description 2 | `원달러 환율이 오를 때 어떤 코스피 업종이 유리하고 불리한지 표와 체크리스트로 빠르게 확인하세요.` |
| Description 3 | `원화 약세 국면에서 수혜주와 피해주를 단순 테마가 아니라 매출 통화, 비용 구조, 외국인 수급 기준으로 구분합니다.` |

### `/tools/cagr-calculator`

| 구분 | 후보 |
| --- | --- |
| Title 1 | `CAGR 계산기: 연평균 수익률·연복리 수익률 바로 계산` |
| Title 2 | `연평균 수익률 계산기: 초기금액·최종금액으로 CAGR 계산` |
| Title 3 | `CAGR 계산기와 공식: 투자 수익률을 연평균으로 환산하기` |
| Description 1 | `초기 자산, 최종 자산, 기간을 입력하면 CAGR과 세금·수수료 전후 연평균 수익률을 바로 계산합니다.` |
| Description 2 | `주식, ETF, 부동산, 코인 성과를 같은 기간 기준으로 비교할 수 있도록 CAGR 공식과 계산 결과를 함께 제공합니다.` |
| Description 3 | `단순 수익률이 아니라 연평균 복리 수익률로 내 투자 성과를 확인하세요. 기간별 성장 흐름도 함께 볼 수 있습니다.` |

### `/posts/personalFinance/what-is-cagr`

| 구분 | 후보 |
| --- | --- |
| Title 1 | `CAGR 뜻과 계산법: 공식·예시·단순 수익률 차이` |
| Title 2 | `CAGR이란? 연평균 수익률 공식과 투자 예시 정리` |
| Title 3 | `CAGR 계산법 쉽게 이해하기: 단순 수익률과 왜 다를까` |
| Description 1 | `CAGR의 뜻, 공식, 계산 예시를 단순 수익률과 비교해 설명합니다. 기간이 다른 투자 성과를 같은 기준으로 보는 방법입니다.` |
| Description 2 | `연평균 복리 수익률이 무엇인지, 왜 단순 수익률보다 투자 성과 비교에 유용한지 예시와 계산기로 확인하세요.` |
| Description 3 | `CAGR 공식과 실제 계산 흐름을 ETF·주식·부동산 성과 비교 관점에서 정리했습니다.` |

### `/posts/personalFinance/dsr-40-income-loan-limit-table`

| 구분 | 후보 |
| --- | --- |
| Title 1 | `DSR 40% 연봉별 대출 가능액 표: 주담대 한도 계산` |
| Title 2 | `연봉별 주담대 한도표: DSR 40%면 얼마까지 가능할까?` |
| Title 3 | `DSR 40% 대출 한도 계산: 연봉 4천·6천·1억 주담대 표` |
| Description 1 | `DSR 40%, 금리 4%, 30년 원리금균등 기준으로 연봉별 대출 가능액과 월 상환 가능액을 표로 정리합니다.` |
| Description 2 | `연봉 4천, 6천, 1억원이면 주담대 한도가 어느 정도인지 빠르게 확인하고 DSR/LTV 계산기로 내 조건을 다시 계산하세요.` |
| Description 3 | `연봉별 DSR 40% 주담대 한도와 기존 대출이 있을 때 줄어드는 한도를 함께 비교합니다.` |

## 추천 적용 순서

1. P0: DSR 글의 SEO title/description 후보를 `연봉별 대출 가능액 표` 중심으로 재조정한다. 현재 계산기/대시보드 연결 문맥은 유지하고, 검색 결과 문구만 이전 exact-match를 일부 복원하는 방향이 안전하다.
2. P0: 환율 섹터 글은 `환율 상승 수혜주`를 title 첫머리에 둔 후보를 우선 검토한다. 본문 구조는 유지하되, 도입부 첫 2문단에 "환율 오르면 유리한 업종/불리한 업종" 답을 더 즉시 보이게 하는 편이 좋다.
3. P1: CAGR 계산기는 title을 짧게 다듬거나 H1/lead에서 `계산기`, `초기금액`, `최종금액`, `기간`을 더 직접적으로 드러낸다. 검색어 매칭 자체는 양호하므로 급한 되돌림보다는 CTR 테스트 후보로 본다.
4. P1: CAGR 해설 글은 `CAGR 뜻`, `공식`, `계산법`을 하나의 title에 담는 후보를 검토한다. 도입부 첫 문장에는 `CAGR 뜻 = 연평균 복리 수익률`을 더 명시적으로 배치한다.
5. P2: 내부 링크는 새 글을 만들기보다 기존 클러스터의 상단 요약, 계산 예시 직후, 관련 글 영역에서 exact-match 앵커를 보강한다.

## 확인한 명령

- `Get-Content -Path content\posts\investingInfo\ko\usd-krw-weak-won-sector-map-kospi.md -Encoding UTF8`
- `Get-Content -Path content\posts\personalFinance\ko\what-is-cagr.md -Encoding UTF8`
- `Get-Content -Path content\posts\personalFinance\ko\dsr-40-income-loan-limit-table.md -Encoding UTF8`
- `Get-Content -Path pages\tools\cagr-calculator.js -Encoding UTF8`
- `rg -n "/posts/investingInfo/usd-krw-weak-won-sector-map-kospi|/tools/cagr-calculator|/posts/personalFinance/what-is-cagr|/posts/personalFinance/dsr-40-income-loan-limit-table" content pages _components lib scripts reports --glob "*.md" --glob "*.js"`
- `git log --since="2026-06-01" --date=short --pretty=format:"%h %ad %s" -- content\posts\personalFinance\ko\dsr-40-income-loan-limit-table.md`
- `git show --no-ext-diff --unified=30 6f5fa77 -- content\posts\personalFinance\ko\dsr-40-income-loan-limit-table.md`
- `git show --no-ext-diff --unified=30 9e1fc55 -- content\posts\personalFinance\ko\dsr-40-income-loan-limit-table.md`
