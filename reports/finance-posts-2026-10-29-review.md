# FinMap 신규 재테크 포스트 3개 반영 결과

작업일: 2026-10-29 (Asia/Seoul). 프로젝트 반영 완료, 배포·커밋·푸시는 수행하지 않음.

## 1. Final Verdict

**PASS_WITH_NON_BLOCKING_REVIEWS**

신규 콘텐츠·이미지·수치·내부링크·SEO·언어 전환·빌드 검증을 완료했다. 실제 은행 심사, 실서비스 광고와 댓글·조회수 DB는 이번 로컬 콘텐츠 검증 범위에 포함하지 않았다. 아래 9번의 운영 확인은 별도로 남긴다.

## 2. 신규 포스트 목록

모든 파일의 발행일·수정일은 2026-10-29다. 한국어 category는 `재테크`, 영어는 기존 카테고리 라우팅에 필요한 `Personal Finance`, postCategory는 모두 `personalFinance`다.

| 주제·언어 | 제목 | 파일 | 예상 공개 URL |
| --- | --- | --- | --- |
| POST 1 KO | 통장 쪼개기, 아직도 감으로 하나요: 월급일 하루 만에 끝내는 4통장 자동화 설계 | [four-account-salary-automation.md](../content/posts/personalFinance/ko/four-account-salary-automation.md) | https://www.finmaphub.com/posts/personalFinance/four-account-salary-automation |
| POST 1 EN | Automate Your Paycheck with Four Account Roles: Bills, Spending, and Saving Without Guesswork | [four-account-salary-automation.md](../content/posts/personalFinance/en/four-account-salary-automation.md) | https://www.finmaphub.com/en/posts/personalFinance/four-account-salary-automation |
| POST 2 KO | 복리 vs 적립식, 어떤 계산기를 먼저 써야 할까: 상황별 도구 선택 가이드 | [compound-vs-dca-calculator-guide.md](../content/posts/personalFinance/ko/compound-vs-dca-calculator-guide.md) | https://www.finmaphub.com/posts/personalFinance/compound-vs-dca-calculator-guide |
| POST 2 EN | Compound Interest vs DCA Calculator: Choose the Right Tool for Your Investment Question | [compound-vs-dca-calculator-guide.md](../content/posts/personalFinance/en/compound-vs-dca-calculator-guide.md) | https://www.finmaphub.com/en/posts/personalFinance/compound-vs-dca-calculator-guide |
| POST 3 KO | 내 소득이면 아파트를 얼마까지 봐야 할까: 집값이 아니라 월 상환 가능액부터 정하는 법 | [home-price-by-monthly-mortgage-payment.md](../content/posts/personalFinance/ko/home-price-by-monthly-mortgage-payment.md) | https://www.finmaphub.com/posts/personalFinance/home-price-by-monthly-mortgage-payment |

POST 3 영어 파일은 생성하지 않았다. 위 URL은 배포 후 주소이며 이번 작업에서 실사이트에 게시하지 않았다.

| 파일 | 화면 본문 문자 수(공백 정규화, JSON-LD 제외) | 시작 요약 | Hero | 비교표 | 사례 | FAQ | 본문 내부링크 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| POST 1 KO | 9,554 | 9 | 1 | 3 | 2 | 8 | 5 |
| POST 1 EN | 14,449 | 9 | 1 | 3 | 2 | 8 | 5 |
| POST 2 KO | 9,738 | 9 | 1 | 4 | 2 | 8 | 6 |
| POST 2 EN | 16,124 | 9 | 1 | 4 | 2 | 8 | 6 |
| POST 3 KO | 10,905 | 9 | 1 | 4 | 2 | 8 | 5 |

각 글에 핵심 변수 3개 정의·관측·한계, 3가지 운영 시나리오와 전환 조건, 오해 교정, 체크리스트, 15분·60분·1주 실행 계획을 포함했다. 영어는 USD·급여 주기·가구 사례를 독자에 맞게 다시 작성했다.

## 3. 생성 이미지 목록

`imagegen` 스킬의 **built-in image_gen**으로 이미지당 별도 프롬프트를 사용해 12개를 생성했다. 생성 원본을 보존하고 프로젝트에 최종 PNG를 저장했다. 규격은 커버 1200×630, 본문 1600×900이며 비율을 유지해 맞췄다. 이미지에는 긴 제목·한글을 넣지 않았고 한·영 본문에서 같은 이미지를 사용한다.

