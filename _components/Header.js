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
    href: '/category/economics',
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
    key: 'tool',
    href: '/tools',
    labelKo: '계산기',
    labelEn: 'Calculator',
  },
];

export default function Header() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');

  // URL ?lang= 가 있으면 최우선, 없으면 localStorage
  useEffect(() => {
    if (router.query.lang === 'ko' || router.query.lang === 'en') {
      setLang(router.query.lang);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('fm_lang', router.query.lang);
      }
      return;
    }

    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('fm_lang');
      if (saved === 'ko' || saved === 'en') {
        setLang(saved);
      }
    }
  }, [router.query.lang]);

  const toggleLang = () => {
    const next = lang === 'ko' ? 'en' : 'ko';
    setLang(next);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('fm_lang', next);
      const { pathname, query } = router;
      const newQuery = { ...query, lang: next };

      router.push({ pathname, query: newQuery });
    }
  };

  const isKo = lang === 'ko';

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-100">
      <nav className="w-full px-3 sm:px-4">
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex items-center gap-3 py-2 sm:py-3">
          {/* 로고 */}
          <Link href={{ pathname: '/', query: { lang } }} passHref>
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
              const { pathname, query } = router;

              let active = false;
              if (item.key === 'home') {
                active = pathname === '/';
              } else if (item.key === 'tool') {
                active = pathname.startsWith('/tools');
              } else if (
                item.key === 'economics' ||
                item.key === 'investing' ||
                item.key === 'tax'
              ) {
                // /category/[slug] 에서 slug와 key 매칭
                active = pathname.startsWith('/category') && query.slug === item.key;
              }

              const label = isKo ? item.labelKo : item.labelEn;

              return (
                <Link
                  key={item.key}
                  href={{
                    pathname: item.href,
                    query: { lang },
                  }}
                  passHref
                >
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
