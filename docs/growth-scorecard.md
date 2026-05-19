# Finmap Growth Scorecard

Finmap의 성과는 GSC의 검색 노출 지표와 GA4의 행동 이벤트를 함께 봐야 한다. GSC는 어떤 페이지가 검색에서 발견되고 클릭되는지, GA4는 유입 후 사용자가 계산기/관련 글/부동산 데이터로 이동하는지를 확인하는 기준으로 사용한다.

## 1. URL 그룹 정의

| 그룹 | URL 패턴 | 목적 |
| --- | --- | --- |
| home | `/`, `/en` | 전체 사이트 진입, 주요 섹션 분기 |
| tools_index | `/tools`, `/en/tools` | 계산기 허브, 계산기 간 탐색 시작점 |
| tool_detail | `/tools/{tool}`, `/en/tools/{tool}` | 계산 실행, 결과 공유, PDF 저장, 다른 계산기로 이동 |
| blog_category | `/category/{category}`, `/en/category/{category}` | 글 목록 탐색, 카테고리별 내부 링크 허브 |
| blog_detail | `/posts/{category}/{slug}`, `/en/posts/{category}/{slug}` | 검색 유입, 콘텐츠 소비, 관련 도구/글 이동 |
| market | `/market`, `/en/market`, `/market/indices`, `/en/market/indices` | 시장 데이터 진입 |
| real_estate_dashboard | `/market/real-estate`, `/en/market/real-estate` | 부동산 필터 탐색, 단지 상세 이동 |
| real_estate_detail | `/market/real-estate/apt/{aptKey}`, `/en/market/real-estate/apt/{aptKey}` | 단지 상세 정보 소비, 기간/평형 변경 |
| real_estate_landing | `/market/real-estate/*-top100`, `/en/market/real-estate/*-top100` | 지역별 Top100 랜딩, 대시보드/상세 이동 |
| static_info | `/contact`, `/privacy`, `/terms`, `/about`, `/disclaimer` 및 `/en/...` | 신뢰/정책/문의 |

권장 GA4 분석에서는 `page_path` 정규식으로 위 그룹을 나누고, 커스텀 이벤트에는 `page_group` 파라미터를 함께 사용한다.

## 2. 각 그룹의 핵심 지표

| 그룹 | GSC 지표 | GA4 지표 |
| --- | --- | --- |
| tools_index | impressions, CTR, average position | `tool_hub_click`, 계산기 카드 CTR |
| tool_detail | impressions, CTR, average position | 결과 생성률, `tool_result_action`, `tool_nav_click`, `tool_hub_click` |
| blog_category | impressions, CTR, average position | 카테고리 내 글 클릭, `/tools` 이동 |
| blog_detail | impressions, CTR, average position | `blog_engagement`, `tool_hub_click`, 관련 글 이동, 스크롤/체류 시간 |
| real_estate_dashboard | impressions, CTR, average position | 필터 실행, 단지 상세 클릭, Top100 랜딩 클릭 |
| real_estate_detail | 현재 noindex 대상이므로 핵심 GSC scorecard 대상 제외 | 기간/평형 변경, 목록 복귀, 관련 랜딩 이동 |
| market | impressions, CTR | 시장/부동산 섹션 이동 |
| static_info | impressions, CTR | 문의/정책 확인, 신뢰 보조 |

## 3. 현재 수집 중인 GA 이벤트

기존 수집:

| 이벤트 | 위치 | 파라미터 |
| --- | --- | --- |
| `page_view` | `pages/_app.js` | GA4 기본 `page_path`; SPA route change 때 `config` 재호출 |
| `tool_hub_click` | `cagr-calculator`, `goal-simulator`의 relatedTools | `source_tool`, `target_tool`, `locale`, `location` |

이번 점검에서 추가한 공통 수집:

| 이벤트 | 위치 | 파라미터 |
| --- | --- | --- |
| `tool_hub_click` | `pages/tools/index.js`, `ToolCta` | `page_group`, `source_path`, `source_tool`, `target_tool`, `locale`, `location` |
| `tool_result_action` | `CompoundCTA`, `CTABar` | `page_group`, `source_path`, `source_tool`, `action`, `locale`, `location` |
| `tool_nav_click` | `CTABar` PRO 탭 | `page_group`, `source_path`, `source_tool`, `section`, `locale`, `location` |
| `blog_engagement` | 블로그 상세 좋아요/공유/댓글 등록 | `page_group`, `source_path`, `action`, `locale`, `category` |

2단계에서 추가한 핵심 전환 수집:

| 이벤트 | 위치 | 파라미터 |
| --- | --- | --- |
| `tool_calculate` | 5개 계산기 submit 성공 시점 | `page_group`, `source_path`, `source_tool`, `locale`, `currency`, `has_result`, `location` |
| `real_estate_search` | 부동산 대시보드 `/api/re/trade-top` 조회 성공 시점 | `page_group`, `source_path`, `locale`, `sido`, `area_type`, `timeframe`, `period`, `top_by`, `sort`, `top`, `pyeong`, `has_build_filter`, `result_count`, `location` |
| `real_estate_detail_click` | 대시보드 카드/테이블에서 단지 상세 링크 클릭 시점 | `page_group`, `source_path`, `locale`, `sido`, `area`, `timeframe`, `period`, `top_by`, `rank_position`, `apt_key_present`, `location` |

`utils/analytics.js`는 `window.gtag`가 없으면 아무 동작도 하지 않는다. 운영에서 GA ID가 없거나 차단된 브라우저에서도 UI 동작에는 영향이 없다.

## 4. 누락된 이벤트

High 우선순위였던 `tool_calculate`, `real_estate_search`, `real_estate_detail_click`은 2단계에서 완료했다. 아래는 아직 코드에 붙이지 않은 남은 측정 공백이다.

| 우선순위 | 이벤트 | 대상 | 이유 |
| --- | --- | --- | --- |
| Medium | `category_post_click` | 카테고리 → 글 | 목록/카테고리 UX 개선 효과 측정 |
| Medium | `blog_related_post_click` | 블로그 상세 → 관련 글 | 검색 유입 후 내부 회전 확인 |
| Medium | `blog_tool_intro_click` | 블로그 본문 중간 도구 링크 | 콘텐츠-계산기 연결 성과 확인 |
| Low | `comment_edit/delete` | 블로그 댓글 | 성장보다는 운영성 지표 |

남은 이벤트도 계산 공식이나 SEO에 영향을 주지 않도록 실제 행동 직후 no-op 이벤트만 붙이는 방식이 좋다.

## 5. 추가하면 좋은 이벤트 설계

### 계산기

| 이벤트 | 트리거 | 추천 파라미터 |
| --- | --- | --- |
| `tool_calculate` | 폼 submit 성공 | `source_tool`, `locale`, `mode`, `has_result`, `currency` |
| `tool_result_action` | PDF/share/copy | `source_tool`, `action`, `locale`, `location` |
| `tool_hub_click` | 관련 계산기 이동 | `source_tool`, `target_tool`, `locale`, `location` |
| `tool_nav_click` | sticky CTA 섹션 탭 | `source_tool`, `section`, `locale`, `location` |

### 블로그

| 이벤트 | 트리거 | 추천 파라미터 |
| --- | --- | --- |
| `blog_engagement` | 좋아요/공유/댓글 | `action`, `locale`, `category` |
| `blog_related_post_click` | 관련 글 클릭 | `locale`, `category`, `target_slug`, `location` |
| `blog_tool_click` | ToolCta 또는 본문 도구 링크 | `target_tool`, `locale`, `category`, `location` |

### 부동산

| 이벤트 | 트리거 | 추천 파라미터 |
| --- | --- | --- |
| `real_estate_search` | 조회 API 요청 성공 | `locale`, `sido`, `timeframe`, `top_by`, `has_advanced`, `result_count` |
| `real_estate_detail_click` | 단지 상세 클릭 | `locale`, `sido`, `area`, `apt_key_present`, `rank_position` |
| `real_estate_filter_change` | 주요 필터 변경 | `filter_name`, `locale`, `page_group` |

## 6. GSC page filter 정규식 제안

GSC Performance > Pages > Custom regex 기준.

| 그룹 | 정규식 |
| --- | --- |
| 전체 블로그 상세 | `^https://www\.finmaphub\.com/(en/)?posts/(economicInfo|personalFinance|investingInfo)/[^/?#]+/?$` |
| 한국어 블로그 상세 | `^https://www\.finmaphub\.com/posts/(economicInfo|personalFinance|investingInfo)/[^/?#]+/?$` |
| 영어 블로그 상세 | `^https://www\.finmaphub\.com/en/posts/(economicInfo|personalFinance|investingInfo)/[^/?#]+/?$` |
| 카테고리 | `^https://www\.finmaphub\.com/(en/)?category/(economicInfo|personalFinance|investingInfo)/?$` |
| 도구 전체 | `^https://www\.finmaphub\.com/(en/)?tools(/[^/?#]+)?/?$` |
| 계산기 5개 | `^https://www\.finmaphub\.com/(en/)?tools/(compound-interest|fire-calculator|cagr-calculator|goal-simulator|dca-calculator)/?$` |
| 부동산 대시보드 | `^https://www\.finmaphub\.com/(en/)?market/real-estate/?$` |
| 부동산 상세 | `^https://www\.finmaphub\.com/(en/)?market/real-estate/apt/[^/?#]+/?$` |
| 부동산 Top100 랜딩 | `^https://www\.finmaphub\.com/(en/)?market/real-estate/[^/?#]*top100/?$` |
| 정적 정보 | `^https://www\.finmaphub\.com/(en/)?(contact|privacy|terms|about|disclaimer)/?$` |

