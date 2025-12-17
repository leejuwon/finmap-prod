// _components/CashFlowLayerChart.js
import { useRef, useState, useLayoutEffect } from "react";
import ValueDisplay, { formatMoneyShort, formatMoneyFull } from "./ValueDisplay";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * ✅ cap(=해당 연도의 총 막대 높이 픽셀) 안에서만 3개 레이어를 "정수 픽셀"로 배분
 * - cost가 0이 아니면 최소 minPx를 최대한 보장 (cap이 충분할 때)
 * - 반올림/깎기 때문에 레이어가 0px로 사라지는 문제 방지
 */
function stackHeightsPixels({ contrib, growth, cost, cap, minPx = 2 }) {
  const seg = [
    { key: "contrib", v: Math.max(0, contrib) },
    { key: "growth", v: Math.max(0, growth) },
    { key: "cost", v: Math.max(0, cost) },
  ];

  const active = seg.filter((s) => s.v > 0);
  const activeCount = active.length;

  if (!activeCount || cap <= 0) return { hc: 0, hg: 0, hk: 0 };

  // cap이 너무 작으면 최소 픽셀 보장을 못 하므로 0으로 둠(현실적으로 표시 공간이 없음)
  const effMin =
    cap < activeCount ? 0 : Math.max(1, Math.min(minPx, Math.floor(cap / activeCount)));

  const sumV = active.reduce((a, s) => a + s.v, 0);

  // 1) 비율 기반 raw (cap 안에서만)
  const raw = seg.map((s) => (s.v > 0 ? (s.v / sumV) * cap : 0));
  const flo = raw.map((x) => Math.floor(x));
  const frac = raw.map((x, i) => x - flo[i]);

  // 2) 기본 할당
  let h = [...flo];

  // 3) 0이 아닌 구간은 최소 effMin 보장 (가능할 때만)
  if (effMin > 0) {
    for (let i = 0; i < seg.length; i++) {
      if (seg[i].v > 0 && h[i] < effMin) h[i] = effMin;
    }
  }

  // 4) 합이 cap보다 크면, 큰 구간부터 effMin(또는 0)까지 깎기
  let over = h.reduce((a, x) => a + x, 0) - cap;
  if (over > 0) {
    const order = [...Array(seg.length).keys()].sort((a, b) => h[b] - h[a]);
    for (const idx of order) {
      const floorMin = seg[idx].v > 0 ? effMin : 0;
      while (over > 0 && h[idx] > floorMin) {
        h[idx] -= 1;
        over -= 1;
      }
      if (over <= 0) break;
    }
  }

  // 5) 합이 cap보다 작으면, 소수점(frac) 큰 순서로 채우기
  let under = cap - h.reduce((a, x) => a + x, 0);
  if (under > 0) {
    const order = [...Array(seg.length).keys()].sort((a, b) => frac[b] - frac[a]);
    let k = 0;
    while (under > 0) {
      const idx = order[k % order.length];
      if (seg[idx].v > 0) {
        h[idx] += 1;
        under -= 1;
      }
      k += 1;
      if (k > 10000) break; // 안전장치
    }
  }

  return {
    hc: Math.max(0, h[0]),
    hg: Math.max(0, h[1]),
    hk: Math.max(0, h[2]),
  };
}

