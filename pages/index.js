// pages/index.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import SeoHead from '../_components/SeoHead';
import { getAllPostsAllLangs  } from '../lib/posts';

const TEXT = {
  ko: {
    seoTitle: '홈',
    seoDesc: 'FinMap 블로그 · 금융 기초 · 재테크 · 세금 · 계산기',
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
    moreSub: '경제기초 · 재테크 · 세금 카테고리별로 정리되어 있습니다.',
  },
  en: {
    seoTitle: 'Home',
    seoDesc:
      'FinMap blog · personal finance · investing · taxes · compound interest calculators',
    heroTitleLine1: 'See your money flows',
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
      'Articles are organized by categories such as economic basics, personal finance, and taxes.',
  },
};

export default function Home({ posts }) {
  const router = useRouter();
  // /?lang=en 또는 /?lang=ko 기준, 기본값은 ko
  const lang =
    router.query.lang === 'en' || router.query.lang === 'ko'
      ? router.query.lang
      : 'ko';

  const t = TEXT[lang];

  // 언어별 포스트 필터링 (lang 필드가 없으면 ko로 간주)
  const filtered = posts.filter((p) => {
    if (!p.lang) return lang === 'ko';
    return p.lang === lang;
  });

  const latest = filtered.slice(0, 3);
  const more = filtered.slice(3, 9);

  const seoUrl = lang === 'en' ? '/?lang=en' : '/';

  return (
    <>
      <SeoHead title={t.seoTitle} desc={t.seoDesc} url={seoUrl} />

      {/*  히어로 섹션 */}
      <section className="mt-6 mb-8">
        <div className="card flex flex-col md:flex-row gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300 mb-2">
              PERSONAL FINANCE · INVESTING
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight mb-3">
              {t.heroTitleLine1}
              <br className="hidden sm:block" />
              <span className="text-blue-300">{t.heroTitleLine2}</span>, FinMap
            </h1>
            <p className="text-sm md:text-base text-slate-200 mb-4">
              {t.heroSub}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/tools/compound-interest${
                  lang === 'en' ? '?lang=en' : ''
                }`}
                className="btn-primary bg-blue-500 hover:bg-blue-600"
              >
                {t.btnTool}
              </Link>
              <Link
                href={`/category/${lang}/economics`}
                className="btn-secondary border-slate-500 text-slate-100 hover:bg-slate-800"
              >
                {t.btnEconomics}
              </Link>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            {/* 간단한 요약 카드 세트 */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
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

      {/*  최신 글 섹션 */}
      <section className="mt-4">
        <h2 className="text-xl font-semibold mb-3">{t.latestHeading}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((p) => (
            <article
              key={`${p.lang || 'ko'}-${p.slug}`}
              className="card hover:shadow-md transition-shadow"
            >
              {p.cover && (
                <img src={p.cover} alt={p.title} className="card-thumb" />
              )}
              <span className="badge">{p.category}</span>
              <h3 className="mt-2 text-lg font-semibold">
                <Link href={`/posts/${p.lang || 'ko'}/${p.slug}`}>
                  {p.title}
                </Link>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {p.datePublished}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/*  더 많은 글 섹션 */}
      {more.length > 0 && (
        <section className="mt-10 mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{t.moreHeading}</h2>
            <span className="text-xs text-slate-500">{t.moreSub}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <article
                key={`${p.lang || 'ko'}-${p.slug}`}
                className="card hover:shadow-md transition-shadow"
              >
                {p.cover && (
                  <img src={p.cover} alt={p.title} className="card-thumb" />
                )}
                <span className="badge">{p.category}</span>
                <h3 className="mt-2 text-base font-semibold">
                  <Link href={`/posts/${p.lang || 'ko'}/${p.slug}`}>
                    {p.title}
                  </Link>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {p.datePublished}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export async function getStaticProps() {  
  const posts = getAllPostsAllLangs();   // ✅ ko + en 전부
  return { props: { posts } };
}