쿼리 URL은 GSC 분석에서 별도 점검용으로만 본다. 성과 비교는 canonical 최종 URL 기준으로 한다.
`real_estate_detail`은 현재 색인 대상이 아닌 noindex 정책 페이지이므로 GSC 클릭/노출 개선 대상이 아니라 GA4 행동 분석 중심으로 본다. 예외적으로 향후 색인 정책을 바꾸는 경우에만 별도 GSC 그룹으로 승격한다.

## 7. GA4 이벤트/파라미터 제안

GA4 Custom definitions에 우선 등록할 파라미터:

| 파라미터 | 용도 | 등록 우선순위 |
| --- | --- | --- |
| `page_group` | URL 그룹별 행동 집계 | High |
| `source_tool` | 출발 계산기 | High |
| `target_tool` | 이동 대상 계산기 | High |
| `location` | CTA 위치 | High |
| `action` | share/pdf/copy/like 등 | High |
| `locale` | `ko` / `en` | High |
| `section` | CTABar 탭 | Medium |
| `category` | 블로그 카테고리 | Medium |
| `source_path` | 디버깅용 실제 경로 | Low |

`source_path`는 고유값이 많아질 수 있으므로 GA4 커스텀 차원 등록은 신중하게 한다. Explore에서 디버깅용으로만 쓰고, 정규 리포트는 `page_group`, `source_tool`, `target_tool`, `location` 중심으로 보는 편이 안정적이다.

## 8. Scorecard 운영 방식

주간으로 볼 지표:

| 영역 | 지표 | 좋은 신호 |
| --- | --- | --- |
| 검색 노출 | GSC impressions | 블로그/도구/부동산 그룹별 증가 |
| 검색 클릭 | GSC CTR | 평균 순위 5~20위 페이지의 CTR 개선 |
| 계산 실행률 | `tool_calculate / tool_detail page_view` | 계산기 방문자가 실제 계산까지 도달 |
| 도구 허브 | `tool_hub_click / tool_detail page_view` | 계산기 간 이동률 증가 |
| 결과 행동률 | `tool_result_action / tool_calculate` | 계산 후 PDF/share/copy 증가 |
| 블로그 → 도구 | `tool_hub_click` where `page_group=blog_detail` | 검색 유입이 계산기로 이어짐 |
| 도구 → 도구 | `tool_hub_click` where `page_group=tool_detail` 또는 `page_group in (tools_index, tool_detail)` | 단일 계산 후 이탈 감소 |
| 블로그 참여 | `blog_engagement` | 공유/댓글/좋아요 증가 |
| 부동산 상세 이동률 | `real_estate_detail_click / real_estate_search` | 대시보드에서 상세 소비 증가 |

2주 단위로 볼 기준:

- GSC: impressions 증가 페이지와 CTR 개선 페이지를 분리한다.
- GA4: `tool_calculate`, `tool_hub_click`, `tool_result_action`, `blog_engagement`, `real_estate_search`, `real_estate_detail_click`가 기준 분모 대비 증가하는지 본다.
- 콘텐츠 개선: 블로그 상세에서 `tool_hub_click`이 낮은 글은 본문 중간 CTA와 관련 계산기 앵커를 보강한다.
- 계산기 개선: `tool_calculate` 대비 `tool_result_action`이 낮은 계산기는 결과 카드와 공유/PDF 버튼 문구를 점검한다.

## 9. 이번 코드 변경 요약

이번 단계의 코드 변경은 성장 측정용 이벤트 보강에 한정했다.

- `utils/analytics.js`: `trackGaEvent`, `getPageGroup`, `getToolFromPath` 추가.
- `ToolCta`: 관련 계산기 클릭을 `tool_hub_click`으로 수집.
- `CompoundCTA`: PDF 다운로드, 공유, URL 복사를 `tool_result_action`으로 수집.
- `CTABar`: sticky CTA의 PDF/share와 PRO 섹션 탭을 각각 `tool_result_action`, `tool_nav_click`으로 수집.
- 5개 계산기 결과 영역: `ToolCta`에 `sourceTool`과 `location="result_cta"`를 넘겨 계산기 간 이동 출처를 명확히 수집.
- `pages/tools/index.js`: 도구 목록 카드 클릭을 `tool_hub_click`으로 수집.
- `pages/posts/[category]/[slug].js`: 좋아요, 공유, 댓글 등록을 `blog_engagement`로 수집.
- 5개 계산기 submit 성공 시점: `tool_calculate`로 실제 계산 실행을 수집.
- `pages/market/real-estate.js`: 조회 성공 시 `real_estate_search`, 카드/테이블 상세 링크 클릭 시 `real_estate_detail_click`을 수집.

이제 High 우선순위 핵심 전환 이벤트는 수집 중이며, 남은 이벤트는 카테고리/블로그 내부 이동처럼 Medium 이하의 보조 행동이다.
