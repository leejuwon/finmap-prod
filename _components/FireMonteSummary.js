// _components/FireMonteSummary.js — Premium Gauge Version

export default function FireMonteSummary({ lang = "ko", mc }) {
  if (!mc) return null;

  const isKo = lang === "ko";

  // ============================
  // 🔥 Gauge Component (SVG)
  // ============================
  const Gauge = ({ value, color, label }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <svg width="80" height="80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dy="6"
            className="text-sm font-bold fill-slate-800"
          >
            {value.toFixed(1)}%
          </text>
        </svg>
        <p className="text-xs text-slate-600 mt-1 text-center">{label}</p>
      </div>
    );
  };

  // ============================
  // 🔥 Risk Level Logic
  // ============================
  const depletion = mc.avgDepletion;
  let riskLabel = "";
  let riskColor = "";

  if (depletion >= 50) {
    riskLabel = isKo ? "낮음" : "Low";
    riskColor = "text-emerald-600";
  } else if (depletion >= 30) {
    riskLabel = isKo ? "중간" : "Medium";
    riskColor = "text-amber-500";
  } else {
    riskLabel = isKo ? "높음" : "High";
    riskColor = "text-red-600";
  }

  return (
    <div className="card mt-6">
      <h2 className="text-lg font-semibold mb-4">
        {isKo ? "FIRE 확률 분석 (몬테카를로)" : "FIRE Probability (Monte Carlo)"}
      </h2>

      {/* ========== GAUGE GRID ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">

        {/* FIRE 목표 달성 확률 */}
        <Gauge
          value={mc.fireProb}
          color="#10b981" // emerald-500
          label={isKo ? "FIRE 목표 도달 확률" : "Probability of reaching FIRE"}
        />

        {/* 30년 유지 확률 */}
        <Gauge
          value={mc.sustain30}
          color="#3b82f6" // blue-500
          label={isKo ? "30년 자산 유지 확률" : "Assets lasting 30 years"}
        />

        {/* Risk Level */}
        <div className="flex flex-col justify-center items-center bg-slate-50 border border-slate-200 rounded-xl py-4">
          <p className="text-xs text-slate-600 mb-1">
            {isKo ? "평균 자산 소진 시점" : "Avg depletion year"}
          </p>

          <p className="text-xl font-bold text-slate-700 mb-1">
            {depletion.toFixed(1)} {isKo ? "년" : "yrs"}
          </p>

          <div
            className={`text-sm font-semibold px-3 py-1 rounded-full ${riskColor} bg-white border`}
          >
            {isKo ? `위험도: ${riskLabel}` : `Risk: ${riskLabel}`}
          </div>
        </div>
      </div>

      {/* Simulation count */}
      <p className="text-xs text-slate-500 mt-4 text-center">
        {isKo
          ? `총 ${mc.trials}회 시뮬레이션 기반`
          : `Based on ${mc.trials} MonteCarlo simulations`}
      </p>
    </div>
  );
}
