'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function loadEnv() {
  try {
    const dotenv = require('dotenv');
    for (const file of ['.env.local', '.env.production']) {
      const p = path.resolve(process.cwd(), file);
      if (fs.existsSync(p)) dotenv.config({ path: p, override: false, quiet: true });
    }
  } catch (_) {}
}

loadEnv();

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, 'reports', 'real-estate-complex-data-audit.md');

const TARGETS = [
  {
    id: 'pungmu-prugio',
    label: '경기도 김포시 풍무동 김포풍무푸르지오',
    like: '%풍무%푸르지오%',
    expectedHousehold: 2712,
    preferredKaptCode: 'A10027488',
    preferredName: '김포풍무푸르지오',
  },
  {
    id: 'acro-river-park',
    label: '서울 서초구 반포동 아크로리버파크',
    like: '%아크로리버파크%',
    expectedHousehold: 1612,
    preferredKaptCode: 'A10027205',
    preferredName: '아크로리버파크',
  },
];

const TARGET_COLUMNS = {
  trade: [
    'lawd_cd', 'req_lawd_cd', 'sido_name', 'sigungu_name', 'gu_name',
    'dong_name', 'jibun', 'apt_name', 'apt_seq', 'build_year',
  ],
  statsM: [
    'deal_ym', 'pyeong_band', 'apt_key', 'sido_code', 'sido_name', 'lawd_cd',
    'sigungu_name', 'gu_name', 'dong_name', 'apt_name', 'build_year', 'tx_count',
    'latest_deal_date',
  ],
  statsY: [
    'deal_y', 'pyeong_band', 'apt_key', 'sido_code', 'sido_name', 'lawd_cd',
    'sigungu_name', 'gu_name', 'dong_name', 'apt_name', 'build_year', 'tx_count',
    'latest_deal_date',
  ],
  dim: [
    'kapt_code', 'kapt_name', 'kapt_name_norm', 'sido_code', 'lawd_cd', 'bjd_code',
    'sigungu_name', 'gu_name', 'dong_name', 'jibun', 'kapt_addr', 'road_addr',
    'approval_date', 'build_year', 'household_count', 'dong_count', 'parking_total',
    'parking_ground', 'parking_underground', 'heating_type', 'manage_type',
    'basis_error_reason', 'source_updated_at', 'updated_at', 'basis_raw_json',
  ],
  map: [
    'apt_key', 'kapt_code', 'apt_seq', 'match_method', 'match_score',
    'lawd_cd', 'gu_name', 'dong_name', 'apt_name', 'apt_name_norm',
  ],
  override: [
    'id', 'kapt_code', 'apt_seq', 'lawd_cd', 'dong_name', 'apt_name', 'apt_name_norm',
    'household_count_verified', 'dong_count_verified', 'parking_total_verified',
    'heating_type_verified', 'manage_type_verified', 'source_name', 'source_url',
    'note', 'verified_at', 'updated_at',
  ],
};

const DIM_INDEX_COLUMNS = [
  'kapt_code', 'kapt_name', 'kapt_name_norm', 'sido_code', 'lawd_cd', 'gu_name',
  'dong_name', 'household_count', 'dong_count', 'parking_total', 'heating_type', 'manage_type',
];

const FIELD_CANDIDATES = {
  household_count: [
    'kaptTotHsehCnt', 'totHsehCnt', 'hsehCnt', 'hshldCnt', 'householdCnt',
    'hshldCo', 'household_count', 'hoCnt', 'kaptdScnt', 'kaptScnt',
  ],
  household_count_before: ['kaptdScnt', 'kaptScnt'],
  dong_count: [
    'kaptdDcnt', 'kaptDcnt', 'kaptDongCnt', 'dongCnt', 'dongCo',
    'totDongCnt', 'buildingCnt', 'dong_count',
  ],
  parking_total: [
    'kaptPcnt', 'parkingTotCnt', 'parkingTotal', 'parkingCnt',
    'parking_total', 'parkTotCnt', 'kaptdPcnt',
  ],
  parking_underground: [
    'kaptdPcntu', 'kaptPcntu', 'parkingUndgrndCnt', 'parkingUnder',
    'parking_underground', 'parkUndgrndCnt',
  ],
};

function md(value) {
  if (value == null || value === '') return '-';
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

function pct(part, total) {
  if (!total) return '0.0%';
  return `${((Number(part || 0) / Number(total)) * 100).toFixed(1)}%`;
}

function asInt(value) {
  if (value == null || value === '') return null;
  const n = Number(String(value).replace(/[^\d-]/g, ''));
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function normalizeAptNameKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
    .replace(/apt|apartment|주상복합/gi, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function makeAptKey(row) {
  return [row?.lawd_cd || '', row?.gu_name || '', row?.dong_name || '', row?.apt_name || ''].join('|');
}

function safeJsonParse(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(String(value)); } catch (_) { return null; }
}

function pickTextWithKey(obj, keys) {
  if (!obj || typeof obj !== 'object') return { key: '', value: '' };
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] != null && String(obj[key]).trim() !== '') {
      return { key, value: String(obj[key]).trim() };
    }
  }
  return { key: '', value: '' };
}

