import ValueDisplay from "./ValueDisplay";

function pct(value, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return "-";
  return `${Number(value).toFixed(digits)}%`;
}

function toneFor(value) {
  const n = Number(value) || 0;
  if (n > 0) return "text-emerald-700";
  if (n < 0) return "text-rose-700";
  return "text-slate-900";
}

function metric(label, value, locale, currency, options = {}) {
  const tone = options.tone ? toneFor(value) : "text-slate-900";
  return (
    <div className={`rounded-xl border p-4 ${options.className || "bg-white"}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${tone}`}>
        {options.percent ? pct(value, options.digits ?? 2) : (
          <ValueDisplay value={value} locale={locale} currency={currency} />
        )}
      </div>
      {options.help && <p className="mt-1 text-xs leading-relaxed text-slate-500">{options.help}</p>}
    </div>
  );
}

export default function CompoundDetailSummary({
  result,
  locale = "ko-KR",
  currency = "KRW",
  compact = false,
}) {
  if (!result?.ok) return null;

  const isKo = String(locale).toLowerCase().startsWith("ko");
  const r = result.rounded || {};
  const contributionShare = result.afterTaxFinalAmount > 0
    ? result.monthlyContributionFutureValue / result.afterTaxFinalAmount
    : 0;
  const initialShare = result.afterTaxFinalAmount > 0
    ? result.initialFutureValue / result.afterTaxFinalAmount
    : 0;
  const gainRatio = result.principalTotal > 0
    ? result.pretaxInvestmentGain / result.principalTotal
    : 0;
  const costDrag = (Number(result.totalTax) || 0) + (Number(result.totalFee) || 0);

  const interpretation = (() => {
    if (result.pretaxInvestmentGain < 0) {
      return isKo
        ? "입력값 기준으로는 손실 시나리오입니다. 수익률, 기간, 수수료 조건을 바꿔 보며 결과가 어떻게 달라지는지 확인하세요."
        : "Based on the inputs, this is a loss scenario. Adjust return, time horizon, or fees to compare how the outcome changes.";
    }
    if (gainRatio < 0.1) {
      return isKo
        ? "아직은 납입 원금의 영향이 큰 구간입니다. 기간이나 수익률 가정을 바꾸면 복리 효과가 얼마나 커지는지 비교할 수 있습니다."
        : "Contributions still drive most of the result. Try changing the horizon or return assumption to see when compounding becomes more visible.";
    }
    if (gainRatio < 0.5) {
      return isKo
        ? "납입 원금과 투자수익이 함께 자산을 키우는 구간입니다. 세금, 수수료, 물가상승률까지 함께 보면 체감 결과를 더 현실적으로 볼 수 있습니다."
        : "Both contributions and investment gains are shaping the result. Taxes, fees, and inflation help translate that into a more realistic planning number.";
    }
    return isKo
      ? "입력값 기준으로 복리 효과가 의미 있게 나타나는 구간입니다. 다만 실제 수익률은 매년 달라질 수 있으므로 여러 가정을 함께 비교하세요."
      : "The compounding effect is meaningful under these assumptions. Actual annual returns can vary, so compare multiple scenarios.";
  })();

  if (compact) {
    return (
      <div className="grid gap-4" data-summary-mode="compact">
        <section className="grid gap-3 min-[360px]:grid-cols-2">
          {metric(isKo ? "세후 최종금액" : "After-tax final value", r.afterTaxFinalAmount, locale, currency)}
          {metric(isKo ? "총 납입원금" : "Total principal", r.principalTotal, locale, currency)}
          {metric(isKo ? "세후 수익" : "After-tax gain", r.afterTaxInvestmentGain, locale, currency, { tone: true })}
          {metric(isKo ? "물가 반영 현재가치" : "Inflation-adjusted value", r.presentValue, locale, currency)}
        </section>

        <details
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          data-testid="compound-summary-details"
        >
          <summary className="cursor-pointer font-semibold text-slate-900">
            {isKo ? "세부 지표 더 보기" : "Show detailed metrics"}
          </summary>

          <div className="mt-4 grid gap-3 min-[360px]:grid-cols-2">
            {metric(isKo ? "세전 투자수익" : "Pretax investment gain", r.pretaxInvestmentGain, locale, currency, { tone: true })}
            {metric(isKo ? "예상 세금" : "Estimated tax", r.tax, locale, currency)}
            {metric(isKo ? "수수료 영향" : "Fee drag", r.feeDrag, locale, currency)}
            {metric(isKo ? "총수익률" : "Total return", r.totalReturnPercent, locale, currency, { percent: true })}
            {metric(isKo ? "CAGR 참고값" : "CAGR reference", r.cagrReferencePercent, locale, currency, { percent: true, digits: 4 })}
            {metric(isKo ? "초기 투자금 미래가치" : "Initial amount FV", r.initialFutureValue, locale, currency)}
            {metric(isKo ? "월 납입금 미래가치" : "Monthly contribution FV", r.monthlyContributionFutureValue, locale, currency)}
          </div>

          <div className="mt-4 grid gap-2 text-sm leading-relaxed text-slate-700">
            <p>{interpretation}</p>
            <p>
              {isKo
                ? `세후 최종금액에서 월 납입금 미래가치 비중은 약 ${pct(contributionShare * 100, 1)}, 초기 투자금 미래가치 비중은 약 ${pct(initialShare * 100, 1)}입니다.`
                : `Monthly contributions account for about ${pct(contributionShare * 100, 1)} of the after-tax final value; the initial amount accounts for about ${pct(initialShare * 100, 1)}.`}
            </p>
            <p>
              {isKo
                ? `세금과 수수료 영향 합계는 약 ${new Intl.NumberFormat(locale).format(Math.round(costDrag))}${currency === "KRW" ? "원" : ""}입니다.`
                : `Estimated tax and fee drag totals about ${new Intl.NumberFormat(locale, { style: "currency", currency }).format(Math.round(costDrag))}.`}
            </p>
          </div>

          <ul className="mt-3 grid gap-1 text-xs leading-relaxed text-slate-600">
            <li>{isKo ? "월복리와 매월 말 납입을 가정합니다." : "Assumes monthly compounding and end-of-month contributions."}</li>
            <li>{isKo ? "일정한 수익률 가정의 시뮬레이션이며 실제 결과를 보장하지 않습니다." : "This fixed-return simulation does not guarantee actual results."}</li>
            <li>{isKo ? "세금, 수수료, 물가를 반영하면 체감 금액이 줄어들 수 있습니다." : "Taxes, fees, and inflation can reduce real-world value."}</li>
            <li>{isKo ? "연복리 비교는 후속 검증 대상입니다." : "Annual-compounding comparison is reserved for a later verified update."}</li>
          </ul>
        </details>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metric(isKo ? "세후 최종금액" : "After-tax final value", r.afterTaxFinalAmount, locale, currency)}
        {metric(isKo ? "원금합계" : "Total principal", r.principalTotal, locale, currency)}
        {metric(isKo ? "세전 투자수익" : "Pretax investment gain", r.pretaxInvestmentGain, locale, currency, { tone: true })}
        {metric(isKo ? "물가 반영 현재가치" : "Inflation-adjusted present value", r.presentValue, locale, currency)}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {metric(isKo ? "세금" : "Tax", r.tax, locale, currency)}
        {metric(isKo ? "총수익률" : "Total return", r.totalReturnPercent, locale, currency, { percent: true })}
        {metric(isKo ? "CAGR 참고값" : "CAGR reference", r.cagrReferencePercent, locale, currency, { percent: true, digits: 4 })}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-3">
          {isKo ? "수익 구조 분석" : "Return Structure"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {metric(isKo ? "초기 투자금 미래가치" : "Initial amount FV", r.initialFutureValue, locale, currency)}
          {metric(isKo ? "월 납입금 미래가치" : "Monthly contribution FV", r.monthlyContributionFutureValue, locale, currency)}
          {metric(isKo ? "수수료 영향" : "Fee drag", r.feeDrag, locale, currency)}
          {metric(isKo ? "세후 수익" : "After-tax gain", r.afterTaxInvestmentGain, locale, currency, { tone: true })}
        </div>
        <div className="mt-4 grid gap-2 text-sm leading-relaxed text-slate-700">
          <p>
            {isKo
              ? `세후 최종금액 기준으로 월 납입금 미래가치 비중은 약 ${pct(contributionShare * 100, 1)}, 초기 투자금 미래가치 비중은 약 ${pct(initialShare * 100, 1)}입니다.`
              : `Monthly contributions account for about ${pct(contributionShare * 100, 1)} of the after-tax final value; the initial amount accounts for about ${pct(initialShare * 100, 1)}.`}
          </p>
          <p>
            {isKo
              ? `세금과 수수료 영향 합계는 약 ${new Intl.NumberFormat(locale).format(Math.round(costDrag))}${currency === "KRW" ? "원" : ""}입니다. 물가 반영 현재가치는 세후 최종금액보다 낮게 보일 수 있습니다.`
              : `Estimated tax and fee drag totals about ${new Intl.NumberFormat(locale, { style: "currency", currency }).format(Math.round(costDrag))}. Present value can be lower than the nominal after-tax final value.`}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-base font-semibold text-slate-900">
          {isKo ? "결과를 어떻게 읽어야 하나요?" : "How to read this result"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{interpretation}</p>
        <ul className="mt-3 grid gap-1 text-xs leading-relaxed text-slate-600">
          <li>{isKo ? "이 계산기는 월복리 기준이며, 월 납입은 매월 말 납입으로 가정합니다." : "This calculator uses monthly compounding and assumes end-of-month contributions."}</li>
          <li>{isKo ? "수익률이 일정하다는 가정의 시뮬레이션이며 실제 결과를 보장하지 않습니다." : "This is a fixed-return simulation and does not guarantee actual results."}</li>
          <li>{isKo ? "세금, 수수료, 물가를 반영하면 체감 금액이 줄어들 수 있습니다." : "Taxes, fees, and inflation can reduce the amount you experience in real terms."}</li>
          <li>{isKo ? "연복리 비교는 후속 검증 대상입니다." : "Annual-compounding comparison is reserved for a later verified update."}</li>
        </ul>
      </section>
    </div>
  );
}
