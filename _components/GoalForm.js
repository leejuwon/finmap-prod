import { useState, useMemo, useEffect } from 'react';

const dict = {
  ko: {
    currentWon: '현재 자산(만원)',
    currentUsd: '현재 자산(USD)',
    monthlyWon: '월 납입금(만원)',
    monthlyUsd: '월 납입금(USD)',
    rate: '연 수익률 가정(%)',
    years: '투자 기간(년)',
    targetWon: '목표 자산(만원)',
    targetUsd: '목표 자산(USD)',
    calc: '시뮬레이션 실행',
    currency: '통화',
    compounding: '수익률 환산 방식',
    compoundingMonthly: '월 단순 환산',
    compoundingYearly: '연 복리 환산',
    taxRateLabel: '세율(수익률 차감, %)',
    feeRateLabel: '연 수수료율(%, 수익률 차감)',
  },
  en: {
    currentWon: 'Current assets (10k KRW)',
    currentUsd: 'Current assets (USD)',
    monthlyWon: 'Monthly contribution (10k KRW)',
    monthlyUsd: 'Monthly contribution (USD)',
    rate: 'Annual return assumption (%)',
    years: 'Investment period (years)',
    targetWon: 'Target assets (10k KRW)',
    targetUsd: 'Target assets (USD)',
    calc: 'Run simulation',
    currency: 'Currency',
    compounding: 'Return conversion',
    compoundingMonthly: 'Simple monthly',
    compoundingYearly: 'Annual compound',
    taxRateLabel: 'Tax rate adjustment (%)',
    feeRateLabel: 'Annual fee adjustment (%)',
  },
};

const DEFAULT_FORM = {
  current: 2000,
  monthly: 50,
  annualRate: 7,
  years: 15,
  target: 10000,
  compounding: 'monthly',
  taxRatePercent: 15.4,
  feeRatePercent: 0.5,
};

export default function GoalForm({
  onSubmit,
  locale = 'ko',
  currency = 'KRW',
  onCurrencyChange,
  initialValues,
}) {
  const safeLocale = String(locale).startsWith('en') ? 'en' : 'ko';
  const [form, setForm] = useState(() => ({ ...DEFAULT_FORM, ...(initialValues || {}) }));

  useEffect(() => {
    if (!initialValues) return;
    setForm((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

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

  const disabled = useMemo(() => Number(form.years) <= 0, [form.years]);

  const handleSubmit = () => {
    onSubmit({
      ...form,
      currency,
    });
  };

  const currentLabel = currency === 'KRW' ? t.currentWon : t.currentUsd;
  const monthlyLabel = currency === 'KRW' ? t.monthlyWon : t.monthlyUsd;
  const targetLabel = currency === 'KRW' ? t.targetWon : t.targetUsd;

  const fmt = (n) => {
    const v = Number(n) || 0;
    return v.toLocaleString(numberLocale);
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-4">
        <label className="grid gap-1">
          <span className="text-sm">{currentLabel}</span>
          <input
            name="current"
            type="text"
            inputMode="numeric"
            className="input"
            value={fmt(form.current)}
            onChange={handleMoneyChange}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{monthlyLabel}</span>
          <input
            name="monthly"
            type="text"
            inputMode="numeric"
            className="input"
            value={fmt(form.monthly)}
            onChange={handleMoneyChange}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{t.rate}</span>
          <input
            name="annualRate"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.annualRate}
            onChange={handleChange}
            min="-99"
            step="0.1"
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
            min="1"
            step="1"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <label className="grid gap-1">
          <span className="text-sm">{targetLabel}</span>
          <input
            name="target"
            type="text"
            inputMode="numeric"
            className="input"
            value={fmt(form.target)}
            onChange={handleMoneyChange}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">{t.compounding}</span>
          <select
            name="compounding"
            className="select"
            value={form.compounding}
            onChange={handleChange}
          >
            <option value="monthly">{t.compoundingMonthly}</option>
            <option value="yearly">{t.compoundingYearly}</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{t.taxRateLabel}</span>
          <input
            name="taxRatePercent"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.taxRatePercent}
            onChange={handleChange}
            min="0"
            step="0.1"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">{t.feeRateLabel}</span>
          <input
            name="feeRatePercent"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.feeRatePercent}
            onChange={handleChange}
            min="0"
            step="0.1"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3 justify-between items-center">
        <label className="grid gap-1">
          <span className="text-sm">{t.currency}</span>
          <select
            className="select"
            value={currency}
            onChange={(e) => {
              const next = e.target.value;
              if (onCurrencyChange) onCurrencyChange(next);
            }}
          >
            <option value="KRW">KRW 원</option>
            <option value="USD">USD $</option>
          </select>
        </label>

        <button
          type="button"
          className="btn-primary ml-auto"
          onClick={handleSubmit}
          disabled={disabled}
        >
          {t.calc}
        </button>
      </div>
    </div>
  );
}
