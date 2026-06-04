# Finmap 수익화 P0/P1 적용 후 2주 측정 리포트 템플릿

- 작성일: 2026-06-04
- 목적: 최근 적용한 계산기 result-only 광고, 내부 CTA, 부동산 가격대 딥링크, 검색 CTR 개선 효과를 2주 단위로 비교한다.
- 변경 범위: 측정 계획 문서만 작성. 코드와 광고 위치는 변경하지 않는다.

## 1. 측정 기간과 비교 원칙

### 기간 입력

| 항목 | 입력값 |
| --- | --- |
| 운영 배포일 `T0` | `YYYY-MM-DD` |
| 기준 기간 | `T0-14일 ~ T0-1일` |
| 적용 후 기간 | `T0+1일 ~ T0+14일` |
| 데이터 추출일 | `YYYY-MM-DD` |
| 기준 timezone | KST |
| 배포 중 장애/캠페인/대형 이슈 |  |

배포 당일은 캐시, 부분 배포, 내부 테스트 트래픽이 섞일 수 있어 비교에서 제외한다. 예를 들어 2026-06-04에 운영 배포했다면 기준 기간은 `2026-05-21 ~ 2026-06-03`, 적용 후 기간은 `2026-06-05 ~ 2026-06-18`이다.

비교 시 다음 조건을 유지한다.

- 14일 대 14일로 같은 요일 수를 맞춘다.
- KO와 EN은 먼저 분리해서 보고, 이후 합산한다.
- 모바일과 데스크톱을 분리해 UX 악화를 확인한다.
- GSC와 네이버 데이터 지연을 고려해 적용 후 기간 종료 2~3일 뒤 최종 판정한다.
- 세션, 광고 요청, GSC 노출이 적은 페이지는 방향성만 기록하고 다음 2주까지 관찰한다.
- 사이트 전체 트래픽 변화와 페이지 변경 효과를 구분하기 위해 FIRE 계산기를 참고군으로 함께 본다.

### 권장 데이터 품질 표시

| 상태 | 기준 | 해석 |
| --- | --- | --- |
| 충분 | 페이지 세션, 광고 요청, 검색 노출이 비교 가능한 수준 | 2주 판정 가능 |
| 제한적 | 주요 지표 중 하나가 `100` 미만 | 방향성만 판단 |
| 부족 | 대부분 지표가 `30` 미만 | 결론 보류, 다음 2주 누적 |

위 숫자는 통계적 유의성을 보장하는 기준이 아니라 성급한 결론을 피하기 위한 운영 기준이다.

## 2. 측정 대상 URL 그룹

모든 URL은 `https://www.finmaphub.com` 기준 canonical URL로 집계한다. GA4에서는 KO/EN을 분리하고, AdSense와 GSC에서도 가능하면 동일하게 분리한다.

| 그룹 | KO URL | EN URL | 이번 측정의 핵심 |
| --- | --- | --- | --- |
| DSR/LTV 계산기 | `/tools/dsr-ltv-calculator` | `/en/tools/dsr-ltv-calculator` | 계산 사용, 결과 광고, 대시보드 전환 |
| 복리 계산기 | `/tools/compound-interest` | `/en/tools/compound-interest` | 계산 완료 후 결과 광고 도달 |
| 목표자산 계산기 | `/tools/goal-simulator` | `/en/tools/goal-simulator` | 1억 모으기 글 유입, 결과 광고, 관련 도구 이동 |
| DCA 계산기 | `/tools/dca-calculator` | `/en/tools/dca-calculator` | 계산 완료 후 결과 광고, 관련 도구 이동 |
| CAGR 계산기 | `/tools/cagr-calculator` | `/en/tools/cagr-calculator` | 계산 완료 후 결과 광고, 관련 도구 이동 |
| FIRE 계산기 | `/tools/fire-calculator` | `/en/tools/fire-calculator` | 기존 계산·광고 구조 참고군 |
| 부동산 대시보드 | `/market/real-estate` | `/en/market/real-estate` | 검색 실행, 광고, DSR/LTV 전환, 가격 딥링크 유입 |
| 1억 모으기 글 | `/posts/personalFinance/how-much-per-month-for-100m` | `/en/posts/personalFinance/how-much-per-month-for-100m` | 검색 CTR, 목표자산 계산기 유입 |
| DSR 40% 한도표 글 | `/posts/personalFinance/dsr-40-income-loan-limit-table` | `/en/posts/personalFinance/dsr-40-income-loan-limit-table` | DSR 계산기·가격 딥링크 전환 |
| 보유현금별 아파트 예산 글 | `/posts/personalFinance/cash-100m-200m-300m-apartment-budget` | `/en/posts/personalFinance/cash-100m-200m-300m-apartment-budget` | 구간별 가격 딥링크·DSR 계산기 전환 |

