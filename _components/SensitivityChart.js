import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const Line = dynamic(() => import("react-chartjs-2").then((m) => m.Line), {
  ssr: false,
});

if (typeof window !== "undefined") {
  require("chart.js/auto");
}

// --- 자동 단위 포맷 ---
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

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function SensitivityChart({
  rateData = [],
  feeData = [],
  taxData = [],
  locale = "ko-KR",
  currency = "KRW",
}) {
  const isKo = String(locale).toLowerCase().startsWith("ko");

  // ✅ UX: 한 차트에 3개를 섞지 말고 탭으로 분리 (라벨 불일치도 같이 해결)
  const [mode, setMode] = useState("rate"); // 'rate' | 'fee' | 'tax'

  const modeConfig = useMemo(() => {
    const common = {
      rate: {
        key: "rate",
        title: isKo ? "수익률 변화" : "Return rate change",
        subtitle: isKo
          ? "연 수익률(%)을 ±로 바꿨을 때 세후 미래가치(FV)가 어떻게 변하는지"
          : "How net FV changes when annual return (%) shifts",
        data: rateData,
        // 색은 기존 유지(너 코드 스타일 존중)
        borderColor: "rgba(59,130,246,0.9)",
        backgroundColor: "rgba(59,130,246,0.15)",
      },
      fee: {
        key: "fee",
        title: isKo ? "수수료 변화" : "Fee change",
        subtitle: isKo
          ? "연 수수료(%)를 ±로 바꿨을 때 세후 미래가치(FV)가 어떻게 변하는지"
          : "How net FV changes when annual fee (%) shifts",
        data: feeData,
        borderColor: "rgba(234,88,12,0.9)",
        backgroundColor: "rgba(234,88,12,0.15)",
      },
      tax: {
        key: "tax",
        title: isKo ? "세율 변화" : "Tax rate change",
        subtitle: isKo
          ? "이자 과세율(%)을 ±로 바꿨을 때 세후 미래가치(FV)가 어떻게 변하는지"
          : "How net FV changes when tax rate (%) shifts",
        data: taxData,
        borderColor: "rgba(16,185,129,0.9)",
        backgroundColor: "rgba(16,185,129,0.15)",
      },
    };
    return common;
  }, [isKo, rateData, feeData, taxData]);

  const cfg = modeConfig[mode];

  // ✅ labels는 "선택된 모드의 데이터" 기준으로 만든다 (불일치 방지)
  const labels = useMemo(() => {
    const arr = cfg?.data || [];
    return arr.map((d) => {
      const delta = toNumber(d.delta);
      // fee는 소수도 있을 수 있으니 +0.1 같은 표기 처리
      const s =
        Math.abs(delta) >= 1
          ? `${delta > 0 ? "+" : ""}${delta}`
          : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`;
      return `${s}%`;
    });
  }, [cfg]);

  const fvList = useMemo(() => {
    const arr = cfg?.data || [];
    return arr.map((d) => toNumber(d.fvNet));
  }, [cfg]);

  const chartData = useMemo(() => {
    if (!labels.length) return null;

    return {
      labels,
      datasets: [
        {
          label: cfg.title,
          data: fvList,
          borderColor: cfg.borderColor,
          backgroundColor: cfg.backgroundColor,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
          fill: true,
        },
      ],
    };
  }, [labels, fvList, cfg]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#555",
            font: { size: 12 },
            maxRotation: 0,
            autoSkip: true,
          },
        },
        y: {
          ticks: {
            callback: (v) => formatMoneyAuto(v, currency, locale),
            font: { size: 12 },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const t = items?.[0]?.label || "";
              return isKo ? `변동: ${t}` : `Delta: ${t}`;
            },
            label: (ctx) => {
              const v = ctx.raw;
              return (isKo ? "세후 미래가치: " : "Net FV: ") + formatMoneyAuto(v, currency, locale);
            },
          },
        },
      },
    }),
    [currency, locale, isKo]
  );

  if (!cfg?.data?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="font-semibold mb-1">
          {isKo ? "민감도 분석" : "Sensitivity"}
        </div>
        <div className="text-sm text-slate-500">
          {isKo ? "표시할 데이터가 없습니다." : "No data to display."}
        </div>
      </div>
    );
  }

  // 모바일에서 point 수가 많으면 잘려보일 수 있어 minWidth 적용
  const minW = Math.max(560, (labels?.length || 0) * 44);

  return (
    <div className="w-full">
      {/* 탭 */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          className={mode === "rate" ? "btn-primary" : "btn-secondary"}
          onClick={() => setMode("rate")}
        >
          {isKo ? "수익률" : "Rate"}
        </button>
        <button
          type="button"
          className={mode === "fee" ? "btn-primary" : "btn-secondary"}
          onClick={() => setMode("fee")}
        >
          {isKo ? "수수료" : "Fee"}
        </button>
        <button
          type="button"
          className={mode === "tax" ? "btn-primary" : "btn-secondary"}
          onClick={() => setMode("tax")}
        >
          {isKo ? "세율" : "Tax"}
        </button>
      </div>

      <div className="mb-2">
        <div className="text-sm font-semibold">{cfg.title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{cfg.subtitle}</div>
      </div>

      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: minW }}>
          <div className="h-72 sm:h-80 lg:h-96 px-2 pb-2">
            {chartData ? <Line data={chartData} options={options} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
