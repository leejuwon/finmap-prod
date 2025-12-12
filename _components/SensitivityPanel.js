// _components/SensitivityPanel.js
import { useState, useEffect } from "react";
import {
  sensitivityRate,
  sensitivityFee,
  sensitivityTax,
} from "../lib/compound";
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
  const [rateData, setRateData] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [taxData, setTaxData] = useState([]);

  useEffect(() => {
    if (!years || years <= 0) return;

    // ① 수익률 민감도 ±1 ~ ±10%
    const rateList = [];
    for (let d = -10; d <= 10; d++) {
      if (d === 0) continue;
      rateList.push(
        sensitivityRate({
          principal,
          monthly,
          annualRate,
          years,
          taxRatePercent,
          feeRatePercent,
          deltaRate: d,
        })
      );
    }
    setRateData(rateList);

    // ② 수수료 민감도 ±0.1% ~ ±1%
    const feeList = [];
    for (let d = -1; d <= 1; d += 0.1) {
      if (d === 0) continue;
      const v = parseFloat(d.toFixed(1));
      feeList.push(
        sensitivityFee({
          principal,
          monthly,
          annualRate,
          years,
          taxRatePercent,
          feeRatePercent,
          deltaFee: v,
        })
      );
    }
    setFeeData(feeList);

    // ③ 세금 민감도 (최대 14~25%)
    const taxList = [];
    for (let d = -5; d <= 5; d++) {
      if (d === 0) continue;
      taxList.push(
        sensitivityTax({
          principal,
          monthly,
          annualRate,
          years,
          taxRatePercent,
          feeRatePercent,
          deltaTax: d,
        })
      );
    }
    setTaxData(taxList);
  }, [principal, monthly, annualRate, years, taxRatePercent, feeRatePercent]);

  console.log("rateData", rateData);
    console.log("feeData", feeData);
    console.log("taxData", taxData);
  return (
    <div className="card mt-6">      

      <SensitivityChart
        rateData={rateData}
        feeData={feeData}
        taxData={taxData}
        currency={currency}
        locale={locale}
      />
    </div>
  );
}