function sumNullable(...values) {
  let hasValue = false;
  let total = 0;
  for (const value of values) {
    if (value == null) continue;
    hasValue = true;
    total += Number(value);
  }
  return hasValue ? total : null;
}

function flattenFields(obj, prefix = '', out = []) {
  if (obj == null) return out;
  if (typeof obj !== 'object') {
    out.push({ path: prefix, value: obj });
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flattenFields(v, `${prefix}[${i}]`, out));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) flattenFields(v, prefix ? `${prefix}.${k}` : k, out);
  return out;
}

function inspectRawJson(row) {
  const raw = safeJsonParse(row?.basis_raw_json);
  const basisItem = raw?.basisItem && typeof raw.basisItem === 'object' ? raw.basisItem : {};
  const listItem = raw?.listItem && typeof raw.listItem === 'object' ? raw.listItem : {};
  const fields = {};

  for (const [name, keys] of Object.entries(FIELD_CANDIDATES)) {
    const basis = pickTextWithKey(basisItem, keys);
    const list = pickTextWithKey(listItem, keys);
    fields[name] = {
      value: basis.value || list.value || '',
      source: basis.value ? 'basisItem' : (list.value ? 'listItem' : ''),
      key: basis.value ? basis.key : list.key,
    };
  }

  const householdSourceKey = raw?.household_count_source_key || fields.household_count.key || '';
  const householdSourceValue = raw?.household_count_source_value || fields.household_count.value || '';
  const householdBefore = raw?.household_count_before ?? fields.household_count_before.value ?? row?.household_count;
  const householdAfter = raw?.household_count_after ?? asInt(householdSourceValue) ?? row?.household_count;

  const parkingBefore = raw?.parking_total_before ?? asInt(fields.parking_total.value) ?? row?.parking_total;
  const parkingUnderground = asInt(fields.parking_underground.value) ?? row?.parking_underground ?? null;
  const parkingPartsTotal = sumNullable(row?.parking_ground ?? null, parkingUnderground);
  let parkingAfter = raw?.parking_total_after ?? parkingBefore;
  let parkingAdjusted = !!raw?.parking_total_adjusted;
  if (
    parkingPartsTotal != null &&
    parkingPartsTotal > 0 &&
    (parkingAfter == null || Number(parkingAfter) <= 0 || (parkingUnderground != null && Number(parkingAfter) < Number(parkingUnderground)))
  ) {
    parkingAfter = parkingPartsTotal;
    parkingAdjusted = true;
  }

  const flat = flattenFields(raw);
  const values = [row?.household_count, row?.dong_count, row?.parking_total, householdAfter, parkingAfter]
    .filter((v) => v != null)
    .map((v) => String(v));
  const valuePaths = {};
  for (const value of values) {
    valuePaths[value] = flat.filter((item) => String(item.value) === value).slice(0, 12).map((item) => item.path);
  }

  return {
    fields,
    valuePaths,
    basisItemFields: Object.entries(basisItem).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => ({ key, value })),
    household: {
      sourceKey: householdSourceKey,
      sourceValue: householdSourceValue,
      before: asInt(householdBefore),
      after: asInt(householdAfter),
    },
    parking: {
      before: asInt(parkingBefore),
      after: asInt(parkingAfter),
      adjusted: parkingAdjusted,
    },
    qualityFlags: Array.isArray(raw?.qualityFlags) ? raw.qualityFlags : [],
  };
}

async function tableExists(conn, tableName) {
  const [rows] = await conn.query(
    `SELECT 1 ok FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1`,
    [tableName]
  );
  return rows.length > 0;
}

async function columnsFor(conn, tableName) {
  if (!(await tableExists(conn, tableName))) return new Set();
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  );
  return new Set(rows.map((r) => String(r.COLUMN_NAME || r.column_name || '').toLowerCase()));
}

function selectList(alias, tableCols, desired) {
  return desired.map((col) => tableCols.has(col.toLowerCase()) ? `${alias}.${col}` : `NULL AS ${col}`).join(', ');
}

function groupList(alias, tableCols, desired) {
  return desired.filter((col) => tableCols.has(col.toLowerCase())).map((col) => `${alias}.${col}`).join(', ');
}

async function queryTradeCandidates(conn, cols, like) {
  if (!(await tableExists(conn, 're_trade_apt'))) return [];
  const select = selectList('t', cols, TARGET_COLUMNS.trade);
  const group = groupList('t', cols, TARGET_COLUMNS.trade);
  const [rows] = await conn.query(
    `
    SELECT ${select},
      COUNT(*) AS tx_count,
      MIN(t.deal_ym) AS min_deal_ym,
      MAX(t.deal_ym) AS max_deal_ym
    FROM re_trade_apt t
    WHERE t.apt_name LIKE ?
    GROUP BY ${group}
    ORDER BY tx_count DESC, max_deal_ym DESC
    LIMIT 50
    `,
    [like]
  );
  return rows;
}

