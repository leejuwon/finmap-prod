# Finmap 수익형 P0 개선 배포 후 검증 체크리스트

- 작성일: 2026-06-04
- 대상: DSR/LTV 계산기, 복리 계산기, 부동산 대시보드의 광고·CTA·GA4 이벤트
- 범위: 코드 검증 및 운영 환경 수동 검증 절차
- 이번 작업: 코드 변경 없음, 계산 로직 변경 없음, 광고 슬롯 추가 없음

## 1. 결론

코드상 CTA 양방향 연결과 GA 이벤트 호출은 구성되어 있다. 다만 운영 배포 후 반드시 확인해야 할 핵심 이슈가 있다.

| 우선순위 | 확인 결과 | 영향 |
| --- | --- | --- |
| 해결 | `pages/_app.js`의 `ADSENSE_PATHS`에 `/tools/dsr-ltv-calculator`, `/tools/compound-interest` 추가 | 2026-06-04 핫픽스로 직접 진입 AdSense 스크립트 로드 경로 보완 |
| P1 | `result_ad_view`는 실제 광고 fill이 아니라 광고 슬롯 컨테이너의 viewport 진입 이벤트 | 이벤트 수와 AdSense 노출 수가 일치하지 않는 것이 정상 |
| P1 | DSR/LTV는 입력 변경 후 600ms마다 이벤트가 발생할 수 있음 | 천천히 입력하거나 여러 필드를 수정하면 `dsr_ltv_calculate`가 실제 의도보다 많아질 수 있음 |
| P2 | `trackGaEvent`는 `window.gtag`가 없으면 조용히 종료함 | GA 환경변수 누락, 태그 로드 전 조기 행동, 차단 확장 프로그램 사용 시 이벤트가 수집되지 않음 |

정적 코드만으로 실제 GA4 수신과 AdSense fill을 확정할 수는 없다. 아래 체크리스트를 운영 URL, GA4 DebugView, 브라우저 개발자 도구, AdSense 보고서에서 완료해야 한다.

## 2. `result_ad_view` 발생 조건

`_components/ResultAdSlot.js`는 다음 조건을 모두 만족하면 `result_ad_view`를 슬롯 마운트당 한 번 호출한다.

1. `slot` 값이 비어 있지 않다.
2. `ResultAdSlot` 컴포넌트가 렌더된다.
3. 브라우저가 `IntersectionObserver`를 지원한다.
4. 광고 슬롯의 바깥 `<aside>`가 viewport에 50% 이상 들어온다.
5. 해당 컴포넌트 인스턴스에서 아직 이벤트를 기록하지 않았다.
6. 이벤트 호출 시점에 `window.gtag`가 함수로 존재한다.

`config/adSlots.js`의 `inArticle1`, `inArticle2`는 현재 비어 있지 않으므로 슬롯 렌더 조건은 충족한다.

### 페이지별 차이

| 페이지 | 슬롯 렌더 조건 | `position` |
| --- | --- | --- |
| DSR/LTV | 기본 입력값의 결과가 첫 진입부터 렌더되므로 사용자 입력 전에도 슬롯 존재 | `summary_after`, `sensitivity_after` |
| 복리 계산기 | `hasResult === true`, 즉 사용자가 계산을 완료한 후에만 슬롯 존재 | `summary_after`, `chart_after` |
| 부동산 대시보드 | `ResultAdSlot`을 사용하지 않음 | `result_ad_view` 발생하지 않음 |

DSR/LTV에서는 사용자가 계산값을 수정하지 않아도 결과 영역까지 스크롤하면 `result_ad_view`가 발생할 수 있다. 복리 계산기에서는 계산 전에는 발생하지 않아야 한다.

`trackedRef`는 브라우저 세션 전체가 아니라 컴포넌트 인스턴스 기준이다. 페이지 재진입, 컴포넌트 재마운트, 복리 계산기의 렌더 모드 전환 상황에서는 같은 `position` 이벤트가 다시 발생할 수 있다.

## 3. `dsr_ltv_calculate` 과다 발생 가능성

### 현재 동작

- 모든 숫자 입력의 `onChange`에서 600ms 디바운스 타이머를 다시 시작한다.
- 프리셋 선택도 같은 타이머를 시작한다.
- 최초 페이지 로드만으로는 `dsr_ltv_calculate`가 발생하지 않는다.
- 빠르게 연속 입력하면 마지막 변경 후 이벤트 1개로 합쳐진다.

### 과다 발생 가능성이 있는 경우

- 숫자를 입력하면서 각 키 입력 사이를 600ms 이상 멈추는 경우
- 여러 입력 필드를 천천히 순서대로 수정하는 경우
- 같은 프리셋을 반복해서 클릭하는 경우
- 유효하지 않거나 0인 값을 입력해도 `has_result: true`로 기록되는 경우

