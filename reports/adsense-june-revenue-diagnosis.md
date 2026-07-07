# Finmap AdSense 6월 수익 저조 원인 점검

- 점검일: 2026-07-02 (KST)
- 범위: production 코드, production build 산출물, 공개 URL 응답
- 원칙: 코드 및 광고 배치 수정 없이 감사만 수행

## 1. 결론 요약

현재 코드 기준으로 블로그 상세의 광고 슬롯이나 AdSense publisher ID가 통째로 누락된 상태는 아니다. 두 대상 KO 글은 모두 상단 1개, H2 기준 본문 2개, 하단 1개로 최대 4개 슬롯을 가진다. 복리와 DSR/LTV 계산기도 현재 허용 경로와 슬롯 ID가 production client bundle에 포함된다.

다만 6월 수익이 낮게 남을 수 있는 구조적 원인은 확인됐다.

1. AdSense 스크립트는 전체 경로가 아니라 allowlist 경로에서만 로드된다. GA4 유입 증가분이 홈, 카테고리, 도구 허브 등 비허용 경로에 집중됐다면 광고 기회가 늘지 않는다.
2. 복리 계산기는 계산 전 광고가 0개다. 계산 완료와 추가 스크롤을 모두 통과해야 결과 광고 2개에 도달한다.
3. DSR/LTV는 기본 결과와 슬롯이 즉시 생성되지만 첫 광고가 긴 입력·결과 섹션 뒤에 있어 첫 화면 노출은 어렵다.
4. 스크립트는 `lazyOnload`, 슬롯 push는 viewport 300px 근접 후 시작한다. `window.adsbygoogle` 대기는 200ms 간격 최대 25회, 약 5초뿐이라 느린 모바일·idle 지연 환경에서는 push 기회를 놓칠 수 있다.
5. `result_ad_view`는 광고가 아니라 160px 최소 높이의 컨테이너가 50% 보였는지만 센다. 스크립트 실패, push 실패, unfilled 상태에서도 발생할 수 있어 실제 AdSense 노출보다 과다 집계될 수 있다.
6. 블로그 광고에는 대응하는 viewport 이벤트가 없다. 네이버 유입 글의 슬롯 도달률을 GA4로 분리할 수 없다.
7. 2026-06-04 이전 코드에는 DSR/LTV와 복리 경로가 AdSense script allowlist에 없었다. 해당 기간 또는 배포 반영 전에는 슬롯 컨테이너와 `result_ad_view`가 있어도 광고 요청은 실패할 수 있었다.

따라서 현재 코드만으로 `$0.3~0.4`의 단일 원인을 확정할 수는 없다. 가장 가능성이 높은 설명은 낮은 광고 요청 수와 낮은 슬롯 도달률이며, 실제 판정에는 AdSense의 페이지별 page views, ad requests, match rate, impressions, Active View, CTR, CPC가 필요하다.

## 2. 공통 스크립트와 publisher ID

### 현재 동작

`pages/_app.js`는 아래 경로에서만 AdSense loader를 렌더한다.

- `/posts/[category]/[slug]`
- `/tools/fire-calculator`
- `/tools/dsr-ltv-calculator`
- `/tools/compound-interest`
- `/tools/goal-simulator`
- `/tools/dca-calculator`
- `/tools/cagr-calculator`
- `/market/real-estate`
- `/market/real-estate/apt/*`

따라서 production 전체 경로 삽입은 아니다. 다만 요청된 두 post와 두 calculator는 모두 포함된다. locale prefix와 query가 아닌 `router.pathname`을 보므로 KO/EN 및 preset query에도 같은 조건이 적용된다.

publisher ID는 다음 세 위치에서 동일하다.

| 위치 | 값 | 역할 |
| --- | --- | --- |
| `pages/_app.js` | `ca-pub-1869932115288976` | loader URL |
| `pages/_document.js` | `ca-pub-1869932115288976` | `google-adsense-account` meta |
| `config/adSlots.js` | `ca-pub-1869932115288976` | 각 `ins`의 `data-ad-client` |

production build의 `_app` client chunk에서도 client ID, 대상 경로, `adsbygoogle-loader`, `lazyOnload`를 확인했다. 세 곳에 같은 값을 중복 보유하므로 현재 오류는 아니지만 장기적으로 drift 위험은 있다.

## 3. 블로그 상세 광고

`pages/posts/[category]/[slug].js`는 모든 정상 post detail에 다음 슬롯을 구성한다.

