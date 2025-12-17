// _components/GoalEngineCard.js
import { useMemo, useState } from "react";
import ValueDisplay from "./ValueDisplay";
import { calcCompound } from "../lib/compound";

/* -------------------------------------------------------
   공통: locale 정규화 (ko/en/ko-KR/en-US 모두 대응)
------------------------------------------------------- */
function normalizeLocale(locale) {
  if (!locale) return "ko-KR";
  if (locale === "ko") return "ko-KR";
  if (locale === "en") return "en-US";
  return locale;
}

// 안전한 숫자 변환
function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

/**
 * ✅ 현재 가정(복리주기/세금/수수료 포함)으로 미래가치(Net FV) 계산
 */
function fvNetByAssumption({
  principal,
  monthly,
  years,
  annualRate,
  compounding,
  taxRatePercent,
  feeRatePercent,
  baseYear,
}) {
  const out = calcCompound({
    principal,
    monthly,
    years,
    annualRate,
    compounding,
    taxRatePercent,
    feeRatePercent,
    baseYear,
  });
  return num(out?.futureValueNet, 0);
}

/**
 * ✅ 이진 탐색 유틸: "목표 FV >= goal"이 되는 최소 x 찾기
 * - fn(x) => fvNet
 */
function binarySearchMinX({ goal, low, high, fn, iters = 42 }) {
  let lo = low;
  let hi = high;

  for (let i = 0; i < iters; i++) {
    const mid = (lo + hi) / 2;
    const fv = fn(mid);
    if (fv >= goal) hi = mid;
    else lo = mid;
  }
  return hi;
}

