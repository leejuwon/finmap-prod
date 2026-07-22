# FinMap 검색 유입 90일 P1-1A 데이터 준비도 보고서

- 기준일: 2026-07-22
- 상태: DATA_NOT_AVAILABLE
- 작업 범위: 검색 성과 CSV 입력 구조 준비 및 검증

## 1. Executive Summary

`reports/search-performance-input/`에 실제 GSC, Naver Search Advisor, Bing Webmaster Tools export CSV가 없어 URL 우선순위 분석은 수행하지 않았습니다.

이번 단계에서는 숫자를 임의로 만들지 않고, 다음 실행을 위한 입력 폴더, README, CSV 템플릿, 분석 스크립트만 준비했습니다.

## 2. 현재 기준선

- URL inventory: `reports/search-growth-90d-url-inventory.csv`
- inventory URL 수: 192
- linkcheck: broken 0, suspicious 0, self URL missing 0
- P0-2A: 조회수/댓글/공유 UI data-nosnippet 처리 완료 상태
- P0-2B: 내부 링크 registry 정합성 PASS 상태

## 3. 생성된 입력 구조

- `reports/search-performance-input/README.md`
- `reports/search-performance-input/gsc-pages-template.csv`
- `reports/search-performance-input/gsc-queries-template.csv`
- `reports/search-performance-input/naver-pages-template.csv`
- `reports/search-performance-input/naver-queries-template.csv`
- `reports/search-performance-input/bing-pages-template.csv`
- `reports/search-performance-input/bing-queries-template.csv`

## 4. 필요한 실제 export 파일

- Google Search Console: pages, queries, 가능하면 page-query CSV
- Naver Search Advisor: pages, queries CSV
- Bing Webmaster Tools: pages, queries CSV

권장 기간은 `2026-04-23`부터 `2026-07-21`까지입니다. 90일 export가 어렵다면 최근 28~30일도 허용하지만, 실제 기간을 파일명 또는 Date 컬럼으로 남겨야 합니다.

## 5. 이번 단계에서 하지 않은 것

- URL 우선순위 확정
- CTR 개선 후보 확정
- 검색어별 대표 URL 확정
- title/description/H1/본문 수정
- 내부 링크 추가/삭제
- 계산기, GA4, 광고, canonical, hreflang, sitemap 정책 변경

## 6. 다시 실행하는 방법

```powershell
node scripts\analyze_search_performance_inputs.js
```

실제 CSV가 들어오면 다음 산출물이 생성됩니다.

- `reports/search-growth-90d-p1-1a-performance-merged.csv`
- `reports/search-growth-90d-p1-1a-query-map.csv`
- `reports/search-growth-90d-p1-1a-priority.json`
- `reports/search-growth-90d-p1-1a-search-performance-audit.md`

## 7. 검증 결과

- `node scripts\analyze_search_performance_inputs.js`: PASS, DATA_NOT_AVAILABLE로 정상 종료
- `node --check scripts\analyze_search_performance_inputs.js`: PASS
- `npm.cmd run check:posts-links`: PASS, broken 0 / suspicious 0 / self URL missing 0
- `npm.cmd run build`: PASS, Next.js build 및 sitemap postbuild 완료
- `node scripts\audit_search_growth_baseline.js`: PASS, inventory 192 URL 재확인
- `git diff --check`: PASS, 공백 오류 없음 / CRLF 정규화 경고만 표시
- `git status --short --untracked-files=all`: 확인 완료, P0-1/P0-2A/P0-2B 작업 파일과 P1-1A 신규 파일이 같은 워크트리에 존재

## 8. P1-1B 진행 조건

현재는 실제 검색 성과 CSV가 없으므로 P1-1B 최우선 수정 URL 10개를 확정하지 않았습니다. GSC/Naver/Bing export CSV를 `reports/search-performance-input/`에 넣은 뒤 같은 스크립트를 다시 실행하면 병합 CSV, query map, priority JSON, 검색 성과 감사 보고서가 생성됩니다.
