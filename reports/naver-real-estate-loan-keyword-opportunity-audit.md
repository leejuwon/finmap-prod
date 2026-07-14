# Naver Real Estate Loan Keyword Opportunity Audit

Date: 2026-07-14

## Summary

- Scope: audit only
- Code/content/SEO policy changes: none
- Audit script: `scripts/audit_naver_real_estate_loan_keyword_opportunities.js`
- Report: `reports/naver-real-estate-loan-keyword-opportunity-audit.md`
- Final decision: `PASS - 네이버 부동산·대출 계산기 키워드 기회 감사 완료`

## Manual Search Console Keyword Table

| Keyword | Clicks | Impressions | CTR | Current likely URL | Intent | Priority |
| --- | ---: | ---: | ---: | --- | --- | --- |
| ltv dsr 계산기 | 6 | 67 | 9.0% | /tools/dsr-ltv-calculator | 계산기형 | P0 |
| 주담대 원리금 계산기 | 3 | 178 | 1.7% | /tools/dsr-ltv-calculator | 계산기형 | P0 |
| 아파트 담보대출 계산기 | 2 | 131 | 1.5% | /tools/dsr-ltv-calculator | 계산기형 | P0 |
| 주담대 dsr 계산기 | 1 | 216 | 0.5% | /tools/dsr-ltv-calculator | 계산기형 | P0 |
| 주택담보대출 ltv계산기 | 2 | 4 | 50.0% | /tools/dsr-ltv-calculator | 계산기형 | P0 |
| 아파트 구매 계산기 | 2 | 3 | 66.7% | /tools/dsr-ltv-calculator | 계산기형 | P0 |
| 마곡 집값 | 2 | 98 | 2.0% | /market/real-estate/magok-top100 | 정보형 | P1 |
| 강남 집값 순위 | 2 | 12 | 16.7% | /market/real-estate/gangnam-top100 | 정보형 | P1 |
| cagr 계산식 | 2 | 7 | 28.6% | /posts/personalFinance/what-is-cagr | 계산기/개념형 | P1 |
| cagr | 1 | 942 | 0.1% | /tools/cagr-calculator | 개념/계산기 혼합 | P1 |

## Keyword Intent Classification

| Keyword | Intent | Notes |
| --- | --- | --- |
| ltv dsr 계산기 | 계산기형 | DSR/LTV 계산기와 직접 연결된다. 키워드 순서와 한글 보조 표현이 title/description에 충분히 드러나는지 점검 우선. |
| 주담대 원리금 계산기 | 계산기형 | 기존 계산기가 원리금균등 월상환액을 계산하지만 검색자는 “월 원리금” 자체를 기대한다. 별도 섹션 또는 브릿지 글이 유효. |
| 아파트 담보대출 계산기 | 계산기형 | DSR/LTV/보유현금/아파트 구매가 연결되는 핵심 상업성 키워드. 계산기 상단 문구와 내부링크 보강 후보. |
| 주담대 dsr 계산기 | 계산기형 | 노출 대비 CTR이 낮다. “주담대 DSR” 표현이 title/description/H1에서 얼마나 직접적인지 점검. |
| 주택담보대출 ltv계산기 | 계산기형 | CTR은 높지만 표본이 작다. LTV 계산기 의도를 DSR/LTV 계산기 내부에서 더 명확히 받는 섹션 후보. |
| 아파트 구매 계산기 | 계산기형 | 대출 한도와 취득 부대비용을 함께 기대할 가능성이 높다. 계산기 연결형 브릿지 또는 상단 안내 섹션 후보. |
| 마곡 집값 | 정보형 | 지역 집값 정보형 의도다. 마곡 전용 Top 페이지 또는 대시보드 필터 랜딩의 데이터 품질 확인이 선행되어야 한다. |
| 강남 집값 순위 | 정보형 | 순위형 정보 페이지와 잘 맞는다. 강남/강남3구/서울 Top 페이지의 데이터 기준과 title 노출을 점검할 필요가 있다. |
| cagr 계산식 | 계산기/개념형 | 계산식 의도는 개념 글과 계산기 모두 대응 가능하다. 수식/H2/계산기 연결이 충분한지 점검. |
| cagr | 개념/계산기 혼합 | 노출은 매우 크지만 CTR이 낮다. 계산기형/개념형 혼합 SERP에서 title과 description의 클릭 이유를 재점검할 후보. |

