// pages/tools/dca-calculator.js
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/router';
import SeoHead from '../../_components/SeoHead';
import CTABar from "../../_components/CTABar";
import CompoundCTA from "../../_components/CompoundCTA";
import DCAForm from '../../_components/DcaForm';
import DCAChart from '../../_components/DcaChart';
import DCAYearTable from '../../_components/DcaYearTable';
import ResultAdSlot from "../../_components/ResultAdSlot";
import { formatMoneyAuto } from '../../lib/money';
import ToolCta from '../../_components/ToolCta';
import { ToolCitationBox, ToolSharePanel } from "../../_components/ToolBacklinkKit";
import { AD_SLOTS } from "../../config/adSlots";
import { shareKakao, shareWeb, shareNaver, copyUrl } from "../../utils/share";
import {
  buildToolPresetQuery,
  getToolPresetFromQuery,
  readToolRecent,
  replaceUrlQuery,
  writeToolRecent,
} from "../../utils/toolPreset";
import { trackGaEvent } from "../../utils/analytics";
const {
  analyzeDcaResult,
  buildDcaDrawdownScenarios,
  buildDcaSensitivity,
  simulateDcaPlan,
  solveMonthlyContributionForTarget,
} = require("../../lib/dcaCore");

// JSON-LD 스크립트용 컴포넌트
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
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
    modelNoticeTitle: '이 시뮬레이션의 가정',
    modelNotice:
      '이 페이지는 실제 가격 데이터가 아니라 입력한 연 수익률을 일정하게 적용하는 가정 기반 모델입니다. 가격은 시작 지수를 100으로 놓고 계산하며, 마지막 가격은 이 지수가 시뮬레이션 종료 시점에 도달한 값입니다. 실제 시장 변동성·환율·배당·상품별 세금 계산과 다를 수 있습니다.',
    decisionTitle: '결과 해석 요약',
    modelDrawdown: '단순 모델 낙폭',
    averageCost: '평균 매수단가',
    lumpSumCompare: '일괄투자 비교',
    shareSetup: '공유용 조건',
    grossAssets: '최종 세전 자산',
    netAssets: '최종 세후 자산',
    grossGain: '세전 수익',
    netGain: '세후 수익',
    taxAmount: '세금',
    feeAmount: '수수료',
    totalReturn: '총 수익률',
    unitsHeld: '보유 수량',
    finalPrice: '마지막 가격',
    taxFeeImpact: '세금·수수료 효과',
    calculationNotes: '계산 기준 자세히 보기',
    breakdownTitle: '내 돈과 수익 분해',
    breakdownHelp: '내가 직접 납입한 돈과 투자 성과로 늘어난 금액을 분리해서 보여줍니다.',
    principalShare: '원금 비중',
    gainShare: '수익 비중',
    lumpSumDetailsTitle: '일괄투자 비교 상세',
    dcaFinalNet: 'DCA 최종 세후 자산',
    lumpSumFinalNet: '일괄투자 최종 세후 자산',
    lumpSumGap: '차이 금액',
    lumpSumGapPct: '차이율',
    lumpSumPrincipal: '일괄투자에 사용한 원금',
    targetAmount: '목표 금액',
    targetAnalysisTitle: '목표 달성 분석',
    targetAnalysisHelp: '목표 금액은 최종 세후 자산 기준으로 비교합니다. 필요 월 납입금은 현재 수익률, 기간, 세금, 수수료 조건이 그대로 유지된다고 가정해 역산한 값입니다.',
    targetPlanningNote: '실제 시장 수익률은 매년 달라질 수 있으므로, 목표 금액 분석은 계획 수립용 참고값으로 활용하세요.',
    targetProjectedNet: '현재 조건 예상 세후 자산',
    targetStatus: '목표 달성 여부',
    targetReached: '달성 가능',
    targetNotReached: '부족',
    targetNotSolvable: '계산 확인 필요',
    targetShortfall: '목표까지 부족한 금액',
    targetSurplus: '목표 초과 금액',
    targetAchievementRate: '목표 달성률',
    currentMonthlyContribution: '현재 월 납입금',
    requiredMonthlyContribution: '목표 달성 필요 월 납입금',
    additionalMonthlyContribution: '추가로 필요한 월 납입금',
    targetSensitivityStatus: '목표 여부',
    targetSensitivityDelta: '목표 대비 초과/부족',
    drawdownScenarioTitle: '하락장 시나리오',
    drawdownScenarioHelp: '하락장 시나리오는 입력한 수익률이 일정하게 적용되는 기본 모델에 단순한 -20% 가격 충격을 추가한 비교입니다. 실제 시장의 변동성과 회복 속도를 예측하는 기능은 아니며, DCA가 하락 시점에 어떤 차이를 만들 수 있는지 이해하기 위한 참고용입니다.',
    drawdownScenarioMddHelp: '기본 모델은 가격이 일정한 월 수익률로만 움직이기 때문에 MDD가 0으로 나올 수 있습니다. 하락장 시나리오는 가격 충격을 포함하므로 MDD가 하락폭을 반영합니다.',
    baseModelScenario: '기본 모델',
    earlyDropScenario: '초반 하락 후 회복',
    midDropScenario: '중간 하락 후 회복',
    finalDropScenario: '마지막 해 하락',
    baseDiff: '기본 대비',
    scenarioDetails: '세부 값',
    sensitivityTitle: '조건 민감도',
    returnSensitivity: '연 수익률 민감도',
    periodSensitivity: '투자 기간 민감도',
    interpretationTitle: '이 결과를 어떻게 읽어야 하나요?',
    weekly: '매주',
    monthly: '매월',
    chartTitle: 'DCA 적립식 자산 성장 경로',
    tableTitle: '연도별 적립식 투자 요약 (DCA)',
    faqTitle: 'DCA 계산기 자주 묻는 질문(FAQ)',
  },
  en: {
    seoTitle: 'Dollar-Cost Averaging Calculator for ETFs and Stocks',
    seoDesc:
      'Use this dollar-cost averaging calculator to simulate monthly or weekly ETF and stock investing with taxes, fees, contribution increases, targets, and bear-market scenarios.',
    title: 'Dollar-Cost Averaging Calculator (DCA)',
    descShort:
      'Simulate a dollar-cost averaging plan for ETFs or stocks with current assets, recurring contributions, expected return, yearly contribution increases, tax, fees, and currency settings. Use the target and drawdown views to see whether the plan is on track.',
    fv: 'Final net assets',
    contrib: 'Total invested',
    gain: 'Net gain (cumulative)',
    unitHint: 'Unit: auto (KRW / 10k / 100M)',
    modelNoticeTitle: 'Model assumptions',
    modelNotice:
      'This simulator is assumption-based. It applies your annual return steadily instead of using live price data. Prices are shown as a relative index starting at 100, and the final price is the ending level of that index. Real market volatility, FX, dividends, and product-level tax rules can differ.',
    decisionTitle: 'Result interpretation summary',
    modelDrawdown: 'Simple model drawdown',
    averageCost: 'Average cost',
    lumpSumCompare: 'Lump-sum comparison',
    shareSetup: 'Shareable setup',
    grossAssets: 'Final gross assets',
    netAssets: 'Final net assets',
    grossGain: 'Gross gain',
    netGain: 'Net gain',
    taxAmount: 'Tax',
    feeAmount: 'Fee',
    totalReturn: 'Total return',
    unitsHeld: 'Units held',
    finalPrice: 'Final price',
    taxFeeImpact: 'Tax/fee drag',
    calculationNotes: 'View calculation notes',
    breakdownTitle: 'Principal and return breakdown',
    breakdownHelp: 'Separates the money you paid in from the amount created by the model return.',
    principalShare: 'Principal share',
    gainShare: 'Gain share',
    lumpSumDetailsTitle: 'Lump-sum comparison details',
    dcaFinalNet: 'DCA final net assets',
    lumpSumFinalNet: 'Lump-sum final net assets',
    lumpSumGap: 'Difference',
    lumpSumGapPct: 'Difference rate',
    lumpSumPrincipal: 'Principal used for lump sum',
    targetAmount: 'Target amount',
    targetAnalysisTitle: 'Target progress analysis',
    targetAnalysisHelp: 'The target amount is compared against the final after-tax value. The required monthly contribution is estimated using the same return, period, tax, and fee assumptions.',
    targetPlanningNote: 'This is a planning estimate, not a forecast.',
    targetProjectedNet: 'Projected final after-tax value',
    targetStatus: 'Target status',
    targetReached: 'On track',
    targetNotReached: 'Short',
    targetNotSolvable: 'Check assumptions',
    targetShortfall: 'Shortfall to target',
    targetSurplus: 'Surplus over target',
    targetAchievementRate: 'Achievement rate',
    currentMonthlyContribution: 'Current monthly contribution',
    requiredMonthlyContribution: 'Required monthly contribution',
    additionalMonthlyContribution: 'Additional monthly contribution needed',
    targetSensitivityStatus: 'Target status',
    targetSensitivityDelta: 'Surplus/shortfall vs target',
    drawdownScenarioTitle: 'Bear-market scenarios',
    drawdownScenarioHelp: 'Bear-market scenarios add a simple -20% price shock to the base model. They are not forecasts. They are intended to help you understand how timing of a drawdown can affect a DCA plan.',
    drawdownScenarioMddHelp: 'The base model can show 0 MDD because the price only moves by the steady monthly return. Bear-market scenarios include a price shock, so MDD reflects that drop.',
    baseModelScenario: 'Base model',
    earlyDropScenario: 'Early drop and recovery',
    midDropScenario: 'Mid-period drop and recovery',
    finalDropScenario: 'Final-year drop',
    baseDiff: 'Vs base',
    scenarioDetails: 'Details',
    sensitivityTitle: 'Assumption sensitivity',
    returnSensitivity: 'Annual return sensitivity',
    periodSensitivity: 'Investment period sensitivity',
    interpretationTitle: 'How should I read this result?',
    weekly: 'Weekly',
    monthly: 'Monthly',
    chartTitle: 'DCA asset growth path',
    tableTitle: 'Yearly summary for DCA investing',
    faqTitle: 'DCA calculator FAQ',
  },
};

