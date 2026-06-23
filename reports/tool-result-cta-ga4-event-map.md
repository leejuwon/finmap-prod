# Finmap ToolResultCta GA4 Event Map

Date: 2026-06-23

## Summary

ToolResultCta stabilization 이후 계산기 결과 CTA, sticky CTA, 무료자료 다운로드 MVP에서 발생하는 GA4 이벤트를 점검했다.

- Required CTA events: PASS
- Required parameter names: PASS
- DSR/LTV common `tool_calculate`: PASS, sent once per page session from the first debounced live calculator interaction
- DSR/LTV specific `dsr_ltv_calculate`: KEPT for detailed analysis
- Raw email value in GA4/localStorage/CustomEvent payload: NOT FOUND
- Calculator logic / SeoHead / canonical / hreflang / robots / sitemap policy changes: NONE

Verification helper:

- `scripts/verify_tool_result_cta_events.js`

## Event Inventory

| Event | Source | When it fires | Main parameters |
| --- | --- | --- | --- |
| `tool_calculate` | `pages/tools/*`, `_components/DsrLtvCalculator.js` | User submits a calculator, or the first DSR/LTV live calculation interaction produces a result | `source_tool`, `locale`, `currency`, `has_result`, `location` |
| `tool_result_cta_view` | `_components/ToolResultCta.js` | Result CTA section first renders after result | `source_tool`, `locale`, `location`, `checklist_url`, `related_tool` |
| `tool_result_cta_click` | `_components/ToolResultCta.js` | Any main result CTA is clicked | `source_tool`, `locale`, `location`, `action`, optional `target_tool`, `target_url`, `lead_magnet_id` |
| `tool_result_action` | `_components/CTABar.js`, `_components/CompoundCTA.js` | Sticky/legacy CTA action click | `source_tool`, `locale`, `location`, `action` |
| `tool_nav_click` | `_components/CTABar.js` | PRO sticky nav section click | `source_tool`, `locale`, `location`, `section` |
| `checklist_cta_click` | `_components/ToolResultCta.js` | Related checklist link click | `source_tool`, `locale`, `location`, `target_url` |
| `lead_magnet_cta_click` | `_components/ToolResultCta.js` | Free checklist/PDF panel is opened | `source_tool`, `locale`, `location`, `lead_magnet_id` |
| `lead_magnet_select` | `_components/ToolResultCta.js` | A lead magnet file option is selected | `source_tool`, `locale`, `location`, `lead_magnet_id` |
| `lead_magnet_download_click` | `_components/ToolResultCta.js` | Lead magnet download is requested | `source_tool`, `locale`, `location`, `lead_magnet_id`, `email_provided`, `storage_mode` |
| `lead_magnet_download_success` | `_components/ToolResultCta.js` | Lead magnet PDF generation succeeds | `source_tool`, `locale`, `location`, `lead_magnet_id`, `email_provided`, `storage_mode` |
| `lead_magnet_download_error` | `_components/ToolResultCta.js` | Lead magnet PDF generation fails | `source_tool`, `locale`, `location`, `lead_magnet_id`, `email_provided`, `storage_mode`, `error_reason` |
| `result_pdf_download_success` | `_components/ToolResultCta.js` | Result PDF generation succeeds | `source_tool`, `locale`, `location` |
| `result_pdf_download_error` | `_components/ToolResultCta.js` | Result PDF target is missing or generation fails | `source_tool`, `locale`, `location`, `error_reason` |

Related but outside this required CTA event list:

- `_components/DsrLtvCalculator.js` sends the common `tool_calculate` event once per page session with `source_tool: "dsrLtv"`, `currency: "KRW"`, `has_result: true`, `location: "live_calculator"`.
- `_components/DsrLtvCalculator.js` also keeps `dsr_ltv_calculate` with `source_tool: "dsr_ltv"`, `locale`, `interaction`, `has_result` as a DSR/LTV-specific detailed analysis event for `input_change` and `preset`.
- `ResultAdSlot` sends `result_ad_view`.

## Required Event Presence Check

`node scripts\verify_tool_result_cta_events.js`

| Event | Result | Found in |
| --- | --- | --- |
| `tool_calculate` | PASS | `_components/DsrLtvCalculator.js`, `pages/tools/cagr-calculator.js`, `pages/tools/compound-interest.js`, `pages/tools/dca-calculator.js`, `pages/tools/fire-calculator.js`, `pages/tools/goal-simulator.js` |
| `tool_result_cta_view` | PASS | `_components/ToolResultCta.js` |
| `tool_result_cta_click` | PASS | `_components/ToolResultCta.js` |
| `tool_result_action` | PASS | `_components/CompoundCTA.js`, `_components/CTABar.js` |
| `tool_nav_click` | PASS | `_components/CTABar.js` |
| `checklist_cta_click` | PASS | `_components/ToolResultCta.js` |
| `lead_magnet_cta_click` | PASS | `_components/ToolResultCta.js` |
| `lead_magnet_select` | PASS | `_components/ToolResultCta.js` |
| `lead_magnet_download_click` | PASS | `_components/ToolResultCta.js` |
| `lead_magnet_download_success` | PASS | `_components/ToolResultCta.js` |
| `lead_magnet_download_error` | PASS | `_components/ToolResultCta.js` |
| `result_pdf_download_success` | PASS | `_components/ToolResultCta.js` |
| `result_pdf_download_error` | PASS | `_components/ToolResultCta.js` |

