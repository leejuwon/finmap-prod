// pages/category/[slug].js
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import SeoHead from '../../_components/SeoHead';
import { getAllPosts, getAllPostsStrict } from '../../lib/posts';
import { cloudinaryThumb } from '../../lib/cloudinaryUrl';

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

const CATEGORY_ORDER = ['economicInfo', 'personalFinance', 'investingInfo'];

// 카테고리 허브(목차) 상단 설명(원하면 문구만 여기서 조정)
const CATEGORY_META = {
  economicInfo: {
    ko: {
      tagline: '금리·물가·환율·경기 지표를 “한 번에 읽는” 경제 목차입니다.',
      bullets: [
        '지표를 “정의 → 해석 → 체크리스트” 순서로 정리합니다.',
        '뉴스보다 “지표 변화의 방향/속도”에 초점을 맞춥니다.',
        '투자 판단을 규칙(조건)으로 바꾸는 것을 목표로 합니다.',
      ],
    },
    en: {
      tagline: 'A table of contents for rates, inflation, FX, and macro—read in one flow.',
      bullets: [
        'We structure indicators as “definition → interpretation → checklist”.',
        'We focus on direction/speed, not headlines.',
        'We turn decisions into simple if/then rules.',
      ],
    },
  },
  personalFinance: {
    ko: {
      tagline: '현금흐름·저축·세금·보험을 “계획”으로 바꾸는 재테크 목차입니다.',
      bullets: [
        '지출/저축/부채를 한 장으로 정리합니다.',
        '세금·보험·수수료처럼 “새는 구멍”을 우선 막습니다.',
        '목표를 숫자와 루틴으로 연결합니다.',
      ],
    },
    en: {
      tagline: 'Personal finance topics that turn your money life into a plan.',
      bullets: [
        'Cashflow, saving, and debt—summarized into one system.',
        'Plug leaks: taxes, insurance, and fees first.',
        'Connect goals to numbers and routines.',
      ],
    },
  },
  investingInfo: {
    ko: {
      tagline: '자산배분·리스크·환헤지·전략을 “규칙”으로 정리하는 투자 목차입니다.',
      bullets: [
        '리스크를 먼저 정의하고 포지션을 정합니다.',
        '환율/금리 레짐에 따른 행동을 미리 정합니다.',
        '장기 전략을 흔드는 “감정 트리거”를 줄입니다.',
      ],
    },
    en: {
      tagline: 'Investing topics that compress allocation, risk, and FX into a playbook.',
      bullets: [
        'Define risk first, then size positions.',
        'Predefine actions by FX/rate regimes.',
        'Reduce emotional rule-drift over the long run.',
      ],
    },
  },
};

function dateValue(s) {
  if (!s) return 0;
  const t = Date.parse(String(s));
  return Number.isFinite(t) ? t : 0;
}

const TOOL_LABELS = {
  comp: { ko: '복리 계산기', en: 'Compound calculator' },
  compound: { ko: '복리 계산기', en: 'Compound calculator' },
  goal: { ko: '목표 자산', en: 'Goal simulator' },
  cagr: { ko: 'CAGR', en: 'CAGR calculator' },
  dca: { ko: 'DCA', en: 'DCA simulator' },
  fire: { ko: 'FIRE', en: 'FIRE calculator' },
};

function getToolLabel(tool, lang) {
  const item = TOOL_LABELS[tool];
  if (!item) return String(tool || '').trim();
  return lang === 'en' ? item.en : item.ko;
}

