# Finmap 지수 대시보드 ETF 전략 확장 2.5차 장기 ETF 데이터 활용 점검

작성일: 2026-06-02

## 1. 결론

장기 ETF 일봉 원천인 `ETF_STOCK_INFO`는 `KDX_LVG`, `KDX_I2X`의 실제 OHLC를 장기간 보유하고 있어 2차 API의 표본 부족 문제를 줄이는 데 활용 가능하다. 다만 기존 결과 테이블인 `ETF_STOCK_RESULT`, `MARKET_ETF_DTL_RST_FOR_DIBR`의 `Y25_KDX_GRADE_*` result type은 현재 `STOCK_INVEST_INFO.PRICE_TOT_SCORE_GRADE` / `GROWTH_TOT_SCORE_GRADE`와 동일한 등급 키로 볼 수 없다.

따라서 바로 `/api/stock-index/etf-grade-stats`에 붙이지 말고, 1차로 `ETF_STOCK_INFO`만 별도 legacy source로 정규화해 검증한 뒤 옵션으로 연결하는 것이 안전하다.

## 2. 작업 범위

- 화면 UI 변경 없음
- 기존 2차 API 코드 변경 없음
- 신규 audit 스크립트 추가
- 장기 ETF 테이블 스키마/기간/표본/등급 연결 가능성 점검

추가 파일:

- `scripts/audit_legacy_etf_tables_for_index_signal.js`
- `reports/index-etf-legacy-data-audit.md`

## 3. 점검 대상 테이블별 역할

| 테이블 | 역할 판단 | API 직접 활용 판단 |
|---|---|---|
| `ETF_STOCK_INFO` | 장기 ETF 일봉 OHLC 원천 테이블 | 가능성 높음. 단, legacy source로 분리 필요 |
| `ETF_STOCK_RESULT` | result type별 집계 결과 테이블 | 현재 등급 API에 직접 연결 부적합 |
| `MARKET_ETF_DTL_RST_FOR_DIBR` | 예약매수/체결 여부/상세 결과 테이블 | 기존 실험 결과 분석용. 현재 open-close 통계 원천으로 부적합 |
| `STOCK_INVEST_INFO` | KOSPI OHLC 및 현재 가격/성장 등급 기준 | 날짜 조인의 기준 테이블 |
| `MARKET_SITE_ETF_STOCK_INFO` | 2차 API의 현재 source별 ETF 일봉 테이블 | 기본 source 유지 |

## 4. 컬럼 구조 요약

### `ETF_STOCK_INFO`

주요 컬럼:

- `ETF_STOCK_DATE` varchar(10), PK
- `ETF_STOCK_ID` varchar(20), PK
- `ETF_STOCK_NAME`
- `ETF_BF_STOCK_DATE`
- `ETF_BEF_CLOSE_PRICE`
- `ETF_OPEN_PRICE`
- `ETF_HIGH_PRICE`
- `ETF_LOW_PRICE`
- `ETF_CLOSE_PRICE`
- `ETF_TODAY_DIFF_PRICE`
- `ETF_UD_RATE_REAL_BY_TODAY`
- `ETF_UD_RATE_REAL_BY_OPEN`
- `ETF_UD_RATE_REAL_BY_CLOSE`
- `ETF_UD_RATE_REAL_BY_LOW`
- `ETF_UD_RATE_REAL_BY_HIGH`
- `ETF_STOCK_GROUP`
- `ETF_STOCK_TYPE`
- `created_at`, `updated_at`

source 컬럼은 없다. 즉, `MARKET_SITE_ETF_STOCK_INFO`의 `NVR`, `DMF`, `YHF`처럼 출처를 API 파라미터로 직접 비교할 수 없다.

### `ETF_STOCK_RESULT`

주요 컬럼:

- `ETF_STOCK_DATE` varchar(10), PK
- `ETF_STOCK_GROUP` varchar(20), PK
- `ETF_STOCK_RESULT_TYPE` varchar(30), PK
- `ETF_TODAY_RESULT_RATE`
- `ETF_MONTH_AGGREGATE_RATE`
- `ETF_YEAR_AGGREGATE_RATE`
- `ETF_TODAY_RESULT_REVENUE`
- 월/연 집계 가격 및 V3/V5 변형 컬럼
- `created_at`, `updated_at`

OHLC 컬럼은 없다. `KDX_LVG`, `KDX_I2X` 개별 ID도 직접 저장하지 않고 `KDX`, `KSP`, `KBS`, `KSF`, `PLS`, `TGR` 같은 group 단위로 저장한다.

### `MARKET_ETF_DTL_RST_FOR_DIBR`

주요 컬럼:

