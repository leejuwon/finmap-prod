// pages/tools/compound-interest.js
import { useMemo, useState, useEffect } from "react";
import SeoHead from "../../_components/SeoHead";
import CTABar from "../../_components/CTABar";
//import { downloadPDF } from "../../_components/PDFGenerator";
import CompoundForm from "../../_components/CompoundForm";
import CompoundChart from "../../_components/CompoundChart";
import CompoundYearTable from "../../_components/CompoundYearTable";
import CompoundCTA from "../../_components/CompoundCTA";

import {
  calcCompound,
  calcCompoundNoTaxFee,
  calcSimpleLump,
  numberFmt,
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

  const summaryFmt = (v) => numberFmt(numberLocale, currency, v || 0);
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
              q: "월복리/연복리 차이는 무엇인가요?",
              a: "월단위로 계산하면 더 자주 복리 효과를 누릴 수 있어 같은 연 수익률일 때 더 높은 미래가치가 나옵니다.",
            },
          ]
        : [
            {
              q: "What is the difference between net and ideal results?",
              a: "Ideal ignores tax and fees, while net reflects the actual result including those costs.",
            },
            {
              q: "How do I input amounts?",
              a: "KRW inputs use ×10k units (e.g., 1000 → 10,000,000 KRW). USD uses actual dollar values.",
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
  };

  const hasResult = !!result && !!idealResult;

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
                  <div className="stat-value">{summaryFmt(fvNet)}</div>
                </div>

                <div className="stat">
                  <div className="stat-title">{t.fvIdeal}</div>
                  <div className="stat-value">{summaryFmt(fvIdeal)}</div>
                </div>

                <div className="stat">
                  <div className="stat-title">{t.drag}</div>
                  <div className="stat-value">{summaryFmt(drag)}</div>
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
                        {t.contrib}: {summaryFmt(totalContrib)}
                      </li>
                      <li>
                        {t.fv}: {summaryFmt(fvNet)}
                      </li>
                      <li>
                        {t.interest}: {summaryFmt(totalInterestNet)}
                      </li>
                    </ul>
                  </div>

                  {/* 단리식 */}
                  <div className="border rounded-xl p-4">
                    <h3 className="font-semibold mb-2">{t.planSimple}</h3>
                    <ul className="text-sm space-y-1">
                      <li>
                        {t.contrib}: {summaryFmt(safe(simpleResult, "totalContribution"))}
                      </li>
                      <li>
                        {t.fv}: {summaryFmt(safe(simpleResult, "futureValueNet"))}
                      </li>
                      <li>
                        {t.interest}: {summaryFmt(safe(simpleResult, "totalInterestNet"))}
                      </li>
                    </ul>
                  </div>
                </div>
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
