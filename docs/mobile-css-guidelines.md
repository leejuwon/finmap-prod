# Finmap Mobile CSS Guidelines

Finmap 모바일 CSS 개선 1~8.5단계에서 정리한 운영 가이드입니다.
새 페이지나 컴포넌트를 만들 때는 이 문서를 기준으로 320px~768px 모바일 렌더링을 먼저 확인합니다.

## 1. 이번 작업 요약

### 공통 CSS

- `box-sizing`, 입력 요소, 버튼, 카드, 미디어 요소, table/code/pre 스크롤 처리를 공통 안정화했습니다.
- `body/html/#__next`의 `overflow-x` 차단은 보조 안전장치로만 유지합니다.
- 근본 해결은 각 컴포넌트 내부의 `min-w-0`, `max-w-full`, `overflow-x-auto` 적용입니다.

### Header / Layout / CTABar

- Header는 좁은 화면에서 전체 폭을 밀지 않도록 `min-w-0`, `max-w-full`, nav 내부 스크롤을 적용했습니다.
- 360px 이하에서는 Header 폭을 아끼기 위해 로고/간격을 줄이고, 한국어 표시를 `KO`로 축약합니다.
- CTABar는 safe-area를 고려하고, 사용하는 페이지는 하단 콘텐츠가 가려지지 않도록 `.fm-safe-bottom`을 적용합니다.
- CTABar PRO nav 탭은 최소 터치 높이를 보강했습니다.

### 부동산 대시보드 / 상세

- 필터, 카드, 리스트, 표가 320px~430px에서 화면 밖으로 밀리지 않도록 모바일 1열 중심으로 정리했습니다.
- 긴 단지명, 지역명, 가격/세대수/평형 텍스트는 줄바꿈 가능하게 처리했습니다.
- 부동산 상세 aptKey 페이지는 운영 데이터가 있는 환경에서 별도 재QA가 필요합니다.

### 블로그 상세 / 목록

- 블로그 H1/H2, 본문, 표, 코드블록, 관련글 카드가 모바일에서 body를 밀지 않게 보강했습니다.
- 본문 표는 내부 가로 스크롤을 사용하고, 관련글/추천글 카드는 모바일 1열을 기본으로 합니다.

### Tools / 계산기 CTA

- `/tools` 목록과 계산기 관련 CTA, ToolCta, CompoundCTA의 모바일 카드/버튼 흐름을 안정화했습니다.
- 결과 공유/PDF/관련 계산기 링크는 320px에서도 줄바꿈 또는 1열 배치가 가능해야 합니다.

### DCA Overflow QA 수정

- DCA 결과 화면에서 발생한 924px overflow 후보는 `grid`의 implicit track과 table `min-width` 전파가 원인이었습니다.
- 결과 grid와 form grid에 모바일 기본 `grid-cols-1`을 명시하고, table은 wrapper 내부 스크롤로 제한했습니다.

## 2. 핵심 원칙

- Mobile first로 작성합니다.
- 모든 주요 wrapper, grid, flex item, card 내부에는 `min-w-0`을 우선 검토합니다.
- 화면을 넘으면 안 되는 요소에는 `max-w-full`을 적용합니다.
- 긴 한글/영문/숫자 조합은 `break-words` 또는 필요한 경우 `overflow-wrap`으로 처리합니다.
- table은 본문 전체를 밀지 말고 내부 wrapper에서만 `overflow-x-auto`로 스크롤합니다.
- `body { overflow-x: hidden/clip; }`에만 의존하지 않습니다.
- fixed bottom CTA를 쓰는 페이지는 반드시 `.fm-safe-bottom`을 확인합니다.
- 최소 기준은 320px viewport입니다.

## 3. 카드 / Grid 규칙

