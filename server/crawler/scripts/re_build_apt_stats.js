// server/crawler/scripts/re_build_apt_stats.js
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
function pad2(n) { return String(n).padStart(2, '0'); }

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
function uniq(arr) { return Array.from(new Set(arr)); }

function pyeongBandToM2Range(bandKey) {
  if (!bandKey || bandKey === 'all') return null;
  const band = Number(bandKey);
  if (!Number.isFinite(band) || band <= 0) return null;
  const m2PerPyeong = 3.305785;
  const lo = band * m2PerPyeong;
  const hi = (band + 10) * m2PerPyeong;
  return { lo, hi };
}

/**
 * ✅ CTE(WITH) 없이 INSERT...SELECT로만 구성 (MySQL/MariaDB 호환성 ↑)
 * 파라미터 순서(중요):
 *  1) periodConst
 *  2) bandConst
 *  3) period filter (month: ym / year: from,to)
 *  4) band filter (lo,hi) optional
 */
function buildInsertStatsSQL({ table, timeframe, bandKey }) {
  const isMonth = timeframe === 'month';
  const periodCol = isMonth ? 'deal_ym' : 'deal_y';
  const periodWhere = isMonth ? `t.deal_ym = ?` : `t.deal_ym BETWEEN ? AND ?`;

  const r = pyeongBandToM2Range(bandKey);
  const bandWhere = r ? `AND t.area_m2 >= ? AND t.area_m2 < ?` : '';

  // NOTE:
  // - base -> ranked(윈도우함수) -> agg(그룹집계) 구조를 파생테이블로만 구성
  // - median은 rn in (floor((cnt+1)/2), floor((cnt+2)/2)) 평균으로 계산
  return `
INSERT INTO ${table} (
  ${periodCol}, pyeong_band,
  sido_code, sido_name, lawd_cd, sigungu_name, gu_name, dong_name, apt_name,
  apt_key,
  tx_count, sum_price,
  avg_price_per_m2, median_price_per_m2, std_price_per_m2,
  avg_price, median_price,
  latest_deal_date, latest_apt_dong, latest_floor, latest_area_m2, latest_deal_amount_man,
  build_year, rgst_date
)
SELECT
  ? AS ${periodCol},
  ? AS pyeong_band,
  a.sido_code, a.sido_name, a.lawd_cd, a.sigungu_name, a.gu_name, a.dong_name, a.apt_name,
  a.apt_key,
  a.tx_count, a.sum_price,
  a.avg_price_per_m2, a.median_price_per_m2, a.std_price_per_m2,
  a.avg_price, a.median_price,
  a.latest_deal_date, a.latest_apt_dong, a.latest_floor, a.latest_area_m2, a.latest_deal_amount_man,
  a.build_year, a.rgst_date
FROM (
  SELECT
    CONCAT(lawd_cd,'|',gu_name,'|',dong_name,'|',apt_name) AS apt_key,

    MAX(sido_code) AS sido_code,
    MAX(sido_name) AS sido_name,
    lawd_cd,
    sigungu_name,
    gu_name,
    dong_name,
    apt_name,

    MAX(cnt) AS tx_count,
    CAST(ROUND(SUM(price_won), 0) AS UNSIGNED) AS sum_price,

    ROUND(AVG(ppm2), 2) AS avg_price_per_m2,
    ROUND(AVG(CASE WHEN rn_ppm2 IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN ppm2 END), 2) AS median_price_per_m2,
    ROUND(STDDEV_SAMP(ppm2), 2) AS std_price_per_m2,

    CAST(ROUND(AVG(price_won), 0) AS UNSIGNED) AS avg_price,
    CAST(ROUND(AVG(CASE WHEN rn_price IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN price_won END), 0) AS UNSIGNED) AS median_price,

    MAX(CASE WHEN rn_latest=1 THEN deal_date END) AS latest_deal_date,
    MAX(CASE WHEN rn_latest=1 THEN apt_dong END) AS latest_apt_dong,
    MAX(CASE WHEN rn_latest=1 THEN floor END) AS latest_floor,
    MAX(CASE WHEN rn_latest=1 THEN area_m2 END) AS latest_area_m2,
    MAX(CASE WHEN rn_latest=1 THEN deal_amount_man END) AS latest_deal_amount_man,
    MAX(CASE WHEN rn_latest=1 THEN build_year END) AS build_year,
    MAX(CASE WHEN rn_latest=1 THEN rgst_date END) AS rgst_date
  FROM (
    SELECT
      base.*,
      ROW_NUMBER() OVER (
        PARTITION BY lawd_cd, sigungu_name, gu_name, dong_name, apt_name
        ORDER BY price_won
      ) AS rn_price,
      ROW_NUMBER() OVER (
        PARTITION BY lawd_cd, sigungu_name, gu_name, dong_name, apt_name
        ORDER BY ppm2
      ) AS rn_ppm2,
      ROW_NUMBER() OVER (
        PARTITION BY lawd_cd, sigungu_name, gu_name, dong_name, apt_name
        ORDER BY deal_date DESC, price_won DESC
      ) AS rn_latest,
      COUNT(*) OVER (
        PARTITION BY lawd_cd, sigungu_name, gu_name, dong_name, apt_name
      ) AS cnt
    FROM (
      SELECT
        LEFT(t.lawd_cd,2) AS sido_code,
        t.sido_name,
        t.lawd_cd,
        t.sigungu_name,
        COALESCE(NULLIF(TRIM(t.gu_name),''), '') AS gu_name,
        t.dong_name,
        t.apt_name,

        t.apt_dong,
        t.floor,
        t.area_m2,
        t.deal_date,
        t.deal_amount_man,
        t.build_year,
        t.rgst_date,

        (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) AS price_won,
        (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) / NULLIF(t.area_m2, 0) AS ppm2
      FROM re_trade_apt t
      WHERE ${periodWhere}
        AND (t.cancel_yn IS NULL OR t.cancel_yn <> 'Y')
        AND t.area_m2 > 0
        AND t.deal_amount_man IS NOT NULL AND t.deal_amount_man > 0
        AND t.apt_name IS NOT NULL AND t.apt_name <> ''
        AND t.dong_name IS NOT NULL AND t.dong_name <> ''
        ${bandWhere}
    ) base
  ) ranked
  GROUP BY lawd_cd, sigungu_name, gu_name, dong_name, apt_name
) a
`;
}

