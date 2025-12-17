// _components/CompoundYearTable.js
import { useMemo } from "react";

// -----------------------------
// 금액 자동 단위 포맷
// -----------------------------
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
      suffix = isKo ? "억원" : "×100M KRW";
      return `${(v / divisor).toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}${suffix}`;
    } else if (abs >= 10_000) {
      divisor = 10_000;
      suffix = isKo ? "만원" : "×10k KRW";
      const scaled = v / divisor;
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
      <div
        className="bg-emerald-500 h-2 rounded"
        style={{ width: `${width}%` }}
      />
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
}) {
  const rows = result?.yearSummary || [];

  const tableTitle = useMemo(() => {
    if (title) return title;
    return locale.startsWith("ko") ? "연간 요약 테이블" : "Yearly Summary";
  }, [title, locale]);

  const unitText = locale.startsWith("ko")
    ? "단위: 원 / 만원 / 억원 자동 변환"
    : "Unit: auto (KRW / 10k / 100M)";

  const isKo = locale.startsWith("ko");

  const miniBarHelp = isKo
    ? "Mini bar는 ‘연환산 수익률’을 0~100% 범위로 잘라(캡) 막대 길이로 보여주는 간단한 게이지입니다. 연환산 수익률 = (해당 연도 세후 이자 ÷ 연초 잔액) × 100"
    : "Mini bar is a simple gauge showing ‘annualized return’ as a bar, capped to 0–100%. Annualized return = (net interest of the year ÷ opening balance) × 100.";


  // =====================================================
  // 연도별 통계 계산 (강화 버전)
  // =====================================================
  const stats = useMemo(() => {
    return rows.map((r, idx) => {
      const year = r.year;
      const opening = Number(r.openingBalanceNet) || 0;
      const closing = Number(r.closingBalanceNet) || 0;

      const contribRaw = Number(r.contributionYear) || 0;
      const contribDisplay =
        year === 1 ? Number(principal) + contribRaw : contribRaw;

      const interestNet = Number(r.interestYearNet) || 0;

      const taxYear = Number(r.taxYear) || 0;
      const feeYear = Number(r.feeYear) || 0;
      const taxFeeTotal = taxYear + feeYear;

      const investedTotal =
        Number(principal) + Number(monthly) * 12 * year;

      const returnRate =
        investedTotal > 0 ? (closing / investedTotal) * 100 : 0;

      // 연환산 수익률
      const annualized =
        opening > 0 ? (interestNet / opening) * 100 : 0;

      // 세금/수수료 차감률
      const grossInterest =
        Number(r.interestYearGross) || interestNet + taxFeeTotal;

      const taxRate =
        grossInterest > 0 ? (taxYear / grossInterest) * 100 : 0;

      const feeRate =
        grossInterest > 0 ? (feeYear / grossInterest) * 100 : 0;

      const costPercent =
        grossInterest > 0 ? (taxFeeTotal / grossInterest) * 100 : 0;

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

  // =====================================================
  // 렌더링
  // =====================================================
  if (!stats.length) {
    return (
      <div className="card fm-year-table">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold">{tableTitle}</h2>
        </div>
        <p className="text-sm text-slate-500">
          {locale.startsWith("ko") ? "데이터가 없습니다." : "No data."}
        </p>
      </div>
    );
  }

  return (
    <div className="card fm-year-table">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-semibold">{tableTitle}</h2>
        <span className="text-[11px] sm:text-xs text-slate-500">
          {unitText} 
        </span>
        <button
          type="button"
          className="btn-secondary ml-auto text-xs sm:text-sm"
          onClick={downloadCsv}
        >
          {locale.startsWith("ko") ? "CSV 다운로드" : "Download CSV"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] border-t">
          <thead className="bg-slate-50 text-xs whitespace-nowrap">
            <tr>
              <th className="px-2 py-1 text-left">연도</th>
              <th className="px-2 py-1 text-right">연간 납입</th>
              <th className="px-2 py-1 text-right">기말잔액</th>
              <th className="px-2 py-1 text-right">세후 이자</th>
              <th className="px-2 py-1 text-right">세금+수수료</th>

              <th className="px-2 py-1 text-right">누적 투자금</th>
              <th className="px-2 py-1 text-right">누적 수익률</th>

              <th className="px-2 py-1 text-right">연환산 수익률</th>
              <th className="px-2 py-1 text-right">세금 비중</th>
              <th className="px-2 py-1 text-right">수수료 비중</th>
              <th className="px-2 py-1 text-right">총 비용 비중</th>

              <th className="px-2 py-1 text-left">
                <span className="inline-flex items-center gap-1">
                  Mini bar
                  <span
                    className="text-slate-400 cursor-help"
                    title={miniBarHelp}
                    aria-label={miniBarHelp}
                  >
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

                <td className="px-2 py-1 text-right">
                  {formatMoneyAuto(s.contrib, currency, locale)}
                </td>

                <td className="px-2 py-1 text-right">
                  {formatMoneyAuto(s.closing, currency, locale)}
                </td>

                <td className="px-2 py-1 text-right">
                  {formatMoneyAuto(s.interestNet, currency, locale)}
                </td>

                <td className="px-2 py-1 text-right">
                  {formatMoneyAuto(s.taxFee, currency, locale)}
                </td>

                <td className="px-2 py-1 text-right">
                  {formatMoneyAuto(s.investedTotal, currency, locale)}
                </td>

                <td className="px-2 py-1 text-right">
                  {s.returnRate.toFixed(2)}%
                </td>

                <td className="px-2 py-1 text-right">
                  {s.annualized.toFixed(2)}%
                </td>

                <td className="px-2 py-1 text-right">
                  {s.taxRate.toFixed(1)}%
                </td>

                <td className="px-2 py-1 text-right">
                  {s.feeRate.toFixed(1)}%
                </td>

                <td className="px-2 py-1 text-right">
                  {s.costPercent.toFixed(1)}%
                </td>

                <td className="px-2 py-1 w-28" title={miniBarHelp} aria-label={miniBarHelp}>
                  <MiniBar rate={Math.max(0, Math.min(100, s.annualized))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
