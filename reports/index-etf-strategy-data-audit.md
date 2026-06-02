# Finmap 지수 대시보드 ETF 전략 확장 1차 데이터 점검

작성일: 2026-06-02

## 1. 결론 요약

지수 대시보드에 KOSPI 연동 ETF, 특히 KODEX 레버리지(`KDX_LVG`, 실제 코드 `122630`)와 KODEX 200선물 인버스2X(`KDX_I2X`, 실제 코드 `252670`)의 "과거 동일 조건 통계"와 "일봉 기준 당일매매 시뮬레이션"을 붙이는 것은 가능하다.

다만 현재 구조는 일봉 OHLC 중심이다. 따라서 "시초가 매수 후 종가 매도"처럼 open/close가 명확한 가정의 시뮬레이션은 가능하지만, 장중 어느 시점에 고가/저가가 먼저 발생했는지, 특정 가격에 실제 체결됐는지, 분봉 기반 신호가 유효했는지는 판단할 수 없다.

핵심 구분:

| 구분 | 현재 가능 여부 | 근거 |
| --- | --- | --- |
| KOSPI와 ETF 같은 거래일 조인 | 가능, 결측 필터 필요 | `STOCK_INVEST_INFO.KSP_STOCK_DATE = MARKET_SITE_ETF_STOCK_INFO.ETF_STOCK_DATE` |
| KODEX 레버리지/인버스2X DB 저장 | 가능 | `MARKET_SITE_ETF_STOCK_INFO`에 `KDX_LVG`, `KDX_I2X` 존재 |
| ETF open/high/low/close 사용 | 가능 | 장마감 후 full OHLC row 존재. 당일 최신 row는 open만 있을 수 있음 |
| 전일종가 대비 시초가 상승/하락 | 가능 | `ETF_BEF_CLOSE_PRICE`, `ETF_OPEN_PRICE`, `ETF_UD_RATE_REAL_BY_OPEN` |
| 동일 등급 과거 KOSPI 조회 API | 있음 | `/api/stock-index/grade-stats` |
| 동일 등급 과거 ETF 조회 API | 없음 | 신규 API 또는 기존 API 확장 필요 |
| 분봉/틱 기반 당일매매 백테스트 | 불가 | 분봉/틱 후보 테이블 없음, volume도 없음 |
| 투자 추천/매수 신호 제공 | 하지 말아야 함 | 레버리지/인버스 고위험 상품, 현재 데이터도 일봉 시뮬레이션 한계 존재 |

## 2. 관련 파일 목록

### 화면/API

| 파일 | 역할 | ETF 확장 관련 판단 |
| --- | --- | --- |
| `pages/market/index.js` | 시장정보 허브 | 링크/소개 수준. ETF 통계 기능 본체는 아님 |
| `pages/market/indices.js` | KOSPI 등급 기반 시장정보 대시보드 | 실제 화면. 현재 ETF 섹션 없음 |
| `pages/api/market/summary.js` | 시장 요약 API | `STOCK_INVEST_INFO` 기반 지수/등급 요약. ETF 없음 |
| `pages/api/stock-index/dashboard.js` | 대시보드 기준일/KOSPI/등급 API | ETF 없음 |
| `pages/api/stock-index/grade-stats.js` | 동일/인접 등급 KOSPI 통계 API | ETF 확장 시 가장 가까운 기존 패턴 |
| `lib/stockIndexCore.js` | 날짜, 등급, KOSPI 매핑, 통계 helper | ETF용 helper 추가 후보 |

`_components` 검색 결과, 지수 대시보드 전용 컴포넌트는 별도 분리되어 있지 않다. `pages/market/indices.js` 안에 `StatCard`, `GradeBox`, `SimilarDates` 등 로컬 컴포넌트가 있다. 공통으로는 `SeoHead`, `DashboardAdSlot`을 사용한다.

### 크롤러/데이터 처리

