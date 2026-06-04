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

const { fetchAll, makeTxHash, fetchPage } = require('../lib/vendors/molitAptTrade');

function arg(name, defVal) {
  for (const v of process.argv) {
    if (v && v.startsWith(`--${name}=`)) return v.split('=')[1];
  }
  return defVal;
}

function pad2(n) { return String(n).padStart(2, '0'); }
function trim(v) { return v == null ? '' : String(v).trim(); }

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
function parseCancelDate(v) { return parseAnyDateToSqlDate(v); }

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

// ✅ 경기도: 구코드(끝이 0 아님)는 "시 코드(앞4 + 0)"로 lawd_cd를 묶어서 저장
function canonicalLawdCd(sidoName, reqLawdCd) {
  const s = String(reqLawdCd);
  if (sidoName === '경기도') {
    return s.endsWith('0') ? s : `${s.slice(0, 4)}0`;
  }
  return s;
}

// ✅ 최신 법정구 목록(유저 제공 기준)
const AREAS = [
  { sido: '서울특별시', sigungu: '종로구', gu: null, lawd: '11110' },
  { sido: '서울특별시', sigungu: '중구', gu: null, lawd: '11140' },
  { sido: '서울특별시', sigungu: '용산구', gu: null, lawd: '11170' },
  { sido: '서울특별시', sigungu: '성동구', gu: null, lawd: '11200' },
  { sido: '서울특별시', sigungu: '광진구', gu: null, lawd: '11215' },
  { sido: '서울특별시', sigungu: '동대문구', gu: null, lawd: '11230' },
  { sido: '서울특별시', sigungu: '중랑구', gu: null, lawd: '11260' },
  { sido: '서울특별시', sigungu: '성북구', gu: null, lawd: '11290' },
  { sido: '서울특별시', sigungu: '강북구', gu: null, lawd: '11305' },
  { sido: '서울특별시', sigungu: '도봉구', gu: null, lawd: '11320' },
  { sido: '서울특별시', sigungu: '노원구', gu: null, lawd: '11350' },
  { sido: '서울특별시', sigungu: '은평구', gu: null, lawd: '11380' },
  { sido: '서울특별시', sigungu: '서대문구', gu: null, lawd: '11410' },
  { sido: '서울특별시', sigungu: '마포구', gu: null, lawd: '11440' },
  { sido: '서울특별시', sigungu: '양천구', gu: null, lawd: '11470' },
  { sido: '서울특별시', sigungu: '강서구', gu: null, lawd: '11500' },
  { sido: '서울특별시', sigungu: '구로구', gu: null, lawd: '11530' },
  { sido: '서울특별시', sigungu: '금천구', gu: null, lawd: '11545' },
  { sido: '서울특별시', sigungu: '영등포구', gu: null, lawd: '11560' },
  { sido: '서울특별시', sigungu: '동작구', gu: null, lawd: '11590' },
  { sido: '서울특별시', sigungu: '관악구', gu: null, lawd: '11620' },
  { sido: '서울특별시', sigungu: '서초구', gu: null, lawd: '11650' },
  { sido: '서울특별시', sigungu: '강남구', gu: null, lawd: '11680' },
  { sido: '서울특별시', sigungu: '송파구', gu: null, lawd: '11710' },
  { sido: '서울특별시', sigungu: '강동구', gu: null, lawd: '11740' },

  { sido: '인천광역시', sigungu: '중구', gu: null, lawd: '28110' },
  { sido: '인천광역시', sigungu: '동구', gu: null, lawd: '28140' },
  { sido: '인천광역시', sigungu: '미추홀구', gu: null, lawd: '28177' },
  { sido: '인천광역시', sigungu: '연수구', gu: null, lawd: '28185' },
  { sido: '인천광역시', sigungu: '남동구', gu: null, lawd: '28200' },
  { sido: '인천광역시', sigungu: '부평구', gu: null, lawd: '28237' },
  { sido: '인천광역시', sigungu: '계양구', gu: null, lawd: '28245' },
  { sido: '인천광역시', sigungu: '서구', gu: null, lawd: '28260' },
  { sido: '인천광역시', sigungu: '강화군', gu: null, lawd: '28710' },
  { sido: '인천광역시', sigungu: '옹진군', gu: null, lawd: '28720' },

  { sido: '경기도', sigungu: '수원시', gu: '장안구', lawd: '41111' },
  { sido: '경기도', sigungu: '수원시', gu: '권선구', lawd: '41113' },
  { sido: '경기도', sigungu: '수원시', gu: '팔달구', lawd: '41115' },
  { sido: '경기도', sigungu: '수원시', gu: '영통구', lawd: '41117' },

  { sido: '경기도', sigungu: '성남시', gu: '수정구', lawd: '41131' },
  { sido: '경기도', sigungu: '성남시', gu: '중원구', lawd: '41133' },
  { sido: '경기도', sigungu: '성남시', gu: '분당구', lawd: '41135' },

  { sido: '경기도', sigungu: '의정부시', gu: null, lawd: '41150' },

  { sido: '경기도', sigungu: '안양시', gu: '만안구', lawd: '41171' },
  { sido: '경기도', sigungu: '안양시', gu: '동안구', lawd: '41173' },

  { sido: '경기도', sigungu: '부천시', gu: '원미구', lawd: '41192' },
  { sido: '경기도', sigungu: '부천시', gu: '소사구', lawd: '41194' },
  { sido: '경기도', sigungu: '부천시', gu: '오정구', lawd: '41196' },

  { sido: '경기도', sigungu: '광명시', gu: null, lawd: '41210' },
  { sido: '경기도', sigungu: '평택시', gu: null, lawd: '41220' },
  { sido: '경기도', sigungu: '동두천시', gu: null, lawd: '41250' },

  { sido: '경기도', sigungu: '안산시', gu: '상록구', lawd: '41271' },
  { sido: '경기도', sigungu: '안산시', gu: '단원구', lawd: '41273' },

  { sido: '경기도', sigungu: '고양시', gu: '덕양구', lawd: '41281' },
  { sido: '경기도', sigungu: '고양시', gu: '일산동구', lawd: '41285' },
  { sido: '경기도', sigungu: '고양시', gu: '일산서구', lawd: '41287' },

  { sido: '경기도', sigungu: '과천시', gu: null, lawd: '41290' },
  { sido: '경기도', sigungu: '구리시', gu: null, lawd: '41310' },
  { sido: '경기도', sigungu: '남양주시', gu: null, lawd: '41360' },
  { sido: '경기도', sigungu: '오산시', gu: null, lawd: '41370' },
  { sido: '경기도', sigungu: '시흥시', gu: null, lawd: '41390' },
  { sido: '경기도', sigungu: '군포시', gu: null, lawd: '41410' },
  { sido: '경기도', sigungu: '의왕시', gu: null, lawd: '41430' },
  { sido: '경기도', sigungu: '하남시', gu: null, lawd: '41450' },

  { sido: '경기도', sigungu: '용인시', gu: '처인구', lawd: '41461' },
  { sido: '경기도', sigungu: '용인시', gu: '기흥구', lawd: '41463' },
  { sido: '경기도', sigungu: '용인시', gu: '수지구', lawd: '41465' },

  { sido: '경기도', sigungu: '파주시', gu: null, lawd: '41480' },
  { sido: '경기도', sigungu: '이천시', gu: null, lawd: '41500' },
  { sido: '경기도', sigungu: '안성시', gu: null, lawd: '41550' },
  { sido: '경기도', sigungu: '김포시', gu: null, lawd: '41570' },
  { sido: '경기도', sigungu: '화성시', gu: '만세구', lawd: '41591' },
  { sido: '경기도', sigungu: '화성시', gu: '효행구', lawd: '41593' },
  { sido: '경기도', sigungu: '화성시', gu: '병점구', lawd: '41595' },
  { sido: '경기도', sigungu: '화성시', gu: '동탄구', lawd: '41597' },
  { sido: '경기도', sigungu: '광주시', gu: null, lawd: '41610' },
  { sido: '경기도', sigungu: '양주시', gu: null, lawd: '41630' },
  { sido: '경기도', sigungu: '포천시', gu: null, lawd: '41650' },
  { sido: '경기도', sigungu: '여주시', gu: null, lawd: '41670' },
  { sido: '경기도', sigungu: '연천군', gu: null, lawd: '41800' },
  { sido: '경기도', sigungu: '가평군', gu: null, lawd: '41820' },
  { sido: '경기도', sigungu: '양평군', gu: null, lawd: '41830' },
];

