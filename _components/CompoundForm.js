// _components/CompoundForm.js
import { useState, useMemo } from 'react';

const dict = {
  ko: {
    title: '복리 계산기',
    principalWon: '초기 투자금(만원)',
    principalUsd: '초기 투자금(USD)',
    monthlyWon: '월 적립금(만원)',
    monthlyUsd: '월 적립금(USD)',
    rate: '연 수익률(%)',
    years: '투자 기간(년)',
    calc: '계산하기',
    currency: '통화',
    compounding: '복리 주기',
    // 🔥 레이블을 "입력형" 기준으로 약간 수정
    tax: '세금(이자/배당 세율, %)',
    fee: '수수료(연간 총 수수료, %)',
    compoundingMonthly: '월복리',
    compoundingYearly: '연복리',
    // 아래는 UI에서 직접 쓰진 않지만 남겨둠 (다른 곳에서 쓸 수도 있으니)
    taxApply: '세금 적용',
    taxNone: '세금 미적용',
    feeApply: '수수료 적용',
    feeNone: '수수료 없음',
  },
  en: {
    title: 'Compound Interest Calculator',
    principalWon: 'Initial Principal (×10k KRW)',
    principalUsd: 'Initial Principal (USD)',
    monthlyWon: 'Monthly Contribution (×10k KRW)',
    monthlyUsd: 'Monthly Contribution (USD)',
    rate: 'Annual Rate (%)',
    years: 'Years',
    calc: 'Calculate',
    currency: 'Currency',
    compounding: 'Compounding',
    tax: 'Tax rate on interest/dividends (%)',
    fee: 'Yearly total fee (%)',
    compoundingMonthly: 'Monthly',
    compoundingYearly: 'Yearly',
    taxApply: 'Apply tax',
    taxNone: 'No tax',
    feeApply: 'Apply fee',
    feeNone: 'No fee',
  },
};

export default function CompoundForm({
  onSubmit,
  locale = 'ko',
  currency = 'KRW',          // 🔥 부모에서 내려주는 현재 통화
  onCurrencyChange,          // 🔥 부모에게 변경을 알려줄 콜백
}) {
  const safeLocale = locale === 'en' ? 'en' : 'ko';

  const [form, setForm] = useState({
    principal: 1000,
    monthly: 30,
    annualRate: 7,
    years: 10,
    compounding: 'monthly',
    // 🔥 세율·수수료율 직접 입력 (기본값: 한국 기준)
    taxRate: 15.4,   // (%)
    feeRate: 0.5,    // (%)
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

  const handleCurrencyChange = (e) => {
    const val = e.target.value;
    if (onCurrencyChange) {
      onCurrencyChange(val);
    }
  };

  const disabled = useMemo(() => form.years <= 0, [form.years]);

  const handleSubmit = () => {
    const taxRatePercent = Number(form.taxRate) || 0;
    const feeRatePercent = Number(form.feeRate) || 0;

    onSubmit({
      ...form,
      currency,
      // 🔥 lib/compound.js 에서 사용할 필드명
      taxRatePercent,
      feeRatePercent,
    });
  };

  const principalLabel =
    currency === 'KRW' ? t.principalWon : t.principalUsd;
  const monthlyLabel =
    currency === 'KRW' ? t.monthlyWon : t.monthlyUsd;

  const fmt = (n) => {
    const v = Number(n) || 0;
    return v.toLocaleString(numberLocale);
  };

  return (
    <div className="w-full grid gap-4">
      {/* 1행: 금액 입력 4개 */}
      <div className="grid gap-3 md:grid-cols-4">
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
            inputMode="decimal"
            className="input"
            value={form.annualRate}
            onChange={handleChange}
            min="0"
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

      {/* 2행: 복리/세금/수수료/통화 */}
      <div className="grid gap-3 md:grid-cols-4">
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

        {/* 🔥 세율 입력 (%, 0 이면 실질적으로 "세금 미적용") */}
        <label className="grid gap-1">
          <span className="text-sm">{t.tax}</span>
          <input
            name="taxRate"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.taxRate}
            onChange={handleChange}
            min="0"
            step="0.1"
            placeholder="예: 15.4"
          />
        </label>

        {/* 🔥 수수료율 입력 (%, 0 이면 수수료 없음) */}
        <label className="grid gap-1">
          <span className="text-sm">{t.fee}</span>
          <input
            name="feeRate"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.feeRate}
            onChange={handleChange}
            min="0"
            step="0.1"
            placeholder="예: 0.5"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">{t.currency}</span>
          <select
            className="select"
            value={currency}
            onChange={handleCurrencyChange}
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
