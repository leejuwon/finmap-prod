"use client"; // pages router면 영향 없지만 있어도 됨

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import SeoHead from "../../_components/SeoHead";

import FireHero from "../../_components/FireHero";
import FireIntro from "../../_components/FireIntro";
import FireForm from "../../_components/FireForm";

import { runFireSimulation } from "../../lib/fire";
import { getFaqItems } from "../../_components/FireFaq";
import ToolCta from "../../_components/ToolCta";

import AdResponsive from "../../_components/AdResponsive";
import AdInArticle from "../../_components/AdInArticle";

// ✅ Dynamic Imports (차트/무거운 것만)
const FireChart = dynamic(() => import("../../_components/FireChart"), { ssr: false });
const FireSummary = dynamic(() => import("../../_components/FireSummary"), { ssr: false });
const FireYearTable = dynamic(() => import("../../_components/FireYearTable"), { ssr: false });
const FireReport = dynamic(() => import("../../_components/FireReport"), { ssr: false });
const FireFaq = dynamic(() => import("../../_components/FireFaq"), { ssr: false });

function JsonLdPack({ lang }) {
  const isKo = lang === "ko";
  const faq = getFaqItems(lang);

  // ✅ (보강) 언어별 canonical URL과 맞춰주기
  const base = "https://www.finmaphub.com";
  const url = isKo ? `${base}/tools/fire-calculator` : `${base}/en/tools/fire-calculator`;

  const calculator = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    name: isKo
      ? "은퇴자금(FIRE) 시뮬레이터 · 은퇴자금 계산기 · 조기은퇴 계산"
      : "FIRE Retirement Calculator · Early Retirement Estimator",
    description: isKo
      ? "은퇴자금 계산, FIRE 시뮬레이션, 조기은퇴 계산, 출금률 기반 은퇴 가능성을 예측하는 전문 계산기입니다."
      : "A FIRE retirement calculator that simulates asset longevity, withdrawal rates, and early retirement feasibility.",
    url,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "FinMap", item: base },
      {
        "@type": "ListItem",
        position: 2,
        name: isKo ? "금융 도구" : "Tools",
        item: isKo ? `${base}/tools` : `${base}/en/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: isKo ? "은퇴자금(FIRE) 시뮬레이터" : "FIRE Calculator",
        item: url,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculator) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}

export default function FireCalculatorPage({ initialLang = "ko" }) {
  // ✅ 서버/클라 첫 렌더 동일 (하이드레이션 안정)
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    const onLang = (e) => {
      const next = e?.detail;
      if (next === "ko" || next === "en") setLang(next);
    };
    window.addEventListener("fm_lang_change", onLang);

    const onStorage = (e) => {
      if (e.key !== "fm_lang") return;
      if (e.newValue === "ko" || e.newValue === "en") setLang(e.newValue);
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("fm_lang_change", onLang);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const isKo = lang === "ko";
  const locale = isKo ? "ko-KR" : "en-US";
  const currency = isKo ? "KRW" : "USD";

  const [result, setResult] = useState(null);
  const [params, setParams] = useState(null);

  const t = useMemo(
    () => ({
      title: isKo
        ? "은퇴자금(FIRE) 시뮬레이터 | 은퇴자금 계산 · FIRE 계산기 · 조기은퇴 시뮬레이션"
        : "FIRE Calculator | Retirement Simulation",
      desc: isKo
        ? "현재 자산·지출·수익률·출금률을 기반으로 FIRE 가능 시점과 은퇴 후 자산 유지 기간을 계산합니다."
        : "Simulate FIRE timing and post-retirement asset durability.",
      chartTitle: isKo ? "은퇴 전·후 자산 곡선" : "Asset Curve (Before & After FIRE)",
    }),
    [isKo]
  );

  const handleSubmit = (payload) => {
    setParams(payload);
    setResult({ ...runFireSimulation(payload) });
  };

  // ✅ (보강) SeoHead도 언어별 URL 사용
  const pageUrl = isKo ? "/tools/fire-calculator" : "/en/tools/fire-calculator";

  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url={pageUrl}
        image="https://res.cloudinary.com/dwonflmnn/image/upload/v1765032746/blog/economicInfo/fireCover.jpg"
        locale={lang}
      />

      <JsonLdPack lang={lang} />

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
            <FireSummary lang={lang} result={result} />
            <AdInArticle slot="1924002516" />

            <div className="card mb-6">
              <h2 className="text-base md:text-lg font-semibold mb-2">{t.chartTitle}</h2>
              <FireChart data={result.timeline} locale={locale} currency={currency} />
            </div>

            <AdResponsive slot="3101352817" />

            <FireYearTable timeline={result.timeline} locale={locale} currency={currency} />

            <AdInArticle slot="6085898367" />

            <FireReport lang={lang} result={result} params={params} />
            <FireFaq lang={lang} />

            <div className="tool-cta-section">
              <ToolCta lang={lang} type="compound" />
              <ToolCta lang={lang} type="goal" />
              <ToolCta lang={lang} type="cagr" />
              <ToolCta lang={lang} type="dca" />
            </div>
          </>
        )}
      </div>
    </>
  );
}

/** ✅ pages router: 파일 맨 아래에 붙이면 됨 */
export async function getServerSideProps({ req }) {
  const cookie = req?.headers?.cookie || "";
  const m = cookie.match(/(?:^|;\s*)fm_lang=(ko|en)/);
  const initialLang = m?.[1] || "ko";
  return { props: { initialLang } };
}
