# Finmap Post-Publish SEO Checklist

- 작성일: 2026-06-19
- 목적: 새 글 또는 주요 수정 글 발행 후 KO는 네이버 서치어드바이저 중심, EN은 Google Search Console + Bing Webmaster Tools 중심으로 제출/검증한다.
- 원칙: 실제 검색엔진 제출은 자동 실행하지 않는다. API key, 인증정보, 토큰은 코드에 하드코딩하지 않는다. 기존 canonical/hreflang/sitemap/robots 구조는 변경하지 않는다.

## 발행 후 공통 순서

1. 글 파일 저장
   - KO: `content/posts/{category}/ko/{slug}.md`
   - EN: `content/posts/{category}/en/{slug}.md`
2. 새 글 또는 주요 수정 글이면 frontmatter의 `datePublished`, `dateModified`, `draft`, `noindex`, `robots` 상태를 확인한다.
3. 배포 전 또는 배포 과정에서 sitemap/RSS가 갱신되는지 확인한다.
   - 전체 sitemap: `public/sitemap-0.xml`
   - KO sitemap: `public/sitemap-ko.xml`
   - EN sitemap: `public/sitemap-en.xml`
   - EN URL-prefix sitemap: `public/en/sitemap.xml`
   - KO RSS: `/rss.xml`
4. 최근 수정 URL 목록을 뽑는다.
   - `node scripts\list_recent_changed_urls.js --limit=20 --format=md`
   - KO만: `node scripts\list_recent_changed_urls.js --lang=ko --limit=20 --format=md`
   - EN만: `node scripts\list_recent_changed_urls.js --lang=en --limit=20 --format=md`
5. URL별 SEO 상태를 검증한다.
   - 로컬 빌드 서버 기준: `node scripts\verify_post_publish_urls.js --local-server <URL>`
   - 최근 글 기준: `node scripts\verify_post_publish_urls.js --recent --limit=10 --local-server`
   - 포트 충돌 시: `$env:POST_PUBLISH_SEO_PORT='8021'; node scripts\verify_post_publish_urls.js --local-server <URL>`

## KO 발행 후 체크리스트

| 항목 | 확인 기준 | 확인 방법 |
| --- | --- | --- |
| URL 구조 | `/posts/{category}/{slug}`. `/ko` prefix 없음 | 최근 URL 목록 또는 브라우저에서 확인 |
| sitemap 포함 여부 | `sitemap-0.xml`과 `sitemap-ko.xml`에 canonical URL 포함 | `verify_post_publish_urls.js`의 `Sitemap` 컬럼에서 `main:yes`, `ko:yes` |
| RSS 포함 여부 | 새 KO 글 또는 네이버에 즉시 알릴 주요 수정 글은 `/rss.xml` 상위 50개에 포함되는지 확인 | `verify_post_publish_urls.js`의 `RSS` 컬럼 확인 |
| robots 차단 여부 | `robots.txt`에서 차단되지 않음 | `Robots blocked`가 `no` |
| canonical self 여부 | HTML canonical이 자기 URL과 같음 | `Canonical self`가 `yes` |
| meta robots noindex 여부 | `meta robots` 또는 `X-Robots-Tag`에 `noindex` 없음 | `Meta noindex`가 `no` |
| hreflang | KO/EN pair가 있으면 `ko`, `en` alternate가 연결됨 | `hreflang pair`가 `yes` |
| 네이버 서치어드바이저 수집요청 대상 | 신규 KO 글, 검색어 대응 목적의 주요 수정 글, 네이버 급락 대응 대표 URL | 수동으로 수집 요청. 자동 제출 금지 |
| GA4 naver organic 추적 | `session source / medium = naver / organic`, landing page가 해당 KO URL | GA4 Traffic acquisition, Landing page + query string 기준 |

### KO 운영 메모

