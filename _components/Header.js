// _components/Header.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const navItems = [
  {
    key: 'home',
    href: '/',
    labelKo: '홈',
    labelEn: 'Home',
  },
  {
    key: 'economics',
    href: '/category/economics',   // 🔹 URL은 그대로 유지
    labelKo: '경제기초',
    labelEn: 'Economics',
  },
  {
    key: 'investing',
    href: '/category/investing',
    labelKo: '재테크',
    labelEn: 'Investing',
  },
  {
    key: 'tax',
    href: '/category/tax',
    labelKo: '세금',
    labelEn: 'Tax',
  },
  {
    key: 'compound',
    href: '/tools/compound-interest',
    labelKo: '복리 계산기',
    labelEn: 'Compound Calculator',
  },
  {
    key: 'goal',
    href: '/tools/goal-simulator',
    labelKo: '목표자산 시뮬레이터',
    labelEn: 'Goal Simulator',
  },
];

export default function Header() {
  const router = useRouter();
  const [lang, setLang] = useState('ko'); // 'ko' | 'en'

  // 브라우저에서 저장된 언어 불러오기
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('fm_lang');
    if (saved === 'ko' || saved === 'en') {
      setLang(saved);
    }
  }, []);

  const toggleLang = () => {
    const next = lang === 'ko' ? 'en' : 'ko';
    setLang(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('fm_lang', next);
    }
  };

  const isKo = lang === 'ko';

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
                {/* 슬로건도 언어에 따라 변경 */}
                <span className="hidden sm:block text-[11px] text-slate-500">
                  {isKo
                    ? '금융 기초 · 투자계획 지도'
                    : 'Personal finance & investing map'}
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

              const label = isKo ? item.labelKo : item.labelEn;

              return (
                <Link key={item.key} href={item.href} passHref>
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

          {/* 우측: 도메인 + 언어 스위처 */}
          <div className="ml-auto flex items-center gap-2">
            <span className="header-domain text-[10px] sm:text-xs md:text-sm text-slate-500">
              finmaphub.com
            </span>
            <button
              type="button"
              onClick={toggleLang}
              className="btn-secondary !px-2 !py-1 text-[10px] sm:text-xs"
            >
              {isKo ? 'EN' : 'KO'}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
