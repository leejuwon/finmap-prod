// _components/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t mt-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
        <Link href="/about" passHref>
          <a className="hover:text-slate-800">About</a>
        </Link>
        <Link href="/contact" passHref>
          <a className="hover:text-slate-800">Contact</a>
        </Link>
        <Link href="/privacy" passHref>
          <a className="hover:text-slate-800">Privacy</a>
        </Link>
        <Link href="/terms" passHref>
          <a className="hover:text-slate-800">TOS</a>
        </Link>
        <Link href="/disclaimer" passHref>
          <a className="hover:text-slate-800">면책</a>
        </Link>

        <span className="ml-auto text-[11px] sm:text-sm text-slate-500">
          © {new Date().getFullYear()} FinMap
        </span>
      </div>
    </footer>
  );
}
