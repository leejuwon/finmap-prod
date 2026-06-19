# Finmap KO/EN Content Channel Roadmap

- 작성일: 2026-06-19
- 목적: KO는 네이버 서치어드바이저 중심, EN은 Google Search Console + Bing Webmaster Tools 중심으로 신규 포스팅을 분리 운영한다.
- 작업 범위: `content/posts`와 `pages/tools`의 실제 경로를 기준으로 내부링크 가능한 기존 URL을 확인하고, 새 글 후보만 기획한다.
- 주의: 이 문서는 로드맵이다. 신규 글 파일, canonical, hreflang, sitemap, robots 구조는 변경하지 않는다.

## 운영 원칙

| 채널 | 콘텐츠 방향 | 제목/도입부 | FAQ | 내부링크 |
| --- | --- | --- | --- | --- |
| KO / Naver | 한국 사용자가 바로 검색하는 표현, 즉답형 표, 생활형 예시 | "월 얼마", "얼마까지", "왜", "보는 법"처럼 검색어와 가까운 문장 | 짧고 직접적인 질문형 | KO 계산기, KO 기존 글, 부동산/시장 대시보드 |
| EN / GSC+Bing | Evergreen calculator, finance explainer, Korea market guide | Calculator/explainer 키워드와 국제 독자 맥락 | 개념, 입력값, 해석 한계 중심 | EN tools, EN market guide, EN 기존 글 |

## 확인한 실제 내부링크 기준

### Tools

- KO: `/tools/compound-interest`, `/tools/dca-calculator`, `/tools/cagr-calculator`, `/tools/dsr-ltv-calculator`, `/tools/goal-simulator`, `/tools/fire-calculator`
- EN: `/en/tools/compound-interest`, `/en/tools/dca-calculator`, `/en/tools/cagr-calculator`, `/en/tools/dsr-ltv-calculator`, `/en/tools/goal-simulator`, `/en/tools/fire-calculator`

### Market

- KO: `/market`, `/market/indices`, `/market/real-estate`
- EN: `/en/market`, `/en/market/indices`, `/en/market/real-estate`

## KO 네이버용 신규 글 후보 20개

### KO-01

- targetChannel: naver-ko
- title: 복리계산기 사용법: 원금·이자율·기간 넣으면 얼마가 될까?
- slug 제안: `compound-interest-calculator-guide`
- search intent: 복리계산기 사용법, 복리 계산 공식, 투자금 얼마 되는지 즉시 확인
- seoTitle: 복리계산기 사용법: 원금·이자율·기간별 결과 계산
- seoDescription: 복리계산기에 원금, 이자율, 기간을 넣는 순서와 결과표 읽는 법을 예시로 정리합니다.
- H1: 복리계산기 사용법
- 첫 문단 방향: "원금 1,000만원을 연 5%로 10년 굴리면 얼마인가"를 바로 답하고, 아래에서 입력 순서를 설명한다.
- 포함할 표/계산 예시: 원금 1,000만원, 연 3/5/7/10%, 5/10/20년 결과표
- FAQ 3개: 복리계산기는 예금에도 쓸 수 있나요? / 월복리와 연복리는 뭐가 다른가요? / 세금과 수수료는 어떻게 반영하나요?
- 연결할 계산기: `/tools/compound-interest`, `/tools/goal-simulator`
- 연결할 기존 글: `/posts/personalFinance/simple-vs-compound`, `/posts/personalFinance/annual-vs-monthly-compound`, `/posts/personalFinance/compound-return-3-5-7-10-table`
- 발행 우선순위: P0

### KO-02

- targetChannel: naver-ko
- title: 월복리 계산기: 매달 넣으면 10년 뒤 얼마가 될까?
- slug 제안: `monthly-compound-calculator-10y`
- search intent: 월복리 계산, 매월 투자 10년 후 금액, 적립식 복리 결과
- seoTitle: 월복리 계산기: 매달 투자하면 10년 뒤 금액은?
- seoDescription: 월 30만원, 50만원, 100만원을 10년 동안 투자했을 때 복리 결과를 수익률별로 비교합니다.
- H1: 월복리 계산기 10년 결과표
- 첫 문단 방향: 월 50만원 10년 투자 결과를 먼저 보여주고, 수익률이 결과를 얼마나 벌리는지 설명한다.
- 포함할 표/계산 예시: 월 30/50/100만원, 연 3/5/7%, 10년 결과표
- FAQ 3개: 월복리는 매달 이자가 붙는다는 뜻인가요? / 적립식 투자도 복리인가요? / 매달 넣는 돈이 바뀌면 어떻게 계산하나요?
- 연결할 계산기: `/tools/compound-interest`, `/tools/dca-calculator`
- 연결할 기존 글: `/posts/personalFinance/monthly-dca-10-year-result`, `/posts/personalFinance/annual-vs-monthly-compound`, `/posts/personalFinance/monthly-investment-for-100m-table`
- 발행 우선순위: P1

### KO-03

- targetChannel: naver-ko
- title: 적립식 투자 계산기: 월 30만원·50만원·100만원 결과표
- slug 제안: `dca-calculator-monthly-amount-table`
- search intent: 적립식 투자 계산기, 월 투자금별 결과, DCA 계산
- seoTitle: 적립식 투자 계산기: 월 투자금별 10년 결과표
- seoDescription: 월 30만원, 50만원, 100만원을 적립식으로 투자할 때 원금과 예상 결과가 어떻게 달라지는지 표로 정리합니다.
- H1: 적립식 투자 계산기 월 투자금별 결과
- 첫 문단 방향: 월 투자금별 원금부터 먼저 보여주고, 수익률보다 지속 가능한 납입액이 중요하다는 메시지로 연결한다.
- 포함할 표/계산 예시: 월 30/50/100만원, 5/10/15년, 연 3/5/7% 결과표
- FAQ 3개: 적립식 투자는 매달 같은 날 해야 하나요? / 중간에 쉬면 결과가 얼마나 달라지나요? / 수익률은 몇 퍼센트로 넣어야 하나요?
- 연결할 계산기: `/tools/dca-calculator`, `/tools/goal-simulator`
- 연결할 기존 글: `/posts/personalFinance/monthly-dca-10-year-result`, `/posts/personalFinance/dca-step-up-ruleset`, `/posts/personalFinance/dca-vs-lump-sum-when-results-differ`
- 발행 우선순위: P0

### KO-04

