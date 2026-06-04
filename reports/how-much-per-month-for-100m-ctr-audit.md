# Finmap 1억 모으기 글 CTR 개선 감사

- 작업일: 2026-06-04
- 대상 KO URL: `https://www.finmaphub.com/posts/personalFinance/how-much-per-month-for-100m`
- 대상 EN URL: `https://www.finmaphub.com/en/posts/personalFinance/how-much-per-month-for-100m`
- 목표: 검색 결과 CTR 개선, 본문 초반 즉답 제공, 목표자산 계산기 전환 강화

## 1. 기존 상태 점검

| 항목 | 기존 상태 | 문제 |
|---|---|---|
| KO 제목 | `1억 모으기 월 투자금 계산: 5년·10년·15년 수익률별 기준` | 핵심 검색 질문인 "1억 모으려면 월 얼마"에 대한 즉답성이 약함 |
| 첫 본문 | 10문장 요약과 일반 설명 뒤에 핵심 숫자 표 배치 | 사용자가 필요한 5년·10년·15년 답을 찾기까지 스크롤 필요 |
| 목표자산 계산기 CTA | 본문 중간의 일반 링크 | 첫 핵심 표를 본 직후 내 조건을 계산하는 흐름이 약함 |
| 유사 글 관계 | 5천만원·1억원·3억원 표가 함께 배치 | 수익률별 표 글과 역할이 겹칠 가능성 |
| FAQ | KO/EN 각각 3개 | 실제 계획 단계의 추가 질문 대응이 부족함 |
| 구조화데이터 | 공통 렌더러의 `BlogPosting`과 본문 `Article`이 함께 존재 | Article 계열 구조화데이터 중복 가능성 |

공통 렌더러 `pages/posts/[category]/[slug].js`는 콘텐츠별 `BlogPosting` JSON-LD를 자동 생성한다. 또한 `lib/posts.js`에서 `seoTitle`과 `seoDescription`을 실제 렌더링 제목과 설명으로 우선 사용한다.

## 2. 적용 내용

### 제목과 검색 설명

| locale | 변경 제목 |
|---|---|
| KO | `1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금` |
| EN | `How Much Should You Invest Monthly to Reach $100,000? 5-, 10-, and 15-Year Plans` |

KO/EN 설명에도 연 5% 가정 기준 5년·10년·15년 월 필요 금액을 넣었다. 검색 결과와 공통 템플릿 설명 영역에서 핵심 답을 먼저 확인할 수 있도록 했다.

### 첫 본문과 계산기 CTA

- 첫 본문 문장을 바로 답하는 형식으로 변경했다.
- 첫 H2 아래에 5년·10년·15년 및 연 0%·5%·7% 월 필요 투자금 표를 배치했다.
- 표의 가정을 `초기자산 0원, 월말 납입, 세금·수수료 제외`로 명시했다.
- 첫 핵심 표 직후 목표자산 계산기 CTA를 배치했다.
- 숫자는 프로젝트의 `lib/compoundCore.js` `solveMonthlyContributionForTarget` 결과와 대조했다.

계산기 코어 검증 결과:

| 기간 | 연 0% | 연 5% | 연 7% |
|---|---:|---:|---:|
| 5년 | 1,667 | 1,470 | 1,397 |
| 10년 | 833 | 644 | 578 |
| 15년 | 556 | 374 | 315 |

위 값은 목표액 `100000` 기준이다. KO 글에서는 같은 비율의 1억원 목표를 만원 단위로 반올림해 표시했다.

### 글 역할 분리

대상 글은 **계획 세우기·의사결정 허브**로 재구성했다.

- 대상 글: 지속 가능한 월 투자금 선택, 5년·10년·15년 기간 판단, 비상금과 실행 체크리스트
- `monthly-investment-for-100m-table`: 더 촘촘한 기간·수익률별 숫자 참고표
- KO `how-much-monthly-invest-for-100m`: 세금·수수료를 포함한 적립식 계산 방법

5천만원·1억원·3억원 숫자를 반복 나열하던 구성을 제거하고, 월 예산에서 목표 기간을 고르는 의사결정 표로 교체했다.

