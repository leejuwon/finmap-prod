/**
 * server/crawler/scripts/re_seed_sigungu.js
 * - re_legal_dong에서 시군구 목록을 뽑아 re_sigungu에 채움
 * - 사용 예: node server/crawler/scripts/re_seed_sigungu.js --sido=41
 */
'use strict';

require('dotenv').config({ path: process.env.DOTENV || '.env.local' });
const mysql = require('mysql2/promise');

function getArg(name, def = null) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : def;
}

async function main() {
  const sido = getArg('sido', '41'); // 기본: 경기도
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    charset: 'utf8mb4',
  });

  const sql = `
    INSERT INTO re_sigungu (lawd_cd, sido_code, sigungu_code, sido_name, sigungu_name, is_exist)
    SELECT
      CONCAT(sido_code, sigungu_code) AS lawd_cd,
      sido_code, sigungu_code,
      MAX(sido_name) AS sido_name,
      MAX(sigungu_name) AS sigungu_name,
      1 AS is_exist
    FROM re_legal_dong
    WHERE is_exist = 1
      AND sido_code = ?
    GROUP BY sido_code, sigungu_code
    ON DUPLICATE KEY UPDATE
      sido_name = VALUES(sido_name),
      sigungu_name = VALUES(sigungu_name),
      is_exist = 1
  `;

  const [r] = await pool.query(sql, [sido]);
  console.log(`[seed] sido=${sido}, affected=${r.affectedRows}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
