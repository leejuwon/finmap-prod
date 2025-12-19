// pages/tools/dca-calculator.js
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '../../_components/SeoHead';
import DCAForm from '../../_components/DcaForm';
import DCAChart from '../../_components/DcaChart';
import DCAYearTable from '../../_components/DcaYearTable';
import { formatMoneyAuto } from '../../lib/money';
import ToolCta from '../../_components/ToolCta';

// JSON-LD 스크립트용 컴포넌트
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ===================== 시뮬레이션 로직 =====================
function simulateDCA({
  initial,
  monthly,
  annualRate,
  years,
  annualIncrease = 0, // 연간 적립금 증가율 (%)
  compounding = 'monthly',
  taxRate = 15.4, // 세율(%)
  feeRate = 0.5, // 수수료율(연 %)
}) {
  const months = Math.max(1, Math.floor((Number(years) || 0) * 12));
  const rYear = (Number(annualRate) || 0) / 100;

  const tax = (Number(taxRate) || 0) / 100;
  const fee = (Number(feeRate) || 0) / 100;

  // netYear ≈ rYear * (1 - tax) - fee
  let netYear = rYear * (1 - tax) - fee;
  if (netYear < -0.99) netYear = -0.99;

  const grossMonth =
    compounding === 'yearly'
      ? Math.pow(1 + rYear, 1 / 12) - 1
      : rYear / 12;

  const netMonth =
    compounding === 'yearly'
      ? Math.pow(1 + netYear, 1 / 12) - 1
      : netYear / 12;

  let invested = Number(initial) || 0;
  let valueGross = invested;
  let valueNet = invested;

  let monthlyCur = Number(monthly) || 0;
  let investedPrevYear = invested;
  let valueNetPrevYear = valueNet;

  const rows = [];

  for (let m = 1; m <= months; m++) {
    invested += monthlyCur;

    valueGross = (valueGross + monthlyCur) * (1 + grossMonth);
    valueNet = (valueNet + monthlyCur) * (1 + netMonth);

    const isYearEnd = m % 12 === 0 || m === months;
    if (isYearEnd) {
      const year = Math.round(m / 12);
      const contributionYear = invested - investedPrevYear;
      const gainYearNet = valueNet - valueNetPrevYear - contributionYear;

      rows.push({
        year,
        invested,
        valueGross,
        valueNet,
        contributionYear,
        gainYearNet,
        monthlyAtEnd: monthlyCur,
      });

      investedPrevYear = invested;
      valueNetPrevYear = valueNet;

      // 연말마다 적립금 증가율 반영
      const inc = Number(annualIncrease) || 0;
      if (inc !== 0) monthlyCur *= 1 + inc / 100;
    }
  }

  return rows;
}

// ===================== 텍스트 리소스 =====================
const TEXT = {
  ko: {
    seoTitle: 'ETF·주식 자동 적립식 시뮬레이터 (DCA)',
    seoDesc:
      '매월 일정 금액을 ETF·주식에 적립 투자했을 때 자산 성장 경로를 시뮬레이션합니다. 세율, 수수료율, 연간 적립금 증가율까지 반영해 보세요.',
    title: 'ETF·주식 자동 적립식 시뮬레이터 (DCA)',
    descShort:
      '초기 자산, 월 적립금, 연 수익률, 연간 적립금 증가율로 DCA(자동 적립식) 투자 결과를 시뮬레이션합니다. 세율·수수료율과 통화(KRW/USD)도 직접 설정할 수 있습니다.',
    fv: '마지막 해 세후 자산',
    contrib: '누적 투자금',
    gain: '세후 수익(누적)',
    unitHint: '단위: 원 / 만원 / 억원 자동',
    chartTitle: 'DCA 적립식 자산 성장 경로',
    tableTitle: '연도별 적립식 투자 요약 (DCA)',
    faqTitle: 'DCA 계산기 자주 묻는 질문(FAQ)',
  },
  en: {
    seoTitle: 'ETF/Stock DCA Simulator',
    seoDesc:
      'Simulate how your assets grow when you invest a fixed amount into ETFs/stocks every month (DCA), considering tax rate, fee rate and annual contribution increase.',
    title: 'ETF/Stock DCA Simulator (DCA)',
    descShort:
      'Simulate your DCA (dollar-cost averaging) plan with initial value, monthly contribution, annual return and yearly contribution increase. Tax/fee rates and currency (KRW/USD) are configurable.',
    fv: 'Final net assets',
    contrib: 'Total invested',
    gain: 'Net gain (cumulative)',
    unitHint: 'Unit: auto (KRW / 10k / 100M)',
    chartTitle: 'DCA asset growth path',
    tableTitle: 'Yearly summary for DCA investing',
    faqTitle: 'DCA calculator FAQ',
  },
};

