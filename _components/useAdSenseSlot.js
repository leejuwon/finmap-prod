import { useEffect, useRef } from "react";

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_RETRY_MS = 500;

function isDebugEnabled() {
  if (typeof window === "undefined") return false;
  if (window.__FINMAP_ADS_DEBUG__ === true) return true;

  try {
    if (window.localStorage?.getItem("finmap_ads_debug") === "1") return true;
  } catch {}

  try {
    return new URLSearchParams(window.location.search).get("adDebug") === "1";
  } catch {
    return false;
  }
}

function debugLog(...args) {
  if (!isDebugEnabled()) return;
  console.debug("[finmap-ads]", ...args);
}

export function useAdSenseSlot({
  enabled,
  slotRef,
  resetKey,
  rootMargin = "300px",
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  retryMs = DEFAULT_RETRY_MS,
  debugLabel = "ad-slot",
}) {
  const pushedRef = useRef(false);
  const attemptsRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof window === "undefined") return undefined;

    const clearTimer = () => {
      if (!timerRef.current) return;
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    pushedRef.current = false;
    attemptsRef.current = 0;
    clearTimer();

    let cancelled = false;
    let observer = null;

    const scheduleRetry = (attempt) => {
      if (attempt >= maxAttempts) return false;
      clearTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        tryPush();
      }, retryMs);
      return true;
    };

    const markFailed = (ins, reason) => {
      ins.setAttribute("data-fm-ads-push-failed", reason);
      ins.removeAttribute("data-fm-ads-push-pending");
      debugLog("push failed", { debugLabel, reason, attempts: attemptsRef.current });
    };

    const tryPush = () => {
      if (cancelled || pushedRef.current) return;

      const ins = slotRef.current;
      if (!ins || !ins.isConnected) return;

      const status = ins.getAttribute("data-adsbygoogle-status");
      const pushed = ins.getAttribute("data-fm-ads-pushed");
      if (status || pushed) {
        pushedRef.current = true;
        ins.removeAttribute("data-fm-ads-push-pending");
        debugLog("push skipped, already handled", { debugLabel, status, pushed });
        return;
      }

      attemptsRef.current += 1;
      ins.setAttribute("data-fm-ads-push-pending", "1");
      ins.setAttribute("data-fm-ads-push-attempts", String(attemptsRef.current));

      if (!window.adsbygoogle || typeof window.adsbygoogle.push !== "function") {
        if (!scheduleRetry(attemptsRef.current)) markFailed(ins, "script-not-ready");
        return;
      }

      try {
        window.adsbygoogle.push({});
        ins.setAttribute("data-fm-ads-pushed", "1");
        ins.removeAttribute("data-fm-ads-push-pending");
        ins.removeAttribute("data-fm-ads-push-failed");
        pushedRef.current = true;
        debugLog("push success", { debugLabel, attempts: attemptsRef.current });
      } catch (error) {
        if (!scheduleRetry(attemptsRef.current)) {
          markFailed(ins, "push-error");
          debugLog(error);
        }
      }
    };

    const startPush = () => {
      if (timerRef.current || pushedRef.current) return;
      tryPush();
    };

    const ins = slotRef.current;
    if (!ins) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      startPush();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) startPush();
        },
        { rootMargin }
      );
      observer.observe(ins);
    }

    return () => {
      cancelled = true;
      clearTimer();
      if (observer) observer.disconnect();
    };
  }, [debugLabel, enabled, maxAttempts, resetKey, retryMs, rootMargin, slotRef]);
}