| 파일 | 역할 |
| --- | --- |
| `server/crawler/lib/services/marketIndicesIFService.js` | 정규 지수/환율/ETF 기준 데이터 수집, `STOCK_INVEST_INFO` 등급 산정 |
| `server/crawler/lib/services/marketAfterOpenIFService.js` | 장중/장마감 후 KOSPI 및 ETF OHLC 수집 |
| `server/crawler/lib/services/marketWeeklyRecheckService.js` | 주간 재수집 stage/diff 검증 |
| `server/crawler/lib/vendors/yahooFinance.js` | `yahoo-finance2` wrapper |
| `server/crawler/lib/utils/utils.js` | 수익률/반올림/DB helper |
| `server/crawler/lib/utils/marketUtils.js` | 한국 휴장일 체크 helper |
| `server/crawler/lib/utils/crawlerFailureTracker.js` | 크롤링 실패 이력 기록 |
| `server/crawler/scheduler.js` | 정규/장중 크롤러 실행 순서 |
| `server/crawler/runner.js` | CLI 실행 진입점 |

### DDL/문서

| 파일 | 역할 |
| --- | --- |
| `sql/20260502_create_market_weekly_recheck_tables.sql` | 주간 재점검 run/stage/diff 테이블 DDL |
| `server/crawler/sql/20260428_create_crawler_failure_history.sql` | 크롤링 실패 이력 DDL |
| `docs/market-weekly-recheck.md` | 주간 재점검 운영 설명 |

## 3. 관련 DB 테이블 목록

DB 접속은 `.env.local`을 값 출력 없이 로드해 읽기 전용으로 확인했다. 기본 환경만으로는 `127.0.0.1:3306` 접속이 거절됐고, `.env.local` 로드 후 접속이 성공했다.

| 테이블 | 현재 역할 | 주요 컬럼 |
| --- | --- | --- |
| `STOCK_INVEST_INFO` | KOSPI 기준일별 OHLC, 글로벌 지표 집계, 가격/성장 등급 저장 | `KSP_STOCK_DATE`, `KSP_OPEN_PRICE`, `KSP_HIGH_PRICE`, `KSP_LOW_PRICE`, `KSP_CLOSE_PRICE`, `PRICE_TOT_SCORE_GRADE`, `GROWTH_TOT_SCORE_GRADE`, `updated_at` |
| `MARKETS_WORLD_INDICES_INFO` | source별 지수/환율/금리/원자재 OHLC/score | `INDEX_DATE`, `INDEX_ID`, `INDEX_SITE_ID`, `INDEX_OPEN_PRICE`, `INDEX_HIGH_PRICE`, `INDEX_LOW_PRICE`, `INDEX_END_PRICE`, `INDEX_SCORE` |
| `MARKET_SITE_ETF_STOCK_INFO` | source별 ETF 일봉 OHLC | `ETF_STOCK_DATE`, `ETF_STOCK_ID`, `ETF_SITE_ID`, `ETF_BEF_CLOSE_PRICE`, `ETF_OPEN_PRICE`, `ETF_HIGH_PRICE`, `ETF_LOW_PRICE`, `ETF_CLOSE_PRICE` |
| `CRAWLER_FAILURE_HISTORY` | 크롤링 실패/해결 이력 | `TARGET_DATE`, `INDICATOR_CODE`, `SOURCE_NAME`, `FAILURE_STAGE`, `RETRY_COUNT`, `RESOLVED_YN` |
| `MARKET_WEEKLY_RECHECK_RUN` | 주간 재점검 run metadata | `run_id`, `target_from_date`, `target_to_date`, `status` |
| `MARKETS_WORLD_INDICES_INFO_WEEKLY_STAGE` | 재수집 지수 stage | `INDEX_DATE`, `INDEX_ID`, `INDEX_SITE_ID`, OHLC/score |
| `STOCK_INVEST_INFO_WEEKLY_STAGE` | 재수집 집계 stage | `KSP_STOCK_DATE`, KOSPI OHLC, 지표 score, grade |
| `MARKET_WEEKLY_RECHECK_DIFF` | main/stage 차이 기록 | `table_name`, `diff_type`, `target_date`, `column_name`, `severity` |
| `MARKET_SITE_ETF_STOCK_INFO_WEEKLY_STAGE` | ETF stage DDL 후보 | 현재 DB에는 없음 |

