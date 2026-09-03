# FinMap Naver Calculator Recovery P0 - 2026-09-03

## 1. Final Verdict

**PASS_WITH_SAFE_P0_FIXES**

- 대상 3개 페이지만 최소 수정했다.
- `/tools/dsr-ltv-calculator`, `/tools/mortgage-loan-calculator`는 control/reference로만 감사했고 소스 수정하지 않았다.
- canonical, hreflang, sitemap, robots, redirect, EN tool page copy, GA4, AdSense, 계산 공식, 계산 결과 로직, 입력 validation은 수정하지 않았다.
- `npm.cmd run build`, `git diff --check`, 신규 P0 verification script, 기존 `verify_naver_calculator_seo.js` 모두 통과했다.

## 2. Baseline

2026-09-03 네이버 서치어드바이저/수동 검색 기준:

- 전체 최근 30일: 클릭 약 420, 노출 약 88,000, CTR 0.5%, 이전 기간 대비 클릭 +27.2%, 노출 +33.2%
- 전체 최근 7일: 클릭 78, 노출 약 16,000, CTR 0.5%, 이전 7일 대비 클릭 -26.4%, 노출 -30%
- 복리 계산기 `/tools/compound-interest`: 90일 26,069 impressions / 106 clicks, 30일 12,724 / 64, 7일 2,163 / 7
- CAGR 계산기 `/tools/cagr-calculator`: 90일 20,170 / 80, 60일 9,194 / 39, 30일 4,159 / 13, 7일 296 / 1
- DCA 계산기 `/tools/dca-calculator`: 수동 검색상 DCA 시뮬레이터/계산기 약 Naver 3 page

감사 대상:

- 대상: `pages/tools/compound-interest.js`, `pages/tools/cagr-calculator.js`, `pages/tools/dca-calculator.js`
- Control: `pages/tools/dsr-ltv-calculator.js`, `pages/tools/mortgage-loan-calculator.js`

## 3. Root Cause Hypothesis

- 복리: 페이지 전체 실패가 아니라 월복리/연복리 long-tail은 살아 있고, `복리 계산기` head query 신호가 약해진 상태로 판단했다.
- CAGR: `연평균 수익률 계산` intent는 살아 있으나, 기존 title이 나열형이라 `CAGR` head query에서 클릭/경쟁력이 약해졌을 가능성이 있다.
- DCA: 기존 title/H1이 `ETF·주식 자동 적립식 시뮬레이터 (DCA)`라 실제 검색어인 `DCA 계산기`, `DCA 시뮬레이터`, `적립식 투자 계산기`와 첫 인상이 덜 맞았다.

## 4. Control Page Comparison

Control 페이지 공통 특징:

- title/H1이 검색 사용자가 입력할 법한 핵심 표현을 앞부분에 둔다.
- 첫 lead에서 입력값과 결과값을 직접 설명한다.
- visible FAQ와 FAQPage JSON-LD가 동기화되어 있다.
- WebApplication, BreadcrumbList, FAQPage schema를 보유한다.
- 관련 도구/콘텐츠 연결은 특정 문맥에서만 제공한다.

Control audit:

- `/tools/dsr-ltv-calculator`
  - title: `LTV DSR 계산기 - 주택담보대출 한도와 아파트 구매 가능액 계산 | FinMap`
  - H1: `LTV DSR 계산기: 주담대 한도와 아파트 구매 가능액 계산`
  - structured data: `FAQPage`, `WebApplication`, `BreadcrumbList`
  - visible FAQ/JSON-LD FAQ: 10/10
- `/tools/mortgage-loan-calculator`
  - title: `주담대 원리금 계산기 - 아파트 담보대출 월상환액 계산 | FinMap`
  - H1: `주담대 원리금 계산기: 아파트 담보대출 월상환액 계산`
  - structured data: `WebApplication`, `BreadcrumbList`, `FAQPage`
  - visible FAQ/JSON-LD FAQ: JSON-LD 4개가 화면 FAQ에 포함되어 있어 sync 통과

## 5. Compound Changes

Source: `pages/tools/compound-interest.js`

수정 전 핵심 상태:

- title: `복리 계산기 | 월복리·적립식 투자 미래가치 계산 | FinMap`
- H1: `복리 계산기`
- canonical: `https://www.finmaphub.com/tools/compound-interest`
- structured data: `FAQPage`, `HowTo`, `BreadcrumbList`, `SoftwareApplication`
- 지원 콘텐츠: 복리 계산기 사용법, 복리 계산 공식, 월복리와 연복리 차이, 적립식 복리 계산 예시, FAQ, 관련 가이드 존재

변경:

- title은 유지했다.
- meta description 첫 문장을 `복리 계산기로...`로 조정해 head query와 계산 목적을 더 직접적으로 연결했다.
- 상단 H2를 `복리 계산기: 월복리·연복리와 적립식 투자 결과 확인`으로 조정했다.
- 상단 설명에 원금, 월 적립금, 예상 수익률, 투자기간, 월복리 계산, 연복리 비교 패널, 표/차트 결과를 자연스럽게 포함했다.
- 지원 콘텐츠 첫 문장에 `복리 계산 방법`을 보강했다.

