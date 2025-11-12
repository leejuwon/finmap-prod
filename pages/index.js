import Link from 'next/link';
import SeoHead from '../_components/SeoHead';
import { getAllPosts } from '../lib/posts';

export default function Home({ posts }) {
  return (
    <>
      <SeoHead title="홈" desc="FinMap 블로그 · 금융 기초 · 투자개념 · 세금 · 복리 계산기" url="/" />
      <h1 className="text-3xl font-bold mt-4 mb-3">FinMap 블로그</h1>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-3">최신 글</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0,6).map(p=>(
            <article key={p.slug} className="card">
              <span className="badge">{p.category}</span>
              <h3 className="mt-2 text-lg font-semibold">
                <Link href={`/posts/${p.slug}`}>{p.title}</Link>
              </h3>
              <p className="text-sm text-slate-500 mt-1">{p.datePublished}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export async function getStaticProps(){
  const posts = getAllPosts();
  return { props: { posts } };
}
