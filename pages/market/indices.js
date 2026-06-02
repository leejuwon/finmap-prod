import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SeoHead from "../../_components/SeoHead";
import DashboardAdSlot from "../../_components/DashboardAdSlot";
import { AD_SLOTS } from "../../config/adSlots";

const RANGE_LABELS = {
  exact: "동일 등급만",
  near1: "인접 ±1 등급 포함",
  near2: "인접 ±2 등급 포함",
};

const PERIOD_LABELS = {
  "1y": "최근 1년",
  "3y": "최근 3년",
  all: "전체 기간",
};

const QUALITY_LABELS = {
  strong: "표본 충분",
  normal: "표본 보통",
  weak: "표본 부족",
  too_small: "확률 해석 제한",
};

const QUALITY_TONE = {
  strong: "bg-emerald-50 text-emerald-700",
  normal: "bg-sky-50 text-sky-700",
  weak: "bg-amber-50 text-amber-700",
  too_small: "bg-rose-50 text-rose-700",
};

const ETF_RANGE_LABELS = {
  near1: "인접 ±1 등급",
  near2: "인접 ±2 등급",
  exact: "동일 등급만",
};

const ETF_INTERPRETATION_LABELS = {
  INSUFFICIENT_SAMPLE: "표본 부족",
  MIXED_OBSERVATION: "혼합 관찰",
  NO_CLEAR_EDGE: "관찰 우위 없음",
  OBSERVATION_ONLY: "관찰 통계",
};

const ETF_INTERPRETATION_TONE = {
  INSUFFICIENT_SAMPLE: "bg-amber-50 text-amber-800 border-amber-100",
  MIXED_OBSERVATION: "bg-slate-50 text-slate-800 border-slate-100",
  NO_CLEAR_EDGE: "bg-slate-50 text-slate-800 border-slate-100",
  OBSERVATION_ONLY: "bg-sky-50 text-sky-800 border-sky-100",
};

const RELATED_LINKS = [
  {
    href: "/posts/investingInfo/usd-krw-exchange-rate-and-kospi",
    title: "원달러 환율과 KOSPI 관계 읽기",
    desc: "환율 변화가 한국 증시와 업종에 연결되는 방식을 정리합니다.",
  },
  {
    href: "/posts/investingInfo/wti-impact-on-korea-kospi",
    title: "WTI 유가가 한국 증시에 미치는 영향",
    desc: "유가, 물가, 환율, 기업 비용의 연결고리를 살펴봅니다.",
  },
  {
    href: "/posts/investingInfo/us10y-impact-on-korea-and-stock-market",
    title: "미국 10년물 금리와 성장주 환경",
    desc: "금리 변화가 밸류에이션과 위험 선호에 주는 영향을 해석합니다.",
  },
  {
    href: "/posts/investingInfo/dxy-dollar-index-basics",
    title: "달러인덱스란 무엇인가",
    desc: "DXY가 글로벌 유동성과 환율 환경을 보여주는 방식을 설명합니다.",
  },
];

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

function fmtNumber(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function fmtPrice(value, key) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  const formatted = fmtNumber(n, key === "us10y" ? 2 : 2);
  if (key === "usdkrw") return `${formatted}원`;
  if (key === "wti") return `$${formatted}`;
  if (key === "us10y") return `${formatted}%`;
  return formatted;
}

function fmtPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function pctTone(value) {
  const n = typeof value === "string" ? Number(value.replace("%", "")) : Number(value);
  if (!Number.isFinite(n)) return "text-slate-700";
  if (n > 0) return "text-emerald-700";
  if (n < 0) return "text-rose-700";
  return "text-slate-700";
}

function gradeTone(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "text-slate-700 bg-slate-100";
  if (n > 0) return "text-emerald-700 bg-emerald-50";
  if (n < 0) return "text-rose-700 bg-rose-50";
  return "text-slate-700 bg-slate-100";
}

function isMissingGrade(value) {
  return value == null || value === 0 || value === "0";
}

function gradeText(value) {
  if (isMissingGrade(value)) return "등급 없음";
  return String(value).startsWith("-") ? String(value) : `+${value}`;
}

function qualityLabel(value) {
  return QUALITY_LABELS[value] || "표본 확인";
}

function etfRangeLabel(value) {
  return ETF_RANGE_LABELS[value] || value || "-";
}

function etfInterpretationLabel(value) {
  return ETF_INTERPRETATION_LABELS[value] || "관찰 통계";
}

