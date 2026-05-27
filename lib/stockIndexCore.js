'use strict';

const { dbQuery } = require('./db');

const ALLOWED_GRADES = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const ALLOWED_GRADE_SET = new Set(ALLOWED_GRADES);

const INDICATORS = [
  { key: 'kospi', code: 'KOSPI', name: 'KOSPI', prefix: 'KSP', dateRole: 'SELECTED_DATE' },
  { key: 'sp500', code: 'SP500', name: 'S&P 500', prefix: 'SNP', dateRole: 'PREVIOUS_DATE' },
  { key: 'nasdaq', code: 'NASDAQ', name: 'Nasdaq', prefix: 'NDQ', dateRole: 'PREVIOUS_DATE' },
  { key: 'dow', code: 'DOW', name: 'Dow Jones', prefix: 'DWJ', dateRole: 'PREVIOUS_DATE' },
  { key: 'usdkrw', code: 'USDKRW', name: 'USD/KRW', prefix: 'KRW', dateRole: 'PREVIOUS_DATE' },
  { key: 'dxy', code: 'DXY', name: 'Dollar Index', prefix: 'DXY', dateRole: 'PREVIOUS_DATE' },
  { key: 'wti', code: 'WTI', name: 'WTI', prefix: 'WTI', dateRole: 'PREVIOUS_DATE' },
  { key: 'us10y', code: 'US10Y', name: 'US 10Y Yield', prefix: 'TNX', dateRole: 'PREVIOUS_DATE' },
];

const STOCK_SELECT = `
  sii.KSP_STOCK_DATE AS selected_date,
  sii.KSP_BF_STOCK_DATE AS previous_market_date,
  sii.KSP_BEF_CLOSE_PRICE AS ksp_base_price,
  sii.KSP_OPEN_PRICE AS ksp_open_price,
  sii.KSP_HIGH_PRICE AS ksp_high_price,
  sii.KSP_LOW_PRICE AS ksp_low_price,
  sii.KSP_CLOSE_PRICE AS ksp_close_price,
  sii.KSP_UD_RATE_REAL_BY_OPEN AS ksp_open_change_pct,
  sii.KSP_UD_RATE_REAL_BY_CLOSE AS ksp_close_change_pct,
  sii.SNP_STD_PRICE AS snp_base_price,
  sii.SNP_OPEN_PRICE AS snp_open_price,
  sii.SNP_END_PRICE AS snp_close_price,
  sii.SNP_UD_RATE_REAL_BY_OPEN AS snp_open_change_pct,
  sii.SNP_UD_RATE_REAL_BY_CLOSE AS snp_close_change_pct,
  sii.SNP_SCORE AS snp_score,
  sii.NDQ_STD_PRICE AS ndq_base_price,
  sii.NDQ_OPEN_PRICE AS ndq_open_price,
  sii.NDQ_END_PRICE AS ndq_close_price,
  sii.NDQ_UD_RATE_REAL_BY_OPEN AS ndq_open_change_pct,
  sii.NDQ_UD_RATE_REAL_BY_CLOSE AS ndq_close_change_pct,
  sii.NDQ_SCORE AS ndq_score,
  sii.DWJ_STD_PRICE AS dwj_base_price,
  sii.DWJ_OPEN_PRICE AS dwj_open_price,
  sii.DWJ_END_PRICE AS dwj_close_price,
  sii.DWJ_UD_RATE_REAL_BY_OPEN AS dwj_open_change_pct,
  sii.DWJ_UD_RATE_REAL_BY_CLOSE AS dwj_close_change_pct,
  sii.DWJ_SCORE AS dwj_score,
  sii.KRW_STD_PRICE AS krw_base_price,
  sii.KRW_OPEN_PRICE AS krw_open_price,
  sii.KRW_END_PRICE AS krw_close_price,
  sii.KRW_UD_RATE_REAL_BY_OPEN AS krw_open_change_pct,
  sii.KRW_UD_RATE_REAL_BY_CLOSE AS krw_close_change_pct,
  sii.KRW_SCORE AS krw_score,
  sii.DXY_STD_PRICE AS dxy_base_price,
  sii.DXY_OPEN_PRICE AS dxy_open_price,
  sii.DXY_END_PRICE AS dxy_close_price,
  sii.DXY_UD_RATE_REAL_BY_OPEN AS dxy_open_change_pct,
  sii.DXY_UD_RATE_REAL_BY_CLOSE AS dxy_close_change_pct,
  sii.DXY_SCORE AS dxy_score,
  sii.WTI_STD_PRICE AS wti_base_price,
  sii.WTI_OPEN_PRICE AS wti_open_price,
  sii.WTI_END_PRICE AS wti_close_price,
  sii.WTI_UD_RATE_REAL_BY_OPEN AS wti_open_change_pct,
  sii.WTI_UD_RATE_REAL_BY_CLOSE AS wti_close_change_pct,
  sii.WTI_SCORE AS wti_score,
  sii.TNX_STD_PRICE AS tnx_base_price,
  sii.TNX_OPEN_PRICE AS tnx_open_price,
  sii.TNX_END_PRICE AS tnx_close_price,
  sii.TNX_UD_RATE_REAL_BY_OPEN AS tnx_open_change_pct,
  sii.TNX_UD_RATE_REAL_BY_CLOSE AS tnx_close_change_pct,
  sii.TNX_SCORE AS tnx_score,
  sii.GROWTH_TOT_SCORE AS growth_score,
  sii.PRICE_TOT_SCORE AS price_score,
  sii.GROWTH_TOT_SCORE_GRADE AS growth_grade,
  sii.PRICE_TOT_SCORE_GRADE AS price_grade,
  sii.US_HOLYDAY_YN AS us_holiday_yn,
  sii.KR_HOLYDAY_YN AS kr_holiday_yn,
  sii.BF_KSP_OPEN_DO_YN AS bf_ksp_open_do_yn,
  sii.AF_KSP_OPEN_DO_YN AS af_ksp_open_do_yn,
  sii.CLOSE_KSP_OPEN_DO_YN AS close_ksp_open_do_yn,
  sii.IF_SUCC_YN AS if_success_yn,
  sii.updated_at AS updated_at
`;

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
  if (value instanceof Date) return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s.slice(0, 10);
}

