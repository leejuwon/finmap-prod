// _components/AdResponsive.js
import { useEffect, useRef } from "react";

export default function AdResponsive({ 
  client = "ca-pub-1869932115288976", 
  slot, 
  align = "center" 
}) {
  const adRef = useRef(null);
  const loadedRef = useRef(false); // 성공적으로 push 되었는지
  const retryRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!adRef.current) return;
    if (loadedRef.current) return;
    if (typeof window === "undefined") return;

    const tryPush = () => {
      if (!adRef.current) return;
      if (loadedRef.current) return;

      // 광고 로더가 아직 로드되지 않았을 수 있음 → 재시도
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        loadedRef.current = true; // ✅ 성공 후에만 true
      } catch (e) {
        retryRef.current += 1;
        // 너무 시끄럽지 않게 1~2번만 로그 (원하면 조절)
        if (retryRef.current <= 2) {
          console.warn("AdSense push retry...", e);
        }
        if (retryRef.current <= 6) {
          timerRef.current = setTimeout(tryPush, 800);
        }
      }
    };

    // 첫 시도
    tryPush();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
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
