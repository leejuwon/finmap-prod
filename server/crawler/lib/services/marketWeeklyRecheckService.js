'use strict';

const crypto = require('crypto');
const moment = require('moment-timezone');

const db = require('../db');
const yahooFinance = require('../vendors/yahooFinance');
const objUtils = require('../utils/utils');
const {
  addDays,
  getCrawlerDateSet,
  normalizeDateKey,
  safeJson,
  sleep,
  truncateText,
} = require('../utils/marketWeeklyRecheckUtil');

const WORLD_STAGE_TABLE = 'MARKETS_WORLD_INDICES_INFO_WEEKLY_STAGE';
const STOCK_STAGE_TABLE = 'STOCK_INVEST_INFO_WEEKLY_STAGE';
const RUN_TABLE = 'MARKET_WEEKLY_RECHECK_RUN';
const DIFF_TABLE = 'MARKET_WEEKLY_RECHECK_DIFF';
const WORLD_MAIN_TABLE = 'MARKETS_WORLD_INDICES_INFO';
const STOCK_MAIN_TABLE = 'STOCK_INVEST_INFO';
const STOCK_SANITY_MESSAGE = 'stock stage is yahoo-based sanity snapshot, not production-equivalent rollup';
const SOURCE_PARITY_MESSAGE = 'source parity warning: weekly world collector is yahoo; future diff should use compareScope=yhfOnly unless other collectors are implemented';

const WORLD_COMPARE_COLUMNS = [
  'IF_SUCC_YN',
  'US_HOLYDAY_YN',
  'KR_HOLYDAY_YN',
  'INDEX_STD_PRICE',
  'INDEX_MDF_STD_PRICE',
  'INDEX_OPEN_PRICE',
  'INDEX_HIGH_PRICE',
  'INDEX_LOW_PRICE',
  'INDEX_END_PRICE',
  'INDEX_UD_PRICE',
  'INDEX_UD_RATE_REAL_BY_OPEN',
  'INDEX_UD_RATE_REAL_BY_HIGH',
  'INDEX_UD_RATE_REAL_BY_LOW',
  'INDEX_UD_RATE_REAL_BY_TODAY',
  'INDEX_UD_RATE_REAL_BY_CLOSE',
  'INDEX_SCORE',
  'INDEX_EXTR1_STD_PRICE',
  'INDEX_EXTR1_END_PRICE',
  'INDEX_EXTR1_UD_PRICE',
  'INDEX_EXTR1_UD_RATE_REAL_BY_OPEN',
  'INDEX_EXTR1_UD_RATE_REAL_BY_TODAY',
  'INDEX_EXTR1_UD_RATE_REAL_BY_CLOSE',
  'INDEX_EXTR1_SCORE',
  'INDEX_EXTR2_STD_PRICE',
  'INDEX_EXTR2_END_PRICE',
  'INDEX_EXTR2_UD_PRICE',
  'INDEX_EXTR2_UD_RATE_REAL_BY_OPEN',
  'INDEX_EXTR2_UD_RATE_REAL_BY_TODAY',
  'INDEX_EXTR2_UD_RATE_REAL_BY_CLOSE',
  'INDEX_EXTR2_SCORE',
];

const FLAG_COLUMNS = new Set([
  'IF_SUCC_YN',
  'US_HOLYDAY_YN',
  'KR_HOLYDAY_YN',
]);

const STOCK_EXACT_COLUMNS = new Set([
  'GROWTH_TOT_SCORE_GRADE',
  'PRICE_TOT_SCORE_GRADE',
  'PRC_SET_RNG_GRP',
  'PARENT_GROWTH_TOT_SCORE_GRADE',
  'PARENT_PRC_SET_RNG_GRP',
]);

const WORLD_COLUMNS = [
  'run_id',
  'week_start_date',
  'week_end_date',
  'collected_at',
  'source_run_type',
  'raw_json',
  'INDEX_DATE',
  'INDEX_ID',
  'INDEX_SITE_ID',
  'INDEX_SITE_NAME',
  'KSP_STOCK_DATE',
  'US_HOLYDAY_YN',
  'KR_HOLYDAY_YN',
  'IF_SUCC_YN',
  'INDEX_STD_PRICE',
  'INDEX_MDF_STD_PRICE',
  'INDEX_OPEN_PRICE',
  'INDEX_HIGH_PRICE',
  'INDEX_LOW_PRICE',
  'INDEX_END_PRICE',
  'INDEX_UD_PRICE',
  'INDEX_UD_RATE_REAL_BY_OPEN',
  'INDEX_UD_RATE_REAL_BY_HIGH',
  'INDEX_UD_RATE_REAL_BY_LOW',
  'INDEX_UD_RATE_REAL_BY_TODAY',
  'INDEX_UD_RATE_REAL_BY_CLOSE',
  'INDEX_SCORE',
  'INDEX_EXTR1_STD_PRICE',
  'INDEX_EXTR1_END_PRICE',
  'INDEX_EXTR1_UD_PRICE',
  'INDEX_EXTR1_UD_RATE_REAL_BY_OPEN',
  'INDEX_EXTR1_UD_RATE_REAL_BY_TODAY',
  'INDEX_EXTR1_UD_RATE_REAL_BY_CLOSE',
  'INDEX_EXTR1_SCORE',
  'INDEX_EXTR2_STD_PRICE',
  'INDEX_EXTR2_END_PRICE',
  'INDEX_EXTR2_UD_PRICE',
  'INDEX_EXTR2_UD_RATE_REAL_BY_OPEN',
  'INDEX_EXTR2_UD_RATE_REAL_BY_TODAY',
  'INDEX_EXTR2_UD_RATE_REAL_BY_CLOSE',
  'INDEX_EXTR2_SCORE',
];

const PREFIXES = ['SNP', 'NDQ', 'DWJ', 'DXY', 'TNX', 'WTI', 'KRW'];

