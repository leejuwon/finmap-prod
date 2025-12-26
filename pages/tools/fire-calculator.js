"use client"; // pages router면 영향 없지만 있어도 됨

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import SeoHead from "../../_components/SeoHead";
import CTABar from "../../_components/CTABar";

import FireHero from "../../_components/FireHero";
import FireIntro from "../../_components/FireIntro";
import FireForm from "../../_components/FireForm";

import { runFireSimulation } from "../../lib/fire";
import { getFaqItems } from "../../_components/FireFaq";
import ToolCta from "../../_components/ToolCta";

import AdResponsive from "../../_components/AdResponsive";
import AdInArticle from "../../_components/AdInArticle";

// ✅ 추가
import CompoundCTA from "../../_components/CompoundCTA";
import { shareKakao, shareWeb, shareNaver, copyUrl } from "../../utils/share";

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
    url: isKo
      ? "https://www.finmaphub.com/tools/fire-calculator"
      : "https://www.finmaphub.com/en/tools/fire-calculator",
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

export default function FireCalculatorPage() {
  const router = useRouter();
  const lang = router?.locale === "en" ? "en" : "ko";

  const isKo = lang === "ko";
  const locale = isKo ? "ko-KR" : "en-US";
  const currency = isKo ? "KRW" : "USD";

  const [result, setResult] = useState(null);
  const [params, setParams] = useState(null);

  const sectionEls = useRef({});
  
  const scrollTo = (id) => {
    const el = sectionEls.current?.[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  // ✅ (추가) PDF 다운로드 (복리 계산기와 동일 패턴):contentReference[oaicite:8]{index=8}
  const handleDownloadPDF = async () => {
    if (isExporting) return;

    setIsExporting(true);
    document.body.classList.add("fm-exporting");

    const target = document.getElementById("pdf-target");
    const details = target ? Array.from(target.querySelectorAll("details")) : [];
    const prevOpen = details.map((d) => d.open);
    details.forEach((d) => (d.open = true));

    await new Promise((r) => setTimeout(r, 400));

    const { downloadPDF } = await import("../../_components/PDFGenerator");
    await downloadPDF("pdf-target", "fire-result.pdf");

    details.forEach((d, i) => (d.open = prevOpen[i]));
    document.body.classList.remove("fm-exporting");
    setIsExporting(false);
  };

  // ✅ (보강) SeoHead도 언어별 URL 사용
  const pageUrl = "/tools/fire-calculator";

  // ----------------------------
  // ✅ 내부링크(추천 가이드 글)
  // 2단계에서: 네가 제공하는 실제 제목/설명(ko/en)을 여기 배열만 교체하면 됨
  // - ko/en 포스팅이 동일 slug를 공유하고, 상위 폴더만 ko/en로 분리되어 있다는 전제
  // - Next.js locale 유지: <Link locale={locale} />
  // ----------------------------
  const relatedGuides = useMemo(
    () => [
      {
        slug: "simple-vs-compound",
        tagKo: "기초 개념",
        tagEn: "Basics",
        titleKo: "단리 vs 복리: 차이와 공식 한 번에 정리",
        titleEn: "Simple vs Compound: the key difference",
        descKo: "단리·복리의 구조/공식/예시를 빠르게 이해하고, 복리 계산기로 바로 테스트해보세요.",
        descEn: "Understand formulas and real examples, then test results in the compound calculator.",
      },
      {
        slug: "annual-vs-monthly-compound",
        tagKo: "월복리",
        tagEn: "Compounding",
        titleKo: "월복리 vs 연복리: 주기 차이가 결과를 바꾸는 이유",
        titleEn: "Monthly vs Annual Compounding: why it changes",
        descKo: "복리 주기(월/연)에 따라 미래가치(FV)가 어떻게 달라지는지 숫자로 확인합니다.",
        descEn: "See how compounding frequency affects future value (FV) with numbers.",
      },
      {
        slug: "how-much-per-month-for-100m",
        tagKo: "적립식",
        tagEn: "Contributions",
        titleKo: "목표 금액을 위한 월 투자금: 역산으로 계획 세우기",
        titleEn: "Monthly contribution planning: reverse-calc",
        descKo: "목표금액·기간·수익률로 필요한 월 적립금을 역산해 투자 계획을 만듭니다.",
        descEn: "Reverse-calculate monthly contribution from target, years, and expected return.",
      },
      {
        slug: "goal-amount-fast-strategy",
        tagKo: "전략",
        tagEn: "Strategy",
        titleKo: "목표에 더 빨리 도달하는 방법: 원금·수익률·기간의 균형",
        titleEn: "Reach goals faster: balance the levers",
        descKo: "원금/월적립/수익률/기간 중 무엇을 조정해야 목표 도달이 빨라지는지 정리합니다.",
        descEn: "Which lever matters most—principal, contribution, return, or time.",
      },
      {
        slug: "personal-start-5steps",
        tagKo: "입문",
        tagEn: "Getting started",
        titleKo: "사회초년생 재테크 시작 5단계: 예산·비상금·투자 루틴",
        titleEn: "Personal finance start: 5 steps",
        descKo: "예산→비상금→저축→투자 순서로, 장기 복리 효과를 만드는 루틴을 제안합니다.",
        descEn: "A simple routine—budget, emergency fund, saving, investing—built for compounding.",
      },
    ],
    []
  );

  const handleShare = async () => {
    // 1) Web Share API
    if (await shareWeb()) return;

    // 2) Kakao SDK
    if (typeof window !== "undefined" && window?.Kakao) {
       shareKakao({
        title: locale === "ko" ? "FinMap 은퇴자금(FIRE) 시뮬레이션 결과" : "FIRE retirement simulation result",
        description:
          locale === "ko"
            ? "출금률·수익률 기준으로 은퇴 가능 시점과 자산 지속 기간을 계산했어요."
            : "Simulated FIRE timing and asset longevity (withdrawal rate & returns).",
        url: window.location.href,
      });
      return;
    }

    // 3) Naver share
    if (typeof window !== "undefined") {
      shareNaver({
        title: locale === "ko" ? "FinMap 은퇴자금(FIRE) 시뮬레이션 결과" : "FIRE retirement simulation result",
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
            <div id="pdf-target" className="grid gap-6">
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
            </div>

            <FireFaq lang={lang} />

            {/* ✅ (추가) 공유 + PDF 다운로드 CTA */}
            <CompoundCTA 
              locale={lang} 
              onDownloadPDF={handleDownloadPDF} 
              shareTitle={
                locale === "ko" 
                  ? "FinMap 은퇴자금(FIRE) 시뮬레이션 결과"
                  : "FIRE retirement simulation result"
              }
              shareDescription={
                locale === "ko"
                  ? "출금률·수익률 기준으로 은퇴 가능 시점과 자산 지속 기간을 계산했어요."
                  : "Simulated FIRE timing and asset longevity (withdrawal rate & returns)."
              } />

            <div className="tool-cta-section">
              <ToolCta lang={lang} type="compound" />
              <ToolCta lang={lang} type="goal" />
              <ToolCta lang={lang} type="cagr" />
              <ToolCta lang={lang} type="dca" />
            </div> 

            {/* 하단 고정 CTA Bar */}
            {!isExporting && (
              <CTABar
                locale={lang}
                onDownloadPDF={handleDownloadPDF}
                onShare={handleShare}
                mode={"basic"}
                alwaysVisible={true}
                onNavigate={scrollTo}
              />
            )}
          </>
        )}
        {/* ✅ 내부링크: 추천 가이드 글 5개 (SEO + 체류시간 + 내부탐색) */}
        <section className="card">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-base font-semibold">
              {lang === "ko" ? "추천 가이드 글" : "Recommended guides"}
            </h2>
            <Link
              href={lang === "ko" ? `/category/personalFinance`:`/en/category/personalFinance`}
              locale={lang}
              className="text-sm text-slate-600 hover:underline"
            >
              {lang === "ko" ? "전체 글 보기" : "View all posts"}
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/posts/personalFinance/${lang}/${g.slug}`}
                locale={lang}
                className="block border rounded-2xl p-4 hover:shadow-sm transition"
              >
                <div className="text-xs text-slate-500 mb-1">
                  {lang === "ko" ? g.tagKo : g.tagEn}
                </div>
                <div className="font-semibold leading-snug">
                  {lang === "ko" ? g.titleKo : g.titleEn}
                </div>
                {/* 2단계에서 길이 조정해도 되지만, 기본은 1줄로 고정 */}
                <div className="text-sm text-slate-600 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {lang === "ko" ? g.descKo : g.descEn}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
