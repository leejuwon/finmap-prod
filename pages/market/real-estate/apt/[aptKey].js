// pages/market/real-estate/apt/[aptKey].js
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ToolSeo from '../../../../_components/ToolSeo';
import AdSenseUnit from '../../../../_components/AdSenseUnit';
import { AD_SLOTS } from '../../../../config/adSlots';

const INFEED_SLOT = AD_SLOTS.responsiveBottom;
const M2_PER_PYEONG = 3.305785;
const DETAIL_STATE_STORAGE_KEY = 'finmap:real-estate:apt-detail-state';

function numOrNull(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function fmtEokFromWon(won, lang) {
  const n = numOrNull(won);
  if (n == null) return '-';
  const eok = n / 100_000_000;
  const v = eok.toFixed(3);
  return lang === 'en' ? `${v}×100M KRW` : `${v}억원`;
}

function fmtEokFromMan(man, lang) {
  const n = numOrNull(man);
  if (n == null) return '-';
  const eok = n / 10_000;
  const v = eok.toFixed(3);
  return lang === 'en' ? `${v}×100M KRW` : `${v}억원`;
}

function fmtPyeongFromM2(m2) {
  const n = numOrNull(m2);
  if (n == null) return '-';
  return (n / M2_PER_PYEONG).toFixed(1);
}

function fmtManPerPyeongFromWonPerM2(wonPerM2, lang = 'ko') {
  const n = numOrNull(wonPerM2);
  if (n == null) return '-';
  const wonPerPyeong = n * M2_PER_PYEONG;
  const manPerPyeong = wonPerPyeong / 10_000;
  const v = Math.round(manPerPyeong).toLocaleString();
  return lang === 'en' ? `${v} 10k KRW/pyeong` : `${v}만원/평`;
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

function isYm(v) {
  return /^\d{6}$/.test(String(v || ''));
}
function isYear(v) {
  return /^\d{4}$/.test(String(v || ''));
}

function ymToLabel(ym) {
  const s = String(ym || '');
  if (!/^\d{6}$/.test(s)) return s || '-';
  return `${s.slice(0, 4)}-${s.slice(4, 6)}`;
}
function yearToLabel(y) {
  const s = String(y || '');
  return /^\d{4}$/.test(s) ? s : (s || '-');
}

// YYYYMM add months
function addMonths(ym, deltaMonths) {
  const s = String(ym || '');
  if (!/^\d{6}$/.test(s)) return '';
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6));
  if (!Number.isFinite(y) || !Number.isFinite(m)) return '';

  const idx = y * 12 + (m - 1) + Number(deltaMonths || 0);
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  const mm = String(nm).padStart(2, '0');
  return `${ny}${mm}`;
}

function defaultRangePreset(tf) {
  return tf === 'year' ? 'y5' : 'm24';
}
function sanitizeRangePreset(tf, v) {
  const s = String(v || '').toLowerCase();
  const okMonth = ['m12', 'm24', 'm36', 'all'];
  const okYear = ['y5', 'y10', 'all'];
  if (tf === 'year') return okYear.includes(s) ? s : 'y5';
  return okMonth.includes(s) ? s : 'm24';
}
function computeRange(tf, period, preset) {
  const p = String(period || '').trim();
  const pr = String(preset || '').toLowerCase();

  if (tf === 'month') {
    if (!isYm(p)) return { from: '', to: '' };
    if (pr === 'all') return { from: '', to: '' };
    const n = pr === 'm12' ? 12 : pr === 'm24' ? 24 : 36;
    const from = addMonths(p, -(n - 1));
    return { from, to: p };
  }

  // year
  if (!isYear(p)) return { from: '', to: '' };
  if (pr === 'all') return { from: '', to: '' };
  const n = pr === 'y5' ? 5 : 10;
  const y = Number(p);
  const from = String(y - (n - 1));
  return { from, to: p };
}

function MiniCard({ title, value, sub }) {
  return (
    <div className="min-w-0 max-w-full rounded-2xl border border-slate-100 bg-white p-4">
      <div className="break-words text-sm font-semibold leading-snug text-slate-800">{title}</div>
      <div className="mt-2 text-lg font-bold leading-snug text-slate-900 break-words">{value}</div>
      {sub ? <div className="mt-1 break-words text-xs leading-snug text-slate-500">{sub}</div> : null}
    </div>
  );
}

function isValidAptKey(aptKey) {
  const { lawd_cd, dong_name, apt_name } = parseAptKey(aptKey);
  return /^\d{5}$/.test(lawd_cd) && Boolean(dong_name) && Boolean(apt_name);
}

async function loadAptSeoSummary(aptKey) {
  const { pool } = require('../../../../lib/db');
  const [rows] = await pool.execute(
    `
    SELECT
      s.deal_ym AS period,
      s.deal_ym AS latest_period,
      s.pyeong_band,
      s.sido_code,
      s.sido_name,
      s.lawd_cd,
      s.sigungu_name,
      s.gu_name,
      s.dong_name,
      s.apt_name,
      s.apt_key,
      s.tx_count,
      s.avg_price_per_m2,
      s.median_price_per_m2,
      s.std_price_per_m2,
      s.avg_price,
      s.median_price,
      NULL AS sum_price,
      s.latest_deal_date,
      s.latest_apt_dong,
      s.latest_floor,
      s.latest_area_m2,
      s.latest_deal_amount_man,
      s.build_year,
      s.rgst_date
    FROM re_trade_apt_stats_m s
    WHERE s.apt_key = ?
      AND s.pyeong_band = 'all'
      AND COALESCE(s.tx_count, 0) > 0
    ORDER BY s.deal_ym DESC
    LIMIT 1
    `,
    [aptKey]
  );
  return rows?.[0] || null;
}

