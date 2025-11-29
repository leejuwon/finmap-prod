// _components/Header.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getInitialLang, setLang } from '../lib/lang';

const navItems = [
  { href: '/', labelKo: '홈',         labelEn: 'Home' },
  { href: '/category/economicInfo', labelKo: '경제정보',   labelEn: 'Economic Info' },
  { href: '/category/personalFinance', labelKo: '재테크',   labelEn: 'Personal Finance' },
  { href: '/category/investingInfo', labelKo: '투자정보',   labelEn: 'Investing Info' },
  { href: '/tools',              labelKo: '금융도구',     labelEn: 'Personal Finance Tools' },
];

export default function Header() {
  const router = useRouter();
  const [lang, setLangState] = useState('ko');

  // 클라이언트에서 초기 언어 동기화
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initial = getInitialLang();
    setLangState(initial);

    const handler = (e) => {
      setLangState(e.detail || 'ko');
    };
    window.addEventListener('fm_lang_change', handler);
    return () => window.removeEventListener('fm_lang_change', handler);
  }, []);

  const handleLangChange = (next) => {
    setLang(next);        // 쿠키 + 이벤트
    setLangState(next);   // 헤더 내부 상태
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-100">
      <nav className="w-full px-3 sm:px-4">
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex items-center gap-3 py-2 sm:py-3">
          {/* 로고 */}
          <Link href="/" passHref>
            <a className="flex items-center gap-2">
              <img
                src="/logo-finmap.svg"
                alt="FinMap 로고"
                className="h-8 w-auto"
              />
              <div className="leading-tight">
                <span className="block text-sm sm:text-base font-semibold text-slate-900">
                  FinMap
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500">
                  {lang === 'ko' ? '금융 기초 · 투자계획 지도' : 'Personal Finance · Investing Map'}
                </span>
              </div>
            </a>
          </Link>

          {/* 네비게이션 */}
          <div className="header-nav flex items-center gap-1 sm:gap-2 ml-2 sm:ml-6 text-[10px] sm:text-sm">
            {navItems.map((item) => {
              const active =
                item.href === '/'
                  ? router.pathname === '/'
                  : router.pathname.startsWith(item.href);

              const label = lang === 'ko' ? item.labelKo : item.labelEn;

              return (
                <Link key={item.href} href={item.href} passHref>
                  <a
                    className={
                      'px-2 sm:px-3 py-1 rounded-full transition-colors ' +
                      (active
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                    }
                  >
                    {label}
                  </a>
                </Link>
              );
            })}
          </div>

          {/* 우측: 언어 토글 + 도메인 */}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex border border-slate-200 rounded-full 
                            text-[9px] sm:text-[11px] md:text-xs 
                            overflow-hidden">

              <button
                type="button"
                onClick={() => handleLangChange('ko')}
                className={
                  'px-1.5 py-0.5 sm:px-2 sm:py-1 ' +
                  (lang === 'ko'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600')
                }
              >
                한국어
              </button>

              <button
                type="button"
                onClick={() => handleLangChange('en')}
                className={
                  'px-1.5 py-0.5 sm:px-2 sm:py-1 ' +
                  (lang === 'en'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600')
                }
              >
                EN
              </button>
            </div>

            <span className="header-domain 
                            text-[9px] sm:text-[11px] md:text-sm 
                            text-slate-500">
              finmaphub.com
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
