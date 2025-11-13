// pages/index.js
import Link from 'next/link';
import SeoHead from '../_components/SeoHead';
import { getAllPosts } from '../lib/posts';

export default function Home({ posts }) {
  const latest = posts.slice(0, 3);      // 최신 3개
  const more = posts.slice(3, 9);        // 그 다음 6개

  return (
    <>
      <SeoHead
        title="홈"
        desc="FinMap 블로그 · 금융 기초 · 투자개념 · 세금 · 복리 계산기"
        url="/"
      />

      {/*  히어로 섹션 */}
      <section className="mt-6 mb-8">
        <div className="card flex flex-col md:flex-row gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300 mb-2">
              PERSONAL FINANCE · INVESTING
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight mb-3">
              당신의 돈 흐름을<br className="hidden sm:block" />
              <span className="text-blue-300">지도처럼 한 눈에</span> 보는 곳, FinMap
            </h1>
            <p className="text-sm md:text-base text-slate-200 mb-4">
              경제 기초 개념부터 투자 아이디어, 세금 이슈, 복리 계산기까지.
              초중급 투자자가 헷갈려 하는 포인트만 골라 정리합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/tools/compound-interest" className="btn-primary bg-blue-500 hover:bg-blue-600">
                복리 계산기 바로가기
              </Link>
              <Link href="/category/economics" className="btn-secondary border-slate-500 text-slate-100 hover:bg-slate-800">
                경제 기초부터 차근차근
              </Link>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            {/* 간단한 요약 카드 세트 */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              <div className="stat bg-slate-900/60 border border-slate-700">
                <p className="stat-title text-slate-300">경제 기초</p>
                <p className="stat-value text-blue-300">입문자용</p>
              </div>
              <div className="stat bg-slate-900/60 border border-slate-700">
                <p className="stat-title text-slate-300">투자 개념</p>
                <p className="stat-value text-emerald-300">실전 연결</p>
              </div>
              <div className="stat bg-slate-900/60 border border-slate-700">
                <p className="stat-title text-slate-300">세금</p>
                <p className="stat-value text-amber-300">헷갈림 정리</p>
              </div>
              <div className="stat bg-slate-900/60 border border-slate-700">
                <p className="stat-title text-slate-300">복리 계산</p>
                <p className="stat-value text-fuchsia-300">숫자로 확인</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  최신 글 섹션 */}
      <section className="mt-4">
        <h2 className="text-xl font-semibold mb-3">최신 글</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((p) => (
            <article key={p.slug} className="card hover:shadow-md transition-shadow">
              {p.cover && (
                <img src={p.cover} alt={p.title} className="card-thumb" />
              )}
              <span className="badge">{p.category}</span>
              <h3 className="mt-2 text-lg font-semibold">
                <Link href={`/posts/${p.slug}`}>{p.title}</Link>
              </h3>
              <p className="text-xs text-slate-500 mt-1">{p.datePublished}</p>
            </article>
          ))}
        </div>
      </section>

      {/*  더 많은 글 섹션 */}
      {more.length > 0 && (
        <section className="mt-10 mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">더 알아보기</h2>
            <span className="text-xs text-slate-500">
              경제기초 · 투자개념 · 세금 카테고리별로 정리되어 있습니다.
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <article key={p.slug} className="card hover:shadow-md transition-shadow">
                {p.cover && (
                  <img src={p.cover} alt={p.title} className="card-thumb" />
                )}
                <span className="badge">{p.category}</span>
                <h3 className="mt-2 text-base font-semibold">
                  <Link href={`/posts/${p.slug}`}>{p.title}</Link>
                </h3>
                <p className="text-xs text-slate-500 mt-1">{p.datePublished}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export async function getStaticProps() {
  const posts = getAllPosts();
  return { props: { posts } };
}
