# Finmap Compound Interest Calculator Phase 1 Pre-Deploy Smoke Test

- 테스트 일자: 2026-06-30
- 실행 환경: Windows, Next.js production build 및 `next start`, headless Chrome
- 대상 URL: `/tools/compound-interest`, `/en/tools/compound-interest`
- 최종 판정: **PASS - 배포 가능**

이번 작업에서는 코드, 콘텐츠, SEO 설정을 수정하지 않았다. production build 산출물을 대상으로 계산, 반응형 UI, SEO, FAQ, GA4 이벤트, PDF 다운로드, SEO 채널을 점검했으며 이 보고서만 추가했다.

## 1. Production build

`npm.cmd run build` 결과:

- Next.js compile: PASS
- static page: `214/214` 생성
- `next-sitemap`: PASS
- source sitemap: 204 URLs
- `sitemap-ko.xml`: 106 URLs
- `sitemap-en.xml`: 98 URLs
- `public/en/sitemap.xml`: 98 URLs
- EN 필수 static URL: `16/16`, backfill 0

URL 수는 Phase 1 최종 감사 기준인 main 204 / KO 106 / EN 98과 같다. 빌드와 검증이 갱신한 추적 sitemap 및 기존 verifier 보고서는 테스트 후 원복했다.

## 2. 계산 결과

기본 조건:

- 원금 1,000만원
- 월 적립금 30만원
- 연 수익률 7%
- 투자 기간 10년
- 세금 15.4%
- 수수료 0.5%
- 물가상승률 0%

| 확인 항목 | 결과 | 판정 |
| --- | --- | --- |
| 기본 세후 최종금액 | `6,600.2만원` | PASS |
| 세금/수수료 OFF | `7,202.2만원` | PASS |
| OFF rate 보존 | 세금 `15.4`, 수수료 `0.5` | PASS |
| OFF URL | `applyTax=false`, `applyFee=false` 포함 | PASS |
| URL 복사 | clipboard URL과 현재 URL 일치 | PASS |
| 새 탭 복원 | 두 toggle OFF, rate 보존, `7,202.2만원` | PASS |
| 다시 ON | 두 toggle checked 확인 후 `6,600.2만원` | PASS |

첫 자동화 실행은 OFF 상태에서 tax/fee를 렌더 사이 대기 없이 연속 클릭해 fee가 아직 OFF인 `6,801.5만원`을 읽었다. 각 checkbox가 checked가 될 때까지 기다리는 보정 smoke에서는 tax와 fee가 모두 ON으로 전환되고 `6,600.2만원`이 복원됐다. 제품 결함으로 재현되지 않은 테스트 하네스의 React 업데이트 타이밍 문제다.

## 3. 모바일 및 반응형 viewport

| viewport | 입력 card top | 계산 button top | 결과 summary | CTA top | FAQ top | overflow | sticky CTA |
| --- | ---: | ---: | --- | ---: | ---: | --- | --- |
| 320x720 | 491px | 886px | compact, 핵심 4개 | 2,574px | 4,060px | 없음 | 이동 후 top 92px |
| 390x844 | 521px | 950px | compact, 핵심 4개 | 2,639px | 4,258px | 없음 | 이동 후 top 107px |
| 768x1024 | 405px | 683px | full summary | 6,616px | 7,767px | 없음 | basic mode, section nav 미표시 |

공통 확인:

- 계산 버튼 viewport 경계 이탈이나 잘림 없음
- 세금/수수료 checkbox 기본 ON
- input option `details` 3개 기본 닫힘
- `ToolResultCta` 1개
- CTA가 FAQ보다 앞에 있음
- 관련 계산기 순서: goal -> dca -> cagr -> fire
- horizontal overflow 없음

768px은 Phase 1 구현 정책에 따라 PRO mobile compact 대신 기존 full summary/basic layout을 사용한다. sticky section navigation은 320/390px PRO mode에서 확인했으며 768px basic mode에는 표시되지 않는다.

## 4. SEO head

### KO

- title: `복리 계산기 | 월복리·적립식 투자 미래가치 계산 | FinMap`
- description: `월복리 기준` 포함
- canonical: `https://www.finmaphub.com/tools/compound-interest`
- hreflang: KO self와 EN alternate 출력
- robots meta에 `noindex` 없음
- H1: 1개

### EN

- title: `Compound Interest Calculator: Future Value, Monthly Contributions & Taxes | FinMap`
- description: `monthly compounding` 포함
- description: `compound frequency` 없음
- canonical: `https://www.finmaphub.com/en/tools/compound-interest`
- hreflang: KO alternate와 EN self 출력
- robots meta에 `noindex` 없음
- H1: 1개

KO/EN 모두 390px에서 horizontal overflow가 없었다.

## 5. FAQ 및 JSON-LD

| 언어 | 화면 FAQ | FAQ container | FAQPage JSON-LD | mainEntity | 판정 |
| --- | ---: | ---: | ---: | ---: | --- |
| KO | 24 | 1 | 1 | 24 | PASS |
| EN | 8 | 1 | 1 | 8 | PASS |

