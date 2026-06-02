# Finmap 지수 대시보드 ETF 전략 확장 3차 legacy source API 연결 보고서

작성일: 2026-06-02

## 1. 작업 요약

2.5차 점검 결과에 따라 장기 ETF OHLC 원천인 `ETF_STOCK_INFO`를 `/api/stock-index/etf-grade-stats`에 명시적 legacy source 옵션으로 연결했다.

화면 UI는 수정하지 않았다. 기존 `source=auto`, `source=NVR`, `source=DMF`, `source=YHF` 동작도 유지했다. 기존 `/api/stock-index/grade-stats`, `/api/stock-index/dashboard`는 수정하지 않았다.

## 2. 변경 파일

| 파일 | 내용 |
|---|---|
| `lib/stockIndexLegacyEtfStats.js` | 신규 legacy source 어댑터. `ETF_STOCK_INFO`와 `STOCK_INVEST_INFO`를 날짜 조인해 기존 ETF 통계 응답 shape에 맞게 계산 |
| `lib/stockIndexEtfStats.js` | `source=legacy`, `source=legacy_etf_stock_info` 파싱 및 legacy 어댑터 위임 추가 |
| `scripts/verify_index_etf_grade_stats.js` | current NVR 기준 유지 확인, legacy exact/near1/near2 실행, warning/proxy/unsupported 검증 추가 |
| `reports/index-etf-legacy-source-api-audit.md` | 본 보고서 |

## 3. source 옵션

추가된 query 값:

- `source=legacy`
- `source=legacy_etf_stock_info`

두 값은 내부적으로 같은 legacy 경로로 정규화된다.

응답 주요 필드:

```json
{
  "source": "LEGACY_ETF_STOCK_INFO",
  "sourceRequested": "legacy",
  "legacy": true,
  "legacyMaxDate": "2025-10-29",
  "sourceDescriptionKo": "ETF_STOCK_INFO 장기 일봉 원천",
  "sourceDescriptionEn": "Legacy daily ETF OHLC source"
}
```

## 4. 사용 테이블과 컬럼

legacy source는 `ETF_STOCK_INFO`만 ETF 원천으로 사용한다. `ETF_STOCK_RESULT`, `MARKET_ETF_DTL_RST_FOR_DIBR`는 이번 API 통계 원천으로 사용하지 않는다.

컬럼 매핑:

| 응답/계산 필드 | legacy 컬럼 |
|---|---|
| date | `ETF_STOCK_DATE` |
| etfId | `ETF_STOCK_ID` |
| name | `ETF_STOCK_NAME` |
| prevClose | `ETF_BEF_CLOSE_PRICE` |
| open | `ETF_OPEN_PRICE` |
| high | `ETF_HIGH_PRICE` |
| low | `ETF_LOW_PRICE` |
| close | `ETF_CLOSE_PRICE` |
| group | `ETF_STOCK_GROUP` |
| type | `ETF_STOCK_TYPE` |
| updatedAt | `updated_at` |

조인 기준:

```sql
STOCK_INVEST_INFO.KSP_STOCK_DATE = ETF_STOCK_INFO.ETF_STOCK_DATE
```

## 5. 필터 기준

legacy 필수 필터:

- `ETF_STOCK_ID IN ('KDX_LVG', 'KDX_I2X')`
- `ETF_OPEN_PRICE IS NOT NULL`
- `ETF_CLOSE_PRICE IS NOT NULL`
- `ETF_OPEN_PRICE > 0`
- `ETF_BEF_CLOSE_PRICE IS NOT NULL`
- `ETF_BEF_CLOSE_PRICE > 0`
- `includeOffsets=1`이면 `ETF_LOW_PRICE IS NOT NULL`
- full OHLC 집계에는 `ETF_HIGH_PRICE`, `ETF_LOW_PRICE` 필요
- `PRICE_TOT_SCORE_GRADE IS NOT NULL`
- `GROWTH_TOT_SCORE_GRADE IS NOT NULL`
- 기준일 이후 데이터 제외: `KSP_STOCK_DATE < selectedDate`
- period는 기존 `1y/3y/5y/all` 로직과 동일

proxy ETF `KSP_LVG`, `KSP_I2X`는 기존과 동일하게 거부한다.

## 6. current source와 legacy source 차이

| 항목 | current source | legacy source |
|---|---|---|
| 테이블 | `MARKET_SITE_ETF_STOCK_INFO` | `ETF_STOCK_INFO` |
| provider/source 비교 | NVR/DMF/YHF 가능 | 불가능 |
| source 응답 | `NVR`, `DMF`, `YHF` | `LEGACY_ETF_STOCK_INFO` |
| 최신 데이터 | 2026-06-02까지 존재 | 2025-10-29까지 존재 |
| 장점 | 현재 수집 흐름과 일관 | 표본 수 증가 |
| 한계 | 표본 부족 | source 불명확, 최신 구간 부재 |

