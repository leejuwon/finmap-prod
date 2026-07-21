import { useMemo, useState } from "react";
import Link from "next/link";
import { CalculatorIcon } from "@heroicons/react/24/outline";
import {
  MORTGAGE_REPAYMENT_TYPES,
  calculateMortgageLoan,
  getLoanAmountBucket,
  getRateBucket,
} from "../lib/calculators/mortgageLoan";
import ToolResultCta from "./ToolResultCta";
import { trackGaEvent } from "../utils/analytics";

const SOURCE_TOOL = "mortgageLoan";

const DEFAULT_FORM = {
  loanAmount: 30000,
  annualRate: 4,
  termYears: 30,
  repaymentType: MORTGAGE_REPAYMENT_TYPES.EQUAL_PAYMENT,
  graceYears: 0,
  existingMonthlyPayment: "",
  annualIncome: "",
};

const QUICK_PRESETS = [
  {
    key: "loan_300m_4p_30y",
    ko: "3억 대출 / 4.0% / 30년",
    en: "KRW 300M / 4.0% / 30y",
    values: { loanAmount: 30000, annualRate: 4, termYears: 30 },
  },
  {
    key: "loan_500m_4p_30y",
    ko: "5억 대출 / 4.0% / 30년",
    en: "KRW 500M / 4.0% / 30y",
    values: { loanAmount: 50000, annualRate: 4, termYears: 30 },
  },
  {
    key: "loan_700m_45p_30y",
    ko: "7억 대출 / 4.5% / 30년",
    en: "KRW 700M / 4.5% / 30y",
    values: { loanAmount: 70000, annualRate: 4.5, termYears: 30 },
  },
  {
    key: "magok_800m_candidate",
    ko: "마곡 8억 후보 대출",
    en: "Magok 800M candidate",
    values: {
      loanAmount: 48000,
      annualRate: 4.3,
      termYears: 30,
      annualIncome: 7000,
      existingMonthlyPayment: 30,
    },
  },
  {
    key: "gangnam_1500m_candidate",
    ko: "강남 15억 후보 대출",
    en: "Gangnam 1.5B candidate",
    values: {
      loanAmount: 75000,
      annualRate: 4.5,
      termYears: 30,
      annualIncome: 12000,
      existingMonthlyPayment: 50,
    },
  },
];

const REPAYMENT_OPTIONS = [
  {
    value: MORTGAGE_REPAYMENT_TYPES.EQUAL_PAYMENT,
    ko: "원리금균등",
    en: "Equal payment",
    koDesc: "매월 상환액이 거의 일정합니다.",
    enDesc: "Monthly payment stays nearly constant.",
  },
  {
    value: MORTGAGE_REPAYMENT_TYPES.EQUAL_PRINCIPAL,
    ko: "원금균등",
    en: "Equal principal",
    koDesc: "초기 상환액이 크고 점차 줄어듭니다.",
    enDesc: "Starts higher and gradually declines.",
  },
];

const ADVANCED_REPAYMENT_OPTIONS = [
  {
    value: MORTGAGE_REPAYMENT_TYPES.BULLET,
    ko: "만기일시",
    en: "Interest only",
    koDesc: "매월 이자만 내고 만기에 원금을 상환합니다.",
    enDesc: "Pay interest monthly and principal at maturity.",
  },
];

