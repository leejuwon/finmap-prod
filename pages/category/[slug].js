import Link from 'next/link';
import { getAllPosts } from '../../lib/posts';
import SeoHead from '../../_components/SeoHead';

export default function CategoryPage({ slug, posts }){
  return (
    <>
      <SeoHead title={`카테고리: ${slug}`} desc={`${slug} 카테고리 글 목록`} url={`/category/${slug}`} />
      <h1>카테고리: {slug}</h1>
      <ul>
        {posts.map(p=>(
          <li key={p.slug}>
            <Link href={`/posts/${p.slug}`}>{p.title}</Link>
            <small style={{marginLeft:8, opacity:.6}}>{p.datePublished}</small>
          </li>
        ))}
      </ul>
    </>
  );
}

export async function getStaticPaths(){
  // 카테고리 유도: 현재 글들의 category를 수집
  const all = getAllPosts();
  const cats = Array.from(new Set(all.map(p => (p.category || '').toLowerCase()).filter(Boolean)));
  const paths = cats.map(c => ({ params: { slug: c }}));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }){
  const { slug } = params;
  const all = getAllPosts();
  const posts = all.filter(p => (p.category || '').toLowerCase() === slug.toLowerCase());
  return { props: { slug, posts } };
}
