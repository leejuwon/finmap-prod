# FinMap 복리 계산기 Naver SERP 경쟁력 Audit + P1 개선 - 2026-09-15

## 1. Final Verdict

Final Verdict: `PASS_WITH_SAFE_SERP_COMPETITIVENESS_FIXES`

수정 결론:
- title, H1, canonical, hreflang, URL, sitemap, robots, global SEO 동작은 변경하지 않았다.
- `/tools/compound-interest`는 이미 첫 화면에 계산 입력이 노출되는 tool-first 구조라서 대형 layout 변경은 보류했다.
- 실제 기능에는 `월복리 vs 연복리 비교` 결과 패널이 있는데, 일부 한국어 본문/FAQ/입력 helper/result summary가 "연복리 직접 비교는 제공하지 않는다", "후속 검증 대상"처럼 오래된 설명을 유지하고 있었다.
- P0/P1 safe candidate로 `visible copy inconsistency`와 `description refinement`만 적용했다.

핵심 판단:
- 가장 유력한 내부 원인은 "계산기가 묻힘"이 아니라 `월복리/연복리 기능 설명 불일치 + SERP snippet의 기능 전달 부족`이다.
- `복리 계산기` head query는 tool page가 primary로 유지되고 있으며, 내부 post cannibalization은 즉시 수정할 만큼 명백하지 않다.

## 2. Baseline

요청 기준 Naver Search Advisor baseline:

| 기준일 | 기간 | impressions | clicks | CTR |
| --- | ---: | ---: | ---: | ---: |
| 2026-09-03 | 최근 30일 | 12,724 | 64 | 0.5% |
| 2026-09-14 | 최근 30일 | 7,149 | 41 | 0.6% |

주의:
- 두 지표는 rolling 30-day window라 단순 before/after 인과관계로 해석하지 않는다.
- 수동 Naver SERP: `"복리 계산기"` 약 3 page.
- 최근 long-tail query:
  - `연복리 계산기`: 약 1,134 impressions / 5 clicks
  - `월복리계산기`: 약 542 impressions / 3 clicks

이번 P1 baseline:
- 기준일: 2026-09-15
- 실험명: Compound P1
- DSR/Home-buying P1과 별도 실험으로 관리한다.

## 3. Current Page Architecture

대상 URL:
- `/tools/compound-interest`

Build HTML 기준:
- title: `복리 계산기 | 월복리·적립식 투자 미래가치 계산 | FinMap`
- description: `복리 계산기로 원금, 월 적립금, 연 수익률, 투자 기간을 입력해 월복리 기준 미래가치와 같은 조건의 연복리 비교값을 확인합니다. 세금, 수수료, 물가상승률을 반영한 세후 금액과 현재가치를 표와 차트로 보세요.`
- OG title: `복리 계산기 | 월복리·적립식 투자 미래가치 계산`
- OG description: meta description과 sync
- canonical: `https://www.finmaphub.com/tools/compound-interest`
- hreflang:
  - ko: `https://www.finmaphub.com/tools/compound-interest`
  - en: `https://www.finmaphub.com/en/tools/compound-interest`
- H1 count: 1
- H1: `복리 계산기`
- HTML bytes: 48,130
- visible body chars: 4,995

H2/H3 구조:
- `복리 계산기: 월복리·연복리와 적립식 투자 결과 확인`
- `복리 계산 입력`
- `복리 계산기 사용법`
- `복리 계산 공식`
- `월복리와 연복리 차이`
- `적립식 복리 계산 예시`
- `세금·수수료·물가상승률을 반영해야 하는 이유`
- `빠르게 비교해볼 기본 예시`
- `이 계산기 공유하기`
- `복리 계산기 FAQ`
- `추천 가이드 글`
- `이 계산기를 인용하려면`
- H3: `추천 앵커 텍스트`

첫 visible text 위치:
- H1: char 53
- intro H2: char 64
- calculator input section: char 306
- `초기 투자금`: char 319
- `계산하기`: char 354
- support content: char 707
- FAQ: char 1,700
- related guides: char 4,201

첫 500 visible chars 판단:
- H1, intro, 핵심 입력 영역, `초기 투자금`, `월 적립금`, `연 수익률`, `투자 기간`, `계산하기`가 모두 포함된다.
- 지원 본문/FAQ보다 계산 폼이 먼저 나온다.