- targetChannel: naver-ko
- title: 적립식 투자 수익률 계산: 원금과 수익을 나눠 보는 법
- slug 제안: `dca-return-principal-profit-table`
- search intent: 적립식 투자 수익률 계산, 원금 대비 수익, 투자 결과 해석
- seoTitle: 적립식 투자 수익률 계산: 원금·수익 분리해서 보기
- seoDescription: 적립식 투자 결과를 원금, 평가금액, 수익금, 수익률로 나눠 읽는 방법을 예시로 설명합니다.
- H1: 적립식 투자 수익률 계산법
- 첫 문단 방향: "평가금액만 보면 착시가 생긴다"는 문제를 던지고 원금과 수익을 분리한다.
- 포함할 표/계산 예시: 납입원금, 평가금액, 수익금, 수익률, 연환산 수익률 비교표
- FAQ 3개: 적립식 수익률은 왜 단순 수익률과 다른가요? / 중간 납입금은 어떻게 반영하나요? / 원화 수익률과 달러 수익률은 왜 다르죠?
- 연결할 계산기: `/tools/dca-calculator`, `/tools/cagr-calculator`
- 연결할 기존 글: `/posts/personalFinance/dca-fx-volatility-decomposition`, `/posts/personalFinance/dca-vs-lumpsum-decision-rules`, `/posts/investingInfo/diagnose-investing-skill-with-cagr`
- 발행 우선순위: P1

### KO-05

- targetChannel: naver-ko
- title: CAGR 계산기 사용법: 총수익률을 연평균 수익률로 바꾸는 법
- slug 제안: `cagr-calculator-total-return-to-annual`
- search intent: CAGR 계산기, 연평균 수익률 계산, 총수익률 연환산
- seoTitle: CAGR 계산기 사용법: 총수익률을 연평균 수익률로 변환
- seoDescription: 시작금액, 종료금액, 투자기간을 넣어 CAGR을 계산하고 단순 수익률과 차이를 비교합니다.
- H1: CAGR 계산기 사용법
- 첫 문단 방향: "3년 50% 수익은 연평균 몇 퍼센트인가"를 먼저 계산해 보여준다.
- 포함할 표/계산 예시: 1,000만원에서 1,500만원, 2/3/5년 CAGR 비교표
- FAQ 3개: CAGR은 연 수익률과 같은가요? / 손실이 난 경우도 계산되나요? / 적립식 투자에는 CAGR을 그대로 쓰면 되나요?
- 연결할 계산기: `/tools/cagr-calculator`
- 연결할 기존 글: `/posts/personalFinance/what-is-cagr`, `/posts/investingInfo/why-check-cagr-etf`, `/posts/investingInfo/cagr-7percent-reality-check`
- 발행 우선순위: P0

### KO-06

- targetChannel: naver-ko
- title: ETF 수익률 비교할 때 CAGR을 꼭 봐야 하는 이유
- slug 제안: `etf-cagr-comparison-checklist`
- search intent: ETF 수익률 비교, CAGR ETF, 연평균 수익률 확인
- seoTitle: ETF 수익률 비교: CAGR을 봐야 하는 이유와 계산법
- seoDescription: ETF 총수익률, 1년 수익률, CAGR을 비교해 장기 성과를 더 정확히 읽는 방법을 정리합니다.
- H1: ETF 수익률 비교와 CAGR
- 첫 문단 방향: 같은 총수익률이라도 기간이 다르면 다른 성과라는 점을 ETF A/B 예시로 보여준다.
- 포함할 표/계산 예시: ETF A/B 총수익률, 기간, CAGR, 최대낙폭 비교표
- FAQ 3개: ETF 3년 수익률과 CAGR은 다른가요? / CAGR만 높으면 좋은 ETF인가요? / 배당은 CAGR에 포함되나요?
- 연결할 계산기: `/tools/cagr-calculator`
- 연결할 기존 글: `/posts/investingInfo/why-check-cagr-etf`, `/posts/investingInfo/diagnose-investing-skill-with-cagr`, `/posts/investingInfo/cagr-7percent-reality-check`
- 발행 우선순위: P1

### KO-07

- targetChannel: naver-ko
- title: DSR LTV 계산기: 내 연봉으로 주담대 얼마까지 가능할까?
- slug 제안: `dsr-ltv-calculator-income-home-loan`
- search intent: DSR LTV 계산기, 연봉별 주담대 한도, 아파트 대출 가능액
- seoTitle: DSR LTV 계산기: 연봉별 주담대 한도 계산
- seoDescription: 연봉, 금리, 만기, 기존대출, 보유현금을 넣어 아파트 매수 가능 금액을 계산하는 순서를 정리합니다.
- H1: DSR LTV 계산기 사용법
- 첫 문단 방향: 연봉 6,000만원 예시로 대출 가능액과 현금 병목을 바로 보여준다.
- 포함할 표/계산 예시: 연봉 5천/7천/1억, 금리 3/4/5%, 대출한도와 후보 집값
- FAQ 3개: DSR과 LTV 중 뭐가 더 중요하나요? / 기존 신용대출도 반영해야 하나요? / 보유현금이 부족하면 어떻게 나오나요?
- 연결할 계산기: `/tools/dsr-ltv-calculator`
- 연결할 기존 글: `/posts/personalFinance/dsr-40-income-loan-limit-table`, `/posts/personalFinance/dsr-pass-ltv-cash-bottleneck`, `/posts/personalFinance/mortgage-risk-checklist-dsr-variable`
- 발행 우선순위: P0

### KO-08

- targetChannel: naver-ko
- title: 연봉 5천·7천·1억 DSR 40% 대출한도표
- slug 제안: `dsr-40-income-50m-70m-100m`
- search intent: 연봉별 대출한도, DSR 40% 표, 주담대 가능액
- seoTitle: DSR 40% 연봉별 대출한도: 5천·7천·1억 표
- seoDescription: DSR 40% 기준으로 연봉 5천만원, 7천만원, 1억원의 대출 가능액을 금리별로 비교합니다.
- H1: 연봉별 DSR 40% 대출한도표
- 첫 문단 방향: 가장 많이 검색하는 연봉 구간의 한도를 먼저 표로 보여주고, 금리 1%p 차이를 설명한다.
- 포함할 표/계산 예시: 연봉 5천/7천/1억, 금리 3.5/4.5/5.5%, 30년 원리금균등
- FAQ 3개: DSR 40%면 무조건 이 금액까지 빌릴 수 있나요? / LTV 때문에 한도가 줄어들 수 있나요? / 맞벌이는 합산 소득으로 계산하나요?
- 연결할 계산기: `/tools/dsr-ltv-calculator`
- 연결할 기존 글: `/posts/personalFinance/dsr-40-income-loan-limit-table`, `/posts/personalFinance/interest-rate-1p-loan-limit-impact`, `/posts/personalFinance/cash-100m-200m-300m-apartment-budget`
- 발행 우선순위: P0

### KO-09

- targetChannel: naver-ko
- title: 1억·2억·3억 모으려면 월 얼마씩 투자해야 할까?
- slug 제안: `monthly-investment-target-100m-300m`
- search intent: 1억 모으기 월 얼마, 2억 3억 목표자산, 월 투자금 계산
- seoTitle: 1억·2억·3억 모으려면 월 얼마? 목표자산 계산표
- seoDescription: 목표금액 1억, 2억, 3억원을 기간과 수익률별로 나누어 필요한 월 투자금을 계산합니다.
- H1: 목표자산별 월 투자금 계산
- 첫 문단 방향: 1억 목표를 먼저 답하고, 2억/3억은 같은 공식으로 확장해 보여준다.
- 포함할 표/계산 예시: 목표 1/2/3억, 기간 5/10/15년, 연 3/5/7% 필요 월 투자금
- FAQ 3개: 수익률을 몇 퍼센트로 잡아야 하나요? / 원금만 모으면 월 얼마인가요? / 중간에 납입액을 늘리면 얼마나 빨라지나요?
- 연결할 계산기: `/tools/goal-simulator`, `/tools/compound-interest`
- 연결할 기존 글: `/posts/personalFinance/how-much-per-month-for-100m`, `/posts/personalFinance/monthly-investment-for-100m-table`, `/posts/personalFinance/goal-amount-fast-strategy`
- 발행 우선순위: P0