## Current URL Candidates

| Keyword | Current likely URL | Direct file/page exists | Source file | Sitemap KO | RSS possibility |
| --- | --- | --- | --- | --- | --- |
| ltv dsr 계산기 | /tools/dsr-ltv-calculator | yes | pages/tools/dsr-ltv-calculator.js | yes | 제외: tool/page는 RSS item 아님 |
| 주담대 원리금 계산기 | /tools/dsr-ltv-calculator | yes | pages/tools/dsr-ltv-calculator.js | yes | 제외: tool/page는 RSS item 아님 |
| 아파트 담보대출 계산기 | /tools/dsr-ltv-calculator | yes | pages/tools/dsr-ltv-calculator.js | yes | 제외: tool/page는 RSS item 아님 |
| 주담대 dsr 계산기 | /tools/dsr-ltv-calculator | yes | pages/tools/dsr-ltv-calculator.js | yes | 제외: tool/page는 RSS item 아님 |
| 주택담보대출 ltv계산기 | /tools/dsr-ltv-calculator | yes | pages/tools/dsr-ltv-calculator.js | yes | 제외: tool/page는 RSS item 아님 |
| 아파트 구매 계산기 | /tools/dsr-ltv-calculator | yes | pages/tools/dsr-ltv-calculator.js | yes | 제외: tool/page는 RSS item 아님 |
| 마곡 집값 | /market/real-estate/magok-top100 | yes | pages/market/real-estate/magok-top100.js | yes | 제외: tool/page는 RSS item 아님 |
| 강남 집값 순위 | /market/real-estate/gangnam-top100 | yes | pages/market/real-estate/gangnam-top100.js | yes | 제외: tool/page는 RSS item 아님 |
| cagr 계산식 | /posts/personalFinance/what-is-cagr | yes | content/posts/personalFinance/ko/what-is-cagr.md | yes | 가능: KO post, draft/noindex 아님 |
| cagr | /tools/cagr-calculator | yes | pages/tools/cagr-calculator.js | yes | 제외: tool/page는 RSS item 아님 |

## Title / Description / H1 Match

| Keyword | URL | Title term hits | Description term hits | H1 term hits | Current title/source string |
| --- | --- | --- | --- | --- | --- |
| ltv dsr 계산기 | /tools/dsr-ltv-calculator | 3/3 (ltv, dsr, 계산기) | 2/3 (ltv, dsr) | 2/3 (dsr, 계산기) | DSR 계산기 \| 주택담보대출 가능액·LTV·아파트 구매가격 계산 |
| 주담대 원리금 계산기 | /tools/dsr-ltv-calculator | 1/3 (계산기) | 0/3 | 1/3 (계산기) | DSR 계산기 \| 주택담보대출 가능액·LTV·아파트 구매가격 계산 |
| 아파트 담보대출 계산기 | /tools/dsr-ltv-calculator | 3/3 (아파트, 담보대출, 계산기) | 2/3 (아파트, 담보대출) | 2/3 (담보대출, 계산기) | DSR 계산기 \| 주택담보대출 가능액·LTV·아파트 구매가격 계산 |
| 주담대 dsr 계산기 | /tools/dsr-ltv-calculator | 2/3 (dsr, 계산기) | 1/3 (dsr) | 2/3 (dsr, 계산기) | DSR 계산기 \| 주택담보대출 가능액·LTV·아파트 구매가격 계산 |
| 주택담보대출 ltv계산기 | /tools/dsr-ltv-calculator | 3/3 (주택담보대출, ltv, 계산기) | 2/3 (주택담보대출, ltv) | 2/3 (주택담보대출, 계산기) | DSR 계산기 \| 주택담보대출 가능액·LTV·아파트 구매가격 계산 |
| 아파트 구매 계산기 | /tools/dsr-ltv-calculator | 3/3 (아파트, 구매, 계산기) | 2/3 (아파트, 구매) | 1/3 (계산기) | DSR 계산기 \| 주택담보대출 가능액·LTV·아파트 구매가격 계산 |
| 마곡 집값 | /market/real-estate/magok-top100 | 2/2 (마곡, 집값) | 1/2 (마곡) | 2/2 (마곡, 집값) | 마곡 아파트 집값 TOP 100 \| 강서구 마곡동 실거래 순위 |
| 강남 집값 순위 | /market/real-estate/gangnam-top100 | 2/3 (강남, 순위) | 2/3 (강남, 순위) | 2/3 (강남, 순위) | 강남 아파트값 순위 TOP 100 \| 강남구 실거래 기반 |
| cagr 계산식 | /posts/personalFinance/what-is-cagr | 1/2 (cagr) | 2/2 (cagr, 계산식) | 1/2 (cagr) | CAGR 계산법: 단순 수익률과 다른 이유와 투자 예시 |
| cagr | /tools/cagr-calculator | 1/1 (cagr) | 0/1 | 0/1 | CAGR 결과 해석 |

