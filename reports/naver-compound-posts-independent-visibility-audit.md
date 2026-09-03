# FinMap 네이버 복리 포스팅 독립 노출 감사

감사 기준일: 2026-09-03

이번 감사는 네이버에서 `/tools/compound-interest`가 `복리 계산기` 대표 후보로 보이는 상황에서, 복리 관련 포스트들이 별도 검색 의도를 맡을 수 있는지 현재 source-level 상태를 점검한다. 계산기 SEO title/description/H1/FAQ, canonical/hreflang, sitemap/RSS/robots 정책, GA4, package.json 회귀 여부는 별도 검증 대상으로 둔다.

## 1. 현재 현상 요약

- 관찰 전제: 네이버에서 `복리 계산기` 계열은 계산기 페이지가 대표 후보로 먼저 잡히는 상태다.
- 감사 질문: 포스트들이 `복리 계산기 사용법`, `단리 vs 복리`, `연복리 월복리`, `월 50만원 적립식 투자`처럼 독립 의도를 맡을 수 있는가.
- Codex는 네이버 SERP를 임의 판단하지 않았다. 실제 일반 검색/site 검색 결과는 `reports/naver-compound-posts-serp-observation-template.md`에 수동 기록한다.
- Source-level 결과: technical fail 0개, warning 8개.

## 2. 기술적 색인 문제 여부 판단

| 항목 | 판정 | 근거 |
| --- | --- | --- |
| 포스트 공통 페이지 존재 | PASS | pages/posts/[category]/[slug].js |
| 자동 BlogPosting 생성 | PASS | headline/description/dateModified를 post 데이터에서 생성 |
| SeoHead self URL | PASS | post canonical URL source marker |
| 렌더 H1 | PASS | post.title 기반 H1 source marker |

## 3. 일반 검색에서 tool만 노출되는 현상 해석

- 계산기 페이지는 검색어 `복리 계산기`와 직접 일치하고, 사용자가 즉시 계산할 수 있는 도구형 의도에 강하다.
- 포스트는 정보형/비교형/사용법 의도에서 별도 후보가 되어야 한다.
- 따라서 일반 검색에서 tool만 대표 노출된다면 기술적 미색인보다 "포스트의 독립 검색 의도 신호와 내부 링크 배분" 문제일 가능성이 높다.
- 수동 Article JSON-LD가 남아 있다면 구조 리스크로 별도 표시한다.

## 4. 포스트별 담당 검색 의도

| URL | 담당 검색 의도 |
| --- | --- |
| /posts/personalFinance/compound-calculator-guide | 복리 계산기 사용법<br>복리 계산 방법<br>복리 계산 순서<br>FinMap 복리 계산 가이드 |
| /posts/personalFinance/simple-vs-compound | 단리 vs 복리<br>단리 복리 차이<br>단리와 복리 |
| /posts/personalFinance/annual-vs-monthly-compound | 연복리 월복리<br>월복리 연복리 차이<br>연복리와 월복리 |
| /posts/personalFinance/monthly-dca-10-year-result | 적립식 복리 계산<br>월 50만원 적립식 투자<br>월 적립식 투자 10년 |
| /posts/personalFinance/how-much-per-month-for-100m | 1억 모으기 월 납입<br>1억 만들기 복리<br>목표금액 복리 계산 |
| /posts/personalFinance/goal-amount-fast-strategy | 목표금액 모으는 법<br>복리로 목표금액 |
| /posts/personalFinance/what-is-cagr | CAGR이란<br>CAGR 계산법<br>연평균 복리 수익률 |

## 5. 포스트별 title/description/H1 매칭

