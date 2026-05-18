// _components/CagrForm.js
import { useState, useMemo, useEffect } from 'react';

const dict = {
  ko: {
    title: '투자 수익률(CAGR) 계산기',
    initialWon: '초기 자산(만원)',
    initialUsd: '초기 자산(USD)',
    finalWon: '최종 자산(만원)',
    finalUsd: '최종 자산(USD)',
    startDate: '시작일(선택)',
    endDate: '종료일(선택)',
    years: '투자 기간(년)',
    calc: '수익률 계산하기',
    currency: '통화',
    tax: '세금(이자소득세 %, 0이면 없음)',
    fee: '수수료(연 %, 0이면 없음)',
    amountHelp: '쉼표가 있어도 자동으로 숫자만 인식합니다.',
    dateHelp: '시작일과 종료일을 넣으면 기간(년)이 자동 계산됩니다.',
    yearHelp: '예: 2년 6개월은 2.5년으로 입력할 수 있습니다.',
    initialRequired: '초기 자산은 0보다 커야 합니다.',
    finalRequired: '최종 자산은 0보다 커야 합니다.',
    yearsRequired: '투자 기간은 0보다 커야 합니다.',
    dateRangeInvalid: '종료일은 시작일보다 뒤여야 합니다.',
    rateInvalid: '세율은 0 이상 100 미만, 수수료율은 0~100 사이로 입력하세요.',
  },
  en: {
    title: 'CAGR (Investment Return) Calculator',
    initialWon: 'Initial Value (×10k KRW)',
    initialUsd: 'Initial Value (USD)',
    finalWon: 'Final Value (×10k KRW)',
    finalUsd: 'Final Value (USD)',
    startDate: 'Start date (optional)',
    endDate: 'End date (optional)',
    years: 'Years',
    calc: 'Calculate CAGR',
    currency: 'Currency',
    tax: 'Tax rate (%; 0 = none)',
    fee: 'Fee per year (%; 0 = none)',
    amountHelp: 'Commas are okay; the field is normalized as a number.',
    dateHelp: 'Enter start and end dates to auto-fill the year fraction.',
    yearHelp: 'Example: 2 years and 6 months can be entered as 2.5 years.',
    initialRequired: 'Initial value must be greater than 0.',
    finalRequired: 'Final value must be greater than 0.',
    yearsRequired: 'Years must be greater than 0.',
    dateRangeInvalid: 'End date must be later than start date.',
    rateInvalid: 'Tax must be 0 to under 100; fee must be between 0 and 100.',
  },
};

const DEFAULT_FORM = {
  initial: 1000,
  final: 2000,
  years: 10,
  taxRate: 15.4,
  feeRate: 0.5,
  startDate: '',
  endDate: '',
};

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.2425;

function parseMoneyValue(value) {
  const cleaned = String(value)
    .replace(/,/g, '')
    .replace(/[^\d.]/g, '');
  const [integerPart, ...decimalParts] = cleaned.split('.');
  const normalized =
    decimalParts.length > 0
      ? `${integerPart}.${decimalParts.join('')}`
      : integerPart;

  if (!normalized || normalized === '.') return 0;
  const next = Number(normalized);
  return Number.isFinite(next) ? next : 0;
}