export async function getServerSideProps(ctx) {
  const { params = {}, query = {}, res } = ctx;

  const pick = (value) => {
    if (Array.isArray(value)) return value[0] || '';
    return value == null ? '' : String(value);
  };

  const aptKey = pick(params.aptKey);
  if (!isValidAptKey(aptKey)) {
    return { notFound: true };
  }

  let seoStats = null;
  let seoRobots = 'index,follow,max-image-preview:large';
  try {
    seoStats = await loadAptSeoSummary(aptKey);
  } catch (e) {
    console.error('[apt-detail:ssr] seo summary lookup failed:', e?.message || e);
    seoRobots = 'noindex,follow';
  }

  if (!seoStats && seoRobots !== 'noindex,follow') {
    return { notFound: true };
  }

  if (res && seoRobots.includes('noindex')) {
    res.setHeader('X-Robots-Tag', seoRobots.replace(',', ', '));
  }

  const requestedPeriod = pick(query.period);
  const requestedBand = pick(query.band);
  const defaultPeriod = seoStats?.latest_period || seoStats?.period || '';
  const shouldHydrateDetail = !requestedPeriod && !requestedBand && seoStats;

  return {
    props: {
      initialAptKey: aptKey,
      initialQuery: {
        timeframe: pick(query.timeframe),
        period: requestedPeriod || defaultPeriod,
        band: pick(query.band),
        range: pick(query.range),
      },
      initialSeoStats: seoStats,
      initialDetail: shouldHydrateDetail
        ? {
            ok: true,
            meta: { apt_key: aptKey, timeframe: 'month', period: defaultPeriod, band: 'all' },
            stats: seoStats,
            latest_trades: [],
          }
        : null,
      seoRobots,
    },
  };
}
function fmtCount(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString() : '-';
}
function fmtText(v) {
  const s = String(v == null ? '' : v).trim();
  return s || '-';
}
function fmtDate(v) {
  const s = String(v == null ? '' : v).trim();
  return s ? s.slice(0, 10) : '-';
}
function fmtParking(row, lang) {
  const total = row?.parking_total;
  const ground = row?.parking_ground;
  const underground = row?.parking_underground;
  if (total == null && ground == null && underground == null) return '-';

  const main = total != null ? Number(total).toLocaleString() : '-';
  if (ground == null && underground == null) return main;

  const g = ground != null ? Number(ground).toLocaleString() : '-';
  const u = underground != null ? Number(underground).toLocaleString() : '-';
  return lang === 'en' ? `${main} (G ${g} / B ${u})` : `${main} (지상 ${g} / 지하 ${u})`;
}
function fmtHeatingManage(row) {
  const heating = fmtText(row?.heating_type);
  const manage = fmtText(row?.manage_type);
  if (heating === '-' && manage === '-') return '-';
  return `${heating} / ${manage}`;
}