export default function GoalEngineCard({
  locale = "ko",
  currency = "KRW",
  result,
  invest,
  taxRatePercent = 15.4,
  feeRatePercent = 0.5,
}) {
  const [goalInput, setGoalInput] = useState("");

  const isKo = String(locale).startsWith("ko");
  const numberLocale = normalizeLocale(locale);

  const years = num(invest?.years, 0);
  const principal = num(invest?.principal, 0);
  const monthly = num(invest?.monthly, 0);

  const annualRate = num(result?.annualRate, 0);
  const compounding = result?.compounding || "monthly";
  const baseYear = num(result?.baseYear, new Date().getFullYear());

  const annualRateForEngine = Number(invest?.annualRate ?? result?.annualRate ?? 0);
 

  const handleGoalChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setGoalInput(raw);
  };

  const formattedGoal = goalInput.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // ✅ KRW = 만원 단위 입력 → 실제 금액 ×10,000
  const goalAmount = num(goalInput, 0) * (currency === "KRW" ? 10_000 : 1);

  const goalLabel = isKo
    ? currency === "KRW"
      ? "목표 자산 (만원)"
      : "목표 자산"
    : currency === "KRW"
      ? "Target Amount (×10k KRW)"
      : "Target Amount";

  const placeholder = isKo
    ? currency === "KRW"
      ? "예: 50,000"
      : "예: 100,000"
    : "ex: 50,000";

  // ✅ 현재 조건의 FV(net)
  const currentFvNet = useMemo(() => {
    if (!result || years <= 0) return 0;
    return fvNetByAssumption({
      principal,
      monthly,
      years,
      annualRate,
      compounding,
      taxRatePercent,
      feeRatePercent,
      baseYear,
    });
  }, [
    result,
    years,
    principal,
    monthly,
    annualRate,
    compounding,
    taxRatePercent,
    feeRatePercent,
    baseYear,
  ]);

  // =====================================================
  // 1) 필요한 월 투자금 (세금/수수료 포함 역산)
  // =====================================================
  const monthlyNeed = useMemo(() => {
    if (!result || goalAmount <= 0 || years <= 0) return 0;
    if (currentFvNet >= goalAmount) return 0;

    // high 자동 확장(필요 월납입이 큰 케이스 대응)
    let low = 0;
    let high = Math.max(1, goalAmount / (years * 12)); // 대충 평균 분할
    const fn = (m) =>
      fvNetByAssumption({
        principal,
        monthly: m,
        years,
        annualRate: annualRateForEngine,
        compounding,
        taxRatePercent,
        feeRatePercent,
        baseYear,
      });

    // high가 충분할 때까지 2배 확장 (안전 상한)
    let guard = 0;
    while (fn(high) < goalAmount && guard < 40) {
      high *= 2;
      guard += 1;
      if (high > goalAmount * 10) break;
    }

    return Math.max(
      0,
      binarySearchMinX({
        goal: goalAmount,
        low,
        high,
        fn,
      })
    );
  }, [
    result,
    goalAmount,
    years,
    currentFvNet,
    principal,
    annualRate,
    compounding,
    taxRatePercent,
    feeRatePercent,
    baseYear,
  ]);

  // =====================================================
  // 2) 필요한 연 수익률 (세금/수수료 포함 역산)
  // =====================================================
  const rateNeed = useMemo(() => {
    if (!result || goalAmount <= 0 || years <= 0) return 0;
    if (currentFvNet >= goalAmount) return 0;

    const fn = (ratePct) =>
      fvNetByAssumption({
        principal,
        monthly,
        years,
        annualRate: ratePct,
        compounding,
        taxRatePercent,
        feeRatePercent,
        baseYear,
      });

    let low = -99;
    let high = 100;

    // high 확장(고수익률이 필요한 케이스 대비)
    let guard = 0;
    while (fn(high) < goalAmount && guard < 30) {
      high *= 1.5;
      guard += 1;
      if (high > 500) break;
    }

    return binarySearchMinX({
      goal: goalAmount,
      low,
      high,
      fn,
    });
  }, [
    result,
    goalAmount,
    years,
    currentFvNet,
    principal,
    monthly,
    compounding,
    taxRatePercent,
    feeRatePercent,
    baseYear,
  ]);

  // =====================================================
  // 3) 필요한 초기 투자금 (세금/수수료 포함 역산)
  // =====================================================
  const principalNeed = useMemo(() => {
    if (!result || goalAmount <= 0 || years <= 0) return 0;
    if (currentFvNet >= goalAmount) return 0;

    const fn = (p) =>
      fvNetByAssumption({
        principal: p,
        monthly,
        years,
        annualRate: annualRateForEngine,
        compounding,
        taxRatePercent,
        feeRatePercent,
        baseYear,
      });

    const low = 0;
    let high = Math.max(1, goalAmount); // 최악 기준: 원금만으로도 근접
    let guard = 0;
    while (fn(high) < goalAmount && guard < 30) {
      high *= 1.5;
      guard += 1;
      if (high > goalAmount * 10) break;
    }

    return Math.max(
      0,
      binarySearchMinX({
        goal: goalAmount,
        low,
        high,
        fn,
      })
    );
  }, [
    result,
    goalAmount,
    years,
    currentFvNet,
    monthly,
    annualRate,
    compounding,
    taxRatePercent,
    feeRatePercent,
    baseYear,
  ]);

  // ✅ KRW 빠른 프리셋(만원 단위)
  const presets = useMemo(() => {
    if (currency !== "KRW") return [];
    return [
      { label: isKo ? "1억" : "₩100M", valueMan: 10_000 },
      { label: isKo ? "3억" : "₩300M", valueMan: 30_000 },
      { label: isKo ? "5억" : "₩500M", valueMan: 50_000 },
      { label: isKo ? "10억" : "₩1B", valueMan: 100_000 },
    ];
  }, [currency, isKo]);

  return (
    <div className="space-y-4">
      {/* 목표 금액 입력 */}
      <div>
        <label className="text-sm mb-1 block">{goalLabel}</label>

        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1"
            value={formattedGoal}
            onChange={handleGoalChange}
            placeholder={placeholder}
          />
        </div>

        {/* ✅ KRW 프리셋 */}
        {presets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.valueMan}
                type="button"
                className="btn-secondary text-xs"
                onClick={() => setGoalInput(String(p.valueMan))}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              className="btn text-xs"
              onClick={() => setGoalInput("")}
            >
              {isKo ? "초기화" : "Clear"}
            </button>
          </div>
        )}

        <p className="text-[11px] text-slate-500 mt-2">
          {isKo
            ? "※ 현재 가정(수익률·복리 주기·세금·수수료)을 그대로 적용해 역산합니다."
            : "※ Reverse-calculates using your current assumptions (rate, compounding, tax, fee)."}
        </p>
      </div>

      {goalAmount > 0 && (
        <>
          {/* ✅ 목표 달성 여부 안내 */}
          {currentFvNet >= goalAmount ? (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              {isKo
                ? "현재 조건 기준으로 이미 목표 자산에 도달합니다. (필요값은 0으로 표시)"
                : "With current assumptions, you already reach the goal. (Required values show 0)"}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            {/* 1) 필요한 월 투자금 */}
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="text-xs text-slate-500 mb-1">
                {isKo ? "필요 월 투자금" : "Required Monthly Investment"}
              </div>
              <div className="font-semibold text-lg flex items-baseline gap-2">
                <ValueDisplay value={monthlyNeed} locale={numberLocale} currency={currency} />
                <span className="text-sm text-slate-500">{isKo ? "/월" : "/mo"}</span>
              </div>
            </div>

            {/* 2) 필요한 연 수익률 */}
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="text-xs text-slate-500 mb-1">
                {isKo ? "필요 수익률" : "Required Annual Return"}
              </div>
              <div className="font-semibold text-lg">{rateNeed.toFixed(2)}%</div>
            </div>

            {/* 3) 필요한 초기 투자금 */}
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="text-xs text-slate-500 mb-1">
                {isKo ? "필요 초기 투자금" : "Required Initial Principal"}
              </div>
              <div className="font-semibold text-lg">
                <ValueDisplay value={principalNeed} locale={numberLocale} currency={currency} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
