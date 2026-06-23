# DSR/LTV Tool Label Mapping Audit

Date: 2026-06-23

## Summary

- `dsrLtv` is a real tool id in the codebase. It is used by `ToolBacklinkKit`, analytics, and recent Korean post frontmatter.
- Category list cards were missing labels for both `dsrLtv` and the existing hyphenated alias `dsr-ltv`.
- Post detail pages had a `dsrLtv` label, but did not have a `dsr-ltv` alias in the local `TOOL_LABELS` map.
- `ToolBacklinkKit` already supported `dsrLtv` and `dsr-ltv` aliases, but visible copy used `DSR LTV` without the slash.
- Minimal fix applied: add/standardize labels only. No content, sitemap, robots, SeoHead, canonical, hreflang, or routing policy changes were made.

## Content Usage

### `dsrLtv`

`rg -n "tool:.*dsrLtv" content\posts`

| File | Usage |
| --- | --- |
| `content/posts/economicInfo/ko/geopolitics-oil-fx-dashboard.md` | `tool: ["dsrLtv"]` |
| `content/posts/personalFinance/ko/apt-dashboard-home-goal-roadmap.md` | `tool: ["dsrLtv","goal"]` |
| `content/posts/investingInfo/ko/seoul-gyeonggi-incheon-risk-budget-framework.md` | `tool: ["dsrLtv"]` |

### `dsr-ltv`

`rg -n "tool:.*dsr-ltv" content\posts`

| File | Usage |
| --- | --- |
| `content/posts/personalFinance/ko/cash-100m-200m-300m-apartment-budget.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/en/cash-100m-200m-300m-apartment-budget.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/ko/dsr-pass-ltv-cash-bottleneck.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/en/dsr-40-income-loan-limit-table.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/en/dsr-pass-ltv-cash-bottleneck.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/ko/interest-rate-1p-loan-limit-impact.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/en/interest-rate-1p-loan-limit-impact.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/ko/mortgage-risk-checklist-dsr-variable.md` | `tool: ["dsr-ltv"]` |
| `content/posts/personalFinance/en/mortgage-risk-checklist-dsr-variable.md` | `tool: ["dsr-ltv"]` |

## Rendering Risk

| Area | Before | Risk |
| --- | --- | --- |
| Category card labels | `pages/category/[slug].js` did not define `dsrLtv` or `dsr-ltv` in `TOOL_LABELS`. | Tool badges could fall back to raw ids such as `dsrLtv` or `dsr-ltv`. |
| Post detail tool badges | `pages/posts/[category]/[slug].js` defined `dsrLtv`, but not `dsr-ltv`. | Existing posts using `dsr-ltv` could show the raw id in detail metadata/tool badges. |
| ToolBacklinkKit | Canonical id and aliases existed. Visible labels used `DSR LTV`. | Functional risk was low, but display copy was inconsistent with the requested slash style. |

## Changes Applied

| File | Change |
| --- | --- |
| `pages/category/[slug].js` | Added `dsrLtv` and `dsr-ltv` to `TOOL_LABELS` with `DSR/LTV 계산기` / `DSR/LTV Calculator`. |
| `pages/posts/[category]/[slug].js` | Standardized `dsrLtv` label and added `dsr-ltv` alias with the same KO/EN label. |
| `_components/ToolBacklinkKit.js` | Standardized visible name, share title, and anchor label from `DSR LTV` to `DSR/LTV`. |

No new tool id was created. Existing canonical ToolBacklinkKit id remains `dsrLtv`; existing `dsr-ltv` content remains supported as an alias/display mapping.

## Verification

| Check | Result |
| --- | --- |
| `rg -n "tool:.*dsrLtv" content\posts` | Found 3 current KO post usages. |
| `rg -n "tool:.*dsr-ltv" content\posts` | Found 10 existing KO/EN post usages. |
| `rg -n "dsrLtv\|dsr-ltv\|DSR/LTV\|DSR LTV" pages\category\[slug].js pages\posts\[category]\[slug].js _components\ToolBacklinkKit.js` | Confirmed both ids now have explicit page labels; no remaining `DSR LTV` display copy in the touched mapping files. |
| `node --check pages\category\[slug].js` | PASS |
| `node --check pages\posts\[category]\[slug].js` | PASS |
| `node --check _components\ToolBacklinkKit.js` | PASS |
| `npm.cmd run build` | PASS. Next build completed and generated 209/209 static pages. |
| Local generated HTML spot check | PASS. Sampled category/detail HTML did not expose raw `dsrLtv` or `dsr-ltv`; EN `DSR/LTV Calculator` label was visible where matching pages were in the static output. KO `dsrLtv` posts were not all visible in sampled pre-rendered card ranges, but the code path now always routes through `getToolLabel`. |
| Generated sitemap files after build | Build regenerated sitemap files; they were restored afterward because this task does not modify sitemap output. |
| `git diff --check` | PASS. Only existing LF/CRLF warnings were reported; no whitespace errors. |

## Gitignore Note

`reports/dsr-ltv-tool-label-mapping-audit.md` is ignored by `.gitignore` via `/reports/*`.

If this report needs to be committed, it will require either a one-time force add for this file or a separate `.gitignore` exception. This audit did not modify `.gitignore`.

## Remaining Notes

- No content files were modified for this task.
- No SEO policy files were modified.
- Existing unrelated working-tree changes remain untouched.
