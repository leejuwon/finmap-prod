// server/crawler/scripts/rtms_ingest_apt_dev.js
// - 단건 수집 코어를 ingestAptOnce()로 분리 + export
// - 기존 CLI 실행 방식도 그대로 유지 (require.main === module)

'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

function loadEnv() {
  // 우선순위: DOTENV_PATH(또는 DOTENV) > NODE_ENV 기반 기본값
  const dotenvFromEnv = process.env.DOTENV_PATH || process.env.DOTENV || '';
  let envPath;

  if (dotenvFromEnv) {
    envPath = path.isAbsolute(dotenvFromEnv)
      ? dotenvFromEnv
      : path.resolve(process.cwd(), dotenvFromEnv);
  } else {
    const isProd = process.env.NODE_ENV === 'production';
    envPath = path.resolve(process.cwd(), isProd ? '.env.production' : '.env.local');
  }

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
loadEnv();

const { fetchAll, makeTxHash } = require('../lib/vendors/molitAptTrade');

function arg(name, def) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((v) => v.indexOf(prefix) === 0);
  if (!hit) return def;
  return hit.slice(prefix.length);
}

function trim(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s ? s : null;
}

function pad2(n) {
  const x = String(n || '');
  return x.length === 1 ? `0${x}` : x;
}

function toInt(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[,\s]/g, '').trim();
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function toFloat(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[,\s]/g, '').trim();
  if (!s) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function parseCancelYN(cdealType) {
  const v = trim(cdealType);
  // RTMS: '취소' / '해제' 등 들어올 수 있음. 데이터가 있으면 Y 처리
  return v ? 'Y' : 'N';
}

function parseAnyDateToSqlDate(v) {
  const s = trim(v);
  if (!s) return null;

  // YYYYMMDD
  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4);
    const m = s.slice(4, 6);
    const d = s.slice(6, 8);
    return `${y}-${m}-${d}`;
  }

  // YYYY-MM-DD or YYYY.MM.DD
  const m1 = s.match(/^(\d{4})[.-](\d{1,2})[.-](\d{1,2})$/);
  if (m1) {
    const yy = m1[1];
    const mm = pad2(m1[2]);
    const dd = pad2(m1[3]);
    return `${yy}-${mm}-${dd}`;
  }

  return null;
}

function parseCancelDate(cdealDay) {
  return parseAnyDateToSqlDate(cdealDay);
}

async function getSidoSigungu(conn, lawdCd) {
  const lawd = String(lawdCd || '').trim();
  const [rows] = await conn.execute(
    `
    SELECT sido_name, sigungu_name
    FROM re_legal_dong
    WHERE lawd_cd = ?
    LIMIT 1
  `,
    [lawd]
  );

  if (!rows || !rows.length) {
    return { sido_name: 'UNKNOWN', sigungu_name: 'UNKNOWN' };
  }
  return {
    sido_name: rows[0].sido_name || 'UNKNOWN',
    sigungu_name: rows[0].sigungu_name || 'UNKNOWN',
  };
}

function assertEnv(keys) {
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = process.env[k];
    if (!v) throw new Error(`[env] missing ${k}`);
  }
}

async function createDbConn() {
  assertEnv(['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']);
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  });
}

/**
 * ✅ 단건(특정 ym + lawdCd) 수집/업서트 실행 코어
 *
 * @param {Object} params
 * @param {string} params.ym YYYYMM
 * @param {string} params.lawdCd 5자리 LAWD 코드
 * @param {Object} [params.conn] mysql2 connection (없으면 내부에서 생성/종료)
 * @param {Object} [params.metaOverride] { sido_name, sigungu_name, dong_name } 등 강제 지정(없으면 DB 조회)
 * @returns {Promise<{ym:string, lawdCd:string, items:number, upserted:number, skipped:number, sido_name:string, sigungu_name:string}>}
 */
