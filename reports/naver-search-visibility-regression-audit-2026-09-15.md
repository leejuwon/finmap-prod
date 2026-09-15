# FinMap Naver Search Visibility Regression Audit - 2026-09-15

## 1. Final Verdict

**ANALYSIS_COMPLETE_WITH_EXTERNAL_RANKING_GAP**

소스, 빌드 산출물, 프로덕션 응답, robots, sitemap, canonical, hreflang, JSON-LD, 핵심 SEO 검증 스크립트 기준으로는 **2026년 9월 초 네이버 검색 노출 하락을 설명할 명확한 기술적 회귀를 찾지 못했다.**

다만 페이지 레벨 데이터상 손실은 특정 도구군에 집중되어 있고, 특히 `DSR/LTV 계산기`와 `아파트 구매 계산기`는 같은 계산 컴포넌트를 공유하면서 화면 본문, 결과 문구, 내부 링크 앵커의 검색 의도가 많이 겹친다. 이는 기술적 색인 장애라기보다 **네이버 쪽 랭킹 재평가, 검색 의도 재분류, 페이지 간 키워드 카니발라이제이션 가능성**으로 보는 것이 더 타당하다.

안전한 기술 수정은 적용하지 않았다. 현 단계에서 제목, H1, 본문, FAQ, 내부 링크를 대규모로 바꾸면 P0 실험과 기존 정상 페이지까지 흔들 수 있어 감사 우선 원칙을 유지했다.

## 2. Timeline

| Date | Event |
| --- | --- |
| 2026-08-25 ~ 2026-09-10 | Git 배포 이력과 주요 SEO/도구 페이지 변경 범위 점검 |
| 2026-09-03 | `d8037a4` - CAGR, Compound, DCA 계산기 일부 SEO/본문 보강 |
| 2026-09-03 | `ed06d22` - Compound 관련 내부 링크/콘텐츠 보강 |
| 2026-09 초 | 사용자 관측상 FinMap 네이버 검색 노출 하락 시작 |
| 2026-09-14 | 최근 30일 기준 Search Advisor 지표 하락 확인 |
| 2026-09-15 | 로컬 빌드, 프로덕션 URL, sitemap, robots, 핵심 SEO 스크립트 재검증 |

감사 범위에서 `DSR/LTV 계산기`, `주담대 원리금 계산기`, `아파트 구매 계산기` 자체를 변경한 커밋은 2026-08-25 ~ 2026-09-10 구간에 확인되지 않았다.

## 3. Search Data Baseline

사용자 제공 기준값:

| Metric | Earlier 30-day view | Later 30-day view | Change |
| --- | ---: | ---: | ---: |
| Clicks | 약 420 | 약 320 | 약 -23.8% |
| Impressions | 약 88,000 | 약 62,000 | 약 -29.5% |
| CTR | 0.5% | 0.5% | 유지 |

최근 7일 기준:

| Metric | Current |
| --- | ---: |
| Clicks | 47 |
| Impressions | 약 3,900 |
| CTR | 1.2% |
| Click change | -11.3% |
| Impression change | -66% |

해석:

- CTR 자체가 무너지지 않았고 impression이 크게 줄었다.
- 이는 페이지가 클릭 매력을 잃었다기보다, 네이버 검색 결과에서 노출 위치 또는 노출 쿼리 폭이 줄었을 가능성이 더 크다.
- 최근 7일의 CTR 상승은 낮은 노출수 안에서 상대적으로 더 강한 쿼리만 남았을 때도 나타날 수 있다.

## 4. Page-level Loss Attribution

사용자 제공 페이지별 노출 변화:

| Page | Previous impressions | Current impressions | Delta | Loss share |
| --- | ---: | ---: | ---: | ---: |
| `/tools/dsr-ltv-calculator` | 49,344 | 33,225 | -16,119 | 62.8% |
| `/tools/mortgage-loan-calculator` | 14,888 | 15,656 | +768 | offset |
| `/tools/compound-interest` | 12,724 | 7,149 | -5,575 | 21.7% |
| `/tools/home-buying-budget-calculator` | 3,696 | 882 | -2,814 | 11.0% |
| `/tools/cagr-calculator` | 4,159 | 2,228 | -1,931 | 7.5% |
| Top 5 total | 84,811 | 59,140 | -25,671 | 100% |

Manual Naver SERP observations from user:

| Query/Page family | Observation |
| --- | --- |
| DSR/LTV | 1페이지에서 3페이지로 하락 |
| Mortgage | 1페이지 유지 |
| Compound | 3페이지 수준 |
| Home-buying | 큰 폭 하락 |
| CAGR | 3페이지 수준 |
| DCA | 현재 1페이지, 최근 P0 효과 긍정적 |
| FIRE / Goal | 핵심 쿼리 10페이지 내 확인 어려움 |

귀속 판단:

- Top 5 노출 감소의 약 63%가 DSR/LTV 단일 페이지에서 발생했다.
- Mortgage는 동일 시기 오히려 소폭 증가했으므로 사이트 전체 기술 장애 가능성을 낮춘다.
- DSR/LTV와 Home-buying이 동시에 크게 약해진 점은 두 페이지의 의도 겹침 또는 네이버의 대출/주택 구매성 쿼리 재평가 가능성을 키운다.
- Compound/CAGR 손실은 2026-09-03 P0 변경 대상과 겹치지만, DCA가 긍정적이고 DSR/LTV는 변경 대상이 아니었으므로 P0 전체 실패로 보기 어렵다.

## 5. Deploy History

검토 명령:

```powershell
git log --since="2026-08-25" --until="2026-09-10 23:59" --date=short --pretty=format:"%h %ad %s"
```

결과:

| Commit | Date | Subject | Audit finding |
| --- | --- | --- | --- |
| `ed06d22` | 2026-09-03 | `Update: 사이트 금융도구 수정2` | Compound 관련 보강 중심 |
| `d8037a4` | 2026-09-03 | `Update: 사이트 금융도구 수정1` | CAGR, Compound, DCA 페이지 보강 |

주요 파일 범위:

| Commit | Touched target files |
| --- | --- |
| `d8037a4` | `pages/tools/cagr-calculator.js`, `pages/tools/compound-interest.js`, `pages/tools/dca-calculator.js`, 관련 검증 리포트/스크립트 |
| `ed06d22` | `pages/tools/compound-interest.js`, Compound 관련 포스트/이미지/스크립트 |

감사 결론:

- 2026-08-25 ~ 2026-09-10 구간에 `pages/_app.js`, `_components/SeoHead.js`, `next.config.js`, `next-sitemap.config.js`, `public/robots.txt` 등 사이트 공통 SEO/라우팅 파일의 관련 변경은 확인되지 않았다.
- 같은 구간에 `pages/tools/dsr-ltv-calculator.js`, `pages/tools/mortgage-loan-calculator.js`, `pages/tools/home-buying-budget-calculator.js`, `_components/DsrLtvCalculator.js`, `_components/MortgageLoanCalculator.js` 변경도 확인되지 않았다.
- 따라서 DSR/LTV 하락을 특정 배포의 직접적인 코드 회귀로 연결할 증거는 현재 없다.

## 6. Sitewide Technical Audit

프로덕션 핵심 URL 감사:

| URL | Status | Canonical | Sitemap | H1 | Main finding |
| --- | ---: | --- | --- | ---: | --- |
| `/tools/dsr-ltv-calculator` | 200 | self | yes | 1 | title, description, hreflang, body 정상 |
| `/tools/mortgage-loan-calculator` | 200 | self | yes | 1 | title, description, hreflang, body 정상 |
| `/tools/home-buying-budget-calculator` | 200 | self | yes | 1 | title, description, hreflang, body 정상 |
| `/tools/compound-interest` | 200 | self | yes | 1 | title, description, hreflang, body 정상 |
| `/tools/cagr-calculator` | 200 | self | yes | 1 | title, description, hreflang, body 정상 |
| `/tools/dca-calculator` | 200 | self | yes | 1 | title, description, hreflang, body 정상 |
| `/tools/fire-calculator` | 200 | self | yes | 1 | title, description, hreflang, body 정상 |
| `/tools/goal-simulator` | 200 | self | yes | 1 | title, description, hreflang, body 정상 |

프로덕션 robots.txt:

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /cdn-cgi/

