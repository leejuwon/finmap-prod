// _components/CompoundForm.js
import { useState, useMemo } from 'react';

const ko = {
  principal: '초기 투자금(원)',
  monthly: '월 적립금(원)',
  rate: '연 수익률(%)',
  years: '투자 기간(년)',
  calc: '계산하기',
  currency: '통화',
  compounding: '복리 주기',
  compoundingMonthly: '월복리',
  compoundingYearly: '연복리',
  tax: '세금(이자소득세 15.4%)',
  taxOn: '세금 적용',
  taxOff: '세금 미적용',
  fee: '수수료(매입·환매 각 0.25%)',
  feeOn: '수수료 적용',
  feeOff: '수수료 없음',
};
const en = {
  principal: 'Initial principal',
  monthly: 'Monthly contribution',
  rate: 'Annual rate (%)',
  years: 'Years',
  calc: 'Calculate',
  currency: 'Currency',
  compounding: 'Compounding',
  compoundingMonthly: 'Monthly',
  compoundingYearly: 'Yearly',
  tax: 'Tax (15.4% interest tax)',
  taxOn: 'Apply tax',
  taxOff: 'No tax',
  fee: 'Fees (0.25% buy/sell)',
  feeOn: 'Apply fee',
  feeOff: 'No fee',
};

export default function CompoundForm({ onSubmit, locale = 'ko' }) {
  const t = locale === 'ko' ? ko : en;

  const [form, setForm] = useState({
    principal: 10000000,
    monthly: 300000,
    annualRate: 7,
    years: 10,
    compounding: 'monthly',
    taxMode: 'on',
    feeMode: 'on',
    currency: locale === 'ko' ? 'KRW' : 'USD',
  });

  const disabled = useMemo(() => form.years <= 0, [form.years]);

  const onChangeNumber = (e) => {
    const { name, value } = e.target;
    const num = Number(String(value).replace(/[^0-9.]/g, ''));
    setForm((prev) => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit({ ...form });
  };

  return (
    <div className="grid gap-4">
      {/* 1줄: 숫자 입력 4개 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className="grid gap-1">
          <span className="text-sm">{t.principal}</span>
          <input
            name="principal"
            type="number"
            inputMode="numeric"
            className="input"
            value={form.principal}
            onChange={onChangeNumber}
            min="0"
            step="10000"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{t.monthly}</span>
          <input
            name="monthly"
            type="number"
            inputMode="numeric"
            className="input"
            value={form.monthly}
            onChange={onChangeNumber}
            min="0"
            step="10000"
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
            onChange={onChangeNumber}
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
            onChange={onChangeNumber}
            min="1"
            step="1"
          />
        </label>
      </div>

      {/* 2줄: 옵션 + 통화 + 버튼 (모바일에서는 2열, 데스크탑에서는 5열) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
        <label className="grid gap-1">
          <span className="text-sm">{t.compounding}</span>
          <select
            name="compounding"
            className="select"
            value={form.compounding}
            onChange={onChange}
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
            onChange={onChange}
          >
            <option value="on">{t.taxOn}</option>
            <option value="off">{t.taxOff}</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm">{t.fee}</span>
          <select
            name="feeMode"
            className="select"
            value={form.feeMode}
            onChange={onChange}
          >
            <option value="on">{t.feeOn}</option>
            <option value="off">{t.feeOff}</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm">{t.currency}</span>
          <select
            name="currency"
            className="select"
            value={form.currency}
            onChange={onChange}
          >
            <option value="KRW">KRW ₩</option>
            <option value="USD">USD $</option>
          </select>
        </label>

        <div className="flex justify-end md:justify-start">
          <button
            type="button"
            className="btn-primary w-full md:w-auto"
            onClick={handleSubmit}
            disabled={disabled}
          >
            {t.calc}
          </button>
        </div>
      </div>
    </div>
  );
}