| 위치 | 슬롯 | 조건 |
| --- | --- | --- |
| 제목·메타 아래, cover 위 | `responsiveTop` | 항상 |
| 두 번째 H2 직후 | `inArticle1` | H2가 2개 이상 |
| 네 번째 H2 직후 | `inArticle2` | H2가 4개 이상 |
| 관련 계산기 CTA 뒤, 반응 영역 앞 | `responsiveBottom` | 항상 |

두 대상 글은 각각 H2가 4개 이상이므로 build HTML에서 120px 광고 placeholder 4개를 확인했다.

| KO 글 | H2 수 | 광고 슬롯 |
| --- | ---: | ---: |
| `how-much-per-month-for-100m` | 8 | 4 |
| `monthly-dca-10-year-result` | 11 | 4 |

따라서 네이버 유입 상위 가능성이 높은 이 두 글에 광고 슬롯이 없다는 의심은 코드상 기각된다. 다른 post도 상단·하단 최소 2개는 항상 생성되며, 본문 슬롯만 H2 수에 따라 줄어든다.

상단 슬롯은 제목과 메타 바로 다음이므로 초기 viewport 또는 그 근처에 들어올 가능성이 높다. `rootMargin: 300px`로 실제 viewport 진입 전에 push를 시도한다. 본문·하단 슬롯은 스크롤 도달이 필요하다.

## 4. 계산기 광고 조건

### 복리 계산기

- 초기 `result`는 `null`이다.
- 광고 2개는 `hasResult === true` 블록 안에 있다.
- 사용자가 계산 버튼을 눌러야 `result`와 `idealResult`가 설정된다.
- 결과 요약 뒤 `inArticle1`, 차트 뒤 `inArticle2`가 렌더된다.
- 계산 전 build HTML에는 광고 placeholder와 `ins`가 없다.

즉 유입이 늘어도 계산 완료율이 낮으면 광고 요청은 거의 늘지 않는다. 계산 후에도 두 번째 슬롯은 차트 아래까지 스크롤해야 요청·view 가능성이 생긴다.

### DSR/LTV 계산기

- 기본 입력값으로 `useMemo` 계산 결과가 첫 렌더부터 존재한다.
- 별도의 계산 완료 조건 없이 광고 2개가 렌더된다.
- 핵심 결과 섹션 뒤 `inArticle1`, 민감도 표 뒤 `inArticle2`가 있다.
- build HTML에서 160px result wrapper 2개와 내부 120px placeholder 2개를 확인했다.

DOM에는 처음부터 있지만 입력 카드와 큰 결과 카드 뒤이므로 초기 viewport 노출 가능성은 낮다. 실제 수익 기회는 사용자의 하단 스크롤에 좌우된다.

## 5. URL별 점검표

`ins`는 hydration 전에는 120px placeholder로 출력되고 mount 후 생성된다. 따라서 아래의 "슬롯 있음"은 production build HTML placeholder와 client render 조건을 함께 판정한 값이다.

| URL | 광고 스크립트 | 광고 슬롯 | 초기 화면 노출 가능 | 결과 후 노출 |
| --- | --- | --- | --- | --- |
| `/posts/personalFinance/how-much-per-month-for-100m` | 있음, allowlist + `lazyOnload` | 최대 4개 | 높음: top 슬롯이 title/meta 직후 | 해당 없음, 본문 스크롤 시 3개 추가 |
| `/posts/personalFinance/monthly-dca-10-year-result` | 있음, allowlist + `lazyOnload` | 최대 4개 | 높음: top 슬롯이 title/meta 직후 | 해당 없음, 본문 스크롤 시 3개 추가 |
| `/tools/compound-interest` | 있음, allowlist + `lazyOnload` | 계산 전 0개, 계산 후 2개 | 없음 | 있음: summary 뒤와 chart 뒤 |
| `/tools/dsr-ltv-calculator` | 있음, allowlist + `lazyOnload` | 초기부터 2개 | 낮음: 긴 입력·결과 뒤 | 항상 존재, 스크롤 도달 필요 |

## 6. CSS와 lazy 조건

### 숨김·높이 0 여부

