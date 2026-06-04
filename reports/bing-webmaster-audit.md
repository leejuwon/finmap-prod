# Finmap Bing Webmaster Sitemap Audit

- 점검일: 2026-06-04 (KST)
- 제출 권장 URL: `https://www.finmaphub.com/sitemap.xml`
- 결론: sitemap index, canonical URL 정리, `www` 통일, noindex/redirect 제외는 정상이다. 정적 페이지의 잘못된 빌드 시각 `lastmod`를 제거했고, Bing 제출 전 반복 검증 스크립트를 추가했다.

## 1. 점검 대상

- `next-sitemap.config.js`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/sitemap-0.xml`
- `pages/rss.xml.js`
- canonical/noindex/redirect 관련 코드:
  - `_components/SeoHead.js`
  - `_components/ToolSeo.js`
  - `pages/posts/[category]/[slug].js`
  - `pages/market/real-estate/apt/[aptKey].js`
  - `next.config.js`
  - `proxy.js`

## 2. 핵심 점검 결과

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| robots의 sitemap 안내 | PASS | `Sitemap: https://www.finmaphub.com/sitemap.xml` 한 줄만 유지 |
| `sitemap.xml` 형식 | PASS | 실제 `<sitemapindex>`이며 `sitemap-0.xml` 하나를 가리킴 |
| child sitemap URL 수 | PASS | `public/sitemap-0.xml`에 canonical 후보 URL `199`개 |
| `www`/HTTPS 통일 | PASS | non-www 또는 non-HTTPS URL `0`개 |
| 중복 URL | PASS | 중복 `<loc>` `0`개 |
| 잘못된 locale/쿼리/fragment/trailing slash | PASS | 위반 `0`개 |
| noindex URL 혼입 | PASS | 404/500 및 `/market/real-estate/apt/*` 혼입 `0`개 |
| redirect source URL 혼입 | PASS | `next.config.js`의 exact source URL 혼입 `0`개 |
| 포스트 URL 정합성 | PASS | 기대 포스트 `142`개, sitemap 포스트 `142`개, 누락/예상 밖 URL `0`개 |
| 포스트 `lastmod` 정합성 | PASS | `dateModified` 우선, 없으면 `datePublished` 기준 전수 비교 불일치 `0`개 |

## 3. 발견한 문제와 개선

### 3.1 정적 페이지의 부정확한 `lastmod`

기존 설정은 포스트/카테고리 외 모든 페이지에 sitemap 생성 시각을 `lastmod`로 넣었다. 따라서 실제 콘텐츠가 수정되지 않아도 빌드할 때마다 홈, 도구, 시장 페이지 등의 수정일이 바뀌었다.

Bing 공식 가이드는 sitemap 생성 시각을 `lastmod`로 사용하지 말고 실제 콘텐츠 수정일을 사용하도록 안내한다. 이에 다음처럼 변경했다.

- `autoLastmod: false`를 명시했다.
- 포스트는 `dateModified` → `datePublished` → 파일 수정 시각 순서로 실제 근거가 있는 날짜만 사용한다.
- 카테고리 허브는 해당 카테고리 포스트 중 가장 최근 수정일을 사용한다.
- 신뢰할 수정일이 없는 정적 페이지는 잘못된 날짜 대신 `lastmod`를 생략한다.
- 결과: 전체 URL `199`개 중 `lastmod`가 있는 URL은 `148`개다.
  - 포스트 `142`개
  - 카테고리 허브 `6`개
  - 나머지 정적/도구/시장 URL `51`개는 정확한 수정일 소스가 없어 생략

### 3.2 robots의 중복 sitemap 안내

기존 robots는 sitemap index와 child sitemap을 모두 나열했다. 유효하지 않은 구조는 아니지만, Bing Webmaster Tools에는 index 하나를 제출하고 그 안에서 child 처리를 추적하는 편이 관리가 단순하다.

- 유지: `Sitemap: https://www.finmaphub.com/sitemap.xml`
- 제거: `Sitemap: https://www.finmaphub.com/sitemap-0.xml`

### 3.3 noindex 포스트 방어

현재 콘텐츠에는 `draft`, `noindex`, `robots: noindex` frontmatter가 없었다. 다만 향후 이런 포스트가 추가되면 sitemap에 포함될 가능성이 있어 생성 단계에서 명시적으로 제외하도록 보완했다.

### 3.4 제출 전 자동 검증

`scripts/verify_bing_sitemap.js`를 추가했다. 다음 항목을 한 번에 검증하고 하나라도 위반하면 종료 코드 `1`을 반환한다.

- sitemap index와 child 연결
- robots의 sitemap index URL
- 중복, non-www, non-HTTPS, query, fragment, trailing slash
- `/en/en`, `/posts/*/(ko|en)/*`
- 알려진 noindex/error URL
- exact redirect/config source URL
- 콘텐츠 포스트 URL 누락/추가
- 포스트 frontmatter 대비 `lastmod` 불일치

실행 명령:

```powershell
node scripts\verify_bing_sitemap.js
```

## 4. Canonical, Noindex, Redirect 근거

- 사이트 URL 상수와 SEO 컴포넌트는 `https://www.finmaphub.com` 기준이다.
- 블로그 canonical은 `pages/posts/[category]/[slug].js`에서 KO는 `/posts/...`, EN은 `/en/posts/...`로 생성한다.
- sitemap 포스트 경로도 같은 category/lang/filename 규칙으로 생성한다.
- 아파트 상세 `/market/real-estate/apt/[aptKey]`는 `noindex,follow`이며 sitemap에서 제외한다.
- API 경로는 sitemap에서 제외되고 `proxy.js`에서 `X-Robots-Tag`를 적용한다.
- legacy post/category, locale 중복, trailing slash redirect source는 sitemap에 포함되지 않았다.

