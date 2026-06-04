# Finmap Revenue Core Pages Audit

- 감사일: 2026-06-04
- 목표: 계산기·블로그·대시보드의 검색 유입과 체류를 연결해 월 `$1,000` 수익화 기반 만들기
- 산출물 범위: 분석 및 개선안. 실제 광고 추가나 페이지 수정은 수행하지 않음.

## 1. 결론

Finmap의 가장 강한 수익 구조는 다음 흐름이다.

`검색형 자료 글 → 계산기/대시보드 → 결과 확인·추가 탐색 → 결과형 광고 노출 → 관련 글/도구 재방문`

현재 블로그 상세에는 광고와 관련 계산기 CTA가 이미 있고, 부동산 대시보드도 결과형 광고가 구현되어 있다. 가장 큰 수익화 갭은 **FIRE를 제외한 핵심 계산기 5개에 광고가 없다는 점**, **부동산 대시보드에서 DSR/LTV 계산기로 직접 이어지는 CTA가 약하다는 점**, **이미 노출되는 페이지의 CTR 개선 여지가 크다는 점**이다.

월 `$1,000`은 보장 가능한 수치가 아니며, 현재 저장소에는 페이지별 AdSense 수익/RPM 데이터가 없다. 단순 산식은 다음과 같다.

| 가정 Page RPM | 월 `$1,000`에 필요한 페이지뷰 |
| --- | ---: |
| `$5` | `200,000` |
| `$10` | `100,000` |
| `$20` | `50,000` |

따라서 광고 수만 늘리기보다 고의도 검색 유입, 계산 완료율, 결과 광고 viewability, 내부 페이지 이동을 함께 높여야 한다.

## 2. 감사 범위와 근거

점검 대상:

- `pages/tools/*`
- `_components/*Calculator*` 및 계산기 관련 CTA/광고/SEO 컴포넌트
- `content/posts/*`
- `pages/market/*`
- `pages/re/*`
- 기존 GSC 감사: `reports/gsc-blog-audit.md`

범위 참고:

- `pages/re/*` 폴더는 현재 존재하지 않는다.
- 부동산 API는 `pages/api/re/*`에 있으나 이번 페이지 감사 대상에서는 제외했다.
- 저장소 내 GSC 감사는 2026-05-18 생성 데이터다. 이후 추가된 페이지의 검색 실적은 포함하지 않는다.
- 해당 GSC 감사에서 확인된 주요 기회:
  - `/tools/compound-interest`: 노출 `192`, 클릭 `1`, CTR `0.52%`, 평균 순위 `40.0`
  - `/tools/fire-calculator`: 노출 `178`, 클릭 `3`, CTR `1.69%`, 평균 순위 `7.6`
  - `/posts/personalFinance/how-much-per-month-for-100m`: 노출 `110`, 클릭 `0`, 평균 순위 `7.2`
  - `/tools/cagr-calculator`: 노출 `16`

## 3. 선정 기준

각 후보를 다음 기준으로 정성 평가했다.

- 검색 의도와 금융 상업성
- 기존 검색 노출 또는 현실적인 검색 수요
- 계산/필터 사용에 따른 체류시간과 재방문 가능성
- 광고를 배치해도 핵심 작업을 방해하지 않을 여지
- 관련 글·계산기·대시보드로 연결하는 허브 역할

## 4. 핵심 페이지 10개

| 순위 | 우선순위 | 유형 | URL | 핵심 수익 역할 |
| ---: | --- | --- | --- | --- |
| 1 | P0 | 계산기 | `/tools/dsr-ltv-calculator` | 주택대출·아파트 구매 고의도 검색의 최종 전환 페이지 |
| 2 | P0 | 대시보드 | `/market/real-estate` | 반복 조회, 긴 체류, Top100·상세·대출 계산 연결 허브 |
| 3 | P0 | 계산기 | `/tools/compound-interest` | 범용 검색 수요와 기존 노출이 있는 대표 계산기 |
| 4 | P0 | 계산기 | `/tools/fire-calculator` | 기존 검색 노출과 광고가 모두 있는 즉시 최적화 대상 |
| 5 | P0 | 블로그 | `/posts/personalFinance/how-much-per-month-for-100m` | 평균 7.2위·클릭 0회인 CTR 개선 기회, 목표 계산기 진입 글 |
| 6 | P0 | 블로그 | `/posts/personalFinance/dsr-40-income-loan-limit-table` | 주담대 한도 자료형 검색과 DSR 계산기 전환 허브 |
| 7 | P1 | 계산기 | `/tools/goal-simulator` | “목표까지 월 얼마” 검색 의도를 직접 계산으로 전환 |
| 8 | P1 | 계산기 | `/tools/dca-calculator` | ETF·적립식 장기 계획, 반복 시뮬레이션과 영어 확장 가능 |
| 9 | P1 | 블로그 | `/posts/personalFinance/cash-100m-200m-300m-apartment-budget` | 보유현금 기반 아파트 구매 가능액 고의도 검색 |
| 10 | P2 | 계산기 | `/tools/cagr-calculator` | 투자 성과 계산·백링크 가능성이 있으나 직접 검색 노출은 아직 작음 |

