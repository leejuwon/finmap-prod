// _components/AdInArticle.js
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AD_CLIENT } from "../config/adSlots";

export default function AdInArticle({
  client = AD_CLIENT,
  slot,
}) {  

  const [mounted, setMounted] = useState(false);
  const adRef = useRef(null);
  const loadedRef = useRef(false);
  const retryRef = useRef(0);
  const timerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
     setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!slot) return;
    if (!adRef.current) return;
    if (typeof window === "undefined") return;

    // slot/client 변경 시 재시도 가능하게 리셋
    loadedRef.current = false;
    retryRef.current = 0;

    const tryPush = () => {
      if (!adRef.current) return;
      if (loadedRef.current) return;

      // ✅ 이미 처리했거나, 우리 코드가 push 성공한 흔적이면 중복 push 방지
      const status = adRef.current.getAttribute("data-adsbygoogle-status");
      const pushed = adRef.current.getAttribute("data-fm-ads-pushed");
      if (status || pushed) {
        loadedRef.current = true;
        return;
      }

      try {
        // ✅ 스크립트 준비 전이면 잠깐 대기 (push로 예외 내지 않기)
        if (!window.adsbygoogle || typeof window.adsbygoogle.push !== "function") {
          retryRef.current += 1;
          if (retryRef.current <= 25) {
            timerRef.current = setTimeout(tryPush, 200);
          }
          return;
        }

        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adRef.current.setAttribute("data-fm-ads-pushed", "1");
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
  }, [mounted, slot, client, router.asPath]);

  if (!mounted) {    
    return <div style={{ minHeight: 120 }} />;
  }

  if (!slot) return null;

  return (
    <ins
      key={`${slot}-${router.asPath}`}
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
