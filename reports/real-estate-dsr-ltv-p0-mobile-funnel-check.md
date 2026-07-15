# Real Estate DSR/LTV P0 Mobile Funnel Check

테스트 일자: 2026-07-15

최종 판정: PASS - 부동산 구매 퍼널 P0 모바일/region/이벤트 검증 완료

## 점검 대상

- `/tools/dsr-ltv-calculator`
- `/tools/home-buying-budget-calculator`
- `/market/real-estate/seoul-top100`
- `/market/real-estate/magok-top100`
- `/market/real-estate/songpa-top100`
- `/market/real-estate/gangnam3-top100`
- `/posts/personalFinance/dsr-40-income-loan-limit-table`
- `/posts/personalFinance/apartment-buying-costs-before-purchase`
- `/posts/personalFinance/cash-100m-200m-300m-apartment-budget`

## 수정 파일

이번 후속에서 추가 기능 없이 모바일 사용성 보정만 적용했다.

- `pages/tools/dsr-ltv-calculator.js`
  - 모바일 첫 진입에서 입력 카드가 너무 아래로 밀리지 않도록 DSR/LTV 계산기를 설명 섹션보다 앞으로 이동
- `pages/tools/home-buying-budget-calculator.js`
  - 아파트 구매 계산기 입력 카드를 6가지 체크 섹션보다 앞으로 이동
- `_components/DsrLtvCalculator.js`
  - 프리셋 버튼에 `min-h-[44px]` 적용
- `styles/globals.css`
  - 포스팅 CTA 버튼을 `inline-flex`, `min-height: 44px`, 간격 포함으로 보정
- `reports/real-estate-dsr-ltv-p0-mobile-funnel-check.md`

## 모바일 점검 결과

Chrome headless, local production server 기준으로 320px/390px viewport를 확인했다.

| URL | Viewport | H1/lead | Input card top | Preset overflow | CTA overflow | Min clickable height | Horizontal overflow | Result |
| --- | ---: | --- | ---: | ---: | ---: | ---: | --- | --- |
| `/tools/dsr-ltv-calculator` | 320 | PASS | 513px | 0 | 0 | 44px | no | PASS |
| `/tools/dsr-ltv-calculator` | 390 | PASS | 530px | 0 | 0 | 44px | no | PASS |
| `/tools/home-buying-budget-calculator` | 320 | PASS | 250px | 0 | 0 | 44px | no | PASS |
| `/tools/home-buying-budget-calculator` | 390 | PASS | 286px | 0 | 0 | 44px | no | PASS |
| `/market/real-estate/seoul-top100` | 320/390 | PASS | N/A | 0 | 0 | 44px | no | PASS |
| `/market/real-estate/magok-top100` | 320/390 | PASS | N/A | 0 | 0 | 44px | no | PASS |
| `/market/real-estate/songpa-top100` | 320/390 | PASS | N/A | 0 | 0 | 44px | no | PASS |
| `/market/real-estate/gangnam3-top100` | 320/390 | PASS | N/A | 0 | 0 | 44px | no | PASS |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | 320/390 | PASS | N/A | 0 | 0 | 44px | no | PASS |
| `/posts/personalFinance/apartment-buying-costs-before-purchase` | 320/390 | PASS | N/A | 0 | 0 | 44px | no | PASS |
| `/posts/personalFinance/cash-100m-200m-300m-apartment-budget` | 320/390 | PASS | N/A | 0 | 0 | 44px | no | PASS |

초기 실측에서 `/tools/dsr-ltv-calculator` 입력 카드는 320px 기준 약 1047px 아래에 있었고, 후속 보정 후 513px로 개선됐다. `/tools/home-buying-budget-calculator`는 320px 기준 592px에서 250px로 개선됐다.

## Region Query 검증

`/tools/dsr-ltv-calculator?region=...` 직접 진입 후 입력값 반영을 확인했다.

| URL query | Expected preset | targetHomePrice | annualIncome | Result |
| --- | --- | ---: | ---: | --- |
| `region=seoul` | 연봉 7천 / 집값 10억 | 100000 | 7000 | PASS |
| `region=magok` | 마곡 8억 | 80000 | 7000 | PASS |
| `region=songpa` | 연봉 7천 / 집값 10억 | 100000 | 7000 | PASS |
| `region=gangnam3` | 강남 15억 | 150000 | 12000 | PASS |
| `region=unknown` | 기본값 | 60000 | 7000 | PASS |

알 수 없는 region은 안전하게 기본값으로 처리된다.

## 이벤트 발송 경로

Puppeteer에서 `window.gtag`를 캡처해 실제 클릭/입력 경로의 이벤트를 확인했다.

