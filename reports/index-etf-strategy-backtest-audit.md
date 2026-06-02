# Finmap 지수 대시보드 ETF 전략 확장 2차 API/백테스트 코어 점검

작성일: 2026-06-02

## 1. 작업 요약

1차 데이터 점검 결과를 바탕으로, 기존 지수 대시보드 API 응답을 변경하지 않고 별도 ETF 등급 통계 API와 검증 스크립트를 추가했다.

- 신규 API: `GET /api/stock-index/etf-grade-stats`
- 신규 코어: `lib/stockIndexEtfStats.js`
- 신규 검증 스크립트: `scripts/verify_index_etf_grade_stats.js`
- 화면 변경: 없음
- 기존 `/api/stock-index/grade-stats`, `/api/stock-index/dashboard` 응답 구조 변경: 없음

이 기능은 투자 추천이 아니라 `STOCK_INVEST_INFO`의 가격등급/성장등급과 실제 KODEX ETF 일봉 OHLC를 조인해 "과거 동일 등급 조건에서 ETF가 시가 대비 종가에 어떻게 움직였는지"를 집계한다.

## 2. 변경 파일

| 파일 | 구분 | 내용 |
|---|---|---|
| `lib/stockIndexEtfStats.js` | 신규 | ETF 등급 통계 코어. 날짜/등급/소스/ETF 파라미터 검증, DB 조인, 소스 선택, open-close 통계, entry offset 시뮬레이션, 관찰 신호 생성 |
| `pages/api/stock-index/etf-grade-stats.js` | 신규 | 별도 API 라우트. 기존 지수 API와 같은 GET/캐시/에러 처리 패턴 사용 |
| `scripts/verify_index_etf_grade_stats.js` | 신규 | DB 기준 검증 스크립트. exact/near1/near2, NVR/auto, 표본 부족 신호 억제 확인 |
| `reports/index-etf-strategy-backtest-audit.md` | 신규 | 2차 API/백테스트 코어 점검 보고서 |

## 3. 사용 DB 테이블과 컬럼

### `STOCK_INVEST_INFO`

사용 목적: KOSPI 기준일, KOSPI OHLC, 가격등급/성장등급 기준 데이터.

주요 사용 컬럼:

- `KSP_STOCK_DATE`
- `KSP_BEF_CLOSE_PRICE`
- `KSP_OPEN_PRICE`
- `KSP_HIGH_PRICE`
- `KSP_LOW_PRICE`
- `KSP_CLOSE_PRICE`
- `PRICE_TOT_SCORE_GRADE`
- `GROWTH_TOT_SCORE_GRADE`
- `updated_at`

### `MARKET_SITE_ETF_STOCK_INFO`

사용 목적: 실제 ETF source별 일봉 OHLC.

주요 사용 컬럼:

- `ETF_STOCK_DATE`
- `ETF_STOCK_ID`
- `ETF_STOCK_NAME`
- `ETF_SITE_ID`
- `ETF_SITE_NAME`
- `ETF_BEF_CLOSE_PRICE`
- `ETF_OPEN_PRICE`
- `ETF_HIGH_PRICE`
- `ETF_LOW_PRICE`
- `ETF_CLOSE_PRICE`
- `updated_at`

## 4. 조인과 필터

거래일 조인 기준:

```sql
STOCK_INVEST_INFO.KSP_STOCK_DATE = MARKET_SITE_ETF_STOCK_INFO.ETF_STOCK_DATE
```

통계 표본 필터:

- 기준일 이후 데이터 제외: `sii.KSP_STOCK_DATE < selectedDate`
- `PRICE_TOT_SCORE_GRADE IS NOT NULL`
- `GROWTH_TOT_SCORE_GRADE IS NOT NULL`
- 등급 범위: exact/near1/near2에 따라 `gradeRange()` 적용
- `KSP_BEF_CLOSE_PRICE`, `KSP_OPEN_PRICE`, `KSP_CLOSE_PRICE` 필요
- `ETF_BEF_CLOSE_PRICE`, `ETF_OPEN_PRICE`, `ETF_CLOSE_PRICE` 필요
- `includeOffsets=1`일 때 `ETF_LOW_PRICE` 필요
- `ETF_STOCK_ID`는 기본 `KDX_LVG,KDX_I2X`
- proxy ID `KSP_LVG`, `KSP_I2X`는 API에서 거부