### KO-10

- targetChannel: naver-ko
- title: 목표자산 계산기 사용법: 기간과 수익률부터 정하는 순서
- slug 제안: `goal-simulator-guide-period-return`
- search intent: 목표자산 계산기, 목표금액 계산, 투자 기간 수익률 설정
- seoTitle: 목표자산 계산기 사용법: 기간·수익률·월 투자금 순서
- seoDescription: 목표금액을 정한 뒤 기간, 수익률, 월 투자금을 어떤 순서로 입력해야 현실적인 계획이 되는지 설명합니다.
- H1: 목표자산 계산기 사용 순서
- 첫 문단 방향: 목표금액보다 먼저 기간과 월 납입 가능액을 고정해야 한다는 점을 생활비 예시로 설명한다.
- 포함할 표/계산 예시: 기간 고정형, 월 투자금 고정형, 수익률 민감도 비교
- FAQ 3개: 목표금액을 먼저 정해도 되나요? / 수익률을 높게 잡으면 왜 위험한가요? / 물가상승률도 반영해야 하나요?
- 연결할 계산기: `/tools/goal-simulator`, `/tools/dca-calculator`
- 연결할 기존 글: `/posts/personalFinance/goal-amount-fast-strategy`, `/posts/personalFinance/how-much-monthly-invest-for-100m`, `/posts/personalFinance/personal-finance-3pillars`
- 발행 우선순위: P1

### KO-11

- targetChannel: naver-ko
- title: 은퇴자금 계산기: 월 생활비별 필요한 자산은 얼마일까?
- slug 제안: `fire-calculator-monthly-spending-target`
- search intent: 은퇴자금 계산기, 월 생활비 은퇴자금, FIRE 계산
- seoTitle: 은퇴자금 계산기: 월 생활비별 필요한 자산 계산
- seoDescription: 월 생활비 200만원, 300만원, 400만원 기준으로 필요한 은퇴자산을 인출률별로 계산합니다.
- H1: 월 생활비별 은퇴자금 계산
- 첫 문단 방향: 월 300만원 생활비라면 4%룰 기준 얼마가 필요한지 먼저 답한다.
- 포함할 표/계산 예시: 월 생활비 200/300/400만원, 인출률 3/4/5%, 필요자산
- FAQ 3개: 4%룰은 한국에서도 그대로 쓰나요? / 국민연금은 어떻게 반영하나요? / 주거비는 생활비에 넣어야 하나요?
- 연결할 계산기: `/tools/fire-calculator`
- 연결할 기존 글: `/posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal`, `/posts/personalFinance/fire-spending-buckets-essential-choice-insurance`, `/posts/personalFinance/fire-assumption-errors-7-fixes`
- 발행 우선순위: P0

### KO-12

- targetChannel: naver-ko
- title: FIRE 계산 전 꼭 넣어야 할 5가지 가정
- slug 제안: `fire-calculator-assumptions-checklist`
- search intent: FIRE 계산, 은퇴 계산 가정, 조기은퇴 준비
- seoTitle: FIRE 계산 전 체크할 5가지 가정: 수익률·물가·세금
- seoDescription: FIRE 계산에서 자주 빠지는 수익률, 물가, 세금, 현금흐름, 순서 리스크 가정을 체크리스트로 정리합니다.
- H1: FIRE 계산 가정 체크리스트
- 첫 문단 방향: 계산 결과보다 입력 가정이 더 중요하다는 점을 실패 사례 중심으로 연다.
- 포함할 표/계산 예시: 낙관/기준/보수 가정별 은퇴 가능 시점 비교
- FAQ 3개: 물가상승률은 몇 퍼센트로 넣나요? / 세금은 어떻게 반영하나요? / 은퇴 직후 하락장은 왜 위험한가요?
- 연결할 계산기: `/tools/fire-calculator`, `/tools/goal-simulator`
- 연결할 기존 글: `/posts/personalFinance/fire-assumption-errors-7-fixes`, `/posts/personalFinance/fire-sequence-risk-first-5-years`, `/posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal`
- 발행 우선순위: P1

### KO-13

- targetChannel: naver-ko
- title: 원달러 환율 오르면 코스피는 왜 흔들릴까?
- slug 제안: `usd-krw-rise-kospi-impact`
- search intent: 원달러 환율 상승 코스피 영향, 환율 오르면 주식, 외국인 수급
- seoTitle: 원달러 환율 오르면 코스피가 흔들리는 이유
- seoDescription: 원달러 환율 상승이 외국인 수급, 수출주, 물가, 금리를 통해 코스피에 전이되는 경로를 정리합니다.
- H1: 원달러 환율 상승과 코스피 영향
- 첫 문단 방향: 환율 상승을 "수출주 호재"로만 보면 틀리는 이유를 먼저 짚는다.
- 포함할 표/계산 예시: 환율 상승 시 수출주/내수주/항공/원자재 업종 영향표
- FAQ 3개: 환율이 오르면 수출주는 항상 좋나요? / 외국인은 왜 환율에 민감한가요? / 환율과 코스피를 같이 볼 때 먼저 볼 지표는?
- 연결할 계산기: `/market/indices`
- 연결할 기존 글: `/posts/investingInfo/usd-krw-exchange-rate-and-kospi`, `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi`, `/posts/economicInfo/fx-basics`
- 발행 우선순위: P0

### KO-14

- targetChannel: naver-ko
- title: 환율 1400원 의미: 내 투자·대출·물가 체크리스트
- slug 제안: `usd-krw-1400-checklist`
- search intent: 환율 1400원 의미, 원달러 환율 급등, 개인 투자 영향
- seoTitle: 환율 1400원 의미: 투자·대출·물가 체크리스트
- seoDescription: 원달러 환율 1400원 전후에서 개인 투자자와 가계가 확인해야 할 환율, 물가, 금리, 해외자산 체크포인트를 정리합니다.
- H1: 환율 1400원 체크리스트
- 첫 문단 방향: 숫자 자체보다 환율이 오래 머무는지, 금리와 유가가 함께 움직이는지가 중요하다고 설명한다.
- 포함할 표/계산 예시: 환율 상승 국면의 해외자산, 수입물가, 대출금리, 생활비 영향 체크표
- FAQ 3개: 환율 1400원이면 위기인가요? / 해외 ETF는 환차익이 생기나요? / 환율이 내려가면 코스피는 무조건 오르나요?
- 연결할 계산기: `/market/indices`, `/tools/dca-calculator`
- 연결할 기존 글: `/posts/investingInfo/dxy-market-impact`, `/posts/investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions`, `/posts/personalFinance/dca-fx-volatility-decomposition`
- 발행 우선순위: P1

