# EN Monthly Investment Cannibalization Audit

Date: 2026-06-19

## Scope

Compared two English personal-finance posts:

1. `content/posts/personalFinance/en/monthly-investment-for-100m-table.md`
2. `content/posts/personalFinance/en/how-much-to-invest-monthly-for-target-portfolio.md`

This audit did not edit content, slugs, canonical, hreflang, noindex, sitemap, robots, or templates.

## Decision Summary

| Item | Finding |
| --- | --- |
| overlap level | `medium` |
| primary URL candidate | `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` |
| secondary URL role | `/en/posts/personalFinance/monthly-investment-for-100m-table` as a monthly contribution table / `$100,000` and `KRW 100M Korea example` reference page |
| title/seoTitle differentiation needed? | Yes |
| internal link direction | Secondary should support the primary guide; primary should link back to the table page only as a reference table/Korea example |
| canonical/hreflang/noindex change needed? | No |

The two pages are not identical in structure, but they currently share a very similar head term and the exact same visible title/H1:

`How Much Should You Invest Monthly to Reach a Target Portfolio?`

That creates avoidable cannibalization risk for the broad query family around "how much should I invest monthly to reach a target portfolio."

## Frontmatter Comparison

| Field | `monthly-investment-for-100m-table` | `how-much-to-invest-monthly-for-target-portfolio` | Overlap assessment |
| --- | --- | --- | --- |
| title | `How Much Should You Invest Monthly to Reach a Target Portfolio?` | `How Much Should You Invest Monthly to Reach a Target Portfolio?` | High. Exact duplicate. |
| seoTitle | `Monthly Investment Calculator Guide \| Target Portfolio Contribution Table` | `How Much Should You Invest Monthly to Reach a Target Portfolio?` | Medium. Different wording, but both target the same core intent. |
| description | Estimate monthly investment needed using target amount, time horizon, return assumptions, and contribution tables. | Learn how monthly contributions, return assumptions, fees, and taxes affect target portfolio goal. | Medium-high. Same planning frame, different emphasis. |
| seoDescription | Includes `$100,000` and `KRW 100M` examples across returns and timelines. | Uses DCA calculator to estimate monthly investment needed for target. | Medium. Secondary has table/examples; primary has calculator/DCA intent. |
| tags | `monthly investment calculator`, `target portfolio`, `monthly contribution table`, `goal calculator`, `DCA`, `compound interest`, `portfolio planning` | `target portfolio`, `monthly investing`, `dca`, `dollar cost averaging`, `after tax value`, `investment simulator`, `goal planning` | Medium. Shared target/DCA space, but primary is more after-tax/DCA oriented. |

## H1, Intro, Structure, Tables, FAQ, CTA

### H1 / Title

The blog template renders the post title as the page H1. Because both titles are identical, both pages currently have the same H1.

This is the strongest overlap point and the clearest future differentiation candidate.

### Intro

| Page | Intro direction | Assessment |
| --- | --- | --- |
| `monthly-investment-for-100m-table` | Starts with target amount, current balance, time horizon, expected return, then immediately gives `$100,000` monthly contribution examples. | Better suited to table/reference intent. |
| `how-much-to-invest-monthly-for-target-portfolio` | Starts with bullets about after-tax target value, fees, taxes, DCA calculator, and contribution sufficiency. | Better suited to general calculator/use-case intent. |

The intros overlap on the same broad question, but the angle differs enough to separate if titles and internal links are clarified.

### Main Sections

| Page | Main section pattern | Role signal |
| --- | --- | --- |
| `monthly-investment-for-100m-table` | Quick Answer, formula, `$100,000` target table, return sensitivity, `KRW 100M Korea Example`, input effect table, related tools. | Reference table and Korea example. |
| `how-much-to-invest-monthly-for-target-portfolio` | After-tax target, timeline effect, return assumptions, current contribution sufficiency, DCA calculator workflow. | Primary calculator guide and planning workflow. |

The section structure is meaningfully different, but both contain timeline and return-assumption tables. The difference should be made more explicit through title and intro.

### Tables

| Page | Table intent |
| --- | --- |
| `monthly-investment-for-100m-table` | `$100,000` contribution table, return sensitivity table, `KRW 100M` Korea example table, input-effect table. |
| `how-much-to-invest-monthly-for-target-portfolio` | Timeline table, return assumption table, current contribution progress table. |

