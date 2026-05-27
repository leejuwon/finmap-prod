// pages/market/real-estate.js
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { trackGaEvent } from "../../utils/analytics";
import ToolSeo from "../../_components/ToolSeo";
import AdSenseUnit from '../../_components/AdSenseUnit'; // 예시
import { AD_SLOTS } from '../../config/adSlots';

const M2_PER_PYEONG = 3.305785;
const DETAIL_STATE_STORAGE_KEY = 'finmap:real-estate:apt-detail-state';
const DEFAULT_SIDO = '11';
const VALID_SIDOS = new Set(['all', '11', '28', '41']);
const TOP_OPTIONS = ['10', '20', '50', '100', '300', '500'];
const PYEONG_OPTIONS = ['all', '10', '20', '30', '40'];
const TOP_METRIC_VALUES = ['tx_count', 'median_price', 'avg_price', 'max_price', 'sum_price', 'median_price_per_m2', 'avg_price_per_m2'];
const PRICE_METRIC_VALUES = ['none', 'median_price', 'avg_price', 'latest_price', 'max_price', 'sum_price'];

const INFEED_SLOT = AD_SLOTS.responsiveBottom;


function pickQueryValue(v) {
  if (Array.isArray(v)) return v[0] == null ? '' : String(v[0]);
  return v == null ? '' : String(v);
}

function cleanQueryText(v, maxLen = 80) {
  return pickQueryValue(v).trim().slice(0, maxLen);
}

function sanitizeSidoValue(v) {
  const s = cleanQueryText(v, 8);
  return VALID_SIDOS.has(s) ? s : DEFAULT_SIDO;
}

function sanitizeTimeframeValue(v) {
  return cleanQueryText(v, 12).toLowerCase() === 'year' ? 'year' : 'month';
}

function sanitizePeriodValue(v, timeframe) {
  const s = cleanQueryText(v, 8);
  if (timeframe === 'year') return /^\d{4}$/.test(s) ? s : '';
  return /^\d{6}$/.test(s) ? s : '';
}

function sanitizeAreaQuery(query, sido) {
  if (sido === 'all') return 'all';

  const area = cleanQueryText(query?.area, 80);
  if (area === 'all') return 'all';
  if (/^\d{5}$/.test(area) && area.startsWith(sido)) return area;
  const pipeMatch = area.match(/^(\d{5})\|(.{1,40})$/);
  if (pipeMatch && pipeMatch[1].startsWith(sido)) return `${pipeMatch[1]}|${pipeMatch[2].trim()}`;

  const lawd = cleanQueryText(query?.lawd, 8);
  if (/^\d{5}$/.test(lawd) && lawd.startsWith(sido)) {
    const gu = cleanQueryText(query?.gu, 40);
    return sido === '41' && gu ? `${lawd}|${gu}` : lawd;
  }

  return 'all';
}

function oneOfQuery(v, allowed, fallback) {
  const s = cleanQueryText(v, 40);
  return allowed.includes(s) ? s : fallback;
}

function yearOrAllQuery(v) {
  const s = cleanQueryText(v, 8);
  if (s === 'all' || !s) return 'all';
  return /^\d{4}$/.test(s) ? s : 'all';
}

function latestPeriodFromOptions(opt, timeframe) {
  if (!opt?.periods) return '';
  if (timeframe === 'year') {
    return opt.periods.maxY || opt.periods.years?.[opt.periods.years.length - 1] || '';
  }
  return opt.periods.maxYm || opt.periods.months?.[opt.periods.months.length - 1] || '';
}

function isPeriodAllowed(opt, timeframe, value) {
  const v = String(value || '');
  if (!v) return false;
  const values = timeframe === 'year' ? (opt?.periods?.years || []) : (opt?.periods?.months || []);
  return values.includes(v);
}

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

