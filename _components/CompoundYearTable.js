import { useMemo, useState } from "react";
import ValueDisplay from "./ValueDisplay";

function pct(value, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return "-";
  return `${Number(value).toFixed(digits)}%`;
}

export default function CompoundYearTable({
  result,
  locale = "ko-KR",
  currency = "KRW",
  principal = 0,
  monthly = 0,
  title,
  targetAmount,
  sectionId,
}) {
  const [showAll, setShowAll] = useState(false);
  const isKo = String(locale).toLowerCase().startsWith("ko");
  const rows = useMemo(() => {
    if (result?.yearAnalysisRows?.length) return result.yearAnalysisRows;
    return (result?.yearSummary || []).map((row) => {
      const principalTotal = Number(principal) + Number(monthly) * 12 * Number(row.year || 0);
      const pretaxFinalAmount = Number(row.closingBalanceGross) || 0;
      const afterTaxFinalAmount = Number(row.closingBalanceNet) || pretaxFinalAmount;
      const pretaxInvestmentGain = pretaxFinalAmount - principalTotal;
      return {
        year: row.year,
        principalTotal,
        pretaxFinalAmount,
        pretaxInvestmentGain,
        tax: Number(row.taxYear) || 0,
        afterTaxFinalAmount,
        presentValue: afterTaxFinalAmount,
      };
    });
  }, [result, principal, monthly]);
  const tableTitle = title || (isKo ? "연도별 예상 추이" : "Year-by-year Projection");
  const finalTarget = Number(targetAmount) > 0
    ? Number(targetAmount)
    : Number(result?.afterTaxFinalAmount || result?.futureValueNet || 0);

  const visibleRows = useMemo(() => {
    if (showAll) return rows;
    return rows.slice(0, 10);
  }, [rows, showAll]);

  if (!rows.length) {
    return (
      <section id={sectionId} className="card">
        <h2 className="text-xl font-semibold">{tableTitle}</h2>
        <p className="mt-2 text-sm text-slate-500">{isKo ? "표시할 데이터가 없습니다." : "No data."}</p>
      </section>
    );
  }

  return (
    <section id={sectionId} className="card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">{tableTitle}</h2>
          <p className="mt-1 text-xs text-slate-500">
            {isKo
              ? "월복리·월말 납입 기준으로 각 연도 종료 시점에 정산한다고 가정한 표입니다."
              : "Each row assumes monthly compounding and end-of-month contributions through that year."}
          </p>
        </div>
        {rows.length > 10 && (
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? (isKo ? "10년만 보기" : "Show 10 years") : (isKo ? "전체 보기" : "Show all")}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] border-t text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">{isKo ? "연도" : "Year"}</th>
              <th className="px-3 py-2 text-right">{isKo ? "납입원금" : "Principal paid"}</th>
              <th className="px-3 py-2 text-right">{isKo ? "세전금액" : "Pretax value"}</th>
              <th className="px-3 py-2 text-right">{isKo ? "세전 투자수익" : "Pretax gain"}</th>
              <th className="px-3 py-2 text-right">{isKo ? "예상 세금" : "Estimated tax"}</th>
              <th className="px-3 py-2 text-right">{isKo ? "세후금액" : "After-tax value"}</th>
              <th className="px-3 py-2 text-right">{isKo ? "현재가치" : "Present value"}</th>
              <th className="px-3 py-2 text-right">{isKo ? "목표 대비율" : "Target ratio"}</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const ratio = finalTarget > 0 ? row.afterTaxFinalAmount / finalTarget * 100 : null;
              const gain = Number(row.pretaxInvestmentGain) || 0;
              return (
                <tr key={row.year} className="border-t">
                  <td className="px-3 py-2 font-medium">{row.year}</td>
                  <td className="px-3 py-2 text-right"><ValueDisplay value={row.principalTotal} locale={locale} currency={currency} /></td>
                  <td className="px-3 py-2 text-right"><ValueDisplay value={row.pretaxFinalAmount} locale={locale} currency={currency} /></td>
                  <td className={`px-3 py-2 text-right ${gain < 0 ? "text-rose-700" : gain > 0 ? "text-emerald-700" : "text-slate-700"}`}>
                    <ValueDisplay value={row.pretaxInvestmentGain} locale={locale} currency={currency} />
                  </td>
                  <td className="px-3 py-2 text-right"><ValueDisplay value={row.tax} locale={locale} currency={currency} /></td>
                  <td className="px-3 py-2 text-right"><ValueDisplay value={row.afterTaxFinalAmount} locale={locale} currency={currency} /></td>
                  <td className="px-3 py-2 text-right"><ValueDisplay value={row.presentValue} locale={locale} currency={currency} /></td>
                  <td className="px-3 py-2 text-right">{pct(ratio, 1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
