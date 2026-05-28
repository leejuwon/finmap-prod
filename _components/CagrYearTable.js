function formatMoneyAuto(value, currency = "KRW", locale = "ko-KR") {
  const v = Number(value) || 0;
  const isKo = locale.toLowerCase().startsWith("ko");
  const cur = currency || "KRW";

  if (cur === "KRW") {
    const abs = Math.abs(v);
    let divisor = 1;
    let suffix = isKo ? "원" : "KRW";

    if (abs >= 100_000_000) {
      divisor = 100_000_000;
      suffix = isKo ? "억원" : "x100M KRW";
    } else if (abs >= 10_000) {
      divisor = 10_000;
      suffix = isKo ? "만원" : "x10k KRW";
    }

    const scaled = v / divisor;
    const scaledAbs = Math.abs(scaled);
    const hasFraction = Math.round(scaledAbs * 10) % 10 !== 0;
    const maximumFractionDigits = divisor === 1 ? 0 : hasFraction ? 1 : 0;
    const numStr = scaled.toLocaleString(locale, {
      maximumFractionDigits,
    });

    return `${numStr}${suffix}`;
  }

  const isValidCurrency = typeof cur === "string" && /^[A-Z]{3}$/.test(cur);
  if (!isValidCurrency) return new Intl.NumberFormat(locale).format(v);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 2,
  }).format(v);
}

function pct(value, digits = 2) {
  const v = Number(value) || 0;
  return `${v.toFixed(digits)}%`;
}

export default function CagrYearTable({
  result,
  locale = "ko-KR",
  currency = "KRW",
}) {
  const rows = result?.yearSummary || [];
  const isKo = locale.startsWith("ko");

  if (!rows.length) {
    return (
      <div className="card">
        <h2 className="mb-2 text-xl font-semibold">
          {isKo ? "연도별 성장 경로" : "Yearly growth path"}
        </h2>
        <p className="text-sm text-slate-500">
          {isKo ? "계산 결과가 없습니다." : "No data."}
        </p>
      </div>
    );
  }

  const unitText = isKo
    ? "단위: 원 / 만원 / 억원 자동"
    : "Unit: auto (KRW / 10k / 100M)";

  return (
    <div className="card">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold">
          {isKo ? "연도별 성장 경로" : "Yearly growth path"}
        </h2>
        <span className="text-[11px] text-slate-500 sm:text-xs">
          {unitText}
        </span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-slate-600">
        {isKo
          ? "현재 CAGR이 매년 동일하게 적용된다고 가정했을 때의 단순 성장 경로입니다."
          : "This table shows a simplified path assuming the current CAGR is applied each year."}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-[880px] border-t text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-2 py-2 text-left whitespace-nowrap">
                {isKo ? "연도" : "Year"}
              </th>
              <th className="px-2 py-2 text-right whitespace-nowrap">
                {isKo ? "예상 금액" : "Projected value"}
              </th>
              <th className="px-2 py-2 text-right whitespace-nowrap">
                {isKo ? "시작 대비 증가율" : "Return from start"}
              </th>
              <th className="px-2 py-2 text-right whitespace-nowrap">
                {isKo ? "전년 대비 증가액" : "Change from prior"}
              </th>
              <th className="px-2 py-2 text-right whitespace-nowrap">
                {isKo ? "세전 추정 금액" : "Estimated gross"}
              </th>
              <th className="px-2 py-2 text-right whitespace-nowrap">
                {isKo ? "세금/수수료 효과" : "Tax/fee effect"}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.yearLabel || row.year} className="border-t">
                <td className="px-2 py-2 text-left whitespace-nowrap">
                  {isKo ? `${row.yearLabel ?? row.year}년` : `Year ${row.yearLabel ?? row.year}`}
                </td>
                <td className="px-2 py-2 text-right whitespace-nowrap font-medium">
                  {formatMoneyAuto(row.netValue, currency, locale)}
                </td>
                <td className="px-2 py-2 text-right whitespace-nowrap">
                  {pct(row.totalReturnPercent)}
                </td>
                <td className="px-2 py-2 text-right whitespace-nowrap">
                  {formatMoneyAuto(row.gainFromPrevious, currency, locale)}
                </td>
                <td className="px-2 py-2 text-right whitespace-nowrap">
                  {formatMoneyAuto(row.grossValue, currency, locale)}
                </td>
                <td className="px-2 py-2 text-right whitespace-nowrap">
                  {formatMoneyAuto(row.taxFeeImpact, currency, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
