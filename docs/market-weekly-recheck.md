# Market Weekly Recheck 운영 가이드

## 1) 목적

`market_weekly_recheck`는 매주 토요일에 해당 주 월~금 마켓 데이터를 다시 수집해 운영 데이터의 누락과 값 차이를 점검하기 위한 배치입니다.

- 운영 테이블(`MARKETS_WORLD_INDICES_INFO`, `STOCK_INVEST_INFO`, `MARKET_SITE_ETF_STOCK_INFO`)은 직접 수정하지 않습니다.
- 재수집 데이터는 stage 테이블에 저장합니다.
- 운영 테이블과 stage 테이블을 비교한 결과는 `MARKET_WEEKLY_RECHECK_DIFF`에 기록합니다.
- 운영 반영 apply 기능은 없습니다.

## 2) 사전 준비

먼저 신규 검증 테이블 생성 SQL을 적용합니다.

```sql
-- 적용 대상 파일
-- sql/20260502_create_market_weekly_recheck_tables.sql
```

생성 테이블 확인 SQL:

```sql
SHOW TABLES LIKE 'MARKET_WEEKLY_RECHECK_RUN';
SHOW TABLES LIKE 'MARKETS_WORLD_INDICES_INFO_WEEKLY_STAGE';
SHOW TABLES LIKE 'STOCK_INVEST_INFO_WEEKLY_STAGE';
SHOW TABLES LIKE 'MARKET_WEEKLY_RECHECK_DIFF';
```

기본 구조 확인:

```sql
SHOW CREATE TABLE MARKET_WEEKLY_RECHECK_RUN;
SHOW CREATE TABLE MARKETS_WORLD_INDICES_INFO_WEEKLY_STAGE;
SHOW CREATE TABLE STOCK_INVEST_INFO_WEEKLY_STAGE;
SHOW CREATE TABLE MARKET_WEEKLY_RECHECK_DIFF;
```

## 3) 수동 실행 명령

dryRun으로 실행 계획만 확인:

```bash
node server/crawler/scripts/market_weekly_recheck.js --week=today --targets=all --dryRun=1 --debug=1
```

하루치 world stage 수집:

```bash
node server/crawler/scripts/market_weekly_recheck.js --from=2026-05-04 --to=2026-05-04 --targets=world --debug=1
```

하루치 stock stage 수집:

```bash
node server/crawler/scripts/market_weekly_recheck.js --from=2026-05-04 --to=2026-05-04 --targets=stock --debug=1
```

일주일치 all stage 수집:

```bash
node server/crawler/scripts/market_weekly_recheck.js --week=today --targets=all --debug=1 --throttle=500
```

특정 기간 all stage 수집:

```bash
node server/crawler/scripts/market_weekly_recheck.js --from=2026-05-04 --to=2026-05-08 --targets=all --debug=1 --throttle=500
```

compareOnly world:

```bash
node server/crawler/scripts/market_weekly_recheck.js --compareOnly=1 --runId=123 --targets=world --debug=1
```

compareOnly stock:

```bash
node server/crawler/scripts/market_weekly_recheck.js --compareOnly=1 --runId=123 --targets=stock --compareStockValue=0 --debug=1
```

stock 값 차이까지 비교할 때:

```bash
node server/crawler/scripts/market_weekly_recheck.js --compareOnly=1 --runId=123 --targets=stock --compareStockValue=1 --debug=1
```

## 4) 점검 SQL

최근 run 조회:

```sql
SELECT
  run_id,
  week_start_date,
  week_end_date,
  target_from_date,
  target_to_date,
  status,
  total_count,
  success_count,
  fail_count,
  diff_count,
  high_diff_count,
  started_at,
  finished_at,
  message
FROM MARKET_WEEKLY_RECHECK_RUN
ORDER BY run_id DESC
LIMIT 20;
```

stage count 조회:

```sql
SELECT run_id, INDEX_DATE, INDEX_SITE_ID, COUNT(*) AS cnt
FROM MARKETS_WORLD_INDICES_INFO_WEEKLY_STAGE
WHERE run_id = 123
GROUP BY run_id, INDEX_DATE, INDEX_SITE_ID
ORDER BY INDEX_DATE, INDEX_SITE_ID;

SELECT run_id, KSP_STOCK_DATE, COUNT(*) AS cnt
FROM STOCK_INVEST_INFO_WEEKLY_STAGE
WHERE run_id = 123
GROUP BY run_id, KSP_STOCK_DATE
ORDER BY KSP_STOCK_DATE;
```

diff 요약:

```sql
SELECT diff_type, severity, COUNT(*) AS cnt
FROM MARKET_WEEKLY_RECHECK_DIFF
WHERE run_id = 123
GROUP BY diff_type, severity
ORDER BY severity, diff_type;
```

HIGH diff 상세:

```sql
SELECT
  table_name,
  target_date,
  indicator_code,
  source_id,
  diff_type,
  column_name,
  main_value,
  stage_value,
  diff_value,
  tolerance,
  severity,
  note,
  checked_at
FROM MARKET_WEEKLY_RECHECK_DIFF
WHERE run_id = 123
  AND severity = 'HIGH'
ORDER BY target_date, indicator_code, source_id, column_name
LIMIT 200;
```

