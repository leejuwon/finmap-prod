// _components/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t mt-10 bg-white">
      <div className="w-full px-4">
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex flex-wrap gap-4 items-center py-4 text-slate-600">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">TOS</Link>
          <Link href="/disclaimer">면책</Link>
          <span className="ml-auto text-sm">
            © {new Date().getFullYear()} FinMap
          </span>
        </div>
      </div>
    </footer>
  );
}