// FAQ 항목 (UI + JSON-LD 공용)
function getFaqItems(locale) {
  if (locale === 'ko') {
    return [
      {
        q: '월 투자금은 어떤 단위로 입력하나요?',
        a: '통화가 원화(KRW)일 때는 만원 단위로 입력합니다. 예를 들어 매월 30만원 투자면 30, 50만원이면 50으로 입력합니다. 통화를 USD로 변경한 경우에는 실제 달러 기준 금액을 그대로 입력하면 됩니다.',
      },
      {
        q: '연 수익률과 연간 적립금 증가율은 어떻게 설정하면 좋나요?',
        a: '연 수익률은 장기적인 자산 성장률 가정입니다. 예를 들어 7%를 입력하면 자산이 연 7%씩 성장하는 단순 모델로 시뮬레이션합니다. 연간 적립금 증가율은 연봉 인상이나 저축 여력 증가를 반영해, 해마다 월 적립금을 몇 %씩 늘릴지의 값입니다.',
      },
      {
        q: '세금·수수료는 어떻게 반영되나요?',
        a: '사용자가 입력한 세율(%)과 연 수수료율(%)을 기준으로, “세전 연 수익률에서 세후 실질 수익률이 얼마로 줄어드는지”를 단순 모델로 계산해서 월 수익률에 반영합니다. 기본값은 이자소득세 15.4%, 연 0.5% 수수료이며, 실제 상품별 세금·보수 구조와는 다를 수 있습니다.',
      },
      {
        q: '실제 수익률과 시뮬레이션 결과가 다를 수 있나요?',
        a: '실제 시장은 매일 변동하고, 환율·세법·상품 구조도 바뀝니다. 이 계산기는 일정한 연 수익률과 단순한 세금·수수료 모델을 전제로 하므로, “계획을 세우는 참고 도구”로 사용하시고 실제 투자는 반드시 추가적인 리스크 검토가 필요합니다.',
      },
      {
        q: '세율이나 수수료율을 0으로 두면 어떻게 되나요?',
        a: '세율과 수수료율을 0으로 입력하면 해당 비용을 완전히 제외한 상태로 적립식 결과를 계산합니다. 예를 들어 세율 0%, 수수료율 0%로 두면 세전·세후 수익률이 동일해지고, 장기적으로 세금·수수료로 인한 자산 격차가 어떻게 달라지는지 비교해 볼 수 있습니다.',
      },
    ];
  }

  return [
    {
      q: 'In what unit should I enter my monthly investment?',
      a: 'If the currency is KRW, use units of 10,000 KRW. For example, 300,000 KRW per month is 30, and 500,000 KRW is 50. If you switch to USD, enter the actual dollar amount you plan to invest each month.',
    },
    {
      q: 'How should I set the annual return and yearly contribution increase?',
      a: 'The annual return is a long-term growth assumption. For example, 7% means your assets are assumed to grow at 7% per year in a simplified model. The yearly contribution increase reflects salary growth or higher saving capacity, and controls how much your monthly contribution rises each year in % terms.',
    },
    {
      q: 'How are tax and fees applied in this calculator?',
      a: 'You specify the tax rate (%) and the annual fee rate (%). The model approximates how your gross annual return is reduced to a net return after these costs, and then applies that net rate at the monthly level. The default values are 15.4% tax and 0.5% annual fee, but real-world products may differ.',
    },
    {
      q: 'Why might real results differ from this simulation?',
      a: 'Markets fluctuate daily, and exchange rates, tax rules, and product structures can change over time. This calculator assumes a constant annual return and a simplified tax/fee model, so please treat it as a planning aid rather than a prediction engine.',
    },
    {
      q: 'What happens if I set tax or fee to 0?',
      a: 'If you set both the tax rate and fee rate to 0, the calculator removes those costs entirely. Gross and net performance become identical, which makes it easy to compare “with costs” vs “no costs” scenarios and see how much long-term drag taxes and fees can create.',
    },
  ];
}

