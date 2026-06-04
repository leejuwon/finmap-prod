// pages/tools/cagr-calculator.js
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import SeoHead from "../../_components/SeoHead";
import CTABar from "../../_components/CTABar";
import CompoundCTA from "../../_components/CompoundCTA";
import CagrForm from "../../_components/CagrForm";
import CagrChart from "../../_components/CagrChart";
import CagrYearTable from "../../_components/CagrYearTable";
import ResultAdSlot from "../../_components/ResultAdSlot";
import ToolCta from "../../_components/ToolCta"; // ✅ (기존 파일에서 사용하지만 import 누락 가능성)
import { ToolCitationBox, ToolSharePanel } from "../../_components/ToolBacklinkKit";
import { AD_SLOTS } from "../../config/adSlots";
import { numberFmt } from "../../lib/compound";
import { calcCagr, formatYearsText } from "../../lib/cagr";
import { shareKakao, shareWeb, shareNaver, copyUrl } from "../../utils/share";
import {
  buildToolPresetQuery,
  getToolPresetFromQuery,
  readToolRecent,
  replaceUrlQuery,
  writeToolRecent,
} from "../../utils/toolPreset";
import { trackGaEvent } from "../../utils/analytics";

// JSON-LD 출력용
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const CAGR_PRESET_FIELDS = [
  { query: "initial", state: "initial", type: "number" },
  { query: "final", state: "final", type: "number" },
  { query: "years", state: "years", type: "number" },
  { query: "startDate", state: "startDate", type: "string" },
  { query: "endDate", state: "endDate", type: "string" },
  { query: "taxRate", state: "taxRate", type: "number" },
  { query: "feeRate", state: "feeRate", type: "number" },
  { query: "targetCagr", state: "targetCagr", type: "number" },
  { query: "targetValue", state: "targetValue", type: "number" },
  { query: "inflationRate", state: "inflationRate", type: "number" },
  { query: "currency", state: "currency", type: "string", allowed: ["KRW", "USD"] },
];

const CAGR_RECENT_KEY = "fm_tool_recent_cagr";

function trackToolHubClick({ targetTool, locale, location }) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", "tool_hub_click", {
    source_tool: "cagr",
    target_tool: targetTool,
    locale,
    location,
  });
}