| URL | Status | title | seoTitle | H1 | description | Query field hits |
| --- | --- | --- | --- | --- | --- | --- |
| /posts/personalFinance/compound-calculator-guide | PASS | 복리 계산기 사용법: 월복리·연복리·적립식 결과 보는 법 | 복리 계산기 사용법: 월복리·연복리·적립식 결과 보는 법 | 복리 계산기 사용법: 월복리·연복리·적립식 결과 보는 법 | 복리 계산기로 원금, 월 적립금, 수익률, 기간을 입력해 월복리·연복리·적립식 투자 결과를 비교하는 방법을 정리합니다. 세금, 수수료, 물가상승률과 추가 납입 시나리오를 해석하는 순서도 함께 확인하세요. | 복리 계산기 사용법: title, seoTitle, h1, top500<br>복리 계산 방법: title, seoTitle, h1, description, seoDescription, top500<br>복리 계산 순서: title, seoTitle, h1, description, seoDescription, top500<br>FinMap 복리 계산 가이드: title, seoTitle, h1, description, seoDescription, top500 |
| /posts/personalFinance/simple-vs-compound | PASS | 단리 vs 복리: 월 30만원 예시로 보는 장기 자산 차이 | 단리 vs 복리 계산: 월 30만원 투자 예시로 보는 장기 차이 | 단리 vs 복리 계산: 월 30만원 투자 예시로 보는 장기 차이 | 단리·복리 차이는 공식이 아니라 ‘돈이 불어나는 경로’에서 벌어집니다. 예금·적금·투자에서 복리의 작동 지점을 표로 정리하고, 계산기로 직접 확인합니다. | 단리 vs 복리: title, seoTitle, h1, description, seoDescription, top500<br>단리 복리 차이: title, seoTitle, h1, description, seoDescription, top500<br>단리와 복리: title, seoTitle, h1, description, seoDescription, top500 |
| /posts/personalFinance/annual-vs-monthly-compound | PASS | 연복리 vs 월복리: 목표 도달 기간은 얼마나 달라질까? | 연복리 vs 월복리: 목표 달성 기간이 얼마나 달라질까? | 연복리 vs 월복리: 목표 달성 기간이 얼마나 달라질까? | 연복리와 월복리의 차이를 실제 수치와 예시로 설명하고, 목표 금액 도달 속도에 어떤 영향을 미치는지 쉽게 이해할 수 있도록 정리했습니다. | 연복리 월복리: title, seoTitle, h1, description, seoDescription, top500<br>월복리 연복리 차이: description, seoDescription, top500<br>연복리와 월복리: title, seoTitle, h1, description, seoDescription, top500 |
| /posts/personalFinance/monthly-dca-10-year-result | PASS | 월 50만원 적립식 투자, 10년 후 얼마가 될까? | 월 50만원 적립식 투자 10년 후 예상 금액: DCA 계산 예시 | 월 50만원 적립식 투자 10년 후 예상 금액: DCA 계산 예시 | 월 50만원을 10년 동안 적립식으로 투자하면 원금 6천만원이 어떤 범위의 결과로 바뀔 수 있는지 단순 예시로 계산하고, DCA 계산기·복리 계산기·목표자산 시뮬레이터로 내 숫자를 확인하는 방법을 정리합니다. | 적립식 복리 계산: description, top500<br>월 50만원 적립식 투자: title, seoTitle, h1, description, seoDescription, top500<br>월 적립식 투자 10년: title, seoTitle, h1, description, seoDescription, top500 |
| /posts/personalFinance/how-much-per-month-for-100m | WARN | 1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금 | 1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금 | 1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금 | 1억 모으려면 연 5% 가정 시 5년 월 약 147만원, 10년 약 64만원, 15년 약 37만원이 필요합니다. 수익률별 표와 목표자산 계산기로 내 계획을 확인하세요. | 1억 모으기 월 납입: top500<br>1억 만들기 복리: -<br>목표금액 복리 계산: top500 |
| /posts/personalFinance/goal-amount-fast-strategy | WARN | 목표 금액을 빠르게 모으는 법: 원금·수익률·기간의 균형 | 목표 금액 빨리 모으는 법: 원금·수익률·기간 중 무엇을 바꿀까? | 목표 금액 빨리 모으는 법: 원금·수익률·기간 중 무엇을 바꿀까? | 목표 자산을 빠르게 만들기 위해서는 원금·수익률·기간의 균형이 핵심입니다. 제한된 소득 안에서 어떻게 목표 금액을 앞당길 수 있는지 실전 관점에서 정리했습니다. | 목표금액 모으는 법: top500<br>복리로 목표금액: top500 |
| /posts/personalFinance/what-is-cagr | PASS | CAGR이란 무엇인가? 단순 수익률과의 차이 이해하기 | CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시 | CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시 | CAGR은 투자 성과를 연평균 복리 기준으로 측정하는 지표입니다. 단순 수익률과 비교하면 투자 기간 동안 실제 성장 속도를 더 정확하게 보여줍니다. | CAGR이란: title<br>CAGR 계산법: seoTitle, h1, top500<br>연평균 복리 수익률: description, top500 |

