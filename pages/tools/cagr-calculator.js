// pages/tools/cagr-calculator.js
import { useState, useMemo, useEffect } from 'react';
import SeoHead from '../../_components/SeoHead';
import CagrForm from '../../_components/CagrForm';
import CagrChart from '../../_components/CagrChart';
import CagrYearTable from '../../_components/CagrYearTable';
import { numberFmt } from '../../lib/compound';
import { calcCagr } from '../../lib/cagr';
import { getInitialLang } from '../../lib/lang';

// FAQ JSON-LD 용 컴포넌트
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function CagrCalculatorPage() {
  const [lang, setLang] = useState('ko');
  const locale = lang === 'ko' ? 'ko' : 'en';
  const numberLocale = locale === 'ko' ? 'ko-KR' : 'en-US';

  const [currency, setCurrency] = useState(
    locale === 'ko' ? 'KRW' : 'USD'
  );

  const [result, setResult] = useState(null);
  const [initial, setInitial] = useState(0);
  const [finalValue, setFinalValue] = useState(0);
  const [years, setYears] = useState(0);

  // 언어 동기화 (Header.js와 동일)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialLang = getInitialLang();
    setLang(initialLang);
    setCurrency(initialLang === 'ko' ? 'KRW' : 'USD');

    const handler = (e) => {
      const next = e.detail === 'en' ? 'en' : 'ko';
      setLang(next);
      setCurrency(next === 'ko' ? 'KRW' : 'USD');
    };

    window.addEventListener('fm_lang_change', handler);
    return () => window.removeEventListener('fm_lang_change', handler);
  }, []);

  // 텍스트 리소스
  const t = useMemo(
    () => ({
      title:
        locale === 'ko'
          ? '투자 수익률(CAGR) 계산기'
          : 'CAGR (Investment Return) Calculator',
      desc:
        locale === 'ko'
          ? '초기 자산, 최종 자산, 투자 기간으로 연평균 복리 수익률(CAGR)을 계산하고, 세금·수수료 효과를 확인해 보세요.'
          : 'Calculate compound annual growth rate (CAGR) from initial and final value and see the impact of tax and fees.',

      // 히어로
      heroTitle:
        locale === 'ko'
          ? 'CAGR(연평균 수익률)로\n내 투자 성과를 한 줄 숫자로'
          : 'Summarize your investment\nperformance with CAGR in one number',
      heroLead:
        locale === 'ko'
          ? 'CAGR은 들쭉날쭉한 연 수익률을 “연속된 하나의 연 수익률”로 바꿔 보여주는 지표입니다. 단순 평균이 아니라, 실제 자산이 불어난 속도를 반영합니다.'
          : 'CAGR compresses your bumpy yearly returns into a single annualized rate that reflects how fast your money actually grew over time.',
      stat1Title: locale === 'ko' ? '초기 → 최종' : 'Initial → Final',
      stat1Value: locale === 'ko' ? '한 줄 요약' : 'One-line summary',
      stat2Title: locale === 'ko' ? '세전 vs 세후' : 'Gross vs net',
      stat2Value: locale === 'ko' ? '비용 반영' : 'Costs included',
      stat3Title: locale === 'ko' ? '연도별 경로' : 'Yearly path',
      stat3Value: locale === 'ko' ? '그래프·표' : 'Chart & table',

      // 상단 설명 카드
      introTitle:
        locale === 'ko'
          ? 'CAGR 계산기는 이렇게 활용해 보세요'
          : 'How to use this CAGR calculator',
      introLead:
        locale === 'ko'
          ? '“초기에 얼마를 넣어서, 지금 얼마가 되었는지”만 알아도, 그 사이의 연평균 수익률을 추정할 수 있습니다.'
          : 'If you know how much you started with and how much you have now, you can estimate your compound annual growth rate in between.',
      introBullet1:
        locale === 'ko'
          ? '초기 자산(투자 원금)과 현재 자산(혹은 목표 자산), 투자 기간(년)을 입력하면 CAGR을 계산합니다.'
          : 'Enter initial value, final (or current) value, and the number of years to calculate CAGR.',
      introBullet2:
        locale === 'ko'
          ? '세금·수수료를 “연 수익률을 깎는 방식”으로 반영해, 세전·세후 CAGR을 비교해 볼 수 있습니다.'
          : 'Tax and fee are applied by reducing the effective annual rate so you can compare gross vs net CAGR.',
      introBullet3:
        locale === 'ko'
          ? '연도별 자산 경로를 그래프와 표로 함께 보면서, 숫자가 실제 자산 성장과 어떻게 연결되는지 확인할 수 있습니다.'
          : 'A yearly path table and chart help you connect the CAGR number to an actual asset growth timeline.',

      // 결과 Summary 라벨
      netCagrLabel:
        locale === 'ko'
          ? '세후 투자 수익률(CAGR)'
          : 'Net CAGR (after tax/fee)',
      grossCagrLabel:
        locale === 'ko'
          ? '세전 투자 수익률(추정)'
          : 'Estimated gross CAGR',
      initialLabel: locale === 'ko' ? '초기 자산' : 'Initial value',
      finalLabel: locale === 'ko' ? '최종 자산' : 'Final value',
      periodLabel: locale === 'ko' ? '투자 기간' : 'Investment period',
      yearsUnit: locale === 'ko' ? '년' : 'years',
      chartTitle:
        locale === 'ko'
          ? '세전 vs 세후 자산 경로'
          : 'Gross vs net asset path',

      // FAQ 제목
      faqTitle:
        locale === 'ko'
          ? 'CAGR 계산기 자주 묻는 질문(FAQ)'
          : 'CAGR calculator FAQ',
    }),
    [locale]
  );

  const summaryFmt = (v) => numberFmt(numberLocale, currency, v || 0);
  const pctFmt = (v) =>
    `${((Number(v) || 0) * 100).toFixed(2)}%`;

  // FAQ 항목 (UI + JSON-LD 공통)
  const faqItems = useMemo(
    () =>
      locale === 'ko'
        ? [
            {
              q: 'CAGR은 단순 평균 수익률과 무엇이 다른가요?',
              a: '단순 평균은 연수익률들을 그대로 더해서 연수로 나누지만, CAGR은 처음과 끝 자산 규모를 기준으로 “매년 동일한 수익률이 났다면 몇 %인가?”를 계산합니다. 마이너스 구간이 섞여 있을 때 특히 차이가 커집니다.',
            },
            {
              q: '기간 입력은 연 단위로만 가능한가요?',
              a: '현재 버전에서는 소수점까지 포함한 연 단위를 사용합니다. 예를 들어 2년 6개월은 2.5년으로 입력할 수 있습니다.',
            },
            {
              q: '세금·수수료를 어떻게 반영하나요?',
              a: '이 계산기는 단순화를 위해 이자소득세 15.4%와 연 0.5% 수수료를 가정하고, 세전 CAGR에서 일정 비율을 깎는 방식으로 세후 CAGR을 계산합니다. 실제 상품별 세금·보수 구조와는 차이가 있을 수 있습니다.',
            },
            {
              q: '초기/최종 자산은 세전 기준인가요, 세후 기준인가요?',
              a: '입력값 자체는 사용자가 인지하는 “실제 자산 규모”를 기준으로 넣어 주시면 됩니다. 세전/세후 모델링은 CAGR 계산 과정과 연도별 경로에서만 사용됩니다.',
            },
            {
              q: '실제 투자 성과와 계산기 결과가 다르게 나올 수 있나요?',
              a: '네. 실제로는 매수·매도 타이밍, 현금흐름, 세법 변화, 상품 보수 등 다양한 요소가 영향을 줍니다. 이 도구는 “한 번에 넣고 한 번에 나온 것처럼” 단순화한 모델이므로, 참고용으로만 활용해 주세요.',
            },
            {
              q: '세금+수수료 금액이 너무 크게 보입니다. 1,000만→2억2,000만(10년) 예시는 잘못된 건 아닌가요?',
              a: `예를 들어 초기 1,000만원이 10년 뒤 2억 2,000만원이 되도록 맞추면, 세전 CAGR은 약 43.4%, 세후 CAGR은 약 36.2%로 계산됩니다. 이때 연도별 테이블의 “세전 자산(추정)”과 “세후 자산”은 각각 세전 수익률/세후 수익률로 굴렸을 때의 자산 경로이고, “세금+수수료 효과”는 두 자산 경로의 차이(격차)를 의미합니다. 10년차에 1억 원 이상으로 크게 보이는 이유는, 43.4%와 36.2%라는 작은 차이라도 10년간 복리로 누적되면 자산 규모가 크게 벌어지기 때문입니다. 이 값은 실제로 납부한 세금이 아니라, “세전 CAGR을 그대로 유지했다면 이만큼 더 커졌을 텐데”라는 잠재 성장 차이로 이해하시면 됩니다.`,
            },
          ]
        : [
            {
              q: 'How is CAGR different from a simple average return?',
              a: 'A simple average just sums up yearly returns and divides by the number of years. CAGR instead asks, “If my investment grew at a constant rate every year, what would that rate be to get from the initial to the final value?” It captures the actual growth speed more accurately.',
            },
            {
              q: 'Can I enter fractional years?',
              a: 'Yes. You can enter decimal years. For example, 2.5 years represents 2 years and 6 months.',
            },
            {
              q: 'How are tax and fees applied in this calculator?',
              a: 'For simplicity, we assume a 15.4% interest tax and a 0.5% annual fee, and reduce the gross CAGR accordingly to estimate net CAGR. Real products may have more complex and different structures.',
            },
            {
              q: 'Should I use pre-tax or after-tax values for initial and final inputs?',
              a: 'You can use whichever is more intuitive for you, as long as you are consistent. The gross/net modeling is approximate and is mainly meant to show how costs can affect long-term growth.',
            },
            {
              q: 'Why might my actual performance differ from this calculator?',
              a: 'Real portfolios involve contributions, withdrawals, rebalancing, and changing market conditions. This calculator assumes a single lump sum growing at a constant rate, so treat it as a planning and review tool rather than an exact performance audit.',
            },
            {
              q: 'The tax + fee impact in the table looks extremely large (e.g. 10M → 220M over 10 years). Is that a bug?',
              a: `In the 10M → 220M over 10 years example, the gross CAGR is about 43.4% and the net CAGR after tax/fee is about 36.2%. The yearly table shows two parallel scenarios: one where your money grows at 43.4%, and another at 36.2%. “Tax + fee impact” is the difference between these two paths at each year, not the actual tax you paid in that year. Because the gap in CAGR is compounded over 10 years, the asset gap can exceed 100M KRW by year 10. This is normal in compound growth and represents lost potential growth due to costs, not a literal tax bill.`,
            },
          ],
    [locale]
  );

  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    }),
    [faqItems]
  );

  const onSubmit = (form) => {
    const scale = currency === 'KRW' ? 10_000 : 1;
    const init = (Number(form.initial) || 0) * scale;
    const fin = (Number(form.final) || 0) * scale;
    const y = Number(form.years) || 0;

    const r = calcCagr({
      initial: init,
      final: fin,
      years: y,
      taxMode: form.taxMode,
      feeMode: form.feeMode,
    });

    setInitial(init);
    setFinalValue(fin);
    setYears(y);
    setResult(r);
  };

  const hasResult = !!result;
  const netCagr = result?.netCagr || 0;
  const grossCagr = result?.grossCagr || 0;

  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/cagr-calculator"
        image="/og/cagr-calculator.jpg"
      />
      {/* FAQ JSON-LD (SEO용) */}
      <JsonLd data={faqJsonLd} />

      <div className="py-6 grid gap-6 fm-mobile-full">
        {/* 히어로 카드 */}
        <div className="card bg-slate-900 text-white">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold whitespace-pre-line mb-2">
                {t.heroTitle}
              </h1>
              <p className="text-sm text-slate-200 mb-3">
                {t.heroLead}
              </p>
              <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                CAGR · COMPOUND ANNUAL GROWTH RATE
              </p>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2 text-xs">
              <div className="stat bg-slate-800/80 border border-slate-700">
                <p className="stat-title text-slate-300">
                  {t.stat1Title}
                </p>
                <p className="stat-value text-emerald-300 text-base">
                  {t.stat1Value}
                </p>
              </div>
              <div className="stat bg-slate-800/80 border border-slate-700">
                <p className="stat-title text-slate-300">
                  {t.stat2Title}
                </p>
                <p className="stat-value text-sky-300 text-base">
                  {t.stat2Value}
                </p>
              </div>
              <div className="stat bg-slate-800/80 border border-slate-700">
                <p className="stat-title text-slate-300">
                  {t.stat3Title}
                </p>
                <p className="stat-value text-amber-300 text-base">
                  {t.stat3Value}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 상단 설명 카드 */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">
            {t.introTitle}
          </h2>
          <p className="text-sm text-slate-600 mb-2">
            {t.introLead}
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
            <li>{t.introBullet1}</li>
            <li>{t.introBullet2}</li>
            <li>{t.introBullet3}</li>
          </ul>
        </div>

        {/* 입력 폼 */}
        <div className="card">
          <CagrForm
            onSubmit={onSubmit}
            locale={locale}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        </div>

        {/* 결과 */}
        {hasResult && (
          <>
            {/* 요약 영역 */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="stat">
                <div className="stat-title">
                  {t.netCagrLabel}
                </div>
                <div className="stat-value">
                  {pctFmt(netCagr)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">
                  {t.grossCagrLabel}
                </div>
                <div className="stat-value">
                  {pctFmt(grossCagr)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">
                  {t.initialLabel}
                </div>
                <div className="stat-value">
                  {summaryFmt(initial)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">
                  {t.finalLabel}
                </div>
                <div className="stat-value">
                  {summaryFmt(finalValue)}
                </div>
              </div>
            </div>

            {/* 차트 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-semibold">
                  {t.chartTitle}
                </h2>
                {currency === 'KRW' && (
                  <span className="text-xs text-slate-500">
                    {locale.startsWith('ko')
                      ? '단위: 원 / 만원 / 억원 자동'
                      : 'Unit: auto (KRW / 10k / 100M)'}
                  </span>
                )}
              </div>
              <CagrChart
                result={result}
                locale={numberLocale}
                currency={currency}
              />
            </div>

            {/* 연간 테이블 */}
            <CagrYearTable
              result={result}
              locale={numberLocale}
              currency={currency}
              initial={initial}
            />

            {/* FAQ 섹션 */}
            <div className="card w-full">
              <h2 className="text-lg font-semibold mb-3">
                {t.faqTitle}
              </h2>
              <div className="space-y-3">
                {faqItems.map((item, idx) => (
                  <details
                    key={idx}
                    className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                    open={idx === 0}
                  >
                    <summary className="cursor-pointer font-medium text-sm">
                      {item.q}
                    </summary>
                    <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