## 5. API 파라미터

`GET /api/stock-index/etf-grade-stats`

| 파라미터 | 값 | 기본값 | 설명 |
|---|---|---|---|
| `date` | `YYYY-MM-DD` | 최신 사용 가능 등급일 | 등급 기준일 |
| `period` | `1y`, `3y`, `5y`, `all` | `3y` | 과거 표본 기간 |
| `rangeMode` | `exact`, `near1`, `near2` | `exact` | 동일 등급 또는 근접 등급 |
| `source` | `NVR`, `DMF`, `YHF`, `auto` | `auto` | ETF 데이터 소스 |
| `etfs` | comma-separated | `KDX_LVG,KDX_I2X` | 실제 KODEX ETF ID |
| `minSamples` | number | `20` | 관찰 신호/offset 후보 최소 표본 |
| `includeOffsets` | `1`, `0` | `1` | 저가 기반 entry offset 시뮬레이션 포함 여부 |
| `limit` | number | `20` | 유사 과거일 반환 개수 |

## 6. 소스 선택 기준

`source=auto`는 NVR을 우선한다. 다만 NVR의 matchedDays가 `minSamples`보다 작으면 DMF/YHF도 함께 계산하고, 소스별 표본 정보를 `sources` 배열에 포함한다.

선택 규칙:

1. NVR matchedDays >= minSamples이면 NVR 선택
2. 그렇지 않으면 matchedDays가 가장 큰 source 선택
3. 동률이면 matchedFullOhlcDays 우선
4. 다시 동률이면 latestDate 우선
5. 다시 동률이면 NVR > DMF > YHF 순서

이번 검증에서는 exact/near1/near2 모두 NVR, DMF, YHF의 matchedDays가 같아 NVR이 선택되었다. NVR 표본이 `minSamples=20`보다 작아 `AUTO_NVR_BELOW_MIN_SAMPLE` 경고를 붙인다.

## 7. 등급 범위 기준

기존 `lib/stockIndexCore.js`의 `gradeRange()`를 재사용한다.

- `exact`: 같은 가격등급, 같은 성장등급
- `near1`: 각 등급 절댓값 기준 ±1
- `near2`: 각 등급 절댓값 기준 ±2
- 등급 부호는 유지한다.
- 0등급은 제외한다.

예: `P-5/G+4`, `near1`이면 가격등급은 `-6,-5,-4`, 성장등급은 `+3,+4,+5` 범위가 된다.

## 8. 계산 항목

### 기준일 정보

- `date`: 요청 또는 기본 선택 기준일
- `effectiveStatsDate`: 실제 등급을 읽은 기준일
- `sampleLatestDate`: 통계 표본에 포함된 가장 최근 과거 거래일
- `priceGrade`, `growthGrade`, `combinedGradeLabel`
- KOSPI 전일종가/시가/고가/저가/종가
- KOSPI 전일종가 대비 시초가 등락률
- KOSPI 시가 대비 종가 등락률

### ETF open-close 통계

ETF별로 계산한다.

- `sampleCount`
- `avgOpenToClosePct`
- `medianOpenToClosePct`
- `winRate`, `lossRate`, `flatRate`
- `maxGainPct`, `maxLossPct`
- `avgPrevCloseToOpenPct`, `medianPrevCloseToOpenPct`
- `avgPrevCloseToClosePct`, `medianPrevCloseToClosePct`

### Gap group

KOSPI:

- `KOSPI_GAP_UP_STRONG`: 시초가 +1% 이상
- `KOSPI_GAP_UP_WEAK`: 0% 초과, +1% 미만
- `KOSPI_FLAT`: 0%
- `KOSPI_GAP_DOWN_WEAK`: -1% 초과, 0% 미만
- `KOSPI_GAP_DOWN_STRONG`: -1% 이하

ETF:

- `ETF_GAP_UP_STRONG`
- `ETF_GAP_UP_WEAK`
- `ETF_FLAT`
- `ETF_GAP_DOWN_WEAK`
- `ETF_GAP_DOWN_STRONG`

### Entry offset 시뮬레이션

사용 offset:

```js
[0, -0.2, -0.3, -0.5, -0.7, -1.0, -1.5, -2.0]
```

