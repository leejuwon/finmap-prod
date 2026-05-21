import { useMemo, useState } from "react";
import Link from "next/link";
import { calculateDsrLtvAffordability } from "../lib/calculators/dsrLtv";

const DEFAULT_FORM = {
  assets: 20000,
  annualIncome: 7000,
  existingMonthlyPayment: 80,
  annualRate: 4.5,
  loanYears: 30,
  ltvPercent: 70,
  dsrPercent: 40,
  costRatePercent: 3,
  reserveCash: 2000,
};

const TEXT = {
  ko: {
    unit: "만원",
    assets: "보유자산",
    annualIncome: "연소득",
    existingMonthlyPayment: "기존대출 월상환액",
    annualRate: "신규 주담대 금리(연 %)",
    loanYears: "대출기간(년)",
    ltvPercent: "LTV(%)",
    dsrPercent: "DSR(%)",
    costRatePercent: "부대비용률(%)",
    reserveCash: "최소 남길 현금",
    resultTitle: "계산 결과",
    loanAmount: "예상 대출 가능액",
    purchasePriceMax: "구매 가능 가격 상한",
    requiredEquity: "필요 자기자금",
    expectedMonthlyPayment: "예상 월 상환액",
    appliedDsr: "적용 DSR",
    appliedLtv: "적용 LTV",
    bottleneck: "병목 원인",
    safeRange: "안전 탐색 가격대",
    dashboard: "부동산 대시보드에서 가격대 확인",
    scenarioTitle: "금리 상승 시나리오",
    scenarioDesc: "같은 LTV/DSR 입력값을 유지하고 금리만 올렸을 때의 단순 비교입니다.",
    disclaimerTitle: "중요 면책",
    disclaimer:
      "이 계산기는 사용자가 직접 입력한 LTV, DSR, 금리, 기간을 기준으로 한 단순 추정 도구입니다. 실제 대출 가능액은 금융회사 심사, 소득 인정 방식, 신용도, 기존 부채, 주택 유형, 지역, 규제, 보증 조건에 따라 달라질 수 있습니다. 정책 자동 반영 기능은 포함하지 않습니다.",
    reserveWarning: "최소 남길 현금이 보유자산보다 커서 사용 가능 현금이 0원으로 계산됩니다.",
    dsrWarning: "기존대출 상환액만으로도 입력한 DSR 한도에 가까워 신규 대출 여력이 제한됩니다.",
    ltvFullNoCostWarning: "LTV 100%와 부대비용률 0%를 함께 입력하면 자기자금 제약이 사라져 결과가 과도하게 보일 수 있습니다.",
    incomeWarning: "연소득을 0보다 크게 입력해야 DSR 기준 계산이 가능합니다.",
    termWarning: "대출기간을 1년 이상 입력하세요.",
  },
  en: {
    unit: "KRW 10k",
    assets: "Available assets",
    annualIncome: "Annual income",
    existingMonthlyPayment: "Existing monthly debt payments",
    annualRate: "New mortgage rate (annual %)",
    loanYears: "Loan term (years)",
    ltvPercent: "LTV (%)",
    dsrPercent: "DSR (%)",
    costRatePercent: "Closing cost rate (%)",
    reserveCash: "Cash to keep aside",
    resultTitle: "Estimated result",
    loanAmount: "Estimated loan capacity",
    purchasePriceMax: "Maximum purchase price",
    requiredEquity: "Required cash/equity",
    expectedMonthlyPayment: "Estimated monthly payment",
    appliedDsr: "Applied DSR",
    appliedLtv: "Applied LTV",
    bottleneck: "Main constraint",
    safeRange: "Safer search range",
    dashboard: "Check price bands in the real estate dashboard",
    scenarioTitle: "Rate shock scenarios",
    scenarioDesc: "A simple comparison with the same LTV/DSR inputs and higher mortgage rates.",
    disclaimerTitle: "Important disclaimer",
    disclaimer:
      "This calculator is a simplified estimate based on user-entered LTV, DSR, rate, and loan term. Actual lending decisions may differ depending on lender review, income recognition, credit profile, existing debt, property type, location, regulation, and guarantee conditions. It does not automatically apply policy changes.",
    reserveWarning: "Cash to keep aside is larger than available assets, so usable cash is treated as zero.",
    dsrWarning: "Existing debt payments already consume most or all of the entered DSR capacity.",
    ltvFullNoCostWarning: "Using 100% LTV with a 0% closing cost rate removes the cash constraint and may make the result look overly high.",
    incomeWarning: "Annual income must be greater than zero to calculate DSR capacity.",
    termWarning: "Loan term must be at least one year.",
  },
};

