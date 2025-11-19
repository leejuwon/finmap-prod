// config/adSlots.js
// AdSense 광고 단위를 한 곳에서 관리하기 위한 설정 파일
// 승인 전이면 slot ID는 빈 문자열("")로 두고, 승인 후 실제 ID만 넣으면 됨.

export const AD_CLIENT = "ca-pub-1869932115288976"; // 너 계정 ID

export const AD_SLOTS = {
  inArticle1: "1924002516",      // 기사 중간 광고 1
  inArticle2: "3101352817",      // 기사 중간 광고 2 (긴 글이면 두 개 가능)
  responsiveTop: "9858332854",   // 블로그 본문 상단
  responsiveBottom: "4881338348",// 본문 하단 [6657454443] 블로그 본문 상단과 같은 형태
  sidebar: "6085898367",         // 사이드바 광고(나중에 필요할 때)
};