// ✅ 축/라벨 포함 스파크라인
function Sparkline({ rows, valueKey, valueTransform, fmtY, fmtX }) {
  const model = useMemo(() => {
    const pts = (rows || [])
      .map((r) => {
        const raw = Number(r?.[valueKey]);
        if (!Number.isFinite(raw)) return null;
        const v = valueTransform ? valueTransform(raw) : raw;
        if (!Number.isFinite(v)) return null;
        return { period: r.period, v };
      })
      .filter(Boolean);

    if (pts.length < 2) return null;

    const vs = pts.map((p) => p.v);
    const min = Math.min(...vs);
    const max = Math.max(...vs);

    const w = 600;
    const h = 140;
    const pad = 10;

    const n = pts.length;
    const scaleX = (i) => pad + (i * (w - pad * 2)) / (n - 1);
    const scaleY = (v) => {
      if (max === min) return h / 2;
      return pad + ((max - v) * (h - pad * 2)) / (max - min);
    };

    const d = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(2)} ${scaleY(p.v).toFixed(2)}`)
      .join(' ');

    const start = pts[0];
    const end = pts[pts.length - 1];
    const chgPct = start.v !== 0 ? ((end.v - start.v) / start.v) * 100 : null;

    return { d, w, h, min, max, start, end, chgPct };
  }, [rows, valueKey, valueTransform]);

  if (!model) return <div className="text-sm text-slate-400 py-10 text-center">No series</div>;

  const fmtYv = (x) => (fmtY ? fmtY(x) : String(Math.round(x)));
  const fmtXp = (x) => (fmtX ? fmtX(x) : String(x ?? '-'));

  const chg = Number.isFinite(model.chgPct) ? model.chgPct : null;
  const chgText = chg == null ? '-' : `${chg > 0 ? '+' : ''}${chg.toFixed(2)}%`;

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      {/* ✅ SVG + Y 라벨 */}
      <div className="relative">
        <div className="absolute left-0 top-0 max-w-[45%] break-words text-[11px] leading-tight text-slate-500">
          {fmtYv(model.max)}
        </div>
        <div className="absolute left-0 bottom-0 max-w-[45%] break-words text-[11px] leading-tight text-slate-500">
          {fmtYv(model.min)}
        </div>

        <svg viewBox={`0 0 ${model.w} ${model.h}`} className="h-[150px] w-full max-w-full text-slate-900 sm:h-[140px]">
          <path d={model.d} fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* ✅ X 라벨은 absolute 제거하고 아래로 내림 (겹침 방지) */}
      <div className="mt-1 flex min-w-0 items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="min-w-0 break-words">{fmtXp(model.start.period)}</span>
        <span className="min-w-0 break-words text-right">{fmtXp(model.end.period)}</span>
      </div>

      {/* pills */}
      <div className="mt-2 flex min-w-0 flex-wrap gap-2 text-[11px] text-slate-600">
        <span className="max-w-full rounded-full bg-slate-100 px-2.5 py-1 break-words">Start: {fmtYv(model.start.v)}</span>
        <span className="max-w-full rounded-full bg-slate-100 px-2.5 py-1 break-words">End: {fmtYv(model.end.v)}</span>
        <span className="max-w-full rounded-full bg-slate-100 px-2.5 py-1 break-words">Change: {chgText}</span>
        <span className="max-w-full rounded-full bg-slate-100 px-2.5 py-1 break-words">
          Min/Max: {fmtYv(model.min)} ~ {fmtYv(model.max)}
        </span>
      </div>
    </div>
  );
}


export default function AptDetailPage({
  initialAptKey = '',
  initialQuery = {},
  initialSeoStats = null,
  initialDetail = null,
  seoRobots,
}) {
  const router = useRouter();
  const lang = (router.locale || 'ko').startsWith('en') ? 'en' : 'ko';

  const aptKey = router.query.aptKey || initialAptKey;

  const qTimeframe =
    String(router.query.timeframe || initialQuery.timeframe || 'month').toLowerCase() === 'year' ? 'year' : 'month';
  const qPeriod = String(router.query.period || initialQuery.period || '');
  const qBand = String(router.query.band || initialQuery.band || 'all').toLowerCase();
  const qRange = String(router.query.range || initialQuery.range || '');

  const [opt, setOpt] = useState(null);

  const [timeframe, setTimeframe] = useState(qTimeframe);
  const [period, setPeriod] = useState(qPeriod);
  const [band, setBand] = useState(qBand);

  const [rangePreset, setRangePreset] = useState(
    sanitizeRangePreset(qTimeframe, qRange || defaultRangePreset(qTimeframe))
  );

  const [detail, setDetail] = useState(initialDetail);
  const [series, setSeries] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  
  // ✅ 데스크탑에서만 카드/표 토글, 모바일은 카드 고정
  const [desktopView, setDesktopView] = useState('table'); // 'card' | 'table'
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const v = window.localStorage.getItem('re_apt_desktop_view');
    if (v === 'card' || v === 'table') setDesktopView(v);
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('re_apt_desktop_view', desktopView);
  }, [desktopView]);

  // ✅ "초기 진입/페이지 전환"에서만 오버레이
  const firstFetchRef = useRef(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const appliedStoredStateRef = useRef(false);
  useEffect(() => {
    if (!router?.events) return;
    const onStart = (url) => {
      if (typeof url === 'string' && url.startsWith('/market/real-estate')) {
        setRouteLoading(true);
      }
    };
    const onDone = () => setRouteLoading(false);
    router.events.on('routeChangeStart', onStart);
    router.events.on('routeChangeComplete', onDone);
    router.events.on('routeChangeError', onDone);
    return () => {
      router.events.off('routeChangeStart', onStart);
      router.events.off('routeChangeComplete', onDone);
      router.events.off('routeChangeError', onDone);
    };
  }, [router]);

  useEffect(() => {
    if (appliedStoredStateRef.current) return;
    if (!router.isReady) return;
    const hasUrlState = ['timeframe', 'period', 'band', 'range', 'from', 'to'].some(
      (key) => router.query?.[key] != null
    );
    if (hasUrlState) return;
    appliedStoredStateRef.current = true;

    try {
      const raw = window.sessionStorage.getItem(DETAIL_STATE_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || Date.now() - Number(saved.ts || 0) > 30 * 60 * 1000) return;

      const nextTimeframe = String(saved.timeframe || 'month').toLowerCase() === 'year' ? 'year' : 'month';
      const nextRange = sanitizeRangePreset(
        nextTimeframe,
        saved.range || defaultRangePreset(nextTimeframe)
      );
      const nextPeriod = String(saved.period || '');
      const nextBand = String(saved.band || 'all').toLowerCase();

      setTimeframe(nextTimeframe);
      if (nextPeriod) setPeriod(nextPeriod);
      setBand(nextBand);
      setRangePreset(nextRange);
    } catch {
      // Ignore stale or malformed UI state.
    }
  }, [router.isReady, router.query]);

  const { dong_name, apt_name } = useMemo(() => parseAptKey(aptKey), [aptKey]);

  const { from, to } = useMemo(() => {
    const rp = sanitizeRangePreset(timeframe, rangePreset || defaultRangePreset(timeframe));
    return computeRange(timeframe, period, rp);
  }, [timeframe, period, rangePreset]);

  const [loadingOpt, setLoadingOpt] = useState(true);

  // 옵션 로드
    useEffect(() => {
        let alive = true;
        (async () => {
            setLoadingOpt(true);
            try {
            const r = await fetch(`/api/re/options?lang=${encodeURIComponent(lang)}`);
            const j = await r.json();
            if (!alive) return;
            if (j?.ok) setOpt(j);
            } catch {
            // ignore
            } finally {
            if (alive) setLoadingOpt(false);
            }
        })();
        return () => { alive = false; };
    }, [lang]);


  // period 형식 보정 (timeframe 따라 YYYYMM/YYYY)
  useEffect(() => {
    if (!opt) return;

    const ok =
      timeframe === 'year'
        ? isYear(period)
        : isYm(period);

    if (ok) return;

    const next =
      timeframe === 'year'
        ? (opt.periods?.years?.[opt.periods.years.length - 1] || '')
        : (opt.periods?.maxYm || opt.periods?.months?.[opt.periods.months.length - 1] || '');

    setPeriod(next);
    if (hasDetailQueryParams()) {
      syncUrl({ timeframe, period: next, band, rangePreset: sanitizeRangePreset(timeframe, rangePreset) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opt, timeframe]);

  // timeframe이 바뀌면 rangePreset도 기본값으로 재정렬
  useEffect(() => {
    setRangePreset((prev) => sanitizeRangePreset(timeframe, prev || defaultRangePreset(timeframe)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  function syncUrl(next) {
    if (!aptKey) return; // router ready 이전 방지
    const base = `/market/real-estate/apt/${encodeURIComponent(String(aptKey || ''))}`;

    const rp = sanitizeRangePreset(next.timeframe, next.rangePreset || defaultRangePreset(next.timeframe));
    const r = computeRange(next.timeframe, next.period, rp);

    const qs = new URLSearchParams({
      timeframe: next.timeframe,
      period: next.period,
      band: next.band,
      range: rp,
    });

    // ✅ from/to도 URL에 노출(사용자 이해 + 공유 링크)
    if (r.from) qs.set('from', r.from);
    if (r.to) qs.set('to', r.to);

    router.replace(`${base}?${qs.toString()}`, undefined, { shallow: true });
  }

  function hasDetailQueryParams() {
    return ['timeframe', 'period', 'band', 'range', 'from', 'to'].some(
      (key) => router.query?.[key] != null
    );
  }

  async function fetchAll() {
    if (!aptKey || !period) return;

    setLoading(true);
    setErrMsg('');
    try {
      const qs = new URLSearchParams({
        apt_key: String(aptKey),
        timeframe,
        period,
        band,
      });

      // ✅ 차트/최근거래는 from~to 범위로
      if (from) qs.set('from', from);
      if (to) qs.set('to', to);

      const r1 = await fetch(`/api/re/apt-detail?${qs.toString()}`);
      const j1 = await r1.json();
      if (!j1?.ok) throw new Error(j1?.error || 'apt-detail failed');
      setDetail(j1);

      const r2 = await fetch(`/api/re/apt-series?${qs.toString()}`);
      const j2 = await r2.json();
      if (!j2?.ok) throw new Error(j2?.error || 'apt-series failed');
      setSeries(j2.rows || []);
    } catch (e) {
      setErrMsg(e?.message || 'error');
      setDetail(null);
      setSeries([]);
    } finally {
      setLoading(false);
      // ✅ 최초 1회 fetchAll 완료 표시 (이후 필터변경은 오버레이 제외)
      if (!firstFetchRef.current) firstFetchRef.current = true;
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aptKey, timeframe, period, band, from, to]);

  function BlockingOverlay({ show, text }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            <div className="text-sm text-slate-700">{text}</div>
        </div>
        </div>
    );
  }


  const stats = detail?.stats;
  const seoStats = stats || initialSeoStats;

  const seoTitle = apt_name
    ? (lang === 'en' ? `${apt_name} Apartment Transaction Detail` : `${apt_name} 실거래 상세`)
    : (lang === 'en' ? 'Apartment Transaction Detail' : '아파트 상세');
  const seoDesc = apt_name
    ? (lang === 'en'
        ? `Check official transaction trends for ${apt_name}${dong_name ? ` in ${dong_name}` : ''}: median price, transaction count, unit price and latest deals.`
        : `${apt_name} (${dong_name || ''})의 기간별 대표가격·거래량·평단가 추이를 확인하세요.`)
    : (lang === 'en' ? 'Apartment transaction detail page.' : '아파트 실거래 상세 페이지');

  const rangeLabel = useMemo(() => {
    if (!from || !to) return (lang === 'en' ? 'All available' : '전체 기간');
    if (timeframe === 'month') return `${ymToLabel(from)} ~ ${ymToLabel(to)}`;
    return `${yearToLabel(from)} ~ ${yearToLabel(to)}`;
  }, [from, to, timeframe, lang]);

  const periodLabel = timeframe === 'month' ? ymToLabel(period) : yearToLabel(period);

  const seriesTableLimit = timeframe === 'month' ? 24 : 10;
  const seriesRows = useMemo(() => (series || []).slice(-seriesTableLimit), [series, seriesTableLimit]);
  const selectClass = "w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm";
  const fieldClass = "min-w-0";

  function SeriesPointCard({ r }) {
    return (
      <div className="min-w-0 max-w-full rounded-2xl border border-slate-100 bg-white p-4">
        <div className="flex flex-col gap-1 min-[390px]:flex-row min-[390px]:items-start min-[390px]:justify-between">
          <div className="break-words text-sm font-semibold text-slate-900">{fmtXPeriod(r.period)}</div>
          <div className="break-words text-xs text-slate-500">
            {lang === 'en' ? 'Tx' : '거래'}: {r.tx_count != null ? Number(r.tx_count).toLocaleString() : '-'}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 min-[390px]:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-slate-100 bg-white px-3 py-2">
            <div className="break-words text-[11px] leading-snug text-slate-500">{lang === 'en' ? 'Median (total)' : '중앙값(총액)'}</div>
            <div className="mt-0.5 break-words text-sm font-semibold text-slate-900">{fmtEokFromWon(r.median_price, lang)}</div>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-100 bg-white px-3 py-2">
            <div className="break-words text-[11px] leading-snug text-slate-500">{lang === 'en' ? 'Avg (total)' : '평균(총액)'}</div>
            <div className="mt-0.5 break-words text-sm font-semibold text-slate-900">{fmtEokFromWon(r.avg_price, lang)}</div>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-100 bg-white px-3 py-2">
            <div className="break-words text-[11px] leading-snug text-slate-500">{lang === 'en' ? 'Median /pyeong' : '중앙값/평'}</div>
            <div className="mt-0.5 break-words text-sm font-semibold text-slate-900">{fmtManPerPyeongFromWonPerM2(r.median_price_per_m2, lang)}</div>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-100 bg-white px-3 py-2">
            <div className="break-words text-[11px] leading-snug text-slate-500">{lang === 'en' ? 'Sum' : '총액'}</div>
            <div className="mt-0.5 break-words text-sm font-semibold text-slate-900">{fmtEokFromWon(r.sum_price, lang)}</div>
          </div>
        </div>
      </div>
    );
  }

  function TradeCard({ x }) {
    return (
      <div className="min-w-0 max-w-full rounded-2xl border border-slate-100 bg-white p-4">
        <div className="flex flex-col gap-1 min-[390px]:flex-row min-[390px]:items-start min-[390px]:justify-between">
          <div className="break-words text-sm font-semibold text-slate-900">
            {x.deal_date ? String(x.deal_date).slice(0, 10) : '-'}
          </div>
          <div className="break-words text-sm font-bold text-slate-900">{fmtEokFromMan(x.deal_amount_man, lang)}</div>
        </div>
        <div className="mt-2 break-words text-xs leading-relaxed text-slate-500">
          {lang === 'en' ? 'Area' : '전용'}: {x.area_m2 != null ? Number(x.area_m2).toFixed(1) : '-'}㎡
          {' · '}
          {lang === 'en' ? 'Pyeong' : '평'}: {fmtPyeongFromM2(x.area_m2)}
          {' · '}
          {lang === 'en' ? 'Floor' : '층'}: {x.floor != null ? x.floor : '-'}
          {' · '}
          {lang === 'en' ? 'Dong' : '동'}: {x.apt_dong || '-'}
        </div>
      </div>
    );
  }

  // chart value: KRW/㎡ → 만원/평(숫자)
  const toManPerPyeongNumber = (wonPerM2) => {
    const n = Number(wonPerM2);
    if (!Number.isFinite(n)) return NaN;
    const wonPerPyeong = n * M2_PER_PYEONG;
    return wonPerPyeong / 10_000; // 만원/평
  };

  const fmtYManPerPyeong = (v) => {
    if (!Number.isFinite(v)) return '-';
    return lang === 'en' ? `${Math.round(v).toLocaleString()} (10k KRW/py)` : `${Math.round(v).toLocaleString()}만원/평`;
  };
  const fmtXPeriod = (p) => {
    if (timeframe === 'month') return ymToLabel(p);
    return yearToLabel(p);
  };

  const blockingBusy = routeLoading || loadingOpt || (!firstFetchRef.current && loading);

  return (
    <>
      <BlockingOverlay
        show={blockingBusy}
        text={lang === 'en' ? 'Loading data...' : '데이터 불러오는 중...'}
      />
      <ToolSeo
        title={seoTitle}
        desc={seoDesc}
        image="https://res.cloudinary.com/dwonflmnn/image/upload/v1769749571/blog/insight/apt-dashboard-home-goal-roadmap-kr-img1.png"
        appName={seoTitle}
        appCategory="FinanceApplication"
        about={{ "@type": "Place", name: "South Korea" }}
        keywords={lang === "en" ? "Korea apartment transactions, real estate" : "한국 아파트 실거래, 부동산"}
        robots={seoRobots || 'index,follow,max-image-preview:large'}
      />

      <div className="card min-w-0 max-w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <Link href="/market/real-estate" className="inline-flex min-h-[44px] items-center text-sm text-slate-500 hover:underline">
              ← {lang === 'en' ? 'Back to list' : '목록으로'}
            </Link>

            <h1 className="mt-2 max-w-full break-words text-xl font-bold leading-tight text-slate-900 sm:text-2xl">{apt_name || '-'}</h1>
            <div className="mt-1 break-words text-sm text-slate-500">{dong_name || ''}</div>
            <p className="mt-3 max-w-3xl break-words text-sm leading-6 text-slate-600">
              {lang === 'en'
                ? `Review the latest official apartment transaction summary${seoStats?.latest_period ? ` for ${ymToLabel(seoStats.latest_period)}` : ''}, including median price, transaction count, unit price trend and recent deals.`
                : `최근 공식 아파트 실거래 요약${seoStats?.latest_period ? `(${ymToLabel(seoStats.latest_period)})` : ''}을 기준으로 대표가격, 거래량, 평단가 추이와 최근 거래를 함께 확인할 수 있습니다.`}
            </p>

            <div className="mt-3 flex min-w-0 flex-wrap gap-2 text-xs">
              <span className="max-w-full rounded-full bg-slate-100 px-3 py-1 text-slate-700 break-words">
                {lang === 'en' ? 'Snapshot' : '스냅샷'}: {timeframe} / {periodLabel} / {band}
              </span>
              <span className="max-w-full rounded-full bg-slate-100 px-3 py-1 text-slate-700 break-words">
                {lang === 'en' ? 'Range' : '추이범위'}: {rangeLabel}
              </span>
              {(stats?.household_count != null || stats?.dong_count != null) && (
                <span className="max-w-full rounded-full bg-slate-100 px-3 py-1 text-slate-700 break-words">
                  {lang === 'en' ? 'HH/Dong' : '세대/동'}: {fmtCount(stats?.household_count)} / {fmtCount(stats?.dong_count)}
                </span>
              )}
              {stats?.tx_count ? (
                <span className="max-w-full rounded-full bg-slate-100 px-3 py-1 text-slate-700 break-words">
                  {lang === 'en' ? 'Tx' : '거래'}: {Number(stats.tx_count).toLocaleString()}
                </span>
              ) : (
                <span className="max-w-full rounded-full bg-slate-100 px-3 py-1 text-slate-700 break-words">
                  {lang === 'en' ? 'No sample' : '표본 없음'}
                </span>
              )}
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 min-[390px]:grid-cols-2 md:w-auto md:flex md:items-center">
            {/* ✅ Desktop only: Cards/Table toggle */}
            <div className="hidden md:flex items-center gap-2">
              <button
                className={`min-h-[44px] px-3 py-2 rounded-lg border ${desktopView === 'card' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50'}`}
                onClick={() => setDesktopView('card')}
              >
                {lang === 'en' ? 'Cards' : '카드'}
              </button>
              <button
                className={`min-h-[44px] px-3 py-2 rounded-lg border ${desktopView === 'table' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50'}`}
                onClick={() => setDesktopView('table')}
              >
                {lang === 'en' ? 'Table' : '표'}
              </button>
            </div>

            <button
              className="min-h-[44px] min-w-0 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-50"
              onClick={fetchAll}
            >
              {lang === 'en' ? 'Refresh' : '새로고침'}
            </button>
          </div>
        </div>

        {/* 컨트롤 */}
        <div className="mt-5 grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 md:grid-cols-4">
          <div className={fieldClass}>
            <div className="text-sm text-slate-500 mb-1">{lang === 'en' ? 'Timeframe' : '집계'}</div>
            <select
              className={selectClass}
              value={timeframe}
              onChange={(e) => {
                const v = e.target.value;
                // ✅ year 전환시 period 형식 충돌 방지
                setPeriod('');
                setTimeframe(v);
                const rp = sanitizeRangePreset(v, rangePreset || defaultRangePreset(v));
                setRangePreset(rp);
                syncUrl({ timeframe: v, period: '', band, rangePreset: rp });
              }}
            >
              <option value="month">{lang === 'en' ? 'Monthly' : '월간'}</option>
              <option value="year">{lang === 'en' ? 'Yearly' : '년간'}</option>
            </select>
          </div>

          <div className={fieldClass}>
            <div className="text-sm text-slate-500 mb-1">{lang === 'en' ? 'Period (snapshot)' : '기간(스냅샷)'}</div>
            <select
              className={selectClass}
              value={period}
              onChange={(e) => {
                const v = e.target.value;
                setPeriod(v);
                syncUrl({ timeframe, period: v, band, rangePreset });
              }}
              disabled={!opt}
            >
              {(timeframe === 'month' ? opt?.periods?.months : opt?.periods?.years)?.map((p) => (
                <option key={p} value={p}>
                    {timeframe === 'month' ? ymToLabel(p) : yearToLabel(p)}
                </option>
              ))}
            </select>
            <div className="mt-1 text-[11px] text-slate-400">
              {lang === 'en'
                ? 'This affects KPI cards (single-period snapshot).'
                : 'KPI 카드(요약)는 이 “단일 기간 스냅샷” 기준입니다.'}
            </div>
          </div>

          <div className={fieldClass}>
            <div className="text-sm text-slate-500 mb-1">{lang === 'en' ? 'Trend range (from~to)' : '추이 범위(from~to)'}</div>
            <select
              className={selectClass}
              value={rangePreset}
              onChange={(e) => {
                const v = sanitizeRangePreset(timeframe, e.target.value);
                setRangePreset(v);
                syncUrl({ timeframe, period, band, rangePreset: v });
              }}
            >
              {timeframe === 'month' ? (
                <>
                  <option value="m12">{lang === 'en' ? 'Last 12 months' : '최근 12개월'}</option>
                  <option value="m24">{lang === 'en' ? 'Last 24 months' : '최근 24개월'}</option>
                  <option value="m36">{lang === 'en' ? 'Last 36 months' : '최근 36개월'}</option>
                  <option value="all">{lang === 'en' ? 'All' : '전체'}</option>
                </>
              ) : (
                <>
                  <option value="y5">{lang === 'en' ? 'Last 5 years' : '최근 5년'}</option>
                  <option value="y10">{lang === 'en' ? 'Last 10 years' : '최근 10년'}</option>
                  <option value="all">{lang === 'en' ? 'All' : '전체'}</option>
                </>
              )}
            </select>
            <div className="mt-1 text-[11px] text-slate-400">
              {lang === 'en'
                ? 'This range filters the chart and “latest deals in range”.'
                : '차트 + “범위 내 최근 거래”는 이 from~to 범위로 필터됩니다.'}
            </div>
          </div>

          <div className={fieldClass}>
            <div className="text-sm text-slate-500 mb-1">{lang === 'en' ? 'Band' : '평형'}</div>
            <select
              className={selectClass}
              value={band}
              onChange={(e) => {
                const v = e.target.value;
                setBand(v);
                syncUrl({ timeframe, period, band: v, rangePreset });
              }}
            >
              <option value="all">{lang === 'en' ? 'All' : '전체'}</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* 에러 */}
        {errMsg ? (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {lang === 'en' ? `Error: ${errMsg}` : `오류: ${errMsg}`}
          </div>
        ) : null}

        {/* KPI 카드 (스냅샷: period 1개) */}
        <div className="mt-6 grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <MiniCard
            title={lang === 'en' ? 'Typical price (median)' : '대표가격(중앙값)'}
            value={fmtEokFromWon(stats?.median_price, lang)}
            sub={lang === 'en' ? 'Snapshot (selected period)' : '선택한 기간 스냅샷'}
          />
          <MiniCard
            title={lang === 'en' ? 'Typical unit price' : '대표평단가'}
            value={fmtManPerPyeongFromWonPerM2(stats?.median_price_per_m2, lang)}
            sub={lang === 'en' ? 'Converted to per pyeong' : '만원/평 환산'}
          />
          <MiniCard
            title={lang === 'en' ? 'Latest deal (in snapshot)' : '최근 거래(스냅샷)'}
            value={fmtEokFromMan(stats?.latest_deal_amount_man, lang)}
            sub={stats?.latest_deal_date ? String(stats.latest_deal_date).slice(0, 10) : '-'}
          />
          <MiniCard
            title={lang === 'en' ? 'Transactions' : '거래량(건)'}
            value={stats?.tx_count != null ? Number(stats.tx_count).toLocaleString() : '-'}
            sub={lang === 'en' ? 'In snapshot period' : '선택기간 내 실거래(취소 제외)'}
          />
          <MiniCard
            title={lang === 'en' ? 'Households' : '세대수'}
            value={fmtCount(stats?.household_count)}
            sub={lang === 'en' ? 'Complex basis' : '단지 기본정보 기준'}
          />
          <MiniCard
            title={lang === 'en' ? 'Buildings' : '동수'}
            value={fmtCount(stats?.dong_count)}
            sub={lang === 'en' ? 'Complex basis' : '단지 기본정보 기준'}
          />
          <MiniCard
            title={lang === 'en' ? 'Parking' : '주차'}
            value={fmtParking(stats, lang)}
            sub={lang === 'en' ? 'Total (ground / basement)' : '전체(지상 / 지하)'}
          />
          <MiniCard
            title={lang === 'en' ? 'Heating / Management' : '난방 / 관리'}
            value={fmtHeatingManage(stats)}
            sub={lang === 'en' ? 'Complex basis' : '단지 기본정보 기준'}
          />
          <MiniCard
            title={lang === 'en' ? 'Approval date' : '사용승인일'}
            value={fmtDate(stats?.approval_date)}
            sub={lang === 'en' ? 'Complex basis' : '단지 기본정보 기준'}
          />
          <MiniCard
            title={lang === 'en' ? 'Total traded value' : '총 거래금액'}
            value={fmtEokFromWon(stats?.sum_price, lang)}
            sub={lang === 'en' ? 'Sum in snapshot' : '선택기간 합계'}
          />
          <MiniCard
            title={lang === 'en' ? 'Volatility (KRW/㎡)' : '변동성(㎡당)'}
            value={stats?.std_price_per_m2 != null ? `${Number(stats.std_price_per_m2).toLocaleString()} (KRW/㎡)` : '-'}
            sub={lang === 'en' ? 'Std dev of unit prices' : '㎡당 표준편차'}
          />
        </div>

        {/* 차트 (range: from~to) */}
        <div className="mt-8 min-w-0 max-w-full rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
          <div className="break-words text-lg font-bold text-slate-900">{lang === 'en' ? 'Price trend' : '가격 추이'}</div>
          <div className="mt-1 break-words text-sm leading-relaxed text-slate-500">
            {lang === 'en'
              ? `Range: ${rangeLabel} · Line: typical unit price (median), converted to 10k KRW per pyeong`
              : `범위: ${rangeLabel} · 선: 대표평단가(중앙값) — 만원/평 기준`}
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-400">{lang === 'en' ? 'Loading...' : '조회 중...'}</div>
          ) : (
            <div className="mt-3 min-w-0 max-w-full">
              <Sparkline
                rows={series}
                valueKey="median_price_per_m2"
                valueTransform={toManPerPyeongNumber}
                fmtY={fmtYManPerPyeong}
                fmtX={fmtXPeriod}
              />
            </div>
          )}

          <div className="mt-3 break-words text-[11px] text-slate-500">
            {lang === 'en'
              ? `Table shows latest ${seriesTableLimit} points (even if the range has more).`
              : `표는 범위 내에서도 최근 ${seriesTableLimit}개만 표시합니다.`}
          </div>

          {/* ✅ 모바일: 카드 고정 / 데스크탑: 토글 */}
          <div className={`${desktopView === 'card' ? '' : 'md:hidden'} mt-4 grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 lg:grid-cols-3`}>
            {seriesRows?.length ? (
              seriesRows.flatMap((r, idx) => {
                const out = [<SeriesPointCard key={`s-${r.period}`} r={r} />];
                const interval = 8;
                const shouldInsert = (idx + 1) % interval === 0 && (idx + 1) < seriesRows.length;
                if (shouldInsert) {
                  out.push(
                    <AdSenseUnit
                      key={`ad-series-${idx}`}
                      slot={INFEED_SLOT}
                      className="md:col-span-2 lg:col-span-3"
                      adTest={false}
                    />
                  );
                }
                return out;
              })
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-400 min-[390px]:col-span-2 lg:col-span-3">
                No series
              </div>
            )}
          </div>

          {desktopView === 'table' && (
            <div className="hidden md:block mt-4 max-w-full overflow-x-auto rounded-2xl border border-slate-100">
              <table className="min-w-[900px] w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-3">{lang === 'en' ? 'Period' : '기간'}</th>
                    <th className="py-2 pr-3">{lang === 'en' ? 'Tx' : '거래량'}</th>
                    <th className="py-2 pr-3">{lang === 'en' ? 'Median (total)' : '중앙값(총액)'}</th>
                    <th className="py-2 pr-3">{lang === 'en' ? 'Avg (total)' : '평균(총액)'}</th>
                    <th className="py-2 pr-3">{lang === 'en' ? 'Median /pyeong' : '중앙값/평'}</th>
                    <th className="py-2 pr-3">{lang === 'en' ? 'Sum' : '총액'}</th>
                  </tr>
                </thead>
                <tbody>
                  {seriesRows.map((r) => (
                    <tr key={r.period} className="border-b">
                      <td className="py-2 pr-3">{fmtXPeriod(r.period)}</td>
                      <td className="py-2 pr-3">{r.tx_count != null ? Number(r.tx_count).toLocaleString() : '-'}</td>
                      <td className="py-2 pr-3">{fmtEokFromWon(r.median_price, lang)}</td>
                      <td className="py-2 pr-3">{fmtEokFromWon(r.avg_price, lang)}</td>
                      <td className="py-2 pr-3">{fmtManPerPyeongFromWonPerM2(r.median_price_per_m2, lang)}</td>
                      <td className="py-2 pr-3">{fmtEokFromWon(r.sum_price, lang)}</td>
                    </tr>
                  ))}
                  {!seriesRows?.length ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">No series</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 최신 거래 (range: from~to) */}
        <div className="mt-8 min-w-0 max-w-full rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
          <div className="break-words text-lg font-bold text-slate-900">
            {lang === 'en' ? 'Latest deals in range' : '범위 내 최근 거래'}
          </div>
          <div className="mt-1 break-words text-sm leading-relaxed text-slate-500">
            {lang === 'en'
              ? `Filtered by range: ${rangeLabel} (canceled deals excluded).`
              : `추이 범위(${rangeLabel})로 필터되며, 취소거래는 제외합니다.`}
          </div>

          {/* ✅ 모바일: 카드 고정 / 데스크탑: 토글 + 카드 중간 광고 */}
          <div className={`${desktopView === 'card' ? '' : 'md:hidden'} mt-4 grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 lg:grid-cols-3`}>
            {(detail?.latest_trades || []).length ? (
              (detail.latest_trades).flatMap((x, idx) => {
                const out = [<TradeCard key={`t-${x.deal_date}-${idx}`} x={x} />];
                const interval = 6; // 6개마다 광고
                const shouldInsert = (idx + 1) % interval === 0 && (idx + 1) < detail.latest_trades.length;
                if (shouldInsert) {
                  out.push(
                    <AdSenseUnit
                      key={`ad-trade-${idx}`}
                      slot={INFEED_SLOT}
                      className="md:col-span-2 lg:col-span-3"
                      adTest={false}
                    />
                  );
                }
                return out;
              })
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-400 min-[390px]:col-span-2 lg:col-span-3">
                {lang === 'en' ? 'No trades' : '거래 없음'}
              </div>
            )}
          </div>

          {desktopView === 'table' && (
            <div className="hidden md:block mt-4 max-w-full overflow-x-auto rounded-2xl border border-slate-100">
              <table className="min-w-[900px] w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-3">{lang === 'en' ? 'Date' : '계약일'}</th>
                    <th className="py-2 pr-3">{lang === 'en' ? 'Price' : '거래금액'}</th>
                    <th className="py-2 pr-3">{lang === 'en' ? 'Area(㎡)' : '전용(㎡)'}</th>
                    <th className="py-2 pr-3">{lang === 'en' ? 'Pyeong' : '평'}</th>
                    <th className="py-2 pr-3">{lang === 'en' ? 'Floor' : '층'}</th>
                    <th className="py-2 pr-3">{lang === 'en' ? 'Dong' : '동'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail?.latest_trades || []).map((x, i) => (
                    <tr key={`${x.deal_date}-${i}`} className="border-b">
                      <td className="py-2 pr-3">{x.deal_date ? String(x.deal_date).slice(0, 10) : '-'}</td>
                      <td className="py-2 pr-3">{fmtEokFromMan(x.deal_amount_man, lang)}</td>
                      <td className="py-2 pr-3">{x.area_m2 != null ? Number(x.area_m2).toFixed(1) : '-'}</td>
                      <td className="py-2 pr-3">{fmtPyeongFromM2(x.area_m2)}</td>
                      <td className="py-2 pr-3">{x.floor != null ? x.floor : '-'}</td>
                      <td className="py-2 pr-3">{x.apt_dong || '-'}</td>
                    </tr>
                  ))}

                  {!detail?.latest_trades?.length ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {lang === 'en' ? 'No trades' : '거래 없음'}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 break-words text-xs leading-relaxed text-slate-500">
          {lang === 'en'
            ? 'KPI cards are snapshot-by-period; the trend chart & latest-deals are filtered by the range.'
            : '정리: KPI 카드는 “단일 기간 스냅샷”, 차트/최근거래는 “from~to 범위” 기준입니다.'}
        </div>
      </div>
    </>
  );
}
