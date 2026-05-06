#!/usr/bin/env node
'use strict';

const path = require('path');

const {
  parseArgs,
  safeJson,
} = require('../lib/utils/marketWeeklyRecheckUtil');

function loadEnv() {
  const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
  try {
    require('dotenv').config({
      path: path.join(process.cwd(), envFile),
      override: true,
    });
    console.log(`[market-weekly-recheck] dotenv loaded: ${envFile}`);
  } catch (error) {
    console.warn(`[market-weekly-recheck] dotenv load skipped: ${error.message}`);
  }
}

function printPlan(options) {
  console.log('[market-weekly-recheck] plan');
  console.log(safeJson({
    runId: options.runId,
    weekStart: options.weekStart,
    weekEnd: options.weekEnd,
    fromDate: options.fromDate,
    toDate: options.toDate,
    targetDates: options.targetDates,
    targets: options.targets,
    collector: options.collector,
    compareScope: options.compareScope,
    compareStockValue: options.compareStockValue,
    allowEmptyStage: options.allowEmptyStage,
    dryRun: options.dryRun,
    debug: options.debug,
    throttle: options.throttle,
    compareOnly: options.compareOnly,
  }));
}

function printDebugSql(runId) {
  console.log('[market-weekly-recheck] debug SQL');
  console.log(`SELECT * FROM MARKET_WEEKLY_RECHECK_RUN WHERE run_id = ${runId};`);
  console.log(`SELECT INDEX_DATE, INDEX_ID, INDEX_SITE_ID, IF_SUCC_YN FROM MARKETS_WORLD_INDICES_INFO_WEEKLY_STAGE WHERE run_id = ${runId} ORDER BY INDEX_DATE, INDEX_ID;`);
  console.log(`SELECT KSP_STOCK_DATE, IF_SUCC_YN FROM STOCK_INVEST_INFO_WEEKLY_STAGE WHERE run_id = ${runId} ORDER BY KSP_STOCK_DATE;`);
  console.log(`SELECT diff_type, severity, COUNT(*) AS cnt
FROM MARKET_WEEKLY_RECHECK_DIFF
WHERE run_id = ${runId}
GROUP BY diff_type, severity
ORDER BY severity, diff_type;`);
  console.log(`SELECT table_name, target_date, indicator_code, source_id, diff_type, column_name, main_value, stage_value, diff_value, tolerance, severity
FROM MARKET_WEEKLY_RECHECK_DIFF
WHERE run_id = ${runId}
ORDER BY severity DESC, target_date, indicator_code, column_name
LIMIT 100;`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.compareOnly && !options.runId) {
    throw new Error('--runId is required when --compareOnly=1');
  }
  printPlan(options);

  if (options.dryRun) {
    console.log('[market-weekly-recheck] dryRun=1; DB insert and external collection skipped.');
    return;
  }

  loadEnv();

  const {
    compareWeeklyRecheckRun,
    runWeeklyRecheck,
  } = require('../lib/services/marketWeeklyRecheckService');
  const db = require('../lib/db');

  try {
    const result = options.compareOnly
      ? await compareWeeklyRecheckRun(options)
      : await runWeeklyRecheck(options);
    console.log('[market-weekly-recheck] finished');
    console.log(safeJson(result));
    if (options.debug && result?.runId) {
      printDebugSql(result.runId);
    }
  } finally {
    if (db?.pool?.end) {
      await db.pool.end();
    }
  }
}

main().catch((error) => {
  console.error('[market-weekly-recheck] failed:', error?.stack || error);
  process.exit(1);
});
