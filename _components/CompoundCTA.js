import {
  ShareIcon,
  DownloadIcon,
  BellIcon
} from "@heroicons/react/outline";

import { shareKakao, shareWeb, copyUrl, shareNaver } from "../utils/share";

export default function CompoundCTA({ locale = "ko", onDownloadPDF }) {
  const isKo = locale === "ko";

  const handleShare = async () => {
    if (await shareWeb()) return;
    if (window?.Kakao) {
      shareKakao({
        title: isKo ? "FinMap 복리 계산 결과" : "Compound result",
        description: isKo
          ? "세전/세후, 복리·단리 비교까지 자동 생성!"
          : "Full breakdown of compound interest.",
        url: window.location.href,
      });
      return;
    }

    shareNaver({
      title: isKo ? "FinMap 복리 계산 결과" : "Compound Result",
      url: window.location.href,
    });
  };

  return (
    <div className="card mt-4 bg-emerald-50 border border-emerald-200">
      <h3 className="text-lg font-semibold mb-2">
        {isKo ? "결과 공유 및 저장" : "Share & Export"}
      </h3>

      <div className="grid sm:grid-cols-3 gap-3">
        <button
          className="btn-primary flex gap-2 items-center justify-center"
          onClick={onDownloadPDF}
        >
          <DownloadIcon className="w-5 h-5" />
          {isKo ? "PDF 다운로드" : "Download PDF"}
        </button>

        <button
          className="btn-secondary flex gap-2 items-center justify-center"
          onClick={handleShare}
        >
          <ShareIcon className="w-5 h-5" />
          {isKo ? "공유하기" : "Share"}
        </button>

        <button
          className="btn-outline flex gap-2 items-center justify-center"
          onClick={copyUrl}
        >
          🔗 {isKo ? "URL 복사" : "Copy URL"}
        </button>
        <button
          className="btn-outline flex gap-2 items-center justify-center"
          onClick={() => (window.location.href = "/tools/goal-simulator")}
        >
          {isKo ? "목표 시뮬레이터" : "Goal Simulator"}
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
