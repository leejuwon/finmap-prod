import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AD_CLIENT } from "../config/adSlots";

export default function AdSenseUnit({ slot, className = "", adTest = false }) {
  const router = useRouter();
  const insRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;
    if (!slot) return;
    if (!insRef.current) return;

    let cancelled = false;
    let tries = 0;

    const tick = () => {
      if (cancelled) return;
      if (loadedRef.current) return;
      tries += 1;

      const ins = insRef.current;
      if (!ins) return;

      if (!window.adsbygoogle || typeof window.adsbygoogle.push !== "function") {
        if (tries < 25) setTimeout(tick, 200);
        return;
      }

      const status = ins.getAttribute("data-adsbygoogle-status");
      const pushed = ins.getAttribute("data-fm-ads-pushed");
      if (status || pushed) {
        loadedRef.current = true;
        return;
      }

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        ins.setAttribute("data-fm-ads-pushed", "1");
        loadedRef.current = true;
      } catch (_) {}
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          tick();
        });
      },
      { rootMargin: "300px" }
    );

    io.observe(insRef.current);

    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [mounted, slot, router.asPath, adTest]);

  if (!slot) return null;

  // ✅ SSR/첫 클라 렌더에서는 ins를 안 찍어서 hydration mismatch 방지
  if (!mounted) {
    return <div className={className} style={{ minHeight: 120 }} />;
  }

  return (
    <div className={className}>
      <ins
        key={`${slot}-${router.asPath}`} // mounted 이후라 SSR mismatch 없음
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
