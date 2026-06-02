'use strict';

process.env.DB_BOOT_CHECK = 'false';
require('dotenv').config({ path: '.env.local', quiet: true });

const { dbQuery, pool } = require('../lib/db');
const { addYears, gradeRange } = require('../lib/stockIndexCore');
const { getEtfGradeStats } = require('../lib/stockIndexEtfStats');

const TABLES = [
  'ETF_STOCK_INFO',
  'ETF_STOCK_RESULT',
  'MARKET_ETF_DTL_RST_FOR_DIBR',
  'STOCK_INVEST_INFO',
  'MARKET_SITE_ETF_STOCK_INFO',
];

const SELECTED_DATE = '2026-06-01';
const PERIOD = '3y';
const START_DATE = addYears(SELECTED_DATE, -3);
const PRICE_GRADE = -5;
const GROWTH_GRADE = 4;
const RANGE_MODES = ['exact', 'near1', 'near2'];
const ETF_ALIASES = {
  KDX_LVG: ['KDX_LVG', '122630', '122630.KS'],
  KDX_I2X: ['KDX_I2X', '252670', '252670.KS'],
};

const CANDIDATES = {
  date: ['ETF_STOCK_DATE', 'STOCK_DATE', 'TRADE_DATE', 'BASE_DATE', 'STD_DATE', 'RESULT_DATE', 'RST_DATE', 'KSP_STOCK_DATE', 'DATE'],
  code: ['ETF_STOCK_ID', 'ETF_STOCK_GROUP', 'ETF_ID', 'ETF_CODE', 'ETF_STOCK_CODE', 'STOCK_CODE', 'ITEM_CODE', 'TICKER', 'SYMBOL', 'CODE', 'ETF_CD'],
  name: ['ETF_STOCK_NAME', 'ETF_NAME', 'STOCK_NAME', 'ITEM_NAME', 'NAME', 'KOR_NAME'],
  source: ['ETF_SITE_ID', 'ETF_SITE_NAME', 'SOURCE', 'SITE_ID', 'DATA_SOURCE', 'CRAWL_SOURCE', 'PROVIDER'],
  open: ['ETF_OPEN_PRICE', 'OPEN_PRICE', 'OPEN', 'ST_OPEN_PRICE', 'STK_OPEN_PRICE'],
  high: ['ETF_HIGH_PRICE', 'HIGH_PRICE', 'HIGH', 'ST_HIGH_PRICE', 'STK_HIGH_PRICE'],
  low: ['ETF_LOW_PRICE', 'LOW_PRICE', 'LOW', 'ST_LOW_PRICE', 'STK_LOW_PRICE'],
  close: ['ETF_CLOSE_PRICE', 'CLOSE_PRICE', 'CLOSE', 'END_PRICE', 'ST_CLOSE_PRICE', 'STK_CLOSE_PRICE'],
  prevClose: ['ETF_BEF_CLOSE_PRICE', 'ETF_PREV_CLOSE_PRICE', 'PREV_CLOSE_PRICE', 'BEF_CLOSE_PRICE', 'BF_CLOSE_PRICE', 'BASE_PRICE', 'STD_PRICE'],
  resultType: ['ETF_STOCK_RESULT_TYPE', 'MARKET_RESULT_ID', 'RESULT_TYPE', 'RST_TYPE', 'ETF_RESULT_TYPE', 'RESULT_CD', 'RESULT_CODE', 'TYPE', 'RST_CD'],
  returnRate: ['ETF_TODAY_RESULT_RATE', 'RETURN_RATE', 'PROFIT_RATE', 'RESULT_RATE', 'EARNING_RATE', 'YIELD_RATE', 'RATE', 'RATIO', 'ROR'],
};

function qi(identifier) {
  if (!/^[A-Za-z0-9_]+$/.test(identifier)) throw new Error(`Unsafe identifier: ${identifier}`);
  return `\`${identifier}\``;
}

