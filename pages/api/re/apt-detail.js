// pages/api/re/apt-detail.js
'use strict';

const { pool: dbPool } = require('../../../lib/db');

const M2_PER_PYEONG = 3.305785;

const _colCache = globalThis.__re_col_cache || (globalThis.__re_col_cache = new Map());

async function hasColumn(tableName, columnName) {
  const key = `${tableName}.${columnName}`;
  if (_colCache.has(key)) return _colCache.get(key);

  const [rows] = await dbPool.execute(
    `
    SELECT 1 AS ok
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND column_name = ?
    LIMIT 1
    `,
    [tableName, columnName]
  );

  const yes = !!(rows && rows.length);
  _colCache.set(key, yes);
  return yes;
}

function parseAptKey(aptKey) {
  const s = String(aptKey || '');
  const parts = s.split('|');
  const lawd_cd = parts[0] || '';
  const gu_name = parts[1] || '';
  const dong_name = parts[2] || '';
  const apt_name = parts.slice(3).join('|') || '';
  return { lawd_cd, gu_name, dong_name, apt_name };
}

function pyeongBandToM2Range(bandKey) {
  const b = String(bandKey || 'all').toLowerCase();
  if (!b || b === 'all') return null;
  const band = Number(b);
  if (!Number.isFinite(band) || band <= 0) return null;

  const lo = band * M2_PER_PYEONG;
  const hi = (band + 10) * M2_PER_PYEONG;
  return { lo, hi };
}

function isYm(v) {
  return /^\d{6}$/.test(String(v || ''));
}
function isYear(v) {
  return /^\d{4}$/.test(String(v || ''));
}

function yearToYmLo(y) { return `${String(y)}01`; }
function yearToYmHi(y) { return `${String(y)}12`; }

export default async function handler(req, res) {
  try {
    const q = req.query || {};

    const apt_key = q.apt_key || q.aptKey || q.aptKeyEncoded;
    if (!apt_key) {
      return res.status(400).json({ ok: false, error: 'apt_key is required' });
    }

    const timeframe = String(q.timeframe || 'month').toLowerCase() === 'year' ? 'year' : 'month';
    const period = String(q.period || '').trim();
    const band = String(q.band || q.pyeong_band || 'all').toLowerCase();

    // ✅ snapshot(period) 검증은 유지 (카드용)
    if (timeframe === 'month' && !isYm(period)) {
      return res.status(400).json({ ok: false, error: 'period must be YYYYMM for month timeframe' });
    }
    if (timeframe === 'year' && !isYear(period)) {
      return res.status(400).json({ ok: false, error: 'period must be YYYY for year timeframe' });
    }

    // ✅ from/to(선택) - 최근거래/범위용
    const from = String(q.from || '').trim();
    const to = String(q.to || '').trim();

    if (timeframe === 'month') {
      if (from && !isYm(from)) return res.status(400).json({ ok: false, error: 'from must be YYYYMM' });
      if (to && !isYm(to)) return res.status(400).json({ ok: false, error: 'to must be YYYYMM' });
    } else {
      if (from && !isYear(from)) return res.status(400).json({ ok: false, error: 'from must be YYYY' });
      if (to && !isYear(to)) return res.status(400).json({ ok: false, error: 'to must be YYYY' });
    }

    const statsTable = timeframe === 'month' ? 're_trade_apt_stats_m' : 're_trade_apt_stats_y';
    const periodCol = timeframe === 'month' ? 'deal_ym' : 'deal_y';

    const hasSum = await hasColumn(statsTable, 'sum_price');
    const hasMax = await hasColumn(statsTable, 'max_price');

    const statsSql = `
      SELECT
        ${periodCol} AS period,
        pyeong_band,
        sido_code, sido_name, lawd_cd, sigungu_name, gu_name, dong_name, apt_name,
        apt_key,
        tx_count,
        avg_price_per_m2, median_price_per_m2, std_price_per_m2,
        avg_price, median_price,
        ${hasMax ? 'max_price' : 'NULL AS max_price'},
        ${hasSum ? 'sum_price' : 'NULL AS sum_price'},
        latest_deal_date, latest_apt_dong, latest_floor, latest_area_m2, latest_deal_amount_man,
        build_year, rgst_date
      FROM ${statsTable}
      WHERE ${periodCol} = ?
        AND pyeong_band = ?
        AND apt_key = ?
      LIMIT 1
    `;

    const [statsRows] = await dbPool.execute(statsSql, [period, band, apt_key]);
    const stats = statsRows?.[0] || null;

    // ------- 최신 거래 리스트 (from/to 우선) -------
    const { lawd_cd, gu_name, dong_name, apt_name } = parseAptKey(apt_key);

    // deal_ym 범위로 변환(연간이면 YYYY -> YYYY01~YYYY12)
    let ymFrom = '';
    let ymTo = '';

    if (from || to) {
      if (timeframe === 'month') {
        ymFrom = from || '';
        ymTo = to || '';
      } else {
        ymFrom = from ? yearToYmLo(from) : '';
        ymTo = to ? yearToYmHi(to) : '';
      }
    } else {
      // fallback: 기존 동작
      if (timeframe === 'month') {
        ymFrom = period;
        ymTo = period;
      } else {
        ymFrom = yearToYmLo(period);
        ymTo = yearToYmHi(period);
      }
    }

    // 기간 조건(ymFrom/ymTo 존재 형태별로)
    let periodWhere = '1=1';
    const periodParams = [];
    if (ymFrom && ymTo) {
      periodWhere = 't.deal_ym BETWEEN ? AND ?';
      periodParams.push(ymFrom, ymTo);
    } else if (ymFrom) {
      periodWhere = 't.deal_ym >= ?';
      periodParams.push(ymFrom);
    } else if (ymTo) {
      periodWhere = 't.deal_ym <= ?';
      periodParams.push(ymTo);
    }

    // 밴드 조건
    const r = pyeongBandToM2Range(band);
    const bandWhere = r ? ' AND t.area_m2 >= ? AND t.area_m2 < ?' : '';
    const bandParams = r ? [r.lo, r.hi] : [];

    const tradesSql = `
      SELECT
        t.deal_date,
        t.deal_ym,
        t.deal_amount_man,
        (CAST(t.deal_amount_man AS DECIMAL(20,0)) * 10000) AS price_won,
        t.area_m2,
        t.floor,
        t.apt_dong,
        t.build_year,
        t.rgst_date
      FROM re_trade_apt t
      WHERE t.lawd_cd = ?
        AND COALESCE(NULLIF(TRIM(t.gu_name),''), '') = ?
        AND t.dong_name = ?
        AND t.apt_name = ?
        AND (${periodWhere})
        AND (t.cancel_yn IS NULL OR t.cancel_yn <> 'Y')
        AND t.area_m2 > 0
        AND t.deal_amount_man IS NOT NULL AND t.deal_amount_man > 0
        ${bandWhere}
      ORDER BY t.deal_date DESC, t.deal_amount_man DESC
      LIMIT 30
    `;

    const [tradeRows] = await dbPool.execute(tradesSql, [
      lawd_cd,
      gu_name,
      dong_name,
      apt_name,
      ...periodParams,
      ...bandParams,
    ]);

    return res.status(200).json({
      ok: true,
      meta: { apt_key, timeframe, period, band, from: from || '', to: to || '', trades_ym_from: ymFrom, trades_ym_to: ymTo },
      stats,
      latest_trades: tradeRows || [],
    });
  } catch (e) {
    console.error('[apt-detail] error:', e);
    return res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}