현재 폼 값 해시 중복 제거, 세션당 상한, 유효 결과 확인은 없다. 따라서 위험도는 **중간**으로 판단한다.

### 운영 검증

- [ ] 숫자 5자리를 빠르게 입력했을 때 `dsr_ltv_calculate`가 약 1회 발생하는지 확인
- [ ] 각 숫자 입력 사이를 1초씩 멈췄을 때 여러 번 발생하는지 확인
- [ ] 프리셋 1회 클릭 후 이벤트가 1회 발생하는지 확인
- [ ] 페이지 첫 진입만으로 이벤트가 발생하지 않는지 확인
- [ ] 하루 운영 데이터에서 사용자당 이벤트 수가 비정상적으로 높지 않은지 확인

향후 과다 수집이 확인되면 `onBlur` 기준 측정, 폼 값 해시 중복 제거, 더 긴 디바운스, 명시적 계산 행동 기준 측정을 검토할 수 있다. 이번 작업에서는 변경하지 않았다.

## 4. GA4 DebugView 확인 목록

### 사전 조건

- [ ] 운영 환경에 `NEXT_PUBLIC_GA_ID`가 설정되어 있는지 확인
- [ ] 브라우저에서 `window.gtag`가 함수인지 확인
- [ ] Tag Assistant 또는 GA Debugger 등으로 DebugView 세션을 활성화
- [ ] 광고·분석 차단 확장 프로그램과 강한 추적 방지 기능을 테스트 동안 비활성화
- [ ] GA4 DebugView에서 현재 테스트 기기가 표시되는지 확인

코드에는 `debug_mode: true`가 직접 설정되어 있지 않으므로 DebugView 활성화를 별도로 해야 한다.

모든 `trackGaEvent` 이벤트에는 `utils/analytics.js`에서 `page_group`, `source_path`가 자동 추가된다.

### 이벤트 및 필수 파라미터

| 이벤트명 | 기대 페이지 | 필수 파라미터 |
| --- | --- | --- |
| `dsr_ltv_calculate` | DSR/LTV | `source_tool=dsr_ltv`, `locale`, `interaction=input_change 또는 preset`, `has_result=true`, `page_group=tool_detail`, `source_path` |
| `result_ad_view` | DSR/LTV | `source_tool=dsr_ltv`, `position=summary_after 또는 sensitivity_after`, `locale`, `page_group`, `source_path` |
| `result_ad_view` | 복리 계산기 | `source_tool=compound`, `position=summary_after 또는 chart_after`, `locale`, `page_group`, `source_path` |
| `dsr_to_dashboard_click` | DSR/LTV | `source_tool=dsr_ltv`, `locale`, `location=result_header 또는 result_dashboard_cta 또는 related_section`, `page_group`, `source_path` |
| `dashboard_to_dsr_click` | 부동산 대시보드 | `source_page=real_estate`, `locale`, `result_count`, `location=result_bottom`, `page_group=real_estate_dashboard`, `source_path` |

같이 확인할 기존 이벤트:

| 이벤트명 | 목적 |
| --- | --- |
| `tool_calculate` | 복리 계산 완료 확인 |
| `real_estate_search` | 대시보드 검색 결과와 `result_count` 확인 |
| `dashboard_ad_slot_render` | 대시보드 광고 슬롯 마운트 확인. viewport 진입 이벤트는 아님 |

### 권장 테스트 순서

#### DSR/LTV

- [ ] 운영 URL에 직접 진입
- [ ] 입력 없이 결과 광고 영역까지 스크롤: `result_ad_view`는 발생 가능, `dsr_ltv_calculate`는 없어야 함
- [ ] 입력값 빠르게 변경: `dsr_ltv_calculate` 확인
- [ ] 프리셋 선택: `interaction=preset` 확인
- [ ] 결과 헤더 CTA: `location=result_header` 확인
- [ ] 결과 내 대시보드 CTA: `location=result_dashboard_cta` 확인
- [ ] 하단 관련 섹션 CTA: `location=related_section` 확인
- [ ] 대시보드 이동 URL에 `priceMetric`, `priceMin`, `priceMax`가 포함되는지 확인

#### 복리 계산기

- [ ] 계산 전 `result_ad_view`가 발생하지 않는지 확인
- [ ] 계산 버튼 클릭 후 `tool_calculate` 확인
- [ ] 핵심 결과 요약 뒤까지 스크롤: `position=summary_after` 확인
- [ ] 차트 뒤까지 스크롤: `position=chart_after` 확인
- [ ] Basic/Desktop와 PRO Mobile 각각 한 화면에서 최대 2개 슬롯 이벤트만 발생하는지 확인

#### 부동산 대시보드

