// pages/posts/[slug].js
import SeoHead from '../../_components/SeoHead';
// import JsonLd from '../../_components/JsonLd';
export function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
import { getAllPosts, getPostBySlug } from '../../lib/posts';

export default function PostPage({ post }) {
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: { '@type': 'Organization', name: 'FinMap' },
  };

  return (
    <>
      <SeoHead title={post.title} desc={post.description} url={`/posts/${post.slug}`} image={post.cover} />
      <JsonLd data={jsonld} />
      <article className="prose prose-slate lg:prose-lg bg-white border rounded-2xl shadow-card p-6">
        <h1>{post.title}</h1>
        <p className="text-sm text-slate-500">
          {post.category} · {post.datePublished}
          {post.dateModified && post.dateModified !== post.datePublished ? ` · 수정: ${post.dateModified}` : ''}
        </p>
        {/*  히어로 커버 이미지 */}
        {post.cover && (
          <img
            src={post.cover}
            alt={post.title}
            className="w-full max-h-80 object-cover rounded-lg my-4"
          />
        )}
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
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
