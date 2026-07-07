import { useEffect, useMemo, useRef, useState } from "react";
import { calcCompound } from "../lib/compound";
import { formatMoneyShort } from "./ValueDisplay";
import { trackGaEvent } from "../utils/analytics";

export const COMPOUND_QUICK_COMPARE_YEARS = [5, 10, 20, 30];
export const COMPOUND_QUICK_COMPARE_MONTHLY = {
  KRW: [100_000, 300_000, 500_000, 1_000_000],
  USD: [100, 300, 500, 1_000],
};

function formatMoney(value, currency, numberLocale) {
  if (currency === "KRW") return formatMoneyShort(value, numberLocale);

  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: "USD",
    notation: Math.abs(Number(value) || 0) >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
}

function getRow(result, scenario, isCurrent) {
  const rounded = result?.rounded || {};
  return {
    scenario,
    isCurrent,
    afterTaxFinalAmount: rounded.afterTaxFinalAmount ?? result?.afterTaxFinalAmount ?? 0,
    principalTotal: rounded.principalTotal ?? result?.principalTotal ?? 0,
    afterTaxInvestmentGain: rounded.afterTaxInvestmentGain ?? result?.afterTaxInvestmentGain ?? 0,
    presentValue: rounded.presentValue ?? result?.presentValue ?? 0,
  };
}

