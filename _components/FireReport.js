// _components/FireReport.js — Real-only version

import React from "react";
import { buildFireReport } from "../lib/fireReport";

export default function FireReport({ lang = "ko", result, params }) {
  if (!result) return null;

  // buildFireReport 내부에서 retirementStartReal 사용하도록 수정 필요
  const report = buildFireReport(result, params, lang);

  return (
    <div className="card whitespace-pre-line mt-6">
      <h2 className="text-lg font-semibold mb-2">
        {lang === "ko" ? "FIRE 분석 리포트" : "FIRE Analysis Report"}
      </h2>

      <p className="text-sm leading-relaxed text-slate-700">
        {report}
      </p>
    </div>
  );
}