## Related Posts And Internal Links

| Keyword | Related post candidates | Internal links to likely URL | Sample sources |
| --- | --- | ---: | --- |
| ltv dsr 계산기 | /posts/personalFinance/dsr-pass-ltv-cash-bottleneck<br>/posts/personalFinance/mortgage-risk-checklist-dsr-variable<br>/posts/personalFinance/interest-rate-1p-loan-limit-impact<br>/posts/personalFinance/cash-100m-200m-300m-apartment-budget | 46 | content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md<br>content/posts/economicInfo/ko/interest-rate-basics.md<br>content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md<br>content/posts/investingInfo/ko/real-estate-role-in-portfolio-risk-budget.md<br>content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md |
| 주담대 원리금 계산기 | /posts/personalFinance/interest-rate-1p-loan-limit-impact<br>/posts/personalFinance/dsr-40-income-loan-limit-table<br>/posts/personalFinance/salary-40m-mortgage-limit<br>/posts/personalFinance/salary-50m-dsr-40-loan-limit | 46 | content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md<br>content/posts/economicInfo/ko/interest-rate-basics.md<br>content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md<br>content/posts/investingInfo/ko/real-estate-role-in-portfolio-risk-budget.md<br>content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md |
| 아파트 담보대출 계산기 | /posts/personalFinance/cash-100m-200m-300m-apartment-budget<br>/posts/personalFinance/apartment-buying-costs-before-purchase<br>/posts/investingInfo/rates-discount-mortgage-demand-apt-prices<br>/posts/personalFinance/mortgage-risk-checklist-dsr-variable | 46 | content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md<br>content/posts/economicInfo/ko/interest-rate-basics.md<br>content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md<br>content/posts/investingInfo/ko/real-estate-role-in-portfolio-risk-budget.md<br>content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md |
| 주담대 dsr 계산기 | /posts/personalFinance/interest-rate-1p-loan-limit-impact<br>/posts/personalFinance/dsr-40-income-loan-limit-table<br>/posts/personalFinance/salary-40m-mortgage-limit<br>/posts/personalFinance/salary-50m-dsr-40-loan-limit | 46 | content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md<br>content/posts/economicInfo/ko/interest-rate-basics.md<br>content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md<br>content/posts/investingInfo/ko/real-estate-role-in-portfolio-risk-budget.md<br>content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md |
| 주택담보대출 ltv계산기 | /posts/personalFinance/interest-rate-1p-loan-limit-impact<br>/posts/personalFinance/dsr-pass-ltv-cash-bottleneck<br>/posts/personalFinance/mortgage-risk-checklist-dsr-variable<br>/posts/personalFinance/cash-100m-200m-300m-apartment-budget | 46 | content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md<br>content/posts/economicInfo/ko/interest-rate-basics.md<br>content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md<br>content/posts/investingInfo/ko/real-estate-role-in-portfolio-risk-budget.md<br>content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md |
| 아파트 구매 계산기 | /posts/personalFinance/cash-100m-200m-300m-apartment-budget<br>/posts/investingInfo/rates-discount-mortgage-demand-apt-prices<br>/posts/personalFinance/apartment-buying-costs-before-purchase<br>/posts/personalFinance/dsr-pass-ltv-cash-bottleneck | 46 | content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md<br>content/posts/economicInfo/ko/interest-rate-basics.md<br>content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md<br>content/posts/investingInfo/ko/real-estate-role-in-portfolio-risk-budget.md<br>content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md |
| 마곡 집값 | /posts/personalFinance/apartment-transaction-volume-decline-meaning<br>/posts/economicInfo/geopolitics-oil-fx-dashboard<br>/posts/personalFinance/first-home-buyer-budget-calculation<br>/posts/personalFinance/dsr-pass-ltv-cash-bottleneck | 0 | - |
| 강남 집값 순위 | /posts/personalFinance/apartment-transaction-volume-decline-meaning<br>/posts/economicInfo/geopolitics-oil-fx-dashboard<br>/posts/personalFinance/first-home-buyer-budget-calculation<br>/posts/personalFinance/dsr-pass-ltv-cash-bottleneck | 2 | content/posts/personalFinance/ko/large-apartment-complex-households-price-stability.md |
| cagr 계산식 | /posts/personalFinance/what-is-cagr<br>/posts/investingInfo/cagr-7percent-reality-check<br>/posts/investingInfo/diagnose-investing-skill-with-cagr<br>/posts/investingInfo/why-check-cagr-etf | 15 | content/posts/economicInfo/ko/fx-basics.md<br>content/posts/economicInfo/ko/indicator-basics.md<br>content/posts/economicInfo/ko/inflation-rate-basics.md<br>content/posts/investingInfo/ko/cagr-7percent-reality-check.md<br>content/posts/investingInfo/ko/diagnose-investing-skill-with-cagr.md |
| cagr | /posts/investingInfo/cagr-7percent-reality-check<br>/posts/investingInfo/diagnose-investing-skill-with-cagr<br>/posts/investingInfo/why-check-cagr-etf<br>/posts/personalFinance/what-is-cagr | 48 | content/posts/economicInfo/ko/eu-russia-gas-phaseout-price-channel.md<br>content/posts/economicInfo/ko/fx-basics.md<br>content/posts/economicInfo/ko/gold-geopolitics-real-rates-dollar-uncertainty.md<br>content/posts/economicInfo/ko/hormuz-risk-oil-insurance-freight-premium.md<br>content/posts/economicInfo/ko/indicator-basics.md |

