# Search Performance Input

FinMap P1-1A 검색 성과 병합용 입력 폴더입니다.

## 권장 집계 기간

- 2026-04-23 ~ 2026-07-21
- 90일 export가 어렵다면 최근 28~30일 데이터도 허용합니다.
- 파일별 실제 export 기간은 파일명 또는 Date 컬럼으로 기록됩니다.

## 권장 파일명

- `gsc-pages-2026-04-23_2026-07-21.csv`
- `gsc-queries-2026-04-23_2026-07-21.csv`
- `gsc-page-query-2026-04-23_2026-07-21.csv`
- `naver-pages-2026-04-23_2026-07-21.csv`
- `naver-queries-2026-04-23_2026-07-21.csv`
- `bing-pages-2026-04-23_2026-07-21.csv`
- `bing-queries-2026-04-23_2026-07-21.csv`

## 허용 컬럼

- URL/Page: `Page`, `Pages`, `URL`, `Landing page`, `페이지`, `인기 페이지`, `노출 페이지`
- Query: `Query`, `Queries`, `Keyword`, `Search keyword`, `검색어`, `검색 키워드`, `인기 검색어`
- Clicks: `Clicks`, `클릭`, `클릭수`, `클릭 수`
- Impressions: `Impressions`, `노출`, `노출수`, `노출 수`
- CTR: `CTR`, `Click-through rate`, `클릭률`, `평균 CTR`
- Position: `Position`, `Average position`, `Avg. position`, `평균 게재순위`, `평균 순위`, `순위`
- Date: `Date`, `날짜`

## 실행

```powershell
node scripts\analyze_search_performance_inputs.js
```

템플릿 파일은 구조 안내용입니다. 실제 export CSV를 같은 폴더에 넣고 다시 실행하면 병합 CSV, query map, priority JSON, 감사 보고서가 생성됩니다.
