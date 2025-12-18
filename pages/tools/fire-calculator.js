// pages/tools/fire-calculator.js
import { useEffect, useState, useMemo } from "react";
import SeoHead from "../../_components/SeoHead";

import FireHero from "../../_components/FireHero";
import FireIntro from "../../_components/FireIntro";
import FireForm from "../../_components/FireForm";
import FireSummary from "../../_components/FireSummary";
import FireChart from "../../_components/FireChart";
import FireYearTable from "../../_components/FireYearTable";
import FireFaq, { getFaqItems } from "../../_components/FireFaq";
import FireReport from "../../_components/FireReport";

import AdResponsive from "../../_components/AdResponsive";
import AdInArticle from "../../_components/AdInArticle";

import { runFireSimulation } from "../../lib/fire";
import { getInitialLang } from "../../lib/lang";
import ToolCta from "../../_components/ToolCta";

// ---------------------------------------------------------
// 🔥 JSON-LD: Calculator Schema + Breadcrumb + FAQ + HowTo
// ---------------------------------------------------------

function JsonLdPack({ lang }) {
  const isKo = lang === "ko";
  const faq = getFaqItems(lang);

  // -----------------------------------------
  // 1) FinancialCalculator Schema
  // -----------------------------------------
  const calculator = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    name: isKo
      ? "은퇴자금(FIRE) 시뮬레이터 · 은퇴자금 계산기 · 조기은퇴 계산"
      : "FIRE Retirement Calculator · Early Retirement Estimator",
    description: isKo
      ? "은퇴자금 계산, FIRE 시뮬레이션, 조기은퇴 계산, 출금률 기반 은퇴 가능성을 예측하는 전문 계산기입니다."
      : "A FIRE retirement calculator that simulates asset longevity, withdrawal rates, and early retirement feasibility.",
    applicationCategory: "FinanceApplication",
    url: "https://www.finmaphub.com/tools/fire-calculator",
    operatingSystem: "All",
  };

  // -----------------------------------------
  // 2) FAQPage Schema
  // -----------------------------------------
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  // -----------------------------------------
  // 3) HowTo Schema → "은퇴자금 계산 방법" 노출 강화
  // -----------------------------------------
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: isKo ? "은퇴자금 계산 방법 (FIRE 계산 방법)" : "How to calculate retirement money (FIRE method)",
    description: isKo
      ? "출금률·지출·수익률·인플레이션을 기반으로 은퇴자금을 계산하는 단계별 가이드."
      : "Step-by-step guide for calculating FIRE retirement needs.",
    step: [
      {
        "@type": "HowToStep",
        name: isKo ? "1단계: 연 지출 입력" : "Step 1: Enter annual spending",
        text: isKo
          ? "은퇴 후 예상되는 연 지출을 입력합니다."
          : "Enter expected annual spending after retirement.",
      },
      {
        "@type": "HowToStep",
        name: isKo ? "2단계: 수익률/인플레이션 입력" : "Step 2: Enter return & inflation",
        text: isKo
          ? "명목 연 수익률, 수수료, 세금, 인플레이션을 입력합니다."
          : "Enter nominal return, fees, taxes, and inflation.",
      },
      {
        "@type": "HowToStep",
        name: isKo ? "3단계: 출금률 선택" : "Step 3: Choose a withdrawal rate",
        text: isKo
          ? "4% rule 등을 기준으로 적절한 출금률을 입력합니다."
          : "Choose an appropriate withdrawal rate, e.g., 4% rule.",
      },
      {
        "@type": "HowToStep",
        name: isKo ? "4단계: 계산 실행" : "Step 4: Run simulation",
        text: isKo
          ? "조회 버튼을 눌러 적립 기간, FIRE 달성 시점, 은퇴 후 자산 지속 기간을 확인합니다."
          : "Run the simulation to see FIRE timing and asset longevity.",
      },
    ],
  };

  // -----------------------------------------
  // 4) Breadcrumb
  // -----------------------------------------
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "FinMap",
        item: "https://www.finmaphub.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isKo ? "금융 도구" : "Finance Tools",
        item: "https://www.finmaphub.com/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: isKo
          ? "은퇴자금(FIRE) 시뮬레이터"
          : "FIRE (Retirement) Calculator",
        item: "https://www.finmaphub.com/tools/fire-calculator",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculator) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}