const STOCK_COLUMNS = [
  'run_id',
  'week_start_date',
  'week_end_date',
  'collected_at',
  'source_run_type',
  'raw_json',
  'KSP_STOCK_DATE',
  'KSP_BF_STOCK_DATE',
  'US_HOLYDAY_YN',
  'KR_HOLYDAY_YN',
  'IF_SUCC_YN',
  'KSP_BEF_CLOSE_PRICE',
  'KSP_OPEN_PRICE',
  'KSP_HIGH_PRICE',
  'KSP_LOW_PRICE',
  'KSP_CLOSE_PRICE',
  'KSP_TODAY_DIFF_PRICE',
  'KSP_UD_RATE_REAL_BY_OPEN',
  'KSP_UD_RATE_REAL_BY_HIGH',
  'KSP_UD_RATE_REAL_BY_LOW',
  'KSP_UD_RATE_REAL_BY_TODAY',
  'KSP_UD_RATE_REAL_BY_CLOSE',
  'BF_KSP_OPEN_DO_YN',
  'AF_KSP_OPEN_DO_YN',
  'CLOSE_KSP_OPEN_DO_YN',
  ...PREFIXES.flatMap((prefix) => [
    `${prefix}_STD_PRICE`,
    `${prefix}_OPEN_PRICE`,
    `${prefix}_END_PRICE`,
    `${prefix}_UD_PRICE`,
    `${prefix}_UD_RATE_REAL_BY_OPEN`,
    `${prefix}_UD_RATE_REAL_BY_TODAY`,
    `${prefix}_UD_RATE_REAL_BY_CLOSE`,
    `${prefix}_SCORE`,
    `${prefix}_OPEN_DO_YN`,
  ]),
  'GROWTH_TOT_SCORE',
  'PRICE_TOT_SCORE',
  'GROWTH_TOT_SCORE_GRADE',
  'PRICE_TOT_SCORE_GRADE',
  'PRC_SET_RNG_GRP',
  'PARENT_GROWTH_TOT_SCORE_GRADE',
  'PARENT_PRC_SET_RNG_GRP',
];

const STOCK_COMPARE_COLUMNS = STOCK_COLUMNS.filter((column) => ![
  'run_id',
  'week_start_date',
  'week_end_date',
  'collected_at',
  'source_run_type',
  'raw_json',
  'KSP_STOCK_DATE',
  'KSP_BF_STOCK_DATE',
].includes(column));

const STOCK_FLAG_COLUMNS = new Set(
  STOCK_COMPARE_COLUMNS.filter((column) => FLAG_COLUMNS.has(column) || column.endsWith('_DO_YN'))
);

const WORLD_SYMBOLS = [
  { id: 'KSP', symbol: '^KS11', siteId: 'YHF', siteName: 'Yahoo Finance', tz: 'Asia/Seoul', dateRole: 'target', sourceRunType: 'AF_CLOSE' },
  { id: 'SNP', symbol: '^GSPC', siteId: 'YHF', siteName: 'Yahoo Finance', tz: 'America/New_York', dateRole: 'previous', sourceRunType: 'BF' },
  { id: 'NDQ', symbol: '^IXIC', siteId: 'YHF', siteName: 'Yahoo Finance', tz: 'America/New_York', dateRole: 'previous', sourceRunType: 'BF' },
  { id: 'DWJ', symbol: '^DJI', siteId: 'YHF', siteName: 'Yahoo Finance', tz: 'America/New_York', dateRole: 'previous', sourceRunType: 'BF' },
  { id: 'DXY', symbol: 'DX-Y.NYB', siteId: 'YHF', siteName: 'Yahoo Finance', tz: 'America/New_York', dateRole: 'previous', sourceRunType: 'BF' },
  { id: 'TNX', symbol: '^TNX', siteId: 'YHF', siteName: 'Yahoo Finance', tz: 'America/New_York', dateRole: 'previous', sourceRunType: 'BF' },
  { id: 'WTI', symbol: 'CL=F', siteId: 'YHF', siteName: 'Yahoo Finance', tz: 'America/New_York', dateRole: 'previous', sourceRunType: 'BF' },
  { id: 'KRW', symbol: 'KRW=X', siteId: 'YHF', siteName: 'Yahoo Finance', tz: 'Asia/Seoul', dateRole: 'previous', sourceRunType: 'BF' },
];

function quoteColumn(column) {
  return `\`${column}\``;
}

function uniqueColumns(columns) {
  return [...new Set(columns)];
}

function compactDateKey(dateKey) {
  const normalized = normalizeDateKey(dateKey);
  return normalized ? normalized.replace(/-/g, '') : null;
}

function makeCanonicalKey(row, keyFields) {
  const keyObject = {};
  for (const field of keyFields) {
    const rawValue = row[field];
    if (field.includes('DATE')) {
      keyObject[field] = normalizeDateKey(rawValue) || (rawValue == null ? null : String(rawValue).trim());
    } else {
      keyObject[field] = rawValue == null ? null : String(rawValue).trim();
    }
  }

  const keyJson = JSON.stringify(keyObject);
  return {
    keyObject,
    keyJson,
    keyHash: crypto.createHash('sha256').update(keyJson).digest(),
  };
}

function makeRowMap(rows, keyFields) {
  const map = new Map();
  for (const row of rows || []) {
    const key = makeCanonicalKey(row, keyFields);
    map.set(key.keyJson, { row, key });
  }
  return map;
}

function isBlankValue(value) {
  return value === null || value === undefined || value === '';
}

function isDateColumn(column) {
  return column.includes('DATE');
}

function normalizeCompareValue(column, value) {
  if (isBlankValue(value)) return null;
  if (value instanceof Date || isDateColumn(column)) {
    return normalizeDateKey(value) || String(value).trim();
  }
  if (Buffer.isBuffer(value)) return value.toString('hex');
  return typeof value === 'string' ? value.trim() : value;
}

function isNumericLike(value) {
  if (isBlankValue(value)) return false;
  const normalized = normalizeCompareValue('', value);
  return normalized !== '' && Number.isFinite(Number(normalized));
}

function isFlagColumn(column) {
  return FLAG_COLUMNS.has(column) || column.endsWith('_DO_YN');
}

function isNumericCompareColumn(tableName, column) {
  if (isFlagColumn(column)) return false;
  if (tableName === WORLD_MAIN_TABLE) return WORLD_COMPARE_COLUMNS.includes(column);
  if (tableName === STOCK_MAIN_TABLE) {
    if (STOCK_EXACT_COLUMNS.has(column)) return false;
    return /PRICE|RATE|SCORE/.test(column);
  }
  return false;
}

function toleranceForColumn(tableName, column) {
  return isNumericCompareColumn(tableName, column) ? 0.01 : 0;
}

function valuesAreSame(tableName, column, mainValue, stageValue) {
  const main = normalizeCompareValue(column, mainValue);
  const stage = normalizeCompareValue(column, stageValue);

  if (isBlankValue(main) && isBlankValue(stage)) return true;
  if (isBlankValue(main) || isBlankValue(stage)) return false;

  if (isNumericCompareColumn(tableName, column) && isNumericLike(main) && isNumericLike(stage)) {
    return Math.abs(Number(main) - Number(stage)) <= toleranceForColumn(tableName, column);
  }

  return String(main) === String(stage);
}

function diffNumber(mainValue, stageValue) {
  const main = normalizeCompareValue('', mainValue);
  const stage = normalizeCompareValue('', stageValue);
  if (!isNumericLike(main) || !isNumericLike(stage)) return null;
  return Number(Math.abs(Number(main) - Number(stage)).toFixed(10));
}