보류 후보:

- `/market/indices`: 결과형 광고 3개와 관련 글 링크가 있지만, 현재 SEO/H1가 KOSPI 등급 모델에 좁게 묶여 있고 FAQ·영문 경험·검색 실적 근거가 약하다. 반복 방문 지표가 확인되면 핵심 10개로 승격한다.
- `/market/real-estate/apt/[aptKey]`: 광고와 긴 상세 콘텐츠가 있지만 현재 `noindex,follow`이므로 SEO 수익 핵심 페이지가 아니라 대시보드 내부 체류 페이지로 분류한다.
- Top100 페이지: 검색 랜딩으로 유용하지만 여러 페이지로 분산되어 있어 우선 대시보드 허브의 유입·내부링크를 강화한다.

## 5. 현재 상태 요약

블로그 페이지의 렌더링 title/H1은 `seoTitle`이 있으면 이를 사용하고, description은 `seoDescription`을 사용한다.

| URL | 현재 title / H1 | 현재 description | 내부링크·FAQ·CTA 상태 | 현재 광고 |
| --- | --- | --- | --- | --- |
| `/tools/dsr-ltv-calculator` | Title: `DSR LTV 아파트 구매 가능 금액 계산기 \| 대출 가능액·매수 가능 가격` / H1: `DSR/LTV 아파트 구매 가능 금액 계산기` | 자산·소득·부채·금리·LTV·DSR 입력 기반 추정임을 명확히 설명 | 대시보드 가격 필터 deep link, 관련 글 4개, FAQ 5개+JSON-LD, 공유/인용 CTA. 매우 강함 | 없음 |
| `/market/real-estate` | Title/H1: `대한민국 아파트 실거래 대시보드` | 국토부 실거래 기반 지역·기간·평형·년식 비교 설명 | Top100, 관련 글 4개, 단지 상세 연결. FAQ 없음. DSR 계산기 직접 CTA 약함 | 결과 상단, 카드 7개마다 최대 3개, 목록 하단 |
| `/tools/compound-interest` | Title: `복리 계산기` / H1: `복리 이자 계산기` | 월복리 미래가치, 세금·수수료·물가, 표·차트 설명 | 가이드 6개, 결과 후 다른 계산기 4개, FAQ+JSON-LD, 공유/인용 CTA. 강함 | 없음 |
| `/tools/fire-calculator` | Title/H1: `은퇴자금 계산기 / FIRE 계산기 \| 은퇴 생활비·필요자금 시뮬레이션` | 현재자산·월저축·은퇴나이·생활비 기준 비교 | 가이드 5개, 결과 후 계산기 4개, FAQ+JSON-LD, 공유/인용 CTA. 강함 | 결과 요약 후, 차트 후, 연도표 후 3개 |
| `/posts/personalFinance/how-much-per-month-for-100m` | Title/H1: `1억 모으기 월 투자금 계산: 5년·10년·15년 수익률별 기준` | 기간·수익률별 월 투자금과 목표 시뮬레이터 안내 | 목표·복리·DCA 링크, visible FAQ, 관련 계산기/글 CTA. 유사 표 글과 의도 중복 가능 | 블로그 공통: 상단, H2 #2 뒤, H2 #4 뒤, 하단 |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | Title/H1: `DSR 40% 연소득별 주담대 한도표 \| DSR 계산기·LTV 계산기` | 금리 4%, 30년 기준 표와 계산기·대시보드 사용 흐름 | DSR 계산기와 대시보드 반복 링크, visible FAQ+FAQPage. 강함 | 블로그 공통 4개 |
| `/tools/goal-simulator` | Title/H1: `목표자산 도달 계산기 \| 매달 얼마 투자해야 할까?` | 목표 금액까지의 경로, 세금·수수료, 공유/PDF 설명 | 가이드 6개, 계산 전 관련 도구, 결과 후 계산기 4개, FAQ+JSON-LD, 공유/인용 CTA. 매우 강함 | 없음 |
| `/tools/dca-calculator` | Title/H1: `ETF·주식 자동 적립식 시뮬레이터 (DCA)` | 월 적립, 세율, 수수료, 적립금 증가율 설명 | 가이드 6개, 결과 후 계산기 4개, FAQ+JSON-LD, 공유/인용 CTA. 강함 | 없음 |
| `/posts/personalFinance/cash-100m-200m-300m-apartment-budget` | Title/H1: `보유현금 1억 2억 3억 아파트 구매 가능 금액 \| DSR LTV 계산기` | 현금·LTV·부대비용과 실거래 대시보드 사용 흐름 | DSR 계산기와 대시보드 반복 링크, visible FAQ+FAQPage. 강함 | 블로그 공통 4개 |
| `/tools/cagr-calculator` | Title: `CAGR 계산기 (연평균 수익률·연복리 수익률·연평균 성장률)` / H1: `CAGR(연평균 수익률)로 내 투자 성과를 한 줄 숫자로` | 초기·최종 자산과 기간, 세금·수수료 전후 비교 | 가이드 5개, 계산 전 관련 도구, 결과 후 계산기 4개, FAQ+JSON-LD, 공유/인용 CTA. 강함 | 없음 |