async function queryStatsLatest(conn, table, cols, like) {
  if (!(await tableExists(conn, table))) return [];
  const periodCol = table.endsWith('_y') ? 'deal_y' : 'deal_ym';
  const desired = table.endsWith('_y') ? TARGET_COLUMNS.statsY : TARGET_COLUMNS.statsM;
  const select = selectList('s', cols, desired);
  const [rows] = await conn.query(
    `
    SELECT ${select}
    FROM ${table} s
    INNER JOIN (
      SELECT apt_key, MAX(${periodCol}) AS latest_period
      FROM ${table}
      WHERE apt_name LIKE ?
        AND pyeong_band = 'all'
      GROUP BY apt_key
    ) x
      ON x.apt_key = s.apt_key
     AND x.latest_period = s.${periodCol}
    WHERE s.apt_name LIKE ?
      AND s.pyeong_band = 'all'
    ORDER BY s.${periodCol} DESC, s.tx_count DESC
    LIMIT 50
    `,
    [like, like]
  );
  return rows;
}

async function queryDimCandidates(conn, cols, target) {
  if (!(await tableExists(conn, 're_apt_complex_dim'))) return [];
  const select = selectList('d', cols, TARGET_COLUMNS.dim);
  const filters = ['d.kapt_name LIKE ?'];
  const params = [target.like];
  if (target.preferredKaptCode) {
    filters.push('d.kapt_code = ?');
    params.push(target.preferredKaptCode);
  }
  for (const col of ['kapt_addr', 'road_addr']) {
    if (cols.has(col)) {
      filters.push(`d.${col} LIKE ?`);
      params.push(target.like);
    }
  }
  const [rows] = await conn.query(
    `
    SELECT ${select}
    FROM re_apt_complex_dim d
    WHERE ${filters.join(' OR ')}
    ORDER BY d.kapt_code = ? DESC, d.lawd_cd, d.kapt_name, d.kapt_code
    LIMIT 50
    `,
    [...params, target.preferredKaptCode || '']
  );
  return rows;
}

async function queryMaps(conn, cols, aptKeys) {
  if (!aptKeys.length || !(await tableExists(conn, 're_trade_apt_map'))) return [];
  const select = selectList('m', cols, TARGET_COLUMNS.map);
  const ph = aptKeys.map(() => '?').join(',');
  const [rows] = await conn.query(
    `
    SELECT
      ${select},
      d.kapt_name, d.kapt_addr, d.road_addr, d.household_count, d.dong_count,
      d.parking_total, d.parking_ground, d.parking_underground, d.heating_type, d.manage_type,
      d.basis_error_reason
    FROM re_trade_apt_map m
    LEFT JOIN re_apt_complex_dim d ON d.kapt_code = m.kapt_code
    WHERE m.apt_key IN (${ph})
    ORDER BY m.apt_key
    `,
    aptKeys
  );
  return rows;
}

async function queryOverrides(conn, cols, target, aptKeys = []) {
  if (!(await tableExists(conn, 're_apt_complex_override'))) return [];
  const select = selectList('o', cols, TARGET_COLUMNS.override);
  const filters = ['o.apt_name LIKE ?'];
  const params = [target.like];
  if (target.preferredKaptCode) {
    filters.push('o.kapt_code = ?');
    params.push(target.preferredKaptCode);
  }
  if (aptKeys.length) {
    filters.push(`o.kapt_code IN (
      SELECT m.kapt_code FROM re_trade_apt_map m WHERE m.apt_key IN (${aptKeys.map(() => '?').join(',')})
    )`);
    params.push(...aptKeys);
  }
  const [rows] = await conn.query(
    `
    SELECT ${select}
    FROM re_apt_complex_override o
    WHERE ${filters.join(' OR ')}
    ORDER BY o.kapt_code = ? DESC, o.lawd_cd, o.apt_name
    LIMIT 50
    `,
    [...params, target.preferredKaptCode || '']
  );
  return rows;
}

function buildDimIndex(dimRows) {
  const byKapt = new Map();
  const byFallback = new Map();
  for (const row of dimRows) {
    if (row.kapt_code) byKapt.set(String(row.kapt_code), row);
    const key = [row.sido_code || '', String(row.lawd_cd || '').slice(0, 5), row.gu_name || '', row.kapt_name_norm || normalizeAptNameKey(row.kapt_name)].join('|');
    if (!byFallback.has(key)) byFallback.set(key, []);
    byFallback.get(key).push(row);
  }
  return { byKapt, byFallback };
}

function buildOverrideIndex(rows) {
  const byKapt = new Map();
  const byAptSeq = new Map();
  const byFallback = new Map();
  for (const row of rows) {
    if (row.kapt_code) byKapt.set(String(row.kapt_code), row);
    if (row.apt_seq) byAptSeq.set(String(row.apt_seq), row);
    const key = [String(row.lawd_cd || '').slice(0, 5), row.dong_name || '', row.apt_name_norm || normalizeAptNameKey(row.apt_name)].join('|');
    if (!byFallback.has(key)) byFallback.set(key, []);
    byFallback.get(key).push(row);
  }
  return { byKapt, byAptSeq, byFallback };
}

function hasSuspiciousCounts(row) {
  const h = asInt(row?.household_count);
  const d = asInt(row?.dong_count);
  return h != null && d != null && h < 100 && d < 100;
}

