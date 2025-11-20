// pages/category/[lang]/[slug].js
import Link from 'next/link';
import SeoHead from '../../_components/SeoHead';
import { getAllPosts } from '../../lib/posts';

const CATEGORY_LABELS_KO = {
  economics: '경제기초',
  investing: '재테크',
  tax: '세금',
};

const CATEGORY_LABELS_EN = {
  economics: 'Economics',
  investing: 'Investing',
  tax: 'Tax',
};

export default function CategoryPage({ lang, slug, posts }) {
  const isKo = lang === 'ko';
  const LABELS = isKo ? CATEGORY_LABELS_KO : CATEGORY_LABELS_EN;
  const title = LABELS[slug] || slug;

  return (
    <>
      <SeoHead
        title={
          isKo
            ? `${title} 카테고리`
            : `${title} category`
        }
        desc={
          isKo
            ? `${title} 글 모음`
            : `Posts about ${title}`
        }
        url={`/category/${lang}/${slug}`}
      />

      <h1 className="text-2xl font-bold mb-4">
        {title}
      </h1>

      {posts.length === 0 ? (
        <p className="text-slate-500">
          {isKo
            ? '아직 이 카테고리의 글이 없습니다.'
            : 'No posts in this category yet.'}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug} className="card">
              {/* 썸네일 */}
              {p.cover && (
                <img
                  src={p.cover}
                  alt={p.title}
                  className="card-thumb"
                />
              )}
              <span className="badge">{p.category}</span>
              <h3 className="mt-2 text-lg font-semibold">
                <Link href={`/posts/${lang}/${p.slug}`}>
                  {p.title}
                </Link>
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {p.datePublished}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export async function getStaticPaths() {
  // 🔹 현재는 ko만 사용, 언어별 카테고리 슬러그 고정
  const slugs = ['economics', 'investing', 'tax'];

  const paths = slugs.map((slug) => ({
    params: { lang: 'ko', slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { lang, slug } = params;

  // 일단은 getAllPosts() 모두에서 카테고리 필터만 (한글/영문 분리는 나중 단계)
  const all = getAllPosts();
  const map = { '경제기초': 'economics', '재테크': 'investing', '세금': 'tax' };

  const posts = all.filter((p) => {
    const pSlug = map[p.category] || p.category?.toLowerCase();
    return pSlug === slug;
  });

  return {
    props: {
      lang: lang || 'ko',
      slug,
      posts,
    },
  };
}
