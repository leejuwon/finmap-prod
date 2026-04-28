import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import SeoHead from "../../_components/SeoHead";

const GROUP_ORDER = ["KR", "US", "MACRO"];

const CODE_GROUP = {
  KOSPI: "KR",
  SP500: "US",
  NASDAQ: "US",
  DOW: "US",
  DXY: "MACRO",
  WTI: "MACRO",
  USDKRW: "MACRO",
  US10Y: "MACRO",
};

const CODE_LABELS = {
  ko: {
    KOSPI: "코스피",
    SP500: "S&P 500",
    NASDAQ: "나스닥",
    DOW: "다우존스",
    DXY: "달러 인덱스",
    WTI: "WTI 유가",
    USDKRW: "원/달러 환율",
    US10Y: "미국 10년물 금리",
  },
  en: {
    KOSPI: "KOSPI",
    SP500: "S&P 500",
    NASDAQ: "Nasdaq",
    DOW: "Dow Jones",
    DXY: "Dollar Index",
    WTI: "WTI Crude Oil",
    USDKRW: "USD/KRW",
    US10Y: "U.S. 10Y Treasury Yield",
  },
};

const TEXT = {
  ko: {
    seoTitle: "시장정보 대시보드",
    seoDesc: "선택일 코스피와 전일 글로벌 시장, 환율, 금리, 원자재 지표를 함께 확인합니다.",
    title: "시장정보 대시보드",
    subtitle: "선택일 코스피와 선택일 전일의 글로벌 지표를 함께 보여줍니다.",
    back: "시장정보 홈",
    refresh: "새로고침",
    loading: "시장 데이터를 불러오는 중입니다.",
    empty: "해당 날짜의 시장 데이터가 없습니다.",
    error: "시장 데이터를 불러오지 못했습니다.",
    retry: "다시 시도",
    dateLabel: "코스피 기준일",
    maxDateHint: "오늘까지 선택 가능",
    selectedDate: "코스피 기준일",
    previousMarketDate: "글로벌 지표 기준일",
    sourceTable: "데이터 테이블",
    updatedAt: "마지막 갱신",
    score: "점수",
    growthScore: "성장 지표 점수",
    priceScore: "가격·환율 지표 점수",
    grade: "등급",
    source: "출처",
    success: "적용 완료",
    partial: "일부 값 없음",
    groups: {
      KR: "국내 시장",
      US: "미국 시장",
      MACRO: "원자재·환율·금리",
    },
    columns: {
      item: "지표",
      baseDate: "데이터 기준일",
      reference: "기준가",
      open: "시가",
      high: "고가",
      low: "저가",
      close: "종가/현재가",
      change: "등락률",
      score: "점수",
      source: "source",
      updatedAt: "갱신시각",
    },
    basis: {
      MODIFIED_REFERENCE: "보정 기준가",
      STANDARD: "기준가",
      REFERENCE_TO_CLOSE: "기준가 대비",
      REFERENCE_TO_OPEN: "기준가 대비 시가",
      OPEN_TO_CLOSE: "시가 대비",
    },
    dateRole: {
      SELECTED_DATE: "선택일 데이터",
      PREVIOUS_DATE: "전일 데이터",
    },
    trend: {
      UP: "상승",
      DOWN: "하락",
      FLAT: "보합",
      UNKNOWN: "확인중",
    },
  },
  en: {
    seoTitle: "Market Indicators Dashboard",
    seoDesc: "Compare selected-day KOSPI with previous-day global markets, FX, rates, and commodity indicators.",
    title: "Market Indicators Dashboard",
    subtitle: "Selected-day KOSPI is shown with previous-day global indicators.",
    back: "Market Home",
    refresh: "Refresh",
    loading: "Loading market data.",
    empty: "No market data is available for this date.",
    error: "Failed to load market data.",
    retry: "Retry",
    dateLabel: "KOSPI date",
    maxDateHint: "Available up to today",
    selectedDate: "KOSPI date",
    previousMarketDate: "Global indicator date",
    sourceTable: "Data table",
    updatedAt: "Last updated",
    score: "Score",
    growthScore: "Growth score",
    priceScore: "Price, FX & rates score",
    grade: "Grade",
    source: "Source",
    success: "Applied",
    partial: "Partial",
    groups: {
      KR: "Korea Market",
      US: "U.S. Market",
      MACRO: "Commodities, FX & Rates",
    },
    columns: {
      item: "Indicator",
      baseDate: "Data date",
      reference: "Reference",
      open: "Open",
      high: "High",
      low: "Low",
      close: "Close / Latest",
      change: "Change",
      score: "Score",
      source: "source",
      updatedAt: "Updated",
    },
    basis: {
      MODIFIED_REFERENCE: "Modified reference",
      STANDARD: "Reference",
      REFERENCE_TO_CLOSE: "vs reference",
      REFERENCE_TO_OPEN: "open vs reference",
      OPEN_TO_CLOSE: "open to close",
    },
    dateRole: {
      SELECTED_DATE: "Selected date",
      PREVIOUS_DATE: "Previous date",
    },
    trend: {
      UP: "Up",
      DOWN: "Down",
      FLAT: "Flat",
      UNKNOWN: "Unknown",
    },
  },
};