### 내부 링크와 전환

| 목적 | KO | EN |
|---|---|---|
| 목표 금액·기간 역산 | `/tools/goal-simulator` | `/en/tools/goal-simulator` |
| 수익률·세금·수수료 민감도 | `/tools/compound-interest` | `/en/tools/compound-interest` |
| 정기 납입 시나리오 | `/tools/dca-calculator` | `/en/tools/dca-calculator` |
| 상세 월 투자금 표 | `/posts/personalFinance/monthly-investment-for-100m-table` | `/en/posts/personalFinance/monthly-investment-for-100m-table` |
| DCA와 일시금 판단 | `/posts/personalFinance/dca-vs-lumpsum-decision-rules` | `/en/posts/personalFinance/dca-vs-lumpsum-decision-rules` |

모든 링크 대상 파일과 계산기 페이지가 존재함을 확인했다. `tool` 메타도 `["goal","comp","dca"]`로 확장해 관련 계산기 연결을 유지했다.

### FAQ와 JSON-LD

- KO/EN 각각 FAQ를 3개에서 5개로 보강했다.
- 월 필요 금액, 월 50만원 기간, 연 7% 가정, 초기자산, 계산기별 용도를 다뤘다.
- 본문 FAQ와 일치하는 `FAQPage` JSON-LD를 locale별로 1개씩 추가했다.
- 본문에 있던 `Article` JSON-LD는 제거했다.
- 공통 렌더러의 `BlogPosting` JSON-LD는 그대로 사용한다.

결과적으로 각 글은 공통 `BlogPosting` 1개와 본문 `FAQPage` 1개 역할로 분리된다.

## 3. 라우팅·SEO 보존 확인

- slug: `how-much-per-month-for-100m` 변경 없음
- KO canonical: `/posts/personalFinance/how-much-per-month-for-100m` 변경 없음
- EN canonical: `/en/posts/personalFinance/how-much-per-month-for-100m` 변경 없음
- 공통 렌더러의 locale 기반 canonical/hreflang 처리 변경 없음
- `dateModified`는 KO/EN 모두 `2026-06-04`로 갱신
- postbuild가 `public/sitemap-0.xml`의 대상 URL과 personalFinance 카테고리 lastmod를 `2026-06-04`로 갱신
- sitemap의 대상 KO/EN URL과 hreflang 쌍은 변경 없음

관련 블로그 렌더링 컴포넌트는 이미 제목·설명·canonical·hreflang·`BlogPosting`을 올바르게 처리하고 있어 수정하지 않았다.

## 4. 변경 파일

- `content/posts/personalFinance/ko/how-much-per-month-for-100m.md`
- `content/posts/personalFinance/en/how-much-per-month-for-100m.md`
- `public/sitemap-0.xml` - postbuild 생성 결과의 lastmod 갱신
- `reports/how-much-per-month-for-100m-ctr-audit.md`

기존 광고, 광고 위치, 계산기 계산 로직은 변경하지 않았다.

## 5. 실행 명령과 결과

| 명령 | 결과 |
|---|---|
| `node -e "...solveMonthlyContributionForTarget..."` | PASS - 5년·10년·15년, 연 0%·5%·7% 값 대조 |
| `rg --files ...` | PASS - 목표자산·복리·DCA 계산기 및 관련 글 경로 존재 확인 |
| `rg -n ...` | PASS - 본문 `Article` 제거, locale별 `FAQPage` 1개 확인 |
| `npm.cmd run build` | PASS - Next.js production build 및 next-sitemap 생성 성공 |
| `git diff --check` | PASS |

## 6. 남은 운영 확인

- GSC에서 변경 제목과 설명이 다시 수집된 뒤 CTR과 쿼리별 노출 변화를 확인한다.
- 목표자산 계산기 CTA 클릭은 현재 별도 이벤트를 추가하지 않았으므로, 전환을 정밀 비교하려면 기존 분석 이벤트 체계에 맞춘 후속 측정이 필요하다.
- 검색 결과 제목은 검색 엔진이 다시 작성할 수 있으므로 실제 노출 제목을 함께 확인한다.
