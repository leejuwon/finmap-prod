import { useMemo, useState } from "react";
import Link from "next/link";
import { calculateDsrLtvAffordability } from "../lib/calculators/dsrLtv";

const DEFAULT_FORM = {
  assets: 20000,
  annualIncome: 7000,
  targetHomePrice: 60000,
  existingMonthlyPayment: 80,
  annualRate: 4.5,
  loanYears: 30,
  ltvPercent: 70,
  dsrPercent: 40,
  costRatePercent: 3,
  reserveCash: 2000,
};

const PRESETS = [
  {
    key: "A",
    ko: "A 기본형",
    en: "A baseline",
    values: {
      annualIncome: 6000,
      assets: 20000,
      reserveCash: 0,
      existingMonthlyPayment: 0,
      annualRate: 4,
      loanYears: 30,
      ltvPercent: 70,
      dsrPercent: 40,
      costRatePercent: 5,
      targetHomePrice: 60000,
    },
  },
  {
    key: "B",
    ko: "B 기존부채/DSR 병목",
    en: "B debt/DSR limit",
    values: {
      annualIncome: 5000,
      assets: 30000,
      reserveCash: 0,
      existingMonthlyPayment: 50,
      annualRate: 5,
      loanYears: 30,
      ltvPercent: 70,
      dsrPercent: 40,
      costRatePercent: 5,
      targetHomePrice: 60000,
    },
  },
  {
    key: "C",
    ko: "C 현금/LTV 병목",
    en: "C cash/LTV limit",
    values: {
      annualIncome: 12000,
      assets: 10000,
      reserveCash: 0,
      existingMonthlyPayment: 0,
      annualRate: 4,
      loanYears: 30,
      ltvPercent: 60,
      dsrPercent: 40,
      costRatePercent: 5,
      targetHomePrice: 25000,
    },
  },
  {
    key: "D",
    ko: "D 매수 가능형",
    en: "D affordable case",
    values: {
      annualIncome: 8000,
      assets: 30000,
      reserveCash: 0,
      existingMonthlyPayment: 20,
      annualRate: 3.5,
      loanYears: 40,
      ltvPercent: 70,
      dsrPercent: 40,
      costRatePercent: 5,
      targetHomePrice: 70000,
    },
  },
];

const RELATED_LINKS = [
  {
    href: "/posts/personalFinance/dsr-40-income-loan-limit-table",
    ko: "DSR 40% 소득별 한도표",
    en: "DSR 40% income table",
  },
  {
    href: "/posts/personalFinance/interest-rate-1p-loan-limit-impact",
    ko: "금리 1%p 상승 시 대출한도 영향",
    en: "Rate +1pp loan impact",
  },
  {
    href: "/posts/personalFinance/mortgage-risk-checklist-dsr-variable",
    ko: "주담대 리스크 체크리스트",
    en: "Mortgage risk checklist",
  },
  {
    href: "/posts/personalFinance/apt-dashboard-home-goal-roadmap",
    ko: "대시보드로 내 예산대 아파트 찾는 방법",
    en: "Find homes with the dashboard",
  },
];

