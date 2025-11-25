// _components/GoalForm.js
import { useState, useMemo } from 'react';

const dict = {
  ko: {
    title: '목표 자산 시뮬레이터',
    currentWon: '현재 자산(만원)',
    currentUsd: '현재 자산(USD)',
    monthlyWon: '월 적립금(만원)',
    monthlyUsd: '월 적립금(USD)',
    rate: '연 수익률(%)',
    years: '투자 기간(년)',
    targetWon: '목표 자산(만원)',
    targetUsd: '목표 자산(USD)',
    calc: '시뮬레이션 실행',
    currency: '통화',
    compounding: '복리 주기',
    compoundingMonthly: '월복리',
    compoundingYearly: '연복리',    
    // 🔥 추가 라벨
    taxRateLabel: '세율(이자소득세, %)',
    feeRateLabel: '연 수수료율(연 %, 보수/수수료)',
  },
  en: {
    title: 'Goal Asset Simulator',
    currentWon: 'Current Assets (×10k KRW)',
    currentUsd: 'Current Assets (USD)',
    monthlyWon: 'Monthly Contribution (×10k KRW)',
    monthlyUsd: 'Monthly Contribution (USD)',
    rate: 'Annual Return (%)',
    years: 'Years',
    targetWon: 'Target Assets (×10k KRW)',
    targetUsd: 'Target Assets (USD)',
    calc: 'Run Simulation',
    currency: 'Currency',
    compounding: 'Compounding',
    compoundingMonthly: 'Monthly',
    compoundingYearly: 'Yearly',    
    // 🔥 추가 라벨
    taxRateLabel: 'Tax rate on interest (%)',
    feeRateLabel: 'Annual fee rate (%)',
  },
};

export default function GoalForm({
  onSubmit,
  locale = 'ko',
  currency = 'KRW',           // 부모(페이지)에서 내려주는 통화
  onCurrencyChange,           // 부모에서 통화 변경 처리
}) {
  // locale 안전 정규화 (ko / en만 사용)
  const safeLocale = String(locale).startsWith('en') ? 'en' : 'ko';

  const [form, setForm] = useState({
    current: 2000,   // 만원 또는 USD
    monthly: 50,     // 만원 또는 USD
    annualRate: 7,
    years: 15,
    target: 10000,   // 만원 또는 USD
    compounding: 'monthly',
    // 🔥 세율/수수료율 기본값
    taxRatePercent: 15.4,
    feeRatePercent: 0.5,
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

  const disabled = useMemo(() => form.years <= 0, [form.years]);

  const handleSubmit = () => {
    onSubmit({
      ...form,
      currency, // 참고용으로 함께 전달 (실제 스케일링은 부모에서 currency 사용)
    });
  };

  const currentLabel =
    currency === 'KRW' ? t.currentWon : t.currentUsd;
  const monthlyLabel =
    currency === 'KRW' ? t.monthlyWon : t.monthlyUsd;
  const targetLabel =
    currency === 'KRW' ? t.targetWon : t.targetUsd;

  const fmt = (n) => {
    const v = Number(n) || 0;
    return v.toLocaleString(numberLocale);
  };

  return (
    <div className="grid gap-4">
      {/* 1행: 금액 관련 입력 */}
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

      {/* 2행: 목표 금액 + 복리/세금/수수료 모드 */}
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
          <span className="text-sm">
            {t.taxRateLabel}            
          </span>
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
          <span className="text-sm">
            {t.feeRateLabel}            
          </span>
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
