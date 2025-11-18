// pages/tools/goal-simulator.js
import { useMemo, useState } from 'react';
import SeoHead from '../../_components/SeoHead';
import GoalForm from '../../_components/GoalForm';
import GoalChart from '../../_components/GoalChart';
import GoalYearTable from '../../_components/GoalYearTable';
import { numberFmt } from '../../lib/compound';

function simulateGoalPath({
  current,
  monthly,
  annualRate,
  years,
  compounding = 'monthly',
  taxMode = 'apply',
  feeMode = 'apply',
}) {
  const months = Math.max(1, Math.floor(years * 12));
  const rYear = (Number(annualRate) || 0) / 100;

  // 세금/수수료를 감안한 "순수익률" 근사
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

  let invested = Number(current) || 0;
  let valueGross = invested;
  let valueNet = invested;

  const rows = [];

  for (let m = 1; m <= months; m++) {
    invested += monthly;

    valueGross = (valueGross + monthly) * (1 + grossMonth);
    valueNet = (valueNet + monthly) * (1 + netMonth);

    if (m % 12 === 0 || m === months) {
      const year = Math.round(m / 12);
      rows.push({
        year,
        invested,
        valueGross,
        valueNet,
      });
    }
  }

  return rows;
}

export default function GoalSimulatorPage() {
  const [locale, setLocale] = useState('ko');      // 'ko' | 'en'
  const [currency, setCurrency] = useState('KRW'); // 'KRW' | 'USD'
  const [result, setResult] = useState(null);
  const [target, setTarget] = useState(0);

  const loc = locale === 'ko' ? 'ko-KR' : 'en-US';

  const t = useMemo(
    () => ({
      title: locale === 'ko' ? '목표 자산 시뮬레이터' : 'Goal Asset Simulator',
      desc:
        locale === 'ko'
          ? '현재 자산·월 적립금·수익률·기간·세금·수수료로 목표 자산 도달 경로를 시뮬레이션해 보세요.'
          : 'Simulate your path to a target asset level with current assets, monthly saving, rate, tax and fees.',
      switch: locale === 'ko' ? 'EN으로' : '한국어로',
      chartTitle: locale === 'ko' ? '목표 자산까지 자산 경로' : 'Asset path to goal',
      fv: locale === 'ko' ? '마지막 해 세후 자산' : 'Final net assets',
      contrib: locale === 'ko' ? '누적 투자금' : 'Total invested',
      interest: locale === 'ko' ? '세후 수익(마지막 해 기준)' : 'Net gain (final)',
      targetLabel: locale === 'ko' ? '목표 자산' : 'Target assets',
    }),
    [locale]
  );

  const summaryFmt = (v) => numberFmt(loc, currency, v || 0);

  const onSubmit = (form) => {
    const scale = form.currency === 'KRW' ? 10_000 : 1;
    const current = (Number(form.current) || 0) * scale;
    const monthly = (Number(form.monthly) || 0) * scale;
    const r = Number(form.annualRate) || 0;
    const y = Number(form.years) || 0;
    const targetValue = (Number(form.target) || 0) * scale;

    const rows = simulateGoalPath({
      current,
      monthly,
      annualRate: r,
      years: y,
      compounding: form.compounding,
      taxMode: form.taxMode,
      feeMode: form.feeMode,
    });

    setCurrency(form.currency || 'KRW');
    setTarget(targetValue);
    setResult(rows);
  };

  const hasResult = !!(result && result.length);
  const last = hasResult ? result[result.length - 1] : null;

  const finalNet = last ? last.valueNet : 0;
  const finalInvested = last ? last.invested : 0;
  const finalGain = finalNet - finalInvested;

  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/goal-simulator"
        image="/og/goal-simulator.jpg"
      />

      <div className="container py-6 grid gap-6 fm-mobile-full">
        {/* 헤더 + 언어 전환 */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">{t.title}</h1>
          <button
            type="button"
            className="btn-secondary ml-auto"
            onClick={() => setLocale((prev) => (prev === 'ko' ? 'en' : 'ko'))}
          >
            {t.switch}
          </button>
        </div>

        {/* 입력 폼 */}
        <div className="card">
          <GoalForm onSubmit={onSubmit} locale={locale} />
        </div>

        {/* 결과 영역 */}
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
                  {summaryFmt(finalInvested)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.interest}</div>
                <div className="stat-value">
                  {summaryFmt(finalGain)}
                </div>
              </div>
            </div>

            {/* 차트 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-semibold">{t.chartTitle}</h2>
                <span className="text-xs text-slate-500">
                  {locale.startsWith('ko')
                    ? '단위: 원 / 만원 / 억원 자동'
                    : 'Unit: auto (KRW / 10k / 100M)'}
                </span>
              </div>
              <GoalChart
                data={result}
                locale={loc}
                currency={currency}
                target={target}
              />
            </div>

            {/* ▶ 연간 요약 테이블 추가 */}
            <GoalYearTable
              rows={result}
              locale={loc}
              currency={currency}
              target={target}
            />
          </>
        )}
      </div>
    </>
  );
}
