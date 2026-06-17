---
slug: "dsr-pass-ltv-cash-bottleneck"
link: "/posts/personalFinance/dsr-pass-ltv-cash-bottleneck"
title: "DSR은 통과했는데 왜 집을 못 살까? LTV·현금·부대비용 병목 이해하기"
description: "DSR은 통과해도 LTV, 보유현금, 부대비용 때문에 후보 집값이 불가 또는 주의로 나올 수 있습니다. DSR/LTV 계산기 샘플 A~D로 병목을 설명합니다."
datePublished: "2026-06-02"
dateModified: "2026-06-02"
seoTitle: "DSR 통과 후 LTV 현금 부대비용 병목 이해하기 | 아파트 구매 가능 금액"
seoDescription: "DSR 병목과 LTV/현금 병목의 차이를 설명하고, DSR/LTV 계산기 후보 집값 가능·주의·불가 판정을 샘플 A~D로 정리합니다."
category: "재테크"
postCategory: "personalFinance"
tags: ["DSR 계산기", "LTV 계산기", "현금 병목", "아파트 구매 가능 금액", "주담대 한도", "부대비용", "부동산 실거래"]
tool: ["dsr-ltv"]
cover: "https://res.cloudinary.com/dwonflmnn/image/upload/v1780362440/blog/insight/dsr_cover.png"
lang: "ko"
---

“DSR은 괜찮다는데 왜 계산기에서 후보 집값이 불가로 나오지?” 주택담보대출을 처음 계산하면 자주 만나는 질문입니다. 이유는 간단합니다. DSR은 세 가지 조건 중 하나일 뿐입니다.

아파트 구매 가능 금액은 DSR, LTV, 보유현금, 부대비용이 동시에 맞아야 합니다. [DSR/LTV 계산기](/tools/dsr-ltv-calculator)는 이 조건을 한 화면에서 보고 후보 집값을 `가능 / 주의 / 불가`로 판정합니다.

판정 후에는 안전 탐색 가격대를 [부동산 대시보드](/market/real-estate)에서 서울·경기·인천 실거래 가격 분포와 비교하세요. 이 글의 숫자는 입력값 기준 시뮬레이션이며, 정책 자동 반영이나 실제 심사 보장을 의미하지 않습니다.

## 한눈에 보는 요약

- DSR 병목은 소득 대비 월상환 여력이 먼저 한도를 제한하는 경우입니다.
- LTV/현금 병목은 보유 현금, LTV, 부대비용이 구매 가능 가격을 먼저 제한하는 경우입니다.
- 후보 집값 판정은 DSR 조건, LTV 조건, 현금 조건을 따로 확인합니다.
- 모든 조건이 통과하면 `가능`, 부족률이 5% 이내면 `주의`, 그 이상이면 `불가`로 볼 수 있습니다.
- 계산기 샘플 A~D는 같은 공식으로 병목과 판정을 비교하는 검증용 입력값입니다.
- 계산 후 [부동산 대시보드](/market/real-estate)에서 안전 탐색 가격대의 실제 거래를 확인해야 합니다.

## DSR 병목과 LTV/현금 병목의 차이

| 병목 | 먼저 막히는 조건 | 대표 증상 | 조정할 수 있는 입력 |
| --- | --- | --- | --- |
| DSR 병목 | 소득 대비 월상환 여력 | 대출 가능액이 후보 필요 대출액보다 작다 | 소득, 기존부채, 금리, 기간, 후보 가격 |
| LTV 병목 | 집값 대비 대출 비율 | 필요한 대출액이 LTV상 최대 대출액보다 크다 | LTV 입력값, 보유현금, 후보 가격 |
| 현금 병목 | 자기자본과 부대비용 | 후보 필요 현금보다 보유 현금이 부족하다 | 보유자산, 최소 남길 현금, 부대비용률, 후보 가격 |

DSR만 통과했다고 해서 LTV와 현금 조건이 자동으로 통과되는 것은 아닙니다. 반대로 현금이 충분해도 소득 대비 월상환 여력이 부족하면 DSR 병목이 생깁니다.

## 후보 집값 판정은 세 조건을 따로 본다

| 조건 | 계산 방식 | 통과 의미 |
| --- | --- | --- |
| DSR 조건 | 후보 필요 대출액 <= DSR 기준 대출 가능액 | 소득 대비 월상환 여력 안에 들어옴 |
| LTV 조건 | 후보 필요 대출액 <= 후보 집값 × LTV | 집값 대비 대출 비율 안에 들어옴 |
| 현금 조건 | 보유 현금 >= 후보 집값 × (1 - LTV + 부대비용률) | 자기자본과 부대비용을 감당 |

