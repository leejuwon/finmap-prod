/**
 * server/crawler/scripts/re_seed_legal_dong.js
 * 사용 예:
 *   node server/crawler/scripts/re_seed_legal_dong.js --file=./법정동코드.csv
 *
 * CSV(또는 TSV) 컬럼 예시(권장):
 *   code10, full_name, 폐지여부(또는 존재여부), old_code10(optional)
 *
 * 주의:
 * - 파일은 가능하면 UTF-8로 저장
 * - 구분자가 탭이면 자동으로 TSV로 인식
 */
'use strict';

require('dotenv').config({ path: process.env.DOTENV || '.env.local' });
const fs = require('fs');
const mysql = require('mysql2/promise');

function getArg(name, def = null) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : def;
}

function toIsExist(flagRaw) {
  const s = String(flagRaw || '').trim();
  if (!s) return 1;

  // 폐지여부 컬럼이 Y/1/폐지 로 오는 경우가 흔함 → 존재=0 처리
  if (s === 'Y' || s === '1' || s.includes('폐지') || s.toLowerCase() === 'true') return 0;

  // 존재여부 컬럼이 존재/0/N 로 오는 경우 → 존재=1
  if (s === 'N' || s === '0' || s.includes('존재') || s.toLowerCase() === 'false') return 1;

  // 애매하면 "폐지"만 0, 나머지는 1
  return s.includes('폐지') ? 0 : 1;
}

function parseNameParts(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);

  const sido_name = parts[0] || '';
  let sigungu_name = parts[1] || '';
  let dong_name = null;
  let ri_name = null;

  // 경기도처럼 "수원시 장안구 파장동" 케이스: sigungu_name을 "수원시 장안구"로 합치고 dong_name을 다음 토큰으로
  if (parts.length >= 4 && (parts[1] || '').endsWith('시') && (parts[2] || '').endsWith('구')) {
    sigungu_name = `${parts[1]} ${parts[2]}`;
    dong_name = parts[3] || null;
    ri_name = parts[4] || null;
  } else {
    dong_name = parts[2] || null;
    ri_name = parts[3] || null;
  }

  return { sido_name, sigungu_name, dong_name, ri_name };
}

async function main() {
  const file = getArg('file');
  if (!file) throw new Error('--file=... is required');

  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);

  const pool = await mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
    charset: 'utf8mb4',
  });

  const BATCH = 1000;
  let buf = [];

  const insertSql = `
    INSERT INTO re_legal_dong
      (code10, sido_code, sigungu_code, dong_code,
       sido_name, sigungu_name, dong_name, ri_name,
       is_exist, old_code10)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      sido_name = VALUES(sido_name),
      sigungu_name = VALUES(sigungu_name),
      dong_name = VALUES(dong_name),
      ri_name = VALUES(ri_name),
      is_exist = VALUES(is_exist),
      old_code10 = VALUES(old_code10)
  `;

  let inserted = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // CSV/TSV 자동 판별
    const delim = line.includes('\t') ? '\t' : ',';
    const cols = line.split(delim).map(s => s.replace(/^"|"$/g, '').trim());

    const code10 = cols[0];
    const fullName = cols[1];
    const flag = cols[2];
    const oldCode10 = cols[3];

    if (!/^\d{10}$/.test(code10)) continue; // 헤더/잡라인 스킵

    const { sido_name, sigungu_name, dong_name, ri_name } = parseNameParts(fullName);
    const is_exist = toIsExist(flag);

    const row = [
      code10,
      code10.slice(0, 2),      // sido_code
      code10.slice(2, 5),      // sigungu_code
      code10.slice(5, 10),     // dong_code
      sido_name,
      sigungu_name,
      dong_name,
      ri_name,
      is_exist,
      /^\d{10}$/.test(oldCode10 || '') ? oldCode10 : null,
    ];

    buf.push(row);

    if (buf.length >= BATCH) {
      const [r] = await pool.query(insertSql, [buf]);
      inserted += r.affectedRows;
      buf = [];
    }
  }

  if (buf.length) {
    const [r] = await pool.query(insertSql, [buf]);
    inserted += r.affectedRows;
  }

  await pool.end();
  console.log(`[done] inserted/updated affectedRows=${inserted}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
