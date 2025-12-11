// _components/GoalEngineCard.js
import { useState, useMemo } from "react";

/* -------------------------------------------------------
   1) 필요한 월 투자금 계산
------------------------------------------------------- */
function requiredMonthlyToReachGoal({ goalAmount, principal, years, annualRate }) {
  if (years <= 0) return 0;

  const r = annualRate / 100 / 12; // 월이율
  const n = years * 12;

  // 미래가치 = P*(1+r)^n + PMT*((1+r)^n - 1)/r
  const fvFromPrincipal = principal * Math.pow(1 + r, n);
  const remaining = goalAmount - fvFromPrincipal;
  if (remaining <= 0) return 0;

  return (remaining * r) / (Math.pow(1 + r, n) - 1);
}

/* -------------------------------------------------------
   2) 필요한 연 수익률 계산 (이진 탐색)
------------------------------------------------------- */
function requiredRateToReachGoal({ goalAmount, principal, monthly, years }) {
  if (years <= 0) return 0;
  if (goalAmount <= principal + monthly * 12 * years) return 0;

  let low = 0, high = 100, mid = 0;

  for (let i = 0; i < 40; i++) {
    mid = (low + high) / 2;
    const r = mid / 100 / 12;
    const n = years * 12;

    const fv = 
      principal * Math.pow(1 + r, n) +
      monthly * ((Math.pow(1 + r, n) - 1) / r);

    if (fv >= goalAmount) high = mid;
    else low = mid;
  }

  return high;
}

/* -------------------------------------------------------
   3) 필요한 초기 투자금 계산
------------------------------------------------------- */
function requiredPrincipalToReachGoal({ goalAmount, monthly, years, annualRate }) {
  const r = annualRate / 100 / 12;
  const n = years * 12;

  const fvFromMonthly = monthly * ((Math.pow(1 + r, n) - 1) / r);
  const remaining = goalAmount - fvFromMonthly;

  if (remaining <= 0) return 0;

  return remaining / Math.pow(1 + r, n);
}

/* -------------------------------------------------------
   GoalEngineCard Component
------------------------------------------------------- */
export default function GoalEngineCard({
  locale = "ko",
  currency = "KRW",
  result,
  idealResult,
  invest,
  taxRatePercent,
  feeRatePercent,
}) {

  const [goalInput, setGoalInput] = useState("");

  const handleGoalChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setGoalInput(raw);
  };

  const formattedGoal = goalInput.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // KRW = 만원 단위 입력 → 실제 금액 ×10,000
  const goalAmount =
    Number(goalInput || 0) * (currency === "KRW" ? 10_000 : 1);

  // 실제 역산 계산
  const monthlyNeed = useMemo(() => {
    if (goalAmount <= 0) return 0;
    return Math.max(
      0,
      requiredMonthlyToReachGoal({
        goalAmount,
        principal: invest.principal,
        years: invest.years,
        annualRate: result.annualRate, // 세전/세후 상관없음
      })
    );
  }, [goalAmount, invest, result]);

  const rateNeed = useMemo(() => {
    if (goalAmount <= 0) return 0;
    return requiredRateToReachGoal({
      goalAmount,
      principal: invest.principal,
      monthly: invest.monthly,
      years: invest.years,
    });
  }, [goalAmount, invest]);

  const principalNeed = useMemo(() => {
    if (goalAmount <= 0) return 0;
    return Math.max(
      0,
      requiredPrincipalToReachGoal({
        goalAmount,
        monthly: invest.monthly,
        years: invest.years,
        annualRate: result.annualRate,
      })
    );
  }, [goalAmount, invest, result]);

  const moneyFmt = (v) =>
    new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US").format(
      Math.round(v)
    );

  return (
    <div className="space-y-4">
      {/* 목표 금액 입력 */}
      <div>
        <label className="text-sm mb-1 block">
          {locale === "ko" ? "목표 자산 (만원)" : "Target Amount"}
        </label>

        <input
          type="text"
          className="input"
          value={formattedGoal}
          onChange={handleGoalChange}
          placeholder={locale === "ko" ? "예: 50,000" : "ex: 50,000"}
        />
      </div>

      {goalAmount > 0 && (
        <div className="grid gap-4 md:grid-cols-3">

          {/* 1) 필요한 월 투자금 */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="text-xs text-slate-500 mb-1">
              {locale === "ko" ? "필요 월 투자금" : "Required Monthly Investment"}
            </div>
            <div className="font-semibold text-lg">
              ₩{moneyFmt(monthlyNeed)}
            </div>
          </div>

          {/* 2) 필요한 연 수익률 */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="text-xs text-slate-500 mb-1">
              {locale === "ko" ? "필요 수익률" : "Required Annual Return"}
            </div>
            <div className="font-semibold text-lg">{rateNeed.toFixed(2)}%</div>
          </div>

          {/* 3) 필요한 초기 투자금 */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="text-xs text-slate-500 mb-1">
              {locale === "ko" ? "필요 초기 투자금" : "Required Initial Principal"}
            </div>
            <div className="font-semibold text-lg">
              ₩{moneyFmt(principalNeed)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
