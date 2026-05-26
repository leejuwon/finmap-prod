// pages/api/re/apt-detail.js
'use strict';

const { pool: dbPool } = require('../../../lib/db');

const M2_PER_PYEONG = 3.305785;

const _colCache = globalThis.__re_col_cache || (globalThis.__re_col_cache = new Map());

async function hasTable(tableName) {
  const key = `table.${tableName}`;
  if (_colCache.has(key)) return _colCache.get(key);

  const [rows] = await dbPool.execute(
    `
    SELECT 1 AS ok
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = ?
    LIMIT 1
    `,
    [tableName]
  );

  const yes = !!(rows && rows.length);
  _colCache.set(key, yes);
  return yes;
}

async function hasColumn(tableName, columnName) {
  const key = `${tableName}.${columnName}`;
  if (_colCache.has(key)) return _colCache.get(key);

  const [rows] = await dbPool.execute(
    `
    SELECT 1 AS ok
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND column_name = ?
    LIMIT 1
    `,
    [tableName, columnName]
  );

  const yes = !!(rows && rows.length);
  _colCache.set(key, yes);
  return yes;
}

function parseAptKey(aptKey) {
  const s = String(aptKey || '');
  const parts = s.split('|');
  const lawd_cd = parts[0] || '';
  const gu_name = parts[1] || '';
  const dong_name = parts[2] || '';
  const apt_name = parts.slice(3).join('|') || '';
  return { lawd_cd, gu_name, dong_name, apt_name };
}

function pyeongBandToM2Range(bandKey) {
  const b = String(bandKey || 'all').toLowerCase();
  if (!b || b === 'all') return null;
  const band = Number(b);
  if (!Number.isFinite(band) || band <= 0) return null;

  const lo = band * M2_PER_PYEONG;
  const hi = (band + 10) * M2_PER_PYEONG;
  return { lo, hi };
}

function isYm(v) {
  return /^\d{6}$/.test(String(v || ''));
}
function isYear(v) {
  return /^\d{4}$/.test(String(v || ''));
}

function yearToYmLo(y) { return `${String(y)}01`; }
function yearToYmHi(y) { return `${String(y)}12`; }

function aptNameNormSql(expr) {
  const lowered = `LOWER(COALESCE(${expr}, ''))`;
  const noParen = `REGEXP_REPLACE(${lowered}, '\\\\([^)]*\\\\)|\\\\[[^]]*\\\\]', '')`;
  const noGenericWords = `REGEXP_REPLACE(${noParen}, 'apt|apartment|주상복합', '')`;
  return `REGEXP_REPLACE(${noGenericWords}, '[^0-9a-z가-힣]', '')`;
}

function complexDimRawValueSql(useMap, col) {
  const fallback = `CASE WHEN c.complex_candidate_count = 1 THEN c.${col} ELSE NULL END`;
  if (!useMap) return fallback;
  return `CASE WHEN cm.kapt_code IS NOT NULL THEN cm.${col} ELSE ${fallback} END`;
}

function complexDimSuspiciousSql(useMap) {
  const hh = complexDimRawValueSql(useMap, 'household_count');
  const dc = complexDimRawValueSql(useMap, 'dong_count');
  return `(${hh} IS NOT NULL AND ${dc} IS NOT NULL AND ${hh} < 100 AND ${dc} < 100)`;
}

function complexDimValueSql(useMap, col) {
  const raw = complexDimRawValueSql(useMap, col);
  if (col === 'household_count' || col === 'dong_count') {
    return `CASE WHEN ${complexDimSuspiciousSql(useMap)} THEN NULL ELSE ${raw} END`;
  }
  return raw;
}

function overrideFieldSql({ useOverride, useMap, useMapAptSeq }, col) {
  if (!useOverride) return 'NULL';
  const overrideCols = {
    household_count: 'household_count_verified',
    dong_count: 'dong_count_verified',
    parking_total: 'parking_total_verified',
    heating_type: 'heating_type_verified',
    manage_type: 'manage_type_verified',
  };
  const parts = [];
  if (col === 'kapt_code') {
    if (useMap) parts.push('ok.kapt_code');
    if (useMapAptSeq) parts.push('oa.kapt_code');
    parts.push('ofk.kapt_code');
    parts.push(`CASE WHEN ofb.override_candidate_count = 1 THEN ofb.kapt_code ELSE NULL END`);
  } else if (overrideCols[col]) {
    if (useMap) parts.push(`ok.${overrideCols[col]}`);
    if (useMapAptSeq) parts.push(`oa.${overrideCols[col]}`);
    parts.push(`ofk.${overrideCols[col]}`);
    parts.push(`CASE WHEN ofb.override_candidate_count = 1 THEN ofb.${overrideCols[col]} ELSE NULL END`);
  }
  return parts.length ? `COALESCE(${parts.join(', ')})` : 'NULL';
}

