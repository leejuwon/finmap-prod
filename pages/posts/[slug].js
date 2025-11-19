// pages/posts/[slug].js
import { useEffect, useState } from 'react';
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
  const slug = post.slug;

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: { '@type': 'Organization', name: 'FinMap' },
  };

  // ============================
  // 👍 좋아요 / 💬 댓글 / 🔗 공유 상태
  // ============================
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({
    nickname: '',
    password: '',
    content: '',
  });
  const [shareUrl, setShareUrl] = useState(
    `https://www.finmaphub.com/posts/${slug}`
  );

  // 최초 마운트 시 현재 URL 세팅 + 좋아요/댓글 로딩
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }

    // 좋아요
    fetch(`/api/like?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => setLikes(data.likes || 0))
      .catch(() => {});

    // 댓글
    fetch(`/api/comments?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []))
      .catch(() => {});
  }, [slug]);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/like?slug=${slug}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.likes != null) setLikes(data.likes);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setCommentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommentSubmit = async () => {
    if (!commentForm.nickname || !commentForm.password || !commentForm.content) {
      alert('닉네임, 비밀번호, 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/comments?slug=${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm),
      });
      if (!res.ok) throw new Error('failed');

      // 새 목록 다시 로딩
      const listRes = await fetch(`/api/comments?slug=${slug}`);
      const data = await listRes.json();
      setComments(data.comments || []);

      setCommentForm({ nickname: '', password: '', content: '' });
    } catch (e) {
      console.error(e);
      alert('댓글 등록에 실패했습니다.');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description || post.title,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('링크가 클립보드에 복사되었습니다.');
      } else {
        alert('링크를 직접 복사해주세요:\n' + shareUrl);
      }
    } catch (e) {
      console.error(e);
    }
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
        <div className="fm-post-body">
          {contentWithInArticleAds}
        </div>

        {/* 👇 본문 하단 반응형 광고 */}
        <div className="mt-8 mb-4">
          <AdResponsive
            client={AD_CLIENT}
            slot={AD_SLOTS.responsiveBottom}
            align="center"
          />
        </div>

        {/* ====== 좋아요 + 공유하기 ====== */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4">
          <button
            type="button"
            onClick={handleLike}
            className="btn-secondary"
          >
            👍 좋아요 {likes > 0 ? `(${likes})` : ''}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="btn-secondary"
          >
            🔗 공유하기
          </button>

          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              shareUrl
            )}&text=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-500 underline"
          >
            X(Twitter)에 공유
          </a>

          <a
            href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 underline"
          >
            Facebook에 공유
          </a>
        </div>

        {/* ====== 댓글 영역 ====== */}
        <section className="mt-6 border-t pt-4">
          <h2 className="text-base md:text-lg font-semibold mb-3">
            댓글
          </h2>

          {/* 댓글 작성 폼 */}
          <div className="grid gap-2 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <input
                name="nickname"
                placeholder="닉네임"
                className="input"
                value={commentForm.nickname}
                onChange={handleCommentChange}
              />
              <input
                name="password"
                type="password"
                placeholder="비밀번호 (수정/삭제용)"
                className="input"
                value={commentForm.password}
                onChange={handleCommentChange}
              />
            </div>
            <textarea
              name="content"
              placeholder="댓글을 입력하세요"
              className="input min-h-[80px]"
              value={commentForm.content}
              onChange={handleCommentChange}
            />
            <div className="flex justify-end">
              <button
                type="button"
                className="btn-primary"
                onClick={handleCommentSubmit}
              >
                댓글 등록
              </button>
            </div>
          </div>

          {/* 댓글 리스트 */}
          {comments.length === 0 ? (
            <p className="text-sm text-slate-500">
              아직 댓글이 없습니다.
            </p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="border rounded-lg px-3 py-2 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">
                      {c.nickname}
                    </span>
                    {c.created_at && (
                      <span className="text-[11px] text-slate-400">
                        {new Date(c.created_at).toLocaleString('ko-KR')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {c.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
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