### KO-15

- targetChannel: naver-ko
- title: 미국 10년물 금리 오르면 코스피가 하락하는 이유
- slug 제안: `us10y-rise-kospi-down-reason`
- search intent: 미국 10년물 금리 코스피 영향, TNX 상승, 금리 오르면 주식 하락
- seoTitle: 미국 10년물 금리 상승이 코스피를 흔드는 이유
- seoDescription: 미국 10년물 금리 상승이 할인율, 달러, 외국인 수급, 성장주 밸류에이션을 통해 코스피에 미치는 영향을 정리합니다.
- H1: 미국 10년물 금리와 코스피
- 첫 문단 방향: 금리가 오르면 왜 한국 주식까지 영향을 받는지 할인율과 달러 경로로 바로 설명한다.
- 포함할 표/계산 예시: TNX 상승 시 성장주, 가치주, 채권, 환율 영향표
- FAQ 3개: 미국 금리가 오르면 한국 금리도 오르나요? / 성장주가 더 민감한 이유는? / TNX는 어디서 확인하나요?
- 연결할 계산기: `/market/indices`
- 연결할 기존 글: `/posts/investingInfo/us10y-impact-on-korea-and-stock-market`, `/posts/investingInfo/tnx-basics`, `/posts/investingInfo/etf-impact-of-tnx`
- 발행 우선순위: P0

### KO-16

- targetChannel: naver-ko
- title: 미국 금리와 원달러 환율을 같이 보는 법
- slug 제안: `us-yield-usdkrw-read-together`
- search intent: 미국 금리 환율 관계, TNX 원달러, 금리 환율 코스피
- seoTitle: 미국 금리와 원달러 환율 같이 보는 법
- seoDescription: 미국 10년물 금리, 달러인덱스, 원달러 환율을 함께 읽어 코스피 환경을 판단하는 순서를 정리합니다.
- H1: 미국 금리와 원달러 환율 같이 읽기
- 첫 문단 방향: 금리와 환율이 같은 방향으로 움직일 때와 다른 방향으로 움직일 때 해석이 달라진다고 연다.
- 포함할 표/계산 예시: TNX 상승/DXY 상승/USDKRW 상승 조합별 시장 해석표
- FAQ 3개: 금리가 오르면 달러도 오르나요? / DXY와 원달러는 왜 다르게 움직이나요? / 코스피에는 어떤 조합이 가장 부담인가요?
- 연결할 계산기: `/market/indices`
- 연결할 기존 글: `/posts/investingInfo/tnx-basics`, `/posts/investingInfo/dxy-market-impact`, `/posts/investingInfo/usd-krw-exchange-rate-and-kospi`
- 발행 우선순위: P1

### KO-17

- targetChannel: naver-ko
- title: 유가 오르면 한국 업종별 영향은? 항공·화학·정유·자동차 정리
- slug 제안: `wti-oil-rise-korea-sector-impact`
- search intent: 유가 상승 업종 영향, WTI 한국 주식, 정유 항공 화학 영향
- seoTitle: 유가 상승 업종별 영향: 항공·화학·정유·자동차
- seoDescription: WTI 유가 상승이 한국 업종별 비용, 마진, 물가, 환율에 미치는 영향을 표로 정리합니다.
- H1: 유가 상승과 한국 업종 영향
- 첫 문단 방향: 유가 상승은 정유주만의 호재가 아니라 비용과 수요를 동시에 바꾸는 변수라고 설명한다.
- 포함할 표/계산 예시: 항공, 화학, 정유, 자동차, 운송, 내수 업종 영향표
- FAQ 3개: 유가가 오르면 정유주는 항상 오르나요? / 항공주는 왜 부담을 받나요? / 유가와 환율을 같이 봐야 하는 이유는?
- 연결할 계산기: `/market/indices`
- 연결할 기존 글: `/posts/investingInfo/wti-impact-on-korea-kospi`, `/posts/economicInfo/oil-shock-to-usdkrw-korea-transmission`, `/posts/economicInfo/war-risk-oil-supply-insurance-shipping`
- 발행 우선순위: P0

### KO-18

- targetChannel: naver-ko
- title: 국제유가 급등 때 항공·화학·정유주 체크포인트
- slug 제안: `oil-spike-korea-sector-checklist`
- search intent: 국제유가 급등 수혜주 피해주, 항공주 화학주 정유주, 유가 관련주
- seoTitle: 국제유가 급등 체크포인트: 항공·화학·정유주
- seoDescription: 국제유가 급등 뉴스가 나왔을 때 업종별로 바로 확인할 가격, 마진, 환율, 수요 체크포인트를 정리합니다.
- H1: 국제유가 급등 업종 체크리스트
- 첫 문단 방향: 수혜주 찾기보다 비용 전가와 마진 압박을 먼저 보자고 제안한다.
- 포함할 표/계산 예시: 유가 +10%, 환율 +5% 상황에서 업종별 부담 요인
- FAQ 3개: 유가 관련주는 어떤 업종인가요? / 유가 급등이 물가에 반영되는 데 얼마나 걸리나요? / WTI와 브렌트유 중 무엇을 봐야 하나요?
- 연결할 계산기: `/market/indices`
- 연결할 기존 글: `/posts/economicInfo/hormuz-risk-oil-insurance-freight-premium`, `/posts/economicInfo/geopolitics-oil-fx-dashboard`, `/posts/economicInfo/war-theme-investing-price-chain-not-winners`
- 발행 우선순위: P2

### KO-19

- targetChannel: naver-ko
- title: 아파트 실거래가 조회 후 꼭 봐야 할 4가지
- slug 제안: `apartment-transaction-price-checklist`
- search intent: 아파트 실거래가 보는 법, 실거래가 조회, 평균가 중앙값 거래량
- seoTitle: 아파트 실거래가 보는 법: 조회 후 확인할 4가지
- seoDescription: 아파트 실거래가를 볼 때 평균가, 중앙값, 평단가, 거래량을 함께 확인해야 하는 이유를 정리합니다.
- H1: 아파트 실거래가 조회 후 확인할 4가지
- 첫 문단 방향: 실거래가 한 건만 보고 판단하면 위험하다는 점을 먼저 말하고 대표가격과 거래량으로 연결한다.
- 포함할 표/계산 예시: 평균가, 중앙값, 평단가, 거래량, 신고가/저가 거래 해석표
- FAQ 3개: 실거래가와 호가는 왜 다른가요? / 평균가와 중앙값 중 무엇을 봐야 하나요? / 거래량이 적으면 가격을 믿어도 되나요?
- 연결할 계산기: `/market/real-estate`, `/tools/dsr-ltv-calculator`
- 연결할 기존 글: `/posts/personalFinance/how-to-read-apartment-transaction-prices`, `/posts/personalFinance/apartment-transaction-volume-decline-meaning`, `/posts/personalFinance/apt-dashboard-home-goal-roadmap`
- 발행 우선순위: P0

### KO-20

