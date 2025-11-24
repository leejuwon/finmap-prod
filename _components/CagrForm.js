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
    tax: '세금(이자소득세 15.4%)',
    fee: '수수료(연 0.5% 가정)',
    taxApply: '세금 적용',
    taxNone: '세금 미적용',
    feeApply: '수수료 적용',
    feeNone: '수수료 없음',
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
    tax: 'Tax (15.4% interest tax)',
    fee: 'Fee (0.5% per year)',
    taxApply: 'Apply tax',
    taxNone: 'No tax',
    feeApply: 'Apply fee',
    feeNone: 'No fee',
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
            min="1"
            step="1"
          />
        </label>
      </div>

      {/* 2행: 세금/수수료/통화 */}
      <div className="grid gap-3 md:grid-cols-3">
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
