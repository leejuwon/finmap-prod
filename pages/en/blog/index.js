import { listPosts } from '../../../lib/md';

export async function getStaticProps() {
  return { props: { posts: listPosts('en') } };
}

export default function BlogList({ posts }) {
  return (
    <div className="container">
      <h1>Blog</h1>
      {posts.map(p => (
        <div className="post" key={p.slug}>
          <h3><a href={`/en/blog/${p.slug}`}>{p.title}</a></h3>
          <small>{p.date}</small>
          <p>{p.summary}</p>
        </div>
      ))}
    </div>
  );
}
