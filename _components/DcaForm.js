// _components/DCAForm.js
import { useState, useMemo } from 'react';

const dict = {
  ko: {
    title: 'ETF·주식 자동 적립식 시뮬레이터',
    initialWon: '초기 투자금(만원)',
    initialUsd: '초기 투자금(USD)',
    monthlyWon: '월 적립금(만원)',
    monthlyUsd: '월 적립금(USD)',
    rate: '연 수익률(%)',
    years: '투자 기간(년)',
    annualIncrease: '연간 적립금 증가율(%)',
    currency: '통화',
    compounding: '복리 주기',
    compoundingMonthly: '월복리',
    compoundingYearly: '연복리',
    tax: '세금(이자소득세 %, 0이면 없음)',
    fee: '수수료(연 %, 0이면 없음)',
    calc: '시뮬레이션 실행',
  },
  en: {
    title: 'ETF/Stock DCA Simulator',
    initialWon: 'Initial Investment (×10k KRW)',
    initialUsd: 'Initial Investment (USD)',
    monthlyWon: 'Monthly Contribution (×10k KRW)',
    monthlyUsd: 'Monthly Contribution (USD)',
    rate: 'Annual Return (%)',
    years: 'Years',
    annualIncrease: 'Annual increase of monthly (%)',
    currency: 'Currency',
    compounding: 'Compounding',
    compoundingMonthly: 'Monthly',
    compoundingYearly: 'Yearly',
    tax: 'Tax rate (%; 0 = none)',
    fee: 'Fee per year (%; 0 = none)',
    calc: 'Run simulation',
  },
};

export default function DCAForm({
  onSubmit,
  locale = 'ko',
  currency = 'KRW',       // 부모에서 내려주는 통화
  onCurrencyChange,       // 부모에서 통화 변경 처리
}) {
  const safeLocale = String(locale).startsWith('en') ? 'en' : 'ko';

  const [form, setForm] = useState({
    initial: 0,        // 만원 또는 USD
    monthly: 50,       // 만원 또는 USD
    annualRate: 7,
    years: 10,
    annualIncrease: 0, // %
    compounding: 'monthly',
    taxRate: 15.4,     // 세율(%)
    feeRate: 0.5,      // 수수료율(연 %)
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

  const disabled = form.years <= 0;

  const handleSubmit = () => {
    onSubmit({
      ...form,
      currency, // 참고용으로 함께 전달
    });
  };

  const initialLabel =
    currency === 'KRW' ? t.initialWon : t.initialUsd;
  const monthlyLabel =
    currency === 'KRW' ? t.monthlyWon : t.monthlyUsd;

  const fmt = (n) => {
    const v = Number(n) || 0;
    return v.toLocaleString(numberLocale);
  };

  return (
    <div className="grid gap-4">
      {/* 1행: 금액 입력 */}
      <div className="grid gap-3 md:grid-cols-4">
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
            onChange={handleNumberChange}
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
            onChange={handleNumberChange}
            min="1"
            step="1"
          />
        </label>
      </div>

      {/* 2행: 연간 증가율 + 복리/세금/수수료 */}
      <div className="grid gap-3 md:grid-cols-4">
        <label className="grid gap-1">
          <span className="text-sm">{t.annualIncrease}</span>
          <input
            name="annualIncrease"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.annualIncrease}
            onChange={handleNumberChange}
            step="0.5"
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
      </div>

      {/* 3행: 통화 + 버튼 */}
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
            <option value="KRW">KRW ₩</option>
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
