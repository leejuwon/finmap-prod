// _components/AdInArticle.js
import { useRef } from "react";
import { useRouter } from "next/router";
import { AD_CLIENT } from "../config/adSlots";
import { useAdSenseSlot } from "./useAdSenseSlot";

export default function AdInArticle({
  client = AD_CLIENT,
  slot,
}) {  
  const adRef = useRef(null);
  const router = useRouter();
  const resetKey = `${client || "client"}-${slot || "empty"}-${router.asPath || "route"}`;

  useAdSenseSlot({
    enabled: Boolean(slot),
    slotRef: adRef,
    resetKey,
    debugLabel: `in-article:${slot || "unknown"}`,
  });

  if (!slot) return null;

  return (
    <ins
      key={`${slot}-${router.asPath || "route"}`}
      ref={adRef}
      className="adsbygoogle"
      style={{ display: "block", textAlign: "center", minHeight: "120px" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="fluid"
      data-ad-layout="in-article"
      data-full-width-responsive="true"
    />
  );
}
