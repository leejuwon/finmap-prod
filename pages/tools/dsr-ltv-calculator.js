import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SeoHead from "../../_components/SeoHead";
import DsrLtvCalculator from "../../_components/DsrLtvCalculator";

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const BASIS_DATE = "2026-05-21";

const TEXT = {
  ko: {
    seoTitle: "DSR LTV 아파트 구매 가능 금액 계산기 | 대출 가능액·매수 가능 가격",
    seoDesc:
      "보유자산, 연소득, 기존대출, 금리, 대출기간, LTV, DSR을 직접 입력해 예상 대출 가능액과 아파트 구매 가능 가격대를 계산해보세요. 실제 대출 심사와는 다를 수 있습니다.",
    h1: "DSR/LTV 아파트 구매 가능 금액 계산기",
    lead:
      "LTV와 DSR을 사용자가 직접 입력해 대략적인 주택담보대출 가능액, 구매 가능 가격 상한, 안전 탐색 가격대를 확인합니다.",
    basis: "계산 기준일",
    note:
      "정책 자동 반영 없이 입력값 기준으로만 계산합니다. 실제 대출 심사 결과와 다를 수 있습니다.",
    relatedTitle: "부동산 대시보드와 함께 쓰기",
    relatedLead:
      "계산 결과의 안전 탐색 가격대를 확인한 뒤, 실거래 대시보드에서 서울·경기·인천 가격 분포와 거래량을 함께 비교하세요.",
    faqTitle: "DSR/LTV 계산기 FAQ",
    faqs: [
      {
        q: "이 계산기가 실제 대출 가능액을 보장하나요?",
        a: "아니요. 사용자가 입력한 LTV, DSR, 금리, 기간을 기준으로 한 단순 추정입니다. 실제 심사는 금융회사 기준, 신용도, 소득 인정 방식, 기존 부채, 주택 유형과 지역에 따라 달라질 수 있습니다.",
      },
      {
        q: "LTV와 DSR 값은 자동으로 반영되나요?",
        a: "아니요. 1차 구현 범위에서는 정책 자동 반영을 하지 않습니다. 사용자가 직접 입력한 LTV와 DSR 값을 그대로 사용합니다.",
      },
      {
        q: "상환 방식은 무엇인가요?",
        a: "원리금균등 상환만 지원합니다. 원금균등, 만기일시, 혼합형 상환은 1차 범위에 포함하지 않습니다.",
      },
      {
        q: "병목 원인은 어떻게 판단하나요?",
        a: "DSR 기준으로 가능한 가격 상한과 LTV/자기자금 기준으로 가능한 가격 상한을 비교해 더 낮은 쪽을 주요 제약으로 표시합니다.",
      },
      {
        q: "안전 탐색 가격대는 무엇인가요?",
        a: "계산된 구매 가능 가격 상한의 80~90% 구간입니다. 실제 심사 차이, 금리 변화, 부대비용, 협상 여지를 고려하기 위한 보수적 탐색 범위입니다.",
      },
    ],
  },
  en: {
    seoTitle: "DSR LTV Apartment Affordability Calculator | Loan Capacity & Purchase Price",
    seoDesc:
      "Estimate mortgage capacity and apartment purchase price using your own assets, income, existing debt, rate, loan term, LTV, and DSR assumptions. Actual lender review may differ.",
    h1: "DSR/LTV Apartment Affordability Calculator",
    lead:
      "Enter your own LTV and DSR assumptions to estimate mortgage capacity, maximum purchase price, and a safer search range.",
    basis: "Basis date",
    note:
      "This tool does not automatically apply policy updates. It only uses your inputs and may differ from real lender review.",
    relatedTitle: "Use it with the real estate dashboard",
    relatedLead:
      "After checking the safer price range, compare Seoul, Gyeonggi, and Incheon transaction distributions in the dashboard.",
    faqTitle: "DSR/LTV calculator FAQ",
    faqs: [
      {
        q: "Does this calculator guarantee my actual loan amount?",
        a: "No. It is a simplified estimate based on user-entered LTV, DSR, rate, and term. Actual lender review can differ by credit, income recognition, existing debt, property type, location, and policy.",
      },
      {
        q: "Are LTV and DSR automatically updated?",
        a: "No. The first version does not automatically apply policy updates. It uses the LTV and DSR values you enter.",
      },
      {
        q: "What repayment method does this support?",
        a: "Only equal principal-and-interest repayment is supported in this first version.",
      },
      {
        q: "How is the bottleneck determined?",
        a: "The tool compares the DSR-based price limit with the LTV/cash-based price limit and marks the lower one as the main constraint.",
      },
      {
        q: "What is the safer search range?",
        a: "It is 80–90% of the estimated maximum purchase price, used as a conservative range for lender review differences, rate changes, costs, and negotiation buffers.",
      },
    ],
  },
};

