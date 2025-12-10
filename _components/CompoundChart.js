// _components/CompoundChart.js
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const Bar = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false }
);

if (typeof window !== 'undefined') {
  require('chart.js/auto');
}

// -----------------------------
// 금액 자동 단위 포맷
// -----------------------------
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
      return `${(v / divisor).toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}${suffix}`;
    } else if (abs >= 10_000) {
      divisor = 10_000;
      suffix = isKo ? '만원' : '×10k KRW';
      const scaled = v / divisor;
      const frac = Math.round(Math.abs(scaled) * 10) % 10 !== 0 ? 1 : 0;
      return `${scaled.toLocaleString(locale, {
        minimumFractionDigits: frac,
        maximumFractionDigits: frac,
      })}${suffix}`;
    }

    return `${v.toLocaleString(locale)}${suffix}`;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
  }).format(v);
}

export default function CompoundChart({
  data,              // calcCompound()
  lumpData,          // calcSimpleLump()
  idealData,         // calcCompoundNoTaxFee() 추가됨
  locale = 'ko-KR',
  currency = 'KRW',
  principal = 0,
  monthly = 0,
}) {
  const rows = data?.yearSummary || [];
  const lumpRows = lumpData?.yearSummary || [];
  const idealRows = idealData?.yearSummary || [];

  // -----------------------------
  // X축 라벨: 1년, 2년...
  // -----------------------------
  const labels = useMemo(
    () =>
      rows.map((r) =>
        locale.startsWith('ko') ? `${r.year}년` : `Year ${r.year}`
      ),
    [rows, locale]
  );

  // -----------------------------
  // 메타 데이터 계산
  // -----------------------------
  const chartData = useMemo(() => {
    if (!rows.length) return null;

    const p = Number(principal) || 0;
    const m = Number(monthly) || 0;

    const principalArr = [];
    const contribArr = [];
    const interestArr = [];
    const totalArr = [];
    const investedArr = [];
    const idealTotals = [];

    rows.forEach((r, idx) => {
      const year = r.year;
      const closingNet = Number(r.closingBalanceNet) || 0;
      const investedTotal = p + m * 12 * year;
      const interestNet = closingNet - investedTotal;

      principalArr.push(p);
      contribArr.push(investedTotal - p);
      interestArr.push(interestNet);
      totalArr.push(closingNet);
      investedArr.push(investedTotal);

      // 세금·수수료 미적용 라인
      if (idealRows[idx]) {
        idealTotals.push(Number(idealRows[idx].closingBalanceNet) || 0);
      }
    });

    // 단리식 라인
    const lumpTotals = lumpRows.map((r) => Number(r.closingBalanceNet) || 0);

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

    // -----------------------------
    // 세금·수수료 미적용 라인 (이상치, Ideal)
    // -----------------------------
    if (idealTotals.length === rows.length) {
      datasets.push({
        type: 'line',
        label: locale.startsWith('ko')
          ? '세금·수수료 미적용'
          : 'Ideal (no tax/fee)',
        data: idealTotals,
        borderColor: 'rgba(100,100,100,0.8)',
        backgroundColor: 'rgba(100,100,100,0.15)',
        tension: 0.25,
        yAxisID: 'y',
        pointRadius: 2,
        borderDash: [4, 4],
        fill: false,
      });
    }

    // -----------------------------
    // 단리식 라인
    // -----------------------------
    if (lumpTotals.length === rows.length) {
      datasets.push({
        type: 'line',
        label: locale.startsWith('ko')
          ? '거치식 세후 총자산'
          : 'Lump-sum net total',
        data: lumpTotals,
        borderColor: 'rgba(234, 88, 12, 0.9)',
        backgroundColor: 'rgba(234, 88, 12, 0.15)',
        tension: 0.25,
        yAxisID: 'y',
        pointRadius: 3,
        fill: false,
      });
    }

    return {
      labels,
      datasets,

      // Tooltip에서 사용
      _metaTotal: totalArr,
      _metaInvested: investedArr,
      _metaIdeal: idealTotals,
    };
  }, [rows, lumpRows, idealRows, labels, principal, monthly, locale]);

  // -----------------------------
  // 차트 옵션
  // -----------------------------
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          padding: 10,
          callbacks: {
            label: () => '',
            afterBody: (items) => {
              if (!items.length || !chartData) return [];
              const i = items[0].dataIndex;

              const invested = chartData._metaInvested[i] || 0;
              const net = chartData._metaTotal[i] || 0;
              const ideal = chartData._metaIdeal?.[i] || null;

              const netInterest = net - invested;
              const returnRate = invested > 0 ? (net / invested) * 100 : 0;

              const idealDiff = ideal ? ideal - net : 0;

              const p = Number(principal) || 0;
              const m = Number(monthly) || 0;
              const year = i + 1;
              const contrib = invested - p;

              const f = (v) => formatMoneyAuto(v, currency, locale);

              const lines = [];

              if (locale.startsWith('ko')) {
                lines.push(`연도: ${year}년`);
                lines.push(`초기투자금: ${f(p)}`);
                lines.push(`추가 투자금: ${f(contrib)}`);
                lines.push(`세후 이자: ${f(netInterest)}`);
                lines.push(`세후 총자산: ${f(net)} (수익률 ${returnRate.toFixed(2)}%)`);

                if (ideal) {
                  lines.push(`세전 기준: ${f(ideal)}`);
                  lines.push(`세금·수수료 영향: ${f(idealDiff)}`);
                }
              } else {
                lines.push(`Year: ${year}`);
                lines.push(`Initial: ${f(p)}`);
                lines.push(`Additional: ${f(contrib)}`);
                lines.push(`Net interest: ${f(netInterest)}`);
                lines.push(`Net total: ${f(net)} (${returnRate.toFixed(2)}%)`);

                if (ideal) {
                  lines.push(`Ideal (no tax/fee): ${f(ideal)}`);
                  lines.push(`Tax/Fee drag: ${f(idealDiff)}`);
                }
              }
              return lines;
            },
          },
        },
      },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          ticks: {
            callback: (v) => formatMoneyAuto(v, currency, locale),
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
