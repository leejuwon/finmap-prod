// pages/tools/goal-simulator.js
import { useMemo, useState, useEffect } from 'react';
import SeoHead from '../../_components/SeoHead';
import GoalForm from '../../_components/GoalForm';
import GoalChart from '../../_components/GoalChart';
import GoalYearTable from '../../_components/GoalYearTable';
import { numberFmt } from '../../lib/compound';
import { getInitialLang } from '../../lib/lang';

// ===== 시뮬레이터 계산 로직 =====
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

  let netYear = rYear;
  if (taxMode === 'apply') netYear *= 1 - 0.154;
  if (feeMode === 'apply') netYear -= 0.005;
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
      rows.push({ year, invested, valueGross, valueNet });
    }
  }

  return rows;
}

// ===== Page Component =====
export default function GoalSimulatorPage() {
  const [lang, setLang] = useState('ko');
  const locale = lang === 'ko' ? 'ko' : 'en';

  // 통화는 언어에 따라 자동 초기화
  const [currency, setCurrency] = useState(
    locale === 'ko' ? 'KRW' : 'USD'
  );

  const [result, setResult] = useState(null);
  const [target, setTarget] = useState(0);

  const loc = locale === 'ko' ? 'ko-KR' : 'en-US';

  // ===== 언어 초기 로딩 + Header.js 이벤트 수신 =====
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

  // ===== Text Dict =====
  const t = useMemo(
    () => ({
      title: locale === 'ko' ? '목표 자산 시뮬레이터' : 'Goal Asset Simulator',
      desc:
        locale === 'ko'
          ? '현재 자산·월 적립금·수익률·기간·세금·수수료로 목표 자산 도달 경로를 시뮬레이션해 보세요.'
          : 'Simulate asset growth toward a target value.',
      chartTitle: locale === 'ko' ? '목표 자산까지 자산 경로' : 'Path to target assets',
      fv: locale === 'ko' ? '마지막 해 세후 자산' : 'Final net assets',
      contrib: locale === 'ko' ? '누적 투자금' : 'Total invested',
      interest: locale === 'ko' ? '세후 수익' : 'Net gain',
    }),
    [locale]
  );

  const summaryFmt = (v) => numberFmt(loc, currency, v || 0);

  // ===== Form Submit =====
  const onSubmit = (form) => {
    const scale = currency === 'KRW' ? 10_000 : 1;

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

    setTarget(targetValue);
    setResult(rows);
  };

  const hasResult = !!(result && result.length);
  const last = hasResult ? result[result.length - 1] : null;

  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/goal-simulator"
      />

      <div className="py-6 grid gap-6 fm-mobile-full">
        {/* ===== 입력 Form ===== */}
        <div className="card">
          <GoalForm
            onSubmit={onSubmit}
            locale={locale}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        </div>

        {/* ===== 결과 ===== */}
        {hasResult && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="stat">
                <div className="stat-title">{t.fv}</div>
                <div className="stat-value">{summaryFmt(last.valueNet)}</div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.contrib}</div>
                <div className="stat-value">{summaryFmt(last.invested)}</div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.interest}</div>
                <div className="stat-value">
                  {summaryFmt(last.valueNet - last.invested)}
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-2">{t.chartTitle}</h2>
              <GoalChart
                data={result}
                locale={loc}
                currency={currency}
                target={target}
              />
            </div>

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