// ---------------------------------------------------------
// 🔥 본문
// ---------------------------------------------------------

export default function FireCalculatorPage() {
  const [lang, setLang] = useState("ko");
  const isKo = lang === "ko";

  const locale = isKo ? "ko-KR" : "en-US";
  const currency = isKo ? "KRW" : "USD";

  const [result, setResult] = useState(null);
  const [params, setParams] = useState(null);

  const t = useMemo(
    () => ({
      title: isKo
        ? "은퇴자금(FIRE) 시뮬레이터 | 은퇴자금 계산 · FIRE 계산기 · 조기은퇴 시뮬레이션"
        : "FIRE Calculator | Retirement Fund Calculator & Early Retirement Simulation",
      desc: isKo
        ? "은퇴자금 계산, FIRE 시뮬레이터, 조기은퇴 계산기. 현재 자산·지출·수익률·출금률을 기반으로 FIRE 시점과 은퇴 후 자산 유지 기간을 시뮬레이션합니다."
        : "FIRE retirement calculator that simulates retirement timing, asset longevity, withdrawal rates, and more.",
      chartTitle: isKo ? "은퇴 전·후 자산 곡선" : "Asset Curve (Before & After Retirement)",
    }),
    [isKo]
  );

  const handleSubmit = (payload) => {
    setParams(payload);
    const r = runFireSimulation(payload);
    setResult({ ...r });
  };

  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/fire-calculator"
        image="https://res.cloudinary.com/dwonflmnn/image/upload/v1765032746/blog/economicInfo/fireCover.jpg"
      />

      {/* 🔥 강화된 JSON-LD 패키지 */}
      <JsonLdPack lang={lang} />

      <div className="tool-page">
        <div className="tool-header">
          <h1>
            {isKo
              ? "은퇴자금(FIRE) 시뮬레이터 — 은퇴자금 계산 · FIRE 계산기 · 조기은퇴 시뮬레이션"
              : "FIRE Calculator — Retirement Calculator · FIRE Simulation · Early Retirement Model"}
          </h1>
          <p>{t.desc}</p>
        </div>

        <FireHero lang={lang} />
        <FireIntro lang={lang} />
        <FireForm lang={lang} onSubmit={handleSubmit} />

        {result && (
          <>
            <FireSummary lang={lang} result={result} params={params} />

            <AdInArticle slot="1924002516" />

            <div className="card mb-6">
              <h2 className="text-base md:text-lg font-semibold mb-2">
                {t.chartTitle}
              </h2>

              <FireChart
                data={result.timeline}
                summary={{
                  fireTarget: result.fireTarget,
                  retirementStartReal: result.retirementStartReal,
                  fireYear: result.accumulation.fireYear,
                }}
                locale={locale}
                currency={currency}
              />
            </div>

            <AdResponsive slot="3101352817" />

            <FireYearTable
              timeline={result.timeline}
              meta={{
                monthlyContribution: params.monthlyContribution,
                annualContribution: params.annualContribution,
                taxRatePct: params.taxRatePct,
                feeRatePct: params.feeRatePct,
                inflationPct: params.inflationPct,
                netRealReturn: result.netRealReturn,
              }}
              locale={locale}
              currency={currency}
            />

            <AdInArticle slot="6085898367" />

            <FireReport lang={lang} result={result} params={params} />
            <FireFaq lang={lang} />

            <div className="tool-cta-section">
              <ToolCta lang={lang} type="compound" />
              <ToolCta lang={lang} type="goal" />
              <ToolCta lang={lang} type="cagr" />
            </div>
          </>
        )}
      </div>
    </>
  );
}
