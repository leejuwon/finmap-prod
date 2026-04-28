'use strict';

const { dbQuery } = require('../../../lib/db');

const INDICATORS = [
  { code: 'KOSPI', name: 'KOSPI', marketGroup: 'KR', prefix: 'KSP', dateRole: 'SELECTED_DATE', sortOrder: 10 },
  { code: 'SP500', name: 'S&P 500', marketGroup: 'US', prefix: 'SNP', dateRole: 'PREVIOUS_DATE', sortOrder: 20 },
  { code: 'NASDAQ', name: 'Nasdaq', marketGroup: 'US', prefix: 'NDQ', dateRole: 'PREVIOUS_DATE', sortOrder: 30 },
  { code: 'DOW', name: 'Dow Jones', marketGroup: 'US', prefix: 'DWJ', dateRole: 'PREVIOUS_DATE', sortOrder: 40 },
  { code: 'DXY', name: 'Dollar Index', marketGroup: 'MACRO', prefix: 'DXY', dateRole: 'PREVIOUS_DATE', sortOrder: 50 },
  { code: 'WTI', name: 'WTI Crude Oil', marketGroup: 'MACRO', prefix: 'WTI', dateRole: 'PREVIOUS_DATE', sortOrder: 60 },
  { code: 'USDKRW', name: 'USD/KRW', marketGroup: 'MACRO', prefix: 'KRW', dateRole: 'PREVIOUS_DATE', sortOrder: 70 },
  { code: 'US10Y', name: 'U.S. 10Y Treasury Yield', marketGroup: 'MACRO', prefix: 'TNX', dateRole: 'PREVIOUS_DATE', sortOrder: 80 },
];

function toNumberOrNull(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function todayInKst() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function formatDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
  }
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function formatDateTime(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return [
      `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`,
      `${pad2(value.getHours())}:${pad2(value.getMinutes())}:${pad2(value.getSeconds())}`,
    ].join(' ');
  }
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.replace('T', ' ').slice(0, 19);
  return s;
}

function parseRequestedDate(value, maxDate) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === '') {
    return { ok: true, date: null };
  }

  const date = String(raw).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: 'invalid_date' };
  }
  if (date > maxDate) {
    return { ok: false, error: 'future_date_not_allowed' };
  }
  return { ok: true, date };
}

function firstNumberWithBasis(candidates) {
  for (const item of candidates) {
    const value = toNumberOrNull(item.value);
    if (value != null) return { value, basis: item.basis };
  }
  return { value: null, basis: null };
}

function trendFromRate(rate) {
  const n = toNumberOrNull(rate);
  if (n == null) return 'UNKNOWN';
  if (n > 0) return 'UP';
  if (n < 0) return 'DOWN';
  return 'FLAT';
}

function yn(value) {
  return value === 'Y';
}

