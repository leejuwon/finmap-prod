# FinMap 경제정보 신규 포스트 검토 — 2026-10-29

## 1. Final Verdict

**PASS_WITH_NON_BLOCKING_REVIEWS**

요청한 3개 주제의 KO·EN Markdown 6개와 실제 PNG 12개를 프로젝트에 반영했다. 최종본 빌드, 콘텐츠·계산·이미지 검사, 공식 출처 열람, 링크·JSON-LD·사이트맵 검사, 신규 6개 및 회귀 12개 브라우저 경로 검사를 수행했다. 커밋·푸시·운영 배포는 하지 않았다.

미검증 항목은 운영 DB 기능, 외부 광고·분석, 운영 이미지 CDN 및 배포 후 접근이다. 한국은행 첨부 PDF 수치를 읽지 못했으므로 그 값은 본문에 인용하지 않았다. 이 제한은 실제로 인용한 통계의 검증 실패를 뜻하지 않는다.

기계 검증 근거: [validation JSON](economics-posts-2026-10-29-validation.json), [출처 기록](economics-posts-2026-10-29-sources.json), [이미지 생성 기록](economics-posts-2026-10-29-images.json), [링크 검사](economics-posts-2026-10-29-links.json), [작업 전 해시·기존 경제글 목록](economics-posts-2026-10-29-baseline.json).

## 2. 신규 포스트

아래 URL은 배포 후 예상 canonical이며 현재 운영에 발행했다는 뜻은 아니다. 발행·수정일은 모두 2026-10-29이다.

| 언어 | 제목 | slug | 파일 | 예상 URL |
| --- | --- | --- | --- | --- |
| ko | 물가 상승률은 낮아졌는데 장바구니는 왜 비쌀까? 소비자물가와 체감물가의 차이 | inflation-down-prices-still-high | content/posts/economicInfo/ko/inflation-down-prices-still-high.md | https://www.finmaphub.com/posts/economicInfo/inflation-down-prices-still-high |
| ko | 원달러 환율이 100원 오르면 내 생활비는 얼마나 달라질까? 해외여행·직구·수입물가의 연결고리 | usdkrw-100won-rise-household-cost | content/posts/economicInfo/ko/usdkrw-100won-rise-household-cost.md | https://www.finmaphub.com/posts/economicInfo/usdkrw-100won-rise-household-cost |
| ko | 실업률은 낮다는데 취업은 왜 어려울까? 고용률·경제활동참가율·청년 고용의 차이 | low-unemployment-hard-to-find-job | content/posts/economicInfo/ko/low-unemployment-hard-to-find-job.md | https://www.finmaphub.com/posts/economicInfo/low-unemployment-hard-to-find-job |
| en | Why Do Prices Still Feel High When Inflation Slows? CPI vs Everyday Living Costs | inflation-down-prices-still-high | content/posts/economicInfo/en/inflation-down-prices-still-high.md | https://www.finmaphub.com/en/posts/economicInfo/inflation-down-prices-still-high |
| en | What Happens When USD/KRW Rises by 100 Won? Travel, Imported Goods, and Household Costs | usdkrw-100won-rise-household-cost | content/posts/economicInfo/en/usdkrw-100won-rise-household-cost.md | https://www.finmaphub.com/en/posts/economicInfo/usdkrw-100won-rise-household-cost |
| en | Why Is Finding a Job Hard When Unemployment Is Low? Three Labor Market Indicators Explained | low-unemployment-hard-to-find-job | content/posts/economicInfo/en/low-unemployment-hard-to-find-job.md | https://www.finmaphub.com/en/posts/economicInfo/low-unemployment-hard-to-find-job |

| 언어·주제 | 보이는 본문 문자 수 | 초반 요약 | Hero | 표 | FAQ | 내부링크 |
| --- | --- | --- | --- | --- | --- | --- |
| ko/inflation-down-prices-still-high | 9445 | 9 | 1 | 3 | 8 | 4 |
| ko/usdkrw-100won-rise-household-cost | 9935 | 9 | 1 | 3 | 8 | 5 |
| ko/low-unemployment-hard-to-find-job | 10648 | 9 | 1 | 4 | 8 | 4 |
| en/inflation-down-prices-still-high | 14965 | 9 | 1 | 3 | 8 | 4 |
| en/usdkrw-100won-rise-household-cost | 14965 | 9 | 1 | 3 | 8 | 5 |
| en/low-unemployment-hard-to-find-job | 14997 | 9 | 1 | 3 | 8 | 4 |

