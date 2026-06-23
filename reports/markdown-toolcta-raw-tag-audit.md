# Finmap Markdown ToolCta Raw Tag Audit

Date: 2026-06-23

## Summary

- Audit scope: `content/posts/**/*.md`
- Initial Markdown findings: 43 `<ToolCta ... />` occurrences in 25 files
- Final Markdown check: no `<ToolCta` occurrences
- Final built HTML check: no raw `<toolcta` occurrences under `.next/server/pages`
- Fix scope: raw Markdown component tags only
- SEO/routing unchanged: title, description, dateModified, tool, cover, canonical, hreflang, robots, sitemap policy, `SeoHead`, and routing files were not modified by this task

## Markdown Findings

| File | Initial count | Action |
| --- | ---: | --- |
| `content/posts/economicInfo/en/gold-geopolitics-real-rates-dollar-uncertainty.md` | 1 | Replaced raw tag with a short CAGR calculator link paragraph |
| `content/posts/economicInfo/en/hormuz-risk-oil-insurance-freight-premium.md` | 1 | Replaced raw tag with a short DCA calculator link paragraph |
| `content/posts/economicInfo/en/oil-shock-to-usdkrw-korea-transmission.md` | 1 | Replaced raw tag with a short DCA calculator link paragraph |
| `content/posts/economicInfo/en/war-theme-investing-price-chain-not-winners.md` | 1 | Replaced raw tag with a short CAGR calculator link paragraph |
| `content/posts/economicInfo/ko/gold-geopolitics-real-rates-dollar-uncertainty.md` | 1 | Replaced raw tag with a short CAGR calculator link paragraph |
| `content/posts/economicInfo/ko/hormuz-risk-oil-insurance-freight-premium.md` | 1 | Replaced raw tag with a short DCA calculator link paragraph |
| `content/posts/economicInfo/ko/oil-shock-to-usdkrw-korea-transmission.md` | 1 | Replaced raw tag with a short DCA calculator link paragraph |
| `content/posts/investingInfo/en/modern-6040-risk-budget.md` | 3 | Replaced raw tags with short goal, DCA, and CAGR calculator link paragraphs |
| `content/posts/investingInfo/en/rates-discount-mortgage-demand-apt-prices.md` | 2 | Replaced raw tags with short CAGR and goal calculator link paragraphs |
| `content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md` | 2 | Replaced raw tags with short CAGR and goal calculator link paragraphs |
| `content/posts/personalFinance/en/apt-dashboard-home-goal-roadmap.md` | 2 | Replaced raw tags with short goal and CAGR calculator link paragraphs |
| `content/posts/personalFinance/en/dca-fx-volatility-decomposition.md` | 2 | Removed raw tags because nearby DCA calculator links already existed |
| `content/posts/personalFinance/en/dca-step-up-ruleset.md` | 2 | Removed raw tags because nearby DCA calculator links already existed |
| `content/posts/personalFinance/en/dca-vs-lumpsum-decision-rules.md` | 2 | Removed raw tags because nearby DCA calculator links already existed |
| `content/posts/personalFinance/en/fire-3-numbers-spending-horizon-withdrawal.md` | 2 | Removed raw tags because nearby FIRE calculator links already existed |
| `content/posts/personalFinance/en/fire-assumption-errors-7-fixes.md` | 2 | Removed raw tags because nearby FIRE calculator links already existed |
| `content/posts/personalFinance/en/fire-sequence-risk-first-5-years.md` | 2 | Removed raw tags because nearby FIRE calculator links already existed |
| `content/posts/personalFinance/en/fire-spending-buckets-essential-choice-insurance.md` | 2 | Removed raw tags because nearby FIRE calculator links already existed |
| `content/posts/personalFinance/en/simple-vs-compound.md` | 2 | Replaced raw tags with short compound interest and CAGR calculator link paragraphs |
| `content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md` | 1 | Replaced raw tag with a short goal calculator link paragraph |
| `content/posts/personalFinance/ko/dca-step-up-ruleset.md` | 2 | Removed raw tags because nearby DCA calculator links already existed |
| `content/posts/personalFinance/ko/fire-3-numbers-spending-horizon-withdrawal.md` | 2 | Removed raw tags because nearby FIRE calculator links already existed |
| `content/posts/personalFinance/ko/fire-assumption-errors-7-fixes.md` | 2 | Removed raw tags because nearby FIRE calculator links already existed |
| `content/posts/personalFinance/ko/fire-sequence-risk-first-5-years.md` | 2 | Removed one raw tag and replaced one with a short FIRE calculator link paragraph |
| `content/posts/personalFinance/ko/fire-spending-buckets-essential-choice-insurance.md` | 2 | Removed raw tags because nearby FIRE calculator links already existed |

## Built HTML Raw Tag Check

Initial stale build output had raw `<toolcta>` tags corresponding to the Markdown files above. After replacing/removing the Markdown component tags and rebuilding, the final check returned no matches:

```text
rg -n "<toolcta" .next/server/pages
# no output
```

The corrected URL set was also checked through `verify_post_publish_urls.js`; all checked URLs returned `PASS`.

## Replacement Rules Used

| Tool type | Link used |
| --- | --- |
| `dca` | `/tools/dca-calculator` |
| `compound` / `comp` | `/tools/compound-interest` |
| `cagr` | `/tools/cagr-calculator` |
| `goal` | `/tools/goal-simulator` |
| `fire` | `/tools/fire-calculator` |
| `dsrLtv` / `dsr-ltv` | `/tools/dsr-ltv-calculator` |

If an equivalent calculator link already existed near the raw tag, only the raw tag line was removed. If removing the raw tag would have removed the only visible calculator path in that section, a short plain HTML paragraph with the calculator link was added.

## Files Actually Modified By This Audit

The files modified for this raw tag audit are the 25 Markdown files listed in the Markdown Findings table. Some additional content files were already dirty from earlier KO Batch 4/4.1 work and were left as-is.

## Verification

| Check | Result |
| --- | --- |
| `rg -n "<ToolCta" content/posts` | PASS: no matches |
| `npm.cmd run build` | PASS |
| `rg -n "<toolcta" .next/server/pages` | PASS: no matches |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS: sitemap counts `main=199`, `ko=101`, `en=98`, `enPrefix=98`; required EN URLs `16/16`; sampled URLs PASS |
| `node scripts\verify_post_publish_urls.js --local-server ...` | PASS: 27 checked post URLs PASS |
| `git diff --check` | PASS: no whitespace errors; Git printed LF/CRLF working-copy warnings only |

## Notes

- `npm.cmd run build` regenerated sitemap artifacts and `reports/seo-channel-split-url-check.md`; those generated changes were restored after verification because they are outside this task's commit scope.
- No content tone rewrite was performed.
- No new post, route, sitemap, robots, canonical, hreflang, or `SeoHead` change was made.