기타 ETF 결과 테이블도 존재한다.

| 테이블 | 행 수/기간 | 판단 |
| --- | --- | --- |
| `ETF_STOCK_INFO` | 35,787행, 2000-01-04~2025-10-29 | 과거 ETF OHLC 저장 테이블. 현재 대시보드/API 코드에서는 직접 사용 확인 안 됨 |
| `ETF_STOCK_RESULT` | 107,452행, 2000-01-05~2025-09-24 | 과거 ETF 결과/수익 테이블. result type에 `Y25_KDX_GRADE_*` 존재 |
| `MARKET_ETF_DTL_RST_FOR_DIBR` | 107,460행, 2000-01-05~2025-09-24 | ETF 예약매수/결과 형태의 상세 결과 테이블. 현재 화면/API와는 분리됨 |

## 4. 필드 보유 여부

| 요청 필드 | 현재 매핑 | 보유 여부 |
| --- | --- | --- |
| date/trade_date | `KSP_STOCK_DATE`, `ETF_STOCK_DATE`, `INDEX_DATE` | 있음 |
| symbol/ticker | `ETF_STOCK_ID`, `INDEX_ID` | 있음. 실제 거래소 코드(`122630`)는 크롤러 코드 맵에 있음 |
| name | `ETF_STOCK_NAME`, `INDEX_SITE_NAME` | ETF 이름 있음 |
| market_type | `ETF_STOCK_GROUP`, `ETF_STOCK_TYPE` | 컬럼은 있으나 `MARKET_SITE_ETF_STOCK_INFO` 대상 row에서는 대부분 NULL |
| open/high/low/close | KOSPI/ETF/지수별 OHLC 컬럼 | 있음 |
| prev_close | `KSP_BEF_CLOSE_PRICE`, `ETF_BEF_CLOSE_PRICE`, `INDEX_STD_PRICE` | 있음 |
| change_rate | `*_UD_RATE_REAL_BY_OPEN`, `*_BY_TODAY`, `*_BY_CLOSE` | 있음 |
| volume | 없음 | 현재 관련 테이블에 없음 |
| crawl_time/updated_at | `updated_at`, `created_at` | 있음. 별도 `crawl_time` 컬럼은 없음 |
| price_grade | `PRICE_TOT_SCORE_GRADE` | 있음 |
| growth_grade | `GROWTH_TOT_SCORE_GRADE` | 있음 |
| combined_grade | 물리 컬럼 없음 | `price_grade + growth_grade` 조합으로 계산 가능 |
| index_name | 코드상 mapping | 물리 컬럼은 `INDEX_ID`, `INDEX_SITE_NAME` 중심 |

## 5. 현재 수집 중인 지수/ETF 목록

### 지수/매크로

`MARKETS_WORLD_INDICES_INFO`와 코드 기준으로 확인되는 대상:

| 코드 | 이름/의미 | 주요 source |
| --- | --- | --- |
| `KSP` / `KOSPI` | KOSPI | NVR, DMF, YHF |
| `SNP` / `SP500` | S&P 500 | YHF, STQ, INV |
| `NDQ` / `NASDAQ` | Nasdaq | YHF, STQ, INV |
| `DWJ` / `DOW` | Dow Jones | YHF, STQ, INV |
| `DXY` | Dollar Index | YHF, INV, FRF |
| `KRW` / `USDKRW` | USD/KRW | ECOS, SMBS, INV |
| `TNX` / `US10Y` | 미국 10년물 금리 | YHF, INV, FRED |
| `WTI` | WTI crude oil | YHF, STQ, INV |

### ETF

크롤러 코드와 DB에서 확인된 대상:

