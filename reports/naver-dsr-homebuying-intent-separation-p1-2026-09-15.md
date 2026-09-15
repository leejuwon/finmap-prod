# FinMap Naver DSR-LTV / Home-Buying Intent Separation P1 - 2026-09-15

## 1. Final Verdict

**PASS_WITH_CONTROLLED_INTENT_SEPARATION**

`/tools/dsr-ltv-calculator`와 `/tools/home-buying-budget-calculator`의 visible search intent와 result UX를 최소 범위로 분리했다.

계산 공식, 계산 결과 numeric logic, URL, canonical, hreflang, sitemap, robots, Mortgage control 페이지는 변경하지 않았다. Mortgage page/component diff는 0으로 확인했다.

## 2. SERP Evidence

사용자 제공 수동 SERP 근거:

| Query | Observed result |
| --- | --- |
| `ltv계산기` | DSR/LTV 약 3 page, Home-buying 약 4 page |
| `ltv 계산기` | DSR/LTV 약 3 page, Home-buying 약 4 page |
| `dsr 계산기` | DSR/LTV 약 5 page, Mortgage 약 5 page |
| `ltv dsr 계산기` | DSR/LTV 1 page, Home-buying 1 page |
| `주택담보대출 한도 계산기` | DSR/LTV 약 4 page |
| `대출 가능액 계산기` | DSR/LTV 1 page |
| `아파트 구매 계산기` | Home-buying 1 page, DSR/LTV 1 page |
| `아파트 구매 가능 금액 계산기` | DSR/LTV 1 page, Home-buying 1 page |
| `아파트 구매 대출 한도` | DSR/LTV 1 page, Home-buying 1 page |

Search Advisor:

| Page | Before | After | Change |
| --- | ---: | ---: | ---: |
| DSR/LTV | 49,344 | 33,225 | -32.7% |
| Home-buying | 3,696 | 882 | -76.1% |
| Mortgage | 14,888 | 15,656 | stable/increase |

## 3. Before Intent Matrix

| Page | Before role | Problem |
| --- | --- | --- |
| DSR/LTV | `얼마까지 빌릴 수 있는가?` + `아파트 구매 가능액` | 대출 한도와 구매 예산이 함께 primary처럼 노출 |
| Home-buying | `내 현금으로 얼마짜리 집을 살 수 있는가?` | title/description/result UX에서 DSR/LTV와 주담대 한도가 강하게 노출 |
| Mortgage | `이 대출이면 매달 얼마를 갚는가?` | control로 유지됨 |

## 4. DSR/LTV Changes

Target: `pages/tools/dsr-ltv-calculator.js`

Changed:

- title: `아파트 구매 가능액`을 primary promise에서 제거.
- H1: `주택담보대출 한도와 대출 가능액 계산`으로 축소.
- description: `LTV`, `DSR`, `주담대 한도`, `대출 가능액`, `원리금 월상환 여력` 중심으로 재정렬.
- lead: 보유 현금/부대비용은 Home-buying에서 이어서 확인하도록 안내.
- FAQ 2개를 대규모 삭제 없이 intent handoff 문맥으로 정리.
- 본문 카드 `아파트 구매 가능 금액`을 `구매 예산 별도 점검`으로 낮춤.

Not changed:

- DSR/LTV URL
- canonical/hreflang
- JSON-LD type
- FAQPage sync 구조
- 계산 입력/상태/공식

## 5. Home-buying Changes

Target: `pages/tools/home-buying-budget-calculator.js`

Changed:

- title: `DSR LTV` headline keyword 제거.
- description: `보유 현금`, `최소 남길 현금`, `부대비용률`, `필요 현금`, `구매 예산` 중심으로 재작성.
- lead: `내 현금으로 살 수 있는 집값과 구매 예산`을 primary promise로 강화.
- six-check cards: `자기자본·보유 현금`, `부대비용`, `최소 남길 현금`을 전면 노출.
- shared calculator에 `variant="homeBuying"` 전달.
- preset analytics source도 `homeBuying`으로 정합화.

Not changed:

- H1 `아파트 구매 계산기`
- URL/canonical/hreflang
- 계산 로직
- 기존 input/state model

## 6. Shared Component Variant

Target: `_components/DsrLtvCalculator.js`

