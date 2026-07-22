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

const TEXT = {
  ko: {
    seoTitle: "아파트 구매 계산기 - 보유 현금·주담대 한도·DSR LTV 예산 계산",
    seoDesc:
      "집값, 보유 현금, 연소득, 기존 대출, 금리, 대출기간을 입력해 아파트 구매 가능 여부, 필요 현금, 주담대 한도, DSR, LTV, 월상환액을 계산합니다.",
    h1: "아파트 구매 계산기",
    lead:
      "아파트 가격을 보기 전에 보유 현금, 부대비용, 주담대 한도, DSR, LTV를 한 번에 점검하세요. 이 계산기는 보유 현금 기준 구매 가능성을 먼저 보고, 월상환액은 주담대 원리금 계산기로 이어서 확인하도록 돕습니다.",
    note:
      "정책 자동 반영 도구가 아니라 사용자가 입력한 LTV, DSR, 금리, 기간을 기준으로 한 사전 점검입니다.",
    relatedTitle: "계산 후 함께 볼 페이지",
    relatedLead:
      "결과가 나오면 DSR/LTV 계산기에서 대출 가능 한도를 다시 조정하고, 주담대 원리금 계산기에서 월상환액과 총이자를 확인한 뒤 실제 가격대를 비교하세요.",
    flowTitle: "계산 결과를 읽는 순서",
    flowLead:
      "아파트 구매 가능 여부는 한 가지 숫자로 끝나지 않습니다. 보유 현금, 대출 가능 한도, 월상환액, 실제 거래 가격을 나눠서 확인하세요.",
    flowItems: [
      "보유 현금에서 부대비용과 최소 남길 현금을 뺀 뒤 현금 부족/여유를 봅니다.",
      "DSR/LTV 계산기로 연소득, 기존부채, 후보 집값 기준 대출 가능 한도를 다시 점검합니다.",
      "대출금액이 정해지면 주담대 원리금 계산기로 월상환액과 총이자를 따로 확인합니다.",
      "안전 탐색 가격대는 부동산 대시보드에서 거래량과 실거래 가격 분포로 비교합니다.",
    ],
  },
  en: {
    seoTitle: "Home Buying Budget Calculator for Korea: Cash, DSR, LTV & Mortgage Payment",
    seoDesc:
      "Estimate whether a Korean apartment purchase fits your cash, income, existing debt, rate, loan term, DSR, and LTV assumptions.",
    h1: "Home Buying Budget Calculator",
    lead:
      "Check cash on hand, mortgage capacity, DSR, LTV, monthly payment, and a safer search range before comparing apartment rankings.",
    note:
      "This is a planning estimate based on your inputs, not an automatic policy or lender approval result.",
    relatedTitle: "Use the result with these pages",
    relatedLead:
      "After calculating, refine borrowing capacity in the DSR/LTV calculator, check monthly payment in the mortgage calculator, and compare real transaction rankings.",
    flowTitle: "How to read the result",
    flowLead:
      "A home-buying budget is not one number. Separate cash, borrowing capacity, monthly payment, and real transaction prices.",
    flowItems: [
      "Check cash surplus or shortage after closing costs and the cash you want to keep aside.",
      "Use the DSR/LTV calculator to retest borrowing capacity with income, debt, and target price.",
      "Once the loan amount is clear, use the mortgage payment calculator for monthly payment and total interest.",
      "Compare the safer search range with real transaction rankings and volume.",
    ],
  },
};

export default function HomeBuyingBudgetCalculatorPage() {
  const router = useRouter();
  const locale = router.locale === "en" ? "en" : "ko";
  const t = TEXT[locale];
  const pageUrl = "/tools/home-buying-budget-calculator";

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
        image="https://res.cloudinary.com/dwonflmnn/image/upload/v1780305922/blog/insight/og5utvm2syhksvkr38fg.png"
        locale={locale}
      />
      <JsonLd data={appJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <main className="tool-page">
        <div className="tool-header">
          <p className="mb-2 text-sm font-medium text-blue-600">
            {locale === "ko" ? "부동산 구매 예산" : "Home buying budget"}
          </p>
          <h1>{t.h1}</h1>
          <p>{t.lead}</p>
          <p className="mt-2 text-sm text-slate-500">{t.note}</p>
        </div>

        <DsrLtvCalculator
          locale={locale}
          initialPresetKey="first_home_600m"
          calculateEventName="home_buying_calculate"
          calculateSourceTool="homeBuying"
          commonSourceTool="homeBuying"
        />

        <section className="card min-w-0">
          <h2 className="break-words text-lg font-semibold">{t.flowTitle}</h2>
          <p className="mt-2 break-words text-sm text-slate-600">{t.flowLead}</p>
          <ol className="mt-4 grid gap-2 text-sm text-slate-700">
            {t.flowItems.map((item) => (
              <li key={item} className="break-words rounded-lg border border-slate-200 bg-slate-50 p-3">
                {item}
              </li>
            ))}
          </ol>
        </section>

        <section className="card min-w-0">
          <h2 className="break-words text-lg font-semibold">
            {locale === "ko" ? "집값을 보기 전에 확인할 6가지" : "Six checks before comparing prices"}
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {(locale === "ko"
              ? ["집값", "보유 현금", "연소득", "기존 대출", "금리·대출기간", "DSR·LTV"]
              : ["Home price", "Cash on hand", "Annual income", "Existing debt", "Rate & term", "DSR & LTV"]
            ).map((item) => (
              <div key={item} className="rounded-xl border bg-slate-50 p-3 text-sm font-semibold text-slate-800">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="card min-w-0">
          <h2 className="break-words text-lg font-semibold">{t.relatedTitle}</h2>
          <p className="mt-2 break-words text-sm text-slate-600">{t.relatedLead}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/tools/dsr-ltv-calculator" locale={locale} className="btn-primary">
              {locale === "ko" ? "LTV/DSR 계산기 열기" : "Open DSR/LTV calculator"}
            </Link>
            <Link href="/tools/mortgage-loan-calculator" locale={locale} className="btn-secondary">
              {locale === "ko" ? "주담대 원리금 계산하기" : "Mortgage payment"}
            </Link>
            <Link href="/market/real-estate/seoul-top100" locale={locale} className="btn-secondary">
              {locale === "ko" ? "서울 집값 순위" : "Seoul Top 100"}
            </Link>
            <Link href="/market/real-estate/magok-top100" locale={locale} className="btn-secondary">
              {locale === "ko" ? "마곡 집값 순위" : "Magok Top 100"}
            </Link>
            <Link href="/market/real-estate/gangnam3-top100" locale={locale} className="btn-secondary">
              {locale === "ko" ? "강남3구 집값 순위" : "Gangnam 3 Top 100"}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