function etfInterpretationTone(value) {
  return ETF_INTERPRETATION_TONE[value] || ETF_INTERPRETATION_TONE.NO_CLEAR_EDGE;
}

function gradeDisplay(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "-";
  return n > 0 ? `+${n}` : String(n);
}

function gradeRangeText(values = []) {
  const nums = values.map(Number).filter(Number.isFinite);
  if (!nums.length) return "-";
  if (nums.length === 1) return gradeDisplay(nums[0]);
  return `${gradeDisplay(nums[0])}~${gradeDisplay(nums[nums.length - 1])}`;
}

function rangeSummaryText(stats) {
  const priceText = gradeRangeText(stats?.gradeRanges?.priceGrades);
  const growthText = gradeRangeText(stats?.gradeRanges?.growthGrades);
  return `가격 ${priceText} / 성장 ${growthText} 범위의 과거 사례`;
}

function rangeRecommendation(rangeSamples = {}) {
  const exact = Number(rangeSamples.exact || 0);
  const near1 = Number(rangeSamples.near1 || 0);
  const near2 = Number(rangeSamples.near2 || 0);
  if (exact >= 20) {
    return {
      mode: "exact",
      tone: "bg-emerald-50 text-emerald-800",
      text: "동일 등급 표본이 20건 이상이라 현재 모드를 기본 해석으로 볼 수 있습니다.",
      actionLabel: null,
    };
  }
  if (near1 >= 20) {
    return {
      mode: "near1",
      tone: "bg-amber-50 text-amber-800",
      text: "동일 등급 표본이 적어 인접 ±1 등급 포함 통계도 함께 확인해보세요.",
      actionLabel: "참고: 인접 ±1 보기",
    };
  }
  if (near2 >= 20) {
    return {
      mode: "near2",
      tone: "bg-amber-50 text-amber-800",
      text: "인접 ±1 표본도 적어 인접 ±2 등급 포함 통계를 참고용으로 함께 볼 수 있습니다.",
      actionLabel: "참고: 인접 ±2 보기",
    };
  }
  return {
    mode: "exact",
    tone: "bg-rose-50 text-rose-800",
    text: "인접 등급까지 넓혀도 표본 수가 적어 해석에 주의가 필요합니다.",
    actionLabel: null,
  };
}

function marketStatusText(data) {
  if (!data?.hasData) return "휴장 또는 데이터 수집 전입니다.";
  if (data.marketStatus === "open") return "오늘 종가는 아직 확정되지 않았습니다.";
  if (data.marketStatus === "holiday" || data.marketStatus === "no_data") return "휴장 또는 데이터 수집 전입니다.";
  return data.marketStatusLabel || "상태 확인";
}

