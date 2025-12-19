// pages/tools/index.js
import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SeoHead from '../../_components/SeoHead';

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function ToolsHome() {
  const router = useRouter();

  // ✅ URL(라우터) 기준으로 언어 결정 (/en/... = en)
  const lang = router.locale === 'en' ? 'en' : 'ko';
  const isKo = lang === 'ko';

  const TOOLS = useMemo(
    () => [
      {
        href: '/tools/compound-interest',
        title: isKo ? '복리 계산기' : 'Compound Interest',
        badge: isKo ? '투자 · 저축' : 'Invest · Saving',
        desc: isKo
          ? '초기 투자금, 월 적립금, 수익률, 기간으로 세후 총자산을 계산합니다.'
          : 'Calculate net future value with principal, monthly saving, rate and term.',
        image:
          'https://res.cloudinary.com/dwonflmnn/image/upload/v1766108372/blog/tools/compound_calculator.png',
      },
      {
        href: '/tools/goal-simulator',
        title: isKo ? '목표 자산 도달 시뮬레이터' : 'Goal Asset Simulator',
        badge: isKo ? '목표 자산' : 'Goal Planning',
        desc: isKo
          ? '목표 금액까지 몇 년이 걸릴지, 매월 얼마나 모아야 할지 자산 성장 경로를 시뮬레이션합니다.'
          : 'Simulate how long and how much per month you need to reach a target amount.',
        // ✅ (선택) 썸네일 추가 — 네가 만든 og 이미지를 쓰면 일관성 좋아짐
        image: 
           'https://res.cloudinary.com/dwonflmnn/image/upload/v1766124237/blog/tools/GOAL_MAIN.png',
      },
      {
        href: '/tools/cagr-calculator',
        title: isKo ? '투자 수익률(CAGR) 계산기' : 'CAGR (Investment Return) Calculator',
        badge: isKo ? '성과 분석' : 'Investment Return Analysis',
        desc: isKo
          ? '초기·최종 자산과 기간으로 연평균 복리 수익률(CAGR)을 계산하고 세금·수수료 효과를 확인합니다.'
          : 'Calculate compound annual growth rate (CAGR) from initial and final value and see the impact of tax and fees.',
        image: 
          'https://res.cloudinary.com/dwonflmnn/image/upload/v1766124234/blog/tools/CAGR_MAIN.png',
      },
      {
        href: '/tools/dca-calculator',
        title: isKo
          ? 'ETF·주식 자동 적립식 시뮬레이터 (DCA)'
          : 'ETF/Stock DCA Simulator',
        badge: isKo ? '적립식 투자' : 'Dollar-Cost Averaging',
        desc: isKo
          ? '매월 일정 금액을 ETF·주식에 투자했을 때 세전·세후 자산 성장을 계산합니다.'
          : 'Calculate pre/post-tax asset growth when investing a fixed amount monthly in ETFs or stocks.',
        image: 
          'https://res.cloudinary.com/dwonflmnn/image/upload/v1766124235/blog/tools/DCA_MAIN.png',
      },
      {
        href: '/tools/fire-calculator',
        title: isKo ? '은퇴자금(FIRE) 시뮬레이터' : 'FIRE (Retirement Fund) Calculator',
        badge: isKo ? '은퇴·FIRE' : 'FIRE & Retirement',
        desc: isKo
          ? '현재 자산, 연 지출, 예상 수익률, 적립 기간, 출금률(4% rule)로 언제 FIRE 가능한지와 은퇴 후 자산 유지 기간, 파산 리스크를 시뮬레이션합니다.'
          : 'Simulate when you can reach FIRE and how long your assets can last in retirement based on your assets, spending, expected return, accumulation period, and withdrawal rate (4% rule).',
        image:
          'https://res.cloudinary.com/dwonflmnn/image/upload/v1765032746/blog/economicInfo/fireCover.jpg',
      },
    ],
    [isKo]
  );

  const itemListJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.title,
      url: `https://www.finmaphub.com${lang === "en" ? "/en" : ""}${t.href}`,
    })),
  }), [TOOLS, lang]);

  return (
    <>
      <SeoHead
        title={isKo ? '금융 계산기 모음' : 'Finance Tools'}
        desc={
          isKo
            ? '복리 계산기, 목표 자산 시뮬레이터 등 FinMap 금융 계산기 도구 모음.'
            : 'FinMap finance tools such as compound interest and goal simulators.'
        }
        url="/tools"
        locale={lang} // ✅ 핵심: /en/tools의 canonical/hreflang 정합성
      />

      <JsonLd data={itemListJsonLd} />

      <section className="mt-6 mb-10">
        <h1 className="text-2xl font-bold mb-2">
          {isKo ? '금융 계산기 · 도구' : 'Finance tools'}
        </h1>
        <section className="card mb-6">
          <h2 className="text-base font-semibold mb-2">
            {isKo ? "복리·적립식(DCA)·CAGR·은퇴자금까지 한 번에" : "Compound, DCA, CAGR, and retirement tools"}
          </h2>
          <p className="text-sm text-slate-600">
            {isKo
              ? "FinMap 금융 계산기 모음입니다. 복리 이자(월복리/연복리)로 미래가치(FV)를 계산하고, 적립식 투자(DCA), CAGR(연평균 수익률), 목표 자산 도달, 은퇴자금(FIRE)까지 연결해서 시뮬레이션할 수 있어요."
              : "A collection of finance calculators. Calculate FV with compound interest, simulate DCA, CAGR, goal targets, and FIRE retirement planning."}
          </p>
        </section>
        <p className="text-sm text-slate-600 mb-6">
          {isKo
            ? '예금·투자·목표 자산 계획을 숫자로 확인해 보세요. 계산기는 계속 추가될 예정입니다.'
            : 'Check your savings, investing and goal plans with numbers. More tools are coming.'}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              locale={lang} // ✅ (명시) 현재 locale 유지
              className="card hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {tool.image && (
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="card-thumb mb-3"
                />
              )}

              <div>
                <span className="badge mb-2 inline-block">{tool.badge}</span>
                <h2 className="text-lg font-semibold mb-1">{tool.title}</h2>
                <p className="text-sm text-slate-600">{tool.desc}</p>
              </div>

              <span className="mt-4 text-xs text-blue-600 font-medium">                
                {isKo ? `${tool.title} 열기 →` : `Open ${tool.title} →`}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
