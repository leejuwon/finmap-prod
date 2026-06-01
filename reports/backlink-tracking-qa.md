# Finmap 백링크 이벤트 추적 QA

점검일: 2026-06-01

## 1. GA4 이벤트 설계

### `tool_backlink_action`

대상 컴포넌트:
- `ToolSharePanel`
- `ToolCitationBox`

필수 파라미터:

| 파라미터 | 값 예시 | 설명 |
|---|---|---|
| `action` | `share_canonical`, `copy_canonical`, `copy_canonical_from_share`, `copy_citation_html` | 사용자가 실행한 백링크 관련 행동 |
| `source_tool` | `compound`, `cagr`, `dca`, `dsrLtv`, `goal`, `fire` | 현재 계산기 |
| `locale` | `ko`, `en` | 페이지 언어 |
| `location` | `top_share`, `citation_box` | 클릭 위치 |
| `source_path` | `/tools/cagr-calculator`, `/en/tools/cagr-calculator` | `trackGaEvent`에서 자동 주입 |
| `page_group` | `tool_detail` | `trackGaEvent`에서 자동 주입 |

### `related_calculator_click`

대상 컴포넌트:
- `RelatedCalculatorCtaGrid`

필수/권장 파라미터:

| 파라미터 | 값 예시 | 설명 |
|---|---|---|
| `action` | `click_related_calculator` | CTA 클릭 행동 |
| `target_tool` | `cagr`, `dca`, `dsrLtv` | 이동 대상 계산기 |
| `source_post` | `personalFinance/what-is-cagr` | 블로그 글 하단 CTA일 때 글 식별자 |
| `source` | `blog_detail` | CTA가 붙은 화면 맥락 |
| `locale` | `ko`, `en` | 페이지 언어 |
| `location` | `post_bottom` | 블로그 하단 CTA 위치 |
| `source_path` | `/posts/personalFinance/what-is-cagr` | `trackGaEvent`에서 자동 주입 |
| `page_group` | `blog_detail` | `trackGaEvent`에서 자동 주입 |

## 2. 블로그 하단 CTA 구분 기준

- 이벤트명: `related_calculator_click`
- 구분 파라미터:
  - `source = blog_detail`
  - `location = post_bottom`
  - `source_post = {categorySlug}/{slug}`
  - `target_tool = 클릭한 계산기`
- GA4 탐색 예시:
  - 이벤트 이름이 `related_calculator_click`인 행만 필터
  - `source_post`를 행 차원으로 추가
  - `target_tool`을 보조 차원 또는 열로 확인
  - `locale`로 한국어/영어 성과 분리

## 3. canonical 복사 QA 체크리스트

### 한국어 계산기

| 페이지 | 기대 복사 URL |
|---|---|
| `/tools/compound-interest` | `https://www.finmaphub.com/tools/compound-interest` |
| `/tools/cagr-calculator` | `https://www.finmaphub.com/tools/cagr-calculator` |
| `/tools/dca-calculator` | `https://www.finmaphub.com/tools/dca-calculator` |
| `/tools/dsr-ltv-calculator` | `https://www.finmaphub.com/tools/dsr-ltv-calculator` |
| `/tools/goal-simulator` | `https://www.finmaphub.com/tools/goal-simulator` |
| `/tools/fire-calculator` | `https://www.finmaphub.com/tools/fire-calculator` |

확인 항목:
- `canonical URL 복사` 클릭 시 alert가 표시된다.
- 클립보드 값이 쿼리스트링 없는 canonical URL이다.
- GA4 DebugView에서 `tool_backlink_action`이 기록된다.
- 이벤트 파라미터가 `action=copy_canonical`, `page_group=tool_detail`, `locale=ko`로 들어간다.

### 영어 계산기

| 페이지 | 기대 복사 URL |
|---|---|
| `/en/tools/compound-interest` | `https://www.finmaphub.com/en/tools/compound-interest` |
| `/en/tools/cagr-calculator` | `https://www.finmaphub.com/en/tools/cagr-calculator` |
| `/en/tools/dca-calculator` | `https://www.finmaphub.com/en/tools/dca-calculator` |
| `/en/tools/dsr-ltv-calculator` | `https://www.finmaphub.com/en/tools/dsr-ltv-calculator` |
| `/en/tools/goal-simulator` | `https://www.finmaphub.com/en/tools/goal-simulator` |
| `/en/tools/fire-calculator` | `https://www.finmaphub.com/en/tools/fire-calculator` |

확인 항목:
- `Copy canonical URL` 클릭 시 alert가 표시된다.
- 클립보드 값이 `/en/tools/...` canonical URL이다.
- GA4 DebugView에서 `tool_backlink_action`이 기록된다.
- 이벤트 파라미터가 `action=copy_canonical`, `page_group=tool_detail`, `locale=en`로 들어간다.

## 4. 인용 HTML 복사 QA

- `이 계산기를 인용하려면` 또는 `How to cite this calculator` 섹션으로 이동한다.
- `HTML 복사` 또는 `Copy HTML` 버튼을 클릭한다.
- alert가 표시되는지 확인한다.
- 클립보드 값이 아래 형태인지 확인한다.

```html
<a href="https://www.finmaphub.com/tools/cagr-calculator">CAGR 계산기</a>
```

- 영어 페이지에서는 href가 `/en/tools/...`이고 앵커 텍스트가 영어인지 확인한다.
- GA4 DebugView에서 `tool_backlink_action`이 기록되고 `action=copy_citation_html`, `location=citation_box`인지 확인한다.

## 5. 공유 버튼 QA

- Web Share API 지원 브라우저:
  - `이 계산기 공유하기` 또는 `Share calculator` 클릭
  - 네이티브 공유 UI가 열리는지 확인
  - 공유 URL이 canonical URL인지 확인
  - GA4 이벤트 `tool_backlink_action`, `action=share_canonical` 확인
- Web Share API 지원 브라우저에서 사용자가 공유창을 취소하는 경우:
  - canonical URL 복사 fallback alert가 뜨지 않는지 확인
  - GA4 DebugView에 `tool_backlink_action` 이벤트가 기록되지 않는지 확인
- Web Share API 미지원 브라우저:
  - 같은 버튼 클릭
  - canonical URL 복사 fallback alert 확인
  - GA4 이벤트 `tool_backlink_action`, `action=copy_canonical_from_share` 확인

## 6. 블로그 관련 계산기 CTA QA

예시 페이지:
- `/posts/personalFinance/what-is-cagr`
- `/posts/personalFinance/mortgage-risk-checklist-dsr-variable`
- `/en/posts/personalFinance/what-is-cagr`
- `/en/posts/personalFinance/mortgage-risk-checklist-dsr-variable`

확인 항목:
- 글 하단에 관련 계산기 CTA가 보인다.
- CTA 클릭 시 내부 계산기 페이지로 이동한다.
- 새 창을 열지 않고 `next/link` 내부 이동으로 동작한다.
- GA4 DebugView에서 `related_calculator_click`이 기록된다.
- 이벤트 파라미터에 `action=click_related_calculator`, `source=blog_detail`, `location=post_bottom`, `source_post`, `target_tool`이 들어간다.

## 7. UX 메모

- 복사 성공 UX는 현재 alert를 유지한다.
- `_components/ToolBacklinkKit.js`의 copy helper에 toast 전환 TODO 주석을 남겼다.
- 추후 사이트 전역 toast 패턴이 생기면 alert를 toast로 교체한다.

## 8. 검증 명령

- `npm.cmd run build`
- `git diff --check`