function ymToLabel(ym) {
  const s = String(ym || '');
  if (!/^\d{6}$/.test(s)) return s || '-';
  return `${s.slice(0, 4)}-${s.slice(4, 6)}`;
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
    aptName: '아파트명',
    aptNamePh: '예: 삼성',
    aptNameHelp: '입력한 문자열을 포함한 단지만 조회합니다.',
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
      complexScale: '세대/동',
      complexInfo: '단지정보',
      parking: '주차',
      heatingManage: '난방/관리',
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
    aptName: 'Apartment name',
    aptNamePh: 'e.g., Samsung',
    aptNameHelp: 'Filters complexes that contain the text.',
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
      complexScale: 'HH/Dong',
      complexInfo: 'Complex info',
      parking: 'Parking',
      heatingManage: 'Heating/Manage',
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

  // ✅ 초기값: 전체(all) 대신 서울(11)
  const [sido, setSido] = useState(DEFAULT_SIDO);
  const [area, setArea] = useState('all'); // all | lawd | lawd|gu
  const [timeframe, setTimeframe] = useState('month');
   // ✅ 기간을 From~To로
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');

  // ✅ 금액 구간 필터(억 단위 입력)
  const [priceMetric, setPriceMetric] = useState('none'); // none|median_price|avg_price|latest_price|max_price|sum_price
  const [priceMin, setPriceMin] = useState(''); // e.g. "3.5" => 3.5억
  const [priceMax, setPriceMax] = useState('');

  // ✅ 세대수 필터 (단지정보 기반)
  const [hhOp, setHhOp] = useState('gte'); // gte | lte
  const [hh, setHh] = useState(''); // number string

  const [aptName, setAptName] = useState('');          // ✅ 아파트명 검색(입력)
  const [aptNameDeb, setAptNameDeb] = useState('');    // ✅ 디바운스된 값(API에 전달)

  const [topBy, setTopBy] = useState('avg_price');
  const [sort, setSort] = useState('desc');
  const [top, setTop] = useState('100');

  // ✅ 평형 기본값: 전체. URL의 ?pyeong=10 또는 ?band=10은 query 우선 적용.
  const [pyeong, setPyeong] = useState('all');
  const [buildFrom, setBuildFrom] = useState('all');
  const [buildTo, setBuildTo] = useState('all');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Desktop view toggles (카드/테이블) + Advanced
  const [desktopView, setDesktopView] = useState('card'); // 'card' | 'table'
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [expandedAptKey, setExpandedAptKey] = useState(null);

  // ✅ "초기 진입/페이지 전환"에서만 오버레이를 띄우기 위한 상태
  const firstTopFetchedRef = useRef(false);
  const [routeLoading, setRouteLoading] = useState(false);

  const [filtersReady, setFiltersReady] = useState(false);
  const queryAppliedKeyRef = useRef('');
  const reqSeqRef = useRef(0);
  const abortRef = useRef(null);  

  useEffect(() => {
    if (!router?.events) return;
    const onStart = (url) => {
      // real-estate 영역 이동(대시보드<->상세 포함)일 때만
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
    return () => {
      try { abortRef.current?.abort?.(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const key = router.asPath || '';
    if (queryAppliedKeyRef.current === key) return;
    queryAppliedKeyRef.current = key;

    const query = router.query || {};
    const nextSido = sanitizeSidoValue(query.sido);
    const nextTimeframe = sanitizeTimeframeValue(query.timeframe);
    const nextPeriod = sanitizePeriodValue(query.period, nextTimeframe);
    const nextFrom = sanitizePeriodValue(query.from, nextTimeframe) || nextPeriod;
    const nextTo = sanitizePeriodValue(query.to, nextTimeframe) || nextPeriod || nextFrom;

    try { abortRef.current?.abort?.(); } catch {}
    reqSeqRef.current += 1;
    firstTopFetchedRef.current = false;

    setFiltersReady(false);
    setLoading(false);
    setRows([]);
    setAreas([]);
    setSido(nextSido);
    setArea(sanitizeAreaQuery(query, nextSido));
    setTimeframe(nextTimeframe);
    setPeriodFrom(nextFrom);
    setPeriodTo(nextTo);
    setTopBy(oneOfQuery(query.metric || query.topBy, TOP_METRIC_VALUES, 'avg_price'));
    setSort(oneOfQuery(query.order || query.sort, ['asc', 'desc'], 'desc'));
    setTop(oneOfQuery(query.top, TOP_OPTIONS, '100'));
    setPyeong(oneOfQuery(query.pyeong || query.band, PYEONG_OPTIONS, 'all'));
    setBuildFrom(yearOrAllQuery(query.buildFrom));
    setBuildTo(yearOrAllQuery(query.buildTo));
    setPriceMetric(oneOfQuery(query.priceMetric, PRICE_METRIC_VALUES, 'none'));
    setPriceMin(cleanQueryText(query.priceMin, 20));
    setPriceMax(cleanQueryText(query.priceMax, 20));
    setHh(cleanQueryText(query.hh, 20));
    setHhOp(oneOfQuery(query.hhOp, ['gte', 'lte'], 'gte'));
    setAptName(cleanQueryText(query.apt, 50));
    setAptNameDeb(cleanQueryText(query.apt, 50));
    setFiltersReady(true);
  }, [router.isReady, router.asPath, router.query]);

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

  const realEstateGuides = useMemo(
    () => [
      {
        href: '/posts/personalFinance/apt-dashboard-home-goal-roadmap',
        title: lang === 'en' ? 'Use Apartment Data to Plan a Home Goal' : '아파트 실거래 데이터로 내 집 목표 세우기',
      },
      {
        href: '/posts/personalFinance/mortgage-risk-checklist-dsr-variable',
        title: lang === 'en' ? 'Mortgage Risk Checklist: DSR and Variable Rates' : '주택담보대출 리스크 체크리스트: DSR·변동금리',
      },
      {
        href: '/posts/personalFinance/rent-jeonse-buy-cashflow-opportunity-cost',
        title: lang === 'en' ? 'Rent, Jeonse, or Buy: Cash Flow and Opportunity Cost' : '월세·전세·매수 판단: 현금흐름과 기회비용',
      },
      {
        href: '/posts/investingInfo/seoul-gyeonggi-incheon-risk-budget-framework',
        title: lang === 'en' ? 'Seoul, Gyeonggi, Incheon: Risk and Budget Framework' : '서울·경기·인천 예산과 리스크 비교 기준',
      },
    ],
    [lang]
  );

  // ✅ aptName 디바운스(타이핑마다 과도한 API 호출 방지)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAptNameDeb(String(aptName || '').trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [aptName]);

  // timeframe/options 변경 시 periodFrom/To 자동 보정
  useEffect(() => {
    if (!filtersReady || !opt) return;
    const latest = latestPeriodFromOptions(opt, timeframe);
    if (!latest) return;
    setPeriodFrom((prev) => (isPeriodAllowed(opt, timeframe, prev) ? prev : latest));
    setPeriodTo((prev) => (isPeriodAllowed(opt, timeframe, prev) ? prev : latest));
  }, [filtersReady, timeframe, opt, periodFrom, periodTo]);

  // (중복 호출 방지) trade-areas 로드는 아래 loadingAreas useEffect에서만 처리

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
        value: String(x.value ?? x.code ?? x.lawd_cd ?? ''),
        label_ko: x.label_ko || x.name_ko || x.name || x.label || '',
        label_en: x.label_en || x.name_en || x.name || x.label || x.label_ko || x.name_ko || '',
      }));
      return dedupeOptions(base.concat(mapped));
    }

    return base;
  }, [areas, t.all]);

  const periodOptions = useMemo(() => {
    if (!opt) return [];
    return timeframe === 'month' ? (opt.periods?.months || []) : (opt.periods?.years || []);
  }, [opt, timeframe]);

  const buildYearOptions = useMemo(() => {
    if (opt?.buildYears?.years?.length) return opt.buildYears.years;
    // fallback
    return Array.from({ length: 60 }).map((_, i) => String(1970 + i));
  }, [opt]);

  const priceMetricOptions = useMemo(() => ([
    { value: 'none', label_ko: '없음', label_en: 'None' },
    { value: 'median_price', label_ko: '대표가격(중앙값)', label_en: 'Typical (Median)' },
    { value: 'avg_price', label_ko: '평균(총액)', label_en: 'Average (Total)' },
    { value: 'latest_price', label_ko: '최근 거래', label_en: 'Latest deal' },
    { value: 'max_price', label_ko: '최고 거래금액', label_en: 'Max deal' },
    { value: 'sum_price', label_ko: '총 거래금액', label_en: 'Sum (Total)' },
  ]), []);

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
    if (!periodFrom || !periodTo) return;
    const seq = ++reqSeqRef.current;
    try { abortRef.current?.abort?.(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;

    let from = String(periodFrom);
    let to = String(periodTo);
    if (from > to) { const tmp = from; from = to; to = tmp; }
    const isRange = from !== to;

    // ✅ area값을 직접 해석해서 lawd/gu를 강제 세팅 (강서구 필터 누락 방지)
    // - 서울/인천: area = "lawd_cd" 형태 (예: 11500)
    // - 경기: area = "lawd_cd|gu" 또는 "lawd_cd" (city all)
    const areaVal = String(area || 'all');
    let lawd = '';
   let gu = '';
    if (areaVal && areaVal !== 'all') {
      const parts = areaVal.split('|');
      lawd = (parts[0] || '').trim();
      gu = (parts[1] || '').trim();
    }

    setLoading(true);
    setRows([]); // ✅ 카드 잔상/덧붙임 방지
    try {
      const qs = new URLSearchParams({
        timeframe,
        // ✅ API는 from/to 우선, period는 하위호환용(상세 링크 등에서 사용 가능)
        from,
        to,
        period: to,
        sido,
        metric: topBy,
        order: sort,
        top,
        pyeong,
        // ✅ range는 compare의 정의가 애매해서 none으로 고정
        compare: isRange ? 'none' : 'both',
      });
      // ✅ 시군구(서울/인천)/시(경기) 필터는 lawd로 통일해서 전달
      if (lawd) qs.set('lawd', lawd);
      // ✅ 경기도만 gu 필터 사용
      if (sido === '41' && gu) qs.set('gu', gu);
      if (buildFrom !== 'all') qs.set('buildFrom', buildFrom);
      if (buildTo !== 'all') qs.set('buildTo', buildTo);
      if (priceMetric && priceMetric !== 'none') {
        qs.set('priceMetric', priceMetric);
        if (String(priceMin || '').trim()) qs.set('priceMin', String(priceMin).trim());
        if (String(priceMax || '').trim()) qs.set('priceMax', String(priceMax).trim());
      }

      // ✅ 세대수 필터
    {
      const n = Number(String(hh || '').replace(/[^\d]/g, ''));
      if (Number.isFinite(n) && n > 0) {
        qs.set('hh', String(Math.trunc(n)));
        qs.set('hhOp', hhOp === 'lte' ? 'lte' : 'gte');
      }
    }
      // ✅ 아파트명 검색(앞뒤 like)
      if (aptNameDeb) qs.set('apt', aptNameDeb);

      const url = `/api/re/trade-top?${qs.toString()}`;
      const r = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();

      // ✅ 최신 요청만 반영
      if (seq !== reqSeqRef.current) return;

      if (j?.ok && Array.isArray(j.rows)) {
        const nextRows = j.rows;
        setRows(nextRows);
        trackGaEvent("real_estate_search", {
          locale: lang,
          sido,
          area_type: areaVal === 'all' ? 'all' : gu ? 'gu' : 'lawd',
          timeframe,
          period: isRange ? `${from}-${to}` : to,
          top_by: topBy,
          sort,
          top,
          pyeong,
          has_build_filter: buildFrom !== 'all' || buildTo !== 'all',
          result_count: nextRows.length,
          location: "dashboard_filter",
        });
      } else {
        setRows([]);
      }
    } catch (e) {
      if (e?.name === 'AbortError') return;
      if (seq !== reqSeqRef.current) return;
      setRows([]);
    } finally {
      if (seq === reqSeqRef.current) setLoading(false);
      // ✅ 최초 1회 fetchTop 완료(성공/실패 무관) 표시
      if (!firstTopFetchedRef.current) firstTopFetchedRef.current = true;
    }
  }

  useEffect(() => {
    if (!filtersReady || !opt || !periodFrom || !periodTo) return;
    if (!isPeriodAllowed(opt, timeframe, periodFrom) || !isPeriodAllowed(opt, timeframe, periodTo)) return;
    fetchTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersReady, opt, timeframe, periodFrom, periodTo, sido, area, topBy, sort, top, pyeong, buildFrom, buildTo, priceMetric, priceMin, priceMax, hh, hhOp, aptNameDeb]);

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

  function renderHouseholdDong(row) {
    if (!shouldShowComplexCounts(row)) {
      return lang === 'en' ? 'Checking complex info' : '단지정보 확인 중';
    }
    const hc = row?.household_count;
    const dc = row?.dong_count;
    const parts = [];
    if (hc != null && Number.isFinite(Number(hc))) {
      parts.push(lang === 'en' ? `${Number(hc).toLocaleString()} HH` : `${Number(hc).toLocaleString()}세대`);
    }
    if (dc != null && Number.isFinite(Number(dc))) {
      parts.push(lang === 'en' ? `${Number(dc).toLocaleString()} bldgs` : `${Number(dc).toLocaleString()}개동`);
    }
    return parts.length ? parts.join(' · ') : (lang === 'en' ? 'Checking complex info' : '단지정보 확인 중');
  }

  function nonNegativeNumberOrNull(value) {
    if (value == null || value === '') return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  }

  function renderParking(row) {
    if (!shouldShowComplexInfo(row)) return '-';
    const total = nonNegativeNumberOrNull(row?.parking_total);
    const ground = nonNegativeNumberOrNull(row?.parking_ground);
    const underground = nonNegativeNumberOrNull(row?.parking_underground);
    if (total == null && ground == null && underground == null) return '-';

    const main = total != null ? total.toLocaleString() : null;
    const parts = [];
    if (ground != null) parts.push(lang === 'en' ? `G ${ground.toLocaleString()}` : `지상 ${ground.toLocaleString()}`);
    if (underground != null) parts.push(lang === 'en' ? `B ${underground.toLocaleString()}` : `지하 ${underground.toLocaleString()}`);

    if (total != null && !parts.length) {
      return lang === 'en' ? `Parking ${main}` : `주차 ${main}대`;
    }

    const detail = parts.join(' / ');
    if (total == null) {
      return lang === 'en' ? `Parking (${detail})` : `주차 ${detail}`;
    }
    return lang === 'en' ? `Parking ${main} (${detail})` : `주차 ${main}대 (${detail})`;
  }

  function renderHeatingManage(row) {
    if (!shouldShowComplexInfo(row)) return '-';
    const heating = row?.heating_type || '-';
    const manage = row?.manage_type || '-';
    if (heating === '-' && manage === '-') return '-';
    return `${shortText(heating)} / ${shortText(manage)}`;
  }

  function renderComplexInfo(row) {
    const parking = renderParking(row);
    const heatingManage = renderHeatingManage(row);
    const parts = [];
    if (parking !== '-') parts.push(`${t.cols.parking}: ${parking}`);
    if (heatingManage !== '-') parts.push(`${t.cols.heatingManage}: ${heatingManage}`);
    return parts.length ? parts.join(' · ') : '-';
  }

  function isVerifiedComplex(row) {
    return row?.complex_info_source === 'override' || row?.complex_info_confidence === 'verified';
  }

  function shouldShowComplexInfo(row) {
    const confidence = String(row?.complex_info_confidence || '');
    if (isVerifiedComplex(row)) return true;
    if (confidence === 'high' || confidence === 'medium') return true;
    if (confidence === 'low' || confidence === 'none') return false;
    if (row?.complex_info_warning) return false;
    return row?.household_count != null || row?.dong_count != null || row?.parking_total != null || row?.parking_ground != null || row?.parking_underground != null;
  }

  function shouldShowComplexCounts(row) {
    if (!shouldShowComplexInfo(row)) return false;
    return row?.household_count != null || row?.dong_count != null;
  }

  function shortText(value, max = 18) {
    const s = String(value == null ? '' : value).trim();
    if (!s || s === '-') return '-';
    return s.length > max ? `${s.slice(0, max)}...` : s;
  }

  function complexConfidenceMeta(row) {
    const source = String(row?.complex_info_source || '');
    const confidence = String(row?.complex_info_confidence || 'none');
    if (source === 'override') {
      return { label: lang === 'en' ? 'Verified value' : '검증값', tone: 'bg-emerald-50 text-emerald-700' };
    }
    if (confidence === 'verified') return { label: lang === 'en' ? 'Verified' : '검증', tone: 'bg-emerald-50 text-emerald-700' };
    if (confidence === 'high') return { label: lang === 'en' ? 'Matched' : '매칭', tone: 'bg-sky-50 text-sky-700' };
    if (confidence === 'medium') return { label: lang === 'en' ? 'Estimated' : '추정', tone: 'bg-amber-50 text-amber-700' };
    if (confidence === 'low') return { label: lang === 'en' ? 'Needs check' : '확인필요', tone: 'bg-rose-50 text-rose-700' };
    return { label: lang === 'en' ? 'Unknown' : '미확인', tone: 'bg-slate-100 text-slate-700' };
  }

  function ComplexInfoBadge({ row }) {
    const meta = complexConfidenceMeta(row);
    return <Chip tone={meta.tone}>{meta.label}</Chip>;
  }

  function ComplexWarning({ row }) {
    const warning = String(row?.complex_info_warning || '').trim();
    if (!warning) return null;
    const text = isVerifiedComplex(row)
      ? (lang === 'en' ? 'Source corrected' : '원천값 보정')
      : (lang === 'en' ? 'Check needed' : '확인 필요');
    return (
      <span
        className="inline-flex max-w-full items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium leading-tight text-slate-600"
        title={warning}
      >
        {text}
      </span>
    );
  }

  function ComplexInfoInline({ row }) {
    const scale = renderHouseholdDong(row);
    const parking = renderParking(row);
    const heatingManage = renderHeatingManage(row);
    const hasScale = scale && !['-', 'Checking complex info', '단지정보 확인 중'].includes(scale);
    const hasParking = parking && parking !== '-';
    const hasHeating = heatingManage && heatingManage !== '-';

    if (!hasScale && !hasParking && !hasHeating) {
      return (
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          <ComplexInfoBadge row={row} />
          <span className="text-xs text-slate-500">{lang === 'en' ? 'Checking complex info' : '단지정보 확인 중'}</span>
          <ComplexWarning row={row} />
        </div>
      );
    }

    return (
      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-600">
        <ComplexInfoBadge row={row} />
        {hasScale && <span className="rounded-full bg-slate-50 px-2.5 py-1">{scale}</span>}
        {hasParking && <span className="rounded-full bg-slate-50 px-2.5 py-1">{parking}</span>}
        {hasHeating && <span className="rounded-full bg-slate-50 px-2.5 py-1">{heatingManage}</span>}
        <ComplexWarning row={row} />
      </div>
    );
  }

  // ✅ 상세페이지 링크 생성 (Top 리스트의 apt_key 그대로 사용)
  function makeAptDetailHref(row) {
    const aptKey = row?.apt_key ? encodeURIComponent(String(row.apt_key)) : '';
    return `/market/real-estate/apt/${aptKey}`;
  }

  function rememberAptDetailState() {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        DETAIL_STATE_STORAGE_KEY,
        JSON.stringify({
          timeframe: timeframe || 'month',
          period: String(periodTo || periodFrom || ''),
          band: pyeong || 'all',
          ts: Date.now(),
        })
      );
    } catch {}
  }

  function handleAptDetailClick(row, idx, location) {
    rememberAptDetailState();
    trackGaEvent("real_estate_detail_click", {
      locale: lang,
      sido,
      area,
      timeframe,
      period: String(periodTo || periodFrom || ''),
      top_by: topBy,
      rank_position: Number(idx) + 1,
      apt_key_present: !!(row?.apt_key || row?.aptKey),
      location,
    });
  }

  const tableMinWidth = showAdvanced ? 'min-w-[2700px]' : 'min-w-[1900px]';
  const filterFieldClass = "min-w-0";
  const filterControlClass = "w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm";
  const filterPairClass = "grid grid-cols-1 min-[390px]:grid-cols-2 gap-2";

  // ✅ SEO/검색 유입용 프리셋 랜딩(마용성/강남/서울 Top100) 링크
  // - 현재 선택한 평형(pyeong)을 band로 전달하여 사용자가 "같은 조건"으로 넘어간 느낌을 주도록 구성
  function presetHref(path) {
    const band = encodeURIComponent(String(pyeong || 'all'));
    return `${path}?band=${band}`;
  }

  // ✅ 대표 URL(파라미터 없는 링크) — SEO 텍스트 링크용
  function canonicalHref(path) {
    return String(path || '');
  }

  const presetLinks = useMemo(() => ([
    { key: 'mayongseong', href: presetHref('/market/real-estate/mayongseong-top100'),    label: lang === 'en' ? 'Mayongseong Top 100'     : '마용성 Top100' },
    { key: 'gangnam',     href: presetHref('/market/real-estate/gangnam-top100'),        label: lang === 'en' ? 'Gangnam Top 100'         : '강남 Top100' },
    { key: 'songpa',      href: presetHref('/market/real-estate/songpa-top100'),         label: lang === 'en' ? 'Songpa Top 100'          : '송파(잠실) Top100' },
    { key: 'magok',       href: presetHref('/market/real-estate/magok-top100'),          label: lang === 'en' ? 'Magok Top 100'           : '마곡 Top100' },
    { key: 'gananam3gu',  href: presetHref('/market/real-estate/gangnam3-top100'),       label: lang === 'en' ? 'Gangnam 3Gu Top 100'     : '강남3구 Top100' },    
    { key: 'spa-gnam',    href: presetHref('/market/real-estate/songpa-gangnam-top100'), label: lang === 'en' ? 'Songpa-Gangnam Top 100'  : '송파(잠실)+강남구 Top100' },    
    { key: 'seoul',       href: presetHref('/market/real-estate/seoul-top100'),          label: lang === 'en' ? 'Seoul Top 100'           : '서울 Top100' },
  ]), [lang, pyeong]);

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
      <div className="min-w-0 max-w-full rounded-xl border border-slate-100 bg-white px-3 py-2">
        <div className="break-words text-[11px] leading-snug text-slate-500">{label}</div>
        <div className="mt-0.5 text-sm font-semibold text-slate-900 break-words">{value ?? "-"}</div>
      </div>
    );
  }

  function Chip({ children, tone }) {
    return (
      <span className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-medium leading-tight whitespace-normal break-words ${tone}`}>
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

  const [loadingOpt, setLoadingOpt] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);

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

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingOpt(true);
       // ✅ 언어 변경/재진입 성격이면 "초기 fetch"로 간주하고 다시 오버레이 대상
      firstTopFetchedRef.current = false;
      try {
        const r = await fetch(`/api/re/options?lang=${encodeURIComponent(lang)}`);
        const j = await r.json();
        if (!alive) return;
        if (j?.ok) {
          setOpt(j);
        }
      } finally {
        if (alive) setLoadingOpt(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]); // ✅ lang 바뀌면 다시 로드

  useEffect(() => {
    if (!filtersReady) return;
    let alive = true;
    (async () => {
      if (!sido || sido === 'all') {
        setAreas([]);
        setLoadingAreas(false);
        return;
      }
      setLoadingAreas(true);
      try {
        const r = await fetch(`/api/re/trade-areas?sido=${encodeURIComponent(sido)}&lang=${encodeURIComponent(lang)}`);
        const j = await r.json();
        if (!alive) return;
        if (j?.ok) setAreas(j.areas || j.rows || j.items || []);
        else setAreas([]);
      } catch {
        if (alive) setAreas([]);
      } finally {
        if (alive) setLoadingAreas(false);
      }
    })();
    return () => { alive = false; };
  }, [filtersReady, sido, lang]);



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
    const parking = renderParking(r);
    const heatingManage = renderHeatingManage(r);
    
    return (
      <>        
        <div className="card p-4 min-w-0 max-w-full">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="break-words text-xs text-slate-500">
                {idx + 1}. {areaText}
              </div>
              {/* ✅ 아파트명: 상세페이지 링크 + (옵션) 펼침 버튼 */}
              <div className="mt-0.5 flex min-w-0 items-start gap-2">
                <Link
                  href={makeAptDetailHref(r)}
                  onClick={() => handleAptDetailClick(r, idx, "result_card")}
                  title={aptText}
                  className={`min-w-0 flex-1 text-left text-base font-semibold leading-snug text-slate-900 hover:underline underline-offset-2 whitespace-normal break-words ${
                    expanded ? "" : "max-h-[2.75rem] overflow-hidden"
                  }`}
                >
                  {aptText}
                </Link>
                <button
                  type="button"
                  onClick={() => setExpandedAptKey(expanded ? null : rowKey)}
                  className="min-h-[36px] shrink-0 rounded-lg border bg-white px-2 py-1 text-xs hover:bg-slate-50"
                >
                  {expanded ? (lang === 'en' ? 'Less' : '접기') : (lang === 'en' ? 'More' : '펼침')}
                </button>
              </div>       
              <div className="mt-1 break-words text-xs leading-relaxed text-slate-500">
                {sizeM2} · {sizePy} · {buildY} · {dealDate}
              </div>
              <ComplexInfoInline row={r} />
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0 sm:flex-col sm:items-end">
              <QualityChip row={r} />
              <HeatChip row={r} />
              <div className="break-words text-xs text-slate-500">
                {t.metrics.tx_count}: {r.tx_count?.toLocaleString?.() ?? r.tx_count}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 min-[390px]:grid-cols-2">
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
            <div className="mt-3 grid grid-cols-1 gap-2 min-[390px]:grid-cols-2">
              <MiniStat label={lang === 'en' ? 'Max deal (×100M)' : '최고 거래(억)'} value={maxEok} />
              <MiniStat label={lang === 'en' ? 'Total value (×100M)' : '총 거래금액(억)'} value={sumEok} />
              <MiniStat label={t.cols.parking} value={parking} />
              <MiniStat label={t.cols.heatingManage} value={heatingManage} />
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
      </>
    );
  }

  return (
      <>
      {/*
        ✅ 오버레이는 "초기/전환" 때만:
        - routeLoading: 대시보드<->상세 이동 등 라우팅 전환
        - loadingOpt: 옵션(기간) 로딩(느린 구간)
        - (!firstTopFetchedRef && loading): 최초 1회 Top 조회(초기 진입/복귀에서만)
        ※ loadingAreas, 이후 필터변경 loading 은 오버레이 제외(요청사항)
      */}
      <BlockingOverlay
        show={routeLoading || loadingOpt || (!firstTopFetchedRef.current && loading)}
        text={lang === 'en' ? 'Loading data...' : '데이터 불러오는 중...'}
      />
      <ToolSeo
        title={seoTitle}
        desc={seoDesc}
        image="https://res.cloudinary.com/dwonflmnn/image/upload/v1769749571/blog/insight/apt-dashboard-home-goal-roadmap-kr-img1.png"
        appName={seoTitle}
        appCategory="FinanceApplication"
        about={{ "@type": "Place", name: "South Korea" }}
        keywords={
          lang === "en"
            ? "Seoul apartment prices, Seoul Top 100, Gangnam apartment prices, Mayongseong, Songpa, Magok Korea real estate transactions"
            : "서울 아파트값 순위, 서울 Top100, 강남 아파트값 순위, 마용성, 송파, 마곡 아파트 실거래"
        }
      />
        <div className="card">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-slate-600 mt-1">{t.subtitle}</p>

          {/* ✅ 검색 유입용 프리셋(고정 URL) */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {presetLinks.map((x) => (
              <Link
                key={x.key}
                href={x.href}
                className="inline-flex items-center rounded-full border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                title={x.label}
              >
                {x.label}
              </Link>
            ))}
            <span className="text-xs text-slate-500">
              {lang === 'en' ? 'Landing pages for Google search (Top 100).' : '구글 검색 유입을 위한 고정 URL 랜딩(Top100).'}
            </span>
          </div>

          {/* ✅ SEO용 내부링크 섹션: "키워드 문장 + 텍스트 링크(앵커)" */}
          <div className="mt-3 rounded-2xl border bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">
              {lang === 'en' ? 'Popular rankings (official transactions)' : '인기 검색: 아파트 순위(실거래)'}
            </div>
            <div className="mt-2 text-sm text-slate-600 leading-6">
              {lang === 'en' ? (
                <>
                  Explore fixed-URL ranking pages:{" "}
                  <Link href={canonicalHref('/market/real-estate/gangnam-top100')} className="underline underline-offset-2">                     
                    Gangnam apartment ranking
                  </Link>
                  <Link
                    href={presetHref('/market/real-estate/gangnam-top100')}
                    className="ml-2 text-xs text-slate-500 underline underline-offset-2"
                    title="Open with current size band"
                  >
                    (current band)
                  </Link>
                  ,{" "}
                  <Link href={canonicalHref('/market/real-estate/mayongseong-top100')} className="underline underline-offset-2">                   
                    Mayongseong apartment ranking
                  </Link>
                  <Link
                    href={presetHref('/market/real-estate/mayongseong-top100')}
                    className="ml-2 text-xs text-slate-500 underline underline-offset-2"
                    title="Open with current size band"
                  >
                    (current band)
                  </Link>
                  ,{" "}                  
                  <Link href={canonicalHref('/market/real-estate/songpa-top100')} className="underline underline-offset-2">                   
                    Songpa(Jamsil) apartment ranking
                  </Link>
                  <Link
                    href={presetHref('/market/real-estate/songpa-top100')}
                    className="ml-2 text-xs text-slate-500 underline underline-offset-2"
                    title="Open with current size band"
                  >
                    (current band)
                  </Link>
                  ,{" "}
                  <Link href={canonicalHref('/market/real-estate/magok-top100')} className="underline underline-offset-2">                   
                    Magok apartment ranking
                  </Link>
                  <Link
                    href={presetHref('/market/real-estate/magok-top100')}
                    className="ml-2 text-xs text-slate-500 underline underline-offset-2"
                    title="Open with current size band"
                  >
                    (current band)
                  </Link>
                  .
                </>
              ) : (
                <>
                  자주 검색되는 키워드별로 고정 URL 순위 페이지를 준비했어요:{" "}
                  <Link href={canonicalHref('/market/real-estate/gangnam-top100')} className="underline underline-offset-2">                 
                    강남 아파트 순위
                  </Link>
                  <Link
                    href={presetHref('/market/real-estate/gangnam-top100')}
                    className="ml-2 text-xs text-slate-500 underline underline-offset-2"
                    title="현재 선택 평형으로 보기"
                  >
                    (현재 평형)
                  </Link>
                  ,{" "}
                  <Link href={canonicalHref('/market/real-estate/mayongseong-top100')} className="underline underline-offset-2">                    
                    마용성 아파트 순위
                  </Link>
                  <Link
                    href={presetHref('/market/real-estate/mayongseong-top100')}
                    className="ml-2 text-xs text-slate-500 underline underline-offset-2"
                    title="현재 선택 평형으로 보기"
                  >
                    (현재 평형)
                  </Link>
                  ,{" "}
                  <Link href={canonicalHref('/market/real-estate/songpa-top100')} className="underline underline-offset-2">                   
                    송파(잠실) 아파트 순위
                  </Link>
                  <Link
                    href={presetHref('/market/real-estate/songpa-top100')}
                    className="ml-2 text-xs text-slate-500 underline underline-offset-2"
                    title="현재 선택 평형으로 보기"
                  >
                    (현재 평형)
                  </Link>
                  ,{" "}
                  <Link href={canonicalHref('/market/real-estate/magok-top100')} className="underline underline-offset-2">                    
                    마곡 아파트 순위
                  </Link>
                  <Link
                    href={presetHref('/market/real-estate/magok-top100')}
                    className="ml-2 text-xs text-slate-500 underline underline-offset-2"
                    title="현재 선택 평형으로 보기"
                  >
                    (현재 평형)
                  </Link>
                  . 설명형 가이드는{" "}
                  <Link href={canonicalHref('/market/real-estate/seoul-apartment-top100')} className="underline underline-offset-2">
                    서울 아파트 실거래가 Top100
                  </Link>
                  ,{" "}
                  <Link href={canonicalHref('/market/real-estate/gyeonggi-apartment-top100')} className="underline underline-offset-2">
                    경기 아파트 실거래가 Top100
                  </Link>
                  ,{" "}
                  <Link href={canonicalHref('/market/real-estate/incheon-apartment-top100')} className="underline underline-offset-2">
                    인천 아파트 실거래가 Top100
                  </Link>
                  에서 확인할 수 있습니다.
                </>
              )}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {lang === 'en'
                ? 'Tip: These pages are designed to match search intent and load fast. Use filters for a deeper comparison.'
                : 'Tip: 검색 의도에 맞춘 빠른 순위 페이지입니다. 더 깊은 비교는 위 필터로 조건을 좁혀보세요.'}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">
              {lang === 'en' ? 'Guides for interpreting apartment data' : '아파트 데이터 해석 가이드'}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {lang === 'en'
                ? 'Connect rankings with budget, mortgage risk, and buy-or-rent decisions before comparing individual complexes.'
                : '순위만 보지 말고 예산, 대출 리스크, 전월세·매수 판단 기준까지 함께 확인해보세요.'}
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {realEstateGuides.map((guide) => (
                <li key={guide.href} className="rounded-xl bg-slate-50 p-3">
                  <Link href={guide.href} locale={lang} prefetch={false} className="text-sm font-semibold text-slate-900 hover:underline">
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* (B) legend 박스 */}
          <div className="mt-4 rounded-xl border bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-700">{t.legendTitle}</div>
            <ul className="mt-2 text-sm text-slate-600 list-disc pl-5 space-y-1">
              {t.legendLines.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 md:grid-cols-12">
            <div className={`${filterFieldClass} md:col-span-2`}>
              <div className="text-sm text-slate-500 mb-1">{t.sido}</div>
              <select
                className={filterControlClass}
                value={sido}
                onChange={(e) => {
                  setSido(e.target.value);
                  setArea('all');
                }}
              >
                {sidoOptions.map((x) => (
                  <option key={x.value} value={x.value}>
                    {labelOf(x, true)}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${filterFieldClass} md:col-span-2`}>
              <div className="text-sm text-slate-500 mb-1">{t.sigungu}</div>
              <select
                className={filterControlClass}
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

            <div className={`${filterFieldClass} md:col-span-1`}>
              <div className="text-sm text-slate-500 mb-1">{t.timeframe}</div>
              <select className={filterControlClass} value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="month">{t.month}</option>
                <option value="year">{t.year}</option>
              </select>
            </div>

            <div className={`${filterFieldClass} min-[390px]:col-span-2 md:col-span-3`}>
              <div className="text-sm text-slate-500 mb-1">{t.period}</div>
              <div className={filterPairClass}>
                <select
                  className={filterControlClass}
                  value={periodFrom}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPeriodFrom(v);
                    if (periodTo && v > periodTo) setPeriodTo(v);
                  }}
                >
                  {periodOptions.map((p) => (
                    <option key={`from-${p}`} value={p}>
                      {timeframe === 'month' ? ymToLabel(p) : String(p)}
                    </option>
                  ))}
               </select>
                <select
                  className={filterControlClass}
                  value={periodTo}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPeriodTo(v);
                    if (periodFrom && v < periodFrom) setPeriodFrom(v);
                  }}
                >
                  {periodOptions.map((p) => (
                    <option key={`to-${p}`} value={p}>
                      {timeframe === 'month' ? ymToLabel(p) : String(p)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`${filterFieldClass} min-[390px]:col-span-2 md:col-span-2`}>
              <div className="text-sm text-slate-500 mb-1">{t.topBy}</div>
              <select className={filterControlClass} value={topBy} onChange={(e) => setTopBy(e.target.value)}>
                {Object.entries(t.metrics).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <div className="text-[11px] text-slate-400 mt-1">{t.metricHelp}</div>
            </div>

            <div className={`${filterFieldClass} md:col-span-2`}>
              <div className="text-sm text-slate-500 mb-1">{t.sort}</div>
              <select className={filterControlClass} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="desc">{t.desc}</option>
                <option value="asc">{t.asc}</option>
              </select>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 md:grid-cols-12">
            <div className={`${filterFieldClass} md:col-span-1`}>
              <div className="text-sm text-slate-500 mb-1">{t.top}</div>
              <select className={filterControlClass} value={top} onChange={(e) => setTop(e.target.value)}>
                {TOP_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className={`${filterFieldClass} md:col-span-1`}>
              <div className="text-sm text-slate-500 mb-1">{t.pyeong}</div>
              <select className={filterControlClass} value={pyeong} onChange={(e) => setPyeong(e.target.value)}>
                {/* ✅ all 옵션이 없으면 UI는 10처럼 보여도 state는 all로 남아 최초 조회가 틀어질 수 있음 */}
                <option value="all">{t.all}</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
              </select>
            </div>

            <div className={`${filterFieldClass} min-[390px]:col-span-2 md:col-span-3`}>
              <div className="text-sm text-slate-500 mb-1">{t.buildYear}</div>
              <div className={filterPairClass}>
                <select
                  className={filterControlClass}
                  value={buildFrom}
                  onChange={(e) => {
                    const v = e.target.value; // 'all' or year
                    setBuildFrom(v);

                    setBuildTo((prevTo) => {
                      const toVal = String(prevTo || 'all');

                      // ✅ to가 전체면 그대로 둔다
                      if (toVal === 'all') return toVal;

                      // from이 전체면 to 그대로
                      if (v === 'all') return toVal;

                      const nFrom = Number(v);
                      const nTo = Number(toVal);
                      if (Number.isFinite(nFrom) && Number.isFinite(nTo) && nTo < nFrom) {
                        // ✅ from이 to보다 커지면 to를 from으로 끌어올림
                        return v;
                      }
                      return toVal;
                    });
                  }}
                >
                  <option value="all">{t.all}</option>
                  {buildYearOptions.map((y) => (
                    <option key={`bf-${y}`} value={y}>{y}</option>
                  ))}
                </select>

                <select
                  className={filterControlClass}
                  value={buildTo}
                  onChange={(e) => {
                    const v = e.target.value; // 'all' or year
                    setBuildTo(v);

                    // ✅ (권장) to를 낮춰서 from보다 작아지면 from을 to로 맞춤
                    setBuildFrom((prevFrom) => {
                      const fromVal = String(prevFrom || 'all');
                      if (v === 'all') return fromVal;
                      if (fromVal === 'all') return fromVal;
                      const nFrom = Number(fromVal);
                      const nTo = Number(v);
                      if (Number.isFinite(nFrom) && Number.isFinite(nTo) && nFrom > nTo) {
                        return v;
                      }
                      return fromVal;
                    });
                  }}
                >
                  <option value="all">{t.all}</option>
                  {buildYearOptions.map((y) => (
                    <option key={`bt-${y}`} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ 금액 구간 필터 */}
            <div className={`${filterFieldClass} min-[390px]:col-span-2 md:col-span-7`}>
              <div className="text-sm text-slate-500 mb-1">{lang === 'en' ? 'Price range' : '금액 구간'}</div>
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <select
                  className={filterControlClass}
                  value={priceMetric}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPriceMetric(v);
                    if (v === 'none') { setPriceMin(''); setPriceMax(''); }
                  }}
                >
                  {priceMetricOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {lang === 'en' ? o.label_en : o.label_ko}
                    </option>
                  ))}
                </select>
                <div className="flex min-w-0 items-center gap-1">
                  <input
                    className={filterControlClass}
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder={lang === 'en' ? 'Min' : '최소'}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    disabled={priceMetric === 'none'}
                  />
                  <span className="shrink-0 text-xs text-slate-400">(억)</span>
                </div>
                <div className="flex min-w-0 items-center gap-1">
                  <input
                    className={filterControlClass}
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder={lang === 'en' ? 'Max' : '최대'}
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    disabled={priceMetric === 'none'}
                  />
                  <span className="shrink-0 text-xs text-slate-400">(억)</span>
                </div>
              </div>
            </div>

            {/* ✅ 세대수 필터 */}
            <div className={`${filterFieldClass} min-[390px]:col-span-2 md:col-span-6`}>
              <div className="text-sm text-slate-500 mb-1">
                {lang === 'en' ? 'Advanced: households' : '고급 조건: 세대수'}
              </div>
              <div className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-2 sm:grid-cols-[minmax(5rem,0.8fr)_minmax(0,1fr)_auto]">
                <select
                  className={filterControlClass}
                  value={hhOp}
                  onChange={(e) => setHhOp(e.target.value === 'lte' ? 'lte' : 'gte')}
                >
                  <option value="gte">{lang === 'en' ? '≥' : '이상'}</option>
                  <option value="lte">{lang === 'en' ? '≤' : '이하'}</option>
                </select>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  className={filterControlClass}
                  placeholder={lang === 'en' ? 'e.g. 1000' : '예: 1000'}
                  value={hh}
                  onChange={(e) => setHh(String(e.target.value || '').replace(/[^\d]/g, ''))}
                />
                <button
                  type="button"
                  className="min-h-[44px] min-w-0 rounded-lg border px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  onClick={() => setHh('')}
                  title={lang === 'en' ? 'Clear' : '초기화'}
                >
                  {lang === 'en' ? 'Clear' : '초기화'}
                </button>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {lang === 'en'
                  ? 'Uses verified/matched complex info. Empty input disables this filter.'
                  : '검증/매칭된 단지정보 기준입니다. 입력값이 없으면 필터를 적용하지 않습니다.'}
              </div>
            </div>
          </div>

          {/* ✅ 아파트명 검색 */}
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className={`${filterFieldClass} md:col-span-4`}>
              <div className="text-sm text-slate-500 mb-1">{t.aptName}</div>
              <input
                className={filterControlClass}
                value={aptName}
                onChange={(e) => setAptName(e.target.value)}
                placeholder={t.aptNamePh}
              />
              <div className="text-[11px] text-slate-400 mt-1">{t.aptNameHelp}</div>
            </div>
          </div>

          <div className="mt-2 text-sm text-slate-500">{t.tip}</div> 

          <div className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                {loading ? (lang === 'en' ? 'Loading...' : '조회 중...') : (lang === 'en' ? `Rows: ${rows.length}` : `건수: ${rows.length}`)}
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
                {/* Desktop only: Cards/Table toggle + Advanced */}
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
                {/* Advanced: 모바일/데스크탑 공통 */}
                <label className="inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs text-slate-600">
                  <input type="checkbox" checked={showAdvanced} onChange={(e) => setShowAdvanced(e.target.checked)} />
                  {lang === 'en' ? 'Advanced' : '고급'}
                </label>
                <button className="min-h-[44px] min-w-0 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-50" onClick={fetchTop}>
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

              {rows.map((r, idx) => {
                const interval = 6; // 6개마다 1개 광고
                const shouldInsert = (idx + 1) % interval === 0 && (idx + 1) < rows.length;

                return (
                  <Fragment key={r.apt_key || `${r.lawd_cd}-${r.apt_name}-${idx}`}>
                    <ResultCard r={r} idx={idx} />
                    {shouldInsert && (
                      <AdSenseUnit
                        slot={INFEED_SLOT}
                        className="md:col-span-2 lg:col-span-3" // grid 전체 폭 차지
                        adTest={false} // 테스트 시 true
                      />
                    )}
                  </Fragment>
                );
              })}

            </div>            

            {/* Desktop table */}
            {desktopView === 'table' && (
              <div className="hidden md:block mt-3 max-w-full overflow-x-auto rounded-2xl border bg-white">
                <table className={`${tableMinWidth} w-full text-sm`}>
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-3 pr-3">{t.cols.rank}</th>
                    <th className="py-3 pr-3">{t.cols.area}</th>
                    <th className="py-3 pr-3">{t.cols.apt}</th>
                    <th className="py-3 pr-3">{t.cols.complexScale}</th>
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
                        <th className="py-3 pr-3">{t.cols.complexInfo}</th>
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
                  {rows.map((r, idx) => (
                    <tr key={r.apt_key || `${r.lawd_cd}-${r.apt_name}-${r.dong_name}`} className="border-b hover:bg-slate-50">
                      <td className="py-3 pr-3">{idx + 1}</td>
                      <td className="py-3 pr-3">{renderArea(r)}</td>
                      <td className="py-3 pr-3 font-medium">
                        <Link
                          href={makeAptDetailHref(r)}
                          onClick={() => handleAptDetailClick(r, idx, "result_table")}
                          className="underline underline-offset-2 hover:text-slate-900"
                          title={renderApt(r)}
                        >
                          {renderApt(r)}
                        </Link>
                      </td>
                       <td className="py-3 pr-3">
                         <div className="flex min-w-[180px] flex-col gap-1">
                           <div className="font-medium text-slate-800">{renderHouseholdDong(r)}</div>
                           {renderParking(r) !== '-' && <div className="text-xs text-slate-500">{renderParking(r)}</div>}
                           <div className="flex flex-wrap gap-1">
                             <ComplexInfoBadge row={r} />
                             <ComplexWarning row={r} />
                           </div>
                         </div>
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
                          <td className="py-3 pr-3">{renderComplexInfo(r)}</td>
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
                      <td colSpan={showAdvanced ? 31 : 18} className="py-10 text-center text-slate-500">
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
