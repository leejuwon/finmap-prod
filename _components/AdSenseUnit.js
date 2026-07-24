import { useRef } from "react";
import { useRouter } from "next/router";
import { AD_CLIENT } from "../config/adSlots";
import { useAdSenseSlot } from "./useAdSenseSlot";

export default function AdSenseUnit({ slot, className = "", adTest = false, adKey = "" }) {
  const router = useRouter();
  const insRef = useRef(null);
  const resetKey = `${slot || "empty"}-${adKey || "slot"}-${router.asPath || "route"}-${adTest ? "test" : "live"}`;

  useAdSenseSlot({
    enabled: Boolean(slot),
    slotRef: insRef,
    resetKey,
    debugLabel: `adsense-unit:${adKey || slot || "unknown"}`,
  });

  if (!slot) return null;

  return (
    <div className={className}>
      <ins
        key={adKey || `${slot}-${router.asPath || "route"}`}
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: 120 }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(adTest ? { "data-adtest": "on" } : {})}
      />
    </div>
  );
}
