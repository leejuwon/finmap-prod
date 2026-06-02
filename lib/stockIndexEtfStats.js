'use strict';

const { dbQuery } = require('./db');
const {
  addYears,
  formatDate,
  formatDateTime,
  getLatestStockDate,
  getLatestUsableStockDate,
  getStockRow,
  gradeLabel,
  gradeRange,
  isValidGrade,
  parseLimit,
  parseRangeMode,
  parseRequestedDate,
  round,
  sampleQuality,
  todayInKst,
  toIntOrNull,
  toNumberOrNull,
  warningFromGrades,
} = require('./stockIndexCore');

const DEFAULT_ETF_IDS = ['KDX_LVG', 'KDX_I2X'];
const PROXY_ETF_IDS = new Set(['KSP_LVG', 'KSP_I2X']);
const ALLOWED_ETF_IDS = new Set(DEFAULT_ETF_IDS);
const SOURCE_PRIORITY = ['NVR', 'DMF', 'YHF'];
const SOURCE_NAMES = {
  NVR: 'Naver',
  DMF: 'Daum Mobile Finance',
  YHF: 'Yahoo Finance',
};
const ENTRY_OFFSETS = [0, -0.2, -0.3, -0.5, -0.7, -1.0, -1.5, -2.0];

const ETF_META = {
  KDX_LVG: {
    etfId: 'KDX_LVG',
    ticker: '122630',
    yahooTicker: '122630.KS',
    nameKo: 'KODEX 레버리지',
    nameEn: 'KODEX Leverage',
    productType: 'leveraged',
    leverageMultiple: 2,
  },
  KDX_I2X: {
    etfId: 'KDX_I2X',
    ticker: '252670',
    yahooTicker: '252670.KS',
    nameKo: 'KODEX 200선물인버스2X',
    nameEn: 'KODEX 200 Futures Inverse 2X',
    productType: 'inverse_leveraged',
    leverageMultiple: -2,
  },
};

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function parseEtfPeriod(value) {
  const v = String(firstValue(value) || '3y').toLowerCase();
  return ['1y', '3y', '5y', 'all'].includes(v) ? v : '3y';
}

function parseEtfSource(value) {
  const raw = String(firstValue(value) || 'auto').toLowerCase();
  if (raw === 'legacy' || raw === 'legacy_etf_stock_info') return { ok: true, source: 'legacy' };
  const v = raw.toUpperCase();
  if (v === 'AUTO') return { ok: true, source: 'auto' };
  if (SOURCE_PRIORITY.includes(v)) return { ok: true, source: v };
  return { ok: false, error: 'invalid_source' };
}

function parseEtfIds(value) {
  const raw = firstValue(value);
  if (raw == null || raw === '') return { ok: true, etfIds: [...DEFAULT_ETF_IDS] };

  const etfIds = [...new Set(String(raw).split(',').map((id) => id.trim().toUpperCase()).filter(Boolean))];
  if (!etfIds.length) return { ok: true, etfIds: [...DEFAULT_ETF_IDS] };

  const proxyIds = etfIds.filter((id) => PROXY_ETF_IDS.has(id));
  if (proxyIds.length) {
    return { ok: false, error: 'proxy_etf_not_allowed', proxyEtfs: proxyIds };
  }

  const unsupportedEtfs = etfIds.filter((id) => !ALLOWED_ETF_IDS.has(id));
  if (unsupportedEtfs.length) {
    return { ok: false, error: 'unsupported_etf', unsupportedEtfs };
  }

  return { ok: true, etfIds };
}

function parseMinSamples(value) {
  const n = Number(firstValue(value));
  if (!Number.isFinite(n)) return 20;
  return Math.min(Math.max(Math.trunc(n), 1), 500);
}

function parseIncludeOffsets(value) {
  const raw = firstValue(value);
  if (raw == null || raw === '') return true;
  return String(raw) === '1';
}

function parseEtfStatsQuery(query = {}) {
  const maxDate = todayInKst();
  const parsedDate = parseRequestedDate(query.date);
  if (!parsedDate.ok) return { ok: false, status: 400, error: parsedDate.error, maxDate };
  if (parsedDate.date && parsedDate.date > maxDate) {
    return { ok: false, status: 400, error: 'future_date_not_allowed', maxDate };
  }

  const source = parseEtfSource(query.source);
  if (!source.ok) return { ok: false, status: 400, error: source.error };

  const etfs = parseEtfIds(query.etfs);
  if (!etfs.ok) {
    return {
      ok: false,
      status: 400,
      error: etfs.error,
      proxyEtfs: etfs.proxyEtfs,
      unsupportedEtfs: etfs.unsupportedEtfs,
    };
  }

  return {
    ok: true,
    options: {
      date: parsedDate.date,
      maxDate,
      period: parseEtfPeriod(query.period),
      rangeMode: parseRangeMode(query.rangeMode),
      source: source.source,
      etfIds: etfs.etfIds,
      minSamples: parseMinSamples(query.minSamples),
      includeOffsets: parseIncludeOffsets(query.includeOffsets),
      limit: parseLimit(query.limit, 20),
    },
  };
}