- targetChannel: naver-ko
- title: 대단지 아파트 실거래, 거래량과 평단가로 보는 법
- slug 제안: `large-complex-transaction-volume-unit-price`
- search intent: 대단지 아파트 실거래, 세대수 많은 아파트, 거래량 평단가
- seoTitle: 대단지 아파트 실거래 보는 법: 거래량·평단가 체크
- seoDescription: 세대수 많은 대단지 아파트를 실거래 데이터로 볼 때 거래량, 평단가, 가격분포를 함께 읽는 방법을 정리합니다.
- H1: 대단지 아파트 실거래 보는 법
- 첫 문단 방향: 대단지는 거래 표본이 많아 가격 신호가 비교적 안정적일 수 있지만, 동·평형 차이를 같이 봐야 한다고 설명한다.
- 포함할 표/계산 예시: 대단지/소단지 거래량, 평단가, 가격분포 비교표
- FAQ 3개: 대단지가 항상 가격이 안정적인가요? / 세대수 필터는 어떻게 활용하나요? / 평단가와 실거래가는 어떤 차이가 있나요?
- 연결할 계산기: `/market/real-estate`, `/tools/dsr-ltv-calculator`
- 연결할 기존 글: `/posts/personalFinance/large-apartment-complex-households-price-stability`, `/posts/investingInfo/seoul-gyeonggi-incheon-risk-budget-framework`, `/posts/personalFinance/rent-jeonse-buy-cashflow-opportunity-cost`
- 발행 우선순위: P1

## EN GSC+Bing용 신규 글 후보 20개

### EN-01

- targetChannel: gsc-bing-en
- title: Compound Interest Calculator: Lump Sum vs Monthly Contributions
- slug 제안: `compound-interest-calculator-lump-sum-vs-monthly`
- search intent: compound interest calculator, lump sum vs monthly contribution, long-term investing calculator
- seoTitle: Compound Interest Calculator: Lump Sum vs Monthly Contributions
- seoDescription: Compare lump-sum investing and monthly contributions with compound growth tables, assumptions, and calculator inputs.
- H1: Compound Interest Calculator for Lump Sum and Monthly Contributions
- 첫 문단 방향: Open with a calculator-led problem: two investors use the same return assumption, but one starts with a lump sum and the other adds monthly contributions.
- 포함할 표/계산 예시: $10,000 lump sum vs $300/month over 10, 20, and 30 years at 5%, 7%, and 9%
- FAQ 3개: What inputs do I need for compound interest? / Is monthly contribution the same as compounding? / Should I include fees and taxes?
- 연결할 계산기: `/en/tools/compound-interest`, `/en/tools/goal-simulator`
- 연결할 기존 글: `/en/posts/personalFinance/simple-vs-compound`, `/en/posts/personalFinance/annual-vs-monthly-compound`, `/en/posts/personalFinance/compound-return-3-5-7-10-table`
- 발행 우선순위: P0

### EN-02

- targetChannel: gsc-bing-en
- title: After-Tax Compound Interest Calculator: Fees, Taxes, and Inflation
- slug 제안: `after-tax-compound-interest-calculator`
- search intent: after tax compound interest calculator, real return calculator, investment fees inflation
- seoTitle: After-Tax Compound Interest Calculator: Fees, Taxes, Inflation
- seoDescription: Learn how fees, taxes, and inflation reduce compound growth and how to model real returns before setting a target.
- H1: After-Tax Compound Interest Calculator
- 첫 문단 방향: Start with the gap between nominal ending balance and spendable real wealth.
- 포함할 표/계산 예시: 7% nominal return minus 0.5% fee, 15% tax on gains, 2.5% inflation over 20 years
- FAQ 3개: What is a real return? / Do fees compound too? / Should taxes be applied every year or at the end?
- 연결할 계산기: `/en/tools/compound-interest`, `/en/tools/fire-calculator`
- 연결할 기존 글: `/en/posts/personalFinance/compound-return-3-5-7-10-table`, `/en/posts/personalFinance/fire-assumption-errors-7-fixes`, `/en/posts/economicInfo/inflation-basics`
- 발행 우선순위: P1

### EN-03

- targetChannel: gsc-bing-en
- title: DCA Calculator: Monthly Investing With Step-Up Contributions
- slug 제안: `dca-calculator-step-up-contributions`
- search intent: DCA calculator monthly investing, step-up contributions, dollar cost averaging plan
- seoTitle: DCA Calculator: Monthly Investing With Step-Up Contributions
- seoDescription: Build a dollar-cost averaging plan with base contributions, annual step-ups, pauses, and return assumptions.
- H1: DCA Calculator With Step-Up Contributions
- 첫 문단 방향: Present DCA as a contribution rule system, not a market-timing trick.
- 포함할 표/계산 예시: $300/month with 3% annual contribution step-up vs flat $300/month over 15 years
- FAQ 3개: What is step-up DCA? / How often should contributions increase? / What happens if I pause contributions?
- 연결할 계산기: `/en/tools/dca-calculator`, `/en/tools/goal-simulator`
- 연결할 기존 글: `/en/posts/personalFinance/dca-step-up-ruleset`, `/en/posts/investingInfo/dca-consistency-7-fail-patterns`, `/en/posts/personalFinance/monthly-dca-10-year-result`
- 발행 우선순위: P0

### EN-04

- targetChannel: gsc-bing-en
- title: DCA vs Lump Sum Calculator: When Monthly Investing Reduces Regret
- slug 제안: `dca-vs-lump-sum-calculator-regret`
- search intent: DCA vs lump sum calculator, monthly investing vs lump sum, investing regret risk
- seoTitle: DCA vs Lump Sum Calculator: Compare Returns and Regret Risk
- seoDescription: Compare DCA and lump-sum investing across rising, falling, and volatile market paths using practical calculator scenarios.
- H1: DCA vs Lump Sum Calculator
- 첫 문단 방향: Frame the topic around behavior risk and regret, not a universal answer.
- 포함할 표/계산 예시: Rising market, early drawdown, late drawdown, sideways market path comparison
- FAQ 3개: Is lump sum usually better? / When does DCA help? / Can I combine lump sum and DCA?
- 연결할 계산기: `/en/tools/dca-calculator`, `/en/tools/compound-interest`
- 연결할 기존 글: `/en/posts/personalFinance/dca-vs-lumpsum-decision-rules`, `/en/posts/personalFinance/dca-vs-lump-sum-when-results-differ`, `/en/posts/personalFinance/is-dca-better-in-a-bear-market`
- 발행 우선순위: P1

### EN-05

