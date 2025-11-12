// pages/tools/compound-interest.js
import { useMemo, useState } from 'react';
import SeoHead from '../../_components/SeoHead';
import CompoundForm from '../../_components/CompoundForm';
import CompoundChart from '../../_components/CompoundChart';
import { calcCompound, numberFmt } from '../../lib/compound';

export default function CompoundPage() {
  const [locale, setLocale] = useState('ko'); // 'ko' | 'en'
  const [result, setResult] = useState(null);
  const [currency, setCurrency] = useState(locale === 'ko' ? 'KRW' : 'USD');

  const t = useMemo(() => ({
    title: locale === 'ko' ? '복리 계산기' : 'Compound Interest Calculator',
    desc: locale === 'ko'
      ? '초기 투자금·월 적립금·수익률·기간으로 미래가치를 계산하세요.'
      : 'Calculate future value with principal, monthly contribution, rate and term.',
    result: locale === 'ko' ? '결과' : 'Result',
    fv: locale === 'ko' ? '미래가치' : 'Future Value',
    contrib: locale === 'ko' ? '총 납입액' : 'Total Contribution',
    interest: locale === 'ko' ? '이자 합계' : 'Total Interest',
    lang: locale === 'ko' ? '한국어' : 'English',
    switch: locale === 'ko' ? 'EN으로' : '한국어로',
    faqTitle: locale === 'ko' ? 'FAQ' : 'FAQ',
    q1: locale === 'ko' ? '복리 주기는 무엇인가요?' : 'What is compounding period?',
    a1: locale === 'ko'
      ? '본 계산기는 월 적립/월복리를 가정합니다(연이율/12).'
      : 'This tool assumes monthly contributions and monthly compounding (APR/12).',
  }), [locale]);

  const onSubmit = (form) => {
    const r = calcCompound({
      principal: form.principal,
      monthly: form.monthly,
      annualRate: form.annualRate,
      years: form.years,
    });
    setCurrency(form.currency);
    setResult(r);
  };

  const loc = locale === 'ko' ? 'ko-KR' : 'en-US';

  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/compound-interest"
        image="/og/compound.jpg"
      />
      <div className="container py-6 grid gap-6">
        {/* 헤더영역 */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <button
            className="btn-secondary ml-auto"
            onClick={()=> setLocale(prev => prev === 'ko' ? 'en' : 'ko')}
          >
            {t.switch}
          </button>
        </div>

        {/* 입력폼 */}
        <div className="card">
          <CompoundForm onSubmit={onSubmit} locale={locale} />
        </div>

        {/* 결과 */}
        {result && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="stat">
                <div className="stat-title">{t.fv}</div>
                <div className="stat-value">
                  {numberFmt(loc, currency, result.futureValue)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.contrib}</div>
                <div className="stat-value">
                  {numberFmt(loc, currency, result.totalContribution)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.interest}</div>
                <div className="stat-value">
                  {numberFmt(loc, currency, result.totalInterest)}
                </div>
              </div>
            </div>

            {/* 차트 */}
            <div className="card">
              <CompoundChart data={result} locale={loc} />
            </div>

            {/* FAQ */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-3">{t.faqTitle}</h2>
              <div className="prose">
                <p><strong>Q.</strong> {t.q1}<br/><strong>A.</strong> {t.a1}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
