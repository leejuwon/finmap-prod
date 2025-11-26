// _components/CagrForm.js
import { useState, useMemo } from 'react';

const dict = {
  ko: {
    title: '투자 수익률(CAGR) 계산기',
    initialWon: '초기 자산(만원)',
    initialUsd: '초기 자산(USD)',
    finalWon: '최종 자산(만원)',
    finalUsd: '최종 자산(USD)',
    years: '투자 기간(년)',
    calc: '수익률 계산하기',
    currency: '통화',
    tax: '세금(이자소득세 %, 0이면 없음)',
    fee: '수수료(연 %, 0이면 없음)',
  },
  en: {
    title: 'CAGR (Investment Return) Calculator',
    initialWon: 'Initial Value (×10k KRW)',
    initialUsd: 'Initial Value (USD)',
    finalWon: 'Final Value (×10k KRW)',
    finalUsd: 'Final Value (USD)',
    years: 'Years',
    calc: 'Calculate CAGR',
    currency: 'Currency',
    tax: 'Tax rate (%; 0 = none)',
    fee: 'Fee per year (%; 0 = none)',
  },
};

export default function CagrForm({
  onSubmit,
  locale = 'ko',
  currency = 'KRW',     // 부모 상태
  onCurrencyChange,     // 부모에게 통화 변경 알림
}) {
  const safeLocale = String(locale).startsWith('en') ? 'en' : 'ko';

  const [form, setForm] = useState({
    initial: 1000,  // 만원 or USD
    final: 2000,    // 만원 or USD
    years: 10,
    taxRate: 15.4,  // 기본 세율(%)
    feeRate: 0.5,   // 기본 수수료율(%)
  });

  const t = useMemo(() => dict[safeLocale] || dict.ko, [safeLocale]);
  const numberLocale = safeLocale === 'ko' ? 'ko-KR' : 'en-US';

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    const raw = String(value).replace(/[^\d]/g, '');
    const num = raw ? Number(raw) : 0;
    setForm((prev) => ({ ...prev, [name]: num }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const num = value === '' ? '' : Number(value);
    setForm((prev) => ({ ...prev, [name]: num }));
  };

  const disabled = useMemo(
    () => !form.years || form.years <= 0 || !form.initial || !form.final,
    [form.years, form.initial, form.final]
  );

  const handleSubmit = () => {
    onSubmit({
      ...form,
      currency,
    });
  };

  const initialLabel =
    currency === 'KRW' ? t.initialWon : t.initialUsd;
  const finalLabel =
    currency === 'KRW' ? t.finalWon : t.finalUsd;

  const fmt = (n) => {
    const v = Number(n) || 0;
    return v.toLocaleString(numberLocale);
  };

  return (
    <div className="grid gap-4">
      {/* 1행: 금액 입력 */}
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-sm">{initialLabel}</span>
          <input
            name="initial"
            type="text"
            inputMode="numeric"
            className="input"
            value={fmt(form.initial)}
            onChange={handleMoneyChange}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{finalLabel}</span>
          <input
            name="final"
            type="text"
            inputMode="numeric"
            className="input"
            value={fmt(form.final)}
            onChange={handleMoneyChange}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{t.years}</span>
          <input
            name="years"
            type="number"
            inputMode="numeric"
            className="input"
            value={form.years}
            onChange={handleChange}
            min="0.1"
            step="0.1"
          />
        </label>
      </div>

      {/* 2행: 세금/수수료/통화 */}
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-sm">{t.tax}</span>
          <input
            name="taxRate"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.taxRate}
            onChange={handleNumberChange}
            min="0"
            step="0.1"
            placeholder="15.4"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">{t.fee}</span>
          <input
            name="feeRate"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.feeRate}
            onChange={handleNumberChange}
            min="0"
            step="0.1"
            placeholder="0.5"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">{t.currency}</span>
          <select
            className="select"
            value={currency}
            onChange={(e) => {
              const next = e.target.value;
              onCurrencyChange && onCurrencyChange(next);
            }}
          >
            <option value="KRW">KRW ₩</option>
            <option value="USD">USD $</option>
          </select>
        </label>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={disabled}
        >
          {t.calc}
        </button>
      </div>
    </div>
  );
}