- targetChannel: gsc-bing-en
- title: CAGR Calculator for ETF Comparison: Total Return to Annual Return
- slug 제안: `cagr-calculator-etf-comparison`
- search intent: CAGR calculator ETF, total return to annual return, compare ETF performance
- seoTitle: CAGR Calculator for ETF Comparison: Total Return to Annual Return
- seoDescription: Convert total return into annualized growth and compare ETFs with different time periods more fairly.
- H1: CAGR Calculator for ETF Comparison
- 첫 문단 방향: Explain that total return without time is incomplete, then use ETF A/B examples.
- 포함할 표/계산 예시: ETF A up 60% in 5 years vs ETF B up 35% in 3 years, CAGR comparison
- FAQ 3개: Is CAGR the same as annual return? / Does CAGR include volatility? / Should dividends be included?
- 연결할 계산기: `/en/tools/cagr-calculator`
- 연결할 기존 글: `/en/posts/personalFinance/what-is-cagr`, `/en/posts/investingInfo/why-check-cagr-etf`, `/en/posts/investingInfo/diagnose-investing-skill-with-cagr`
- 발행 우선순위: P0

### EN-06

- targetChannel: gsc-bing-en
- title: CAGR vs Average Return: Why Volatility Changes the Result
- slug 제안: `cagr-vs-average-return-volatility`
- search intent: CAGR vs average return, volatility drag, annualized return explained
- seoTitle: CAGR vs Average Return: Volatility Drag Explained
- seoDescription: Learn why average annual return can overstate real growth and how CAGR captures the path of compounding.
- H1: CAGR vs Average Return
- 첫 문단 방향: Use a simple +50% then -50% example to show why average return can mislead.
- 포함할 표/계산 예시: +20/-10/+15/-5% sequence, arithmetic average vs CAGR
- FAQ 3개: Why is CAGR lower than average return? / What is volatility drag? / Which metric should I use for planning?
- 연결할 계산기: `/en/tools/cagr-calculator`, `/en/tools/compound-interest`
- 연결할 기존 글: `/en/posts/investingInfo/cagr-7percent-reality-check`, `/en/posts/investingInfo/diagnose-investing-skill-with-cagr`, `/en/posts/personalFinance/what-is-cagr`
- 발행 우선순위: P1

### EN-07

- targetChannel: gsc-bing-en
- title: Korea DSR/LTV Mortgage Calculator Guide for Foreign Readers
- slug 제안: `korea-dsr-ltv-mortgage-calculator-guide`
- search intent: Korea DSR LTV mortgage calculator, Korean apartment mortgage, foreigner Korea home buying
- seoTitle: Korea DSR/LTV Mortgage Calculator Guide
- seoDescription: Understand how DSR, LTV, cash, rates, and transaction costs shape Korean apartment affordability.
- H1: Korea DSR/LTV Mortgage Calculator Guide
- 첫 문단 방향: Define DSR and LTV in plain English and explain why cash can still be the binding constraint.
- 포함할 표/계산 예시: Income, rate, term, cash, LTV cap, DSR cap, feasible home price
- FAQ 3개: What is DSR in Korea? / How is LTV different from DSR? / Can cash be the limiting factor?
- 연결할 계산기: `/en/tools/dsr-ltv-calculator`
- 연결할 기존 글: `/en/posts/personalFinance/dsr-pass-ltv-cash-bottleneck`, `/en/posts/personalFinance/mortgage-risk-checklist-dsr-variable`, `/en/posts/personalFinance/cash-100m-200m-300m-apartment-budget`
- 발행 우선순위: P0

### EN-08

- targetChannel: gsc-bing-en
- title: Korean Mortgage Capacity by Income: DSR 40% Scenarios
- slug 제안: `korean-mortgage-capacity-income-dsr-40`
- search intent: Korean mortgage capacity by income, DSR 40 Korea, mortgage limit table
- seoTitle: Korean Mortgage Capacity by Income: DSR 40% Table
- seoDescription: Estimate Korean mortgage principal by income under DSR 40%, interest-rate assumptions, and repayment terms.
- H1: Korean Mortgage Capacity by Income
- 첫 문단 방향: Treat this as a reference table, with clear caveats that actual bank screening can differ.
- 포함할 표/계산 예시: KRW income 50M/70M/100M/150M, 30-year equal payment, 3.5/4.5/5.5% rates
- FAQ 3개: Is DSR 40% a guaranteed loan limit? / How do existing debts affect the limit? / Does LTV override DSR?
- 연결할 계산기: `/en/tools/dsr-ltv-calculator`
- 연결할 기존 글: `/en/posts/personalFinance/dsr-40-income-loan-limit-table`, `/en/posts/personalFinance/interest-rate-1p-loan-limit-impact`, `/en/posts/personalFinance/dsr-pass-ltv-cash-bottleneck`
- 발행 우선순위: P1

### EN-09

- targetChannel: gsc-bing-en
- title: Goal Simulator: How Much to Invest Monthly to Reach a Target Portfolio
- slug 제안: `goal-simulator-monthly-investment-target`
- search intent: monthly investment calculator, target portfolio calculator, investment goal simulator
- seoTitle: Goal Simulator: Monthly Investment Needed for a Target Portfolio
- seoDescription: Estimate the monthly investment needed to reach a target portfolio under different return, fee, tax, and time assumptions.
- H1: Monthly Investment Goal Simulator
- 첫 문단 방향: Start from a target amount and show why time horizon is the first variable to lock.
- 포함할 표/계산 예시: $100k/$250k/$500k targets over 5/10/20 years at 4/6/8%
- FAQ 3개: Should I set the target or monthly amount first? / How should I choose return assumptions? / How do fees change the target date?
- 연결할 계산기: `/en/tools/goal-simulator`, `/en/tools/dca-calculator`
- 연결할 기존 글: `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio`, `/en/posts/personalFinance/goal-amount-fast-strategy`, `/en/posts/personalFinance/personal-finance-3pillars`
- 발행 우선순위: P0

### EN-10

- targetChannel: gsc-bing-en
- title: Savings Goal Calculator With Inflation: Real vs Nominal Targets
- slug 제안: `savings-goal-calculator-inflation-real-nominal`
- search intent: savings goal calculator inflation, real vs nominal target, investment goal calculator
- seoTitle: Savings Goal Calculator With Inflation: Real vs Nominal Targets
- seoDescription: Adjust a future savings goal for inflation and compare nominal target amounts with real purchasing power.
- H1: Savings Goal Calculator With Inflation
- 첫 문단 방향: Show that a $100,000 target in 15 years does not buy the same amount as $100,000 today.
- 포함할 표/계산 예시: $100k target adjusted by 2%, 3%, and 4% inflation over 10/15/20 years
- FAQ 3개: What is a real target amount? / Should inflation be included in goal planning? / How does inflation change monthly contributions?
- 연결할 계산기: `/en/tools/goal-simulator`, `/en/tools/compound-interest`
- 연결할 기존 글: `/en/posts/economicInfo/inflation-rate-basics`, `/en/posts/personalFinance/inflation-household-survival-strategy`, `/en/posts/personalFinance/fire-assumption-errors-7-fixes`
- 발행 우선순위: P2

### EN-11