function fmtDate(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(value).slice(0, 10);
}

function hasColumn(columns, name) {
  return columns.some((column) => column.Field.toUpperCase() === name.toUpperCase());
}

function pickColumn(columns, names) {
  return names.find((name) => hasColumn(columns, name)) || null;
}

function compactColumn(column) {
  return {
    field: column.Field,
    type: column.Type,
    null: column.Null,
    key: column.Key,
    default: column.Default,
    extra: column.Extra,
  };
}

function outputColumns(table, columns) {
  if (table !== 'STOCK_INVEST_INFO') return columns.map(compactColumn);
  const relevant = new Set([
    'KSP_STOCK_DATE',
    'KSP_BEF_CLOSE_PRICE',
    'KSP_OPEN_PRICE',
    'KSP_HIGH_PRICE',
    'KSP_LOW_PRICE',
    'KSP_CLOSE_PRICE',
    'PRICE_TOT_SCORE',
    'GROWTH_TOT_SCORE',
    'PRICE_TOT_SCORE_GRADE',
    'GROWTH_TOT_SCORE_GRADE',
    'PRC_SET_RNG_GRP',
    'PARENT_GROWTH_TOT_SCORE_GRADE',
    'PARENT_PRC_SET_RNG_GRP',
    'IF_SUCC_YN',
    'updated_at',
  ]);
  const selected = columns.filter((column) => relevant.has(column.Field)).map(compactColumn);
  return {
    shownColumns: selected,
    totalColumnCount: columns.length,
    omittedColumnCount: columns.length - selected.length,
  };
}

async function tableExists(table) {
  const rows = await dbQuery(
    `
    SELECT 1 AS exists_flag
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = ?
    LIMIT 1
    `,
    [table]
  );
  return rows.length > 0;
}

async function getColumns(table) {
  return dbQuery(`SHOW COLUMNS FROM ${qi(table)}`);
}

async function single(sql, params = []) {
  const rows = await dbQuery(sql, params);
  return rows[0] || {};
}

