/**
 * server/crawler/scripts/re_build_stats_ranks.js
 * - 월/연 통계(stat) 생성 + TopN 랭킹(rank) 생성
 * - level=dong(서울) / sigungu(경기/인천/서울 구단위 등)
 *
 * 예)
 *  node server/crawler/scripts/re_build_stats_ranks.js --sido=41 --level=sigungu --from=202101 --to=202312 --top=100 --timeframe=both --only=all
 *  node server/crawler/scripts/re_build_stats_ranks.js --sido=28 --level=sigungu --from=202101 --to=202312 --top=100 --timeframe=both --only=all
 *  node server/crawler/scripts/re_build_stats_ranks.js --sido=11 --level=dong    --from=202101 --to=202312 --top=100 --timeframe=both --only=all
 */
'use strict';

require('dotenv').config({ path: process.env.DOTENV || '.env.local' });
const mysql = require('mysql2/promise');

function getArg(name, def) {
  const hit = process.argv.find((a) => a && a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : def;
}

function yyyymmToInt(x) { return Number(x); }

function addMonth(yyyymm) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  return `${ny}${String(nm).padStart(2, '0')}`;
}

function prevMonth(yyyymm) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const py = m === 1 ? y - 1 : y;
  const pm = m === 1 ? 12 : m - 1;
  return `${py}${String(pm).padStart(2, '0')}`;
}

function monthRange(fromYm, toYm) {
  const out = [];
  let cur = fromYm;
  while (yyyymmToInt(cur) <= yyyymmToInt(toYm)) {
    out.push(cur);
    cur = addMonth(cur);
  }
  return out;
}

function yearSetFromMonths(months) {
  const s = new Set();
  months.forEach((ym) => s.add(ym.slice(0, 4)));
  return Array.from(s).sort();
}

const METRICS = [
  { key: 'median_price_per_m2', label: '중위(㎡당)' },
  { key: 'avg_price_per_m2',    label: '평균(㎡당)' },
  { key: 'median_price',        label: '중위(총액)' },
  { key: 'avg_price',           label: '평균(총액)' },
  { key: 'tx_count',            label: '거래량' },
];

function statTable(level, timeframe) {
  if (timeframe === 'month') return level === 'dong' ? 're_stat_month_dong' : 're_stat_month_sigungu';
  return level === 'dong' ? 're_stat_year_dong' : 're_stat_year_sigungu';
}

function rankTable(level, timeframe) {
  if (timeframe === 'month') return level === 'dong' ? 're_rank_month_dong' : 're_rank_month_sigungu';
  return level === 'dong' ? 're_rank_year_dong' : 're_rank_year_sigungu';
}

// 공통 WHERE (취소 제외 + 면적/금액 기본 검증)
function commonBaseWhere(alias) {
  const a = alias || 't';
  return `
    ( ${a}.cancel_yn IS NULL OR ${a}.cancel_yn <> 'Y' )
    AND ${a}.area_m2 > 0
    AND ${a}.deal_amount_man IS NOT NULL
    AND ${a}.deal_amount_man > 0
  `;
}

