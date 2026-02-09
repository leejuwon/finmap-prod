// _components/AdInArticle.js
import { useEffect, useRef, useState } from "react";

export default function AdInArticle({
  client = "ca-pub-1869932115288976",
  slot,
}) {
  if (!slot) return null;

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
    if (typeof window === "undefined") return;

    // slot/client 변경 시 재시도 가능하게 리셋
    loadedRef.current = false;
    retryRef.current = 0;

    const tryPush = () => {
      if (!adRef.current) return;
      if (loadedRef.current) return;

      // 이미 AdSense가 처리한 ins면 중복 push 방지
      const status = adRef.current.getAttribute("data-adsbygoogle-status");
      if (status) {
        loadedRef.current = true;
        return;
      }

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