## 6. 브랜드명 FinMap 포함 여부

| URL | Title/seoTitle | Description/seoDescription | Top body 500 | Full body |
| --- | --- | --- | --- | --- |
| /posts/personalFinance/compound-calculator-guide | no | no | yes | yes |
| /posts/personalFinance/simple-vs-compound | no | no | yes | yes |
| /posts/personalFinance/annual-vs-monthly-compound | no | no | yes | yes |
| /posts/personalFinance/monthly-dca-10-year-result | no | no | yes | yes |
| /posts/personalFinance/how-much-per-month-for-100m | no | no | yes | yes |
| /posts/personalFinance/goal-amount-fast-strategy | no | no | yes | yes |
| /posts/personalFinance/what-is-cagr | no | no | yes | yes |

## 7. 계산기 링크가 과도하게 앞서는지 여부

| URL | Status | Tool links | First calculator link | Note |
| --- | --- | ---: | --- | --- |
| /posts/personalFinance/compound-calculator-guide | PASS | 2 | /tools/compound-interest / 복리 계산기 / index 101 | 초반 링크지만 글 목적 신호가 앞/동시에 확인됨 |
| /posts/personalFinance/simple-vs-compound | PASS | 3 | /tools/compound-interest / 복리 계산기 / index 8828 | 계산기 링크가 본문 목적 설명 이후 등장 |
| /posts/personalFinance/annual-vs-monthly-compound | PASS | 4 | /tools/compound-interest / 복리 계산 공식과 월복리 결과 비교하기 / index 1993 | 계산기 링크가 본문 목적 설명 이후 등장 |
| /posts/personalFinance/monthly-dca-10-year-result | PASS | 11 | /tools/dca-calculator / DCA 계산기 / index 456 | 초반 링크지만 글 목적 신호가 앞/동시에 확인됨 |
| /posts/personalFinance/how-much-per-month-for-100m | PASS | 7 | /tools/goal-simulator / 목표자산 계산기에서 현재 자산·월 투자금·기간을 입력해 1억 도달 계획 확인하기 / index 1124 | 계산기 링크가 본문 목적 설명 이후 등장 |
| /posts/personalFinance/goal-amount-fast-strategy | PASS | 3 | /tools/goal-simulator / 목표 자산 도달 시뮬레이터 / index 2422 | 계산기 링크가 본문 목적 설명 이후 등장 |
| /posts/personalFinance/what-is-cagr | PASS | 6 | /tools/cagr-calculator / 시작금액과 최종금액으로 CAGR 계산하기 / index 940 | 계산기 링크가 본문 목적 설명 이후 등장 |

## 8. 포스트끼리 내부링크 구조

