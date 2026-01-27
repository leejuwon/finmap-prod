// pages/api/re/rank.js
import { dbQuery } from '../../../server/crawler/lib/db';

const METRICS = new Set([
  'tx_count',
  'median_price_per_m2',
  'avg_price_per_m2',
  'median_price',
  'avg_price',
]);

function trim(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function normalizeTimeframe(v) {
  const t = trim(v).toLowerCase();
  return t === 'year' ? 'year' : 'month';
}

function normalizeTop(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 100;
  return Math.max(1, Math.min(500, Math.floor(n)));
}

function normalizeOrder(v) {
  const s = trim(v).toLowerCase();
  return s === 'asc' ? 'asc' : 'desc';
}

function prevYm(ym) {
  const y = Number(String(ym).slice(0, 4));
  const m = Number(String(ym).slice(4, 6));
  if (!y || !m) return null;
  let ny = y;
  let nm = m - 1;
  if (nm <= 0) {
    nm = 12;
    ny = y - 1;
  }
  return String(ny) + String(nm).padStart(2, '0');
}

function prevYear(y) {
  const n = Number(y);
  if (!n) return null;
  return String(n - 1);
}

// scope: all | lawd:11680 | city:성남시 | req:41135
function parseScope(scope) {
  const raw = trim(scope);
  if (!raw || raw === 'all') return { type: 'all' };

  const idx = raw.indexOf(':');
  if (idx < 0) return { type: 'all' };

  const type = raw.slice(0, idx).toLowerCase();
  const value = raw.slice(idx + 1);

  if (type === 'lawd' && /^\d{5}$/.test(value)) return { type, value };
  if (type === 'req' && /^\d{5}$/.test(value)) return { type, value };
  if (type === 'city' && value) return { type, value };
  return { type: 'all' };
}

function buildPeriodWhere(timeframe, period) {
  if (timeframe === 'year') {
    const y = String(period);
    return {
      where: `t.deal_ym BETWEEN ? AND ?`,
      params: [`${y}01`, `${y}12`],
    };
  }
  // month
  return {
    where: `t.deal_ym = ?`,
    params: [String(period)],
  };
}

export default async function handler(req, res) {
  try {
    const timeframe = normalizeTimeframe(req.query.timeframe);
    const period = trim(req.query.period);
    const metric = trim(req.query.metric) || 'tx_count';
    const topN = normalizeTop(req.query.top);
    const order = normalizeOrder(req.query.order);

    const sido = trim(req.query.sido) || '11'; // 11/28/41 (프론트에서 넘겨주면 됨)
    const scope = parseScope(req.query.scope);

    if (!period) {
      return res.status(400).json({ error: 'period is required' });
    }
    if (!METRICS.has(metric)) {
      return res.status(400).json({ error: `invalid metric: ${metric}` });
    }
    if (!/^(11|28|41)$/.test(sido)) {
      return res.status(400).json({ error: `invalid sido: ${sido}` });
    }

    // ✅ level 자동 결정(필요하면 프론트에서 level 파라미터로 강제 가능)
    // - 서울/인천: 기본 dong
    // - 경기: scope=all이면 sigungu, 아니면 dong (성남시 전체/분당구 등은 dong Top이 의미 있음)
    const level = (() => {
      const forced = trim(req.query.level);
      if (forced === 'dong' || forced === 'sigungu') return forced;

      if (sido === '41') {
        return scope.type === 'all' ? 'sigungu' : 'dong';
      }
      return 'dong';
    })();

    const prevPeriod = timeframe === 'year' ? prevYear(period) : prevYm(period);

    // ---- 공통 WHERE ----
    const commonWhere = [
      `(t.cancel_yn IS NULL OR t.cancel_yn <> 'Y')`,
      `t.area_m2 > 0`,
      `t.deal_amount_man IS NOT NULL`,
      `t.deal_amount_man > 0`,
      `t.lawd_cd LIKE CONCAT(?, '%')`,
    ];
    const commonParams = [sido];

    // scope filter
    if (scope.type === 'lawd') {
      // 서울/인천: lawd_cd 정확히 일치(강남구 등)
      commonWhere.push(`t.lawd_cd = ?`);
      commonParams.push(scope.value);
    } else if (scope.type === 'req') {
      // 경기: 구 단위 필터는 req_lawd_cd가 정확
      commonWhere.push(`t.req_lawd_cd = ?`);
      commonParams.push(scope.value);
    } else if (scope.type === 'city') {
      commonWhere.push(`t.sigungu_name = ?`);
      commonParams.push(scope.value);
    }

    const curPeriod = buildPeriodWhere(timeframe, period);
    const prevPeriodWhere = prevPeriod ? buildPeriodWhere(timeframe, prevPeriod) : null;

    // ---- 그룹핑 정의 ----
    // dong: (lawd_cd, dong_name) 단위
    // sigungu: (lawd_cd, sigungu_name) 단위 (경기는 canonical lawd_cd=시 코드로 묶여 있음)
    const groupCols =
      level === 'dong'
        ? {
            select: `
              t.lawd_cd,
              t.sigungu_name,
              NULLIF(t.gu_name,'') AS gu_name,
              t.dong_name
            `,
            partition: `lawd_cd, dong_name`,
            groupBy: `lawd_cd, sigungu_name, gu_name, dong_name`,
            joinOn: `cur.lawd_cd = prev.lawd_cd AND cur.dong_name = prev.dong_name`,
            areaNameExpr: `
              CASE
                WHEN (cur_scope_one = 1) THEN dong_name
                WHEN (gu_name IS NOT NULL AND gu_name <> '') THEN CONCAT(sigungu_name, ' ', gu_name, ' ', dong_name)
                ELSE CONCAT(sigungu_name, ' ', dong_name)
              END
            `,
          }
        : {
            select: `
              t.lawd_cd,
              t.sigungu_name
            `,
            partition: `lawd_cd`,
            groupBy: `lawd_cd, sigungu_name`,
            joinOn: `cur.lawd_cd = prev.lawd_cd`,
            areaNameExpr: `
              CASE
                WHEN RIGHT(sigungu_name, 1) = '구' THEN sigungu_name
                ELSE CONCAT(sigungu_name, ' 전체')
              END
            `,
          };

    // scope가 1개 구/1개 시면 dong 라벨을 짧게(동만) 보여주고 싶어서 플래그 하나 둠
    const curScopeOne =
      scope.type === 'lawd' || scope.type === 'req' || scope.type === 'city' ? 1 : 0;

    // ---- 핵심 SQL (cur + prev 집계 후 rank + join) ----
    // NOTE: median/avg 계산 때문에 window function 2개 사용 (ppm2, price_won)
    const dir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const makeAggSql = (periodWhereSql) => `
      WITH base AS (
        SELECT
          ${groupCols.select},
          (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) AS price_won,
          (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) / NULLIF(t.area_m2, 0) AS ppm2
        FROM re_trade_apt t
        WHERE ${commonWhere.join(' AND ')}
          AND ${periodWhereSql.where}
          AND t.dong_name IS NOT NULL AND t.dong_name <> ''
      ),
      ranked AS (
        SELECT
          *,
          ROW_NUMBER() OVER (PARTITION BY ${groupCols.partition} ORDER BY ppm2)      AS rn_ppm2,
          ROW_NUMBER() OVER (PARTITION BY ${groupCols.partition} ORDER BY price_won) AS rn_price,
          COUNT(*)    OVER (PARTITION BY ${groupCols.partition}) AS cnt
        FROM base
      )
      SELECT
        ${level === 'dong'
          ? `lawd_cd, sigungu_name, gu_name, dong_name`
          : `lawd_cd, sigungu_name`},
        MAX(cnt) AS tx_count,
        ROUND(AVG(CASE WHEN rn_ppm2  IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN ppm2 END), 2) AS median_price_per_m2,
        ROUND(AVG(ppm2), 2) AS avg_price_per_m2,

        CAST(
          LEAST(
            GREATEST(
              ROUND(AVG(CASE WHEN rn_price IN (FLOOR((cnt+1)/2), FLOOR((cnt+2)/2)) THEN price_won END), 0),
              0
            ),
            9223372036854775807
          ) AS SIGNED
        ) AS median_price,

        CAST(
          LEAST(
            GREATEST(ROUND(AVG(price_won), 0), 0),
            9223372036854775807
          ) AS SIGNED
        ) AS avg_price
      FROM ranked
      GROUP BY ${groupCols.groupBy}
    `;

    const curSql = `
      WITH agg AS (
        ${makeAggSql(curPeriod)}
      ),
      cur AS (
        SELECT
          agg.*,
          agg.${metric} AS value,
          ${curScopeOne} AS cur_scope_one,
          ROW_NUMBER() OVER (ORDER BY agg.${metric} ${dir}) AS rank_no
        FROM agg
        WHERE agg.${metric} IS NOT NULL
      )
      SELECT * FROM cur
      WHERE rank_no <= ?
      ORDER BY rank_no
    `;

    const curParams = [...commonParams, ...curPeriod.params, topN];

    //const [curRows] = await dbQuery(curSql, curParams);
    const curRows = await dbQuery(curSql, curParams);

    // prev 없으면 cur만 리턴
    let prevMap = new Map();
    if (prevPeriodWhere) {
      const prevSql = `
        WITH agg AS (
          ${makeAggSql(prevPeriodWhere)}
        ),
        prev AS (
          SELECT
            agg.*,
            agg.${metric} AS value,
            ${curScopeOne} AS cur_scope_one,
            ROW_NUMBER() OVER (ORDER BY agg.${metric} ${dir}) AS rank_no
          FROM agg
          WHERE agg.${metric} IS NOT NULL
        )
        SELECT * FROM prev
      `;

      const prevParams = [...commonParams, ...prevPeriodWhere.params];
      //const [prevRows] = await dbQuery(prevSql, prevParams);
      const prevRows = await dbQuery(prevSql, prevParams);

      prevRows.forEach(r => {
        const key =
          level === 'dong'
            ? `${r.lawd_cd}|${r.dong_name}`
            : `${r.lawd_cd}`;
        prevMap.set(key, r);
      });
    }

    const out = curRows.map(r => {
      const key =
        level === 'dong'
          ? `${r.lawd_cd}|${r.dong_name}`
          : `${r.lawd_cd}`;

      const prev = prevMap.get(key);
      const prevValue = prev ? Number(prev.value) : null;
      const curValue = Number(r.value);

      let pctChange = null;
      if (prevValue !== null && prevValue !== 0) {
        pctChange = ((curValue - prevValue) / prevValue) * 100;
      }

      const prevRankNo = prev ? Number(prev.rank_no) : null;
      const rankDelta = prevRankNo !== null ? (prevRankNo - Number(r.rank_no)) : null;

      // area_name(표시용)
      let areaName = '';
      if (level === 'sigungu') {
        areaName = String(r.sigungu_name || '');
        if (areaName && areaName.slice(-1) !== '구') areaName = `${areaName} 전체`;
      } else {
        // dong
        if (curScopeOne === 1) areaName = String(r.dong_name || '');
        else if (r.gu_name) areaName = `${r.sigungu_name} ${r.gu_name} ${r.dong_name}`;
        else areaName = `${r.sigungu_name} ${r.dong_name}`;
      }

      return {
        rank_no: Number(r.rank_no),
        lawd_cd: r.lawd_cd,
        sido: sido,
        sigungu_name: r.sigungu_name || null,
        gu_name: r.gu_name || null,
        dong_name: r.dong_name || null,
        area_name: areaName,
        metric,
        value: curValue,
        extra: {
          prev_period: prevPeriod,
          prev_value: prevValue,
          pct_change: pctChange,
          prev_rank_no: prevRankNo,
          rank_delta: rankDelta,
        },
      };
    });

    res.status(200).json({
      timeframe,
      period,
      prev_period: prevPeriod,
      level,
      metric,
      order,
      top: topN,
      sido,
      scope: req.query.scope || 'all',
      rows: out,
    });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
}