const TEXT = {
  ko: {
    unit: "만원",
    assets: "보유자산",
    annualIncome: "연소득",
    targetHomePrice: "후보 주택 가격",
    existingMonthlyPayment: "기존대출 월상환액",
    annualRate: "신규 주담대 금리(연 %)",
    loanYears: "대출기간(년)",
    ltvPercent: "LTV(%)",
    dsrPercent: "DSR(%)",
    costRatePercent: "부대비용률(%)",
    reserveCash: "최소 남길 현금",
    presetTitle: "검증 샘플 프리셋",
    presetNote: "A~D는 검증 스크립트와 동일한 KRW 기준 테스트 샘플입니다.",
    resultTitle: "핵심 결과",
    finalAffordablePrice: "최종 구매 가능 가격",
    dsrLoanCapacity: "DSR 기준 대출 가능액",
    newMonthlyCapacity: "신규 월상환 여력",
    finalMonthlyPayment: "최종 가격 기준 월상환액",
    safeRange: "안전 탐색 가격대",
    bottleneck: "병목 원인",
    candidateTitle: "후보 집값 판정",
    candidateStatus: "최종 판정",
    targetHomePriceLabel: "후보 집값",
    candidateRequiredLoan: "후보 필요 대출액",
    candidateMaxLoanByLtv: "후보 LTV상 최대 대출액",
    candidateMonthlyPayment: "후보 월상환액",
    candidateDsrUsageRate: "후보 DSR 사용률",
    candidateCashRequirement: "후보 필요 현금",
    cashOnHand: "보유 현금",
    candidateCashGap: "현금 부족/여유",
    maxShortfall: "최대 부족률",
    checkDsr: "DSR 조건",
    checkLtv: "LTV 조건",
    checkCash: "현금 조건",
    pass: "가능",
    warning: "주의",
    fail: "불가",
    passed: "통과",
    failed: "미통과",
    dashboardTitle: "이 가격대로 실거래를 확인해보세요",
    dashboardBody:
      "계산된 안전 탐색 가격대는 {safeLow} ~ {safeHigh}입니다. 부동산 대시보드에서 서울·경기·인천 거래량과 가격 분포를 비교해 보세요.",
    dashboardButton: "부동산 대시보드에서 보기",
    interpretationTitle: "결과 해석",
    failedItems: "부족 항목",
    sensitivityTitle: "민감도 분석",
    sensitivityDesc: "금리, DSR, 기존 월상환액, LTV를 바꿨을 때 같은 계산 코어로 다시 계산한 결과입니다.",
    scenario: "시나리오",
    candidatePossible: "후보 집값 판정",
    relatedTitle: "같이 보면 좋은 자료",
    disclaimerTitle: "중요 면책",
    disclaimer:
      "이 계산기는 사용자가 직접 입력한 LTV, DSR, 금리, 기간을 기준으로 한 단순 추정 도구입니다. 실제 대출 가능액은 금융회사 심사, 소득 인정 방식, 신용도, 기존 부채, 주택 유형, 지역, 규제, 보증 조건에 따라 달라질 수 있습니다.",
    disclaimerChecklist: [
      "정책 자동 반영 없음",
      "입력한 LTV/DSR 그대로 사용",
      "원리금균등 상환 기준",
      "실제 심사는 금융기관, 신용도, 소득 인정 방식, 담보가치, 지역 규제에 따라 달라짐",
      "DSR을 통과해도 생활비, 관리비, 세금, 비상금은 별도 고려",
      "대출 실행 권유가 아니라 사전 점검용 도구",
    ],
    reserveWarning: "최소 남길 현금이 보유자산보다 커서 사용 가능 현금이 0원으로 계산됩니다.",
    dsrWarning: "기존대출 상환액만으로도 입력한 DSR 한도에 가까워 신규 대출 여력이 제한됩니다.",
    ltvFullNoCostWarning: "LTV 100%와 부대비용률 0%를 함께 입력하면 자기자금 제약이 사라져 결과가 과도하게 보일 수 있습니다.",
    incomeWarning: "연소득을 0보다 크게 입력해야 DSR 기준 계산이 가능합니다.",
    termWarning: "대출기간을 1년 이상 입력하세요.",
    dsrBottleneckDesc: "소득 대비 월상환 여력이 먼저 한도를 제한합니다.",
    cashLtvBottleneckDesc: "보유 현금, LTV, 부대비용이 구매 가능 가격을 먼저 제한합니다.",
    dsrInterpretation:
      "소득 대비 월상환 여력이 먼저 한도를 제한합니다. 기존 월상환액을 줄이거나, 대출기간·소득·후보 가격을 조정해 보세요.",
    cashLtvInterpretation:
      "보유 현금, LTV, 부대비용 조건이 구매 가능 가격을 먼저 제한합니다. 자기자금 또는 후보 가격 조정이 핵심입니다.",
    candidatePassMessage: "입력값 기준으로는 조건을 통과합니다. 단, 실제 심사는 별도입니다.",
    candidateWarningMessage: "조건에 근접하지만 일부 항목이 부족합니다. 현금, 가격, 기존부채를 조정해 보세요.",
    candidateFailMessage: "입력값 기준으로는 후보 가격이 어렵습니다. 부족 항목을 먼저 확인하세요.",
    candidateAffordableInterpretation:
      "후보 주택은 입력값 기준으로 가능으로 계산됩니다. 실제 심사와 생활비 여력은 별도로 확인하세요.",
  },
  en: {
    unit: "KRW 10k",
    assets: "Available assets",
    annualIncome: "Annual income",
    targetHomePrice: "Target home price",
    existingMonthlyPayment: "Existing monthly debt payments",
    annualRate: "New mortgage rate (annual %)",
    loanYears: "Loan term (years)",
    ltvPercent: "LTV (%)",
    dsrPercent: "DSR (%)",
    costRatePercent: "Closing cost rate (%)",
    reserveCash: "Cash to keep aside",
    presetTitle: "Verified sample presets",
    presetNote: "A-D are verified KRW sample inputs used by the test script.",
    resultTitle: "Key result",
    finalAffordablePrice: "Final affordable price",
    dsrLoanCapacity: "DSR loan capacity",
    newMonthlyCapacity: "New monthly capacity",
    finalMonthlyPayment: "Monthly payment at final price",
    safeRange: "Safer search range",
    bottleneck: "Main constraint",
    candidateTitle: "Target home check",
    candidateStatus: "Final decision",
    targetHomePriceLabel: "Target home price",
    candidateRequiredLoan: "Required loan",
    candidateMaxLoanByLtv: "LTV max loan",
    candidateMonthlyPayment: "Target monthly payment",
    candidateDsrUsageRate: "Target DSR usage",
    candidateCashRequirement: "Required cash",
    cashOnHand: "Cash on hand",
    candidateCashGap: "Cash gap/surplus",
    maxShortfall: "Max shortfall",
    checkDsr: "DSR check",
    checkLtv: "LTV check",
    checkCash: "Cash check",
    pass: "Possible",
    warning: "Caution",
    fail: "Not possible",
    passed: "Pass",
    failed: "Fail",
    dashboardTitle: "Check real transaction prices in this range",
    dashboardBody:
      "Your safer search range is {safeLow} ~ {safeHigh}. Compare transaction volume and price distribution in the real estate dashboard.",
    dashboardButton: "Open real estate dashboard",
    interpretationTitle: "How to read this",
    failedItems: "Short items",
    sensitivityTitle: "Sensitivity analysis",
    sensitivityDesc: "The same calculation core recalculates the result after changing rate, DSR, existing monthly debt, and LTV.",
    scenario: "Scenario",
    candidatePossible: "Target home decision",
    relatedTitle: "Related reading",
    disclaimerTitle: "Important disclaimer",
    disclaimer:
      "This calculator is a simplified estimate based on user-entered LTV, DSR, rate, and loan term. Actual lending decisions may differ depending on lender review, income recognition, credit profile, existing debt, property type, location, regulation, and guarantee conditions.",
    disclaimerChecklist: [
      "No automatic policy updates",
      "Uses the LTV/DSR values you enter",
      "Equal principal-and-interest monthly repayment only",
      "Actual review may vary by lender, credit profile, income recognition, collateral value, and local rules",
      "Even when DSR passes, living costs, maintenance fees, taxes, and emergency cash need separate review",
      "This is a pre-check tool, not a loan recommendation",
    ],
    reserveWarning: "Cash to keep aside is larger than available assets, so usable cash is treated as zero.",
    dsrWarning: "Existing debt payments already consume most or all of the entered DSR capacity.",
    ltvFullNoCostWarning: "Using 100% LTV with a 0% closing cost rate removes the cash constraint and may make the result look overly high.",
    incomeWarning: "Annual income must be greater than zero to calculate DSR capacity.",
    termWarning: "Loan term must be at least one year.",
    dsrBottleneckDesc: "Monthly payment capacity relative to income is the first limit.",
    cashLtvBottleneckDesc: "Cash on hand, LTV, and closing costs are the first limit.",
    dsrInterpretation:
      "Monthly payment capacity relative to income is limiting the result first. Try changing existing debt, term, income, or the target price.",
    cashLtvInterpretation:
      "Cash on hand, LTV, and closing costs are limiting the purchase price first. Cash buffer or target price adjustment matters most.",
    candidatePassMessage: "Based on the entered assumptions, the target passes. Actual lender review is separate.",
    candidateWarningMessage: "The target is close, but one or more checks are short. Try adjusting cash, price, or existing debt.",
    candidateFailMessage: "Based on the entered assumptions, the target price is difficult. Check the short items first.",
    candidateAffordableInterpretation:
      "The target home is calculated as possible under your inputs. Actual review and living-cost capacity still need separate checks.",
  },
};

