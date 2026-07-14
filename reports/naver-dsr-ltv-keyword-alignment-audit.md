# Naver DSR/LTV Mortgage Calculator P0 Keyword Alignment

Date: 2026-07-14

## Purpose

Naver Search Advisor showed early signals for DSR/LTV, 주담대, 아파트 담보대출, and apartment purchase calculator queries.

This task aligned `/tools/dsr-ltv-calculator` with P0 search intent without changing calculation logic, GA4 event names, canonical, hreflang, sitemap, RSS, robots, or package files.

## Target Keywords

| Keyword | Intent | Current URL |
| --- | --- | --- |
| ltv dsr 계산기 | 계산기형 | `/tools/dsr-ltv-calculator` |
| 주담대 원리금 계산기 | 계산기형 | `/tools/dsr-ltv-calculator` |
| 아파트 담보대출 계산기 | 계산기형 | `/tools/dsr-ltv-calculator` |
| 주담대 dsr 계산기 | 계산기형 | `/tools/dsr-ltv-calculator` |
| 주택담보대출 ltv계산기 | 계산기형 | `/tools/dsr-ltv-calculator` |
| 아파트 구매 계산기 | 계산기형 | `/tools/dsr-ltv-calculator` |

## Function Check

The page already calculates and displays the required outputs:

- DSR: existing calculator core and result cards
- LTV: input and candidate LTV max loan output
- 주택담보대출 가능액: DSR loan capacity and final affordable price
- 아파트 구매 가능 가격: final affordable price and safe search range
- 월 상환액 / 월 원리금: final monthly payment and candidate monthly payment
- 원리금균등: result intro and disclaimer checklist state equal principal-and-interest repayment

Result: PASS. `주담대 원리금 계산기` wording can be used because monthly principal-and-interest repayment is actually calculated.

## SEO Title

Before:

```text
DSR 계산기 | 주택담보대출 가능액·LTV·아파트 구매가격 계산
```

After:

```text
DSR·LTV 계산기 | 주담대 원리금·아파트 담보대출 가능액 계산
```

Change summary:

- Added direct `DSR·LTV 계산기` phrasing.
- Added `주담대 원리금`.
- Added `아파트 담보대출 가능액`.
- Avoided repeated keyword stuffing.

## SEO Description

Before:

```text
연소득, 기존대출 월상환액, 주택담보대출 금리·기간으로 DSR과 대출 가능액을 계산하고 LTV·보유현금까지 반영해 아파트 구매가격을 점검하세요.
```

After:

```text
연소득, 기존 대출, 금리, 대출기간, 아파트 가격을 입력해 DSR·LTV 기준 주택담보대출 가능액과 월 원리금 상환액, 아파트 구매 가능 금액을 계산합니다.
```

Change summary:

- Kept `주택담보대출`.
- Added `월 원리금 상환액`.
- Added `아파트 구매 가능 금액`.
- Preserved the DSR/LTV calculator intent.

## H1 And Upper Copy

Before H1:

```text
DSR 계산기: 연소득·기존대출·주택담보대출 가능액 계산
```

After H1:

```text
DSR·LTV 계산기: 주담대 원리금과 아파트 담보대출 가능액 계산
```

Upper lead now states that the user can enter income, existing monthly payments, 주담대 rate/term, DSR, LTV, and cash to check monthly principal-and-interest and apartment purchase price range.

## Top Section

Changed the short top guide from a DSR-only explanation to:

```text
주담대 원리금·DSR·LTV를 함께 보는 이유
```

The section now keeps the copy short and explains:

- DSR alone does not decide mortgage capacity.
- LTV checks the loan ratio against apartment price.
- DSR checks annual principal-and-interest burden against income.
- Monthly principal-and-interest is the monthly affordability check.
- Apartment purchase planning should combine DSR, LTV, monthly payment, and cash.

## FAQ Changes

The FAQ data still powers both the visible FAQ and FAQPage JSON-LD.

Adjusted or added:

- `주담대 원리금 계산기는 무엇을 확인하나요?`
- `DSR 계산기와 LTV 계산기는 무엇이 다른가요?`
- `아파트 담보대출 계산기는 어떤 순서로 봐야 하나요?`
- `아파트 구매 계산기로도 사용할 수 있나요?`

No duplicate FAQPage JSON-LD was added.

## Internal Links

Existing related link box was preserved and extended with:

- `/posts/personalFinance/dsr-pass-ltv-cash-bottleneck`
- `/posts/personalFinance/apartment-buying-costs-before-purchase`

Existing links such as real estate dashboard, DSR income table, interest-rate impact, mortgage checklist, home roadmap, and cash budget guide remain.

## Calculation Logic

No calculation logic was changed.

Files intentionally not modified:

- `lib/calculators/dsrLtv.js`
- `_components/DsrLtvCalculator.js`

Existing monthly-payment fields remain:

- `finalMonthlyPayment`
- `candidateMonthlyPayment`
- `newMortgageMonthlyPaymentCapacity`
- `dsrLoanCapacity`

## GA4 Events

Existing event strings and source tool values were preserved:

- `tool_calculate`
- `dsr_ltv_calculate`
- `tool_result_cta_view`
- `tool_result_cta_click`
- `related_calculator_click`
- `source_tool: "dsr_ltv"`
- `sourceTool="dsrLtv"`

## SEO And Sitemap

| Check | Result |
| --- | --- |
| Canonical | self canonical via `SeoHead` |
| hreflang | unchanged |
| noindex | absent |
| robots | unchanged |
| RSS policy | unchanged |
| sitemap generation policy | unchanged |

Sitemap counts after build:

| Sitemap | URL count |
| --- | ---: |
| main sitemap / `sitemap-0.xml` | 205 |
| `sitemap-ko.xml` | 107 |
| `sitemap-en.xml` | 98 |
| `/en/sitemap.xml` | 98 |

## Validation Results

| Command | Result |
| --- | --- |
| `node --check scripts\verify_dsr_ltv_naver_keyword_alignment.js` | PASS |
| `node scripts\verify_dsr_ltv_naver_keyword_alignment.js` | PASS |
| `npm.cmd run build` | PASS, 215/215 pages |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS, main 205 / KO 107 / EN 98 / `/en/sitemap.xml` 98 URLs |
| `node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/tools/dsr-ltv-calculator` | PASS |
| `git diff --check` | PASS, LF/CRLF warning only |

## Issues

- No blocker found.
- The existing SEO channel split verifier rewrote `reports/seo-channel-split-url-check.md` timestamp during validation; it was restored because it was outside this task scope.

## Final Decision

`PASS - 네이버 DSR/LTV 주담대 계산기 P0 키워드 정렬 완료`
