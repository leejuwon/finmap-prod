// pages/market/real-estate/trades.js
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

function fmtMoneyWon(v) {
  if (v == null) return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString('ko-KR') + '원';
}

function fmtPct(v) {
  if (v == null) return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return '-';
  return `${n.toFixed(2)}%`;
}

function areaLabel(row) {
  // 경기도만 "시 + 구", 구 없으면 "전체"
  if (row.sido_name === '경기도') {
    if (row.gu_name) return `${row.sigungu_name} ${row.gu_name}`;
    return `${row.sigungu_name} 전체`;
  }
  // 서울/인천: sigungu_name 자체가 구/군
  return row.sigungu_name || '-';
}

export default function RealEstateTradeTopPage() {
  const router = useRouter();
  const [opts, setOpts] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [sido, setSido] = useState('11'); // default 서울
  const [lawd, setLawd] = useState('');   // ''이면 시도 전체
  const [gu, setGu] = useState('');       // 경기도 구
  const [timeframe, setTimeframe] = useState('month');
  const [period, setPeriod] = useState('');
  const [metric, setMetric] = useState('avg_price');
  const [order, setOrder] = useState('desc');
  const [top, setTop] = useState(100);
  const [pyeong, setPyeong] = useState('all');
  const [buildFrom, setBuildFrom] = useState('');
  const [buildTo, setBuildTo] = useState('');

  const [rows, setRows] = useState([]);

  // options load
  useEffect(() => {
    (async () => {
      const r = await fetch('/api/re/trade-options');
      const j = await r.json();
      if (j?.ok) {
        setOpts(j);
        const defaultPeriod = j.periods?.month?.[0] || '';
        setPeriod(defaultPeriod);
      }
    })();
  }, []);

  // areas load when sido changes
  useEffect(() => {
    (async () => {
      setLawd('');
      setGu('');
      if (!sido || sido === 'all') {
        setAreas([]);
        return;
      }
      const r = await fetch(`/api/re/trade-areas?sido=${encodeURIComponent(sido)}`);
      const j = await r.json();
      setAreas(j?.areas || []);
    })();
  }, [sido]);

  const periodOptions = useMemo(() => {
    if (!opts) return [];
    return timeframe === 'year' ? (opts.periods?.year || []) : (opts.periods?.month || []);
  }, [opts, timeframe]);

  async function runSearch() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('sido', sido);
      if (lawd) qs.set('lawd', lawd);
      if (gu) qs.set('gu', gu);
      qs.set('timeframe', timeframe);
      qs.set('period', period);
      qs.set('metric', metric);
      qs.set('order', order);
      qs.set('top', String(top));
      qs.set('pyeong', pyeong);

      if (buildFrom) qs.set('buildFrom', buildFrom);
      if (buildTo) qs.set('buildTo', buildTo);

      qs.set('compare', '1');

      const r = await fetch(`/api/re/trade-top?${qs.toString()}`);
      const j = await r.json();
      if (j?.ok) setRows(j.rows || []);
      else alert(j?.error || '조회 실패');
    } finally {
      setLoading(false);
    }
  }

  // ✅ 정렬/지표 바꾸면 자동으로 다시 조회 (프리미엄 UX)
  useEffect(() => {
    if (!ready) return; // 옵션 로딩 완료 플래그가 있다면 사용
    runSearch();
  }, [topBy, sort, timeframe, period, sido, gu, lawd, areaBand, top]);

  // 시군구 dropdown: 경기도는 "도시 전체 / 도시 구"가 섞여 있음 → lawd/gu를 함께 세팅
  function onSelectArea(v) {
    if (!v) {
      setLawd('');
      setGu('');
      return;
    }
    // value format: lawd_cd||gu_name
    const [lawdCd, guName] = v.split('||');
    setLawd(lawdCd || '');
    setGu(guName || '');
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">부동산 단지 Top</h1>
          <p className="text-sm text-slate-500">
            re_trade_apt 기준으로 조건(시도/시군구/전체/평형/년식/기간/지표)에서 단지 TopN을 뽑습니다.
          </p>
        </div>
        <button
          onClick={() => router.push('/market/real-estate')}
          className="text-sm px-3 py-2 rounded-xl border hover:bg-slate-50"
        >
          통계 Top100으로
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
        <div>
          <label className="text-xs text-slate-500">시도</label>
          <select className="w-full border rounded-xl px-3 py-2"
            value={sido}
            onChange={(e) => setSido(e.target.value)}
          >
            {(opts?.sidos || []).map((x) => (
              <option key={x.code} value={x.code}>{x.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500">시군구</label>
          <select className="w-full border rounded-xl px-3 py-2"
            value={lawd ? `${lawd}||${gu}` : ''}
            onChange={(e) => onSelectArea(e.target.value)}
          >
            <option value="">전체 (선택한 시도)</option>
            {areas.map((a) => (
              <option key={`${a.lawd_cd}||${a.gu_name || ''}`} value={`${a.lawd_cd}||${a.gu_name || ''}`}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500">집계</label>
          <select className="w-full border rounded-xl px-3 py-2"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="month">월간</option>
            <option value="year">년간</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500">기간</label>
          <select className="w-full border rounded-xl px-3 py-2"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {periodOptions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500">지표</label>
          <select className="w-full border rounded-xl px-3 py-2"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            {(opts?.metrics || []).map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500">Top</label>
          <select className="w-full border rounded-xl px-3 py-2"
            value={top}
            onChange={(e) => setTop(Number(e.target.value))}
          >
            {(opts?.tops || [10,20,50,100]).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500">정렬</label>
          <select className="w-full border rounded-xl px-3 py-2"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          >
            <option value="desc">상위</option>
            <option value="asc">하위</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500">평형</label>
          <select className="w-full border rounded-xl px-3 py-2"
            value={pyeong}
            onChange={(e) => setPyeong(e.target.value)}
          >
            {(opts?.pyeongBands || []).map((b) => (
              <option key={b.key} value={b.key}>{b.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500">년식(from)</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={buildFrom}
            onChange={(e) => setBuildFrom(e.target.value)}
            placeholder="예: 2010"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">년식(to)</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={buildTo}
            onChange={(e) => setBuildTo(e.target.value)}
            placeholder="예: 2020"
          />
        </div>

        <div className="col-span-2 md:col-span-2 flex items-end">
          <button
            onClick={runSearch}
            className="w-full px-4 py-3 rounded-xl bg-black text-white hover:opacity-90"
            disabled={loading}
          >
            {loading ? '조회 중...' : '조회'}
          </button>
        </div>
      </div>

      <div className="mt-5 text-xs text-slate-500">
        팁: 202501이면 이전 기간은 202412(월간)로 비교합니다. 이전 데이터가 없으면 이전(%) / 순위변동이 “-”로 나올 수 있어요.
      </div>
      <div className="mt-2 text-xs text-slate-500">
        거래량(tx_count)은 선택한 기간·평형·지역·년식 조건을 만족하는 <b>해당 단지의 실거래 “건수”</b>입니다. (취소거래 제외)
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[1100px] w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3 w-16">#</th>
              <th className="py-2 pr-3 w-32">시도</th>
              <th className="py-2 pr-3 w-40">시군구</th>
              <th className="py-2 pr-3 w-40">동</th>
              <th className="py-2 pr-3">단지(최근거래)</th>
              <th className="py-2 pr-3 w-32">지표값</th>
              <th className="py-2 pr-3 w-24">이전(%)</th>
              <th className="py-2 pr-3 w-24">순위변동</th>
              <th
                className="py-2 pr-3 w-20"
                title="거래량(tx_count)=선택한 기간·평형·지역·년식 조건을 만족하는 해당 단지의 실거래 건수(취소거래 제외)"
              >
                거래량
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const complex = [
                r.apt_name,
                r.latest_apt_dong ? `${r.latest_apt_dong}` : null,
                r.latest_floor != null ? `${r.latest_floor}층` : null,
              ].filter(Boolean).join(' ');

              return (
                <tr key={`${r.lawd_cd}-${r.dong_name}-${r.apt_name}-${r.rank_no}`} className="border-b">
                  <td className="py-2 pr-3">{r.rank_no}</td>
                  <td className="py-2 pr-3">{r.sido_name || '-'}</td>
                  <td className="py-2 pr-3">{areaLabel(r)}</td>
                  <td className="py-2 pr-3">{r.dong_name || '-'}</td>
                  <td className="py-2 pr-3">
                    <div className="font-medium">{complex}</div>
                    <div className="text-xs text-slate-500">
                      {r.latest_deal_date ? `최근: ${r.latest_deal_date}` : ''}
                      {r.latest_deal_amount_man ? ` · ${r.latest_deal_amount_man}만원` : ''}
                      {r.latest_area_m2 ? ` · ${Number(r.latest_area_m2).toFixed(2)}㎡` : ''}
                    </div>
                  </td>
                  <td className="py-2 pr-3">
                    {metric.includes('price_per_m2')
                      ? (r.value != null ? Number(r.value).toLocaleString('ko-KR') : '-')
                      : fmtMoneyWon(r.value)}
                  </td>
                  <td className="py-2 pr-3">{fmtPct(r.pct_change)}</td>
                  <td className="py-2 pr-3">{r.rank_delta == null ? '-' : r.rank_delta}</td>
                  <td className="py-2 pr-3">{r.tx_count ?? '-'}</td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-400">
                  조건을 선택하고 조회를 눌러주세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}