function buildInList(values, params) {
  params.push(...values);
  return values.map(() => '?').join(',');
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlLiteralList(values) {
  return values.map(sqlLiteral).join(',');
}

async function countAliasMatches(table, codeCol, dateCol, ohlcCols) {
  const allAliases = Object.values(ETF_ALIASES).flat();
  const params = [];
  const aliasSql = buildInList(allAliases, params);
  const fields = [
    `${qi(codeCol)} AS code_value`,
    'COUNT(*) AS row_count',
  ];
  if (dateCol) fields.push(`MIN(${qi(dateCol)}) AS min_date`, `MAX(${qi(dateCol)}) AS max_date`);
  if (ohlcCols.open && ohlcCols.high && ohlcCols.low && ohlcCols.close) {
    fields.push(`SUM(${qi(ohlcCols.open)} IS NOT NULL AND ${qi(ohlcCols.high)} IS NOT NULL AND ${qi(ohlcCols.low)} IS NOT NULL AND ${qi(ohlcCols.close)} IS NOT NULL) AS full_ohlc_rows`);
  }
  if (ohlcCols.open && ohlcCols.close) {
    fields.push(`SUM(${qi(ohlcCols.open)} IS NOT NULL AND ${qi(ohlcCols.close)} IS NOT NULL) AS open_close_rows`);
  }

  return dbQuery(
    `
    SELECT ${fields.join(', ')}
    FROM ${qi(table)}
    WHERE ${qi(codeCol)} IN (${aliasSql})
    GROUP BY ${qi(codeCol)}
    ORDER BY row_count DESC, code_value ASC
    `,
    params
  );
}

async function findBestCodeMapping(table, columns, dateCol, ohlcCols) {
  const codeCandidates = CANDIDATES.code.filter((name) => hasColumn(columns, name));
  const candidates = [];
  for (const codeCol of codeCandidates) {
    const matches = await countAliasMatches(table, codeCol, dateCol, ohlcCols);
    const byEtf = {};
    for (const [etfId, aliases] of Object.entries(ETF_ALIASES)) {
      const rows = matches.filter((row) => aliases.includes(String(row.code_value)));
      const count = rows.reduce((sum, row) => sum + Number(row.row_count || 0), 0);
      byEtf[etfId] = {
        count,
        values: rows.map((row) => String(row.code_value)),
      };
    }
    candidates.push({
      codeCol,
      totalCount: matches.reduce((sum, row) => sum + Number(row.row_count || 0), 0),
      hasBothEtfs: Object.values(byEtf).every((item) => item.count > 0),
      byEtf,
      matches: matches.map((row) => ({
        codeValue: String(row.code_value),
        rowCount: Number(row.row_count || 0),
        minDate: fmtDate(row.min_date),
        maxDate: fmtDate(row.max_date),
        fullOhlcRows: row.full_ohlc_rows == null ? null : Number(row.full_ohlc_rows),
        openCloseRows: row.open_close_rows == null ? null : Number(row.open_close_rows),
      })),
    });
  }

  const best = candidates
    .filter((candidate) => candidate.hasBothEtfs)
    .sort((a, b) => b.totalCount - a.totalCount)[0] || null;
  return { best, candidates };
}

function normalizedEtfCase(aliasCol) {
  const lvgAliases = ETF_ALIASES.KDX_LVG;
  const i2xAliases = ETF_ALIASES.KDX_I2X;
  const lvgSql = sqlLiteralList(lvgAliases);
  const i2xSql = sqlLiteralList(i2xAliases);
  return `CASE WHEN ${aliasCol} IN (${lvgSql}) THEN 'KDX_LVG' WHEN ${aliasCol} IN (${i2xSql}) THEN 'KDX_I2X' ELSE NULL END`;
}

function gradeFilters(rangeMode, params) {
  const priceGrades = gradeRange(PRICE_GRADE, rangeMode);
  const growthGrades = gradeRange(GROWTH_GRADE, rangeMode);
  const priceSql = buildInList(priceGrades, params);
  const growthSql = buildInList(growthGrades, params);
  return {
    priceGrades,
    growthGrades,
    sql: `sii.PRICE_TOT_SCORE_GRADE IN (${priceSql}) AND sii.GROWTH_TOT_SCORE_GRADE IN (${growthSql})`,
  };
}

async function sampleCountsForOhlcTable({ table, dateCol, codeCol, ohlcCols, sourceCol, sourceValue }) {
  if (!dateCol || !codeCol || !ohlcCols.open || !ohlcCols.close) return null;
  const out = {};
  for (const rangeMode of RANGE_MODES) {
    const params = [];
    params.push(SELECTED_DATE, START_DATE);
    const etfCase = normalizedEtfCase(`e.${qi(codeCol)}`);
    const grade = gradeFilters(rangeMode, params);

    const filters = [
      `${etfCase} IS NOT NULL`,
      `sii.KSP_STOCK_DATE < ?`,
      `sii.KSP_STOCK_DATE >= ?`,
      grade.sql,
      'sii.KSP_BEF_CLOSE_PRICE IS NOT NULL',
      'sii.KSP_OPEN_PRICE IS NOT NULL',
      'sii.KSP_CLOSE_PRICE IS NOT NULL',
      `e.${qi(ohlcCols.open)} IS NOT NULL`,
      `e.${qi(ohlcCols.close)} IS NOT NULL`,
      `e.${qi(ohlcCols.open)} > 0`,
    ];

    if (ohlcCols.low) filters.push(`e.${qi(ohlcCols.low)} IS NOT NULL`);
    if (ohlcCols.prevClose) filters.push(`e.${qi(ohlcCols.prevClose)} IS NOT NULL`);
    if (sourceCol && sourceValue) {
      filters.push(`e.${qi(sourceCol)} = ?`);
      params.push(sourceValue);
    }

    const rows = await dbQuery(
      `
      SELECT
        COUNT(*) AS row_count,
        COUNT(DISTINCT sii.KSP_STOCK_DATE) AS any_etf_days,
        MIN(sii.KSP_STOCK_DATE) AS min_date,
        MAX(sii.KSP_STOCK_DATE) AS max_date
      FROM STOCK_INVEST_INFO AS sii
      INNER JOIN ${qi(table)} AS e
        ON e.${qi(dateCol)} = sii.KSP_STOCK_DATE
      WHERE ${filters.join('\n        AND ')}
      `,
      params
    );

    const commonParams = [];
    commonParams.push(SELECTED_DATE, START_DATE);
    const commonEtfCase = normalizedEtfCase(`e.${qi(codeCol)}`);
    const commonGrade = gradeFilters(rangeMode, commonParams);
    const commonFilters = [
      `${commonEtfCase} IS NOT NULL`,
      `sii.KSP_STOCK_DATE < ?`,
      `sii.KSP_STOCK_DATE >= ?`,
      commonGrade.sql,
      'sii.KSP_BEF_CLOSE_PRICE IS NOT NULL',
      'sii.KSP_OPEN_PRICE IS NOT NULL',
      'sii.KSP_CLOSE_PRICE IS NOT NULL',
      `e.${qi(ohlcCols.open)} IS NOT NULL`,
      `e.${qi(ohlcCols.close)} IS NOT NULL`,
      `e.${qi(ohlcCols.open)} > 0`,
    ];
    if (ohlcCols.low) commonFilters.push(`e.${qi(ohlcCols.low)} IS NOT NULL`);
    if (ohlcCols.prevClose) commonFilters.push(`e.${qi(ohlcCols.prevClose)} IS NOT NULL`);
    if (sourceCol && sourceValue) {
      commonFilters.push(`e.${qi(sourceCol)} = ?`);
      commonParams.push(sourceValue);
    }

    const commonRows = await dbQuery(
      `
      SELECT COUNT(*) AS common_days
      FROM (
        SELECT
          sii.KSP_STOCK_DATE,
          COUNT(DISTINCT ${commonEtfCase}) AS etf_count
        FROM STOCK_INVEST_INFO AS sii
        INNER JOIN ${qi(table)} AS e
          ON e.${qi(dateCol)} = sii.KSP_STOCK_DATE
        WHERE ${commonFilters.join('\n          AND ')}
        GROUP BY sii.KSP_STOCK_DATE
        HAVING etf_count = 2
      ) AS x
      `,
      commonParams
    );

    out[rangeMode] = {
      priceGrades: grade.priceGrades,
      growthGrades: grade.growthGrades,
      rowCount: Number(rows[0]?.row_count || 0),
      anyEtfDays: Number(rows[0]?.any_etf_days || 0),
      commonDays: Number(commonRows[0]?.common_days || 0),
      minDate: fmtDate(rows[0]?.min_date),
      maxDate: fmtDate(rows[0]?.max_date),
    };
  }
  return out;
}

async function currentApiSampleCounts() {
  const out = {};
  for (const rangeMode of RANGE_MODES) {
    const result = await getEtfGradeStats({
      date: SELECTED_DATE,
      period: PERIOD,
      rangeMode,
      source: 'NVR',
      minSamples: 20,
      includeOffsets: true,
      limit: 3,
    });
    out[rangeMode] = {
      source: result.source,
      matchedDays: result.matchedDays,
      matchedFullOhlcDays: result.matchedFullOhlcDays,
      rawMatchedRows: result.rawMatchedRows,
      nullOhlcExcludedRows: result.nullOhlcExcludedRows,
      sampleLatestDate: result.sampleLatestDate,
      signal: result.signal?.code,
    };
  }
  return out;
}

async function resultTypeSummary(table, meta) {
  if (!meta.resultTypeCol) return null;
  const resultCol = meta.resultTypeCol;
  const fields = [
    `${qi(resultCol)} AS result_type`,
    'COUNT(*) AS row_count',
  ];
  if (meta.dateCol) fields.push(`MIN(${qi(meta.dateCol)}) AS min_date`, `MAX(${qi(meta.dateCol)}) AS max_date`);

  const y25Rows = await dbQuery(
    `
    SELECT ${fields.join(', ')}
    FROM ${qi(table)}
    WHERE ${qi(resultCol)} LIKE 'Y25_KDX_GRADE%'
    GROUP BY ${qi(resultCol)}
    ORDER BY row_count DESC, result_type ASC
    LIMIT 100
    `
  );

  const distinct = await single(
    `
    SELECT
      COUNT(DISTINCT ${qi(resultCol)}) AS distinct_result_types,
      SUM(${qi(resultCol)} LIKE 'Y25_KDX_GRADE%') AS y25_rows
    FROM ${qi(table)}
    `
  );

  const gradeJoin = meta.dateCol
    ? await dbQuery(
      `
      SELECT
        t.${qi(resultCol)} AS result_type,
        COUNT(*) AS row_count,
        COUNT(DISTINCT CONCAT(sii.PRICE_TOT_SCORE_GRADE, '/', sii.GROWTH_TOT_SCORE_GRADE)) AS current_grade_combo_count,
        LEFT(GROUP_CONCAT(DISTINCT CONCAT('P', sii.PRICE_TOT_SCORE_GRADE, '/G', sii.GROWTH_TOT_SCORE_GRADE) ORDER BY sii.PRICE_TOT_SCORE_GRADE, sii.GROWTH_TOT_SCORE_GRADE SEPARATOR ', '), 300) AS current_grade_combo_examples
      FROM ${qi(table)} AS t
      INNER JOIN STOCK_INVEST_INFO AS sii
        ON sii.KSP_STOCK_DATE = t.${qi(meta.dateCol)}
      WHERE t.${qi(resultCol)} LIKE 'Y25_KDX_GRADE%'
      GROUP BY t.${qi(resultCol)}
      ORDER BY row_count DESC, result_type ASC
      LIMIT 30
      `
    )
    : [];

  return {
    distinctResultTypes: Number(distinct.distinct_result_types || 0),
    y25Rows: Number(distinct.y25_rows || 0),
    y25Types: y25Rows.map((row) => ({
      resultType: row.result_type,
      rowCount: Number(row.row_count || 0),
      minDate: fmtDate(row.min_date),
      maxDate: fmtDate(row.max_date),
    })),
    y25CurrentGradeJoin: gradeJoin.map((row) => ({
      resultType: row.result_type,
      rowCount: Number(row.row_count || 0),
      currentGradeComboCount: Number(row.current_grade_combo_count || 0),
      currentGradeComboExamples: row.current_grade_combo_examples,
    })),
  };
}

async function overlapPriceCheck(legacyMeta) {
  const detected = legacyMeta.detected || {};
  const codeMapping = legacyMeta.codeMapping || {};
  const ohlcCols = detected.ohlcCols || {};
  if (!detected.dateCol || !codeMapping.best || !ohlcCols.close || !ohlcCols.open) return null;
  const params = [];
  const legacyCase = normalizedEtfCase(`l.${qi(codeMapping.best.codeCol)}`);
  const siteCase = normalizedEtfCase('m.`ETF_STOCK_ID`');
  params.push('NVR');
  const rows = await dbQuery(
    `
    SELECT
      ${legacyCase} AS etf_id,
      COUNT(*) AS overlap_rows,
      MIN(l.${qi(detected.dateCol)}) AS min_date,
      MAX(l.${qi(detected.dateCol)}) AS max_date,
      AVG(l.${qi(ohlcCols.close)} / NULLIF(m.ETF_CLOSE_PRICE, 0)) AS avg_close_ratio,
      MIN(l.${qi(ohlcCols.close)} / NULLIF(m.ETF_CLOSE_PRICE, 0)) AS min_close_ratio,
      MAX(l.${qi(ohlcCols.close)} / NULLIF(m.ETF_CLOSE_PRICE, 0)) AS max_close_ratio,
      AVG(((l.${qi(ohlcCols.close)} / NULLIF(l.${qi(ohlcCols.open)}, 0)) - 1) * 100 - ((m.ETF_CLOSE_PRICE / NULLIF(m.ETF_OPEN_PRICE, 0)) - 1) * 100) AS avg_open_close_pct_diff
    FROM ${qi('ETF_STOCK_INFO')} AS l
    INNER JOIN MARKET_SITE_ETF_STOCK_INFO AS m
      ON m.ETF_STOCK_DATE = l.${qi(detected.dateCol)}
      AND ${siteCase} = ${legacyCase}
      AND m.ETF_SITE_ID = ?
    WHERE ${legacyCase} IS NOT NULL
      AND l.${qi(ohlcCols.close)} IS NOT NULL
      AND l.${qi(ohlcCols.open)} IS NOT NULL
      AND m.ETF_CLOSE_PRICE IS NOT NULL
      AND m.ETF_OPEN_PRICE IS NOT NULL
    GROUP BY etf_id
    ORDER BY etf_id
    `,
    params
  );
  return rows.map((row) => ({
    etfId: row.etf_id,
    overlapRows: Number(row.overlap_rows || 0),
    minDate: fmtDate(row.min_date),
    maxDate: fmtDate(row.max_date),
    avgCloseRatio: row.avg_close_ratio == null ? null : Number(row.avg_close_ratio),
    minCloseRatio: row.min_close_ratio == null ? null : Number(row.min_close_ratio),
    maxCloseRatio: row.max_close_ratio == null ? null : Number(row.max_close_ratio),
    avgOpenClosePctDiff: row.avg_open_close_pct_diff == null ? null : Number(row.avg_open_close_pct_diff),
  }));
}

async function summarizeTable(table) {
  const exists = await tableExists(table);
  if (!exists) return { table, exists: false };

  const columns = await getColumns(table);
  const dateCol = pickColumn(columns, CANDIDATES.date);
  const sourceCol = pickColumn(columns, CANDIDATES.source);
  const resultTypeCol = pickColumn(columns, CANDIDATES.resultType);
  const returnRateCol = pickColumn(columns, CANDIDATES.returnRate);
  const ohlcCols = {
    open: pickColumn(columns, CANDIDATES.open),
    high: pickColumn(columns, CANDIDATES.high),
    low: pickColumn(columns, CANDIDATES.low),
    close: pickColumn(columns, CANDIDATES.close),
    prevClose: pickColumn(columns, CANDIDATES.prevClose),
  };

  const rowFields = ['COUNT(*) AS row_count'];
  if (dateCol) rowFields.push(`MIN(${qi(dateCol)}) AS min_date`, `MAX(${qi(dateCol)}) AS max_date`, `COUNT(DISTINCT ${qi(dateCol)}) AS distinct_dates`);
  if (ohlcCols.open && ohlcCols.high && ohlcCols.low && ohlcCols.close) {
    rowFields.push(`SUM(${qi(ohlcCols.open)} IS NOT NULL AND ${qi(ohlcCols.high)} IS NOT NULL AND ${qi(ohlcCols.low)} IS NOT NULL AND ${qi(ohlcCols.close)} IS NOT NULL) AS full_ohlc_rows`);
  }
  if (ohlcCols.open && ohlcCols.close) {
    rowFields.push(`SUM(${qi(ohlcCols.open)} IS NOT NULL AND ${qi(ohlcCols.close)} IS NOT NULL) AS open_close_rows`);
  }
  if (ohlcCols.prevClose && ohlcCols.open && ohlcCols.close) {
    rowFields.push(`SUM(${qi(ohlcCols.prevClose)} IS NOT NULL AND ${qi(ohlcCols.open)} IS NOT NULL AND ${qi(ohlcCols.close)} IS NOT NULL) AS prev_open_close_rows`);
  }
  const stats = await single(`SELECT ${rowFields.join(', ')} FROM ${qi(table)}`);
  const codeMapping = await findBestCodeMapping(table, columns, dateCol, ohlcCols);
  const meta = { dateCol, sourceCol, resultTypeCol, returnRateCol, ohlcCols, codeMapping };
  const y25ResultTypes = await resultTypeSummary(table, meta);

  const sourceRows = sourceCol
    ? await dbQuery(
      `
      SELECT ${qi(sourceCol)} AS source_value, COUNT(*) AS row_count
      FROM ${qi(table)}
      GROUP BY ${qi(sourceCol)}
      ORDER BY row_count DESC
      LIMIT 20
      `
    )
    : [];

  return {
    table,
    exists: true,
    columns: outputColumns(table, columns),
    detected: {
      dateCol,
      sourceCol,
      resultTypeCol,
      returnRateCol,
      ohlcCols,
      codeCol: codeMapping.best?.codeCol || null,
    },
    stats: {
      rowCount: Number(stats.row_count || 0),
      minDate: fmtDate(stats.min_date),
      maxDate: fmtDate(stats.max_date),
      distinctDates: stats.distinct_dates == null ? null : Number(stats.distinct_dates),
      fullOhlcRows: stats.full_ohlc_rows == null ? null : Number(stats.full_ohlc_rows),
      openCloseRows: stats.open_close_rows == null ? null : Number(stats.open_close_rows),
      prevOpenCloseRows: stats.prev_open_close_rows == null ? null : Number(stats.prev_open_close_rows),
    },
    sourceValues: sourceRows.map((row) => ({
      value: row.source_value,
      rowCount: Number(row.row_count || 0),
    })),
    codeMapping,
    y25ResultTypes,
  };
}

async function main() {
  const tables = {};
  for (const table of TABLES) {
    tables[table] = await summarizeTable(table);
  }

  const legacyMeta = tables.ETF_STOCK_INFO;
  const currentCounts = await currentApiSampleCounts();
  const legacyCounts = legacyMeta.exists && legacyMeta.detected.codeCol
    ? await sampleCountsForOhlcTable({
      table: 'ETF_STOCK_INFO',
      dateCol: legacyMeta.detected.dateCol,
      codeCol: legacyMeta.detected.codeCol,
      ohlcCols: legacyMeta.detected.ohlcCols,
    })
    : null;
  const currentTableCounts = await sampleCountsForOhlcTable({
    table: 'MARKET_SITE_ETF_STOCK_INFO',
    dateCol: 'ETF_STOCK_DATE',
    codeCol: 'ETF_STOCK_ID',
    ohlcCols: {
      open: 'ETF_OPEN_PRICE',
      high: 'ETF_HIGH_PRICE',
      low: 'ETF_LOW_PRICE',
      close: 'ETF_CLOSE_PRICE',
      prevClose: 'ETF_BEF_CLOSE_PRICE',
    },
    sourceCol: 'ETF_SITE_ID',
    sourceValue: 'NVR',
  });
  const overlapPrice = await overlapPriceCheck(legacyMeta);

  const output = {
    auditDate: new Date().toISOString(),
    selectedDate: SELECTED_DATE,
    period: PERIOD,
    startDate: START_DATE,
    selectedGrade: { priceGrade: PRICE_GRADE, growthGrade: GROWTH_GRADE, label: 'P-5/G+4' },
    tables,
    sampleComparison: {
      currentApiNvr: currentCounts,
      currentTableNvr: currentTableCounts,
      legacyEtfStockInfo: legacyCounts,
    },
    overlapPriceCheckWithMarketSiteNvr: overlapPrice,
  };

  console.log(JSON.stringify(output, null, 2));
}

main()
  .catch((error) => {
    console.error('[audit_legacy_etf_tables_for_index_signal] failed:', error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
