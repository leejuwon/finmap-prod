# Finmap AdSense 첫 진입 광고 미노출 점검 및 안정화 보고서

생성일: 2026-07-24

## 1. Executive Summary

네이버 검색 결과에서 계산기 페이지로 첫 진입했을 때 광고가 보이지 않다가, 다른 계산기로 이동한 뒤 `AdSense head tag doesn't support data-nscript attribute.` 경고가 나오고 이후 광고가 정상 노출되는 증상을 점검했다.

핵심 원인은 AdSense bootstrap script가 `pages/_app.js`에서 `next/script`의 `lazyOnload`와 제한된 pathname 조건으로 로드되고 있었던 점이다. 특히 `/tools/home-buying-budget-calculator`와 `/tools/mortgage-loan-calculator`는 기존 `ADSENSE_PATHS`에 포함되지 않아 첫 진입 시 bootstrap 자체가 빠질 수 있었다. 또한 `next/script`가 AdSense script에 `data-nscript` 속성을 붙일 수 있어 관찰된 경고와도 맞았다.

수정은 광고 개수나 위치를 늘리지 않고, bootstrap 로딩 위치와 slot push 안정화만 변경했다.

최종 판정: PASS

## 2. 원인 가설과 실제 확인

| 가설 | 확인 결과 |
| --- | --- |
| AdSense bootstrap이 조건부/지연 삽입된다 | 확인. `pages/_app.js`에서 특정 pathname일 때만 `next/script` `lazyOnload`로 삽입됨 |
| `next/script`가 `data-nscript` 경고를 만든다 | 구조상 가능. AdSense script가 `next/script`로 로드되고 있었음 |
| 첫 진입 계산기에서 bootstrap이 누락된다 | 확인. home-buying과 mortgage 도구 path가 기존 AdSense path set에 없음 |
| slot push가 script 준비 전 실패 후 회복하지 못할 수 있다 | 부분 확인. 일부 컴포넌트는 retry가 있었지만 구현이 분산되어 있고 `AdSenseUnit`은 route reset이 명확하지 않았음 |
| route 이동 후 script가 준비되어 이후 광고가 정상화된다 | 현상과 구조가 일치함 |

## 3. 실제 발견 위치

기존 AdSense bootstrap:

- `pages/_app.js`
- `next/script`
- `strategy="lazyOnload"`
- `id="adsbygoogle-loader"`
- `ADSENSE_PATHS` 조건부 로딩

광고 slot push 후보:

- `_components/AdSenseUnit.js`
- `_components/AdInArticle.js`
- `_components/AdResponsive.js`
- `_components/ResultAdSlot.js`
- `_components/DashboardAdSlot.js`

## 4. 변경 파일

- `pages/_app.js`
- `pages/_document.js`
- `_components/AdSenseUnit.js`
- `_components/AdInArticle.js`
- `_components/AdResponsive.js`
- `_components/useAdSenseSlot.js`
- `scripts/verify_adsense_bootstrap.js`
- `reports/adsense-first-entry-ad-load-audit.md`

## 5. AdSense Script 이전/이후

변경 전:

- `_app.js`에서 `next/script`로 client-side 조건부 삽입
- `lazyOnload`라 첫 paint와 hydration 이후로 지연
- 일부 계산기 path가 조건에서 빠져 첫 진입 시 script 미삽입 가능
- Next가 붙이는 `data-nscript` 속성으로 AdSense 경고 가능

변경 후:

- `_document.js`의 `<Head>`에 순수 `<script>` 태그로 1회 삽입
- 모든 페이지의 SSR HTML head에 동일하게 포함
- `next/script`를 사용하지 않아 `data-nscript` 없음
- publisher id `ca-pub-1869932115288976` 유지

삽입 형태:

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1869932115288976"
  crossorigin="anonymous"
