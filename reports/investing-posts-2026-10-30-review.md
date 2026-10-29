# FinMap 투자정보 신규 포스트 검토 보고서

작성·공식 자료 확인 시작: **2026-10-29 KST**. 최종 검증·보고: **2026-10-30 KST**.
원고는 10월 29일 작성해 datePublished/dateModified를 2026-10-29로 기록했다. 29일 명칭의 JSON·이미지 검증 자료는 같은 작업의 증빙이며 최종 보고서만 완료일인 30일을 사용한다.

## 1. Final Verdict

**PASS_WITH_NON_BLOCKING_REVIEWS**

요청한 한국어 3편·영문 2편, 고유 PNG 12개, 공식 원문·세법 시행 시점 검토, 수치 검산, 내부링크, SEO, 언어 전환, 빌드, 모바일·데스크톱 검증을 완료했다. 필수 로컬 검사에서 미해결 오류는 없다. 운영 광고·실제 DB 쓰기·CDN·검색엔진 색인은 별도 운영 환경 확인 대상이다.

작업 시작 시 Git은 깨끗했다. 기존 Markdown 162개와 상세 페이지·Header·SeoHead·ToolBacklinkKit·포스트 로더·두 계산 코어를 포함한 **169개 파일의 SHA-256이 모두 유지**됐다. 애플리케이션 코드와 의존성, 배포 설정을 변경하지 않았다. 커밋·푸시·운영 배포는 수행하지 않았다.

## 2. 신규 포스트 목록

예상 URL이며 아직 운영 배포하지 않았다.

| 언어 | 제목 | slug | 파일 | 예상 URL |
|---|---|---|---|---|
| KO | ETF 총보수만 보고 선택하면 안 되는 이유: 실질비용·추적오차·괴리율 비교법 | `etf-real-cost-tracking-error-premium` | [Markdown](../content/posts/investingInfo/ko/etf-real-cost-tracking-error-premium.md) | https://www.finmaphub.com/posts/investingInfo/etf-real-cost-tracking-error-premium |
| KO | 월배당 ETF, 매달 돈이 들어오면 이익일까? 분배금·배당락·총수익률의 함정 | `monthly-dividend-etf-total-return-trap` | [Markdown](../content/posts/investingInfo/ko/monthly-dividend-etf-total-return-trap.md) | https://www.finmaphub.com/posts/investingInfo/monthly-dividend-etf-total-return-trap |
| KO | 국내 상장 미국 ETF vs 미국 ETF 직접투자: 세금·환전·수수료·계좌별 비교 | `korea-listed-vs-us-listed-etf-tax-cost` | [Markdown](../content/posts/investingInfo/ko/korea-listed-vs-us-listed-etf-tax-cost.md) | https://www.finmaphub.com/posts/investingInfo/korea-listed-vs-us-listed-etf-tax-cost |
| EN | ETF Fees Are Not the Whole Cost: Tracking Error, Premiums, Discounts, and Real Trading Expenses | `etf-real-cost-tracking-error-premium` | [Markdown](../content/posts/investingInfo/en/etf-real-cost-tracking-error-premium.md) | https://www.finmaphub.com/en/posts/investingInfo/etf-real-cost-tracking-error-premium |
| EN | Monthly Dividend ETFs: Why Cash Distributions Are Not the Same as Investment Returns | `monthly-dividend-etf-total-return-trap` | [Markdown](../content/posts/investingInfo/en/monthly-dividend-etf-total-return-trap.md) | https://www.finmaphub.com/en/posts/investingInfo/monthly-dividend-etf-total-return-trap |

영문은 미국·글로벌 독자 기준으로 독립 작성했다. POST 1은 미국 공시의 management component와 total expense ratio를 구분하고 달러 사례를 사용한다. POST 2는 $30,000 사례와 미국 ROC·취득가액·1099-DIV를 설명한다. 한국 15.4% 가정과 미국 20% 가정은 각자의 명시된 교육용 조건이며 같은 세제라는 뜻이 아니다.

| 원고 | 가시 문자 수, 공백 정리·JSON-LD 제외 | 요약 | Hero | 표 | 사례 | FAQ | 본문 내부링크 |
|---|---:|---:|---:|---:|---:|---:|---:|
| KO / `etf-real-cost-tracking-error-premium` | 9,969 | 9 | 1 | 4 | 2 | 8 | 5 |
| KO / `monthly-dividend-etf-total-return-trap` | 10,339 | 9 | 1 | 4 | 2 | 8 | 5 |
| KO / `korea-listed-vs-us-listed-etf-tax-cost` | 12,048 | 9 | 1 | 4 | 2 | 8 | 5 |
| EN / `etf-real-cost-tracking-error-premium` | 17,809 | 9 | 1 | 4 | 2 | 8 | 5 |
| EN / `monthly-dividend-etf-total-return-trap` | 19,168 | 9 | 1 | 4 | 2 | 8 | 5 |

