# Finmap 부동산 전월 데이터 스케줄러 및 2026-05 재수집 감사 리포트

작성일: 2026-06-04  
명시 대상 월: `202605`

## 1. 결론

- 2026-06-04 점검 전 운영 DB와 공개 대시보드 API의 최신월은 `202604`였고, `202605` 원천·집계 데이터는 모두 0건이었다.
- 국토부 API count-only 점검에서는 `202605` 수도권 데이터가 정상 공개되어 있었다.
- 저장소의 PM2 crawler scheduler에는 부동산 월간 작업이 등록되어 있지 않다. 부동산 월간 배치는 운영 서버의 외부 crontab 수동 등록에만 의존한다.
- 따라서 이번 미반영의 직접 근거는 **월간 wrapper가 운영 DB의 ingest 단계까지 실행되지 않았다는 것**이다.
- 운영 서버의 실제 `crontab -l`, cron daemon 로그에는 이 작업 환경에서 접근할 수 없어, 외부 cron 미등록·유실·경로 오류 중 정확히 어느 항목인지는 확정할 수 없다.
- 추가로 화성시 요청 코드가 기존 `41590`에 머물러 있어, 배치를 실행했더라도 화성시 2026-05 API 데이터 1,578건을 놓칠 상태였다.
- 수동 재수집과 집계 후 운영 DB 및 공개 API의 최신월은 `202605`로 갱신되었다.

## 2. 스케줄러 위치와 실행 구조

### 월간 부동산 wrapper

- 위치: `ops/run_real_estate_monthly_batch.sh`
- 역할:
  1. 수도권 원천 실거래 수집
  2. 서울 동별 지역 통계/랭킹 생성
  3. 인천·경기 시군구 통계/랭킹 생성
  4. 단지별 월/연 통계 생성
- 로그 위치: `logs/real_estate_monthly_*.log`
- 중복 실행 방지: Linux `flock`, 기본 lock 파일 `/tmp/finmap_real_estate_monthly_batch.lock`

### 자동 실행 정의

- `server/crawler/runner.js`와 `server/crawler/scheduler.js`의 PM2 crawler scheduler에는 시장 데이터 작업만 등록되어 있다.
- 부동산 월간 배치는 PM2, node-schedule, GitHub Actions, Vercel Cron에 등록되어 있지 않다.
- `.github/workflows`는 존재하지 않는다.
- `ecosystem.config.js`의 `finmap-crawler`도 `server/crawler/runner.js`만 실행하며 부동산 월간 wrapper를 호출하지 않는다.
- `docs/real-estate-monthly-batch.md`에는 crontab 등록 예시만 있고, 저장소 배포만으로 cron이 자동 등록되지는 않는다.

## 3. 실행 주기와 timezone

기존 문서의 실행 예시는 매월 3일 03:30 1회였다.

```cron
30 3 3 * * /bin/bash /path/to/finmap/ops/run_real_estate_monthly_batch.sh
```

wrapper의 target month와 로그 날짜 계산은 `BATCH_TZ=Asia/Seoul`을 사용한다.

```bash
TZ="$BATCH_TZ" date -d "$(TZ="$BATCH_TZ" date +%Y-%m-01) -1 day" +%Y%m
```

주의:

- target month 계산은 KST 기준이다.
- cron의 03:30 실행 시각 자체는 cron daemon/server timezone을 따른다.
- 문서의 보완 cron 예시에는 `CRON_TZ=Asia/Seoul`을 추가했다.
- Windows Git Bash dry-run 로그 timestamp는 `+00:00`으로 출력되었지만, 2026-06-04 기준 target month는 정상적으로 `202605`가 계산되었다.

## 4. 이번 달 미실행 원인 분석

### 확인된 근거

1. 실행 전 운영 DB:
   - `re_trade_apt` 최신월: `202604`
   - `re_trade_apt`의 `202605`: 0건
   - `re_trade_deal_ym` 최신월: `202604`
   - 월 통계·랭킹·단지 통계의 `202605`: 모두 0건
2. 실행 전 공개 API:
   - `/api/re/options`의 `maxYm`: `202604`
   - `/api/re/trade-top?period=202605`는 서울·인천·경기 모두 0행
3. 국토부 API count-only:
   - `202605` 데이터가 정상 공개되어 있었고 API 오류는 0건
4. 저장소:
   - PM2 crawler scheduler에 부동산 월간 작업 없음
   - 실제 자동 실행은 외부 crontab 수동 등록에만 의존
   - 기존 로컬 작업 환경에는 월간 배치 실행 로그가 없었음

