// _components/FireReport.js — FINMAP Professional FIRE Report

import React from "react";
import { buildFireReport } from "../lib/fireReport";

export default function FireReport({ lang = "ko", result, params }) {
  if (!result) return null;

  const isKo = lang === "ko";
  const {
    fireTarget,
    retirementStartReal,
    netRealReturn,
    accumulation,
    retirement,
    risk,
    progressRateOverall,
  } = result;

  const fireYear = accumulation?.fireYear;
  const depletion = retirement?.depletionYear;

  const reportText = buildFireReport(result, params, lang);

  // 실질 수익률 평가 문구
  const safeRealReturn = Number(netRealReturn) || 0;
  const realReturnPct = (safeRealReturn * 100).toFixed(2);
  //const realReturnPct = (netRealReturn * 100).toFixed(2);
  let realReturnEval = "";

  if (netRealReturn < 0.01) {
    realReturnEval = isKo
      ? "매우 낮은 실질 성장률로 FIRE 달성이 상당히 어려운 환경입니다."
      : "Very low real return—FIRE becomes highly challenging.";
  } else if (netRealReturn < 0.03) {
    realReturnEval = isKo
      ? "현실적인 실질 성장률이지만, 변수에 취약할 수 있습니다."
      : "Moderate real return but vulnerable to inflation or fees.";
  } else {
    realReturnEval = isKo
      ? "양호한 실질 성장률로 FIRE 가능성이 크게 증가합니다."
      : "Strong real return—significantly increases FIRE feasibility.";
  }

  const prog = Number(progressRateOverall) || 0;

  return (
    <div className="card whitespace-pre-line mt-6 p-6 leading-relaxed shadow-sm border">
      <h2 className="text-lg font-semibold mb-3">
        {isKo ? "🔎 FIRE 전문가 분석 리포트" : "🔎 Professional FIRE Analysis Report"}
      </h2>

      {/* 기본 요약 리포트 */}
      <div className="bg-slate-50 p-3 border rounded-md text-sm mb-6">
        {reportText}
      </div>

      {/* 실질 수익률 분석 */}
      <section className="mb-4">
        <h3 className="font-semibold mb-1">
          {isKo ? "📌 실질 수익률 분석" : "📌 Real Return Analysis"}
        </h3>
        <p className="text-sm text-slate-700">
          {isKo
            ? `현재 실질 수익률은 약 ${realReturnPct}% 입니다. (세금·수수료·물가 반영)`
            : `Your estimated real return is ~${realReturnPct}% (after tax, fee, inflation).`}
        </p>
        <p className="text-sm text-slate-600 mt-1">{realReturnEval}</p>
      </section>

      {/* 목표 대비 진행률 */}
      <section className="mb-4">
        <h3 className="font-semibold mb-1">
          {isKo ? "📈 목표 대비 진행률" : "📈 Progress Toward FIRE"}
        </h3>
        <p className="text-sm text-slate-700">          
          {isKo
            ? `현재 FIRE 목표의 약 ${prog.toFixed(1)}%를 달성했습니다.`
            : `You have achieved about ${prog.toFixed(1)}% of your FIRE target.`}
        </p>
      </section>

      {/* 은퇴 자산 지속성 */}
      <section className="mb-4">
        <h3 className="font-semibold mb-1">
          {isKo ? "⏳ 자산 지속 기간 분석" : "⏳ Asset Longevity Analysis"}
        </h3>
        {depletion === null ? (
          <p className="text-sm text-green-700">
            {isKo ? "60년 이상 버텨 매우 안정적인 은퇴 구조입니다." : "Assets sustain 60+ years. Very stable retirement scenario."}
          </p>
        ) : (
          <p className="text-sm text-red-600">
            {isKo
              ? `은퇴 후 약 ${depletion}년 뒤 자산이 고갈될 수 있습니다.`
              : `Assets may deplete after ~${depletion} years.`}
          </p>
        )}
      </section>

      {/* 전략 추천 */}
      <section>
        <h3 className="font-semibold mb-1">
          {isKo ? "💡 FIRE 달성을 위한 전략 제안" : "💡 Recommended Strategies"}
        </h3>
        <ul className="list-disc ml-5 text-sm text-slate-700 space-y-1">
          <li>
            {isKo
              ? "세금·수수료를 줄이면 실질 수익률이 빠르게 개선됩니다."
              : "Reduce tax/fee drag to improve real return."}
          </li>
          <li>
            {isKo
              ? "출금률을 0.5%만 줄여도 목표 자산 규모가 크게 낮아집니다."
              : "Lowering the withdrawal rate by 0.5% significantly reduces target size."}
          </li>
          <li>
            {isKo
              ? "월 저축액 증가 또는 보너스 적립은 FIRE 달성 시점을 단축할 수 있습니다."
              : "Increasing contributions accelerates FIRE timeline."}
          </li>
          <li>
            {isKo
              ? "지출 최적화는 장기적인 FIRE 안정성에 가장 큰 영향을 줍니다."
              : "Optimizing annual spending is the strongest lever for FIRE stability."}
          </li>
        </ul>
      </section>
    </div>
  );
}