- targetChannel: gsc-bing-en
- title: FIRE Calculator With Inflation, Taxes, and Withdrawal Rates
- slug 제안: `fire-calculator-inflation-tax-withdrawal`
- search intent: FIRE calculator inflation taxes withdrawal rate, early retirement calculator
- seoTitle: FIRE Calculator With Inflation, Taxes, and Withdrawal Rates
- seoDescription: Build a FIRE target using annual spending, retirement horizon, withdrawal rate, inflation, and tax assumptions.
- H1: FIRE Calculator With Inflation and Withdrawal Rates
- 첫 문단 방향: Reduce FIRE planning to inputs users can control, then warn against one-number targets.
- 포함할 표/계산 예시: Annual spending $40k/$60k/$80k, withdrawal rate 3/3.5/4%, inflation sensitivity
- FAQ 3개: What withdrawal rate should I use? / Should taxes be included in FIRE spending? / How does inflation change the FIRE number?
- 연결할 계산기: `/en/tools/fire-calculator`
- 연결할 기존 글: `/en/posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal`, `/en/posts/personalFinance/fire-assumption-errors-7-fixes`, `/en/posts/personalFinance/fire-spending-buckets-essential-choice-insurance`
- 발행 우선순위: P0

### EN-12

- targetChannel: gsc-bing-en
- title: Sequence of Returns Risk Calculator Workflow for Early Retirement
- slug 제안: `sequence-returns-risk-fire-calculator`
- search intent: sequence of returns risk calculator, FIRE stress test, early retirement withdrawal rules
- seoTitle: Sequence of Returns Risk Calculator Workflow for FIRE
- seoDescription: Stress-test early retirement using sequence-risk scenarios, withdrawal guardrails, and spending buckets.
- H1: Sequence of Returns Risk Calculator Workflow
- 첫 문단 방향: Explain why the first five retirement years matter more than the long-term average return.
- 포함할 표/계산 예시: Early -25% drawdown vs late -25% drawdown, same CAGR but different survival path
- FAQ 3개: What is sequence of returns risk? / Can cash buffers reduce sequence risk? / How often should I rerun a FIRE stress test?
- 연결할 계산기: `/en/tools/fire-calculator`, `/en/tools/compound-interest`
- 연결할 기존 글: `/en/posts/personalFinance/fire-sequence-risk-first-5-years`, `/en/posts/personalFinance/fire-spending-buckets-essential-choice-insurance`, `/en/posts/investingInfo/modern-6040-risk-budget`
- 발행 우선순위: P1

### EN-13

- targetChannel: gsc-bing-en
- title: USD/KRW and KOSPI Explained: FX, Foreign Flows, and Earnings
- slug 제안: `usd-krw-kospi-fx-foreign-flows`
- search intent: USD KRW KOSPI explained, Korea FX stock market, foreign flows Korea
- seoTitle: USD/KRW and KOSPI Explained: FX, Foreign Flows, Earnings
- seoDescription: Learn how USD/KRW affects Korean equities through foreign flows, export earnings, import costs, and rate expectations.
- H1: USD/KRW and KOSPI Explained
- 첫 문단 방향: Position USD/KRW as a market regime indicator for Korea, not only an exchange rate.
- 포함할 표/계산 예시: Strong KRW/weak KRW regimes and sector-level implications
- FAQ 3개: Why does USD/KRW matter for KOSPI? / Does a weaker won help exporters? / How do foreign investors react to FX changes?
- 연결할 계산기: `/en/market/indices`
- 연결할 기존 글: `/en/posts/investingInfo/usd-krw-exchange-rate-and-kospi`, `/en/posts/investingInfo/usd-krw-weak-won-sector-map-kospi`, `/en/posts/economicInfo/fx-basics`
- 발행 우선순위: P0

### EN-14

- targetChannel: gsc-bing-en
- title: DXY vs USD/KRW: Why Korea’s Currency Can Move Differently
- slug 제안: `dxy-vs-usdkrw-korea-currency`
- search intent: DXY vs USD KRW, dollar index Korea won, why USD KRW moves
- seoTitle: DXY vs USD/KRW: Why Korea’s Currency Can Diverge
- seoDescription: Compare DXY and USD/KRW using dollar strength, Korea-specific flows, trade balance, and risk sentiment.
- H1: DXY vs USD/KRW
- 첫 문단 방향: Clarify that DXY is not the same as USD/KRW, because Korea-specific risk and trade flows matter.
- 포함할 표/계산 예시: DXY up/USDKRW up, DXY up/USDKRW flat, DXY down/USDKRW up scenario grid
- FAQ 3개: Is DXY a good proxy for USD/KRW? / Why can KRW weaken when DXY is flat? / What indicators should I check together?
- 연결할 계산기: `/en/market/indices`
- 연결할 기존 글: `/en/posts/investingInfo/dxy-dollar-index-basics`, `/en/posts/investingInfo/dxy-market-impact`, `/en/posts/economicInfo/geopolitics-to-usd-liquidity-fx`
- 발행 우선순위: P1

### EN-15

- targetChannel: gsc-bing-en
- title: U.S. 10-Year Yield and KOSPI: Rates, FX, and Valuation Channels
- slug 제안: `us-10y-yield-kospi-rates-fx-valuation`
- search intent: U.S. 10 year yield KOSPI, TNX Korea stocks, rates FX valuation
- seoTitle: U.S. 10-Year Yield and KOSPI: Rates, FX, Valuation
- seoDescription: Understand how the U.S. 10-year yield affects KOSPI through discount rates, USD/KRW, liquidity, and foreign flows.
- H1: U.S. 10-Year Yield and KOSPI
- 첫 문단 방향: Explain TNX as a global discount-rate anchor before moving into Korea-specific channels.
- 포함할 표/계산 예시: TNX up/down combined with USD/KRW up/down and KOSPI pressure map
- FAQ 3개: Why does TNX affect Korean stocks? / Which sectors are most sensitive? / Is TNX more important than the Fed policy rate?
- 연결할 계산기: `/en/market/indices`
- 연결할 기존 글: `/en/posts/investingInfo/us10y-impact-on-korea-and-stock-market`, `/en/posts/investingInfo/tnx-basics`, `/en/posts/investingInfo/etf-impact-of-tnx`
- 발행 우선순위: P0

### EN-16

- targetChannel: gsc-bing-en
- title: TNX and Korea ETFs: Growth Exposure, FX Risk, and Foreign Flows
- slug 제안: `tnx-korea-etfs-fx-foreign-flows`
- search intent: TNX Korea ETF, U.S. 10Y yield Korea ETF, FX risk Korea equities
- seoTitle: TNX and Korea ETFs: Growth Exposure, FX Risk, Foreign Flows
- seoDescription: Learn why Korea ETFs can be highly sensitive to U.S. yields through technology weight, FX, and global liquidity.
- H1: TNX and Korea ETFs
- 첫 문단 방향: Target international ETF readers by framing Korea exposure as a rate-sensitive, FX-sensitive equity sleeve.
- 포함할 표/계산 예시: TNX rising/falling regimes and likely impact on growth-heavy Korea ETFs
- FAQ 3개: Why are Korea ETFs sensitive to TNX? / How does FX affect ETF returns? / Should I hedge KRW exposure?
- 연결할 계산기: `/en/tools/cagr-calculator`, `/en/market/indices`
- 연결할 기존 글: `/en/posts/investingInfo/korea-etf-deep-dive-tnx`, `/en/posts/investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions`, `/en/posts/investingInfo/bond-etf-duration-drives-returns`
- 발행 우선순위: P1