const TEXT = {
  ko: {
    amountUnit: "만원",
    yearUnit: "년",
    inputTitle: "입력값",
    inputLead:
      "금액은 만원 단위로 입력합니다. 이 계산기는 대출금액 기준 월상환액과 총이자를 보는 도구입니다.",
    presetTitle: "빠른 프리셋",
    loanAmount: "대출금액",
    annualRate: "연이자율",
    termYears: "대출기간",
    repaymentType: "상환방식",
    advanced: "고급 옵션",
    graceYears: "거치기간",
    existingMonthlyPayment: "기존 월상환액",
    annualIncome: "연소득",
    optional: "선택",
    calculate: "월상환액 계산하기",
    resultTitle: "예상 상환 결과",
    resultLead: "입력값 기준 단순 추정입니다. 실제 대출 심사 결과나 최종 금리와 다를 수 있습니다.",
    expectedMonthlyPayment: "예상 월상환액",
    totalInterest: "총이자",
    totalPayment: "총상환액",
    firstMonthPayment: "첫 달 상환액",
    lastMonthPayment: "마지막 달 상환액",
    ratePlusOne: "금리 +1%p 월상환액 변화",
    dsrReference: "DSR 참고값",
    dsrReferenceHint: "연소득과 기존 월상환액을 입력한 경우의 단순 참고값입니다.",
    noDsrReference: "연소득 입력 시 표시",
    scheduleTitle: "상환표",
    first12Title: "처음 12개월",
    yearlyTitle: "연도별 요약 보기",
    month: "개월",
    payment: "상환액",
    principal: "원금",
    interest: "이자",
    balance: "잔액",
    year: "연차",
    months: "개월 수",
    endingBalance: "연말 잔액",
    linkTitle: "다음 단계로 이어가기",
    linkLead:
      "월상환액을 확인했다면 소득, 집값, 보유 현금 기준의 가능성도 별도로 점검하세요.",
    disclaimerTitle: "중요 고지",
    disclaimer:
      "이 계산기는 입력값을 기준으로 한 사전 점검용 추정 도구입니다. 실제 대출 조건은 금융기관 심사, 적용 금리, 신용점수, 소득 인정 방식, 담보가치, 규제지역, 스트레스 DSR, 보증 조건에 따라 달라질 수 있습니다. 계산 결과는 대출 실행 가능성이나 승인 금액을 보장하지 않습니다.",
    warningLoan: "대출금액을 0보다 크게 입력하세요.",
    warningTerm: "대출기간을 1년 이상 입력하세요.",
    warningGrace: "거치기간이 대출기간보다 길어 상환 가능 범위로 조정했습니다.",
  },
  en: {
    amountUnit: "KRW 10k",
    yearUnit: "years",
    inputTitle: "Inputs",
    inputLead:
      "Money inputs use KRW 10k units. This calculator focuses on payment and interest from a loan amount.",
    presetTitle: "Quick presets",
    loanAmount: "Loan amount",
    annualRate: "Annual rate",
    termYears: "Loan term",
    repaymentType: "Repayment type",
    advanced: "Advanced options",
    graceYears: "Grace period",
    existingMonthlyPayment: "Existing monthly payment",
    annualIncome: "Annual income",
    optional: "Optional",
    calculate: "Calculate payment",
    resultTitle: "Estimated payment result",
    resultLead:
      "This is a simplified estimate from your inputs. Actual lender review and final rates can differ.",
    expectedMonthlyPayment: "Estimated monthly payment",
    totalInterest: "Total interest",
    totalPayment: "Total repayment",
    firstMonthPayment: "First-month payment",
    lastMonthPayment: "Last-month payment",
    ratePlusOne: "Monthly change at rate +1pp",
    dsrReference: "DSR reference",
    dsrReferenceHint: "A simple reference when annual income and existing payment are entered.",
    noDsrReference: "Enter income to show",
    scheduleTitle: "Repayment schedule",
    first12Title: "First 12 months",
    yearlyTitle: "View yearly summary",
    month: "Month",
    payment: "Payment",
    principal: "Principal",
    interest: "Interest",
    balance: "Balance",
    year: "Year",
    months: "Months",
    endingBalance: "Ending balance",
    linkTitle: "Continue the purchase funnel",
    linkLead:
      "After checking the monthly payment, review affordability by income, home price, and cash on hand separately.",
    disclaimerTitle: "Important notice",
    disclaimer:
      "This calculator is a planning estimate based on your inputs. Actual mortgage terms may vary by lender review, final rate, credit profile, recognized income, collateral value, regulated area, stress DSR, and guarantee conditions. The result does not guarantee approval or a borrowing amount.",
    warningLoan: "Enter a loan amount greater than zero.",
    warningTerm: "Enter a loan term of at least one year.",
    warningGrace: "Grace period was longer than the loan term and has been clamped.",
  },
};

const RELATED_LINKS = [
  {
    href: "/tools/dsr-ltv-calculator",
    ko: "DSR/LTV 계산기로 대출 가능성 확인",
    en: "Check DSR/LTV affordability",
    primary: true,
  },
  {
    href: "/tools/home-buying-budget-calculator",
    ko: "아파트 구매 계산기로 현금 기준 점검",
    en: "Check cash with home buying budget",
  },
  {
    href: "/market/real-estate/seoul-top100",
    ko: "서울 아파트 Top100 보기",
    en: "View Seoul Top 100",
  },
  {
    href: "/market/real-estate/magok-top100",
    ko: "마곡 아파트 Top100 보기",
    en: "View Magok Top 100",
  },
];

