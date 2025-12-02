// _components/FireYearTable.js
import React from 'react';

// 차트와 동일한 포맷터
function formatKrwHuman(value, withWon = true) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);

  if (abs >= 100_000_000) {
    const v = n / 100_000_000;
    return `${v.toFixed(2)}억원`;
  }
  if (abs >= 10_000_000) {
    const v = n / 10_000_000;
    return `${v.toFixed(1)}천만원`;
  }
  if (abs >= 10_000) {
    const v = n / 10_000;
    return `${v.toFixed(0)}만원`;
  }
  const base = n.toLocaleString('ko-KR');
  return withWon ? `${base}원` : base;
}

export default function FireYearTable({
  timeline = [],
  locale = 'ko-KR',
  currency = 'KRW',
  meta,
}) {
  const isKo = locale.startsWith('ko');
  if (!timeline || timeline.length === 0) return null;

  const unitText = isKo
    ? '금액: 천만원 이상은 소수점 1자리, 억 이상은 소수점 2자리로 표시됩니다.'
    : 'Amounts use compact units for readability.';

  return (
    <section className="fire-year-table">
      <div className="table-header">
        <h2>{isKo ? '연도별 FIRE 시뮬레이션' : 'Yearly FIRE simulation'}</h2>
        <p className="unit">{unitText}</p>
      </div>

      {/* 검색 조건 요약 */}
      {meta && (
        <div className="mb-2 text-xs md:text-sm text-slate-600 space-y-1">
          <div>
            <strong>{isKo ? '저축:' : 'Savings:'}</strong>{' '}
            {isKo ? (
              <>
                월 {formatKrwHuman((meta.monthlyContribution || 0) * 10_000)} /
                연{' '}
                {formatKrwHuman((meta.annualContribution || 0) * 10_000)}
              </>
            ) : (
              <>
                Monthly {meta.monthlyContribution?.toLocaleString(locale)} / Yearly{' '}
                {meta.annualContribution?.toLocaleString(locale)}
              </>
            )}
          </div>
          <div>
            <strong>{isKo ? '세금·수수료·인플레이션:' : 'Tax / fee / inflation:'}</strong>{' '}
            {`${meta.taxRatePct || 0}% / ${meta.feeRatePct || 0}% / ${
              meta.inflationPct || 0
            }%`}
            {meta.netRealReturn != null && (
              <>
                {' '}
                ·{' '}
                {isKo ? '실질 세후 수익률' : 'after-tax real return'}{' '}
                {((meta.netRealReturn || 0) * 100).toFixed(2)}%
              </>
            )}
          </div>
        </div>
      )}

      <div className="fm-year-table">
        <table>
          <thead>
            <tr>
              <th>{isKo ? '연차' : 'Year'}</th>
              <th>{isKo ? '구간' : 'Phase'}</th>
              <th>{isKo ? '저축/인출' : 'Contribution / Withdrawal'}</th>
              <th>{isKo ? '연말 자산' : 'Assets (end of year)'}</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((row) => {
              const isAcc = row.phase === 'accumulation';
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
                        ? '적립'
                        : 'Accumulation'
                      : isKo
                      ? '은퇴'
                      : 'Retirement'}
                  </td>
                  <td>
                    {isKo
                      ? contrib
                        ? formatKrwHuman(contrib)
                        : '-'
                      : contrib
                      ? contrib.toLocaleString(locale)
                      : '-'}
                  </td>
                  <td>
                    {isKo
                      ? formatKrwHuman(row.asset)
                      : row.asset.toLocaleString(locale)}
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
