// _components/ScenarioCompareChart.js
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { formatMoneyShort } from "./ValueDisplay";

const Line = dynamic(() => import("react-chartjs-2").then((m) => m.Line), {
  ssr: false,
});

if (typeof window !== "undefined") {
  require("chart.js/auto");
}

const PALETTE = [
  "rgba(59,130,246,0.95)",  // blue
  "rgba(16,185,129,0.95)",  // green
  "rgba(234,88,12,0.95)",   // orange
  "rgba(168,85,247,0.95)",  // purple
  "rgba(244,63,94,0.95)",   // rose
];

function buildLabels(maxYears) {
  return Array.from({ length: maxYears }, (_, i) => String(i + 1));
}

export default function ScenarioCompareChart({
  selected = [],
  currency = "KRW",
  numberLocale = "ko-KR",
}) {
  const { labels, datasets } = useMemo(() => {
    const maxYears = Math.max(
      1,
      ...selected.map((s) => (s?.series?.years || []).length || 1)
    );
    const labels = buildLabels(maxYears);

    const datasets = selected.map((s, idx) => {
      const years = s?.series?.years || [];
      const net = s?.series?.net || [];
      const mapYearToValue = new Map(years.map((y, i) => [String(y), net[i]]));

      const data = labels.map((y) => {
        const v = mapYearToValue.get(String(y));
        return v == null ? null : Number(v);
      });

      const color = PALETTE[idx % PALETTE.length];

      return {
        label: s?.name || `Scenario ${idx + 1}`,
        data,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        tension: 0.25,
        pointRadius: 2,
        spanGaps: true,
      };
    });

    return { labels, datasets };
  }, [selected]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            boxWidth: 10,
            boxHeight: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw;
              return `${ctx.dataset.label}: ${formatMoneyShort(v, numberLocale)}${
                currency === "KRW" ? "" : ""
              }`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: numberLocale.startsWith("ko") ? "연차" : "Year",
          },
          grid: { display: false },
        },
        y: {
          ticks: {
            callback: (v) => formatMoneyShort(v, numberLocale),
          },
        },
      },
    }),
    [currency, numberLocale]
  );

  return (
    <div className="w-full h-80">
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
}
