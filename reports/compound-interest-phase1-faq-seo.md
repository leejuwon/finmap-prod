# 복리 계산기 Phase 1-4 FAQ/SEO 보고서

- 작업일: 2026-06-30
- 대상: `/tools/compound-interest`, `/en/tools/compound-interest`
- 범위: SEO 문구 정합성, 본문 월복리 안내, KO/EN FAQ

## 1. 변경 목적

현재 계산은 월복리 고정인데 KO title의 `연복리`와 EN description의 `compound frequency`가 선택 가능한 기능처럼 읽힐 수 있었다. 문구를 실제 계산 기준에 맞추고 검색 질문형 FAQ를 확장했다.

계산식, 입력/결과 UX, CTA, canonical, hreflang, sitemap, robots, GA4, AdSense는 변경하지 않았다.

## 2. 변경 파일

| 파일 | 변경 내용 |
| --- | --- |
| `pages/tools/compound-interest.js` | SEO 문구, 월복리 안내, 관련 가이드 설명, FAQ 확장 |
| `scripts/verify_compound_phase1_seo_faq.js` | Phase 1-4 전용 정적 검증 |
| `reports/compound-interest-phase1-faq-seo.md` | 구현 및 검증 기록 |

`CompoundForm.js`, `CompoundDetailSummary.js`의 기존 Phase 1-2/1-3 변경은 보존했으며 이번 단계에서 수정하지 않았다.

## 3. SEO title/description 전후

### KO title

변경 전:

`복리 계산기 | 월복리·연복리·적립식 투자 미래가치 계산`

변경 후:

`복리 계산기 | 월복리·적립식 투자 미래가치 계산`

### KO description

변경 전:

`복리 계산기로 원금, 월 적립금, 연 수익률, 기간, 세금, 수수료, 물가상승률을 반영해 월복리·적립식 투자 미래가치와 현재가치를 계산합니다.`

변경 후:

`원금, 월 적립금, 연 수익률, 투자 기간으로 월복리 기준 미래가치를 계산합니다. 세금, 수수료, 물가상승률을 반영한 세후 금액과 현재가치를 표와 차트로 확인하세요.`

### EN

EN title은 유지했다.

`Compound Interest Calculator: Future Value, Monthly Contributions & Taxes`

EN description 변경 전:

`Calculate future value with principal, monthly or lump-sum contributions, compound frequency, taxes, fees, inflation, charts, and year-by-year tables.`

EN description 변경 후:

`Calculate future value with principal, monthly contributions, annual return and years using monthly compounding. Review taxes, fees, inflation, charts and year-by-year tables.`

## 4. 월복리/연복리 문구 정합성

본문의 `월복리와 연복리 차이` 섹션은 유지했다. 다만 다음을 명시했다.

- 현재 FinMap 계산 결과는 검증된 월복리 기준
- 연복리는 개념 비교용 설명
- 연복리 직접 비교는 현재 기능이 아니며 후속 검증 대상

`annual-vs-monthly-compound` 관련 가이드 설명도 계산기 자체 기능과 별도 가이드를 구분하도록 수정했다.

## 5. FAQ 확장

| locale | 변경 전 | 변경 후 |
| --- | ---: | ---: |
| KO | 9 | 24 |
| EN | 5 | 8 |

KO FAQ는 다음 검색 의도를 포함한다.

- 월 10만/30만/50만/100만 원의 10년 예시
- 1억 목표와 월 적립금 역산
- 월복리와 연복리 차이
- 세전/세후, 세금 반영 시점, 수수료 영향
- 물가상승률과 현재가치
- 수익률/기간/원금/월 적립금 관계
- 배당 재투자와 ETF 장기투자
- CAGR/DCA 계산기와의 차이
- 결과가 수익 보장이 아니라는 점

숫자 예시는 원금 0원, 연 5%, 10년, 세금·수수료 미반영 조건을 함께 표시했다. 모든 답변은 고정 가정의 교육용 시뮬레이션임을 전제로 작성했다.

EN FAQ는 monthly basis, contributions, tax/fees, inflation-adjusted value, ETF use, non-guarantee를 포함하되 8개로 제한했다.

## 6. FAQPage 단일 source

- 화면과 JSON-LD 모두 같은 `faqItems` 배열 사용
- FAQPage JSON-LD: 페이지당 1개
- `mainEntity: faqItems.map(...)` 유지
- 결과 전/후 UI branch는 상호 배타적
- KO 계산 전 visible FAQ: 24개, container 1개
- KO 계산 후 visible FAQ: 24개, container 1개
- EN visible FAQ: 8개, container 1개
- JSON-LD mainEntity: KO 24개, EN 8개

## 7. 전용 verifier

`scripts/verify_compound_phase1_seo_faq.js`가 다음을 확인한다.

1. KO title의 `연복리` 제거
2. KO title의 월복리/적립식 intent 유지
3. KO description의 월복리 기준 명시
4. EN description의 `compound frequency` 제거와 monthly compounding 명시
5. KO FAQ 20~24개, EN FAQ 5~8개
6. FAQPage 1회와 shared `faqItems` mapping
7. JSON-LD와 두 상호 배타적 UI branch 구조
8. H1 source 1개
9. SeoHead route/locale 유지
10. 본문 월복리 기준 문구
11. `lib/compoundCore.js`, `lib/compound.js` 무변경

실행 결과: 전체 PASS, KO 24개, EN 8개.

## 8. 계산 결과 보존

- `lib/compoundCore.js` 변경 없음
- `lib/compound.js` 변경 없음
- 기본 계산 결과 유지
- A-D 계산 샘플 전체 PASS

## 9. 검증 결과

| 명령/확인 | 결과 |
| --- | --- |
| `node scripts\verify_compound_phase1_seo_faq.js` | PASS |
| `node scripts\verify_compound_calculator.js` | PASS, A-D 전체 통과 |
| `npm.cmd run build` | PASS, 214개 static page |
| postbuild sitemap | PASS, main 204 / KO 106 / EN 98 URL |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| KO/EN runtime title, description, FAQ/JSON-LD 검사 | PASS |
| 390px FAQ overflow 검사 | PASS |
| `git diff --check` | PASS |

검증 중 재생성된 sitemap과 기존 verifier 보고서는 작업 범위 밖 변경을 남기지 않도록 복원했다.

## 10. SEO 정책 변경 없음

- self canonical 유지
- KO/EN hreflang 유지
- sitemap 생성 정책 변경 없음
- robots/noindex 변경 없음
- H1 1개 유지
- HowTo, BreadcrumbList, SoftwareApplication JSON-LD 유지
- AdSense 구조 변경 없음

## 11. Phase 1 마무리

Phase 1의 입력 UX, 결과 전환 UX, 검색 문구 정합성, FAQ 확장과 검증 자동화를 완료했다. 배포 후에는 GA4에서 계산 실행률, 결과 CTA view/click, 관련 계산기 이동률을 실제 세션 기준으로 관찰하는 단계가 남는다.

## 12. Phase 2 후보

1. 검증된 연복리 직접 비교 또는 복리 주기 선택
2. 연 적립금 증가율과 일시 추가 납입
3. 하락장 또는 변동 수익률 시나리오
4. 기간별 5/10/20/30년 quick comparison
5. 월 적립금과 수익률 quick comparison
6. production GA4 KPI와 검색 유입 query 기반 FAQ 우선순위 재조정

