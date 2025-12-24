// pages/tools/goal-simulator.js
import { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from "next/link";
import SeoHead from '../../_components/SeoHead';
import CTABar from "../../_components/CTABar";
import CompoundCTA from "../../_components/CompoundCTA";
import GoalForm from '../../_components/GoalForm';
import GoalChart from '../../_components/GoalChart';
import GoalYearTable from '../../_components/GoalYearTable';
import { numberFmt } from '../../lib/compound';
import ToolCta from "../../_components/ToolCta";
import { shareKakao, shareWeb, shareNaver, copyUrl } from "../../utils/share";

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
  // ✅ Premium
  inflationPercent = 0,         // 연 인플레이션(%)
  contribGrowthPercent = 0,     // 월 적립금 연 증가율(%)
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
  // ✅ Premium: 인플레이션/적립금 증가율(연 %) → 월 복리화
  const inflYear = (Number(inflationPercent) || 0) / 100;
  const inflMonth = compounding === 'yearly'
    ? Math.pow(1 + inflYear, 1 / 12) - 1
    : inflYear / 12;

  const gYear = (Number(contribGrowthPercent) || 0) / 100;
  const gMonth = compounding === 'yearly'
    ? Math.pow(1 + gYear, 1 / 12) - 1
    : gYear / 12;

  let invested = Number(current) || 0;
  let valueGross = invested;
  let valueNet = invested;

  const rows = [];

  for (let m = 1; m <= months; m++) {
    //invested += monthly;

    //valueGross = (valueGross + monthly) * (1 + grossMonth);
    //valueNet = (valueNet + monthly) * (1 + netMonth);
    // ✅ Premium: 월 적립금 성장 반영
    const monthlyNow = (Number(monthly) || 0) * Math.pow(1 + gMonth, m - 1);
    invested += monthlyNow;

    valueGross = (valueGross + monthlyNow) * (1 + grossMonth);
    valueNet = (valueNet + monthlyNow) * (1 + netMonth);

    // ✅ Premium: 실질가치(인플레이션 디플레이트)
    const deflator = Math.pow(1 + inflMonth, m);
    const valueGrossReal = deflator > 0 ? (valueGross / deflator) : valueGross;
    const valueNetReal = deflator > 0 ? (valueNet / deflator) : valueNet;
    const investedReal = deflator > 0 ? (invested / deflator) : invested;
 

    if (m % 12 === 0 || m === months) {
      //const year = Math.ceil(m / 12);
      //rows.push({ year, invested, valueGross, valueNet });
      const year = Math.ceil(m / 12);
      rows.push({
        year,
        invested,
        valueGross,
        valueNet,
        investedReal,
        valueGrossReal,
        valueNetReal,
      });
    }
  }

  return rows;
}


// =========================
// ✅ Premium: 역산(필요 월 적립금)
// - 현재 가정(기간/수익률/세금/수수료/인플레/적립증가/복리주기) 그대로
// - 목표(target)를 달성하는 최소 monthly를 이분탐색으로 찾음
// =========================
function solveRequiredMonthly({
  target,
  current,
  annualRate,
  years,
  compounding,
  taxRatePercent,
  feeRatePercent,
  inflationPercent,
  contribGrowthPercent,
  valueKey = "valueNet",
}) {
  const t = Number(target) || 0;
  if (t <= 0) return null;
  if ((Number(current) || 0) >= t) return 0;

  const fv = (m) => {
    const rows = simulateGoalPath({
      current,
      monthly: m,
      annualRate,
      years,
      compounding,
      taxRatePercent,
      feeRatePercent,
      inflationPercent,
      contribGrowthPercent,
    });
    const last = rows?.[rows.length - 1];
    return Number(last?.[valueKey]) || 0;
  };

  let lo = 0;
  let hi = 1;
  while (fv(hi) < t && hi < 1e12) hi *= 1.8;
  if (hi >= 1e12 && fv(hi) < t) return null;

  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (fv(mid) >= t) hi = mid;
    else lo = mid;
  }
  return hi;
}

// =========================
// ✅ Premium: 역산(필요 기간 years)
// - 월 적립금은 고정하고 years를 이분탐색
// =========================
function solveRequiredYears({
  target,
  current,
  monthly,
  annualRate,
  compounding,
  taxRatePercent,
  feeRatePercent,
  inflationPercent,
  contribGrowthPercent,
  valueKey = "valueNet",
  minYears = 0.5,
  maxYears = 80,
}) {
  const t = Number(target) || 0;
  if (t <= 0) return null;
  if ((Number(current) || 0) >= t) return 0;

  const fv = (y) => {
    const rows = simulateGoalPath({
      current,
      monthly,
      annualRate,
      years: y,
      compounding,
      taxRatePercent,
      feeRatePercent,
      inflationPercent,
      contribGrowthPercent,
    });
    const last = rows?.[rows.length - 1];
    return Number(last?.[valueKey]) || 0;
  };

  if (fv(maxYears) < t) return null;

  let lo = minYears;
  let hi = maxYears;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (fv(mid) >= t) hi = mid;
    else lo = mid;
  }
  return hi;
}

