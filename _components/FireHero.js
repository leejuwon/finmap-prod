// _components/FireHero.js — Improved Version

export default function FireHero({ lang = "ko" }) {
  const isKo = lang === "ko";

  return (
    <div className="card bg-slate-900 text-white mb-6 overflow-hidden">

      <div className="flex flex-col md:flex-row gap-6 items-stretch">

        {/* ---------- Left: Title + Lead ---------- */}
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold whitespace-pre-line leading-snug mb-3">
            {isKo
              ? "FIRE(조기 은퇴) 가능 시점과\n은퇴 후 자산 지속 기간을\n한눈에 확인하세요"
              : "See when you can reach FIRE\nand how long your assets sustain"}
          </h2>

          <p className="text-sm text-slate-300 mb-4">
            {isKo
              ? "현재 자산·지출·수익률·출금률을 입력하면, 언제 FIRE 가능한지와 은퇴 후 몇 년간 자산이 유지되는지 시각적으로 보여줍니다."
              : "Input your assets, spending, return, and withdrawal rate to visualize FIRE timing and retirement sustainability."}
          </p>

          <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
            FIRE · FINANCIAL INDEPENDENCE · EARLY RETIREMENT
          </p>
        </div>

        {/* ---------- Right: FIRE Mini Chart + Stats ---------- */}
        <div className="flex-1 grid grid-cols-3 gap-2">

          {/* Mini Chart Block */}
          <div className="col-span-3 bg-slate-800/70 border border-slate-700 rounded-xl p-3 mb-2">
            <p className="text-[11px] text-slate-400 mb-1">
              {isKo ? "FIRE 자산 곡선 예시" : "Example FIRE asset curve"}
            </p>

            {/* Mini Chart (SVG) */}
            <svg viewBox="0 0 100 40" className="w-full h-12">
              {/* Accumulation curve */}
              <path
                d="M5 35 Q 30 5, 55 10"
                stroke="#34d399"
                strokeWidth="2.5"
                fill="none"
              />
              {/* Retirement decline */}
              <path
                d="M55 10 Q 75 20, 95 35"
                stroke="#38bdf8"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>
          </div>

          {/* Stat 1 */}
          <div className="stat bg-slate-800/80 border border-slate-700">
            <p className="stat-title text-slate-300">
              {isKo ? "FIRE 목표" : "Target"}
            </p>
            <p className="stat-value text-emerald-300 text-base">Goal</p>
          </div>

          {/* Stat 2 */}
          <div className="stat bg-slate-800/80 border border-slate-700">
            <p className="stat-title text-slate-300">
              {isKo ? "가능 시점" : "FIRE Year"}
            </p>
            <p className="stat-value text-sky-300 text-base">Year</p>
          </div>

          {/* Stat 3 */}
          <div className="stat bg-slate-800/80 border border-slate-700">
            <p className="stat-title text-slate-300">
              {isKo ? "지속 기간" : "Longevity"}
            </p>
            <p className="stat-value text-amber-300 text-base">Years</p>
          </div>

        </div>
      </div>
    </div>
  );
}
