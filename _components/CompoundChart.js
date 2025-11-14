// _components/CompoundChart.js
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Chart.js dynamic import
const Bar = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Bar),
  { ssr: false }
);

if (typeof window !== 'undefined') {
  require('chart.js/auto');
}

export default function CompoundChart({ data, locale = 'ko-KR', unit }) {
  if (!data?.series || !unit) return null;

  // ---- 1) Label 생성 (년도 단위) ----
  const labels = data.series
    .filter(r => r.month % 12 === 0)
    .map(r => `${r.yearLabel || `${Math.ceil(r.month / 12)}년`}`);

  const chartData = useMemo(() => {
    if (!data.yearSummary) return null;

    return {
      labels,
      datasets: [
        {
          label: locale.startsWith('ko') ? '초기투자금' : 'Initial Principal',
          data: data.yearSummary.map((r) => r.openingBalanceNet / unit.divisor),
          backgroundColor: '#4F6EF7',
          stack: 'total',
        },
        {
          label: locale.startsWith('ko') ? '추가투자금' : 'Additional Deposit',
          data: data.yearSummary.map((r) => r.contributionYear / unit.divisor),
          backgroundColor: '#6AD590',
          stack: 'total',
        },
        {
          label: locale.startsWith('ko') ? '세후 총자산' : 'Net Balance',
          data: data.yearSummary.map((r) => r.closingBalanceNet / unit.divisor),
          backgroundColor: '#9BB5FF',
          stack: 'total',
        },
      ],
    };
  }, [data, locale, unit]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
      },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          ticks: {
            callback: (value) =>
              new Intl.NumberFormat(locale).format(value),
          },
        },
      },
    }),
    [locale]
  );

  if (!chartData) return null;

  return (
    <div className="h-72 sm:h-96 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
