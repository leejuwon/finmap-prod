// lib/compound.js
export function calcCompound({
  principal = 0,      // 초기 투자금
  monthly = 0,        // 월 적립금
  annualRate = 0,     // 연 수익률(%)
  years = 1,          // 투자 기간(년)
}) {
  const m = Math.max(0, Math.floor(years * 12)); // 총 월수
  const i = annualRate > 0 ? (annualRate / 100) / 12 : 0; // 월 이율
  const rows = [];

  let balance = principal;
  let totalPrincipal = principal;
  let totalContribution = principal;

  for (let month = 1; month <= m; month++) {
    if (monthly > 0) {
      balance += monthly;
      totalContribution += monthly;
    }
    const interest = balance * i;
    balance += interest;

    rows.push({
      month,
      balance,
      interestAccrued: interest,
      contributionAccrued: monthly > 0 ? monthly : 0
    });
  }

  const fvPrincipalOnly = principal * Math.pow(1 + i, m);
  const fvContribOnly = monthly > 0 && i > 0
    ? monthly * (Math.pow(1 + i, m) - 1) / i
    : monthly * m;

  const futureValue = fvPrincipalOnly + fvContribOnly;

  return {
    months: m,
    monthlyRate: i,
    futureValue,
    totalContribution,
    totalInterest: Math.max(0, futureValue - totalContribution),
    series: rows, // 월별 시계열
  };
}

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