// =========================
// ✅ Premium: 목표 도달 시점(월 단위) 찾기
// - simulateGoalPath와 동일 로직을 월 단위로 돌려서
// - valueKey(valueNet / valueNetReal 등)가 target을 처음 넘는 month를 반환
// =========================
function findFirstReachMonth({
  target,
  current,
  monthly,
  annualRate,
  years,
  compounding = "monthly",
  taxRatePercent = 0,
  feeRatePercent = 0,
  inflationPercent = 0,
  contribGrowthPercent = 0,
  valueKey = "valueNet",
}) {
  const t = Number(target) || 0;
  if (t <= 0) return null;

  const months = Math.max(1, Math.floor((Number(years) || 0) * 12));
  const rYear = (Number(annualRate) || 0) / 100;

  const taxRate = Math.max(0, (Number(taxRatePercent) || 0) / 100);
  const feeRate = Math.max(0, (Number(feeRatePercent) || 0) / 100);

  let netYear = rYear;
  netYear *= 1 - taxRate;
  netYear -= feeRate;
  if (netYear < -0.99) netYear = -0.99;

  const grossMonth =
    compounding === "yearly"
      ? Math.pow(1 + rYear, 1 / 12) - 1
      : rYear / 12;

  const netMonth =
    compounding === "yearly"
      ? Math.pow(1 + netYear, 1 / 12) - 1
      : netYear / 12;

  const inflYear = (Number(inflationPercent) || 0) / 100;
  const inflMonth =
    compounding === "yearly"
      ? Math.pow(1 + inflYear, 1 / 12) - 1
      : inflYear / 12;

  const gYear = (Number(contribGrowthPercent) || 0) / 100;
  const gMonth =
    compounding === "yearly"
      ? Math.pow(1 + gYear, 1 / 12) - 1
      : gYear / 12;

  let invested = Number(current) || 0;
  let valueGross = invested;
  let valueNet = invested;

  for (let m = 1; m <= months; m++) {
    const monthlyNow = (Number(monthly) || 0) * Math.pow(1 + gMonth, m - 1);
    invested += monthlyNow;

    valueGross = (valueGross + monthlyNow) * (1 + grossMonth);
    valueNet = (valueNet + monthlyNow) * (1 + netMonth);

    const deflator = Math.pow(1 + inflMonth, m);
    const valueGrossReal = deflator > 0 ? valueGross / deflator : valueGross;
    const valueNetReal = deflator > 0 ? valueNet / deflator : valueNet;
    const investedReal = deflator > 0 ? invested / deflator : invested;

    const row = {
      month: m,
      year: Math.ceil(m / 12),
      invested,
      valueGross,
      valueNet,
      investedReal,
      valueGrossReal,
      valueNetReal,
    };

    const v = Number(row?.[valueKey]) || 0;
    if (v >= t) return m; // ✅ 처음 도달한 월
  }

  return null;
}

// =========================
// ✅ Premium: years(float) -> {years, months} (월 단위로 올림)
// - requiredYears는 "최소 연수" 추정치이므로 UI 표시는 보수적으로 올림 처리
// =========================
function yearsFloatToYM(yFloat) {
  const y = Number(yFloat);
  if (!Number.isFinite(y) || y < 0) return null;

  // ✅ 최소 연수 추정치 → 월 단위로 올림(과소표시 방지)
  const totalMonths = Math.max(0, Math.ceil(y * 12));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months, totalMonths };
}