### 5.1 현재 title, description, H1 원문

아래 title은 각 페이지가 `SeoHead`에 전달하는 값이다. 실제 HTML `<title>`에는 공통 컴포넌트가 ` | FinMap`을 추가하므로 SERP 길이 검토 시 suffix까지 포함해야 한다.

| URL | 현재 title | 현재 description | 현재 H1 |
| --- | --- | --- | --- |
| `/tools/dsr-ltv-calculator` | `DSR LTV 아파트 구매 가능 금액 계산기 \| 대출 가능액·매수 가능 가격` | `보유자산, 연소득, 기존대출, 금리, 대출기간, LTV, DSR을 직접 입력해 예상 대출 가능액과 아파트 구매 가능 가격대를 계산해보세요. 실제 대출 심사와는 다를 수 있습니다.` | `DSR/LTV 아파트 구매 가능 금액 계산기` |
| `/market/real-estate` | `대한민국 아파트 실거래 대시보드` | `대한민국 아파트 실거래(국토부) 기반 Top 랭킹 대시보드. 지역/기간/평형/년식 필터로 단지별 거래량·중위·평균·평단가를 비교하세요.` | `대한민국 아파트 실거래 대시보드` |
| `/tools/compound-interest` | `복리 계산기` | `원금·월적립·수익률·기간으로 월복리 기준 미래가치(FV)를 계산합니다. 세금·수수료·물가상승률 반영 결과를 연도별 표·차트로 확인하세요.` | `복리 이자 계산기` |
| `/tools/fire-calculator` | `은퇴자금 계산기 / FIRE 계산기 \| 은퇴 생활비·필요자금 시뮬레이션` | `현재자산, 월저축, 은퇴나이, 기대수명, 생활비를 입력해 은퇴 시점 예상 자산과 필요 은퇴자금을 비교하고, 기존 FIRE 계산도 함께 확인합니다.` | `은퇴자금 계산기 / FIRE 계산기 \| 은퇴 생활비·필요자금 시뮬레이션` |
| `/posts/personalFinance/how-much-per-month-for-100m` | `1억 모으기 월 투자금 계산: 5년·10년·15년 수익률별 기준` | `1억원을 만들려면 월 얼마가 필요한지 5년·10년·15년 기간과 수익률별로 비교하고, 목표 자산 시뮬레이터로 직접 확인해보세요.` | `1억 모으기 월 투자금 계산: 5년·10년·15년 수익률별 기준` |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | `DSR 40% 연소득별 주담대 한도표 \| DSR 계산기·LTV 계산기` | `연소득별 DSR 40% 주담대 한도를 금리 4%, 30년 원리금균등 기준으로 정리하고 DSR/LTV 계산기와 부동산 실거래 대시보드 활용법을 안내합니다.` | `DSR 40% 연소득별 주담대 한도표 \| DSR 계산기·LTV 계산기` |
| `/tools/goal-simulator` | `목표자산 도달 계산기 \| 매달 얼마 투자해야 할까?` | `현재 자산·월 적립금·수익률·기간·세금·수수료를 반영해 목표 자산까지의 성장 경로를 시뮬레이션합니다. 공유 및 PDF 저장 지원.` | `목표자산 도달 계산기 \| 매달 얼마 투자해야 할까?` |
| `/tools/dca-calculator` | `ETF·주식 자동 적립식 시뮬레이터 (DCA)` | `매월 일정 금액을 ETF·주식에 적립 투자했을 때 자산 성장 경로를 시뮬레이션합니다. 세율, 수수료율, 연간 적립금 증가율까지 반영해 보세요.` | `ETF·주식 자동 적립식 시뮬레이터 (DCA)` |
| `/posts/personalFinance/cash-100m-200m-300m-apartment-budget` | `보유현금 1억 2억 3억 아파트 구매 가능 금액 \| DSR LTV 계산기` | `DSR만 통과해도 현금, LTV, 부대비용 때문에 매수 가능 가격이 달라집니다. 보유현금별 아파트 구매 가능 금액을 계산하고 부동산 실거래 대시보드로 확인하세요.` | `보유현금 1억 2억 3억 아파트 구매 가능 금액 \| DSR LTV 계산기` |
| `/tools/cagr-calculator` | `CAGR 계산기 (연평균 수익률·연복리 수익률·연평균 성장률)` | `초기 자산·최종 자산·기간으로 CAGR(연평균 복리 수익률)을 계산하고, 세금·수수료 반영 전후 차이를 비교해보세요. 주식/ETF/부동산/코인 수익률 분석에 활용할 수 있습니다.` | `CAGR(연평균 수익률)로 내 투자 성과를 한 줄 숫자로` |

