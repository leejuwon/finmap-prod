import Link from 'next/link';

export default function Footer(){
  return (
    <footer style={{borderTop:'1px solid #eee', marginTop:40, padding:'16px'}}>
      <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">TOS</Link>
        <Link href="/disclaimer">면책</Link>
      </div>
      <small style={{opacity:.6, display:'block', marginTop:8}}>
        © {new Date().getFullYear()} FinMap. 정보 제공 목적이며 투자 판단은 본인 책임입니다.
      </small>
    </footer>
  );
}
