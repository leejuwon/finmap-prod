# FinMap 네이버 계산기 SEO 우선 보강 감사

작성일: 2026-06-24

## Summary

- 대상: DSR/LTV 계산기, 복리 계산기, FIRE/은퇴자금 계산기
- 목적: 네이버 검색 키워드 `DSR 계산기`, `주택담보대출 계산기`, `복리 계산기`, `은퇴자금 계산기`, `노후자금 계산기` 검색 의도 정합성 보강
- 작업 범위: KO 계산기 페이지 메타/H1/정적 본문/FAQ/내부링크 앵커, KO 관련 글 내부링크 앵커, 네이버 계산기 SEO 검증 스크립트
- 유지한 항목: 계산 로직, canonical, hreflang, noindex, robots, sitemap 생성 정책, EN 페이지 구조

## Calculator Changes

| Page | Before title | After title | Before H1 | After H1 | FAQ before | FAQ after |
| --- | --- | --- | --- | --- | ---: | ---: |
| `/tools/dsr-ltv-calculator` | DSR LTV 아파트 구매 가능 금액 계산기 \| 대출 가능액·매수 가능 가격 | DSR 계산기 \| 주택담보대출 가능액·LTV·아파트 구매가격 계산 \| FinMap | DSR/LTV 아파트 구매 가능 금액 계산기 | DSR 계산기: 연소득·기존대출·주택담보대출 가능액 계산 | 5 | 9 |
| `/tools/compound-interest` | 복리 계산기 \| 월 적립·세금·수수료 미래가치 계산 | 복리 계산기 \| 월복리·연복리·적립식 투자 미래가치 계산 \| FinMap | 복리 이자 계산기 | 복리 계산기 | 5 | 9 |
| `/tools/fire-calculator` | 은퇴자금 계산기 / FIRE 계산기 \| 은퇴 생활비·필요자금 시뮬레이션 | 은퇴자금 계산기 \| 노후자금 계산기·은퇴 생활비·FIRE 계산기 \| FinMap | 은퇴자금 계산기 / FIRE 계산기 \| 은퇴 생활비·필요자금 시뮬레이션 | 은퇴자금 계산기 \| 노후자금 계산기·은퇴 생활비·FIRE 계산기 \| FinMap | 9 | 11 |

## Description Changes

| Page | After description focus |
| --- | --- |
| DSR/LTV | 연소득, 기존대출 월상환액, 주택담보대출 금리·기간, DSR, 대출 가능액, LTV, 보유현금 |
| Compound | 원금, 월 적립금, 연 수익률, 기간, 세금, 수수료, 물가상승률, 월복리, 적립식 투자 미래가치 |
| FIRE | 은퇴자금 계산기, 노후자금 계산기, 월 은퇴 생활비, 필요 은퇴자금, 4% 룰, 국민연금·개인연금 |

## Static Body Additions

### DSR/LTV 계산기

- `DSR만 빠르게 계산` 섹션 추가
- DSR 계산식과 DSR 40% 예시 추가
- 연소득 6,000만원, DSR 40%, 기존대출 월상환액 40만원, 신규 주담대 월상환 여력 약 160만원 예시표 추가
- `주택담보대출 계산기`, `대출 가능액 계산기`, `LTV 계산기` H2 섹션 추가

### 복리 계산기

- `복리 계산기 사용법` 섹션 추가
- 복리 계산 공식, 월복리와 연복리 차이, 적립식 복리 계산 예시 추가
- 월 30만원·50만원·100만원 적립식 예시표 추가
- 세금·수수료·물가상승률 반영 이유 추가
- 계산 전에도 SSR/정적 HTML에서 FAQ가 노출되도록 보강하고, 결과 표시 후에는 새 정적 FAQ가 중복 노출되지 않도록 `!hasResult` 조건 적용

### 은퇴자금/FIRE 계산기

- 은퇴 생활비별 필요자금 표 추가
- 월 200만원, 300만원, 400만원, 500만원 기준 4% 룰 필요자금 추가
- 4% 룰 기준 필요자금 계산 설명 추가
- 국민연금·개인연금이 있을 때 해석 문구 추가

## Internal Link Anchors

| Source | Updated anchor examples |
| --- | --- |
| DSR 관련 글 | `DSR 계산기`, `주택담보대출 계산기`, `주택담보대출 가능액 계산기`, `대출 가능액 계산기` |
| 복리 관련 글 | `월복리 계산기`, `적립식 복리 계산기` |
| 은퇴/FIRE 관련 글 | `은퇴자금 계산기`, `노후자금 계산기` |

수정한 KO 관련 글:

- `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md`
- `content/posts/personalFinance/ko/salary-40m-mortgage-limit.md`
- `content/posts/personalFinance/ko/salary-50m-dsr-40-loan-limit.md`
- `content/posts/personalFinance/ko/annual-vs-monthly-compound.md`
- `content/posts/personalFinance/ko/monthly-dca-10-year-result.md`
- `content/posts/personalFinance/ko/fire-3-numbers-spending-horizon-withdrawal.md`