const BOTTLENECK = {
  ko: {
    balanced: "DSR과 LTV/자기자금이 비슷하게 작용",
    income: "연소득 입력 필요",
    term: "대출기간 입력 필요",
    cash: "보유자산/최소 현금 제약",
    dsr_existing_debt: "기존대출로 DSR 여력 부족",
    dsr: "DSR 제약",
    ltv_cash: "LTV/자기자금 제약",
  },
  en: {
    balanced: "DSR and LTV/cash are similarly binding",
    income: "Annual income required",
    term: "Loan term required",
    cash: "Cash/reserve constraint",
    dsr_existing_debt: "Existing debt consumes DSR capacity",
    dsr: "DSR constraint",
    ltv_cash: "LTV/cash constraint",
  },
};

function toWon(valueInManwon) {
  return (Number(valueInManwon) || 0) * 10000;
}

function formatKrw(value, locale) {
  const n = Math.max(0, Number(value) || 0);
  if (locale === "en") {
    return `₩${Math.round(n).toLocaleString("en-US")}`;
  }

  const eok = n / 100000000;
  if (eok >= 1) {
    const fixed = eok >= 10 ? eok.toFixed(1) : eok.toFixed(2);
    return `${fixed.replace(/\.0+$/, "")}억원`;
  }

  return `${Math.round(n / 10000).toLocaleString("ko-KR")}만원`;
}

