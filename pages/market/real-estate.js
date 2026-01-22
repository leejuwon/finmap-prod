import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import ToolSeo from "../../_components/ToolSeo";

const M2_PER_PYEONG = 3.305785;

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

function fmtManPerPyeongFromWonPerM2(wonPerM2) {
  const n = numOrNull(wonPerM2);
  if (n == null) return '-';
  const wonPerPyeong = n * M2_PER_PYEONG;
  const manPerPyeong = wonPerPyeong / 10_000;
  return `${Math.round(manPerPyeong).toLocaleString()}만원/평`;
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
      median_price: '중위(총액)',
      avg_price: '평균(총액)',
      median_price_per_m2: '중위(㎡당)',
      avg_price_per_m2: '평균(㎡당)',
    },
    metricHelp:
      '“㎡당”은 각 거래의 (거래총액 ÷ 전용㎡)을 계산한 뒤, 단지 내 거래들의 평균/중위값을 낸 것입니다. 표에는 만원/평도 함께 표시합니다.',
    legendTitle: '기준/계산 방식',
    legendLines: [
      '기간 기준: 계약월(deal_ym).',
      '제외: 취소거래(cancel_yn="Y").',
      '단지 집계: 선택 기간 내 단지별 거래값(총액/㎡당)의 평균·중위.',
      '평단가(만원/평): (원/㎡) × 3.305785 ÷ 10,000.',
      '금액 표기: 억(=100,000,000원) 단위.',
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
      medEok: '중위(억)',
      avgEok: '평균(억)',
      medPy: '중위평단가',
      avgPy: '평균평단가',
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
      median_price: 'Median (Total)',
      avg_price: 'Average (Total)',
      median_price_per_m2: 'Median (/㎡)',
      avg_price_per_m2: 'Average (/㎡)',
    },
    metricHelp:
      '“/㎡” is computed per deal as (total price ÷ area㎡), then averaged/median across deals for the complex. Table also shows 10k KRW per pyeong.',
    legendTitle: 'Basis & methodology',
    legendLines: [
      'Period basis: contract month (deal_ym).',
      'Excludes: canceled deals (cancel_yn="Y").',
      'Complex aggregation: average/median within the selected period.',
      'Per-pyeong (10k KRW/pyeong): (KRW/㎡) × 3.305785 ÷ 10,000.',
      'Money display: ×100M KRW (억).',
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
      medEok: 'Median (×100M)',
      avgEok: 'Avg (×100M)',
      medPy: 'Median /pyeong',
      avgPy: 'Avg /pyeong',
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

  // ---------- (B) SEO helpers ----------
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''; // 운영에서 꼭 설정 추천
  const pathNoQuery = (router.asPath || '/market/real-estate').split('?')[0];

  // locale prefix를 쓰든 안 쓰든 최대한 안전하게: 앞의 /en 또는 /ko만 제거/부착
  const localeRegex = /^\/(en|ko)(?=\/|$)/;
  const strippedPath = pathNoQuery.replace(localeRegex, '') || '/';

  const defaultLocale = router.defaultLocale || 'ko';
  const currentLocale = router.locale || defaultLocale;

  const title = lang === "en" ? "Korea Real Estate Dashboard" : "대한민국 부동산 대시보드";
  const desc =
    lang === "en"
      ? "Explore apartment transaction rankings and price metrics across South Korea."
      : "전국 아파트 실거래 기반 랭킹·가격지표를 한 화면에서 확인합니다.";


  function pathForLocale(targetLocale) {
    // defaultLocale은 prefix 없는 운영이 일반적(ko가 default라는 가정)
    if (targetLocale === defaultLocale) return strippedPath.startsWith('/') ? strippedPath : `/${strippedPath}`;
    return `/${targetLocale}${strippedPath.startsWith('/') ? strippedPath : `/${strippedPath}`}`;
  }

  const canonical = siteUrl ? `${siteUrl}${pathForLocale(currentLocale)}` : undefined;
  const hrefKo = siteUrl ? `${siteUrl}${pathForLocale('ko')}` : undefined;
  const hrefEn = siteUrl ? `${siteUrl}${pathForLocale('en')}` : undefined;

  const seoTitle = t.title;
  const seoDesc = t.seoDesc;

  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t.title,
    description: seoDesc,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    inLanguage: lang,
    url: canonical || (siteUrl ? `${siteUrl}${pathNoQuery}` : undefined),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    creator: { '@type': 'Organization', name: 'Finmap' },
  };

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
    const arr = opt?.sidos?.length ? opt.sidos : [
      { value: 'all', label_ko: '전체', label_en: 'All' },
      { value: '11', label_ko: '서울특별시', label_en: 'Seoul' },
      { value: '28', label_ko: '인천광역시', label_en: 'Incheon' },
      { value: '41', label_ko: '경기도', label_en: 'Gyeonggi-do' },
    ];
    return arr;
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

  const tableMinWidth = 'min-w-[2200px]';

  return (
      <>
      <ToolSeo
        title={title}
        desc={desc}
        image="/og-tools/real-estate.png"
        appName={title}
        appCategory="FinanceApplication"
        about={{ "@type": "Place", name: "South Korea" }}
        keywords={lang === "en" ? "Korea real estate, apartment transactions" : "한국 부동산, 아파트 실거래"}
      />
    <div className="w-full px-4 py-6">
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        {canonical ? <link rel="canonical" href={canonical} /> : null}

        {/* hreflang */}
        {hrefKo ? <link rel="alternate" hrefLang="ko" href={hrefKo} /> : null}
        {hrefEn ? <link rel="alternate" hrefLang="en" href={hrefEn} /> : null}
        {hrefKo ? <link rel="alternate" hrefLang="x-default" href={hrefKo} /> : null}

        {/* OG */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        {canonical ? <meta property="og:url" content={canonical} /> : null}

        {/* JSON-LD: WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
      </Head>

      <div className="w-full max-w-6xl mx-auto">
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
              <button className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50" onClick={fetchTop}>
                {lang === 'en' ? 'Refresh' : '새로고침'}
              </button>
            </div>

            <div className="overflow-x-auto mt-3">
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
                    <th className="py-3 pr-3">{t.cols.regDate}</th>
                    <th className="py-3 pr-3">{t.cols.dealEok}</th>

                    <th className="py-3 pr-3">{t.cols.tx}</th>
                    <th className="py-3 pr-3">{t.cols.medEok}</th>
                    <th className="py-3 pr-3">{t.cols.avgEok}</th>

                    <th className="py-3 pr-3">{t.cols.medPy}</th>
                    <th className="py-3 pr-3">{t.cols.avgPy}</th>

                    <th className="py-3 pr-3">{t.cols.rankMom}</th>
                    <th className="py-3 pr-3">{t.cols.rankYoy}</th>

                    <th className="py-3 pr-3">{t.cols.txMom}</th>
                    <th className="py-3 pr-3">{t.cols.txYoy}</th>

                    <th className="py-3 pr-3">{t.cols.medMom}</th>
                    <th className="py-3 pr-3">{t.cols.medYoy}</th>

                    <th className="py-3 pr-3">{t.cols.avgMom}</th>
                    <th className="py-3 pr-3">{t.cols.avgYoy}</th>
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
                      <td className="py-3 pr-3">{r.latest_build_year ?? '-'}</td>

                      <td className="py-3 pr-3">{r.latest_deal_date ? String(r.latest_deal_date).slice(0, 10) : '-'}</td>
                      <td className="py-3 pr-3">{r.latest_rgst_date ? String(r.latest_rgst_date).slice(0, 10) : '-'}</td>

                      <td className="py-3 pr-3">{fmtEokFromMan(r.latest_deal_amount_man, lang)}</td>

                      <td className="py-3 pr-3">{Number(r.tx_count).toLocaleString()}</td>
                      <td className="py-3 pr-3">{fmtEokFromWon(r.median_price, lang)}</td>
                      <td className="py-3 pr-3">{fmtEokFromWon(r.avg_price, lang)}</td>

                      <td className="py-3 pr-3">{fmtManPerPyeongFromWonPerM2(r.median_price_per_m2)}</td>
                      <td className="py-3 pr-3">{fmtManPerPyeongFromWonPerM2(r.avg_price_per_m2)}</td>

                      <td className="py-3 pr-3">{r.mom_rank_delta == null ? '-' : (r.mom_rank_delta > 0 ? `+${r.mom_rank_delta}` : `${r.mom_rank_delta}`)}</td>
                      <td className="py-3 pr-3">{r.yoy_rank_delta == null ? '-' : (r.yoy_rank_delta > 0 ? `+${r.yoy_rank_delta}` : `${r.yoy_rank_delta}`)}</td>

                      <td className="py-3 pr-3">{fmtPct(r.mom_tx_count_pct)}</td>
                      <td className="py-3 pr-3">{fmtPct(r.yoy_tx_count_pct)}</td>

                      <td className="py-3 pr-3">{fmtPct(r.mom_median_price_pct)}</td>
                      <td className="py-3 pr-3">{fmtPct(r.yoy_median_price_pct)}</td>

                      <td className="py-3 pr-3">{fmtPct(r.mom_avg_price_pct)}</td>
                      <td className="py-3 pr-3">{fmtPct(r.yoy_avg_price_pct)}</td>
                    </tr>
                  ))}

                  {!rows.length && !loading && (
                    <tr>
                      <td colSpan={22} className="py-10 text-center text-slate-500">
                        {lang === 'en' ? 'No data' : '데이터 없음'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
    </>
  );
}
