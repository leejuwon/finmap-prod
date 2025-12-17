// _components/CompoundYearTable.js
import { useMemo, useState } from "react";

// -----------------------------
// 금액 자동 단위 포맷
// -----------------------------
function formatMoneyAuto(value, currency = "KRW", locale = "ko-KR") {
  const v = Number(value) || 0;
  const isKo = locale.toLowerCase().startsWith("ko");
  const cur = currency || "KRW";

  if (cur === "KRW") {
    const abs = Math.abs(v);
    let suffix = isKo ? "원" : "KRW";

    if (abs >= 100_000_000) {
      const scaled = v / 100_000_000;
      suffix = isKo ? "억원" : "×100M KRW";
      return `${scaled.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}${suffix}`;
    } else if (abs >= 10_000) {
      const scaled = v / 10_000;
      suffix = isKo ? "만원" : "×10k KRW";
      const frac = Math.round(Math.abs(scaled) * 10) % 10 !== 0 ? 1 : 0;
      return `${scaled.toLocaleString(locale, {
        minimumFractionDigits: frac,
        maximumFractionDigits: frac,
      })}${suffix}`;
    }

    return `${v.toLocaleString(locale)}${suffix}`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: cur,
  }).format(v);
}

// -----------------------------
// Mini bar (수익률 시각화) 컴포넌트
// -----------------------------
function MiniBar({ rate }) {
  const width = Math.min(100, Math.max(0, rate)); // 0~100%
  return (
    <div className="w-full bg-slate-200 rounded h-2">
      <div className="bg-emerald-500 h-2 rounded" style={{ width: `${width}%` }} />
    </div>
  );
}