문자 수는 HTML 태그·구조화 데이터·링크 주소를 제외하고 공백을 정규화한 값이다. 여섯 편 모두 권장 8,000~15,000자 범위다. 각 글에 변수 3개 정의·관측 방법·한계, 전달 경로, 관측 조건이 있는 3시나리오, 오해 5개, 사례 2개, 중간 정리 2~3개, 체크리스트를 넣었다. KO 물가·환율 글은 callout과 표, 나머지는 표·문단으로 변수의 범위를 설명한다.

KO 물가·고용은 한국 통계, EN 물가·고용은 미국 통계와 사례로 다시 썼다. 환율은 양 언어 모두 USD/KRW를 유지한다. 미국 shelter의 OER와 한국 생활물가지수, 한국 15세 이상과 미국 민간 비시설 16세 이상, 청년 15~29·15~34와 미국 16~19 구분을 명시했다.

## 3. 생성 이미지

built-in image_gen으로 독립 프롬프트 12개를 실행했다. 3개는 수정 생성으로 통화 기호·팔레트·비례 표현을 교정했다. 원본은 generated_images에 보존하고 sharp의 contain 방식으로 비율을 유지해 저장했다. 기본색은 흰색·회색 및 남색·파랑이다.

| 주제 | 실제 파일 | 규격 | 결과 |
| --- | --- | --- | --- |
| inflation-down-prices-still-high | public/images/posts/inflation-down-prices-still-high/cover.png | 1200×630 | PNG·실파일·개별 생성·검토 PASS |
| inflation-down-prices-still-high | public/images/posts/inflation-down-prices-still-high/img1.png | 1600×900 | PNG·실파일·개별 생성·검토 PASS |
| inflation-down-prices-still-high | public/images/posts/inflation-down-prices-still-high/img2.png | 1600×900 | PNG·실파일·개별 생성·검토 PASS |
| inflation-down-prices-still-high | public/images/posts/inflation-down-prices-still-high/img3.png | 1600×900 | PNG·실파일·개별 생성·검토 PASS |
| usdkrw-100won-rise-household-cost | public/images/posts/usdkrw-100won-rise-household-cost/cover.png | 1200×630 | PNG·실파일·개별 생성·검토 PASS |
| usdkrw-100won-rise-household-cost | public/images/posts/usdkrw-100won-rise-household-cost/img1.png | 1600×900 | PNG·실파일·개별 생성·검토 PASS |
| usdkrw-100won-rise-household-cost | public/images/posts/usdkrw-100won-rise-household-cost/img2.png | 1600×900 | PNG·실파일·개별 생성·검토 PASS |
| usdkrw-100won-rise-household-cost | public/images/posts/usdkrw-100won-rise-household-cost/img3.png | 1600×900 | PNG·실파일·개별 생성·검토 PASS |
| low-unemployment-hard-to-find-job | public/images/posts/low-unemployment-hard-to-find-job/cover.png | 1200×630 | PNG·실파일·개별 생성·검토 PASS |
| low-unemployment-hard-to-find-job | public/images/posts/low-unemployment-hard-to-find-job/img1.png | 1600×900 | PNG·실파일·개별 생성·검토 PASS |
| low-unemployment-hard-to-find-job | public/images/posts/low-unemployment-hard-to-find-job/img2.png | 1600×900 | PNG·실파일·개별 생성·검토 PASS |
| low-unemployment-hard-to-find-job | public/images/posts/low-unemployment-hard-to-find-job/img3.png | 1600×900 | PNG·실파일·개별 생성·검토 PASS |

이미지 바이트 해시 12개가 모두 다르다. 커버는 페이지에서 한 번만 출력하고 Markdown에는 img1~img3만 넣었다. alt·figcaption은 KO·EN 별도 작성했다.

