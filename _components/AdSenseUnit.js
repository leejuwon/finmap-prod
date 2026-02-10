import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AD_CLIENT } from "../config/adSlots";

export default function AdSenseUnit({ slot, className = "", adTest = false }) {
  const router = useRouter();
  const insRef = useRef(null);
  const timerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!slot) return;
    if (!mounted) return;

    let cancelled = false;
    let tries = 0;

    const tick = () => {
      if (cancelled) return;
      tries += 1;

      const ins = insRef.current;
      if (!ins) return;

      // ✅ adsbygoogle 스크립트가 아직 준비 안 됐으면 잠깐 대기
      if (!window.adsbygoogle || typeof window.adsbygoogle.push !== "function") {
        if (tries < 25) timerRef.current = setTimeout(tick, 200);
        return;
      }

      // ✅ 이미 채워진 광고면 재-push 하지 않음
      const status = ins.getAttribute("data-adsbygoogle-status");
      if (status) return;

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (_) {
        // AdSense 내부 예외는 무시 (앱 기능 영향 없게)
      }
    };

    tick();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted, slot, router.asPath, adTest]);

  if (!slot) return null;

  // ✅ 핵심: SSR 단계에서는 <ins.adsbygoogle>를 절대 렌더하지 않음
  if (!mounted) {
    return <div className={className} style={{ minHeight: 120 }} />;
  }

  return (
    <div className={className}>
      <ins
        key={`${slot}-${router.asPath}`}   // ✅ 라우트 바뀌면 ins를 새로 마운트
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(adTest ? { "data-adtest": "on" } : {})}
      />
    </div>
  );
}