Added:

- `variant="dsrLtv" | "homeBuying"`
- KO copy-only variant helper
- DSR/LTV result heading: `LTV·DSR 대출 한도 결과`
- Home-buying result heading: `아파트 구매 예산 결과`

DSR/LTV primary result cards now prioritize:

- `DSR 기준 대출 가능액`
- `후보 LTV상 최대 대출액`
- `신규 월상환 여력`
- `후보 월상환액`
- `대출 한도 병목`
- `참고 구매 가능 가격`

Home-buying primary result cards now prioritize:

- `구매 가능 가격`
- `후보 필요 현금`
- `보유 현금`
- `현금 부족/여유`
- `부대비용 반영 안전 가격대`
- `대출 제약 병목`

Numeric values are reused from the existing result object. No new formula was added.

## 7. CTA Fix

Fixed:

- Shared `ToolResultCta` source is no longer hard-coded to `dsrLtv`.
- DSR/LTV uses `sourceTool="dsrLtv"`.
- Home-buying uses `sourceTool="homeBuying"`.

Verified:

- Home-buying built HTML no longer contains `DSR/LTV 계산기 결과`.
- Home-buying result CTA can render `아파트 구매 계산기 결과...`.
- DSR/LTV keeps `DSR/LTV 계산기` context.

Related CTA separation:

| Page | Added/kept handoff |
| --- | --- |
| DSR/LTV | `보유 현금과 부대비용까지 반영한 아파트 구매 예산 확인` -> Home-buying |
| Home-buying | `LTV/DSR 기준 주담대 한도 확인` -> DSR/LTV |
| Mortgage | unchanged |

## 8. Internal Anchor Rebalance

Large-scale link edits were intentionally avoided.

Changed 3 KO content links:

| File | Before | After |
| --- | --- | --- |
| `content/posts/personalFinance/ko/apartment-buying-costs-before-purchase.md` | DSR/LTV 부대비용률 link | Home-buying 부대비용률 link |
| `content/posts/personalFinance/ko/jeonse-to-home-purchase-cash-needed.md` | DSR/LTV 갈아타기 후보 집값 link | Home-buying 갈아타기 필요 현금 link |
| `content/posts/personalFinance/ko/first-home-buyer-budget-calculation.md` | DSR/LTV 생애최초 예산 link | Home-buying 생애최초 필요 현금 link |

Post-change explicit KO content anchor distribution:

| Target | Before | After |
| --- | ---: | ---: |
| DSR/LTV | 54 | 51 |
| Home-buying | 9 | 12 |
| Mortgage | 5 | 5 |

Also updated KO backlink/citation copy in `_components/ToolBacklinkKit.js`:

- DSR/LTV recommended anchors now emphasize `LTV 계산기`, `DSR 계산기`, `주택담보대출 가능액 계산기`, `대출 한도 계산기`.
- Home-buying recommended anchors now emphasize `아파트 구매 예산 계산기`, `보유 현금 집값 계산기`, `필요 현금 계산기`.

## 9. Files Changed

Source/content:

- `_components/DsrLtvCalculator.js`
- `_components/ToolBacklinkKit.js`
- `pages/tools/dsr-ltv-calculator.js`
- `pages/tools/home-buying-budget-calculator.js`
- `content/posts/personalFinance/ko/apartment-buying-costs-before-purchase.md`
- `content/posts/personalFinance/ko/jeonse-to-home-purchase-cash-needed.md`
- `content/posts/personalFinance/ko/first-home-buyer-budget-calculation.md`

Verification:

- `scripts/verify_naver_dsr_homebuying_intent_separation.js`
- `scripts/verify_dsr_ltv_naver_keyword_alignment.js`

Reports generated/updated by verification:

- `reports/naver-dsr-homebuying-intent-separation-p1-2026-09-15.md`
- `reports/sitemap-clean-audit.md` timestamp updated
- `reports/seo-channel-split-url-check.md` timestamp updated

## 10. Numeric Logic Integrity

No changes were made to:

- `lib/calculators/dsrLtv.js`
- calculation formulas
- validation
- state model
- existing result object fields

Numeric snapshot check passed:

```json
{
  "dsrLoanCapacity": 410881122,
  "candidateMaxLoanByLtv": 560000000,
  "finalAffordablePrice": 586973032,
  "finalMonthlyPayment": 2033333,
  "candidateCashRequirement": 280000000,
  "candidateCashGap": 20000000,
  "candidateMonthlyPayment": 2672306,
  "bottleneck": "DSR",
  "candidateStatus": "FAIL"
}
```

## 11. Control Integrity

Mortgage control:

- `pages/tools/mortgage-loan-calculator.js`: diff 0
- `_components/MortgageLoanCalculator.js`: diff 0
- Built title unchanged.
- Built H1 unchanged.
- New verification script checks Mortgage source diff and built HTML control values.

Other protected pages were not edited:

- DCA
- Compound
- CAGR
- FIRE
- Goal simulator

## 12. Verification

Commands run:

| Command | Result |
| --- | --- |
| `npm.cmd run build` | PASS |
| `node --check scripts\verify_naver_dsr_homebuying_intent_separation.js` | PASS |
| `node --check scripts\verify_dsr_ltv_naver_keyword_alignment.js` | PASS |
| `node scripts\verify_naver_dsr_homebuying_intent_separation.js` | PASS |
| `node scripts\verify_naver_calculator_recovery_p0.js` | PASS |
| `node scripts\verify_naver_calculator_seo.js` | PASS |
| `node scripts\verify_dsr_ltv_naver_keyword_alignment.js` | PASS |
| `node scripts\verify_sitemap_clean.js` | PASS |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `git diff -- pages\tools\mortgage-loan-calculator.js _components\MortgageLoanCalculator.js` | PASS, no diff |
| `git diff --check` | PASS, line-ending warnings only |

Important verification details:

- DSR/LTV title/H1 include `LTV`, `DSR`, `주택담보대출 한도`, `대출 가능액`.
- DSR/LTV title/H1 no longer contain `아파트 구매 가능액`.
- Home-buying title no longer contains `DSR` or `LTV`.
- Home-buying result heading is `아파트 구매 예산 결과`.
- Home-buying built HTML no longer contains `DSR/LTV 계산기 결과`.
- Canonical and hreflang remain self-consistent.
- Public sitemap files showed no final diff.

## 13. Risks

Remaining risks:

- DSR/LTV still necessarily references candidate home price, cash, and costs because the shared calculation model includes those constraints.
- Home-buying still references DSR/LTV as a secondary loan constraint.
- Naver may need recrawl/re-ranking time before SERP separation is visible.
- Some older article metadata and article bodies still naturally discuss DSR/LTV and cash together; only the clearest 3 links were rebalanced.
- English visible metadata was not intentionally rewritten; shared CTA source correctness may affect the shared result CTA where the same component is used.

Mitigation:

- Keep Mortgage unchanged as the control.
- Monitor query-URL mapping rather than only total impressions.
- Avoid another broad rewrite until Naver has recrawled the changed pages.

## 14. Post-deploy Monitoring

Monitor for at least 7-14 days after deployment.

Primary query groups:

| Query group | Expected primary URL |
| --- | --- |
| `ltv 계산기`, `ltv계산기` | `/tools/dsr-ltv-calculator` |
| `dsr 계산기` | `/tools/dsr-ltv-calculator` |
| `ltv dsr 계산기` | `/tools/dsr-ltv-calculator` |
| `주택담보대출 한도 계산기` | `/tools/dsr-ltv-calculator` |
| `대출 가능액 계산기` | `/tools/dsr-ltv-calculator` |
| `아파트 구매 계산기` | `/tools/home-buying-budget-calculator` |
| `보유 현금 아파트 구매` | `/tools/home-buying-budget-calculator` |
| `아파트 구매 예산` | `/tools/home-buying-budget-calculator` |
| `필요 현금 계산` | `/tools/home-buying-budget-calculator` |
| `주담대 원리금 계산기`, `월상환액 계산기` | `/tools/mortgage-loan-calculator` |

Decision rule:

- If DSR/LTV recovers on LTV/DSR/loan-capacity queries while Home-buying starts receiving cash/budget queries, keep the separation.
- If both pages continue appearing together for the same query after recrawl, consider a P2 that separates shared result sections more strongly.
- Do not modify Mortgage unless the control begins showing a clear independent regression.
