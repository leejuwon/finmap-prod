// _components/AdResponsive.js
import { useRef } from "react";
import { useRouter } from "next/router";
import { AD_CLIENT } from "../config/adSlots";
import { useAdSenseSlot } from "./useAdSenseSlot";


export default function AdResponsive({ 
  client = AD_CLIENT,
  slot, 
  align = "center" 
}) {  
  const adRef = useRef(null);
  const router = useRouter();
  const resetKey = `${client || "client"}-${slot || "empty"}-${router.asPath || "route"}`;

  useAdSenseSlot({
    enabled: Boolean(slot),
    slotRef: adRef,
    resetKey,
    debugLabel: `responsive:${slot || "unknown"}`,
  });

  if (!slot) return null;

  return (
    <div style={{ textAlign: align }}>
      <ins
        key={`${slot}-${router.asPath || "route"}`}
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: 120 }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