| URL | Related post links | Links to audited cluster | Cluster link detail |
| --- | ---: | ---: | --- |
| /posts/personalFinance/compound-calculator-guide | 5 | 5 | /posts/personalFinance/simple-vs-compound (단리와 복리 차이를 월 30만원 예시로 비교하기)<br>/posts/personalFinance/annual-vs-monthly-compound (연복리와 월복리 차이를 계산 주기별로 보기)<br>/posts/personalFinance/monthly-dca-10-year-result (월 50만원 적립식 투자 10년 결과 예시 보기)<br>/posts/personalFinance/how-much-per-month-for-100m (1억 모으기 월 납입액과 기간 계산하기)<br>/posts/personalFinance/goal-amount-fast-strategy (목표금액을 복리로 앞당기는 변수 정리하기) |
| /posts/personalFinance/simple-vs-compound | 8 | 5 | /posts/personalFinance/annual-vs-monthly-compound (연복리 vs 월복리: 목표 도달 속도를 바꾸는 ‘주기’ 차이)<br>/posts/personalFinance/what-is-cagr (CAGR로 내 수익률을 한 줄로 정리하는 방법(단순 수익률과 차이))<br>/posts/personalFinance/goal-amount-fast-strategy (목표 금액을 더 빨리 모으는 3변수 균형(원금·수익률·기간))<br>/posts/personalFinance/annual-vs-monthly-compound (연복리와 월복리 차이를 장기 투자 관점에서 보기)<br>/posts/personalFinance/what-is-cagr (CAGR 뜻과 단순 수익률의 차이 이해하기) |
| /posts/personalFinance/annual-vs-monthly-compound | 5 | 5 | /posts/personalFinance/simple-vs-compound (단리 vs 복리 계산)<br>/posts/personalFinance/monthly-dca-10-year-result (월 50만원 적립식 투자 10년 예시)<br>/posts/personalFinance/goal-amount-fast-strategy (목표 금액 빨리 모으는 법)<br>/posts/personalFinance/how-much-per-month-for-100m (1억 모으기 월 투자금 계산)<br>/posts/personalFinance/simple-vs-compound (단리와 복리 차이를 실제 숫자로 비교하기) |
| /posts/personalFinance/monthly-dca-10-year-result | 8 | 5 | /posts/personalFinance/how-much-per-month-for-100m (1억 모으려면 월 얼마가 필요한지 보기)<br>/posts/personalFinance/goal-amount-fast-strategy (목표 금액을 빠르게 모으는 법)<br>/posts/personalFinance/annual-vs-monthly-compound (연복리 vs 월복리)<br>/posts/personalFinance/simple-vs-compound (단리와 복리 차이)<br>/posts/personalFinance/compound-calculator-guide (복리 계산기 사용법으로 월복리·적립식 결과 읽는 순서 보기) |
| /posts/personalFinance/how-much-per-month-for-100m | 5 | 1 | /posts/personalFinance/compound-calculator-guide (복리 계산기 사용법으로 수익률·세금·수수료 결과 읽기) |
| /posts/personalFinance/goal-amount-fast-strategy | 4 | 4 | /posts/personalFinance/how-much-per-month-for-100m (1억 모으기 월 투자금 계산)<br>/posts/personalFinance/annual-vs-monthly-compound (연복리 vs 월복리)<br>/posts/personalFinance/simple-vs-compound (단리 vs 복리 계산)<br>/posts/personalFinance/monthly-dca-10-year-result (월 50만원 적립식 투자 10년 예시로 기준선 잡기) |
| /posts/personalFinance/what-is-cagr | 6 | 1 | /posts/personalFinance/simple-vs-compound (복리란 무엇인가? 쉽게 이해하는 복리의 힘) |

## 9. 계산기 → 포스트 역방향 링크 구조

