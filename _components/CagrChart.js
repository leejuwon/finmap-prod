// _components/CagrChart.js
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const Line = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line),
  { ssr: false }
);

if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require
  require('chart.js/auto');
}

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

export default function CagrChart({
  result,
  locale = 'ko-KR',
  currency = 'KRW',
}) {
  const rows = result?.yearSummary || [];
  const labels = useMemo(
    () =>
      rows.map((r) =>
        locale.startsWith('ko') ? `${r.year}년` : `Year ${r.year}`
      ),
    [rows, locale]
  );

  const chartData = useMemo(() => {
    if (!rows.length) return null;

    const grossArr = rows.map((r) => Number(r.grossValue) || 0);
    const netArr = rows.map((r) => Number(r.netValue) || 0);

    return {
      labels,
      datasets: [
        {
          label: locale.startsWith('ko')
            ? '세전 자산(추정)'
            : 'Gross (before tax/fee)',
          data: grossArr,
          borderColor: 'rgba(59, 130, 246, 0.9)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.25,
        },
        {
          label: locale.startsWith('ko')
            ? '세후 자산'
            : 'Net (after tax/fee)',
          data: netArr,
          borderColor: 'rgba(16, 185, 129, 0.9)',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          tension: 0.25,
        },
      ],
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
            label: (ctx) => {
              const val = ctx.parsed.y;
              return formatMoneyAuto(val, currency, locale);
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) =>
              formatMoneyAuto(value, currency, locale),
          },
        },
      },
    }),
    [currency, locale]
  );

  if (!chartData) return null;

  return (
    <div className="h-72 sm:h-80 lg:h-96">
      <Line data={chartData} options={options} />
    </div>
  );
}
