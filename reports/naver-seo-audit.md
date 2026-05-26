# FinMap 네이버 SEO 기술 점검

점검일: 2026-05-26  
대상 도메인: `https://www.finmaphub.com`

## 요약

- `robots.txt`는 네이버봇을 별도로 차단하지 않습니다.
- `robots.txt`에 `sitemap.xml`과 실제 자식 sitemap인 `sitemap-0.xml`을 모두 명시했습니다.
- canonical/hreflang의 기준 도메인은 `https://www.finmaphub.com`으로 통일되어 있습니다.
- sitemap 재생성 결과 `172`개 URL이 포함되었고, `/api`, `/admin`, `/private`, `/rss.xml`, `/robots.txt`, `404/500`, `/en/en` 같은 제외 대상은 없었습니다.
- 기존에는 아파트 상세 URL `1000`개가 sitemap에 포함되었으나, 상세 페이지의 `noindex,follow` 정책과 충돌하지 않도록 sitemap에서 제외했습니다.
- `/rss.xml`은 최신 한국어 블로그 글 30개 중심으로 생성되도록 보강했습니다.
- 너무 일반적이거나 짧은 정적 페이지 title/description을 일부 보강했습니다.

## 확인 결과

### robots.txt

- 현재 허용 정책:
  - `User-agent: *`
  - `Allow: /`
  - `Disallow: /api/`, `/admin/`, `/private/`, `/cdn-cgi/`
- `Yeti`, `NaverBot`, `NaverBot/1.0` 등 네이버봇 전용 차단 규칙은 없습니다.
- 수정:
  - `Sitemap: https://www.finmaphub.com/sitemap.xml`
  - `Sitemap: https://www.finmaphub.com/sitemap-0.xml`

### sitemap / next-sitemap

- `next-sitemap.config.js`
  - `siteUrl`: `https://www.finmaphub.com`
  - `generateIndexSitemap: true`
  - `generateRobotsTxt: false`
  - `/api`, `/admin`, `/private`, `/rss.xml`, `/robots.txt`, `404/500`, 잘못된 `/ko`, `/en/en`, 구형 post 언어 세그먼트 URL 제외
- `public/sitemap.xml`
  - sitemap index이며 `https://www.finmaphub.com/sitemap-0.xml`을 가리킵니다.
- `public/sitemap-0.xml`
  - 재생성 결과 URL `172`개
  - 아파트 상세 URL `0`개 포함
  - 제외 대상 URL `0`개
  - 전체 URL host는 `www.finmaphub.com`
- 추가 수정:
  - `/tools/dsr-ltv-calculator`가 실제 EN locale을 지원하지만 sitemap i18n 목록에서 빠져 있어 `/en/tools/dsr-ltv-calculator`와 hreflang이 생성되도록 추가했습니다.
  - 아파트 상세 URL은 기본값에서 sitemap 제외로 변경했습니다. `RE_APT_SITEMAP=true`를 명시한 경우에만 `buildAptDetailPaths()`가 동작합니다.

### noindex와 sitemap

- 코드상 noindex:
  - `pages/404.js`: `noindex,follow`
  - `pages/market/real-estate/apt/[aptKey].js`: 이번 작업에서는 robots 정책을 변경하지 않고 유지
- sitemap 재생성 후 확인:
  - `404/500`, API, RSS, robots, private/admin URL 없음
  - `/market/real-estate/apt/` URL `0`개
  - 기존에는 DB에서 거래 통계가 있는 아파트 상세 URL `1000`개가 `additionalPaths`로 들어갔으나, noindex/sitemap 충돌 제거를 위해 기본 제외로 전환했습니다.
  - 향후 아파트 상세를 색인하려면 SSR/SSG 기반으로 검색엔진이 읽을 수 있는 충분한 상세 콘텐츠를 안정적으로 제공한 뒤, 조건부 `index,follow` 전환과 sitemap 재포함을 함께 검토해야 합니다.

### RSS

- 기존 `/rss.xml` 라우트는 있었지만 KO/EN 전체 글을 함께 섞는 구조였습니다.
- 수정:
  - 기본 RSS 제목을 `FinMap 최신 한국어 글`로 변경
  - `<language>ko-KR</language>` 추가
  - `content/posts/*/ko/*.md` 기준 최신 글 30개 우선 사용
  - fallback으로 sitemap을 읽을 때도 `/en/posts/` 제외
  - 모든 페이지 head에 RSS discovery 링크 추가
- 검증:
  - RSS 응답 status `200`
  - item `30`개
  - EN post URL 포함 여부: `false`

