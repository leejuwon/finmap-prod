// _components/ScenarioCompareView.js
import ValueDisplay from "./ValueDisplay";
import ScenarioCompareChart from "./ScenarioCompareChart";

export default function ScenarioCompareView({
  selected = [],
  numberLocale = "ko-KR",
  currency = "KRW",
}) {
  if (!selected?.length) return null;

  const isKo = String(numberLocale).toLowerCase().startsWith("ko");

  const compLabel = (c) => {
    if (isKo) return c === "yearly" ? "연복리" : "월복리";
    return c === "yearly" ? "Yearly" : "Monthly";
  };

  return (
    <div className="mt-4 space-y-4">
      {/* ✅ Mobile: 카드형 */}
      <div className="md:hidden space-y-3">
        {selected.map((s) => {
          const inp = s?.inputs || {};
          const sum = s?.summary || {};
          return (
            <div key={s.id} className="border rounded-2xl p-4 bg-white">
              <div className="font-semibold mb-1 truncate">{s.name}</div>
              <div className="text-xs text-slate-500 mb-3">
                {inp.annualRate}% · {inp.years}y · {compLabel(inp.compounding)} ·{" "}
                tax {inp.taxRatePercent}% · fee {inp.feeRatePercent}%
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">{isKo ? "세후 총자산" : "Net FV"}</div>
                  <div className="font-semibold">
                    <ValueDisplay value={sum.fvNet} locale={numberLocale} currency={currency} />
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">{isKo ? "총 납입액" : "Contribution"}</div>
                  <div className="font-semibold">
                    <ValueDisplay value={sum.totalContrib} locale={numberLocale} currency={currency} />
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">{isKo ? "세후 이자" : "Net interest"}</div>
                  <div className="font-semibold">
                    <ValueDisplay value={sum.totalInterestNet} locale={numberLocale} currency={currency} />
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">{isKo ? "Drag" : "Drag"}</div>
                  <div className="font-semibold">
                    <ValueDisplay value={sum.drag} locale={numberLocale} currency={currency} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Desktop/Tablet: 테이블 유지 */}
      <div className="hidden md:block overflow-x-auto border rounded-xl">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="p-3">{isKo ? "시나리오" : "Scenario"}</th>
              <th className="p-3">{isKo ? "조건" : "Conditions"}</th>
              <th className="p-3">{isKo ? "세후 총자산" : "Net FV"}</th>
              <th className="p-3">{isKo ? "총 납입액" : "Contribution"}</th>
              <th className="p-3">{isKo ? "세후 이자" : "Net interest"}</th>
              <th className="p-3">Drag</th>
            </tr>
          </thead>
          <tbody>
            {selected.map((s) => {
              const inp = s?.inputs || {};
              const sum = s?.summary || {};
              return (
                <tr key={s.id} className="border-t">
                  <td className="p-3 font-medium whitespace-nowrap">{s.name}</td>

                  <td className="p-3 whitespace-nowrap">
                    <span className="mr-2">
                      {inp.annualRate}% · {inp.years}y · {compLabel(inp.compounding)}
                    </span>
                    <span className="text-slate-500">
                      (tax {inp.taxRatePercent}%, fee {inp.feeRatePercent}%)
                    </span>
                  </td>

                  <td className="p-3">
                    <ValueDisplay value={sum.fvNet} locale={numberLocale} currency={currency} />
                  </td>

                  <td className="p-3">
                    <ValueDisplay value={sum.totalContrib} locale={numberLocale} currency={currency} />
                  </td>

                  <td className="p-3">
                    <ValueDisplay value={sum.totalInterestNet} locale={numberLocale} currency={currency} />
                  </td>

                  <td className="p-3">
                    <ValueDisplay value={sum.drag} locale={numberLocale} currency={currency} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 비교 차트 */}
      <div className="border rounded-xl p-3">
        <div className="text-sm font-semibold mb-2">
          {isKo ? "세후 총자산(연차) 비교" : "Net Future Value by Year"}
        </div>
        <ScenarioCompareChart selected={selected} currency={currency} numberLocale={numberLocale} />
      </div>
    </div>
  );
}