- `MARKET_RESULT_ID` varchar(30), PK
- `ETF_STOCK_DATE` varchar(10), PK
- `ETF_RSV_BUY_RATE`
- `ETF_RSV_BUY_PRC`
- `ETF_TODAY_CONCL_YN`
- `ETF_TODAY_RESULT_RATE`
- `ETF_TODAY_RESULT_REVENUE_1`
- `ETF_TODAY_RESULT_REVENUE_3`
- `ETF_TODAY_RESULT_REVENUE_5`
- `ETF_STOCK_GROUP` varchar(10), PK
- `ETF_STOCK_TYPE`
- `created_at`, `updated_at`

이 테이블은 예약매수율/예약매수가/당일 체결 여부/결과율을 갖는 상세 결과 테이블이다. `ETF_STOCK_GROUP=KDX`, `ETF_STOCK_TYPE=L/I`로 KODEX 레버리지/인버스 계열을 간접 구분할 수 있지만, 원시 OHLC가 아니라 기존 전략 계산 결과다.

### `STOCK_INVEST_INFO`

관련 컬럼:

- `KSP_STOCK_DATE`
- `KSP_BEF_CLOSE_PRICE`
- `KSP_OPEN_PRICE`
- `KSP_HIGH_PRICE`
- `KSP_LOW_PRICE`
- `KSP_CLOSE_PRICE`
- `PRICE_TOT_SCORE`
- `GROWTH_TOT_SCORE`
- `PRICE_TOT_SCORE_GRADE`
- `GROWTH_TOT_SCORE_GRADE`
- `PRC_SET_RNG_GRP`
- `PARENT_GROWTH_TOT_SCORE_GRADE`
- `PARENT_PRC_SET_RNG_GRP`
- `IF_SUCC_YN`
- `updated_at`

현재 지수 대시보드 등급 기준은 `PRICE_TOT_SCORE_GRADE`, `GROWTH_TOT_SCORE_GRADE`다.

## 5. 기간과 row 수

| 테이블 | rows | 기간 | 비고 |
|---|---:|---|---|
| `ETF_STOCK_INFO` | 35,787 | 2000-01-04 ~ 2025-10-29 | full OHLC 35,519 |
| `ETF_STOCK_RESULT` | 107,452 | 2000-01-05 ~ 2025-09-24 | result type 10개, 전부 `Y25_KDX_GRADE_*` |
| `MARKET_ETF_DTL_RST_FOR_DIBR` | 107,460 | 2000-01-05 ~ 2025-09-24 | result type 10개, 전부 `Y25_KDX_GRADE_*` |
| `STOCK_INVEST_INFO` | 6,520 | 2000-01-05 ~ 2026-06-02 | 현재 등급 기준 |
| `MARKET_SITE_ETF_STOCK_INFO` | 7,995 | 2024-12-31 ~ 2026-06-02 | source: YHF 3,111, NVR 3,030, DMF 1,854 |

## 6. KDX_LVG / KDX_I2X 매핑

### `ETF_STOCK_INFO`

`ETF_STOCK_ID`에 실제 내부 ETF ID가 직접 존재한다.

| ETF | 이름 | group/type | rows | 기간 | full OHLC |
|---|---|---|---:|---|---:|
| `KDX_LVG` | KODEX Leverage / KODEX 레버리지 | `KDX` / `L` | 3,871 | 2010-02-22 ~ 2025-10-29 | 3,871 |
| `KDX_I2X` | KODEX 200Futures Inverse2X / KODEX 200선물 인버스2X | `KDX` / `I` | 2,243 | 2016-09-22 ~ 2025-10-29 | 2,243 |

거래소 코드 `122630`, `252670` 형태가 아니라 기존 내부 ID `KDX_LVG`, `KDX_I2X`로 저장되어 있다. 2차 API의 기본 ETF ID와 맞아 매핑은 쉽다.

### `ETF_STOCK_RESULT`

개별 ETF ID는 없고 `ETF_STOCK_GROUP=KDX` 단위가 있다.

- `KDX` rows: 15,645
- 기간: 2016-09-22 ~ 2025-09-24
- result type count: 10

개별 레버리지/인버스2X open-close 통계 원천으로는 부적합하다.

### `MARKET_ETF_DTL_RST_FOR_DIBR`

`ETF_STOCK_GROUP=KDX`, `ETF_STOCK_TYPE=L/I`로 구분 가능하다.

| group/type | 의미 추정 | rows | 기간 |
|---|---|---:|---|
| `KDX` / `L` | KODEX 레버리지 계열 | 6,383 | 2016-09-23 ~ 2025-09-24 |
| `KDX` / `I` | KODEX 인버스2X 계열 | 9,262 | 2016-09-22 ~ 2025-09-23 |

다만 이 테이블은 원시 OHLC가 아니라 기존 예약매수 결과다. 현재 API의 open-close 통계를 직접 재현하는 원천으로 쓰면 안 된다.

## 7. 현재 등급 체계와 연결 가능 여부

### 날짜 조인