## 7. 검증 기준

- 기준일: 2026-06-01
- 기준 등급: `P-5/G+4`
- period: `3y`
- ETFs: `KDX_LVG`, `KDX_I2X`
- minSamples: `20`
- includeOffsets: `true`

## 8. 표본 수 비교

| source | rangeMode | matchedDays | raw rows | sampleLatestDate | signal |
|---|---|---:|---:|---|---|
| NVR | exact | 1 | 2 | 2026-05-25 | `NO_SIGNAL` |
| NVR | near1 | 3 | 6 | 2026-05-25 | `NO_SIGNAL` |
| NVR | near2 | 9 | 18 | 2026-05-25 | `NO_SIGNAL` |
| legacy | exact | 1 | 2 | 2024-10-15 | `NO_SIGNAL` |
| legacy | near1 | 26 | 52 | 2025-07-26 | `MIXED` |
| legacy | near2 | 48 | 96 | 2025-07-26 | `MIXED` |

legacy source는 near1에서 3일에서 26일, near2에서 9일에서 48일로 늘었다. exact는 여전히 1일이라 `NO_SIGNAL`이다.

## 9. KDX_LVG / KDX_I2X legacy 통계 요약

### legacy near1

| ETF | sampleCount | avg open-close | median open-close | winRate | bestEntryOffset |
|---|---:|---:|---:|---:|---|
| `KDX_LVG` | 26 | +0.13% | -0.24% | 42.31% | -0.5% 시뮬레이션 후보 |
| `KDX_I2X` | 26 | -0.05% | +0.24% | 53.85% | null |

### legacy near2

| ETF | sampleCount | avg open-close | median open-close | winRate | bestEntryOffset |
|---|---:|---:|---:|---:|---|
| `KDX_LVG` | 48 | +0.11% | -0.24% | 45.83% | -1.0% 시뮬레이션 후보 |
| `KDX_I2X` | 48 | -0.03% | +0.19% | 52.08% | null |

주의: `bestEntryOffset`은 일봉 저가 기반 체결 가정을 통과한 과거 시뮬레이션 후보일 뿐이다. 매수가 추천, 최적 매수가, 체결 보장, 수익 보장으로 표시하면 안 된다. 3.5차부터 응답 최상위에 `bestEntryOffsetCautionKo/En`을 포함해 이 값을 실제 매수가 추천이나 체결 보장으로 오해하지 않도록 했다.

## 10. signal 결과

legacy near1/near2는 표본 수가 `minSamples=20`을 넘지만 방향성은 `MIXED`로 나왔다.

- near1: `MIXED`, reason=`avg_median_win_rate_do_not_point_to_one_side`
- near2: `MIXED`, reason=`avg_median_win_rate_do_not_point_to_one_side`
- minSamples=500: `NO_SIGNAL`, reason=`sample_below_minimum_500`

즉, 표본이 늘어도 매수/매도 신호로 해석하지 않는다. 응답에는 `OBSERVATION_SIGNAL_NOT_TRADE_RECOMMENDATION` warning을 붙인다.

## 11. warningCodes

legacy 응답에 포함되는 warning:

- `LEGACY_DATA_SOURCE`
- `SOURCE_HAS_NO_PROVIDER_FIELD`
- `DAILY_BAR_SIMULATION_ONLY`
- `NOT_INVESTMENT_ADVICE`
- `ENTRY_OFFSET_USES_DAILY_LOW_ONLY`
- 선택일이 legacy 최신일보다 뒤이면 `LEGACY_SOURCE_NOT_LATEST`
- 표본 최신일이 선택일보다 과거이면 `LEGACY_SAMPLE_ENDS_BEFORE_SELECTED_DATE`
- 표본 부족 시 `LOW_SAMPLE_SIZE`
- signal이 `NO_SIGNAL`이 아닐 때 `OBSERVATION_SIGNAL_NOT_TRADE_RECOMMENDATION`

2026-06-01 기준 legacy 응답은 `legacyMaxDate=2025-10-29`이고 near1/near2의 `sampleLatestDate=2025-07-26`이므로 두 최신성 warning이 모두 포함된다. current source에는 이 두 warning을 적용하지 않는다.

## 12. UI 안전 해석 필드

3.5차부터 legacy 응답에 다음 필드를 추가했다.