function MiniChart({ item }) {
  const data = item?.fiveDays || [];
  if (data.length < 2) {
    return <div className="flex h-[132px] items-center justify-center text-xs text-slate-500">5일 데이터 부족</div>;
  }
  return (
    <div className="h-[132px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value, name) => [fmtNumber(value), name === "open" ? "시가" : "종가"]}
            labelFormatter={(label) => String(label)}
          />
          <Line type="monotone" dataKey="open" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="close" stroke="#0f766e" strokeWidth={2} dot={false} strokeDasharray="2 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function IndicatorCard({ item }) {
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-400">{item.code}</div>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{item.name}</h3>
          <div className="mt-1 text-xs text-slate-500">기준일 {item.baseDate || "-"}</div>
        </div>
        <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pctTone(item.closeChangePct)} bg-slate-50`}>
          {fmtPct(item.closeChangePct)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <SmallMetric label="기준값" value={fmtPrice(item.basePrice, item.key)} />
        <SmallMetric label="시가" value={fmtPrice(item.openPrice, item.key)} sub={fmtPct(item.openChangePct)} />
        <SmallMetric label="종가" value={fmtPrice(item.closePrice, item.key)} sub={fmtPct(item.closeChangePct)} />
      </div>
      <div className="mt-3">
        <MiniChart item={item} />
      </div>
    </article>
  );
}

function SmallMetric({ label, value, sub }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</div>
      {sub && <div className={`mt-0.5 text-[11px] ${pctTone(sub)}`}>{sub}</div>}
    </div>
  );
}

function GradeBox({ label, value, score }) {
  const missing = isMissingGrade(value);
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className={`mt-4 inline-flex min-h-[74px] min-w-[112px] items-center justify-center rounded-lg px-5 font-bold ${missing ? "text-base" : "text-5xl"} ${gradeTone(value)}`}>
        {gradeText(value)}
      </div>
      <div className="mt-3 text-xs text-slate-500">점수 {fmtNumber(score)}</div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-950">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function RangeModeTabs({ value, rangeSamples, onChange }) {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 md:w-auto">
      {Object.entries(RANGE_LABELS).map(([key, label]) => {
        const active = value === key;
        const count = rangeSamples?.[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition sm:text-center ${
              active
                ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="block font-semibold">{label}</span>
            <span className={`mt-0.5 block text-xs ${active ? "text-slate-200" : "text-slate-500"}`}>
              {count == null ? "표본 확인 중" : `${count}건`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BucketRow({ row }) {
  return (
    <div className="grid gap-2 rounded-lg border border-slate-100 bg-white p-3 text-sm md:grid-cols-[1.2fr_0.6fr_0.7fr_0.7fr_0.7fr] md:items-center">
      <div className="font-medium text-slate-900">{row.label}</div>
      <div className="text-slate-600">사례 {row.sampleCount}</div>
      <div className="text-emerald-700">상승 {fmtPct(row.closeUpRate)}</div>
      <div className="text-rose-700">하락 {fmtPct(row.closeDownRate)}</div>
      <div className={pctTone(row.avgCloseChangePct)}>평균 {fmtPct(row.avgCloseChangePct)}</div>
    </div>
  );
}

function SimilarDates({ stats, onSelectDate, onMore }) {
  const rows = stats?.similarDates || [];
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {rangeSummaryText(stats)}
      </div>
      {!rows.length && (
        <div className="rounded-lg border border-slate-100 bg-white p-5 text-sm text-slate-500">조건에 맞는 과거 날짜가 없습니다.</div>
      )}
      {!!rows.length && (
        <>
      <div className="hidden overflow-hidden rounded-lg border border-slate-100 bg-white md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">날짜</th>
              <th className="px-4 py-3 text-right">가격 등급</th>
              <th className="px-4 py-3 text-right">성장 등급</th>
              <th className="px-4 py-3 text-right">시가 등락률</th>
              <th className="px-4 py-3 text-right">종가 등락률</th>
              <th className="px-4 py-3 text-left">결과</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.date} className="cursor-pointer hover:bg-slate-50" onClick={() => onSelectDate(row.date)}>
                <td className="px-4 py-3 font-medium text-slate-900">{row.date}</td>
                <td className="px-4 py-3 text-right">{row.priceGradeLabel}</td>
                <td className="px-4 py-3 text-right">{row.growthGradeLabel}</td>
                <td className={`px-4 py-3 text-right ${pctTone(row.kospiOpenChangePct)}`}>{fmtPct(row.kospiOpenChangePct)}</td>
                <td className={`px-4 py-3 text-right ${pctTone(row.kospiCloseChangePct)}`}>{fmtPct(row.kospiCloseChangePct)}</td>
                <td className="px-4 py-3">{resultLabel(row.result)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 md:hidden">
        {rows.map((row) => (
          <button
            key={row.date}
            type="button"
            onClick={() => onSelectDate(row.date)}
            className="w-full rounded-lg border border-slate-100 bg-white p-4 text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-slate-950">{row.date}</div>
              <div className="text-xs text-slate-500">{resultLabel(row.result)}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
              <span>가격 {row.priceGradeLabel}</span>
              <span>성장 {row.growthGradeLabel}</span>
              <span className={pctTone(row.kospiOpenChangePct)}>시가 {fmtPct(row.kospiOpenChangePct)}</span>
              <span className={pctTone(row.kospiCloseChangePct)}>종가 {fmtPct(row.kospiCloseChangePct)}</span>
            </div>
          </button>
        ))}
      </div>

      <button type="button" onClick={onMore} className="btn-secondary">
        더보기
      </button>
        </>
      )}
    </div>
  );
}

function resultLabel(value) {
  if (value === "up") return "상승 마감";
  if (value === "down") return "하락 마감";
  if (value === "flat") return "보합";
  return "확인 중";
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

function EtfOffsetDetails({ data }) {
  const etfs = data?.etfs || [];
  if (!etfs.length) return null;

  return (
    <details className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
      <summary className="cursor-pointer font-semibold text-slate-800">일봉 저가 충족 offset 시뮬레이션</summary>
      <div className="mt-3 space-y-4">
        <p className="rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-600">
          {data.bestEntryOffsetCautionKo || "이 값은 일봉 저가 기준 체결 가정의 과거 시뮬레이션 후보이며 실제 체결을 보장하지 않습니다."}
        </p>
        {etfs.map((etf) => (
          <div key={etf.etfId} className="space-y-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-semibold text-slate-900">{etf.nameKo || etf.etfId}</div>
              {etf.bestEntryOffset ? (
                <div className="text-xs text-slate-500">
                  선별된 offset 후보 {fmtPct(etf.bestEntryOffset.offsetPct)} · 충족 {etf.bestEntryOffset.filledCount}건 · 기대 관찰 {fmtPct(etf.bestEntryOffset.expectedReturnPct)}
                </div>
              ) : (
                <div className="text-xs text-slate-500">선별된 offset 후보 없음</div>
              )}
            </div>
            {etf.bestEntryOffset && (
              <div className="grid gap-2 text-xs sm:grid-cols-5">
                <SmallMetric label="시가 대비 offset" value={fmtPct(etf.bestEntryOffset.offsetPct)} />
                <SmallMetric label="충족 수" value={`${etf.bestEntryOffset.filledCount || 0}건`} />
                <SmallMetric label="충족률" value={fmtPct(etf.bestEntryOffset.fillRate)} />
                <SmallMetric label="평균 관찰" value={fmtPct(etf.bestEntryOffset.avgReturnPct)} />
                <SmallMetric label="중앙값 관찰" value={fmtPct(etf.bestEntryOffset.medianReturnPct)} />
              </div>
            )}
            <div className="overflow-x-auto rounded-lg border border-slate-100 bg-white">
              <table className="min-w-[680px] text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">시가 대비 offset</th>
                    <th className="px-3 py-2 text-right">충족 수</th>
                    <th className="px-3 py-2 text-right">충족률</th>
                    <th className="px-3 py-2 text-right">평균 관찰</th>
                    <th className="px-3 py-2 text-right">중앙값 관찰</th>
                    <th className="px-3 py-2 text-right">기대 관찰</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(etf.entryOffsets || []).map((offset) => (
                    <tr key={`${etf.etfId}-${offset.offsetPct}`}>
                      <td className="px-3 py-2 font-medium text-slate-800">{fmtPct(offset.offsetPct)}</td>
                      <td className="px-3 py-2 text-right">{offset.filledCount || 0}건</td>
                      <td className="px-3 py-2 text-right">{fmtPct(offset.fillRate)}</td>
                      <td className={`px-3 py-2 text-right ${pctTone(offset.avgReturnPct)}`}>{fmtPct(offset.avgReturnPct)}</td>
                      <td className={`px-3 py-2 text-right ${pctTone(offset.medianReturnPct)}`}>{fmtPct(offset.medianReturnPct)}</td>
                      <td className={`px-3 py-2 text-right ${pctTone(offset.expectedReturnPct)}`}>{fmtPct(offset.expectedReturnPct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function EtfObservationPanel({ data, loading, error, rangeMode, onRangeModeChange }) {
  const warnings = new Set(data?.warningCodes || []);
  const hasFreshnessWarning = warnings.has("LEGACY_SOURCE_NOT_LATEST");
  const sampleEndsBeforeSelected = warnings.has("LEGACY_SAMPLE_ENDS_BEFORE_SELECTED_DATE");
  const minSamples = Number(data?.minSamples || 20);
  const matchedDays = Number(data?.matchedDays || 0);
  const interpretation = data?.interpretationLevel || (matchedDays < minSamples ? "INSUFFICIENT_SAMPLE" : "NO_CLEAR_EDGE");
  const interpretationText = interpretation === "OBSERVATION_ONLY"
    ? data?.signal?.labelKo || etfInterpretationLabel(interpretation)
    : etfInterpretationLabel(interpretation);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Legacy daily ETF OHLC</div>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">ETF 일봉 관찰 통계</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            현재 가격·성장 등급과 같거나 가까웠던 과거 거래일을 기준으로 KODEX 레버리지와 KODEX 200선물인버스2X의 시가 대비 종가 변화를 비교합니다.
            이 통계는 과거 데이터 기반 관찰용이며 매수·매도 권유가 아닙니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["near1", "near2", "exact"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onRangeModeChange(mode)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                rangeMode === mode
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {etfRangeLabel(mode)}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-500">
          ETF 관찰 통계를 불러오는 중입니다.
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-500">
          ETF 관찰 통계를 불러오지 못했습니다. 기존 지수 통계는 계속 확인할 수 있습니다.
        </div>
      )}

      {!loading && !error && data && !data.hasData && (
        <div className="rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-500">
          현재 기준 등급으로 ETF 관찰 통계를 계산할 수 없습니다.
        </div>
      )}

      {!loading && !error && data?.hasData && (
        <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
          {(hasFreshnessWarning || sampleEndsBeforeSelected) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
              <div className="font-semibold">legacy 데이터 최신성 안내</div>
              <div>{data.dataFreshnessLabelKo}</div>
              {sampleEndsBeforeSelected && (
                <div className="text-xs">표본 최신일 {data.sampleLatestDate || "-"} · 선택 기준일 {data.date || "-"}</div>
              )}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">표본 수</div>
              <div className="mt-1 text-2xl font-bold text-slate-950">{matchedDays}건</div>
              <div className="mt-1 text-xs text-slate-500">{etfRangeLabel(data.rangeMode)} · {data.period || "3y"} · {data.sourceDescriptionKo || "legacy 장기 일봉"}</div>
            </div>
            <div className={`rounded-lg border p-3 ${etfInterpretationTone(interpretation)}`}>
              <div className="text-xs opacity-80">관찰 결과</div>
              <div className="mt-1 text-2xl font-bold">{interpretationText}</div>
              <div className="mt-1 text-xs">투자 권유 아님 · 수익 보장 아님</div>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">데이터 최신성</div>
              <div className="mt-1 text-sm font-semibold leading-5 text-slate-900">{data.dataFreshnessLabelKo || "-"}</div>
              <div className="mt-1 text-xs text-slate-500">source {data.source || "-"} · 기준 {data.date || "-"}</div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-900">
            레버리지·인버스 ETF는 고위험 상품입니다. 이 화면은 과거 일봉 통계이며 매수·매도 권유나 수익 보장이 아닙니다.
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-950">시가→종가 일봉 통계</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="min-w-[720px] text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">ETF명</th>
                    <th className="px-4 py-3 text-right">sampleCount</th>
                    <th className="px-4 py-3 text-right">avgOpenToClosePct</th>
                    <th className="px-4 py-3 text-right">medianOpenToClosePct</th>
                    <th className="px-4 py-3 text-right">winRate</th>
                    <th className="px-4 py-3 text-right">maxLossPct</th>
                    <th className="px-4 py-3 text-left">sampleQuality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(data.etfs || []).map((etf) => (
                    <tr key={etf.etfId}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{etf.nameKo || etf.etfId}</td>
                      <td className="px-4 py-3 text-right">{etf.sampleCount || 0}건</td>
                      <td className={`px-4 py-3 text-right ${pctTone(etf.avgOpenToClosePct)}`}>{fmtPct(etf.avgOpenToClosePct)}</td>
                      <td className={`px-4 py-3 text-right ${pctTone(etf.medianOpenToClosePct)}`}>{fmtPct(etf.medianOpenToClosePct)}</td>
                      <td className="px-4 py-3 text-right">{fmtPct(etf.winRate)}</td>
                      <td className={`px-4 py-3 text-right ${pctTone(etf.maxLossPct)}`}>{fmtPct(etf.maxLossPct)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${QUALITY_TONE[etf.sampleQuality] || "bg-slate-100 text-slate-700"}`}>
                          {qualityLabel(etf.sampleQuality)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <EtfOffsetDetails data={data} />
        </div>
      )}
    </section>
  );
}