가격대 query parameter가 붙은 대시보드 URL은 GA4의 `page_location`으로 별도 확인하되, GSC와 canonical 기준 집계에서는 `/market/real-estate` 기본 URL에 합친다.

## 3. 한눈에 보는 2주 점수표

아래 표를 기준 기간과 적용 후 기간의 원본 데이터로 채운다. 비율 변화는 상대 변화율과 퍼센트포인트 변화를 혼동하지 않도록 함께 기록한다.

| URL 그룹 | 세션 변화 | 참여율 변화 | 계산 완료율 변화 | 결과 광고 도달률 | 예상 수익 변화 | Page RPM 변화 | CTA 클릭률 | GSC 클릭/CTR 변화 | 판정 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| DSR/LTV 계산기 |  |  |  |  |  |  |  |  |  |
| 복리 계산기 |  |  |  |  |  |  |  |  |  |
| 목표자산 계산기 |  |  |  |  |  |  |  |  |  |
| DCA 계산기 |  |  |  |  |  |  |  |  |  |
| CAGR 계산기 |  |  |  |  |  |  |  |  |  |
| FIRE 계산기 |  |  |  | 해당 없음 |  |  |  |  | 참고군 |
| 부동산 대시보드 |  |  | 검색 실행률 | 해당 없음 |  |  |  |  |  |
| 1억 모으기 글 |  |  | 해당 없음 | 해당 없음 |  |  | 경로 탐색 |  |  |
| DSR 40% 한도표 글 |  |  | 해당 없음 | 해당 없음 |  |  | 경로 탐색 |  |  |
| 보유현금별 아파트 예산 글 |  |  | 해당 없음 | 해당 없음 |  |  | 경로 탐색 |  |  |

## 4. GA4 측정 계획

### 사전 확인

GA4 이벤트 파라미터는 DebugView에서 보여도 표준 보고서나 탐색 보고서에서 바로 차원으로 쓸 수 없을 수 있다. 아래 파라미터가 이벤트 범위 맞춤 측정기준으로 등록되어 있는지 먼저 확인한다. 맞춤 측정기준은 일반적으로 과거 데이터에 소급 적용되지 않으므로 2주 측정 시작 전에 확인하는 것이 중요하다.

- `source_tool`
- `position`
- `locale`
- `location`
- `interaction`
- `target_tool`
- `source_page`
- `source_path`
- `result_count`

`trackGaEvent`를 거친 이벤트에는 `page_group`과 `source_path`가 자동 추가된다. 일부 페이지의 직접 `gtag` 호출은 공통 파라미터가 다를 수 있으므로 `source_tool`, `target_tool`, `location`, `locale`을 공통 집계 키로 우선 사용한다.

### 이벤트 목록

| 이벤트 | 대상 | 필수 분해 기준 | 해석 주의 |
| --- | --- | --- | --- |
| `tool_calculate` | 복리, 목표자산, DCA, CAGR, FIRE | `source_tool`, `locale`, `location=form_submit` | raw event count와 계산 사용자 수를 함께 본다. |
| `result_ad_view` | DSR/LTV, 복리, 목표자산, DCA, CAGR | `source_tool`, `position`, `locale` | 실제 AdSense fill이 아니라 슬롯 컨테이너 50% viewport 진입이다. |
| `dsr_ltv_calculate` | DSR/LTV | `interaction`, `locale`, `has_result` | 600ms 디바운스 입력 이벤트라 한 사용자가 여러 번 발생시킬 수 있다. |
| `dsr_to_dashboard_click` | DSR/LTV | `location`, `locale` | `result_header`, `result_dashboard_cta`, `related_section`을 분리한다. |
| `dashboard_to_dsr_click` | 부동산 대시보드 | `result_count`, `location=result_bottom`, `locale` | 검색 결과가 있는 상태에서만 CTA가 노출된다. |
| `tool_hub_click` | 계산기 관련 도구 CTA | `source_tool`, `target_tool`, `location`, `locale` | 결과 CTA와 결과 전 도구 허브를 `location`으로 분리한다. |

보조 확인 이벤트:

- `real_estate_search`: 대시보드 검색 실행 및 `result_count`
- `dashboard_ad_slot_render`: 대시보드 광고 슬롯 마운트. `result_ad_view`와 의미가 다름
- `page_view`, `session_start`, `user_engagement`: 페이지 품질과 이탈 확인

### 핵심 계산식

| 지표 | 계산식 |
| --- | --- |
| 계산 완료율 | `tool_calculate 발생 사용자 수 / 해당 계산기 세션 수` |
| DSR 사용률 | `dsr_ltv_calculate 발생 사용자 수 / DSR 계산기 세션 수` |
| 결과 광고 도달률 | `result_ad_view 발생 사용자 수 / 계산 이벤트 발생 사용자 수` |
| 슬롯별 도달률 | `해당 position result_ad_view 사용자 수 / 계산 이벤트 발생 사용자 수` |
| DSR → 대시보드 CTA 클릭률 | `dsr_to_dashboard_click 사용자 수 / dsr_ltv_calculate 사용자 수` |
| 대시보드 → DSR CTA 클릭률 | `dashboard_to_dsr_click 사용자 수 / result_count > 0인 real_estate_search 사용자 수` |
| 관련 계산기 클릭률 | `tool_hub_click 사용자 수 / 해당 source_tool 계산 사용자 수` |
| 대시보드 검색 실행률 | `real_estate_search 사용자 수 / 대시보드 세션 수` |

DSR 계산 완료율에는 raw `dsr_ltv_calculate` 이벤트 수를 사용하지 않는다. 느린 입력과 반복 프리셋 클릭으로 과다 집계될 수 있으므로 이벤트 발생 사용자 수를 사용한다.

### GA4 페이지별 입력 표

| URL 그룹 | 기간 | 세션 | 사용자 | 참여율 | 평균 참여 시간 | 계산/검색 이벤트 사용자 | 완료/검색 실행률 | `result_ad_view` 사용자 | `summary_after` | 두 번째 슬롯 | CTA 사용자 | CTA 클릭률 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
|  | 기준 14일 |  |  |  |  |  |  |  |  |  |  |  |
|  | 적용 후 14일 |  |  |  |  |  |  |  |  |  |  |  |
|  | 변화 |  |  |  |  |  |  |  |  |  |  |  |

### 블로그 CTA와 가격 딥링크 측정 한계

현재 세 대상 글의 본문 링크에는 전용 CTA 클릭 이벤트가 없다. 따라서 정확한 클릭률 대신 GA4 탐색 보고서에서 다음을 보조 지표로 사용한다.

1. 시작 페이지를 대상 글 URL로 제한한다.
2. 다음 페이지가 목표 계산기, DSR/LTV 계산기, 부동산 대시보드인지 확인한다.
3. 대시보드 landing의 `page_location`에 `priceMetric`, `priceMin`, `priceMax`가 포함됐는지 확인한다.
4. 같은 세션 내 이동 사용자 수를 대상 글 세션 수로 나눠 경로 전환율을 기록한다.

이 방식은 새 탭 이동, 세션 단절, 동의 거부 등의 영향을 받으므로 “CTA 클릭률”이 아닌 “관찰 가능한 경로 전환율”로 표기한다.

## 5. AdSense 측정 계획

가능하면 Page URL 차원 또는 이미 설정된 URL 채널을 사용한다. KO/EN을 분리하고 같은 timezone과 기간으로 내보낸다.

### 필수 지표

| 지표 | 의미 | 판단 용도 |
| --- | --- | --- |
| 페이지별 예상 수익 | 해당 URL의 추정 수익 | 수익 기여도 |
| 페이지뷰 RPM | 페이지뷰 1,000회당 예상 수익 | 트래픽 차이를 보정한 수익성 |
| 광고 요청 | 광고를 요청한 횟수 | 스크립트와 슬롯 호출 상태 |
| 일치율 | 광고 요청 중 광고가 매칭된 비율 | fill 상태 진단 |
| 노출 | 실제 집계된 광고 노출 | `result_ad_view`와 비교 |
| 클릭수 | 광고 클릭수 | 수익 구성 확인 |
| CPC | 클릭당 수익 | 광고 수요와 주제 가치 |
| CTR | 클릭률 | 페이지별 광고 반응, 정책상 유도 문구 없이 관찰 |

### AdSense 입력 표

