# 네이버 복리 계산기 5페이지 진입 준비 감사

## 현재 목표

네이버에서 `복리 계산기`, `월복리 계산기`, `적립식 복리 계산기` 등 핵심 키워드가 5페이지 안에 진입할 수 있도록, 현재 FinMap 계산기/브릿지/내부링크/RSS/sitemap 준비 상태를 점검한다. 이번 감사는 코드와 기존 콘텐츠를 수정하지 않고 readiness와 외부 발행 초안만 정리한다.

## 현재 상태

- Google: 복리 계산 4페이지권 노출 확인
- GSC: /tools/compound-interest 최근 7일 노출 362 / 클릭 1
- Naver: 핵심 키워드 5페이지 안 진입 여부는 수동 확인 필요

## 네이버 5페이지 진입 조건

- 5페이지 밖/미노출: P0 개선 대상
- 4~5페이지: 후보 진입 초기, 내부링크와 외부 언급 강화
- 2~3페이지: 스니펫/외부링크 강화
- 1페이지: CTR 유지와 title/description 과잉 수정 방지

## 계산기 Readiness

| Check | Status | Detail |
| --- | --- | --- |
| tool in sitemap-ko.xml | PASS | https://www.finmaphub.com/tools/compound-interest |
| tool in main sitemap | PASS | main sitemap source includes tool |
| robots not blocking tool | PASS | not blocked |
| canonical self source | PASS | SeoHead url="/tools/compound-interest" |
| noindex absent | PASS | no noindex marker in page source |
| title includes 복리 계산기 | PASS | 복리 계산기 | 월복리·적립식... |
| description intent terms | PASS | 월복리, 적립식, 미래가치, 세금, 수수료 |
| H1 includes 복리 계산기 | PASS | H1 source contains 복리 계산기 |
| top purpose copy before input | PASS | purpose copy appears before CompoundForm |
| input form marker near top | PASS | CompoundForm + compound-calculate |
| FAQ/intent coverage | PASS | 복리 계산기, 월복리, 적립식, 세금, 수수료, 복리 계산 공식, 복리 이자 계산기 |
| GA4 event strings maintained | PASS | calculate/quick/frequency/contribution/CTA events found |

## 브릿지 콘텐츠 Readiness

| Check | Status | Detail |
| --- | --- | --- |
| bridge post exists | PASS | compound-calculator-guide.md |
| bridge link in top 400 chars | PASS | tool link appears in first 400 normalized chars |
| bridge in sitemap-ko.xml | PASS | present |
| bridge noindex absent | PASS | indexable frontmatter |

## 대상 URL 수집/색인 상태

| URL | File exists | Sitemap | Robots | Noindex |
| --- | --- | --- | --- | --- |
| /tools/compound-interest | PASS | PASS | PASS | PASS |
| /posts/personalFinance/compound-calculator-guide | PASS | PASS | PASS | PASS |
| /posts/personalFinance/simple-vs-compound | PASS | PASS | PASS | PASS |
| /posts/personalFinance/annual-vs-monthly-compound | PASS | PASS | PASS | PASS |
| /posts/personalFinance/monthly-dca-10-year-result | PASS | PASS | PASS | PASS |
| /posts/personalFinance/how-much-per-month-for-100m | PASS | PASS | PASS | PASS |
| /posts/personalFinance/goal-amount-fast-strategy | PASS | PASS | PASS | PASS |
| /posts/personalFinance/what-is-cagr | PASS | PASS | PASS | PASS |

## 내부링크/앵커 분포

| Anchor class | Count |
| --- | ---: |
| exact | 12 |
| variant | 46 |
| generic | 0 |
| other | 0 |

| Anchor variant | Count |
| --- | ---: |
| 복리 계산기 | 57 |
| 월복리 계산기 | 2 |
| 적립식 복리 계산기 | 1 |
| 복리 계산 공식 | 1 |
| 투자 복리 계산기 | 4 |

