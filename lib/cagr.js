// lib/cagr.js
// 투자 수익률(CAGR) 계산용 유틸

// 단순 포맷용: 기존 numberFmt를 그대로 써도 되고, 안 쓰면 이 함수는 없어도 됨.
export function percentFmt(value, digits = 2) {
  const v = Number(value) || 0;
  return `${v.toFixed(digits)}%`;
}

/**
 * CAGR 계산
 * @param {Object} params
 * @param {number} params.initial   - 초기 자산 (세후 기준)
 * @param {number} params.final     - 최종 자산 (세후 기준)
 * @param {number} params.years     - 투자 기간(년)
 * @param {number} params.taxRate   - 세율(%) 예: 15.4
 * @param {number} params.feeRate   - 수수료율(%) 예: 0.5
 */
export function calcCagr({
  initial,
  final,
  years,
  taxRate = 15.4,
  feeRate = 0.5,
}) {
  const P = Number(initial) || 0;
  const F = Number(final) || 0;
  const Y = Number(years) || 0;

  if (P <= 0 || F <= 0 || Y <= 0) {
    return {
      netCagr: 0,
      grossCagr: 0,
      yearSummary: [],
      taxRate,
      feeRate,
    };
  }

  // 순수익률(CAGR, 세후) = (F/P)^(1/Y) - 1
  const netCagr = Math.pow(F / P, 1 / Y) - 1;
  
  // 사용자가 입력한 세율/수수료율(%)을 소수로 변환
  const tax = (Number(taxRate) || 0) / 100; // 예: 15.4 → 0.154
  const fee = (Number(feeRate) || 0) / 100; // 예: 0.5 → 0.005

  // 아주 단순화된 근사:
  //   net ≈ gross * (1 - tax) - fee
  // → gross ≈ (net + fee) / (1 - tax)
  let grossCagr = (netCagr + fee) / (1 - tax || 1);

  // 수학적으로 말도 안 되게 나오는 extreme 값 방지
  if (!Number.isFinite(grossCagr)) grossCagr = netCagr;
  if (grossCagr < -0.99) grossCagr = -0.99;

  // 연간 요약 (연도 수는 반올림)
  const N = Math.max(1, Math.round(Y));
  const yearSummary = [];

  for (let y = 0; y <= N; y++) {
    const grossValue = P * Math.pow(1 + grossCagr, y);
    const netValue = P * Math.pow(1 + netCagr, y);
    const taxFeeImpact = grossValue - netValue;

    yearSummary.push({
      year: y,
      grossValue,
      netValue,
      taxFeeImpact,
    });
  }

  return {
    netCagr,      // 세후 CAGR (실제 초기→최종 기준)
    grossCagr,    // 세전(추정) CAGR (입력된 세율/수수료율 역산)
    yearSummary,
    taxRate,
    feeRate,
  };
}