export default function CagrCalculatorPage() {
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  // ✅ URL(/en/...) 기준이 진짜 언어
  const lang = router.locale === "en" ? "en" : "ko";
  const locale = lang; // "ko" | "en"
  const numberLocale = locale === "ko" ? "ko-KR" : "en-US";

  // 통화: locale 전환 시 기본값만 맞춰주고, 사용자가 바꾸면 유지
  const [currency, setCurrency] = useState(locale === "ko" ? "KRW" : "USD");
  useEffect(() => {
    if (!router.isReady) return;
    setCurrency(router.locale === "en" ? "USD" : "KRW");
  }, [router.isReady, router.locale]);

  const [result, setResult] = useState(null);
  const [initial, setInitial] = useState(0);
  const [finalValue, setFinalValue] = useState(0);
  const [years, setYears] = useState(0);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const sectionEls = useRef({});
  const didRestorePreset = useRef(false);

  const scrollTo = (id) => {
    const el = sectionEls.current?.[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!router.isReady || didRestorePreset.current) return;
    didRestorePreset.current = true;

    const queryPreset = getToolPresetFromQuery(router.query, CAGR_PRESET_FIELDS);
    const preset = queryPreset || readToolRecent(CAGR_RECENT_KEY, CAGR_PRESET_FIELDS);
    if (!preset) return;

    if (preset.currency) setCurrency(preset.currency);
    const { currency: _currency, ...formPreset } = preset;
    setFormInitialValues(formPreset);
  }, [router.isReady, router.query]);

  const persistPreset = (preset) => {
    writeToolRecent(CAGR_RECENT_KEY, preset);
    replaceUrlQuery(buildToolPresetQuery(preset, CAGR_PRESET_FIELDS));
  };

  // 텍스트 리소스
  const t = useMemo(
    () => ({
      // ✅ 타이틀/디스크립션에 “연평균 수익률/연복리/연평균 성장률” 키워드 포함
      title:
        locale === "ko"
          ? "CAGR 계산기 (연평균 수익률·연복리 수익률·연평균 성장률)"
          : "CAGR Calculator (Annualized Return / Growth Rate)",
      desc:
        locale === "ko"
          ? "초기 자산·최종 자산·기간으로 CAGR(연평균 복리 수익률)을 계산하고, 세금·수수료 반영 전후 차이를 비교해보세요. 주식/ETF/부동산/코인 수익률 분석에 활용할 수 있습니다."
          : "Calculate CAGR (compound annual growth rate) from initial/final value and time horizon, and compare gross vs net impact of taxes and fees.",

      heroTitle:
        locale === "ko"
          ? "CAGR(연평균 수익률)로\n내 투자 성과를 한 줄 숫자로"
          : "Summarize your investment\nperformance in one CAGR number",
      heroLead:
        locale === "ko"
          ? "CAGR은 들쭉날쭉한 연 수익률을 “연속된 하나의 연 복리 수익률”로 바꿔 보여주는 지표입니다. 단순 평균이 아니라, 실제 자산이 불어난 속도를 반영합니다."
          : "CAGR compresses bumpy yearly returns into a single annualized rate that reflects how fast your money actually grew.",
      stat1Title: locale === "ko" ? "초기 → 최종" : "Initial → Final",
      stat1Value: locale === "ko" ? "한 줄 요약" : "One-line summary",
      stat2Title: locale === "ko" ? "세전 vs 세후" : "Gross vs net",
      stat2Value: locale === "ko" ? "비용 반영" : "Costs included",
      stat3Title: locale === "ko" ? "연도별 경로" : "Yearly path",
      stat3Value: locale === "ko" ? "그래프·표" : "Chart & table",

      introTitle:
        locale === "ko"
          ? "CAGR 계산기는 이렇게 활용해 보세요"
          : "How to use this CAGR calculator",
      introLead:
        locale === "ko"
          ? "“초기에 얼마를 넣어서, 지금 얼마가 되었는지”만 알아도, 그 사이의 연평균 복리 수익률(CAGR)을 추정할 수 있습니다."
          : "If you know how much you started with and how much you have now, you can estimate your CAGR in between.",
      introBullet1:
        locale === "ko"
          ? "초기 자산(투자 원금)과 최종 자산(현재/목표), 투자 기간(년)을 입력하면 CAGR을 계산합니다."
          : "Enter initial value, final value, and years to calculate CAGR.",
      introBullet2:
        locale === "ko"
          ? "세율과 수수료율을 직접 입력해 세전·세후 CAGR 차이(비용 효과)를 비교할 수 있습니다. 0이면 미적용입니다."
          : "Enter your own tax/fee rates to compare gross vs net CAGR. Setting them to 0 removes the cost.",
      introBullet3:
        locale === "ko"
          ? "연도별 자산 경로를 그래프/표로 보면서 CAGR 숫자가 자산 성장과 어떻게 연결되는지 확인합니다."
          : "A yearly path chart/table helps you connect the CAGR number to the growth timeline.",

      netCagrLabel:
        locale === "ko" ? "세후 CAGR(연평균 수익률)" : "Net CAGR (after costs)",
      grossCagrLabel:
        locale === "ko" ? "세전 CAGR(추정)" : "Estimated gross CAGR",
      initialLabel: locale === "ko" ? "초기 자산" : "Initial value",
      finalLabel: locale === "ko" ? "최종 자산" : "Final value",
      periodLabel: locale === "ko" ? "투자 기간" : "Investment period",
      yearsUnit: locale === "ko" ? "년" : "years",
      chartTitle:
        locale === "ko" ? "세전 vs 세후 자산 경로" : "Gross vs net asset path",
      resultCautionTitle:
        locale === "ko"
          ? "CAGR 숫자만 보고 끝내지 마세요"
          : "Do not stop at the CAGR number",
      resultCautionBody:
        locale === "ko"
          ? "연복리 수익률이 같아도 변동성, 중간 추가납입, 세금·수수료, 투자 기간이 다르면 실제 체감 성과는 달라집니다. CAGR은 성과를 한 줄로 요약하는 출발점이고, 다음 단계는 적립식 투자·목표 자산·복리 시나리오로 다시 확인하는 것입니다."
          : "The same CAGR can feel very different when volatility, additional contributions, taxes, fees, or time horizon change. Treat CAGR as a starting point, then test the plan with DCA, goal, and compound-interest scenarios.",

      // ✅ 키워드 섹션 타이틀
      explainTitle:
        locale === "ko"
          ? "CAGR 계산 공식·해석 (연평균 수익률 vs 총 수익률)"
          : "CAGR formula & interpretation",
      explainBody:
        locale === "ko"
          ? "CAGR은 (최종/초기)^(1/기간) - 1 로 계산됩니다. 같은 ‘총 수익률’이라도 기간이 길수록 연평균 수익률은 낮아집니다. 반대로 CAGR이 1~2%만 달라도 복리 누적 효과로 장기 결과는 크게 벌어질 수 있습니다."
          : "CAGR is (Final/Initial)^(1/Years) - 1. The same total return implies different CAGR depending on time, and small CAGR gaps compound into large long-term differences.",

      faqTitle:
        locale === "ko"
          ? "CAGR 계산기 자주 묻는 질문(FAQ)"
          : "CAGR calculator FAQ",
      toolHubTitle:
        locale === "ko"
          ? "CAGR 계산 후 다음 계산기로 이어가기"
          : "Continue from CAGR into the next calculator",
      toolHubLead:
        locale === "ko"
          ? "CAGR은 과거 성과를 요약하는 도구입니다. 앞으로의 월 납입, 목표 금액, 복리 누적 결과는 아래 계산기로 이어서 확인하세요."
          : "CAGR summarizes past performance. Use the next tools to test monthly contributions, target amounts, and long-term compounding.",
    }),
    [locale]
  );

  const summaryFmt = (v) => numberFmt(numberLocale, currency, v || 0);
  const pctFmt = (v) => `${((Number(v) || 0) * 100).toFixed(2)}%`;
  const pctPointFmt = (v, digits = 2) => `${(Number(v) || 0).toFixed(digits)}%`;
  const signedSummaryFmt = (v) => {
    const n = Number(v) || 0;
    if (n === 0) return summaryFmt(0);
    return `${n > 0 ? "+" : "-"}${summaryFmt(Math.abs(n))}`;
  };
  const yearsText = (v) => {
    if (v == null || !Number.isFinite(Number(v))) return locale === "ko" ? "계산 범위 초과" : "Out of range";
    return formatYearsText(v, locale) || (locale === "ko" ? "계산 범위 초과" : "Out of range");
  };

  const cagrUx = useMemo(
    () =>
      locale === "ko"
        ? {
            summaryTitle: "CAGR 결과 해석",
            summaryLead:
              "CAGR은 시작금액과 최종금액을 매년 같은 비율로 성장했다고 가정해 환산한 연평균 복리 성장률입니다.",
            start: "시작금액",
            end: "최종금액",
            period: "기간",
            totalReturn: "총수익률",
            cagr: "CAGR",
            realCagr: "실질 CAGR",
            targetEnding: "목표 CAGR 기준 최종금액",
            yearsToTarget: "목표금액 도달 기간",
            totalVsCagrTitle: "총수익률 vs CAGR",
            totalVsCagrBody:
              "총수익률은 전체 기간의 누적 변화이고, CAGR은 그 결과를 연평균 복리 기준으로 환산한 값입니다. 10년 동안 2배가 되면 총수익률은 100%지만 CAGR은 약 7.18%입니다.",
            sensitivityTitle: "고급 해석: 민감도 비교",
            sensitivityLead:
              "CAGR과 기간을 조금씩 바꿨을 때 최종금액과 필요한 CAGR이 어떻게 달라지는지 비교합니다.",
            cagrSensitivity: "CAGR 민감도",
            periodSensitivity: "기간 민감도",
            current: "현재",
            samePeriodEnd: "같은 기간 후 최종금액",
            finalDiff: "현재 최종금액 대비 차이",
            requiredCagr: "필요 CAGR",
            readingTitle: "결과를 어떻게 읽어야 하나요?",
            readingItems: [
              "CAGR은 실제 매년 같은 수익률이 발생했다는 뜻이 아닙니다.",
              "변동성이 큰 투자도 시작금액과 최종금액만 같으면 같은 CAGR이 나올 수 있습니다.",
              "총수익률과 CAGR은 함께 봐야 합니다.",
              "투자 기간이 짧을수록 같은 최종금액에 필요한 CAGR이 크게 보일 수 있습니다.",
              "물가상승률을 고려하면 실질 성장률은 명목 CAGR보다 낮아질 수 있습니다.",
            ],
            nominalRealNote:
              "실질 CAGR은 명목 CAGR에서 물가상승률 효과를 단순 반영한 구매력 기준 성장률입니다.",
          }
        : {
            summaryTitle: "How to read the CAGR result",
            summaryLead:
              "CAGR converts the start-to-end change into a constant annual compound growth rate.",
            start: "Starting value",
            end: "Ending value",
            period: "Period",
            totalReturn: "Total return",
            cagr: "CAGR",
            realCagr: "Real CAGR",
            targetEnding: "Ending value at target CAGR",
            yearsToTarget: "Years to target amount",
            totalVsCagrTitle: "Total return vs CAGR",
            totalVsCagrBody:
              "Total return is the cumulative change over the full period. CAGR annualizes that change as a compound rate. Doubling over 10 years is a 100% total return, but about 7.18% CAGR.",
            sensitivityTitle: "Advanced view: sensitivity",
            sensitivityLead:
              "Compare how ending value and required CAGR change when the CAGR or period assumption moves.",
            cagrSensitivity: "CAGR sensitivity",
            periodSensitivity: "Period sensitivity",
            current: "Current",
            samePeriodEnd: "Ending value over same period",
            finalDiff: "Difference vs current ending value",
            requiredCagr: "Required CAGR",
            readingTitle: "How should I interpret this?",
            readingItems: [
              "CAGR does not mean the same return happened every year.",
              "Volatile paths can share the same CAGR if the starting and ending values match.",
              "Read total return and CAGR together.",
              "A shorter period can make the required CAGR look much larger.",
              "After inflation, real growth can be lower than nominal CAGR.",
            ],
            nominalRealNote:
              "Real CAGR is a simple purchasing-power adjustment using the inflation rate input.",
          },
    [locale]
  );

  // FAQ 항목 (UI + JSON-LD 공통)
  const faqItems = useMemo(
    () =>
      locale === "ko"
        ? [
            {
              q: "CAGR은 단순 평균 수익률과 무엇이 다른가요?",
              a: "단순 평균은 연수익률을 더해 연수로 나누지만, CAGR은 처음과 끝 자산 규모를 기준으로 “매년 동일한 수익률이 났다면 몇 %인가?”를 계산합니다. 마이너스 구간이 섞여 있을 때 특히 차이가 커집니다.",
            },
            {
              q: "연평균 성장률(연평균 수익률) 계산에 CAGR을 써도 되나요?",
              a: "네. 투자 성과(수익률)뿐 아니라 자산/매출/지표의 ‘연평균 성장률’을 하나의 수치로 요약할 때 CAGR을 많이 사용합니다.",
            },
            {
              q: "기간 입력은 연 단위로만 가능한가요?",
              a: "현재 버전에서는 소수점 연 단위를 지원합니다. 예: 2년 6개월 → 2.5년.",
            },
            {
              q: "세금·수수료는 어떻게 반영하나요?",
              a: "이 계산기는 사용자가 입력한 세율(%)과 연 수수료율(%)을 활용해, 세후 CAGR을 기준으로 세전 CAGR을 단순 모델로 역산합니다. 실제 상품별 과세/보수 구조와 차이가 있을 수 있습니다. 0으로 입력하면 미적용입니다.",
            },
            {
              q: "CAGR만 같으면 투자 결과도 비슷한가요?",
              a: "아닙니다. CAGR은 시작값과 종료값을 연평균 성장률로 요약하지만, 중간 변동성·추가납입·인출·세금·수수료는 체감 결과를 크게 바꿉니다. 적립식 투자라면 DCA 시뮬레이터, 목표 금액 역산은 목표 자산 시뮬레이터로 함께 확인하는 편이 좋습니다.",
            },
          ]
        : [
            {
              q: "How is CAGR different from a simple average return?",
              a: "A simple average divides summed returns by years. CAGR asks: “What constant annual rate would turn the initial value into the final value over the same period?”",
            },
            {
              q: "Can I use CAGR as an annualized growth rate?",
              a: "Yes. CAGR is widely used to summarize annualized growth for investments, metrics, revenue, or any value over time.",
            },
            {
              q: "Can I enter fractional years?",
              a: "Yes. Decimal years are supported (e.g., 2.5 years).",
            },
            {
              q: "How are tax and fees applied?",
              a: "The calculator treats the growth from initial to final as net, then estimates a gross CAGR consistent with your tax/fee inputs. Real-world products can be more complex. Set them to 0 to remove the cost.",
            },
            {
              q: "Does the same CAGR mean the same investing experience?",
              a: "No. CAGR summarizes the starting and ending values, but volatility, contributions, withdrawals, taxes, and fees can make the real experience very different. Use the DCA, goal, and compound calculators to test the next scenario.",
            },
          ],
    [locale]
  );

  // ✅ FAQ JSON-LD
  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    }),
    [faqItems]
  );

  // ✅ Breadcrumb JSON-LD
  const breadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "FinMap",
          item: "https://www.finmaphub.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: locale === "ko" ? "도구" : "Tools",
          item:
            locale === "ko"
              ? "https://www.finmaphub.com/tools"
              : "https://www.finmaphub.com/en/tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name:
            locale === "ko"
              ? "CAGR 계산기"
              : "CAGR Calculator",
          item:
            locale === "ko"
              ? "https://www.finmaphub.com/tools/cagr-calculator"
              : "https://www.finmaphub.com/en/tools/cagr-calculator",
        },
      ],
    }),
    [locale]
  );

  // ✅ WebApplication JSON-LD (툴 페이지에 도움 됨)
  const appJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name:
        locale === "ko"
          ? "FinMap CAGR 계산기"
          : "FinMap CAGR Calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    }),
    [locale]
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
    await downloadPDF("pdf-target", "cagr-result.pdf");

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
        slug: "what-is-cagr",
        category: "personalFinance",
        tagKo: "CAGR 계산법",
        tagEn: "CAGR guide",
        titleKo: "CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시",
        titleEn: "CAGR Calculator Guide: Formula, Example, and Simple Return Difference",
        descKo: "CAGR 계산식, 단순 수익률과의 차이, 장기 투자 성과 비교 방법을 예시와 표로 정리합니다.",
        descEn: "Understand the CAGR formula, compare it with simple return, and use examples to evaluate long-term performance.",
      },
      {
        slug: "cagr-7percent-reality-check",
        category: "investingInfo",
        tagKo: "장기 CAGR",
        tagEn: "long-term CAGR",
        titleKo: "연 7% 복리 현실 체크: CAGR로 목표 자산 계산하는 법",
        titleEn: "7% Annual Return Reality Check: CAGR, Volatility, and Compounding",
        descKo: "연 7% 복리가 실제로 얼마를 의미하는지 변동성, 세금, 물가와 함께 점검합니다.",
        descEn: "Check what a 7% annual return means once volatility, time horizon, and compounding assumptions enter the plan.",
      },
      {
        slug: "diagnose-investing-skill-with-cagr",
        category: "investingInfo",
        tagKo: "CAGR로 투자 실력 진단",
        tagEn: "Investing Skill Using CAGR",
        titleKo: "CAGR로 투자 실력 진단하기: MDD·변동성·샤프비율과 함께 보는 현실적인 평가법",
        titleEn: "Diagnosing Your Investing Skill Using CAGR: Understanding MDD, Volatility, and Sharpe Ratio",
        descKo: "CAGR은 결국 ‘돈이 얼마나 늘어났는가’를 보여주는 핵심 지표지만, 단점도 명확합니다. MDD·변동성·샤프비율과 함께 투자 실력을 평가해야 현실적인 결과가 나옵니다. 초보자도 이해할 수 있도록 실제 포트폴리오 비교 사례까지 포함해 자세히 설명합니다.",
        descEn: "CAGR shows how much your portfolio has grown, but it does not capture risk. To evaluate investing skill realistically, you must combine CAGR with MDD, volatility, and the Sharpe ratio. This guide explains each metric and compares two real portfolio scenarios.",
      },
     {
        slug: "how-much-per-month-for-100m",
        category: "personalFinance",
        tagKo: "적립식",
        tagEn: "Contributions",
        titleKo: "목표 금액을 위한 월 투자금: 역산으로 계획 세우기",
        titleEn: "Monthly contribution planning: reverse-calc",
        descKo: "목표금액·기간·수익률로 필요한 월 적립금을 역산해 투자 계획을 만듭니다.",
        descEn: "Reverse-calculate monthly contribution from target, years, and expected return.",
      },
      {
        slug: "goal-amount-fast-strategy",
        category: "personalFinance",
        tagKo: "전략",
        tagEn: "Strategy",
        titleKo: "목표에 더 빨리 도달하는 방법: 원금·수익률·기간의 균형",
        titleEn: "Reach goals faster: balance the levers",
        descKo: "원금/월적립/수익률/기간 중 무엇을 조정해야 목표 도달이 빨라지는지 정리합니다.",
        descEn: "Which lever matters most—principal, contribution, return, or time.",
      },
    ],
    []
  );

  const relatedTools = useMemo(
    () => [
      {
        href: "/tools/dca-calculator",
        targetTool: "dca",
        badgeKo: "적립식 투자",
        badgeEn: "DCA",
        anchorKo: "DCA 적립식 투자 시뮬레이터로 월 납입 계획 만들기",
        anchorEn: "Open the DCA simulator for monthly contribution plans",
        descKo: "CAGR 가정을 월 적립금, 세금, 수수료, 납입 증가율까지 넣어 장기 자산 경로로 바꿔봅니다.",
        descEn: "Turn a return assumption into a monthly contribution path with taxes, fees, and step-up rules.",
      },
      {
        href: "/tools/goal-simulator",
        targetTool: "goal",
        badgeKo: "목표 자산",
        badgeEn: "Goal",
        anchorKo: "목표 자산 시뮬레이터로 필요한 월 투자금 계산하기",
        anchorEn: "Use the goal simulator to find required monthly investment",
        descKo: "목표 금액과 기간을 정하고, 필요한 월 납입액과 수익률 민감도를 역산합니다.",
        descEn: "Set a target amount and time horizon, then reverse-calculate the monthly investment needed.",
      },
      {
        href: "/tools/compound-interest",
        targetTool: "compound",
        badgeKo: "복리",
        badgeEn: "Compound",
        anchorKo: "복리 계산기로 원금·월적립·기간별 미래가치 보기",
        anchorEn: "Compare future value in the compound interest calculator",
        descKo: "원금, 월 적립금, 복리 주기, 세금·수수료를 바꿔 미래가치를 비교합니다.",
        descEn: "Compare future value by changing principal, contributions, compounding frequency, taxes, and fees.",
      },
    ],
    []
  );

  const onSubmit = (form) => {
    persistPreset({
      initial: Number(form.initial) || 0,
      final: Number(form.final) || 0,
      years: Number(form.years) || 0,
      startDate: form.startDate || "",
      endDate: form.endDate || "",
      taxRate: Number(form.taxRate) || 0,
      feeRate: Number(form.feeRate) || 0,
      targetCagr: Number(form.targetCagr) || 0,
      targetValue: Number(form.targetValue) || 0,
      inflationRate: Number(form.inflationRate) || 0,
      currency: form.currency || currency,
    });

    const scale = currency === "KRW" ? 10_000 : 1;
    const init = (Number(form.initial) || 0) * scale;
    const fin = (Number(form.final) || 0) * scale;
    const targetAmount = (Number(form.targetValue) || 0) * scale;
    const y = Number(form.years) || 0;

    const r = calcCagr({
      initial: init,
      final: fin,
      years: y,
      taxRate: form.taxRate,
      feeRate: form.feeRate,
      targetCagr: form.targetCagr,
      targetValue: targetAmount,
      inflationRate: form.inflationRate,
    });

    setInitial(init);
    setFinalValue(fin);
    setYears(y);
    setResult(r);
    trackGaEvent("tool_calculate", {
      source_tool: "cagr",
      locale,
      currency: form.currency || currency,
      has_result: true,
      location: "form_submit",
    });
  };

  const hasResult = !!result;
  const netCagr = result?.netCagr || 0;
  const grossCagr = result?.grossCagr || 0;

  const handleShare = async () => {
    const shareTitle =
      locale === "ko" ? "FinMap CAGR 계산 결과" : "FinMap CAGR result";
    const shareDesc =
      locale === "ko"
        ? "세전/세후 CAGR, 연도별 자산 경로까지 한 번에 공유해보세요."
        : "Share CAGR with gross/net breakdown and the yearly path.";
    const shareImage = "/og/cagr-calculator.jpg";

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
        title: locale === "ko" ? "FinMap CAGR 계산 결과" : "CAGR result",
        description:
          locale === "ko"
            ? "초기/최종 금액과 기간으로 연평균 수익률(CAGR)을 계산했어요."
            : "Calculated CAGR from initial/final value and time horizon.",
        url: window.location.href,
      });
      return;
    }

    // 3) Naver share
    if (typeof window !== "undefined") {
      shareNaver({
        title: locale === "ko" ? "FinMap CAGR 계산 결과" : "CAGR result",
        url: window.location.href,
      });
      return;
    }

    // 4) 최후 fallback: URL 복사
    copyUrl(locale === "ko" ? "URL이 복사되었습니다!" : "URL copied!");
  };

  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/cagr-calculator"
        image="https://res.cloudinary.com/dwonflmnn/image/upload/v1766124234/blog/tools/CAGR_MAIN.png"
        locale={locale} // ✅ canonical/hreflang 분기 핵심
      />

      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={appJsonLd} />

      <div className="py-6 grid gap-6 fm-mobile-full fm-safe-bottom">
        {/* 히어로 */}
        <div className="card bg-slate-900 text-white">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold whitespace-pre-line mb-2">
                {t.heroTitle}
              </h1>
              <p className="text-base text-slate-200 mb-3 max-[400px]:text-sm">{t.heroLead}</p>
              <p className="text-xs text-slate-400 uppercase tracking-[0.16em]">
                CAGR · COMPOUND ANNUAL GROWTH RATE
              </p>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2 text-sm max-[400px]:text-xs">
              <div className="stat bg-slate-800/80 border border-slate-700">
                <p className="stat-title text-slate-300">{t.stat1Title}</p>
                <p className="stat-value text-emerald-300">{t.stat1Value}</p>
              </div>
              <div className="stat bg-slate-800/80 border border-slate-700">
                <p className="stat-title text-slate-300">{t.stat2Title}</p>
                <p className="stat-value text-sky-300">{t.stat2Value}</p>
              </div>
              <div className="stat bg-slate-800/80 border border-slate-700">
                <p className="stat-title text-slate-300">{t.stat3Title}</p>
                <p className="stat-value text-amber-300">{t.stat3Value}</p>
              </div>
            </div>
          </div>
        </div>

        <ToolSharePanel toolId="cagr" locale={locale} />

        {/* 설명 */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">{t.introTitle}</h2>
          <p className="text-base text-slate-600 mb-2 max-[400px]:text-sm">{t.introLead}</p>
          <ul className="list-disc pl-5 text-base text-slate-600 space-y-1 max-[400px]:text-sm">
            <li>{t.introBullet1}</li>
            <li>{t.introBullet2}</li>
            <li>{t.introBullet3}</li>
          </ul>
        </div>

        {/* ✅ 키워드/개념 섹션(SEO + 사용자 이해) */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">{t.explainTitle}</h2>
          <p className="text-base text-slate-600 max-[400px]:text-sm">{t.explainBody}</p>
        </div>

        {/* 입력 폼 */}
        <div className="card">
          <CagrForm
            onSubmit={onSubmit}
            locale={locale}
            currency={currency}
            onCurrencyChange={setCurrency}
            initialValues={formInitialValues}
          />
        </div>

        <section className="card min-w-0 max-w-full">
          <div className="mb-4 min-w-0">
            <h2 className="mb-1 break-words text-lg font-semibold leading-snug">{t.toolHubTitle}</h2>
            <p className="break-words text-sm text-slate-600">{t.toolHubLead}</p>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-3 min-[390px]:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                locale={locale}
                onClick={() =>
                  trackToolHubClick({
                    targetTool: tool.targetTool,
                    locale,
                    location: "pre_result_hub",
                  })
                }
                className="block min-w-0 rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:shadow-sm"
              >
                <p className="mb-2 break-words text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {locale === "ko" ? tool.badgeKo : tool.badgeEn}
                </p>
                <h3 className="break-words text-sm font-semibold leading-snug text-slate-900">
                  {locale === "ko" ? tool.anchorKo : tool.anchorEn}
                </h3>
                <p className="mt-2 break-words text-xs leading-relaxed text-slate-600">
                  {locale === "ko" ? tool.descKo : tool.descEn}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* 결과 */}
        {hasResult && (
          <>
            {/* ✅ PDF로 저장할 영역 */}
            <div id="pdf-target" className="grid gap-6">
              <div ref={(el) => (sectionEls.current.sum = el)} className="grid gap-4 sm:grid-cols-4 scroll-mt-24">
                <div className="stat">
                  <div className="stat-title">{t.netCagrLabel}</div>
                  <div className="stat-value">{pctFmt(netCagr)}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">{t.grossCagrLabel}</div>
                  <div className="stat-value">{pctFmt(grossCagr)}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">{t.initialLabel}</div>
                  <div className="stat-value">{summaryFmt(initial)}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">{t.finalLabel}</div>
                  <div className="stat-value">{summaryFmt(finalValue)}</div>
                </div>
              </div>

              <ResultAdSlot
                slot={AD_SLOTS.inArticle1}
                tool="cagr"
                position="summary_after"
                locale={locale}
              />

              <section className="card min-w-0 max-w-full">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">{cagrUx.summaryTitle}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{cagrUx.summaryLead}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    [cagrUx.start, summaryFmt(initial)],
                    [cagrUx.end, summaryFmt(finalValue)],
                    [cagrUx.period, `${Number(years).toLocaleString(numberLocale, { maximumFractionDigits: 2 })}${locale === "ko" ? "년" : "y"}`],
                    [cagrUx.totalReturn, pctPointFmt(result.totalReturnPercent)],
                    [cagrUx.cagr, pctPointFmt(result.netCagrPercent)],
                    [cagrUx.realCagr, result.realCagrPercent == null ? "-" : pctPointFmt(result.realCagrPercent)],
                    [cagrUx.targetEnding, result.targetEndingValue == null ? "-" : summaryFmt(result.targetEndingValue)],
                    [cagrUx.yearsToTarget, result.yearsToTarget == null ? "-" : yearsText(result.yearsToTarget)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {label}
                      </div>
                      <div className="mt-1 break-words text-base font-semibold text-slate-900">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{cagrUx.totalVsCagrTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{cagrUx.totalVsCagrBody}</p>
                </div>

                <details className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                    {cagrUx.sensitivityTitle}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{cagrUx.sensitivityLead}</p>

                  <div className="mt-4 grid gap-4">
                    <div className="overflow-x-auto">
                      <h3 className="mb-2 text-sm font-semibold">{cagrUx.cagrSensitivity}</h3>
                      <table className="w-full min-w-[760px] text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            {[cagrUx.cagr, cagrUx.samePeriodEnd, cagrUx.totalReturn, cagrUx.finalDiff].map((h) => (
                              <th key={h} className="px-2 py-2 text-left font-semibold text-slate-600">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.sensitivity?.cagrScenarios?.map((row) => (
                            <tr key={row.key} className={`border-t ${row.key === "current" ? "bg-blue-50" : ""}`}>
                              <td className="px-2 py-2">
                                {row.key === "current" ? `${cagrUx.current} · ` : ""}
                                {pctPointFmt(row.cagrPercent)}
                              </td>
                              <td className="px-2 py-2 text-right">{row.endingValue == null ? "-" : summaryFmt(row.endingValue)}</td>
                              <td className="px-2 py-2 text-right">{row.totalReturnPercent == null ? "-" : pctPointFmt(row.totalReturnPercent)}</td>
                              <td className="px-2 py-2 text-right">{row.finalDiff == null ? "-" : signedSummaryFmt(row.finalDiff)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="overflow-x-auto">
                      <h3 className="mb-2 text-sm font-semibold">{cagrUx.periodSensitivity}</h3>
                      <table className="w-full min-w-[640px] text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            {[cagrUx.period, cagrUx.requiredCagr, cagrUx.totalReturn].map((h) => (
                              <th key={h} className="px-2 py-2 text-left font-semibold text-slate-600">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.sensitivity?.periodScenarios?.map((row) => (
                            <tr key={`${row.key}-${row.years}`} className={`border-t ${row.key === "current" ? "bg-blue-50" : ""}`}>
                              <td className="px-2 py-2">
                                {row.key === "current" ? `${cagrUx.current} · ` : ""}
                                {Number(row.years).toLocaleString(numberLocale, { maximumFractionDigits: 2 })}
                                {locale === "ko" ? "년" : "y"}
                              </td>
                              <td className="px-2 py-2 text-right">{pctPointFmt(row.cagrPercent)}</td>
                              <td className="px-2 py-2 text-right">{pctPointFmt(row.totalReturnPercent)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{cagrUx.readingTitle}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
                    {cagrUx.readingItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {cagrUx.nominalRealNote}
                  </p>
                </div>
              </section>

              <div className="card border-l-4 border-amber-300 bg-amber-50">
                <h2 className="text-base font-semibold mb-2 text-slate-900">
                  {t.resultCautionTitle}
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {t.resultCautionBody}
                </p>
                <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 min-[390px]:grid-cols-2">
                  <Link
                    href="/tools/dca-calculator"
                    locale={locale}
                    onClick={() =>
                      trackToolHubClick({
                        targetTool: "dca",
                        locale,
                        location: "result_caution",
                      })
                    }
                    className="inline-flex min-h-[44px] min-w-0 items-center justify-center whitespace-normal break-words rounded-lg border border-amber-200 bg-white px-3 py-2 text-center text-xs font-medium leading-tight text-slate-800 hover:border-amber-300"
                  >
                    {locale === "ko"
                      ? "DCA 시뮬레이터로 추가납입 반영하기"
                      : "Model contributions in the DCA simulator"}
                  </Link>
                  <Link
                    href="/tools/goal-simulator"
                    locale={locale}
                    onClick={() =>
                      trackToolHubClick({
                        targetTool: "goal",
                        locale,
                        location: "result_caution",
                      })
                    }
                    className="inline-flex min-h-[44px] min-w-0 items-center justify-center whitespace-normal break-words rounded-lg border border-amber-200 bg-white px-3 py-2 text-center text-xs font-medium leading-tight text-slate-800 hover:border-amber-300"
                  >
                    {locale === "ko"
                      ? "목표 자산 시뮬레이터로 월 투자금 역산하기"
                      : "Reverse-calc monthly investment in the goal simulator"}
                  </Link>
                </div>
              </div>

              <div ref={(el) => (sectionEls.current.chart = el)} className="card scroll-mt-24">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-semibold">{t.chartTitle}</h2>
                  {currency === "KRW" && (
                    <span className="text-xs text-slate-500">
                      {locale.startsWith("ko")
                        ? "단위: 원 / 만원 / 억원 자동"
                        : "Unit: auto (KRW / 10k / 100M)"}
                    </span>
                  )}
                </div>
                <CagrChart result={result} locale={numberLocale} currency={currency} />
              </div>

              <ResultAdSlot
                slot={AD_SLOTS.inArticle2}
                tool="cagr"
                position="chart_after"
                locale={locale}
              />

              <CagrYearTable
                result={result}
                locale={numberLocale}
                currency={currency}
                initial={initial}
              />

              {/* CTA */}
              <div ref={(el) => (sectionEls.current.cta = el)} className="scroll-mt-24">
                <CompoundCTA
                  locale={locale}
                  onDownloadPDF={handleDownloadPDF}
                  shareTitle={locale === "ko" ? "FinMap CAGR 계산 결과" : "FinMap CAGR result"}
                  shareDescription={
                    locale === "ko"
                      ? "세전/세후 CAGR, 연도별 자산 경로까지 한 번에 공유해보세요."
                      : "Share CAGR with gross/net breakdown and the yearly path."
                  }
                />
              </div>
            </div>

            <div className="tool-cta-section grid min-w-0 gap-4">
              <ToolCta lang={locale} type="dca" sourceTool="cagr" location="result_cta" />
              <ToolCta lang={locale} type="fire" sourceTool="cagr" location="result_cta" />
              <ToolCta lang={locale} type="compound" sourceTool="cagr" location="result_cta" />
              <ToolCta lang={locale} type="goal" sourceTool="cagr" location="result_cta" />
            </div>   

            {/* 하단 고정 CTA Bar */}
            {!isExporting && (
              <CTABar
                locale={locale}
                onDownloadPDF={handleDownloadPDF}
                onShare={handleShare}
                mode={"pro"}
                alwaysVisible={true}
                onNavigate={scrollTo}
              />
            )}
          </>
        )}
        <section ref={(el) => (sectionEls.current.insight = el)} className="card w-full scroll-mt-24">
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
        </section>
        {/* ✅ 내부링크: 추천 가이드 글 5개 (SEO + 체류시간 + 내부탐색) */}
        <section className="card min-w-0 max-w-full">
          <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <h2 className="break-words text-base font-semibold leading-snug">
              {locale === "ko" ? "추천 가이드 글" : "Recommended guides"}
            </h2>
            <Link
              href={`/category/personalFinance`}
              locale={locale}
              className="inline-flex min-h-[44px] items-center break-words text-sm text-slate-600 hover:underline"
            >
              {locale === "ko" ? "전체 글 보기" : "View all posts"}
            </Link>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/posts/${g.category}/${g.slug}`}
                locale={locale}
                className="block min-w-0 rounded-2xl border p-4 transition hover:shadow-sm"
              >
                <div className="mb-1 break-words text-xs text-slate-500">
                  {locale === "ko" ? g.tagKo : g.tagEn}
                </div>
                <div className="break-words font-semibold leading-snug">
                  {locale === "ko" ? g.titleKo : g.titleEn}
                </div>
                {/* 2단계에서 길이 조정해도 되지만, 기본은 1줄로 고정 */}
                <div className="mt-1 line-clamp-2 break-words text-sm text-slate-600">
                  {locale === "ko" ? g.descKo : g.descEn}
                </div>
              </Link>
            ))}
          </div>
        </section>
        <ToolCitationBox toolId="cagr" locale={locale} />
      </div>
    </>
  );
}