The table overlap is acceptable if the first page is positioned as a "monthly contribution table" and the second remains the "DCA calculator / after-tax target planning" guide.

### FAQ

| Page | FAQ angle | Overlap assessment |
| --- | --- | --- |
| `monthly-investment-for-100m-table` | How much monthly, `$100,000` vs `KRW 100M`, 7% vs 10%, taxes/fees, calculator choice. | Medium. Broad target-portfolio FAQ. |
| `how-much-to-invest-monthly-for-target-portfolio` | Pre-tax vs after-tax target, return assumption selection, shortfall, fees/taxes, forecast disclaimer. | Medium-low. More after-tax and DCA-specific. |

The FAQ sets are not exact duplicates, but the first question in `monthly-investment-for-100m-table` overlaps strongly with the primary article's title and core intent.

### CTA / Internal Links

| Page | CTA emphasis |
| --- | --- |
| `monthly-investment-for-100m-table` | Goal Simulator, DCA Calculator, Compound Interest Calculator; links to the primary target-portfolio article. |
| `how-much-to-invest-monthly-for-target-portfolio` | DCA Calculator first, then Compound Interest Calculator and Goal Simulator; links to monthly DCA example. |

Current internal linking is mostly logical because the secondary page links to the primary page. The primary page does not currently appear to link back to `monthly-investment-for-100m-table`.

## Search Intent Judgment

The overlap is `medium`, with one `high` risk area:

- High overlap: title/H1 exact duplicate.
- Medium overlap: broad target portfolio monthly investment intent.
- Medium-low overlap: body structure, because one page is table/reference/KRW example and the other is DCA/after-tax calculator workflow.
- Low overlap: FAQ exact duplication, because question wording and emphasis differ.

Recommended ownership:

- Primary broad intent: `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio`
- Secondary table/reference intent: `/en/posts/personalFinance/monthly-investment-for-100m-table`

## Suggested Differentiation Candidates

No edits were made in this audit. If a future content pass is approved, consider:

| Page | Suggested role | Possible title direction |
| --- | --- | --- |
| `how-much-to-invest-monthly-for-target-portfolio` | General EN-only target portfolio calculator guide. Owns broad query: "how much should I invest monthly to reach a target portfolio." | Keep close to current title. |
| `monthly-investment-for-100m-table` | Supporting table/reference page with `$100,000` and `KRW 100M` examples. | `Monthly Contribution Table for a $100,000 Target Portfolio and KRW 100M Goal` |

For `monthly-investment-for-100m-table`, future differentiation could also emphasize:

- monthly contribution table,
- `$100,000` target example,
- `KRW 100M Korea example`,
- return assumption table,
- calculator reference table.

Avoid letting it compete for the exact same broad "How much should you invest monthly to reach a target portfolio?" head query.

## Internal Link Direction

Recommended link hierarchy:

1. `monthly-investment-for-100m-table` should link prominently to `how-much-to-invest-monthly-for-target-portfolio` as the general guide.
2. `how-much-to-invest-monthly-for-target-portfolio` can link back to `monthly-investment-for-100m-table` only as a supporting table/Korea example, not as another equal guide.
3. Calculator anchors should remain differentiated:
   - primary guide: DCA Calculator / after-tax target workflow,
   - secondary page: Goal Simulator / contribution table / `$100,000` and `KRW 100M` examples.

## Canonical, Hreflang, Noindex

No canonical, hreflang, or noindex change is recommended.

Reason:

- Both URLs can serve distinct roles if title/intro positioning is clarified.
- The secondary URL has a legitimate KO-pair/table/KRW 100M reference role.
- The primary URL has a legitimate EN-only broad calculator guide role.
- Deleting, redirecting, canonicalizing, or noindexing either page would be too heavy for the current issue.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `git diff --check` | PASS | Exit code 0. No whitespace errors reported. |

## Final Recommendation

Do not change URL, slug, canonical, hreflang, or noindex.

If a future edit is approved, prioritize title/H1 differentiation for `monthly-investment-for-100m-table` so it clearly owns the table/reference/KRW example role, while `how-much-to-invest-monthly-for-target-portfolio` remains the primary general target-portfolio calculator guide.
