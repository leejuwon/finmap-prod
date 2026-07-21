import { useMemo } from "react";
import { useRouter } from "next/router";
import SeoHead from "../../_components/SeoHead";
import MortgageLoanCalculator from "../../_components/MortgageLoanCalculator";
import { ToolCitationBox, ToolSharePanel } from "../../_components/ToolBacklinkKit";

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const PAGE_URL = "/tools/mortgage-loan-calculator";
const OG_IMAGE =
  "https://res.cloudinary.com/dwonflmnn/image/upload/v1780305922/blog/insight/og5utvm2syhksvkr38fg.png";

const TEXT = {
  ko: {
    seoTitle: "주담대 원리금 계산기 - 아파트 담보대출 월상환액 계산",
    seoDesc:
      "대출금액, 금리, 대출기간, 상환방식을 입력해 주택담보대출 원리금 월상환액, 총이자, 총상환액을 계산하고 DSR/LTV 계산기로 대출 가능성을 함께 확인합니다.",
    h1: "주담대 원리금 계산기: 아파트 담보대출 월상환액 계산",
    eyebrow: "주담대·월상환액",
    lead:
      "대출금액을 먼저 정해 놓고 월상환액, 총이자, 첫 달과 마지막 달 상환액을 확인하는 계산기입니다. 소득과 집값 기준의 한도 판단은 DSR/LTV 계산기에서 따로 점검하세요.",
    faqTitle: "주담대 원리금 계산기 FAQ",
    faqs: [
      {
        q: "주담대 원리금 계산기와 DSR/LTV 계산기는 무엇이 다른가요?",
        a: "이 계산기는 대출금액, 금리, 기간, 상환방식으로 월상환액과 총이자를 계산합니다. DSR/LTV 계산기는 연소득, 기존부채, 집값, 보유 현금을 넣어 대출 가능성과 구매 가능 가격을 점검합니다.",
      },
      {
        q: "원리금균등과 원금균등 중 무엇을 선택해야 하나요?",
        a: "원리금균등은 매월 상환액이 거의 일정해 현금흐름을 보기 쉽습니다. 원금균등은 초기에 상환액이 더 크지만 시간이 갈수록 줄어들고 총이자가 낮아지는 경향이 있습니다.",
      },
      {
        q: "금리 +1%p 결과는 무엇을 의미하나요?",
        a: "입력한 대출금액과 기간, 상환방식은 그대로 두고 연이자율만 1%p 높였을 때 대표 월상환액이 얼마나 달라지는지 보여주는 민감도 참고값입니다.",
      },
      {
        q: "계산 결과가 실제 대출 승인액을 의미하나요?",
        a: "아닙니다. 실제 조건은 금융기관 심사, 금리, 신용점수, 소득 인정 방식, 규제지역, 스트레스 DSR, 담보가치 등에 따라 달라질 수 있습니다.",
      },
    ],
  },
  en: {
    seoTitle: "Mortgage Payment Calculator - Monthly Korean Apartment Loan Payment",
    seoDesc:
      "Calculate estimated monthly mortgage payment, total interest, total repayment, first and last payment, and rate sensitivity from loan amount, rate, term, and repayment type.",
    h1: "Mortgage Payment Calculator",
    eyebrow: "Mortgage payment",
    lead:
      "Start with a loan amount and estimate monthly payment, total interest, first and last payment, and +1pp rate sensitivity. Use the DSR/LTV calculator separately for income and home-price affordability.",
    faqTitle: "Mortgage payment calculator FAQ",
    faqs: [
      {
        q: "How is this different from the DSR/LTV calculator?",
        a: "This calculator starts from a loan amount and estimates payment and interest. The DSR/LTV calculator starts from income, existing debt, home price, cash, LTV, and DSR assumptions to estimate affordability.",
      },
      {
        q: "Which repayment method should I use?",
        a: "Equal payment is easier for monthly cash-flow planning. Equal principal starts with a higher payment, declines over time, and usually produces lower total interest.",
      },
      {
        q: "What does the +1pp rate result mean?",
        a: "It keeps the loan amount, term, and repayment type unchanged and shows how the representative monthly payment changes if the annual rate rises by one percentage point.",
      },
      {
        q: "Does this result guarantee mortgage approval?",
        a: "No. Actual terms can differ by lender review, final rate, credit profile, recognized income, regulated area, stress DSR, collateral value, and guarantee conditions.",
      },
    ],
  },
};

export default function MortgageLoanCalculatorPage() {
  const router = useRouter();
  const locale = router.locale === "en" ? "en" : "ko";
  const t = TEXT[locale];
  const sitePrefix = `https://www.finmaphub.com${locale === "en" ? "/en" : ""}`;

  const appJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: locale === "ko" ? "주담대 원리금 계산기" : "Mortgage Payment Calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      inLanguage: locale === "ko" ? "ko-KR" : "en-US",
      url: `${sitePrefix}${PAGE_URL}`,
      description: t.seoDesc,
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "KRW",
      },
    }),
    [locale, sitePrefix, t.seoDesc]
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
          item: sitePrefix,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: locale === "ko" ? "금융 도구" : "Finance Tools",
          item: `${sitePrefix}/tools`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: t.h1,
          item: `${sitePrefix}${PAGE_URL}`,
        },
      ],
    }),
    [locale, sitePrefix, t.h1]
  );

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

  return (
    <>
      <SeoHead
        title={t.seoTitle}
        desc={t.seoDesc}
        url={PAGE_URL}
        image={OG_IMAGE}
        locale={locale}
      />
      <JsonLd data={appJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />

      <main className="tool-page">
        <div className="tool-header mb-4 md:mb-5">
          <p className="mb-2 text-sm font-medium text-blue-600">{t.eyebrow}</p>
          <h1>{t.h1}</h1>
          <p>{t.lead}</p>
        </div>

        <MortgageLoanCalculator locale={locale} />

        <ToolSharePanel toolId="mortgageLoan" locale={locale} />

        <section className="card min-w-0">
          <h2 className="break-words text-lg font-semibold">{t.faqTitle}</h2>
          <div className="mt-4 grid gap-3">
            {t.faqs.map((item) => (
              <details key={item.q} className="rounded-xl border p-4">
                <summary className="cursor-pointer break-words font-semibold">{item.q}</summary>
                <p className="mt-2 break-words text-sm leading-6 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <ToolCitationBox toolId="mortgageLoan" locale={locale} />
      </main>
    </>
  );
}
