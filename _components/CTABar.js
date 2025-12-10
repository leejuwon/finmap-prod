import { useEffect, useState } from "react";
import { ShareIcon, DownloadIcon } from "@heroicons/react/outline";

export default function CTABar({ locale = "ko", onDownloadPDF, onShare }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      const scrolled =
        window.scrollY / (document.body.scrollHeight - window.innerHeight);

      setVisible(scrolled > 0.45);
    };

    window.addEventListener("scroll", handler); 
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!visible) return null;

  const isKo = locale === "ko";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 border-t shadow-lg backdrop-blur">
      <div className="max-w-2xl mx-auto p-3 flex items-center justify-between gap-3">
        <button
          onClick={onDownloadPDF}
          className="btn-primary flex items-center gap-2 flex-1"
        >
          <DownloadIcon className="w-5 h-5" />
          {isKo ? "PDF 저장" : "Save PDF"}
        </button>

        <button
          onClick={onShare}
          className="btn-secondary flex items-center gap-2 flex-1"
        >
          <ShareIcon className="w-5 h-5" />
          {isKo ? "공유하기" : "Share"}
        </button>
      </div>
    </div>
  );
}