function valueToText(column, value) {
  const normalized = normalizeCompareValue(column, value);
  if (isBlankValue(normalized)) return null;
  if (typeof normalized === 'object') return safeJson(normalized);
  return String(normalized);
}

function severityForDiff(tableName, diffType, columnName) {
  if (diffType === 'MISSING_IN_MAIN') return 'HIGH';
  if (diffType === 'MISSING_IN_STAGE') return 'MEDIUM';

  if (columnName === 'IF_SUCC_YN') return 'HIGH';
  if (columnName === 'US_HOLYDAY_YN' || columnName === 'KR_HOLYDAY_YN') return 'LOW';

  if (tableName === WORLD_MAIN_TABLE) {
    if (['INDEX_END_PRICE', 'INDEX_STD_PRICE', 'INDEX_MDF_STD_PRICE'].includes(columnName)) return 'HIGH';
    if (['INDEX_OPEN_PRICE', 'INDEX_HIGH_PRICE', 'INDEX_LOW_PRICE', 'INDEX_UD_PRICE'].includes(columnName)) return 'MEDIUM';
    if (columnName.includes('RATE') || columnName.includes('SCORE')) return 'MEDIUM';
  }

  if (tableName === STOCK_MAIN_TABLE) {
    if (isFlagColumn(columnName)) return 'MEDIUM';
    if (STOCK_EXACT_COLUMNS.has(columnName)) return 'MEDIUM';
    if (/PRICE|RATE|SCORE/.test(columnName)) return 'MEDIUM';
  }

  return 'LOW';
}

function columnDiffType(columnName) {
  return isFlagColumn(columnName) ? 'FLAG_DIFF' : 'VALUE_DIFF';
}

function runDateRange(runRow) {
  const fromDate = normalizeDateKey(runRow?.target_from_date) || normalizeDateKey(runRow?.week_start_date);
  const toDate = normalizeDateKey(runRow?.target_to_date) || normalizeDateKey(runRow?.week_end_date);
  if (!fromDate || !toDate) {
    throw new Error(`run date range is invalid for run_id=${runRow?.run_id}`);
  }
  return {
    fromDate,
    toDate,
    fromCompact: compactDateKey(fromDate),
    toCompact: compactDateKey(toDate),
  };
}

function toDbNumber(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Number(n.toFixed(6)) : null;
}

function hasNumber(value) {
  return Number.isFinite(Number(value));
}

function percentRate(close, before) {
  if (!hasNumber(close) || !hasNumber(before) || Number(before) === 0) return null;
  return toDbNumber(objUtils.calcRateRoundedClose(Number(close), Number(before)));
}

function priceDiff(close, before) {
  if (!hasNumber(close) || !hasNumber(before)) return null;
  return toDbNumber(Number(close) - Number(before));
}

function quoteDateKey(quote, tz) {
  if (!quote?.date) return null;
  return moment(quote.date).tz(tz || 'UTC').format('YYYY-MM-DD');
}

function selectQuote(quotes, dateKey, tz) {
  return (quotes || []).find((quote) => quoteDateKey(quote, tz) === dateKey) || null;
}

function selectLatestQuoteBefore(quotes, dateKey, tz) {
  const candidates = (quotes || [])
    .map((quote) => ({ quote, dateKey: quoteDateKey(quote, tz) }))
    .filter((item) => item.dateKey && item.dateKey < dateKey && item.quote?.close != null)
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));

  return candidates[0]?.quote || null;
}

function makeCollectionError(reason, message, extra) {
  const error = new Error(message);
  error.reason = reason;
  if (extra) error.extra = extra;
  return error;
}

function classifyMissingQuote(quotes, dateKey, tz) {
  const hasAnyQuote = (quotes || []).some((quote) => quoteDateKey(quote, tz));
  const previousQuote = selectLatestQuoteBefore(quotes, dateKey, tz);
  if (hasAnyQuote && previousQuote) return 'MARKET_CLOSED_CANDIDATE';
  return 'NO_QUOTE_FOR_INDEX_DATE';
}

function scoreIndex(indexId, closeRate, todayRate) {
  if (!hasNumber(closeRate)) return null;
  const close = Number(closeRate);
  const today = Number(todayRate || 0);
  let plus = 0;

  if (indexId === 'SNP') {
    if (today >= 1.0) plus = 0.1;
    else if (today > 0.0) plus = 0.05;
    else if (today >= -1.0 && today < 0) plus = -0.05;
    else if (today < -1.0) plus = -0.1;
    return toDbNumber(objUtils.oraclePrcRound(close * 0.5, 2) + plus);
  }

  if (indexId === 'NDQ') {
    if (today >= 1.0) plus = 0.06;
    else if (today > 0.0) plus = 0.03;
    else if (today >= -1.0 && today < 0) plus = -0.03;
    else if (today < -1.0) plus = -0.06;
    return toDbNumber(objUtils.oraclePrcRound(close * 0.3, 2) + plus);
  }

  if (indexId === 'DWJ') {
    if (today >= 1.0) plus = 0.04;
    else if (today > 0.0) plus = 0.02;
    else if (today >= -1.0 && today < 0) plus = -0.02;
    else if (today < -1.0) plus = -0.04;
    return toDbNumber(objUtils.oraclePrcRound(close * 0.2, 2) + plus);
  }

  if (indexId === 'DXY') return toDbNumber(objUtils.oraclePrcRound(close * 5 * 0.3, 2) * -1);
  if (indexId === 'TNX') return toDbNumber(objUtils.oraclePrcRound(close * 0.3, 2) * -1);
  if (indexId === 'WTI') return toDbNumber(objUtils.oraclePrcRound(close * 0.1, 2));
  if (indexId === 'KRW') return toDbNumber(objUtils.oraclePrcRound(close * 2.5 * 0.3, 2) * -1);

  return null;
}