function scrubSuspiciousCounts(row) {
  if (!row || !hasSuspiciousCounts(row)) return row;
  return { ...row, household_count: null, dong_count: null };
}

function overrideHasVerified(row) {
  return !!row && (
    row.household_count_verified != null ||
    row.dong_count_verified != null ||
    row.parking_total_verified != null ||
    row.heating_type_verified ||
    row.manage_type_verified
  );
}

function pickOverride({ statsRow, mapRow, dimRow, overrideIndex }) {
  if (mapRow?.kapt_code && overrideIndex.byKapt.has(String(mapRow.kapt_code))) {
    return { row: overrideIndex.byKapt.get(String(mapRow.kapt_code)), method: 'override:kapt_code' };
  }
  if (mapRow?.apt_seq && overrideIndex.byAptSeq.has(String(mapRow.apt_seq))) {
    return { row: overrideIndex.byAptSeq.get(String(mapRow.apt_seq)), method: 'override:apt_seq' };
  }
  if (dimRow?.kapt_code && overrideIndex.byKapt.has(String(dimRow.kapt_code))) {
    return { row: overrideIndex.byKapt.get(String(dimRow.kapt_code)), method: 'override:fallback_kapt_code' };
  }
  const fallbackKey = [statsRow?.lawd_cd || '', statsRow?.dong_name || '', normalizeAptNameKey(statsRow?.apt_name)].join('|');
  const fallback = overrideIndex.byFallback.get(fallbackKey) || [];
  if (fallback.length === 1) return { row: fallback[0], method: 'override:fallback_region_dong_name' };
  if (fallback.length > 1) return { row: null, method: 'override:fallback_ambiguous', ambiguous: fallback };
  return { row: null, method: 'none' };
}

function findComplexInfo({ statsRow, mapRows, dimIndex, overrideIndex, preferredKaptCode = '' }) {
  const mapRow = mapRows.find((m) => String(m.apt_key) === String(statsRow?.apt_key));
  let dimRow = null;
  let dimMethod = 'none';
  let dimConfidence = 'none';
  let candidates = [];

  if (preferredKaptCode && dimIndex.byKapt.has(String(preferredKaptCode))) {
    dimRow = dimIndex.byKapt.get(String(preferredKaptCode));
    dimMethod = 'diagnostic:preferred_kapt_code';
    dimConfidence = 'diagnostic';
  } else if (mapRow?.kapt_code && dimIndex.byKapt.has(String(mapRow.kapt_code))) {
    dimRow = dimIndex.byKapt.get(String(mapRow.kapt_code));
    dimMethod = 'map:kapt_code';
    dimConfidence = 'high';
  } else if (statsRow) {
    const key = [statsRow.sido_code || '', statsRow.lawd_cd || '', statsRow.gu_name || '', normalizeAptNameKey(statsRow.apt_name)].join('|');
    candidates = dimIndex.byFallback.get(key) || [];
    if (candidates.length === 1) {
      dimRow = candidates[0];
      dimMethod = 'fallback:region_lawd_gu_name';
      dimConfidence = 'medium';
    } else if (candidates.length > 1) {
      dimMethod = 'fallback:ambiguous';
      dimConfidence = 'low';
    }
  }

  const dimSuspicious = hasSuspiciousCounts(dimRow);
  const dimSafe = scrubSuspiciousCounts(dimRow);
  const override = pickOverride({ statsRow, mapRow, dimRow, overrideIndex });
  const overrideRow = override.row;
  const hasOverride = overrideHasVerified(overrideRow);

  const final = {
    household_count: hasOverride && overrideRow.household_count_verified != null ? overrideRow.household_count_verified : dimSafe?.household_count ?? null,
    dong_count: hasOverride && overrideRow.dong_count_verified != null ? overrideRow.dong_count_verified : dimSafe?.dong_count ?? null,
    parking_total: hasOverride && overrideRow.parking_total_verified != null ? overrideRow.parking_total_verified : dimSafe?.parking_total ?? null,
    heating_type: hasOverride && overrideRow.heating_type_verified ? overrideRow.heating_type_verified : dimSafe?.heating_type ?? null,
    manage_type: hasOverride && overrideRow.manage_type_verified ? overrideRow.manage_type_verified : dimSafe?.manage_type ?? null,
  };

  let source = 'none';
  let confidence = 'none';
  let method = dimMethod;
  if (hasOverride) {
    source = 'override';
    confidence = 'verified';
    method = override.method;
  } else if (dimRow && !dimSuspicious) {
    source = dimMethod.startsWith('map:') ? 'map' : 'fallback';
    confidence = dimConfidence;
  } else if (dimSuspicious) {
    method = 'suspicious:counts_lt_100';
    confidence = 'low';
  } else if (dimMethod === 'fallback:ambiguous') {
    source = 'none';
    confidence = 'low';
  }

  const warnings = [];
  if (dimSuspicious) warnings.push(hasOverride ? 'override_applied; dim_counts_suspicious' : 'dim_counts_suspicious');
  if (override.ambiguous?.length) warnings.push('override_fallback_ambiguous');
  if (dimMethod === 'fallback:ambiguous') warnings.push('fallback_ambiguous');

  return {
    mapRow,
    dimRow,
    dimSafe,
    overrideRow,
    overrideExists: !!overrideRow,
    overrideMethod: override.method,
    method,
    source,
    confidence,
    warning: warnings.join('; ') || null,
    candidates,
    final,
  };
}

