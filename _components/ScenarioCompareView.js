// _components/ScenarioCompareView.js
import ValueDisplay from "./ValueDisplay";
import ScenarioCompareChart from "./ScenarioCompareChart";

export default function ScenarioCompareView({
  selected = [],
  numberLocale = "ko-KR",
  currency = "KRW",
}) {
  if (!selected?.length) return null;

  return (
    <div className="mt-4 space-y-4">
      {/* 비교 테이블 */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="p-3">시나리오</th>
              <th className="p-3">조건</th>
              <th className="p-3">세후 총자산</th>
              <th className="p-3">총 납입액</th>
              <th className="p-3">세후 이자</th>
              <th className="p-3">Drag</th>
            </tr>
          </thead>
          <tbody>
            {selected.map((s) => {
              const inp = s?.inputs || {};
              const sum = s?.summary || {};
              return (
                <tr key={s.id} className="border-t">
                  <td className="p-3 font-medium whitespace-nowrap">
                    {s.name}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <span className="mr-2">
                      {inp.annualRate}% · {inp.years}y ·{" "}
                      {inp.compounding === "yearly" ? "연복리" : "월복리"}
                    </span>
                    <span className="text-slate-500">
                      (tax {inp.taxRatePercent}%, fee {inp.feeRatePercent}%)
                    </span>
                  </td>

                  <td className="p-3">
                    <ValueDisplay
                      value={sum.fvNet}
                      locale={numberLocale}
                      currency={currency}
                    />
                  </td>

                  <td className="p-3">
                    <ValueDisplay
                      value={sum.totalContrib}
                      locale={numberLocale}
                      currency={currency}
                    />
                  </td>

                  <td className="p-3">
                    <ValueDisplay
                      value={sum.totalInterestNet}
                      locale={numberLocale}
                      currency={currency}
                    />
                  </td>

                  <td className="p-3">
                    <ValueDisplay
                      value={sum.drag}
                      locale={numberLocale}
                      currency={currency}
                    />
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
          {numberLocale.startsWith("ko")
            ? "세후 총자산(연차) 비교"
            : "Net Future Value by Year"}
        </div>
        <ScenarioCompareChart
          selected={selected}
          currency={currency}
          numberLocale={numberLocale}
        />
      </div>
    </div>
  );
}
