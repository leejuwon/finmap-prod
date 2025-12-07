// _components/FireSummary.js — PREMIUM+ VERSION (Real basis)

import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  InformationCircleIcon,
} from "@heroicons/react/solid";

function formatMoney(value, locale = "ko-KR") {
  const n = Number(value) || 0;

  if (locale === "ko-KR") {
    if (n >= 100_000_000) return (n / 100_000_000).toFixed(2) + "억";
    if (n >= 10_000_000) return (n / 10_000_000).toFixed(1) + "천만";
    if (n >= 10_000) return (n / 10_000).toFixed(0) + "만";
    return n.toLocaleString("ko-KR") + "원";
  }

  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + n.toLocaleString("en-US");
}

function Tooltip({ text }) {
  return (
    <span className="relative group cursor-help ml-1">
      <InformationCircleIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
      <span className="absolute hidden group-hover:block text-xs bg-black/80 text-white px-2 py-1 rounded-md whitespace-nowrap -top-8 left-1/2 -translate-x-1/2 shadow-lg z-10">
        {text}
      </span>
    </span>
  );
}

export default function FireSummary({ lang = "ko", result }) {
  if (!result) return null;

  const isKo = lang === "ko";
  const locale = isKo ? "ko-KR" : "en-US";

  const {
    fireTarget,
    retirementStartReal,
    canFireAtEnd,
    retirement,
    accumulation,
  } = result;

  const fireYear = accumulation?.fireYear;

  const depletion =
    retirement?.depletionYear == null
      ? isKo
        ? "고갈 없음 (60년 유지)"
        : "No depletion (60+ years)"
      : `${retirement.depletionYear}${isKo ? "년" : "yrs"}`;

  const statusColor = canFireAtEnd
    ? "bg-emerald-50 border-emerald-200"
    : "bg-red-50 border-red-200";

  const statusIcon = canFireAtEnd ? (
    <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
  ) : (
    <XCircleIcon className="w-8 h-8 text-red-500" />
  );

  const statusText = canFireAtEnd
    ? isKo
      ? "현재 가정에서 FIRE 달성이 가능합니다."
      : "FIRE is achievable under current assumptions."
    : isKo
    ? "현재 가정에서는 FIRE 목표 달성이 어려울 수 있습니다."
    : "Reaching FIRE may be difficult under current assumptions.";

  return (
    <section className="mb-8">
      {/* MAIN SUMMARY */}
      <div className={`card p-5 mb-5 shadow-sm border ${statusColor}`}>
        <div className="flex items-center gap-4">
          {statusIcon}
          <div>
            <p className="text-base font-semibold">{statusText}</p>
            {fireYear && (
              <p className="text-xs text-slate-600 mt-1">
                {isKo
                  ? `예상 달성 시점: 약 ${fireYear}년 후`
                  : `Estimated FIRE timing: in ${fireYear} years`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3 CARDS */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4 bg-white text-center border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">
            {isKo ? "FIRE 목표 자산" : "FIRE Target"}
            <Tooltip text={isKo ? "연 지출 ÷ 출금률" : "Annual spend ÷ withdrawal rate"} />
          </p>
          <p className="text-2xl font-bold text-emerald-600">
            {formatMoney(fireTarget, locale)}
          </p>
        </div>

        <div className="card p-4 bg-white text-center border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">
            {isKo ? "은퇴 시작 자산 (실질)" : "Start Retirement (Real)"}
            <Tooltip text={isKo ? "물가 반영 기준" : "Inflation-adjusted"} />
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {formatMoney(retirementStartReal, locale)}
          </p>
        </div>

        <div className="card p-4 bg-white text-center border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">
            {isKo ? "자산 지속 기간" : "Asset Longevity"}
            <Tooltip text={isKo ? "은퇴 후 자산 유지 기간" : "Years assets sustain"} />
          </p>
          <p className="flex items-center justify-center gap-2 text-2xl font-bold text-amber-600">
            <ClockIcon className="w-6 h-6 text-amber-500" />
            {depletion}
          </p>
        </div>
      </div>
    </section>
  );
}