function formatDateTime(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())} ${pad2(value.getHours())}:${pad2(value.getMinutes())}:${pad2(value.getSeconds())}`;
  }
  return String(value).replace('T', ' ').slice(0, 19);
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function toNumberOrNull(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toIntOrNull(value) {
  const n = toNumberOrNull(value);
  return n == null ? null : Math.trunc(n);
}

function gradeLabel(value) {
  const n = toIntOrNull(value);
  if (n == null || n === 0 || !ALLOWED_GRADE_SET.has(n)) return null;
  return n > 0 ? `+${n}` : String(n);
}

function isValidGrade(value) {
  const n = toIntOrNull(value);
  return n != null && ALLOWED_GRADE_SET.has(n);
}

function pctChange(value, base) {
  const v = toNumberOrNull(value);
  const b = toNumberOrNull(base);
  if (v == null || b == null || b === 0) return null;
  return ((v - b) / b) * 100;
}

function round(value, digits = 2) {
  const n = toNumberOrNull(value);
  if (n == null) return null;
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

function median(values) {
  const nums = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  if (nums.length % 2) return nums[mid];
  return (nums[mid - 1] + nums[mid]) / 2;
}

function average(values) {
  const nums = values.map(Number).filter(Number.isFinite);
  if (!nums.length) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function yn(value) {
  return String(value || '').toUpperCase() === 'Y';
}

function addYears(date, amount) {
  const d = new Date(`${date}T00:00:00+09:00`);
  d.setFullYear(d.getFullYear() + amount);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseRequestedDate(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === '') return { ok: true, date: null };
  const date = String(raw).slice(0, 10);
  if (!isDateString(date)) return { ok: false, error: 'invalid_date' };
  return { ok: true, date };
}

function parsePeriod(value) {
  const v = String(Array.isArray(value) ? value[0] : value || '3y').toLowerCase();
  return ['1y', '3y', 'all'].includes(v) ? v : '3y';
}

function parseRangeMode(value) {
  const v = String(Array.isArray(value) ? value[0] : value || 'exact').toLowerCase();
  return ['exact', 'near1', 'near2'].includes(v) ? v : 'exact';
}

function parseLimit(value, fallback = 20) {
  const n = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), 1), 100);
}

function gradeRange(grade, rangeMode) {
  const n = toIntOrNull(grade);
  if (!isValidGrade(n)) return [];
  const width = rangeMode === 'near2' ? 2 : (rangeMode === 'near1' ? 1 : 0);
  const sign = n > 0 ? 1 : -1;
  const minAbs = Math.max(1, Math.abs(n) - width);
  const maxAbs = Math.min(9, Math.abs(n) + width);
  const out = [];
  for (let abs = minAbs; abs <= maxAbs; abs++) out.push(abs * sign);
  return out.sort((a, b) => a - b);
}

async function getLatestStockDate(maxDate = todayInKst()) {
  const rows = await dbQuery(
    `SELECT MAX(KSP_STOCK_DATE) AS selected_date FROM STOCK_INVEST_INFO WHERE KSP_STOCK_DATE <= ?`,
    [maxDate]
  );
  return formatDate(rows[0]?.selected_date);
}

async function getLatestUsableStockDate(maxDate = todayInKst()) {
  const rows = await dbQuery(
    `
    SELECT MAX(KSP_STOCK_DATE) AS selected_date
    FROM STOCK_INVEST_INFO
    WHERE KSP_STOCK_DATE <= ?
      AND PRICE_TOT_SCORE_GRADE IS NOT NULL
      AND GROWTH_TOT_SCORE_GRADE IS NOT NULL
      AND PRICE_TOT_SCORE_GRADE IN (-9,-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9)
      AND GROWTH_TOT_SCORE_GRADE IN (-9,-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9)
      AND KSP_BEF_CLOSE_PRICE IS NOT NULL
      AND KSP_OPEN_PRICE IS NOT NULL
      AND KSP_CLOSE_PRICE IS NOT NULL
    `,
    [maxDate]
  );
  return formatDate(rows[0]?.selected_date);
}

async function getStockRow(date) {
  const rows = await dbQuery(
    `
    SELECT ${STOCK_SELECT}
    FROM STOCK_INVEST_INFO AS sii
    WHERE sii.KSP_STOCK_DATE = ?
    LIMIT 1
    `,
    [date]
  );
  return rows[0] || null;
}

async function getRecentRows(date, limit = 5) {
  const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 20);
  const rows = await dbQuery(
    `
    SELECT ${STOCK_SELECT}
    FROM STOCK_INVEST_INFO AS sii
    WHERE sii.KSP_STOCK_DATE <= ?
    ORDER BY sii.KSP_STOCK_DATE DESC
    LIMIT ${safeLimit}
    `,
    [date]
  );
  return rows.reverse();
}

async function getGradeDiagnostics() {
  const rows = await dbQuery(`
    SELECT
      SUM(PRICE_TOT_SCORE_GRADE = 0) AS zero_price_grade_count,
      SUM(GROWTH_TOT_SCORE_GRADE = 0) AS zero_growth_grade_count,
      SUM(PRICE_TOT_SCORE_GRADE IS NOT NULL AND PRICE_TOT_SCORE_GRADE <> 0 AND PRICE_TOT_SCORE_GRADE NOT IN (-9,-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9)) AS invalid_price_grade_count,
      SUM(GROWTH_TOT_SCORE_GRADE IS NOT NULL AND GROWTH_TOT_SCORE_GRADE <> 0 AND GROWTH_TOT_SCORE_GRADE NOT IN (-9,-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9)) AS invalid_growth_grade_count
    FROM STOCK_INVEST_INFO
  `);
  const row = rows[0] || {};
  return {
    zeroPriceGradeCount: Number(row.zero_price_grade_count || 0),
    zeroGrowthGradeCount: Number(row.zero_growth_grade_count || 0),
    invalidPriceGradeCount: Number(row.invalid_price_grade_count || 0),
    invalidGrowthGradeCount: Number(row.invalid_growth_grade_count || 0),
  };
}

function gradeDiagnosticsSummary(diagnostics) {
  const zeroPriceGradeRows = Number(diagnostics?.zeroPriceGradeCount || 0);
  const zeroGrowthGradeRows = Number(diagnostics?.zeroGrowthGradeCount || 0);
  const outOfRangePriceGradeRows = Number(diagnostics?.invalidPriceGradeCount || 0);
  const outOfRangeGrowthGradeRows = Number(diagnostics?.invalidGrowthGradeCount || 0);
  return {
    zeroPriceGradeRows,
    zeroGrowthGradeRows,
    outOfRangePriceGradeRows,
    outOfRangeGrowthGradeRows,
    outOfRangeGradeRows: outOfRangePriceGradeRows + outOfRangeGrowthGradeRows,
  };
}

function warningFromGrades(row) {
  const warnings = [];
  const priceGrade = toIntOrNull(row?.price_grade);
  const growthGrade = toIntOrNull(row?.growth_grade);
  if (priceGrade === 0) warnings.push('선택 기준일 등급값 확인 필요: 가격 등급이 0입니다.');
  else if (priceGrade != null && !ALLOWED_GRADE_SET.has(priceGrade)) warnings.push('price_grade_out_of_range_for_selected_date');
  if (growthGrade === 0) warnings.push('선택 기준일 등급값 확인 필요: 성장 등급이 0입니다.');
  else if (growthGrade != null && !ALLOWED_GRADE_SET.has(growthGrade)) warnings.push('growth_grade_out_of_range_for_selected_date');
  return warnings.length ? warnings.join('; ') : null;
}

function mapKospi(row) {
  const basePrice = toNumberOrNull(row?.ksp_base_price);
  const openPrice = toNumberOrNull(row?.ksp_open_price);
  const highPrice = toNumberOrNull(row?.ksp_high_price);
  const lowPrice = toNumberOrNull(row?.ksp_low_price);
  const closePrice = toNumberOrNull(row?.ksp_close_price);
  return {
    basePrice,
    openPrice,
    highPrice,
    lowPrice,
    closePrice,
    openChangePct: round(pctChange(openPrice, basePrice)),
    closeChangePct: round(pctChange(closePrice, basePrice)),
  };
}

function rowValue(row, prefix, field) {
  return toNumberOrNull(row?.[`${prefix.toLowerCase()}_${field}`]);
}

function mapIndicator(row, indicator, recentRows = []) {
  const prefix = indicator.prefix.toLowerCase();
  const baseDate = indicator.key === 'kospi' ? formatDate(row?.selected_date) : formatDate(row?.previous_market_date);
  const basePrice = rowValue(row, prefix, 'base_price');
  const openPrice = rowValue(row, prefix, 'open_price');
  const closePrice = rowValue(row, prefix, 'close_price');
  const fiveDays = recentRows
    .map((r) => {
      const date = indicator.key === 'kospi' ? formatDate(r.selected_date) : formatDate(r.previous_market_date);
      const open = rowValue(r, prefix, 'open_price');
      const close = rowValue(r, prefix, 'close_price');
      if (!date || (open == null && close == null)) return null;
      return { date, open, close };
    })
    .filter(Boolean)
    .slice(-5);
  return {
    key: indicator.key,
    code: indicator.code,
    name: indicator.name,
    baseDate,
    basePrice,
    openPrice,
    closePrice,
    openChangePct: round(pctChange(openPrice, basePrice)),
    closeChangePct: round(pctChange(closePrice, basePrice)),
    score: indicator.key === 'kospi' ? null : rowValue(row, prefix, 'score'),
    fiveDays,
  };
}

function marketStatus(row, requestedDate) {
  if (!row) return { marketStatus: 'no_data', marketStatusLabel: '데이터 없음' };
  const kospi = mapKospi(row);
  if (yn(row.kr_holiday_yn) && kospi.openPrice == null && kospi.closePrice == null) {
    return { marketStatus: 'holiday', marketStatusLabel: '휴장' };
  }
  if (kospi.openPrice == null && kospi.closePrice == null) {
    return { marketStatus: yn(row.bf_ksp_open_do_yn) ? 'before_open' : 'no_data', marketStatusLabel: yn(row.bf_ksp_open_do_yn) ? '개장 전' : '데이터 없음' };
  }
  if (kospi.closePrice == null || (requestedDate === todayInKst() && !yn(row.if_success_yn))) {
    return { marketStatus: 'open', marketStatusLabel: '장중' };
  }
  return { marketStatus: 'closed', marketStatusLabel: '장마감' };
}

function sampleQuality(sampleCount) {
  if (sampleCount >= 100) return 'strong';
  if (sampleCount >= 20) return 'normal';
  if (sampleCount >= 5) return 'weak';
  return 'too_small';
}

function resultFromClose(close, base) {
  const c = toNumberOrNull(close);
  const b = toNumberOrNull(base);
  if (c == null || b == null) return 'unknown';
  if (c > b) return 'up';
  if (c < b) return 'down';
  return 'flat';
}

function openBucket(openChangePct) {
  const n = toNumberOrNull(openChangePct);
  if (n == null) return null;
  if (n > 0) return 'open_up';
  if (n < 0) return 'open_down';
  return 'open_flat';
}

function advancedOpenBucket(openChangePct) {
  const n = toNumberOrNull(openChangePct);
  if (n == null) return null;
  if (n >= 1) return 'open_up_1p_more';
  if (n > 0 && n < 1) return 'open_up_0_1p';
  if (n < 0 && n > -1) return 'open_down_0_1p';
  if (n <= -1) return 'open_down_1p_more';
  return 'open_flat';
}

function summarizeRows(rows) {
  const total = rows.length;
  const closeUpCount = rows.filter((r) => r.result === 'up').length;
  const closeDownCount = rows.filter((r) => r.result === 'down').length;
  const closeFlatCount = rows.filter((r) => r.result === 'flat').length;
  const closeChanges = rows.map((r) => r.kospiCloseChangePct).filter((v) => v != null);
  return {
    closeUpCount,
    closeDownCount,
    closeFlatCount,
    closeUpRate: total ? round((closeUpCount / total) * 100) : 0,
    closeDownRate: total ? round((closeDownCount / total) * 100) : 0,
    closeFlatRate: total ? round((closeFlatCount / total) * 100) : 0,
    avgCloseChangePct: round(average(closeChanges)),
    medianCloseChangePct: round(median(closeChanges)),
  };
}

function summarizeBucket(rows, bucket, label) {
  const subset = rows.filter((r) => r.bucket === bucket || r.advancedBucket === bucket);
  const stats = summarizeRows(subset);
  return {
    bucket,
    label,
    sampleCount: subset.length,
    closeUpCount: stats.closeUpCount,
    closeDownCount: stats.closeDownCount,
    closeFlatCount: stats.closeFlatCount,
    closeUpRate: stats.closeUpRate,
    closeDownRate: stats.closeDownRate,
    closeFlatRate: stats.closeFlatRate,
    avgCloseChangePct: stats.avgCloseChangePct,
  };
}

function normalizeStatsRow(row) {
  const base = toNumberOrNull(row.ksp_base_price);
  const open = toNumberOrNull(row.ksp_open_price);
  const close = toNumberOrNull(row.ksp_close_price);
  const openChange = pctChange(open, base);
  const closeChange = pctChange(close, base);
  return {
    date: formatDate(row.selected_date),
    priceGrade: toIntOrNull(row.price_grade),
    growthGrade: toIntOrNull(row.growth_grade),
    priceGradeLabel: gradeLabel(row.price_grade),
    growthGradeLabel: gradeLabel(row.growth_grade),
    kospiBasePrice: base,
    kospiOpenPrice: open,
    kospiClosePrice: close,
    kospiOpenChangePct: round(openChange),
    kospiCloseChangePct: round(closeChange),
    result: resultFromClose(close, base),
    bucket: openBucket(openChange),
    advancedBucket: advancedOpenBucket(openChange),
  };
}

module.exports = {
  ALLOWED_GRADES,
  INDICATORS,
  STOCK_SELECT,
  addYears,
  formatDate,
  formatDateTime,
  getGradeDiagnostics,
  gradeDiagnosticsSummary,
  getLatestStockDate,
  getLatestUsableStockDate,
  getRecentRows,
  getStockRow,
  gradeLabel,
  gradeRange,
  isDateString,
  isValidGrade,
  mapIndicator,
  mapKospi,
  marketStatus,
  normalizeStatsRow,
  parseLimit,
  parsePeriod,
  parseRangeMode,
  parseRequestedDate,
  round,
  sampleQuality,
  summarizeBucket,
  summarizeRows,
  todayInKst,
  toIntOrNull,
  toNumberOrNull,
  warningFromGrades,
};
