ScenarioChart.js// _components/ScenarioChart.js
import dynamic from "next/dynamic";
import { useMemo } from "react";

const Line = dynamic(() => import("react-chartjs-2").then((m) => m.Line), {
  ssr: false,
});

if (typeof window !== "undefined") {
  require("chart.js/auto");
}

// y축 단위: 만(1자리) / 억(2자리) + 나머지 원
function formatMoneyAuto(value, currency = "KRW", locale = "ko-KR") {
  const v = Number(value) || 0;
  const abs = Math.abs(v);
  const isKo = String(locale).toLowerCase().startsWith("ko");

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

export default function ScenarioChart({ monthsTotal = 0, results = [], locale = "ko-KR", currency = "KRW" }) {
  const labels = useMemo(() => {
    if (!monthsTotal) return [];
    // 1..N (x축은 12개월마다만 표시)
    return Array.from({ length: monthsTotal }, (_, i) => String(i + 1));
  }, [monthsTotal]);

    const chartData = useMemo(() => {

        const styleByKey = {
        conservative: {
        borderColor: "rgba(100,116,139,0.95)",   // slate
        backgroundColor: "rgba(100,116,139,0.15)",
        borderDash: [6, 6],                      // 점선
        },
        base: {
        borderColor: "rgba(59,130,246,0.95)",    // blue
        backgroundColor: "rgba(59,130,246,0.12)",
        borderDash: [],                          // 실선
        },
        aggressive: {
        borderColor: "rgba(16,185,129,0.95)",    // green
        backgroundColor: "rgba(16,185,129,0.12)",
        borderDash: [2, 0],                      // 실선(그대로)
        },
    };

    const ds = results.map((r) => {
        const s = styleByKey[r.key] || {};
        return {
        label: `${r.title} (${r.annualRate.toFixed(1)}%)`,
        data: r.seriesNet,

        // ✅ 구분 포인트
        borderColor: s.borderColor,
        backgroundColor: s.backgroundColor,
        borderDash: s.borderDash,

        fill: false,
        tension: 0.25,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        };
    });

    return { labels, datasets: ds };
  }, [labels, results]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            autoSkip: false,
            callback: (value) => {
              // value는 label (문자열 month)
              const m = Number(value);
              if (!m) return "";
              return m % 12 === 0 ? `${m / 12}y` : "";
            },
          },
          grid: { display: false },
        },
        y: {
          ticks: {
            callback: (v) => formatMoneyAuto(v, currency, locale),
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
    <div className="w-full h-96">
      <Line data={chartData} options={options} />
    </div>
  );
}
