// _components/DcaForm.js
import { useState, useMemo, useEffect } from 'react';

const dict = {
  ko: {
    title: 'ETF·주식 자동 적립식 시뮬레이터',
    initialWon: '초기 투자금(만원)',
    initialUsd: '초기 투자금(USD)',
    monthlyWon: '월 적립금(만원)',
    monthlyUsd: '월 적립금(USD)',
    weeklyWon: '주 투자금(만원)',
    weeklyUsd: '주 투자금(USD)',
    targetAmount: '목표 금액',
    targetHint: '최종 세후 자산 기준입니다. 예: 100,000,000 또는 1억원',
    rate: '연 수익률(%)',
    years: '투자 기간(년)',
    startDate: '시작일(선택)',
    contributionFrequency: '투자 주기',
    frequencyMonthly: '매월',
    frequencyWeekly: '매주',
    annualIncrease: '연간 적립금 증가율(%)',
    currency: '통화',
    compounding: '복리 주기',
    compoundingMonthly: '월복리',
    compoundingYearly: '연복리',
    tax: '세금(이자소득세 %, 0이면 없음)',
    fee: '수수료(연 %, 0이면 없음)',
    calc: '시뮬레이션 실행',
    errorYears: '투자 기간은 0보다 커야 합니다.',
    errorInvestmentRequired: '초기 투자금, 정기 투자금, 목표 금액 중 하나는 0보다 커야 합니다.',
    errorAnnualRate: '연 수익률은 -99%보다 커야 합니다.',
    errorTaxRate: '세율은 0 이상 100 미만이어야 합니다.',
    errorFeeRate: '수수료율은 0 이상 100 이하이어야 합니다.',
    errorStartDate: '시작일 형식이 올바르지 않습니다.',
    errorTargetAmount: '목표 금액은 0 이상이어야 합니다.',
  },
  en: {
    title: 'ETF/Stock DCA Simulator',
    initialWon: 'Initial Investment (×10k KRW)',
    initialUsd: 'Initial Investment (USD)',
    monthlyWon: 'Monthly Contribution (×10k KRW)',
    monthlyUsd: 'Monthly Contribution (USD)',
    weeklyWon: 'Weekly Contribution (×10k KRW)',
    weeklyUsd: 'Weekly Contribution (USD)',
    targetAmount: 'Target amount',
    targetHint: 'Compared with the final after-tax value. Example: 100000',
    rate: 'Annual Return (%)',
    years: 'Years',
    startDate: 'Start date (optional)',
    contributionFrequency: 'Investment frequency',
    frequencyMonthly: 'Monthly',
    frequencyWeekly: 'Weekly',
    annualIncrease: 'Annual contribution increase (%)',
    currency: 'Currency',
    compounding: 'Compounding',
    compoundingMonthly: 'Monthly',
    compoundingYearly: 'Yearly',
    tax: 'Tax rate (%; 0 = none)',
    fee: 'Fee per year (%; 0 = none)',
    calc: 'Run simulation',
    errorYears: 'Years must be greater than 0.',
    errorInvestmentRequired: 'Initial investment, recurring contribution, or target amount must be greater than 0.',
    errorAnnualRate: 'Annual return must be greater than -99%.',
    errorTaxRate: 'Tax rate must be at least 0 and below 100.',
    errorFeeRate: 'Fee rate must be between 0 and 100.',
    errorStartDate: 'Start date format is invalid.',
    errorTargetAmount: 'Target amount must be at least 0.',
  },
};

const DEFAULT_FORM = {
  initial: 0,
  monthly: 50,
  annualRate: 7,
  years: 10,
  startDate: '',
  contributionFrequency: 'monthly',
  annualIncrease: 0,
  compounding: 'monthly',
  taxRate: 15.4,
  feeRate: 0.5,
  targetAmount: '',
};

