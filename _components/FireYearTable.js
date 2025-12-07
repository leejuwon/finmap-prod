// FireYearTable.js — PREMIUM TABLE

function formatMoney(value, locale = "ko-KR") {
  const n = Number(value) || 0;

  if (locale === "ko-KR") {
    if (n >= 100_000_000) return (n / 100_000_000).toFixed(2) + "억";
    if (n >= 10_000_000) return (n / 10_000_000).toFixed(1) + "천만";
    if (n >= 10_000) return (n / 10_000).toFixed(0) + "만";
    return n.toLocaleString("ko-KR") + "원";
  }

  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + n.toLocaleString("en-US");
}

export default function FireYearTable({
  timeline = [],
  locale = "ko-KR",
}) {
  const isKo = locale === "ko-KR";
  if (!timeline || timeline.length === 0) return null;

  const fireIndex = timeline.findIndex(
    (d) => d.assetReal >= d.fireTarget && d.phase === "accumulation"
  );
  const fireYear = fireIndex !== -1 ? timeline[fireIndex].year : null;

  const fireStartYear =
    timeline.find((d) => d.phase === "retirement")?.year || null;

  return (
    <section className="fire-year-table mt-8">
      <div className="mb-2">
        <h2 className="text-lg font-semibold">
          {isKo ? "연도별 FIRE 시뮬레이션" : "Yearly FIRE Simulation"}
        </h2>
        <p className="text-xs text-slate-500">
          {isKo
            ? "실질/명목 자산, 저축·인출 흐름을 함께 확인하세요."
            : "Compare real/nominal assets and yearly cashflows."}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 text-sm">
              <th className="border p-2">{isKo ? "연차" : "Year"}</th>
              <th className="border p-2">{isKo ? "구간" : "Phase"}</th>
              <th className="border p-2">{isKo ? "저축/인출" : "Cashflow"}</th>
              <th className="border p-2">{isKo ? "실질 자산" : "Real Assets"}</th>
              <th className="border p-2">{isKo ? "명목 자산" : "Nominal Assets"}</th>
              <th className="border p-2">{isKo ? "비고" : "Note"}</th>
            </tr>
          </thead>

          <tbody>
            {timeline.map((row) => {
              const isAcc = row.phase === "accumulation";
              const isRet = row.phase === "retirement";

              const cash =
                isAcc && row.contributionYear
                  ? row.contributionYear
                  : isRet && row.withdrawal
                  ? -row.withdrawal
                  : 0;

              const isFireYear = fireYear === row.year;
              const isStartRet = fireStartYear === row.year;

              return (
                <tr
                  key={`${row.year}-${row.phase}`}
                  className={`
                    text-sm
                    ${isFireYear ? "bg-amber-50 font-semibold" : ""}
                    ${isStartRet ? "bg-blue-50" : ""}
                    hover:bg-slate-50
                  `}
                >
                  <td className="border p-2 text-center">{row.year}</td>

                  <td className="border p-2 text-center">
                    {isAcc ? (isKo ? "적립" : "Accumulation") : isKo ? "은퇴" : "Retirement"}
                  </td>

                  <td className={`border p-2 text-right ${cash >= 0 ? "text-blue-600" : "text-red-500"}`}>
                    {cash !== 0 ? formatMoney(cash, locale) : "-"}
                  </td>

                  <td className="border p-2 text-right font-semibold text-slate-800">
                    {formatMoney(row.assetReal, locale)}
                  </td>

                  <td className="border p-2 text-right text-slate-500">
                    {formatMoney(row.assetNominal, locale)}
                  </td>

                  <td className="border p-2 text-center text-xs text-slate-600">
                    {isFireYear && (isKo ? "🔥 FIRE 달성" : "🔥 FIRE Achieved")}
                    {isStartRet && (isKo ? "은퇴 시작" : "Start of Retirement")}
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