async function buildMonthStat(pool, opt) {
  const sido = String(opt.sido);
  const level = opt.level;
  const ym = opt.ym;

  const isDong = level === 'dong';
  const outTable = statTable(level, 'month');

  // ✅ 경기(41)는 "수원시 장안구(41111)..." 같은 구 단위를 "수원시(41110)"로 롤업해서 시 단위 통계 생성
  const isGyeonggi = (sido === '41');
  const rollupCity = (!isDong && isGyeonggi);

  const cityCodeExpr = `
    CASE
      WHEN LEFT(t.lawd_cd, 2) = '41' AND RIGHT(t.lawd_cd, 2) <> '00'
        THEN CONCAT(LEFT(t.lawd_cd, 4), '0')
      ELSE t.lawd_cd
    END
  `;

  const lawdExpr = isDong
    ? 't.lawd_cd'
    : (rollupCity ? cityCodeExpr : 't.lawd_cd');

  const joinSigungu = isDong
    ? ''
    : `LEFT JOIN re_sigungu s ON s.lawd_cd = (${lawdExpr})`;

  const nameExpr = isDong
    ? 't.dong_name'
    : `COALESCE(s.sigungu_name, t.sigungu_name, (${lawdExpr}))`;

  // ✅ GROUP BY는 SELECT에 존재하는 alias(area_name) 기준
  const groupCols = `lawd_cd, area_name, deal_ym`;

  const sql = `
    INSERT INTO ${outTable}
    (${isDong ? 'lawd_cd, dong_name,' : 'lawd_cd, sigungu_name,'} deal_ym, tx_count,
     median_price_per_m2, avg_price_per_m2, median_price, avg_price)
    WITH base AS (
      SELECT
        (${lawdExpr}) AS lawd_cd,
        (${nameExpr}) AS area_name,
        t.deal_ym,
        (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) AS price_won,
        (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) / NULLIF(t.area_m2, 0) AS ppm2
      FROM re_trade_apt t
      ${joinSigungu}
      WHERE t.deal_ym = ?
        AND t.lawd_cd LIKE CONCAT(?, '%')
        AND ${commonBaseWhere('t')}
        ${isDong ? "AND t.dong_name IS NOT NULL AND t.dong_name <> ''" : ""}
    ),
    ranked AS (
      SELECT
        lawd_cd, area_name, deal_ym, price_won, ppm2,
        ROW_NUMBER() OVER (PARTITION BY lawd_cd, area_name, deal_ym ORDER BY ppm2)      AS rn_ppm2,
        ROW_NUMBER() OVER (PARTITION BY lawd_cd, area_name, deal_ym ORDER BY price_won) AS rn_price,
        COUNT(*)    OVER (PARTITION BY lawd_cd, area_name, deal_ym) AS cnt
      FROM base
    )
    SELECT
      lawd_cd,
      area_name,
      deal_ym,
      MAX(cnt) AS tx_count,
      ROUND(AVG(CASE WHEN rn_ppm2  IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN ppm2 END), 2) AS median_price_per_m2,
      ROUND(AVG(ppm2), 2) AS avg_price_per_m2,

      -- ✅ BIGINT 컬럼: ROUND + CAST 만 (clamp 제거)
      CAST(ROUND(AVG(CASE WHEN rn_price IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN price_won END), 0) AS SIGNED) AS median_price,
      CAST(ROUND(AVG(price_won), 0) AS SIGNED) AS avg_price
    FROM ranked
    GROUP BY ${groupCols}
    ON DUPLICATE KEY UPDATE
      ${isDong ? "" : "sigungu_name = VALUES(sigungu_name),"}
      tx_count = VALUES(tx_count),
      median_price_per_m2 = VALUES(median_price_per_m2),
      avg_price_per_m2 = VALUES(avg_price_per_m2),
      median_price = VALUES(median_price),
      avg_price = VALUES(avg_price)
  `;

  await pool.query(sql, [ym, sido]);
}

