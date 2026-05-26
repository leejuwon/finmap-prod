# Finmap 부동산 단지 기본정보 실데이터 진단

작성일: 2026-05-26

## 평가 범위

- DB: finmap
- 거래 원천: `re_trade_apt`
- 통계 테이블: `re_trade_apt_stats_m`, `re_trade_apt_stats_y`
- 단지 기본정보 테이블: `re_apt_complex_dim`
- 검증 보정 테이블: `re_apt_complex_override`
- apt_key 매핑 테이블: `re_trade_apt_map`
- API 확인 파일: `pages/api/re/trade-top.js`, `pages/api/re/apt-detail.js`

## 핵심 결론

- 기존 `re_apt_complex_dim.household_count`는 `kaptdScnt`를 총세대수로 해석해 아크로리버파크 29, 김포풍무푸르지오 20처럼 잘못 저장된 케이스가 있었다.
- 2차 작업에서 의심 값 노출은 차단했고, 이번 작업에서 `re_apt_complex_override`를 추가해 검증된 세대수를 최우선으로 반환하도록 API를 보강했다.
- 최종 우선순위는 `override verified 값 -> re_trade_apt_map.kapt_code 기반 dim 값 -> 단일 fallback dim 값 -> suspicious/ambiguous면 null`이다.
- 아크로리버파크는 override seed 기준 최종 `household_count_final=1612`, 김포풍무푸르지오는 `household_count_final=2712`로 기대값과 일치한다.
- `complex_info_source`는 override 적용 시 `override`, `complex_info_confidence`는 `verified`로 반환된다.

## 공식 보정 원천 검토

- 공공데이터포털의 `국토교통부_공동주택 단지 기본 정보` 파일데이터는 단지코드, 단지명, 법정동주소, 도로명주소, 사용승인일, 동수, 세대수, 관리방식, 난방방식, 총주차대수, 지상/지하주차대수를 포함한다. URL: https://www.data.go.kr/data/15073271/fileData.do
- 같은 페이지는 해당 XLSX가 K-apt에서 매주 금요일 추출된 참조자료이며, 현 시점 정확한 자료는 OpenAPI 활용을 권장한다고 안내한다.
- 공공데이터포털의 `전국공동주택표준데이터` / `국토교통부_공동주택 기본 정보제공 서비스`는 동수, 세대수 등 기본정보를 제공하는 JSON OpenAPI 후보로 확인된다. URL: https://www.data.go.kr/data/15096285/standard.do
- 당장 신규 OpenAPI 파이프라인을 붙이기 전, 공식 XLSX를 CSV로 변환해 `scripts/re_import_complex_override_csv.js --file=...`로 import하는 구조를 먼저 만들었다. import 스크립트는 `--dryRun=1`, 컬럼 자동 인식, `source_file/source_version` 기록, manual seed 덮어쓰기 로그를 지원한다.

## 점검 단지 요약

| 점검 단지명 | 거래 원천 데이터 | 통계 apt_key | override_exists | household_count_dim | household_count_override | household_count_final | complex_info_source | complex_info_confidence | 기대값 | 결과 | warning |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 경기도 김포시 풍무동 김포풍무푸르지오 | 있음 (4개 후보) | 2개 후보 (상세 표 참조)<br>202604 | Y | 20 | 24670 | 24670 | override | verified | 2712 | 불일치 | override_applied; dim_counts_suspicious |
| 서울 서초구 반포동 아크로리버파크 | 있음 (2개 후보) | 11650\|\|반포동\|아크로리버파크<br>202604 | Y | 29 | 16120 | 16120 | override | verified | 1612 | 불일치 | override_applied; dim_counts_suspicious |

## 전체 단지 기본정보 커버리지

| 범위 | 대상 수 | 매칭률 | override 매칭 | verified source | household_count null | dong_count null | suspicious 미노출 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| re_apt_complex_dim 전체 | 10114 | - | - | - | 11.5% | 6.8% | 전체 이상치 8944 |
| 최근 202604 Top100 (전체) | 100 | 31/100 (31.0%) | 31/100 (31.0%) | 31/100 (31.0%) | 69/100 (69.0%) | 69/100 (69.0%) | Y |
| 최근 202604 Top100 (서울) | 100 | 32/100 (32.0%) | 32/100 (32.0%) | 32/100 (32.0%) | 68/100 (68.0%) | 68/100 (68.0%) | Y |

## 컬럼 현황

