// utils/share.js

export async function shareWeb() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "FinMap Compound Interest",
        text: "Check out my compound interest simulation!",
        url: window.location.href,
      });
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

export function copyUrl() {
  navigator.clipboard.writeText(window.location.href);
  alert("URL copied!");
}

export function shareKakao({ title, description, url }) {
  if (!window.Kakao) return;

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
  }

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl: "/og/compound.jpg",
      link: { mobileWebUrl: url, webUrl: url },
    },
    buttons: [
      {
        title: "자세히 보기",
        link: { mobileWebUrl: url, webUrl: url },
      },
    ],
  });
}

export function shareNaver({ title, url }) {
  const shareUrl =
    "https://share.naver.com/web/shareView?url=" +
    encodeURIComponent(url) +
    "&title=" +
    encodeURIComponent(title);

  window.open(shareUrl, "_blank");
}
