// _components/DCAYearTable.js
import { formatMoneyAuto } from '../lib/money';

export default function DCAYearTable({
  rows = [],
  locale = 'ko-KR',
  currency = 'KRW',
  title,
}) {
  const isKo = locale.startsWith('ko');

  const tableTitle =
    title ||
    (isKo
      ? '연도별 적립식 투자 요약 (DCA)'
      : 'Yearly DCA investment summary');

  const unitText = isKo
    ? '단위: 원 / 만원 / 억원 자동'
    : 'Unit: auto (KRW / 10k / 100M)';

  const stats = rows.map((r) => {
    const invested = Number(r.invested) || 0;
    const net = Number(r.valueNet) || 0;
    const gross = Number(r.valueGross) || 0; // 세전 자산 (가정)
    const contrib = Number(r.contributionYear) || 0;

    const gain = net - invested;             // 세후 수익(누적)
    const taxFeeImpact = gross - net;        // 세금+수수료로 인해 줄어든 자산(가정)
    const returnRate = invested > 0 ? (net / invested) * 100 : 0;

    return {
      year: r.year,
      invested,
      net,
      gross,
      contrib,
      gain,
      taxFeeImpact,
      returnRate,
    };
  });

  const downloadCsv = () => {
    if (!stats.length) return;

    const header = [
      'year',
      'contributionYear',
      'investedTotal',
      'netAssets',
      'netGain',
      'taxFeeImpact',
      'returnRate',
    ];
    const lines = [header.join(',')];

    stats.forEach((s) => {
      lines.push(
        [
          s.year,
          s.contrib,
          s.invested,
          s.net,
          s.gain,
          s.taxFeeImpact,
          s.returnRate,
        ].join(',')
      );
    });

    const blob = new Blob(['\uFEFF' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dca_year_summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!stats.length) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold">{tableTitle}</h2>
        </div>
        <p className="text-sm text-slate-500">
          {isKo ? '데이터가 없습니다.' : 'No data.'}
        </p>
      </div>
    );
  }

  return (
    <div className="card">
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
          {isKo ? 'CSV 다운로드' : 'Download CSV'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[880px] border-t">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-2 py-1 text-left whitespace-nowrap">
                {isKo ? '연도' : 'Year'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '연간 납입' : 'Contribution / year'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '누적 투자금' : 'Invested total'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '세후 자산' : 'Net assets'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '세후 수익' : 'Net gain'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '세금+수수료 효과' : 'Tax + fee impact'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo
                  ? '누적 수익률(세후)'
                  : 'Cum. return (net)'}
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.year} className="border-t">
                <td className="px-2 py-1 text-left whitespace-nowrap">
                  {s.year}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.contrib, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.invested, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.net, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.gain, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.taxFeeImpact, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {s.returnRate.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
