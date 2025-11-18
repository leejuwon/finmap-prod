// _components/GoalYearTable.js
import { useMemo } from 'react';

function formatMoneyAuto(value, currency = 'KRW', locale = 'ko-KR') {
  const v = Number(value) || 0;
  const isKo = locale.toLowerCase().startsWith('ko');
  const cur = currency || 'KRW';

  if (cur === 'KRW') {
    const abs = Math.abs(v);
    let divisor = 1;
    let suffix = isKo ? '원' : 'KRW';

    if (abs >= 100_000_000) {
      divisor = 100_000_000;
      suffix = isKo ? '억원' : '×100M KRW';
    } else if (abs >= 10_000) {
      divisor = 10_000;
      suffix = isKo ? '만원' : '×10k KRW';
    }

    const scaled = v / divisor;
    const scaledAbs = Math.abs(scaled);
    const hasFraction = Math.round(scaledAbs * 10) % 10 !== 0;
    const fractionDigits = hasFraction ? 1 : 0;

    const numStr = scaled.toLocaleString(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });

    return `${numStr}${suffix}`;
  }

  const isValidCurrency =
    typeof cur === 'string' && /^[A-Z]{3}$/.test(cur);

  if (!isValidCurrency) {
    return new Intl.NumberFormat(locale).format(v);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: 2,
  }).format(v);
}

export default function GoalYearTable({
  rows = [],
  locale = 'ko-KR',
  currency = 'KRW',
  target = 0,
}) {
  const isKo = locale.toLowerCase().startsWith('ko');

  const tableTitle = useMemo(
    () =>
      isKo
        ? '연간 요약 테이블 (목표 자산 경로)'
        : 'Yearly Summary (goal path)',
    [isKo]
  );

  const unitText = isKo
    ? '단위: 원 / 만원 / 억원 자동'
    : 'Unit: auto (KRW / 10k / 100M)';

  if (!rows.length) {
    return (
      <div className="card fm-year-table">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold">{tableTitle}</h2>
        </div>
        <p className="text-sm text-slate-500">
          {isKo ? '데이터가 없습니다.' : 'No data.'}
        </p>
      </div>
    );
  }

  const stats = rows.map((r) => {
    const year = r.year;
    const invested = Number(r.invested) || 0;
    const valueNet = Number(r.valueNet) || 0;
    const valueGross = Number(r.valueGross) || 0;
    const gainNet = valueNet - invested;
    const returnRate = invested > 0 ? (valueNet / invested) * 100 : 0;
    const targetProgress =
      target > 0 ? Math.min((valueNet / target) * 100, 9999) : 0;

    return {
      year,
      invested,
      valueNet,
      valueGross,
      gainNet,
      returnRate,
      targetProgress,
    };
  });

  // ▶ 목표를 처음 달성하는 연도 찾기
  const firstGoalYear =
    target > 0
      ? (stats.find((s) => s.valueNet >= target)?.year ?? null)
      : null;

  return (
    <div className="card fm-year-table">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-semibold">{tableTitle}</h2>
        <span className="text-xs text-slate-500">{unitText}</span>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border-t">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-2 py-1 text-left">
                {isKo ? '연도' : 'Year'}
              </th>
              <th className="px-2 py-1 text-right">
                {isKo ? '누적 투자금' : 'Invested'}
              </th>
              <th className="px-2 py-1 text-right">
                {isKo ? '세후 자산' : 'Net assets'}
              </th>
              <th className="px-2 py-1 text-right">
                {isKo ? '세전 자산' : 'Gross assets'}
              </th>
              <th className="px-2 py-1 text-right">
                {isKo ? '세후 수익' : 'Net gain'}
              </th>
              <th className="px-2 py-1 text-right">
                {isKo ? '누적 수익률' : 'Total return'}
              </th>
              <th className="px-2 py-1 text-right">
                {isKo ? '목표 달성률' : 'Goal progress'}
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => {
              const isGoalYear =
                firstGoalYear !== null && s.year === firstGoalYear;

              return (
                <tr
                  key={s.year}
                  className={
                    'border-t ' + (isGoalYear ? 'bg-blue-50' : '')
                  }
                >
                  <td className="px-2 py-1 text-left">
                    {s.year}
                    {isGoalYear && (
                      <span className="ml-1 text-[10px] text-blue-600 font-medium">
                        {isKo ? '(목표 달성)' : '(Goal reached)'}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {formatMoneyAuto(s.invested, currency, locale)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {formatMoneyAuto(s.valueNet, currency, locale)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {formatMoneyAuto(s.valueGross, currency, locale)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {formatMoneyAuto(s.gainNet, currency, locale)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {s.returnRate.toFixed(2)}%
                  </td>
                  <td className="px-2 py-1 text-right">
                    {s.targetProgress.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
