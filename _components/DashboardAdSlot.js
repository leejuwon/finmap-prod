import { useEffect, useRef } from "react";
import AdSenseUnit from "./AdSenseUnit";
import { trackGaEvent } from "../utils/analytics";

export default function DashboardAdSlot({
  slot,
  page,
  position,
  className = "",
  label = "광고",
  minHeight = 160,
}) {
  const trackedRef = useRef(false);
  const minHeightValue = typeof minHeight === "number" ? `${minHeight}px` : minHeight;
  const adKey = `dashboard-${page || "unknown"}-${position || "slot"}-${slot || "empty"}`;

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackGaEvent("dashboard_ad_slot_render", {
      page: page || "unknown",
      position: position || "unknown",
    });
  }, [page, position]);

  if (!slot) return null;

  return (
    <aside
      className={`my-6 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50/70 p-2 ${className}`}
      style={{ minHeight: minHeightValue }}
      aria-label={label}
    >
      {label && <div className="mb-1 px-1 text-[11px] font-medium text-slate-400">{label}</div>}
      <AdSenseUnit slot={slot} className="w-full" adKey={adKey} />
    </aside>
  );
}
