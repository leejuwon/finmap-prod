// _components/FireFaq.js — JSON-LD Export 지원 버전

export function getFaqItems(lang = "ko") {
  const isKo = lang === "ko";

  return isKo
    ? [
        {
          q: "은퇴자금 계산기는 무엇을 계산하나요?",
          a: "현재 자산, 저축액, 은퇴 생활비, 기대수익률, 물가상승률, 출금률을 입력해 은퇴 시점 예상 자산과 필요한 은퇴자금을 비교합니다.",
        },
        {
          q: "노후자금 계산기와 FIRE 계산기는 어떻게 다른가요?",
          a: "노후자금 계산기는 은퇴 후 생활비를 감당할 목표자산을 보는 데 초점이 있고, FIRE 계산기는 더 이른 은퇴나 경제적 자유 가능성을 같은 숫자로 점검하는 방식입니다.",
        },
        {
          q: "FIRE 목표 자산은 어떻게 계산되나요?",
          a: "기본 공식은 목표 은퇴자금 = 연 지출 ÷ 출금률입니다. 예를 들어 연 지출 3,600만원과 출금률 4%를 쓰면 목표자산은 약 9억원입니다.",
        },
        {
          q: "4% 룰은 무엇인가요?",
          a: "4% 룰은 은퇴 첫해에 자산의 4% 정도를 인출한다고 가정해 필요한 목표자산을 추정하는 간단한 기준입니다. 실제로는 은퇴기간, 세금, 수수료, 물가, 시장 변동을 함께 봐야 합니다.",
        },
        {
          q: "월 은퇴 생활비는 어떻게 입력하나요?",
          a: "월 생활비를 12개월로 곱해 연 지출로 바꿔 입력합니다. 주거비, 건강보험료, 의료비, 부양비, 여행·여가비를 따로 더해 은퇴 버전의 생활비를 만드는 것이 좋습니다.",
        },
        {
          q: "국민연금이나 개인연금은 어떻게 반영하나요?",
          a: "연금 수령액이 있다면 은퇴 생활비에서 해당 현금흐름을 뺀 부족분을 목표로 계산하는 편이 현실적입니다. 다만 수령 시점과 금액, 세금, 물가연동 여부는 별도로 확인해야 합니다.",
        },
        {
          q: "출금률은 FIRE에 어떤 영향을 주나요?",
          a: "출금률은 은퇴 후 매년 자산에서 인출하는 비율입니다. 출금률을 낮게 잡을수록 필요한 은퇴자금은 커지지만 자산 고갈 위험은 낮아질 수 있습니다.",
        },
        {
          q: "세금과 수수료는 어떻게 반영되나요?",
          a: "세율은 투자 수익에, 수수료는 장기 수익률을 낮추는 비용으로 단순 반영합니다. 실제 계좌 유형과 상품에 따라 세금·보수 구조가 다를 수 있습니다.",
        },
        {
          q: "인플레이션이 중요한 이유는 무엇인가요?",
          a: "물가가 오르면 같은 금액으로 살 수 있는 상품과 서비스가 줄어듭니다. 은퇴자금 계산에서는 명목 자산뿐 아니라 구매력 기준 실질 자산을 함께 봐야 합니다.",
        },
        {
          q: "은퇴 후 자산 고갈 시점은 무엇인가요?",
          a: "은퇴 후 매년 생활비를 인출하고 남은 자산에 수익률을 반영했을 때 자산이 0원이 되는 시점입니다. 수익률 순서와 초기 몇 년의 지출이 결과에 큰 영향을 줄 수 있습니다.",
        },
        {
          q: "계산 결과를 은퇴 가능성 보장으로 봐도 되나요?",
          a: "아니요. 이 계산기는 입력한 가정에 따른 교육용 추정 도구입니다. 실제 은퇴 준비는 소득, 지출, 보험, 세금, 연금, 투자 변동성을 함께 점검해야 합니다.",
        },
      ]
    : [
        {
          q: "How is the FIRE target calculated?",
          a: "FIRE target = Annual spending ÷ Withdrawal rate (e.g., 4% rule).",
        },
        {
          q: "What is nominal return?",
          a: "Return before adjusting for tax, fees, and inflation.",
        },
        {
          q: "How does the withdrawal rate affect FIRE?",
          a: "Higher withdrawal rates require larger FIRE target assets and increase depletion risk.",
        },
        {
          q: "How is tax applied?",
          a: "Tax is applied to investment returns. This calculator uses nominalAfterTax = (nominal return - fee) × (1 - tax), then real return = (1 + nominalAfterTax) ÷ (1 + inflation) - 1.",
        },
        {
          q: "What does the fee represent?",
          a: "ETF/fund fees and brokerage costs that reduce long-term growth.",
        },
        {
          q: "Why is inflation important?",
          a: "Inflation reduces purchasing power and must be included in FIRE assumptions.",
        },
        {
          q: "How is real return calculated?",
          a: "Real return = (1 + (nominal return - fee) × (1 - tax)) ÷ (1 + inflation) - 1. It reflects purchasing-power growth after estimated tax, fees, and inflation.",
        },
        {
          q: "Why show real vs nominal assets?",
          a: "Nominal = account balance, Real = inflation-adjusted purchasing power.",
        },
        {
          q: "What does depletion year mean?",
          a: "The year assets reach zero after withdrawals and growth.",
        },
      ];
}

export default function FireFaq({ lang = "ko" }) {
  const items = getFaqItems(lang);
  const isKo = lang === "ko";

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