| Event | Trigger | Params 확인 | Result |
| --- | --- | --- | --- |
| `real_estate_to_dsr_click` | `/market/real-estate/magok-top100` CTA click | `region=magok`, `source_page=/market/real-estate/magok-top100`, `source_tool=realEstateDashboard` | PASS |
| `post_to_dsr_ltv_click` | DSR 글 상단 CTA click | `source_post=dsr-40-income-loan-limit-table`, `cta_position=upper`, `source_tool=blogPost` | PASS |
| `dsr_ltv_preset_click` | `magok_800m` preset click | `preset_name=magok_800m`, `preset_group=naver_p0`, `source_tool=dsrLtv` | PASS |
| `home_buying_calculate` | 아파트 구매 계산기 input change | `source_tool=homeBuying`, `interaction=input_change`, `has_result=true` | PASS |
| `dsr_to_real_estate_click` | DSR/LTV 결과 상단 대시보드 CTA click | `source_tool=dsrLtv`, `location=result_header` | PASS |
| `result_ad_view` | DSR/LTV result ad slot 50% 이상 viewport 진입 | `source_tool=dsr_ltv`, `position=summary_after`, `locale=ko` | PASS |

참고: TOP100 CTA 클릭 후 DSR/LTV 페이지가 열리면서 `tool_result_cta_view`도 발생했다. 이는 destination page의 결과 CTA 노출 이벤트로 확인되며, `real_estate_to_dsr_click`과 별도 이벤트다.

## 신규 계산기 차별성

`/tools/home-buying-budget-calculator` 화면 텍스트에서 다음 표현을 확인했다.

| Expression | Present | Result |
| --- | --- | --- |
| `아파트 구매 가능` | yes | PASS |
| `필요 현금` | yes | PASS |
| `현금` | yes | PASS |
| `월상환액` | yes | PASS |
| `보유 현금` | yes | PASS |
| `집값` | yes | PASS |

상단 H1/lead는 `아파트 구매 계산기`, `보유 현금`, `주담대 한도`, `DSR`, `LTV`, `월상환액`, `안전 탐색 가격대`를 명시한다. 결과 카드는 기존 DSR/LTV core를 재사용하지만 후보 집값, 필요 현금, 현금 부족/여유, 월상환액을 함께 보여주므로 단순 복제보다는 구매 예산 진입 페이지로 구분된다.

## 검증 결과

| Command | Result | Notes |
| --- | --- | --- |
| `node --check _components\DsrLtvCalculator.js` | PASS | syntax |
| `node --check pages\tools\dsr-ltv-calculator.js` | PASS | syntax |
| `node --check pages\tools\home-buying-budget-calculator.js` | PASS | syntax |
| `npm.cmd run build` | PASS | 218/218 pages |
| `node scripts\verify_dsr_ltv_naver_keyword_alignment.js` | PASS | title/description/H1/canonical/noindex/sitemap/events |
| `node scripts\verify_dsr_ltv_calculator.js` | PASS | A-D 계산 샘플 보존 |
| `node scripts\verify_tool_result_cta_events.js` | PASS | CTA/event 보존 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS | main 207 / KO 108 / EN 99 / required EN 17/17 |
| `node scripts\verify_post_publish_urls.js --local-server ...` | PASS | 지정 9개 URL 200/canonical/noindex/sitemap |

## URL Publish 검증

| URL | Result |
| --- | --- |
| `/tools/dsr-ltv-calculator` | PASS |
| `/tools/home-buying-budget-calculator` | PASS |
| `/market/real-estate/seoul-top100` | PASS |
| `/market/real-estate/magok-top100` | PASS |
| `/market/real-estate/songpa-top100` | PASS |
| `/market/real-estate/gangnam3-top100` | PASS |
| `/posts/personalFinance/dsr-40-income-loan-limit-table` | PASS |
| `/posts/personalFinance/apartment-buying-costs-before-purchase` | PASS |
| `/posts/personalFinance/cash-100m-200m-300m-apartment-budget` | PASS |

## 남은 리스크

- `result_ad_view`는 광고 creative fill이 아니라 광고 컨테이너 viewport 진입 기준이다. 실제 AdSense fill/revenue와는 별도 지표로 봐야 한다.
- Headless Chrome 기준 모바일 레이아웃은 PASS지만, 실제 네이버 앱 WebView에서는 폰트 렌더링과 주소창 높이에 따라 체감 첫 화면이 달라질 수 있다.
- `/tools/dsr-ltv-calculator`는 입력 카드가 320px 기준 513px 위치까지 개선됐지만, 공유 패널과 상단 설명 때문에 완전한 first-fold 입력 시작은 아니다. 더 공격적인 P1에서는 공유 패널 위치 조정 또는 compact hero를 검토할 수 있다.

## 최종 판정

PASS - 부동산 구매 퍼널 P0 모바일/region/이벤트 검증 완료
