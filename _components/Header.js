import Link from 'next/link';

export default function Header(){
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b">
      <nav className="container flex gap-4 items-center py-3">
        <Link href="/" className="font-extrabold tracking-tight">FinMap</Link>
        <Link href="/category/economics" className="px-2 py-1 rounded-lg hover:bg-indigo-50">경제기초</Link>
        <Link href="/category/investing" className="px-2 py-1 rounded-lg hover:bg-indigo-50">투자개념</Link>
        <Link href="/category/tax" className="px-2 py-1 rounded-lg hover:bg-indigo-50">세금</Link>
        <Link href="/tools/compound-interest" className="px-2 py-1 rounded-lg hover:bg-indigo-50">복리 계산기</Link>
        <span className="ml-auto text-sm text-slate-500">finmaphub.com</span>
      </nav>
    </header>
  );
}
