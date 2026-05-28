import { useMemo, useState } from "react";
import ValueDisplay from "./ValueDisplay";
import {
  estimateYearsToTarget,
  solveMonthlyContributionForTarget,
} from "../lib/compound";

function normalizeLocale(locale) {
  if (locale === "ko") return "ko-KR";
  if (locale === "en") return "en-US";
  return locale || "ko-KR";
}

function yearsText(value, isKo) {
  if (value == null || !Number.isFinite(Number(value))) return isKo ? "계산 어려움" : "N/A";
  if (Number(value) === 0) return isKo ? "이미 달성" : "Already reached";
  return isKo ? `${Number(value).toFixed(1)}년` : `${Number(value).toFixed(1)} years`;
}

export default function GoalEngineCard({
  locale = "ko",
  currency = "KRW",
  result,
  invest,
  taxRatePercent = 15.4,
  feeRatePercent = 0.5,
}) {
  const [goalInput, setGoalInput] = useState("");
  const isKo = String(locale).startsWith("ko");
  const numberLocale = normalizeLocale(locale);
  const principal = Number(invest?.principal) || 0;
  const monthly = Number(invest?.monthly) || 0;
  const years = Number(invest?.years) || 0;
  const annualRate = Number(invest?.annualRate ?? result?.annualRate ?? 0);
  const inflationRatePercent = Number(invest?.inflationRate ?? (Number(result?.inflationRate) || 0) * 100) || 0;
  const scale = currency === "KRW" ? 10_000 : 1;
  const goalAmount = (Number(goalInput) || 0) * scale;
  const currentFinal = Number(result?.afterTaxFinalAmount ?? result?.futureValueNet ?? 0);

  const requiredMonthly = useMemo(() => {
    if (!goalAmount || !years) return null;
    return solveMonthlyContributionForTarget({
      targetAmount: goalAmount,
      initialAmount: principal,
      years,
      annualReturn: annualRate,
      taxRate: taxRatePercent,
      feeRate: feeRatePercent,
      inflationRate: inflationRatePercent,
    });
  }, [goalAmount, principal, years, annualRate, taxRatePercent, feeRatePercent, inflationRatePercent]);

  const yearsToTarget = useMemo(() => {
    if (!goalAmount) return null;
    return estimateYearsToTarget({
      targetAmount: goalAmount,
      initialAmount: principal,
      monthlyContribution: monthly,
      annualReturn: annualRate,
      taxRate: taxRatePercent,
      feeRate: feeRatePercent,
      inflationRate: inflationRatePercent,
    });
  }, [goalAmount, principal, monthly, annualRate, taxRatePercent, feeRatePercent, inflationRatePercent]);

  const isReached = goalAmount > 0 && currentFinal >= goalAmount;

  const handleGoalChange = (e) => {
    setGoalInput(e.target.value.replace(/[^\d]/g, ""));
  };

  const formattedGoal = goalInput.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const goalLabel = isKo
    ? currency === "KRW" ? "목표금액 (만원)" : "목표금액"
    : currency === "KRW" ? "Target amount (10k KRW)" : "Target amount";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-900" htmlFor="compound-goal-input">
          {goalLabel}
        </label>
        <input
          id="compound-goal-input"
          type="text"
          className="input mt-1"
          value={formattedGoal}
          onChange={handleGoalChange}
          placeholder={isKo ? "예: 50,000" : "ex: 50,000"}
        />
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {isKo
            ? "목표금액은 세후 최종금액 기준으로 비교합니다. 역산은 월복리·월말 납입·세금·수수료 조건을 그대로 사용합니다."
            : "The target is compared against after-tax final value. Reverse calculations use the same monthly-compounding, end-of-month contribution, tax, and fee assumptions."}
        </p>
      </div>

      {goalAmount > 0 && (
        <>
          {isReached && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {isKo
                ? "현재 입력값 기준으로 목표금액을 이미 달성하는 시뮬레이션입니다."
                : "Under the current inputs, the simulation already reaches the target."}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-4">
              <div className="text-xs text-slate-500">{isKo ? "목표금액" : "Target amount"}</div>
              <div className="mt-1 text-lg font-semibold">
                <ValueDisplay value={goalAmount} locale={numberLocale} currency={currency} />
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <div className="text-xs text-slate-500">{isKo ? "필요 월납입금" : "Required monthly"}</div>
              <div className="mt-1 text-lg font-semibold">
                {requiredMonthly == null ? "-" : (
                  <ValueDisplay value={requiredMonthly} locale={numberLocale} currency={currency} />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {isKo ? "세후 목표 기준" : "After-tax target basis"}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <div className="text-xs text-slate-500">{isKo ? "현재 월납입 기준 도달 기간" : "Years at current monthly"}</div>
              <div className="mt-1 text-lg font-semibold">{yearsText(yearsToTarget, isKo)}</div>
              <p className="mt-1 text-xs text-slate-500">
                {yearsToTarget == null
                  ? (isKo ? "100년 안에 도달하지 않는 조건일 수 있습니다." : "The target may not be reached within 100 years.")
                  : (isKo ? "월복리 고정 기준" : "Monthly-compounding basis")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
