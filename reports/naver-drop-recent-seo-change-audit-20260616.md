# Finmap Naver Drop Recent SEO Change Audit - 2026-06-16

## 감사 범위

- 기간: 2026-06-01 이후 git commit 기준
- 대상 URL/파일:
  - `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi`
  - `/tools/cagr-calculator`
  - `/posts/personalFinance/what-is-cagr`
  - `/posts/personalFinance/dsr-40-income-loan-limit-table`
  - `/market/real-estate/magok-top100`
  - `/market/real-estate/songpa-top100`
  - `/tools/goal-simulator`
  - `/posts/personalFinance/compound-return-3-5-7-10-table`
  - `/`
  - 관련 공통 컴포넌트: `SeoHead`, `ToolSeo`, blog detail page

## 결론

2026-06-10 ~ 2026-06-14 네이버 유입 감소를 직접 설명할 만한 확실한 기술 SEO 오류는 현재 감사 범위에서 확인되지 않았다.

운영 URL 9개는 별도 기술 감사 기준에서 모두 200, self-canonical, indexable, H1 1개, sitemap 포함으로 확인되었다. 다만 2026-06-02와 2026-06-04에 `/posts/personalFinance/dsr-40-income-loan-limit-table`은 SEO title/description과 본문 도입부, FAQ/CTA가 실제 변경되었으므로 랭킹/CTR 변동 후보로 분리해 모니터링할 필요가 있다.

## 2026-06-01 이후 관련 커밋

| Commit | Date | Message | Relevant files | SEO impact 판단 |
| --- | --- | --- | --- | --- |
| `1002da3` | 2026-06-01 | Update: GSC보완작업 | `_components/SeoHead.js` | x-default hreflang을 홈에서만 출력하도록 제한. canonical/robots/noindex 변경은 아님. |
| `6f5fa77` | 2026-06-02 | Update: LTV/DSR관련 계산기 글 추가 | `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md` | title, description, seoTitle, seoDescription, dateModified, 도입부, 내부 링크, FAQ/Article JSON-LD 변경. |
| `9e1fc55` | 2026-06-04 | Update: CTR개선작업2 | `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md`, `pages/tools/cagr-calculator.js`, `pages/tools/goal-simulator.js` | DSR 글 dateModified, 도입부 보강, CTA/internal link, FAQ 변경. CAGR/Goal 계산기는 결과 영역 광고 슬롯 추가만 확인. |
| `028c3eb` | 2026-06-16 | Update: 네이버 색인 수정2 | `pages/posts/[category]/[slug].js` | 본문 HTML h1을 h2로 낮추는 H1 중복 수정. GA4 감소 기간 이후 변경이라 2026-06-10 ~ 2026-06-14 감소 원인은 아님. |

## URL별 변경 이력 판정

| URL | 관련 파일 | 2026-06-01 이후 변경 | title/H1 변경 | seoTitle/description 변경 | canonical/hreflang/robots 변경 | 도입부/내부 링크/CTA 변경 | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi` | `content/posts/investingInfo/ko/usd-krw-weak-won-sector-map-kospi.md` | 없음 | 없음 | 없음 | 공통 `SeoHead` x-default 영향만 가능 | 없음 | 최근 변경 원인 가능성 낮음 |
| `/tools/cagr-calculator` | `pages/tools/cagr-calculator.js` | 2026-06-04 | 없음 | 없음 | 없음 | 결과 영역 `ResultAdSlot` 2개 추가 | 기술 SEO 원인 가능성 낮음, UX/광고 영향은 별도 관찰 |
| `/posts/personalFinance/what-is-cagr` | `content/posts/personalFinance/ko/what-is-cagr.md` | 없음 | 없음 | 없음 | 공통 `SeoHead` x-default 영향만 가능 | 없음 | 최근 변경 원인 가능성 낮음 |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md` | 2026-06-02, 2026-06-04 | title/본문 H1 후보 문구 변경됨 | seoTitle/seoDescription 변경됨 | noindex/canonical 직접 변경 없음 | 도입부, CTA, 내부 링크, FAQ 변경됨 | 랭킹/CTR 변동 후보 |
| `/market/real-estate/magok-top100` | `pages/market/real-estate/magok-top100.js` | 없음 | 없음 | 없음 | 공통 `SeoHead` x-default 영향만 가능 | 없음 | 최근 변경 원인 가능성 낮음 |
| `/market/real-estate/songpa-top100` | `pages/market/real-estate/songpa-top100.js` | 없음 | 없음 | 없음 | 공통 `SeoHead` x-default 영향만 가능 | 없음 | 최근 변경 원인 가능성 낮음 |
| `/tools/goal-simulator` | `pages/tools/goal-simulator.js` | 2026-06-04 | 없음 | 없음 | 없음 | 결과 영역 `ResultAdSlot` 2개 추가 | 기술 SEO 원인 가능성 낮음, UX/광고 영향은 별도 관찰 |
| `/posts/personalFinance/compound-return-3-5-7-10-table` | `content/posts/personalFinance/ko/compound-return-3-5-7-10-table.md` | 없음 | 없음 | 없음 | 공통 `SeoHead` x-default 영향만 가능 | 없음 | 최근 변경 원인 가능성 낮음 |
| `/` | `pages/index.js` | 없음 | 없음 | 없음 | 공통 `SeoHead` x-default 영향만 가능 | 없음 | 최근 변경 원인 가능성 낮음 |