### 5.2 현재 핵심 내부링크

| URL | 현재 주요 내부링크 |
| --- | --- |
| `/tools/dsr-ltv-calculator` | 실거래 대시보드의 안전 탐색 가격 쿼리, DSR 소득별 한도표, 금리 1%p 영향, 주담대 리스크, 내 집 목표 로드맵 |
| `/market/real-estate` | 지역/권역 Top100, 서울·경기·인천 Top100 가이드, 아파트 상세, 내 집 목표·주담대 리스크·전월세/매수·수도권 예산 글 |
| `/tools/compound-interest` | 단리 vs 복리, 연복리 vs 월복리, 1억 월 투자금, 월 DCA 10년, 목표 전략, 재테크 시작 글 + FIRE/목표/CAGR/DCA 계산기 |
| `/tools/fire-calculator` | FIRE 3개 숫자, 시퀀스 리스크, 가정 오류, 지출 버킷, 재테크 시작 글 + 복리/목표/CAGR/DCA 계산기 |
| `/posts/personalFinance/how-much-per-month-for-100m` | 목표 자산 계산기, 복리 계산기, DCA 계산기 + 공통 관련 계산기/관련 글 |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | DSR/LTV 계산기, 부동산 실거래 대시보드 + 공통 관련 계산기/관련 글 |
| `/tools/goal-simulator` | 단리 vs 복리, 연복리 vs 월복리, 1억 월 투자금, 월 DCA 10년, 목표 전략, 재테크 시작 글 + FIRE/복리/CAGR/DCA 계산기 |
| `/tools/dca-calculator` | 월 DCA 10년, 환율 변동 분해, 적립금 증액, DCA 실패 패턴, 목표 전략, 재테크 시작 글 + 복리/CAGR/목표/FIRE 계산기 |
| `/posts/personalFinance/cash-100m-200m-300m-apartment-budget` | DSR/LTV 계산기, 부동산 실거래 대시보드 + 공통 관련 계산기/관련 글 |
| `/tools/cagr-calculator` | CAGR 기본, 연 7% 현실 체크, 투자 실력 진단, 1억 월 투자금, 목표 전략 + DCA/FIRE/복리/목표 계산기 |

## 6. 페이지별 개선안

### 1. DSR/LTV 아파트 구매 가능 금액 계산기

**왜 핵심인가**

- 대출 한도, 주담대, 아파트 구매 가능 금액은 금융·부동산 중 가장 강한 행동 의도를 가진 검색군이다.
- 계산 결과의 안전 탐색 가격대를 실거래 대시보드 쿼리로 직접 넘기는 구조가 이미 있다.

**개선안**

