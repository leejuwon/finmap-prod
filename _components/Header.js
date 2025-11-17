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
                <span className="block text-[10px] sm:text-[11px] text-slate-500">
                  금융 기초 · 투자계획 지도
                </span>
              </div>
            </a>
          </Link>

          {/* 네비게이션 */}
          <div className="header-nav flex items-center gap-1 sm:gap-2 ml-2 sm:ml-6 text-[11px] sm:text-sm">
            {navItems.map((item) => {
              const active =
                item.href === '/'
                  ? router.pathname === '/'
                  : router.pathname.startsWith(item.href);

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
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </div>

          {/* 우측 도메인/브랜드 */}
          <span className="header-domain ml-auto text-[10px] sm:text-xs md:text-sm text-slate-500">
            finmaphub.com
          </span>
        </div>
      </nav>
    </header>
  );
}