의도:

- 기존 월복리/연복리 long-tail과 FAQ 자산은 보존하면서 `복리 계산기` head query 신호를 첫 본문과 snippet에 보강한다.

## 6. CAGR Changes

Source: `pages/tools/cagr-calculator.js`

수정 전 핵심 상태:

- title: `CAGR 계산기 (연평균 수익률·연복리 수익률·연평균 성장률) | FinMap`
- H1: `CAGR(연평균 수익률)로 내 투자 성과를 한 줄 숫자로`
- canonical: `https://www.finmaphub.com/tools/cagr-calculator`
- structured data: `FAQPage`, `BreadcrumbList`, `SoftwareApplication`
- 지원 콘텐츠: CAGR 활용법, 공식/해석, FAQ, 관련 가이드, 관련 계산기 허브 존재

변경:

- title을 `CAGR 계산기 - 연평균 수익률 바로 계산하기 | FinMap` 방향으로 단순화했다.
- meta description을 초기 자산, 최종 자산, 기간, CAGR, 연평균 수익률, 장기 성과 비교 중심으로 재작성했다.
- H1을 `CAGR 계산기`로 정렬했다.
- hero lead에서 CAGR의 의미와 입력값을 짧게 설명했다.
- intro title을 `CAGR 계산 방법과 입력값`으로 조정했다.
- 공식 섹션을 `CAGR 공식과 연평균 수익률 계산 예시`로 바꾸고, `1,000만 원 -> 1,500만 원 / 5년` 예시를 추가했다.
- FAQ에 `CAGR 계산법은 어떻게 되나요?`를 추가했다.

검산:

- `1,000만 원 -> 1,500만 원 / 5년` CAGR은 `8.447177%`, 화면 문구는 `약 8.45%`로 표기했다.

의도:

- `CAGR 계산기` head query를 title/H1 앞쪽에 두고, 네이버 CTR이 좋은 `연평균 수익률 계산` intent는 description, intro, formula, FAQ에 보존했다.

## 7. DCA Changes

Source: `pages/tools/dca-calculator.js`

수정 전 핵심 상태:

- title: `ETF·주식 자동 적립식 시뮬레이터 (DCA) | FinMap`
- H1: `ETF·주식 자동 적립식 시뮬레이터 (DCA)`
- canonical: `https://www.finmaphub.com/tools/dca-calculator`
- structured data: `FAQPage`, `WebPage`
- 지원 콘텐츠: 모델 가정, 결과 해석, 하락장 시나리오, FAQ, 관련 가이드 존재

변경:

- title을 `DCA 계산기 - ETF·주식 적립식 투자 시뮬레이터 | FinMap`으로 변경했다.
- meta description을 매월 투자금, 예상 수익률, ETF·주식 적립식 투자, 장기 자산 성장, 수수료, 적립금 증가 조건 중심으로 재작성했다.
- H1을 `DCA 계산기`로 변경했다.
- 상단 설명에 `DCA 계산기`, `ETF`, `주식`, `적립식 투자`, `정액 분할 투자`를 자연스럽게 포함했다.
- FAQ 첫 항목에 `DCA 계산기는 무엇을 계산하나요?`를 추가했다.
- KO 화면에만 `DCA란? 적립식 투자 계산기로 확인하는 것` 섹션을 추가했다.

의도:

- 기존 product-oriented 명칭을 실제 검색 intent인 `DCA 계산기`, `DCA 시뮬레이터`, `적립식 투자 계산기`로 재정렬한다.
- EN page copy는 변경하지 않았다.

## 8. Internal Link Changes

- 포스트 본문 대량 수정은 하지 않았다.
- KO 관련 포스트 검색 결과, 세 계산기 모두 이미 의미적으로 직접 연결된 inbound link가 충분했다.
  - 복리: `compound-calculator-guide`, `annual-vs-monthly-compound`, `simple-vs-compound`, `monthly-dca-10-year-result` 등에서 `/tools/compound-interest` 연결 확인
  - CAGR: `what-is-cagr`, `cagr-7percent-reality-check`, `diagnose-investing-skill-with-cagr`, `why-check-cagr-etf` 등에서 `/tools/cagr-calculator` 연결 확인
  - DCA: `monthly-dca-10-year-result`, `dca-fx-volatility-decomposition`, `dca-step-up-ruleset`, `dca-consistency-7-fail-patterns`, `is-dca-better-in-bear-market` 등에서 `/tools/dca-calculator` 연결 확인
- 계산기 페이지의 기존 related guides/tool CTAs는 유지했다.
- sitewide/footer link 추가는 하지 않았다.

## 9. Files Changed

