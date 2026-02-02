// pages/sitemap-pages.js
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

export default function SitemapPages({ posts }) {
  const router = useRouter();
  const lang = router?.locale === 'en' ? 'en' : 'ko';
  const t = LABELS[lang];

  const list = (posts || []).filter((p) => (p.lang || 'ko') === lang);

  // 카테고리별 그룹
  const grouped = { economicInfo: [], personalFinance: [], investingInfo: [] };
  for (const p of list) {
    const c = categorySlugFromPost(p);
    if (!grouped[c]) grouped[c] = [];
    grouped[c].push(p);
  }

  // 날짜 최신순
  for (const k of Object.keys(grouped)) {
    grouped[k].sort((a, b) => new Date(b.datePublished || 0) - new Date(a.datePublished || 0));
  }

  return (
    <>
      <SeoHead title={t.title} desc={t.desc} url="/sitemap-pages" locale={lang} />

      <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
      <p className="text-sm text-slate-600 mb-6">{t.desc}</p>

      {/* 상단 허브 링크 */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link className="underline" href="/">{lang === 'en' ? 'Home' : '홈'}</Link>
          <Link className="underline" href="/market/real-estate">{lang === 'en' ? 'Real estate dashboard' : '부동산 대시보드'}</Link>
          <Link className="underline" href="/tools/compound-interest">{lang === 'en' ? 'Compound interest' : '복리 계산기'}</Link>
        </div>
      </div>

      {(['economicInfo', 'personalFinance', 'investingInfo']).map((cat) => (
        <section key={cat} className="mb-10">
          <h2 className="text-xl font-semibold mb-2">{t.cats[cat] || cat}</h2>
          <div className="text-sm mb-3">
            <Link className="underline" href={`/category/${cat}`}>
              {lang === 'en' ? 'Open category' : '카테고리 열기'}
            </Link>
          </div>

          <ul className="grid gap-2">
            {grouped[cat]?.map((p) => (
              <li key={`${p.lang}-${p.slug}`} className="text-sm">
                <Link
                  className="underline"
                  href={`/posts/${cat}/${p.slug}`}
                  locale={p.lang}
                >
                  {p.title}
                </Link>
                {p.datePublished ? <span className="text-slate-400"> · {p.datePublished}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

export async function getStaticProps() {
  const posts = getAllPostsAllLangs();
  return { props: { posts } };
}
