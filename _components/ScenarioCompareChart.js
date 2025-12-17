// _components/ScenarioCompareChart.js
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { formatMoneyShort, formatMoneyFull } from "./ValueDisplay";

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

function isFiniteNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * KRW: formatMoneyShort (원/만원/억)
 * other: Intl currency (간결/정확)
 */
function formatAxisMoney(v, currency, numberLocale) {
  if (v == null) return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return "";

  if (currency === "KRW") return formatMoneyShort(n, numberLocale);

  // KRW가 아니면 통화 단위가 꼭 붙는 포맷으로
  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ScenarioCompareChart({
  selected = [],
  currency = "KRW",
  numberLocale = "ko-KR",
}) {
  const isKo = String(numberLocale).toLowerCase().startsWith("ko");

  const { labels, datasets } = useMemo(() => {
    const maxYears = Math.max(
      1,
      ...selected.map((s) => (s?.series?.years || []).length || 1)
    );

    const labels = buildLabels(maxYears);

    const datasets = selected.map((s, idx) => {
      const years = s?.series?.years || [];
      const net = s?.series?.net || [];

      // year -> value 매핑
      const mapYearToValue = new Map(
        years.map((y, i) => [String(y), isFiniteNumber(net[i])])
      );

      const data = labels.map((y) => {
        const v = mapYearToValue.get(String(y));
        return v == null ? null : v;
      });

      const color = PALETTE[idx % PALETTE.length];

      return {
        label: s?.name || `Scenario ${idx + 1}`,
        data,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        tension: 0.25,
        fill: false,
        pointRadius: 1,
        pointHoverRadius: 3,
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

      // ✅ 여러 시나리오를 같은 x에서 같이 비교하기 좋게
      interaction: { mode: "index", intersect: false },

      plugins: {
        legend: {
          position: "top",
          labels: { boxWidth: 10, boxHeight: 10 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const raw = ctx.raw;
              if (raw == null) return `${ctx.dataset.label}: -`;

              // KRW는 short + full 같이 보여주면 UX 좋음
              if (currency === "KRW") {
                const short = formatMoneyShort(raw, numberLocale);
                const full = formatMoneyFull(raw, currency, numberLocale);
                return `${ctx.dataset.label}: ${short} (${full})`;
              }

              // USD/EUR 등은 currency 포맷으로만
              return `${ctx.dataset.label}: ${formatAxisMoney(raw, currency, numberLocale)}`;
            },
          },
        },
      },

      scales: {
        x: {
          title: {
            display: true,
            text: isKo ? "연차" : "Year",
          },
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            callback: (value) => {
              // category 축 value는 index일 때가 많음
              const idx = Number(value);
              if (!Number.isFinite(idx)) return "";
              const y = idx + 1;
              return isKo ? `${y}년` : `Y${y}`;
            },
          },
          grid: { display: false },
        },
        y: {
          ticks: {
            callback: (v) => formatAxisMoney(v, currency, numberLocale),
          },
        },
      },
    }),
    [currency, numberLocale, isKo]
  );

  if (!datasets?.length) return null;

  return (
    <div className="w-full h-80">
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
}
