# FinMap P1-2C-3 AdSense Causality A/B and Post-Hydration Loader Hotfix

작성일: 2026-07-30

## 결론

상태: `LOCAL_PASS_READY_FOR_DEPLOY`

운영 A/B 검증에서 AdSense bootstrap 실행이 주담대 계산기 320px hydration `#418`의 직접 원인으로 확인됐다. 특히 bootstrap만 차단하면 10/10 통과했고, bootstrap은 허용하되 후속 광고 요청만 차단하면 9/10에서 `#418`이 재현됐다. 따라서 광고 요청/fill 자체보다 bootstrap script가 hydration 전후에 DOM을 변경하는 문제가 핵심으로 판단한다.

배포는 수행하지 않았다. 코드 변경은 post-hydration singleton loader 방식으로 최소화했고, 로컬 production server 기준으로 hydration 회귀와 AdSense script singleton 조건을 통과했다.

## Phase A: 운영 A/B 결과

대상: `https://www.finmaphub.com/tools/mortgage-loan-calculator`, viewport `320`, hard load, 각 조건 10회

| 조건 | 실행 | React #418 | Hydration error | Bootstrap loaded | Slot pushed | Ad requests | Pass |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| CONTROL | 10 | 8 | 8 | 10 | 10 | 329 | 2 |
| BLOCK_BOOTSTRAP_ONLY | 10 | 0 | 0 | 10 | 0 | 0 | 10 |
| ALLOW_BOOTSTRAP_BLOCK_AD_REQUESTS | 10 | 9 | 9 | 10 | 10 | 0 | 1 |
| BLOCK_ALL_AD_DOMAINS | 10 | 0 | 0 | 10 | 0 | 0 | 10 |

판정: `ADSENSE_BOOTSTRAP_CAUSALITY_CONFIRMED`

근거 파일:

- `reports/search-growth-p1-2c-3-adsense-causality-ab.json`
- `reports/search-growth-p1-2c-3-adsense-causality-ab.csv`

## Edge/Build 일관성

운영 HTML/asset 불일치 가능성은 낮게 봤다.

- build id: `EH0IyY6JnzVJFzswcpSZ6`
- mixed build id: `false`
- checked snapshots: `6`
- unique HTML hash: `6` (서로 다른 URL 기준)
- Next chunk 404: `0`
- `_buildManifest.js` mismatch: `false`

근거 파일:

- `reports/search-growth-p1-2c-3-edge-build-consistency.json`

## DOM 변이 근거

`MutationObserver` 계열 추적에서 AdSense가 hydration 완료 전후의 `interactive` 상태에서 도구 본문 DOM에 자동 배치 노드를 삽입하는 패턴을 확인했다.

대표 샘플:

- condition: `CONTROL`
- path: `/tools/mortgage-loan-calculator`
- viewport: `320`
- run: `1`
- react418: `1`
- first mutation: `insertBefore`
- readyState: `interactive`
- target: `<main class=tool-page>`
- inserted node: `<div class=google-auto-placed>`
- stack: `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?...`

근거 파일:

- `reports/search-growth-p1-2c-3-dom-mutation-trace.json`

## Phase B: 적용한 최소 변경

변경 방향:

- `_document`에서 executable `adsbygoogle.js` script를 제거했다.
- AdSense account meta는 유지했다.
- React hydration 이후 `useEffect`에서 plain script를 `document.head`에 1회만 동적 삽입하는 singleton loader를 추가했다.
- 광고 슬롯 hook이 mount 시 singleton loader를 보장하도록 연결했다.
- 기존 retry/중복 push 보호는 유지했다.

변경 파일:

- `_components/AdSenseBootstrap.js`
- `_components/useAdSenseSlot.js`
- `pages/_app.js`
- `pages/_document.js`
- `scripts/verify_adsense_bootstrap.js`
- `scripts/verify_adsense_hydration_causality.js`
- `reports/search-growth-p1-2c-3-adsense-causality-and-loader-hotfix.md`

명시적으로 변경하지 않은 범위:

- 계산기 공식, 입력값, 결과 UI
- title/description/H1/canonical/hreflang/robots/sitemap 정책
- 광고 슬롯 개수, 위치, slot id
- AdSense publisher id
- GA4 이벤트 구조
- React/Next/dependency 버전
- `suppressHydrationWarning`, allowlist, client-only 전환