async function getStockInvestRow(selectedDate) {
  const rows = await dbQuery(
    `
    SELECT
      sii.KSP_STOCK_DATE AS selected_date,
      sii.KSP_BF_STOCK_DATE AS previous_market_date,
      sii.KSP_BEF_CLOSE_PRICE AS ksp_reference_price,
      sii.KSP_OPEN_PRICE AS ksp_open_price,
      sii.KSP_HIGH_PRICE AS ksp_high_price,
      sii.KSP_LOW_PRICE AS ksp_low_price,
      sii.KSP_CLOSE_PRICE AS ksp_close_price,
      sii.KSP_TODAY_DIFF_PRICE AS ksp_change_price,
      sii.KSP_UD_RATE_REAL_BY_TODAY AS ksp_change_rate_today,
      sii.KSP_UD_RATE_REAL_BY_OPEN AS ksp_change_rate_open,
      sii.KSP_UD_RATE_REAL_BY_CLOSE AS ksp_change_rate_close,
      sii.KSP_UD_RATE_REAL_BY_LOW AS ksp_change_rate_low,
      sii.KSP_UD_RATE_REAL_BY_HIGH AS ksp_change_rate_high,
      sii.SNP_STD_PRICE AS snp_reference_price,
      sii.SNP_OPEN_PRICE AS snp_open_price,
      sii.SNP_END_PRICE AS snp_close_price,
      sii.SNP_UD_PRICE AS snp_change_price,
      sii.SNP_UD_RATE_REAL_BY_OPEN AS snp_change_rate_open,
      sii.SNP_UD_RATE_REAL_BY_TODAY AS snp_change_rate_today,
      sii.SNP_UD_RATE_REAL_BY_CLOSE AS snp_change_rate_close,
      sii.SNP_SCORE AS snp_score,
      sii.NDQ_STD_PRICE AS ndq_reference_price,
      sii.NDQ_OPEN_PRICE AS ndq_open_price,
      sii.NDQ_END_PRICE AS ndq_close_price,
      sii.NDQ_UD_PRICE AS ndq_change_price,
      sii.NDQ_UD_RATE_REAL_BY_OPEN AS ndq_change_rate_open,
      sii.NDQ_UD_RATE_REAL_BY_TODAY AS ndq_change_rate_today,
      sii.NDQ_UD_RATE_REAL_BY_CLOSE AS ndq_change_rate_close,
      sii.NDQ_SCORE AS ndq_score,
      sii.DWJ_STD_PRICE AS dwj_reference_price,
      sii.DWJ_OPEN_PRICE AS dwj_open_price,
      sii.DWJ_END_PRICE AS dwj_close_price,
      sii.DWJ_UD_PRICE AS dwj_change_price,
      sii.DWJ_UD_RATE_REAL_BY_OPEN AS dwj_change_rate_open,
      sii.DWJ_UD_RATE_REAL_BY_TODAY AS dwj_change_rate_today,
      sii.DWJ_UD_RATE_REAL_BY_CLOSE AS dwj_change_rate_close,
      sii.DWJ_SCORE AS dwj_score,
      sii.DXY_STD_PRICE AS dxy_reference_price,
      sii.DXY_OPEN_PRICE AS dxy_open_price,
      sii.DXY_END_PRICE AS dxy_close_price,
      sii.DXY_UD_PRICE AS dxy_change_price,
      sii.DXY_UD_RATE_REAL_BY_OPEN AS dxy_change_rate_open,
      sii.DXY_UD_RATE_REAL_BY_TODAY AS dxy_change_rate_today,
      sii.DXY_UD_RATE_REAL_BY_CLOSE AS dxy_change_rate_close,
      sii.DXY_SCORE AS dxy_score,
      sii.TNX_STD_PRICE AS tnx_reference_price,
      sii.TNX_OPEN_PRICE AS tnx_open_price,
      sii.TNX_END_PRICE AS tnx_close_price,
      sii.TNX_UD_PRICE AS tnx_change_price,
      sii.TNX_UD_RATE_REAL_BY_OPEN AS tnx_change_rate_open,
      sii.TNX_UD_RATE_REAL_BY_TODAY AS tnx_change_rate_today,
      sii.TNX_UD_RATE_REAL_BY_CLOSE AS tnx_change_rate_close,
      sii.TNX_SCORE AS tnx_score,
      sii.WTI_STD_PRICE AS wti_reference_price,
      sii.WTI_OPEN_PRICE AS wti_open_price,
      sii.WTI_END_PRICE AS wti_close_price,
      sii.WTI_UD_PRICE AS wti_change_price,
      sii.WTI_UD_RATE_REAL_BY_OPEN AS wti_change_rate_open,
      sii.WTI_UD_RATE_REAL_BY_TODAY AS wti_change_rate_today,
      sii.WTI_UD_RATE_REAL_BY_CLOSE AS wti_change_rate_close,
      sii.WTI_SCORE AS wti_score,
      sii.KRW_STD_PRICE AS krw_reference_price,
      sii.KRW_OPEN_PRICE AS krw_open_price,
      sii.KRW_END_PRICE AS krw_close_price,
      sii.KRW_UD_PRICE AS krw_change_price,
      sii.KRW_UD_RATE_REAL_BY_OPEN AS krw_change_rate_open,
      sii.KRW_UD_RATE_REAL_BY_TODAY AS krw_change_rate_today,
      sii.KRW_UD_RATE_REAL_BY_CLOSE AS krw_change_rate_close,
      sii.KRW_SCORE AS krw_score,
      sii.GROWTH_TOT_SCORE AS growth_total_score,
      sii.PRICE_TOT_SCORE AS price_total_score,
      sii.GROWTH_TOT_SCORE_GRADE AS growth_total_score_grade,
      sii.PRICE_TOT_SCORE_GRADE AS price_total_score_grade,
      sii.PRC_SET_RNG_GRP AS price_set_range_group,
      sii.PARENT_GROWTH_TOT_SCORE_GRADE AS parent_growth_total_score_grade,
      sii.PARENT_PRC_SET_RNG_GRP AS parent_price_set_range_group,
      sii.SNP_OPEN_DO_YN AS snp_open_do_yn,
      sii.NDQ_OPEN_DO_YN AS ndq_open_do_yn,
      sii.DWJ_OPEN_DO_YN AS dwj_open_do_yn,
      sii.DXY_OPEN_DO_YN AS dxy_open_do_yn,
      sii.TNX_OPEN_DO_YN AS tnx_open_do_yn,
      sii.WTI_OPEN_DO_YN AS wti_open_do_yn,
      sii.KRW_OPEN_DO_YN AS krw_open_do_yn,
      sii.BF_KSP_OPEN_DO_YN AS bf_ksp_open_do_yn,
      sii.AF_KSP_OPEN_DO_YN AS af_ksp_open_do_yn,
      sii.CLOSE_KSP_OPEN_DO_YN AS close_ksp_open_do_yn,
      sii.US_HOLYDAY_YN AS us_holiday_yn,
      sii.KR_HOLYDAY_YN AS kr_holiday_yn,
      sii.IF_SUCC_YN AS if_success_yn,
      sii.created_at AS created_at,
      sii.updated_at AS updated_at
    FROM STOCK_INVEST_INFO AS sii
    WHERE sii.KSP_STOCK_DATE = ?
    LIMIT 1
    `,
    [selectedDate]
  );

  return rows[0] || null;
}