### EN-17

- targetChannel: gsc-bing-en
- title: WTI Oil Price and Korea Sectors: Airlines, Chemicals, Refiners, Autos
- slug 제안: `wti-oil-korea-sectors-airlines-chemicals-refiners`
- search intent: WTI oil Korea sectors, oil price airlines chemicals refiners, Korea stocks oil
- seoTitle: WTI Oil Price and Korea Sectors: Airlines, Chemicals, Refiners
- seoDescription: Map how WTI oil moves through Korean sectors via fuel costs, input prices, margins, FX, and demand.
- H1: WTI Oil Price and Korea Sectors
- 첫 문단 방향: Explain oil as both a cost shock and a macro signal for an import-dependent economy.
- 포함할 표/계산 예시: Airlines, chemicals, refiners, autos, shipping, consumer sectors by oil-up/oil-down regime
- FAQ 3개: Which Korean sectors are hurt by higher oil? / Are refiners always winners? / Why does USD/KRW matter when oil rises?
- 연결할 계산기: `/en/market/indices`
- 연결할 기존 글: `/en/posts/investingInfo/wti-impact-on-korea-kospi`, `/en/posts/economicInfo/oil-shock-to-usdkrw-korea-transmission`, `/en/posts/economicInfo/war-risk-oil-supply-insurance-shipping`
- 발행 우선순위: P0

### EN-18

- targetChannel: gsc-bing-en
- title: Oil Shock to USD/KRW and KOSPI: A Transmission Chain Guide
- slug 제안: `oil-shock-usdkrw-kospi-transmission`
- search intent: oil shock USD KRW KOSPI, Korea oil import inflation, WTI FX transmission
- seoTitle: Oil Shock to USD/KRW and KOSPI: Transmission Chain
- seoDescription: Follow an oil shock through import inflation, trade balance, USD/KRW, rates, sector margins, and KOSPI sentiment.
- H1: Oil Shock to USD/KRW and KOSPI
- 첫 문단 방향: Use a step-by-step chain so international readers can understand why Korea reacts differently from oil producers.
- 포함할 표/계산 예시: Oil +20% transmission chain from import bill to FX to rates to KOSPI
- FAQ 3개: Why does oil affect USD/KRW? / Is oil always bad for Korea? / What market signals confirm a real oil shock?
- 연결할 계산기: `/en/market/indices`
- 연결할 기존 글: `/en/posts/economicInfo/geopolitics-oil-fx-dashboard`, `/en/posts/economicInfo/hormuz-risk-oil-insurance-freight-premium`, `/en/posts/economicInfo/oil-shock-to-usdkrw-korea-transmission`
- 발행 우선순위: P2

### EN-19

- targetChannel: gsc-bing-en
- title: How to Use Korean Apartment Transaction Data: Median, Unit Price, Volume
- slug 제안: `korean-apartment-transaction-data-guide`
- search intent: Korean apartment transaction data, Korea real estate dashboard, median unit price volume
- seoTitle: Korean Apartment Transaction Data Guide: Median, Unit Price, Volume
- seoDescription: Learn how to read Korean apartment transactions using median price, unit price, transaction volume, and price distribution.
- H1: Korean Apartment Transaction Data Guide
- 첫 문단 방향: Introduce Korean real-transaction data as a practical way to avoid relying only on asking prices or headlines.
- 포함할 표/계산 예시: Median vs average vs unit price vs volume interpretation grid
- FAQ 3개: What is Korean apartment transaction data? / Why use median instead of average? / How does volume change the signal?
- 연결할 계산기: `/en/market/real-estate`, `/en/tools/dsr-ltv-calculator`
- 연결할 기존 글: `/en/posts/personalFinance/how-to-read-apartment-transaction-prices`, `/en/posts/personalFinance/apartment-transaction-volume-decline-meaning`, `/en/posts/personalFinance/apt-dashboard-home-goal-roadmap`
- 발행 우선순위: P0

### EN-20

- targetChannel: gsc-bing-en
- title: Seoul Apartment Dashboard Guide: Reading Price Distribution and Volume
- slug 제안: `seoul-apartment-dashboard-price-volume-guide`
- search intent: Seoul apartment dashboard, Seoul apartment prices transaction volume, Korea real estate data
- seoTitle: Seoul Apartment Dashboard Guide: Price Distribution and Volume
- seoDescription: Use Seoul apartment transaction data to read price bands, transaction volume, recovery signals, and affordability constraints.
- H1: Seoul Apartment Dashboard Guide
- 첫 문단 방향: Frame the dashboard as a decision-support tool for foreigners and global readers watching Seoul housing.
- 포함할 표/계산 예시: Seoul price band, volume, unit price, DSR/LTV affordability workflow
- FAQ 3개: What should I check first in a Seoul apartment dashboard? / How do price distribution and volume work together? / Can transaction data predict prices?
- 연결할 계산기: `/en/market/real-estate`, `/en/tools/dsr-ltv-calculator`
- 연결할 기존 글: `/en/posts/investingInfo/seoul-gyeonggi-incheon-risk-budget-framework`, `/en/posts/personalFinance/large-apartment-complex-households-price-stability`, `/en/posts/personalFinance/rent-jeonse-buy-cashflow-opportunity-cost`
- 발행 우선순위: P1

## 우선 실행 순서

| 단계 | KO/Naver | EN/GSC+Bing |
| --- | --- | --- |
| P0 | 계산기 직결 즉답형: 복리, DCA, CAGR, DSR/LTV, 목표자산, FIRE, 환율/KOSPI, TNX/KOSPI, 유가/업종, 실거래가 | Calculator evergreen: compound, DCA, CAGR, Korea mortgage, goal simulator, FIRE, USD/KRW, TNX/KOSPI, WTI sectors, apartment data |
| P1 | 같은 툴을 다른 검색어로 확장: 월복리, 수익률 분해, ETF CAGR, FIRE 가정, 환율 1400원, 금리+환율, 대단지 | Explainer depth: after-tax compound, DCA vs lump sum, CAGR vs average, DSR scenarios, sequence risk, DXY vs USD/KRW, TNX Korea ETFs, Seoul dashboard |
| P2 | 뉴스성 검색어와 업종 체크리스트 보강 | macro transmission guide와 inflation-adjusted calculator 보강 |

## 작성 시 주의사항

1. KO와 EN은 같은 클러스터라도 제목, 도입부, FAQ를 그대로 번역하지 않는다.
2. KO 글은 첫 문단에 숫자 예시와 즉답을 먼저 넣고, 뒤에서 계산기 사용법을 안내한다.
3. EN 글은 calculator intent를 H1, seoTitle, 첫 문단에 명확히 넣고, Korea-specific explainer는 국제 독자가 모르는 제도와 지표를 먼저 풀어준다.
4. 내부링크는 위에 확인한 실제 URL만 사용한다.
5. 새 글을 만들 때도 기존 canonical/hreflang/sitemap 구조는 변경하지 않는다.
