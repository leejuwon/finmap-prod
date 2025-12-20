// pages/tools/compound-interest.js
import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SeoHead from "../../_components/SeoHead";
import CTABar from "../../_components/CTABar";
import CompoundForm from "../../_components/CompoundForm";
import CompoundChart from "../../_components/CompoundChart";
import CompoundYearTable from "../../_components/CompoundYearTable";
import CompoundCTA from "../../_components/CompoundCTA";
import DragBreakdownChart from "../../_components/DragBreakdownChart";
import GoalEngineCard from "../../_components/GoalEngineCard";
import SensitivityPanel from "../../_components/SensitivityPanel";
import ValueDisplay, { formatMoneyShort } from "../../_components/ValueDisplay";
import ScenarioPanel from "../../_components/ScenarioPanel";
import TimelineComparePanel from "../../_components/TimelineComparePanel";
import CashFlowLayerChart from "../../_components/CashFlowLayerChart";
import ToolCta from "../../_components/ToolCta";
import { shareKakao, shareWeb, shareNaver, copyUrl } from "../../utils/share";

import {
  calcCompound,
  calcCompoundNoTaxFee,
  calcSimpleLump,
} from "../../lib/compound";

// FAQ JSON-LD 출력
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function CompoundPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    document.body.classList.add("fm-exporting");

    const target = document.getElementById("pdf-target");
    const details = target ? Array.from(target.querySelectorAll("details")) : [];
    const prevOpen = details.map((d) => d.open);
    details.forEach((d) => (d.open = true));

    await new Promise((r) => setTimeout(r, 400));

    const { downloadPDF } = await import("../../_components/PDFGenerator");
    await downloadPDF("pdf-target", "compound-result.pdf");

    details.forEach((d, i) => (d.open = prevOpen[i]));
    document.body.classList.remove("fm-exporting");
    setIsExporting(false);
  };

  // ----------------------------
  // 언어 상태
  // ----------------------------
  const router = useRouter();
  const lang = router.locale === "en" ? "en" : "ko";
  const locale = lang; // "ko" | "en"
  const numberLocale = lang === "ko" ? "ko-KR" : "en-US";

  // ----------------------------
  // 통화 단위 선택
  // ----------------------------
  const [currency, setCurrency] = useState("KRW");

  // ----------------------------
  // PRO 모드 (반응형 UX flow)
  // ----------------------------
  const [uiMode, setUiMode] = useState("basic"); // "basic" | "pro"
  const [isMobile, setIsMobile] = useState(false);

  const sectionEls = useRef({});

  const scrollTo = (id) => {
    const el = sectionEls.current?.[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobile = window.matchMedia("(max-width: 640px)").matches;
    setIsMobile(mobile);

    const saved = window.localStorage.getItem("fm_ui_mode_compound");
    if (saved === "basic" || saved === "pro") setUiMode(saved);
    else setUiMode(mobile ? "pro" : "basic");

    const onResize = () => {
      setIsMobile(window.matchMedia("(max-width: 640px)").matches);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const setMode = (next) => {
    setUiMode(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("fm_ui_mode_compound", next);
    }
  };

  const isProMobile = uiMode === "pro" && isMobile;

  // ----------------------------
  // 계산 결과 상태
  // ----------------------------
  const [result, setResult] = useState(null);
  const [idealResult, setIdealResult] = useState(null);
  const [simpleResult, setSimpleResult] = useState(null);

  const [taxRatePercentState, setTaxRatePercentState] = useState(15.4);
  const [feeRatePercentState, setFeeRatePercentState] = useState(0.5);

  const [invest, setInvest] = useState({
    principal: 0,
    monthly: 0,
    years: 0,
    annualRate: 0,
    compounding: "monthly",
  });

  const [simpleInvest, setSimpleInvest] = useState({
    principal: 0,
    years: 0,
  });

  useEffect(() => {
    if (!router.isReady) return;
    setCurrency(router.locale === "en" ? "USD" : "KRW");
  }, [router.isReady, router.locale]);

  // ----------------------------
  // ✅ SEO 텍스트(Title/Desc) 강화
  // ----------------------------
  const t = useMemo(
    () => ({
      title:
        locale === "ko"
          ? "복리 이자 계산기 (월복리/연복리) · 적립식 투자 · 세금·수수료 반영"
          : "Compound Interest Calculator (Monthly/Annual) · Contributions · Tax/Fee",
      desc:
        locale === "ko"
          ? "초기 투자금, 월 적립금, 수익률, 기간을 입력하면 복리 미래가치(FV)를 계산합니다. 월복리/연복리 비교, 세전·세후(세금·수수료) 영향, 연도별 표/차트까지 한 번에 확인하세요."
          : "Calculate future value (FV) from principal, monthly contribution, return, and time horizon. Compare monthly vs annual compounding, ideal vs net (tax/fee), and view charts & yearly tables.",

      fv: locale === "ko" ? "세후 총자산" : "Net Future Value",
      fvIdeal: locale === "ko" ? "세전 기준 미래가치" : "Ideal (No Tax/Fee)",
      drag: locale === "ko" ? "세금·수수료 영향" : "Tax/Fee Drag",
      ratio: locale === "ko" ? "세후/세전 비율" : "Net / Ideal Ratio",
      contrib: locale === "ko" ? "총 납입액" : "Total Contribution",
      interest: locale === "ko" ? "세후 이자" : "Net Interest",

      chartTitle: locale === "ko" ? "자산 성장 차트" : "Growth Chart",
      yearlyCompoundKo: "연간 요약 테이블 (월 적립 복리식)",
      yearlyCompoundEn: "Yearly Summary (Compound / Monthly)",
      yearlySimpleKo: "연간 요약 테이블 (단리식 일시불)",
      yearlySimpleEn: "Yearly Summary (Simple / Lump-sum)",

      compareTitle: locale === "ko" ? "복리식 vs 단리식 비교" : "Compound vs Simple",
      planCompound: locale === "ko" ? "복리식(월 적립)" : "Compound (Monthly)",
      planSimple: locale === "ko" ? "단리식(일시불)" : "Simple (Lump-sum)",

      faqTitle: locale === "ko" ? "복리 계산기 FAQ" : "FAQ",
    }),
    [locale]
  );

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

  function safe(obj, key) {
    return (obj && Number(obj[key])) || 0;
  }

  const summary = useMemo(() => {
    const fvNet = safe(result, "futureValueNet");
    const fvIdeal = safe(idealResult, "futureValueNet");
    const totalContrib = safe(result, "totalContribution");
    const totalInterestNet = safe(result, "totalInterestNet");

    const drag = fvIdeal - fvNet;
    const ratio = fvIdeal > 0 ? (fvNet / fvIdeal) * 100 : 100;

    return { fvNet, fvIdeal, drag, ratio, totalContrib, totalInterestNet };
  }, [result, idealResult]);

  // ----------------------------
  // ✅ FAQ 키워드 보강(검색 의도: 월복리/적립식/복리이자/미래가치)
  // ----------------------------
  const faqItems = useMemo(
    () =>
      locale === "ko"
        ? [
            {
              q: "복리 이자 계산기는 무엇을 계산하나요?",
              a: "초기 투자금(원금)과 월 적립금(적립식 투자), 연 수익률, 기간을 입력하면 복리 방식으로 미래가치(FV)를 계산합니다. 월복리/연복리 같은 복리 주기 차이도 비교할 수 있습니다.",
            },
            {
              q: "월복리 계산기와 연복리 계산기 결과가 왜 다른가요?",
              a: "같은 연 수익률이라도 이자가 더 자주 재투자(복리 적용)되면 최종 미래가치가 커집니다. 그래서 일반적으로 월복리가 연복리보다 미래가치가 높게 나옵니다.",
            },
            {
              q: "세전/세후 계산 차이는 무엇인가요?",
              a: "세전 계산은 세금과 수수료가 없다고 가정한 이상적인 미래가치이며, 세후 계산은 실제 투자에서 발생하는 세금·수수료를 반영한 현실적인 미래가치입니다.",
            },
            {
              q: "계산 금액 단위는 어떻게 되나요?",
              a: "KRW를 선택하면 만원 단위로 입력하며, USD는 실제 달러 금액으로 입력합니다.",
            },
            {
              q: "세금과 수수료는 어떻게 반영되나요?",
              a: "기본값으로 이자 소득세 15.4%, 연간 수수료 0.5%를 반영합니다. 투자 상품/계좌 유형에 따라 다를 수 있어 사용자가 수정할 수 있습니다.",
            },
          ]
        : [
            {
              q: "What does this compound interest calculator do?",
              a: "It calculates future value (FV) using principal, monthly contributions (DCA-like deposits), annual return, and time horizon. You can also compare monthly vs annual compounding.",
            },
            {
              q: "Why do monthly and annual compounding differ?",
              a: "More frequent compounding reinvests returns sooner, which typically results in a higher future value than annual compounding with the same annual rate.",
            },
            {
              q: "What is the difference between net and ideal results?",
              a: "Ideal results ignore taxes and fees, while net results reflect performance after tax and fee deductions.",
            },
            {
              q: "How should I input amounts?",
              a: "KRW inputs use 10,000 KRW units, while USD uses real dollar values.",
            },
            {
              q: "How are taxes and fees applied?",
              a: "Defaults include 15.4% tax on interest and 0.5% annual fee, and you can customize them.",
            },
          ],
    [locale]
  );

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

  const howtoJsonLd = useMemo(() => {
    const isKo = locale === "ko";
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: isKo ? "복리 이자 계산 방법" : "How to calculate compound interest",
      step: isKo
        ? [
            { "@type": "HowToStep", name: "원금 입력", text: "초기 투자금(원금)을 입력합니다." },
            { "@type": "HowToStep", name: "월 적립금 입력", text: "매월 추가 투자/저축 금액을 입력합니다." },
            { "@type": "HowToStep", name: "수익률·기간 설정", text: "연 수익률과 투자 기간(년)을 설정합니다." },
            { "@type": "HowToStep", name: "복리 주기 선택", text: "월복리/연복리 등 복리 주기를 선택합니다." },
            { "@type": "HowToStep", name: "세금·수수료 반영", text: "세금/수수료를 입력해 세후 미래가치를 확인합니다." },
          ]
        : [
            { "@type": "HowToStep", name: "Enter principal", text: "Input your initial investment (principal)." },
            { "@type": "HowToStep", name: "Enter monthly contribution", text: "Add a fixed monthly contribution amount." },
            { "@type": "HowToStep", name: "Set return and years", text: "Set annual return and time horizon." },
            { "@type": "HowToStep", name: "Choose compounding", text: "Select monthly or annual compounding." },
            { "@type": "HowToStep", name: "Apply tax and fees", text: "Adjust tax/fee settings to see net FV." },
          ],
    };
  }, [locale]);

  const breadcrumbJsonLd = useMemo(() => {
    const site = "https://www.finmaphub.com";
    const prefix = locale === "en" ? "/en" : "";
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: locale === "ko" ? "홈" : "Home", item: `${site}${prefix}/` },
        { "@type": "ListItem", position: 2, name: locale === "ko" ? "금융 계산기" : "Tools", item: `${site}${prefix}/tools` },
        { "@type": "ListItem", position: 3, name: locale === "ko" ? "복리 계산기" : "Compound Interest", item: `${site}${prefix}/tools/compound-interest` },
      ],
    };
  }, [locale]);

  // ----------------------------
  // ✅ Breadcrumb + App schema (구글에 “도구 페이지”로 더 명확히 알림)
  // ----------------------------
  const extraJsonLd = useMemo(() => {
    const site = "https://www.finmaphub.com";
    const prefix = locale === "en" ? "/en" : "";
    const url = `${site}${prefix}/tools/compound-interest`;

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "ko" ? "홈" : "Home",
          item: `${site}${prefix}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: locale === "ko" ? "금융 계산기" : "Tools",
          item: `${site}${prefix}/tools`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: locale === "ko" ? "복리 계산기" : "Compound Interest",
          item: url,
        },
      ],
    };

    const app = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name:
        locale === "ko"
          ? "FinMap 복리 이자 계산기"
          : "FinMap Compound Interest Calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    };

    return [breadcrumb, app];
  }, [locale]);

  // ----------------------------
  // 계산 처리
  // ----------------------------
  const onSubmit = (form) => {
    const scale = currency === "KRW" ? 10_000 : 1;

    const p = (Number(form.principal) || 0) * scale;
    const m = (Number(form.monthly) || 0) * scale;
    const r = Number(form.annualRate) || 0;
    const y = Number(form.years) || 0;

    const taxRatePercent = Number(form.taxRatePercent ?? 15.4);
    const feeRatePercent = Number(form.feeRatePercent ?? 0.5);

    const baseYear = new Date().getFullYear();

    const compound = calcCompound({
      principal: p,
      monthly: m,
      years: y,
      annualRate: r,
      compounding: form.compounding,
      taxRatePercent,
      feeRatePercent,
      baseYear,
    });

    const ideal = calcCompoundNoTaxFee({
      principal: p,
      monthly: m,
      years: y,
      annualRate: r,
      compounding: form.compounding,
      baseYear,
    });

    const totalInvested = p + m * 12 * y;

    const simple = calcSimpleLump({
      principal: totalInvested,
      annualRate: r,
      years: y,
      taxRatePercent,
      feeRatePercent,
      baseYear,
    });

    setInvest({
      principal: p,
      monthly: m,
      years: y,
      annualRate: r,
      compounding: form.compounding,
    });
    setResult(compound);
    setIdealResult(ideal);

    setSimpleInvest({ principal: totalInvested, years: y });
    setSimpleResult(simple);

    setTaxRatePercentState(taxRatePercent);
    setFeeRatePercentState(feeRatePercent);
  };

  const hasResult = !!result && !!idealResult;

  const insights = useMemo(() => {
    if (!hasResult) return [];
    const fmt = (v) => formatMoneyShort(Number(v) || 0, numberLocale);
    const dragPct = summary.fvIdeal > 0 ? (summary.drag / summary.fvIdeal) * 100 : 0;

    if (locale === "ko") {
      return [
        `세후 결과는 세전(이상치) 대비 약 ${summary.ratio.toFixed(1)}% 수준입니다.`,
        `세금·수수료/복리손실 영향으로 최종 자산이 ${fmt(summary.drag)} 정도 감소했습니다. (${dragPct.toFixed(1)}%)`,
        `총 납입액은 ${fmt(summary.totalContrib)}이고, 세후 이자는 ${fmt(summary.totalInterestNet)}입니다.`,
      ];
    }

    return [
      `Your net result is about ${summary.ratio.toFixed(1)}% of the ideal (no tax/fee) case.`,
      `Taxes/fees reduced the final value by ~${fmt(summary.drag)} (${dragPct.toFixed(1)}%).`,
      `Total contribution is ${fmt(summary.totalContrib)}, and net interest is ${fmt(summary.totalInterestNet)}.`,
    ];
  }, [hasResult, locale, numberLocale, summary]);

  const dragBreakdown = useMemo(() => {
    if (!result || !idealResult) return null;

    const rowsNet = result.yearSummary;
    const rowsIdeal = idealResult.yearSummary;
    if (!rowsNet.length || !rowsIdeal.length) return null;

    const lastNet = rowsNet[rowsNet.length - 1];
    const lastIdeal = rowsIdeal[rowsIdeal.length - 1];

    const idealFV = lastIdeal.closingBalanceNet;
    const netFV = lastNet.closingBalanceNet;

    const taxDrag = lastNet.cumulativeTax;
    const feeDrag = lastNet.cumulativeFee;
    const compoundDrag = (idealFV - netFV) - (taxDrag + feeDrag);

    return {
      idealFV,
      netFV,
      totalDrag: idealFV - netFV,
      taxDrag,
      feeDrag,
      compoundDrag,
    };
  }, [result, idealResult]);

  const handleShare = async () => {
    // 1) Web Share API
    if (await shareWeb()) return;

    // 2) Kakao SDK
    if (typeof window !== "undefined" && window?.Kakao) {
      shareKakao({
        title: locale === "ko" ? "FinMap 복리 계산 결과" : "Compound result",
        description:
          locale === "ko"
            ? "세전/세후, 복리·단리 비교까지 자동 생성!"
            : "Full breakdown of compound interest.",
        url: window.location.href,
      });
      return;
    }

    // 3) Naver share
    if (typeof window !== "undefined") {
      shareNaver({
        title: locale === "ko" ? "FinMap 복리 계산 결과" : "Compound Result",
        url: window.location.href,
      });
      return;
    }

    // 4) 최후 fallback: URL 복사
    copyUrl();
  };

  // ----------------------------
  // 렌더링
  // ----------------------------
  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/compound-interest"
        image="/og/compound.jpg"
        locale={locale}
      />

      {/* ✅ 구조화데이터: FAQ + Breadcrumb + App */}
      <JsonLd data={faqJsonLd} />
      <JsonLd data={howtoJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {extraJsonLd.map((d, i) => (
        <JsonLd key={i} data={d} />
      ))}

      <main className="py-6 grid gap-6 fm-mobile-full">
        {/* 타이틀 + 모드 토글 */}
        <header className="flex items-start justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">
            {locale === "ko" ? "복리 이자 계산기" : "Compound Interest Calculator"}
          </h1>

          <div className="fm-pro-toggle shrink-0">
            <button
              type="button"
              className={uiMode === "basic" ? "active" : ""}
              onClick={() => setMode("basic")}
            >
              {locale === "ko" ? "기본" : "Basic"}
            </button>
            <button
              type="button"
              className={uiMode === "pro" ? "active" : ""}
              onClick={() => setMode("pro")}
            >
              {locale === "ko" ? "PRO" : "PRO"}
            </button>
          </div>
        </header>

        {/* ✅ “설명형 콘텐츠(H2)” 추가: 키워드 자연 삽입 */}
        <section className="card w-full">
          <h2 className="text-base font-semibold mb-2">
            {locale === "ko"
              ? "월복리·연복리, 적립식 투자까지 한 번에 계산"
              : "Monthly/annual compounding + contributions in one place"}
          </h2>
          <p className="text-sm text-slate-600">
            {locale === "ko"
              ? "초기 투자금(원금)과 월 적립금(적립식), 연 수익률, 기간을 입력하면 복리 방식으로 미래가치(FV)를 계산합니다. 세전·세후(세금·수수료) 결과를 비교하고, 연도별 표/차트로 자산 성장 경로를 확인할 수 있어요."
              : "Enter principal, monthly contribution, annual return, and years to calculate FV. Compare ideal vs net (tax/fee) and explore growth with charts and yearly tables."}
          </p>

          <div className="mt-3 grid gap-2 md:grid-cols-3 text-sm">
            <div className="border rounded-xl p-3 bg-slate-50">
              <div className="font-semibold mb-1">
                {locale === "ko" ? "복리 미래가치(FV)" : "Future Value (FV)"}
              </div>
              <div className="text-slate-600">
                {locale === "ko"
                  ? "복리 이자 효과로 자산이 얼마나 늘어나는지"
                  : "How compounding grows your assets"}
              </div>
            </div>

            <div className="border rounded-xl p-3 bg-slate-50">
              <div className="font-semibold mb-1">
                {locale === "ko" ? "월복리 vs 연복리" : "Monthly vs Annual"}
              </div>
              <div className="text-slate-600">
                {locale === "ko"
                  ? "복리 주기 차이에 따른 결과 비교"
                  : "Compare compounding frequency"}
              </div>
            </div>

            <div className="border rounded-xl p-3 bg-slate-50">
              <div className="font-semibold mb-1">
                {locale === "ko" ? "세금·수수료 반영" : "Tax & Fee"}
              </div>
              <div className="text-slate-600">
                {locale === "ko"
                  ? "현실적인 세후 미래가치 확인"
                  : "See net results after costs"}
              </div>
            </div>
          </div>
        </section>        

        {/* Form */}
        <section className="card">
          <h2 className="text-base font-semibold mb-3">
            {locale === "ko" ? "복리 계산 입력" : "Inputs"}
          </h2>
          <CompoundForm
            onSubmit={onSubmit}
            locale={locale}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        </section>

        {/* 결과 영역 */}
        {hasResult && (
          <>
            <div
              id="pdf-target"
              className={`grid gap-6 ${isProMobile ? "fm-safe-bottom" : ""}`}
            >
              {/* =========================
                  ✅ PRO Mobile Flow
                  요약 → 차트 → 주요 해석 → CTA
              ========================= */}
              {isProMobile ? (
                <>
                  {/* Summary */}
                  <div ref={(el) => (sectionEls.current.sum = el)} className="scroll-mt-24">
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                      <div className="stat">
                        <div className="stat-title">{t.fv}</div>
                        <div className="stat-value">
                          <ValueDisplay value={summary.fvNet} locale={numberLocale} currency={currency} />
                        </div>
                      </div>

                      <div className="stat">
                        <div className="stat-title">{t.fvIdeal}</div>
                        <div className="stat-value">
                          <ValueDisplay value={summary.fvIdeal} locale={numberLocale} currency={currency} />
                        </div>
                      </div>

                      <div className="stat">
                        <div className="stat-title">{t.drag}</div>
                        <div className="stat-value">
                          <ValueDisplay value={summary.drag} locale={numberLocale} currency={currency} />
                        </div>
                      </div>

                      <div className="stat">
                        <div className="stat-title">{t.ratio}</div>
                        <div className="stat-value">{summary.ratio.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div ref={(el) => (sectionEls.current.chart = el)} className="scroll-mt-24">
                    <div className="card">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold">{t.chartTitle}</h2>
                      </div>

                      <CompoundChart
                        data={result}
                        lumpData={simpleResult}
                        idealData={idealResult}
                        locale={numberLocale}
                        currency={currency}
                        principal={invest.principal}
                        monthly={invest.monthly}
                      />
                    </div>
                  </div>

                  {/* Insights */}
                  <div ref={(el) => (sectionEls.current.insight = el)} className="scroll-mt-24">
                    <div className="card">
                      <h2 className="text-lg font-semibold mb-2">
                        {locale === "ko" ? "주요 해석" : "Key Insights"}
                      </h2>

                      <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                        {(insights || []).map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA */}
                  <div ref={(el) => (sectionEls.current.cta = el)} className="scroll-mt-24">
                    <CompoundCTA locale={locale} onDownloadPDF={handleDownloadPDF} />
                  </div>

                  {/* Advanced sections (collapsed) */}
                  <details className="card">
                    <summary className="cursor-pointer font-semibold">
                      {locale === "ko" ? "고급 분석 펼치기" : "Show advanced sections"}
                    </summary>

                    <div className="grid gap-6 mt-4">
                      {/* ==== 복리 시뮬레이션 (3가지 시나리오) ==== */}
                      <ScenarioPanel
                        principal={invest.principal}
                        monthly={invest.monthly}
                        years={invest.years}
                        annualRate={result.annualRate}
                        compounding={result.compounding}
                        taxRatePercent={taxRatePercentState}
                        feeRatePercent={feeRatePercentState}
                        baseYear={result.baseYear}
                        locale={numberLocale}
                        currency={currency}
                      />

                      {/* ==== 연도별 현금흐름 차트 (Cash Flow Layer) ==== */}
                      <CashFlowLayerChart
                        yearSummary={result.yearSummary}
                        numberLocale={numberLocale}
                        currency={currency}
                      />

                      {/* ==== 멀티 타임라인(저장/비교) ==== */}
                      <TimelineComparePanel
                        numberLocale={numberLocale}
                        currency={currency}
                        currentScenario={{
                          currency,
                          numberLocale,
                          inputs: {
                            currency,
                            principal: invest.principal,
                            monthly: invest.monthly,
                            years: invest.years,
                            annualRate: result.annualRate,
                            compounding: result.compounding,
                            taxRatePercent: taxRatePercentState,
                            feeRatePercent: feeRatePercentState,
                          },
                          summary: {
                            fvNet: summary.fvNet,
                            fvIdeal: summary.fvIdeal,
                            drag: summary.drag,
                            ratio: summary.ratio,
                            totalContrib: summary.totalContrib,
                            totalInterestNet: summary.totalInterestNet,
                          },
                          series: {
                            years: (result.yearSummary || []).map((r) => r.year),
                            net: (result.yearSummary || []).map((r) => r.closingBalanceNet),
                          },
                        }}
                      />

                      {/* Yearly Table — 복리식 */}
                      <CompoundYearTable
                        result={result}
                        locale={numberLocale}
                        currency={currency}
                        principal={invest.principal}
                        monthly={invest.monthly}
                        title={locale === "ko" ? t.yearlyCompoundKo : t.yearlyCompoundEn}
                      />

                      {/* Yearly Table — 단리식 */}
                      <CompoundYearTable
                        result={simpleResult}
                        locale={numberLocale}
                        currency={currency}
                        principal={simpleInvest.principal}
                        monthly={0}
                        title={locale === "ko" ? t.yearlySimpleKo : t.yearlySimpleEn}
                      />

                      {/* 비교 Summary */}
                      <div className="card">
                        <h2 className="text-lg font-semibold mb-3">{t.compareTitle}</h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* 복리식 */}
                          <div className="border rounded-xl p-4">
                            <h3 className="font-semibold mb-2">{t.planCompound}</h3>
                            <ul className="text-sm space-y-1">
                              <li>
                                {t.contrib}:{" "}
                                <ValueDisplay value={summary.totalContrib} locale={numberLocale} currency={currency} />
                              </li>
                              <li>
                                {t.fv}:{" "}
                                <ValueDisplay value={summary.fvNet} locale={numberLocale} currency={currency} />
                              </li>
                              <li>
                                {t.interest}:{" "}
                                <ValueDisplay value={summary.totalInterestNet} locale={numberLocale} currency={currency} />
                              </li>
                            </ul>
                          </div>

                          {/* 단리식 */}
                          <div className="border rounded-xl p-4">
                            <h3 className="font-semibold mb-2">{t.planSimple}</h3>
                            <ul className="text-sm space-y-1">
                              <li>
                                {t.contrib}:{" "}
                                <ValueDisplay
                                  value={safe(simpleResult, "totalContribution")}
                                  locale={numberLocale}
                                  currency={currency}
                                />
                              </li>
                              <li>
                                {t.fv}:{" "}
                                <ValueDisplay
                                  value={safe(simpleResult, "futureValueNet")}
                                  locale={numberLocale}
                                  currency={currency}
                                />
                              </li>
                              <li>
                                {t.interest}:{" "}
                                <ValueDisplay
                                  value={safe(simpleResult, "totalInterestNet")}
                                  locale={numberLocale}
                                  currency={currency}
                                />
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Drag Breakdown Card */}
                      <div className="card">
                        <h2 className="text-lg font-semibold mb-2">
                          {locale === "ko" ? "손실요인 분해(Drag Breakdown)" : "Drag Decomposition"}
                        </h2>

                        <p className="text-sm text-slate-600 mb-3">
                          {locale === "ko"
                            ? "세금, 수수료, 복리효과 상실이 미래가치에 끼친 영향을 분해해 보여줍니다."
                            : "Breakdown of how taxes, fees, and lost compounding affected your final value."}
                        </p>

                        <DragBreakdownChart data={dragBreakdown} locale={numberLocale} currency={currency} />
                      </div>

                      {/* Goal Engine */}
                      <div className="card">
                        <h2 className="text-lg font-semibold mb-2">
                          {locale === "ko" ? "목표 달성 엔진" : "Future Goal Engine"}
                        </h2>

                        <p className="text-sm text-slate-600 mb-3">
                          {locale === "ko"
                            ? "목표 자산까지 필요한 월 투자금, 필요한 수익률, 필요한 초기 투자금을 역산해줍니다."
                            : "Reverse-calculate the monthly investment, required return, or initial principal needed to reach your target."}
                        </p>

                        <GoalEngineCard
                          locale={locale}
                          currency={currency}
                          result={result}
                          idealResult={idealResult}
                          invest={invest}
                          taxRatePercent={taxRatePercentState}
                          feeRatePercent={feeRatePercentState}
                        />
                      </div>

                      {/* Sensitivity */}
                      <div className="card">
                        <h2 className="text-lg font-semibold mb-2">
                          {locale === "ko" ? "자산 성장 민감도 분석" : "Growth Sensitivity Analysis"}
                        </h2>

                        <p className="text-sm text-slate-600 mb-3">
                          {locale === "ko"
                            ? "수익률·세금·수수료 변동이 미래 자산에 어떤 영향을 주는지 즉시 확인해보세요."
                            : "See how changes in rate, tax, and fees affect your future value instantly."}
                        </p>

                        <SensitivityPanel
                          principal={invest.principal}
                          monthly={invest.monthly}
                          annualRate={result.annualRate}
                          years={invest.years}
                          taxRatePercent={result.taxRate * 100}
                          feeRatePercent={result.feeRate * 100}
                          locale={numberLocale}
                          currency={currency}
                        />
                      </div>

                      {/* FAQ */}
                      <div className="card">
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
                    </div>
                  </details>
                </>
              ) : (
                /* =========================
                    ✅ BASIC / Desktop Layout
                    (기존 그대로)
                ========================= */
                <>
                  {/* Summary (확장 버전) */}
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="stat">
                      <div className="stat-title">{t.fv}</div>
                      <div className="stat-value">
                        <ValueDisplay value={summary.fvNet} locale={numberLocale} currency={currency} />
                      </div>
                    </div>

                    <div className="stat">
                      <div className="stat-title">{t.fvIdeal}</div>
                      <div className="stat-value">
                        <ValueDisplay value={summary.fvIdeal} locale={numberLocale} currency={currency} />
                      </div>
                    </div>

                    <div className="stat">
                      <div className="stat-title">{t.drag}</div>
                      <div className="stat-value">
                        <ValueDisplay value={summary.drag} locale={numberLocale} currency={currency} />
                      </div>
                    </div>

                    <div className="stat">
                      <div className="stat-title">{t.ratio}</div>
                      <div className="stat-value">{summary.ratio.toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold">{t.chartTitle}</h2>
                    </div>

                    <CompoundChart
                      data={result}
                      lumpData={simpleResult}
                      idealData={idealResult}
                      locale={numberLocale}
                      currency={currency}
                      principal={invest.principal}
                      monthly={invest.monthly}
                    />
                  </div>

                  {/* ==== 복리 시뮬레이션 (3가지 시나리오) ==== */}
                  <ScenarioPanel
                    principal={invest.principal}
                    monthly={invest.monthly}
                    years={invest.years}
                    annualRate={result.annualRate}
                    compounding={result.compounding}
                    taxRatePercent={taxRatePercentState}
                    feeRatePercent={feeRatePercentState}
                    baseYear={result.baseYear}
                    locale={numberLocale}
                    currency={currency}
                  />

                  {/* ==== 연도별 현금흐름 차트 (Cash Flow Layer) ==== */}
                  <CashFlowLayerChart
                    yearSummary={result.yearSummary}
                    numberLocale={numberLocale}
                    currency={currency}
                  />

                  {/* ==== 멀티 타임라인(저장/비교) ==== */}
                  <TimelineComparePanel
                    numberLocale={numberLocale}
                    currency={currency}
                    currentScenario={{
                      currency,
                      numberLocale,
                      inputs: {
                        currency,
                        principal: invest.principal,
                        monthly: invest.monthly,
                        years: invest.years,
                        annualRate: result.annualRate,
                        compounding: result.compounding,
                        taxRatePercent: taxRatePercentState,
                        feeRatePercent: feeRatePercentState,
                      },
                      summary: {
                        fvNet: summary.fvNet,
                        fvIdeal: summary.fvIdeal,
                        drag: summary.drag,
                        ratio: summary.ratio,
                        totalContrib: summary.totalContrib,
                        totalInterestNet: summary.totalInterestNet,
                      },
                      series: {
                        years: (result.yearSummary || []).map((r) => r.year),
                        net: (result.yearSummary || []).map((r) => r.closingBalanceNet),
                      },
                    }}
                  />

                  {/* Yearly Table — 복리식 */}
                  <CompoundYearTable
                    result={result}
                    locale={numberLocale}
                    currency={currency}
                    principal={invest.principal}
                    monthly={invest.monthly}
                    title={locale === "ko" ? t.yearlyCompoundKo : t.yearlyCompoundEn}
                  />

                  {/* Yearly Table — 단리식 */}
                  <CompoundYearTable
                    result={simpleResult}
                    locale={numberLocale}
                    currency={currency}
                    principal={simpleInvest.principal}
                    monthly={0}
                    title={locale === "ko" ? t.yearlySimpleKo : t.yearlySimpleEn}
                  />

                  {/* 비교 Summary */}
                  <div className="card">
                    <h2 className="text-lg font-semibold mb-3">{t.compareTitle}</h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* 복리식 */}
                      <div className="border rounded-xl p-4">
                        <h3 className="font-semibold mb-2">{t.planCompound}</h3>
                        <ul className="text-sm space-y-1">
                          <li>
                            {t.contrib}:{" "}
                            <ValueDisplay value={summary.totalContrib} locale={numberLocale} currency={currency} />
                          </li>
                          <li>
                            {t.fv}:{" "}
                            <ValueDisplay value={summary.fvNet} locale={numberLocale} currency={currency} />
                          </li>
                          <li>
                            {t.interest}:{" "}
                            <ValueDisplay value={summary.totalInterestNet} locale={numberLocale} currency={currency} />
                          </li>
                        </ul>
                      </div>

                      {/* 단리식 */}
                      <div className="border rounded-xl p-4">
                        <h3 className="font-semibold mb-2">{t.planSimple}</h3>
                        <ul className="text-sm space-y-1">
                          <li>
                            {t.contrib}:{" "}
                            <ValueDisplay
                              value={safe(simpleResult, "totalContribution")}
                              locale={numberLocale}
                              currency={currency}
                            />
                          </li>
                          <li>
                            {t.fv}:{" "}
                            <ValueDisplay
                              value={safe(simpleResult, "futureValueNet")}
                              locale={numberLocale}
                              currency={currency}
                            />
                          </li>
                          <li>
                            {t.interest}:{" "}
                            <ValueDisplay
                              value={safe(simpleResult, "totalInterestNet")}
                              locale={numberLocale}
                              currency={currency}
                            />
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Drag Breakdown Card */}
                  <div className="card">
                    <h2 className="text-lg font-semibold mb-2">
                      {locale === "ko" ? "손실요인 분해(Drag Breakdown)" : "Drag Decomposition"}
                    </h2>

                    <p className="text-sm text-slate-600 mb-3">
                      {locale === "ko"
                        ? "세금, 수수료, 복리효과 상실이 미래가치에 끼친 영향을 분해해 보여줍니다."
                        : "Breakdown of how taxes, fees, and lost compounding affected your final value."}
                    </p>

                    <DragBreakdownChart data={dragBreakdown} locale={numberLocale} currency={currency} />
                  </div>

                  {/* Goal Engine */}
                  <div className="card">
                    <h2 className="text-lg font-semibold mb-2">
                      {locale === "ko" ? "목표 달성 엔진" : "Future Goal Engine"}
                    </h2>

                    <p className="text-sm text-slate-600 mb-3">
                      {locale === "ko"
                        ? "목표 자산까지 필요한 월 투자금, 필요한 수익률, 필요한 초기 투자금을 역산해줍니다."
                        : "Reverse-calculate the monthly investment, required return, or initial principal needed to reach your target."}
                    </p>

                    <GoalEngineCard
                      locale={locale}
                      currency={currency}
                      result={result}
                      idealResult={idealResult}
                      invest={invest}
                      taxRatePercent={taxRatePercentState}
                      feeRatePercent={feeRatePercentState}
                    />
                  </div>

                  {/* Sensitivity */}
                  <div className="card">
                    <h2 className="text-lg font-semibold mb-2">
                      {locale === "ko" ? "자산 성장 민감도 분석" : "Growth Sensitivity Analysis"}
                    </h2>

                    <p className="text-sm text-slate-600 mb-3">
                      {locale === "ko"
                        ? "수익률·세금·수수료 변동이 미래 자산에 어떤 영향을 주는지 즉시 확인해보세요."
                        : "See how changes in rate, tax, and fees affect your future value instantly."}
                    </p>

                    <SensitivityPanel
                      principal={invest.principal}
                      monthly={invest.monthly}
                      annualRate={result.annualRate}
                      years={invest.years}
                      taxRatePercent={result.taxRate * 100}
                      feeRatePercent={result.feeRate * 100}
                      locale={numberLocale}
                      currency={currency}
                    />
                  </div>                  
                </>
              )}
            </div>

            {/* FAQ */}
                  <div className="card">
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

                  {/* CTA */}
                  <CompoundCTA locale={locale} onDownloadPDF={handleDownloadPDF} />

                  <section className="card">
                    <h2 className="text-base font-semibold mb-2">
                      {locale === "ko"
                        ? "월복리·연복리, 적립식 투자까지 한 번에 계산"
                        : "Monthly/Annual compounding + contributions in one place"}
                    </h2>

                    <p className="text-sm text-slate-600">
                      {locale === "ko"
                        ? "이 복리 계산기는 원금(초기 투자금)과 월 적립금(적립식), 연 수익률, 기간을 입력해 미래가치(FV)를 계산합니다. 월복리/연복리처럼 복리 주기 차이에 따른 결과도 비교할 수 있고, 세금·수수료를 반영해 현실적인 세후 총자산을 확인할 수 있어요."
                        : "Enter principal, monthly contribution, annual return, and years to calculate FV. Compare monthly vs annual compounding and check net results after tax/fees."}
                    </p>
                    <p>
                      <div className="font-semibold mb-2">
                        {locale === "ko" ? "관련 계산기" : "Related tools"}
                      </div>`
                    </p>
                    <div className="tool-cta-section">
                      <ToolCta lang={lang} type="fire" />
                      <ToolCta lang={lang} type="goal" />
                      <ToolCta lang={lang} type="cagr" />
                      <ToolCta lang={lang} type="dca" />
                    </div>
                  </section>

            {/* 하단 고정 CTA Bar */}
            {!isExporting && (
              <CTABar
                locale={locale}
                onDownloadPDF={handleDownloadPDF}
                onShare={handleShare}
                mode={isProMobile ? "pro" : "basic"}
                alwaysVisible={isProMobile}
                onNavigate={scrollTo}
              />
            )}
          </>
        )}

        {/* ✅ 내부링크: 추천 가이드 글 5개 (SEO + 체류시간 + 내부탐색) */}
        <section className="card">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-base font-semibold">
              {locale === "ko" ? "추천 가이드 글" : "Recommended guides"}
            </h2>
            <Link
              href={locale === "ko" ? `/category/personalFinance`:`/en/category/personalFinance`}
              locale={locale}
              className="text-sm text-slate-600 hover:underline"
            >
              {locale === "ko" ? "전체 글 보기" : "View all posts"}
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/posts/personalFinance/${locale}/${g.slug}`}
                locale={locale}
                className="block border rounded-2xl p-4 hover:shadow-sm transition"
              >
                <div className="text-xs text-slate-500 mb-1">
                  {locale === "ko" ? g.tagKo : g.tagEn}
                </div>
                <div className="font-semibold leading-snug">
                  {locale === "ko" ? g.titleKo : g.titleEn}
                </div>
                {/* 2단계에서 길이 조정해도 되지만, 기본은 1줄로 고정 */}
                <div className="text-sm text-slate-600 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {locale === "ko" ? g.descKo : g.descEn}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
