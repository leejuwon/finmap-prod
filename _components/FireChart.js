// _components/FireChart.js — FINAL UPGRADED VERSION + MINI SUMMARY BAR

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

// 💰 한국어 금액 포맷
function formatKrwHuman(value) {
  const n = Number(value) || 0;
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(2) + "억";
  if (n >= 10_000_000) return (n / 10_000_000).toFixed(1) + "천만";
  if (n >= 10_000) return (n / 10_000).toFixed(0) + "만";
  return n.toLocaleString("ko-KR");
}

// 💰 금액 포맷 (KRW vs USD)
function formatMoney(value, locale = "ko-KR") {
  const n = Number(value) || 0;

  // -------- 한국어(원) --------
  if (locale === "ko-KR") {
    if (n >= 100_000_000) return (n / 100_000_000).toFixed(2) + "억";
    if (n >= 10_000_000) return (n / 10_000_000).toFixed(1) + "천만";
    if (n >= 10_000) return (n / 10_000).toFixed(0) + "만";
    return n.toLocaleString("ko-KR") + "원";
  }

  // -------- 영어(USD) --------
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + n.toLocaleString("en-US");
}


// 🔥 Pulse 애니메이션 keyframes 삽입
if (typeof document !== "undefined" && !document.getElementById("pulse-fire")) {
  const style = document.createElement("style");
  style.id = "pulse-fire";
  style.innerHTML = `
    @keyframes pulse-fire {
      0% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.5); opacity: 0.4; }
      100% { transform: scale(1); opacity: 0.9; }
    }
  `;
  document.head.appendChild(style);
}

export default function FireChart({
  data = [],
  samplePaths = null,
  summary = null,   // ⬅ NEW: Fire target, retirementStart, fireYear 전달
  locale = "ko-KR",
}) {
  const isKo = locale === "ko-KR";
  const [showMC, setShowMC] = useState(false);

  if (!data || data.length === 0) return null;

  // FIRE 도달 지점
  const fireIndex = data.findIndex(
    (d) => d.assetReal >= d.fireTarget && d.phase === "accumulation"
  );
  const firePoint = fireIndex !== -1 ? data[fireIndex] : null;

  const fireStartYear = data.find((d) => d.phase === "retirement")?.year;

  // ===========================
  // 🔷 MINI SUMMARY BAR (NEW)
  // ===========================
  const fireTarget = summary?.fireTarget;
  const retirementStartReal = summary?.retirementStartReal;
  const fireYear = summary?.fireYear;

  const fireReachLabel = fireYear
    ? isKo
      ? `${fireYear}년 후`
      : `In ${fireYear} years`
    : isKo
    ? "미달성"
    : "Not reached";

  return (
    <section className="fire-chart">

      {/* 🌟 MINI SUMMARY BAR */}
      {summary && (
        <div className="grid grid-cols-3 gap-3 mb-4">

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
            <p className="text-xs text-slate-500">
              {isKo ? "FIRE 목표 자산" : "FIRE Target"}
            </p>
            <p className="text-lg font-bold text-emerald-700">
              {formatKrwHuman(fireTarget)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <p className="text-xs text-slate-500">
              {isKo ? "은퇴 시작 실질 자산" : "Start Assets (Real)"}
            </p>
            <p className="text-lg font-bold text-blue-700">
              {formatKrwHuman(retirementStartReal)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <p className="text-xs text-slate-500">
              {isKo ? "FIRE 예상 시점" : "FIRE Year"}
            </p>
            <p className="text-lg font-bold text-amber-700">
              {fireReachLabel}
            </p>
          </div>

        </div>
      )}      

      {/* =====================
          CHART AREA
      ===================== */}
      <div className="w-full h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>

            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />

            {/* 적립 구간 */}
            {fireStartYear && (
              <ReferenceArea
                x1={data[0].year}
                x2={fireStartYear}
                fill="#ecfdf5"
                fillOpacity={0.45}
              />
            )}

            {/* 은퇴 구간 */}
            {fireStartYear && (
              <ReferenceArea
                x1={fireStartYear}
                x2={data[data.length - 1].year}
                fill="#eff6ff"
                fillOpacity={0.45}
              />
            )}

            {/* FIRE 목표선 */}
            <ReferenceLine
              y={data[0].fireTarget}
              stroke="#38bdf8"
              strokeDasharray="6 4"
              label={{
                value: isKo ? "FIRE 목표" : "FIRE target",
                position: "right",
                fill: "#0ea5e9",
              }}
            />

            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => formatMoney(v, locale)}
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              formatter={(value) => formatMoney(value, locale)}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="assetReal"
              stroke="#059669"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="assetNominal"
              stroke="#60a5fa"
              strokeWidth={3}
              dot={false}
            />

            {/* FIRE 도달 Pulse 표시 */}
            {firePoint && (
              <>
                <ReferenceDot
                  x={firePoint.year}
                  y={firePoint.assetReal}
                  r={6}
                  fill="#10b981"
                  stroke="#065f46"
                  strokeWidth={2}
                />
                <ReferenceDot
                  x={firePoint.year}
                  y={firePoint.assetReal}
                  r={13}
                  fill="#10b981"
                  fillOpacity={0.45}
                  style={{ animation: "pulse-fire 2s infinite" }}
                />
              </>
            )}

          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
