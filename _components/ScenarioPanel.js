// _components/ScenarioPanel.js
import { useMemo } from "react";
import { calcCompound } from "../lib/compound";
import ScenarioChart from "./ScenarioChart";
import ValueDisplay from "./ValueDisplay";

export default function ScenarioPanel({
  principal,
  monthly,
  years,
  annualRate,
  compounding = "monthly",
  taxRatePercent = 15.4,
  feeRatePercent = 0.5,
  baseYear = new Date().getFullYear(),
  locale = "ko-KR",
  currency = "KRW",
}) {
  const isKo = String(locale).toLowerCase().startsWith("ko");

  const scenarios = useMemo(
    () => [
      { key: "conservative", delta: -2, title: isKo ? "보수적" : "Conservative" },
      { key: "base", delta: 0, title: isKo ? "기본" : "Base" },
      { key: "aggressive", delta: +2, title: isKo ? "공격적" : "Aggressive" },
    ],
    [isKo]
  );

  const results = useMemo(() => {
    if (!years || years <= 0) return [];

    return scenarios.map((s) => {
      const r = Math.max(-99, (Number(annualRate) || 0) + s.delta);

      const out = calcCompound({
        principal,
        monthly,
        years,
        annualRate: r,
        compounding,
        taxRatePercent,
        feeRatePercent,
        baseYear,
      });

      return {
        ...s,
        annualRate: r,
        monthsTotal: out.monthsTotal,
        fvNet: out.futureValueNet,
        totalContrib: out.totalContribution,
        totalInterestNet: out.totalInterestNet,
        seriesNet: out.series?.map((row) => row.balanceNet) || [],
      };
    });
  }, [
    scenarios,
    principal,
    monthly,
    years,
    annualRate,
    compounding,
    taxRatePercent,
    feeRatePercent,
    baseYear,
  ]);

  const maxMonths = results?.[0]?.monthsTotal || 0;

  return (
    <div className="card mt-6">
      <h2 className="text-lg font-bold mb-2">
        {isKo ? "복리 시뮬레이션 (3가지 시나리오)" : "Compound Simulation (3 Scenarios)"}
      </h2>

      <p className="text-sm text-slate-600 mb-4">
        {isKo
          ? "랜덤 변동성 없이, 수익률을 ±2%로만 바꿔 보수적·기본·공격적 시나리오를 비교합니다."
          : "No randomness—compares conservative/base/aggressive by shifting annual return by ±2%."}
      </p>

      {/* 요약 카드 3개 */}
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        {results.map((r) => (
          <div key={r.key} className="border rounded-xl p-4 bg-white">
            <div className="text-xs text-slate-500 mb-1">{r.title}</div>
            <div className="text-sm text-slate-600 mb-2">
              {isKo ? "연 수익률" : "Annual return"}:{" "}
              <b>{r.annualRate.toFixed(2)}%</b>
            </div>

            <div className="text-xs text-slate-500">{isKo ? "세후 총자산" : "Net FV"}</div>
            <div className="text-base font-semibold">
              <ValueDisplay value={r.fvNet} locale={locale} currency={currency} />
            </div>

            <div className="mt-2 text-xs text-slate-500">
              {isKo ? "총 납입액" : "Total contribution"}:{" "}
              <ValueDisplay value={r.totalContrib} locale={locale} currency={currency} />
            </div>
            <div className="text-xs text-slate-500">
              {isKo ? "세후 이자" : "Net interest"}:{" "}
              <ValueDisplay value={r.totalInterestNet} locale={locale} currency={currency} />
            </div>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <ScenarioChart
        monthsTotal={maxMonths}
        results={results}
        locale={locale}
        currency={currency}
      />
    </div>
  );
}
