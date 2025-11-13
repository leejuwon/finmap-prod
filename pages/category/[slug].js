import Link from 'next/link';
import SeoHead from '../../_components/SeoHead';
import { getAllPosts } from '../../lib/posts';

const CATEGORY_LABELS = {
  economics: '경제기초',
  investing: '투자개념',
  tax: '세금',
};

export default function CategoryPage({ slug, posts }) {
  const title = CATEGORY_LABELS[slug] || slug;
  return (
    <>
      <SeoHead title={`${title} 카테고리`} desc={`${title} 글 모음`} url={`/category/${slug}`} />
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      {posts.length === 0 ? (
        <p className="text-slate-500">아직 이 카테고리의 글이 없습니다.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(p=>(
            <li key={p.slug} className="card">
               {/* 썸네일 추가 */}
                {p.cover && (
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                )}
              <span className="badge">{p.category}</span>
              <h3 className="mt-2 text-lg font-semibold">
                <Link href={`/posts/${p.slug}`}>{p.title}</Link>
              </h3>
              <p className="text-sm text-slate-500 mt-1">{p.datePublished}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export async function getStaticPaths(){
  // 카테고리 슬러그 고정
  const slugs = ['economics','investing','tax'];
  return { paths: slugs.map(s=>({ params:{ slug:s } })), fallback:false };
}

export async function getStaticProps({ params }){
  const all = getAllPosts(); // [{ category, slug, ... }]
  const posts = all.filter(p => {
    // p.category가 "경제기초/투자개념/세금"처럼 한글이면 슬러그 매핑
    const map = { '경제기초':'economics', '투자개념':'investing', '세금':'tax' };
    const pSlug = map[p.category] || p.category?.toLowerCase();
    return pSlug === params.slug;
  });
  return { props: { slug: params.slug, posts } };
}
