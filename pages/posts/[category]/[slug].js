// pages/posts/[category]/[slug].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import SeoHead from '../../../_components/SeoHead';
import AdResponsive from '../../../_components/AdResponsive';
import AdInArticle from '../../../_components/AdInArticle';
import { AD_CLIENT, AD_SLOTS } from '../../../config/adSlots';
import {
  getAllPosts,
  getAllPostsStrict,
  getPostBySlugStrict,  
} from '../../../lib/posts';
import parse, { domToReact } from 'html-react-parser';
import {
  RelatedCalculatorCtaGrid,
  getPostRelatedToolIds,
  normalizeToolId,
} from '../../../_components/ToolBacklinkKit';
import { cloudinaryContentImage, cloudinaryThumb } from '../../../lib/cloudinaryUrl';
import { trackGaEvent } from '../../../utils/analytics';

/* ---------------------- build-time cache ---------------------- */
// 빌드(SSG) 때 getStaticProps가 포스트 수만큼 반복 호출되므로,
// 매번 전체 포스트를 다시 스캔/파싱하지 않도록 메모리 캐시를 둡니다.
// (Next build 프로세스 내에서만 유효)
const __ALL_POSTS_CACHE = { ko: null, en: null };
const __SLUG_SET_CACHE = { ko: null, en: null };

function getAllPostsCached(lang) {
  if (lang === 'en') {
    if (!__ALL_POSTS_CACHE.en) __ALL_POSTS_CACHE.en = getAllPostsStrict('en');
    return __ALL_POSTS_CACHE.en;
  }
  if (!__ALL_POSTS_CACHE.ko) __ALL_POSTS_CACHE.ko = getAllPosts('ko');
  return __ALL_POSTS_CACHE.ko;
}

function getSlugSetCached(lang) {
  if (lang === 'en') {
    if (!__SLUG_SET_CACHE.en) {
      __SLUG_SET_CACHE.en = new Set(getAllPostsCached('en').map((p) => p.slug));
    }
    return __SLUG_SET_CACHE.en;
  }
  if (!__SLUG_SET_CACHE.ko) {
    __SLUG_SET_CACHE.ko = new Set(getAllPostsCached('ko').map((p) => p.slug));
  }
  return __SLUG_SET_CACHE.ko;
}

function hasSlugCached(lang, slug) {
  try {
    return getSlugSetCached(lang).has(slug);
  } catch {
    return false;
  }
}


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

const TOOL_LABELS = {
  comp: { ko: '복리 계산기', en: 'Compound calculator' },
  compound: { ko: '복리 계산기', en: 'Compound calculator' },
  goal: { ko: '목표 자산', en: 'Goal simulator' },
  cagr: { ko: 'CAGR 계산기', en: 'CAGR calculator' },
  dca: { ko: 'DCA 시뮬레이터', en: 'DCA simulator' },
  fire: { ko: 'FIRE 계산기', en: 'FIRE calculator' },
  dsrLtv: { ko: 'DSR LTV 계산기', en: 'DSR LTV calculator' },
};

function getToolLabel(tool, lang) {
  const item = TOOL_LABELS[tool];
  if (!item) return String(tool || '').trim();
  return lang === 'en' ? item.en : item.ko;
}

