// lib/money.js

/**
 * 금액 자동 단위 포맷터
 *
 * - KRW 일 때:
 *   - 1억 이상  : 억 단위 (소수점 최대 2자리)
 *   - 1만 이상  : 만 단위 (소수점 최대 1자리)
 *   - 그 미만   : 원 단위 (소수점 없음)
 *
 * - 그 외 통화(USD 등):
 *   - Intl.NumberFormat(locale, { style: 'currency', currency }) 사용
 *
 * @param {number} value   실제 금액(원 단위, 또는 통화 단위)
 * @param {string} currency 'KRW' | 'USD' | 'JPY' | ...
 * @param {string} locale   'ko-KR' | 'en-US' 등
 * @returns {string}
 */
export function formatMoneyAuto(value, currency = 'KRW', locale = 'ko-KR') {
  const v = Number(value) || 0;
  const cur = currency || 'KRW';
  const isKo = String(locale).toLowerCase().startsWith('ko');

  // 🔹 KRW인 경우: 원 / 만원 / 억원 자동 단위
  if (cur === 'KRW') {
    const abs = Math.abs(v);
    let divisor = 1;
    let suffix = isKo ? '원' : 'KRW';

    // 1억 이상 → 억 단위
    if (abs >= 100_000_000) {
      divisor = 100_000_000;
      suffix = isKo ? '억원' : '×100M KRW';
    }
    // 1만 이상 → 만원 단위
    else if (abs >= 10_000) {
      divisor = 10_000;
      suffix = isKo ? '만원' : '×10k KRW';
    }

    const scaled = v / divisor;
    const scaledAbs = Math.abs(scaled);

    let minimumFractionDigits = 0;
    let maximumFractionDigits = 0;

    if (divisor === 10_000) {
      // ✅ 만원 단위: 소수점 최대 1자리 (ex: 1.5만원)
      const hasFirstDecimal =
        Math.round(scaledAbs * 10) % 10 !== 0; // x.x 에서 x 뒤에 숫자가 있으면
      minimumFractionDigits = hasFirstDecimal ? 1 : 0;
      maximumFractionDigits = 1;
    } else if (divisor === 100_000_000) {
      // ✅ 억 단위: 소수점 최대 2자리 (ex: 1.23억원)
      //    2자리 "까지" 이므로, .00이면 소수점 없이, .10이면 1.1, .12면 1.12
      minimumFractionDigits = 0;
      maximumFractionDigits = 2;
    } else {
      // 원 단위: 소수점 없음
      minimumFractionDigits = 0;
      maximumFractionDigits = 0;
    }

    const numStr = scaled.toLocaleString(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    });

    return `${numStr}${suffix}`;
  }

  // 🔹 기타 통화 (USD 등) → 일반 통화 포맷
  const isValidCurrency =
    typeof cur === 'string' && /^[A-Z]{3}$/.test(cur);

  if (!isValidCurrency) {
    return new Intl.NumberFormat(locale).format(v);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: 2,
  }).format(v);
}
