// _components/FireChart.js — FIRE PRO EDITION (Hover 강화 + Gauge 지원)

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
import { useState } from "react";
import { formatKrwUnit } from "../lib/fire";

// ----------------------
// 💰 금액 포맷
// ----------------------
function formatMoney(value, locale = "ko-KR") {
  const n = Number(value) || 0;

  if (locale === "ko-KR") {
    return formatKrwUnit(n);   // ← 한국식 단위 변환 통일
  }

  // 영어(USD) 포맷
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (abs >= 1_000_000_000) return sign + "$" + (abs / 1_000_000_000).toFixed(2) + "B";
  if (abs >= 1_000_000)     return sign + "$" + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000)         return sign + "$" + (abs / 1_000).toFixed(1) + "K";
  return sign + "$" + abs.toLocaleString();
}

// 🔥 Hover Tooltip → 프로 버전 커스텀 UI
function CustomTooltip({ active, payload, label, locale }) {
  if (!active || !payload || payload.length === 0) return null;

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

      {row.cashflow !== undefined && row.cashflow !== 0 && (
        <div>
          • 현금흐름:{" "}
          <span className={row.cashflow > 0 ? "text-blue-600" : "text-red-500"}>
            {formatMoney(row.cashflow, locale)}
          </span>
        </div>
      )}

      {row.progressRate && (
        <div>• FIRE 진행률: <b>{row.progressRate}%</b></div>
      )}
    </div>
  );
}

// ----------------------
// ⭕ 반원 게이지 컴포넌트 (FIRE 진행률 Gauge)
// ----------------------
function FireGauge({ progress = 0, locale = "ko-KR" }) {
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
}

// ----------------------
// 🔥 메인 차트 컴포넌트
// ----------------------
export default function FireChart({ data = [], summary = null, locale = "ko-KR" }) {
  const isKo = locale === "ko-KR";

  if (!data || data.length === 0) return null;

  // FIRE 도달 지점
  const fireIndex = data.findIndex(
    (d) => d.assetReal >= d.fireTarget && d.phase === "accumulation"
  );
  const firePoint = fireIndex !== -1 ? data[fireIndex] : null;

  const fireStartYear = data.find((d) => d.phase === "retirement")?.year;

  // Gauge에서 사용할 진행률
  const lastRow = data[data.length - 1];
  const progressGauge = lastRow.progressRate ?? 0;

  return (
    <section className="fire-chart">

      {/* FIRE 진행률 게이지 추가 */}
      {summary && (
        <FireGauge progress={progressGauge} locale={locale} />
      )}

      {/* 설명 */}
      <div className="text-xs text-slate-500 mb-2">
        {isKo
          ? "실질 자산=물가 반영 구매력 / 명목 자산=실제 계좌 금액"
          : "Real asset = inflation-adjusted / Nominal = actual balance"}
      </div>

      {/* CHART */}
      <div className="w-full h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#e5e7eb" />

            {fireStartYear && (
              <ReferenceArea x1={1} x2={fireStartYear} fill="#ecfdf5" fillOpacity={0.5} />
            )}

            {fireStartYear && (
              <ReferenceArea
                x1={fireStartYear}
                x2={data.length}
                fill="#eff6ff"
                fillOpacity={0.45}
              />
            )}

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

            <Tooltip
              content={<CustomTooltip locale={locale} />}
            />

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

            {firePoint && (
              <>
                <ReferenceDot
                  x={firePoint.year}
                  y={firePoint.assetReal}
                  r={7}
                  fill="#10b981"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
