# Finmap Tool Result CTA Audit

Date: 2026-06-23

## Summary

- Added a shared result CTA component: `_components/ToolResultCta.js`
- Applied it to six calculator result screens:
  - `/tools/compound-interest`
  - `/tools/goal-simulator` (`goal-calculator` request mapped to the existing route)
  - `/tools/fire-calculator`
  - `/tools/cagr-calculator`
  - `/tools/dca-calculator`
  - `/tools/dsr-ltv-calculator`
- Scope stayed limited to post-result UI and GA4 events.
- No calculation logic, canonical, hreflang, sitemap, robots, or SEO policy changes were made.

## CTA Behavior

The shared CTA shows after a calculator result is available.

| Calculator | Result gate | CTA placement |
| --- | --- | --- |
| Compound interest | `hasResult` | After existing PDF/share CTA and before related tool cards |
| Goal simulator | `hasResult` | After existing PDF/share CTA and before related tool cards |
| FIRE calculator | `result` | After existing PDF/share CTA and before related tool cards |
| CAGR calculator | `hasResult` | After existing PDF/share CTA and before related tool cards |
| DCA calculator | `hasResult` | After existing PDF/share CTA and before related tool cards |
| DSR/LTV calculator | Result summary is rendered from default/current inputs | After result summary ad and before sensitivity table |

The component provides:

- Result PDF save
- Result URL copy
- Related checklist link
- Related calculator link

## GA4 Events

Implemented in `_components/ToolResultCta.js`.

| Event | Trigger | Main params |
| --- | --- | --- |
| `tool_result_cta_view` | CTA component renders once | `source_tool`, `locale`, `location`, `checklist_url`, `related_tool` |
| `tool_result_cta_click` | Any CTA button/link click | `source_tool`, `action`, `locale`, `location`, optional target params |
| `checklist_cta_click` | Checklist link click | `source_tool`, `locale`, `location`, `target_url` |

## Related Links

| Source tool | Checklist | Related calculator |
| --- | --- | --- |
| `compound` | `/posts/personalFinance/simple-vs-compound` | `/tools/goal-simulator` |
| `goal` | `/posts/personalFinance/monthly-dca-10-year-result` | `/tools/dca-calculator` |
| `fire` | `/posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal` | `/tools/goal-simulator` |
| `cagr` | `/posts/investingInfo/cagr-7percent-reality-check` | `/tools/compound-interest` |
| `dca` | `/posts/personalFinance/dca-vs-lumpsum-decision-rules` | `/tools/goal-simulator` |
| `dsrLtv` | `/posts/personalFinance/mortgage-risk-checklist-dsr-variable` | `/tools/goal-simulator` |

`next/link` locale handling is used, so English pages route through the existing `/en` locale behavior without changing canonical or sitemap logic.

## Mobile / Ad Placement

- The CTA is normal in-flow content, not sticky.
- Existing `ResultAdSlot` positions were left unchanged.
- For calculators with existing result ads, the CTA is placed after result tables/share controls and before related tool cards, leaving normal grid/card spacing.
- DSR/LTV places the CTA after the first result ad and before the sensitivity table.

## Files Changed

- `_components/ToolResultCta.js`
- `_components/DsrLtvCalculator.js`
- `pages/tools/compound-interest.js`
- `pages/tools/goal-simulator.js`
- `pages/tools/fire-calculator.js`
- `pages/tools/cagr-calculator.js`
- `pages/tools/dca-calculator.js`

## Verification

| Command | Result |
| --- | --- |
| `node --check _components\ToolResultCta.js` | PASS |
| `npm.cmd run build` | PASS |
| `rg -n "ToolResultCta" pages/tools _components/DsrLtvCalculator.js _components/ToolResultCta.js` | PASS: all six calculators wired |
| `rg -n "tool_result_cta_view\|tool_result_cta_click\|checklist_cta_click" _components pages utils` | PASS: events present in shared component |

## Notes

- `npm.cmd run build` regenerated sitemap artifacts through `postbuild`; those generated `public/sitemap*.xml` changes were restored because sitemap output is outside this task scope.
- Existing `ToolCta`, `CompoundCTA`, and sticky `CTABar` behavior was not removed.
- Existing calculator formulas and result objects were not changed.
