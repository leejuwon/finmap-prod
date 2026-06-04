# Real Estate Monthly Batch 운영 가이드

## 1) 목적

매월 초 전월 수도권 아파트 실거래 데이터를 수집하고, 부동산 대시보드에서 사용하는 통계와 랭킹을 재집계합니다.

- 대상 지역: 서울, 인천, 경기
- 기본 대상 월: 실행일 기준 전월 `YYYYMM`
- 실행 wrapper: `ops/run_real_estate_monthly_batch.sh`

## 2) 실행 대상

1. `server/crawler/scripts/rtms_ingest_apt_dev_sudogwon_range.js`
   - 국토부 아파트 실거래 OpenAPI 수집
   - `re_trade_apt`에 `tx_hash` 기준 upsert
   - `re_trade_deal_ym`, `re_trade_meta`, `re_trade_area_dim` 보조 테이블 갱신

2. `server/crawler/scripts/re_build_stats_ranks.js`
   - 지역별 월/연 통계와 Top N 랭킹 재생성
   - 서울은 `dong`, 인천/경기는 `sigungu` 기준

3. `server/crawler/scripts/re_build_apt_stats.js`
   - 단지별 월/연 통계 재생성
   - 평형대별 통계 포함

## 3) 수동 실행

DB 쓰기 전 API count-only 점검:

```bash
NODE_ENV=production node server/crawler/scripts/rtms_ingest_apt_dev_sudogwon_range.js --from=202605 --to=202605 --scope=all --countOnly=1 --throttle=120
```

`countOnly=1`은 국토부 API만 조회하고 DB 연결, insert, update, 집계를 실행하지 않습니다. 완료 로그의 `totalItems`, `totalErrors`와 시도별 `[sido:summary]`를 확인합니다.

일부 법정구 코드만 복구 실행:

```bash
node server/crawler/scripts/rtms_ingest_apt_dev_sudogwon_range.js --from=202605 --to=202605 --scope=gyeonggi --lawds=41591,41593,41595,41597 --throttle=120
```

`lawds`는 comma-separated 요청 법정구 코드 필터입니다. 전체 실행이 중간에 중단되었을 때 미완료 코드만 idempotent upsert할 수 있습니다.

부분 실행은 기본적으로 `re_trade_deal_ym`에 대상 월을 공개하지 않습니다. 전체 누락 코드와 집계 완료를 확인한 최종 복구 실행에서만 `--publishMonth=1`을 명시합니다.

dryRun:

```bash
DRY_RUN=1 bash ops/run_real_estate_monthly_batch.sh --ym=202604
bash ops/run_real_estate_monthly_batch.sh --ym=202604 --dryRun=1
```

dryRun은 실제 명령을 출력만 하며 중복 실행 lock을 획득하지 않습니다.

특정 월 실행:

```bash
TARGET_YM=202604 bash ops/run_real_estate_monthly_batch.sh
bash ops/run_real_estate_monthly_batch.sh --ym=202604
```

기본 전월 실행:

```bash
bash ops/run_real_estate_monthly_batch.sh
```

실행 권한 부여:

```bash
chmod +x ops/run_real_estate_monthly_batch.sh
```

## 4) 로그 확인

전체 로그:

```bash
ls -lt logs/real_estate_monthly_batch_*.log
tail -n 100 logs/real_estate_monthly_batch_202604_YYYYMMDD_HHMMSS.log
```

단계별 로그:

```bash
ls -lt logs/real_estate_monthly_ingest_202604_*.log
ls -lt logs/real_estate_monthly_rank_11_202604_*.log
ls -lt logs/real_estate_monthly_rank_28_202604_*.log
ls -lt logs/real_estate_monthly_rank_41_202604_*.log
ls -lt logs/real_estate_monthly_apt_stats_both_202604_*.log
ls -lt logs/real_estate_monthly_apt_stats_month_202604_*.log
ls -lt logs/real_estate_monthly_apt_stats_year_202604_*.log
```

ingest 성공 확인:

```bash
grep -E '\[done\].*totalErrors=[0-9]+' logs/real_estate_monthly_ingest_202604_*.log
```

정상이라면 `totalErrors=0`이어야 합니다. wrapper는 이 marker를 찾지 못하거나 `totalErrors`가 0이 아니면 실패로 처리합니다.

wrapper는 다음 조건에서도 집계 단계로 넘어가지 않습니다.

- 전체 `totalItems=0`
- 서울(`11`), 인천(`28`), 경기(`41`) 중 하나의 수집 건수가 0
- 시도별 수집 오류가 1건 이상

실패 단계 확인:

```bash
grep -E '\[step:failed\]|\[ingest:failed\]' logs/real_estate_monthly_batch_202604_*.log
```

## 5) cron 등록

cron 등록은 저장소 배포만으로 자동 적용되지 않습니다. 운영 서버에서 `crontab -l`로 실제 등록 상태를 별도로 확인해야 합니다.

매월 3일, 4일, 5일 03:30 재시도 실행 예시:

```bash
# crontab -e
CRON_TZ=Asia/Seoul
30 3 3,4,5 * * /bin/bash /path/to/finmap/ops/run_real_estate_monthly_batch.sh >> /path/to/finmap/logs/real_estate_monthly_cron.log 2>&1
```

수집은 `tx_hash` 기준 upsert이고 집계는 대상 기간을 재생성하므로 같은 월 재실행을 전제로 합니다. 운영 DB에서는 실제 `re_trade_apt.tx_hash` unique index를 `SHOW INDEX`로 먼저 확인합니다.