### canonical / hreflang / robots 메타

- `SeoHead`
  - canonical, OG URL, hreflang은 `https://www.finmaphub.com` 기준
  - `/en` 중복 제거 및 query/hash 제거 로직 있음
  - RSS discovery 링크 추가
- `ToolSeo`
  - 내부 canonical 빌더도 `https://www.finmaphub.com` 기준
  - `robots` 기본값은 `index,follow,max-image-preview:large`
  - WebApplication JSON-LD URL도 canonical URL을 사용
- 블로그 상세 페이지
  - canonical은 `https://www.finmaphub.com[/en]/posts/{category}/{slug}`
  - Article/BlogPosting JSON-LD, Breadcrumb JSON-LD 사용
  - KO/EN 글 59쌍 모두 존재 확인

## title 점검

### 수정한 일반적 title

- `/`: `홈` → `FinMap 금융 지도`
- `/en`: `Home` → `FinMap Finance Blog and Calculators`
- `/market`: `시장정보` → `금융·부동산 시장정보`
- `/en/market`: `Market Info` → `Financial and Real Estate Market Data`
- `/about`: `About` → `FinMap 소개` / `About FinMap`
- `/disclaimer`: `Disclaimer` → `투자 정보 면책 고지` / `FinMap Disclaimer`
- `/sitemap-pages`: `사이트맵` → `FinMap 사이트맵`
- `/en/sitemap-pages`: `Sitemap` → `FinMap Sitemap`

### 추가 확인

- 블로그 글 118개 파일 기준 title 중복 없음
- 주요 부동산 Top100 랜딩은 지역/의도별 title을 사용 중
- `Privacy Policy`, `Terms of Service`는 법적 페이지 특성상 일반적이지만 허용 가능한 범위로 판단했습니다.

## description 점검

### 수정한 짧거나 키워드 나열형 description

- `/`, `/en`
- `/market`, `/en/market`
- `/about`, `/en/about`
- `/disclaimer`, `/en/disclaimer`
- `/privacy`, `/en/privacy`
- `/terms`, `/en/terms`
- `/sitemap-pages`, `/en/sitemap-pages`

### 추가 확인

- 블로그 글 118개 파일 기준 description 누락 없음
- 블로그 글 118개 파일 기준 description 중복 없음
- 최신 한국어 글들의 description 길이는 대체로 60자 이상으로 확인했습니다.

## 수정 파일

- `_components/SeoHead.js`
- `next-sitemap.config.js`
- `pages/rss.xml.js`
- `pages/index.js`
- `pages/market/index.js`
- `pages/about.js`
- `pages/disclaimer.js`
- `pages/privacy.js`
- `pages/terms.js`
- `pages/sitemap-pages.js`
- `public/robots.txt`
- `public/sitemap-0.xml` (next-sitemap 재생성 결과)
- `reports/naver-seo-audit.md`

## 검증 명령과 결과

- `npm.cmd run build`
  - Next.js production build 성공
  - sandbox 내부 실행에서는 postbuild `next-sitemap` 단계가 `public/sitemap-0.xml` 쓰기 `EPERM`을 표시
  - 권한 승인 후 재실행에서는 build와 postbuild sitemap 생성 모두 성공
- `npx.cmd next-sitemap`
  - sitemap 생성 성공
- sitemap 검증 스크립트
  - 총 URL `172`
  - 아파트 상세 URL `0`
  - 제외 대상 URL `0`
  - `/en/tools/dsr-ltv-calculator` 포함 및 hreflang 생성 확인
- RSS 검증 스크립트
  - status `200`
  - item `30`
  - EN post URL 없음

## 남은 과제

- 네이버 서치어드바이저에서 `https://www.finmaphub.com/sitemap.xml`을 다시 제출하고, 필요하면 `https://www.finmaphub.com/sitemap-0.xml`도 별도 제출합니다.
- 아파트 상세를 향후 index 대상으로 전환하려면 상세 페이지 robots 정책, 서버 렌더링 콘텐츠 품질, canonical/hreflang, sitemap 포함 조건을 함께 바꿔야 합니다.
- `RE_APT_SITEMAP=true`는 향후 조건부 색인을 준비할 때만 사용해야 합니다. 현재 기본값에서는 아파트 상세 URL이 sitemap에 포함되지 않습니다.
- 법적/안내 페이지의 본문 H1은 일부 영어 표현이 남아 있습니다. 색인에는 치명적이지 않지만, 한국어 UX까지 맞추려면 별도 소규모 문구 정리를 권장합니다.