></script>
```

## 6. Slot Push 안정화 방식

공통 hook `_components/useAdSenseSlot.js`를 추가했다.

동작:

- slot mount 후 IntersectionObserver로 근접 viewport 진입 확인
- `window.adsbygoogle.push({})` 준비 여부 확인
- 준비 전이면 최대 5회, 500ms 간격 재시도
- `data-adsbygoogle-status` 또는 `data-fm-ads-pushed`가 있으면 중복 push 방지
- 실패 시 `data-fm-ads-push-failed`로 상태만 남기고 무한 재시도하지 않음
- production console warn spam 제거
- debug는 `?adDebug=1`, `localStorage.finmap_ads_debug=1`, 또는 `window.__FINMAP_ADS_DEBUG__ = true`일 때만 `console.debug`로 확인

적용 컴포넌트:

- `AdSenseUnit`: ResultAdSlot, DashboardAdSlot, apartment detail ad에서 사용
- `AdInArticle`: post in-article ad에서 사용
- `AdResponsive`: post top/bottom responsive ad에서 사용

## 7. result_ad_view 이벤트 검토

`result_ad_view`는 광고 fill 이벤트가 아니라 광고 컨테이너가 viewport에 들어온 것을 의미한다. 이번 작업에서는 GA4 이벤트를 늘리지 않고 기존 의미를 유지했다.

후속으로 실제 AdSense push 상태를 계측하려면 다음 이벤트를 검토할 수 있다.

- `ad_slot_push_attempt`
- `ad_slot_push_success`
- `ad_slot_push_failed`
- `ad_script_ready`

다만 production GA4 이벤트가 과도해질 수 있어 이번 배포에는 추가하지 않았다.

## 8. 검증 URL

대상:

- `/tools/home-buying-budget-calculator`
- `/tools/mortgage-loan-calculator`
- `/tools/dsr-ltv-calculator`
- `/tools/compound-interest`
- `/market/real-estate/seoul-top100`
- `/posts/personalFinance/apartment-buying-calculator-guide`

확인 결과:

| URL | Head script | Count | data-nscript | Slot |
| --- | --- | ---: | --- | --- |
| `/tools/home-buying-budget-calculator` | PASS | 1 | 없음 | SSR ins 2 |
| `/tools/mortgage-loan-calculator` | PASS | 1 | 없음 | 기존 광고 slot 없음, 추가하지 않음 |
| `/tools/dsr-ltv-calculator` | PASS | 1 | 없음 | SSR ins 2 |
| `/tools/compound-interest` | PASS | 1 | 없음 | 기존 ResultAdSlot source 확인 |
| `/market/real-estate/seoul-top100` | PASS | 1 | 없음 | 기존 광고 slot 없음, 추가하지 않음 |
| `/posts/personalFinance/apartment-buying-calculator-guide` | PASS | 1 | 없음 | SSR ins 4 |

참고:

- mortgage 계산기와 Top100 landing에는 기존 광고 slot이 없었다.
- 광고 개수 증가 금지 원칙 때문에 새 slot은 추가하지 않았다.

## 9. 검증 결과

| 명령 | 결과 |
| --- | --- |
| `node --check scripts\verify_adsense_bootstrap.js` | PASS |
| `npm.cmd run build` | PASS, 223 static pages |
| `node scripts\verify_adsense_bootstrap.js` | PASS |
| `node scripts\verify_adsense_bootstrap.js --base-url=http://127.0.0.1:8002` | PASS |
| `node scripts\verify_tool_result_cta_events.js` | PASS |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `node scripts\verify_search_snippet_hygiene.js --base-url=http://127.0.0.1:8002` | PASS, hydration 0 |

`verify_search_snippet_hygiene`에서 일부 console error count는 남았지만 hydration error는 0이고 fatal/page failure는 없었다. 이 count는 기존 로컬 API/외부 리소스류 console noise로 보이며 이번 AdSense 변경으로 인한 hydration 회귀는 확인되지 않았다.

## 10. 남은 리스크

- AdSense fill 여부는 Google/AdSense 심사, 트래픽, 사용자 지역, 광고 차단 확장, consent/브라우저 상태, inventory에 따라 달라진다.
- 이번 검증은 script 요청 가능성과 slot push 안정화까지 확인한 것이며, 실제 fill을 보장하지 않는다.
- mortgage 계산기와 Top100 landing은 기존 광고 slot이 없으므로 광고 노출이 없어도 이번 수정 범위의 오류는 아니다.
- `adsbygoogle.js`가 네트워크나 브라우저 확장으로 차단되면 slot push는 제한된 재시도 후 조용히 실패 상태로 남긴다.

## 11. 운영 수동 검증 절차

실제 네이버 유입은 로컬에서 완전히 재현하기 어렵다. 운영 배포 후 다음 절차로 확인한다.

1. Chrome 시크릿 모드를 연다.
2. 모바일 user-agent 또는 실제 휴대폰으로 접속한다.
3. 네이버에서 `아파트 구매 계산기`를 검색한다.
4. Finmap 결과를 클릭해 첫 진입한다.
5. Network 탭에서 `adsbygoogle.js?client=ca-pub-1869932115288976` 요청이 첫 진입부터 발생하는지 확인한다.
6. Elements 탭에서 `<head>` 안의 AdSense script가 1개인지 확인한다.
7. 해당 script에 `data-nscript` 속성이 없는지 확인한다.
8. 광고 slot `<ins class="adsbygoogle">`의 `data-adsbygoogle-status` 또는 `data-fm-ads-pushed` 상태를 확인한다.
9. 콘솔에 `AdSense head tag doesn't support data-nscript attribute.` 경고가 사라졌는지 확인한다.
10. 같은 URL에서 hard reload 3회를 반복해 script 요청이 안정적으로 발생하는지 확인한다.

## 12. 미변경 영역

다음은 변경하지 않았다.

- 광고 위치
- 광고 개수
- 광고 slot id
- AdSense publisher id
- `ads.txt`
- 광고 클릭 유도 문구
- hidden/display:none 광고
- 계산기 로직
- 계산 결과
- 콘텐츠 SEO
- canonical/hreflang/robots 정책
- GA4 이벤트명/파라미터

## 13. 결론

첫 진입 광고 미노출의 가장 가능성 높은 원인은 `_app.js`의 조건부 `next/script` AdSense loader였다. 특히 home-buying/mortgage 계산기가 조건에서 빠져 있었고, `next/script`가 붙이는 `data-nscript` 경고도 관찰 증상과 일치했다.

AdSense bootstrap을 `_document.js`의 순수 script로 이동하고, slot push를 공통 hook으로 안정화하면서 첫 진입부터 SSR head에 script가 1회 포함되도록 수정했다. 로컬 production HTML과 build 산출물 기준 검증은 PASS다.
