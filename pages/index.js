// pages/index.js
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import SeoHead from '../_components/SeoHead';
import { getAllPostsAllLangs } from '../lib/posts';
import { cloudinaryThumb } from '../lib/cloudinaryUrl';

/* ✅ 카테고리 이름 → slug 매핑 (frontmatter 기준) */
const CATEGORY_SLUG_KO = {
  '경제정보': 'economicInfo',
  '재테크': 'personalFinance',
  '투자정보': 'investingInfo',
};

const CATEGORY_SLUG_EN = {
  'economic info': 'economicInfo',
  'personal finance': 'personalFinance',
  'investing info': 'investingInfo',
};

/* ✅ 포스트에서 categorySlug 계산 */
function getCategorySlugFromPost(p) {
  const lang = p.lang || 'ko';
  const category = p.category || '';

  if (lang === 'ko') {
    return CATEGORY_SLUG_KO[category] || 'economicInfo';
  }

  const key = category.toLowerCase();
  return CATEGORY_SLUG_EN[key] || key || 'economicInfo';
}

const TEXT = {
  ko: {
    seoTitle: '홈',
    seoDesc: 'FinMap 블로그 · 금융 기초 · 재테크 · 투자 · 계산기',
    heroTitleLine1: '당신의 돈 흐름을',
    heroTitleLine2: '지도처럼 한 눈에',
    heroSub:
      '경제 기초 개념부터 투자 아이디어, 세금 이슈, 복리 계산기까지. 초중급 투자자가 헷갈려 하는 포인트만 골라 정리합니다.',
    btnTool: '복리 계산기 바로가기',
    btnEconomics: '경제 기초부터 차근차근',
    stat1Title: '경제 기초',
    stat1Value: '입문자용',
    stat2Title: '투자 개념',
    stat2Value: '실전 연결',
    stat3Title: '세금',
    stat3Value: '헷갈림 정리',
    stat4Title: '복리 계산',
    stat4Value: '숫자로 확인',
    latestHeading: '최신 글',
    moreHeading: '더 알아보기',
    moreSub: '경제정보 · 재테크 · 투자정보 카테고리별로 정리되어 있습니다.',
  },
  en: {
    seoTitle: 'Home',
    seoDesc:
      'FinMap blog · economics basic · investing info · personal finance · compound interest calculators',
    heroTitleLine1: 'See your money flows ',
    heroTitleLine2: 'like a map at a glance',
    heroSub:
      'From basic economic concepts to investment ideas, tax topics, and compound interest tools. We focus on the exact points beginner and intermediate investors find confusing.',
    btnTool: 'Open compound interest calculator',
    btnEconomics: 'Start from economic basics',
    stat1Title: 'Economic basics',
    stat1Value: 'For beginners',
    stat2Title: 'Investment concepts',
    stat2Value: 'Linked to practice',
    stat3Title: 'Taxes',
    stat3Value: 'Clearing confusion',
    stat4Title: 'Compound interest',
    stat4Value: 'See it in numbers',
    latestHeading: 'Latest posts',
    moreHeading: 'More to explore',
    moreSub:
      'Articles are organized by categories such as economic info, personal finance, and investing.',
  },
};

const PILLAR_SLUGS = {
  ko: [
    'inflation-basics',
    'tnx-us-10y-yield-basics',
    'usd-krw-exchange-rate-and-kospi',
    'policy-rate-cut-market-rates',
    'mortgage-risk-checklist-dsr-variable',
    'how-much-per-month-for-100m',
  ],
  en: [
    'inflation-basics',
    'tnx-us-10y-yield-basics',
    'usd-krw-exchange-rate-and-kospi',
    'policy-rate-cut-market-rates',
    'mortgage-risk-checklist-dsr-variable',
    'how-much-per-month-for-100m',
  ],
};