function overrideAnyValueSql(opts) {
  if (!opts.useOverride) return 'FALSE';
  const fields = ['household_count', 'dong_count', 'parking_total', 'heating_type', 'manage_type']
    .map((col) => `NULLIF(${overrideFieldSql(opts, col)}, '')`);
  return `COALESCE(${fields.join(', ')}) IS NOT NULL`;
}

function overrideJoinMethodSql({ useOverride, useMap, useMapAptSeq }) {
  if (!useOverride) return 'NULL';
  const cases = [];
  if (useMap) cases.push(`WHEN ok.id IS NOT NULL THEN 'override:kapt_code'`);
  if (useMapAptSeq) cases.push(`WHEN oa.id IS NOT NULL THEN 'override:apt_seq'`);
  cases.push(`WHEN ofk.id IS NOT NULL THEN 'override:fallback_kapt_code'`);
  cases.push(`WHEN ofb.override_candidate_count = 1 THEN 'override:fallback_region_dong_name'`);
  return `CASE ${cases.join(' ')} ELSE NULL END`;
}

function complexValueSql(opts, col) {
  const overrideValue = overrideFieldSql(opts, col);
  const dimValue = complexDimValueSql(opts.useMap, col);
  if (['kapt_code', 'household_count', 'dong_count', 'parking_total', 'heating_type', 'manage_type'].includes(col)) {
    return `COALESCE(${overrideValue}, ${dimValue})`;
  }
  return dimValue;
}

function complexJoinMethodSql(opts) {
  const { useMap, useOverride } = opts;
  const dimSuspicious = complexDimSuspiciousSql(useMap);
  const overrideAny = overrideAnyValueSql(opts);
  const overrideMethod = overrideJoinMethodSql(opts);
  if (!useMap) {
    return `
        CASE
          WHEN ${useOverride ? overrideAny : 'FALSE'} THEN ${overrideMethod}
          WHEN ${dimSuspicious} THEN 'suspicious:counts_lt_100'
          WHEN c.complex_candidate_count = 1 THEN 'fallback:region_lawd_gu_name'
          WHEN c.complex_candidate_count > 1 THEN 'fallback:ambiguous'
          ELSE 'none'
        END AS complex_info_join_method,
        CASE
          WHEN ${useOverride ? overrideAny : 'FALSE'} THEN 'verified'
          WHEN ${dimSuspicious} THEN 'low'
          WHEN c.complex_candidate_count = 1 THEN 'medium'
          WHEN c.complex_candidate_count > 1 THEN 'low'
          ELSE 'none'
        END AS complex_info_confidence,
        CASE
          WHEN ${useOverride ? overrideAny : 'FALSE'} THEN 'override'
          WHEN c.complex_candidate_count = 1 THEN 'fallback'
          ELSE 'none'
        END AS complex_info_source,
        CASE
          WHEN ${useOverride ? overrideAny : 'FALSE'} AND ${dimSuspicious} THEN 'override_applied; dim_counts_suspicious'
          WHEN ${dimSuspicious} THEN 'dim_counts_suspicious'
          WHEN c.complex_candidate_count > 1 THEN 'fallback_ambiguous'
          ELSE NULL
        END AS complex_info_warning,
        ${dimSuspicious} AS complex_info_suspicious_flag,
        COALESCE(c.complex_candidate_count, 0) AS complex_candidate_count
    `;
  }
  return `
        CASE
          WHEN ${useOverride ? overrideAny : 'FALSE'} THEN ${overrideMethod}
          WHEN ${dimSuspicious} THEN 'suspicious:counts_lt_100'
          WHEN cm.kapt_code IS NOT NULL THEN 'map:kapt_code'
          WHEN c.complex_candidate_count = 1 THEN 'fallback:region_lawd_gu_name'
          WHEN c.complex_candidate_count > 1 THEN 'fallback:ambiguous'
          ELSE 'none'
        END AS complex_info_join_method,
        CASE
          WHEN ${useOverride ? overrideAny : 'FALSE'} THEN 'verified'
          WHEN ${dimSuspicious} THEN 'low'
          WHEN cm.kapt_code IS NOT NULL THEN 'high'
          WHEN c.complex_candidate_count = 1 THEN 'medium'
          WHEN c.complex_candidate_count > 1 THEN 'low'
          ELSE 'none'
        END AS complex_info_confidence,
        CASE
          WHEN ${useOverride ? overrideAny : 'FALSE'} THEN 'override'
          WHEN cm.kapt_code IS NOT NULL THEN 'map'
          WHEN c.complex_candidate_count = 1 THEN 'fallback'
          ELSE 'none'
        END AS complex_info_source,
        CASE
          WHEN ${useOverride ? overrideAny : 'FALSE'} AND ${dimSuspicious} THEN 'override_applied; dim_counts_suspicious'
          WHEN ${dimSuspicious} THEN 'dim_counts_suspicious'
          WHEN c.complex_candidate_count > 1 THEN 'fallback_ambiguous'
          ELSE NULL
        END AS complex_info_warning,
        ${dimSuspicious} AS complex_info_suspicious_flag,
        COALESCE(c.complex_candidate_count, 0) AS complex_candidate_count
  `;
}

