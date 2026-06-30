# 복리 계산기 Phase 1-2 입력 UX 개선 보고서

- 작업일: 2026-06-30
- 대상: `/tools/compound-interest`, `/en/tools/compound-interest`
- 범위: 입력 배치, 보조 옵션 접힘, 세금/수수료 반영 여부, 계산 이벤트 파라미터

## 1. 변경 목적

Phase 1-1 감사에서 390×844 기준 입력 card가 1,817px, 계산 버튼이 2,873px 아래에 있었다. 긴 설명·사용법·예시·공유 UI보다 기본 입력을 먼저 노출하고, 세금과 수수료를 `0`으로 직접 바꾸지 않아도 제외할 수 있도록 입력 UX를 정리했다.

계산 공식, 결과 CTA, FAQ, SEO title/description, canonical, hreflang, sitemap, robots, AdSense는 변경하지 않았다.

## 2. 변경 파일

| 파일 | 변경 내용 |
| --- | --- |
| `pages/tools/compound-interest.js` | 입력 상단 배치, 보조 콘텐츠 결과 뒤 이동, toggle preset 저장, GA4 파라미터 추가 |
| `_components/CompoundForm.js` | 기본 입력 우선, 세 보조 영역 접힘, 세금/수수료 checkbox 구현 |
| `reports/compound-interest-phase1-input-ux.md` | 구현 및 검증 결과 기록 |

`reports/compound-interest-phase1-audit.md`는 Phase 1-1에서 생성된 기존 미추적 보고서이며 이번 구현에서 수정하지 않았다.

## 3. 입력 폼 배치 변경

### 변경 전

1. H1
2. 공유 패널
3. 긴 기능 설명과 기본 예시
4. KO 사용법, 공식, 예시 표
5. 입력 폼
6. 결과

### 변경 후

1. H1과 mode toggle
2. 짧은 설명과 핵심 기능 3개
3. 입력 폼
4. 결과
5. 사용법, 공식, 예시, 공유 패널
6. 기존 FAQ와 추천 콘텐츠

SEO용 설명 콘텐츠는 삭제하지 않고 `CompoundSupportContent`로 묶어 결과 뒤로 이동했다. H1은 locale별 1개를 유지한다.

### 390×844 실측

| 항목 | 변경 전 | 변경 후 |
| --- | ---: | ---: |
| 입력 card top | 1,817px | 521px |
| 계산 버튼 top | 2,873px | 950px |
| 입력 card viewport 깊이 | 약 2.2개 | 약 0.62개 |

입력 card가 첫 화면 안에서 시작하며 계산 버튼은 한 번의 일반적인 스크롤 범위에 들어온다.

## 4. 기본 입력과 접힘 구조

항상 표시하는 항목:

- 초기 투자금
- 월 적립금
- 연 수익률
- 투자 기간
- 계산하기 버튼

기본적으로 닫힌 native `details` 영역:

- 검증 샘플 A-D
- 비용·물가 옵션
- 고급 옵션

비용·물가 summary에는 현재 `세금 반영 ON/OFF`, `수수료 반영 ON/OFF` 상태를 표시한다. 통화 선택과 월복리 고정 안내는 기존 기능을 유지한 채 고급 옵션 안에 배치했다.

## 5. 세금/수수료 toggle 동작

세금과 수수료에 native checkbox를 추가했다.

| 상태 | rate 필드 | 계산 전달값 |
| --- | --- | --- |
| ON | 활성 | 입력한 rate |
| OFF | 비활성 표시, 기존 값 보존 | `0` |
| OFF 후 ON | 이전 입력값 복원 | 복원된 rate |

기본 상태는 기존 결과와 같도록 세금 ON, 수수료 ON이다.

URL/recent preset에는 다음을 함께 저장한다.

- 실제 입력한 `taxRatePercent`
- 실제 입력한 `feeRatePercent`
- `applyTax=true/false`
- `applyFee=true/false`

390px 브라우저 검증 결과:

- 기본: tax `15.4`, fee `0.5`, 두 checkbox ON
- 두 checkbox OFF: rate input은 disabled지만 `15.4`, `0.5` 유지
- URL에는 rate와 `applyTax=false`, `applyFee=false`가 함께 저장
- URL reload 후 두 checkbox OFF와 rate 값 유지
- 다시 ON 후 기본 계산 결과 복원

A-D preset도 각 sample의 tax/fee rate가 0이면 해당 checkbox를 OFF로, 0보다 크면 ON으로 맞춘다.

