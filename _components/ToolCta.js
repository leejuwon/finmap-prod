// _components/ToolCta.js
import Link from 'next/link';

export default function ToolCta({ lang = 'ko', type = 'compound' }) {
  const isKo = lang === 'ko';

  const CONFIGS = {
    compound: {
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

    fire: {
      titleKo: 'FIRE로 언제 경제적 자유가 가능한지 점검해보세요',
      titleEn: 'See when you can reach FIRE',
      descKo:
        '현재 자산, 연 지출, 예상 수익률, 적립 기간, 출금률(4% rule)로 FIRE 목표자산과 은퇴 후 자산 유지 기간, 파산 리스크를 시뮬레이션합니다.',
      descEn:
        'Simulate your FIRE target, retirement asset longevity, and risk of ruin based on your assets, annual spending, expected return, accumulation period, and withdrawal rate (4% rule).',
      href: '/tools/fire-calculator',
      btnKo: 'FIRE 계산기 열기',
      btnEn: 'Open FIRE calculator',
      badgeKo: 'FinMap 도구 · 은퇴·FIRE',
      badgeEn: 'FinMap tools · FIRE & Retirement',
    },
  };

  const config = CONFIGS[type] || CONFIGS.compound;

  // ✅ query 제거: 중복 URL 방지
  const href = config.href;

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
        <Link
          href={href}
          locale={lang} // ✅ locale 기반으로 /en 라우팅
          className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {isKo ? config.btnKo : config.btnEn}
        </Link>
      </div>
    </section>
  );
}