function complexSelectSql(opts) {
  const val = (col) => complexValueSql(opts, col);
  return `
        ${val('kapt_code')} AS kapt_code,
        ${val('household_count')} AS household_count,
        ${val('dong_count')} AS dong_count,
        ${val('parking_total')} AS parking_total,
        ${val('parking_ground')} AS parking_ground,
        ${val('parking_underground')} AS parking_underground,
        ${val('heating_type')} AS heating_type,
        ${val('manage_type')} AS manage_type,
        ${val('approval_date')} AS approval_date,
        ${val('build_year')} AS complex_build_year,
        ${val('road_addr')} AS road_addr,
        ${val('jibun')} AS jibun,
${complexJoinMethodSql(opts)}
  `;
}

function complexAggSubquerySql() {
  return `
        SELECT
          d.sido_code,
          d.lawd_cd,
          COALESCE(d.gu_name, '') AS gu_name,
          d.kapt_name_norm,
          COUNT(*) AS complex_candidate_count,
          MIN(d.kapt_code) AS kapt_code,
          MAX(d.household_count) AS household_count,
          MAX(d.dong_count) AS dong_count,
          MAX(d.parking_total) AS parking_total,
          MAX(d.parking_ground) AS parking_ground,
          MAX(d.parking_underground) AS parking_underground,
          MAX(d.heating_type) AS heating_type,
          MAX(d.manage_type) AS manage_type,
          MAX(d.approval_date) AS approval_date,
          MAX(d.build_year) AS build_year,
          MAX(d.road_addr) AS road_addr,
          MAX(d.jibun) AS jibun
        FROM re_apt_complex_dim d
        GROUP BY d.sido_code, d.lawd_cd, COALESCE(d.gu_name, ''), d.kapt_name_norm
  `;
}

function overrideFallbackAggSubquerySql() {
  return `
        SELECT
          o.lawd_cd,
          COALESCE(o.dong_name, '') AS dong_name,
          o.apt_name_norm,
          COUNT(*) AS override_candidate_count,
          MIN(o.id) AS id,
          MAX(o.kapt_code) AS kapt_code,
          MAX(o.apt_seq) AS apt_seq,
          MAX(o.household_count_verified) AS household_count_verified,
          MAX(o.dong_count_verified) AS dong_count_verified,
          MAX(o.parking_total_verified) AS parking_total_verified,
          MAX(o.heating_type_verified) AS heating_type_verified,
          MAX(o.manage_type_verified) AS manage_type_verified
        FROM re_apt_complex_override o
        WHERE o.kapt_code IS NULL
        GROUP BY o.lawd_cd, COALESCE(o.dong_name, ''), o.apt_name_norm
  `;
}

