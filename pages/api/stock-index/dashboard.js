'use strict';

const {
  INDICATORS,
  formatDate,
  formatDateTime,
  getGradeDiagnostics,
  gradeDiagnosticsSummary,
  getLatestStockDate,
  getLatestUsableStockDate,
  getRecentRows,
  getStockRow,
  gradeLabel,
  mapIndicator,
  mapKospi,
  marketStatus,
  parseRequestedDate,
  todayInKst,
  toIntOrNull,
  toNumberOrNull,
  warningFromGrades,
} = require('../../../lib/stockIndexCore');

const _cache = globalThis.__stock_index_dashboard_cache || (globalThis.__stock_index_dashboard_cache = new Map());

function cacheGet(key) {
  const item = _cache.get(key);
  if (!item) return null;
  if (Date.now() > item.exp) {
    _cache.delete(key);
    return null;
  }
  return item.data;
}

function cacheSet(key, data, ttlMs = 60 * 1000) {
  if (_cache.size > 100) _cache.clear();
  _cache.set(key, { exp: Date.now() + ttlMs, data });
}

function emptyResponse({ requestedDate, selectedDate, maxDate, latestDate }) {
  return {
    ok: true,
    hasData: false,
    date: selectedDate,
    requestedDate,
    maxDate,
    latestDate,
    marketStatus: 'no_data',
    marketStatusLabel: '데이터 없음',
    kospi: {
      basePrice: null,
      openPrice: null,
      highPrice: null,
      lowPrice: null,
      closePrice: null,
      openChangePct: null,
      closeChangePct: null,
    },
    grades: {
      priceGrade: null,
      growthGrade: null,
      priceGradeLabel: null,
      growthGradeLabel: null,
      priceScore: null,
      growthScore: null,
      gradeSourceDate: null,
      warning: 'no_stock_invest_info_row',
    },
    indicators: [],
    diagnostics: {
      zeroPriceGradeRows: 0,
      zeroGrowthGradeRows: 0,
      outOfRangePriceGradeRows: 0,
      outOfRangeGrowthGradeRows: 0,
      outOfRangeGradeRows: 0,
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const maxDate = todayInKst();
  const parsed = parseRequestedDate(req.query.date);
  if (!parsed.ok) return res.status(400).json({ ok: false, error: parsed.error, maxDate });
  if (parsed.date && parsed.date > maxDate) return res.status(400).json({ ok: false, error: 'future_date_not_allowed', maxDate });

  try {
    const latestDate = await getLatestStockDate(maxDate);
    const latestUsableDate = await getLatestUsableStockDate(maxDate);
    const selectedDate = parsed.date || latestUsableDate || latestDate || maxDate;
    const cacheKey = `dashboard:${selectedDate}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);

    const row = await getStockRow(selectedDate);
    if (!row) {
      const out = emptyResponse({ requestedDate: parsed.date, selectedDate, maxDate, latestDate });
      cacheSet(cacheKey, out);
      return res.status(200).json(out);
    }

    const diagnostics = await getGradeDiagnostics();
    const recentRows = await getRecentRows(selectedDate, 5);
    const status = marketStatus(row, selectedDate);
    const warning = warningFromGrades(row);
    const indicators = INDICATORS.map((indicator) => mapIndicator(row, indicator, recentRows));
    const kospi = mapKospi(row);

    const out = {
      ok: true,
      hasData: true,
      date: formatDate(row.selected_date),
      requestedDate: parsed.date,
      maxDate,
      latestDate,
      latestUsableDate,
      marketStatus: status.marketStatus,
      marketStatusLabel: status.marketStatusLabel,
      kospi,
      grades: {
        priceGrade: toIntOrNull(row.price_grade),
        growthGrade: toIntOrNull(row.growth_grade),
        priceGradeLabel: gradeLabel(row.price_grade),
        growthGradeLabel: gradeLabel(row.growth_grade),
        priceScore: toNumberOrNull(row.price_score),
        growthScore: toNumberOrNull(row.growth_score),
        gradeSourceDate: formatDate(row.previous_market_date),
        warning,
      },
      indicators,
      diagnostics: gradeDiagnosticsSummary(diagnostics),
      status: {
        usHoliday: String(row.us_holiday_yn || '').toUpperCase() === 'Y',
        krHoliday: String(row.kr_holiday_yn || '').toUpperCase() === 'Y',
        isSuccess: String(row.if_success_yn || '').toUpperCase() === 'Y',
      },
      updatedAt: formatDateTime(row.updated_at),
    };

    cacheSet(cacheKey, out);
    return res.status(200).json(out);
  } catch (error) {
    console.error('[stock-index/dashboard] error:', error?.message || error);
    return res.status(500).json({ ok: false, error: 'stock_index_dashboard_failed' });
  }
}
