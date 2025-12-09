// _components/CompoundForm.js
import { useState, useMemo } from 'react';

const dict = {
  ko: {
    title: '복리 계산기',
    secBasic: '기본 입력',
    secCost: '세금 · 수수료 옵션',
    secAdvanced: '고급 옵션',
    principalWon: '초기 투자금(만원)',
    principalUsd: '초기 투자금(USD)',
    monthlyWon: '월 적립금(만원)',
    monthlyUsd: '월 적립금(USD)',
    rate: '연 수익률(%)',
    years: '투자 기간(년)',
    calc: '계산하기',
    currency: '통화',
    compounding: '복리 주기',
    tax: '세율(%, 이자/배당)',
    fee: '연 수수료율(%)',
    compoundingMonthly: '월복리',
    compoundingYearly: '연복리',
  },
  en: {
    title: 'Compound Interest Calculator',
    secBasic: 'Basic Inputs',
    secCost: 'Tax & Fee Options',
    secAdvanced: 'Advanced',
    principalWon: 'Initial Principal (×10k KRW)',
    principalUsd: 'Initial Principal (USD)',
    monthlyWon: 'Monthly Contribution (×10k KRW)',
    monthlyUsd: 'Monthly Contribution (USD)',
    rate: 'Annual Rate (%)',
    years: 'Years',
    calc: 'Calculate',
    currency: 'Currency',
    compounding: 'Compounding',
    tax: 'Tax rate (%)',
    fee: 'Yearly fee (%)',
    compoundingMonthly: 'Monthly',
    compoundingYearly: 'Yearly',
  },
};

export default function CompoundForm({
  onSubmit,
  locale = 'ko',
  currency = 'KRW',
  onCurrencyChange,
}) {
  const safeLocale = locale === 'en' ? 'en' : 'ko';
  const t = useMemo(() => dict[safeLocale], [safeLocale]);

  const numberLocale = safeLocale === 'ko' ? 'ko-KR' : 'en-US';

  const [showBasic, setShowBasic] = useState(true);
  const [showCost, setShowCost] = useState(true);
  const [showAdv, setShowAdv] = useState(false);

  const [form, setForm] = useState({
    principal: 1000,
    monthly: 30,
    annualRate: 7,
    years: 10,
    compounding: 'monthly',
    taxRatePercent: 15.4,
    feeRatePercent: 0.5,
  });

  const fmt = (v) => {
    const n = Number(v) || 0;
    return n.toLocaleString(numberLocale);
  };

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

  const disabled = form.years <= 0;

  const handleSubmit = () => {
    onSubmit({
      ...form,
      currency,
      taxRatePercent: Number(form.taxRatePercent),
      feeRatePercent: Number(form.feeRatePercent),
    });
  };

  const principalLabel =
    currency === 'KRW' ? t.principalWon : t.principalUsd;

  const monthlyLabel =
    currency === 'KRW' ? t.monthlyWon : t.monthlyUsd;

  return (
    <div className="w-full space-y-4">

      {/* ==============================
          섹션 1 — 기본 입력
      =============================== */}
      <div className="border rounded-xl p-4 bg-slate-50">
        <button
          type="button"
          className="w-full text-left font-semibold mb-2"
          onClick={() => setShowBasic((v) => !v)}
        >
          {t.secBasic}
        </button>

        {showBasic && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm">{principalLabel}</span>
              <input
                name="principal"
                type="text"
                inputMode="numeric"
                className="input"
                value={fmt(form.principal)}
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
                step="0.1"
                className="input"
                value={form.annualRate}
                onChange={handleChange}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">{t.years}</span>
              <input
                name="years"
                type="number"
                min="1"
                step="1"
                className="input"
                value={form.years}
                onChange={handleChange}
              />
            </label>
          </div>
        )}
      </div>

      {/* ==============================
          섹션 2 — 세금 · 수수료 옵션
      =============================== */}
      <div className="border rounded-xl p-4 bg-slate-50">
        <button
          type="button"
          className="w-full text-left font-semibold mb-2"
          onClick={() => setShowCost((v) => !v)}
        >
          {t.secCost}
        </button>

        {showCost && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm">{t.tax}</span>
              <input
                name="taxRatePercent"
                type="number"
                step="0.1"
                min="0"
                className="input"
                value={form.taxRatePercent}
                onChange={handleChange}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">{t.fee}</span>
              <input
                name="feeRatePercent"
                type="number"
                step="0.1"
                min="0"
                className="input"
                value={form.feeRatePercent}
                onChange={handleChange}
              />
            </label>
          </div>
        )}
      </div>

      {/* ==============================
          섹션 3 — 고급 옵션
      =============================== */}
      <div className="border rounded-xl p-4 bg-slate-50">
        <button
          type="button"
          className="w-full text-left font-semibold mb-2"
          onClick={() => setShowAdv((v) => !v)}
        >
          {t.secAdvanced}
        </button>

        {showAdv && (
          <div className="grid gap-4 md:grid-cols-2">
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
              <span className="text-sm">{t.currency}</span>
              <select
                className="select"
                value={currency}
                onChange={(e) => onCurrencyChange?.(e.target.value)}
              >
                <option value="KRW">KRW ₩</option>
                <option value="USD">USD $</option>
              </select>
            </label>
          </div>
        )}
      </div>

      {/* ==============================
          계산 버튼 (항상 맨 아래)
      =============================== */}
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-primary"
          disabled={disabled}
          onClick={handleSubmit}
        >
          {t.calc}
        </button>
      </div>
    </div>
  );
}