Calculator labels:
- `초기 투자금(만원)`
- `월 적립금(만원)`
- `연 수익률(%)`
- `투자 기간(년)`
- `계산하기`
- `검증 샘플`
- `비용 · 물가 옵션`
- `세금 반영`
- `수수료 반영`
- `물가상승률(%)`
- `계산 기준`
- `월복리 기준`
- `통화`

Default state:
- principal: 1,000만원
- monthly: 30만원
- annualRate: 7%
- years: 10년
- compounding: monthly
- taxRate: 15.4%
- feeRate: 0.5%
- inflationRate: 0%
- result는 기본 SSR에는 없음. 사용자가 `계산하기`를 눌러 결과를 생성한다.

Result labels/source 기준:
- `세후 최종금액`
- `총 납입원금`
- `세후 수익`
- `물가 반영 현재가치`
- `세전 투자수익`
- `예상 세금`
- `수수료 영향`
- `총수익률`
- `CAGR 참고값`
- `초기 투자금 미래가치`
- `월 납입금 미래가치`
- `자산 성장 차트`
- `빠른 비교`
- `월복리 vs 연복리 비교`
- `적립금 증가·추가 납입 시나리오`
- `목표 달성 엔진`
- `자산 성장 민감도 분석`

Structured data:
- FAQPage: 24 questions
- HowTo: 5 steps
- BreadcrumbList
- SoftwareApplication

## 4. Search Intent Map

| Query / concept | Intended level | Current fit | Evidence |
| --- | --- | --- | --- |
| 복리 계산기 | PRIMARY | PRIMARY | title, H1, intro, form, FAQ, anchors |
| 복리계산기 | PRIMARY | PRIMARY by token proximity | title/H1 spacing form is standard, no forced stuffing |
| 월복리 계산기 | SECONDARY | SECONDARY | title/body/FAQ/form helper, one inbound anchor |
| 연복리 계산기 | SECONDARY | SECONDARY | H2/body/FAQ/result comparison copy, long-tail preserved |
| 적립식 복리 계산기 | SECONDARY | SECONDARY | title/body/FAQ/support examples, one inbound anchor |
| 복리 투자 계산 | SECONDARY | SECONDARY | investment scenario language and related panels |
| 복리 계산법 | SUPPORTING | SUPPORTING | usage/formula/FAQ |
| 복리 공식 | SUPPORTING | SUPPORTING | support H2 and FAQ |
| 미래가치 계산 | SUPPORTING | SUPPORTING | title/description/body/result labels |
| 적립식 투자 미래가치 | SUPPORTING | SUPPORTING | title/body/related guides |

판정:
- primary query를 title/H1/form이 충분히 담당한다.
- secondary long-tail도 살아 있다.
- 이번에는 keyword density 작업을 하지 않았다.

## 5. Cannibalization Audit

KO 복리 관련 문서 탐색 범위:
- `content/posts/personalFinance/ko`
- `content/posts/investingInfo/ko`
- `content/posts/economicInfo/ko`

탐지 기준:
- `compound-interest`
- `복리 계산기`
- `복리계산기`
- `월복리`
- `연복리`
- `적립식 복리`
- `복리 계산`
- `복리 공식`

결과:
- 관련 KO markdown 문서 46개 탐지.
- `/tools/compound-interest`로 향하는 KO source anchor는 58개 탐지.

주요 문서:

| URL / slug | title | main intent | exact/near usage | calculator links | 판정 |
| --- | --- | --- | ---: | ---: | --- |
| `compound-calculator-guide` | 복리 계산기 사용법: 월복리·연복리·적립식 결과 보는 법 | 계산기 사용법/결과 해석 | exact 14 | 2 | tool 보조 가이드. head query와 가깝지만 "사용법" intent로 분리됨 |
| `annual-vs-monthly-compound` | 연복리 vs 월복리: 목표 도달 기간은 얼마나 달라질까? | 개념 비교 | 월복리 31, 연복리 18 | 2 | annual/monthly long-tail 보조 |
| `simple-vs-compound` | 단리 vs 복리 | 교육형 개념/공식 | exact 6 | 2 | calculator handoff 있음 |
| `monthly-dca-10-year-result` | 월 50만원 적립식 투자 | 적립식 예시/DCA | exact 9 | 2 | DCA 예시이며 tool로 handoff |
| `compound-return-3-5-7-10-table` | 수익률별 복리 비교표 | reference/table | exact 6 | 1 | 자료형 post |