| 내부 ID | 이름 | 실제 코드 | DB 저장 여부 |
| --- | --- | --- | --- |
| `KDX_LVG` | KODEX 레버리지 | `122630` / `122630.KS` | 있음 |
| `KDX_I2X` | KODEX 200선물 인버스2X | `252670` / `252670.KS` | 있음 |
| `TGR_LVG` | TIGER 200선물 레버리지 | `267770` / `267770.KS` | 있음 |
| `TGR_I2X` | TIGER 200선물 인버스2X | `252710` / `252710.KS` | 있음 |
| `KSF_LVG` | KIWOOM 200선물레버리지 | `253250` / `253250.KS` | 있음 |
| `KSF_I2X` | KIWOOM 200선물인버스2X | `253230` / `253230.KS` | 있음 |
| `KBS_LVG` | RISE 200선물레버리지 | `252400` / `252400.KS` | 있음 |
| `KBS_I2X` | RISE 200선물인버스2X | `252420` / `252420.KS` | 있음 |
| `PLS_LVG` | PLUS 200선물 레버리지 | `253150` / `253150.KS` | 있음 |
| `PLS_I2X` | PLUS 200선물인버스2X | `253160` / `253160.KS` | 있음 |
| `KSP_LVG` | KOSPI 레버리지 proxy | 실제 ETF 아님 | 있음, KOSPI 변동률 기반 환산값 |
| `KSP_I2X` | KOSPI 인버스2X proxy | 실제 ETF 아님 | 있음, KOSPI 변동률 기반 환산값 |

주의: `KSP_LVG`, `KSP_I2X`는 실제 KODEX ETF가 아니라 KOSPI 변동률을 2배/역2배로 환산해 `1000` 기준 가격으로 만든 proxy 성격이다. 실제 KODEX 상품을 보여줄 때는 `KDX_LVG`, `KDX_I2X`를 써야 한다.

## 6. DB 데이터 보유량 요약

### `STOCK_INVEST_INFO`

| 항목 | 값 |
| --- | --- |
| 전체 행 수 | 6,520 |
| 기간 | 2000-01-05~2026-06-02 |
| KOSPI open/high/low/close 보유 row | 각 6,467 |
| 가격 등급 row | 6,469 |
| 성장 등급 row | 6,469 |
| 가격+성장 등급 모두 보유 row | 6,469 |

2026-06-02 최신 row는 `PRICE_TOT_SCORE_GRADE=-5`, `GROWTH_TOT_SCORE_GRADE=3`이 있으나 KOSPI OHLC는 아직 NULL이었다. 최신 당일 row는 수집 시점에 따라 등급/기준가만 있고 장중 또는 마감 OHLC가 비어 있을 수 있다.

### KODEX 대상 ETF

| ETF | source | row 수 | 기간 | full OHLC row |
| --- | --- | ---: | --- | ---: |
| `KDX_LVG` KODEX 레버리지 | DMF | 154 | 2025-06-30~2026-06-02 | 146 |
| `KDX_LVG` KODEX 레버리지 | NVR | 250 | 2025-06-26~2026-06-02 | 248 |
| `KDX_LVG` KODEX 레버리지 | YHF | 239 | 2025-06-26~2026-06-02 | 235 |
| `KDX_I2X` KODEX 200선물 인버스2X | DMF | 155 | 2025-06-30~2026-06-02 | 147 |
| `KDX_I2X` KODEX 200선물 인버스2X | NVR | 250 | 2025-06-26~2026-06-02 | 248 |
| `KDX_I2X` KODEX 200선물 인버스2X | YHF | 239 | 2025-06-26~2026-06-02 | 235 |

2026-06-02 기준 KODEX row는 전일종가와 시초가, 시초가 등락률은 존재하지만 high/low/close는 NULL이었다. 예: `KDX_LVG`는 전일종가 `225500`, 시초가 `228475`, 시초가 등락률 `+1.32%`; `KDX_I2X`는 전일종가 `76`, 시초가 `75`, 시초가 등락률 `-1.32%`.

### KOSPI와 ETF 조인 가능성

조인 키:

```sql
STOCK_INVEST_INFO.KSP_STOCK_DATE = MARKET_SITE_ETF_STOCK_INFO.ETF_STOCK_DATE
```

KODEX 기준 조인 결과:

| ETF | source | ETF row | KOSPI 날짜 조인 row | KOSPI+ETF open/close 모두 있음 | KOSPI+ETF full OHLC 모두 있음 |
| --- | --- | ---: | ---: | ---: | ---: |
| `KDX_LVG` | DMF | 154 | 154 | 146 | 146 |
| `KDX_LVG` | NVR | 250 | 239 | 190 | 190 |
| `KDX_LVG` | YHF | 239 | 239 | 189 | 189 |
| `KDX_I2X` | DMF | 155 | 155 | 147 | 147 |
| `KDX_I2X` | NVR | 250 | 239 | 190 | 190 |
| `KDX_I2X` | YHF | 239 | 239 | 189 | 189 |

따라서 2차 구현에서는 반드시 `KSP_OPEN_PRICE`, `KSP_CLOSE_PRICE`, `ETF_OPEN_PRICE`, `ETF_CLOSE_PRICE`가 모두 있는 row로 필터링해야 한다. high/low까지 쓰는 시뮬레이션이면 full OHLC 필터가 필요하다.

## 7. 등급 산정 기준

등급은 API에서 즉석 계산하지 않고 크롤러 집계 단계에서 `STOCK_INVEST_INFO`에 저장한다.

산식 위치:

- `server/crawler/lib/services/marketIndicesIFService.js`
- 함수: `fnCalcGrade(pObj)`

점수 합산:

```text
growthTotScore = SNP_SCORE + NDQ_SCORE + DWJ_SCORE
priceTotScore  = DXY_SCORE + TNX_SCORE + WTI_SCORE + KRW_SCORE
```

성장 등급:

- `growthTotScore > 2`이면 `+9`
- `> 1.4` `+8`, `> 1.0` `+7`, `> 0.75` `+6`, `> 0.54` `+5`, `> 0.37` `+4`, `> 0.21` `+3`, `> 0.05` `+2`, `>= 0` `+1`
- `< -2.5`이면 `-9`
- `< -1.8` `-8`, `< -1.3` `-7`, `< -0.95` `-6`, `< -0.65` `-5`, `< -0.45` `-4`, `< -0.28` `-3`, `< -0.15` `-2`, `< 0` `-1`

가격 등급:

- `priceTotScore > 1.2`이면 `+9`
- `> 0.9` `+8`, `> 0.65` `+7`, `> 0.5` `+6`, `> 0.35` `+5`, `> 0.22` `+4`, `> 0.12` `+3`, `> 0.03` `+2`, `>= 0` `+1`
- `< -1.4`이면 `-9`
- `< -1.0` `-8`, `< -0.75` `-7`, `< -0.55` `-6`, `< -0.4` `-5`, `< -0.25` `-4`, `< -0.15` `-3`, `< -0.05` `-2`, `< 0` `-1`

하위 지표 score는 source별 close change, open-to-close 보정, 지표별 가중치로 계산된다. 대표적으로 S&P500/Nasdaq/Dow는 성장 점수, DXY/TNX/WTI/KRW는 가격 부담 점수에 들어간다. 다만 score 계산 경로가 source별로 분산되어 있어 2차 구현 시에는 산식 전체를 화면에 길게 노출하기보다 "과거 산식으로 저장된 가격/성장 등급"이라고 설명하는 편이 안전하다.

`combined_grade` 컬럼은 없다. 화면/API에서는 `{ priceGrade, growthGrade }` 쌍 또는 `"P-5/G+3"` 같은 표시값을 계산해서 쓰면 된다.

## 8. 동일 등급 과거 조회 가능 여부

기존 API:

```text
GET /api/stock-index/grade-stats?date=YYYY-MM-DD&period=3y&rangeMode=exact&limit=20
```

기능:

- 선택 기준일의 `PRICE_TOT_SCORE_GRADE`, `GROWTH_TOT_SCORE_GRADE`를 읽는다.
- `exact`, `near1`, `near2` 범위로 과거 동일/인접 등급 row를 조회한다.
- KOSPI 전일종가 대비 시초가/종가 변화와 상승/하락 마감 통계를 반환한다.

한계:

- 현재 응답은 KOSPI 통계 전용이다.
- ETF OHLC를 조인하지 않는다.
- ETF별 open-to-close, prev-close-to-open, high/low 변동 통계를 반환하지 않는다.

2차 구현에서는 이 API를 그대로 변경하기보다 `/api/stock-index/etf-grade-stats` 같은 별도 API를 추가하는 편이 안전하다. 기존 KOSPI 대시보드 응답 shape를 건드리지 않고 ETF 실험 기능을 분리할 수 있다.

## 9. 당일매매 시뮬레이션 가능 범위

### 일봉 기준으로 가능한 계산

현재 DB만으로 가능한 계산:

- 동일 가격/성장 등급이었던 과거 날짜의 ETF `open -> close` 수익률
- ETF 전일종가 대비 시초가 갭: `(ETF_OPEN_PRICE - ETF_BEF_CLOSE_PRICE) / ETF_BEF_CLOSE_PRICE`
- ETF 시초가 대비 종가 수익률: `(ETF_CLOSE_PRICE - ETF_OPEN_PRICE) / ETF_OPEN_PRICE`
- ETF 전일종가 대비 종가 수익률: `(ETF_CLOSE_PRICE - ETF_BEF_CLOSE_PRICE) / ETF_BEF_CLOSE_PRICE`
- KOSPI 전일종가 대비 시초가/종가 변화와 ETF 변화 비교
- 동일 등급 조건의 표본 수, 평균, 중앙값, 최대/최소, 상승/하락/보합 비율
- KODEX 레버리지와 KODEX 200선물인버스2X의 같은 조건별 성과 비교

표현 예시:

- "과거 동일 등급 조건에서 KODEX 레버리지의 시초가-종가 일봉 시뮬레이션"
- "과거 같은 가격/성장 등급 조합에서 관찰된 ETF open-to-close 분포"
- "전일종가 대비 시초가 갭과 당일 종가 변화의 과거 통계"

### 일봉 기준 시뮬레이션의 한계

일봉만으로는 다음을 판단할 수 없다.

- 장중에 고가와 저가 중 어느 쪽이 먼저 나왔는지
- 특정 손절/익절 가격이 실제로 먼저 체결됐는지
- 시초가 체결 가능 수량, 호가 공백, 슬리피지
- ETF 괴리율, NAV 추적 오차, LP 유동성 상태
- 장중 신호 발생 후 n분 내 매수/매도 성과
- 고가 매도/저가 매수 같은 경로 의존형 전략의 실제 결과
- 분봉 기반 변동성, 거래량 급증, VWAP, 체결강도

따라서 현재 데이터로는 "당일매수 당일매도 백테스트"라는 표현보다 "일봉 open-close 가정 시뮬레이션"이라고 표시해야 한다.

### 분봉/틱 데이터가 있어야 가능한 계산

추가 데이터가 있어야 가능한 계산:

- 1분/5분/10분 단위 진입/청산 시뮬레이션
- 장중 신호 발생 시점 이후 수익률
- 고가/저가 도달 순서 기반 손절/익절 판단
- 거래량 기반 필터, 체결 가능성 추정
- ETF 괴리율/NAV 기반 위험 필터
- 종가 동시호가 전후 전략 검증
- 장중 변동성 확대/축소 패턴 검증

DB 테이블명 기준으로 `MIN`, `TICK`, `INTRA`, `MINUTE`, `TRADE` 후보 테이블을 조회했으나 결과는 없었다. 현재는 일봉 중심으로 보는 것이 맞다.

## 10. 현재 구조에서 2차 구현 가능 범위

화면을 크게 바꾸지 않는 2차 구현 범위:

1. 별도 API 추가: `/api/stock-index/etf-grade-stats`
2. 입력 파라미터: `date`, `period`, `rangeMode`, `etfId`, `siteId`, `limit`
3. 기본 ETF: `KDX_LVG`, `KDX_I2X`
4. 기본 source: `NVR` 또는 `DMF/YHF` fallback. source별 결측 수가 달라 응답에 source와 표본 수를 반드시 표시
5. 기존 `grade-stats`와 같은 등급 필터 사용
6. `STOCK_INVEST_INFO`와 `MARKET_SITE_ETF_STOCK_INFO`를 거래일로 inner join
7. full OHLC가 필요한 통계는 NULL row 제외
8. 화면에는 작은 "ETF 일봉 시뮬레이션" 섹션만 추가
9. 문구는 "관찰", "과거 통계", "시뮬레이션"으로 제한

권장 응답 shape 초안:

```json
{
  "ok": true,
  "date": "2026-06-01",
  "priceGrade": -5,
  "growthGrade": 4,
  "rangeMode": "exact",
  "period": "3y",
  "source": "NVR",
  "etfs": [
    {
      "etfId": "KDX_LVG",
      "name": "KODEX 레버리지",
      "sampleCount": 0,
      "avgOpenToClosePct": null,
      "medianOpenToClosePct": null,
      "avgPrevCloseToOpenPct": null,
      "similarDates": []
    }
  ],
  "warning": "daily_bar_simulation_only"
}
```

## 11. 추가로 필요한 DB 컬럼/테이블

### 2차 일봉 통계만 구현할 때

신규 DB 컬럼은 필수는 아니다. 다만 다음 정리는 있으면 좋다.

| 항목 | 필요성 |
| --- | --- |
| `combined_grade` materialized 컬럼 | 필수 아님. 조회 편의/인덱스용으로는 가능 |
| `ETF_STOCK_GROUP`, `ETF_STOCK_TYPE` 값 채우기 | 현재 site ETF row에서 대부분 NULL. 레버리지/인버스 구분 표시 편의 |
| source 우선순위 테이블 | NVR/YHF/DMF 중 대표 source 선택 기준 명확화 |
| ETF stage 테이블 생성 | 주간 재점검에 ETF까지 포함하려면 `MARKET_SITE_ETF_STOCK_INFO_WEEKLY_STAGE` 필요 |

권장 인덱스:

```sql
CREATE INDEX idx_stock_invest_grade_date
ON STOCK_INVEST_INFO (PRICE_TOT_SCORE_GRADE, GROWTH_TOT_SCORE_GRADE, KSP_STOCK_DATE);

CREATE INDEX idx_market_site_etf_date_id_site
ON MARKET_SITE_ETF_STOCK_INFO (ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID);
```

실제 인덱스 존재 여부는 이번 점검에서 별도로 확인하지 않았다. 2차 구현 전에 `SHOW INDEX` 확인이 필요하다.

### 분봉/틱 기반으로 확장할 때

신규 테이블 후보:

```sql
CREATE TABLE MARKET_SITE_ETF_INTRADAY_BAR (
  trade_date varchar(10) NOT NULL,
  ticker varchar(20) NOT NULL,
  etf_stock_id varchar(20) NOT NULL,
  source_id varchar(20) NOT NULL,
  interval_code varchar(10) NOT NULL,
  bar_time datetime NOT NULL,
  open_price decimal(12,2) NULL,
  high_price decimal(12,2) NULL,
  low_price decimal(12,2) NULL,
  close_price decimal(12,2) NULL,
  volume bigint NULL,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (trade_date, etf_stock_id, source_id, interval_code, bar_time)
);
```

필요하면 KOSPI/KOSPI200 선물/ETF NAV/괴리율을 별도 테이블로 분리해야 한다.

## 12. 투자 유의 문구 제안

화면 또는 API 설명에 넣을 수 있는 문구:

> 이 화면은 과거 동일 등급 조건에서 관찰된 일봉 기준 통계와 시뮬레이션을 보여줍니다. 특정 ETF의 매수·매도 추천이나 수익 보장을 의미하지 않습니다. 레버리지·인버스 ETF는 복리 효과, 괴리율, 변동성, 유동성, 추적 오차로 인해 손실 위험이 매우 클 수 있으며 단기 가격 변동에 크게 노출됩니다. 실제 투자 판단은 상품 설명서와 본인의 위험 감내 수준을 확인한 뒤 별도로 검토해야 합니다.

짧은 UI 문구:

> 과거 통계 참고용입니다. 레버리지·인버스 ETF는 고위험 상품이며, 본 화면은 매수·매도 추천이 아닙니다.

## 13. 구현하면 안 되는 위험한 표현

다음 표현은 피해야 한다.

- "오늘 매수 신호"
- "지금 KODEX 레버리지 매수"
- "인버스2X 진입 추천"
- "승률 보장"
- "수익 보장"
- "안전한 레버리지 투자"
- "확실한 당일 수익"
- "무조건 종가 매도"
- "등급이 +면 레버리지, -면 인버스"
- "이 조건이면 오른다/내린다"
- "추천 종목"
- "실전 매매 타점"
- "따라 하면 된다"

대체 표현:

- "과거 동일 조건 통계"
- "일봉 open-close 가정 시뮬레이션"
- "관찰된 분포"
- "표본 수가 적어 해석 주의"
- "실제 체결/수익을 보장하지 않음"

## 14. 검증 결과

### DB 확인

실행 내용:

- `SHOW COLUMNS`로 주요 테이블 구조 확인
- KOSPI/ETF 보유량, OHLC 보유 row, KOSPI-ETF 날짜 조인 row 조회
- 분봉/틱 후보 테이블 조회

주요 결과:

- `STOCK_INVEST_INFO`, `MARKET_SITE_ETF_STOCK_INFO`, `MARKETS_WORLD_INDICES_INFO`, `CRAWLER_FAILURE_HISTORY`, 주간 recheck 테이블 구조 확인 완료
- `MARKET_SITE_ETF_STOCK_INFO_WEEKLY_STAGE`는 현재 DB에 없음
- 분봉/틱 후보 테이블 없음
- `KDX_LVG`, `KDX_I2X` 모두 DB에 저장 중

### `node --check`

통과:

- `node --check lib/stockIndexCore.js`
- `node --check server/crawler/lib/services/marketIndicesIFService.js`
- `node --check server/crawler/lib/services/marketAfterOpenIFService.js`
- `node --check server/crawler/lib/services/marketWeeklyRecheckService.js`
- `node --check server/crawler/lib/vendors/yahooFinance.js`

실행하지 않은 파일:

- `pages/market/index.js`
- `pages/market/indices.js`
- `pages/api/market/summary.js`
- `pages/api/stock-index/dashboard.js`
- `pages/api/stock-index/grade-stats.js`

사유: Next.js page/API 파일은 JSX 또는 ES module 문법을 사용하므로 `node --check` 단독 검증 대상이 아니다. 2차 구현 후에는 `npm run build` 또는 Next 빌드 검증이 필요하다.

## 15. 2차 구현 제안

1차 이후 권장 순서:

1. API만 먼저 추가: `/api/stock-index/etf-grade-stats`
2. KODEX 2종만 대상으로 read-only 통계 생성
3. source별 표본 수와 결측을 응답에 포함
4. 화면에는 작은 표/카드만 추가하고 기존 KOSPI 대시보드는 유지
5. 문구는 "과거 동일 등급 ETF 일봉 시뮬레이션"으로 제한
6. 사용자에게 source, 표본 수, 일봉 한계를 항상 표시
7. 이후 필요하면 ETF stage 테이블과 분봉 수집 설계를 별도 작업으로 진행

1차 결론은 "현재 데이터로 KODEX 2종의 일봉 기반 과거 동일 등급 시뮬레이션은 가능하지만, 장중 매매 전략처럼 보이는 기능은 분봉/틱/체결 가능성 데이터 없이 구현하면 안 된다"이다.
