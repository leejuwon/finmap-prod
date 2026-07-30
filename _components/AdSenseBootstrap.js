import { useEffect } from "react";

export const ADSENSE_CLIENT = "ca-pub-1869932115288976";
export const ADSENSE_BOOTSTRAP_ID = "finmap-adsense-bootstrap";
export const ADSENSE_BOOTSTRAP_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

let bootstrapPromise = null;

function findExistingBootstrap() {
  if (typeof document === "undefined") return null;
  return (
    document.getElementById(ADSENSE_BOOTSTRAP_ID) ||
    document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')
  );
}

export function ensureAdSenseBootstrap() {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  window.adsbygoogle = window.adsbygoogle || [];

  const existing = findExistingBootstrap();
  if (existing) {
    if (!existing.getAttribute("data-finmap-adsense-bootstrap")) {
      existing.setAttribute("data-finmap-adsense-bootstrap", "post-hydration-singleton");
    }
    return bootstrapPromise || Promise.resolve(existing);
  }

  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = ADSENSE_BOOTSTRAP_ID;
    script.async = true;
    script.src = ADSENSE_BOOTSTRAP_SRC;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-finmap-adsense-bootstrap", "post-hydration-singleton");
    script.onload = () => {
      window.__FINMAP_ADSENSE_BOOTSTRAP_READY__ = true;
      resolve(script);
    };
    script.onerror = () => {
      window.__FINMAP_ADSENSE_BOOTSTRAP_READY__ = false;
      bootstrapPromise = null;
      reject(new Error("adsense-bootstrap-load-error"));
    };
    document.head.appendChild(script);
  });

  return bootstrapPromise;
}

export default function AdSenseBootstrap() {
  useEffect(() => {
    ensureAdSenseBootstrap()?.catch(() => {});
  }, []);

  return null;
}