- P0 SEO: 계산 기준일 `2026-05-21`과 “정책 자동 반영 아님” 문구를 title 아래에서 계속 명확히 유지하고, 기준일 갱신 프로세스를 월 1회 운영 체크리스트로 만든다.
- P0 UX: 핵심 결과 카드 뒤에 “왜 이 금액인가” 3줄 요약과 실패한 조건을 먼저 보여주고 민감도 표는 그 아래 유지한다.
- P0 측정: 다른 계산기에는 있는 `tool_calculate` 이벤트가 DSR/LTV에는 보이지 않는다. 계산 실행, 대시보드 이동, 관련 글 클릭을 별도 이벤트로 측정한다.
- P1 내부링크: 현재 4개 글 외에 `cash-100m-200m-300m-apartment-budget`, `dsr-pass-ltv-cash-bottleneck`을 추가한다.

**광고 위치**

- 첫 광고: 핵심 결과와 병목 설명 뒤, 민감도 표 전.
- 두 번째 광고: 민감도 표 뒤, 대시보드 CTA 전.
- 입력 폼 위·폼 내부·계산 버튼 인접 위치에는 광고를 넣지 않는다.

### 2. 아파트 실거래 대시보드

**왜 핵심인가**

- 반복 필터 사용, 결과 목록, 단지 상세 이동으로 세션 깊이가 가장 길어질 수 있다.
- 대시보드 광고와 `real_estate_search`, `real_estate_detail_click` 이벤트가 이미 있다.

**개선안**

- P0 SEO/신뢰: 실제 기본 데이터 범위가 서울·경기·인천이므로 `대한민국`/`South Korea` title과 H1은 범위를 과장할 수 있다. `서울·경기·인천 아파트 실거래가 대시보드`처럼 정확한 범위로 조정한다.
- P0 CTA: 필터 위 또는 첫 결과 뒤에 `내 예산 먼저 계산하기 → DSR/LTV 계산기`를 추가한다.
- P0 내부링크: 관련 가이드 목록에 신규 글 3개를 추가한다.
  - `how-to-read-apartment-transaction-prices`
  - `apartment-transaction-volume-decline-meaning`
  - `large-apartment-complex-households-price-stability`
- P1 FAQ: 평균·중앙값·평단가·거래량·표본수·데이터 최신월에 관한 visible FAQ와 FAQPage를 추가한다.

**광고 위치**

- 현재 result top + infeed 최대 3개 + list bottom은 긴 목록에서 최대 5개가 될 수 있다.
- P0: 한 세션/결과 조회당 최대 3개로 제한하고, 결과 수에 따라 `result_top + infeed 1 + list_bottom`을 우선한다.
- 필터 전이나 첫 화면 상단에는 광고를 추가하지 않는다.
- 데스크톱 사이드 광고는 실제 viewability가 확인된 뒤에만 실험한다.

### 3. 복리 계산기

**왜 핵심인가**

- 기존 GSC 노출 `192`로 도구 중 가장 분명한 검색 기회가 있지만 CTR `0.52%`, 평균 순위 `40.0`으로 개선 여지가 크다.
- 복리, 월 적립, 미래가치, 세금·수수료 등 여러 검색 의도를 한 도구가 수용한다.

**개선안**

- P0 SEO: title을 `복리 계산기 | 월 적립·세금·수수료 미래가치 계산`처럼 결과를 명시한 버전으로 테스트한다. H1 `복리 이자 계산기`는 유지 가능하다.
- P0 콘텐츠: 검색자가 계산 전에 바로 이해할 수 있는 기본 예시 3개와 “월복리 계산 기준” 답변을 입력 폼 가까이에 둔다.
- P1 내부링크: `compound-return-3-5-7-10-table`, `monthly-investment-for-100m-table`을 추천 가이드 상단에 추가한다.

**광고 위치**

- 첫 광고: 계산 후 세후/세전 핵심 요약 뒤.
- 두 번째 광고: 차트·연도별 표 뒤, 결과 CTA 전.
- 기본 진입 화면에는 광고를 노출하지 않는 result-only 방식을 우선한다.

### 4. FIRE 계산기

**왜 핵심인가**

- 기존 GSC에서 평균 순위 `7.6`, 노출 `178`, 클릭 `3`으로 실제 검색 진입이 있다.
- 핵심 10개 중 유일하게 계산기 결과형 광고가 이미 구현되어 있다.

**개선안**

- P0 CTR: 긴 혼합 title을 `은퇴자금 계산기 | FIRE 목표금액·생활비 시뮬레이션`처럼 검색 결과에서 빠르게 읽히는 형태로 테스트한다.
- P0 UX: title/H1 아래에서 `은퇴 필요자금`, `은퇴 시점 예상자산`, `부족액` 세 결과를 먼저 약속한다.
- P1 측정: 현재 3개 결과 광고를 2개/3개 버전으로 나눠 계산 완료율, 결과 스크롤 깊이, 광고 viewability를 비교한다.