계산기에서 `주의`는 일부 항목이 부족하지만 최대 부족률이 5% 이내인 경우입니다. `주의`는 실제 승인 가능성을 뜻하지 않고, 조정 여지가 가까운지 확인하는 신호입니다.

<figure>
  <img src="https://res.cloudinary.com/dwonflmnn/image/upload/v1780362444/blog/insight/dsr_img1.png" alt="DSR LTV 현금 세 조건을 따로 확인하는 아파트 구매 가능 금액 체크 구조" />
  <figcaption>후보 집값은 DSR, LTV, 현금 조건을 각각 나눠 봐야 병목이 보인다</figcaption>
</figure>

## 계산기 샘플 A~D로 보는 병목

| 샘플 | 핵심 입력 | 최종 구매 가능 가격 | 병목 | 후보 판정 | 부족 항목 |
| --- | --- | ---: | --- | --- | --- |
| A 기본형 | 연소득 6천, 현금 2억, 금리 4%, LTV 70%, 후보 6억 | 5억 7,143만원 | 현금/LTV | 주의 | DSR, LTV, 현금 |
| B 기존부채/DSR 병목 | 연소득 5천, 현금 3억, 기존 월상환 50만원, 금리 5%, 후보 6억 | 3억 1,047만원 | DSR | 불가 | DSR |
| C 현금/LTV 병목 | 연소득 1.2억, 현금 1억, LTV 60%, 후보 2.5억 | 2억 2,222만원 | 현금/LTV | 불가 | LTV, 현금 |
| D 매수 가능형 | 연소득 8천, 현금 3억, 기존 월상환 20만원, 금리 3.5%, 후보 7억 | 8억 5,714만원 | 현금/LTV | 가능 | 없음 |

샘플 A는 부족률이 5% 이내라 `주의`입니다. 샘플 B는 현금은 충분해도 기존부채와 금리 때문에 DSR이 먼저 막힙니다. 샘플 C는 소득은 충분하지만 LTV와 현금이 부족합니다. 샘플 D는 세 조건을 모두 통과합니다.

<figure>
  <img src="https://res.cloudinary.com/dwonflmnn/image/upload/v1780362446/blog/insight/dsr_img2.png" alt="DSR LTV 계산기 샘플 A부터 D까지 병목 패턴과 후보 집값 판정 비교" />
  <figcaption>샘플 A-D는 같은 계산식에서 병목이 어떻게 달라지는지 보여준다</figcaption>
</figure>

## 예시 계산: DSR은 되는데 현금이 부족한 경우

| 항목 | 값 |
| --- | ---: |
| 후보 집값 | 6억원 |
| LTV / 부대비용률 | 70% / 5% |
| 후보 LTV상 최대 대출액 | 4억 2,000만원 |
| 후보 필요 현금 | 2억 1,000만원 |
| 보유 현금 | 2억원 |
| 현금 부족액 | 1,000만원 |

이 경우 DSR 대출 가능액이 충분해도 현금 조건에서 막힐 수 있습니다. 부대비용률을 낮게 잡거나 최소 남길 현금을 0으로 두면 계산이 과하게 낙관적으로 보일 수 있습니다.

## 오해하기 쉬운 포인트: LTV 70%면 현금 30%만 있으면 된다는 생각

> **오해:** “LTV 70%면 집값의 30% 현금만 있으면 된다.”

부대비용률이 5%라면 필요한 현금은 단순히 30%가 아니라 약 35%입니다. 여기에 이사비, 수리비, 비상금까지 남겨야 한다면 실제로 매수에 투입 가능한 현금은 더 줄어듭니다.

그래서 [DSR/LTV 계산기](/tools/dsr-ltv-calculator)에 부대비용률과 최소 남길 현금을 함께 입력해야 합니다.

## 체크리스트: 부족 항목별 조정 방법

- □ DSR이 부족하면 기존 월상환액, 금리, 대출기간, 후보 가격을 먼저 조정한다.
- □ LTV가 부족하면 후보 가격을 낮추거나 자기자금을 늘리는 방향을 본다.
- □ 현금이 부족하면 부대비용과 최소 남길 현금을 다시 확인한다.
- □ `주의`는 통과가 아니라 조정 필요 신호로 본다.
- □ 최종 구매 가능 가격보다 안전 탐색 가격대 80~90%를 먼저 본다.
- □ 계산된 가격대는 [부동산 대시보드](/market/real-estate)에서 실거래로 확인한다.

<figure>
  <img src="https://res.cloudinary.com/dwonflmnn/image/upload/v1780362449/blog/insight/dsr_img3.png" alt="DSR LTV 계산기에서 안전 탐색 가격대를 확인한 뒤 부동산 실거래 대시보드로 이동하는 흐름" />
  <figcaption>계산기에서 병목과 안전 탐색 가격대를 확인한 뒤 실거래 분포로 다시 좁힌다</figcaption>
</figure>