## Parameter Map

| Parameter | Used by | Notes |
| --- | --- | --- |
| `source_tool` | All main calculator CTA events | Values include `compound`, `cagr`, `dca`, `fire`, `goal`, `dsrLtv` depending on caller/config. |
| `locale` | All main calculator CTA events | `ko` or `en`. |
| `location` | CTA events | Usually `result_cta`, `sticky_cta`, `form_submit`, or DSR/LTV `live_calculator`. |
| `action` | `tool_result_cta_click`, `tool_result_action` | Examples: `save_pdf`, `copy_result_url`, `open_checklist`, `open_related_tool`, `open_lead_magnet`, `download_lead_magnet`, `share`. |
| `lead_magnet_id` | Lead magnet CTA/download events | Example IDs: `homeBudget`, `salaryBudget`, `dcaPlan`, `retirementChecklist`. |
| `email_provided` | Lead magnet download events | Boolean only. Raw email value is not sent. |
| `storage_mode` | Lead magnet download events | `mock_no_email` by default, `mock_lead_capture` only if `enableLeadCapture=true`. |
| `target_tool` | `tool_result_cta_click` for related tool | Identifies the related calculator destination. |
| `target_url` | Checklist/related tool clicks | URL target for CTA click analysis. |
| `error_reason` | Download error events | Examples: `missing_target`, `download_failed`. |

## Privacy / Email Check

Current `ToolResultCta` has an email state only for the future `enableLeadCapture=true` path:

- `leadEmail` is used for input state and validation only.
- GA4 events do not include raw email.
- `localStorage` payload does not include raw email.
- `CustomEvent("finmap_lead_magnet_download")` detail payload does not include raw email.

Stored/browser-local MVP payload fields:

- `sourceTool`
- `locale`
- `location`
- `leadMagnetId`
- `emailProvided`
- `storageMode`
- `submittedAt`

## GA4 Funnel Guide

Recommended funnel exploration:

1. `tool_calculate`
2. `tool_result_cta_view`
3. `lead_magnet_cta_click`
4. `lead_magnet_select`
5. `lead_magnet_download_click`
6. `lead_magnet_download_success`

DSR/LTV is included in the same common funnel through `tool_calculate` with `source_tool = dsrLtv`. Because the DSR/LTV UI is a live calculator rather than a submit-form flow, this common event is sent only once per page session from the first debounced user interaction and uses `location = live_calculator`. Keep `dsr_ltv_calculate` separately for DSR/LTV-specific repeated interaction analysis such as `input_change` and `preset`.

## Source Tool Naming

| Context | `source_tool` | Reason |
| --- | --- | --- |
| Common calculator funnel and CTA events | `dsrLtv` | Matches the shared tool ID used by `ToolResultCta`, related tool mapping, and cross-calculator GA4 funnel dimensions. |
| Legacy DSR/LTV detailed event | `dsr_ltv` | Kept for continuity with the existing `dsr_ltv_calculate` event history. When comparing reports, do not merge this value blindly with common-funnel `dsrLtv`; use it as the legacy detailed interaction stream. |

Recommended dimensions:

- `source_tool`
- `locale`
- `lead_magnet_id`
- `storage_mode`
- `location`

Recommended supporting segments:

- KO vs EN: `locale`
- Calculator type: `source_tool`
- No-email MVP downloads: `storage_mode = mock_no_email`
- Lead capture experiment later: `storage_mode = mock_lead_capture`

Recommended error monitoring:

- Event: `lead_magnet_download_error`
- Dimension: `error_reason`
- Event: `result_pdf_download_error`
- Dimension: `error_reason`

Recommended conversion candidates:

- `lead_magnet_download_success`
- `result_pdf_download_success`
- `checklist_cta_click`

## Verification Results

| Command | Result |
| --- | --- |
| `node --check scripts\verify_tool_result_cta_events.js` | PASS |
| `node scripts\verify_tool_result_cta_events.js` | PASS. All required events and parameters found; DSR/LTV common `tool_calculate` found with `location=live_calculator`; one-shot ref guard found; existing `dsr_ltv_calculate` kept; raw email not found in GA4/localStorage/CustomEvent payloads. |
| `npm.cmd run build` | PASS. Next.js build completed and postbuild regenerated channel sitemaps. Generated sitemap artifacts were restored after verification. |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS. `sitemap-0.xml` 204 URLs, `sitemap-ko.xml` 106 URLs, `sitemap-en.xml` 98 URLs, `/en/sitemap.xml` 98 URLs, forbidden loc patterns PASS. |

## Notes

- This pass added an event verification script and documentation only.
- No actual email collection API was added.
- `enableLeadCapture=false` remains the production-safe default path.
