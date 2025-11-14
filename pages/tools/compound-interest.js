// pages/tools/compound-interest.js
import { useMemo, useState, useEffect } from 'react';
import SeoHead from '../../_components/SeoHead';
import CompoundForm from '../../_components/CompoundForm';
import CompoundChart from '../../_components/CompoundChart';
import CompoundYearTable from '../../_components/CompoundYearTable';
import {
  calcCompound,
  numberFmt,
  getUnitOptions,
  pickUnit,
} from '../../lib/compound';

export default function CompoundPage() {
  const [locale, setLocale] = useState('ko');            // 'ko' | 'en'
  const [currency, setCurrency] = useState('KRW');       // 'KRW' | 'USD'
  const [result, setResult] = useState(null);            // 계산 결과
  const [unitId, setUnitId] = useState(null);            // 선택한 단위 ID

  const loc = locale === 'ko' ? 'ko-KR' : 'en-US';

  // 다국어 텍스트
  const t = useMemo(() => ({
    title: locale === 'ko' ? '복리 계산기' : 'Compound Interest Calculator',
    desc:
      locale === 'ko'
        ? '초기 투자금·월 적립금·수익률·기간으로 미래가치를 계산하세요.'
        : 'Calculate future value with principal, monthly contribution, rate and term.',
    fv: locale === 'ko' ? '세후 총자산' : 'Net Future Value',
    contrib: locale === 'ko' ? '총 납입액' : 'Total Contribution',
    interest: locale === 'ko' ? '세후 이자 합계' : 'Net Interest',
    tax: locale === 'ko' ? '누적 세금' : 'Total Tax',
    switch: locale === 'ko' ? 'EN으로' : '한국어로',
    chartTitle: locale === 'ko' ? '자산 성장 차트' : 'Asset Growth Chart',
    chartUnitLabel: locale === 'ko' ? '표시 단위' : 'Display Unit',
  }), [locale]);

  // 통화 + 로케일에 따른 단위 옵션
  const unitOptions = useMemo(
    () => getUnitOptions(currency, loc),
    [currency, loc]
  );

  // 실제 선택된 단위 객체
  const unit = useMemo(
    () => pickUnit(unitOptions, unitId),
    [unitOptions, unitId]
  );

  // 처음 렌더링 시 / 통화 변경 시 기본 단위 자동 선택
  useEffect(() => {
    if (!unitOptions.length) return;
    const def = unitOptions.find((o) => o.default) || unitOptions[0];
    setUnitId((prev) => prev || def.id);
  }, [unitOptions]);

  // 폼에서 "계산하기" 눌렀을 때
  const onSubmit = (form) => {
    const r = calcCompound({
      principal: form.principal,
      monthly: form.monthly,
      annualRate: form.annualRate,
      years: form.years,
      compounding: form.compounding, // 월복리/연복리 등 (있다면)
      taxMode: form.taxMode,         // 세금 적용/미적용 (있다면)
      feeMode: form.feeMode,         // 수수료 적용/미적용 (있다면)
      baseYear: new Date().getFullYear(),
    });

    setCurrency(form.currency);
    setResult(r);
  };

  // ✅ Summary 값(세후 총자산/총 납입액/세후 이자 합계) 계산
  const summary = useMemo(() => {
    if (!result) {
      return {
        fvNet: 0,
        totalContrib: 0,
        interestNet: 0,
      };
    }

    const rows = Array.isArray(result.yearSummary) ? result.yearSummary : [];

    // 1) 총 납입액
    const totalContrib =
      result.totalContribution ??
      rows.reduce(
        (sum, row) => sum + (Number(row.contributionYear) || 0),
        0
      );

    // 2) 세후 총자산
    let fvNet =
      result.netFutureValue ??
      result.futureValueNet ??
      result.futureValue ??
      0;

    if ((!fvNet || fvNet <= 0) && rows.length > 0) {
      const last = rows[rows.length - 1];
      if (last && last.closingBalanceNet != null) {
        fvNet = Number(last.closingBalanceNet) || 0;
      }
    }

    // 3) 세후 이자 합계
    let interestNet =
      result.netTotalInterest != null
        ? Number(result.netTotalInterest) || 0
        : result.totalInterestNet != null
        ? Number(result.totalInterestNet) || 0
        : fvNet - totalContrib;

    if (interestNet < 0) interestNet = 0;

    return {
      fvNet,
      totalContrib,
      interestNet,
    };
  }, [result]);

  const summaryFmt = (v) => numberFmt(loc, currency, v || 0);

  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/compound-interest"
        image="/og/compound.jpg"
      />

      <div className="container py-6 grid gap-6">
        {/* 헤더 + 언어 전환 */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <button
            type="button"
            className="btn-secondary ml-auto"
            onClick={() => setLocale((prev) => (prev === 'ko' ? 'en' : 'ko'))}
          >
            {t.switch}
          </button>
        </div>

        {/* 입력폼 */}
        <div className="card">
          <CompoundForm onSubmit={onSubmit} locale={locale} />
        </div>

        {/* 결과 영역 */}
        {result && unit && (
          <>
            {/* ✅ 상단 Summary 카드 3개 */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="stat">
                <div className="stat-title">{t.fv}</div>
                <div className="stat-value">
                  {summaryFmt(summary.fvNet)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.contrib}</div>
                <div className="stat-value">
                  {summaryFmt(summary.totalContrib)}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">{t.interest}</div>
                <div className="stat-value">
                  {summaryFmt(summary.interestNet)}
                </div>
              </div>
            </div>

            {/* 차트 + 단위 선택 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-semibold">{t.chartTitle}</h2>
                <span className="ml-auto text-xs text-slate-500">
                  {locale === 'ko'
                    ? `단위: ${unit.unitText}`
                    : `Unit: ${unit.unitText}`}
                </span>
                <label className="flex items-center gap-2 text-xs">
                  <span>{t.chartUnitLabel}</span>
                  <select
                    className="select"
                    value={unitId || ''}
                    onChange={(e) => setUnitId(e.target.value)}
                  >
                    {unitOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <CompoundChart data={result} locale={loc} unit={unit} />
            </div>

            {/* 연간 요약 테이블 */}
            <CompoundYearTable
              result={result}
              locale={loc}
              currency={currency}
              unit={unit}
            />
          </>
        )}
      </div>
    </>
  );
}
