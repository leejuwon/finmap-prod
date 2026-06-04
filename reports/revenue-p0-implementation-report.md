# Finmap 수익형 계산기/대시보드 P0 개선 1차 구현 리포트

- 작업일: 2026-06-04
- 대상: DSR/LTV 계산기, 복리 계산기, 부동산 대시보드
- 원칙: 계산 로직과 대시보드 조회 로직은 변경하지 않고 결과 이후 광고, 전환 CTA, 측정 이벤트만 최소 범위로 보완

## 1. 구현 요약

### DSR/LTV 계산기

- 실시간 입력 변경 또는 프리셋 선택 후 600ms 동안 추가 변경이 없으면 `dsr_ltv_calculate` 이벤트를 기록하도록 구성했다.
- 최초 페이지 로드만으로는 계산 이벤트를 기록하지 않는다.
- 핵심 결과 섹션 뒤와 민감도 표 뒤에 결과 전용 광고 슬롯을 각각 1개 추가했다.
- 기존 결과 해석 박스를 `왜 이 금액인가`로 명확히 하고, DSR 기준 상한과 LTV·자기자금 기준 상한 중 낮은 금액이 최종값이 된다는 설명을 추가했다.
- 결과 내 대시보드 CTA와 하단 관련 섹션의 대시보드 CTA에 `dsr_to_dashboard_click` 이벤트를 추가했다.
- 관련 글에 `/posts/personalFinance/cash-100m-200m-300m-apartment-budget`를 추가했다.

### 복리 계산기

- 한국어 SEO title을 `복리 계산기 | 월 적립·세금·수수료 미래가치 계산`으로 변경했다.
- 입력 폼 직전 설명 영역에 짧은 기본 예시 3개를 추가했다.
- 계산 완료 후에만 렌더되는 `hasResult` 영역에 결과 전용 광고 2개를 추가했다.
  - 핵심 결과 요약 뒤
  - 자산 성장 차트 뒤
- Basic/Desktop와 PRO Mobile은 조건부 분기이므로 한 화면에 노출되는 결과 광고는 최대 2개다.
- 기존 `onSubmit` 계산식과 복리 계산 함수 호출은 변경하지 않았다.

### 부동산 대시보드

- KO title/H1을 `서울·경기·인천 아파트 실거래 대시보드`로 변경했다.
- EN title/H1을 `Seoul, Gyeonggi & Incheon Apartment Transaction Dashboard (KRW)`로 변경했다.
- subtitle, description, WebApplication `about`도 실제 데이터 범위에 맞게 보완했다.
- 검색 결과가 있을 때만 결과 하단에 DSR/LTV 계산기 CTA를 노출하고 `dashboard_to_dsr_click` 이벤트를 기록한다.
- 결과 광고를 상단 1개 + 인피드 최대 1개 + 하단 1개로 제한해 조회 결과당 최대 3개가 되도록 보완했다.
- 필터 영역 위에는 광고 또는 신규 강한 CTA를 추가하지 않았다.

## 2. 이벤트

| 이벤트명 | 발생 조건 | 주요 파라미터 |
| --- | --- | --- |
| `dsr_ltv_calculate` | DSR 입력 변경/프리셋 선택 후 600ms 디바운스 완료 | `source_tool`, `locale`, `interaction`, `has_result` |
| `result_ad_view` | 계산기 결과 광고 슬롯이 viewport에 50% 이상 진입, 슬롯 마운트당 1회 | `source_tool`, `position`, `locale` |
| `dsr_to_dashboard_click` | DSR 결과 또는 관련 섹션에서 부동산 대시보드 CTA 클릭 | `source_tool`, `locale`, `location` |
| `dashboard_to_dsr_click` | 부동산 검색 결과 하단 DSR/LTV CTA 클릭 | `source_page`, `locale`, `result_count`, `location` |

`result_ad_view`는 신규 공통 컴포넌트 `_components/ResultAdSlot.js`에서 `IntersectionObserver`로 측정한다.

## 3. 광고 위치

| 페이지 | 위치 | 노출 조건 | 최대 개수 |
| --- | --- | --- | --- |
| DSR/LTV | 핵심 결과 섹션 뒤, 민감도 표 뒤 | 계산 결과 영역 | 2 |
| 복리 계산기 | 핵심 결과 요약 뒤, 차트 뒤 | `hasResult === true` | 2 |
| 부동산 대시보드 | 결과 상단, 카드 7개 뒤 인피드 1개, 결과 하단 | `rows.length > 0`, 하단은 10건 이상 | 3 |

- 계산 전 복리 화면과 입력 폼 주변에는 광고를 추가하지 않았다.
- DSR 입력 폼 위, 입력 폼 내부, 입력 컨트롤 근처에는 광고를 추가하지 않았다.
- 광고 라벨은 KO `광고`, EN `Advertisement`로 표시하며 클릭 유도 문구를 사용하지 않는다.

## 4. CTA 및 내부 링크

- DSR/LTV → 부동산 대시보드
  - 결과 헤더
  - 결과 내 가격대 안내 CTA
  - 하단 관련 섹션
- DSR/LTV → 예산 글
  - `/posts/personalFinance/cash-100m-200m-300m-apartment-budget`
- 부동산 대시보드 → DSR/LTV 계산기
  - 검색 결과가 존재할 때 결과 목록 하단
  - `/tools/dsr-ltv-calculator`

링크 대상 파일 및 라우트가 저장소에 존재하는 것을 확인했다.

## 5. 변경 파일

- `_components/ResultAdSlot.js`
- `_components/DsrLtvCalculator.js`
- `pages/tools/dsr-ltv-calculator.js`
- `pages/tools/compound-interest.js`
- `pages/market/real-estate.js`
- `reports/revenue-p0-implementation-report.md`

기존 미추적 파일 `reports/finmap-revenue-core-pages-audit.md`는 수정하지 않았다.

## 6. 검증 결과

| 검증 | 결과 |
| --- | --- |
| `npm.cmd run build` | PASS, Next.js compile 및 209개 정적 페이지 생성 완료 |
| 대상 라우트 빌드 포함 | PASS: `/tools/dsr-ltv-calculator`, `/tools/compound-interest`, `/market/real-estate` |
| KO/EN 빌드 HTML 점검 | PASS: 변경된 SEO title/H1/설명/예시/DSR 해석 박스 확인 |
| 계산 로직 변경 여부 | 계산 함수 및 복리 `onSubmit` 로직 변경 없음 |
| 대시보드 광고 상한 | 상단 1 + 인피드 최대 1 + 하단 1 = 최대 3 |
| sitemap 최종 변경 | 없음. postbuild의 URL 순서 변경만 복원 |
| `git diff --check` | PASS |

실제 광고 fill과 GA4 이벤트 수신은 배포 후 GA4 DebugView 및 AdSense 환경에서 수동 확인이 필요하다. 부동산 대시보드의 DSR CTA는 API 검색 결과가 1건 이상일 때만 클라이언트에서 노출된다.

## 7. 실행 명령

- 관련 코드/라우트 검색: `rg`
- 빌드: `npm.cmd run build`
- 빌드 산출물 KO/EN 문구 확인: `.next/server/pages/...` 대상 `rg`
- sitemap 생성 순서 변경 확인 및 작업 범위 외 변경 복원
- 무결성 검사: `git diff --check`
