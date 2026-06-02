'use strict';

process.env.DB_BOOT_CHECK = 'false';
require('dotenv').config({ path: '.env.local', quiet: true });

const { pool } = require('../lib/db');
const {
  getEtfGradeStats,
  parseEtfStatsQuery,
} = require('../lib/stockIndexEtfStats');

const VERIFY_DATE = '2026-06-01';
const LEGACY_FRESHNESS_WARNINGS = [
  'LEGACY_SOURCE_NOT_LATEST',
  'LEGACY_SAMPLE_ENDS_BEFORE_SELECTED_DATE',
];

function fmt(value, suffix = '') {
  if (value == null) return '-';
  return `${value}${suffix}`;
}

function printEtfStats(etf) {
  console.log(`  - ${etf.etfId} ${etf.nameKo}`);
  console.log(`    sample=${etf.sampleCount}, avg=${fmt(etf.avgOpenToClosePct, '%')}, median=${fmt(etf.medianOpenToClosePct, '%')}, winRate=${fmt(etf.winRate, '%')}`);
  console.log(`    prevClose->open avg=${fmt(etf.avgPrevCloseToOpenPct, '%')}, prevClose->close avg=${fmt(etf.avgPrevCloseToClosePct, '%')}`);
  if (etf.entryOffsets?.length) {
    for (const offset of etf.entryOffsets) {
      console.log(`    offset ${offset.offsetPct}%: filled=${offset.filledCount}, fillRate=${fmt(offset.fillRate, '%')}, winRate=${fmt(offset.winRate, '%')}, avg=${fmt(offset.avgReturnPct, '%')}, median=${fmt(offset.medianReturnPct, '%')}, expected=${fmt(offset.expectedReturnPct, '%')}`);
    }
    if (etf.bestEntryOffset) {
      console.log(`    bestEntryOffset=${etf.bestEntryOffset.offsetPct}% expected=${fmt(etf.bestEntryOffset.expectedReturnPct, '%')} reason=${etf.bestEntryOffset.reason}`);
    } else {
      console.log(`    bestEntryOffset=null reason=${etf.bestEntryOffsetReason}`);
    }
  }
}

function printScenario(label, result) {
  console.log(`\n[${label}]`);
  console.log(`date=${result.date}, effectiveStatsDate=${result.effectiveStatsDate}, sampleLatestDate=${result.sampleLatestDate}, legacyMaxDate=${result.legacyMaxDate || '-'}, grade=${result.combinedGradeLabel}, period=${result.period}, rangeMode=${result.rangeMode}, source=${result.source}, requestedSource=${result.sourceRequested}`);
  console.log(`joinedRows(raw)=${result.rawMatchedRows}, matchedDays=${result.matchedDays}, matchedFullOhlcDays=${result.matchedFullOhlcDays}, nullOhlcExcludedRows=${result.nullOhlcExcludedRows}`);
  console.log(`signal=${result.signal.code} (${result.signal.labelKo}) reason=${result.signal.reason}`);
  console.log(`interpretationLevel=${result.interpretationLevel || '-'}, freshnessKo=${result.dataFreshnessLabelKo || '-'}`);
  console.log(`warnings=${(result.warningCodes || []).join(',') || '-'}`);
  for (const source of result.sources || []) {
    console.log(`  source ${source.source}: selected=${source.selected}, matchedDays=${source.matchedDays}, full=${source.matchedFullOhlcDays}, rawRows=${source.rawMatchedRows}, nullExcluded=${source.nullOhlcExcludedRows}, latest=${source.latestDate}`);
  }
  for (const etf of result.etfs || []) printEtfStats(etf);
}

