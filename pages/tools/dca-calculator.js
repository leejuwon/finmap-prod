// pages/tools/dca-calculator.js
import { useEffect, useMemo, useState } from 'react';
import SeoHead from '../../_components/SeoHead';
import DCAForm from '../../_components/DcaForm';
import DCAChart from '../../_components/DcaChart';
import DCAYearTable from '../../_components/DcaYearTable';
import { formatMoneyAuto } from '../../lib/money';
import { getInitialLang } from '../../lib/lang';

// ===================== 시뮬레이션 로직 =====================
function simulateDCA({
  initial,
  monthly,
  annualRate,
  years,
  annualIncrease = 0,   // 연간 적립금 증가율 (%)
  compounding = 'monthly',
  taxMode = 'apply',
  feeMode = 'apply',
}) {
  const months = Math.max(1, Math.floor(years * 12));
  const rYear = (Number(annualRate) || 0) / 100;

  // 세금/수수료 감안한 순수익률 근사
  let netYear = rYear;
  if (taxMode === 'apply') {
    netYear *= 1 - 0.154; // 이자소득세 15.4%
  }
  if (feeMode === 'apply') {
    netYear -= 0.005; // 연 0.5% 수수료 가정
  }
  if (netYear < -0.99) netYear = -0.99;

  const grossMonth =
    compounding === 'yearly'
      ? Math.pow(1 + rYear, 1 / 12) - 1
      : rYear / 12;

  const netMonth =
    compounding === 'yearly'
      ? Math.pow(1 + netYear, 1 / 12) - 1
      : netYear / 12;

  let invested = Number(initial) || 0;
  let valueGross = invested;
  let valueNet = invested;

  let monthlyCur = Number(monthly) || 0;
  let investedPrevYear = invested;
  let valueNetPrevYear = valueNet;

  const rows = [];

  for (let m = 1; m <= months; m++) {
    invested += monthlyCur;

    valueGross = (valueGross + monthlyCur) * (1 + grossMonth);
    valueNet = (valueNet + monthlyCur) * (1 + netMonth);

    const isYearEnd = m % 12 === 0 || m === months;
    if (isYearEnd) {
      const year = Math.round(m / 12);
      const contributionYear = invested - investedPrevYear;
      const gainYearNet = valueNet - valueNetPrevYear - contributionYear;

      rows.push({
        year,
        invested,
        valueGross,
        valueNet,
        contributionYear,
        gainYearNet,
        monthlyAtEnd: monthlyCur,
      });

      investedPrevYear = invested;
      valueNetPrevYear = valueNet;

      // 연말마다 적립금 증가율 반영
      const inc = Number(annualIncrease) || 0;
      if (inc !== 0) {
        monthlyCur *= 1 + inc / 100;
      }
    }
  }

  return rows;
}

// ===================== 텍스트 =====================
const TEXT = {
  ko: {
    seoTitle: 'ETF·주식 자동 적립식 시뮬레이터 (DCA)',
    seoDesc:
      '매월 일정 금액을 ETF·주식에 적립 투자했을 때 자산 성장 경로를 시뮬레이션합니다. 세금, 수수료, 연간 적립금 증가율까지 반영해 보세요.',
    title: 'ETF·주식 자동 적립식 시뮬레이터 (DCA)',
    descShort:
      '매월 일정 금액(또는 연간 증가)을 ETF·주식에 적립 투자했을 때, 세후 자산과 수익을 시뮬레이션합니다.',
    fv: '마지막 해 세후 자산',
    contrib: '누적 투자금',
    gain: '세후 수익(누적)',
    unitHint: '단위: 원 / 만원 / 억원 자동',
    chartTitle: 'DCA 적립식 자산 성장 경로',
    tableTitle: '연도별 적립식 투자 요약 (DCA)',
  },
  en: {
    seoTitle: 'ETF/Stock DCA Simulator',
    seoDesc:
      'Simulate how your assets grow when you invest a fixed amount into ETFs/stocks every month (DCA), considering tax, fees and annual contribution increase.',
    title: 'ETF/Stock DCA Simulator (DCA)',
    descShort:
      'Simulate net assets and gains when you invest monthly (with optional yearly increase) into ETFs/stocks.',
    fv: 'Final net assets',
    contrib: 'Total invested',
    gain: 'Net gain (cumulative)',
    unitHint: 'Unit: auto (KRW / 10k / 100M)',
    chartTitle: 'DCA asset growth path',
    tableTitle: 'Yearly summary for DCA investing',
  },
};

// ===================== 페이지 컴포넌트 =====================
export default function DCACalculatorPage() {
  const [lang, setLang] = useState('ko');
  const locale = lang === 'ko' ? 'ko' : 'en';
  const numberLocale = locale === 'ko' ? 'ko-KR' : 'en-US';

  // 언어에 따라 기본 통화 자동 설정
  const [currency, setCurrency] = useState(
    locale === 'ko' ? 'KRW' : 'USD'
  );

  const [result, setResult] = useState(null);

  // 헤더 언어와 동기화
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

  const t = useMemo(() => TEXT[locale] || TEXT.ko, [locale]);

  const hasResult = !!(result && result.length);
  const last = hasResult ? result[result.length - 1] : null;

  const finalNet = last ? last.valueNet : 0;
  const totalInvested = last ? last.invested : 0;
  const totalGain = finalNet - totalInvested;

  const summaryFmt = (v) =>
    formatMoneyAuto(v || 0, currency, numberLocale);

  const handleSubmit = (form) => {
    const scale = currency === 'KRW' ? 10_000 : 1;

    const initial = (Number(form.initial) || 0) * scale;
    const monthly = (Number(form.monthly) || 0) * scale;
    const r = Number(form.annualRate) || 0;
    const y = Number(form.years) || 0;
    const annualIncrease = Number(form.annualIncrease) || 0;

    const rows = simulateDCA({
      initial,
      monthly,
      annualRate: r,
      years: y,
      annualIncrease,
      compounding: form.compounding,
      taxMode: form.taxMode,
      feeMode: form.feeMode,
    });

    setResult(rows);
  };

  return (
    <>
      <SeoHead
        title={t.seoTitle}
        desc={t.seoDesc}
        url="/tools/dca-calculator"
      />

      <div className="py-6 grid gap-6 fm-mobile-full">
        {/* 헤더 + 설명 */}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">
            {t.title}
          </h1>
          <p className="text-sm text-slate-600">{t.descShort}</p>
        </div>

        {/* 입력 폼 */}
        <div className="card">
          <DCAForm
            onSubmit={handleSubmit}
            locale={locale}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        </div>

        {/* 결과 섹션 */}
        {hasResult && (
          <>
            {/* 상단 Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="stat">
                <div className="stat-title">{t.fv}</div>
                <div className="stat-value">
                  {summaryFmt(finalNet)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.contrib}</div>
                <div className="stat-value">
                  {summaryFmt(totalInvested)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.gain}</div>
                <div className="stat-value">
                  {summaryFmt(totalGain)}
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
                  {t.unitHint}
                </span>
              </div>
              <DCAChart
                data={result}
                locale={numberLocale}
                currency={currency}
              />
            </div>

            {/* 연간 요약 테이블 */}
            <DCAYearTable
              rows={result}
              locale={numberLocale}
              currency={currency}
              title={t.tableTitle}
            />
          </>
        )}
      </div>
    </>
  );
}
