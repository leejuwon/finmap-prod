# FinMap Goal/FIRE Naver Search Market Expansion P1

Date: 2026-09-16

## 1. Final Verdict

`PASS_WITH_SAFE_GOAL_FIRE_SEARCH_FIXES`

Goal/FIRE 두 계산기 모두 실제 기능 범위 안에서만 P1 수준의 문구/배치 개선을 적용했다. 수식, URL, canonical/hreflang 구조, sitemap/robots, 보호 계산기군은 변경하지 않았다. 단, Naver Search Advisor 원자료와 자동화된 Naver SERP 원문 수집은 없으므로 모니터링은 별도 기준선으로 이어가야 한다.

## 2. Baseline

- 사용자 수동 확인: 목표자산/은퇴자금 핵심 query가 Naver 10페이지 내 확인 어려움.
- 현재 작업 성격: 기존 1페이지 순위 회복이 아니라 검색 시장 확장 관점의 P1 감사.
- 변경 전 Goal 핵심 문구: `목표자산 도달 계산기 | 매달 얼마 투자해야 할까?`
- 변경 전 FIRE 핵심 문구: `은퇴자금 계산기 | 노후자금 계산기·은퇴 생활비·FIRE 계산기`
- 데이터 상태: `NAVER_GOAL_FIRE_BASELINE_PARTIAL`

## 3. Goal Feature Map

- URL: `/tools/goal-simulator`
- 입력: 현재 자산, 월 투자/적립금, 예상 수익률, 기간, 목표 금액, 월/연 수익률 환산, 세율, 연 수수료율, 통화.
- 고급 입력: 물가상승률, 적립금 증가율, 시나리오 스프레드, 역산 목표 변수.
- 결과: 최종 세전/세후 자산, 누적 투자금, 세후 수익, 목표 달성 여부, 목표 달성 예상 기간, 필요 월 투자액, 부족/초과 금액, 민감도.
- 기본값: 현재 자산 2,000만원, 월 50만원, 연 7%, 15년, 목표 1억원, 세율 15.4%, 연 수수료 0.5%.
- JSON-LD: `SoftwareApplication`, `FAQPage`.
- 첫 화면 판단: H1/설명/계산 목표 선택 후 바로 입력폼. 선택 카드가 계산 목표 변수 선택 역할을 하므로 calculator UX 일부로 볼 수 있다.

## 4. FIRE Feature Map

- URL: `/tools/fire-calculator`
- 입력: 현재 자산, 연 지출, 월 저축액, 연 추가 저축액, 수익률, 적립 기간, 출금률, 세율, 수수료, 물가.
- 상세 입력 컴포넌트: 현재 나이, 은퇴 나이, 기대수명, 월 생활비 등으로 은퇴 시점 예상 자산과 필요 은퇴자금 비교.
- 결과: FIRE 목표자산, 적립 종료 시 FIRE 가능 여부, 자산 지속 기간, 고갈 시점, 위험도, 은퇴 전후 자산 곡선, 연도별 표.
- 핵심 공식: `연 지출 / 출금률`.
- 미반영 항목: 국민연금/퇴직연금/IRP 등 연금 현금흐름, 세법 변경, 건강보험료, 의료/부양비, 은퇴 후 지출 증가율.
- JSON-LD: `WebApplication`, `FAQPage`, `BreadcrumbList`.

## 5. Search Intent Separation

- Goal primary: 목표 금액까지 필요한 월 투자액/기간/수익률 역산.
- Goal secondary: 목표자산 도달 기간, 목표 금액 달성 경로, 세금/수수료 반영 후 자산 경로.
- FIRE primary: 은퇴 생활비와 출금률 기준 필요 은퇴자금.
- FIRE secondary: 노후자금, FIRE 목표자산, 자산 지속기간, 4% 룰.
- 분리 결론: Goal은 "목표 금액을 만들기 위한 적립/투자 문제", FIRE는 "은퇴 생활비를 감당하기 위한 필요 자산 문제"로 분리 가능하다.

## 6. Metadata Audit

- Goal title 변경: `목표자산·목표 금액 계산기 | 매달 얼마 투자해야 할까?`
- Goal description 변경: `목표 금액까지 필요한 월 투자액, 기간, 수익률을 현재 자산·세금·수수료 가정과 함께 계산합니다.`
- FIRE title 유지: 이미 은퇴자금/노후자금/은퇴 생활비/FIRE intent가 충분히 있다.
- FIRE description 변경: 국민연금/개인연금 반영 전후 비교 약속을 제거하고 실제 입력값 중심으로 정리.
- URL/canonical 전달값은 변경하지 않았다.

## 7. Above-the-fold

