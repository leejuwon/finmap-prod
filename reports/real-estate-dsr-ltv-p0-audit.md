# Real Estate DSR/LTV P0 Funnel Audit

테스트 일자: 2026-07-15

최종 판정: PASS - 부동산 구매 퍼널 P0 LTV/DSR + 집값 순위 활성화 완료

## 작업 목표

네이버 서치어드바이저에서 반응이 확인된 `ltv dsr 계산기`, `아파트 구매 계산기`, `주담대 원리금 계산기`, 서울/마곡/강남 집값 순위 키워드를 기준으로 다음 퍼널을 보강했다.

- 부동산 TOP100 페이지 -> LTV/DSR 계산기
- 부동산/DSR 포스팅 -> LTV/DSR 계산기 및 아파트 구매 계산기
- DSR/LTV 계산기 -> 부동산 대시보드 및 아파트 구매 계산기
- 신규 아파트 구매 계산기 -> DSR/LTV 계산기 및 지역 집값 순위

## 변경 파일

- `_components/DsrLtvCalculator.js`
- `_components/RealEstateTop100Landing.js`
- `pages/tools/dsr-ltv-calculator.js`
- `pages/tools/home-buying-budget-calculator.js`
- `pages/posts/[category]/[slug].js`
- `utils/analytics.js`
- `next-sitemap.config.js`
- `scripts/generate_channel_sitemaps.js`
- `scripts/verify_seo_channel_split.js`
- `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md`
- `content/posts/personalFinance/ko/apartment-buying-costs-before-purchase.md`
- `content/posts/personalFinance/ko/cash-100m-200m-300m-apartment-budget.md`
- `public/sitemap-0.xml`
- `public/sitemap-ko.xml`
- `public/sitemap-en.xml`
- `public/en/sitemap.xml`
- `reports/real-estate-dsr-ltv-p0-audit.md`

## DSR/LTV 계산기 SEO/UX 변경

변경 전 핵심 title:

```text
DSR·LTV 계산기 | 주담대 원리금·아파트 담보대출 가능액 계산
```

변경 후 title:

```text
LTV DSR 계산기 - 주택담보대출 한도와 아파트 구매 가능액 계산
```

변경 전 H1:

```text
DSR·LTV 계산기: 주담대 원리금과 아파트 담보대출 가능액 계산
```

변경 후 H1:

```text
LTV DSR 계산기: 주담대 한도와 아파트 구매 가능액 계산
```

변경 후 description:

```text
연소득, 기존대출 월상환액, 주택담보대출 금리, 대출기간, 아파트 가격, 보유 현금을 입력해 LTV·DSR 기준 주담대 한도, 대출 가능액, 원리금 월상환액, 아파트 구매 가능액을 계산합니다.
```

상단 lead에는 `주담대 한도`, `아파트 구매 가능액`, `월상환액`, `보유 현금`을 명시했다. 입력 카드는 기존 위치를 유지하고, 신규 프리셋 영역을 기존 A-D 검증 프리셋 위에 추가했다.

## 추가 프리셋

`_components/DsrLtvCalculator.js`에 네이버 P0 유입용 빠른 프리셋을 추가했다.

| Preset key | Label | Purpose |
| --- | --- | --- |
| `income_40m_home_500m` | 연봉 4천 / 집값 5억 | 중저가 매수 가능성 확인 |
| `income_50m_home_700m` | 연봉 5천 / 집값 7억 | 7억 후보 주택 확인 |
| `income_70m_home_1000m` | 연봉 7천 / 집값 10억 | 서울 대표 가격대 확인 |
| `first_home_600m` | 생애최초 6억 | 생애최초/구매 계산기 기본 진입 |
| `magok_800m` | 마곡 8억 | 마곡 집값 순위 CTA 진입 |
| `gangnam_1500m` | 강남 15억 | 강남권 고가 후보 확인 |

기존 A-D 검증 프리셋과 계산 코어는 유지했다.

## 신규 페이지

신규 URL:

```text
/tools/home-buying-budget-calculator
/en/tools/home-buying-budget-calculator
```

표시명:

```text
아파트 구매 계산기
```