function todayInKst() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function numOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function fmtPrice(value, code, locale) {
  const n = numOrNull(value);
  if (n == null) return "-";

  const decimals = code === "USDKRW" || code === "US10Y" ? 2 : 2;
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

  if (code === "US10Y") return `${formatted}%`;
  if (code === "WTI") return `$${formatted}`;
  if (code === "USDKRW") return locale === "en" ? `${formatted} KRW` : `${formatted}원`;
  return formatted;
}

function fmtPct(value) {
  const n = numOrNull(value);
  if (n == null) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function fmtNumber(value, digits = 2) {
  const n = numOrNull(value);
  if (n == null) return "-";
  return n.toFixed(digits);
}

function fmtDate(value) {
  return value ? String(value).slice(0, 10) : "-";
}

function fmtDateTime(value) {
  return value ? String(value).replace("T", " ").slice(0, 19) : "-";
}

function trendTone(trend) {
  if (trend === "UP") return "text-emerald-700 bg-emerald-50 border-emerald-100";
  if (trend === "DOWN") return "text-rose-700 bg-rose-50 border-rose-100";
  if (trend === "FLAT") return "text-slate-700 bg-slate-100 border-slate-200";
  return "text-slate-500 bg-slate-50 border-slate-100";
}

function trendTextTone(trend) {
  if (trend === "UP") return "text-emerald-700";
  if (trend === "DOWN") return "text-rose-700";
  return "text-slate-700";
}

function groupItems(items) {
  const groups = { KR: [], US: [], MACRO: [] };
  for (const item of items || []) {
    const key = CODE_GROUP[item.code] || "MACRO";
    groups[key].push(item);
  }
  return groups;
}

function hasCoreValue(item) {
  return [
    item?.referencePrice,
    item?.openPrice,
    item?.highPrice,
    item?.lowPrice,
    item?.closePrice,
    item?.changeRate,
  ].some((value) => numOrNull(value) != null);
}

function SummaryBox({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value || "-"}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function IndicatorCard({ item, lang, t }) {
  const displayName = CODE_LABELS[lang]?.[item.code] || item.name || item.code;
  const tone = trendTone(item.trend);
  const basis = t.basis[item.changeRateBasis] || item.changeRateBasis || "";
  const source = item.sourceTable || item.sourceName || item.source || "-";
  const role = t.dateRole[item.dateRole] || item.dateRole || "";
  const score = numOrNull(item.score);

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-normal text-slate-400">{item.code}</div>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{displayName}</h3>
          <div className="mt-1 text-xs text-slate-500">
            {t.columns.baseDate}: {fmtDate(item.baseDate)}
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-1 text-xs font-semibold ${tone}`}>
          {t.trend[item.trend] || t.trend.UNKNOWN}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">{t.columns.close}</div>
          <div className="mt-1 text-2xl font-bold text-slate-950">
            {fmtPrice(item.closePrice, item.code, lang)}
          </div>
        </div>
        <div className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${tone}`}>
          {fmtPct(item.changeRate)}
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{basis || "-"}</span>
        {role && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{role}</span>}
        {score != null && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
            {t.score}: {fmtNumber(score)}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <MiniStat label={t.columns.reference} value={fmtPrice(item.referencePrice, item.code, lang)} />
        <MiniStat label={t.columns.open} value={fmtPrice(item.openPrice, item.code, lang)} />
        <MiniStat label={t.columns.high} value={fmtPrice(item.highPrice, item.code, lang)} />
        <MiniStat label={t.columns.low} value={fmtPrice(item.lowPrice, item.code, lang)} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
          {t.source}: {source}
        </span>
        <span className={item.isSuccess && hasCoreValue(item) ? "rounded-full bg-emerald-50 px-2 py-1 text-emerald-700" : "rounded-full bg-amber-50 px-2 py-1 text-amber-700"}>
          {item.isSuccess && hasCoreValue(item) ? t.success : t.partial}
        </span>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        {t.updatedAt}: {fmtDateTime(item.updatedAt)}
      </div>
    </article>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-0.5 font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function IndicatorTable({ items, lang, t }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">{t.columns.item}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.columns.baseDate}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.columns.reference}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.columns.open}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.columns.high}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.columns.low}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.columns.close}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.columns.change}</th>
              <th className="px-4 py-3 text-right font-semibold">{t.columns.score}</th>
              <th className="px-4 py-3 text-left font-semibold">{t.columns.updatedAt}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const displayName = CODE_LABELS[lang]?.[item.code] || item.name || item.code;
              return (
                <tr key={item.code} className="bg-white">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{displayName}</div>
                    <div className="text-xs text-slate-500">{t.dateRole[item.dateRole] || item.dateRole || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(item.baseDate)}</td>
                  <td className="px-4 py-3 text-right">{fmtPrice(item.referencePrice, item.code, lang)}</td>
                  <td className="px-4 py-3 text-right">{fmtPrice(item.openPrice, item.code, lang)}</td>
                  <td className="px-4 py-3 text-right">{fmtPrice(item.highPrice, item.code, lang)}</td>
                  <td className="px-4 py-3 text-right">{fmtPrice(item.lowPrice, item.code, lang)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmtPrice(item.closePrice, item.code, lang)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${trendTextTone(item.trend)}`}>{fmtPct(item.changeRate)}</td>
                  <td className="px-4 py-3 text-right">{fmtNumber(item.score)}</td>
                  <td className="px-4 py-3 text-slate-500">{fmtDateTime(item.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatePanel({ title, text, actionLabel, onAction }) {
  return (
    <div className="card text-center">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      {text && <p className="mt-2 text-sm text-slate-600">{text}</p>}
      {onAction && (
        <button type="button" onClick={onAction} className="btn-secondary mt-4">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function MarketIndicesPage() {
  const router = useRouter();
  const lang = router.locale === "en" ? "en" : "ko";
  const t = TEXT[lang];
  const today = useMemo(() => todayInKst(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [maxDate, setMaxDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(date) {
    setLoading(true);
    setError("");
    try {
      const url = date ? `/api/market/summary?date=${encodeURIComponent(date)}` : "/api/market/summary";
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "market_summary_failed");
      }
      setData(json);
      if (json.maxDate && isDateString(json.maxDate)) setMaxDate(json.maxDate);
      if (json.selectedDate && isDateString(json.selectedDate)) setSelectedDate(json.selectedDate);
    } catch (err) {
      setData(null);
      setError(err?.message || "market_summary_failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!router.isReady) return;
    const queryDate = Array.isArray(router.query.date) ? router.query.date[0] : router.query.date;
    const nextDate = isDateString(queryDate) && queryDate <= today ? queryDate : "";
    if (nextDate) setSelectedDate(nextDate);
    load(nextDate);
  }, [router.isReady, router.query.date, today]);

  const onDateChange = (event) => {
    const nextDate = event.target.value;
    if (!isDateString(nextDate) || nextDate > maxDate) return;
    setSelectedDate(nextDate);
    router.replace(
      {
        pathname: router.pathname,
        query: { date: nextDate },
      },
      undefined,
      { shallow: true }
    );
  };

  const items = data?.items || [];
  const groups = useMemo(() => groupItems(items), [items]);
  const scores = data?.scores || {};
  const growthScore = fmtNumber(scores.growthTotalScore);
  const priceScore = fmtNumber(scores.priceTotalScore);
  const growthGrade = fmtNumber(scores.growthTotalScoreGrade, 0);
  const priceGrade = fmtNumber(scores.priceTotalScoreGrade, 0);

  return (
    <>
      <SeoHead title={t.seoTitle} desc={t.seoDesc} url="/market/indices" locale={lang} />

      <section className="mt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/market" className="text-sm font-medium text-slate-500 hover:text-slate-900">
              &larr; {t.back}
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-slate-950 md:text-3xl">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.subtitle}</p>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
            <label className="text-xs font-medium text-slate-500" htmlFor="market-date">
              {t.dateLabel}
            </label>
            <div className="flex gap-2">
              <input
                id="market-date"
                type="date"
                value={selectedDate}
                max={maxDate}
                onChange={onDateChange}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button type="button" onClick={() => load(selectedDate)} className="btn-secondary" disabled={loading}>
                {t.refresh}
              </button>
            </div>
            <div className="text-xs text-slate-400">{t.maxDateHint}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <SummaryBox label={t.selectedDate} value={fmtDate(data?.selectedDate || selectedDate)} />
          <SummaryBox label={t.previousMarketDate} value={fmtDate(data?.previousMarketDate)} />
          <SummaryBox label={t.growthScore} value={growthScore} sub={`${t.grade}: ${growthGrade}`} />
          <SummaryBox label={t.priceScore} value={priceScore} sub={`${t.grade}: ${priceGrade}`} />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <SummaryBox label={t.sourceTable} value={data?.sourceTable || "STOCK_INVEST_INFO"} />
          <SummaryBox label={t.updatedAt} value={fmtDateTime(data?.updatedAt)} />
        </div>

        {loading && (
          <div className="mt-6">
            <StatePanel title={t.loading} />
          </div>
        )}

        {!loading && error && (
          <div className="mt-6">
            <StatePanel title={t.error} text={error} actionLabel={t.retry} onAction={() => load(selectedDate)} />
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="mt-6">
            <StatePanel title={t.empty} actionLabel={t.retry} onAction={() => load(selectedDate)} />
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-8 space-y-8">
            {GROUP_ORDER.map((groupKey) => {
              const group = groups[groupKey] || [];
              if (group.length === 0) return null;
              return (
                <section key={groupKey}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-950">{t.groups[groupKey]}</h2>
                    <div className="text-xs text-slate-500">{group.length}</div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {group.map((item) => (
                      <IndicatorCard key={item.code} item={item} lang={lang} t={t} />
                    ))}
                  </div>
                </section>
              );
            })}

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-950">
                {lang === "en" ? "Compare Indicators" : "지표 비교"}
              </h2>
              <IndicatorTable items={items} lang={lang} t={t} />
            </section>
          </div>
        )}
      </section>
    </>
  );
}
