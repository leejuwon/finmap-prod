// _components/ScenarioChart.js
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

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ScenarioChart({
  monthsTotal = 0,
  results = [],
  locale = "ko-KR",
  currency = "KRW",
}) {
  const isKo = String(locale).toLowerCase().startsWith("ko");

  const labels = useMemo(() => {
    if (!monthsTotal) return [];
    // 1..N
    return Array.from({ length: monthsTotal }, (_, i) => String(i + 1));
  }, [monthsTotal]);

  const chartData = useMemo(() => {
    const styleByKey = {
      conservative: {
        borderColor: "rgba(100,116,139,0.95)", // slate
        backgroundColor: "rgba(100,116,139,0.15)",
        borderDash: [6, 6],
      },
      base: {
        borderColor: "rgba(59,130,246,0.95)", // blue
        backgroundColor: "rgba(59,130,246,0.12)",
        borderDash: [],
      },
      aggressive: {
        borderColor: "rgba(16,185,129,0.95)", // green
        backgroundColor: "rgba(16,185,129,0.12)",
        borderDash: [],
      },
    };

    const ds = (results || []).map((r) => {
      const s = styleByKey[r.key] || {};
      const series = Array.isArray(r.seriesNet) ? r.seriesNet : [];

      // ✅ 길이 불일치 방어: labels 길이에 맞춰 null padding
      const fixed = labels.map((_, i) => (i < series.length ? toNum(series[i]) : null));

      return {
        label: `${r.title} (${toNum(r.annualRate).toFixed(1)}%)`,
        data: fixed,
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
      interaction: {
        mode: "index",
        intersect: false,
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            autoSkip: true, // ✅ months 많을 때 성능/가독성
            callback: (value) => {
              // ✅ Chart.js에선 value가 "index"로 들어오는 경우가 많음
              const idx = Number(value);
              if (!Number.isFinite(idx)) return "";

              const month = idx + 1; // 1..N
              if (month % 12 !== 0) return "";

              const y = month / 12;
              return isKo ? `${y}년` : `${y}y`;
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
            label: (ctx) => {
              const name = ctx.dataset?.label || "";
              return `${name}: ${formatMoneyAuto(ctx.raw, currency, locale)}`;
            },
          },
        },
      },
    }),
    [currency, locale, isKo]
  );

  if (!chartData?.datasets?.length) return null;

  return (
    <div className="w-full h-72 sm:h-80 lg:h-96">
      <Line data={chartData} options={options} />
    </div>
  );
}
