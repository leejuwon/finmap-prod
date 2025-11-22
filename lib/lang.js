// lib/lang.js

// 초깃값: 쿠키(fm_lang) → 브라우저 언어 → ko
export function getInitialLang() {
  if (typeof window === 'undefined') return 'ko';

  const match = document.cookie.match(/(?:^|;\s*)fm_lang=(ko|en)/);
  if (match && match[1]) return match[1];

  const nav = (navigator.language || 'ko').toLowerCase();
  if (nav.startsWith('en')) return 'en';
  return 'ko';
}

// 언어 설정 + 이벤트 브로드캐스트
export function setLang(lang) {
  if (typeof window === 'undefined') return;

  const safe = lang === 'en' ? 'en' : 'ko';

  // 1년짜리 쿠키
  document.cookie = `fm_lang=${safe}; path=/; max-age=31536000`;

  // 전역 커스텀 이벤트 (계산기 등에서 듣기)
  window.dispatchEvent(new CustomEvent('fm_lang_change', { detail: safe }));
}
