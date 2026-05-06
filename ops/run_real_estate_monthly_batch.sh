#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
NODE_BIN="${NODE_BIN:-node}"
LOG_DIR="${LOG_DIR:-$APP_DIR/logs}"
LOCK_FILE="${LOCK_FILE:-/tmp/finmap_real_estate_monthly_batch.lock}"
BATCH_TZ="${BATCH_TZ:-Asia/Seoul}"
DRY_RUN="${DRY_RUN:-0}"
TARGET_YM="${TARGET_YM:-}"

usage() {
  cat <<'USAGE'
Usage:
  TARGET_YM=202604 bash ops/run_real_estate_monthly_batch.sh
  bash ops/run_real_estate_monthly_batch.sh --ym=202604
  DRY_RUN=1 bash ops/run_real_estate_monthly_batch.sh --ym=202604
  bash ops/run_real_estate_monthly_batch.sh --ym=202604 --dryRun=1
USAGE
}

default_target_ym() {
  TZ="$BATCH_TZ" date -d "$(TZ="$BATCH_TZ" date +%Y-%m-01) -1 day" +%Y%m
}

validate_ym() {
  local ym="$1"
  if [[ ! "$ym" =~ ^[0-9]{6}$ ]]; then
    echo "[error] TARGET_YM must be YYYYMM: $ym" >&2
    exit 1
  fi

  local mm="${ym:4:2}"
  if (( 10#$mm < 1 || 10#$mm > 12 )); then
    echo "[error] TARGET_YM month must be 01-12: $ym" >&2
    exit 1
  fi
}

for raw_arg in "$@"; do
  case "$raw_arg" in
    --ym=*)
      TARGET_YM="${raw_arg#--ym=}"
      ;;
    --dryRun=*)
      DRY_RUN="${raw_arg#--dryRun=}"
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "[error] unknown argument: $raw_arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$TARGET_YM" ]]; then
  TARGET_YM="$(default_target_ym)"
fi

validate_ym "$TARGET_YM"

if [[ "$DRY_RUN" != "0" && "$DRY_RUN" != "1" ]]; then
  echo "[error] DRY_RUN must be 0 or 1: $DRY_RUN" >&2
  exit 1
fi

cd "$APP_DIR"
mkdir -p "$LOG_DIR"

STAMP="$(TZ="$BATCH_TZ" date +%Y%m%d_%H%M%S)"
BATCH_LOG="$LOG_DIR/real_estate_monthly_batch_${TARGET_YM}_${STAMP}.log"
INGEST_LOG="$LOG_DIR/real_estate_monthly_ingest_${TARGET_YM}_${STAMP}.log"
RANK_11_LOG="$LOG_DIR/real_estate_monthly_rank_11_${TARGET_YM}_${STAMP}.log"
RANK_28_LOG="$LOG_DIR/real_estate_monthly_rank_28_${TARGET_YM}_${STAMP}.log"
RANK_41_LOG="$LOG_DIR/real_estate_monthly_rank_41_${TARGET_YM}_${STAMP}.log"
APT_STATS_BOTH_LOG="$LOG_DIR/real_estate_monthly_apt_stats_both_${TARGET_YM}_${STAMP}.log"
APT_STATS_MONTH_LOG="$LOG_DIR/real_estate_monthly_apt_stats_month_${TARGET_YM}_${STAMP}.log"
APT_STATS_YEAR_LOG="$LOG_DIR/real_estate_monthly_apt_stats_year_${TARGET_YM}_${STAMP}.log"

log_msg() {
  local line
  line="[$(TZ="$BATCH_TZ" date -Is)] $*"
  echo "$line" | tee -a "$BATCH_LOG"
}

print_command() {
  printf '%q ' "$@"
  printf '\n'
}

fail_step() {
  local step_name="$1"
  local step_log="$2"
  local exit_code="${3:-1}"
  log_msg "[step:failed] $step_name exit=$exit_code log=$step_log"
  exit "$exit_code"
}

cleanup_lock() {
  local exit_code=$?
  if [[ "${LOCK_ACQUIRED:-0}" == "1" ]]; then
    flock -u 9 || true
    rm -f "$LOCK_FILE" || true
  fi
  exit "$exit_code"
}

acquire_lock() {
  if ! command -v flock >/dev/null 2>&1; then
    echo "[error] flock command is required for duplicate-run protection" >&2
    exit 1
  fi

  exec 9>>"$LOCK_FILE"
  if ! flock -n 9; then
    echo "[error] real estate monthly batch is already running: $LOCK_FILE" >&2
    exit 1
  fi

  LOCK_ACQUIRED=1
  trap cleanup_lock EXIT
  : > "$LOCK_FILE"
  echo "$$" 1>&9
}