Sitemap: https://www.finmaphub.com/sitemap.xml
Sitemap: https://www.finmaphub.com/sitemap-ko.xml
```

로컬 sitemap/channel 검증:

- `sitemap-ko.xml`: 111 URLs
- `sitemap-en.xml`: 100 URLs
- `/en/sitemap.xml`: 100 URLs
- 필수 영어 static URL: 17/17 present in source, 0 backfilled

감사 결론:

- robots 차단 없음.
- 핵심 도구 URL noindex 증거 없음.
- canonical self 정상.
- hreflang ko/en 정상.
- sitemap 포함 정상.
- 프로덕션 URL 200 정상.
- 렌더링된 HTML 기준 SEO 메타와 JSON-LD가 확인됨.

## 7. LTV vs Mortgage Control Comparison

| Item | DSR/LTV calculator | Mortgage calculator |
| --- | --- | --- |
| URL | `/tools/dsr-ltv-calculator` | `/tools/mortgage-loan-calculator` |
| User-observed Naver movement | 1페이지에서 3페이지로 하락 | 1페이지 유지 |
| Production title | `LTV DSR 계산기 - 주택담보대출 한도와 아파트 구매 가능액 계산 | FinMap` | `주담대 원리금 계산기 - 아파트 담보대출 월상환액 계산 | FinMap` |
| Production H1 | `LTV DSR 계산기: 주담대 한도와 아파트 구매 가능액 계산` | `주담대 원리금 계산기` |
| Body size | 약 5,497자 | 약 3,484자 |
| JSON-LD | FAQPage, WebApplication, BreadcrumbList | WebApplication, BreadcrumbList, FAQPage |
| Query focus | LTV, DSR, 주담대 한도, 아파트 구매 가능액, 대출 가능액 | 주담대 원리금, 월상환액, 이자 |
| Risk | 검색 의도 폭이 넓고 Home-buying과 겹침 | 의도가 좁고 통제 페이지로 적합 |

해석:

- Mortgage 페이지는 계산 목적이 `월상환액/원리금`으로 비교적 선명하다.
- DSR/LTV 페이지는 `LTV`, `DSR`, `주담대 한도`, `아파트 구매 가능액`, `대출 가능액`을 한 페이지에서 모두 포괄한다.
- 이 폭넓은 포지셔닝은 장기적으로 큰 노출을 만들 수 있지만, 네이버가 쿼리 의도를 재분류하거나 유사 페이지를 비교하면 홈바잉 페이지와 경쟁할 수 있다.
- Mortgage가 유지된 점은 사이트 공통 SEO 문제보다 페이지/쿼리군 단위 문제를 더 강하게 시사한다.

## 8. Home-buying Audit

| Item | Finding |
| --- | --- |
| URL | `/tools/home-buying-budget-calculator` |
| Production status | 200 |
| Canonical | self |
| Sitemap | included |
| H1 | 1 |
| Title | `아파트 구매 계산기 - 보유 현금·주담대 한도·DSR LTV 예산 계산 | FinMap` |
| JSON-LD | WebApplication, BreadcrumbList |
| Shared component | `_components/DsrLtvCalculator.js` |

핵심 발견:

- Home-buying 페이지는 `DsrLtvCalculator` 컴포넌트를 그대로 사용한다.
- 첫 화면 입력, 계산 결과, 한도 산출, 관련 링크 흐름이 DSR/LTV 페이지와 상당 부분 중복된다.
- 공유 컴포넌트 내부 `ToolResultCta`는 `sourceTool="dsrLtv"`로 고정되어 있어 Home-buying 페이지에서도 결과 저장 문맥이 `DSR/LTV 계산기`로 보일 수 있다.
- 이는 색인 차단이나 canonical 오류는 아니지만, 검색엔진 관점에서 Home-buying 페이지의 독립 의도를 약하게 만들 수 있다.

현재 판단:

- 기술적 장애는 아니다.
- 그러나 향후 조치가 필요하다면 가장 안전한 후보는 Home-buying 페이지의 고유 의도 강화다.
- 단, 이번 감사에서는 명확한 회귀 원인으로 확정할 수 없어 수정하지 않았다.

## 9. Cannibalization Analysis

내부 링크/본문 검색 결과 요약:

| Target | Approx. internal occurrences | Interpretation |
| --- | ---: | --- |
| `/tools/dsr-ltv-calculator` | 약 83회 | 내부 링크가 가장 강하지만 앵커 의도가 넓음 |
| `/tools/mortgage-loan-calculator` | 약 11회 | 좁은 상환액 의도로 유지 |
| `/tools/home-buying-budget-calculator` | 약 15회 | DSR/LTV와 계산 경험이 겹침 |

쿼리군별 판단:

| Query family | Primary intended page | Overlap risk |
| --- | --- | --- |
| LTV / DSR 계산 | `/tools/dsr-ltv-calculator` | Home-buying이 DSR/LTV 계산 UX를 공유 |
| 주담대 원리금 / 월상환액 | `/tools/mortgage-loan-calculator` | 낮음 |
| 아파트 구매 예산 | `/tools/home-buying-budget-calculator` | DSR/LTV와 높음 |
| 복리 / 월복리 | `/tools/compound-interest` | P0 대상, 현재 3페이지 관측 |
| CAGR | `/tools/cagr-calculator` | P0 대상, 현재 3페이지 관측 |
| DCA | `/tools/dca-calculator` | P0 이후 긍정적 |

감사 결론:

- canonical 또는 sitemap 중복 문제는 발견되지 않았다.
- 하지만 검색 의도 기준으로는 DSR/LTV와 Home-buying 사이에 강한 의미 중복이 있다.
- DSR/LTV가 넓은 앵커와 넓은 제목/본문을 통해 `아파트 구매 가능액`까지 흡수하고, Home-buying도 DSR/LTV 계산 컴포넌트를 공유하므로 네이버가 두 페이지를 같은 후보군으로 묶었을 가능성이 있다.

## 10. P0 Experiment Integrity

P0 관련 확인:

| Page | 2026-09-03 change? | Current observation | Integrity finding |
| --- | --- | --- | --- |
| DCA | yes | 네이버 1페이지 관측 | P0 긍정 신호 |
| CAGR | yes | 3페이지 관측 | 개선 여부 불명, 추가 데이터 필요 |
| Compound | yes | 3페이지 관측 | 개선 여부 불명, 추가 데이터 필요 |
| DSR/LTV | no | 1페이지에서 3페이지 하락 | P0 직접 영향 증거 없음 |
| Mortgage | no | 1페이지 유지 | P0 직접 영향 증거 없음 |
| Home-buying | no | 큰 폭 하락 | P0 직접 영향 증거 없음 |

결론:

- P0 변경은 DCA, CAGR, Compound 중심이었다.
- DSR/LTV, Mortgage, Home-buying 핵심 파일은 해당 기간 변경되지 않았다.
- DCA가 긍정적이라는 점 때문에 P0 전략 전체를 실패로 판단하면 안 된다.
- Compound/CAGR은 P0 변경 대상이므로 별도 쿼리-URL 추적이 필요하지만, DSR/LTV 하락의 주 원인으로 P0를 지목할 근거는 부족하다.

## 11. Root Cause Ranking

| Rank | Candidate | Confidence | Rationale |
| ---: | --- | --- | --- |
| 1 | 네이버 외부 랭킹/쿼리 재분류 + DSR/Home-buying 의도 겹침 | Medium-high | 기술 오류는 없고, 손실이 DSR/LTV와 Home-buying에 집중됨 |
| 2 | DSR/LTV 페이지의 과도하게 넓은 검색 의도 | Medium | LTV, DSR, 주담대 한도, 아파트 구매 가능액을 동시에 타깃 |
| 3 | Home-buying의 DSR/LTV 컴포넌트 재사용으로 인한 독립성 약화 | Medium | 본문/결과/CTA 문맥이 DSR/LTV와 중복 |
| 4 | Compound/CAGR P0 변경 후 쿼리별 순위 미정착 | Low-medium | 두 페이지 손실은 있으나 DCA가 성공 신호를 보임 |
| 5 | 사이트 공통 technical SEO regression | Low | build, robots, sitemap, canonical, hreflang, production audit 모두 통과 |
| 6 | 특정 배포의 DSR/LTV 코드 회귀 | Low | 해당 기간 대상 파일 변경 없음 |

## 12. Safe Fixes Applied

적용한 수정 없음.

이유:

- 프로덕션 URL, canonical, sitemap, robots, hreflang, JSON-LD에서 명확한 오류가 발견되지 않았다.
- DSR/LTV와 Home-buying의 의도 분리는 가능성이 높은 다음 작업이지만, 검색 순위 원인으로 확정하려면 쿼리-URL 단위 데이터가 더 필요하다.
- 제목/H1/본문/FAQ를 즉시 변경하면 현재 유지 중인 Mortgage와 긍정 신호가 있는 DCA까지 실험 해석을 흐릴 수 있다.

## 13. Intentionally Not Changed

이번 감사에서 의도적으로 변경하지 않은 항목:

- `DSR/LTV 계산기` title/H1/description
- `Mortgage 계산기` title/H1/description
- `Home-buying 계산기` title/H1/description
- Compound/CAGR/DCA P0 적용 본문
- FAQ JSON-LD
- 내부 링크 앵커 텍스트
- sitemap/robots/canonical/hreflang 정책
- Next.js 라우팅/redirect 설정
- DB, crawler, API

변경하지 않은 이유:

- 요청 범위가 감사 우선이었다.
- 명확한 technical safe fix가 발견되지 않았다.
- 현재 데이터만으로는 콘텐츠 리라이트가 원인 해결인지 실험 훼손인지 분리하기 어렵다.

## 14. Verification

실행한 검증:

| Command | Result |
| --- | --- |
| `npm.cmd run build` | PASS |
| `node scripts\verify_naver_calculator_recovery_p0.js` | PASS |
| `node scripts\verify_naver_calculator_seo.js` | PASS |
| `node scripts\verify_dsr_ltv_naver_keyword_alignment.js` | PASS |
| `node scripts\verify_sitemap_clean.js` | PASS |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `node scripts\audit_naver_drop_core_urls.js --targets=...` against production | PASS, 8/8 core URLs OK |
| `NAVER_CALCULATOR_SEO_BASE_URL=https://www.finmaphub.com node scripts\verify_naver_calculator_seo.js` | PASS |
| Production `robots.txt` fetch | PASS |
| `git diff --check` | PASS, line-ending warnings only |

