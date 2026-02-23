// pages/sitemap-pages.js
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SeoHead from '../_components/SeoHead';
import { getAllPostsAllLangs } from '../lib/posts';

const LABELS = {
  ko: {
    title: '사이트맵',
    desc: 'FinMap 전체 글/카테고리 링크 모음',
    cats: { economicInfo: '경제정보', personalFinance: '재테크', investingInfo: '투자정보' },
  },
  en: {
    title: 'Sitemap',
    desc: 'All FinMap posts and category links',
    cats: { economicInfo: 'Economic Info', personalFinance: 'Personal Finance', investingInfo: 'Investing Info' },
  },
};

function categorySlugFromPost(p) {
  const ko = { 경제정보: 'economicInfo', 재테크: 'personalFinance', 투자정보: 'investingInfo' };
  const en = { 'economic info': 'economicInfo', 'personal finance': 'personalFinance', 'investing info': 'investingInfo' };

  const lang = p.lang || 'ko';
  const c = (p.category || '').trim();
  if (lang === 'ko') return ko[c] || 'economicInfo';
  return en[c.toLowerCase()] || 'economicInfo';
}

const CAT_ORDER = ['economicInfo', 'personalFinance', 'investingInfo'];

function dateValue(s) {
  if (!s) return 0;
  const t = Date.parse(String(s));
  return Number.isFinite(t) ? t : 0;
}

function toLitePost(p) {
  const lang = p?.lang || 'ko';
  return {
    slug: p?.slug || '',
    lang,
    category: p?.category || '',
    title: p?.title || '',
    description: p?.description || '',
    datePublished: p?.datePublished || '',
    cover: p?.cover || '',
  };
}

