// _components/ToolCta.js
import Link from 'next/link';

export default function ToolCta({ lang = 'ko', type = 'compound' }) {
  const isKo = lang === 'ko';

  const config =
    type === 'goal'
      ? {
          // ✅ 목표 자산 도달 시뮬레이터용
          titleKo: '목표 자산까지 매달 얼마가 필요한지 계산해보세요',
          titleEn: 'Find how much you need to invest per month to reach your goal',
          descKo:
            '목표 금액, 기간, 예상 수익률을 입력하면 필요한 월 투자금을 역산해줍니다.',
          descEn:
            'Enter your target amount, time horizon, and expected return to get the required monthly investment.',
          href: '/tools/goal-simulator',
          btnKo: '목표 자산 시뮬레이터 열기',
          btnEn: 'Open goal simulator',
          badgeKo: 'FinMap 도구 · 목표 자산',
          badgeEn: 'FinMap tools · Goal amount',
        }
      : {
          // ✅ 복리 계산기용 (기본값)
          titleKo: '복리 효과, 직접 숫자로 확인해보세요',
          titleEn: 'See the power of compound interest in numbers',
          descKo:
            '원금, 기간, 수익률, 세금을 바꿔보면서 장기 투자 결과를 시뮬레이션할 수 있습니다.',
          descEn:
            'Change principal, period, return and tax to simulate your long-term investment outcome.',
          href: '/tools/compound-interest',
          btnKo: '복리 계산기 열기',
          btnEn: 'Open compound calculator',
          badgeKo: 'FinMap 도구 · 복리',
          badgeEn: 'FinMap tools · Compound',
        };

  const href = { pathname: config.href, query: { lang } };

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 flex flex-col sm:flex-row gap-4 sm:items-center shadow-sm">
      <div className="flex-1">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase mb-1">
          {isKo ? config.badgeKo : config.badgeEn}
        </p>
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
          {isKo ? config.titleKo : config.titleEn}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          {isKo ? config.descKo : config.descEn}
        </p>
      </div>

      <div className="flex-shrink-0">
        <Link href={href}>
          <a className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors">
            {isKo ? config.btnKo : config.btnEn}
          </a>
        </Link>
      </div>
    </section>
  );
}
