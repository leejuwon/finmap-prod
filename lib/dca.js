// lib/dca.js
// ETF·주식 자동 적립식(DCA) 시뮬레이터 계산 로직

export function simulateDCA({
  monthly,        // 월 투자금
  annualRate,     // 연 수익률 (%)
  years,          // 투자 기간
  taxRate = 15.4, // 세율(%)
  feeRate = 0.5,  // 수수료율(연 %)
}) {
  const months = Math.max(1, Math.floor((Number(years) || 0) * 12));
  const rYear = (Number(annualRate) || 0) / 100;

  const tax = (Number(taxRate) || 0) / 100;
  const fee = (Number(feeRate) || 0) / 100;

  let netYear = rYear * (1 - tax) - fee;
  if (netYear < -0.99) netYear = -0.99;

  // 월 수익률
  const grossMonth = Math.pow(1 + rYear, 1 / 12) - 1;
  const netMonth = Math.pow(1 + netYear, 1 / 12) - 1;

  const monthlyAmt = Number(monthly) || 0;

  let invested = 0;
  let grossValue = 0;
  let netValue = 0;

  const rows = [];

  for (let m = 1; m <= months; m++) {
    invested += monthlyAmt;

    grossValue = (grossValue + monthlyAmt) * (1 + grossMonth);
    netValue = (netValue + monthlyAmt) * (1 + netMonth);

    if (m % 12 === 0 || m === months) {
      const year = Math.round(m / 12);
      rows.push({
        year,
        invested,
        grossValue,
        netValue,
      });
    }
  }

  return {
    rows,
    totalInvested: invested,
    grossValue,
    netValue,
    gainGross: grossValue - invested,
    gainNet: netValue - invested,
    grossRate: invested > 0 ? grossValue / invested - 1 : 0,
    netRate: invested > 0 ? netValue / invested - 1 : 0,
    taxRate,
    feeRate,
  };
}
