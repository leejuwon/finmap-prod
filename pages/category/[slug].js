// pages/category/[slug].js
import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SeoHead from '../../_components/SeoHead';
import { getAllPosts, getAllPostsStrict } from '../../lib/posts';

/* ---------------- 카테고리 이름 ↔ slug 매핑 ---------------- */

const CATEGORY_MAP_KO = {
  경제정보: 'economicInfo',
  재테크: 'personalFinance',
  투자정보: 'investingInfo',
};

const CATEGORY_MAP_EN = {
  'economic info': 'economicInfo',
  'personal finance': 'personalFinance',
  'investing info': 'investingInfo',
};

function getCategorySlugFromPost(post, lang = 'ko') {
  if (!post || !post.category) return 'economicInfo';

  if (lang === 'ko') {
    return CATEGORY_MAP_KO[post.category] || 'economicInfo';
  }

  const key = (post.category || '').toLowerCase();
  return CATEGORY_MAP_EN[key] || key || 'economicInfo';
}

const CATEGORY_LABELS_KO = {
  economicInfo: '경제정보',
  personalFinance: '재테크',
  investingInfo: '투자정보',
};

const CATEGORY_LABELS_EN = {
  economicInfo: 'Economic Info',
  personalFinance: 'Personal Finance',
  investingInfo: 'Investing Info',
};

/* ---------------------------------------------------------- */

export default function CategoryPage({ slug, postsKo, postsEn }) {
  const router = useRouter();
  const locale = router?.locale === 'en' ? 'en' : 'ko';
  const isKo = locale === 'ko';

  const title = useMemo(() => {
    const labels = isKo ? CATEGORY_LABELS_KO : CATEGORY_LABELS_EN;
    return labels[slug] || slug;
  }, [isKo, slug]);

  // ✅ SEO/색인 안정성: en 카테고리에서는 en 글만 노출 (KO 폴백 금지)
  const posts = isKo ? postsKo : postsEn;

  return (
    <>
      <SeoHead
        title={isKo ? `${title} 카테고리` : `${title} Category`}
        desc={isKo ? `${title} 관련 글 모음` : `Posts related to ${title}`}
        url={`/category/${slug}`}
        locale={locale}
      />

      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      {!posts || posts.length === 0 ? (
        <p className="text-slate-500">
          {isKo ? '아직 이 카테고리의 글이 없습니다.' : 'No English posts in this category yet.'}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const postLang = p.lang || (isKo ? 'ko' : 'en');

            return (
              <li key={`${postLang}-${p.slug}`} className="card">
                {p.cover && (
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="w-full h-40 object-cover rounded-xl"
                    loading="lazy"
                  />
                )}

                <div className="mt-3 text-xs text-slate-500">{p.datePublished}</div>

                <h3 className="mt-2 text-lg font-semibold">
                  {/* ✅ 핵심: 글 언어에 맞는 locale로 강제 */}
                  <Link
                    href={`/posts/${slug}/${postLang}/${p.slug}`}
                    locale={postLang}
                  >
                    {p.title}
                  </Link>
                </h3>

                {p.description && (
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{p.description}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* ---------------------- SSG ---------------------- */

export async function getStaticPaths() {
  const slugs = Object.values(CATEGORY_MAP_KO); // economicInfo, personalFinance, investingInfo

  const paths = slugs.flatMap((s) => ([
    { params: { slug: s }, locale: 'ko' },
    { params: { slug: s }, locale: 'en' },
  ]));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const slug = params.slug;

  const allKo = getAllPosts('ko');
  const postsKo = allKo
    .filter((p) => getCategorySlugFromPost(p, 'ko') === slug)
    .map((p) => ({ ...p, lang: 'ko' }));

  // ✅ en은 strict로만 (KO fallback 섞임 방지)
  const allEn = getAllPostsStrict('en');
  const postsEn = allEn
    .filter((p) => getCategorySlugFromPost(p, 'en') === slug)
    .map((p) => ({ ...p, lang: 'en' }));

  return {
    props: {
      slug,
      postsKo,
      postsEn,
    },
  };
}