const BOTTLENECK = {
  ko: {
    DSR: "DSR 제약",
    CASH_LTV: "LTV/현금 제약",
  },
  en: {
    DSR: "DSR constraint",
    CASH_LTV: "LTV/cash constraint",
  },
};

const CARD_TONE = {
  neutral: "border-slate-200 bg-white",
  blue: "border-blue-200 bg-blue-50",
  good: "border-emerald-200 bg-emerald-50",
  warning: "border-amber-200 bg-amber-50",
  danger: "border-red-200 bg-red-50",
};

const STATUS_TONE = {
  PASS: {
    card: "good",
    badge: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
  WARNING: {
    card: "warning",
    badge: "border-amber-200 bg-amber-100 text-amber-800",
  },
  FAIL: {
    card: "danger",
    badge: "border-red-200 bg-red-100 text-red-800",
  },
};

function toWon(valueInManwon) {
  return (Number(valueInManwon) || 0) * 10000;
}

function formatKrw(value, locale) {
  const n = Math.max(0, Number(value) || 0);
  if (locale === "en") {
    return `KRW ${Math.round(n).toLocaleString("en-US")}`;
  }

  const eok = n / 100000000;
  if (eok >= 1) {
    const fixed = eok >= 10 ? eok.toFixed(1) : eok.toFixed(2);
    return `${fixed.replace(/\.0+$/, "")}억원`;
  }

  return `${Math.round(n / 10000).toLocaleString("ko-KR")}만원`;
}

function formatSignedKrw(value, locale) {
  const n = Number(value) || 0;
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}${formatKrw(Math.abs(n), locale)}`;
}

function formatPercent(value) {
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${safe.toFixed(1)}%`;
}

