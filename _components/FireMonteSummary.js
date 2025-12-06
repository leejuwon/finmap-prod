// _components/FireMonteSummary.js

export default function FireMonteSummary({ lang = "ko", mc }) {
  if (!mc) return null;

  const isKo = lang === "ko";

  return (
    <div className="card mt-6">
      <h2 className="text-lg font-semibold mb-3">
        {isKo ? "FIRE 확률 분석 (몬테카를로)" : "FIRE Probability (Monte Carlo)"}
      </h2>

      <div className="grid sm:grid-cols-3 gap-4">

        <div className="stat text-center">
          <p className="stat-title text-slate-500 mb-1">
            {isKo ? "FIRE 목표 달성 확률" : "Probability of reaching FIRE"}
          </p>
          <p className="stat-value text-emerald-600 text-xl font-bold">
            {mc.fireProb.toFixed(1)}%
          </p>
        </div>

        <div className="stat text-center">
          <p className="stat-title text-slate-500 mb-1">
            {isKo ? "은퇴 후 30년 유지 확률" : "Probability assets last 30 yrs"}
          </p>
          <p className="stat-value text-blue-600 text-xl font-bold">
            {mc.sustain30.toFixed(1)}%
          </p>
        </div>

        <div className="stat text-center">
          <p className="stat-title text-slate-500 mb-1">
            {isKo ? "평균 자산 소진 시점" : "Avg depletion year"}
          </p>
          <p className="stat-value text-amber-600 text-xl font-bold">
            {mc.avgDepletion.toFixed(1)}년
          </p>
        </div>

      </div>

      <p className="text-xs text-slate-500 mt-3">
        {isKo
          ? `총 ${mc.trials}회 시뮬레이션 기반`
          : `Based on ${mc.trials} simulations`}
      </p>
    </div>
  );
}
