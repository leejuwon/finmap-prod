// _components/CompoundForm.js
import { useState, useMemo } from 'react';

const ko = {
  title: '복리 계산기',
  principal: '초기 투자금(원)',
  monthly: '월 적립금(원)',
  rate: '연 수익률(%)',
  years: '투자 기간(년)',
  calc: '계산하기',
  result: '결과',
  fv: '미래가치',
  contrib: '총 납입액',
  interest: '이자 합계',
  locale: '한국어',
  currency: '통화',
};
const en = {
  title: 'Compound Interest Calculator',
  principal: 'Initial Principal',
  monthly: 'Monthly Contribution',
  rate: 'Annual Rate (%)',
  years: 'Years',
  calc: 'Calculate',
  result: 'Result',
  fv: 'Future Value',
  contrib: 'Total Contribution',
  interest: 'Total Interest',
  locale: 'English',
  currency: 'Currency',
};

export default function CompoundForm({ onSubmit, locale = 'ko' }) {
  const t = locale === 'ko' ? ko : en;
  const [form, setForm] = useState({
    principal: 1000000,
    monthly: 300000,
    annualRate: 7,
    years: 10,
  });
  const [currency, setCurrency] = useState(locale === 'ko' ? 'KRW' : 'USD');

  const onChange = (e) => {
    const { name, value } = e.target;
    const num = Number(String(value).replace(/[^0-9.]/g, ''));
    setForm(prev => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
  };

  const disabled = useMemo(() => form.years <= 0, [form.years]);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="grid gap-1">
          <span className="text-sm">{t.principal}</span>
          <input
            name="principal" type="number" inputMode="numeric"
            className="input" value={form.principal} onChange={onChange}
            min="0" step="1000"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{t.monthly}</span>
          <input
            name="monthly" type="number" inputMode="numeric"
            className="input" value={form.monthly} onChange={onChange}
            min="0" step="1000"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{t.rate}</span>
          <input
            name="annualRate" type="number" inputMode="decimal"
            className="input" value={form.annualRate} onChange={onChange}
            min="0" step="0.1"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{t.years}</span>
          <input
            name="years" type="number" inputMode="numeric"
            className="input" value={form.years} onChange={onChange}
            min="1" step="1"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm flex items-center gap-2">
          {t.currency}
          <select className="select" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
            <option value="KRW">KRW ₩</option>
            <option value="USD">USD $</option>
          </select>
        </label>
        <button
          className="btn-primary ml-auto"
          onClick={() => onSubmit({ ...form, currency })}
          disabled={disabled}
        >
          {t.calc}
        </button>
      </div>
    </div>
  );
}