- `/rss.xml`은 KO 글만 대상으로 하며 최신 KO 글 중심으로 제한된다.
- 주요 수정 글을 네이버에 다시 밀어야 한다면 `dateModified`를 최신으로 유지하고 RSS 포함 여부를 확인한다.
- 파일 수정시간 기준 최근 글과 RSS 정렬 기준은 다를 수 있다. `list_recent_changed_urls.js`에서 최근으로 보이더라도 RSS에 없을 수 있으므로 별도 확인한다.
- 네이버 수집요청은 제출 후보 URL을 사람이 확인한 뒤 수동으로 진행한다.

## EN 발행 후 체크리스트

| 항목 | 확인 기준 | 확인 방법 |
| --- | --- | --- |
| URL 구조 | `/en/posts/{category}/{slug}` | 최근 URL 목록 또는 브라우저에서 확인 |
| `/en/sitemap.xml` 포함 여부 | `public/en/sitemap.xml`에 EN canonical URL 포함 | `verify_post_publish_urls.js`의 `Sitemap` 컬럼에서 `enPrefix:yes` |
| EN channel sitemap 포함 여부 | `public/sitemap-en.xml`에 포함 | `Sitemap` 컬럼에서 `en:yes` |
| GSC EN URL-prefix 제출 대상 | `https://www.finmaphub.com/en/` 속성에서는 `/en/sitemap.xml` 제출 | GSC에서 sitemap 수동 제출 |
| GSC root property 제출 대상 | root 속성에서는 `/sitemap-en.xml` 우선 제출, 필요 시 `/sitemap.xml` 병행 | GSC에서 sitemap 수동 제출 |
| Bing 제출 대상 | `/sitemap-en.xml` 제출, 중요 URL은 Bing URL Inspection 또는 수동 제출 | Bing Webmaster Tools에서 수동 제출 |
| IndexNow 제출 대상 | 공개 200, self-canonical, noindex 없음, EN 신규/주요 수정 URL | API key가 준비된 경우에만 별도 수동 스크립트로 제출. 현재 자동 실행 없음 |
| canonical self 여부 | HTML canonical이 자기 EN URL과 같음 | `Canonical self`가 `yes` |
| hreflang ko/en pair 여부 | `hreflang ko`는 KO canonical, `hreflang en`은 EN canonical | `hreflang pair`가 `yes` |
| robots/noindex | robots 차단 없음, noindex 없음 | `Robots blocked`가 `no`, `Meta noindex`가 `no` |

### EN 운영 메모

- EN URL-prefix GSC 속성에서는 root의 `/sitemap-en.xml`을 직접 제출하기 어렵기 때문에 `https://www.finmaphub.com/en/sitemap.xml`을 제출한다.
- Bing은 `https://www.finmaphub.com/sitemap-en.xml`을 우선 제출한다.
- EN 글은 RSS 제출 대상이 아니다. RSS는 KO/Naver 보조 채널로 유지한다.
- KO 글을 단순 번역한 EN 글보다 calculator/explainer/Korea market guide intent가 있는 EN 글을 우선 제출한다.

## IndexNow 환경변수 안내

현재 스크립트는 IndexNow 제출을 실행하지 않는다. 나중에 별도 제출 스크립트를 만들 경우 아래 값을 환경변수로만 주입한다.

| 환경변수 | 용도 |
| --- | --- |
| `INDEXNOW_KEY` | IndexNow API key |
| `INDEXNOW_KEY_LOCATION` | key 파일 공개 URL. 예: `https://www.finmaphub.com/{key}.txt` |
| `INDEXNOW_HOST` | `www.finmaphub.com` |
| `INDEXNOW_ENDPOINT` | 기본값 후보: `https://api.indexnow.org/indexnow` |

주의: key 파일과 API key는 코드에 하드코딩하지 않는다. 실제 제출은 URL 목록, canonical, noindex, sitemap 포함 여부를 확인한 뒤 수동으로 실행한다.

## 보조 스크립트

### `scripts/list_recent_changed_urls.js`

