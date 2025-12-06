// _components/FireSummary.js — FINAL VERSION (Real / Nominal assets)

import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/solid";

function formatKrwHuman(v) {
  const n = Number(v) || 0;
  return n.toLocaleString("ko-KR");
}

export default function FireSummary({ lang = "ko", result }) {
  const isKo = lang === "ko";

  const {
    fireTarget,
    retirementStartReal,
    retirementStartNominal,
    canFireAtEnd,
    retirement,
    risk,
  } = result;

  const depletion =
    retirement?.depletionYear == null
      ? isKo
        ? "고갈 없음 (60년 유지)"
        : "No depletion (60+ years)"
      : `${retirement.depletionYear} ${isKo ? "년" : "yrs"}`;

  return (
    <div className="grid gap-4 sm:grid-cols-4 mb-6">

      {/* FIRE 목표 자산 */}
      <div className="card text-center bg-white">
        <p className="text-sm text-slate-500 mb-1">
          {isKo ? "FIRE 목표 자산" : "FIRE Target"}
        </p>
        <p className="text-lg font-bold text-emerald-600">
          {fireTarget?.toLocaleString?.() ?? "-"}
        </p>
      </div>

      {/* 은퇴 시작 자산(실질 기준) */}
      <div className="card text-center bg-white">
        <p className="text-sm text-slate-500 mb-1">
          {isKo ? "은퇴 시작 자산(실질)" : "Start of Retirement (Real)"}
        </p>
        <p className="text-lg font-bold text-blue-600">
          {retirementStartReal?.toLocaleString?.() ?? "-"}
        </p>
      </div>

      {/* 은퇴 시작 자산(명목 기준) */}
      <div className="card text-center bg-white">
        <p className="text-sm text-slate-500 mb-1">
          {isKo ? "은퇴 시작 자산(명목)" : "Start of Retirement (Nominal)"}
        </p>
        <p className="text-lg font-bold text-sky-600">
          {retirementStartNominal?.toLocaleString?.() ?? "-"}
        </p>
      </div>

      {/* FIRE 가능 여부 */}
      <div className="card text-center bg-white">
        <p className="text-sm text-slate-500 mb-1">
          {isKo ? "FIRE 가능 여부" : "FIRE Ready?"}
        </p>

        <p className="flex items-center justify-center gap-1 text-lg font-bold">
          {canFireAtEnd ? (
            <>
              <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
              <span className="text-emerald-600">{isKo ? "가능" : "Yes"}</span>
            </>
          ) : (
            <>
              <XCircleIcon className="w-5 h-5 text-red-500" />
              <span className="text-red-600">{isKo ? "불가능" : "No"}</span>
            </>
          )}
        </p>
      </div>

      {/* 은퇴 후 자산 지속 기간 */}
      <div className="card text-center bg-white">
        <p className="text-sm text-slate-500 mb-1">
          {isKo ? "자산 지속 기간" : "Asset Longevity"}
        </p>

        <p className="flex items-center justify-center gap-1 text-lg font-bold">
          <ClockIcon className="w-5 h-5 text-amber-500" />
          <span className="text-amber-600">{depletion}</span>
        </p>
      </div>

    </div>
  );
}