| URL 그룹 | 기간 | 예상 수익 | Page RPM | 광고 요청 | 일치율 | 노출 | 클릭 | CPC | CTR | `result_ad_view` 수 | 노출 / `result_ad_view` |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
|  | 기준 14일 |  |  |  |  |  |  |  |  |  |  |
|  | 적용 후 14일 |  |  |  |  |  |  |  |  |  |  |
|  | 변화 |  |  |  |  |  |  |  |  |  |  |

### `result_ad_view` 대비 AdSense impression 해석

진단 비율은 `AdSense 노출 / GA4 result_ad_view 이벤트 수`로 계산한다.

- `result_ad_view`는 슬롯 컨테이너가 50% 이상 보였다는 뜻이며 실제 광고 fill을 뜻하지 않는다.
- AdSense 페이지별 노출에는 result-only 슬롯 이외 광고가 포함될 수 있다.
- 광고 차단, 동의 상태, GA 차단, 보고서 timezone과 지연 차이로 두 값은 일치하지 않는다.
- 절대 비율을 합격 기준으로 쓰지 말고 페이지 간 차이와 2주 추세를 본다.
- 같은 페이지의 비율이 이전 기간 또는 유사 계산기 대비 `30% 이상` 급락하면 스크립트 로드, 일치율, unfilled 상태를 점검한다.

FIRE 계산기는 기존 광고 구조를 가진 참고군이다. 신규 result-only 광고 페이지의 RPM 상승이 사이트 전체 광고 수요 변화인지, 신규 슬롯 효과인지 구분할 때 함께 비교한다.

## 6. Google Search Console 측정 계획

각 canonical URL을 Page 필터로 정확히 선택한 후 기준 14일과 적용 후 14일을 비교한다.

### 필수 지표

- URL별 impressions
- URL별 clicks
- URL별 CTR
- URL별 average position
- query별 impressions, clicks, CTR, average position 변화
- device별 변화
- 국가 및 KO/EN URL별 변화

### URL별 입력 표

| URL 그룹 | 기간 | impressions | clicks | CTR | average position | 주요 query 수 | 신규 클릭 query | 판정 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
|  | 기준 14일 |  |  |  |  |  |  |  |
|  | 적용 후 14일 |  |  |  |  |  |  |  |
|  | 변화 |  |  |  |  |  |  |  |

### Query별 입력 표

| URL | query | 기준 노출 | 기준 클릭 | 기준 CTR | 기준 순위 | 이후 노출 | 이후 클릭 | 이후 CTR | 이후 순위 | 해석 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
|  |  |  |  |  |  |  |  |  |  |  |

CTR은 평균 순위와 query mix가 바뀌면 함께 움직인다. 평균 순위가 약 `±2` 이내이고 주요 query 구성이 비슷한 경우에 CTR 개선 효과를 우선 판단한다.

특히 다음을 확인한다.

- `how-much-per-month-for-100m`: 기존 클릭 `0`에서 실제 클릭이 발생했는지
- `dsr-40-income-loan-limit-table`: CTA 개선 후에도 검색 노출과 클릭이 유지 또는 증가하는지
- `cash-100m-200m-300m-apartment-budget`: 검색 클릭과 부동산 관련 query가 증가하는지
- 계산기 6개: 검색 노출 증가가 계산 완료 사용자 증가로 이어지는지
- 부동산 대시보드: query parameter URL이 별도 중복 URL로 잡히지 않고 canonical 기본 URL에 집계되는지

## 7. 네이버 서치어드바이저 측정 계획

네이버는 우선 KO canonical URL을 중심으로 확인한다. 서치어드바이저에서 제공되는 상세 지표 범위는 사이트와 보고서 화면에 따라 다를 수 있으므로, 제공되지 않는 값을 추정해 채우지 않는다.

### 수집 및 노출 상태 표

| KO URL 그룹 | 수집 상태 | 마지막 확인일 | robots/index 문제 | 노출 | 클릭 | 확인 가능한 검색어 | 메모 |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| DSR/LTV 계산기 |  |  |  |  |  |  |  |
| 복리 계산기 |  |  |  |  |  |  |  |
| 목표자산 계산기 |  |  |  |  |  |  |  |
| DCA 계산기 |  |  |  |  |  |  |  |
| CAGR 계산기 |  |  |  |  |  |  |  |
| FIRE 계산기 |  |  |  |  |  |  |  |
| 부동산 대시보드 |  |  |  |  |  |  |  |
| 1억 모으기 글 |  |  |  |  |  |  |  |
| DSR 40% 한도표 글 |  |  |  |  |  |  |  |
| 보유현금별 아파트 예산 글 |  |  |  |  |  |  |  |