function parseScope(scope) {
  const s = trim(scope).toLowerCase();
  if (!s || s === 'all') return { seoul: true, incheon: true, gyeonggi: true };
  const parts = s.split(',').map(x => x.trim()).filter(Boolean);
  return {
    seoul: parts.includes('seoul') || parts.includes('11') || parts.includes('서울'),
    incheon: parts.includes('incheon') || parts.includes('28') || parts.includes('인천'),
    gyeonggi: parts.includes('gyeonggi') || parts.includes('41') || parts.includes('경기') || parts.includes('경기도'),
  };
}

function filterAreasByScope(list, scopeObj) {
  return list.filter(a => {
    if (a.sido === '서울특별시') return scopeObj.seoul;
    if (a.sido === '인천광역시') return scopeObj.incheon;
    if (a.sido === '경기도') return scopeObj.gyeonggi;
    return false;
  });
}

(async () => {
  const fromYm = arg('from', '202401');
  const toYm = arg('to', '202401');
  const scope = arg('scope', 'all');
  const lawds = String(arg('lawds', ''))
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
  const publishMonth = String(arg('publishMonth', lawds.length ? '0' : '1')) === '1';
  const throttleMs = Number(arg('throttle', '120'));
  const months = buildYmList(fromYm, toYm);
  const countOnly = String(arg('countOnly', '0')) === '1';

  const debugApiTotal = String(arg('apiTotal', '0')) === '1';

  if (!process.env.MOLIT_SERVICE_KEY) throw new Error('MOLIT_SERVICE_KEY is missing');
  if (!process.env.MOLIT_APT_TRADE_DETAIL_URL) throw new Error('MOLIT_APT_TRADE_DETAIL_URL is missing');

  let conn = null;
  if (!countOnly) {
    ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].forEach(k => {
      if (!process.env[k]) throw new Error(`${k} is missing`);
    });

    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
    });

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS re_trade_deal_ym (
        deal_ym CHAR(6) NOT NULL PRIMARY KEY
      ) ENGINE=InnoDB
    `);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS re_trade_meta (
        id TINYINT NOT NULL PRIMARY KEY,
        min_build_year SMALLINT NULL,
        max_build_year SMALLINT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    await conn.execute(`INSERT IGNORE INTO re_trade_meta (id) VALUES (1)`);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS re_trade_area_dim (
        sido_code CHAR(2) NOT NULL,
        lawd_cd CHAR(5) NOT NULL,
        sigungu_name VARCHAR(30) NOT NULL,
        gu_name VARCHAR(30) NOT NULL DEFAULT '',
        PRIMARY KEY (sido_code, lawd_cd, gu_name),
        KEY idx_area_sido (sido_code, sigungu_name, gu_name)
      ) ENGINE=InnoDB
    `);
  }

  const sqlInsYm = `INSERT IGNORE INTO re_trade_deal_ym (deal_ym) VALUES (?)`;
  const sqlInsArea = `INSERT IGNORE INTO re_trade_area_dim (sido_code, lawd_cd, sigungu_name, gu_name) VALUES (?,?,?,?)`;

  const scopeObj = parseScope(scope);
  const scopedAreas = filterAreasByScope(AREAS, scopeObj);
  const areas = lawds.length
    ? scopedAreas.filter(a => lawds.includes(String(a.lawd)))
    : scopedAreas;
  if (!areas.length) throw new Error(`No areas matched scope=${scope} lawds=${lawds.join(',') || '(all)'}`);

  console.log(`[start] mode=${countOnly ? 'countOnly' : 'upsert'} scope=${scope} lawds=${lawds.join(',') || 'all'} publishMonth=${publishMonth ? '1' : '0'} months=${months.join(',')} areas=${areas.length}`);
  if (countOnly) {
    console.log('[db] skipped in countOnly mode');
  } else {
    console.log('[db] connected');
  }

  let totalFetch = 0;
  let totalItems = 0;
  let totalUpserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const sidoSummary = {};

  let minBuildSeen = null;
  let maxBuildSeen = null;

  for (const ym of months) {
    const monthUpsertedBefore = totalUpserted;
    console.log(`\n[month] ${ym}`);

    for (const a of areas) {
      const reqLawdCd = String(a.lawd);
      const storeLawdCd = canonicalLawdCd(a.sido, reqLawdCd);

      const sidoName = a.sido;
      const sigunguName = a.sigungu;
      const guName = a.gu ? String(a.gu).trim() : '';

      // ✅ 드롭다운/필터용 area_dim은 항상 upsert
      const sidoCode = String(storeLawdCd).slice(0, 2);
      const summary = sidoSummary[sidoCode] || {
        sidoCode,
        sidoName,
        fetches: 0,
        items: 0,
        zeroAreas: 0,
        errors: 0,
      };
      sidoSummary[sidoCode] = summary;

      if (conn) {
        await conn.execute(sqlInsArea, [sidoCode, storeLawdCd, sigunguName, '']);
        if (guName) await conn.execute(sqlInsArea, [sidoCode, storeLawdCd, sigunguName, guName]);
      }

      try {
        totalFetch++;
        summary.fetches++;

        if (debugApiTotal) {
          const r = await fetchPage({ lawdCd: reqLawdCd, dealYmd: ym, pageNo: 1, numOfRows: 1 });
          console.log(`[api] ${ym} ${sidoName} ${sigunguName}${guName ? ' ' + guName : ''} req=${reqLawdCd} totalCount=${r.totalCount}`);
        }

        const items = await fetchAll({ lawdCd: reqLawdCd, dealYmd: ym });
        totalItems += items.length;
        summary.items += items.length;
        if (items.length === 0) summary.zeroAreas++;

        const guLabel = guName ? guName : (a.sido === '경기도' ? '전체' : '');
        console.log(`[fetch] ${ym} ${sidoName} ${sigunguName}${guLabel ? ' ' + guLabel : ''} req=${reqLawdCd} store=${storeLawdCd} items=${items.length}`);

        if (countOnly) {
          await sleep(throttleMs);
          continue;
        }

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

          if (buildYear != null) {
            if (minBuildSeen == null || buildYear < minBuildSeen) minBuildSeen = buildYear;
            if (maxBuildSeen == null || buildYear > maxBuildSeen) maxBuildSeen = buildYear;
          }

          if (!aptName || areaM2 == null || areaM2 <= 0 || dealAmountMan == null || dealAmountMan <= 0) {
            skipped++;
            continue;
          }

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

          const txHash = makeTxHash(reqLawdCd, it);
          const rawJson = null;

          await conn.execute(
            `
            INSERT INTO re_trade_apt (
              tx_hash, lawd_cd, req_lawd_cd, deal_ym, deal_date,
              sido_name, sigungu_name, gu_name, dong_name, jibun,
              apt_name, area_m2, floor, build_year, deal_amount_man,

              apt_seq, apt_dong, dealing_gbn, sler_gbn, buyer_gbn, rgst_date, estate_agent_sgg_nm,
              umd_cd, land_cd, land_leasehold_gbn,
              bonbun, bubun,
              road_nm, road_nm_cd, road_nm_seq, road_nmb_cd, road_nm_sgg_cd, road_nm_bonbun, road_nm_bubun,

              cancel_yn, cancel_date, raw_json, ingested_at
            ) VALUES (
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?,

              ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?,
              ?, ?,
              ?, ?, ?, ?, ?, ?, ?,

              ?, ?, ?, NOW()
            )
            ON DUPLICATE KEY UPDATE
              lawd_cd = VALUES(lawd_cd),
              req_lawd_cd = VALUES(req_lawd_cd),
              deal_date = VALUES(deal_date),
              sido_name = VALUES(sido_name),
              sigungu_name = VALUES(sigungu_name),
              gu_name = VALUES(gu_name),
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
              txHash, storeLawdCd, reqLawdCd, ym, dealDate,
              sidoName, sigunguName, guName, dongName, jibun,
              aptName, areaM2, floor, buildYear, dealAmountMan,

              aptSeq, aptDong, dealingGbn, slerGbn, buyerGbn, rgstDate, estateAgentSggNm,
              umdCd, landCd, landLeaseholdGbn,
              bonbun, bubun,
              roadNm, roadNmCd, roadNmSeq, roadNmbCd, roadNmSggCd, roadNmBonbun, roadNmBubun,

              cancelYN, cancelDate, rawJson,
            ]
          );

          upserted++;
        }

        totalUpserted += upserted;
        totalSkipped += skipped;

        await sleep(throttleMs);
      } catch (err) {
        totalErrors++;
        summary.errors++;
        console.error(`[error] ym=${ym} ${sidoName} ${sigunguName} req=${reqLawdCd} -> ${err.message}`);
        await sleep(Math.max(400, throttleMs));
      }
    }

    if (conn) {
      const monthRows = totalUpserted - monthUpsertedBefore;
      if (monthRows > 0 && publishMonth) {
        await conn.execute(sqlInsYm, [ym]);
      } else if (monthRows > 0) {
        console.warn(`[month:partial] ym=${ym} was not added to re_trade_deal_ym; use --publishMonth=1 only after full-month verification`);
      } else {
        console.warn(`[month:empty] ym=${ym} was not added to re_trade_deal_ym because no rows were upserted`);
      }
    }
  }

  if (conn && (minBuildSeen != null || maxBuildSeen != null)) {
    await conn.execute(
      `
      UPDATE re_trade_meta
      SET
        min_build_year = IF(min_build_year IS NULL OR ? < min_build_year, ?, min_build_year),
        max_build_year = IF(max_build_year IS NULL OR ? > max_build_year, ?, max_build_year)
      WHERE id=1
      `,
      [minBuildSeen ?? 9999, minBuildSeen ?? 9999, maxBuildSeen ?? 0, maxBuildSeen ?? 0]
    );
  }

  for (const code of Object.keys(sidoSummary).sort()) {
    const s = sidoSummary[code];
    console.log(`[sido:summary] code=${s.sidoCode} name=${s.sidoName} fetches=${s.fetches} items=${s.items} zeroAreas=${s.zeroAreas} errors=${s.errors}`);
  }

  if (conn) await conn.end();
  console.log(`\n[done] mode=${countOnly ? 'countOnly' : 'upsert'} fetch=${totalFetch} totalItems=${totalItems} totalUpserted=${totalUpserted} totalSkipped=${totalSkipped} totalErrors=${totalErrors}`);
})().catch(e => {
  console.error('[fatal]', e);
  process.exit(1);
});