- `AdResponsive`, `AdInArticle`, `AdSenseUnit`의 `ins`는 모두 `display: block`이다.
- 각 `ins`는 `minHeight: 120px`를 가진다.
- `ResultAdSlot` wrapper는 기본 `minHeight: 160px`다.
- 광고를 직접 `display: none` 또는 `height: 0`으로 만드는 전역 CSS는 찾지 못했다.
- post article의 `overflow-x-hidden`과 root의 `overflow-x: hidden/clip`은 가로 overflow만 제한한다.
- `ResultAdSlot`의 `overflow-hidden`은 고정 height가 아니라 min-height와 함께 사용되므로 현재 코드만으로 세로 높이 0을 만들지는 않는다.

CSS가 광고를 숨기는 직접 원인은 확인되지 않았다.

### 요청 누락 가능성

세 광고 컴포넌트는 슬롯이 viewport 300px 이내로 들어와야 `adsbygoogle.push({})`를 시도한다. 스크립트가 준비되지 않으면 200ms 간격 최대 25회만 재시도한다. `lazyOnload`가 느린 네트워크·긴 main-thread 작업·광고 차단으로 지연되면 다음 상태가 가능하다.

1. 슬롯 컨테이너는 화면에 보인다.
2. 약 5초 동안 `window.adsbygoogle`이 준비되지 않는다.
3. 재시도가 끝난다.
4. 나중에 loader가 준비돼도 해당 슬롯은 다시 push되지 않는다.

이 경로는 production network timing으로 재현 검증해야 하지만, 코드상 광고 요청 과소 발생 가능성이 있는 중간 이상 위험이다.

## 7. `result_ad_view` 정확성

현재 이벤트 조건은 `ResultAdSlot` wrapper가 viewport에 50% 이상 들어오는 것이다.

이 이벤트는 다음을 확인하지 않는다.

- AdSense loader 성공
- `adsbygoogle.push` 실행 성공
- `data-adsbygoogle-status` 완료
- 광고 fill/unfilled
- iframe 생성
- AdSense viewable impression 또는 수익

따라서 가장 큰 위험은 과다 집계다. 빈 160px wrapper만 보아도 이벤트가 발생한다. 반대로 같은 컴포넌트 마운트에서는 `trackedRef`로 1회만 보내므로 재계산·재노출을 세지 않아 세션 내 반복 노출 관점에서는 과소 집계될 수 있다.

또한 post detail의 `AdResponsive`와 `AdInArticle`에는 대응 이벤트가 없어, 네이버 유입 증가와 실제 블로그 광고 슬롯 도달을 직접 연결할 수 없다.

## 8. `ads.txt`

- `public/ads.txt`: 존재
- 내용: `google.com, pub-1869932115288976, DIRECT, f08c47fec0942fa0`
- publisher ID: 코드의 `ca-pub-1869932115288976`와 일치
- `web.js`: `public` 디렉터리를 root에서 `express.static`으로 서빙하므로 `/ads.txt` 경로가 연결된다.

production `https://www.finmaphub.com/ads.txt` 직접 fetch는 이번 실행 환경의 URL 안전 제한으로 응답 본문과 HTTP status를 확보하지 못했다. 로컬 파일과 production server route는 PASS지만 live 접근성은 미확인으로 남긴다. AdSense 콘솔의 ads.txt 상태 또는 브라우저/curl로 별도 확인이 필요하다.

## 9. 6월 이력 영향

Git 이력과 기존 보고서에 따르면 수익화 P0 배포 기준일은 2026-06-04다. 그 직전 `_app.js`에는 DSR/LTV와 복리 경로가 allowlist에 없었다. 2026-06-04 핫픽스에서 두 경로가 추가됐다.

즉 6월 초 또는 실제 배포 전까지 두 계산기의 결과 컨테이너와 GA4 `result_ad_view`는 존재해도 광고 loader가 없어 요청과 fill이 실패할 수 있었다. 현재 build에는 수정이 반영돼 있다. 이 이력은 6월 일부 손실을 설명하지만 월 전체의 낮은 수익을 단독으로 설명하려면 배포일·캐시·AdSense 요청 추이를 함께 봐야 한다.

## 10. 원인 우선순위

