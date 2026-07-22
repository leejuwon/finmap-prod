# Search Growth P1-1B-2 EN Google/Bing Snippet Experiment

Date: 2026-07-22

## 1. Executive Summary

P1-1B-2 is a small EN-only Google/Bing experiment for three personal-finance posts:

- `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio`
- `/en/posts/personalFinance/annual-vs-monthly-compound`
- `/en/posts/personalFinance/is-dca-better-in-a-bear-market`

The change is limited to SERP-facing and first-answer elements: rendered title/H1, meta description, first paragraph, one upper calculator CTA, `dateModified`, and duplicate manual Article JSON-LD removal where present.

No calculator UI, calculator logic, calculator result, KO content, slug, canonical policy, hreflang policy, robots policy, GA4 event name, GA4 parameter name, or ad slot structure was changed.

## 2. Why Track A Was Separated

Track A is separated because the target URLs are EN pages with Google/Bing evidence, while the P1-1B-1 work focused on KO/Naver low-risk expansion. Mixing EN Google/Bing changes with KO/Naver changes would make post-deploy attribution muddy.

The EN HomeBuying change from P1-1B-1 is explicitly excluded from this experiment and must not be used as either a control URL or an experiment URL for Track A measurement.

## 3. Experiment Scope

Direct content scope:

- `content/posts/personalFinance/en/how-much-to-invest-monthly-for-target-portfolio.md`
- `content/posts/personalFinance/en/annual-vs-monthly-compound.md`
- `content/posts/personalFinance/en/is-dca-better-in-a-bear-market.md`

Direct support scope:

- `scripts/verify_search_growth_p1_1b_en_experiment.js`
- `reports/search-growth-90d-p1-1b-2-en-experiment-manifest.json`
- `reports/search-growth-90d-p1-1b-2-en-search-experiment.md`

Validation commands also refreshed existing generated audit files such as post link check output, channel split output, search-growth inventory/audit data, and sitemap outputs.

## 4. Search Performance Baseline

Baseline period requested: 2026-04-23 to 2026-07-19.

GSC merged page rows use the available GSC page range visible in the P1-1A merged data, 2026-06-17 to 2026-07-19. Bing rows use 2026-04-23 to 2026-07-19.

| URL | Engine | Clicks | Impressions | CTR | Position | Sample |
| --- | ------ | -----: | ----------: | --: | -------: | ------ |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | GSC | 0 | 1 | 0 | 29 | SUFFICIENT |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | Bing | 0 | 399 | 0 | 5.35 | SUFFICIENT |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | GSC | 0 | 5 | 0 | 9.6 | SUFFICIENT |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | Bing | 0 | 145 | 0 | 8.61 | SUFFICIENT |
| `/en/posts/personalFinance/is-dca-better-in-a-bear-market` | GSC | 0 | 3 | 0 | 4.67 | SUFFICIENT |
| `/en/posts/personalFinance/is-dca-better-in-a-bear-market` | Bing | 0 | 349 | 0 | 3.88 | SUFFICIENT |

Query evidence:

| URL | Query evidence status | Query impressions | Avg position | Representative queries |
| --- | --- | ---: | ---: | --- |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | HEURISTIC_QUERY_MATCH | 139 | 6.7917 | `how much should i invest monthly for a regular investment plan?`; `how much should i invest monthly for long-term regular investing?`; `how much should i invest monthly for regular contributions?` |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | HEURISTIC_QUERY_MATCH | 94 | 9.6485 | `compounding monthly vs annually`; `annual compounding vs monthly`; `compounded monthly vs annually` |
| `/en/posts/personalFinance/is-dca-better-in-a-bear-market` | HEURISTIC_QUERY_MATCH | 40 | 4.6 | `dollar cost averaging etf allocation monthly 2026`; `should i continue dollar-cost averaging or hold onto the investment after a 15% loss?`; `is dollar-cost averaging suitable for big market declines?` |

## 5. Data Limitations

