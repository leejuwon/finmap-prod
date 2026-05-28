import { useMemo, useState } from "react";
import {
  RETIREMENT_SAMPLE_PRESETS,
  buildRetirementSensitivity,
  buildRetirementYearRows,
  simulateRetirementPlan,
  validateRetirementInputs,
} from "../lib/retirement";

const DEFAULT_INPUT = { ...RETIREMENT_SAMPLE_PRESETS.A };

const PRESET_META = {
  A: { ko: "기본형", en: "Base sample" },
  B: { ko: "적극저축형", en: "Higher-saving sample" },
  C: { ko: "준비부족형", en: "Shortfall sample" },
  D: { ko: "은퇴직전형", en: "At-retirement sample" },
};

const LABELS = {
  ko: {
    title: "은퇴자금 상세 입력",
    eyebrow: "검증 코어 기반",
    desc:
      "현재나이, 은퇴나이, 기대수명, 월생활비를 직접 입력해 은퇴 시점 예상 자산과 필요 은퇴자금을 비교합니다.",
    moneyNote: "금액 입력은 원(KRW) 기준입니다.",
    presetNote: "A~D는 검증 스크립트와 동일한 테스트 샘플입니다.",
    currentAge: "현재나이",
    retirementAge: "은퇴나이",
    lifeExpectancy: "기대수명",
    currentAssets: "현재자산",
    monthlySaving: "월저축",
    annualReturn: "은퇴 전 예상수익률(%)",
    retirementReturn: "은퇴 후 예상수익률(%)",
    inflation: "물가상승률(%)",
    monthlyExpense: "현재 월생활비",
    run: "상세 은퇴자금 계산",
    presets: "검증 샘플 프리셋",
    summary: "핵심 요약",
    expense: "은퇴 시점 생활비",
    sustainable: "은퇴 후 사용 가능액",
    savingGuide: "목표 달성 월저축",
    interpretation: "결과 해석",
    sensitivity: "민감도 분석",
    yearly: "연도별 예상 자산 추이",
    showAll: "전체 보기",
    showKey: "10년만 보기",
    expectedAssets: "예상 은퇴자산",
    requiredFund: "필요 은퇴자금",
    surplus: "부족/초과",
    achievement: "목표 달성률",
    currentExpense: "현재 월생활비",
    expenseAtRetirement: "은퇴 시점 월생활비",
    expenseIncrease: "물가상승 증가분",
    yearsToRetirement: "은퇴까지 남은 연수",
    sustainableAtRetirement: "은퇴 시점 기준 유지 가능 월생활비",
    sustainablePresent: "현재가치 기준 유지 가능 월생활비",
    expenseGap: "목표 월생활비 대비 차이",
    requiredSaving: "목표 달성 필요 월저축",
    currentSaving: "현재 월저축",
    extraSaving: "추가 필요 월저축",
    noExtra:
      "현재 입력값 기준 추가 저축 없이 목표 달성이 가능한 것으로 계산됩니다.",
    noReverse:
      "은퇴시점이 현재와 같거나 적립기간이 없어 월저축 역산이 어렵습니다.",
    simNote: "입력값 기준 시뮬레이션입니다.",
    stable: "안정권",
    near: "목표에 근접",
    adjust: "저축·은퇴시점·생활비 조정 필요",
    rebuild: "계획 재설계 필요",
    scenario: "시나리오",
    age: "나이",
    elapsed: "경과연수",
    asset: "예상자산",
    cumulativeSaving: "누적저축",
    gain: "투자수익 추정",
    targetRate: "목표 대비율",
  },
  en: {
    title: "Detailed retirement inputs",
    eyebrow: "Verified calculation core",
    desc:
      "Enter age, retirement age, life expectancy, monthly expense, savings, and returns to compare projected assets with the retirement fund needed.",
    moneyNote: "Money inputs are in Korean won (KRW).",
    presetNote: "A-D are the same verified samples used by the test script.",
    currentAge: "Current age",
    retirementAge: "Retirement age",
    lifeExpectancy: "Life expectancy",
    currentAssets: "Current assets",
    monthlySaving: "Monthly saving",
    annualReturn: "Pre-retirement return (%)",
    retirementReturn: "Post-retirement return (%)",
    inflation: "Inflation (%)",
    monthlyExpense: "Current monthly expense",
    run: "Run detailed retirement plan",
    presets: "Verified sample presets",
    summary: "Key summary",
    expense: "Retirement-date expense",
    sustainable: "Sustainable spending",
    savingGuide: "Required monthly saving",
    interpretation: "Interpretation",
    sensitivity: "Sensitivity analysis",
    yearly: "Year-by-year asset path",
    showAll: "Show all",
    showKey: "Show first 10 years",
    expectedAssets: "Projected retirement assets",
    requiredFund: "Required retirement fund",
    surplus: "Surplus / shortfall",
    achievement: "Achievement rate",
    currentExpense: "Current monthly expense",
    expenseAtRetirement: "Monthly expense at retirement",
    expenseIncrease: "Inflation increase",
    yearsToRetirement: "Years to retirement",
    sustainableAtRetirement: "Sustainable monthly expense at retirement",
    sustainablePresent: "Sustainable monthly expense in today's value",
    expenseGap: "Gap vs target monthly expense",
    requiredSaving: "Required monthly saving",
    currentSaving: "Current monthly saving",
    extraSaving: "Additional monthly saving",
    noExtra:
      "With the current inputs, the target is projected without additional saving.",
    noReverse:
      "Monthly saving cannot be reverse-solved because retirement starts now or there is no accumulation period.",
    simNote: "This is a simulation based on the inputs.",
    stable: "Comfort zone",
    near: "Close to target",
    adjust: "Adjust saving, retirement age, or spending",
    rebuild: "Plan redesign needed",
    scenario: "Scenario",
    age: "Age",
    elapsed: "Elapsed years",
    asset: "Projected assets",
    cumulativeSaving: "Cumulative saving",
    gain: "Estimated investment gain",
    targetRate: "Target progress",
  },
};