| Cluster URL | Link to calculator | Count | Anchors |
| --- | --- | ---: | --- |
| /posts/personalFinance/annual-vs-monthly-compound | PASS | 2 | 복리 계산 공식과 월복리 결과 비교하기, 월복리 계산기로 저축·투자 기간별 미래가치 계산하기 |
| /posts/personalFinance/compound-calculator-guide | PASS | 2 | 복리 계산기, 월복리 계산기 |
| /posts/personalFinance/goal-amount-fast-strategy | PASS | 1 | 복리 계산기 |
| /posts/personalFinance/how-much-per-month-for-100m | PASS | 2 | 복리 계산기, 투자 복리 계산기 |
| /posts/personalFinance/monthly-dca-10-year-result | PASS | 2 | 적립식 복리 계산기, 복리 계산기 |
| /posts/personalFinance/simple-vs-compound | PASS | 2 | 투자 복리 계산기로 기간별 미래가치 계산하기, 복리 계산기 |
| /posts/personalFinance/what-is-cagr | PASS | 1 | 복리 계산기로 저축·투자 기간별 미래가치 계산하기 |

## RSS / Sitemap / Robots

- `sitemap-ko.xml`: /tools/compound-interest 포함 확인
- `robots.txt`: 수집 차단 경로와 충돌 없음
- `robots.txt` sitemap 선언: https://www.finmaphub.com/sitemap.xml, https://www.finmaphub.com/sitemap-ko.xml
- `rss.xml`: KO 최신 글 50개 후보 기준 점검

| RSS core path | Included in latest KO RSS candidates |
| --- | --- |
| /posts/personalFinance/compound-calculator-guide | PASS |
| /posts/personalFinance/simple-vs-compound | PASS |
| /posts/personalFinance/annual-vs-monthly-compound | PASS |
| /posts/personalFinance/monthly-dca-10-year-result | PASS |

## 발견 Gap

- 핵심 수집/색인/내부링크 회귀는 확인되지 않음
- 네이버 실제 5페이지 안 진입 여부는 Codex가 임의로 판단하지 않고 수동 SERP 체크 템플릿에 기록해야 함

## 다음 작업 우선순위

| Priority | Action | Reason |
| --- | --- | --- |
| P0 | 네이버 수동 순위 체크 템플릿 작성 및 실제 순위 입력 | Codex는 네이버 SERP 결과를 임의 생성하지 않음 |
| P0 | 네이버 블로그/Tistory 외부 초안 별도 문장으로 발행 검토 | 계산기 키워드 외부 언급과 자연 링크 확보 |
| P1 | WARN 항목이 있으면 FAQ/앵커/브릿지 링크 위치를 별도 작업으로 검토 | 이번 작업은 감사/초안 생성만 수행 |
| P2 | 순위 2~3페이지 진입 후 스니펫/CTR 개선 여부 재점검 | title/description 과잉 수정 방지 |

## 외부 발행 주의사항

- 네이버 블로그와 Tistory에 같은 문장을 복사하지 않는다.
- 링크를 과도하게 넣지 않는다.
- 모든 앵커를 `복리 계산기`로 반복하지 않는다.
- 외부 글 자체가 독립적으로 가치 있어야 한다.
- `1위 보장`, `수익 보장` 같은 표현을 쓰지 않는다.
- 이미지는 선택 사항이지만 표나 계산 예시는 유용하다.

## 검증 결과

| Command | Result |
| --- | --- |
| node --check scripts\audit_naver_compound_top5_readiness.js | PASS |
| node scripts\audit_naver_compound_top5_readiness.js | PASS, critical failures 0 |
| npm.cmd run build | PASS, 215/215 pages |
| node scripts\verify_seo_channel_split.js --local-server | PASS, main 205 / KO 107 / EN 98 / en sitemap 98 |
| node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/tools/compound-interest https://www.finmaphub.com/posts/personalFinance/compound-calculator-guide | PASS |
| git diff --check | PASS |

## 최종 판정

PASS - 네이버 복리 계산기 5페이지 진입 준비 감사 완료