function calcGrades(row) {
  const growthTotScore = Math.round((Number(row.SNP_SCORE) + Number(row.NDQ_SCORE) + Number(row.DWJ_SCORE)) * 100) / 100;
  const priceTotScore = Math.round((Number(row.DXY_SCORE) + Number(row.TNX_SCORE) + Number(row.WTI_SCORE) + Number(row.KRW_SCORE)) * 100) / 100;

  let growthTotScoreGrade = 0;
  let parentGrowthTotScoreGrade = 0;
  if (growthTotScore > 2) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [9, 3];
  else if (growthTotScore > 1.4) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [8, 3];
  else if (growthTotScore > 1.0) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [7, 2];
  else if (growthTotScore > 0.75) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [6, 2];
  else if (growthTotScore > 0.54) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [5, 2];
  else if (growthTotScore > 0.37) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [4, 1];
  else if (growthTotScore > 0.21) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [3, 1];
  else if (growthTotScore > 0.05) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [2, 1];
  else if (growthTotScore >= 0) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [1, 1];
  else if (growthTotScore < -2.5) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [-9, -3];
  else if (growthTotScore < -1.8) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [-8, -3];
  else if (growthTotScore < -1.3) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [-7, -2];
  else if (growthTotScore < -0.95) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [-6, -2];
  else if (growthTotScore < -0.65) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [-5, -2];
  else if (growthTotScore < -0.45) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [-4, -1];
  else if (growthTotScore < -0.28) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [-3, -1];
  else if (growthTotScore < -0.15) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [-2, -1];
  else if (growthTotScore < 0) [growthTotScoreGrade, parentGrowthTotScoreGrade] = [-1, -1];

  let priceTotScoreGrade = 0;
  let parentPrcSetRngGrp = 0;
  if (priceTotScore > 1.2) [priceTotScoreGrade, parentPrcSetRngGrp] = [9, 3];
  else if (priceTotScore > 0.9) [priceTotScoreGrade, parentPrcSetRngGrp] = [8, 3];
  else if (priceTotScore > 0.65) [priceTotScoreGrade, parentPrcSetRngGrp] = [7, 3];
  else if (priceTotScore > 0.5) [priceTotScoreGrade, parentPrcSetRngGrp] = [6, 2];
  else if (priceTotScore > 0.35) [priceTotScoreGrade, parentPrcSetRngGrp] = [5, 2];
  else if (priceTotScore > 0.22) [priceTotScoreGrade, parentPrcSetRngGrp] = [4, 2];
  else if (priceTotScore > 0.12) [priceTotScoreGrade, parentPrcSetRngGrp] = [3, 1];
  else if (priceTotScore > 0.03) [priceTotScoreGrade, parentPrcSetRngGrp] = [2, 1];
  else if (priceTotScore >= 0) [priceTotScoreGrade, parentPrcSetRngGrp] = [1, 1];
  else if (priceTotScore < -1.4) [priceTotScoreGrade, parentPrcSetRngGrp] = [-9, -3];
  else if (priceTotScore < -1.0) [priceTotScoreGrade, parentPrcSetRngGrp] = [-8, -3];
  else if (priceTotScore < -0.75) [priceTotScoreGrade, parentPrcSetRngGrp] = [-7, -3];
  else if (priceTotScore < -0.55) [priceTotScoreGrade, parentPrcSetRngGrp] = [-6, -2];
  else if (priceTotScore < -0.4) [priceTotScoreGrade, parentPrcSetRngGrp] = [-5, -2];
  else if (priceTotScore < -0.25) [priceTotScoreGrade, parentPrcSetRngGrp] = [-4, -2];
  else if (priceTotScore < -0.15) [priceTotScoreGrade, parentPrcSetRngGrp] = [-3, -1];
  else if (priceTotScore < -0.05) [priceTotScoreGrade, parentPrcSetRngGrp] = [-2, -1];
  else if (priceTotScore < 0) [priceTotScoreGrade, parentPrcSetRngGrp] = [-1, -1];

  const priceSetRngGrp = priceTotScoreGrade === 0 ? 0 : priceTotScoreGrade * 10;
  const parentPriceRange = parentPrcSetRngGrp === 0 ? 0 : parentPrcSetRngGrp * 10;

  return {
    GROWTH_TOT_SCORE: toDbNumber(growthTotScore),
    PRICE_TOT_SCORE: toDbNumber(priceTotScore),
    GROWTH_TOT_SCORE_GRADE: growthTotScoreGrade,
    PRICE_TOT_SCORE_GRADE: priceTotScoreGrade,
    PRC_SET_RNG_GRP: priceSetRngGrp,
    PARENT_GROWTH_TOT_SCORE_GRADE: parentGrowthTotScoreGrade,
    PARENT_PRC_SET_RNG_GRP: parentPriceRange,
  };
}

async function createRun(options) {
  const targetPayload = {
    targets: options.targets,
    collector: options.collector,
    compareScope: options.compareScope,
    compareStockValue: options.compareStockValue,
    allowEmptyStage: options.allowEmptyStage,
  };
  const result = await objUtils.dbQuery(
    db,
    `INSERT INTO ${RUN_TABLE} (
      week_start_date,
      week_end_date,
      target_from_date,
      target_to_date,
      status,
      targets,
      message
    ) VALUES (?, ?, ?, ?, 'PENDING', ?, ?)`,
    [
      options.weekStart,
      options.weekEnd,
      options.fromDate,
      options.toDate,
      safeJson(targetPayload),
      `created; collector=${options.collector}; compareScope=${options.compareScope}; compareStockValue=${options.compareStockValue ? 1 : 0}`,
    ]
  );

  const runId = result.insertId;
  await updateRun(runId, {
    status: 'RUNNING',
    started_at: new Date(),
    message: `running; collector=${options.collector}; compareScope=${options.compareScope}; ${SOURCE_PARITY_MESSAGE}; ${STOCK_SANITY_MESSAGE}`,
  });
  return runId;
}

async function updateRun(runId, fields) {
  const clean = {};
  for (const [key, value] of Object.entries(fields || {})) {
    if (value !== undefined) clean[key] = value;
  }
  if (Object.keys(clean).length === 0) return;

  await objUtils.dbQuery(db, `UPDATE ${RUN_TABLE} SET ? WHERE run_id = ?`, [clean, runId]);
}

async function getRunRow(runId) {
  const rows = await objUtils.dbQuery(
    db,
    `SELECT * FROM ${RUN_TABLE} WHERE run_id = ? LIMIT 1`,
    [runId]
  );
  return rows?.[0] || null;
}

async function selectRows(tableName, columns, whereSql, params) {
  const selectColumns = uniqueColumns(columns).map(quoteColumn).join(', ');
  return objUtils.dbQuery(
    db,
    `SELECT ${selectColumns} FROM ${tableName} ${whereSql}`,
    params
  );
}

async function upsertDiffRow(diff) {
  const params = [
    diff.runId,
    diff.tableName,
    diff.diffType,
    diff.targetDate,
    diff.keyJson,
    diff.keyHash,
    diff.indicatorCode || null,
    diff.sourceId || null,
    diff.columnName || '',
    diff.mainValue,
    diff.stageValue,
    diff.diffValue,
    diff.tolerance,
    diff.severity,
    diff.note || null,
  ];

  await objUtils.dbQuery(
    db,
    `INSERT INTO ${DIFF_TABLE} (
      run_id,
      table_name,
      diff_type,
      target_date,
      key_json,
      key_hash,
      indicator_code,
      source_id,
      column_name,
      main_value,
      stage_value,
      diff_value,
      tolerance,
      severity,
      note,
      checked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      main_value = VALUES(main_value),
      stage_value = VALUES(stage_value),
      diff_value = VALUES(diff_value),
      tolerance = VALUES(tolerance),
      severity = VALUES(severity),
      note = VALUES(note),
      checked_at = NOW(),
      updated_at = NOW()`,
    params
  );
}