function formatEokQuery(value) {
  const eok = Math.max(0, Number(value) || 0) / 100000000;
  return eok.toFixed(2).replace(/\.?0+$/, "");
}

function getStatusLabel(status, t) {
  if (status === "PASS") return t.pass;
  if (status === "WARNING") return t.warning;
  return t.fail;
}

function getCandidateMessage(status, t) {
  if (status === "PASS") return t.candidatePassMessage;
  if (status === "WARNING") return t.candidateWarningMessage;
  return t.candidateFailMessage;
}

function getBottleneckDescription(result, t) {
  return result.bottleneck === "DSR" ? t.dsrBottleneckDesc : t.cashLtvBottleneckDesc;
}

function getBottleneckInterpretation(result, t) {
  return result.bottleneck === "DSR" ? t.dsrInterpretation : t.cashLtvInterpretation;
}

function getFailedCheckLabels(result, t) {
  const labels = [];
  if (!result.candidateChecks?.dsr) labels.push("DSR");
  if (!result.candidateChecks?.ltv) labels.push("LTV");
  if (!result.candidateChecks?.cash) labels.push(t.checkCash.replace(" 조건", "").replace(" check", ""));
  return labels;
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

function ResultCard({ label, value, hint, tone = "neutral" }) {
  return (
    <div className={`min-w-0 rounded-xl border p-4 ${CARD_TONE[tone] || CARD_TONE.neutral}`}>
      <div className="break-words text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 break-words text-lg font-bold text-slate-900 md:text-xl">{value}</div>
      {hint && <div className="mt-1 break-words text-xs text-slate-600">{hint}</div>}
    </div>
  );
}

function StatusBadge({ status, t }) {
  const tone = STATUS_TONE[status] || STATUS_TONE.FAIL;
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
      {getStatusLabel(status, t)}
    </span>
  );
}

