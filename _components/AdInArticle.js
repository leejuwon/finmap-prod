// _components/AdInArticle.js
import { useEffect, useRef } from "react";

export default function AdInArticle({
  client = "ca-pub-1869932115288976",
  slot,
}) {
  const adRef = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!adRef.current || loadedRef.current) return;

    try {
      loadedRef.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <ins
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