`ETF_STOCK_INFO`는 다음 방식으로 현재 등급과 날짜 조인이 가능하다.

```sql
STOCK_INVEST_INFO.KSP_STOCK_DATE = ETF_STOCK_INFO.ETF_STOCK_DATE
```

현재 등급 필터:

- `PRICE_TOT_SCORE_GRADE`
- `GROWTH_TOT_SCORE_GRADE`
- `gradeRange()`의 exact/near1/near2 부호 유지 방식

### `Y25_KDX_GRADE_*` result type 검증

`ETF_STOCK_RESULT`와 `MARKET_ETF_DTL_RST_FOR_DIBR`에는 10개 result type이 있다.

- `Y25_KDX_GRADE_CF`
- `Y25_KDX_GRADE_FW`
- `Y25_KDX_GRADE_MF`
- `Y25_KDX_GRADE_CF_NEW`
- `Y25_KDX_GRADE_FW_NEW`
- `Y25_KDX_GRADE_MF_NEW`
- `Y25_KDX_GRADE_FR_NEW`
- `Y25_KDX_GRADE_CF_LST`
- `Y25_KDX_GRADE_FW_LST`
- `Y25_KDX_GRADE_MF_LST`

이 result type들을 `STOCK_INVEST_INFO`의 현재 등급과 날짜 조인해 보니, 대부분의 result type이 현재 등급 조합 144개에 걸쳐 있었다. `_LST` 계열도 58개 현재 등급 조합에 걸쳐 있었다.

즉, `Y25_KDX_GRADE_*`는 현재 `P-5/G+4` 같은 가격등급/성장등급 한 쌍을 의미하지 않는다. 기존 산식이나 bucket 기준이 현재 대시보드 등급과 같다고 볼 수 없으므로, 현재 API의 등급 조건으로 직접 해석하면 위험하다.

## 8. 표본 수 비교

검증 기준:

- 기준일: 2026-06-01
- 현재 등급: `P-5/G+4`
- 기간: 3년, 2023-06-01 ~ 2026-05-31
- ETF: `KDX_LVG`, `KDX_I2X`
- 표본 수: 두 ETF가 모두 OHLC를 가진 공통 거래일 기준

| rangeMode | 현재 API NVR matchedDays | `ETF_STOCK_INFO` commonDays | 증가 |
|---|---:|---:|---:|
| exact | 1 | 1 | 0 |
| near1 | 3 | 26 | +23 |
| near2 | 9 | 48 | +39 |

비율로 보면:

- exact: 1.0배
- near1: 약 8.7배
- near2: 약 5.3배

near1부터는 2차 API 기본 `minSamples=20`을 넘는다. exact는 여전히 부족하다.

## 9. open-close 통계 재현 가능성

`ETF_STOCK_INFO`에는 다음 컬럼이 모두 있다.

- `ETF_BEF_CLOSE_PRICE`
- `ETF_OPEN_PRICE`
- `ETF_HIGH_PRICE`
- `ETF_LOW_PRICE`
- `ETF_CLOSE_PRICE`

따라서 2차 API의 다음 계산은 재현 가능하다.

- ETF 시가 대비 종가 수익률
- 전일종가 대비 시초가 gap
- 전일종가 대비 종가 변화
- 일봉 저가 기반 entry offset 체결 가정
- win/loss/flat, 평균, 중앙값, 최대/최소 수익률

단, `ETF_STOCK_INFO`에는 source 컬럼이 없으므로 `NVR/DMF/YHF`와 같은 source 비교는 불가능하다. API에 붙인다면 `source=legacy` 또는 `source=legacy_etf_stock_info`처럼 별도 원천으로 분리해야 한다.

## 10. 가격 단위/결측 일관성

`ETF_STOCK_INFO`와 `MARKET_SITE_ETF_STOCK_INFO`의 NVR 중복 구간을 비교했다.

중복 구간:

- 2025-06-26 ~ 2025-10-29
- 각 ETF 98 rows

결과:

| ETF | overlap rows | close ratio avg/min/max | open-close pct diff avg |
|---|---:|---:|---:|
| `KDX_LVG` | 98 | 1 / 1 / 1 | 0 |
| `KDX_I2X` | 98 | 1 / 1 / 1 | 0 |

중복 구간에서는 가격 단위와 open-close 수익률이 일치했다. 다만 장기 테이블에는 source 컬럼이 없고, 2025-10-29 이후 데이터가 없다. 현재 테이블과 합칠 때는 중복일 처리와 source 우선순위를 명확히 해야 한다.

## 11. 바로 API/화면에 쓰면 위험한 이유

