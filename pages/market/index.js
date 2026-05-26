// pages/market/index.js
import Link from "next/link";
import { useRouter } from "next/router";
import JsonLd from "../../_components/JsonLd";
import SeoHead from "../../_components/SeoHead";

const SITE_URL = "https://www.finmaphub.com";

const TEXT = {
  ko: {
    title: "시장정보 | 아파트 실거래가·투자지표 대시보드",
    desc: "FinMap 시장정보 허브에서 서울·경기·인천 아파트 실거래가와 Top100 가이드, KOSPI·미국 주가지수, 환율·금리·원자재 지표를 함께 확인하세요.",
    h1: "시장정보 대시보드",
    intro: [
      "FinMap 시장정보는 부동산 실거래와 주요 투자지표를 한곳에서 연결해 보는 허브입니다.",
      "아파트 가격 흐름은 실거래 Top100과 지역별 가이드로 확인하고, KOSPI·미국 지수·환율·금리 데이터는 시장지표 페이지에서 가볍게 점검할 수 있습니다.",
    ],
    realEstate: "부동산 대시보드",
    realEstateSub: "서울·경기·인천 아파트 실거래를 기준으로 대표가격, 평단가, 거래량, 최근 거래월을 비교합니다.",
    realEstateNote: "Top100 가이드와 대시보드 필터를 함께 사용하면 지역, 평형, 기간 차이를 더 쉽게 볼 수 있습니다.",
    landingTitle: "지역별 아파트 Top100 가이드",
    landingLinks: [
      {
        href: "/market/real-estate/seoul-apartment-top100",
        title: "서울 아파트 실거래가 Top100",
        desc: "서울 전체 실거래 순위를 대표가격, 평단가, 거래량 기준으로 해석합니다.",
      },
      {
        href: "/market/real-estate/gyeonggi-apartment-top100",
        title: "경기 아파트 실거래가 Top100",
        desc: "경기도 주요 도시의 실거래 가격과 거래량 차이를 비교하는 방법을 정리했습니다.",
      },
      {
        href: "/market/real-estate/incheon-apartment-top100",
        title: "인천 아파트 실거래가 Top100",
        desc: "송도·청라·검단 등 인천 권역별 가격 흐름을 Top100 관점에서 확인합니다.",
      },
    ],
    indices: "주가지수·환율·금리 지표",
    indicesSub: "KOSPI와 미국 주요 지수, USD/KRW, 금리·원자재 흐름을 한 화면에서 점검합니다.",
    indicesNote: "상세 분석보다 주요 시장 흐름을 빠르게 확인하는 보조 대시보드로 간결하게 운영합니다.",
    open: "열기",
  },
  en: {
    title: "Financial and Real Estate Market Data",
    desc: "Explore Korean apartment transaction dashboards alongside KOSPI, U.S. indexes, FX, rates, and commodity indicators.",
    h1: "Market Data Dashboard",
    intro: [
      "FinMap connects Korean apartment transaction dashboards with key market indicators in one place.",
      "Use the real estate dashboard for apartment transaction rankings, and the market indicators page for a quick view of indexes, FX, rates, and commodities.",
    ],
    realEstate: "Real Estate Dashboard",
    realEstateSub: "Compare Seoul, Gyeonggi, and Incheon apartment transactions by representative price, price per pyeong, volume, and period.",
    realEstateNote: "Use the dashboard filters to compare regions, unit sizes, and periods more carefully.",
    landingTitle: "Regional apartment guides",
    landingLinks: [],
    indices: "Indexes, FX, and Rates",
    indicesSub: "Check KOSPI, major U.S. indexes, USD/KRW, rates, and commodities in a compact view.",
    indicesNote: "This page is kept as a lightweight indicator dashboard rather than a full research terminal.",
    open: "Open",
  },
};

export default function MarketHome() {
  const router = useRouter();
  const lang = router.locale === "en" ? "en" : "ko";
  const t = TEXT[lang];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: lang === "en" ? "Home" : "홈",
        item: `${SITE_URL}${lang === "en" ? "/en" : ""}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: lang === "en" ? "Market Data" : "시장정보",
        item: `${SITE_URL}${lang === "en" ? "/en" : ""}/market`,
      },
    ],
  };

  return (
    <>
      <SeoHead title={t.title} desc={t.desc} url="/market" locale={lang} />
      <JsonLd data={breadcrumbJsonLd} />

      <section className="mt-6 mb-10">
        <div>
          <h1 className="text-xl font-semibold text-slate-950 md:text-2xl">{t.h1}</h1>
          <div className="mt-2 max-w-3xl space-y-1 text-sm leading-6 text-slate-600">
            {t.intro.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="card p-4">
              <Link href="/market/real-estate" className="block transition-opacity hover:opacity-85">
                <div className="text-base font-semibold text-slate-950">{t.realEstate}</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">{t.realEstateSub}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t.realEstateNote}</p>
                <div className="mt-3 inline-block rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                  {t.open}
                </div>
              </Link>

              {t.landingLinks.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <h2 className="text-sm font-semibold text-slate-900">{t.landingTitle}</h2>
                  <div className="mt-3 grid gap-3">
                    {t.landingLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 transition-colors hover:border-blue-200 hover:bg-blue-50"
                      >
                        <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <Link href="/market/indices" className="card p-4 transition-shadow hover:shadow-md">
              <div className="text-base font-semibold text-slate-950">{t.indices}</div>
              <div className="mt-1 text-sm leading-6 text-slate-600">{t.indicesSub}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t.indicesNote}</p>
              <div className="mt-3 inline-block rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                {t.open}
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