## Sitemap / RSS Possibility

| Item | Count / Result |
| --- | ---: |
| sitemap-0.xml URLs | 205 |
| sitemap-ko.xml URLs | 107 |
| sitemap-en.xml URLs | 98 |
| public/en/sitemap.xml URLs | 98 |

- Tool pages are expected in sitemap but not in RSS.
- KO post pages can be RSS candidates if they are not draft/noindex and remain within the current `/rss.xml` item window.
- Regional dashboard pages are sitemap candidates, not RSS candidates.

## Findings

- P0 loan keywords mostly map to `/tools/dsr-ltv-calculator`, but several queries use consumer wording such as `주담대 원리금`, `아파트 담보대출`, and `아파트 구매 계산기`.
- `주담대 원리금 계산기` is the clearest gap: the existing calculator can support the intent, but a bridge section or article may be needed to make the intent explicit.
- `아파트 구매 계산기` likely expects a combined purchase budget view: loan capacity, cash, LTV, DSR, and purchase costs.
- `마곡 집값` and `강남 집값 순위` map to real-estate dashboard/ranking pages, but data freshness, sample size, and regional page titles should be checked before SEO copy changes.
- `cagr` has very high impressions with low CTR, suggesting SERP intent/title mismatch or a broad keyword where the current title does not earn the click often enough.

## Priority Plan

### P0

- Audit `/tools/dsr-ltv-calculator` title/description/H1 for `ltv dsr 계산기`, `주담대 dsr 계산기`, `아파트 담보대출 계산기`, and `주택담보대출 ltv계산기`.
- Add or plan a bridge path for `주담대 원리금 계산기` if the current page does not clearly expose monthly principal-and-interest repayment.
- Add or plan a bridge path for `아파트 구매 계산기` that connects purchase cost, cash, DSR/LTV, and dashboard flow.