| 실제 파일 | 결과 |
| --- | --- |
| `public/images/posts/four-account-salary-automation/cover.png` | 생성·저장·PNG 규격 확인 |
| `public/images/posts/four-account-salary-automation/img1.png` | 생성·저장·PNG 규격 확인 |
| `public/images/posts/four-account-salary-automation/img2.png` | 생성·저장·PNG 규격 확인 |
| `public/images/posts/four-account-salary-automation/img3.png` | 생성·저장·PNG 규격 확인 |
| `public/images/posts/compound-vs-dca-calculator-guide/cover.png` | 생성·저장·PNG 규격 확인 |
| `public/images/posts/compound-vs-dca-calculator-guide/img1.png` | 생성·저장·PNG 규격 확인 |
| `public/images/posts/compound-vs-dca-calculator-guide/img2.png` | 생성·저장·PNG 규격 확인 |
| `public/images/posts/compound-vs-dca-calculator-guide/img3.png` | 생성·저장·PNG 규격 확인 |
| `public/images/posts/home-price-by-monthly-mortgage-payment/cover.png` | 생성·저장·PNG 규격 확인 |
| `public/images/posts/home-price-by-monthly-mortgage-payment/img1.png` | 생성·저장·PNG 규격 확인 |
| `public/images/posts/home-price-by-monthly-mortgage-payment/img2.png` | 생성·저장·PNG 규격 확인 |
| `public/images/posts/home-price-by-monthly-mortgage-payment/img3.png` | 생성·저장·PNG 규격 확인 |

최종 프롬프트 전체와 원본·목적지 경로: [이미지 생성 기록](finance-posts-2026-10-29-images.json).

기존 Cloudinary 이미지는 변경하지 않았다. `lib/posts.js`와 이미지 렌더러가 로컬 경로도 지원하므로 새 이미지는 요청한 `public/images/posts/` 경로를 사용했다. 커버는 페이지가 자동 렌더링한다. 따라서 v3의 본문 figure 4개 예시 대신 **자동 커버 1개 + 본문 figure 3개**로 중복을 피했으며, 브라우저에서 네 이미지가 각각 한 번씩 로드되는 것을 검증했다.

## 4. 기존 글과의 검색 의도 차별화

| 신규 글 | 핵심 키워드 | 가장 가까운 기존 글 | 해결하는 문제의 경계 |
| --- | --- | --- | --- |
| POST 1 | 통장 쪼개기, 4통장 관리법, 월급 자동이체 | `personal-start-5steps`, `personal-finance-3pillars` | 기존 글은 재무 우선순위·입문 계획. 신규 글은 결제 준비금, 카드 중복 지출, 급여일·결제일과 자동이체 순서를 구체적으로 설계 |
| POST 2 | 복리 적립식 차이, 복리 계산기·DCA 계산기 선택 | `compound-calculator-guide`, `dca-guide`, `dca-vs-lump-sum-when-results-differ` | 기존 글은 개별 도구 사용법·DCA 개념·투자 방식 비교. 신규 글은 어떤 질문에 어느 도구를 먼저 쓰는지와 납입·과세 모델을 맞춰 결과를 비교하는 방법 |
| POST 3 | 주택담보대출 월 상환액, 내 소득 아파트 매수 예산 | `mortgage-risk-checklist-dsr-variable`, `apt-dashboard-home-goal-roadmap`, `first-home-buyer-budget-calculation`, `salary-40m-mortgage-limit` | 기존 글은 위험 점검·실거래 탐색·초기 비용·가정한 규제 비율의 한도. 신규 글은 실수령액에서 생활비를 뺀 월 예산 → 원리금균등 역산 → 초기 비용·비상금 차감 후 집값 후보 산출 |

기존 포스트 내용·제목·slug·canonical URL은 변경하지 않았다. 새 제목과 description은 별도로 작성했으며 같은 언어의 중복 경로가 없는지 검사했다.

## 5. 내부링크와 계산기 연결

POST 1의 본문 연결 글은 `personal-finance-3pillars`, `emergency-fund-by-risk`, `personal-start-5steps`, `how-much-per-month-for-100m`, `dca-step-up-ruleset`이다. front matter의 `tool: ["goal"]`로 기존 하단 CTA를 사용한다. 실제 렌더러가 추가로 제안하는 복리 도구도 유지했다. 목표 계산을 송금 실행이나 카드 내역 수집 기능으로 소개하지 않았다.

POST 2는 본문에서 `/tools/compound-interest`, `/tools/dca-calculator`와 `simple-vs-compound`, `annual-vs-monthly-compound`, `how-much-per-month-for-100m`, `dca-step-up-ruleset`을 연결했다. `tool: ["comp", "dca"]`로 하단 두 도구를 연결하고 기존 자동 관련 도구 제안도 유지했다. 영문 링크는 `/en` 경로다. 본문 링크는 설명을 위한 문맥 링크이며 별도의 중복 CTA 블록을 추가하지 않았다.