- Goal: 설명 카드와 계산 목표 선택 카드 후 입력폼. SEO 설명성 블록이 과도하게 앞서지는 않는다.
- FIRE 변경 전: `FireHero`, `FireIntro`, 가정 안내, 상세 시뮬레이터, 생활비별 표 이후 `FireForm`.
- FIRE 변경 후: 공유 패널 바로 다음에 `FireForm`과 결과 영역을 배치하고, 설명/표는 그 뒤로 이동.
- 결론: FIRE의 tool-first 약점이 가장 큰 P1 원인이었고 이번 변경에서 해소했다.

## 8. Result UX

- Goal 결과는 목표 달성 여부, 예상 도달 기간, 필요 월 투자액, 부족/초과 금액을 직접 보여준다.
- FIRE 결과는 목표자산, 적립 종료 시점 FIRE 가능 여부, 고갈 시점, 자산 곡선, 연도별 표를 제공한다.
- 수식/결과 계산 로직은 변경하지 않았다.
- FIRE는 결과 영역도 입력폼 직후에 오도록 이동해 사용자가 계산 후 바로 해석할 수 있게 했다.

## 9. Related Content

- Goal 관련 KO 내부 콘텐츠는 목표자산, 목표 금액, 월 투자금, 1억 만들기, 복리, DCA 문맥에서 다수 존재한다.
- FIRE 관련 KO 내부 콘텐츠는 FIRE 3개 숫자, sequence risk, assumption errors, spending buckets 중심으로 구성되어 있다.
- 관련 글 설명 중 FIRE에서 연금 현금흐름을 계산기 기능처럼 읽힐 수 있는 표현은 페이지 내 추천 설명에서 완화했다.

## 10. Cannibalization Audit

- Goal vs DCA/Compound/CAGR: 일부 목표 금액/월 적립 계산 기능이 겹치지만, Goal은 목표 역산의 허브, DCA는 적립식 경로, Compound는 복리 미래가치, CAGR은 연평균 수익률로 역할이 다르다.
- FIRE vs Goal: 목표자산이라는 단어는 겹치지만 FIRE는 은퇴 생활비와 출금률 기반이므로 intent가 다르다.
- 이번 작업에서는 보호 대상 계산기의 title/H1/링크 구조를 건드리지 않았다.

## 11. Internal Anchor Distribution

- KO 영역 `/tools/goal-simulator` 문자열 참조는 약 42건 확인. 주요 anchor: `목표자산 계산기`, `목표 자산 시뮬레이터`, `목표자산 도달 시뮬레이터`, `월 얼마가 필요한지`.
- KO 영역 `/tools/fire-calculator` 문자열 참조는 약 26건 확인. 주요 anchor: `은퇴자금 계산기`, `노후자금 계산기`, `FIRE 계산기`, `FIRE 계산기 열기`.
- Goal은 내부 앵커 기반이 이미 넓다. FIRE는 적지만 더 의도 집중적이다.
- 대규모 sitewide anchor campaign은 이번 P1 범위에서 보류했다.

## 12. Search Market Language

- Goal 시장 언어: `목표자산`, `목표 금액`, `목표금액`, `월 투자액`, `매달 얼마`.
- Goal 반영: title/description/intro에 `목표 금액`과 `월 투자액`을 추가.
- FIRE 시장 언어: `은퇴자금`, `노후자금`, `은퇴 생활비`, `FIRE`, `4% 룰`.
- FIRE 반영: title은 유지하고 description을 실제 계산 입력 중심으로 정리.
- keyword stuffing은 피하고 primary 1개 + secondary 2~3개 구조로 유지했다.

## 13. Competitor Audit

직접 Naver SERP HTML은 안정적으로 수집하지 못했다. 대신 외부 웹 검색 샘플과 사용자 수동 Naver 확인을 함께 사용했다.

