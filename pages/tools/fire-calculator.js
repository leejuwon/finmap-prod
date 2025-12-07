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

import AdResponsive from "../../_components/AdResponsive";
import AdInArticle from "../../_components/AdInArticle";

import { runFireSimulation } from "../../lib/fire";
import { getInitialLang } from "../../lib/lang";
import ToolCta from "../../_components/ToolCta";
import FireReport from "../../_components/FireReport";

// JSON-LD 코드 생략…

export default function FireCalculatorPage() {
  const [lang, setLang] = useState("ko");
  const isKo = lang === "ko";

  const locale = isKo ? "ko-KR" : "en-US";
  const currency = isKo ? "KRW" : "USD";

  const [result, setResult] = useState(null);
  const [params, setParams] = useState(null);

  // 언어 처리…

  const t = useMemo(
    () => ({
      title: isKo ? "은퇴자금(FIRE) 시뮬레이터" : "FIRE (Retirement Fund) Calculator",
      desc: isKo
        ? "현재 자산·지출·수익률·출금률·적립 기간으로 FIRE 가능 시점과 은퇴 후 자산 유지 기간을 시뮬레이션합니다."
        : "Simulate FIRE timing and how long your assets last after retirement.",
      chartTitle: isKo ? "은퇴 전·후 자산 곡선" : "Asset curve (before & after FIRE)",
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

      {/* FAQ Schema JSON-LD */}

      <div className="tool-page">
        <div className="tool-header">
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>

        <FireHero lang={lang} />
        <FireIntro lang={lang} />
        <FireForm lang={lang} onSubmit={handleSubmit} />

        {result && (
          <>
            {/* 1) CTR 최상위 위치 — FIRE Summary 아래 */}
            <FireSummary lang={lang} result={result} params={params} />

            <AdInArticle slot="1924002516" />  {/* 🔥 Summary 아래 광고 */}

            {/* 2) Chart Section */}
            <div className="card mb-6">
              <h2 className="text-base md:text-lg font-semibold mb-2">
                {t.chartTitle}
              </h2>

              <FireChart
                data={result.timeline}
                summary={{
                  fireTarget: result.fireTarget,
                  retirementStartReal: result.retirementStartReal,
                  fireYear: result.accumulation.fireYear
                }}
                locale={locale}
                currency={currency}
              />
            </div>

            {/* 2) CTR 강력 추천 — 차트 아래 광고 */}
            <AdResponsive slot="3101352817" />

            {/* Year Table */}
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

            {/* 3) 리포트 위 CTR 높은 광고 */}
            <AdInArticle slot="6085898367" />

            <FireReport lang={lang} result={result} params={params} />
            <FireFaq lang={lang} />

            {/* CTA Section */}
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