function buildUpsertSql(tableName, columns, keyColumns) {
  const quoted = columns.map((column) => `\`${column}\``).join(', ');
  const placeholders = columns.map(() => '?').join(', ');
  const updateColumns = columns.filter((column) => !keyColumns.includes(column) && column !== 'created_at');
  const updates = updateColumns.map((column) => `\`${column}\` = VALUES(\`${column}\`)`);
  updates.push('updated_at = NOW()');

  return `
    INSERT INTO ${tableName} (${quoted})
    VALUES (${placeholders})
    ON DUPLICATE KEY UPDATE ${updates.join(', ')}
  `;
}

async function upsertStageRow(tableName, columns, keyColumns, row) {
  const sql = buildUpsertSql(tableName, columns, keyColumns);
  const params = columns.map((column) => (row[column] === undefined ? null : row[column]));
  await objUtils.dbQuery(db, sql, params);
}

async function fetchYahooWorldRow(symbolConfig, targetDate, options) {
  const dateSet = getCrawlerDateSet(targetDate);
  const indexDate = symbolConfig.dateRole === 'target' ? dateSet.targetDate : dateSet.previousDate;
  const stdDate = symbolConfig.dateRole === 'target' ? dateSet.previousDate : dateSet.xPreviousDate;
  const period1 = addDays(stdDate, -7);
  const period2 = addDays(indexDate, 2);

  let chart;
  try {
    chart = await yahooFinance.chart(symbolConfig.symbol, {
      period1,
      period2,
      interval: '1d',
    });
  } catch (error) {
    throw makeCollectionError('FETCH_ERROR', error.message, { cause: error });
  }

  const quotes = chart?.quotes || [];
  const quote = selectQuote(quotes, indexDate, symbolConfig.tz);
  const stdQuote = selectQuote(quotes, stdDate, symbolConfig.tz) || selectLatestQuoteBefore(quotes, indexDate, symbolConfig.tz);

  if (!quote) {
    const reason = classifyMissingQuote(quotes, indexDate, symbolConfig.tz);
    throw makeCollectionError(reason, `missing quote for indexDate=${indexDate}`, {
      indexDate,
      stdDate,
      availableDates: quotes.map((item) => quoteDateKey(item, symbolConfig.tz)).filter(Boolean),
    });
  }

  if (!stdQuote) {
    throw makeCollectionError('NO_STD_QUOTE', `missing std quote for stdDate=${stdDate}`, {
      indexDate,
      stdDate,
      availableDates: quotes.map((item) => quoteDateKey(item, symbolConfig.tz)).filter(Boolean),
    });
  }

  const std = toDbNumber(stdQuote.close);
  const open = toDbNumber(quote.open);
  const high = toDbNumber(quote.high);
  const low = toDbNumber(quote.low);
  const close = toDbNumber(quote.close);
  const todayRate = percentRate(close, open);
  const closeRate = percentRate(close, std);
  const success = hasNumber(std) && hasNumber(open) && hasNumber(close);

  const row = {
    run_id: options.runId,
    week_start_date: options.weekStart,
    week_end_date: options.weekEnd,
    collected_at: new Date(),
    source_run_type: symbolConfig.sourceRunType,
    INDEX_DATE: indexDate,
    INDEX_ID: symbolConfig.id,
    INDEX_SITE_ID: symbolConfig.siteId,
    INDEX_SITE_NAME: symbolConfig.siteName,
    KSP_STOCK_DATE: targetDate,
    US_HOLYDAY_YN: 'N',
    KR_HOLYDAY_YN: 'N',
    IF_SUCC_YN: success ? 'Y' : 'N',
    INDEX_STD_PRICE: std,
    INDEX_MDF_STD_PRICE: std,
    INDEX_OPEN_PRICE: open,
    INDEX_HIGH_PRICE: high,
    INDEX_LOW_PRICE: low,
    INDEX_END_PRICE: close,
    INDEX_UD_PRICE: priceDiff(close, std),
    INDEX_UD_RATE_REAL_BY_OPEN: percentRate(open, std),
    INDEX_UD_RATE_REAL_BY_HIGH: percentRate(high, std),
    INDEX_UD_RATE_REAL_BY_LOW: percentRate(low, std),
    INDEX_UD_RATE_REAL_BY_TODAY: todayRate,
    INDEX_UD_RATE_REAL_BY_CLOSE: closeRate,
    INDEX_SCORE: scoreIndex(symbolConfig.id, closeRate, todayRate),
  };

  row.raw_json = safeJson({
    collector: 'market_weekly_recheck:yahoo',
    collectorMode: options.collector,
    compareScope: options.compareScope,
    targetDate,
    indexDate,
    stdDate,
    symbol: symbolConfig.symbol,
    siteId: symbolConfig.siteId,
    id: symbolConfig.id,
    quoteDateKey: quoteDateKey(quote, symbolConfig.tz),
    stdQuoteDateKey: quoteDateKey(stdQuote, symbolConfig.tz),
    quote,
    stdQuote,
  });

  if (options.debug) {
    console.log('[world:collected]', symbolConfig.id, indexDate, row.IF_SUCC_YN);
  }

  return row;
}

async function collectWorldRowsForDate(targetDate, options) {
  const rows = [];
  const failures = [];

  for (const symbolConfig of WORLD_SYMBOLS) {
    try {
      const row = await fetchYahooWorldRow(symbolConfig, targetDate, options);
      rows.push(row);
    } catch (error) {
      failures.push({
        date: targetDate,
        indicator: symbolConfig.id,
        source: symbolConfig.siteId,
        reason: error.reason || 'FETCH_ERROR',
        message: error.message,
      });
      console.warn(`[world:failed] ${targetDate} ${symbolConfig.id}/${symbolConfig.siteId} ${error.reason || 'FETCH_ERROR'}: ${error.message}`);
    }
    await sleep(options.throttle);
  }

  return { rows, failures };
}

