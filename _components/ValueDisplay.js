// _components/ValueDisplay.js
import React from "react";
import { Tooltip } from "react-tooltip";

// ① 축약 포맷 (만원/억원 등)
export function formatMoneyShort(value, locale = "ko-KR") {
  const v = Number(value) || 0;
  const abs = Math.abs(v);

  const isKo = locale.startsWith("ko");

  // 억 단위
  if (abs >= 100_000_000) {
    return (
      (v / 100_000_000).toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + (isKo ? "억" : " ×100M")
    );
  }

  // 만원 단위
  if (abs >= 10_000) {
    return (
      (v / 10_000).toLocaleString(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) + (isKo ? "만원" : " ×10k")
    );
  }

  return v.toLocaleString(locale) + (isKo ? "원" : "");
}

// ② 원 단위 정확 금액
export function formatMoneyFull(value, currency = "KRW", locale = "ko-KR") {
  return Number(value).toLocaleString(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  });
}

// ③ 표준 컴포넌트
export default function ValueDisplay({
  value,
  locale = "ko-KR",
  currency = "KRW",
  className = "",
}) {
  const id = "v" + Math.random().toString(36).slice(2);

  return (
    <>
      <span
        className={`cursor-help border-b border-dotted border-slate-400 ${className}`}
        data-tooltip-id={id}
      >
        {formatMoneyShort(value, locale)}
      </span>

      <Tooltip id={id} place="top" className="z-50">
        <div style={{ fontSize: "12px" }}>
          {formatMoneyFull(value, currency, locale)}
        </div>
      </Tooltip>
    </>
  );
}
