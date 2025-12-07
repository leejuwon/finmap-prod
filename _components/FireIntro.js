// _components/FireIntro.js — PROFESSIONAL GUIDE VERSION

export default function FireIntro({ lang = "ko" }) {
  const isKo = lang === "ko";

  return (
    <div className="card mb-6 border border-slate-200">
      
      <h2 className="text-lg md:text-xl font-semibold mb-3">
        {isKo
          ? "FIRE 계산기는 이렇게 활용하세요"
          : "How to use this FIRE calculator"}
      </h2>

      <p className="text-sm text-slate-700 leading-relaxed mb-3">
        {isKo
          ? "FinMap FIRE 계산기는 ‘실질 세후 수익률’을 기반으로 은퇴 가능 시점과 은퇴 후 자산이 유지되는 기간을 예측합니다."
          : "FinMap FIRE calculator estimates FIRE timing and post-retirement asset sustainability using real after-tax returns."}
      </p>

      <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
        <li>
          {isKo
            ? "🔹 FIRE 목표 자산 = 연 지출 ÷ 출금률(4% rule 등)"
            : "FIRE Target = Annual spending ÷ Withdrawal rate (e.g., 4% rule)"}
        </li>

        <li>
          {isKo
            ? "🔹 실질 수익률(Real Return)은 명목 수익률에서 세금·수수료·인플레이션을 모두 반영한 실제 투자 성장률입니다."
            : "Real Return reflects actual investment growth after tax, fee, and inflation adjustments."}
        </li>

        <li>
          {isKo
            ? "🔹 적립 구간·은퇴 구간을 분리해 연도별 자산 변화를 계산합니다."
            : "Simulates the accumulation and retirement phases separately."}
        </li>

        <li>
          {isKo
            ? "🔹 시각화된 자산 곡선을 통해 FIRE 도달 시점과 은퇴 후 자산 고갈 가능성을 한눈에 확인할 수 있습니다."
            : "Provides visual curves to highlight FIRE timing and depletion risk."}
        </li>

        <li>
          {isKo
            ? "🔹 선택 시 MonteCarlo 확률 분석을 통해 리스크까지 함께 확인할 수 있습니다."
            : "Optionally, MonteCarlo simulation shows risk probabilities."}
        </li>
      </ul>
    </div>
  );
}