export default function CompoundYearTable({
  result,
  locale = "ko-KR",
  currency = "KRW",
  principal = 0,
  monthly = 0,
  title,

  // ✅ PRO 섹션 이동용(선택)
  sectionId,
}) {
  const rows = result?.yearSummary || [];
  const isKo = locale.startsWith("ko");

  const tableTitle = useMemo(() => {
    if (title) return title;
    return isKo ? "연간 요약 테이블" : "Yearly Summary";
  }, [title, isKo]);

  const unitText = isKo
    ? "단위: 원 / 만원 / 억원 자동 변환"
    : "Unit: auto (KRW / 10k / 100M)";

  const miniBarHelp = isKo
    ? "Mini bar는 ‘연환산 수익률’을 0~100%로 잘라 막대 길이로 보여주는 간단한 게이지입니다. 연환산 수익률 = (해당 연도 세후 이자 ÷ 연초 잔액) × 100"
    : "Mini bar shows ‘annualized return’ as a simple 0–100% capped gauge. Annualized return = (net interest of the year ÷ opening balance) × 100.";

  // =====================================================
  // 연도별 통계 계산
  // =====================================================
  const stats = useMemo(() => {
    return rows.map((r) => {
      const year = r.year;
      const opening = Number(r.openingBalanceNet) || 0;
      const closing = Number(r.closingBalanceNet) || 0;

      const contribRaw = Number(r.contributionYear) || 0;
      const contribDisplay = year === 1 ? Number(principal) + contribRaw : contribRaw;

      const interestNet = Number(r.interestYearNet) || 0;

      const taxYear = Number(r.taxYear) || 0;
      const feeYear = Number(r.feeYear) || 0;
      const taxFeeTotal = taxYear + feeYear;

      const investedTotal = Number(principal) + Number(monthly) * 12 * year;
      const returnRate = investedTotal > 0 ? (closing / investedTotal) * 100 : 0;

      const annualized = opening > 0 ? (interestNet / opening) * 100 : 0;

      const grossInterest = Number(r.interestYearGross) || interestNet + taxFeeTotal;

      const taxRate = grossInterest > 0 ? (taxYear / grossInterest) * 100 : 0;
      const feeRate = grossInterest > 0 ? (feeYear / grossInterest) * 100 : 0;
      const costPercent = grossInterest > 0 ? (taxFeeTotal / grossInterest) * 100 : 0;

      return {
        year,
        contrib: contribDisplay,
        closing,
        interestNet,
        taxFee: taxFeeTotal,
        investedTotal,
        returnRate,
        annualized,
        taxRate,
        feeRate,
        costPercent,
      };
    });
  }, [rows, principal, monthly]);

  // =====================================================
  // CSV 다운로드
  // =====================================================
  const downloadCsv = () => {
    if (!stats.length) return;

    const header = [
      "year",
      "contribution",
      "closingNet",
      "interestNet",
      "taxFee",
      "investedTotal",
      "returnRate",
      "annualizedReturn",
      "taxRate",
      "feeRate",
      "costPercent",
    ];
    const lines = [header.join(",")];

    stats.forEach((s) => {
      lines.push(
        [
          s.year,
          s.contrib,
          s.closing,
          s.interestNet,
          s.taxFee,
          s.investedTotal,
          s.returnRate,
          s.annualized,
          s.taxRate,
          s.feeRate,
          s.costPercent,
        ].join(",")
      );
    });

    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compound_year_summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!stats.length) {
    return (
      <section id={sectionId} className="card fm-year-table">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold">{tableTitle}</h2>
        </div>
        <p className="text-sm text-slate-500">{isKo ? "데이터가 없습니다." : "No data."}</p>
      </section>
    );
  }

  // ✅ 모바일: 카드/표 토글
  const [mobileMode, setMobileMode] = useState("cards"); // "cards" | "table"

  return (
    <section id={sectionId} className="card fm-year-table">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h2 className="text-xl font-semibold">{tableTitle}</h2>
        <span className="text-[11px] sm:text-xs text-slate-500">{unitText}</span>

        {/* ✅ 모바일 전용 토글 */}
        <div className="sm:hidden flex items-center gap-2 ml-auto">
          <button
            type="button"
            className={mobileMode === "cards" ? "btn-primary text-xs" : "btn-secondary text-xs"}
            onClick={() => setMobileMode("cards")}
          >
            {isKo ? "카드" : "Cards"}
          </button>
          <button
            type="button"
            className={mobileMode === "table" ? "btn-primary text-xs" : "btn-secondary text-xs"}
            onClick={() => setMobileMode("table")}
          >
            {isKo ? "표" : "Table"}
          </button>
        </div>

        <button
          type="button"
          className="btn-secondary ml-auto sm:ml-auto text-xs sm:text-sm"
          onClick={downloadCsv}
        >
          {isKo ? "CSV 다운로드" : "Download CSV"}
        </button>
      </div>

      {/* ✅ 모바일: 카드 뷰 */}
      <div className={`sm:hidden ${mobileMode === "cards" ? "block" : "hidden"}`}>
        <div className="space-y-3">
          {stats.map((s) => (
            <div key={s.year} className="border rounded-2xl p-4 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">{isKo ? "연도" : "Year"}</div>
                  <div className="text-base font-semibold">Y{s.year}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{isKo ? "기말잔액" : "Closing"}</div>
                  <div className="text-base font-semibold">
                    {formatMoneyAuto(s.closing, currency, locale)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {isKo ? "누적 수익률" : "Return"}: {s.returnRate.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div className="border rounded-xl p-2">
                  <div className="text-[11px] text-slate-500">{isKo ? "연간 납입" : "Contribution"}</div>
                  <div className="font-semibold">{formatMoneyAuto(s.contrib, currency, locale)}</div>
                </div>
                <div className="border rounded-xl p-2">
                  <div className="text-[11px] text-slate-500">{isKo ? "세후 이자" : "Net interest"}</div>
                  <div className="font-semibold">{formatMoneyAuto(s.interestNet, currency, locale)}</div>
                </div>
                <div className="border rounded-xl p-2">
                  <div className="text-[11px] text-slate-500">{isKo ? "세금+수수료" : "Tax+Fee"}</div>
                  <div className="font-semibold">{formatMoneyAuto(s.taxFee, currency, locale)}</div>
                </div>
                <div className="border rounded-xl p-2">
                  <div className="text-[11px] text-slate-500">{isKo ? "연환산 수익률" : "Annualized"}</div>
                  <div className="font-semibold">{s.annualized.toFixed(2)}%</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="inline-flex items-center gap-1">
                    Mini bar
                    <span className="text-slate-400 cursor-help" title={miniBarHelp} aria-label={miniBarHelp}>
                      ⓘ
                    </span>
                  </span>
                  <span>{Math.max(0, Math.min(100, s.annualized)).toFixed(1)}%</span>
                </div>
                <div title={miniBarHelp} aria-label={miniBarHelp}>
                  <MiniBar rate={Math.max(0, Math.min(100, s.annualized))} />
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500">
                {isKo
                  ? `세금 비중 ${s.taxRate.toFixed(1)}% · 수수료 비중 ${s.feeRate.toFixed(1)}% · 총 비용 비중 ${s.costPercent.toFixed(1)}%`
                  : `Tax ${s.taxRate.toFixed(1)}% · Fee ${s.feeRate.toFixed(1)}% · Total cost ${s.costPercent.toFixed(1)}%`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ 표 뷰(기존) */}
      <div className={`overflow-x-auto ${mobileMode === "table" ? "block" : "hidden"} sm:block`}>
        <table className="min-w-[900px] border-t">
          <thead className="bg-slate-50 text-xs whitespace-nowrap">
            <tr>
              <th className="px-2 py-1 text-left">{isKo ? "연도" : "Year"}</th>
              <th className="px-2 py-1 text-right">{isKo ? "연간 납입" : "Contribution"}</th>
              <th className="px-2 py-1 text-right">{isKo ? "기말잔액" : "Closing"}</th>
              <th className="px-2 py-1 text-right">{isKo ? "세후 이자" : "Net interest"}</th>
              <th className="px-2 py-1 text-right">{isKo ? "세금+수수료" : "Tax+Fee"}</th>
              <th className="px-2 py-1 text-right">{isKo ? "누적 투자금" : "Invested"}</th>
              <th className="px-2 py-1 text-right">{isKo ? "누적 수익률" : "Return"}</th>
              <th className="px-2 py-1 text-right">{isKo ? "연환산 수익률" : "Annualized"}</th>
              <th className="px-2 py-1 text-right">{isKo ? "세금 비중" : "Tax %"}</th>
              <th className="px-2 py-1 text-right">{isKo ? "수수료 비중" : "Fee %"}</th>
              <th className="px-2 py-1 text-right">{isKo ? "총 비용 비중" : "Cost %"}</th>

              <th className="px-2 py-1 text-left">
                <span className="inline-flex items-center gap-1">
                  Mini bar
                  <span className="text-slate-400 cursor-help" title={miniBarHelp} aria-label={miniBarHelp}>
                    ⓘ
                  </span>
                </span>
              </th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {stats.map((s) => (
              <tr key={s.year} className="border-t">
                <td className="px-2 py-1">{s.year}</td>
                <td className="px-2 py-1 text-right">{formatMoneyAuto(s.contrib, currency, locale)}</td>
                <td className="px-2 py-1 text-right">{formatMoneyAuto(s.closing, currency, locale)}</td>
                <td className="px-2 py-1 text-right">{formatMoneyAuto(s.interestNet, currency, locale)}</td>
                <td className="px-2 py-1 text-right">{formatMoneyAuto(s.taxFee, currency, locale)}</td>
                <td className="px-2 py-1 text-right">{formatMoneyAuto(s.investedTotal, currency, locale)}</td>
                <td className="px-2 py-1 text-right">{s.returnRate.toFixed(2)}%</td>
                <td className="px-2 py-1 text-right">{s.annualized.toFixed(2)}%</td>
                <td className="px-2 py-1 text-right">{s.taxRate.toFixed(1)}%</td>
                <td className="px-2 py-1 text-right">{s.feeRate.toFixed(1)}%</td>
                <td className="px-2 py-1 text-right">{s.costPercent.toFixed(1)}%</td>
                <td className="px-2 py-1 w-28" title={miniBarHelp} aria-label={miniBarHelp}>
                  <MiniBar rate={Math.max(0, Math.min(100, s.annualized))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
