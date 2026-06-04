# Finmap AdSense 로드 경로 P0 핫픽스 리포트

- 작업일: 2026-06-04
- 대상: `pages/_app.js`
- 범위: DSR/LTV 계산기와 복리 계산기의 직접 진입 AdSense 스크립트 로드 조건

## 1. 기존 문제

결과 광고 슬롯은 DSR/LTV 계산기와 복리 계산기에 추가되어 있었지만, 전역 AdSense 스크립트를 조건부로 로드하는 `pages/_app.js`의 `ADSENSE_PATHS`에는 두 계산기 경로가 없었다.

이 상태에서는 두 계산기 URL에 직접 진입할 때:

1. 결과 광고 컨테이너는 렌더될 수 있다.
2. `result_ad_view`도 발생할 수 있다.
3. 전역 `window.adsbygoogle` 스크립트가 없어 광고 요청과 fill은 실패할 가능성이 높았다.

## 2. 변경 내용

기존 AdSense 로드 대상은 유지하고 다음 page pathname을 `ADSENSE_PATHS`에 추가했다.

- `/tools/dsr-ltv-calculator`
- `/tools/compound-interest`

유지된 기존 대상:

- `/posts/[category]/[slug]`
- `/tools/fire-calculator`
- `/market/real-estate`
- `/market/real-estate/apt/*`

광고 슬롯, 계산 로직, GA 이벤트는 변경하지 않았다.

## 3. KO/EN 및 query string 대응

로드 조건은 `router.asPath`가 아니라 `router.pathname`을 사용한다.

Next.js Pages Router의 `router.pathname`은 현재 페이지 파일의 route pathname이므로 locale 접두사와 query string의 영향을 받지 않는다. 따라서 아래 URL은 각각 동일한 허용 경로로 판정된다.

| 운영 URL 예시 | 판정되는 `router.pathname` |
| --- | --- |
| `/tools/dsr-ltv-calculator` | `/tools/dsr-ltv-calculator` |
| `/en/tools/dsr-ltv-calculator` | `/tools/dsr-ltv-calculator` |
| `/tools/dsr-ltv-calculator?priceMin=5` | `/tools/dsr-ltv-calculator` |
| `/en/tools/dsr-ltv-calculator?priceMin=5` | `/tools/dsr-ltv-calculator` |
| `/tools/compound-interest` | `/tools/compound-interest` |
| `/en/tools/compound-interest` | `/tools/compound-interest` |
| `/tools/compound-interest?principal=1000` | `/tools/compound-interest` |
| `/en/tools/compound-interest?principal=1000` | `/tools/compound-interest` |

프로젝트의 `next.config.js`는 `ko`, `en` locale과 `ko` 기본 locale을 사용한다.

## 4. 운영 직접 진입 체크리스트

각 URL은 다른 페이지에서 SPA 이동하지 말고 새 시크릿 창 주소창에 직접 입력해 확인한다.

### DSR/LTV 계산기

- [ ] `/tools/dsr-ltv-calculator`
- [ ] `/en/tools/dsr-ltv-calculator`
- [ ] `/tools/dsr-ltv-calculator?priceMin=5`
- [ ] `/en/tools/dsr-ltv-calculator?priceMin=5`

### 복리 계산기

- [ ] `/tools/compound-interest`
- [ ] `/en/tools/compound-interest`
- [ ] `/tools/compound-interest?principal=1000`
- [ ] `/en/tools/compound-interest?principal=1000`

### 브라우저 개발자 도구 확인

- [ ] Network에서 `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js` 요청 확인
- [ ] 요청에 올바른 AdSense client 파라미터가 포함되는지 확인
- [ ] 결과 영역 진입 후 `<ins class="adsbygoogle">` 확인
- [ ] 슬롯에 `data-fm-ads-pushed="1"`이 설정되는지 확인
- [ ] 콘솔에 AdSense 중복 로드 또는 push 오류가 없는지 확인
- [ ] 광고 차단 기능을 끈 환경에서 실제 fill/unfilled 상태 확인
- [ ] AdSense 보고서에서 광고 요청과 노출 집계 확인

`result_ad_view`는 슬롯 viewport 진입 이벤트이며 실제 광고 fill을 보장하지 않는다.

## 5. 검증 결과

| 검증 | 결과 |
| --- | --- |
| DSR/LTV page pathname 허용 목록 | 추가 완료 |
| 복리 계산기 page pathname 허용 목록 | 추가 완료 |
| KO/EN 대응 | `router.pathname` 기반으로 동일 route 판정 |
| query string 대응 | `router.pathname` 기반으로 query와 무관 |
| 기존 AdSense 대상 | 유지 |
| 광고 슬롯 추가 | 없음 |
| 계산 로직 변경 | 없음 |
| GA 이벤트 변경 | 없음 |
| `npm.cmd run build` | PASS, Next.js compile 및 209개 정적 페이지 생성 완료 |
| 빌드된 `_app` 청크 | 두 계산기 pathname, 기존 허용 경로, `adsbygoogle-loader` 조건 포함 확인 |
| KO/EN 계산기 빌드 경로 | 두 계산기 모두 KO/EN 정적 페이지 생성 확인 |
| sitemap 변경 | postbuild의 URL 순서 변경만 복원, 최종 변경 없음 |
| `git diff --check` | PASS |

## 6. 변경 파일

- `pages/_app.js`
- `reports/revenue-p0-post-deploy-checklist.md`
- `reports/adsense-paths-hotfix-report.md`

## 7. 실행 명령과 결과

- `npm.cmd run build`: PASS
- 빌드 산출물 및 `_app` 청크 경로 조건 확인: PASS
- `git diff --check`: PASS

`next/script`의 `lazyOnload` 전략 때문에 AdSense 외부 스크립트 URL이 모든 정적 HTML에 직접 노출되는 방식은 아니다. 빌드된 `_app` 클라이언트 청크에서 현재 `router.pathname`이 허용 목록에 포함될 때 `adsbygoogle-loader`가 렌더되는 조건을 확인했다. 실제 네트워크 요청과 fill은 배포 후 운영 체크리스트로 확인한다.
