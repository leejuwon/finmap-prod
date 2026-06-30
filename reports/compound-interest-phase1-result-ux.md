# 복리 계산기 Phase 1-3 결과 UX 개선 보고서

- 작업일: 2026-06-30
- 대상: `/tools/compound-interest`, `/en/tools/compound-interest`
- 범위: 결과 CTA 순서, 모바일 summary 밀도, 관련 계산기 순서

## 1. 변경 목적

계산 결과 직후의 전환 행동을 FAQ보다 먼저 노출하고, 모바일 PRO mode에서 핵심 결과를 빠르게 읽을 수 있도록 summary 밀도를 낮췄다. 계산 공식과 SEO 정책은 변경하지 않았다.

## 2. 변경 파일

| 파일 | 변경 내용 |
| --- | --- |
| `pages/tools/compound-interest.js` | compact prop 연결, CTA/관련 계산기/FAQ 순서 조정 |
| `_components/CompoundDetailSummary.js` | 모바일 compact summary 추가 |
| `reports/compound-interest-phase1-result-ux.md` | 구현 및 검증 기록 |

Phase 1-2의 `CompoundForm.js` 변경은 그대로 보존했으며 이번 단계에서 추가 수정하지 않았다.

## 3. 결과 CTA 위치 변경

변경 전:

1. summary와 chart
2. 상세 분석
3. FAQ
4. `ToolResultCta`
5. 관련 계산기

변경 후:

1. summary와 chart
2. 상세 분석 또는 모바일 고급 분석 접힘
3. `ToolResultCta`
4. 관련 계산기
5. FAQ

- `ToolResultCta` runtime count: 1개
- `sectionEls.current.cta` ref 유지
- `location="result_after"` 유지
- CTA는 모든 viewport에서 FAQ보다 DOM과 화면 순서 모두 앞에 있다.

390×844 실측:

| 항목 | Phase 1-1 | Phase 1-3 |
| --- | ---: | ---: |
| summary 높이 | 1,465px | 235px |
| CTA top | 6,248px | 2,639px |
| FAQ top | 5,568px | 4,258px |

CTA가 약 3,609px 위로 이동했고 9개 FAQ를 지나기 전에 노출된다.

desktop/basic에서는 기존 상세 분석과 PDF export 범위를 보존하기 위해 상세 분석 뒤, FAQ 앞 순서를 유지했다. 향후 CTA를 chart 직후로 더 이동하려면 `pdf-target`을 분리하거나 export 제외 처리를 함께 설계해야 한다.

## 4. 모바일 compact summary

`CompoundDetailSummary`에 `compact` prop을 추가하고 PRO mobile에서만 사용한다.

먼저 표시하는 핵심 4개:

1. 세후 최종금액
2. 총 납입원금
3. 세후 수익
4. 물가 반영 현재가치

`세부 지표 더 보기` native details에 포함한 항목:

- 세전 투자수익
- 예상 세금
- 수수료 영향
- 총수익률
- CAGR 참고값
- 초기 투자금 미래가치
- 월 납입금 미래가치
- 결과 해석과 계산 가정

390px에서 details 닫힘 높이는 235px, 펼침 높이는 863px였으며 상세 metric 7개가 표시됐다. 768px basic layout은 기존 full summary를 유지한다.

## 5. 관련 계산기 CTA

`ToolCta`가 기존부터 `fire` type과 `/tools/fire-calculator` route를 지원하는 것을 확인하고 다음 순서로 배치했다.

1. `/tools/goal-simulator`
2. `/tools/dca-calculator`
3. `/tools/cagr-calculator`
4. `/tools/fire-calculator`

관련 계산기 block은 결과 영역에 한 번만 노출되며 기존 `tool_hub_click`을 유지한다.

## 6. 계산 결과 보존

- `lib/compoundCore.js` 변경 없음
- `lib/compound.js` 변경 없음
- 기본 세후 최종금액 `6,600.2만원` 유지
- A-D 계산 샘플 전체 PASS

## 7. GA4 확인

이벤트명은 변경하지 않았다.

- `tool_result_cta_view`: 계산 후 1회
- `tool_result_cta_click`: `copy_result_url`, `location=result_after` 확인
- `tool_hub_click`: goal click, `source_tool=compound`, `location=result_cta` 확인
- sticky `CTA` navigation: CTA viewport top 90px로 이동 확인

그 밖의 `tool_calculate`, `tool_result_action`, `tool_nav_click`, `tool_backlink_action` 구조도 유지했다.

## 8. PDF export

390px 실제 PDF export 흐름을 확인했다.

| 시점 | compact details | advanced details |
| --- | --- | --- |
| export 전 | 닫힘 | 닫힘 |
| export 중 | 열림 | 열림 |
| export 후 | 닫힘 | 닫힘 |

`fm-exporting` class도 완료 후 제거됐다. 기존 details open/restore 동작은 정상이다.

## 9. viewport 확인

| viewport | compact | summary 높이 | CTA top | FAQ top | overflow |
| --- | --- | ---: | ---: | ---: | --- |
| 320×720 | 적용 | 358px | 2,574px | 4,060px | 없음 |
| 360×740 | 적용 | 220px | 2,523px | 4,066px | 없음 |
| 390×844 | 적용 | 235px | 2,639px | 4,258px | 없음 |
| 430×932 | 적용 | 250px | 2,757px | 4,328px | 없음 |
| 768×1024 | 미적용 | 874px | 6,616px | 7,767px | 없음 |

모든 viewport에서 핵심 metric, details, chart, CTA, 관련 계산기 link의 경계 이탈과 horizontal overflow가 없었다.

## 10. 검증 결과

| 명령/확인 | 결과 |
| --- | --- |
| `node scripts\verify_compound_calculator.js` | PASS, A-D 전체 통과 |
| `npm.cmd run build` | PASS, 214개 static page |
| postbuild sitemap | PASS, main 204 / KO 106 / EN 98 URL |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| runtime CTA/GA/sticky/PDF 확인 | PASS |
| `git diff --check` | PASS |

검증 중 재생성된 sitemap과 기존 verifier 보고서는 복원했고 임시 screenshot은 삭제했다.

## 11. SEO 정책 변경 없음

- title/description 변경 없음
- canonical/hreflang 변경 없음
- sitemap/robots/noindex 변경 없음
- FAQ 문항과 FAQPage JSON-LD source 변경 없음
- HowTo, BreadcrumbList, SoftwareApplication JSON-LD 변경 없음
- AdSense 구조 변경 없음

## 12. Phase 1-4 이관

1. 월복리 고정 기능과 SEO title의 `연복리` 표현 정합성 보완
2. KO 중심 FAQ long-tail 확장
3. FAQ accordion과 단일 FAQPage source 유지 검증
4. 계산기와 기존 콘텐츠 cluster의 내부 링크 문구 점검