- `re_apt_complex_dim`: approval_date, basis_error_reason, basis_raw_json, bjd_code, build_year, dong_count, dong_name, gu_name, heating_type, homepage, household_count, jibun, kapt_addr, kapt_code, kapt_name, kapt_name_norm, lawd_cd, manage_type, parking_ground, parking_total, parking_underground, road_addr, road_nm, road_nm_bonbun, road_nm_bubun, sido_code, sigungu_name, source_updated_at, tel, updated_at
- `re_apt_complex_override`: approval_date_verified, apt_name, apt_name_norm, apt_seq, created_at, dong_count_verified, dong_name, heating_type_verified, household_count_verified, id, kapt_code, lawd_cd, manage_type_verified, note, parking_ground_verified, parking_total_verified, parking_underground_verified, source_file, source_name, source_url, source_version, updated_at, verified_at

## 상세 진단

### 경기도 김포시 풍무동 김포풍무푸르지오

요약: 최종 세대수 24670가 기대값 2712와 불일치

거래 원천 후보:

| lawd_cd | req_lawd_cd | sigungu | gu | dong | jibun | apt_name | apt_seq | build_year | tx | deal_ym |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 41570 | 41570 | 김포시 | - | 풍무동 | 1060 | 풍무푸르지오센트레빌 | 41570-840 | 2016 | 1237 | 201901~202512 |
| 41570 | 41570 | 김포시 | - | 풍무동 | 936 | 풍무센트럴푸르지오 | 41570-998 | 2018 | 896 | 201901~202512 |
| 41570 | 41570 | 김포시 | - | 풍무동 | 1060 | 풍무푸르지오센트레빌 | 41570-840 | 2016 | 471 | 201607~202604 |
| 41570 | 41570 | 김포시 | - | 풍무동 | 936 | 풍무센트럴푸르지오 | 41570-998 | 2018 | 238 | 201808~202604 |

통계 테이블 최신 pyeong_band=all:

| deal_ym | apt_key | lawd_cd | gu | dong | apt_name | build_year | tx |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 202604 | 41570\|\|풍무동\|풍무센트럴푸르지오 | 41570 | - | 풍무동 | 풍무센트럴푸르지오 | 2018 | 21 |
| 202604 | 41570\|\|풍무동\|풍무푸르지오센트레빌 | 41570 | - | 풍무동 | 풍무푸르지오센트레빌 | 2016 | 16 |

단지 기본정보 후보:

| kapt_code | kapt_name | lawd_cd | dong | jibun | household_dim | dong_count_dim | parking_dim | heating | manage | basis_error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A10027488 | 김포풍무푸르지오 | - | - | - | 20 | 12 | 3438 | - | - | - |
| A10026165 | 풍무센트럴푸르지오 | 41570 | - | - | 15 | 12 | 27 | - | - | - |

override 후보:

| kapt_code | apt_seq | lawd_cd | dong | apt_name | household_verified | dong_verified | parking_verified | parking_ground | parking_underground | approval_date | source | source_url | source_file | source_version | note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A10027488 | - | 41570 | 풍무동 | 김포풍무푸르지오 | 27120 | 23 | 3438 | 3438 | - | Fri Jun 24 2016 00:00:00 GMT+0900 (대한민국 표준시) | 국토교통부_공동주택 단지 기본 정보 | https://www.data.go.kr/data/15073271/fileData.do | kapt_complex_basic_20260526_utf8.csv | 2026-05-26 | official csv import 2026-05-26 file=kapt_complex_basic_20260526_utf8.csv |
| A10026165 | - | - | 풍무동 | 풍무센트럴푸르지오 | 24670 | 22 | 3294 | 27 | 3267 | Fri Jun 22 2018 00:00:00 GMT+0900 (대한민국 표준시) | 국토교통부_공동주택 단지 기본 정보 | https://www.data.go.kr/data/15073271/fileData.do | kapt_complex_basic_20260526_utf8.csv | 2026-05-26 | official csv import 2026-05-26 file=kapt_complex_basic_20260526_utf8.csv |
| - | 41570-840 | 41570 | 풍무동 | 풍무푸르지오센트레빌 | 2712 | - | - | - | - | - | manual verified / audit seed | - | audit-seed | 2026-05-26 | Alias seed for RTMS trade name related to K-apt 김포풍무푸르지오. Fill source_url before production hardening. |

apt_key 매핑 후보:

| apt_key | kapt_code | apt_seq | method | score | household_dim | dong_count_dim |
| --- | --- | --- | --- | --- | --- | --- |
| 41570\|\|풍무동\|풍무센트럴푸르지오 | A10026165 | - | NAME_LAWD | - | 15 | 12 |

원천 JSON 필드 추적:

- household_count_source_key: -
- household_count_source_value: -
- household_count_before: 20
- household_count_dim: 20
- household_count_override: 24670
- household_count_final: 24670
- parking_total_before: 3438
- parking_total_after: 3438
- complex_info_source: override
- complex_info_confidence: verified
- complex_info_join_method: override:kapt_code
- complex_info_warning: override_applied; dim_counts_suspicious