화면 FAQ 개수와 FAQPage `mainEntity` 개수가 일치하고, 현재 렌더링된 FAQ container는 언어별 1개다.

## 6. GA4 이벤트

로컬 production build에서 페이지 로드 후 `window.gtag` 캡처를 설치해 확인했다.

| 이벤트 | 주요 파라미터 | 결과 |
| --- | --- | --- |
| `tool_calculate` | `source_tool=compound`, `has_tax=true`, `has_fee=true`, `has_inflation=false`, `location=form_submit` | PASS |
| `tool_calculate` OFF | `has_tax=false`, `has_fee=false` | PASS |
| `tool_result_cta_view` | `location=result_after`, 최초 결과 mount에서 1회 | PASS |
| `tool_result_cta_click` | `action=copy_result_url`, `location=result_after` | PASS |
| `tool_hub_click` | `target_tool=goal`, `location=result_cta` | PASS |
| `tool_nav_click` | `section=cta`, `location=sticky_cta` | PASS |

같은 페이지에서 재계산해도 `tool_result_cta_view`가 중복 발송되지 않고 총 1회를 유지했다. 실제 production/preview GA4 DebugView에는 접근하지 않았으므로 배포 직후 DebugView 재확인이 필요하다.

## 7. PDF

실제 결과 CTA의 PDF 버튼을 클릭해 다운로드와 열기를 확인했다.

| 항목 | 결과 | 판정 |
| --- | --- | --- |
| 다운로드 파일 | `compound-result.pdf` | PASS |
| 파일 크기 | 641,397 bytes | PASS |
| PDF header | `%PDF-1.3` | PASS |
| EOF marker | `%%EOF` 확인 | PASS |
| page object | 12개 | PASS |
| Chrome viewer | HTTP 200, `application/pdf`, 12페이지 viewer 렌더 확인 | PASS |
| export 전 | compact/advanced details 모두 닫힘 | PASS |
| export 중 | 두 details 모두 열림, `fm-exporting` 존재 | PASS |
| export 후 | 두 details 원래 닫힘으로 복원, `fm-exporting` 제거 | PASS |

기본 ON 결과 `6,600.2만원`으로 PDF를 다시 생성해 Chrome PDF viewer에서 열리는 것을 확인했다. 검증용 PDF와 screenshot은 시스템 임시 디렉터리에서 확인 후 삭제했다.

## 8. SEO 채널 검증

`node scripts\verify_seo_channel_split.js --local-server` 결과:

- sitemap forbidden loc pattern: PASS
- `/tools/compound-interest`: canonical/self URL PASS
- `/en/tools/compound-interest`: canonical/self URL PASS
- KO/EN channel sitemap membership: PASS
- `public/en/sitemap.xml`: EN prefix only PASS
- `public/en/sitemap.xml`과 `sitemap-en.xml`: 일치
- required EN URLs: `16/16`

canonical, hreflang, sitemap, robots/noindex 정책 변경은 없다.

## 9. 실행 명령 및 검사

| 명령/확인 | 결과 |
| --- | --- |
| `npm.cmd run build` | PASS, static 214/214 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| production `next start` + Chrome 320/390/768 smoke | PASS |
| clipboard URL 새 탭 복원 smoke | PASS |
| 실제 PDF download/open smoke | PASS |
| `git diff --check` | PASS |

## 10. 배포 가능 여부

**배포 가능**으로 판정한다.

계산 결과, 반응형 화면, SEO head, FAQ/JSON-LD, 로컬 GA4 event dispatch, PDF, SEO 채널 verifier에서 배포 차단 이슈를 발견하지 못했다.

## 11. 발견된 리스크

1. production/preview GA4 DebugView를 직접 확인하지 못했다. 로컬 event dispatch는 PASS했지만 실제 수집은 배포 후 확인해야 한다.
2. 768px은 full summary/basic mode라 CTA가 FAQ 앞이기는 하지만 top `6,616px`로 모바일보다 아래에 있다. Phase 1의 의도된 기존 동작이며 향후 데이터 기반 CTA 위치 실험 대상이다.
3. PDF는 Chrome viewer에서 열기와 페이지 렌더를 확인했지만 OS별 PDF viewer 호환성 전체를 대표하지는 않는다.
4. 실제 production AdSense 로딩에 따른 layout shift는 로컬 환경에서 검증할 수 없다.

## 12. 배포 후 KPI 및 확인

- GA4 DebugView에서 위 5개 이벤트와 파라미터 수신 확인
- `tool_result_cta_view` 중복 발송 여부
- `tool_calculate` 발생 세션 / 계산기 세션, 초기 관찰 목표 60% 이상
- `tool_result_cta_click` / `tool_result_cta_view`, 초기 관찰 목표 12% 이상
- PDF 및 lead download conversion, 초기 관찰 목표 2% 이상
- goal/dca/cagr/fire 관련 계산기 클릭 분포
- GSC KO/EN impressions, clicks, CTR, query mix
- Naver Search Advisor KO URL index, 수집일, query 및 crawl 오류
- production 320/390/768 화면과 AdSense layout shift 재확인
