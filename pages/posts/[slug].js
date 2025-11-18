// pages/posts/[slug].js
import SeoHead from '../../_components/SeoHead';
import AdResponsive from '../../_components/AdResponsive';
import AdInArticle from '../../_components/AdInArticle';
import { AD_CLIENT, AD_SLOTS } from '../../config/adSlots';
import { getAllPosts, getPostBySlug } from '../../lib/posts';
import parse, { domToReact } from 'html-react-parser';

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function PostPage({ post }) {
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: { '@type': 'Organization', name: 'FinMap' },
  };

  // 🔥 인-아티클 광고를 H2 기준으로 2번 삽입하는 로직
  let h2Index = 0;

  const contentWithInArticleAds = parse(post.contentHtml, {
    replace(domNode) {
      // 태그 타입(h2)만 처리
      if (domNode.type === 'tag' && domNode.name === 'h2') {
        h2Index += 1;
        const children = domToReact(domNode.children);

        // 2번째 h2 뒤에 인-아티클 광고 1 삽입
        if (h2Index === 2) {
          return (
            <>
              <h2>{children}</h2>
              <div className="my-6">
                <AdInArticle
                  client={AD_CLIENT}
                  slot={AD_SLOTS.inArticle1}
                />
              </div>
            </>
          );
        }

        // 4번째 h2 뒤에 인-아티클 광고 2 삽입
        if (h2Index === 4) {
          return (
            <>
              <h2>{children}</h2>
              <div className="my-6">
                <AdInArticle
                  client={AD_CLIENT}
                  slot={AD_SLOTS.inArticle2}
                />
              </div>
            </>
          );
        }

        // 나머지 h2는 그대로 렌더링
        return <h2>{children}</h2>;
      }

      // 나머지는 기본 동작 (그대로 렌더)
      return undefined;
    },
  });

  return (
    <>
      <SeoHead
        title={post.title}
        desc={post.description}
        url={`/posts/${post.slug}`}
        image={post.cover}
      />
      <JsonLd data={jsonld} />

      <article className="prose prose-slate lg:prose-lg max-w-none bg-white border rounded-2xl shadow-card p-6">
        {/* 제목 + 메타 */}
        <h1>{post.title}</h1>
        <p className="text-sm text-slate-500">
          {post.category} · {post.datePublished}
          {post.dateModified && post.dateModified !== post.datePublished
            ? ` · 수정: ${post.dateModified}`
            : ''}
        </p>

        {/* 👇 본문 상단 반응형 광고 */}
        <div className="my-4">
          <AdResponsive
            client={AD_CLIENT}
            slot={AD_SLOTS.responsiveTop}
            align="center"
          />
        </div>

        {/* 커버 이미지 */}
        {post.cover && (
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-auto rounded-xl mt-4 mb-6"
          />
        )}

        {/* 🔥 인-아티클 광고가 섞여 들어간 본문 */}
        <div className="post-body">
          {contentWithInArticleAds}
        </div>

        {/* 👇 본문 하단 반응형 광고 */}
        <div className="mt-8">
          <AdResponsive
            client={AD_CLIENT}
            slot={AD_SLOTS.responsiveBottom}
            align="center"
          />
        </div>
      </article>
    </>
  );
}

export async function getStaticPaths() {
  const posts = getAllPosts(); // [{slug: '...'}]
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug);
  return { props: { post } };
}