- `pages/tools/compound-interest.js`
- `pages/tools/cagr-calculator.js`
- `pages/tools/dca-calculator.js`
- `scripts/verify_naver_calculator_recovery_p0.js`
- `reports/naver-calculator-recovery-p0-2026-09-03.md`

참고:

- 작업 시작 전부터 `reports/search-growth-p1-2d-1-search-api-automation-foundation.json`, `reports/search-growth-p1-2d-1-search-api-automation-foundation.md`에 미커밋 변경이 있었다. 이번 작업에서는 수정하지 않았다.

## 10. Files Intentionally Not Changed

- `pages/tools/dsr-ltv-calculator.js`
- `pages/tools/mortgage-loan-calculator.js`
- `pages/tools/goal-simulator.js`
- `pages/tools/fire-calculator.js`
- `pages/tools/home-buying-budget-calculator.js`
- English tool page copy
- `SeoHead` and global SEO components
- `next-sitemap.config.js`
- `public/sitemap.xml`, `public/sitemap-0.xml`, `public/sitemap-ko.xml`, `public/sitemap-en.xml`, `public/en/sitemap.xml`
- `robots.txt`
- redirect/canonical/hreflang logic
- calculator formulas, result logic, input validation, share/PDF, GA4, AdSense

## 11. Verification Results

Commands:

- `npm.cmd run build`
  - PASS
  - Next.js 16.2.10 production build compiled successfully.
  - Static pages generated: 223/223.
  - npm lifecycle also ran `postbuild` (`next-sitemap && node scripts/generate_channel_sitemaps.js`), but tracked sitemap files had no diff afterward.
- `node --check scripts\verify_naver_calculator_recovery_p0.js`
  - PASS
- `git diff --check`
  - PASS
  - Only CRLF/LF working-copy warnings appeared; no whitespace errors.
- `node scripts\verify_naver_calculator_recovery_p0.js`
  - PASS
  - Compound: title includes `복리 계산기`, H1 1개, canonical self, FAQ sync PASS, body intent coverage PASS
  - CAGR: title `CAGR 계산기 - 연평균 수익률 바로 계산하기 | FinMap`, H1 `CAGR 계산기`, FAQ sync PASS, body intent coverage PASS
  - DCA: title starts with `DCA 계산기`, H1 `DCA 계산기`, FAQ sync PASS, body intent coverage PASS
  - DSR/LTV control and Mortgage control guardrail PASS
- `node scripts\verify_naver_calculator_seo.js`
  - PASS
  - Existing DSR/LTV, Compound, FIRE SEO checks passed.
- `node -e "...calculateCagr..."`
  - PASS
  - `1,000만 원 -> 1,500만 원 / 5년` CAGR: `8.447177%`

No diff confirmed for:

- `pages/tools/dsr-ltv-calculator.js`
- `pages/tools/mortgage-loan-calculator.js`
- sitemap-related files
- `next-sitemap.config.js`

## 12. Risks

- 네이버 반영은 즉시 확인되지 않는다. 배포 후 최소 2~4주 관찰이 필요하다.
- Compound는 이미 FAQ와 본문 depth가 큰 편이라 head keyword 보강은 매우 보수적으로 제한했다.
- DCA는 schema가 기존 `FAQPage + WebPage` 상태다. WebApplication schema 추가는 가능하지만, 이번 P0에서는 구조화데이터 churn을 피하기 위해 변경하지 않았다.
- `npm.cmd run build` 중 Browserslist 데이터 7개월 old 경고가 출력되었으나 이번 SEO P0 변경과 직접 관련 없는 비차단 경고다.

## 13. Post-deploy Monitoring Plan

기간:

- 배포 후 최소 2~4주

핵심 추적 검색어:

- 복리: `복리 계산기`, `연복리 계산기`, `월복리계산기`
- CAGR: `cagr`, `cagr 계산`, `cagr 계산법`, `연평균 수익률 계산`
- DCA: `DCA 계산기`, `DCA 시뮬레이터`, `적립식 투자 계산기`

핵심 페이지:

- `/tools/compound-interest`
- `/tools/cagr-calculator`
- `/tools/dca-calculator`

Guardrail:

- `/tools/dsr-ltv-calculator`
- `/tools/mortgage-loan-calculator`

관찰 방식:

- 최근 7일/30일 클릭, 노출, CTR을 같은 기준으로 비교한다.
- 복리는 `연복리 계산기`, `월복리계산기` long-tail 유지 여부를 우선 확인한다.
- CAGR은 `연평균 수익률 계산` CTR 훼손 여부와 `cagr`, `cagr 계산` 노출 회복 여부를 함께 본다.
- DCA는 title/H1 재정렬 후 `DCA 계산기`, `DCA 시뮬레이터`, `적립식 투자 계산기` 쿼리의 노출 변화를 확인한다.
- Control 페이지의 검색 가시성이 이번 작업 이후 흔들리는지 함께 본다.
