// _components/FireYearTable.js — UPDATED for real/nominal assets

import React from "react";

function formatKrwHuman(value, withWon = true) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);

  if (abs >= 100_000_000) return `${(n / 100_000_000).toFixed(2)}억`;
  if (abs >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}천만`;
  if (abs >= 10_000) return `${(n / 10_000).toFixed(0)}만`;

  const base = n.toLocaleString("ko-KR");
  return withWon ? `${base}원` : base;
}

export default function FireYearTable({
  timeline = [],
  locale = "ko-KR",
  currency = "KRW",
  meta,
}) {
  const isKo = locale.startsWith("ko");
  if (!timeline || timeline.length === 0) return null;

  const unitText = isKo
    ? "금액: 실질/명목 자산을 함께 비교합니다."
    : "Amounts display real and nominal assets.";

  return (
    <section className="fire-year-table">
      <div className="table-header">
        <h2>{isKo ? "연도별 FIRE 시뮬레이션" : "Yearly FIRE Simulation"}</h2>
        <p className="unit">{unitText}</p>
      </div>

      <div className="fm-year-table">
        <table>
          <thead>
            <tr>
              <th>{isKo ? "연차" : "Year"}</th>
              <th>{isKo ? "구간" : "Phase"}</th>
              <th>{isKo ? "저축/인출" : "Contribution / Withdrawal"}</th>
              <th>{isKo ? "자산(실질)" : "Real assets"}</th>
              <th>{isKo ? "자산(명목)" : "Nominal assets"}</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((row) => {
              const isAcc = row.phase === "accumulation";
              const contrib =
                isAcc && row.contributionYear
                  ? row.contributionYear
                  : !isAcc && row.withdrawal
                  ? row.withdrawal
                  : 0;

              return (
                <tr key={`${row.phase}-${row.year}`}>
                  <td>{row.year}</td>

                  <td>
                    {isAcc
                      ? isKo
                        ? "적립"
                        : "Accumulation"
                      : isKo
                      ? "은퇴"
                      : "Retirement"}
                  </td>

                  <td>
                    {contrib
                      ? isKo
                        ? formatKrwHuman(contrib)
                        : contrib.toLocaleString(locale)
                      : "-"}
                  </td>

                  {/* 실질 자산 */}
                  <td>
                    {isKo
                      ? formatKrwHuman(row.assetReal)
                      : row.assetReal.toLocaleString(locale)}
                  </td>

                  {/* 명목 자산 */}
                  <td>
                    {isKo
                      ? formatKrwHuman(row.assetNominal)
                      : row.assetNominal.toLocaleString(locale)}
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