function complexJoinSql({ useMap, useOverride = false, useMapAptSeq = false }) {
  const mapJoin = useMap ? `
      LEFT JOIN re_trade_apt_map m
        ON m.apt_key = s.apt_key
      LEFT JOIN re_apt_complex_dim cm
        ON cm.kapt_code = m.kapt_code
  ` : '';
  const overrideJoin = useOverride ? `
      ${useMap ? `
      LEFT JOIN re_apt_complex_override ok
        ON ok.kapt_code IS NOT NULL
       AND CONVERT(ok.kapt_code USING utf8mb4) COLLATE utf8mb4_unicode_ci = CONVERT(m.kapt_code USING utf8mb4) COLLATE utf8mb4_unicode_ci
      ` : ''}
      ${useMapAptSeq ? `
      LEFT JOIN re_apt_complex_override oa
        ON oa.apt_seq IS NOT NULL
       AND CONVERT(oa.apt_seq USING utf8mb4) COLLATE utf8mb4_unicode_ci = CONVERT(m.apt_seq USING utf8mb4) COLLATE utf8mb4_unicode_ci
      ` : ''}
      LEFT JOIN re_apt_complex_override ofk
        ON ofk.kapt_code IS NOT NULL
       AND c.complex_candidate_count = 1
       AND CONVERT(ofk.kapt_code USING utf8mb4) COLLATE utf8mb4_unicode_ci = CONVERT(c.kapt_code USING utf8mb4) COLLATE utf8mb4_unicode_ci
      LEFT JOIN (
${overrideFallbackAggSubquerySql()}
      ) ofb
        ON CONVERT(ofb.lawd_cd USING utf8mb4) COLLATE utf8mb4_unicode_ci = CONVERT(s.lawd_cd USING utf8mb4) COLLATE utf8mb4_unicode_ci
       AND CONVERT(COALESCE(ofb.dong_name, '') USING utf8mb4) COLLATE utf8mb4_unicode_ci = CONVERT(COALESCE(s.dong_name, '') USING utf8mb4) COLLATE utf8mb4_unicode_ci
       AND CONVERT(ofb.apt_name_norm USING utf8mb4) COLLATE utf8mb4_unicode_ci = CONVERT(${aptNameNormSql('s.apt_name')} USING utf8mb4) COLLATE utf8mb4_unicode_ci
  ` : '';

  return `
      ${mapJoin}
      LEFT JOIN (
${complexAggSubquerySql()}
      ) c
        ON c.sido_code = s.sido_code
       AND LEFT(COALESCE(c.lawd_cd, ''), 5) = s.lawd_cd
       AND COALESCE(c.gu_name, '') = COALESCE(s.gu_name, '')
       AND c.kapt_name_norm = ${aptNameNormSql('s.apt_name')}
      ${overrideJoin}
  `;
}

