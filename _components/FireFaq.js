// _components/FireFaq.js
export default function FireFaq({ lang = "ko" }) {
  const isKo = lang === "ko";

  const items = isKo
    ? [
        {
          q: "FIRE 목표 자산은 어떻게 계산되나요?",
          a: "FIRE 목표 자산 = 연 지출 ÷ 출금률(예: 4% rule)로 계산합니다.",
        },
        {
          q: "세금·수수료·인플레이션은 어떻게 반영되나요?",
          a: "명목 수익률에서 수수료를 빼고, 인플레이션을 반영한 실질 수익률을 계산한 뒤 세금을 적용합니다.",
        },
        {
          q: "은퇴 후 자산 고갈 시점은 무엇인가요?",
          a: "은퇴 구간에서 매년 지출을 차감하고 남은 자산에 실질 수익률을 적용했을 때 0원이 되는 시점입니다.",
        },
      ]
    : [
        {
          q: "How is the FIRE target calculated?",
          a: "FIRE target = Annual spending ÷ Withdrawal rate (e.g., 4% rule).",
        },
        {
          q: "How are tax, fee, and inflation applied?",
          a: "We subtract fees, adjust for inflation to get real return, then apply tax to compute after-tax real return.",
        },
        {
          q: "What does depletion year mean?",
          a: "It is the year in retirement when your assets reach zero after yearly withdrawals and returns.",
        },
      ];

  return (
    <div className="card w-full mt-6">
      <h2 className="text-lg font-semibold mb-3">
        {isKo ? "FIRE 계산기 자주 묻는 질문" : "FIRE Calculator FAQ"}
      </h2>

      <div className="space-y-3">
        {items.map((v, idx) => (
          <details
            key={idx}
            className="border border-slate-200 rounded-lg p-3 bg-slate-50"
            open={idx === 0}
          >
            <summary className="cursor-pointer font-medium text-sm">
              {v.q}
            </summary>
            <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
              {v.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