POST 3는 `/market/real-estate`와 `emergency-fund-by-risk`, `mortgage-risk-checklist-dsr-variable`, `apt-dashboard-home-goal-roadmap`, `rent-jeonse-buy-cashflow-opportunity-cost`를 연결했다. `tool: ["mortgageLoan", "homeBuying", "dsrLtv"]`로 실제 주담대 원리금·아파트 구매 예산·DSR/LTV 도구를 연결했다. 대시보드의 거래 탐색 기능과 대출 승인·담보평가 기능을 구분했다.

모든 본문 링크의 파일·라우트 존재를 확인했다. 전체 기존 검사에서 나타난 `dca-guide` 관련 8건은 글 자체가 존재하지만 `docs/blog-contents.md`에 빠진 것이 원인이었다. 실제 메타데이터로 목록 한 항목을 보완한 뒤 전체 검사 결과 **Broken 0 / Suspicious 0 / Self URL missing 0**을 확인했다.

## 6. 한·영 언어 처리

- POST 1·2: KO→EN과 EN→KO 모두 실제 Header 버튼 클릭으로 전환 성공.
- POST 3: EN 클릭 후 URL 유지, 기존 안내 **“이 글은 영어 버전이 아직 없습니다.”** 출력.
- POST 3의 영어 URL 직접 요청: HTTP 404, 한국어 콘텐츠의 영어 URL 대체 노출 없음.
- POST 3의 canonical은 한국어 URL이며 영문 hreflang을 출력하지 않음.
- 기존 서로 다른 slug의 매핑(`is-dca-better-in-bear-market` ↔ `is-dca-better-in-a-bear-market`)도 양방향 전환과 명시적 hreflang 유지 확인.

기존 strict 번역 판정·Header 차단 코드는 그대로 사용했다. 글 페이지에서 `SeoHead`에 전달하는 대체 언어 조건에 **실제 번역 존재 또는 기존 명시적 언어 매핑**을 추가했다. 번역본이 없는 글의 잘못된 영문 hreflang을 막으면서 기존 다른 slug 매핑은 유지한다.

## 7. 신규 파일과 기존 파일 변경

신규 파일:

- 위의 Markdown 5개.
- 위의 PNG 12개.
- `scripts/verify_finance_posts_20261029.js`: 콘텐츠·독립 수치 계산·로컬 브라우저 검증.
- `reports/finance-posts-2026-10-29-review.md`: 이 보고서.
- `reports/finance-posts-2026-10-29-images.json`: 생성 프롬프트·원본·최종 경로.
- `reports/finance-posts-2026-10-29-validation.json`: 검증 데이터와 브라우저 결과.
- `reports/finance-posts-2026-10-29-links.json`: 전체 포스트 링크 검사 결과.
- `reports/four-account-salary-automation-{390,1440}.png`.
- `reports/compound-vs-dca-calculator-guide-{390,1440}.png`.
- `reports/home-price-by-monthly-mortgage-payment-{390,1440}.png`.

기존 파일 변경:

- `docs/blog-contents.md`: 신규 5개 언어별 URL 등록, 기존 `dca-guide` 목록 누락 보완.
- `pages/posts/[category]/[slug].js`: 없는 번역의 hreflang 방지 조건, `mortgageLoan`·`homeBuying`의 한·영 사용자용 배지 이름 추가.
- `public/sitemap-0.xml`, `public/sitemap-ko.xml`, `public/sitemap-en.xml`, `public/en/sitemap.xml`: 기존 postbuild가 생성한 신규 URL 반영.
- `reports/sitemap-clean-audit.md`: 기존 검사 스크립트의 최신 검사 결과.

설정 파일, 의존성, 기존 포스트 원문, 크롤러와 DB 스키마는 변경하지 않았다.

## 8. 실행 명령과 검증 결과

| 명령 | 최종 결과 |
| --- | --- |
| `npm.cmd run build` | PASS, 최종 소스에서 229개 정적 페이지 생성 및 기존 postbuild 완료 |
| `node scripts/verify_finance_posts_20261029.js` | PASS, 5개 글·12개 이미지·18개 성장 계산·8개 금리/만기 계산·3개 역산·6개 급여 배분 검사 |
| `node scripts/verify_finance_posts_20261029.js --base-url=http://127.0.0.1:8003` | PASS, 신규 5개 경로와 없는 EN 1개·기존 매핑 2개, 언어 전환·메타데이터·구조화 데이터·이미지·모바일 검사 |
| `node scripts/validate-jsonld.js` | PASS, 저장소의 모든 JSON-LD 파싱 및 FAQ 기본 구조 검사 |
| `node scripts/check_posts_links_local.js --registry=docs/blog-contents.md --dir=content/posts --ext=md,mdx --out=reports/finance-posts-2026-10-29-links.json` | PASS, 156개 파일 중 등록된 139개 검사, broken/suspicious/self missing 모두 0 |
| `node scripts/verify_sitemap_clean.js` | PASS, 금지 URL·필수 URL 누락·x-default 위반 모두 0 |
| `git diff --check` | PASS |

