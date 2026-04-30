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

function fieldId(key) {
  return `fire-${key}`;
}

function FieldLabel({ id, label, helpText, helpOpen, onToggle, isKo }) {
  return (
    <div className="flex items-center gap-1">
      <label htmlFor={id}>{label}</label>
      {helpText && (
        <button
          type="button"
          className="text-xs font-medium text-blue-600 underline-offset-2 hover:underline"
          aria-controls={`${id}-help`}
          aria-expanded={helpOpen}
          aria-label={
            isKo ? `${label} 설명 ${helpOpen ? "접기" : "펼침"}` : `${label} info`
          }
          onClick={onToggle}
        >
          {isKo ? `(i) ${helpOpen ? "닫기" : "설명"}` : `(i) ${helpOpen ? "Hide" : "Info"}`}
        </button>
      )}
    </div>
  );
}

function FieldFeedback({ id, hint, helpText, helpOpen, error, warning }) {
  return (
    <>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
      {helpText && helpOpen && (
        <p id={`${id}-help`} className="text-xs leading-5 text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2">
          {helpText}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs leading-5 text-red-600">
          {error}
        </p>
      )}
      {warning && (
        <p id={`${id}-warning`} className="text-xs leading-5 text-amber-700">
          {warning}
        </p>
      )}
    </>
  );
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
  const [openHelp, setOpenHelp] = useState({});

  useEffect(() => {
    setForm(toDisplay(initial));
  }, [initial, lang]);

  const helpText = useMemo(
    () => ({
      annualReturnPct: isKo
        ? "세금·수수료·물가 조정 전의 표면 수익률입니다. 장기 평균을 너무 높게 잡으면 은퇴 가능 시점이 과도하게 빨라질 수 있습니다."
        : "Return before tax, fees, and inflation. Overly high long-term assumptions can make FIRE timing look too optimistic.",
      withdrawRatePct: isKo
        ? "은퇴 후 매년 자산에서 인출하는 비율입니다. 출금률이 높을수록 필요한 목표 자산과 고갈 위험이 함께 커집니다."
        : "The yearly withdrawal percentage in retirement. Higher rates can increase both target assets and depletion risk.",
      taxRatePct: isKo
        ? "투자 수익에 적용되는 세율을 단순화한 값입니다. 실제 세금은 계좌 유형, 상품, 보유 기간에 따라 달라질 수 있습니다."
        : "A simplified tax rate on investment gains. Actual taxes can vary by account, product, and holding period.",
      feeRatePct: isKo
        ? "ETF·펀드 보수, 거래 비용 등 장기 수익률을 낮추는 비용을 단순화해 입력합니다."
        : "A simplified estimate for fund fees, trading costs, and other expenses that reduce long-term returns.",
      inflationPct: isKo
        ? "물가 상승률입니다. 물가가 오르면 같은 금액의 구매력이 낮아지므로 실질 수익률 계산에 반영됩니다."
        : "Inflation reduces purchasing power, so it is included when calculating real return.",
      realReturn: isKo
        ? "실질 수익률 = (1 + (명목 수익률 - 수수료) × (1 - 세율)) ÷ (1 + 인플레이션) - 1 입니다."
        : "Real return = (1 + (nominal return - fee) × (1 - tax)) ÷ (1 + inflation) - 1.",
    }),
    [isKo]
  );

  const assumptionPresets = useMemo(
    () => [
      {
        key: "conservative",
        label: isKo ? "보수" : "Conservative",
        values: {
          annualReturnPct: 4,
          inflationPct: 3,
          withdrawRatePct: 3.5,
          taxRatePct: 15.4,
          feeRatePct: 0.5,
        },
      },
      {
        key: "base",
        label: isKo ? "기준" : "Base",
        values: {
          annualReturnPct: 5,
          inflationPct: 2,
          withdrawRatePct: 4,
          taxRatePct: 15.4,
          feeRatePct: 0.5,
        },
      },
      {
        key: "optimistic",
        label: isKo ? "낙관" : "Optimistic",
        values: {
          annualReturnPct: 7,
          inflationPct: 2.5,
          withdrawRatePct: 4.5,
          taxRatePct: 15.4,
          feeRatePct: 0.4,
        },
      },
    ],
    [isKo]
  );

  const validation = useMemo(() => {
    const errors = [];
    const warnings = [];
    const fieldErrors = {};
    const fieldWarnings = {};

    const addError = (field, message) => {
      errors.push(message);
      if (field) fieldErrors[field] = message;
    };

    const addWarning = (field, message) => {
      warnings.push(message);
      if (field) fieldWarnings[field] = message;
    };

    const currentAsset = parseNum(form.currentAsset);
    const annualSpending = parseNum(form.annualSpending);
    const monthlyContribution = parseNum(form.monthlyContribution);
    const annualContribution = parseNum(form.annualContribution);
    const accumulationYears = Number(form.accumulationYears) || 0;
    const withdrawRatePct = Number(form.withdrawRatePct) || 0;
    const annualReturnPct = Number(form.annualReturnPct) || 0;
    const taxRatePct = Number(form.taxRatePct) || 0;
    const feeRatePct = Number(form.feeRatePct) || 0;
    const inflationPct = Number(form.inflationPct) || 0;

    if (currentAsset <= 0 && monthlyContribution <= 0 && annualContribution <= 0) {
      addError(
        "currentAsset",
        isKo
          ? "현재 자산 또는 저축액을 하나 이상 입력해야 계산할 수 있습니다."
          : "Enter current assets or at least one savings amount to run the simulation."
      );
    }

    if (annualSpending <= 0) {
      addError(
        "annualSpending",
        isKo ? "은퇴 후 연 지출은 0보다 커야 합니다." : "Annual spending must be greater than 0."
      );
    }

    if (accumulationYears <= 0) {
      addError(
        "accumulationYears",
        isKo ? "적립 기간은 1년 이상이어야 합니다." : "Accumulation years must be at least 1."
      );
    }

    if (withdrawRatePct <= 0) {
      addError(
        "withdrawRatePct",
        isKo ? "출금률은 0보다 커야 합니다." : "Withdrawal rate must be greater than 0."
      );
    }

    if (annualReturnPct > 15) {
      addWarning(
        "annualReturnPct",
        isKo
          ? "연 15% 초과 수익률은 장기 가정으로 매우 낙관적일 수 있습니다."
          : "A return above 15% may be very optimistic as a long-term assumption."
      );
    }

    if (withdrawRatePct > 6) {
      addWarning(
        "withdrawRatePct",
        isKo
          ? "출금률 6% 초과는 자산 고갈 위험을 크게 높일 수 있습니다."
          : "A withdrawal rate above 6% can materially increase depletion risk."
      );
    }

    if (inflationPct > 8) {
      addWarning(
        "inflationPct",
        isKo
          ? "물가 8% 초과 가정은 결과 변동성을 크게 키울 수 있습니다."
          : "Inflation above 8% can make results highly sensitive."
      );
    }

    if (taxRatePct > 50) {
      addWarning(
        "taxRatePct",
        isKo
          ? "세율 50% 초과 입력은 특수한 세무 상황인지 확인해 보세요."
          : "Tax above 50% is unusual; confirm this matches your situation."
      );
    }

    if (feeRatePct > 2) {
      addWarning(
        "feeRatePct",
        isKo
          ? "수수료 2% 초과는 장기 실질 수익률을 크게 낮출 수 있습니다."
          : "Fees above 2% can significantly reduce long-term real returns."
      );
    }

    return { errors, warnings, fieldErrors, fieldWarnings };
  }, [form, isKo]);

  const hasErrors = validation.errors.length > 0;
  const errorSummary = validation.errors[0] || "";

  const describedBy = (key) => {
    const id = fieldId(key);
    return [
      `${id}-hint`,
      openHelp[key] ? `${id}-help` : null,
      validation.fieldErrors[key] ? `${id}-error` : null,
      validation.fieldWarnings[key] ? `${id}-warning` : null,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const toggleHelp = (key) => {
    setOpenHelp((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applyPreset = (values) => {
    setForm((prev) => ({ ...prev, ...values }));
  };

  // RAW 입력 처리
  const handleRawChange = (key) => (e) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^[0-9]*\.?[0-9]*$/.test(raw)) {
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
    if (hasErrors) return;

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
      <form onSubmit={handleSubmit} noValidate>
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
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

          <button
            type="submit"
            className="btn-primary whitespace-nowrap"
            disabled={hasErrors}
            aria-describedby={hasErrors ? "fire-form-error-summary" : undefined}
          >
            {isKo ? "조회 / 계산하기" : "Run simulation"}
          </button>
        </div>

        {hasErrors && (
          <p
            id="fire-form-error-summary"
            role="alert"
            className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {isKo ? "계산 버튼 비활성: " : "Run disabled: "}
            {errorSummary}
            {validation.errors.length > 1
              ? isKo
                ? ` 외 ${validation.errors.length - 1}건`
                : ` and ${validation.errors.length - 1} more`
              : ""}
          </p>
        )}

        {validation.warnings.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <p className="font-semibold">
              {isKo ? "가정 확인" : "Assumption check"}
            </p>
            <ul className="mt-1 list-disc pl-5 text-xs leading-5">
              {validation.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {isKo ? "예시 프리셋" : "Example presets"}
              </p>
              <p className="text-xs text-slate-500">
                {isKo
                  ? "수익률·물가·출금률·세율·수수료만 바뀝니다. 투자 조언이 아닙니다."
                  : "Only return, inflation, withdrawal, tax, and fee assumptions change. Not investment advice."}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[260px]">
              {assumptionPresets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  className="btn-secondary justify-center px-2"
                  onClick={() => applyPreset(preset.values)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --------------------------- */}
        {/* 🔹 섹션 1: 현재 재무 상태 */}
        {/* --------------------------- */}
        <h3 className="section-title">{isKo ? "현재 자산 상태" : "Current status"}</h3>
        <div className="form-grid">
          {/* 현재 자산 */}
          <div className="form-field">
            <FieldLabel
              id={fieldId("currentAsset")}
              label={isKo ? "현재 자산 (만원)" : "Current assets"}
              isKo={isKo}
            />
            <input
              id={fieldId("currentAsset")}
              className="input"
              value={form.currentAsset}
              onChange={handleRawChange("currentAsset")}
              onBlur={handleBlur("currentAsset")}
              placeholder={isKo ? "예: 5000 (=5,000만원)" : "e.g. 20000"}
              aria-invalid={Boolean(validation.fieldErrors.currentAsset)}
              aria-describedby={describedBy("currentAsset")}
            />
            <FieldFeedback
              id={fieldId("currentAsset")}
              hint={isKo ? "현재 보유한 투자 가능 자산" : "Your investable assets"}
              error={validation.fieldErrors.currentAsset}
              warning={validation.fieldWarnings.currentAsset}
            />
          </div>
        </div>

        {/* --------------------------- */}
        {/* 🔹 섹션 2: 적립 기간 (Accumulation) */}
        {/* --------------------------- */}
        <h3 className="section-title">{isKo ? "적립 기간 입력" : "Accumulation inputs"}</h3>
        <div className="form-grid">
          {/* 월 저축 */}
          <div className="form-field">
            <FieldLabel
              id={fieldId("monthlyContribution")}
              label={isKo ? "월 저축 (만원)" : "Monthly contribution"}
              isKo={isKo}
            />
            <input
              id={fieldId("monthlyContribution")}
              className="input"
              value={form.monthlyContribution}
              onChange={handleRawChange("monthlyContribution")}
              onBlur={handleBlur("monthlyContribution")}
              aria-invalid={Boolean(validation.fieldErrors.monthlyContribution)}
              aria-describedby={describedBy("monthlyContribution")}
            />
            <FieldFeedback
              id={fieldId("monthlyContribution")}
              hint={isKo ? "근로 기간 매달 투자" : "Monthly investment"}
              error={validation.fieldErrors.monthlyContribution}
              warning={validation.fieldWarnings.monthlyContribution}
            />
          </div>

          {/* 연 저축 */}
          <div className="form-field">
            <FieldLabel
              id={fieldId("annualContribution")}
              label={isKo ? "연 저축 (만원)" : "Annual lump-sum"}
              isKo={isKo}
            />
            <input
              id={fieldId("annualContribution")}
              className="input"
              value={form.annualContribution}
              onChange={handleRawChange("annualContribution")}
              onBlur={handleBlur("annualContribution")}
              aria-invalid={Boolean(validation.fieldErrors.annualContribution)}
              aria-describedby={describedBy("annualContribution")}
            />
            <FieldFeedback
              id={fieldId("annualContribution")}
              hint={isKo ? "보너스 등 일시 투자" : "Bonus / lump-sum"}
              error={validation.fieldErrors.annualContribution}
              warning={validation.fieldWarnings.annualContribution}
            />
          </div>

          {/* 총 저축 */}
          <div className="form-field">
            <FieldLabel
              id={fieldId("totalContribution")}
              label={isKo ? "연간 총 저축액" : "Total annual savings"}
              isKo={isKo}
            />
            <input
              id={fieldId("totalContribution")}
              className="input bg-slate-100"
              disabled
              value={isKo ? formatNum(totalContribution / scale) : totalContribution}
              aria-describedby={`${fieldId("totalContribution")}-hint`}
            />
            <FieldFeedback
              id={fieldId("totalContribution")}
              hint={isKo ? "월 × 12 + 연 저축" : "Monthly × 12 + annual"}
            />
          </div>

          {/* 수익률 */}
          <div className="form-field">
            <FieldLabel
              id={fieldId("annualReturnPct")}
              label={isKo ? "명목 연 수익률 (%)" : "Nominal annual return (%)"}
              helpText={helpText.annualReturnPct}
              helpOpen={Boolean(openHelp.annualReturnPct)}
              onToggle={() => toggleHelp("annualReturnPct")}
              isKo={isKo}
            />
            <input
              id={fieldId("annualReturnPct")}
              type="number"
              step="0.1"
              className="input"
              value={form.annualReturnPct}
              onChange={handleRawChange("annualReturnPct")}
              aria-invalid={Boolean(validation.fieldErrors.annualReturnPct)}
              aria-describedby={describedBy("annualReturnPct")}
            />
            <FieldFeedback
              id={fieldId("annualReturnPct")}
              hint={isKo ? "세전 기준" : "Before tax"}
              helpText={helpText.annualReturnPct}
              helpOpen={Boolean(openHelp.annualReturnPct)}
              error={validation.fieldErrors.annualReturnPct}
              warning={validation.fieldWarnings.annualReturnPct}
            />
          </div>

          {/* 적립 기간 */}
          <div className="form-field">
            <FieldLabel
              id={fieldId("accumulationYears")}
              label={isKo ? "적립 기간 (년)" : "Accumulation years"}
              isKo={isKo}
            />
            <input
              id={fieldId("accumulationYears")}
              type="number"
              className="input"
              value={form.accumulationYears}
              onChange={handleRawChange("accumulationYears")}
              aria-invalid={Boolean(validation.fieldErrors.accumulationYears)}
              aria-describedby={describedBy("accumulationYears")}
            />
            <FieldFeedback
              id={fieldId("accumulationYears")}
              hint={isKo ? "은퇴 전 자산을 모으는 기간" : "Years before retirement"}
              error={validation.fieldErrors.accumulationYears}
              warning={validation.fieldWarnings.accumulationYears}
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
            <FieldLabel
              id={fieldId("annualSpending")}
              label={isKo ? "연 지출 (만원)" : "Annual spending"}
              isKo={isKo}
            />
            <input
              id={fieldId("annualSpending")}
              className="input"
              value={form.annualSpending}
              onChange={handleRawChange("annualSpending")}
              onBlur={handleBlur("annualSpending")}
              aria-invalid={Boolean(validation.fieldErrors.annualSpending)}
              aria-describedby={describedBy("annualSpending")}
            />
            <FieldFeedback
              id={fieldId("annualSpending")}
              hint={isKo ? "은퇴 후 유지 생활비" : "Post-retirement spending"}
              error={validation.fieldErrors.annualSpending}
              warning={validation.fieldWarnings.annualSpending}
            />
          </div>

          {/* 출금률 */}
          <div className="form-field">
            <FieldLabel
              id={fieldId("withdrawRatePct")}
              label={isKo ? "출금률 (%)" : "Withdrawal rate (%)"}
              helpText={helpText.withdrawRatePct}
              helpOpen={Boolean(openHelp.withdrawRatePct)}
              onToggle={() => toggleHelp("withdrawRatePct")}
              isKo={isKo}
            />
            <input
              id={fieldId("withdrawRatePct")}
              type="number"
              step="0.1"
              className="input"
              value={form.withdrawRatePct}
              onChange={handleRawChange("withdrawRatePct")}
              aria-invalid={Boolean(validation.fieldErrors.withdrawRatePct)}
              aria-describedby={describedBy("withdrawRatePct")}
            />
            <FieldFeedback
              id={fieldId("withdrawRatePct")}
              hint={isKo ? "4% rule 등" : "4% rule etc."}
              helpText={helpText.withdrawRatePct}
              helpOpen={Boolean(openHelp.withdrawRatePct)}
              error={validation.fieldErrors.withdrawRatePct}
              warning={validation.fieldWarnings.withdrawRatePct}
            />
          </div>

          {/* 즉시 FIRE 목표 표시 */}
          <div className="form-field">
            <FieldLabel
              id={fieldId("fireTarget")}
              label={isKo ? "FIRE 목표 자산" : "FIRE Target"}
              isKo={isKo}
            />
            <input
              id={fieldId("fireTarget")}
              className="input bg-blue-50 font-semibold"
              disabled
              value={
                isKo
                  ? formatNum(immediateFireTarget)
                  : immediateFireTarget.toLocaleString()
              }
              aria-describedby={`${fieldId("fireTarget")}-hint`}
            />
            <FieldFeedback
              id={fieldId("fireTarget")}
              hint={isKo ? "연 지출 ÷ 출금률" : "Spending ÷ withdrawal rate"}
            />
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
            <FieldLabel
              id={fieldId("taxRatePct")}
              label={isKo ? "세금 (%)" : "Tax rate (%)"}
              helpText={helpText.taxRatePct}
              helpOpen={Boolean(openHelp.taxRatePct)}
              onToggle={() => toggleHelp("taxRatePct")}
              isKo={isKo}
            />
            <input
              id={fieldId("taxRatePct")}
              type="number"
              step="0.1"
              className="input"
              value={form.taxRatePct}
              onChange={handleRawChange("taxRatePct")}
              aria-invalid={Boolean(validation.fieldErrors.taxRatePct)}
              aria-describedby={describedBy("taxRatePct")}
            />
            <FieldFeedback
              id={fieldId("taxRatePct")}
              hint={isKo ? "투자 수익에 적용되는 단순 세율" : "Simplified tax rate on gains"}
              helpText={helpText.taxRatePct}
              helpOpen={Boolean(openHelp.taxRatePct)}
              error={validation.fieldErrors.taxRatePct}
              warning={validation.fieldWarnings.taxRatePct}
            />
          </div>

          {/* 수수료 */}
          <div className="form-field">
            <FieldLabel
              id={fieldId("feeRatePct")}
              label={isKo ? "수수료 (%)" : "Fee (%)"}
              helpText={helpText.feeRatePct}
              helpOpen={Boolean(openHelp.feeRatePct)}
              onToggle={() => toggleHelp("feeRatePct")}
              isKo={isKo}
            />
            <input
              id={fieldId("feeRatePct")}
              type="number"
              step="0.1"
              className="input"
              value={form.feeRatePct}
              onChange={handleRawChange("feeRatePct")}
              aria-invalid={Boolean(validation.fieldErrors.feeRatePct)}
              aria-describedby={describedBy("feeRatePct")}
            />
            <FieldFeedback
              id={fieldId("feeRatePct")}
              hint={isKo ? "펀드·거래 비용 등" : "Fund/trading costs"}
              helpText={helpText.feeRatePct}
              helpOpen={Boolean(openHelp.feeRatePct)}
              error={validation.fieldErrors.feeRatePct}
              warning={validation.fieldWarnings.feeRatePct}
            />
          </div>

          {/* 인플레이션 */}
          <div className="form-field">
            <FieldLabel
              id={fieldId("inflationPct")}
              label={isKo ? "인플레이션 (%)" : "Inflation (%)"}
              helpText={helpText.inflationPct}
              helpOpen={Boolean(openHelp.inflationPct)}
              onToggle={() => toggleHelp("inflationPct")}
              isKo={isKo}
            />
            <input
              id={fieldId("inflationPct")}
              type="number"
              step="0.1"
              className="input"
              value={form.inflationPct}
              onChange={handleRawChange("inflationPct")}
              aria-invalid={Boolean(validation.fieldErrors.inflationPct)}
              aria-describedby={describedBy("inflationPct")}
            />
            <FieldFeedback
              id={fieldId("inflationPct")}
              hint={isKo ? "구매력 하락률" : "Purchasing-power drag"}
              helpText={helpText.inflationPct}
              helpOpen={Boolean(openHelp.inflationPct)}
              error={validation.fieldErrors.inflationPct}
              warning={validation.fieldWarnings.inflationPct}
            />
          </div>

          {/* 실질 수익률 표시 */}
          <div className="form-field">
            <FieldLabel
              id={fieldId("realReturn")}
              label={isKo ? "실질 수익률 (자동 계산)" : "Real return (auto)"}
              helpText={helpText.realReturn}
              helpOpen={Boolean(openHelp.realReturn)}
              onToggle={() => toggleHelp("realReturn")}
              isKo={isKo}
            />
            <input
              id={fieldId("realReturn")}
              className="input bg-slate-100 text-emerald-700 font-semibold"
              disabled
              value={realReturn + "%"}
              aria-describedby={describedBy("realReturn")}
            />
            <FieldFeedback
              id={fieldId("realReturn")}
              hint={
                isKo
                  ? "((1 + 명목-after-tax) ÷ (1 + 물가)) – 1"
                  : "((1 + nominal_after_tax) ÷ (1 + inflation)) – 1"
              }
              helpText={helpText.realReturn}
              helpOpen={Boolean(openHelp.realReturn)}
              error={validation.fieldErrors.realReturn}
              warning={validation.fieldWarnings.realReturn}
            />
          </div>
        </div>
      </form>
    </section>
  );
}
