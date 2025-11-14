// lib/compound.js

// =========================
// 핵심 복리 계산 엔진
// - 월 단위 계산
// - 세금(이자소득세 15.4%), 수수료(매입/환매 각 0.25%) 옵션
// - 연간 요약(yearSummary)까지 생성
// =========================

export function calcCompound({
  principal = 0,      // 초기 투자금
  monthly = 0,        // 월 적립금
  annualRate = 0,     // 연 수익률(%)
  years = 1,          // 투자 기간(년)
  compounding = 'monthly', // 'monthly' | 'yearly' (월복리/연복리)
  taxMode = 'on',     // 'on' | 'off'
  feeMode = 'on',     // 'on' | 'off'
}) {
  const months = Math.max(0, Math.floor(years * 12));
  const apr = annualRate > 0 ? annualRate / 100 : 0;

  // 복리 주기 → 월 이율
  const monthlyRate =
    compounding === 'yearly'
      ? Math.pow(1 + apr, 1 / 12) - 1 // 연복리를 월로 환산
      : apr / 12; // 기본: 월복리

  const taxRate = taxMode === 'on' ? 0.154 : 0;
  const feeRate = feeMode === 'on' ? 0.0025 : 0;

  const series = [];
  const yearSummary = [];

  let balanceGross = principal; // 세전 잔고
  let balanceNet = principal;   // 세후 잔고
  let totalContribution = principal;

  let totalInterestGross = 0;
  let totalInterestNet = 0;
  let taxTotal = 0;
  let feeTotal = 0;

  // 연간 집계용 변수
  let year = 1;
  let yearOpeningGross = principal;
  let yearOpeningNet = principal;
  let yearContrib = 0;
  let yearInterestGross = 0;
  let yearInterestNet = 0;
  let yearTax = 0;
  let yearFee = 0;
  let cumulativeInterestGross = 0;
  let cumulativeInterestNet = 0;
  let cumulativeTax = 0;
  let cumulativeFee = 0;

  for (let month = 1; month <= months; month++) {
    // 1) 월 적립금 납입 + 매입 수수료
    if (monthly > 0) {
      const buyFee = monthly * feeRate;
      balanceGross += monthly;
      balanceNet += monthly - buyFee;

      totalContribution += monthly;
      yearContrib += monthly;

      feeTotal += buyFee;
      yearFee += buyFee;
      cumulativeFee += buyFee;
    }

    // 2) 이자 계산 (세전)
    const interestGross = balanceGross * monthlyRate;
    const tax = interestGross * taxRate;
    const interestNet = interestGross - tax;

    balanceGross += interestGross;
    balanceNet += interestNet;

    totalInterestGross += interestGross;
    totalInterestNet += interestNet;

    taxTotal += tax;
    yearInterestGross += interestGross;
    yearInterestNet += interestNet;

    yearTax += tax;
    cumulativeInterestGross += interestGross;
    cumulativeInterestNet += interestNet;
    cumulativeTax += tax;

    // 3) 마지막 달: 환매 수수료
    if (month === months && feeRate > 0) {
      const sellFee = balanceNet * feeRate;
      balanceNet -= sellFee;

      feeTotal += sellFee;
      yearFee += sellFee;
      cumulativeFee += sellFee;
    }

    // 월별 시계열 저장
    series.push({
      month,
      balanceGross,
      balanceNet,
      interestGross,
      interestNet,
      tax,
    });

    // 4) 연말(12,24,... or 마지막 달)마다 연간 요약 행 생성
    const isYearEnd = month % 12 === 0 || month === months;
    if (isYearEnd) {
      yearSummary.push({
        year,
        openingBalanceGross: yearOpeningGross,
        openingBalanceNet: yearOpeningNet,
        contributionYear: yearContrib,
        closingBalanceGross: balanceGross,
        closingBalanceNet: balanceNet,
        interestYearGross: yearInterestGross,
        interestYearNet: yearInterestNet,
        taxYear: yearTax,
        feeYear: yearFee,
        cumulativeInterestGross,
        cumulativeInterestNet,
        cumulativeTax,
        cumulativeFee,
      });

      year += 1;
      yearOpeningGross = balanceGross;
      yearOpeningNet = balanceNet;
      yearContrib = 0;
      yearInterestGross = 0;
      yearInterestNet = 0;
      yearTax = 0;
      yearFee = 0;
    }
  }

  return {
    months,
    monthlyRate,
    futureValueGross: balanceGross,
    futureValueNet: balanceNet,
    totalContribution,
    totalInterestGross,
    totalInterestNet,
    taxTotal,
    feeTotal,
    series,
    yearSummary,
  };
}