function formatPercent(value, locale) {
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${safe.toFixed(1)}${locale === "ko" ? "%" : "%"}`;
}

function NumberField({ label, name, value, onChange, suffix, step = "1", min = "0", max }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <input
          name={name}
          type="number"
          inputMode="decimal"
          className="input min-w-0 flex-1"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
        />
        {suffix && <span className="shrink-0 text-xs text-slate-500">{suffix}</span>}
      </div>
    </label>
  );
}

function ResultCard({ label, value, hint }) {
  return (
    <div className="min-w-0 rounded-xl border bg-white p-4">
      <div className="break-words text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 break-words text-xl font-bold text-slate-900">{value}</div>
      {hint && <div className="mt-1 break-words text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export default function DsrLtvCalculator({ locale = "ko" }) {
  const lang = locale === "en" ? "en" : "ko";
  const t = TEXT[lang];
  const [form, setForm] = useState(DEFAULT_FORM);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const result = useMemo(
    () =>
      calculateDsrLtvAffordability({
        assets: toWon(form.assets),
        annualIncome: toWon(form.annualIncome),
        existingMonthlyPayment: toWon(form.existingMonthlyPayment),
        annualRate: Number(form.annualRate) || 0,
        loanYears: Number(form.loanYears) || 0,
        ltvPercent: Number(form.ltvPercent) || 0,
        dsrPercent: Number(form.dsrPercent) || 0,
        costRatePercent: Number(form.costRatePercent) || 0,
        reserveCash: toWon(form.reserveCash),
      }),
    [form]
  );

  const warnings = useMemo(() => {
    const map = {
      annual_income_required: t.incomeWarning,
      loan_term_required: t.termWarning,
      reserve_exceeds_assets: t.reserveWarning,
      dsr_capacity_exhausted: t.dsrWarning,
      ltv_100_no_cost: t.ltvFullNoCostWarning,
    };
    return result.warnings.map((key) => map[key]).filter(Boolean);
  }, [result.warnings, t]);

  return (
    <div className="grid gap-6">
      <section className="card min-w-0">
        <div className="mb-4">
          <h2 className="break-words text-lg font-semibold">
            {lang === "ko" ? "입력값" : "Inputs"}
          </h2>
          <p className="mt-1 break-words text-sm text-slate-600">
            {lang === "ko"
              ? "금액은 만원 단위로 입력합니다. LTV/DSR은 정책 자동 반영 없이 직접 입력한 값만 사용합니다."
              : "Amounts are entered in KRW 10k units. LTV/DSR are user-entered assumptions only."}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <NumberField label={t.assets} name="assets" value={form.assets} onChange={handleChange} suffix={t.unit} />
          <NumberField label={t.annualIncome} name="annualIncome" value={form.annualIncome} onChange={handleChange} suffix={t.unit} />
          <NumberField label={t.existingMonthlyPayment} name="existingMonthlyPayment" value={form.existingMonthlyPayment} onChange={handleChange} suffix={t.unit} />
          <NumberField label={t.annualRate} name="annualRate" value={form.annualRate} onChange={handleChange} suffix="%" step="0.1" />
          <NumberField label={t.loanYears} name="loanYears" value={form.loanYears} onChange={handleChange} suffix={lang === "ko" ? "년" : "yrs"} />
          <NumberField label={t.ltvPercent} name="ltvPercent" value={form.ltvPercent} onChange={handleChange} suffix="%" step="0.1" max="100" />
          <NumberField label={t.dsrPercent} name="dsrPercent" value={form.dsrPercent} onChange={handleChange} suffix="%" step="0.1" max="100" />
          <NumberField label={t.costRatePercent} name="costRatePercent" value={form.costRatePercent} onChange={handleChange} suffix="%" step="0.1" max="50" />
          <NumberField label={t.reserveCash} name="reserveCash" value={form.reserveCash} onChange={handleChange} suffix={t.unit} />
        </div>
      </section>

      <section className="card min-w-0">
        <div className="mb-4 flex min-w-0 flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="break-words text-lg font-semibold">{t.resultTitle}</h2>
            <p className="mt-1 break-words text-sm text-slate-600">
              {lang === "ko"
                ? "원리금균등 상환 기준의 단순 추정입니다."
                : "Simplified estimate using equal principal-and-interest payments."}
            </p>
          </div>
          <Link href="/market/real-estate" locale={lang} className="btn-secondary inline-flex justify-center">
            {t.dashboard}
          </Link>
        </div>

        {warnings.length > 0 && (
          <div className="mb-4 grid gap-2">
            {warnings.map((warning) => (
              <div key={warning} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {warning}
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard label={t.loanAmount} value={formatKrw(result.loanAmount, lang)} />
          <ResultCard label={t.purchasePriceMax} value={formatKrw(result.purchasePriceMax, lang)} />
          <ResultCard label={t.requiredEquity} value={formatKrw(result.requiredEquity, lang)} />
          <ResultCard label={t.expectedMonthlyPayment} value={formatKrw(result.expectedMonthlyPayment, lang)} />
          <ResultCard label={t.appliedDsr} value={formatPercent(result.appliedDsr, lang)} hint={`${t.dsrPercent}: ${formatPercent(result.dsrPercent, lang)}`} />
          <ResultCard label={t.appliedLtv} value={formatPercent(result.appliedLtv, lang)} hint={`${t.ltvPercent}: ${formatPercent(result.ltvPercent, lang)}`} />
          <ResultCard label={t.bottleneck} value={BOTTLENECK[lang][result.bottleneck] || BOTTLENECK[lang].balanced} />
          <ResultCard label={t.safeRange} value={`${formatKrw(result.safePriceLow, lang)} ~ ${formatKrw(result.safePriceHigh, lang)}`} hint="80~90%" />
        </div>
      </section>

      <section className="card min-w-0">
        <h2 className="break-words text-lg font-semibold">{t.scenarioTitle}</h2>
        <p className="mt-1 break-words text-sm text-slate-600">{t.scenarioDesc}</p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2 pr-4">{lang === "ko" ? "시나리오" : "Scenario"}</th>
                <th className="py-2 pr-4">{lang === "ko" ? "금리" : "Rate"}</th>
                <th className="py-2 pr-4">{t.loanAmount}</th>
                <th className="py-2 pr-4">{t.purchasePriceMax}</th>
                <th className="py-2 pr-4">{t.expectedMonthlyPayment}</th>
                <th className="py-2 pr-4">{t.bottleneck}</th>
              </tr>
            </thead>
            <tbody>
              {result.scenarios.map((scenario) => (
                <tr key={scenario.key} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{scenario.label === "base" ? (lang === "ko" ? "기준" : "Base") : scenario.label}</td>
                  <td className="py-2 pr-4">{formatPercent(scenario.annualRate, lang)}</td>
                  <td className="py-2 pr-4">{formatKrw(scenario.loanAmount, lang)}</td>
                  <td className="py-2 pr-4">{formatKrw(scenario.purchasePriceMax, lang)}</td>
                  <td className="py-2 pr-4">{formatKrw(scenario.expectedMonthlyPayment, lang)}</td>
                  <td className="py-2 pr-4">{BOTTLENECK[lang][scenario.bottleneck] || BOTTLENECK[lang].balanced}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-950">
        <h2 className="font-semibold">{t.disclaimerTitle}</h2>
        <p className="mt-2 break-words">{t.disclaimer}</p>
      </section>
    </div>
  );
}
