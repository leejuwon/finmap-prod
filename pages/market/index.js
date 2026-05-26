// pages/market/index.js
import Link from "next/link";
import { useRouter } from "next/router";
import SeoHead from "../../_components/SeoHead";

const TEXT = {
  ko: {
    title: "금융·부동산 시장정보",
    desc: "부동산 실거래 대시보드와 KOSPI·미국 지수·환율·금리·원자재 시장지표를 한곳에서 확인하세요.",
    realEstate: "부동산 대시보드",
    realEstateSub: "서울·경기·인천 아파트 실거래 Top100 / 월간·연간",
    indices: "시장지표 대시보드",
    indicesSub: "KOSPI, 미국 지수, 환율, 금리, 원자재 최신 수집 데이터",
    open: "Open",
  },
  en: {
    title: "Financial and Real Estate Market Data",
    desc: "Explore Korean apartment transaction dashboards alongside KOSPI, U.S. indexes, FX, rates, and commodity indicators.",
    realEstate: "Real Estate Dashboard",
    realEstateSub: "Seoul, Gyeonggi, and Incheon apartment Top 100 / Monthly & Yearly",
    indices: "Market Indicators Dashboard",
    indicesSub: "Latest KOSPI, U.S. indexes, FX, rates, and commodity data",
    open: "Open",
  },
};

export default function MarketHome() {
  const router = useRouter();
  const lang = router.locale === "en" ? "en" : "ko";
  const t = TEXT[lang];

  return (
    <>
      <SeoHead title={t.title} desc={t.desc} url="/market" locale={lang} />
      <section className="mt-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-950 md:text-2xl">{t.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{t.desc}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Link href="/market/real-estate" className="card p-4 transition-shadow hover:shadow-md">
              <div className="text-base font-semibold text-slate-950">{t.realEstate}</div>
              <div className="mt-1 text-sm text-slate-600">{t.realEstateSub}</div>
              <div className="mt-3 inline-block rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                {t.open}
              </div>
            </Link>

            <Link href="/market/indices" className="card p-4 transition-shadow hover:shadow-md">
              <div className="text-base font-semibold text-slate-950">{t.indices}</div>
              <div className="mt-1 text-sm text-slate-600">{t.indicesSub}</div>
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
