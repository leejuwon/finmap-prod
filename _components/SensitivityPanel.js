import { useMemo } from "react";
import { buildCompoundSensitivity } from "../lib/compound";
import ValueDisplay from "./ValueDisplay";

function pct(value, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return "-";
  return `${Number(value).toFixed(digits)}%`;
}

function rowLabel(row, isKo) {
  if (row.group === "rate") {
    if (row.delta === 0) return isKo ? "연 수익률 기준" : "Base return";
    return isKo
      ? `연 수익률 ${row.delta > 0 ? "+" : ""}${row.delta}%p`
      : `Return ${row.delta > 0 ? "+" : ""}${row.delta}pp`;
  }
  if (row.group === "monthly") {
    if (row.delta === 0) return isKo ? "월납입금 기준" : "Base monthly";
    return isKo
      ? `월납입금 ${row.delta > 0 ? "+" : ""}${Math.round(row.delta * 100)}%`
      : `Monthly ${row.delta > 0 ? "+" : ""}${Math.round(row.delta * 100)}%`;
  }
  if (row.delta === 0) return isKo ? "투자기간 기준" : "Base years";
  return isKo
    ? `투자기간 ${row.delta > 0 ? "+" : ""}${row.delta}년`
    : `Years ${row.delta > 0 ? "+" : ""}${row.delta}`;
}

function groupLabel(group, isKo) {
  if (group === "rate") return isKo ? "수익률" : "Return";
  if (group === "monthly") return isKo ? "월납입금" : "Monthly";
  return isKo ? "기간" : "Years";
}

export default function SensitivityPanel({
  principal,
  monthly,
  annualRate,
  years,
  taxRatePercent,
  feeRatePercent,
  inflationRate = 0,
  locale = "ko-KR",
  currency = "KRW",
}) {
  const isKo = String(locale).toLowerCase().startsWith("ko");
  const rows = useMemo(() => buildCompoundSensitivity({
    initialAmount: principal,
    monthlyContribution: monthly,
    years,
    annualReturn: annualRate,
    taxRate: taxRatePercent,
    feeRate: feeRatePercent,
    inflationRate,
  }), [principal, monthly, annualRate, years, taxRatePercent, feeRatePercent, inflationRate]);

  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[940px] border-t text-sm">
        <thead className="bg-slate-50 text-xs text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left">{isKo ? "구분" : "Group"}</th>
            <th className="px-3 py-2 text-left">{isKo ? "시나리오" : "Scenario"}</th>
            <th className="px-3 py-2 text-right">{isKo ? "세후 최종금액" : "After-tax final"}</th>
            <th className="px-3 py-2 text-right">{isKo ? "원금합계" : "Principal"}</th>
            <th className="px-3 py-2 text-right">{isKo ? "세전 투자수익" : "Pretax gain"}</th>
            <th className="px-3 py-2 text-right">{isKo ? "현재가치" : "Present value"}</th>
            <th className="px-3 py-2 text-right">{isKo ? "총수익률" : "Total return"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const r = row.rounded || {};
            const isBase = row.delta === 0;
            const gain = Number(r.pretaxInvestmentGain) || 0;
            return (
              <tr key={row.key} className={`border-t ${isBase ? "bg-blue-50/60" : "bg-white"}`}>
                <td className="px-3 py-2 text-slate-500">{groupLabel(row.group, isKo)}</td>
                <td className="px-3 py-2 font-medium text-slate-900">{rowLabel(row, isKo)}</td>
                <td className="px-3 py-2 text-right"><ValueDisplay value={r.afterTaxFinalAmount} locale={locale} currency={currency} /></td>
                <td className="px-3 py-2 text-right"><ValueDisplay value={r.principalTotal} locale={locale} currency={currency} /></td>
                <td className={`px-3 py-2 text-right ${gain < 0 ? "text-rose-700" : gain > 0 ? "text-emerald-700" : "text-slate-700"}`}>
                  <ValueDisplay value={r.pretaxInvestmentGain} locale={locale} currency={currency} />
                </td>
                <td className="px-3 py-2 text-right"><ValueDisplay value={r.presentValue} locale={locale} currency={currency} /></td>
                <td className="px-3 py-2 text-right">{pct(r.totalReturnPercent, 2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
