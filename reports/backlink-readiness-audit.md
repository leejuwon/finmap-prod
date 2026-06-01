# Finmap 백링크 확장 준비 점검

점검일: 2026-06-01

## 1. 적용 요약

- 계산기 상세 페이지 6개에 상단 공유 패널을 추가했다.
  - `/tools/compound-interest`
  - `/tools/cagr-calculator`
  - `/tools/dca-calculator`
  - `/tools/dsr-ltv-calculator`
  - `/tools/goal-simulator`
  - `/tools/fire-calculator`
- 공유 패널은 Web Share API를 우선 사용하고, 지원하지 않으면 canonical URL 복사로 fallback한다.
- 계산기 상세 페이지 하단에 "이 계산기를 인용하려면" 섹션을 추가했다.
- 인용 섹션은 canonical URL 기준 HTML 예시와 추천 앵커 텍스트를 제공한다.
- 블로그 상세 페이지 하단 CTA를 공통 관련 계산기 CTA로 교체했다.
  - frontmatter `tool`/`tools`를 우선 사용한다.
  - DSR/LTV, 대출, 아파트, mortgage 등은 DSR LTV 계산기를 자동 추천한다.
  - 명시 도구가 부족한 글은 카테고리와 본문 메타 기반으로 fallback 계산기를 추천한다.
- `/tools` 도구 허브에 DSR LTV 계산기를 추가해 내부 링크 구조를 보강했다.
- DSR LTV 계산기에는 공유 시 자연스럽게 보이도록 부동산/대출 관련 OG 이미지를 지정했다.
- GA4에서 공유/복사/인용 HTML 복사와 블로그 하단 관련 계산기 CTA 클릭을 분리해 볼 수 있도록 이벤트 파라미터를 정리했다.

## 2. 주요 계산기별 추천 앵커 텍스트

| 계산기 | canonical | 추천 앵커 텍스트 |
|---|---|---|
| 복리 계산기 | `https://www.finmaphub.com/tools/compound-interest` | 복리 계산기, 월복리 계산기, 복리 이자 계산기, 적립식 복리 계산기 |
| CAGR 계산기 | `https://www.finmaphub.com/tools/cagr-calculator` | CAGR 계산기, 연평균 수익률 계산기, 연평균 성장률 계산기, 투자 수익률 계산기 |
| DSR LTV 계산기 | `https://www.finmaphub.com/tools/dsr-ltv-calculator` | DSR LTV 계산기, 주택담보대출 가능액 계산기, 아파트 구매 가능 금액 계산기, 대출 한도 계산기 |
| 적립식 투자 계산기 | `https://www.finmaphub.com/tools/dca-calculator` | 적립식 투자 계산기, DCA 계산기, 월 적립식 투자 시뮬레이터, ETF 적립식 계산기 |

영어 페이지는 `/en` canonical을 사용하며, 대응 앵커도 별도로 정의했다.

## 3. 인용 HTML 예시

계산기별 인용 섹션에서 아래 형태를 제공한다.

```html
<a href="https://www.finmaphub.com/tools/cagr-calculator">CAGR 계산기</a>
```

페이지 언어가 영어인 경우 예시는 `/en/tools/...` canonical과 영어 앵커를 사용한다.

## 4. OG/공유 메타 점검

| 페이지 유형 | 상태 |
|---|---|
| 계산기 상세 | `SeoHead`가 title, description, canonical, og:url, og:image, twitter card를 공통 출력한다. |
| 복리/CAGR/DCA/목표/FIRE | 각 페이지에 Cloudinary 기반 OG image가 지정되어 있다. |
| DSR LTV | 기존 기본 이미지 의존에서 mortgage risk cover 이미지를 명시하도록 보강했다. |
| 블로그 상세 | 포스트 cover가 있으면 Cloudinary 썸네일을 OG image로 사용하고, 없으면 `og-default.png` fallback을 사용한다. |

## 5. 내부 링크와 rel 정책

- 내부 계산기 CTA는 `next/link`를 사용하므로 내부 링크 SEO 구조를 훼손하지 않는다.
- 새 공유/인용 UI는 외부 링크를 새 창으로 열지 않는다.
- 기존 블로그 외부 공유 링크의 `target="_blank"` + `rel="noopener noreferrer"` 정책은 유지했다.

## 6. 검증

- 실행: `npm.cmd run build`
- 결과: 성공
- 확인 내용:
  - Next.js production build 성공
  - 정적 페이지 생성 성공
  - `next-sitemap` 실행 성공
- 참고: 빌드 중 `public/sitemap-0.xml`의 timestamp가 갱신되었지만, 이번 기능 변경과 무관한 생성물 노이즈라 원복했다.
- 추적 QA 세부 항목은 `reports/backlink-tracking-qa.md`에 별도 정리했다.

## 7. 남은 확인 사항

- 실제 브라우저에서 Web Share API 동작은 기기/브라우저별로 다르므로 모바일 실기기 확인이 좋다.
- Clipboard API는 HTTPS 환경에서 안정적이며, 비지원 환경은 textarea fallback으로 처리한다.
- 추천 앵커 텍스트는 GSC 검색어와 외부 유입 데이터를 보며 주기적으로 다듬는 것이 좋다.