질문별 판정:
- A. `"복리 계산기"` query는 `/tools/compound-interest`가 명확한 primary인가?
  - 예. tool page가 title/H1/form/FAQ/canonical을 모두 보유한다.
- B. 특정 post가 tool page와 동일한 transactional calculator intent를 과도하게 겨냥하는가?
  - 즉시 수정할 정도로 명백하지 않다. `compound-calculator-guide`는 가장 가까운 후보지만 사용법/해석 intent이고 첫 문단에서 tool로 넘긴다.
- C. 교육형 post는 개념/예시로 남고 실제 계산 query는 tool page로 넘기는가?
  - 대체로 예. 다수 문서가 계산 action을 `/tools/compound-interest`로 넘긴다.

수정 여부:
- post rewrite 없음.
- 명백한 cannibalization이 아니라 HOLD.

## 6. Internal Anchor Audit

KO source에서 `/tools/compound-interest` inbound anchor distribution:

| Anchor text | Count |
| --- | ---: |
| 복리 계산기로 저축·투자 기간별 미래가치 계산하기 | 31 |
| 복리 계산기 | 12 |
| 복리 계산기 열기 | 6 |
| 투자 복리 계산기 | 2 |
| 복리 계산 공식과 월복리 결과 비교하기 | 1 |
| 복리 계산기로 점검하기 | 1 |
| 월복리 계산기 | 1 |
| 월복리 계산기로 저축·투자 기간별 미래가치 계산하기 | 1 |
| 적립식 복리 계산기 | 1 |
| 투자 복리 계산기로 기간별 미래가치 계산하기 | 1 |
| 투자 복리 계산기로 장기투자 미래가치 확인하기 | 1 |

ToolBacklinkKit config에서 가능한 compound anchors:
- `복리 계산기`
- `월복리 계산기`
- `복리 이자 계산기`
- `적립식 복리 계산기`

판정:
- exact anchor 과다 반복은 낮다. exact `복리 계산기` 12개, 설명형 anchor 31개.
- 교육형 anchor와 transactional anchor는 균형이 있다.
- unrelated page의 과도한 링크는 발견하지 못했다.
- 링크 총량 증대 목적의 변경은 하지 않았다.

## 7. Calculator UX Audit

확인 결과:
- 첫 화면/초기 HTML에 계산 폼이 존재한다.
- 핵심 입력값: 원금, 월 적립금, 연 수익률, 투자 기간.
- 기본값이 있어 사용자가 즉시 `계산하기`를 누를 수 있다.
- live calculation은 아니고 button submit 방식이다.
- 결과 영역은 계산 후에 나타난다.
- 결과 UX는 summary, chart, quick compare, 월복리/연복리 비교, 적립금 증가/추가 납입 시나리오, 목표 달성 엔진, 민감도 분석, table을 제공한다.
- 모바일/desktop 모두 source order는 H1 -> intro -> form -> result/support 순서다.

UX friction:
- LOW to MEDIUM. 클릭은 필요하지만 버튼이 초반에 보인다.
- competitors 일부는 입력 변경 즉시 결과를 보여주거나 기본 결과를 노출한다. FinMap은 사용자가 버튼을 눌러야 한다.

수정 여부:
- SEO 목적의 기능 추가 금지 원칙에 따라 live calculation/result preview 추가는 HOLD.

## 8. Above-the-fold Audit

Build HTML source order:
1. Header/navigation
2. H1 `복리 계산기`
3. mode toggle
4. intro card
5. calculator form
6. result area, if calculated
7. support content
8. FAQ
9. recommended guides
10. citation/share

판정:
- "복리 계산기" 검색자는 도착 직후 도구 목적을 확인할 수 있다.
- 계산기 입력 영역은 support/FAQ보다 먼저 나온다.
- 광고가 계산기 위를 막는 구조는 확인되지 않았다.
- 설명 콘텐츠가 계산기를 과도하게 밀어내는 수준은 아니다.

개선 HOLD:
- intro card를 더 줄이는 layout 작업은 가능하지만, 현재는 first 500 chars 안에 `계산하기`까지 포함되어 있어 P1 safe threshold를 넘지 않는다.

## 9. Content Duplication Audit

이미 존재하는 content:
- 사용법
- 공식
- 월복리/연복리 차이
- 적립식 예시
- FAQ
- 관련 가이드

중복/불일치:
- 같은 정의 반복은 있으나 section 역할이 달라 즉시 축소 대상은 아니다.
- 문제는 길이가 아니라, 이미 있는 결과 패널과 오래된 본문/FAQ/helper/result summary copy가 충돌한 점이었다.

