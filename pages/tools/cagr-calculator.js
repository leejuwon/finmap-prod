// pages/tools/cagr-calculator.js
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import SeoHead from "../../_components/SeoHead";
import CTABar from "../../_components/CTABar";
import CompoundCTA from "../../_components/CompoundCTA";
import CagrForm from "../../_components/CagrForm";
import CagrChart from "../../_components/CagrChart";
import CagrYearTable from "../../_components/CagrYearTable";
import ToolCta from "../../_components/ToolCta"; // ✅ (기존 파일에서 사용하지만 import 누락 가능성)
import { numberFmt } from "../../lib/compound";
import { calcCagr } from "../../lib/cagr";
import { shareKakao, shareWeb, shareNaver, copyUrl } from "../../utils/share";

// JSON-LD 출력용
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
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

  const scrollTo = (id) => {
    const el = sectionEls.current?.[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
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
    }),
    [locale]
  );

  const summaryFmt = (v) => numberFmt(numberLocale, currency, v || 0);
  const pctFmt = (v) => `${((Number(v) || 0) * 100).toFixed(2)}%`;

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
        tagKo: "CAGR란 무엇인가?",
        tagEn: "About CAGR",
        titleKo: "ETF·펀드 선택 시 CAGR을 반드시 확인해야 하는 이유",
        titleEn: "What Is CAGR? Understanding the Difference From Simple Returns",
        descKo: "ETF·펀드 비교에서 총 수익률만 보면 위험해질 수 있습니다. 이 글에서는 연평균 복리 수익률(CAGR)의 개념부터 ETF 3·5년 CAGR 비교표, 초보자·전문가별 활용법까지 깊이 있게 정리합니다.",
        descEn: "A complete guide to understanding why CAGR (Compound Annual Growth Rate) matters more than total return when evaluating ETFs and funds. Includes tables, long-term examples, and strategies for beginners and professionals.",
      },
      {
        slug: "cagr-7percent-reality-check",
        tagKo: "장기 CAGR",
        tagEn: "long-term CAGR",
        titleKo: "‘연 7% 복리’에 대하여. CAGR로 현실 체크하기",
        titleEn: "About ‘7% Annual Return’. A Reality Check Using CAGR",
        descKo: "많은 투자자가 말하는 ‘연 7% 수익률’은 실제 장기 CAGR과 차이가 있습니다. S&P500 장기 CAGR, 기대수익률 착시, 복리 효과를 현실적으로 이해하고 목표 자산 계획에 적용하는 고급 분석 글입니다.",
        descEn: "Many investors assume that a 7% annual return is realistic, but the truth depends on the difference between expected returns and actual CAGR. This article analyzes S&P 500 long-term CAGR, return volatility, and how compound-growth assumptions distort expectations.",
      },
      {
        slug: "diagnose-investing-skill-with-cagr",
        tagKo: "CAGR로 투자 실력 진단",
        tagEn: "Investing Skill Using CAGR",
        titleKo: "CAGR로 투자 실력 진단하기: MDD·변동성·샤프비율과 함께 보는 현실적인 평가법",
        titleEn: "Diagnosing Your Investing Skill Using CAGR: Understanding MDD, Volatility, and Sharpe Ratio",
        descKo: "CAGR은 결국 ‘돈이 얼마나 늘어났는가’를 보여주는 핵심 지표지만, 단점도 명확합니다. MDD·변동성·샤프비율과 함께 투자 실력을 평가해야 현실적인 결과가 나옵니다. 초보자도 이해할 수 있도록 실제 포트폴리오 비교 사례까지 포함해 자세히 설명합니다.",
        descEn: "CAGR shows how much your portfolio has grown, but it does not capture risk. To evaluate investing skill realistically, you must combine CAGR with MDD, volatility, and the Sharpe ratio. This guide explains each metric and compares two real portfolio scenarios.",
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
    ],
    []
  );

  const onSubmit = (form) => {
    const scale = currency === "KRW" ? 10_000 : 1;
    const init = (Number(form.initial) || 0) * scale;
    const fin = (Number(form.final) || 0) * scale;
    const y = Number(form.years) || 0;

    const r = calcCagr({
      initial: init,
      final: fin,
      years: y,
      taxRate: form.taxRate,
      feeRate: form.feeRate,
    });

    setInitial(init);
    setFinalValue(fin);
    setYears(y);
    setResult(r);
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
        image="/og/cagr-calculator.jpg"
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
              <p className="text-sm text-slate-200 mb-3">{t.heroLead}</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                CAGR · COMPOUND ANNUAL GROWTH RATE
              </p>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2 text-xs">
              <div className="stat bg-slate-800/80 border border-slate-700">
                <p className="stat-title text-slate-300">{t.stat1Title}</p>
                <p className="stat-value text-emerald-300 text-base">{t.stat1Value}</p>
              </div>
              <div className="stat bg-slate-800/80 border border-slate-700">
                <p className="stat-title text-slate-300">{t.stat2Title}</p>
                <p className="stat-value text-sky-300 text-base">{t.stat2Value}</p>
              </div>
              <div className="stat bg-slate-800/80 border border-slate-700">
                <p className="stat-title text-slate-300">{t.stat3Title}</p>
                <p className="stat-value text-amber-300 text-base">{t.stat3Value}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">{t.introTitle}</h2>
          <p className="text-sm text-slate-600 mb-2">{t.introLead}</p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
            <li>{t.introBullet1}</li>
            <li>{t.introBullet2}</li>
            <li>{t.introBullet3}</li>
          </ul>
        </div>

        {/* ✅ 키워드/개념 섹션(SEO + 사용자 이해) */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">{t.explainTitle}</h2>
          <p className="text-sm text-slate-600">{t.explainBody}</p>
        </div>

        {/* 입력 폼 */}
        <div className="card">
          <CagrForm
            onSubmit={onSubmit}
            locale={locale}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        </div>

        {/* 결과 */}
        {hasResult && (
          <>
            {/* ✅ PDF로 저장할 영역 */}
            <div id="pdf-target" className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-4">
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

              <div className="card">
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

              <CagrYearTable
                result={result}
                locale={numberLocale}
                currency={currency}
                initial={initial}
              />

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

              {/* CTA */}
              <CompoundCTA 
                locale={locale} 
                onDownloadPDF={handleDownloadPDF} 
                shareTitle={locale === "ko" ? "FinMap CAGR 계산 결과" : "FinMap CAGR result"}
                shareDescription={
                  locale === "ko"
                    ? "세전/세후 CAGR, 연도별 자산 경로까지 한 번에 공유해보세요."
                    : "Share CAGR with gross/net breakdown and the yearly path."
                } />
            </div>

            <div className="tool-cta-section">
              <ToolCta lang={locale} type="fire" />
              <ToolCta lang={locale} type="compound" />
              <ToolCta lang={locale} type="goal" />
            </div>   

            {/* 하단 고정 CTA Bar */}
            {!isExporting && (
              <CTABar
                locale={locale}
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
              {locale === "ko" ? "추천 가이드 글" : "Recommended guides"}
            </h2>
            <Link
              href={`/category/personalFinance`}
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
      </div>
    </>
  );
}