function toWonFromManwon(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, n) * 10000 : 0;
}

function getCalculationInput(form) {
  return {
    loanAmount: toWonFromManwon(form.loanAmount),
    annualRate: Number(form.annualRate) || 0,
    termYears: Number(form.termYears) || 0,
    repaymentType: form.repaymentType,
    graceYears: Number(form.graceYears) || 0,
    existingMonthlyPayment: toWonFromManwon(form.existingMonthlyPayment),
    annualIncome: toWonFromManwon(form.annualIncome),
  };
}

function formatKrw(value, locale) {
  const n = Math.max(0, Math.round(Number(value) || 0));
  if (locale === "en") return `KRW ${n.toLocaleString("en-US")}`;
  const eok = n / 100000000;
  if (eok >= 1) {
    const fixed = eok >= 10 ? eok.toFixed(1) : eok.toFixed(2);
    return `${fixed.replace(/\.0+$/, "")}억원`;
  }
  return `${Math.round(n / 10000).toLocaleString("ko-KR")}만원`;
}

function formatSignedKrw(value, locale) {
  const n = Math.round(Number(value) || 0);
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}${formatKrw(Math.abs(n), locale)}`;
}

function formatPercent(value) {
  if (value === null || value === undefined) return "-";
  return `${(Number(value) || 0).toFixed(1)}%`;
}

function NumberField({ label, name, value, onChange, suffix, step = "1", min = "0", placeholder }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-800">
      <span className="break-words">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <input
          className="input min-w-0 flex-1"
          type="number"
          inputMode="decimal"
          name={name}
          value={value}
          min={min}
          step={step}
          placeholder={placeholder}
          onChange={onChange}
        />
        {suffix && <span className="shrink-0 text-xs text-slate-500">{suffix}</span>}
      </div>
    </label>
  );
}

function ResultTile({ label, value, hint, tone = "neutral" }) {
  const toneClass =
    tone === "blue"
      ? "border-blue-200 bg-blue-50"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50"
        : "border-slate-200 bg-white";
  return (
    <div className={`min-w-0 rounded-xl border p-4 ${toneClass}`}>
      <div className="break-words text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 break-words text-lg font-bold text-slate-950 md:text-xl">{value}</div>
      {hint && <div className="mt-1 break-words text-xs leading-5 text-slate-600">{hint}</div>}
    </div>
  );
}

function RepaymentButton({ option, active, lang, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      data-repayment-type={option.value}
      className={`min-h-[68px] rounded-xl border p-3 text-left transition ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-950"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
      onClick={onClick}
    >
      <span className="block break-words text-sm font-semibold">{option[lang]}</span>
      <span className="mt-1 block break-words text-xs leading-5 text-slate-500">
        {option[`${lang}Desc`]}
      </span>
    </button>
  );
}

function MonthCard({ row, t, locale }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-900">
          {row.month}
          {locale === "ko" ? "개월차" : ""}
        </span>
        <span className="text-sm font-bold text-blue-700">{formatKrw(row.payment, locale)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div>
          <span className="block text-slate-400">{t.principal}</span>
          <b className="text-slate-800">{formatKrw(row.principal, locale)}</b>
        </div>
        <div>
          <span className="block text-slate-400">{t.interest}</span>
          <b className="text-slate-800">{formatKrw(row.interest, locale)}</b>
        </div>
        <div className="col-span-2">
          <span className="block text-slate-400">{t.balance}</span>
          <b className="text-slate-800">{formatKrw(row.balance, locale)}</b>
        </div>
      </div>
    </div>
  );
}