적용:
- ADD가 아니라 CONSOLIDATE/SIMPLIFY 방향.
- "연복리 직접 비교 미제공/후속 검증" 문구를 "월복리 기본 + 보수적 연복리 비교값 제공"으로 정합화했다.

## 10. SERP / Competitor Audit

외부 접근:
- 인터넷 접근 가능.
- 단, 직접 Naver SERP 순위 재현은 검색 환경/차단/개인화 때문에 확정값으로 기록하지 않는다.
- 아래는 2026-09-15 외부 검색 표본의 구조 비교다.

Sample sources:
- FinMap current indexed snippet: `https://www.finmaphub.com/tools/compound-interest`
- 생활계산기: `https://calculator.it.kr/compound-interest/`
- TapTools: `https://taptools.co.kr/c/compound-interest`
- 자산 시뮬레이터: `https://www.asset-simulator.online/`
- 보험KR 연복리 계산기: `https://bohumkr.com/annual-compound/`
- 한손도구: `https://www.codingmachine.co.kr/calculators/compound-interest`
- Toolzipper: `https://toolzipper.com/finance/compound-interest-calculator/`

Competitor 구조 관찰:
- 생활계산기: H1에 `복리 계산기`, 수정일과 검증 신호가 상단에 있고, 원금/이율/기간/월 적립/복리 주기 입력과 결과 필드가 상단에 노출됨.
- 자산 시뮬레이터: H1 직후 `월복리/연복리` 버튼, 시작 금액/연 적립금/수익률/기간 입력과 예상금액이 곧바로 보임.
- 보험KR: `연복리 계산기 (적립식 복리 계산기)`로 long-tail 특화. 계산기 뒤에 긴 설명/FAQ.
- 한손도구: H1, 2026.04 갱신, 입력값/복리 주기 버튼/결과/차트가 가이드보다 먼저 위치.
- Toolzipper: `복리 계산기 (투자용)`, 최종 업데이트, 연/월/일복리, 세후, 인플레이션, 72의 법칙, 목표 역산, 엑셀 저장 등 feature breadth 강조.

FinMap과 비교:
- FinMap도 H1/intro/form이 빠르고 calculator-first 구조다.
- 경쟁 상위형 페이지는 "연복리/월복리 선택 또는 비교 가능"을 상단에서 더 명확히 말한다.
- FinMap의 이전 copy는 실제 결과 패널과 달리 연복리 비교를 제공하지 않는다고 말해, long-tail asset과 UX 신뢰도를 동시에 깎을 수 있었다.
- update/date signal은 competitors 일부가 더 강하다. 이번 범위에서는 날짜/Article schema 변경을 하지 않았다.

## 11. Root Cause Ranking

| Rank | Hypothesis | Likelihood | Evidence | Action |
| ---: | --- | --- | --- | --- |
| 1 | 연복리 비교 관련 visible copy inconsistency | HIGH | 실제 `CompoundFrequencyComparePanel` 존재, 본문/FAQ/helper/result summary는 미제공/후속 검증이라고 설명 | FIXED |
| 2 | SERP snippet에서 연복리/월복리 기능 전달 부족 | MEDIUM | title은 좋지만 old description은 월복리만 강조 | FIXED by description refinement |
| 3 | calculator result가 기본 SSR에는 없고 click 필요 | MEDIUM | competitors 일부는 result preview를 상단 노출 | HOLD, 기능/layout 변경 범위 밖 |
| 4 | `compound-calculator-guide`와 head query near-overlap | LOW-MEDIUM | exact usage 많지만 사용법/해석 intent | HOLD |
| 5 | internal anchors 부족/과다 | LOW | 58개, exact 12개, 설명형 31개 | NO CHANGE |
| 6 | title 문제 | LOW | title은 head + long-tail 구조가 적절 | NO CHANGE |

## 12. Safe Changes Applied

적용 범위:
- Korean visible copy only.
- SEO description refinement.
- FAQ visible/schema source sync via existing `faqItems`.
- Result summary helper copy sync.
- New verification script.

변경 내용:
- meta/OG description에 `월복리 기준 미래가치 + 같은 조건의 연복리 비교값`을 정확히 반영.
- support section `월복리와 연복리 차이`에서 old "연복리는 개념 비교용/후속 기능" 문구 제거.
- FAQ 2개에서 `연복리 직접 비교 미제공` 문구 제거.
- related guide description에서 계산기와 guide 역할을 분리.
- form advanced helper에서 "후속 기능" 문구 제거.
- result summary bullets에서 "후속 검증 대상" 문구 제거.

