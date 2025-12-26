// utils/share.js

function getMeta(nameOrProp) {
  if (typeof document === "undefined") return "";
  const el =
    document.querySelector(`meta[property="${nameOrProp}"]`) ||
    document.querySelector(`meta[name="${nameOrProp}"]`);
  return el?.getAttribute("content") || "";
}

function toAbsUrl(inputUrl) {
  if (typeof window === "undefined") return inputUrl || "";
  const origin = window.location.origin;
  const u = inputUrl || "";
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${origin}${u}`;
  return `${origin}/${u}`;
}

// ✅ Web Share API: 기존처럼 shareWeb()도 되고, shareWeb({title,text,url})도 됨
export async function shareWeb(options = {}) {
  if (typeof window === "undefined") return false;
  if (!navigator?.share) return false;

  const title = options.title || document.title || "FinMap";
  const text =
    options.text ||
    getMeta("description") ||
    "FinMap calculator result";
  const url = options.url || window.location.href;

  try {
    await navigator.share({ title, text, url });
    return true;
  } catch (e) {
    return false;
  }
}

// ✅ URL 복사: copyUrl()도 되고 copyUrl("복사 완료!")도 됨
export async function copyUrl(message) {
  if (typeof window === "undefined") return false;
  const url = window.location.href;

  const defaultMsg =
    (typeof navigator !== "undefined" && (navigator.language || "").startsWith("ko"))
      ? "URL이 복사되었습니다."
      : "URL copied!";

  const msg = message || defaultMsg;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      alert(msg);
      return true;
    }
  } catch (e) {
    // fallback below
  }

  // Fallback: execCommand
  try {
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    alert(msg);
    return true;
  } catch (e) {
    return false;
  }
}

// ✅ Kakao: imageUrl 옵션 지원 + 없으면 og:image → 기본 이미지 순으로 사용
export function shareKakao({ title, description, url, imageUrl }) {
  if (typeof window === "undefined") return false;
  if (!window.Kakao) return false;

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
  }

  const shareUrl = toAbsUrl(url || window.location.href);
  const ogImg = getMeta("og:image") || "/og-default.png";
  const finalImg = toAbsUrl(imageUrl || ogImg);

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: title || document.title || "FinMap",
      description: description || getMeta("description") || "",
      imageUrl: finalImg,
      link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
    },
    buttons: [
      {
        title: "자세히 보기",
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
    ],
  });
  return true;
}

export function shareNaver({ title, url }) {
  if (typeof window === "undefined") return false;
  const shareUrl = toAbsUrl(url || window.location.href);
  const shareTitle = title || document.title || "FinMap";

  const naver =
    "https://share.naver.com/web/shareView?url=" +
    encodeURIComponent(shareUrl) +
    "&title=" +
    encodeURIComponent(shareTitle);
  window.open(naver, "_blank");
  return true;
}