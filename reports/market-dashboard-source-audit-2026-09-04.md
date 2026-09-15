# FinMap Market Dashboard Source Audit - 2026-09-04

## 1. Executive Summary

Final Verdict: `ANALYSIS_COMPLETE_WITH_EXTERNAL_GAPS`

이번 감사는 2026-09-04 기준 FinMap 저장소의 정적 소스 분석만으로 수행했다. 운영 소스 수정, DB 쓰기, 크롤러/배치 실행, 의존성 변경은 하지 않았다. DB 현재값과 외부 스케줄러/저장 프로시저 존재 여부는 확인하지 않았으므로, 저장소 밖 구성 요소는 `external gap`으로 분리했다.

핵심 결론은 다음과 같다.

- 현재 Market Dashboard의 실질 진입점은 `/market/indices`이다.
- 대시보드 주 데이터는 `STOCK_INVEST_INFO`이며, API 계층에서 `MARKETS_WORLD_INDICES_INFO`를 직접 읽지 않는다.
- 일일 시장 데이터 파이프라인은 PM2의 `finmap-crawler`가 `server/crawler/runner.js`를 실행하고, 내부 scheduler가 장전/장중/장후 작업을 호출하는 구조다.
- 원천 시장 데이터는 `MARKETS_WORLD_INDICES_INFO`에 먼저 적재되고, `SET_KSP_INV` 단계에서 `STOCK_INVEST_INFO`로 롤업된다.
- KOSPI 및 ETF 장중/종가 데이터는 `MARKET_SITE_ETF_STOCK_INFO`에도 저장되지만, 현재 프론트 기본 ETF 통계는 `source=legacy`로 호출되어 `ETF_STOCK_INFO` 기반 경로를 사용한다.
- 현재 UI/서버 코드에는 공격형/중립형/방어형 매매 모드, 확정 매수/매도, 손절 자동 규칙이 없다.
- 현재 ETF 통계는 일봉 기반 관찰 통계와 진입가 offset 시뮬레이션이며, 투자 추천 엔진이 아니다.
- `MARKET_RESULT_FOR_DIBR`, `KOSPI_GRADE_DETAIL_NEW`는 현재 저장소 소스에서 활성 사용처를 찾지 못했다.
- `MARKET_ETF_DTL_RST_FOR_DIBR`, `ETF_STOCK_RESULT`는 감사 스크립트와 기존 보고서에서만 확인되며, 현재 대시보드/API/크롤러 활성 경로에는 연결되어 있지 않다.
- 핵심 외부 gap은 DB 실제 스키마/현재 데이터, 휴일 테이블 관리 주체, legacy ETF 테이블 writer, DIBR 과거 모델, 외부 cron/DB event/stored procedure 존재 여부다.

## 2. Overall Architecture

FinMap Market Dashboard는 크게 네 층으로 구성된다.

1. 수집 계층
   - `server/crawler/runner.js`
   - `server/crawler/scheduler.js`
   - `server/crawler/lib/services/marketIndicesIFService.js`
   - `server/crawler/lib/services/marketAfterOpenIFService.js`

2. 원천/롤업 데이터 계층
   - `MARKETS_WORLD_INDICES_INFO`
   - `MARKET_SITE_ETF_STOCK_INFO`
   - `STOCK_INVEST_INFO`
   - legacy ETF 경로의 `ETF_STOCK_INFO`

3. API 계층
   - `pages/api/stock-index/dashboard.js`
   - `pages/api/stock-index/grade-stats.js`
   - `pages/api/stock-index/etf-grade-stats.js`
   - `pages/api/market/summary.js`

4. 프론트엔드 계층
   - `pages/market/index.js`
   - `pages/market/indices.js`

상위 흐름은 다음과 같다.

```text
PM2 finmap-crawler
  -> server/crawler/runner.js
  -> server/crawler/scheduler.js
  -> 장전 글로벌 지표 수집
  -> MARKETS_WORLD_INDICES_INFO
  -> 장중/종가 KOSPI 및 ETF 수집
  -> MARKETS_WORLD_INDICES_INFO + MARKET_SITE_ETF_STOCK_INFO
  -> SET_KSP_INV 롤업
  -> STOCK_INVEST_INFO
  -> Next.js API
  -> /market/indices
```

## 3. Active Entry Points

저장소 기준 활성 진입점은 다음과 같이 정리된다.

| 영역 | 파일 | 역할 |
| --- | --- | --- |
| Web process | `web.js` | Next.js 앱 실행 |
| Market hub | `pages/market/index.js` | `/market/indices` 링크 제공 |
| Dashboard page | `pages/market/indices.js` | KOSPI/지표/ETF 통계 대시보드 |
| Dashboard API | `pages/api/stock-index/dashboard.js` | 최신 사용 가능 기준일과 KOSPI/지표 요약 반환 |
| Grade stats API | `pages/api/stock-index/grade-stats.js` | 현재 등급과 유사 과거일의 KOSPI 통계 반환 |
| ETF stats API | `pages/api/stock-index/etf-grade-stats.js` | ETF 일봉 기반 등급 통계 반환 |
| Market summary API | `pages/api/market/summary.js` | `STOCK_INVEST_INFO` 기반 시장 요약 반환 |
| Crawler runner | `server/crawler/runner.js` | scheduler 시작 또는 one-shot 실행 |
| Crawler scheduler | `server/crawler/scheduler.js` | 장전/장중/종가 작업 스케줄 |
| Weekly recheck CLI | `server/crawler/scripts/market_weekly_recheck.js` | stage/diff 검증용 별도 배치 |