// =========================
// 단순 통화 포맷 (상단 요약 카드용)
// =========================
export function numberFmt(locale, currency, n) {
  if (!currency) {
    return new Intl.NumberFormat(locale).format(n);
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

// =========================
// 금액 단위 옵션 (표시용)
// =========================

export const UNIT_OPTIONS = {
  KRW: [
    {
      id: 'KRW-1',
      divisor: 1,
      labelKo: '원 단위',
      labelEn: 'KRW (1)',
      unitTextKo: '원',
      unitTextEn: 'KRW',
    },
    {
      id: 'KRW-1k',
      divisor: 1000,
      labelKo: '천원 단위',
      labelEn: 'KRW 1,000',
      unitTextKo: '천원',
      unitTextEn: 'thousand KRW',
    },
    {
      id: 'KRW-10m',
      divisor: 10000000,
      labelKo: '천만 원 단위',
      labelEn: 'KRW 10,000,000',
      unitTextKo: '천만 원',
      unitTextEn: 'ten-million KRW',
      default: true, // 기본값
    },
    {
      id: 'KRW-100m',
      divisor: 100000000,
      labelKo: '억 단위',
      labelEn: 'KRW 100,000,000',
      unitTextKo: '억',
      unitTextEn: 'hundred-million KRW',
    },
  ],
  USD: [
    {
      id: 'USD-1',
      divisor: 1,
      labelKo: '1달러 단위',
      labelEn: '1 USD',
      unitTextKo: '1 USD',
      unitTextEn: '1 USD',
    },
    {
      id: 'USD-1k',
      divisor: 1000,
      labelKo: '1,000달러 단위',
      labelEn: '1,000 USD',
      unitTextKo: '1,000 USD',
      unitTextEn: '1,000 USD',
    },
    {
      id: 'USD-10k',
      divisor: 10000,
      labelKo: '10,000달러 단위',
      labelEn: '10,000 USD',
      unitTextKo: '10,000 USD',
      unitTextEn: '10,000 USD',
      default: true, // 기본값
    },
  ],
};

export function getUnitOptions(currency = 'KRW', locale = 'ko-KR') {
  const list = UNIT_OPTIONS[currency] || UNIT_OPTIONS.KRW;
  const isKo = locale.toLowerCase().startsWith('ko');
  return list.map((u) => ({
    id: u.id,
    divisor: u.divisor,
    label: isKo ? u.labelKo : u.labelEn,
    unitText: isKo ? (u.unitTextKo || u.labelKo) : (u.unitTextEn || u.labelEn),
    default: !!u.default,
  }));
}

export function pickUnit(options, unitId) {
  if (!options || !options.length) return null;
  return (
    options.find((o) => o.id === unitId) ||
    options.find((o) => o.default) ||
    options[0]
  );
}

// 숫자 → 선택한 단위로 스케일 + 포맷
// - divisor 1(원/1달러)일 때는 소수점 없음
// - 그 외(천만 원, 1만달러 등)일 때는 소수점 2자리
export function formatScaledAmount(value, unit, locale = 'ko-KR') {
  const divisor = unit?.divisor ?? 1;
  const v = (Number(value) || 0) / divisor;

  const isBaseUnit = divisor === 1;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: isBaseUnit ? 0 : 2,
    maximumFractionDigits: isBaseUnit ? 0 : 2,
  }).format(v);
}