| Post URL | Status | Link exists | Anchor/title | Generic anchor | Bottom-only | Note |
| --- | --- | --- | --- | --- | --- | --- |
| /posts/personalFinance/compound-calculator-guide | WARN | yes | 복리 계산기 사용법 보기 | no | yes | relatedGuides 렌더링이 소스 하단부(99%)에 위치 |
| /posts/personalFinance/simple-vs-compound | WARN | yes | 단리 vs 복리: 차이와 공식 한 번에 정리 | no | yes | relatedGuides 렌더링이 소스 하단부(99%)에 위치 |
| /posts/personalFinance/annual-vs-monthly-compound | WARN | yes | 복리 주기 차이 해설: 월복리와 연복리 결과가 달라지는 이유 | no | yes | relatedGuides 렌더링이 소스 하단부(99%)에 위치 |
| /posts/personalFinance/monthly-dca-10-year-result | WARN | yes | 월 50만원 적립식 투자, 10년 후 얼마가 될까? | no | yes | relatedGuides 렌더링이 소스 하단부(99%)에 위치 |
| /posts/personalFinance/how-much-per-month-for-100m | WARN | yes | 목표 금액을 위한 월 투자금: 역산으로 계획 세우기 | no | yes | relatedGuides 렌더링이 소스 하단부(99%)에 위치 |
| /posts/personalFinance/goal-amount-fast-strategy | WARN | yes | 목표에 더 빨리 도달하는 방법: 원금·수익률·기간의 균형 | no | yes | relatedGuides 렌더링이 소스 하단부(99%)에 위치 |

## 10. Article/BlogPosting JSON-LD 정합성

| URL | Status | Auto BlogPosting | Manual Article count | Expected headline | Expected description | Expected dateModified | Detail |
| --- | --- | --- | ---: | --- | --- | --- | --- |
| /posts/personalFinance/compound-calculator-guide | PASS | yes | 0 | 복리 계산기 사용법: 월복리·연복리·적립식 결과 보는 법 | 복리 계산기로 원금, 월 적립금, 수익률, 기간을 입력해 월복리·연복리·적립식 투자 결과를 비교하는 방법을 정리합니다. 세금, 수수료, 물가상승률과 추가 납입 시나리오를 해석하는 순서도 함께 확인하세요. | 2026-07-08 | manual Article 없음; 공통 BlogPosting 사용 |
| /posts/personalFinance/simple-vs-compound | PASS | yes | 0 | 단리 vs 복리 계산: 월 30만원 투자 예시로 보는 장기 차이 | 단리와 복리의 차이를 월 적립 예시로 비교하고, 기간·수익률이 장기 결과를 어떻게 바꾸는지 복리 계산기로 확인합니다. | 2026-07-08 | manual Article 없음; 공통 BlogPosting 사용 |
| /posts/personalFinance/annual-vs-monthly-compound | PASS | yes | 0 | 연복리 vs 월복리: 목표 달성 기간이 얼마나 달라질까? | 연복리와 월복리 차이를 목표 금액·월 적립 예시로 비교하고, 복리 계산기와 목표 자산 시뮬레이터로 결과를 확인합니다. | 2026-07-08 | manual Article 없음; 공통 BlogPosting 사용 |
| /posts/personalFinance/monthly-dca-10-year-result | PASS | yes | 0 | 월 50만원 적립식 투자 10년 후 예상 금액: DCA 계산 예시 | 월 50만원을 10년간 적립식 투자하면 얼마가 되는지 원금, 수익률, 기간별 단순 예시로 확인하고 DCA 계산기로 내 조건을 직접 계산해보세요. | 2026-07-08 | manual Article 없음; 공통 BlogPosting 사용 |
| /posts/personalFinance/how-much-per-month-for-100m | PASS | yes | 0 | 1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금 | 1억 모으려면 연 5% 가정 시 5년, 10년, 15년 기준으로 월 약 147만원, 64만원, 37만원이 필요합니다. 1억 모으는 기간과 월 필요금액을 표와 계산기로 확인하세요. | 2026-07-08 | manual Article 없음; 공통 BlogPosting 사용 |
| /posts/personalFinance/goal-amount-fast-strategy | PASS | yes | 0 | 목표 금액 빨리 모으는 법: 원금·수익률·기간 중 무엇을 바꿀까? | 목표 자산을 앞당기려면 월 납입액·기간·수익률 중 무엇을 조정해야 할까요? 목표 자산 시뮬레이터로 필요한 월 투자금을 확인해보세요. | 2026-07-08 | manual Article 없음; 공통 BlogPosting 사용 |
| /posts/personalFinance/what-is-cagr | PASS | yes | 0 | CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시 | CAGR 계산식과 단순 수익률의 차이를 예시로 정리합니다. CAGR 계산기로 기간이 다른 투자 성과를 같은 기준에서 비교해보세요. | 2026-07-22 | manual Article 없음; 공통 BlogPosting 사용 |

