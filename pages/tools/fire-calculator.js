// pages/tools/fire-calculator.js
import { useState, useMemo } from 'react';
import SeoHead from '../../_components/SeoHead';
import { JsonLd } from './goal-simulator'; // 이미 쓰고 있던 JsonLd 컴포넌트 경로에 맞게
import FireForm from '../../_components/FireForm';
import FireChart from '../../_components/FireChart';
import FireYearTable from '../../_components/FireYearTable';
import ToolCta from '../../_components/ToolCta';
import { runFireSimulation } from '../../lib/fire';
import { getInitialLang } from '../../lib/lang';

export default function FireCalculatorPage() {
  const lang = getInitialLang();
  const isKo = lang === 'ko';

  const [form, setForm] = useState({
    currentAsset: 100_000_000,
    annualSpending: 30_000_000,
    annualReturnPct: 5,
    accumulationYears: 15,
    withdrawRatePct: 4,
    monthlyContribution: 0,
    annualContribution: 0,
    taxRatePct: 15.4,
    feeRatePct: 0.5,
    inflationPct: 2.0,
  });

  const result = useMemo(() => runFireSimulation(form), [form]);

  const locale = isKo ? 'ko-KR' : 'en-US';
  const currency = 'KRW';

  const title = isKo
    ? '은퇴자금 시뮬레이터 (FIRE Calculator)'
    : 'FIRE Calculator – Financial Independence & Retirement';

  const desc = isKo
    ? '현재 자산, 연 지출, 예상 수익률, 적립 기간, 출금률(4% rule)을 기반으로 언제 FIRE 가능한지와 은퇴 후 자산 유지 기간, 파산 리스크를 시뮬레이션합니다.'
    : 'Simulate when you can FIRE based on your current assets, annual spending, expected return, accumulation period, and withdrawal rate (4% rule), including post-retirement asset longevity and risk of ruin.';

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: title,
    description: desc,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
  };

  const { fireTarget, accumulation, retirement, timeline, risk, canFireAtEnd } =
    result;

  const fireYearText = (() => {
    if (!fireTarget || fireTarget <= 0)
      return isKo ? 'FIRE 목표를 계산할 수 없습니다.' : 'Cannot compute FIRE target.';

    if (!accumulation.fireYear) {
      return isKo
        ? '설정한 적립 기간 내에는 FIRE 목표자산에 도달하지 못합니다.'
        : 'Within the given accumulation period, you do not reach the FIRE target.';
    }
    return isKo
      ? `${accumulation.fireYear}년 후에 FIRE 목표자산에 도달합니다.`
      : `You reach your FIRE target in ${accumulation.fireYear} years.`;
  })();

  const fireSummaryText = (() => {
    if (!fireTarget || fireTarget <= 0) return null;

    const fireOkText = canFireAtEnd
      ? isKo
        ? '설정한 적립 기간이 끝날 때, 현재 자산만으로도 FIRE 기준을 충족합니다.'
        : 'At the end of your accumulation period, your assets meet the FIRE target.'
      : isKo
      ? '설정한 적립 기간이 끝나도 FIRE 기준에는 약간 못 미칩니다.'
      : 'At the end of your accumulation period, you are slightly below the FIRE target.';

    return fireOkText;
  })();

  return (
    <>
      <SeoHead
        title={title}
        desc={desc}
        url="https://www.finmaphub.com/tools/fire-calculator"
      />
      <JsonLd data={jsonld} />

      <main className="tool-page">
        {/* 🔵 상단 Hero 영역 (CAGR 페이지 스타일 참고) */}
        <section className="mb-6 md:mb-8">
          <div className="rounded-2xl bg-slate-900 text-slate-50 px-5 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-xs md:text-sm text-slate-300 mb-1">
                {isKo ? '은퇴자금 · FIRE 시뮬레이터' : 'Retirement fund · FIRE simulator'}
              </p>
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                {isKo
                  ? 'FIRE(연간 지출·출금률)로\n언제 경제적 자유가 가능한지 확인해 보세요'
                  : 'See when you can reach FIRE and retire safely'}
              </h1>
              <p className="text-sm md:text-base text-slate-300">
                {isKo
                  ? '현재 자산과 연 지출, 예상 수익률, 적립 기간, 출금률(4% rule)을 넣으면 FIRE 목표 자산과 도달 시점, 은퇴 후 자산 유지 기간을 한 번에 볼 수 있습니다.'
                  : 'Input your current assets, annual spending, expected return, years to invest, and withdrawal rate to see your FIRE target, time to FIRE, and how long your assets can last.'}
              </p>
            </div>

            {/* 오른쪽 요약 카드 (CAGR 상단 탭 느낌) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-80 text-xs md:text-sm">
              <div className="rounded-xl bg-slate-800 px-3 py-3">
                <p className="text-slate-300 mb-1">
                  {isKo ? '현재 자산 → FIRE 목표' : 'Current assets → FIRE target'}
                </p>
                <p className="font-semibold">
                  {isKo
                    ? '연 지출·출금률 기준 목표 자산 한눈에'
                    : 'Target assets based on spending & withdrawal rate'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-800 px-3 py-3">
                <p className="text-slate-300 mb-1">
                  {isKo ? '적립 기간 동안' : 'During accumulation'}
                </p>
                <p className="font-semibold">
                  {isKo
                    ? '언제 FIRE 기준을 충족하는지 연도별 확인'
                    : 'See in which year you hit FIRE'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-800 px-3 py-3">
                <p className="text-slate-300 mb-1">
                  {isKo ? '은퇴 후 시뮬레이션' : 'Post-FIRE simulation'}
                </p>
                <p className="font-semibold">
                  {isKo
                    ? '연 지출 인출 후 자산 유지 기간 그래프'
                    : 'Graph of assets after yearly withdrawals'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-800 px-3 py-3">
                <p className="text-slate-300 mb-1">
                  {isKo ? '파산 리스크' : 'Risk of ruin'}
                </p>
                <p className="font-semibold">
                  {isKo
                    ? '30년·50년 기준으로 위험도 라벨 표시'
                    : 'Risk label based on 30–50 year depletion'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 결과/폼 영역 */}
        <section className="tool-summary">
          <h2>{isKo ? '결과 요약' : 'Summary'}</h2>
          <ul>
            <li>
              <strong>{isKo ? 'FIRE 목표 자산:' : 'FIRE target assets:'}</strong>{' '}
              {fireTarget
                ? `${fireTarget.toLocaleString(locale)} 원`
                : isKo
                ? '계산 불가'
                : 'N/A'}
            </li>
            <li>
              <strong>{isKo ? 'FIRE 도달 시점:' : 'Time to FIRE:'}</strong>{' '}
              {fireYearText}
            </li>
            <li>
              <strong>{isKo ? '파산 리스크:' : 'Risk of ruin:'}</strong>{' '}
              {isKo ? risk.labelKo : risk.labelEn}
            </li>
            <li>
                <strong>{isKo ? '실질 세후 수익률:' : 'After-tax real return:'}</strong>{' '}
                {(result.netRealReturn * 100).toFixed(2)}%
            </li>
          </ul>
          {fireSummaryText && <p>{fireSummaryText}</p>}
          <p className="text-sm text-slate-600 mt-1">
            {isKo
              ? '보다 구체적인 목표 자산 설정과 월별 저축 계획은 아래 목표 자산 도달 시뮬레이터와 함께 사용하면 시너지가 큽니다.'
              : 'For more detailed target setting and monthly saving plans, use this together with the goal amount simulator below.'}
          </p>
        </section>

        <FireForm onChange={setForm} initial={form} lang={lang} />

        <FireChart data={timeline} locale={locale} currency={currency} />

        <FireYearTable
            timeline={timeline}
            locale={locale}
            currency={currency}
            meta={{
                monthlyContribution: form.monthlyContribution,
                annualContribution: form.annualContribution,
                taxRatePct: form.taxRatePct,
                feeRatePct: form.feeRatePct,
                inflationPct: form.inflationPct,
                netRealReturn: result.netRealReturn,
            }}
        />

        {/* 목표 자산 시뮬레이터 CTA */}
        <section className="tool-cta-section">
          <ToolCta lang={isKo ? 'ko' : 'en'} type="goal" />
        </section>
      </main>
    </>
  );
}