## 6. 계산 결과 보존

`lib/compoundCore.js`와 `lib/compound.js`의 계산 로직은 수정하지 않았다.

### 기본값

| 입력 | 값 |
| --- | ---: |
| 원금 | 1,000만원 |
| 월 적립금 | 30만원 |
| 연 수익률 | 7% |
| 기간 | 10년 |
| 세율 | 15.4%, ON |
| 수수료율 | 0.5%, ON |
| 물가상승률 | 0% |

- 변경 전 세후 최종금액: `6,600.2만원`
- 변경 후 세후 최종금액: `6,600.2만원`
- 세금/수수료 OFF 결과: `7,202.2만원`
- checkbox 재활성화 결과: `6,600.2만원`

기본 결과가 보존되고 off/on 동작만 의도대로 계산 조건을 바꾼다.

### A-D 검증

`node scripts\verify_compound_calculator.js` 실행 결과:

| sample | 결과 |
| --- | --- |
| A 기본형 | PASS |
| B 장기 적립 | PASS |
| C 수익률 0% | PASS |
| D 손실 수익률 | PASS |

## 7. GA4 변경

이벤트명은 변경하지 않았다. 입력 변경 시 이벤트를 발송하지 않으며 기존처럼 계산 버튼에서만 `tool_calculate`가 발송된다.

추가한 `tool_calculate` 파라미터:

- `has_tax`
- `has_fee`
- `has_inflation`

기본값 runtime event:

- `source_tool=compound`
- `has_tax=true`
- `has_fee=true`
- `has_inflation=false`

두 checkbox OFF 후 runtime event는 `has_tax=false`, `has_fee=false`로 확인했다.

다음 기존 이벤트명은 그대로 유지한다.

- `tool_calculate`
- `tool_result_action`
- `tool_result_cta_view`
- `tool_result_cta_click`
- `tool_hub_click`
- `tool_nav_click`
- `tool_backlink_action`

## 8. 모바일 및 tablet 확인

production build를 로컬 서버로 실행하고 Chrome headless에서 확인했다.

| viewport | 입력 card top | viewport 깊이 | 계산 버튼 top | 가로 overflow | form control 경계 이탈 |
| --- | ---: | ---: | ---: | --- | --- |
| 320×720 | 491px | 0.68 | 886px | 없음 | 없음 |
| 360×740 | 488px | 0.66 | 900px | 없음 | 없음 |
| 390×844 | 521px | 0.62 | 950px | 없음 | 없음 |
| 430×932 | 555px | 0.60 | 1,001px | 없음 | 없음 |
| 768×1024 | 405px | 0.40 | 683px | 없음 | 없음 |

공통 확인 결과:

- H1 1개
- 세 `details` 모두 기본 닫힘
- 기본 input label과 값 잘림 없음
- 계산 버튼 잘림 없음
- 비용 옵션 열고 닫기 정상
- checkbox on/off와 rate disabled 상태 정상
- 결과 chart와 summary 정상 렌더링
- 결과 sticky navigation과 공유 버튼 겹침 없음

## 9. 빌드와 SEO 검증

| 명령 | 결과 |
| --- | --- |
| `node scripts\verify_compound_calculator.js` | PASS |
| `npm.cmd run build` | PASS, Next.js 214개 static page 생성 |
| postbuild sitemap 생성 | PASS, main 204 / KO 106 / EN 98 URL |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `git diff --check` | PASS |

검증 과정에서 재생성된 sitemap과 기존 verifier 보고서는 작업 범위 밖 변경을 남기지 않도록 복원했다. 임시 viewport screenshot도 삭제했다.

## 10. SEO 정책 변경 없음

- SEO title/description 변경 없음
- self canonical 유지
- KO/EN hreflang 유지
- sitemap 생성 정책 변경 없음
- robots/noindex 변경 없음
- FAQPage JSON-LD 변경 없음
- AdSense 구조 변경 없음

## 11. Phase 1-3 이관 항목

이번 단계에서 제외하고 다음 단계로 넘긴다.

1. 결과 CTA를 FAQ보다 앞에 배치
2. 모바일 결과 summary 밀도 축소
3. goal, DCA, CAGR, FIRE CTA 우선순위 검토
4. 결과 해석과 기간별/시나리오 비교 강화
5. 단리식 일시금 비교의 설명 및 별도 검증

SEO title 정합성과 FAQ 확장은 Phase 1-4 범위로 유지한다.