export default function MarketIndicesPage() {
  const router = useRouter();
  const today = useMemo(() => todayInKst(), []);
  const [dateInput, setDateInput] = useState(today);
  const [period, setPeriod] = useState("3y");
  const [rangeMode, setRangeMode] = useState("exact");
  const [limit, setLimit] = useState(20);
  const [dashboard, setDashboard] = useState(null);
  const [stats, setStats] = useState(null);
  const [etfRangeMode, setEtfRangeMode] = useState("near1");
  const [etfStats, setEtfStats] = useState(null);
  const [etfLoading, setEtfLoading] = useState(false);
  const [etfError, setEtfError] = useState("");
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadEtfStats({ date, nextEtfRangeMode = etfRangeMode } = {}) {
    const statsDate = isDateString(date) ? date : "";
    if (!statsDate) {
      setEtfStats(null);
      setEtfError("");
      return;
    }
    setEtfLoading(true);
    setEtfError("");
    try {
      const params = new URLSearchParams({
        source: "legacy",
        period: "3y",
        rangeMode: nextEtfRangeMode,
        minSamples: "20",
        includeOffsets: "1",
        limit: "5",
        date: statsDate,
      });
      const res = await fetch(`/api/stock-index/etf-grade-stats?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "etf_grade_stats_failed");
      setEtfStats(json);
    } catch (err) {
      setEtfStats(null);
      setEtfError(err?.message || "etf_grade_stats_failed");
    } finally {
      setEtfLoading(false);
    }
  }

  async function load({ date, nextPeriod = period, nextRangeMode = rangeMode, nextLimit = limit } = {}) {
    setLoading(true);
    setStatsLoading(true);
    setError("");
    try {
      const dateParam = isDateString(date) ? `?date=${encodeURIComponent(date)}` : "";
      const dashboardRes = await fetch(`/api/stock-index/dashboard${dateParam}`);
      const dashboardJson = await dashboardRes.json();
      if (!dashboardRes.ok || !dashboardJson?.ok) throw new Error(dashboardJson?.error || "dashboard_failed");
      setDashboard(dashboardJson);
      if (dashboardJson.date) setDateInput(dashboardJson.date);

      const statsDate = dashboardJson.date || date || "";
      const params = new URLSearchParams({
        date: statsDate,
        period: nextPeriod,
        rangeMode: nextRangeMode,
        limit: String(nextLimit),
      });
      const statsRes = await fetch(`/api/stock-index/grade-stats?${params.toString()}`);
      const statsJson = await statsRes.json();
      if (!statsRes.ok || !statsJson?.ok) throw new Error(statsJson?.error || "grade_stats_failed");
      setStats(statsJson);
      loadEtfStats({ date: statsDate });
    } catch (err) {
      setDashboard(null);
      setStats(null);
      setEtfStats(null);
      setEtfError("");
      setError(err?.message || "market_indices_failed");
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }

  useEffect(() => {
    if (!router.isReady) return;
    const qDate = Array.isArray(router.query.date) ? router.query.date[0] : router.query.date;
    const qPeriod = Array.isArray(router.query.period) ? router.query.period[0] : router.query.period;
    const qRange = Array.isArray(router.query.rangeMode) ? router.query.rangeMode[0] : router.query.rangeMode;
    const qLimit = Array.isArray(router.query.limit) ? router.query.limit[0] : router.query.limit;
    const nextDate = isDateString(qDate) ? qDate : "";
    const nextPeriod = PERIOD_LABELS[qPeriod] ? qPeriod : "3y";
    const nextRangeMode = RANGE_LABELS[qRange] ? qRange : "exact";
    const nextLimit = Math.min(Math.max(Number(qLimit || 20), 1), 100);
    setPeriod(nextPeriod);
    setRangeMode(nextRangeMode);
    setLimit(nextLimit);
    if (nextDate) setDateInput(nextDate);
    load({ date: nextDate, nextPeriod, nextRangeMode, nextLimit });
  }, [router.isReady, router.query.date, router.query.period, router.query.rangeMode, router.query.limit]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && dashboard?.diagnostics) {
      console.debug("[stock-index diagnostics]", dashboard.diagnostics);
    }
  }, [dashboard?.diagnostics]);

  function updateQuery(next = {}) {
    const query = {
      date: next.date || dateInput,
      period: next.period || period,
      rangeMode: next.rangeMode || rangeMode,
      limit: String(next.limit || limit),
    };
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true }).then(() => {
      if (next.date && typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function updateEtfRangeMode(nextEtfRangeMode) {
    setEtfRangeMode(nextEtfRangeMode);
    loadEtfStats({ date: dashboard?.date || dateInput, nextEtfRangeMode });
  }

  const kospi = dashboard?.kospi || {};
  const grades = dashboard?.grades || {};
  const closeStats = stats?.closeStats || {};
  const exactSampleCount = Number(stats?.rangeSamples?.exact ?? 0);
  const recommendation = rangeRecommendation(stats?.rangeSamples || {});
  const sampleQualityTone = QUALITY_TONE[stats?.sampleQuality] || "bg-slate-100 text-slate-700";
  const gradeSentence = isMissingGrade(grades.priceGrade) || isMissingGrade(grades.growthGrade)
    ? "현재 기준일은 등급 데이터가 아직 준비되지 않았습니다."
    : `현재 기준일은 가격 환경 ${grades.priceGradeLabel}, 성장 환경 ${grades.growthGradeLabel}로 분류되었습니다. 아래 통계는 과거에 같은 등급 조합이 나타난 날들의 KOSPI 움직임을 요약한 것입니다.`;

  return (
    <>
      <SeoHead
        title="KOSPI 등급 기반 시장정보 대시보드"
        desc="가격 등급과 성장 등급이 같은 과거 날짜를 기준으로 KOSPI 상승·하락 마감 비율과 유사 사례를 확인합니다."
        url="/market/indices"
        locale="ko"
      />

      <section className="mt-6 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/market" className="text-sm font-medium text-slate-500 hover:text-slate-900">
              &larr; 시장정보 홈
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-slate-950 md:text-3xl">KOSPI 등급 기반 시장정보 대시보드</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              가격 환경 등급과 성장 환경 등급이 비슷했던 과거 사례를 기준으로 KOSPI의 출발과 마감 흐름을 살펴봅니다.
              이 화면은 과거 데이터 기준의 참고용 통계이며 투자 권유가 아닙니다.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
            <label className="text-xs font-medium text-slate-500" htmlFor="market-date">기준일</label>
            <div className="flex flex-wrap gap-2">
              <input
                id="market-date"
                type="date"
                value={dateInput}
                max={today}
                onChange={(event) => setDateInput(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button type="button" onClick={() => updateQuery({ date: dateInput, limit: 20 })} className="btn-secondary" disabled={loading}>
                조회
              </button>
            </div>
            <div className="text-xs text-slate-400">최신 수집일 {dashboard?.latestDate || "-"}</div>
          </div>
        </div>

        {loading && <StatePanel title="시장 데이터를 불러오는 중입니다." />}
        {!loading && error && <StatePanel title="시장 데이터를 불러오지 못했습니다." text={error} actionLabel="다시 시도" onAction={() => load({ date: dateInput })} />}

        {!loading && !error && dashboard && (
          <>
            <section className="grid gap-3 md:grid-cols-5">
              <StatCard label="기준일" value={dashboard.date || "-"} sub={dashboard.updatedAt ? `갱신 ${dashboard.updatedAt}` : ""} />
              <StatCard label="장 상태" value={dashboard.marketStatusLabel || "-"} sub={marketStatusText(dashboard)} />
              <StatCard label="KOSPI 기준가" value={fmtPrice(kospi.basePrice, "kospi")} />
              <StatCard label="KOSPI 시가" value={fmtPrice(kospi.openPrice, "kospi")} sub={fmtPct(kospi.openChangePct)} />
              <StatCard label="KOSPI 종가" value={fmtPrice(kospi.closePrice, "kospi")} sub={fmtPct(kospi.closeChangePct)} />
            </section>

            <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                <GradeBox label="가격 환경 등급" value={grades.priceGrade} score={grades.priceScore} />
                <GradeBox label="성장 환경 등급" value={grades.growthGrade} score={grades.growthScore} />
              </div>
              <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">과거 동일 등급 기준 해석</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{gradeSentence}</p>
                {grades.warning && (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    등급 데이터 경고: {grades.warning}
                  </div>
                )}
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    + 등급은 과거 산식상 KOSPI에 상대적으로 우호적으로 분류된 구간입니다.
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    - 등급은 과거 산식상 부담 요인이 컸던 구간입니다.
                  </div>
                </div>
                <details className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                  <summary className="cursor-pointer font-semibold text-slate-800">계산 방식 보기</summary>
                  <div className="mt-3 space-y-2 leading-6">
                    <p>가격 등급은 원/달러 환율, 달러인덱스, 유가 등 가격 부담을 요약한 숫자형 등급입니다.</p>
                    <p>성장 등급은 S&amp;P 500, Nasdaq, Dow 등 미국 증시 흐름을 요약한 숫자형 등급입니다.</p>
                    <p>한국/미국 휴장일과 데이터 수집 전 구간은 통계 해석에서 별도 상태로 표시합니다.</p>
                    <p>등급 0은 정상 등급으로 보지 않으며 선택 기준일에서 발견되면 확인 안내로 표시합니다.</p>
                  </div>
                </details>
              </div>
            </section>

            <DashboardAdSlot
              slot={AD_SLOTS.responsiveBottom}
              page="stock_indices"
              position="section_middle"
              minHeight={160}
            />

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-950">주요 지표 카드</h2>
                <div className="text-xs text-slate-500">5거래일 시가/종가 미니 차트</div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {(dashboard.indicators || []).map((item) => (
                  <IndicatorCard key={item.key} item={item} />
                ))}
              </div>
            </section>

            <DashboardAdSlot
              slot={AD_SLOTS.responsiveBottom}
              page="stock_indices"
              position="infeed"
              minHeight={160}
            />

            <section className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">등급 기반 KOSPI 통계</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    과거 {PERIOD_LABELS[period]} 동안 가격 {stats?.priceGradeLabel || "-"} / 성장 {stats?.growthGradeLabel || "-"} 등급 조건을 비교합니다.
                  </p>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  <select
                    value={period}
                    onChange={(event) => updateQuery({ period: event.target.value, limit: 20 })}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm md:w-fit"
                  >
                    {Object.entries(PERIOD_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                  <RangeModeTabs
                    value={rangeMode}
                    rangeSamples={stats?.rangeSamples}
                    onChange={(nextRangeMode) => updateQuery({ rangeMode: nextRangeMode, limit: 20 })}
                  />
                </div>
              </div>

              {statsLoading && <div className="rounded-lg border border-slate-100 bg-white p-5 text-sm text-slate-500">등급 통계를 불러오는 중입니다.</div>}
              {!statsLoading && stats && (
                <>
                  <div className={`flex flex-col gap-3 rounded-lg px-4 py-3 text-sm md:flex-row md:items-center md:justify-between ${recommendation.tone}`}>
                    <div>
                      <div className="font-semibold">
                        {exactSampleCount < 5 ? "표본 부족" : exactSampleCount < 20 ? "동일 등급 표본 확인" : "표본 상태"}
                      </div>
                      <div className="mt-1">
                        {recommendation.text} 동일 등급 {stats.rangeSamples?.exact || 0}건, 인접 ±1 {stats.rangeSamples?.near1 || 0}건, 인접 ±2 {stats.rangeSamples?.near2 || 0}건입니다.
                      </div>
                    </div>
                    {recommendation.actionLabel && rangeMode !== recommendation.mode && (
                      <button
                        type="button"
                        onClick={() => updateQuery({ rangeMode: recommendation.mode, limit: 20 })}
                        className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                      >
                        {recommendation.actionLabel}
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-5">
                    <StatCard label="사례 수" value={String(stats.sampleCount || 0)} sub={<span className={`rounded-full px-2 py-1 ${sampleQualityTone}`}>{qualityLabel(stats.sampleQuality)}</span>} />
                    <StatCard label="상승 마감" value={`${closeStats.closeUpCount || 0}건`} sub={fmtPct(closeStats.closeUpRate)} />
                    <StatCard label="하락 마감" value={`${closeStats.closeDownCount || 0}건`} sub={fmtPct(closeStats.closeDownRate)} />
                    <StatCard label="평균 종가 등락률" value={fmtPct(closeStats.avgCloseChangePct)} />
                    <StatCard label="중앙값 종가 등락률" value={fmtPct(closeStats.medianCloseChangePct)} />
                  </div>

                  {exactSampleCount < 20 && (
                    <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      동일 등급 표본이 {exactSampleCount}건으로 적어 인접 등급 포함 통계도 함께 확인해보세요.
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-slate-950">시가 구간별 마감 비율</h3>
                    {(stats.openGapStats || []).map((row) => <BucketRow key={row.bucket} row={row} />)}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-slate-950">고급 시가 구간</h3>
                    {(stats.advancedOpenGapStats || []).map((row) => <BucketRow key={row.bucket} row={row} />)}
                  </div>
                </>
              )}
            </section>

            <section className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">동일/인접 등급 과거 날짜</h2>
                <p className="mt-1 text-sm text-slate-600">행을 선택하면 해당 날짜를 기준일로 다시 조회합니다.</p>
              </div>
              <SimilarDates
                stats={stats}
                onSelectDate={(date) => updateQuery({ date, limit: 20 })}
                onMore={() => updateQuery({ limit: Math.min(limit + 20, 100) })}
              />
              <DashboardAdSlot
                slot={AD_SLOTS.responsiveBottom}
                page="stock_indices"
                position="list_bottom"
                minHeight={160}
              />
            </section>

            <EtfObservationPanel
              data={etfStats}
              loading={etfLoading}
              error={etfError}
              rangeMode={etfRangeMode}
              onRangeModeChange={updateEtfRangeMode}
            />

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">함께 보면 좋은 글</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {RELATED_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-lg border border-slate-100 bg-white p-4 hover:border-slate-200">
                    <div className="font-semibold text-slate-950">{link.title}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{link.desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </>
  );
}
