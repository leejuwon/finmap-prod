# Finmap 주식지수 등급 데이터 진단 및 배포 전 QA

작성일: 2026-05-27

## 1. 점검 범위

- 페이지: `/market/indices`
- API:
  - `/api/stock-index/dashboard`
  - `/api/stock-index/grade-stats`
- 주요 소스:
  - `lib/stockIndexCore.js`
  - `pages/api/stock-index/dashboard.js`
  - `pages/api/stock-index/grade-stats.js`
  - `pages/market/indices.js`
- 등급 산정/저장 관련 코드:
  - `server/crawler/lib/services/marketIndicesIFService.js`
  - `server/crawler/lib/services/marketWeeklyRecheckService.js`
- DB 테이블: `STOCK_INVEST_INFO`

## 2. 등급 컬럼 및 범위 정책

| 구분 | 컬럼 | 정책 |
| --- | --- | --- |
| 기준일 | `KSP_STOCK_DATE` | KOSPI 해석 기준일 |
| 등급 원천 기준일 | `KSP_BF_STOCK_DATE` | 직전 해외/시장 데이터 기준일 |
| 가격 점수 | `PRICE_TOT_SCORE` | DXY, TNX, WTI, KRW 점수 합산 |
| 가격 등급 | `PRICE_TOT_SCORE_GRADE` | `-9~-1`, `1~9`, 0 제외 |
| 성장 점수 | `GROWTH_TOT_SCORE` | S&P500, Nasdaq, Dow 점수 합산 |
| 성장 등급 | `GROWTH_TOT_SCORE_GRADE` | `-9~-1`, `1~9`, 0 제외 |

0등급은 정상 등급으로 보지 않는다. API 기본 기준일 선택과 `grade-stats` 표본 조회는 허용 등급만 사용한다.

## 3. 0등급 row 진단 결과

조회 조건:

```sql
SELECT
  KSP_STOCK_DATE,
  KSP_BF_STOCK_DATE,
  PRICE_TOT_SCORE,
  PRICE_TOT_SCORE_GRADE,
  GROWTH_TOT_SCORE,
  GROWTH_TOT_SCORE_GRADE,
  IF_SUCC_YN,
  KR_HOLYDAY_YN,
  US_HOLYDAY_YN
FROM STOCK_INVEST_INFO
WHERE PRICE_TOT_SCORE_GRADE = 0
   OR GROWTH_TOT_SCORE_GRADE = 0
ORDER BY KSP_STOCK_DATE DESC;
```

결과: 가격 등급 0 row 5건, 성장 등급 0 row 5건, 범위 밖 등급 0건.

| KSP_STOCK_DATE | 요일 | KSP_BF_STOCK_DATE | 이전일 요일 | 가격 점수/등급 | 성장 점수/등급 | IF_SUCC_YN | KR_HOLYDAY_YN | US_HOLYDAY_YN | 주요 상태 | 원인 분류 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2025-07-27 | Sunday | 2025-07-26 | Saturday | NULL / 0 | NULL / 0 | Y | N | N | 글로벌 지표 open flag 전부 N, 지표 점수 전부 NULL | `holiday_or_no_trade` |
| 2025-07-20 | Sunday | 2025-07-19 | Saturday | NULL / 0 | NULL / 0 | Y | N | N | 글로벌 지표 open flag 전부 N, 지표 점수 전부 NULL | `holiday_or_no_trade` |
| 2025-07-13 | Sunday | 2025-07-12 | Saturday | NULL / 0 | NULL / 0 | Y | Y | N | KOSPI 가격 NULL, 글로벌 지표 open flag 전부 N | `holiday_or_no_trade` |
| 2025-07-06 | Sunday | 2025-07-05 | Saturday | NULL / 0 | NULL / 0 | Y | Y | N | KOSPI 시가/종가 NULL, 글로벌 지표 open flag 전부 N | `holiday_or_no_trade` |
| 2025-07-05 | Saturday | 2025-07-04 | Friday | NULL / 0 | NULL / 0 | Y | Y | Y | 미국 독립기념일 영향, S&P/Nasdaq/Dow/TNX 점수 NULL | `holiday_or_no_trade` |

세부 확인:

- 2025-07-27, 2025-07-20은 `KR_HOLYDAY_YN=N`, `US_HOLYDAY_YN=N`이지만 `KSP_STOCK_DATE`가 Sunday이고 `KSP_BF_STOCK_DATE`가 Saturday다.
- 위 두 row는 KOSPI 가격 일부가 채워져 있으나 S&P500, Nasdaq, Dow, USD/KRW, DXY, WTI, US10Y 관련 score/open flag가 모두 비어 있다.
- 2025-07-13, 2025-07-06, 2025-07-05는 휴장성 row이며 KOSPI 또는 해외 지표 데이터가 부족하다.
- 모든 0등급 row에서 `PRICE_TOT_SCORE`와 `GROWTH_TOT_SCORE`는 NULL이다.

## 4. 원인 판단

1차 원인은 정상 거래일 데이터가 아닌 주말/휴장/거래일 불일치 row가 `STOCK_INVEST_INFO`에 남아 있는 것이다.