PM2 설정상 `ecosystem.config.js`의 `finmap-crawler`는 `server/crawler/runner.js`를 실행한다. 따라서 daily pipeline의 활성 중심은 runner/scheduler 조합이다.

## 4. Market Data Sources

`marketIndicesIFService.js`와 `marketAfterOpenIFService.js`에서 확인한 주요 데이터 소스는 다음과 같다.

| Source ID | 대상 | 방식 | 주요 저장 대상 |
| --- | --- | --- | --- |
| `ECOS/API` | USD/KRW | Bank of Korea ECOS API | `MARKETS_WORLD_INDICES_INFO` |
| `SMBS/PPT` | USD/KRW | 서울외국환중개 페이지/파싱 | `MARKETS_WORLD_INDICES_INFO` |
| `USIDX/YHF` | S&P 500, Nasdaq, Dow, DXY, TNX, WTI | Yahoo Finance | `MARKETS_WORLD_INDICES_INFO` |
| `STOOQ/AXC` | S&P 500, Nasdaq, Dow, WTI | Stooq | `MARKETS_WORLD_INDICES_INFO` |
| `FRF/API` | DXY proxy | Frankfurter API | `MARKETS_WORLD_INDICES_INFO` |
| `FRED/API` | 10Y Treasury | FRED API | `MARKETS_WORLD_INDICES_INFO` |
| `INV/PPT` | 주요 해외 지표 및 환율 | Investing.com historical page | `MARKETS_WORLD_INDICES_INFO` |
| `NVR/AXC` | KOSPI, ETF | Naver Finance realtime polling | `MARKETS_WORLD_INDICES_INFO`, `MARKET_SITE_ETF_STOCK_INFO` |
| `YHF/LIB` | KOSPI, ETF | `yahoo-finance2` library | `MARKETS_WORLD_INDICES_INFO`, `MARKET_SITE_ETF_STOCK_INFO` |
| `DMF/AXC` | KOSPI, ETF | Daum mobile finance + Puppeteer | `MARKETS_WORLD_INDICES_INFO`, `MARKET_SITE_ETF_STOCK_INFO` |

주의 사항:

- 일부 API key fallback literal이 소스에 존재한다. 값 자체는 이 보고서에 기록하지 않는다.
- Yahoo, Naver polling, Daum mobile page, Investing page는 외부 페이지/라이브러리 구조 변화에 취약하다.
- Euro Stoxx/STOXX 계열은 콘텐츠/보고서 언급은 있으나, 현재 활성 dashboard indicator나 scheduler 수집 목록에서는 확인되지 않았다.

## 5. Crawling Pipeline

`server/crawler/scheduler.js` 기준 daily scheduler 흐름은 장전 BF와 장중/장후 AF로 분리된다.

장전 `getBfIfAll(doDate)` 순서:

1. `ECOS/API` - USD/KRW
2. 20초 대기
3. `SMBS/PPT` - USD/KRW 보조
4. 150초 대기
5. `USIDX/YHF` - 미국/글로벌 지표
6. 150초 대기
7. `STOOQ/AXC` - 보조 글로벌 지표
8. 150초 대기
9. `FRF/API` - DXY 보조
10. 20초 대기
11. `FRED/API` - 10Y Treasury 보조
12. 20초 대기
13. `INV/PPT` - Investing 보조

장중/장후 `getAfIfAll(doDate, closeFlag)` 순서:

1. `afterOpen NVR/AXC`
2. 150초 대기
3. `afterOpen YHF/LIB`
4. 150초 대기
5. `afterOpen DMF/AXC`
6. 150초 대기
7. `indices SET_KSP_INV`

`SET_KSP_INV`는 당일 KOSPI/글로벌 원천 데이터를 `STOCK_INVEST_INFO`로 롤업하고 grade 계산까지 수행한다. `closeFlag=true`일 때는 최종 실패 이력 동기화도 수행한다.

## 6. Table Read/Write Matrix