## 변경 전/후 bootstrap 방식

변경 전:

- `_document`의 `<NextScript />` 뒤에 raw `<script defer src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?...">` 삽입
- 운영 A/B에서 AdSense가 `main.tool-page` 안에 `google-auto-placed` 노드를 hydration 전후 시점에 삽입

변경 후:

- SSR HTML에는 executable `adsbygoogle.js` script를 출력하지 않음
- `_app`에서 `<AdSenseBootstrap />` 렌더
- `AdSenseBootstrap`의 `useEffect`에서 hydration 이후 `document.head.appendChild(script)`로 1회 삽입
- 삽입 script marker: `data-finmap-adsense-bootstrap="post-hydration-singleton"`
- `next/script`를 사용하지 않아 `data-nscript`가 붙지 않음

## 로컬 검증 결과

검증 기준: local production server `http://127.0.0.1:8002`

| 명령 | 결과 |
| --- | --- |
| `node --check scripts\verify_adsense_bootstrap.js` | PASS |
| `node --check scripts\verify_adsense_hydration_causality.js` | PASS |
| `node --check _components\AdSenseBootstrap.js` | PASS |
| `node --check _components\useAdSenseSlot.js` | PASS |
| `npm.cmd run build` | PASS |
| `node scripts\verify_adsense_bootstrap.js` | PASS |
| `node scripts\verify_mortgage_loan_calculator.js` | PASS, 22/22 |
| `node scripts\verify_tool_result_cta_events.js` | PASS |
| `node scripts\verify_naver_calculator_seo.js` | PASS |
| `node scripts\verify_mortgage_hydration_regression.js --base-url=http://127.0.0.1:8002 --runs=5 --mode=regression` | PASS, 42/42 |
| `node scripts\verify_search_growth_p1_2c_postdeploy.js --base-url=http://127.0.0.1:8002` | CONDITIONAL_PASS, blockers 0 |
| `node scripts\verify_search_snippet_hygiene.js --base-url=http://127.0.0.1:8002` | PASS |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |

로컬 runtime dynamic script 확인:

- `/tools/mortgage-loan-calculator` at 320: scriptCount `1`, marker `post-hydration-singleton`, `data-nscript` 없음, head 삽입 확인, React `#418` 0
- `/tools/dsr-ltv-calculator` at 320: scriptCount `1`, marker `post-hydration-singleton`, `data-nscript` 없음, head 삽입 확인, React `#418` 0
- `/tools/home-buying-budget-calculator` at 320: scriptCount `1`, marker `post-hydration-singleton`, `data-nscript` 없음, head 삽입 확인, React `#418` 0

## 배포 후 검증 절차

배포 후에는 운영 URL에서 아래를 다시 확인해야 한다.

1. `node scripts\verify_adsense_bootstrap.js --base-url=https://www.finmaphub.com`
2. `node scripts\verify_mortgage_hydration_regression.js --base-url=https://www.finmaphub.com --runs=5 --mode=regression`
3. `node scripts\verify_search_growth_p1_2c_postdeploy.js --base-url=https://www.finmaphub.com`
4. Chrome 시크릿/모바일 UA에서 네이버 검색 유입 hard load 재현
5. Elements에서 `script[data-finmap-adsense-bootstrap="post-hydration-singleton"]` 1개 확인
6. script에 `data-nscript`가 없는지 확인
7. 콘솔에서 React `#418`과 hydration fatal error가 사라졌는지 확인

## 남은 리스크

- 이 변경은 아직 운영에 배포되지 않았다. 현재 운영 A/B 결과는 변경 전 배포본에서 수집한 원인 확인 결과다.
- AdSense 외부 script가 실행 후 자동 배치 DOM을 추가하는 동작 자체는 Google 측 동작이므로, hydration 이후로 늦춰 충돌 가능성을 낮추는 방식이다.
- 실제 광고 fill 여부는 AdSense 심사, 트래픽, 기기, 위치, 쿠키, 정책 상태에 따라 달라진다. 이번 검증의 성공 기준은 script singleton, `data-nscript` 제거, hydration 안정성이다.
- 일부 URL에서 광고 네트워크 관련 일반 console error는 관찰될 수 있으나, 로컬 검증에서는 React `#418`/hydration fatal error로 분류되지 않았다.
