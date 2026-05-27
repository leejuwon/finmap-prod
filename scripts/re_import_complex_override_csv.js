'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DEFAULT_SOURCE_NAME = '국토교통부_공동주택 단지 기본 정보';
const DEFAULT_SOURCE_URL = 'https://www.data.go.kr/data/15073271/fileData.do';

const COLUMN_ALIASES = {
  kapt_code: [
    '단지코드', 'K-apt단지코드', 'KAPT코드', 'kapt_code', 'kaptCode', 'kaptCd',
    'kapt_code', '단지관리코드',
  ],
  apt_seq: ['apt_seq', 'aptSeq', '아파트일련번호', '단지일련번호'],
  apt_name: ['단지명', '아파트명', '공동주택명', 'kapt_name', 'kaptName', 'apt_name'],
  lawd_addr: ['법정동주소', '주소', '지번주소', '법정동 주소', 'kapt_addr', 'kaptAddr'],
  lawd_cd: [
    '법정동코드', '법정동 코드', '법정동코드10자리', 'bjd_code', 'bjdCode',
    'lawd_cd', 'lawdCd', '시군구코드', '지역코드',
  ],
  dong_name: ['법정동', '법정동명', '읍면동', '읍면동명', '동리', '동리명', 'dong_name'],
  household_count: [
    '세대수', '총세대수', '총 세대수', '세대수(총)', '세대수(단지관리자)',
    'household_count_verified', 'household_count', 'householdCnt',
    'kaptTotHsehCnt', 'totHsehCnt', 'hsehCnt', 'hshldCnt', 'hshldCo',
  ],
  dong_count: [
    '동수', '총동수', '총 동수', 'dong_count_verified', 'dong_count', 'dongCnt',
    'kaptdDcnt', 'kaptDcnt', 'kaptDongCnt', 'dongCo',
  ],
  parking_total: [
    '총주차대수', '총 주차대수', '주차대수', '주차장수', 'parking_total_verified',
    'parking_total', 'parkingTotal', 'parkingCnt', 'kaptPcnt', 'kaptdPcnt',
  ],
  parking_ground: [
    '지상주차대수', '지상 주차대수', '지상주차수', 'parking_ground_verified',
    'parking_ground', 'parkingGround', 'kaptPcntg', 'kaptdPcntg',
  ],
  parking_underground: [
    '지하주차대수', '지하 주차대수', '지하주차수', 'parking_underground_verified',
    'parking_underground', 'parkingUnderground', 'kaptPcntu', 'kaptdPcntu',
  ],
  heating_type: ['난방방식', '난방 방식', 'heating_type_verified', 'heating_type', 'heatMthd'],
  manage_type: ['관리방식', '관리 방식', 'manage_type_verified', 'manage_type', 'manageMthd'],
  approval_date: [
    '사용승인일', '사용승인일자', '사용검사일', '사용검사일자',
    'approval_date_verified', 'approval_date', 'use_approval_date', 'kaptUsedate',
  ],
  apt_name_norm: ['apt_name_norm', 'normalized_apt_name'],
  source_name: ['source_name', '출처', '데이터명', '공식데이터명'],
  source_url: ['source_url', '출처URL', '출처 URL', '공공데이터URL'],
  source_file: ['source_file', '파일명', '원본파일명'],
  source_version: ['source_version', '버전', '기준일', '기준년월', '데이터버전'],
  note: ['note', '비고', '메모'],
  verified_at: ['verified_at', '검증일시', '검증일', '확인일시'],
};

const IMPORT_COLUMNS = [
  'kapt_code',
  'apt_seq',
  'lawd_cd',
  'dong_name',
  'apt_name',
  'apt_name_norm',
  'household_count_verified',
  'dong_count_verified',
  'parking_total_verified',
  'parking_ground_verified',
  'parking_underground_verified',
  'heating_type_verified',
  'manage_type_verified',
  'approval_date_verified',
  'source_name',
  'source_url',
  'source_file',
  'source_version',
  'note',
  'verified_at',
];