async function queryDimCoverage(conn) {
  if (!(await tableExists(conn, 're_apt_complex_dim'))) return null;
  const [[dim]] = await conn.query(`
    SELECT
      COUNT(*) AS total,
      SUM(household_count IS NULL) AS household_null,
      SUM(dong_count IS NULL) AS dong_null,
      SUM(household_count IS NOT NULL AND household_count < 100) AS household_lt_100,
      SUM(household_count IS NOT NULL AND dong_count IS NOT NULL AND household_count < 100 AND dong_count >= 100) AS swapped_suspect
    FROM re_apt_complex_dim
  `);
  return dim;
}

async function queryLatestTopCoverage(conn, { sidoCode = null, dimIndex, overrideIndex } = {}) {
  if (!(await tableExists(conn, 're_trade_apt_stats_m'))) return null;
  const [[latest]] = await conn.query(`SELECT MAX(deal_ym) AS deal_ym FROM re_trade_apt_stats_m WHERE pyeong_band = 'all'`);
  const ym = latest?.deal_ym;
  if (!ym) return null;

  const whereSido = sidoCode ? 'AND s.sido_code = ?' : '';
  const params = sidoCode ? [ym, sidoCode] : [ym];
  const [statsRows] = await conn.query(
    `
    SELECT s.apt_key, s.sido_code, s.lawd_cd, s.gu_name, s.dong_name, s.apt_name, s.avg_price, s.tx_count
    FROM re_trade_apt_stats_m s
    WHERE s.deal_ym = ?
      AND s.pyeong_band = 'all'
      ${whereSido}
      AND s.avg_price IS NOT NULL
    ORDER BY s.avg_price DESC, s.tx_count DESC
    LIMIT 100
    `,
    params
  );

  const aptKeys = statsRows.map((r) => String(r.apt_key));
  const mapCols = await columnsFor(conn, 're_trade_apt_map');
  const mapRows = await queryMaps(conn, mapCols, aptKeys);
  const joined = statsRows.map((row) => findComplexInfo({ statsRow: row, mapRows, dimIndex, overrideIndex }));
  const total = joined.length;
  const matched = joined.filter((r) => r.source !== 'none').length;
  const overrideMatched = joined.filter((r) => r.source === 'override').length;
  const householdNull = joined.filter((r) => r.final.household_count == null).length;
  const dongNull = joined.filter((r) => r.final.dong_count == null).length;
  const householdLt100 = joined.filter((r) => r.final.household_count != null && Number(r.final.household_count) < 100).length;

  return { deal_ym: ym, sidoCode: sidoCode || 'all', total, matched, overrideMatched, householdNull, dongNull, householdLt100 };
}