const DCA_PRESET_FIELDS = [
  { query: "initial", state: "initial", type: "number" },
  { query: "monthly", state: "monthly", type: "number" },
  { query: "annualRate", state: "annualRate", type: "number" },
  { query: "years", state: "years", type: "number" },
  { query: "startDate", state: "startDate", type: "string" },
  { query: "frequency", state: "contributionFrequency", type: "string", allowed: ["monthly", "weekly"] },
  { query: "annualIncrease", state: "annualIncrease", type: "number" },
  { query: "compounding", state: "compounding", type: "string", allowed: ["monthly", "yearly"] },
  { query: "taxRate", state: "taxRate", type: "number" },
  { query: "feeRate", state: "feeRate", type: "number" },
  { query: "targetAmount", state: "targetAmount", type: "number" },
  { query: "currency", state: "currency", type: "string", allowed: ["KRW", "USD"] },
];

const DCA_RECENT_KEY = "fm_tool_recent_dca";

// FAQ 항목 (UI + JSON-LD 공용)
function getFaqItems(locale) {
  if (locale === 'ko') {
    return [
      {
        q: '월 투자금은 어떤 단위로 입력하나요?',
        a: '통화가 원화(KRW)일 때는 만원 단위로 입력합니다. 예를 들어 매월 30만원 투자면 30, 50만원이면 50으로 입력합니다. 통화를 USD로 변경한 경우에는 실제 달러 기준 금액을 그대로 입력하면 됩니다.',
      },
      {
        q: '매주 투자와 매월 투자는 어떻게 다르게 계산되나요?',
        a: '투자 주기를 매주로 바꾸면 입력한 금액을 주 단위 납입액으로 보고 1년에 52회 납입하는 것으로 계산합니다. 매월은 1년에 12회 납입입니다. 시작일은 결과 링크와 표의 기간 라벨을 맞추는 용도이며, 실제 시장 가격 데이터는 사용하지 않습니다.',
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
        a: '실제 시장은 매일 변동하고, 환율·세법·상품 구조도 바뀝니다. 이 계산기는 일정한 연 수익률과 단순한 세금·수수료 모델을 전제로 하므로, “계획을 세우는 참고 도구”로 사용하시고 실제 투자는 추가적인 리스크 검토가 필요합니다.',
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
      q: 'How do weekly and monthly investing differ in the simulation?',
      a: 'Weekly mode treats the contribution input as a weekly amount and assumes 52 contributions per year. Monthly mode assumes 12 contributions per year. The start date is used for shareable state and period labels; the model does not use live market price data.',
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
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  // ✅ URL(라우터) 기준이 “정답”: /en/...이면 무조건 en
  const routeLocale = router.locale === 'en' ? 'en' : 'ko';
  const numberLocale = routeLocale === 'ko' ? 'ko-KR' : 'en-US';
  const t = useMemo(() => TEXT[routeLocale] || TEXT.ko, [routeLocale]);

  // 언어에 따라 기본 통화 자동 설정
  const [currency, setCurrency] = useState(routeLocale === 'ko' ? 'KRW' : 'USD');
  const [result, setResult] = useState(null);
  const [lastParams, setLastParams] = useState(null);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const sectionEls = useRef({});
  const didRestorePreset = useRef(false);

  const scrollTo = (id) => {
    const el = sectionEls.current?.[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ✅ locale 변경(언어 토글) 시: 통화도 기본값으로 동기화
  useEffect(() => {
    setCurrency(routeLocale === 'ko' ? 'KRW' : 'USD');
  }, [routeLocale]);

  useEffect(() => {
    if (!router.isReady || didRestorePreset.current) return;
    didRestorePreset.current = true;

    const queryPreset = getToolPresetFromQuery(router.query, DCA_PRESET_FIELDS);
    const preset = queryPreset || readToolRecent(DCA_RECENT_KEY, DCA_PRESET_FIELDS);
    if (!preset) return;

    if (preset.currency) setCurrency(preset.currency);
    const { currency: _currency, ...formPreset } = preset;
    setFormInitialValues(formPreset);
  }, [router.isReady, router.query]);

  const persistPreset = (preset) => {
    // Query params are shareable state; SeoHead canonical stays queryless to avoid duplicate index URLs.
    writeToolRecent(DCA_RECENT_KEY, preset);
    replaceUrlQuery(buildToolPresetQuery(preset, DCA_PRESET_FIELDS));
  };

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

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    document.body.classList.add("fm-exporting");

    const target = document.getElementById("pdf-target");
    const details = target ? Array.from(target.querySelectorAll("details")) : [];
    const prevOpen = details.map((d) => d.open);
    details.forEach((d) => (d.open = true));

    await new Promise((r) => setTimeout(r, 400));

    const { downloadPDF } = await import("../../_components/PDFGenerator");
    await downloadPDF("pdf-target", "dca-result.pdf");

    details.forEach((d, i) => (d.open = prevOpen[i]));
    document.body.classList.remove("fm-exporting");
    setIsExporting(false);
  };

  // ----------------------------
  // ✅ 내부링크(추천 가이드 글)
  // 2단계에서: 네가 제공하는 실제 제목/설명(ko/en)을 여기 배열만 교체하면 됨
  // - ko/en 포스팅이 동일 slug를 공유하고, 상위 폴더만 ko/en로 분리되어 있다는 전제
  // - Next.js locale 유지: <Link locale={locale} />
  // ----------------------------
  const relatedGuides = useMemo(
    () => [
      {
        slug: "monthly-dca-10-year-result",
        tagKo: "대표 예시",
        tagEn: "Example",
        category: "personalFinance",
        titleKo: "월 50만원 적립식 투자, 10년 후 얼마가 될까?",
        titleEn: "What Happens If You Invest $500 a Month for 10 Years?",
        descKo: "월 50만원을 10년 동안 적립식으로 넣는 대표 예시로 원금·수익률·기간을 확인하고 DCA 계산기로 내 조건을 바꿔봅니다.",
        descEn: "A practical $500/month for 10 years DCA example that shows principal, return assumptions, and contribution trade-offs.",
      },
      {
        slug: "dca-fx-volatility-decomposition",
        tagKo: "DCA",
        tagEn: "DCA",
        category: "personalFinance",
        titleKo: "해외자산 DCA에서 ‘수익률 변동’과 ‘환율 변동’을 분리해 읽는 법: 한국 사용자용 운영 규칙(불안·중단 방지)",
        titleEn: "DCA Returns Are “Asset Return + Currency Return”: A Volatility Decomposition Framework That Reduces Panic and Rule-Drift",
        descKo: "해외자산 적립식(DCA)은 ‘원화 수익률’만 보면 불안이 커지고 중단 확률이 올라갑니다. 이 글은 달러 기준 자산수익과 USD/KRW 환율 변동을 분리해 해석하는 프레임, 그리고 중단/증액/리밸런싱을 예측 없이 실행으로 바꾸는 운영 규칙을 제공합니다. 마지막엔 DCA 계산기로 민감도(수익률·인플레·세금·수수료·적립금 증가율)를 체크합니다.",
        descEn: "Global DCA often fails for a simple reason: you judge one number (USD return) even though two engines drive it—asset returns and currency returns. This US-first guide gives a decomposition framework you can apply in minutes, plus a rules-based operating plan (contributions, guardrails, rebalancing triggers) that prevents panic pauses and strategy drift. You’ll also stress-test assumptions using the FinMap DCA Calculator.",
      },
      {
        slug: "dca-step-up-ruleset",
        tagKo: "스텝업",
        tagEn: "step-up contributions",
        category: "personalFinance",
        titleKo: "DCA의 핵심은 ‘월 납입액 설계’다: 증액(스텝업)·감액·일시중단 조건을 운영규칙으로 만드는 법",
        titleEn: "Step-Up DCA: A Rulebook for Raising (or Pausing) Contributions Without Breaking Your Plan",
        descKo: "적립식(DCA)은 타이밍이 아니라 ‘지속성’이 성패를 가릅니다. 월 납입액을 스텝업(증액)·감액·일시중단·재개 규칙으로 바꾸고, /tools/dca-calculator로 민감도(수익률·인플레·중단기간)를 스트레스 테스트하는 한국 사용자용 운영 가이드.",
        descEn: "A rules-based operating system for DCA: design a base contribution, add step-up and pause rules, and stress-test your plan with the DCA calculator—without relying on forecasts or product picks.",
      },
      {
        slug: "dca-consistency-7-fail-patterns",
        tagKo: "장기투자",
        tagEn: "long-term investing",
        category: "investingInfo",
        titleKo: "적립식(DCA)은 ‘수익률’이 아니라 ‘지속성’ 게임: 실패하는 DCA 패턴 7가지",
        titleEn: "DCA Is a Consistency Game, Not a Return Hack: 7 Ways People Fail (and How to Fix Them)",
        descKo: "DCA는 타이밍이 아니라 ‘지속성’이 성패를 가릅니다. 많은 투자자가 반복해서 무너지는 7가지 패턴과, 규칙을 다시 설계하는 실전 체크리스트를 정리했습니다.",
        descEn: "Dollar-cost averaging works when it survives real life. Here are 7 repeatable failure patterns—oversized contributions, panic pauses, rule drift—and a practical rulebook to rebuild a DCA plan you can actually keep.",
      },
      {
        slug: "goal-amount-fast-strategy",
        tagKo: "전략",
        tagEn: "Strategy",
        category: "personalFinance",
        titleKo: "목표에 더 빨리 도달하는 방법: 원금·수익률·기간의 균형",
        titleEn: "Reach goals faster: balance the levers",
        descKo: "원금/월적립/수익률/기간 중 무엇을 조정해야 목표 도달이 빨라지는지 정리합니다.",
        descEn: "Which lever matters most—principal, contribution, return, or time.",
      },
      {
        slug: "personal-start-5steps",
        tagKo: "입문",
        tagEn: "Getting started",
        category: "personalFinance",
        titleKo: "사회초년생 재테크 시작 5단계: 예산·비상금·투자 루틴",
        titleEn: "Personal finance start: 5 steps",
        descKo: "예산→비상금→저축→투자 순서로, 장기 복리 효과를 만드는 루틴을 제안합니다.",
        descEn: "A simple routine—budget, emergency fund, saving, investing—built for compounding.",
      },
    ],
    []
  );

  const hasResult = !!(result && result.length);
  const last = hasResult ? result[result.length - 1] : null;

  const finalNet = last ? last.valueNet : 0;
  const totalInvested = last ? last.invested : 0;
  const totalGain = finalNet - totalInvested;

  const summaryFmt = useCallback(
    (v) => formatMoneyAuto(v || 0, currency, numberLocale),
    [currency, numberLocale]
  );

  const resultInsights = useMemo(() => {
    if (!hasResult || !last || !lastParams) return null;

    const analysis = analyzeDcaResult(result, lastParams);
    if (!analysis) return null;
    const contributionLabel =
      lastParams.contributionFrequency === 'weekly'
        ? t.weekly
        : t.monthly;

    return {
      ...analysis,
      setup:
        routeLocale === 'ko'
          ? `${contributionLabel} ${summaryFmt(lastParams.periodContribution)} · ${lastParams.years}년 · 연 ${lastParams.annualRate}%`
          : `${contributionLabel} ${summaryFmt(lastParams.periodContribution)} · ${lastParams.years}y · ${lastParams.annualRate}%/yr`,
      startLabel: lastParams.startDate || (routeLocale === 'ko' ? '시작일 미지정' : 'No start date'),
    };
  }, [hasResult, last, lastParams, result, routeLocale, summaryFmt, t.monthly, t.weekly]);

  const sensitivity = useMemo(() => {
    if (!hasResult || !lastParams) return null;
    return buildDcaSensitivity(lastParams);
  }, [hasResult, lastParams]);

  const targetAnalysis = useMemo(() => {
    if (!hasResult || !lastParams || !(Number(lastParams.targetAmount) > 0)) return null;
    return solveMonthlyContributionForTarget(lastParams);
  }, [hasResult, lastParams]);

  const drawdownScenarios = useMemo(() => {
    if (!hasResult || !lastParams) return null;
    return buildDcaDrawdownScenarios(lastParams);
  }, [hasResult, lastParams]);

  const drawdownScenarioMaxNet = useMemo(() => {
    if (!drawdownScenarios?.length) return 0;
    return drawdownScenarios.reduce((max, row) => Math.max(max, Number(row.finalNet) || 0), 0);
  }, [drawdownScenarios]);

  const formatTargetDelta = useCallback(
    (value) => {
      const amount = Number(value) || 0;
      const abs = summaryFmt(Math.abs(amount));
      if (routeLocale === "ko") {
        return amount >= 0 ? `초과 ${abs}` : `부족 ${abs}`;
      }
      return amount >= 0 ? `Surplus ${abs}` : `Short ${abs}`;
    },
    [routeLocale, summaryFmt]
  );

  const getTargetStatusLabel = useCallback(
    (reached) => {
      if (reached == null) return t.targetNotSolvable;
      return reached ? t.targetReached : t.targetNotReached;
    },
    [t.targetNotReached, t.targetNotSolvable, t.targetReached]
  );

  const getDrawdownScenarioLabel = useCallback(
    (key) => {
      if (key === "early_drop_recovery") return t.earlyDropScenario;
      if (key === "mid_drop_recovery") return t.midDropScenario;
      if (key === "final_year_drop") return t.finalDropScenario;
      return t.baseModelScenario;
    },
    [t.baseModelScenario, t.earlyDropScenario, t.finalDropScenario, t.midDropScenario]
  );

  const formatScenarioDiff = useCallback(
    (value, pct) => {
      const amount = Number(value) || 0;
      const rate = Number(pct) || 0;
      if (Math.abs(amount) < 1) {
        return routeLocale === "ko" ? "기본과 동일" : "Same as base";
      }
      const sign = amount > 0 ? "+" : "-";
      return `${sign}${summaryFmt(Math.abs(amount))} (${sign}${Math.abs(rate).toFixed(2)}%)`;
    },
    [routeLocale, summaryFmt]
  );

  const formatScenarioMdd = useCallback((value) => {
    const mdd = Number(value) || 0;
    return mdd > 0 ? `-${mdd.toFixed(2)}%` : "0.00%";
  }, []);

  const coreMetricCards = useMemo(() => {
    if (!resultInsights) return [];
    const numberFmt = (value, digits = 2) =>
      Number(value || 0).toLocaleString(numberLocale, {
        maximumFractionDigits: digits,
      });

    return [
      {
        label: t.grossAssets,
        value: summaryFmt(resultInsights.finalGross),
        help:
          routeLocale === "ko"
            ? "세금·수수료 차감 전 모델 평가금액입니다."
            : "Model value before tax and fee drag.",
      },
      {
        label: t.netAssets,
        value: summaryFmt(resultInsights.finalNet),
        help:
          routeLocale === "ko"
            ? "입력한 세율·수수료율을 단순 반영한 최종 자산입니다."
            : "Final value after the simplified tax/fee assumptions.",
      },
      {
        label: t.totalReturn,
        value: `${resultInsights.cumulativeReturn.toFixed(2)}%`,
        help:
          routeLocale === "ko"
            ? "세후 자산을 누적 투자금과 비교한 수익률입니다."
            : "Net assets compared with total invested principal.",
      },
      {
        label: t.unitsHeld,
        value: numberFmt(resultInsights.totalUnits, 2),
        help:
          routeLocale === "ko"
            ? "지수 가격으로 매수한 모델 수량의 합계입니다."
            : "Total model units bought at the index price.",
      },
      {
        label: t.averageCost,
        value: resultInsights.averageCost.toFixed(2),
        help:
          routeLocale === "ko"
            ? "총 투자원금을 총 매수수량으로 나눈 평균 취득 가격입니다."
            : "Total invested principal divided by total model units.",
      },
      {
        label: t.finalPrice,
        value: resultInsights.priceProxy.toFixed(2),
        help:
          routeLocale === "ko"
            ? "시작 가격 100이 마지막 시점에 도달한 상대 지수입니다."
            : "The ending level of the relative price index that starts at 100.",
      },
      {
        label: t.taxFeeImpact,
        value: summaryFmt(resultInsights.taxFeeDrag),
        help:
          routeLocale === "ko"
            ? "세전 모델과 세후 모델의 차이입니다. 실제 납부 세금 원장과는 다를 수 있습니다."
            : "Difference between gross and net model values, not a tax ledger.",
      },
    ];
  }, [resultInsights, numberLocale, routeLocale, summaryFmt, t]);

  const moneyBreakdownItems = useMemo(() => {
    if (!resultInsights) return [];
    return [
      { label: t.contrib, value: summaryFmt(resultInsights.totalInvested) },
      { label: t.grossAssets, value: summaryFmt(resultInsights.finalGross) },
      { label: t.grossGain, value: summaryFmt(resultInsights.grossGain) },
      { label: t.taxAmount, value: summaryFmt(resultInsights.taxDragApprox) },
      { label: t.feeAmount, value: summaryFmt(resultInsights.feeDragApprox) },
      { label: t.netAssets, value: summaryFmt(resultInsights.finalNet) },
      { label: t.netGain, value: summaryFmt(resultInsights.totalGain) },
      { label: t.principalShare, value: `${resultInsights.principalSharePct.toFixed(1)}%` },
      { label: t.gainShare, value: `${resultInsights.gainSharePct.toFixed(1)}%` },
    ];
  }, [resultInsights, summaryFmt, t]);

  const lumpSumItems = useMemo(() => {
    if (!resultInsights) return [];
    return [
      { label: t.dcaFinalNet, value: summaryFmt(resultInsights.finalNet) },
      { label: t.lumpSumFinalNet, value: summaryFmt(resultInsights.lumpSumNet) },
      { label: t.lumpSumGap, value: summaryFmt(resultInsights.lumpSumGap) },
      { label: t.lumpSumGapPct, value: `${resultInsights.lumpSumGapPct.toFixed(2)}%` },
      { label: t.lumpSumPrincipal, value: summaryFmt(resultInsights.totalInvested) },
    ];
  }, [resultInsights, summaryFmt, t]);

  const handleSubmit = (form) => {
    const targetAmount = Number(form.targetAmount) || 0;

    persistPreset({
      initial: Number(form.initial) || 0,
      monthly: Number(form.monthly) || 0,
      annualRate: Number(form.annualRate) || 0,
      years: Number(form.years) || 0,
      startDate: form.startDate || "",
      contributionFrequency: form.contributionFrequency === "weekly" ? "weekly" : "monthly",
      annualIncrease: Number(form.annualIncrease) || 0,
      compounding: form.compounding === "yearly" ? "yearly" : "monthly",
      taxRate: Number(form.taxRate) || 0,
      feeRate: Number(form.feeRate) || 0,
      targetAmount: targetAmount > 0 ? targetAmount : "",
      currency: form.currency || currency,
    });

    const scale = currency === 'KRW' ? 10_000 : 1;

    const initial = (Number(form.initial) || 0) * scale;
    const monthly = (Number(form.monthly) || 0) * scale;
    const r = Number(form.annualRate) || 0;
    const y = Number(form.years) || 0;
    const annualIncrease = Number(form.annualIncrease) || 0;
    const contributionFrequency = form.contributionFrequency === "weekly" ? "weekly" : "monthly";

    const compounding = form.compounding === "yearly" ? "yearly" : "monthly";
    const simulation = simulateDcaPlan({
      initial,
      monthly,
      annualRate: r,
      years: y,
      startDate: form.startDate || "",
      contributionFrequency,
      annualIncrease,
      compounding,
      taxRate: form.taxRate,
      feeRate: form.feeRate,
    });

    setResult(simulation.rows);
    trackGaEvent("tool_calculate", {
      source_tool: "dca",
      locale: routeLocale,
      currency: form.currency || currency,
      has_result: true,
      location: "form_submit",
    });
    setLastParams({
      initial,
      periodContribution: monthly,
      annualRate: r,
      years: y,
      startDate: form.startDate || "",
      contributionFrequency,
      annualIncrease,
      compounding,
      taxRate: Number(form.taxRate) || 0,
      feeRate: Number(form.feeRate) || 0,
      targetAmount: targetAmount > 0 ? targetAmount : 0,
      periodsPerYear: simulation.meta.periodsPerYear,
      grossPeriodReturn: simulation.meta.grossPeriodReturn,
      netPeriodReturn: simulation.meta.netPeriodReturn,
      netAnnualReturn: simulation.meta.netAnnualReturn,
    });
  };

  const handleShare = async () => {
    const shareTitle = routeLocale === "ko" ? "FinMap DCA 시뮬레이터 결과" : "FinMap DCA simulation result";
    const shareDesc =
      routeLocale === "ko"
        ? "입력값이 포함된 링크로 DCA 결과를 다시 열고 비교해보세요."
        : "Reopen and compare this DCA result from a link that includes the inputs.";

    // 1) Web Share API
    if (
      await shareWeb({
        title: shareTitle,
        text: shareDesc,
        url: window.location.href,
      })
    )
      return;

    // 2) Kakao SDK
    if (typeof window !== "undefined" && window?.Kakao) {
      shareKakao({
        title: shareTitle,
        description: shareDesc,
        url: window.location.href,
      });
      return;
    }

    // 3) Naver share
    if (typeof window !== "undefined") {
      shareNaver({
        title: shareTitle,
        url: window.location.href,
      });
      return;
    }

    // 4) 최후 fallback: URL 복사
    copyUrl();
  };

  return (
    <>
      <SeoHead
        title={t.seoTitle}
        desc={t.seoDesc}
        url="/tools/dca-calculator"
        image="https://res.cloudinary.com/dwonflmnn/image/upload/v1766124235/blog/tools/DCA_MAIN.png"
        locale={routeLocale}   // ✅ 핵심: /en/... canonical 정합성
      />

      {/* JSON-LD (SEO용) */}
      <JsonLd data={faqJsonLd} />
      <JsonLd data={webPageJsonLd} />

      <div className={`w-full max-w-full min-w-0 py-6 grid grid-cols-1 gap-6 fm-mobile-full ${hasResult ? "fm-safe-bottom" : ""}`}>
        {/* 헤더 + 설명 */}
        <div className="flex min-w-0 max-w-full flex-col gap-2 break-words">
          <h1 className="max-w-full break-words text-xl font-bold leading-tight sm:text-2xl">{t.title}</h1>
          <p className="max-w-full break-words text-sm leading-relaxed text-slate-600">{t.descShort}</p>
        </div>

        <ToolSharePanel toolId="dca" locale={routeLocale} />

        {/* 입력 폼 */}
        <div className="card w-full min-w-0 max-w-full">
          <DCAForm
            onSubmit={handleSubmit}
            locale={routeLocale}
            currency={currency}
            onCurrencyChange={setCurrency}
            initialValues={formInitialValues}
          />
        </div>

        <section className="card min-w-0 max-w-full break-words border border-amber-200 bg-amber-50">
          <h2 className="break-words text-base font-semibold leading-snug text-slate-900">{t.modelNoticeTitle}</h2>
          <p className="mt-2 max-w-full break-words text-sm leading-relaxed text-slate-700">{t.modelNotice}</p>
        </section>

        {/* 결과 섹션 */}
        {hasResult && (
          <>
            <div id="pdf-target" className="grid min-w-0 max-w-full grid-cols-1 gap-6">
              {/* 상단 Summary */}
              <div ref={(el) => (sectionEls.current.sum = el)} className="grid min-w-0 max-w-full grid-cols-1 gap-4 scroll-mt-24 sm:grid-cols-3">
                <div className="stat min-w-0 max-w-full">
                  <div className="stat-title">{t.fv}</div>
                  <div className="stat-value">{summaryFmt(finalNet)}</div>
                </div>
                <div className="stat min-w-0 max-w-full">
                  <div className="stat-title">{t.contrib}</div>
                  <div className="stat-value">{summaryFmt(totalInvested)}</div>
                </div>
                <div className="stat min-w-0 max-w-full">
                  <div className="stat-title">{t.gain}</div>
                  <div className="stat-value">{summaryFmt(totalGain)}</div>
                </div>
              </div>

              <ResultAdSlot
                slot={AD_SLOTS.inArticle1}
                tool="dca"
                position="summary_after"
                locale={routeLocale}
              />

              {targetAnalysis && (
                <section className={`card min-w-0 max-w-full scroll-mt-24 break-words border ${targetAnalysis.reached ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-semibold leading-snug text-slate-900">{t.targetAnalysisTitle}</h2>
                      <p className="mt-1 break-words text-sm leading-relaxed text-slate-600">{t.targetAnalysisHelp}</p>
                    </div>
                    <span className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${targetAnalysis.reached ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {getTargetStatusLabel(targetAnalysis.reached)}
                    </span>
                  </div>

                  <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: t.targetAmount, value: summaryFmt(targetAnalysis.targetAmount) },
                      { label: t.targetProjectedNet, value: summaryFmt(targetAnalysis.projectedNetValue) },
                      {
                        label: targetAnalysis.reached ? t.targetSurplus : t.targetShortfall,
                        value: formatTargetDelta(targetAnalysis.projectedNetValue - targetAnalysis.targetAmount),
                      },
                      { label: t.targetAchievementRate, value: `${Math.min(9999, targetAnalysis.achievementRate || 0).toFixed(1)}%` },
                      { label: t.currentMonthlyContribution, value: summaryFmt(targetAnalysis.currentMonthlyContribution) },
                      {
                        label: t.requiredMonthlyContribution,
                        value:
                          targetAnalysis.requiredMonthlyContribution == null
                            ? t.targetNotSolvable
                            : summaryFmt(targetAnalysis.requiredMonthlyContribution),
                      },
                      {
                        label: t.additionalMonthlyContribution,
                        value:
                          targetAnalysis.additionalMonthlyContribution == null
                            ? t.targetNotSolvable
                            : summaryFmt(targetAnalysis.additionalMonthlyContribution),
                      },
                      { label: t.targetStatus, value: getTargetStatusLabel(targetAnalysis.reached) },
                    ].map((item) => (
                      <div key={item.label} className="min-w-0 rounded-lg border border-white/70 bg-white/80 px-3 py-2">
                        <div className="break-words text-[11px] font-medium text-slate-500">{item.label}</div>
                        <div className="mt-1 break-words text-sm font-semibold text-slate-900">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 break-words text-xs leading-relaxed text-slate-600">{t.targetPlanningNote}</p>
                </section>
              )}

              {resultInsights && (
                <section className="card min-w-0 max-w-full scroll-mt-24 break-words">
                  <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="break-words text-lg font-semibold leading-snug">{t.decisionTitle}</h2>
                    <span className="break-words text-xs text-slate-500">
                      {routeLocale === "ko" ? "공유 링크로 입력값 복원" : "Inputs restore from the shared link"}
                    </span>
                  </div>
                  <div className="mt-4 grid min-w-0 max-w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="min-w-0 max-w-full break-words rounded-xl border border-slate-200 bg-white p-3">
                      <div className="break-words text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {t.modelDrawdown}
                      </div>
                      <div className="mt-1 break-words text-lg font-semibold leading-snug text-slate-900">
                        {resultInsights.maxDrawdownPct.toFixed(2)}%
                      </div>
                      <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">
                        {routeLocale === "ko"
                          ? "연도별 세후 자산의 고점 대비 하락률입니다. 실제 가격 데이터 기반 MDD가 아닙니다."
                          : "Yearly net model drop from the prior peak, not a market-data MDD."}
                      </p>
                    </div>

                    <div className="min-w-0 max-w-full break-words rounded-xl border border-slate-200 bg-white p-3">
                      <div className="break-words text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {t.averageCost}
                      </div>
                      <div className="mt-1 break-words text-lg font-semibold leading-snug text-slate-900">
                        {resultInsights.averageCost.toFixed(2)}
                      </div>
                      <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">
                        {routeLocale === "ko"
                          ? `총 투자원금 / 총 매수수량. 지수 100 기준 마지막 가격은 ${resultInsights.priceProxy.toFixed(2)}입니다.`
                          : `Total invested / units. Final price on the 100 index is ${resultInsights.priceProxy.toFixed(2)}.`}
                      </p>
                    </div>

                    <div className="min-w-0 max-w-full break-words rounded-xl border border-slate-200 bg-white p-3">
                      <div className="break-words text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {t.lumpSumCompare}
                      </div>
                      <div className="mt-1 break-words text-lg font-semibold leading-snug text-slate-900">
                        {summaryFmt(resultInsights.lumpSumGap)}
                      </div>
                      <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">
                        {routeLocale === "ko"
                          ? `DCA 총 납입 예정액을 첫 달에 한 번에 투자했다고 가정한 세후 자산: ${summaryFmt(resultInsights.lumpSumNet)}`
                          : `Assumes the total planned DCA principal was invested upfront: ${summaryFmt(resultInsights.lumpSumNet)}`}
                      </p>
                    </div>

                    <div className="min-w-0 max-w-full break-words rounded-xl border border-slate-200 bg-white p-3">
                      <div className="break-words text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {t.shareSetup}
                      </div>
                      <div className="mt-1 break-words text-sm font-semibold leading-snug text-slate-900">
                        {resultInsights.setup}
                      </div>
                      <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">
                        {resultInsights.startLabel}
                      </p>
                    </div>
                  </div>

                  <details className="mt-4 min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <summary className="cursor-pointer break-words text-sm font-semibold text-slate-800">
                      {t.calculationNotes}
                    </summary>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      <li>
                        {routeLocale === "ko"
                          ? "MDD(Maximum Drawdown)는 특정 기간 중 고점 대비 저점까지 가장 크게 하락한 비율입니다. 예를 들어 자산이 1,000만원에서 800만원까지 내려가면 해당 구간 낙폭은 -20%입니다."
                          : "MDD (Maximum Drawdown) is the largest drop from a peak to a later low. If assets fall from 10,000 to 8,000, that segment is -20%."}
                      </li>
                      <li>
                        {routeLocale === "ko"
                          ? "현재 단순 모델 낙폭은 연평균 수익률을 일정하게 적용한 연도별 세후 자산 기준입니다. 양의 수익률과 추가 납입만 있는 단순 경로에서는 0.00%로 표시될 수 있습니다."
                          : "The simple model drawdown uses yearly net model values from a steady return path. With positive returns and ongoing contributions, it can show 0.00%."}
                      </li>
                      <li>
                        {routeLocale === "ko"
                          ? `지수 100 기준은 실제 ETF 가격이 아니라 시작 가격을 100으로 둔 상대 가격입니다. 마지막 가격 ${resultInsights.priceProxy.toFixed(2)}는 시작 지수가 약 ${(resultInsights.priceProxy / 100).toFixed(4)}배가 되었다는 뜻입니다.`
                          : `The 100 index is not a real ETF price. Final price ${resultInsights.priceProxy.toFixed(2)} means the starting index became about ${(resultInsights.priceProxy / 100).toFixed(4)}x.`}
                      </li>
                      <li>
                        {routeLocale === "ko"
                          ? `수익률은 ${lastParams.compounding === "yearly" ? "연복리 환산식 (1 + 연수익률)^(1/납입주기수) - 1" : "월복리 설정의 단순식 연수익률 / 납입주기수"}로 주기별 수익률을 만들고, 세후 모델은 연 수익률 × (1 - 세율) - 연 수수료율을 같은 방식으로 반영합니다.`
                          : `The period return uses ${lastParams.compounding === "yearly" ? "(1 + annual return)^(1 / periods per year) - 1" : "annual return / periods per year"}. The net model applies annual return × (1 - tax rate) - annual fee rate in the same mode.`}
                      </li>
                      <li>
                        {routeLocale === "ko"
                          ? "평균 매수단가는 총 투자원금 / 총 매수수량 기준입니다. 세금은 매도 시점 원장처럼 별도 계산하지 않고 세후 수익률 가정에 반영합니다."
                          : "Average cost is total invested principal / total units. Tax is included as a return assumption, not as a realized-sale tax ledger."}
                      </li>
                    </ul>
                  </details>

                  <div className="mt-4 grid min-w-0 max-w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {coreMetricCards.map((item) => (
                      <div key={item.label} className="min-w-0 rounded-lg border border-slate-200 bg-white p-3">
                        <div className="break-words text-xs font-semibold text-slate-500">{item.label}</div>
                        <div className="mt-1 break-words text-base font-semibold leading-snug text-slate-900">
                          {item.value}
                        </div>
                        <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">{item.help}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <h3 className="break-words text-sm font-semibold text-slate-900">{t.breakdownTitle}</h3>
                    <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">{t.breakdownHelp}</p>
                    <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
                      {moneyBreakdownItems.map((item) => (
                        <div key={item.label} className="min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2">
                          <div className="break-words text-[11px] font-medium text-slate-500">{item.label}</div>
                          <div className="mt-1 break-words text-sm font-semibold text-slate-900">{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 break-words text-[11px] leading-relaxed text-slate-500">
                      {routeLocale === "ko"
                        ? "세금과 수수료는 실제 원장값이 아니라 세후 수익률 가정을 기준으로 재시뮬레이션한 추정 효과입니다. 값이 0이면 0으로 표시합니다."
                        : "Tax and fee are estimated by re-running the simplified net-return model, not by building a realized tax ledger. Zero values are shown as 0."}
                    </p>
                  </div>

                  <div className="mt-4 min-w-0 rounded-lg border border-slate-200 bg-white p-3">
                    <h3 className="break-words text-sm font-semibold text-slate-900">{t.lumpSumDetailsTitle}</h3>
                    <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-5">
                      {lumpSumItems.map((item) => (
                        <div key={item.label} className="min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="break-words text-[11px] font-medium text-slate-500">{item.label}</div>
                          <div className="mt-1 break-words text-sm font-semibold text-slate-900">{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      <li>
                        {routeLocale === "ko"
                          ? "상승장이 꾸준히 이어지는 단순 모델에서는 일괄투자가 DCA보다 유리하게 나올 수 있습니다."
                          : "In a simple model where prices rise steadily, the lump-sum result can be higher than DCA."}
                      </li>
                      <li>
                        {routeLocale === "ko"
                          ? "DCA는 투자 시점을 나누기 때문에 하락장이나 변동성이 큰 구간에서 평균 매수단가를 낮추는 효과를 기대할 수 있습니다."
                          : "DCA spreads entry timing, so it can lower average cost in falling or volatile paths."}
                      </li>
                      <li>
                        {routeLocale === "ko"
                          ? "이 비교는 입력한 수익률이 일정하게 적용된 단순 모델 기준입니다."
                          : "This comparison uses the same steady-return assumption entered in the form."}
                      </li>
                    </ul>
                  </div>

                  {sensitivity && (
                    <div className="mt-4 min-w-0 rounded-lg border border-slate-200 bg-white p-3">
                      <h3 className="break-words text-sm font-semibold text-slate-900">{t.sensitivityTitle}</h3>
                      <div className="mt-3 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="min-w-0">
                          <div className="mb-2 text-xs font-semibold text-slate-600">{t.returnSensitivity}</div>
                          <div className="overflow-x-auto">
                            <table className={targetAnalysis ? "min-w-[960px] text-sm" : "min-w-[760px] text-sm"}>
                              <thead className="bg-slate-50 text-xs text-slate-500">
                                <tr>
                                  <th className="px-2 py-1 text-left">{routeLocale === "ko" ? "조건" : "Scenario"}</th>
                                  <th className="px-2 py-1 text-right">{routeLocale === "ko" ? "연 수익률" : "Annual return"}</th>
                                  <th className="px-2 py-1 text-right">{t.netAssets}</th>
                                  <th className="px-2 py-1 text-right">{t.netGain}</th>
                                  <th className="px-2 py-1 text-right">{t.totalReturn}</th>
                                  <th className="px-2 py-1 text-right">{t.finalPrice}</th>
                                  <th className="px-2 py-1 text-right">{t.averageCost}</th>
                                  {targetAnalysis && (
                                    <>
                                      <th className="px-2 py-1 text-right">{t.targetSensitivityStatus}</th>
                                      <th className="px-2 py-1 text-right">{t.targetSensitivityDelta}</th>
                                    </>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {sensitivity.returnScenarios.map((row) => (
                                  <tr key={row.key} className={`border-t ${row.delta === 0 ? "bg-blue-50 font-semibold text-slate-900" : ""}`}>
                                    <td className="px-2 py-1">
                                      {routeLocale === "ko"
                                        ? row.delta === 0
                                          ? "현재 가정"
                                          : `수익률 ${row.delta > 0 ? "+" : ""}${row.delta}%p`
                                        : row.delta === 0
                                          ? "Current"
                                          : `${row.delta > 0 ? "+" : ""}${row.delta}pp return`}
                                    </td>
                                    <td className="px-2 py-1 text-right">{row.annualRate.toFixed(2)}%</td>
                                    <td className="px-2 py-1 text-right">{summaryFmt(row.finalNet)}</td>
                                    <td className="px-2 py-1 text-right">{summaryFmt(row.totalGain)}</td>
                                    <td className="px-2 py-1 text-right">{row.cumulativeReturn.toFixed(2)}%</td>
                                    <td className="px-2 py-1 text-right">{row.priceProxy.toFixed(2)}</td>
                                    <td className="px-2 py-1 text-right">{row.averageCost.toFixed(2)}</td>
                                    {targetAnalysis && (
                                      <>
                                        <td className="px-2 py-1 text-right">{getTargetStatusLabel(row.targetReached)}</td>
                                        <td className="px-2 py-1 text-right">{formatTargetDelta(row.targetDelta)}</td>
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="mb-2 text-xs font-semibold text-slate-600">{t.periodSensitivity}</div>
                          <div className="overflow-x-auto">
                            <table className={targetAnalysis ? "min-w-[820px] text-sm" : "min-w-[620px] text-sm"}>
                              <thead className="bg-slate-50 text-xs text-slate-500">
                                <tr>
                                  <th className="px-2 py-1 text-left">{routeLocale === "ko" ? "조건" : "Scenario"}</th>
                                  <th className="px-2 py-1 text-right">{routeLocale === "ko" ? "기간" : "Years"}</th>
                                  <th className="px-2 py-1 text-right">{t.contrib}</th>
                                  <th className="px-2 py-1 text-right">{t.netAssets}</th>
                                  <th className="px-2 py-1 text-right">{t.netGain}</th>
                                  <th className="px-2 py-1 text-right">{t.totalReturn}</th>
                                  {targetAnalysis && (
                                    <>
                                      <th className="px-2 py-1 text-right">{t.targetSensitivityStatus}</th>
                                      <th className="px-2 py-1 text-right">{t.targetSensitivityDelta}</th>
                                    </>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {sensitivity.periodScenarios.map((row) => (
                                  <tr key={row.key} className={`border-t ${row.delta === 0 ? "bg-blue-50 font-semibold text-slate-900" : ""}`}>
                                    <td className="px-2 py-1">
                                      {routeLocale === "ko"
                                        ? row.delta === 0
                                          ? "현재 기간"
                                          : `+${row.delta}년`
                                        : row.delta === 0
                                          ? "Current"
                                          : `+${row.delta} years`}
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                      {routeLocale === "ko" ? `${row.years}년` : `${row.years}y`}
                                    </td>
                                    <td className="px-2 py-1 text-right">{summaryFmt(row.totalInvested)}</td>
                                    <td className="px-2 py-1 text-right">{summaryFmt(row.finalNet)}</td>
                                    <td className="px-2 py-1 text-right">{summaryFmt(row.totalGain)}</td>
                                    <td className="px-2 py-1 text-right">{row.cumulativeReturn.toFixed(2)}%</td>
                                    {targetAnalysis && (
                                      <>
                                        <td className="px-2 py-1 text-right">{getTargetStatusLabel(row.targetReached)}</td>
                                        <td className="px-2 py-1 text-right">{formatTargetDelta(row.targetDelta)}</td>
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {drawdownScenarios && (
                    <div className="mt-4 min-w-0 rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-semibold text-slate-900">{t.drawdownScenarioTitle}</h3>
                          <p className="mt-1 break-words text-xs leading-relaxed text-slate-500 sm:text-sm">
                            {t.drawdownScenarioHelp}
                          </p>
                        </div>
                        <span className="inline-flex w-fit shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          -20%
                        </span>
                      </div>

                      <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-4">
                        {drawdownScenarios.map((row) => {
                          const barWidth =
                            drawdownScenarioMaxNet > 0
                              ? Math.max(4, Math.min(100, ((Number(row.finalNet) || 0) / drawdownScenarioMaxNet) * 100))
                              : 0;
                          const diffPositive = (Number(row.baseDiff) || 0) > 0;
                          const diffNegative = (Number(row.baseDiff) || 0) < 0;

                          return (
                            <div
                              key={row.key}
                              className={`min-w-0 rounded-lg border p-3 ${
                                row.isBase ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <div className="flex min-w-0 items-start justify-between gap-2">
                                <div className="min-w-0 break-words text-sm font-semibold text-slate-900">
                                  {getDrawdownScenarioLabel(row.key)}
                                </div>
                                {row.isBase && (
                                  <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                    {routeLocale === "ko" ? "기준" : "Base"}
                                  </span>
                                )}
                              </div>

                              <div className="mt-3">
                                <div className="break-words text-[11px] font-medium text-slate-500">{t.netAssets}</div>
                                <div className="mt-1 break-words text-base font-semibold leading-snug text-slate-900">
                                  {summaryFmt(row.finalNet)}
                                </div>
                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                                  <div
                                    className={`h-full rounded-full ${row.isBase ? "bg-blue-500" : "bg-slate-500"}`}
                                    style={{ width: `${barWidth}%` }}
                                  />
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div className="min-w-0 rounded-md bg-white px-2 py-1.5">
                                  <div className="text-slate-500">{t.baseDiff}</div>
                                  <div className={`mt-0.5 break-words font-semibold ${
                                    diffPositive ? "text-emerald-700" : diffNegative ? "text-rose-700" : "text-slate-700"
                                  }`}>
                                    {formatScenarioDiff(row.baseDiff, row.baseDiffPct)}
                                  </div>
                                </div>
                                <div className="min-w-0 rounded-md bg-white px-2 py-1.5">
                                  <div className="text-slate-500">{routeLocale === "ko" ? "가격 경로 MDD" : "Price path MDD"}</div>
                                  <div className="mt-0.5 break-words font-semibold text-slate-800">
                                    {formatScenarioMdd(row.priceMaxDrawdownPct ?? row.maxDrawdownPct)}
                                  </div>
                                </div>
                                {targetAnalysis && (
                                  <div className="col-span-2 min-w-0 rounded-md bg-white px-2 py-1.5">
                                    <div className="text-slate-500">{t.targetSensitivityStatus}</div>
                                    <div className="mt-0.5 break-words font-semibold text-slate-800">
                                      {getTargetStatusLabel(row.targetReached)} · {formatTargetDelta(row.targetDelta)}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <details className="mt-3 min-w-0">
                                <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                                  {t.scenarioDetails}
                                </summary>
                                <dl className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-600">
                                  <div className="flex justify-between gap-2">
                                    <dt>{t.contrib}</dt>
                                    <dd className="text-right font-medium">{summaryFmt(row.totalInvested)}</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt>{t.netGain}</dt>
                                    <dd className="text-right font-medium">{summaryFmt(row.totalGain)}</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt>{t.totalReturn}</dt>
                                    <dd className="text-right font-medium">{row.cumulativeReturn.toFixed(2)}%</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt>{t.finalPrice}</dt>
                                    <dd className="text-right font-medium">{row.priceProxy.toFixed(2)}</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt>{t.averageCost}</dt>
                                    <dd className="text-right font-medium">{row.averageCost.toFixed(2)}</dd>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <dt>{t.unitsHeld}</dt>
                                    <dd className="text-right font-medium">
                                      {(Number(row.totalUnits) || 0).toLocaleString(numberLocale, { maximumFractionDigits: 2 })}
                                    </dd>
                                  </div>
                                </dl>
                              </details>
                            </div>
                          );
                        })}
                      </div>

                      <p className="mt-3 break-words text-xs leading-relaxed text-slate-500">
                        {t.drawdownScenarioMddHelp}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 min-w-0 rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <h3 className="break-words text-sm font-semibold text-slate-900">{t.interpretationTitle}</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-700 sm:text-sm">
                      <li>
                        {routeLocale === "ko"
                          ? "평균 매수단가가 마지막 가격보다 낮으면 이 단순 모델에서는 평가수익 구간입니다."
                          : "If average cost is below the final price, the simple model is in a gain position."}
                      </li>
                      <li>
                        {routeLocale === "ko"
                          ? "마지막 가격은 실제 주가가 아니라 시작 가격 100 기준의 상대 지수입니다."
                          : "The final price is a relative index level, not a real market quote."}
                      </li>
                      <li>
                        {routeLocale === "ko"
                          ? "DCA는 하락 구간에서 더 많은 수량을 사는 구조가 있지만, 꾸준한 상승 경로에서는 일괄투자 가정이 더 크게 나올 수 있습니다."
                          : "DCA buys more units in lower-price segments, while a steady rising path can favor the upfront lump-sum assumption."}
                      </li>
                      <li>
                        {routeLocale === "ko"
                          ? "세금/수수료 설정에 따라 세후 결과가 달라집니다."
                          : "After-tax results change when tax and fee assumptions change."}
                      </li>
                      <li>
                        {routeLocale === "ko"
                          ? "MDD는 고점 대비 최대 하락률이며, 현재 단순 모델에서는 하락 경로가 없으면 0으로 표시될 수 있습니다."
                          : "MDD is the maximum drop from a prior peak; this simple model can show 0 when there is no declining path."}
                      </li>
                      <li>
                        {routeLocale === "ko"
                          ? "이 화면은 입력값 기반 시뮬레이션이며 특정 투자 판단을 대신하지 않습니다."
                          : "This is an input-based simulation, not investment advice or a forecast."}
                      </li>
                    </ul>
                  </div>

                  <p className="mt-3 max-w-full break-words text-xs leading-relaxed text-slate-500">
                    {routeLocale === "ko"
                      ? `세후 누적수익률 ${resultInsights.cumulativeReturn.toFixed(2)}%, 세금·수수료 효과 ${summaryFmt(resultInsights.taxFeeDrag)}. 실제 변동성 기반 MDD는 별도 가격 데이터가 필요합니다.`
                      : `Net cumulative return ${resultInsights.cumulativeReturn.toFixed(2)}%, tax/fee drag ${summaryFmt(resultInsights.taxFeeDrag)}. Market-data drawdown requires a real price path.`}
                  </p>
                </section>
              )}

              {/* 차트 */}
              <div ref={(el) => (sectionEls.current.chart = el)} className="card min-w-0 max-w-full scroll-mt-24">
                <div className="mb-2 flex min-w-0 flex-wrap items-center gap-3">
                  <h2 className="break-words text-lg font-semibold leading-snug">{t.chartTitle}</h2>
                  {currency === 'KRW' && (
                    <span className="break-words text-xs text-slate-500">{t.unitHint}</span>
                  )}
                </div>
                <DCAChart data={result} locale={numberLocale} currency={currency} />
              </div>

              <ResultAdSlot
                slot={AD_SLOTS.inArticle2}
                tool="dca"
                position="chart_after"
                locale={routeLocale}
              />

              {/* 연간 요약 테이블 */}
              <div ref={(el) => (sectionEls.current.insight = el)} className="scroll-mt-24">
                <DCAYearTable rows={result} locale={numberLocale} currency={currency} title={t.tableTitle} />
              </div>

            </div>

            {/* ✅ (추가) 공유 + PDF 다운로드 CTA */}
            <div ref={(el) => (sectionEls.current.cta = el)} className="min-w-0 max-w-full scroll-mt-24">
              <CompoundCTA
                locale={routeLocale}
                onDownloadPDF={handleDownloadPDF}
                shareTitle={
                  routeLocale === "ko"
                    ? "FinMap DCA 시뮬레이션 결과"
                    : "DCA simulation result"
                }
                shareDescription={
                  routeLocale === "ko"
                    ? "입력값이 포함된 링크로 DCA 결과를 다시 열고, PDF로 저장해 비교해보세요."
                    : "Open the same DCA inputs from the shared link, then save or compare the result as a PDF."
                }
              />
            </div>

            <div className="tool-cta-section grid min-w-0 max-w-full grid-cols-1 gap-4">
              {/* DCA 페이지에서는 DCA 외 도구로 자연스러운 내부링크 강화 */}
              <ToolCta lang={routeLocale} type="compound" sourceTool="dca" location="result_cta" />
              <ToolCta lang={routeLocale} type="cagr" sourceTool="dca" location="result_cta" />
              <ToolCta lang={routeLocale} type="goal" sourceTool="dca" location="result_cta" />
              <ToolCta lang={routeLocale} type="fire" sourceTool="dca" location="result_cta" />
            </div>

            {/* 하단 고정 CTA Bar */}
            {!isExporting && (
              <CTABar
                locale={routeLocale}
                onDownloadPDF={handleDownloadPDF}
                onShare={handleShare}
                mode={"pro"}
                alwaysVisible={true}
                onNavigate={scrollTo}
              />
            )}
          </>
        )}

        {/* FAQ 섹션: FAQPage JSON-LD와 같은 faqItems를 사용하고 계산 전에도 노출합니다. */}
        <section className="card w-full min-w-0 max-w-full break-words">
          <h2 className="mb-3 break-words text-lg font-semibold leading-snug">{t.faqTitle}</h2>
          <div className="min-w-0 space-y-3">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="min-w-0 max-w-full rounded-lg border border-slate-200 bg-slate-50 p-3"
                open={idx === 0}
              >
                <summary className="cursor-pointer break-words text-sm font-medium leading-snug">
                  {item.q}
                </summary>
                <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ✅ 내부링크: 추천 가이드 글 5개 (SEO + 체류시간 + 내부탐색) */}
        <section className="card min-w-0 max-w-full">
          <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <h2 className="break-words text-base font-semibold leading-snug">
              {routeLocale === "ko" ? "추천 가이드 글" : "Recommended guides"}
            </h2>
            <Link              
              href={`/category/personalFinance`}
              locale={routeLocale}
              className="inline-flex min-h-[44px] items-center break-words text-sm text-slate-600 hover:underline"
            >
              {routeLocale === "ko" ? "전체 글 보기" : "View all posts"}
            </Link>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/posts/${g.category}/${g.slug}`}
                locale={routeLocale}
                className="block min-w-0 max-w-full rounded-2xl border p-4 transition hover:shadow-sm"
              >
                <div className="mb-1 break-words text-xs text-slate-500">
                  {routeLocale === "ko" ? g.tagKo : g.tagEn}
                </div>
                <div className="line-clamp-3 break-words font-semibold leading-snug">
                  {routeLocale === "ko" ? g.titleKo : g.titleEn}
                </div>
                {/* 2단계에서 길이 조정해도 되지만, 기본은 1줄로 고정 */}
                <div className="mt-1 line-clamp-2 break-words text-sm text-slate-600">
                  {routeLocale === "ko" ? g.descKo : g.descEn}
                </div>
              </Link>
            ))}
          </div>
        </section>
        <ToolCitationBox toolId="dca" locale={routeLocale} />
      </div>
    </>
  );
}
