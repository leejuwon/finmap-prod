// pages/tools/cagr-calculator.js
import { useState, useMemo, useEffect } from 'react';
import SeoHead from '../../_components/SeoHead';
import CagrForm from '../../_components/CagrForm';
import CagrChart from '../../_components/CagrChart';
import CagrYearTable from '../../_components/CagrYearTable';
import { numberFmt } from '../../lib/compound';
import { calcCagr } from '../../lib/cagr';
import { getInitialLang } from '../../lib/lang';

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
      netCagrLabel: locale === 'ko'
        ? '세후 투자 수익률(CAGR)'
        : 'Net CAGR (after tax/fee)',
      grossCagrLabel: locale === 'ko'
        ? '세전 투자 수익률(추정)'
        : 'Estimated gross CAGR',
      initialLabel: locale === 'ko'
        ? '초기 자산'
        : 'Initial value',
      finalLabel: locale === 'ko'
        ? '최종 자산'
        : 'Final value',
      periodLabel: locale === 'ko'
        ? '투자 기간'
        : 'Investment period',
      yearsUnit: locale === 'ko' ? '년' : 'years',
      chartTitle: locale === 'ko'
        ? '세전 vs 세후 자산 경로'
        : 'Gross vs net asset path',
    }),
    [locale]
  );

  const summaryFmt = (v) => numberFmt(numberLocale, currency, v || 0);
  const pctFmt = (v) => `${((Number(v) || 0) * 100).toFixed(2)}%`;

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
      />

      <div className="py-6 grid gap-6 fm-mobile-full">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">{t.title}</h1>
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
                <span className="text-xs text-slate-500">
                  {locale.startsWith('ko')
                    ? '단위: 원 / 만원 / 억원 자동'
                    : 'Unit: auto (KRW / 10k / 100M)'}
                </span>
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
          </>
        )}
      </div>
    </>
  );
}