| Table | Writer in repo | Reader in repo | 현재 Dashboard 역할 | 판정 |
| --- | --- | --- | --- | --- |
| `MARKETS_WORLD_INDICES_INFO` | `marketIndicesIFService.js`, `marketAfterOpenIFService.js` | `fnSetKspInvestInfo`, weekly recheck compare, 일부 previous date lookup | 원천 지표 저장소. Dashboard는 직접 읽지 않고 `STOCK_INVEST_INFO`를 통해 간접 사용 | CONFIRMED |
| `STOCK_INVEST_INFO` | `fnSetKspInvestInfo`, `fnCalcGrade` | dashboard/summary/grade/ETF stats APIs | 현재 Market Dashboard의 핵심 fact table | CONFIRMED |
| `MARKET_SITE_ETF_STOCK_INFO` | `marketAfterOpenIFService.js`, 일부 STD/manual 경로 | `lib/stockIndexEtfStats.js` | current-source ETF API에서 사용 가능. 현재 UI 기본값은 legacy라 기본 경로는 아님 | CONFIRMED |
| `ETF_STOCK_INFO` | 현재 활성 writer 미확인 | `lib/stockIndexLegacyEtfStats.js` | 현재 UI가 `source=legacy`로 ETF stats를 호출하므로 기본 ETF 관찰 통계에 사용 | CONFIRMED READ, WRITER UNKNOWN |
| `ETF_STOCK_RESULT` | 활성 writer 미확인 | `scripts/audit_legacy_etf_tables_for_index_signal.js`, 기존 report | 현재 dashboard/API/crawler 활성 경로에는 미연결 | LEGACY/EXTERNAL |
| `MARKET_ETF_DTL_RST_FOR_DIBR` | 활성 writer 미확인 | `scripts/audit_legacy_etf_tables_for_index_signal.js`, 기존 report | 현재 dashboard/API/crawler 활성 경로에는 미연결 | LEGACY/EXTERNAL |
| `MARKET_RESULT_FOR_DIBR` | 저장소에서 사용처 미확인 | 저장소에서 사용처 미확인 | 현재 코드상 역할 확인 불가 | UNKNOWN |
| `KOSPI_GRADE_DETAIL_NEW` | 저장소에서 사용처 미확인 | 저장소에서 사용처 미확인 | 현재 코드상 역할 확인 불가 | UNKNOWN |
| `MARKET_HOLYDAY_INFO` | writer 미확인 | crawler services, weekly recheck | 거래일/휴일 판단 보조 | EXTERNAL MAINTENANCE |
| `MARKET_WEEKLY_RECHECK_RUN` | `marketWeeklyRecheckService.js` | weekly recheck service/scripts | 운영 데이터 검증 stage run | CONFIRMED |
| `MARKETS_WORLD_INDICES_INFO_WEEKLY_STAGE` | `marketWeeklyRecheckService.js` | weekly recheck diff | weekly 검증용 stage | CONFIRMED |
| `STOCK_INVEST_INFO_WEEKLY_STAGE` | `marketWeeklyRecheckService.js` | weekly recheck diff | weekly 검증용 stage | CONFIRMED |
| `MARKET_WEEKLY_RECHECK_DIFF` | `marketWeeklyRecheckService.js` | weekly scripts/reporting | main vs stage 차이 기록 | CONFIRMED |
| `MARKET_SITE_ETF_STOCK_INFO_WEEKLY_STAGE` | DDL 존재 | 현재 service 사용 미확인 | ETF weekly stage 후보이나 활성 수집 경로 미확인 | PARTIAL |

## 7. MARKETS_WORLD_INDICES_INFO

`MARKETS_WORLD_INDICES_INFO`는 시장 원천 데이터 저장 테이블이다. 수집 서비스는 `INDEX_ID`, `INDEX_SITE_ID`, `INDEX_DATE` 조합으로 KOSPI, 미국 지수, 달러지수, 10년물 금리, WTI, 환율 등을 저장한다.

주요 역할:

- 장전 글로벌 원천 데이터 저장
- 장중/장후 KOSPI 원천 데이터 저장
- `fnSetKspInvestInfo`가 `STOCK_INVEST_INFO`를 생성/갱신할 때 source별 우선순위에 따라 읽는 staging 역할
- weekly recheck에서 stage 데이터와 main 데이터 비교 대상

`fnSetKspInvestInfo`의 source priority:

| Indicator | 1순위 | fallback |
| --- | --- | --- |
| KOSPI | `DMF` | `NVR` |
| S&P 500 | `YHF` | `STQ` |
| Nasdaq | `YHF` | `STQ` |
| Dow | `YHF` | `STQ` |
| DXY | `YHF` | `INV` |
| TNX | `YHF` | `INV` |
| WTI | `YHF` | `STQ` |
| USD/KRW | `ECOS` | `SMBS` |

Dashboard API는 이 테이블을 직접 읽지 않는다. 화면에 표시되는 지표는 롤업된 `STOCK_INVEST_INFO` 필드에서 나온다.

## 8. ETF Data Pipeline

ETF 파이프라인은 현재 두 갈래가 존재한다.

1. Current-source 경로
   - writer: `marketAfterOpenIFService.js`
   - table: `MARKET_SITE_ETF_STOCK_INFO`
   - reader: `lib/stockIndexEtfStats.js`
   - sources: `NVR`, `DMF`, `YHF`, `auto`

2. Legacy-source 경로
   - writer: 저장소에서 확인되지 않음
   - table: `ETF_STOCK_INFO`
   - reader: `lib/stockIndexLegacyEtfStats.js`
   - frontend default: `/api/stock-index/etf-grade-stats?source=legacy`

