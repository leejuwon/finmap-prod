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
import FireFaq, { getFaqItems } from "../../_components/FireFaq";
import ToolCta from "../../_components/ToolCta";

import AdResponsive from "../../_components/AdResponsive";
import AdInArticle from "../../_components/AdInArticle";

// ✅ 추가
import CompoundCTA from "../../_components/CompoundCTA";
import { shareKakao, shareWeb, shareNaver, copyUrl } from "../../utils/share";
import {
  buildToolPresetQuery,
  getToolPresetFromQuery,
  readToolRecent,
  replaceUrlQuery,
  writeToolRecent,
} from "../../utils/toolPreset";
import { trackGaEvent } from "../../utils/analytics";

// ✅ Dynamic Imports (차트/무거운 것만)
const FireChart = dynamic(() => import("../../_components/FireChart"), { ssr: false });
const FireSummary = dynamic(() => import("../../_components/FireSummary"), { ssr: false });
const FireYearTable = dynamic(() => import("../../_components/FireYearTable"), { ssr: false });
const FireReport = dynamic(() => import("../../_components/FireReport"), { ssr: false });

const FIRE_PRESET_FIELDS = [
  { query: "currentAsset", state: "currentAsset", type: "number" },
  { query: "annualSpending", state: "annualSpending", type: "number" },
  { query: "monthlyContribution", state: "monthlyContribution", type: "number" },
  { query: "annualContribution", state: "annualContribution", type: "number" },
  { query: "annualReturnPct", state: "annualReturnPct", type: "number" },
  { query: "accumulationYears", state: "accumulationYears", type: "number" },
  { query: "withdrawRatePct", state: "withdrawRatePct", type: "number" },
  { query: "taxRatePct", state: "taxRatePct", type: "number" },
  { query: "feeRatePct", state: "feeRatePct", type: "number" },
  { query: "inflationPct", state: "inflationPct", type: "number" },
];

function fireScale(lang) {
  return lang === "ko" ? 10_000 : 1;
}

function firePresetToPayload(preset, lang) {
  const scale = fireScale(lang);
  return {
    currentAsset: (Number(preset.currentAsset) || 0) * scale,
    annualSpending: (Number(preset.annualSpending) || 0) * scale,
    monthlyContribution: (Number(preset.monthlyContribution) || 0) * scale,
    annualContribution: (Number(preset.annualContribution) || 0) * scale,
    annualReturnPct: Number(preset.annualReturnPct) || 0,
    accumulationYears: Number(preset.accumulationYears) || 0,
    withdrawRatePct: Number(preset.withdrawRatePct) || 0,
    taxRatePct: Number(preset.taxRatePct) || 0,
    feeRatePct: Number(preset.feeRatePct) || 0,
    inflationPct: Number(preset.inflationPct) || 0,
  };
}

function firePayloadToPreset(payload, lang) {
  const scale = fireScale(lang);
  return {
    currentAsset: (Number(payload.currentAsset) || 0) / scale,
    annualSpending: (Number(payload.annualSpending) || 0) / scale,
    monthlyContribution: (Number(payload.monthlyContribution) || 0) / scale,
    annualContribution: (Number(payload.annualContribution) || 0) / scale,
    annualReturnPct: Number(payload.annualReturnPct) || 0,
    accumulationYears: Number(payload.accumulationYears) || 0,
    withdrawRatePct: Number(payload.withdrawRatePct) || 0,
    taxRatePct: Number(payload.taxRatePct) || 0,
    feeRatePct: Number(payload.feeRatePct) || 0,
    inflationPct: Number(payload.inflationPct) || 0,
  };
}

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

const ASSUMPTION_BASE_DATE = "2026-04-30";

function AssumptionNotice({ lang }) {
  const isKo = lang === "ko";

  return (
    <section className="card mb-6 bg-slate-50 border border-slate-200">
      <p className="text-sm font-semibold text-slate-900">
        {isKo
          ? `계산 가정 기준일: ${ASSUMPTION_BASE_DATE}`
          : `Assumption base date: ${ASSUMPTION_BASE_DATE}`}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        {isKo
          ? "이 시뮬레이션은 사용자가 입력한 현재 자산, 저축액, 수익률, 세금, 수수료, 인플레이션, 출금률을 단순화해 계산합니다. 결과는 투자 조언이나 은퇴 가능성 보장이 아니라 가정 변화에 따른 참고용 추정치입니다."
          : "This simulation uses your inputs for assets, savings, returns, tax, fees, inflation, and withdrawal rate in a simplified model. Results are estimates for planning, not investment advice or a guarantee of retirement readiness."}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        {isKo
          ? "미반영 항목: 국민연금·퇴직연금·IRP 등 연금 현금흐름, 세법 변경, 건강보험료, 의료·부양비, 은퇴 후 지출 증가율."
          : "Not modeled: pension cash flows, tax-law changes, healthcare costs, medical/family support expenses, and post-retirement spending growth."}
      </p>
    </section>
  );
}

