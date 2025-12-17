// _components/FireSummary.js — FIXED & FINAL

import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { formatKrwUnit } from "../lib/fire";

function formatMoney(value, locale = "ko-KR") {
  const n = Number(value) || 0;
  if (locale === "ko-KR") return formatKrwUnit(n);

  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (abs >= 1_000_000_000) return sign + "$" + (abs / 1_000_000_000).toFixed(2) + "B";
  if (abs >= 1_000_000) return sign + "$" + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return sign + "$" + (abs / 1_000).toFixed(1) + "K";
  return sign + "$" + abs.toLocaleString("en-US");
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
    netRealReturn,
  } = result;

  const fireYear = accumulation?.fireYear;

  const depletion =
    retirement?.depletionYear == null
      ? isKo
        ? "고갈 없음 (60년 유지)"
        : "No depletion (60+ years)"
      : `${retirement.depletionYear}${isKo ? "년" : "yrs"}`;

  // 안전 처리
  const safeRealReturn =
    typeof netRealReturn === "number" && !isNaN(netRealReturn)
      ? netRealReturn
      : 0;

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
      {/* SUMMARY BOX */}
      <div className={`card p-5 mb-5 shadow-sm border ${statusColor}`}>
        <div className="flex items-center gap-4">
          {statusIcon}
          <div>
            <p className="text-base font-semibold">{statusText}</p>

            {fireYear ? (
              <p className="text-xs text-slate-600 mt-1">
                {isKo
                  ? `예상 달성 시점: 약 ${fireYear}년 후`
                  : `Estimated FIRE timing: in ${fireYear} years`}
              </p>
            ) : (
              <p className="text-xs text-slate-600 mt-1">
                {isKo
                  ? "현재 조건에서는 목표 자산에 도달하지 못합니다."
                  : "FIRE target is not reached under current assumptions."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3-CARD SECTION */}
      <div className="grid sm:grid-cols-3 gap-4">
        
        {/* FIRE 목표 자산 */}
        <div className="card p-4 bg-white text-center border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">
            {isKo ? "FIRE 목표 자산" : "FIRE Target"}
            <Tooltip text={isKo ? "연 지출 ÷ 출금률 (4% rule)" : "Spending ÷ withdrawal rate"} />
          </p>
          <p className="text-2xl font-bold text-emerald-600">
            {formatMoney(fireTarget, locale)}
          </p>
        </div>

        {/* 은퇴 시작 실질 자산 */}
        <div className="card p-4 bg-white text-center border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">
            {isKo ? "은퇴 시작 자산 (실질)" : "Start Assets (Real)"}
            <Tooltip text={isKo ? "물가 반영 구매력 기준" : "Inflation-adjusted"} />
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {formatMoney(retirementStartReal, locale)}
          </p>
        </div>

        {/* 자산 지속 기간 */}
        <div className="card p-4 bg-white text-center border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">
            {isKo ? "자산 지속 기간" : "Asset Longevity"}
          </p>
          <p className="flex items-center justify-center gap-2 text-2xl font-bold text-amber-600">
            <ClockIcon className="w-6 h-6 text-amber-500" />
            {depletion}
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed">
        {isKo ? (
          <>
            <p className="font-semibold mb-1">💡 실질 수익률(Real Return)이란?</p>

            <p>
              실질 수익률 = (1 + (명목 수익률 – 수수료) × (1 – 세율)) ÷ (1 + 인플레이션) – 1
              <br />
              → 물가·세금·수수료를 모두 반영한 <b>진짜 구매력 기준 수익률</b>입니다.
            </p>

            <p className="mt-2">
              현재 실질 수익률:{" "}
              <b>{(safeRealReturn * 100).toFixed(2)}%</b>
            </p>

            <p className="mt-2">
              🔸 1% 이하 → FIRE 매우 어려움
              <br />
              🔸 1~3% → 평균적이며 변수에 민감
              <br />
              🔸 3% 이상 → FIRE 가능성 크게 증가
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold mb-1">💡 What is Real Return?</p>

            <p>
              Real return = (1 + (nominal – fee)*(1 – tax)) / (1 + inflation) – 1
              <br />
              → The <b>true purchasing-power growth rate</b> after inflation & tax.
            </p>

            <p className="mt-2">
              Current real return:{" "}
              <b>{(safeRealReturn * 100).toFixed(2)}%</b>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