function ComparisonCards({ rows, labels, currency, numberLocale }) {
  return (
    <div className="divide-y divide-slate-200 lg:hidden" data-quick-compare-layout="cards">
      {rows.map((row) => (
        <article key={row.scenario} className="py-4 first:pt-0 last:pb-0">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <h4 className="break-words text-sm font-semibold text-slate-900">{row.scenario}</h4>
            {row.isCurrent && (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                {labels.current}
              </span>
            )}
          </div>
          <dl className="mt-3 grid min-w-0 grid-cols-2 gap-x-3 gap-y-3 text-sm">
            {[
              [labels.finalValue, row.afterTaxFinalAmount],
              [labels.principal, row.principalTotal],
              [labels.gain, row.afterTaxInvestmentGain],
              [labels.presentValue, row.presentValue],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="break-words text-xs leading-5 text-slate-500">{label}</dt>
                <dd className="mt-0.5 break-words font-semibold text-slate-900">
                  {formatMoney(value, currency, numberLocale)}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}

function ComparisonTable({ rows, labels, currency, numberLocale }) {
  return (
    <div className="hidden max-w-full overflow-x-auto lg:block" data-quick-compare-layout="table">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            <th className="px-2 py-3 font-medium">{labels.scenario}</th>
            <th className="px-2 py-3 font-medium">{labels.finalValue}</th>
            <th className="px-2 py-3 font-medium">{labels.principal}</th>
            <th className="px-2 py-3 font-medium">{labels.gain}</th>
            <th className="px-2 py-3 font-medium">{labels.presentValue}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.scenario} className={row.isCurrent ? "bg-emerald-50/70" : "border-b border-slate-100 last:border-0"}>
              <th className="px-2 py-3 text-left font-semibold text-slate-900">
                {row.scenario}
                {row.isCurrent && <span className="ml-2 text-xs font-medium text-emerald-700">{labels.current}</span>}
              </th>
              <td className="whitespace-nowrap px-2 py-3">{formatMoney(row.afterTaxFinalAmount, currency, numberLocale)}</td>
              <td className="whitespace-nowrap px-2 py-3">{formatMoney(row.principalTotal, currency, numberLocale)}</td>
              <td className="whitespace-nowrap px-2 py-3">{formatMoney(row.afterTaxInvestmentGain, currency, numberLocale)}</td>
              <td className="whitespace-nowrap px-2 py-3">{formatMoney(row.presentValue, currency, numberLocale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CompoundQuickComparePanel({
  locale = "ko",
  numberLocale = "ko-KR",
  currency = "KRW",
  invest,
  taxRatePercent = 0,
  feeRatePercent = 0,
  inflationRate = 0,
  baseYear,
}) {
  const isKo = locale === "ko";
  const [comparisonType, setComparisonType] = useState("years");
  const panelRef = useRef(null);
  const viewTrackedRef = useRef(false);

  const labels = isKo
    ? {
        title: "빠른 비교",
        description: "기간과 월 적립금 중 하나만 바꿨을 때 결과 차이를 확인합니다.",
        years: "기간 비교",
        monthly: "월 적립금 비교",
        scenario: "조건",
        finalValue: "세후 최종금액",
        principal: "총 납입원금",
        gain: "세후 수익",
        presentValue: "현재가치",
        current: "현재 조건",
        note: "이 비교는 현재 입력한 수익률, 세금, 수수료, 물가상승률을 그대로 둔 상태에서 기간 또는 월 적립금만 바꾼 월복리 시뮬레이션입니다. 실제 수익률은 매년 달라질 수 있습니다.",
      }
    : {
        title: "Quick Comparison",
        description: "Compare outcomes by changing only the time horizon or monthly contribution.",
        years: "Time horizon",
        monthly: "Monthly contribution",
        scenario: "Scenario",
        finalValue: "After-tax final value",
        principal: "Total principal",
        gain: "After-tax gain",
        presentValue: "Present value",
        current: "Current",
        note: "These comparisons keep your return, tax, fee and inflation assumptions unchanged, while changing only the time horizon or monthly contribution. Actual returns can vary year by year.",
      };

  const commonInput = useMemo(
    () => ({
      principal: Number(invest?.principal) || 0,
      monthly: Number(invest?.monthly) || 0,
      annualRate: Number(invest?.annualRate) || 0,
      years: Number(invest?.years) || 0,
      compounding: "monthly",
      taxRatePercent: Number(taxRatePercent) || 0,
      feeRatePercent: Number(feeRatePercent) || 0,
      inflationRate: Number(inflationRate) || 0,
      baseYear,
    }),
    [baseYear, feeRatePercent, inflationRate, invest, taxRatePercent]
  );

  const yearRows = useMemo(
    () => COMPOUND_QUICK_COMPARE_YEARS.map((years) => getRow(
      calcCompound({ ...commonInput, years }),
      isKo ? `${years}년` : `${years} years`,
      Number(invest?.years) === years
    )),
    [commonInput, invest?.years, isKo]
  );

  const monthlyRows = useMemo(() => {
    const presets = COMPOUND_QUICK_COMPARE_MONTHLY[currency] || COMPOUND_QUICK_COMPARE_MONTHLY.KRW;
    return presets.map((monthly) => getRow(
      calcCompound({ ...commonInput, monthly }),
      currency === "KRW"
        ? isKo
          ? `월 ${(monthly / 10_000).toLocaleString(numberLocale)}만원`
          : `${new Intl.NumberFormat(numberLocale, { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(monthly)}/mo`
        : `${new Intl.NumberFormat(numberLocale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(monthly)}/mo`,
      Number(invest?.monthly) === monthly
    ));
  }, [commonInput, currency, invest?.monthly, isKo, numberLocale]);

  useEffect(() => {
    if (!panelRef.current || viewTrackedRef.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) return;
        viewTrackedRef.current = true;
        trackGaEvent("tool_quick_compare_view", {
          source_tool: "compound",
          locale,
          currency,
          comparison_type: comparisonType,
          location: "result_quick_compare",
        });
        observer.disconnect();
      },
      { threshold: [0.5] }
    );

    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [comparisonType, currency, locale]);

  const selectComparison = (nextType) => {
    if (nextType === comparisonType) return;
    setComparisonType(nextType);
    trackGaEvent("tool_quick_compare_click", {
      source_tool: "compound",
      locale,
      currency,
      comparison_type: nextType,
      location: "result_quick_compare",
    });
  };

  const rows = comparisonType === "years" ? yearRows : monthlyRows;

  return (
    <section
      ref={panelRef}
      className="card min-w-0 max-w-full"
      aria-labelledby="compound-quick-compare-title"
      data-testid="compound-quick-compare"
      data-compounding-basis="monthly"
    >
      <div className="min-w-0">
        <h2 id="compound-quick-compare-title" className="break-words text-lg font-semibold text-slate-900">
          {labels.title}
        </h2>
        <p className="mt-1 break-words text-sm leading-6 text-slate-600">{labels.description}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1" role="tablist" aria-label={labels.title}>
        {[
          ["years", labels.years],
          ["monthly", labels.monthly],
        ].map(([type, label]) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={comparisonType === type}
            className={`min-h-[44px] rounded-md px-2 py-2 text-sm font-semibold ${
              comparisonType === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => selectComparison(type)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5" role="tabpanel" data-comparison-type={comparisonType}>
        <ComparisonCards rows={rows} labels={labels} currency={currency} numberLocale={numberLocale} />
        <ComparisonTable rows={rows} labels={labels} currency={currency} numberLocale={numberLocale} />
      </div>

      <p className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">{labels.note}</p>
    </section>
  );
}
