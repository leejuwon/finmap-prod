// pages/tools/goal-simulator.js
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '../../_components/SeoHead';
import GoalForm from '../../_components/GoalForm';
import GoalChart from '../../_components/GoalChart';
import GoalYearTable from '../../_components/GoalYearTable';
import { numberFmt } from '../../lib/compound';
import ToolCta from "../../_components/ToolCta";

// ===== JSON-LD 출력용 공통 컴포넌트 =====
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ===== 시뮬레이터 계산 로직 =====
function simulateGoalPath({
  current,
  monthly,
  annualRate,
  years,
  compounding = 'monthly',
  // 🔥 복리 계산기와 동일하게 세율/수수료율 퍼센트로 받기
  taxRatePercent = 15.4, // 이자소득세 기본 15.4%
  feeRatePercent = 0.5,  // 연 수수료 기본 0.5%
}) {
  const months = Math.max(1, Math.floor(years * 12));
  const rYear = (Number(annualRate) || 0) / 100;

  // 🔥 퍼센트 → 소수로 변환 + 0 미만 방지
  const taxRate = Math.max(0, (Number(taxRatePercent) || 0) / 100);
  const feeRate = Math.max(0, (Number(feeRatePercent) || 0) / 100);

  // 세금/수수료 감안한 "순 연수익률" 근사
  let netYear = rYear;
  netYear *= 1 - taxRate;  
  netYear -= feeRate;
  
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
  const router = useRouter();

  // ✅ URL(라우터) 기준으로 언어 결정
  const locale = router.locale === 'en' ? 'en' : 'ko';
  const lang = locale; // ✅ ToolCta 호환용 alias

  // (선택) 기존 state가 필요하면 locale에서 파생
  const [currency, setCurrency] = useState(locale === 'ko' ? 'KRW' : 'USD');
  const [result, setResult] = useState(null);
  const [target, setTarget] = useState(0);

  const loc = locale === 'ko' ? 'ko-KR' : 'en-US';

   // ✅ 라우터 locale이 바뀌면 통화도 동기화 (원하면 유지 로직으로 변경 가능)
  useEffect(() => {
    setCurrency(locale === 'ko' ? 'KRW' : 'USD');
  }, [locale]);  

  // ===== 텍스트 리소스 =====
  const t = useMemo(
    () => ({
      title:
        locale === 'ko'
          ? '목표 자산 시뮬레이터'
          : 'Goal Asset Simulator',
      desc:
        locale === 'ko'
          ? '현재 자산·월 적립금·수익률·기간·세금·수수료를 바탕으로 목표 자산까지의 자산 성장 경로를 시뮬레이션해 보세요.'
          : 'Simulate your asset growth toward a target amount based on your current assets, monthly savings, expected return, time horizon, tax and fee settings.',
      chartTitle:
        locale === 'ko'
          ? '목표 자산까지 자산 경로'
          : 'Path to target assets',
      fv:
        locale === 'ko'
          ? '마지막 해 세후 자산'
          : 'Final net assets',
      contrib:
        locale === 'ko'
          ? '누적 투자금'
          : 'Total invested',
      interest:
        locale === 'ko'
          ? '세후 수익'
          : 'Net gain',

      // 🔹 상단 설명 섹션
      introTitle:
        locale === 'ko'
          ? '목표 자산 시뮬레이터로 무엇을 할 수 있나요?'
          : 'What can this goal simulator do?',
      introLead:
        locale === 'ko'
          ? '“언제까지 얼마를 모으고 싶은지” 목표를 세우고, 지금 자산·적립액·수익률을 기준으로 경로를 그려볼 수 있습니다.'
          : 'Set a target amount and deadline, then see how your current assets, monthly savings and expected return could get you there.',
      introBullet1:
        locale === 'ko'
          ? '현재 자산 + 매달 적립금 + 예상 수익률·기간을 기반으로 자산 성장 경로를 연도별로 시뮬레이션합니다.'
          : 'Simulate your asset path year by year based on current assets, monthly contributions, expected return and time horizon.',
      introBullet2:
        locale === 'ko'
          ? '세금·수수료를 적용했을 때와 적용하지 않았을 때의 차이를 세전/세후 자산으로 비교할 수 있습니다.'
          : 'Compare gross vs net results to see how taxes and fees affect your path.',
      introBullet3:
        locale === 'ko'
          ? '목표 자산 대비 부족/초과 정도를 차트와 표로 확인하며, 적립액이나 기간을 조정해 보는 데 활용할 수 있습니다.'
          : 'Use the chart and table to see whether you fall short or overshoot your goal and experiment with monthly amount or years.',

      // 🔹 FAQ 섹션 제목
      faqTitle:
        locale === 'ko'
          ? '목표 자산 시뮬레이터 자주 묻는 질문(FAQ)'
          : 'Goal asset simulator FAQ',
    }),
    [locale]
  );

  const summaryFmt = (v) => numberFmt(loc, currency, v || 0);

  // ===== FAQ 데이터 (UI + JSON-LD 공용) =====
  const faqItems = useMemo(
    () =>
      locale === 'ko'
        ? [
            {
              q: '입력 금액은 어떤 단위로 넣어야 하나요?',
              a: '통화가 원화(KRW)일 때는 만원 단위로 입력합니다. 예를 들어 3,000만원은 3000으로 적습니다. 통화를 USD로 변경하면 실제 달러 금액 그대로 입력하면 됩니다.',
            },
            {
              q: '목표 자산 금액은 세전 기준인가요, 세후 기준인가요?',
              a: '이 시뮬레이터에서 목표 자산은 “세후 자산 기준”으로 보는 것을 추천합니다. 세금과 수수료 옵션을 켜고, 필요하다면 세율·수수료율(%)을 조정한 뒤 세후 기준 자산 경로를 보는 것이 직관적입니다.',
            },
            {
              q: '세금·수수료 옵션은 어떻게 적용되나요?',
              a: '세금 적용을 켜면 기본값으로 이자소득세 15.4%를, 수수료 적용을 켜면 기본값으로 연 0.5% 수준의 보수/수수료를 사용합니다. 세율·수수료율 입력창에서 0%~원하는 값으로 직접 조정할 수 있습니다. 실제 금융상품의 세율·수수료와는 다를 수 있으니 참고용으로만 사용하세요.',
            },
            {
              q: '목표 자산이 너무 크거나 기간이 너무 짧으면 어떻게 보나요?',
              a: '예상 수익률 대비 목표가 지나치게 크거나 기간이 매우 짧다면 그래프 상에서 목표선을 크게 밑돌 수 있습니다. 이때는 “월 적립금 증가”, “투자 기간 연장”, “수익률 상향(현실 범위 내)” 같은 조합을 조정해가며 현실적인 계획을 찾아보는 용도로 활용하세요.',
            },
            {
              q: '실제 투자 결과와 시뮬레이션 결과가 다른 이유는 무엇인가요?',
              a: '시뮬레이션은 일정한 연 수익률과 매달 동일한 적립금, 단순한 세금·수수료 모델을 가정합니다. 실제 투자는 시장 변동성, 환율, 세법 변화, 상품 구조 등에 따라 달라지므로, 계획을 세우는 참고 도구로만 활용하는 것이 좋습니다.',
            },
          ]
        : [
            {
              q: 'What unit should I use for the input amounts?',
              a: 'If the currency is KRW, use units of 10,000 KRW. For example, 30M KRW should be entered as 3000. If you switch to USD, enter your actual dollar amounts.',
            },
            {
              q: 'Is the target amount before or after tax?',
              a: 'We recommend thinking of your target as an “after-tax” number. When tax and fee options are enabled (and tax/fee rates are set), the simulator computes net values, so it is more intuitive to set your goal based on net assets.',
            },
            {
              q: 'How are tax and fees applied in the simulation?',
              a: 'With tax enabled, we use a default 15.4% interest tax; with fees enabled, we use a default 0.5% annual cost. You can override both percentages in the form. These are simplified assumptions and may not match real products exactly.',
            },
            {
              q: 'What if my target is very high or too aggressive?',
              a: 'If your target is too ambitious for the chosen annual return and time horizon, the net asset line may stay far below the target line. In that case, try adjusting your monthly contribution, extending the horizon, or slightly increasing the assumed return (within realistic bounds).',
            },
            {
              q: 'Why might real investment results differ from this simulator?',
              a: 'The simulator assumes a constant return, fixed monthly contributions, and simplified tax/fee rules. Real-world returns fluctuate, and tax regulations and product structures can change, so regard this tool as a planning aid rather than a prediction.',
            },
          ],
    [locale]
  );

  // ===== FAQ JSON-LD (FAQPage) =====
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

  // ===== Form Submit =====
  const onSubmit = (form) => {
    // 통화 기준 스케일링 (만원 vs 원 / USD 그대로)
    const scale = currency === 'KRW' ? 10_000 : 1;

    const current = (Number(form.current) || 0) * scale;
    const monthly = (Number(form.monthly) || 0) * scale;
    const r = Number(form.annualRate) || 0;
    const y = Number(form.years) || 0;
    const targetValue = (Number(form.target) || 0) * scale;

    // 🔥 사용자가 입력한 세율/수수료율 (%)
    const taxRatePercent =
      form.taxRatePercent !== undefined &&
      form.taxRatePercent !== null &&
      form.taxRatePercent !== ''
        ? Number(form.taxRatePercent)
        : 0;//15.4;

    const feeRatePercent =
      form.feeRatePercent !== undefined &&
      form.feeRatePercent !== null &&
      form.feeRatePercent !== ''
        ? Number(form.feeRatePercent)
        : 0;//0.5;

    const rows = simulateGoalPath({
      current,
      monthly,
      annualRate: r,
      years: y,
      compounding: form.compounding,
      taxRatePercent,
      feeRatePercent,
    });

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
        locale={locale}   // ✅ 이게 핵심 (canonical/hreflang 정합성)
      />
      {/* FAQ JSON-LD 삽입 (SEO용) */}
      <JsonLd data={faqJsonLd} />

      <div className="py-6 grid gap-6 fm-mobile-full">
        {/* 제목 */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">{t.title}</h1>
        </div>

        {/* 🔹 상단 설명 카드 */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">{t.introTitle}</h2>
          <p className="text-sm text-slate-600 mb-2">{t.introLead}</p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
            <li>{t.introBullet1}</li>
            <li>{t.introBullet2}</li>
            <li>{t.introBullet3}</li>
          </ul>
        </div>

        {/* 입력 Form */}
        <div className="card">
          <GoalForm
            onSubmit={onSubmit}
            locale={locale}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
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

            {/* 연간 요약 테이블 */}
            <GoalYearTable
              rows={result}
              locale={loc}
              currency={currency}
              target={target}
            />

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

            <div className="tool-cta-section">
              <ToolCta lang={lang} type="fire" />
              <ToolCta lang={lang} type="compound" />
              <ToolCta lang={lang} type="cagr" />
              <ToolCta lang={lang} type="dca" />
            </div>
          </>
        )}
      </div>
    </>
  );
}