function parseDateValue(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getYearsFromDates(startDate, endDate) {
  const start = parseDateValue(startDate);
  const end = parseDateValue(endDate);
  if (!start || !end || end <= start) return null;

  const years = (end.getTime() - start.getTime()) / MS_PER_YEAR;
  return Math.max(0.1, Math.round(years * 100) / 100);
}

function normalizeInitialValues(values) {
  if (!values) return values;

  const computedYears = getYearsFromDates(values.startDate, values.endDate);
  return computedYears ? { ...values, years: computedYears } : values;
}

export default function CagrForm({
  onSubmit,
  locale = 'ko',
  currency = 'KRW',     // 부모 상태
  onCurrencyChange,     // 부모에게 통화 변경 알림
  initialValues,
}) {
  const safeLocale = String(locale).startsWith('en') ? 'en' : 'ko';

  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    ...(normalizeInitialValues(initialValues) || {}),
  }));

  useEffect(() => {
    if (!initialValues) return;
    setForm((prev) => ({ ...prev, ...normalizeInitialValues(initialValues) }));
  }, [initialValues]);

  const t = useMemo(() => dict[safeLocale] || dict.ko, [safeLocale]);
  const numberLocale = safeLocale === 'ko' ? 'ko-KR' : 'en-US';

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseMoneyValue(value) }));
  };

  const handleYearsChange = (e) => {
    const { name, value } = e.target;
    const next = value === '' ? '' : Number(value);
    if (next !== '' && !Number.isFinite(next)) return;
    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const num = value === '' ? '' : Number(value);
    if (num !== '' && !Number.isFinite(num)) return;
    setForm((prev) => ({ ...prev, [name]: num }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      const computedYears = getYearsFromDates(next.startDate, next.endDate);
      return computedYears ? { ...next, years: computedYears } : next;
    });
  };

  const errors = useMemo(() => {
    const next = [];
    const initialValue = Number(form.initial);
    const finalValue = Number(form.final);
    const yearValue = Number(form.years);
    const taxValue = Number(form.taxRate);
    const feeValue = Number(form.feeRate);

    if (!Number.isFinite(initialValue) || initialValue <= 0) next.push(t.initialRequired);
    if (!Number.isFinite(finalValue) || finalValue <= 0) next.push(t.finalRequired);
    if (!Number.isFinite(yearValue) || yearValue <= 0) next.push(t.yearsRequired);
    if (
      !Number.isFinite(taxValue) ||
      !Number.isFinite(feeValue) ||
      taxValue < 0 ||
      taxValue >= 100 ||
      feeValue < 0 ||
      feeValue > 100
    ) {
      next.push(t.rateInvalid);
    }
    if (
      form.startDate &&
      form.endDate &&
      !getYearsFromDates(form.startDate, form.endDate)
    ) {
      next.push(t.dateRangeInvalid);
    }

    return next;
  }, [form, t]);

  const disabled = useMemo(
    () => errors.length > 0,
    [errors]
  );

  const handleSubmit = () => {
    if (disabled) return;
    onSubmit({
      ...form,
      initial: Number(form.initial) || 0,
      final: Number(form.final) || 0,
      years: Number(form.years) || 0,
      taxRate: Number(form.taxRate) || 0,
      feeRate: Number(form.feeRate) || 0,
      currency,
    });
  };

  const initialLabel =
    currency === 'KRW' ? t.initialWon : t.initialUsd;
  const finalLabel =
    currency === 'KRW' ? t.finalWon : t.finalUsd;

  const fmt = (n) => {
    if (n === '') return '';
    const v = Number(n);
    if (!Number.isFinite(v)) return '';
    return v.toLocaleString(numberLocale, { maximumFractionDigits: 2 });
  };

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-base font-semibold">{t.title}</h2>
        <p className="text-xs text-slate-500 mt-1">{t.amountHelp}</p>
      </div>

      {/* 1행: 금액 입력 */}
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm">{initialLabel}</span>
          <input
            name="initial"
            type="text"
            inputMode="decimal"
            className="input"
            value={fmt(form.initial)}
            onChange={handleMoneyChange}
            aria-describedby="cagr-amount-help"
            autoComplete="off"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{finalLabel}</span>
          <input
            name="final"
            type="text"
            inputMode="decimal"
            className="input"
            value={fmt(form.final)}
            onChange={handleMoneyChange}
            aria-describedby="cagr-amount-help"
            autoComplete="off"
          />
        </label>
      </div>

      <p id="cagr-amount-help" className="sr-only">
        {t.amountHelp}
      </p>

      {/* 2행: 날짜/기간 */}
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-sm">{t.startDate}</span>
          <input
            name="startDate"
            type="date"
            className="input"
            value={form.startDate}
            onChange={handleDateChange}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{t.endDate}</span>
          <input
            name="endDate"
            type="date"
            className="input"
            value={form.endDate}
            onChange={handleDateChange}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{t.years}</span>
          <input
            name="years"
            type="number"
            inputMode="decimal"
            className="input"
            value={form.years}
            onChange={handleYearsChange}
            min="0.1"
            step="0.1"
            aria-describedby="cagr-years-help"
          />
        </label>
      </div>
      <div className="grid gap-1 text-xs text-slate-500">
        <p>{t.dateHelp}</p>
        <p id="cagr-years-help">{t.yearHelp}</p>
      </div>

      {/* 3행: 세금/수수료/통화 */}
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
            max="99.9"
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
            max="100"
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

      {errors.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="alert">
          <ul className="list-disc pl-4 space-y-1">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

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