- `dataFreshnessLabelKo`: 예) `legacy 장기 데이터는 2025-10-29까지만 포함됩니다.`
- `dataFreshnessLabelEn`: 예) `Legacy long-term data is available only through 2025-10-29.`
- `interpretationLevel`
- `bestEntryOffsetCautionKo`
- `bestEntryOffsetCautionEn`

`interpretationLevel` 기준:

| 조건 | 값 |
|---|---|
| `matchedDays < minSamples` | `INSUFFICIENT_SAMPLE` |
| `signal.code === "MIXED"` | `MIXED_OBSERVATION` |
| `signal.code === "NO_SIGNAL"` | `NO_CLEAR_EDGE` |
| `signal.code === "LEVERAGE_BIAS"` 또는 `"INVERSE_BIAS"` | `OBSERVATION_ONLY` |

검증 결과:

- exact: `matchedDays=1`, `minSamples=20`이라 `INSUFFICIENT_SAMPLE`
- near1: `signal=MIXED`라 `MIXED_OBSERVATION`
- near2: `signal=MIXED`라 `MIXED_OBSERVATION`
- `minSamples=500`: `INSUFFICIENT_SAMPLE`

## 13. 사용하지 않은 테이블

이번 API 연결에는 다음 테이블을 사용하지 않았다.

- `ETF_STOCK_RESULT`
- `MARKET_ETF_DTL_RST_FOR_DIBR`

이유:

- `Y25_KDX_GRADE_*` result type은 현재 `PRICE_TOT_SCORE_GRADE/GROWTH_TOT_SCORE_GRADE`와 동일 등급 체계로 볼 수 없다.
- 두 테이블은 기존 예약매수/집계 결과 성격이 강하고, 현재 API가 계산하는 ETF 일봉 open-close 통계의 원시 OHLC가 아니다.
- result table을 붙이면 기존 전략 가정이 섞인 결과를 현재 등급 통계처럼 오해할 수 있다.

## 14. 금지 표현

화면에 붙일 때 피해야 할 표현:

- 매수 추천
- 매도 추천
- 오늘의 종목 추천
- 최적 매수가
- 안전한 진입가
- 수익 보장
- 승률 보장
- 따라 사면 된다
- 손실 가능성이 낮다

대체 표현:

- legacy 장기 일봉 통계
- 과거 동일/근접 등급 관찰
- 일봉 open-close 시뮬레이션
- 체결 보장 없음
- 투자 추천 아님

## 15. 검증 명령과 결과

실행:

```bash
node --check lib/stockIndexEtfStats.js
node --check lib/stockIndexLegacyEtfStats.js
node --check pages/api/stock-index/etf-grade-stats.js
node --check scripts/verify_index_etf_grade_stats.js
node scripts/verify_index_etf_grade_stats.js
npm.cmd run build
git diff --check
```

결과:

- node syntax check 통과
- verify script 통과
- current NVR exact/near1/near2 matchedDays 유지 확인: 1 / 3 / 9
- legacy exact/near1/near2 matchedDays 확인: 1 / 26 / 48
- legacy near1/near2에서 `LEGACY_SOURCE_NOT_LATEST`, `LEGACY_SAMPLE_ENDS_BEFORE_SELECTED_DATE` 확인
- legacy `interpretationLevel` 확인: exact `INSUFFICIENT_SAMPLE`, near1/near2 `MIXED_OBSERVATION`, minSamples=500 `INSUFFICIENT_SAMPLE`
- `bestEntryOffset`이 있는 응답에서 `bestEntryOffsetCautionKo/En` 확인
- `source=legacy_etf_stock_info` alias 정상화 확인
- proxy `KSP_LVG,KSP_I2X` 거부 확인
- unsupported `SPY` 거부 확인
- `npm.cmd run build` 통과

`npm.cmd run build`도 성공했다. `postbuild`의 `next-sitemap` 실행으로 `public/sitemap-0.xml`의 `lastmod`만 갱신되어, 이번 작업 산출물이 아니므로 원복했다.

## 16. 4차 UI 적용 메모

4차에서는 `/market/indices` 화면의 기존 KOSPI 등급/유사일 통계 아래에 `ETF 일봉 관찰 통계` 보조 패널을 추가했다.

- UI 보고서: `reports/index-etf-dashboard-ui-audit.md`
- 기본 호출: `source=legacy&period=3y&rangeMode=near1&minSamples=20&includeOffsets=1&limit=5`
- legacy 최신성 warning과 `dataFreshnessLabelKo`를 화면에 표시한다.
- `bestEntryOffset`은 접힌 상세 영역 안에서만 `시가 대비 offset`으로 표시한다.
- 화면 표현은 과거 일봉 관찰 통계와 체결 가정 안내로 제한하고, 투자 권유/수익 보장 표현을 사용하지 않는다.