**광고 위치**

- 현재 결과 요약 후, 차트 후, 연도표 후 배치는 입력을 방해하지 않아 방향이 좋다.
- 짧은 결과 세션은 2개, 긴 결과/보고서 열람 세션은 최대 3개로 동적 제한을 권장한다.

### 5. 1억 모으기 월 투자금 계산 글

**왜 핵심인가**

- 평균 순위 `7.2`에서 노출 `110`, 클릭 `0`으로 가장 빠른 CTR 회수 기회다.
- 목표 계산기, 복리 계산기, DCA 계산기로 자연스럽게 전환된다.

**개선안**

- P0 CTR: title을 질문형과 즉답형으로 테스트한다. 예: `1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금`.
- P0 카니벌라이제이션: `monthly-investment-for-100m-table`과 검색 의도가 겹친다. 이 URL은 “현실적인 계획/의사결정 허브”, 표 글은 “기간·수익률별 빠른 참조표”로 역할을 분리하고 상호 링크한다.
- P0 UX: 도입부 바로 아래에 5년·10년·15년 핵심 월 금액 표와 `내 조건 계산하기` CTA를 둔다.

**광고 위치**

- 현재 상단 광고는 H1 직후, cover/답변 요약 전이다. P0로 답변 요약 또는 첫 핵심 표 뒤로 이동 테스트한다.
- 본문 중간 1~2개와 하단 1개를 유지하되 짧은 글에서는 총 3개 이하로 제한한다.

### 6. DSR 40% 연소득별 주담대 한도표

**왜 핵심인가**

- 연소득별 주담대 한도표는 검색 결과에서 바로 유용하고 인용·백링크 가능성이 높다.
- 글 → DSR 계산기 → 실거래 대시보드의 수익 루프가 명확하다.

**개선안**

- P0 신뢰: title/H1 근처에 `가정: 금리 4%, 30년, 기존부채 없음`과 갱신일을 표시한다.
- P0 CTA: 첫 표 위와 표 뒤에 서로 다른 CTA를 둔다.
  - 표 전: `내 연소득 기준 빠르게 보기`
  - 표 후: `기존부채·현금·LTV까지 계산하기`
- P1 내부링크: `dsr-pass-ltv-cash-bottleneck`, `cash-100m-200m-300m-apartment-budget`, `mortgage-risk-checklist-dsr-variable`을 추가한다.

**광고 위치**

- 첫 핵심 표를 보기 전에는 광고를 두지 않는다.
- 첫 표 뒤, 계산 예시 뒤, FAQ 전을 후보로 삼고 총 3개 이하로 제한한다.

### 7. 목표자산 도달 계산기

**왜 핵심인가**

- “목표 금액까지 매달 얼마”라는 검색 의도를 직접 해결한다.
- 계산 전 관련 도구, 결과 후 4개 도구, 가이드 6개로 내부 순환 구조가 가장 좋다.

**개선안**

- P1 SEO: title은 강하지만 H1도 긴 SEO title과 동일하다. H1은 `목표자산 도달 계산기`로 줄이고, 월 투자금 역산 약속은 supporting copy에 둔다.
- P1 내부링크: `monthly-investment-for-100m-table`을 최상단 가이드로 추가하고, `how-much-per-month-for-100m`과 역할을 구분한다.
- P1 UX: 계산 목표 변수 선택 → 입력 → 결과의 순서를 모바일 첫 화면에서 더 명확히 유지한다.

**광고 위치**

- 결과 달성률/필요 월 납입금 요약 뒤.
- 민감도·연도표 뒤, PDF/공유 CTA 전.
- 계산 전 관련 도구 허브 주변에는 광고를 넣지 않는다.

### 8. DCA 계산기

**왜 핵심인가**

- ETF·적립식 투자·월 투자금은 KO/EN 모두 확장 가능하며 반복 시뮬레이션이 자연스럽다.
- 세금, 수수료, 적립금 증가, 일괄투자 비교 등 체류를 만드는 기능이 충분하다.

**개선안**

- P1 SEO: KO title 앞부분에 검색자가 더 많이 쓰는 `적립식 투자 계산기`를 넣는다. 예: `적립식 투자 계산기 | ETF·주식 DCA 시뮬레이터`.
- P1 내부링크: `dca-vs-lump-sum-when-results-differ`, `is-dca-better-in-bear-market`, `monthly-investment-for-100m-table`을 추천 가이드 우선순위에 반영한다.
- P1 UX: 단순 모델의 한계 설명은 유지하되 첫 결과 요약에서는 세후 최종자산·누적원금·수익만 먼저 보여준다.