function mapStockFromWorldRows(targetDate, rows, options) {
  const dateSet = getCrawlerDateSet(targetDate);
  const byId = new Map((rows || []).map((row) => [row.INDEX_ID, row]));
  const ksp = byId.get('KSP');

  const stock = {
    run_id: options.runId,
    week_start_date: options.weekStart,
    week_end_date: options.weekEnd,
    collected_at: new Date(),
    source_run_type: 'ROLLUP',
    KSP_STOCK_DATE: targetDate,
    KSP_BF_STOCK_DATE: dateSet.previousDate,
    US_HOLYDAY_YN: 'N',
    KR_HOLYDAY_YN: 'N',
    IF_SUCC_YN: 'N',
  };

  if (ksp) {
    stock.KSP_BEF_CLOSE_PRICE = ksp.INDEX_MDF_STD_PRICE;
    stock.KSP_OPEN_PRICE = ksp.INDEX_OPEN_PRICE;
    stock.KSP_HIGH_PRICE = ksp.INDEX_HIGH_PRICE;
    stock.KSP_LOW_PRICE = ksp.INDEX_LOW_PRICE;
    stock.KSP_CLOSE_PRICE = ksp.INDEX_END_PRICE;
    stock.KSP_TODAY_DIFF_PRICE = ksp.INDEX_UD_PRICE;
    stock.KSP_UD_RATE_REAL_BY_OPEN = ksp.INDEX_UD_RATE_REAL_BY_OPEN;
    stock.KSP_UD_RATE_REAL_BY_HIGH = ksp.INDEX_UD_RATE_REAL_BY_HIGH;
    stock.KSP_UD_RATE_REAL_BY_LOW = ksp.INDEX_UD_RATE_REAL_BY_LOW;
    stock.KSP_UD_RATE_REAL_BY_TODAY = ksp.INDEX_UD_RATE_REAL_BY_TODAY;
    stock.KSP_UD_RATE_REAL_BY_CLOSE = ksp.INDEX_UD_RATE_REAL_BY_CLOSE;
    stock.BF_KSP_OPEN_DO_YN = 'Y';
    stock.AF_KSP_OPEN_DO_YN = ksp.IF_SUCC_YN;
    stock.CLOSE_KSP_OPEN_DO_YN = ksp.IF_SUCC_YN;
  }

  for (const prefix of PREFIXES) {
    const row = byId.get(prefix);
    if (!row) continue;
    stock[`${prefix}_STD_PRICE`] = row.INDEX_MDF_STD_PRICE;
    stock[`${prefix}_OPEN_PRICE`] = row.INDEX_OPEN_PRICE;
    stock[`${prefix}_END_PRICE`] = row.INDEX_END_PRICE;
    stock[`${prefix}_UD_PRICE`] = row.INDEX_UD_PRICE;
    stock[`${prefix}_UD_RATE_REAL_BY_OPEN`] = row.INDEX_UD_RATE_REAL_BY_OPEN;
    stock[`${prefix}_UD_RATE_REAL_BY_TODAY`] = row.INDEX_UD_RATE_REAL_BY_TODAY;
    stock[`${prefix}_UD_RATE_REAL_BY_CLOSE`] = row.INDEX_UD_RATE_REAL_BY_CLOSE;
    stock[`${prefix}_SCORE`] = row.INDEX_SCORE;
    stock[`${prefix}_OPEN_DO_YN`] = row.IF_SUCC_YN;
  }

  Object.assign(stock, calcGrades(stock));

  const required = ['KSP', ...PREFIXES];
  const missingIndicators = required.filter((id) => byId.get(id)?.IF_SUCC_YN !== 'Y');
  const allSuccess = missingIndicators.length === 0;
  stock.IF_SUCC_YN = allSuccess ? 'Y' : 'N';
  stock.raw_json = safeJson({
    collector: 'market_weekly_recheck:rollup:yahoo_based',
    collectorMode: options.collector,
    compareStockValue: options.compareStockValue,
    productionEquivalent: false,
    targetDate,
    allSuccess,
    missingIndicators,
    worldFailures: options.worldFailures || [],
    worldRows: rows,
  });

  return stock;
}

async function upsertWorldRows(rows) {
  for (const row of rows) {
    await upsertStageRow(WORLD_STAGE_TABLE, WORLD_COLUMNS, ['run_id', 'INDEX_DATE', 'INDEX_ID', 'INDEX_SITE_ID'], row);
  }
}

async function upsertStockRow(row) {
  await upsertStageRow(STOCK_STAGE_TABLE, STOCK_COLUMNS, ['run_id', 'KSP_STOCK_DATE'], row);
}

function formatWorldFailure(failure) {
  return `${failure.date} ${failure.indicator}/${failure.source} ${failure.reason}: ${failure.message}`;
}

function worldTargetWhere(compareScope) {
  return compareScope === 'yhfOnly' ? ' AND INDEX_SITE_ID = ?' : '';
}

function worldTargetParams(compareScope) {
  return compareScope === 'yhfOnly' ? ['YHF'] : [];
}

function getWorldIdentifier(keyObject) {
  return {
    indicatorCode: keyObject.INDEX_ID || null,
    sourceId: keyObject.INDEX_SITE_ID || null,
    targetDate: keyObject.INDEX_DATE,
  };
}

function getStockIdentifier(keyObject) {
  return {
    indicatorCode: 'STOCK_INVEST',
    sourceId: null,
    targetDate: keyObject.KSP_STOCK_DATE,
  };
}

function ensureStageRowsPresent({ tableName, stageRows, runId, allowEmptyStage, debug }) {
  if (stageRows.length > 0) return;

  const message = `empty stage rows for ${tableName} run_id=${runId}; pass --allowEmptyStage=1 to allow MISSING_IN_STAGE comparison`;
  if (!allowEmptyStage) {
    console.warn(`[compare:${tableName}:empty-stage] ${message}`);
    throw new Error(message);
  }

  if (debug) {
    console.log(`[compare:${tableName}:empty-stage] allowEmptyStage=1; continuing with MISSING_IN_STAGE comparison`);
  }
}

async function writeMissingDiff({ runId, tableName, diffType, key, row, identifier, note }) {
  const isMissingInMain = diffType === 'MISSING_IN_MAIN';
  await upsertDiffRow({
    runId,
    tableName,
    diffType,
    targetDate: identifier.targetDate,
    keyJson: key.keyJson,
    keyHash: key.keyHash,
    indicatorCode: identifier.indicatorCode,
    sourceId: identifier.sourceId,
    columnName: '',
    mainValue: isMissingInMain ? null : safeJson(row),
    stageValue: isMissingInMain ? safeJson(row) : null,
    diffValue: null,
    tolerance: null,
    severity: severityForDiff(tableName, diffType, ''),
    note,
  });
}

