// _components/ToolCta.js
import Link from 'next/link';

export default function ToolCta({ lang = 'ko', type = 'compound' }) {
  const isKo = lang === 'ko';

  // 🔧 type별 설정 모음
  const CONFIGS = {
    compound: {
      // ✅ 복리 계산기 (기본)
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
    },

    goal: {
      // ✅ 목표 자산 도달 시뮬레이터
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
    },

    cagr: {
      // ✅ CAGR 계산기
      titleKo: 'CAGR로 내 투자 성과를 한 줄 숫자로 확인하세요',
      titleEn: 'Summarize your investment performance with CAGR',
      descKo:
        '초기 자산, 최종 자산, 투자 기간으로 연평균 복리 수익률(CAGR)을 계산하고 세금·수수료 효과를 함께 볼 수 있습니다.',
      descEn:
        'Calculate compound annual growth rate (CAGR) from initial and final values and see the impact of tax and fees.',
      href: '/tools/cagr-calculator',
      btnKo: 'CAGR 계산기 열기',
      btnEn: 'Open CAGR calculator',
      badgeKo: 'FinMap 도구 · 투자 수익률',
      badgeEn: 'FinMap tools · Investment return',
    },

    dca: {
      // ✅ DCA 시뮬레이터
      titleKo: 'ETF·주식 자동 적립식 투자, 시뮬레이션으로 미리 보세요',
      titleEn: 'Simulate your ETF/stock DCA plan in advance',
      descKo:
        '초기 자산, 월 적립금, 연 수익률, 세율·수수료·적립금 증가율을 넣고 장기 자산 성장을 살펴볼 수 있습니다.',
      descEn:
        'Plan your long-term DCA (dollar-cost averaging) with initial value, monthly contribution, return, tax, fees and contribution increase.',
      href: '/tools/dca-calculator',
      btnKo: 'DCA 시뮬레이터 열기',
      btnEn: 'Open DCA simulator',
      badgeKo: 'FinMap 도구 · 적립식 투자',
      badgeEn: 'FinMap tools · DCA investing',
    },
  };

  // 지원하지 않는 type이 들어오면 compound로 폴백
  const config = CONFIGS[type] || CONFIGS.compound;

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