function CheckPill({ label, passed, t }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        passed
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-red-200 bg-red-50 text-red-900"
      }`}
    >
      <span className="font-semibold">{label}</span>
      <span className="ml-2">{passed ? t.passed : t.failed}</span>
    </div>
  );
}

function DetailTile({ label, value, hint }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3">
      <div className="break-words text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 break-words text-base font-semibold text-slate-900">{value}</div>
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

  const applyPreset = (values) => {
    setForm(values);
  };

  const result = useMemo(() => {
    const assets = toWon(form.assets);
    const reserveCash = toWon(form.reserveCash);

    return calculateDsrLtvAffordability({
      annualIncome: toWon(form.annualIncome),
      cashOnHand: Math.max(assets - reserveCash, 0),
      existingMonthlyDebtPayment: toWon(form.existingMonthlyPayment),
      annualRate: Number(form.annualRate) || 0,
      loanTermYears: Number(form.loanYears) || 0,
      ltvRate: Number(form.ltvPercent) || 0,
      dsrRate: Number(form.dsrPercent) || 0,
      extraCostRate: Number(form.costRatePercent) || 0,
      targetHomePrice: toWon(form.targetHomePrice),
      assets,
      reserveCash,
    });
  }, [form]);

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

  const candidateStatus = result.candidateStatus || (result.candidateAffordable ? "PASS" : "FAIL");
  const failedCheckLabels = getFailedCheckLabels(result, t);
  const dashboardHref =
    result.safeSearchPriceLow > 0 && result.safeSearchPriceHigh > 0
      ? {
          pathname: "/market/real-estate",
          query: {
            priceMetric: "median_price",
            priceMin: formatEokQuery(result.safeSearchPriceLow),
            priceMax: formatEokQuery(result.safeSearchPriceHigh),
          },
        }
      : "/market/real-estate";

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

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
          <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="break-words text-sm font-semibold text-blue-950">{t.presetTitle}</h3>
              <p className="mt-1 break-words text-xs text-blue-800">{t.presetNote}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  data-dsr-preset={preset.key}
                  className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-100"
                  onClick={() => applyPreset(preset.values)}
                >
                  {preset[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <NumberField label={t.assets} name="assets" value={form.assets} onChange={handleChange} suffix={t.unit} />
          <NumberField label={t.annualIncome} name="annualIncome" value={form.annualIncome} onChange={handleChange} suffix={t.unit} />
          <NumberField label={t.targetHomePrice} name="targetHomePrice" value={form.targetHomePrice} onChange={handleChange} suffix={t.unit} />
          <NumberField label={t.existingMonthlyPayment} name="existingMonthlyPayment" value={form.existingMonthlyPayment} onChange={handleChange} suffix={t.unit} />
          <NumberField label={t.annualRate} name="annualRate" value={form.annualRate} onChange={handleChange} suffix="%" step="0.1" max="29.9" />
          <NumberField label={t.loanYears} name="loanYears" value={form.loanYears} onChange={handleChange} suffix={lang === "ko" ? "년" : "yrs"} max="50" />
          <NumberField label={t.ltvPercent} name="ltvPercent" value={form.ltvPercent} onChange={handleChange} suffix="%" step="0.1" max="100" />
          <NumberField label={t.dsrPercent} name="dsrPercent" value={form.dsrPercent} onChange={handleChange} suffix="%" step="0.1" max="100" />
          <NumberField label={t.costRatePercent} name="costRatePercent" value={form.costRatePercent} onChange={handleChange} suffix="%" step="0.1" max="30" />
          <NumberField label={t.reserveCash} name="reserveCash" value={form.reserveCash} onChange={handleChange} suffix={t.unit} />
        </div>
      </section>

      <section className="card min-w-0" data-dsr-section="summary">
        <div className="mb-4 flex min-w-0 flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="break-words text-lg font-semibold">{t.resultTitle}</h2>
            <p className="mt-1 break-words text-sm text-slate-600">
              {lang === "ko"
                ? "원리금균등 상환 기준의 단순 추정입니다."
                : "Simplified estimate using equal principal-and-interest payments."}
            </p>
          </div>
          <Link href={dashboardHref} locale={lang} className="btn-secondary inline-flex justify-center">
            {t.dashboardButton}
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard label={t.finalAffordablePrice} value={formatKrw(result.finalAffordablePrice, lang)} tone="blue" />
          <ResultCard label={t.dsrLoanCapacity} value={formatKrw(result.dsrLoanCapacity, lang)} />
          <ResultCard label={t.newMonthlyCapacity} value={formatKrw(result.newMortgageMonthlyPaymentCapacity, lang)} />
          <ResultCard label={t.finalMonthlyPayment} value={formatKrw(result.finalMonthlyPayment, lang)} />
          <ResultCard label={t.safeRange} value={`${formatKrw(result.safeSearchPriceLow, lang)} ~ ${formatKrw(result.safeSearchPriceHigh, lang)}`} hint="80~90%" />
          <ResultCard
            label={t.bottleneck}
            value={BOTTLENECK[lang][result.bottleneck] || result.bottleneck}
            hint={getBottleneckDescription(result, t)}
            tone={result.bottleneck === "DSR" ? "warning" : "neutral"}
          />
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="break-words text-base font-semibold">{t.interpretationTitle}</h3>
          <div className="mt-2 grid gap-2 text-sm text-slate-700">
            <p className="break-words">{getBottleneckInterpretation(result, t)}</p>
            <p className="break-words">
              {result.candidateAffordable ? t.candidateAffordableInterpretation : `${t.failedItems}: ${failedCheckLabels.join(" / ") || "-"}`}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 p-4" data-dsr-section="candidate" data-candidate-status={candidateStatus}>
          <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="break-words text-base font-semibold">{t.candidateTitle}</h3>
              <p className="mt-1 break-words text-sm text-slate-600">{getCandidateMessage(candidateStatus, t)}</p>
            </div>
            <StatusBadge status={candidateStatus} t={t} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailTile label={t.targetHomePriceLabel} value={formatKrw(result.targetHomePrice, lang)} />
            <DetailTile label={t.candidateRequiredLoan} value={formatKrw(result.candidateRequiredLoan, lang)} />
            <DetailTile label={t.candidateMaxLoanByLtv} value={formatKrw(result.candidateMaxLoanByLtv, lang)} />
            <DetailTile label={t.candidateMonthlyPayment} value={formatKrw(result.candidateMonthlyPayment, lang)} />
            <DetailTile label={t.candidateDsrUsageRate} value={formatPercent(result.candidateDsrUsageRate)} />
            <DetailTile label={t.candidateCashRequirement} value={formatKrw(result.candidateCashRequirement, lang)} />
            <DetailTile label={t.cashOnHand} value={formatKrw(result.cashOnHand, lang)} />
            <DetailTile
              label={t.candidateCashGap}
              value={formatSignedKrw(result.candidateCashGap, lang)}
              hint={result.candidateShortfallRates?.max > 0 ? `${t.maxShortfall}: ${formatPercent(result.candidateShortfallRates.max * 100)}` : undefined}
            />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <CheckPill label={t.checkDsr} passed={result.candidateChecks?.dsr} t={t} />
            <CheckPill label={t.checkLtv} passed={result.candidateChecks?.ltv} t={t} />
            <CheckPill label={t.checkCash} passed={result.candidateChecks?.cash} t={t} />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-5" data-dsr-section="dashboard-cta">
          <h3 className="break-words text-lg font-semibold text-blue-950">{t.dashboardTitle}</h3>
          <p className="mt-2 break-words text-sm text-blue-900">
            {t.dashboardBody
              .replace("{safeLow}", formatKrw(result.safeSearchPriceLow, lang))
              .replace("{safeHigh}", formatKrw(result.safeSearchPriceHigh, lang))}
          </p>
          <div className="mt-4">
            <Link href={dashboardHref} locale={lang} className="btn-primary inline-flex justify-center">
              {t.dashboardButton}
            </Link>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="break-words text-base font-semibold">{t.relatedTitle}</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {RELATED_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                locale={lang}
                className="rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                {item[lang]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="card min-w-0" data-dsr-section="sensitivity">
        <h2 className="break-words text-lg font-semibold">{t.sensitivityTitle}</h2>
        <p className="mt-1 break-words text-sm text-slate-600">{t.sensitivityDesc}</p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[980px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2 pr-4">{t.scenario}</th>
                <th className="py-2 pr-4">{t.dsrLoanCapacity}</th>
                <th className="py-2 pr-4">{t.finalAffordablePrice}</th>
                <th className="py-2 pr-4">{t.finalMonthlyPayment}</th>
                <th className="py-2 pr-4">{t.safeRange}</th>
                <th className="py-2 pr-4">{t.bottleneck}</th>
                <th className="py-2 pr-4">{t.candidatePossible}</th>
              </tr>
            </thead>
            <tbody>
              {result.extendedSensitivity.map((scenario) => (
                <tr key={scenario.key} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{lang === "ko" ? scenario.labelKo : scenario.labelEn}</td>
                  <td className="py-2 pr-4">{formatKrw(scenario.dsrLoanCapacity, lang)}</td>
                  <td className="py-2 pr-4">{formatKrw(scenario.finalAffordablePrice, lang)}</td>
                  <td className="py-2 pr-4">{formatKrw(scenario.finalMonthlyPayment, lang)}</td>
                  <td className="py-2 pr-4">{formatKrw(scenario.safeSearchPriceLow, lang)} ~ {formatKrw(scenario.safeSearchPriceHigh, lang)}</td>
                  <td className="py-2 pr-4">{BOTTLENECK[lang][scenario.bottleneck] || scenario.bottleneck}</td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={scenario.candidateStatus} t={t} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-950">
        <h2 className="font-semibold">{t.disclaimerTitle}</h2>
        <p className="mt-2 break-words">{t.disclaimer}</p>
        <ul className="mt-3 grid gap-1">
          {t.disclaimerChecklist.map((item) => (
            <li key={item} className="break-words">
              - {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