export default function Home({ posts }) {
  // 🔥 전역 언어 시스템과 동기화되는 상태
  const router = useRouter();
  const lang = router?.locale === 'en' ? 'en' : 'ko';

  const t = TEXT[lang] || TEXT.ko;

  const filtered = useMemo(() => {
    return (posts || []).filter((p) => {
      if (!p.lang) return lang === 'ko';
      return p.lang === lang;
    });
  }, [posts, lang]);  

  const pillars = useMemo(() => {
    const slugs = PILLAR_SLUGS[lang] || [];
    return slugs
      .map((s) => filtered.find((p) => p.slug === s))
      .filter(Boolean)
      .slice(0, 9);
  }, [lang, filtered]);

  const latest = filtered.slice(0, 3);
  const more = filtered.slice(3, 9);
  
  const seoUrl = '/';

  return (
    <>
      <SeoHead title={t.seoTitle} desc={t.seoDesc} url={seoUrl} locale={lang} />      

      {/*  히어로 섹션 */}
      <section className="mt-6 mb-8">
        <div className="card flex flex-col md:flex-row gap-4 md:gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white max-[480px]:p-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300 mb-2">
              PERSONAL FINANCE · INVESTING
            </p>
            <h1 className="font-semibold mb-3 leading-tight
                           text-2xl md:text-3xl lg:text-4xl
                           max-[400px]:text-xl max-[360px]:text-lg max-[320px]:text-[1.05rem]
                           text-balance">
              {t.heroTitleLine1}
              <br/>
              <span className="text-blue-300">{t.heroTitleLine2}</span>, FinMap
            </h1>
            <p className="text-sm md:text-base text-slate-200 mb-4 max-[480px]:line-clamp-3">              
              {t.heroSub}
            </p>
            {/* ✅ 모바일(<=480)에서는 2열 grid로 고정 → 버튼이 절대 아래로 안 떨어짐 */}
            <div className="flex flex-wrap gap-3
                            max-[480px]:grid max-[480px]:grid-cols-2 max-[480px]:gap-2">
              {/* 계산기 링크: 언어에 따라 텍스트만 바뀌고, 기능은 쿠키 기반 */}
              <Link
                href="/tools/compound-interest"
                prefetch={false}
                  className="btn-primary bg-blue-700 hover:bg-blue-800
                             max-[480px]:w-full max-[480px]:px-3 max-[480px]:py-2 max-[480px]:text-[13px]
                             max-[360px]:text-[12px]
                             max-[480px]:whitespace-normal max-[480px]:text-center max-[480px]:leading-snug
                             max-[480px]:break-keep max-[480px]:min-h-[44px]"
               >              
                {t.btnTool}
              </Link>

              {/* 경제기초 카테고리: 라우트는 공용(/category/economicInfo) 이고,
                  텍스트만 언어별 */}
              <Link
                href="/category/economicInfo"
                prefetch={false}
                className="btn-secondary border-slate-500 text-slate-100 hover:bg-slate-800
                           max-[480px]:w-full max-[480px]:px-3 max-[480px]:py-2 max-[480px]:text-[13px]
                           max-[360px]:text-[12px]
                           max-[480px]:whitespace-normal max-[480px]:text-center max-[480px]:leading-snug
                           max-[480px]:break-keep max-[480px]:min-h-[44px]"
               >
                {t.btnEconomics}
              </Link>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center max-[480px]:hidden">
            {/* 간단한 요약 카드 세트 */}
            <div className="home-hero-stats grid grid-cols-2 gap-3 w-full max-w-xs">
              <div className="stat bg-slate-900/60 border border-slate-700">
                <p className="stat-title text-slate-300">{t.stat1Title}</p>
                <p className="stat-value text-blue-300">{t.stat1Value}</p>
              </div>
              <div className="stat bg-slate-900/60 border border-slate-700">
                <p className="stat-title text-slate-300">{t.stat2Title}</p>
                <p className="stat-value text-emerald-300">{t.stat2Value}</p>
              </div>
              <div className="stat bg-slate-900/60 border border-slate-700">
                <p className="stat-title text-slate-300">{t.stat3Title}</p>
                <p className="stat-value text-amber-300">{t.stat3Value}</p>
              </div>
              <div className="stat bg-slate-900/60 border border-slate-700">
                <p className="stat-title text-slate-300">{t.stat4Title}</p>
                <p className="stat-value text-fuchsia-300">{t.stat4Value}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 mb-8">
        <h2 className="text-xl font-semibold mb-3">
          {lang === 'en' ? 'Start here' : '처음 읽기 좋은 글'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, idx) => {
            const categorySlug = getCategorySlugFromPost(p);
            const postLang = p.lang || 'ko';
            return (
              <article key={`pillar-${postLang}-${p.slug}`} className="card">
                {p.cover && (
                  <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
                    <Image
                      src={cloudinaryThumb(
                        p.cover,
                        idx === 0 ? { w: 480, h: 270 } : { w: 400, h: 225 }
                      )}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={idx === 0}
                      fetchPriority={idx === 0 ? "high" : "auto"}
                    />
                  </div>
                )}
                <span className="badge">{p.category}</span>
                <h3 className="text-base font-semibold">
                  <Link
                    href={`/posts/${categorySlug}/${p.slug}`}
                    locale={postLang}
                    prefetch={false}
                  >
                    {p.title}
                  </Link>
                </h3>
                {p.description ? <p className="text-sm text-slate-600 mt-1 line-clamp-2">{p.description}</p> : null}
              </article>
            );
          })}
        </div>
      </section>

      {/*  최신 글 섹션 */}
      <section className="mt-4">
        <h2 className="text-xl font-semibold mb-3">{t.latestHeading}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((p, idx) => {
            const categorySlug = getCategorySlugFromPost(p);
            const postLang = p.lang || 'ko';

            return (
              <article
                key={`${postLang}-${p.slug}`}
                className="card hover:shadow-md transition-shadow"
              >
                {p.cover && (
                  <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
                    <Image
                      src={cloudinaryThumb(
                        p.cover,
                        idx === 0 ? { w: 480, h: 270 } : { w: 400, h: 225 }
                      )}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={idx === 0}
                      fetchPriority={idx === 0 ? "high" : "auto"}
                    />
                  </div>
                )}
                <span className="badge">{p.category}</span>
                <h3 className="mt-2 text-lg font-semibold">                  
                  <Link
                    href={`/posts/${categorySlug}/${p.slug}`}
                    locale={postLang}
                    prefetch={false}
                  >
                    {p.title}
                  </Link>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {p.datePublished}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/*  더 많은 글 섹션 */}
      {more.length > 0 && (
        <section className="mt-10 mb-12">
          <div className="flex items-end justify-between mb-3
                          max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-1">
            <h2 className="text-lg font-semibold whitespace-nowrap">
              {t.moreHeading}
            </h2>
            <span className="text-xs text-slate-500 break-keep">
              {t.moreSub}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => {
              const categorySlug = getCategorySlugFromPost(p);
              const postLang = p.lang || 'ko';

              return (
                <article
                  key={`${postLang}-${p.slug}`}
                  className="card hover:shadow-md transition-shadow"
                >
                  {p.cover && (
                    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
                      <Image
                        src={cloudinaryThumb(p.cover, { w: 640, h: 360 })}
                        alt={p.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <span className="badge">{p.category}</span>
                  <h3 className="mt-2 text-base font-semibold">                    
                    <Link
                      href={`/posts/${categorySlug}/${p.slug}`}
                      locale={postLang}
                      prefetch={false}
                    >
                      {p.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {p.datePublished}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
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

function dateValue(s) {
  if (!s) return 0;
  const t = Date.parse(String(s));
  return Number.isFinite(t) ? t : 0;
}

export async function getStaticProps({ locale }) {
  const lang = locale === 'en' ? 'en' : 'ko';

  // ✅ 목록 페이지에는 본문/HTML 등 무거운 필드가 필요 없음 → lite로 축소
  // ✅ locale별로 필요한 언어만 내려서 page-data 크기 절반으로 감소
  const posts = getAllPostsAllLangs()
    .map(toLitePost)
    .filter((p) => (p.lang || 'ko') === lang)
    .sort((a, b) => dateValue(b.datePublished) - dateValue(a.datePublished));

  return { props: { posts } };
}
