// _components/RealEstateTop100Landing.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import ToolSeo from "./ToolSeo";

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function ymLabel(ym) {
  const s = String(ym || "");
  if (!/^\d{6}$/.test(s)) return s || "-";
  return `${s.slice(0, 4)}-${s.slice(4, 6)}`;
}
function fmtEokFromWon(won, lang) {
  const n = toNum(won);
  if (n == null) return "-";
  const eok = n / 100_000_000;
  const v = eok.toFixed(3);
  return lang === "en" ? `${v}×100M KRW` : `${v}억원`;
}
function fmtEokFromMan(man, lang) {
  const n = toNum(man);
  if (n == null) return "-";
  const eok = n / 10_000;
  const v = eok.toFixed(3);
  return lang === "en" ? `${v}×100M KRW` : `${v}억원`;
}
function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-900">
        {value ?? "-"}
      </div>
    </div>
  );
}

function Badge({ tone, label, value }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${tone}`}
      title={`${label}: ${value}`}
    >
      <span className="opacity-80">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

/**
 * Props:
 * - region: { slug, nameKo, nameEn, detailSido? }
 * - text:   { ko: {...}, en: {...} } (title/desc/h1/sub/bullets/cols/cta/faqs...)
 * - seo:    { image, about, keywordsKo, keywordsEn, appCategory? }
 * - relatedLinks: [{ href, labelKo, labelEn }]
 * - period, band, rows
 */
export default function RealEstateTop100Landing({
  region,
  text,
  seo,
  relatedLinks = [],
  period,
  band,
  rows,
}) {
  const router = useRouter();
  const lang = (router.locale || "ko").startsWith("en") ? "en" : "ko";
  const t = (text && text[lang]) || (text && text.ko) || {};

  const list = Array.isArray(rows) ? rows : [];
  const detailSido = region?.detailSido || "11";

  const basePath = `/market/real-estate/${region?.slug || ""}`;
  const canonical =
    lang === "en"
      ? `https://www.finmaphub.com/en${basePath}`
      : `https://www.finmaphub.com${basePath}`;

  // ✅ 기본 카드 / 데스크탑에서만 표 토글
  const VIEW_KEY = `re_landing_view_${region?.slug || "top100"}`;
  const [desktopView, setDesktopView] = useState("card"); // 'card' | 'table'
  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = window.localStorage.getItem(VIEW_KEY);
    if (v === "card" || v === "table") setDesktopView(v);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VIEW_KEY, desktopView);
  }, [desktopView]);

  const scopeText =
    lang === "en" ? region?.nameEn || "" : region?.nameKo || region?.nameEn || "";

  // JSON-LD
  const breadcrumbsLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: lang === "en" ? "Home" : "홈",
          item: lang === "en" ? "https://www.finmaphub.com/en" : "https://www.finmaphub.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: lang === "en" ? "Market" : "시장정보",
          item: lang === "en" ? "https://www.finmaphub.com/en/market" : "https://www.finmaphub.com/market",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: lang === "en" ? "Real Estate" : "부동산",
          item: lang === "en" ? "https://www.finmaphub.com/en/market/real-estate" : "https://www.finmaphub.com/market/real-estate",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: t.h1 || "",
          item: canonical,
        },
      ],
    };
  }, [lang, t.h1, canonical]);

  const faqLd = useMemo(() => {
    const faqs = Array.isArray(t.faqs) ? t.faqs : [];
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((x) => ({
        "@type": "Question",
        name: x.q,
        acceptedAnswer: { "@type": "Answer", text: x.a },
      })),
    };
  }, [t.faqs]);

  const keywords =
    lang === "en" ? (seo?.keywordsEn || "") : (seo?.keywordsKo || "");

  const badgeLabels = useMemo(() => {
    return lang === "en"
      ? { median: "Median", latest: "Latest", tx: "Tx" }
      : { median: "대표가격", latest: "최근거래", tx: "거래량" };
  }, [lang]);

  function makeDetailHref(r) {
    const aptKey = encodeURIComponent(String(r?.apt_key || ""));
    return `/market/real-estate/apt/${aptKey}?timeframe=month&period=${encodeURIComponent(
      String(period || "")
    )}&band=${encodeURIComponent(String(band || "all"))}&sido=${encodeURIComponent(detailSido)}`;
  }

  return (
    <>
      <ToolSeo
        title={t.title}
        desc={t.desc}
        image={seo?.image}
        appName={t.title}
        appCategory={seo?.appCategory || "FinanceApplication"}
        about={seo?.about || { "@type": "Place", name: "South Korea" }}
        keywords={keywords}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbsLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }}
      />

      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900">{t.h1}</h1>
        <p className="mt-1 text-slate-600">{t.sub}</p>

        <div className="mt-4 rounded-xl border bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-700">
            {t.updated}: <span className="font-bold">{ymLabel(period)}</span>
            <span className="ml-2 text-slate-500">
              {lang === "en" ? `(Size band: ${band})` : `(평형 밴드: ${band})`}
            </span>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {(t.bullets || []).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {lang === "en" ? "Scope" : "범위"}: {scopeText}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {lang === "en" ? "Rows" : "건수"}: {list.length}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">{t.tableTitle}</h2>
          <div className="hidden md:flex items-center gap-2">
            <button
              className={`px-3 py-2 rounded-lg border ${
                desktopView === "card"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white hover:bg-slate-50"
              }`}
              onClick={() => setDesktopView("card")}
            >
              {lang === "en" ? "Cards" : "카드"}
            </button>
            <button
              className={`px-3 py-2 rounded-lg border ${
                desktopView === "table"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white hover:bg-slate-50"
              }`}
              onClick={() => setDesktopView("table")}
            >
              {lang === "en" ? "Table" : "표"}
            </button>
          </div>
        </div>

        {/* ✅ Cards: 모바일 기본(항상) + 데스크탑 카드뷰 */}
        <div
          className={`${
            desktopView === "card" ? "" : "md:hidden"
          } mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3`}
        >
          {!list.length && (
            <div className="card text-center text-slate-500 py-10 md:col-span-2 lg:col-span-3">
              {lang === "en" ? "No data" : "데이터 없음"}
            </div>
          )}

          {list.map((r, i) => {
            const latestDate = r?.latest_deal_date
              ? String(r.latest_deal_date).slice(0, 10)
              : "-";
            const build = r?.build_year ?? "-";
            const tx = r?.tx_count?.toLocaleString?.() ?? r?.tx_count ?? "-";

            const medianVal = fmtEokFromWon(r?.median_price, lang);
            const latestVal = fmtEokFromMan(r?.latest_deal_amount_man, lang);

            return (
              <div key={`${r?.apt_key || ""}-${i}`} className="card p-4">
                <div className="text-xs text-slate-500">
                  {i + 1}. {r?.sigungu_name || "-"}
                </div>
                <Link
                  href={makeDetailHref(r)}
                  className="mt-0.5 block text-base font-semibold text-slate-900 hover:underline underline-offset-2 truncate"
                  title={r?.apt_name || ""}
                >
                  {r?.apt_name || "-"}
                </Link>

                {/* ✅ 검색의도 핵심 3개: 대표가격/최근거래/거래량 "강조 뱃지" */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    tone="bg-emerald-50 text-emerald-700"
                    label={badgeLabels.median}
                    value={medianVal}
                  />
                  <Badge
                    tone="bg-sky-50 text-sky-700"
                    label={badgeLabels.latest}
                    value={latestVal}
                  />
                  <Badge
                    tone="bg-amber-50 text-amber-700"
                    label={badgeLabels.tx}
                    value={tx}
                  />
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <MiniStat label={t.cols.latestDate} value={latestDate} />
                  <MiniStat label={t.cols.build} value={build} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ Table: 데스크탑 선택 */}
        {desktopView === "table" && (
          <div className="hidden md:block mt-3 overflow-x-auto rounded-2xl border bg-white">
            <table className="min-w-[980px] w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-3 py-3">{t.cols.rank}</th>
                  <th className="px-3 py-3">{t.cols.sigungu}</th>
                  <th className="px-3 py-3">{t.cols.apt}</th>
                  <th className="px-3 py-3">{t.cols.latestDeal}</th>
                  <th className="px-3 py-3">{t.cols.latestDate}</th>
                  <th className="px-3 py-3">{t.cols.median}</th>
                  <th className="px-3 py-3">{t.cols.tx}</th>
                  <th className="px-3 py-3">{t.cols.build}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r, i) => (
                  <tr
                    key={`${r?.apt_key || ""}-${i}`}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="px-3 py-3">{i + 1}</td>
                    <td className="px-3 py-3">{r?.sigungu_name || "-"}</td>
                    <td className="px-3 py-3 font-medium">
                      <Link
                        href={makeDetailHref(r)}
                        className="underline underline-offset-2"
                      >
                        {r?.apt_name || "-"}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      {fmtEokFromMan(r?.latest_deal_amount_man, lang)}
                    </td>
                    <td className="px-3 py-3">
                      {r?.latest_deal_date ? String(r.latest_deal_date).slice(0, 10) : "-"}
                    </td>
                    <td className="px-3 py-3">{fmtEokFromWon(r?.median_price, lang)}</td>
                    <td className="px-3 py-3">
                      {r?.tx_count?.toLocaleString?.() ?? r?.tx_count ?? "-"}
                    </td>
                    <td className="px-3 py-3">{r?.build_year ?? "-"}</td>
                  </tr>
                ))}
                {!list.length && (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-slate-500">
                      {lang === "en" ? "No data" : "데이터 없음"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 rounded-2xl border bg-white p-4">
          <div className="text-sm font-semibold text-slate-900">{t.ctaTitle}</div>
          <div className="mt-1 text-sm text-slate-600">{t.ctaDesc}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/market/real-estate"
              className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              {t.ctaBtn}
            </Link>
            {relatedLinks.map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                {lang === "en" ? x.labelEn : x.labelKo}
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <h2 className="mt-8 text-lg font-bold text-slate-900">{t.faqTitle}</h2>
        <div className="mt-3 space-y-3">
          {(t.faqs || []).map((x) => (
            <div key={x.q} className="rounded-2xl border bg-white p-4">
              <div className="font-semibold text-slate-900">{x.q}</div>
              <div className="mt-1 text-sm text-slate-600">{x.a}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}