## 11. sitemap/RSS/noindex 상태

| URL | sitemap-ko | RSS latest 50 candidate | noindex/draft | dateModified |
| --- | --- | --- | --- | --- |
| /posts/personalFinance/compound-calculator-guide | PASS | PASS | PASS | 2026-07-08 |
| /posts/personalFinance/simple-vs-compound | PASS | PASS | PASS | 2026-07-08 |
| /posts/personalFinance/annual-vs-monthly-compound | PASS | PASS | PASS | 2026-07-08 |
| /posts/personalFinance/monthly-dca-10-year-result | PASS | PASS | PASS | 2026-07-08 |
| /posts/personalFinance/how-much-per-month-for-100m | PASS | PASS | PASS | 2026-07-08 |
| /posts/personalFinance/goal-amount-fast-strategy | PASS | PASS | PASS | 2026-07-08 |
| /posts/personalFinance/what-is-cagr | PASS | PASS | PASS | 2026-07-22 |

## 12. 발견 Gap

- WARN: /posts/personalFinance/how-much-per-month-for-100m - title/seoTitle/H1 target query weak
- WARN: /posts/personalFinance/goal-amount-fast-strategy - title/seoTitle/H1 target query weak
- WARN: 계산기 -> /posts/personalFinance/compound-calculator-guide - relatedGuides 렌더링이 소스 하단부(99%)에 위치
- WARN: 계산기 -> /posts/personalFinance/simple-vs-compound - relatedGuides 렌더링이 소스 하단부(99%)에 위치
- WARN: 계산기 -> /posts/personalFinance/annual-vs-monthly-compound - relatedGuides 렌더링이 소스 하단부(99%)에 위치
- WARN: 계산기 -> /posts/personalFinance/monthly-dca-10-year-result - relatedGuides 렌더링이 소스 하단부(99%)에 위치
- WARN: 계산기 -> /posts/personalFinance/how-much-per-month-for-100m - relatedGuides 렌더링이 소스 하단부(99%)에 위치
- WARN: 계산기 -> /posts/personalFinance/goal-amount-fast-strategy - relatedGuides 렌더링이 소스 하단부(99%)에 위치
- OBSERVE: 네이버 일반 검색/site 검색 실제 노출은 동봉한 SERP 관찰 템플릿에 수동 기록 필요

## 13. 최소 보정 후보

| Priority | Candidate | Reason |
| --- | --- | --- |
| DONE | 수동 Article/BlogPosting 중복 제거 | 대상 포스트 manual Article/BlogPosting 0개 |
| DONE | 계산기 -> compound-calculator-guide 역링크 확인 | 하단 관련 글 영역에서 확인, bottom-only WARN은 유지 |
| DONE | compound-calculator-guide 허브 링크 보강 | 감사 클러스터 링크 5개 |
| DONE | FinMap 브랜드 top body 신호 보강 | 대상 포스트 top body/full body에서 확인 |
| P1 | title/H1 또는 상단 문단의 담당 쿼리 신호 추가 검토 | 2개 포스트 title/H1 기준 약함 |

## 14. 최종 판정

HOLD - site 검색은 노출되나 일반 검색에서 tool만 대표 노출되어 포스트 독립성 보강 필요

## 부록. 수동 SERP 확인 쿼리

- 복리 finmap
- 복리 계산기 사용법 finmap
- 단리 vs 복리 finmap
- 연복리 월복리 finmap
- 월 50만원 적립식 투자 finmap
- 복리 계산 공식 finmap
- site:finmaphub.com "복리 계산기 사용법"
- site:finmaphub.com "단리 vs 복리"
- site:finmaphub.com "연복리와 월복리"
