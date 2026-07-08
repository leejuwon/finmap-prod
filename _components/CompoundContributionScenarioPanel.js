import { useEffect, useMemo, useRef, useState } from "react";
import { calcContributionScenario } from "../lib/compoundContributionScenario";
import { formatMoneyShort } from "./ValueDisplay";
import { trackGaEvent } from "../utils/analytics";

function readAmount(result, field) {
  const roundedValue = result?.rounded?.[field];
  return Number(roundedValue ?? result?.[field] ?? 0) || 0;
}

function formatMoney(value, currency, numberLocale) {
  if (currency === "KRW") return formatMoneyShort(value, numberLocale);
  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatSignedMoney(value, currency, numberLocale) {
  const amount = Number(value) || 0;
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}${formatMoney(Math.abs(amount), currency, numberLocale)}`;
}

function ResultCard({ title, badge, result, labels, currency, numberLocale, emphasis = false }) {
  const values = [
    [labels.principal, readAmount(result, "principalTotal")],
    [labels.finalValue, readAmount(result, "afterTaxFinalAmount")],
    [labels.gain, readAmount(result, "afterTaxInvestmentGain")],
    [labels.presentValue, readAmount(result, "presentValue")],
  ];

  return (
    <article className={`min-w-0 rounded-lg border p-4 ${
      emphasis ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"
    }`}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h3 className="break-words text-sm font-semibold text-slate-900">{title}</h3>
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
          emphasis ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
        }`}>
          {badge}
        </span>
      </div>
      <dl className="mt-4 grid min-w-0 grid-cols-2 gap-x-3 gap-y-4 text-sm">
        {values.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="break-words text-xs leading-5 text-slate-500">{label}</dt>
            <dd className="mt-0.5 break-words font-semibold leading-5 text-slate-900">
              {formatMoney(value, currency, numberLocale)}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export default function CompoundContributionScenarioPanel({
  locale = "ko",
  numberLocale = "ko-KR",
  currency = "KRW",
  baseResult,
  invest,
  taxRatePercent = 0,
  feeRatePercent = 0,
  inflationRate = 0,
  baseYear,
}) {
  const isKo = locale === "ko";
  const defaultExtraAmount = currency === "KRW" ? 500 : 5_000;
  const maxYears = Math.max(1, Math.floor(Number(invest?.years) || 1));
  const panelRef = useRef(null);
  const trackedSignatureRef = useRef("");
  const previousCurrencyRef = useRef(currency);
  const [growthRate, setGrowthRate] = useState(5);
  const [extraAmountInput, setExtraAmountInput] = useState(defaultExtraAmount);
  const [extraYear, setExtraYear] = useState(Math.min(3, maxYears));
  const [extraMonthOfYear, setExtraMonthOfYear] = useState(1);

  const labels = isKo
    ? {
        title: "적립금 증가·추가 납입 시나리오",
        summary: "기본 결과는 유지하고, 납입 계획만 바꾼 별도 시나리오를 비교합니다.",
        presets: "시나리오 프리셋",
        noGrowth: "증가 없음",
        growthFive: "매년 5% 증가",
        extraYearThree: "3년 차 500만원 추가",
        combined: "5% 증가 + 3년 차 500만원",
        growthLabel: "매년 월 적립금 증가율",
        growthHelp: "1년차는 현재 월 적립금을 그대로 쓰고, 2년차부터 매년 시작 시 월 적립금이 증가합니다.",
        extraLabel: "일시 추가 납입금",
        extraYear: "추가 납입 연차",
        extraMonth: "추가 납입 월",
        yearSuffix: "년 차",
        monthSuffix: "월",
        current: "현재 기본 결과",
        scenario: "시나리오 결과",
        baseBadge: "기본",
        scenarioBadge: "별도 비교",
        principal: "총 납입원금",
        finalValue: "세후 최종금액",
        gain: "세후 수익",
        presentValue: "현재가치",
        difference: "기본 결과 대비 변화",
        principalDiff: "추가 납입원금",
        finalDiff: "세후 최종금액 차이",
        gainDiff: "세후 수익 차이",
        presentDiff: "현재가치 차이",
        differenceCopy: "이 시나리오는 현재 기본 계산보다 납입원금이 {principalDiff} 달라지고, 세후 최종금액은 {finalDiff} 달라집니다.",
        note: "이 시나리오는 기본 계산값을 바꾸지 않는 별도 비교입니다. 월 적립금 증가율과 일시 추가 납입은 교육용 고정 수익률 가정으로 계산되며, 실제 투자 수익률·납입 시점·세금·수수료 방식과 다를 수 있습니다.",
        invalid: "현재 입력으로 시나리오 결과를 계산할 수 없습니다.",
      }
    : {
        title: "Contribution Growth & Extra Deposit Scenario",
        summary: "Keep the base result unchanged and compare a separate contribution plan.",
        presets: "Scenario presets",
        noGrowth: "No growth",
        growthFive: "5% annual increase",
        extraYearThree: "Extra deposit in year 3",
        combined: "5% increase + extra deposit",
        growthLabel: "Annual increase in monthly contribution",
        growthHelp: "Year 1 uses the current monthly contribution. The amount increases at the start of each year from year 2.",
        extraLabel: "One-time extra deposit",
        extraYear: "Deposit year",
        extraMonth: "Deposit month",
        yearSuffix: "Year",
        monthSuffix: "Month",
        current: "Current base result",
        scenario: "Scenario result",
        baseBadge: "Base",
        scenarioBadge: "Separate",
        principal: "Total contributions",
        finalValue: "After-tax final value",
        gain: "After-tax gain",
        presentValue: "Present value",
        difference: "Change from base result",
        principalDiff: "Additional contributions",
        finalDiff: "After-tax final value change",
        gainDiff: "After-tax gain change",
        presentDiff: "Present value change",
        differenceCopy: "This scenario changes total contributions by {principalDiff} and after-tax final value by {finalDiff} compared with the current base result.",
        note: "This is a separate scenario comparison and does not change the base result. Contribution growth and extra deposits are calculated under fixed educational assumptions, and actual returns, timing, taxes and fees may differ.",
        invalid: "The scenario cannot be calculated with the current inputs.",
      };

  useEffect(() => {
    if (previousCurrencyRef.current === currency) return;
    setExtraAmountInput((current) => Number(current) > 0 ? defaultExtraAmount : 0);
    previousCurrencyRef.current = currency;
  }, [currency, defaultExtraAmount]);

  useEffect(() => {
    setExtraYear((current) => Math.min(Math.max(1, current), maxYears));
  }, [maxYears]);

  const scenarioResult = useMemo(() => {
    const extraScale = currency === "KRW" ? 10_000 : 1;
    const extraContributionAmount = Math.max(0, Number(extraAmountInput) || 0) * extraScale;
    const extraContributionMonth = extraContributionAmount > 0
      ? (Number(extraYear) - 1) * 12 + Number(extraMonthOfYear)
      : null;

    return calcContributionScenario({
      principal: Number(invest?.principal) || 0,
      monthly: Number(invest?.monthly) || 0,
      annualRate: Number(invest?.annualRate) || 0,
      years: Number(invest?.years) || 0,
      taxRatePercent: Number(taxRatePercent) || 0,
      feeRatePercent: Number(feeRatePercent) || 0,
      inflationRate: Number(inflationRate) || 0,
      monthlyGrowthRatePercent: Number(growthRate),
      extraContributionAmount,
      extraContributionMonth,
      currency,
      baseYear,
    });
  }, [
    baseYear,
    currency,
    extraAmountInput,
    extraMonthOfYear,
    extraYear,
    feeRatePercent,
    growthRate,
    inflationRate,
    invest,
    taxRatePercent,
  ]);

  const differences = useMemo(() => ({
    principal: readAmount(scenarioResult, "principalTotal") - readAmount(baseResult, "principalTotal"),
    finalValue: readAmount(scenarioResult, "afterTaxFinalAmount") - readAmount(baseResult, "afterTaxFinalAmount"),
    gain: readAmount(scenarioResult, "afterTaxInvestmentGain") - readAmount(baseResult, "afterTaxInvestmentGain"),
    presentValue: readAmount(scenarioResult, "presentValue") - readAmount(baseResult, "presentValue"),
  }), [baseResult, scenarioResult]);

  const resultSignature = `${readAmount(baseResult, "afterTaxFinalAmount")}:${currency}:${baseYear}`;

  useEffect(() => {
    if (
      !panelRef.current ||
      trackedSignatureRef.current === resultSignature ||
      typeof IntersectionObserver === "undefined"
    ) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) return;
        trackedSignatureRef.current = resultSignature;
        trackGaEvent("tool_contribution_scenario_view", {
          source_tool: "compound",
          locale,
          currency,
          location: "result_contribution_scenario",
          scenario_type: "growth_extra_contribution",
        });
        observer.disconnect();
      },
      { threshold: [0.5] }
    );

    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [currency, locale, resultSignature]);

  const trackPreset = (presetType) => {
    trackGaEvent("tool_contribution_scenario_preset_click", {
      source_tool: "compound",
      locale,
      currency,
      location: "result_contribution_scenario",
      preset_type: presetType,
    });
  };

  const applyGrowthPreset = (value) => {
    setGrowthRate(value);
    trackPreset(`growth_${value}`);
  };

  const applyScenarioPreset = (presetType) => {
    if (presetType === "no_growth") {
      setGrowthRate(0);
      setExtraAmountInput(0);
    } else if (presetType === "growth_5") {
      setGrowthRate(5);
      setExtraAmountInput(0);
    } else if (presetType === "extra_year_3") {
      setGrowthRate(0);
      setExtraAmountInput(defaultExtraAmount);
      setExtraYear(Math.min(3, maxYears));
      setExtraMonthOfYear(1);
    } else if (presetType === "growth_5_extra_year_3") {
      setGrowthRate(5);
      setExtraAmountInput(defaultExtraAmount);
      setExtraYear(Math.min(3, maxYears));
      setExtraMonthOfYear(1);
    }
    trackPreset(presetType);
  };

  const differenceCopy = labels.differenceCopy
    .replace("{principalDiff}", formatSignedMoney(differences.principal, currency, numberLocale))
    .replace("{finalDiff}", formatSignedMoney(differences.finalValue, currency, numberLocale));

  return (
    <details
      ref={panelRef}
      className="min-w-0 max-w-full border-y border-slate-200 bg-white py-1"
      data-testid="compound-contribution-scenario"
      data-scenario-type="growth_extra_contribution"
    >
      <summary className="cursor-pointer list-none px-1 py-4 marker:hidden">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold text-slate-900">{labels.title}</h2>
            <p className="mt-1 break-words text-sm leading-6 text-slate-600">{labels.summary}</p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {isKo ? "펼치기" : "Open"}
          </span>
        </div>
      </summary>

      <div className="grid min-w-0 gap-5 border-t border-slate-200 px-1 py-5">
        <section className="min-w-0" aria-labelledby="contribution-scenario-presets">
          <h3 id="contribution-scenario-presets" className="text-sm font-semibold text-slate-900">{labels.presets}</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["no_growth", labels.noGrowth],
              ["growth_5", labels.growthFive],
              ["extra_year_3", labels.extraYearThree],
              ["growth_5_extra_year_3", labels.combined],
            ].map(([type, label]) => (
              <button
                key={type}
                type="button"
                className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-semibold leading-5 text-slate-700 hover:bg-slate-50"
                data-scenario-preset={type}
                onClick={() => applyScenarioPreset(type)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="grid min-w-0 gap-5 border-t border-slate-200 pt-5 md:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="contribution-growth-rate" className="text-sm font-semibold text-slate-900">
              {labels.growthLabel}
            </label>
            <div className="mt-2 flex min-w-0 items-center gap-2">
              <input
                id="contribution-growth-rate"
                type="number"
                min="-99"
                max="100"
                step="0.1"
                value={growthRate}
                onChange={(event) => setGrowthRate(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
              />
              <span className="shrink-0 text-sm text-slate-600">%</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2" aria-label={labels.growthLabel}>
              {[0, 3, 5, 10].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="min-h-[40px] rounded-lg border border-slate-200 bg-slate-50 px-1 py-2 text-xs font-semibold text-slate-700"
                  data-growth-preset={value}
                  onClick={() => applyGrowthPreset(value)}
                >
                  {value}%
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{labels.growthHelp}</p>
          </div>

          <div className="min-w-0">
            <label htmlFor="contribution-extra-amount" className="text-sm font-semibold text-slate-900">
              {labels.extraLabel}
            </label>
            <div className="mt-2 flex min-w-0 items-center gap-2">
              <input
                id="contribution-extra-amount"
                type="number"
                min="0"
                step="1"
                value={extraAmountInput}
                onChange={(event) => setExtraAmountInput(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
              />
              <span className="shrink-0 text-sm text-slate-600">{currency === "KRW" ? (isKo ? "만원" : "KRW 10k") : "USD"}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="min-w-0 text-xs text-slate-600">
                {labels.extraYear}
                <select
                  value={extraYear}
                  onChange={(event) => setExtraYear(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900"
                  data-testid="contribution-extra-year"
                >
                  {Array.from({ length: maxYears }, (_, index) => index + 1).map((year) => (
                    <option key={year} value={year}>
                      {isKo ? `${year}${labels.yearSuffix}` : `${labels.yearSuffix} ${year}`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="min-w-0 text-xs text-slate-600">
                {labels.extraMonth}
                <select
                  value={extraMonthOfYear}
                  onChange={(event) => setExtraMonthOfYear(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900"
                  data-testid="contribution-extra-month"
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                    <option key={month} value={month}>
                      {isKo ? `${month}${labels.monthSuffix}` : `${labels.monthSuffix} ${month}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        {scenarioResult?.ok ? (
          <>
            <div className="grid min-w-0 gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">
              <ResultCard
                title={labels.current}
                badge={labels.baseBadge}
                result={baseResult}
                labels={labels}
                currency={currency}
                numberLocale={numberLocale}
                emphasis
              />
              <ResultCard
                title={labels.scenario}
                badge={labels.scenarioBadge}
                result={scenarioResult}
                labels={labels}
                currency={currency}
                numberLocale={numberLocale}
              />
            </div>

            <section className="rounded-lg border border-teal-200 bg-teal-50 p-4" data-testid="contribution-scenario-difference">
              <h3 className="text-sm font-semibold text-teal-900">{labels.difference}</h3>
              <dl className="mt-3 grid min-w-0 grid-cols-2 gap-3 text-sm">
                {[
                  [labels.principalDiff, differences.principal],
                  [labels.finalDiff, differences.finalValue],
                  [labels.gainDiff, differences.gain],
                  [labels.presentDiff, differences.presentValue],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="break-words text-xs leading-5 text-teal-700">{label}</dt>
                    <dd className="mt-0.5 break-words font-semibold text-teal-950">
                      {formatSignedMoney(value, currency, numberLocale)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 break-words text-sm leading-6 text-teal-900">{differenceCopy}</p>
            </section>
          </>
        ) : (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{labels.invalid}</p>
        )}

        <p className="border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">{labels.note}</p>
      </div>
    </details>
  );
}