async function compareRowValues({ runId, tableName, compareColumns, mainEntry, stageEntry, identifier }) {
  let diffCount = 0;
  let highDiffCount = 0;

  for (const columnName of compareColumns) {
    const mainValue = mainEntry.row[columnName];
    const stageValue = stageEntry.row[columnName];
    if (valuesAreSame(tableName, columnName, mainValue, stageValue)) continue;

    const diffType = columnDiffType(columnName);
    const severity = severityForDiff(tableName, diffType, columnName);
    await upsertDiffRow({
      runId,
      tableName,
      diffType,
      targetDate: identifier.targetDate,
      keyJson: stageEntry.key.keyJson,
      keyHash: stageEntry.key.keyHash,
      indicatorCode: identifier.indicatorCode,
      sourceId: identifier.sourceId,
      columnName,
      mainValue: valueToText(columnName, mainValue),
      stageValue: valueToText(columnName, stageValue),
      diffValue: diffNumber(mainValue, stageValue),
      tolerance: toleranceForColumn(tableName, columnName),
      severity,
      note: 'weekly recheck value comparison',
    });

    diffCount += 1;
    if (severity === 'HIGH') highDiffCount += 1;
  }

  return { diffCount, highDiffCount };
}

async function compareMappedRows({
  runId,
  tableName,
  keyFields,
  compareColumns,
  mainRows,
  stageRows,
  compareValues,
  getIdentifier,
}) {
  const mainMap = makeRowMap(mainRows, keyFields);
  const stageMap = makeRowMap(stageRows, keyFields);
  let diffCount = 0;
  let highDiffCount = 0;

  for (const stageEntry of stageMap.values()) {
    const mainEntry = mainMap.get(stageEntry.key.keyJson);
    const identifier = getIdentifier(stageEntry.key.keyObject);

    if (!mainEntry) {
      await writeMissingDiff({
        runId,
        tableName,
        diffType: 'MISSING_IN_MAIN',
        key: stageEntry.key,
        row: stageEntry.row,
        identifier,
        note: 'stage row exists but main row is missing',
      });
      diffCount += 1;
      highDiffCount += 1;
      continue;
    }

    if (compareValues) {
      const valueResult = await compareRowValues({
        runId,
        tableName,
        compareColumns,
        mainEntry,
        stageEntry,
        identifier,
      });
      diffCount += valueResult.diffCount;
      highDiffCount += valueResult.highDiffCount;
    }
  }

  for (const mainEntry of mainMap.values()) {
    if (stageMap.has(mainEntry.key.keyJson)) continue;
    const identifier = getIdentifier(mainEntry.key.keyObject);
    await writeMissingDiff({
      runId,
      tableName,
      diffType: 'MISSING_IN_STAGE',
      key: mainEntry.key,
      row: mainEntry.row,
      identifier,
      note: 'main row exists but stage row is missing',
    });
    diffCount += 1;
  }

  return {
    diffCount,
    highDiffCount,
    mainCount: mainRows.length,
    stageCount: stageRows.length,
  };
}

async function compareWorldTable({
  runId,
  compareScope = 'yhfOnly',
  allowEmptyStage = false,
  debug = false,
  runRow = null,
}) {
  const currentRun = runRow || await getRunRow(runId);
  if (!currentRun) throw new Error(`run_id=${runId} not found`);

  const range = runDateRange(currentRun);
  const keyFields = ['INDEX_DATE', 'INDEX_ID', 'INDEX_SITE_ID'];
  const columns = uniqueColumns([...keyFields, 'KSP_STOCK_DATE', ...WORLD_COMPARE_COLUMNS]);
  const scopeWhere = worldTargetWhere(compareScope);
  const scopeParams = worldTargetParams(compareScope);

  const stageRows = await selectRows(
    WORLD_STAGE_TABLE,
    columns,
    `WHERE run_id = ?${scopeWhere}`,
    [runId, ...scopeParams]
  );

  ensureStageRowsPresent({
    tableName: WORLD_STAGE_TABLE,
    stageRows,
    runId,
    allowEmptyStage,
    debug,
  });

  const mainRows = await selectRows(
    WORLD_MAIN_TABLE,
    columns,
    `WHERE ((KSP_STOCK_DATE >= ? AND KSP_STOCK_DATE <= ?) OR (KSP_STOCK_DATE >= ? AND KSP_STOCK_DATE <= ?))${scopeWhere}`,
    [range.fromDate, range.toDate, range.fromCompact, range.toCompact, ...scopeParams]
  );

  const result = await compareMappedRows({
    runId,
    tableName: WORLD_MAIN_TABLE,
    keyFields,
    compareColumns: WORLD_COMPARE_COLUMNS,
    mainRows,
    stageRows,
    compareValues: true,
    getIdentifier: getWorldIdentifier,
  });

  if (debug) {
    console.log(`[compare:world] table=${WORLD_MAIN_TABLE} mainRows=${result.mainCount} stageRows=${result.stageCount} diff=${result.diffCount} high=${result.highDiffCount}`);
  }

  return {
    tableName: WORLD_MAIN_TABLE,
    ...result,
  };
}

async function compareStockTable({
  runId,
  compareStockValue = false,
  allowEmptyStage = false,
  debug = false,
  runRow = null,
}) {
  const currentRun = runRow || await getRunRow(runId);
  if (!currentRun) throw new Error(`run_id=${runId} not found`);

  const range = runDateRange(currentRun);
  const keyFields = ['KSP_STOCK_DATE'];
  const columns = compareStockValue
    ? uniqueColumns([...keyFields, ...STOCK_COMPARE_COLUMNS])
    : keyFields;

  const stageRows = await selectRows(
    STOCK_STAGE_TABLE,
    columns,
    'WHERE run_id = ?',
    [runId]
  );

  ensureStageRowsPresent({
    tableName: STOCK_STAGE_TABLE,
    stageRows,
    runId,
    allowEmptyStage,
    debug,
  });

  const mainRows = await selectRows(
    STOCK_MAIN_TABLE,
    columns,
    'WHERE ((KSP_STOCK_DATE >= ? AND KSP_STOCK_DATE <= ?) OR (KSP_STOCK_DATE >= ? AND KSP_STOCK_DATE <= ?))',
    [range.fromDate, range.toDate, range.fromCompact, range.toCompact]
  );

  const result = await compareMappedRows({
    runId,
    tableName: STOCK_MAIN_TABLE,
    keyFields,
    compareColumns: STOCK_COMPARE_COLUMNS,
    mainRows,
    stageRows,
    compareValues: Boolean(compareStockValue),
    getIdentifier: getStockIdentifier,
  });

  if (debug) {
    console.log(`[compare:stock] table=${STOCK_MAIN_TABLE} compareStockValue=${compareStockValue ? 1 : 0} mainRows=${result.mainCount} stageRows=${result.stageCount} diff=${result.diffCount} high=${result.highDiffCount}`);
  }

  return {
    tableName: STOCK_MAIN_TABLE,
    compareStockValue: Boolean(compareStockValue),
    ...result,
  };
}