export default function MortgageLoanCalculator({ locale = "ko" }) {
  const lang = locale === "en" ? "en" : "ko";
  const t = TEXT[lang];
  const [form, setForm] = useState(DEFAULT_FORM);

  const result = useMemo(() => calculateMortgageLoan(getCalculationInput(form)), [form]);

  const warningMessages = result.warnings
    .map((warning) => {
      if (warning === "loan_amount_required") return t.warningLoan;
      if (warning === "term_required") return t.warningTerm;
      if (warning === "grace_period_clamped") return t.warningGrace;
      return "";
    })
    .filter(Boolean);

  const trackCalculate = (nextForm, interaction, presetName) => {
    const nextResult = calculateMortgageLoan(getCalculationInput(nextForm));
    const eventParams = {
      source_tool: SOURCE_TOOL,
      locale: lang,
      repayment_type: nextResult.repaymentType,
      loan_amount_bucket: getLoanAmountBucket(nextResult.loanAmount),
      rate_bucket: getRateBucket(nextResult.annualRate),
      term_years: nextResult.termYears,
      has_result: nextResult.isValid && nextResult.totalPayment > 0,
      interaction,
      ...(presetName ? { preset_name: presetName } : {}),
    };
    trackGaEvent("mortgage_payment_calculate", eventParams);
    trackGaEvent("tool_calculate", {
      ...eventParams,
      currency: "KRW",
      location: "mortgage_loan_calculator",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setRepaymentType = (repaymentType) => {
    setForm((prev) => ({ ...prev, repaymentType }));
  };

  const applyPreset = (preset) => {
    const nextForm = {
      ...form,
      ...preset.values,
      repaymentType: preset.values.repaymentType || MORTGAGE_REPAYMENT_TYPES.EQUAL_PAYMENT,
      graceYears: preset.values.graceYears ?? 0,
    };
    setForm(nextForm);
    trackCalculate(nextForm, "preset", preset.key);
  };

  const handleCalculate = () => {
    trackCalculate(form, "button");
  };

  return (
    <div className="grid gap-6">
      <section className="card min-w-0">
        <div className="mb-4">
          <h2 className="break-words text-lg font-semibold">{t.inputTitle}</h2>
          <p className="mt-1 break-words text-sm leading-6 text-slate-600">{t.inputLead}</p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
          <div className="mb-2 break-words text-sm font-semibold text-blue-950">{t.presetTitle}</div>
          <div className="flex min-w-0 flex-wrap gap-2">
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                data-mortgage-preset={preset.key}
                className="min-h-[40px] rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 hover:bg-blue-100"
                onClick={() => applyPreset(preset)}
              >
                {preset[lang]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <NumberField
            label={t.loanAmount}
            name="loanAmount"
            value={form.loanAmount}
            onChange={handleChange}
            suffix={t.amountUnit}
          />
          <NumberField
            label={t.annualRate}
            name="annualRate"
            value={form.annualRate}
            onChange={handleChange}
            suffix="%"
            step="0.1"
          />
          <NumberField
            label={t.termYears}
            name="termYears"
            value={form.termYears}
            onChange={handleChange}
            suffix={t.yearUnit}
            step="1"
          />
        </div>

        <fieldset className="mt-4 min-w-0">
          <legend className="mb-2 break-words text-sm font-semibold text-slate-800">
            {t.repaymentType}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {REPAYMENT_OPTIONS.map((option) => (
              <RepaymentButton
                key={option.value}
                option={option}
                active={form.repaymentType === option.value}
                lang={lang}
                onClick={() => setRepaymentType(option.value)}
              />
            ))}
          </div>
        </fieldset>

        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer break-words text-sm font-semibold text-slate-800">
            {t.advanced}
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <NumberField
              label={t.graceYears}
              name="graceYears"
              value={form.graceYears}
              onChange={handleChange}
              suffix={t.yearUnit}
              step="1"
            />
            <NumberField
              label={`${t.existingMonthlyPayment} (${t.optional})`}
              name="existingMonthlyPayment"
              value={form.existingMonthlyPayment}
              onChange={handleChange}
              suffix={t.amountUnit}
              placeholder="0"
            />
            <NumberField
              label={`${t.annualIncome} (${t.optional})`}
              name="annualIncome"
              value={form.annualIncome}
              onChange={handleChange}
              suffix={t.amountUnit}
              placeholder="0"
            />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ADVANCED_REPAYMENT_OPTIONS.map((option) => (
              <RepaymentButton
                key={option.value}
                option={option}
                active={form.repaymentType === option.value}
                lang={lang}
                onClick={() => setRepaymentType(option.value)}
              />
            ))}
          </div>
        </details>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            data-mortgage-calculate
            className="btn-primary w-full gap-2 sm:w-auto"
            onClick={handleCalculate}
          >
            <CalculatorIcon className="h-5 w-5" />
            <span>{t.calculate}</span>
          </button>
        </div>
      </section>

      <section id="mortgage-loan-result-target" className="card min-w-0" data-mortgage-section="summary">
        <div className="mb-4">
          <h2 className="break-words text-lg font-semibold">{t.resultTitle}</h2>
          <p className="mt-1 break-words text-sm leading-6 text-slate-600">{t.resultLead}</p>
        </div>

        {warningMessages.length > 0 && (
          <div className="mb-4 grid gap-2">
            {warningMessages.map((warning) => (
              <div key={warning} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {warning}
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ResultTile
            label={t.expectedMonthlyPayment}
            value={formatKrw(result.expectedMonthlyPayment, lang)}
            tone="blue"
          />
          <ResultTile label={t.totalInterest} value={formatKrw(result.totalInterest, lang)} />
          <ResultTile label={t.totalPayment} value={formatKrw(result.totalPayment, lang)} />
          <ResultTile label={t.firstMonthPayment} value={formatKrw(result.firstMonthPayment, lang)} />
          <ResultTile label={t.lastMonthPayment} value={formatKrw(result.lastMonthPayment, lang)} />
          <ResultTile
            label={t.ratePlusOne}
            value={formatSignedKrw(result.ratePlusOneDelta, lang)}
            hint={`${formatKrw(result.ratePlusOneMonthlyPayment, lang)} / ${Number(result.annualRate + 1).toFixed(1)}%`}
            tone="amber"
          />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="break-words text-base font-semibold">{t.dsrReference}</h3>
              <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                {result.estimatedDsrRate === null ? t.noDsrReference : t.dsrReferenceHint}
              </p>
            </div>
            <div className="break-words text-2xl font-bold text-slate-950">
              {formatPercent(result.estimatedDsrRate)}
            </div>
          </div>
        </div>

        <div className="mt-6" data-mortgage-section="schedule">
          <h3 className="break-words text-base font-semibold">{t.scheduleTitle}</h3>
          <p className="mt-1 break-words text-sm text-slate-600">{t.first12Title}</p>

          <div className="mt-3 grid gap-2 sm:hidden">
            {result.first12Months.map((row) => (
              <MonthCard key={row.month} row={row} t={t} locale={lang} />
            ))}
          </div>

          <div className="mt-3 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500">
                  <th className="border p-2">{t.month}</th>
                  <th className="border p-2">{t.payment}</th>
                  <th className="border p-2">{t.principal}</th>
                  <th className="border p-2">{t.interest}</th>
                  <th className="border p-2">{t.balance}</th>
                </tr>
              </thead>
              <tbody>
                {result.first12Months.map((row) => (
                  <tr key={row.month}>
                    <td className="border p-2">{row.month}</td>
                    <td className="border p-2">{formatKrw(row.payment, lang)}</td>
                    <td className="border p-2">{formatKrw(row.principal, lang)}</td>
                    <td className="border p-2">{formatKrw(row.interest, lang)}</td>
                    <td className="border p-2">{formatKrw(row.balance, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer break-words text-sm font-semibold text-slate-800">
              {t.yearlyTitle}
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500">
                    <th className="border p-2">{t.year}</th>
                    <th className="border p-2">{t.months}</th>
                    <th className="border p-2">{t.payment}</th>
                    <th className="border p-2">{t.principal}</th>
                    <th className="border p-2">{t.interest}</th>
                    <th className="border p-2">{t.endingBalance}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.annualSummary.map((row) => (
                    <tr key={row.year}>
                      <td className="border p-2">{row.year}</td>
                      <td className="border p-2">{row.months}</td>
                      <td className="border p-2">{formatKrw(row.payment, lang)}</td>
                      <td className="border p-2">{formatKrw(row.principal, lang)}</td>
                      <td className="border p-2">{formatKrw(row.interest, lang)}</td>
                      <td className="border p-2">{formatKrw(row.endBalance, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4" data-mortgage-section="related">
          <h3 className="break-words text-base font-semibold text-blue-950">{t.linkTitle}</h3>
          <p className="mt-1 break-words text-sm leading-6 text-blue-900">{t.linkLead}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {RELATED_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                locale={lang}
                className={item.primary ? "btn-primary w-full" : "btn-secondary w-full bg-white"}
                onClick={() =>
                  trackGaEvent("mortgage_payment_next_click", {
                    source_tool: SOURCE_TOOL,
                    locale: lang,
                    target_url: item.href,
                    location: "result_related",
                  })
                }
              >
                {item[lang]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ToolResultCta
        locale={lang}
        sourceTool={SOURCE_TOOL}
        location="result_after"
        pdfTargetId="mortgage-loan-result-target"
        downloadFilename="mortgage-loan-result.pdf"
      />

      <section className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-950">
        <h2 className="font-semibold">{t.disclaimerTitle}</h2>
        <p className="mt-2 break-words leading-6">{t.disclaimer}</p>
      </section>
    </div>
  );
}