// ===================== 페이지 컴포넌트 =====================
export default function DCACalculatorPage() {
  const router = useRouter();

  // ✅ URL(라우터) 기준이 “정답”: /en/...이면 무조건 en
  const routeLocale = router.locale === 'en' ? 'en' : 'ko';
  const numberLocale = routeLocale === 'ko' ? 'ko-KR' : 'en-US';
  const t = useMemo(() => TEXT[routeLocale] || TEXT.ko, [routeLocale]);

  // 언어에 따라 기본 통화 자동 설정
  const [currency, setCurrency] = useState(routeLocale === 'ko' ? 'KRW' : 'USD');
  const [result, setResult] = useState(null);

  // ✅ locale 변경(언어 토글) 시: 통화도 기본값으로 동기화
  useEffect(() => {
    setCurrency(routeLocale === 'ko' ? 'KRW' : 'USD');
  }, [routeLocale]);

  const faqItems = useMemo(() => getFaqItems(routeLocale), [routeLocale]);

  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    }),
    [faqItems]
  );

  // (선택) WebPage JSON-LD: “DCA 계산기 페이지”임을 명확히
  const site = 'https://www.finmaphub.com';
  const pageUrl = `${site}${routeLocale === 'en' ? '/en' : ''}/tools/dca-calculator`;
  const webPageJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t.seoTitle,
      description: t.seoDesc,
      url: pageUrl,
      inLanguage: routeLocale,
      isPartOf: {
        '@type': 'WebSite',
        name: 'FinMap',
        url: site,
      },
    }),
    [t.seoTitle, t.seoDesc, pageUrl, routeLocale]
  );

  const hasResult = !!(result && result.length);
  const last = hasResult ? result[result.length - 1] : null;

  const finalNet = last ? last.valueNet : 0;
  const totalInvested = last ? last.invested : 0;
  const totalGain = finalNet - totalInvested;

  const summaryFmt = (v) => formatMoneyAuto(v || 0, currency, numberLocale);

  const handleSubmit = (form) => {
    const scale = currency === 'KRW' ? 10_000 : 1;

    const initial = (Number(form.initial) || 0) * scale;
    const monthly = (Number(form.monthly) || 0) * scale;
    const r = Number(form.annualRate) || 0;
    const y = Number(form.years) || 0;
    const annualIncrease = Number(form.annualIncrease) || 0;

    const rows = simulateDCA({
      initial,
      monthly,
      annualRate: r,
      years: y,
      annualIncrease,
      compounding: form.compounding,
      taxRate: form.taxRate,
      feeRate: form.feeRate,
    });

    setResult(rows);
  };

  return (
    <>
      <SeoHead
        title={t.seoTitle}
        desc={t.seoDesc}
        url="/tools/dca-calculator"
        image="/og/dca-calculator.jpg"
        locale={routeLocale}   // ✅ 핵심: /en/... canonical 정합성
      />

      {/* JSON-LD (SEO용) */}
      <JsonLd data={faqJsonLd} />
      <JsonLd data={webPageJsonLd} />

      <div className="py-6 grid gap-6 fm-mobile-full">
        {/* 헤더 + 설명 */}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">{t.title}</h1>
          <p className="text-sm text-slate-600">{t.descShort}</p>
        </div>

        {/* 입력 폼 */}
        <div className="card">
          <DCAForm
            onSubmit={handleSubmit}
            locale={routeLocale}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        </div>

        {/* 결과 섹션 */}
        {hasResult && (
          <>
            {/* 상단 Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="stat">
                <div className="stat-title">{t.fv}</div>
                <div className="stat-value">{summaryFmt(finalNet)}</div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.contrib}</div>
                <div className="stat-value">{summaryFmt(totalInvested)}</div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.gain}</div>
                <div className="stat-value">{summaryFmt(totalGain)}</div>
              </div>
            </div>

            {/* 차트 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-semibold">{t.chartTitle}</h2>
                {currency === 'KRW' && (
                  <span className="text-xs text-slate-500">{t.unitHint}</span>
                )}
              </div>
              <DCAChart data={result} locale={numberLocale} currency={currency} />
            </div>

            {/* 연간 요약 테이블 */}
            <DCAYearTable rows={result} locale={numberLocale} currency={currency} title={t.tableTitle} />

            {/* FAQ 섹션 */}
            <div className="card w-full">
              <h2 className="text-lg font-semibold mb-3">{t.faqTitle}</h2>
              <div className="space-y-3">
                {faqItems.map((item, idx) => (
                  <details
                    key={idx}
                    className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                    open={idx === 0}
                  >
                    <summary className="cursor-pointer font-medium text-sm">
                      {item.q}
                    </summary>
                    <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>

            <div className="tool-cta-section">
              {/* DCA 페이지에서는 DCA 외 도구로 자연스러운 내부링크 강화 */}
              <ToolCta lang={routeLocale} type="compound" />
              <ToolCta lang={routeLocale} type="cagr" />
              <ToolCta lang={routeLocale} type="goal" />
              <ToolCta lang={routeLocale} type="fire" />
            </div>
          </>
        )}
      </div>
    </>
  );
}
