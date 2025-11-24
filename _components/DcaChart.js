// _components/DCAChart.js
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { formatMoneyAuto } from '../lib/money';

const Bar = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false }
);

if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require
  require('chart.js/auto');
}

export default function DCAChart({
  data,
  locale = 'ko-KR',
  currency = 'KRW',
}) {
  const rows = data || [];

  const labels = useMemo(
    () =>
      rows.map((r) =>
        locale.startsWith('ko') ? `${r.year}년` : `Year ${r.year}`
      ),
    [rows, locale]
  );

  const chartData = useMemo(() => {
    if (!rows.length) return null;

    const investedArr = rows.map((r) => Number(r.invested) || 0);
    const netArr = rows.map((r) => Number(r.valueNet) || 0);
    const gainArr = netArr.map((v, i) => v - investedArr[i]);

    return {
      labels,
      datasets: [
        {
          label: locale.startsWith('ko') ? '누적 투자금' : 'Total invested',
          data: investedArr,
          backgroundColor: 'rgba(37, 99, 235, 0.9)',
          stack: 'stack1',
        },
        {
          label: locale.startsWith('ko') ? '세후 수익' : 'Net gain',
          data: gainArr,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          stack: 'stack1',
        },
        {
          type: 'line',
          label: locale.startsWith('ko')
            ? '세후 자산(누적)'
            : 'Net assets (cumulative)',
          data: netArr,
          borderColor: 'rgba(234, 88, 12, 0.9)',
          backgroundColor: 'rgba(234, 88, 12, 0.2)',
          tension: 0.25,
          yAxisID: 'y',
          pointRadius: 3,
          fill: false,
        },
      ],
      _metaInvested: investedArr,
      _metaNet: netArr,
      _metaGain: gainArr,
    };
  }, [rows, labels, locale]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: () => '',
            afterBody: (items) => {
              if (!items.length || !chartData) return [];
              const idx = items[0].dataIndex;

              const invested = chartData._metaInvested[idx] || 0;
              const net = chartData._metaNet[idx] || 0;
              const gain = chartData._metaGain[idx] || 0;
              const returnRate =
                invested > 0 ? (net / invested) * 100 : 0;
              const year = idx + 1;

              const invStr = formatMoneyAuto(
                invested,
                currency,
                locale
              );
              const netStr = formatMoneyAuto(net, currency, locale);
              const gainStr = formatMoneyAuto(gain, currency, locale);

              if (locale.startsWith('ko')) {
                return [
                  `연도: ${year}년`,
                  `누적 투자금: ${invStr}`,
                  `세후 자산: ${netStr}`,
                  `세후 수익: ${gainStr}`,
                  `누적 수익률: ${returnRate.toFixed(2)}%`,
                ];
              }

              return [
                `Year: ${year}`,
                `Total invested: ${invStr}`,
                `Net assets: ${netStr}`,
                `Net gain: ${gainStr}`,
                `Cum. return: ${returnRate.toFixed(2)}%`,
              ];
            },
          },
        },
      },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          ticks: {
            callback: (value) =>
              formatMoneyAuto(value, currency, locale),
          },
        },
      },
    }),
    [chartData, currency, locale]
  );

  if (!chartData) return null;

  return (
    <div className="h-72 sm:h-80 lg:h-96">
      <Bar data={chartData} options={options} />
    </div>
  );
}