현재 `/market/indices`는 ETF 통계 호출 시 `source=legacy`를 명시한다. 따라서 실제 기본 화면의 ETF 관찰 통계는 `ETF_STOCK_INFO`를 기준으로 계산된다.

기본 ETF universe:

| ID | 종목 | 설명 |
| --- | --- | --- |
| `KDX_LVG` | `122630` | KODEX 레버리지 |
| `KDX_I2X` | `252670` | KODEX 200선물인버스2X |

`lib/stockIndexEtfStats.js`는 `KSP_LVG`, `KSP_I2X` 같은 KOSPI synthetic proxy를 직접 거부한다. afterOpen service에는 proxy 생성 코드가 있지만, 현재 통계 API는 기본적으로 실제 ETF 2개만 사용하도록 제한되어 있다.

## 9. Holiday & Trading Date Logic

휴일/거래일 판단은 현재 다음 요소로 구성된다.

- `server/crawler/lib/services/marketIndicesIFService.js` 내부 weekday heuristic
- `server/crawler/lib/services/marketAfterOpenIFService.js` 내부 weekday heuristic
- `server/crawler/lib/utils/marketUtils.js`의 `isKoreaMarketHoliday`
- `MARKET_HOLYDAY_INFO` 조회
- API 계층의 latest usable date 선택

크롤러 date heuristic 특징:

- 월요일은 일반적으로 전 거래일을 금요일로 간주한다.
- ECOS 환율 경로는 월요일/화요일에 별도 이전일 계산을 사용한다.
- 미국 휴일은 `HOLYDAY_COUNTRY='US'`, 한국 휴일은 `HOLYDAY_COUNTRY='KR'`로 확인한다.
- `marketIndicesIFService.js`는 `HOLYDAY_TYPE='ALL'` 조건도 사용한다.
- `marketUtils.js`의 `isKoreaMarketHoliday`는 country/date 중심으로 조회한다.

API 계층 방어:

- `getLatestStockDate(maxDate)`는 `STOCK_INVEST_INFO`의 최신 기준일을 찾는다.
- `getLatestUsableStockDate(maxDate)`는 KOSPI 기준가/시가/종가와 grade가 유효한 최신일을 찾는다.
- 허용 grade는 -9~-1, 1~9이며 0은 기본 통계 대상에서 제외된다.

리스크:

- 완전한 거래소 calendar library 기반이 아니라 휴일 테이블과 weekday heuristic에 의존한다.
- `MARKET_HOLYDAY_INFO`를 누가/언제 갱신하는지 저장소에서 확인되지 않는다.
- 대체공휴일, 임시휴장, 미국 조기폐장 같은 특수 케이스는 DB 테이블 품질에 의존한다.

## 10. Growth / Price Grade Logic

`fnCalcGrade`는 `STOCK_INVEST_INFO`에 저장된 score들을 합산해 growth/price grade를 계산한다.

Growth score:

```text
growthTotScore = SNP_SCORE + NDQ_SCORE + DWJ_SCORE
```

Price score:

```text
priceTotScore = DXY_SCORE + TNX_SCORE + WTI_SCORE + KRW_SCORE
```

개별 지표 score 방향성:

| Indicator | 계산 방향 |
| --- | --- |
| S&P 500 | 상승 우호 |
| Nasdaq | 상승 우호 |
| Dow | 상승 우호 |
| DXY | 상승 비우호, 하락 우호 |
| TNX | 상승 비우호, 하락 우호 |
| WTI | 상승 우호로 소폭 반영 |
| USD/KRW | 상승 비우호, 하락 우호 |

Growth grade threshold:

| 조건 | Grade |
| --- | --- |
| `> 2.0` | 9 |
| `> 1.4` | 8 |
| `> 1.0` | 7 |
| `> 0.75` | 6 |
| `> 0.54` | 5 |
| `> 0.37` | 4 |
| `> 0.21` | 3 |
| `> 0.05` | 2 |
| `>= 0` | 1 |
| `< -2.5` | -9 |
| `< -1.8` | -8 |
| `< -1.3` | -7 |
| `< -0.95` | -6 |
| `< -0.65` | -5 |
| `< -0.45` | -4 |
| `< -0.28` | -3 |
| `< -0.15` | -2 |
| `< 0` | -1 |

Price grade threshold:

| 조건 | Grade |
| --- | --- |
| `> 1.2` | 9 |
| `> 0.9` | 8 |
| `> 0.65` | 7 |
| `> 0.5` | 6 |
| `> 0.35` | 5 |
| `> 0.22` | 4 |
| `> 0.12` | 3 |
| `> 0.03` | 2 |
| `>= 0` | 1 |
| `< -1.4` | -9 |
| `< -1.0` | -8 |
| `< -0.75` | -7 |
| `< -0.55` | -6 |
| `< -0.4` | -5 |
| `< -0.25` | -4 |
| `< -0.15` | -3 |
| `< -0.05` | -2 |
| `< 0` | -1 |

Dashboard API와 통계 API는 허용 grade를 -9~-1, 1~9로 제한한다. 0 grade는 진단 대상이며 기본 샘플에서는 제외된다.

## 11. Historical Grade Generation