### P1

- Check data quality and landing viability for `마곡 집값` and `강남 집값 순위` before changing SEO copy.
- Review `CAGR` calculator and `what-is-cagr` title/description alignment because impressions are high but CTR is weak.
- Strengthen `cagr 계산식` section/linking if it is not already obvious in the concept post and calculator page.

### P2

- Keep monitoring low-impression high-CTR keywords before creating dedicated landing pages.
- Compare Naver Search Advisor changes after any P0 loan copy or bridge work.

## Recommended Action By Keyword

| Keyword | Recommendation | Priority | Rationale |
| --- | --- | --- | --- |
| ltv dsr 계산기 | A. 기존 페이지 title/description 미세 조정 후보 | P0 | DSR/LTV 계산기와 직접 연결된다. 키워드 순서와 한글 보조 표현이 title/description에 충분히 드러나는지 점검 우선. |
| 주담대 원리금 계산기 | C. 브릿지 콘텐츠 필요 | P0 | 기존 계산기가 원리금균등 월상환액을 계산하지만 검색자는 “월 원리금” 자체를 기대한다. 별도 섹션 또는 브릿지 글이 유효. |
| 아파트 담보대출 계산기 | A. 기존 페이지 title/description 미세 조정 후보 | P0 | DSR/LTV/보유현금/아파트 구매가 연결되는 핵심 상업성 키워드. 계산기 상단 문구와 내부링크 보강 후보. |
| 주담대 dsr 계산기 | A. 기존 페이지 title/description 미세 조정 후보 | P0 | 노출 대비 CTR이 낮다. “주담대 DSR” 표현이 title/description/H1에서 얼마나 직접적인지 점검. |
| 주택담보대출 ltv계산기 | B. 기존 페이지 내부 섹션 보강 후보 | P0 | CTR은 높지만 표본이 작다. LTV 계산기 의도를 DSR/LTV 계산기 내부에서 더 명확히 받는 섹션 후보. |
| 아파트 구매 계산기 | C. 브릿지 콘텐츠 필요 | P0 | 대출 한도와 취득 부대비용을 함께 기대할 가능성이 높다. 계산기 연결형 브릿지 또는 상단 안내 섹션 후보. |
| 마곡 집값 | E. 데이터 품질 점검 선행 필요 | P1 | 지역 집값 정보형 의도다. 마곡 전용 Top 페이지 또는 대시보드 필터 랜딩의 데이터 품질 확인이 선행되어야 한다. |
| 강남 집값 순위 | E. 데이터 품질 점검 선행 필요 | P1 | 순위형 정보 페이지와 잘 맞는다. 강남/강남3구/서울 Top 페이지의 데이터 기준과 title 노출을 점검할 필요가 있다. |
| cagr 계산식 | B. 기존 페이지 내부 섹션 보강 후보 | P1 | 계산식 의도는 개념 글과 계산기 모두 대응 가능하다. 수식/H2/계산기 연결이 충분한지 점검. |
| cagr | A. 기존 페이지 title/description 미세 조정 후보 | P1 | 노출은 매우 크지만 CTR이 낮다. 계산기형/개념형 혼합 SERP에서 title과 description의 클릭 이유를 재점검할 후보. |

## Validation Results

| Command | Result |
| --- | --- |
| `node --check scripts\audit_naver_real_estate_loan_keyword_opportunities.js` | PASS |
| `node scripts\audit_naver_real_estate_loan_keyword_opportunities.js` | PASS, 202 files scanned, 10/10 keyword URL candidates found |
| `npm.cmd run build` | PASS, 215/215 pages |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS, main 205 / KO 107 / EN 98 / `/en/sitemap.xml` 98 URLs |
| `git diff --check` | PASS |

## Final Decision

`PASS - 네이버 부동산·대출 계산기 키워드 기회 감사 완료`

The audit found current URL structures for all 10 keywords. The main follow-up is prioritization, not emergency URL creation.
