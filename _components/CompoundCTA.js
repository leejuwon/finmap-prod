// _components/CompoundCTA.js
import {
  ShareIcon,
  ArrowDownTrayIcon as DownloadIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { shareKakao, shareWeb, copyUrl, shareNaver } from "../utils/share";

export default function CompoundCTA({ 
  locale = "ko", 
  onDownloadPDF,
  shareTitle,
  shareDescription, }) {
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
    <div className="card mt-4 w-full min-w-0 max-w-full border border-emerald-200 bg-emerald-50">
      <h3 className="mb-2 break-words text-lg font-semibold leading-snug">
        {isKo ? "결과 공유 및 저장" : "Share & Export"}
      </h3>

      <p className="mb-3 break-words text-xs leading-5 text-slate-700">
        {isKo
          ? "공유 링크에는 입력값이 포함되어 다시 열면 같은 조건이 복원됩니다."
          : "Shared links include your inputs, so the same setup is restored when opened."}
      </p>

      {/* Narrow mobile uses one column; wider phones use two, then sm uses three. */}
      <div className="grid min-w-0 grid-cols-1 gap-3 min-[390px]:grid-cols-2 sm:grid-cols-3">
        <button
          type="button"
          className="btn-primary flex w-full min-w-0 items-center justify-center gap-2"
          onClick={onDownloadPDF}
        >
          <DownloadIcon className="h-5 w-5 flex-shrink-0" />
          {isKo ? "PDF 다운로드" : "Download PDF"}
        </button>

        <button
          type="button"
          className="btn-secondary flex w-full min-w-0 items-center justify-center gap-2"
          onClick={handleShare}
        >
          <ShareIcon className="h-5 w-5 flex-shrink-0" />
          {isKo ? "공유하기" : "Share"}
        </button>

        <button
          type="button"
          className="btn-outline flex w-full min-w-0 items-center justify-center gap-2 min-[390px]:col-span-2 sm:col-span-1"
          onClick={() =>
            copyUrl(isKo ? "URL이 복사되었습니다!" : "URL copied!")
          }
        >
          🔗 {isKo ? "URL 복사" : "Copy URL"}
        </button>        
      </div>

      <div className="mt-3 flex min-w-0 items-start gap-2 break-words text-xs text-slate-600">
        <BellIcon className="h-4 w-4 flex-shrink-0" />
        {isKo
          ? "FinMap 앱 출시 시 계산 기록 연동을 지원할 예정입니다."
          : "FinMap app will support synced simulations at launch."}
      </div>
    </div>
  );
}
