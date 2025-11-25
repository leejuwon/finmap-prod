// pages/tools/compound-interest.js
import { useMemo, useState, useEffect } from 'react';
import SeoHead from '../../_components/SeoHead';
import CompoundForm from '../../_components/CompoundForm';
import CompoundChart from '../../_components/CompoundChart';
import CompoundYearTable from '../../_components/CompoundYearTable';
import {
  calcCompound,
  numberFmt,
  calcSimpleLump,
} from '../../lib/compound';
import { getInitialLang } from '../../lib/lang';

// FAQ용 JSON-LD 출력 컴포넌트
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function CompoundPage() {
  const [lang, setLang] = useState('ko');

  const locale = lang === 'ko' ? 'ko' : 'en';
  const numberLocale = locale === 'ko' ? 'ko-KR' : 'en-US';

  const [currency, setCurrency] = useState(
    locale === 'ko' ? 'KRW' : 'USD'
  );

  // 복리식(월 적립) 결과
  const [result, setResult] = useState(null);
  const [invest, setInvest] = useState({
    principal: 0,
    monthly: 0,
    years: 0,
  });

  // 단리식(일시불 거치) 결과
  const [simpleResult, setSimpleResult] = useState(null);
  const [simpleInvest, setSimpleInvest] = useState({
    principal: 0,
    years: 0,
  });

  // ✅ 마운트 시 전역 언어 동기화 + 변경 이벤트 수신
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initial = getInitialLang();
    setLang(initial);
    setCurrency(initial === 'ko' ? 'KRW' : 'USD');

    const handler = (e) => {
      const next = e.detail || 'ko';
      setLang(next);
      setCurrency(next === 'ko' ? 'KRW' : 'USD');
    };

    window.addEventListener('fm_lang_change', handler);
    return () => window.removeEventListener('fm_lang_change', handler);
  }, []);

  // 텍스트 리소스
  const t = useMemo(
    () => ({
      title: locale === 'ko' ? '복리 계산기' : 'Compound Interest Calculator',
      desc:
        locale === 'ko'
          ? '초기 투자금·월 적립금·수익률·기간으로 미래가치를 계산하세요.'
          : 'Calculate future value with principal, monthly contribution, rate and term.',
      fv: locale === 'ko' ? '세후 총자산' : 'Net Future Value',
      contrib: locale === 'ko' ? '총 납입액' : 'Total Contribution',
      interest: locale === 'ko' ? '세후 이자 합계' : 'Net Interest',
      chartTitle: locale === 'ko' ? '자산 성장 차트' : 'Asset Growth Chart',
      yearlyTableTitleKo: '연간 요약 테이블 (복리식, 월 적립)',
      yearlyTableTitleEn: 'Yearly Summary (compound, monthly)',
      yearlyTableSimpleTitleKo: '연간 요약 테이블 (단리식, 일시불 거치)',
      yearlyTableSimpleTitleEn: 'Yearly Summary (simple interest, lump-sum)',
      compareTitle:
        locale === 'ko'
          ? '복리식 vs 단리식 비교'
          : 'Compound vs Simple interest',
      planCompound:
        locale === 'ko'
          ? '복리식(월 적립)'
          : 'Compound (monthly)',
      planSimple:
        locale === 'ko'
          ? '단리식(일시불 거치)'
          : 'Simple interest (lump-sum)',

      // 🔹 설명 섹션 텍스트
      introTitle:
        locale === 'ko'
          ? '이 복리 계산기로 무엇을 할 수 있나요?'
          : 'What can this compound calculator do?',
      introLead:
        locale === 'ko'
          ? '초기 목돈과 매달 적립하는 금액, 예상 수익률·기간·세금·수수료를 한 번에 넣고 미래 자산을 시뮬레이션할 수 있습니다.'
          : 'You can simulate your future wealth using your initial principal, monthly contributions, expected return, time horizon, and tax/fee settings.',
      introBullet1:
        locale === 'ko'
          ? '초기 투자금 + 매달 적립금으로 세후 기준 미래 자산을 계산합니다.'
          : 'Calculate net future value based on lump-sum plus monthly contributions.',
      introBullet2:
        locale === 'ko'
          ? '세금·수수료를 적용했을 때와 적용하지 않았을 때의 차이를 숫자로 확인할 수 있습니다.'
          : 'See how taxes and fees change your results compared to a no-tax scenario.',
      introBullet3:
        locale === 'ko'
          ? '같은 조건에서 복리식(월 적립)과 단리식(일시불 거치)을 비교해 볼 수 있습니다.'
          : 'Compare a monthly compound plan vs a simple lump-sum plan under the same assumptions.',

      // 🔹 FAQ 섹션 제목
      faqTitle:
        locale === 'ko'
          ? '복리 계산기 자주 묻는 질문(FAQ)'
          : 'Compound calculator FAQ',
    }),
    [locale]
  );

  const summaryFmt = (v) => numberFmt(numberLocale, currency, v || 0);
  const safe = (obj, key) => (obj && Number(obj[key])) || 0;

  // 🔹 FAQ 데이터 (화면 + JSON-LD 둘 다 사용)
  const faqItems = useMemo(
    () =>
      locale === 'ko'
        ? [
            {
              q: '이 복리 계산기에서 입력하는 금액 단위는 어떻게 되나요?',
              a: '통화를 원화(KRW)로 두면 만원 단위로 입력합니다. 예를 들어 1,000만원은 1000으로 입력합니다. 통화를 USD로 바꾸면 실제 달러 금액 그대로 입력하면 됩니다.',
            },
            {
              q: '세금·수수료 옵션은 어떻게 적용되나요?',
              a: '세금 적용을 켜면 이자 소득세 15.4%를, 수수료 적용을 켜면 연 0.5% 수준의 보수/수수료를 반영해 순수익률을 계산합니다. 실제 상품에 따라 세율·수수료는 다를 수 있으므로 참고용으로만 사용하세요.',
            },
            {
              q: '월복리와 연복리 중 무엇을 선택해야 하나요?',
              a: '국내 대부분의 금융상품은 일 단위 혹은 월 단위 복리를 사용하지만, 간단한 비교를 위해 연복리도 제공합니다. 일반적으로 월복리를 선택하면 같은 연 수익률이라도 조금 더 큰 미래가치가 나옵니다.',
            },
            {
              q: '단리식(일시불 거치) 결과는 어떻게 계산되나요?',
              a: '복리식(월 적립)에서 납입한 총액을 하나로 모아 일시불로 맡긴 것처럼 가정하고 단리식 결과를 계산합니다. 같은 총 납입액이라도 복리식이 단리식보다 얼마나 유리한지 비교해볼 수 있습니다.',
            },
            {
              q: '실제 투자 결과와 계산 결과가 다른 이유는 무엇인가요?',
              a: '이 계산기는 일정한 수익률과 매달 동일한 적립금을 가정한 단순 모델입니다. 실제 투자는 시장 변동, 환율, 세법 변화, 수수료 구조 등에 따라 결과가 달라질 수 있습니다.',
            },
          ]
        : [
            {
              q: 'What unit should I use for the input amounts?',
              a: 'If the currency is KRW, you should enter amounts in units of 10,000 KRW (e.g., 1,000 → 10M KRW). If you switch to USD, you can enter the actual dollar amount as is.',
            },
            {
              q: 'How are tax and fees applied in this calculator?',
              a: 'When tax is enabled, a 15.4% interest tax is applied. When fees are enabled, we assume an annual 0.5% cost. These are approximations and may differ from real products, so treat them as a rough reference only.',
            },
            {
              q: 'Should I choose monthly or yearly compounding?',
              a: 'Most real-world products compound daily or monthly, but yearly compounding is provided for easy comparison. For the same annual rate, monthly compounding usually yields a slightly higher future value than yearly compounding.',
            },
            {
              q: 'How is the simple (lump-sum) plan calculated?',
              a: 'We add up the total amount you contribute in the compound plan and assume it was invested as a single lump-sum. This shows how much advantage the monthly compound approach can provide over a simple lump-sum plan.',
            },
            {
              q: 'Why might the calculator result differ from my real investment?',
              a: 'The calculator assumes a constant return and fixed monthly contributions. Real investments are affected by market volatility, exchange rates, tax rules, and various fee structures, so actual results will differ.',
            },
          ],
    [locale]
  );

  // 🔹 FAQ JSON-LD (FAQPage)
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

  // 🔥 통화는 여기 있는 currency만 사용
  const onSubmit = (form) => {
    const cur = currency; // 현재 선택된 통화
    const scale = cur === 'KRW' ? 10_000 : 1;

    const p = (Number(form.principal) || 0) * scale;
    const m = (Number(form.monthly) || 0) * scale;
    const r = Number(form.annualRate) || 0;
    const y = Number(form.years) || 0;

    // 🔥 새로 추가된 세율/수수료율 (퍼센트값, 예: 15.4, 0.5)
    // CompoundForm에서 taxRatePercent / feeRatePercent를 넘긴다는 전제
    const taxRatePercent =
      form.taxRatePercent !== undefined && form.taxRatePercent !== null
        ? Number(form.taxRatePercent)       // 사용자가 입력한 값
        : 15.4;                             // 폼에서 안 넘어오면 디폴트

    const feeRatePercent =
      form.feeRatePercent !== undefined && form.feeRatePercent !== null
        ? Number(form.feeRatePercent)
        : 0.5;

    const baseYear = new Date().getFullYear();

    const compoundResult = calcCompound({
      principal: p,
      monthly: m,
      annualRate: r,
      years: y,
      compounding: form.compounding,
      taxMode: form.taxMode,
      feeMode: form.feeMode,
      baseYear,

      // 🔥 여기서 세율/수수료율을 실제로 넘겨준다
      taxRatePercent,
      feeRatePercent,
    });

    const totalInvested = p + m * 12 * y;

    const simple = calcSimpleLump({
      principal: totalInvested,
      annualRate: r,
      years: y,
      taxMode: form.taxMode,
      feeMode: form.feeMode,
      baseYear,

      // 🔥 단리 계산도 같은 세율/수수료율 사용
      taxRatePercent,
      feeRatePercent,
    });

    setInvest({ principal: p, monthly: m, years: y });
    setResult(compoundResult);

    setSimpleInvest({ principal: totalInvested, years: y });
    setSimpleResult(simple);
  };

  const hasResult = !!result;

  // 요약 값들
  const compoundFV = safe(result, 'futureValueNet');
  const compoundContrib = safe(result, 'totalContribution');
  const compoundInterest = safe(result, 'totalInterestNet');

  const simpleFV = safe(simpleResult, 'futureValueNet');
  const simpleContrib = safe(simpleResult, 'totalContribution');
  const simpleInterest = safe(simpleResult, 'totalInterestNet');

  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/compound-interest"
        image="/og/compound.jpg"
      />
      {/* FAQ JSON-LD (SEO용) */}
      <JsonLd data={faqJsonLd} />

      <div className="py-6 grid gap-6 fm-mobile-full">
        {/* 타이틀 */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">{t.title}</h1>
        </div>

        {/* 🔹 상단 설명 카드 */}
        <div className="card w-full">
          <h2 className="text-lg font-semibold mb-2">{t.introTitle}</h2>
          <p className="text-sm text-slate-600 mb-2">{t.introLead}</p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
            <li>{t.introBullet1}</li>
            <li>{t.introBullet2}</li>
            <li>{t.introBullet3}</li>
          </ul>
        </div>

        {/* 🔗 통화 상태를 부모가 가지고, 폼에 내려줌 */}
        <div className="card w-full">
          <CompoundForm
            onSubmit={onSubmit}
            locale={locale}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        </div>

        {/* 결과 영역 */}
        {hasResult && (
          <>
            {/* 상단 Summary (복리식 기준) */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="stat">
                <div className="stat-title">{t.fv}</div>
                <div className="stat-value">{summaryFmt(compoundFV)}</div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.contrib}</div>
                <div className="stat-value">
                  {summaryFmt(compoundContrib)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.interest}</div>
                <div className="stat-value">
                  {summaryFmt(compoundInterest)}
                </div>
              </div>
            </div>

            {/* 차트: 복리식(막대) + 단리식(라인) */}
            <div className="card w-full">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-semibold">{t.chartTitle}</h2>
                <span className="text-xs text-slate-500">
                  {locale.startsWith('ko')
                    ? '단위: 원 / 만원 / 억원 자동'
                    : 'Unit: auto (KRW / 10k / 100M)'}
                </span>
              </div>
              <CompoundChart
                data={result}
                lumpData={simpleResult}
                locale={numberLocale}
                currency={currency}
                principal={invest.principal}
                monthly={invest.monthly}
              />
            </div>

            {/* 연간 요약 테이블 - 복리식(월 적립) */}
            <CompoundYearTable
              result={result}
              locale={numberLocale}
              currency={currency}
              principal={invest.principal}
              monthly={invest.monthly}
              title={
                locale.startsWith('ko')
                  ? t.yearlyTableTitleKo
                  : t.yearlyTableTitleEn
              }
            />

            {/* 연간 요약 테이블 - 단리식(일시불) */}
            {simpleResult && (
              <CompoundYearTable
                result={simpleResult}
                locale={numberLocale}
                currency={currency}
                principal={simpleInvest.principal}
                monthly={0}
                title={
                  locale.startsWith('ko')
                    ? t.yearlyTableSimpleTitleKo
                    : t.yearlyTableSimpleTitleEn
                }
              />
            )}

            {/* 최종 비교 Summary */}
            {simpleResult && (
              <div className="card w-full">
                <h2 className="text-lg font-semibold mb-3">
                  {t.compareTitle}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* 복리식 */}
                  <div className="border rounded-xl p-4">
                    <h3 className="font-semibold mb-2">{t.planCompound}</h3>
                    <ul className="text-sm space-y-1">
                      <li>
                        <span className="text-slate-500">{t.contrib}: </span>
                        <span className="font-medium">
                          {summaryFmt(compoundContrib)}
                        </span>
                      </li>
                      <li>
                        <span className="text-slate-500">{t.fv}: </span>
                        <span className="font-medium">
                          {summaryFmt(compoundFV)}
                        </span>
                      </li>
                      <li>
                        <span className="text-slate-500">{t.interest}: </span>
                        <span className="font-medium">
                          {summaryFmt(compoundInterest)}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* 단리식 */}
                  <div className="border rounded-xl p-4">
                    <h3 className="font-semibold mb-2">{t.planSimple}</h3>
                    <ul className="text-sm space-y-1">
                      <li>
                        <span className="text-slate-500">{t.contrib}: </span>
                        <span className="font-medium">
                          {summaryFmt(simpleContrib)}
                        </span>
                      </li>
                      <li>
                        <span className="text-slate-500">{t.fv}: </span>
                        <span className="font-medium">
                          {summaryFmt(simpleFV)}
                        </span>
                      </li>
                      <li>
                        <span className="text-slate-500">{t.interest}: </span>
                        <span className="font-medium">
                          {summaryFmt(simpleInterest)}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 🔹 FAQ 섹션 */}
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