export default function SitemapPages({ posts }) {
  const router = useRouter();
  const lang = router?.locale === 'en' ? 'en' : 'ko';
  const t = LABELS[lang];

  const list = useMemo(() => {
    return (posts || []).filter((p) => (p.lang || 'ko') === lang);
  }, [posts, lang]);

  const [q, setQ] = useState('');
  const [open, setOpen] = useState({
    economicInfo: true,
    personalFinance: true,
    investingInfo: true,
  });

  // 카테고리별 그룹
  const grouped = useMemo(() => {
    const g = { economicInfo: [], personalFinance: [], investingInfo: [] };
    for (const p of list) {
      const c = categorySlugFromPost(p);
      if (!g[c]) g[c] = [];
      g[c].push(p);
    }
    for (const k of Object.keys(g)) {
      g[k].sort((a, b) => dateValue(b?.datePublished) - dateValue(a?.datePublished));
    }
    return g;
  }, [list]);

  const totalCount = list.length;
  const lastUpdated = useMemo(() => {
    if (!list.length) return null;
    const sorted = [...list].sort((a, b) => dateValue(b?.datePublished) - dateValue(a?.datePublished));
    return sorted[0]?.datePublished || null;
  }, [list]);

  const filteredGrouped = useMemo(() => {
    const qq = String(q || '').trim().toLowerCase();
    if (!qq) return grouped;
    const fg = { economicInfo: [], personalFinance: [], investingInfo: [] };
    for (const cat of Object.keys(grouped)) {
      fg[cat] = (grouped[cat] || []).filter((p) => {
        const tt = (p?.title || '').toLowerCase();
        const dd = (p?.description || '').toLowerCase();
        return tt.includes(qq) || dd.includes(qq);
      });
    }
    return fg;
  }, [grouped, q]);

  return (
    <>
      <SeoHead title={t.title} desc={t.desc} url="/sitemap-pages" locale={lang} />

      <div className="w-full bg-slate-50">
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl border bg-white shadow-card">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/[0.03] via-transparent to-slate-900/[0.02]" />
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {t.title}
                  </h1>
                  <p className="mt-2 text-slate-700">{t.desc}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center rounded-full border bg-white px-2 py-1">
                      {lang === 'en' ? `${totalCount} posts` : `총 ${totalCount}개`}
                    </span>
                    {lastUpdated && (
                      <span className="inline-flex items-center rounded-full border bg-white px-2 py-1">
                        {lang === 'en' ? `Updated: ${lastUpdated}` : `최근 업데이트: ${lastUpdated}`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full sm:w-[340px]">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={lang === 'en' ? 'Search posts…' : '글 검색…'}
                    className="w-full rounded-2xl border bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <div className="mt-2 text-xs text-slate-500">
                    {lang === 'en'
                      ? 'Search matches title/description in this language.'
                      : '현재 언어 기준(제목/설명)으로 검색됩니다.'}
                  </div>
                </div>
              </div>

              {/* CTA / QUICK LINKS */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Link
                  href="/"
                  locale={lang}
                  className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  {lang === 'en' ? 'Home' : '홈'}
                </Link>
                <Link
                  href="/market/real-estate"
                  locale={lang}
                  className="inline-flex items-center rounded-full border bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {lang === 'en' ? 'Real estate dashboard' : '부동산 대시보드'}
                </Link>
                <Link
                  href="/tools/compound-interest"
                  locale={lang}
                  className="inline-flex items-center rounded-full border bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {lang === 'en' ? 'Compound interest' : '복리 계산기'}
                </Link>
                <Link
                  href="/tools"
                  locale={lang}
                  className="inline-flex items-center rounded-full border bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {lang === 'en' ? 'All tools' : '금융도구'}
                </Link>

                <div className="w-full h-px bg-slate-100 my-2" />

                {/* Jump chips */}
                {CAT_ORDER.map((cat) => (
                  <a
                    key={cat}
                    href={`#cat-${cat}`}
                    className="inline-flex items-center rounded-full border bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {t.cats[cat] || cat}
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* CATEGORIES */}
          <div className="mt-8 grid gap-4">
            {CAT_ORDER.map((cat) => {
              const items = filteredGrouped[cat] || [];
              const count = items.length;
              const updated = items[0]?.datePublished || null;
              const top = items.slice(0, 3);
              const isOpen = !!open[cat];

              return (
                <section
                  key={cat}
                  id={`cat-${cat}`}
                  className="rounded-3xl border bg-white shadow-card overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpen((prev) => ({ ...prev, [cat]: !prev[cat] }))}
                    className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 hover:bg-slate-50"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                          {t.cats[cat] || cat}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="inline-flex items-center rounded-full border bg-white px-2 py-1">
                            {lang === 'en' ? `${count} posts` : `총 ${count}개`}
                          </span>
                          {updated && (
                            <span className="inline-flex items-center rounded-full border bg-white px-2 py-1">
                              {lang === 'en' ? `Updated: ${updated}` : `최근: ${updated}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-auto flex items-center gap-2">
                        <Link
                          href={`/category/${cat}`}
                          locale={lang}
                          className="hidden sm:inline-flex items-center rounded-full border bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lang === 'en' ? 'Open category' : '카테고리 열기'}
                        </Link>
                        <span className="inline-flex items-center text-sm text-slate-500">
                          {isOpen ? '▾' : '▸'}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                      <div className="flex flex-col gap-4">
                        {/* Top cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {top.map((p) => (
                            <article
                              key={`${p.lang}-${p.slug}`}
                              className="group rounded-2xl border bg-white overflow-hidden hover:shadow-lg transition-shadow"
                            >
                              {p.cover ? (
                                <div className="relative">
                                  <img
                                    src={p.cover}
                                    alt={p.title}
                                    className="w-full h-36 object-cover"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              ) : (
                                <div className="h-16 bg-slate-100" />
                              )}

                              <div className="p-4">
                                <div className="text-xs text-slate-500">{p.datePublished}</div>
                                <h3 className="mt-2 text-sm font-semibold leading-snug text-slate-900">
                                  <Link
                                    href={`/posts/${cat}/${p.slug}`}
                                    locale={p.lang}
                                    className="hover:underline underline-offset-4"
                                  >
                                    {p.title}
                                  </Link>
                                </h3>
                                {p.description && (
                                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                                    {p.description}
                                  </p>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>

                        {/* All titles list (scroll box) */}
                        <div className="rounded-2xl border bg-white overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                            <div className="text-sm font-semibold text-slate-900">
                              {lang === 'en' ? 'All titles' : '전체 목록'}
                            </div>
                            <Link
                              href={`/category/${cat}`}
                              locale={lang}
                              className="inline-flex items-center rounded-full border bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                              {lang === 'en' ? 'View hub' : '허브로 보기'}
                            </Link>
                          </div>
                          <div className="max-h-[360px] overflow-auto">
                            <ul className="divide-y">
                              {items.map((p) => (
                                <li key={`${p.lang}-${p.slug}`} className="px-4 py-3 hover:bg-slate-50">
                                  <div className="flex items-center gap-3">
                                    <div className="min-w-[84px] text-xs text-slate-500">
                                      {p.datePublished || ''}
                                    </div>
                                    <Link
                                      className="text-sm font-medium text-slate-900 hover:underline underline-offset-4 line-clamp-2"
                                      href={`/posts/${cat}/${p.slug}`}
                                      locale={p.lang}
                                    >
                                      {p.title}
                                    </Link>
                                  </div>
                                </li>
                              ))}
                              {items.length === 0 && (
                                <li className="px-4 py-4 text-sm text-slate-500">
                                  {lang === 'en' ? 'No posts found.' : '해당 조건의 글이 없습니다.'}
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps({ locale }) {
  const lang = locale === 'en' ? 'en' : 'ko';

  // ✅ 사이트맵 페이지도 해당 locale 언어만 + lite로 축소
  const posts = getAllPostsAllLangs()
    .map(toLitePost)
    .filter((p) => (p.lang || 'ko') === lang);

  return { props: { posts } };
}