수치 그림 독립 검토:
- 물가 img1: 별도 축의 지수 100→105→107.1, 상승률 5%→2%. 실제 시계열로 제시하지 않았다.
- 환율 img1: USD100·2000·10000의 1,300·1,400원 환산값 6개가 본문 표와 일치한다.
- 환율 img2: EUR 기호를 KRW로 수정했다. img3의 갈색 소포는 파랑으로 수정했다.
- 고용 img1: 1,000=600+400, 600=570+30. img2: A 570/30/400, B 380/20/600의 실업률은 모두 5%. 원본의 부정확한 비례 막대는 수정 생성에서 제거했다.
- 사람 아이콘·화살표는 개념도이며 측정된 인구 비중이나 고정 시차를 의미하지 않는다고 캡션으로 설명했다.

생성 프롬프트·수정 프롬프트·원본·최종 경로는 이미지 JSON에 기록했다. 브라우저에서 각 글 커버 1개+본문 3개 정상 로딩을 검사했다.

## 4. 공식 데이터 및 출처

확인일: 2026-10-29. 검색 요약만으로 통계를 채택하지 않고 공식 HTML 본문·통계표를 직접 열었다.

| 통계 | 값·단위 | 기준 기간 | 발표일 | 공식 출처 | 확인 범위 | 잠정·수정 및 조정 |
| --- | --- | --- | --- | --- | --- | --- |
| 한국 CPI | 전월비 +0.3%, 전년동월비 +2.9% | 2026-09 | 2026-10-02 | [공식 자료](https://mods.go.kr/board.es?act=view&bid=213&list_no=447322&mid=a10301040200) | 발표 HTML 본문 직접 확인 | 원문 전월비·전년동월비; 계절조정으로 표시하지 않음 / 발표문 잠정 표기 없음; 정정·개편 가능 |
| 한국 생활물가지수 | 전월비 +0.7%, 전년동월비 +2.5% | 2026-09 | 2026-10-02 | [공식 자료](https://mods.go.kr/board.es?act=view&bid=213&list_no=447322&mid=a10301040200) | 발표 HTML 본문 직접 확인 | 원문 비교 기준 / 잠정 표기 없음 |
| 한국 신선식품지수 | 전월비 +2.7%, 전년동월비 -3.3% | 2026-09 | 2026-10-02 | [공식 자료](https://mods.go.kr/board.es?act=view&bid=213&list_no=447322&mid=a10301040200) | 발표 HTML 본문 직접 확인 | 원문 비교 기준 / 잠정 표기 없음 |
| 미국 CPI-U | 전월비 +0.6% SA, 12개월 +3.7% NSA | 2026-09 | 2026-10-14 | [공식 자료](https://www.bls.gov/news.release/archives/cpi_10142026.htm) | BLS 날짜 고정 아카이브 본문 직접 확인 | MoM 계절조정, YoY 비계절조정 / SA 계열 소급 수정 가능; 일반 NSA CPI-U는 통상 공표 후 확정, 정정 가능 |
| 한국 고용 | 전체 실업률 2.0% NSA; 15~64세 고용률 70.6%; SA 실업률 2.6%, 전월 -0.1%p | 2026-09 | 2026-10-16 | [공식 자료](https://mods.go.kr/board.es?act=view&bid=210&list_no=447479&mid=a10301030200) | 발표 HTML·첨부 PDF 통계표 직접 확인 | 전체 원계열과 계절조정 분리 / 표본조사 추정치; 계절조정 소급 보정 가능 |
| 한국 청년 실업률 | 15~29세 5.4%, 15~34세 4.2%; 15~29세 전년 +0.6%p | 2026-09 | 2026-10-16 | [공식 자료](https://mods.go.kr/boardDownload.es?bid=210&list_no=447479&seq=1) | 첨부 PDF 표9의 2026년 9월 행 및 15~29세·15~34세 열 직접 확인 | 원계열; 연령별 분모 구분 / 표본조사 추정치; 보정 가능 |
| 미국 CPS | 실업률 4.2%, 참가율 61.8%, 고용인구비율 59.2% | 2026-09 | 2026-10-02 | [공식 자료](https://www.bls.gov/news.release/archives/empsit_10022026.htm) | BLS 아카이브 본문·표A 직접 확인 | 모두 SA; 민간 비시설 16세 이상 / 가구조사 추정치; 계절요인·인구통제 등 수정 가능 |
| 한국 수출입물가·무역지수 발표 | 실제 지수 값 미인용 | 2026-09 | 2026-10-16 | [공식 자료](https://www.bok.or.kr/portal/bbs/B0000501/view.do?nttId=11065605&menuNo=201264) | 공식 발표 제목·날짜·잠정 표시 확인; 첨부 PDF 접근 실패 | 본문은 ECOS에서 통화 기준·기준연도·계열 확인하도록 안내 / 잠정; 첨부 수치는 검증하지 못해 사용하지 않음 |

보조 정의 및 접근 확인:

- [국가데이터처](https://mods.go.kr/menu.es?mid=b70101010000): 공식 페이지 직접 열람.
- [국가데이터처](https://mods.go.kr/menu.es?mid=b70101040000): 공식 페이지 직접 열람.
- [국가데이터처](https://mods.go.kr/menu.es?mid=b70102030000): 공식 페이지 직접 열람.
- [BLS](https://www.bls.gov/cpi/questions-and-answers.htm): 공식 페이지 직접 열람.
- [BLS](https://www.bls.gov/cps/definitions.htm): 공식 페이지 직접 열람.
- [BLS](https://www.bls.gov/cps/cps_htgm.htm): 공식 페이지 직접 열람.
- [BOK ECOS](https://ecos.bok.or.kr/): 페이지 접근 확인, 클라이언트 앱 본문 미파싱; 실제 계열값 미인용.
- [Visa](https://www.visa.co.uk/support/consumer/travel-support/exchange-rate-calculator.html): 공식 페이지 직접 열람.

본문의 외부 링크는 중복 제외 12개이며 모두 공식 기관 또는 해당 결제 서비스의 원문으로 접근 확인했다. ECOS는 클라이언트 앱이므로 페이지 접근과 시계열값 검증을 구분했다. BOK 발표 제목·날짜·잠정 표시는 검증했으나 첨부 PDF는 웹 도구의 리디렉션/캐시 접근 실패로 값 확인을 하지 못했다. 해당 수치는 사용하지 않았다. 한국 CPI 첨부파일도 접근이 원활하지 않았지만 인용한 값은 공식 발표 HTML 본문에서 직접 확인했다.

물가지수의 기준연도와 통화 기준은 지수 수준을 비교할 때 확인하도록 설명했다. 본문에서 공식 지수 수준 숫자를 임의로 재기준화하지 않았다. 100→105→107.1은 임의 기준의 가상 지수다. 한국 전월비를 미국의 계절조정 전월비와 같은 계열로 취급하지 않았다.

가상 계산은 실제 통계와 분리했다. 1,300→1,400, USD100·2000·10000, 수수료 1.2%, 유가 80·88·72달러, 가구 소비 가중치·임금·인구 1,000명은 모두 예시다. 카드 승인·매입·정산의 적용일은 상품별 약관을 확인하도록 했고 보편적 규칙으로 단정하지 않았다.

독립 계산 26건 PASS: 누적 물가·실질구매력, 소비 가중치, 달러 비용·수수료·미결제 금액, 유가×환율, 동일 실업률·다른 분모, 취업 증가·구직 중단·청년 고용 구성.

## 5. 기존 글과 SEO 차별화

작업 전 경제정보 **17개 주제×KO/EN=34파일**의 제목·설명·태그·소제목을 전체 목록으로 분석하고, 직접 관련된 기본 글과 교차 카테고리 글의 본문을 확인했다. 원래 파일은 수정하지 않았다.

| 기존 경제정보 slug | 기존 검색 의도 | 신규 글과의 구분 |
| --- | --- | --- |
| inflation-basics | 인플레이션·금리의 기본 원리 | 가계 영수증과 CPI의 측정 차이로 좁힘 |
| inflation-rate-basics | 물가·금리 발표와 시장 반응 | 전년비·전월비, 가격 수준과 상승률을 가계 기준으로 읽음 |
| fx-basics | 환율 결정 요인 | 100원 변화의 미결제 달러 비용과 전가 시차에 집중 |
| indicator-basics | GDP·PMI·고용 등 지표 입문 | 실업률·고용률·참가율의 분모와 인구 이동을 심화 |
| oil-shock-to-usdkrw-korea-transmission | 유가·무역수지·환율 거시 전파 | 여행·직구·재고·원가의 구체적인 생활비 계산 |
| interest-rate-basics | 정책·대출·채권 금리 구조 | 고용·물가 해석 뒤 이어 읽는 배경 설명 |
| policy-rate-cut-market-rates | 정책금리와 시장금리 차이 | 신규 글은 금리 전망보다 원자료의 측정 범위에 집중 |
| real-rates-and-breakevens | 실질금리·기대물가와 자산가격 | 가계 실질구매력과 임금의 비교에 집중 |
| yield-curve-2s10s-3m10y-recession-reading | 수익률곡선 경기 신호 | 경기 전망보다 고용 통계의 분모·구성을 해석 |
| eu-russia-gas-phaseout-price-channel | 가스 계약·저장·대체 | 신규 환율 글은 개인 달러 결제와 한국 수입 원가 |
| geopolitics-oil-fx-dashboard | 지정학→물가→금리→부동산 | 주택시장 대신 장바구니·결제 노출·노동시장 측정 |
| geopolitics-to-usd-liquidity-fx | 달러 유동성과 지정학 | 환율의 원인 예측보다 주어진 변화의 비용 환산 |
| gold-geopolitics-real-rates-dollar-uncertainty | 금·실질금리·달러 | 신규 글은 금 투자나 자산배분을 다루지 않음 |
| hormuz-risk-oil-insurance-freight-premium | 해협·보험료·운임 | 전가 과정의 배경이며 신규 환율 글은 가계 비용이 중심 |
| tariffs-growth-margins-fx-package-shock | 관세·성장·마진·환율 | 정책 충격 전망 대신 측정·노출·계산 방법 |
| war-risk-oil-supply-insurance-shipping | 전쟁과 원유 공급·운송 | 수입 원가 이후 국내가격까지의 시차로 구분 |
| war-theme-investing-price-chain-not-winners | 전쟁 테마와 업종 가격 사슬 | 종목·수혜주 대신 생활비와 공식 지표 해석 |

교차 카테고리 검토:
- personalFinance/inflation-household-survival-strategy: 절약·고정비·가계 예산 실행. 신규 물가 글은 공식 지표와 개인 경험의 측정 차이에 집중한다.
- investingInfo/usd-krw-exchange-rate-and-kospi: 외국인 수급·수출·시장 해석. 신규 환율 글은 미결제 달러 노출과 국내가격 전가 시차에 집중한다.
- investingInfo/usd-krw-weak-won-sector-map-kospi: 업종 수혜·피해. 신규 글은 특정 업종 추천 대신 결제와 비용을 계산한다.
- personalFinance/personal-finance-3pillars: 가계 실행의 후속 읽기. 신규 글에서는 통계 해석 뒤에 연결한다.
- 최근 재테크 3개: 통장 자동화·계산기 선택·주담대 예산이 목적이다. 신규 경제정보 글은 계산기 CTA를 붙이지 않았으며 해당 글·이미지·SEO 페이지 코드를 바꾸지 않았다.

신규 검색 의도:
- 물가: 소비자물가지수·체감물가·물가상승률 하락 / inflation vs prices·purchasing power. “둔화됐는데 왜 비싼가?”
- 환율: 환율 100원 상승·여행·직구 / USD KRW household costs·pass-through. “미결제액과 소매가격은 어떻게 달라지는가?”
- 고용: 실업률·고용률·경제활동참가율 / low unemployment job market. “실업률과 구직 경험은 왜 다른가?”

제목·설명은 기존 원문과 seoTitle/seoDescription까지 대조해 신규 중복이 없다. slug·언어별 URL 중복도 없고 첫 100자에 주요 개념이 들어간다. 관련성이 있는 기존 글로 연결해 기본 개념과 이번 심화 질문을 구분했다. 기존 글에 추가 수정이 필요하지 않았다.

## 6. 내부링크

### KO · inflation-down-prices-still-high

- [/posts/economicInfo/inflation-basics](https://www.finmaphub.com/posts/economicInfo/inflation-basics)
- [/posts/economicInfo/inflation-rate-basics](https://www.finmaphub.com/posts/economicInfo/inflation-rate-basics)
- [/posts/economicInfo/usdkrw-100won-rise-household-cost](https://www.finmaphub.com/posts/economicInfo/usdkrw-100won-rise-household-cost)
- [/posts/personalFinance/personal-finance-3pillars](https://www.finmaphub.com/posts/personalFinance/personal-finance-3pillars)

### KO · usdkrw-100won-rise-household-cost

- [/posts/economicInfo/fx-basics](https://www.finmaphub.com/posts/economicInfo/fx-basics)
- [/posts/economicInfo/oil-shock-to-usdkrw-korea-transmission](https://www.finmaphub.com/posts/economicInfo/oil-shock-to-usdkrw-korea-transmission)
- [/posts/economicInfo/inflation-down-prices-still-high](https://www.finmaphub.com/posts/economicInfo/inflation-down-prices-still-high)
- [/posts/investingInfo/usd-krw-exchange-rate-and-kospi](https://www.finmaphub.com/posts/investingInfo/usd-krw-exchange-rate-and-kospi)
- [/market/indices](https://www.finmaphub.com/market/indices)

### KO · low-unemployment-hard-to-find-job

- [/posts/economicInfo/indicator-basics](https://www.finmaphub.com/posts/economicInfo/indicator-basics)
- [/posts/economicInfo/inflation-down-prices-still-high](https://www.finmaphub.com/posts/economicInfo/inflation-down-prices-still-high)
- [/posts/economicInfo/interest-rate-basics](https://www.finmaphub.com/posts/economicInfo/interest-rate-basics)
- [/posts/personalFinance/personal-finance-3pillars](https://www.finmaphub.com/posts/personalFinance/personal-finance-3pillars)

### EN · inflation-down-prices-still-high

- [/en/posts/economicInfo/inflation-basics](https://www.finmaphub.com/en/posts/economicInfo/inflation-basics)
- [/en/posts/economicInfo/inflation-rate-basics](https://www.finmaphub.com/en/posts/economicInfo/inflation-rate-basics)
- [/en/posts/economicInfo/usdkrw-100won-rise-household-cost](https://www.finmaphub.com/en/posts/economicInfo/usdkrw-100won-rise-household-cost)
- [/en/posts/economicInfo/low-unemployment-hard-to-find-job](https://www.finmaphub.com/en/posts/economicInfo/low-unemployment-hard-to-find-job)

### EN · usdkrw-100won-rise-household-cost

- [/en/posts/economicInfo/fx-basics](https://www.finmaphub.com/en/posts/economicInfo/fx-basics)
- [/en/posts/economicInfo/oil-shock-to-usdkrw-korea-transmission](https://www.finmaphub.com/en/posts/economicInfo/oil-shock-to-usdkrw-korea-transmission)
- [/en/posts/economicInfo/inflation-down-prices-still-high](https://www.finmaphub.com/en/posts/economicInfo/inflation-down-prices-still-high)
- [/en/posts/investingInfo/usd-krw-exchange-rate-and-kospi](https://www.finmaphub.com/en/posts/investingInfo/usd-krw-exchange-rate-and-kospi)
- [/en/market/indices](https://www.finmaphub.com/en/market/indices)

### EN · low-unemployment-hard-to-find-job

- [/en/posts/economicInfo/indicator-basics](https://www.finmaphub.com/en/posts/economicInfo/indicator-basics)
- [/en/posts/economicInfo/inflation-down-prices-still-high](https://www.finmaphub.com/en/posts/economicInfo/inflation-down-prices-still-high)
- [/en/posts/economicInfo/interest-rate-basics](https://www.finmaphub.com/en/posts/economicInfo/interest-rate-basics)
- [/en/posts/personalFinance/personal-finance-3pillars](https://www.finmaphub.com/en/posts/personalFinance/personal-finance-3pillars)

각 글 중간 1~2개, 끝부분 2~4개로 분산했다. 경로는 실제 언어별 파일 또는 pages 경로와 대조했고, 브라우저 검사에서 중복 제외 목적지 **23개 HTTP 200**을 확인했다. 전체 게시글 링크 검사는 162파일 중 레지스트리 발행 대상 145파일을 확인해 broken 0, suspicious 0, self URL missing 0이었다.

## 7. 한·영 및 브라우저 검증

| 경로 | 언어 전환 | canonical·hreflang | H1·커버·Hero | JSON-LD | 390/1440px |
| --- | --- | --- | --- | --- | --- |
| /posts/economicInfo/inflation-down-prices-still-high | KO→EN PASS | www canonical + ko/en PASS | 각 1회 PASS | BlogPosting·BreadcrumbList·FAQPage 각 1개 | 가로 넘침 없음·전체 화면 PNG 기록 |
| /posts/economicInfo/usdkrw-100won-rise-household-cost | KO→EN PASS | www canonical + ko/en PASS | 각 1회 PASS | BlogPosting·BreadcrumbList·FAQPage 각 1개 | 가로 넘침 없음·전체 화면 PNG 기록 |
| /posts/economicInfo/low-unemployment-hard-to-find-job | KO→EN PASS | www canonical + ko/en PASS | 각 1회 PASS | BlogPosting·BreadcrumbList·FAQPage 각 1개 | 가로 넘침 없음·전체 화면 PNG 기록 |
| /en/posts/economicInfo/inflation-down-prices-still-high | EN→KO PASS | www canonical + ko/en PASS | 각 1회 PASS | BlogPosting·BreadcrumbList·FAQPage 각 1개 | 가로 넘침 없음·전체 화면 PNG 기록 |
| /en/posts/economicInfo/usdkrw-100won-rise-household-cost | EN→KO PASS | www canonical + ko/en PASS | 각 1회 PASS | BlogPosting·BreadcrumbList·FAQPage 각 1개 | 가로 넘침 없음·전체 화면 PNG 기록 |
| /en/posts/economicInfo/low-unemployment-hard-to-find-job | EN→KO PASS | www canonical + ko/en PASS | 각 1회 PASS | BlogPosting·BreadcrumbList·FAQPage 각 1개 | 가로 넘침 없음·전체 화면 PNG 기록 |

모든 신규 페이지 HTTP 200, category KO 경제정보 / EN Economic Info, 의도하지 않은 noindex 없음, Article 중복 없음, FAQ 표시와 FAQPage 8문항 일치. 각 글 이미지 4개 로딩, 별도 계산기 버튼 0개, 브라우저 런타임 오류 0건이다.

스크린샷: reports/economics-{ko|en}-{slug}-{390|1440}.png **12개**. 추가 상단 미리보기 2개:
- [KO 데스크톱 상단](economics-ko-inflation-down-prices-still-high-1440-top.png)
- [EN 모바일 상단](economics-en-usdkrw-100won-rise-household-cost-390-top.png)

회귀 12개 경로:
- 최근 재테크 KO3·EN2의 기존 계산기 CTA 유지.
- KO 전용 주담대 글은 EN 전환 시 기존 안내를 유지하고 EN URL은 404 유지.
- 기존 경제정보 inflation-basics·fx-basics·indicator-basics의 KO/EN 6개: canonical 및 기존 자동 추천 CTA 유지.
- 작업 전 159개 파일(기존 게시글 156개와 게시글 페이지·Header·SeoHead)의 SHA-256 동일.

외부 광고·폰트·분석 요청은 차단했다. 로컬 /api/ 요청은 모의 응답으로 처리해 화면 검사가 조회수·좋아요·댓글 DB를 쓰지 않도록 했다. 스크린샷의 광고 예약 여백은 기존 레이아웃이다.

## 8. 수정 파일

신규:
- content/posts/economicInfo/{ko,en}/의 위 6개 Markdown.
- public/images/posts/의 위 3폴더·12개 PNG.
- scripts/prepare_economics_assets_20261029.js: 생성 원본 보존·규격 변환·실파일 검사.
- scripts/prepare_economics_metadata_20261029.js: 표시 FAQ에서 schema 생성, 글 목록 등록.
- scripts/verify_economics_posts_20261029.js: 콘텐츠·수치·보존·사이트맵·브라우저 검사.
- reports/economics-posts-2026-10-29-{baseline,images,sources,links,validation}.json, 이 보고서, 화면 PNG 14개.

기존 수정:
- docs/blog-contents.md: 신규 글 6개 등록.
- lib/posts.js: 명시적 빈 도구 배열을 disableRelatedTools로 전달(4줄 추가).
- _components/ToolBacklinkKit.js: 위 플래그일 때만 추천 도구 빈 배열 반환(1줄 추가).
- public/sitemap-0.xml, public/sitemap-ko.xml, public/sitemap-en.xml, public/en/sitemap.xml: 빌드의 신규 URL 반영.
- reports/sitemap-clean-audit.md: 사이트맵 검사 시각과 개수 갱신.

핵심 diff:

```diff
+ tool: [] → disableRelatedTools: true
+ getPostRelatedToolIds: 해당 플래그일 때 [] 반환
+ 신규 KO/EN URL 6개 등록
```

기존에는 빈 배열도 추론·fallback으로 CAGR 등이 붙었다. 새 글의 명시적인 도구 생략 의도를 반영하는 최소 변경이다. 도구 미설정·기존 유효 도구 배열은 기존 추론을 유지하며 브라우저 회귀 검사로 확인했다. 의존성·배포 설정·환경변수·API·DB 스키마는 변경하지 않았다.

## 9. 실행 명령 및 검증 결과

| 명령 | 최종 결과 |
| --- | --- |
| node scripts/prepare_economics_assets_20261029.js | PASS: 새 PNG 12개. 기본 sandbox mkdir EPERM 후 동일 범위 권한 실행으로 완료; 기존 파일 덮어쓰기 없음 |
| node scripts/prepare_economics_metadata_20261029.js | PASS: FAQ 생성·6개 레지스트리 등록·길이 출력 |
| npm.cmd run build | PASS: 최종 편집본 빌드·235개 정적 페이지·postbuild 사이트맵 생성 |
| node scripts/verify_economics_posts_20261029.js | PASS: 6편·12개 이미지·26계산·159파일 보존·사이트맵 +6 |
| node scripts/verify_economics_posts_20261029.js --base-url=http://127.0.0.1:8003 | PASS: 신규6+회귀12 경로, 양방향 언어 전환, 이미지·SEO·모바일, 내부 목적지23 |
| node scripts/validate-jsonld.js | PASS: 전체 Markdown JSON 파싱·FAQ 구조 |
| node scripts/check_posts_links_local.js --registry=docs/blog-contents.md --dir=content/posts --ext=md,mdx --out=reports/economics-posts-2026-10-29-links.json | PASS: broken0·suspicious0·self URL missing0 |
| node scripts/verify_sitemap_clean.js | PASS: 금지URL0·필수URL누락0·x-default 위반0 |
| git diff --check | PASS: 공백 오류 없음. Git의 LF→CRLF 안내는 별도 |
| npm run lint | 미실행: package.json에 lint 스크립트 없음 |

작성 중 전용 정적 검사에서 중간 정리와 고용 img3 누락을 찾아 보완했다. 이후 EN을 권장 분량으로 편집하고 FAQ를 다시 생성했다. 브라우저 최초 재방문은 캐시 304를 200으로 단정한 검사 때문에 실패해 검사 캐시를 끈 뒤 재실행했다. 전체 화면 기록에는 모든 본문 이미지를 eager 로딩한 뒤 캡처하도록 보완했다. 최종 결과 JSON은 최종 편집본으로 다시 통과한 결과다.

사이트맵: 실제 URL 217→223, 추가6·삭제0·중복0. KO118, EN105이며 EN 두 sitemap 동일 대상을 포함한다. 일반 clean 검사 224 loc는 사이트맵 인덱스의 loc 1개를 포함한 수로 실제 페이지 223개와 구분한다.

## 10. 잔여 검토

- 운영 DB의 댓글·조회수·좋아요·시장 데이터 응답은 이번 검사 범위에 포함하지 않았다. API를 수정하거나 운영 데이터에 쓰지 않았다.
- 외부 광고·분석·운영 CDN·실제 결제사의 최종 환율은 검증하지 않았다. 카드 수수료 1.2%는 가상 값이다.
- BOK 첨부 PDF의 실제 지수값은 확인하지 못해 미인용했다. 향후 실제 시계열을 추가할 때 원화/계약통화·기준연도·계절조정·수정 여부를 함께 확인해야 한다.
- 현재 수치는 날짜를 고정한 공식 발표판에 근거한다. 이후 정정·개편이 생기면 동일 기준의 최신 자료로 갱신한다. 단일 월 자료를 지속적인 추세로 단정하지 않았다.
- 배포 후 실제 6개 URL, 이미지, 언어 전환, 운영 robots·사이트맵 접근과 검색 도구의 수집 상태를 확인할 수 있다. 이번 작업에서는 배포하지 않았다.
- 빌드 중 기존 Browserslist 데이터 경고가 있었으나 빌드는 통과했다. 요청 범위 밖 의존성 갱신은 하지 않았다.

검증용 로컬 서버는 작업 종료 시 중지했다. 커밋·푸시·운영 배포 없음.