1. `Y25_KDX_GRADE_*` result type은 현재 가격/성장 등급과 동일하지 않다.
2. `ETF_STOCK_RESULT`는 개별 ETF OHLC가 아니라 group/result type 집계 결과다.
3. `MARKET_ETF_DTL_RST_FOR_DIBR`는 예약매수 상세 결과라 기존 전략 가정이 섞여 있다.
4. `ETF_STOCK_INFO`에는 source가 없어 현재 API의 source 품질 비교와 다른 의미가 된다.
5. `ETF_STOCK_INFO`는 2025-10-29에서 끊기고, 현재 테이블은 2026-06-02까지 있다.
6. 장기+현재를 단순 union하면 중복 거래일이 생긴다.
7. 표본 수가 늘어도 일봉 저가 기반 체결 가정 한계는 그대로다.
8. 표본 증가를 방향성 우위나 매수 신호처럼 보여주면 투자 추천으로 오해될 수 있다.

## 12. 권장 구현안

### 1안: current source 유지

기본 API 동작은 지금처럼 `MARKET_SITE_ETF_STOCK_INFO`를 사용한다.

- 장점: source 기준 명확, 현재 수집 구조와 일관
- 단점: 표본 부족 지속
- 권장: 기본값으로 유지

### 2안: legacy source 별도 API 옵션 추가

추후 API에 별도 옵션을 추가한다.

예:

```text
source=legacy
```

또는 더 명확하게:

```text
source=legacy_etf_stock_info
```

동작 원칙:

- 기본값은 계속 `auto` 또는 `NVR`
- legacy는 명시 요청에서만 사용
- 응답에 `LEGACY_DATA_SOURCE`, `SOURCE_HAS_NO_PROVIDER_FIELD`, `DAILY_BAR_SIMULATION_ONLY`, `NOT_INVESTMENT_ADVICE` warning 추가
- `Y25_KDX_GRADE_*` result table은 사용하지 않고 `ETF_STOCK_INFO` 원시 OHLC만 사용

### 3안: 신규 normalized 테이블로 이관

장기적으로는 별도 정규화 테이블을 만드는 방식이 가장 안전하다.

후보:

```text
INDEX_ETF_DAILY_OHLC_NORMALIZED
```

권장 컬럼:

- `trade_date`
- `etf_id`
- `ticker`
- `name`
- `source`
- `source_table`
- `open`
- `high`
- `low`
- `close`
- `prev_close`
- `stock_group`
- `stock_type`
- `is_adjusted_price`
- `updated_at`

정규화 규칙:

- `ETF_STOCK_INFO.ETF_STOCK_ID`를 우선 사용
- `KDX_LVG`, `KDX_I2X`만 1차 지원
- source는 `LEGACY_ETF_STOCK_INFO`로 고정
- 중복일은 기본적으로 `MARKET_SITE_ETF_STOCK_INFO`의 최신 source를 우선
- OHLC/prevClose null 또는 0 이하 row 제외
- 일봉 offset 계산에는 `low` 필수

## 13. 2차 API에 붙일 수 있는지 여부

직접 연결은 아직 비권장이다.

가능한 안전한 연결 조건:

1. `ETF_STOCK_INFO`만 사용한다.
2. `ETF_STOCK_RESULT`, `MARKET_ETF_DTL_RST_FOR_DIBR`는 current grade 통계 원천으로 쓰지 않는다.
3. `source=legacy` 같은 명시 옵션에서만 동작한다.
4. 기존 `source=auto/NVR/DMF/YHF` 동작은 그대로 둔다.
5. 응답에 legacy source 경고와 투자 유의 문구를 추가한다.
6. 보고서/검증 스크립트 기준 표본 수와 가격 일관성을 재검증한다.

## 14. 다음 작업 제안

1. `lib/stockIndexEtfStats.js`에 바로 붙이지 말고, `lib/stockIndexLegacyEtfStats.js` 어댑터를 별도 작성한다.
2. `ETF_STOCK_INFO` 기준으로 2차 API와 동일한 응답 shape을 생성하는 내부 함수만 먼저 만든다.
3. `source=legacy`를 API 옵션으로 추가하되 기본값에는 포함하지 않는다.
4. near1/near2에서 `minSamples` 통과 시에도 label은 "관찰 통계"로만 표시하고, 매수/매도 신호 문구는 계속 금지한다.
5. 장기적으로 normalized 테이블을 만들고 current/legacy source를 한 테이블에서 검증 가능하게 합친다.

## 15. 검증 명령

실행한 명령:

```bash
node --check scripts\audit_legacy_etf_tables_for_index_signal.js
node scripts\audit_legacy_etf_tables_for_index_signal.js
git diff --check
```

보조 확인 쿼리:

- `ETF_STOCK_RESULT`의 result type/group 요약
- `MARKET_ETF_DTL_RST_FOR_DIBR`의 result type/group/type 요약
- `ETF_STOCK_INFO`의 `KDX_LVG`, `KDX_I2X` group/type 매핑

화면과 기존 API는 수정하지 않았다.
