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

function parseAnyDateToSqlDate(v) {
  if (v == null) return null;
  const t = String(v).trim();
  if (!t) return null;

  let m = t.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (m) {
    const yy = Number(m[1]);
    const year = yy >= 70 ? 1900 + yy : 2000 + yy;
    return `${year}-${m[2]}-${m[3]}`;
  }

  const digits = t.replace(/\D/g, '');
  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
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

function normalizeSigunguName(name) {
  const t = trim(name);
  if (!t) return '';
  // "수원시 장안구" -> "수원시"
  return t.split(' ')[0];
}

// ✅ re_legal_dong가 비어도 돌아가게 fallback (경기도: 구코드 포함)
const GYEONGGI_FALLBACK = [
  // 인천시(구)
  { req_lawd_cd: '41011', sido_name: '경기도', sigungu_name: '인천시' },
  { req_lawd_cd: '41012', sido_name: '경기도', sigungu_name: '인천시' },
  { req_lawd_cd: '41013', sido_name: '경기도', sigungu_name: '인천시' },
  { req_lawd_cd: '41014', sido_name: '경기도', sigungu_name: '인천시' },

  // 수원시(구)
  { req_lawd_cd: '41111', sido_name: '경기도', sigungu_name: '수원시' },
  { req_lawd_cd: '41113', sido_name: '경기도', sigungu_name: '수원시' },
  { req_lawd_cd: '41115', sido_name: '경기도', sigungu_name: '수원시' },
  { req_lawd_cd: '41117', sido_name: '경기도', sigungu_name: '수원시' },

  // 성남시(구)
  { req_lawd_cd: '41131', sido_name: '경기도', sigungu_name: '성남시' },
  { req_lawd_cd: '41133', sido_name: '경기도', sigungu_name: '성남시' },
  { req_lawd_cd: '41135', sido_name: '경기도', sigungu_name: '성남시' },

  // 안양시(구)
  { req_lawd_cd: '41171', sido_name: '경기도', sigungu_name: '안양시' },
  { req_lawd_cd: '41173', sido_name: '경기도', sigungu_name: '안양시' },

  // 안산시(구)
  { req_lawd_cd: '41271', sido_name: '경기도', sigungu_name: '안산시' },
  { req_lawd_cd: '41273', sido_name: '경기도', sigungu_name: '안산시' },

  // 고양시(구)
  { req_lawd_cd: '41281', sido_name: '경기도', sigungu_name: '고양시' },
  { req_lawd_cd: '41285', sido_name: '경기도', sigungu_name: '고양시' },
  { req_lawd_cd: '41287', sido_name: '경기도', sigungu_name: '고양시' },

  // 용인시(구)
  { req_lawd_cd: '41461', sido_name: '경기도', sigungu_name: '용인시' },
  { req_lawd_cd: '41463', sido_name: '경기도', sigungu_name: '용인시' },
  { req_lawd_cd: '41465', sido_name: '경기도', sigungu_name: '용인시' },

  // 부천(시 코드 OK)
  { req_lawd_cd: '41191', sido_name: '경기도', sigungu_name: '부천시' },
  { req_lawd_cd: '41192', sido_name: '경기도', sigungu_name: '부천시' },
  { req_lawd_cd: '41193', sido_name: '경기도', sigungu_name: '부천시' },
  { req_lawd_cd: '41194', sido_name: '경기도', sigungu_name: '부천시' },
  { req_lawd_cd: '41195', sido_name: '경기도', sigungu_name: '부천시' },
  { req_lawd_cd: '41196', sido_name: '경기도', sigungu_name: '부천시' },
  { req_lawd_cd: '41197', sido_name: '경기도', sigungu_name: '부천시' },
  { req_lawd_cd: '41199', sido_name: '경기도', sigungu_name: '부천시' },

  // 나머지 시/군(기존 시 코드)
  { req_lawd_cd: '41150', sido_name: '경기도', sigungu_name: '의정부시' },
  { req_lawd_cd: '41210', sido_name: '경기도', sigungu_name: '광명시' },
  { req_lawd_cd: '41220', sido_name: '경기도', sigungu_name: '평택시' },
  { req_lawd_cd: '41250', sido_name: '경기도', sigungu_name: '동두천시' },
  { req_lawd_cd: '41290', sido_name: '경기도', sigungu_name: '과천시' },
  { req_lawd_cd: '41310', sido_name: '경기도', sigungu_name: '구리시' },
  { req_lawd_cd: '41360', sido_name: '경기도', sigungu_name: '남양주시' },
  { req_lawd_cd: '41370', sido_name: '경기도', sigungu_name: '오산시' },
  { req_lawd_cd: '41390', sido_name: '경기도', sigungu_name: '시흥시' },
  { req_lawd_cd: '41410', sido_name: '경기도', sigungu_name: '군포시' },
  { req_lawd_cd: '41430', sido_name: '경기도', sigungu_name: '의왕시' },
  { req_lawd_cd: '41450', sido_name: '경기도', sigungu_name: '하남시' },
  { req_lawd_cd: '41480', sido_name: '경기도', sigungu_name: '파주시' },
  { req_lawd_cd: '41500', sido_name: '경기도', sigungu_name: '이천시' },
  { req_lawd_cd: '41550', sido_name: '경기도', sigungu_name: '안성시' },
  { req_lawd_cd: '41570', sido_name: '경기도', sigungu_name: '김포시' },
  { req_lawd_cd: '41590', sido_name: '경기도', sigungu_name: '화성시' },
  { req_lawd_cd: '41610', sido_name: '경기도', sigungu_name: '광주시' },
  { req_lawd_cd: '41630', sido_name: '경기도', sigungu_name: '양주시' },
  { req_lawd_cd: '41650', sido_name: '경기도', sigungu_name: '포천시' },
  { req_lawd_cd: '41670', sido_name: '경기도', sigungu_name: '여주시' },
  { req_lawd_cd: '41800', sido_name: '경기도', sigungu_name: '연천군' },
  { req_lawd_cd: '41820', sido_name: '경기도', sigungu_name: '가평군' },
  { req_lawd_cd: '41830', sido_name: '경기도', sigungu_name: '양평군' },
];

function toStoreLawdCd(reqLawdCd) {
  // 구코드(마지막 자리 !=0)는 시코드(앞4자리 + 0)로 저장
  const s = String(reqLawdCd);
  return s.endsWith('0') ? s : `${s.slice(0, 4)}0`;
}

async function getGyeonggiList(conn) {
  try {
    const [rows] = await conn.execute(
      `
      SELECT
        LEFT(code10, 5) AS req_lawd_cd,
        MIN(sido_name) AS sido_name,
        MIN(sigungu_name) AS sigungu_name
      FROM re_legal_dong
      WHERE LEFT(code10, 2) = '41'
      GROUP BY LEFT(code10, 5)
      ORDER BY req_lawd_cd
      `
    );
    if (rows && rows.length) {
      // sigungu_name이 "수원시 장안구" 같은 형식이면 "수원시"로 정규화
      return rows.map(r => ({
        req_lawd_cd: String(r.req_lawd_cd),
        sido_name: r.sido_name ? String(r.sido_name) : '경기도',
        sigungu_name: normalizeSigunguName(r.sigungu_name) || '경기도',
      }));
    }
    console.warn('[warn] re_legal_dong returned 0 rows for gyeonggi. Using fallback list.');
    return GYEONGGI_FALLBACK;
  } catch (e) {
    console.warn(`[warn] failed to read re_legal_dong (${e.message}). Using fallback list.`);
    return GYEONGGI_FALLBACK;
  }
}

(async () => {
  const fromYm = arg('from', '202001');
  const toYm = arg('to', '202012');

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
  const list = await getGyeonggiList(conn);

  console.log(`[start] months=${months.join(',')} gyeonggi_req_codes=${list.length}`);
  console.log(`[db] ${process.env.DB_HOST}:${process.env.DB_PORT || 3306} / ${process.env.DB_NAME}`);

  let totalItems = 0;
  let totalUpserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const ym of months) {
    console.log(`\n[month] ${ym}`);

    for (const g of list) {
      const reqLawdCd = String(g.req_lawd_cd);
      const storeLawdCd = toStoreLawdCd(reqLawdCd);

      const sidoName = g.sido_name ? String(g.sido_name) : '경기도';
      const sigunguName = g.sigungu_name ? String(g.sigungu_name) : '';

      try {
        const items = await fetchAll({ lawdCd: reqLawdCd, dealYmd: ym });
        totalItems += items.length;

        console.log(`[fetch] ${ym} req=${reqLawdCd} store=${storeLawdCd} ${sigunguName} items=${items.length}`);

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

          const aptSeq = trim(it.aptSeq) || null;
          const aptDong = trim(it.aptDong) || null;
          const dealingGbn = trim(it.dealingGbn) || null;
          const slerGbn = trim(it.slerGbn) || null;
          const buyerGbn = trim(it.buyerGbn) || null;
          const rgstDate = parseAnyDateToSqlDate(it.rgstDate);
          const estateAgentSggNm = trim(it.estateAgentSggNm) || null;

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
          const cancelDate = parseCancelDate(it.cdealDay);

          // ✅ txHash는 "요청 코드" 기준으로 생성(중복/충돌 방지)
          const txHash = makeTxHash(reqLawdCd, it);

          // ✅ raw_json에 메타 추가(추후 검증에 유리)
          const raw = { ...it, _meta: { reqLawdCd, storeLawdCd, sigunguName } };

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
              txHash, storeLawdCd, ym, dealDate,
              sidoName, sigunguName, dongName, jibun,
              aptName, areaM2, floor, buildYear, dealAmountMan,

              aptSeq, aptDong, dealingGbn, slerGbn, buyerGbn, rgstDate, estateAgentSggNm,
              umdCd, landCd, landLeaseholdGbn,
              bonbun, bubun,
              roadNm, roadNmCd, roadNmSeq, roadNmbCd, roadNmSggCd, roadNmBonbun, roadNmBubun,

              cancelYN, cancelDate, JSON.stringify(raw),
            ]
          );

          upserted++;
        }

        totalUpserted += upserted;
        totalSkipped += skipped;

        await sleep(120);
      } catch (err) {
        totalErrors++;
        console.error(`[error] ym=${ym} req=${reqLawdCd} store=${storeLawdCd} ${sigunguName} -> ${err.message}`);
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