**광고 위치**

- 세후 최종자산/원금/수익 요약 뒤.
- DCA vs 일괄투자 비교 또는 연도별 표 뒤.
- 입력 폼과 하락장 시나리오 토글 사이에는 광고를 넣지 않는다.

### 9. 보유현금별 아파트 구매 가능 금액 글

**왜 핵심인가**

- `보유현금 1억/2억/3억 + 아파트`는 행동 의도가 강하고 DSR 계산기·실거래 대시보드로 자연스럽게 이어진다.
- 단순 대출 한도가 아니라 현금·LTV·부대비용 병목을 다뤄 차별화된다.

**개선안**

- P1 SEO: 현재 title과 description은 검색 의도에 잘 맞는다. Search Console 데이터가 쌓이기 전에는 큰 제목 변경보다 내부링크와 표 가독성을 우선한다.
- P1 CTA: 각 현금 구간 표 행에 `이 조건으로 계산하기` 프리셋 링크를 제공한다.
- P1 내부링크: `dsr-40-income-loan-limit-table`, `dsr-pass-ltv-cash-bottleneck`, `apt-dashboard-home-goal-roadmap`을 추가한다.

**광고 위치**

- 1억·2억·3억 핵심 비교표 뒤.
- DSR/LTV 병목 설명 뒤.
- 최종 계산기 CTA와 광고는 서로 붙이지 않는다.

### 10. CAGR 계산기

**왜 핵심인가**

- 기간이 다른 투자 성과 비교라는 명확한 유틸리티가 있고 공유·인용 기능이 강하다.
- 다만 기존 GSC 노출이 `16`으로 직접 검색 성장 근거는 아직 약하다.

**개선안**

- P2 SEO: title의 유사 키워드 3개 나열을 줄인다. 예: `CAGR 계산기 | 연평균 복리수익률 계산`.
- P2 내부링크: 검색 노출이 확인된 `what-is-cagr`을 최상단 가이드로 유지하고 `compound-return-3-5-7-10-table`을 추가한다.
- P2 백링크: 결과 공유·인용 CTA를 “기간이 다른 투자 성과 비교 자료”로 명확히 포지셔닝한다.

**광고 위치**

- CAGR 핵심 결과와 세전/세후 차이 뒤.
- 연도별 경로 또는 민감도 표 뒤.
- 트래픽이 작으므로 먼저 검색 성장과 계산 완료율을 확인한 뒤 광고를 켠다.

## 7. 공통 광고 배치 원칙

### 계산기

- 첫 화면과 입력 폼에는 광고를 넣지 않는다.
- `tool_calculate` 이후에만 광고를 로드하는 result-only 방식을 우선한다.
- 권장 기본값은 결과 광고 2개다.
  - 핵심 결과 요약 뒤
  - 차트/표 뒤, 관련 CTA 전
- 광고와 계산 버튼, CTA 버튼을 인접 배치하지 않는다.
- FIRE의 현재 3개 광고는 2개 버전과 A/B 테스트한다.

### 블로그

- 현재 공통 템플릿은 H1 직후 상단, H2 #2 뒤, H2 #4 뒤, 하단 광고를 사용한다.
- 상단 광고는 답변 요약 또는 첫 핵심 표 뒤로 이동 테스트한다.
- 글 길이에 따라 광고 수를 제한한다.
  - 짧은 글: 2개
  - 중간 글: 3개
  - 긴 글: 최대 4개
- 계산기 CTA 직전·직후에는 광고를 붙이지 않는다.

### 대시보드

- 필터와 첫 작업 완료 전에는 광고를 넣지 않는다.
- 결과가 실제로 존재할 때만 광고를 표시한다.
- 결과 수와 스크롤 깊이에 따라 최대 광고 수를 제한한다.
- `dashboard_ad_slot_render`뿐 아니라 실제 viewport 진입을 측정하는 `dashboard_ad_view`가 필요하다.

## 8. 공통 SEO·UX·수익화 개선

### P0