unresolved diff 조회:

```sql
SELECT
  diff_id,
  run_id,
  table_name,
  target_date,
  indicator_code,
  source_id,
  diff_type,
  column_name,
  main_value,
  stage_value,
  severity,
  resolved_yn,
  checked_at
FROM MARKET_WEEKLY_RECHECK_DIFF
WHERE resolved_yn = 'N'
ORDER BY run_id DESC, severity DESC, target_date, indicator_code
LIMIT 200;
```

## 5) cron 예시

아래는 stage 수집과 compareOnly를 cron 3줄로 분리한 예시입니다. 다만 이 방식은 stage 수집이 04:10 이전에 끝나지 않으면 compare가 먼저 실행될 수 있고, `run_id` 조회 조건이 느슨하면 다른 실행 건을 가져올 위험이 있습니다. 운영에서는 바로 아래의 wrapper script 방식을 권장합니다.

```bash
# crontab -e
# mysql 명령에는 운영 DB 접속 옵션이 필요합니다.
# 예: mysql -u$DB_USER -p$DB_PASSWORD -h$DB_HOST -D$DB_NAME -N -B -e "..."
# 단, 비밀번호를 crontab에 직접 쓰는 것은 권장하지 않습니다.
# .my.cnf 또는 환경변수 기반 wrapper script를 사용하세요.

30 3 * * 6 cd /path/to/finmap && /usr/bin/node server/crawler/scripts/market_weekly_recheck.js --week=today --targets=all --throttle=500 --debug=1 >> logs/market_weekly_recheck_stage.log 2>&1
10 4 * * 6 cd /path/to/finmap && RUN_ID=$(mysql -u$DB_USER -p$DB_PASSWORD -h$DB_HOST -D$DB_NAME -N -B -e "SELECT run_id FROM MARKET_WEEKLY_RECHECK_RUN WHERE DATE(created_at) = CURDATE() AND targets LIKE '%world%' ORDER BY run_id DESC LIMIT 1") && /usr/bin/node server/crawler/scripts/market_weekly_recheck.js --compareOnly=1 --runId=$RUN_ID --targets=world --debug=1 >> logs/market_weekly_recheck_compare_world.log 2>&1
20 4 * * 6 cd /path/to/finmap && RUN_ID=$(mysql -u$DB_USER -p$DB_PASSWORD -h$DB_HOST -D$DB_NAME -N -B -e "SELECT run_id FROM MARKET_WEEKLY_RECHECK_RUN WHERE DATE(created_at) = CURDATE() AND targets LIKE '%world%' ORDER BY run_id DESC LIMIT 1") && /usr/bin/node server/crawler/scripts/market_weekly_recheck.js --compareOnly=1 --runId=$RUN_ID --targets=stock --compareStockValue=0 --debug=1 >> logs/market_weekly_recheck_compare_stock.log 2>&1
```

`run_id` 조회는 단순 `ORDER BY run_id DESC LIMIT 1`만 사용하지 않는 것이 좋습니다. 위 예시는 오늘 생성된 run 중 `targets`에 `world`가 포함된 실행만 가져옵니다. 운영 DB와 서버의 날짜/타임존이 다르면 `DATE(created_at) = CURDATE()` 대신 `started_at >= NOW() - INTERVAL 6 HOUR` 같은 최근 N시간 조건을 사용할 수 있습니다.

권장 운영 방식은 `scripts/run_market_weekly_recheck.sh` 또는 `ops/run_market_weekly_recheck.sh` 같은 wrapper script 하나를 만들고, cron은 이 스크립트 하나만 실행하는 것입니다. 이렇게 하면 stage 수집 완료 후 같은 프로세스에서 방금 생성된 `run_id`를 조회하고 compare를 순서대로 실행할 수 있습니다.

wrapper script 초안:

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/path/to/finmap"
NODE_BIN="/usr/bin/node"
LOG_DIR="$APP_DIR/logs"

cd "$APP_DIR"
mkdir -p "$LOG_DIR"

# 권장: DB 접속 정보는 .my.cnf 또는 안전한 환경변수/secret manager에서 주입합니다.
# MYSQL="mysql --defaults-extra-file=/path/to/.my.cnf -N -B"
MYSQL="mysql -u$DB_USER -p$DB_PASSWORD -h$DB_HOST -D$DB_NAME -N -B"

STAGE_LOG="$LOG_DIR/market_weekly_recheck_stage_$(date +%Y%m%d).log"
WORLD_COMPARE_LOG="$LOG_DIR/market_weekly_recheck_compare_world_$(date +%Y%m%d).log"
STOCK_COMPARE_LOG="$LOG_DIR/market_weekly_recheck_compare_stock_$(date +%Y%m%d).log"