## 같이 보면 좋은 글

- [DSR 40% 연봉별 주담대 한도표](/posts/personalFinance/dsr-40-income-loan-limit-table)
- [보유현금 1억·2억·3억이면 어느 가격대 아파트까지 가능할까?](/posts/personalFinance/cash-100m-200m-300m-apartment-budget)
- [아파트 매수 전 대출 리스크 체크리스트](/posts/personalFinance/mortgage-risk-checklist-dsr-variable)

## 결론: “DSR 통과”보다 “세 조건 동시 통과”가 중요하다

아파트 구매 가능 금액은 DSR만으로 결정되지 않습니다. DSR, LTV, 현금, 부대비용이 동시에 맞아야 하고, 실제 심사는 금융기관별 기준에 따라 달라질 수 있습니다.

먼저 [DSR/LTV 계산기](/tools/dsr-ltv-calculator)의 샘플 A~D를 눌러 병목 차이를 확인해 보세요. 그런 다음 내 후보 가격을 입력하고, 안전 탐색 가격대를 [부동산 대시보드](/market/real-estate)에서 실제 거래 가격대와 비교하면 판단이 훨씬 선명해집니다.

## FAQ

### DSR만 통과하면 대출이 가능한 것 아닌가요?

아닙니다. DSR은 소득 대비 상환 여력이고, LTV와 현금 조건은 별도입니다. 세 조건 중 하나라도 크게 부족하면 후보 집값은 어려울 수 있습니다.

### `주의` 판정은 실제 승인 가능성이 있다는 뜻인가요?

아닙니다. 입력값 기준으로 부족률이 5% 이내라는 뜻일 뿐입니다. 실제 금융기관 심사와는 다를 수 있습니다.

### 부대비용률은 왜 현금 조건에 들어가나요?

취득세, 중개보수, 이사비 등은 대출로 모두 해결하기 어렵고 현금 부담을 늘리기 때문입니다.

### 계산기 샘플 A~D는 무엇인가요?

DSR 병목, 현금/LTV 병목, 매수 가능형을 비교할 수 있도록 만든 검증용 KRW 입력값입니다. 정책 자동 반영이 아니라 계산 공식 확인용 샘플입니다.

### 대시보드는 어떤 단계에서 보면 좋나요?

계산기에서 안전 탐색 가격대를 확인한 뒤 바로 보는 것이 좋습니다. 실제 거래가 그 가격대에 충분히 있는지 확인해야 합니다.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "DSR은 통과했는데 왜 집을 못 살까? LTV·현금·부대비용 병목 이해하기",
  "description": "DSR은 통과해도 LTV, 보유현금, 부대비용 때문에 후보 집값이 불가 또는 주의로 나올 수 있습니다.",
  "inLanguage": "ko",
  "datePublished": "2026-06-02",
  "dateModified": "2026-06-02",
  "author": { "@type": "Organization", "name": "FinMap" },
  "publisher": { "@type": "Organization", "name": "FinMap" },
  "mainEntityOfPage": "https://www.finmaphub.com/posts/personalFinance/dsr-pass-ltv-cash-bottleneck"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "DSR만 통과하면 대출이 가능한 것 아닌가요?",
      "acceptedAnswer": { "@type": "Answer", "text": "아닙니다. DSR은 소득 대비 상환 여력이고, LTV와 현금 조건은 별도입니다. 세 조건 중 하나라도 크게 부족하면 후보 집값은 어려울 수 있습니다." }
    },
    {
      "@type": "Question",
      "name": "주의 판정은 실제 승인 가능성이 있다는 뜻인가요?",
      "acceptedAnswer": { "@type": "Answer", "text": "아닙니다. 입력값 기준으로 부족률이 5% 이내라는 뜻일 뿐입니다. 실제 금융기관 심사와는 다를 수 있습니다." }
    },
    {
      "@type": "Question",
      "name": "부대비용률은 왜 현금 조건에 들어가나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "취득세, 중개보수, 이사비 등은 대출로 모두 해결하기 어렵고 현금 부담을 늘리기 때문입니다." }
    },
    {
      "@type": "Question",
      "name": "계산기 샘플 A~D는 무엇인가요?",
      "acceptedAnswer": { "@type": "Answer", "text": "DSR 병목, 현금/LTV 병목, 매수 가능형을 비교할 수 있도록 만든 검증용 KRW 입력값입니다. 정책 자동 반영이 아니라 계산 공식 확인용 샘플입니다." }
    },
    {
      "@type": "Question",
      "name": "대시보드는 어떤 단계에서 보면 좋나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "계산기에서 안전 탐색 가격대를 확인한 뒤 바로 보는 것이 좋습니다. 실제 거래가 그 가격대에 충분히 있는지 확인해야 합니다." }
    }
  ]
}
</script>