## Verification Script

신규 스크립트: `scripts/verify_naver_calculator_seo.js`

검사 URL:

- `/tools/dsr-ltv-calculator`
- `/tools/compound-interest`
- `/tools/fire-calculator`

검사 항목:

- HTTP 200 또는 빌드 HTML 존재
- self canonical
- meta robots noindex 없음
- X-Robots-Tag noindex 없음
- title 목표 키워드 포함
- meta description 목표 키워드 포함
- H1 1개
- FAQPage JSON-LD 존재
- FAQPage JSON-LD 질문이 visible FAQ에 존재
- 목표 키워드 과도 반복 없음
- 내부링크 앵커에 목표 키워드 포함

## Verification Results

| Command | Result | Notes |
| --- | --- | --- |
| `node --check pages\tools\dsr-ltv-calculator.js` | PASS | 문법 오류 없음 |
| `node --check pages\tools\compound-interest.js` | PASS | 문법 오류 없음 |
| `node --check pages\tools\fire-calculator.js` | PASS | 문법 오류 없음 |
| `node --check _components\FireFaq.js` | PASS | 문법 오류 없음 |
| `node --check scripts\verify_naver_calculator_seo.js` | PASS | 문법 오류 없음 |
| `npm.cmd run build` | PASS | Next build 및 postbuild 완료 |
| `node scripts\verify_naver_calculator_seo.js` | PASS | 3개 대상 모두 PASS |
| `node scripts\verify_seo_channel_split.js` | PARTIAL | sitemap 정책 구간은 PASS, 외부 fetch 단계에서 `EACCES`로 중단 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS | KO/EN canonical, sitemap 정책 샘플 PASS |
| `git diff --check` | PASS | 경고는 CRLF 변환 안내만 존재 |

### Naver Calculator SEO Script Output Summary

| URL | Status | Canonical | H1 count | FAQ JSON-LD | Visible FAQ | Keyword repetition |
| --- | ---: | --- | ---: | ---: | ---: | --- |
| `/tools/dsr-ltv-calculator` | 200 | `https://www.finmaphub.com/tools/dsr-ltv-calculator` | 1 | 9 | 9 | PASS |
| `/tools/compound-interest` | 200 | `https://www.finmaphub.com/tools/compound-interest` | 1 | 9 | 9 | PASS |
| `/tools/fire-calculator` | 200 | `https://www.finmaphub.com/tools/fire-calculator` | 1 | 11 | 12 | PASS |

Note: FIRE 페이지의 visible `details` 12개 중 1개는 FAQ 외 접힘 UI까지 포함된 수치다. FAQPage JSON-LD 11개 질문은 visible FAQ 질문에 모두 존재한다.

## Follow-up Fine Tuning

2026-06-24 후속 미세보정:

- 내부링크 앵커 또는 본문이 수정된 KO 글 6개의 frontmatter `dateModified`를 `2026-06-24`로 갱신했다.
- 수동 Article JSON-LD가 있는 글은 JSON-LD `dateModified`도 `2026-06-24`로 맞췄다.
- `annual-vs-monthly-compound.md`는 수동 Article JSON-LD에 `dateModified`가 없어 새로 추가했다.
- FIRE 계산기 구조화데이터의 `@type`을 `FinancialCalculator`에서 `WebApplication`으로 변경했다.
- FIRE 계산기 구조화데이터에 `applicationCategory: FinanceApplication`, `operatingSystem: Web`, 무료 `Offer`를 추가했다.
- 복리 계산기 모바일 PRO advanced details 내부 FAQ 블록을 제거해, 결과 화면에서는 하단 FAQ 1개만 유지되도록 정리했다.
- 계산 전 SEO용 정적 FAQ는 유지했다.

후속 보정 대상 글:

- `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md`
- `content/posts/personalFinance/ko/salary-40m-mortgage-limit.md`
- `content/posts/personalFinance/ko/salary-50m-dsr-40-loan-limit.md`
- `content/posts/personalFinance/ko/annual-vs-monthly-compound.md`
- `content/posts/personalFinance/ko/monthly-dca-10-year-result.md`
- `content/posts/personalFinance/ko/fire-3-numbers-spending-horizon-withdrawal.md`

후속 검증 결과:

- `npm.cmd run build`: PASS
- `node scripts\verify_naver_calculator_seo.js`: PASS
- `node scripts\verify_seo_channel_split.js --local-server`: PASS
- `git diff --check`: PASS, CRLF 변환 안내 warning만 존재

## Remaining Notes

- `SeoHead`가 title 뒤에 사이트명을 자동 부착하므로 페이지 코드의 KO title에서는 끝의 `| FinMap` 중복을 제거했다. 빌드 HTML 기준 title은 `... | FinMap` 형태로 확인한다.
- 실제 네이버 반영 여부는 네이버 서치어드바이저 수집/색인 후 노출 지표로 별도 확인해야 한다.
- build/postbuild가 재생성한 sitemap 산출물은 검증 후 작업 범위에서 제외했다.