현재 저장소에서 확인되는 historical grade 생성 로직은 두 종류다.

1. 운영 롤업 grade
   - 파일: `server/crawler/lib/services/marketIndicesIFService.js`
   - 함수: `fnCalcGrade`
   - 대상: `STOCK_INVEST_INFO`
   - 역할: daily rollup 후 `PRICE_TOT_SCORE_GRADE`, `GROWTH_TOT_SCORE_GRADE` 등을 계산

2. Weekly recheck stage grade
   - 파일: `server/crawler/lib/services/marketWeeklyRecheckService.js`
   - 함수: `calcGrades`
   - 대상: `STOCK_INVEST_INFO_WEEKLY_STAGE`
   - 역할: Yahoo 기반 stage snapshot 검증

`KOSPI_GRADE_DETAIL_NEW`는 현재 저장소 소스에서 사용처를 찾지 못했다. 따라서 과거 grade 상세 모델, DIBR 모델, 또는 별도 배치가 이 테이블을 썼다면 저장소 밖 구성 요소로 보아야 한다.

주의해야 할 점:

- Weekly recheck의 stock stage는 코드 주석/상수상 production-equivalent rollup이 아니라 Yahoo 기반 sanity snapshot이다.
- 운영 grade의 authoritative source는 현재 코드상 `STOCK_INVEST_INFO`이다.
- 기존 보고서에는 0 grade 문제가 언급되어 있으나, 현재 API 계층은 0 grade를 제외하도록 보정되어 있다.

## 12. STOCK_INVEST_INFO

`STOCK_INVEST_INFO`는 현재 Market Dashboard의 핵심 읽기 테이블이다.

주요 저장 내용:

- KOSPI 기준가/시가/고가/저가/종가 및 등락률
- S&P 500, Nasdaq, Dow, DXY, TNX, WTI, USD/KRW 관련 가격/등락률/score
- 휴일 여부와 성공 여부 flag
- `PRICE_TOT_SCORE`, `GROWTH_TOT_SCORE`
- `PRICE_TOT_SCORE_GRADE`, `GROWTH_TOT_SCORE_GRADE`
- price/growth range group

주요 reader:

- `pages/api/stock-index/dashboard.js`
- `pages/api/stock-index/grade-stats.js`
- `pages/api/stock-index/etf-grade-stats.js`
- `pages/api/market/summary.js`
- `lib/stockIndexCore.js`
- `lib/stockIndexEtfStats.js`
- `lib/stockIndexLegacyEtfStats.js`

`lib/stockIndexCore.js`는 `STOCK_SELECT`로 dashboard/API에서 필요한 컬럼을 표준화해서 읽는다. 이 모듈이 최신 기준일, 최신 사용 가능 기준일, grade range, KOSPI/indicator mapping, warning 생성의 중심이다.

## 13. ETF Selection Logic

현재 ETF 선택 로직은 보수적으로 제한되어 있다.

기본 ETF:

```text
KDX_LVG
KDX_I2X
```

지원 source:

```text
NVR, DMF, YHF, auto, legacy
```

source 처리:

- `legacy`는 `lib/stockIndexLegacyEtfStats.js`로 위임된다.
- `auto`는 current-source 경로에서 source priority를 사용한다.
- current-source priority는 `NVR`, `DMF`, `YHF` 순서다.
- `KSP_LVG`, `KSP_I2X` synthetic proxy는 통계 API에서 직접 사용할 수 없도록 거부된다.

Frontend 기본 호출:

```text
/api/stock-index/etf-grade-stats
  ?source=legacy
  &period=3y
  &rangeMode=near1
  &minSamples=20
  &includeOffsets=1
  &limit=5
```

따라서 실제 기본 화면은 `MARKET_SITE_ETF_STOCK_INFO`가 아니라 legacy `ETF_STOCK_INFO` 기반으로 계산된다.

## 14. Aggressive / Normal / Defensive Logic

현재 저장소의 활성 Market Dashboard 코드에서는 공격형/중립형/방어형 투자 모드가 발견되지 않았다.

확인된 내용:

- `pages/market/indices.js`는 관찰 통계 화면이다.
- `lib/stockIndexEtfStats.js`와 `lib/stockIndexLegacyEtfStats.js`는 ETF별 historical outcome 통계를 계산한다.
- `observationSignal()`은 레버리지와 인버스의 관찰 우위를 비교해 `LEVERAGE_BIAS`, `INVERSE_BIAS`, `MIXED`, `NO_SIGNAL` 같은 관찰 signal을 만든다.
- 이 signal은 투자 권유 또는 매매 지시가 아니라 통계 해석용 문구로 설계되어 있다.

없거나 확인되지 않은 것:

- 공격형/중립형/방어형 포트폴리오 배분표
- 계좌 비중 산출 로직
- 자동 매수/매도 추천 로직
- DIBR 과거 투자성향 모델과의 직접 연결

과거에 이런 구분이 있었다면 `MARKET_RESULT_FOR_DIBR` 등 저장소 밖 DB/배치/구버전 코드에서 복원해야 한다.

## 15. Entry / Stop-loss Logic

