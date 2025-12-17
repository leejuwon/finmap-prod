import { useEffect, useMemo, useState } from "react";
import {
  ShareIcon,
  ArrowDownTrayIcon as DownloadIcon,
} from "@heroicons/react/24/outline";

export default function CTABar({
  locale = "ko",
  onDownloadPDF,
  onShare,

  // ✅ PRO mode options
  mode = "basic", // "basic" | "pro"
  alwaysVisible = false, // PRO에서는 true 권장
  onNavigate, // (key) => void
  activeKey, // optional: "sum" | "chart" | "insight" | "cta"
}) {
  const isKo = locale === "ko";
  const isPro = mode === "pro";

  const navItems = useMemo(() => {
    if (!isPro) return [];
    return [
      { key: "sum", label: isKo ? "요약" : "Summary" },
      { key: "chart", label: isKo ? "차트" : "Chart" },
      { key: "insight", label: isKo ? "해석" : "Insights" },
      { key: "cta", label: "CTA" },
    ];
  }, [isPro, isKo]);

  const [visible, setVisible] = useState(alwaysVisible);
  const [localActive, setLocalActive] = useState(activeKey || "sum");

  // 외부에서 activeKey를 주면 동기화
  useEffect(() => {
    if (activeKey) setLocalActive(activeKey);
  }, [activeKey]);

  // ✅ basic 모드일 때만 "스크롤 비율"로 노출 (PRO는 항상 노출 권장)
  useEffect(() => {
    if (alwaysVisible || isPro) {
      setVisible(true);
      return;
    }

    const handler = () => {
      const denom = document.body.scrollHeight - window.innerHeight;
      const ratio = denom > 0 ? window.scrollY / denom : 0;
      setVisible(ratio > 0.45);
    };

    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [alwaysVisible, isPro]);

  if (!visible) return null;

  const onClickNav = (key) => {
    setLocalActive(key);
    onNavigate && onNavigate(key);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/90 backdrop-blur shadow-lg">
      <div className="max-w-2xl mx-auto p-2.5">
        {/* ✅ PRO: 섹션 네비 (요약→차트→해석→CTA) */}
        {isPro && (
          <div className="flex items-center gap-2 mb-2">
            {navItems.map((it) => {
              const active = localActive === it.key;
              return (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => onClickNav(it.key)}
                  className={[
                    "flex-1 rounded-lg px-2 py-2 text-xs font-semibold border",
                    active
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onDownloadPDF}
            className="btn-primary flex items-center gap-2 flex-1"
          >
            <DownloadIcon className="w-5 h-5" />
            {isKo ? "PDF 저장" : "Save PDF"}
          </button>

          <button
            type="button"
            onClick={onShare}
            className="btn-secondary flex items-center gap-2 flex-1"
          >
            <ShareIcon className="w-5 h-5" />
            {isKo ? "공유하기" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