function toLitePost(p, forcedLang) {
  const lang = forcedLang || p?.lang || 'ko';
  return {
    slug: p?.slug || '',
    lang,
    category: p?.category || '',
    title: p?.title || '',
    description: p?.description || '',
    datePublished: p?.datePublished || '',
    cover: p?.cover || '',
    tools: Array.isArray(p?.tools) ? p.tools : [],
    tags: Array.isArray(p?.tags) ? p.tags : [],
    readingTimeMinutes: p?.readingTimeMinutes || null,
    wordCount: p?.wordCount || null,
  };
}


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

  const meta = useMemo(() => {
    const m = CATEGORY_META[slug];
    const fallback = {
      tagline: isKo ? `${title} 글을 모아둔 목차입니다.` : `A hub for ${title} posts.`,
      bullets: [],
    };
    if (!m) return fallback;
    return isKo ? m.ko : m.en;
  }, [isKo, slug, title]);

  const postsSorted = useMemo(() => {
    const arr = Array.isArray(posts) ? [...posts] : [];
    arr.sort((a, b) => dateValue(b?.datePublished) - dateValue(a?.datePublished));
    return arr;
  }, [posts]);

  const totalCount = postsSorted.length;
  const lastUpdated = postsSorted[0]?.datePublished || null;

  const featured = useMemo(() => postsSorted.slice(0, 6), [postsSorted]);
  const latest = useMemo(() => postsSorted.slice(0, 12), [postsSorted]);

  const [tab, setTab] = useState('featured'); // featured | latest | all
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const qq = String(q || '').trim().toLowerCase();
    if (!qq) return postsSorted;
    return postsSorted.filter((p) => {
      const t = (p?.title || '').toLowerCase();
      const d = (p?.description || '').toLowerCase();
      return t.includes(qq) || d.includes(qq);
    });
  }, [postsSorted, q]);

  const visibleCards = q ? filtered.slice(0, 12) : (tab === 'latest' ? latest : featured);

  const categorySeoDescription = isKo
    ? `${title} 글을 계산기, 예시, 체크리스트와 함께 모았습니다. 최신 글과 관련 도구를 통해 바로 계산하고 확인해보세요.`
    : `Browse ${title} guides with calculators, examples, and checklists. Start from featured posts and related FinMap tools.`;


  return (
    <>
      <SeoHead
        title={isKo ? `${title} 카테고리` : `${title} Guides`}
        desc={categorySeoDescription}
        url={`/category/${slug}`}
        locale={locale}
      />

      <div className="w-full min-w-0 bg-slate-50">
        <div className="mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-4 sm:py-8">
          {/* 상단 히어로 카드 */}
          <section className="relative max-w-full overflow-hidden rounded-2xl border bg-white shadow-card sm:rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/[0.03] via-transparent to-slate-900/[0.02]" />
            <div className="relative min-w-0 p-4 sm:p-8">
              {/* 카테고리 탭(상단) */}
              <div className="mb-5 flex min-w-0 flex-wrap items-center gap-2">
                {CATEGORY_ORDER.map((s) => {
                  const labels = isKo ? CATEGORY_LABELS_KO : CATEGORY_LABELS_EN;
                  const active = s === slug;
                  return (
                    <Link
                      key={s}
                      href={`/category/${s}`}
                      locale={locale}
                      prefetch={false}
                      className={
                        active
                          ? 'inline-flex min-h-[44px] max-w-full items-center justify-center whitespace-normal break-words rounded-full bg-slate-900 px-3 py-1.5 text-center text-sm font-semibold leading-tight text-white'
                          : 'inline-flex min-h-[44px] max-w-full items-center justify-center whitespace-normal break-words rounded-full border bg-white px-3 py-1.5 text-center text-sm font-medium leading-tight text-slate-700 hover:bg-slate-100'
                      }
                    >
                      {labels[s] || s}
                    </Link>
                  );
                })}

                <div className="flex w-full min-w-0 flex-wrap items-center gap-2 text-xs text-slate-500 sm:ml-auto sm:w-auto">
                  <span className="inline-flex min-h-[32px] max-w-full items-center break-words rounded-full border bg-white px-2 py-1">
                    {isKo ? `총 ${totalCount}개` : `${totalCount} posts`}
                  </span>
                  {lastUpdated && (
                    <span className="inline-flex min-h-[32px] max-w-full items-center break-words rounded-full border bg-white px-2 py-1">
                      {isKo ? `최근 업데이트: ${lastUpdated}` : `Updated: ${lastUpdated}`}
                    </span>
                  )}
                </div>
              </div>

              <h1 className="max-w-full break-words text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 max-w-full break-words text-slate-700">{meta.tagline}</p>

              {meta.bullets?.length > 0 && (
                <ul className="mt-4 grid min-w-0 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  {meta.bullets.map((b, i) => (
                    <li key={i} className="flex min-w-0 gap-2">
                      <span className="mt-0.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      <span className="min-w-0 break-words">{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA/탭/검색 */}
              <div className="mt-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTab('featured')}
                    className={
                      tab === 'featured'
                        ? 'inline-flex min-h-[44px] max-w-full items-center justify-center whitespace-normal break-words rounded-full bg-blue-600 px-3 py-1.5 text-center text-sm font-semibold leading-tight text-white'
                        : 'inline-flex min-h-[44px] max-w-full items-center justify-center whitespace-normal break-words rounded-full border bg-white px-3 py-1.5 text-center text-sm font-medium leading-tight text-slate-700 hover:bg-slate-100'
                    }
                  >
                    {isKo ? '추천' : 'Featured'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('latest')}
                    className={
                      tab === 'latest'
                        ? 'inline-flex min-h-[44px] max-w-full items-center justify-center whitespace-normal break-words rounded-full bg-blue-600 px-3 py-1.5 text-center text-sm font-semibold leading-tight text-white'
                        : 'inline-flex min-h-[44px] max-w-full items-center justify-center whitespace-normal break-words rounded-full border bg-white px-3 py-1.5 text-center text-sm font-medium leading-tight text-slate-700 hover:bg-slate-100'
                    }
                  >
                    {isKo ? '최신' : 'Latest'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('all')}
                    className={
                      tab === 'all'
                        ? 'inline-flex min-h-[44px] max-w-full items-center justify-center whitespace-normal break-words rounded-full bg-blue-600 px-3 py-1.5 text-center text-sm font-semibold leading-tight text-white'
                        : 'inline-flex min-h-[44px] max-w-full items-center justify-center whitespace-normal break-words rounded-full border bg-white px-3 py-1.5 text-center text-sm font-medium leading-tight text-slate-700 hover:bg-slate-100'
                    }
                  >
                    {isKo ? '전체 목록' : 'All titles'}
                  </button>

                  <Link
                    href="/tools"
                    locale={locale}
                    prefetch={false}
                    className="inline-flex min-h-[44px] max-w-full items-center justify-center whitespace-normal break-words rounded-full border bg-white px-3 py-1.5 text-center text-sm font-medium leading-tight text-slate-700 hover:bg-slate-100"
                  >
                    {isKo ? '금융 계산기' : 'Tools'}
                  </Link>
                </div>

                <div className="w-full min-w-0 sm:w-[340px]">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={isKo ? '이 카테고리에서 검색…' : 'Search in this category…'}
                    className="min-h-[44px] w-full min-w-0 rounded-2xl border bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 내용 */}
          {!postsSorted || postsSorted.length === 0 ? (
            <p className="mt-8 break-words text-slate-500">
              {isKo ? '아직 이 카테고리의 글이 없습니다.' : 'No English posts in this category yet.'}
            </p>
          ) : (
            <>
              {/* 카드 섹션 */}
              {tab !== 'all' && (
                <section className="mt-8 min-w-0">
                  <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                    <h2 className="max-w-full break-words text-lg font-bold leading-tight text-slate-900 sm:text-xl">
                      {q
                        ? (isKo ? `검색 결과 (${Math.min(12, filtered.length)}개 표시)` : `Search results (showing ${Math.min(12, filtered.length)})`)
                        : (tab === 'latest' ? (isKo ? '최신 글' : 'Latest posts') : (isKo ? '추천 글' : 'Featured posts'))}
                    </h2>
                    <div className="break-words text-xs text-slate-500">
                      {isKo ? '카드는 12개까지 표시합니다.' : 'Cards show up to 12 posts.'}
                    </div>
                  </div>

                  <ul className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleCards.map((p, idx) => {
                      const postLang = p.lang || (isKo ? 'ko' : 'en');
                      return (
                        <li
                          key={`${postLang}-${p.slug}`}
                          className="group min-w-0 max-w-full overflow-hidden rounded-2xl border bg-white shadow-card transition-shadow hover:shadow-lg"
                        >
                          {p.cover ? (
                            <div className="relative aspect-[16/9] w-full min-w-0 max-w-full overflow-hidden">
                              <Image
                                src={cloudinaryThumb(p.cover, { w: 640, h: 360 })}
                                alt={p.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                priority={idx === 0}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ) : (
                            <div className="h-20 max-w-full bg-slate-100" />
                          )}

                          <div className="min-w-0 p-4">
                            <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="break-words">{p.datePublished}</span>
                              {p.readingTimeMinutes ? (
                                <span className="break-words">{isKo ? `${p.readingTimeMinutes}분 읽기` : `${p.readingTimeMinutes} min read`}</span>
                              ) : null}
                            </div>
                            <h3 className="mt-2 break-words text-base font-semibold leading-snug text-slate-900">
                              <Link
                                href={`/posts/${slug}/${p.slug}`}
                                locale={locale}
                                prefetch={false}
                                className="block break-words hover:underline underline-offset-4"
                              >
                                {p.title}
                              </Link>
                            </h3>
                            {p.description && (
                              <p className="mt-2 break-words text-sm text-slate-600 line-clamp-2">
                                {p.description}
                              </p>
                            )}
                            {Array.isArray(p.tools) && p.tools.length > 0 ? (
                              <div className="mt-3 flex min-w-0 flex-wrap gap-1.5">
                                {p.tools.slice(0, 3).map((tool) => (
                                  <span key={`${p.slug}-${tool}`} className="max-w-full break-words rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                                    {getToolLabel(tool, locale)}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              <section className="mt-10 min-w-0" id="all-post-links">
                <details className="max-w-full overflow-hidden rounded-2xl border bg-white shadow-card">
                  <summary className="min-h-[44px] cursor-pointer select-none break-words px-4 py-3 text-sm font-semibold leading-snug text-slate-900 hover:bg-slate-50">
                    {isKo ? '전체 글 링크(검색/탭 없이 항상 포함)' : 'All post links (always included)'}
                    <span className="ml-2 break-words text-xs font-normal text-slate-500">
                      {isKo ? `(총 ${totalCount}개)` : `(${totalCount} posts)`}
                    </span>
                  </summary>

                  <div className="min-w-0 px-4 pb-4 pt-3">
                    <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                      {postsSorted.map((p) => (
                        <li
                          key={`all-${p.slug}`}
                          className="min-w-0 rounded-xl border bg-slate-50/60 p-3 hover:bg-slate-50"
                        >
                          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="break-words">{p.datePublished}</span>
                            {p.readingTimeMinutes ? (
                              <span className="break-words">{isKo ? `${p.readingTimeMinutes}분 읽기` : `${p.readingTimeMinutes} min read`}</span>
                            ) : null}
                          </div>

                          <Link
                            href={`/posts/${slug}/${p.slug}`}
                            locale={locale} // ✅ 여기서는 locale로 고정 추천
                            prefetch={false}
                            className="mt-1 block break-words text-sm font-semibold leading-snug text-slate-900 hover:underline underline-offset-4 line-clamp-2"
                          >
                            {p.title}
                          </Link>

                          {p.description ? (
                            <p className="mt-1 break-words text-xs text-slate-600 line-clamp-2">
                              {p.description}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </section>

              {/* 전체 목록(이미지 없는 카드형) */}
              {tab === 'all' && (
                <section className="mt-8 min-w-0">
                  <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                    <h2 className="max-w-full break-words text-lg font-bold leading-tight text-slate-900 sm:text-xl">
                      {isKo ? '전체 목록' : 'All titles'}
                    </h2>
                    <div className="break-words text-xs text-slate-500">
                      {isKo ? '제목을 클릭하면 글로 이동합니다.' : 'Click a title to open the post.'}
                    </div>
                  </div>

                  <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                    {filtered.map((p) => (
                      <li
                        key={`alltab-${p.slug}`}
                        className="min-w-0 rounded-2xl border bg-white p-4 shadow-card transition-shadow hover:shadow-lg"
                      >
                        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="break-words">{p.datePublished}</span>
                          {p.readingTimeMinutes ? (
                            <span className="break-words">{isKo ? `${p.readingTimeMinutes}분 읽기` : `${p.readingTimeMinutes} min read`}</span>
                          ) : null}
                        </div>

                        <h3 className="mt-2 break-words text-base font-semibold leading-snug text-slate-900">
                          <Link
                            href={`/posts/${slug}/${p.slug}`}
                            locale={locale} // ✅ 카테고리 로케일과 동일하게
                            prefetch={false}
                            className="block break-words hover:underline underline-offset-4 line-clamp-2"
                          >
                            {p.title}
                          </Link>
                        </h3>

                        {p.description ? (
                          <p className="mt-2 break-words text-sm text-slate-600 line-clamp-2">
                            {p.description}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </div>
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

export async function getStaticProps({ params, locale }) {
  const slug = params?.slug;
  const lang = locale === 'en' ? 'en' : 'ko';

  // ✅ locale별로 필요한 언어만 내려서 page-data 크기 절감
  let postsKo = [];
  let postsEn = [];

  // ✅ en은 strict로만 (KO fallback 섞임 방지)
  if (lang === 'ko') {
    const allKo = getAllPosts('ko');
    postsKo = allKo
      .filter((p) => getCategorySlugFromPost(p, 'ko') === slug)
      .map((p) => toLitePost(p, 'ko'));
  } else {
    // ✅ en은 strict로만 (KO fallback 섞임 방지)
    const allEn = getAllPostsStrict('en');
    postsEn = allEn
      .filter((p) => getCategorySlugFromPost(p, 'en') === slug)
      .map((p) => toLitePost(p, 'en'));
  }

  return {
    props: {
      slug,
      postsKo,
      postsEn,
    },
  };
}
