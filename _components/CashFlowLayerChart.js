// _components/CashFlowLayerChart.js
import { useRef, useState, useLayoutEffect, useEffect } from "react";
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

  const effMin =
    cap < activeCount ? 0 : Math.max(1, Math.min(minPx, Math.floor(cap / activeCount)));

  const sumV = active.reduce((a, s) => a + s.v, 0);

  const raw = seg.map((s) => (s.v > 0 ? (s.v / sumV) * cap : 0));
  const flo = raw.map((x) => Math.floor(x));
  const frac = raw.map((x, i) => x - flo[i]);

  let h = [...flo];

  if (effMin > 0) {
    for (let i = 0; i < seg.length; i++) {
      if (seg[i].v > 0 && h[i] < effMin) h[i] = effMin;
    }
  }

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
      if (k > 10000) break;
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

  // ✅ PRO 섹션 이동용(선택)
  sectionId,
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
  // Custom tooltip (hover + tap pin)
  // -----------------------------
  const wrapRef = useRef(null);
  const tipRef = useRef(null);

  const [hoverRow, setHoverRow] = useState(null);
  const [pinnedRow, setPinnedRow] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [wrapSize, setWrapSize] = useState({ w: 0, h: 0 });
  const [tipSize, setTipSize] = useState({ w: 260, h: 140 });

  // hover 가능한 환경인지(데스크톱) 판단 → 모바일은 탭 고정이 핵심
  const [canHover, setCanHover] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(hover: hover)");
    setCanHover(!!mq?.matches);
  }, []);

  const updatePointer = (e) => {
    if (!wrapRef.current) return { x: 0, y: 0, w: 0, h: 0 };

    const rect = wrapRef.current.getBoundingClientRect();

    // pointer/mouse/touch 모두 대응
    const pt =
      (e.touches && e.touches[0]) ||
      (e.changedTouches && e.changedTouches[0]) ||
      e;

    const x = (pt?.clientX ?? 0) - rect.left;
    const y = (pt?.clientY ?? 0) - rect.top;

    return { x, y, w: rect.width, h: rect.height };
  };

  const onMoveHover = (e, row) => {
    if (!canHover) return; // 모바일은 hover 의미 없음
    const p = updatePointer(e);
    setWrapSize({ w: p.w, h: p.h });
    setMouse({ x: p.x, y: p.y });
    setHoverRow(row);
  };

  const onLeaveHover = () => {
    if (!canHover) return;
    if (!pinnedRow) setHoverRow(null);
  };

  const onTapPin = (e, row) => {
    // 모바일/터치: 탭하면 고정, 다시 탭하면 해제
    const p = updatePointer(e);
    setWrapSize({ w: p.w, h: p.h });
    setMouse({ x: p.x, y: p.y });

    setPinnedRow((prev) => {
      const next = prev?.year === row.year ? null : row;
      setHoverRow(next ? row : null);
      return next;
    });
  };

  // 바깥 탭 시 고정 해제
  useEffect(() => {
    if (!pinnedRow) return;
    const onDoc = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        setPinnedRow(null);
        setHoverRow(null);
      }
    };
    document.addEventListener("pointerdown", onDoc, { passive: true });
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [pinnedRow]);

  useLayoutEffect(() => {
    if (!tipRef.current) return;
    const r = tipRef.current.getBoundingClientRect();
    setTipSize({ w: r.width, h: r.height });
  }, [hoverRow, pinnedRow, currency, numberLocale]);

  const fmtShort = (v) => formatMoneyShort(v, numberLocale);
  const fmtFull = (v) => formatMoneyFull(v, currency, numberLocale);

  const activeRow = pinnedRow || hoverRow;

  return (
    <section id={sectionId} className="card">
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

      {/* ✅ 모바일 힌트 */}
      <div className="sm:hidden text-[11px] text-slate-500 mb-2">
        {isKo ? "막대를 탭하면 상세 툴팁이 고정됩니다." : "Tap a bar to pin the tooltip."}
      </div>

      {/* Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[640px]">
          <div ref={wrapRef} className="relative" style={{ height: barH }}>
            <div className="flex items-end gap-2 h-full">
              {rows.map((r) => {
                const HEADROOM = 1.15;
                const scaleMax = maxTotal * HEADROOM;
                const cap = Math.max(0, Math.floor((r.total / scaleMax) * barH));

                const { hc, hg, hk } = stackHeightsPixels({
                  contrib: r.contrib,
                  growth: r.growth,
                  cost: r.cost,
                  cap,
                  minPx: 4,
                });

                const ariaText = isKo
                  ? `Y${r.year} 납입 ${fmtShort(r.contrib)}, 성장 ${fmtShort(r.growth)}, 비용 ${fmtShort(
                      r.cost
                    )}, 합계 ${fmtShort(r.total)}`
                  : `Y${r.year} Contribution ${fmtShort(r.contrib)}, Growth ${fmtShort(
                      r.growth
                    )}, Cost ${fmtShort(r.cost)}, Total ${fmtShort(r.total)}`;

                return (
                  <div key={r.year} className="flex-1 min-w-[44px]">
                    <div
                      className={`w-full rounded-lg overflow-hidden border bg-slate-50 ${
                        pinnedRow?.year === r.year
                          ? "border-slate-400"
                          : "border-slate-200"
                      }`}
                      style={{ height: barH }}
                      aria-label={ariaText}
                      tabIndex={0}
                      onMouseMove={(e) => onMoveHover(e, r)}
                      onMouseEnter={(e) => onMoveHover(e, r)}
                      onMouseLeave={onLeaveHover}
                      onTouchStart={(e) => onTapPin(e, r)}
                      onPointerDown={(e) => {
                        if (!canHover) onTapPin(e, r);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onTapPin(e, r);
                        }
                      }}
                    >
                      <div className="w-full h-full flex flex-col justify-end">
                        {hk > 0 && <div className="w-full bg-rose-500/90" style={{ height: hk }} />}
                        {hg > 0 && (
                          <div className="w-full bg-emerald-500/90" style={{ height: hg }} />
                        )}
                        {hc > 0 && <div className="w-full bg-sky-500/90" style={{ height: hc }} />}
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-center text-slate-600">
                      Y{r.year}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✅ Tooltip */}
            {activeRow && (
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
                    {isKo ? `${activeRow.year}년` : `Year ${activeRow.year}`}
                    {pinnedRow && (
                      <span className="ml-2 text-[10px] text-slate-400">
                        {isKo ? "고정됨" : "Pinned"}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-1 text-sm">
                    <div className="flex justify-between gap-6">
                      <span className="text-slate-600">{isKo ? "납입" : "Contribution"}</span>
                      <span className="font-semibold">
                        {fmtShort(activeRow.contrib)}{" "}
                        <span className="text-xs text-slate-500">
                          ({fmtFull(activeRow.contrib)})
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between gap-6">
                      <span className="text-slate-600">{isKo ? "성장" : "Growth"}</span>
                      <span className="font-semibold">
                        {fmtShort(activeRow.growth)}{" "}
                        <span className="text-xs text-slate-500">
                          ({fmtFull(activeRow.growth)})
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between gap-6">
                      <span className="text-slate-600">{isKo ? "비용" : "Cost (Tax+Fee)"}</span>
                      <span className="font-semibold">
                        {fmtShort(activeRow.cost)}{" "}
                        <span className="text-xs text-slate-500">
                          ({fmtFull(activeRow.cost)})
                        </span>
                      </span>
                    </div>

                    <div className="border-t pt-1 mt-1 flex justify-between gap-6">
                      <span className="text-slate-700 font-medium">{isKo ? "합계" : "Total"}</span>
                      <span className="font-bold">
                        {fmtShort(activeRow.total)}{" "}
                        <span className="text-xs text-slate-500">
                          ({fmtFull(activeRow.total)})
                        </span>
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
                <ValueDisplay
                  value={rows[rows.length - 1].contrib}
                  locale={numberLocale}
                  currency={currency}
                />
              </div>
            </div>

            <div className="border rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">
                {isKo ? "마지막 연도 성장" : "Last Year Growth"}
              </div>
              <div className="font-semibold">
                <ValueDisplay
                  value={rows[rows.length - 1].growth}
                  locale={numberLocale}
                  currency={currency}
                />
              </div>
            </div>

            <div className="border rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">
                {isKo ? "마지막 연도 비용" : "Last Year Cost"}
              </div>
              <div className="font-semibold">
                <ValueDisplay
                  value={rows[rows.length - 1].cost}
                  locale={numberLocale}
                  currency={currency}
                />
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
    </section>
  );
}