현재 코드에서 확인되는 entry 관련 로직은 ETF 일봉 기반 offset 시뮬레이션이다.

Entry offset 후보:

```text
0%, -0.2%, -0.3%, -0.5%, -0.7%, -1.0%, -1.5%, -2.0%
```

계산 방식:

- ETF 전일 종가와 당일 시가/저가/종가를 사용한다.
- 지정 offset 가격이 당일 저가로 체결 가능했는지 일봉 수준에서 추정한다.
- 체결 후 종가 기준 수익률 통계를 계산한다.
- `bestEntryOffset`은 샘플 기반 평균/승률 등을 비교해 관찰상 우위 offset을 고른다.

Stop-loss 관련 판정:

- 명시적 손절 가격, 손절 실행, intraday stop simulation은 현재 활성 코드에서 확인되지 않았다.
- `maxLoss` 류 통계는 관찰 지표로 쓰일 수 있으나, 자동 손절 규칙은 아니다.
- 일봉 저가 기반 offset 시뮬레이션은 실제 체결 순서, 고저가 발생 순서, 슬리피지, 유동성, 수수료를 반영하지 않는다.

따라서 현재 구현은 `entry observation`, `daily bar simulation`에 가깝고, 실전 주문 로직이나 손절 엔진은 아니다.

## 16. MARKET_RESULT_FOR_DIBR

`MARKET_RESULT_FOR_DIBR`는 현재 저장소 소스 검색에서 활성 사용처를 찾지 못했다.

확인 결과:

- Next.js page/API에서 사용처 미확인
- crawler service에서 사용처 미확인
- weekly recheck에서 사용처 미확인
- 현재 감사 스크립트에서도 직접 사용처 미확인

판정:

```text
UNKNOWN / EXTERNAL
```

가능성:

- 과거 DIBR 모델의 결과 테이블
- DB stored procedure 또는 event scheduler 산출 테이블
- 현재 저장소에 포함되지 않은 legacy batch 산출 테이블
- 더 이상 사용하지 않는 테이블

복원을 위해서는 실제 DB schema, row sample, 기존 운영 배치 또는 과거 commit 확인이 필요하다.

## 17. MARKET_ETF_DTL_RST_FOR_DIBR

`MARKET_ETF_DTL_RST_FOR_DIBR`는 현재 저장소에서 감사 스크립트와 기존 보고서에서만 확인된다.

확인된 사용처:

- `scripts/audit_legacy_etf_tables_for_index_signal.js`
- `reports/index-etf-legacy-data-audit.md`
- `reports/index-etf-legacy-source-api-audit.md`

현재 활성 경로:

- `/market/indices` frontend와 직접 연결되지 않는다.
- `/api/stock-index/*` API와 직접 연결되지 않는다.
- daily crawler scheduler와 직접 연결되지 않는다.

기존 보고서 맥락상 이 테이블은 ETF 상세 결과 또는 예약매수 성격의 legacy 결과 테이블로 보인다. 다만 현재 코드 기준으로는 `ETF_STOCK_INFO`보다 dashboard 통계에 바로 쓰기 어렵다고 판단되어 있다.

## 18. ETF_STOCK_RESULT

`ETF_STOCK_RESULT` 역시 현재 활성 dashboard/API/crawler 경로에서는 사용되지 않는다.

확인된 사용처:

- `scripts/audit_legacy_etf_tables_for_index_signal.js`
- 기존 legacy ETF 관련 보고서

기존 보고서 맥락:

- `Y25_KDX_GRADE_*` 같은 result type이 언급된다.
- 이 result type은 현재 `STOCK_INVEST_INFO.PRICE_TOT_SCORE_GRADE`와 `GROWTH_TOT_SCORE_GRADE` 조합과 직접 동일하지 않은 것으로 기록되어 있다.
- 현재 grade 기반 ETF API의 authoritative source는 이 테이블이 아니라 `STOCK_INVEST_INFO` + `ETF_STOCK_INFO` 또는 `MARKET_SITE_ETF_STOCK_INFO` 조합이다.

판정:

```text
LEGACY / NOT ACTIVE FOR CURRENT DASHBOARD
```

## 19. Dashboard Frontend

`pages/market/indices.js`가 Market Dashboard의 현재 프론트 핵심이다.

주요 호출:

- `/api/stock-index/dashboard`
- `/api/stock-index/grade-stats`
- `/api/stock-index/etf-grade-stats`

기본 상태:

- KOSPI period: `3y`
- KOSPI rangeMode: `exact`
- ETF rangeMode: `near1`
- ETF source: `legacy`
- ETF minSamples: `20`
- ETF includeOffsets: `1`

화면 구성:

- 기준일과 장 상태
- KOSPI 기준가/시가/종가
- price/growth grade
- 글로벌 지표 cards
- grade 기반 KOSPI historical stats
- 유사 과거일 목록
- ETF daily observation panel

SEO:

- `SeoHead` 사용
- canonical은 `/market/indices`
- description은 국내외 지표 기반 KOSPI 조건 분석 및 ETF 관찰 통계 성격

문구 성격:

- 화면과 API 모두 투자 권유보다 참고용 통계/관찰에 가깝게 설계되어 있다.

## 20. Daily Execution Timeline

`server/crawler/scheduler.js` 기준 KST 스케줄은 다음과 같다.

| 시각 KST | 작업 | closeFlag | 비고 |
| --- | --- | --- | --- |
| 07:30:20 | BF global collection | - | ECOS/SMBS/Yahoo/Stooq/Frankfurter/FRED/Investing |
| 08:00:20 | BF global collection | - | 재수집/보강 |
| 09:20:20 | BF global collection | - | 개장 이후 전 글로벌 지표 보강 |
| 09:05:20 | AF KOSPI/ETF collection + rollup | false | Naver/Yahoo/Daum 후 `SET_KSP_INV` |
| 10:00:20 | AF KOSPI/ETF collection + rollup | false | 장중 보강 |
| 13:20:20 | AF KOSPI/ETF collection + rollup | false | 장중 보강 |
| 15:50:20 | AF KOSPI/ETF collection + rollup | true | 종가 반영 목적 |
| 22:50:20 | AF KOSPI/ETF collection + rollup | true | 최종 보강 목적 |

`scheduler.js`의 rule은 일요일 값도 포함하지만, 내부 `isWeekday()`가 토/일을 차단한다. 따라서 일반 daily path는 평일 중심으로 작동한다.

## 21. Data Flow Diagrams

Daily market data flow:

```text
External market sources
  -> marketIndicesIFService.js
  -> MARKETS_WORLD_INDICES_INFO
  -> fnSetKspInvestInfo
  -> fnCalcGrade
  -> STOCK_INVEST_INFO
  -> pages/api/stock-index/dashboard.js
  -> pages/api/stock-index/grade-stats.js
  -> pages/market/indices.js
```

KOSPI and ETF intraday/close flow:

```text
Naver / Yahoo Finance / Daum Finance
  -> marketAfterOpenIFService.js
  -> MARKETS_WORLD_INDICES_INFO       KOSPI
  -> MARKET_SITE_ETF_STOCK_INFO       ETF
  -> SET_KSP_INV
  -> STOCK_INVEST_INFO                KOSPI rollup and grade
```

ETF dashboard default flow:

```text
pages/market/indices.js
  -> /api/stock-index/etf-grade-stats?source=legacy
  -> lib/stockIndexLegacyEtfStats.js
  -> STOCK_INVEST_INFO + ETF_STOCK_INFO
  -> ETF observation stats
```

ETF current-source optional flow:

```text
/api/stock-index/etf-grade-stats?source=NVR|DMF|YHF|auto
  -> lib/stockIndexEtfStats.js
  -> STOCK_INVEST_INFO + MARKET_SITE_ETF_STOCK_INFO
  -> ETF observation stats
```

Weekly recheck flow:

```text
server/crawler/scripts/market_weekly_recheck.js
  -> marketWeeklyRecheckService.js
  -> *_WEEKLY_STAGE tables
  -> MARKET_WEEKLY_RECHECK_DIFF
  -> no mutation of main production tables
```

## 22. Active vs Legacy Code

Active code:

- `server/crawler/runner.js`
- `server/crawler/scheduler.js`
- `server/crawler/lib/services/marketIndicesIFService.js`
- `server/crawler/lib/services/marketAfterOpenIFService.js`
- `lib/stockIndexCore.js`
- `lib/stockIndexEtfStats.js`
- `lib/stockIndexLegacyEtfStats.js`
- `pages/api/stock-index/dashboard.js`
- `pages/api/stock-index/grade-stats.js`
- `pages/api/stock-index/etf-grade-stats.js`
- `pages/api/market/summary.js`
- `pages/market/index.js`
- `pages/market/indices.js`

Active but separate validation/ops code:

- `server/crawler/lib/services/marketWeeklyRecheckService.js`
- `server/crawler/scripts/market_weekly_recheck.js`
- `ops/run_market_weekly_recheck.sh`
- `scripts/verify_index_etf_grade_stats.js`

Legacy/manual/inactive candidates:

- `marketIndicesIFService.js`의 `NVR/STD`, `YHF/STD`, `DMF/STD`, `YHF/KHD` 경로
- `marketAfterOpenIFService.js`의 `fetchIndicesInveData`
- `scripts/audit_legacy_etf_tables_for_index_signal.js`
- `ETF_STOCK_RESULT`
- `MARKET_ETF_DTL_RST_FOR_DIBR`
- `MARKET_RESULT_FOR_DIBR`
- `KOSPI_GRADE_DETAIL_NEW`
- synthetic proxy `KSP_LVG`, `KSP_I2X`

## 23. Missing / External Components

저장소만으로 확인할 수 없었던 항목은 다음과 같다.

