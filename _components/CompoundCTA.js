// _components/CompoundCTA.js
import {
  ShareIcon,
  ArrowDownTrayIcon as DownloadIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { shareKakao, shareWeb, copyUrl, shareNaver } from "../utils/share";

export default function CompoundCTA({ 
  locale = "ko", 
  onDownloadPDF,
  shareTitle,
  shareDescription, }) {
  const router = useRouter();
  const isKo = locale === "ko";

  const resolvedTitle =
    shareTitle ?? (isKo ? "FinMap 복리 계산 결과" : "Compound result");
  const resolvedDesc =
    shareDescription ??
    (isKo
      ? "세전/세후, 복리·단리 비교까지 자동 생성!"
      : "Full breakdown of compound interest.");

  const handleShare = async () => {
    // 1) Web Share API
    if (
      await shareWeb({
        title: resolvedTitle,
        text: resolvedDesc,
        url: window.location.href,
      })
    )
      return;

    // 2) Kakao SDK
    if (typeof window !== "undefined" && window?.Kakao) {
      shareKakao({
        title: resolvedTitle,
        description: resolvedDesc,
        url: window.location.href,
        imageUrl: "/og/og-default.png",
      });
      return;
    }

    // 3) Naver share (fallback)
    if (typeof window !== "undefined") {
      shareNaver({
        title: resolvedTitle,
        url: window.location.href,
      });
      return;
    }
  };

  return (
    <div className="card mt-4 bg-emerald-50 border border-emerald-200">
      <h3 className="text-lg font-semibold mb-2">
        {isKo ? "결과 공유 및 저장" : "Share & Export"}
      </h3>

      {/* ✅ 버튼 4개에 맞게: 모바일 2열, sm 이상 4열 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          className="btn-primary flex gap-2 items-center justify-center"
          onClick={onDownloadPDF}
        >
          <DownloadIcon className="w-5 h-5" />
          {isKo ? "PDF 다운로드" : "Download PDF"}
        </button>

        <button
          type="button"
          className="btn-secondary flex gap-2 items-center justify-center"
          onClick={handleShare}
        >
          <ShareIcon className="w-5 h-5" />
          {isKo ? "공유하기" : "Share"}
        </button>

        <button
          type="button"
          className="btn-outline flex gap-2 items-center justify-center"
          onClick={() =>
            copyUrl(isKo ? "URL이 복사되었습니다!" : "URL copied!")
          }
        >
          🔗 {isKo ? "URL 복사" : "Copy URL"}
        </button>        
      </div>

      <div className="mt-3 text-xs text-slate-600 flex gap-2 items-center">
        <BellIcon className="w-4 h-4" />
        {isKo
          ? "FinMap 앱 출시 시 계산 기록 연동을 지원할 예정입니다."
          : "FinMap app will support synced simulations at launch."}
      </div>
    </div>
  );
}