function isValidDateString(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseTargetAmountInput(value) {
  const text = String(value || '').replace(/,/g, '').trim();
  if (!text) return '';

  const compact = text.replace(/\s+/g, '');
  if (compact.startsWith('-')) return 0;
  let total = 0;
  const eok = compact.match(/([0-9]+(?:\.[0-9]+)?)억/);
  const man = compact.match(/([0-9]+(?:\.[0-9]+)?)만/);

  if (eok) total += Number(eok[1]) * 100_000_000;
  if (man) total += Number(man[1]) * 10_000;
  if (total > 0) return Math.round(total);

  const numeric = compact.replace(/[^\d.]/g, '');
  if (!numeric) return '';
  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : '';
}

export default function DCAForm({
  onSubmit,
  locale = 'ko',
  currency = 'KRW',       // 부모에서 내려주는 통화
  onCurrencyChange,       // 부모에서 통화 변경 처리
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

  const handleTargetAmountChange = (e) => {
    const next = parseTargetAmountInput(e.target.value);
    setForm((prev) => ({ ...prev, targetAmount: next }));
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

  const validationErrors = useMemo(() => {
    const errors = [];
    const years = Number(form.years);
    const initial = Number(form.initial) || 0;
    const monthly = Number(form.monthly) || 0;
    const targetAmount = form.targetAmount === '' ? 0 : Number(form.targetAmount) || 0;
    const annualRate = Number(form.annualRate);
    const taxRate = Number(form.taxRate);
    const feeRate = Number(form.feeRate);

    if (!Number.isFinite(years) || years <= 0) errors.push(t.errorYears);
    if (initial <= 0 && monthly <= 0 && targetAmount <= 0) errors.push(t.errorInvestmentRequired);
    if (!Number.isFinite(annualRate) || annualRate <= -99) errors.push(t.errorAnnualRate);
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate >= 100) errors.push(t.errorTaxRate);
    if (!Number.isFinite(feeRate) || feeRate < 0 || feeRate > 100) errors.push(t.errorFeeRate);
    if (!Number.isFinite(targetAmount) || targetAmount < 0) errors.push(t.errorTargetAmount);
    if (!isValidDateString(form.startDate)) errors.push(t.errorStartDate);

    return errors;
  }, [form, t]);

  const disabled = validationErrors.length > 0;

  const handleSubmit = () => {
    if (disabled) return;

    onSubmit({
      ...form,
      currency, // 참고용으로 함께 전달
    });
  };

  const initialLabel =
    currency === 'KRW' ? t.initialWon : t.initialUsd;
  const isWeekly = form.contributionFrequency === 'weekly';
  const contributionLabel = isWeekly
    ? currency === 'KRW'
      ? t.weeklyWon
      : t.weeklyUsd
    : currency === 'KRW'
      ? t.monthlyWon
      : t.monthlyUsd;
  const startDateInputValue = isValidDateString(form.startDate) ? form.startDate : '';

  const fmt = (n) => {
    const v = Number(n) || 0;
    return v.toLocaleString(numberLocale);
  };

  const fmtOptional = (n) => {
    if (n === '' || n === null || n === undefined) return '';
    return fmt(n);
  };

  return (
    <div className="grid min-w-0 max-w-full grid-cols-1 gap-4">
      {/* 1행: 금액 입력 */}
      <div className="grid min-w-0 max-w-full grid-cols-1 gap-3 md:grid-cols-4">
        <label className="grid min-w-0 gap-1">
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
        <label className="grid min-w-0 gap-1">
          <span className="text-sm">{contributionLabel}</span>
          <input
            name="monthly"
            type="text"
            inputMode="numeric"
            className="input"
            value={fmt(form.monthly)}
            onChange={handleMoneyChange}
          />
        </label>
        <label className="grid min-w-0 gap-1">
          <span className="text-sm">{t.rate}</span>
          <input
            name="annualRate"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.annualRate}
            onChange={handleNumberChange}
            min="-98.99"
            step="0.1"
          />
        </label>
        <label className="grid min-w-0 gap-1">
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
      <div className="grid min-w-0 max-w-full grid-cols-1 gap-3 md:grid-cols-4">
        <label className="grid min-w-0 gap-1">
          <span className="text-sm">{t.contributionFrequency}</span>
          <select
            name="contributionFrequency"
            className="select"
            value={form.contributionFrequency}
            onChange={handleChange}
          >
            <option value="monthly">{t.frequencyMonthly}</option>
            <option value="weekly">{t.frequencyWeekly}</option>
          </select>
        </label>

        <label className="grid min-w-0 gap-1">
          <span className="text-sm">{t.startDate}</span>
          <input
            name="startDate"
            type="date"
            className="input"
            value={startDateInputValue}
            onChange={handleChange}
          />
        </label>

        <label className="grid min-w-0 gap-1">
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

        <label className="grid min-w-0 gap-1">
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

      </div>

      {/* 3행: 비용 가정 */}
      <div className="grid min-w-0 max-w-full grid-cols-1 gap-3 md:grid-cols-2">
        <label className="grid min-w-0 gap-1">
          <span className="text-sm">{t.tax}</span>
          <input
            name="taxRate"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.taxRate}
            onChange={handleNumberChange}
            min="0"
            max="99.99"
            step="0.1"
            placeholder="15.4"
          />
        </label>

        <label className="grid min-w-0 gap-1">
          <span className="text-sm">{t.fee}</span>
          <input
            name="feeRate"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.feeRate}
            onChange={handleNumberChange}
            min="0"
            max="100"
            step="0.1"
            placeholder="0.5"
          />
        </label>
      </div>

      <div className="grid min-w-0 max-w-full grid-cols-1 gap-3 md:grid-cols-2">
        <label className="grid min-w-0 gap-1">
          <span className="text-sm">{t.targetAmount}</span>
          <input
            name="targetAmount"
            type="text"
            inputMode="decimal"
            className="input"
            value={fmtOptional(form.targetAmount)}
            onChange={handleTargetAmountChange}
            placeholder={currency === 'KRW' ? '100,000,000 / 1억원' : '100000'}
          />
          <span className="break-words text-[11px] leading-relaxed text-slate-500">{t.targetHint}</span>
        </label>
      </div>

      {validationErrors.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          <ul className="list-disc pl-5 space-y-1">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4행: 통화 + 버튼 */}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <label className="grid min-w-0 w-full gap-1 sm:w-auto">
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
          className="btn-primary ml-auto w-full sm:w-auto"
          onClick={handleSubmit}
          disabled={disabled}
        >
          {t.calc}
        </button>
      </div>
    </div>
  );
}