run_step() {
  local step_name="$1"
  local step_log="$2"
  shift 2
  local -a cmd=("$@")

  log_msg "[step:start] $step_name log=$step_log"
  {
    echo "[$(TZ="$BATCH_TZ" date -Is)] [step:start] $step_name"
    echo "[cmd] $(print_command "${cmd[@]}")"
  } >> "$step_log"

  if [[ "$DRY_RUN" == "1" ]]; then
    log_msg "[dryRun] $step_name: $(print_command "${cmd[@]}")"
    echo "[$(TZ="$BATCH_TZ" date -Is)] [dryRun] skipped" >> "$step_log"
    return 0
  fi

  if "${cmd[@]}" >> "$step_log" 2>&1; then
    echo "[$(TZ="$BATCH_TZ" date -Is)] [step:done] $step_name" >> "$step_log"
    log_msg "[step:done] $step_name"
  else
    local exit_code=$?
    echo "[$(TZ="$BATCH_TZ" date -Is)] [step:failed] $step_name exit=$exit_code" >> "$step_log"
    fail_step "$step_name" "$step_log" "$exit_code"
  fi
}

check_ingest_total_errors() {
  local ingest_log="$1"
  local done_line
  local total_errors

  done_line="$(grep -E '\[done\].*totalErrors=[0-9]+' "$ingest_log" | tail -n 1 || true)"
  if [[ -z "$done_line" ]]; then
    log_msg "[ingest:failed] totalErrors marker not found; log=$ingest_log"
    exit 1
  fi

  total_errors="$(sed -nE 's/.*totalErrors=([0-9]+).*/\1/p' <<< "$done_line" | tail -n 1)"
  if [[ -z "$total_errors" ]]; then
    log_msg "[ingest:failed] totalErrors value parse failed; log=$ingest_log"
    exit 1
  fi

  if (( total_errors != 0 )); then
    log_msg "[ingest:failed] totalErrors=$total_errors; log=$ingest_log"
    exit 1
  fi

  log_msg "[ingest:verified] totalErrors=0"
}

COMMON_ENV=(env NODE_ENV=production DOTENV=.env.production TZ="$BATCH_TZ")

INGEST_CMD=("${COMMON_ENV[@]}" "$NODE_BIN" server/crawler/scripts/rtms_ingest_apt_dev_sudogwon_range.js --from="$TARGET_YM" --to="$TARGET_YM" --scope=all --apiTotal=0)
RANK_11_CMD=("${COMMON_ENV[@]}" "$NODE_BIN" server/crawler/scripts/re_build_stats_ranks.js --sido=11 --level=dong --from="$TARGET_YM" --to="$TARGET_YM" --top=100 --timeframe=both --only=all)
RANK_28_CMD=("${COMMON_ENV[@]}" "$NODE_BIN" server/crawler/scripts/re_build_stats_ranks.js --sido=28 --level=sigungu --from="$TARGET_YM" --to="$TARGET_YM" --top=100 --timeframe=both --only=all)
RANK_41_CMD=("${COMMON_ENV[@]}" "$NODE_BIN" server/crawler/scripts/re_build_stats_ranks.js --sido=41 --level=sigungu --from="$TARGET_YM" --to="$TARGET_YM" --top=100 --timeframe=both --only=all)
APT_STATS_BOTH_CMD=("${COMMON_ENV[@]}" "$NODE_BIN" server/crawler/scripts/re_build_apt_stats.js --from="$TARGET_YM" --to="$TARGET_YM" --timeframe=both --bands=all,10,20,30,40,50)
APT_STATS_MONTH_CMD=("${COMMON_ENV[@]}" "$NODE_BIN" server/crawler/scripts/re_build_apt_stats.js --from="$TARGET_YM" --to="$TARGET_YM" --timeframe=month --bands=all)
APT_STATS_YEAR_CMD=("${COMMON_ENV[@]}" "$NODE_BIN" server/crawler/scripts/re_build_apt_stats.js --from="$TARGET_YM" --to="$TARGET_YM" --timeframe=year --bands=all)

acquire_lock

log_msg "[batch:start] targetYm=$TARGET_YM dryRun=$DRY_RUN appDir=$APP_DIR log=$BATCH_LOG"

run_step "ingest_sudogwon_rtms" "$INGEST_LOG" "${INGEST_CMD[@]}"
if [[ "$DRY_RUN" != "1" ]]; then
  check_ingest_total_errors "$INGEST_LOG"
fi

run_step "rank_11_dong" "$RANK_11_LOG" "${RANK_11_CMD[@]}"
run_step "rank_28_sigungu" "$RANK_28_LOG" "${RANK_28_CMD[@]}"
run_step "rank_41_sigungu" "$RANK_41_LOG" "${RANK_41_CMD[@]}"
run_step "apt_stats_both_bands" "$APT_STATS_BOTH_LOG" "${APT_STATS_BOTH_CMD[@]}"
run_step "apt_stats_month_all" "$APT_STATS_MONTH_LOG" "${APT_STATS_MONTH_CMD[@]}"
run_step "apt_stats_year_all" "$APT_STATS_YEAR_LOG" "${APT_STATS_YEAR_CMD[@]}"

log_msg "[batch:done] targetYm=$TARGET_YM"
