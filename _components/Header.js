import Link from 'next/link';

export default function Header(){
  return (
    <header style={{borderBottom:'1px solid #eee'}}>
      <nav style={{display:'flex', gap:16, padding:'12px 16px'}}>
        <Link href="/">FinMap</Link>
        <Link href="/category/economics">경제기초</Link>
        <Link href="/category/investing">투자개념</Link>
        <Link href="/category/tax">세금</Link>
        <Link href="/tools/compound-interest">복리 계산기</Link>
        <span style={{marginLeft:'auto', opacity:.7, fontSize:13}}>finmaphub.com</span>
      </nav>
    </header>
  );
}
