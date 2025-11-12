// _components/CompoundChart.js
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// ✅ dynamic은 "그 자체로 컴포넌트"를 반환합니다 (구조분해 ❌)
const Line = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Line),
  { ssr: false }
);

// ✅ chart.js 레지스트리 등록 (클라이언트에서만)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require
  require('chart.js/auto');
}

export default function CompoundChart({ data, locale = 'ko-KR' }) {
  const chartData = useMemo(() => {
    if (!data?.series?.length) return null;

    const labels = data.series.map(r => `${Math.ceil(r.month / 12)}y`);
    const everyN = Math.ceil(labels.length / 12);
    const displayLabels = labels.map((l, idx) => (idx % everyN === 0 ? l : ''));

    return {
      labels: displayLabels,
      datasets: [
        {
          label: locale.startsWith('ko') ? '총 자산' : 'Total Value',
          data: data.series.map(r => r.balance),
          borderWidth: 2,
          tension: 0.25,
        },
      ],
    };
  }, [data, locale]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      y: {
        ticks: { callback: (v) => Intl.NumberFormat(locale).format(v) },
      },
    },
  }), [locale]);

  if (!chartData) return null;

  return (
    <div className="h-64 sm:h-80 lg:h-96">
      <Line data={chartData} options={options} />
    </div>
  );
}