async function getLatestStockInvestDate(maxDate) {
  const rows = await dbQuery(
    `
    SELECT
      MAX(sii.KSP_STOCK_DATE) AS selected_date
    FROM STOCK_INVEST_INFO AS sii
    WHERE sii.KSP_STOCK_DATE <= ?
    `,
    [maxDate]
  );

  return formatDate(rows[0]?.selected_date);
}

function mapKospi(row, indicator) {
  const changeRate = firstNumberWithBasis([
    { value: row.ksp_change_rate_close, basis: 'REFERENCE_TO_CLOSE' },
    { value: row.ksp_change_rate_open, basis: 'REFERENCE_TO_OPEN' },
    { value: row.ksp_change_rate_today, basis: 'OPEN_TO_CLOSE' },
  ]);

  return {
    code: indicator.code,
    name: indicator.name,
    marketGroup: indicator.marketGroup,
    baseDate: formatDate(row.selected_date),
    collectedDate: formatDate(row.selected_date),
    referencePrice: toNumberOrNull(row.ksp_reference_price),
    openPrice: toNumberOrNull(row.ksp_open_price),
    highPrice: toNumberOrNull(row.ksp_high_price),
    lowPrice: toNumberOrNull(row.ksp_low_price),
    closePrice: toNumberOrNull(row.ksp_close_price),
    changePrice: toNumberOrNull(row.ksp_change_price),
    changeRate: changeRate.value,
    changeRateBasis: changeRate.basis,
    intradayChangeRate: toNumberOrNull(row.ksp_change_rate_today),
    score: null,
    trend: trendFromRate(changeRate.value),
    dateRole: indicator.dateRole,
    source: 'stock_invest_info',
    sourceTable: 'STOCK_INVEST_INFO',
    sourceId: null,
    sourceName: 'STOCK_INVEST_INFO',
    isSuccess: yn(row.af_ksp_open_do_yn) || yn(row.close_ksp_open_do_yn) || yn(row.bf_ksp_open_do_yn),
    updatedAt: formatDateTime(row.updated_at),
  };
}