echo "[stage] start $(date -Is)" >> "$STAGE_LOG"
$NODE_BIN server/crawler/scripts/market_weekly_recheck.js \
  --week=today \
  --targets=all \
  --throttle=500 \
  --debug=1 >> "$STAGE_LOG" 2>&1

RUN_ID=$($MYSQL -e "
SELECT run_id
FROM MARKET_WEEKLY_RECHECK_RUN
WHERE DATE(created_at) = CURDATE()
  AND targets LIKE '%world%'
ORDER BY run_id DESC
LIMIT 1;
")

if [ -z "$RUN_ID" ]; then
  echo "[error] run_id not found after stage collection" >&2
  exit 1
fi

echo "[compare:world] run_id=$RUN_ID start $(date -Is)" >> "$WORLD_COMPARE_LOG"
$NODE_BIN server/crawler/scripts/market_weekly_recheck.js \
  --compareOnly=1 \
  --runId="$RUN_ID" \
  --targets=world \
  --debug=1 >> "$WORLD_COMPARE_LOG" 2>&1

echo "[compare:stock] run_id=$RUN_ID start $(date -Is)" >> "$STOCK_COMPARE_LOG"
$NODE_BIN server/crawler/scripts/market_weekly_recheck.js \
  --compareOnly=1 \
  --runId="$RUN_ID" \
  --targets=stock \
  --compareStockValue=0 \
  --debug=1 >> "$STOCK_COMPARE_LOG" 2>&1

echo "[done] run_id=$RUN_ID $(date -Is)"
```

최종 추천 cron 예시:

```bash
# crontab -e
30 3 * * 6 /bin/bash /path/to/finmap/ops/run_market_weekly_recheck.sh >> /path/to/finmap/logs/market_weekly_recheck_cron.log 2>&1
```

운영에서는 DB 접속 옵션, 환경 변수 로딩 방식, Node 경로, 로그 디렉터리 경로를 서버 환경에 맞게 조정합니다.

## 6) 주의사항

- 운영 테이블에는 write 금지입니다. 이 배치는 운영 테이블을 비교 대상으로만 사용합니다.
- `compareScope=yhfOnly`가 기본값입니다. world 비교는 Yahoo Finance(`INDEX_SITE_ID='YHF'`) 기준으로 제한됩니다.
- `stock` stage는 Yahoo 기반 sanity snapshot입니다. 기본값 `compareStockValue=0`에서는 누락 여부만 비교하고 값 차이는 기록하지 않습니다.
- `allowEmptyStage=0`이 기본값입니다. stage row가 0건이면 대량 `MISSING_IN_STAGE` diff 생성을 막기 위해 비교를 중단합니다.
- `allowEmptyStage=1`은 의도적으로 빈 stage와 운영 테이블을 비교해야 할 때만 사용합니다.
- 운영 반영 apply 기능은 없습니다. diff 확인 후 운영 테이블 수정이 필요하면 별도 절차로 분리합니다.

## 7) 장애 대응

stage row가 0건인 경우:

- `MARKET_WEEKLY_RECHECK_RUN.status`, `message`를 먼저 확인합니다.
- stage 수집 명령이 정상 종료됐는지 로그를 확인합니다.
- `--allowEmptyStage=0` 기본값이면 compareOnly는 diff 대량 생성 없이 실패 또는 부분 실패로 종료됩니다.
- 잘못된 `runId`를 사용하지 않았는지 최근 run 조회 SQL로 확인합니다.

Yahoo quote 누락:

- run `message`에서 `NO_QUOTE_FOR_INDEX_DATE`, `NO_STD_QUOTE`, `MARKET_CLOSED_CANDIDATE`, `FETCH_ERROR` 여부를 확인합니다.
- 미국/한국 휴장일, 시차, 데이터 제공 지연 가능성을 함께 확인합니다.
- 동일 날짜를 `--targets=world --debug=1`로 재실행해 일시 오류인지 확인합니다.

`PARTIAL_FAILED` 발생:

- `success_count`, `fail_count`, `message`를 확인합니다.
- world 내부 실패가 stock raw_json 또는 run message에 남아 있는지 확인합니다.
- 일부 지표 실패라면 해당 `INDEX_ID`, `INDEX_SITE_ID`, 날짜를 기준으로 stage row와 운영 row를 비교합니다.

HIGH diff 발생 시 확인 순서:

1. `MISSING_IN_MAIN`인지 `VALUE_DIFF`인지 diff_type을 먼저 확인합니다.
2. `IF_SUCC_YN`, `INDEX_END_PRICE`, `INDEX_STD_PRICE`, `INDEX_MDF_STD_PRICE` 같은 핵심 컬럼 차이를 우선 확인합니다.
3. stage `raw_json`의 `collector`, `targetDate`, `indexDate`, `stdDate`, `quoteDateKey`, `stdQuoteDateKey`를 확인합니다.
4. 운영 테이블의 같은 key row를 SELECT로 조회해 날짜 key와 source id가 일치하는지 확인합니다.
5. Yahoo 데이터 지연이나 휴장 후보면 다음 실행일에 재수집 후 diff가 유지되는지 확인합니다.
