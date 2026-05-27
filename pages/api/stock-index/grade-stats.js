'use strict';

const { dbQuery } = require('../../../lib/db');
const {
  STOCK_SELECT,
  addYears,
  formatDate,
  getLatestUsableStockDate,
  getStockRow,
  gradeLabel,
  gradeRange,
  isValidGrade,
  normalizeStatsRow,
  parseLimit,
  parsePeriod,
  parseRangeMode,
  parseRequestedDate,
  sampleQuality,
  summarizeBucket,
  summarizeRows,
  todayInKst,
  toIntOrNull,
  warningFromGrades,
} = require('../../../lib/stockIndexCore');

const _cache = globalThis.__stock_index_grade_stats_cache || (globalThis.__stock_index_grade_stats_cache = new Map());

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
  if (_cache.size > 200) _cache.clear();
  _cache.set(key, { exp: Date.now() + ttlMs, data });
}

function parseGradeParam(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === '') return { provided: false, grade: null };
  const n = Number(raw);
  if (!Number.isInteger(n) || !isValidGrade(n)) return { provided: true, grade: null, error: 'invalid_grade' };
  return { provided: true, grade: n };
}

function periodStartDate(selectedDate, period) {
  if (period === '1y') return addYears(selectedDate, -1);
  if (period === '3y') return addYears(selectedDate, -3);
  return null;
}

function buildSampleFilter({ selectedDate, period, priceGrades, growthGrades }) {
  const startDate = periodStartDate(selectedDate, period);
  const filters = [
    `sii.KSP_STOCK_DATE < ?`,
    `sii.PRICE_TOT_SCORE_GRADE IN (${priceGrades.map(() => '?').join(',')})`,
    `sii.GROWTH_TOT_SCORE_GRADE IN (${growthGrades.map(() => '?').join(',')})`,
    `sii.KSP_BEF_CLOSE_PRICE IS NOT NULL`,
    `sii.KSP_OPEN_PRICE IS NOT NULL`,
    `sii.KSP_CLOSE_PRICE IS NOT NULL`,
    `sii.KSP_BEF_CLOSE_PRICE > 0`,
  ];
  const params = [selectedDate, ...priceGrades, ...growthGrades];
  if (startDate) {
    filters.push(`sii.KSP_STOCK_DATE >= ?`);
    params.push(startDate);
  }
  return { filters, params };
}

async function countSamples({ selectedDate, period, priceGrade, growthGrade, rangeMode }) {
  const priceGrades = gradeRange(priceGrade, rangeMode);
  const growthGrades = gradeRange(growthGrade, rangeMode);
  if (!priceGrades.length || !growthGrades.length) return 0;
  const { filters, params } = buildSampleFilter({ selectedDate, period, priceGrades, growthGrades });
  const rows = await dbQuery(
    `
    SELECT COUNT(*) AS sample_count
    FROM STOCK_INVEST_INFO AS sii
    WHERE ${filters.join('\n      AND ')}
    `,
    params
  );
  return Number(rows[0]?.sample_count || 0);
}

