//pages/market/index.js
import Link from "next/link";
import { useRouter } from "next/router";
import SeoHead from "../../_components/SeoHead";

const TEXT = {
  ko: {
    title: "시장정보",
    desc: "부동산과 주가지수를 한 곳에서. (현재: 부동산)",
    card1: "부동산 대시보드",
    card1sub: "서울(동) · 경기(시/군) Top100 / 월·연",
    card2: "주가지수 대시보드",
    card2sub: "준비중",
    coming: "준비중",
  },
  en: {
    title: "Market Info",
    desc: "Real estate and stock indexes in one place. (Now: Real Estate)",
    card1: "Real Estate Dashboard",
    card1sub: "Seoul (Dong) · Gyeonggi (City/County) Top100 / Monthly & Yearly",
    card2: "Index Dashboard",
    card2sub: "Coming soon",
    coming: "Coming soon",
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
        <div className="card">
          <h1 className="text-xl md:text-2xl font-semibold">{t.title}</h1>
          <p className="text-sm text-slate-600 mt-2">{t.desc}</p>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Link href="/market/real-estate" className="card hover:shadow-md transition-shadow">
              <div className="text-base font-semibold">{t.card1}</div>
              <div className="text-sm text-slate-600 mt-1">{t.card1sub}</div>
              <div className="mt-3 inline-block text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                Open
              </div>
            </Link>

            <div className="card opacity-60">
              <div className="text-base font-semibold">{t.card2}</div>
              <div className="text-sm text-slate-600 mt-1">{t.card2sub}</div>
              <div className="mt-3 inline-block text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {t.coming}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