계산식:

```text
entryPrice = ETF_OPEN_PRICE * (1 + offsetPct / 100)
returnPct = (ETF_CLOSE_PRICE / entryPrice - 1) * 100
```

체결 가정:

- offset `0`: 항상 체결
- 음수 offset: `ETF_LOW_PRICE <= entryPrice`이면 체결로 본다.

주의: 일봉 저가만으로 체결 여부를 가정하므로 실제 주문 체결, 호가, 체결 순서, 슬리피지, 수수료는 반영하지 않는다.

### Best entry offset 기준

후보 조건:

- `filledCount >= minSamples`
- `fillRate >= 15`
- `avgReturnPct > 0`
- `medianReturnPct > 0`
- `maxLossPct > -5`

후보가 있으면 `expectedReturnPct = avgReturnPct * fillRate / 100`이 가장 높은 offset을 표시한다. 후보가 없으면 `bestEntryOffset=null`과 사유를 반환한다.

이 값은 매수 가격 추천이 아니라 과거 표본 조건을 통과한 시뮬레이션 후보 표시다.

## 9. 관찰 신호 기준

코드:

- `LEVERAGE_BIAS`
- `INVERSE_BIAS`
- `MIXED`
- `NO_SIGNAL`

기본 ETF 두 개 중 하나라도 `sampleCount < minSamples`이면 `NO_SIGNAL`로 억제한다.

표본이 충분할 때만 두 ETF의 평균 open-close 수익률, 중앙값, 승률을 비교한다. 응답 label은 `레버리지 우세 관찰`, `인버스2X 우세 관찰`, `혼합 관찰`, `표본 부족/관찰 우위 없음`처럼 관찰 표현만 사용한다.

## 10. 검증 실행 결과

명령:

```bash
node scripts\verify_index_etf_grade_stats.js
```

실행 기준:

- 기준일: `2026-06-01`
- 등급: `P-5/G+4`
- 기간: `3y`
- 기본 ETF: `KDX_LVG`, `KDX_I2X`
- 기본 `minSamples`: `20`
- 기준일 자체는 표본에서 제외하고 `KSP_STOCK_DATE < 2026-06-01`만 집계

### NVR 결과

| rangeMode | raw joined rows | matchedDays | full OHLC days | null OHLC excluded | sampleLatestDate | signal |
|---|---:|---:|---:|---:|---|---|
| exact | 2 | 1 | 1 | 0 | 2026-05-25 | `NO_SIGNAL` |
| near1 | 6 | 3 | 3 | 0 | 2026-05-25 | `NO_SIGNAL` |
| near2 | 18 | 9 | 9 | 0 | 2026-05-25 | `NO_SIGNAL` |

### auto 결과

| rangeMode | selected source | NVR | DMF | YHF | signal |
|---|---|---:|---:|---:|---|
| exact | NVR | 1 | 1 | 1 | `NO_SIGNAL` |
| near1 | NVR | 3 | 3 | 3 | `NO_SIGNAL` |
| near2 | NVR | 9 | 9 | 9 | `NO_SIGNAL` |

NVR 표본이 `minSamples=20`보다 작아 DMF/YHF도 계산했지만, 세 source가 같은 matchedDays라 NVR이 선택되었다.

### near2 ETF별 핵심 통계

| ETF | sampleCount | avg open-close | median open-close | winRate | bestEntryOffset |
|---|---:|---:|---:|---:|---|
| KDX_LVG | 9 | -1.57% | -0.77% | 44.44% | null |
| KDX_I2X | 9 | +1.54% | +0.52% | 55.56% | null |

`KDX_I2X` near2 일부 offset의 평균값은 양수였지만, `filledCount >= 20` 조건을 만족하지 못해 `bestEntryOffset`은 null이다.

### 표본 부족 억제 확인

`minSamples=500`으로 실행한 검증에서 `matchedDays=1`, `signal=NO_SIGNAL`, reason=`sample_below_minimum_500`으로 확인되었다.

## 11. 현재 데이터로 가능한 범위

가능:

- KOSPI 등급과 실제 KODEX ETF 일봉을 같은 거래일로 조인
- 동일/근접 등급의 과거 ETF 시가 대비 종가 통계
- 전일종가 대비 ETF 시초가 gap 통계
- 일봉 저가 기반 entry offset 충족 여부 가정
- source별 표본 수, 결측 제외 row 수 노출
- 표본 부족 시 관찰 신호 억제

불충분:

- 현재 실제 ETF 일봉 수집 기간이 짧아 exact/near1/near2 모두 표본이 작다.
- 이번 기준일 `P-5/G+4`에서는 `minSamples=20`을 만족하지 못했다.
- 일봉만으로는 장중 체결 순서, 실제 호가, 슬리피지, 수수료, 체결 가능 수량을 검증할 수 없다.

## 12. 분봉/틱 데이터가 있어야 가능한 계산

분봉 또는 틱 데이터가 있어야 가능한 항목:

- 시초가 이후 특정 시간 진입 조건
- 저가 도달 시점과 종가 전 반등/추가 하락 순서 확인
- limit order 실제 체결 가능성
- 장중 stop-loss, take-profit, trailing 조건
- 시초가 gap 이후 5분/30분/오후장 구간별 성과
- 거래량 급증, 호가 스프레드, 유동성 기반 필터
- 레버리지 ETF 괴리율/추적오차 기반 장중 필터

## 13. 추가로 필요한 DB 컬럼/테이블

2차 API는 신규 DB 변경 없이 구현했다. 다음 단계에서 정밀도를 높이려면 별도 테이블이 필요하다.

후보 테이블:

- `MARKET_SITE_ETF_INTRADAY_BARS`
- `MARKET_SITE_INDEX_INTRADAY_BARS`
- `ETF_SIMULATION_RUN_HISTORY`

intraday bars 권장 컬럼:

- `trade_date`
- `symbol` 또는 `etf_stock_id`
- `source`
- `interval`
- `bar_time`
- `open`
- `high`
- `low`
- `close`
- `volume`
- `updated_at`

시뮬레이션 기록 권장 컬럼:

- `run_id`
- `base_date`
- `period`
- `range_mode`
- `source`
- `etf_ids`
- `min_samples`
- `result_json`
- `created_at`

## 14. 투자 유의 문구 제안

API 응답에는 다음 문구를 포함했다.

```text
KODEX 레버리지와 KODEX 200선물인버스2X는 고위험 레버리지·인버스 ETF입니다. 이 응답은 과거 동일 등급 조건의 일봉 시뮬레이션이며 매수·매도 추천이나 수익 보장이 아닙니다.
```

화면에 붙일 때는 다음처럼 짧게 표시할 수 있다.

```text
이 통계는 과거 동일 조건의 일봉 시뮬레이션입니다. 레버리지·인버스 ETF는 손실 위험이 큰 상품이며, 본 화면은 매수·매도 추천이나 수익 보장이 아닙니다.
```

## 15. 구현하면 안 되는 위험한 표현

피해야 할 표현:

- "오늘은 KODEX 레버리지를 매수"
- "인버스2X 추천"
- "수익 확률이 높다"
- "안전한 진입가"
- "최적 매수가"
- "확정 수익"
- "승률 보장"
- "따라 사면 된다"
- "손실 가능성이 낮다"
- "오늘의 종목 추천"

대체 표현:

- "과거 동일 조건 통계"
- "관찰 신호"
- "일봉 기준 시뮬레이션"
- "표본 부족"
- "관찰 우위 없음"
- "실제 체결을 보장하지 않음"

## 16. 3차 구현 제안

1. 화면에는 먼저 API 결과를 숨김/개발자 확인용으로 붙이고, 투자 문구 QA를 한 번 더 한다.
2. `minSamples` 미달이면 방향성 label을 노출하지 않고 표본 부족 안내만 보여준다.
3. intraday 데이터 수집 가능성을 별도 점검한 뒤, 분봉 기반 체결 시뮬레이션을 별도 API로 분리한다.
4. DB 인덱스 점검: `STOCK_INVEST_INFO(PRICE_TOT_SCORE_GRADE, GROWTH_TOT_SCORE_GRADE, KSP_STOCK_DATE)`, `MARKET_SITE_ETF_STOCK_INFO(ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID)`.
5. 화면 구현 전 API 응답 문구에서 추천처럼 읽힐 수 있는 표현을 한 번 더 제거한다.
