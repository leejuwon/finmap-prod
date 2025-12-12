// _components/GoalEngineCard.js
import { useState, useMemo } from "react";
import ValueDisplay from "./ValueDisplay";

/* -------------------------------------------------------
   공통: locale 정규화 (ko/en/ko-KR/en-US 모두 대응)
------------------------------------------------------- */
function normalizeLocale(locale) {
  if (!locale) return "ko-KR";
  if (locale === "ko") return "ko-KR";
  if (locale === "en") return "en-US";
  return locale;
}

/* -------------------------------------------------------
   1) 필요한 월 투자금 계산
------------------------------------------------------- */
function requiredMonthlyToReachGoal({ goalAmount, principal, years, annualRate }) {
  if (years <= 0) return 0;

  const r = annualRate / 100 / 12; // 월이율
  const n = years * 12;

   // r=0 방어 (단순 합)
  if (r === 0) {
    const remaining = goalAmount - principal;
    if (remaining <= 0) return 0;
    return remaining / n;
  }

   // 미래가치 = P*(1+r)^n + PMT*((1+r)^n - 1)/r
  const pow = Math.pow(1 + r, n);
  const fvFromPrincipal = principal * pow;
  const remaining = goalAmount - fvFromPrincipal;
  if (remaining <= 0) return 0;

  return (remaining * r) / (pow - 1);
}

/* -------------------------------------------------------
   2) 필요한 연 수익률 계산 (이진 탐색)
------------------------------------------------------- */
function requiredRateToReachGoal({ goalAmount, principal, monthly, years }) {
  if (years <= 0) return 0;

  const n = years * 12;
  // 목표가 이미 '원금+적립합' 이하라면 (수익률 0으로도 가능)
  if (goalAmount <= principal + monthly * n) return 0;
  
  const fvAtRate = (ratePercent) => {
    const r = (ratePercent / 100) / 12;
    if (r === 0) return principal + monthly * n;

    const pow = Math.pow(1 + r, n);
    return principal * pow + monthly * ((pow - 1) / r);
  };

  let low = 0, high = 100, mid = 0;

  for (let i = 0; i < 40; i++) {
    mid = (low + high) / 2;
    //const r = mid / 100 / 12;
    //const n = years * 12;

    const fv = fvAtRate(mid);
      //principal * Math.pow(1 + r, n) +
      //monthly * ((Math.pow(1 + r, n) - 1) / r);

    if (fv >= goalAmount) high = mid;
    else low = mid;
  }

  return high;
}

/* -------------------------------------------------------
   3) 필요한 초기 투자금 계산
------------------------------------------------------- */
function requiredPrincipalToReachGoal({ goalAmount, monthly, years, annualRate }) {
  if (years <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;

   // r=0 방어
  if (r === 0) {
    const remaining = goalAmount - monthly * n;
    return remaining <= 0 ? 0 : remaining;
  }

  const pow = Math.pow(1 + r, n);
  const fvFromMonthly = monthly * ((pow - 1) / r);
  const remaining = goalAmount - fvFromMonthly;

  if (remaining <= 0) return 0;

  return remaining / pow;
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
  
  const isKo = String(locale).startsWith("ko");
  const numberLocale = normalizeLocale(locale);

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
    if (!result || goalAmount <= 0) return 0;
    return Math.max(
      0,
      requiredMonthlyToReachGoal({
        goalAmount,
        principal: invest.principal,
        years: invest.years,
        annualRate: result.annualRate,
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
    if (!result || goalAmount <= 0) return 0;
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

  return (
    <div className="space-y-4">
      {/* 목표 금액 입력 */}
      <div>
        <label className="text-sm mb-1 block">{goalLabel}</label>

        <input
          type="text"
          className="input"
          value={formattedGoal}
          onChange={handleGoalChange}
          placeholder={placeholder}
        />
      </div>

      {goalAmount > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* 1) 필요한 월 투자금 */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="text-xs text-slate-500 mb-1">
              {isKo ? "필요 월 투자금" : "Required Monthly Investment"}
            </div>
            <div className="font-semibold text-lg flex items-baseline gap-2">
              <ValueDisplay
                value={monthlyNeed}
                locale={numberLocale}
                currency={currency}
              />
              <span className="text-sm text-slate-500">
                {isKo ? "/월" : "/mo"}
              </span>
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
              <ValueDisplay
                value={principalNeed}
                locale={numberLocale}
                currency={currency}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