- 모바일 기본은 `grid-cols-1`입니다.
- 390px 이상 2열은 꼭 필요한 경우에만 사용합니다.
- `sm`, `md`, `lg`에서 점진적으로 열 수를 늘립니다.
- `grid`만 쓰고 기본 column을 생략하면 내부 table/chart의 min-width가 부모 track을 키울 수 있습니다.
- 카드에는 `min-w-0 max-w-full`을 적용합니다.
- 카드 안의 제목/설명/값 영역도 `min-w-0 break-words leading-snug`을 검토합니다.
- 카드 안에 카드를 중첩하지 않습니다. 반복 항목, 모달, 도구 프레임에만 card를 사용합니다.

예시:

```jsx
<div className="grid min-w-0 max-w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
  <article className="card min-w-0 max-w-full">
    <h2 className="break-words leading-snug">...</h2>
  </article>
</div>
```

## 4. Form 규칙

- `input`, `select`, `textarea`, `button`은 기본적으로 `w-full min-w-0 max-w-full`을 검토합니다.
- 입력 요소 폰트는 iOS zoom 방지를 위해 16px 이상을 유지합니다.
- 버튼 터치 영역은 44px에 가깝게 둡니다.
- 오류 메시지는 `role="alert"` 영역에 표시합니다.
- 모바일에서 input/select/button을 한 줄에 3개 이상 억지로 넣지 않습니다.
- 금액+단위, 숫자 input+조건 select 조합은 320px에서 1열 또는 안정적인 2열까지만 허용합니다.

예시:

```jsx
<div className="grid min-w-0 max-w-full grid-cols-1 gap-3 md:grid-cols-4">
  <label className="grid min-w-0 gap-1">
    <span className="text-sm">월 투자금</span>
    <input className="input" />
  </label>
</div>
```

## 5. 표 / 차트 규칙

- table의 `min-width`는 반드시 wrapper 내부에서만 동작해야 합니다.
- wrapper는 `w-full min-w-0 max-w-full overflow-x-auto`를 사용합니다.
- table 자체가 body나 card 부모를 밀면 안 됩니다.
- `th`, `td`는 필요한 경우 `whitespace-nowrap`를 허용하되, wrapper 스크롤을 전제로 합니다.
- Chart.js/Recharts/canvas/svg wrapper에는 `min-w-0 max-w-full`을 적용합니다.
- 차트 높이는 모바일에서 너무 낮거나 과도하지 않게 `h-72 sm:h-80`처럼 단계적으로 둡니다.

예시:

```jsx
<div className="w-full min-w-0 max-w-full overflow-x-auto">
  <table className="min-w-[720px]">
    ...
  </table>
</div>
```

## 6. Header / CTA 규칙

### Header

- Header는 한 줄 sticky 구조를 유지합니다.
- nav는 좁은 화면에서 내부 스크롤을 허용합니다.
- nav를 스크롤할 수 있다는 힌트로 오른쪽 fade/gradient를 둘 수 있습니다.
- Header root, nav wrapper, nav list에는 `max-w-full min-w-0`을 유지합니다.
- 430px 이하에서는 도메인 텍스트를 숨기거나 표시 폭을 줄입니다.
- 360px 이하에서는 긴 언어 표기를 축약할 수 있습니다. 예: `한국어` -> `KO`.

### CTABar

- fixed CTABar 사용 페이지는 결과 root 또는 main wrapper에 `.fm-safe-bottom`을 적용합니다.
- CTABar 자체 safe-area padding만으로는 마지막 콘텐츠 가림을 완전히 막지 못합니다.
- PRO nav 탭은 최소 36~40px 높이를 유지합니다.
- PDF/공유 버튼은 320px에서 줄바꿈 또는 2열 배치가 깨지지 않아야 합니다.

## 7. 블로그 / 콘텐츠 규칙

