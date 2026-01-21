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

function arg(name, defVal) {
  for (const v of process.argv) {
    if (v && v.startsWith(`--${name}=`)) return v.split('=')[1];
  }
  return defVal;
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

// ✅ DATE 컬럼용 'YYYY-MM-DD'
function parseAnyDateToSqlDate(v) {
  if (v == null) return null;
  const t = String(v).trim();
  if (!t) return null;

  // "25.05.17"
  let m = t.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (m) {
    const yy = Number(m[1]);
    const year = yy >= 70 ? 1900 + yy : 2000 + yy;
    return `${year}-${m[2]}-${m[3]}`;
  }

  const digits = t.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }

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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function ymToObj(ym) {
  const y = Number(String(ym).slice(0, 4));
  const m = Number(String(ym).slice(4, 6));
  return { y, m };
}
function objToYm(o) { return `${o.y}${pad2(o.m)}`; }
function addMonth(o) {
  let y = o.y, m = o.m + 1;
  if (m === 13) { y += 1; m = 1; }
  return { y, m };
}
function buildYmList(fromYm, toYm) {
  const from = ymToObj(fromYm);
  const to = ymToObj(toYm);

  const out = [];
  let cur = from;
  while (true) {
    out.push(objToYm(cur));
    if (cur.y === to.y && cur.m === to.m) break;
    cur = addMonth(cur);
  }
  return out;
}

// ✅ re_legal_dong가 비어도 돌아가게 fallback (서울 25개 구)
const SEOUL_GU_FALLBACK = [
  { lawd_cd: '11110', sido_name: '서울특별시', sigungu_name: '종로구' },
  { lawd_cd: '11140', sido_name: '서울특별시', sigungu_name: '중구' },
  { lawd_cd: '11170', sido_name: '서울특별시', sigungu_name: '용산구' },
  { lawd_cd: '11200', sido_name: '서울특별시', sigungu_name: '성동구' },
  { lawd_cd: '11215', sido_name: '서울특별시', sigungu_name: '광진구' },
  { lawd_cd: '11230', sido_name: '서울특별시', sigungu_name: '동대문구' },
  { lawd_cd: '11260', sido_name: '서울특별시', sigungu_name: '중랑구' },
  { lawd_cd: '11290', sido_name: '서울특별시', sigungu_name: '성북구' },
  { lawd_cd: '11305', sido_name: '서울특별시', sigungu_name: '강북구' },
  { lawd_cd: '11320', sido_name: '서울특별시', sigungu_name: '도봉구' },
  { lawd_cd: '11350', sido_name: '서울특별시', sigungu_name: '노원구' },
  { lawd_cd: '11380', sido_name: '서울특별시', sigungu_name: '은평구' },
  { lawd_cd: '11410', sido_name: '서울특별시', sigungu_name: '서대문구' },
  { lawd_cd: '11440', sido_name: '서울특별시', sigungu_name: '마포구' },
  { lawd_cd: '11470', sido_name: '서울특별시', sigungu_name: '양천구' },
  { lawd_cd: '11500', sido_name: '서울특별시', sigungu_name: '강서구' },
  { lawd_cd: '11530', sido_name: '서울특별시', sigungu_name: '구로구' },
  { lawd_cd: '11545', sido_name: '서울특별시', sigungu_name: '금천구' },
  { lawd_cd: '11560', sido_name: '서울특별시', sigungu_name: '영등포구' },
  { lawd_cd: '11590', sido_name: '서울특별시', sigungu_name: '동작구' },
  { lawd_cd: '11620', sido_name: '서울특별시', sigungu_name: '관악구' },
  { lawd_cd: '11650', sido_name: '서울특별시', sigungu_name: '서초구' },
  { lawd_cd: '11680', sido_name: '서울특별시', sigungu_name: '강남구' },
  { lawd_cd: '11710', sido_name: '서울특별시', sigungu_name: '송파구' },
  { lawd_cd: '11740', sido_name: '서울특별시', sigungu_name: '강동구' },
];

async function getSeoulGuList(conn) {
  try {
    const [rows] = await conn.execute(
      `
      SELECT
        LEFT(code10, 5) AS lawd_cd,
        MIN(sido_name) AS sido_name,
        MIN(sigungu_name) AS sigungu_name
      FROM re_legal_dong
      WHERE LEFT(code10, 2) = '11'
      GROUP BY LEFT(code10, 5)
      ORDER BY lawd_cd
      `
    );
    if (rows && rows.length) return rows;
    console.warn('[warn] re_legal_dong returned 0 rows for seoul. Using fallback list.');
    return SEOUL_GU_FALLBACK;
  } catch (e) {
    console.warn(`[warn] failed to read re_legal_dong (${e.message}). Using fallback list.`);
    return SEOUL_GU_FALLBACK;
  }
}

(async () => {
  const fromYm = arg('from', '202510');
  const toYm = arg('to', '202512');

  if (!process.env.MOLIT_SERVICE_KEY) throw new Error('MOLIT_SERVICE_KEY is missing');
  if (!process.env.MOLIT_APT_TRADE_DETAIL_URL) throw new Error('MOLIT_APT_TRADE_DETAIL_URL is missing');

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

  const months = buildYmList(fromYm, toYm);
  const guList = await getSeoulGuList(conn);

  console.log(`[start] months=${months.join(',')} seoul_gu=${guList.length}`);
  console.log(`[db] ${process.env.DB_HOST}:${process.env.DB_PORT || 3306} / ${process.env.DB_NAME}`);

  let totalItems = 0;
  let totalUpserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const ym of months) {
    console.log(`\n[month] ${ym}`);

    for (const g of guList) {
      const lawdCd = String(g.lawd_cd);
      const sidoName = g.sido_name ? String(g.sido_name) : '서울특별시';
      const sigunguName = g.sigungu_name ? String(g.sigungu_name) : '';

      try {
        const items = await fetchAll({ lawdCd, dealYmd: ym });
        totalItems += items.length;

        console.log(`[fetch] ${ym} ${lawdCd} ${sigunguName} items=${items.length}`);

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

          // ✅ 기존 컬럼인데 매핑 안되던 것들
          const aptSeq = trim(it.aptSeq) || null;
          const aptDong = trim(it.aptDong) || null;
          const dealingGbn = trim(it.dealingGbn) || null;
          const slerGbn = trim(it.slerGbn) || null;
          const buyerGbn = trim(it.buyerGbn) || null;
          const rgstDate = parseAnyDateToSqlDate(it.rgstDate);
          const estateAgentSggNm = trim(it.estateAgentSggNm) || null;

          // ✅ 새로 컬럼화
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
          const cancelDate = parseCancelDate(it.cdealDay); // ✅ DATE

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

        totalUpserted += upserted;
        totalSkipped += skipped;

        // 구 단위로 살짝 쉬기
        await sleep(120);
      } catch (err) {
        totalErrors++;
        console.error(`[error] ${ym} ${lawdCd} ${sigunguName} -> ${err.message}`);
        await sleep(400);
      }
    }
  }

  await conn.end();
  console.log(`\n[done] totalItems=${totalItems} totalUpserted=${totalUpserted} totalSkipped=${totalSkipped} totalErrors=${totalErrors}`);
})().catch(e => {
  console.error('[fatal]', e);
  process.exit(1);
});