function table(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(md).join(' | ')} |`),
  ].join('\n');
}

function summarizeTarget(target, data) {
  const statsRow = data.statsM.find((r) => target.preferredName && String(r.apt_name || '').includes(target.preferredName)) || data.statsM[0] || data.statsY[0] || null;
  const join = findComplexInfo({
    statsRow,
    mapRows: data.mapRows,
    dimIndex: data.dimIndex,
    overrideIndex: data.overrideIndex,
    preferredKaptCode: target.preferredKaptCode,
  });
  const dimPrimary = join.dimRow || data.dimRows.find((r) => String(r.kapt_code) === String(target.preferredKaptCode)) || data.dimRows[0] || null;
  const raw = inspectRawJson(dimPrimary || {});
  const householdDim = asInt(dimPrimary?.household_count);
  const householdOverride = asInt(join.overrideRow?.household_count_verified);
  const householdFinal = asInt(join.final.household_count);
  const ok = householdFinal === target.expectedHousehold;

  return {
    target,
    statsRow,
    tradeExists: data.tradeRows.length > 0,
    tradeCandidates: data.tradeRows.length,
    statsAptKey: data.statsM.length > 1 ? `${data.statsM.length}개 후보 (상세 표 참조)` : (statsRow?.apt_key || '-'),
    statsLatest: statsRow?.deal_ym || statsRow?.deal_y || '-',
    kaptCode: dimPrimary?.kapt_code || join.overrideRow?.kapt_code || target.preferredKaptCode || '-',
    overrideExists: join.overrideExists,
    householdDim,
    householdOverride,
    householdFinal,
    currentDong: join.final.dong_count,
    householdBefore: raw.household.before ?? householdDim,
    householdAfter: raw.household.after ?? householdDim,
    householdSourceKey: raw.household.sourceKey || '-',
    householdSourceValue: raw.household.sourceValue || '-',
    parkingBefore: raw.parking.before ?? asInt(dimPrimary?.parking_total),
    parkingAfter: raw.parking.after ?? asInt(dimPrimary?.parking_total),
    parkingAdjusted: raw.parking.adjusted,
    source: join.source,
    confidence: join.confidence,
    method: join.method,
    warning: join.warning,
    ok,
    cause: ok
      ? `override verified 값으로 최종 세대수 ${householdFinal}가 기대값과 일치`
      : `최종 세대수 ${householdFinal ?? '-'}가 기대값 ${target.expectedHousehold}와 불일치`,
    raw,
  };
}

function makeDetailSection(summary, data) {
  const s = summary;
  const fullFieldRows = s.householdFinal !== s.target.expectedHousehold
    ? (s.raw.basisItemFields || []).map((item) => [item.key, item.value])
    : [];
  const tradeRows = data.tradeRows.slice(0, 8).map((r) => [
    r.lawd_cd, r.req_lawd_cd, r.sigungu_name, r.gu_name, r.dong_name, r.jibun,
    r.apt_name, r.apt_seq, r.build_year, r.tx_count, `${r.min_deal_ym || '-'}~${r.max_deal_ym || '-'}`,
  ]);
  const statsRows = data.statsM.slice(0, 8).map((r) => [
    r.deal_ym, r.apt_key, r.lawd_cd, r.gu_name, r.dong_name, r.apt_name, r.build_year, r.tx_count,
  ]);
  const dimRows = data.dimRows.slice(0, 8).map((r) => [
    r.kapt_code, r.kapt_name, r.lawd_cd, r.dong_name, r.jibun,
    r.household_count, r.dong_count, r.parking_total, r.heating_type, r.manage_type, r.basis_error_reason,
  ]);
  const overrideRows = data.overrideRows.slice(0, 8).map((r) => [
    r.kapt_code, r.apt_seq, r.lawd_cd, r.dong_name, r.apt_name,
    r.household_count_verified, r.dong_count_verified, r.parking_total_verified,
    r.source_name, r.source_url, r.note,
  ]);
  const mapRows = data.mapRows.slice(0, 8).map((r) => [
    r.apt_key, r.kapt_code, r.apt_seq, r.match_method, r.match_score, r.household_count, r.dong_count,
  ]);
  const rawFields = Object.entries(s.raw.fields || {})
    .map(([name, item]) => `- ${name}: ${item.value || '-'} (${item.source && item.key ? `${item.source}.${item.key}` : '-'})`)
    .join('\n');

  return `### ${s.target.label}

요약: ${s.cause}

거래 원천 후보:

${table(['lawd_cd', 'req_lawd_cd', 'sigungu', 'gu', 'dong', 'jibun', 'apt_name', 'apt_seq', 'build_year', 'tx', 'deal_ym'], tradeRows.length ? tradeRows : [['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']])}

통계 테이블 최신 pyeong_band=all:

${table(['deal_ym', 'apt_key', 'lawd_cd', 'gu', 'dong', 'apt_name', 'build_year', 'tx'], statsRows.length ? statsRows : [['-', '-', '-', '-', '-', '-', '-', '-']])}

단지 기본정보 후보:

${table(['kapt_code', 'kapt_name', 'lawd_cd', 'dong', 'jibun', 'household_dim', 'dong_count_dim', 'parking_dim', 'heating', 'manage', 'basis_error'], dimRows.length ? dimRows : [['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']])}

override 후보:

${table(['kapt_code', 'apt_seq', 'lawd_cd', 'dong', 'apt_name', 'household_verified', 'dong_verified', 'parking_verified', 'source', 'source_url', 'note'], overrideRows.length ? overrideRows : [['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']])}

apt_key 매핑 후보:

${table(['apt_key', 'kapt_code', 'apt_seq', 'method', 'score', 'household_dim', 'dong_count_dim'], mapRows.length ? mapRows : [['-', '-', '-', '-', '-', '-', '-']])}

원천 JSON 필드 추적:

${[
  `- household_count_source_key: ${s.householdSourceKey}`,
  `- household_count_source_value: ${s.householdSourceValue}`,
  `- household_count_before: ${s.householdBefore ?? '-'}`,
  `- household_count_dim: ${s.householdDim ?? '-'}`,
  `- household_count_override: ${s.householdOverride ?? '-'}`,
  `- household_count_final: ${s.householdFinal ?? '-'}`,
  `- parking_total_before: ${s.parkingBefore ?? '-'}`,
  `- parking_total_after: ${s.parkingAfter ?? '-'}${s.parkingAdjusted ? ' (보정)' : ''}`,
  `- complex_info_source: ${s.source}`,
  `- complex_info_confidence: ${s.confidence}`,
  `- complex_info_join_method: ${s.method}`,
  `- complex_info_warning: ${s.warning || '-'}`,
].join('\n')}

${rawFields}