등록 확인:

```bash
crontab -l
```

서버 timezone 확인:

```bash
date
timedatectl
```

wrapper는 `TZ=Asia/Seoul` 기준으로 전월을 계산합니다. cron 실행 시각 자체는 cron daemon의 timezone을 따르므로 `CRON_TZ=Asia/Seoul` 또는 서버 timezone 설정을 별도로 확인합니다.

2026-06-01부터 2026-06-30 사이 기본 target month는 `202605`입니다.

## 6) DB 상태 점검 SQL

운영 DB에서 수집 전후 동일하게 실행합니다.

```sql
SELECT MAX(deal_ym) AS latest_deal_ym FROM re_trade_apt;
SELECT COUNT(*) AS raw_count FROM re_trade_apt WHERE deal_ym = '202605';
SELECT LEFT(lawd_cd, 2) AS sido_code, COUNT(*) AS raw_count
FROM re_trade_apt
WHERE deal_ym = '202605'
GROUP BY LEFT(lawd_cd, 2)
ORDER BY sido_code;
SELECT deal_ym, COUNT(*) AS raw_count
FROM re_trade_apt
WHERE deal_ym BETWEEN '202603' AND '202605'
GROUP BY deal_ym
ORDER BY deal_ym;

SELECT MAX(deal_ym) AS latest_deal_ym, SUM(deal_ym = '202605') AS target_count FROM re_stat_month_dong;
SELECT MAX(deal_ym) AS latest_deal_ym, SUM(deal_ym = '202605') AS target_count FROM re_stat_month_sigungu;
SELECT MAX(deal_ym) AS latest_deal_ym, SUM(deal_ym = '202605') AS target_count FROM re_rank_month_dong;
SELECT MAX(deal_ym) AS latest_deal_ym, SUM(deal_ym = '202605') AS target_count FROM re_rank_month_sigungu;
SELECT MAX(deal_ym) AS latest_deal_ym, SUM(deal_ym = '202605') AS target_count FROM re_trade_apt_stats_m;

SHOW INDEX FROM re_trade_apt WHERE Non_unique = 0;
```

## 7) 주의사항

- `.env.production` 전체를 shell에서 `source`하지 않습니다.
- dotenv 값에 공백, 괄호, 특수문자가 있으면 bash syntax error가 날 수 있습니다.
- wrapper는 Node 실행 시 `NODE_ENV=production`, `DOTENV=.env.production`, `TZ=Asia/Seoul`만 전달합니다.
- `re_build_stats_ranks.js`는 `NODE_ENV=production`만으로 `.env.production`을 읽지 않으므로 `DOTENV=.env.production`이 필요합니다.
- `/tmp/finmap_real_estate_monthly_batch.lock` 기반 `flock`으로 중복 실행을 막습니다.
- ingest는 일부 지역 실패에도 exit code 0일 수 있어 `totalErrors=0` 확인이 필요합니다.
- rank/stat 재생성에는 `DELETE 후 INSERT` 구간이 있습니다.
- 중간 실패 시 같은 `TARGET_YM`으로 월배치 전체 재실행을 권장합니다.
- 국토부 전월 데이터 확정이 지연될 수 있으므로 매월 2일보다 3일 실행이 더 안전합니다.
- cron 재시도 후에도 `totalItems=0`이거나 특정 시도가 0건이면 성공으로 간주하지 않습니다.
- 법정구역 개편 시 요청 법정구 코드 목록을 갱신합니다. 2026-02-01 이후 화성시는 `41591`, `41593`, `41595`, `41597` 요청 코드를 사용합니다.

## 8) 장애 대응

API 호출 실패:

- ingest 단계 로그에서 `[error] ym=... req=...` 라인을 확인합니다.
- 국토부 API 일시 장애, 인증키 만료, 호출 제한, 특정 지역 응답 오류 가능성을 확인합니다.
- `totalErrors`가 0이 아니면 같은 `TARGET_YM`으로 전체 재실행합니다.

DB 연결 실패:

- `.env.production`의 `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`를 확인합니다.
- 서버에서 DB 접속 가능 여부를 별도 mysql client로 확인합니다.
- DB 연결 실패는 보통 해당 Node 스크립트가 `process.exit(1)`로 종료합니다.

특정 단계 실패:

- 전체 로그에서 `[step:failed]` 라인을 찾습니다.
- 표시된 단계별 로그 파일을 확인합니다.
- rank/stat 단계는 중간 실패 시 일부 기간/밴드가 비어 있을 수 있으므로 같은 월 전체 재실행을 권장합니다.

이미 실행 중 lock 발생:

- 메시지 예: `real estate monthly batch is already running`
- 실제 프로세스가 실행 중인지 확인합니다.
- 프로세스가 없는데 lock 파일만 남은 경우 `/tmp/finmap_real_estate_monthly_batch.lock` 삭제 후 재실행합니다.

`TARGET_YM` 오입력:

- `TARGET_YM`은 `YYYYMM` 형식이어야 합니다.
- 월은 `01`부터 `12`까지만 허용됩니다.
- 예: `202604`

`totalErrors marker not found`:

- ingest 스크립트가 정상 종료 로그까지 도달하지 못했을 가능성이 큽니다.
- ingest 단계 로그의 마지막 100줄을 확인합니다.
- marker가 없으면 wrapper는 안전하게 실패로 처리합니다.