There is no page-query confirmation export, so query-to-URL mapping is not treated as a verified fact. The query evidence is marked as `HEURISTIC_QUERY_MATCH` and should be read as `QUERY_URL_NOT_CONFIRMED`.

GSC impressions are small for all three pages, so short-term CTR or position movement can be noisy. Bing has more impressions and is the more useful early signal for this specific experiment.

Target 1 does not have an explicit KO counterpart source file. The current renderer still emits a same-slug KO alternate under the existing policy, but this experiment did not change hreflang policy or add a KO counterpart.

## 6. Target 1 Before

URL: `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio`

- Previous rendered title/H1: `How Much Should You Invest Monthly to Reach a Target Portfolio?`
- Previous rendered meta description: `Learn how monthly contributions, return assumptions, fees, and taxes affect your target portfolio goal. Use the DCA calculator to estimate the monthly investment needed to reach your target.`
- Previous first visible content started with a bullet list, so the direct answer was not the first meaningful paragraph.
- Previous dateModified: `2026-05-28`
- Previous upper CTA: no explicit upper `tool-cta`; DCA and Goal Simulator links existed lower in the body.
- Inbound internal links: 2
- Outbound internal links: 4

## 7. Target 1 Changes

The target intent remains monthly investment needed for a target portfolio.

- New rendered title/H1: `Monthly Investment Needed to Reach a Target Portfolio`
- New rendered meta description: `The monthly investment needed depends on your current balance, target amount, timeline, expected return, fees, and taxes. Use the goal simulator to compare required contributions without treating the result as a guaranteed return.`
- New first answer states that monthly investment depends on current balance, target amount, time horizon, expected return, fees, and taxes.
- Added one upper Goal Simulator CTA: `Calculate the monthly investment for your goal` -> `/en/tools/goal-simulator`
- Updated `dateModified` to `2026-07-22`.
- Removed duplicate manual Article JSON-LD; automatic BlogPosting remains.

## 8. Target 2 Before

URL: `/en/posts/personalFinance/annual-vs-monthly-compound`

- Previous rendered title/H1: `Annual vs Monthly Compounding: Monthly Compound Interest Examples`
- Previous rendered meta description: `Learn how annual and monthly compounding differ, compare the results in a table, and use the compound interest calculator to test your own assumptions.`
- Previous first paragraph answered the topic but did not warn clearly about APY/effective-rate double counting.
- Previous dateModified: `2026-06-19`
- Previous upper CTA: no explicit upper `tool-cta`; calculator links existed in the body.
- Inbound internal links: 5
- Outbound internal links: 5

## 9. Target 2 Changes

The target intent remains annual versus monthly compounding.

- New rendered title/H1: `Annual vs Monthly Compounding: Which Grows Faster?`
- New rendered meta description: `Monthly compounding can grow slightly faster than annual compounding at the same nominal rate. Compare examples by rate, time horizon, and contributions, and avoid double-counting APY or effective annual rates.`
- New first answer clarifies nominal annual rate, frequency, rate/time sensitivity, and APY/effective-rate caution.
- Added one upper Compound Interest Calculator CTA: `Compare annual and monthly compounding` -> `/en/tools/compound-interest`
- Updated `dateModified` to `2026-07-22`.
- No manual Article JSON-LD existed in the prior version.

## 10. Target 3 Before

URL: `/en/posts/personalFinance/is-dca-better-in-a-bear-market`

- Previous rendered title/H1: `Is Dollar-Cost Averaging Better in a Bear Market?`
- Previous rendered meta description: `Explore how dollar-cost averaging behaves in bear-market scenarios. Compare early, mid-period, and final-year drawdowns using a simple DCA simulation framework.`
- Previous first visible content started with a bullet list, so the direct conditional answer was not the first meaningful paragraph.
- Previous dateModified: `2026-05-28`
- Previous upper CTA: no explicit upper `tool-cta`; DCA Calculator links existed in the body.
- Inbound internal links: 0
- Outbound internal links: 4
- Explicit hreflang mapping existed and was preserved.

## 11. Target 3 Changes

