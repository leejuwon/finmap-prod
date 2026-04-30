// _components/CompoundForm.js
import { useState, useMemo, useEffect } from 'react';

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

const DEFAULT_FORM = {
  principal: 1000,
  monthly: 30,
  annualRate: 7,
  years: 10,
  compounding: 'monthly',
  taxRatePercent: 15.4,
  feeRatePercent: 0.5,
};

export default function CompoundForm({
  onSubmit,
  locale = 'ko',
  currency = 'KRW',
  onCurrencyChange,
  initialValues,
}) {
  const safeLocale = locale === 'en' ? 'en' : 'ko';
  const t = useMemo(() => dict[safeLocale], [safeLocale]);

  const numberLocale = safeLocale === 'ko' ? 'ko-KR' : 'en-US';

  const [showBasic, setShowBasic] = useState(true);
  const [showCost, setShowCost] = useState(true);
  const [showAdv, setShowAdv] = useState(false);

  const [form, setForm] = useState(() => ({ ...DEFAULT_FORM, ...(initialValues || {}) }));

  useEffect(() => {
    if (!initialValues) return;
    setForm((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

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

  const validation = useMemo(() => {
    const errors = {};
    const warnings = {};

    const principal = Number(form.principal) || 0;
    const monthly = Number(form.monthly) || 0;
    const annualRate = Number(form.annualRate) || 0;
    const years = Number(form.years) || 0;
    const tax = Number(form.taxRatePercent) || 0;
    const fee = Number(form.feeRatePercent) || 0;

    if (principal <= 0 && monthly <= 0) {
      errors.funding =
        safeLocale === 'ko'
          ? '원금 또는 월 적립금 중 하나는 0보다 커야 합니다.'
          : 'Enter either principal or monthly contribution.';
    }

    if (years <= 0) {
      errors.years =
        safeLocale === 'ko'
          ? '투자 기간은 0보다 커야 합니다.'
          : 'Years must be greater than 0.';
    } else if (years > 60) {
      warnings.years =
        safeLocale === 'ko'
          ? '기간이 매우 깁니다. 장기 가정은 세금·수수료 변화에 민감할 수 있습니다.'
          : 'This is a very long horizon. Long-term assumptions can be sensitive to tax and fee changes.';
    }

    if (tax < 0) {
      errors.taxRatePercent =
        safeLocale === 'ko'
          ? '세율은 0 이상이어야 합니다.'
          : 'Tax rate must be 0 or higher.';
    }

    if (fee < 0) {
      errors.feeRatePercent =
        safeLocale === 'ko'
          ? '수수료율은 0 이상이어야 합니다.'
          : 'Fee rate must be 0 or higher.';
    }

    if (annualRate > 30) {
      warnings.annualRate =
        safeLocale === 'ko'
          ? '장기 연 수익률 가정이 높습니다. 보수적으로도 함께 비교해 보세요.'
          : 'This is a high long-term return assumption. Compare with a conservative scenario.';
    }

    return { errors, warnings };
  }, [form, safeLocale]);

  const disabled = Object.keys(validation.errors).length > 0;
  const disabledReason = Object.values(validation.errors)[0] || '';

  const handleSubmit = () => {
    if (disabled) return;
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
                aria-invalid={!!validation.errors.funding}
                aria-describedby={validation.errors.funding ? 'compound-funding-error' : undefined}
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
                aria-invalid={!!validation.errors.funding}
                aria-describedby={validation.errors.funding ? 'compound-funding-error' : undefined}
              />
            </label>

            {validation.errors.funding && (
              <p
                id="compound-funding-error"
                role="alert"
                className="text-xs text-red-600 md:col-span-2"
              >
                {validation.errors.funding}
              </p>
            )}

            <label className="grid gap-1">
              <span className="text-sm">{t.rate}</span>
              <input
                name="annualRate"
                type="number"
                step="0.1"
                className="input"
                value={form.annualRate}
                onChange={handleChange}
                aria-invalid={false}
                aria-describedby={validation.warnings.annualRate ? 'compound-rate-warning' : undefined}
              />
              {validation.warnings.annualRate && (
                <p id="compound-rate-warning" className="text-xs text-amber-700" aria-live="polite">
                  {validation.warnings.annualRate}
                </p>
              )}
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
                aria-invalid={!!validation.errors.years}
                aria-describedby={
                  validation.errors.years
                    ? 'compound-years-error'
                    : validation.warnings.years
                      ? 'compound-years-warning'
                      : undefined
                }
              />
              {validation.errors.years && (
                <p id="compound-years-error" role="alert" className="text-xs text-red-600">
                  {validation.errors.years}
                </p>
              )}
              {!validation.errors.years && validation.warnings.years && (
                <p id="compound-years-warning" className="text-xs text-amber-700" aria-live="polite">
                  {validation.warnings.years}
                </p>
              )}
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
                aria-invalid={!!validation.errors.taxRatePercent}
                aria-describedby={validation.errors.taxRatePercent ? 'compound-tax-error' : undefined}
              />
              {validation.errors.taxRatePercent && (
                <p id="compound-tax-error" role="alert" className="text-xs text-red-600">
                  {validation.errors.taxRatePercent}
                </p>
              )}
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
                aria-invalid={!!validation.errors.feeRatePercent}
                aria-describedby={validation.errors.feeRatePercent ? 'compound-fee-error' : undefined}
              />
              {validation.errors.feeRatePercent && (
                <p id="compound-fee-error" role="alert" className="text-xs text-red-600">
                  {validation.errors.feeRatePercent}
                </p>
              )}
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
      <div className="grid gap-2 justify-items-end">
        {disabledReason && (
          <p className="text-xs text-red-600" role="alert">
            {disabledReason}
          </p>
        )}
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