async function buildYearStat(pool, opt) {
  const sido = String(opt.sido);
  const level = opt.level;
  const y = String(opt.y);

  const isDong = level === 'dong';
  const outTable = statTable(level, 'year');
  const yStart = `${y}01`;
  const yEnd   = `${y}12`;

  const isGyeonggi = (sido === '41');
  const rollupCity = (!isDong && isGyeonggi);

  const cityCodeExpr = `
    CASE
      WHEN LEFT(t.lawd_cd, 2) = '41' AND RIGHT(t.lawd_cd, 2) <> '00'
        THEN CONCAT(LEFT(t.lawd_cd, 4), '0')
      ELSE t.lawd_cd
    END
  `;

  const lawdExpr = isDong
    ? 't.lawd_cd'
    : (rollupCity ? cityCodeExpr : 't.lawd_cd');

  const joinSigungu = isDong
    ? ''
    : `LEFT JOIN re_sigungu s ON s.lawd_cd = (${lawdExpr})`;

  const nameExpr = isDong
    ? 't.dong_name'
    : `COALESCE(s.sigungu_name, t.sigungu_name, (${lawdExpr}))`;

  const groupCols = `lawd_cd, area_name, deal_y`;

  const sql = `
    INSERT INTO ${outTable}
    (${isDong ? 'lawd_cd, dong_name,' : 'lawd_cd, sigungu_name,'} deal_y, tx_count,
     median_price_per_m2, avg_price_per_m2, median_price, avg_price)
    WITH base AS (
      SELECT
        (${lawdExpr}) AS lawd_cd,
        (${nameExpr}) AS area_name,
        LEFT(t.deal_ym, 4) AS deal_y,
        (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) AS price_won,
        (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) / NULLIF(t.area_m2, 0) AS ppm2
      FROM re_trade_apt t
      ${joinSigungu}
      WHERE t.deal_ym BETWEEN ? AND ?
        AND t.lawd_cd LIKE CONCAT(?, '%')
        AND ${commonBaseWhere('t')}
        ${isDong ? "AND t.dong_name IS NOT NULL AND t.dong_name <> ''" : ""}
    ),
    ranked AS (
      SELECT
        lawd_cd, area_name, deal_y, price_won, ppm2,
        ROW_NUMBER() OVER (PARTITION BY lawd_cd, area_name, deal_y ORDER BY ppm2)      AS rn_ppm2,
        ROW_NUMBER() OVER (PARTITION BY lawd_cd, area_name, deal_y ORDER BY price_won) AS rn_price,
        COUNT(*)    OVER (PARTITION BY lawd_cd, area_name, deal_y) AS cnt
      FROM base
    )
    SELECT
      lawd_cd,
      area_name,
      deal_y,
      MAX(cnt) AS tx_count,
      ROUND(AVG(CASE WHEN rn_ppm2  IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN ppm2 END), 2) AS median_price_per_m2,
      ROUND(AVG(ppm2), 2) AS avg_price_per_m2,
      CAST(ROUND(AVG(CASE WHEN rn_price IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN price_won END), 0) AS SIGNED) AS median_price,
      CAST(ROUND(AVG(price_won), 0) AS SIGNED) AS avg_price
    FROM ranked
    GROUP BY ${groupCols}
    ON DUPLICATE KEY UPDATE
      ${isDong ? "" : "sigungu_name = VALUES(sigungu_name),"}
      tx_count = VALUES(tx_count),
      median_price_per_m2 = VALUES(median_price_per_m2),
      avg_price_per_m2 = VALUES(avg_price_per_m2),
      median_price = VALUES(median_price),
      avg_price = VALUES(avg_price)
  `;

  await pool.query(sql, [yStart, yEnd, sido]);
}