function mapGlobalIndicator(row, indicator) {
  const key = indicator.prefix.toLowerCase();
  const changeRate = firstNumberWithBasis([
    { value: row[`${key}_change_rate_close`], basis: 'REFERENCE_TO_CLOSE' },
    { value: row[`${key}_change_rate_open`], basis: 'REFERENCE_TO_OPEN' },
    { value: row[`${key}_change_rate_today`], basis: 'OPEN_TO_CLOSE' },
  ]);

  return {
    code: indicator.code,
    name: indicator.name,
    marketGroup: indicator.marketGroup,
    baseDate: formatDate(row.previous_market_date),
    collectedDate: formatDate(row.selected_date),
    referencePrice: toNumberOrNull(row[`${key}_reference_price`]),
    openPrice: toNumberOrNull(row[`${key}_open_price`]),
    highPrice: null,
    lowPrice: null,
    closePrice: toNumberOrNull(row[`${key}_close_price`]),
    changePrice: toNumberOrNull(row[`${key}_change_price`]),
    changeRate: changeRate.value,
    changeRateBasis: changeRate.basis,
    intradayChangeRate: toNumberOrNull(row[`${key}_change_rate_today`]),
    score: toNumberOrNull(row[`${key}_score`]),
    trend: trendFromRate(changeRate.value),
    dateRole: indicator.dateRole,
    source: 'stock_invest_info',
    sourceTable: 'STOCK_INVEST_INFO',
    sourceId: null,
    sourceName: 'STOCK_INVEST_INFO',
    isSuccess: yn(row[`${key}_open_do_yn`]),
    updatedAt: formatDateTime(row.updated_at),
  };
}

function mapItems(row) {
  return INDICATORS
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((indicator) => (indicator.code === 'KOSPI' ? mapKospi(row, indicator) : mapGlobalIndicator(row, indicator)));
}

function mapScores(row) {
  return {
    growthTotalScore: toNumberOrNull(row.growth_total_score),
    priceTotalScore: toNumberOrNull(row.price_total_score),
    growthTotalScoreGrade: toNumberOrNull(row.growth_total_score_grade),
    priceTotalScoreGrade: toNumberOrNull(row.price_total_score_grade),
    priceSetRangeGroup: toNumberOrNull(row.price_set_range_group),
    parentGrowthTotalScoreGrade: toNumberOrNull(row.parent_growth_total_score_grade),
    parentPriceSetRangeGroup: toNumberOrNull(row.parent_price_set_range_group),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const maxDate = todayInKst();
  const parsed = parseRequestedDate(req.query.date, maxDate);
  if (!parsed.ok) {
    return res.status(400).json({ ok: false, error: parsed.error, maxDate });
  }

  try {
    const selectedDate = parsed.date || (await getLatestStockInvestDate(maxDate)) || maxDate;
    const row = await getStockInvestRow(selectedDate);

    if (!row) {
      return res.status(200).json({
        ok: true,
        sourceTable: 'STOCK_INVEST_INFO',
        hasData: false,
        requestedDate: parsed.date,
        selectedDate,
        previousMarketDate: null,
        maxDate,
        asOfDate: selectedDate,
        updatedAt: null,
        itemCount: 0,
        scores: null,
        items: [],
      });
    }

    const items = mapItems(row);

    return res.status(200).json({
      ok: true,
      sourceTable: 'STOCK_INVEST_INFO',
      hasData: true,
      requestedDate: parsed.date,
      selectedDate: formatDate(row.selected_date),
      previousMarketDate: formatDate(row.previous_market_date),
      maxDate,
      asOfDate: formatDate(row.selected_date),
      updatedAt: formatDateTime(row.updated_at),
      itemCount: items.length,
      scores: mapScores(row),
      status: {
        usHoliday: yn(row.us_holiday_yn),
        krHoliday: yn(row.kr_holiday_yn),
        isSuccess: yn(row.if_success_yn),
      },
      items,
    });
  } catch (error) {
    console.error('[market-summary:error]', error?.message || error);
    return res.status(500).json({ ok: false, error: 'market_summary_failed' });
  }
}
