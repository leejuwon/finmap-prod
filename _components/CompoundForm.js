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
    tax: '세금(이자소득세 15.4%)',
    fee: '수수료(매입·환매 각 0.25%)',
    compoundingMonthly: '월복리',
    compoundingYearly: '연복리',
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
    tax: 'Tax (15.4% interest tax)',
    fee: 'Fee (0.25% buy/sell)',
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
    taxMode: 'apply',
    feeMode: 'apply',
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
    // 통화는 부모가 들고 있으므로 여기서는 form + currency를 넘겨줘도 되고,
    // 부모 쪽에서 currency를 무시하고 자기 state를 사용하는 구조라 안전함.
    onSubmit({
      ...form,
      currency,
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

        <label className="grid gap-1">
          <span className="text-sm">{t.tax}</span>
          <select
            name="taxMode"
            className="select"
            value={form.taxMode}
            onChange={handleChange}
          >
            <option value="apply">{t.taxApply}</option>
            <option value="none">{t.taxNone}</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm">{t.fee}</span>
          <select
            name="feeMode"
            className="select"
            value={form.feeMode}
            onChange={handleChange}
          >
            <option value="apply">{t.feeApply}</option>
            <option value="none">{t.feeNone}</option>
          </select>
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
