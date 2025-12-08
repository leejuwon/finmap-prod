// _components/FireYearTable.js — PREMIUM ANALYTICS FINAL VERSION

import { formatKrwUnit } from "../lib/fire";

function formatMoney(value, locale = "ko-KR") {
  const num = Number(value) || 0;

  if (locale === "ko-KR") {
    return formatKrwUnit(num);
  }

  // 영어권 포맷
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000_000) return sign + "$" + (abs / 1_000_000_000).toFixed(2) + "B";
  if (abs >= 1_000_000) return sign + "$" + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return sign + "$" + (abs / 1_000).toFixed(1) + "K";
  return sign + "$" + abs.toLocaleString("en-US");
}

export default function FireYearTable({ timeline = [], locale = "ko-KR" }) {
  const isKo = locale === "ko-KR";
  if (!timeline || timeline.length === 0) return null;

  const fireIndex = timeline.findIndex(
    (d) => d.assetReal >= d.fireTarget && d.phase === "accumulation"
  );
  const fireYear = fireIndex !== -1 ? timeline[fireIndex].year : null;

  const retirementStartYear =
    timeline.find((d) => d.phase === "retirement")?.year || null;

  return (
    <section className="fire-year-table mt-8">
      <div className="mb-2">
        <h2 className="text-lg font-semibold">
          {isKo ? "연도별 FIRE 시뮬레이션" : "Yearly FIRE Simulation"}
        </h2>
        <p className="text-xs text-slate-500">
          {isKo
            ? "실질/명목 자산, 저축·인출, 연간 수익률, 목표 대비 진행률까지 확인하세요."
            : "View real/nominal assets, cashflow, annual yields, and FIRE progress."}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th className="border p-2">{isKo ? "연차" : "Year"}</th>
              <th className="border p-2">{isKo ? "구간" : "Phase"}</th>
              <th className="border p-2">{isKo ? "현금흐름" : "Cashflow"}</th>
              <th className="border p-2">{isKo ? "명목 수익" : "Nominal Gain"}</th>
              <th className="border p-2">{isKo ? "실질 수익" : "Real Gain"}</th>
              <th className="border p-2">{isKo ? "누적 저축" : "Cumulative Savings"}</th>
              <th className="border p-2">{isKo ? "실질 자산" : "Real Assets"}</th>
              <th className="border p-2">{isKo ? "명목 자산" : "Nominal Assets"}</th>
              <th className="border p-2">{isKo ? "목표 대비" : "Progress"}</th>
              <th className="border p-2">{isKo ? "비고" : "Note"}</th>
            </tr>
          </thead>

          <tbody>
            {timeline.map((row) => {
              const isAcc = row.phase === "accumulation";
              const isRet = row.phase === "retirement";

              const cashNum = isAcc
                ? row.contributionYear
                : isRet
                ? -row.withdrawal
                : 0;

              const isFireHit = fireYear === row.year;
              const isStartRet = retirementStartYear === row.year;

              return (
                <tr
                  key={`${row.year}-${row.phase}`}
                  className={`
                    hover:bg-slate-50
                    ${isFireHit ? "bg-amber-50 font-semibold" : ""}
                    ${isStartRet ? "bg-blue-50" : ""}
                  `}
                >
                  <td className="border p-2 text-center">{row.year}</td>

                  <td className="border p-2 text-center">
                    {isAcc ? (isKo ? "적립" : "Accumulation") : isKo ? "은퇴" : "Retirement"}
                  </td>

                  <td
                    className={`border p-2 text-right ${
                      cashNum >= 0 ? "text-blue-600" : "text-red-500"
                    }`}
                  >
                    {cashNum !== 0 ? formatMoney(cashNum, locale) : "-"}
                  </td>

                  <td className="border p-2 text-right">{formatMoney(row.nominalYield, locale)}</td>

                  <td className="border p-2 text-right">{formatMoney(row.realYield, locale)}</td>

                  <td className="border p-2 text-right font-medium">
                    {formatMoney(row.cumulativeContribution, locale)}
                  </td>

                  <td className="border p-2 text-right font-semibold text-slate-800">
                    {formatMoney(row.assetReal, locale)}
                  </td>

                  <td className="border p-2 text-right text-slate-500">
                    {formatMoney(row.assetNominal, locale)}
                  </td>

                  <td className="border p-2 text-center">
                    {row.progressRate ? `${row.progressRate}%` : "-"}
                  </td>

                  <td className="border p-2 text-center text-xs">
                    {isFireHit && (isKo ? "🔥 FIRE 달성" : "🔥 FIRE Achieved")}
                    {isStartRet && (isKo ? "은퇴 시작" : "Start Retirement")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