function formatYMText(ym, locale = "ko") {
  if (!ym) return null;
  const isKo = locale === "ko";
  const { years, months } = ym;

  if (isKo) {
    if (years <= 0) return `${months}개월`;
    if (months === 0) return `${years}년`;
    return `${years}년 ${months}개월`;
  }

  // en
  if (years <= 0) return `${months}m`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}m`;
}


// =========================
// ✅ Premium: reachMonth(int) -> {years, months} + text
// - reachMonth는 1부터 시작(1개월차)
// - UI: "0년 1개월" 같은 형태를 허용
// =========================
function reachMonthToYM(reachMonth) {
  const m = Number(reachMonth);
  if (!Number.isFinite(m) || m <= 0) return null;
  return {
    years: Math.floor((m - 1) / 12),
    months: ((m - 1) % 12) + 1,
    month: m,
  };
}

function formatReachText(reachMonth, locale = "ko") {
  const ym = reachMonthToYM(reachMonth);
  if (!ym) return null;
  // months는 1~12라서 formatYMText가 잘 표현함
  return formatYMText({ years: ym.years, months: ym.months }, locale);
}

// ===== Page Component =====
export default function GoalSimulatorPage() {
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const sectionEls = useRef({});

  // ✅ URL(라우터) 기준으로 언어 결정
  const locale = router.locale === 'en' ? 'en' : 'ko';
  const lang = locale; // ✅ ToolCta 호환용 alias

  // (선택) 기존 state가 필요하면 locale에서 파생
  const [currency, setCurrency] = useState(locale === 'ko' ? 'KRW' : 'USD');
  const [result, setResult] = useState(null);
  const [target, setTarget] = useState(0);
  const [lastParams, setLastParams] = useState(null); // ✅ Premium: 재계산 기반

  // ✅ Premium controls
  const [scenarioMode, setScenarioMode] = useState("base"); // base | conservative | aggressive | compare
  const [scenarioSpread, setScenarioSpread] = useState(2); // 기준 대비 ±%
  const [valueMode, setValueMode] = useState("nominal"); // nominal | real
  const [inflationPercent, setInflationPercent] = useState(locale === "ko" ? 2.5 : 2.0);
  const [contribGrowthPercent, setContribGrowthPercent] = useState(0);

  const loc = locale === 'ko' ? 'ko-KR' : 'en-US';

  const scrollTo = (id) => {
    const el = sectionEls.current?.[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

   // ✅ 라우터 locale이 바뀌면 통화도 동기화 (원하면 유지 로직으로 변경 가능)
  useEffect(() => {
    setCurrency(locale === 'ko' ? 'KRW' : 'USD');
  }, [locale]);  

  // ===== 텍스트 리소스 =====
  const t = useMemo(
    () => ({
      title:
        locale === 'ko'
          ? '목표자산 도달 계산기 | 매달 얼마 투자해야 할까?'
          : 'Goal Amount Calculator | How Much to Invest Per Month',
      desc:
        locale === 'ko'
          ? '현재 자산·월 적립금·수익률·기간·세금·수수료를 반영해 목표 자산까지의 성장 경로를 시뮬레이션합니다. 공유 및 PDF 저장 지원.'
          : 'Simulate your path to a target amount with monthly contributions, expected return, horizon, tax and fees. Share and export PDF.',
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

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    document.body.classList.add("fm-exporting");

    const target = document.getElementById("pdf-target");
    const details = target ? Array.from(target.querySelectorAll("details")) : [];
    const prevOpen = details.map((d) => d.open);
    details.forEach((d) => (d.open = true));

    await new Promise((r) => setTimeout(r, 400));

    const { downloadPDF } = await import("../../_components/PDFGenerator");
    await downloadPDF("pdf-target", "goal-result.pdf");

    details.forEach((d, i) => (d.open = prevOpen[i]));
    document.body.classList.remove("fm-exporting");
    setIsExporting(false);
  };

  // ----------------------------
  // ✅ 내부링크(추천 가이드 글)
  // 2단계에서: 네가 제공하는 실제 제목/설명(ko/en)을 여기 배열만 교체하면 됨
  // - ko/en 포스팅이 동일 slug를 공유하고, 상위 폴더만 ko/en로 분리되어 있다는 전제
  // - Next.js locale 유지: <Link locale={locale} />
  // ----------------------------
  const relatedGuides = useMemo(
    () => [
      {
        slug: "simple-vs-compound",
        tagKo: "기초 개념",
        tagEn: "Basics",
        titleKo: "단리 vs 복리: 차이와 공식 한 번에 정리",
        titleEn: "Simple vs Compound: the key difference",
        descKo: "단리·복리의 구조/공식/예시를 빠르게 이해하고, 복리 계산기로 바로 테스트해보세요.",
        descEn: "Understand formulas and real examples, then test results in the compound calculator.",
      },
      {
        slug: "annual-vs-monthly-compound",
        tagKo: "월복리",
        tagEn: "Compounding",
        titleKo: "월복리 vs 연복리: 주기 차이가 결과를 바꾸는 이유",
        titleEn: "Monthly vs Annual Compounding: why it changes",
        descKo: "복리 주기(월/연)에 따라 미래가치(FV)가 어떻게 달라지는지 숫자로 확인합니다.",
        descEn: "See how compounding frequency affects future value (FV) with numbers.",
      },
      {
        slug: "how-much-per-month-for-100m",
        tagKo: "적립식",
        tagEn: "Contributions",
        titleKo: "목표 금액을 위한 월 투자금: 역산으로 계획 세우기",
        titleEn: "Monthly contribution planning: reverse-calc",
        descKo: "목표금액·기간·수익률로 필요한 월 적립금을 역산해 투자 계획을 만듭니다.",
        descEn: "Reverse-calculate monthly contribution from target, years, and expected return.",
      },
      {
        slug: "goal-amount-fast-strategy",
        tagKo: "전략",
        tagEn: "Strategy",
        titleKo: "목표에 더 빨리 도달하는 방법: 원금·수익률·기간의 균형",
        titleEn: "Reach goals faster: balance the levers",
        descKo: "원금/월적립/수익률/기간 중 무엇을 조정해야 목표 도달이 빨라지는지 정리합니다.",
        descEn: "Which lever matters most—principal, contribution, return, or time.",
      },
      {
        slug: "personal-start-5steps",
        tagKo: "입문",
        tagEn: "Getting started",
        titleKo: "사회초년생 재테크 시작 5단계: 예산·비상금·투자 루틴",
        titleEn: "Personal finance start: 5 steps",
        descKo: "예산→비상금→저축→투자 순서로, 장기 복리 효과를 만드는 루틴을 제안합니다.",
        descEn: "A simple routine—budget, emergency fund, saving, investing—built for compounding.",
      },
    ],
    []
  );

  const appJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": locale === "ko" ? "목표 자산 시뮬레이터" : "Goal Asset Simulator",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "url": `https://www.finmaphub.com${locale === "en" ? "/en" : ""}/tools/goal-simulator`,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  }), [locale]);

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
      inflationPercent,
      contribGrowthPercent,
    });

    setTarget(targetValue);
    setResult(rows);

    // ✅ Premium: 마지막 입력값 저장(옵션 바꿔도 자동 재계산 가능)
    setLastParams({
      current,
      monthly,
      annualRate: r,
      years: y,
      compounding: form.compounding,
      taxRatePercent,
      feeRatePercent,
      target: targetValue,
    });
  };  

  // ✅ Premium: 옵션 바뀌면 자동 재계산(최근 입력 기준)
  useEffect(() => {
    if (!lastParams) return;
    const rows = simulateGoalPath({
      ...lastParams,
      inflationPercent,
      contribGrowthPercent,
    });
    setTarget(lastParams.target || 0);
    setResult(rows);
  }, [lastParams, inflationPercent, contribGrowthPercent]);

  // ✅ Premium: 3시나리오 데이터(보수/기준/공격) + compare
  const scenarioData = useMemo(() => {
    if (!lastParams) return null;
    const baseRate = Number(lastParams.annualRate) || 0;
    const spread = Number(scenarioSpread) || 0;
    const consRate = baseRate - spread;
    const aggrRate = baseRate + spread;

    const common = {
      ...lastParams,
      inflationPercent,
      contribGrowthPercent,
    };

    const base = simulateGoalPath({ ...common, annualRate: baseRate });
    const conservative = simulateGoalPath({ ...common, annualRate: consRate });
    const aggressive = simulateGoalPath({ ...common, annualRate: aggrRate });

    return { base, conservative, aggressive, baseRate, consRate, aggrRate };
  }, [lastParams, scenarioSpread, inflationPercent, contribGrowthPercent]);

  const chartValueKey = valueMode === "real" ? "valueNetReal" : "valueNet";
  const chartGrossKey = valueMode === "real" ? "valueGrossReal" : "valueGross";
  const chartInvestKey = valueMode === "real" ? "investedReal" : "invested";

  const chartPayload = useMemo(() => {
    if (!scenarioData) return { data: result, series: null };
    if (scenarioMode === "base") return { data: scenarioData.base, series: null };
    if (scenarioMode === "conservative") return { data: scenarioData.conservative, series: null };
    if (scenarioMode === "aggressive") return { data: scenarioData.aggressive, series: null };
    // compare
    return {
      data: scenarioData.base,
      series: [
        { key: "conservative", label: locale === "ko" ? `보수 (${scenarioData.consRate}%)` : `Conservative (${scenarioData.consRate}%)`, data: scenarioData.conservative },
        { key: "base",         label: locale === "ko" ? `기준 (${scenarioData.baseRate}%)` : `Base (${scenarioData.baseRate}%)`,         data: scenarioData.base },
        { key: "aggressive",   label: locale === "ko" ? `공격 (${scenarioData.aggrRate}%)` : `Aggressive (${scenarioData.aggrRate}%)`,   data: scenarioData.aggressive },
      ],
    };
  }, [scenarioData, scenarioMode, result, locale]);
  
  // ✅ viewRows는 chartPayload 이후에 계산해야 TDZ 에러가 안남
  const viewRows = useMemo(() => {
    return (chartPayload?.data && chartPayload.data.length) ? chartPayload.data : result;
  }, [chartPayload, result]);

  const hasResult = !!(viewRows && viewRows.length);
  const last = hasResult ? viewRows[viewRows.length - 1] : null;

  const finalNet = last ? Number(last?.[chartValueKey] || 0) : 0;
  const finalInvested = last ? Number(last?.[chartInvestKey] || 0) : 0;
  const finalGain = finalNet - finalInvested;

  // ✅ Premium: 진단 & 제안(역산) + "몇 년 몇 개월" 도달 시점
  const diagnosis = useMemo(() => {
    if (!hasResult || !lastParams) return null;
    const tVal = Number(target) || 0;
    if (tVal <= 0) return null;

    const achieved = finalNet >= tVal;
    const shortfall = Math.max(0, tVal - finalNet);

    // 연 단위(기존)
    const firstGoalYear =
      viewRows?.find((r) => Number(r?.[chartValueKey] || 0) >= tVal)?.year ?? null;

    // ✅ 월 단위(새 기능): 현재 보고 있는 시나리오의 연수익률로 계산
    const viewAnnualRate =
      scenarioMode === "conservative"
        ? (scenarioData?.consRate ?? lastParams.annualRate)
        : scenarioMode === "aggressive"
        ? (scenarioData?.aggrRate ?? lastParams.annualRate)
        : (scenarioData?.baseRate ?? lastParams.annualRate); // base / compare 는 baseRate

    const reachMonth = findFirstReachMonth({
      target: tVal,
      current: lastParams.current,
      monthly: lastParams.monthly,
      annualRate: viewAnnualRate,
      years: lastParams.years,
      compounding: lastParams.compounding,
      taxRatePercent: lastParams.taxRatePercent,
      feeRatePercent: lastParams.feeRatePercent,
      inflationPercent,
      contribGrowthPercent,
      valueKey: chartValueKey,
    });

    const reachYM = reachMonth == null ? null : reachMonthToYM(reachMonth);
    const reachText = formatReachText(reachMonth, locale);

    const requiredMonthly = !achieved
      ? solveRequiredMonthly({
          target: tVal,
          current: lastParams.current,
          annualRate: viewAnnualRate,
          years: lastParams.years,
          compounding: lastParams.compounding,
          taxRatePercent: lastParams.taxRatePercent,
          feeRatePercent: lastParams.feeRatePercent,
          inflationPercent,
          contribGrowthPercent,
          valueKey: chartValueKey,
        })
      : null;

    const requiredYears = !achieved
      ? solveRequiredYears({
          target: tVal,
          current: lastParams.current,
          monthly: lastParams.monthly,
          annualRate: viewAnnualRate,
          compounding: lastParams.compounding,
          taxRatePercent: lastParams.taxRatePercent,
          feeRatePercent: lastParams.feeRatePercent,
          inflationPercent,
          contribGrowthPercent,
          valueKey: chartValueKey,
        })
      : null;

    // ✅ (추가) 필요 월 적립금 증가분(현재 월 적립금 대비 +얼마)
    const currentMonthly = Number(lastParams.monthly) || 0;
    const requiredMonthlyDelta =
      requiredMonthly === null ? null : Math.max(0, (Number(requiredMonthly) || 0) - currentMonthly);

    const requiredMonthlyDeltaText =
      requiredMonthlyDelta === null
        ? null
        : (locale === "ko"
            ? `현재 월 적립금 대비 +${summaryFmt(requiredMonthlyDelta)}`
            : `+${summaryFmt(requiredMonthlyDelta)} vs current monthly`);

    // ✅ (추가) compare 모드: 보수/기준/공격 도달시점(년/개월) 3개를 동시에 계산
    const reachCompare =
      scenarioMode !== "compare" || !scenarioData
        ? null
        : {
            conservative: {
              rate: scenarioData.consRate,
              month: findFirstReachMonth({
                target: tVal,
                current: lastParams.current,
                monthly: lastParams.monthly,
                annualRate: scenarioData.consRate,
                years: lastParams.years,
                compounding: lastParams.compounding,
                taxRatePercent: lastParams.taxRatePercent,
                feeRatePercent: lastParams.feeRatePercent,
                inflationPercent,
                contribGrowthPercent,
                valueKey: chartValueKey,
              }),
            },
            base: {
              rate: scenarioData.baseRate,
              month: findFirstReachMonth({
                target: tVal,
                current: lastParams.current,
                monthly: lastParams.monthly,
                annualRate: scenarioData.baseRate,
                years: lastParams.years,
                compounding: lastParams.compounding,
                taxRatePercent: lastParams.taxRatePercent,
                feeRatePercent: lastParams.feeRatePercent,
                inflationPercent,
                contribGrowthPercent,
                valueKey: chartValueKey,
              }),
            },
            aggressive: {
              rate: scenarioData.aggrRate,
              month: findFirstReachMonth({
                target: tVal,
                current: lastParams.current,
                monthly: lastParams.monthly,
                annualRate: scenarioData.aggrRate,
                years: lastParams.years,
                compounding: lastParams.compounding,
                taxRatePercent: lastParams.taxRatePercent,
                feeRatePercent: lastParams.feeRatePercent,
                inflationPercent,
                contribGrowthPercent,
                valueKey: chartValueKey,
              }),
            },
          };

    // reachCompare에 text 미리 붙이기
    if (reachCompare) {
      reachCompare.conservative.text = formatReachText(reachCompare.conservative.month, locale);
      reachCompare.base.text = formatReachText(reachCompare.base.month, locale);
      reachCompare.aggressive.text = formatReachText(reachCompare.aggressive.month, locale);
    }


      
    const requiredYearsText =
      requiredYears === null
        ? null
        : formatYMText(yearsFloatToYM(requiredYears), locale);

    return {
      achieved,
      shortfall,
      firstGoalYear,
      reachMonth,
      reachText,
      requiredMonthly,
      requiredMonthlyDelta,
      requiredMonthlyDeltaText,
      requiredYears,
      requiredYearsText,
      reachCompare,
    };
  }, [
    hasResult,
    lastParams,
    target,
    finalNet,
    viewRows,
    chartValueKey,
    inflationPercent,
    contribGrowthPercent,
    locale,
    scenarioMode,
    scenarioData,
  ]);

  const handleShare = async () => {
    // 1) Web Share API
    if (await shareWeb()) return;

    // 2) Kakao SDK
    if (typeof window !== "undefined" && window?.Kakao) {
      shareKakao({
        title: locale === "ko" ? "FinMap 목표 자산 시뮬레이터 결과" : "Goal result",
        description:
          locale === "ko"
            ? "목표 금액·기간·수익률·월 적립금을 입력하면 목표 자산까지의 자산 성장 경로를 시뮬레이션합니다."
            : "Enter your target amount, time horizon, expected return, and monthly contribution to simulate your growth path.",
        url: window.location.href,
      });
      return;
    }

    // 3) Naver share
    if (typeof window !== "undefined") {
      shareNaver({
        title: locale === "ko" ? "FinMap 목표 자산 시뮬레이터 결과" : "Goal Result",
        url: window.location.href,
      });
      return;
    }

    // 4) 최후 fallback: URL 복사
    copyUrl();
  };

  return (
    <>
      <SeoHead
        title={t.title}
        desc={t.desc}
        url="/tools/goal-simulator"
        image="/og/goal-simulator.jpg"
        locale={locale}   // ✅ 이게 핵심 (canonical/hreflang 정합성)
      />
      {/* JSON-LD (SEO용) */}
      <JsonLd data={faqJsonLd} />
      <JsonLd data={appJsonLd} />

      <div className="py-6 grid gap-6 fm-mobile-full">
        {/* 제목 */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">{t.title}</h1>
        </div>

        {/* 🔹 상단 설명 카드 */}
        <div className="card" ref={(el) => (sectionEls.current.intro = el)}>
          <h2 className="text-lg font-semibold mb-2">{t.introTitle}</h2>
          <p className="text-sm text-slate-600 mb-2">{t.introLead}</p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
            <li>{t.introBullet1}</li>
            <li>{t.introBullet2}</li>
            <li>{t.introBullet3}</li>
          </ul>
        </div>

        {/* 입력 Form */}
        <div className="card" ref={(el) => (sectionEls.current.form = el)}>
          <GoalForm
            onSubmit={onSubmit}
            locale={locale}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        </div>

        {/* ✅ Premium 옵션 패널 (입력 후에도 재계산 가능) */}
        <div className="card">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="text-base font-semibold">
              {locale === "ko" ? "프리미엄 옵션" : "Premium options"}
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                className={`px-2 py-1 rounded-full border ${valueMode === "nominal" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`}
                onClick={() => setValueMode("nominal")}
              >
                {locale === "ko" ? "명목" : "Nominal"}
              </button>
              <button
                type="button"
                className={`px-2 py-1 rounded-full border ${valueMode === "real" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`}
                onClick={() => setValueMode("real")}
              >
                {locale === "ko" ? "실질" : "Real"}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <div className="text-xs text-slate-500 mb-1">
                {locale === "ko" ? "인플레이션(연, %)" : "Inflation (annual, %)"}
              </div>
              <input
                value={inflationPercent}
                onChange={(e) => setInflationPercent(e.target.value)}
                inputMode="decimal"
                className="w-full border rounded-xl px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <div className="text-xs text-slate-500 mb-1">
                {locale === "ko" ? "월 적립금 연 증가율(%, 예: 3)" : "Contribution growth (annual, %)"}
              </div>
              <input
                value={contribGrowthPercent}
                onChange={(e) => setContribGrowthPercent(e.target.value)}
                inputMode="decimal"
                className="w-full border rounded-xl px-3 py-2"
              />
            </label>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="text-sm sm:col-span-1">
              <div className="text-xs text-slate-500 mb-1">
                {locale === "ko" ? "시나리오 스프레드(±%, 기준 대비)" : "Scenario spread (±% vs base)"}
              </div>
              <input
                value={scenarioSpread}
                onChange={(e) => setScenarioSpread(e.target.value)}
                inputMode="decimal"
                className="w-full border rounded-xl px-3 py-2"
              />
            </label>

            <div className="sm:col-span-2">
              <div className="text-xs text-slate-500 mb-1">
                {locale === "ko" ? "시나리오 보기" : "Scenario view"}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["base", locale === "ko" ? "기준" : "Base"],
                  ["conservative", locale === "ko" ? "보수" : "Conservative"],
                  ["aggressive", locale === "ko" ? "공격" : "Aggressive"],
                  ["compare", locale === "ko" ? "비교" : "Compare"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setScenarioMode(key)}
                    className={`px-3 py-2 rounded-full border text-xs sm:text-sm ${
                      scenarioMode === key
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 결과 영역 */}
        {hasResult && (
          <>
            <div id="pdf-target" className="grid gap-6">
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

              {/* ✅ Premium: 진단 & 제안(역산) */}
              {diagnosis && (
                <div className="card">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">
                      {locale === "ko" ? "진단 & 제안" : "Diagnosis & suggestion"}
                    </h2>
                    {(diagnosis.reachText || diagnosis.firstGoalYear !== null) && (
                      <span className="text-xs text-slate-500">
                        {locale === "ko"
                          ? `첫 달성: ${diagnosis.reachText || `${diagnosis.firstGoalYear}년차`}`
                          : `First reach: ${diagnosis.reachText || `year ${diagnosis.firstGoalYear}`}`}
                      </span>
                    )}
                  </div>

                  {diagnosis.achieved ? (
                    <div className="mt-2 text-sm text-slate-700">
                      ✅ {locale === "ko" ? "목표 달성!" : "Target achieved!"}{" "}
                      <span className="text-slate-500">
                        {locale === "ko"
                          ? `목표 대비 여유: ${summaryFmt(finalNet - target)}`
                          : `Cushion: ${summaryFmt(finalNet - target)}`}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-700">
                      ⚠️ {locale === "ko" ? "목표 미달" : "Short of target"}{" "}
                      <span className="text-slate-500">
                        {locale === "ko"
                          ? `부족분: ${summaryFmt(diagnosis.shortfall)}`
                          : `Shortfall: ${summaryFmt(diagnosis.shortfall)}`}
                      </span>
                    </div>
                  )}
                  
                  {/* ✅ compare 모드: 3시나리오 도달시점 표시 */}
                  {scenarioMode === "compare" && diagnosis.reachCompare && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {[
                        ["conservative", locale === "ko" ? `보수 (${diagnosis.reachCompare.conservative.rate}%)` : `Conservative (${diagnosis.reachCompare.conservative.rate}%)`],
                        ["base",         locale === "ko" ? `기준 (${diagnosis.reachCompare.base.rate}%)`         : `Base (${diagnosis.reachCompare.base.rate}%)`],
                        ["aggressive",   locale === "ko" ? `공격 (${diagnosis.reachCompare.aggressive.rate}%)`   : `Aggressive (${diagnosis.reachCompare.aggressive.rate}%)`],
                      ].map(([k, label]) => {
                        const item = diagnosis.reachCompare[k];
                        const text = item?.text || (locale === "ko" ? "미도달" : "Not reached");
                        return (
                          <span key={k} className="px-2 py-1 rounded-full border border-slate-200 bg-white text-slate-700">
                            {label}: {text}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {!diagnosis.achieved && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                          {locale === "ko" ? "필요 월 적립금" : "Required monthly"}
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                          {diagnosis.requiredMonthly === null
                            ? locale === "ko"
                              ? "계산 범위를 초과했습니다"
                              : "Out of range"
                            : summaryFmt(diagnosis.requiredMonthly)}
                        </div>
                        {diagnosis.requiredMonthlyDeltaText && (
                        <div className="text-xs text-slate-500 mt-1">
                          {diagnosis.requiredMonthlyDeltaText}
                        </div>
                      )}
                        <div className="text-xs text-slate-500 mt-1">
                          {locale === "ko"
                            ? "현재 가정(세금/수수료/인플레/적립증가/기간)은 그대로"
                            : "Same assumptions (tax/fees/inflation/growth/horizon)"}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                          {locale === "ko" ? "필요 기간" : "Required years"}
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                          {diagnosis.requiredYears === null
                            ? locale === "ko"
                              ? "계산 범위를 초과했습니다"
                              : "Out of range"
                            : (diagnosis.requiredYearsText ?? `${Number(diagnosis.requiredYears).toFixed(1)}y`)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {locale === "ko"
                            ? "현재 가정(월적립/수익률/세금/수수료/인플레/적립증가)은 그대로"
                            : "Same assumptions (monthly/return/tax/fees/inflation/growth)"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 차트 */}
              <div className="card" ref={(el) => (sectionEls.current.chart = el)}>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-semibold">{t.chartTitle}</h2>
                  <span className="text-xs text-slate-500">
                    {locale.startsWith('ko')
                      ? '단위: 원 / 만원 / 억원 자동'
                      : 'Unit: auto (KRW / 10k / 100M)'}
                  </span>
                </div>
                <GoalChart
                  //data={result}
                  data={chartPayload.data}
                  series={chartPayload.series}
                  locale={loc}
                  currency={currency}
                  target={target}
                  valueKey={chartValueKey}
                  grossKey={chartGrossKey}
                  investedKey={chartInvestKey}
                />
              </div>

              {/* 연간 요약 테이블 */}
              <div ref={(el) => (sectionEls.current.table = el)}>
                <GoalYearTable
                  //rows={result}
                  rows={chartPayload.data}
                  locale={loc}
                  currency={currency}
                  target={target}
                />
              </div>

              {/* 🔹 FAQ 섹션 */}
              <div className="card w-full" ref={(el) => (sectionEls.current.faq = el)}>
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
            </div>

            {/* ✅ (추가) 공유 + PDF 다운로드 CTA */}
            <CompoundCTA 
              locale={lang} 
              onDownloadPDF={handleDownloadPDF} 
              shareTitle={
                locale === "ko" 
                  ? "FinMap 목표 자산 시뮬레이션 결과"
                  : "Goal simulation result"
              }
              shareDescription={
                locale === "ko"
                  ? "목표 금액·기간·수익률·월 적립금을 입력하면 목표 자산까지의 자산 성장 경로를 시뮬레이션합니다."
                  : "Enter your target amount, time horizon, expected return, and monthly contribution to simulate your growth path."
              } />


            <div className="tool-cta-section">
              <ToolCta lang={lang} type="fire" />
              <ToolCta lang={lang} type="compound" />
              <ToolCta lang={lang} type="cagr" />
              <ToolCta lang={lang} type="dca" />
            </div>

            {/* 하단 고정 CTA Bar */}
            {!isExporting && (
              <CTABar
                locale={lang}
                onDownloadPDF={handleDownloadPDF}
                onShare={handleShare}
                mode={"basic"}
                alwaysVisible={true}
                onNavigate={scrollTo}
              />
            )}
          </>
        )}

        {/* ✅ 내부링크: 추천 가이드 글 5개 (SEO + 체류시간 + 내부탐색) */}
        <section className="card" ref={(el) => (sectionEls.current.guides = el)}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-base font-semibold">
              {locale === "ko" ? "추천 가이드 글" : "Recommended guides"}
            </h2>
            <Link
              href="/category/personalFinance"
              locale={locale}
              className="text-sm text-slate-600 hover:underline"
            >
              {locale === "ko" ? "전체 글 보기" : "View all posts"}
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/posts/personalFinance/${locale}/${g.slug}`}
                locale={locale}
                className="block border rounded-2xl p-4 hover:shadow-sm transition"
              >
                <div className="text-xs text-slate-500 mb-1">
                  {locale === "ko" ? g.tagKo : g.tagEn}
                </div>
                <div className="font-semibold leading-snug">
                  {locale === "ko" ? g.titleKo : g.titleEn}
                </div>
                {/* 2단계에서 길이 조정해도 되지만, 기본은 1줄로 고정 */}
                <div className="text-sm text-slate-600 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {locale === "ko" ? g.descKo : g.descEn}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