한국어는 요청의 권장 8,000~15,000자 범위다. 영문은 축약 번역을 피하고 미국 공시·세무 맥락을 설명해 더 길다. 모든 글에 핵심 변수 3개의 정의/계산·관측·한계, 관측 가능한 조건을 둔 3시나리오, 중간 정리 2개, 손실·변동성·MDD·기간·실패 패턴·매수/보유/중단 기준·실행 체크리스트를 포함했다.

## 3. 생성 이미지 목록

| 실제 경로 | 규격 | 결과 |
|---|---|---|
| `public/images/posts/etf-real-cost-tracking-error-premium/cover.png` | 1200×630 | 생성·PNG 저장·수치/개념 육안 검토 완료 |
| `public/images/posts/etf-real-cost-tracking-error-premium/img1.png` | 1600×900 | 생성·PNG 저장·수치/개념 육안 검토 완료 |
| `public/images/posts/etf-real-cost-tracking-error-premium/img2.png` | 1600×900 | 생성·PNG 저장·수치/개념 육안 검토 완료 |
| `public/images/posts/etf-real-cost-tracking-error-premium/img3.png` | 1600×900 | 생성·PNG 저장·수치/개념 육안 검토 완료 |
| `public/images/posts/monthly-dividend-etf-total-return-trap/cover.png` | 1200×630 | 생성·PNG 저장·수치/개념 육안 검토 완료 |
| `public/images/posts/monthly-dividend-etf-total-return-trap/img1.png` | 1600×900 | 생성·PNG 저장·수치/개념 육안 검토 완료 |
| `public/images/posts/monthly-dividend-etf-total-return-trap/img2.png` | 1600×900 | 생성·PNG 저장·수치/개념 육안 검토 완료 |
| `public/images/posts/monthly-dividend-etf-total-return-trap/img3.png` | 1600×900 | 생성·PNG 저장·수치/개념 육안 검토 완료 |
| `public/images/posts/korea-listed-vs-us-listed-etf-tax-cost/cover.png` | 1200×630 | 생성·PNG 저장·수치/개념 육안 검토 완료 |
| `public/images/posts/korea-listed-vs-us-listed-etf-tax-cost/img1.png` | 1600×900 | 생성·PNG 저장·수치/개념 육안 검토 완료 |
| `public/images/posts/korea-listed-vs-us-listed-etf-tax-cost/img2.png` | 1600×900 | 생성·PNG 저장·수치/개념 육안 검토 완료 |
| `public/images/posts/korea-listed-vs-us-listed-etf-tax-cost/img3.png` | 1600×900 | 생성·PNG 저장·수치/개념 육안 검토 완료 |

이미지 생성 도구의 내장 모드를 사용했다. 원본 비율을 유지하며 contain 방식으로 PNG를 저장했다. cover는 상세 페이지가 자동 출력하므로 본문에 재삽입하지 않았다. 각 페이지에서 커버 1개와 figure 3개가 실제 로딩된다. 한국어·영문 alt와 figcaption을 별도로 작성했다.

투자정보 가이드의 네이비·차콜과 라임 중심으로 구성했고 긴 제목·한국어 문장·미검증 세율을 이미지에 넣지 않았다. POST 1의 NAV100·가격99/101과 ±1%, POST 2의 100→99+1 및 동일 지급12의 총수익률 +12%/−3%를 계산과 대조했다. 개념 그래프는 실제 상품 성과가 아니라고 캡션에 표시했다.

초기 이미지 중 6개는 매수/매도 오독, 과장된 동전 높이, 불필요한 장문·색상·다른 기초자산 혼동을 줄이도록 재편집해 최종본만 저장했다. 생성 프롬프트·원본/수정 원본 경로·배치 경로·규격은 [이미지 명세](investing-posts-2026-10-29-images.json)에 있다.

## 4. 기존 글과의 차별화

실제 저장소의 기존 투자정보 **21개 주제·42개 한영 파일**의 Front Matter, 제목, 도입, H2/H3를 조사했다. 우선 검토 글의 본문과 관련 재테크 글도 대조했다. 전체 목록·도입·제목 증빙은 [기준 자료](investing-posts-2026-10-29-baseline.json)에 있다.

