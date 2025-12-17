// _components/SensitivityPanel.js
import { useMemo } from "react";
import { sensitivityRate, sensitivityFee, sensitivityTax } from "../lib/compound";
import SensitivityChart from "./SensitivityChart";

export default function SensitivityPanel({
  principal,
  monthly,
  annualRate,
  years,
  taxRatePercent,
  feeRatePercent,
  locale = "ko-KR",
  currency = "KRW",
}) {
  const y = Number(years) || 0;

  const rateData = useMemo(() => {
    if (!y || y <= 0) return [];
    const list = [];
    for (let d = -10; d <= 10; d++) {
      if (d === 0) continue;
      list.push(
        sensitivityRate({
          principal,
          monthly,
          annualRate,
          years: y,
          taxRatePercent,
          feeRatePercent,
          deltaRate: d,
        })
      );
    }
    return list;
  }, [principal, monthly, annualRate, y, taxRatePercent, feeRatePercent]);

  const feeData = useMemo(() => {
    if (!y || y <= 0) return [];
    const list = [];
    // -1.0 ~ +1.0 (0.1 step) 를 정수 루프로 처리(부동소수 오차 최소화)
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      const d = i / 10; // -1 ~ +1
      list.push(
        sensitivityFee({
          principal,
          monthly,
          annualRate,
          years: y,
          taxRatePercent,
          feeRatePercent,
          deltaFee: d,
        })
      );
    }
    return list;
  }, [principal, monthly, annualRate, y, taxRatePercent, feeRatePercent]);

  const taxData = useMemo(() => {
    if (!y || y <= 0) return [];
    const list = [];
    for (let d = -5; d <= 5; d++) {
      if (d === 0) continue;
      list.push(
        sensitivityTax({
          principal,
          monthly,
          annualRate,
          years: y,
          taxRatePercent,
          feeRatePercent,
          deltaTax: d,
        })
      );
    }
    return list;
  }, [principal, monthly, annualRate, y, taxRatePercent, feeRatePercent]);

  return (
    <SensitivityChart
      rateData={rateData}
      feeData={feeData}
      taxData={taxData}
      currency={currency}
      locale={locale}
    />
  );
}
