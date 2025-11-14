// _components/CompoundYearTable.js
import { useMemo } from 'react';
import { formatScaledAmount } from '../lib/compound';

export default function CompoundYearTable({
  result,
  locale = 'ko-KR',
  currency = 'KRW',
  unit,
}) {
  const rows = result?.yearSummary || [];
  const baseYear = new Date().getFullYear();
  const isKo = locale.toLowerCase().startsWith('ko');

  const unitText =
    unit?.unitText || (currency === 'KRW' ? '원' : 'USD');

  const labels = useMemo(
    () =>
      isKo
        ? {
            title: '연간 요약 테이블',
            year: '연도',
            opening: '기초잔액(세후)',
            contrib: '연간 납입',
            closing: '기말잔액(세후)',
            interest: '이자(세후)',
            tax: '세금',
            csv: 'CSV 다운로드',
            empty: '데이터가 없습니다.',
            unitCap: '단위',
          }
        : {
            title: 'Yearly Summary',
            year: 'Year',
            opening: 'Opening (Net)',
            contrib: 'Contribution',
            closing: 'Closing (Net)',
            interest: 'Interest (Net)',
            tax: 'Tax',
            csv: 'Download CSV',
            empty: 'No data.',
            unitCap: 'Unit',
          },
    [isKo]
  );

  const fmt = (v) => formatScaledAmount(v, unit, locale);

  const downloadCsv = () => {
    if (!rows.length) return;

    const header = isKo
      ? ['연도', '기초잔액(세후)', '연간 납입', '기말잔액(세후)', '이자(세후)', '세금']
      : ['Year', 'Opening (Net)', 'Contribution', 'Closing (Net)', 'Interest (Net)', 'Tax'];

    const lines = [header.join(',')];

    rows.forEach((r) => {
      lines.push(
        [
          baseYear + (r.year - 1),
          r.openingBalanceNet,
          r.contributionYear,
          r.closingBalanceNet,
          r.interestYearNet,
          r.taxYear,
        ].join(',')
      );
    });

    // ✅ UTF-8 BOM 추가 + CRLF 사용 (윈도우 엑셀 호환)
    const csvContent = '\uFEFF' + lines.join('\r\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compound_year_summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-semibold">{labels.title}</h2>
        <button
          type="button"
          className="btn-secondary ml-auto text-sm"
          onClick={downloadCsv}
        >
          {labels.csv}
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-2">
        {labels.unitCap}: {unitText}
      </p>

      {!rows.length ? (
        <p className="text-sm text-slate-500">{labels.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-1 text-left">{labels.year}</th>
                <th className="px-2 py-1 text-right">
                  {labels.opening}
                </th>
                <th className="px-2 py-1 text-right">
                  {labels.contrib}
                </th>
                <th className="px-2 py-1 text-right">
                  {labels.closing}
                </th>
                <th className="px-2 py-1 text-right">
                  {labels.interest}
                </th>
                <th className="px-2 py-1 text-right">{labels.tax}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const displayYear = baseYear + (r.year - 1);
                return (
                  <tr key={r.year} className="border-t">
                    <td className="px-2 py-1">{displayYear}</td>
                    <td className="px-2 py-1 text-right">
                      {fmt(r.openingBalanceNet)}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {fmt(r.contributionYear)}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {fmt(r.closingBalanceNet)}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {fmt(r.interestYearNet)}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {fmt(r.taxYear)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
