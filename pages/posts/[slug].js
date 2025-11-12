import SeoHead from '../../_components/SeoHead';
import JsonLd from '../../_components/JsonLd';
import { getAllSlugs, getPostBySlug } from '../../lib/posts';

export default function PostPage({ post }){
  const url = `/posts/${post.slug}`;
  const jsonld = {
    "@context":"https://schema.org",
    "@type":"Article",
    "headline": post.title,
    "author": {"@type":"Person","name":"FinMap Research"},
    "datePublished": post.datePublished,
    "dateModified": post.dateModified || post.datePublished,
    "image": post.cover ? [post.cover] : undefined,
    "mainEntityOfPage": {"@type":"WebPage","@id": `https://www.finmaphub.com${url}`}
  };

  return (
    <>
      <SeoHead title={post.title} desc={post.description} url={url} image={post.cover} />
      <JsonLd data={jsonld} />
      <article>
        <h1>{post.title}</h1>
        <p style={{opacity:.7, margin:'8px 0'}}>
          {post.category} · {post.datePublished}{post.dateModified && post.dateModified!==post.datePublished ? ` · 수정: ${post.dateModified}`:''}
        </p>
        {/* 표/이미지 포함 시 본문에 그대로 HTML 렌더 */}
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        {/* 내부링크, 외부 권위링크는 본문에 직접 작성 */}
      </article>
    </>
  );
}

export async function getStaticPaths(){
  const slugs = getAllSlugs();
  return { paths: slugs.map(s=>({params:{slug:s}})), fallback:false };
}

export async function getStaticProps({ params }){
  const post = getPostBySlug(params.slug);
  return { props: { post } };
}