| 기존 slug | 기존 의도 / 신규 글과의 구분 |
|---|---|
| `why-check-cagr-etf` | ETF 보유 성과 평가 / 신규 POST 1은 주문 전 비용·가격 비교 |
| `diagnose-investing-skill-with-cagr` | 투자 성과 해석 / 신규는 비용 원인과 실행 규칙 |
| `cagr-7percent-reality-check` | CAGR 가정의 현실성 / 월분배 자체와 총수익의 회계적 차이와 구분 |
| `modern-6040-risk-budget` | 포트폴리오 배분·손실 예산 / 개별 ETF 실행·계좌 경로와 구분 |
| `bond-etf-duration-drives-returns` | 금리·듀레이션 위험 / 펀드 비용·월분배·계좌 선택과 구분 |
| `fx-hedge-vs-fx-exposure-korea-3-conditions` | 환헤지 결정 / POST 3은 같은 미국 노출을 얻는 상장시장·계좌 비교 |
| `dca-consistency-7-fail-patterns` | 적립 실행의 지속성 / 지급된 돈의 소비·재투자와 구분 |
| `dxy-dollar-index-basics` | 달러지수 기초 / ETF 거래 조건과 구분 |
| `dxy-market-impact` | 달러지수의 시장 전달 / 개인 계좌·과세 경로와 구분 |
| `etf-impact-of-tnx` | 미국 10년물과 ETF 민감도 / 비용 비교와 구분 |
| `indicator-marketinfo` | 시장지표 읽기 / ETF별 실행 원장과 구분 |
| `korea-etf-deep-dive-tnx` | 금리와 국내 ETF 노출 / 상장시장별 세금·환전과 구분 |
| `rates-discount-mortgage-demand-apt-prices` | 금리와 주택가격 / 금융상품 계좌 선택과 구분 |
| `real-estate-role-in-portfolio-risk-budget` | 부동산의 배분 역할 / ETF 내부·외부 비용과 구분 |
| `seoul-gyeonggi-incheon-risk-budget-framework` | 지역 부동산 위험 / 월분배 현금흐름과 구분 |
| `sp500-impact-on-korea-kospi` | 미국 주가의 한국시장 전달 / 동일 지수 투자 경로 선택과 구분 |
| `tnx-basics` | 미국채 금리 지표 / ETF 공시·거래 조건과 구분 |
| `us10y-impact-on-korea-and-stock-market` | 미국 금리의 국내 영향 / 개인 세금·계좌와 구분 |
| `usd-krw-exchange-rate-and-kospi` | 환율과 한국 주가 / 원화 세후 현금 계산과 구분 |
| `usd-krw-weak-won-sector-map-kospi` | 원화 약세 업종 지도 / 환전비용·계좌 제약과 구분 |
| `wti-impact-on-korea-kospi` | 유가의 국내시장 전달 / 분배금·ETF 비용과 구분 |

요청한 `what-is-cagr`는 실제로 personalFinance에 있다. 같은 카테고리의 `dca-fx-volatility-decomposition`, `fire-3-numbers-spending-horizon-withdrawal`, `fire-sequence-risk-first-5-years`도 대조했다. 신규 글은 CAGR 산식·복리·은퇴자금 규모를 다시 설명하는 대신 비용·분배락·계좌 경로의 고유 질문에 집중한다.

신규 주요 검색어는 POST 1의 ETF 총보수·기타비용·추적차이/추적오차·괴리율, POST 2의 월배당 ETF·분배금·총수익률·재투자·커버드콜, POST 3의 국내 상장 미국 ETF·해외 ETF 세금·ISA·연금·환전비용이다. 제목·description의 저장소 내 중복과 첫 100자 핵심어를 검사했다. 기존 title·slug·canonical·본문은 바꾸지 않았다.

## 5. 공식 출처

2026-10-29에 공식 원문을 직접 확인했다. 단순 제안·정책 확대안과 이미 공포된 법령을 구분했다. KRX 웹 도구의 403은 제한된 PowerShell 요청으로 원문 HTTP200을 확인해 해결했다. 게시일이 없는 자료에는 날짜를 만들지 않았다.

