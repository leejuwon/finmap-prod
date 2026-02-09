// _components/AdInArticle.js
import { useEffect, useRef, useState } from "react";

export default function AdInArticle({
  client = "ca-pub-1869932115288976",
  slot,
}) {
  const [mounted, setMounted] = useState(false);
  const adRef = useRef(null);
  const loadedRef = useRef(false);
  const retryRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
     setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!adRef.current) return;
    if (loadedRef.current) return;
    if (typeof window === "undefined") return;

    const tryPush = () => {
      if (!adRef.current) return;
      if (loadedRef.current) return;

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        loadedRef.current = true;
      } catch (e) {
        retryRef.current += 1;
        if (retryRef.current <= 2) {
          console.warn("AdSense push retry...", e);
        }
        if (retryRef.current <= 6) {
          timerRef.current = setTimeout(tryPush, 800);
        }
      }
    };

    tryPush();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted, slot, client]);

  if (!mounted) {
    return <div style={{ minHeight: 120 }} />;
  }

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
