// pages/tools/compound-interest.js
import { useMemo, useState, useEffect } from "react";
import SeoHead from "../../_components/SeoHead";
import CTABar from "../../_components/CTABar";
//import { downloadPDF } from "../../_components/PDFGenerator";
import CompoundForm from "../../_components/CompoundForm";
import CompoundChart from "../../_components/CompoundChart";
import CompoundYearTable from "../../_components/CompoundYearTable";
import CompoundCTA from "../../_components/CompoundCTA";
import DragBreakdownChart from "../../_components/DragBreakdownChart";
import GoalEngineCard from "../../_components/GoalEngineCard";
import SensitivityPanel from "../../_components/SensitivityPanel";
import ValueDisplay from "../../_components/ValueDisplay";
import ScenarioPanel from "../../_components/ScenarioPanel";
import TimelineComparePanel from "../../_components/TimelineComparePanel";
import CashFlowLayerChart from "../../_components/CashFlowLayerChart";


import {
  calcCompound,
  calcCompoundNoTaxFee,
  calcSimpleLump,  
} from "../../lib/compound";

import { getInitialLang } from "../../lib/lang";

// FAQ JSON-LD 출력
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function CompoundPage() {

  // PDF 처리 함수 
  //const handleDownloadPDF = () => downloadPDF("pdf-target", "compound-result.pdf");

  const handleDownloadPDF = async () => {
    const { downloadPDF } = await import("../../_components/PDFGenerator");
    downloadPDF("pdf-target", "compound-result.pdf");
  };
  // ----------------------------
  // 언어 상태
  // ----------------------------
  const [lang, setLang] = useState("ko");

  const locale = lang === "ko" ? "ko" : "en";
  const numberLocale = lang === "ko" ? "ko-KR" : "en-US";

  // ----------------------------
  // 통화 단위 선택
  // ----------------------------
  const [currency, setCurrency] = useState("KRW");

  // ----------------------------
  // 계산 결과 상태
  // ----------------------------
  const [result, setResult] = useState(null);          // 세후 복리식
  const [idealResult, setIdealResult] = useState(null); // 세전 복리식
  const [simpleResult, setSimpleResult] = useState(null);

  const [taxRatePercentState, setTaxRatePercentState] = useState(15.4);
  const [feeRatePercentState, setFeeRatePercentState] = useState(0.5);

  const [invest, setInvest] = useState({
    principal: 0,
    monthly: 0,
    years: 0,
  });

  const [simpleInvest, setSimpleInvest] = useState({
    principal: 0,
    years: 0,
  });

  // ----------------------------
  // 초기 언어 설정 (전역 이벤트)
  // ----------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initial = getInitialLang();
    setLang(initial);
    setCurrency(initial === "ko" ? "KRW" : "USD");

    const handler = (e) => {
      const next = e.detail || "ko";
      setLang(next);
      setCurrency(next === "ko" ? "KRW" : "USD");
    };

    window.addEventListener("fm_lang_change", handler);
    return () => window.removeEventListener("fm_lang_change", handler);
  }, []);

  // ----------------------------
  // 텍스트 리소스
  // ----------------------------
  const t = useMemo(
    () => ({
      title: locale === "ko" ? "복리 계산기" : "Compound Interest Calculator",
      desc:
        locale === "ko"
          ? "초기 투자금·월 적립금·수익률·기간으로 미래가치를 계산하세요!"
          : "Calculate future value using your principal, monthly contribution, return, and time horizon!",

      // Summary 카드
      fv: locale === "ko" ? "세후 총자산" : "Net Future Value",
      fvIdeal: locale === "ko" ? "세전 기준 미래가치" : "Ideal (No Tax/Fee)",
      drag: locale === "ko" ? "세금·수수료 영향" : "Tax/Fee Drag",
      ratio: locale === "ko" ? "세후/세전 비율" : "Net / Ideal Ratio",
      contrib: locale === "ko" ? "총 납입액" : "Total Contribution",
      interest: locale === "ko" ? "세후 이자" : "Net Interest",

      chartTitle: locale === "ko" ? "자산 성장 차트" : "Growth Chart",

      yearlyCompoundKo: "연간 요약 테이블 (월 적립 복리식)",
      yearlyCompoundEn: "Yearly Summary (Compound / Monthly)",
      yearlySimpleKo: "연간 요약 테이블 (단리식 일시불)",
      yearlySimpleEn: "Yearly Summary (Simple / Lump-sum)",

      compareTitle: locale === "ko" ? "복리식 vs 단리식 비교" : "Compound vs Simple",
      planCompound: locale === "ko" ? "복리식(월 적립)" : "Compound (Monthly)",
      planSimple: locale === "ko" ? "단리식(일시불)" : "Simple (Lump-sum)",

      // FAQ
      faqTitle: locale === "ko" ? "복리 계산기 FAQ" : "FAQ",
    }),
    [locale]
  );
  
  const safe = (obj, key) => (obj && Number(obj[key])) || 0;

  // ----------------------------
  // FAQ 데이터 및 JSON-LD
  // ----------------------------
  const faqItems = useMemo(
  () =>
    locale === "ko"
      ? [
          {
            q: "세전/세후 계산 차이는 무엇인가요?",
            a: "세전 계산은 세금과 수수료가 없다고 가정한 이상적인 미래가치이며, 세후 계산은 실제 투자에서 발생하는 세금·수수료를 모두 반영한 현실적인 미래가치입니다.",
          },
          {
            q: "계산 금액 단위는 어떻게 되나요?",
            a: "KRW를 선택하면 만원 단위로 입력하며, USD는 실제 달러 금액으로 입력합니다.",
          },
          {
            q: "세금과 수수료는 어떻게 반영되나요?",
            a: "이자 소득세 15.4%, 연간 수수료 0.5%를 기본값으로 반영합니다. 사용자가 원하면 값을 수정할 수 있습니다.",
          },
          {
            q: "월복리와 연복리의 차이는 무엇인가요?",
            a: "월단위로 계산하면 더 자주 복리 효과를 누릴 수 있어 같은 연 수익률이라도 월복리가 더 높은 미래가치를 만들게 됩니다.",
          },
          {
            q: "목표 달성 엔진은 어떻게 계산되나요?",
            a: "목표 금액을 기준으로 세 가지 값을 역산합니다.\n1) 필요 월 투자금: 초기 투자금·수익률·기간을 고정하고 월 적립금(PMT)을 역산합니다.\n2) 필요 수익률: 초기 투자금·월 적립금·기간을 유지하고 목표에 맞는 수익률을 수치해석 방식으로 계산합니다.\n3) 필요 초기 투자금: 월 적립금·수익률·기간을 유지한 채 초기 투자금(P)을 역산합니다.",
          },
          {
            q: "자산 성장 민감도 분석의 그래프가 항상 비슷한 모양으로 보이는 이유는 무엇인가요?",
            a: "수익률 변화는 미래가치에 큰 폭의 영향을 주지만 수수료·세금 변화는 상대적으로 작게 영향을 미칩니다. 따라서 y축 스케일이 크게 설정되면 수수료·세금 변화는 거의 평평하게 보일 수 있습니다. 이는 정상적인 계산 결과입니다.",
          },
          {
            q: "자산 성장 민감도 분석의 y축은 어떻게 결정되나요?",
            a: "수익률 변동으로 인한 최대 미래가치를 기준으로 자동 스케일링됩니다. 그 결과 세금·수수료 변화의 값이 상대적으로 작으면 평평하게 보일 수 있습니다.",
          },
        ]
      : [
          {
            q: "What is the difference between net and ideal results?",
            a: "Ideal results ignore taxes and fees, while net results reflect the actual performance after applying tax and fee deductions.",
          },
          {
            q: "How should I input amounts?",
            a: "KRW inputs use 10,000 KRW units (e.g., 1000 → 10,000,000 KRW). USD uses real dollar values.",
          },
          {
            q: "How are taxes and fees applied?",
            a: "The default settings include a 15.4% tax on interest income and a 0.5% annual fee rate. You may modify these values.",
          },
          {
            q: "What is the difference between monthly compounding and annual compounding?",
            a: "Monthly compounding applies interest more frequently, resulting in a higher future value compared to annual compounding with the same annual rate.",
          },
          {
            q: "How does the Goal Engine calculate required monthly investment, rate, and initial capital?",
            a: "The Goal Engine reverses one variable while keeping the others fixed:\n1) Required monthly investment: Solves PMT while principal, rate, and period are fixed.\n2) Required rate of return: Keeps principal and PMT fixed and finds the rate via numerical methods.\n3) Required initial capital: Solves for principal while keeping PMT and rate fixed.",
          },
          {
            q: "Why does the sensitivity analysis graph look similar even when input values change?",
            a: "Rate changes produce exponentially large differences, while fee and tax changes affect the outcome much less. This causes fee/tax lines to appear flat when scaled together with rate changes.",
          },
          {
            q: "How is the Y-axis range determined in sensitivity analysis?",
            a: "The Y-axis auto-scales based on the highest projected future value (typically from the positive rate-change scenario). Smaller changes like tax or fee variation may appear flat by comparison.",
          },
        ],
    [locale]
  );


  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    }),
    [faqItems]
  );

  // ----------------------------
  // 계산 처리
  // ----------------------------
  const onSubmit = (form) => {
    const scale = currency === "KRW" ? 10_000 : 1;

    const p = (Number(form.principal) || 0) * scale;
    const m = (Number(form.monthly) || 0) * scale;
    const r = Number(form.annualRate) || 0;
    const y = Number(form.years) || 0;

    const taxRatePercent = Number(form.taxRatePercent ?? 15.4);
    const feeRatePercent = Number(form.feeRatePercent ?? 0.5);

    const baseYear = new Date().getFullYear();

    // 세후(실제) 복리 계산
    const compound = calcCompound({
      principal: p,
      monthly: m,
      years: y,
      annualRate: r,
      compounding: form.compounding,
      taxRatePercent,
      feeRatePercent,
      baseYear,
    });

    // 세전(이상치) 복리 계산
    const ideal = calcCompoundNoTaxFee({
      principal: p,
      monthly: m,
      years: y,
      annualRate: r,
      compounding: form.compounding,
      baseYear,
    });

    const totalInvested = p + m * 12 * y;

    // 단리 계산
    const simple = calcSimpleLump({
      principal: totalInvested,
      annualRate: r,
      years: y,
      taxRatePercent,
      feeRatePercent,
      baseYear,
    });

    setInvest({ principal: p, monthly: m, years: y });
    setResult(compound);
    setIdealResult(ideal);

    setSimpleInvest({ principal: totalInvested, years: y });
    setSimpleResult(simple);

    setTaxRatePercentState(taxRatePercent);
    setFeeRatePercentState(feeRatePercent);
  };

  const hasResult = !!result && !!idealResult;

  // ----------------------------
  // Drag Breakdown 계산
  // ----------------------------
  const dragBreakdown = useMemo(() => {
    if (!result || !idealResult) return null;

    const rowsNet = result.yearSummary;
    const rowsIdeal = idealResult.yearSummary;

    if (!rowsNet.length || !rowsIdeal.length) return null;

    const lastNet = rowsNet[rowsNet.length - 1];
    const lastIdeal = rowsIdeal[rowsIdeal.length - 1];

    const idealFV = lastIdeal.closingBalanceNet;
    const netFV = lastNet.closingBalanceNet;

    const taxDrag = lastNet.cumulativeTax;
    const feeDrag = lastNet.cumulativeFee;

    // Compound Loss = 나머지
    const compoundDrag = (idealFV - netFV) - (taxDrag + feeDrag);

    return {
      idealFV,
      netFV,
      totalDrag: idealFV - netFV,
      taxDrag,
      feeDrag,
      compoundDrag,
    };
  }, [result, idealResult]);


  // ----------------------------
  // Summary 값 계산
  // ----------------------------
  const fvNet = safe(result, "futureValueNet");
  const fvIdeal = safe(idealResult, "futureValueNet");

  const totalContrib = safe(result, "totalContribution");
  const totalInterestNet = safe(result, "totalInterestNet");

  const drag = fvIdeal - fvNet;
  const ratio = fvIdeal > 0 ? (fvNet / fvIdeal) * 100 : 100;

  // ----------------------------
  // 렌더링
  // ----------------------------
  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/compound-interest"
        image="/og/compound.jpg"
      />

      <JsonLd data={faqJsonLd} />

      <div className="py-6 grid gap-6 fm-mobile-full">
        {/* 타이틀 */}
        <h1 className="text-xl sm:text-2xl font-bold">{t.title}</h1>

        {/* 설명 카드 */}
        <div className="card w-full">
          <p className="text-sm text-slate-600">
            {locale === "ko"
              ? "세전·세후, 복리 vs 단리, 세금·수수료 영향까지 한 번에 비교할 수 있는 고급 복리 계산기입니다!"
              : "A full-featured compound calculator comparing net vs ideal, compound vs simple, and tax impact!"}
          </p>
        </div>

        {/* Form */}
        <div className="card">
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
            <div id="pdf-target" className="grid gap-6">
              {/* Summary (확장 버전) */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="stat">
                  <div className="stat-title">{t.fv}</div>                  
                  <div className="stat-value">
                    <ValueDisplay value={fvNet} locale={numberLocale} currency={currency} />
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-title">{t.fvIdeal}</div>                  
                  <div className="stat-value">
                    <ValueDisplay value={fvIdeal} locale={numberLocale} currency={currency} />
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-title">{t.drag}</div>                  
                  <div className="stat-value">
                    <ValueDisplay value={drag} locale={numberLocale} currency={currency} />
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-title">{t.ratio}</div>
                  <div className="stat-value">{ratio.toFixed(1)}%</div>
                </div>
              </div>

              {/* Chart */}
              <div className="card">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-semibold">{t.chartTitle}</h2>
                </div>

                <CompoundChart
                  data={result}
                  lumpData={simpleResult}
                  idealData={idealResult}
                  locale={numberLocale}
                  currency={currency}
                  principal={invest.principal}
                  monthly={invest.monthly}
                />
              </div>

              {/* ==== 복리 시뮬레이션 (3가지 시나리오) ==== */}
              <ScenarioPanel
                principal={invest.principal}
                monthly={invest.monthly}
                years={invest.years}
                annualRate={result.annualRate}
                compounding={result.compounding}
                taxRatePercent={taxRatePercentState}
                feeRatePercent={feeRatePercentState}
                baseYear={result.baseYear}
                locale={numberLocale}
                currency={currency}
              />

              {/* ==== 연도별 현금흐름 차트 (Cash Flow Layer) ==== */}
              <CashFlowLayerChart
                yearSummary={result.yearSummary}
                numberLocale={numberLocale}
                currency={currency}
              />

              {/* ==== 멀티 타임라인(저장/비교) ==== */}
              <TimelineComparePanel
                numberLocale={numberLocale}
                currency={currency}
                currentScenario={{
                  currency,
                  numberLocale,
                  inputs: {
                    currency,
                    principal: invest.principal,
                    monthly: invest.monthly,
                    years: invest.years,
                    annualRate: result.annualRate,
                    compounding: result.compounding,
                    taxRatePercent: taxRatePercentState,
                    feeRatePercent: feeRatePercentState,
                  },
                  summary: {
                    fvNet,
                    fvIdeal,
                    drag,
                    ratio,
                    totalContrib,
                    totalInterestNet,
                  },
                  series: {
                    years: (result.yearSummary || []).map((r) => r.year),
                    net: (result.yearSummary || []).map((r) => r.closingBalanceNet),
                  },
                }}
              />

              {/* Yearly Table — 복리식 */}
              <CompoundYearTable
                result={result}

                locale={numberLocale}
                currency={currency}
                principal={invest.principal}
                monthly={invest.monthly}
                title={
                  locale === "ko"
                    ? t.yearlyCompoundKo
                    : t.yearlyCompoundEn
                }
              />

              {/* Yearly Table — 단리식 */}
              <CompoundYearTable
                result={simpleResult}
                locale={numberLocale}
                currency={currency}
                principal={simpleInvest.principal}
                monthly={0}
                title={
                  locale === "ko"
                    ? t.yearlySimpleKo
                    : t.yearlySimpleEn
                }
              />

              {/* 비교 Summary */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-3">
                  {t.compareTitle}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* 복리식 */}
                  <div className="border rounded-xl p-4">
                    <h3 className="font-semibold mb-2">{t.planCompound}</h3>
                    <ul className="text-sm space-y-1">                      
                      <li>
                        {t.contrib}:{" "}
                        <ValueDisplay value={totalContrib} locale={numberLocale} currency={currency} />
                      </li>                      
                      <li>
                        {t.fv}:{" "}
                        <ValueDisplay value={fvNet} locale={numberLocale} currency={currency} />
                      </li>                      
                      <li>
                        {t.interest}:{" "}
                        <ValueDisplay value={totalInterestNet} locale={numberLocale} currency={currency} />
                      </li>
                    </ul>
                  </div>

                  {/* 단리식 */}
                  <div className="border rounded-xl p-4">
                    <h3 className="font-semibold mb-2">{t.planSimple}</h3>
                    <ul className="text-sm space-y-1">
                      <li>
                        {t.contrib}:{" "}
                        <ValueDisplay
                          value={safe(simpleResult, "totalContribution")}
                          locale={numberLocale}
                          currency={currency}
                        />
                      </li>
                      <li>
                        {t.fv}:{" "}
                        <ValueDisplay
                          value={safe(simpleResult, "futureValueNet")}
                          locale={numberLocale}
                          currency={currency}
                        />
                      </li>
                      <li>
                        {t.interest}:{" "}
                        <ValueDisplay
                          value={safe(simpleResult, "totalInterestNet")}
                          locale={numberLocale}
                          currency={currency}
                        />
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Drag Breakdown Card */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-2">
                  {locale === 'ko' ? '손실요인 분해(Drag Breakdown)' : 'Drag Decomposition'}
                </h2>

                <p className="text-sm text-slate-600 mb-3">
                  {locale === 'ko'
                    ? '세금, 수수료, 복리효과 상실이 미래가치에 끼친 영향을 분해해 보여줍니다.'
                    : 'Breakdown of how taxes, fees, and lost compounding affected your final value.'}
                </p>

                <DragBreakdownChart
                  data={dragBreakdown}
                  locale={numberLocale}
                  currency={currency}
                />
              </div> 

              {/* Goal Engine (역산 목표 달성 엔진) */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-2">
                  {locale === "ko" ? "목표 달성 엔진" : "Future Goal Engine"}
                </h2>

                <p className="text-sm text-slate-600 mb-3">
                  {locale === "ko"
                    ? "목표 자산까지 필요한 월 투자금, 필요한 수익률, 필요한 초기 투자금을 역산해줍니다."
                    : "Reverse-calculate the monthly investment, required return, or initial principal needed to reach your target."}
                </p>
                
                <GoalEngineCard
                  locale={locale}
                  currency={currency}
                  result={result}
                  idealResult={idealResult}
                  invest={invest}
                  taxRatePercent={taxRatePercentState}
                  feeRatePercent={feeRatePercentState}
                />
              </div>

              {/* ==== Sensitivity Analysis (자산 성장 민감도 분석) ==== */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-2">
                  {locale === "ko" ? "자산 성장 민감도 분석" : "Growth Sensitivity Analysis"}
                </h2>

                <p className="text-sm text-slate-600 mb-3">
                  {locale === "ko"
                    ? "수익률·세금·수수료 변동이 미래 자산에 어떤 영향을 주는지 즉시 확인해보세요."
                    : "See how changes in rate, tax, and fees affect your future value instantly."}
                </p>

                <SensitivityPanel
                  principal={invest.principal}
                  monthly={invest.monthly}
                  annualRate={result.annualRate}
                  years={invest.years}
                  taxRatePercent={result.taxRate * 100}
                  feeRatePercent={result.feeRate * 100}
                  locale={numberLocale}
                  currency={currency}
                />
              </div>              

              {/* FAQ */}
              <div className="card">
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

              {/* CTA */}
              <CompoundCTA
                locale={locale}
                onDownloadPDF={handleDownloadPDF}
              />          
            </div> 
            
             {/* 하단 고정 CTA Bar */}
            <CTABar
              locale={locale}
              onDownloadPDF={handleDownloadPDF}
              onShare={() => {}}
            />
          </>
        )}        
      </div>    
    </>
  );
}
