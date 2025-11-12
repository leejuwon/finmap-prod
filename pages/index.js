import Link from 'next/link';
import SeoHead from '../_components/SeoHead';
import { getAllPosts } from '../lib/posts';

export default function Home({ posts }) {
  return (
    <>
      <SeoHead title="홈" desc="FinMap 블로그 · 금융 기초 · 투자개념 · 세금 · 복리 계산기" url="/" />
      <h1>FinMap 블로그</h1>
      <section>
        <h2>최신 글</h2>
        <ul>
          {posts.slice(0,6).map(p=>(
            <li key={p.slug}>
              <Link href={`/posts/${p.slug}`}>{p.title}</Link>
              <small style={{marginLeft:8, opacity:.6}}>{p.category} · {p.datePublished}</small>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export async function getStaticProps(){
  const posts = getAllPosts();
  return { props: { posts } };
}
