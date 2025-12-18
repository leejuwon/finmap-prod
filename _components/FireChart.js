// _components/FireChart.js — FIRE PRO EDITION (Ultra-Optimized for Next.js 13)

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
  Legend,
  ReferenceDot,
} from "recharts";
import { memo, useMemo } from "react";
import { formatKrwUnit } from "../lib/fire";

// ----------------------
// 💰 금액 포맷 함수 (메모이징 적용)
// ----------------------
const formatMoney = (n, locale = "ko-KR") => {
  const v = Number(n) || 0;

  if (locale === "ko-KR") return formatKrwUnit(v);

  // 영어 USD 포맷
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString()}`;
};

// ----------------------
// 🔥 Tooltip (렌더 비용 최소화)
// ----------------------
const CustomTooltip = memo(function CustomTooltip({ active, payload, locale }) {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;

  return (
    <div className="p-3 bg-white border shadow-md rounded-md text-xs">
      <div className="font-semibold mb-1">{row.year}년</div>

      <div>• 실질 자산: <b>{formatMoney(row.assetReal, locale)}</b></div>
      <div>• 명목 자산: <b>{formatMoney(row.assetNominal, locale)}</b></div>

      {row.nominalYield !== undefined && (
        <div>• 명목 수익: {formatMoney(row.nominalYield, locale)}</div>
      )}

      {row.realYield !== undefined && (
        <div>• 실질 수익: {formatMoney(row.realYield, locale)}</div>
      )}

      {row.cashflow !== 0 && (
        <div>
          • 현금흐름:{" "}
          <span className={row.cashflow > 0 ? "text-blue-600" : "text-red-500"}>
            {formatMoney(row.cashflow, locale)}
          </span>
        </div>
      )}

      {row.progressRate !== undefined && (
        <div>• FIRE 진행률: <b>{row.progressRate}%</b></div>
      )}
    </div>
  );
});

// ----------------------
// ⭕ 반원 게이지 (render 비용 최소화)
// ----------------------
const FireGauge = memo(function FireGauge({ progress = 0, locale = "ko-KR" }) {
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <div className="flex flex-col items-center my-4">
      <svg width="180" height="90">
        <path
          d="M10 80 A70 70 0 0 1 170 80"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="14"
        />
        <path
          d="M10 80 A70 70 0 0 1 170 80"
          fill="none"
          stroke="#10b981"
          strokeWidth="14"
          strokeDasharray={`${(pct / 100) * 220} 220`}
          strokeLinecap="round"
        />
      </svg>

      <p className="text-xs mt-1 text-slate-600">
        {locale === "ko-KR"
          ? `FIRE 목표 대비 ${pct}% 진행`
          : `${pct}% progress toward FIRE`}
      </p>
    </div>
  );
});

// ----------------------
// ⭐ 메인 차트 — 렌더 비용 최적화
// ----------------------
function FireChart({ data = [], summary, locale = "ko-KR" }) {
  const isKo = locale === "ko-KR";
  if (!data?.length) return null;

  // 계산 메모이징
  const { firePoint, fireStartYear, progressGauge } = useMemo(() => {
    const fpIndex = data.findIndex(
      (d) => d.assetReal >= d.fireTarget && d.phase === "accumulation"
    );

    return {
      firePoint: fpIndex !== -1 ? data[fpIndex] : null,
      fireStartYear: data.find((d) => d.phase === "retirement")?.year,
      progressGauge: data[data.length - 1]?.progressRate ?? 0,
    };
  }, [data]);

  return (
    <section className="fire-chart">

      {/* 진행률 게이지 */}
      {summary && <FireGauge progress={progressGauge} locale={locale} />}

      <div className="text-xs text-slate-500 mb-2">
        {isKo
          ? "실질 자산=물가 반영 구매력 / 명목 자산=실제 계좌 금액"
          : "Real asset = inflation-adjusted / Nominal = actual balance"}
      </div>

      <div className="w-full h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#e5e7eb" />

            {/* Accumulation 영역 */}
            {fireStartYear && (
              <ReferenceArea x1={1} x2={fireStartYear} fill="#ecfdf5" fillOpacity={0.5} />
            )}

            {/* Retirement 영역 */}
            {fireStartYear && (
              <ReferenceArea
                x1={fireStartYear}
                x2={data.length}
                fill="#eff6ff"
                fillOpacity={0.45}
              />
            )}

            {/* FIRE 목표선 */}
            <ReferenceLine
              y={data[0].fireTarget}
              stroke="#38bdf8"
              strokeDasharray="5 5"
              label={{
                value: isKo ? "FIRE 목표" : "FIRE Target",
                fill: "#0ea5e9",
              }}
            />

            <XAxis dataKey="year" />
            <YAxis tickFormatter={(v) => formatMoney(v, locale)} />

            <Tooltip content={<CustomTooltip locale={locale} />} />

            <Legend wrapperStyle={{ fontSize: "12px" }} />

            <Line
              type="monotone"
              dataKey="assetReal"
              name={isKo ? "실질 자산" : "Real Assets"}
              stroke="#059669"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="assetNominal"
              name={isKo ? "명목 자산" : "Nominal Assets"}
              stroke="#60a5fa"
              strokeWidth={3}
              dot={false}
            />

            {/* FIRE 도달 포인트 */}
            {firePoint && (
              <ReferenceDot
                x={firePoint.year}
                y={firePoint.assetReal}
                r={7}
                fill="#10b981"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default memo(FireChart);