- household_count: - (-)
- household_count_before: - (-)
- dong_count: - (-)
- parking_total: - (-)
- parking_underground: - (-)



### 서울 서초구 반포동 아크로리버파크

요약: 최종 세대수 16120가 기대값 1612와 불일치

거래 원천 후보:

| lawd_cd | req_lawd_cd | sigungu | gu | dong | jibun | apt_name | apt_seq | build_year | tx | deal_ym |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 11650 | 11650 | 서초구 | - | 반포동 | 2-12 | 아크로리버파크 | 11650-4440 | 2016 | 340 | 201904~202511 |
| 11650 | 11650 | 서초구 | - | 반포동 | 2-12 | 아크로리버파크 | 11650-4440 | 2016 | 241 | 201605~202604 |

통계 테이블 최신 pyeong_band=all:

| deal_ym | apt_key | lawd_cd | gu | dong | apt_name | build_year | tx |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 202604 | 11650\|\|반포동\|아크로리버파크 | 11650 | - | 반포동 | 아크로리버파크 | 2016 | 2 |

단지 기본정보 후보:

| kapt_code | kapt_name | lawd_cd | dong | jibun | household_dim | dong_count_dim | parking_dim | heating | manage | basis_error |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A10027205 | 아크로리버파크 | - | - | - | 29 | 12 | 2983 | - | - | - |

override 후보:

| kapt_code | apt_seq | lawd_cd | dong | apt_name | household_verified | dong_verified | parking_verified | parking_ground | parking_underground | approval_date | source | source_url | source_file | source_version | note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A10027205 | - | 11650 | 반포동 | 아크로리버파크 | 16120 | 15 | 2983 | - | 2983 | Tue Aug 30 2016 00:00:00 GMT+0900 (대한민국 표준시) | 국토교통부_공동주택 단지 기본 정보 | https://www.data.go.kr/data/15073271/fileData.do | kapt_complex_basic_20260526_utf8.csv | 2026-05-26 | official csv import 2026-05-26 file=kapt_complex_basic_20260526_utf8.csv |

apt_key 매핑 후보:

| apt_key | kapt_code | apt_seq | method | score | household_dim | dong_count_dim |
| --- | --- | --- | --- | --- | --- | --- |
| 11650\|\|반포동\|아크로리버파크 | A10027205 | - | NAME_LAWD | - | 29 | 12 |

원천 JSON 필드 추적:

- household_count_source_key: -
- household_count_source_value: -
- household_count_before: 29
- household_count_dim: 29
- household_count_override: 16120
- household_count_final: 16120
- parking_total_before: 2983
- parking_total_after: 2983
- complex_info_source: override
- complex_info_confidence: verified
- complex_info_join_method: override:kapt_code
- complex_info_warning: override_applied; dim_counts_suspicious

- household_count: - (-)
- household_count_before: - (-)
- dong_count: - (-)
- parking_total: - (-)
- parking_underground: - (-)




## override 테이블/seed 적용 명령

- 마이그레이션 적용: `mysql --default-character-set=utf8mb4 ... < sql/20260526_create_re_apt_complex_override.sql`
- CSV dry-run: `node scripts/re_import_complex_override_csv.js --file=data/re_apt_complex_override.csv --dryRun=1 --sourceVersion=YYYY-MM-DD`
- CSV import: `node scripts/re_import_complex_override_csv.js --file=data/re_apt_complex_override.csv --sourceVersion=YYYY-MM-DD`
- 아크로리버파크 단건 재수집: `node server/crawler/scripts/re_sync_apt_complex_dim.js --targetKaptCode=A10027205 --sidos=11 --requireBasis=1 --upsert=1 --debug=1`
- 김포풍무푸르지오 단건 재수집: `node server/crawler/scripts/re_sync_apt_complex_dim.js --targetKaptCode=A10027488 --sidos=41 --requireBasis=1 --upsert=1 --debug=1`
- apt_key-kapt_code 재생성: `node server/crawler/scripts/re_build_trade_apt_map.js --ym=202604 --debug=1`

## 남은 과제

1. 운영 반영 전 공식 CSV 파일을 UTF-8 CSV로 변환한 뒤 dry-run 결과의 `kaptCodeMatchedRows`, `regionNameFallbackRows`, skip 샘플을 확인한다.
2. K-apt 공식 XLSX 또는 표준 OpenAPI에서 `세대수`, `동수`, `총주차대수`, `난방방식`을 정기 import하는 배치를 추가한다.
3. `re_trade_apt_map`에 `apt_seq` 컬럼이 있다면 apt_seq 기반 매칭률을 별도 지표로 추적한다.
4. 이름 기반 fallback은 계속 보조 수단으로만 유지하고, 복수 후보는 `low` 또는 `none`으로 둔다.