최근 수정된 `content/posts` 파일 기준으로 제출 후보 URL을 출력한다.

사용 예:

```powershell
node scripts\list_recent_changed_urls.js --limit=20 --format=md
node scripts\list_recent_changed_urls.js --lang=ko --limit=20 --format=md
node scripts\list_recent_changed_urls.js --lang=en --limit=20 --format=json
node scripts\list_recent_changed_urls.js --since=2026-06-01 --format=md
```

출력 항목:

- URL
- lang
- channel: `naver-ko` 또는 `gsc-bing-en`
- category
- slug
- file modified time
- KO/EN pair URL 존재 여부

### `scripts/verify_post_publish_urls.js`

URL별 HTTP/SEO 상태를 확인한다.

사용 예:

```powershell
node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/posts/personalFinance/example-slug
node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/posts/personalFinance/example-slug https://www.finmaphub.com/en/posts/personalFinance/example-slug
node scripts\verify_post_publish_urls.js --recent --limit=10 --local-server
$env:POST_PUBLISH_SEO_PORT='8021'; node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/en/posts/personalFinance/example-slug
```

검증 항목:

- HTTP status
- final URL
- canonical self 여부
- `robots.txt` 차단 여부
- meta robots / `X-Robots-Tag` noindex 여부
- `sitemap-0.xml`, channel sitemap, `/en/sitemap.xml` 포함 여부
- KO URL의 RSS 포함 여부
- hreflang `ko`/`en` pair 여부

## 이번 작업 검증 결과

| Command | Result |
| --- | --- |
| `node --check scripts\list_recent_changed_urls.js` | PASS |
| `node --check scripts\verify_post_publish_urls.js` | PASS |
| `node scripts\list_recent_changed_urls.js --limit=8 --format=md` | PASS. 최근 수정 KO URL 8개 출력, 모두 EN pair 존재 |
| `node scripts\list_recent_changed_urls.js --limit=4 --lang=en --format=md` | PASS. 최근 수정 EN URL 4개 출력, 모두 KO pair 존재 |
| `$env:POST_PUBLISH_SEO_PORT='8021'; node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/posts/personalFinance/personal-finance-3pillars https://www.finmaphub.com/en/posts/personalFinance/personal-finance-3pillars` | PASS. KO/EN 모두 HTTP 200, self-canonical, robots 차단 없음, noindex 없음, sitemap 포함, hreflang pair 확인 |

샘플 검증 메모:

- KO 샘플 `https://www.finmaphub.com/posts/personalFinance/personal-finance-3pillars`는 `sitemap-0.xml`, `sitemap-ko.xml` 포함 및 canonical/robots/hreflang 검증을 통과했다.
- 같은 KO 샘플은 RSS 컬럼이 `no`였다. RSS는 KO 최신 글 50개와 frontmatter 날짜 정렬의 영향을 받으므로, 네이버에 다시 밀어야 하는 주요 수정 글은 RSS 포함 여부를 별도로 확인해야 한다.
- EN 샘플 `https://www.finmaphub.com/en/posts/personalFinance/personal-finance-3pillars`는 `sitemap-0.xml`, `sitemap-en.xml`, `/en/sitemap.xml` 포함 및 canonical/robots/hreflang 검증을 통과했다.

## 제출 판단 기준

| 판정 | 기준 | 조치 |
| --- | --- | --- |
| 제출 가능 | 200, self-canonical, noindex 없음, robots 차단 없음, sitemap 포함 | 채널별 수동 제출 진행 |
| RSS 확인 필요 | KO 신규/주요 수정인데 RSS에 없음 | `dateModified`와 RSS 포함 여부 재확인 후 네이버 제출 |
| sitemap 재생성 필요 | sitemap membership이 `no` | build/postbuild 또는 `node scripts\generate_channel_sitemaps.js` 실행 후 재검증 |
| 제출 보류 | 404/redirect, canonical mismatch, noindex, robots 차단 | 원인 수정 전 제출하지 않음 |