export default async function handler(req, res) {
  try {
    const q = req.query || {};

    const apt_key = q.apt_key || q.aptKey || q.aptKeyEncoded;
    if (!apt_key) {
      return res.status(400).json({ ok: false, error: 'apt_key is required' });
    }

    const timeframe = String(q.timeframe || 'month').toLowerCase() === 'year' ? 'year' : 'month';
    const period = String(q.period || '').trim();
    const band = String(q.band || q.pyeong_band || 'all').toLowerCase();

    // ✅ snapshot(period) 검증은 유지 (카드용)
    if (timeframe === 'month' && !isYm(period)) {
      return res.status(400).json({ ok: false, error: 'period must be YYYYMM for month timeframe' });
    }
    if (timeframe === 'year' && !isYear(period)) {
      return res.status(400).json({ ok: false, error: 'period must be YYYY for year timeframe' });
    }

    // ✅ from/to(선택) - 최근거래/범위용
    const from = String(q.from || '').trim();
    const to = String(q.to || '').trim();

    if (timeframe === 'month') {
      if (from && !isYm(from)) return res.status(400).json({ ok: false, error: 'from must be YYYYMM' });
      if (to && !isYm(to)) return res.status(400).json({ ok: false, error: 'to must be YYYYMM' });
    } else {
      if (from && !isYear(from)) return res.status(400).json({ ok: false, error: 'from must be YYYY' });
      if (to && !isYear(to)) return res.status(400).json({ ok: false, error: 'to must be YYYY' });
    }

    const statsTable = timeframe === 'month' ? 're_trade_apt_stats_m' : 're_trade_apt_stats_y';
    const periodCol = timeframe === 'month' ? 'deal_ym' : 'deal_y';

    const hasSum = await hasColumn(statsTable, 'sum_price');
    const hasMax = await hasColumn(statsTable, 'max_price');
    const useMap = await hasTable('re_trade_apt_map');
    const useOverride = await hasTable('re_apt_complex_override');
    const useMapAptSeq = useMap && await hasColumn('re_trade_apt_map', 'apt_seq');
    const complexOpts = { useMap, useOverride, useMapAptSeq };

    const statsSql = `
      SELECT
        s.${periodCol} AS period,
        s.pyeong_band,
        s.sido_code, s.sido_name, s.lawd_cd, s.sigungu_name, s.gu_name, s.dong_name, s.apt_name,
        s.apt_key,
        s.tx_count,
        s.avg_price_per_m2, s.median_price_per_m2, s.std_price_per_m2,
        s.avg_price, s.median_price,
        ${hasMax ? 's.max_price' : 'NULL AS max_price'},
        ${hasSum ? 's.sum_price' : 'NULL AS sum_price'},
        s.latest_deal_date, s.latest_apt_dong, s.latest_floor, s.latest_area_m2, s.latest_deal_amount_man,
        s.build_year, s.rgst_date,
${complexSelectSql(complexOpts)}
      FROM ${statsTable} s
${complexJoinSql(complexOpts)}
      WHERE s.${periodCol} = ?
        AND s.pyeong_band = ?
        AND s.apt_key = ?
      LIMIT 1
    `;

    const [statsRows] = await dbPool.execute(statsSql, [period, band, apt_key]);
    const stats = statsRows?.[0] || null;

    // ------- 최신 거래 리스트 (from/to 우선) -------
    const { lawd_cd, gu_name, dong_name, apt_name } = parseAptKey(apt_key);

    // deal_ym 범위로 변환(연간이면 YYYY -> YYYY01~YYYY12)
    let ymFrom = '';
    let ymTo = '';

    if (from || to) {
      if (timeframe === 'month') {
        ymFrom = from || '';
        ymTo = to || '';
      } else {
        ymFrom = from ? yearToYmLo(from) : '';
        ymTo = to ? yearToYmHi(to) : '';
      }
    } else {
      // fallback: 기존 동작
      if (timeframe === 'month') {
        ymFrom = period;
        ymTo = period;
      } else {
        ymFrom = yearToYmLo(period);
        ymTo = yearToYmHi(period);
      }
    }

    // 기간 조건(ymFrom/ymTo 존재 형태별로)
    let periodWhere = '1=1';
    const periodParams = [];
    if (ymFrom && ymTo) {
      periodWhere = 't.deal_ym BETWEEN ? AND ?';
      periodParams.push(ymFrom, ymTo);
    } else if (ymFrom) {
      periodWhere = 't.deal_ym >= ?';
      periodParams.push(ymFrom);
    } else if (ymTo) {
      periodWhere = 't.deal_ym <= ?';
      periodParams.push(ymTo);
    }

    // 밴드 조건
    const r = pyeongBandToM2Range(band);
    const bandWhere = r ? ' AND t.area_m2 >= ? AND t.area_m2 < ?' : '';
    const bandParams = r ? [r.lo, r.hi] : [];

    const tradesSql = `
      SELECT
        t.deal_date,
        t.deal_ym,
        t.deal_amount_man,
        (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) AS price_won,
        t.area_m2,
        t.floor,
        t.apt_dong,
        t.build_year,
        t.rgst_date
      FROM re_trade_apt t
      WHERE t.lawd_cd = ?
        AND COALESCE(NULLIF(TRIM(t.gu_name),''), '') = ?
        AND t.dong_name = ?
        AND t.apt_name = ?
        AND (${periodWhere})
        AND (t.cancel_yn IS NULL OR t.cancel_yn <> 'Y')
        AND t.area_m2 > 0
        AND t.deal_amount_man IS NOT NULL AND t.deal_amount_man > 0
        ${bandWhere}
      ORDER BY t.deal_date DESC, t.deal_amount_man DESC
      LIMIT 30
    `;

    const [tradeRows] = await dbPool.execute(tradesSql, [
      lawd_cd,
      gu_name,
      dong_name,
      apt_name,
      ...periodParams,
      ...bandParams,
    ]);

    return res.status(200).json({
      ok: true,
      meta: { apt_key, timeframe, period, band, from: from || '', to: to || '', trades_ym_from: ymFrom, trades_ym_to: ymTo },
      stats,
      latest_trades: tradeRows || [],
    });
  } catch (e) {
    console.error('[apt-detail] error:', e);
    return res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}