async function main() {
  const scenarios = [];
  for (const source of ['NVR', 'auto']) {
    for (const rangeMode of ['exact', 'near1', 'near2']) {
      scenarios.push({ date: VERIFY_DATE, source, rangeMode, period: '3y', minSamples: 20, includeOffsets: true, limit: 5 });
    }
  }

  const results = [];
  for (const scenario of scenarios) {
    const result = await getEtfGradeStats(scenario);
    results.push(result);
    printScenario(`${scenario.source}/${scenario.rangeMode}`, result);
  }

  console.log('\n[range sample comparison]');
  for (const result of results) {
    console.log(`${result.sourceRequested}/${result.rangeMode}: selectedSource=${result.source}, matchedDays=${result.matchedDays}, rawRows=${result.rawMatchedRows}, nullExcluded=${result.nullOhlcExcludedRows}`);
  }

  const currentNvr = Object.fromEntries(results.filter((result) => result.sourceRequested === 'NVR').map((result) => [result.rangeMode, result]));
  const expectedCurrent = { exact: 1, near1: 3, near2: 9 };
  for (const [rangeMode, expected] of Object.entries(expectedCurrent)) {
    const actual = currentNvr[rangeMode]?.matchedDays;
    if (actual !== expected) {
      throw new Error(`Current NVR ${rangeMode} matchedDays changed: expected ${expected}, got ${actual}`);
    }
  }
  for (const result of results) {
    const warnings = new Set(result.warningCodes || []);
    for (const freshnessWarning of LEGACY_FRESHNESS_WARNINGS) {
      if (warnings.has(freshnessWarning)) {
        throw new Error(`Current source ${result.sourceRequested}/${result.rangeMode} unexpectedly has ${freshnessWarning}`);
      }
    }
  }

  const legacyResults = [];
  for (const rangeMode of ['exact', 'near1', 'near2']) {
    const result = await getEtfGradeStats({
      date: VERIFY_DATE,
      source: 'legacy',
      rangeMode,
      period: '3y',
      minSamples: 20,
      includeOffsets: true,
      limit: 5,
    });
    legacyResults.push(result);
    printScenario(`legacy/${rangeMode}`, result);
  }

  console.log('\n[legacy sample comparison]');
  for (const result of legacyResults) {
    console.log(`legacy/${result.rangeMode}: matchedDays=${result.matchedDays}, rawRows=${result.rawMatchedRows}, sampleLatestDate=${result.sampleLatestDate}, legacyMaxDate=${result.legacyMaxDate}, signal=${result.signal.code}, interpretationLevel=${result.interpretationLevel}`);
  }

  const legacyExpectedMinimums = { exact: 1, near1: 20, near2: 20 };
  for (const [rangeMode, minimum] of Object.entries(legacyExpectedMinimums)) {
    const result = legacyResults.find((item) => item.rangeMode === rangeMode);
    if (!result || result.matchedDays < minimum) {
      throw new Error(`Legacy ${rangeMode} matchedDays below expected minimum ${minimum}: ${result?.matchedDays}`);
    }
    const warnings = new Set(result.warningCodes || []);
    for (const required of ['LEGACY_DATA_SOURCE', 'SOURCE_HAS_NO_PROVIDER_FIELD', 'DAILY_BAR_SIMULATION_ONLY', 'NOT_INVESTMENT_ADVICE', 'ENTRY_OFFSET_USES_DAILY_LOW_ONLY']) {
      if (!warnings.has(required)) throw new Error(`Legacy ${rangeMode} missing warningCode ${required}`);
    }
    if (!result.interpretationLevel) {
      throw new Error(`Legacy ${rangeMode} missing interpretationLevel`);
    }
    if (!result.dataFreshnessLabelKo || !result.dataFreshnessLabelEn) {
      throw new Error(`Legacy ${rangeMode} missing data freshness labels`);
    }
    if ((result.etfs || []).some((etf) => etf.bestEntryOffset) && (!result.bestEntryOffsetCautionKo || !result.bestEntryOffsetCautionEn)) {
      throw new Error(`Legacy ${rangeMode} missing bestEntryOffset caution fields`);
    }
    if (rangeMode === 'near1' || rangeMode === 'near2') {
      if (result.date > result.legacyMaxDate && !warnings.has('LEGACY_SOURCE_NOT_LATEST')) {
        throw new Error(`Legacy ${rangeMode} missing LEGACY_SOURCE_NOT_LATEST`);
      }
      if (result.sampleLatestDate < result.date && !warnings.has('LEGACY_SAMPLE_ENDS_BEFORE_SELECTED_DATE')) {
        throw new Error(`Legacy ${rangeMode} missing LEGACY_SAMPLE_ENDS_BEFORE_SELECTED_DATE`);
      }
      if (result.signal.code === 'MIXED' && result.interpretationLevel !== 'MIXED_OBSERVATION') {
        throw new Error(`Legacy ${rangeMode} expected MIXED_OBSERVATION interpretationLevel, got ${result.interpretationLevel}`);
      }
    }
  }

  const legacyAlias = await getEtfGradeStats({
    date: VERIFY_DATE,
    source: 'legacy_etf_stock_info',
    rangeMode: 'near1',
    period: '3y',
    minSamples: 20,
    includeOffsets: true,
    limit: 3,
  });
  console.log(`legacy_etf_stock_info alias: source=${legacyAlias.source}, requested=${legacyAlias.sourceRequested}, matchedDays=${legacyAlias.matchedDays}`);
  if (legacyAlias.source !== 'LEGACY_ETF_STOCK_INFO' || legacyAlias.sourceRequested !== 'legacy') {
    throw new Error('Expected legacy_etf_stock_info to normalize to legacy source response');
  }

  const highMin = await getEtfGradeStats({ date: VERIFY_DATE, source: 'legacy', rangeMode: 'near2', period: '3y', minSamples: 500, includeOffsets: true, limit: 3 });
  console.log('\n[minSamples guard]');
  console.log(`legacy minSamples=500 signal=${highMin.signal.code}, reason=${highMin.signal.reason}, matchedDays=${highMin.matchedDays}, interpretationLevel=${highMin.interpretationLevel}`);
  if (highMin.signal.code !== 'NO_SIGNAL') {
    throw new Error('Expected NO_SIGNAL when sample count is below minSamples');
  }
  if (highMin.interpretationLevel !== 'INSUFFICIENT_SAMPLE') {
    throw new Error(`Expected INSUFFICIENT_SAMPLE when minSamples guard is active, got ${highMin.interpretationLevel}`);
  }

  const proxyParse = parseEtfStatsQuery({ etfs: 'KSP_LVG,KSP_I2X', source: 'legacy', date: VERIFY_DATE });
  console.log('\n[invalid etf guard]');
  console.log(`proxy request ok=${proxyParse.ok}, error=${proxyParse.error}, proxyEtfs=${(proxyParse.proxyEtfs || []).join(',')}`);
  if (proxyParse.ok || proxyParse.error !== 'proxy_etf_not_allowed') {
    throw new Error('Expected proxy ETF request to be rejected');
  }

  const unsupportedParse = parseEtfStatsQuery({ etfs: 'SPY', source: 'legacy', date: VERIFY_DATE });
  console.log(`unsupported request ok=${unsupportedParse.ok}, error=${unsupportedParse.error}, unsupportedEtfs=${(unsupportedParse.unsupportedEtfs || []).join(',')}`);
  if (unsupportedParse.ok || unsupportedParse.error !== 'unsupported_etf') {
    throw new Error('Expected unsupported ETF request to be rejected');
  }
}

main()
  .catch((error) => {
    console.error('[verify_index_etf_grade_stats] failed:', error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
