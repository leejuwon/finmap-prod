import { useEffect, useRef } from "react";
import AdSenseUnit from "./AdSenseUnit";
import { trackGaEvent } from "../utils/analytics";

export default function ResultAdSlot({
  slot,
  tool,
  position,
  locale = "ko",
  className = "",
  label,
  minHeight = 160,
}) {
  const containerRef = useRef(null);
  const trackedRef = useRef(false);
  const minHeightValue = typeof minHeight === "number" ? `${minHeight}px` : minHeight;
  const displayLabel = label ?? (locale === "en" ? "Advertisement" : "광고");
  const adKey = `result-${tool || "unknown"}-${position || "slot"}-${slot || "empty"}`;

  useEffect(() => {
    if (!slot || !containerRef.current || trackedRef.current) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5);
        if (!isVisible || trackedRef.current) return;

        trackedRef.current = true;
        trackGaEvent("result_ad_view", {
          source_tool: tool || "unknown",
          position: position || "unknown",
          locale,
        });
        observer.disconnect();
      },
      { threshold: [0.5] }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [locale, position, slot, tool]);

  if (!slot) return null;

  return (
    <aside
      ref={containerRef}
      className={`my-6 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50/70 p-2 ${className}`}
      style={{ minHeight: minHeightValue }}
      aria-label={displayLabel}
    >
      {displayLabel && <div className="mb-1 px-1 text-[11px] font-medium text-slate-400">{displayLabel}</div>}
      <AdSenseUnit slot={slot} className="w-full" adKey={adKey} />
    </aside>
  );
}