현재 generated sitemap 기준으로 canonical 후보가 아닌 것으로 판단되는 URL은 발견되지 않았다. 배포 후 실제 HTTP 응답의 canonical/status를 Bing Site Scan으로 다시 확인하는 것은 별도 운영 점검 항목이다.

## 5. RSS 점검

RSS 생성 파일은 `pages/rss.xml.js`다.

- URL: `https://www.finmaphub.com/rss.xml`
- 사이트/아이템 URL: 모두 `https://www.finmaphub.com` 기준
- 대상: 최신 한국어 포스트 최대 `50`개
- 제외: `draft`, `noindex`, `robots`에 `noindex`가 있는 포스트
- RSS item의 `link`와 `guid`: 실제 포스트 라우트/sitemap과 같은 markdown 파일명 slug 기반 canonical URL
- XML sitemap에서는 `/rss.xml`을 제외하고 있다.

Bing은 RSS 2.0도 sitemap/feed 형식으로 받을 수 있다. 기본 제출은 XML sitemap index 하나로 유지하고, 새 한국어 글 발견 속도를 보조하려는 경우에만 `/rss.xml`을 추가 제출하는 방식을 권장한다.

## 6. Bing Webmaster Tools 제출 체크리스트

- [ ] 변경 사항을 production에 배포한다.
- [ ] 브라우저 또는 `curl`로 다음 URL이 `200`인지 확인한다.
  - `https://www.finmaphub.com/robots.txt`
  - `https://www.finmaphub.com/sitemap.xml`
  - `https://www.finmaphub.com/sitemap-0.xml`
- [ ] `robots.txt`에 `Sitemap: https://www.finmaphub.com/sitemap.xml`이 보이는지 확인한다.
- [ ] Bing Webmaster Tools에서 `https://www.finmaphub.com` 속성을 선택한다.
- [ ] Sitemaps 메뉴에 `https://www.finmaphub.com/sitemap.xml`만 우선 제출한다.
- [ ] sitemap index 상세에서 `sitemap-0.xml` 처리 상태와 발견 URL 수를 확인한다.
- [ ] 기존에 child sitemap을 별도 제출했다면 중복 모니터링을 피하기 위해 제거 여부를 검토한다.
- [ ] Bing Site Scan을 sitemap 범위로 실행해 redirect, canonical, noindex 경고를 확인한다.
- [ ] 새 글 반영 속도가 중요하면 `https://www.finmaphub.com/rss.xml` 추가 제출 또는 IndexNow 도입을 검토한다.
- [ ] 이후 빌드마다 `node scripts\verify_bing_sitemap.js`를 실행한다.

## 7. 검증 결과

### 전용 검증

`node scripts\verify_bing_sitemap.js`

- `urlCount`: `199`
- `lastmodCount`: `148`
- `expectedPostCount`: `142`
- `sitemapPostCount`: `142`
- duplicate/non-www/malformed/noindex/redirect/missing/unexpected/lastmod mismatch: 모두 `0`
- `failures`: `0`

### 빌드

`npm.cmd run build`

- Next.js production build 성공
- 정적 페이지 `209/209` 생성 성공
- postbuild `next-sitemap` 성공
- build 후 전용 sitemap 검증 재실행 성공

## 8. 변경 파일

- `next-sitemap.config.js`
  - build-time `lastmod` 제거
  - `autoLastmod: false`
  - draft/noindex 포스트 제외
  - 연결되지 않은 post URL 제외
- `public/robots.txt`
  - sitemap index URL 하나만 유지
- `public/sitemap-0.xml`
  - 정확한 수정일이 없는 URL의 build-time `lastmod` 제거
- `pages/rss.xml.js`
  - RSS URL slug를 실제 포스트 라우트와 같은 markdown 파일명 기준으로 고정
- `scripts/verify_bing_sitemap.js`
  - Bing 제출 전 sitemap 자동 검증 추가
- `reports/bing-webmaster-audit.md`
  - 점검 결과 및 제출 체크리스트

`public/sitemap.xml`은 재생성되었지만 내용 변경은 없다.

## 9. 실행 명령과 결과

| 명령 | 결과 |
| --- | --- |
| `npm.cmd run postbuild` | PASS, sitemap index/child 재생성 |
| `node --check scripts\verify_bing_sitemap.js` | PASS |
| `node scripts\verify_bing_sitemap.js` | PASS, failures `0` |
| `npm.cmd run build` | PASS, Next build 및 next-sitemap 완료 |
| `git diff --check` | PASS, whitespace 오류 없음. 기존 파일들의 LF→CRLF 경고만 표시 |

## 10. 남은 운영 확인

- 로컬 생성물과 코드 기준 점검은 통과했다. production 배포 전이므로 Bing이 실제로 읽는 live URL의 상태는 배포 후 확인해야 한다.
- 정적 페이지에도 실제 수정일을 제공하려면 향후 route별 수정일 메타데이터 맵을 추가할 수 있다. 현재는 부정확한 날짜를 보내지 않도록 생략하는 정책이다.
- IndexNow는 이번 범위에서 구현하지 않았다.

## 11. Bing 공식 참고 자료

- Bing Webmaster Tools Sitemaps: <https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed>
- Bing Webmaster Guidelines: <https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a>
- Bing Webmaster Blog, sitemap basics and accurate `lastmod`: <https://blogs.bing.com/webmaster/May-2016/Sitemaps-%E2%80%93-4-Basics-to-Get-You-Started>
- Bing URL Submission and IndexNow: <https://www.bing.com/webmasters/help/URL-Submission-62f2860b>
- Bing robots meta support: <https://www.bing.com/webmasters/help/which-robots-metatags-does-bing-support-5198d240>
