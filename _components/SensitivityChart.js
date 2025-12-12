import dynamic from "next/dynamic";
import { useMemo } from "react";
const Line = dynamic(() => import("react-chartjs-2").then(m => m.Line), { ssr: false });

if (typeof window !== "undefined") {
  require("chart.js/auto");
}

// --- 자동 단위 포맷 ---
function formatMoneyAuto(value, currency = "KRW", locale = "ko-KR") {
  const v = Number(value) || 0;
  const abs = Math.abs(v);
  const isKo = locale.startsWith("ko");

  if (currency === "KRW") {
    if (abs >= 100_000_000) {
      return (
        (v / 100_000_000).toLocaleString(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + (isKo ? "억" : " ×100M KRW")
      );
    }
    if (abs >= 10_000) {
      return (
        (v / 10_000).toLocaleString(locale, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }) + (isKo ? "만원" : " ×10k KRW")
      );
    }
    return `${v.toLocaleString(locale)}${isKo ? "원" : " KRW"}`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(v);
}

export default function SensitivityChart({
  rateData,
  feeData,
  taxData,
  locale = "ko-KR",
  currency = "KRW",
}) {
  // ① labels 만들기 (변동값 표시)
  const labels = useMemo(
    () => rateData.map((d) => `${d.delta}%`),
    [rateData]
  );

  // ② dataset.data → 숫자 배열로 변환
  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "수익률 변화",
          data: rateData.map((d) => d.fvNet),
          borderColor: "rgba(59,130,246,0.9)",
          backgroundColor: "rgba(59,130,246,0.4)",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
        },
        {
          label: "수수료 변화",
          data: feeData.map((d) => d.fvNet),
          borderColor: "rgba(234,88,12,0.9)",
          backgroundColor: "rgba(234,88,12,0.4)",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
        },
        {
          label: "세율 변화",
          data: taxData.map((d) => d.fvNet),
          borderColor: "rgba(16,185,129,0.9)",
          backgroundColor: "rgba(16,185,129,0.4)",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
        },
      ],
    }),
    [labels, rateData, feeData, taxData]
  );

  // ③ y축 자동 단위 포맷
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          ticks: { color: "#555", font: { size: 12 } },
          grid: { display: false },
        },
        y: {
          ticks: {
            callback: (v) => formatMoneyAuto(v, currency, locale),
            font: { size: 12 },
          },
        },
      },
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: (ctx) => formatMoneyAuto(ctx.raw, currency, locale),
          },
        },
      },
    }),
    [currency, locale]
  );

  return (
    <div className="w-full h-96 px-2 pb-4 overflow-x-auto">
      <Line data={chartData} options={options} />
    </div>
  );
}
