// _components/Footer.js
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t mt-10 bg-white">
      <div className="w-full px-4">
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex flex-wrap gap-4 items-center py-4 text-slate-600">
          {/* 좌측: 로고 */}
          <Link href="/" prefetch={false} className="flex items-center gap-2">
            <Image
              src="/brand/finmaphub-logo.svg"
              alt="FinMap"
              width={120}
              height={28}
              className="h-7 w-auto opacity-90"
            />         
          </Link>
          {/* 중앙: 정책 링크 */}
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/about" prefetch={false}>About</Link>
            <Link href="/contact" prefetch={false}>Contact</Link>
            <Link href="/privacy" prefetch={false}>Privacy</Link>
            <Link href="/terms" prefetch={false}>TOS</Link>
            <Link href="/disclaimer" prefetch={false}>Disclaimer</Link>
            <Link href="/sitemap-pages" prefetch={false} className="text-sm underline">Sitemap</Link>
          </div>
          {/* 우측: 카피라이트 */}
          <span className="ml-auto text-sm">
            © {new Date().getFullYear()} FinMap
          </span>
        </div>
      </div>
    </footer>
  );
}
