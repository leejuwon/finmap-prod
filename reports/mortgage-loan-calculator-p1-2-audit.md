# Mortgage Loan Calculator P1-2 Audit

- Generated: 2026-07-21T14:54:12.468Z
- Overall: PASS (22/22)

## Changed Files

- `lib/calculators/mortgageLoan.js`
- `_components/MortgageLoanCalculator.js`
- `pages/tools/mortgage-loan-calculator.js`
- `pages/tools/index.js`
- `utils/analytics.js`
- `_components/ToolResultCta.js`
- `_components/ToolBacklinkKit.js`
- `scripts/check_posts_links_local.js`
- `next-sitemap.config.js`
- `scripts/verify_seo_channel_split.js`
- `reports/mortgage-loan-calculator-p1-2-audit.md`

## New URLs

- KO: `/tools/mortgage-loan-calculator`
- EN: `/en/tools/mortgage-loan-calculator`

## Calculation Formula

- Equal payment: reused `calculateMonthlyPayment()` from `lib/calculators/dsrLtv.js`.
- Equal principal: monthly principal = `loanAmount / months`; monthly interest = `remainingPrincipal * annualRate / 100 / 12`.
- Bullet repayment: monthly interest only; principal is paid at maturity.
- Rate sensitivity: same loan amount, term, repayment type, and grace period with annual rate `+1%p`.

## Sample Results

| Sample | Expected monthly | First month | Last month | Total interest | Total repayment | +1%p monthly | +1%p delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Equal payment, 3억, 4%, 30년 | 1,432,246원 | 1,432,246원 | 1,432,246원 | 215,608,519원 | 515,608,519원 | 1,610,465원 | 178,219원 |
| Equal principal, 3억, 4%, 30년 | 1,833,333원 | 1,833,333원 | 836,111원 | 180,500,000원 | 480,500,000원 | 2,083,333원 | 250,000원 |

## Tool Hub Card Copy

- Title: `주담대 원리금 계산기`
- Description: `대출금액, 금리, 기간, 상환방식으로 주택담보대출 월상환액과 총이자를 계산합니다.`
- Button: `월상환액 계산하기`
- Badge: `주담대·월상환액`

## Events

- `mortgage_payment_calculate`
- `tool_calculate`
- `mortgage_payment_next_click`
- Params: `source_tool=mortgageLoan`, `repayment_type`, `loan_amount_bucket`, `rate_bucket`, `term_years`, `has_result`

## Internal Links

- `/tools/dsr-ltv-calculator`
- `/tools/home-buying-budget-calculator`
- `/market/real-estate/seoul-top100`
- `/market/real-estate/magok-top100`

## Verification Results

| Check | Result | Detail |
| --- | --- | --- |
| equal payment monthly | PASS | actual=1,432,246원, expected=1,432,246원, delta=0원 |
| equal payment total interest | PASS | actual=215,608,519원, expected=215,608,519원, delta=0원 |
| equal principal first month | PASS | actual=1,833,333원, expected=1,833,333원, delta=0원 |
| equal principal last month | PASS | actual=836,111원, expected=836,111원, delta=0원 |
| equal principal total interest | PASS | actual=180,500,000원, expected=180,500,000원, delta=0원 |
| rate +1pp sensitivity | PASS | actual=178,219원, expected=178,219원, delta=0원 |
| core reuses DSR/LTV monthly payment | PASS | - |
| page route exists | PASS | pages/tools/mortgage-loan-calculator.js |
| SEO title/H1/description | PASS | - |
| WebApplication JSON-LD | PASS | - |
| BreadcrumbList JSON-LD | PASS | - |
| tool hub card | PASS | - |
| analytics path mapping | PASS | - |
| ToolResultCta mortgageLoan config | PASS | - |
| ToolBacklinkKit mortgageLoan config | PASS | - |
| known tool slug | PASS | - |
| sitemap config KO/EN | PASS | - |
| SEO split samples | PASS | - |
| events and params | PASS | - |
| result internal links | PASS | - |
| generated KO sitemap includes page | PASS | - |
| generated EN sitemap includes page | PASS | - |

## Remaining Risks

- Actual lending terms still require financial-institution review and may differ by credit profile, income recognition, regulations, stress DSR, collateral value, and guarantee conditions.
- The calculator does not automatically apply policy updates or bank-specific fee/rate rules.
- 320px/390px layout is designed to put the input card near the first viewport, but final visual QA should still be done in a browser.

## Final Predeploy Verification

- Checked at: 2026-07-21 KST
- Scope: verification and report update only; no feature or calculation logic changes after the final verification request.
- `git status --short`: confirmed the expected P1-2 working tree changes, including the new calculator files, sitemap outputs, and this audit report.
- Report existence: `reports/mortgage-loan-calculator-p1-2-audit.md` exists.

| Check | Result | Detail |
| --- | --- | --- |
| KO calculator URL | PASS | `/tools/mortgage-loan-calculator` returned 200, self canonical `https://www.finmaphub.com/tools/mortgage-loan-calculator`, no `noindex`, sitemap main/ko included |
| EN calculator URL | PASS | `/en/tools/mortgage-loan-calculator` returned 200, self canonical `https://www.finmaphub.com/en/tools/mortgage-loan-calculator`, no `noindex`, sitemap main/en/en-prefix included |
| KO tools hub card | PASS | `/tools` includes the `주담대 원리금 계산기` card and `/tools/mortgage-loan-calculator` href |
| EN tools hub card | PASS | `/en/tools` includes the `Mortgage Payment Calculator` card and `/en/tools/mortgage-loan-calculator` href |
| DSR/LTV result flow | PASS | `/tools/dsr-ltv-calculator` shows one mortgage calculator link; no duplicate or broken mortgageLoan link found |
| mortgageLoan result flow | PASS | mortgageLoan result area links to DSR/LTV and homeBuying; ToolResultCta related tool resolves to DSR/LTV |
| Mobile 320px | PASS | document/body scroll width stayed at 320px; input card top 230px; presets visible; result card and schedule section rendered; wide schedule table remained inside its scroll container |
| Mobile 390px | PASS | document/body scroll width stayed at 390px; input card top 245px; presets visible; result card and schedule section rendered; wide schedule table remained inside its scroll container |
| `git diff --check` | PASS | exit code 0; only CRLF conversion warnings were printed, no whitespace errors |

## Final Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `git status --short` | PASS | Expected modified/new files from P1-2 worktree confirmed |
| `node scripts\verify_mortgage_loan_calculator.js` | PASS | 22/22 checks passed; Node printed a non-fatal ES module reparsing warning |
| `node scripts\verify_tool_result_cta_events.js` | PASS | Required CTA and common analytics events passed |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS | New KO/EN calculator URLs passed 200/canonical/noindex/sitemap checks |
| `node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/tools/mortgage-loan-calculator https://www.finmaphub.com/en/tools/mortgage-loan-calculator https://www.finmaphub.com/tools` | PASS | All three URLs passed |
| `npm.cmd run build` | PASS | Next build compiled successfully; postbuild generated sitemap/channel sitemap outputs |
| `git diff --check` | PASS | No whitespace errors |

## Final Deployment Readiness

- Verdict: PASS for deployment readiness.
- No failing verification item required a code or calculation fix.
- Manual post-deploy check still recommended after production deploy: request the two new URLs and `/tools` in the live environment, then submit/recheck in Naver Search Advisor if needed.