| 우선순위 | 후보 원인 | 코드 근거 | 판정 |
| --- | --- | --- | --- |
| P0 | 실제 광고 요청 수 자체가 적음 | 복리는 계산 전 0개, DSR/본문 슬롯은 하단, allowlist 외 경로 무광고 | 가능성 높음 |
| P0 | GA4 `result_ad_view`를 실제 광고 노출로 오해 | wrapper 50%만 측정, fill 확인 없음 | 확정된 측정 불일치 |
| P1 | `lazyOnload`와 약 5초 retry 종료의 race | loader 준비 후 재호출 장치 없음 | 가능성 중간 이상 |
| P1 | 6월 초 계산기 loader 누락 | 2026-06-04 이전 `_app.js`와 핫픽스 보고서 | 일부 기간 확정 |
| P1 | 트래픽 증가 경로가 비수익 경로 | script allowlist 방식 | GA4 경로별 확인 필요 |
| P2 | CSS로 슬롯이 숨거나 높이 0 | 직접 해당 규칙 없음, min-height 존재 | 가능성 낮음 |
| 외부 | 낮은 match rate, Active View, CTR, CPC, 정책/제한, ad blocker | 코드만으로 판정 불가 | AdSense 데이터 필요 |

## 11. 수정 제안

이번 작업에서는 적용하지 않았다.

1. monetized URL별로 GA4 sessions와 AdSense page views/ad requests/impressions를 같은 날짜·경로 기준으로 결합한다.
2. `result_ad_view`를 의미가 분명한 `result_ad_container_view`로 전환하거나, 기존 이벤트는 유지하되 loader/push 상태 이벤트를 별도로 추가한다.
3. AdSense loader의 `onLoad`/`onError`, 슬롯 push attempt/success/timeout을 개발·운영 진단 로그로 구분한다. fill 이벤트로 오인하지 않는다.
4. monetized route에서 `afterInteractive`와 `lazyOnload`의 ad request rate·LCP·CLS를 A/B 또는 제한 배포로 비교한다.
5. 현재 5초 retry 종료 뒤 loader가 준비되면 대기 슬롯을 한 번 재시도하도록 공통 로더 상태를 연결한다.
6. 복리 계산기의 `page_view -> tool_calculate -> result_ad_container_view` 퍼널을 먼저 확인한다. 완료율이 낮으면 광고 위치보다 계산 입력 UX와 유입 의도 적합성이 우선이다.
7. DSR/LTV의 첫 result 광고 도달률을 확인하고, 낮을 때만 결과 요약과 CTA 흐름을 해치지 않는 범위에서 위치 실험을 설계한다.
8. post detail에는 top/body/bottom slot viewport 이벤트를 추가해 네이버 유입의 실제 슬롯 도달률을 측정한다.
9. allowlist 밖 상위 유입 경로를 GA4로 확인한다. 슬롯도 없는 페이지에 loader만 전역 추가하지 말고, 수익화 대상 경로를 데이터로 선정한다.
10. AdSense 콘솔에서 ads.txt `Authorized`, site approval, policy center, 제한된 광고 게재 여부를 확인한다.

## 12. 검증 결과

### Build

- `npm.cmd run build`: PASS
- Next.js compile: PASS
- 정적 페이지: 214/214 생성
- main sitemap URL: 204
- `sitemap-ko.xml`: 106
- `sitemap-en.xml`: 98
- `public/en/sitemap.xml`: 98
- postbuild로 순서가 바뀐 sitemap 3개는 작업 범위 밖이므로 기존 tracked 상태로 복원

### Production 및 build 산출물

- production 공개 응답 확인: `how-much-per-month-for-100m`, `compound-interest`, `dsr-ltv-calculator`
- `monthly-dca-10-year-result`: 웹 검사기의 cache miss로 live 응답 판정 미확보, 214-page build와 해당 KO/EN 정적 파일 생성은 확인
- production `ads.txt`: 웹 검사기 안전 제한으로 live HTTP 판정 미확보
- local production server: 백그라운드 프로세스 실행 승인이 환경 사용 한도로 거절되어 runtime DOM/network 검증 미실행
- production client chunk: 대상 4개 route 조건, publisher ID, loader, `lazyOnload` 포함 PASS
- build HTML placeholder: post 각 4개, compound 초기 0개, DSR/LTV 2개 PASS

## 13. 최종 판정

**코드 배선 PASS, 수익 진단은 ACTION REQUIRED**

현재 대상 post와 calculator의 publisher ID·slot ID·route allowlist는 연결돼 있다. 그러나 광고 요청 성공과 fill을 측정하는 운영 신호가 없고, 결과형 계산기의 도달 조건과 lazy loader retry 구조가 광고 요청을 줄일 수 있다. 우선 AdSense 페이지별 request/match/viewability 데이터와 GA4 계산 완료·컨테이너 도달 퍼널을 대조해야 한다. 이 비교 없이 광고 개수를 늘리는 것은 원인 해결보다 UX와 정책 위험을 키울 수 있다.
