export default function FireFaq({ lang = "ko" }) {
  const isKo = lang === "ko";

  const items = isKo
    ? [
        {
          q: "FIRE 목표 자산은 어떻게 계산되나요?",
          a: "FIRE 목표 자산 = 연 지출 ÷ 출금률(예: 4% rule)로 계산됩니다.",
        },
        {
          q: "명목 연 수익률이란 무엇인가요?",
          a: "세금·수수료·물가를 고려하기 전의 ‘표면적인 투자 수익률’을 의미합니다. 예: 명목 5%는 1년 뒤 자산이 1.05배가 된다는 뜻입니다.",
        },
        {
          q: "출금률은 FIRE에 어떤 영향을 주나요?",
          a: "출금률은 은퇴 후 매년 자산에서 인출하는 비율입니다. 출금률이 높으면 FIRE 목표 자산이 커지고, 은퇴 후 자산 고갈 위험도 증가합니다.",
        },
        {
          q: "세금은 어떻게 반영되나요?",
          a: "세율은 투자 수익에 적용됩니다. 실질 수익률 = (명목 – 수수료 – 물가) × (1 – 세율) 방식으로 반영됩니다.",
        },
        {
          q: "수수료는 어떤 의미인가요?",
          a: "ETF·펀드의 운영보수 또는 증권사 수수료 등 장기적으로 자산 성장률을 낮추는 모든 비용을 단순화하여 반영합니다.",
        },
        {
          q: "인플레이션이 중요한 이유는 무엇인가요?",
          a: "물가가 오르면 같은 금액으로 구매할 수 있는 상품의 양이 줄어듭니다. 즉 인플레이션은 ‘구매력’을 감소시키며, FIRE 계산에서는 반드시 고려해야 합니다.",
        },
        {
          q: "실질 수익률은 어떻게 계산되나요?",
          a: "실질 수익률 = (명목 수익률 – 수수료 – 인플레이션) × (1 – 세율)\n즉, 물가·세금·수수료를 모두 반영한 실제 구매력 기반 투자 수익률입니다.",
        },
        {
          q: "왜 실질 자산과 명목 자산이 다르게 표시되나요?",
          a: "명목 자산은 실제 잔고이며, 실질 자산은 물가를 반영한 ‘구매력 가치’입니다. 두 값이 함께 표시되면 FIRE의 현실적인 가능성을 더 정확하게 이해할 수 있습니다.",
        },
        {
          q: "은퇴 후 자산 고갈 시점은 무엇인가요?",
          a: "은퇴 후 매년 지출을 차감하고 남은 자산에 수익률을 반영했을 때 0원이 되는 시점입니다. 출금률과 실질 수익률에 크게 좌우됩니다.",
        },
      ]
    : [
        {
          q: "How is the FIRE target calculated?",
          a: "FIRE target = Annual spending ÷ Withdrawal rate (e.g., 4% rule).",
        },
        {
          q: "What is nominal return?",
          a: "Return before adjusting for tax, fees, and inflation. For example, 5% nominal return means assets grow 1.05× in a year.",
        },
        {
          q: "How does the withdrawal rate affect FIRE?",
          a: "Higher withdrawal rates require larger FIRE target assets and increase the risk of depletion.",
        },
        {
          q: "How is tax applied in the calculation?",
          a: "Tax rate applies to investment gains. Real return = (Nominal – fee – inflation) × (1 – tax).",
        },
        {
          q: "What does the fee represent?",
          a: "Management fees, ETF expense ratios, and brokerage costs — simplified into one value affecting long-term returns.",
        },
        {
          q: "Why is inflation important?",
          a: "Inflation reduces purchasing power. Even if your nominal assets grow, real asset value may stagnate unless inflation is considered.",
        },
        {
          q: "How is real return calculated?",
          a: "Real return = (Nominal return – fees – inflation) × (1 – tax). This represents true purchasing-power growth.",
        },
        {
          q: "Why show both real and nominal assets?",
          a: "Nominal assets show account balance; real assets show inflation-adjusted value. Both are needed for a realistic FIRE analysis.",
        },
        {
          q: "What does depletion year mean?",
          a: "It is the year when assets reach zero after applying yearly withdrawals and growth.",
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