function loadEnv() {
  try {
    const dotenv = require('dotenv');
    for (const file of ['.env.local', '.env.production']) {
      const p = path.resolve(process.cwd(), file);
      if (fs.existsSync(p)) dotenv.config({ path: p, override: false, quiet: true });
    }
  } catch (_) {}
}

function arg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = process.argv.find((v) => String(v).startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function boolArg(name) {
  return ['1', 'true', 'yes', 'y'].includes(String(arg(name, '')).toLowerCase());
}

function normalizeHeaderName(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()[\]{}<>]/g, '')
    .replace(/[._\-/:\\|"'`·ㆍ*]/g, '');
}

function normalizeAptNameKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
    .replace(/apt|apartment|주상복합/gi, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function readTextFile(filePath, encoding) {
  const buf = fs.readFileSync(filePath);
  if (!encoding || /^utf-?8$/i.test(encoding)) return buf.toString('utf8').replace(/^\uFEFF/, '');
  try {
    const iconv = require('iconv-lite');
    return iconv.decode(buf, encoding).replace(/^\uFEFF/, '');
  } catch (err) {
    throw new Error(`encoding=${encoding} requires iconv-lite or UTF-8 CSV conversion: ${err.message}`);
  }
}

function buildInputRow(headers, cols) {
  const exact = {};
  const normalized = {};
  headers.forEach((header, i) => {
    const key = String(header || '').replace(/^\uFEFF/, '').trim();
    const value = cols[i] == null ? '' : String(cols[i]).trim();
    exact[key] = value;
    const norm = normalizeHeaderName(key);
    if (norm && normalized[norm] == null) normalized[norm] = value;
  });
  return { exact, normalized };
}

function first(inputRow, field) {
  for (const key of COLUMN_ALIASES[field] || [field]) {
    const direct = inputRow.exact[key];
    if (direct != null && String(direct).trim() !== '') return String(direct).trim();
    const norm = normalizeHeaderName(key);
    const normalized = inputRow.normalized[norm];
    if (normalized != null && String(normalized).trim() !== '') return String(normalized).trim();
  }
  return '';
}

function parseIntegerLike(value) {
  if (value == null || String(value).trim() === '') return null;
  const text = String(value).replace(/,/g, '').trim();
  const matched = text.match(/-?\d+(?:\.\d+)?/);
  if (!matched) return null;
  const n = Number(matched[0]);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toPositiveIntOrNull(value) {
  const n = parseIntegerLike(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function toNonNegativeIntOrNull(value) {
  const n = parseIntegerLike(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function toDateOrNull(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const digits = text.replace(/\D/g, '');
  if (digits.length >= 8) {
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    if (Number(m) >= 1 && Number(m) <= 12 && Number(d) >= 1 && Number(d) <= 31) return `${y}-${m}-${d}`;
  }
  const m = text.match(/(20\d{2}|19\d{2})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2})/);
  if (!m) return null;
  return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
}

function cleanCode(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  return text.replace(/\s+/g, '');
}

function cleanLawdCd(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 5 ? digits.slice(0, 5) : null;
}

function extractDongName(address) {
  const tokens = String(address || '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[,，]/g, ' ')
    .split(/\s+/)
    .map((v) => v.trim())
    .filter(Boolean);
  let candidate = '';
  for (const token of tokens) {
    if (/^\d/.test(token)) continue;
    if (/(읍|면|동|가|리)$/.test(token)) candidate = token;
  }
  return candidate || null;
}

function inferSourceVersion(filePath) {
  const base = path.basename(filePath || '');
  const compact = base.match(/(20\d{6})/);
  if (compact) return `${compact[1].slice(0, 4)}-${compact[1].slice(4, 6)}-${compact[1].slice(6, 8)}`;
  const dashed = base.match(/(20\d{2})[-_.]?(0\d|1[0-2])[-_.]?([0-3]\d)/);
  if (dashed) return `${dashed[1]}-${dashed[2]}-${dashed[3]}`;
  return null;
}

function truncate(value, max = 500) {
  const text = String(value || '').trim();
  return text.length > max ? text.slice(0, max - 1) : text;
}

function hasImportValue(row) {
  return (
    row.household_count_verified != null ||
    row.dong_count_verified != null ||
    row.parking_total_verified != null ||
    row.parking_ground_verified != null ||
    row.parking_underground_verified != null ||
    row.heating_type_verified ||
    row.manage_type_verified ||
    row.approval_date_verified
  );
}

function mapRow(inputRow, context) {
  const aptName = first(inputRow, 'apt_name');
  const lawdAddr = first(inputRow, 'lawd_addr');
  const lawdCd = cleanLawdCd(first(inputRow, 'lawd_cd'));
  const dongName = first(inputRow, 'dong_name') || extractDongName(lawdAddr);
  const aptNameNorm = first(inputRow, 'apt_name_norm') || normalizeAptNameKey(aptName);
  const parkingGround = toNonNegativeIntOrNull(first(inputRow, 'parking_ground'));
  const parkingUnderground = toNonNegativeIntOrNull(first(inputRow, 'parking_underground'));
  let parkingTotal = toNonNegativeIntOrNull(first(inputRow, 'parking_total'));
  if (parkingTotal == null && (parkingGround != null || parkingUnderground != null)) {
    parkingTotal = Number(parkingGround || 0) + Number(parkingUnderground || 0);
  }

  const fileNote = `official csv import ${context.importDate} file=${context.sourceFile}`;
  const rowNote = first(inputRow, 'note');
  const note = truncate(rowNote ? `${fileNote}; ${rowNote}` : fileNote);

  const row = {
    kapt_code: cleanCode(first(inputRow, 'kapt_code')),
    apt_seq: cleanCode(first(inputRow, 'apt_seq')),
    lawd_cd: lawdCd,
    dong_name: dongName || null,
    apt_name: aptName,
    apt_name_norm: aptNameNorm,
    household_count_verified: toPositiveIntOrNull(first(inputRow, 'household_count')),
    dong_count_verified: toPositiveIntOrNull(first(inputRow, 'dong_count')),
    parking_total_verified: parkingTotal,
    parking_ground_verified: parkingGround,
    parking_underground_verified: parkingUnderground,
    heating_type_verified: first(inputRow, 'heating_type') || null,
    manage_type_verified: first(inputRow, 'manage_type') || null,
    approval_date_verified: toDateOrNull(first(inputRow, 'approval_date')),
    source_name: first(inputRow, 'source_name') || context.sourceName,
    source_url: first(inputRow, 'source_url') || context.sourceUrl,
    source_file: first(inputRow, 'source_file') || context.sourceFile,
    source_version: first(inputRow, 'source_version') || context.sourceVersion,
    note,
    verified_at: toDateOrNull(first(inputRow, 'verified_at')) || null,
  };

  let skipReason = '';
  if (!row.apt_name) skipReason = 'apt_name missing';
  else if (!(row.kapt_code || row.apt_seq || (row.lawd_cd && row.dong_name && row.apt_name_norm))) {
    skipReason = 'matching key missing';
  } else if (!hasImportValue(row)) {
    skipReason = 'verified values missing';
  }

  return { row, skipReason };
}

function isManualSource(sourceName) {
  return /manual|audit seed|수동|seed/i.test(String(sourceName || ''));
}

function isOfficialSource(sourceName) {
  return /공식|공공데이터|국토교통부|한국부동산원|k-?apt|official/i.test(String(sourceName || ''));
}

async function connectDb() {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    if (!process.env[key]) throw new Error(`${key} is missing`);
  }
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  });
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

function chunk(values, size = 500) {
  const out = [];
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size));
  return out;
}

async function fetchMatchedKaptCodes(conn, kaptCodes) {
  const codes = Array.from(new Set(kaptCodes.filter(Boolean).map(String)));
  const matched = new Set();
  if (!codes.length) return matched;
  const tables = ['re_apt_complex_dim', 're_trade_apt_map', 're_apt_complex_override'];
  for (const tableName of tables) {
    if (!(await tableExists(conn, tableName))) continue;
    const cols = await columnsFor(conn, tableName);
    if (!cols.has('kapt_code')) continue;
    for (const part of chunk(codes)) {
      const [rows] = await conn.query(
        `SELECT DISTINCT kapt_code FROM ${tableName} WHERE kapt_code IN (${part.map(() => '?').join(',')})`,
        part
      );
      rows.forEach((r) => {
        if (r.kapt_code) matched.add(String(r.kapt_code));
      });
    }
  }
  return matched;
}

async function assertImportColumns(conn) {
  if (!(await tableExists(conn, 're_apt_complex_override'))) {
    throw new Error('re_apt_complex_override is missing. Apply sql/20260526_create_re_apt_complex_override.sql first.');
  }
  const cols = await columnsFor(conn, 're_apt_complex_override');
  const missing = IMPORT_COLUMNS.filter((col) => !cols.has(col.toLowerCase()));
  if (missing.length) {
    throw new Error(`re_apt_complex_override is missing columns: ${missing.join(', ')}. Apply sql/20260526_create_re_apt_complex_override.sql first.`);
  }
}

async function findExistingRows(conn, row) {
  const filters = [];
  const params = [];
  if (row.kapt_code) {
    filters.push('kapt_code = ?');
    params.push(row.kapt_code);
  }
  if (row.apt_seq) {
    filters.push('apt_seq = ?');
    params.push(row.apt_seq);
  }
  if (!row.kapt_code && !row.apt_seq && row.lawd_cd && row.dong_name && row.apt_name_norm) {
    filters.push('(kapt_code IS NULL AND apt_seq IS NULL AND lawd_cd = ? AND dong_name = ? AND apt_name_norm = ?)');
    params.push(row.lawd_cd, row.dong_name, row.apt_name_norm);
  }
  if (!filters.length) return [];
  const [rows] = await conn.query(
    `
    SELECT id, kapt_code, apt_seq, lawd_cd, dong_name, apt_name, apt_name_norm,
      household_count_verified, dong_count_verified, parking_total_verified,
      source_name, source_url, source_file, source_version, note
    FROM re_apt_complex_override
    WHERE ${filters.join(' OR ')}
    LIMIT 5
    `,
    params
  );
  return rows;
}

function shouldUpdateExisting(existing, incoming) {
  if (!existing) return { update: true, manualOverwrite: false, reason: 'new' };
  const existingManual = isManualSource(existing.source_name);
  const incomingOfficial = isOfficialSource(incoming.source_name);
  if (existingManual && !incomingOfficial) {
    return { update: false, manualOverwrite: false, reason: 'manual seed kept; incoming source is not official' };
  }
  return { update: true, manualOverwrite: existingManual && incomingOfficial, reason: existingManual ? 'manual seed overwritten by official source' : 'existing row updated' };
}

function rowValues(row) {
  return [
    row.kapt_code,
    row.apt_seq,
    row.lawd_cd,
    row.dong_name,
    row.apt_name,
    row.apt_name_norm,
    row.household_count_verified,
    row.dong_count_verified,
    row.parking_total_verified,
    row.parking_ground_verified,
    row.parking_underground_verified,
    row.heating_type_verified,
    row.manage_type_verified,
    row.approval_date_verified,
    row.source_name,
    row.source_url,
    row.source_file,
    row.source_version,
    row.note,
    row.verified_at,
  ];
}

async function insertRow(conn, row) {
  await conn.query(
    `
    INSERT INTO re_apt_complex_override (${IMPORT_COLUMNS.join(', ')})
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))
    `,
    rowValues(row)
  );
}

async function updateRow(conn, id, row) {
  await conn.query(
    `
    UPDATE re_apt_complex_override
    SET
      lawd_cd = COALESCE(?, lawd_cd),
      dong_name = COALESCE(?, dong_name),
      apt_name = ?,
      apt_name_norm = ?,
      household_count_verified = COALESCE(?, household_count_verified),
      dong_count_verified = COALESCE(?, dong_count_verified),
      parking_total_verified = COALESCE(?, parking_total_verified),
      parking_ground_verified = COALESCE(?, parking_ground_verified),
      parking_underground_verified = COALESCE(?, parking_underground_verified),
      heating_type_verified = COALESCE(?, heating_type_verified),
      manage_type_verified = COALESCE(?, manage_type_verified),
      approval_date_verified = COALESCE(?, approval_date_verified),
      source_name = ?,
      source_url = COALESCE(?, source_url),
      source_file = COALESCE(?, source_file),
      source_version = COALESCE(?, source_version),
      note = ?,
      verified_at = COALESCE(?, NOW())
    WHERE id = ?
    `,
    [
      row.lawd_cd,
      row.dong_name,
      row.apt_name,
      row.apt_name_norm,
      row.household_count_verified,
      row.dong_count_verified,
      row.parking_total_verified,
      row.parking_ground_verified,
      row.parking_underground_verified,
      row.heating_type_verified,
      row.manage_type_verified,
      row.approval_date_verified,
      row.source_name,
      row.source_url,
      row.source_file,
      row.source_version,
      row.note,
      row.verified_at,
      id,
    ]
  );
}

function parseImportFile({ filePath, encoding, sourceName, sourceUrl, sourceVersion }) {
  const text = readTextFile(filePath, encoding);
  const parsed = parseCsv(text).filter((r) => r.some((c) => String(c || '').trim() !== ''));
  if (!parsed.length) throw new Error(`CSV has no rows: ${filePath}`);

  const headers = parsed.shift().map((h) => String(h || '').replace(/^\uFEFF/, '').trim());
  const sourceFile = path.basename(filePath);
  const context = {
    sourceName,
    sourceUrl,
    sourceFile,
    sourceVersion: sourceVersion || inferSourceVersion(sourceFile),
    importDate: new Date().toISOString().slice(0, 10),
  };

  const importable = [];
  const skipped = [];
  parsed.forEach((cols, index) => {
    const inputRow = buildInputRow(headers, cols);
    const { row, skipReason } = mapRow(inputRow, context);
    if (skipReason) {
      skipped.push({ line: index + 2, reason: skipReason, apt_name: row.apt_name || '' });
    } else {
      importable.push(row);
    }
  });

  return { headers, importable, skipped, totalRows: parsed.length, context };
}

function makeDryRunBase(parsed) {
  const kaptCodeRows = parsed.importable.filter((r) => r.kapt_code).length;
  const aptSeqRows = parsed.importable.filter((r) => r.apt_seq).length;
  const fallbackRows = parsed.importable.filter((r) => !r.kapt_code && !r.apt_seq && r.lawd_cd && r.dong_name && r.apt_name_norm).length;
  return {
    ok: true,
    dryRun: true,
    file: parsed.context.sourceFile,
    source_name: parsed.context.sourceName,
    source_url: parsed.context.sourceUrl,
    source_version: parsed.context.sourceVersion || null,
    totalRowCount: parsed.totalRows,
    importableRowCount: parsed.importable.length,
    kaptCodeRows,
    aptSeqRows,
    regionNameFallbackRows: fallbackRows,
    skippedRowCount: parsed.skipped.length,
    skippedSamples: parsed.skipped.slice(0, 20),
    importableSamples: parsed.importable.slice(0, 5).map((row) => ({
      apt_name: row.apt_name,
      kapt_code: row.kapt_code,
      lawd_cd: row.lawd_cd,
      dong_name: row.dong_name,
      household_count_verified: row.household_count_verified,
      dong_count_verified: row.dong_count_verified,
      parking_total_verified: row.parking_total_verified,
      parking_ground_verified: row.parking_ground_verified,
      parking_underground_verified: row.parking_underground_verified,
    })),
  };
}

async function dryRun(conn, parsed) {
  const summary = makeDryRunBase(parsed);
  if (conn) {
    const matchedCodes = await fetchMatchedKaptCodes(conn, parsed.importable.map((r) => r.kapt_code));
    summary.kaptCodeMatchedRows = parsed.importable.filter((r) => r.kapt_code && matchedCodes.has(String(r.kapt_code))).length;

    let manualOverwriteCandidates = 0;
    for (const row of parsed.importable) {
      const existingRows = await findExistingRows(conn, row);
      if (existingRows.length === 1 && isManualSource(existingRows[0].source_name) && isOfficialSource(row.source_name)) {
        manualOverwriteCandidates++;
      }
    }
    summary.manualSeedOverwriteCandidateRows = manualOverwriteCandidates;
  }
  console.log(JSON.stringify(summary, null, 2));
}

async function importRows(conn, parsed) {
  const stats = {
    ok: true,
    dryRun: false,
    file: parsed.context.sourceFile,
    totalRowCount: parsed.totalRows,
    importableRowCount: parsed.importable.length,
    inserted: 0,
    updated: 0,
    skipped: parsed.skipped.length,
    manualSeedOverwrites: 0,
    skippedSamples: parsed.skipped.slice(0, 20),
    manualOverwriteLogs: [],
  };

  for (const row of parsed.importable) {
    const existingRows = await findExistingRows(conn, row);
    const distinctIds = Array.from(new Set(existingRows.map((r) => Number(r.id)).filter(Boolean)));
    if (distinctIds.length > 1) {
      stats.skipped++;
      stats.skippedSamples.push({ apt_name: row.apt_name, reason: 'ambiguous existing override rows', ids: distinctIds });
      continue;
    }

    const existing = existingRows[0] || null;
    const decision = shouldUpdateExisting(existing, row);
    if (!decision.update) {
      stats.skipped++;
      stats.skippedSamples.push({ apt_name: row.apt_name, reason: decision.reason, kapt_code: row.kapt_code, apt_seq: row.apt_seq });
      continue;
    }

    if (existing) {
      await updateRow(conn, existing.id, row);
      stats.updated++;
      if (decision.manualOverwrite) {
        stats.manualSeedOverwrites++;
        const message = `manual seed overwritten id=${existing.id} apt=${row.apt_name} kapt_code=${row.kapt_code || '-'} source=${row.source_name}`;
        stats.manualOverwriteLogs.push(message);
        console.warn(`[re_import_complex_override_csv] ${message}`);
      }
    } else {
      await insertRow(conn, row);
      stats.inserted++;
    }
  }

  console.log(JSON.stringify(stats, null, 2));
}

async function main() {
  loadEnv();
  const file = arg('file');
  if (!file) {
    throw new Error('Usage: node scripts/re_import_complex_override_csv.js --file=path/to/official.csv [--dryRun=1] [--sourceName=...] [--sourceUrl=...] [--sourceVersion=...] [--encoding=utf8]');
  }

  const csvPath = path.resolve(process.cwd(), file);
  const parsed = parseImportFile({
    filePath: csvPath,
    encoding: arg('encoding', 'utf8'),
    sourceName: arg('sourceName', DEFAULT_SOURCE_NAME),
    sourceUrl: arg('sourceUrl', DEFAULT_SOURCE_URL),
    sourceVersion: arg('sourceVersion', arg('version', '')) || null,
  });

  const conn = await connectDb();
  try {
    await assertImportColumns(conn);
    if (boolArg('dryRun')) {
      await dryRun(conn, parsed);
    } else {
      await importRows(conn, parsed);
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('[re_import_complex_override_csv] failed:', err.message);
  process.exit(1);
});