The target intent remains conditional DCA versus lump-sum judgment in bear markets.

- Rendered title/H1 kept unchanged: `Is Dollar-Cost Averaging Better in a Bear Market?`
- New rendered meta description: `DCA is not automatically better in every bear market. Compare when dollar-cost averaging can reduce timing risk, when lump-sum investing can recover faster, and how drawdown timing changes the result.`
- New first answer says DCA is not automatically better, can reduce timing risk when prices keep falling, and lump-sum can outperform when recovery happens early.
- Added one upper DCA Calculator CTA: `Compare DCA and lump-sum scenarios` -> `/en/tools/dca-calculator`
- Updated `dateModified` to `2026-07-22`.
- Removed duplicate manual Article JSON-LD; automatic BlogPosting remains.
- Preserved explicit hreflang:
  - KO: `/posts/personalFinance/is-dca-better-in-bear-market`
  - EN: `/en/posts/personalFinance/is-dca-better-in-a-bear-market`

## 12. Title Candidate Review

| URL | Candidate | Text | Strength | Risk | Selected |
| --- | --------- | ---- | -------- | ---- | -------- |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | Current | `How Much Should You Invest Monthly to Reach a Target Portfolio?` | Clear question format | Longer and less compact in SERP | No |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | A | `Monthly Investment Needed to Reach a Target Portfolio` | Front-loads the exact planning intent | Less conversational than the old title | Yes |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | B | `How Much to Invest Monthly for a Target Portfolio` | Still query-aligned | Less direct as a noun phrase | No |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | C | `Target Portfolio Monthly Investment Calculator Guide` | Signals the tool angle | Over-promises a calculator guide and adds generic wording | No |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | Current | `Annual vs Monthly Compounding: Monthly Compound Interest Examples` | Contains query terms | Repeats monthly/compound and feels bulky | No |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | A | `Annual vs Monthly Compounding: Which Grows Faster?` | Directly answers the search question | Slightly broader than examples-only framing | Yes |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | B | `Annual vs Monthly Compounding: Examples and Calculator` | Signals examples and tool use | Risks sounding like a calculator page | No |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | C | `Monthly vs Annual Compounding: Effective Rate Difference` | Technically precise | Too narrow and less natural for broad queries | No |
| `/en/posts/personalFinance/is-dca-better-in-a-bear-market` | Current | `Is Dollar-Cost Averaging Better in a Bear Market?` | Strong exact question; already Bing page-one | None material | Yes |
| `/en/posts/personalFinance/is-dca-better-in-a-bear-market` | A | `DCA in a Bear Market: When It Helps and When It Does Not` | Good conditional framing | Less exact than the current question | No |
| `/en/posts/personalFinance/is-dca-better-in-a-bear-market` | B | `Dollar-Cost Averaging vs Lump Sum in a Bear Market` | Matches comparison angle | Shifts too far toward generic DCA vs lump sum | No |
| `/en/posts/personalFinance/is-dca-better-in-a-bear-market` | C | `Should You Keep Dollar-Cost Averaging During a Bear Market?` | Matches some query wording | Could imply personal advice | No |

## 13. Meta Description Review

| URL | Element | Before | After | Reason | Risk |
| --- | ------- | ------ | ----- | ------ | ---- |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | Meta description | `Learn how monthly contributions, return assumptions, fees, and taxes affect your target portfolio goal. Use the DCA calculator to estimate the monthly investment needed to reach your target.` | `The monthly investment needed depends on your current balance, target amount, timeline, expected return, fees, and taxes. Use the goal simulator to compare required contributions without treating the result as a guaranteed return.` | Gives the answer first and points to the representative Goal Simulator instead of making this a DCA-only page. | Low to medium |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | Meta description | `Learn how annual and monthly compounding differ, compare the results in a table, and use the compound interest calculator to test your own assumptions.` | `Monthly compounding can grow slightly faster than annual compounding at the same nominal rate. Compare examples by rate, time horizon, and contributions, and avoid double-counting APY or effective annual rates.` | Directly states the result and adds the effective-rate caveat. | Low to medium |
| `/en/posts/personalFinance/is-dca-better-in-a-bear-market` | Meta description | `Explore how dollar-cost averaging behaves in bear-market scenarios. Compare early, mid-period, and final-year drawdowns using a simple DCA simulation framework.` | `DCA is not automatically better in every bear market. Compare when dollar-cost averaging can reduce timing risk, when lump-sum investing can recover faster, and how drawdown timing changes the result.` | Makes the conditional answer visible in SERP copy. | Low to medium |