- Goal/목표금액 계열: [바로계산 목돈 마련 계산기](https://barogyesan.kr/saving-goal), [도구섬 목표금액 월저축 계산기](https://doguseom.com/tools/monthly-savings-goal-calculator), [생활계산소 복리·목표 저축 계산기](https://calc.io.kr/compound-savings)는 공통적으로 입력폼을 빠르게 노출하고 `목표 금액`, `월 저축액`, `기간`을 전면에 둔다.
- FIRE/은퇴자금 계열: [생활계산기 은퇴자금 계산기](https://calculator.it.kr/retirement-fund/), [파이어디자인 은퇴자금 계산기](https://firedesign.kr/calculators/retirement-fund), [파이어디자인 FIRE 계산기](https://firedesign.kr/calculators/fire), [MoneyKit 은퇴 필요자금 계산기](https://moneykit.co.kr/retirement/required-fund), [ReturnLab 노후 생활비·은퇴자금 계산기](https://returnlab.net/ko/cashflow?annualYield=4&drawdownMode=allowance&duration=30&durationUnit=years&mode=drawdown&principal=1000000000&unit=krw)는 월 생활비/연금/물가/출금률 등 실제 입력을 초반에 드러낸다.
- 결론: FinMap FIRE의 기존 약점은 설명/표가 입력폼보다 앞선 구조였고, Goal의 약점은 `목표 금액` 시장 언어가 title/lead에서 약한 점이었다.

## 14. Root Cause Ranking

1. FIRE calculator placement: 입력폼이 너무 아래에 있어 transactional intent에 늦게 응답했다. Fixed.
2. FIRE over-promise copy: 연금 반영 전후 비교처럼 읽히는 description이 실제 입력 기능과 맞지 않았다. Fixed.
3. Goal market language gap: `목표자산` 중심이라 `목표 금액` query와의 언어 간극이 있었다. Fixed.
4. Search Advisor data gap: URL/query별 Naver impression/click 데이터가 없어 효과 판정은 배포 후 관찰 필요. Open.

## 15. Safe Changes Applied

- `pages/tools/fire-calculator.js`
  - description을 실제 입력값 중심으로 정리.
  - `FireForm`과 결과 영역을 상단 공유 패널 바로 아래로 이동.
  - 추천 글 설명의 연금 현금흐름 표현을 과장되지 않게 수정.
- `pages/tools/goal-simulator.js`
  - title에 `목표 금액`을 추가.
  - description/intro를 필요 월 투자액, 기간, 수익률 역산 기능에 맞춤.
  - 세금/수수료 FAQ를 현재 입력 UI와 일치하도록 수정.
- `scripts/verify_naver_goal_fire_search_p1.js`
  - P1 범위, H1, intent copy, calculator order, noindex, structured data, numeric parity, protected cohort를 검증.

## 16. Numeric Integrity

- 수식 파일 변경 없음: `lib/goalSimulator.js`, `lib/fire.js` 변경 없음.
- Goal snapshot: 현재 자산 0, 월 1,000,000원, 목표 12,000,000원, 1년, 수익률 0% => 최종 12,000,000원, 도달 12개월, 필요 월 투자액 1,000,000원.
- FIRE snapshot: 연 지출 36,000,000원, 출금률 4% => 필요 은퇴자금 900,000,000원. 현재 자산 900,000,000원, 수익률 0%, 지출 36,000,000원 => FIRE 가능, 고갈 25년.
- 전용 검증 스크립트 통과.

## 17. Files Changed

- `pages/tools/fire-calculator.js`
- `pages/tools/goal-simulator.js`
- `scripts/verify_naver_goal_fire_search_p1.js`
- `reports/naver-goal-fire-search-market-p1-2026-09-16.md`

작업 전부터 있던 Magok 관련 변경은 그대로 두었고 이번 작업에서 수정하지 않았다.

## 18. Protected Experiment Integrity

- 변경 금지 계산기: DSR/LTV, 주택구매예산, 대출, 복리, DCA, CAGR 변경 없음.
- 부동산 대시보드/Top100/Magok scope query 변경 없음.
- `SeoHead`, Header/Footer, `_app.js`, `_document.js`, sitemap/robots/redirect/global navigation 변경 없음.
- `npm run build`의 `postbuild`가 실행되었지만 git 상태상 sitemap 변경은 남지 않았다.

## 19. Verification

- `node scripts\verify_naver_goal_fire_search_p1.js` => PASS.
- `node --check pages\tools\fire-calculator.js` => PASS.
- `node --check pages\tools\goal-simulator.js` => PASS.
- `node --check scripts\verify_naver_goal_fire_search_p1.js` => PASS.
- `npm.cmd run build` => PASS. Browserslist 데이터 오래됨 경고만 있음.
- `git diff --check` => PASS. 기존 CRLF 경고만 출력.

## 20. Risks

- Naver 직접 SERP와 Search Advisor query data가 없으므로 순위/노출 개선 여부는 배포 후 관찰 필요.
- FIRE 상세 입력 컴포넌트와 간단 FIRE 입력폼이 모두 존재해 사용자가 두 계산 흐름을 혼동할 여지는 남아 있다. 이번 P1에서는 재설계하지 않았다.
- Goal은 내부 앵커가 많아 새 title 반영 후 cannibalization을 Search Advisor에서 확인해야 한다.
- 일부 FIRE 관련 포스트 본문에는 연금 현금흐름 표현이 남아 있다. 이번 범위에서는 calculator page의 visible promise만 수정했다.

## 21. Monitoring Baseline

Goal candidate queries:

- 목표자산 계산기
- 목표자산 도달 계산기
- 목표 금액 계산기
- 목표금액 계산기
- 매달 얼마 투자

FIRE candidate queries:

- 은퇴자금 계산기
- 노후자금 계산기
- 은퇴 생활비 계산기
- 필요 은퇴자금
- FIRE 계산기

배포 후 2~4주 단위로 Naver Search Advisor에서 URL/query별 노출, 클릭, 평균 순위, query 확장 여부를 확인한다. 첫 관찰 기준일은 2026-09-16 P1 baseline으로 둔다.
