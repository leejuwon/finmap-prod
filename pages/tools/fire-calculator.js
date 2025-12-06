// pages/tools/fire-calculator.js
import { useEffect, useState, useMemo } from "react";
import SeoHead from "../../_components/SeoHead";

import FireHero from "../../_components/FireHero";
import FireIntro from "../../_components/FireIntro";
import FireForm from "../../_components/FireForm";
import FireSummary from "../../_components/FireSummary";
import FireChart from "../../_components/FireChart";
import FireYearTable from "../../_components/FireYearTable";
import FireFaq from "../../_components/FireFaq";

import { runFireSimulation } from "../../lib/fire";
import { getInitialLang } from "../../lib/lang";
import ToolCta from "../../_components/ToolCta";
import FireReport from "../../_components/FireReport";
import FireMonteSummary from "../../_components/FireMonteSummary";
import { runMonteCarlo } from "../../lib/fireMonteCarlo";

// JSON-LD
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function FireCalculatorPage() {
  const [lang, setLang] = useState("ko");
  const isKo = lang === "ko";

  const locale = isKo ? "ko-KR" : "en-US";
  const currency = isKo ? "KRW" : "USD";

  const [result, setResult] = useState(null);
  const [params, setParams] = useState(null);

  // 🔹 언어 동기화
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initial = getInitialLang();
    setLang(initial === "en" ? "en" : "ko");

    const handler = (e) => {
      setLang(e.detail || "ko");
    };
    window.addEventListener("fm_lang_change", handler);
    return () => window.removeEventListener("fm_lang_change", handler);
  }, []);

  // 🔹 텍스트 리소스 (CAGR 구조 동일)
  const t = useMemo(
    () => ({
      title: isKo
        ? "은퇴자금(FIRE) 시뮬레이터"
        : "FIRE (Retirement Fund) Calculator",

      desc: isKo
        ? "현재 자산·지출·수익률·출금률·적립 기간으로 FIRE 가능 시점과 은퇴 후 자산 유지 기간을 시뮬레이션합니다."
        : "Simulate FIRE timing and how long your assets last after retirement based on assets, spending, return, withdrawal rate, and accumulation period.",

      chartTitle: isKo ? "은퇴 전·후 자산 곡선" : "Asset curve (before & after FIRE)",

      summaryTitle: isKo ? "핵심 요약" : "Summary",

      faqTitle: isKo ? "FIRE 계산기 자주 묻는 질문" : "FIRE calculator FAQ",
    }),
    [isKo]
  );

  // 🔹 JSON-LD (FAQ)
  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: isKo
            ? "FIRE 목표 자산은 어떻게 계산하나요?"
            : "How is the FIRE target calculated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isKo
              ? "FIRE 목표 자산은 연 지출 ÷ 출금률로 계산됩니다. 예: 연 3000만원 지출, 출금률 4% → 7.5억원."
              : "FIRE target = Annual spending ÷ Withdrawal rate. Example: 30M KRW spending, 4% rule → 750M KRW.",
          },
        },
        {
          "@type": "Question",
          name: isKo
            ? "세금·수수료·인플레이션은 어떻게 반영되나요?"
            : "How are tax, fees, and inflation applied?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isKo
              ? "입력한 명목 수익률에서 수수료를 빼고, 인플레이션을 반영해 실질 수익률을 계산한 뒤 세금을 적용합니다."
              : "We subtract the fee, adjust for inflation (real return), then apply tax to compute the after-tax real return.",
          },
        },
        {
          "@type": "Question",
          name: isKo
            ? "은퇴 후 자산 고갈 시점은 무엇인가요?"
            : "What does depletion year mean?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isKo
              ? "은퇴 구간에서 매년 지출을 빼고 남은 자산에 수익률을 적용했을 때 0원이 되는 시점을 의미합니다."
              : "It means the year in retirement when your assets reach zero after annual withdrawals and returns.",
          },
        },
      ],
    }),
    [isKo]
  );

  // 🔹 FireForm → onSubmit
  const handleSubmit = (payload) => {
    setParams(payload);
    const r = runFireSimulation(payload);

    // 몬테카를로 확률 계산 추가
    const mc = runMonteCarlo({
      initialParams: {
        ...payload,
        fireTarget: r.fireTarget,
      },
      netRealReturn: r.netRealReturn,
      stdev: 0.12,
      trials: 500,
    });

    setResult({ ...r, mc });
  };

  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/fire-calculator"
        image="https://res.cloudinary.com/dwonflmnn/image/upload/v1765032746/blog/economicInfo/fireCover.jpg"
      />

      <JsonLd data={faqJsonLd} />

      <div className="tool-page">
        <div className="tool-header">
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>

        <FireHero lang={lang} />

        <FireIntro lang={lang} />

        <FireForm lang={lang} onSubmit={handleSubmit} />

        {/* 결과 섹션 */}
        {result && (
          <>
            <FireSummary
              lang={lang}
              result={result}
              params={params}
            />

            <FireMonteSummary lang={lang} mc={result.mc} />

            <div className="card mb-6">
              <h2 className="text-base md:text-lg font-semibold mb-2">
                {t.chartTitle}
              </h2>
              <FireChart
                data={result.timeline}
                locale={locale}
                currency={currency}
              />
            </div>

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

            {/* 🔥 HERE: Add Report */}
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
