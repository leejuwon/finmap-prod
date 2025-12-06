// _components/FireIntro.js
export default function FireIntro({ lang = "ko" }) {
  const isKo = lang === "ko";

  return (
    <div className="card mb-6">
      <h2 className="text-lg font-semibold mb-2">
        {isKo ? "FIRE 계산기는 이렇게 활용하세요" : "How to use this FIRE calculator"}
      </h2>

      <p className="text-sm text-slate-600 mb-2">
        {isKo
          ? "FIRE 목표자산, 은퇴 가능 시점, 은퇴 후 자산 지속 기간을 한 번에 시각적으로 확인할 수 있습니다."
          : "You can visually understand FIRE targets, retirement timing, and asset sustainability."}
      </p>

      <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
        <li>
          {isKo
            ? "FIRE 목표 자산 = 연 지출 ÷ 출금률(예: 4% rule)"
            : "FIRE target = Annual spending ÷ Withdrawal rate (e.g., 4% rule)"}
        </li>
        <li>
          {isKo
            ? "세금·수수료·인플레이션을 반영한 실질 세후 수익률을 기반으로 계산합니다."
            : "Uses after-tax real return accounting for tax, fee, and inflation."}
        </li>
        <li>
          {isKo
            ? "적립 구간과 은퇴 구간을 각각 시뮬레이션하여 연도별 자산을 계산합니다."
            : "Simulates accumulation and retirement phases separately with yearly asset projection."}
        </li>
      </ul>
    </div>
  );
}