구현 방식:

- 기존 `DsrLtvCalculator` 컴포넌트와 `lib/calculators/dsrLtv.js` 계산 코어 재사용
- 기본 프리셋은 `first_home_600m`
- `home_buying_calculate` 이벤트로 계산 이벤트 분리
- WebApplication JSON-LD 및 BreadcrumbList 유지
- 결과 하단에서 `/tools/dsr-ltv-calculator`, 서울/마곡/강남3구 집값 순위로 연결

## TOP100 CTA

다음 페이지에 지역별 CTA를 추가했다.

| Page | CTA link | Event region |
| --- | --- | --- |
| `/market/real-estate/seoul-top100` | `/tools/dsr-ltv-calculator?region=seoul` | `seoul` |
| `/market/real-estate/magok-top100` | `/tools/dsr-ltv-calculator?region=magok` | `magok` |
| `/market/real-estate/songpa-top100` | `/tools/dsr-ltv-calculator?region=songpa` | `songpa` |
| `/market/real-estate/gangnam3-top100` | `/tools/dsr-ltv-calculator?region=gangnam3` | `gangnam3` |

CTA 문구:

```text
이 지역 아파트, 내 연봉으로 살 수 있을까?
지역 대표 가격 기준으로 LTV·DSR·월상환액을 계산해보세요.
내 구매 가능액 계산하기
```

## 포스팅 CTA

상단 25% 지점에 `내 조건으로 바로 계산해보기` CTA 박스를 추가했다.

- `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md`
- `content/posts/personalFinance/ko/apartment-buying-costs-before-purchase.md`
- `content/posts/personalFinance/ko/cash-100m-200m-300m-apartment-budget.md`

링크:

- `/tools/dsr-ltv-calculator`
- `/tools/home-buying-budget-calculator`

`pages/posts/[category]/[slug].js`에서 HTML anchor의 `data-ga-event`를 읽어 `post_to_dsr_ltv_click`을 발송하도록 보강했다.

## 추가 이벤트

| Event | Location | Params |
| --- | --- | --- |
| `dsr_ltv_preset_click` | DSR/LTV quick preset click | `preset_name`, `preset_group`, `source_tool=dsrLtv`, `locale` |
| `home_buying_calculate` | 신규 아파트 구매 계산기 계산 | `source_tool=homeBuying`, `locale`, `interaction`, `has_result` |
| `real_estate_to_dsr_click` | TOP100 CTA click | `region`, `source_page`, `source_tool=realEstateDashboard` |
| `dsr_to_real_estate_click` | DSR/LTV result dashboard CTA | `source_tool`, `locale`, `location` |
| `post_to_dsr_ltv_click` | 포스팅 상단 CTA click | `source_post`, `cta_position=upper`, `source_tool=blogPost` |

기존 이벤트 보존:

- `dsr_ltv_calculate`
- `tool_calculate`
- `tool_result_cta_view`
- `tool_result_cta_click`
- `related_calculator_click`

## result_ad_view 점검

`_components/ResultAdSlot.js`는 광고 slot이 있고 컨테이너가 viewport에서 50% 이상 교차될 때 `result_ad_view`를 1회 발송한다.

- `trackedRef`로 동일 slot 중복 발송 방지
- `IntersectionObserver` 기준이므로 실제 creative fill 여부와는 독립
- 광고 iframe이 미노출/미충전이어도 컨테이너가 보이면 view로 잡힐 수 있음
- 반대로 `IntersectionObserver` 미지원 환경에서는 이벤트가 발송되지 않음

이번 변경에서는 광고 slot 구조와 AdSense 정책을 수정하지 않았다.

## SEO/구조화 데이터

- `/tools/dsr-ltv-calculator`: 기존 WebApplication, FAQPage, BreadcrumbList 구조 유지
- `/tools/home-buying-budget-calculator`: WebApplication, BreadcrumbList 추가
- canonical self 유지
- hreflang KO/EN 유지
- robots/noindex 추가 없음
- sitemap에 신규 KO/EN 계산기 URL 포함

## sitemap 결과

신규 계산기 KO/EN URL 추가 후 최종 sitemap count:

| Sitemap | Count |
| --- | ---: |
| `public/sitemap-0.xml` | 207 |
| `public/sitemap-ko.xml` | 108 |
| `public/sitemap-en.xml` | 99 |
| `public/en/sitemap.xml` | 99 |

신규 URL 포함 확인:

- `https://www.finmaphub.com/tools/home-buying-budget-calculator`
- `https://www.finmaphub.com/en/tools/home-buying-budget-calculator`
- `sitemap-en.xml` required static URL membership: 17/17

## 검증 결과

| Command | Result | Notes |
| --- | --- | --- |
| `node --check _components\DsrLtvCalculator.js` | PASS | syntax |
| `node --check _components\RealEstateTop100Landing.js` | PASS | syntax |
| `node --check pages\tools\dsr-ltv-calculator.js` | PASS | syntax |
| `node --check pages\tools\home-buying-budget-calculator.js` | PASS | syntax |
| `node --check scripts\generate_channel_sitemaps.js` | PASS | syntax |
| `node --check scripts\verify_seo_channel_split.js` | PASS | syntax |
| `node scripts\verify_dsr_ltv_naver_keyword_alignment.js` | PASS | title/description/H1/canonical/noindex/sitemap/events |
| `node scripts\verify_dsr_ltv_calculator.js` | PASS | A-D 계산 샘플 보존 |
| `node scripts\verify_tool_result_cta_events.js` | PASS | DSR/LTV CTA/event 보존 |
| `npm.cmd run build` | PASS | 218/218 pages |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS | main 207 / KO 108 / EN 99 / required EN 17/17 |
| `node scripts\verify_post_publish_urls.js --local-server ...` | PASS | 지정 6개 URL 200/canonical/sitemap/noindex |

추가 참고:

- `node scripts\verify_naver_calculator_seo.js`는 `/tools/dsr-ltv-calculator`와 `/tools/fire-calculator`는 PASS했다.
- 같은 스크립트에서 `/tools/compound-interest` description 목표 키워드 1건이 FAIL로 남아 exit 1이 발생했다. 이번 부동산 P0 범위 밖이며, 복리 계산기 SEO description 기준과 스크립트 기대값 정합성 점검이 별도 후속 후보다.

## URL readiness

| URL | Result |
| --- | --- |
| `/tools/dsr-ltv-calculator` | PASS |
| `/tools/home-buying-budget-calculator` | PASS |
| `/market/real-estate/seoul-top100` | PASS |
| `/market/real-estate/magok-top100` | PASS |
| `/market/real-estate/songpa-top100` | PASS |
| `/market/real-estate/gangnam3-top100` | PASS |

## 발견 이슈

- 실제 브라우저 스크린샷 기반 모바일 시각 검증은 수행하지 않았다. 코드 구조상 입력 카드는 상단 설명/공유 패널 직후 유지되고, 프리셋 버튼은 flex-wrap 처리되어 있지만 production 배포 후 320px/390px 수동 확인을 권장한다.
- `result_ad_view`는 광고 컨테이너 노출 기준 이벤트라 실제 광고 creative fill과 완전히 동일하지 않다.
- `verify_naver_calculator_seo.js`의 복리 계산기 description 기대값 불일치는 이번 작업 범위 밖 잔여 이슈다.

## 후속 P1 제안

1. `/tools/home-buying-budget-calculator` 전용 FAQ와 FAQPage JSON-LD를 추가해 `아파트 구매 계산기`, `주담대 원리금 계산기` 롱테일을 더 직접적으로 받는다.
2. `마곡 집값`, `강남 집값 순위`는 데이터 품질과 업데이트 주기를 명시한 지역별 브릿지 콘텐츠 또는 랜딩을 별도로 만든다.
3. TOP100 CTA 클릭 후 `region` preset이 실제 사용자 조건에 맞게 충분히 보수적인지 production 이벤트와 이탈률로 확인한다.
4. `result_ad_view`와 실제 AdSense fill/revenue의 괴리를 줄이려면 광고 slot render, viewport view, filled 여부를 분리해서 측정하는 방안을 검토한다.
