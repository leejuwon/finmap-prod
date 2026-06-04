# Finmap 보유현금별 아파트 구매 가능 금액 글 CTA 개선 감사

- 작업일: 2026-06-04
- KO URL: `https://www.finmaphub.com/posts/personalFinance/cash-100m-200m-300m-apartment-budget`
- EN URL: `https://www.finmaphub.com/en/posts/personalFinance/cash-100m-200m-300m-apartment-budget`
- 목표: 보유현금별 참고표 독자를 DSR/LTV 계산기와 실제 아파트 거래 대시보드로 자연스럽게 연결

## 1. 적용 내용

### 초반 기준 가정

KO/EN 글의 도입부에 아래 기준과 한계를 명확히 표시했다.

- 보유현금 1억·2억·3억원 비교
- LTV 70%
- 부대비용률 5%
- DSR은 연소득과 기존부채를 이용해 별도 확인 필요
- 표는 빠른 참고용 추정치이며 실제 매수 가능 금액과 다를 수 있음

기존의 정책 자동 반영이 아니라는 안내도 유지했다. 대출 실행이나 매수를 권유하지 않았으며, 표의 결과가 실제 매수 가능 금액을 보장하는 것처럼 보이지 않도록 핵심 표의 열 이름도 `추정 가격 상한`과 `Estimated price limit`으로 조정했다.

### DSR/LTV 계산기 CTA

첫 핵심 표인 `보유현금별 구매 가능 가격` 위에 다음 안내를 추가했다.

> 표는 현금 기준 빠른 참고용이며 연소득·기존부채·DSR까지 보려면 계산기를 사용해야 한다.

첫 핵심 표 직후에는 자신의 조건으로 재계산하도록 CTA를 추가했다.

- KO: `/tools/dsr-ltv-calculator`
- EN: `/en/tools/dsr-ltv-calculator`
- 입력하도록 안내한 항목: 보유현금, 연소득, 기존부채, LTV

### 현금 구간별 부동산 대시보드 CTA

안전 탐색 가격대 표 뒤에 보유현금별 짧은 해석과 대시보드 CTA를 각각 추가했다.

| 현금 구간 | 예시 안전 탐색 가격대 | CTA 목적 |
|---|---:|---|
| 1억원 / KRW 100M | 약 2억 2,857만원~2억 5,714만원 | 해당 가격대의 실제 거래 단지와 거래량 확인 |
| 2억원 / KRW 200M | 약 4억 5,714만원~5억 1,429만원 | 현금/LTV 병목 확인 후 실거래 비교 |
| 3억원 / KRW 300M | 약 4억 7,877만원~5억 3,861만원 | DSR 병목 확인 후 실거래 비교 |

- KO 대시보드: `/market/real-estate`
- EN 대시보드: `/en/market/real-estate`
- 공통 CTA 의도: “이 가격대로 실제 거래 단지를 확인하기”

## 2. 광고와 CTA 간격 점검

공통 블로그 렌더러 `pages/posts/[category]/[slug].js`는 두 번째와 네 번째 H2 직후에 `AdInArticle`을 자동 삽입한다.

| CTA | 본문 위치 | 광고와의 관계 |
|---|---|---|
| 첫 표 위 안내 | 세 번째 H2의 표 직전 | 두 번째 H2 광고 뒤에 계산 가정 표와 설명이 위치 |
| DSR/LTV 계산기 CTA | 세 번째 H2의 첫 핵심 표 직후 | 자동 광고가 삽입되지 않는 H2 구간 |
| 현금 구간별 대시보드 CTA | 네 번째 H2의 안전 탐색 표와 설명 뒤 | 네 번째 H2 광고 뒤에 설명·표·기존 링크가 먼저 위치 |

광고 슬롯과 광고 개수는 변경하지 않았다. 새 CTA가 계산 버튼이나 광고와 직접 맞닿는 구조도 만들지 않았다.

## 3. FAQ 및 구조화데이터

KO/EN 각각 다음 5개 FAQ로 정리했다.

1. 현금 1억원이면 어느 가격대 집을 볼 수 있는가?
2. LTV가 높으면 무조건 더 비싼 집을 살 수 있는가?
3. DSR을 통과하지 못하면 어떻게 되는가?
4. 부대비용을 왜 따로 봐야 하는가?
5. 표와 실제 매수 가능 금액이 다른 이유는 무엇인가?

구조화데이터 점검 결과:

- 공통 렌더러가 `BlogPosting` JSON-LD를 자동 생성한다.
- KO/EN 본문에 중복으로 있던 `Article` JSON-LD를 제거했다.
- 보이는 FAQ와 일치하는 `FAQPage` JSON-LD를 KO/EN 각각 1개 유지했다.
- 보이는 FAQ 질문 5개와 JSON-LD 질문 5개가 대응한다.

## 4. 링크 및 라우팅 확인

- `pages/tools/dsr-ltv-calculator.js` 존재 확인
- `pages/market/real-estate.js` 존재 확인
- slug `cash-100m-200m-300m-apartment-budget` 변경 없음
- KO/EN `link` 값 변경 없음
- 공통 렌더러의 locale 기반 canonical/hreflang 처리 변경 없음
- postbuild 생성 결과 대상 KO/EN sitemap URL과 hreflang 쌍 유지
- 대상 sitemap `lastmod`는 `2026-06-04`로 갱신

관련 블로그 렌더러는 canonical, hreflang, `BlogPosting`, 자동 광고 위치를 이미 처리하고 있어 수정하지 않았다.

## 5. 변경 파일

- `content/posts/personalFinance/ko/cash-100m-200m-300m-apartment-budget.md`
- `content/posts/personalFinance/en/cash-100m-200m-300m-apartment-budget.md`
- `public/sitemap-0.xml` - postbuild 생성 결과의 대상 URL lastmod 갱신
- `reports/cash-100m-200m-300m-apartment-budget-cta-audit.md`

계산기 계산 로직, 광고 슬롯, 광고 개수, 공통 블로그 렌더러는 변경하지 않았다.

## 6. 실행 명령과 결과

| 명령 | 결과 |
|---|---|
| `rg` 기반 콘텐츠·CTA·FAQ·JSON-LD 검색 | PASS |
| `rg --files pages/tools pages/market` | PASS - 계산기와 대시보드 페이지 존재 |
| `npm.cmd run build` | PASS - Next.js production build 및 next-sitemap 생성 성공 |
| `git diff --check` | PASS |

## 7. 운영 확인 사항

- 배포 후 KO/EN 첫 핵심 표 직후 계산기 CTA가 정상 이동하는지 확인한다.
- 모바일에서 안전 탐색 가격대 표와 현금 구간별 CTA 흐름이 자연스러운지 확인한다.
- 각 대시보드 CTA는 범위를 자동 입력하지 않으므로 사용자가 계산된 가격대를 대시보드 필터에 직접 적용해야 한다.
- 실제 매수 가능 금액은 금융기관 심사, 인정소득, 기존부채, 금리, 담보가치와 실제 비용에 따라 달라질 수 있다.