function emptyStats({ date, priceGrade, growthGrade, period, rangeMode, priceGrades, growthGrades, warning }) {
  return {
    ok: true,
    date,
    priceGrade,
    growthGrade,
    priceGradeLabel: gradeLabel(priceGrade),
    growthGradeLabel: gradeLabel(growthGrade),
    period,
    rangeMode,
    gradeRanges: { priceGrades, growthGrades },
    sampleCount: 0,
    rangeSamples: { exact: 0, near1: 0, near2: 0 },
    sampleQuality: 'too_small',
    warning,
    closeStats: {
      closeUpCount: 0,
      closeDownCount: 0,
      closeFlatCount: 0,
      closeUpRate: 0,
      closeDownRate: 0,
      closeFlatRate: 0,
      avgCloseChangePct: null,
      medianCloseChangePct: null,
    },
    openGapStats: [
      summarizeBucket([], 'open_up', '상승 출발'),
      summarizeBucket([], 'open_down', '하락 출발'),
      summarizeBucket([], 'open_flat', '보합 출발'),
    ],
    advancedOpenGapStats: [
      summarizeBucket([], 'open_up_1p_more', '+1% 이상 상승 출발'),
      summarizeBucket([], 'open_up_0_1p', '0~+1% 상승 출발'),
      summarizeBucket([], 'open_down_0_1p', '0~-1% 하락 출발'),
      summarizeBucket([], 'open_down_1p_more', '-1% 이하 하락 출발'),
      summarizeBucket([], 'open_flat', '보합 출발'),
    ],
    similarDates: [],
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const maxDate = todayInKst();
  const parsedDate = parseRequestedDate(req.query.date);
  if (!parsedDate.ok) return res.status(400).json({ ok: false, error: parsedDate.error, maxDate });
  if (parsedDate.date && parsedDate.date > maxDate) return res.status(400).json({ ok: false, error: 'future_date_not_allowed', maxDate });

  const period = parsePeriod(req.query.period);
  const rangeMode = parseRangeMode(req.query.rangeMode);
  const limit = parseLimit(req.query.limit, 20);
  const priceParam = parseGradeParam(req.query.priceGrade);
  const growthParam = parseGradeParam(req.query.growthGrade);
  if (priceParam.error || growthParam.error) {
    return res.status(400).json({ ok: false, error: priceParam.error || growthParam.error });
  }

  try {
    const latestUsableDate = await getLatestUsableStockDate(maxDate);
    const selectedDate = parsedDate.date || latestUsableDate || maxDate;
    const cacheKey = `grade-stats:${selectedDate}:${priceParam.grade ?? ''}:${growthParam.grade ?? ''}:${period}:${rangeMode}:${limit}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);

    const selectedRow = await getStockRow(selectedDate);
    const baseWarning = warningFromGrades(selectedRow);
    const priceGrade = priceParam.provided ? priceParam.grade : toIntOrNull(selectedRow?.price_grade);
    const growthGrade = growthParam.provided ? growthParam.grade : toIntOrNull(selectedRow?.growth_grade);

    if (!isValidGrade(priceGrade) || !isValidGrade(growthGrade)) {
      const warning = [baseWarning, 'selected_grade_missing_or_invalid'].filter(Boolean).join('; ');
      const out = emptyStats({
        date: selectedDate,
        priceGrade,
        growthGrade,
        period,
        rangeMode,
        priceGrades: [],
        growthGrades: [],
        warning,
      });
      cacheSet(cacheKey, out);
      return res.status(200).json(out);
    }

    const priceGrades = gradeRange(priceGrade, rangeMode);
    const growthGrades = gradeRange(growthGrade, rangeMode);
    const rangeSamples = {
      exact: await countSamples({ selectedDate, period, priceGrade, growthGrade, rangeMode: 'exact' }),
      near1: await countSamples({ selectedDate, period, priceGrade, growthGrade, rangeMode: 'near1' }),
      near2: await countSamples({ selectedDate, period, priceGrade, growthGrade, rangeMode: 'near2' }),
    };
    const { filters, params } = buildSampleFilter({ selectedDate, period, priceGrades, growthGrades });

    const rows = await dbQuery(
      `
      SELECT ${STOCK_SELECT}
      FROM STOCK_INVEST_INFO AS sii
      WHERE ${filters.join('\n        AND ')}
      ORDER BY sii.KSP_STOCK_DATE DESC
      `,
      params
    );

    const samples = rows.map(normalizeStatsRow).filter((row) => row.result !== 'unknown');
    const closeStats = summarizeRows(samples);
    const sampleCount = samples.length;
    const warningParts = [];
    if (baseWarning) warningParts.push(baseWarning);
    if (sampleCount < 5) warningParts.push('sample_too_small');
    else if (sampleCount < 20) warningParts.push('sample_weak');
    const warning = warningParts.length ? warningParts.join('; ') : null;

    const out = {
      ok: true,
      date: formatDate(selectedDate),
      priceGrade,
      growthGrade,
      priceGradeLabel: gradeLabel(priceGrade),
      growthGradeLabel: gradeLabel(growthGrade),
      period,
      rangeMode,
      gradeRanges: { priceGrades, growthGrades },
      sampleCount,
      rangeSamples,
      sampleQuality: sampleQuality(sampleCount),
      warning,
      closeStats,
      openGapStats: [
        summarizeBucket(samples, 'open_up', '상승 출발'),
        summarizeBucket(samples, 'open_down', '하락 출발'),
        summarizeBucket(samples, 'open_flat', '보합 출발'),
      ],
      advancedOpenGapStats: [
        summarizeBucket(samples, 'open_up_1p_more', '+1% 이상 상승 출발'),
        summarizeBucket(samples, 'open_up_0_1p', '0~+1% 상승 출발'),
        summarizeBucket(samples, 'open_down_0_1p', '0~-1% 하락 출발'),
        summarizeBucket(samples, 'open_down_1p_more', '-1% 이하 하락 출발'),
        summarizeBucket(samples, 'open_flat', '보합 출발'),
      ],
      similarDates: samples.slice(0, limit),
    };

    cacheSet(cacheKey, out);
    return res.status(200).json(out);
  } catch (error) {
    console.error('[stock-index/grade-stats] error:', error?.message || error);
    return res.status(500).json({ ok: false, error: 'stock_index_grade_stats_failed' });
  }
}
