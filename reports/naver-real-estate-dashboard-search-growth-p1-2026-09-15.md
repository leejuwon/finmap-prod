# FinMap 부동산 대시보드 Search Growth Audit + P1

작성일: 2026-09-15 (KST). 범위: 부동산 탐색 hub, 지역 Top100 7개, 설명형 가이드 3개, 단지 상세, 관련 API/콘텐츠/내부 링크.

## 1. Final Verdict

**ROOT_CAUSE_FOUND_MORE_WORK_REQUIRED**

제한된 P1 문구 수정과 검증은 완료했다. 이 판정의 확정 원인은 **마곡 페이지의 표시 지역과 실제 SQL 조회 범위 불일치**다. 네이버 검색 급락과의 인과관계는 미확정이다.

- **메인 dashboard = exploration hub.** 지역·기간·평형별 가격과 거래량을 탐색하는 역할이 타당하다. 모든 지역 검색어를 직접 맡기는 방향은 권하지 않는다.
- **SSR 지역/Top100 = search acquisition의 우선 후보.** 실제 단지명·가격·거래량·기준월을 초기 HTML에 제공한다. 마곡은 지역 조건 결함을 먼저 해결해야 한다.
- **Guide wrapper = 해석·활용법.** 이미 title에 “보는 법”, H1에 “가이드”가 있다. 데이터 landing과 동일한 primary query를 명시적으로 겨냥한다고 단정할 근거는 부족하지만, 유사 URL·Top100 문구·일부 유입 anchor 때문에 경쟁 위험은 MEDIUM이다.
- **CSR 한계는 유지된다.** 메인 초기 HTML의 실제 단지 데이터는 0건이고, JS 비활성화 화면에는 로딩 overlay가 남는다. SSR 전환·API·hydration 변경은 P2로 보류했다.
- **실험 보호:** 수정 직전 worktree의 44개 보호 파일 SHA-256과 비교해 추가 변경 0개. 기존 Compound 변경을 baseline에 포함했다.

증거: [기계 판독 감사 결과](naver-real-estate-dashboard-p1-evidence-2026-09-15.json), [검증 스크립트](../scripts/verify_naver_real_estate_dashboard_p1.js), [첫 화면 스크린샷](naver-real-estate-p1-2026-09-15-screenshots/).

## 2. Architecture Inventory

### 실제 경로와 책임

URL prefix는 `/market/real-estate`. 아래 source는 URL과 같은 `pages/market/...` 파일이다. 상세는 `pages/market/real-estate/apt/[aptKey].js`다.

