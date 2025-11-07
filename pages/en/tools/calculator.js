import { useState } from 'react';

export default function Calculator() {
  const [a, setA] = useState('0');
  const [b, setB] = useState('0');
  const sum = (Number(a) || 0) + (Number(b) || 0);
  const diff = (Number(a) || 0) - (Number(b) || 0);
  const prod = (Number(a) || 0) * (Number(b) || 0);

  return (
    <div className="container">
      <h1>Sample Calculate</h1>
      <p>Simple Plus/Minus</p>
      <div style={{display:'grid', gridTemplateColumns:'120px 1fr', gap:'8px', maxWidth:420}}>
        <label>Value A</label>
        <input value={a} onChange={e=>setA(e.target.value)} />

        <label>Value B</label>
        <input value={b} onChange={e=>setB(e.target.value)} />
      </div>
      <div className="post">
        <div>A + B = {sum}</div>
        <div>A - B = {diff}</div>
        <div>A × B = {prod}</div>
      </div>

      <p><a href="/en">← Home</a></p>
    </div>
  );
}
