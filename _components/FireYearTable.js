// _components/FireYearTable.js — CARD EDITION + Sticky Header

import { formatKrwUnit } from "../lib/fire";
import { useState } from "react";

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

export default function FireYearTable({ timeline = [], locale = "ko-KR" }) {
  const isKo = locale === "ko-KR";
  if (!timeline || timeline.length === 0) return null;

  const fireIndex = timeline.findIndex(
    (d) => d.assetReal >= d.fireTarget && d.phase === "accumulation"
  );
  const fireYear = fireIndex !== -1 ? timeline[fireIndex].year : null;

  const retirementStartYear =
    timeline.find((d) => d.phase === "retirement")?.year || null;

  return (
    <section className="mt-10">

      {/* ----------------------------------------------------- */}
      {/* 🔥 Sticky Header */}
      {/* ----------------------------------------------------- */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b py-3 px-2">
        <h2 className="text-base font-semibold">
          {isKo ? "연도별 시뮬레이션 결과" : "Yearly Simulation Overview"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isKo
            ? "각 연도에 대한 자산·수익·지출 정보를 카드 형태로 확인하세요."
            : "Check yearly asset, income, and withdrawal details."}
        </p>
      </div>

      {/* ----------------------------------------------------- */}
      {/* 🔥 카드 리스트 */}
      {/* ----------------------------------------------------- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

        {timeline.map((row) => {
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
