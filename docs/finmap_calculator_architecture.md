📘 ① FinMap 복리 계산기 — 정식 아키텍처 문서 (2025.12 기준 최신 상태)

아키텍처는 크게 5개 레이어로 구성됨:

1. UX/UI Layer (Pages & Components)
1-1. Pages
/pages/tools/compound-interest.js

복리 계산기 메인 페이지.

역할:

상태 관리(state)

calcCompound() 호출

idealResult/simpleResult 생성

Summary / Chart / Tables / Drag Breakdown / Goal Engine 렌더링

PDF 다운로드 & CTA Bar 처리

SEO + JSON-LD 출력

구성 섹션:

언어/통화 상태

입력 Form (CompoundForm)

계산 결과 Summary

성장 차트 (CompoundChart)

연간 테이블 (CompoundYearTable)

단리 비교 테이블

Drag Decomposition 그래프 (손실 요인 분해)

Goal Engine (역산 엔진)

FAQ + CTA + Share

📌 중요한 점
이 페이지는 “렌더링 컨트롤러” 역할이며, 로직 없이
모든 계산은 lib/compound.js에서,
UI는 _components에서,
상태는 페이지 내부에서만 유지함.

1-2. Components Layer
CompoundForm

입력 UI 전체 담당.

역할:

principal / monthly / annualRate / years 입력

taxRatePercent / feeRatePercent 입력

compounding / currency 설정

계산 버튼 → onSubmit() 호출

중요한 규칙:
Form은 계산 로직을 절대 포함하지 않음.
출력은 무조건 “순수 JSON 값”만 반환.

CompoundChart

자산 성장 차트.

입력:

data (세후)
idealData (세전)
lumpData (단리)
principal
monthly
currency
locale


역할:

Chart.js 기반 라인 차트

단위 scaling 자동 조정

세전/세후/단리 구간 비교

CompoundYearTable

연간 요약 테이블.

입력:

result.yearSummary
principal, monthly, currency, locale

DragBreakdownChart

세전 대비 세후의 차이(세금·수수료·복리효과 상실)를 시각화.

입력:

idealFV, netFV, taxDrag, feeDrag, compoundDrag

GoalEngineCard

역산 엔진(목표 달성 엔진).

역할:

목표 금액 입력

requiredMonthlyToReachGoal()

requiredRateToReachGoal()

requiredPrincipalToReachGoal()
출력

중요한 점
GoalEngineCard는 페이지의 result/invest 값만 받아서 계산함.
페이지 내부 state에는 어떠한 영향도 없음.

1-3. CTA Layer
CompoundCTA

PDF 다운로드

공유하기

URL 복사
등을 제공.

CTABar (하단 고정)

모바일 UX 개선을 위한 고정 CTA.

📘 ② Domain Logic Layer (lib/compound.js)

이 레이어는 본질적인 금융 계산 로직을 담당.

절대 UI 로직과 섞이지 않음.

2-1. Core Logic
_coreCompoundCalc()

진짜 “심장부”.

역할:

세금 반영 복리 계산

수수료 반영

월/연 복리

연간 summary 빌드

누적 interest/tax/fee 처리

환매 수수료 처리

세전/세후 모두 같은 이 함수를 사용하되,
입력 taxRate·feeRate를 0으로 주면 이상치(세전)가 됨.

2-2. API-Style Wrapper
calcCompound()

세후 계산(세금/수수료 있음)

calcCompoundNoTaxFee()

세전 이상치

calcSimpleLump()

단리식 계산

2-3. Formatting / Unit Utility

numberFmt()

UNIT_OPTIONS

pickUnit()

formatScaledAmount()

2-4. Goal Engine Logic (역산 엔진)

최근 추가된 기능:

✔ requiredMonthlyToReachGoal()

목표 달성 위해 매월 얼마를 넣어야 하나?

✔ requiredRateToReachGoal()

현재 입력 기준 목표 달성에 필요한 수익률은?

✔ requiredPrincipalToReachGoal()

목표를 달성하기 위해 필요한 초기 원금은?

이 3개는 기존 로직을 건드리지 않고 완전 독립된 함수로 추가되어 있기 때문에 안정성 100%

📘 ③ Rendering & SEO Layer
SeoHead

title/desc/og:image 자동 출력

hreflang 처리

JsonLd

FAQ 구조화 데이터 자동 생성

📘 ④ State Layer

페이지 내부 state 목록:

lang, currency

result (세후 결과)
idealResult (세전)
simpleResult (단리)

invest {
  principal,
  monthly,
  years
}

simpleInvest { ... }

form 입력값은 CompoundForm 내부에서만 유지됨


📌 state는 한 방향 흐름(One-way flow)
Form → Page(onSubmit) → Calculation → Rendering
이 구조 때문에 안정성이 매우 높음.

📘 ⑤ Page Flow Architecture (전체 데이터 흐름)
사용자 입력
    │
    ▼
CompoundForm (입력만 담당)
    │ onSubmit(form)
    ▼
CompoundPage 내부 onSubmit()
    │
    ├─ calcCompound()
    ├─ calcCompoundNoTaxFee()
    └─ calcSimpleLump()
    ▼
3개 결과(result, ideal, simple)
    │
    ├─ Summary
    ├─ CompoundChart
    ├─ CompoundYearTable(복리)
    ├─ CompoundYearTable(단리)
    ├─ DragBreakdownChart
    └─ GoalEngineCard  ← 추가됨 (독립 컴포넌트)


구조가 매우 깨끗한 단방향 데이터 플로우
React + Next.js 정석 구조