async function ingestAptOnce(params) {
  params = params || {};

  // 호환: lawd / lawdCd 둘 다 지원
  const ym = String(params.ym || '').trim();
  const lawdCd = String(params.lawdCd || params.lawd || '').trim();

  if (!/^\d{6}$/.test(ym)) throw new Error(`[args] ym must be YYYYMM (got: ${ym})`);
  if (!/^\d{5}$/.test(lawdCd)) throw new Error(`[args] lawdCd must be 5 digits (got: ${lawdCd})`);

  // MOLIT 호출 필수 env
  assertEnv(['MOLIT_SERVICE_KEY', 'MOLIT_APT_TRADE_DETAIL_URL']);

  const metaOverride = params.metaOverride || {};
  const overrideSido = metaOverride.sido_name || metaOverride.sidoName || null;
  const overrideSigungu = metaOverride.sigungu_name || metaOverride.sigunguName || null;

  let conn = params.conn || null;
  let createdConn = false;

  try {
    if (!conn) {
      conn = await createDbConn();
      createdConn = true;
    }

    // 시/군구 메타
    let meta = { sido_name: 'UNKNOWN', sigungu_name: 'UNKNOWN' };
    if (overrideSido && overrideSigungu) {
      meta = { sido_name: overrideSido, sigungu_name: overrideSigungu };
    } else {
      meta = await getSidoSigungu(conn, lawdCd);
      if (overrideSido) meta.sido_name = overrideSido;
      if (overrideSigungu) meta.sigungu_name = overrideSigungu;
    }

    const sidoName = meta.sido_name;
    const sigunguName = meta.sigungu_name;

    const items = await fetchAll({ lawdCd: lawdCd, dealYmd: ym });

    let upserted = 0;
    let skipped = 0;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];

      const dealYear = toInt(it.dealYear);
      const dealMonth = toInt(it.dealMonth);
      const dealDay = toInt(it.dealDay);

      if (!dealYear || !dealMonth || !dealDay) {
        skipped++;
        continue;
      }

      const dealDate = `${dealYear}-${pad2(dealMonth)}-${pad2(dealDay)}`;
      const dealYm = ym;

      const dongName = trim(it.umdNm);
      const aptName = trim(it.aptNm);
      const jibun = trim(it.jibun);

      const excluUseArM2 = toFloat(it.excluUseAr);
      const floor = toInt(it.floor);
      const buildYear = toInt(it.buildYear);
      const dealAmountMan = toInt(it.dealAmount);

      const cancelYN = parseCancelYN(it.cdealType);
      const cancelDate = parseCancelDate(it.cdealDay);

      const reqGbn = trim(it.reqGbn);
      const rdealerLawdCd = trim(it.rdealerLawdCd);

      const aptSeq = trim(it.aptSeq);
      const aptDong = trim(it.aptDong);
      const dealingGbn = trim(it.dealingGbn);
      const slerGbn = trim(it.slerGbn);
      const buyerGbn = trim(it.buyerGbn);
      const rgstDate = parseAnyDateToSqlDate(it.rgstDate);
      const estateAgentSggNm = trim(it.estateAgentSggNm);

      const umdCd = trim(it.umdCd);
      const landCd = trim(it.landCd);
      const landLeaseholdGbn = trim(it.landLeaseholdGbn);

      // 해시(기존 로직 유지: makeTxHash(lawdCd, it))
      const txHash = makeTxHash(lawdCd, it);

      const rawJson = JSON.stringify(it);

      await conn.execute(
        `
        INSERT INTO re_trade_apt (
          tx_hash,
          deal_date,
          deal_ym,
          lawd_cd,
          sido_name,
          sigungu_name,
          dong_name,
          apt_name,
          jibun,
          exclu_use_ar_m2,
          floor,
          build_year,
          deal_amount_man,
          cancel_yn,
          cancel_date,
          req_gbn,
          rdealer_lawd_cd,
          apt_seq,
          apt_dong,
          dealing_gbn,
          sler_gbn,
          buyer_gbn,
          rgst_date,
          estate_agent_sgg_nm,
          umd_cd,
          land_cd,
          land_leasehold_gbn,
          raw_json,
          ingested_at
        ) VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          NOW()
        )
        ON DUPLICATE KEY UPDATE
          raw_json = VALUES(raw_json),
          ingested_at = NOW()
      `,
        [
          txHash,
          dealDate,
          dealYm,
          lawdCd,
          sidoName,
          sigunguName,
          dongName,
          aptName,
          jibun,
          excluUseArM2,
          floor,
          buildYear,
          dealAmountMan,
          cancelYN,
          cancelDate,
          reqGbn,
          rdealerLawdCd,
          aptSeq,
          aptDong,
          dealingGbn,
          slerGbn,
          buyerGbn,
          rgstDate,
          estateAgentSggNm,
          umdCd,
          landCd,
          landLeaseholdGbn,
          rawJson,
        ]
      );

      upserted++;
    }

    return {
      ym: ym,
      lawdCd: lawdCd,
      items: items.length,
      upserted: upserted,
      skipped: skipped,
      sido_name: sidoName,
      sigungu_name: sigunguName,
    };
  } finally {
    if (createdConn && conn) {
      try {
        await conn.end();
      } catch (_) {}
    }
  }
}

// ✅ export
module.exports = {
  ingestAptOnce,
};

// ✅ 기존 CLI 실행 유지
if (require.main === module) {
  (async () => {
    const ym = arg('ym');
    const lawd = arg('lawd');

    if (!ym || !lawd) {
      console.error('Usage: node rtms_ingest_apt_dev.js --ym=YYYYMM --lawd=12345');
      process.exit(1);
    }

    const res = await ingestAptOnce({ ym: ym, lawdCd: lawd });
    console.log(
      `[done] ym=${res.ym} lawd=${res.lawdCd} (${res.sido_name} ${res.sigungu_name}) items=${res.items} upserted=${res.upserted} skipped=${res.skipped}`
    );
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