등급 산정 함수는 점수가 정상 숫자일 때 `0`을 만들지 않는 구조다. 다만 `marketIndicesIFService.js`의 `fnCalcGrade()`에서 입력 점수들이 비어 있으면 합산 결과가 `NaN`이 되고, 초기값 `0`이 그대로 저장될 수 있다. 주간 재검증 서비스도 등급 초기값은 `0`에서 시작한다.

따라서 현재 5건은 정상 데이터가 있는데 0으로 잘못 등급화된 `grade_logic_bug`라기보다, 거래일 불일치 및 지표 누락 row에 대한 방어 로직 부족에 가깝다. 운영 데이터 수정은 하지 않고 제외 정책을 유지한다.

## 5. 통계 대상 제외 정책 확인

확인 결과:

- `grade-stats` API는 `PRICE_TOT_SCORE_GRADE IN (...)`, `GROWTH_TOT_SCORE_GRADE IN (...)`에 허용 등급만 전달한다.
- `near1`, `near2` 범위 계산은 같은 부호 안에서만 확장하며 0을 포함하지 않는다.
- `priceGrade=0` 요청은 HTTP 400을 반환한다.
- dashboard API는 기본 기준일에서 `grades.warning=null`이며, 전체 0등급 건수는 `diagnostics`에만 포함한다.
- 선택 기준일 자체가 0등급이면 `grades.warning`에 “선택 기준일 등급값 확인 필요” 메시지를 반환한다.

## 6. API 응답 확인

`/api/stock-index/dashboard` 기본 호출:

```json
{
  "date": "2026-05-25",
  "latestDate": "2026-05-27",
  "latestUsableDate": "2026-05-25",
  "grades": {
    "priceGrade": -5,
    "growthGrade": 4,
    "warning": null
  },
  "diagnostics": {
    "zeroPriceGradeRows": 5,
    "zeroGrowthGradeRows": 5,
    "outOfRangeGradeRows": 0
  }
}
```

`/api/stock-index/grade-stats?date=2026-05-25&period=3y&rangeMode=exact`:

```json
{
  "sampleCount": 2,
  "rangeSamples": {
    "exact": 2,
    "near1": 28,
    "near2": 56
  }
}
```

인접 범위 확인:

| mode | priceGrades | growthGrades | sampleCount |
| --- | --- | --- | --- |
| exact | `[-5]` | `[4]` | 2 |
| near1 | `[-6,-5,-4]` | `[3,4,5]` | 28 |
| near2 | `[-7,-6,-5,-4,-3]` | `[2,3,4,5,6]` | 56 |

## 7. 배포 전 최종 QA

| 항목 | 결과 | 메모 |
| --- | --- | --- |
| `/market/indices` 200 응답 | PASS | HTML 응답 200, `__NEXT_DATA__` 포함 |
| 기본 날짜 | PASS | `latestUsableDate=2026-05-25`, `latestDate=2026-05-27` |
| KOSPI 요약 | PASS | 기준가/시가/종가 표시 |
| 가격/성장 등급 숫자 표시 | PASS | 가격 `-5`, 성장 `+4` |
| A/B/C/D 등급 표현 | PASS | `A/B/C/D`, `등급 A~D` 표현 없음 |
| dashboard API warning | PASS | 일반 기준일에서 `grades.warning=null` |
| dashboard diagnostics | PASS | 0등급 row 수 분리 노출 |
| grade-stats rangeSamples | PASS | exact 2, near1 28, near2 56 |
| `priceGrade=0` 요청 | PASS | HTTP 400 |
| near1/near2 0 포함 여부 | PASS | 범위에 0 없음 |
| exact 표본 부족 안내 | PASS | “표본 부족”, 추천 rangeMode 버튼 표시 |
| near1 버튼 | PASS | URL query가 `rangeMode=near1`로 변경 |
| 유사 날짜 클릭 | PASS | `date` query 변경 및 scrollY 0 확인 |
| 광고 영역 | PASS | `ins.adsbygoogle` 2개, `min-h-[140px]` wrapper 유지 |
| 모바일 390px | PASS | `scrollWidth=390`, `clientWidth=390`, overflow 없음 |
| 로컬 광고 리소스 | 참고 | 로컬 브라우저에서 광고 네트워크 차단 오류는 발생하나 레이아웃에는 영향 없음 |
| `node --check` | PASS | 대상 4개 파일 통과 |
| `npm.cmd run build` | PASS | Next build 및 next-sitemap 완료 |

## 8. 남은 TODO

- 0등급 row 자체를 줄이려면 DB 직접 보정보다 산정 배치 방어가 우선이다.
- `marketIndicesIFService.js`의 `fnCalcGrade()`에서 필수 점수 입력이 하나라도 누락되면 등급을 0으로 저장하지 않고 grade 계산을 skip하거나 별도 상태값을 남기는 방식을 검토한다.
- 주말 row인데 `KR_HOLYDAY_YN=N`, `US_HOLYDAY_YN=N`으로 저장된 사례가 있어 휴장/주말 플래그 산정 로직을 별도 점검할 필요가 있다.
- `IF_SUCC_YN=Y`가 지표 점수 산정 성공까지 의미하는지 모호하다. 향후 `grade_calc_status` 또는 `grade_warning` 같은 별도 컬럼/로그를 두면 운영 진단이 쉬워진다.
- `public/sitemap-0.xml` 변경은 `npm.cmd run build`의 postbuild 산출물이므로 기능 변경과 분리 여부를 확인한다.
