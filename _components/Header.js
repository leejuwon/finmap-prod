// _components/Header.js
import Link from 'next/link';
import { useRouter } from 'next/router';

const navItems = [
  { href: '/', label: '홈' },
  { href: '/category/economics', label: '경제기초' },
  { href: '/category/investing', label: '투자개념' },
  { href: '/category/tax', label: '세금' },
  { href: '/tools/compound-interest', label: '복리 계산기' },
];

export default function Header() {
  const router = useRouter();

  const isActive = (itemHref) => {
    if (itemHref === '/') {
      return router.pathname === '/' || router.pathname === '/ko';
    }
    return (
      router.pathname.startsWith(itemHref) ||
      router.pathname.startsWith(`/ko${itemHref}`) ||
      router.pathname.startsWith(`/en${itemHref}`)
    );
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/90 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 상단 로고 라인 */}
        <div className="flex items-center justify-between py-2 sm:py-3">
          <Link href="/" passHref>
            <a className="flex items-center gap-2 shrink-0">
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
                  금융 기초 · 투자계획 지도
                </span>
              </div>
            </a>
          </Link>

          {/* 데스크톱에서만 보이는 도메인 */}
          <span className="hidden sm:inline text-xs sm:text-sm text-slate-500">
            finmaphub.com
          </span>
        </div>

        {/* 내비게이션 바 (모바일 가로 스크롤) */}
        <nav className="-mx-4 border-t border-slate-100 sm:border-none">
          <div className="px-4 overflow-x-auto">
            <ul className="flex items-center gap-3 sm:gap-5 py-2 sm:py-3 whitespace-nowrap text-sm sm:text-base">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} passHref>
                    <a
                      className={[
                        'inline-flex items-center px-3 py-1 rounded-full transition-colors',
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                      ].join(' ')}
                    >
                      {item.label}
                    </a>
                  </Link>
                </li>
              ))}

              {/* 모바일에서만 우측에 도메인 텍스트 */}
              <li className="ml-auto sm:hidden text-[11px] text-slate-400">
                finmaphub.com
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