function periodStartDate(selectedDate, period) {
  if (period === '1y') return addYears(selectedDate, -1);
  if (period === '3y') return addYears(selectedDate, -3);
  if (period === '5y') return addYears(selectedDate, -5);
  return null;
}

function placeholders(items) {
  return items.map(() => '?').join(',');
}

function average(values) {
  const nums = values.map(Number).filter(Number.isFinite);
  if (!nums.length) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function median(values) {
  const nums = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  if (nums.length % 2) return nums[mid];
  return (nums[mid - 1] + nums[mid]) / 2;
}

function rate(count, total) {
  return total ? round((count / total) * 100) : 0;
}

function minValue(values) {
  const nums = values.map(Number).filter(Number.isFinite);
  return nums.length ? Math.min(...nums) : null;
}

function maxValue(values) {
  const nums = values.map(Number).filter(Number.isFinite);
  return nums.length ? Math.max(...nums) : null;
}

function pctChange(value, base) {
  const v = toNumberOrNull(value);
  const b = toNumberOrNull(base);
  if (v == null || b == null || b === 0) return null;
  return ((v / b) - 1) * 100;
}

function gapGroup(prefix, pct) {
  const n = toNumberOrNull(pct);
  if (n == null) return null;
  if (n >= 1) return `${prefix}_GAP_UP_STRONG`;
  if (n > 0 && n < 1) return `${prefix}_GAP_UP_WEAK`;
  if (n === 0) return `${prefix}_FLAT`;
  if (n > -1 && n < 0) return `${prefix}_GAP_DOWN_WEAK`;
  return `${prefix}_GAP_DOWN_STRONG`;
}

function combinedGradeLabel(priceGrade, growthGrade) {
  const price = gradeLabel(priceGrade);
  const growth = gradeLabel(growthGrade);
  if (!price || !growth) return null;
  return `P${price}/G${growth}`;
}

function normalizeDbRow(row) {
  const kospiPrevClose = toNumberOrNull(row.kospi_prev_close);
  const kospiOpen = toNumberOrNull(row.kospi_open);
  const kospiHigh = toNumberOrNull(row.kospi_high);
  const kospiLow = toNumberOrNull(row.kospi_low);
  const kospiClose = toNumberOrNull(row.kospi_close);
  const etfPrevClose = toNumberOrNull(row.etf_prev_close);
  const etfOpen = toNumberOrNull(row.etf_open);
  const etfHigh = toNumberOrNull(row.etf_high);
  const etfLow = toNumberOrNull(row.etf_low);
  const etfClose = toNumberOrNull(row.etf_close);
  const kospiOpenGapPct = pctChange(kospiOpen, kospiPrevClose);
  const kospiOpenToClosePct = pctChange(kospiClose, kospiOpen);
  const etfPrevCloseToOpenPct = pctChange(etfOpen, etfPrevClose);
  const etfOpenToClosePct = pctChange(etfClose, etfOpen);
  const etfPrevCloseToClosePct = pctChange(etfClose, etfPrevClose);
  const priceGrade = toIntOrNull(row.price_grade);
  const growthGrade = toIntOrNull(row.growth_grade);

  return {
    date: formatDate(row.stock_date),
    source: String(row.source || ''),
    sourceName: row.source_name || SOURCE_NAMES[row.source] || row.source || null,
    etfId: String(row.etf_id || ''),
    etfName: row.etf_name || ETF_META[row.etf_id]?.nameKo || row.etf_id || null,
    priceGrade,
    growthGrade,
    combinedGradeLabel: combinedGradeLabel(priceGrade, growthGrade),
    kospiPrevClose,
    kospiOpen,
    kospiHigh,
    kospiLow,
    kospiClose,
    kospiOpenGapPct,
    kospiOpenToClosePct,
    kospiGapGroup: gapGroup('KOSPI', kospiOpenGapPct),
    etfPrevClose,
    etfOpen,
    etfHigh,
    etfLow,
    etfClose,
    etfPrevCloseToOpenPct,
    etfOpenToClosePct,
    etfPrevCloseToClosePct,
    etfGapGroup: gapGroup('ETF', etfPrevCloseToOpenPct),
    stockUpdatedAt: formatDateTime(row.stock_updated_at),
    etfUpdatedAt: formatDateTime(row.etf_updated_at),
  };
}

function hasRequiredOhlc(row, includeOffsets) {
  const required = [
    row.kospiPrevClose,
    row.kospiOpen,
    row.kospiClose,
    row.etfPrevClose,
    row.etfOpen,
    row.etfClose,
  ];
  if (includeOffsets) required.push(row.etfLow);
  return required.every((value) => value != null)
    && row.kospiPrevClose > 0
    && row.kospiOpen > 0
    && row.etfPrevClose > 0
    && row.etfOpen > 0;
}

function hasFullOhlc(row) {
  return [
    row.kospiOpen,
    row.kospiHigh,
    row.kospiLow,
    row.kospiClose,
    row.etfOpen,
    row.etfHigh,
    row.etfLow,
    row.etfClose,
  ].every((value) => value != null);
}

function sortedDates(rows) {
  return [...new Set(rows.map((row) => row.date).filter(Boolean))].sort();
}

function commonDates(rows, etfIds) {
  if (!etfIds.length) return [];
  const sets = etfIds.map((etfId) => new Set(rows.filter((row) => row.etfId === etfId).map((row) => row.date)));
  if (!sets.length) return [];
  return [...sets[0]].filter((date) => sets.every((set) => set.has(date))).sort();
}

function summarizeSource(source, rawRows, usableRows, fullRows, etfIds) {
  const common = commonDates(usableRows, etfIds);
  const fullCommon = commonDates(fullRows, etfIds);
  const commonSet = new Set(common);
  const fullCommonSet = new Set(fullCommon);
  const sourceDates = sortedDates(usableRows);
  const perEtf = etfIds.map((etfId) => {
    const raw = rawRows.filter((row) => row.etfId === etfId);
    const usable = usableRows.filter((row) => row.etfId === etfId);
    const full = fullRows.filter((row) => row.etfId === etfId);
    const dates = sortedDates(usable);
    return {
      etfId,
      nameKo: ETF_META[etfId]?.nameKo || etfId,
      rawRows: raw.length,
      usableRows: usable.length,
      fullOhlcRows: full.length,
      commonMatchedRows: usable.filter((row) => commonSet.has(row.date)).length,
      commonFullOhlcRows: full.filter((row) => fullCommonSet.has(row.date)).length,
      nullOhlcExcludedRows: raw.length - usable.length,
      firstDate: dates[0] || null,
      latestDate: dates.length ? dates[dates.length - 1] : null,
    };
  });

  return {
    source,
    sourceName: SOURCE_NAMES[source] || source,
    rawMatchedRows: rawRows.length,
    usableRows: usableRows.length,
    nullOhlcExcludedRows: rawRows.length - usableRows.length,
    matchedDays: common.length,
    matchedFullOhlcDays: fullCommon.length,
    firstDate: sourceDates[0] || null,
    latestDate: sourceDates.length ? sourceDates[sourceDates.length - 1] : null,
    perEtf,
  };
}

function sourcePriorityRank(source) {
  const index = SOURCE_PRIORITY.indexOf(source);
  return index === -1 ? SOURCE_PRIORITY.length : index;
}

function chooseAutoSource(summaries, minSamples) {
  const naver = summaries.find((summary) => summary.source === 'NVR');
  if (naver && naver.matchedDays >= minSamples) {
    return { source: 'NVR', reason: 'NVR_PRIORITY_MIN_SAMPLE_MET' };
  }

  const sorted = [...summaries].sort((a, b) => {
    if (b.matchedDays !== a.matchedDays) return b.matchedDays - a.matchedDays;
    if (b.matchedFullOhlcDays !== a.matchedFullOhlcDays) return b.matchedFullOhlcDays - a.matchedFullOhlcDays;
    if ((b.latestDate || '') !== (a.latestDate || '')) return String(b.latestDate || '').localeCompare(String(a.latestDate || ''));
    return sourcePriorityRank(a.source) - sourcePriorityRank(b.source);
  });

  const selected = sorted[0] || naver || summaries[0] || { source: 'NVR' };
  return {
    source: selected.source,
    reason: naver && selected.source === 'NVR' ? 'NVR_BELOW_MIN_SAMPLE_BEST_AVAILABLE' : (naver ? 'NVR_BELOW_MIN_SAMPLE_AUTO_FALLBACK' : 'AUTO_BEST_AVAILABLE_SOURCE'),
  };
}

function buildSampleSql({ selectedDate, period, priceGrades, growthGrades, etfIds, source }) {
  const filters = [
    'sii.KSP_STOCK_DATE < ?',
    'sii.PRICE_TOT_SCORE_GRADE IS NOT NULL',
    'sii.GROWTH_TOT_SCORE_GRADE IS NOT NULL',
  ];
  const params = [selectedDate];
  const startDate = periodStartDate(selectedDate, period);
  if (startDate) {
    filters.push('sii.KSP_STOCK_DATE >= ?');
    params.push(startDate);
  }

  filters.push(`sii.PRICE_TOT_SCORE_GRADE IN (${placeholders(priceGrades)})`);
  params.push(...priceGrades);
  filters.push(`sii.GROWTH_TOT_SCORE_GRADE IN (${placeholders(growthGrades)})`);
  params.push(...growthGrades);
  filters.push(`e.ETF_STOCK_ID IN (${placeholders(etfIds)})`);
  params.push(...etfIds);
  filters.push('e.ETF_SITE_ID = ?');
  params.push(source);

  return { filters, params };
}

async function fetchSourceRows({ selectedDate, period, priceGrades, growthGrades, etfIds, source, includeOffsets }) {
  const { filters, params } = buildSampleSql({ selectedDate, period, priceGrades, growthGrades, etfIds, source });
  const rawRows = await dbQuery(
    `
    SELECT
      sii.KSP_STOCK_DATE AS stock_date,
      sii.KSP_BEF_CLOSE_PRICE AS kospi_prev_close,
      sii.KSP_OPEN_PRICE AS kospi_open,
      sii.KSP_HIGH_PRICE AS kospi_high,
      sii.KSP_LOW_PRICE AS kospi_low,
      sii.KSP_CLOSE_PRICE AS kospi_close,
      sii.PRICE_TOT_SCORE_GRADE AS price_grade,
      sii.GROWTH_TOT_SCORE_GRADE AS growth_grade,
      sii.updated_at AS stock_updated_at,
      e.ETF_STOCK_ID AS etf_id,
      e.ETF_STOCK_NAME AS etf_name,
      e.ETF_SITE_ID AS source,
      e.ETF_SITE_NAME AS source_name,
      e.ETF_BEF_CLOSE_PRICE AS etf_prev_close,
      e.ETF_OPEN_PRICE AS etf_open,
      e.ETF_HIGH_PRICE AS etf_high,
      e.ETF_LOW_PRICE AS etf_low,
      e.ETF_CLOSE_PRICE AS etf_close,
      e.updated_at AS etf_updated_at
    FROM STOCK_INVEST_INFO AS sii
    INNER JOIN MARKET_SITE_ETF_STOCK_INFO AS e
      ON e.ETF_STOCK_DATE = sii.KSP_STOCK_DATE
    WHERE ${filters.join('\n      AND ')}
    ORDER BY sii.KSP_STOCK_DATE DESC, e.ETF_STOCK_ID ASC
    `,
    params
  );

  const normalized = rawRows.map(normalizeDbRow);
  const usableRows = normalized.filter((row) => hasRequiredOhlc(row, includeOffsets));
  const fullRows = usableRows.filter(hasFullOhlc);
  return {
    source,
    rawRows: normalized,
    usableRows,
    fullRows,
    summary: summarizeSource(source, normalized, usableRows, fullRows, etfIds),
  };
}

function summarizeGapGroups(rows, field) {
  const total = rows.length;
  const groups = rows.reduce((acc, row) => {
    const key = row[field] || 'UNKNOWN';
    if (!acc[key]) acc[key] = { group: key, count: 0, openToCloseValues: [] };
    acc[key].count += 1;
    acc[key].openToCloseValues.push(row.etfOpenToClosePct);
    return acc;
  }, {});

  return Object.values(groups).map((group) => ({
    group: group.group,
    count: group.count,
    rate: rate(group.count, total),
    avgEtfOpenToClosePct: round(average(group.openToCloseValues)),
  })).sort((a, b) => b.count - a.count || String(a.group).localeCompare(String(b.group)));
}

function computeOffsetStats(rows, offsetPct) {
  const sampleCount = rows.length;
  const filled = [];

  for (const row of rows) {
    if (row.etfOpen == null || row.etfClose == null || row.etfOpen <= 0) continue;
    const entryPrice = row.etfOpen * (1 + (offsetPct / 100));
    if (entryPrice <= 0) continue;
    const isFilled = offsetPct === 0 || (row.etfLow != null && row.etfLow <= entryPrice);
    if (!isFilled) continue;
    const returnPct = pctChange(row.etfClose, entryPrice);
    if (returnPct == null) continue;
    filled.push(returnPct);
  }

  const winCount = filled.filter((value) => value > 0).length;
  const lossCount = filled.filter((value) => value < 0).length;
  const flatCount = filled.filter((value) => value === 0).length;
  const gainSum = filled.filter((value) => value > 0).reduce((sum, value) => sum + value, 0);
  const lossAbsSum = Math.abs(filled.filter((value) => value < 0).reduce((sum, value) => sum + value, 0));
  const avgReturnPct = average(filled);
  const fillRate = rate(filled.length, sampleCount);

  return {
    offsetPct,
    sampleCount,
    filledCount: filled.length,
    fillRate,
    winRate: rate(winCount, filled.length),
    lossRate: rate(lossCount, filled.length),
    flatRate: rate(flatCount, filled.length),
    avgReturnPct: round(avgReturnPct),
    medianReturnPct: round(median(filled)),
    maxGainPct: round(maxValue(filled)),
    maxLossPct: round(minValue(filled)),
    profitFactor: lossAbsSum > 0 ? round(gainSum / lossAbsSum, 2) : null,
    expectedReturnPct: avgReturnPct == null ? null : round(avgReturnPct * (fillRate / 100)),
  };
}

function chooseBestEntryOffset(offsetStats, minSamples) {
  const candidates = offsetStats.filter((stat) => (
    stat.filledCount >= minSamples
    && stat.fillRate >= 15
    && stat.avgReturnPct != null
    && stat.medianReturnPct != null
    && stat.maxLossPct != null
    && stat.avgReturnPct > 0
    && stat.medianReturnPct > 0
    && stat.maxLossPct > -5
  ));

  if (!candidates.length) {
    return {
      bestEntryOffset: null,
      bestEntryOffsetReason: 'NO_OFFSET_MET_MIN_SAMPLE_AND_RETURN_FILTERS',
    };
  }

  const best = [...candidates].sort((a, b) => (b.expectedReturnPct || -Infinity) - (a.expectedReturnPct || -Infinity))[0];
  return {
    bestEntryOffset: {
      offsetPct: best.offsetPct,
      filledCount: best.filledCount,
      fillRate: best.fillRate,
      avgReturnPct: best.avgReturnPct,
      medianReturnPct: best.medianReturnPct,
      expectedReturnPct: best.expectedReturnPct,
      reason: 'HIGHEST_EXPECTED_RETURN_AMONG_FILTERED_OFFSETS',
    },
    bestEntryOffsetReason: null,
  };
}

function summarizeEtf(rows, etfId, { source, includeOffsets, minSamples, limit }) {
  const etfRows = rows.filter((row) => row.etfId === etfId);
  const openToClose = etfRows.map((row) => row.etfOpenToClosePct).filter((value) => value != null);
  const prevCloseToOpen = etfRows.map((row) => row.etfPrevCloseToOpenPct).filter((value) => value != null);
  const prevCloseToClose = etfRows.map((row) => row.etfPrevCloseToClosePct).filter((value) => value != null);
  const winCount = openToClose.filter((value) => value > 0).length;
  const lossCount = openToClose.filter((value) => value < 0).length;
  const flatCount = openToClose.filter((value) => value === 0).length;
  const offsetStats = includeOffsets ? ENTRY_OFFSETS.map((offset) => computeOffsetStats(etfRows, offset)) : [];
  const best = includeOffsets
    ? chooseBestEntryOffset(offsetStats, minSamples)
    : { bestEntryOffset: null, bestEntryOffsetReason: 'ENTRY_OFFSETS_DISABLED' };

  return {
    etfId,
    nameKo: ETF_META[etfId]?.nameKo || etfRows[0]?.etfName || etfId,
    nameEn: ETF_META[etfId]?.nameEn || etfId,
    ticker: ETF_META[etfId]?.ticker || null,
    productType: ETF_META[etfId]?.productType || null,
    source,
    sampleCount: openToClose.length,
    sampleQuality: sampleQuality(openToClose.length),
    avgOpenToClosePct: round(average(openToClose)),
    medianOpenToClosePct: round(median(openToClose)),
    winRate: rate(winCount, openToClose.length),
    lossRate: rate(lossCount, openToClose.length),
    flatRate: rate(flatCount, openToClose.length),
    maxGainPct: round(maxValue(openToClose)),
    maxLossPct: round(minValue(openToClose)),
    avgPrevCloseToOpenPct: round(average(prevCloseToOpen)),
    medianPrevCloseToOpenPct: round(median(prevCloseToOpen)),
    avgPrevCloseToClosePct: round(average(prevCloseToClose)),
    medianPrevCloseToClosePct: round(median(prevCloseToClose)),
    gapGroups: {
      kospi: summarizeGapGroups(etfRows, 'kospiGapGroup'),
      etf: summarizeGapGroups(etfRows, 'etfGapGroup'),
    },
    entryOffsets: offsetStats,
    bestEntryOffset: best.bestEntryOffset,
    bestEntryOffsetReason: best.bestEntryOffsetReason,
    similarDates: etfRows.slice(0, limit).map((row) => ({
      date: row.date,
      priceGrade: row.priceGrade,
      growthGrade: row.growthGrade,
      combinedGradeLabel: row.combinedGradeLabel,
      kospiOpenGapPct: round(row.kospiOpenGapPct),
      kospiOpenToClosePct: round(row.kospiOpenToClosePct),
      kospiGapGroup: row.kospiGapGroup,
      etfPrevCloseToOpenPct: round(row.etfPrevCloseToOpenPct),
      etfOpenToClosePct: round(row.etfOpenToClosePct),
      etfPrevCloseToClosePct: round(row.etfPrevCloseToClosePct),
      etfGapGroup: row.etfGapGroup,
    })),
  };
}

function observationSignal(etfs, minSamples) {
  const leverage = etfs.find((etf) => etf.etfId === 'KDX_LVG');
  const inverse = etfs.find((etf) => etf.etfId === 'KDX_I2X');
  if (!leverage || !inverse) {
    return {
      code: 'NO_SIGNAL',
      labelKo: '표본 부족/관찰 우위 없음',
      labelEn: 'No clear historical edge',
      reason: 'required_default_etfs_missing',
    };
  }

  if (leverage.sampleCount < minSamples || inverse.sampleCount < minSamples) {
    return {
      code: 'NO_SIGNAL',
      labelKo: '표본 부족/관찰 우위 없음',
      labelEn: 'No clear historical edge',
      reason: `sample_below_minimum_${minSamples}`,
    };
  }

  const avgDiff = (leverage.avgOpenToClosePct || 0) - (inverse.avgOpenToClosePct || 0);
  const medianDiff = (leverage.medianOpenToClosePct || 0) - (inverse.medianOpenToClosePct || 0);
  const winDiff = (leverage.winRate || 0) - (inverse.winRate || 0);
  const leverageBias = avgDiff >= 0.15 && medianDiff >= 0 && winDiff >= 2
    && leverage.avgOpenToClosePct > 0
    && leverage.medianOpenToClosePct > 0;
  const inverseBias = avgDiff <= -0.15 && medianDiff <= 0 && winDiff <= -2
    && inverse.avgOpenToClosePct > 0
    && inverse.medianOpenToClosePct > 0;

  if (leverageBias) {
    return {
      code: 'LEVERAGE_BIAS',
      labelKo: '레버리지 우세 관찰',
      labelEn: 'Leverage historical bias observed',
      reason: 'leverage_avg_median_win_rate_higher_in_matched_samples',
    };
  }

  if (inverseBias) {
    return {
      code: 'INVERSE_BIAS',
      labelKo: '인버스2X 우세 관찰',
      labelEn: 'Inverse 2X historical bias observed',
      reason: 'inverse_avg_median_win_rate_higher_in_matched_samples',
    };
  }

  const favorsLeverage = [avgDiff > 0, medianDiff > 0, winDiff > 0].filter(Boolean).length;
  const favorsInverse = [avgDiff < 0, medianDiff < 0, winDiff < 0].filter(Boolean).length;
  if (favorsLeverage > 0 && favorsInverse > 0) {
    return {
      code: 'MIXED',
      labelKo: '혼합 관찰',
      labelEn: 'Mixed historical observations',
      reason: 'avg_median_win_rate_do_not_point_to_one_side',
    };
  }

  return {
    code: 'NO_SIGNAL',
    labelKo: '표본 부족/관찰 우위 없음',
    labelEn: 'No clear historical edge',
    reason: 'no_positive_historical_edge_after_thresholds',
  };
}

function baseInfoFromRow(row) {
  const priceGrade = toIntOrNull(row?.price_grade);
  const growthGrade = toIntOrNull(row?.growth_grade);
  const kospiPrevClose = toNumberOrNull(row?.ksp_base_price);
  const kospiOpen = toNumberOrNull(row?.ksp_open_price);
  const kospiHigh = toNumberOrNull(row?.ksp_high_price);
  const kospiLow = toNumberOrNull(row?.ksp_low_price);
  const kospiClose = toNumberOrNull(row?.ksp_close_price);
  const kospiOpenGapPct = pctChange(kospiOpen, kospiPrevClose);
  const kospiOpenToClosePct = pctChange(kospiClose, kospiOpen);

  return {
    priceGrade,
    growthGrade,
    combinedGradeLabel: combinedGradeLabel(priceGrade, growthGrade),
    kospiPrevClose,
    kospiOpen,
    kospiHigh,
    kospiLow,
    kospiClose,
    kospiOpenGapPct: round(kospiOpenGapPct),
    kospiOpenToClosePct: round(kospiOpenToClosePct),
    kospiGapGroup: gapGroup('KOSPI', kospiOpenGapPct),
    updatedAt: formatDateTime(row?.updated_at),
  };
}

function emptyStatsResponse({ date, requestedDate, maxDate, latestDate, latestUsableDate, period, rangeMode, source, etfIds, warningCodes }) {
  return {
    ok: true,
    hasData: false,
    date,
    requestedDate,
    maxDate,
    latestDate,
    latestUsableDate,
    effectiveStatsDate: null,
    priceGrade: null,
    growthGrade: null,
    combinedGradeLabel: null,
    period,
    rangeMode,
    source,
    sourceRequested: source,
    etfsRequested: etfIds,
    matchedDays: 0,
    matchedFullOhlcDays: 0,
    warningCodes,
    signal: {
      code: 'NO_SIGNAL',
      labelKo: '표본 부족/관찰 우위 없음',
      labelEn: 'No clear historical edge',
      reason: 'selected_grade_missing_or_invalid',
    },
    etfs: [],
    sources: [],
  };
}

async function getEtfGradeStats(options = {}) {
  const maxDate = options.maxDate || todayInKst();
  const period = parseEtfPeriod(options.period);
  const rangeMode = parseRangeMode(options.rangeMode);
  const sourceRaw = String(options.source || 'auto').toLowerCase();
  const sourceRequested = sourceRaw === 'legacy' || sourceRaw === 'legacy_etf_stock_info'
    ? 'legacy'
    : (sourceRaw === 'auto' ? 'auto' : String(options.source || 'NVR').toUpperCase());
  const etfIds = options.etfIds?.length ? options.etfIds : [...DEFAULT_ETF_IDS];
  const minSamples = parseMinSamples(options.minSamples);
  const includeOffsets = options.includeOffsets !== false;
  const limit = parseLimit(options.limit, 20);

  if (sourceRequested === 'legacy') {
    const { getLegacyEtfGradeStats } = require('./stockIndexLegacyEtfStats');
    return getLegacyEtfGradeStats({
      maxDate,
      date: options.date,
      period,
      rangeMode,
      etfIds,
      minSamples,
      includeOffsets,
      limit,
    });
  }

  const latestDate = await getLatestStockDate(maxDate);
  const latestUsableDate = await getLatestUsableStockDate(maxDate);
  const selectedDate = options.date || latestUsableDate || latestDate || maxDate;
  const requestedDate = options.date || null;
  const selectedRow = await getStockRow(selectedDate);
  const selectedWarning = warningFromGrades(selectedRow);
  const baseInfo = baseInfoFromRow(selectedRow);
  const warningCodes = ['DAILY_BAR_SIMULATION_ONLY', 'NOT_INVESTMENT_ADVICE'];
  if (includeOffsets) warningCodes.push('ENTRY_OFFSET_USES_DAILY_LOW_ONLY');
  if (selectedWarning) warningCodes.push('SELECTED_GRADE_WARNING');

  if (!selectedRow || !isValidGrade(baseInfo.priceGrade) || !isValidGrade(baseInfo.growthGrade)) {
    warningCodes.push('SELECTED_GRADE_MISSING_OR_INVALID');
    return emptyStatsResponse({
      date: selectedDate,
      requestedDate,
      maxDate,
      latestDate,
      latestUsableDate,
      period,
      rangeMode,
      source: sourceRequested,
      etfIds,
      warningCodes,
    });
  }

  const priceGrades = gradeRange(baseInfo.priceGrade, rangeMode);
  const growthGrades = gradeRange(baseInfo.growthGrade, rangeMode);
  const targetSources = sourceRequested === 'auto' ? SOURCE_PRIORITY : [sourceRequested];
  const sourceResults = [];
  for (const source of targetSources) {
    sourceResults.push(await fetchSourceRows({
      selectedDate,
      period,
      priceGrades,
      growthGrades,
      etfIds,
      source,
      includeOffsets,
    }));
  }

  const summaries = sourceResults.map((result) => result.summary);
  const selection = sourceRequested === 'auto'
    ? chooseAutoSource(summaries, minSamples)
    : { source: sourceRequested, reason: 'REQUESTED_SOURCE' };
  const selectedSourceResult = sourceResults.find((result) => result.source === selection.source) || sourceResults[0];
  const selectedSummary = selectedSourceResult?.summary || summarizeSource(selection.source, [], [], [], etfIds);
  const matchedDateList = commonDates(selectedSourceResult?.usableRows || [], etfIds);
  const matchedDateSet = new Set(matchedDateList);
  const selectedRows = (selectedSourceResult?.usableRows || []).filter((row) => matchedDateSet.has(row.date));
  const etfs = etfIds.map((etfId) => summarizeEtf(selectedRows, etfId, {
    source: selection.source,
    includeOffsets,
    minSamples,
    limit,
  }));
  const signal = observationSignal(etfs, minSamples);

  if (selectedSummary.matchedDays < minSamples) warningCodes.push('LOW_SAMPLE_SIZE');
  if (sourceRequested === 'auto' && selection.reason.startsWith('NVR_BELOW_MIN_SAMPLE')) {
    warningCodes.push('AUTO_NVR_BELOW_MIN_SAMPLE');
  }
  if (sourceRequested === 'auto' && selection.reason === 'NVR_BELOW_MIN_SAMPLE_AUTO_FALLBACK') {
    warningCodes.push('AUTO_SOURCE_FALLBACK');
  }
  if (signal.code !== 'NO_SIGNAL') warningCodes.push('OBSERVATION_SIGNAL_NOT_TRADE_RECOMMENDATION');

  const sources = summaries.map((summary) => ({
    ...summary,
    selected: summary.source === selection.source,
    selectionReason: summary.source === selection.source ? selection.reason : null,
  }));

  return {
    ok: true,
    hasData: true,
    date: selectedDate,
    requestedDate,
    maxDate,
    latestDate,
    latestUsableDate,
    effectiveStatsDate: selectedDate,
    sampleLatestDate: selectedSummary.latestDate || await getLatestUsableStockDate(selectedDate),
    priceGrade: baseInfo.priceGrade,
    growthGrade: baseInfo.growthGrade,
    priceGradeLabel: gradeLabel(baseInfo.priceGrade),
    growthGradeLabel: gradeLabel(baseInfo.growthGrade),
    combinedGradeLabel: baseInfo.combinedGradeLabel,
    period,
    periodStartDate: periodStartDate(selectedDate, period),
    rangeMode,
    gradeRanges: { priceGrades, growthGrades },
    source: selection.source,
    sourceRequested,
    sourceSelectionReason: selection.reason,
    etfsRequested: etfIds,
    minSamples,
    includeOffsets,
    matchedDays: selectedSummary.matchedDays,
    matchedFullOhlcDays: selectedSummary.matchedFullOhlcDays,
    rawMatchedRows: selectedSummary.rawMatchedRows,
    nullOhlcExcludedRows: selectedSummary.nullOhlcExcludedRows,
    kospi: {
      prevClose: baseInfo.kospiPrevClose,
      open: baseInfo.kospiOpen,
      high: baseInfo.kospiHigh,
      low: baseInfo.kospiLow,
      close: baseInfo.kospiClose,
      openGapPct: baseInfo.kospiOpenGapPct,
      openToClosePct: baseInfo.kospiOpenToClosePct,
      gapGroup: baseInfo.kospiGapGroup,
    },
    warningCodes: [...new Set(warningCodes)],
    warning: selectedWarning,
    signal,
    etfs,
    sources,
    cautionKo: 'KODEX 레버리지와 KODEX 200선물인버스2X는 고위험 레버리지·인버스 ETF입니다. 이 응답은 과거 동일 등급 조건의 일봉 시뮬레이션이며 매수·매도 추천이나 수익 보장이 아닙니다.',
    cautionEn: 'Leveraged and inverse ETFs are high-risk products. These results are daily-bar simulations for past matching grade conditions, not buy/sell recommendations or return guarantees.',
  };
}

module.exports = {
  DEFAULT_ETF_IDS,
  ENTRY_OFFSETS,
  ETF_META,
  SOURCE_PRIORITY,
  chooseAutoSource,
  getEtfGradeStats,
  parseEtfPeriod,
  parseEtfStatsQuery,
};
