import Link from 'next/link';
import SeoHead from '../_components/SeoHead';

export default function NotFound(){
  return (
    <>
      <SeoHead title="페이지를 찾을 수 없습니다" desc="요청하신 페이지가 존재하지 않습니다." url="/404" />
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">404 - 페이지를 찾을 수 없습니다</h1>
        <p className="text-slate-600 mb-8">주소가 변경되었거나 삭제되었을 수 있어요.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">홈으로</Link>
          <Link href="/category/economics" className="px-4 py-2 rounded-lg border">경제기초</Link>
          <Link href="/category/investing" className="px-4 py-2 rounded-lg border">투자개념</Link>
          <Link href="/category/tax" className="px-4 py-2 rounded-lg border">세금</Link>
        </div>
      </div>
    </>
  );
}