async function ensureTables(conn) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS re_trade_apt_stats_m (
      deal_ym CHAR(6) NOT NULL,
      pyeong_band VARCHAR(10) NOT NULL,

      sido_code CHAR(2) NOT NULL,
      sido_name VARCHAR(20) NOT NULL,
      lawd_cd CHAR(5) NOT NULL,
      sigungu_name VARCHAR(30) NOT NULL,
      gu_name VARCHAR(30) NOT NULL DEFAULT '',
      dong_name VARCHAR(60) NOT NULL,
      apt_name VARCHAR(120) NOT NULL,

      apt_key VARCHAR(255) NOT NULL,

      tx_count INT NOT NULL,
      sum_price BIGINT UNSIGNED NULL,

      avg_price_per_m2 DECIMAL(20,2) NULL,
      median_price_per_m2 DECIMAL(20,2) NULL,
      std_price_per_m2 DECIMAL(20,2) NULL,

      avg_price BIGINT UNSIGNED NULL,
      median_price BIGINT UNSIGNED NULL,

      latest_deal_date DATE NULL,
      latest_apt_dong VARCHAR(30) NULL,
      latest_floor INT NULL,
      latest_area_m2 DECIMAL(10,2) NULL,
      latest_deal_amount_man INT NULL,

      build_year SMALLINT NULL,
      rgst_date DATE NULL,

      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (deal_ym, pyeong_band, apt_key),
      KEY idx_m_period (deal_ym, pyeong_band, sido_code),
      KEY idx_m_area (deal_ym, pyeong_band, lawd_cd, gu_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS re_trade_apt_stats_y (
      deal_y CHAR(4) NOT NULL,
      pyeong_band VARCHAR(10) NOT NULL,

      sido_code CHAR(2) NOT NULL,
      sido_name VARCHAR(20) NOT NULL,
      lawd_cd CHAR(5) NOT NULL,
      sigungu_name VARCHAR(30) NOT NULL,
      gu_name VARCHAR(30) NOT NULL DEFAULT '',
      dong_name VARCHAR(60) NOT NULL,
      apt_name VARCHAR(120) NOT NULL,

      apt_key VARCHAR(255) NOT NULL,

      tx_count INT NOT NULL,
      sum_price BIGINT UNSIGNED NULL,

      avg_price_per_m2 DECIMAL(20,2) NULL,
      median_price_per_m2 DECIMAL(20,2) NULL,
      std_price_per_m2 DECIMAL(20,2) NULL,

      avg_price BIGINT UNSIGNED NULL,
      median_price BIGINT UNSIGNED NULL,

      latest_deal_date DATE NULL,
      latest_apt_dong VARCHAR(30) NULL,
      latest_floor INT NULL,
      latest_area_m2 DECIMAL(10,2) NULL,
      latest_deal_amount_man INT NULL,

      build_year SMALLINT NULL,
      rgst_date DATE NULL,

      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (deal_y, pyeong_band, apt_key),
      KEY idx_y_period (deal_y, pyeong_band, sido_code),
      KEY idx_y_area (deal_y, pyeong_band, lawd_cd, gu_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

(async () => {
  const fromYm = arg('from', '202401');
  const toYm = arg('to', '202401');
  const timeframe = String(arg('timeframe', 'both')).toLowerCase(); // month|year|both
  const bandArg = String(arg('bands', 'all,10,20,30,40,50')).toLowerCase();
  const bands = uniq(bandArg.split(',').map(s => s.trim()).filter(Boolean)).map(x => (x === 'all' ? 'all' : x));

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

  await ensureTables(conn);

  const months = buildYmList(fromYm, toYm);
  const years = uniq(months.map(ym => ym.slice(0, 4)));

  console.log(`[start] from=${fromYm} to=${toYm} timeframe=${timeframe} bands=${bands.join(',')}`);

  if (timeframe === 'month' || timeframe === 'both') {
    for (const ym of months) {
      for (const band of bands) {
        console.log(`[build][month] ym=${ym} band=${band}`);

        await conn.execute(`DELETE FROM re_trade_apt_stats_m WHERE deal_ym=? AND pyeong_band=?`, [ym, band]);

        const sql = buildInsertStatsSQL({ table: 're_trade_apt_stats_m', timeframe: 'month', bandKey: band });

        const params = [];
        // 1) constants
        params.push(ym, band);
        // 2) period filter
        params.push(ym);
        // 3) band filter
        const r = pyeongBandToM2Range(band);
        if (r) params.push(r.lo, r.hi);

        await conn.query(sql, params);
      }
    }
  }

  if (timeframe === 'year' || timeframe === 'both') {
    for (const y of years) {
      const from = `${y}01`;
      const to = `${y}12`;

      for (const band of bands) {
        console.log(`[build][year] y=${y} band=${band}`);

        await conn.execute(`DELETE FROM re_trade_apt_stats_y WHERE deal_y=? AND pyeong_band=?`, [y, band]);

        const sql = buildInsertStatsSQL({ table: 're_trade_apt_stats_y', timeframe: 'year', bandKey: band });

        const params = [];
        // 1) constants
        params.push(y, band);
        // 2) period filter
        params.push(from, to);
        // 3) band filter
        const r = pyeongBandToM2Range(band);
        if (r) params.push(r.lo, r.hi);

        await conn.query(sql, params);
      }
    }
  }

  await conn.end();
  console.log('[done] build apt stats complete');
})().catch(e => {
  console.error('[fatal]', e);
  process.exit(1);
});
