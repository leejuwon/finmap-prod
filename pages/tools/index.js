// pages/tools/index.js
import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SeoHead from '../../_components/SeoHead';
import { getToolFromPath, trackGaEvent } from '../../utils/analytics';

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
        href: '/tools/dsr-ltv-calculator',
        title: isKo ? 'DSR LTV 계산기' : 'DSR LTV Calculator',
        badge: isKo ? '주택대출' : 'Mortgage',
        desc: isKo
          ? 'LTV·DSR 기준 주담대 한도와 월상환액을 계산합니다.'
          : 'Estimate mortgage loan capacity and monthly payments from LTV, DSR, income, rate, and term.',
        image:
          'https://res.cloudinary.com/dwonflmnn/image/upload/v1780305922/blog/insight/og5utvm2syhksvkr38fg.png',
      },
      {
        href: '/tools/home-buying-budget-calculator',
        title: isKo ? '아파트 구매 계산기' : 'Home Buying Budget Calculator',
        badge: isKo ? '부동산·주담대' : 'Real Estate',
        desc: isKo
          ? '집값, 보유 현금, 연소득, 금리, 대출기간을 입력해 아파트 구매 가능액과 월상환액, 필요 현금을 계산합니다.'
          : 'Estimate apartment affordability, monthly payments, and required cash from home price, cash, income, rate, and loan term.',
        image:
          'https://res.cloudinary.com/dwonflmnn/image/upload/v1780305922/blog/insight/og5utvm2syhksvkr38fg.png',
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

  const GUIDES = useMemo(
    () => [
      {
        href: '/posts/personalFinance/simple-vs-compound',
        title: isKo
          ? '단리 vs 복리 계산: 월 투자 예시로 보는 장기 차이'
          : 'Simple vs Compound Interest: Monthly Investing Example',
      },
      {
        href: '/posts/personalFinance/how-much-per-month-for-100m',
        title: isKo
          ? '목표 금액까지 월 얼마가 필요할까?'
          : 'Monthly Investment Calculator: How Much to Reach a Goal?',
      },
      {
        href: '/posts/personalFinance/what-is-cagr',
        title: isKo
          ? 'CAGR 계산이 왜 중요한가'
          : 'CAGR Calculator Guide: Compare Long-Term Returns',
      },
      {
        href: '/posts/personalFinance/dca-vs-lumpsum-decision-rules',
        title: isKo
          ? '적립식 투자와 일시 투자 판단 기준'
          : 'DCA vs Lump Sum: Decision Rules',
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

      <section className="mt-6 mb-10 min-w-0">
        <h1 className="mb-2 max-w-full break-words text-2xl font-bold leading-tight">
          {isKo ? '금융 계산기 · 도구' : 'Finance tools'}
        </h1>
        <section className="card mb-6 min-w-0 max-w-full">
          <h2 className="mb-2 break-words text-base font-semibold leading-snug">
            {isKo ? "복리·적립식(DCA)·CAGR·은퇴자금까지 한 번에" : "Compound, DCA, CAGR, and retirement tools"}
          </h2>
          <p className="break-words text-sm text-slate-600">
            {isKo
              ? "FinMap 금융 계산기 모음입니다. 복리 이자(월복리/연복리)로 미래가치(FV)를 계산하고, 적립식 투자(DCA), CAGR(연평균 수익률), 목표 자산 도달, 은퇴자금(FIRE)까지 연결해서 시뮬레이션할 수 있어요."
              : "A collection of finance calculators. Calculate FV with compound interest, simulate DCA, CAGR, goal targets, and FIRE retirement planning."}
          </p>
        </section>
        <p className="mb-6 break-words text-sm text-slate-600">
          {isKo
            ? '예금·투자·목표 자산 계획을 숫자로 확인해 보세요. 계산기는 계속 추가될 예정입니다.'
            : 'Check your savings, investing and goal plans with numbers. More tools are coming.'}
        </p>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              locale={lang} // ✅ (명시) 현재 locale 유지
              onClick={() =>
                trackGaEvent('tool_hub_click', {
                  source_tool: 'tools_index',
                  target_tool: getToolFromPath(tool.href),
                  locale: lang,
                  location: 'tools_index_card',
                })
              }
              className="card flex min-w-0 max-w-full flex-col justify-between overflow-hidden transition-shadow hover:shadow-md"
            >
              {tool.image && (
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="card-thumb mb-3 aspect-[16/9] max-h-48 max-w-full object-cover"
                />
              )}

              <div className="min-w-0">
                <span className="badge mb-2 inline-block max-w-full break-words">{tool.badge}</span>
                <h2 className="mb-1 break-words text-lg font-semibold leading-snug">{tool.title}</h2>
                <p className="break-words text-sm text-slate-600">{tool.desc}</p>
              </div>

              <span className="mt-4 inline-flex min-h-[44px] max-w-full items-center break-words text-xs font-medium leading-tight text-blue-600">
                {isKo ? `${tool.title} 열기 →` : `Open ${tool.title} →`}
              </span>
            </Link>
          ))}
        </div>

        <section className="mt-8 max-w-full rounded-2xl border bg-white p-4 shadow-card sm:p-5">
          <h2 className="break-words text-lg font-semibold leading-snug text-slate-900">
            {isKo ? '계산 전에 읽으면 좋은 가이드' : 'Guides to read before using the tools'}
          </h2>
          <p className="mt-1 break-words text-sm text-slate-600">
            {isKo
              ? '계산기 입력값을 정하기 어렵다면, 아래 글에서 기간·수익률·월 납입액 기준을 먼저 잡아보세요.'
              : 'If you are unsure what assumptions to enter, start with these guides on time horizon, return, and monthly contributions.'}
          </p>
          <ul className="mt-4 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
            {GUIDES.map((guide) => (
              <li key={guide.href} className="min-w-0 rounded-xl bg-slate-50 p-3">
                <Link
                  href={guide.href}
                  locale={lang}
                  prefetch={false}
                  className="block break-words text-sm font-semibold leading-snug text-slate-900 hover:underline"
                >
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </>
  );
}
