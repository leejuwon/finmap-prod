// pages/posts/[category]/[lang]/[slug].js
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '../../../../_components/SeoHead';
import AdResponsive from '../../../../_components/AdResponsive';
import AdInArticle from '../../../../_components/AdInArticle';
import { AD_CLIENT, AD_SLOTS } from '../../../../config/adSlots';
import {
  getAllPosts,
  getAllPostsStrict,
  getPostBySlugStrict,
  hasPostSlugStrict,
} from '../../../../lib/posts';
import parse, { domToReact } from 'html-react-parser';
import ToolCta from '../../../../_components/ToolCta';

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

function getCategorySlugFromPost(post, lang) {
  if (!post || !post.category) return 'economicInfo';

  if (lang === 'ko') {
    return CATEGORY_MAP_KO[post.category] || 'economicInfo';
  }

  const key = (post.category || '').toLowerCase();
  return CATEGORY_MAP_EN[key] || key || 'economicInfo';
}

/* ---------------------------------------------------------- */

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function PostPage({ post, lang, otherLangAvailable, categorySlug }) {
  const router = useRouter();
  const slug = post.slug;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const otherLang = lang === 'ko' ? 'en' : 'ko';

    const detail = {
      type: 'post',
      slug,
      category: categorySlug,
      available: {
        [lang]: true,
        [otherLang]: !!otherLangAvailable,
      },
    };

    window.dispatchEvent(new CustomEvent('fm_post_availability', { detail }));

    return () => {
      window.dispatchEvent(new CustomEvent('fm_post_availability', { detail: null }));
    };
  }, [lang, otherLangAvailable, slug, categorySlug]);

  // ✅ UI 언어는 무조건 Next i18n locale 기준
  const locale = router?.locale === 'en' ? 'en' : 'ko';
  const isKo = locale === 'ko';

  // ✅ locale/lang 꼬임 자동 복구(번역 있으면 해당 언어로, 없으면 원래 언어로)
  const fixedRef = useRef(false);
  useEffect(() => {
    if (!router.isReady) return;
    if (fixedRef.current) return;

    if (locale !== lang) {
      fixedRef.current = true;

      if (otherLangAvailable && (locale === 'ko' || locale === 'en')) {
        // 번역본이 있으면 locale에 맞는 [lang] URL로 정렬
        router.replace(
          `/posts/${categorySlug}/${locale}/${slug}`,
          undefined,
          { locale }
        );
      } else {
        // 번역본이 없으면 원래 lang의 locale로 되돌림 (404/뒤집힘 방지)
        router.replace(router.asPath, undefined, { locale: lang });
      }
    }
  }, [router.isReady, locale, lang, otherLangAvailable, router, categorySlug, slug]);

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: { '@type': 'Organization', name: 'FinMap' },
  };

  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({
    nickname: '',
    password: '',
    content: '',
  });

  // ✅ shareUrl은 locale prefix 고려 (초기값)
  const site = 'https://www.finmaphub.com';
  const prefix = lang === 'en' ? '/en' : '';
  const [shareUrl, setShareUrl] = useState(
    `${site}${prefix}/posts/${categorySlug}/${lang}/${slug}`
  );

  const reloadComments = async () => {
    try {
      const res = await fetch(`/api/comments?slug=${slug}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (e) {
      console.error(e);
    }
  };

  const reloadLikes = async () => {
    try {
      const res = await fetch(`/api/like?slug=${slug}`);
      const data = await res.json();
      setLikes(data.likes || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
    reloadLikes();
    reloadComments();
  }, [slug, lang]);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/like?slug=${slug}`, { method: 'POST' });
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
      alert(
        isKo
          ? '닉네임, 비밀번호, 내용을 모두 입력해주세요.'
          : 'Please fill nickname, password and content.'
      );
      return;
    }

    try {
      const res = await fetch(`/api/comments?slug=${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm),
      });
      if (!res.ok) throw new Error('failed');

      await reloadComments();
      setCommentForm({ nickname: '', password: '', content: '' });
    } catch (e) {
      console.error(e);
      alert(isKo ? '댓글 등록에 실패했습니다.' : 'Failed to submit comment.');
    }
  };

  const handleCommentEdit = async (comment) => {
    const newContent = prompt(
      isKo ? '수정할 내용을 입력하세요.' : 'Enter new content.',
      comment.content || ''
    );
    if (!newContent) return;

    const password = prompt(
      isKo
        ? '댓글 작성 시 입력한 비밀번호를 입력하세요.'
        : 'Enter the password you used when writing this comment.'
    );
    if (!password) return;

    try {
      const res = await fetch(`/api/comments?slug=${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: comment.id,
          password,
          content: newContent,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.error === 'invalid password') {
          alert(isKo ? '비밀번호가 일치하지 않습니다.' : 'Invalid password.');
        } else {
          alert(isKo ? '댓글 수정에 실패했습니다.' : 'Failed to edit comment.');
        }
        return;
      }

      await reloadComments();
    } catch (e) {
      console.error(e);
      alert(isKo ? '댓글 수정 중 오류가 발생했습니다.' : 'Error while editing comment.');
    }
  };

  const handleCommentDelete = async (comment) => {
    const ok = confirm(
      isKo ? '정말 이 댓글을 삭제하시겠습니까?' : 'Are you sure you want to delete this comment?'
    );
    if (!ok) return;

    const password = prompt(
      isKo
        ? '댓글 작성 시 입력한 비밀번호를 입력하세요.'
        : 'Enter the password you used when writing this comment.'
    );
    if (!password) return;

    try {
      const res = await fetch(`/api/comments?slug=${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: comment.id,
          password,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.error === 'invalid password') {
          alert(isKo ? '비밀번호가 일치하지 않습니다.' : 'Invalid password.');
        } else {
          alert(isKo ? '댓글 삭제에 실패했습니다.' : 'Failed to delete comment.');
        }
        return;
      }

      await reloadComments();
    } catch (e) {
      console.error(e);
      alert(isKo ? '댓글 삭제 중 오류가 발생했습니다.' : 'Error while deleting comment.');
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
        alert(isKo ? '링크가 클립보드에 복사되었습니다.' : 'Link copied to clipboard.');
      } else {
        alert((isKo ? '링크를 직접 복사해주세요:\n' : 'Please copy the link manually:\n') + shareUrl);
      }
    } catch (e) {
      console.error(e);
    }
  };

  let h2Index = 0;
  const contentWithInArticleAds = parse(post.contentHtml, {
    replace(domNode) {
      if (domNode.type === 'tag' && domNode.name === 'h2') {
        h2Index += 1;
        const children = domToReact(domNode.children);

        if (h2Index === 2) {
          return (
            <>
              <h2>{children}</h2>
              <div className="my-6">
                <AdInArticle client={AD_CLIENT} slot={AD_SLOTS.inArticle1} />
              </div>
            </>
          );
        }

        if (h2Index === 4) {
          return (
            <>
              <h2>{children}</h2>
              <div className="my-6">
                <AdInArticle client={AD_CLIENT} slot={AD_SLOTS.inArticle2} />
              </div>
            </>
          );
        }

        return <h2>{children}</h2>;
      }
      return undefined;
    },
  });

  const toolList = Array.isArray(post.tools) ? post.tools : [];
  const TOOL_TYPE_MAP = {
    comp: 'compound',
    goal: 'goal',
    compound: 'compound',
    cagr: 'cagr',
    dca: 'dca',
    fire: 'fire',
  };

  const normalizedTools = toolList
    .map((t) => TOOL_TYPE_MAP[t] || t)
    .filter(Boolean);

  return (
    <>
      <SeoHead
        title={post.title}
        desc={post.description}
        url={`/posts/${categorySlug}/${lang}/${post.slug}`}
        image={post.cover}
        locale={lang} // ✅ canonical/hreflang을 컨텐츠 언어에 맞춤
      />
      <JsonLd data={jsonld} />

      <article className="prose prose-slate lg:prose-lg max-w-none bg-white border rounded-2xl shadow-card p-6">
        <h1 className="fm-post-title fm-post-title--clamp3">{post.title}</h1>

        <p className="text-sm text-slate-500">
          {post.category} · {post.datePublished}
          {post.dateModified && post.dateModified !== post.datePublished
            ? ` · ${isKo ? '수정' : 'Updated'}: ${post.dateModified}`
            : ''}
        </p>

        <div className="my-4">
          <AdResponsive client={AD_CLIENT} slot={AD_SLOTS.responsiveTop} align="center" />
        </div>

        {post.cover && (
          <img src={post.cover} alt={post.title} className="w-full h-auto rounded-xl mt-4 mb-6" />
        )}

        <div className="fm-post-body">{contentWithInArticleAds}</div>

        {normalizedTools.length > 0 && (
          <div className="mt-8 space-y-4">
            {normalizedTools.map((toolType) => (
              <ToolCta key={toolType} lang={lang} type={toolType} />
            ))}
          </div>
        )}

        <div className="mt-8 mb-4">
          <AdResponsive client={AD_CLIENT} slot={AD_SLOTS.responsiveBottom} align="center" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4">
          <button type="button" onClick={handleLike} className="btn-secondary">
            👍 {isKo ? '좋아요' : 'Like'} {likes > 0 ? `(${likes})` : ''}
          </button>

          <button type="button" onClick={handleShare} className="btn-secondary">
            🔗 {isKo ? '공유하기' : 'Share'}
          </button>

          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
              post.title
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-500 underline"
          >
            X(Twitter)
          </a>

          <a
            href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 underline"
          >
            Facebook
          </a>
        </div>

        {/* 댓글 영역 (원본 유지) */}
        <section className="mt-6 border-t pt-4">
          <h2 className="text-base md:text-lg font-semibold mb-3">{isKo ? '댓글' : 'Comments'}</h2>

          <div className="grid gap-2 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <input
                name="nickname"
                placeholder={isKo ? '닉네임' : 'Nickname'}
                className="input"
                value={commentForm.nickname}
                onChange={handleCommentChange}
              />
              <input
                name="password"
                type="password"
                placeholder={isKo ? '비밀번호 (수정/삭제용)' : 'Password (for edit/delete)'}
                className="input"
                value={commentForm.password}
                onChange={handleCommentChange}
              />
            </div>

            <textarea
              name="content"
              placeholder={isKo ? '댓글을 입력하세요' : 'Write a comment'}
              className="input min-h-[80px]"
              value={commentForm.content}
              onChange={handleCommentChange}
            />

            <div className="flex justify-end">
              <button type="button" className="btn-primary" onClick={handleCommentSubmit}>
                {isKo ? '댓글 등록' : 'Submit comment'}
              </button>
            </div>
          </div>

          {comments.length === 0 ? (
            <p className="text-sm text-slate-500">{isKo ? '아직 댓글이 없습니다.' : 'No comments yet.'}</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="border rounded-lg px-3 py-2 bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{c.nickname}</span>
                    <span className="flex items-center gap-2">
                      {c.created_at && (
                        <span className="text-[11px] text-slate-400">
                          {new Date(c.created_at).toLocaleString('ko-KR')}
                        </span>
                      )}
                    </span>
                  </div>

                  <p className="text-sm whitespace-pre-wrap mb-2">{c.content}</p>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-blue-600"
                      onClick={() => handleCommentEdit(c)}
                    >
                      {isKo ? '수정' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-red-600"
                      onClick={() => handleCommentDelete(c)}
                    >
                      {isKo ? '삭제' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-slate-100 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </>
  );
}

/* ---------------------- SSG ---------------------- */

export async function getStaticPaths() {
  const postsKo = getAllPosts('ko');
  const postsEn = getAllPostsStrict('en');

  const paths = [
    ...postsKo.map((p) => ({
      params: {
        category: getCategorySlugFromPost(p, 'ko'),
        lang: 'ko',
        slug: p.slug,
      },
      locale: 'ko',
    })),
    ...postsEn.map((p) => ({
      params: {
        category: getCategorySlugFromPost(p, 'en'),
        lang: 'en',
        slug: p.slug,
      },
      locale: 'en',
    })),
  ].filter((p) => !!p.params.category);

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { lang, slug } = params;

  // ✅ strict 로드 (en에서 ko로 fallback 금지)
  const post = getPostBySlugStrict(lang, slug);

  // ✅ 반대 언어 존재 체크도 strict
  const otherLang = lang === 'ko' ? 'en' : 'ko';
  const otherLangAvailable = hasPostSlugStrict(otherLang, slug);

  const categorySlug = getCategorySlugFromPost(post, lang);

  return {
    props: {
      post,
      lang,
      otherLangAvailable,
      categorySlug,
    },
  };
}
