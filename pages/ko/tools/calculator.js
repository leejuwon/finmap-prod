import { useState } from 'react';

export default function Calculator() {
  const [a, setA] = useState('0');
  const [b, setB] = useState('0');
  const sum = (Number(a) || 0) + (Number(b) || 0);
  const diff = (Number(a) || 0) - (Number(b) || 0);
  const prod = (Number(a) || 0) * (Number(b) || 0);

  return (
    <div className="container">
      <h1>샘플 계산기</h1>
      <p>간단한 덧셈/뺄셈/곱셈</p>
      <div style={{display:'grid', gridTemplateColumns:'120px 1fr', gap:'8px', maxWidth:420}}>
        <label>값 A</label>
        <input value={a} onChange={e=>setA(e.target.value)} />

        <label>값 B</label>
        <input value={b} onChange={e=>setB(e.target.value)} />
      </div>
      <div className="post">
        <div>A + B = {sum}</div>
        <div>A - B = {diff}</div>
        <div>A × B = {prod}</div>
      </div>

      <p><a href="/ko">← 홈</a></p>
    </div>
  );
}
