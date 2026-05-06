'use strict';

const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

function loadEnv() {
  try {
    const dotenv = require('dotenv');
    const envPath =
      process.env.NODE_ENV === 'production'
        ? path.resolve(process.cwd(), '.env.production')
        : path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
  } catch (e) {}
}
loadEnv();

function arg(name, defVal) {
  for (const v of process.argv) {
    if (v && v.startsWith(`--${name}=`)) return v.split('=')[1];
  }
  return defVal;
}

function asBool(v, defVal = false) {
  if (v == null) return defVal;
  const s = String(v).trim().toLowerCase();
  if (s === '1' || s === 'true' || s === 'y' || s === 'yes') return true;
  if (s === '0' || s === 'false' || s === 'n' || s === 'no') return false;
  return defVal;
}

function readColumnName(row) {
  return String(row?.column_name || row?.COLUMN_NAME || row?.Column_name || '').trim().toLowerCase();
}

function normName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[(\[][^)\]]*[)\]]/g, '') // 괄호 제거
    .replace(/아파트|apt|apartment|주상복합/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function normalizeAptNameKey(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
    .replace(/apt|apartment|주상복합/gi, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

async function tableExists(conn, name) {
  const [rows] = await conn.query(
    `SELECT 1 ok FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=? LIMIT 1`,
    [name]
  );
  return rows && rows.length > 0;
}

(async () => {
  const debug = asBool(arg('debug', '0'));
  const ym = String(arg('ym', '')).trim(); // 예: 202602
  if (!/^\d{6}$/.test(ym)) throw new Error('--ym=YYYYMM is required');

  ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].forEach(k => {
    if (!process.env[k]) throw new Error(`${k} is missing`);
  });

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  });

  const statsTable = 're_trade_apt_stats_m';
  const dimTable = 're_apt_complex_dim';
  const mapTable = 're_trade_apt_map';

  for (const t of [statsTable, dimTable, mapTable]) {
    if (!(await tableExists(conn, t))) throw new Error(`Missing table ${t}`);
  }

  // 1) 전월 stats 기준으로 “미매핑 apt_key”만 뽑기 (대용량 re_trade_apt 전체 스캔 피함)
  const [targets] = await conn.query(
    `
    SELECT s.apt_key, s.lawd_cd, s.sigungu_name, s.gu_name, s.dong_name, s.apt_name
    FROM re_trade_apt_stats_m s
    LEFT JOIN re_trade_apt_map m ON m.apt_key = s.apt_key
    WHERE s.deal_ym = ?
      AND s.pyeong_band = 'all'
      AND m.apt_key IS NULL
    `,
    [ym]
  );

  console.log(`[target] ym=${ym} unmapped=${targets.length}`);

  // 2) 단지 dim을 lawd_cd 단위로 미리 로딩해서 매칭 속도 올리기
  //    (dimTable에 lawd_cd 컬럼이 있으면 최적, 없으면 bjd_code prefix로 fallback)
  const [dimCols] = await conn.query(
    `SELECT COLUMN_NAME AS column_name FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=?`,
    [dimTable]
  );
  const dimColSet = new Set(dimCols.map(readColumnName).filter(Boolean));
  if (debug) console.log('[debug][dim columns]', Array.from(dimColSet).sort().slice(0, 80));
  const hasLawd = dimColSet.has('lawd_cd');
  const hasBjd = dimColSet.has('bjd_code');
  const kaptAddrSelect = dimColSet.has('kapt_addr') ? 'kapt_addr' : 'NULL AS kapt_addr';
  const bjdCodeSelect = dimColSet.has('bjd_code') ? 'bjd_code' : 'NULL AS bjd_code';
  if (!hasLawd && !hasBjd) {
    throw new Error(`${dimTable} needs lawd_cd or bjd_code to match by region. detected columns=${Array.from(dimColSet).sort().join(', ') || '(none)'}`);
  }

  const dimByLawd = new Map(); // lawd_cd -> complexes[]
  for (const t of targets) {
    const lawd = String(t.lawd_cd || '').trim();
    if (!lawd || dimByLawd.has(lawd)) continue;

    let rows = [];
    if (hasLawd) {
      const [r] = await conn.query(
        `SELECT kapt_code, kapt_name, ${kaptAddrSelect}, ${bjdCodeSelect}, lawd_cd FROM ${dimTable} WHERE lawd_cd=?`,
        [lawd]
      );
      rows = r || [];
    } else {
      // bjd_code가 10자리라면 prefix(앞5=lawd_cd) 범위로 조회
      const from = `${lawd}00000`;
      const to = `${lawd}99999`;
      const [r] = await conn.query(
        `SELECT kapt_code, kapt_name, ${kaptAddrSelect}, bjd_code FROM ${dimTable} WHERE bjd_code BETWEEN ? AND ?`,
        [from, to]
      );
      rows = r || [];
    }

    dimByLawd.set(lawd, rows);
  }

  // 3) 매칭 & UPSERT
  // mapTable 컬럼은 최소: apt_key, kapt_code
  const [mapCols] = await conn.query(
    `
    SELECT
      COLUMN_NAME AS column_name,
      IS_NULLABLE AS is_nullable,
      COLUMN_DEFAULT AS column_default,
      EXTRA AS extra
    FROM information_schema.columns
    WHERE table_schema=DATABASE()
      AND table_name=?
    `,
    [mapTable]
  );
  const mapColSet = new Set(mapCols.map(readColumnName).filter(Boolean));
  if (debug) console.log('[debug][map columns]', Array.from(mapColSet).sort().slice(0, 80));
  if (debug) {
    const requiredNoDefault = mapCols
      .filter((r) => String(r.is_nullable || r.IS_NULLABLE || '').toUpperCase() === 'NO')
      .filter((r) => r.column_default == null && r.COLUMN_DEFAULT == null)
      .filter((r) => !String(r.extra || r.EXTRA || '').toLowerCase().includes('auto_increment'))
      .map(readColumnName)
      .filter(Boolean);
    console.log('[debug][map required no default]', requiredNoDefault);
  }
  if (!mapColSet.has('apt_key') || !mapColSet.has('kapt_code')) {
    throw new Error(`${mapTable} must have apt_key and kapt_code`);
  }

  const insCols = [
    'apt_key',
    'kapt_code',
    'match_method',
    'match_score',
    'lawd_cd',
    'dong_name',
    'apt_name',
    'apt_name_norm',
    'gu_name',
    'matched_at',
    'updated_at',
  ].filter(c => mapColSet.has(c));
  if (debug) console.log('[debug][insert columns]', insCols);

  const ph = insCols.map(() => '?').join(', ');
  const updCols = insCols.filter(c => c !== 'apt_key');
  const upd = updCols.map(c => `${c}=VALUES(${c})`).join(', ');
  const sqlUpsert = `INSERT INTO ${mapTable} (${insCols.join(', ')}) VALUES (${ph}) ON DUPLICATE KEY UPDATE ${upd}`;

  let matched = 0;
  let nohit = 0;

  for (const t of targets) {
    const lawd = String(t.lawd_cd || '').trim();
    const dong = String(t.dong_name || '').trim();
    const aptName = String(t.apt_name || '').trim();
    const gu = String(t.gu_name || '').trim();

    const complexes = dimByLawd.get(lawd) || [];
    if (!complexes.length) { nohit++; continue; }

    const nApt = normalizeAptNameKey(aptName);
    let cands = complexes.filter(c => normalizeAptNameKey(c.kapt_name) === nApt);

    // 동 이름을 주소에 포함하는 단지 우선 (kapt_addr가 있으면)
    if (cands.length > 1 && dong) {
      cands = cands.filter(c => String(c.kapt_addr || '').includes(dong)) || cands;
    }

    if (!cands.length) { nohit++; continue; }

    const best = cands[0];
    const score = cands.length === 1 ? 95 : 80;

    const row = {
      apt_key: String(t.apt_key),
      kapt_code: String(best.kapt_code),
      match_method: cands.length === 1 ? 'NAME_LAWD' : 'NAME_LAWD_ADDR',
      match_score: score,
      lawd_cd: lawd,
      dong_name: dong,
      apt_name: aptName,
      apt_name_norm: nApt,
      gu_name: gu,
      matched_at: new Date(),
      updated_at: new Date(),
    };

    const vals = insCols.map(c => row[c] === undefined ? null : row[c]);
    await conn.execute(sqlUpsert, vals);
    matched++;
  }

  await conn.end();
  console.log(`[done] ym=${ym} matched=${matched} nohit=${nohit}`);
})().catch(e => {
  console.error('[fatal]', e);
  process.exit(1);
});
