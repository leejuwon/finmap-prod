// _components/FireForm.js
import { useState, useEffect } from 'react';

export default function FireForm({ onSubmit, initial, lang = 'ko' }) {
  const isKo = lang === 'ko';

  // initial(원 단위)을 화면 표시용(만원 단위)으로 변환
  const toDisplay = (src) => {
    const scale = isKo ? 10_000 : 1;
    return {
      currentAsset: (src?.currentAsset || 0) / scale,
      annualSpending: (src?.annualSpending || 0) / scale,
      monthlyContribution: (src?.monthlyContribution || 0) / scale,
      annualContribution: (src?.annualContribution || 0) / scale,
      annualReturnPct: src?.annualReturnPct ?? 5,
      accumulationYears: src?.accumulationYears ?? 15,
      withdrawRatePct: src?.withdrawRatePct ?? 4,
      taxRatePct: src?.taxRatePct ?? 15.4,
      feeRatePct: src?.feeRatePct ?? 0.5,
      inflationPct: src?.inflationPct ?? 2.0,
    };
  };

  const [form, setForm] = useState(toDisplay(initial));

  // 언어나 초기값 바뀌면 표시값 다시 맞춰주기
  useEffect(() => {
    setForm(toDisplay(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleChange = (key) => (e) => {
    const raw = e.target.value.replace(/,/g, '');
    setForm((prev) => ({
      ...prev,
      [key]: raw === '' ? '' : Number(raw),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const scale = isKo ? 10_000 : 1;

    const payload = {
      currentAsset: (Number(form.currentAsset) || 0) * scale,
      annualSpending: (Number(form.annualSpending) || 0) * scale,
      monthlyContribution: (Number(form.monthlyContribution) || 0) * scale,
      annualContribution: (Number(form.annualContribution) || 0) * scale,
      annualReturnPct: Number(form.annualReturnPct) || 0,
      accumulationYears: Number(form.accumulationYears) || 0,
      withdrawRatePct: Number(form.withdrawRatePct) || 0,
      taxRatePct: Number(form.taxRatePct) || 0,
      feeRatePct: Number(form.feeRatePct) || 0,
      inflationPct: Number(form.inflationPct) || 0,
    };

    onSubmit && onSubmit(payload);
  };

  return (
    <section className="tool-form">
      <form onSubmit={handleSubmit}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-lg font-semibold">
              {isKo ? '기본 가정 입력' : 'Input assumptions'}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {isKo
                ? '한글 기준 금액은 모두 “만원” 단위입니다. 예: 30 → 30만원, 3000 → 3,000만원.'
                : 'All amounts are in KRW; enter full amounts.'}
            </p>
          </div>
          <button
            type="submit"
            className="btn-primary text-xs md:text-sm whitespace-nowrap"
          >
            {isKo ? '조회 / 계산하기' : 'Run simulation'}
          </button>
        </div>

        <div className="form-grid">
          {/* 현재 자산 */}
          <div className="form-field">
            <label>
              {isKo ? '현재 자산 (만원)' : 'Current assets (KRW)'}
            </label>
            <input
              type="number"
              className="input"
              value={form.currentAsset}
              onChange={handleChange('currentAsset')}
            />
            <small>
              {isKo
                ? '지금 보유 중인 투자 가능 자산 (만원 단위)'
                : 'Investable assets you have now'}
            </small>
          </div>

          {/* 연 지출 */}
          <div className="form-field">
            <label>
              {isKo ? '연 지출 (만원)' : 'Annual spending (KRW)'}
            </label>
            <input
              type="number"
              className="input"
              value={form.annualSpending}
              onChange={handleChange('annualSpending')}
            />
            <small>
              {isKo
                ? '은퇴 후 유지하고 싶은 연간 생활비 (오늘 기준, 만원)'
                : 'Annual spending you want in retirement'}
            </small>
          </div>

          {/* 명목 수익률 */}
          <div className="form-field">
            <label>{isKo ? '연 수익률 (%)' : 'Expected annual return (%)'}</label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.annualReturnPct}
              onChange={handleChange('annualReturnPct')}
            />
            <small>
              {isKo
                ? '세전·수수료·인플레이션 반영 전 명목 수익률'
                : 'Nominal return before tax, fees, inflation'}
            </small>
          </div>

          {/* 적립 기간 */}
          <div className="form-field">
            <label>{isKo ? '적립 기간 (년)' : 'Accumulation period (years)'}</label>
            <input
              type="number"
              className="input"
              value={form.accumulationYears}
              onChange={handleChange('accumulationYears')}
            />
            <small>
              {isKo
                ? '은퇴 전까지 자산을 불려가는 기간'
                : 'Years you keep investing before FIRE'}
            </small>
          </div>

          {/* 출금률 */}
          <div className="form-field">
            <label>{isKo ? '은퇴 후 출금률 (%)' : 'Withdrawal rate (%)'}</label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.withdrawRatePct}
              onChange={handleChange('withdrawRatePct')}
            />
            <small>
              {isKo
                ? '4% rule 등 (연 지출 / 자산 비율)'
                : '4% rule etc. (spending / assets)'}
            </small>
          </div>

          {/* 월 저축 */}
          <div className="form-field">
            <label>{isKo ? '월 저축 (만원)' : 'Monthly contribution'}</label>
            <input
              type="number"
              className="input"
              value={form.monthlyContribution}
              onChange={handleChange('monthlyContribution')}
            />
            <small>
              {isKo
                ? '근로 기간 동안 매달 추가로 투자하는 금액'
                : 'Monthly amount you invest while working'}
            </small>
          </div>

          {/* 연 추가 저축 */}
          <div className="form-field">
            <label>{isKo ? '연 추가 저축 (만원)' : 'Yearly lump-sum contribution'}</label>
            <input
              type="number"
              className="input"
              value={form.annualContribution}
              onChange={handleChange('annualContribution')}
            />
            <small>
              {isKo
                ? '보너스·연말 일시 투자 등 연 1회 추가 투자'
                : 'Lump-sum you invest once a year'}
            </small>
          </div>

          {/* 세금 */}
          <div className="form-field">
            <label>{isKo ? '세금 (%)' : 'Tax rate (%)'}</label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.taxRatePct}
              onChange={handleChange('taxRatePct')}
            />
            <small>
              {isKo
                ? '이자·배당 등 수익에 대한 세율 (예: 15.4)'
                : 'Tax on investment gains (e.g. 15.4)'}
            </small>
          </div>

          {/* 수수료 */}
          <div className="form-field">
            <label>{isKo ? '연 수수료 (%)' : 'Annual fee (%)'}</label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.feeRatePct}
              onChange={handleChange('feeRatePct')}
            />
            <small>
              {isKo
                ? 'ETF·펀드 보수·운용 수수료 등'
                : 'Expense ratio, management fee etc.'}
            </small>
          </div>

          {/* 인플레이션 */}
          <div className="form-field">
            <label>{isKo ? '인플레이션 (%)' : 'Inflation rate (%)'}</label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.inflationPct}
              onChange={handleChange('inflationPct')}
            />
            <small>
              {isKo
                ? '물가상승률 가정 (실질 수익률 계산용)'
                : 'Assumed inflation for real return'}
            </small>
          </div>
        </div>
      </form>
    </section>
  );
}