1. DSR/LTV 계산기에 `tool_calculate`, 결과 광고 view, 대시보드 이동 이벤트를 추가한다.
2. FIRE 외 핵심 계산기에 result-only 광고 슬롯 2개를 도입하되 먼저 한 페이지에서 실험한다.
3. 부동산 대시보드 title/H1의 `대한민국` 범위를 실제 데이터 범위인 서울·경기·인천으로 수정한다.
4. 부동산 대시보드에 DSR/LTV 계산기 직접 CTA와 신규 실거래 해석 글 3개를 연결한다.
5. `/posts/personalFinance/how-much-per-month-for-100m`의 CTR title 테스트와 유사 표 글의 역할 분리를 진행한다.
6. 블로그 상단 광고를 답변 요약 전이 아니라 뒤에 배치하는 실험을 한다.

### P1

1. 목표/DCA/복리 계산기에 신규 자료형 글을 최상단 가이드로 연결한다.
2. 대출·아파트 자료형 글에 계산기 프리셋 또는 결과 상태 기반 CTA를 추가한다.
3. 대시보드 광고를 조회당 최대 3개로 제한하고 viewability를 측정한다.
4. 페이지별 `tool_calculate → result_ad_view → related_click` 퍼널을 만든다.
5. 선택한 블로그 글의 embedded Article JSON-LD와 템플릿 Article JSON-LD가 중복되는지 검증하고 한 방식으로 통일한다.

### P2

1. CAGR 계산기의 title을 간결하게 만들고 백링크/인용 포지셔닝을 강화한다.
2. 시장지표 대시보드의 반복 방문과 광고 viewability가 확인되면 핵심 페이지로 승격한다.
3. 영어 페이지는 KO 페이지 성과를 확인한 뒤 검색 의도에 맞는 별도 title/description 실험을 진행한다.

## 9. 측정 설계

월 `$1,000` 목표를 관리하려면 페이지별로 다음 지표가 필요하다.

| 단계 | 필수 지표 |
| --- | --- |
| 검색 유입 | page, query, clicks, impressions, CTR, position |
| 도구 사용 | `tool_calculate`, 계산 완료율, 재계산 횟수 |
| 대시보드 사용 | `real_estate_search`, result count, detail click |
| 내부 전환 | related calculator click, guide click, dashboard↔calculator click |
| 광고 | ad slot render, viewport view, viewable time, page-level RPM |
| 품질 보호 | 이탈률, 결과 도달률, Core Web Vitals, 모바일 오류 |

현재 구현에서 확인한 이벤트:

- 계산기 5개: `tool_calculate` 확인
- DSR/LTV 계산기: `tool_calculate` 미확인
- 부동산 대시보드: `real_estate_search`, `real_estate_detail_click`
- 대시보드 광고: `dashboard_ad_slot_render`
- 블로그: `blog_engagement`
- 내부 계산기 CTA: `related_calculator_click`, `tool_hub_click`

우선 추가할 이벤트:

- `result_ad_view`
- `dashboard_ad_view`
- `dsr_ltv_calculate`
- `dashboard_to_dsr_click`
- `dsr_to_dashboard_click`
- `revenue_core_page_session`

## 10. 실행 순서

### 0~30일

- P0 페이지의 title/H1/CTA 수정안부터 적용
- 복리 계산기와 DSR/LTV 계산기에 result-only 광고 2개 실험
- 부동산 대시보드 광고 최대 개수 제한 및 DSR CTA 추가
- GSC 및 GA4 페이지별 baseline 저장

### 31~60일

- `how-much-per-month-for-100m` CTR 개선 결과 확인
- 대출/부동산 글 3개 → 계산기 → 대시보드 퍼널 확인
- FIRE 광고 2개/3개 실험
- 성과가 좋은 계산기 광고 패턴을 목표/DCA에 확장

### 61~90일

- 페이지별 RPM, 계산 완료율, 내부 전환율로 핵심 10개 재정렬
- CAGR와 시장지표 대시보드의 승격/보류 결정
- 영어 페이지 확장 우선순위 결정

## 11. 변경 파일

- `reports/finmap-revenue-core-pages-audit.md`

이번 작업에서는 분석 리포트만 작성했으며 페이지 코드, 광고 수, SEO 메타데이터는 변경하지 않았다.

## 12. 검증

- 선정한 핵심 페이지 10개의 로컬 페이지/콘텐츠 파일 존재 여부를 확인했다.
- 선정한 10개 KO URL과 대응 EN URL이 `public/sitemap-0.xml`에 포함된 것을 확인했다.
- `git diff --check -- reports/finmap-revenue-core-pages-audit.md`: PASS
- 리포트만 추가했으므로 `npm.cmd run build`는 실행하지 않았다.
