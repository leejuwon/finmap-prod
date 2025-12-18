// _components/FireReport.js — FINMAP Consulting Report Edition (Premium)

import React from "react";
import { buildFireReport } from "../lib/fireReport";
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";

function Badge({ color = "blue", children }) {
  const map = {
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    green: "bg-emerald-100 text-emerald-700 border-emerald-300",
    yellow: "bg-amber-100 text-amber-700 border-amber-300",
    red: "bg-red-100 text-red-700 border-red-300",
    gray: "bg-slate-100 text-slate-700 border-slate-300",
  };

  return (
    <span
      className={`px-2 py-[2px] text-xs font-medium rounded-md border ${map[color]}`}
    >
      {children}
    </span>
  );
}

export default function FireReport({ lang = "ko", result, params }) {
  if (!result) return null;

  const isKo = lang === "ko";
  const {
    fireTarget,
    retirementStartReal,
    netRealReturn,
    accumulation,
    retirement,
    progressRateOverall,
  } = result;

  const fireYear = accumulation?.fireYear;
  const depletion = retirement?.depletionYear;

  const reportText = buildFireReport(result, params, lang);

  const realReturnPct = ((Number(netRealReturn) || 0) * 100).toFixed(2);
  const prog = Number(progressRateOverall) || 0;

  // 실질 수익률 평가
  let realReturnLevel = "yellow";
  let realReturnText = isKo
    ? "현실적인 수준이지만 변수에 취약할 수 있습니다."
    : "Moderate level but vulnerable to major variables.";

  if (netRealReturn < 0.01) {
    realReturnLevel = "red";
    realReturnText = isKo
      ? "매우 낮은 실질 성장률로 FIRE 달성이 어려운 환경입니다."
      : "Very low real return—FIRE feasibility is poor.";
  } else if (netRealReturn >= 0.03) {
    realReturnLevel = "green";
    realReturnText = isKo
      ? "강한 실질 성장률로 FIRE 가능성이 크게 증가합니다."
      : "Strong real return—high FIRE feasibility.";
  }

  // 은퇴 후 자산 안정성
  let stabilityColor = depletion ? "yellow" : "green";
  let stabilityText = depletion
    ? isKo
      ? `은퇴 후 약 ${depletion}년 뒤 자산이 고갈될 수 있습니다.`
      : `Assets may deplete after around ${depletion} years.`
    : isKo
    ? "은퇴 후 60년 이상 지속 가능한 매우 안정적인 구조입니다."
    : "Assets remain sustainable for 60+ years.";

  return (
    <div className="card mt-8 p-6 shadow-sm border text-slate-800">

      {/* HEADER */}
      <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
        <ChartBarIcon className="w-5 h-5 text-blue-600" />
        {isKo ? "FIRE 맞춤형 전문가 보고서" : "Personalized FIRE Consulting Report"}
      </h2>

      {/* 1) Executive Summary */}
      <section className="bg-slate-50 border p-4 rounded-lg mb-6 text-sm leading-relaxed">
        <h3 className="font-semibold mb-2">
          {isKo ? "📘 요약 진단" : "📘 Executive Summary"}
        </h3>
        <div className="whitespace-pre-line text-slate-700">{reportText}</div>
      </section>

      {/* 2) 핵심 지표 분석 */}
      <section className="mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600" />
          {isKo ? "핵심 지표 분석" : "Key Metric Analysis"}
        </h3>

        <div className="grid md:grid-cols-3 gap-4">

          {/* Real Return */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <p className="text-xs text-slate-500 mb-1">
              {isKo ? "실질 수익률" : "Real Return"}
            </p>
            <p className="text-2xl font-bold">{realReturnPct}%</p>
            <div className="mt-2">
              <Badge color={realReturnLevel}>
                {isKo ? "평가" : "Evaluation"}
              </Badge>
            </div>
            <p className="text-xs mt-2 text-slate-600">{realReturnText}</p>
          </div>

          {/* Progress */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <p className="text-xs text-slate-500 mb-1">
              {isKo ? "목표 달성률" : "Progress to FIRE"}
            </p>
            <p className="text-2xl font-bold">{prog.toFixed(1)}%</p>
            <div className="mt-2">
              <Badge color={prog >= 50 ? "blue" : "gray"}>
                {prog >= 50
                  ? isKo
                    ? "절반 이상 달성"
                    : "50%+ Achieved"
                  : isKo
                  ? "진행 중"
                  : "In progress"}
              </Badge>
            </div>
            <p className="text-xs mt-2 text-slate-600">
              {isKo
                ? `전체 FIRE 목표 대비 ${prog.toFixed(1)}% 도달했습니다.`
                : `You have reached ${prog.toFixed(1)}% of your FIRE target.`}
            </p>
          </div>

          {/* Longevity */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <p className="text-xs text-slate-500 mb-1">
              {isKo ? "자산 지속성" : "Asset Longevity"}
            </p>
            <p className="text-2xl font-bold">
              {depletion ? `${depletion} yrs` : "60+ yrs"}
            </p>
            <div className="mt-2">
              <Badge color={stabilityColor}>
                {isKo ? "안정성 평가" : "Stability"}
              </Badge>
            </div>
            <p className="text-xs mt-2 text-slate-600">{stabilityText}</p>
          </div>
        </div>
      </section>

      {/* 3) 전략 섹션 */}
      <section>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-amber-500" />
          {isKo ? "FIRE 달성을 위한 전략적 제안" : "Strategic Recommendations"}
        </h3>

        <ul className="list-disc ml-6 text-sm text-slate-700 space-y-2">
          <li>
            {isKo
              ? "세금·수수료 절감은 장기 실질 수익률 개선에 가장 효과적입니다."
              : "Reducing taxes/fees significantly improves long-term real return."}
          </li>

          <li>
            {isKo
              ? "출금률을 0.5%만 낮추어도 목표 자산 규모가 크게 줄어듭니다."
              : "Lowering your withdrawal rate by 0.5% reduces required target assets."}
          </li>

          <li>
            {isKo
              ? "월 투자액 증가 또는 보너스 적립은 FIRE 도달 시점을 앞당깁니다."
              : "Increasing contributions accelerates FIRE timeline."}
          </li>

          <li>
            {isKo
              ? "지출 최적화는 은퇴 후 자산 지속성에 가장 강력한 영향을 줍니다."
              : "Optimizing spending has the strongest impact on long-term stability."}
          </li>
        </ul>
      </section>

    </div>
  );
}