- [ ] 검색 결과 1건 이상 상태에서 `real_estate_search`와 `result_count` 확인
- [ ] 결과가 있을 때만 DSR/LTV CTA가 나타나는지 확인
- [ ] CTA 클릭 시 `dashboard_to_dsr_click`, `location=result_bottom` 확인
- [ ] 결과 0건일 때 CTA가 나타나지 않는지 확인
- [ ] 대시보드 광고는 `dashboard_ad_slot_render`만 발생하고 `result_ad_view`는 발생하지 않는지 확인

KO와 EN URL에서 각각 `locale=ko`, `locale=en`도 확인한다.

## 5. AdSense fill과 `result_ad_view`의 차이

| 항목 | 의미 |
| --- | --- |
| `result_ad_view` | 광고 슬롯 바깥 컨테이너가 viewport에 50% 이상 들어왔고 GA 호출이 가능했다는 의미 |
| `data-fm-ads-pushed="1"` | `adsbygoogle.push({})` 호출을 시도했다는 의미 |
| AdSense fill | Google이 실제 광고 소재를 슬롯에 채웠다는 의미 |
| AdSense impression | 실제 노출로 AdSense가 집계한 값 |

`ResultAdSlot`은 실제 광고 상태나 fill 여부를 읽지 않는다. 따라서 다음 상황이 모두 가능하다.

- `result_ad_view`는 발생했지만 광고가 unfilled 상태
- 광고 차단기로 광고가 보이지 않지만 `result_ad_view`는 발생
- AdSense 스크립트가 없지만 슬롯 컨테이너가 보여 `result_ad_view`는 발생
- 광고 요청이 늦게 처리되어 `result_ad_view` 시점에는 아직 광고가 없음

### 코드상 P0 fill 갭 해결

2026-06-04 핫픽스로 `pages/_app.js`의 AdSense 스크립트 로드 대상에 DSR/LTV와 복리 계산기를 추가했다.

따라서 두 계산기 운영 URL에 직접 진입하면:

1. `ResultAdSlot` 컨테이너는 렌더될 수 있다.
2. `result_ad_view`도 발생할 수 있다.
3. 전역 AdSense 스크립트가 로드된다.
4. `AdSenseUnit`이 슬롯 진입 시 `adsbygoogle.push({})`를 시도할 수 있다.

실제 fill과 노출 집계는 AdSense 정책, 수요, 광고 차단 환경에 따라 별도로 확인해야 한다.

### 운영 fill 확인 방법

- [ ] DSR/LTV와 복리 계산기를 각각 새 시크릿 창의 직접 URL로 연다
- [ ] Network에서 AdSense 스크립트 요청이 있는지 확인
- [ ] 결과 슬롯의 `<ins class="adsbygoogle">`에 `data-fm-ads-pushed="1"`이 생기는지 확인
- [ ] Google이 추가하는 광고 상태 속성이 있다면 filled/unfilled 여부를 확인
- [ ] 슬롯 안에 실제 광고 소재가 표시되는지 확인
- [ ] AdSense 보고서에서 해당 페이지의 광고 요청, 일치율, 노출이 집계되는지 확인

## 6. DSR/LTV ↔ 부동산 대시보드 CTA 연결

| 방향 | 위치 | 이벤트 | 코드 검증 |
| --- | --- | --- | --- |
| DSR/LTV → 대시보드 | 결과 헤더 | `dsr_to_dashboard_click`, `location=result_header` | 연결됨 |
| DSR/LTV → 대시보드 | 결과 내 가격대 CTA | `dsr_to_dashboard_click`, `location=result_dashboard_cta` | 연결됨 |
| DSR/LTV → 대시보드 | 하단 관련 섹션 | `dsr_to_dashboard_click`, `location=related_section` | 연결됨 |
| 대시보드 → DSR/LTV | 검색 결과 하단 | `dashboard_to_dsr_click`, `location=result_bottom` | 연결됨, 결과가 있을 때만 노출 |

DSR 결과 영역의 대시보드 링크는 안전 탐색 가격대가 있으면 가격 필터 쿼리를 포함한다. 양방향 이벤트 호출은 Next.js `Link`의 `onClick`에서 라우팅 전에 실행된다.

운영 환경에서는 클릭 직후 DebugView에 이벤트가 남는지 확인해야 한다. 현재 이벤트 전송 완료 callback이나 beacon 강제 설정은 없다.

## 7. 광고와 버튼 간격 코드 점검