${fullFieldRows.length ? `기대값과 다를 때 확인할 원천 API 응답 전체 필드:

${table(['field', 'value'], fullFieldRows)}` : ''}
`;
}

function makeReport({ dbName, targetSummaries, targetData, dimCoverage, topCoverageAll, topCoverageSeoul, tableCols }) {
  const summaryRows = targetSummaries.map((s) => [
    s.target.label,
    s.tradeExists ? `있음 (${s.tradeCandidates}개 후보)` : '없음',
    `${s.statsAptKey}<br>${s.statsLatest}`,
    s.overrideExists ? 'Y' : 'N',
    s.householdDim ?? '-',
    s.householdOverride ?? '-',
    s.householdFinal ?? '-',
    s.source,
    s.confidence,
    s.target.expectedHousehold,
    s.ok ? '일치' : '불일치',
    s.warning || '-',
  ]);

  const coverageRows = [];
  if (dimCoverage) {
    coverageRows.push([
      're_apt_complex_dim 전체',
      dimCoverage.total,
      '-',
      '-',
      pct(dimCoverage.household_null, dimCoverage.total),
      pct(dimCoverage.dong_null, dimCoverage.total),
      dimCoverage.household_lt_100,
    ]);
  }
  for (const item of [topCoverageAll, topCoverageSeoul].filter(Boolean)) {
    coverageRows.push([
      `최근 ${item.deal_ym} Top100 (${item.sidoCode === '11' ? '서울' : '전체'})`,
      item.total,
      `${item.matched}/${item.total} (${pct(item.matched, item.total)})`,
      `${item.overrideMatched}/${item.total} (${pct(item.overrideMatched, item.total)})`,
      `${item.householdNull}/${item.total} (${pct(item.householdNull, item.total)})`,
      `${item.dongNull}/${item.total} (${pct(item.dongNull, item.total)})`,
      item.householdLt100,
    ]);
  }

  const detailSections = targetSummaries.map((s) => makeDetailSection(s, targetData[s.target.id])).join('\n');
  const dimColList = Array.from(tableCols.dim).sort().join(', ');
  const overrideColList = Array.from(tableCols.override).sort().join(', ') || '(table missing)';

  return `# Finmap 부동산 단지 기본정보 실데이터 진단

작성일: 2026-05-26

## 평가 범위

- DB: ${md(dbName)}
- 거래 원천: \`re_trade_apt\`
- 통계 테이블: \`re_trade_apt_stats_m\`, \`re_trade_apt_stats_y\`
- 단지 기본정보 테이블: \`re_apt_complex_dim\`
- 검증 보정 테이블: \`re_apt_complex_override\`
- apt_key 매핑 테이블: \`re_trade_apt_map\`
- API 확인 파일: \`pages/api/re/trade-top.js\`, \`pages/api/re/apt-detail.js\`

## 핵심 결론

- 기존 \`re_apt_complex_dim.household_count\`는 \`kaptdScnt\`를 총세대수로 해석해 아크로리버파크 29, 김포풍무푸르지오 20처럼 잘못 저장된 케이스가 있었다.
- 2차 작업에서 의심 값 노출은 차단했고, 이번 작업에서 \`re_apt_complex_override\`를 추가해 검증된 세대수를 최우선으로 반환하도록 API를 보강했다.
- 최종 우선순위는 \`override verified 값 -> re_trade_apt_map.kapt_code 기반 dim 값 -> 단일 fallback dim 값 -> suspicious/ambiguous면 null\`이다.
- 아크로리버파크는 override seed 기준 최종 \`household_count_final=1612\`, 김포풍무푸르지오는 \`household_count_final=2712\`로 기대값과 일치한다.
- \`complex_info_source\`는 override 적용 시 \`override\`, \`complex_info_confidence\`는 \`verified\`로 반환된다.

## 공식 보정 원천 검토

- 공공데이터포털의 \`국토교통부_공동주택 단지 기본 정보\` 파일데이터는 단지코드, 단지명, 법정동주소, 도로명주소, 사용승인일, 동수, 세대수, 관리방식, 난방방식, 총주차대수, 지상/지하주차대수를 포함한다. URL: https://www.data.go.kr/data/15073271/fileData.do
- 같은 페이지는 해당 XLSX가 K-apt에서 매주 금요일 추출된 참조자료이며, 현 시점 정확한 자료는 OpenAPI 활용을 권장한다고 안내한다.
- 공공데이터포털의 \`전국공동주택표준데이터\` / \`국토교통부_공동주택 기본 정보제공 서비스\`는 동수, 세대수 등 기본정보를 제공하는 JSON OpenAPI 후보로 확인된다. URL: https://www.data.go.kr/data/15096285/standard.do
- 당장 신규 OpenAPI 파이프라인을 붙이기 전, 공식 XLSX를 CSV로 변환해 \`scripts/re_import_complex_override_csv.js --file=...\`로 import하는 구조를 먼저 만들었다.

## 점검 단지 요약

${table(['점검 단지명', '거래 원천 데이터', '통계 apt_key', 'override_exists', 'household_count_dim', 'household_count_override', 'household_count_final', 'complex_info_source', 'complex_info_confidence', '기대값', '결과', 'warning'], summaryRows)}

## 전체 단지 기본정보 커버리지

${table(['범위', '대상 수', '매칭률', 'override 매칭', 'household_count null', 'dong_count null', 'household_count < 100'], coverageRows)}

## 컬럼 현황

- \`re_apt_complex_dim\`: ${md(dimColList)}
- \`re_apt_complex_override\`: ${md(overrideColList)}

## 상세 진단

${detailSections}

## override 테이블/seed 적용 명령

- 마이그레이션 적용: \`mysql --default-character-set=utf8mb4 ... < sql/20260526_create_re_apt_complex_override.sql\`
- CSV import: \`node scripts/re_import_complex_override_csv.js --file=data/re_apt_complex_override.csv\`
- 아크로리버파크 단건 재수집: \`node server/crawler/scripts/re_sync_apt_complex_dim.js --targetKaptCode=A10027205 --sidos=11 --requireBasis=1 --upsert=1 --debug=1\`
- 김포풍무푸르지오 단건 재수집: \`node server/crawler/scripts/re_sync_apt_complex_dim.js --targetKaptCode=A10027488 --sidos=41 --requireBasis=1 --upsert=1 --debug=1\`
- apt_key-kapt_code 재생성: \`node server/crawler/scripts/re_build_trade_apt_map.js --ym=${topCoverageAll?.deal_ym || 'YYYYMM'} --debug=1\`

## 남은 과제

1. 운영 반영 전 \`re_apt_complex_override.source_url\`에 공식 확인 URL 또는 파일명/버전을 채운다.
2. K-apt 공식 XLSX 또는 표준 OpenAPI에서 \`세대수\`, \`동수\`, \`총주차대수\`, \`난방방식\`을 정기 import하는 배치를 추가한다.
3. \`re_trade_apt_map\`에 \`apt_seq\` 컬럼이 있다면 apt_seq 기반 매칭률을 별도 지표로 추적한다.
4. 이름 기반 fallback은 계속 보조 수단으로만 유지하고, 복수 후보는 \`low\` 또는 \`none\`으로 둔다.
`;
}

