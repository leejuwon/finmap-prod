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

function arg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = process.argv.find((v) => String(v).startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
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

function first(row, keys) {
  for (const key of keys) {
    if (row[key] != null && String(row[key]).trim() !== '') return String(row[key]).trim();
  }
  return '';
}

function toIntOrNull(value) {
  if (value == null || value === '') return null;
  const n = Number(String(value).replace(/[^\d-]/g, ''));
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function mapRow(row) {
  const aptName = first(row, ['apt_name', 'kapt_name', '단지명', '아파트명']);
  const aptNameNorm = first(row, ['apt_name_norm', 'normalized_apt_name']) || normalizeAptNameKey(aptName);
  return {
    kapt_code: first(row, ['kapt_code', '단지코드']) || null,
    apt_seq: first(row, ['apt_seq']) || null,
    lawd_cd: first(row, ['lawd_cd', '법정동코드', '시군구코드']).slice(0, 5) || null,
    dong_name: first(row, ['dong_name', '법정동', '동리', '읍면동']) || null,
    apt_name: aptName,
    apt_name_norm: aptNameNorm,
    household_count_verified: toIntOrNull(first(row, ['household_count_verified', 'household_count', '세대수'])),
    dong_count_verified: toIntOrNull(first(row, ['dong_count_verified', 'dong_count', '동수'])),
    parking_total_verified: toIntOrNull(first(row, ['parking_total_verified', 'parking_total', '총주차대수'])),
    heating_type_verified: first(row, ['heating_type_verified', 'heating_type', '난방방식']) || null,
    manage_type_verified: first(row, ['manage_type_verified', 'manage_type', '관리방식']) || null,
    source_name: first(row, ['source_name', '출처']) || 'official csv import',
    source_url: first(row, ['source_url', '출처URL']) || null,
    note: first(row, ['note', '비고']) || null,
    verified_at: first(row, ['verified_at', '검증일시']) || null,
  };
}

async function main() {
  loadEnv();
  const file = arg('file');
  if (!file) throw new Error('Usage: node scripts/re_import_complex_override_csv.js --file=path/to/override.csv');

  const csvPath = path.resolve(process.cwd(), file);
  const text = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const parsed = parseCsv(text).filter((r) => r.some((c) => String(c || '').trim() !== ''));
  const headers = parsed.shift().map((h) => String(h || '').trim());
  const rows = parsed.map((cols) => {
    const row = {};
    headers.forEach((h, i) => { row[h] = cols[i] == null ? '' : cols[i]; });
    return mapRow(row);
  }).filter((r) => r.apt_name && (r.kapt_code || r.apt_seq || (r.lawd_cd && r.dong_name && r.apt_name_norm)));

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  });

  const [exists] = await conn.query(
    `SELECT 1 ok FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 're_apt_complex_override' LIMIT 1`
  );
  if (!exists.length) throw new Error('re_apt_complex_override is missing. Apply sql/20260526_create_re_apt_complex_override.sql first.');

  let upserted = 0;
  for (const row of rows) {
    await conn.query(
      `
      INSERT INTO re_apt_complex_override (
        kapt_code, apt_seq, lawd_cd, dong_name, apt_name, apt_name_norm,
        household_count_verified, dong_count_verified, parking_total_verified,
        heating_type_verified, manage_type_verified,
        source_name, source_url, note, verified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))
      ON DUPLICATE KEY UPDATE
        lawd_cd = VALUES(lawd_cd),
        dong_name = VALUES(dong_name),
        apt_name = VALUES(apt_name),
        apt_name_norm = VALUES(apt_name_norm),
        household_count_verified = VALUES(household_count_verified),
        dong_count_verified = VALUES(dong_count_verified),
        parking_total_verified = VALUES(parking_total_verified),
        heating_type_verified = VALUES(heating_type_verified),
        manage_type_verified = VALUES(manage_type_verified),
        source_name = VALUES(source_name),
        source_url = VALUES(source_url),
        note = VALUES(note),
        verified_at = VALUES(verified_at)
      `,
      [
        row.kapt_code, row.apt_seq, row.lawd_cd, row.dong_name, row.apt_name, row.apt_name_norm,
        row.household_count_verified, row.dong_count_verified, row.parking_total_verified,
        row.heating_type_verified, row.manage_type_verified,
        row.source_name, row.source_url, row.note, row.verified_at,
      ]
    );
    upserted++;
  }

  await conn.end();
  console.log(JSON.stringify({ ok: true, file: csvPath, upserted }, null, 2));
}

main().catch((err) => {
  console.error('[re_import_complex_override_csv] failed:', err.message);
  process.exit(1);
});
