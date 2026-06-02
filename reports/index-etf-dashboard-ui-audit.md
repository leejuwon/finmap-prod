# Finmap 지수 대시보드 ETF 전략 확장 4차 UI 적용 보고서

작성일: 2026-06-02

## 1. 변경 파일

| 파일 | 내용 |
|---|---|
| `pages/market/indices.js` | 지수 대시보드 하단에 `EtfObservationPanel` 로컬 컴포넌트 추가, legacy ETF API 호출 상태 추가 |
| `reports/index-etf-dashboard-ui-audit.md` | 4차 UI 적용 및 QA 기록 |
| `reports/index-etf-legacy-source-api-audit.md` | 4차 UI 적용 메모 연결 |

신규 별도 컴포넌트 파일은 만들지 않았다. 기존 페이지가 로컬 컴포넌트 중심이라 같은 파일 안에 소형 보조 패널로 유지했다.

## 2. UI 섹션 위치

추가 섹션 제목: `ETF 일봉 관찰 통계`

위치:

- `등급 기반 KOSPI 통계`
- `동일/인접 등급 과거 날짜`
- `ETF 일봉 관찰 통계`
- `함께 보면 좋은 글`

기존 KOSPI 등급 카드, 주요 지표 카드, 등급 통계, 유사일 목록은 구조를 바꾸지 않았다.

## 3. API 호출 파라미터

기본 호출:

```text
/api/stock-index/etf-grade-stats?source=legacy&period=3y&rangeMode=near1&minSamples=20&includeOffsets=1&limit=5&date=YYYY-MM-DD
```

적용값:

- `source=legacy`
- `period=3y`
- `rangeMode=near1`
- `minSamples=20`
- `includeOffsets=1`
- `limit=5`
- `date`: 대시보드 기준일이 있으면 `dashboard.date`

사용자 선택:

- 기본: `near1`
- 선택 가능: `near1`, `near2`, `exact`
- source 선택 UI는 노출하지 않고 legacy 전용 보조 패널로 표시
- period는 3y 고정

API 실패 시 전체 대시보드를 오류로 전환하지 않고 ETF 패널에만 오류 안내를 표시한다.

## 4. 화면 표시 규칙

관찰 결과는 `interpretationLevel` 기준으로 표시한다.

| interpretationLevel | 화면 표시 |
|---|---|
| `INSUFFICIENT_SAMPLE` | 표본 부족 |
| `MIXED_OBSERVATION` | 혼합 관찰 |
| `NO_CLEAR_EDGE` | 관찰 우위 없음 |
| `OBSERVATION_ONLY` | 관찰 통계 또는 API의 관찰 label |

표시 원칙:

- `matchedDays < minSamples`이면 표본 부족을 우선 표시한다.
- `signal.code === "MIXED"`이면 혼합 관찰만 표시한다.
- `signal.code === "NO_SIGNAL"`이면 표본 부족 또는 관찰 우위 없음으로 표시한다.
- `bestEntryOffset`은 접힌 상세 영역 안에서만 표시한다.
- offset 값은 `시가 대비 offset`으로 표시한다.
- 레버리지·인버스 ETF 고위험 유의문구를 항상 표시한다.

## 5. 필수 표시 항목

표본 카드:

- `matchedDays`
- `rangeMode`
- `period`
- `sourceDescriptionKo`

관찰 결과 카드:

- `interpretationLevel`
- `투자 권유 아님 · 수익 보장 아님`

데이터 최신성:

- `dataFreshnessLabelKo`
- `LEGACY_SOURCE_NOT_LATEST` warning 시 amber 안내 박스
- `LEGACY_SAMPLE_ENDS_BEFORE_SELECTED_DATE` warning 시 `sampleLatestDate`와 선택 기준일 표시

ETF 비교 표:

- ETF명
- `sampleCount`
- `avgOpenToClosePct`
- `medianOpenToClosePct`
- `winRate`
- `maxLossPct`
- `sampleQuality`

상세 접기 영역:

- `entryOffsets`
- `bestEntryOffset`의 `offsetPct`, `filledCount`, `fillRate`, `avgReturnPct`, `medianReturnPct`, `expectedReturnPct`
- `bestEntryOffsetCautionKo`

## 6. API QA 결과

검증 스크립트:

```bash
node scripts/verify_index_etf_grade_stats.js
```

2026-06-01, P-5/G+4 기준:

| source | rangeMode | matchedDays | sampleLatestDate | legacyMaxDate | interpretationLevel | signal |
|---|---:|---:|---|---|---|---|
| legacy | exact | 1 | 2024-10-15 | 2025-10-29 | `INSUFFICIENT_SAMPLE` | `NO_SIGNAL` |
| legacy | near1 | 26 | 2025-07-26 | 2025-10-29 | `MIXED_OBSERVATION` | `MIXED` |
| legacy | near2 | 48 | 2025-07-26 | 2025-10-29 | `MIXED_OBSERVATION` | `MIXED` |

기본 UI 호출인 near1은 `matchedDays=26`, `interpretationLevel=MIXED_OBSERVATION`, 화면 표시는 `혼합 관찰`이다.

로컬 HTTP 확인:

```text
GET http://localhost:8002/market/indices
GET http://localhost:8002/api/stock-index/etf-grade-stats?source=legacy&period=3y&rangeMode=near1&minSamples=20&includeOffsets=1&limit=5&date=2026-06-01
```

결과:

- `/market/indices`: HTTP 200
- ETF API: HTTP 200
- `matchedDays=26`
- `rangeMode=near1`
- `source=LEGACY_ETF_STOCK_INFO`
- `interpretationLevel=MIXED_OBSERVATION`

## 7. warning 표시 QA

legacy near1/near2에서 다음 warning을 확인했다.

- `LEGACY_SOURCE_NOT_LATEST`
- `LEGACY_SAMPLE_ENDS_BEFORE_SELECTED_DATE`
- `LEGACY_DATA_SOURCE`
- `SOURCE_HAS_NO_PROVIDER_FIELD`
- `DAILY_BAR_SIMULATION_ONLY`
- `NOT_INVESTMENT_ADVICE`
- `ENTRY_OFFSET_USES_DAILY_LOW_ONLY`
- `OBSERVATION_SIGNAL_NOT_TRADE_RECOMMENDATION`

화면 반영:

- `legacy 장기 데이터는 2025-10-29까지만 포함됩니다.` 표시
- 표본 최신일 `2025-07-26`과 선택 기준일 `2026-06-01` 표시
- 레버리지·인버스 ETF 고위험 유의문구 표시

## 8. 금지 문구 검사

실행:

```bash
rg -n "추천|매수 추천|매도 추천|오늘 매수|최적 매수가|안전한 진입가|수익 확률|따라 사면|손실 가능성이 낮다" pages\market\indices.js
```

결과:

- 화면 소스에 매칭 없음
- 기존 KOSPI 통계 버튼의 `추천: 인접 ±1 보기` 문구를 `참고: 인접 ±1 보기`로 변경

참고:

- API의 `bestEntryOffsetCautionKo`에는 부정형 안전 문구가 포함되어 있으며, UI에서는 상세 접기 영역 내부에만 표시한다.
- 화면 문구는 `관찰 통계`, `혼합 관찰`, `표본 부족`, `일봉 기준`, `체결 가정`, `투자 권유 아님`, `수익 보장 아님` 중심으로 제한했다.

## 9. 모바일 QA

소스 기준 확인:

- 카드 영역은 `grid gap-3 md:grid-cols-3`으로 모바일 1열이다.
- ETF 비교 표는 `overflow-x-auto` 안의 `min-w-[720px]` 테이블이다.
- offset 상세 표는 `overflow-x-auto` 안의 `min-w-[680px]` 테이블이다.
- 패널 outer는 고정 폭을 주지 않았고, 긴 표는 내부 스크롤로 제한했다.

자동 브라우저/390px 픽셀 QA는 이번 환경에서 외부 브라우저 경로 확인 명령이 sandbox `spawn setup refresh` 오류로 실행되지 않아 완료하지 못했다. 대신 Next build와 소스 구조 검사를 완료했다.

## 10. 검증 명령과 결과

실행:

```bash
node --check pages/market/indices.js
node scripts/verify_index_etf_grade_stats.js
npm.cmd run build
Invoke-WebRequest http://localhost:8002/market/indices
Invoke-WebRequest http://localhost:8002/api/stock-index/etf-grade-stats?source=legacy...
git diff --check
```

결과:

- `node --check pages/market/indices.js` 통과
- ETF API 검증 통과
- `npm.cmd run build` 통과
- 로컬 HTTP 확인 통과: `/market/indices` 200, ETF API 200
- `git diff --check` 통과
- `postbuild`가 `public/sitemap-0.xml`의 `lastmod`를 갱신했으나 이번 작업 산출물이 아니므로 원복

## 11. 남은 확인

- 실제 브라우저에서 `/market/indices` 접속 후 ETF 패널 렌더 확인
- 390px viewport에서 페이지 전체 가로 overflow가 없는지 시각 확인
- 상세 접기 영역을 열었을 때 `bestEntryOffset`이 기본 화면에 노출되지 않는지 확인