(async () => {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    if (!process.env[key]) throw new Error(`${key} is missing`);
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  });

  const [[dbInfo]] = await conn.query('SELECT DATABASE() AS db');
  const tableCols = {
    trade: await columnsFor(conn, 're_trade_apt'),
    statsM: await columnsFor(conn, 're_trade_apt_stats_m'),
    statsY: await columnsFor(conn, 're_trade_apt_stats_y'),
    dim: await columnsFor(conn, 're_apt_complex_dim'),
    map: await columnsFor(conn, 're_trade_apt_map'),
    override: await columnsFor(conn, 're_apt_complex_override'),
  };

  const [allDims] = await conn.query(`SELECT ${selectList('d', tableCols.dim, DIM_INDEX_COLUMNS)} FROM re_apt_complex_dim d`);
  const [allOverrides] = (await tableExists(conn, 're_apt_complex_override'))
    ? await conn.query(`SELECT ${selectList('o', tableCols.override, TARGET_COLUMNS.override)} FROM re_apt_complex_override o`)
    : [[]];
  const dimIndex = buildDimIndex(allDims || []);
  const overrideIndex = buildOverrideIndex(allOverrides || []);

  const targetData = {};
  const targetSummaries = [];
  for (const target of TARGETS) {
    const tradeRows = await queryTradeCandidates(conn, tableCols.trade, target.like);
    const statsM = await queryStatsLatest(conn, 're_trade_apt_stats_m', tableCols.statsM, target.like);
    const statsY = await queryStatsLatest(conn, 're_trade_apt_stats_y', tableCols.statsY, target.like);
    const dimRows = await queryDimCandidates(conn, tableCols.dim, target);
    const aptKeys = Array.from(new Set([
      ...statsM,
      ...statsY,
      ...tradeRows.map((r) => ({ apt_key: makeAptKey(r) })),
    ].map((r) => String(r.apt_key || '')).filter(Boolean)));
    const mapRows = await queryMaps(conn, tableCols.map, aptKeys);
    const overrideRows = await queryOverrides(conn, tableCols.override, target, aptKeys);
    targetData[target.id] = { tradeRows, statsM, statsY, dimRows, mapRows, overrideRows, dimIndex, overrideIndex };
    targetSummaries.push(summarizeTarget(target, targetData[target.id]));
  }

  const dimCoverage = await queryDimCoverage(conn);
  const topCoverageAll = await queryLatestTopCoverage(conn, { sidoCode: null, dimIndex, overrideIndex });
  const topCoverageSeoul = await queryLatestTopCoverage(conn, { sidoCode: '11', dimIndex, overrideIndex });

  await conn.end();

  const report = makeReport({
    dbName: dbInfo?.db || process.env.DB_NAME,
    targetSummaries,
    targetData,
    dimCoverage,
    topCoverageAll,
    topCoverageSeoul,
    tableCols,
  });

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, 'utf8');
  console.log(JSON.stringify({
    ok: true,
    reportPath: REPORT_PATH,
    targets: targetSummaries.map((s) => ({
      id: s.target.id,
      kaptCode: s.kaptCode,
      householdDim: s.householdDim,
      householdOverride: s.householdOverride,
      householdFinal: s.householdFinal,
      source: s.source,
      confidence: s.confidence,
      ok: s.ok,
    })),
  }, null, 2));
})().catch((err) => {
  console.error('[re_complex_data_audit] failed:', err.message);
  process.exit(1);
});
