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
      "아파트 가격을 보기 전에 보유 현금, 주담대 한도, DSR, LTV, 월상환액을 한 번에 점검하세요. 기존 DSR/LTV 계산 코어로 구매 가능 여부와 안전 탐색 가격대를 함께 계산합니다.",
    note:
      "정책 자동 반영 도구가 아니라 사용자가 입력한 LTV, DSR, 금리, 기간을 기준으로 한 사전 점검입니다.",
    relatedTitle: "계산 후 함께 볼 페이지",
    relatedLead:
      "결과가 나오면 DSR/LTV 계산기에서 세부 조건을 다시 조정하고, 서울·마곡·송파·강남3구 집값 순위에서 실제 가격대를 비교하세요.",
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
      "After calculating, refine the assumptions in the DSR/LTV calculator and compare real transaction rankings.",
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