export default function CashFlowLayerChart({
  title,
  subtitle,
  yearSummary = [],
  numberLocale = "ko-KR",
  currency = "KRW",
}) {
  const isKo = String(numberLocale || "").startsWith("ko");

  const rows = (yearSummary || []).map((r) => {
    const y = Number(r.year) || 0;
    const contrib = Number(r.contributionYear) || 0;
    const growth = Number(r.interestYearNet) || 0;
    const cost = (Number(r.taxYear) || 0) + (Number(r.feeYear) || 0);
    const total = contrib + growth + cost;
    return { year: y, contrib, growth, cost, total };
  });

  if (!rows.length) return null;

  const maxTotal = Math.max(...rows.map((r) => r.total), 1);

  const chartH = 180;
  const barH = chartH - 4;

  const tTitle =
    title || (isKo ? "연도별 현금흐름 레이어" : "Yearly Cash Flow Layer");
  const tSub =
    subtitle ||
    (isKo
      ? "연간 납입금(Contribution) · 연간 성장(Growth) · 연간 비용(Tax+Fee)을 누적 막대로 보여줍니다."
      : "Stacked bars show yearly contribution, growth, and cost (tax+fee).");

  const legend = isKo
    ? [
        { key: "contrib", label: "연간 납입금", cls: "bg-sky-500" },
        { key: "growth", label: "연간 성장(세후 이자)", cls: "bg-emerald-500" },
        { key: "cost", label: "연간 비용(세금+수수료)", cls: "bg-rose-500" },
      ]
    : [
        { key: "contrib", label: "Contribution", cls: "bg-sky-500" },
        { key: "growth", label: "Growth (net interest)", cls: "bg-emerald-500" },
        { key: "cost", label: "Cost (tax+fee)", cls: "bg-rose-500" },
      ];

  // -----------------------------
  // Custom tooltip (follow mouse)
  // -----------------------------
  const wrapRef = useRef(null);
  const tipRef = useRef(null);

  const [hoverRow, setHoverRow] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [wrapSize, setWrapSize] = useState({ w: 0, h: 0 });
  const [tipSize, setTipSize] = useState({ w: 260, h: 140 });

  const onMove = (e, row) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setWrapSize({ w: rect.width, h: rect.height });
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setHoverRow(row);
  };

  const onLeave = () => setHoverRow(null);

  useLayoutEffect(() => {
    if (!tipRef.current) return;
    const r = tipRef.current.getBoundingClientRect();
    setTipSize({ w: r.width, h: r.height });
  }, [hoverRow, currency, numberLocale]);

  const fmtShort = (v) => formatMoneyShort(v, numberLocale);
  const fmtFull = (v) => formatMoneyFull(v, currency, numberLocale);

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold">{tTitle}</h2>
          <p className="text-sm text-slate-600 mt-1">{tSub}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-3">
        {legend.map((it) => (
          <div key={it.key} className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded ${it.cls}`} />
            <span>{it.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[640px]">
          <div ref={wrapRef} className="relative" style={{ height: barH }}>
            <div className="flex items-end gap-2 h-full">
              {rows.map((r) => {

                const HEADROOM = 1.15;
                const scaleMax = maxTotal * HEADROOM;
                // ✅ 이 연도의 "총 막대 높이"를 먼저 정수 픽셀로 확정                
                const cap = Math.max(0, Math.floor((r.total / scaleMax) * barH));

                // ✅ cap 안에서 3개를 정수 픽셀로 배분 (cost가 0이 아니면 가능한 한 minPx 보장)
                const { hc, hg, hk } = stackHeightsPixels({
                  contrib: r.contrib,
                  growth: r.growth,
                  cost: r.cost,
                  cap,
                  minPx: 4,
                });

                const ariaText = isKo
                  ? `Y${r.year} 납입 ${fmtShort(r.contrib)}, 성장 ${fmtShort(
                      r.growth
                    )}, 비용 ${fmtShort(r.cost)}, 합계 ${fmtShort(r.total)}`
                  : `Y${r.year} Contribution ${fmtShort(
                      r.contrib
                    )}, Growth ${fmtShort(r.growth)}, Cost ${fmtShort(
                      r.cost
                    )}, Total ${fmtShort(r.total)}`;

                return (
                  <div key={r.year} className="flex-1 min-w-[44px]">
                    <div
                      className="w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                      style={{ height: barH }}
                      aria-label={ariaText}
                      onMouseMove={(e) => onMove(e, r)}
                      onMouseEnter={(e) => onMove(e, r)}
                      onMouseLeave={onLeave}
                    >
                      <div className="w-full h-full flex flex-col justify-end">
                        {hk > 0 && (
                          <div className="w-full bg-rose-500/90" style={{ height: hk }} />
                        )}
                        {hg > 0 && (
                          <div className="w-full bg-emerald-500/90" style={{ height: hg }} />
                        )}
                        {hc > 0 && (
                          <div className="w-full bg-sky-500/90" style={{ height: hc }} />
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-center text-slate-600">
                      Y{r.year}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✅ Custom tooltip */}
            {hoverRow && (
              <div
                className="pointer-events-none absolute z-50"
                style={{
                  left: clamp(
                    mouse.x + 14,
                    12,
                    Math.max(12, wrapSize.w - tipSize.w - 12)
                  ),
                  top: clamp(
                    mouse.y + 14,
                    12,
                    Math.max(12, wrapSize.h - tipSize.h - 12)
                  ),
                }}
              >
                <div
                  ref={tipRef}
                  className="rounded-xl border border-slate-200 bg-white shadow-lg px-3 py-2"
                >
                  <div className="text-xs text-slate-500 mb-1">
                    {isKo ? `${hoverRow.year}년` : `Year ${hoverRow.year}`}
                  </div>

                  <div className="grid gap-1 text-sm">
                    <div className="flex justify-between gap-6">
                      <span className="text-slate-600">{isKo ? "납입" : "Contribution"}</span>
                      <span className="font-semibold">
                        {fmtShort(hoverRow.contrib)}{" "}
                        <span className="text-xs text-slate-500">({fmtFull(hoverRow.contrib)})</span>
                      </span>
                    </div>

                    <div className="flex justify-between gap-6">
                      <span className="text-slate-600">{isKo ? "성장" : "Growth"}</span>
                      <span className="font-semibold">
                        {fmtShort(hoverRow.growth)}{" "}
                        <span className="text-xs text-slate-500">({fmtFull(hoverRow.growth)})</span>
                      </span>
                    </div>

                    <div className="flex justify-between gap-6">
                      <span className="text-slate-600">{isKo ? "비용" : "Cost (Tax+Fee)"}</span>
                      <span className="font-semibold">
                        {fmtShort(hoverRow.cost)}{" "}
                        <span className="text-xs text-slate-500">({fmtFull(hoverRow.cost)})</span>
                      </span>
                    </div>

                    <div className="border-t pt-1 mt-1 flex justify-between gap-6">
                      <span className="text-slate-700 font-medium">{isKo ? "합계" : "Total"}</span>
                      <span className="font-bold">
                        {fmtShort(hoverRow.total)}{" "}
                        <span className="text-xs text-slate-500">({fmtFull(hoverRow.total)})</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="border rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">
                {isKo ? "마지막 연도 납입금" : "Last Year Contribution"}
              </div>
              <div className="font-semibold">
                <ValueDisplay value={rows[rows.length - 1].contrib} locale={numberLocale} currency={currency} />
              </div>
            </div>

            <div className="border rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">
                {isKo ? "마지막 연도 성장" : "Last Year Growth"}
              </div>
              <div className="font-semibold">
                <ValueDisplay value={rows[rows.length - 1].growth} locale={numberLocale} currency={currency} />
              </div>
            </div>

            <div className="border rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">
                {isKo ? "마지막 연도 비용" : "Last Year Cost"}
              </div>
              <div className="font-semibold">
                <ValueDisplay value={rows[rows.length - 1].cost} locale={numberLocale} currency={currency} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-3">
        {isKo
          ? "※ 성장(Growth)은 세후 이자(interestYearNet) 기준이며, 비용은 세금(taxYear)+수수료(feeYear) 합계입니다."
          : "※ Growth uses net interest (interestYearNet). Cost is taxYear + feeYear."}
      </p>
    </div>
  );
}
