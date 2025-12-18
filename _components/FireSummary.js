// _components/FireSummary.js — CTR BOOST EDITION
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";
import { formatKrwUnit } from "../lib/fire";

// -----------------------
// 금액 포맷
// -----------------------
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

// -----------------------
// Tooltip
// -----------------------
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

// -------------------------------------------------------------
// 🔥 MAIN SUMMARY COMPONENT
// -------------------------------------------------------------
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

  const safeRealReturn =
    typeof netRealReturn === "number" && !isNaN(netRealReturn)
      ? netRealReturn
      : 0;

  // 색상 + 메시지 세트
  const statusConfig = canFireAtEnd
    ? {
        box: "bg-emerald-600 text-white shadow-lg",
        icon: <CheckCircleIcon className="w-10 h-10 text-white" />,
        title: isKo
          ? "현재 가정에서 FIRE 달성이 가능합니다."
          : "FIRE is achievable under the current plan.",
        subtitle: fireYear
          ? isKo
            ? `예상 달성 시점: 약 ${fireYear}년 후`
            : `Estimated FIRE timing: in ${fireYear} years`
          : isKo
          ? "목표 자산에 도달하지 못합니다."
          : "Target assets are not reached.",
      }
    : {
        box: "bg-red-600 text-white shadow-lg",
        icon: <XCircleIcon className="w-10 h-10 text-white" />,
        title: isKo
          ? "현재 가정에서는 FIRE 달성이 어려울 수 있습니다."
          : "Reaching FIRE may be difficult with current assumptions.",
        subtitle: isKo
          ? "입력값(수익률·저축액·출금률)을 조정해보세요."
          : "Try adjusting returns, savings, or withdrawal rate.",
      };

  return (
    <section className="mb-10">

      {/* ------------------------------------------- */}
      {/* 🔥 1) Highlight Status Banner */}
      {/* ------------------------------------------- */}
      <div className={`w-full rounded-2xl p-6 flex items-center gap-4 ${statusConfig.box}`}>
        {statusConfig.icon}
        <div>
          <p className="text-lg font-bold">{statusConfig.title}</p>
          <p className="text-sm opacity-90 mt-1">{statusConfig.subtitle}</p>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* 🔥 2) 3 Summary Cards — Strong CTR */}
      {/* ------------------------------------------- */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">

        {/* FIRE Target */}
        <div className="p-5 rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer">
          <p className="text-xs text-slate-500 mb-1">
            {isKo ? "FIRE 목표 자산" : "FIRE Target"}
            <Tooltip text={isKo ? "연 지출 ÷ 출금률 (4% rule)" : "Spending ÷ Withdrawal rate"} />
          </p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {formatMoney(fireTarget, locale)}
          </p>
        </div>

        {/* Retirement Start Real Asset */}
        <div className="p-5 rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer">
          <p className="text-xs text-slate-500 mb-1">
            {isKo ? "은퇴 시작 자산 (실질)" : "Start Assets (Real)"}
            <Tooltip text={isKo ? "물가 반영 구매력 기준" : "Inflation-adjusted"} />
          </p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {formatMoney(retirementStartReal, locale)}
          </p>
        </div>

        {/* Asset Longevity */}
        <div className="p-5 rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer">
          <p className="text-xs text-slate-500 mb-1">
            {isKo ? "자산 지속 기간" : "Asset Longevity"}
          </p>
          <p className="flex items-center justify-center gap-2 text-3xl font-bold text-amber-600 mt-1">
            <ClockIcon className="w-7 h-7 text-amber-500" />
            {depletion}
          </p>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* 🔥 3) Real Return Info Panel */}
      {/* ------------------------------------------- */}
      <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed">

        {isKo ? (
          <>
            <p className="font-bold text-slate-700 mb-2 flex items-center gap-1">
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600" />
              실질 수익률(Real Return)
            </p>

            <p>
              실질 수익률은 물가·세금·수수료까지 모두 반영된
              <b> ‘실제 구매력 기준 자산 증가율’</b>입니다.
            </p>

            <p className="mt-2">
              현재 실질 수익률:{" "}
              <b className="text-emerald-700 text-lg">
                {(safeRealReturn * 100).toFixed(2)}%
              </b>
            </p>

            <ul className="mt-3 text-slate-700 text-xs leading-5">
              <li>🔻 1% 이하 → FIRE 매우 어려움</li>
              <li>🟡 1~3% → 평균적이며 민감</li>
              <li>🟢 3% 이상 → FIRE 가능성 증가</li>
            </ul>
          </>
        ) : (
          <>
            <p className="font-bold text-slate-700 mb-2 flex items-center gap-1">
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600" />
              Real Return
            </p>

            <p>
              Real return = actual purchasing-power growth after tax, fees,
              and inflation.
            </p>

            <p className="mt-2">
              Current real return:{" "}
              <b className="text-emerald-700 text-lg">
                {(safeRealReturn * 100).toFixed(2)}%
              </b>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
