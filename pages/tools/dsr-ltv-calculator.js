import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SeoHead from "../../_components/SeoHead";
import DsrLtvCalculator from "../../_components/DsrLtvCalculator";
import { ToolCitationBox, ToolSharePanel } from "../../_components/ToolBacklinkKit";
import { trackGaEvent } from "../../utils/analytics";

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
    seoTitle: "DSR 계산기 | 주택담보대출 가능액·LTV·아파트 구매가격 계산",
    seoDesc:
      "연소득, 기존대출 월상환액, 주택담보대출 금리·기간으로 DSR과 대출 가능액을 계산하고 LTV·보유현금까지 반영해 아파트 구매가격을 점검하세요.",
    h1: "DSR 계산기: 연소득·기존대출·주택담보대출 가능액 계산",
    lead:
      "연소득, 기존대출 월상환액, 주택담보대출 금리와 기간을 입력해 DSR 기준 대출 가능액을 계산하고, LTV와 보유현금까지 함께 넣어 아파트 구매 가능 가격대를 확인합니다.",
    basis: "계산 기준일",
    note:
      "정책 자동 반영 없이 입력값 기준으로만 계산합니다. 실제 대출 심사 결과와 다를 수 있습니다.",
    relatedTitle: "부동산 대시보드와 함께 쓰기",
    relatedLead:
      "계산 결과의 안전 탐색 가격대를 확인한 뒤, 실거래 대시보드에서 서울·경기·인천 가격 분포와 거래량을 함께 비교하세요.",
    faqTitle: "DSR 계산기 FAQ",
    faqs: [
      {
        q: "DSR 계산기는 무엇인가요?",
        a: "DSR 계산기는 연소득 대비 1년 동안 갚아야 하는 모든 대출 원리금 비율을 추정하는 도구입니다. 이 페이지는 기존대출 월상환액과 신규 주택담보대출 월상환액을 합산해 DSR 사용률과 대출 가능액을 계산합니다.",
      },
      {
        q: "DSR 40%는 어떻게 계산하나요?",
        a: "연소득이 6,000만원이면 DSR 40% 기준 연간 원리금 한도는 2,400만원, 월 기준 약 200만원입니다. 기존대출 월상환액이 40만원이면 신규 주택담보대출에 쓸 수 있는 월상환 여력은 약 160만원으로 줄어듭니다.",
      },
      {
        q: "기존 신용대출도 DSR에 포함되나요?",
        a: "일반적으로 신용대출, 자동차 할부, 학자금대출처럼 매달 갚는 부채의 원리금은 DSR에 영향을 줍니다. 이 계산기에서는 기존대출 월상환액을 한 칸에 합산해 입력하는 방식으로 반영합니다.",
      },
      {
        q: "주택담보대출 월상환액은 어떻게 계산하나요?",
        a: "입력한 대출금리와 대출기간을 기준으로 원리금균등 상환 월상환액을 추정합니다. 원금균등, 만기일시, 거치식 상환은 현재 계산 범위에 포함하지 않습니다.",
      },
      {
        q: "LTV와 DSR은 무엇이 다른가요?",
        a: "LTV는 집값 대비 대출 비율이고, DSR은 소득 대비 원리금 상환 부담입니다. LTV를 통과해도 소득이나 기존부채 때문에 DSR에서 막힐 수 있고, 반대로 DSR은 여유가 있어도 보유현금과 LTV 때문에 구매 가능 가격이 낮아질 수 있습니다.",
      },
      {
        q: "실제 대출 가능액과 계산 결과가 다른 이유는 무엇인가요?",
        a: "이 계산기는 사용자가 입력한 LTV, DSR, 금리, 기간을 기준으로 한 단순 추정입니다. 실제 심사는 금융회사 기준, 신용도, 소득 인정 방식, 주택 유형, 지역, 보증 조건, 규제 적용 시점에 따라 달라질 수 있습니다.",
      },
      {
        q: "LTV와 DSR 값은 자동으로 반영되나요?",
        a: "아니요. 현재 계산기는 정책 자동 반영을 하지 않습니다. 사용자가 직접 확인한 LTV와 DSR 값을 입력하면 그 값을 그대로 사용합니다.",
      },
      {
        q: "대출 가능액 계산기는 어떤 순서로 쓰면 되나요?",
        a: "먼저 연소득과 기존대출 월상환액을 넣어 DSR 여력을 확인하고, 다음으로 보유현금·최소 남길 현금·LTV·부대비용률을 넣어 실제로 볼 수 있는 아파트 가격대를 좁히는 순서가 좋습니다.",
      },
      {
        q: "안전 탐색 가격대는 무엇인가요?",
        a: "계산된 구매 가능 가격 상한의 80~90% 구간입니다. 실제 심사 차이, 금리 변화, 부대비용, 협상 여지, 잔금 전 현금흐름을 고려하기 위한 보수적 탐색 범위입니다.",
      },
    ],
  },
  en: {
    seoTitle: "Korean Mortgage Affordability Calculator: DSR, LTV & Apartment Budget",
    seoDesc:
      "Estimate Korean apartment purchase budget and mortgage capacity with your cash, income, debt, interest rate, term, DSR, and LTV assumptions. Compare safer Seoul, Gyeonggi, and Incheon search ranges.",
    h1: "Korean Mortgage Affordability Calculator (DSR/LTV)",
    lead:
      "Use DSR and LTV assumptions to estimate loan capacity, maximum apartment purchase price, target-home feasibility, and a safer property search range before using the real estate dashboard.",
    basis: "Basis date",
    note:
      "This tool does not automatically apply policy updates. It only uses your inputs and may differ from real lender review.",
    relatedTitle: "Use it with the real estate dashboard",
    relatedLead:
      "After checking the safer price range, compare Seoul, Gyeonggi, and Incheon transaction distributions in the dashboard, then connect the budget to goal and compounding calculators.",
    faqTitle: "DSR/LTV calculator FAQ",
    faqs: [
      {
        q: "Does this calculator guarantee my actual loan amount?",
        a: "No. It is a simplified estimate based on user-entered LTV, DSR, rate, and term. Actual lender review can differ by credit, income recognition, existing debt, property type, location, and policy.",
      },
      {
        q: "Are LTV and DSR automatically updated?",
        a: "No. The current calculator does not automatically apply policy updates. It uses the LTV and DSR values you enter.",
      },
      {
        q: "What repayment method does this support?",
        a: "Only equal principal-and-interest repayment is supported in the current calculation scope.",
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
        image="https://res.cloudinary.com/dwonflmnn/image/upload/v1780305922/blog/insight/og5utvm2syhksvkr38fg.png"
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

        <ToolSharePanel toolId="dsrLtv" locale={locale} />

        {locale === "ko" && (
          <section className="card min-w-0">
            <h2 className="break-words text-lg font-semibold">DSR만 빠르게 계산</h2>
            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              DSR만 먼저 보려면 연소득, 기존대출 월상환액, 주택담보대출 금리, 대출기간,
              DSR 한도를 입력하세요. 계산기는 연소득에서 허용되는 연간 원리금 한도를 구한 뒤,
              기존대출 상환액을 빼고 남은 월상환 여력으로 신규 주택담보대출 가능액을 추정합니다.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-slate-50 p-3">
                <h3 className="text-sm font-semibold">1. 소득 기준 한도</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  연소득 × DSR 한도율로 1년 원리금 상환 가능액을 계산합니다.
                </p>
              </div>
              <div className="rounded-xl border bg-slate-50 p-3">
                <h3 className="text-sm font-semibold">2. 기존대출 차감</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  신용대출·자동차 할부 등 기존 월상환액을 먼저 빼야 신규 주담대 여력이 보입니다.
                </p>
              </div>
              <div className="rounded-xl border bg-slate-50 p-3">
                <h3 className="text-sm font-semibold">3. 주담대 가능액</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  남은 월상환액을 금리·기간 기준 원리금균등 공식으로 대출원금으로 환산합니다.
                </p>
              </div>
            </div>
          </section>
        )}

        <DsrLtvCalculator locale={locale} />

        {locale === "ko" && (
          <section className="card min-w-0">
            <h2 className="break-words text-lg font-semibold">DSR 계산식과 DSR 40% 예시</h2>
            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              DSR은 <strong>연간 모든 대출 원리금 상환액 ÷ 연소득 × 100</strong>으로 계산합니다.
              예를 들어 연소득 6,000만원에 DSR 40%를 적용하면 연간 원리금 한도는
              2,400만원, 월 기준 약 200만원입니다. 기존대출 월상환액이 40만원이면
              신규 주택담보대출에 사용할 수 있는 월상환 여력은 약 160만원입니다.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="border p-2">항목</th>
                    <th className="border p-2">예시 입력값</th>
                    <th className="border p-2">계산 의미</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">연소득</td>
                    <td className="border p-2">6,000만원</td>
                    <td className="border p-2">DSR 한도의 기준 소득</td>
                  </tr>
                  <tr>
                    <td className="border p-2">DSR 한도</td>
                    <td className="border p-2">40%</td>
                    <td className="border p-2">연간 원리금 상환 가능액 2,400만원</td>
                  </tr>
                  <tr>
                    <td className="border p-2">기존대출 월상환액</td>
                    <td className="border p-2">40만원</td>
                    <td className="border p-2">신규 주담대 월상환 여력에서 차감</td>
                  </tr>
                  <tr>
                    <td className="border p-2">신규 주담대 월상환 여력</td>
                    <td className="border p-2">약 160만원</td>
                    <td className="border p-2">금리·기간을 넣어 대출원금으로 환산</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <section className="rounded-xl border p-4">
                <h2 className="break-words text-base font-semibold">주택담보대출 계산기</h2>
                <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                  주택담보대출 계산기로 쓸 때는 금리와 대출기간을 보수적으로 넣고,
                  기존대출 월상환액을 빠뜨리지 않는 것이 중요합니다. 월상환액이 커질수록
                  DSR 기준 대출 가능액은 줄어듭니다.
                </p>
              </section>
              <section className="rounded-xl border p-4">
                <h2 className="break-words text-base font-semibold">대출 가능액 계산기</h2>
                <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                  대출 가능액은 DSR만으로 끝나지 않습니다. 보유현금, 최소 남길 현금,
                  부대비용률, LTV를 함께 넣어야 실제 매수 가능한 아파트 가격대가 보입니다.
                </p>
              </section>
              <section className="rounded-xl border p-4">
                <h2 className="break-words text-base font-semibold">LTV 계산기</h2>
                <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                  LTV는 집값 대비 대출 비율입니다. 예를 들어 LTV 60%를 입력하면
                  후보 주택 가격의 60%까지만 대출로 조달한다고 가정합니다.
                </p>
              </section>
            </div>
          </section>
        )}

        <section className="card min-w-0">
          <h2 className="break-words text-lg font-semibold">{t.relatedTitle}</h2>
          <p className="mt-2 break-words text-sm text-slate-600">{t.relatedLead}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/market/real-estate"
              locale={locale}
              className="btn-primary"
              onClick={() =>
                trackGaEvent("dsr_to_dashboard_click", {
                  source_tool: "dsr_ltv",
                  locale,
                  location: "related_section",
                })
              }
            >
              {locale === "ko" ? "부동산 대시보드 열기" : "Open real estate dashboard"}
            </Link>
            {locale === "en" && (
              <>
                <Link
                  href="/tools/goal-simulator"
                  locale={locale}
                  className="btn-secondary"
                >
                  Goal amount calculator
                </Link>
                <Link
                  href="/tools/compound-interest"
                  locale={locale}
                  className="btn-secondary"
                >
                  Compound interest calculator
                </Link>
              </>
            )}
            <Link
              href="/posts/personalFinance/dsr-40-income-loan-limit-table"
              locale={locale}
              className="btn-secondary"
            >
              {locale === "ko" ? "DSR 계산기 연봉별 한도표" : "DSR 40% income table"}
            </Link>
            <Link
              href="/posts/personalFinance/interest-rate-1p-loan-limit-impact"
              locale={locale}
              className="btn-secondary"
            >
              {locale === "ko" ? "금리 1%p 영향 보기" : "Rate +1pp impact"}
            </Link>
            <Link
              href="/posts/personalFinance/mortgage-risk-checklist-dsr-variable"
              locale={locale}
              className="btn-secondary"
            >
              {locale === "ko" ? "주택담보대출 계산기 체크리스트" : "Mortgage risk checklist"}
            </Link>
            <Link
              href="/posts/personalFinance/apt-dashboard-home-goal-roadmap"
              locale={locale}
              className="btn-secondary"
            >
              {locale === "ko" ? "내 집 마련 목표 로드맵" : "Home-buying roadmap"}
            </Link>
            <Link
              href="/posts/personalFinance/cash-100m-200m-300m-apartment-budget"
              locale={locale}
              className="btn-secondary"
            >
              {locale === "ko" ? "주택담보대출 가능액 계산기 예산표" : "Apartment budget by available cash"}
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

        <ToolCitationBox toolId="dsrLtv" locale={locale} />
      </main>
    </>
  );
}
