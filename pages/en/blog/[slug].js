import { listPosts, getPost } from '../../../lib/md';

export async function getStaticPaths() {
  const posts = listPosts('en');
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: false
  };
}
export async function getStaticProps({ params }) {
  const { front, html } = getPost('en', params.slug);
  return { props: { front, html } };
}
export default function Post({ front, html }) {
  return (
    <div className="container">
      <a href="/en/blog">← 목록</a>
      <h1>{front.title}</h1>
      <small>{front.date}</small>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
