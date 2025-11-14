// _components/CompoundChart.js
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const Bar = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false }
);

if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require
  require('chart.js/auto');
}

// 금액 자동 단위 포맷 (소수 .0 은 표시 안 함)
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

export default function CompoundChart({
  data,
  lumpData,
  locale = 'ko-KR',
  currency = 'KRW',
  principal = 0,
  monthly = 0,
}) {
  const rows = data?.yearSummary || [];
  const lumpRows = lumpData?.yearSummary || [];

  const labels = useMemo(
    () =>
      rows.map((r) =>
        locale.startsWith('ko') ? `${r.year}년` : `Year ${r.year}`
      ),
    [rows, locale]
  );

  const chartData = useMemo(() => {
    if (!rows.length) return null;

    const p = Number(principal) || 0;
    const m = Number(monthly) || 0;

    const principalArr = [];
    const contribArr = [];
    const interestArr = [];
    const totalArr = [];
    const investedArr = [];

    rows.forEach((r) => {
      const year = r.year;
      const closingNet = Number(r.closingBalanceNet) || 0;
      const investedTotal = p + m * 12 * year;
      const interestNet = closingNet - investedTotal;

      principalArr.push(p);
      contribArr.push(investedTotal - p);
      interestArr.push(interestNet);
      totalArr.push(closingNet);
      investedArr.push(investedTotal);
    });

    // 거치식: 연도별 세후 총자산
    const lumpTotals = lumpRows.map(
      (r) => Number(r.closingBalanceNet) || 0
    );

    const datasets = [
      {
        label: locale.startsWith('ko') ? '초기투자금' : 'Initial',
        data: principalArr,
        backgroundColor: 'rgba(37, 99, 235, 0.9)',
        stack: 'stack1',
      },
      {
        label: locale.startsWith('ko') ? '추가 투자금' : 'Additional',
        data: contribArr,
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        stack: 'stack1',
      },
      {
        label: locale.startsWith('ko') ? '세후 이자' : 'Net interest',
        data: interestArr,
        backgroundColor: 'rgba(129, 140, 248, 0.8)',
        stack: 'stack1',
      },
    ];

    if (lumpTotals.length === rows.length) {
      datasets.push({
        type: 'line',
        label: locale.startsWith('ko')
          ? '거치식 세후 총자산'
          : 'Lump-sum net total',
        data: lumpTotals,
        borderColor: 'rgba(234, 88, 12, 0.9)',
        backgroundColor: 'rgba(234, 88, 12, 0.2)',
        tension: 0.25,
        yAxisID: 'y',
        pointRadius: 3,
        fill: false,
      });
    }

    return {
      labels,
      datasets,
      _metaTotal: totalArr,
      _metaInvested: investedArr,
    };
  }, [rows, lumpRows, labels, principal, monthly, locale]);

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
              const totalNet = chartData._metaTotal[idx] || 0;

              const interestNet = totalNet - invested;
              const returnInvested =
                invested > 0 ? (totalNet / invested) * 100 : 0;

              const p = Number(principal) || 0;
              const m = Number(monthly) || 0;
              const year = idx + 1;
              const contrib = invested - p;

              const principalStr = formatMoneyAuto(
                p,
                currency,
                locale
              );
              const contribStr = formatMoneyAuto(
                contrib,
                currency,
                locale
              );
              const interestStr = formatMoneyAuto(
                interestNet,
                currency,
                locale
              );
              const totalStr = formatMoneyAuto(
                totalNet,
                currency,
                locale
              );

              if (locale.startsWith('ko')) {
                return [
                  `연도: ${year}년`,
                  `초기투자금: ${principalStr}`,
                  `추가 투자금: ${contribStr}`,
                  `세후 이자: ${interestStr}`,
                  `세후 총자산: ${totalStr} (총 투자금 대비 ${returnInvested.toFixed(
                    2
                  )}%)`,
                ];
              }

              return [
                `Year: ${year}`,
                `Initial: ${principalStr}`,
                `Additional: ${contribStr}`,
                `Net interest: ${interestStr}`,
                `Net total: ${totalStr} (vs invested ${returnInvested.toFixed(
                  2
                )}%)`,
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
    [chartData, currency, locale, principal, monthly]
  );

  if (!chartData) return null;

  return (
    <div className="h-72 sm:h-80 lg:h-96">
      <Bar data={chartData} options={options} />
    </div>
  );
}