export default function DsrLtvCalculatorPage() {
  const router = useRouter();
  const locale = router.locale === "en" ? "en" : "ko";
  const t = TEXT[locale];
  const pageUrl = "/tools/dsr-ltv-calculator";

  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: t.faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    }),
    [t.faqs]
  );

  const appJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: t.h1,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      inLanguage: locale === "ko" ? "ko-KR" : "en-US",
      url: `https://www.finmaphub.com${locale === "en" ? "/en" : ""}${pageUrl}`,
      description: t.seoDesc,
    }),
    [locale, t.h1, t.seoDesc]
  );

  const breadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "FinMap",
          item: `https://www.finmaphub.com${locale === "en" ? "/en" : ""}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: locale === "ko" ? "금융 계산기" : "Finance Tools",
          item: `https://www.finmaphub.com${locale === "en" ? "/en" : ""}/tools`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: t.h1,
          item: `https://www.finmaphub.com${locale === "en" ? "/en" : ""}${pageUrl}`,
        },
      ],
    }),
    [locale, t.h1]
  );

  return (
    <>
      <SeoHead
        title={t.seoTitle}
        desc={t.seoDesc}
        url={pageUrl}
        locale={locale}
      />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={appJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <main className="tool-page">
        <div className="tool-header">
          <p className="mb-2 text-sm font-medium text-blue-600">
            {t.basis}: {BASIS_DATE}
          </p>
          <h1>{t.h1}</h1>
          <p>{t.lead}</p>
          <p className="mt-2 text-sm text-slate-500">{t.note}</p>
        </div>

        <DsrLtvCalculator locale={locale} />

        <section className="card min-w-0">
          <h2 className="break-words text-lg font-semibold">{t.relatedTitle}</h2>
          <p className="mt-2 break-words text-sm text-slate-600">{t.relatedLead}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/market/real-estate" locale={locale} className="btn-primary">
              {locale === "ko" ? "부동산 대시보드 열기" : "Open real estate dashboard"}
            </Link>
            <Link
              href="/posts/personalFinance/mortgage-risk-checklist-dsr-variable"
              locale={locale}
              className="btn-secondary"
            >
              {locale === "ko" ? "주택대출 리스크 체크리스트" : "Mortgage risk checklist"}
            </Link>
            <Link
              href="/posts/personalFinance/apt-dashboard-home-goal-roadmap"
              locale={locale}
              className="btn-secondary"
            >
              {locale === "ko" ? "내 집 마련 목표 로드맵" : "Home-buying roadmap"}
            </Link>
          </div>
        </section>

        <section className="card min-w-0">
          <h2 className="break-words text-lg font-semibold">{t.faqTitle}</h2>
          <div className="mt-4 grid gap-3">
            {t.faqs.map((item) => (
              <details key={item.q} className="rounded-xl border p-4">
                <summary className="cursor-pointer font-semibold">{item.q}</summary>
                <p className="mt-2 break-words text-sm text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