| 기관 | 자료·공식 URL | 발표/시행 정보 | 사용 범위·주의 |
|---|---|---|---|
| KRX | [ETF NAV·괴리율](https://www.krx.co.kr/contents/OPN/01/01030203/OPN01030203T1.jsp) | 게시일 미표시; 2026-10-29 직접 확인 | NAV·iNAV·시장가격 관계. 게시일 미표시; 상장폐지 등 주변 규정은 인용하지 않음. |
| KRX | [ETF 추적오차](https://open.krx.co.kr/contents/OPN/01/01030203/OPN01030203T2.jsp) | 게시일 미표시; 2026-10-29 직접 확인 | 원문은 수익률 차이를 추적오차율로 명명. 본문 TD·TE 통계 구분과 공시 산식 확인을 명시. |
| KRX | [ETF 가격지표](https://www.krx.co.kr/contents/OPN/01/01030204/OPN01030204T7.jsp) | 게시일 미표시; 2026-10-29 직접 확인 | 순자산·비용·좌수와 NAV 관계, 기초자산 배당 미수금 반영. ETF 분배락 설명은 별도 회계 등식으로 제시. |
| KRX | [ETF 세금제도](https://regulation.krx.co.kr/contents/RGL/03/03060105/RGL03060105.jsp) | 게시일 미표시; 2026-10-29 직접 확인 | 국내상장 기타 ETF의 보유기간 과세 구조 확인. 오래된 주변 거래세율은 인용하지 않고 현행 법령·국세청과 대조. |
| 금융투자협회 | [금융투자회사 영업 및 업무에 관한 규정 시행세칙 제4-66조](https://law.kofia.or.kr/service/law/detailArticlePrint.do?contentSeq=152235&historySeq=1154&seq=262) | 2016년 연혁 자료 | 보수·기타비용·매매중개수수료 구분 원칙만 사용. 현재 개별 ETF 비용은 최신 설명서에서 확인. |
| SEC Investor.gov | [Mutual Fund and ETF Fees and Expenses Investor Bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/mutual-fund-and-etf-fees-and-expenses-investor-bulletin) | 2025-07-23 | 펀드 내부 운용비용과 별도 거래·계좌 비용 구분. |
| SEC Investor.gov | [Exchange-Traded Funds (ETFs) Investor Bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-24) | 게시일 미표시; 2026-10-29 직접 확인 | NAV·프리미엄·디스카운트·호가 스프레드. |
| Vanguard | [What affects index tracking?](https://www.vanguard.co.uk/content/uk-aem/gb/en/professional/vanguard-365/investment-knowledge/etf-knowledge/what-affects-index-tracking) | 2026-01-04 | TD=펀드 총수익률−지수 총수익률, TE는 상대수익률 변동성. 제공자별 정의 차이. |
| IRS | [Topic no.404 Dividends](https://www.irs.gov/taxtopics/tc404) | 게시일 미표시; 2026-10-29 직접 확인 | 미국 비배당 분배금은 조정 취득가액을 낮추며 0 초과 지급은 양도차익 처리 가능. |
| IRS | [Publication 550](https://www.irs.gov/publications/p550) | 2025 과세연도판 | Form1099-DIV box3, 비배당 분배금·취득가액·재투자 과세. 2026판으로 표현하지 않음. |
| Nova Scotia Securities Commission | [What are covered call ETFs?](https://nssc.novascotia.ca/before-you-invest/what-are-covered-call-etfs) | 게시일 미표시; 2026-10-29 직접 확인 | 상승 참여 제한과 하락 위험이 남는 구조. 캐나다 교육자료를 미국 세율 근거로 사용하지 않음. |
| 국세청 | [주식 양도소득세 세액계산 흐름](https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=8800&mi=12274) | 게시일 미표시; 2026-10-29 직접 확인 | 국외주식 과세 거주 요건, 관련 과세 주식 손익통산과 합산 연250만원 기본공제. |
| 국세청 | [양도소득세 세율](https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7711&mi=2312) | 게시일 미표시; 2026-10-29 직접 확인 | 통상 외국법인 주식 국세20%; 지방세 포함22%와 구분. |
| 법제처 | [조세특례제한법 제91조의18](https://www.law.go.kr/법령/조세특례제한법/제91조의18) | 시행2026-09-18 / 법률21467호2026-03-17 타법개정 | ISA 통상 비과세200/400만원, 초과 국세9%, 계약3년, 연2000만원 이월·총1억원, 외국집합투자증권 배제. 미시행 확대안 제외. |
| 법제처 | [소득세법 제57조의2](https://www.law.go.kr/법령/소득세법/제57조의2) | 일반 시행2026-01-01 / 관련 연금 공제 부분2026-07-01 / 법률21221호2025-12-23 일부개정 | 간접투자 외국법인세액 공제와 연금 소득 범위. |
| 법제처 | [소득세법 제129조](https://www.law.go.kr/법령/소득세법/제129조) | 일반 시행2026-01-01 / 제8~11항2026-07-01 / 법률21221호2025-12-23 일부개정 | 통상 배당 국세14%, 연금계좌 인출 공제 제8~10항 신설2025-12-23. 공제한도·초과세액 처리. |
| 법제처 | [소득세법 시행령 제117조의2](https://www.law.go.kr/법령/소득세법시행령/제117조의2) | 시행2026-10-01 / 대통령령36737호2026-09-30 일부개정 | 2026-02-27 개정된 소득 종류별 외국세액 조정계수와 원천징수 계산. 본문은 계수 단일값을 임의 적용하지 않음. |
| 법제처 | [소득세법 시행령 제26조의2](https://www.law.go.kr/법령/소득세법시행령/제26조의2) | 시행2026-10-01 / 대통령령36737호2026-09-30 일부개정 | 집합투자기구 결산·분배 및 재투자 예외. 해외자산 TR형이 영구 무분배라고 가정하지 않음. |
| 법제처 | [지방세법 제103조의13](https://www.law.go.kr/법령/지방세법/제103조의13) | 시행2026-01-01 / 법률21308호2025-12-31 일부개정 | 소득세 원천징수액의10% 지방소득세 특별징수; 배당14→15.4, ISA9→9.9. |
| 대한민국 정책브리핑·정부 | [해외펀드 투자소득 외국납부세액공제 안내](https://www.korea.kr/news/policyNewsView.do?newsId=148964618) | 2026-05-20 | 2025-01-01 이후 소득 및 2026-07-01 이후 연금계좌 인출 적용 안내. 일반·ISA·연금 및 종합과세 차이. 개정 법령과 함께 확인. |
| 금융위원회 | [2025년 연금저축 적립·운용현황 및 유의사항](https://www.fsc.go.kr/po010105/87144) | 2026년 공표 자료 | 연금 외 인출시 공제 원금·운용수익16.5% 일반 구조와 부득이한 사유 예외, 계좌이체와 해지 구분. |
| 금융감독원 / KDI 공식 정책자료 | [개인형IRP 가입부터 연금수령까지](https://eiec.kdi.re.kr/policy/materialView.do?num=233201) | 2022-12-12 | IRP 위험자산70% 일반 한도 및 중도인출 제약. 현재 제공기관2026자료로 교차 확인. |
| KB증권 | [IRP ETF 선택 기준과 안전자산 분류](https://blog.kbsec.com/irp/irp-etf-선택-기준-안전자산/) | 2026-09-29 / 준법감시2026-2523(2026-09-23~2027-09-22) | 편입 위험자산70% 일반 구조와 상품별 분류·예외. 나머지30%가 원금보장이라는 해석 금지. 개별 금융기관 안내로 표기. |
| IRS | [United States–Korea Income Tax Convention](https://www.irs.gov/pub/irs-trty/korea.pdf) | 조약 원문 | 제12조 통상 포트폴리오 배당15% 상한. 모든 ETF 지급액이나 모든 납세자의 무조건 세율로 사용하지 않음. |
| 전국투자자교육협의회 | [국내외 ETF 세금 비교 교육자료](https://www.kcie.or.kr/guide/236/239/web_view?content_idx=1973&series_idx=) | 2024-05-30 | 국내상장 해외 ETF 보유기간과세와 해외상장22% 구조 교차 확인. 과거 TR 등의 주변 설명은 현행 시행령으로 대조; 본문 직접 링크 생략. |
| 법제처 | [소득세법 제21221호 개정문·부칙](https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010102&lsId=001565) | 공포2025-12-23, 관련 부분2026-07-01 시행 | 부칙1·4·15 직접 확인. 2025년 이후 소득과 2026년7월 이후 인출, 그 이전 인출분의 이후 한도 내 공제를 구분 |

세법 설명은 일반적인 한국 거주 개인의 주식형 ETF 조건을 중심으로 했다. 국내 해외주식형 ETF의 과세 기준과 국내주식형 비과세를 혼동하지 않았다. 해외 양도 기본공제는 관련 주식 합산 기준이며 증권사별·ETF별로 늘어나지 않는다. 14%/20% 국세와 지방세 포함 15.4%/22%, ISA 국세9%와 통상9.9%도 구분했다.

연금 외국세액은 발생 즉시 전액 현금 환급으로 표시하지 않았다. 소득세법 57조의2·129조, 시행령117조의2의 계산·조정계수 및 공포 부칙을 정부 안내와 대조했다. 과거 KRX 주변 세율·KCIE의 과거 TR 설명을 현행 제도로 재사용하지 않았다. IRP70%는 일반 한도와 상품별 분류·예외를 명시하며 개별 편입 가능성은 금융회사 확인 사항으로 남겼다.

상세 목록은 [출처 JSON](investing-posts-2026-10-29-sources.json), 시행 시점 증빙은 [부칙 검토](investing-posts-2026-10-29-tax-commencement.json)에 있다. KRX 원문 HTML 4개는 검증 증빙이며 사이트에 노출하는 운영 콘텐츠가 아니다.

## 6. 계산기 및 내부링크

각 원고의 본문 링크는 5개이며 언어별 실제 파일·라우트를 확인했다. 중간 1~2개, 마지막 부분 3~4개로 나눴다. 신규 연결을 위해 기존 글을 수정할 필요는 없었다.

| 원고 | 본문 내부 경로 |
|---|---|
| KO / `etf-real-cost-tracking-error-premium` | `/posts/investingInfo/why-check-cagr-etf`<br>`/tools/cagr-calculator`<br>`/posts/investingInfo/monthly-dividend-etf-total-return-trap`<br>`/posts/investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions`<br>`/posts/investingInfo/modern-6040-risk-budget` |
| KO / `monthly-dividend-etf-total-return-trap` | `/posts/investingInfo/etf-real-cost-tracking-error-premium`<br>`/posts/personalFinance/fire-sequence-risk-first-5-years`<br>`/posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal`<br>`/posts/personalFinance/what-is-cagr`<br>`/posts/investingInfo/modern-6040-risk-budget` |
| KO / `korea-listed-vs-us-listed-etf-tax-cost` | `/posts/investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions`<br>`/posts/investingInfo/etf-real-cost-tracking-error-premium`<br>`/posts/personalFinance/dca-fx-volatility-decomposition`<br>`/posts/investingInfo/monthly-dividend-etf-total-return-trap`<br>`/posts/investingInfo/modern-6040-risk-budget` |
| EN / `etf-real-cost-tracking-error-premium` | `/en/posts/investingInfo/why-check-cagr-etf`<br>`/en/tools/cagr-calculator`<br>`/en/posts/investingInfo/monthly-dividend-etf-total-return-trap`<br>`/en/posts/investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions`<br>`/en/posts/investingInfo/modern-6040-risk-budget` |
| EN / `monthly-dividend-etf-total-return-trap` | `/en/posts/investingInfo/etf-real-cost-tracking-error-premium`<br>`/en/posts/personalFinance/fire-sequence-risk-first-5-years`<br>`/en/posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal`<br>`/en/posts/personalFinance/what-is-cagr`<br>`/en/posts/investingInfo/modern-6040-risk-budget` |

POST 1에서만 실제 `/tools/cagr-calculator`와 영문 경로를 한 번 연결했다. 시작값·종료값·기간을 쓰는 성과 보조 도구로 설명하고 실시간 ETF 비용·TE 자동 비교 기능처럼 표현하지 않았다. 현금흐름·총수익 기준과 비용/분배금 중복 반영을 주의하도록 했다.

POST 2·3은 거래 원장과 실제 명세를 준비하는 다음 행동을 제공한다. 일반 복리·적립 계산기로 ETF 분배일·ROC·계좌별 세금을 자동 계산한다고 소개하지 않았다. 5개 원고 모두 `tool: []`를 사용해 기존 자동 추론 CTA를 끄고, POST 1의 문맥 링크만 유지했다. 브라우저에서 POST 1은 CAGR 링크1개, POST 2·3은 도구 링크0개로 확인했다. 기존 글의 자동 CTA는 유지됐다.

## 7. 한·영 운영 결과

- POST 1 KO→EN, EN→KO 및 POST 2 KO→EN, EN→KO: PASS.
- POST 3 KO에서 EN 선택: URL 그대로, **“이 글은 영어 버전이 아직 없습니다.”** 표시.
- `/en/posts/investingInfo/korea-listed-vs-us-listed-etf-tax-cost`: 직접 요청404.
- POST 3 EN Markdown·사이트맵 URL·영문 hreflang 없음.
- POST 1·2 canonical 및 KO/EN hreflang: 실제 번역 경로와 일치.
- 기존 서로 다른 slug의 DCA 한영 매핑: 양방향 전환·hreflang 유지.
- 기존 한국어 전용 주택가격 글: EN 차단 및 영어404 유지.

`hasPostSlugStrict`, `otherLangAvailable`, Header 차단, SEO 대체 언어 판정을 확인했고 기존 기능으로 충족돼 관련 코드를 수정하지 않았다.

## 8. 수정 파일 목록

새 운영 파일은 위 Markdown5개와 `public/images/posts/{신규slug}/{cover,img1,img2,img3}.png` 12개다.

새 보조 스크립트:

- `scripts/prepare_investing_posts_20261029.js`: 최초 보존 기준, PNG 규격 저장, FAQ·목록 등록.
- `scripts/investing_examples_20261029.js`: 가상 사례의 월별 계산과 거래 경로 산식, KRX 본문 추출. 운영 세금 계산기로 사용하지 않는다.
- `scripts/verify_investing_posts_20261029.js`: 신규 원고·독립 수치 대조·이미지·SEO·브라우저·회귀 검증.

새 검토 자료는 이 보고서, `reports/investing-posts-2026-10-29-{baseline,images,links,sources,tax-commencement,validation}.json`, `reports/investing-krx-{nav,price,tax,tracking}-source-2026-10-29.html`, 브라우저 스크린샷12개다. 원본 생성 이미지는 도구의 외부 저장 위치에 그대로 두고 필요한 최종 PNG만 프로젝트로 복사했다. 빌드 캐시·임시 산출물을 운영 소스로 추가하지 않았다.

기존 수정 파일:

| 파일 | 변경 이유 |
|---|---|
| `docs/blog-contents.md` | 신규5개 제목·description·URL 등록 |
| `public/sitemap-0.xml` | 신규5개 추가 및 빌드 시 lastmod 재생성 |
| `public/sitemap-ko.xml` | KO3개 추가 |
| `public/sitemap-en.xml` | EN2개 추가 |
| `public/en/sitemap.xml` | EN 미러2개 추가 |
| `reports/sitemap-clean-audit.md` | 최신 사이트맵 검사 결과 갱신 |

루트 `public/sitemap.xml`은 빌드에서 재생성되지만 내용상 diff가 없다. 기존 포스트·계산기·렌더러·언어 기능·SEO 코드·package 파일·배포 설정은 수정하지 않았다.

## 9. 테스트 결과

| 실제 수행 명령/검사 | 결과 |
|---|---|
| `node scripts/prepare_investing_posts_20261029.js baseline` | 기존169개 파일·투자정보42개 파일 기준 확보 |
| `node scripts/prepare_investing_posts_20261029.js assets` | 신규12PNG 규격 저장. 기본 샌드박스 mkdir EPERM 후 승인된 동일 명령으로 성공 |
| `node scripts/prepare_investing_posts_20261029.js metadata` | FAQ8개씩 생성·신규5개 목록 등록 |
| `npm.cmd run build` | 최종 원고 기준 성공, 정적 페이지240개 생성 및 postbuild 성공 |
| `node scripts/verify_investing_posts_20261029.js` | 원고5개·PNG12개·계산69개·보존169개·사이트맵+5 PASS |
| `node scripts/verify_investing_posts_20261029.js --base-url=http://127.0.0.1:8003` | 신규5개·회귀18개 경로 PASS, 실제 내부 목적지200 확인 |
| `node scripts/validate-jsonld.js` | 전체 JSON-LD 파싱·FAQ 필드 PASS |
| `node scripts/check_posts_links_local.js --registry=docs/blog-contents.md --dir=content/posts --ext=md,mdx --out=reports/investing-posts-2026-10-29-links.json` | 전체167개 파일, 목록 등록150개 검사; Broken0, Suspicious0, Self URL missing0 |
| `node scripts/verify_sitemap_clean.js` | index 포함229 loc 검사, 금지/필수 누락/x-default 정책 위반0 |
| `git diff --check` | 공백 오류0. 기존 Git CRLF 자동 변환 안내만 발생 |
| `git status --short`, `git diff --stat`, 변경 diff 확인 | 예상한 새 파일과 목록·사이트맵·검사 보고서만 변경 |

`npm run lint`는 package.json에 없어 실행하지 않았다. 의존성을 추가하지 않았다.

전용 검증 스크립트 초안은 월분배 박스의 “계산/Calculation”과 첫 문장 “monthly dividend ETF” 문구를 인식하지 못해 실패했다. 판정식을 실제 콘텐츠에 맞게 고친 뒤 모든 검사를 다시 통과했다. 콘텐츠 오류를 무시해 PASS 처리하지 않았다. 원문 확인 과정의 일부 웹 접근 실패는 위의 성공한 공식 원문으로 대체했으며 미열람 자료를 근거로 사용하지 않았다.

수치 검산은 단순 표시값 복사가 아니다. 월별 재투자 반복 계산을 별도의 등비수열 닫힌 식과 대조했고, 상장시장 비용 산식은 매 단계 현금 흐름과 대조했다.

- POST 1: NAV 대비 ±1%, 101→100 손실 약−0.9901%, A/B 비용 구성, 100좌 스프레드 손실, KO 총보수만 비교한6년과 EN 전체 운용비용 비교15년의 서로 다른 범위.
- POST 2: 99+1=100, 100/85/110 기말가치와 현금12의 총수익률, KO3천만원·EN3만달러의 1/3/5년 재투자·소비 현금·세금·매수비용. 연속 월1%의 실제 기초수익이 분배 재원을 만든다는 가정을 명시했다.
- POST 3: 1천만원·1억원의 동일 비율 비용 후 금액과 가정 세금, 1년/5년 보유비용, 월30만원 신규 매수비용150원/449.85원, 환율 불변/+10%/−10%에서 원화8%/18.8%/−2.8%.
- 사례는 실제 상품이나 개인의 세금 견적이 아니다. 국내 과표증가분·증빙 인정 차익·남은 기본공제·다른 금융소득·분배금0 등 단순화 조건을 명시했다. 1억원을 신규 ISA에 당해 한 번에 납입할 수 있다고 가정하지 않았다.

SEO 검사는 렌더링 후 canonical·hreflang·robots, Article 중복0, **BlogPosting·BreadcrumbList·FAQPage 각1**, H1각1, Hero각1, FAQ 가시 답변과 JSON-LD 일치, 커버1+figure3 로딩을 포함한다.

사이트맵 본문 URL은 **223→228**, KO는 **118→121**, EN은 **105→107**이다. 기존 URL 제거0, 신규5개만 추가, 없는 POST 3 EN URL0이다.

| 신규 경로 | 최종 브라우저 캡처 | 레이아웃 |
|---|---|---|
| `/posts/investingInfo/etf-real-cost-tracking-error-premium` | [390px](investing-ko-etf-real-cost-tracking-error-premium-390.png) · [1440px](investing-ko-etf-real-cost-tracking-error-premium-1440.png) | 가로 넘침 없음, 표 스크롤 가능, 본문 이미지 16:9 |
| `/posts/investingInfo/monthly-dividend-etf-total-return-trap` | [390px](investing-ko-monthly-dividend-etf-total-return-trap-390.png) · [1440px](investing-ko-monthly-dividend-etf-total-return-trap-1440.png) | 가로 넘침 없음, 표 스크롤 가능, 본문 이미지 16:9 |
| `/posts/investingInfo/korea-listed-vs-us-listed-etf-tax-cost` | [390px](investing-ko-korea-listed-vs-us-listed-etf-tax-cost-390.png) · [1440px](investing-ko-korea-listed-vs-us-listed-etf-tax-cost-1440.png) | 가로 넘침 없음, 표 스크롤 가능, 본문 이미지 16:9 |
| `/en/posts/investingInfo/etf-real-cost-tracking-error-premium` | [390px](investing-en-etf-real-cost-tracking-error-premium-390.png) · [1440px](investing-en-etf-real-cost-tracking-error-premium-1440.png) | 가로 넘침 없음, 표 스크롤 가능, 본문 이미지 16:9 |
| `/en/posts/investingInfo/monthly-dividend-etf-total-return-trap` | [390px](investing-en-monthly-dividend-etf-total-return-trap-390.png) · [1440px](investing-en-monthly-dividend-etf-total-return-trap-1440.png) | 가로 넘침 없음, 표 스크롤 가능, 본문 이미지 16:9 |

전체 화면10개에 상단 미리보기2개를 추가했다. 본문 표20개는 모바일에서 모든 열을 가로 스크롤로 접근할 수 있고 페이지 자체 가로 넘침은 없다. 본문 이미지의 실제 표시 비율16:9를 확인했다. 생성 이미지12개와 KO 데스크톱·EN 모바일 상단 캡처를 육안으로 확인했다.

브라우저는 Chrome과 로컬 Next 프로덕션 서버를 사용했다. 페이지의 DB 쓰기를 막기 위해 로컬 API는 모의 응답으로 처리했고 광고·분석·외부 글꼴 요청은 차단했다. 런타임 오류0이며 검사 서버는 종료했다. Ctrl+C 종료 시 프로세스 코드1은 의도한 종료이며 검사 실패가 아니다.

상세 결과: [검증 JSON](investing-posts-2026-10-29-validation.json), [내부링크 JSON](investing-posts-2026-10-29-links.json), [사이트맵 검사](sitemap-clean-audit.md).

## 10. 잔여 점검 항목

운영 광고 슬롯·동의 흐름, 실제 댓글/좋아요/조회수 DB 쓰기, CDN 이미지 캐시·최적화, 운영 도메인 응답과 배포 후 검색엔진 색인은 이번 로컬 검증 범위에 포함하지 않았다. 배포가 승인된 뒤 해당 환경에서 확인할 수 있다. 광고 차단 때문에 캡처에 보이는 기존 광고 여백은 유지됐다.

개인별 실제 세금, 금융회사별 연금·ISA 편입 가능 상품·외국세액 이체/공제 내역, 실제 주문 호가·수수료와 계좌 약관은 이용 시점의 명세 확인이 필요하다. 검증되지 않은 개인 세후 결과나 미래 수익을 보장하지 않았다.

커밋·푸시·운영 배포를 진행하지 않았으며 사용자 검토 가능한 파일과 증빙을 작업 공간에 남겼다.