### 검색어 유입 기록 방식

1. 서치어드바이저에서 URL 또는 검색어별 노출·클릭 데이터가 제공되면 같은 14일 기간으로 export하거나 수동 기록한다.
2. GA4에서 `session source=naver`, `medium=organic` 또는 실제 수집되는 Naver referral 값을 확인하고 landing page별 세션을 기록한다.
3. 검색어가 제공되지 않거나 `(not provided)`이면 추정하지 않고 `확인 불가`로 기록한다.
4. 대상 글별 핵심 query 목록을 유지하고, 서치어드바이저에서 실제 노출된 query만 기준/이후 표에 추가한다.
5. 수집 실패 또는 미수집 URL은 CTR보다 먼저 robots, canonical, sitemap, 최근 수정일 반영 여부를 확인한다.

### 네이버 유입 입력 표

| URL 그룹 | 기간 | Naver organic 세션 | 참여율 | 다음 페이지 이동 | 확인된 노출 | 확인된 클릭 | 주요 검색어 | 수집 상태 변화 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
|  | 기준 14일 |  |  |  |  |  |  |  |
|  | 적용 후 14일 |  |  |  |  |  |  |  |
|  | 변화 |  |  |  |  |  |  |  |

## 8. 2주 후 판단 기준

### 광고 추가 후 이탈이 늘었는가

페이지별로 참여율, 이탈률, 평균 참여 시간, 계산 완료율을 함께 본다.

| 판정 | 기준 |
| --- | --- |
| 유지 | 참여율과 계산 완료율의 상대 하락이 각각 `5% 미만`, RPM 또는 수익 증가 |
| 관찰 | 참여율 또는 계산 완료율이 `5~15%` 상대 하락했지만 수익 증가 |
| 원인 점검 | 참여율 또는 계산 완료율이 `15% 이상` 상대 하락하거나 모바일에서만 급락 |
| 광고 UX 재검토 후보 | 계산 완료율 하락과 이탈 증가가 동시에 발생하고 수익/RPM 개선도 없음 |

사이트 전체 변화인지 확인하기 위해 FIRE 계산기와 변경하지 않은 일반 페이지의 같은 지표를 비교한다.

### 계산 완료율이 떨어졌는가

- `tool_calculate 사용자 / 계산기 세션`을 기본 계산 완료율로 사용한다.
- DSR/LTV는 `dsr_ltv_calculate 사용자 / DSR 세션`을 사용한다.
- raw event count 증감은 반복 계산이나 느린 입력 영향을 받으므로 보조 지표로만 본다.
- 모바일 완료율이 데스크톱보다 더 크게 떨어지면 광고 간격과 레이아웃 이동을 우선 확인한다.

### `result_ad_view` 대비 AdSense impression 비율

- 페이지별 `AdSense 노출 / result_ad_view 이벤트`를 기록한다.
- 비율 자체보다 일치율, 광고 요청, 페이지 RPM과 같은 방향으로 움직이는지 확인한다.
- `result_ad_view`는 증가했지만 광고 요청·노출·RPM이 늘지 않으면 AdSense 로드 또는 fill 상태를 점검한다.
- 광고 노출은 늘었지만 계산 완료율과 참여율이 크게 하락하면 UX 비용이 수익 효과보다 큰지 검토한다.

### CTA 클릭률

| 전환 | 계산식 | 2주 판단 |
| --- | --- | --- |
| DSR → 대시보드 | `dsr_to_dashboard_click 사용자 / dsr_ltv_calculate 사용자` | 위치별 클릭과 가격 딥링크 도착 확인 |
| 대시보드 → DSR | `dashboard_to_dsr_click 사용자 / 결과 있는 검색 사용자` | 검색 결과가 있는 세션에서 전환 확인 |
| 계산기 → 관련 계산기 | `tool_hub_click 사용자 / 계산 사용자` | `target_tool`, `location`별 우선순위 확인 |
| 블로그 → 계산기/대시보드 | 관찰 가능한 다음 페이지 사용자 / 글 세션 | 전용 클릭 이벤트가 없어 참고 지표로 사용 |

CTA 클릭률은 절대 목표치를 미리 강제하기보다 첫 2주를 baseline으로 저장하고 다음 2주에 개선 여부를 판단한다.

### CTR 개선 페이지의 클릭 발생 여부

