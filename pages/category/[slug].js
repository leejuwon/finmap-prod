// pages/category/[slug].js
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SeoHead from '../../_components/SeoHead';
import { getAllPosts } from '../../lib/posts';
import { getInitialLang } from '../../lib/lang';

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

export default function CategoryPage({ slug, postsKo, postsEn }) {
  const [lang, setLang] = useState('ko');
  const isKo = lang === 'ko';

  // ✅ 헤더와 동일하게 fm_lang 기준으로 언어 동기화
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initial = getInitialLang();
    setLang(initial);

    const handler = (e) => {
      const next = e?.detail === 'en' ? 'en' : 'ko';
      setLang(next);
    };

    window.addEventListener('fm_lang_change', handler);
    return () => window.removeEventListener('fm_lang_change', handler);
  }, []);

  const LABELS = isKo ? CATEGORY_LABELS_KO : CATEGORY_LABELS_EN;
  const title = LABELS[slug] || slug;

  // ✅ en에 글이 있으면 en, 없으면 ko로 폴백
  const posts =
    !isKo && postsEn && postsEn.length > 0 ? postsEn : postsKo;

  const urlPath = `/category/${slug}`;

  return (
    <>
      <SeoHead
        title={isKo ? `${title} 카테고리` : `${title} category`}
        desc={isKo ? `${title} 글 모음` : `Posts related to ${title}`}
        url={urlPath}
      />

      <h1 className="text-2xl font-bold mb-4">{title}</h1>

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
              {p.cover && (
                <img
                  src={p.cover}
                  alt={p.title}
                  className="card-thumb"
                />
              )}
              <span className="badge">{p.category}</span>
              <h3 className="mt-2 text-lg font-semibold">
                <Link href={`/posts/${isKo ? 'ko' : 'en'}/${p.slug}`}>
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

// 🔹 카테고리 슬러그 3개만 정적으로 생성
export async function getStaticPaths() {
  const slugs = ['economics', 'investing', 'tax'];

  const paths = slugs.map((slug) => ({
    params: { slug },
  }));

  return { paths, fallback: false };
}

// 🔹 빌드 시 KO/EN 둘 다 읽어서 props로 넘겨줌
export async function getStaticProps({ params }) {
  const { slug } = params;

  // 언어별 전체 글 리스트
  const allKo = getAllPosts('ko');
  const allEn = getAllPosts('en');

  // 카테고리 매핑 (KO)
  const mapKo = {
    '경제기초': 'economics',
    '재테크': 'investing',
    '세금': 'tax',
  };

  // 카테고리 매핑 (EN - 소문자 기준)
  const mapEn = {
    'economics basics': 'economics',
    'economics basic': 'economics',
    'personal finance': 'investing',
    'investing': 'investing',
    'tax': 'tax',
  };

  const postsKo = allKo.filter((p) => {
    const pSlug = mapKo[p.category] || (p.category || '').toLowerCase();
    return pSlug === slug;
  });

  const postsEn = allEn.filter((p) => {
    const key = (p.category || '').toLowerCase();
    const mapped = mapEn[key] || key;
    return mapped === slug;
  });

  return {
    props: {
      slug,
      postsKo,
      postsEn,
    },
  };
}
