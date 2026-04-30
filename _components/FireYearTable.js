// _components/FireYearTable.js — CARD EDITION + Toggle

import { formatKrwUnit } from "../lib/fire";
import { useMemo, useState } from "react";

// ----------------------
// 금액 포맷 공통 처리
// ----------------------
function formatMoney(value, locale = "ko-KR") {
  const num = Number(value) || 0;

  if (locale === "ko-KR") return formatKrwUnit(num);

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000_000) return sign + "$" + (abs / 1_000_000_000).toFixed(2) + "B";
  if (abs >= 1_000_000) return sign + "$" + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return sign + "$" + (abs / 1_000).toFixed(1) + "K";
  return sign + "$" + abs.toLocaleString("en-US");
}

function addRange(years, center, before, after) {
  if (!center) return;
  for (let year = center - before; year <= center + after; year++) {
    if (year > 0) years.add(year);
  }
}

function buildCoreTimeline(timeline, { fireYear, retirementStartYear }) {
  if (!timeline?.length) return [];

  const years = new Set();

  // 초기 흐름, FIRE 도달 시점, 은퇴 전후, 고갈 전후, 마지막 구간만 기본 표시.
  timeline.slice(0, 3).forEach((row) => years.add(row.year));
  addRange(years, fireYear, 2, 2);
  addRange(years, retirementStartYear, 5, 10);

  const depletionYear = timeline.find(
    (row) => row.phase === "retirement" && Number(row.assetReal) <= 0
  )?.year;
  addRange(years, depletionYear, 2, 2);

  timeline.slice(-5).forEach((row) => years.add(row.year));

  return timeline.filter((row) => years.has(row.year));
}

export default function FireYearTable({ timeline = [], locale = "ko-KR" }) {
  const isKo = locale === "ko-KR";
  const safeTimeline = Array.isArray(timeline) ? timeline : [];
  const [showAll, setShowAll] = useState(false);

  const fireIndex = safeTimeline.findIndex(
    (d) => d.assetReal >= d.fireTarget && d.phase === "accumulation"
  );
  const fireYear = fireIndex !== -1 ? safeTimeline[fireIndex].year : null;

  const retirementStartYear =
    safeTimeline.find((d) => d.phase === "retirement")?.year || null;

  const coreTimeline = useMemo(
    () => buildCoreTimeline(safeTimeline, { fireYear, retirementStartYear }),
    [safeTimeline, fireYear, retirementStartYear]
  );

  if (safeTimeline.length === 0) return null;

  const visibleTimeline = showAll ? safeTimeline : coreTimeline;
  const canToggle = coreTimeline.length < safeTimeline.length;

  return (
    <section className="mt-10">

      {/* ----------------------------------------------------- */}
      {/* 🔥 Header + Toggle */}
      {/* ----------------------------------------------------- */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">
              {isKo ? "연도별 시뮬레이션 결과" : "Yearly Simulation Overview"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {showAll
                ? isKo
                  ? `전체 ${safeTimeline.length}개 연도를 표시 중입니다.`
                  : `Showing all ${safeTimeline.length} years.`
                : isKo
                ? `핵심 구간 ${visibleTimeline.length}개만 먼저 표시합니다.`
                : `Showing ${visibleTimeline.length} key years first.`}
            </p>
          </div>

          {canToggle && (
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto justify-center"
              aria-expanded={showAll}
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll
                ? isKo
                  ? "핵심 구간만 보기"
                  : "Show key years"
                : isKo
                ? "전체 60년 보기"
                : "Show full 60-year view"}
            </button>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* 🔥 카드 리스트 */}
      {/* ----------------------------------------------------- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

        {visibleTimeline.map((row) => {
          const isAcc = row.phase === "accumulation";
          const isRet = row.phase === "retirement";

          const cashNum =
            isAcc ? row.contributionYear :
            isRet ? -row.withdrawal :
            0;

          const isFireHit = fireYear === row.year;
          const isStartRet = retirementStartYear === row.year;

          return (
            <div
              key={`${row.year}-${row.phase}`}
              className={`
                card border p-4 shadow-sm relative cursor-pointer transition 
                hover:shadow-md
                ${isFireHit ? "ring-2 ring-amber-400" : ""}
                ${isStartRet ? "ring-2 ring-blue-400" : ""}
              `}
            >
              {/* 상단 머리 */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {row.year}년
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isAcc ? (isKo ? "적립 기간" : "Accumulation") :
                     isKo ? "은퇴 기간" : "Retirement"}
                  </p>
                </div>

                {isFireHit && (
                  <span className="text-amber-600 text-xs font-bold">🔥 FIRE</span>
                )}
                {isStartRet && (
                  <span className="text-blue-600 text-xs font-bold">🔵 RETIRE</span>
                )}
              </div>

              {/* 본문 내용 */}
              <div className="space-y-1 text-xs text-slate-600">

                <div className="flex justify-between">
                  <span>{isKo ? "현금흐름" : "Cashflow"}</span>
                  <span className={cashNum >= 0 ? "text-blue-600" : "text-red-500"}>
                    {cashNum !== 0 ? formatMoney(cashNum, locale) : "-"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>{isKo ? "명목 수익" : "Nominal"}</span>
                  <span>{formatMoney(row.nominalYield, locale)}</span>
                </div>

                <div className="flex justify-between">
                  <span>{isKo ? "실질 수익" : "Real"}</span>
                  <span>{formatMoney(row.realYield, locale)}</span>
                </div>

                <div className="flex justify-between">
                  <span>{isKo ? "누적 저축" : "Cumulative"}</span>
                  <span>{formatMoney(row.cumulativeContribution, locale)}</span>
                </div>

                <div className="flex justify-between">
                  <span>{isKo ? "실질 자산" : "Real Asset"}</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(row.assetReal, locale)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>{isKo ? "명목 자산" : "Nominal Asset"}</span>
                  <span className="text-slate-500">
                    {formatMoney(row.assetNominal, locale)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>{isKo ? "목표 대비" : "Progress"}</span>
                  <span className="font-medium">
                    {row.progressRate ? `${row.progressRate}%` : "-"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
}
