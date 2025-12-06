// _components/FireForm.js — Improved UX Version

import { useState, useEffect } from "react";

// 숫자 자동 포맷팅: 10000 → "10,000"
function formatNum(v) {
  if (v === "" || v === null || v === undefined) return "";
  const n = Number(String(v).replace(/,/g, ""));
  return isNaN(n) ? "" : n.toLocaleString("ko-KR");
}

// 콤마 제거 숫자 → 원본 Number
function parseNum(v) {
  if (!v) return 0;
  return Number(String(v).replace(/,/g, "")) || 0;
}

export default function FireForm({ onSubmit, initial, lang = "ko" }) {
  const isKo = lang === "ko";

  // 한국어는 모든 금액 “만원 단위” 표시
  const scale = isKo ? 10_000 : 1;

  // 초기값 → 표시용 값으로 변환
  const toDisplay = (src) => ({
    currentAsset: src?.currentAsset ? src.currentAsset / scale : "",
    annualSpending: src?.annualSpending ? src.annualSpending / scale : "",
    monthlyContribution: src?.monthlyContribution
      ? src.monthlyContribution / scale
      : "",
    annualContribution: src?.annualContribution
      ? src.annualContribution / scale
      : "",
    annualReturnPct: src?.annualReturnPct ?? 5,
    accumulationYears: src?.accumulationYears ?? 15,
    withdrawRatePct: src?.withdrawRatePct ?? 4,
    taxRatePct: src?.taxRatePct ?? 15.4,
    feeRatePct: src?.feeRatePct ?? 0.5,
    inflationPct: src?.inflationPct ?? 2.0,
  });

  const [form, setForm] = useState(toDisplay(initial));

  // 언어 변경 시 표시값 업데이트
  useEffect(() => {
    setForm(toDisplay(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // 입력 핸들러: 입력 중에는 raw 값을 그대로 유지
  const handleRawChange = (key) => (e) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^[0-9.]+$/.test(raw)) {
      setForm((prev) => ({ ...prev, [key]: raw }));
    }
  };

  // blur 시 자동 포맷팅
  const handleBlur = (key) => () => {
    const raw = form[key];
    if (raw === "" || raw === null || raw === undefined) return;
    const parsed = parseNum(raw);
    setForm((prev) => ({ ...prev, [key]: formatNum(parsed) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      currentAsset: parseNum(form.currentAsset) * scale,
      annualSpending: parseNum(form.annualSpending) * scale,
      monthlyContribution: parseNum(form.monthlyContribution) * scale,
      annualContribution: parseNum(form.annualContribution) * scale,
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
        {/* ---------- Header area with CTA Button ---------- */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base md:text-lg font-semibold">
              {isKo ? "기본 가정 입력" : "Input assumptions"}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {isKo
                ? "모든 금액은 ‘만원 단위’입니다. 예: 300 → 300만원"
                : "All amounts are entered in your selected currency."}
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary text-xs md:text-sm whitespace-nowrap"
          >
            {isKo ? "조회 / 계산하기" : "Run simulation"}
          </button>
        </div>

        {/* ---------- Input Grid ---------- */}
        <div className="form-grid">

          {/* 현재 자산 */}
          <div className="form-field">
            <label>{isKo ? "현재 자산 (만원)" : "Current assets"}</label>
            <input
              className="input"
              value={form.currentAsset}
              onChange={handleRawChange("currentAsset")}
              onBlur={handleBlur("currentAsset")}
              placeholder={isKo ? "예: 5000 (= 5,000만원)" : "e.g. 20000"}
            />
            <small>
              {isKo
                ? "지금 보유 중인 투자 가능 자산"
                : "Investable assets you currently have"}
            </small>
          </div>

          {/* 연 지출 */}
          <div className="form-field">
            <label>{isKo ? "연 지출 (만원)" : "Annual spending"}</label>
            <input
              className="input"
              value={form.annualSpending}
              onChange={handleRawChange("annualSpending")}
              onBlur={handleBlur("annualSpending")}
              placeholder={isKo ? "예: 3000 (= 3,000만원)" : "e.g. 30000"}
            />
            <small>
              {isKo
                ? "은퇴 후 유지하고 싶은 연간 생활비"
                : "Desired annual spending in retirement"}
            </small>
          </div>

          {/* 명목 수익률 */}
          <div className="form-field">
            <label>{isKo ? "명목 연 수익률 (%)" : "Expected annual return (%)"}</label>
            <input
              className="input"
              type="number"
              step="0.1"
              value={form.annualReturnPct}
              onChange={handleRawChange("annualReturnPct")}
            />
            <small>
              {isKo
                ? "세전·수수료·물가 반영 전 수익률"
                : "Before tax, fee, inflation"}
            </small>
          </div>

          {/* 적립 기간 */}
          <div className="form-field">
            <label>{isKo ? "적립 기간 (년)" : "Accumulation period (years)"}</label>
            <input
              className="input"
              type="number"
              value={form.accumulationYears}
              onChange={handleRawChange("accumulationYears")}
            />
            <small>{isKo ? "은퇴까지 투자하는 기간" : "Years before FIRE"}</small>
          </div>

          {/* 출금률 */}
          <div className="form-field">
            <label>{isKo ? "출금률 (%)" : "Withdrawal rate (%)"}</label>
            <input
              className="input"
              type="number"
              step="0.1"
              value={form.withdrawRatePct}
              onChange={handleRawChange("withdrawRatePct")}
            />
            <small>{isKo ? "4% rule 등" : "e.g. 4% rule"}</small>
          </div>

          {/* 월 저축 */}
          <div className="form-field">
            <label>{isKo ? "월 저축 (만원)" : "Monthly contribution"}</label>
            <input
              className="input"
              value={form.monthlyContribution}
              onChange={handleRawChange("monthlyContribution")}
              onBlur={handleBlur("monthlyContribution")}
              placeholder={isKo ? "예: 50 (50만원)" : "e.g. 500"}
            />
            <small>
              {isKo ? "근로 기간 동안 매달 투자" : "Monthly investment while working"}
            </small>
          </div>

          {/* 연 저축 */}
          <div className="form-field">
            <label>{isKo ? "연 저축 (만원)" : "Annual lump-sum"}</label>
            <input
              className="input"
              value={form.annualContribution}
              onChange={handleRawChange("annualContribution")}
              onBlur={handleBlur("annualContribution")}
              placeholder={isKo ? "예: 200 (200만원)" : "e.g. 2000"}
            />
            <small>
              {isKo
                ? "보너스·연말 일시투자 등"
                : "Bonus / once-per-year investment"}
            </small>
          </div>

          {/* 세금 */}
          <div className="form-field">
            <label>{isKo ? "세금 (%)" : "Tax rate (%)"}</label>
            <input
              className="input"
              type="number"
              step="0.1"
              value={form.taxRatePct}
              onChange={handleRawChange("taxRatePct")}
            />
            <small>
              {form.taxRatePct === "0"
                ? isKo
                  ? "세금 미적용"
                  : "No tax applied"
                : isKo
                ? "이자·배당 세율(예: 15.4%)"
                : "Tax on investment gains (e.g. 15.4%)"}
            </small>
          </div>

          {/* 수수료 */}
          <div className="form-field">
            <label>{isKo ? "수수료 (%)" : "Annual fee (%)"}</label>
            <input
              className="input"
              type="number"
              step="0.1"
              value={form.feeRatePct}
              onChange={handleRawChange("feeRatePct")}
            />
            <small>
              {form.feeRatePct === "0"
                ? isKo
                  ? "수수료 미적용"
                  : "No fee applied"
                : isKo
                ? "ETF·펀드 보수"
                : "Expense ratio"}
            </small>
          </div>

          {/* 인플레이션 */}
          <div className="form-field">
            <label>{isKo ? "인플레이션 (%)" : "Inflation (%)"}</label>
            <input
              className="input"
              type="number"
              step="0.1"
              value={form.inflationPct}
              onChange={handleRawChange("inflationPct")}
            />
            <small>
              {form.inflationPct === "0"
                ? isKo
                  ? "물가 반영 없음"
                  : "No inflation applied"
                : isKo
                ? "실질 수익률 계산 반영"
                : "Used for real return calculation"}
            </small>
          </div>
        </div>
      </form>
    </section>
  );
}
