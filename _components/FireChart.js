// _components/FireChart.js — FINAL VERSION (Real vs Nominal Comparison)

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from "recharts";

// 한국어 금액 포맷 (실질/명목 공통)
function formatKrwHuman(value, withWon = false) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);

  if (abs >= 100_000_000) return `${(n / 100_000_000).toFixed(2)}억`;
  if (abs >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}천만`;
  if (abs >= 10_000) return `${(n / 10_000).toFixed(0)}만`;

  const base = n.toLocaleString("ko-KR");
  return withWon ? `${base}원` : base;
}

export default function FireChart({ data = [], locale = "ko-KR" }) {
  const isKo = locale.startsWith("ko");
  if (!data || data.length === 0) return null;

  // 첫 번째 은퇴 구간의 year
  const fireStartYear =
    data.find((d) => d.phase === "retirement")?.year || null;

  // Tooltip 확장 (실질 vs 명목 비교 + 전년 대비 변화)
  const tooltipFormatter = (value, name, props) => {
    const row = props?.payload;

    let label = "";
    if (name === "assetReal") label = isKo ? "자산(실질)" : "Real assets";
    if (name === "assetNominal") label = isKo ? "자산(명목)" : "Nominal assets";

    // 전년 대비 변화 계산
    let diff = "";
    if (row?.prevReal != null && name === "assetReal") {
      const change = value - row.prevReal;
      const pct = (change / row.prevReal) * 100;
      diff = ` (${change > 0 ? "+" : ""}${formatKrwHuman(
        change
      )}, ${pct.toFixed(1)}%)`;
    }

    if (row?.prevNominal != null && name === "assetNominal") {
      const change = value - row.prevNominal;
      const pct = (change / row.prevNominal) * 100;
      diff = ` (${change > 0 ? "+" : ""}${formatKrwHuman(
        change
      )}, ${pct.toFixed(1)}%)`;
    }

    return [`${formatKrwHuman(value, true)}${diff}`, label];
  };

  // Tooltip 이전 자산 값 계산 추가
  const enrichedData = data.map((item, idx) => {
    return {
      ...item,
      prevReal: idx > 0 ? data[idx - 1].assetReal : null,
      prevNominal: idx > 0 ? data[idx - 1].assetNominal : null,
    };
  });

  return (
    <section className="fire-chart">
      <div className="w-full h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={enrichedData}>
            
            {/* ========== 적립 구간 shading ========== */}
            {fireStartYear && (
              <ReferenceArea
                x1={data[0].year}
                x2={fireStartYear}
                fill="#ecfdf5"
                fillOpacity={0.45}
              />
            )}

            {/* ========== 은퇴 구간 shading ========== */}
            {fireStartYear && (
              <ReferenceArea
                x1={fireStartYear}
                x2={data[data.length - 1].year}
                fill="#eff6ff"
                fillOpacity={0.45}
              />
            )}

            {/* ========== FIRE Target Line ========== */}
            <ReferenceLine
              y={data[0].fireTarget}
              stroke="#0ea5e9"
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                position: "right",
                value: isKo ? "FIRE 목표" : "FIRE target",
                fill: "#0369a1",
                fontSize: 12,
              }}
            />

            {/* ========== 축 ========== */}
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              tickMargin={6}
            />
            <YAxis
              tickFormatter={(v) =>
                isKo ? formatKrwHuman(v) : v.toLocaleString(locale)
              }
              tick={{ fontSize: 12 }}
            />

            {/* ========== Tooltip ========== */}
            <Tooltip
              formatter={tooltipFormatter}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            />

            {/* ========== Legend ========== */}
            <Legend
              verticalAlign="top"
              height={30}
              formatter={(value) => {
                if (value === "assetReal")
                  return isKo ? "자산(실질)" : "Real assets";
                if (value === "assetNominal")
                  return isKo ? "자산(명목)" : "Nominal assets";
                if (value === "fireTarget")
                  return isKo ? "FIRE 목표" : "FIRE target";
                return value;
              }}
            />

            {/* ========== 실질 자산 곡선 ========== */}
            <Line
              type="monotone"
              dataKey="assetReal"
              name="assetReal"
              stroke="#059669"
              strokeWidth={2.7}
              dot={false}
              activeDot={{ r: 6 }}
            />

            {/* ========== 명목 자산 곡선 ========== */}
            <Line
              type="monotone"
              dataKey="assetNominal"
              name="assetNominal"
              stroke="#60a5fa"
              strokeWidth={2.6}
              dot={false}
              activeDot={{ r: 6 }}
            />

            {/* 기존 FIRE 타깃 라인도 Line으로 표시 */}
            <Line
              type="monotone"
              dataKey="fireTarget"
              name="fireTarget"
              stroke="#38bdf8"
              strokeDasharray="4 3"
              strokeWidth={1.8}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
