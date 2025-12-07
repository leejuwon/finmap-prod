// _components/AdResponsive.js
import { useEffect, useRef } from "react";

export default function AdResponsive({ 
  client = "ca-pub-1869932115288976", 
  slot, 
  align = "center" 
}) {
  const adRef = useRef(null);
  const loadedRef = useRef(false); // 광고 중복 로딩 방지

  useEffect(() => {
    if (!adRef.current || loadedRef.current) return;

    // 광고 로드 시도
    try {
      loadedRef.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div style={{ textAlign: align }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