Notable verification details:

- Production DSR/LTV: 200, self canonical, sitemap included, 1 H1, body length 약 5,497.
- Production Mortgage: 200, self canonical, sitemap included, 1 H1, body length 약 3,484.
- Production Home-buying: 200, self canonical, sitemap included, 1 H1, body length 약 3,127.
- Production core URL audit problem count: 0.
- Sitemap clean audit: 212 loc entries checked, forbidden 0, missing required 0.
- SEO channel split audit: required EN URLs 18/18, forbidden sitemap locs 0, sampled routes PASS.

Generated side effects:

- `reports/sitemap-clean-audit.md` timestamp updated by `verify_sitemap_clean.js`.
- `reports/seo-channel-split-url-check.md` timestamp updated by `verify_seo_channel_split.js --local-server`.

## 15. Recommended Next Action

다음 액션은 코드 수정이 아니라 **Naver Search Advisor의 쿼리-URL 매핑 확인**이다.

우선 다음 기간을 같은 형식으로 export한다.

| Period | Purpose |
| --- | --- |
| 2026-08-15 ~ 2026-08-31 | 하락 전 기준 |
| 2026-09-01 ~ 2026-09-14 | 하락 구간 |
| 2026-09-15 이후 7일 | 감사 후 추적 |

필수로 볼 항목:

- Query
- Page URL
- Clicks
- Impressions
- CTR
- Average position, 가능하면

우선 비교할 쿼리군:

- `ltv 계산기`
- `dsr 계산기`
- `주택담보대출 계산기`
- `주담대 계산기`
- `대출 가능액 계산기`
- `아파트 구매 계산기`
- `복리 계산기`
- `cagr 계산기`
- `dca 계산기`

그 다음 안전한 실험 후보:

1. Home-buying 페이지를 `아파트 구매 예산/보유 현금/취득 비용/매수 가능 가격` 의도로 더 분리한다.
2. Home-buying에서 공유 컴포넌트의 CTA/source wording이 `DSR/LTV 계산기`로 보이는 부분을 페이지 문맥에 맞게 분기한다.
3. DSR/LTV 페이지는 `LTV/DSR/대출 한도` 중심으로 좁히고, `아파트 구매 예산`은 Home-buying으로 넘기는 내부 링크 구조를 테스트한다.
4. Mortgage는 현재 통제 페이지로 유지한다.
5. DCA는 긍정 신호가 있으므로 건드리지 않는다.

즉시 대규모 제목/본문 수정은 권장하지 않는다. 먼저 쿼리별로 어떤 URL이 노출을 잃었는지 확인한 뒤, DSR/LTV와 Home-buying 사이의 의도 분리만 작게 실험하는 것이 안전하다.