- `how-much-per-month-for-100m`은 적용 후 GSC에서 클릭이 `1회 이상` 발생했는지를 첫 성공 신호로 기록한다.
- 노출이 `100` 미만이면 CTR 증감은 방향성만 본다.
- 평균 순위가 크게 변했다면 title 효과와 순위 효과를 분리해서 기록한다.
- CTR이 올라도 관련 없는 query 유입이 늘었다면 성공으로 판정하지 않는다.
- 2주 데이터가 부족하면 28일 누적 비교로 최종 판단을 미룬다.

## 9. 최종 판정 템플릿

| 항목 | 결과 | 근거 | 판정 | 다음 조치 |
| --- | --- | --- | --- | --- |
| 계산기 결과 광고 수익 효과 |  | AdSense 수익, RPM, 요청, 노출 | 유지 / 관찰 / 재검토 |  |
| 계산기 UX 보호 |  | 완료율, 참여율, 평균 참여 시간 | 유지 / 관찰 / 재검토 |  |
| 결과 광고 fill 상태 |  | `result_ad_view`, 요청, 일치율, 노출 | 정상 / 점검 |  |
| DSR ↔ 대시보드 전환 |  | 양방향 CTA 사용자와 클릭률 | 개선 / 동일 / 악화 |  |
| 부동산 가격 딥링크 |  | query 포함 landing과 후속 검색 | 유효 / 제한적 / 확인 불가 |  |
| 1억 모으기 CTR |  | GSC 클릭, CTR, 순위, query | 개선 / 동일 / 보류 |  |
| 대출·예산 글 전환 |  | 경로 탐색, 검색 지표 | 개선 / 동일 / 보류 |  |
| 네이버 수집·유입 |  | 수집 상태, organic 세션, 제공 지표 | 정상 / 점검 / 보류 |  |

## 10. 2주 운영 절차

1. 배포 직후 GA4 DebugView에서 이벤트와 필수 파라미터를 KO/EN 각각 확인한다.
2. `T0`와 비교 기간을 기록하고 배포 당일을 제외한다.
3. D+3에 AdSense 광고 요청·일치율·노출이 집계되는지 조기 점검한다.
4. D+7에 GA4 계산 완료율과 결과 광고 도달률을 중간 점검한다. 데이터가 적으면 변경하지 않는다.
5. D+14 종료 후 GA4, AdSense, GSC, 네이버 데이터를 같은 기간으로 추출한다.
6. GSC와 네이버 지연을 고려해 D+16~17에 최종 표를 채운다.
7. UX 하락과 수익 상승을 함께 비교하고 유지, 관찰, 재검토를 결정한다.
8. 데이터가 부족한 페이지는 두 번째 14일 기간까지 누적한 뒤 판단한다.

## 11. 데이터 추출 파일명 권장

- `ga4-revenue-core-baseline-YYYYMMDD-YYYYMMDD.csv`
- `ga4-revenue-core-post-YYYYMMDD-YYYYMMDD.csv`
- `adsense-revenue-core-baseline-YYYYMMDD-YYYYMMDD.csv`
- `adsense-revenue-core-post-YYYYMMDD-YYYYMMDD.csv`
- `gsc-revenue-core-pages-YYYYMMDD-YYYYMMDD.csv`
- `gsc-revenue-core-queries-YYYYMMDD-YYYYMMDD.csv`
- `naver-revenue-core-YYYYMMDD-YYYYMMDD.csv`

원본 export는 수정하지 않고 보관하고, 이 문서의 표에는 계산된 비율과 판정만 기록한다.

## 12. 코드 기준 확인 사항

- `result_ad_view`는 `ResultAdSlot` 컨테이너가 viewport에 50% 이상 진입할 때 컴포넌트 마운트 기준 1회 발생한다.
- DSR/LTV의 `dsr_ltv_calculate`는 600ms 디바운스 방식이라 raw 이벤트가 과다 집계될 수 있다.
- 복리, 목표자산, DCA, CAGR 계산기는 `tool_calculate`와 result-only 광고를 사용한다.
- FIRE 계산기는 `tool_calculate`와 기존 광고 구조를 사용하며 신규 `result_ad_view` 비교 대상은 아니다.
- 부동산 대시보드는 `real_estate_search`, `dashboard_ad_slot_render`, `dashboard_to_dsr_click`을 사용한다.
- 세 대상 블로그 글의 본문 CTA에는 전용 클릭 이벤트가 없어 GA4 경로 탐색으로 보조 측정한다.
- 이번 작업에서는 코드와 광고 위치를 변경하지 않았다.