- H1/H2는 `break-words leading-tight`을 기본으로 검토합니다.
- 모바일 article/card padding은 `p-4` 또는 `px-4` 수준을 우선합니다.
- 긴 URL, 영문 제목, 숫자 조합은 본문 폭을 밀지 않아야 합니다.
- `figure`, `img`, `video`는 `max-width: 100%`와 비율 유지가 필요합니다.
- 본문 table은 parser 또는 renderer 단계에서 내부 스크롤 wrapper를 유지합니다.
- `pre`, `code`는 내부 가로 스크롤을 사용합니다.
- FAQ `summary`는 줄바꿈을 허용하고 터치 영역을 충분히 둡니다.
- 관련글/추천글 카드는 모바일 1열, `sm` 이상 2열을 기본으로 합니다.

## 8. 계산기 페이지 규칙

- root wrapper는 아래 패턴을 기본으로 합니다.

```jsx
<div className="w-full max-w-full min-w-0 grid grid-cols-1 gap-6">
  ...
</div>
```

- 결과 grid는 모바일 `grid-cols-1`을 반드시 명시합니다.
- form grid도 모바일 `grid-cols-1`을 명시하고 `md` 이상에서 확장합니다.
- 관련 계산기 CTA는 모바일 1열, 390px 이상 또는 `sm` 이상에서 2열을 검토합니다.
- 공유/PDF 버튼은 320~375px에서 1열 또는 안정적인 2열을 허용합니다.
- 계산 결과 stat card는 긴 금액/단위가 줄바꿈되어도 카드 밖으로 나가면 안 됩니다.
- chart/table은 각각 wrapper 안에서만 overflow가 발생해야 합니다.
- 계산 로직과 레이아웃 수정은 분리해서 검증합니다.

## 9. QA 기준 Viewport

최소 아래 viewport에서 확인합니다.

- `320x720`
- `360x740`
- `390x844`
- `430x932`
- `768x1024`

가능하면 페이지별로 다음을 자동 수집합니다.

```js
document.documentElement.scrollWidth > document.documentElement.clientWidth
```

overflow 후보:

```js
Array.from(document.querySelectorAll('*')).filter(
  (el) => el.scrollWidth > el.clientWidth + 2
)
```

단, table 내부 스크롤 영역의 `table/th/td`는 wrapper가 `overflow-x-auto`라면 의도된 후보로 분류할 수 있습니다.

## 10. PR 체크리스트

- [ ] 320px에서 body/page 가로 스크롤이 없는가?
- [ ] Header nav가 body를 밀지 않는가?
- [ ] Header nav가 잘리는 경우 내부 스크롤 또는 fade 힌트가 있는가?
- [ ] root/card/grid/flex item에 필요한 `min-w-0`이 있는가?
- [ ] 화면 제한이 필요한 요소에 `max-w-full`이 있는가?
- [ ] 긴 한국어/영어 제목이 줄바꿈되는가?
- [ ] table은 wrapper 내부에서만 가로 스크롤되는가?
- [ ] chart/canvas/svg가 card 밖으로 나가지 않는가?
- [ ] fixed CTABar 사용 페이지에 `.fm-safe-bottom`이 있는가?
- [ ] CTABar가 마지막 콘텐츠를 가리지 않는가?
- [ ] input/select/button 터치 높이가 44px에 가까운가?
- [ ] 오류 메시지가 `role="alert"`로 노출되는가?
- [ ] 광고가 로드된 운영 화면에서도 폭을 밀지 않는가?
- [ ] 영어 긴 title/description/card text가 카드 밖으로 나가지 않는가?
- [ ] 320/360/390/430/768 viewport 스크린샷을 확인했는가?

## 운영 메모

- `overflow-x: hidden/clip`은 마지막 안전망입니다. overflow 원인을 숨기는 방식으로 끝내지 않습니다.
- 새 table/chart/CTA를 추가하면 반드시 320px에서 실제 렌더링 QA를 합니다.
- 운영 광고, 실제 부동산 데이터, 긴 영어 콘텐츠는 로컬 mock보다 폭 문제가 더 잘 드러날 수 있습니다.
- 부동산 상세 aptKey 페이지는 운영 데이터 환경에서 별도 QA 항목으로 유지합니다.
