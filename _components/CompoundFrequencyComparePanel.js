import { useEffect, useMemo, useRef } from "react";
import { formatMoneyShort } from "./ValueDisplay";
import { trackGaEvent } from "../utils/analytics";

function readAmount(result, field) {
  const roundedValue = result?.rounded?.[field];
  return Number(roundedValue ?? result?.[field] ?? 0) || 0;
}

function formatMoney(value, currency, numberLocale) {
  if (currency === "KRW") return formatMoneyShort(value, numberLocale);

  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function ResultCard({ title, badge, result, labels, currency, numberLocale, emphasis = false }) {
  const values = [
    [labels.finalValue, readAmount(result, "afterTaxFinalAmount")],
    [labels.principal, readAmount(result, "principalTotal")],
    [labels.gain, readAmount(result, "afterTaxInvestmentGain")],
    [labels.presentValue, readAmount(result, "presentValue")],
  ];

  return (
    <article
      className={`min-w-0 rounded-lg border p-4 ${
        emphasis ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h3 className="break-words text-sm font-semibold text-slate-900">{title}</h3>
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
          emphasis ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
        }`}>
          {badge}
        </span>
      </div>

      <dl className="mt-4 grid min-w-0 grid-cols-2 gap-x-3 gap-y-4 text-sm">
        {values.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="break-words text-xs leading-5 text-slate-500">{label}</dt>
            <dd className="mt-0.5 break-words font-semibold leading-5 text-slate-900">
              {formatMoney(value, currency, numberLocale)}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export default function CompoundFrequencyComparePanel({
  locale = "ko",
  numberLocale = "ko-KR",
  currency = "KRW",
  monthlyResult,
  annualResult,
}) {
  const panelRef = useRef(null);
  const trackedSignatureRef = useRef("");
  const isKo = locale === "ko";

  const labels = isKo
    ? {
        title: "월복리 vs 연복리 비교",
        description: "현재 월복리 결과와 같은 조건의 보수적 연복리 비교값입니다.",
        monthly: "월복리 기준",
        annual: "연복리 비교",
        current: "현재 결과",
        conservative: "보수적 비교",
        finalValue: "세후 최종금액",
        principal: "총 납입원금",
        gain: "세후 수익",
        presentValue: "현재가치",
        difference: "결과 차이",
        differenceRate: "연복리 비교 대비",
        higherMonthly: "월복리 기준 결과가 보수적 연복리 비교보다 약 {amount} 높습니다.",
        higherAnnual: "보수적 연복리 비교가 월복리 기준 결과보다 약 {amount} 높습니다.",
        equal: "두 비교 결과가 같습니다.",
        note: "연복리 비교값은 교육용 보수적 시뮬레이션입니다. 원금과 이전 연도 말 잔액에는 연 1회 수익률을 적용하고, 해당 연도 중 매월 납입한 12개월분은 연말에 합산하되 그해 수익률은 적용하지 않습니다. 실제 금융상품의 이자 지급, 과세, 수수료 방식과 다를 수 있습니다.",
      }
    : {
        title: "Monthly vs Annual Compounding",
        description: "Compare the current monthly-compounded result with a conservative annual scenario using the same inputs.",
        monthly: "Monthly compounding",
        annual: "Annual comparison",
        current: "Current result",
        conservative: "Conservative",
        finalValue: "After-tax final value",
        principal: "Total principal",
        gain: "After-tax gain",
        presentValue: "Present value",
        difference: "Result difference",
        differenceRate: "Difference vs annual comparison",
        higherMonthly: "The monthly-compounded result is about {amount} higher than the conservative annual comparison.",
        higherAnnual: "The conservative annual comparison is about {amount} higher than the monthly-compounded result.",
        equal: "The two comparison results are the same.",
        note: "The annual comparison is a conservative educational simulation. It applies one annual return to the opening balance, then adds that year's monthly contributions at year-end without applying that year's return to those contributions. Actual products may handle interest, tax and fees differently.",
      };

  const comparison = useMemo(() => {
    const monthlyFinal = readAmount(monthlyResult, "afterTaxFinalAmount");
    const annualFinal = readAmount(annualResult, "afterTaxFinalAmount");
    const difference = monthlyFinal - annualFinal;
    const differencePercent = annualFinal > 0 ? difference / annualFinal * 100 : null;
    return { monthlyFinal, annualFinal, difference, differencePercent };
  }, [annualResult, monthlyResult]);

  const resultSignature = `${comparison.monthlyFinal}:${comparison.annualFinal}:${currency}:${locale}`;

  useEffect(() => {
    if (
      !panelRef.current ||
      trackedSignatureRef.current === resultSignature ||
      typeof IntersectionObserver === "undefined"
    ) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) return;
        trackedSignatureRef.current = resultSignature;
        trackGaEvent("tool_frequency_compare_view", {
          source_tool: "compound",
          locale,
          currency,
          location: "result_frequency_compare",
          comparison_type: "monthly_vs_annual",
        });
        observer.disconnect();
      },
      { threshold: [0.5] }
    );

    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [currency, locale, resultSignature]);

  if (!monthlyResult || !annualResult?.ok) return null;

  const absoluteDifference = Math.abs(comparison.difference);
  const formattedDifference = formatMoney(absoluteDifference, currency, numberLocale);
  const differenceText = Math.abs(comparison.difference) < 0.5
    ? labels.equal
    : comparison.difference > 0
      ? labels.higherMonthly.replace("{amount}", formattedDifference)
      : labels.higherAnnual.replace("{amount}", formattedDifference);

  return (
    <section
      ref={panelRef}
      className="min-w-0 max-w-full border-y border-slate-200 bg-white py-5 sm:px-1"
      aria-labelledby="compound-frequency-compare-title"
      data-testid="compound-frequency-compare"
      data-comparison-type="monthly_vs_annual"
    >
      <h2 id="compound-frequency-compare-title" className="break-words text-lg font-semibold text-slate-900">
        {labels.title}
      </h2>
      <p className="mt-1 break-words text-sm leading-6 text-slate-600">{labels.description}</p>

      <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
        <ResultCard
          title={labels.monthly}
          badge={labels.current}
          result={monthlyResult}
          labels={labels}
          currency={currency}
          numberLocale={numberLocale}
          emphasis
        />
        <ResultCard
          title={labels.annual}
          badge={labels.conservative}
          result={annualResult}
          labels={labels}
          currency={currency}
          numberLocale={numberLocale}
        />
      </div>

      <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4" data-frequency-difference={comparison.difference}>
        <h3 className="text-sm font-semibold text-teal-900">{labels.difference}</h3>
        <p className="mt-1 break-words text-sm leading-6 text-teal-900">{differenceText}</p>
        {comparison.differencePercent != null && Math.abs(comparison.difference) >= 0.5 && (
          <p className="mt-1 text-xs text-teal-700">
            {`${labels.differenceRate} ${Math.abs(comparison.differencePercent).toLocaleString(numberLocale, { maximumFractionDigits: 1 })}%`}
          </p>
        )}
      </div>

      <p className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
        {labels.note}
      </p>
    </section>
  );
}