export default function FireCalculatorPage() {
  const router = useRouter();
  const lang = router?.locale === "en" ? "en" : "ko";

  const isKo = lang === "ko";
  const locale = isKo ? "ko-KR" : "en-US";
  const currency = isKo ? "KRW" : "USD";

  const [isExporting, setIsExporting] = useState(false);

  const [result, setResult] = useState(null);
  const [params, setParams] = useState(null);
  const [formInitial, setFormInitial] = useState(null);

  const sectionEls = useRef({});
  const didRestorePreset = useRef(false);
  
  const scrollTo = (id) => {
    const el = sectionEls.current?.[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const recentKey = `fm_tool_recent_fire_${lang}`;

  useEffect(() => {
    if (!router.isReady || didRestorePreset.current) return;
    didRestorePreset.current = true;

    const queryPreset = getToolPresetFromQuery(router.query, FIRE_PRESET_FIELDS);
    const preset = queryPreset || readToolRecent(recentKey, FIRE_PRESET_FIELDS);
    if (!preset) return;

    setFormInitial(firePresetToPayload(preset, lang));
  }, [router.isReady, router.query, recentKey, lang]);

  const persistPreset = (payload) => {
    const preset = firePayloadToPreset(payload, lang);
    writeToolRecent(recentKey, preset);
    replaceUrlQuery(buildToolPresetQuery(preset, FIRE_PRESET_FIELDS));
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
    persistPreset(payload);
    setParams(payload);
    setResult({ ...runFireSimulation(payload) });
    trackGaEvent("tool_calculate", {
      source_tool: "fire",
      locale: lang,
      currency,
      has_result: true,
      location: "form_submit",
    });
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
        slug: "fire-3-numbers-spending-horizon-withdrawal",
        tagKo: "은퇴자산",
        tagEn: "retirement planning",
        titleKo: "은퇴자산 목표는 ‘3개 숫자’로 결정된다: 연지출·은퇴기간·인출률(4%룰 오해까지) + FIRE 툴로 10분 계산",
        titleEn: "FIRE Is Just 3 Numbers: Annual Spending, Retirement Horizon, and Withdrawal Rate (Then Validate in 10 Minutes)",
        descKo: "은퇴 준비는 전망이 아니라 숫자 3개(연지출·은퇴기간·인출률)로 결정된다. 한국 거주 직장인/자영업자 관점에서 주거비(전/월세·대출이자), 건강보험료, 자녀/부양, 국민연금·퇴직연금·IRP까지 반영해 FIRE 목표자산을 10분 안에 계산하는 프레임을 정리한다.",
        descEn: "FIRE planning becomes simple when you lock in three numbers: annual spending, retirement horizon, and withdrawal rate. This guide gives a rules-based framework (not stock picks) and shows how to validate your target with the FinMap FIRE calculator using 401(k)/IRA/Social Security and inflation-adjusted spending—plus sequence-of-returns guardrails.",
      },
      {
        slug: "fire-sequence-risk-first-5-years",
        tagKo: "현금흐름",
        tagEn: "cashflow planning",
        titleKo: "은퇴 직전·직후 5년이 FIRE를 결정한다: ‘순서 리스크’(초반 급락)와 인출 전략을 한국 사용자 기준으로 정리 + 툴로 스트레스 테스트",
        titleEn: "The First 5 Years of Retirement Decide FIRE: Sequence-of-Returns Risk, Withdrawal Rules, and a 10-Minute Stress Test",
        descKo: "FIRE의 성패는 ‘연평균 수익률’이 아니라 은퇴 직전·직후 5년에 걸리는 순서 리스크(초반 급락)와 인출 규칙에 달려 있습니다. 대출 잔액·변동금리·부양비·건보료 변수를 한국 사용자 기준으로 점검하고, 국민연금·퇴직연금을 현금흐름 보완으로만 반영해 FIRE 계산기(/tools/fire-calculator)로 스트레스 테스트하는 실행 프레임을 제공합니다.",
        descEn: "Why the first five years around retirement are the most fragile: sequence-of-returns risk, inflation-adjusted withdrawals, guardrails, and a practical stress-test workflow using the FinMap FIRE calculator.",
      },
      {
        slug: "fire-assumption-errors-7-fixes",
        tagKo: "가정오류",
        tagEn: "cash flow modeling",
        titleKo: "FIRE 계산이 틀리는 가장 흔한 이유 7가지: 수익률·인플레·세금·현금흐름 가정을 현실로 내리는 법 + 툴로 민감도 체크",
        titleEn: "The 7 Most Common FIRE Modeling Mistakes: Fix Your Return, Inflation, and Tax Assumptions (Then Run Sensitivity Checks)",
        descKo: "FIRE 목표가 계속 바뀌는 이유는 ‘계산기’가 아니라 ‘가정’이 흔들리기 때문입니다. 수익률·인플레·세금·연금·현금흐름·변동성·리스크비용까지 7가지 오류 패턴을 현실 값으로 교정하고, FIRE 계산기로 민감도(수익률/인플레/저축액)를 10분 안에 점검하는 방법을 정리합니다.",
        descEn: "FIRE models usually don’t fail because the calculator is wrong—they fail because the assumptions are too optimistic. This guide shows the 7 most common modeling mistakes (returns, inflation, taxes, cash flows, and more), how to downshift inputs to reality, and how to run a 10-minute sensitivity check with the FIRE calculator.",
      },
      {
        slug: "fire-spending-buckets-essential-choice-insurance",
        tagKo: "리스크관리",
        tagEn: "risk management",
        titleKo: "은퇴 지출은 ‘필수·선택·보험(리스크 비용)’으로 나눠야 흔들리지 않는다: 생활비 설계 + FIRE 시뮬레이터로 안전마진 잡기",
        titleEn: "Retirement spending should be split into Essential / Lifestyle / Insurance (risk costs): build buffers and validate with the FIRE calculator",
        descKo: "은퇴 지출을 ‘필수·선택·보험(리스크 비용)’ 3버킷으로 나누면, 체감 물가와 돌발비용까지 반영한 ‘안전마진’이 생깁니다. 생활비 설계 규칙과 실패 신호를 표로 정리하고, FIRE 계산기로 10분 스트레스 테스트까지 연결합니다.",
        descEn: "A stable retirement plan isn’t built from one spending number. Split spending into Essential, Lifestyle, and Insurance (risk costs), attach control levers and failure signals, and stress-test your buffers with the FIRE calculator.",
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

      <div className={`tool-page ${result ? "fm-safe-bottom" : ""}`}>
        <div className="tool-header">
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>

        <FireHero lang={lang} />
        <FireIntro lang={lang} />
        <AssumptionNotice lang={lang} />
        <FireForm lang={lang} onSubmit={handleSubmit} initial={formInitial} />

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

            <div className="tool-cta-section grid min-w-0 gap-4">
              <ToolCta lang={lang} type="compound" sourceTool="fire" location="result_cta" />
              <ToolCta lang={lang} type="goal" sourceTool="fire" location="result_cta" />
              <ToolCta lang={lang} type="cagr" sourceTool="fire" location="result_cta" />
              <ToolCta lang={lang} type="dca" sourceTool="fire" location="result_cta" />
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
        <section className="card min-w-0 max-w-full">
          <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <h2 className="break-words text-base font-semibold leading-snug">
              {lang === "ko" ? "추천 가이드 글" : "Recommended guides"}
            </h2>
            <Link              
              href={`/category/personalFinance`}
              locale={lang}
              className="inline-flex min-h-[44px] items-center break-words text-sm text-slate-600 hover:underline"
            >
              {lang === "ko" ? "전체 글 보기" : "View all posts"}
            </Link>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/posts/personalFinance/${g.slug}`}
                locale={lang}
                className="block min-w-0 rounded-2xl border p-4 transition hover:shadow-sm"
              >
                <div className="mb-1 break-words text-xs text-slate-500">
                  {lang === "ko" ? g.tagKo : g.tagEn}
                </div>
                <div className="break-words font-semibold leading-snug">
                  {lang === "ko" ? g.titleKo : g.titleEn}
                </div>
                {/* 2단계에서 길이 조정해도 되지만, 기본은 1줄로 고정 */}
                <div className="mt-1 line-clamp-2 break-words text-sm text-slate-600">
                  {lang === "ko" ? g.descKo : g.descEn}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <FireFaq lang={lang} />
      </div>
    </>
  );
}