async function compareWeeklyRecheckRun(options) {
  const runId = options.runId;
  if (!runId) throw new Error('--runId is required when --compareOnly=1');

  const runRow = await getRunRow(runId);
  if (!runRow) throw new Error(`run_id=${runId} not found`);
  const stageStatus = runRow.status || 'UNKNOWN';

  await updateRun(runId, {
    message: `stageStatus=${stageStatus} | compareStatus=RUNNING | compareScope=${options.compareScope} | compareStockValue=${options.compareStockValue ? 1 : 0} | allowEmptyStage=${options.allowEmptyStage ? 1 : 0}`,
  });

  const results = [];
  const errors = [];

  for (const target of options.targets) {
    try {
      if (target === 'world') {
        results.push(await compareWorldTable({
          runId,
          compareScope: options.compareScope,
          allowEmptyStage: options.allowEmptyStage,
          debug: options.debug,
          runRow,
        }));
      } else if (target === 'stock') {
        results.push(await compareStockTable({
          runId,
          compareStockValue: options.compareStockValue,
          allowEmptyStage: options.allowEmptyStage,
          debug: options.debug,
          runRow,
        }));
      }
    } catch (error) {
      errors.push(`${target}: ${error.message}`);
      console.warn(`[compare:${target}:failed] ${error.message}`);
    }
  }

  const diffCount = results.reduce((sum, item) => sum + item.diffCount, 0);
  const highDiffCount = results.reduce((sum, item) => sum + item.highDiffCount, 0);
  const compareStatus = errors.length === 0
    ? 'SUCCESS'
    : results.length > 0
      ? 'PARTIAL_FAILED'
      : 'FAILED';
  const status = compareStatus !== 'SUCCESS'
    ? compareStatus
    : ['PARTIAL_FAILED', 'FAILED'].includes(stageStatus)
      ? stageStatus
      : 'SUCCESS';

  const messageParts = [
    `stageStatus=${stageStatus}`,
    `compareStatus=${compareStatus}`,
    `diffCount=${diffCount}`,
    `highDiffCount=${highDiffCount}`,
    `compareScope=${options.compareScope}`,
    `compareStockValue=${options.compareStockValue ? 1 : 0}`,
    `allowEmptyStage=${options.allowEmptyStage ? 1 : 0}`,
  ];
  if (errors.length > 0) messageParts.push(`errors=${errors.join('; ')}`);

  await updateRun(runId, {
    status,
    finished_at: new Date(),
    diff_count: diffCount,
    high_diff_count: highDiffCount,
    message: truncateText(messageParts.join(' | '), 1000),
  });

  if (options.debug) {
    for (const result of results) {
      console.log(`[compare:summary] table=${result.tableName} mainRows=${result.mainCount} stageRows=${result.stageCount} diff=${result.diffCount} high=${result.highDiffCount}`);
    }
    console.log(`[compare:status] stageStatus=${stageStatus} compareStatus=${compareStatus} finalStatus=${status}`);
  }

  return {
    runId,
    status,
    stageStatus,
    compareStatus,
    diffCount,
    highDiffCount,
    results,
    errors,
  };
}

async function runWeeklyRecheck(options) {
  if (options.compareOnly) {
    throw new Error('compareOnly must call compareWeeklyRecheckRun');
  }

  const runId = await createRun(options);
  const runOptions = { ...options, runId };
  const messages = [
    `collector=${options.collector}`,
    `compareScope=${options.compareScope}`,
    `compareStockValue=${options.compareStockValue ? 1 : 0}`,
    SOURCE_PARITY_MESSAGE,
  ];
  if (options.targets.includes('stock')) {
    messages.push(STOCK_SANITY_MESSAGE);
    if (options.debug) console.log(`[stock:notice] ${STOCK_SANITY_MESSAGE}`);
  }
  let successCount = 0;
  let failCount = 0;
  let totalCount = 0;
  let worldFailuresForStock = 0;

  try {
    for (const targetDate of options.targetDates) {
      if (options.debug) {
        console.log(`[date:start] ${targetDate}`);
      }

      let worldResult = null;
      const needsWorldCollection = options.targets.includes('world') || options.targets.includes('stock');

      if (needsWorldCollection) {
        worldResult = await collectWorldRowsForDate(targetDate, runOptions);
      }

      if (options.targets.includes('world')) {
        totalCount += WORLD_SYMBOLS.length;
        await upsertWorldRows(worldResult.rows);
        successCount += worldResult.rows.length;
        failCount += worldResult.failures.length;
        for (const failure of worldResult.failures) {
          messages.push(formatWorldFailure(failure));
        }
      }

      if (options.targets.includes('stock')) {
        if (!options.targets.includes('world') && worldResult.failures.length > 0) {
          worldFailuresForStock += worldResult.failures.length;
          for (const failure of worldResult.failures) {
            messages.push(`stockInternalWorldFailure ${formatWorldFailure(failure)}`);
          }
        }

        totalCount += 1;
        try {
          const stockRow = mapStockFromWorldRows(targetDate, worldResult.rows, {
            ...runOptions,
            worldFailures: worldResult.failures,
          });
          await upsertStockRow(stockRow);
          if (stockRow.IF_SUCC_YN === 'Y') successCount += 1;
          else {
            failCount += 1;
            messages.push(`${targetDate} stock rollup incomplete`);
          }
        } catch (error) {
          failCount += 1;
          messages.push(`${targetDate} stock: ${error.message}`);
          console.warn(`[stock:failed] ${targetDate}: ${error.message}`);
        }
      }

      await sleep(options.throttle);
    }

    const status = successCount > 0 && failCount === 0
      ? 'SUCCESS'
      : successCount > 0
        ? 'PARTIAL_FAILED'
        : 'FAILED';

    await updateRun(runId, {
      status,
      finished_at: new Date(),
      total_count: totalCount,
      success_count: successCount,
      fail_count: failCount,
      diff_count: 0,
      high_diff_count: 0,
      message: truncateText(`${messages.join(' | ')} | worldFailuresForStock=${worldFailuresForStock}`, 1000),
    });

    return { runId, status, totalCount, successCount, failCount, worldFailuresForStock };
  } catch (error) {
    await updateRun(runId, {
      status: successCount > 0 ? 'PARTIAL_FAILED' : 'FAILED',
      finished_at: new Date(),
      total_count: totalCount,
      success_count: successCount,
      fail_count: failCount || totalCount,
      message: truncateText(error.message, 1000),
    });
    throw error;
  }
}

module.exports = {
  collectWorldRowsForDate,
  compareStockTable,
  compareWeeklyRecheckRun,
  compareWorldTable,
  mapStockFromWorldRows,
  runWeeklyRecheck,
};