## 14. H1 Review

| URL | Element | Before | After | Reason | Risk |
| --- | ------- | ------ | ----- | ------ | ---- |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | H1 | `How Much Should You Invest Monthly to Reach a Target Portfolio?` | `Monthly Investment Needed to Reach a Target Portfolio` | Aligns page H1 with the selected title and query intent. | Low |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | H1 | `Annual vs Monthly Compounding: Monthly Compound Interest Examples` | `Annual vs Monthly Compounding: Which Grows Faster?` | Keeps one clear compounding comparison question. | Low |
| `/en/posts/personalFinance/is-dca-better-in-a-bear-market` | H1 | `Is Dollar-Cost Averaging Better in a Bear Market?` | `Is Dollar-Cost Averaging Better in a Bear Market?` | Already strong and page-one aligned; preserved. | Low |

## 15. First-Answer Improvements

| URL | Element | Before | After | Reason | Risk |
| --- | ------- | ------ | ----- | ------ | ---- |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | First answer | The page began with bullets and did not lead with a full answer sentence. | Leads with dependency on current balance, target amount, horizon, expected return, fees, and taxes. | Helps snippet extraction and user orientation. | Low |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | First answer | It said monthly compounding grows faster but did not mention nominal/effective rate caution. | Adds nominal-rate condition and APY/effective-rate double-counting caution. | Reduces misleading calculator interpretation. | Low |
| `/en/posts/personalFinance/is-dca-better-in-a-bear-market` | First answer | The page began with bullets and did not lead with a conditional conclusion. | Leads with "not automatically better", falling-price timing risk, and early-recovery lump-sum case. | Avoids overclaiming and improves answer completeness. | Low |

## 16. Calculator CTA Changes

Each page has exactly one explicit upper `.tool-cta` block.

| URL | CTA anchor | Target | Event |
| --- | --- | --- | --- |
| `/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio` | `Calculate the monthly investment for your goal` | `/en/tools/goal-simulator` | `related_calculator_click` |
| `/en/posts/personalFinance/annual-vs-monthly-compound` | `Compare annual and monthly compounding` | `/en/tools/compound-interest` | `related_calculator_click` |
| `/en/posts/personalFinance/is-dca-better-in-a-bear-market` | `Compare DCA and lump-sum scenarios` | `/en/tools/dca-calculator` | `related_calculator_click` |

CTA targets are EN canonical tool routes and returned HTTP 200 in rendered validation.

## 17. KO Counterpart Protection

KO source diff check was clean for:

- `content/posts/personalFinance/ko/how-much-per-month-for-100m.md`
- `content/posts/personalFinance/ko/goal-amount-fast-strategy.md`
- `content/posts/personalFinance/ko/annual-vs-monthly-compound.md`
- `content/posts/personalFinance/ko/is-dca-better-in-bear-market.md`

Target 1 has no explicit KO source counterpart in the current mapping. The existing renderer's same-slug alternate behavior was not changed.

Target 2 same-slug KO reciprocal mapping passed.

Target 3 explicit KO/EN reciprocal mapping passed.

## 18. Hreflang Verification

Custom verifier:

- `node scripts\verify_search_growth_p1_1b_en_experiment.js --base-url=http://127.0.0.1:8002`
- Result: `170/170 checks passed`

Existing channel split verifier:

- `node scripts\verify_seo_channel_split.js --local-server`
- Result: PASS for tested channel URLs, including the explicit DCA KO/EN pair.

Existing post-publish verifier:

- `node scripts\verify_post_publish_urls.js --local-server ...`
- Result: PASS for 5 URLs:
  - `https://www.finmaphub.com/en/posts/personalFinance/how-much-to-invest-monthly-for-target-portfolio`
  - `https://www.finmaphub.com/en/posts/personalFinance/annual-vs-monthly-compound`
  - `https://www.finmaphub.com/posts/personalFinance/annual-vs-monthly-compound`
  - `https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-a-bear-market`
  - `https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-bear-market`

The DCA explicit mapping stayed:

- EN canonical: `https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-a-bear-market`
- KO alternate: `https://www.finmaphub.com/posts/personalFinance/is-dca-better-in-bear-market`
- EN alternate: `https://www.finmaphub.com/en/posts/personalFinance/is-dca-better-in-a-bear-market`
- Sitemap reciprocal xhtml links: present.

## 19. Structured Data

Rendered JSON-LD for each target contains:

- `BlogPosting`
- `BreadcrumbList`
- `FAQPage`

Article-like block count is exactly 1 per page because the automatic `BlogPosting` remains and duplicate manual Article JSON-LD was removed where it existed.

FAQPage JSON-LD matched visible FAQ questions for all three targets.

## 20. GA4 Event Review

The upper CTA uses the existing post CTA event pattern:

- Event name: `related_calculator_click`
- Existing style attributes preserved: `data-source-post`, `data-cta-position`, `data-source-tool`

No new GA4 event names were introduced. `tool_nav_click` and `blog_engagement` behavior was not modified. No calculator event names or parameters were changed.

## 21. Snippet Hygiene

Rendered first meaningful text was a real answer paragraph for all three target pages:

- Target 1: monthly investment depends on current balance, target amount, time horizon, return, fees, and taxes.
- Target 2: monthly compounding can grow faster at the same nominal rate and APY/effective-rate double counting should be avoided.
- Target 3: DCA is not automatically better in every bear market.

`Views 0` was not exposed. Post share and comments regions kept `data-nosnippet`.

`node scripts\verify_search_snippet_hygiene.js --base-url=http://127.0.0.1:8002` passed for its configured sample set and wrote `reports\search-growth-90d-p0-2a-snippet-hygiene-rendered.json`. The script reported console errors from local resource loading on some pages, but hydration error count was 0 and overflow was false for the checked mobile pages.

## 22. Mobile Verification

Custom verifier used local rendering and browser checks at 320px and 390px.

Results:

- Target 1: 320/320 and 390/390, no horizontal overflow, one H1, no page errors, no hydration errors.
- Target 2: 320/320 and 390/390, no horizontal overflow, one H1, no page errors, no hydration errors.
- Target 3: 320/320 and 390/390, no horizontal overflow, one H1, no page errors, no hydration errors.

## 23. Files Changed

Direct P1-1B-2 files:

- `content/posts/personalFinance/en/how-much-to-invest-monthly-for-target-portfolio.md`
- `content/posts/personalFinance/en/annual-vs-monthly-compound.md`
- `content/posts/personalFinance/en/is-dca-better-in-a-bear-market.md`
- `scripts/verify_search_growth_p1_1b_en_experiment.js`
- `reports/search-growth-90d-p1-1b-2-en-experiment-manifest.json`
- `reports/search-growth-90d-p1-1b-2-en-search-experiment.md`

Validation-generated or refreshed files observed during this pass:

- `reports/posts.linkcheck.json`
- `reports/seo-channel-split-url-check.md`
- `reports/search-growth-90d-url-inventory.csv`
- `reports/search-growth-90d-audit-data.json`
- `reports/search-growth-90d-p0-2a-snippet-hygiene-rendered.json`
- sitemap outputs under `public/`

The repository already contained unrelated modified/untracked files from prior work; they were not reverted or edited for this EN experiment.

## 24. Diff Size

Direct EN post diff:

| File | Insertions | Deletions |
| --- | ---: | ---: |
| `content/posts/personalFinance/en/how-much-to-invest-monthly-for-target-portfolio.md` | 14 | 27 |
| `content/posts/personalFinance/en/annual-vs-monthly-compound.md` | 13 | 7 |
| `content/posts/personalFinance/en/is-dca-better-in-a-bear-market.md` | 10 | 23 |

New support artifact sizes:

| File | Lines |
| --- | ---: |
| `scripts/verify_search_growth_p1_1b_en_experiment.js` | 423 |
| `reports/search-growth-90d-p1-1b-2-en-experiment-manifest.json` | 172 |
| `reports/search-growth-90d-p1-1b-2-en-search-experiment.md` | 284 |

## 25. Commands and Results

| Command | Result |
| --- | --- |
| `node --check scripts\verify_search_growth_p1_1b_en_experiment.js` | PASS |
| `npm.cmd run check:posts-links` | PASS. Broken 0, Suspicious 0, self URL missing 0. |
| `npm.cmd run build` | PASS. Next build and postbuild sitemap generation completed. |
| `node scripts\verify_search_growth_p1_1b_en_experiment.js --base-url=http://127.0.0.1:8002` | PASS. `170/170 checks passed`. |
| `node scripts\verify_search_snippet_hygiene.js --base-url=http://127.0.0.1:8002` | PASS for configured sample set; mobile overflow false and hydration 0 in reported checks. |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS. Channel sitemap and sampled canonical/hreflang checks passed. |
| `node scripts\audit_search_growth_baseline.js` | PASS. Inventory/audit regenerated; 192 URLs audited. |
| `node scripts\verify_post_publish_urls.js --local-server ...` | PASS. Five target/reciprocal URLs passed canonical, sitemap, robots, noindex, and hreflang checks. |
| `git diff --check` | PASS. Exit 0; CRLF normalization warnings only. |
| `git status --short --untracked-files=all` | PASS for visibility. Worktree remains dirty with P1-1B-2 files plus pre-existing prior-task changes. |

## 26. No Functional Changes

The following were not changed:

- KO content
- Slugs
- Calculator UI
- Calculator logic
- Calculator results
- GA4 event names and parameter names
- Ads
- Canonical policy
- Hreflang policy
- Robots policy
- Sitemap policy

## 27. Experiment Manifest

Manifest file:

- `reports/search-growth-90d-p1-1b-2-en-experiment-manifest.json`

It records URL, source file, deployment group, baseline dates, GSC/Bing baseline, query evidence, previous/new title, previous/new description, previous/new H1, first paragraph change, CTA change, dateModified before/after, risk, observation days, and excluded related changes.

## 28. 28-Day Observation Plan

Use the production deployment date as day 0. Do not use this local edit date as the live experiment start unless the changes are deployed the same day.

Recommended 28-day check fields:

- URL
- Deployment date
- 28-day check date
- Google clicks, impressions, CTR, average position
- Bing clicks, impressions, CTR, average position
- Existing query group retained
- New irrelevant query group observed
- CTA event volume and duplicate-event check

Exclude the deployment day if it is only a partial data day.

## 29. 6-Week Observation Plan

Run a 42-day comparison when possible because GSC volume is small and Bing is the main early signal.

Compare the same-length pre/post windows when data availability allows. Mark page-query evidence as inferred unless a page-query export becomes available.

## 30. Rollback Conditions

Review a partial rollback for an individual URL if one of these appears after the minimum observation window:

- Impressions fall materially versus a comparable pre-period.
- Average position declines persistently and materially.
- The old query cluster disappears.
- CTR and impressions decline together.
- The page starts ranking for a clearly wrong intent.
- Canonical or hreflang errors appear.
- KO counterpart pages show unintended impact.
- CTA events duplicate.
- Mobile layout regresses.

Do not roll back on one-day or one-week noise when sample size is very small.

## 31. Recommended Next Step

After deployment, run a P1-1C pre/post observation setup that covers P1-1B-1 and P1-1B-2 together, but keep measurement groups separate:

- KO/Naver low-risk expansion group
- EN Google/Bing snippet experiment group

No additional content changes are recommended before that integrated audit.
