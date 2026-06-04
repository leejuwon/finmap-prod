# Finmap CAGR 계산기 Result-only 광고 적용 감사

- 작성일: 2026-06-04
- 대상 경로: `/tools/cagr-calculator`, `/en/tools/cagr-calculator`
- 목표: CAGR 계산 결과가 생성된 뒤에만 최대 2개의 광고를 노출하고 기존 측정 및 AdSense 로드 체계를 재사용한다.

## 적용 결과

| 항목 | 적용 내용 |
| --- | --- |
| 결과 광고 1 | 순 CAGR, 총 CAGR, 시작 금액, 최종 금액 핵심 요약 뒤 |
| 결과 광고 2 | CAGR 자산 성장 차트 뒤, 연도별 표 앞 |
| 결과 전 노출 | 없음. 두 슬롯 모두 `hasResult` 조건 내부에 있음 |
| 광고 슬롯 | 기존 `AD_SLOTS.inArticle1`, `AD_SLOTS.inArticle2` 재사용 |
| 광고 컴포넌트 | 기존 `_components/ResultAdSlot.js` 재사용 |
| AdSense 로드 경로 | `pages/_app.js`의 `ADSENSE_PATHS`에 `/tools/cagr-calculator` 추가 |
| 계산 로직 및 SEO | 변경 없음 |

첫 번째 광고 뒤에는 상세 CAGR 해석 영역이 이어진다. 두 번째 광고 뒤에는 연도별 표가 이어지고 그 다음에 공유/PDF 및 관련 계산기 CTA가 배치된다. 광고가 계산 버튼 또는 CTA와 직접 맞닿지 않는다.

## 이벤트

### `tool_calculate`

기존 이벤트를 유지했다. 사용자가 CAGR 입력 폼을 제출해 결과를 생성할 때 발생한다.

| 파라미터 | 값 |
| --- | --- |
| `source_tool` | `cagr` |
| `locale` | `ko` 또는 `en` |
| `currency` | 선택 통화 |
| `has_result` | `true` |
| `location` | `form_submit` |

### `result_ad_view`

기존 `ResultAdSlot` 측정 체계를 재사용한다. 광고 슬롯 컨테이너가 뷰포트에 50% 이상 들어오면 각 컴포넌트 마운트 기준 1회 발생한다.

| 광고 위치 | `source_tool` | `position` | `locale` |
| --- | --- | --- | --- |
| 핵심 결과 요약 뒤 | `cagr` | `summary_after` | `ko` 또는 `en` |
| 차트 뒤 | `cagr` | `chart_after` | `ko` 또는 `en` |

`result_ad_view`는 슬롯 컨테이너 가시성을 측정한다. 실제 AdSense fill, viewable impression 또는 수익 발생을 보장하지 않는다.

## AdSense 로드 경로

`pages/_app.js`는 `router.pathname`을 기준으로 AdSense 스크립트 로드 여부를 판단한다. `/tools/cagr-calculator`를 등록했으므로 다음 직접 진입 경로가 같은 조건으로 처리된다.

- `/tools/cagr-calculator`
- `/en/tools/cagr-calculator`
- `/tools/cagr-calculator?initial=1000`
- `/en/tools/cagr-calculator?initial=1000`

Pages Router의 `router.pathname`은 locale prefix와 query string을 제외한 route pathname을 제공하므로 별도 KO/EN 및 query 경로 등록이 필요하지 않다.

## 변경 파일

| 파일 | 변경 내용 |
| --- | --- |
| `pages/tools/cagr-calculator.js` | 기존 공통 결과 광고 슬롯 2개를 `hasResult` 내부에 배치 |
| `pages/_app.js` | `/tools/cagr-calculator` AdSense 로드 경로 추가 |
| `reports/cagr-calculator-result-ads-audit.md` | 적용 및 검증 결과 기록 |

다음 파일은 기존 구현을 확인하고 그대로 재사용했으며 변경하지 않았다.

- `_components/ResultAdSlot.js`
- `config/adSlots.js`
- `utils/analytics.js`
- CAGR 계산 관련 컴포넌트와 계산 로직

## 운영 확인 체크리스트

- [ ] KO/EN CAGR 계산기 직접 진입 시 AdSense 스크립트 요청이 발생하는지 확인
- [ ] query string이 있는 직접 진입에서도 AdSense 스크립트 요청이 발생하는지 확인
- [ ] 계산 전 화면과 입력 폼 주변에 광고 슬롯이 보이지 않는지 확인
- [ ] 계산 완료 후 핵심 결과 요약 뒤와 차트 뒤에만 최대 2개 슬롯이 보이는지 확인
- [ ] 광고와 계산 버튼, 공유/PDF CTA, 관련 계산기 CTA 사이에 콘텐츠 간격이 유지되는지 확인
- [ ] GA4 DebugView에서 `tool_calculate`와 `source_tool=cagr`를 확인
- [ ] 각 슬롯을 50% 이상 스크롤했을 때 `result_ad_view`의 `summary_after`, `chart_after`를 확인
- [ ] `result_ad_view`와 별도로 AdSense 콘솔 및 브라우저 네트워크 탭에서 실제 fill 상태를 확인
- [ ] 광고 차단기, 동의 설정, AdSense 정책 및 검토 상태에 따른 미노출을 별도로 점검

## 검증 결과

| 명령 | 결과 |
| --- | --- |
| `npm.cmd run build` | 성공. Next.js production build 및 `next-sitemap` 생성 완료 |
| CAGR 계산기 route | build 결과에서 `/tools/cagr-calculator` 정적 생성 확인 |
| `git diff --check` | 성공. 공백 오류 없음. 기존 작업 파일을 포함한 LF/CRLF 변환 경고만 출력됨 |

## 남은 운영 확인

로컬 빌드는 광고 스크립트 로드 조건과 JSX 렌더링을 검증하지만 실제 AdSense fill과 GA4 DebugView 수신은 운영 배포 후 확인해야 한다.