추가 확인:

- front matter 필수값, 날짜·언어·카테고리·slug·link 검증.
- 각 글 H1은 페이지에서 1회, Hero는 첫 H2 이전 1회, FAQ 8개와 FAQPage 내용 일치.
- 페이지별 BlogPosting·BreadcrumbList·FAQPage 각 1개, Markdown에 Article 중복 삽입 없음.
- 390px·1440px에서 문서 가로 넘침 없음. 생성 이미지와 화면 캡처를 직접 확인함.
- 커버·본문 이미지 정상 로드, 로컬 PNG와 최적화된 WebP 응답 확인.
- 본문 내부링크와 자동 CTA를 합친 27개 로컬 목적지 모두 HTTP 200 확인.
- sitemap 원본의 기존 212개 URL 유지, 신규 5개만 추가하여 217개. KO 112→115, EN 100→102. 제거 URL 0.
- 금융 규제의 일률적인 현행 비율을 인용하지 않고, 날짜가 있는 공식 자료와 개별 조건 확인 절차를 제시.
- 계산은 명시한 월말/기간 초 납입, 명목 연율, 과세 모델을 구분해 실제 계산 코어와 독립 합산 결과를 대조.

중간 실패와 해결:

- `npm run build`: PowerShell이 `npm.ps1` 실행을 차단했다. 정책을 바꾸지 않고 `npm.cmd run build`로 실행했다.
- 첫 정적 검사는 CRLF 줄끝을 고려하지 못한 레지스트리 검사에서 실패했다. 검사 스크립트의 줄 처리를 수정한 뒤 통과했다.
- 기본 샌드박스에서 이미지 목적지 폴더 쓰기가 거부됐다. 승인된 범위의 실행으로 새 PNG 12개만 저장했다.
- 최초 브라우저 검사는 이미지 응답 대기로 시간 초과됐다. 원본 PNG·독립 WebP 변환은 정상이고 샌드박스 안의 Next 서버 WebP 응답만 멈추는 것을 확인했다. 로컬 주소로 한정한 서버를 승인된 실행 환경에서 구동한 뒤 WebP HTTP 200과 전체 브라우저 통과를 확인했다.
- 전체 링크 검사의 기존 목록 누락은 위의 `dca-guide` 한 항목 보완으로 해결했다.
- `npm run lint` 스크립트는 package.json에 없어 실행하지 않았다. 새 의존성을 추가하지 않았다.

## 9. 남은 운영 확인

1. 로컬 DB 연결이 없어 서버 시작 시 연결 거부 로그가 발생했다. 브라우저 검증은 `/api/`를 더미 응답으로 처리했으며 실제 댓글·조회수·좋아요 DB는 검증·변경하지 않았다. 해당 기능은 기존 운영 환경에서 확인할 수 있다.
2. 광고·분석·외부 폰트를 차단한 로컬 화면으로 검수했다. 기존 광고 공간은 유지했으며 실서비스 광고 게재와 외부 폰트는 별도 운영 확인 대상이다.
3. 적용 LTV·DSR·스트레스 DSR, 상품별 세금·우대, 실제 대출 승인은 개인 조건과 시점별 확인이 필요하다. 본문의 가상 금리·월 예산·원금 후보는 실제 승인액이나 상품 견적이 아니다.
4. 배포 후 위 공개 URL의 CDN 이미지 응답과 sitemap 갱신을 확인하면 된다. 이번 작업에서 배포·색인 제출은 수행하지 않았다.
5. 빌드의 caniuse-lite 데이터 갱신 안내는 비차단 경고로 남겼다. 요청 범위를 벗어난 패키지 갱신은 하지 않았다.

공식 자료 확인:

- [금융위원회 대출 수요관리 FAQ](https://www.fsc.go.kr/po020201/85518): 2025년 대책의 범위·경과규정 자료로 명시, 현재 일률 한도로 전용하지 않음.
- [금융위원회 2026년 8월 가계대출 동향·점검회의](https://www.fsc.go.kr/no010101/87675): 2026-09-09 발표 자료 확인.
- [한국주택금융공사 예상대출조회](https://corp.hf.go.kr/ko/sub01/sub01_06_01.do): 정책상품의 별도 조회·심사 조건 안내.
- [CFPB 비상금 안내](https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/), [자동납부 안내](https://www.consumerfinance.gov/ask-cfpb/how-do-automatic-payments-from-a-bank-account-work-en-2021/).
- [SEC Investor.gov DCA 정의](https://www.investor.gov/introduction-investing/investing-basics/glossary/dollar-cost-averaging).

기계 판독 결과: [콘텐츠·수치·브라우저](finance-posts-2026-10-29-validation.json), [전체 링크](finance-posts-2026-10-29-links.json), [이미지 프롬프트·경로](finance-posts-2026-10-29-images.json).
