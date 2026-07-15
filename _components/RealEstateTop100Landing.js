// _components/RealEstateTop100Landing.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import ToolSeo from "./ToolSeo";
import { trackGaEvent } from "../utils/analytics";

const M2_PER_PYEONG = 3.305785;
const DETAIL_STATE_STORAGE_KEY = "finmap:real-estate:apt-detail-state";
const REAL_ESTATE_TO_DSR_REGIONS = {
  "seoul-top100": "seoul",
  "magok-top100": "magok",
  "songpa-top100": "songpa",
  "gangnam3-top100": "gangnam3",
};

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
    <div className="min-w-0 max-w-full rounded-xl border border-slate-100 bg-white px-3 py-2">
      <div className="break-words text-[11px] leading-snug text-slate-500">{label}</div>
      <div className="mt-0.5 break-words text-sm font-semibold text-slate-900">
        {value ?? "-"}
      </div>
    </div>
  );
}

function Badge({ tone, label, value }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium leading-tight whitespace-normal break-words ${tone}`}
      title={`${label}: ${value}`}
    >
      <span className="opacity-80">{label}</span>
      <span className="font-semibold break-words">{value}</span>
    </span>
  );
}

function DsrLtvFunnelCta({ regionKey, sourcePage, lang }) {
  if (!regionKey) return null;

  const href = `/tools/dsr-ltv-calculator?region=${encodeURIComponent(regionKey)}`;
  const title =
    lang === "en"
      ? "Can I buy in this area with my income?"
      : "이 지역 아파트, 내 연봉으로 살 수 있을까?";
  const desc =
    lang === "en"
      ? "Use a representative regional price assumption to estimate LTV, DSR, and monthly mortgage payment."
      : "지역 대표 가격 기준으로 LTV·DSR·월상환액을 계산해보세요.";
  const button = lang === "en" ? "Calculate affordability" : "내 구매 가능액 계산하기";

  return (
    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-sm font-semibold text-emerald-950">{title}</div>
      <p className="mt-1 break-words text-sm leading-6 text-emerald-900">{desc}</p>
      <div className="mt-3">
        <Link
          href={href}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-800"
          onClick={() =>
            trackGaEvent("real_estate_to_dsr_click", {
              region: regionKey,
              source_page: sourcePage,
              source_tool: "realEstateDashboard",
            })
          }
        >
          {button}
        </Link>
      </div>
    </div>
  );
}

function pushQuery(router, next = {}, removeKeys = []) {
  const q = { ...router.query, ...next };
  for (const k of removeKeys) delete q[k];
  // undefined/null/"" 제거 (URL 깔끔하게)
  for (const k of Object.keys(q)) {
    const v = q[k];
    if (v === undefined || v === null || v === "") delete q[k];
  }
  router.push({ pathname: router.pathname, query: q }, undefined, { scroll: false });
}


/**
 * Props:
 * - region: { slug, nameKo, nameEn, detailSido? }
 * - text:   { ko: {...}, en: {...} } (title/desc/h1/sub/bullets/cols/cta/faqs...)
 * - seo:    { image, about, keywordsKo, keywordsEn, appCategory? }
 * - relatedLinks: [{ href, labelKo, labelEn }]
 * - period(=latestYm), band, rows
 * - rangeKey, fromYm, toYm, rangeLabelKo, rangeLabelEn, year
 */
export default function RealEstateTop100Landing({
  region,
  text,
  seo,
  relatedLinks = [],
  period,
  band,
  rows,
  rangeKey = "pm",
  fromYm,
  toYm,
  rangeLabelKo,
  rangeLabelEn,
  year,
}) {
  const router = useRouter();
  const lang = (router.locale || "ko").startsWith("en") ? "en" : "ko";
  const t = (text && text[lang]) || (text && text.ko) || {};

  const list = Array.isArray(rows) ? rows : [];
  const detailSido = region?.detailSido || "11";

  // band select
  const effectiveBand = useMemo(() => {
    const q = String(router.query.band || "").trim();
    return q || String(band || "all");
  }, [router.query.band, band]);

  // range select (5 options)
  const effectiveRangeKey = useMemo(() => {
    const q = String(router.query.range || "").trim();
    return q || String(rangeKey || "pm");
  }, [router.query.range, rangeKey]);

  const bandOptions = useMemo(() => {
    return [
      { value: "all", labelKo: "전체", labelEn: "All sizes" },
      { value: "10", labelKo: "10평대", labelEn: "Band 10" },
      { value: "20", labelKo: "20평대", labelEn: "Band 20" },
      { value: "30", labelKo: "30평대", labelEn: "Band 30" },
      { value: "40", labelKo: "40평대", labelEn: "Band 40" },
      { value: "50", labelKo: "50평대", labelEn: "Band 50" },
    ];
  }, []);

  const bandLabel = useMemo(() => {
    const opt = bandOptions.find((x) => String(x.value) === String(effectiveBand));
    return opt ? (lang === "en" ? opt.labelEn : opt.labelKo) : String(effectiveBand || "all");
  }, [bandOptions, effectiveBand, lang]);

  const sizeColLabel = useMemo(() => {
    // "밴드"가 아니라 "단지 최근거래 평형(전용면적)"을 보여주려는 의도라 라벨을 명확히
    return lang === "en" ? "Latest size" : "최근거래 평형";
  }, [lang]);

  function fmtPyeongFromM2(m2) {
    const n = toNum(m2);
    if (n == null) return null;
    return (n / M2_PER_PYEONG).toFixed(1);
  }

  function fmtSizeFromRow(r) {
    // ✅ 우선순위: row에 최신 전용면적이 있으면 그걸 사용
    const m2 = toNum(r?.latest_area_m2);
    if (m2 != null) {
      const py = fmtPyeongFromM2(m2);
      if (lang === "en") return `${m2.toFixed(1)}㎡ · ${py} pyeong`;
      return `${m2.toFixed(1)}㎡ · ${py}평`;
    }
    // ✅ 없으면 현재 선택 밴드 라벨로 fallback
    return bandLabel;
  }


  const rangeOptions = useMemo(() => {
    const yy = String(year || String(period || "").slice(0, 4) || "");
    return [
      { value: "pm", labelKo: "전월(기본)", labelEn: "Prev month (default)" },
      { value: "m3", labelKo: "최근 3개월", labelEn: "Last 3 months" },
      { value: "m6", labelKo: "최근 6개월", labelEn: "Last 6 months" },
      { value: "y1", labelKo: "최근 1년", labelEn: "Last 12 months" },
      { value: "ytd", labelKo: `${yy}년`, labelEn: `${yy} (YTD)` },
    ];
  }, [year, period]);

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
  const dsrRegionKey = REAL_ESTATE_TO_DSR_REGIONS[region?.slug || ""];

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
    return `/market/real-estate/apt/${aptKey}`;
  }

  function rememberDetailState() {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(
        DETAIL_STATE_STORAGE_KEY,
        JSON.stringify({
          timeframe: "month",
          period: String(period || ""),
          band: String(effectiveBand || "all"),
          ts: Date.now(),
        })
      );
    } catch {}
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
        canonical={canonical}  // ✅ 쿼리스트링 없는 대표 URL
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

        {/* ✅ SEO용 자연스러운 본문 문장(3~5줄) */}
        {Array.isArray(t.introLines) && t.introLines.length > 0 && (
          <div className="mt-3 space-y-1 text-sm text-slate-700 leading-6">
            {t.introLines.map((s) => (
              <p key={s}>{s}</p>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-xl border bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-700">
            {t.updated}: <span className="font-bold">{ymLabel(period)}</span>
            <span className="ml-2 text-slate-500">
              {lang === "en" ? `(Size band: ${bandLabel})` : `(평형: ${bandLabel})`}             
            </span>
          </div>
          {/* ✅ "업데이트 기준은 항상 전월" + 집계범위 */}
          <div className="mt-2 text-xs text-slate-600">
            * {lang === "en"
              ? `Update anchor is always the latest available month (${ymLabel(period)}). (Data pipeline)`
              : `업데이트 기준(앵커)은 항상 전월(${ymLabel(period)})입니다. (데이터 생성 스케줄 때문)`}
          </div>
          <div className="mt-1 text-xs text-slate-600">
            {lang === "en"
              ? `Aggregation range: ${ymLabel(fromYm)} ~ ${ymLabel(toYm)} (${rangeLabelEn || ""})`
              : `집계 범위: ${ymLabel(fromYm)} ~ ${ymLabel(toYm)} (${rangeLabelKo || ""})`}
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {(t.bullets || []).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        {/* ✅ 기간 선택 (5개) */}
        <div className="mt-3 grid grid-cols-1 gap-2 min-[390px]:grid-cols-2 md:flex md:flex-wrap md:items-end">
          <label className="min-w-0">
            <div className="mb-1 text-xs text-slate-500">
              {lang === "en" ? "Range" : "기간"}
            </div>
            <select
              className="w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm"
              value={effectiveRangeKey}
              onChange={(e) => {
                const v = e.target.value;
                // ✅ pm은 range query를 "삭제"해야 다시 선택 가능
                if (v === "pm") pushQuery(router, {}, ["range"]);
                else pushQuery(router, { range: v });
              }}
            >
              {rangeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {lang === "en" ? o.labelEn : o.labelKo}
                </option>
              ))}
            </select>
          </label>

          {/* ✅ 평형(band) 선택 */}
          <label className="min-w-0">
            <div className="mb-1 text-xs text-slate-500">
              {lang === "en" ? "Size" : "평형"}
            </div>
            <select
              className="w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm"
              value={String(effectiveBand || "all")}
              onChange={(e) => {
                const v = e.target.value;
                // all은 query에서 제거(깔끔하게)
                if (v === "all") pushQuery(router, {}, ["band"]);
                else pushQuery(router, { band: v });
              }}
            >
              {bandOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {lang === "en" ? o.labelEn : o.labelKo}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex min-w-0 flex-wrap items-center gap-2 text-sm">
          <span className="max-w-full rounded-full bg-slate-100 px-3 py-1 text-slate-700 break-words">
            {lang === "en" ? "Scope" : "범위"}: {scopeText}
          </span>
          <span className="max-w-full rounded-full bg-slate-100 px-3 py-1 text-slate-700 break-words">
            {lang === "en" ? "Rows" : "건수"}: {list.length}
          </span>
        </div>

        <DsrLtvFunnelCta
          regionKey={dsrRegionKey}
          sourcePage={basePath}
          lang={lang}
        />

        <div className="mt-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="min-w-0 break-words text-lg font-bold text-slate-900">{t.tableTitle}</h2>
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
            const sizeText = fmtSizeFromRow(r);

            const medianVal = fmtEokFromWon(r?.median_price, lang);
            const latestVal = fmtEokFromMan(r?.latest_deal_amount_man, lang);

            return (
              <div key={`${r?.apt_key || ""}-${i}`} className="card p-4 min-w-0 max-w-full">
                <div className="break-words text-xs text-slate-500">
                  {i + 1}. {r?.sigungu_name || "-"}
                </div>
                <Link
                  href={makeDetailHref(r)}
                  onClick={rememberDetailState}
                  className="mt-0.5 block max-h-[2.75rem] min-w-0 overflow-hidden text-base font-semibold leading-snug text-slate-900 hover:underline underline-offset-2 whitespace-normal break-words"
                  title={r?.apt_name || ""}
                >
                  {r?.apt_name || "-"}
                </Link>

                {/* ✅ 평형(단지의 최근거래 전용면적 기반, 없으면 밴드 fallback) */}                 
                <div className="mt-1 break-words text-xs text-slate-500">
                  {sizeColLabel}: <span className="font-semibold text-slate-700">{sizeText}</span>                
                </div>

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

                <div className="mt-2 grid grid-cols-1 gap-2 min-[390px]:grid-cols-2 md:grid-cols-3">
                  <MiniStat label={t.cols.latestDate} value={latestDate} />
                  <MiniStat label={t.cols.build} value={build} />
                  <MiniStat label={sizeColLabel} value={sizeText} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ Table: 데스크탑 선택 */}
        {desktopView === "table" && (
          <div className="hidden md:block mt-3 max-w-full overflow-x-auto rounded-2xl border bg-white">
            <table className="min-w-[980px] w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-3 py-3">{t.cols.rank}</th>
                  <th className="px-3 py-3">{t.cols.sigungu}</th>
                  <th className="px-3 py-3">{t.cols.apt}</th>
                  <th className="px-3 py-3">{sizeColLabel}</th>
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
                        onClick={rememberDetailState}
                        className="underline underline-offset-2"
                      >
                        {r?.apt_name || "-"}
                      </Link>
                    </td>
                    <td className="px-3 py-3">{fmtSizeFromRow(r)}</td>
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
                    <td colSpan={9} className="px-3 py-10 text-center text-slate-500">                     
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
          <div className="mt-3 grid grid-cols-1 gap-2 min-[390px]:grid-cols-2 sm:flex sm:flex-wrap">
            <Link
              href="/market/real-estate"
              className="inline-flex min-h-[44px] min-w-0 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white"
            >
              {t.ctaBtn}
            </Link>
            {relatedLinks.map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="inline-flex min-h-[44px] min-w-0 items-center justify-center rounded-xl border px-4 py-2 text-center text-sm font-semibold hover:bg-slate-50"
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