- production DB의 실제 최신 row/date/freshness
- `MARKETS_WORLD_INDICES_INFO`, `STOCK_INVEST_INFO`, `ETF_STOCK_INFO`의 전체 DDL
- `ETF_STOCK_INFO`를 쓰는 현재 writer
- `ETF_STOCK_RESULT`와 `MARKET_ETF_DTL_RST_FOR_DIBR`를 쓰는 batch/procedure
- `MARKET_RESULT_FOR_DIBR`의 schema, writer, 소비자
- `KOSPI_GRADE_DETAIL_NEW`의 schema, writer, 소비자
- `MARKET_HOLYDAY_INFO` 갱신 주체
- DB event scheduler, stored procedure, trigger 존재 여부
- PM2 외부 cron 또는 Windows Task Scheduler 등록 여부
- ECOS/FRED/Yahoo/Naver/Daum/Investing 실제 응답 안정성
- Cloud/server production environment 변수 실제값

이번 감사에서는 DB 읽기 쿼리도 실행하지 않았으므로, 위 항목은 현재 소스 구조상 gap으로 남겨둔다.

## 24. Risks / Data Quality Concerns

주요 리스크는 다음과 같다.

- API key fallback literal이 소스에 존재한다. 값 노출과 키 교체 운영 리스크가 있다.
- 휴일/거래일 판단이 완전한 exchange calendar가 아니라 휴일 테이블과 weekday heuristic에 의존한다.
- `MARKET_HOLYDAY_INFO` 갱신 실패 시 장전/장후 기준일 산출이 어긋날 수 있다.
- Yahoo/Naver/Daum/Investing/Stooq 페이지 구조 변경 시 수집 실패 가능성이 있다.
- current ETF 데이터와 legacy ETF 데이터가 분리되어 있어 화면 기본값과 최신 수집 테이블이 다를 수 있다.
- `source=legacy` 기본값은 장기 샘플 확보에는 유리하지만 최신 ETF 데이터 반영성은 DB 상태에 의존한다.
- ETF entry offset은 일봉 저가 기반 추정이므로 실제 intraday 체결 가능성과 다를 수 있다.
- 손절/익절/수수료/세금/슬리피지/호가 단위가 통계 계산에 포함되지 않는다.
- weekly recheck의 stock stage는 코드상 production-equivalent rollup이 아니라 Yahoo 기반 sanity snapshot이다.
- `fnSetKspInvestInfo`의 source fallback 상세 쿼리는 실제 row shape에 따라 예외나 null score를 만들 가능성이 있다.
- 0 grade 또는 out-of-range grade가 발생하면 API 통계 대상에서 제외되며, 샘플 수 부족으로 이어질 수 있다.
- `MARKET_RESULT_FOR_DIBR` 등 과거 모델 테이블이 저장소 밖에 있으면 현재 dashboard와 historical model 간 의미 차이가 발생할 수 있다.
- Euro Stoxx 같은 추가 지표가 콘텐츠에 언급되어도 현재 active dashboard pipeline에는 포함되지 않는다.
- production scheduler와 외부 cron이 중복되면 같은 날짜 데이터가 여러 번 갱신될 수 있다.
- crawler 단일 실행 guard는 process 내부 기준이므로, 다중 process/서버 환경에서는 외부 lock이 없으면 중복 실행 가능성이 남는다.

## 25. Questions for Historical Model Reconstruction

과거 투자정보 모델을 복원하려면 다음 질문에 답이 필요하다.

1. `MARKET_RESULT_FOR_DIBR`의 실제 schema와 row sample은 무엇인가?
2. `MARKET_RESULT_FOR_DIBR`를 생성한 배치, stored procedure, 또는 앱 코드는 어디에 있는가?
3. `KOSPI_GRADE_DETAIL_NEW`는 어떤 기준으로 생성되었고 현재 `STOCK_INVEST_INFO` grade와 어떤 관계인가?
4. `ETF_STOCK_RESULT`의 `Y25_KDX_GRADE_*` result type은 어떤 grade 조합과 기간 조건을 의미하는가?
5. `MARKET_ETF_DTL_RST_FOR_DIBR`의 예약매수/상세결과가 현재 ETF offset simulation과 어떤 차이가 있는가?
6. 공격형/중립형/방어형 구분이 있었다면 각 모드의 배분, ETF 선택, 진입 기준은 무엇이었는가?
7. 과거 모델에 stop-loss, take-profit, holding period, re-entry 제한이 있었는가?
8. `ETF_STOCK_INFO`의 현재 writer는 무엇이며 언제까지 최신 데이터가 적재되는가?
9. `MARKET_SITE_ETF_STOCK_INFO`를 dashboard 기본 source로 전환하려는 의도가 있는가?
10. `MARKET_HOLYDAY_INFO`는 수동 관리인가, 외부 API/배치로 갱신되는가?
11. 0 grade row는 계속 제외할 것인가, 별도 neutral bucket으로 해석할 것인가?
12. Euro Stoxx 또는 추가 글로벌 지표를 growth/price score에 포함할 계획이 있는가?
13. weekly recheck를 production-equivalent comparison으로 확장하려면 Yahoo-only stage 외 어떤 source collector가 필요한가?
14. 실제 운영에는 PM2 scheduler 외 cron, Windows Task Scheduler, DB event가 있는가?
15. dashboard의 목적은 참고용 관찰 통계 유지인가, 아니면 향후 명시적 투자 시나리오 도구로 확장인가?
