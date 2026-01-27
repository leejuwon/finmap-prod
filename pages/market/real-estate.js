import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import ToolSeo from "../../_components/ToolSeo";
import AdSenseUnit from '../../_components/AdSenseUnit'; // 예시
import { AD_SLOTS } from '../../config/adSlots';

const M2_PER_PYEONG = 3.305785;

const INFEED_SLOT = AD_SLOTS.responsiveBottom;


function numOrNull(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function fmtPct(x) {
  const n = numOrNull(x);
  if (n == null) return '-';
  const s = n > 0 ? '+' : '';
  return `${s}${n.toFixed(2)}%`;
}

function fmtEokFromWon(won, lang) {
  const n = numOrNull(won);
  if (n == null) return '-';
  const eok = n / 100_000_000;
  const v = eok.toFixed(3);
  return lang === 'en' ? `${v}×100M KRW` : `${v}억원`;
}

function fmtSignedEokFromWon(won, lang) {
  const n = numOrNull(won);
  if (n == null) return '-';
  const eok = n / 100_000_000;
  const v = Math.abs(eok).toFixed(3);
  const sign = eok > 0 ? '+' : eok < 0 ? '-' : '';
  return lang === 'en' ? `${sign}${v}×100M` : `${sign}${v}억`;
}


function fmtEokFromMan(man, lang) {
  const n = numOrNull(man);
  if (n == null) return '-';
  const eok = n / 10_000; // 만원 -> 억
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

function fmtDelta(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return '-';
  return n > 0 ? `+${n}` : `${n}`;
}

// 신뢰도(quality) 기본 계산: 거래량(표본수) 기반
// - API에서 quality_grade/quality_score가 오면 그걸 우선 사용
function qualityFromTxCount(txCount) {
  const n = Number(txCount);
  if (!Number.isFinite(n) || n < 0) return { score: null, grade: null };
  // score: 0~100 (log scale, 50건 근처면 100에 가깝게)
  const score = Math.max(0, Math.min(100, Math.round((Math.log10(n + 1) / Math.log10(51)) * 100)));
  const grade =
    n >= 30 ? 'A' :
    n >= 15 ? 'B' :
    n >= 5  ? 'C' : 'D';
  return { score, grade };
}



// value 기준 중복 제거 (특히 'all' 중복 방지)
function dedupeOptions(list) {
  const seen = new Set();
  const out = [];
  for (const o of list || []) {
    const v = o?.value;
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(o);
  }
  return out;
}

const TEXT = {
  ko: {
    title: '대한민국 아파트 실거래 대시보드',
    subtitle: '국토부 실거래(아파트 매매) 기반 단지 Top 랭킹 — 조건 필터 → Top 기준으로 랭킹',
    sido: '시도',
    sigungu: '시군구',
    timeframe: '집계',
    period: '기간',
    topBy: 'Top 기준',
    sort: '정렬',
    top: 'Top',
    pyeong: '평형',
    buildYear: '년식',
    regDate: '등기일',
    all: '전체',
    month: '월간',
    year: '년간',
    asc: '하위(오름차순)',
    desc: '상위(내림차순)',
    metrics: {
      tx_count: '거래량',
      median_price: '대표가격(중앙값, 총액)',
      avg_price: '평균(총액)',
      max_price: '최고 거래금액(기간 내 1건 최대)',
      sum_price: '총 거래금액(기간 합계)',
      median_price_per_m2: '대표평단가(중앙값, ㎡당)',
      avg_price_per_m2: '평균(㎡당)',
    },
    metricHelp:
      '대표가격(중앙값)은 “가운데 값(극단값 영향↓)”입니다. “㎡당”은 (거래총액 ÷ 전용㎡)을 거래별로 계산 후 단지 내 평균/중앙값을 냅니다. 표에는 만원/평도 함께 표시합니다.',
    legendTitle: '기준/계산 방식',
    legendLines: [
      '기간 기준: 계약월(deal_ym).',
      '제외: 취소거래(cancel_yn="Y").',
      '단지 집계: 선택 기간 내 단지별 거래값(총액/㎡당)의 평균·대표(중앙값).',
      '평단가(만원/평): (원/㎡) × 3.305785 ÷ 10,000.',
      '금액 표기: 억(=100,000,000원) 단위.',
      '열기(Heat): 대표평단가(전월%) + 거래량(전월%) + 신뢰도를 합산한 0~100 점수입니다.',
      '주의: 거래량이 적으면(신뢰도 C/D) 전월/전년 변화율은 왜곡될 수 있어요.',
    ],
    cols: {
      rank: '#',
      area: '시군구',
      apt: '단지(최근거래)',
      areaM2: '전용(㎡)',
      pyeong: '평형(평)',
      build: '년식',
      dealDate: '계약일',
      regDate: '등기일',
      dealEok: '거래금액(억)',
      tx: '거래량',
      medEok: '대표(억)',
      avgEok: '평균(억)',
      medPy: '대표평단가',
      avgPy: '평균평단가',
      quality: '신뢰도',
      heat: '열기',
      move: '무브',
      premium: '동 대비',
      medDeltaMom: '대표Δ(전월)',
      medDeltaYoy: '대표Δ(전년)',
      rankMom: '순위Δ(전월)',
      rankYoy: '순위Δ(전년동월)',
      txMom: '거래량%(전월)',
      txYoy: '거래량%(전년동월)',
      medMom: '중위%(전월)',
      medYoy: '중위%(전년동월)',
      avgMom: '평균%(전월)',
      avgYoy: '평균%(전년동월)',
    },
    tip: 'Tip: 경기도는 “수원시 전체 / 수원시 영통구”처럼 구가 있는 도시가 따로 뜹니다.',
    seoDesc:
      '대한민국 아파트 실거래(국토부) 기반 Top 랭킹 대시보드. 지역/기간/평형/년식 필터로 단지별 거래량·중위·평균·평단가를 비교하세요.',
  },
  en: {
    title: 'South Korea Apartment Transaction Dashboard (KRW)',
    subtitle: 'Official RTMS-based apartment sale data — ranked Top complexes by your metric',
    sido: 'Province/Metro',
    sigungu: 'City/District',
    timeframe: 'Timeframe',
    period: 'Period',
    topBy: 'Rank Metric',
    sort: 'Sort',
    top: 'Top',
    pyeong: 'Size',
    buildYear: 'Build Year',
    regDate: 'Reg. date',
    all: 'All',
    month: 'Monthly',
    year: 'Yearly',
    asc: 'Bottom (Asc)',
    desc: 'Top (Desc)',
    metrics: {
      tx_count: 'Transactions',
      median_price: 'Typical (Median, Total)',
      avg_price: 'Average (Total)',
      max_price: 'Highest deal (max in period)',
      sum_price: 'Total traded value (sum in period)',
      median_price_per_m2: 'Typical (Median, /㎡)',
      avg_price_per_m2: 'Average (/㎡)',
    },
    metricHelp:
      '“Typical (Median)” is the middle value (less sensitive to extremes). “/㎡” is (total ÷ area㎡) per deal, then averaged/median across deals. Table also shows 10k KRW per pyeong.',
    legendTitle: 'Basis & methodology',
    legendLines: [
      'Period basis: contract month (deal_ym).',
      'Excludes: canceled deals (cancel_yn="Y").',
      'Complex aggregation: average/median within the selected period.',
      'Per-pyeong (10k KRW/pyeong): (KRW/㎡) × 3.305785 ÷ 10,000.',
      'Money display: ×100M KRW (억).',
      'Note: with small samples (Quality C/D), MoM/YoY % can be noisy.',
    ],
    cols: {
      rank: '#',
      area: 'Area',
      apt: 'Complex (latest deal)',
      areaM2: 'Area(㎡)',
      pyeong: 'Pyeong',
      build: 'Build',
      dealDate: 'Deal date',
      regDate: 'Reg. date',
      dealEok: 'Deal (×100M)',
      tx: 'Tx',
      medEok: 'Typical (×100M)',
      avgEok: 'Avg (×100M)',
      medPy: 'Typical /pyeong',
      avgPy: 'Avg /pyeong',
      quality: 'Quality',
      heat: 'Heat',
      move: 'Move',
      premium: 'vs Area',
      medDeltaMom: 'Typical Δ (MoM)',
      medDeltaYoy: 'Typical Δ (YoY)',
      rankMom: 'RankΔ (MoM)',
      rankYoy: 'RankΔ (YoY)',
      txMom: 'Tx% (MoM)',
      txYoy: 'Tx% (YoY)',
      medMom: 'Median% (MoM)',
      medYoy: 'Median% (YoY)',
      avgMom: 'Avg% (MoM)',
      avgYoy: 'Avg% (YoY)',
    },
    tip: 'Tip: In Gyeonggi, cities with districts show “City All / City District” options.',
    seoDesc:
      'A KRW-based dashboard for South Korea apartment sale transactions. Filter by region/period/size/build-year and compare transactions, median/average price, and price per pyeong.',
  },
};

export default function RealEstatePage() {
  const router = useRouter();
  const lang = (router.locale || 'ko').startsWith('en') ? 'en' : 'ko';
  const t = TEXT[lang];

  const [opt, setOpt] = useState(null);
  const [areas, setAreas] = useState([]); // trade-areas 결과

  const [sido, setSido] = useState('all');
  const [area, setArea] = useState('all'); // all | lawd | lawd|gu
  const [timeframe, setTimeframe] = useState('month');
  const [period, setPeriod] = useState('');

  const [topBy, setTopBy] = useState('avg_price');
  const [sort, setSort] = useState('desc');
  const [top, setTop] = useState('100');

  const [pyeong, setPyeong] = useState('all');
  const [buildFrom, setBuildFrom] = useState('all');
  const [buildTo, setBuildTo] = useState('all');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Desktop view toggles (카드/테이블) + Advanced
  const [desktopView, setDesktopView] = useState('card'); // 'card' | 'table'
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [expandedAptKey, setExpandedAptKey] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const v = window.localStorage.getItem('re_desktop_view');
    const a = window.localStorage.getItem('re_show_advanced');
    if (v === 'card' || v === 'table') setDesktopView(v);
    if (a === '1' || a === '0') setShowAdvanced(a === '1');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('re_desktop_view', desktopView);
  }, [desktopView]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('re_show_advanced', showAdvanced ? '1' : '0');
  }, [showAdvanced]);

  // ---------- (A) SEO (중복 제거) ----------
  // ToolSeo 안에서 canonical/hreflang/og/twitter/json-ld를 처리하므로
  // 이 페이지에서는 title/desc만 준비해서 ToolSeo에 넘깁니다.
  const seoTitle = t.title;
  const seoDesc = t.seoDesc;    


  // ---------- 옵션 로드 ----------
  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/re/options?lang=${encodeURIComponent(lang)}`);
      const j = await r.json();
      if (j?.ok) {
        setOpt(j);

        if (!period) {
          if (timeframe === 'month') setPeriod(j.periods?.maxYm || (j.periods?.months?.[j.periods.months.length - 1] || ''));
          else setPeriod((j.periods?.years?.[j.periods.years.length - 1] || ''));
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회

  // timeframe 변경 시 period 자동 보정
  useEffect(() => {
    if (!opt) return;
    if (timeframe === 'month') setPeriod(opt.periods?.maxYm || (opt.periods?.months?.[opt.periods.months.length - 1] || ''));
    else setPeriod(opt.periods?.years?.[opt.periods.years.length - 1] || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, opt]);

  // sido 변경 → area 초기화 + trade-areas 로드(경기도 구 포함)
  useEffect(() => {
    setArea('all');
    (async () => {
      if (!sido || sido === 'all') {
        setAreas([]);
        return;
      }
      try {
        const r = await fetch(`/api/re/trade-areas?sido=${encodeURIComponent(sido)}&lang=${encodeURIComponent(lang)}`);
        const j = await r.json();
        if (j?.ok) setAreas(j.areas || j.rows || j.items || []);
        else setAreas([]);
      } catch {
        setAreas([]);
      }
    })();
  }, [sido, lang]);

  // bilingual label picker
  function labelOf(x, preferParenKo = false) {
    const ko = x?.label_ko ?? x?.name_ko ?? x?.label ?? x?.name ?? '';
    const en = x?.label_en ?? x?.name_en ?? x?.label ?? x?.name ?? '';
    if (lang === 'en') {
      if (preferParenKo && ko && en && ko !== en) return `${en} (${ko})`;
      return en || ko;
    }
    return ko || en;
  }

  const sidoOptions = useMemo(() => {
  if (opt?.sidos?.length) {
    return opt.sidos.map((x) => ({
      value: String(x.value ?? x.code ?? ''),
      label_ko: x.label_ko || x.name_ko || x.name || '',
      label_en: x.label_en || x.name_en || x.name || '',
    }));
  }

  return [
    { value: 'all', label_ko: '전체', label_en: 'All' },
    { value: '11', label_ko: '서울특별시', label_en: 'Seoul' },
    { value: '28', label_ko: '인천광역시', label_en: 'Incheon' },
    { value: '41', label_ko: '경기도', label_en: 'Gyeonggi-do' },
  ];
}, [opt]);


  const areaOptions = useMemo(() => {
    const base = [{ value: 'all', label_ko: t.all, label_en: t.all }];

    // trade-areas 우선
    if (areas && areas.length) {
      const mapped = areas.map((x) => ({
        value: String(x.value ?? x.code ?? ''),
        label_ko: x.label_ko || x.name_ko || x.name || x.label || '',
        label_en: x.label_en || x.name_en || x.name || x.label || x.label_ko || x.name_ko || '',
      }));
      return dedupeOptions(base.concat(mapped));
    }

    // fallback: options의 sigunguBySido
    const arr = opt?.sigunguBySido?.[sido] || [];
    const mapped = arr.map((x) => ({
      value: String(x.value ?? x.code ?? ''),
      label_ko: x.label_ko ?? x.name_ko ?? x.name ?? '',
      label_en: x.label_en ?? x.name_en ?? x.name ?? x.label_ko ?? x.name_ko ?? '',
    }));
    return dedupeOptions(base.concat(mapped));
  }, [areas, opt, sido, lang, t.all]);

  const periodOptions = useMemo(() => {
    if (!opt) return [];
    return timeframe === 'month' ? (opt.periods?.months || []) : (opt.periods?.years || []);
  }, [opt, timeframe]);

  function parseAreaValue(v) {
    if (!v || v === 'all') return { lawd: '', gu: '' };
    const s = String(v);
    if (s.includes('|')) {
      const [lawdCd, guName] = s.split('|');
      return { lawd: lawdCd || '', gu: guName || '' };
    }
    return { lawd: s, gu: '' };
  }

  async function fetchTop() {
    if (!period) return;

    const { lawd, gu } = parseAreaValue(area);

    setLoading(true);
    try {
      const qs = new URLSearchParams({
        timeframe,
        period,
        sido,
        metric: topBy,
        order: sort,
        top,
        pyeong,
        compare: 'both',
      });
      if (lawd) qs.set('lawd', lawd);
      if (gu) qs.set('gu', gu);
      if (buildFrom !== 'all') qs.set('buildFrom', buildFrom);
      if (buildTo !== 'all') qs.set('buildTo', buildTo);

      const r = await fetch(`/api/re/trade-top?${qs.toString()}`);
      const j = await r.json();
      if (j.ok) setRows(j.rows || []);
      else setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!opt || !period) return;
    fetchTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opt, timeframe, period, sido, area, topBy, sort, top, pyeong, buildFrom, buildTo]);

  function renderArea(row) {
    if (row.sido_name !== '경기도') return row.sigungu_name || '-';
    const guDisp = row.gu_name ? row.gu_name : (lang === 'en' ? 'All' : '전체');
    return `${row.sigungu_name || ''} ${guDisp}`.trim();
  }

  function renderApt(row) {
    const dong = row.latest_apt_dong ? ` ${row.latest_apt_dong}` : '';
    const fl = row.latest_floor != null ? ` (${row.latest_floor}${lang === 'en' ? 'F' : '층'})` : '';
    return `${row.apt_name}${dong}${fl}`;
  }

  const tableMinWidth = showAdvanced ? 'min-w-[2500px]' : 'min-w-[1900px]';

  // --- real-estate.js 안에 (컴포넌트 return 위쪽) 추가: 작은 UI 컴포넌트들 ---
  function toneByNumber(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "bg-slate-100 text-slate-700";
    if (n > 0) return "bg-emerald-50 text-emerald-700";
    if (n < 0) return "bg-rose-50 text-rose-700";
    return "bg-slate-100 text-slate-700";
  }
    
  function MiniStat({ label, value }) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
        <div className="text-[11px] text-slate-500">{label}</div>
        <div className="mt-0.5 text-sm font-semibold text-slate-900">{value ?? "-"}</div>
      </div>
    );
  }

  function Chip({ children, tone }) {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${tone}`}>
        {children}
      </span>
    );
  }
  
  function QualityChip({ row }) {
    const derived = qualityFromTxCount(row?.tx_count);
    const grade = row?.quality_grade || derived.grade || null;
    const score = (row?.quality_score != null) ? row.quality_score : derived.score;     
    const label = lang === 'en' ? 'Quality' : '신뢰도';
    const text = grade ? `${label} ${grade}` : (score != null ? `${label} ${score}` : `${label} -`);
    // A/B/C/D 기준으로 톤
    const tone =
      grade === 'A' ? 'bg-emerald-50 text-emerald-700' :
      grade === 'B' ? 'bg-sky-50 text-sky-700' :
      grade === 'C' ? 'bg-amber-50 text-amber-700' :
      grade === 'D' ? 'bg-rose-50 text-rose-700' :
      'bg-slate-100 text-slate-700';
    return <Chip tone={tone}>{text}</Chip>;
  }


  function localizeHeatLabel(label) {
    if (lang === 'en') return label || '';
    const m = {
      Hot: '과열',
      Warm: '강세',
      Neutral: '중립',
      Cool: '약세',
      Cold: '침체',
    };
    return m[label] || (label || '');
  }

  function toneByHeatLabel(label) {
    return label === 'Hot' ? 'bg-emerald-50 text-emerald-700'
      : label === 'Warm' ? 'bg-sky-50 text-sky-700'
      : label === 'Neutral' ? 'bg-slate-100 text-slate-700'
      : label === 'Cool' ? 'bg-amber-50 text-amber-700'
      : label === 'Cold' ? 'bg-rose-50 text-rose-700'
      : 'bg-slate-100 text-slate-700';
  }

  function HeatChip({ row }) {
    const score = row?.heat_score != null ? Number(row.heat_score) : null;
    const label = row?.heat_label || null;
    if (!label && score == null) return null;
    const base = (lang === 'en') ? 'Heat' : t.cols.heat;
    const labelText = localizeHeatLabel(label);
    const text = `${base} ${labelText}${score != null && Number.isFinite(score) ? ` ${score}` : ''}`;
    return <Chip tone={toneByHeatLabel(label)}>{text}</Chip>;
  }

  function localizeMoveQuality(label) {
    if (!label) return '';
    if (lang === 'en') return label;
    const m = {
      'Healthy Breakout': '건강한 돌파',
      'Thin Jump': '얇은 상승',
      'Distribution': '분산(거래↑·가격↓)',
      'Quiet Drift': '조용한 하락',
      'Mixed': '혼조',
      'N/A': '정보없음',
    };
    return m[label] || label;
  }

  function toneByMoveQuality(label) {
    return label === 'Healthy Breakout' ? 'bg-emerald-50 text-emerald-700'
      : label === 'Thin Jump' ? 'bg-amber-50 text-amber-700'
      : label === 'Distribution' ? 'bg-rose-50 text-rose-700'
      : label === 'Quiet Drift' ? 'bg-slate-100 text-slate-700'
      : label === 'Mixed' ? 'bg-sky-50 text-sky-700'
      : 'bg-slate-100 text-slate-700';
  }

  function MoveQualityChip({ row }) {
    const label = row?.move_quality_label || null;
    if (!label || label === 'N/A') return null;
    const base = (lang === 'en') ? 'Move' : t.cols.move;
    return <Chip tone={toneByMoveQuality(label)}>{base} {localizeMoveQuality(label)}</Chip>;
  }

  function localizeValuationLabel(label) {
    if (!label) return '';
    if (lang === 'en') return label;
    const m = {
      Premium: '프리미엄',
      'Slight Premium': '약프리미엄',
      Neutral: '중립',
      'Slight Discount': '약할인',
      Discount: '할인',
    };
    return m[label] || label;
  }

  function PremiumChip({ row }) {
    const pct = row?.premium_vs_area_pct;
    if (pct == null || !Number.isFinite(Number(pct))) return null;
    const label = row?.valuation_label || null;
    const base = (lang === 'en') ? 'vs Area' : t.cols.premium;
    const text = `${base} ${fmtPct(pct)}${label ? ` · ${localizeValuationLabel(label)}` : ''}`;
    return <Chip tone={toneByNumber(pct)}>{text}</Chip>;
  }

  function ThinMarketChip({ row }) {
    if (!row?.thin_market_flag) return null;
    const th = row?.thin_market_threshold;
    const text = (lang === 'en')
      ? `Thin (tx < ${th ?? '-'})`
      : `표본주의(거래 < ${th ?? '-'})`;
    return <Chip tone="bg-rose-50 text-rose-700">{text}</Chip>;
  }

  function ResultCard({ r, idx }) {
    const areaText = renderArea(r);
    const aptText = renderApt(r);

    const rowKey = r.apt_key || `${r.lawd_cd}-${r.apt_name}-${idx}`;
    const expanded = expandedAptKey === rowKey;

    const dealEok = fmtEokFromMan(r.latest_deal_amount_man, lang);
    const medEok = fmtEokFromWon(r.median_price, lang);
    const avgEok = fmtEokFromWon(r.avg_price, lang);
    const maxEok = fmtEokFromWon(r.max_price, lang);
    const sumEok = fmtEokFromWon(r.sum_price, lang);

    const medPyeong = fmtManPerPyeongFromWonPerM2(r.median_price_per_m2, lang);
    const momRank = fmtDelta(r.mom_rank_delta);
    const yoyRank = fmtDelta(r.yoy_rank_delta);

    const momTx = fmtPct(r.mom_tx_count_pct);
    const yoyTx = fmtPct(r.yoy_tx_count_pct);

    const momMedDelta = fmtSignedEokFromWon(r.mom_median_price_delta_won, lang);
    const yoyMedDelta = fmtSignedEokFromWon(r.yoy_median_price_delta_won, lang);

    const sizeM2 = r.latest_area_m2 != null ? `${Number(r.latest_area_m2).toFixed(1)}㎡` : '-';
    const sizePy = r.latest_area_m2 != null ? `${fmtPyeongFromM2(r.latest_area_m2)}${lang === 'en' ? 'pyeong' : '평'}` : '-';
    const buildYVal = (r.latest_build_year ?? r.build_year);
    const buildY = buildYVal != null ? `${buildYVal}${lang === 'en' ? '' : '년식'}` : '-';
    const dealDate = r.latest_deal_date ? String(r.latest_deal_date).slice(0, 10) : '-';    

    return (
      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-slate-500">
              {r.rank_no}. {areaText}
            </div>
            {/* ✅ 아파트명: 기본 말줄임 + hover title + 모바일 탭 펼침 */}
            <button
              type="button"
              title={aptText}
              onClick={() => setExpandedAptKey(expanded ? null : rowKey)}
              className={`mt-0.5 w-full text-left text-base font-semibold text-slate-900 ${
                expanded ? "whitespace-normal break-words" : "truncate"
              }`}
            >
              {aptText}
            </button>            
            <div className="mt-1 text-xs text-slate-500">
              {sizeM2} · {sizePy} · {buildY} · {dealDate}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <QualityChip row={r} />
            <HeatChip row={r} />
            <div className="text-xs text-slate-500">
              {t.metrics.tx_count}: {r.tx_count?.toLocaleString?.() ?? r.tx_count}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <MiniStat label={t.metrics.median_price} value={medEok} />
          <MiniStat label={t.metrics.avg_price} value={avgEok} />
          <MiniStat label={lang === 'en' ? 'Typical /pyeong' : '대표 평단가'} value={medPyeong} />
          <MiniStat label={lang === 'en' ? 'Latest deal' : '최근 거래'} value={dealEok} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <MoveQualityChip row={r} />
          <PremiumChip row={r} />
          <ThinMarketChip row={r} />
          <Chip tone={toneByNumber(r.mom_rank_delta)}>{t.cols.rankMom} {momRank}</Chip>
          <Chip tone={toneByNumber(r.yoy_rank_delta)}>{t.cols.rankYoy} {yoyRank}</Chip>

          <Chip tone={toneByNumber(r.mom_tx_count_pct)}>{t.cols.txMom} {momTx}</Chip>
          <Chip tone={toneByNumber(r.yoy_tx_count_pct)}>{t.cols.txYoy} {yoyTx}</Chip>

          <Chip tone={toneByNumber(r.mom_median_price_delta_won)}>{t.cols.medDeltaMom} {momMedDelta}</Chip>
          <Chip tone={toneByNumber(r.yoy_median_price_delta_won)}>{t.cols.medDeltaYoy} {yoyMedDelta}</Chip>         
        </div>

        {showAdvanced && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniStat label={lang === 'en' ? 'Max deal (×100M)' : '최고 거래(억)'} value={maxEok} />
            <MiniStat label={lang === 'en' ? 'Total value (×100M)' : '총 거래금액(억)'} value={sumEok} />
          </div>
        )}


        {showAdvanced && (          
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip tone={toneByNumber(r.mom_median_price_pct)}>{t.cols.medMom} {fmtPct(r.mom_median_price_pct)}</Chip>
            <Chip tone={toneByNumber(r.yoy_median_price_pct)}>{t.cols.medYoy} {fmtPct(r.yoy_median_price_pct)}</Chip>
            <Chip tone={toneByNumber(r.mom_avg_price_pct)}>{t.cols.avgMom} {fmtPct(r.mom_avg_price_pct)}</Chip>
            <Chip tone={toneByNumber(r.yoy_avg_price_pct)}>{t.cols.avgYoy} {fmtPct(r.yoy_avg_price_pct)}</Chip>           
          </div>
        )}
      </div>
    );
  }

  return (
      <>
      <ToolSeo
        title={seoTitle}
        desc={seoDesc}
        image="/og-tools/real-estate.png"
        appName={seoTitle}
        appCategory="FinanceApplication"
        about={{ "@type": "Place", name: "South Korea" }}
        keywords={lang === "en" ? "Korea real estate, apartment transactions" : "한국 부동산, 아파트 실거래"}
      />
        <div className="card">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-slate-600 mt-1">{t.subtitle}</p>

          {/* (B) legend 박스 */}
          <div className="mt-4 rounded-xl border bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-700">{t.legendTitle}</div>
            <ul className="mt-2 text-sm text-slate-600 list-disc pl-5 space-y-1">
              {t.legendLines.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mt-5">
            <div>
              <div className="text-sm text-slate-500 mb-1">{t.sido}</div>
              <select className="w-full border rounded-lg px-3 py-2" value={sido} onChange={(e) => setSido(e.target.value)}>
                {sidoOptions.map((x) => (
                  <option key={x.value} value={x.value}>
                    {labelOf(x, true)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">{t.sigungu}</div>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                disabled={sido === 'all'}
              >
                {areaOptions.map((x) => (
                  <option key={x.value} value={x.value}>
                    {labelOf(x, lang === 'en')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">{t.timeframe}</div>
              <select className="w-full border rounded-lg px-3 py-2" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="month">{t.month}</option>
                <option value="year">{t.year}</option>
              </select>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">{t.period}</div>
              <select className="w-full border rounded-lg px-3 py-2" value={period} onChange={(e) => setPeriod(e.target.value)}>
                {periodOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">{t.topBy}</div>
              <select className="w-full border rounded-lg px-3 py-2" value={topBy} onChange={(e) => setTopBy(e.target.value)}>
                {Object.entries(t.metrics).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <div className="text-[11px] text-slate-400 mt-1">{t.metricHelp}</div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">{t.sort}</div>
              <select className="w-full border rounded-lg px-3 py-2" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="desc">{t.desc}</option>
                <option value="asc">{t.asc}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mt-3">
            <div>
              <div className="text-sm text-slate-500 mb-1">{t.top}</div>
              <select className="w-full border rounded-lg px-3 py-2" value={top} onChange={(e) => setTop(e.target.value)}>
                {['10', '20', '50', '100'].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">{t.pyeong}</div>
              <select className="w-full border rounded-lg px-3 py-2" value={pyeong} onChange={(e) => setPyeong(e.target.value)}>
                <option value="all">{t.all}</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="text-sm text-slate-500 mb-1">{t.buildYear}</div>
              <div className="flex gap-2">
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={buildFrom}
                  onChange={(e) => {
                    setBuildFrom(e.target.value);
                    if (buildTo === 'all') setBuildTo(e.target.value);
                  }}
                >
                  <option value="all">{t.all}</option>
                  {Array.from({ length: 60 }).map((_, i) => {
                    const y = 1970 + i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>

                <select className="w-full border rounded-lg px-3 py-2" value={buildTo} onChange={(e) => setBuildTo(e.target.value)}>
                  <option value="all">{t.all}</option>
                  {Array.from({ length: 60 }).map((_, i) => {
                    const y = 1970 + i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="md:col-span-2 flex items-end">
              <div className="text-sm text-slate-500">{t.tip}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                {loading ? (lang === 'en' ? 'Loading...' : '조회 중...') : (lang === 'en' ? `Rows: ${rows.length}` : `건수: ${rows.length}`)}
              </div>
              <div className="flex items-center gap-2">
                {/* Desktop only: Cards/Table toggle + Advanced */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    className={`px-3 py-2 rounded-lg border ${desktopView === 'card' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50'}`}
                    onClick={() => setDesktopView('card')}
                  >
                    {lang === 'en' ? 'Cards' : '카드'}
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg border ${desktopView === 'table' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50'}`}
                    onClick={() => setDesktopView('table')}
                  >
                    {lang === 'en' ? 'Table' : '표'}
                  </button>                  
                </div>
                {/* Advanced: 모바일/데스크탑 공통 */}
                <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" checked={showAdvanced} onChange={(e) => setShowAdvanced(e.target.checked)} />
                  {lang === 'en' ? 'Advanced' : '고급'}
                </label>
                <button className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50" onClick={fetchTop}>
                  {lang === 'en' ? 'Refresh' : '새로고침'}
                </button>
              </div>
            </div>

            {/* Cards: always on mobile. On desktop, shown when desktopView === 'card' */}
            <div className={`${desktopView === 'card' ? '' : 'md:hidden'} mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3`}>               
              {!loading && rows?.length === 0 && (
                <div className="card text-center text-slate-500 py-10 md:col-span-2 lg:col-span-3">                  
                  {lang === 'en' ? 'No results' : '결과 없음'}
                </div>
              )}

              {rows?.flatMap((r, idx) => {
                const out = [
                  <ResultCard
                    key={r.apt_key || `${r.lawd_cd}-${r.apt_name}-${idx}`}
                    r={r}
                    idx={idx}
                  />
                ];

                const interval = 6; // 6개마다 1개 광고
                const shouldInsert = (idx + 1) % interval === 0 && (idx + 1) < rows.length;

                if (shouldInsert) {
                  out.push(
                    <AdSenseUnit
                      key={`ad-infeed-${idx}`}
                      slot={INFEED_SLOT}
                      className="md:col-span-2 lg:col-span-3" // grid 전체 폭 차지
                      adTest={false} // 테스트 시 true
                    />
                  );
                }

                return out;
              })}

            </div>            

            {/* Desktop table */}
            {desktopView === 'table' && (
              <div className="hidden md:block overflow-x-auto mt-3">
                <table className={`${tableMinWidth} w-full text-sm`}>
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-3 pr-3">{t.cols.rank}</th>
                    <th className="py-3 pr-3">{t.cols.area}</th>
                    <th className="py-3 pr-3">{t.cols.apt}</th>
                    <th className="py-3 pr-3">{t.cols.areaM2}</th>
                    <th className="py-3 pr-3">{t.cols.pyeong}</th>
                    <th className="py-3 pr-3">{t.cols.build}</th>
                    <th className="py-3 pr-3">{t.cols.dealDate}</th>
                    <th className="py-3 pr-3">{t.cols.dealEok}</th>

                    <th className="py-3 pr-3">{t.cols.tx}</th>
                    <th className="py-3 pr-3">{t.cols.medEok}</th>
                    <th className="py-3 pr-3">{t.cols.medDeltaMom}</th>
                    <th className="py-3 pr-3">{t.cols.medDeltaYoy}</th>

                    <th className="py-3 pr-3">{t.cols.medPy}</th>
                    <th className="py-3 pr-3">{t.cols.quality}</th>
                    <th className="py-3 pr-3">{t.cols.heat}</th>
                    <th className="py-3 pr-3">{t.cols.move}</th>
                    <th className="py-3 pr-3">{t.cols.premium}</th>

                    {showAdvanced && (
                      <>
                        <th className="py-3 pr-3">{t.cols.avgEok}</th>
                        <th className="py-3 pr-3">{lang === 'en' ? 'Max (×100M)' : '최고(억)'}</th>
                        <th className="py-3 pr-3">{lang === 'en' ? 'Sum (×100M)' : '총액(억)'}</th>
                        <th className="py-3 pr-3">{t.cols.avgPy}</th>
                        <th className="py-3 pr-3">{t.cols.rankMom}</th>
                        <th className="py-3 pr-3">{t.cols.rankYoy}</th>
                        <th className="py-3 pr-3">{t.cols.txMom}</th>
                        <th className="py-3 pr-3">{t.cols.txYoy}</th>
                        <th className="py-3 pr-3">{t.cols.medMom}</th>
                        <th className="py-3 pr-3">{t.cols.medYoy}</th>
                        <th className="py-3 pr-3">{t.cols.avgMom}</th>
                        <th className="py-3 pr-3">{t.cols.avgYoy}</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr key={r.apt_key || `${r.lawd_cd}-${r.apt_name}-${r.dong_name}`} className="border-b hover:bg-slate-50">
                      <td className="py-3 pr-3">{r.rank_no}</td>
                      <td className="py-3 pr-3">{renderArea(r)}</td>
                      <td className="py-3 pr-3 font-medium">
                        <span className="underline underline-offset-2 cursor-pointer" onClick={() => alert(`TODO: 상세화면\napt_key=${r.apt_key}`)}>
                          {renderApt(r)}
                        </span>
                      </td>

                      <td className="py-3 pr-3">{r.latest_area_m2 != null ? Number(r.latest_area_m2).toFixed(2) : '-'}</td>
                      <td className="py-3 pr-3">{fmtPyeongFromM2(r.latest_area_m2)}</td>
                      <td className="py-3 pr-3">{(r.latest_build_year ?? r.build_year) ?? '-'}</td>

                      <td className="py-3 pr-3">{r.latest_deal_date ? String(r.latest_deal_date).slice(0, 10) : '-'}</td>
                      

                      <td className="py-3 pr-3">{fmtEokFromMan(r.latest_deal_amount_man, lang)}</td>

                      <td className="py-3 pr-3">{Number(r.tx_count).toLocaleString()}</td>
                      <td className="py-3 pr-3">{fmtEokFromWon(r.median_price, lang)}</td>
                      <td className="py-3 pr-3">{fmtSignedEokFromWon(r.mom_median_price_delta_won, lang)}</td>
                      <td className="py-3 pr-3">{fmtSignedEokFromWon(r.yoy_median_price_delta_won, lang)}</td>
 

                      <td className="py-3 pr-3">{fmtManPerPyeongFromWonPerM2(r.median_price_per_m2, lang)}</td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-col gap-1">
                          <QualityChip row={r} />
                          <ThinMarketChip row={r} />
                        </div>
                      </td>

                      <td className="py-3 pr-3"><HeatChip row={r} /></td>
                      <td className="py-3 pr-3"><MoveQualityChip row={r} /></td>
                      <td className="py-3 pr-3"><PremiumChip row={r} /></td>

                      {showAdvanced && (
                        <>
                          <td className="py-3 pr-3">{fmtEokFromWon(r.avg_price, lang)}</td>
                          <td className="py-3 pr-3">{fmtEokFromWon(r.max_price, lang)}</td>
                          <td className="py-3 pr-3">{fmtEokFromWon(r.sum_price, lang)}</td>
                          <td className="py-3 pr-3">{fmtManPerPyeongFromWonPerM2(r.avg_price_per_m2, lang)}</td>
                          <td className="py-3 pr-3">{r.mom_rank_delta == null ? '-' : (r.mom_rank_delta > 0 ? `+${r.mom_rank_delta}` : `${r.mom_rank_delta}`)}</td>
                          <td className="py-3 pr-3">{r.yoy_rank_delta == null ? '-' : (r.yoy_rank_delta > 0 ? `+${r.yoy_rank_delta}` : `${r.yoy_rank_delta}`)}</td>
                          <td className="py-3 pr-3">{fmtPct(r.mom_tx_count_pct)}</td>
                          <td className="py-3 pr-3">{fmtPct(r.yoy_tx_count_pct)}</td>
                          <td className="py-3 pr-3">{fmtPct(r.mom_median_price_pct)}</td>
                          <td className="py-3 pr-3">{fmtPct(r.yoy_median_price_pct)}</td>
                          <td className="py-3 pr-3">{fmtPct(r.mom_avg_price_pct)}</td>
                          <td className="py-3 pr-3">{fmtPct(r.yoy_avg_price_pct)}</td>
                        </>
                      )}
                    </tr>
                  ))}

                  {!rows.length && !loading && (
                    <tr>
                      <td colSpan={showAdvanced ? 29 : 17} className="py-10 text-center text-slate-500">
                        {lang === 'en' ? 'No data' : '데이터 없음'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>      
    </>
  );
}
