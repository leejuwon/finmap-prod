import Link from "next/link";
import SeoHead from "./SeoHead";
import JsonLd from "./JsonLd";

const SITE_URL = "https://www.finmaphub.com";

const calculatorLinks = [
  {
    href: "/tools/dsr-ltv-calculator",
    title: "DSR LTV 계산기",
    desc: "대출 가능액, DSR 부담, 매수 가능 가격을 함께 점검합니다.",
  },
  {
    href: "/tools/compound-interest",
    title: "복리 계산기",
    desc: "장기 자산 형성 시나리오를 수익률과 기간별로 확인합니다.",
  },
  {
    href: "/tools/dca-calculator",
    title: "적립식 투자 계산기",
    desc: "월 적립금과 투자 기간별 예상 결과를 계산합니다.",
  },
];

function JsonLdBlock({ data }) {
  return <JsonLd data={data} />;
}

export default function RealEstateSeoLanding({ page }) {
  const canonicalPath = `/market/real-estate/${page.slug}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "시장정보", item: `${SITE_URL}/market` },
      { "@type": "ListItem", position: 3, name: "부동산", item: `${SITE_URL}/market/real-estate` },
      { "@type": "ListItem", position: 4, name: page.h1, item: canonicalUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <SeoHead
        title={page.title}
        desc={page.description}
        url={canonicalPath}
        locale="ko"
        type="website"
        alternateLanguages={false}
      />
      <JsonLdBlock data={breadcrumbLd} />
      <JsonLdBlock data={faqLd} />

      <div className="mx-auto max-w-5xl">
        <section className="card">
          <div className="text-sm font-semibold text-blue-700">부동산 실거래 랜딩</div>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-950 md:text-3xl">
            {page.h1}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 md:text-base">
            {page.intro}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600">
            {page.badges.map((badge) => (
              <span key={badge} className="rounded-full border bg-white px-3 py-1">
                {badge}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="card">
            <h2 className="text-lg font-bold text-slate-950">1. 이 페이지에서 확인할 수 있는 것</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {page.canCheck.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-slate-950">2. 실거래가 Top100 기준 설명</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{page.top100Basis}</p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              단지별 총액 기준 순위는 큰 평형, 신축, 거래 표본수에 영향을 받을 수 있습니다.
              정확한 비교는 평형·년식·기간을 맞춰 보는 것이 좋습니다.
            </div>
          </div>
        </section>

        <section className="mt-5 card">
          <h2 className="text-lg font-bold text-slate-950">3. 대표가격/평단가/거래량 보는 법</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {page.metricGuide.map((item) => (
              <div key={item.title} className="rounded-xl border bg-white p-4">
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 card">
          <h2 className="text-lg font-bold text-slate-950">4. 대시보드로 이동</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{page.ctaDesc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/market/real-estate" className="btn-primary">
              부동산 대시보드 열기
            </Link>
            <Link href={page.rankingHref} className="btn-secondary">
              {page.rankingLabel}
            </Link>
          </div>
        </section>

        <section className="mt-5 card">
          <h2 className="text-lg font-bold text-slate-950">5. 관련 계산기</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {calculatorLinks.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl border bg-white p-4 hover:bg-slate-50">
                <div className="text-sm font-bold text-slate-950">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-5 card">
          <h2 className="text-lg font-bold text-slate-950">6. FAQ</h2>
          <div className="mt-4 space-y-3">
            {page.faqs.map((item) => (
              <details key={item.q} className="rounded-xl border bg-white p-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-950">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