async function buildRank(pool, opt) {
  const sido = String(opt.sido);
  const level = opt.level;
  const timeframe = opt.timeframe;
  const periodKey = String(opt.periodKey);
  const topN = Number(opt.topN);

  const sTable = statTable(level, timeframe);
  const rTable = rankTable(level, timeframe);
  const isDong = level === 'dong';

  const colPeriod = timeframe === 'month' ? 'deal_ym' : 'deal_y';
  const periodVal = periodKey;

  const prevP =
    timeframe === 'month'
      ? prevMonth(periodVal)
      : String(Number(periodVal) - 1);

  const keyJoinCurPrev = isDong
    ? 'ps.lawd_cd = cur.lawd_cd AND ps.area_name = cur.area_name'
    : 'ps.lawd_cd = cur.lawd_cd';

  const keyJoinCurPrevRank = isDong
    ? 'pr.lawd_cd = cur.lawd_cd AND pr.area_name = cur.area_name'
    : 'pr.lawd_cd = cur.lawd_cd';

  const areaColInStat = isDong ? 'dong_name' : 'sigungu_name';
  const areaColInRank = isDong ? 'dong_name' : 'sigungu_name';

  for (let i = 0; i < METRICS.length; i++) {
    const m = METRICS[i];

    await pool.query(
      `DELETE FROM ${rTable} WHERE scope_sido_code=? AND ${colPeriod}=? AND metric=?`,
      [sido, periodVal, m.key]
    );

    const sql = `
      WITH cur AS (
        SELECT
          ${colPeriod} AS period,
          lawd_cd,
          ${areaColInStat} AS area_name,
          ${m.key} AS value,
          ROW_NUMBER() OVER (ORDER BY ${m.key} DESC) AS rank_no
        FROM ${sTable}
        WHERE ${colPeriod} = ?
          AND lawd_cd LIKE CONCAT(?, '%')
          AND ${m.key} IS NOT NULL
      ),
      prevStat AS (
        SELECT
          lawd_cd,
          ${areaColInStat} AS area_name,
          ${m.key} AS prev_value
        FROM ${sTable}
        WHERE ${colPeriod} = ?
          AND lawd_cd LIKE CONCAT(?, '%')
      ),
      prevRank AS (
        SELECT
          lawd_cd,
          ${areaColInRank} AS area_name,
          rank_no AS prev_rank_no
        FROM ${rTable}
        WHERE scope_sido_code = ?
          AND ${colPeriod} = ?
          AND metric = ?
      )
      SELECT
        cur.rank_no,
        cur.lawd_cd,
        cur.area_name,
        cur.value,
        ps.prev_value,
        pr.prev_rank_no
      FROM cur
      LEFT JOIN prevStat ps ON ${keyJoinCurPrev}
      LEFT JOIN prevRank pr ON ${keyJoinCurPrevRank}
      WHERE cur.rank_no <= ?
      ORDER BY cur.rank_no
    `;

    const q = await pool.query(sql, [periodVal, sido, prevP, sido, sido, prevP, m.key, topN]);
    const rows = q && q[0] ? q[0] : [];
    if (!rows.length) continue;

    const insertSql = `
      INSERT INTO ${rTable}
      (scope_sido_code, ${colPeriod}, metric, rank_no, lawd_cd, ${areaColInRank}, value, extra)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (let j = 0; j < rows.length; j++) {
      const r = rows[j];

      const prevValue = (r.prev_value != null) ? Number(r.prev_value) : null;
      const curValue = (r.value != null) ? Number(r.value) : null;

      const pct =
        (prevValue != null && prevValue !== 0 && curValue != null)
          ? ((curValue - prevValue) / prevValue) * 100
          : null;

      const prevRankNo = (r.prev_rank_no != null) ? Number(r.prev_rank_no) : null;
      const rankNo = (r.rank_no != null) ? Number(r.rank_no) : null;

      const rankDelta =
        (prevRankNo != null && rankNo != null)
          ? (prevRankNo - rankNo)
          : null;

      const extra = {
        prev_value: (r.prev_value != null ? r.prev_value : null),
        pct_change: pct,
        prev_rank_no: (r.prev_rank_no != null ? r.prev_rank_no : null),
        rank_delta: rankDelta,
        prev_period: prevP,
      };

      await pool.query(insertSql, [
        sido,
        periodVal,
        m.key,
        r.rank_no,
        r.lawd_cd,
        r.area_name,
        r.value,
        JSON.stringify(extra),
      ]);
    }
  }
}

async function main() {
  const sido = getArg('sido', '11');           // 11=서울, 28=인천, 41=경기
  const level = getArg('level', 'dong');       // dong | sigungu
  const fromYm = getArg('from', '200001');
  const toYm   = getArg('to',   '202512');
  const topN   = Number(getArg('top', '100'));
  const timeframe = getArg('timeframe', 'both'); // month|year|both
  const only = getArg('only', 'all');            // stat|rank|all

  const months = monthRange(fromYm, toYm);
  const years = yearSetFromMonths(months);

  const pool = await mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    charset: 'utf8mb4',
  });

  console.log(`[start] sido=${sido} level=${level} from=${fromYm} to=${toYm} top=${topN} timeframe=${timeframe} only=${only}`);

  if (timeframe === 'month' || timeframe === 'both') {
    for (let i = 0; i < months.length; i++) {
      const ym = months[i];
      if (only === 'all' || only === 'stat') {
        await buildMonthStat(pool, { sido: sido, level: level, ym: ym });
      }
      if (only === 'all' || only === 'rank') {
        await buildRank(pool, { sido: sido, level: level, timeframe: 'month', periodKey: ym, topN: topN });
      }
      if (Number(ym.slice(4, 6)) % 3 === 0) console.log(`[month] done ${ym}`);
    }
  }

  if (timeframe === 'year' || timeframe === 'both') {
    for (let i = 0; i < years.length; i++) {
      const y = years[i];
      if (only === 'all' || only === 'stat') {
        await buildYearStat(pool, { sido: sido, level: level, y: y });
      }
      if (only === 'all' || only === 'rank') {
        await buildRank(pool, { sido: sido, level: level, timeframe: 'year', periodKey: y, topN: topN });
      }
      console.log(`[year] done ${y}`);
    }
  }

  await pool.end();
  console.log('[done]');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
