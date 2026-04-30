// _components/FireForm.js — PREMIUM UX VERSION
// 실질 수익률 자동 표시 · FIRE 목표 즉시 표시 · 입력 섹션 구분

import { useState, useEffect, useMemo } from "react";

// ---------- 숫자 포맷팅 ----------
function formatNum(v) {
  if (v === "" || v === null || v === undefined) return "";
  const n = Number(String(v).replace(/,/g, ""));
  return isNaN(n) ? "" : n.toLocaleString("ko-KR");
}

function parseNum(v) {
  if (!v) return 0;
  return Number(String(v).replace(/,/g, "")) || 0;
}

export default function FireForm({ onSubmit, initial, lang = "ko" }) {
  const isKo = lang === "ko";

  // 한국어는 “만원 단위 입력”
  const scale = isKo ? 10_000 : 1;

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

  useEffect(() => {
    setForm(toDisplay(initial));
  }, [initial, lang]);

  // RAW 입력 처리
  const handleRawChange = (key) => (e) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^[0-9.]+$/.test(raw)) {
      setForm((prev) => ({ ...prev, [key]: raw }));
    }
  };

  // blur 시 자동 포맷
  const handleBlur = (key) => () => {
    const raw = form[key];
    const parsed = parseNum(raw);
    setForm((prev) => ({ ...prev, [key]: formatNum(parsed) }));
  };

  // ----------------------------
  // 🔥 실질 수익률 계산 (옵션 A 공식)
  // ----------------------------
  const realReturn = useMemo(() => {
    const nominal = Number(form.annualReturnPct) || 0;
    const fee = Number(form.feeRatePct) || 0;
    const infl = Number(form.inflationPct) / 100; // ★ 물가율 %
    const tax = Number(form.taxRatePct) / 100; // ★ 세율 %

    // ★ 옵션 A: (1 + nominal_after_tax) / (1 + inflation) – 1
    const nominalReturn = (nominal - fee) / 100;
    const nominalAfterTax = nominalReturn * (1 - tax);
    const real = (1 + nominalAfterTax) / (1 + infl) - 1;

    return (real * 100).toFixed(2);
  }, [form]);

  // ----------------------------
  // FIRE 목표 즉시 계산
  // ----------------------------
  const immediateFireTarget = useMemo(() => {
    const spend = parseNum(form.annualSpending) * scale;
    const wr = Number(form.withdrawRatePct) / 100;
    if (!spend || !wr) return 0;
    return spend / wr;
  }, [form, scale]);

  // ----------------------------
  // 연간 총 저축액
  // ----------------------------
  const totalContribution = useMemo(() => {
    const m = parseNum(form.monthlyContribution) * scale;
    const a = parseNum(form.annualContribution) * scale;
    return m * 12 + a;
  }, [form, scale]);

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
    onSubmit(payload);
  };

  return (
    <section className="tool-form">
      <form onSubmit={handleSubmit}>
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base md:text-lg font-semibold">
              {isKo ? "기본 가정 입력" : "Input assumptions"}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {isKo
                ? "모든 금액은 ‘만원 단위’입니다."
                : "All values in selected currency units."}
            </p>
          </div>

          <button type="submit" className="btn-primary whitespace-nowrap">
            {isKo ? "조회 / 계산하기" : "Run simulation"}
          </button>
        </div>

        {/* --------------------------- */}
        {/* 🔹 섹션 1: 현재 재무 상태 */}
        {/* --------------------------- */}
        <h3 className="section-title">{isKo ? "현재 자산 상태" : "Current status"}</h3>
        <div className="form-grid">
          {/* 현재 자산 */}
          <div className="form-field">
            <label>{isKo ? "현재 자산 (만원)" : "Current assets"}</label>
            <input
              className="input"
              value={form.currentAsset}
              onChange={handleRawChange("currentAsset")}
              onBlur={handleBlur("currentAsset")}
              placeholder={isKo ? "예: 5000 (=5,000만원)" : "e.g. 20000"}
            />
            <small>{isKo ? "현재 보유한 투자 가능 자산" : "Your investable assets"}</small>
          </div>
        </div>

        {/* --------------------------- */}
        {/* 🔹 섹션 2: 적립 기간 (Accumulation) */}
        {/* --------------------------- */}
        <h3 className="section-title">{isKo ? "적립 기간 입력" : "Accumulation inputs"}</h3>
        <div className="form-grid">
          {/* 월 저축 */}
          <div className="form-field">
            <label>{isKo ? "월 저축 (만원)" : "Monthly contribution"}</label>
            <input
              className="input"
              value={form.monthlyContribution}
              onChange={handleRawChange("monthlyContribution")}
              onBlur={handleBlur("monthlyContribution")}
            />
            <small>{isKo ? "근로 기간 매달 투자" : "Monthly investment"}</small>
          </div>

          {/* 연 저축 */}
          <div className="form-field">
            <label>{isKo ? "연 저축 (만원)" : "Annual lump-sum"}</label>
            <input
              className="input"
              value={form.annualContribution}
              onChange={handleRawChange("annualContribution")}
              onBlur={handleBlur("annualContribution")}
            />
            <small>{isKo ? "보너스 등 일시 투자" : "Bonus / lump-sum"}</small>
          </div>

          {/* 총 저축 */}
          <div className="form-field">
            <label>{isKo ? "연간 총 저축액" : "Total annual savings"}</label>
            <input
              className="input bg-slate-100"
              disabled
              value={isKo ? formatNum(totalContribution / scale) : totalContribution}
            />
            <small>{isKo ? "월 × 12 + 연 저축" : "Monthly × 12 + annual"}</small>
          </div>

          {/* 수익률 */}
          <div className="form-field">
            <label>{isKo ? "명목 연 수익률 (%)" : "Nominal annual return (%)"}
              <span
                title={
                  isKo
                    ? "세금·수수료·물가 조정 전의 ‘표면 수익률’. 투자 자산이 1년 동안 얼마의 비율로 성장하는지를 의미합니다. 명목 수익률이 높을수록 FIRE 달성 시점이 빨라집니다."
                    : "Return before tax, fee, inflation. Higher nominal return accelerates FIRE timeline."
                }
                className="ml-1 cursor-help text-blue-500"
              >
                ❔
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.annualReturnPct}
              onChange={handleRawChange("annualReturnPct")}
            />
            <small>{isKo ? "세전 기준" : "Before tax"}</small>
          </div>

          {/* 적립 기간 */}
          <div className="form-field">
            <label>{isKo ? "적립 기간 (년)" : "Accumulation years"}</label>
            <input
              type="number"
              className="input"
              value={form.accumulationYears}
              onChange={handleRawChange("accumulationYears")}
            />
          </div>
        </div>

        {/* --------------------------- */}
        {/* 🔹 섹션 3: 은퇴 후 가정 */}
        {/* --------------------------- */}
        <h3 className="section-title">{isKo ? "은퇴 후 가정" : "Retirement assumptions"}</h3>
        <div className="form-grid">
          {/* 연 지출 */}
          <div className="form-field">
            <label>{isKo ? "연 지출 (만원)" : "Annual spending"}</label>
            <input
              className="input"
              value={form.annualSpending}
              onChange={handleRawChange("annualSpending")}
              onBlur={handleBlur("annualSpending")}
            />
            <small>{isKo ? "은퇴 후 유지 생활비" : "Post-retirement spending"}</small>
          </div>

          {/* 출금률 */}
          <div className="form-field">
            <label>{isKo ? "출금률 (%)" : "Withdrawal rate (%)"}
              <span
                title={
                  isKo
                    ? "은퇴 후 매년 자산에서 꺼내 쓰는 비율입니다. 4% rule이 대표적이며, 출금률이 낮을수록 더 오래 버틸 수 있습니다."
                    : "Percentage withdrawn yearly in retirement. Lower withdrawal rate means longer asset longevity."
                }
                className="ml-1 cursor-help text-blue-500"
              >
                ❔
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.withdrawRatePct}
              onChange={handleRawChange("withdrawRatePct")}
            />
            <small>{isKo ? "4% rule 등" : "4% rule etc."}</small>
          </div>

          {/* 즉시 FIRE 목표 표시 */}
          <div className="form-field">
            <label>{isKo ? "FIRE 목표 자산" : "FIRE Target"}</label>
            <input
              className="input bg-blue-50 font-semibold"
              disabled
              value={
                isKo
                  ? formatNum(immediateFireTarget)
                  : immediateFireTarget.toLocaleString()
              }
            />
            <small>{isKo ? "연 지출 ÷ 출금률" : "Spending ÷ withdrawal rate"}</small>
          </div>
        </div>

        {/* --------------------------- */}
        {/* 🔹 섹션 4: 세금 / 수수료 / 인플레이션 */}
        {/* --------------------------- */}
        <h3 className="section-title">
          {isKo ? "세금·수수료·물가" : "Tax, fee & inflation"}
        </h3>

        <div className="form-grid">
          {/* 세금 */}
          <div className="form-field">
            <label>{isKo ? "세금 (%)" : "Tax rate (%)"}
              <span
                title={
                  isKo
                    ? "투자 수익에 부과되는 세율입니다. 배당세·양도세 등 모든 세금을 단순화하여 반영합니다. 세금이 높을수록 실질 수익률은 낮아집니다."
                    : "Tax applied on investment gains. Higher tax reduces your real return."
                }
                className="ml-1 cursor-help text-blue-500"
              >
                ❔
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.taxRatePct}
              onChange={handleRawChange("taxRatePct")}
            />
          </div>

          {/* 수수료 */}
          <div className="form-field">
            <label>{isKo ? "수수료 (%)" : "Fee (%)"}
              <span
                title={
                  isKo
                    ? "ETF·펀드·증권사 수수료 등 모든 비용을 단순화하여 반영합니다. 수수료가 높을수록 장기 자산 성장률은 감소합니다."
                    : "All fund/brokerage fees. Higher fees reduce long-term returns."
                }
                className="ml-1 cursor-help text-blue-500"
              >
                ❔
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.feeRatePct}
              onChange={handleRawChange("feeRatePct")}
            />
          </div>

          {/* 인플레이션 */}
          <div className="form-field">
            <label>{isKo ? "인플레이션 (%)" : "Inflation (%)"}
              <span
                title={
                  isKo
                    ? "물가 상승률을 의미합니다. 물가가 오르면 자산의 구매력은 떨어지므로 실질 수익률 계산에 반드시 포함됩니다."
                    : "Rate of rising prices. Inflation reduces real purchasing power."
                }
                className="ml-1 cursor-help text-blue-500"
              >
                ❔
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.inflationPct}
              onChange={handleRawChange("inflationPct")}
            />
          </div>

          {/* 실질 수익률 표시 */}
          <div className="form-field">
            <label>{isKo ? "실질 수익률 (자동 계산)" : "Real return (auto)"}
              <span
                 title={
                  isKo
                    ? "실질 수익률 = (1 + (명목 수익률 – 수수료) × (1 – 세율)) ÷ (1 + 인플레이션) – 1\n\n즉, 물가·세금·수수료를 모두 반영한 ‘구매력 기준 진짜 투자 수익률’입니다."
                    : "Real return = (1 + (nominal – fee) × (1 – tax)) ÷ (1 + inflation) – 1\nReflects true purchasing power."
                }
                className="ml-1 cursor-help text-blue-500"
              >
                ❔
              </span>
            </label>
            <input
              className="input bg-slate-100 text-emerald-700 font-semibold"
              disabled
              value={realReturn + "%"}
            />
            <small>
              {isKo
                ? "((1 + 명목-after-tax) ÷ (1 + 물가)) – 1"
                : "((1 + nominal_after_tax) ÷ (1 + inflation)) – 1"}
            </small>
          </div>
        </div>
      </form>
    </section>
  );
}