### 판단

국토부 데이터가 없어서 실패한 것이 아니다. wrapper가 운영 DB ingest 단계까지 도달했다면 기존 코드 기준으로도 `re_trade_deal_ym` 또는 원천 일부가 생성되어야 했지만 모두 0건이었다.

따라서 이번 미반영은 **외부 cron이 실행되지 않았거나 wrapper 호출 전에 실패한 것**으로 판단한다. 가장 가능성이 높은 원인은 운영 서버 crontab 미등록 또는 배포/서버 변경 후 등록 유실이다.

다만 운영 서버의 `crontab -l`과 cron 로그를 직접 확인하지 못했으므로, 미등록·경로 오류·권한 오류 중 하나로 더 좁히려면 서버 확인이 필요하다.

### 별도 발견한 수집 결함

기존 수집 목록은 화성시를 `41590`으로 요청했다.

2026-05 국토부 API 직접 확인:

| 요청 코드 | API 건수 |
| --- | ---: |
| `41590` | 0 |
| `41591` 만세구 | 96 |
| `41593` 효행구 | 134 |
| `41595` 병점구 | 251 |
| `41597` 동탄구 | 1,097 |

신규 4개 구 합계는 1,578건이다. 요청 코드는 신규 구 코드로 교체하고, DB 저장 `lawd_cd`는 기존 dashboard 호환을 위해 `canonicalLawdCd()`가 `41590`으로 묶도록 유지했다.

참고:

- 행정안전부: [화성시 4개 일반구 설치 승인](https://www.mois.go.kr/frt/bbs/type010/commonSelectBoardArticle.do%3Bjsessionid%3D0lMrfXOFMvaS0va8l4BP0OHYwNpuxO1RGWII2jP4.node50?bbsId=BBSMSTR_000000000008&nttId=122750)
- 화성시: [화성특례시 구청 출범 관련 공지](https://www.hscity.go.kr/www/user/bbs/BD_selectBbs.do?q_bbsCode=1022&q_bbscttSn=20251226141218448)

## 5. targetYm 계산 결과

2026-06-04 기준:

- 기본 target month: `202605`
- 명시 실행값: `--from=202605 --to=202605`
- wrapper dry-run 결과: `[batch:start] targetYm=202605 dryRun=1`

dry-run에서 확인한 실행 단계:

1. `rtms_ingest_apt_dev_sudogwon_range.js`
2. `re_build_stats_ranks.js --sido=11 --level=dong`
3. `re_build_stats_ranks.js --sido=28 --level=sigungu`
4. `re_build_stats_ranks.js --sido=41 --level=sigungu`
5. `re_build_apt_stats.js`

## 6. upsert 및 중복 안전성

운영 DB의 unique index를 읽기 전용으로 확인했다.

```text
PRIMARY KEY (tx_hash)
```

수집 SQL은 `INSERT ... ON DUPLICATE KEY UPDATE`를 사용한다. 같은 월과 같은 거래를 다시 실행해도 `tx_hash` 기준 update/upsert가 수행된다.

실행 후 검증:

- `202605` 원천 행: 20,269
- `COUNT(DISTINCT tx_hash)`: 20,269
- 중복 tx_hash: 0

집계 스크립트는 대상 기간을 삭제 후 재생성하거나 unique key upsert하는 기존 구조를 사용한다.

## 7. 실행 전 count

### 원천 및 기간

| 항목 | 실행 전 |
| --- | ---: |
| `re_trade_apt` latest `deal_ym` | `202604` |
| `re_trade_apt` `202605` rows | 0 |
| `re_trade_deal_ym` latest `deal_ym` | `202604` |
| `re_trade_deal_ym` `202605` 존재 | 0 |

### 집계

| 테이블 | latest | `202605` rows |
| --- | --- | ---: |
| `re_stat_month_dong` | `202604` | 0 |
| `re_stat_month_sigungu` | `202604` | 0 |
| `re_rank_month_dong` | `202604` | 0 |
| `re_rank_month_sigungu` | `202604` | 0 |
| `re_trade_apt_stats_m` | `202604` | 0 |

### 최근 원천 count

| 월 | 서울 `11` | 인천 `28` | 경기 `41` | 합계 |
| --- | ---: | ---: | ---: | ---: |
| `202603` | 3,922 | 2,699 | 11,404 | 18,025 |
| `202604` | 5,123 | 2,454 | 11,256 | 18,833 |
| `202605` | 0 | 0 | 0 | 0 |

## 8. count-only 결과

### 화성 코드 수정 전

| 시도 | API items | zero areas | errors |
| --- | ---: | ---: | ---: |
| 서울 | 5,334 | 0 | 0 |
| 인천 | 2,338 | 1 | 0 |
| 경기 | 11,280 | 1 | 0 |
| 합계 | 18,952 | 2 | 0 |

zero areas:

- 인천 옹진군 `28720`: 0건
- 경기 화성시 기존 코드 `41590`: 0건

### 화성 코드 수정 후

| 시도 | API items | zero areas | errors |
| --- | ---: | ---: | ---: |
| 서울 | 5,334 | 0 | 0 |
| 인천 | 2,338 | 1 | 0 |
| 경기 | 12,858 | 0 | 0 |
| 합계 | 20,530 | 1 | 0 |

인천 옹진군은 API 응답 0건이지만 시도 전체 데이터와 API 오류는 정상이다.

## 9. 실제 재수집 및 집계 실행

### 원천 전체 upsert

실행:

```bash
node server/crawler/scripts/rtms_ingest_apt_dev_sudogwon_range.js --from=202605 --to=202605 --scope=all --apiTotal=0 --throttle=120
```

결과:

- 원격 DB 행 단위 upsert로 인해 실행 도구의 20분 제한에 도달
- 제한 시점 부분 반영: 13,280행
- distinct tx_hash: 13,280
- 서울·인천과 경기 `41290` 진행 중까지 반영

### 중단 지점 이후 idempotent 복구

수동 복구를 위해 `--lawds=` 필터를 추가하고, `41290`부터 남은 경기 요청 코드만 재실행했다.

```bash
node server/crawler/scripts/rtms_ingest_apt_dev_sudogwon_range.js \
  --from=202605 --to=202605 --scope=gyeonggi \
  --lawds=41290,41310,41360,41370,41390,41410,41430,41450,41461,41463,41465,41480,41500,41550,41570,41591,41593,41595,41597,41610,41630,41650,41670,41800,41820,41830 \
  --apiTotal=0 --throttle=120
```

결과:

- 26개 요청 코드
- API items: 6,999
- upserted: 6,999
- skipped: 0
- errors: 0

### 지역 통계와 랭킹

```bash
node server/crawler/scripts/re_build_stats_ranks.js --sido=11 --level=dong --from=202605 --to=202605 --top=100 --timeframe=both --only=all
node server/crawler/scripts/re_build_stats_ranks.js --sido=28 --level=sigungu --from=202605 --to=202605 --top=100 --timeframe=both --only=all
node server/crawler/scripts/re_build_stats_ranks.js --sido=41 --level=sigungu --from=202605 --to=202605 --top=100 --timeframe=both --only=all
```

결과: 세 명령 모두 성공.

### 단지 통계

```bash
node server/crawler/scripts/re_build_apt_stats.js --from=202605 --to=202605 --timeframe=both --bands=all,10,20,30,40,50
```

결과:

- `202605` 월 통계 전체 및 평형대별 생성 성공
- `2026` 연 통계 전체 및 평형대별 생성 성공

## 10. 실행 후 count

### 원천

| 항목 | 실행 후 |
| --- | ---: |
| latest `deal_ym` | `202605` |
| `202605` raw rows | 20,269 |
| distinct `tx_hash` | 20,269 |
| non-zero request lawd codes | 81 |
| `re_trade_deal_ym` `202605` 존재 | 1 |

시도별:

| 시도 | `202605` rows | `202604` rows | 전월 대비 |
| --- | ---: | ---: | ---: |
| 서울 `11` | 5,088 | 5,123 | 약 -0.7% |
| 인천 `28` | 2,337 | 2,454 | 약 -4.8% |
| 경기 `41` | 12,844 | 11,256 | 약 +14.1% |
| 합계 | 20,269 | 18,833 | 약 +7.6% |

세 지역 모두 0건 또는 비정상 급감 상태가 아니다.

화성 신규 요청 코드 저장 결과:

| req_lawd_cd | rows |
| --- | ---: |
| `41591` | 96 |
| `41593` | 134 |
| `41595` | 251 |
| `41597` | 1,096 |

### 집계

| 테이블/범위 | `202605` rows |
| --- | ---: |
| `re_stat_month_dong`, 서울 | 256 |
| `re_stat_month_sigungu`, 인천 | 9 |
| `re_stat_month_sigungu`, 경기 | 31 |
| `re_rank_month_dong`, 서울 | 500 |
| `re_rank_month_sigungu`, 인천 | 45 |
| `re_rank_month_sigungu`, 경기 | 155 |
| `re_trade_apt_stats_m`, 모든 평형대 | 15,617 |
| `re_trade_apt_stats_m`, `pyeong_band=all`, 서울 | 2,106 |
| `re_trade_apt_stats_m`, `pyeong_band=all`, 인천 | 857 |
| `re_trade_apt_stats_m`, `pyeong_band=all`, 경기 | 3,933 |
| `re_trade_apt_stats_y`, `deal_y=2026` | 27,615 |

월 집계의 거래량 합:

- 서울: 5,038
- 인천: 2,289
- 경기: 12,647

원천 대비 차이는 집계 SQL의 취소 거래 및 유효 데이터 조건 영향이다.

## 11. 대시보드/API 확인

실행 전 공개 API:

- `/api/re/options`: `maxYm=202604`
- `/api/re/trade-top?period=202605`: 서울·인천·경기 모두 0행

실행 후 공개 API:

- `/api/re/options`: `maxYm=202605`
- 최근 3개월: `202603`, `202604`, `202605`
- `/api/re/trade-top?period=202605&nocache=1`:
  - 서울: stats source, 데이터 반환
  - 인천: stats source, 데이터 반환
  - 경기: stats source, 데이터 반환

`/market/real-estate`가 사용하는 기간 옵션과 stats API가 `202605`를 인식한다.

정적 생성 Top100 landing page는 다음 배포/build 전까지 기존 정적 HTML을 유지할 수 있다.

## 12. 실패 또는 누락 지역

- 수집 API 오류: 0
- 서울 누락: 없음
- 경기 누락: 없음
- 화성 신규 4개 구: 반영 완료
- 인천 옹진군 `28720`: 국토부 API 0건
- DB에 존재하는 non-zero 요청 코드: 81개
- 전체 요청 지역 82개 중 옹진군 1개만 API 0건

## 13. 재발 방지 보완

### 이번 작업에서 반영

1. `--countOnly=1`
   - DB 연결/쓰기 없이 대상 월 API 공개 건수와 시도별 상태 확인
2. `--lawds=...`
   - 중단 또는 일부 지역 실패 시 요청 법정구 코드만 idempotent 복구
   - 부분 실행은 기본적으로 기간 목록을 공개하지 않으며, 전체 완료 확인 후에만 `--publishMonth=1` 사용
3. 시도별 summary 로그
   - `fetches`, `items`, `zeroAreas`, `errors`
4. wrapper ingest 검증 강화
   - 전체 `totalItems=0` 실패 처리
   - 서울·인천·경기 중 한 시도라도 0건이면 실패 처리
   - 시도별 오류가 있으면 집계 단계 중단
5. 빈 월 노출 방지
   - 실제 upsert 행이 있을 때만 `re_trade_deal_ym`에 대상 월 추가
6. dry-run 개선
   - dry-run에서는 `flock`을 요구하지 않아 Windows Git Bash에서도 명령 구성을 확인 가능
7. 화성시 신규 4개 구 요청 코드 반영
8. 운영 문서 보완
   - count-only, 부분 복구, 정확한 DB SQL
   - `CRON_TZ=Asia/Seoul`
   - 매월 3·4·5일 재시도 예시

### 운영 서버에서 추가로 필요한 작업

아래 작업은 운영 서버 접근 권한이 없어 이번 실행 환경에서는 적용하지 못했다.

1. 실제 cron 등록 확인:

```bash
crontab -l
```

2. 권장 cron:

```cron
CRON_TZ=Asia/Seoul
30 3 3,4,5 * * /bin/bash /path/to/finmap/ops/run_real_estate_monthly_batch.sh >> /path/to/finmap/logs/real_estate_monthly_cron.log 2>&1
```

3. 월 6일 health check:
   - `/api/re/options`의 `maxYm`이 전월인지 확인
   - 아니면 알림 및 수동 실행
4. 마지막 성공 `targetYm`, 성공 시각, 총 건수, 시도별 건수를 별도 health table 또는 monitoring log에 저장
5. 법정구역 코드 변경을 월간 count-only의 `zeroAreas`로 점검

## 14. DB 점검 SQL

```sql
SELECT MAX(deal_ym) AS latest_deal_ym
FROM re_trade_apt;

SELECT COUNT(*) AS raw_count,
       COUNT(DISTINCT tx_hash) AS distinct_tx_hash
FROM re_trade_apt
WHERE deal_ym = '202605';

SELECT LEFT(lawd_cd, 2) AS sido_code,
       COUNT(*) AS raw_count
FROM re_trade_apt
WHERE deal_ym = '202605'
GROUP BY LEFT(lawd_cd, 2)
ORDER BY sido_code;

SELECT deal_ym,
       LEFT(lawd_cd, 2) AS sido_code,
       COUNT(*) AS raw_count
FROM re_trade_apt
WHERE deal_ym BETWEEN '202603' AND '202605'
GROUP BY deal_ym, LEFT(lawd_cd, 2)
ORDER BY deal_ym, sido_code;

SELECT MAX(deal_ym) AS latest_deal_ym,
       SUM(deal_ym = '202605') AS target_count
FROM re_stat_month_dong;

SELECT MAX(deal_ym) AS latest_deal_ym,
       SUM(deal_ym = '202605') AS target_count
FROM re_stat_month_sigungu;

SELECT MAX(deal_ym) AS latest_deal_ym,
       SUM(deal_ym = '202605') AS target_count
FROM re_rank_month_dong;

SELECT MAX(deal_ym) AS latest_deal_ym,
       SUM(deal_ym = '202605') AS target_count
FROM re_rank_month_sigungu;

SELECT MAX(deal_ym) AS latest_deal_ym,
       SUM(deal_ym = '202605') AS target_count
FROM re_trade_apt_stats_m;

SHOW INDEX FROM re_trade_apt WHERE Non_unique = 0;
```

## 15. 변경 파일

- `server/crawler/scripts/rtms_ingest_apt_dev_sudogwon_range.js`
- `ops/run_real_estate_monthly_batch.sh`
- `docs/real-estate-monthly-batch.md`
- `reports/real-estate-monthly-scheduler-2026-06-audit.md`

## 16. 실행 명령과 결과 요약

| 명령/점검 | 결과 |
| --- | --- |
| 저장소 scheduler/cron/PM2 검색 | 부동산 월간 job은 외부 crontab 예시에만 존재 |
| 공개 `/api/re/options` 사전 확인 | `maxYm=202604` |
| 공개 `/api/re/trade-top` 사전 확인 | `202605` 서울·인천·경기 0행 |
| 운영 DB 사전 count | raw/summary 모두 `202605` 0건 |
| `SHOW INDEX FROM re_trade_apt` | `PRIMARY (tx_hash)` 확인 |
| wrapper dry-run | `targetYm=202605`, 실행 단계 확인 |
| count-only 수정 전 | 18,952 items, 화성 기존 코드 0 |
| 화성 신규 4개 구 API 확인 | 합계 1,578 items |
| count-only 수정 후 | 20,530 items, errors 0 |
| `lawds=41591 --countOnly=1` 안전장치 확인 | `publishMonth=0`, DB skipped, 96 items, errors 0 |
| 전체 원천 upsert | 20분 제한으로 부분 반영 13,280행 |
| `--lawds` 부분 복구 | 남은 경기 26개 코드, 6,999 upsert, errors 0 |
| 지역 통계/랭킹 3개 명령 | 모두 성공 |
| 단지 월/연 통계 명령 | 성공 |
| 운영 DB 후검증 | raw 20,269, distinct hash 20,269, latest `202605` |
| 공개 API 후검증 | `maxYm=202605`, 세 지역 stats 반환 |
| `node --check` | 성공 |
| Bash `-n` | 성공 |
| `npm.cmd run build` | 성공, 정적 페이지 `209/209`, `next-sitemap` 성공 |
| `git diff --check` | whitespace error 없음, LF/CRLF 경고만 확인 |
| sitemap | build의 `lastmod` 재생성 churn만 발생하여 작업 범위에서 원복 |

## 17. 남은 확인

- 운영 서버에서 `crontab -l`과 cron daemon 로그를 확인해 이번 6월 3일 실행이 미등록, 경로 오류, 권한 오류 중 무엇이었는지 최종 확정해야 한다.
- 권장 3·4·5일 재시도 cron을 실제 운영 서버에 등록해야 한다.
- 공개 API는 즉시 `202605`를 반환한다. 정적 Top100 landing page는 다음 배포/build 후 최신월 표시를 다시 확인한다.