function numeric(value) {
  if (value === "" || value === null || value === undefined) return "";
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : "";
}

function formatInput(value, locale) {
  if (value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString(locale, { maximumFractionDigits: 2 });
}

function money(value, locale = "ko-KR", currency = "KRW") {
  if (value === null) return "-";
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${n.toFixed(2)}%`;
}

function years(value, isKo) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString(isKo ? "ko-KR" : "en-US", {
    maximumFractionDigits: 1,
  })}${isKo ? "년" : "y"}`;
}

function toneClass(value) {
  return Number(value) >= 0 ? "text-emerald-700" : "text-rose-700";
}

function cardClass(value) {
  return Number(value) >= 0
    ? "border-emerald-100 bg-emerald-50"
    : "border-rose-100 bg-rose-50";
}

function getInterpretation(rate, t) {
  const value = Number(rate) || 0;
  if (value >= 100) return { label: t.stable, className: "bg-emerald-50 text-emerald-800 border-emerald-200" };
  if (value >= 80) return { label: t.near, className: "bg-blue-50 text-blue-800 border-blue-200" };
  if (value >= 50) return { label: t.adjust, className: "bg-amber-50 text-amber-900 border-amber-200" };
  return { label: t.rebuild, className: "bg-rose-50 text-rose-800 border-rose-200" };
}

function ResultMetric({ label, value, className = "", valueClassName = "" }) {
  const valueColor = valueClassName || "text-slate-900";

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 break-words text-lg font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}

export default function RetirementDetailSimulator({ lang = "ko" }) {
  const isKo = lang === "ko";
  const t = LABELS[isKo ? "ko" : "en"];
  const locale = isKo ? "ko-KR" : "en-US";
  const currency = "KRW";
  const [form, setForm] = useState(DEFAULT_INPUT);
  const [submitted, setSubmitted] = useState(DEFAULT_INPUT);
  const [showAllYears, setShowAllYears] = useState(false);

  const validation = useMemo(() => validateRetirementInputs(form), [form]);
  const result = useMemo(() => simulateRetirementPlan(submitted), [submitted]);
  const sensitivity = useMemo(
    () => buildRetirementSensitivity(submitted),
    [submitted]
  );
  const yearRows = useMemo(() => buildRetirementYearRows(submitted), [submitted]);

  const handleChange = (key) => (event) => {
    const value = numeric(event.target.value);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (key) => {
    const next = { ...RETIREMENT_SAMPLE_PRESETS[key] };
    setForm(next);
    setSubmitted(next);
    setShowAllYears(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextValidation = validateRetirementInputs(form);
    if (!nextValidation.ok) return;
    setSubmitted(
      Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, Number(value)])
      )
    );
    setShowAllYears(false);
  };

  const inputFields = [
    "currentAge",
    "retirementAge",
    "lifeExpectancy",
    "currentAssets",
    "monthlySaving",
    "annualReturn",
    "retirementReturn",
    "inflation",
    "monthlyExpense",
  ];

  const r = result.ok ? result.rounded : null;
  const interpretation = r ? getInterpretation(r.achievementRate, t) : null;
  const expenseIncrease = r
    ? r.monthlyExpenseAtRetirement - Number(result.input.monthlyExpense)
    : 0;
  const expenseGap = r
    ? r.sustainableMonthlyExpenseAtRetirement -
      r.monthlyExpenseAtRetirement
    : 0;
  const extraSaving =
    r?.requiredMonthlySaving == null
      ? null
      : Math.max(0, r.requiredMonthlySaving - Number(result.input.monthlySaving));
  const visibleYearRows = showAllYears ? yearRows : yearRows.slice(0, 11);

  return (
    <section className="card min-w-0">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t.eyebrow}
          </p>
          <h2 className="text-xl font-semibold text-slate-900">{t.title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
            {t.desc}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-600">
            {t.moneyNote}
          </p>
        </div>
        <div className="grid gap-2 sm:min-w-[260px]">
          <p className="text-xs text-slate-500">{t.presetNote}</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(RETIREMENT_SAMPLE_PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                title={`${key}: ${isKo ? PRESET_META[key].ko : PRESET_META[key].en}`}
                className="btn-secondary justify-center px-2"
                onClick={() => applyPreset(key)}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          {inputFields.map((key) => (
            <label key={key} className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">{t[key]}</span>
              <input
                className="input"
                inputMode="decimal"
                value={formatInput(form[key], locale)}
                onChange={handleChange(key)}
                aria-invalid={validation.errors.some((error) => error.field === key)}
              />
            </label>
          ))}
        </div>

        {!validation.ok && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <ul className="list-disc space-y-1 pl-5">
              {validation.errors.map((error) => (
                <li key={`${error.field}-${error.en}`}>
                  {isKo ? error.ko : error.en}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <button className="btn-primary" type="submit" disabled={!validation.ok}>
            {t.run}
          </button>
        </div>
      </form>

      {r && (
        <div className="mt-6 grid gap-6">
          <section>
            <h3 className="mb-3 text-base font-semibold">{t.summary}</h3>
            <div className="grid gap-3 md:grid-cols-4">
              <ResultMetric label={t.expectedAssets} value={money(r.expectedRetirementAssets, locale, currency)} />
              <ResultMetric label={t.requiredFund} value={money(r.requiredRetirementFund, locale, currency)} />
              <ResultMetric
                label={t.surplus}
                value={money(r.surplusOrShortfall, locale, currency)}
                className={cardClass(r.surplusOrShortfall)}
                valueClassName={toneClass(r.surplusOrShortfall)}
              />
              <ResultMetric label={t.achievement} value={pct(r.achievementRate)} />
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-semibold">{t.expense}</h3>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-3"><span>{t.currentExpense}</span><b>{money(result.input.monthlyExpense, locale, currency)}</b></div>
                <div className="flex justify-between gap-3"><span>{t.expenseAtRetirement}</span><b>{money(r.monthlyExpenseAtRetirement, locale, currency)}</b></div>
                <div className="flex justify-between gap-3"><span>{t.expenseIncrease}</span><b>{money(expenseIncrease, locale, currency)}</b></div>
                <div className="flex justify-between gap-3"><span>{t.yearsToRetirement}</span><b>{years(r.yearsToRetirement, isKo)}</b></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-semibold">{t.sustainable}</h3>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-3"><span>{t.sustainableAtRetirement}</span><b>{money(r.sustainableMonthlyExpenseAtRetirement, locale, currency)}</b></div>
                <div className="flex justify-between gap-3"><span>{t.sustainablePresent}</span><b>{money(r.sustainableMonthlyExpensePresentValue, locale, currency)}</b></div>
                <div className="flex justify-between gap-3"><span>{t.expenseGap}</span><b className={toneClass(expenseGap)}>{money(expenseGap, locale, currency)}</b></div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold">{t.savingGuide}</h3>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
              <div><span className="text-slate-500">{t.requiredSaving}</span><p className="font-semibold">{money(r.requiredMonthlySaving, locale, currency)}</p></div>
              <div><span className="text-slate-500">{t.currentSaving}</span><p className="font-semibold">{money(result.input.monthlySaving, locale, currency)}</p></div>
              <div><span className="text-slate-500">{t.extraSaving}</span><p className="font-semibold">{money(extraSaving, locale, currency)}</p></div>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {r.requiredMonthlySaving === 0
                ? t.noExtra
                : r.requiredMonthlySaving == null
                ? t.noReverse
                : `${t.simNote} ${t.extraSaving}: ${money(extraSaving, locale, currency)}`}
            </p>
          </section>

          <details className={`rounded-xl border p-4 ${interpretation.className}`} open>
            <summary className="cursor-pointer font-semibold">{t.interpretation}: {interpretation.label}</summary>
            <p className="mt-2 text-sm leading-relaxed">
              {t.simNote} {isKo
                ? "수익률, 물가, 은퇴시점, 생활비를 바꾸면 결과가 크게 달라질 수 있습니다."
                : "Changing return, inflation, retirement timing, or spending can materially change the result."}
            </p>
          </details>

          <section>
            <h3 className="mb-3 text-base font-semibold">{t.sensitivity}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-[760px] border-t text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {[t.scenario, t.expectedAssets, t.requiredFund, t.surplus, t.achievement].map((head) => (
                      <th key={head} className="px-3 py-2 text-left">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensitivity.map((row) => (
                    <tr key={row.key} className="border-t">
                      <td className="px-3 py-2 font-medium">{isKo ? row.ko : row.en}</td>
                      <td className="px-3 py-2">{money(row.rounded?.expectedRetirementAssets, locale, currency)}</td>
                      <td className="px-3 py-2">{money(row.rounded?.requiredRetirementFund, locale, currency)}</td>
                      <td className={`px-3 py-2 ${toneClass(row.rounded?.surplusOrShortfall)}`}>{money(row.rounded?.surplusOrShortfall, locale, currency)}</td>
                      <td className="px-3 py-2">{pct(row.rounded?.achievementRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base font-semibold">{t.yearly}</h3>
              {yearRows.length > 11 && (
                <button
                  type="button"
                  className="btn-secondary justify-center"
                  onClick={() => setShowAllYears((prev) => !prev)}
                >
                  {showAllYears ? t.showKey : t.showAll}
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[760px] border-t text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {[t.age, t.elapsed, t.asset, t.cumulativeSaving, t.gain, t.targetRate].map((head) => (
                      <th key={head} className="px-3 py-2 text-left">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleYearRows.map((row) => (
                    <tr key={row.elapsedYear} className="border-t">
                      <td className="px-3 py-2">{row.rounded.age}</td>
                      <td className="px-3 py-2">{years(row.rounded.elapsedYear, isKo)}</td>
                      <td className="px-3 py-2">{money(row.rounded.expectedAssets, locale, currency)}</td>
                      <td className="px-3 py-2">{money(row.rounded.cumulativeSaving, locale, currency)}</td>
                      <td className="px-3 py-2">{money(row.rounded.investmentGain, locale, currency)}</td>
                      <td className="px-3 py-2">{pct(row.rounded.targetProgressRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
