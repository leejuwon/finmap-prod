// _components/FireHero.js — PREMIUM BRAND VERSION (FinMap FIRE Hero)

export default function FireHero({ lang = "ko" }) {
  const isKo = lang === "ko";

  return (
    <div className="relative card bg-[#0f172a] text-white mb-6 overflow-hidden rounded-2xl shadow-lg">

      {/* 🔵 Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-transparent pointer-events-none" />

      {/* Main layout */}
      <div className="relative flex flex-col md:flex-row items-stretch gap-8 py-6 px-5">

        {/* ---------------- LEFT PANEL ---------------- */}
        <div className="flex-1 flex flex-col justify-center">

          <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-4 whitespace-pre-line drop-shadow">
            {isKo
              ? "FIRE(조기 은퇴)를 향한\n당신의 여정을 설계해보세요"
              : "Design your journey\ntoward FIRE (Early Retirement)"}
          </h2>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4">
            {isKo
              ? "FinMap FIRE 시뮬레이터는 ‘실질 수익률’을 기준으로 은퇴 가능 시점과 은퇴 후 자산 지속 기간을 정교하게 분석합니다."
              : "FinMap FIRE Simulator analyzes your FIRE timing and post-retirement sustainability using real after-tax returns."}
          </p>

          {/* Brand trust statement */}
          <p className="text-[11px] tracking-widest text-slate-400 uppercase">
            FINMAP · FIRE MODEL · REAL RETURN BASED
          </p>
        </div>

        {/* ---------------- RIGHT PANEL ---------------- */}
        <div className="flex-1 grid grid-cols-3 gap-3">

          {/* 🔹 FinMap Mini Sparkline */}
          <div className="col-span-3 bg-slate-800/60 border border-slate-700 rounded-xl p-4 backdrop-blur">
            <p className="text-[11px] text-slate-400 mb-2">
              {isKo ? "FIRE 자산 곡선 예시 (실질 기준)" : "Example FIRE curve (real return)"}
            </p>

            <svg viewBox="0 0 100 40" className="w-full h-14">
              {/* Accumulation curve */}
              <path
                d="M5 35 Q 25 20, 55 10"
                stroke="#34d399"
                strokeWidth="3"
                fill="none"
              />
              {/* Retirement decline */}
              <path
                d="M55 10 Q 80 22, 95 35"
                stroke="#38bdf8"
                strokeWidth="3"
                fill="none"
              />
            </svg>
          </div>

          {/* 🔹 Stat Box 1 */}
          <div className="stat bg-slate-800/70 border border-slate-700 rounded-xl">
            <p className="stat-title text-slate-400 text-xs">
              {isKo ? "FIRE 공식" : "FIRE Rule"}
            </p>
            <p className="stat-value text-emerald-300 font-bold text-base">
              Spend ÷ WR
            </p>
          </div>

          {/* 🔹 Stat Box 2 */}
          <div className="stat bg-slate-800/70 border border-slate-700 rounded-xl">
            <p className="stat-title text-slate-400 text-xs">
              {isKo ? "핵심 변수" : "Key Inputs"}
            </p>
            <p className="stat-value text-blue-300 font-bold text-base">
              Return · WR · Infl
            </p>
          </div>

          {/* 🔹 Stat Box 3 */}
          <div className="stat bg-slate-800/70 border border-slate-700 rounded-xl">
            <p className="stat-title text-slate-400 text-xs">
              {isKo ? "모델 기반" : "Model Based"}
            </p>
            <p className="stat-value text-amber-300 font-bold text-base">
              Real Return
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
