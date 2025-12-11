// _components/DragBreakdownChart.js
import dynamic from "next/dynamic";
import { useMemo } from "react";

function formatMoneyAuto(value, currency = 'KRW', locale = 'ko-KR') {
  const v = Number(value) || 0;
  const isKo = locale.toLowerCase().startsWith("ko");

  // ----- KRW 처리 -----
  if (currency === "KRW") {
    const abs = Math.abs(v);

    // 억 단위
    if (abs >= 100_000_000) {
      const unit = (v / 100_000_000).toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${unit}${isKo ? "억" : " ×100M KRW"}`;
    }

    // 만원 단위
    if (abs >= 10_000) {
      const unit = (v / 10_000).toLocaleString(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      return `${unit}${isKo ? "만원" : " ×10k KRW"}`;
    }

    // 기본 원 단위
    return `${v.toLocaleString(locale)}${isKo ? "원" : " KRW"}`;
  }

  // ----- 기타 통화 (USD 등) -----
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(v);
}

const Bar = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Bar),
  { ssr: false }
);

if (typeof window !== "undefined") {
  require("chart.js/auto");
}

export default function DragBreakdownChart({ data, locale='ko-KR', currency='KRW' }) {
  if (!data) return null;

  const { idealFV, netFV, taxDrag, feeDrag, compoundDrag } = data;

  const labels = [
    locale.startsWith('ko') ? "세전 미래가치" : "Ideal FV",
    locale.startsWith('ko') ? "세금 손실" : "Tax drag",
    locale.startsWith('ko') ? "수수료 손실" : "Fee drag",
    locale.startsWith('ko') ? "복리효과 상실" : "Compound loss",
    locale.startsWith('ko') ? "세후 미래가치" : "Net FV",
  ];

  const values = [
    idealFV,
    -taxDrag,
    -feeDrag,
    -compoundDrag,
    netFV,
  ];

  const background = [
    "rgba(75, 85, 99, 0.6)",      // ideal FV
    "rgba(239, 68, 68, 0.8)",     // tax drag
    "rgba(234, 179, 8, 0.8)",     // fee drag
    "rgba(99, 102, 241, 0.8)",    // compound loss
    "rgba(16, 185, 129, 0.8)",    // net FV
  ];

  const fmt = (n) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  const chartData = {
    labels,
    datasets: [
        {
        label: locale.startsWith("ko") ? "손실요인 분해" : "Drag Breakdown",
        data: [
            idealFV,
            -taxDrag,
            -feeDrag,
            -compoundDrag,
            netFV
        ],
        backgroundColor: [
            "#999999",
            "#E57373",
            "#FFB74D",
            "#7986CB",
            "#81C784",
        ],
        borderRadius: 6,
        }
    ]
    };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (ctx) => {
                    const label = ctx.dataset.label || "";
                    const value = ctx.raw || 0;
                    return `${label}: ${formatMoneyAuto(value, currency, locale)}`;
                }
            }
        }
    },
    scales: {
        x: {
            ticks: { font: { size: 12 } },
            grid: { display: false },
        },        
        y: {
            ticks: {
            callback: (v) => formatMoneyAuto(v, currency, locale),
            },
        },        
    },
    };

  return (
    <div className="h-72 overflow-x-auto">
        <Bar data={chartData} options={options} />
    </div>
  );
}
