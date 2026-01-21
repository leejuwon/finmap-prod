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

const { fetchAll, makeTxHash } = require('../lib/vendors/molitAptTrade');

function arg(name, defVal = null) {
  const hit = process.argv.find(v => v.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : defVal;
}

function pad2(n) { return String(n).padStart(2, '0'); }

function toInt(v) {
  if (v == null) return null;
  const s = String(v).replace(/,/g, '').trim();
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toFloat(v) {
  if (v == null) return null;
  const s = String(v).replace(/,/g, '').trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function trim(v) { return v == null ? '' : String(v).trim(); }

function parseCancelYN(v) {
  const t = trim(v).toUpperCase();
  return (t === 'O' || t === 'Y' || t === '1') ? 'Y' : null;
}

// ✅ DATE 컬럼에 바로 넣을 수 있게 'YYYY-MM-DD'로 변환
function parseAnyDateToSqlDate(v) {
  if (v == null) return null;
  const t = String(v).trim();
  if (!t) return null;

  // "25.05.17" (YY.MM.DD)
  let m = t.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (m) {
    const yy = Number(m[1]);
    const year = yy >= 70 ? 1900 + yy : 2000 + yy;
    return `${year}-${m[2]}-${m[3]}`;
  }

  // "20250517" or "2025-05-17" or "2025.05.17" etc
  const digits = t.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }

  // "250517" (YYMMDD)
  if (digits.length === 6) {
    const yy = Number(digits.slice(0, 2));
    const year = yy >= 70 ? 1900 + yy : 2000 + yy;
    return `${year}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
  }

  return null;
}

function parseCancelDate(v) {
  return parseAnyDateToSqlDate(v);
}

async function getSidoSigungu(conn, lawdCd) {
  try {
    const [rows] = await conn.execute(
      `SELECT sido_name, sigungu_name
         FROM re_legal_dong
        WHERE LEFT(code10, 5) = ?
        LIMIT 1`,
      [lawdCd]
    );
    if (rows.length) return rows[0];
  } catch (e) {}
  return { sido_name: 'UNKNOWN', sigungu_name: 'UNKNOWN' };
}

(async () => {
  const ym = arg('ym');       // YYYYMM
  const lawdCd = arg('lawd'); // 5자리
  if (!ym || !lawdCd) {
    console.error('usage: node server/crawler/scripts/rtms_ingest_apt_dev.js --ym=YYYYMM --lawd=LAWD_CD(5자리)');
    process.exit(1);
  }

  // ✅ 필수 env 체크
  if (!process.env.MOLIT_SERVICE_KEY) throw new Error('MOLIT_SERVICE_KEY is missing');
  if (!process.env.MOLIT_APT_TRADE_DETAIL_URL) throw new Error('MOLIT_APT_TRADE_DETAIL_URL is missing (Dev full URL required)');

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

  const { sido_name: sidoName, sigungu_name: sigunguName } = await getSidoSigungu(conn, lawdCd);

  const items = await fetchAll({ lawdCd, dealYmd: ym });
  console.log(`[ingest] ym=${ym} lawd=${lawdCd} items=${items.length}`);

  let upserted = 0;
  let skipped = 0;

  for (const it of items) {
    const year = toInt(it.dealYear);
    const month = toInt(it.dealMonth);
    const day = toInt(it.dealDay);
    if (!year || !month || !day) { skipped++; continue; }

    const dealDate = `${year}-${pad2(month)}-${pad2(day)}`;

    const dongName = trim(it.umdNm) || null;
    const aptName = trim(it.aptNm);
    const jibun = trim(it.jibun) || null;

    const areaM2 = toFloat(it.excluUseAr || it.exclUseAr);
    const floor = toInt(it.floor);
    const buildYear = toInt(it.buildYear);
    const dealAmountMan = toInt(it.dealAmount);

    if (!aptName || !areaM2 || !dealAmountMan) { skipped++; continue; }

    // ✅ 이미 컬럼은 있는데 매핑이 안되던 것들
    const aptSeq = trim(it.aptSeq) || null;
    const aptDong = trim(it.aptDong) || null;
    const dealingGbn = trim(it.dealingGbn) || null;
    const slerGbn = trim(it.slerGbn) || null;
    const buyerGbn = trim(it.buyerGbn) || null;
    const rgstDate = parseAnyDateToSqlDate(it.rgstDate);
    const estateAgentSggNm = trim(it.estateAgentSggNm) || null;

    // ✅ 새로 컬럼화할 것들(테이블에 없으면 ALTER로 추가 필요)
    const umdCd = trim(it.umdCd) || null;
    const landCd = trim(it.landCd) || null;
    const landLeaseholdGbn = trim(it.landLeaseholdGbn) || null;

    const bonbun = trim(it.bonbun) || null;
    const bubun = trim(it.bubun) || null;

    const roadNm = trim(it.roadNm) || null;
    const roadNmCd = trim(it.roadNmCd) || null;
    const roadNmSeq = trim(it.roadNmSeq) || null;
    const roadNmbCd = trim(it.roadNmbCd) || null;
    const roadNmSggCd = trim(it.roadNmSggCd) || null;
    const roadNmBonbun = trim(it.roadNmBonbun) || null;
    const roadNmBubun = trim(it.roadNmBubun) || null;

    const cancelYN = parseCancelYN(it.cdealType);
    const cancelDate = parseCancelDate(it.cdealDay); // ✅ DATE('YYYY-MM-DD')

    const txHash = makeTxHash(lawdCd, it);

    await conn.execute(
      `
      INSERT INTO re_trade_apt (
        tx_hash, lawd_cd, deal_ym, deal_date,
        sido_name, sigungu_name, dong_name, jibun,
        apt_name, area_m2, floor, build_year, deal_amount_man,

        apt_seq, apt_dong, dealing_gbn, sler_gbn, buyer_gbn, rgst_date, estate_agent_sgg_nm,
        umd_cd, land_cd, land_leasehold_gbn,
        bonbun, bubun,
        road_nm, road_nm_cd, road_nm_seq, road_nmb_cd, road_nm_sgg_cd, road_nm_bonbun, road_nm_bubun,

        cancel_yn, cancel_date, raw_json, ingested_at
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,

        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?, ?, ?,

        ?, ?, ?, NOW()
      )
      ON DUPLICATE KEY UPDATE
        deal_date = VALUES(deal_date),
        dong_name = VALUES(dong_name),
        jibun = VALUES(jibun),
        apt_name = VALUES(apt_name),
        area_m2 = VALUES(area_m2),
        floor = VALUES(floor),
        build_year = VALUES(build_year),
        deal_amount_man = VALUES(deal_amount_man),

        apt_seq = VALUES(apt_seq),
        apt_dong = VALUES(apt_dong),
        dealing_gbn = VALUES(dealing_gbn),
        sler_gbn = VALUES(sler_gbn),
        buyer_gbn = VALUES(buyer_gbn),
        rgst_date = VALUES(rgst_date),
        estate_agent_sgg_nm = VALUES(estate_agent_sgg_nm),

        umd_cd = VALUES(umd_cd),
        land_cd = VALUES(land_cd),
        land_leasehold_gbn = VALUES(land_leasehold_gbn),
        bonbun = VALUES(bonbun),
        bubun = VALUES(bubun),

        road_nm = VALUES(road_nm),
        road_nm_cd = VALUES(road_nm_cd),
        road_nm_seq = VALUES(road_nm_seq),
        road_nmb_cd = VALUES(road_nmb_cd),
        road_nm_sgg_cd = VALUES(road_nm_sgg_cd),
        road_nm_bonbun = VALUES(road_nm_bonbun),
        road_nm_bubun = VALUES(road_nm_bubun),

        cancel_yn = VALUES(cancel_yn),
        cancel_date = VALUES(cancel_date),
        raw_json = VALUES(raw_json),
        ingested_at = NOW()
      `,
      [
        txHash, lawdCd, ym, dealDate,
        sidoName, sigunguName, dongName, jibun,
        aptName, areaM2, floor, buildYear, dealAmountMan,

        aptSeq, aptDong, dealingGbn, slerGbn, buyerGbn, rgstDate, estateAgentSggNm,
        umdCd, landCd, landLeaseholdGbn,
        bonbun, bubun,
        roadNm, roadNmCd, roadNmSeq, roadNmbCd, roadNmSggCd, roadNmBonbun, roadNmBubun,

        cancelYN, cancelDate, JSON.stringify(it),
      ]
    );

    upserted++;
  }

  await conn.end();
  console.log(`[done] upserted=${upserted}, skipped=${skipped}`);
})().catch(e => {
  console.error('[fatal]', e);
  process.exit(1);
});
