// _components/DcaYearTable.js
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
    ? '단위: 원 / 만원 / 억원 자동 · 가격 지수는 시작 100 기준'
    : 'Unit: auto (KRW / 10k / 100M) · price index starts at 100';

  let peakNet = 0;
  const stats = rows.map((r) => {
    const invested = Number(r.invested) || 0;
    const net = Number(r.valueNet) || 0;
    const gross = Number(r.valueGross) || 0; // 세전 자산 (가정)
    const contrib = Number(r.contributionYear) || 0;

    const gain = net - invested;             // 세후 수익(누적)
    const taxFeeImpact = gross - net;        // 세금+수수료로 인해 줄어든 자산(가정)
    const returnRate = invested > 0 ? (net / invested - 1) * 100 : 0;
    peakNet = Math.max(peakNet, net);
    const fallbackDrawdownPct =
      peakNet > 0 ? Math.abs(Math.min(0, net / peakNet - 1)) * 100 : 0;

    return {
      year: r.year,
      periodLabel: r.periodLabel || '',
      invested,
      net,
      gross,
      contrib,
      gain,
      taxFeeImpact,
      returnRate,
      averageCost: Number(r.averageCost) || 0,
      priceProxy: Number(r.priceProxy) || 0,
      modelDrawdownPct:
        r.modelDrawdownPct === undefined || r.modelDrawdownPct === null
          ? fallbackDrawdownPct
          : Number(r.modelDrawdownPct) || 0,
    };
  });

  const downloadCsv = () => {
    if (!stats.length) return;

    const header = [
      'year',
      'periodEnd',
      'contributionYear',
      'investedTotal',
      'netAssets',
      'netGain',
      'taxFeeImpact',
      'returnRate',
      'averageCost',
      'priceIndex',
      'simpleModelDrawdownPct',
    ];
    const lines = [header.join(',')];

    stats.forEach((s) => {
      lines.push(
        [
          s.year,
          s.periodLabel,
          s.contrib,
          s.invested,
          s.net,
          s.gain,
          s.taxFeeImpact,
          s.returnRate,
          s.averageCost,
          s.priceProxy,
          s.modelDrawdownPct,
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
      <div className="card min-w-0 max-w-full">
        <div className="mb-2 flex min-w-0 flex-wrap items-center gap-3">
          <h2 className="break-words text-xl font-semibold leading-snug">{tableTitle}</h2>
        </div>
        <p className="text-sm text-slate-500">
          {isKo ? '데이터가 없습니다.' : 'No data.'}
        </p>
      </div>
    );
  }

  return (
    <div className="card min-w-0 max-w-full">
      <div className="mb-2 flex min-w-0 flex-wrap items-center gap-3">
        <h2 className="break-words text-xl font-semibold leading-snug">{tableTitle}</h2>
        <span className="break-words text-[11px] text-slate-500 sm:text-xs">
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

      <div className="w-full min-w-0 max-w-full overflow-x-auto">
        <table className="min-w-[1120px] border-t">
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
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '평균 매수단가' : 'Average cost'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '가격 지수' : 'Price index'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '단순 모델 낙폭' : 'Simple model drawdown'}
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.year} className="border-t">
                <td className="px-2 py-1 text-left whitespace-nowrap">
                  {s.periodLabel ? `${s.year} (${s.periodLabel})` : s.year}
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
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {s.averageCost.toFixed(2)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {s.priceProxy.toFixed(2)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {s.modelDrawdownPct.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