| 페이지 | 코드 기준 점검 | 판정 |
| --- | --- | --- |
| DSR/LTV 첫 광고 | 결과 전체 섹션과 관련 링크가 끝난 뒤 배치. 광고 컴포넌트에 `my-6` 적용 | 계산 입력/버튼과 떨어져 있음 |
| DSR/LTV 두 번째 광고 | 민감도 표 뒤, 면책 안내 전 배치 | CTA와 인접하지 않음 |
| 복리 첫 광고 | 계산 완료 후 결과 요약 뒤 배치 | 계산 버튼과 다른 결과 영역에 있음 |
| 복리 두 번째 광고 | 차트 뒤 배치 | CTA 직전 배치가 아님 |
| 대시보드 상단 광고 | 필터가 아니라 결과 컨트롤 아래에 배치, 여백 적용 | 필터 위 광고 없음. 새로고침 버튼과의 실제 모바일 간격은 시각 확인 필요 |
| 대시보드 하단 광고/CTA | 하단 광고 뒤 CTA에 `mt-10` 적용 | 코드상 충분한 분리 여백 존재 |

코드 기준으로 계산 버튼이나 강한 CTA에 광고가 붙어 있지는 않다. 다만 실제 광고 높이와 반응형 레이아웃은 운영 fill 후 달라질 수 있으므로 모바일·데스크톱 시각 검증이 필요하다.

- [ ] 모바일 360~390px에서 광고와 버튼이 한 화면에서 붙어 보이지 않는지 확인
- [ ] 데스크톱에서 광고 라벨과 CTA가 혼동되지 않는지 확인
- [ ] 광고가 unfilled일 때 빈 공간이 버튼처럼 보이지 않는지 확인
- [ ] 광고 fill 후 레이아웃 이동으로 버튼과 광고가 가까워지지 않는지 확인

## 8. 이벤트명 개선 제안

현재 `result_ad_view`는 실제 광고 view 또는 fill을 의미하는 것처럼 읽히지만, 구현은 슬롯 컨테이너 viewport 진입 측정이다. 의미를 정확히 하려면 `result_ad_slot_view`가 더 적합하다.

권장안:

1. 데이터 수집을 아직 본격 시작하지 않았다면 `result_ad_slot_view`로 변경을 검토한다.
2. 이미 대시보드나 보고서를 만들었다면 일정 기간 두 이벤트를 함께 보내거나 GA4 데이터 정의를 마이그레이션한다.
3. 실제 fill을 별도로 측정할 수 있을 때만 `result_ad_fill` 같은 별도 이벤트를 추가한다.

이번 작업에서는 이벤트명을 변경하지 않았다.

## 9. 배포 후 최종 판정표

| 항목 | 기대 결과 | 상태 |
| --- | --- | --- |
| DSR 직접 진입 AdSense 스크립트 | 핫픽스로 로드 대상 추가 | 운영 확인 필요 |
| 복리 직접 진입 AdSense 스크립트 | 핫픽스로 로드 대상 추가 | 운영 확인 필요 |
| 대시보드 AdSense 스크립트 | 로드 대상 경로 | 운영 확인 필요 |
| DSR `result_ad_view` | 기본 결과 스크롤 시 최대 슬롯별 1회 | 운영 확인 필요 |
| 복리 `result_ad_view` | 계산 완료 후 슬롯별 1회 | 운영 확인 필요 |
| DSR 계산 이벤트 | 빠른 연속 입력은 디바운스, 느린 입력은 복수 발생 가능 | 운영 분포 확인 필요 |
| DSR → 대시보드 CTA 이벤트 | 세 위치 모두 수집 | 운영 확인 필요 |
| 대시보드 → DSR CTA 이벤트 | 결과 존재 시 수집 | 운영 확인 필요 |
| 광고/버튼 시각 간격 | 코드상 분리됨 | 운영 모바일·데스크톱 확인 필요 |

## 10. 코드 검증 근거

- `_components/ResultAdSlot.js`: 50% viewport 진입 시 `result_ad_view`
- `_components/AdSenseUnit.js`: 300px 사전 로드, `adsbygoogle.push` 재시도 및 push 표시
- `_components/DsrLtvCalculator.js`: 600ms 계산 이벤트 디바운스, DSR 결과 광고와 대시보드 CTA 이벤트
- `pages/tools/dsr-ltv-calculator.js`: 하단 대시보드 CTA 이벤트
- `pages/tools/compound-interest.js`: `hasResult` 이후 결과 광고
- `pages/market/real-estate.js`: 결과 광고 최대 3개, 결과 존재 시 DSR CTA 이벤트
- `utils/analytics.js`: `window.gtag` 존재 시에만 이벤트 전송, `page_group`과 `source_path` 자동 추가
- `config/adSlots.js`: 결과 광고에 사용하는 슬롯 값 설정됨
- `pages/_app.js`: GA4 및 페이지별 AdSense 전역 스크립트 로드 조건

## 11. 검증 명령

- 대상 코드 검색 및 이벤트/슬롯/CTA 연결 추적: `rg`
- 작업 무결성 검사: `git diff --check` — PASS
- 신규 리포트 단독 검사: `git diff --check -- reports/revenue-p0-post-deploy-checklist.md` — PASS
- 후속 AdSense 경로 핫픽스 후 `npm.cmd run build` — PASS