| URL | Source | 역할 / 데이터 원천 | 본문 문자 / HTML bytes | 관측 inbound / outbound | 사이트맵 |
| --- | --- | --- | --- | --- | --- |
| [dashboard](https://www.finmaphub.com/market/real-estate) | pages/market/real-estate.js | 정적 shell + CSR 탐색; options / trade-areas / trade-top API | 1,813 / 27,189 | 90 / 지역 Top100 7개, guide 3개, 해석 글, CSR 결과 상세·계산기 | 포함 |
| [seoul-top100](https://www.finmaphub.com/market/real-estate/seoul-top100) | pages/market/real-estate/seoul-top100.js | SSR 데이터 순위; re_trade_deal_ym + re_trade_apt_stats_m | 11,819 / 303,426 | 16 / dashboard, 다른 Top100, 단지 상세, 일부 DSR CTA | 포함 |
| [gangnam-top100](https://www.finmaphub.com/market/real-estate/gangnam-top100) | pages/market/real-estate/gangnam-top100.js | SSR 데이터 순위; re_trade_deal_ym + re_trade_apt_stats_m | 6,700 / 167,139 | 11 / dashboard, 다른 Top100, 단지 상세, 일부 DSR CTA | 포함 |
| [gangnam3-top100](https://www.finmaphub.com/market/real-estate/gangnam3-top100) | pages/market/real-estate/gangnam3-top100.js | SSR 데이터 순위; re_trade_deal_ym + re_trade_apt_stats_m | 11,808 / 304,069 | 8 / dashboard, 다른 Top100, 단지 상세, 일부 DSR CTA | 포함 |
| [magok-top100](https://www.finmaphub.com/market/real-estate/magok-top100) | pages/market/real-estate/magok-top100.js | SSR 데이터 순위; re_trade_deal_ym + re_trade_apt_stats_m | 11,663 / 303,417 | 14 / dashboard, 다른 Top100, 단지 상세, 일부 DSR CTA | 포함 |
| [mayongseong-top100](https://www.finmaphub.com/market/real-estate/mayongseong-top100) | pages/market/real-estate/mayongseong-top100.js | SSR 데이터 순위; re_trade_deal_ym + re_trade_apt_stats_m | 11,948 / 304,700 | 9 / dashboard, 다른 Top100, 단지 상세, 일부 DSR CTA | 포함 |
| [songpa-top100](https://www.finmaphub.com/market/real-estate/songpa-top100) | pages/market/real-estate/songpa-top100.js | SSR 데이터 순위; re_trade_deal_ym + re_trade_apt_stats_m | 8,692 / 220,818 | 9 / dashboard, 다른 Top100, 단지 상세, 일부 DSR CTA | 포함 |
| [songpa-gangnam-top100](https://www.finmaphub.com/market/real-estate/songpa-gangnam-top100) | pages/market/real-estate/songpa-gangnam-top100.js | SSR 데이터 순위; re_trade_deal_ym + re_trade_apt_stats_m | 11,763 / 303,649 | 7 / dashboard, 다른 Top100, 단지 상세, 일부 DSR CTA | 포함 |
| [seoul-apartment-top100](https://www.finmaphub.com/market/real-estate/seoul-apartment-top100) | pages/market/real-estate/seoul-apartment-top100.js | SSG 해석 가이드; lib/realEstateSeoLandingPages.js | 1,461 / 16,423 | 6 / dashboard, 서울 guide는 seoul-top100, 관련 계산기 | 포함 |
| [gyeonggi-apartment-top100](https://www.finmaphub.com/market/real-estate/gyeonggi-apartment-top100) | pages/market/real-estate/gyeonggi-apartment-top100.js | SSG 해석 가이드; lib/realEstateSeoLandingPages.js | 1,437 / 16,390 | 5 / dashboard, 서울 guide는 seoul-top100, 관련 계산기 | 포함 |
| [incheon-apartment-top100](https://www.finmaphub.com/market/real-estate/incheon-apartment-top100) | pages/market/real-estate/incheon-apartment-top100.js | SSG 해석 가이드; lib/realEstateSeoLandingPages.js | 1,420 / 16,296 | 7 / dashboard, 서울 guide는 seoul-top100, 관련 계산기 | 포함 |

본문 크기는 수정 후 빌드의 main DOM 텍스트에서 script/style/header/footer/nav 등을 제외하고 공백을 정규화한 값이다. CSS 가림 여부를 계산한 '사용자에게 완전히 보이는 글자 수'는 아니다. SSR 행은 공개 응답 props를 빌드된 페이지에 넣어 재렌더링했다. 상세 동적 URL의 크기·실시간 HTTP는 이번 표의 19개 고정 URL 검증 범위 밖이다.

### Snippet 및 Heading 원문

| URL | Title | H1 | Description |
| --- | --- | --- | --- |
| [dashboard](https://www.finmaphub.com/market/real-estate) | 서울·경기·인천 아파트 실거래 대시보드 \| FinMap | 서울·경기·인천 아파트 실거래 대시보드 | 서울·경기·인천 아파트 가격과 거래량을 탐색하는 대시보드. 국토교통부 실거래 자료를 지역·기간·평형·년식으로 좁혀 단지별 대표가격·평단가·거래량을 비교하세요. |
| [seoul-top100](https://www.finmaphub.com/market/real-estate/seoul-top100) | 서울 아파트 집값 Top 100 \| 서울 실거래 순위 \| FinMap | 서울 아파트 집값 TOP 100 | 서울 아파트 실거래 집계 데이터를 기반으로, 대표가격(중앙값) 기준 TOP 100 순위를 제공합니다. 최신 거래월 기준으로 확인하세요. |
| [gangnam-top100](https://www.finmaphub.com/market/real-estate/gangnam-top100) | 강남 아파트값 순위 TOP 100 \| 강남구 실거래 기반 \| FinMap | 강남 아파트값 순위 TOP 100 | 강남구 아파트 실거래 집계 데이터를 기반으로, 대표가격(중앙값) 기준 TOP 100 순위를 제공합니다. 최신 거래월 기준으로 빠르게 확인하세요. |
| [gangnam3-top100](https://www.finmaphub.com/market/real-estate/gangnam3-top100) | 강남3구 아파트 집값 TOP 100 \| 강남·서초·송파 실거래 순위 \| FinMap | 강남3구 아파트 집값 TOP 100 | 강남3구(강남·서초·송파) 아파트 실거래 집계 데이터를 기반으로, 대표가격(중앙값) 기준 TOP 100 순위를 제공합니다. 최신 거래월 기준으로 빠르게 확인하세요. |
| [magok-top100](https://www.finmaphub.com/market/real-estate/magok-top100) | 마곡 아파트 집값 TOP 100 \| 강서구 마곡동 실거래 순위 \| FinMap | 마곡 아파트 집값 TOP 100 | 마곡(강서구 마곡동) 아파트 실거래 집계 데이터를 기반으로, 대표가격(중앙값) 기준 TOP 100 순위를 제공합니다. 최신 거래월 기준으로 확인하세요. |
| [mayongseong-top100](https://www.finmaphub.com/market/real-estate/mayongseong-top100) | 마용성 아파트 집값 TOP 100 \| 마포·용산·성수 실거래 순위 \| FinMap | 마용성 아파트 집값 TOP 100 | 마용성(마포·용산·성수) 아파트 실거래를 기반으로, 대표가격(중앙값) 기준 TOP 100을 보여줍니다. 최신 거래월, 거래량, 최근 거래도 함께 확인하세요. |
| [songpa-top100](https://www.finmaphub.com/market/real-estate/songpa-top100) | 송파(잠실) 아파트 집값 TOP 100 \| 송파구 실거래 순위 \| FinMap | 송파(잠실) 아파트 집값 TOP 100 | 송파(잠실) 아파트 실거래 집계 데이터를 기반으로, 대표가격(중앙값) 기준 TOP 100 순위를 제공합니다. 최신 거래월 기준으로 확인하세요. |
| [songpa-gangnam-top100](https://www.finmaphub.com/market/real-estate/songpa-gangnam-top100) | 송파(잠실)+강남 아파트 집값 TOP 100 \| 합본 실거래 순위 \| FinMap | 송파(잠실)+강남 아파트 집값 TOP 100 | 송파(잠실) + 강남(강남구) 아파트 실거래 집계 데이터를 합산해, 대표가격(중앙값) 기준 TOP 100 순위를 제공합니다. 최신 거래월 기준으로 확인하세요. |
| [seoul-apartment-top100](https://www.finmaphub.com/market/real-estate/seoul-apartment-top100) | 서울 아파트 실거래가 Top100 보는 법 \| FinMap | 서울 아파트 실거래가 Top100 가이드 | 서울 아파트 실거래가 Top100을 대표가격, 평단가, 거래량 기준으로 해석하는 방법과 FinMap 부동산 대시보드 활용법을 정리했습니다. |
| [gyeonggi-apartment-top100](https://www.finmaphub.com/market/real-estate/gyeonggi-apartment-top100) | 경기 아파트 실거래가 Top100 보는 법 \| FinMap | 경기 아파트 실거래가 Top100 가이드 | 경기 아파트 실거래가 Top100을 도시별 차이, 대표가격, 평단가, 거래량 기준으로 해석하고 대시보드에서 비교하는 방법을 안내합니다. |
| [incheon-apartment-top100](https://www.finmaphub.com/market/real-estate/incheon-apartment-top100) | 인천 아파트 실거래가 Top100 보는 법 \| FinMap | 인천 아파트 실거래가 Top100 가이드 | 인천 아파트 실거래가 Top100을 송도, 청라, 검단 등 지역 특성과 대표가격, 평단가, 거래량 기준으로 해석하는 방법을 정리했습니다. |

| 유형 | H2/H3 | canonical / hreflang / schema |
| --- | --- | --- |
| dashboard | 초기 H2/H3 없음. '기준/계산 방식' 등은 div. 결과 뒤 H2 CTA는 데이터가 있을 때만 노출. | query 없는 self canonical; KO/EN alternate; WebApplication |
| SSR Top100 7개 | TOP 100 (대표가격·중앙값 기준), 자주 묻는 질문. FAQ 질문은 일반 텍스트. | 각 URL self canonical; KO/EN alternate; WebApplication + BreadcrumbList + FAQPage |
| guide 3개 | 1. 이 페이지에서 확인할 수 있는 것 / 2. 실거래가 Top100 기준 설명 / 3. 대표가격/평단가/거래량 보는 법 / 4. 대시보드로 이동 / 5. 관련 계산기 / 6. FAQ; H3 대표가격·평단가·거래량 | 각 URL self canonical; 실제 응답 KO self alternate만 있음, EN 없음; BreadcrumbList + FAQPage |
| apt/[aptKey] | 단지별 실거래 상세와 시계열 UI. 제목은 apt_name + 실거래 상세. | SSR 요약 + CSR 상세; 의도적으로 meta 및 X-Robots-Tag noindex, follow; 검색 유입 대표 URL로 지정하지 않음 |

OG title/description의 실제 원문과 hreflang 전체 값은 증거 JSON의 `production.pages` / `render.pages`에 보관했다. 주요 19개 URL title은 모두 고유하며, 단지 순위 title/H1을 추가 확장하지 않았다. FAQ JSON-LD는 기존 visible FAQ 데이터 배열을 공유한다. schema 추가 및 dateModified 조작은 없다.

### API / Pipeline / 콘텐츠

- 메인: `pages/api/re/options.js`, `trade-areas.js`, `trade-top.js`. 초기 options와 지역 목록을 요청한 뒤 선택 기간·필터로 거래 목록을 요청한다.
- 상세: `apt-detail.js`, `apt-series.js`.
- 추가 지역 데이터 API: `meta.js`, `overview.js`, `rank.js`, `series-dong.js`, `top-apt.js`, `top-dong.js`. 모두 `pages/api/re/`에 실제 존재한다.
- 공통 UI: `_components/RealEstateTop100Landing.js`, `_components/RealEstateSeoLanding.js`. 공통 집계: `lib/reTop100Landing.js`.
- Pipeline: `ops/run_real_estate_monthly_batch.sh` → `rtms_ingest_apt_dev_sudogwon_range.js` → `re_build_stats_ranks.js` / `re_build_apt_stats.js` (후자는 `server/crawler/scripts/`). 원천 실거래 → 지역 월/연 통계 → 단지 월/연 통계. 이번에 크롤러·배치·DB 쓰기를 실행하지 않았다.
- 관련 글은 `content/posts/{category}/ko|en/`에서 관리하고 `/posts/{category}/{slug}`로 렌더한다. 대표 글: `apt-dashboard-home-goal-roadmap`, `apartment-transaction-volume-decline-meaning`, `large-apartment-complex-households-price-stability`, `seoul-gyeonggi-incheon-risk-budget-framework`, `rent-jeonse-buy-cashflow-opportunity-cost`. 가이드·예산 글의 내부 링크는 실제 빌드 HTML 집계에 포함했다.

## 3. Search Intent Map

| Query family | 대표 URL | Primary / Secondary 및 한계 |
| --- | --- | --- |
| 지역별 아파트 가격 비교 / 부동산 대시보드 | /market/real-estate | Primary 탐색·조건 비교. 지역별 검색어 나열·대출 계산 query 확장 금지. |
| 서울 아파트 가격 순위 / 서울 집값 순위 | /market/real-estate/seoul-top100 | Primary 서울 단지 총액 순위. 서울 구별 평균가격 순위와는 다른 통계. |
| 강남 아파트값 순위 | /market/real-estate/gangnam-top100 | Primary 강남구. 강남3구 전체라는 넓은 의미와 구분. |
| 강남3구 아파트 순위 | /market/real-estate/gangnam3-top100 | Primary 강남·서초·송파 합산. |
| 송파 / 잠실 아파트 순위 | /market/real-estate/songpa-top100 | Primary 송파구 전체(잠실 포함). 잠실만의 순위는 아님. |
| 송파와 강남 아파트 가격 비교 | /market/real-estate/songpa-gangnam-top100 | Primary 두 구 통합 비교. 독립 강남·잠실 query를 동시에 커버한다는 운영 문구 제거. |
| 마용성 집값 / 아파트 순위 | /market/real-estate/mayongseong-top100 | Primary 마포·용산·성동 전체. 성수만의 통계로 해석하면 안 됨. |
| 마곡 아파트 가격 / 집값 순위 | /market/real-estate/magok-top100 | 조건부 primary 후보. 현재 강서구 전체 조회 결함 해결이 선행되어야 함. |
| 서울·경기·인천 Top100 보는 법 | 각 지역 -apartment-top100 | Primary 지표 해석·비교 방법. 실시간 실제 순위표 query는 secondary. |
| 경기 / 인천 실제 단지 가격 탐색 | /market/real-estate | 각 지역 필터를 이용하는 탐색 intent. 별도 경기/인천 SSR 순위 landing은 현재 없음. |
| 구매 예산·대출 한도·월상환액 | 기존 calculator URL | 부동산 페이지의 secondary funnel. 이번 실험에서 calculator 소유 intent·링크 구조 유지. |

첫 500자 원문은 증거 JSON에 저장했다. 메인의 첫 설명은 '지역과 기간을 선택해 아파트 가격과 거래량을 탐색하고 비교'로 정리했다. SSR 지역 페이지는 지역/지표/기준월이 이미 앞부분에 있으며 새 FAQ나 키워드 본문을 추가할 필요가 없다.

## 4. Production Rendering Audit

관측 시각은 증거 JSON의 `production.checkedAt` (UTC)을 따른다. KO 11개 + EN dashboard/Top100 8개 = **19개** 공개 URL을 직접 HTTP 요청했다. 가이드 3개는 KO-only다.

- 19/19 HTTP 200, H1 정확히 1개, 고유 title, self canonical, noindex 없음, description/OG 존재, JSON-LD 파싱 정상.
- 기본 URL 19개 모두 public sitemap에 포함. band/range query는 canonical에 포함되지 않는다. query별 중복 크롤링 가능성 자체는 canonical만으로 제거됐다고 단정하지 않는다.
- 메인 KO/EN: 실제 단지 행 0, 단지 상세 링크 0. 텍스트/내부 링크/필터 shell은 존재하므로 HTML 전체가 비어 있는 페이지는 아니다.
- Top100: 실제 HTML anchor의 단지명 및 가격 문자열·거래량 숫자를 공개 props의 전체 행과 대조했다. JS 또는 JSON 데이터만의 존재를 SSR 본문 데이터로 세지 않았다.

| 프로덕션 URL | 실제 행 | 기준월 | 첫 단지 / 대표가격 / 거래량 |
| --- | --- | --- | --- |
| [seoul-top100](https://www.finmaphub.com/market/real-estate/seoul-top100) | 100 | 202608 | 나인원한남 / 255.000억원 / 1건 |
| [gangnam-top100](https://www.finmaphub.com/market/real-estate/gangnam-top100) | 52 | 202608 | 한양4 / 90.000억원 / 1건 |
| [gangnam3-top100](https://www.finmaphub.com/market/real-estate/gangnam3-top100) | 100 | 202608 | 한양4 / 90.000억원 / 1건 |
| [magok-top100](https://www.finmaphub.com/market/real-estate/magok-top100) | 100 | 202608 | 마곡엠밸리7단지 / 24.000억원 / 1건 |
| [mayongseong-top100](https://www.finmaphub.com/market/real-estate/mayongseong-top100) | 100 | 202608 | 나인원한남 / 255.000억원 / 1건 |
| [songpa-top100](https://www.finmaphub.com/market/real-estate/songpa-top100) | 71 | 202608 | 주공아파트 5단지 / 41.050억원 / 5건 |
| [songpa-gangnam-top100](https://www.finmaphub.com/market/real-estate/songpa-gangnam-top100) | 100 | 202608 | 한양4 / 90.000억원 / 1건 |

숫자는 해당 공개 응답을 관측한 값이며 원천 거래의 진위·집계 정확성을 별도로 인증한 값은 아니다. 마곡의 100행은 마곡동에 한정된 100단지를 뜻하지 않는다.

수정 후 검증은 두 층으로 수행했다. 로컬 정적 화면은 실제 HTTP 200을 확인했다. 로컬 SSR은 DB `ECONNREFUSED` 때문에 500이 발생했고, 이후 **실제 빌드 페이지 + 공개 응답 props 재렌더링**으로 본문·head·CTA를 검증했다. 이 재렌더링은 DB 연결과 SQL의 통합 검증을 대체하지 않는다. 배포는 수행하지 않았다.

## 5. Data Freshness Audit

- 7개 Top100의 실제 기준월 props는 모두 `202608`, 기본 집계 from/to도 `202608`이다. 서버 source에서 `MAX(deal_ym) FROM re_trade_deal_ym`을 읽어 기준월을 정한다.
- `fetchTop100Rows`는 `re_trade_apt_stats_m`를 from/to와 평형·지역 조건으로 조회한다. 기준월 테이블의 MAX와 지역별 통계 완성 여부가 항상 일치한다는 보장은 없으므로 향후 양쪽 완료 상태를 함께 감시할 필요가 있다.
- 기존 KO 문구 '항상 전월'은 배치 지연 때 사실과 어긋날 수 있다. 이번에는 **실제로 조회 가능한 최신 기준월**로 바꾸고 기본 기간 선택/집계 범위 label도 '최신 데이터월'로 맞췄다. `pm` query 값과 계산·SQL은 유지했다.
- 날짜는 '집계 대상 데이터월'이다. '오늘 갱신', 실제 최종 배치 완료시각, 날짜 단위 최신화 보장을 추가하지 않았다. 페이지 schema에 새로운 dateModified를 넣지 않았다.
- 월간 wrapper는 KST 전월을 기본 대상으로 사용한다. 운영 cron 실행 여부·최근 ingest 완료시각·원천 DB MAX는 이번 직접 확인 범위 밖이다. 과거 scheduler 보고서를 현재 운영 상태의 증거로 전용하지 않았다.

## 6. Landing Cannibalization

### Data landing vs guide wrapper

| URL | Primary query / intent | Title / H1 | 실데이터 | 내부 연결 |
| --- | --- | --- | --- | --- |
| /seoul-top100 | 서울 아파트 집값 순위 / 단지 가격 비교 | 서울 아파트 집값 Top 100 \| 서울 실거래 순위 \| FinMap / 서울 아파트 집값 TOP 100 | SSR 100행 | dashboard + 다른 지역 Top100 + 단지 상세; guide로 가는 직접 CTA는 없음 |
| /seoul-apartment-top100 | 서울 Top100 보는 법 / 대표가격·평단가 해석 | 서울 아파트 실거래가 Top100 보는 법 \| FinMap / 서울 아파트 실거래가 Top100 가이드 | 없음 | 서울 Top100 순위 보기 → /seoul-top100; dashboard 열기; 기존 계산기 |
| /gyeonggi-apartment-top100 | 경기 Top100 해석 / 도시별 비교 방법 | 경기 아파트 실거래가 Top100 보는 법 \| FinMap / 경기 아파트 실거래가 Top100 가이드 | 없음 | 경기 지역 대시보드로 이동 → 무파라미터 dashboard |
| /incheon-apartment-top100 | 인천 Top100 해석 / 권역별 지표 읽기 | 인천 아파트 실거래가 Top100 보는 법 \| FinMap / 인천 아파트 실거래가 Top100 가이드 | 없음 | 인천 지역 대시보드로 이동 → 무파라미터 dashboard |

**판정: MEDIUM.** 서울 data/guide는 기능이 다르고 title/H1에서도 설명형 intent를 구분한다. 동일 query를 둘 다 primary로 작성한 상태라고 단정하지 않는다. 다만 URL의 Top100 공통명, 일부 '서울 아파트 실거래가 Top100' anchor, 경기·인천 wrapper를 실제 가격표처럼 소개하는 anchor가 데이터 기대를 만든다. 메인에서 guide로 가는 3개 anchor에 '보는 법'을 명시했고 wrapper 상단을 '데이터 해석 가이드'로 정리했다.

강남 / 송파 / 강남3구 / 송파+강남은 지리적으로 포함 관계여서 같은 단지가 반복된다. 각각 단일 구 / 3개 구 / 2개 구 비교로 역할을 정하면 유용한 별도 페이지다. 합본 페이지의 '강남·잠실 검색 의도를 한 번에 커버' 문구는 실제 두 지역 비교 설명으로 교체했다. `mayongseong`은 성동구 전체를 포함하므로 성수동 전용 랜딩으로 확장하면 안 된다.

경기·인천 CTA는 해당 시도로 필터링된 주소가 아니다. 링크는 유효하지만 지역 문맥을 자동 유지하지 않는다. 대상 URL 삭제·통합·canonical·redirect 변경은 보류했다. 네이버 URL별 query 교대 노출 자료가 없어 실제 cannibalization 발생량은 계산하지 않았다.

## 7. Programmatic Landing Quality

지역 Top100은 임의 slug를 대량 생성하는 구조가 아니라 7개 명시적 page + 공통 component다.

| Landing | Unique value | 근거 / 남은 문제 |
| --- | --- | --- |
| 서울 | HIGH | 서울 전체 실거래 순위, 실제 100행, 기준월, 지표/FAQ/상세 연결 |
| 강남 | HIGH | 강남구 조건, 52행. Top100은 최대 개수이며 항상 100행이라는 뜻은 아님. |
| 강남3구 | MEDIUM | 강남·서초·송파 통합 데이터. 단일 구 페이지와 많은 행을 공유하나 비교 범위가 다름. |
| 송파 | HIGH | 송파구 71행. 잠실 포함 범위를 본문에 명시. |
| 송파+강남 | MEDIUM | 두 구 통합 100행. 서초 제외를 분명히 하여 3구 페이지와 역할 구분. |
| 마용성 | MEDIUM | 마포·용산·성동 합산 100행. 서울 상위 단지와 겹치지만 독립 권역 비교 가치. |
| 마곡 | LOW (지역 정합성 결함) | 마곡동이라고 설명하지만 강서구 전체 100행. 단순 template 중복보다 데이터 scope 오류가 우선. |
| 서울 guide | MEDIUM | 데이터 자체 없음. 대표가격·평단가·거래량 해석 및 data landing 연결. |
| 경기/인천 guide | MEDIUM for guide / LOW for data query | 도시·권역별 설명 차이는 있으나 공통 metric/FAQ 구조 비중 큼. 데이터 landing으로 평가하면 부족. |

### 마곡 범위 오류 근거

`pages/market/real-estate/magok-top100.js:9`에 `dongName: "마곡동"`이 정의되어 있지만, `:205`의 실제 조건은 `s.lawd_cd = ?`, params는 `[REGION.lawd]`뿐이다. 동 조건이 전달되지 않는다.

공개 응답의 apt_key에 포함된 지역명은 **마곡동, 화곡동, 염창동, 내발산동, 등촌동, 가양동, 방화동, 공항동**였다. 이는 SQL과 프로덕션 양쪽에서 확인된 불일치다. 기존 FAQ의 '마곡동만 포함' 설명도 현재 데이터와 맞지 않는다. 이번 P1의 허용 목록에 SQL/필터 변경이 없어 보류했으며, 실제 DB 필드와 동 매핑을 검증한 뒤 좁은 수정으로 처리할 최우선 후속 항목이다.

## 8. Searchable Data / Table Audit

- Top100의 기본 카드 목록에 순번, 시군구, 단지명 링크, 대표가격, 최근 거래가격, 거래량, 계약일, 년식, 최근거래 평형이 텍스트로 렌더된다. desktop table 전환 전에도 데이터는 읽을 수 있다.
- 기본 화면은 카드다. '실제 HTML 데이터 존재'와 '초기 HTML에 table 태그가 있다'를 혼동하지 않았다.
- 메인은 `rows=[]`에서 시작한다 (`pages/market/real-estate.js:382`). `fetchTop` 및 effect가 API 결과를 받아 rows를 채운다. SSR/정적 HTML에는 가격 분포나 실제 상위 단지 summary가 없다.
- 가격 지표/평단가/표본수 설명은 존재한다. 새 평균·중앙값·전월 변동률 계산을 추가하지 않았다.
- **추가 통계 해석 위험:** `lib/reTop100Landing.js`의 다개월 대표가격은 월별 median을 거래량으로 가중평균한 근사값이다. 전체 기간 원거래의 정확한 median과 다르다. 기본 단일월에서는 이 차이가 줄지만 3·6·12개월에서도 '중앙값'이라고만 읽히는 설명은 P2에서 점검해야 한다. 집계 로직은 이번에 수정하지 않았다.

## 9. UX / Above-the-fold

JS 비활성화, 실제 빌드 CSS, 1440×900 / 390×844 Chrome으로 초기 화면을 비교했다. 6개 스크린샷 모두 CSS 로드 및 가로 overflow 없음. 표의 y는 문서 상단 기준 px다.

| Page | Desktop H1 / 첫 필터 / 첫 단지 y | Mobile H1 / 첫 필터 / 첫 단지 y | 판단 |
| --- | --- | --- | --- |
| dashboard | 104 / 848 / 없음 | 77 / 1274 / 없음 | JS 없이 로딩 overlay가 계속 가림. 본문에 탐색 가치 설명은 있으나 첫 데이터 탐색이 늦음. |
| 서울 Top100 | 104 / 530 / 887 | 77 / 657 / 1004 | 기준월·지역은 앞에 있음. 소개/기준설명/기존 DSR CTA 때문에 실데이터는 화면 하단 또는 아래에 시작. |
| 서울 guide | 132 / 없음 / 없음 | 103 / 없음 / 없음 | 해석 가이드 역할은 첫 화면에 명확. 실제 순위표를 기대한 방문자에게는 단계가 하나 더 필요. |

[모바일 SSR 순위 화면](naver-real-estate-p1-2026-09-15-screenshots/390-seoul-top100.png), [데스크톱 SSR 순위 화면](naver-real-estate-p1-2026-09-15-screenshots/1440-seoul-top100.png), [모바일 dashboard 초기 로딩 화면](naver-real-estate-p1-2026-09-15-screenshots/390-real-estate.png).

문구의 줄바꿈과 주변 요소를 육안 확인했다. 새 설명 섹션·FAQ·UI를 추가하지 않았다. JS 실행 후 API 응답시간, 필터 조작, chart hydration, 광고 포함 실제 사용자 세션 및 CWV/LCP/CLS는 측정하지 않았다. 메인의 options → 거래 조회 의존성과 수십~100개 카드 렌더가 비용 후보지만 수치 근거 없는 성능 회귀 판정은 하지 않는다. P2에서는 설명 블록 축약/접기와 필터·첫 데이터 위치를 먼저 평가할 가치가 있다. 계산기 CTA 배치는 현재 실험 보호로 유지했다.

## 10. Internal Link Architecture

**Recommended funnel:**

```text
검색 (특정 지역·단지 가격 순위)
  → SSR 지역/Top100 landing
  → real-estate dashboard (기간·평형·가격대 탐색)
  → 단지 상세 / 다른 지역 landing

해석 질문
  → guide / 관련 글
  → SSR 순위 또는 dashboard
```

판정: **현재 구조에 타당함.** 검색 유입 우선 후보는 SSR landing, 반복 탐색의 중심은 dashboard다. 기본 데이터가 없는 guide를 순위표 대신 primary로 밀거나, dashboard에 모든 지역 키워드를 누적할 필요는 없다.

- Home에서 시장정보 navigation → `/market` → dashboard 흐름이 존재한다. homepage 자체에 별도 데이터 hub 직접 CTA가 항상 있다는 가정은 하지 않는다.
- `pages/market/index.js`는 dashboard 및 guide 3개로 연결한다. SSR 데이터 페이지의 발견은 dashboard/글의 연결이 더 중요하다.
- 관련 글은 dashboard와 지역 순위를 가리킨다. 가격대 query가 포함된 dashboard deep link도 실제 존재한다.
- 지역 landing 7개는 dashboard CTA와 다른 지역 landing 링크, 각 단지 상세 링크를 가진다. dashboard에는 모든 지역 Top100 바로가기와 4개 해석 글이 있다.
- guide → dashboard 링크는 유효하다. 경기·인천 anchor와 무파라미터 target 사이의 상태 전달 부족은 HOLD로 남겼다.
- 계산기 → dashboard / dashboard → 계산기 funnel은 기존 source 및 렌더 anchor 그대로 유지했다. 타깃·query·계산기 관련 anchor를 재조정하지 않았다.

## 11. Internal Anchor Distribution

집계 단위: **KO 정적 빌드 HTML 105개 + KO SSR Top100 7개**의 실제 anchor occurrence. query variants는 target pathname으로 합쳤다. EN 및 미렌더 동적 상세는 제외했다. 글·category·sitemap-pages에 같은 anchor가 반복될 수 있으므로 독립 editorial 추천 수나 검색 가중치가 아니다. 전체 anchor 원문과 sourcePages 목록은 증거 JSON `anchors.distribution`에 있다.

| Target | KO anchor semantic distribution (count) | 합계 |
| --- | --- | --- |
| [dashboard](https://www.finmaphub.com/market/real-estate) | 부동산 대시보드 (28); 서울·경기·인천 아파트 실거래 대시보드 (22); 부동산 대시보드 열기 (7); 대시보드로 이동 (7); 서울·경기·인천 아파트 실거래 대시보드에서 가격 분포 확인하기 (6); FinMap 부동산 대시보드 (6); 부동산 대시보드에서 보기 (4); 부동산 대시보드에서 실거래 가격대 확인하기 (2); 경기 지역 대시보드로 이동 (1); 인천 지역 대시보드로 이동 (1); [시장정보 카드: 제목 + 설명 전체] (1); 약 2.28억~2.57억원 중앙값 필터로 대시보드 열기 (1); 약 4.57억~5.14억원 중앙값 필터로 대시보드 열기 (1); 약 4.79억~5.39억원 중앙값 필터로 대시보드 열기 (1); 부동산 대시보드에서 약 4.57억~5.14억원 실거래 단지 확인하기 (1); https://www.finmaphub.com/market/real-estate (1) | 90 |
| [seoul-top100](https://www.finmaphub.com/market/real-estate/seoul-top100) | 서울 Top100 (8); 서울 아파트 TOP100 (2); 서울 아파트 TOP100 가격대 보기 (2); 서울 Top100 순위 보기 (1); 서울 아파트 집값 Top100 (1); 서울 집값 순위 (1); 서울 아파트 Top100 보기 (1) | 16 |
| [gangnam-top100](https://www.finmaphub.com/market/real-estate/gangnam-top100) | 강남 Top100 (8); 강남 아파트 순위 (1); (현재 평형) (1); 강남 아파트값 순위 Top100 (1) | 11 |
| [gangnam3-top100](https://www.finmaphub.com/market/real-estate/gangnam3-top100) | 강남3구 Top100 (7); 강남3구 집값 순위 (1) | 8 |
| [magok-top100](https://www.finmaphub.com/market/real-estate/magok-top100) | 마곡 Top100 (8); 마곡 아파트 순위 (1); (현재 평형) (1); 마곡 아파트 TOP100 (1); 마곡 아파트 TOP100 가격대 보기 (1); 마곡 집값 순위 (1); 마곡 아파트 Top100 보기 (1) | 14 |
| [mayongseong-top100](https://www.finmaphub.com/market/real-estate/mayongseong-top100) | 마용성 Top100 (7); 마용성 아파트 순위 (1); (현재 평형) (1) | 9 |
| [songpa-top100](https://www.finmaphub.com/market/real-estate/songpa-top100) | 송파(잠실) Top100 (7); 송파(잠실) 아파트 순위 (1); (현재 평형) (1) | 9 |
| [songpa-gangnam-top100](https://www.finmaphub.com/market/real-estate/songpa-gangnam-top100) | 송파(잠실)+강남구 Top100 (7) | 7 |
| [seoul-apartment-top100](https://www.finmaphub.com/market/real-estate/seoul-apartment-top100) | 서울 아파트 실거래가 Top100 가이드로 대표가격과 평단가 읽기 (2); 서울 아파트 실거래가 Top100 보는 법 (1); 서울 아파트 실거래가 Top100서울 전체 실거래 순위를 대표가격, 평단가, 거래량 기준으로 해석합니다. (1); 서울 아파트 실거래가 Top100 (1); 서울 아파트 실거래가 Top100 가이드 (1) | 6 |
| [gyeonggi-apartment-top100](https://www.finmaphub.com/market/real-estate/gyeonggi-apartment-top100) | 경기 아파트 실거래가 Top100 보는 법 (1); 경기 아파트 실거래가 Top100경기도 주요 도시의 실거래 가격과 거래량 차이를 비교하는 방법을 정리했습니다. (1); 경기 아파트 실거래가 Top100에서 지역별 가격 흐름 비교하기 (1); 경기 Top100 가이드 (1); 경기 아파트 실거래가 Top100 가이드 (1) | 5 |
| [incheon-apartment-top100](https://www.finmaphub.com/market/real-estate/incheon-apartment-top100) | 인천 아파트 실거래가 Top100으로 수도권 가격대 확인하기 (3); 인천 아파트 실거래가 Top100 보는 법 (1); 인천 아파트 실거래가 Top100송도·청라·검단 등 인천 권역별 가격 흐름을 Top100 관점에서 확인합니다. (1); 인천 Top100 가이드 (1); 인천 아파트 실거래가 Top100 가이드 (1) | 7 |

해석: dashboard는 '부동산 대시보드/실거래/가격 분포 탐색' anchor가 우세하며 역할과 대체로 맞는다. SSR에는 지역명+Top100/순위가 우세하다. '(현재 평형)' 4종 anchor는 인접 지역 순위 anchor 문맥에서 읽어야 한다. Guide에는 '가이드/보는 법'과 실제 가격 확인을 약속하는 문구가 혼재한다. 특히 인천 guide의 'Top100으로 수도권 가격대 확인하기' 3회는 데이터 기대와 차이가 있다. 이번 수정은 dashboard 안의 guide anchor 3개에 한정했다.

## 12. SERP / Competitor Audit

**EXTERNAL_NAVER_SERP_LIMITED.** '아파트 가격 순위', '서울 아파트 가격', '지역별 집값', '서울 집값 순위'를 웹 검색으로 샘플링했다. 네이버 직접 검색 URL 열기는 접근 제한으로 재현하지 못했다. 아래는 웹 검색 표본의 사이트 원문 비교이며 네이버 상위 순위·점유율·개인화 결과라고 주장하지 않는다.

| 사이트 / 원문 | 관측된 페이지 유형과 정보 | FinMap에 대한 시사점 |
| --- | --- | --- |
| [APTHI](https://apthi.kr/) | 실거래 서비스 hub. 지역별 평당가격 순위 목록과 기준월을 본문에 제시. 매매/임대 및 지역 링크. | 탐색 hub도 이미 보유한 데이터 summary가 있으면 의미가 명확해짐. 신규 통계는 이번 미추가. |
| [부동산통 서울 가격](https://www.budongsantong.com/apartment/price/seoul) | 서울별 가격 설명, 기준월/표본수, 지역별 수치 table, 지표 FAQ, 다른 지역·지표 navigation. | location + metric + period를 함께 제시. FinMap 단지 총액 순위와 구별 평균 통계는 구분 필요. |
| [집값차트 서울](https://jipchart.kr/seoul) | 지역별 시장 지표와 변화율 설명·시계열, 기준기간 및 지역/관련 해석 경로. | 동일 지역이라도 순위 조회와 추세 해석은 독립 질문. page 수보다 기존 데이터의 이해 가능성이 중요. |

경쟁 사이트의 실제 mobile viewport·성능은 측정하지 않았다. 텍스트 추출로 first-screen의 픽셀 위치를 추정하지 않았다. 콘텐츠·FAQ·통계를 복사하지 않았다.

## 13. Root Cause Ranking

검색 하락에 대한 원인 순위가 확정된 것은 아니다. 아래는 코드/렌더링에 근거한 **내부 개선 우선순위**다.

| 우선순위 | 발견 | 증거 강도 | 처리 |
| --- | --- | --- | --- |
| 1 | 마곡동 전용 설명과 강서구 전체 SQL 결과 불일치 | HIGH: source + 공개 행의 8개 동 | HOLD / P2 최우선. SQL·동 매핑 검증 필요. |
| 2 | 메인 핵심 데이터 CSR-only + 초기 로딩 overlay | HIGH: source + live HTML + JS-off screenshot | HOLD / P2. 검색은 SSR landing에 우선 배정. |
| 3 | 사용자 화면에 검색 유입·고정 URL·검색 의도 등 운영 문구 | HIGH: 프로덕션 + source | P1 SAFE 적용 완료. 검색 성과 효과는 관측 필요. |
| 4 | Guide wrapper와 data landing의 일부 anchor 기대 혼동 | MEDIUM: title은 구분, anchor는 일부 혼재 | P1 SAFE: dashboard guide anchor·guide 상단 label만 정리. |
| 5 | 상단 설명/CTA로 첫 데이터·필터가 아래로 밀림 | HIGH for geometry / impact unmeasured | HOLD / P2 UX. 계산기 실험 보호. |
| 6 | 기준월 '항상 전월' 단정 및 다개월 median 설명 한계 | HIGH for source logic | P1 SAFE: 기준월 label 수정. 다개월 통계 설명/정확성 P2. |
| 7 | 네이버 9월 최신 URL×query baseline 부재 | HIGH for missing observation | 검색 급락/회복 인과 추정 제한. 현재 수치 생성 금지. |

## 14. Safe Changes Applied

총 **애플리케이션 source 10개**에서 문자열과 기간 표시 label만 수정했다. title/H1은 기존 역할 구분이 충분해 유지했고 dashboard의 description/첫 설명만 명확히 했다. 메인 description은 기존 서울·경기·인천 범위를 한 번 제시하고 비교 기능을 설명한다. 지역별 검색어 나열은 추가하지 않았다.

- 사용자 visible 내부 SEO 문구를 실제 지역 비교·탐색 문구로 교체 (KO/EN).
- 메인 guide 링크 3개에 '보는 법' 추가. 링크 target은 동일.
- 설명 wrapper 상단을 '아파트 실거래 데이터 해석 가이드'로 변경.
- 서울 CTA가 실제 dashboard 기능을 설명하도록 정리.
- 송파+강남을 두 구 비교로 명확화하고 서초 제외 표시.
- 조회 가능한 데이터월과 기본 범위 label 정합화. 데이터 값·SQL·캐시·query 파라미터는 동일.

### 변경 전 / 후 전체 목록

| Source | 변경 전 | 변경 후 |
| --- | --- | --- |
| _components/RealEstateSeoLanding.js | 부동산 실거래 랜딩 | 아파트 실거래 데이터 해석 가이드 |
| _components/RealEstateTop100Landing.js | { value: "pm", labelKo: "전월(기본)", labelEn: "Prev month (default)" }, | { value: "pm", labelKo: "최신 데이터월(기본)", labelEn: "Latest data month (default)" }, |
| _components/RealEstateTop100Landing.js | ? `Update anchor is always the latest available month (${ymLabel(period)}). (Data pipeline)`<br>: `업데이트 기준(앵커)은 항상 전월(${ymLabel(period)})입니다. (데이터 생성 스케줄 때문)`} | ? `Latest available transaction month: ${ymLabel(period)}. The aggregation range is shown below.`<br>: `현재 조회 가능한 실거래 데이터의 최신 기준월은 ${ymLabel(period)}입니다. 선택한 집계 범위는 아래와 같습니다.`} |
| _components/RealEstateTop100Landing.js | ? `Aggregation range: ${ymLabel(fromYm)} ~ ${ymLabel(toYm)} (${rangeLabelEn \|\| ""})`<br>: `집계 범위: ${ymLabel(fromYm)} ~ ${ymLabel(toYm)} (${rangeLabelKo \|\| ""})`} | ? `Aggregation range: ${ymLabel(fromYm)} ~ ${ymLabel(toYm)} (${rangeKey === "pm" ? "Latest data month" : rangeLabelEn \|\| ""})`<br>: `집계 범위: ${ymLabel(fromYm)} ~ ${ymLabel(toYm)} (${rangeKey === "pm" ? "최신 데이터월" : rangeLabelKo \|\| ""})`} |
| pages/market/real-estate.js | subtitle: '서울·경기·인천 국토부 실거래(아파트 매매) 기반 단지 Top 랭킹 — 조건 필터 → Top 기준으로 랭킹', | subtitle: '지역과 기간을 선택해 아파트 가격과 거래량을 탐색하고 비교하세요. 국토교통부 아파트 매매 실거래 자료를 사용합니다.', |
| pages/market/real-estate.js | '서울·경기·인천 아파트 실거래(국토부) 기반 Top 랭킹 대시보드. 지역/기간/평형/년식 필터로 단지별 거래량·중위·평균·평단가를 비교하세요.', | '서울·경기·인천 아파트 가격과 거래량을 탐색하는 대시보드. 국토교통부 실거래 자료를 지역·기간·평형·년식으로 좁혀 단지별 대표가격·평단가·거래량을 비교하세요.', |
| pages/market/real-estate.js | subtitle: 'Official RTMS-based apartment sale data for Seoul, Gyeonggi, and Incheon — ranked by your metric', | subtitle: 'Explore apartment sale prices and transaction counts by area and period using official Korean transaction data. Compare complexes across Seoul, Gyeonggi, and Incheon.', |
| pages/market/real-estate.js | {lang === 'en' ? 'Landing pages for Google search (Top 100).' : '구글 검색 유입을 위한 고정 URL 랜딩(Top100).'} | {lang === 'en' ? 'Regional Top 100 rankings.' : '주요 지역 Top100 순위 바로가기'} |
| pages/market/real-estate.js | {lang === 'en' ? 'Popular rankings (official transactions)' : '인기 검색: 아파트 순위(실거래)'} | {lang === 'en' ? 'Regional rankings (official transactions)' : '지역별 아파트 순위(실거래)'} |
| pages/market/real-estate.js | Explore fixed-URL ranking pages:{" "} | Compare apartment rankings by area:{" "} |
| pages/market/real-estate.js | 자주 검색되는 키워드별로 고정 URL 순위 페이지를 준비했어요:{" "} | 관심 지역의 아파트 순위를 확인해보세요:{" "} |
| pages/market/real-estate.js | 서울 아파트 실거래가 Top100 | 서울 아파트 실거래가 Top100 보는 법 |
| pages/market/real-estate.js | 경기 아파트 실거래가 Top100 | 경기 아파트 실거래가 Top100 보는 법 |
| pages/market/real-estate.js | 인천 아파트 실거래가 Top100 | 인천 아파트 실거래가 Top100 보는 법 |
| pages/market/real-estate.js | ? 'Tip: These pages are designed to match search intent and load fast. Use filters for a deeper comparison.'<br>: 'Tip: 검색 의도에 맞춘 빠른 순위 페이지입니다. 더 깊은 비교는 위 필터로 조건을 좁혀보세요.'} | ? 'Compare regional rankings, then use the dashboard filters to focus on the size, age, and price range you need.'<br>: '지역별 순위를 살펴보고, 아래 필터에서 원하는 평형·년식·금액 구간으로 비교 범위를 좁혀보세요.'} |
| pages/market/real-estate/gangnam-top100.js | "‘강남 아파트값 순위’ 검색 의도에 맞춘 고정 URL 랜딩페이지입니다.", | "강남구 아파트의 가격 수준을 대표가격과 거래량으로 비교할 수 있습니다.", |
| pages/market/real-estate/gangnam-top100.js | "This page is a fixed-URL Top 100 ranking for the query “Gangnam apartment ranking,” based on official transactions.", | "This page shows a Top 100 ranking for Gangnam-gu apartments based on official transactions.", |
| pages/market/real-estate/gangnam-top100.js | "A fixed-URL landing page for the query “Gangnam apartment price ranking.”", | "Compare Gangnam-gu apartment price levels alongside transaction counts.", |
| pages/market/real-estate/gangnam3-top100.js | "‘강남3구 아파트값 순위’ 검색 의도에 맞춘 고정 URL 랜딩페이지입니다.", | "강남·서초·송파 아파트의 가격 수준을 한 순위에서 비교할 수 있습니다.", |
| pages/market/real-estate/gangnam3-top100.js | "A fixed-URL landing page for the query “Gangnam 3 districts apartment price ranking.”", | "Compare apartment price levels across Gangnam, Seocho, and Songpa in one ranking.", |
| pages/market/real-estate/magok-top100.js | "‘마곡 아파트 집값/순위’ 검색 의도에 맞춘 고정 URL 랜딩페이지입니다.", | "단지별 대표가격과 거래량을 함께 비교할 수 있습니다.", |
| pages/market/real-estate/magok-top100.js | "This page provides a fixed-URL Top 100 ranking for Magok based on official transactions.", | "This page provides a Top 100 ranking for Magok based on official transactions.", |
| pages/market/real-estate/magok-top100.js | "A fixed-URL landing page for the query “Magok apartment price ranking.”", | "Compare apartment price levels alongside transaction counts.", |
| pages/market/real-estate/mayongseong-top100.js | related: "관련 랜딩페이지", | related: "관련 지역 순위", |
| pages/market/real-estate/mayongseong-top100.js | "This fixed-URL page summarizes a Top 100 ranking for Mayongseong (Mapo, Yongsan, Seongsu/Seongdong) using official transactions.", | "This page summarizes a Top 100 ranking for Mayongseong (Mapo, Yongsan, Seongsu/Seongdong) using official transactions.", |
| pages/market/real-estate/seoul-top100.js | ctaTitle: "마용성/강남 같은 키워드 페이지도 있어요", | ctaTitle: "관심 지역과 조건으로 비교 범위를 좁혀보세요", |
| pages/market/real-estate/seoul-top100.js | "특정 지역 검색어를 공략하는 고정 URL 랜딩페이지를 함께 운영하면 검색 유입이 더 쉬워집니다.", | "대시보드에서 지역·평형·년식·금액 구간을 선택해 비교할 수 있습니다. 마용성·강남 등 지역별 순위도 함께 확인해보세요.", |
| pages/market/real-estate/seoul-top100.js | "A Seoul-wide benchmark page (fixed URL) for SEO and quick scanning.", | "A Seoul-wide benchmark for comparing apartment price levels.", |
| pages/market/real-estate/seoul-top100.js | ctaTitle: "Try keyword-focused pages (Mayongseong / Gangnam)",<br>ctaDesc: "Fixed-URL pages tend to perform better for search intent matching.", | ctaTitle: "Narrow your comparison by area and price range",<br>ctaDesc: "Use the dashboard to compare apartments by area, size, build year, and price range. You can also explore local rankings for Mayongseong and Gangnam.", |
| pages/market/real-estate/songpa-gangnam-top100.js | "이 페이지는 ‘잠실 아파트 순위’와 ‘강남 아파트 순위’ 검색 의도를 한 번에 커버하는 합본 Top100 랭킹입니다.", | "이 페이지는 송파(잠실 포함)와 강남구 아파트를 하나의 Top100 순위로 비교합니다.", |
| pages/market/real-estate/songpa-gangnam-top100.js | "‘잠실 아파트’와 ‘강남 아파트’ 검색 의도를 한 페이지에서 커버하는 합본 랜딩페이지입니다.", | "송파구와 강남구를 같은 가격 기준으로 비교할 수 있습니다. 서초구는 포함하지 않습니다.", |
| pages/market/real-estate/songpa-gangnam-top100.js | "This combined Top 100 page matches search intent for both “Jamsil” and “Gangnam” apartment rankings.", | "This combined Top 100 page compares apartments in Songpa (including Jamsil) and Gangnam-gu in one ranking.", |
| pages/market/real-estate/songpa-gangnam-top100.js | "A combined landing page to match search intent for both “Jamsil” and “Gangnam” apartment rankings.", | "Compare Songpa-gu and Gangnam-gu using the same price metric. Seocho-gu is not included.", |
| pages/market/real-estate/songpa-top100.js | "‘송파(잠실) 아파트’ 검색 의도에 맞춘 고정 URL 랜딩페이지입니다.", | "송파구(잠실 포함) 아파트의 가격 수준을 대표가격과 거래량으로 비교할 수 있습니다.", |
| pages/market/real-estate/songpa-top100.js | "This is a fixed-URL Top 100 ranking for Songpa (including Jamsil) based on official transactions.", | "This is a Top 100 ranking for Songpa (including Jamsil) based on official transactions.", |
| pages/market/real-estate/songpa-top100.js | "A fixed-URL landing page for the query “Songpa/Jamsil apartment price ranking.”", | "Compare Songpa-gu apartment price levels, including Jamsil, alongside transaction counts.", |

표는 이번 애플리케이션 diff의 문구 변경 36개 hunk를 기록했다. EOF 줄바꿈만 달라진 hunk는 제외했다. source comment·식별자 `SEO` 및 developer-only metadata는 visible UI가 아니므로 유지했다.

## 15. Files Changed

### 이번 real-estate 작업

- `pages/market/real-estate.js`
- `pages/market/real-estate/seoul-top100.js`
- `pages/market/real-estate/gangnam-top100.js`
- `pages/market/real-estate/gangnam3-top100.js`
- `pages/market/real-estate/magok-top100.js`
- `pages/market/real-estate/mayongseong-top100.js`
- `pages/market/real-estate/songpa-top100.js`
- `pages/market/real-estate/songpa-gangnam-top100.js`
- `_components/RealEstateTop100Landing.js`
- `_components/RealEstateSeoLanding.js`
- `scripts/verify_naver_real_estate_dashboard_p1.js` (신규)
- 이 보고서 및 `reports/naver-real-estate-dashboard-p1-evidence-2026-09-15.json` (신규)
- `reports/naver-real-estate-p1-2026-09-15-screenshots/` PNG 6개 (신규)

공개 props와 재렌더 HTML은 `.next/real-estate-p1-*`에 임시 저장한다. 다음 clean build에서는 없어질 수 있으며 공개 URL 수집 단계로 재생성한다. route/schema/패키지/API/계산식 변경은 없다.

## 16. Protected Experiment Integrity

수정 전 baseline capture: `2026-09-15T07:02:13.097Z` (UTC), HEAD `4e9f987b9e5cafd4239d86fc75683f6334f990dc`.

| 보호 대상 | 작업 전 상태 | 작업 후 |
| --- | --- | --- |
| DSR/LTV / Home-buying / Mortgage / DCA / CAGR 페이지 | 기존 worktree 기준 | SHA-256 일치; 이번 추가 diff 0 |
| Compound 페이지 / CompoundForm / CompoundDetailSummary | 이전 실험의 미커밋 변경 있음 | 변경된 baseline 바이트 그대로; 이번 추가 diff 0 |
| DsrLtvCalculator / MortgageLoanCalculator 및 관련 Compound/DCA/CAGR component | 기존 worktree 기준 | SHA-256 일치 |
| SeoHead / ToolSeo / Header / Footer / _app / _document / next config | 기존 worktree 기준 | SHA-256 일치 |
| robots 및 public sitemap 6개 경로 | 기존 worktree 기준 | postbuild 후에도 SHA-256 일치 |
| 부동산 화면의 calculator CTA | 작업 전 source + 공개 렌더 anchor | 수정 후 렌더의 calculator href/anchor 배열 일치 |

baseline 파일명뿐 아니라 파일 내용을 해시로 비교했다. 보호 파일 44개 상세 해시는 증거 JSON에 있다. `git diff HEAD`에 이전 Compound 변경이 보이는 것은 이번 작업의 추가 변경이 아니다. 이전 Compound 보고서·검증 스크립트도 보존했다. 보호 파일을 HEAD로 되돌리거나 변경 사실을 허용 목록으로만 제외하지 않았다.

## 17. Verification

| 명령 / 점검 | 결과 | 해석 |
| --- | --- | --- |
| npm.cmd run build | PASS (최종 source 수정 후 실행, exit 0) | 223개 정적 페이지 생성 + SSR route 컴파일 + postbuild sitemap 생성 완료. |
| git diff --check | PASS | whitespace 오류 없음. Windows LF/CRLF 안내는 있음. |
| node --check scripts/verify_naver_real_estate_dashboard_p1.js | PASS | 검증 스크립트 문법 정상. |
| node scripts/verify_naver_real_estate_dashboard_p1.js --phase=production --base-url=https://www.finmaphub.com | PASS 19/19 | 프로덕션 실제 HTTP/head/본문 데이터 검증. 현재 배포본은 P1 반영 전. |
| node scripts/verify_naver_real_estate_dashboard_p1.js --phase=local --base-url=http://127.0.0.1:8013 | FAIL / ENVIRONMENT GAP | 정적 5개 HTTP 200, SSR 14개 HTTP 500; 로컬 DB ECONNREFUSED. 로컬 preview 서버는 검사 후 종료. |
| node scripts/verify_naver_real_estate_dashboard_p1.js --phase=render | PASS 19/19 | 최종 빌드 component + 공개 props 재렌더. 정적 5개는 빌드 HTML. DB/실시간 SQL 검증은 별도. |
| node scripts/verify_naver_real_estate_dashboard_p1.js --browser | PASS 6/6 | 1440×900 / 390×844, JS-off, CSS 로드·가로 overflow 검사 및 스크린샷 육안 검토. |
| node scripts/verify_naver_dsr_homebuying_intent_separation.js | PASS | 기존 DSR/Home-buying/Mortgage 구분 및 수치 snapshot 유지. |
| node scripts/verify_naver_compound_serp_competitiveness_p1.js | PASS | 이전 Compound P1 상태 및 보호 경로 유지. |
| 44개 파일 baseline SHA-256 / public sitemap | PASS | 추가 변경 0, 19개 고정 URL sitemap 누락 0. |
| 마곡 지역 데이터 범위 | KNOWN FAILURE | 기본 rendering PASS와 별개. 동 필터 누락은 미해결 기능 결함. |

기술 검증 범위는 H1 1개, title unique, self canonical, no noindex, OG/description 존재, SSR 실제 단지·가격·거래량 텍스트, 기준월 표시, dashboard CTA, visible 내부 SEO 문구 제거, dashboard 역할 문구, 보호 calculator href/anchor, baseline 파일 일치다. 지역별 통계의 의미적 정확성 전체를 PASS로 인증하지 않는다.

초기 터미널 외부 요청은 sandbox `EACCES`, 초기 headless Chrome 실행은 30초 timeout이 발생했다. 허용된 별도 실행에서 공개 URL 및 브라우저 검증을 완료했다. 감사 스크립트의 EN CTA 경로 판정과 재렌더 CSS asset prefix도 보정해 재검증했다. 애플리케이션 SEO/언어 경로 오류로 오인하지 않았다. build의 오래된 Browserslist DB 안내와 기존 계산기 script의 MODULE_TYPELESS_PACKAGE_JSON 경고는 실패를 유발하지 않았다. 별도 npm lint script는 없다.

재실행 순서:

```powershell
npm.cmd run build
node scripts/verify_naver_real_estate_dashboard_p1.js --phase=production --base-url=https://www.finmaphub.com
node scripts/verify_naver_real_estate_dashboard_p1.js
node scripts/verify_naver_real_estate_dashboard_p1.js --browser
git diff --check
```

기본 모드는 `render`다. baseline은 이번 작업 시작점이므로 재생성하지 않는다. 다른 작업의 baseline은 별도 감사 기록을 만든다. 네트워크/Chrome 및 기존 공개 props가 필요하다. DB 통합 확인은 동작하는 로컬 preview에서 `--phase=local`로 별도 수행한다.

## 18. Risks / P2 Architecture

1. **최우선: 마곡 범위 오류.** 실제 동명/코드/apt_key 매핑을 확인하고 마곡동 제한 조건을 적용할 별도 수정이 필요하다. 단순 명칭 변경으로 강서구 데이터를 마곡 데이터로 확정하면 안 된다.
2. **검색은 SSR, 탐색은 dashboard.** 전체 dashboard SSR rewrite보다 현재 SSR landing의 데이터 완결성·기준월·유효 범위부터 보장한다. 그 후 DB 부담·캐시·hydration 정합성을 평가해 dashboard의 소규모 초기 snapshot/summary 가능성을 검토한다.
3. **첫 화면 정보 우선순위.** 모바일 필터·실제 데이터를 더 앞에 배치할 후보를 비교한다. 현재 계산기 CTA 실험이 끝난 뒤 별도 소유권으로 검토한다.
4. **Guide vs data 링크 기대.** 시장정보 카드/일부 글의 guide anchor, 경기·인천 CTA의 지역 상태 전달을 검토한다. query×URL 성과를 확보한 뒤 URL 통합 필요성을 판단한다.
5. **월 집계 정합성.** 기준월 테이블과 지역/평형별 집계 완료월, multi-month median 근사 설명, 최근 계약일 timezone 표시를 점검한다. 이번에는 기간 label만 사실에 맞췄다.
6. 이번 변경을 실제 네이버 노출 회복의 충분조건으로 해석하지 않는다. 아직 배포·재수집·사후 관측을 수행하지 않았다. 프로그램매틱 page 대량 생성, 전역 SEO 변경, redirect/canonical/URL 개편은 시행하지 않았다.

## 19. Naver Baseline Data Gap

**NAVER_REAL_ESTATE_BASELINE_DATA_GAP: PARTIAL / SEPTEMBER COMPARISON MISSING**

저장소에 네이버 자료가 전혀 없는 것은 아니다. [2026-04-23~2026-07-19 URL Top30](search-performance-input/naver-pages-top30-2026-04-23_2026-07-19.csv)에서 다음 값을 확인했다. 파일의 집계기간/표기 값을 그대로 사용했다.

| URL | 클릭 | 노출 | CTR (%) |
| --- | --- | --- | --- |
| seoul-top100 | 43 | 2837 | 1.5 |
| magok-top100 | 40 | 1282 | 3.1 |
| songpa-top100 | 35 | 2302 | 1.5 |
| gangnam3-top100 | 31 | 471 | 6.6 |
| gangnam-top100 | 11 | 887 | 1.2 |
| gyeonggi-apartment-top100 | 5 | 206 | 2.4 |
| dashboard | 4 | 62 | 6.5 |
| seoul-apartment-top100 | 3 | 328 | 0.9 |

이 기간의 서울 SSR 43클릭 / 서울 guide 3클릭 / dashboard 4클릭은 SSR을 유입 우선 후보로 보는 판단과 부합한다. 노출량·지역수·검색수요가 다른 URL의 CTR을 단순 우열 지표로 해석하지 않는다. Top30에 없는 URL은 0클릭으로 간주하지 않는다.

부족한 자료: 2026-09 초 전후 동일 기간의 URL별 노출·클릭·query·순위, crawler/색인 상태, 실제 배포일, 재수집일. 기존 4~7월 집계만으로 9월 급락/회복 및 cannibalization의 인과관계를 확정할 수 없다. 임의 네이버 실적·순위를 생성하지 않았다.

## 20. Recommended Monitoring Set

| 군 | 모니터링 URL | 주요 기록 |
| --- | --- | --- |
| Exploration hub | /market/real-estate | 노출/클릭/CTR, organic 방문 후 지역 필터·단지 상세 이동; API 오류/데이터 공백 |
| Primary data landing | /market/real-estate/seoul-top100 | 서울 순위 query, SSR 행/기준월, dashboard·상세 이동 |
| Primary data landing | /market/real-estate/gangnam-top100 | 강남구 query와 3구 query의 URL 선택 |
| Primary data landing | /market/real-estate/gangnam3-top100 | 3구 비교 query, 개별 구/합본과 중복 노출 |
| Conditional data landing | /market/real-estate/magok-top100 | scope 수정 전후 동 구성·표본·query/CTR, 마곡동 이외 데이터 유무 |
| Primary data landing | /market/real-estate/mayongseong-top100 | 마용성 권역 query와 성수동 전용 기대 차이 |
| Primary data landing | /market/real-estate/songpa-top100 | 송파/잠실 query와 지역 범위 |
| Comparison landing | /market/real-estate/songpa-gangnam-top100 | 두 구 비교 query와 3구/개별 구의 교대 노출 |
| Guide control | /market/real-estate/seoul-apartment-top100 | 보는 법/지표 해석 query, seoul-top100과 동일 query 동시 노출 |
| Guide control | /market/real-estate/gyeonggi-apartment-top100 | 해석 query, dashboard 이탈·지역 선택 |
| Guide control | /market/real-estate/incheon-apartment-top100 | 해석 query, 실제 순위표 기대와 click-through |

배포일·재수집일·실제 데이터월을 구분해 기록하고, 가능한 범위에서 배포 전후 동요일 14일/28일을 비교한다. 네이버 Search Advisor에서 제공하는 실제 차원과 수집 범위를 먼저 확인한다. 없는 세부 지표를 만들어내지 않는다. 기존 DSR/Home-buying/Mortgage/Compound/DCA/CAGR은 이번 부동산 변경과 별도 control cohort로 유지한다.

**Final Verdict: ROOT_CAUSE_FOUND_MORE_WORK_REQUIRED**
