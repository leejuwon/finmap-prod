#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"

resolve_env_file() {
  if [[ -n "${ENV_FILE:-}" ]]; then
    echo "$ENV_FILE"
    return
  fi

  if [[ "${NODE_ENV:-}" == "production" ]]; then
    echo "$APP_DIR/.env.production"
    return
  fi

  if [[ -f "$APP_DIR/.env.local" ]]; then
    echo "$APP_DIR/.env.local"
    return
  fi

  echo "$APP_DIR/.env_local"
}

load_env_file() {
  local resolved_env_file
  resolved_env_file="$(resolve_env_file)"

  if [[ -f "$resolved_env_file" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "$resolved_env_file"
    set +a
    echo "[info] env loaded: $resolved_env_file"
    return
  fi

  echo "[warn] env file not found: $resolved_env_file; continuing with current environment or MYSQL_DEFAULTS_FILE" >&2
}

cd "$APP_DIR"
load_env_file

NODE_BIN="${NODE_BIN:-node}"
LOG_DIR="${LOG_DIR:-$APP_DIR/logs}"
MYSQL_DEFAULTS_FILE="${MYSQL_DEFAULTS_FILE:-}"
RUN_ID_LOOKBACK_HOURS="${RUN_ID_LOOKBACK_HOURS:-12}"

if [[ "$RUN_ID_LOOKBACK_HOURS" == "" || "$RUN_ID_LOOKBACK_HOURS" == *[!0-9]* ]]; then
  echo "[error] RUN_ID_LOOKBACK_HOURS must be a positive integer" >&2
  exit 1
fi
if (( RUN_ID_LOOKBACK_HOURS < 1 )); then
  echo "[error] RUN_ID_LOOKBACK_HOURS must be greater than 0" >&2
  exit 1
fi
mkdir -p "$LOG_DIR"

TODAY="$(date +%Y%m%d)"
STAGE_LOG="$LOG_DIR/market_weekly_recheck_stage_$TODAY.log"
WORLD_COMPARE_LOG="$LOG_DIR/market_weekly_recheck_compare_world_$TODAY.log"
STOCK_COMPARE_LOG="$LOG_DIR/market_weekly_recheck_compare_stock_$TODAY.log"

log() {
  echo "[$(date -Is)] $*"
}

build_mysql_command() {
  if [[ -n "$MYSQL_DEFAULTS_FILE" ]]; then
    if [[ ! -f "$MYSQL_DEFAULTS_FILE" ]]; then
      echo "[error] MYSQL_DEFAULTS_FILE not found: $MYSQL_DEFAULTS_FILE" >&2
      exit 1
    fi
    MYSQL_CMD=(mysql --defaults-extra-file="$MYSQL_DEFAULTS_FILE" --default-character-set=utf8mb4 -N -B)
    return
  fi

  local mysql_host="${DB_HOST:-${MYSQL_HOST:-}}"
  local mysql_user="${DB_USER:-${MYSQL_USER:-}}"
  local mysql_password="${DB_PASSWORD:-${MYSQL_PASSWORD:-}}"
  local mysql_database="${DB_NAME:-${MYSQL_DATABASE:-}}"

  : "${mysql_host:?DB_HOST or MYSQL_HOST is required when MYSQL_DEFAULTS_FILE is not set}"
  : "${mysql_user:?DB_USER or MYSQL_USER is required when MYSQL_DEFAULTS_FILE is not set}"
  : "${mysql_password:?DB_PASSWORD or MYSQL_PASSWORD is required when MYSQL_DEFAULTS_FILE is not set}"
  : "${mysql_database:?DB_NAME or MYSQL_DATABASE is required when MYSQL_DEFAULTS_FILE is not set}"

  MYSQL_CMD=(mysql -h"$mysql_host" -u"$mysql_user" "-p$mysql_password" -D"$mysql_database" --default-character-set=utf8mb4 -N -B)
}

fetch_latest_run_id() {
  local query
  local raw

  query="
SELECT run_id
FROM MARKET_WEEKLY_RECHECK_RUN
WHERE targets LIKE '%world%'
  AND (
    DATE(created_at) = CURDATE()
    OR started_at >= DATE_SUB(NOW(), INTERVAL $RUN_ID_LOOKBACK_HOURS HOUR)
  )
ORDER BY run_id DESC
LIMIT 1;
"

  raw="$("${MYSQL_CMD[@]}" -e "$query")"
  raw="${raw//$'\r'/}"
  echo "${raw%%$'\n'*}"
}

build_mysql_command

log "[stage] start" | tee -a "$STAGE_LOG"
"$NODE_BIN" server/crawler/scripts/market_weekly_recheck.js \
  --week=today \
  --targets=all \
  --throttle=500 \
  --debug=1 >> "$STAGE_LOG" 2>&1
log "[stage] done" | tee -a "$STAGE_LOG"

RUN_ID="$(fetch_latest_run_id)"

if [[ -z "$RUN_ID" ]]; then
  echo "[error] run_id not found after stage collection" >&2
  exit 1
fi

log "[compare:world] run_id=$RUN_ID start" | tee -a "$WORLD_COMPARE_LOG"
"$NODE_BIN" server/crawler/scripts/market_weekly_recheck.js \
  --compareOnly=1 \
  --runId="$RUN_ID" \
  --targets=world \
  --debug=1 >> "$WORLD_COMPARE_LOG" 2>&1
log "[compare:world] run_id=$RUN_ID done" | tee -a "$WORLD_COMPARE_LOG"

log "[compare:stock] run_id=$RUN_ID start" | tee -a "$STOCK_COMPARE_LOG"
"$NODE_BIN" server/crawler/scripts/market_weekly_recheck.js \
  --compareOnly=1 \
  --runId="$RUN_ID" \
  --targets=stock \
  --compareStockValue=0 \
  --debug=1 >> "$STOCK_COMPARE_LOG" 2>&1
log "[compare:stock] run_id=$RUN_ID done" | tee -a "$STOCK_COMPARE_LOG"

log "[done] run_id=$RUN_ID"