적용하지 않은 것:
- title rewrite
- H1 변경
- large FAQ expansion
- large content addition
- layout overhaul
- formula/function change
- internal link quantity increase
- sitemap/robots/canonical/hreflang/global SEO change

## 13. Files Changed

Changed:
- `_components/CompoundForm.js`
- `_components/CompoundDetailSummary.js`
- `pages/tools/compound-interest.js`
- `scripts/verify_naver_compound_serp_competitiveness_p1.js`
- `reports/naver-compound-serp-competitiveness-p1-2026-09-15.md`

Not changed:
- `/tools/dsr-ltv-calculator`
- `/tools/home-buying-budget-calculator`
- `/tools/mortgage-loan-calculator`
- DCA/CAGR/FIRE/Goal calculators
- compound formula libs
- global SEO/canonical/hreflang/sitemap/robots/redirects

## 14. Protected Files Integrity

신규 검증 script의 protected diff check:
- `changedProtected=-`
- PASS

보호 범위:
- DSR/LTV page/component
- Home-buying page
- Mortgage page/component
- DCA/CAGR/FIRE/Goal calculator pages
- `lib/compound.js`
- `lib/compoundCore.js`
- `lib/compoundFrequencyCompare.js`
- `next.config.js`
- `_app.js`
- `_document.js`

English guard:
- EN title unchanged surface: PASS
- EN description unchanged surface: PASS
- EN body annual-copy surface preserved: PASS

Build side effect check:
- postbuild generated sitemap files were checked.
- `public/sitemap*.xml` and `public/en/sitemap.xml` did not remain modified.

## 15. Verification

Commands run:

| Command | Result |
| --- | --- |
| `node --check scripts\verify_naver_compound_serp_competitiveness_p1.js` | PASS |
| `npm.cmd run build` | PASS |
| `node scripts\verify_naver_compound_serp_competitiveness_p1.js` | PASS |
| `node scripts\verify_naver_calculator_recovery_p0.js` | PASS |
| `node scripts\verify_naver_calculator_seo.js` | PASS |
| `git diff --check` | PASS, CRLF warnings only |

Notable verification output:
- KO title unchanged and includes `복리 계산기`.
- H1 count = 1, H1 = `복리 계산기`.
- self canonical PASS.
- hreflang ko/en PASS.
- no noindex PASS.
- first 500 visible chars include calculator input and `계산하기`.
- 월복리/연복리 long-tail preserved PASS.
- FAQPage JSON-LD visible sync PASS.
- old inconsistent Korean copy removed PASS.
- protected calculator/global/formula diff none PASS.

Known warnings:
- Browserslist data is 7 months old.
- `git diff --check` emitted CRLF normalization warnings only.

## 16. Risks

- Naver ranking recovery cannot be confirmed immediately; crawling/index refresh and ranking feedback may lag.
- Direct Naver SERP page-by-page reproducibility is limited by personalization and access constraints.
- `compound-calculator-guide` remains a near-overlap page for "복리 계산기 사용법"; current judgment is HOLD, but monitor if it outranks or cannibalizes the tool for transactional head queries.
- Result state still requires clicking `계산하기`; competitors with instant result preview may have UX advantage. This was intentionally not changed because it would be a broader product behavior change.
- English copy still contains the old "reserved for later" phrase by guardrail. It is intentionally preserved in this task.

## 17. New Monitoring Baseline

Compound P1 baseline date:
- 2026-09-15

Monitor queries:
- `복리 계산기`
- `복리계산기`
- `연복리 계산기`
- `월복리계산기`
- `적립식 복리 계산기`

Monitor pages separately:
- `/tools/compound-interest`
- `/posts/personalFinance/compound-calculator-guide`
- `/posts/personalFinance/annual-vs-monthly-compound`
- `/posts/personalFinance/simple-vs-compound`
- `/posts/personalFinance/monthly-dca-10-year-result`

Recommended cadence:
- 7-day spot check after deployment for crawl/snippet pickup.
- 14-day check for query-level impression/rank movement.
- 30-day rolling comparison only after enough post-change days are included.

Experiment separation:
- DSR/Home-buying P1 baseline and Compound P1 baseline must be tracked separately.
