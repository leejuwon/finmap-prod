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
      compareTitle: locale === 'ko'
        ? '복리식 vs 단리식 비교'
        : 'Compound vs Simple interest',
      planCompound: locale === 'ko'
        ? '복리식(월 적립)'
        : 'Compound (monthly)',
      planSimple: locale === 'ko'
        ? '단리식(일시불 거치)'
        : 'Simple interest (lump-sum)',
    }),
    [locale]
  );

  const summaryFmt = (v) => numberFmt(numberLocale, currency, v || 0);
  const safe = (obj, key) => (obj && Number(obj[key])) || 0;

   // 🔥 통화는 여기 있는 currency만 사용
  const onSubmit = (form) => {
    const cur = currency; // 현재 선택된 통화
    const scale = cur === 'KRW' ? 10_000 : 1;

    const p = (Number(form.principal) || 0) * scale;
    const m = (Number(form.monthly) || 0) * scale;
    const r = Number(form.annualRate) || 0;
    const y = Number(form.years) || 0;

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
    });

    const totalInvested = p + m * 12 * y;
    const simple = calcSimpleLump({
      principal: totalInvested,
      annualRate: r,
      years: y,
      taxMode: form.taxMode,
      feeMode: form.feeMode,
      baseYear,
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

      <div className="py-6 grid gap-6 fm-mobile-full">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">{t.title}</h1>
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
          </>
        )}
      </div>
    </>
  );
}
