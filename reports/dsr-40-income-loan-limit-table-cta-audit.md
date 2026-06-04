# Finmap DSR 40% 연소득별 한도표 CTA 개선 감사

- 작업일: 2026-06-04
- KO URL: `https://www.finmaphub.com/posts/personalFinance/dsr-40-income-loan-limit-table`
- EN URL: `https://www.finmaphub.com/en/posts/personalFinance/dsr-40-income-loan-limit-table`
- 목표: 연소득별 한도표 독자를 DSR/LTV 계산기와 부동산 실거래 대시보드로 자연스럽게 연결

## 1. 적용 내용

### 초반 기준 가정

KO/EN 글의 도입부에 아래 기준을 한 문장으로 명확히 표시했다.

- DSR 40%
- 금리 연 4.0%
- 30년 원리금균등 상환
- 기존부채 없음
- 표는 빠른 비교용 추정치이며 실제 금융기관 심사와 다를 수 있음

기존의 “정책 자동 반영이 아님” 안내도 유지했다. 대출 가능액을 보장하거나 최신 정책이 자동 적용되는 것처럼 표현하지 않았다.

### DSR/LTV 계산기 CTA

첫 핵심 표인 `연소득별 DSR 40% 주담대 한도표` 위에 다음 안내를 추가했다.

> 표는 빠른 참고용이며 기존부채·보유 현금·LTV까지 보려면 계산기를 사용해야 한다.

첫 핵심 표 직후에는 사용자가 자신의 조건으로 다시 계산하도록 CTA를 추가했다.

- KO: `/tools/dsr-ltv-calculator`
- EN: `/en/tools/dsr-ltv-calculator`
- 입력하도록 안내한 항목: 연소득, 기존부채, 보유 현금, LTV

### 부동산 대시보드 CTA

글 중간의 `연소득 6,000만원, 보유 현금 2억원` 예시 계산 뒤에 “한도만 보지 말고 실제 거래 가격대와 비교하기” CTA를 추가했다.

- KO: `/market/real-estate`
- EN: `/en/market/real-estate`
- 연결 목적: 계산된 가격 범위를 서울·경기·인천 실거래 가격대와 비교

## 2. 광고와 CTA 간격 점검

공통 블로그 렌더러 `pages/posts/[category]/[slug].js`는 본문의 두 번째와 네 번째 H2 직후에 `AdInArticle`을 자동 삽입한다.

| 요소 | 본문 위치 | 자동 광고와 관계 |
|---|---|---|
| 첫 표 위 안내 | 세 번째 H2 내부, 표 직전 | 두 번째 H2 광고 뒤에 가정 표와 설명이 먼저 위치 |
| DSR/LTV 계산기 CTA | 세 번째 H2 내부, 첫 핵심 표 직후 | 다음 광고 전 설명 문단과 다음 H2가 사이에 위치 |
| 부동산 대시보드 CTA | 다섯 번째 H2 예시 계산 내부 | 네 번째 H2 광고와 기존부채 표·설명·예시 표가 사이에 위치 |

광고 슬롯을 추가하거나 기존 광고 위치를 변경하지 않았다. 계산기 및 대시보드 CTA가 광고와 직접 붙는 구조도 만들지 않았다.

## 3. FAQ 및 구조화데이터

KO/EN 각각 다음 5개 FAQ로 정리했다.

1. DSR 40%란 무엇인가?
2. 연소득별 한도는 왜 금리에 따라 달라지는가?
3. 기존 대출이 있으면 어떻게 되는가?
4. DSR과 LTV 중 무엇이 더 중요한가?
5. 표와 실제 대출 심사가 다른 이유는 무엇인가?

구조화데이터 점검 결과:

- 공통 렌더러가 `BlogPosting` JSON-LD를 자동 생성한다.
- KO/EN 본문에 중복으로 들어 있던 `Article` JSON-LD를 제거했다.
- 보이는 FAQ와 일치하는 `FAQPage` JSON-LD는 KO/EN 각각 1개 유지했다.
- 보이는 FAQ 질문 5개와 JSON-LD 질문 5개가 대응한다.

## 4. 링크 및 라우팅 확인

- `pages/tools/dsr-ltv-calculator.js` 존재 확인
- `pages/market/real-estate.js` 존재 확인
- slug `dsr-40-income-loan-limit-table` 변경 없음
- 공통 렌더러의 locale 기반 canonical/hreflang 처리 변경 없음
- postbuild 생성 결과 KO/EN sitemap URL과 hreflang 쌍 유지
- 대상 KO/EN sitemap `lastmod`는 `2026-06-04`로 갱신

관련 블로그 렌더링 구조는 이미 canonical, hreflang, `BlogPosting`, 자동 광고 위치를 처리하고 있어 코드 변경 없이 점검만 수행했다.

## 5. 변경 파일

- `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md`
- `content/posts/personalFinance/en/dsr-40-income-loan-limit-table.md`
- `public/sitemap-0.xml` - postbuild 생성 결과의 대상 URL lastmod 갱신
- `reports/dsr-40-income-loan-limit-table-cta-audit.md`

계산기 계산 로직, 광고 슬롯, 광고 개수, 공통 렌더러 코드는 변경하지 않았다.

## 6. 실행 명령과 결과

| 명령 | 결과 |
|---|---|
| `rg` 기반 콘텐츠·링크·JSON-LD 검색 | PASS |
| `rg --files pages/tools pages/market` | PASS - 계산기와 대시보드 페이지 존재 |
| `npm.cmd run build` | PASS - Next.js production build 및 next-sitemap 생성 성공 |
| `git diff --check` | PASS |

## 7. 운영 확인 사항

- 배포 후 KO/EN 글에서 첫 표 직후 계산기 CTA와 예시 계산 뒤 대시보드 CTA가 정상 이동하는지 확인한다.
- 모바일에서 표 가로 스크롤 뒤 CTA가 자연스럽게 이어지는지 확인한다.
- 계산 결과는 참고용 추정치이며 실제 심사는 금융기관과 적용 조건에 따라 달라질 수 있다는 문구가 계속 노출되는지 확인한다.