function scoreRelatedPost(basePost, candidate, lang) {
  const baseTags = new Set((basePost?.tags || []).map((t) => String(t).toLowerCase()));
  const candTags = new Set((candidate?.tags || []).map((t) => String(t).toLowerCase()));
  const baseTools = new Set((basePost?.tools || []).map((t) => String(t).toLowerCase()));
  const candTools = new Set((candidate?.tools || []).map((t) => String(t).toLowerCase()));
  let score = 0;

  for (const tag of candTags) if (baseTags.has(tag)) score += 4;
  for (const tool of candTools) if (baseTools.has(tool)) score += 5;
  if (candidate?.category && candidate.category === basePost?.category) score += 2;
  const year = new Date(candidate?.datePublished || 0).getFullYear();
  if (Number.isFinite(year)) score += Math.min(2, Math.max(0, year - 2023) * 0.25);
  return lang === 'en' ? score + 0.1 : score;
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

export default function PostPage({ post, lang, otherLangAvailable, categorySlug, relatedPosts }) {

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

  // ✅ SEO용 절대 URL (jsonld/breadcrumb에서 먼저 필요)
  const site = 'https://www.finmaphub.com';
  const prefix = lang === 'en' ? '/en' : '';
  const canonicalUrl = `${site}${prefix}/posts/${categorySlug}/${slug}`;

  const absImage = post.cover
    ? (
        String(post.cover).startsWith('http')
         ? cloudinaryThumb(post.cover, { w: 1200, h: 630 })
         : `${site}${post.cover}`
      )
    : undefined;

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: canonicalUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    inLanguage: lang === "en" ? "en" : "ko",
    articleSection: post.category,
    keywords: (post.tags || []).join(", "),
    author: { '@type': 'Organization', name: 'FinMap' },
    publisher: {
      "@type": "Organization",
      name: "FinMap",
      logo: { "@type": "ImageObject", url: `${site}/brand/finmaphub_logo.png` },
    },
    ...(absImage ? { image: [absImage] } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "ko" ? "홈" : "Home", item: lang === "en" ? `${site}/en` : site },
      { "@type": "ListItem", position: 2, name: categorySlug, item: `${site}${prefix}/category/${categorySlug}` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({
    nickname: '',
    password: '',
    content: '',
  });  

  // ✅ shareUrl 초기값은 canonicalUrl로 (SEO 기준 URL)
  const [shareUrl, setShareUrl] = useState(canonicalUrl);

  const engagementQuery = `slug=${encodeURIComponent(slug)}&lang=${encodeURIComponent(lang)}`;

  const reloadComments = async () => {
    try {
      const res = await fetch(`/api/comments?${engagementQuery}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (e) {
      console.error(e);
    }
  };

  const reloadLikes = async () => {
    try {
      const res = await fetch(`/api/like?${engagementQuery}`);
      const data = await res.json();
      setLikes(data.likes || 0);
    } catch (e) {
      console.error(e);
    }
  };

 const registerView = async () => {
  try {
    const res = await fetch(`/api/view?${engagementQuery}`, { method: 'POST' });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('view api failed:', res.status, text);
      return;
    }

    const data = await res.json();
    setViews(data.views || 0);
  } catch (e) {
    console.error('registerView error:', e);
  }
};

  useEffect(() => {
    // ✅ 공유/외부 확산은 항상 canonical로 고정 (중복 URL 확산 방지)
    setShareUrl(canonicalUrl);
    reloadLikes();
    reloadComments();
    registerView();
  }, [slug, lang]);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/like?${engagementQuery}`, { method: 'POST' });
      const data = await res.json();
      if (data.likes != null) setLikes(data.likes);
      trackGaEvent('blog_engagement', {
        action: 'like',
        locale: lang,
        category: categorySlug,
      });
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
      const res = await fetch(`/api/comments?${engagementQuery}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm),
      });
      if (!res.ok) throw new Error('failed');

      await reloadComments();
      setCommentForm({ nickname: '', password: '', content: '' });
      trackGaEvent('blog_engagement', {
        action: 'comment_submit',
        locale: lang,
        category: categorySlug,
      });
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
      const res = await fetch(`/api/comments?${engagementQuery}`, {
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
      const res = await fetch(`/api/comments?${engagementQuery}`, {
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
      trackGaEvent('blog_engagement', {
        action: 'share',
        locale: lang,
        category: categorySlug,
      });
    } catch (e) {
      console.error(e);
    }
  };

  let h2Index = 0;
  const parserOptions = {
    replace(domNode) {
      if (domNode.type !== 'tag') return undefined;

      if (domNode.name === 'h2') {
        h2Index += 1;
        const children = domToReact(domNode.children, parserOptions);

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

      if (domNode.name === 'figure') {
        return (
          <figure className="my-6 max-w-full overflow-visible">
            {domToReact(domNode.children, parserOptions)}
          </figure>
        );
      }

      if (domNode.name === 'figcaption') {
        return (
          <figcaption className="mt-2 break-words text-center text-sm leading-relaxed text-slate-500">
            {domToReact(domNode.children, parserOptions)}
          </figcaption>
        );
      }

      if (domNode.name === 'img') {
        const src = domNode.attribs?.src || '';
        const alt = domNode.attribs?.alt || '';
        const parentClass = String(domNode.parent?.attribs?.class || domNode.parent?.attribs?.className || '');
        const parentStyle = String(domNode.parent?.attribs?.style || '');
        const isInlineImageRow =
          /\bimg-row\b/.test(parentClass) ||
          /display\s*:\s*flex/i.test(parentStyle) ||
          /overflow-x\s*:\s*auto/i.test(parentStyle);

        return (
          <img
            src={cloudinaryContentImage(src, { w: 1200 })}
            alt={alt}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className={
              isInlineImageRow
                ? 'fm-post-inline-row-image mx-auto block rounded-xl object-contain'
                : 'mx-auto block h-auto w-full max-w-full rounded-xl object-contain'
            }
          />
        );
      }

      if (domNode.name === 'table') {
        return (
          <div className="fm-table-scroll my-5 max-w-full">
            <table className="min-w-[640px] w-full border-collapse text-sm">
              {domToReact(domNode.children, parserOptions)}
            </table>
          </div>
        );
      }

      if (domNode.name === 'pre') {
        return (
          <pre className="my-5 max-w-full overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-relaxed text-slate-100">
            {domToReact(domNode.children, parserOptions)}
          </pre>
        );
      }

      if (domNode.name === 'code') {
        const children = domToReact(domNode.children, parserOptions);
        const isPreCode = domNode.parent?.name === 'pre';

        if (isPreCode) {
          return <code className="block min-w-max whitespace-pre bg-transparent p-0 text-inherit">{children}</code>;
        }

        return <code className="break-words rounded bg-slate-100 px-1 py-0.5 text-[0.9em]">{children}</code>;
      }

      if (domNode.name === 'details') {
        return (
          <details className="my-4 max-w-full rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            {domToReact(domNode.children, parserOptions)}
          </details>
        );
      }

      if (domNode.name === 'summary') {
        return (
          <summary className="min-h-[44px] cursor-pointer break-words py-2 text-sm font-semibold leading-snug text-slate-900">
            {domToReact(domNode.children, parserOptions)}
          </summary>
        );
      }

      return undefined;
    },
  };

  const contentWithInArticleAds = parse(post.contentHtml, parserOptions);

  const toolList = Array.isArray(post.tools) ? post.tools : Array.isArray(post.tool) ? post.tool : [];
  const normalizedTools = toolList
    .map((t) => normalizeToolId(t))
    .filter(Boolean);
  const relatedCalculatorTools = getPostRelatedToolIds(post, normalizedTools, 3);

  return (
    <>
      <SeoHead
        title={post.title}
        desc={post.description}
        url={`${prefix}/posts/${categorySlug}/${post.slug}`}
        image={post.cover ? cloudinaryThumb(post.cover, { w: 1200, h: 630 }) : undefined}
        locale={lang} // ✅ canonical/hreflang을 컨텐츠 언어에 맞춤
      />
      <JsonLd data={jsonld} />
      <JsonLd data={breadcrumbJsonLd} />

      <article className="prose prose-slate lg:prose-lg max-w-none min-w-0 overflow-x-hidden rounded-2xl border bg-white p-4 shadow-card sm:p-6">
        <h1 className="fm-post-title fm-post-title--clamp3 max-w-full break-words leading-tight">{post.title}</h1>

        <div className="min-w-0 space-y-1 break-words text-sm text-slate-500">
          <p>
            {post.category} · {post.datePublished}
            {post.dateModified && post.dateModified !== post.datePublished
              ? ` · ${isKo ? '수정' : 'Updated'}: ${post.dateModified}`
              : ''}
          </p>
          <p>👁️ {isKo ? '조회수' : 'Views'} {views.toLocaleString()}</p>
        </div>

        <div className="my-4">
          <AdResponsive key={`post-top-${lang}-${slug}`} client={AD_CLIENT} slot={AD_SLOTS.responsiveTop} align="center" />
        </div>

        {post.cover && (
          <div className="relative mt-4 mb-6 aspect-[1200/630] w-full min-w-0 max-w-full overflow-hidden rounded-xl">
            <Image
              src={cloudinaryThumb(post.cover, { w: 1200, h: 630 })}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 900px, 1200px"
              priority
            />
          </div>
        )}

        <section className="not-prose my-6 max-w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            {post.readingTimeMinutes ? (
              <span>{isKo ? `${post.readingTimeMinutes}분 읽기` : `${post.readingTimeMinutes} min read`}</span>
            ) : null}
            {normalizedTools.length > 0 ? (
              <span>{isKo ? '연결 도구 포함' : 'Includes related tools'}</span>
            ) : null}
          </div>
          {post.description ? (
            <p className="mt-2 break-words text-sm leading-6 text-slate-700">{post.description}</p>
          ) : null}
          {normalizedTools.length > 0 ? (
            <div className="mt-3 flex min-w-0 flex-wrap gap-2">
              {normalizedTools.slice(0, 4).map((toolType) => (
                <span key={`summary-${toolType}`} className="max-w-full break-words rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                  {getToolLabel(toolType, lang)}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <div className="fm-post-body min-w-0 max-w-full break-words">{contentWithInArticleAds}</div>

        <RelatedCalculatorCtaGrid
          toolIds={relatedCalculatorTools}
          locale={lang}
          source="blog_detail"
          location="post_bottom"
        />

        <div className="mt-8 mb-4">
          <AdResponsive key={`post-bot-${lang}-${slug}`} client={AD_CLIENT} slot={AD_SLOTS.responsiveBottom} align="center" />
        </div>

        <div className="not-prose mt-4 grid grid-cols-2 gap-2 border-t pt-4 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
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
            className="inline-flex min-h-[44px] items-center justify-center break-words rounded-lg border border-sky-100 px-3 py-2 text-center text-xs text-sky-600 underline"
          >
            X(Twitter)
          </a>

          <a
            href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center break-words rounded-lg border border-blue-100 px-3 py-2 text-center text-xs text-blue-600 underline"
          >
            Facebook
          </a>
        </div>

        {/* 댓글 영역 (원본 유지) */}
        <section className="not-prose mt-6 min-w-0 border-t pt-4">
          <h2 className="mb-3 break-words text-base font-semibold md:text-lg">{isKo ? '댓글' : 'Comments'}</h2>
            <form
              className="mb-4 grid min-w-0 gap-3"
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                handleCommentSubmit();
              }}
            >
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                name="nickname"
                placeholder={isKo ? '닉네임' : 'Nickname'}
                autoComplete="username"
                className="input"
                value={commentForm.nickname}
                onChange={handleCommentChange}
              />
              <input
                name="password"
                type="password"
                placeholder={isKo ? '비밀번호 (수정/삭제용)' : 'Password (for edit/delete)'}
                autoComplete="new-password"
                className="input"
                value={commentForm.password}
                onChange={handleCommentChange}
              />
            </div>

            <textarea
              name="content"
              placeholder={isKo ? '댓글을 입력하세요' : 'Write a comment'}
              className="input min-h-[96px]"
              value={commentForm.content}
              onChange={handleCommentChange}
            />

            <div className="grid sm:flex sm:justify-end">
              <button type="submit" className="btn-primary w-full sm:w-auto">
                {isKo ? '댓글 등록' : 'Submit comment'}
              </button>
            </div>
          </form>

          {comments.length === 0 ? (
            <p className="break-words text-sm text-slate-500">{isKo ? '아직 댓글이 없습니다.' : 'No comments yet.'}</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="min-w-0 rounded-lg border bg-slate-50 px-3 py-2">
                  <div className="mb-1 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="break-words text-sm font-semibold">{c.nickname}</span>
                    <span className="flex min-w-0 items-center gap-2">
                      {c.created_at && (
                        <span className="break-words text-[11px] text-slate-400">
                          {new Date(c.created_at).toLocaleString(isKo ? 'ko-KR' : 'en-US')}
                        </span>
                      )}
                    </span>
                  </div>

                  <p className="mb-2 whitespace-pre-wrap break-words text-sm">{c.content}</p>

                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      className="min-h-[36px] px-2 text-xs text-slate-500 hover:text-blue-600"
                      onClick={() => handleCommentEdit(c)}
                    >
                      {isKo ? '수정' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      className="min-h-[36px] px-2 text-xs text-slate-500 hover:text-red-600"
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
          <div className="not-prose mt-4 flex min-w-0 flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="max-w-full break-words rounded-full bg-slate-100 px-2 py-1 text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {Array.isArray(relatedPosts) && relatedPosts.length > 0 && (
          <section className="not-prose mt-10 min-w-0 border-t pt-6">
            <h2 className="mb-3 break-words text-base font-semibold md:text-lg">
              {lang === 'en' ? 'Related posts' : '관련 글'}
            </h2>
            <div className="mb-3 text-sm">
              <Link className="inline-flex min-h-[44px] items-center break-words underline" href={`/category/${categorySlug}`} locale={lang} prefetch={false}>
                {lang === 'en' ? 'Open category' : '카테고리 더 보기'}
              </Link>
            </div>
            <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              {relatedPosts.map((rp) => (
                <li key={`${rp.lang}-${rp.slug}`} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <Link
                    className="block break-words font-semibold leading-snug text-slate-900 hover:underline"
                    href={`/posts/${categorySlug}/${rp.slug}`}
                    locale={rp.lang}
                    prefetch={false}
                  >
                    {rp.title}
                  </Link>
                  {rp.description ? (
                    <p className="mt-1 break-words text-xs leading-5 text-slate-600">{rp.description}</p>
                  ) : null}
                  {rp.readingTimeMinutes ? (
                    <div className="mt-1 break-words text-xs text-slate-500">
                      {lang === 'en' ? `${rp.readingTimeMinutes} min read` : `${rp.readingTimeMinutes}분 읽기`}
                    </div>
                  ) : null}
                  {rp.datePublished ? <span className="break-words text-slate-400"> · {rp.datePublished}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        )}

      </article>
    </>
  );
}

/* ---------------------- SSG ---------------------- */

export async function getStaticPaths() {
  const postsKo = getAllPostsCached('ko');
  const postsEn = getAllPostsCached('en');

  const paths = [
    ...postsKo.map((p) => ({
      params: {
        category: getCategorySlugFromPost(p, 'ko'),
        slug: p.slug,
      },
      locale: 'ko',
    })),
    ...postsEn.map((p) => ({
      params: {
        category: getCategorySlugFromPost(p, 'en'),
        slug: p.slug,
      },
      locale: 'en',
    })),
  ].filter((p) => !!p.params.category);

  return { paths, fallback: false };
}

export async function getStaticProps({ params, locale }) {
  const lang = locale === 'en' ? 'en' : 'ko';
  const slug = String(params?.slug || '');
  const categoryFromUrl = String(params?.category || '');

  // ✅ 템플릿/이상 URL 방어: /posts/[category]/[slug] 같은 케이스 500 → 404 처리
  const bad = (v) => !v || v.includes('[') || v.includes(']') || v.includes('%5B') || v.includes('%5D');
  if (bad(slug) || bad(categoryFromUrl)) {
    return { notFound: true, revalidate: 60 };
  }



  // ✅ strict 로드 (en에서 ko로 fallback 금지)
  let post;
  try {
    // ✅ strict 로드 (en에서 ko로 fallback 금지)
    post = getPostBySlugStrict(lang, slug);
  } catch (e) {
    return { notFound: true, revalidate: 60 };
  }


  // ✅ 반대 언어 존재 체크도 strict
  const otherLang = lang === 'ko' ? 'en' : 'ko';
  const otherLangAvailable = hasSlugCached(otherLang, slug);

  const categorySlug = getCategorySlugFromPost(post, lang);

  // ✅ URL의 category가 실제 post의 category와 다르면 canonical로 보내기(선택이지만 SEO에 좋음)
  if (categoryFromUrl !== categorySlug) {
    const prefix = lang === 'en' ? '/en' : '';
    return {
      redirect: {
        destination: `${prefix}/posts/${categorySlug}/${slug}`,
        statusCode: 301,
      },
    };
  }

  // ✅ related: 같은 언어 + 같은 카테고리에서 최신 5개 (현재 글 제외)
  const allSameLang = getAllPostsCached(lang);
  const sameCat = allSameLang
    .filter((p) => p.slug !== slug)
    .filter((p) => getCategorySlugFromPost(p, lang) === categorySlug)
    .sort((a, b) => {
      const scoreDiff = scoreRelatedPost(post, b, lang) - scoreRelatedPost(post, a, lang);
      if (scoreDiff) return scoreDiff;
      return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
    })
    .slice(0, 5)
    .map((p) => ({
      lang,
      slug: p.slug,
      title: p.title,
      datePublished: p.datePublished || '',
      description: p.description || '',
      readingTimeMinutes: p.readingTimeMinutes || null,
  }));


  return {
    props: {
      post,
      lang,
      otherLangAvailable,
      categorySlug,
      relatedPosts: sameCat,
    },
  };
}
