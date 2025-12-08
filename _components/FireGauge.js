// _components/FireGauge.js — FIRE Progress Gauge (Semi-circle)

export default function FireGauge({ progress = 0 }) {
  // 0 ~ 100 사이 유지
  const pct = Math.max(0, Math.min(progress, 100));

  // 색상 계산
  const getColor = () => {
    if (pct < 40) return "#ef4444";      // 빨강(위험)
    if (pct < 70) return "#f59e0b";      // 주황(보통)
    if (pct < 100) return "#10b981";     // 초록(양호)
    return "#3b82f6";                    // 파랑(FIRE 달성)
  };

  const strokeColor = getColor();
  const radius = 90;
  const circumference = Math.PI * radius;

  const filled = (pct / 100) * circumference;
  const remaining = circumference - filled;

  return (
    <div className="w-full flex flex-col items-center mb-5 mt-4">
      <svg width="220" height="120">
        {/* 배경 반원 */}
        <path
          d="M 10 110 A 90 90 0 0 1 210 110"
          stroke="#e5e7eb"
          strokeWidth="14"
          fill="none"
        />

        {/* 진행 반원 */}
        <path
          d="M 10 110 A 90 90 0 0 1 210 110"
          stroke={strokeColor}
          strokeWidth="14"
          fill="none"
          strokeDasharray={`${filled} ${remaining}`}
          strokeLinecap="round"
        />
      </svg>

      <p className="text-xl font-bold mt-[-20px]" style={{ color: strokeColor }}>
        {pct.toFixed(1)}%
      </p>

      <p className="text-xs text-slate-500 mt-1">
        FIRE 목표 대비 진행률
      </p>
    </div>
  );
}
