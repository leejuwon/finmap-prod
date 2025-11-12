import { useState } from 'react';
import SeoHead from '../../_components/SeoHead';

export default function CompoundTool(){
  const [mode, setMode] = useState('lump'); // 'lump' or 'monthly'
  const [principal, setPrincipal] = useState(1000000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(5);
  const [freq, setFreq] = useState(12); // 1=연, 12=월
  const [pmt, setPmt] = useState(200000); // 월 적립금

  const r = rate/100;
  const m = Number(freq);
  const t = Number(years);

  let total = 0, interest = 0;
  if (mode === 'lump'){
    total = principal * Math.pow(1 + r/m, m*t);
    interest = total - principal;
  } else {
    total = pmt * ((Math.pow(1 + r/m, m*t) - 1) / (r/m)) * (1 + r/m);
    interest = total - pmt*(m*t);
  }

  return (
    <>
      <SeoHead title="복리 계산기(간단)" desc="원금/월적립, 연/월 복리 간단 계산" url="/tools/compound-interest" />
      <h1>복리 계산기 (간단)</h1>
      <div style={{display:'grid', gap:12, maxWidth:520}}>
        <label>모드:
          <select value={mode} onChange={e=>setMode(e.target.value)}>
            <option value="lump">거치식</option>
            <option value="monthly">매월 적립</option>
          </select>
        </label>
        {mode==='lump' ? (
          <label>원금(원):
            <input type="number" value={principal} onChange={e=>setPrincipal(Number(e.target.value))}/>
          </label>
        ) : (
          <label>월 적립금(원):
            <input type="number" value={pmt} onChange={e=>setPmt(Number(e.target.value))}/>
          </label>
        )}
        <label>기간(년):
          <input type="number" value={years} onChange={e=>setYears(Number(e.target.value))}/>
        </label>
        <label>연이율(%):
          <input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))}/>
        </label>
        <label>복리 주기:
          <select value={freq} onChange={e=>setFreq(Number(e.target.value))}>
            <option value={1}>연 1회</option>
            <option value={12}>월 12회</option>
          </select>
        </label>
      </div>

      <div style={{marginTop:16, padding:12, background:'#fafafa', border:'1px solid #eee'}}>
        <div><b>총액(세전):</b> {Math.round(total).toLocaleString()}원</div>
        <div><b>이자(세전):</b> {Math.round(interest).toLocaleString()}원</div>
      </div>
      <p style={{opacity:.7, fontSize:13, marginTop:8}}>
        ※ 정보 제공 목적. 실제 세금/수수료는 금융기관·법령에 따라 다를 수 있습니다.
      </p>
    </>
  );
}