## 항목별 감사

### seoTitle / seoDescription

- `/posts/personalFinance/dsr-40-income-loan-limit-table`만 2026-06-02에 `seoTitle`, `seoDescription` 변경이 확인된다.
- `/posts/investingInfo/usd-krw-weak-won-sector-map-kospi`, `/posts/personalFinance/what-is-cagr`, `/posts/personalFinance/compound-return-3-5-7-10-table`은 2026-06-01 이후 SEO frontmatter 변경 이력이 없다.
- `/tools/cagr-calculator`, `/tools/goal-simulator`의 2026-06-04 변경은 SEO title/description 변경이 아니라 결과 영역 광고 슬롯 추가다.

### title / H1

- DSR 글은 2026-06-02에 frontmatter `title`이 변경되었고, 블로그 상세 템플릿이 `post.title`을 H1로 쓰므로 최종 H1도 바뀐 것으로 본다.
- 2026-06-16의 blog detail page 변경은 본문 내부 H1을 H2로 낮춘 수정이다. 감소 비교 기간인 2026-06-10 ~ 2026-06-14 이후 변경이므로 이번 유입 감소의 선행 원인은 아니다.

### canonical / hreflang

- `1002da3`에서 `SeoHead`의 `x-default` alternate 출력이 홈 URL에만 남도록 변경되었다.
- 이 변경은 일반 페이지의 ko/en hreflang 자체를 제거하지 않고, canonical도 변경하지 않는다.
- 운영 URL 기술 감사에서 핵심 URL 9개 모두 self-canonical 및 ko/en hreflang이 확인되었다.

### robots / noindex

- 대상 파일 변경 이력에서 robots/noindex 추가는 확인되지 않았다.
- 운영 URL 기술 감사에서도 대상 9개 URL에 meta noindex 또는 X-Robots-Tag noindex가 없었다.

### 본문 상단 도입부

- DSR 글은 2026-06-02에 도입부가 대폭 바뀌었고, 2026-06-04에 기준 가정 문장과 CTA가 추가되었다.
- 나머지 후보 글의 2026-06-01 이후 도입부 변경 이력은 확인되지 않았다.

### 내부 링크 / CTA

- DSR 글은 2026-06-02에 `DSR/LTV 계산기`, `부동산 대시보드`, 관련 글 링크가 추가/개편되었다.
- 2026-06-04에는 부동산 대시보드 query URL CTA가 추가되었다.
- CAGR/Goal 계산기는 2026-06-04에 `ResultAdSlot`이 결과 요약 뒤와 차트 뒤에 추가되었다. canonical/hreflang에는 영향이 없지만 사용성/체류/광고 레이아웃 영향은 별도 확인 대상이다.

## 기술 감사와 연결한 해석

- `reports/naver-drop-core-url-technical-audit-20260616.md` 기준 대상 9개 URL은 모두 `OK`다.
- 따라서 네이버 유입 감소를 noindex, canonical mismatch, redirect, H1 중복, sitemap 누락 같은 확실한 기술 오류로 설명하기는 어렵다.
- 기술 문제가 아니라면 후보는 네이버 검색 결과 노출/순위 변동, 제목/스니펫 CTR 변동, 경쟁 문서 변화, 검색 수요 변화, GA4 표본/필터 차이 쪽이다.
- GA4 CSV 원본이 없어 URL별 감소량/그룹별 기여도는 아직 확정하지 못했다. `reports/ga4-naver-page-drop-analysis-20260616.md`는 입력 파일 누락 상태를 기록한다.

## 후속 패치 제안

- 현재 감사 결과만으로 즉시 적용할 확실한 기술 SEO 패치는 없다.
- DSR 글은 2026-06-02/06-04 변경 이후 네이버 유입이 줄었는지 GA4 URL별 자료로 별도 확인한 뒤, 필요 시 제목/도입부/구조화 데이터 복원 또는 A/B 성격의 재조정을 검토한다.
- CAGR/Goal 계산기 광고 슬롯은 기술 SEO 오류는 아니지만, 모바일 첫 화면/결과 영역 체감 속도와 광고 배치가 유입 후 행동 지표에 영향을 주는지 별도 UX 지표로 확인한다.

## 사용한 명령

- `git log --since=2026-06-01 --date=short --pretty=format:"%h%x09%ad%x09%s" --name-status -- ...`
- `git show --unified=5 --format=medium 1002da3 -- _components\SeoHead.js`
- `git show --unified=5 --format=medium 6f5fa77 -- content\posts\personalFinance\ko\dsr-40-income-loan-limit-table.md`
- `git show --unified=5 --format=medium 9e1fc55 -- content\posts\personalFinance\ko\dsr-40-income-loan-limit-table.md pages\tools\cagr-calculator.js`
- `git show --unified=5 --format=medium 9e1fc55 -- pages\tools\goal-simulator.js`
- `git show --unified=5 --format=medium 028c3eb -- pages\posts\[category]\[slug].js`
